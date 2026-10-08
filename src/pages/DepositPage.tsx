import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { PaymentMethod, DepositRequest } from '../types';
import {
  Copy,
  Check,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  CreditCard,
  ShieldCheck,
} from 'lucide-react';

export const DepositPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const { user, token } = useAuth();
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [amount, setAmount] = useState<number>(100);
  const [referenceId, setReferenceId] = useState('');
  const [proofNote, setProofNote] = useState('');
  const [copied, setCopied] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [depositHistory, setDepositHistory] = useState<DepositRequest[]>([]);

  useEffect(() => {
    if (!token) return;
    const fetchMethodsAndDeposits = async () => {
      try {
        const walletRes = await fetch('/api/wallet', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (walletRes.ok) {
          const wData = await walletRes.json();
          setMethods(wData.paymentMethods || []);
          if (wData.paymentMethods?.length > 0 && !selectedMethod) {
            setSelectedMethod(wData.paymentMethods[0]);
          }
        }

        const depRes = await fetch('/api/wallet/deposits', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (depRes.ok) {
          const dData = await depRes.json();
          setDepositHistory(dData.deposits || []);
        }
      } catch {
        // silent
      }
    };
    fetchMethodsAndDeposits();
  }, [token]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedMethod) return;

    setErrorMsg(null);
    setSuccessMsg(null);

    if (amount < selectedMethod.minAmount) {
      setErrorMsg(`Minimum deposit amount for ${selectedMethod.name} is $${selectedMethod.minAmount}.`);
      return;
    }

    if (!referenceId.trim()) {
      setErrorMsg('Please provide your transaction ID (TXID) or swift transfer reference.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/wallet/deposits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          methodId: selectedMethod.id,
          amount,
          referenceId: referenceId.trim(),
          proofNote: proofNote.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to submit deposit.');
        return;
      }

      setSuccessMsg(`Deposit request for $${amount.toFixed(2)} submitted successfully! Compliance team notified.`);
      setReferenceId('');
      setProofNote('');
      setDepositHistory((prev) => [data.deposit, ...prev]);
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="p-8 text-center text-slate-400">
        Please sign in to access deposit facilities.
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-950 py-8 px-4 sm:px-6 max-w-7xl mx-auto w-full space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-2xl font-black text-white tracking-tight">Deposit Funds</h1>
        <p className="text-xs text-slate-400 mt-1">
          Fund your real account balance using verified cryptocurrency or swift banking rails.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form & Address Details */}
        <div className="lg:col-span-7 space-y-6">
          {/* Method Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">1. Select Deposit Method</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {methods.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedMethod(m)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedMethod?.id === m.id
                      ? 'bg-slate-900 border-emerald-500/60 shadow-xs'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-xs text-white">{m.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    Min: ${m.minAmount} · Fee: {m.feePercentage}%
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Payment Instructions & Dedicated Address */}
          {selectedMethod && (
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-300">2. Transfer Instructions</span>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {selectedMethod.instructions}
                </p>
              </div>

              {/* Custody Address Box */}
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Custody Payment Destination:</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(selectedMethod.accountDetails)}
                    className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 cursor-pointer font-mono font-medium"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <div className="font-mono text-xs text-white break-all select-all font-semibold">
                  {selectedMethod.accountDetails}
                </div>
              </div>

              {/* Deposit Confirmation Form */}
              <form onSubmit={handleSubmitDeposit} className="space-y-4 pt-2">
                <span className="text-xs font-semibold text-slate-300 block">3. Confirm Transaction Details</span>

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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400 font-medium">Deposit Amount ($ USD)</label>
                    <input
                      type="number"
                      min={selectedMethod.minAmount}
                      value={amount}
                      onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono font-bold text-white focus:outline-hidden focus:border-emerald-500/60"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400 font-medium">Transaction Hash / Reference ID</label>
                    <input
                      type="text"
                      placeholder="e.g. 0x8f2a... or swift code"
                      value={referenceId}
                      onChange={(e) => setReferenceId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-hidden focus:border-emerald-500/60"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 font-medium">Optional Note or Sender Info</label>
                  <input
                    type="text"
                    placeholder="e.g. Sent from Binance account / John Doe wire"
                    value={proofNote}
                    onChange={(e) => setProofNote(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-emerald-500/60"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-sm"
                >
                  {isSubmitting ? 'Submitting Verification...' : 'Submit Deposit Notification'}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Right Column: Deposit History */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-base font-bold text-white">Deposit History</h2>

          {depositHistory.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-2xl text-xs text-slate-500">
              No deposit submissions yet.
            </div>
          ) : (
            <div className="space-y-2.5">
              {depositHistory.map((dep) => {
                const isApproved = dep.status === 'APPROVED';
                const isRejected = dep.status === 'REJECTED';

                return (
                  <div
                    key={dep.id}
                    className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2 text-xs font-mono"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm tabular-nums">${dep.amount.toFixed(2)}</span>
                      <span
                        className={`inline-flex items-center gap-1 font-bold text-[11px] ${
                          isApproved ? 'text-emerald-400' : isRejected ? 'text-rose-400' : 'text-amber-400'
                        }`}
                      >
                        {isApproved ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : isRejected ? (
                          <XCircle className="w-3.5 h-3.5" />
                        ) : (
                          <Clock className="w-3.5 h-3.5" />
                        )}
                        {dep.status}
                      </span>
                    </div>

                    <div className="text-slate-400 text-[11px] font-sans">
                      <div>Method: <strong className="text-slate-200">{dep.methodName}</strong></div>
                      <div className="text-slate-500 truncate mt-0.5">Ref: {dep.referenceId}</div>
                    </div>

                    {dep.adminNote && (
                      <div className="text-[10px] text-slate-400 bg-slate-950 p-2 rounded border border-slate-800 font-sans">
                        Admin Note: {dep.adminNote}
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
