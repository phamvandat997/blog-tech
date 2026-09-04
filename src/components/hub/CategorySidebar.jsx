import React from 'react';

export function CategorySidebar({ categories, selectedCategory, onSelectCategory, docCounts, totalDocCount }) {
  const items = [{ id: 'all', name: 'Tất cả bài viết' }, ...categories];

  return (
    <div className="hub-categories flex flex-col gap-1">
      <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 px-3">
        Chuyên Mục
      </h3>
      {items.map((cat) => {
        const active = selectedCategory === cat.id;
        const count = cat.id === 'all' ? totalDocCount : docCounts[cat.id] || 0;

        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelectCategory(cat.id)}
            className={`category-item w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
              active
                ? 'active bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <span className="category-name truncate pr-2">{cat.name}</span>
            <span
              className={`category-count text-[0.7rem] px-2 py-0.5 rounded-full ${
                active
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
