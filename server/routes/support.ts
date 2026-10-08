import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { db } from '../db';
import { getCurrentUser } from './auth';
import { SupportTicket, TicketCategory } from '../types';

export const supportRouter = Router();

// List tickets for current user
supportRouter.get('/tickets', (req: Request, res: Response): any => {
  const user = getCurrentUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized.' });

  const tickets = db.get('supportTickets').filter((t) => t.userId === user.id);
  return res.json({ tickets });
});

// Create new ticket
supportRouter.post('/tickets', (req: Request, res: Response): any => {
  const user = getCurrentUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized.' });

  const { subject, category, message } = req.body;
  if (!subject || !category || !message) {
    return res.status(400).json({ error: 'Subject, category, and message are required.' });
  }

  const ticketId = `TCK-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  const now = new Date().toISOString();

  const newTicket: SupportTicket = {
    id: ticketId,
    userId: user.id,
    userEmail: user.email,
    userName: user.name,
    subject: subject.trim(),
    category: category as TicketCategory,
    status: 'OPEN',
    createdAt: now,
    updatedAt: now,
    messages: [
      {
        id: `MSG-${Date.now()}`,
        senderId: user.id,
        senderName: user.name,
        senderRole: 'user',
        content: message.trim(),
        createdAt: now,
      },
    ],
  };

  db.update('supportTickets', [newTicket, ...db.get('supportTickets')]);

  return res.json({ success: true, ticket: newTicket });
});

// Send message to ticket
supportRouter.post('/tickets/:id/messages', (req: Request, res: Response): any => {
  const user = getCurrentUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized.' });

  const { content } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Message content cannot be empty.' });
  }

  const tickets = [...db.get('supportTickets')];
  const idx = tickets.findIndex((t) => t.id === req.params.id && (t.userId === user.id || user.role === 'admin'));

  if (idx === -1) {
    return res.status(404).json({ error: 'Ticket not found.' });
  }

  const now = new Date().toISOString();
  tickets[idx].messages.push({
    id: `MSG-${Date.now()}`,
    senderId: user.id,
    senderName: user.name,
    senderRole: user.role,
    content: content.trim(),
    createdAt: now,
  });

  if (user.role === 'user') {
    tickets[idx].status = 'OPEN';
  }
  tickets[idx].updatedAt = now;

  db.update('supportTickets', tickets);

  return res.json({ success: true, ticket: tickets[idx] });
});
