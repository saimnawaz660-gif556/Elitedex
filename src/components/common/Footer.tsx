import React from 'react';
import { TrendingUp, Shield, AlertTriangle } from 'lucide-react';

export const Footer: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  return (
    <footer className="w-full bg-slate-950 border-t border-slate-900 text-slate-400 text-xs mt-auto">
      {/* Risk Warning Notice Banner */}
      <div className="border-b border-slate-900/80 bg-slate-950/80 py-3.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-start sm:items-center gap-3 text-slate-400 text-[11px] leading-relaxed">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5 sm:mt-0" />
          <p>
            <strong className="text-slate-300 font-semibold">High-Risk Trading Disclosure:</strong> Binary options trading involves significant financial risk. Market direction predictions carry the risk of losing 100% of the invested trade stake. Past performance is not indicative of future market movement. EliteDex operates transparent, deterministic price capture with zero execution alteration.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <TrendingUp className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="text-lg font-extrabold tracking-tight text-white">
                Elite<span className="text-emerald-400 font-black">Dex</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              International binary options infrastructure providing transparent, high-precision market direction trading with live price feeds and verifiable settlements.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Deterministic Settlement Engine</span>
            </div>
          </div>

          {/* Markets */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">Trading Markets</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigate('/trade')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                  BTC/USD Binary
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/trade')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                  ETH/USD Binary
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/trade')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                  SOL/USD Binary
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/markets')} className="hover:text-emerald-400 transition-colors cursor-pointer text-slate-300 font-medium">
                  All 10+ Supported Assets →
                </button>
              </li>
            </ul>
          </div>

          {/* Platform & Account */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">Platform</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigate('/how-it-works')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                  How Binary Trading Works
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/dashboard')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                  Trader Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/wallet')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                  Deposit & Custody
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/support')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                  Client Support Center
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & Compliance */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">Compliance</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigate('/terms')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                  Terms of Service
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/privacy')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/risk-disclosure')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                  Risk & Binary Disclosure
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/about')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                  About EliteDex Architecture
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} EliteDex Global Technologies. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Server Time: UTC</span>
            <span>·</span>
            <span>Tick Resolution: 1000ms</span>
            <span>·</span>
            <span className="text-emerald-500 font-mono">Engine v2.4-Active</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
