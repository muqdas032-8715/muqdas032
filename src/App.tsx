/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { CandidateForm } from './components/CandidateForm.tsx';
import { ApplicationSuccess } from './components/ApplicationSuccess.tsx';
import { HRLogin } from './components/HRLogin.tsx';
import { HRDashboard } from './components/HRDashboard.tsx';
import { HRUser, ApplicationSubmissionResponse } from './types.ts';
import { Shield, Lock, Briefcase, Globe2, Building2, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<'candidate' | 'hr_login' | 'hr_dashboard'>('candidate');
  const [hrUser, setHrUser] = useState<HRUser | null>(null);
  const [authToken, setAuthToken] = useState<string | undefined>(() => {
    return localStorage.getItem('apex_hr_token') || undefined;
  });
  const [submittedData, setSubmittedData] = useState<ApplicationSubmissionResponse | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Check existing session on mount
  useEffect(() => {
    async function verifySession() {
      try {
        const headers: Record<string, string> = {};
        const savedToken = localStorage.getItem('apex_hr_token');
        if (savedToken) {
          headers['Authorization'] = `Bearer ${savedToken}`;
        }

        const res = await fetch('/api/auth/me', { headers });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user) {
            setHrUser(data.user);
          } else {
            setHrUser(null);
            localStorage.removeItem('apex_hr_token');
          }
        } else {
          setHrUser(null);
          localStorage.removeItem('apex_hr_token');
        }
      } catch (err) {
        console.error('Session check failed:', err);
        setHrUser(null);
      } finally {
        setCheckingAuth(false);
      }
    }

    verifySession();
  }, []);

  const handleNavigate = (view: 'candidate' | 'hr_login' | 'hr_dashboard') => {
    if (view === 'hr_dashboard' && !hrUser) {
      setCurrentView('hr_login');
      return;
    }
    setCurrentView(view);
  };

  const handleLoginSuccess = (user: HRUser, token: string) => {
    setHrUser(user);
    setAuthToken(token);
    localStorage.setItem('apex_hr_token', token);
    setCurrentView('hr_dashboard');
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    }
    setHrUser(null);
    setAuthToken(undefined);
    localStorage.removeItem('apex_hr_token');
    setCurrentView('candidate');
  };

  const handleCandidateSuccess = (data: ApplicationSubmissionResponse) => {
    setSubmittedData(data);
  };

  const handleResetApplication = () => {
    setSubmittedData(null);
    setCurrentView('candidate');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        hrUser={hrUser}
        onLogout={handleLogout}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {currentView === 'candidate' && (
          <>
            {submittedData ? (
              <ApplicationSuccess data={submittedData} onReset={handleResetApplication} />
            ) : (
              <CandidateForm onSuccess={handleCandidateSuccess} />
            )}
          </>
        )}

        {currentView === 'hr_login' && (
          <HRLogin
            onLoginSuccess={handleLoginSuccess}
            onBackToCandidate={() => setCurrentView('candidate')}
          />
        )}

        {currentView === 'hr_dashboard' && (
          <>
            {hrUser ? (
              <HRDashboard hrUser={hrUser} token={authToken} onLogout={handleLogout} />
            ) : (
              <HRLogin
                onLoginSuccess={handleLoginSuccess}
                onBackToCandidate={() => setCurrentView('candidate')}
              />
            )}
          </>
        )}
      </main>

      {/* Corporate Recruitment Footer */}
      <footer className="bg-slate-900 text-slate-400 py-10 border-t border-slate-800 no-print text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <Briefcase className="w-5 h-5 text-blue-400" />
                <span>APEX GLOBAL RECRUITMENT PARTNERS</span>
              </div>
              <p className="text-slate-400 max-w-md text-xs leading-relaxed">
                Licensed Overseas Employment Promoter & Executive Talent Agency. Specializing in manpower deployment across Saudi Arabia, UAE, Qatar, Oman, Bahrain, UK, and European territories.
              </p>
              <div className="flex items-center gap-2 pt-2 text-[11px] text-slate-500">
                <Shield className="w-4 h-4 text-emerald-500" />
                <span>Government Certified Manpower Bureau #0894/LHR/2026</span>
              </div>
            </div>

            <div>
              <h4 className="text-slate-200 font-semibold mb-3 text-xs uppercase tracking-wider">
                Recruitment Sectors
              </h4>
              <ul className="space-y-1.5 text-xs">
                <li>Oil, Gas & Petrochemical Engineering</li>
                <li>Healthcare & Critical Care Nursing</li>
                <li>Civil Construction & Heavy Infrastructure</li>
                <li>Information Technology & Software</li>
                <li>Hospitality, Culinary & Facility Staff</li>
              </ul>
            </div>

            <div>
              <h4 className="text-slate-200 font-semibold mb-3 text-xs uppercase tracking-wider">
                System Security & Access
              </h4>
              <ul className="space-y-1.5 text-xs">
                <li className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-blue-400" />
                  <span>Strict Candidate Data Privacy</span>
                </li>
                <li>No Candidate-to-Candidate Visibility</li>
                <li>Bcrypt & JWT Protected HR Endpoints</li>
                <li className="pt-2">
                  <button
                    onClick={() => handleNavigate(hrUser ? 'hr_dashboard' : 'hr_login')}
                    className="text-blue-400 hover:text-blue-300 font-semibold underline underline-offset-2"
                  >
                    {hrUser ? 'Go to HR Dashboard' : 'Authorized HR Staff Sign-In →'}
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
            <p>© 2026 Apex Global Recruitment Partners. All rights reserved.</p>
            <div className="flex items-center gap-4 text-slate-400">
              <span>Candidate Privacy Protocol v4.2</span>
              <span>·</span>
              <span>Encrypted Storage</span>
              <span>·</span>
              <span>GDPR / Data Protection Compliant</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
