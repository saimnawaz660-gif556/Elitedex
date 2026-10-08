import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Asset, Candle, MarketStatus } from '../types';

interface MarketContextType {
  assets: Asset[];
  selectedAsset: Asset | null;
  setSelectedAsset: (asset: Asset) => void;
  marketStatus: MarketStatus;
  timeframe: '1m' | '5m' | '15m';
  setTimeframe: (tf: '1m' | '5m' | '15m') => void;
  chartType: 'candle' | 'line';
  setChartType: (ct: 'candle' | 'line') => void;
  candles: Candle[];
  isLoadingAssets: boolean;
  isLoadingCandles: boolean;
  refreshMarket: () => Promise<void>;
}

const defaultMarketStatus: MarketStatus = {
  isLive: false,
  dataSource: 'SIMULATED_DEMO_DATA',
  lastSync: Date.now(),
  assetsCount: 10,
};

const MarketContext = createContext<MarketContextType | undefined>(undefined);

export const MarketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [marketStatus, setMarketStatus] = useState<MarketStatus>(defaultMarketStatus);
  const [timeframe, setTimeframe] = useState<'1m' | '5m' | '15m'>('1m');
  const [chartType, setChartType] = useState<'candle' | 'line'>('candle');
  const [candles, setCandles] = useState<Candle[]>([]);
  const [isLoadingAssets, setIsLoadingAssets] = useState(true);
  const [isLoadingCandles, setIsLoadingCandles] = useState(false);

  const fetchAssets = useCallback(async () => {
    try {
      const res = await fetch('/api/market/assets');
      if (res.ok) {
        const data = await res.json();
        setAssets(data.assets || []);
        if (data.status) {
          setMarketStatus(data.status);
        }
        // If no asset selected yet, select BTC
        if (!selectedAsset && data.assets && data.assets.length > 0) {
          setSelectedAsset(data.assets[0]);
        } else if (selectedAsset) {
          const updated = data.assets.find((a: Asset) => a.id === selectedAsset.id);
          if (updated) setSelectedAsset(updated);
        }
      }
    } catch {
      // silent
    } finally {
      setIsLoadingAssets(false);
    }
  }, [selectedAsset]);

  const fetchCandles = useCallback(async (assetId: string, tf: string) => {
    try {
      const res = await fetch(`/api/market/candles?assetId=${encodeURIComponent(assetId)}&timeframe=${tf}`);
      if (res.ok) {
        const data = await res.json();
        setCandles(data.candles || []);
        if (data.marketStatus) {
          setMarketStatus(data.marketStatus);
        }
      }
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchAssets();
    const interval = setInterval(fetchAssets, 1500);
    return () => clearInterval(interval);
  }, [fetchAssets]);

  useEffect(() => {
    if (selectedAsset) {
      setIsLoadingCandles(true);
      fetchCandles(selectedAsset.id, timeframe).finally(() => setIsLoadingCandles(false));
      const interval = setInterval(() => {
        fetchCandles(selectedAsset.id, timeframe);
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [selectedAsset?.id, timeframe, fetchCandles]);

  return (
    <MarketContext.Provider
      value={{
        assets,
        selectedAsset,
        setSelectedAsset,
        marketStatus,
        timeframe,
        setTimeframe,
        chartType,
        setChartType,
        candles,
        isLoadingAssets,
        isLoadingCandles,
        refreshMarket: fetchAssets,
      }}
    >
      {children}
    </MarketContext.Provider>
  );
};

export const useMarket = () => {
  const ctx = useContext(MarketContext);
  if (!ctx) throw new Error('useMarket must be used inside MarketProvider');
  return ctx;
};
