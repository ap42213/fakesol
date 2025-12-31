
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

const RPC_URL = (process.env.SOLANA_RPC_URLS || process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com')
  .split(',')[0].trim();

async function main() {
  console.log('🔍 Auditing User Wallets...');
  
  const conn = new Connection(RPC_URL, 'confirmed');
  
  const wallets = await prisma.wallet.findMany({
    include: {
      user: true
    }
  });
  
  console.log(`   Found ${wallets.length} total wallets in database.`);
  
  let totalSol = 0;
  let walletsWithBalance = 0;
  
  console.log('\n   Checking balances on Devnet...');
  
  for (const wallet of wallets) {
    try {
      const pubkey = new PublicKey(wallet.publicKey);
      const balance = await conn.getBalance(pubkey);
      const balanceSol = balance / LAMPORTS_PER_SOL;
      
      if (balanceSol > 0.001) {
        console.log(`   💰 ${wallet.publicKey.slice(0, 8)}... (${wallet.user.email || 'No Email'}) - ${balanceSol.toFixed(4)} SOL`);
        totalSol += balanceSol;
        walletsWithBalance++;
      }
    } catch (e) {
      console.error(`   ❌ Error checking ${wallet.publicKey}:`, e);
    }
  }
  
  console.log('\n   ----------------------------------------');
  console.log(`   Total Wallets with Balance: ${walletsWithBalance}`);
  console.log(`   Total SOL Available to Reclaim: ${totalSol.toFixed(4)} SOL`);
  console.log('   ----------------------------------------');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
