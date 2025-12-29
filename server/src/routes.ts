import { Router, Request, Response } from 'express';
import {
  getBalance,
  requestAirdrop,
  sendTransaction,
  getTransactionHistory,
  getTransactionDetails,
  isValidAddress,
  generateKeypair,
  getClusterInfo,
  getTransactionInfo,
  getAccountInfo,
  getRecentBlockhash,
  getMinBalanceForRentExemption,
  getPerformanceSamples,
  getTokenAccounts,
  getTokenBalance,
} from './solana.js';

const router = Router();

// Rate limiting for airdrops (track by IP)
const airdropCooldowns = new Map<string, number>();
const AIRDROP_COOLDOWN = parseInt(process.env.AIRDROP_COOLDOWN_MS || '60000');

// Health check - simple and fast for Railway healthcheck
router.get('/health', async (_req: Request, res: Response) => {
  try {
    // Quick health check - don't call Solana RPC as it can timeout
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      cluster: 'devnet',
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Health check failed', message: error.message });
  }
});

// Detailed cluster info (separate from health check)
router.get('/cluster', async (_req: Request, res: Response) => {
  try {
    const info = await getClusterInfo();
    res.json({ status: 'ok', ...info });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to connect to Solana', message: error.message });
  }
});

// Generate new wallet
router.post('/wallet/generate', (_req: Request, res: Response) => {
  try {
    const keypair = generateKeypair();
    res.json(keypair);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to generate wallet', message: error.message });
  }
});

// Validate address
router.get('/wallet/validate/:address', (req: Request, res: Response) => {
  const { address } = req.params;
  const valid = isValidAddress(address);
  res.json({ valid, address });
});

// Get balance
router.get('/wallet/:address/balance', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    
    if (!isValidAddress(address)) {
      return res.status(400).json({ error: 'Invalid Solana address' });
    }
    
    const balance = await getBalance(address);
    res.json({ address, balance, unit: 'SOL' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to get balance', message: error.message });
  }
});

// Get SPL token accounts
router.get('/wallet/:address/tokens', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    
    if (!isValidAddress(address)) {
      return res.status(400).json({ error: 'Invalid Solana address' });
    }
    
    const tokens = await getTokenAccounts(address);
    res.json({ 
      address, 
      tokenCount: tokens.length,
      tokens,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to get tokens', message: error.message });
  }
});

// Get specific token balance
router.get('/wallet/:address/token/:mint', async (req: Request, res: Response) => {
  try {
    const { address, mint } = req.params;
    
    if (!isValidAddress(address)) {
      return res.status(400).json({ error: 'Invalid Solana address' });
    }
    
    if (!isValidAddress(mint)) {
      return res.status(400).json({ error: 'Invalid token mint address' });
    }
    
    const tokenBalance = await getTokenBalance(address, mint);
    res.json({ 
      address, 
      mint,
      ...tokenBalance,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to get token balance', message: error.message });
  }
});

// Request airdrop
router.post('/wallet/:address/airdrop', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    const { amount = 1 } = req.body;
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    
    if (!isValidAddress(address)) {
      return res.status(400).json({ error: 'Invalid Solana address' });
    }
    
    // Check rate limit
    const lastAirdrop = airdropCooldowns.get(clientIp);
    if (lastAirdrop && Date.now() - lastAirdrop < AIRDROP_COOLDOWN) {
      const waitTime = Math.ceil((AIRDROP_COOLDOWN - (Date.now() - lastAirdrop)) / 1000);
      return res.status(429).json({ 
        error: 'Rate limited', 
        message: `Please wait ${waitTime} seconds before requesting another airdrop`,
        retryAfter: waitTime,
      });
    }
    
    const result = await requestAirdrop(address, amount);
    
    // Update rate limit
    airdropCooldowns.set(clientIp, Date.now());
    
    res.json({
      success: true,
      signature: result.signature,
      amount: result.amount,
      explorerUrl: `https://explorer.solana.com/tx/${result.signature}?cluster=devnet`,
    });
  } catch (error: any) {
    if (error.message === 'RATE_LIMITED') {
      return res.status(429).json({ 
        error: 'Devnet rate limited', 
        message: 'The Solana devnet faucet is rate limited. Please try again later.',
      });
    }
    res.status(500).json({ error: 'Airdrop failed', message: error.message });
  }
});

// Get transaction history
router.get('/wallet/:address/transactions', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    const limit = parseInt(req.query.limit as string) || 20;
    
    if (!isValidAddress(address)) {
      return res.status(400).json({ error: 'Invalid Solana address' });
    }
    
    const transactions = await getTransactionHistory(address, Math.min(limit, 100));
    res.json({ 
      address, 
      count: transactions.length,
      transactions: transactions.map(tx => ({
        signature: tx.signature,
        slot: tx.slot,
        blockTime: tx.blockTime,
        status: tx.err ? 'failed' : 'success',
        error: tx.err,
        explorerUrl: `https://explorer.solana.com/tx/${tx.signature}?cluster=devnet`,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to get transactions', message: error.message });
  }
});

// Get transaction details
router.get('/transaction/:signature', async (req: Request, res: Response) => {
  try {
    const { signature } = req.params;
    const tx = await getTransactionDetails(signature);
    
    if (!tx) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    res.json({
      signature,
      slot: tx.slot,
      blockTime: tx.blockTime,
      fee: tx.meta?.fee,
      status: tx.meta?.err ? 'failed' : 'success',
      explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to get transaction', message: error.message });
  }
});

// Send transaction
router.post('/transaction/send', async (req: Request, res: Response) => {
  try {
    const { fromSecretKey, toAddress, amount } = req.body;
    
    if (!fromSecretKey || !toAddress || amount === undefined) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['fromSecretKey', 'toAddress', 'amount'],
      });
    }
    
    if (!isValidAddress(toAddress)) {
      return res.status(400).json({ error: 'Invalid recipient address' });
    }
    
    if (amount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0' });
    }
    
    const result = await sendTransaction(fromSecretKey, toAddress, amount);
    
    res.json({
      success: true,
      signature: result.signature,
      fee: result.fee,
      explorerUrl: `https://explorer.solana.com/tx/${result.signature}?cluster=devnet`,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Transaction failed', message: error.message });
  }
});

// Get detailed transaction info with parsed data
router.get('/transaction/:signature/info', async (req: Request, res: Response) => {
  try {
    const { signature } = req.params;
    const info = await getTransactionInfo(signature);
    
    if (!info) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    res.json({
      ...info,
      explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to get transaction info', message: error.message });
  }
});

// Get account info
router.get('/account/:address', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    
    if (!isValidAddress(address)) {
      return res.status(400).json({ error: 'Invalid Solana address' });
    }
    
    const info = await getAccountInfo(address);
    res.json({ address, ...info });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to get account info', message: error.message });
  }
});

// Get recent blockhash
router.get('/blockhash', async (_req: Request, res: Response) => {
  try {
    const result = await getRecentBlockhash();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to get blockhash', message: error.message });
  }
});

// Get minimum balance for rent exemption
router.get('/rent-exemption', async (req: Request, res: Response) => {
  try {
    const dataSize = parseInt(req.query.dataSize as string) || 0;
    const minBalance = await getMinBalanceForRentExemption(dataSize);
    res.json({ dataSize, minBalance, unit: 'SOL' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to get rent exemption', message: error.message });
  }
});

// Get network performance samples
router.get('/performance', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const samples = await getPerformanceSamples(Math.min(limit, 30));
    
    // Calculate average TPS
    const avgTps = samples.length > 0 
      ? Math.round(samples.reduce((sum, s) => sum + s.tps, 0) / samples.length)
      : 0;
    
    res.json({ 
      samples, 
      averageTps: avgTps,
      count: samples.length,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to get performance data', message: error.message });
  }
});

export default router;
