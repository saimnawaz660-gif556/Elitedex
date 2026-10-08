import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMarket } from '../context/MarketContext';
import { BinaryTrade } from '../types';
import { TradeDetailsModal } from '../components/trade/TradeDetailsModal';
import {
  Wallet,
  TrendingUp,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  XCircle,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';

export const DashboardPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const { user, token, isDemoMode, toggleDemoMode, resetDemoBalance, activeTrades } = useAuth();
  const { assets, setSelectedAsset } = useMarket();

  const [tradesHistory, setTradesHistory] = useState<BinaryTrade[]>([]);
  const [selectedTrade, setSelectedTrade] = useState<BinaryTrade | null>(null);

  useEffect(() => {
    if (!token) return;
    const fetchTrades = async () => {
      try {
        const res = await fetch('/api/trades?status=all', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setTradesHistory(data.trades || []);
        }
      } catch {
        // silent
      }
    };
    fetchTrades();
    const interval = setInterval(fetchTrades, 3000);
    return () => clearInterval(interval);
  }, [token]);

  if (!user) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-400">Please sign in to view your dashboard.</p>
        <button
          onClick={() => onNavigate('/login')}
          className="mt-4 px-4 py-2 bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs"
        >
          Sign In
        </button>
      </div>
    );
  }

  const completedTrades = tradesHistory.filter((t) => t.status !== 'ACTIVE');
  const winningTrades = completedTrades.filter((t) => t.status === 'WON');
  const losingTrades = completedTrades.filter((t) => t.status === 'LOST');
  const winRate = completedTrades.length > 0 ? ((winningTrades.length / completedTrades.length) * 100).toFixed(1) : '0.0';

  const availableBalance = isDemoMode ? user.demoBalance : user.realBalance;

  return (
    <div className="flex-1 bg-slate-950 py-8 px-4 sm:px-6 max-w-7xl mx-auto w-full space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Trader Dashboard</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Welcome back, <strong className="text-slate-200">{user.name}</strong> · Real-time portfolio overview
          </p>
        </div>

        {/* Account Mode Switcher */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs font-mono">
            <button
              onClick={() => toggleDemoMode(true)}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                isDemoMode
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              DEMO ACCOUNT
            </button>
            <button
              onClick={() => toggleDemoMode(false)}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                !isDemoMode
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              REAL ACCOUNT
            </button>
          </div>

          {isDemoMode && (
            <button
              onClick={() => resetDemoBalance()}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 rounded-xl text-xs font-mono cursor-pointer transition-colors"
              title="Reset Demo Balance to $10,000"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Reset Demo</span>
            </button>
          )}
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Available Balance */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            {isDemoMode ? 'Demo Balance' : 'Available Balance'}
          </span>
          <div className="text-xl font-bold font-mono text-white tabular-nums">
            ${availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-emerald-400 font-mono">
            {isDemoMode ? 'Simulated practice' : 'Ready for withdrawal'}
          </div>
        </div>

        {/* Locked In Trades */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            Locked in Trade
          </span>
          <div className="text-xl font-bold font-mono text-amber-400 tabular-nums">
            ${user.lockedBalance.toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            {activeTrades.length} Active prediction(s)
          </div>
        </div>

        {/* Total Trades */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            Total Trades
          </span>
          <div className="text-xl font-bold font-mono text-white tabular-nums">
            {completedTrades.length}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            Settled deterministically
          </div>
        </div>

        {/* Winning Trades */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            Winning Trades
          </span>
          <div className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
            {winningTrades.length}
          </div>
          <div className="text-[10px] text-emerald-400/80 font-mono">
            {winRate}% Win Rate
          </div>
        </div>

        {/* Losing Trades */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            Losing Trades
          </span>
          <div className="text-xl font-bold font-mono text-rose-400 tabular-nums">
            {losingTrades.length}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            Standard loss cutoff
          </div>
        </div>
      </div>

      {/* Live Market Cards Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white">Live Binary Markets</h2>
          <button
            onClick={() => onNavigate('/markets')}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span>All Markets</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {assets.slice(0, 4).map((asset) => {
            const isPositive = asset.change24h >= 0;
            return (
              <div
                key={asset.id}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={asset.logo}
                      alt={asset.symbol}
                      className="w-6 h-6 rounded-full"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="font-bold text-white text-xs">{asset.pair}</div>
                      <div className="text-[10px] text-slate-400">{asset.name}</div>
                    </div>
                  </div>
                  <span className="text-emerald-400 font-mono text-xs font-bold bg-emerald-950/40 px-1.5 py-0.5 rounded">
                    {asset.payoutRate}%
                  </span>
                </div>

                <div className="flex items-baseline justify-between font-mono">
                  <span className="text-base font-bold text-white tabular-nums">
                    ${asset.currentPrice.toLocaleString('en-US', {
                      minimumFractionDigits: asset.currentPrice < 1 ? 4 : 2,
                      maximumFractionDigits: asset.currentPrice < 1 ? 4 : 2,
                    })}
                  </span>
                  <span
                    className={`text-xs font-semibold flex items-center gap-0.5 tabular-nums ${
                      isPositive ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {Math.abs(asset.change24h).toFixed(2)}%
                  </span>
                </div>

                <button
                  onClick={() => {
                    setSelectedAsset(asset);
                    onNavigate('/trade');
                  }}
                  className="w-full py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border border-emerald-500/30 font-bold text-xs transition-colors cursor-pointer"
                >
                  Trade Binary
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Trades Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>Open & Active Predictions</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-xs">
              {activeTrades.length}
            </span>
          </h2>
        </div>

        {activeTrades.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-xl space-y-2">
            <Clock className="w-6 h-6 mx-auto text-slate-600" />
            <p className="text-xs text-slate-400">No binary predictions currently active.</p>
            <button
              onClick={() => onNavigate('/trade')}
              className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-lg cursor-pointer"
            >
              Place a Binary Trade
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-[10px] uppercase font-semibold">
                  <th className="py-3 px-4">Market</th>
                  <th className="py-3 px-4">Direction</th>
                  <th className="py-3 px-4">Stake</th>
                  <th className="py-3 px-4">Entry Price</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Countdown</th>
                  <th className="py-3 px-4">Potential Payout</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {activeTrades.map((t) => {
                  const isUp = t.direction === 'UP';
                  const remainingSec = Math.max(0, Math.ceil((t.expiryTimestamp - Date.now()) / 1000));

                  return (
                    <tr key={t.id} className="hover:bg-slate-850/50">
                      <td className="py-3 px-4 font-sans font-bold text-white">{t.pair}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 font-bold ${
                            isUp ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {isUp ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />}
                          {t.direction}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-white">${t.stake.toFixed(2)}</td>
                      <td className="py-3 px-4 text-slate-300">${t.entryPrice}</td>
                      <td className="py-3 px-4 text-slate-400">{t.duration}s</td>
                      <td className="py-3 px-4 text-amber-400 font-bold">{remainingSec}s</td>
                      <td className="py-3 px-4 text-emerald-400 font-bold">${t.potentialPayout.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedTrade(t)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer font-sans text-xs"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Settled Trades */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white">Recent Settled Trades</h2>
          <button
            onClick={() => onNavigate('/trades')}
            className="text-xs text-slate-400 hover:text-white cursor-pointer"
          >
            View Full History →
          </button>
        </div>

        {completedTrades.length === 0 ? (
          <div className="p-6 text-center bg-slate-900/40 border border-slate-800 rounded-xl text-xs text-slate-500">
            No completed trades recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-[10px] uppercase font-semibold">
                  <th className="py-3 px-4">Trade ID</th>
                  <th className="py-3 px-4">Market</th>
                  <th className="py-3 px-4">Direction</th>
                  <th className="py-3 px-4">Stake</th>
                  <th className="py-3 px-4">Entry</th>
                  <th className="py-3 px-4">Expiry</th>
                  <th className="py-3 px-4">Result</th>
                  <th className="py-3 px-4">Payout</th>
                  <th className="py-3 px-4 text-right">Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {completedTrades.slice(0, 5).map((t) => {
                  const isWon = t.status === 'WON';
                  return (
                    <tr key={t.id} className="hover:bg-slate-850/50">
                      <td className="py-3 px-4 text-slate-500">#{t.id}</td>
                      <td className="py-3 px-4 font-sans font-bold text-white">{t.pair}</td>
                      <td className="py-3 px-4">
                        <span className={t.direction === 'UP' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                          {t.direction}
                        </span>
                      </td>
                      <td className="py-3 px-4">${t.stake.toFixed(2)}</td>
                      <td className="py-3 px-4 text-slate-400">${t.entryPrice}</td>
                      <td className="py-3 px-4 text-slate-300 font-bold">${t.expiryPrice}</td>
                      <td className="py-3 px-4 font-sans">
                        <span
                          className={`inline-flex items-center gap-1 font-bold ${
                            isWon ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {isWon ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                          {t.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold">
                        <span className={isWon ? 'text-emerald-400' : 'text-slate-500'}>
                          {isWon ? `+$${t.actualPayout.toFixed(2)}` : '$0.00'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-sans">
                        <button
                          onClick={() => setSelectedTrade(t)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                        >
                          Audit Record
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Trade Audit Record Modal */}
      <TradeDetailsModal
        trade={selectedTrade}
        onClose={() => setSelectedTrade(null)}
      />
    </div>
  );
};
