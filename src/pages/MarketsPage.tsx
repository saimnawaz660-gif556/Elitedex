import React, { useState } from 'react';
import { useMarket } from '../context/MarketContext';
import { Asset } from '../types';
import { Search, ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';

export const MarketsPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const { assets, setSelectedAsset, marketStatus } = useMarket();
  const [search, setSearch] = useState('');

  const filtered = assets.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.symbol.toLowerCase().includes(search.toLowerCase()) ||
      a.pair.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 bg-slate-950 py-8 px-4 sm:px-6 max-w-7xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Binary Trading Markets</h1>
          <p className="text-xs text-slate-400 mt-1">
            Authoritative cryptocurrency price feeds for binary options predictions · Tick update: 1.0s
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search symbol or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500/60 font-mono"
          />
        </div>
      </div>

      {/* Feed Source Notice */}
      <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              marketStatus.isLive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
            }`}
          />
          <span className="text-slate-300">
            Feed Engine: <strong>{marketStatus.dataSource}</strong>
          </span>
        </div>
        <div className="text-slate-500 text-[11px]">
          {filtered.length} active binary market(s)
        </div>
      </div>

      {/* Markets Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 text-[10px] uppercase font-semibold tracking-wider">
              <th className="py-3.5 px-4">Asset</th>
              <th className="py-3.5 px-4">Current Price</th>
              <th className="py-3.5 px-4">24h Change</th>
              <th className="py-3.5 px-4 hidden md:table-cell">24h High</th>
              <th className="py-3.5 px-4 hidden md:table-cell">24h Low</th>
              <th className="py-3.5 px-4 hidden lg:table-cell">24h Volume</th>
              <th className="py-3.5 px-4">Binary Payout</th>
              <th className="py-3.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {filtered.map((asset) => {
              const isPositive = asset.change24h >= 0;
              return (
                <tr key={asset.id} className="hover:bg-slate-850/60 transition-colors">
                  <td className="py-3.5 px-4 font-sans">
                    <div className="flex items-center gap-3">
                      <img
                        src={asset.logo}
                        alt={asset.symbol}
                        className="w-6 h-6 rounded-full shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <div className="font-bold text-white text-xs">{asset.pair}</div>
                        <div className="text-[10px] text-slate-400 font-sans">{asset.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-100 font-bold tabular-nums">
                    ${asset.currentPrice.toLocaleString('en-US', {
                      minimumFractionDigits: asset.currentPrice < 1 ? 4 : 2,
                      maximumFractionDigits: asset.currentPrice < 1 ? 4 : 2,
                    })}
                  </td>
                  <td className="py-3.5 px-4 tabular-nums">
                    <span
                      className={`inline-flex items-center gap-0.5 font-bold ${
                        isPositive ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                      {Math.abs(asset.change24h).toFixed(2)}%
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 hidden md:table-cell tabular-nums">
                    ${asset.high24h.toLocaleString('en-US')}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 hidden md:table-cell tabular-nums">
                    ${asset.low24h.toLocaleString('en-US')}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 hidden lg:table-cell tabular-nums">
                    ${(asset.volume24h / 1e6).toFixed(1)}M
                  </td>
                  <td className="py-3.5 px-4 text-emerald-400 font-bold">
                    +{asset.payoutRate}%
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedAsset(asset);
                        onNavigate('/trade');
                      }}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg font-sans text-xs transition-colors cursor-pointer"
                    >
                      Trade
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
