import {
  Connection,
  PublicKey,
  Keypair,
  LAMPORTS_PER_SOL,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import bs58 from 'bs58';

// Support multiple RPC endpoints for better airdrop reliability
const RPC_ENDPOINTS = (import.meta.env.VITE_SOLANA_RPC_URLS as string | undefined)?.
  split(',')
  .map((url) => url.trim())
  .filter(Boolean) || ['https://api.devnet.solana.com'];

let rpcIndex = 0;

export const getRpcEndpoint = () => {
  const endpoint = RPC_ENDPOINTS[rpcIndex % RPC_ENDPOINTS.length];
  rpcIndex += 1;
  return endpoint;
};

// Create a connection to Solana devnet (rotates endpoints)
export const getConnection = (endpoint?: string): Connection => {
  const url = endpoint || getRpcEndpoint();
  return new Connection(url, 'confirmed');
};

// Generate a new keypair (wallet)
export const generateWallet = (): Keypair => {
  return Keypair.generate();
};

// Import wallet from private key (base58 encoded)
export const importWallet = (privateKey: string): Keypair => {
  const secretKey = bs58.decode(privateKey);
  return Keypair.fromSecretKey(secretKey);
};

// Export private key as base58 string
export const exportPrivateKey = (keypair: Keypair): string => {
  return bs58.encode(keypair.secretKey);
};

// Get wallet balance in SOL
export const getBalance = async (publicKey: PublicKey): Promise<number> => {
  const connection = getConnection();
  const balance = await connection.getBalance(publicKey);
  return balance / LAMPORTS_PER_SOL;
};

// Request airdrop (devnet faucet)
export const requestAirdrop = async (
  publicKey: PublicKey,
  amount: number = 1
): Promise<string> => {
  const maxRetries = 3;
  let lastError: unknown;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const connection = getConnection();
    try {
      const signature = await connection.requestAirdrop(
        publicKey,
        amount * LAMPORTS_PER_SOL
      );

      const latestBlockhash = await connection.getLatestBlockhash('confirmed');

      await connection.confirmTransaction(
        {
          signature,
          blockhash: latestBlockhash.blockhash,
          lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        },
        'finalized'
      );

      return signature;
    } catch (err) {
      lastError = err;
      await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error('Airdrop failed after retries');
};

// Send SOL to another address
export const sendSol = async (
  fromKeypair: Keypair,
  toPublicKey: PublicKey,
  amount: number
): Promise<string> => {
  const connection = getConnection();
  
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: fromKeypair.publicKey,
      toPubkey: toPublicKey,
      lamports: amount * LAMPORTS_PER_SOL,
    })
  );

  const signature = await sendAndConfirmTransaction(connection, transaction, [
    fromKeypair,
  ]);
  
  return signature;
};

// Get recent transactions for a wallet
export const getTransactions = async (
  publicKey: PublicKey,
  limit: number = 10
) => {
  const connection = getConnection();
  const signatures = await connection.getSignaturesForAddress(publicKey, {
    limit,
  });
  return signatures;
};

// Validate a Solana address
export const isValidAddress = (address: string): boolean => {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
};

// Shorten address for display
export const shortenAddress = (address: string, chars: number = 4): string => {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
};
