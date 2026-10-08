import React from 'react';
import { useMarket } from '../context/MarketContext';
import { useAuth } from '../context/AuthContext';
import { Ticker } from '../components/common/Ticker';
import {
  TrendingUp,
  Shield,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  DollarSign,
  ChevronRight,
  Lock,
} from 'lucide-react';

export const LandingPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const { assets, setSelectedAsset, marketStatus } = useMarket();
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
      {/* Ticker at the very top */}
      <Ticker onSelectAsset={(id) => {
        const a = assets.find((x) => x.id === id);
        if (a) {
          setSelectedAsset(a);
          onNavigate('/trade');
        }
      }} />

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 px-4 sm:px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headline and CTAs */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Next-Gen Binary Trading Platform</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1] text-balance">
                Trade Market Direction With Confidence.
              </h1>

              <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-2xl">
                EliteDex delivers high-speed, binary prediction trading across major global crypto assets. Choose UP or DOWN, select a duration from 30 seconds to 15 minutes, and benefit from transparent, deterministic settlement.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => onNavigate(user ? '/trade' : '/register')}
                  className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer flex items-center gap-2 text-sm"
                >
                  <span>{user ? 'Enter Trading Room' : 'Start Trading Risk-Free'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onNavigate('/markets')}
                  className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold rounded-xl border border-slate-800 transition-colors cursor-pointer text-sm"
                >
                  View Live Markets
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-6 pt-4 text-xs text-slate-400 border-t border-slate-900">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span>Verifiable Tick Settlement</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span>30s to 30m Durations</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span>Up to 92% Payout</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Graphic */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-slate-800/80 shadow-2xl bg-slate-900">
                <img
                  src="/src/assets/images/elitedex_hero_preview_1791465647745.jpg"
                  alt="EliteDex Professional Binary Trading Terminal"
                  className="w-full h-auto object-cover transform hover:scale-[1.02] transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

                {/* Floating HUD Card */}
                <div className="absolute bottom-4 left-4 right-4 p-3 bg-slate-900/95 border border-slate-700/80 rounded-xl backdrop-blur-md flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="font-bold text-white">BTC/USD 60s UP</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400">Fixed Return: </span>
                    <span className="text-emerald-400 font-bold">+88% ($188.00)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How Binary Trading Works */}
      <section className="py-16 bg-slate-900/40 border-y border-slate-900 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              How Binary Trading Works
            </h2>
            <p className="text-slate-400 text-sm">
              EliteDex offers straightforward up-or-down binary contracts with predetermined payouts. No order books, no liquidation spirals, and no spread manipulation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 relative group hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold font-mono">
                01
              </div>
              <h3 className="text-base font-bold text-white">Choose Market & Stake</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Select your preferred cryptocurrency (BTC, ETH, SOL, BNB, etc.) and specify your trade amount, starting from just $5.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 relative group hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold font-mono">
                02
              </div>
              <h3 className="text-base font-bold text-white">Predict Direction & Time</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Predict whether the market price will be UP (higher) or DOWN (lower) after your chosen timeframe: 30s, 60s, 2m, 5m, or 15m.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 relative group hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold font-mono">
                03
              </div>
              <h3 className="text-base font-bold text-white">Instant Deterministic Payout</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                At expiry, the authoritative market tick determines the outcome. If your prediction is correct, your payout (up to 92%) is credited immediately.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Live Markets Table Preview */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight">Active Binary Markets</h2>
              <p className="text-xs text-slate-400 mt-1">
                Real-time cryptocurrency price streams from public verified order feeds.
              </p>
            </div>
            <button
              onClick={() => onNavigate('/markets')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>View All Supported Assets</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/50">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                  <th className="py-3.5 px-4">Market Asset</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">24h Change</th>
                  <th className="py-3.5 px-4 hidden sm:table-cell">24h High</th>
                  <th className="py-3.5 px-4 hidden sm:table-cell">24h Low</th>
                  <th className="py-3.5 px-4">Payout</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {assets.slice(0, 6).map((asset) => {
                  const isPositive = asset.change24h >= 0;
                  return (
                    <tr
                      key={asset.id}
                      className="hover:bg-slate-850/60 transition-colors"
                    >
                      <td className="py-3 px-4 font-sans font-semibold text-slate-200">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={asset.logo}
                            alt={asset.symbol}
                            className="w-5 h-5 rounded-full"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <span className="text-white">{asset.pair}</span>
                            <span className="text-[10px] text-slate-500 block font-normal">{asset.name}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-100 font-bold tabular-nums">
                        ${asset.currentPrice.toLocaleString('en-US', {
                          minimumFractionDigits: asset.currentPrice < 1 ? 4 : 2,
                          maximumFractionDigits: asset.currentPrice < 1 ? 4 : 2,
                        })}
                      </td>
                      <td className="py-3 px-4 tabular-nums">
                        <span
                          className={`inline-flex items-center gap-0.5 font-semibold ${
                            isPositive ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {Math.abs(asset.change24h).toFixed(2)}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 hidden sm:table-cell tabular-nums">
                        ${asset.high24h.toLocaleString('en-US')}
                      </td>
                      <td className="py-3 px-4 text-slate-400 hidden sm:table-cell tabular-nums">
                        ${asset.low24h.toLocaleString('en-US')}
                      </td>
                      <td className="py-3 px-4 text-emerald-400 font-bold">
                        {asset.payoutRate}%
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedAsset(asset);
                            onNavigate('/trade');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 font-sans font-bold text-xs transition-colors cursor-pointer border border-emerald-500/30"
                        >
                          Trade
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Deterministic Integrity Guarantee */}
      <section className="py-14 bg-slate-900/30 border-t border-slate-900 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-8 space-y-6 text-center">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
            <Lock className="w-6 h-6" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              Immutable Settlement Architecture
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
              Every binary trade on EliteDex is locked at the precise millisecond of creation and settled against public market feeds. Neither traders nor administrators can alter closed trade outcomes.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => onNavigate('/trade')}
              className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs cursor-pointer shadow-md"
            >
              Open Trading Room
            </button>
            <button
              onClick={() => onNavigate('/how-it-works')}
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs cursor-pointer"
            >
              Learn More
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
