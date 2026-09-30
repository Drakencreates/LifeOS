import React from 'react';
import Card from '../common/Card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function StatCard({
  title,
  value,
  change,
  trend = 'up',
  icon: Icon,
  description,
  className = ''
}) {
  return (
    <Card hover className={`p-5 flex flex-col justify-between ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100/60 flex items-center justify-center text-indigo-600 shrink-0">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          {value}
        </span>
        {change && (
          <div
            className={`inline-flex items-center text-xs font-semibold ${
              trend === 'up'
                ? 'text-emerald-600'
                : trend === 'down'
                ? 'text-rose-600'
                : 'text-slate-500'
            }`}
          >
            {trend === 'up' && <TrendingUp className="w-3.5 h-3.5 mr-0.5" />}
            {trend === 'down' && <TrendingDown className="w-3.5 h-3.5 mr-0.5" />}
            {trend === 'neutral' && <Minus className="w-3.5 h-3.5 mr-0.5" />}
            <span>{change}</span>
          </div>
        )}
      </div>

      {description && (
        <p className="text-xs text-slate-400 mt-2 truncate">
          {description}
        </p>
      )}
    </Card>
  );
}
