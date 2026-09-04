import React from 'react';
import { Link } from 'react-router-dom';

export function RelatedDocs({ currentDoc, allDocs, isDocCompleted }) {
  if (!currentDoc || !allDocs.length) return null;

  const currentTags = new Set(currentDoc.tags || []);
  const candidates = allDocs.filter((d) => d.id !== currentDoc.id);

  const scored = candidates.map((d) => {
    let score = 0;
    if (d.section === currentDoc.section) score += 10;
    if (d.category === currentDoc.category) score += 15;
    if (d.phase && currentDoc.phase && d.phase === currentDoc.phase) score += 5;
    if (d.tags && currentTags.size > 0) {
      for (const t of d.tags) {
        if (currentTags.has(t)) score += 4;
      }
    }
    return { doc: d, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const related = scored.slice(0, 5).map((s) => s.doc);

  if (related.length === 0) return null;

  return (
    <aside id="reader-related-sidebar" className="reader-related-sidebar mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
      <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4 flex items-center gap-2">
        <span>📖 Bài viết liên quan</span>
      </h3>
      <div id="reader-related-list" className="space-y-3">
        {related.map((d) => {
          const completed = isDocCompleted(d.id);
          return (
            <Link
              key={d.id}
              to={`/reader?s=${encodeURIComponent(d.section)}&d=${encodeURIComponent(`${d.category}/${d.slug}`)}`}
              className={`related-card ${completed ? 'is-completed' : ''} group block p-3.5 rounded-xl backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 shadow-xs hover:shadow-sm hover:-translate-y-0.5 transition-all no-underline`}
            >
              <div className="related-card-meta flex items-center justify-between gap-2 mb-2 text-xs">
                {d.phase && (
                  <span className="related-card-phase text-[0.68rem] font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/40">
                    {d.phase.toUpperCase()}
                  </span>
                )}
                <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 font-semibold text-[0.7rem]">
                  {completed && <span className="related-card-completed text-emerald-600 dark:text-emerald-400">✓ Đã học</span>}
                  {d.readingMinutes && <span className="related-card-time">⏱️ ~{d.readingMinutes}p</span>}
                </div>
              </div>
              <h4 className="related-card-title text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug m-0 mb-1">
                {d.title}
              </h4>
              <p className="related-card-desc text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed m-0">
                {d.description}
              </p>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
