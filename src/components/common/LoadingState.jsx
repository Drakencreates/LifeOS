import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingState({ message = 'Loading LifeOS...', className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center ${className}`}>
      <div className="relative flex items-center justify-center w-12 h-12 mb-3">
        <div className="w-10 h-10 rounded-full border-2 border-indigo-100 border-t-indigo-600 animate-spin" />
        <Loader2 className="w-5 h-5 text-indigo-600 animate-spin absolute" />
      </div>
      <p className="text-sm font-medium text-slate-600">{message}</p>
      <p className="text-xs text-slate-400 mt-1">Organizing your personal timeline</p>
    </div>
  );
}
