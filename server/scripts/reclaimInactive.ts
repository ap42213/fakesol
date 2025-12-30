// Reclaim SOL from inactive wallets back to treasury
// Run via cron: npx tsx scripts/reclaimInactive.ts

try { require('dotenv/config'); } catch {}

import { Connection, Keypair, PublicKey, LAMPORTS_PER_SOL, Transaction, SystemProgram, sendAndConfirmTransaction } from '@solana/web3.js';
import bs58 from 'bs58';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const INACTIVE_DAYS = parseInt(process.env.RECLAIM_INACTIVE_DAYS || '7', 10);
const MIN_BALANCE_TO_RECLAIM = parseFloat(process.env.RECLAIM_MIN_BALANCE || '0.1'); // Only reclaim if > 0.1 SOL
const LEAVE_FOR_FEES = 0.01; // Leave 0.01 SOL for potential reactivation

const RPC_URL = (process.env.SOLANA_RPC_URLS || process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com')
  .split(',')[0].trim();

const getTreasuryKeypair = (): Keypair => {
  const secret = process.env.TREASURY_SECRET_KEY?.trim();
  if (!secret) {
    throw new Error('TREASURY_SECRET_KEY not configured');
  }
  return Keypair.fromSecretKey(bs58.decode(secret));
};

// Decrypt private key (matches server encryption)
function decryptPrivateKey(encrypted: string): string {
  if (encrypted.startsWith('enc:')) {
    const base64 = encrypted.slice(4);
    return Buffer.from(base64, 'base64').toString('utf-8');
  }
  return encrypted;
}

async function main() {
  console.log('🔄 Inactive Wallet Reclaim Script Starting...');
  console.log(`   Looking for users inactive for ${INACTIVE_DAYS}+ days`);
  console.log(`   Min balance to reclaim: ${MIN_BALANCE_TO_RECLAIM} SOL`);
  
  const conn = new Connection(RPC_URL, 'confirmed');
  const treasury = getTreasuryKeypair();
  const treasuryPubkey = treasury.publicKey;
  
  console.log(`   Treasury: ${treasuryPubkey.toBase58()}`);
  
  // Find inactive users
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - INACTIVE_DAYS);
  
  const inactiveUsers = await prisma.user.findMany({
    where: {
      lastLoginAt: {
        lt: cutoffDate,
      },
    },
    include: {
      wallets: true,
    },
  });
  
  console.log(`   Found ${inactiveUsers.length} inactive users`);
  
  let totalReclaimed = 0;
  let walletsProcessed = 0;
  
  for (const user of inactiveUsers) {
    for (const wallet of user.wallets) {
      try {
        const pubkey = new PublicKey(wallet.publicKey);
        const balance = await conn.getBalance(pubkey);
        const balanceSol = balance / LAMPORTS_PER_SOL;
        
        if (balanceSol < MIN_BALANCE_TO_RECLAIM) {
          continue;
        }
        
        console.log(`   Wallet ${wallet.publicKey.slice(0, 8)}... has ${balanceSol.toFixed(4)} SOL (inactive since ${user.lastLoginAt?.toISOString()})`);
        
        // Calculate amount to reclaim (leave some for fees)
        const reclaimAmount = balanceSol - LEAVE_FOR_FEES;
        if (reclaimAmount <= 0) continue;
        
        // Decrypt private key and create keypair
        const privateKey = decryptPrivateKey(wallet.privateKey);
        const walletKeypair = Keypair.fromSecretKey(bs58.decode(privateKey));
        
        // Create transfer transaction
        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: walletKeypair.publicKey,
            toPubkey: treasuryPubkey,
            lamports: Math.floor(reclaimAmount * LAMPORTS_PER_SOL),
          })
        );
        
        // Send transaction
        const signature = await sendAndConfirmTransaction(conn, transaction, [walletKeypair]);
        
        totalReclaimed += reclaimAmount;
        walletsProcessed += 1;
        
        console.log(`   ✔ Reclaimed ${reclaimAmount.toFixed(4)} SOL from ${wallet.publicKey.slice(0, 8)}... sig=${signature}`);
        
        // Log analytics
        await prisma.analytics.create({
          data: {
            event: 'sol_reclaimed',
            userId: user.id,
            email: user.email,
            metadata: {
              walletId: wallet.id,
              publicKey: wallet.publicKey,
              amount: reclaimAmount,
              signature,
              inactiveDays: INACTIVE_DAYS,
            },
          },
        });
        
        // Small delay between transactions
        await new Promise(r => setTimeout(r, 1000));
        
      } catch (err: any) {
        console.warn(`   ✖ Failed to process wallet ${wallet.publicKey.slice(0, 8)}...: ${err.message}`);
      }
    }
  }
  
  const treasuryBalance = (await conn.getBalance(treasuryPubkey)) / LAMPORTS_PER_SOL;
  
  console.log(`\n✅ Reclaim complete:`);
  console.log(`   Wallets processed: ${walletsProcessed}`);
  console.log(`   Total reclaimed: ${totalReclaimed.toFixed(4)} SOL`);
  console.log(`   Treasury balance: ${treasuryBalance.toFixed(4)} SOL`);
  
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
