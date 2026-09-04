import React from 'react';
import { Link } from 'react-router-dom';

export function AdjacentDocNav({ prev, next }) {
  if (!prev && !next) return null;

  return (
    <nav className="adjacent-docs-nav grid grid-cols-1 sm:grid-cols-2 gap-4 py-8 border-t border-slate-200 dark:border-slate-800 my-6">
      {prev ? (
        <Link
          to={`/reader?s=${encodeURIComponent(prev.section)}&d=${encodeURIComponent(`${prev.category}/${prev.slug}`)}`}
          className="prev-doc-link group flex flex-col p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 hover:border-indigo-500/60 shadow-xs hover:shadow-md transition-all no-underline"
        >
          <span className="text-[0.7rem] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1 flex items-center gap-1">
            <span>←</span> Bài trước
          </span>
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
            {prev.title}
          </span>
        </Link>
      ) : <div />}

      {next ? (
        <Link
          to={`/reader?s=${encodeURIComponent(next.section)}&d=${encodeURIComponent(`${next.category}/${next.slug}`)}`}
          className="next-doc-link group flex flex-col items-end text-right p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 hover:border-indigo-500/60 shadow-xs hover:shadow-md transition-all no-underline"
        >
          <span className="text-[0.7rem] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1 flex items-center gap-1">
            Bài tiếp theo <span>→</span>
          </span>
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
            {next.title}
          </span>
        </Link>
      ) : <div />}
    </nav>
  );
}
