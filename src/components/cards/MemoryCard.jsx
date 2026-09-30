import React from 'react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import { Calendar, MapPin, Heart, Sparkles, Pencil, Trash2, Eye } from 'lucide-react';

const DEFAULT_MEMORY_IMG = 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=600&q=80';

export default function MemoryCard({
  memory,
  onView,
  onEdit,
  onDelete,
  className = ''
}) {
  const {
    title,
    memoryDate,
    date,
    location,
    description,
    category,
    mood,
    imageUrl,
    image,
    tags
  } = memory;

  const displayImage = imageUrl || image || DEFAULT_MEMORY_IMG;
  const displayDate = memoryDate || date;

  const parsedTags = Array.isArray(tags)
    ? tags
    : typeof tags === 'string' && tags.trim()
    ? tags.split(',').map(t => t.trim()).filter(Boolean)
    : [];

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <Card
      hover
      className={`overflow-hidden flex flex-col group cursor-pointer transition-all border border-slate-200/90 shadow-2xs hover:shadow-md ${className}`}
      onClick={() => onView?.(memory)}
    >
      {/* Image Banner */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-900">
        <img
          src={displayImage}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = DEFAULT_MEMORY_IMG;
          }}
        />
        <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-transparent to-black/20" />

        {/* Top Badges & Actions */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5 flex-wrap">
            {category && (
              <Badge variant="slate" size="sm" className="bg-white/90 backdrop-blur-xs text-slate-800 border-none font-semibold">
                {category}
              </Badge>
            )}
            {mood && (
              <span className="text-[10px] font-semibold bg-indigo-600/90 text-white backdrop-blur-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                {mood}
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div
            onClick={e => e.stopPropagation()}
            className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/60 backdrop-blur-xs p-1 rounded-lg"
          >
            {onView && (
              <button
                onClick={() => onView(memory)}
                className="p-1 rounded text-white/80 hover:text-white hover:bg-white/20 transition-colors"
                title="View"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
            )}
            {onEdit && (
              <button
                onClick={() => onEdit(memory)}
                className="p-1 rounded text-white/80 hover:text-indigo-300 hover:bg-white/20 transition-colors"
                title="Edit"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(memory)}
                className="p-1 rounded text-white/80 hover:text-rose-300 hover:bg-white/20 transition-colors"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Date on bottom of image */}
        <div className="absolute bottom-2.5 left-3 right-3 text-white">
          <span className="text-xs font-medium text-slate-200 drop-shadow-xs flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(displayDate)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors tracking-tight line-clamp-1">
            {title}
          </h3>
          {location && (
            <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{location}</span>
            </div>
          )}
          {description && (
            <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {/* Tags */}
        <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 flex-wrap">
            {parsedTags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="text-[10px] font-medium text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200/50"
              >
                #{tag}
              </span>
            ))}
          </div>
          <Heart className="w-4 h-4 text-slate-300 group-hover:text-rose-500 transition-colors" />
        </div>
      </div>
    </Card>
  );
}
