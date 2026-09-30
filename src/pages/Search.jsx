import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search as SearchIcon,
  Calendar,
  Camera,
  Target,
  FileText,
  Tag,
  Sparkles,
  ArrowRight,
  X
} from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import EmptyState from '../components/common/EmptyState';
import searchService from '../services/searchService';

const TABS = [
  { id: 'All', label: 'All Results', icon: Sparkles },
  { id: 'EVENT', label: 'Events', icon: Calendar },
  { id: 'MEMORY', label: 'Memories', icon: Camera },
  { id: 'GOAL', label: 'Goals', icon: Target },
  { id: 'DOCUMENT', label: 'Documents', icon: FileText },
  { id: 'CATEGORY', label: 'Categories', icon: Tag }
];

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState('All');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Sync URL query
  useEffect(() => {
    const qFromUrl = searchParams.get('q') || '';
    if (qFromUrl !== query) {
      setQuery(qFromUrl);
    }
  }, [searchParams, query]);

  // Execute Search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const data = await searchService.globalSearch(query.trim());
        setResults(data.results || []);
      } catch (err) {
        console.error('Global search error:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Handle Query Input Change
  const handleQueryChange = (newVal) => {
    setQuery(newVal);
    if (newVal.trim()) {
      setSearchParams({ q: newVal.trim() }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  };

  // Filter results by active category tab
  const filteredResults = useMemo(() => {
    if (activeTab === 'All') return results;
    return results.filter(r => r.type === activeTab);
  }, [results, activeTab]);

  // Counts per tab
  const tabCounts = useMemo(() => {
    const counts = { All: results.length, EVENT: 0, MEMORY: 0, GOAL: 0, DOCUMENT: 0, CATEGORY: 0 };
    results.forEach(r => {
      if (counts[r.type] !== undefined) counts[r.type] += 1;
    });
    return counts;
  }, [results]);

  const getTypeIcon = (type) => {
    switch (type) {
      case 'EVENT':
        return <Calendar className="w-4 h-4 text-indigo-500" />;
      case 'MEMORY':
        return <Camera className="w-4 h-4 text-purple-500" />;
      case 'GOAL':
        return <Target className="w-4 h-4 text-emerald-500" />;
      case 'DOCUMENT':
        return <FileText className="w-4 h-4 text-slate-500" />;
      case 'CATEGORY':
        return <Tag className="w-4 h-4 text-amber-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-indigo-500" />;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <PageHeader
        title="Global Search"
        description="Search instantly across your events, memories, goals, documents, and categories."
        breadcrumbs={['LifeOS', 'Search']}
      />

      {/* Main Search Input Bar */}
      <Card className="p-4 sm:p-5 shadow-xs border-slate-200/80 bg-white/90 backdrop-blur-xs">
        <div className="relative">
          <SearchIcon className="w-5 h-5 text-indigo-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search keywords, project milestones, memories, files, goals..."
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            autoFocus
            className="w-full pl-12 pr-10 py-3 rounded-xl text-sm sm:text-base bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all shadow-inner"
          />
          {query && (
            <button
              onClick={() => handleQueryChange('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Suggestion Prompts if Empty */}
        {!query && (
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 flex-wrap text-xs text-slate-400">
            <span className="font-semibold text-slate-500">Suggested queries:</span>
            {['LifeOS', 'Spring Boot', 'Stanford', 'Kyoto', 'Certificate', 'Education', 'Master'].map((s) => (
              <button
                key={s}
                onClick={() => handleQueryChange(s)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 font-medium transition-colors cursor-pointer"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </Card>

      {/* Category Tabs */}
      {query.trim() && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {TABS.map((tab) => {
            const IconComp = tab.icon;
            const count = tabCounts[tab.id] || 0;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <IconComp className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    activeTab === tab.id ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Search Results Area */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
              <div className="h-4 bg-slate-200 rounded w-1/4" />
              <div className="h-5 bg-slate-200 rounded w-3/4" />
              <div className="h-3 bg-slate-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : !query.trim() ? (
        <EmptyState
          icon={SearchIcon}
          title="Search your entire LifeOS"
          description="Type keywords to search across chronological events, captured memories, personal goals, and archived documents."
        />
      ) : filteredResults.length === 0 ? (
        <EmptyState
          icon={SearchIcon}
          title={`No results found for "${query}"`}
          description="Try checking for typos or searching with broader keywords."
          actionLabel="Clear Search"
          onAction={() => handleQueryChange('')}
        />
      ) : (
        <div className="space-y-3">
          {filteredResults.map((item) => (
            <div
              key={`${item.type}-${item.id}`}
              onClick={() => navigate(item.link || '/timeline')}
              className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/80 hover:border-indigo-300 hover:shadow-sm transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 shrink-0 group-hover:bg-indigo-50 transition-colors shadow-2xs">
                  {getTypeIcon(item.type)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      item.type === 'EVENT'
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/60'
                        : item.type === 'MEMORY'
                        ? 'bg-purple-50 text-purple-700 border border-purple-200/60'
                        : item.type === 'GOAL'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                        : item.type === 'DOCUMENT'
                        ? 'bg-slate-100 text-slate-800 border border-slate-200/60'
                        : 'bg-amber-50 text-amber-800 border border-amber-200/60'
                    }`}>
                      {item.type}
                    </span>
                    {item.badge && (
                      <Badge variant={item.badgeColor || 'slate'} size="sm">
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                {item.date && (
                  <span className="text-xs text-slate-400 font-medium">
                    {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                )}
                <div className="p-1.5 rounded-lg bg-slate-50 group-hover:bg-indigo-600 group-hover:text-white transition-colors text-slate-400">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
