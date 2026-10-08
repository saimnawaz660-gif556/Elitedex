import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  TrendingUp,
  Wallet,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  ChevronDown,
  RotateCcw,
} from 'lucide-react';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, onNavigate }) => {
  const { user, logout, isDemoMode, toggleDemoMode, resetDemoBalance, activeTrades } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const navLinks = [
    { label: 'Trade', path: '/trade' },
    { label: 'Markets', path: '/markets' },
    { label: 'How It Works', path: '/how-it-works' },
    { label: 'About', path: '/about' },
    { label: 'Support', path: '/support' },
  ];

  const activeCount = activeTrades.length;

  return (
    <header className="sticky top-0 z-50 w-full bg-slate-950/95 border-b border-slate-800/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Zone 1: Single text element Brand wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('/')}
            className="flex items-center gap-2 group cursor-pointer text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:border-emerald-500/60 transition-colors">
              <TrendingUp className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-white group-hover:text-emerald-400 transition-colors">
              Elite<span className="text-emerald-400 font-black">Dex</span>
            </span>
          </button>
        </div>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
          {navLinks.map((link) => {
            const isActive = currentPath === link.path;
            return (
              <button
                key={link.path}
                onClick={() => onNavigate(link.path)}
                className={`transition-colors cursor-pointer py-1 ${
                  isActive
                    ? 'text-emerald-400 border-b-2 border-emerald-400 font-semibold'
                    : 'hover:text-white text-slate-300'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              {/* Demo / Real Switcher */}
              <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs font-mono">
                <button
                  onClick={() => toggleDemoMode(true)}
                  className={`px-2.5 py-1.5 rounded transition-all cursor-pointer ${
                    isDemoMode
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Switch to Simulated Demo Account"
                >
                  DEMO ${user.demoBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </button>
                <button
                  onClick={() => toggleDemoMode(false)}
                  className={`px-2.5 py-1.5 rounded transition-all cursor-pointer ${
                    !isDemoMode
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Switch to Real Account"
                >
                  REAL ${user.realBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </button>
              </div>

              {/* Reset Demo button if in Demo mode */}
              {isDemoMode && (
                <button
                  onClick={() => resetDemoBalance()}
                  title="Reset Demo Balance to $10,000"
                  className="hidden lg:flex items-center gap-1 px-2 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 rounded-md text-xs cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}

              {/* Active Trades Indicator */}
              {activeCount > 0 && (
                <button
                  onClick={() => onNavigate('/trades')}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 rounded-lg text-xs font-mono cursor-pointer hover:bg-emerald-900/50 transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>{activeCount} Active</span>
                </button>
              )}

              {/* User Menu Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-medium cursor-pointer transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[90px] truncate hidden sm:inline">{user.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {profileDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 z-50 text-xs"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    <div className="px-3 py-2 border-b border-slate-800">
                      <div className="font-semibold text-white">{user.name}</div>
                      <div className="text-[11px] text-slate-400 truncate">{user.email}</div>
                    </div>

                    <button
                      onClick={() => onNavigate('/dashboard')}
                      className="w-full text-left px-3 py-2 hover:bg-slate-800 text-slate-200 flex items-center gap-2 cursor-pointer"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-slate-400" /> Dashboard Overview
                    </button>
                    <button
                      onClick={() => onNavigate('/trade')}
                      className="w-full text-left px-3 py-2 hover:bg-slate-800 text-slate-200 flex items-center gap-2 cursor-pointer font-medium text-emerald-400"
                    >
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Trade Room
                    </button>
                    <button
                      onClick={() => onNavigate('/wallet')}
                      className="w-full text-left px-3 py-2 hover:bg-slate-800 text-slate-200 flex items-center gap-2 cursor-pointer"
                    >
                      <Wallet className="w-3.5 h-3.5 text-slate-400" /> Wallet & Balances
                    </button>
                    <button
                      onClick={() => onNavigate('/deposit')}
                      className="w-full text-left px-3 py-2 hover:bg-slate-800 text-slate-200 flex items-center gap-2 cursor-pointer"
                    >
                      <span className="text-emerald-400 font-bold">+</span> Deposit Funds
                    </button>
                    <button
                      onClick={() => onNavigate('/withdraw')}
                      className="w-full text-left px-3 py-2 hover:bg-slate-800 text-slate-200 flex items-center gap-2 cursor-pointer"
                    >
                      <span className="text-amber-400 font-bold">-</span> Withdraw Funds
                    </button>
                    <button
                      onClick={() => onNavigate('/trades')}
                      className="w-full text-left px-3 py-2 hover:bg-slate-800 text-slate-200 flex items-center gap-2 cursor-pointer"
                    >
                      My Trades History
                    </button>
                    <button
                      onClick={() => onNavigate('/profile')}
                      className="w-full text-left px-3 py-2 hover:bg-slate-800 text-slate-200 flex items-center gap-2 cursor-pointer"
                    >
                      Profile & Security
                    </button>

                    {user.role === 'admin' && (
                      <div className="border-t border-slate-800 my-1 pt-1">
                        <button
                          onClick={() => onNavigate('/admin/dashboard')}
                          className="w-full text-left px-3 py-2 hover:bg-emerald-950/40 text-emerald-300 font-semibold flex items-center gap-2 cursor-pointer"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Admin Control Panel
                        </button>
                      </div>
                    )}

                    <div className="border-t border-slate-800 my-1 pt-1">
                      <button
                        onClick={logout}
                        className="w-full text-left px-3 py-2 hover:bg-rose-950/30 text-rose-300 flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('/login')}
                className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => onNavigate('/register')}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                Open Account
              </button>
            </div>
          )}

          {/* Mobile hamburger toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 py-4 space-y-3 text-sm">
          {navLinks.map((link) => (
            <button
              key={link.path}
              onClick={() => {
                onNavigate(link.path);
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 px-2 rounded hover:bg-slate-800 text-slate-200"
            >
              {link.label}
            </button>
          ))}
          {user ? (
            <div className="border-t border-slate-800 pt-3 space-y-2">
              <button
                onClick={() => {
                  onNavigate('/dashboard');
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left py-2 px-2 rounded hover:bg-slate-800 text-slate-200"
              >
                Dashboard
              </button>
              <button
                onClick={() => {
                  onNavigate('/wallet');
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left py-2 px-2 rounded hover:bg-slate-800 text-slate-200"
              >
                Wallet & Balances
              </button>
              <button
                onClick={() => {
                  onNavigate('/trades');
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left py-2 px-2 rounded hover:bg-slate-800 text-slate-200"
              >
                My Trades
              </button>
              {user.role === 'admin' && (
                <button
                  onClick={() => {
                    onNavigate('/admin/dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left py-2 px-2 rounded bg-emerald-950/40 text-emerald-300 font-semibold"
                >
                  Admin Control Panel
                </button>
              )}
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left py-2 px-2 rounded hover:bg-rose-950/30 text-rose-300"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="border-t border-slate-800 pt-3 flex gap-2">
              <button
                onClick={() => {
                  onNavigate('/login');
                  setMobileMenuOpen(false);
                }}
                className="w-1/2 py-2 text-center text-xs font-semibold bg-slate-800 rounded text-slate-200"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  onNavigate('/register');
                  setMobileMenuOpen(false);
                }}
                className="w-1/2 py-2 text-center text-xs font-semibold bg-emerald-400 text-slate-950 rounded"
              >
                Open Account
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
