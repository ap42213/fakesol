import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

// Simple admin auth (in production, use proper admin authentication)
const ADMIN_KEY = process.env.ADMIN_API_KEY || 'fakesol-admin-key-change-me';

const adminAuth = (req: Request, res: Response, next: () => void) => {
  const apiKey = req.headers['x-admin-key'];
  if (apiKey !== ADMIN_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// Get signup analytics
router.get('/signups', adminAuth, async (_req: Request, res: Response) => {
  try {
    const totalUsers = await prisma.user.count();
    
    // Signups by day (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentSignups = await prisma.user.findMany({
      where: {
        createdAt: { gte: thirtyDaysAgo },
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
        loginCount: true,
        lastLoginAt: true,
        _count: {
          select: { wallets: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Daily signups
    const signupsByDay = await prisma.$queryRaw`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM "User"
      WHERE created_at >= ${thirtyDaysAgo}
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `;

    // Total wallets
    const totalWallets = await prisma.wallet.count();

    res.json({
      totalUsers,
      totalWallets,
      recentSignups: recentSignups.map((u: { id: string; email: string; createdAt: Date; loginCount: number; lastLoginAt: Date | null; _count: { wallets: number } }) => ({
        id: u.id,
        email: u.email,
        createdAt: u.createdAt,
        loginCount: u.loginCount,
        lastLoginAt: u.lastLoginAt,
        walletCount: u._count.wallets,
      })),
      signupsByDay,
    });
  } catch (error) {
    console.error('Admin analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get event analytics
router.get('/events', adminAuth, async (req: Request, res: Response) => {
  try {
    const { event, days = '30' } = req.query;
    
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days as string));

    const where: any = {
      createdAt: { gte: daysAgo },
    };

    if (event) {
      where.event = event as string;
    }

    const events = await prisma.analytics.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 1000,
    });

    // Group by event type
    const eventCounts = await prisma.analytics.groupBy({
      by: ['event'],
      where: { createdAt: { gte: daysAgo } },
      _count: { id: true },
    });

    res.json({
      events,
      summary: eventCounts.map((e: { event: string; _count: { id: number } }) => ({
        event: e.event,
        count: e._count.id,
      })),
    });
  } catch (error) {
    console.error('Admin events error:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Export user emails (for marketing)
router.get('/emails', adminAuth, async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        email: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      count: users.length,
      emails: users,
    });
  } catch (error) {
    console.error('Admin emails error:', error);
    res.status(500).json({ error: 'Failed to fetch emails' });
  }
});

export default router;
