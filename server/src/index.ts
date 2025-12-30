import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import routes from './routes.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import oauthRoutes from './routes/oauth.js';
import { isDatabaseEnabled } from './lib/prisma.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';

// Trust proxy in production (Railway, Vercel, etc.)
// This ensures rate limiting uses the real client IP, not the proxy IP
if (isProduction) {
  app.set('trust proxy', 1);
}

// Middleware
app.use(cors({
  origin: isProduction 
    ? process.env.FRONTEND_URL || true  // Allow all in production or specific URL
    : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

// Global rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: { error: 'Too many requests', message: 'Please slow down' },
});
app.use(limiter);

// Auth Routes (only if database is enabled)
if (isDatabaseEnabled) {
  app.use('/api/auth', authRoutes);
  app.use('/api/oauth', oauthRoutes);
  app.use('/api/admin', adminRoutes);
} else {
  // Provide fallback routes that return helpful error
  app.use('/api/auth', (_req, res) => {
    res.status(503).json({ 
      error: 'Authentication unavailable', 
      message: 'Database not configured. Set DATABASE_URL environment variable.' 
    });
  });
  app.use('/api/oauth', (_req, res) => {
    res.status(503).json({ 
      error: 'OAuth unavailable', 
      message: 'Database not configured. Set DATABASE_URL environment variable.' 
    });
  });
  app.use('/api/admin', (_req, res) => {
    res.status(503).json({ 
      error: 'Admin API unavailable', 
      message: 'Database not configured. Set DATABASE_URL environment variable.' 
    });
  });
}

// API Routes
app.use('/api', routes);

// Serve static frontend in production
if (isProduction) {
  const publicPath = path.join(__dirname, '..', 'public');

  // Runtime env injection for the SPA (public values only).
  // Avoids relying on build-time Vite env injection on platforms like Railway.
  app.get('/env.js', (_req, res) => {
    const env = {
      VITE_CLERK_PUBLISHABLE_KEY:
        process.env.VITE_CLERK_PUBLISHABLE_KEY || process.env.CLERK_PUBLISHABLE_KEY || '',
      VITE_API_URL: process.env.VITE_API_URL || process.env.API_URL || '',
    };

    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).send(`window.__ENV__ = ${JSON.stringify(env)};`);
  });

  app.use(express.static(publicPath));
  
  // SPA fallback - serve index.html for all non-API routes
  app.get('*', (_req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
  });
} else {
  // Development only: API docs at root
  app.get('/', (_req, res) => {
    res.json({
      name: 'FakeSOL API',
      version: '0.3.0',
      description: 'Backend API for FakeSOL devnet wallet',
      network: 'Solana Devnet',
      endpoints: {
        health: 'GET /api/health',
        performance: 'GET /api/performance',
        blockhash: 'GET /api/blockhash',
        rentExemption: 'GET /api/rent-exemption',
        generateWallet: 'POST /api/wallet/generate',
        validateAddress: 'GET /api/wallet/validate/:address',
        getBalance: 'GET /api/wallet/:address/balance',
        requestAirdrop: 'POST /api/wallet/:address/airdrop',
        treasuryAirdrop: 'POST /api/faucet/treasury',
        treasuryHealth: 'GET /api/faucet/treasury/health',
        getTransactions: 'GET /api/wallet/:address/transactions',
        getTokens: 'GET /api/wallet/:address/tokens',
        getTokenBalance: 'GET /api/wallet/:address/token/:mint',
        getAccountInfo: 'GET /api/account/:address',
        getTransaction: 'GET /api/transaction/:signature',
        getTransactionInfo: 'GET /api/transaction/:signature/info',
        sendTransaction: 'POST /api/transaction/send',
      },
    });
  });
}

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

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
