import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCatalog } from '../../hooks/useCatalog';
import { useTheme } from '../../hooks/useTheme';

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { docs, sections, searchDocs } = useCatalog();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchWrapperRef = useRef(null);
  const inputRef = useRef(null);

  const isMac = typeof navigator !== 'undefined' && /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform || navigator.userAgent);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Global hotkey ⌘K / Ctrl+K / /
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
        setIsOpen(true);
      } else if (e.key === '/' && !isInput) {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
        setIsOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const featuredList = docs.filter((d) => d.featured).slice(0, 4);
  const query = searchQuery.trim();
  const searchResults = query.length >= 2 ? searchDocs(query).slice(0, 8) : [];
  const displayItems = query.length >= 2 ? searchResults : featuredList;

  const handleSelectDoc = (doc) => {
    setIsOpen(false);
    setSearchQuery('');
    navigate(`/reader?s=${encodeURIComponent(doc.section)}&d=${encodeURIComponent(`${doc.category}/${doc.slug}`)}`);
  };

  const handleKeyDown = (e) => {
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!displayItems.length) return;
      setSelectedIndex((prev) => (prev + 1) % displayItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!displayItems.length) return;
      setSelectedIndex((prev) => (prev - 1 + displayItems.length) % displayItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && displayItems[selectedIndex]) {
        handleSelectDoc(displayItems[selectedIndex]);
      } else if (query && searchResults.length > 0) {
        handleSelectDoc(searchResults[0]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <header className="navbar sticky top-0 z-40 w-full backdrop-blur-md bg-white/90 dark:bg-slate-900/85 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="navbar-inner w-full lg:w-[60%] lg:max-w-[60%] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link to="/" className="brand flex items-center gap-3 no-underline group">
          <div className="brand-logo">
            <img src="/assets/images/logo.svg" alt="Blog Tech Logo" className="brand-logo-img" />
          </div>
          <div className="brand-text">
            <div className="brand-title flex items-center text-base font-black tracking-tight leading-tight m-0">
              <span className="text-indigo-600 dark:text-indigo-400">Blog</span>
              <span className="text-slate-900 dark:text-white ml-1">Tech</span>
            </div>

          </div>
        </Link>

        {/* Global Search */}
        <div className="search-wrapper is-global relative" ref={searchWrapperRef}>
          <span className="search-icon">🔍</span>
          <input
            ref={inputRef}
            type="text"
            id="global-search"
            className="search-input"
            placeholder="Tìm bài viết…"
            autoComplete="off"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsOpen(true);
              setSelectedIndex(-1);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
          />
          <kbd className="search-kbd">{isMac ? '⌘K' : 'Ctrl+K'}</kbd>

          {/* Search Dropdown */}
          {isOpen && (
            <div className="search-results open" id="global-search-results">
              {query.length < 2 ? (
                <>
                  <div className="px-3 py-1.5 text-[0.7rem] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1.5">
                    <span>⭐</span> Gợi ý bài viết nổi bật
                  </div>
                  {featuredList.map((doc, idx) => {
                    const sec = sections.find((s) => s.id === doc.section);
                    const cat = sec?.categories?.find((c) => c.id === doc.category);
                    return (
                      <div
                        key={doc.id}
                        className={`search-hit cursor-pointer ${idx === selectedIndex ? 'is-selected' : ''}`}
                        onClick={() => handleSelectDoc(doc)}
                      >
                        <span className="search-hit-body">
                          <span className="search-hit-title">{doc.title}</span>
                          <span className="search-hit-path">
                            {sec?.name || doc.section} › {cat?.name || doc.category}
                          </span>
                        </span>
                      </div>
                    );
                  })}
                </>
              ) : searchResults.length === 0 ? (
                <div className="search-hit search-hit-empty">Không có bài nào khớp “{query}”</div>
              ) : (
                searchResults.map((doc, idx) => {
                  const sec = sections.find((s) => s.id === doc.section);
                  const cat = sec?.categories?.find((c) => c.id === doc.category);
                  return (
                    <div
                      key={doc.id}
                      className={`search-hit cursor-pointer ${idx === selectedIndex ? 'is-selected' : ''}`}
                      onClick={() => handleSelectDoc(doc)}
                    >
                      <span className="search-hit-body">
                        <span className="search-hit-title">{doc.title}</span>
                        <span className="search-hit-path">
                          {sec?.name || doc.section} › {cat?.name || doc.category}
                        </span>
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="nav-actions flex items-center gap-2">
          <Link
            to="/quiz"
            className="nav-quiz-btn flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-all no-underline shadow-sm"
            title="Luyện tập trắc nghiệm"
          >
            <span>🎯</span>
            <span>Luyện Quiz</span>
          </Link>
          <button
            className="btn-icon p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
            onClick={toggleTheme}
            data-theme-toggle
            title="Chuyển giao diện sáng / tối"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </header>
  );
}
