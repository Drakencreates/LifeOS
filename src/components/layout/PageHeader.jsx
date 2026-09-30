import React from 'react';

export default function PageHeader({
  title,
  description,
  breadcrumbs = [],
  actions,
  className = ''
}) {
  return (
    <div className={`mb-6 sm:mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 ${className}`}>
      <div>
        {breadcrumbs.length > 0 && (
          <nav className="flex items-center space-x-1.5 text-xs text-slate-400 mb-1.5 font-medium">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span>/</span>}
                <span className={idx === breadcrumbs.length - 1 ? 'text-slate-600' : 'hover:text-slate-600'}>
                  {crumb}
                </span>
              </React.Fragment>
            ))}
          </nav>
        )}
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-3 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
