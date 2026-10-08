import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMarket } from '../../context/MarketContext';
import { BinaryTrade } from '../../types';
import { ArrowUp, ArrowDown, Clock, CheckCircle2, XCircle } from 'lucide-react';

export const ActiveTradesList: React.FC<{ onSelectTrade?: (trade: BinaryTrade) => void }> = ({ onSelectTrade }) => {
  const { activeTrades, token } = useAuth();
  const { assets } = useMarket();
  const [recentCompletedTrades, setRecentCompletedTrades] = useState<BinaryTrade[]>([]);
  const [, setTicker] = useState(0);

  // Force tick every 1000ms for smooth live countdown display
  useEffect(() => {
    const timer = setInterval(() => setTicker((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch recently settled trades
  useEffect(() => {
    if (!token) return;
    const fetchRecent = async () => {
      try {
        const res = await fetch('/api/trades?status=all', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const closed = (data.trades || []).filter((t: BinaryTrade) => t.status !== 'ACTIVE').slice(0, 5);
          setRecentCompletedTrades(closed);
        }
      } catch {
        // silent
      }
    };
    fetchRecent();
    const interval = setInterval(fetchRecent, 2000);
    return () => clearInterval(interval);
  }, [token]);

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="font-bold text-white flex items-center gap-2">
          <span>Active Predictions</span>
          <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[11px]">
            {activeTrades.length}
          </span>
        </div>
      </div>

      {/* Active Trades */}
      {activeTrades.length === 0 ? (
        <div className="py-6 text-center text-slate-500 space-y-1">
          <Clock className="w-5 h-5 mx-auto text-slate-600 mb-1" />
          <p className="font-medium text-slate-400">No active trades open</p>
          <p className="text-[11px]">Select UP or DOWN to place a binary trade</p>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {activeTrades.map((trade) => {
            const asset = assets.find((a) => a.id === trade.assetId || a.symbol === trade.symbol);
            const currentPrice = asset ? asset.currentPrice : trade.entryPrice;

            const isUp = trade.direction === 'UP';
            const isInTheMoney = isUp ? currentPrice > trade.entryPrice : currentPrice < trade.entryPrice;
            const remainingSec = Math.max(0, Math.ceil((trade.expiryTimestamp - Date.now()) / 1000));
            const progressPct = Math.min(100, Math.max(0, ((trade.duration - remainingSec) / trade.duration) * 100));

            return (
              <div
                key={trade.id}
                onClick={() => onSelectTrade?.(trade)}
                className="p-3 bg-slate-900 border border-slate-800 rounded-lg hover:border-slate-700 transition-colors cursor-pointer space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold font-mono ${
                        isUp ? 'bg-emerald-950/80 text-emerald-300' : 'bg-rose-950/80 text-rose-300'
                      }`}
                    >
                      {isUp ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                      {trade.direction}
                    </span>
                    <span className="font-bold text-white text-xs">{trade.pair}</span>
                    <span className="text-[10px] text-slate-500 font-mono">#{trade.id}</span>
                  </div>

                  <div className="text-right">
                    <div className="font-mono font-bold text-white tabular-nums">${trade.stake.toFixed(2)}</div>
                    <div className="text-[10px] text-emerald-400 font-mono">
                      Pay: ${trade.potentialPayout.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-800/60 font-mono">
                  <div>
                    <span className="text-slate-500">Entry: </span>
                    <span className="text-slate-300 tabular-nums">${trade.entryPrice}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500">Live: </span>
                    <span
                      className={`font-semibold tabular-nums ${
                        isInTheMoney ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      ${currentPrice}
                    </span>
                  </div>
                </div>

                {/* Countdown & Progress bar */}
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className={isInTheMoney ? 'text-emerald-400' : 'text-rose-400'}>
                      {isInTheMoney ? 'In The Money' : 'Out Of The Money'}
                    </span>
                    <span className="text-amber-400 font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {remainingSec}s remaining
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 transition-all duration-500"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Recent Settled Trades Accordion / List */}
      {recentCompletedTrades.length > 0 && (
        <div className="pt-2 border-t border-slate-800 space-y-2">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Latest Settled Trades
          </div>
          <div className="space-y-1.5">
            {recentCompletedTrades.map((t) => (
              <div
                key={t.id}
                onClick={() => onSelectTrade?.(t)}
                className="flex items-center justify-between p-2 rounded bg-slate-900/60 border border-slate-800/60 hover:bg-slate-900 transition-colors cursor-pointer text-[11px]"
              >
                <div className="flex items-center gap-1.5 font-mono">
                  {t.status === 'WON' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-rose-400" />
                  )}
                  <span className="font-semibold text-slate-200">{t.pair}</span>
                  <span className={t.direction === 'UP' ? 'text-emerald-400' : 'text-rose-400'}>
                    {t.direction}
                  </span>
                </div>
                <div className="text-right font-mono">
                  <span
                    className={`font-bold tabular-nums ${
                      t.status === 'WON' ? 'text-emerald-400' : 'text-slate-400'
                    }`}
                  >
                    {t.status === 'WON' ? `+$${t.actualPayout.toFixed(2)}` : `-$${t.stake.toFixed(2)}`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
