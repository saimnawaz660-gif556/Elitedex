import { Router, Request, Response } from 'express';
import { db } from '../db';
import { marketService } from '../marketService';

export const marketRouter = Router();

// Get all supported crypto assets
marketRouter.get('/assets', (req: Request, res: Response) => {
  const assets = db.get('assets');
  const marketStatus = marketService.getMarketStatus();
  res.json({
    assets,
    status: marketStatus,
  });
});

// Get single asset
marketRouter.get('/assets/:id', (req: Request, res: Response): any => {
  const asset = db.get('assets').find(
    (a) => a.id.toLowerCase() === req.params.id.toLowerCase() || a.symbol.toLowerCase() === req.params.id.toLowerCase()
  );
  if (!asset) {
    return res.status(404).json({ error: 'Asset not found' });
  }
  res.json({ asset });
});

// Get historical/live candles for chart
marketRouter.get('/candles', (req: Request, res: Response): any => {
  const assetId = (req.query.assetId as string) || 'btc-usd';
  const timeframe = (req.query.timeframe as string) || '1m';

  const candles = marketService.getCandles(assetId, timeframe);
  res.json({
    assetId,
    timeframe,
    candles,
    marketStatus: marketService.getMarketStatus(),
  });
});

// Get live data status
marketRouter.get('/status', (req: Request, res: Response) => {
  res.json(marketService.getMarketStatus());
});
