import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Trash2,
  CheckCircle2,
  Clock,
  Briefcase,
  Globe,
  Award,
  ChevronDown,
  ArrowUpDown,
  FileSpreadsheet,
  AlertCircle,
  FileText,
  MessageCircle,
  Mail,
  Phone,
  Calendar,
  X,
  Plus,
} from 'lucide-react';
import { JobApplication, DashboardStats, ApplicationStatus, HRUser } from '../types.ts';
import { CandidateDetailModal } from './CandidateDetailModal.tsx';

interface HRDashboardProps {
  hrUser: HRUser;
  token?: string;
  onLogout: () => void;
}

export const HRDashboard: React.FC<HRDashboardProps> = ({ hrUser, token, onLogout }) => {
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    new: 0,
    reviewing: 0,
    shortlisted: 0,
    interview: 0,
    hired: 0,
    rejected: 0,
  });

  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [positionFilter, setPositionFilter] = useState('all');
  const [countryFilter, setCountryFilter] = useState('all');
  const [experienceFilter, setExperienceFilter] = useState('all');
  const [qualificationFilter, setQualificationFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // Selected candidate for detail view
  const [selectedCandidate, setSelectedCandidate] = useState<JobApplication | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/stats', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.status === 401) {
        onLogout();
        return;
      }
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Stats error:', err);
    }
  }, [token, onLogout]);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (positionFilter !== 'all') params.append('position', positionFilter);
      if (countryFilter !== 'all') params.append('country', countryFilter);
      if (experienceFilter !== 'all') params.append('experience', experienceFilter);
      if (qualificationFilter !== 'all') params.append('qualification', qualificationFilter);
      params.append('sort', sortOrder);

      const res = await fetch(`/api/admin/applications?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.status === 401) {
        onLogout();
        return;
      }

      const data = await res.json();
      if (data.success) {
        setApplications(data.applications);
      } else {
        setError(data.error || 'Could not fetch applications');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Network or server error while retrieving candidates');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, positionFilter, countryFilter, experienceFilter, qualificationFilter, sortOrder, token, onLogout]);

  useEffect(() => {
    fetchStats();
    fetchApplications();
  }, [fetchStats, fetchApplications]);

  const handleStatusChange = async (id: string, newStatus: ApplicationStatus) => {
    try {
      const res = await fetch(`/api/admin/applications/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.status === 401) {
        onLogout();
        return;
      }

      const data = await res.json();
      if (data.success) {
        // Update local list
        setApplications((prev) =>
          prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
        );
        if (selectedCandidate && selectedCandidate.id === id) {
          setSelectedCandidate((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
        fetchStats();
      }
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  const handleNotesSave = async (id: string, notes: string) => {
    const res = await fetch(`/api/admin/applications/${id}/notes`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ notes }),
    });

    if (res.status === 401) {
      onLogout();
      return;
    }

    const data = await res.json();
    if (data.success) {
      setApplications((prev) =>
        prev.map((app) => (app.id === id ? { ...app, hr_notes: notes } : app))
      );
      if (selectedCandidate && selectedCandidate.id === id) {
        setSelectedCandidate((prev) => (prev ? { ...prev, hr_notes: notes } : null));
      }
    }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/admin/applications/${id}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (res.status === 401) {
      onLogout();
      return;
    }

    const data = await res.json();
    if (data.success) {
      setApplications((prev) => prev.filter((a) => a.id !== id));
      fetchStats();
    }
  };

  const handleExportCSV = () => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (statusFilter !== 'all') params.append('status', statusFilter);
    if (positionFilter !== 'all') params.append('position', positionFilter);
    if (countryFilter !== 'all') params.append('country', countryFilter);
    if (experienceFilter !== 'all') params.append('experience', experienceFilter);
    if (qualificationFilter !== 'all') params.append('qualification', qualificationFilter);
    params.append('sort', sortOrder);

    // Trigger download
    window.location.href = `/api/admin/export/csv?${params.toString()}`;
  };

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setPositionFilter('all');
    setCountryFilter('all');
    setExperienceFilter('all');
    setQualificationFilter('all');
    setSortOrder('newest');
  };

  const hasActiveFilters =
    search !== '' ||
    statusFilter !== 'all' ||
    positionFilter !== 'all' ||
    countryFilter !== 'all' ||
    experienceFilter !== 'all' ||
    qualificationFilter !== 'all' ||
    sortOrder !== 'newest';

  const statusBadge = (st: ApplicationStatus) => {
    const styles: Record<ApplicationStatus, string> = {
      New: 'bg-blue-50 text-blue-700 border-blue-200',
      Reviewing: 'bg-amber-50 text-amber-700 border-amber-200',
      Shortlisted: 'bg-purple-50 text-purple-700 border-purple-200',
      Interview: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      Hired: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      Rejected: 'bg-rose-50 text-rose-700 border-rose-200',
    };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${styles[st]}`}>
        {st}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Talent Acquisition & Candidate Management
            </h1>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Live DB
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Logged in as <strong className="text-slate-800">{hrUser.full_name}</strong> ({hrUser.role.replace('_', ' ')})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              fetchStats();
              fetchApplications();
            }}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 transition shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export CSV / Excel</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total */}
        <div
          onClick={() => setStatusFilter('all')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            statusFilter === 'all'
              ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider opacity-70">Total</span>
            <Users className="w-4 h-4 opacity-70" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold mt-2">{stats.total}</div>
          <div className="text-[11px] opacity-70 mt-1">All Received</div>
        </div>

        {/* New */}
        <div
          onClick={() => setStatusFilter('New')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            statusFilter === 'New'
              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
              : 'bg-white border-slate-200 hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider opacity-80">New</span>
            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold mt-2">{stats.new}</div>
          <div className="text-[11px] opacity-80 mt-1">Pending Review</div>
        </div>

        {/* Shortlisted */}
        <div
          onClick={() => setStatusFilter('Shortlisted')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            statusFilter === 'Shortlisted'
              ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
              : 'bg-white border-slate-200 hover:border-purple-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider opacity-80">Shortlisted</span>
            <Award className="w-4 h-4 opacity-70" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold mt-2">{stats.shortlisted}</div>
          <div className="text-[11px] opacity-80 mt-1">Qualified Leads</div>
        </div>

        {/* Interview */}
        <div
          onClick={() => setStatusFilter('Interview')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            statusFilter === 'Interview'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
              : 'bg-white border-slate-200 hover:border-indigo-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider opacity-80">Interview</span>
            <Clock className="w-4 h-4 opacity-70" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold mt-2">{stats.interview}</div>
          <div className="text-[11px] opacity-80 mt-1">In Client Screening</div>
        </div>

        {/* Hired */}
        <div
          onClick={() => setStatusFilter('Hired')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            statusFilter === 'Hired'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
              : 'bg-white border-slate-200 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider opacity-80">Hired</span>
            <CheckCircle2 className="w-4 h-4 opacity-70" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold mt-2">{stats.hired}</div>
          <div className="text-[11px] opacity-80 mt-1">Visa / Placed</div>
        </div>

        {/* Rejected */}
        <div
          onClick={() => setStatusFilter('Rejected')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            statusFilter === 'Rejected'
              ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
              : 'bg-white border-slate-200 hover:border-rose-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider opacity-80">Rejected</span>
            <X className="w-4 h-4 opacity-70" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold mt-2">{stats.rejected}</div>
          <div className="text-[11px] opacity-80 mt-1">Not Matched</div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          {/* Main Search Input */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by candidate name, Application ID, skills, position, email, phone..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Clear Button */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition border border-rose-100"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          )}
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-2 border-t border-slate-100 text-xs">
          {/* Status Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-2 rounded-lg border border-slate-300 bg-white font-medium text-slate-700"
            >
              <option value="all">All Statuses</option>
              <option value="New">New</option>
              <option value="Reviewing">Reviewing</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Interview">Interview</option>
              <option value="Hired">Hired</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Preferred Country Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Country
            </label>
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="w-full p-2 rounded-lg border border-slate-300 bg-white font-medium text-slate-700"
            >
              <option value="all">All Destinations</option>
              <option value="Saudi Arabia">Saudi Arabia</option>
              <option value="United Arab Emirates">UAE (Dubai/Abu Dhabi)</option>
              <option value="Qatar">Qatar</option>
              <option value="Oman">Oman</option>
              <option value="Kuwait">Kuwait</option>
              <option value="Bahrain">Bahrain</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Canada">Canada</option>
              <option value="Australia">Australia</option>
              <option value="Pakistan">Pakistan (Domestic)</option>
            </select>
          </div>

          {/* Experience Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Experience
            </label>
            <select
              value={experienceFilter}
              onChange={(e) => setExperienceFilter(e.target.value)}
              className="w-full p-2 rounded-lg border border-slate-300 bg-white font-medium text-slate-700"
            >
              <option value="all">Any Experience</option>
              <option value="0-2">0 - 2 Years (Junior)</option>
              <option value="3-5">3 - 5 Years (Mid)</option>
              <option value="6-9">6 - 9 Years (Senior)</option>
              <option value="10+">10+ Years (Lead/Executive)</option>
            </select>
          </div>

          {/* Qualification Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Qualification
            </label>
            <select
              value={qualificationFilter}
              onChange={(e) => setQualificationFilter(e.target.value)}
              className="w-full p-2 rounded-lg border border-slate-300 bg-white font-medium text-slate-700"
            >
              <option value="all">Any Qualification</option>
              <option value="Doctorate">Doctorate / PhD</option>
              <option value="Master">Master's Degree</option>
              <option value="Bachelor">Bachelor's Degree</option>
              <option value="Diploma">Diploma / DAE</option>
              <option value="Secondary">Secondary / Intermediate</option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Sort By
            </label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
              className="w-full p-2 rounded-lg border border-slate-300 bg-white font-medium text-slate-700"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>

          {/* Result Counter */}
          <div className="flex flex-col justify-end">
            <div className="p-2 bg-slate-50 rounded-lg text-slate-600 text-center font-medium border border-slate-200">
              <span className="font-bold text-slate-900">{applications.length}</span> candidates found
            </div>
          </div>
        </div>
      </div>

      {/* Applications Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-slate-500">
            <RefreshCw className="w-8 h-8 mx-auto animate-spin text-blue-600 mb-3" />
            <p className="text-sm font-semibold">Loading Candidate Applications...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="py-16 text-center text-slate-500 px-4">
            <Users className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <h3 className="text-base font-bold text-slate-800">No applications match your criteria</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Try adjusting your search query, status filters, or experience parameters.
            </p>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="mt-4 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition"
              >
                Reset All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">App ID</th>
                  <th className="py-3.5 px-4">Candidate</th>
                  <th className="py-3.5 px-4">Position</th>
                  <th className="py-3.5 px-4">Qualification & Exp</th>
                  <th className="py-3.5 px-4">Destination</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {applications.map((app) => {
                  const cleanPhone = app.whatsapp.replace(/[^0-9]/g, '');
                  return (
                    <tr
                      key={app.id}
                      className="hover:bg-blue-50/40 transition group cursor-pointer"
                      onClick={() => setSelectedCandidate(app)}
                    >
                      {/* Application ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-900 whitespace-nowrap">
                        {app.application_id}
                      </td>

                      {/* Candidate Name & Contact */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                            {app.photo_file?.fileId ? (
                              <img
                                src={`/api/admin/files/${app.photo_file.fileId}?inline=true`}
                                alt={app.full_name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              app.full_name.charAt(0)
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block text-sm">
                              {app.full_name}
                            </span>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                              <span>{app.whatsapp}</span>
                              <span>·</span>
                              <span className="truncate max-w-[140px]">{app.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Position */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800 block">
                          {app.preferred_position}
                        </span>
                        <span className="text-[11px] text-slate-400 block truncate max-w-[180px]">
                          {app.skills}
                        </span>
                      </td>

                      {/* Qualification & Experience */}
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-slate-800 block">
                          {app.qualification}
                        </span>
                        <span className="text-[11px] text-slate-500 block">
                          Exp: {app.total_experience}
                        </span>
                      </td>

                      {/* Preferred Country */}
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-slate-800 block">
                          {app.preferred_country}
                        </span>
                        <span className="text-[11px] text-slate-400 block">
                          {app.preferred_city || 'Any City'}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                        {new Date(app.created_at).toLocaleDateString()}
                      </td>

                      {/* Status */}
                      <td
                        className="py-3.5 px-4"
                        onClick={(e) => e.stopPropagation()} // don't open modal when changing dropdown
                      >
                        <select
                          value={app.status}
                          onChange={(e) => handleStatusChange(app.id, e.target.value as ApplicationStatus)}
                          className="text-[11px] font-semibold px-2 py-1 rounded-md border border-slate-300 bg-white focus:outline-none"
                        >
                          <option value="New">New</option>
                          <option value="Reviewing">Reviewing</option>
                          <option value="Shortlisted">Shortlisted</option>
                          <option value="Interview">Interview</option>
                          <option value="Hired">Hired</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Quick CV download */}
                          {app.cv_file && (
                            <a
                              href={`/api/admin/files/${app.cv_file.fileId}?download=false`}
                              target="_blank"
                              rel="noreferrer"
                              title="Preview CV"
                              className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                            >
                              <FileText className="w-4 h-4" />
                            </a>
                          )}

                          {/* View details modal button */}
                          <button
                            onClick={() => setSelectedCandidate(app)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 text-white font-semibold text-[11px] hover:bg-slate-800 transition shadow-xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Candidate Profile Detail Modal */}
      {selectedCandidate && (
        <CandidateDetailModal
          application={selectedCandidate}
          token={token}
          onClose={() => setSelectedCandidate(null)}
          onStatusChange={handleStatusChange}
          onNotesSave={handleNotesSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};
