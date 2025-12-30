import 'dotenv/config';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import bs58 from 'bs58';

const RPC = (process.env.SOLANA_RPC_URLS || process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com')
  .split(',')
  .map((u) => u.trim())
  .filter(Boolean);

const chooseRpc = (() => {
  let i = 0;
  return () => RPC[i++ % RPC.length];
})();

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const getTreasuryPubkey = (): PublicKey => {
  if (process.env.TREASURY_PUBLIC_KEY) {
    return new PublicKey(process.env.TREASURY_PUBLIC_KEY);
  }
  const secret = process.env.TREASURY_SECRET_KEY;
  if (!secret) throw new Error('TREASURY_PUBLIC_KEY or TREASURY_SECRET_KEY required');
  const kp = bs58.decode(secret.trim());
  return PublicKey.fromSecretKey(kp);
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

main().catch((err) => {
  console.error(err);
  process.exit(1);
});