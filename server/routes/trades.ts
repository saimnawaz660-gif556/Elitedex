import { Router, Request, Response } from 'express';
import { db } from '../db';
import { tradeEngine } from '../tradeEngine';
import { getCurrentUser } from './auth';

export const tradesRouter = Router();

// Create new binary trade
tradesRouter.post('/', (req: Request, res: Response): any => {
  const user = getCurrentUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Please log in to place trades.' });
  }

  const { assetId, direction, stake, duration, isDemo } = req.body;

  if (!assetId || !direction || !stake || !duration) {
    return res.status(400).json({ error: 'Asset, direction, stake amount, and duration are required.' });
  }

  if (direction !== 'UP' && direction !== 'DOWN') {
    return res.status(400).json({ error: 'Direction must be UP or DOWN.' });
  }

  const parsedStake = parseFloat(stake);
  const parsedDuration = parseInt(duration, 10);

  if (isNaN(parsedStake) || parsedStake <= 0) {
    return res.status(400).json({ error: 'Invalid stake amount.' });
  }

  const result = tradeEngine.placeTrade({
    userId: user.id,
    assetId,
    direction,
    stake: parsedStake,
    duration: parsedDuration,
    isDemo: Boolean(isDemo),
  });

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  // Fetch updated user balance to return
  const updatedUser = db.get('users').find((u) => u.id === user.id);

  return res.json({
    success: true,
    trade: result.trade,
    user: updatedUser
      ? {
          realBalance: updatedUser.realBalance,
          demoBalance: updatedUser.demoBalance,
          lockedBalance: updatedUser.lockedBalance,
        }
      : undefined,
  });
});

// Get user trades
tradesRouter.get('/', (req: Request, res: Response): any => {
  const user = getCurrentUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  const status = (req.query.status as string) || 'all';
  const mode = req.query.mode as string; // 'demo', 'real', or undefined

  let trades = db.get('trades').filter((t) => t.userId === user.id);

  if (mode === 'demo') {
    trades = trades.filter((t) => t.isDemo);
  } else if (mode === 'real') {
    trades = trades.filter((t) => !t.isDemo);
  }

  if (status === 'active') {
    trades = trades.filter((t) => t.status === 'ACTIVE');
  } else if (status === 'won') {
    trades = trades.filter((t) => t.status === 'WON');
  } else if (status === 'lost') {
    trades = trades.filter((t) => t.status === 'LOST');
  }

  // Sort descending by creation
  trades.sort((a, b) => b.entryTimestamp - a.entryTimestamp);

  return res.json({ trades });
});

// Get single trade details + immutable settlement record
tradesRouter.get('/:id', (req: Request, res: Response): any => {
  const user = getCurrentUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized.' });

  const trade = db.get('trades').find((t) => t.id === req.params.id && (t.userId === user.id || user.role === 'admin'));
  if (!trade) {
    return res.status(404).json({ error: 'Trade not found.' });
  }

  const settlement = db.get('settlements').find((s) => s.tradeId === trade.id);

  return res.json({
    trade,
    settlement: settlement || null,
  });
});
