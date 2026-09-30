import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  FileText,
  Search,
  Upload,
  Download,
  LayoutGrid,
  List,
  ShieldCheck,
  HardDrive,
  RefreshCw,
  X,
  Trash2,
  ArrowUpDown
} from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Card from '../components/common/Card';
import DocumentCard from '../components/cards/DocumentCard';
import { formatBytes, getFileTypeConfig } from '../utils/fileUtils';
import Modal from '../components/common/Modal';
import EmptyState from '../components/common/EmptyState';
import ConfirmDialog from '../components/common/ConfirmDialog';
import DocumentUploadModal from '../components/documents/DocumentUploadModal';
import { useToast } from '../context/ToastContext';
import documentService from '../services/documentService';

const CATEGORIES = [
  'All',
  'Certificates',
  'Academic',
  'Career',
  'Identity',
  'Projects',
  'Personal',
  'Other'
];

export default function Documents() {
  const toast = useToast();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' (Newest) or 'asc' (Oldest)
  const [viewMode, setViewMode] = useState('grid');

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [viewingDoc, setViewingDoc] = useState(null);
  const [deletingDoc, setDeletingDoc] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Load documents
  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await documentService.getDocuments({ sort: sortOrder });
      setDocuments(data || []);
    } catch {
      toast.error('Failed to load documents.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [sortOrder, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle uploaded document
  const handleUploaded = (newDoc) => {
    setDocuments(prev => [newDoc, ...prev]);
  };

  // Handle Delete document
  const handleDeleteDocument = async () => {
    if (!deletingDoc) return;
    setDeleteLoading(true);
    try {
      await documentService.deleteDocument(deletingDoc.id);
      setDocuments(prev => prev.filter(d => d.id !== deletingDoc.id));
      if (viewingDoc?.id === deletingDoc.id) {
        setViewingDoc(null);
      }
      toast.success('Document deleted successfully.');
      setDeletingDoc(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete document.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Handle Download document
  const handleDownload = async (doc) => {
    try {
      toast.info(`Preparing download for "${doc.fileName}"...`);
      // Trigger download using direct authenticated link or blob
      const token = localStorage.getItem('lifeos_token');
      const downloadUrl = `http://localhost:5000/api/documents/${doc.id}/download`;

      // Fetch with Authorization header and trigger blob download
      const response = await fetch(downloadUrl, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = doc.fileName;
      window.document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      window.document.body.removeChild(a);
      toast.success(`Downloaded "${doc.fileName}"`);
    } catch {
      toast.error('Failed to download document.');
    }
  };

  // Filter and sort documents
  const filteredDocs = useMemo(() => {
    return documents.filter(doc => {
      // Category filter
      if (selectedCategory !== 'All' && doc.category !== selectedCategory) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = doc.title?.toLowerCase().includes(q);
        const nameMatch = doc.fileName?.toLowerCase().includes(q);
        const descMatch = doc.description?.toLowerCase().includes(q);
        const catMatch = doc.category?.toLowerCase().includes(q);
        if (!titleMatch && !nameMatch && !descMatch && !catMatch) return false;
      }

      return true;
    }).sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });
  }, [documents, selectedCategory, searchQuery, sortOrder]);

  // Total storage metrics
  const totalStorageBytes = useMemo(() => {
    return documents.reduce((sum, d) => sum + (Number(d.fileSize) || 0), 0);
  }, [documents]);

  const viewingTypeCfg = viewingDoc ? getFileTypeConfig(viewingDoc.fileType, viewingDoc.fileName) : null;
  const ViewingIcon = viewingTypeCfg?.icon || FileText;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <PageHeader
        title="Documents & Records"
        description="Securely manage your academic transcripts, credentials, project portfolios, and verification files."
        breadcrumbs={['LifeOS', 'Documents']}
        actions={
          <div className="flex items-center gap-2.5">
            <Button
              variant="secondary"
              icon={RefreshCw}
              onClick={() => loadData(true)}
              className={refreshing ? 'animate-spin' : ''}
              title="Refresh Documents"
            >
              Refresh
            </Button>
            <Button icon={Upload} onClick={() => setIsUploadOpen(true)}>
              Upload Document
            </Button>
          </div>
        }
      />

      {/* Storage & Records Indicator Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-3.5 border-slate-200/80">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">Storage Used</span>
            <p className="text-base font-bold text-slate-900">
              {formatBytes(totalStorageBytes)} <span className="text-xs font-normal text-slate-400">/ 10 GB</span>
            </p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3.5 border-slate-200/80">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">Access Control</span>
            <p className="text-base font-bold text-slate-900">End-to-End Isolated</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3.5 border-slate-200/80">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">Total Records</span>
            <p className="text-base font-bold text-slate-900">{documents.length} Files Archived</p>
          </div>
        </Card>
      </div>

      {/* Toolbar & Filters */}
      <Card className="p-4 sm:p-5 shadow-xs border-slate-200/80 bg-white/90 backdrop-blur-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {CATEGORIES.map(cat => {
              const count = cat === 'All' ? documents.length : documents.filter(d => d.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                    selectedCategory === cat
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      selectedCategory === cat ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search, Sort, View Controls */}
          <div className="flex items-center gap-2.5 flex-1 md:max-w-md justify-end">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-1.5 rounded-lg text-xs bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort Toggle */}
            <Button
              variant="secondary"
              size="sm"
              icon={ArrowUpDown}
              onClick={() => setSortOrder(prev => (prev === 'desc' ? 'asc' : 'desc'))}
              title={sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
            >
              {sortOrder === 'desc' ? 'Newest' : 'Oldest'}
            </Button>

            {/* Grid / List View Toggle */}
            <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 cursor-pointer transition-colors ${
                  viewMode === 'grid' ? 'bg-slate-200 text-slate-900' : 'bg-white text-slate-400 hover:text-slate-600'
                }`}
                title="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 cursor-pointer transition-colors ${
                  viewMode === 'list' ? 'bg-slate-200 text-slate-900' : 'bg-white text-slate-400 hover:text-slate-600'
                }`}
                title="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Documents Grid / List */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="animate-pulse p-5 rounded-2xl bg-slate-100 border border-slate-200 space-y-4">
              <div className="flex gap-3">
                <div className="w-11 h-11 bg-slate-200 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                </div>
              </div>
              <div className="h-8 bg-slate-200 rounded" />
            </div>
          ))}
        </div>
      ) : filteredDocs.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={documents.length === 0 ? 'No documents uploaded yet' : 'No documents match your filters'}
          description={
            documents.length === 0
              ? 'Upload your degree certificates, identification cards, career portfolios, or academic records to keep them safe.'
              : 'Try clearing your search term or selecting another category.'
          }
          actionLabel={documents.length === 0 ? 'Upload First Document' : 'Reset Search'}
          onAction={documents.length === 0 ? () => setIsUploadOpen(true) : () => { setSearchQuery(''); setSelectedCategory('All'); }}
        />
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-3'}>
          {filteredDocs.map(doc => (
            <DocumentCard
              key={doc.id}
              document={doc}
              viewMode={viewMode}
              onView={d => setViewingDoc(d)}
              onDownload={d => handleDownload(d)}
              onDelete={d => setDeletingDoc(d)}
            />
          ))}
        </div>
      )}

      {/* Upload Document Modal */}
      <DocumentUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploaded={handleUploaded}
      />

      {/* View Document Detail Modal */}
      {viewingDoc && (
        <Modal
          isOpen={!!viewingDoc}
          onClose={() => setViewingDoc(null)}
          title={viewingDoc.title || viewingDoc.fileName}
          description={`${viewingDoc.category} • ${formatBytes(viewingDoc.fileSize)} • Uploaded on ${new Date(viewingDoc.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`}
          maxWidth="max-w-2xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <Button
                variant="danger"
                size="sm"
                icon={Trash2}
                onClick={() => setDeletingDoc(viewingDoc)}
              >
                Delete
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  icon={Download}
                  onClick={() => handleDownload(viewingDoc)}
                >
                  Download File
                </Button>
                <Button onClick={() => setViewingDoc(null)}>
                  Close
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-4">
            {/* Header file info card */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs ${viewingTypeCfg.color}`}>
                  <ViewingIcon className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-slate-900 truncate">
                    {viewingDoc.fileName}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                    <span>{formatBytes(viewingDoc.fileSize)}</span>
                    <span>•</span>
                    <span className="uppercase">{viewingTypeCfg.label}</span>
                    <span>•</span>
                    <Badge variant="indigo" size="sm">{viewingDoc.category}</Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            {viewingDoc.description ? (
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Document Notes / Description
                </span>
                <p className="text-sm text-slate-700 leading-relaxed bg-white p-4 rounded-xl border border-slate-200">
                  {viewingDoc.description}
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No additional notes added for this document.</p>
            )}

            {/* Security Notice */}
            <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200/60 flex items-center gap-2.5 text-xs text-emerald-800 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>This document is encrypted and accessible only through your authenticated LifeOS account.</span>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingDoc}
        onClose={() => setDeletingDoc(null)}
        onConfirm={handleDeleteDocument}
        isLoading={deleteLoading}
        title="Delete Document"
        description={`"${deletingDoc?.title || deletingDoc?.fileName}" will be permanently removed from your vault.`}
        confirmLabel="Delete Document"
      />
    </div>
  );
}
