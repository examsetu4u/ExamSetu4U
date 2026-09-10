import {
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle2,
  Clock,
  FileQuestion,
  FileText,
  History,
  Layers,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import {
  clearRecentSearches,
  getRecentSearches,
  getSearchSuggestions,
  removeRecentSearch,
  saveRecentSearch,
  SearchResultItem,
  SearchResultType,
} from '@/lib/search';

interface GlobalSearchBarProps {
  className?: string;
  autoFocus?: boolean;
  onClose?: () => void;
  isMobileDrawer?: boolean;
}

export function GlobalSearchBar({
  className = '',
  autoFocus = false,
  onClose,
  isMobileDrawer = false,
}: GlobalSearchBarProps) {
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchResultItem[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, [isOpen]);

  useEffect(() => {
    if (query.trim().length > 0) {
      const results = getSearchSuggestions(query, 6);
      setSuggestions(results);
    } else {
      setSuggestions([]);
    }
  }, [query]);

  // Handle outside click to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExecuteSearch = (searchTerm: string) => {
    const trimmed = searchTerm.trim();
    if (!trimmed) return;
    saveRecentSearch(trimmed);
    setIsOpen(false);
    if (onClose) onClose();
    setLocation(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const handleItemSelect = (item: SearchResultItem) => {
    saveRecentSearch(query || item.title);
    setIsOpen(false);
    if (onClose) onClose();
    setLocation(item.url);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleExecuteSearch(query);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      if (onClose) onClose();
    }
  };

  const handleRemoveRecent = (term: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeRecentSearch(term);
    setRecentSearches(getRecentSearches());
  };

  const handleClearAllRecent = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearRecentSearches();
    setRecentSearches([]);
  };

  const getTypeIcon = (type: SearchResultType) => {
    switch (type) {
      case 'exam':
        return <Layers size={14} className="text-[#34547f]" />;
      case 'subject':
        return <BookOpen size={14} className="text-[#825413]" />;
      case 'topic':
        return <CheckCircle2 size={14} className="text-[#246556]" />;
      case 'study':
        return <FileText size={14} className="text-[#825413]" />;
      case 'pyq':
        return <FileQuestion size={14} className="text-[#246556]" />;
      case 'quiz':
        return <Brain size={14} className="text-[#34547f]" />;
      default:
        return <Search size={14} />;
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`} id="global-search-container">
      {/* Search Input Box */}
      <div className="relative flex items-center">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 text-[hsl(var(--muted-foreground))]"
        />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          autoFocus={autoFocus}
          placeholder="खोजें: परीक्षा, विषय, शिक्षण, PYQ, Quiz..."
          className="focus-ring h-10 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] pl-9 pr-8 text-xs font-medium text-[hsl(var(--foreground))] shadow-2xs placeholder:text-[hsl(var(--muted-foreground))]"
          aria-label="Global Search"
          id="global-search-header-input"
        />
        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            className="focus-ring absolute right-2.5 rounded-full p-1 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
            aria-label="Clear query"
          >
            <X size={14} />
          </button>
        ) : null}
      </div>

      {/* Dropdown Suggestions / Recent Searches */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1.5 max-h-[80vh] overflow-y-auto rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-2 shadow-lg sm:max-h-[440px]">
          {/* Active Query Suggestions */}
          {query.trim().length > 0 ? (
            <div className="space-y-1">
              <div className="flex items-center justify-between px-2 py-1 text-[11px] font-bold text-[hsl(var(--muted-foreground))]">
                <span>परिणाम सुझाव (Suggestions)</span>
                <span>{suggestions.length} आइटम</span>
              </div>

              {suggestions.length > 0 ? (
                <>
                  {suggestions.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleItemSelect(item)}
                      className="focus-ring flex w-full items-start gap-2.5 rounded-lg p-2 text-left transition hover:bg-[hsl(var(--secondary))]"
                    >
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[hsl(var(--background))]">
                        {getTypeIcon(item.type)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate text-xs font-bold text-[hsl(var(--primary))]">
                            {item.title}
                          </span>
                          <span className="rounded bg-[hsl(var(--secondary))] px-1.5 py-0.2 text-[9px] font-semibold text-[hsl(var(--muted-foreground))]">
                            {item.badgeLabel}
                          </span>
                        </div>
                        <p className="truncate text-[11px] text-[hsl(var(--muted-foreground))]">
                          {item.subtitle}
                        </p>
                      </div>
                    </button>
                  ))}

                  {/* View all results button */}
                  <div className="border-t border-[hsl(var(--border))] pt-1.5">
                    <button
                      type="button"
                      onClick={() => handleExecuteSearch(query)}
                      className="focus-ring flex w-full items-center justify-between rounded-lg bg-[hsl(var(--secondary))] px-3 py-2 text-xs font-bold text-[hsl(var(--primary))] hover:bg-[hsl(var(--accent)/.2)]"
                    >
                      <span>&ldquo;{query}&rdquo; के सभी परिणाम देखें</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </>
              ) : (
                <div className="p-4 text-center text-xs text-[hsl(var(--muted-foreground))]">
                  <p>कोई सीधा परिणाम नहीं मिला।</p>
                  <button
                    type="button"
                    onClick={() => handleExecuteSearch(query)}
                    className="mt-2 text-xs font-bold text-[hsl(var(--primary))] underline"
                  >
                    सर्च पेज पर विस्तृत खोज करें →
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Recent Searches & Popular Prompts when query is empty */
            <div className="space-y-3 p-1">
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between px-2 py-1 text-[11px] font-bold text-[hsl(var(--muted-foreground))]">
                    <span className="flex items-center gap-1 text-[hsl(var(--primary))]">
                      <History size={12} /> हालिया खोज (Recent)
                    </span>
                    <button
                      type="button"
                      onClick={handleClearAllRecent}
                      className="text-[10px] text-[hsl(var(--muted-foreground))] hover:underline"
                    >
                      सब हटाएं
                    </button>
                  </div>
                  <div className="mt-1 space-y-0.5">
                    {recentSearches.slice(0, 5).map((term) => (
                      <div
                        key={term}
                        onClick={() => handleExecuteSearch(term)}
                        className="group flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary))]"
                      >
                        <span className="flex items-center gap-2">
                          <History size={12} className="text-[hsl(var(--muted-foreground))]" />
                          {term}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleRemoveRecent(term, e)}
                          className="p-1 text-[hsl(var(--muted-foreground))] hover:text-red-500"
                          aria-label={`Remove ${term}`}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular quick links */}
              <div>
                <p className="px-2 text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                  लोकप्रिय खोज (Popular)
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5 px-2">
                  {['शिक्षण', 'बाल विकास', 'गणित', 'Super TET', 'UPTET', 'Reasoning', 'PYQ'].map(
                    (term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => handleExecuteSearch(term)}
                        className="rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-2 py-1 text-[11px] font-medium text-[hsl(var(--primary))] hover:border-[hsl(var(--accent))] hover:bg-[hsl(var(--secondary))]"
                      >
                        {term}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
