import React, { useState } from 'react';
import { useMarket } from '../context/MarketContext';
import { useAuth } from '../context/AuthContext';
import { TradingChart } from '../components/chart/TradingChart';
import { TradePanel } from '../components/trade/TradePanel';
import { ActiveTradesList } from '../components/trade/ActiveTradesList';
import { TradeDetailsModal } from '../components/trade/TradeDetailsModal';
import { BinaryTrade } from '../types';
import { ArrowUpRight, ArrowDownRight, Search, ShieldCheck } from 'lucide-react';

export const TradingPage: React.FC = () => {
  const { assets, selectedAsset, setSelectedAsset, marketStatus } = useMarket();
  const { user, isDemoMode } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTradeForModal, setSelectedTradeForModal] = useState<BinaryTrade | null>(null);

  const filteredAssets = assets.filter(
    (a) =>
      a.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.pair.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col bg-[#070b13] min-h-[calc(100vh-4rem)]">
      {/* Top Banner Alert for Demo Mode if enabled */}
      {isDemoMode && (
        <div className="bg-amber-950/40 border-b border-amber-500/20 px-4 py-1.5 flex items-center justify-between text-[11px] text-amber-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>
              <strong>PRACTICE DEMO MODE:</strong> Trading with simulated funds ($
              {user?.demoBalance.toFixed(2) || '10,000.00'}). Real balance is untouched.
            </span>
          </div>
          <div className="text-[10px] font-mono text-amber-400/80">
            Feed: {marketStatus.dataSource}
          </div>
        </div>
      )}

      {/* Main 3-Column Trading Room Grid */}
      <div className="flex-1 p-3 grid grid-cols-1 lg:grid-cols-12 gap-3 max-w-[1720px] mx-auto w-full">
        {/* LEFT COLUMN: Asset Selector & Watchlist (2 or 3 cols on desktop) */}
        <div className="lg:col-span-3 xl:col-span-2.5 flex flex-col bg-slate-950 border border-slate-800 rounded-xl overflow-hidden min-h-[400px] lg:min-h-0">
          {/* Search Header */}
          <div className="p-3 border-b border-slate-800/80 space-y-2 bg-slate-900/60">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-xs uppercase tracking-wider">Markets</span>
              <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                {assets.filter((a) => a.enabled).length} Active
              </span>
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search asset..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-slate-700 font-mono"
              />
            </div>
          </div>

          {/* Asset Rows */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-900 p-1">
            {filteredAssets.map((asset) => {
              const isSelected = selectedAsset?.id === asset.id;
              const isPositive = asset.change24h >= 0;

              return (
                <button
                  key={asset.id}
                  onClick={() => setSelectedAsset(asset)}
                  className={`w-full p-2.5 rounded-lg flex items-center justify-between text-left transition-colors cursor-pointer group ${
                    isSelected
                      ? 'bg-slate-850 border border-slate-700/80 shadow-xs'
                      : 'hover:bg-slate-900 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={asset.logo}
                      alt={asset.symbol}
                      className="w-5 h-5 rounded-full shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="font-bold text-xs text-white group-hover:text-emerald-400 transition-colors">
                        {asset.pair}
                      </div>
                      <div className="text-[10px] text-slate-400 font-sans">{asset.name}</div>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <div className="text-xs font-bold text-slate-200 tabular-nums">
                      ${asset.currentPrice.toLocaleString('en-US', {
                        minimumFractionDigits: asset.currentPrice < 1 ? 4 : 2,
                        maximumFractionDigits: asset.currentPrice < 1 ? 4 : 2,
                      })}
                    </div>
                    <div
                      className={`text-[10px] flex items-center justify-end font-semibold tabular-nums ${
                        isPositive ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {Math.abs(asset.change24h).toFixed(2)}%
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer note */}
          <div className="p-2.5 border-t border-slate-900 bg-slate-950/80 text-[10px] text-slate-500 text-center">
            Zero spread · Instant tick capture
          </div>
        </div>

        {/* CENTER COLUMN: Live Candlestick & Line Chart (Main Area) */}
        <div className="lg:col-span-6 xl:col-span-6 flex flex-col min-h-[480px]">
          <TradingChart />
        </div>

        {/* RIGHT COLUMN: Binary Order Panel & Active Trades */}
        <div className="lg:col-span-3 xl:col-span-3.5 flex flex-col gap-3">
          <TradePanel
            onTradeCreated={() => {
              // auto updates
            }}
          />
          <ActiveTradesList onSelectTrade={(t) => setSelectedTradeForModal(t)} />
        </div>
      </div>

      {/* Trade Audit Details Modal */}
      <TradeDetailsModal
        trade={selectedTradeForModal}
        onClose={() => setSelectedTradeForModal(null)}
      />
    </div>
  );
};
