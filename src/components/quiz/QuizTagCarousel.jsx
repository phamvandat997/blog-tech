import { useRef, useState, useEffect, useCallback } from 'react';

export function QuizTagCarousel({ tags, selectedTag, onSelectTag }) {
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
    const step = Math.max(160, Math.round(el.clientWidth * 0.8));
    el.scrollBy({ left: step * dir, behavior: 'smooth' });
    setTimeout(updateNav, 300);
  };

  if (!tags.length) return null;

  return (
    <div className="quiz-tag-carousel pt-3 border-t border-slate-100 dark:border-slate-700/60" id="quiz-tag-carousel">
      <div className="flex items-center gap-2">
        {canScroll && (
          <button
            type="button"
            disabled={atStart}
            onClick={() => scrollDir(-1)}
            className="quiz-tag-nav p-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold transition-all"
            aria-label="Xem tag phía trước"
          >
            ‹
          </button>
        )}

        <div
          ref={trackRef}
          onScroll={updateNav}
          className="quiz-tag-track flex items-center gap-2 overflow-x-auto py-1 scroll-smooth"
          id="quiz-tag-track"
          role="group"
          aria-label="Lọc bài quiz theo tag"
        >
          <button
            type="button"
            onClick={() => onSelectTag('')}
            className={`quiz-tag-pill px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
              !selectedTag
                ? 'is-active bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Tất cả tag
          </button>

          {tags.map((t) => {
            const active = selectedTag === t.name.toLowerCase();
            return (
              <button
                key={t.name}
                type="button"
                onClick={() => onSelectTag(active ? '' : t.name.toLowerCase())}
                className={`quiz-tag-pill px-3 py-1 rounded-full text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  active
                    ? 'is-active bg-indigo-600 text-white shadow-xs font-bold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>#{t.name}</span>
                <span
                  className={`quiz-tag-count text-[0.68rem] px-1.5 py-0.2 rounded-full ${
                    active ? 'bg-indigo-700 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
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
            className="quiz-tag-nav p-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold transition-all"
            aria-label="Xem tag tiếp theo"
          >
            ›
          </button>
        )}
      </div>
    </div>
  );
}
