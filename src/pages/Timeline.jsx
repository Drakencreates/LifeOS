import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Sparkles,
  MapPin,
  Search,
  Plus,
  ArrowUpDown,
  Star,
  Flag,
  Clock,
  Lock,
  Globe,
  Pencil,
  Trash2,
  Eye,
  X,
  Compass,
  RefreshCw,
  ChevronDown
} from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Card from '../components/common/Card';
import Modal from '../components/common/Modal';
import EmptyState from '../components/common/EmptyState';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EventFormModal from '../components/events/EventFormModal';
import { useToast } from '../context/ToastContext';
import eventService from '../services/eventService';
import categoryService from '../services/categoryService';

const IMPORTANCE_CONFIG = {
  Normal: { label: 'Normal', color: 'slate', icon: Clock },
  Important: { label: 'Important', color: 'indigo', icon: Star },
  Milestone: { label: 'Milestone', color: 'amber', icon: Flag }
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function Timeline() {
  const toast = useToast();

  // State
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & Controls
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedImportance, setSelectedImportance] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' (Newest first) or 'asc' (Oldest first)
  const [jumpYear, setJumpYear] = useState('');

  // Modals & Interaction
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [viewingEvent, setViewingEvent] = useState(null);
  const [deletingEvent, setDeletingEvent] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Load real events & categories from backend
  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [eventsRes, catsRes] = await Promise.all([
        eventService.getEvents({ sort: sortOrder }),
        categoryService.getCategories()
      ]);
      setEvents(eventsRes || []);
      setCategories(catsRes || []);
    } catch {
      toast.error('Failed to load timeline events. Please check connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [sortOrder, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Event Saved (Add / Edit)
  const handleEventSaved = (savedEvent, isEdit) => {
    if (isEdit) {
      setEvents(prev => prev.map(e => (e.id === savedEvent.id ? savedEvent : e)));
      if (viewingEvent?.id === savedEvent.id) {
        setViewingEvent(savedEvent);
      }
    } else {
      setEvents(prev => [savedEvent, ...prev]);
    }
  };

  // Handle Event Delete
  const handleDeleteEvent = async () => {
    if (!deletingEvent) return;
    setDeleteLoading(true);
    try {
      await eventService.deleteEvent(deletingEvent.id);
      setEvents(prev => prev.filter(e => e.id !== deletingEvent.id));
      if (viewingEvent?.id === deletingEvent.id) {
        setViewingEvent(null);
      }
      toast.success('Event removed from your timeline.');
      setDeletingEvent(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete event.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Filtered and sorted events
  const filteredEvents = useMemo(() => {
    return events.filter(evt => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = evt.title?.toLowerCase().includes(q);
        const descMatch = evt.description?.toLowerCase().includes(q);
        const locMatch = evt.location?.toLowerCase().includes(q);
        const catMatch = evt.category?.name?.toLowerCase().includes(q);
        if (!titleMatch && !descMatch && !locMatch && !catMatch) return false;
      }

      // Category
      if (selectedCategory !== 'All' && evt.categoryId !== selectedCategory) {
        return false;
      }

      // Importance
      if (selectedImportance !== 'All' && evt.importance !== selectedImportance) {
        return false;
      }

      // Date Range
      const evtDate = new Date(evt.eventDate);
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (evtDate < start) return false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (evtDate > end) return false;
      }

      return true;
    }).sort((a, b) => {
      const timeA = new Date(a.eventDate).getTime();
      const timeB = new Date(b.eventDate).getTime();
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });
  }, [events, searchQuery, selectedCategory, selectedImportance, startDate, endDate, sortOrder]);

  // Hierarchical Grouping: YEAR -> MONTH -> DAY -> Events
  const timelineGroups = useMemo(() => {
    const yearsMap = new Map();

    filteredEvents.forEach(evt => {
      const d = new Date(evt.eventDate);
      const year = d.getFullYear().toString();
      const monthIdx = d.getMonth();
      const monthName = MONTH_NAMES[monthIdx];
      const dayNum = d.getDate();
      const dayStr = `${monthName} ${dayNum}`;

      if (!yearsMap.has(year)) {
        yearsMap.set(year, {
          year,
          monthsMap: new Map(),
          totalEvents: 0,
          milestones: 0
        });
      }

      const yearObj = yearsMap.get(year);
      yearObj.totalEvents += 1;
      if (evt.importance === 'Milestone') yearObj.milestones += 1;

      if (!yearObj.monthsMap.has(monthName)) {
        yearObj.monthsMap.set(monthName, {
          monthName,
          monthIdx,
          daysMap: new Map(),
          eventsCount: 0
        });
      }

      const monthObj = yearObj.monthsMap.get(monthName);
      monthObj.eventsCount += 1;

      if (!monthObj.daysMap.has(dayStr)) {
        monthObj.daysMap.set(dayStr, {
          dayStr,
          dayNum,
          dateObj: d,
          events: []
        });
      }

      monthObj.daysMap.get(dayStr).events.push(evt);
    });

    // Convert to structured sorted arrays
    const result = Array.from(yearsMap.values()).map(yearObj => {
      const monthsArray = Array.from(yearObj.monthsMap.values()).map(monthObj => {
        const daysArray = Array.from(monthObj.daysMap.values());
        // Sort days
        daysArray.sort((a, b) => {
          return sortOrder === 'desc'
            ? b.dateObj.getTime() - a.dateObj.getTime()
            : a.dateObj.getTime() - b.dateObj.getTime();
        });
        return {
          ...monthObj,
          days: daysArray
        };
      });

      // Sort months
      monthsArray.sort((a, b) => {
        return sortOrder === 'desc'
          ? b.monthIdx - a.monthIdx
          : a.monthIdx - b.monthIdx;
      });

      return {
        ...yearObj,
        months: monthsArray
      };
    });

    // Sort years
    result.sort((a, b) => {
      return sortOrder === 'desc'
        ? Number(b.year) - Number(a.year)
        : Number(a.year) - Number(b.year);
    });

    return result;
  }, [filteredEvents, sortOrder]);

  // Extract available years for Jump-to
  const availableYears = useMemo(() => {
    return Array.from(new Set(events.map(e => new Date(e.eventDate).getFullYear().toString()))).sort((a, b) => b - a);
  }, [events]);

  // Jump to specific Year
  const handleJumpToYear = (year) => {
    setJumpYear(year);
    if (!year) return;
    const elem = document.getElementById(`timeline-year-${year}`);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedImportance('All');
    setStartDate('');
    setEndDate('');
    setJumpYear('');
  };

  const hasActiveFilters = searchQuery || selectedCategory !== 'All' || selectedImportance !== 'All' || startDate || endDate;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <PageHeader
        title="Life Timeline"
        description="A unified chronological record of your life journey, milestones, and personal evolution."
        breadcrumbs={['LifeOS', 'Timeline']}
        actions={
          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
              variant="secondary"
              icon={RefreshCw}
              onClick={() => loadData(true)}
              className={refreshing ? 'animate-spin' : ''}
              title="Refresh Timeline"
            >
              Refresh
            </Button>
            <Button
              variant="secondary"
              icon={ArrowUpDown}
              onClick={() => setSortOrder(prev => (prev === 'desc' ? 'asc' : 'desc'))}
            >
              {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
            </Button>
            <Button
              icon={Plus}
              onClick={() => setIsAddOpen(true)}
            >
              Add Event
            </Button>
          </div>
        }
      />

      {/* Filter Toolbar Card */}
      <Card className="p-4 sm:p-5 shadow-xs border-slate-200/80 bg-white/90 backdrop-blur-xs">
        <div className="space-y-4">
          {/* Top row: Search & Jump To */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className="md:col-span-7 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search moments, locations, descriptions..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2 rounded-xl text-sm bg-slate-50/80 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
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

            {/* Jump to Year / Date */}
            <div className="md:col-span-5 flex items-center gap-2">
              <div className="relative flex-1">
                <Compass className="w-4 h-4 text-indigo-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={jumpYear}
                  onChange={e => handleJumpToYear(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 rounded-xl text-sm bg-indigo-50/50 border border-indigo-100 text-indigo-950 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none cursor-pointer"
                >
                  <option value="">Jump to Year...</option>
                  {availableYears.map(yr => (
                    <option key={yr} value={yr}>
                      Year {yr}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-indigo-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilters}
                  className="text-xs text-rose-600 hover:bg-rose-50 shrink-0"
                >
                  Reset
                </Button>
              )}
            </div>
          </div>

          {/* Bottom row: Category, Importance, Date Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
            {/* Category Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg text-xs bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="All">All Categories ({events.length})</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Importance Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Importance
              </label>
              <select
                value={selectedImportance}
                onChange={e => setSelectedImportance(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg text-xs bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="All">All Levels</option>
                <option value="Normal">Normal</option>
                <option value="Important">Important ⭐</option>
                <option value="Milestone">Milestones 🏆</option>
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                From Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg text-xs bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                To Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg text-xs bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="space-y-6 pt-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse space-y-3">
              <div className="h-8 w-32 bg-slate-200 rounded-lg" />
              <div className="h-28 bg-slate-100 rounded-2xl border border-slate-200/60 ml-6" />
            </div>
          ))}
        </div>
      ) : timelineGroups.length === 0 ? (
        /* Empty State */
        <EmptyState
          icon={Calendar}
          title={hasActiveFilters ? 'No matching life events' : 'Your life timeline is waiting'}
          description={
            hasActiveFilters
              ? 'No events matched your current search and filter criteria. Try clearing filters.'
              : 'Log your educational achievements, career steps, milestones, and personal moments to watch your chronological timeline come alive.'
          }
          actionLabel={hasActiveFilters ? 'Reset Filters' : 'Add First Event'}
          onAction={hasActiveFilters ? handleResetFilters : () => setIsAddOpen(true)}
        />
      ) : (
        /* Chronological Grouped Timeline */
        <div className="space-y-12 relative pt-2">
          {timelineGroups.map(yearGroup => (
            <section
              key={yearGroup.year}
              id={`timeline-year-${yearGroup.year}`}
              className="relative scroll-mt-24"
            >
              {/* YEAR HEADER BANNER */}
              <div className="sticky top-16 z-20 py-2.5 mb-6 backdrop-blur-md bg-slate-50/80 -mx-2 px-2 rounded-xl border-b border-slate-200/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                    {yearGroup.year}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-white px-2.5 py-1 rounded-full border border-slate-200/80 shadow-2xs">
                    <span>{yearGroup.totalEvents} {yearGroup.totalEvents === 1 ? 'event' : 'events'}</span>
                    {yearGroup.milestones > 0 && (
                      <>
                        <span className="text-slate-300">•</span>
                        <span className="text-amber-600 font-semibold flex items-center gap-0.5">
                          <Sparkles className="w-3 h-3 text-amber-500 inline" />
                          {yearGroup.milestones} {yearGroup.milestones === 1 ? 'milestone' : 'milestones'}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* MONTH GROUPS WITHIN YEAR */}
              <div className="space-y-8 pl-2 sm:pl-4">
                {yearGroup.months.map(monthGroup => (
                  <div key={monthGroup.monthName} className="space-y-4">
                    {/* MONTH SUBHEADER */}
                    <div className="flex items-center gap-3">
                      <div className="px-3 py-1 bg-indigo-50/90 text-indigo-700 text-xs font-bold uppercase tracking-wider rounded-lg border border-indigo-100/80 shadow-2xs">
                        {monthGroup.monthName}
                      </div>
                      <div className="h-px flex-1 bg-gradient-to-r from-indigo-200/70 to-transparent" />
                    </div>

                    {/* DAY GROUPS WITHIN MONTH */}
                    <div className="relative pl-6 sm:pl-8 border-l-2 border-indigo-200/80 ml-3 sm:ml-4 space-y-6 py-1">
                      {monthGroup.days.map(dayGroup => (
                        <div key={dayGroup.dayStr} className="relative space-y-3">
                          {/* DAY NODE INDICATOR */}
                          <div className="flex items-center gap-2 -ml-[31px] sm:-ml-[39px]">
                            <div className="w-4 h-4 rounded-full bg-white border-3 border-indigo-500 shadow-xs flex items-center justify-center shrink-0">
                              <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                            </div>
                            <span className="text-xs font-semibold text-slate-600 bg-white/80 px-2 py-0.5 rounded-md border border-slate-200/60 shadow-2xs">
                              ● {dayGroup.dayStr}
                            </span>
                          </div>

                          {/* EVENTS LIST ON THIS DAY */}
                          <div className="space-y-3 pl-1 sm:pl-2">
                            {dayGroup.events.map(event => (
                              <TimelineEventCard
                                key={event.id}
                                event={event}
                                onView={() => setViewingEvent(event)}
                                onEdit={() => setEditingEvent(event)}
                                onDelete={() => setDeletingEvent(event)}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Shared Add / Edit Event Modal */}
      <EventFormModal
        isOpen={isAddOpen || !!editingEvent}
        onClose={() => {
          setIsAddOpen(false);
          setEditingEvent(null);
        }}
        onSaved={handleEventSaved}
        initialData={editingEvent}
        categories={categories}
      />

      {/* Detailed Event View Modal */}
      {viewingEvent && (
        <Modal
          isOpen={!!viewingEvent}
          onClose={() => setViewingEvent(null)}
          title={viewingEvent.title}
          description={new Date(viewingEvent.eventDate).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
          maxWidth="max-w-xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <Button
                variant="danger"
                size="sm"
                icon={Trash2}
                onClick={() => {
                  setDeletingEvent(viewingEvent);
                }}
              >
                Delete
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  icon={Pencil}
                  onClick={() => {
                    setEditingEvent(viewingEvent);
                    setViewingEvent(null);
                  }}
                >
                  Edit Event
                </Button>
                <Button onClick={() => setViewingEvent(null)}>
                  Close
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-4">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              {viewingEvent.category && (
                <div
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-white shadow-2xs"
                  style={{ backgroundColor: viewingEvent.category.color || '#6366f1' }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  {viewingEvent.category.name}
                </div>
              )}
              <Badge variant={IMPORTANCE_CONFIG[viewingEvent.importance]?.color || 'slate'}>
                {viewingEvent.importance}
              </Badge>
              <Badge variant={viewingEvent.visibility === 'Private' ? 'slate' : 'emerald'}>
                {viewingEvent.visibility === 'Private' ? (
                  <Lock className="w-3 h-3 inline mr-1" />
                ) : (
                  <Globe className="w-3 h-3 inline mr-1" />
                )}
                {viewingEvent.visibility}
              </Badge>
            </div>

            {/* Location & Time Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50/80 rounded-xl border border-slate-100 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                <span>
                  {new Date(viewingEvent.eventDate).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate">{viewingEvent.location || 'No location set'}</span>
              </div>
            </div>

            {/* Description */}
            {viewingEvent.description ? (
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Description
                </span>
                <p className="text-sm text-slate-700 leading-relaxed bg-white p-4 rounded-xl border border-slate-200/80">
                  {viewingEvent.description}
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No additional description logged for this event.</p>
            )}

            {/* Metadata footer */}
            <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
              Logged on {new Date(viewingEvent.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingEvent}
        onClose={() => setDeletingEvent(null)}
        onConfirm={handleDeleteEvent}
        isLoading={deleteLoading}
        title="Delete Timeline Event"
        description={`"${deletingEvent?.title}" will be permanently removed from your life timeline.`}
        confirmLabel="Delete Event"
      />
    </div>
  );
}

/**
 * Individual Timeline Event Card
 * Styled with distinctive visual treatments for Milestones and Important events.
 */
function TimelineEventCard({ event, onView, onEdit, onDelete }) {
  const isMilestone = event.importance === 'Milestone';
  const isImportant = event.importance === 'Important';

  const eventTimeStr = new Date(event.eventDate).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="group relative"
    >
      <div
        onClick={onView}
        className={`relative p-4 sm:p-5 rounded-2xl cursor-pointer transition-all duration-200 ${
          isMilestone
            ? 'bg-gradient-to-br from-amber-50/80 via-white to-orange-50/40 border-2 border-amber-300/90 shadow-md hover:shadow-xl hover:border-amber-400 ring-4 ring-amber-100/40'
            : isImportant
            ? 'bg-gradient-to-br from-indigo-50/50 via-white to-slate-50/30 border border-indigo-200/90 shadow-xs hover:shadow-md hover:border-indigo-300 ring-2 ring-indigo-50'
            : 'bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-indigo-200'
        }`}
      >
        {/* Top bar: Category + Importance + Time + Quick Actions */}
        <div className="flex items-center justify-between gap-2 mb-2.5 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Category */}
            {event.category ? (
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold text-white shadow-2xs"
                style={{ backgroundColor: event.category.color || '#6366f1' }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                {event.category.name}
              </span>
            ) : (
              <Badge variant="slate" size="sm">
                General
              </Badge>
            )}

            {/* Distinctive Milestone / Important Tag */}
            {isMilestone && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold text-amber-800 bg-amber-100 border border-amber-300/80 shadow-2xs">
                <Sparkles className="w-3 h-3 text-amber-600" />
                Life Milestone
              </span>
            )}
            {isImportant && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200/70">
                <Star className="w-3 h-3 text-indigo-500" />
                Important
              </span>
            )}

            {/* Time */}
            {eventTimeStr !== '12:00 AM' && (
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {eventTimeStr}
              </span>
            )}
          </div>

          {/* Quick Action buttons (visible on hover) */}
          <div
            onClick={e => e.stopPropagation()}
            className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <button
              onClick={onView}
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
              title="View Details"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={onEdit}
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
              title="Edit Event"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Delete Event"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Title */}
        <h3
          className={`text-base sm:text-lg font-bold tracking-tight transition-colors ${
            isMilestone
              ? 'text-amber-950 group-hover:text-amber-600'
              : isImportant
              ? 'text-indigo-950 group-hover:text-indigo-600'
              : 'text-slate-900 group-hover:text-indigo-600'
          }`}
        >
          {event.title}
        </h3>

        {/* Location */}
        {event.location && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{event.location}</span>
          </div>
        )}

        {/* Description */}
        {event.description && (
          <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed line-clamp-2">
            {event.description}
          </p>
        )}

        {/* Card Footer */}
        <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1">
            {event.visibility === 'Private' ? (
              <>
                <Lock className="w-3 h-3 text-slate-400" />
                <span>Private</span>
              </>
            ) : (
              <>
                <Globe className="w-3 h-3 text-emerald-500" />
                <span className="text-emerald-600 font-medium">Public</span>
              </>
            )}
          </span>

          <span className="font-medium text-indigo-600 group-hover:underline">
            View full log →
          </span>
        </div>
      </div>
    </motion.div>
  );
}
