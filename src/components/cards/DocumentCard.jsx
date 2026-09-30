import React from 'react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import {
  Download,
  Eye,
  Trash2
} from 'lucide-react';
import { formatBytes, getFileTypeConfig } from '../../utils/fileUtils';

export default function DocumentCard({
  document: doc,
  onView,
  onDownload,
  onDelete,
  viewMode = 'grid',
  className = ''
}) {
  const {
    title,
    fileName,
    fileSize,
    fileType,
    category = 'Other',
    description,
    createdAt
  } = doc;

  const typeConfig = getFileTypeConfig(fileType, fileName);
  const IconComp = typeConfig.icon;
  const formattedSize = formatBytes(fileSize);
  const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  if (viewMode === 'list') {
    return (
      <div
        onClick={() => onView?.(doc)}
        className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200/80 hover:border-indigo-300 hover:shadow-xs transition-all group cursor-pointer"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div className={`w-11 h-11 rounded-xl border flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs ${typeConfig.color}`}>
            <IconComp className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
              {title || fileName}
            </h3>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5 flex-wrap">
              <span className="text-slate-600 font-medium">{fileName}</span>
              <span>•</span>
              <span>{formattedSize}</span>
              <span>•</span>
              <span>{formattedDate}</span>
              {category && (
                <>
                  <span>•</span>
                  <Badge variant="slate" size="sm">{category}</Badge>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
          <Button
            size="xs"
            variant="ghost"
            icon={Eye}
            onClick={() => onView?.(doc)}
            title="Preview"
          >
            Preview
          </Button>
          <Button
            size="xs"
            variant="secondary"
            icon={Download}
            onClick={() => onDownload?.(doc)}
            title="Download"
          >
            Download
          </Button>
          {onDelete && (
            <button
              onClick={() => onDelete?.(doc)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card
      hover
      className={`p-5 flex flex-col justify-between group cursor-pointer transition-all border border-slate-200/90 shadow-2xs hover:shadow-md ${className}`}
      onClick={() => onView?.(doc)}
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-11 h-11 rounded-xl border flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs ${typeConfig.color}`}>
              <IconComp className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                {title || fileName}
              </h3>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                <span>{formattedSize}</span>
                <span>•</span>
                <span>{typeConfig.label}</span>
              </div>
            </div>
          </div>

          <Badge variant="indigo" size="sm">
            {category}
          </Badge>
        </div>

        {description ? (
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
            {description}
          </p>
        ) : (
          <p className="text-xs text-slate-400 italic line-clamp-1 mb-3">
            {fileName}
          </p>
        )}
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
        <span>Uploaded {formattedDate}</span>

        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => onView?.(doc)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
            title="Preview"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDownload?.(doc)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
            title="Download"
          >
            <Download className="w-4 h-4" />
          </button>
          {onDelete && (
            <button
              onClick={() => onDelete?.(doc)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}
