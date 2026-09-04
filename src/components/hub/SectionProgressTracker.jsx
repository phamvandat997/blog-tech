import React from 'react';

export function SectionProgressTracker({ section, docs, completedCount }) {
  const total = docs.length;
  if (!total) return null;

  const percent = Math.round((completedCount / total) * 100);

  return (
    <div className="progress-tracker mb-6 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="progress-tracker-header flex items-center justify-between mb-2">
        <span className="progress-tracker-title text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <span>🎯</span> Tiến độ ôn luyện {section.name}
        </span>
        <span className="progress-tracker-count text-xs font-bold text-indigo-600 dark:text-indigo-400">
          <b>{completedCount}</b> / {total} bài ({percent}%)
        </span>
      </div>
      <div className="progress-tracker-track w-full h-2.5 bg-slate-100 dark:bg-slate-700/80 rounded-full overflow-hidden">
        <div
          className="progress-tracker-fill h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
