import React from 'react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import { Calendar, CheckCircle2, Clock, AlertCircle, Archive, Pencil, Trash2, Eye, Plus, Minus } from 'lucide-react';

export default function GoalCard({
  goal,
  onView,
  onEdit,
  onDelete,
  onUpdateProgress,
  className = ''
}) {
  const {
    title,
    category,
    progress = 0,
    currentValue = 0,
    targetValue = 100,
    unit = '',
    targetDate,
    priority = 'Medium',
    status = 'Not Started',
    description
  } = goal;

  const priorityVariants = {
    High: 'rose',
    Medium: 'amber',
    Low: 'slate'
  };

  const statusIcons = {
    Completed: CheckCircle2,
    'In Progress': Clock,
    'Not Started': AlertCircle,
    Archived: Archive
  };

  const StatusIcon = statusIcons[status] || Clock;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'No deadline';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  // Quick progress increment/decrement
  const handleQuickProgress = (delta, e) => {
    e.stopPropagation();
    if (!onUpdateProgress) return;
    const newCur = Math.max(0, Math.min(targetValue, Number(currentValue) + delta));
    const newProg = targetValue > 0 ? Math.min(100, Math.round((newCur / targetValue) * 100)) : 0;
    onUpdateProgress(goal.id, { currentValue: newCur, progress: newProg });
  };

  return (
    <Card
      hover
      className={`p-5 flex flex-col justify-between group cursor-pointer transition-all border border-slate-200/90 shadow-2xs hover:shadow-md ${className}`}
      onClick={() => onView?.(goal)}
    >
      <div>
        {/* Top Badges & Actions */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            {category && (
              <Badge variant="indigo" size="sm">
                {category}
              </Badge>
            )}
            <Badge variant={priorityVariants[priority] || 'slate'} size="sm" dot>
              {priority} Priority
            </Badge>
          </div>

          {/* Action buttons (hover) */}
          <div
            onClick={e => e.stopPropagation()}
            className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {onView && (
              <button
                onClick={() => onView(goal)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                title="View"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
            )}
            {onEdit && (
              <button
                onClick={() => onEdit(goal)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                title="Edit"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(goal)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Title & Description */}
        <h3 className="text-base font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors tracking-tight line-clamp-1">
          {title}
        </h3>
        {description && (
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            {description}
          </p>
        )}

        {/* Progress Bar & Numerical Target */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
            <span className="text-slate-700 font-semibold flex items-center gap-1">
              <span>{currentValue} / {targetValue}</span>
              {unit && <span className="text-slate-500 font-normal">{unit}</span>}
            </span>
            <span className="font-bold text-indigo-600">{progress}%</span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                progress >= 100
                  ? 'bg-emerald-500'
                  : progress >= 50
                  ? 'bg-indigo-600'
                  : 'bg-indigo-400'
              }`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>

          {/* Quick Progress Adjusters */}
          {onUpdateProgress && status !== 'Archived' && (
            <div
              onClick={e => e.stopPropagation()}
              className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 opacity-80 group-hover:opacity-100 transition-opacity"
            >
              <span>Quick update:</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={e => handleQuickProgress(-1, e)}
                  disabled={currentValue <= 0}
                  className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors disabled:opacity-40"
                  title="Decrease by 1"
                >
                  <Minus className="w-3 h-3 inline" /> 1
                </button>
                <button
                  type="button"
                  onClick={e => handleQuickProgress(1, e)}
                  disabled={currentValue >= targetValue}
                  className="px-2 py-0.5 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium transition-colors disabled:opacity-40"
                  title="Increase by 1"
                >
                  <Plus className="w-3 h-3 inline" /> 1
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-slate-500">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>Due: {formatDate(targetDate)}</span>
        </div>

        <div className="flex items-center gap-1 font-medium">
          <StatusIcon
            className={`w-3.5 h-3.5 ${
              status === 'Completed'
                ? 'text-emerald-500'
                : status === 'In Progress'
                ? 'text-indigo-500'
                : status === 'Archived'
                ? 'text-slate-400'
                : 'text-amber-500'
            }`}
          />
          <span
            className={
              status === 'Completed'
                ? 'text-emerald-700'
                : status === 'In Progress'
                ? 'text-indigo-700'
                : status === 'Archived'
                ? 'text-slate-500'
                : 'text-amber-700'
            }
          >
            {status}
          </span>
        </div>
      </div>
    </Card>
  );
}
