import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Target,
  Camera,
  FileText,
  Sparkles,
  ArrowRight,
  Plus,
  Clock,
  RefreshCw,
  Layers
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

import Button from '../components/common/Button';
import Card, { CardHeader, CardTitle, CardContent } from '../components/common/Card';
import Badge from '../components/common/Badge';
import StatCard from '../components/cards/StatCard';
import GoalCard from '../components/cards/GoalCard';
import EmptyState from '../components/common/EmptyState';
import LoadingState from '../components/common/LoadingState';

import useAuth from '../hooks/useAuth';
import dashboardService from '../services/dashboardService';
import goalService from '../services/goalService';

const CATEGORY_PALETTE = [
  '#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6', '#f97316'
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load dashboard stats
  const loadStats = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await dashboardService.getDashboardStats();
      setDashboardData(data);
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Handle quick goal progress update
  const handleUpdateGoalProgress = async (goalId, updates) => {
    try {
      await goalService.updateGoal(goalId, updates);
      loadStats(true);
    } catch (err) {
      console.error('Failed to update goal progress:', err);
    }
  };

  const stats = dashboardData?.stats || {
    totalEvents: 0,
    totalMemories: 0,
    totalGoals: 0,
    completedGoals: 0,
    activeGoals: 0,
    totalDocuments: 0,
    importantEvents: 0
  };

  const categoryDistribution = dashboardData?.categoryDistribution || [];
  const lifeOverview = dashboardData?.lifeOverview || [];
  const goalsOverview = dashboardData?.goalsOverview || {
    total: 0,
    active: 0,
    completed: 0,
    averageProgress: 0,
    activeList: []
  };
  const recentActivity = dashboardData?.recentActivity || [];
  const upcoming = dashboardData?.upcoming || { events: [], goalDeadlines: [] };

  const firstName = (user?.name || 'Explorer').split(' ')[0];

  if (loading && !dashboardData) {
    return <LoadingState message="Loading your LifeOS Dashboard..." className="min-h-[60vh]" />;
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Welcome Banner with User's Real Name */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-indigo-200 border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>LifeOS — Personal Life Operating System</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
              Welcome back, {user?.name || firstName} 👋
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Your personal operating system is synchronized. You have{' '}
              <span className="text-white font-semibold">{stats.activeGoals} active goals</span>,{' '}
              <span className="text-white font-semibold">{stats.totalEvents} life events</span>, and{' '}
              <span className="text-white font-semibold">{stats.totalMemories} memories</span> archived in your vault.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button
              variant="secondary"
              icon={RefreshCw}
              onClick={() => loadStats(true)}
              className={`bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white ${
                refreshing ? 'animate-spin' : ''
              }`}
            >
              Refresh
            </Button>
            <Button
              variant="secondary"
              icon={Clock}
              onClick={() => navigate('/timeline')}
              className="bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white"
            >
              Timeline
            </Button>
            <Button
              icon={Plus}
              onClick={() => navigate('/events')}
              className="bg-indigo-500 text-white hover:bg-indigo-600 shadow-md font-semibold"
            >
              Log Event
            </Button>
          </div>
        </div>
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Real Database Statistics Grid */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <StatCard
            title="Total Life Events"
            value={stats.totalEvents}
            change={stats.totalEvents > 0 ? `${stats.totalEvents} events logged` : 'Start your timeline'}
            trend={stats.totalEvents > 0 ? 'up' : 'neutral'}
            icon={Calendar}
            description="Academics, career & milestones"
          />
          <StatCard
            title="Captured Memories"
            value={stats.totalMemories}
            change={stats.totalMemories > 0 ? `${stats.totalMemories} in vault` : 'Capture a moment'}
            trend={stats.totalMemories > 0 ? 'up' : 'neutral'}
            icon={Camera}
            description="Photographs, reflections & stories"
          />
          <StatCard
            title="Goals in Progress"
            value={stats.activeGoals}
            change={`${stats.completedGoals} completed`}
            trend="up"
            icon={Target}
            description={`${goalsOverview.averageProgress}% average progress`}
          />
          <StatCard
            title="Archived Documents"
            value={stats.totalDocuments}
            change={stats.totalDocuments > 0 ? `${stats.totalDocuments} files secured` : 'Upload records'}
            trend="neutral"
            icon={FileText}
            description="Certificates, transcripts & IDs"
          />
        </div>
      </section>

      {/* Main Analytics: Life Growth Chart & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Life Timeline Growth Chart */}
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col justify-between">
            <CardHeader>
              <div>
                <CardTitle>Life Timeline Growth</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Annual accumulation of life events, memories, and completed goals
                </p>
              </div>
              <Badge variant="indigo" size="sm">
                Activity
              </Badge>
            </CardHeader>
            <CardContent className="pt-4">
              {stats.totalEvents > 0 || stats.totalMemories > 0 ? (
                <>
                  <div className="h-64 sm:h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={lifeOverview}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="colorMemories" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="year" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#ffffff',
                            borderRadius: '12px',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                            fontSize: '12px'
                          }}
                        />
                        <Area type="monotone" dataKey="memories" name="Memories" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorMemories)" />
                        <Area type="monotone" dataKey="events" name="Life Events" stroke="#0ea5e9" strokeWidth={2} fillOpacity={1} fill="url(#colorEvents)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 flex items-center justify-center gap-6 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-sm bg-indigo-600" />
                      <span>Captured Memories</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-sm bg-sky-500" />
                      <span>Key Life Events</span>
                    </div>
                  </div>
                </>
              ) : (
                <EmptyState
                  icon={Calendar}
                  title="Your timeline is ready"
                  description="Start logging your life milestones and memories to watch your visual journey unfold."
                  actionLabel="Log First Event"
                  onAction={() => navigate('/events')}
                  className="border-none"
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Event Category Distribution (Recharts) */}
        <div>
          <Card className="h-full flex flex-col justify-between">
            <CardHeader>
              <div>
                <CardTitle>Category Distribution</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">Events distribution by life area</p>
              </div>
              <Badge variant="slate" size="sm">
                Distribution
              </Badge>
            </CardHeader>
            <CardContent className="pt-2 flex-1 flex flex-col justify-between">
              {categoryDistribution.length > 0 ? (
                <>
                  <div className="h-52 w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryDistribution}
                          dataKey="count"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={75}
                          paddingAngle={3}
                        >
                          {categoryDistribution.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.color || CATEGORY_PALETTE[index % CATEGORY_PALETTE.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value, name) => [`${value} events`, name]}
                          contentStyle={{
                            backgroundColor: '#ffffff',
                            borderRadius: '12px',
                            border: '1px solid #e2e8f0',
                            fontSize: '12px'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Category Legend List */}
                  <div className="space-y-1.5 mt-2 border-t border-slate-100 pt-3">
                    {categoryDistribution.slice(0, 5).map((cat, idx) => (
                      <div key={cat.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: cat.color || CATEGORY_PALETTE[idx % CATEGORY_PALETTE.length] }}
                          />
                          <span className="text-slate-700 font-medium truncate">{cat.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400 shrink-0">
                          <span className="font-semibold text-slate-900">{cat.count}</span>
                          <span>({cat.percentage}%)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="py-12 flex flex-col items-center text-center">
                  <Layers className="w-8 h-8 text-slate-300 mb-2" />
                  <p className="text-xs font-semibold text-slate-600">No category data yet</p>
                  <p className="text-xs text-slate-400 mt-1">Assign categories to events to see distribution</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Goals Overview & Deadlines Row */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Goals & Ambitions Overview</h2>
            <p className="text-xs text-slate-500">
              {goalsOverview.active} active goals • {goalsOverview.completed} completed • {goalsOverview.averageProgress}% overall average progress
            </p>
          </div>
          <Button variant="ghost" size="sm" iconRight={ArrowRight} onClick={() => navigate('/goals')}>
            View all goals
          </Button>
        </div>

        {/* Average Progress Metric Bar */}
        {goalsOverview.total > 0 && (
          <Card className="p-4 sm:p-5 bg-gradient-to-r from-indigo-50/50 via-white to-purple-50/30 border-indigo-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                  {goalsOverview.averageProgress}%
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Overall Target Momentum</h4>
                  <p className="text-xs text-slate-500">
                    Weighted across all active ambitions ({goalsOverview.active} in progress)
                  </p>
                </div>
              </div>
              <Badge variant="indigo">
                {goalsOverview.completed} Goals Achieved
              </Badge>
            </div>
            <div className="w-full bg-slate-200/80 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-700"
                style={{ width: `${Math.min(goalsOverview.averageProgress, 100)}%` }}
              />
            </div>
          </Card>
        )}

        {/* Goal Cards Grid */}
        {goalsOverview.activeList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {goalsOverview.activeList.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onView={() => navigate('/goals')}
                onUpdateProgress={handleUpdateGoalProgress}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Target}
            title="No active goals defined"
            description="Set your first ambition to track measurable milestones."
            actionLabel="Create a Goal"
            onAction={() => navigate('/goals')}
          />
        )}
      </section>

      {/* Two Column Grid: Recent Unified Activity & Upcoming Moments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Recent Unified Activity Feed */}
        <div>
          <Card className="h-full flex flex-col justify-between">
            <CardHeader>
              <div>
                <CardTitle>Recent Activity</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">Latest events, memories, goals, and documents</p>
              </div>
              <Badge variant="slate" size="sm">
                Live Feed
              </Badge>
            </CardHeader>
            <CardContent className="divide-y divide-slate-100 p-0 flex-1">
              {recentActivity.length > 0 ? (
                recentActivity.map((act) => (
                  <div
                    key={`${act.type}-${act.id}`}
                    onClick={() => navigate(act.link)}
                    className="p-4 hover:bg-slate-50 transition-colors cursor-pointer flex items-start justify-between gap-3 group"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs ${
                        act.type === 'EVENT'
                          ? 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white'
                          : act.type === 'MEMORY'
                          ? 'bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white'
                          : act.type === 'GOAL'
                          ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white'
                          : 'bg-slate-100 text-slate-700 group-hover:bg-slate-800 group-hover:text-white'
                      } transition-colors`}>
                        {act.type === 'EVENT' && <Calendar className="w-4 h-4" />}
                        {act.type === 'MEMORY' && <Camera className="w-4 h-4" />}
                        {act.type === 'GOAL' && <Target className="w-4 h-4" />}
                        {act.type === 'DOCUMENT' && <FileText className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                            {act.title}
                          </h4>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                          {act.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <Badge variant={act.badgeColor || 'slate'} size="sm">
                        {act.badge || act.type}
                      </Badge>
                      <span className="text-[10px] text-slate-400">
                        {new Date(act.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 flex flex-col items-center text-center">
                  <Clock className="w-8 h-8 text-slate-300 mb-2" />
                  <p className="text-xs font-semibold text-slate-600">No recent activity</p>
                  <p className="text-xs text-slate-400 mt-1">Start by adding your first event or goal</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Events & Deadlines */}
        <div>
          <Card className="h-full flex flex-col justify-between">
            <CardHeader>
              <div>
                <CardTitle>Upcoming & Horizon</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">Key milestones and goal deadlines</p>
              </div>
              <Button variant="ghost" size="xs" iconRight={ArrowRight} onClick={() => navigate('/timeline')}>
                Timeline
              </Button>
            </CardHeader>
            <CardContent className="divide-y divide-slate-100 p-0 flex-1">
              {upcoming.events.length > 0 || upcoming.goalDeadlines.length > 0 ? (
                <>
                  {/* Upcoming Events */}
                  {upcoming.events.map((event) => (
                    <div
                      key={event.id}
                      onClick={() => navigate('/timeline')}
                      className="p-4 hover:bg-slate-50 transition-colors cursor-pointer flex items-start gap-3 group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-xs font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                            {event.title}
                          </h4>
                          <span className="text-[11px] font-medium text-slate-400 shrink-0">
                            {new Date(event.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{event.description || event.location}</p>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          {event.category && (
                            <Badge variant="indigo" size="sm">{event.category.name}</Badge>
                          )}
                          <Badge variant={event.importance === 'Milestone' ? 'amber' : 'slate'} size="sm">
                            {event.importance}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Upcoming Goal Deadlines */}
                  {upcoming.goalDeadlines.map((goal) => (
                    <div
                      key={goal.id}
                      onClick={() => navigate('/goals')}
                      className="p-4 hover:bg-slate-50 transition-colors cursor-pointer flex items-start gap-3 group bg-amber-50/20"
                    >
                      <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                        <Target className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-xs font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                            Goal: {goal.title}
                          </h4>
                          <span className="text-[11px] font-semibold text-amber-700 shrink-0">
                            Due {new Date(goal.targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">Progress: {goal.currentValue} / {goal.targetValue} ({goal.progress}%)</p>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div className="p-8 flex flex-col items-center text-center">
                  <Clock className="w-8 h-8 text-slate-300 mb-2" />
                  <p className="text-xs font-semibold text-slate-600">No upcoming milestones</p>
                  <p className="text-xs text-slate-400 mt-1">Add events or set goal deadlines to track them here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
