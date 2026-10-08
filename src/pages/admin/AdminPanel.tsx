import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck,
  Users,
  TrendingUp,
  CreditCard,
  ArrowDownLeft,
  ArrowUpRight,
  Settings,
  MessageSquare,
  FileText,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Lock,
  LogOut,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

export const AdminPanel: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const { user, token, login } = useAuth();
  const [activeTab, setActiveTab] = useState<
    'overview' | 'users' | 'trades' | 'assets' | 'deposits' | 'withdrawals' | 'payments' | 'support' | 'audit' | 'settings'
  >('overview');

  // Admin login states
  const [adminEmail, setAdminEmail] = useState('admin@elitedex.com');
  const [adminPassword, setAdminPassword] = useState('AdminMaster99!');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Data states
  const [overview, setOverview] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [tradesList, setTradesList] = useState<any[]>([]);
  const [assetsList, setAssetsList] = useState<any[]>([]);
  const [depositsList, setDepositsList] = useState<any[]>([]);
  const [withdrawalsList, setWithdrawalsList] = useState<any[]>([]);
  const [paymentMethodsList, setPaymentMethodsList] = useState<any[]>([]);
  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [siteSettings, setSiteSettings] = useState<any>(null);

  const [searchUser, setSearchUser] = useState('');
  const [adminActionMsg, setAdminActionMsg] = useState<string | null>(null);

  const isAdmin = user && user.role === 'admin';

  // Fetch admin data
  const fetchAdminData = async () => {
    if (!token || !isAdmin) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [ovRes, uRes, tRes, aRes, dRes, wRes, pRes, sRes, audRes, setRes] = await Promise.all([
        fetch('/api/admin/overview', { headers }).then((r) => r.json()),
        fetch('/api/admin/users', { headers }).then((r) => r.json()),
        fetch('/api/admin/trades', { headers }).then((r) => r.json()),
        fetch('/api/admin/assets', { headers }).then((r) => r.json()),
        fetch('/api/admin/deposits', { headers }).then((r) => r.json()),
        fetch('/api/admin/withdrawals', { headers }).then((r) => r.json()),
        fetch('/api/admin/payment-methods', { headers }).then((r) => r.json()),
        fetch('/api/admin/support', { headers }).then((r) => r.json()),
        fetch('/api/admin/audit-logs', { headers }).then((r) => r.json()),
        fetch('/api/admin/settings', { headers }).then((r) => r.json()),
      ]);

      if (ovRes) setOverview(ovRes);
      if (uRes.users) setUsersList(uRes.users);
      if (tRes.trades) setTradesList(tRes.trades);
      if (aRes.assets) setAssetsList(aRes.assets);
      if (dRes.deposits) setDepositsList(dRes.deposits);
      if (wRes.withdrawals) setWithdrawalsList(wRes.withdrawals);
      if (pRes.paymentMethods) setPaymentMethodsList(pRes.paymentMethods);
      if (sRes.tickets) setSupportTickets(sRes.tickets);
      if (audRes.auditLogs) setAuditLogs(audRes.auditLogs);
      if (setRes.settings) setSiteSettings(setRes.settings);
    } catch (err) {
      console.error('Error loading admin suite:', err);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAdminData();
      const interval = setInterval(fetchAdminData, 4000);
      return () => clearInterval(interval);
    }
  }, [isAdmin, token]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    const res = await login(adminEmail, adminPassword);
    if (!res.success) {
      setLoginError(res.error || 'Authentication failed.');
    }
  };

  // User Actions
  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        setAdminActionMsg(`User status updated to ${nextStatus}.`);
        fetchAdminData();
      }
    } catch {
      // ignore
    }
  };

  // Asset Actions
  const handleToggleAsset = async (assetId: string, enabled: boolean) => {
    try {
      await fetch(`/api/admin/assets/${assetId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ enabled: !enabled }),
      });
      fetchAdminData();
    } catch {
      // ignore
    }
  };

  const handleUpdatePayoutRate = async (assetId: string, payoutRate: number) => {
    try {
      await fetch(`/api/admin/assets/${assetId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ payoutRate }),
      });
      fetchAdminData();
    } catch {
      // ignore
    }
  };

  // Deposit Actions
  const handleDepositAction = async (id: string, action: 'APPROVE' | 'REJECT') => {
    try {
      const note = prompt(`Enter note for ${action.toLowerCase()} decision:`) || 'Processed via admin console';
      const res = await fetch(`/api/admin/deposits/${id}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action, note }),
      });
      if (res.ok) {
        setAdminActionMsg(`Deposit ${action.toLowerCase()}d successfully.`);
        fetchAdminData();
      }
    } catch {
      // ignore
    }
  };

  // Withdrawal Actions
  const handleWithdrawalAction = async (id: string, action: 'APPROVE' | 'REJECT' | 'COMPLETE') => {
    try {
      const note = prompt(`Enter note for ${action.toLowerCase()} decision:`) || 'Processed via admin console';
      const res = await fetch(`/api/admin/withdrawals/${id}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action, note }),
      });
      if (res.ok) {
        setAdminActionMsg(`Withdrawal marked as ${action}.`);
        fetchAdminData();
      }
    } catch {
      // ignore
    }
  };

  // If not logged in as Admin, show Admin Authentication Screen
  if (!isAdmin) {
    return (
      <div className="flex-1 flex items-center justify-center py-16 px-4 bg-slate-950">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6 shadow-2xl">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
              <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h2 className="text-2xl font-black text-white">EliteDex Compliance Console</h2>
            <p className="text-xs text-slate-400">
              Restricted management portal. Role-based authentication required.
            </p>
          </div>

          {loginError && (
            <div className="p-3 bg-rose-950/60 border border-rose-500/40 text-rose-300 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Administrator Email</label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-hidden focus:border-emerald-500/60"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Master Password</label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-hidden focus:border-emerald-500/60"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs cursor-pointer shadow-sm mt-2"
            >
              Authenticate Admin Session
            </button>
          </form>

          <div className="text-center pt-2">
            <button
              onClick={() => onNavigate('/')}
              className="text-xs text-slate-400 hover:text-white cursor-pointer"
            >
              ← Return to Public Website
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Admin Dashboard Workspace
  return (
    <div className="flex-1 flex flex-col md:flex-row bg-[#080c14] min-h-[calc(100vh-4rem)]">
      {/* Admin Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-950 border-r border-slate-800 p-4 space-y-6 shrink-0">
        <div className="flex items-center gap-2.5 px-2 py-1">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold">
            <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <div className="font-extrabold text-white text-xs tracking-tight">Admin Console</div>
            <div className="text-[10px] text-emerald-400 font-mono">Role: Compliance Master</div>
          </div>
        </div>

        <nav className="space-y-1 text-xs">
          {[
            { id: 'overview', label: 'System Overview', icon: TrendingUp },
            { id: 'users', label: 'User Directory', icon: Users },
            { id: 'trades', label: 'Binary Trades Audit', icon: FileText },
            { id: 'assets', label: 'Market Assets & Payouts', icon: TrendingUp },
            { id: 'deposits', label: 'Deposit Queue', icon: ArrowDownLeft },
            { id: 'withdrawals', label: 'Withdrawal Queue', icon: ArrowUpRight },
            { id: 'payments', label: 'Payment Methods', icon: CreditCard },
            { id: 'support', label: 'Support Tickets', icon: MessageSquare },
            { id: 'audit', label: 'Audit Logs', icon: Clock },
            { id: 'settings', label: 'Platform Settings', icon: Settings },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-slate-850 text-emerald-400 font-bold border border-slate-700/80 shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="pt-4 border-t border-slate-900 space-y-2">
          <button
            onClick={() => onNavigate('/trade')}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open User Trade Room</span>
          </button>
        </div>
      </aside>

      {/* Main Admin View Content */}
      <main className="flex-1 p-6 overflow-y-auto max-w-7xl space-y-6">
        {adminActionMsg && (
          <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs flex items-center justify-between">
            <span>{adminActionMsg}</span>
            <button onClick={() => setAdminActionMsg(null)} className="cursor-pointer text-slate-400">✕</button>
          </div>
        )}

        {/* 1. OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">System Health & Metrics</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Total Traders</span>
                <div className="text-2xl font-bold font-mono text-white">{overview?.totalUsers || 0}</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Active Predictions</span>
                <div className="text-2xl font-bold font-mono text-emerald-400">{overview?.activeTrades || 0}</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Pending Deposits</span>
                <div className="text-2xl font-bold font-mono text-amber-400">{overview?.pendingDeposits || 0}</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Pending Withdrawals</span>
                <div className="text-2xl font-bold font-mono text-amber-400">{overview?.pendingWithdrawals || 0}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 uppercase font-semibold">24h Binary Trades</span>
                <div className="text-2xl font-bold font-mono text-white">{overview?.todaysTradesCount || 0}</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 uppercase font-semibold">24h Staked Volume</span>
                <div className="text-2xl font-bold font-mono text-white">${(overview?.todaysVolume || 0).toFixed(2)}</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Open Support Tickets</span>
                <div className="text-2xl font-bold font-mono text-white">{overview?.openTickets || 0}</div>
              </div>
            </div>

            {/* Quick Action Queues */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm">Deposit Review Queue</h3>
                  <button onClick={() => setActiveTab('deposits')} className="text-xs text-emerald-400 hover:underline">
                    View All →
                  </button>
                </div>
                <div className="space-y-2">
                  {depositsList.filter((d) => d.status === 'PENDING').slice(0, 3).map((dep) => (
                    <div key={dep.id} className="p-3 bg-slate-950 rounded-xl flex items-center justify-between text-xs font-mono">
                      <div>
                        <div className="font-bold text-white">${dep.amount.toFixed(2)} · {dep.methodName}</div>
                        <div className="text-[10px] text-slate-500 font-sans">{dep.userEmail}</div>
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleDepositAction(dep.id, 'APPROVE')}
                          className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded font-bold cursor-pointer font-sans"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleDepositAction(dep.id, 'REJECT')}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-750 text-rose-300 rounded cursor-pointer font-sans"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                  {depositsList.filter((d) => d.status === 'PENDING').length === 0 && (
                    <p className="text-xs text-slate-500 py-3 text-center">No pending deposits.</p>
                  )}
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm">Withdrawal Review Queue</h3>
                  <button onClick={() => setActiveTab('withdrawals')} className="text-xs text-emerald-400 hover:underline">
                    View All →
                  </button>
                </div>
                <div className="space-y-2">
                  {withdrawalsList.filter((w) => w.status === 'PENDING').slice(0, 3).map((w) => (
                    <div key={w.id} className="p-3 bg-slate-950 rounded-xl flex items-center justify-between text-xs font-mono">
                      <div>
                        <div className="font-bold text-white">${w.amount.toFixed(2)} · {w.method}</div>
                        <div className="text-[10px] text-slate-500 font-sans">{w.userEmail}</div>
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleWithdrawalAction(w.id, 'COMPLETE')}
                          className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded font-bold cursor-pointer font-sans"
                        >
                          Dispatch
                        </button>
                        <button
                          onClick={() => handleWithdrawalAction(w.id, 'REJECT')}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-750 text-rose-300 rounded cursor-pointer font-sans"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                  {withdrawalsList.filter((w) => w.status === 'PENDING').length === 0 && (
                    <p className="text-xs text-slate-500 py-3 text-center">No pending withdrawals.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. USERS */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white">Registered Traders</h2>
              <div className="relative w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search trader..."
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white font-mono"
                />
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 text-[10px] uppercase font-semibold">
                    <th className="py-3 px-4">Name / ID</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Real Balance</th>
                    <th className="py-3 px-4">Demo Balance</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {usersList
                    .filter((u) => u.name.toLowerCase().includes(searchUser.toLowerCase()) || u.email.toLowerCase().includes(searchUser.toLowerCase()))
                    .map((u) => (
                      <tr key={u.id} className="hover:bg-slate-850/50">
                        <td className="py-3 px-4 font-sans font-bold text-white">
                          <div>{u.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono">#{u.id}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-300">{u.email}</td>
                        <td className="py-3 px-4 text-emerald-400 font-bold">${u.realBalance.toFixed(2)}</td>
                        <td className="py-3 px-4 text-amber-400">${u.demoBalance.toFixed(2)}</td>
                        <td className="py-3 px-4 font-sans uppercase text-[11px] font-bold text-slate-300">{u.role}</td>
                        <td className="py-3 px-4 font-sans">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${u.status === 'active' ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'}`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-sans">
                          <button
                            onClick={() => handleToggleUserStatus(u.id, u.status)}
                            className={`px-3 py-1 rounded text-[11px] font-semibold cursor-pointer ${
                              u.status === 'active'
                                ? 'bg-rose-950 hover:bg-rose-900 text-rose-300'
                                : 'bg-emerald-950 hover:bg-emerald-900 text-emerald-300'
                            }`}
                          >
                            {u.status === 'active' ? 'Suspend' : 'Restore'}
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. TRADES AUDIT */}
        {activeTab === 'trades' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-white">Binary Trades Settlement Audit</h2>
                <p className="text-xs text-slate-400">
                  Immutable record of all live and simulated binary predictions. Administrators have no ability to force results.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 text-[10px] uppercase font-semibold">
                    <th className="py-3 px-4">Trade ID</th>
                    <th className="py-3 px-4">Trader</th>
                    <th className="py-3 px-4">Market</th>
                    <th className="py-3 px-4">Direction</th>
                    <th className="py-3 px-4">Stake</th>
                    <th className="py-3 px-4">Entry Price</th>
                    <th className="py-3 px-4">Expiry Price</th>
                    <th className="py-3 px-4">Result</th>
                    <th className="py-3 px-4">Payout</th>
                    <th className="py-3 px-4">Proof Formula</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {tradesList.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-850/50">
                      <td className="py-3 px-4 text-slate-500">#{t.id}</td>
                      <td className="py-3 px-4 font-sans text-slate-300">{t.userEmail}</td>
                      <td className="py-3 px-4 font-sans font-bold text-white">{t.pair}</td>
                      <td className="py-3 px-4 font-bold text-white">
                        <span className={t.direction === 'UP' ? 'text-emerald-400' : 'text-rose-400'}>
                          {t.direction}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold">${t.stake.toFixed(2)}</td>
                      <td className="py-3 px-4 text-slate-400">${t.entryPrice}</td>
                      <td className="py-3 px-4 text-slate-200 font-bold">${t.expiryPrice || 'Pending'}</td>
                      <td className="py-3 px-4 font-sans">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${t.status === 'WON' ? 'bg-emerald-950 text-emerald-300' : t.status === 'LOST' ? 'bg-rose-950 text-rose-300' : 'bg-slate-800 text-amber-300'}`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-emerald-400 font-bold">${t.actualPayout.toFixed(2)}</td>
                      <td className="py-3 px-4 text-[10px] text-slate-400 max-w-xs truncate" title={t.settlementReason}>
                        {t.settlementReason || 'Active in progress'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. ASSETS MANAGEMENT */}
        {activeTab === 'assets' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">Market Assets & Payout Configuration</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assetsList.map((a) => (
                <div key={a.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img src={a.logo} alt={a.symbol} className="w-6 h-6 rounded-full" referrerPolicy="no-referrer" />
                      <div>
                        <div className="font-bold text-white text-sm">{a.pair}</div>
                        <div className="text-[11px] text-slate-400">{a.name}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggleAsset(a.id, a.enabled)}
                      className={`px-3 py-1 rounded text-xs font-semibold cursor-pointer ${
                        a.enabled ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      }`}
                    >
                      {a.enabled ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/80 font-mono">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Current Live Price:</span>
                      <span className="text-white font-bold">${a.currentPrice}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Configured Payout:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400 font-bold">+{a.payoutRate}%</span>
                        <button
                          onClick={() => {
                            const newRate = parseInt(prompt(`Enter new profit payout % for ${a.pair}:`, a.payoutRate.toString()) || '');
                            if (!isNaN(newRate) && newRate >= 50 && newRate <= 98) {
                              handleUpdatePayoutRate(a.id, newRate);
                            }
                          }}
                          className="text-[10px] text-slate-400 hover:text-white underline font-sans cursor-pointer"
                        >
                          Change
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. DEPOSITS */}
        {activeTab === 'deposits' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">Deposit Requests Management</h2>

            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 text-[10px] uppercase font-semibold">
                    <th className="py-3 px-4">Request ID</th>
                    <th className="py-3 px-4">User Email</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4">Reference / TXID</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {depositsList.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-850/50">
                      <td className="py-3 px-4 text-slate-500">#{d.id}</td>
                      <td className="py-3 px-4 font-sans text-slate-300">{d.userEmail}</td>
                      <td className="py-3 px-4 font-bold text-white">${d.amount.toFixed(2)}</td>
                      <td className="py-3 px-4 font-sans text-slate-300">{d.methodName}</td>
                      <td className="py-3 px-4 text-slate-400 max-w-xs truncate">{d.referenceId}</td>
                      <td className="py-3 px-4 font-sans">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${d.status === 'APPROVED' ? 'bg-emerald-950 text-emerald-300' : d.status === 'REJECTED' ? 'bg-rose-950 text-rose-300' : 'bg-amber-950 text-amber-300'}`}>
                          {d.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-sans">
                        {d.status === 'PENDING' && (
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => handleDepositAction(d.id, 'APPROVE')}
                              className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded font-bold cursor-pointer text-[11px]"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleDepositAction(d.id, 'REJECT')}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-750 text-rose-300 rounded cursor-pointer text-[11px]"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 6. WITHDRAWALS */}
        {activeTab === 'withdrawals' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">Withdrawal Processing Queue</h2>

            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 text-[10px] uppercase font-semibold">
                    <th className="py-3 px-4">Request ID</th>
                    <th className="py-3 px-4">User Email</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4">Destination</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {withdrawalsList.map((w) => (
                    <tr key={w.id} className="hover:bg-slate-850/50">
                      <td className="py-3 px-4 text-slate-500">#{w.id}</td>
                      <td className="py-3 px-4 font-sans text-slate-300">{w.userEmail}</td>
                      <td className="py-3 px-4 font-bold text-white">${w.amount.toFixed(2)}</td>
                      <td className="py-3 px-4 font-sans text-slate-300">{w.method}</td>
                      <td className="py-3 px-4 text-slate-400 max-w-xs truncate">{w.destinationAddress}</td>
                      <td className="py-3 px-4 font-sans">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${w.status === 'COMPLETED' ? 'bg-emerald-950 text-emerald-300' : w.status === 'REJECTED' ? 'bg-rose-950 text-rose-300' : 'bg-amber-950 text-amber-300'}`}>
                          {w.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-sans">
                        {w.status === 'PENDING' && (
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => handleWithdrawalAction(w.id, 'COMPLETE')}
                              className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded font-bold cursor-pointer text-[11px]"
                            >
                              Dispatch
                            </button>
                            <button
                              onClick={() => handleWithdrawalAction(w.id, 'REJECT')}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-750 text-rose-300 rounded cursor-pointer text-[11px]"
                            >
                              Reject & Refund
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 7. PAYMENT METHODS */}
        {activeTab === 'payments' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">Configured Deposit & Custody Channels</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paymentMethodsList.map((m) => (
                <div key={m.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{m.name}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${m.enabled ? 'bg-emerald-950 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
                      {m.enabled ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-850 font-mono text-[11px] text-slate-300 break-all">
                    {m.accountDetails}
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">{m.instructions}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 8. SUPPORT TICKETS */}
        {activeTab === 'support' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">Client Support Desk Queue</h2>
            <div className="space-y-3">
              {supportTickets.map((t) => (
                <div key={t.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white text-sm">{t.subject}</span>
                      <span className="text-slate-500 font-mono text-[11px] ml-2">#{t.id} · {t.userEmail}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                      {t.status}
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-950 rounded-lg text-slate-300 text-xs">
                    {t.messages[t.messages.length - 1]?.content}
                  </div>
                  <button
                    onClick={() => {
                      const reply = prompt('Enter reply to user:');
                      if (reply) {
                        fetch(`/api/admin/support/${t.id}/reply`, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                          },
                          body: JSON.stringify({ content: reply, status: 'RESOLVED' }),
                        }).then(() => fetchAdminData());
                      }
                    }}
                    className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs cursor-pointer"
                  >
                    Reply & Resolve
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 9. AUDIT LOGS */}
        {activeTab === 'audit' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">Administrative Audit Trail</h2>
            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 text-[10px] uppercase font-semibold">
                    <th className="py-3 px-4">Time</th>
                    <th className="py-3 px-4">Admin Email</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Target Type</th>
                    <th className="py-3 px-4">Target ID</th>
                    <th className="py-3 px-4">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-850/50">
                      <td className="py-3 px-4 text-slate-400 font-sans text-[11px]">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-slate-300 font-sans">{log.adminEmail}</td>
                      <td className="py-3 px-4 text-emerald-400 font-bold">{log.action}</td>
                      <td className="py-3 px-4 text-slate-400">{log.targetType}</td>
                      <td className="py-3 px-4 text-slate-400">{log.targetId}</td>
                      <td className="py-3 px-4 text-slate-300 font-sans text-xs">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 10. SETTINGS */}
        {activeTab === 'settings' && (
          <div className="space-y-4 max-w-xl">
            <h2 className="text-xl font-bold text-white">Platform Governance Settings</h2>
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Platform Name</label>
                <input
                  type="text"
                  value={siteSettings?.siteName || 'EliteDex'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  readOnly
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Support Dispatch Email</label>
                <input
                  type="email"
                  value={siteSettings?.supportEmail || 'support@elitedex.com'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
                  readOnly
                />
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono">
                <div>
                  <label className="text-slate-400 text-[11px] block font-sans">Min Trade Amount ($)</label>
                  <input
                    type="number"
                    value={siteSettings?.minTradeAmount || 5}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                    readOnly
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-[11px] block font-sans">Max Trade Amount ($)</label>
                  <input
                    type="number"
                    value={siteSettings?.maxTradeAmount || 5000}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                    readOnly
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400">
                Binary options settlement rule: UP = Expiry &gt; Entry, DOWN = Expiry &lt; Entry. Tied expiry results in 100% refund.
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
