import React, { useState } from 'react';

export default function Avatar({
  src,
  name = 'User',
  size = 'md',
  status,
  className = ''
}) {
  const [imageError, setImageError] = useState(false);

  const sizes = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl font-semibold',
    '2xl': 'w-24 h-24 text-2xl font-bold'
  };

  const statusSizes = {
    xs: 'w-1.5 h-1.5 ring-1',
    sm: 'w-2 h-2 ring-1.5',
    md: 'w-2.5 h-2.5 ring-2',
    lg: 'w-3 h-3 ring-2',
    xl: 'w-3.5 h-3.5 ring-2',
    '2xl': 'w-4 h-4 ring-2'
  };

  const getInitials = (str) => {
    if (!str) return 'U';
    const parts = str.trim().split(' ');
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className={`relative inline-flex shrink-0 select-none ${className}`}>
      {src && !imageError ? (
        <img
          src={src}
          alt={name}
          onError={() => setImageError(true)}
          className={`${sizes[size] || sizes.md} rounded-full object-cover ring-1 ring-slate-200/80 shadow-2xs`}
        />
      ) : (
        <div
          className={`${sizes[size] || sizes.md} rounded-full bg-linear-to-tr from-indigo-600 to-indigo-500 text-white font-medium flex items-center justify-center ring-1 ring-indigo-200 shadow-2xs`}
        >
          {getInitials(name)}
        </div>
      )}

      {status && (
        <span
          className={`absolute bottom-0 right-0 rounded-full ring-white ${statusSizes[size] || statusSizes.md} ${
            status === 'online'
              ? 'bg-emerald-500'
              : status === 'away'
              ? 'bg-amber-500'
              : 'bg-slate-400'
          }`}
        />
      )}
    </div>
  );
}
