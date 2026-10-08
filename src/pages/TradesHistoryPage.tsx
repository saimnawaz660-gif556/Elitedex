import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { BinaryTrade } from '../types';
import { TradeDetailsModal } from '../components/trade/TradeDetailsModal';
import {
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
} from 'lucide-react';

export const TradesHistoryPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const { user, token, isDemoMode } = useAuth();
  const [filter, setFilter] = useState<'all' | 'active' | 'won' | 'lost'>('all');
  const [trades, setTrades] = useState<BinaryTrade[]>([]);
  const [selectedTrade, setSelectedTrade] = useState<BinaryTrade | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    const fetchTrades = async () => {
      try {
        const res = await fetch(`/api/trades?status=${filter}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setTrades(data.trades || []);
        }
      } catch {
        // silent
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrades();
    const interval = setInterval(fetchTrades, 2500);
    return () => clearInterval(interval);
  }, [token, filter]);

  if (!user) {
    return (
      <div className="p-8 text-center text-slate-400">
        Please sign in to view your binary trades history.
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-950 py-8 px-4 sm:px-6 max-w-7xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">My Binary Trades</h1>
          <p className="text-xs text-slate-400 mt-1">
            Complete auditable ledger of all binary predictions and settlements.
          </p>
        </div>

        {/* Filter Segmented Control */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
          {(['all', 'active', 'won', 'lost'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-colors cursor-pointer ${
                filter === tab
                  ? 'bg-slate-800 text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Trades Table */}
      {trades.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-2xl space-y-3">
          <Clock className="w-8 h-8 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No trades found in this category</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Place your first market direction prediction in the trading room to view live results.
          </p>
          <button
            onClick={() => onNavigate('/trade')}
            className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs cursor-pointer"
          >
            Open Trading Room
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 text-[10px] uppercase font-semibold">
                <th className="py-3 px-4">Trade ID</th>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Market</th>
                <th className="py-3 px-4">Direction</th>
                <th className="py-3 px-4">Stake</th>
                <th className="py-3 px-4">Entry</th>
                <th className="py-3 px-4">Expiry</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Result</th>
                <th className="py-3 px-4">Payout</th>
                <th className="py-3 px-4 text-right">Settlement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {trades.map((t) => {
                const isWon = t.status === 'WON';
                const isLost = t.status === 'LOST';
                const isActive = t.status === 'ACTIVE';

                return (
                  <tr
                    key={t.id}
                    onClick={() => setSelectedTrade(t)}
                    className="hover:bg-slate-850/60 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4 text-slate-500">#{t.id}</td>
                    <td className="py-3 px-4 text-slate-400 font-sans text-[11px]">
                      {new Date(t.entryTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 font-sans font-bold text-white">{t.pair}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 font-bold ${
                          t.direction === 'UP' ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {t.direction === 'UP' ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />}
                        {t.direction}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-white font-semibold">${t.stake.toFixed(2)}</td>
                    <td className="py-3 px-4 text-slate-300">${t.entryPrice}</td>
                    <td className="py-3 px-4 text-slate-300 font-bold">
                      {t.expiryPrice ? `$${t.expiryPrice}` : 'In flight...'}
                    </td>
                    <td className="py-3 px-4 text-slate-400">{t.duration}s</td>
                    <td className="py-3 px-4 font-sans">
                      <span
                        className={`inline-flex items-center gap-1 font-bold ${
                          isWon
                            ? 'text-emerald-400'
                            : isLost
                            ? 'text-rose-400'
                            : 'text-amber-400'
                        }`}
                      >
                        {isWon ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : isLost ? (
                          <XCircle className="w-3.5 h-3.5" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 animate-spin" />
                        )}
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold">
                      {isWon ? (
                        <span className="text-emerald-400">+${t.actualPayout.toFixed(2)}</span>
                      ) : isLost ? (
                        <span className="text-slate-500">$0.00</span>
                      ) : (
                        <span className="text-slate-400">${t.potentialPayout.toFixed(2)} (est)</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-sans">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTrade(t);
                        }}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] cursor-pointer"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Trade Audit Record Modal */}
      <TradeDetailsModal
        trade={selectedTrade}
        onClose={() => setSelectedTrade(null)}
      />
    </div>
  );
};
