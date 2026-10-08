import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { db } from '../db';
import { getCurrentUser } from './auth';
import { AuditLog, WalletTransaction, NotificationItem, PaymentMethod } from '../types';

export const adminRouter = Router();

// Middleware: ensure caller is an admin
function requireAdmin(req: Request, res: Response, next: () => void): any {
  const user = getCurrentUser(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
  }
  (req as any).adminUser = user;
  next();
}

adminRouter.use(requireAdmin);

function logAudit(admin: any, action: string, targetType: string, targetId: string, details: string) {
  const audit: AuditLog = {
    id: `AUD-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
    adminId: admin.id,
    adminEmail: admin.email,
    action,
    targetType,
    targetId,
    details,
    timestamp: new Date().toISOString(),
  };
  db.update('auditLogs', [audit, ...db.get('auditLogs')]);
}

// 1. Dashboard Overview Metrics
adminRouter.get('/overview', (req: Request, res: Response) => {
  const users = db.get('users');
  const trades = db.get('trades');
  const deposits = db.get('deposits');
  const withdrawals = db.get('withdrawals');
  const tickets = db.get('supportTickets');

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === 'active').length;
  const activeTrades = trades.filter((t) => t.status === 'ACTIVE').length;
  const pendingDeposits = deposits.filter((d) => d.status === 'PENDING').length;
  const pendingWithdrawals = withdrawals.filter((w) => w.status === 'PENDING').length;
  const openTickets = tickets.filter((t) => t.status === 'OPEN' || t.status === 'PENDING').length;

  const now = Date.now();
  const dayAgo = now - 86400000;
  const todaysTrades = trades.filter((t) => t.entryTimestamp >= dayAgo);
  const todaysVolume = todaysTrades.reduce((sum, t) => sum + t.stake, 0);

  res.json({
    totalUsers,
    activeUsers,
    activeTrades,
    pendingDeposits,
    pendingWithdrawals,
    openTickets,
    todaysTradesCount: todaysTrades.length,
    todaysVolume,
    systemStatus: 'Operational',
  });
});

// 2. User Management
adminRouter.get('/users', (req: Request, res: Response) => {
  const users = db.get('users').map(({ passwordHash: _, ...u }) => u);
  res.json({ users });
});

adminRouter.post('/users/:id/status', (req: Request, res: Response): any => {
  const admin = (req as any).adminUser;
  const { status } = req.body; // 'active' | 'suspended'

  if (status !== 'active' && status !== 'suspended') {
    return res.status(400).json({ error: 'Status must be active or suspended.' });
  }

  const users = [...db.get('users')];
  const idx = users.findIndex((u) => u.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: 'User not found.' });
  }

  users[idx].status = status;
  users[idx].updatedAt = new Date().toISOString();
  db.update('users', users);

  logAudit(admin, 'USER_STATUS_CHANGE', 'USER', req.params.id, `Status modified to ${status}`);

  return res.json({ success: true, user: users[idx] });
});

// 3. Trade Management (Audit records)
adminRouter.get('/trades', (req: Request, res: Response) => {
  const trades = db.get('trades');
  res.json({ trades });
});

adminRouter.get('/settlements', (req: Request, res: Response) => {
  const settlements = db.get('settlements');
  res.json({ settlements });
});

// 4. Market / Asset Management
adminRouter.get('/assets', (req: Request, res: Response) => {
  res.json({ assets: db.get('assets') });
});

adminRouter.post('/assets/:id', (req: Request, res: Response): any => {
  const admin = (req as any).adminUser;
  const { enabled, payoutRate, durations } = req.body;

  const assets = [...db.get('assets')];
  const idx = assets.findIndex((a) => a.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Asset not found.' });
  }

  if (typeof enabled === 'boolean') assets[idx].enabled = enabled;
  if (typeof payoutRate === 'number' && payoutRate >= 50 && payoutRate <= 98) {
    assets[idx].payoutRate = payoutRate;
  }
  if (Array.isArray(durations)) {
    assets[idx].durations = durations;
  }
  assets[idx].lastUpdated = new Date().toISOString();

  db.update('assets', assets);

  logAudit(
    admin,
    'ASSET_CONFIG_UPDATE',
    'ASSET',
    req.params.id,
    `Updated asset ${assets[idx].symbol}: enabled=${assets[idx].enabled}, payout=${assets[idx].payoutRate}%`
  );

  return res.json({ success: true, asset: assets[idx] });
});

// 5. Deposit Management
adminRouter.get('/deposits', (req: Request, res: Response) => {
  res.json({ deposits: db.get('deposits') });
});

adminRouter.post('/deposits/:id/action', (req: Request, res: Response): any => {
  const admin = (req as any).adminUser;
  const { action, note } = req.body; // 'APPROVE' | 'REJECT'

  const deposits = [...db.get('deposits')];
  const idx = deposits.findIndex((d) => d.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Deposit request not found.' });

  const deposit = deposits[idx];
  if (deposit.status !== 'PENDING') {
    return res.status(400).json({ error: `Deposit is already in ${deposit.status} state.` });
  }

  const now = new Date().toISOString();

  if (action === 'APPROVE') {
    deposit.status = 'APPROVED';
    deposit.adminNote = note || 'Approved by compliance officer';
    deposit.processedBy = admin.id;
    deposit.updatedAt = now;
    deposits[idx] = deposit;
    db.update('deposits', deposits);

    // Credit realBalance
    const users = [...db.get('users')];
    const uIdx = users.findIndex((u) => u.id === deposit.userId);
    if (uIdx !== -1) {
      users[uIdx].realBalance = Number((users[uIdx].realBalance + deposit.amount).toFixed(2));
      db.update('users', users);
    }

    // Wallet transaction
    const tx: WalletTransaction = {
      id: `TX-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
      userId: deposit.userId,
      type: 'DEPOSIT',
      amount: deposit.amount,
      currency: 'USD',
      referenceId: deposit.id,
      description: `Deposit approved via ${deposit.methodName}`,
      status: 'COMPLETED',
      isDemo: false,
      createdAt: now,
    };
    db.update('transactions', [tx, ...db.get('transactions')]);

    // Notification
    const notif: NotificationItem = {
      id: `NOTIF-${Date.now()}`,
      userId: deposit.userId,
      title: 'Deposit Approved',
      message: `Your deposit of $${deposit.amount.toFixed(2)} has been credited to your real account balance.`,
      type: 'DEPOSIT',
      read: false,
      createdAt: now,
    };
    db.update('notifications', [notif, ...db.get('notifications')]);

    logAudit(admin, 'DEPOSIT_APPROVE', 'DEPOSIT', deposit.id, `Approved $${deposit.amount} for user ${deposit.userEmail}`);
  } else if (action === 'REJECT') {
    deposit.status = 'REJECTED';
    deposit.adminNote = note || 'Rejected due to verification mismatch';
    deposit.processedBy = admin.id;
    deposit.updatedAt = now;
    deposits[idx] = deposit;
    db.update('deposits', deposits);

    const notif: NotificationItem = {
      id: `NOTIF-${Date.now()}`,
      userId: deposit.userId,
      title: 'Deposit Rejected',
      message: `Your deposit request of $${deposit.amount.toFixed(2)} was rejected: ${deposit.adminNote}`,
      type: 'DEPOSIT',
      read: false,
      createdAt: now,
    };
    db.update('notifications', [notif, ...db.get('notifications')]);

    logAudit(admin, 'DEPOSIT_REJECT', 'DEPOSIT', deposit.id, `Rejected deposit $${deposit.amount}: ${deposit.adminNote}`);
  } else {
    return res.status(400).json({ error: 'Action must be APPROVE or REJECT.' });
  }

  return res.json({ success: true, deposit });
});

// 6. Withdrawal Management
adminRouter.get('/withdrawals', (req: Request, res: Response) => {
  res.json({ withdrawals: db.get('withdrawals') });
});

adminRouter.post('/withdrawals/:id/action', (req: Request, res: Response): any => {
  const admin = (req as any).adminUser;
  const { action, note } = req.body; // 'APPROVE' | 'REJECT' | 'COMPLETE'

  const withdrawals = [...db.get('withdrawals')];
  const idx = withdrawals.findIndex((w) => w.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Withdrawal not found.' });

  const withdrawal = withdrawals[idx];
  const now = new Date().toISOString();

  if (action === 'APPROVE' || action === 'COMPLETE') {
    withdrawal.status = action === 'APPROVE' ? 'APPROVED' : 'COMPLETED';
    withdrawal.adminNote = note || 'Dispatched via blockchain network';
    withdrawal.processedBy = admin.id;
    withdrawal.updatedAt = now;
    withdrawals[idx] = withdrawal;
    db.update('withdrawals', withdrawals);

    const notif: NotificationItem = {
      id: `NOTIF-${Date.now()}`,
      userId: withdrawal.userId,
      title: 'Withdrawal Processed',
      message: `Your withdrawal of $${withdrawal.amount.toFixed(2)} has been completed to ${withdrawal.destinationAddress.slice(0, 10)}...`,
      type: 'WITHDRAWAL',
      read: false,
      createdAt: now,
    };
    db.update('notifications', [notif, ...db.get('notifications')]);

    logAudit(admin, 'WITHDRAWAL_COMPLETE', 'WITHDRAWAL', withdrawal.id, `Completed $${withdrawal.amount} to ${withdrawal.destinationAddress}`);
  } else if (action === 'REJECT') {
    withdrawal.status = 'REJECTED';
    withdrawal.adminNote = note || 'Rejected by compliance';
    withdrawal.processedBy = admin.id;
    withdrawal.updatedAt = now;
    withdrawals[idx] = withdrawal;
    db.update('withdrawals', withdrawals);

    // Refund back to user's real balance!
    const users = [...db.get('users')];
    const uIdx = users.findIndex((u) => u.id === withdrawal.userId);
    if (uIdx !== -1) {
      users[uIdx].realBalance = Number((users[uIdx].realBalance + withdrawal.amount).toFixed(2));
      db.update('users', users);
    }

    const notif: NotificationItem = {
      id: `NOTIF-${Date.now()}`,
      userId: withdrawal.userId,
      title: 'Withdrawal Rejected (Refunded)',
      message: `Your withdrawal request of $${withdrawal.amount.toFixed(2)} was rejected and refunded back to your balance: ${withdrawal.adminNote}`,
      type: 'WITHDRAWAL',
      read: false,
      createdAt: now,
    };
    db.update('notifications', [notif, ...db.get('notifications')]);

    logAudit(admin, 'WITHDRAWAL_REJECT', 'WITHDRAWAL', withdrawal.id, `Rejected & refunded $${withdrawal.amount}: ${withdrawal.adminNote}`);
  } else {
    return res.status(400).json({ error: 'Invalid action.' });
  }

  return res.json({ success: true, withdrawal });
});

// 7. Payment Methods Management
adminRouter.get('/payment-methods', (req: Request, res: Response) => {
  res.json({ paymentMethods: db.get('paymentMethods') });
});

adminRouter.post('/payment-methods', (req: Request, res: Response): any => {
  const admin = (req as any).adminUser;
  const methodData: PaymentMethod = req.body;

  if (!methodData.id || !methodData.name || !methodData.accountDetails) {
    return res.status(400).json({ error: 'ID, name, and account details are required.' });
  }

  const list = [...db.get('paymentMethods')];
  const idx = list.findIndex((m) => m.id === methodData.id);

  if (idx !== -1) {
    list[idx] = { ...list[idx], ...methodData };
  } else {
    list.push(methodData);
  }

  db.update('paymentMethods', list);
  logAudit(admin, 'PAYMENT_METHOD_UPDATE', 'PAYMENT_METHOD', methodData.id, `Updated payment method ${methodData.name}`);

  return res.json({ success: true, paymentMethods: list });
});

// 8. Support Tickets Management
adminRouter.get('/support', (req: Request, res: Response) => {
  res.json({ tickets: db.get('supportTickets') });
});

adminRouter.post('/support/:id/reply', (req: Request, res: Response): any => {
  const admin = (req as any).adminUser;
  const { content, status } = req.body;

  if (!content) return res.status(400).json({ error: 'Message content is required.' });

  const tickets = [...db.get('supportTickets')];
  const idx = tickets.findIndex((t) => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Ticket not found.' });

  const now = new Date().toISOString();
  tickets[idx].messages.push({
    id: `MSG-${Date.now()}`,
    senderId: admin.id,
    senderName: 'Compliance Officer',
    senderRole: 'admin',
    content: content.trim(),
    createdAt: now,
  });

  if (status) {
    tickets[idx].status = status;
  } else {
    tickets[idx].status = 'PENDING';
  }
  tickets[idx].updatedAt = now;

  db.update('supportTickets', tickets);

  // User notification
  const notif: NotificationItem = {
    id: `NOTIF-${Date.now()}`,
    userId: tickets[idx].userId,
    title: 'Support Response',
    message: `New reply on ticket "${tickets[idx].subject}": ${content.slice(0, 60)}...`,
    type: 'SUPPORT',
    read: false,
    createdAt: now,
  };
  db.update('notifications', [notif, ...db.get('notifications')]);

  logAudit(admin, 'SUPPORT_REPLY', 'TICKET', tickets[idx].id, `Replied to ticket ${tickets[idx].id}`);

  return res.json({ success: true, ticket: tickets[idx] });
});

// 9. Site Settings
adminRouter.get('/settings', (req: Request, res: Response) => {
  res.json({ settings: db.get('siteSettings') });
});

adminRouter.post('/settings', (req: Request, res: Response): any => {
  const admin = (req as any).adminUser;
  const newSettings = req.body;

  const current = db.get('siteSettings');
  const merged = { ...current, ...newSettings };
  db.update('siteSettings', merged);

  logAudit(admin, 'SITE_SETTINGS_UPDATE', 'SETTINGS', 'GLOBAL', 'Updated platform configuration');

  return res.json({ success: true, settings: merged });
});

// 10. Audit Logs
adminRouter.get('/audit-logs', (req: Request, res: Response) => {
  res.json({ auditLogs: db.get('auditLogs') });
});
