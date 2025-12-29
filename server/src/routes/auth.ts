import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import { prisma } from '../lib/prisma';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'fakesol-dev-secret-change-in-production';
const JWT_EXPIRES_IN = '30d';

// Encryption key for private keys (in production, use a proper key management system)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'fakesol-encryption-key-32chars!';

// Simple encryption/decryption for private keys
function encryptPrivateKey(privateKey: string): string {
  // In production, use proper encryption like AES-256
  // For now, using base64 encoding with a prefix
  const buffer = Buffer.from(privateKey);
  return `enc:${buffer.toString('base64')}`;
}

function decryptPrivateKey(encrypted: string): string {
  if (encrypted.startsWith('enc:')) {
    const base64 = encrypted.slice(4);
    return Buffer.from(base64, 'base64').toString();
  }
  return encrypted;
}

// JWT middleware
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Optional auth - doesn't fail if no token
export const optionalAuthMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
      req.user = decoded;
    }
  } catch (error) {
    // Ignore invalid tokens
  }
  next();
};

// Track analytics event
async function trackEvent(event: string, userId?: string, email?: string, metadata?: any) {
  try {
    await prisma.analytics.create({
      data: {
        event,
        userId,
        email,
        metadata,
      },
    });
  } catch (error) {
    console.error('Analytics tracking error:', error);
  }
}

// Register new user
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, walletName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check password strength
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate first wallet
    const keypair = Keypair.generate();
    const publicKey = keypair.publicKey.toBase58();
    const privateKey = bs58.encode(keypair.secretKey);

    // Create user with wallet
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        loginCount: 1,
        lastLoginAt: new Date(),
        wallets: {
          create: {
            name: walletName || 'My Wallet',
            publicKey,
            privateKey: encryptPrivateKey(privateKey),
          },
        },
      },
      include: {
        wallets: true,
      },
    });

    // Track signup
    await trackEvent('signup', user.id, user.email, {
      source: req.headers['user-agent'],
    });

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    // Return user data with decrypted wallet
    const wallets = user.wallets.map((w: { id: string; name: string; publicKey: string; privateKey: string; createdAt: Date }) => ({
      id: w.id,
      name: w.name,
      publicKey: w.publicKey,
      privateKey: decryptPrivateKey(w.privateKey),
      createdAt: w.createdAt.toISOString(),
    }));

    res.json({
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
      },
      wallets,
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { wallets: true },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Update login stats
    await prisma.user.update({
      where: { id: user.id },
      data: {
        loginCount: { increment: 1 },
        lastLoginAt: new Date(),
      },
    });

    // Track login
    await trackEvent('login', user.id, user.email);

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    // Return user data with decrypted wallets
    const wallets = user.wallets.map((w: { id: string; name: string; publicKey: string; privateKey: string; createdAt: Date }) => ({
      id: w.id,
      name: w.name,
      publicKey: w.publicKey,
      privateKey: decryptPrivateKey(w.privateKey),
      createdAt: w.createdAt.toISOString(),
    }));

    res.json({
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
      },
      wallets,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Logout
router.post('/logout', (req: Request, res: Response) => {
  res.clearCookie('token');
  res.json({ success: true });
});

// Get current user
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: { wallets: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const wallets = user.wallets.map((w: { id: string; name: string; publicKey: string; privateKey: string; createdAt: Date }) => ({
      id: w.id,
      name: w.name,
      publicKey: w.publicKey,
      privateKey: decryptPrivateKey(w.privateKey),
      createdAt: w.createdAt.toISOString(),
    }));

    res.json({
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
      },
      wallets,
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Create new wallet for authenticated user
router.post('/wallets', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { name } = req.body;

    // Generate new wallet
    const keypair = Keypair.generate();
    const publicKey = keypair.publicKey.toBase58();
    const privateKey = bs58.encode(keypair.secretKey);

    const wallet = await prisma.wallet.create({
      data: {
        name: name || `Wallet ${await prisma.wallet.count({ where: { userId: req.user!.id } }) + 1}`,
        publicKey,
        privateKey: encryptPrivateKey(privateKey),
        userId: req.user!.id,
      },
    });

    // Track wallet creation
    await trackEvent('wallet_created', req.user!.id);

    res.json({
      id: wallet.id,
      name: wallet.name,
      publicKey: wallet.publicKey,
      privateKey,
      createdAt: wallet.createdAt.toISOString(),
    });
  } catch (error) {
    console.error('Create wallet error:', error);
    res.status(500).json({ error: 'Failed to create wallet' });
  }
});

// Rename wallet
router.patch('/wallets/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const wallet = await prisma.wallet.findFirst({
      where: { id, userId: req.user!.id },
    });

    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    const updated = await prisma.wallet.update({
      where: { id },
      data: { name },
    });

    res.json({
      id: updated.id,
      name: updated.name,
      publicKey: updated.publicKey,
      createdAt: updated.createdAt.toISOString(),
    });
  } catch (error) {
    console.error('Update wallet error:', error);
    res.status(500).json({ error: 'Failed to update wallet' });
  }
});

// Delete wallet
router.delete('/wallets/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const wallet = await prisma.wallet.findFirst({
      where: { id, userId: req.user!.id },
    });

    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    // Ensure user has at least one wallet
    const walletCount = await prisma.wallet.count({
      where: { userId: req.user!.id },
    });

    if (walletCount <= 1) {
      return res.status(400).json({ error: 'Cannot delete last wallet' });
    }

    await prisma.wallet.delete({ where: { id } });

    res.json({ success: true });
  } catch (error) {
    console.error('Delete wallet error:', error);
    res.status(500).json({ error: 'Failed to delete wallet' });
  }
});

// Import wallet from private key
router.post('/wallets/import', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { privateKey, name } = req.body;

    if (!privateKey) {
      return res.status(400).json({ error: 'Private key is required' });
    }

    // Validate and get public key from private key
    let publicKey: string;
    try {
      const secretKey = bs58.decode(privateKey);
      const keypair = Keypair.fromSecretKey(secretKey);
      publicKey = keypair.publicKey.toBase58();
    } catch {
      return res.status(400).json({ error: 'Invalid private key' });
    }

    // Check if wallet already exists for this user
    const existingWallet = await prisma.wallet.findFirst({
      where: { publicKey, userId: req.user!.id },
    });

    if (existingWallet) {
      return res.status(400).json({ error: 'Wallet already imported' });
    }

    const wallet = await prisma.wallet.create({
      data: {
        name: name || `Imported Wallet`,
        publicKey,
        privateKey: encryptPrivateKey(privateKey),
        userId: req.user!.id,
      },
    });

    // Track import
    await trackEvent('wallet_imported', req.user!.id);

    res.json({
      id: wallet.id,
      name: wallet.name,
      publicKey: wallet.publicKey,
      privateKey,
      createdAt: wallet.createdAt.toISOString(),
    });
  } catch (error) {
    console.error('Import wallet error:', error);
    res.status(500).json({ error: 'Failed to import wallet' });
  }
});

export default router;
