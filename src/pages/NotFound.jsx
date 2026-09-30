import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Home, ArrowLeft } from 'lucide-react';
import Button from '../components/common/Button';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4 shadow-xs">
        <Compass className="w-8 h-8" />
      </div>
      <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1">
        Error 404
      </span>
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
        Page Not Found
      </h1>
      <p className="text-sm text-slate-500 max-w-sm mt-2 mb-6 leading-relaxed">
        The life sector or route you are navigating to does not exist or has been shifted in your timeline.
      </p>

      <div className="flex items-center gap-3">
        <Button
          variant="secondary"
          icon={ArrowLeft}
          onClick={() => navigate(-1)}
        >
          Go Back
        </Button>
        <Button
          icon={Home}
          onClick={() => navigate('/')}
        >
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
}
