// Load dotenv only if .env file exists (local dev)
try { require('dotenv/config'); } catch {}

import { Connection, Keypair, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import bs58 from 'bs58';

console.log('🔄 Treasury Refill Script Starting...');
console.log(
  `   Env: NODE_ENV=${process.env.NODE_ENV || '(unset)'} ` +
    `RAILWAY_ENVIRONMENT_NAME=${process.env.RAILWAY_ENVIRONMENT_NAME || '(unset)'} ` +
    `RAILWAY_SERVICE_NAME=${process.env.RAILWAY_SERVICE_NAME || '(unset)'}`,
);

const RPC = (process.env.SOLANA_RPC_URLS || process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com')
  .split(',')
  .map((u) => u.trim())
  .filter(Boolean);

console.log(`   RPC endpoints: ${RPC.join(', ')}`);

const chooseRpc = (() => {
  let i = 0;
  return () => RPC[i++ % RPC.length];
})();

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const getTreasuryPubkey = (): PublicKey => {
  const hasTreasuryPubkey = Boolean(process.env.TREASURY_PUBLIC_KEY?.trim());
  const hasTreasurySecret = Boolean(process.env.TREASURY_SECRET_KEY?.trim());
  console.log(
    `   Env check: TREASURY_PUBLIC_KEY=${hasTreasuryPubkey ? 'set' : 'missing'} ` +
      `TREASURY_SECRET_KEY=${hasTreasurySecret ? 'set' : 'missing'}`,
  );

  if (process.env.TREASURY_PUBLIC_KEY) {
    console.log(`   Using TREASURY_PUBLIC_KEY`);
    return new PublicKey(process.env.TREASURY_PUBLIC_KEY);
  }
  const secret = process.env.TREASURY_SECRET_KEY;
  if (!secret) {
    console.error('❌ TREASURY_PUBLIC_KEY or TREASURY_SECRET_KEY required');
    console.error(
      '   Railway tip: variables are scoped per service + environment. Add TREASURY_SECRET_KEY to the CRON service Variables tab (Production environment), or set it as a Shared Variable.',
    );
    process.exit(1);
  }
  console.log(`   Using TREASURY_SECRET_KEY`);
  const kp = Keypair.fromSecretKey(bs58.decode(secret.trim()));
  return kp.publicKey;
};

async function main() {
  const targetPerRunSol = parseFloat(process.env.REFILL_TARGET_SOL || '5');
  const singleAirdropSol = parseFloat(process.env.REFILL_SINGLE_AIRDROP_SOL || '5');
  const minBalanceSol = parseFloat(process.env.REFILL_MIN_BALANCE_SOL || '0');
  const maxAttempts = parseInt(process.env.REFILL_MAX_ATTEMPTS || '2', 10);
  const pauseMs = parseInt(process.env.REFILL_PAUSE_MS || '4000', 10);

  const treasury = getTreasuryPubkey();
  const conn = new Connection(chooseRpc(), 'confirmed');

  const currentLamports = await conn.getBalance(treasury);
  const currentSol = currentLamports / LAMPORTS_PER_SOL;
  if (currentSol >= minBalanceSol && minBalanceSol > 0) {
    console.log(`Treasury already at ${currentSol.toFixed(3)} SOL (>= ${minBalanceSol}). Skip refill.`);
    return;
  }

  let added = 0;
  let attempts = 0;

  while (added < targetPerRunSol && attempts < maxAttempts) {
    attempts += 1;
    const amount = Math.min(singleAirdropSol, targetPerRunSol - added);
    const endpoint = chooseRpc();
    const c = new Connection(endpoint, 'confirmed');
    console.log(`Attempt ${attempts}: requesting ${amount} SOL from ${endpoint}...`);
    try {
      const sig = await c.requestAirdrop(treasury, amount * LAMPORTS_PER_SOL);
      const { blockhash, lastValidBlockHeight } = await c.getLatestBlockhash('confirmed');
      await c.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight }, 'finalized');
      added += amount;
      console.log(`✔ Airdrop confirmed ${amount} SOL (total this run: ${added} SOL) sig=${sig}`);
    } catch (err: any) {
      const msg = err?.message || String(err);
      console.warn(`✖ Airdrop failed: ${msg}`);
      if (msg.toLowerCase().includes('rate limit') || msg.includes('429')) {
        console.warn('Rate limited, stopping further attempts this run.');
        break;
      }
    }
    await sleep(pauseMs);
  }

  const finalBalance = (await conn.getBalance(treasury)) / LAMPORTS_PER_SOL;
  console.log(`Run complete. Added ~${added} SOL. Treasury balance: ${finalBalance.toFixed(3)} SOL.`);
}

// Global error handler
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

main().catch((err) => {
  console.error('Main error:', err);
  process.exit(1);
});