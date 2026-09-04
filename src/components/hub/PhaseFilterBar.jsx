import React from 'react';

export function PhaseFilterBar({ phases, selectedPhase, onSelectPhase }) {
  if (!phases.length) return null;

  const items = [{ id: 'all', label: 'Tất cả Phase' }, ...phases.map((p) => ({ id: p, label: p.toUpperCase() }))];

  return (
    <div className="phase-filter-bar mb-6 p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center gap-2 overflow-x-auto">
      <span className="phase-filter-label text-xs font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap pl-2">
        Lọc theo Phase:
      </span>
      <div className="flex items-center gap-1.5 flex-wrap">
        {items.map((item) => {
          const active = selectedPhase === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectPhase(item.id)}
              className={`phase-chip px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                active
                  ? 'active bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
