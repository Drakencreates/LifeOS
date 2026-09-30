import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Camera,
  Search,
  Plus,
  Calendar,
  MapPin,
  RefreshCw,
  X,
  Pencil,
  Trash2
} from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import MemoryCard from '../components/cards/MemoryCard';
import Modal from '../components/common/Modal';
import EmptyState from '../components/common/EmptyState';
import ConfirmDialog from '../components/common/ConfirmDialog';
import MemoryFormModal from '../components/memories/MemoryFormModal';
import { useToast } from '../context/ToastContext';
import memoryService from '../services/memoryService';

export default function Memories() {
  const toast = useToast();

  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMemory, setEditingMemory] = useState(null);
  const [viewingMemory, setViewingMemory] = useState(null);
  const [deletingMemory, setDeletingMemory] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await memoryService.getMemories();
      setMemories(data || []);
    } catch {
      toast.error('Failed to load memories.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Extract all unique tags across memories
  const allTags = useMemo(() => {
    const tagsSet = new Set(['All']);
    memories.forEach(m => {
      if (typeof m.tags === 'string' && m.tags.trim()) {
        m.tags.split(',').forEach(t => tagsSet.add(t.trim()));
      } else if (Array.isArray(m.tags)) {
        m.tags.forEach(t => tagsSet.add(t));
      }
    });
    return Array.from(tagsSet);
  }, [memories]);

  // Filter memories by search & tag
  const filteredMemories = useMemo(() => {
    return memories.filter(mem => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = mem.title?.toLowerCase().includes(q);
        const descMatch = mem.description?.toLowerCase().includes(q);
        const locMatch = mem.location?.toLowerCase().includes(q);
        const tagMatch = typeof mem.tags === 'string'
          ? mem.tags.toLowerCase().includes(q)
          : Array.isArray(mem.tags) && mem.tags.some(t => t.toLowerCase().includes(q));
        if (!titleMatch && !descMatch && !locMatch && !tagMatch) return false;
      }

      if (selectedTag !== 'All') {
        const memTags = typeof mem.tags === 'string'
          ? mem.tags.split(',').map(t => t.trim())
          : Array.isArray(mem.tags)
          ? mem.tags
          : [];
        if (!memTags.includes(selectedTag)) return false;
      }

      return true;
    });
  }, [memories, searchQuery, selectedTag]);

  // Save handler (Add / Edit)
  const handleMemorySaved = (savedMemory, isEdit) => {
    if (isEdit) {
      setMemories(prev => prev.map(m => (m.id === savedMemory.id ? savedMemory : m)));
      if (viewingMemory?.id === savedMemory.id) {
        setViewingMemory(savedMemory);
      }
    } else {
      setMemories(prev => [savedMemory, ...prev]);
    }
  };

  // Delete handler
  const handleDeleteMemory = async () => {
    if (!deletingMemory) return;
    setDeleteLoading(true);
    try {
      await memoryService.deleteMemory(deletingMemory.id);
      setMemories(prev => prev.filter(m => m.id !== deletingMemory.id));
      if (viewingMemory?.id === deletingMemory.id) {
        setViewingMemory(null);
      }
      toast.success('Memory deleted from your vault.');
      setDeletingMemory(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete memory.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const parsedViewingTags = useMemo(() => {
    if (!viewingMemory?.tags) return [];
    if (Array.isArray(viewingMemory.tags)) return viewingMemory.tags;
    return viewingMemory.tags.split(',').map(t => t.trim()).filter(Boolean);
  }, [viewingMemory]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <PageHeader
        title="Memory Vault"
        description="A visual gallery of your personal highlights, milestone reflections, and cherished moments."
        breadcrumbs={['LifeOS', 'Memories']}
        actions={
          <div className="flex items-center gap-2.5">
            <Button
              variant="secondary"
              icon={RefreshCw}
              onClick={() => loadData(true)}
              className={refreshing ? 'animate-spin' : ''}
              title="Refresh Vault"
            >
              Refresh
            </Button>
            <Button icon={Plus} onClick={() => setIsAddModalOpen(true)}>
              Capture Memory
            </Button>
          </div>
        }
      />

      {/* Filter and Search Bar */}
      <Card className="p-4 sm:p-5 shadow-xs border-slate-200/80 bg-white/90 backdrop-blur-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search memories by keyword, place, or tag..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2 rounded-xl text-sm bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Tags Pills */}
          {allTags.length > 1 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-xs font-semibold text-slate-400 mr-1 shrink-0">Tag:</span>
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer ${
                    selectedTag === tag
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tag === 'All' ? 'All Tags' : `#${tag}`}
                </button>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="animate-pulse rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
              <div className="h-48 bg-slate-200" />
              <div className="p-4 space-y-3">
                <div className="h-5 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
                <div className="h-12 bg-slate-200 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredMemories.length === 0 ? (
        /* Empty State */
        <EmptyState
          icon={Camera}
          title={memories.length === 0 ? 'Your Memory Vault is Empty' : 'No memories match your search'}
          description={
            memories.length === 0
              ? 'Capture your first milestone photograph, story, or reflection to start preserving your life journey.'
              : 'Try clearing your search terms or selecting another tag.'
          }
          actionLabel={memories.length === 0 ? 'Capture First Memory' : 'Reset Search'}
          onAction={memories.length === 0 ? () => setIsAddModalOpen(true) : () => { setSearchQuery(''); setSelectedTag('All'); }}
        />
      ) : (
        /* Memory Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMemories.map(mem => (
            <MemoryCard
              key={mem.id}
              memory={mem}
              onView={m => setViewingMemory(m)}
              onEdit={m => setEditingMemory(m)}
              onDelete={m => setDeletingMemory(m)}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Memory Modal */}
      <MemoryFormModal
        isOpen={isAddModalOpen || !!editingMemory}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingMemory(null);
        }}
        onSaved={handleMemorySaved}
        initialData={editingMemory}
      />

      {/* View Memory Detail Modal */}
      {viewingMemory && (
        <Modal
          isOpen={!!viewingMemory}
          onClose={() => setViewingMemory(null)}
          title={viewingMemory.title}
          description={new Date(viewingMemory.memoryDate || viewingMemory.date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
          maxWidth="max-w-2xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <Button
                variant="danger"
                size="sm"
                icon={Trash2}
                onClick={() => setDeletingMemory(viewingMemory)}
              >
                Delete
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  icon={Pencil}
                  onClick={() => {
                    setEditingMemory(viewingMemory);
                    setViewingMemory(null);
                  }}
                >
                  Edit Memory
                </Button>
                <Button onClick={() => setViewingMemory(null)}>
                  Close
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-4">
            {/* Image display */}
            {(viewingMemory.imageUrl || viewingMemory.image) && (
              <div className="rounded-2xl overflow-hidden max-h-96 w-full bg-slate-950 shadow-inner border border-slate-200">
                <img
                  src={viewingMemory.imageUrl || viewingMemory.image}
                  alt={viewingMemory.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Info bar */}
            <div className="flex items-center justify-between flex-wrap gap-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="flex items-center gap-1.5 font-medium">
                <Calendar className="w-4 h-4 text-slate-400" />
                {new Date(viewingMemory.memoryDate || viewingMemory.date).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
              {viewingMemory.location && (
                <span className="flex items-center gap-1.5 font-medium">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {viewingMemory.location}
                </span>
              )}
            </div>

            {/* Story / Description */}
            {viewingMemory.description && (
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Story & Reflection
                </span>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {viewingMemory.description}
                </p>
              </div>
            )}

            {/* Tags */}
            {parsedViewingTags.length > 0 && (
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Tags
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {parsedViewingTags.map((t, i) => (
                    <Badge key={i} variant="slate">
                      #{t}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingMemory}
        onClose={() => setDeletingMemory(null)}
        onConfirm={handleDeleteMemory}
        isLoading={deleteLoading}
        title="Delete Memory"
        description={`"${deletingMemory?.title}" will be permanently removed from your memory vault.`}
        confirmLabel="Delete Memory"
      />
    </div>
  );
}
