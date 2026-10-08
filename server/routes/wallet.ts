import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { db } from '../db';
import { getCurrentUser } from './auth';
import { DepositRequest, WithdrawalRequest, WalletTransaction, NotificationItem } from '../types';

export const walletRouter = Router();

// Wallet summary
walletRouter.get('/', (req: Request, res: Response): any => {
  const user = getCurrentUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized.' });

  const deposits = db.get('deposits').filter((d) => d.userId === user.id && d.status === 'APPROVED');
  const totalDeposited = deposits.reduce((sum, d) => sum + d.amount, 0);

  const withdrawals = db.get('withdrawals').filter((w) => w.userId === user.id && (w.status === 'COMPLETED' || w.status === 'APPROVED'));
  const totalWithdrawn = withdrawals.reduce((sum, w) => sum + w.amount, 0);

  const realTrades = db.get('trades').filter((t) => t.userId === user.id && !t.isDemo);
  const totalStaked = realTrades.reduce((sum, t) => sum + t.stake, 0);
  const totalWon = realTrades.reduce((sum, t) => sum + t.actualPayout, 0);
  const totalPnl = totalWon - totalStaked;

  const paymentMethods = db.get('paymentMethods').filter((m) => m.enabled);

  return res.json({
    realBalance: user.realBalance,
    demoBalance: user.demoBalance,
    lockedBalance: user.lockedBalance,
    isDemoMode: user.isDemoMode,
    totalDeposited,
    totalWithdrawn,
    totalPnl,
    paymentMethods,
  });
});

// Toggle Demo / Real Mode
walletRouter.post('/toggle-mode', (req: Request, res: Response): any => {
  const user = getCurrentUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized.' });

  const { isDemoMode } = req.body;
  const users = [...db.get('users')];
  const idx = users.findIndex((u) => u.id === user.id);
  if (idx !== -1) {
    users[idx].isDemoMode = Boolean(isDemoMode);
    db.update('users', users);
  }

  return res.json({ success: true, isDemoMode: Boolean(isDemoMode) });
});

// Reset Demo Balance
walletRouter.post('/reset-demo', (req: Request, res: Response): any => {
  const user = getCurrentUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized.' });

  const settings = db.get('siteSettings');
  const defaultBalance = settings.defaultDemoBalance || 10000;

  const users = [...db.get('users')];
  const idx = users.findIndex((u) => u.id === user.id);
  if (idx !== -1) {
    users[idx].demoBalance = defaultBalance;
    db.update('users', users);
  }

  const tx: WalletTransaction = {
    id: `TX-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
    userId: user.id,
    type: 'DEMO_RESET',
    amount: defaultBalance,
    currency: 'USD',
    referenceId: 'DEMO-RESET',
    description: 'Practice Demo Balance replenishment to $10,000.00',
    status: 'COMPLETED',
    isDemo: true,
    createdAt: new Date().toISOString(),
  };
  db.update('transactions', [tx, ...db.get('transactions')]);

  return res.json({ success: true, demoBalance: defaultBalance });
});

// Transactions list
walletRouter.get('/transactions', (req: Request, res: Response): any => {
  const user = getCurrentUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized.' });

  const type = req.query.type as string;
  let txs = db.get('transactions').filter((t) => t.userId === user.id);

  if (type) {
    txs = txs.filter((t) => t.type.toLowerCase() === type.toLowerCase());
  }

  return res.json({ transactions: txs });
});

// Deposits list
walletRouter.get('/deposits', (req: Request, res: Response): any => {
  const user = getCurrentUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized.' });

  const deposits = db.get('deposits').filter((d) => d.userId === user.id);
  return res.json({ deposits });
});

// Submit Deposit Request
walletRouter.post('/deposits', (req: Request, res: Response): any => {
  const user = getCurrentUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized.' });

  const { methodId, amount, referenceId, proofNote } = req.body;
  if (!methodId || !amount || !referenceId) {
    return res.status(400).json({ error: 'Payment method, amount, and transaction reference ID are required.' });
  }

  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({ error: 'Invalid deposit amount.' });
  }

  const method = db.get('paymentMethods').find((m) => m.id === methodId);
  if (!method || !method.enabled) {
    return res.status(400).json({ error: 'Selected payment method is currently disabled.' });
  }

  if (parsedAmount < method.minAmount) {
    return res.status(400).json({ error: `Minimum deposit for ${method.name} is $${method.minAmount}.` });
  }

  if (method.maxAmount && parsedAmount > method.maxAmount) {
    return res.status(400).json({ error: `Maximum deposit for ${method.name} is $${method.maxAmount}.` });
  }

  const depositId = `DEP-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  const now = new Date().toISOString();

  const newDeposit: DepositRequest = {
    id: depositId,
    userId: user.id,
    userEmail: user.email,
    methodId: method.id,
    methodName: method.name,
    amount: parsedAmount,
    referenceId: referenceId.trim(),
    proofNote: proofNote ? proofNote.trim() : undefined,
    status: 'PENDING',
    createdAt: now,
    updatedAt: now,
  };

  db.update('deposits', [newDeposit, ...db.get('deposits')]);

  // Notify User
  const userNotif: NotificationItem = {
    id: `NOTIF-${Date.now()}`,
    userId: user.id,
    title: 'Deposit Request Submitted',
    message: `Your deposit of $${parsedAmount.toFixed(2)} via ${method.name} has been received for compliance verification.`,
    type: 'DEPOSIT',
    read: false,
    createdAt: now,
  };
  db.update('notifications', [userNotif, ...db.get('notifications')]);

  return res.json({ success: true, deposit: newDeposit });
});

// Withdrawals list
walletRouter.get('/withdrawals', (req: Request, res: Response): any => {
  const user = getCurrentUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized.' });

  const withdrawals = db.get('withdrawals').filter((w) => w.userId === user.id);
  return res.json({ withdrawals });
});

// Submit Withdrawal Request
walletRouter.post('/withdrawals', (req: Request, res: Response): any => {
  const user = getCurrentUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized.' });

  const { method, destinationAddress, amount } = req.body;
  if (!method || !destinationAddress || !amount) {
    return res.status(400).json({ error: 'Withdrawal method, destination address, and amount are required.' });
  }

  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount < 20) {
    return res.status(400).json({ error: 'Minimum withdrawal amount is $20.00.' });
  }

  // Server-side balance check (Available balance cannot be exceeded)
  if (user.realBalance < parsedAmount) {
    return res.status(400).json({
      error: `Insufficient available balance. You have $${user.realBalance.toFixed(2)} available.`,
    });
  }

  // Deduct from real balance immediately to reserve funds
  const users = [...db.get('users')];
  const idx = users.findIndex((u) => u.id === user.id);
  if (idx !== -1) {
    users[idx].realBalance = Number((users[idx].realBalance - parsedAmount).toFixed(2));
    db.update('users', users);
  }

  const withdrawalId = `WTH-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  const fee = 0; // 0 fee promotion
  const netAmount = parsedAmount - fee;
  const now = new Date().toISOString();

  const newWithdrawal: WithdrawalRequest = {
    id: withdrawalId,
    userId: user.id,
    userEmail: user.email,
    method,
    destinationAddress: destinationAddress.trim(),
    amount: parsedAmount,
    fee,
    netAmount,
    status: 'PENDING',
    createdAt: now,
    updatedAt: now,
  };

  db.update('withdrawals', [newWithdrawal, ...db.get('withdrawals')]);

  // Transaction record
  const tx: WalletTransaction = {
    id: `TX-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
    userId: user.id,
    type: 'WITHDRAWAL',
    amount: -parsedAmount,
    currency: 'USD',
    referenceId: withdrawalId,
    description: `Withdrawal request via ${method} to ${destinationAddress.slice(0, 8)}...`,
    status: 'PENDING',
    isDemo: false,
    createdAt: now,
  };
  db.update('transactions', [tx, ...db.get('transactions')]);

  // Notification
  const notif: NotificationItem = {
    id: `NOTIF-${Date.now()}`,
    userId: user.id,
    title: 'Withdrawal Submitted',
    message: `Your request for $${parsedAmount.toFixed(2)} to ${destinationAddress.slice(0, 10)}... is pending automated review.`,
    type: 'WITHDRAWAL',
    read: false,
    createdAt: now,
  };
  db.update('notifications', [notif, ...db.get('notifications')]);

  return res.json({ success: true, withdrawal: newWithdrawal });
});
