import { Router, Request, Response } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy, Profile as GoogleProfile } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy, Profile as GitHubProfile } from 'passport-github2';
import jwt from 'jsonwebtoken';
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import { prisma } from '../lib/prisma.js';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'fakesol-dev-secret-change-in-production';
const JWT_EXPIRES_IN = '30d';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const googleEnabled = !!(googleClientId && googleClientSecret);

const githubClientId = process.env.GITHUB_CLIENT_ID;
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;
const githubEnabled = !!(githubClientId && githubClientSecret);

// Encryption for private keys
function encryptPrivateKey(privateKey: string): string {
  const buffer = Buffer.from(privateKey);
  return `enc:${buffer.toString('base64')}`;
}

// Configure Google Strategy
if (googleEnabled) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: googleClientId!,
        clientSecret: googleClientSecret!,
        callbackURL: `${process.env.API_URL || 'http://localhost:3001'}/api/oauth/google/callback`,
      },
      async (
        _accessToken: string,
        _refreshToken: string,
        profile: GoogleProfile,
        done: (error: Error | null, user?: Express.User) => void
      ) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error('No email provided by Google'));
          }

          if (!prisma) {
            return done(new Error('Database not available'));
          }

          // Find or create user
          let user = await prisma.user.findUnique({
            where: { email },
            include: { wallets: true },
          });

          if (!user) {
            // Create new user with wallet
            const keypair = Keypair.generate();
            const publicKey = keypair.publicKey.toBase58();
            const privateKey = bs58.encode(keypair.secretKey);

            user = await prisma.user.create({
              data: {
                email,
                name: profile.displayName,
                avatar: profile.photos?.[0]?.value,
                provider: 'google',
                providerId: profile.id,
                loginCount: 1,
                lastLoginAt: new Date(),
                wallets: {
                  create: {
                    name: 'My Wallet',
                    publicKey,
                    privateKey: encryptPrivateKey(privateKey),
                  },
                },
              },
              include: { wallets: true },
            });

            // Track signup
            await prisma.analytics.create({
              data: {
                event: 'signup',
                userId: user.id,
                email: user.email,
                metadata: { provider: 'google' },
              },
            });
          } else {
            // Update existing user
            user = await prisma.user.update({
              where: { id: user.id },
              data: {
                name: user.name || profile.displayName,
                avatar: user.avatar || profile.photos?.[0]?.value,
                provider: user.provider === 'email' ? user.provider : 'google',
                providerId: user.providerId || profile.id,
                loginCount: { increment: 1 },
                lastLoginAt: new Date(),
              },
              include: { wallets: true },
            });

            // Track login
            await prisma.analytics.create({
              data: {
                event: 'login',
                userId: user.id,
                email: user.email,
                metadata: { provider: 'google' },
              },
            });
          }

          done(null, user as Express.User);
        } catch (error) {
          done(error as Error);
        }
      }
    )
  );
  console.log('✅ Google OAuth configured');
}

// Configure GitHub Strategy
if (githubEnabled) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: githubClientId!,
        clientSecret: githubClientSecret!,
        callbackURL: `${process.env.API_URL || 'http://localhost:3001'}/api/oauth/github/callback`,
        scope: ['user:email'],
      },
      async (
        _accessToken: string,
        _refreshToken: string,
        profile: GitHubProfile,
        done: (error: Error | null, user?: Express.User) => void
      ) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error('No email provided by GitHub. Please ensure your GitHub email is public or verified.'));
          }

          if (!prisma) {
            return done(new Error('Database not available'));
          }

          // Find or create user
          let user = await prisma.user.findUnique({
            where: { email },
            include: { wallets: true },
          });

          if (!user) {
            // Create new user with wallet
            const keypair = Keypair.generate();
            const publicKey = keypair.publicKey.toBase58();
            const privateKey = bs58.encode(keypair.secretKey);

            user = await prisma.user.create({
              data: {
                email,
                name: profile.displayName || profile.username,
                avatar: profile.photos?.[0]?.value,
                provider: 'github',
                providerId: profile.id,
                loginCount: 1,
                lastLoginAt: new Date(),
                wallets: {
                  create: {
                    name: 'My Wallet',
                    publicKey,
                    privateKey: encryptPrivateKey(privateKey),
                  },
                },
              },
              include: { wallets: true },
            });

            // Track signup
            await prisma.analytics.create({
              data: {
                event: 'signup',
                userId: user.id,
                email: user.email,
                metadata: { provider: 'github' },
              },
            });
          } else {
            // Update existing user
            user = await prisma.user.update({
              where: { id: user.id },
              data: {
                name: user.name || profile.displayName || profile.username,
                avatar: user.avatar || profile.photos?.[0]?.value,
                provider: user.provider === 'email' ? user.provider : 'github',
                providerId: user.providerId || profile.id,
                loginCount: { increment: 1 },
                lastLoginAt: new Date(),
              },
              include: { wallets: true },
            });

            // Track login
            await prisma.analytics.create({
              data: {
                event: 'login',
                userId: user.id,
                email: user.email,
                metadata: { provider: 'github' },
              },
            });
          }

          done(null, user as Express.User);
        } catch (error) {
          done(error as Error);
        }
      }
    )
  );
  console.log('✅ GitHub OAuth configured');
}

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user: Express.User, done) => {
  done(null, user);
});

// Google OAuth routes
if (googleEnabled) {
  router.get(
    '/google',
    passport.authenticate('google', {
      scope: ['profile', 'email'],
      session: false,
    })
  );

  router.get(
    '/google/callback',
    passport.authenticate('google', {
      session: false,
      failureRedirect: `${FRONTEND_URL}/login?error=oauth_failed`,
    }),
    (req: Request, res: Response) => {
      const user = req.user as { id: string; email: string };

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

      // Redirect to frontend with token
      res.redirect(`${FRONTEND_URL}/oauth/callback?token=${token}`);
    }
  );
}

// GitHub OAuth routes
if (githubEnabled) {
  router.get(
    '/github',
    passport.authenticate('github', {
      scope: ['user:email'],
      session: false,
    })
  );

  router.get(
    '/github/callback',
    passport.authenticate('github', {
      session: false,
      failureRedirect: `${FRONTEND_URL}/login?error=oauth_failed`,
    }),
    (req: Request, res: Response) => {
      const user = req.user as { id: string; email: string };

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

      // Redirect to frontend with token
      res.redirect(`${FRONTEND_URL}/oauth/callback?token=${token}`);
    }
  );
}

// Check OAuth availability
router.get('/providers', (_req: Request, res: Response) => {
  res.json({
    google: googleEnabled,
    github: !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
  });
});

export default router;
