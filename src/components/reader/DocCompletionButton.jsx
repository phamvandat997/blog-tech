import React from 'react';
import { showToast } from '../common/Toast';

export function DocCompletionButton({ isCompleted, onToggle }) {
  const handleClick = () => {
    const nextState = onToggle();
    showToast(nextState ? '🎉 Đã lưu vào tiến độ ôn tập!' : 'Đã huỷ đánh dấu bài học.');
  };

  return (
    <div id="reader-complete-box" className="reader-complete-box py-6 border-t border-slate-200 dark:border-slate-800 my-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-sm">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white m-0 mb-1">
            Bạn đã hoàn thành bài học này chưa?
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 m-0">
            Lưu trạng thái học tập giúp bạn dễ dàng theo dõi lộ trình và tiếp tục các bài sau.
          </p>
        </div>
        <button
          type="button"
          id="btn-toggle-complete"
          onClick={handleClick}
          className={`complete-btn shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
            isCompleted
              ? 'is-completed bg-emerald-500 text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-600'
              : 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-500'
          }`}
        >
          <span className="complete-btn-label">
            {isCompleted ? '✓ Đã hoàn thành (nhấn để huỷ)' : 'Đánh dấu đã học'}
          </span>
        </button>
      </div>
    </div>
  );
}
