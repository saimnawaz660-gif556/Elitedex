import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Lock, User as UserIcon, CheckCircle2, AlertCircle } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, token } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [passwordMsg, setPasswordMsg] = useState<{ text: string; isError: boolean } | null>(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isUpdating2FA, setIsUpdating2FA] = useState(false);
  const [twoFaActive, setTwoFaActive] = useState(user?.twoFactorEnabled || false);

  if (!user) return <div className="p-8 text-center text-slate-400">Please sign in to view profile.</div>;

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setPasswordMsg(null);
    if (newPassword !== confirmNewPassword) {
      setPasswordMsg({ text: 'New passwords do not match.', isError: true });
      return;
    }

    if (newPassword.length < 8) {
      setPasswordMsg({ text: 'New password must be at least 8 characters.', isError: true });
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const res = await fetch('/api/auth/update-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPasswordMsg({ text: data.error || 'Failed updating password.', isError: true });
      } else {
        setPasswordMsg({ text: 'Password successfully updated!', isError: false });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      }
    } catch (err: any) {
      setPasswordMsg({ text: err.message || 'Network error.', isError: true });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleToggle2FA = async () => {
    if (!token) return;
    setIsUpdating2FA(true);
    try {
      const res = await fetch('/api/auth/toggle-2fa', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setTwoFaActive(data.twoFactorEnabled);
      }
    } catch {
      // ignore
    } finally {
      setIsUpdating2FA(false);
    }
  };

  return (
    <div className="flex-1 bg-slate-950 py-8 px-4 sm:px-6 max-w-4xl mx-auto w-full space-y-8">
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-2xl font-black text-white tracking-tight">Profile & Security Settings</h1>
        <p className="text-xs text-slate-400 mt-1">Manage credentials, authentication protection, and identity verification status.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Account Info Card */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-lg text-white">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-white text-base">{user.name}</h3>
              <p className="text-xs text-slate-400 font-mono">{user.email}</p>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs font-mono">
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Account Role:</span>
              <span className="text-white font-bold uppercase">{user.role}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Account Status:</span>
              <span className="text-emerald-400 font-bold capitalize">{user.status}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">KYC Verification:</span>
              <span className="text-emerald-400 font-bold">Standard Tier 1 (Verified)</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Member Since:</span>
              <span className="text-slate-300">{new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* 2FA Security Card */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white text-base">Two-Factor Authentication</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Protect account actions and withdrawals with dual-factor verification challenges.
          </p>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div>
              <span className="text-xs font-semibold text-white block">Status:</span>
              <span className={`text-[11px] font-mono ${twoFaActive ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}>
                {twoFaActive ? '2FA Enabled & Active' : '2FA Disabled'}
              </span>
            </div>
            <button
              onClick={handleToggle2FA}
              disabled={isUpdating2FA}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                twoFaActive
                  ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
                  : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-bold'
              }`}
            >
              {twoFaActive ? 'Disable 2FA' : 'Enable 2FA'}
            </button>
          </div>
        </div>
      </div>

      {/* Change Password Card */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-slate-400" />
          <h3 className="font-bold text-white text-base">Change Password</h3>
        </div>

        {passwordMsg && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              passwordMsg.isError
                ? 'bg-rose-950/60 border border-rose-500/40 text-rose-300'
                : 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
            }`}
          >
            {passwordMsg.isError ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            <span>{passwordMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-emerald-500/60"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">New Password (Min 8 chars)</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-emerald-500/60"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Confirm New Password</label>
            <input
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-emerald-500/60"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isUpdatingPassword}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            {isUpdatingPassword ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};
