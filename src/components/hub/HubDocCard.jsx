import React from 'react';
import { Link } from 'react-router-dom';

export function HubDocCard({ doc, isCompleted, onTagClick }) {
  const readingTime = doc.readingMinutes || 5;

  return (
    <Link
      to={`/reader?s=${encodeURIComponent(doc.section)}&d=${encodeURIComponent(`${doc.category}/${doc.slug}`)}`}
      className={`doc-card ${isCompleted ? 'is-completed' : ''} group relative flex flex-col justify-between p-5 rounded-2xl backdrop-blur-md bg-white/95 dark:bg-slate-800/85 border border-slate-200/90 dark:border-slate-700/70 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all no-underline`}
    >
      <div className="doc-card-top flex items-center justify-between gap-2 mb-3">
        <div className="doc-badges flex items-center gap-1.5 flex-wrap">
          {doc.phase && (
            <span className="doc-badge doc-badge-phase inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-800/60">
              {doc.phase}
            </span>
          )}
          {doc.questions > 0 && (
            <span className="doc-badge doc-badge-quiz inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
              🎯 {doc.questions} quiz
            </span>
          )}
          {isCompleted && (
            <span className="doc-badge doc-badge-completed inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
              ✓ Đã học
            </span>
          )}
        </div>
        <span className="doc-reading-time text-xs font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1">
          ⏱️ ~{readingTime}p
        </span>
      </div>

      <span className="doc-card-body block flex-1 mb-4">
        <span className="doc-title block text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug mb-1.5">
          {doc.title}
        </span>
        <span className="doc-desc block text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
          {doc.description}
        </span>
      </span>

      <div className="doc-card-footer flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700/60">
        <div className="doc-tags flex items-center gap-1.5 flex-wrap">
          {(doc.tags || []).slice(0, 3).map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onTagClick?.(tag);
              }}
              className="doc-tag text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/60 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-300 px-2 py-0.5 rounded-full transition-colors border-0 cursor-pointer"
              title={`Lọc theo #${tag}`}
            >
              #{tag}
            </button>
          ))}
        </div>
        <span className="doc-arrow text-indigo-600 dark:text-indigo-400 text-sm font-bold group-hover:translate-x-1 transition-transform">
          ➔
        </span>
      </div>
    </Link>
  );
}
