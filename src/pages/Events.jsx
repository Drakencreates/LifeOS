import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Calendar,
  Search,
  Plus,
  LayoutGrid,
  List,
  MapPin,
  Sparkles,
  Eye,
  Pencil,
  Trash2,
  SlidersHorizontal,
  Star,
  Flag,
  Clock,
  Lock,
  Globe,
  RefreshCw
} from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Badge from '../components/common/Badge';
import Card from '../components/common/Card';
import Modal from '../components/common/Modal';
import EmptyState from '../components/common/EmptyState';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { useToast } from '../context/ToastContext';
import eventService from '../services/eventService';
import categoryService from '../services/categoryService';
import EventFormModal from '../components/events/EventFormModal';

const IMPORTANCE_CONFIG = {
  Normal: { label: 'Normal', color: 'slate', icon: Clock },
  Important: { label: 'Important', color: 'indigo', icon: Star },
  Milestone: { label: 'Milestone', color: 'amber', icon: Flag }
};

function EventCard({ event, onView, onEdit, onDelete, viewMode }) {
  const cfg = IMPORTANCE_CONFIG[event.importance] || IMPORTANCE_CONFIG.Normal;
  const ImpIcon = cfg.icon;
  const dateStr = new Date(event.eventDate).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });

  if (viewMode === 'list') {
    return (
      <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-slate-200/80 hover:border-indigo-200 hover:shadow-sm transition-all group">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white shadow-sm"
          style={{ backgroundColor: event.category?.color || '#6366f1' }}
        >
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                {event.title}
              </h3>
              <div className="flex items-center flex-wrap gap-2 mt-1">
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />{dateStr}
                </span>
                {event.location && (
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />{event.location}
                  </span>
                )}
                {event.category && (
                  <Badge variant="indigo" size="sm">{event.category.name}</Badge>
                )}
                <Badge variant={cfg.color} size="sm">
                  <ImpIcon className="w-2.5 h-2.5 inline mr-1" />{cfg.label}
                </Badge>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  {event.visibility === 'Private' ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                  {event.visibility}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => onView(event)} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                <Eye className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => onEdit(event)} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => onDelete(event)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          {event.description && (
            <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">{event.description}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className="hover:border-indigo-200 hover:shadow-md transition-all group cursor-pointer flex flex-col">
      <div className="p-4 flex-1">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0"
            style={{ backgroundColor: event.category?.color || '#6366f1' }}
          >
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => onEdit(event)} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => onDelete(event)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <h3
          onClick={() => onView(event)}
          className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug mb-1"
        >
          {event.title}
        </h3>

        {event.description && (
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">{event.description}</p>
        )}

        <div className="flex flex-wrap gap-1.5 mt-auto">
          <Badge variant={cfg.color} size="sm">
            <ImpIcon className="w-2.5 h-2.5 inline mr-1" />{cfg.label}
          </Badge>
          {event.category && (
            <Badge variant="indigo" size="sm">{event.category.name}</Badge>
          )}
        </div>
      </div>

      <div className="px-4 pb-4 border-t border-slate-100 pt-3 flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />{dateStr}
        </span>
        <span className="flex items-center gap-1">
          {event.visibility === 'Private' ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
          {event.visibility}
        </span>
      </div>
    </Card>
  );
}

export default function Events() {
  const toast = useToast();

  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedImportance, setSelectedImportance] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('grid');

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [viewingEvent, setViewingEvent] = useState(null);
  const [deletingEvent, setDeletingEvent] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Load events and categories
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [evts, cats] = await Promise.all([
        eventService.getEvents({ sort: sortOrder }),
        categoryService.getCategories()
      ]);
      setEvents(evts);
      setCategories(cats);
    } catch {
      setError('Failed to load events. Please refresh.');
      toast.error('Could not load events.');
    } finally {
      setLoading(false);
    }
  }, [sortOrder, toast]);

  useEffect(() => { loadData(); }, [loadData]);

  // Client-side filtering (server also supports it via query params, but client filter is instant UX)
  const filtered = useMemo(() => {
    return events.filter(e => {
      const q = searchQuery.toLowerCase();
      const matchSearch = !q ||
        e.title.toLowerCase().includes(q) ||
        e.description?.toLowerCase().includes(q) ||
        e.location?.toLowerCase().includes(q);
      const matchCat = !selectedCategory || e.categoryId === selectedCategory;
      const matchImp = !selectedImportance || e.importance === selectedImportance;
      return matchSearch && matchCat && matchImp;
    });
  }, [events, searchQuery, selectedCategory, selectedImportance]);

  const handleSaved = (savedEvent, isEdit) => {
    if (isEdit) {
      setEvents(prev => prev.map(e => e.id === savedEvent.id ? savedEvent : e));
    } else {
      setEvents(prev => [savedEvent, ...prev]);
    }
  };

  const handleDelete = async () => {
    if (!deletingEvent) return;
    setDeleteLoading(true);
    try {
      await eventService.deleteEvent(deletingEvent.id);
      setEvents(prev => prev.filter(e => e.id !== deletingEvent.id));
      toast.success('Event deleted.');
      setDeletingEvent(null);
    } catch {
      toast.error('Failed to delete event.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const dateStr = (dt) => new Date(dt).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Life Events"
        description={`${events.length} event${events.length !== 1 ? 's' : ''} recorded in your timeline.`}
        breadcrumbs={['LifeOS', 'Events']}
        actions={
          <Button icon={Plus} onClick={() => setIsAddOpen(true)}>
            Add Event
          </Button>
        }
      />

      {/* Filters Bar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search events..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              icon={Search}
            />
          </div>
          <Select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            placeholder="All Categories"
            options={categories.map(c => ({ value: c.id, label: c.name }))}
            className="sm:w-44"
          />
          <Select
            value={selectedImportance}
            onChange={e => setSelectedImportance(e.target.value)}
            placeholder="All Importance"
            options={['Normal', 'Important', 'Milestone']}
            className="sm:w-40"
          />
          <Select
            value={sortOrder}
            onChange={e => setSortOrder(e.target.value)}
            options={[
              { value: 'desc', label: 'Newest First' },
              { value: 'asc', label: 'Oldest First' }
            ]}
            className="sm:w-36"
          />
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={loadData}
            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors shrink-0"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Active filters display */}
        {(searchQuery || selectedCategory || selectedImportance) && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-500">Showing {filtered.length} of {events.length} events</span>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory(''); setSelectedImportance(''); }}
              className="text-xs text-indigo-600 hover:underline ml-auto"
            >
              Clear filters
            </button>
          </div>
        )}
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
            <p className="text-sm text-slate-500">Loading your events...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <EmptyState
          icon={RefreshCw}
          title="Could not load events"
          description={error}
          actionLabel="Try Again"
          onAction={loadData}
        />
      )}

      {/* Empty State */}
      {!loading && !error && filtered.length === 0 && (
        <EmptyState
          icon={Calendar}
          title={events.length === 0 ? "No events yet" : "No events match your filters"}
          description={
            events.length === 0
              ? "Start building your life timeline by adding your first event."
              : "Try adjusting your search or filters."
          }
          actionLabel={events.length === 0 ? "Add Your First Event" : undefined}
          onAction={events.length === 0 ? () => setIsAddOpen(true) : undefined}
        />
      )}

      {/* Events Grid / List */}
      {!loading && !error && filtered.length > 0 && (
        <div className={viewMode === 'grid'
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'
          : 'flex flex-col gap-3'
        }>
          {filtered.map(event => (
            <EventCard
              key={event.id}
              event={event}
              viewMode={viewMode}
              onView={setViewingEvent}
              onEdit={setEditingEvent}
              onDelete={setDeletingEvent}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <EventFormModal
        isOpen={isAddOpen || !!editingEvent}
        onClose={() => { setIsAddOpen(false); setEditingEvent(null); }}
        onSaved={handleSaved}
        initialData={editingEvent}
        categories={categories}
      />

      {/* View Detail Modal */}
      {viewingEvent && (
        <Modal
          isOpen={!!viewingEvent}
          onClose={() => setViewingEvent(null)}
          title={viewingEvent.title}
          description={dateStr(viewingEvent.eventDate)}
          footer={
            <>
              <Button variant="ghost" icon={Pencil} onClick={() => { setEditingEvent(viewingEvent); setViewingEvent(null); }}>
                Edit
              </Button>
              <Button variant="secondary" onClick={() => setViewingEvent(null)}>Close</Button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {viewingEvent.category && (
                <Badge variant="indigo" dot>{viewingEvent.category.name}</Badge>
              )}
              <Badge variant={IMPORTANCE_CONFIG[viewingEvent.importance]?.color || 'slate'}>
                {viewingEvent.importance}
              </Badge>
              <Badge variant={viewingEvent.visibility === 'Private' ? 'slate' : 'emerald'}>
                {viewingEvent.visibility}
              </Badge>
            </div>

            {viewingEvent.location && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{viewingEvent.location}</span>
              </div>
            )}

            {viewingEvent.description && (
              <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                {viewingEvent.description}
              </p>
            )}

            <p className="text-xs text-slate-400">
              Created {new Date(viewingEvent.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </Modal>
      )}

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!deletingEvent}
        onClose={() => setDeletingEvent(null)}
        onConfirm={handleDelete}
        isLoading={deleteLoading}
        title="Delete Event"
        description={`"${deletingEvent?.title}" will be permanently removed from your timeline. This cannot be undone.`}
        confirmLabel="Delete Event"
      />
    </div>
  );
}
