import React from 'react';
import { Briefcase, ShieldCheck, UserCheck, LogOut, FileText, UserPlus, Lock } from 'lucide-react';
import { HRUser } from '../types.ts';

interface NavbarProps {
  currentView: 'candidate' | 'hr_login' | 'hr_dashboard';
  onNavigate: (view: 'candidate' | 'hr_login' | 'hr_dashboard') => void;
  hrUser: HRUser | null;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  hrUser,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Tagline */}
        <div 
          onClick={() => onNavigate(hrUser ? 'hr_dashboard' : 'candidate')} 
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-900 via-blue-900 to-blue-700 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
            <Briefcase className="w-5 h-5 text-blue-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-slate-900">APEX RECRUIT</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                Talent Portal
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Global Recruitment & Placement Services
            </p>
          </div>
        </div>

        {/* Right Navigation & HR Auth Status */}
        <div className="flex items-center gap-2 sm:gap-4">
          {hrUser ? (
            // HR Logged-in State
            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigate('hr_dashboard')}
                className={`text-xs sm:text-sm font-semibold px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                  currentView === 'hr_dashboard'
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span className="hidden sm:inline">HR Dashboard</span>
                <span className="sm:hidden">Dashboard</span>
              </button>

              <button
                onClick={() => onNavigate('candidate')}
                className={`text-xs sm:text-sm font-medium px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                  currentView === 'candidate'
                    ? 'bg-slate-100 text-slate-900 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <UserPlus className="w-4 h-4 text-slate-500" />
                <span className="hidden md:inline">Candidate Form</span>
                <span className="md:hidden">Form</span>
              </button>

              {/* User badge */}
              <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="w-7 h-7 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center font-bold">
                  {hrUser.full_name.charAt(0)}
                </div>
                <div className="text-left text-xs leading-tight">
                  <div className="font-semibold text-slate-800 truncate max-w-[120px]">
                    {hrUser.full_name}
                  </div>
                  <div className="text-[10px] text-emerald-600 font-medium capitalize">
                    {hrUser.role.replace('_', ' ')}
                  </div>
                </div>
              </div>

              {/* Logout button */}
              <button
                onClick={onLogout}
                title="Log out of HR session"
                className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg font-medium border border-rose-100 transition-colors flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            // Candidate / Public State
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => onNavigate('candidate')}
                className={`text-xs sm:text-sm font-medium px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                  currentView === 'candidate'
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Job Application</span>
              </button>

              <button
                onClick={() => onNavigate('hr_login')}
                className={`text-xs sm:text-sm font-medium px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
                  currentView === 'hr_login'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                }`}
              >
                <Lock className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-700" />
                <span>HR / Admin Portal</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
