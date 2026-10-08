import { Router, Request, Response } from 'express';
import { db } from '../db';
import { getCurrentUser } from './auth';

export const notificationsRouter = Router();

// Get user notifications
notificationsRouter.get('/', (req: Request, res: Response): any => {
  const user = getCurrentUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized.' });

  const notifications = db.get('notifications').filter((n) => n.userId === user.id || n.userId === 'ALL');
  return res.json({ notifications });
});

// Mark single notification as read
notificationsRouter.post('/:id/read', (req: Request, res: Response): any => {
  const user = getCurrentUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized.' });

  const notifs = [...db.get('notifications')];
  const idx = notifs.findIndex((n) => n.id === req.params.id && (n.userId === user.id || n.userId === 'ALL'));
  if (idx !== -1) {
    notifs[idx].read = true;
    db.update('notifications', notifs);
  }
  return res.json({ success: true });
});

// Mark all as read
notificationsRouter.post('/read-all', (req: Request, res: Response): any => {
  const user = getCurrentUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized.' });

  const notifs = db.get('notifications').map((n) => {
    if (n.userId === user.id || n.userId === 'ALL') {
      return { ...n, read: true };
    }
    return n;
  });
  db.update('notifications', notifs);
  return res.json({ success: true });
});
