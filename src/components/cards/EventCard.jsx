import React from 'react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import { Calendar, MapPin, Sparkles, ArrowRight } from 'lucide-react';

export default function EventCard({
  event,
  onView,
  className = ''
}) {
  const {
    title,
    category,
    date,
    year,
    location,
    description,
    isMilestone,
    badgeColor = 'indigo',
    tags = []
  } = event;

  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <Card hover className={`p-5 flex flex-col justify-between group cursor-pointer ${className}`} onClick={() => onView?.(event)}>
      <div>
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={badgeColor} size="sm" dot>
              {category}
            </Badge>
            {isMilestone && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Milestone
              </span>
            )}
          </div>
          <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
            {year}
          </span>
        </div>

        <h3 className="text-base font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors tracking-tight">
          {title}
        </h3>

        <div className="mt-2 flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{formatDate(date)}</span>
          </div>
          {location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate max-w-[180px]">{location}</span>
            </div>
          )}
        </div>

        <p className="text-xs text-slate-600 mt-2.5 line-clamp-2 leading-relaxed">
          {description}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-1.5 flex-wrap">
          {tags.slice(0, 2).map((tag, idx) => (
            <span
              key={idx}
              className="text-[10px] font-medium text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200/60"
            >
              #{tag}
            </span>
          ))}
          {tags.length > 2 && (
            <span className="text-[10px] text-slate-400 font-medium">
              +{tags.length - 2}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-xs font-medium text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
          <span>Details</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </Card>
  );
}
