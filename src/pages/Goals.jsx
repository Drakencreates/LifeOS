import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Target,
  Plus,
  Search,
  RefreshCw,
  CheckCircle2,
  Clock,
  X,
  Pencil,
  Trash2,
  TrendingUp
} from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import GoalCard from '../components/cards/GoalCard';
import Modal from '../components/common/Modal';
import EmptyState from '../components/common/EmptyState';
import ConfirmDialog from '../components/common/ConfirmDialog';
import GoalFormModal from '../components/goals/GoalFormModal';
import { useToast } from '../context/ToastContext';
import goalService from '../services/goalService';

const STATUS_TABS = [
  { id: 'All', label: 'All Goals' },
  { id: 'In Progress', label: 'In Progress' },
  { id: 'Not Started', label: 'Not Started' },
  { id: 'Completed', label: 'Completed' },
  { id: 'Archived', label: 'Archived' }
];

export default function Goals() {
  const toast = useToast();

  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('All');

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [viewingGoal, setViewingGoal] = useState(null);
  const [deletingGoal, setDeletingGoal] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Load goals from API
  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await goalService.getGoals();
      setGoals(data || []);
    } catch {
      toast.error('Failed to load goals.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Goal saved
  const handleGoalSaved = (savedGoal, isEdit) => {
    if (isEdit) {
      setGoals(prev => prev.map(g => (g.id === savedGoal.id ? savedGoal : g)));
      if (viewingGoal?.id === savedGoal.id) {
        setViewingGoal(savedGoal);
      }
    } else {
      setGoals(prev => [savedGoal, ...prev]);
    }
  };

  // Quick progress update
  const handleUpdateProgress = async (goalId, updates) => {
    try {
      const updated = await goalService.updateGoal(goalId, updates);
      setGoals(prev => prev.map(g => (g.id === goalId ? updated : g)));
      if (viewingGoal?.id === goalId) {
        setViewingGoal(updated);
      }
      toast.success('Progress updated!');
    } catch {
      toast.error('Failed to update progress.');
    }
  };

  // Delete goal
  const handleDeleteGoal = async () => {
    if (!deletingGoal) return;
    setDeleteLoading(true);
    try {
      await goalService.deleteGoal(deletingGoal.id);
      setGoals(prev => prev.filter(g => g.id !== deletingGoal.id));
      if (viewingGoal?.id === deletingGoal.id) {
        setViewingGoal(null);
      }
      toast.success('Goal deleted.');
      setDeletingGoal(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete goal.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Filter goals
  const filteredGoals = useMemo(() => {
    return goals.filter(g => {
      // Tab status filter
      if (activeTab !== 'All' && g.status !== activeTab) {
        return false;
      }

      // Priority filter
      if (selectedPriority !== 'All' && g.priority !== selectedPriority) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = g.title?.toLowerCase().includes(q);
        const descMatch = g.description?.toLowerCase().includes(q);
        const catMatch = g.category?.toLowerCase().includes(q);
        if (!titleMatch && !descMatch && !catMatch) return false;
      }

      return true;
    });
  }, [goals, activeTab, selectedPriority, searchQuery]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = goals.length;
    const completed = goals.filter(g => g.status === 'Completed').length;
    const inProgress = goals.filter(g => g.status === 'In Progress').length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, inProgress, completionRate };
  }, [goals]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <PageHeader
        title="Goals & Ambitions"
        description="Track your personal, academic, and career targets with measurable progress and deadlines."
        breadcrumbs={['LifeOS', 'Goals']}
        actions={
          <div className="flex items-center gap-2.5">
            <Button
              variant="secondary"
              icon={RefreshCw}
              onClick={() => loadData(true)}
              className={refreshing ? 'animate-spin' : ''}
              title="Refresh Goals"
            >
              Refresh
            </Button>
            <Button icon={Plus} onClick={() => setIsAddOpen(true)}>
              Create Goal
            </Button>
          </div>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-3.5 border-slate-200/80">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">Total Goals</span>
            <span className="text-xl font-bold text-slate-900">{metrics.total}</span>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3.5 border-slate-200/80">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">In Progress</span>
            <span className="text-xl font-bold text-slate-900">{metrics.inProgress}</span>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3.5 border-slate-200/80">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">Completed</span>
            <span className="text-xl font-bold text-slate-900">{metrics.completed}</span>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3.5 border-slate-200/80">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">Completion Rate</span>
            <span className="text-xl font-bold text-slate-900">{metrics.completionRate}%</span>
          </div>
        </Card>
      </div>

      {/* Filter and Tab Bar */}
      <Card className="p-4 sm:p-5 shadow-xs border-slate-200/80 bg-white/90 backdrop-blur-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {STATUS_TABS.map(tab => {
              const count = tab.id === 'All' ? goals.length : goals.filter(g => g.status === tab.id).length;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                    activeTab === tab.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      activeTab === tab.id ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search & Priority Filter */}
          <div className="flex items-center gap-2.5 flex-1 md:max-w-md justify-end">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search goals..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-1.5 rounded-lg text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <select
              value={selectedPriority}
              onChange={e => setSelectedPriority(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg text-xs bg-slate-50 border border-slate-200 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shrink-0"
            >
              <option value="All">All Priorities</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Goals Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="animate-pulse p-5 rounded-2xl bg-slate-100 border border-slate-200 space-y-4">
              <div className="h-5 bg-slate-200 rounded w-1/3" />
              <div className="h-6 bg-slate-200 rounded w-3/4" />
              <div className="h-3 bg-slate-200 rounded w-full" />
              <div className="h-4 bg-slate-200 rounded w-1/2 pt-4" />
            </div>
          ))}
        </div>
      ) : filteredGoals.length === 0 ? (
        <EmptyState
          icon={Target}
          title={goals.length === 0 ? 'No goals defined yet' : 'No goals match your filter'}
          description={
            goals.length === 0
              ? 'Set your ambitions, break them down into measurable milestones, and track your daily momentum.'
              : 'Try switching status tabs or clearing your search filter.'
          }
          actionLabel={goals.length === 0 ? 'Create First Goal' : 'Reset Filter'}
          onAction={goals.length === 0 ? () => setIsAddOpen(true) : () => { setActiveTab('All'); setSearchQuery(''); setSelectedPriority('All'); }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGoals.map(goal => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onView={g => setViewingGoal(g)}
              onEdit={g => setEditingGoal(g)}
              onDelete={g => setDeletingGoal(g)}
              onUpdateProgress={handleUpdateProgress}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Goal Modal */}
      <GoalFormModal
        isOpen={isAddOpen || !!editingGoal}
        onClose={() => {
          setIsAddOpen(false);
          setEditingGoal(null);
        }}
        onSaved={handleGoalSaved}
        initialData={editingGoal}
      />

      {/* View Goal Detail Modal */}
      {viewingGoal && (
        <Modal
          isOpen={!!viewingGoal}
          onClose={() => setViewingGoal(null)}
          title={viewingGoal.title}
          description={`${viewingGoal.category || 'Goal'} • Priority: ${viewingGoal.priority}`}
          maxWidth="max-w-xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <Button
                variant="danger"
                size="sm"
                icon={Trash2}
                onClick={() => setDeletingGoal(viewingGoal)}
              >
                Delete
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  icon={Pencil}
                  onClick={() => {
                    setEditingGoal(viewingGoal);
                    setViewingGoal(null);
                  }}
                >
                  Edit Goal
                </Button>
                <Button onClick={() => setViewingGoal(null)}>
                  Close
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-4">
            {/* Badges */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                {viewingGoal.category && <Badge variant="indigo">{viewingGoal.category}</Badge>}
                <Badge variant={viewingGoal.priority === 'High' ? 'rose' : viewingGoal.priority === 'Medium' ? 'amber' : 'slate'}>
                  {viewingGoal.priority} Priority
                </Badge>
              </div>
              <Badge variant={viewingGoal.status === 'Completed' ? 'emerald' : viewingGoal.status === 'In Progress' ? 'blue' : 'slate'}>
                {viewingGoal.status}
              </Badge>
            </div>

            {/* Detailed Progress Section */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between text-sm font-semibold text-slate-800">
                <span>Progress: {viewingGoal.currentValue} / {viewingGoal.targetValue} {viewingGoal.unit || ''}</span>
                <span className="text-indigo-600 font-bold">{viewingGoal.progress}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    viewingGoal.progress >= 100
                      ? 'bg-emerald-500'
                      : viewingGoal.progress >= 50
                      ? 'bg-indigo-600'
                      : 'bg-indigo-400'
                  }`}
                  style={{ width: `${Math.min(viewingGoal.progress, 100)}%` }}
                />
              </div>

              {/* Progress update input */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="number"
                  min="0"
                  max={viewingGoal.targetValue}
                  defaultValue={viewingGoal.currentValue}
                  id="modal-progress-input"
                  className="w-24 px-2.5 py-1 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    const input = document.getElementById('modal-progress-input');
                    if (input) {
                      const val = Number(input.value) || 0;
                      const prog = viewingGoal.targetValue > 0 ? Math.min(100, Math.round((val / viewingGoal.targetValue) * 100)) : 0;
                      handleUpdateProgress(viewingGoal.id, { currentValue: val, progress: prog });
                    }
                  }}
                >
                  Update Progress
                </Button>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-white p-3 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block font-medium">Start Date:</span>
                <span className="text-slate-800 font-semibold">
                  {viewingGoal.startDate ? new Date(viewingGoal.startDate).toLocaleDateString() : 'Not set'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Target Deadline:</span>
                <span className="text-slate-800 font-semibold">
                  {viewingGoal.targetDate ? new Date(viewingGoal.targetDate).toLocaleDateString() : 'No deadline'}
                </span>
              </div>
            </div>

            {/* Description */}
            {viewingGoal.description && (
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Goal Strategy & Notes
                </span>
                <p className="text-sm text-slate-700 leading-relaxed bg-white p-4 rounded-xl border border-slate-200/80 whitespace-pre-line">
                  {viewingGoal.description}
                </p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!deletingGoal}
        onClose={() => setDeletingGoal(null)}
        onConfirm={handleDeleteGoal}
        isLoading={deleteLoading}
        title="Delete Goal"
        description={`"${deletingGoal?.title}" will be permanently removed.`}
        confirmLabel="Delete Goal"
      />
    </div>
  );
}
