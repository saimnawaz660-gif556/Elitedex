import React, { useState } from 'react';
import { useMarket } from '../../context/MarketContext';
import { useAuth } from '../../context/AuthContext';
import { TradeDirection, BinaryTrade } from '../../types';
import {
  ArrowUp,
  ArrowDown,
  Clock,
  DollarSign,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  Lock,
} from 'lucide-react';

export const TradePanel: React.FC<{ onTradeCreated?: (trade: BinaryTrade) => void }> = ({ onTradeCreated }) => {
  const { selectedAsset, marketStatus } = useMarket();
  const { user, token, isDemoMode, updateUserBalance } = useAuth();

  const [stake, setStake] = useState<number>(50);
  const [duration, setDuration] = useState<number>(60); // 60 seconds
  const [selectedDirection, setSelectedDirection] = useState<TradeDirection>('UP');
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!selectedAsset) return null;

  const payoutRate = selectedAsset.payoutRate || 88;
  const profitAmount = Number(((stake * payoutRate) / 100).toFixed(2));
  const potentialPayout = Number((stake + profitAmount).toFixed(2));

  const availableBalance = user ? (isDemoMode ? user.demoBalance : user.realBalance) : 0;

  const durationOptions = [
    { label: '30s', seconds: 30 },
    { label: '1m', seconds: 60 },
    { label: '2m', seconds: 120 },
    { label: '5m', seconds: 300 },
    { label: '15m', seconds: 900 },
  ];

  const quickStakes = [10, 25, 50, 100, 250, 500];

  const handleOpenConfirm = (direction: TradeDirection) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    if (!user) {
      setErrorMessage('Please sign in or register to place binary trades.');
      return;
    }
    if (stake <= 0) {
      setErrorMessage('Please specify a trade amount greater than $0.');
      return;
    }
    if (stake > availableBalance) {
      setErrorMessage(`Insufficient ${isDemoMode ? 'Demo' : 'Real'} balance ($${availableBalance.toFixed(2)} available).`);
      return;
    }
    setSelectedDirection(direction);
    setShowConfirmModal(true);
  };

  const handleExecuteTrade = async () => {
    if (!user || !token || !selectedAsset) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/trades', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          assetId: selectedAsset.id,
          direction: selectedDirection,
          stake,
          duration,
          isDemo: isDemoMode,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to place binary trade.');
        setShowConfirmModal(false);
        return;
      }

      if (data.user) {
        updateUserBalance(data.user.realBalance, data.user.demoBalance, data.user.lockedBalance);
      }

      setShowConfirmModal(false);
      setSuccessMessage(
        `Trade locked! Predict ${selectedDirection} on ${selectedAsset.pair} @ ${data.trade.entryPrice}. Expiry in ${duration}s.`
      );
      if (onTradeCreated && data.trade) {
        onTradeCreated(data.trade);
      }

      // Auto clear message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error.');
      setShowConfirmModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col gap-4 text-xs select-none">
      {/* Top Header: Market Details */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div>
          <div className="text-[11px] text-slate-400 font-medium">Binary Options Order</div>
          <div className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
            <span>{selectedAsset.pair}</span>
            <span className="text-emerald-400 font-mono text-xs">{selectedAsset.payoutRate}% Profit</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-slate-500 font-mono">
            {isDemoMode ? 'DEMO ACCOUNT' : 'REAL ACCOUNT'}
          </div>
          <div className="text-xs font-mono font-bold text-slate-200 tabular-nums">
            ${availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Notifications / Errors */}
      {errorMessage && (
        <div className="p-2.5 bg-rose-950/60 border border-rose-500/40 text-rose-300 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="leading-snug">{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-2.5 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 rounded-lg flex items-start gap-2">
          <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="leading-snug">{successMessage}</span>
        </div>
      )}

      {/* 1. Duration Selector */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" /> Duration / Expiry
          </span>
          <span className="font-mono text-slate-300">{duration} seconds</span>
        </label>
        <div className="grid grid-cols-5 gap-1.5">
          {durationOptions.map((opt) => (
            <button
              key={opt.seconds}
              type="button"
              onClick={() => setDuration(opt.seconds)}
              className={`py-2 text-center rounded-lg font-mono font-medium text-xs transition-all cursor-pointer ${
                duration === opt.seconds
                  ? 'bg-slate-800 text-emerald-400 border border-emerald-500/40 font-semibold shadow-xs'
                  : 'bg-slate-900 text-slate-400 border border-slate-800/80 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Trade Amount Input & Quick Adjustments */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-slate-400" /> Trade Stake Amount
          </span>
          <span className="font-mono text-slate-400">Min $5 · Max $5,000</span>
        </label>

        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg overflow-hidden focus-within:border-emerald-500/60 transition-colors">
          <button
            type="button"
            onClick={() => setStake((s) => Math.max(5, s - 10))}
            className="px-3.5 py-2.5 text-slate-400 hover:text-white hover:bg-slate-800 font-mono font-bold text-sm cursor-pointer"
          >
            -
          </button>
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-medium">$</span>
            <input
              type="number"
              min="5"
              max="5000"
              value={stake}
              onChange={(e) => setStake(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full bg-transparent pl-7 pr-3 py-2 text-center font-mono font-bold text-sm text-white focus:outline-hidden"
            />
          </div>
          <button
            type="button"
            onClick={() => setStake((s) => s + 10)}
            className="px-3.5 py-2.5 text-slate-400 hover:text-white hover:bg-slate-800 font-mono font-bold text-sm cursor-pointer"
          >
            +
          </button>
        </div>

        {/* Quick Amount Chips */}
        <div className="grid grid-cols-6 gap-1 pt-1">
          {quickStakes.map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => setStake(amt)}
              className={`py-1 text-center font-mono text-[10px] rounded transition-colors cursor-pointer ${
                stake === amt
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              ${amt}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Payout and Profit Estimation Card */}
      <div className="p-3 bg-slate-900/80 border border-slate-800/80 rounded-xl space-y-1.5">
        <div className="flex items-center justify-between text-slate-400">
          <span>Profit Return:</span>
          <span className="font-mono font-semibold text-emerald-400">+{payoutRate}%</span>
        </div>
        <div className="flex items-center justify-between text-slate-400">
          <span>Net Profit:</span>
          <span className="font-mono text-emerald-400 tabular-nums">+${profitAmount.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between pt-1.5 border-t border-slate-800/80 font-medium">
          <span className="text-white">Total Payout:</span>
          <span className="font-mono text-sm font-bold text-white tabular-nums">${potentialPayout.toFixed(2)}</span>
        </div>
      </div>

      {/* 4. Binary Direction Buttons (UP / DOWN) */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        {/* UP Button */}
        <button
          type="button"
          onClick={() => handleOpenConfirm('UP')}
          className="flex flex-col items-center justify-center gap-1 py-3.5 px-4 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white shadow-lg shadow-emerald-950/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-1.5 text-base tracking-wide font-black">
            <ArrowUp className="w-5 h-5 stroke-[3] group-hover:-translate-y-0.5 transition-transform" />
            <span>UP</span>
          </div>
          <span className="text-[10px] text-emerald-100 font-mono font-medium">
            Payout ${potentialPayout.toFixed(2)}
          </span>
        </button>

        {/* DOWN Button */}
        <button
          type="button"
          onClick={() => handleOpenConfirm('DOWN')}
          className="flex flex-col items-center justify-center gap-1 py-3.5 px-4 rounded-xl font-bold bg-rose-600 hover:bg-rose-500 active:scale-[0.98] text-white shadow-lg shadow-rose-950/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-1.5 text-base tracking-wide font-black">
            <ArrowDown className="w-5 h-5 stroke-[3] group-hover:translate-y-0.5 transition-transform" />
            <span>DOWN</span>
          </div>
          <span className="text-[10px] text-rose-100 font-mono font-medium">
            Payout ${potentialPayout.toFixed(2)}
          </span>
        </button>
      </div>

      {/* Deterministic Settlement Footnote */}
      <div className="text-[10px] text-slate-500 text-center flex items-center justify-center gap-1 pt-1">
        <Lock className="w-3 h-3 text-slate-600" />
        <span>Price captured instantaneously upon trade acceptance.</span>
      </div>

      {/* Pre-Trade Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    selectedDirection === 'UP' ? 'bg-emerald-400' : 'bg-rose-400'
                  }`}
                />
                Confirm Binary Trade
              </h3>
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Market:</span>
                <span className="font-semibold text-white">{selectedAsset.pair}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Predicted Direction:</span>
                <span
                  className={`font-bold font-mono ${
                    selectedDirection === 'UP' ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {selectedDirection === 'UP' ? '▲ UP (Price Higher)' : '▼ DOWN (Price Lower)'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Current Indicative Price:</span>
                <span className="font-mono font-bold text-white tabular-nums">${selectedAsset.currentPrice}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Stake Amount:</span>
                <span className="font-mono font-semibold text-white">${stake.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Duration:</span>
                <span className="font-mono text-slate-200">{duration} seconds</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Potential Payout:</span>
                <span className="font-mono font-bold text-emerald-400">${potentialPayout.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Account Type:</span>
                <span className="font-mono text-slate-300">{isDemoMode ? 'Practice Demo' : 'Real Balance'}</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 bg-slate-950 p-2.5 rounded-lg leading-relaxed">
              <strong>Tie Policy:</strong> If the settlement price exactly equals the entry price at expiry, 100% of the trade stake is refunded. Once confirmed, this binary contract cannot be altered or cancelled.
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="w-1/2 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleExecuteTrade}
                className={`w-1/2 py-2.5 rounded-lg text-white font-bold cursor-pointer transition-colors ${
                  selectedDirection === 'UP'
                    ? 'bg-emerald-600 hover:bg-emerald-500'
                    : 'bg-rose-600 hover:bg-rose-500'
                }`}
              >
                {isSubmitting ? 'Locking...' : 'Lock Trade'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
