import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { authRouter } from './server/routes/auth';
import { marketRouter } from './server/routes/market';
import { tradesRouter } from './server/routes/trades';
import { walletRouter } from './server/routes/wallet';
import { supportRouter } from './server/routes/support';
import { notificationsRouter } from './server/routes/notifications';
import { referralsRouter } from './server/routes/referrals';
import { adminRouter } from './server/routes/admin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/market', marketRouter);
app.use('/api/trades', tradesRouter);
app.use('/api/wallet', walletRouter);
app.use('/api/support', supportRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/referrals', referralsRouter);
app.use('/api/admin', adminRouter);

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EliteDex Binary Trading Platform server active at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal startup error in server:', err);
  process.exit(1);
});
