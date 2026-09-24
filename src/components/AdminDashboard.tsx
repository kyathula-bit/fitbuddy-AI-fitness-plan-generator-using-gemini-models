import React, { useState, useEffect } from 'react';
import {
  Users,
  Dumbbell,
  MessageSquare,
  Clock,
  Database,
  Search,
  RefreshCw,
  Trash2,
  ExternalLink,
  Shield,
  Layers,
  Sparkles,
  BarChart3,
  ChevronRight,
  Code2,
  FileCode,
  CheckCircle2,
  AlertCircle,
  Filter,
  ArrowLeft,
  Flame,
  Zap,
} from 'lucide-react';
import {
  AdminStats,
  AdminUserRecord,
  AdminPlanRecord,
  AdminFeedbackRecord,
  SqliteSchemaInfo,
  fetchAdminStatsApi,
  fetchAdminUsersApi,
  fetchAdminPlansApi,
  deleteAdminPlanApi,
  fetchAdminFeedbackApi,
  fetchSqliteInfoApi,
} from '../services/api';
import { GeneratedFitnessPlan } from '../types/fitness';

interface AdminDashboardProps {
  onClose: () => void;
  onSelectPlan: (planId: string) => Promise<void>;
  currentPlanId?: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onClose,
  onSelectPlan,
  currentPlanId,
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'users' | 'plans' | 'feedback' | 'sqlite'
  >('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [plans, setPlans] = useState<AdminPlanRecord[]>([]);
  const [feedbackLogs, setFeedbackLogs] = useState<AdminFeedbackRecord[]>([]);
  const [sqliteInfo, setSqliteInfo] = useState<SqliteSchemaInfo | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserFilter, setSelectedUserFilter] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [statsData, usersData, plansData, feedbackData, sqliteData] =
        await Promise.all([
          fetchAdminStatsApi().catch(() => null),
          fetchAdminUsersApi().catch(() => ({ users: [], total: 0 })),
          fetchAdminPlansApi().catch(() => ({ plans: [], total: 0 })),
          fetchAdminFeedbackApi().catch(() => ({ logs: [], total: 0 })),
          fetchSqliteInfoApi().catch(() => null),
        ]);

      if (statsData) setStats(statsData);
      if (usersData) setUsers(usersData.users);
      if (plansData) setPlans(plansData.plans);
      if (feedbackData) setFeedbackLogs(feedbackData.logs);
      if (sqliteData) setSqliteInfo(sqliteData);
    } catch (err: any) {
      console.error('Error loading admin data:', err);
      setError(err.message || 'Failed to load database records.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeletePlan = async (planId: string, title: string) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${title}" from the SQLite database?`
      )
    ) {
      return;
    }

    try {
      await deleteAdminPlanApi(planId);
      setActionSuccess(`Deleted plan "${title}" from SQLite database.`);
      setPlans((prev) => prev.filter((p) => p.id !== planId));
      if (stats) {
        setStats({ ...stats, totalPlans: Math.max(0, stats.totalPlans - 1) });
      }
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      alert(`Failed to delete plan: ${err.message}`);
    }
  };

  const handleSelectAndClose = async (planId: string) => {
    try {
      await onSelectPlan(planId);
      onClose();
    } catch (err: any) {
      alert(`Could not load plan: ${err.message}`);
    }
  };

  // Filtered views
  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      u.fitness_goal.toLowerCase().includes(q) ||
      u.preferred_workout_type.toLowerCase().includes(q)
    );
  });

  const filteredPlans = plans.filter((p) => {
    const matchesUser = selectedUserFilter
      ? p.user_id === selectedUserFilter
      : true;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      p.plan_title.toLowerCase().includes(q) ||
      (p.user_name && p.user_name.toLowerCase().includes(q)) ||
      p.fitness_goal.toLowerCase().includes(q) ||
      (p.latest_feedback_applied &&
        p.latest_feedback_applied.toLowerCase().includes(q));
    return matchesUser && matchesSearch;
  });

  const filteredFeedback = feedbackLogs.filter((f) => {
    const q = searchQuery.toLowerCase();
    return (
      f.feedback_text.toLowerCase().includes(q) ||
      (f.plan_title && f.plan_title.toLowerCase().includes(q)) ||
      (f.user_name && f.user_name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Admin Navigation Header */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all flex items-center gap-1.5 text-xs font-semibold"
              title="Return to Athlete Workout View"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to App</span>
            </button>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white tracking-tight">
                  FitBuddy Admin & Database Console
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <Database className="w-2.5 h-2.5" />
                  SQLite Active
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  SQLAlchemy 2.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Persistent storage of athlete profiles, AI plans, and feedback modification logs
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={loadData}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`}
              />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800/60">
          <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto py-2">
            {[
              { id: 'overview', label: 'Overview & Metrics', icon: BarChart3 },
              { id: 'users', label: 'Users Directory', count: users.length, icon: Users },
              { id: 'plans', label: 'Workout Plans', count: plans.length, icon: Dumbbell },
              {
                id: 'feedback',
                label: 'Feedback Modifications',
                count: feedbackLogs.length,
                icon: MessageSquare,
              },
              {
                id: 'sqlite',
                label: 'SQLite & SQLAlchemy Schema',
                icon: Database,
              },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        isActive
                          ? 'bg-indigo-700 text-indigo-100'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Action success alert */}
        {actionSuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{actionSuccess}</span>
            </div>
            <button
              onClick={() => setActionSuccess(null)}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Search & Filter Bar (on relevant tabs) */}
        {['users', 'plans', 'feedback'].includes(activeTab) && (
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${activeTab}...`}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {selectedUserFilter && (
              <div className="flex items-center gap-2 text-xs bg-indigo-500/10 border border-indigo-500/30 px-3 py-1.5 rounded-xl text-indigo-300">
                <span>Filtered by User ID: {selectedUserFilter}</span>
                <button
                  onClick={() => setSelectedUserFilter(null)}
                  className="hover:text-white font-bold"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 1: OVERVIEW & METRICS */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800/80 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">
                    Total Registered Users
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2 text-2xl font-bold text-white">
                  {stats?.totalUsers ?? users.length}
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  Stored in SQLite <code className="text-indigo-400">users</code> table
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800/80 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">
                    Generated Workout Plans
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <Dumbbell className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2 text-2xl font-bold text-white">
                  {stats?.totalPlans ?? plans.length}
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  Stored in <code className="text-emerald-400">workout_plans</code> table
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800/80 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">
                    Feedback Modifications
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2 text-2xl font-bold text-white">
                  {stats?.totalFeedbackLogs ?? feedbackLogs.length}
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  Iterative feedback logs stored
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800/80 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">
                    Avg Session Duration
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2 text-2xl font-bold text-white">
                  {stats?.avgDurationMinutes ?? 45} mins
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  Calibrated across stored plans
                </p>
              </div>
            </div>

            {/* Breakdown Distributions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Workout Intensity Distribution */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-emerald-400" />
                    Workout Intensity Distribution
                  </h3>
                  <span className="text-[10px] text-slate-400">3-Tier Scale</span>
                </div>
                <div className="space-y-3">
                  {[
                    { key: 'low', label: 'Low (RPE 5–6)', color: 'bg-teal-500' },
                    { key: 'medium', label: 'Medium (RPE 7–8)', color: 'bg-emerald-500' },
                    { key: 'high', label: 'High (RPE 8.5–9+)', color: 'bg-amber-500' },
                  ].map((tier) => {
                    const count =
                      (stats?.intensityDistribution?.[tier.key] || 0) +
                      (tier.key === 'medium'
                        ? stats?.intensityDistribution?.['moderate'] || 0
                        : 0) +
                      (tier.key === 'high'
                        ? stats?.intensityDistribution?.['extreme'] || 0
                        : 0);
                    const total = Math.max(1, stats?.totalPlans || plans.length);
                    const pct = Math.round((count / total) * 100);
                    return (
                      <div key={tier.key}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-slate-300 font-medium">{tier.label}</span>
                          <span className="font-mono text-slate-400 font-bold">
                            {count} ({pct}%)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full ${tier.color} transition-all duration-500`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Goal Distribution */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-rose-400" />
                    Fitness Goals
                  </h3>
                  <span className="text-[10px] text-slate-400">Athlete Focus</span>
                </div>
                <div className="space-y-3">
                  {Object.entries(stats?.goalDistribution || {
                    weight_loss: 2,
                    muscle_gain: 3,
                    flexibility: 1,
                    general_fitness: 2,
                  }).map(([goal, cnt]) => {
                    const total = Math.max(1, stats?.totalPlans || plans.length);
                    const pct = Math.round((Number(cnt) / total) * 100);
                    return (
                      <div key={goal}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-slate-300 font-medium capitalize">
                            {goal.replace('_', ' ')}
                          </span>
                          <span className="font-mono text-slate-400 font-bold">
                            {cnt}
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Equipment Distribution */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Dumbbell className="w-3.5 h-3.5 text-cyan-400" />
                    Available Equipment
                  </h3>
                  <span className="text-[10px] text-slate-400">Setup</span>
                </div>
                <div className="space-y-3">
                  {Object.entries(stats?.equipmentDistribution || {
                    dumbbells_only: 3,
                    bodyweight_only: 2,
                    home_gym: 2,
                    commercial_gym: 1,
                  }).map(([equip, cnt]) => {
                    const total = Math.max(1, stats?.totalPlans || plans.length);
                    const pct = Math.round((Number(cnt) / total) * 100);
                    return (
                      <div key={equip}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-slate-300 font-medium capitalize">
                            {equip.replace('_', ' ')}
                          </span>
                          <span className="font-mono text-slate-400 font-bold">
                            {cnt}
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-cyan-500 transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Quick Actions / Navigation Banner */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-purple-950/60 border border-indigo-500/20 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  SQLite Relational Architecture & SQLAlchemy Models
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xl">
                  User biometric data, workout schedules, and modification feedback histories
                  are strictly normalized and persisted directly in <code className="text-indigo-300">fitness_database.sqlite</code> with matching SQLAlchemy 2.0 models in <code className="text-purple-300">models.py</code>.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('sqlite')}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/20"
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Inspect SQLAlchemy Schema</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: USERS DIRECTORY */}
        {activeTab === 'users' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white">
                  Athlete Profiles in SQLite ({filteredUsers.length})
                </h2>
                <p className="text-[11px] text-slate-400">
                  Biometric baselines, fitness preferences, and linked workout plan counts
                </p>
              </div>
            </div>

            {filteredUsers.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No users found matching your search.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/70 text-slate-400 border-b border-slate-800 uppercase text-[10px] font-semibold tracking-wider">
                    <tr>
                      <th className="p-3.5">Athlete</th>
                      <th className="p-3.5">Bio Baseline</th>
                      <th className="p-3.5">Goal</th>
                      <th className="p-3.5">Intensity</th>
                      <th className="p-3.5">Experience & Setup</th>
                      <th className="p-3.5 text-center">Plans</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredUsers.map((u) => (
                      <tr
                        key={u.id}
                        className="hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="p-3.5 font-medium text-white">
                          <div className="font-bold">{u.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {u.email || u.id}
                          </div>
                        </td>
                        <td className="p-3.5 text-slate-300">
                          <div>
                            {u.age} yrs • <span className="capitalize">{u.gender}</span>
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {u.height_cm} cm • {u.weight_kg} kg
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span className="capitalize px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[11px] font-semibold">
                            {u.fitness_goal.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`capitalize px-2 py-0.5 rounded-full font-bold text-[10px] border ${
                              u.workout_intensity === 'high' || u.workout_intensity === 'extreme'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                : u.workout_intensity === 'low'
                                ? 'bg-teal-500/10 text-teal-400 border-teal-500/30'
                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            }`}
                          >
                            {u.workout_intensity === 'moderate'
                              ? 'medium'
                              : u.workout_intensity === 'extreme'
                              ? 'high'
                              : u.workout_intensity || 'medium'}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-300">
                          <div className="capitalize">{u.workout_experience}</div>
                          <div className="text-[10px] text-slate-400 capitalize">
                            {u.available_equipment.replace('_', ' ')} • {u.workout_duration_minutes}m
                          </div>
                        </td>
                        <td className="p-3.5 text-center font-bold text-white font-mono">
                          {u.plan_count || 0}
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => {
                              setSelectedUserFilter(u.id);
                              setActiveTab('plans');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-semibold transition-all inline-flex items-center gap-1"
                          >
                            <span>View Plans</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: WORKOUT PLANS */}
        {activeTab === 'plans' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white">
                  Stored Workout Plans in SQLite ({filteredPlans.length})
                </h2>
                <p className="text-[11px] text-slate-400">
                  Full plans stored as serialized JSON payloads with version & feedback references
                </p>
              </div>
            </div>

            {filteredPlans.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No workout plans found. Generate a plan or clear filters to view.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/70 text-slate-400 border-b border-slate-800 uppercase text-[10px] font-semibold tracking-wider">
                    <tr>
                      <th className="p-3.5">Plan Title & Details</th>
                      <th className="p-3.5">Athlete</th>
                      <th className="p-3.5">Intensity</th>
                      <th className="p-3.5">Schedule</th>
                      <th className="p-3.5">Latest Feedback Applied</th>
                      <th className="p-3.5">Version</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredPlans.map((p) => {
                      const isCurrent = currentPlanId === p.id;
                      return (
                        <tr
                          key={p.id}
                          className={`hover:bg-slate-800/40 transition-colors ${
                            isCurrent ? 'bg-emerald-950/20' : ''
                          }`}
                        >
                          <td className="p-3.5 font-medium text-white max-w-xs">
                            <div className="font-bold flex items-center gap-1.5">
                              {p.plan_title}
                              {isCurrent && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                                  ACTIVE IN APP
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate">
                              {p.tagline}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                              ID: {p.id}
                            </div>
                          </td>
                          <td className="p-3.5 text-slate-300">
                            <div className="font-semibold text-white">
                              {p.user_name || 'Anonymous'}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {new Date(p.created_at).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="p-3.5">
                            <span
                              className={`capitalize px-2 py-0.5 rounded-full font-bold text-[10px] border ${
                                p.workout_intensity === 'high' || p.workout_intensity === 'extreme'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                : p.workout_intensity === 'low'
                                ? 'bg-teal-500/10 text-teal-400 border-teal-500/30'
                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              }`}
                            >
                              {p.workout_intensity === 'moderate'
                                ? 'medium'
                                : p.workout_intensity === 'extreme'
                                ? 'high'
                                : p.workout_intensity || 'medium'}
                            </span>
                          </td>
                          <td className="p-3.5 text-slate-300">
                            <div>{p.available_workout_days} Days / Wk</div>
                            <div className="text-[10px] text-slate-400">
                              {p.workout_duration_minutes}m • {p.available_equipment.replace('_', ' ')}
                            </div>
                          </td>
                          <td className="p-3.5 max-w-xs">
                            {p.latest_feedback_applied ? (
                              <div className="text-[11px] text-emerald-300 italic truncate" title={p.latest_feedback_applied}>
                                "{p.latest_feedback_applied}"
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-500 font-mono">
                                Initial plan (No feedback yet)
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 font-mono text-center text-xs font-bold text-indigo-400">
                            v{p.version || 1}
                          </td>
                          <td className="p-3.5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleSelectAndClose(p.id)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold transition-all flex items-center gap-1"
                                title="Open this plan in the main interactive view"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>Load Plan</span>
                              </button>
                              <button
                                onClick={() => handleDeletePlan(p.id, p.plan_title)}
                                className="p-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[11px] transition-all"
                                title="Delete from SQLite database"
                              >
                                <Trash2 className="w-3 h-3" />
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
        )}

        {/* TAB 4: FEEDBACK & MODIFICATIONS AUDIT LOG */}
        {activeTab === 'feedback' && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-cyan-400" />
                  Feedback Modification Audit Trail ({filteredFeedback.length})
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Logged requests submitted by athletes to modify exercises, intensity, joint impact, and session volume
                </p>
              </div>
            </div>

            {filteredFeedback.length === 0 ? (
              <div className="p-8 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl text-xs">
                No feedback modification logs recorded yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredFeedback.map((f) => (
                  <div
                    key={f.id}
                    className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-bold text-xs text-white">
                        {f.user_name || 'Athlete'}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(f.created_at).toLocaleString()}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                      <div className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider mb-1">
                        Athlete Feedback:
                      </div>
                      <div className="text-xs text-slate-200 italic font-sans leading-relaxed">
                        "{f.feedback_text}"
                      </div>
                    </div>

                    {f.modifications_summary && (
                      <div className="text-[11px] text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{f.modifications_summary}</span>
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 truncate max-w-[200px]">
                        Target: {f.plan_title || f.plan_id}
                      </span>
                      {f.applied_intensity && (
                        <span className="font-mono text-[10px] uppercase text-slate-300">
                          Intensity: {f.applied_intensity}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: SQLITE & SQLALCHEMY SCHEMA INSPECTOR */}
        {activeTab === 'sqlite' && (
          <div className="space-y-6">
            {/* Database Metadata Banner */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Database className="w-5 h-5 text-indigo-400" />
                    SQLite & SQLAlchemy Architecture
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Normalized relational storage with strict relational schemas, foreign keys, and SQLAlchemy 2.0 ORM compatibility
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-xl bg-slate-800 text-slate-300 font-mono text-xs border border-slate-700">
                    File: fitness_database.sqlite
                  </span>
                  <span className="px-3 py-1 rounded-xl bg-indigo-500/10 text-indigo-300 font-mono text-xs border border-indigo-500/30">
                    sqlite:///fitness_database.sqlite
                  </span>
                </div>
              </div>

              {/* Table Schema Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                {(
                  sqliteInfo?.tables || [
                    {
                      name: 'users',
                      description: 'Biometric baselines, athlete identity, preferences',
                      recordCount: users.length,
                      columns: [
                        'id (PK)',
                        'name',
                        'email',
                        'age',
                        'gender',
                        'height_cm',
                        'weight_kg',
                        'fitness_goal',
                        'workout_intensity',
                        'available_equipment',
                      ],
                    },
                    {
                      name: 'workout_plans',
                      description: 'Generated/modified routine JSON, versions, metadata',
                      recordCount: plans.length,
                      columns: [
                        'id (PK)',
                        'user_id (FK -> users.id)',
                        'plan_title',
                        'workout_intensity',
                        'version',
                        'plan_json',
                      ],
                    },
                    {
                      name: 'plan_feedback_logs',
                      description: 'Athlete feedback, iteration diffs, timestamps',
                      recordCount: feedbackLogs.length,
                      columns: [
                        'id (PK)',
                        'plan_id (FK -> workout_plans.id)',
                        'user_id (FK)',
                        'feedback_text',
                        'modifications_summary',
                      ],
                    },
                  ]
                ).map((tbl) => (
                  <div
                    key={tbl.name}
                    className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs font-bold text-indigo-400">
                          TABLE {tbl.name}
                        </span>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                          {tbl.recordCount} rows
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mb-3">
                        {tbl.description}
                      </p>
                      <div className="text-[10px] font-mono text-slate-500 space-y-1">
                        {tbl.columns.slice(0, 8).map((col, idx) => (
                          <div key={idx} className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                            <span>{col}</span>
                          </div>
                        ))}
                        {tbl.columns.length > 8 && (
                          <div className="text-slate-600 pl-3">
                            + {tbl.columns.length - 8} more columns...
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Python SQLAlchemy models.py Code Viewer */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-lg">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-bold text-white font-mono">
                    models.py (SQLAlchemy 2.0 Declarative Models)
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  Ready for Python FastAPI / Flask / Celery
                </span>
              </div>
              <pre className="p-4 bg-slate-950 text-slate-300 text-[11px] font-mono overflow-x-auto max-h-96 leading-relaxed">
{`from datetime import datetime
from sqlalchemy import create_engine, Column, String, Integer, Float, Text, ForeignKey
from sqlalchemy.orm import declarative_base, relationship, sessionmaker

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(String(64), primary_key=True)
    name = Column(String(128), nullable=False)
    email = Column(String(256))
    age = Column(Integer, nullable=False)
    gender = Column(String(32), nullable=False)
    height_cm = Column(Float, nullable=False)
    weight_kg = Column(Float, nullable=False)
    fitness_goal = Column(String(64), nullable=False)
    workout_intensity = Column(String(32), nullable=False) # low, medium, high
    available_equipment = Column(String(64), nullable=False)
    workout_duration_minutes = Column(Integer, default=45)
    created_at = Column(String(64), default=lambda: datetime.utcnow().isoformat())

    plans = relationship("WorkoutPlan", back_populates="user", cascade="all, delete-orphan")

class WorkoutPlan(Base):
    __tablename__ = "workout_plans"
    id = Column(String(64), primary_key=True)
    user_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    plan_title = Column(String(256), nullable=False)
    workout_intensity = Column(String(32), nullable=False)
    available_workout_days = Column(Integer, nullable=False)
    workout_duration_minutes = Column(Integer, nullable=False)
    version = Column(Integer, default=1)
    latest_feedback_applied = Column(Text)
    plan_json = Column(Text, nullable=False) # Serialized full plan JSON
    created_at = Column(String(64), default=lambda: datetime.utcnow().isoformat())

    user = relationship("User", back_populates="plans")
    feedback_logs = relationship("PlanFeedbackLog", back_populates="plan", cascade="all, delete-orphan")

class PlanFeedbackLog(Base):
    __tablename__ = "plan_feedback_logs"
    id = Column(String(64), primary_key=True)
    plan_id = Column(String(64), ForeignKey("workout_plans.id", ondelete="CASCADE"), nullable=False)
    feedback_text = Column(Text, nullable=False)
    modifications_summary = Column(Text)
    applied_intensity = Column(String(32))
    created_at = Column(String(64), default=lambda: datetime.utcnow().isoformat())

engine = create_engine("sqlite:///fitness_database.sqlite")
Base.metadata.create_all(bind=engine)`}
              </pre>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
