import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { WalletTransaction } from '../types';
import {
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  TrendingUp,
  CreditCard,
  DollarSign,
} from 'lucide-react';

export const TransactionsPage: React.FC = () => {
  const { user, token } = useAuth();
  const [filterType, setFilterType] = useState<string>('all');
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    const fetchTxs = async () => {
      try {
        const url = filterType === 'all' ? '/api/wallet/transactions' : `/api/wallet/transactions?type=${filterType}`;
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setTransactions(data.transactions || []);
        }
      } catch {
        // silent
      } finally {
        setIsLoading(false);
      }
    };
    fetchTxs();
  }, [token, filterType]);

  if (!user) {
    return <div className="p-8 text-center text-slate-400">Please sign in to view transaction history.</div>;
  }

  return (
    <div className="flex-1 bg-slate-950 py-8 px-4 sm:px-6 max-w-7xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Financial Ledger</h1>
          <p className="text-xs text-slate-400 mt-1">
            Authoritative transaction history for deposits, withdrawals, trade stakes, and binary payouts.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
          {[
            { id: 'all', label: 'All Transactions' },
            { id: 'deposit', label: 'Deposits' },
            { id: 'withdrawal', label: 'Withdrawals' },
            { id: 'trade_payout', label: 'Payouts' },
            { id: 'trade_stake', label: 'Stakes' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                filterType === tab.id
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Ledger Table */}
      {transactions.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-2xl text-xs text-slate-500">
          No transaction entries found for this filter.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 text-[10px] uppercase font-semibold">
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">Date / Time</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Reference</th>
                <th className="py-3 px-4">Account</th>
                <th className="py-3 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {transactions.map((tx) => {
                const isPositive = tx.amount > 0;

                return (
                  <tr key={tx.id} className="hover:bg-slate-850/60">
                    <td className="py-3 px-4 text-slate-500">#{tx.id}</td>
                    <td className="py-3 px-4 text-slate-400 font-sans text-[11px]">
                      {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 font-sans font-bold text-white">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px]">
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-sans">{tx.description}</td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">{tx.referenceId}</td>
                    <td className="py-3 px-4 font-sans">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${tx.isDemo ? 'bg-amber-950/60 text-amber-300' : 'bg-emerald-950/60 text-emerald-300'}`}>
                        {tx.isDemo ? 'DEMO' : 'REAL'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold tabular-nums">
                      <span className={isPositive ? 'text-emerald-400' : 'text-slate-300'}>
                        {isPositive ? '+' : ''}${tx.amount.toFixed(2)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
