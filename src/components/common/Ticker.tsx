import React from 'react';
import { useMarket } from '../../context/MarketContext';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const Ticker: React.FC<{ onSelectAsset?: (symbol: string) => void }> = ({ onSelectAsset }) => {
  const { assets, marketStatus } = useMarket();

  if (!assets || assets.length === 0) return null;

  // Duplicate list to create a seamless infinite loop
  const tickerItems = [...assets, ...assets];

  return (
    <div className="w-full bg-slate-900/90 border-y border-slate-800/80 overflow-hidden select-none py-2 backdrop-blur-sm">
      <div className="flex items-center">
        {/* Market feed indicator tag */}
        <div className="shrink-0 px-3 py-0.5 ml-3 mr-1 bg-slate-800 border border-slate-700/60 rounded text-[11px] font-medium text-slate-300 flex items-center gap-1.5 z-10 shadow-xs">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              marketStatus.isLive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
            }`}
          />
          <span className="tabular-nums font-mono">
            {marketStatus.isLive ? 'LIVE' : 'DEMO'} FEED
          </span>
        </div>

        {/* Scrolling tape */}
        <div className="ticker-track flex items-center gap-6 whitespace-nowrap overflow-x-hidden">
          <div className="flex items-center gap-6 animate-ticker hover:[animation-play-state:paused]">
            {tickerItems.map((asset, idx) => {
              const isPositive = asset.change24h >= 0;
              return (
                <button
                  key={`${asset.id}-${idx}`}
                  onClick={() => onSelectAsset?.(asset.id)}
                  className="inline-flex items-center gap-2 px-2.5 py-1 rounded hover:bg-slate-800/70 transition-colors text-xs text-left cursor-pointer group"
                >
                  <img
                    src={asset.logo}
                    alt={asset.symbol}
                    className="w-4 h-4 rounded-full shrink-0"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <span className="font-semibold text-slate-200 group-hover:text-emerald-400 transition-colors">
                    {asset.pair}
                  </span>
                  <span className="font-mono tabular-nums text-slate-300">
                    ${asset.currentPrice.toLocaleString('en-US', {
                      minimumFractionDigits: asset.currentPrice < 1 ? 4 : 2,
                      maximumFractionDigits: asset.currentPrice < 1 ? 4 : 2,
                    })}
                  </span>
                  <span
                    className={`inline-flex items-center text-[11px] font-medium font-mono tabular-nums ${
                      isPositive ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isPositive ? (
                      <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3 stroke-[2.5]" />
                    )}
                    {Math.abs(asset.change24h).toFixed(2)}%
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {asset.payoutRate}%
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
