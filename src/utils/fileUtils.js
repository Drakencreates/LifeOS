import {
  FileText,
  FileImage,
  FileCode,
  FileSpreadsheet,
  Archive,
  File
} from 'lucide-react';

export function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function getFileTypeConfig(type = '', fileName = '') {
  const t = (type || '').toLowerCase();
  const ext = (fileName || '').split('.').pop()?.toLowerCase();

  if (t.includes('pdf') || ext === 'pdf') {
    return {
      icon: FileText,
      color: 'text-rose-600 bg-rose-50 border-rose-200/80',
      label: 'PDF'
    };
  }
  if (t.includes('image') || ['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif'].includes(ext)) {
    return {
      icon: FileImage,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200/80',
      label: 'IMAGE'
    };
  }
  if (t.includes('sheet') || t.includes('excel') || ['csv', 'xlsx', 'xls'].includes(ext)) {
    return {
      icon: FileSpreadsheet,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200/80',
      label: 'SHEET'
    };
  }
  if (t.includes('zip') || t.includes('tar') || ['zip', 'rar', '7z', 'gz'].includes(ext)) {
    return {
      icon: Archive,
      color: 'text-amber-600 bg-amber-50 border-amber-200/80',
      label: 'ARCHIVE'
    };
  }
  if (['js', 'jsx', 'ts', 'tsx', 'py', 'json', 'html', 'css'].includes(ext)) {
    return {
      icon: FileCode,
      color: 'text-purple-600 bg-purple-50 border-purple-200/80',
      label: 'CODE'
    };
  }
  return {
    icon: File,
    color: 'text-indigo-600 bg-indigo-50 border-indigo-200/80',
    label: (ext || 'DOC').toUpperCase()
  };
}
