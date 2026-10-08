import React from 'react';
import { Shield, AlertTriangle, Lock, Clock, TrendingUp, CheckCircle2 } from 'lucide-react';

export const HowItWorksPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  return (
    <div className="flex-1 bg-slate-950 py-12 px-4 sm:px-6 max-w-4xl mx-auto w-full space-y-10">
      <div className="space-y-3 text-center">
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">How Binary Trading Works</h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          Binary options trading is based on a simple up-or-down market question: will the asset price expire higher or lower than its entry price?
        </p>
      </div>

      <div className="space-y-6 text-xs text-slate-300">
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono flex items-center justify-center font-bold">1</span>
            <span>Market Selection & Stake</span>
          </h2>
          <p className="leading-relaxed text-slate-400">
            Choose an available crypto asset (e.g. BTC/USD, ETH/USD, SOL/USD). Define the stake amount you wish to risk, starting as low as $5.00 up to $5,000.00.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono flex items-center justify-center font-bold">2</span>
            <span>Direction & Expiry Duration</span>
          </h2>
          <p className="leading-relaxed text-slate-400">
            Decide whether the price will be <strong>UP</strong> (higher) or <strong>DOWN</strong> (lower) by the end of your selected duration (30 seconds, 1 minute, 2 minutes, 5 minutes, or 15 minutes).
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono flex items-center justify-center font-bold">3</span>
            <span>Deterministic Settlement</span>
          </h2>
          <p className="leading-relaxed text-slate-400">
            When the countdown expires, EliteDex retrieves the authoritative price from the verified public tick stream:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-slate-400 font-mono pl-2">
            <li><strong className="text-emerald-400">UP Prediction:</strong> Expiry Price &gt; Entry Price =&gt; WIN (Full stake + up to 92% profit).</li>
            <li><strong className="text-rose-400">DOWN Prediction:</strong> Expiry Price &lt; Entry Price =&gt; WIN (Full stake + up to 92% profit).</li>
            <li><strong className="text-amber-400">Equal Price (Tie):</strong> Expiry Price == Entry Price =&gt; TIE (100% stake refunded).</li>
          </ul>
        </div>
      </div>

      <div className="text-center pt-4">
        <button
          onClick={() => onNavigate('/trade')}
          className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs cursor-pointer"
        >
          Try in Trading Room →
        </button>
      </div>
    </div>
  );
};

export const AboutPage: React.FC = () => {
  return (
    <div className="flex-1 bg-slate-950 py-12 px-4 sm:px-6 max-w-4xl mx-auto w-full space-y-8">
      <div className="space-y-3 text-center">
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">About EliteDex</h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          An institutional-grade binary prediction trading architecture engineered for transparency and speed.
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 text-xs text-slate-300 leading-relaxed">
        <h2 className="text-base font-bold text-white">Our Mission</h2>
        <p>
          EliteDex was built to eliminate opaque practices, hidden spreads, and arbitrary slippage in retail prediction trading. By adopting a strict, verifiable binary engine, every client order is locked upon execution with immutable cryptographic records.
        </p>
        <h2 className="text-base font-bold text-white pt-2">Zero-Intervention Policy</h2>
        <p>
          Our platform does not offer spot order books, margin leverage, or futures liquidation engines. Trade results are governed strictly by mathematical formulas comparing entry and expiry ticks against legitimate external market sources. Administrators have no ability to tamper with closed trades.
        </p>
      </div>
    </div>
  );
};

export const TermsPage: React.FC = () => {
  return (
    <div className="flex-1 bg-slate-950 py-12 px-4 sm:px-6 max-w-4xl mx-auto w-full space-y-6 text-xs text-slate-300">
      <div className="space-y-2 pb-4 border-b border-slate-800">
        <h1 className="text-2xl font-black text-white">Terms of Service</h1>
        <p className="text-slate-500">Effective Date: October 2026</p>
      </div>

      <div className="space-y-4 leading-relaxed">
        <h2 className="text-sm font-bold text-white">1. Eligibility</h2>
        <p>
          You must be at least 18 years old and reside in a jurisdiction where binary prediction contracts are legally permitted. It is the user's sole responsibility to ensure compliance with local statutes and tax regulations.
        </p>

        <h2 className="text-sm font-bold text-white">2. Trade Finality & Locking</h2>
        <p>
          Once confirmed by the user, a binary trade is immediately registered in the trade ledger. Trades cannot be modified, cancelled, or reversed after entry price capture has completed.
        </p>

        <h2 className="text-sm font-bold text-white">3. Tie Settlement Policy</h2>
        <p>
          If the expiry price precisely matches the entry price captured at inception, the contract is ruled a TIE and 100% of the initial stake is returned to the user's available balance.
        </p>

        <h2 className="text-sm font-bold text-white">4. Prohibited Activities</h2>
        <p>
          Any attempt to exploit latency arbitrage, tamper with public APIs, or engage in fraudulent deposits will result in immediate account suspension and referral to competent regulatory bodies.
        </p>
      </div>
    </div>
  );
};

export const PrivacyPage: React.FC = () => {
  return (
    <div className="flex-1 bg-slate-950 py-12 px-4 sm:px-6 max-w-4xl mx-auto w-full space-y-6 text-xs text-slate-300">
      <div className="space-y-2 pb-4 border-b border-slate-800">
        <h1 className="text-2xl font-black text-white">Privacy Policy</h1>
        <p className="text-slate-500">Effective Date: October 2026</p>
      </div>

      <div className="space-y-4 leading-relaxed">
        <h2 className="text-sm font-bold text-white">1. Data Collection & Hashing</h2>
        <p>
          We collect basic user credentials (name, email) and encrypted session identifiers. Passwords are never stored in plaintext and are securely hashed with salted SHA-256 algorithms.
        </p>

        <h2 className="text-sm font-bold text-white">2. Financial Records Custody</h2>
        <p>
          All deposit hashes, transaction identifiers, and withdrawal destinations are retained for compliance audit trails. We do not sell or monetize personal trader information.
        </p>
      </div>
    </div>
  );
};

export const RiskDisclosurePage: React.FC = () => {
  return (
    <div className="flex-1 bg-slate-950 py-12 px-4 sm:px-6 max-w-4xl mx-auto w-full space-y-6 text-xs text-slate-300">
      <div className="space-y-2 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2 text-amber-400">
          <AlertTriangle className="w-5 h-5" />
          <h1 className="text-2xl font-black text-white">Risk Disclosure Notice</h1>
        </div>
        <p className="text-slate-500">Mandatory Regulatory Warning</p>
      </div>

      <div className="p-5 rounded-xl bg-amber-950/30 border border-amber-500/40 text-amber-200 leading-relaxed">
        <strong>HIGH-RISK INVESTMENT WARNING:</strong> Binary options trading involves a high degree of risk and can result in the loss of all deposited funds. You should never risk more than you can comfortably afford to lose.
      </div>

      <div className="space-y-4 leading-relaxed">
        <h2 className="text-sm font-bold text-white">Market Volatility</h2>
        <p>
          Digital assets and cryptocurrency markets can exhibit extreme volatility within seconds. Short-duration contracts (e.g. 30s and 60s) are subject to high-frequency price fluctuations.
        </p>

        <h2 className="text-sm font-bold text-white">Zero Margin / Defined Risk</h2>
        <p>
          Unlike margin or leveraged futures products, binary options carry strictly capped risk: your maximum potential loss is limited to the exact stake allocated to that specific trade. You cannot incur negative balances or debt.
        </p>
      </div>
    </div>
  );
};
