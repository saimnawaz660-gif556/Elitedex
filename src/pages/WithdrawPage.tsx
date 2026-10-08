import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { WithdrawalRequest } from '../types';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  MinusCircle,
  ShieldAlert,
} from 'lucide-react';

export const WithdrawPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const { user, token, refreshUser } = useAuth();
  const [method, setMethod] = useState('USDT (TRC20)');
  const [amount, setAmount] = useState<number>(50);
  const [destinationAddress, setDestinationAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);

  useEffect(() => {
    if (!token) return;
    const fetchWithdrawals = async () => {
      try {
        const res = await fetch('/api/wallet/withdrawals', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setWithdrawals(data.withdrawals || []);
        }
      } catch {
        // silent
      }
    };
    fetchWithdrawals();
  }, [token]);

  if (!user) {
    return (
      <div className="p-8 text-center text-slate-400">
        Please sign in to access withdrawals.
      </div>
    );
  }

  const availableBalance = user.realBalance;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setErrorMsg(null);
    setSuccessMsg(null);

    if (amount < 20) {
      setErrorMsg('Minimum withdrawal amount is $20.00.');
      return;
    }

    if (amount > availableBalance) {
      setErrorMsg(`Insufficient available balance ($${availableBalance.toFixed(2)} available).`);
      return;
    }

    if (!destinationAddress.trim()) {
      setErrorMsg('Please specify your destination wallet address or IBAN account.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/wallet/withdrawals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          method,
          amount,
          destinationAddress: destinationAddress.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to submit withdrawal.');
        return;
      }

      setSuccessMsg(`Withdrawal request for $${amount.toFixed(2)} submitted successfully!`);
      setDestinationAddress('');
      setWithdrawals((prev) => [data.withdrawal, ...prev]);
      await refreshUser();
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 bg-slate-950 py-8 px-4 sm:px-6 max-w-7xl mx-auto w-full space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-2xl font-black text-white tracking-tight">Withdraw Funds</h1>
        <p className="text-xs text-slate-400 mt-1">
          Withdraw settled trading profits to your external crypto wallet or verified bank account.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form */}
        <div className="lg:col-span-7 space-y-6">
          {/* Available balance HUD */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-xs block font-medium">Available Cash Balance</span>
              <span className="text-2xl font-mono font-bold text-white tabular-nums">
                ${availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="text-right text-xs font-mono text-emerald-400">
              0% Processing Fee
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            {errorMsg && (
              <div className="p-3 bg-rose-950/60 border border-rose-500/40 text-rose-300 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Withdrawal Method</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-emerald-500/60"
              >
                <option value="USDT (TRC20)">USDT (TRON TRC20 Network)</option>
                <option value="Bitcoin (BTC)">Bitcoin Native Network</option>
                <option value="Ethereum (ETH)">Ethereum ERC20</option>
                <option value="Bank Wire">International Bank Wire (USD/EUR)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Amount ($ USD)</span>
                <span className="text-[11px] text-slate-500 font-mono">Min: $20.00</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold">$</span>
                <input
                  type="number"
                  min="20"
                  max={availableBalance}
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-2 text-xs font-mono font-bold text-white focus:outline-hidden focus:border-emerald-500/60"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Destination Address / IBAN</label>
              <input
                type="text"
                placeholder="e.g. T... or bc1... or GB29..."
                value={destinationAddress}
                onChange={(e) => setDestinationAddress(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-hidden focus:border-emerald-500/60"
                required
              />
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                Withdrawal requests undergo automated ledger verification. Once dispatched, blockchain transfers cannot be reversed.
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || availableBalance < 20}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              {isSubmitting ? 'Processing Request...' : 'Confirm & Submit Withdrawal'}
            </button>
          </form>
        </div>

        {/* Right Column: Withdrawal History */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-base font-bold text-white">Withdrawal History</h2>

          {withdrawals.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-2xl text-xs text-slate-500">
              No withdrawal requests submitted yet.
            </div>
          ) : (
            <div className="space-y-2.5">
              {withdrawals.map((w) => {
                const isCompleted = w.status === 'COMPLETED' || w.status === 'APPROVED';
                const isRejected = w.status === 'REJECTED';

                return (
                  <div
                    key={w.id}
                    className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2 text-xs font-mono"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm tabular-nums">${w.amount.toFixed(2)}</span>
                      <span
                        className={`inline-flex items-center gap-1 font-bold text-[11px] ${
                          isCompleted ? 'text-emerald-400' : isRejected ? 'text-rose-400' : 'text-amber-400'
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : isRejected ? <XCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                        {w.status}
                      </span>
                    </div>

                    <div className="text-slate-400 text-[11px] font-sans">
                      <div>Method: <strong className="text-slate-200">{w.method}</strong></div>
                      <div className="text-slate-500 truncate font-mono text-[10px] mt-0.5">
                        To: {w.destinationAddress}
                      </div>
                    </div>

                    {w.adminNote && (
                      <div className="text-[10px] text-slate-400 bg-slate-950 p-2 rounded border border-slate-800 font-sans">
                        Admin Note: {w.adminNote}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
