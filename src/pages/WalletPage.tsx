import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  ShieldCheck,
  RefreshCw,
  PlusCircle,
  MinusCircle,
} from 'lucide-react';

export const WalletPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const { user, token, isDemoMode, toggleDemoMode } = useAuth();
  const [walletStats, setWalletStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    const fetchWallet = async () => {
      try {
        const res = await fetch('/api/wallet', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setWalletStats(data);
        }
      } catch {
        // silent
      } finally {
        setIsLoading(false);
      }
    };
    fetchWallet();
  }, [token]);

  if (!user) {
    return (
      <div className="p-8 text-center text-slate-400">
        Please sign in to view your wallet balance.
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-950 py-8 px-4 sm:px-6 max-w-7xl mx-auto w-full space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Custody Wallet & Balances</h1>
          <p className="text-xs text-slate-400 mt-1">
            Server-authoritative funds management, verified deposits, and withdrawal processing.
          </p>
        </div>

        {/* Quick Deposit & Withdraw Action CTAs */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('/deposit')}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Deposit Funds</span>
          </button>
          <button
            onClick={() => onNavigate('/withdraw')}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
          >
            <MinusCircle className="w-4 h-4 text-amber-400" />
            <span>Withdraw Funds</span>
          </button>
        </div>
      </div>

      {/* Main Balances Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Real Balance Card */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Real Cash Balance
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[11px] font-bold">
              USD
            </span>
          </div>

          <div>
            <div className="text-3xl font-black font-mono text-white tabular-nums tracking-tight">
              ${user.realBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Available for live binary predictions & withdrawal
            </p>
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-500">Locked in open trades:</span>
            <span className="font-mono font-bold text-amber-400">${user.lockedBalance.toFixed(2)}</span>
          </div>
        </div>

        {/* Demo Balance Card */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Practice Demo Balance
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono text-[11px] font-bold">
              SIMULATED
            </span>
          </div>

          <div>
            <div className="text-3xl font-black font-mono text-amber-300 tabular-nums tracking-tight">
              ${user.demoBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Zero-risk training capital with instant replenishment
            </p>
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-500">Current Mode:</span>
            <span className="font-mono font-bold text-slate-300">{isDemoMode ? 'Active (Demo)' : 'Inactive'}</span>
          </div>
        </div>

        {/* Total Lifetime PnL & Stats */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Lifetime Trading Return
          </span>

          <div>
            <div
              className={`text-3xl font-black font-mono tabular-nums tracking-tight ${
                (walletStats?.totalPnl || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {(walletStats?.totalPnl || 0) >= 0 ? '+' : ''}$
              {(walletStats?.totalPnl || 0).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Net binary profit settled against verified market ticks
            </p>
          </div>

          <div className="pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs font-mono">
            <div>
              <span className="text-slate-500 block text-[10px]">Total Deposited:</span>
              <span className="text-slate-200 font-bold">${(walletStats?.totalDeposited || 0).toFixed(2)}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Total Withdrawn:</span>
              <span className="text-slate-200 font-bold">${(walletStats?.totalWithdrawn || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Navigation Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Deposit Quick Jump */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <PlusCircle className="w-4 h-4 text-emerald-400" />
            <span>Fund Trading Account</span>
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Deposit USDT (TRC20), Native Bitcoin, Ethereum, or International Bank Wire. All deposits are verified on-chain or via swift bank confirmation.
          </p>
          <button
            onClick={() => onNavigate('/deposit')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl cursor-pointer"
          >
            View Deposit Methods & Addresses →
          </button>
        </div>

        {/* Withdraw Quick Jump */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <MinusCircle className="w-4 h-4 text-amber-400" />
            <span>Withdraw Profit</span>
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Withdraw your settled profits directly to your external crypto wallet or bank account. Minimum withdrawal $20.00 with 0% platform processing fee.
          </p>
          <button
            onClick={() => onNavigate('/withdraw')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl cursor-pointer"
          >
            Submit Withdrawal Request →
          </button>
        </div>
      </div>
    </div>
  );
};
