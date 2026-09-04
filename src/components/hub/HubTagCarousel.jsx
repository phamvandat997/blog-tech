import { useRef, useState, useEffect, useCallback } from 'react';

export function HubTagCarousel({ tags = [], selectedTag = '', onSelectTag }) {
  const trackRef = useRef(null);
  const [canScroll, setCanScroll] = useState(false);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const updateNav = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const overflow = max > 4;
    setCanScroll(overflow);
    setAtStart(el.scrollLeft <= 2);
    setAtEnd(el.scrollLeft >= max - 2);
  }, []);

  useEffect(() => {
    updateNav();
    window.addEventListener('resize', updateNav);
    return () => window.removeEventListener('resize', updateNav);
  }, [updateNav, tags.length]);

  const scrollDir = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    const step = Math.max(180, Math.round(el.clientWidth * 0.75));
    el.scrollBy({ left: step * dir, behavior: 'smooth' });
    setTimeout(updateNav, 300);
  };

  if (!tags.length) return null;

  return (
    <div className="hub-tag-carousel mb-6" id="hub-tag-carousel">
      <div className="flex items-center gap-2">
        {canScroll && (
          <button
            type="button"
            disabled={atStart}
            onClick={() => scrollDir(-1)}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-25 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all shadow-xs shrink-0 cursor-pointer"
            aria-label="Xem tag phía trước"
            title="Cuộn sang trái"
          >
            ‹
          </button>
        )}

        <div
          ref={trackRef}
          onScroll={updateNav}
          className="flex items-center gap-2 overflow-x-auto py-1 scroll-smooth no-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          role="group"
          aria-label="Lọc bài viết theo chủ đề / tag"
        >
          <button
            type="button"
            onClick={() => onSelectTag('')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap border cursor-pointer ${
              !selectedTag
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            Tất cả bài viết
          </button>

          {tags.map((t) => {
            const active = selectedTag.toLowerCase() === t.name.toLowerCase();
            return (
              <button
                key={t.name}
                type="button"
                onClick={() => onSelectTag(active ? '' : t.name)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 border cursor-pointer ${
                  active
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs font-bold'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                <span>#{t.name}</span>
                <span
                  className={`text-[0.68rem] font-bold px-1.5 py-0.2 rounded-full ${
                    active
                      ? 'bg-indigo-700 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {t.count}
                </span>
              </button>
            );
          })}
        </div>

        {canScroll && (
          <button
            type="button"
            disabled={atEnd}
            onClick={() => scrollDir(1)}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-25 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all shadow-xs shrink-0 cursor-pointer"
            aria-label="Xem tag tiếp theo"
            title="Cuộn sang phải"
          >
            ›
          </button>
        )}
      </div>
    </div>
  );
}
