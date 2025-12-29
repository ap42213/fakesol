import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import routes from './routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';

// Middleware
app.use(cors({
  origin: isProduction 
    ? process.env.FRONTEND_URL || true  // Allow all in production or specific URL
    : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json());

// Global rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: { error: 'Too many requests', message: 'Please slow down' },
});
app.use(limiter);

// API Routes
app.use('/api', routes);

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    name: 'FakeSOL API',
    version: '0.3.0',
    description: 'Backend API for FakeSOL devnet wallet',
    network: 'Solana Devnet',
    endpoints: {
      // Health & Info
      health: 'GET /api/health',
      performance: 'GET /api/performance',
      blockhash: 'GET /api/blockhash',
      rentExemption: 'GET /api/rent-exemption',
      // Wallet Operations
      generateWallet: 'POST /api/wallet/generate',
      validateAddress: 'GET /api/wallet/validate/:address',
      getBalance: 'GET /api/wallet/:address/balance',
      requestAirdrop: 'POST /api/wallet/:address/airdrop',
      getTransactions: 'GET /api/wallet/:address/transactions',
      // Token Operations
      getTokens: 'GET /api/wallet/:address/tokens',
      getTokenBalance: 'GET /api/wallet/:address/token/:mint',
      // Account Info
      getAccountInfo: 'GET /api/account/:address',
      // Transactions
      getTransaction: 'GET /api/transaction/:signature',
      getTransactionInfo: 'GET /api/transaction/:signature/info',
      sendTransaction: 'POST /api/transaction/send',
    },
  });
});

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Serve static frontend in production
if (isProduction) {
  const publicPath = path.join(__dirname, '..', 'public');
  app.use(express.static(publicPath));
  
  // SPA fallback - serve index.html for all non-API routes
  app.get('*', (_req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🪙 FakeSOL ${isProduction ? 'Production' : 'Development'} Server                    ║
║                                                       ║
║   Network:  Solana Devnet                             ║
║   Port:     ${PORT}                                        ║
║   Mode:     ${isProduction ? 'Production' : 'Development'}                            ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);
});

export default app;
