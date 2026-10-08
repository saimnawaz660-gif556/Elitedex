import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Copy, Check, Users, Gift, DollarSign } from 'lucide-react';

export const ReferralsPage: React.FC = () => {
  const { user, token } = useAuth();
  const [data, setData] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetch('/api/referrals', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch(() => {});
  }, [token]);

  if (!user) return <div className="p-8 text-center text-slate-400">Please sign in to view referrals.</div>;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const referralLink = `${window.location.origin}/register?ref=${user.referralCode}`;

  return (
    <div className="flex-1 bg-slate-950 py-8 px-4 sm:px-6 max-w-5xl mx-auto w-full space-y-8">
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-2xl font-black text-white tracking-tight">Referral Program</h1>
        <p className="text-xs text-slate-400 mt-1">
          Share your unique invitation link. Earn rewards when invited traders join and trade on EliteDex.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <span className="text-xs text-slate-400">Your Referral Code</span>
          <div className="text-2xl font-mono font-bold text-emerald-400">{user.referralCode}</div>
          <button
            onClick={() => handleCopy(user.referralCode)}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer font-mono"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy Code</span>
          </button>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <span className="text-xs text-slate-400">Total Referred Traders</span>
          <div className="text-2xl font-mono font-bold text-white">{data?.referredCount || 0}</div>
          <p className="text-xs text-slate-500">Active accounts created</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <span className="text-xs text-slate-400">Commission Earned</span>
          <div className="text-2xl font-mono font-bold text-emerald-400">
            ${(data?.totalCommission || 0).toFixed(2)}
          </div>
          <p className="text-xs text-slate-500">Credited to real balance</p>
        </div>
      </div>

      {/* Referral Link Box */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <h3 className="text-sm font-bold text-white">Your Unique Referral Link</h3>
        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={referralLink}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 font-mono select-all"
          />
          <button
            onClick={() => handleCopy(referralLink)}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>Copy Link</span>
          </button>
        </div>
      </div>

      {/* Referral Rules */}
      <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-xs text-slate-400 space-y-2">
        <h4 className="font-bold text-white text-xs">Transparent Referral Terms:</h4>
        <ul className="list-disc list-inside space-y-1 text-slate-400 leading-relaxed">
          <li>Every verified user registered via your link earns a fixed $25 promotional commission once they fund their account.</li>
          <li>Commission is credited directly to your withdrawal-eligible real balance.</li>
          <li>Zero pyramid tiers or exaggerated return claims. All activity is subject to compliance verification.</li>
        </ul>
      </div>
    </div>
  );
};
