import React, { useState } from 'react';
import { Lock, Mail, Key, Eye, EyeOff, ShieldAlert, ArrowLeft, Loader2, CheckCircle, UserCheck } from 'lucide-react';
import { HRUser } from '../types.ts';

interface HRLoginProps {
  onLoginSuccess: (user: HRUser, token: string) => void;
  onBackToCandidate: () => void;
}

export const HRLogin: React.FC<HRLoginProps> = ({ onLoginSuccess, onBackToCandidate }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setErrorMsg('Please enter your HR username/email and password.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier: identifier.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Authentication failed. Please check credentials.');
      }

      onLoginSuccess(data.user, data.token);
    } catch (err: unknown) {
      console.error('Login error:', err);
      setErrorMsg(
        err instanceof Error ? err.message : 'Invalid credentials. Please verify your login details.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (user: string, pass: string) => {
    setIdentifier(user);
    setPassword(pass);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Back Button */}
        <div>
          <button
            onClick={onBackToCandidate}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Candidate Application</span>
          </button>
        </div>

        {/* Card Header */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <div className="text-center mb-6">
            <div className="w-12 h-12 mx-auto rounded-xl bg-slate-900 text-white flex items-center justify-center mb-3 shadow-xs">
              <Lock className="w-6 h-6 text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">HR & Admin Gateway</h2>
            <p className="text-xs text-slate-500 mt-1">
              Protected portal for talent acquisition team, screening officers and recruiters.
            </p>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">{errorMsg}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Work Email or Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="admin or admin@apexrecruitment.com"
                  required
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Secure Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Key className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 active:scale-98 transition shadow-xs disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-blue-400" />
                  <span>Authenticate & Open Dashboard</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Demo Credentials (Click to auto-fill)
            </span>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleQuickFill('admin', 'Admin@2026Password!')}
                className="w-full text-left p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50/70 border border-slate-200/80 hover:border-blue-300 transition text-xs flex items-center justify-between"
              >
                <div>
                  <span className="font-semibold text-slate-800 block">Chief Talent Officer (Admin)</span>
                  <span className="text-slate-500 font-mono text-[11px]">admin · Admin@2026Password!</span>
                </div>
                <span className="text-[11px] font-semibold text-blue-600">Fill</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('hr.manager', 'HR@2026Password!')}
                className="w-full text-left p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50/70 border border-slate-200/80 hover:border-blue-300 transition text-xs flex items-center justify-between"
              >
                <div>
                  <span className="font-semibold text-slate-800 block">Lead Recruiter (HR Manager)</span>
                  <span className="text-slate-500 font-mono text-[11px]">hr.manager · HR@2026Password!</span>
                </div>
                <span className="text-[11px] font-semibold text-blue-600">Fill</span>
              </button>
            </div>
          </div>
        </div>

        {/* Security Reassurance */}
        <div className="text-center text-xs text-slate-400">
          <p className="flex items-center justify-center gap-1.5 font-medium">
            <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
            Strict Role-Based Backend Access Control
          </p>
          <p className="mt-0.5 text-[11px]">
            Sessions authenticated with cryptographically signed tokens.
          </p>
        </div>
      </div>
    </div>
  );
};
