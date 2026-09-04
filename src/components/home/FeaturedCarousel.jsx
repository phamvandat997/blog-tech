import { useRef, useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useCatalog } from '../../hooks/useCatalog';
import { useDocProgress } from '../../hooks/useDocProgress';

export function FeaturedCarousel() {
  const { docs, sections } = useCatalog();
  const { isCompleted } = useDocProgress();

  const carouselRef = useRef(null);
  const [canScroll, setCanScroll] = useState(false);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const featuredList = docs.filter((d) => d.featured).slice(0, 8);

  const checkScrollState = useCallback(() => {
    const el = carouselRef.current;
    if (!el) return;

    const cards = el.querySelectorAll('.featured-card');
    if (!cards.length) {
      setCanScroll(false);
      return;
    }

    let totalCardsWidth = 0;
    cards.forEach((c) => {
      totalCardsWidth += c.offsetWidth;
    });
    totalCardsWidth += (cards.length - 1) * 20; // 20px gap

    const containerWidth = el.clientWidth;
    const overflowing = totalCardsWidth > containerWidth + 8;
    setCanScroll(overflowing);

    if (overflowing) {
      setAtStart(el.scrollLeft <= 10);
      const maxScroll = el.scrollWidth - el.clientWidth;
      setAtEnd(el.scrollLeft >= maxScroll - 10);
    } else {
      setAtStart(true);
      setAtEnd(true);
    }
  }, []);

  useEffect(() => {
    checkScrollState();
    window.addEventListener('resize', checkScrollState);
    return () => window.removeEventListener('resize', checkScrollState);
  }, [checkScrollState, featuredList.length]);

  const handleScroll = () => {
    checkScrollState();
  };

  const scrollPrev = () => {
    const el = carouselRef.current;
    if (!el) return;
    const card = el.querySelector('.featured-card');
    const step = card ? card.offsetWidth + 20 : 340;
    el.scrollBy({ left: -step, behavior: 'smooth' });
  };

  const scrollNext = () => {
    const el = carouselRef.current;
    if (!el) return;
    const card = el.querySelector('.featured-card');
    const step = card ? card.offsetWidth + 20 : 340;
    el.scrollBy({ left: step, behavior: 'smooth' });
  };

  if (!featuredList.length) return null;

  return (
    <section className="featured-section w-full mb-12" id="featured-root">
      <div
        className={`featured-header flex items-center justify-between gap-4 mb-4 ${!canScroll ? 'is-centered' : ''}`}
        id="featured-header"
      >
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight m-0">
          Bài Viết Nổi Bật Dành Cho Bạn
        </h2>

        {canScroll && (
          <div className="carousel-nav flex items-center gap-2" id="featured-nav">
            <button
              onClick={scrollPrev}
              disabled={atStart}
              className="featured-carousel-btn rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-sm transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Bài trước"
              title="Bài trước"
            >
              ‹
            </button>
            <button
              onClick={scrollNext}
              disabled={atEnd}
              className="featured-carousel-btn rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-sm transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Bài tiếp"
              title="Bài tiếp"
            >
              ›
            </button>
          </div>
        )}
      </div>

      <div className="featured-carousel-container relative">
        <div
          ref={carouselRef}
          onScroll={handleScroll}
          id="featured-carousel"
          className={`featured-carousel flex gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory py-2 px-1 ${
            !canScroll ? 'is-centered' : ''
          }`}
        >
          {featuredList.map((doc) => {
            const section = sections.find((s) => s.id === doc.section);
            const sectionColor = section?.color || '#6366f1';
            const completed = isCompleted(doc.id);

            return (
              <Link
                key={doc.id}
                to={`/reader?s=${encodeURIComponent(doc.section)}&d=${encodeURIComponent(`${doc.category}/${doc.slug}`)}`}
                className="featured-card group relative flex-none w-[285px] sm:w-[325px] md:w-[350px] snap-start flex flex-col justify-between p-5 sm:p-6 rounded-2xl backdrop-blur-md bg-white/95 dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700/80 hover:border-indigo-500/60 dark:hover:border-indigo-500/60 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all no-underline overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-1" style={{ background: sectionColor }} />

                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="inline-flex items-center text-xs font-black px-2.5 py-0.5 rounded-full"
                        style={{
                          background: `${sectionColor}18`,
                          color: sectionColor,
                          border: `1px solid ${sectionColor}33`,
                        }}
                      >
                        {section?.name || doc.section}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
                        ⭐ Nổi bật
                      </span>
                      {doc.questions > 0 && (
                        <span className="inline-flex items-center gap-1 text-[0.7rem] font-extrabold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60">
                          🎯 {doc.questions} quiz
                        </span>
                      )}
                      {completed && (
                        <span className="inline-flex items-center gap-1 text-[0.7rem] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                          ✓ Đã học
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-medium text-slate-400 dark:text-slate-500 whitespace-nowrap">
                      ⏱️ ~{doc.readingMinutes}p
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 mb-2 leading-snug">
                    {doc.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed mb-4">
                    {doc.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2 mt-auto">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {(doc.tags || []).slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="text-[0.68rem] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform whitespace-nowrap">
                    Đọc ngay ➔
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
