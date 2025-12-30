import {
  Connection,
  PublicKey,
  Keypair,
  LAMPORTS_PER_SOL,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
  ConfirmedSignatureInfo,
} from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, AccountLayout } from '@solana/spl-token';
import bs58 from 'bs58';

// Support multiple RPC URLs (comma-separated) for better airdrop reliability
// QuickNode recommended for better performance and airdrop success rate
const RPC_URLS_RAW = (process.env.SOLANA_RPC_URLS || process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com')
  .split(',')
  .map((url) => url.trim())
  .filter(Boolean);

// Use configured RPC URLs (QuickNode or custom)
const RPC_URLS = RPC_URLS_RAW;

let rpcIndex = 0;
const connections = new Map<string, Connection>();

// Treasury (optional) - base58 encoded secret key
const treasurySecret = process.env.TREASURY_SECRET_KEY?.trim();
let cachedTreasury: Keypair | null = null;

const getTreasuryKeypair = (): Keypair => {
  if (cachedTreasury) return cachedTreasury;
  if (!treasurySecret) {
    throw new Error('TREASURY_SECRET_KEY not configured');
  }

  try {
    const secretKey = bs58.decode(treasurySecret);
    cachedTreasury = Keypair.fromSecretKey(secretKey);
    return cachedTreasury;
  } catch (err) {
    throw new Error('Invalid TREASURY_SECRET_KEY');
  }
};

// Lightweight airdrop queue to smooth bursts and avoid RPC rate limits
const AIRDROP_DELAY_MS = 1000; // base delay between airdrops
let airdropQueue: Promise<void> = Promise.resolve();

const queueAirdrop = async <T>(fn: () => Promise<T>): Promise<T> => {
  const run = async () => {
    const result = await fn();
    // Delay with small jitter to reduce burstiness
    const jitter = Math.floor(Math.random() * 500);
    await new Promise((resolve) => setTimeout(resolve, AIRDROP_DELAY_MS + jitter));
    return result;
  };

  const queued = airdropQueue.then(run, run);
  // Update queue regardless of success/failure so it doesn’t stall
  airdropQueue = queued.then(() => undefined, () => undefined);
  return queued;
};

export const getRpcEndpoint = () => {
  const endpoint = RPC_URLS[rpcIndex % RPC_URLS.length];
  rpcIndex += 1;
  return endpoint;
};

export const getConnection = (endpoint?: string): Connection => {
  const url = endpoint || getRpcEndpoint();
  if (connections.has(url)) {
    return connections.get(url)!;
  }

  const conn = new Connection(url, {
    commitment: 'confirmed',
    confirmTransactionInitialTimeout: 60000,
  });
  connections.set(url, conn);
  return conn;
};

// Get cluster info to verify connection
export const getClusterInfo = async () => {
  const conn = getConnection();
  const version = await conn.getVersion();
  const slot = await conn.getSlot();
  const blockHeight = await conn.getBlockHeight();
  // Derive the RPC URL from the connection; fallback to first configured
  const rpcUrl = (conn as any)?._rpcEndpoint || RPC_URLS[0];
  
  return {
    rpcUrl,
    version: version['solana-core'],
    slot,
    blockHeight,
    cluster: 'devnet',
  };
};

// Get balance for a public key
export const getBalance = async (publicKeyStr: string): Promise<number> => {
  const conn = getConnection();
  const publicKey = new PublicKey(publicKeyStr);
  const balance = await conn.getBalance(publicKey);
  return balance / LAMPORTS_PER_SOL;
};

// Treasury balance helper
export const getTreasuryBalance = async () => {
  const treasury = getTreasuryKeypair();
  const balance = await getBalance(treasury.publicKey.toBase58());
  return {
    balance,
    publicKey: treasury.publicKey.toBase58(),
  };
};

// Request airdrop with retry logic
export const requestAirdrop = async (
  publicKeyStr: string,
  amount: number = 1
): Promise<{ signature: string; amount: number }> => {
  const publicKey = new PublicKey(publicKeyStr);
  const cappedAmount = Math.min(amount, 5);

  const maxRetries = 4;
  let lastError: any;

  const runOnce = async () => {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const endpoint = getRpcEndpoint();
      const conn = getConnection(endpoint);

      try {
        const signature = await conn.requestAirdrop(
          publicKey,
          cappedAmount * LAMPORTS_PER_SOL
        );
        
        const latestBlockhash = await conn.getLatestBlockhash('confirmed');
        await conn.confirmTransaction({
          signature,
          blockhash: latestBlockhash.blockhash,
          lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        }, 'finalized');
        
        return { signature, amount: cappedAmount };
      } catch (error: any) {
        lastError = error;
        const isRateLimited = error.message?.includes('429') || error.message?.toLowerCase().includes('rate limit');
        // Rotate endpoint and back off before retrying
        await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
        if (!isRateLimited && attempt === maxRetries - 1) {
          throw error;
        }
      }
    }

    if (lastError?.message?.includes('429')) {
      throw new Error('RATE_LIMITED');
    }
    throw lastError || new Error('Airdrop failed after retries');
  };

  // Serialize airdrops to smooth bursts
  return queueAirdrop(runOnce);
};

// Send SOL transaction
export const sendTransaction = async (
  fromSecretKey: string,
  toPublicKeyStr: string,
  amount: number
): Promise<{ signature: string; fee: number }> => {
  const conn = getConnection();
  
  // Decode keypair from base58 secret key
  const secretKey = bs58.decode(fromSecretKey);
  const fromKeypair = Keypair.fromSecretKey(secretKey);
  const toPublicKey = new PublicKey(toPublicKeyStr);
  
  // Create transaction
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: fromKeypair.publicKey,
      toPubkey: toPublicKey,
      lamports: Math.floor(amount * LAMPORTS_PER_SOL),
    })
  );
  
  // Get recent blockhash
  const { blockhash, lastValidBlockHeight } = await conn.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = fromKeypair.publicKey;
  
  // Send and confirm
  const signature = await sendAndConfirmTransaction(conn, transaction, [fromKeypair]);
  
  // Get transaction fee
  const txDetails = await conn.getTransaction(signature, {
    maxSupportedTransactionVersion: 0,
  });
  const fee = (txDetails?.meta?.fee || 5000) / LAMPORTS_PER_SOL;
  
  return { signature, fee };
};

// Send SOL from configured treasury keypair
export const sendFromTreasury = async (
  toPublicKeyStr: string,
  amount: number
): Promise<{ signature: string; fee: number; from: string }> => {
  const treasury = getTreasuryKeypair();
  const conn = getConnection();

  const toPublicKey = new PublicKey(toPublicKeyStr);
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: treasury.publicKey,
      toPubkey: toPublicKey,
      lamports: Math.floor(amount * LAMPORTS_PER_SOL),
    })
  );

  const { blockhash, lastValidBlockHeight } = await conn.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.lastValidBlockHeight = lastValidBlockHeight;
  transaction.feePayer = treasury.publicKey;

  const signature = await sendAndConfirmTransaction(conn, transaction, [treasury]);
  const txDetails = await conn.getTransaction(signature, {
    maxSupportedTransactionVersion: 0,
  });
  const fee = (txDetails?.meta?.fee || 5000) / LAMPORTS_PER_SOL;

  return { signature, fee, from: treasury.publicKey.toBase58() };
};

// Get transaction history
export const getTransactionHistory = async (
  publicKeyStr: string,
  limit: number = 20
): Promise<ConfirmedSignatureInfo[]> => {
  const conn = getConnection();
  const publicKey = new PublicKey(publicKeyStr);
  
  const signatures = await conn.getSignaturesForAddress(publicKey, { limit });
  return signatures;
};

// Get transaction details
export const getTransactionDetails = async (signature: string) => {
  const conn = getConnection();
  const tx = await conn.getTransaction(signature, {
    maxSupportedTransactionVersion: 0,
  });
  return tx;
};

// Validate Solana address
export const isValidAddress = (address: string): boolean => {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
};

// Generate new keypair
export const generateKeypair = (): { publicKey: string; secretKey: string } => {
  const keypair = Keypair.generate();
  return {
    publicKey: keypair.publicKey.toBase58(),
    secretKey: bs58.encode(keypair.secretKey),
  };
};

// Get detailed transaction info with parsed data
export const getTransactionInfo = async (signature: string) => {
  const conn = getConnection();
  const tx = await conn.getParsedTransaction(signature, {
    maxSupportedTransactionVersion: 0,
  });
  
  if (!tx) return null;
  
  const meta = tx.meta;
  const message = tx.transaction.message;
  
  // Parse transfer info from instructions
  let transferInfo = null;
  for (const instruction of message.instructions) {
    if ('parsed' in instruction && instruction.program === 'system') {
      const parsed = instruction.parsed;
      if (parsed.type === 'transfer') {
        transferInfo = {
          from: parsed.info.source,
          to: parsed.info.destination,
          amount: parsed.info.lamports / LAMPORTS_PER_SOL,
        };
        break;
      }
    }
  }
  
  return {
    signature,
    slot: tx.slot,
    blockTime: tx.blockTime,
    fee: meta?.fee ? meta.fee / LAMPORTS_PER_SOL : 0,
    status: meta?.err ? 'failed' : 'success',
    error: meta?.err,
    transfer: transferInfo,
    preBalances: meta?.preBalances?.map(b => b / LAMPORTS_PER_SOL),
    postBalances: meta?.postBalances?.map(b => b / LAMPORTS_PER_SOL),
  };
};

// Get account info
export const getAccountInfo = async (publicKeyStr: string) => {
  const conn = getConnection();
  const publicKey = new PublicKey(publicKeyStr);
  const info = await conn.getAccountInfo(publicKey);
  
  if (!info) {
    return {
      exists: false,
      balance: 0,
    };
  }
  
  return {
    exists: true,
    balance: info.lamports / LAMPORTS_PER_SOL,
    owner: info.owner.toBase58(),
    executable: info.executable,
    rentEpoch: info.rentEpoch,
    dataSize: info.data.length,
  };
};

// Get recent blockhash (useful for client)
export const getRecentBlockhash = async () => {
  const conn = getConnection();
  const { blockhash, lastValidBlockHeight } = await conn.getLatestBlockhash();
  return { blockhash, lastValidBlockHeight };
};

// Get minimum balance for rent exemption
export const getMinBalanceForRentExemption = async (dataSize: number = 0) => {
  const conn = getConnection();
  const minBalance = await conn.getMinimumBalanceForRentExemption(dataSize);
  return minBalance / LAMPORTS_PER_SOL;
};

// Get recent performance samples
export const getPerformanceSamples = async (limit: number = 10) => {
  const conn = getConnection();
  const samples = await conn.getRecentPerformanceSamples(limit);
  return samples.map(s => ({
    slot: s.slot,
    numTransactions: s.numTransactions,
    numSlots: s.numSlots,
    samplePeriodSecs: s.samplePeriodSecs,
    tps: Math.round(s.numTransactions / s.samplePeriodSecs),
  }));
};

// Token-related functions

// Well-known devnet tokens for display
const KNOWN_TOKENS: Record<string, { name: string; symbol: string; decimals: number }> = {
  'So11111111111111111111111111111111111111112': { name: 'Wrapped SOL', symbol: 'wSOL', decimals: 9 },
  '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU': { name: 'USDC (Devnet)', symbol: 'USDC', decimals: 6 },
};

// Get SPL token accounts for a wallet
export const getTokenAccounts = async (publicKeyStr: string) => {
  const conn = getConnection();
  const publicKey = new PublicKey(publicKeyStr);
  
  try {
    const tokenAccounts = await conn.getTokenAccountsByOwner(publicKey, {
      programId: TOKEN_PROGRAM_ID,
    });
    
    const tokens = tokenAccounts.value.map((ta) => {
      const accountData = AccountLayout.decode(ta.account.data);
      const mint = new PublicKey(accountData.mint).toBase58();
      const amount = Number(accountData.amount);
      const knownToken = KNOWN_TOKENS[mint];
      
      return {
        address: ta.pubkey.toBase58(),
        mint,
        amount: amount,
        decimals: knownToken?.decimals || 9,
        uiAmount: amount / Math.pow(10, knownToken?.decimals || 9),
        name: knownToken?.name || 'Unknown Token',
        symbol: knownToken?.symbol || mint.slice(0, 4) + '...',
      };
    });
    
    return tokens.filter(t => t.amount > 0);
  } catch (error) {
    console.error('Error fetching token accounts:', error);
    return [];
  }
};

// Get token balance for a specific mint
export const getTokenBalance = async (publicKeyStr: string, mintAddress: string) => {
  const conn = getConnection();
  const publicKey = new PublicKey(publicKeyStr);
  const mint = new PublicKey(mintAddress);
  
  try {
    const tokenAccounts = await conn.getTokenAccountsByOwner(publicKey, {
      mint,
    });
    
    if (tokenAccounts.value.length === 0) {
      return { balance: 0, decimals: 9 };
    }
    
    const accountData = AccountLayout.decode(tokenAccounts.value[0].account.data);
    const amount = Number(accountData.amount);
    const knownToken = KNOWN_TOKENS[mintAddress];
    const decimals = knownToken?.decimals || 9;
    
    return {
      balance: amount / Math.pow(10, decimals),
      rawBalance: amount,
      decimals,
      tokenAccount: tokenAccounts.value[0].pubkey.toBase58(),
    };
  } catch (error) {
    console.error('Error fetching token balance:', error);
    return { balance: 0, decimals: 9 };
  }
};
