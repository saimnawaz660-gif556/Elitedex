import { db } from './db';
import { Asset, Candle } from './types';

interface MarketDataState {
  isLive: boolean;
  dataSource: 'BINANCE_PUBLIC_API' | 'SIMULATED_DEMO_DATA';
  lastSync: number;
  candlesCache: Record<string, Record<string, Candle[]>>; // assetId -> timeframe -> candles
}

export class MarketService {
  private state: MarketDataState = {
    isLive: false,
    dataSource: 'SIMULATED_DEMO_DATA',
    lastSync: Date.now(),
    candlesCache: {},
  };
  private pollInterval: NodeJS.Timeout | null = null;
  private tickInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initCandlesCache();
    this.startPolling();
    this.startTickSimulator();
  }

  private initCandlesCache() {
    const assets = db.get('assets');
    const now = Math.floor(Date.now() / 1000);

    for (const asset of assets) {
      this.state.candlesCache[asset.id] = {
        '1m': this.generateInitialCandles(asset.currentPrice, 60, now, 60),
        '5m': this.generateInitialCandles(asset.currentPrice, 60, now, 300),
        '15m': this.generateInitialCandles(asset.currentPrice, 60, now, 900),
      };
    }
  }

  private generateInitialCandles(basePrice: number, count: number, currentSec: number, intervalSec: number): Candle[] {
    const candles: Candle[] = [];
    let price = basePrice * (1 - (Math.random() * 0.02 - 0.01));

    for (let i = count - 1; i >= 0; i--) {
      const time = currentSec - i * intervalSec;
      const volatility = basePrice * 0.002;
      const change = (Math.random() - 0.49) * volatility;
      const open = price;
      const close = price + change;
      const high = Math.max(open, close) + Math.random() * volatility * 0.6;
      const low = Math.min(open, close) - Math.random() * volatility * 0.6;
      const volume = Math.floor(Math.random() * 50 + 10);

      candles.push({
        time,
        open: Number(open.toFixed(assetPriceDecimals(basePrice))),
        high: Number(high.toFixed(assetPriceDecimals(basePrice))),
        low: Number(low.toFixed(assetPriceDecimals(basePrice))),
        close: Number(close.toFixed(assetPriceDecimals(basePrice))),
        volume,
      });

      price = close;
    }

    return candles;
  }

  private async fetchBinancePrices(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch('https://api.binance.com/api/v3/ticker/24hr', {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`Binance API response status: ${res.status}`);
      }

      const tickerList: any[] = await res.json();
      const tickerMap = new Map<string, any>();
      for (const t of tickerList) {
        tickerMap.set(t.symbol, t);
      }

      const assets = [...db.get('assets')];
      let updatedCount = 0;

      for (let i = 0; i < assets.length; i++) {
        const asset = assets[i];
        const ticker = tickerMap.get(asset.binanceSymbol);
        if (ticker) {
          const newPrice = parseFloat(ticker.lastPrice);
          const change = parseFloat(ticker.priceChangePercent);
          const high = parseFloat(ticker.highPrice);
          const low = parseFloat(ticker.lowPrice);
          const vol = parseFloat(ticker.quoteVolume);

          assets[i] = {
            ...asset,
            currentPrice: newPrice,
            change24h: change,
            high24h: high,
            low24h: low,
            volume24h: vol,
            lastUpdated: new Date().toISOString(),
          };

          this.updateCandleWithTick(asset.id, newPrice);
          updatedCount++;
        }
      }

      if (updatedCount > 0) {
        db.update('assets', assets);
        this.state.isLive = true;
        this.state.dataSource = 'BINANCE_PUBLIC_API';
        this.state.lastSync = Date.now();
        return true;
      }
    } catch (err: any) {
      // Fallback to simulated mode if external connection is blocked or unavailable
      this.state.isLive = false;
      this.state.dataSource = 'SIMULATED_DEMO_DATA';
    }
    return false;
  }

  public async fetchHistoricalKlines(binanceSymbol: string, interval: string = '1m'): Promise<Candle[] | null> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const url = `https://api.binance.com/api/v3/klines?symbol=${encodeURIComponent(binanceSymbol)}&interval=${interval}&limit=100`;
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) return null;
      const rawKlines: any[] = await res.json();

      return rawKlines.map((k) => ({
        time: Math.floor(k[0] / 1000),
        open: parseFloat(k[1]),
        high: parseFloat(k[2]),
        low: parseFloat(k[3]),
        close: parseFloat(k[4]),
        volume: parseFloat(k[5]),
      }));
    } catch {
      return null;
    }
  }

  private startPolling() {
    this.fetchBinancePrices();
    this.pollInterval = setInterval(() => {
      this.fetchBinancePrices();
    }, 4000);
  }

  // Ticks every 1s to ensure real-time responsiveness and active trade resolution
  private startTickSimulator() {
    this.tickInterval = setInterval(() => {
      const assets = [...db.get('assets')];
      let changed = false;

      // If in simulated demo mode or between live updates, apply high-frequency micro-ticks
      for (let i = 0; i < assets.length; i++) {
        const asset = assets[i];
        if (!asset.enabled) continue;

        // Apply authentic micro-tick jitter: 0.03% std dev
        const volatility = asset.currentPrice * 0.0004;
        const tickDelta = (Math.random() - 0.495) * volatility;
        const newPrice = Number((asset.currentPrice + tickDelta).toFixed(assetPriceDecimals(asset.currentPrice)));

        if (newPrice !== asset.currentPrice && !this.state.isLive) {
          assets[i] = {
            ...asset,
            currentPrice: newPrice,
            lastUpdated: new Date().toISOString(),
          };
          changed = true;
        }

        this.updateCandleWithTick(asset.id, newPrice);
      }

      if (changed && !this.state.isLive) {
        db.update('assets', assets);
      }
    }, 1000);
  }

  private updateCandleWithTick(assetId: string, currentPrice: number) {
    if (!this.state.candlesCache[assetId]) {
      this.state.candlesCache[assetId] = {};
    }

    const intervals: Record<string, number> = {
      '1m': 60,
      '5m': 300,
      '15m': 900,
    };

    const nowSec = Math.floor(Date.now() / 1000);

    for (const [tf, sec] of Object.entries(intervals)) {
      let list = this.state.candlesCache[assetId][tf] || [];
      const bucketTime = Math.floor(nowSec / sec) * sec;

      if (list.length === 0) {
        list.push({
          time: bucketTime,
          open: currentPrice,
          high: currentPrice,
          low: currentPrice,
          close: currentPrice,
          volume: 1,
        });
      } else {
        const last = list[list.length - 1];
        if (last.time === bucketTime) {
          last.high = Math.max(last.high, currentPrice);
          last.low = Math.min(last.low, currentPrice);
          last.close = currentPrice;
          last.volume += 0.5;
        } else if (bucketTime > last.time) {
          list.push({
            time: bucketTime,
            open: currentPrice,
            high: currentPrice,
            low: currentPrice,
            close: currentPrice,
            volume: 1,
          });
          if (list.length > 200) {
            list = list.slice(-200);
          }
        }
      }
      this.state.candlesCache[assetId][tf] = list;
    }
  }

  public getCandles(assetId: string, timeframe: string = '1m'): Candle[] {
    const list = this.state.candlesCache[assetId]?.[timeframe];
    if (list && list.length > 0) {
      return list;
    }
    const asset = db.get('assets').find((a) => a.id === assetId);
    if (!asset) return [];
    return this.generateInitialCandles(asset.currentPrice, 50, Math.floor(Date.now() / 1000), 60);
  }

  public getMarketStatus() {
    return {
      isLive: this.state.isLive,
      dataSource: this.state.dataSource,
      lastSync: this.state.lastSync,
      assetsCount: db.get('assets').filter((a) => a.enabled).length,
    };
  }

  public getCurrentPrice(symbolOrId: string): number | null {
    const asset = db.get('assets').find(
      (a) => a.id.toLowerCase() === symbolOrId.toLowerCase() || a.symbol.toLowerCase() === symbolOrId.toLowerCase()
    );
    return asset ? asset.currentPrice : null;
  }
}

function assetPriceDecimals(price: number): number {
  if (price >= 1000) return 2;
  if (price >= 1) return 3;
  return 5;
}

export const marketService = new MarketService();
