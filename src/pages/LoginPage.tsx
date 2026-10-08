import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    const res = await login(email, password);
    setIsSubmitting(false);

    if (res.success) {
      onNavigate('/dashboard');
    } else {
      setErrorMessage(res.error || 'Login failed. Please verify credentials.');
    }
  };

  const handleQuickTraderFill = () => {
    setEmail('trader@elitedex.com');
    setPassword('Trader123!');
  };

  const handleQuickAdminFill = () => {
    setEmail('admin@elitedex.com');
    setPassword('AdminMaster99!');
  };

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 bg-[#070b13]">
      <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-1">
            <TrendingUp className="w-5 h-5 stroke-[2.5]" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Sign In to EliteDex</h2>
          <p className="text-xs text-slate-400">
            Access your binary trading workspace & wallet.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-950/60 border border-rose-500/40 text-rose-300 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-slate-300 font-medium">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                placeholder="trader@elitedex.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-white font-mono focus:outline-hidden focus:border-emerald-500/60"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-slate-300 font-medium">Password</label>
              <button
                type="button"
                onClick={() => alert('Password reset link dispatched to account email if registered.')}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-hidden focus:border-emerald-500/60"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-1.5 mt-2"
          >
            <span>{isSubmitting ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Pre-Fill Credentials */}
        <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-2 text-[11px]">
          <span className="text-slate-400 font-semibold block">Quick Test Credentials:</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleQuickTraderFill}
              className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-lg font-mono text-[10px] cursor-pointer"
            >
              Demo Trader
            </button>
            <button
              type="button"
              onClick={handleQuickAdminFill}
              className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-lg font-mono text-[10px] cursor-pointer"
            >
              Admin Master
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-900">
          Don't have an EliteDex account?{' '}
          <button
            onClick={() => onNavigate('/register')}
            className="text-emerald-400 hover:text-emerald-300 font-bold cursor-pointer"
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
};
