import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  Sparkles,
  Command,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Calendar,
  Camera,
  Target,
  FileText,
  Tag,
  ArrowRight,
  X
} from 'lucide-react';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import { MOCK_NOTIFICATIONS } from '../../data/mockData';
import useAuth from '../../hooks/useAuth';
import searchService from '../../services/searchService';

const DEMO_EMAIL = 'alex.dev@lifeos.io';

export default function Navbar({
  isCollapsed,
  onOpenMobileMenu,
  onLogoutClick
}) {
  const { user: authUser } = useAuth();
  const currentUser = authUser || {};
  const isDemo = authUser?.email?.toLowerCase() === DEMO_EMAIL;
  const location = useLocation();
  const navigate = useNavigate();

  // Notifications state
  const [notifications, setNotifications] = useState(isDemo ? MOCK_NOTIFICATIONS : []);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Global Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const notifRef = useRef(null);
  const userMenuRef = useRef(null);
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);

  // Derive Page Title from location pathname
  const getPageTitle = (pathname) => {
    switch (pathname) {
      case '/':
        return 'Dashboard';
      case '/timeline':
        return 'Life Timeline';
      case '/events':
        return 'Life Events';
      case '/memories':
        return 'Memory Vault';
      case '/goals':
        return 'Goals & Ambitions';
      case '/documents':
        return 'Documents & Records';
      case '/search':
        return 'Global Search';
      case '/profile':
        return 'Personal Profile';
      case '/settings':
        return 'Settings';
      default:
        return 'LifeOS';
    }
  };

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Global keyboard shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Debounced search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await searchService.globalSearch(searchQuery.trim());
        setSearchResults(res.results || []);
        setIsSearchOpen(true);
        setSelectedIndex(-1);
      } catch (err) {
        console.error('Navbar search error:', err);
      } finally {
        setSearchLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle keyboard navigation inside search suggestions
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsSearchOpen(false);
      searchInputRef.current?.blur();
      return;
    }

    if (!isSearchOpen || searchResults.length === 0) {
      if (e.key === 'Enter' && searchQuery.trim()) {
        navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        setIsSearchOpen(false);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : searchResults.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
        const item = searchResults[selectedIndex];
        navigate(item.link || '/search');
        setIsSearchOpen(false);
      } else if (searchQuery.trim()) {
        navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        setIsSearchOpen(false);
      }
    }
  };

  const handleSelectResult = (item) => {
    setIsSearchOpen(false);
    navigate(item.link || '/search');
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, unread: false })));
  };

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
    <header
      className={`sticky top-0 z-20 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all duration-300 ${
        isCollapsed ? 'md:pl-20' : 'md:pl-64'
      }`}
    >
      <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & Page Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
              {getPageTitle(location.pathname)}
            </h1>
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>LifeOS Active</span>
              <span className="text-slate-300">•</span>
              <span>All Systems Online</span>
            </div>
          </div>
        </div>

        {/* Center: Global Search Bar with Live Suggestions Dropdown */}
        <div className="flex-1 max-w-lg hidden sm:block relative" ref={searchRef}>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search events, memories, goals, documents..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => {
                if (searchQuery.trim()) setIsSearchOpen(true);
              }}
              onKeyDown={handleSearchKeyDown}
              className="w-full pl-10 pr-16 py-1.5 rounded-xl text-xs bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all shadow-2xs"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                  setIsSearchOpen(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <kbd className="hidden lg:inline-flex items-center gap-0.5 text-[10px] font-mono font-medium text-slate-400 bg-white border border-slate-200 rounded px-1.5 py-0.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                <Command className="w-3 h-3" /> K
              </kbd>
            )}
          </div>

          {/* Live Search Suggestions Dropdown */}
          {isSearchOpen && searchQuery.trim() && (
            <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200/90 shadow-2xl overflow-hidden z-50 animate-in fade-in-0 duration-150">
              <div className="p-2.5 border-b border-slate-100 flex items-center justify-between text-xs text-slate-400 bg-slate-50/70">
                <span>{searchLoading ? 'Searching...' : `${searchResults.length} results found`}</span>
                <span className="text-[10px]">Use ↑↓ to navigate, ↵ to select</span>
              </div>

              {searchLoading ? (
                <div className="p-6 flex items-center justify-center gap-2 text-xs text-slate-400">
                  <div className="w-4 h-4 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
                  <span>Searching LifeOS...</span>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100/70 p-1">
                  {searchResults.map((item, idx) => (
                    <div
                      key={`${item.type}-${item.id}`}
                      onClick={() => handleSelectResult(item)}
                      className={`p-2.5 rounded-xl flex items-start gap-3 cursor-pointer transition-colors ${
                        selectedIndex === idx
                          ? 'bg-indigo-50/80 text-indigo-950'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="p-1.5 rounded-lg bg-white border border-slate-200/60 shrink-0 mt-0.5 shadow-2xs">
                        {getTypeIcon(item.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                            item.type === 'EVENT'
                              ? 'bg-indigo-100 text-indigo-800'
                              : item.type === 'MEMORY'
                              ? 'bg-purple-100 text-purple-800'
                              : item.type === 'GOAL'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.type === 'DOCUMENT'
                              ? 'bg-slate-200 text-slate-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {item.type}
                          </span>
                          <h4 className="text-xs font-semibold text-slate-900 truncate">
                            {item.title}
                          </h4>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {item.description}
                        </p>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0 self-center opacity-0 group-hover:opacity-100" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center">
                  <p className="text-xs font-semibold text-slate-700">No results found for "{searchQuery}"</p>
                  <p className="text-[11px] text-slate-400 mt-1">Try another keyword or category name</p>
                </div>
              )}

              {/* View all search page link */}
              <div
                onClick={() => {
                  navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                  setIsSearchOpen(false);
                }}
                className="p-2.5 border-t border-slate-100 bg-slate-50/70 hover:bg-slate-100 text-center text-xs font-semibold text-indigo-600 cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>View all results on search page</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          )}
        </div>

        {/* Right Action Icons & User Info */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile search icon */}
          <button
            onClick={() => navigate('/search')}
            className="sm:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              aria-label="View notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full ring-2 ring-white" />
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl border border-slate-200/90 shadow-xl overflow-hidden z-50">
                <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900">Notifications</span>
                    {unreadCount > 0 && <Badge variant="indigo">{unreadCount} new</Badge>}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3.5 hover:bg-slate-50 transition-colors flex items-start gap-3 ${
                        n.unread ? 'bg-indigo-50/30' : ''
                      }`}
                    >
                      <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-900 leading-snug">{n.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-2 border-t border-slate-100 text-center bg-slate-50/50">
                  <span className="text-xs text-slate-500 font-medium">All caught up!</span>
                </div>
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-slate-200 hidden sm:block" />

          {/* User Avatar & Name Dropdown */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="User profile menu"
            >
              <Avatar src={currentUser.profileImage || currentUser.avatar} name={currentUser.name} size="sm" status="online" />
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-semibold text-slate-900 leading-none">
                  {currentUser.name}
                </span>
                <span className="text-[11px] text-slate-400 leading-none mt-1">
                  {currentUser.role ? currentUser.role.split(' ')[0] : 'Member'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-slate-200/90 shadow-xl overflow-hidden z-50">
                <div className="p-3 border-b border-slate-100 bg-slate-50/50">
                  <p className="text-xs font-semibold text-slate-900">{currentUser.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
                </div>
                <div className="p-1 space-y-0.5">
                  <Link
                    to="/profile"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    View Profile
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-400" />
                    Account Settings
                  </Link>
                </div>
                <div className="p-1 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onLogoutClick();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
