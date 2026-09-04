import React from 'react';

export function QuizCard({ doc, section, score, onSelect, onTagClick }) {
  const cat = (section?.categories || []).find((c) => c.id === doc.category);

  return (
    <div
      onClick={() => onSelect(doc.id)}
      className="quiz-item-card p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-sm hover:shadow-md hover:border-indigo-400 dark:hover:border-indigo-600 transition-all cursor-pointer flex flex-col justify-between gap-4 group"
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-2.5 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50">
              {section?.name || doc.section}
            </span>
            {cat && <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{cat.name}</span>}
          </div>
          {doc.phase && (
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800/40">
              {doc.phase}
            </span>
          )}
        </div>

        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 mb-1.5">
          {doc.title}
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
          {doc.description || 'Bài tập trắc nghiệm chọn lọc rèn luyện kỹ năng.'}
        </p>

        {doc.quizTags && doc.quizTags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap mt-2.5">
            {doc.quizTags.slice(0, 3).map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onTagClick(tag.toLowerCase());
                }}
                className="quiz-tag-chip text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/60 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/60 px-2.5 py-0.5 rounded-md transition-colors cursor-pointer border-0"
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700/60 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <span>📝</span> <span>{doc.questions} câu hỏi</span>
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">
            {score.answered > 0 ? (
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                Đã làm: {score.correct}/{score.total} ({score.pct}%)
              </span>
            ) : (
              <span className="text-slate-400 dark:text-slate-500">Chưa làm</span>
            )}
          </span>
        </div>
        <button
          type="button"
          className="px-3 py-1.5 rounded-xl font-bold text-xs bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all pointer-events-none"
        >
          Làm bài ➔
        </button>
      </div>
    </div>
  );
}
