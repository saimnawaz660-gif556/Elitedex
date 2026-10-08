import { Router, Request, Response } from 'express';
import { db } from '../db';
import { getCurrentUser } from './auth';

export const referralsRouter = Router();

referralsRouter.get('/', (req: Request, res: Response): any => {
  const user = getCurrentUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized.' });

  const referredUsers = db.get('users').filter((u) => u.referredBy === user.referralCode);
  const referredCount = referredUsers.length;

  const history = referredUsers.map((u, i) => ({
    id: `REF-${i + 1}`,
    referredUserEmail: `${u.email.slice(0, 3)}***@${u.email.split('@')[1] || 'mail.com'}`,
    date: u.createdAt,
    rewardAmount: 25.0, // transparent promotional reward
  }));

  const totalCommission = history.reduce((sum, h) => sum + h.rewardAmount, 0);

  return res.json({
    referralCode: user.referralCode,
    referralLink: `${req.protocol}://${req.get('host')}/register?ref=${user.referralCode}`,
    referredCount,
    totalCommission,
    history,
  });
});
