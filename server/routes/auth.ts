import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { db, hashPassword } from '../db';
import { User, AuditLog } from '../types';

export const authRouter = Router();

// In-memory session store (token -> userId)
export const sessions = new Map<string, string>();

// Seed default sessions for convenience
const defaultTrader = db.get('users').find((u) => u.email === 'trader@elitedex.com');
if (defaultTrader) {
  sessions.set('token_default_trader_session', defaultTrader.id);
}
const defaultAdmin = db.get('users').find((u) => u.email === 'admin@elitedex.com');
if (defaultAdmin) {
  sessions.set('token_default_admin_session', defaultAdmin.id);
}

export function getCurrentUser(req: Request): User | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  const userId = sessions.get(token);
  if (!userId) return null;
  const user = db.get('users').find((u) => u.id === userId);
  return user || null;
}

// Register
authRouter.post('/register', (req: Request, res: Response): any => {
  const { name, email, password, confirmPassword, referralCode } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match.' });
  }

  const existing = db.get('users').find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'An account with this email address already exists.' });
  }

  const newId = `user_${crypto.randomBytes(6).toString('hex')}`;
  const userReferral = `EDX${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  const settings = db.get('siteSettings');

  const newUser: User = {
    id: newId,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    passwordHash: hashPassword(password),
    role: 'user',
    status: 'active',
    realBalance: 0,
    demoBalance: settings.defaultDemoBalance || 10000,
    lockedBalance: 0,
    isDemoMode: true,
    twoFactorEnabled: false,
    referralCode: userReferral,
    referredBy: referralCode ? referralCode.trim() : undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const users = [...db.get('users'), newUser];
  db.update('users', users);

  const token = `token_${crypto.randomBytes(16).toString('hex')}`;
  sessions.set(token, newUser.id);

  const { passwordHash: _, ...safeUser } = newUser;
  return res.json({ token, user: safeUser });
});

// Login
authRouter.post('/login', (req: Request, res: Response): any => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = db.get('users').find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  if (user.passwordHash !== hashPassword(password)) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  if (user.status === 'suspended') {
    return res.status(403).json({ error: 'This account has been suspended. Please contact compliance support.' });
  }

  const token = `token_${crypto.randomBytes(16).toString('hex')}`;
  sessions.set(token, user.id);

  const { passwordHash: _, ...safeUser } = user;
  return res.json({ token, user: safeUser });
});

// Current user
authRouter.get('/me', (req: Request, res: Response): any => {
  const user = getCurrentUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized or session expired.' });
  }
  const { passwordHash: _, ...safeUser } = user;
  return res.json({ user: safeUser });
});

// Logout
authRouter.post('/logout', (req: Request, res: Response): any => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    sessions.delete(token);
  }
  return res.json({ success: true });
});

// Update profile / password
authRouter.post('/update-password', (req: Request, res: Response): any => {
  const user = getCurrentUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized.' });

  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Both current and new password are required.' });
  }

  if (user.passwordHash !== hashPassword(currentPassword)) {
    return res.status(400).json({ error: 'Incorrect current password.' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters long.' });
  }

  const users = [...db.get('users')];
  const idx = users.findIndex((u) => u.id === user.id);
  if (idx !== -1) {
    users[idx].passwordHash = hashPassword(newPassword);
    users[idx].updatedAt = new Date().toISOString();
    db.update('users', users);
  }

  return res.json({ success: true, message: 'Password updated successfully.' });
});

// Toggle 2FA
authRouter.post('/toggle-2fa', (req: Request, res: Response): any => {
  const user = getCurrentUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized.' });

  const users = [...db.get('users')];
  const idx = users.findIndex((u) => u.id === user.id);
  if (idx !== -1) {
    users[idx].twoFactorEnabled = !users[idx].twoFactorEnabled;
    users[idx].updatedAt = new Date().toISOString();
    db.update('users', users);
    return res.json({ success: true, twoFactorEnabled: users[idx].twoFactorEnabled });
  }
  return res.status(500).json({ error: 'Failed updating 2FA.' });
});
