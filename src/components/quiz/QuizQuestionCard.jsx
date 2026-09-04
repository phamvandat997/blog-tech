import React from 'react';
import { renderMarkdown } from '../../services/markdown';

export function QuizQuestionCard({
  docId,
  question,
  checked,
  pickedAnswers,
  onToggleOption,
  onCheckSingle,
}) {
  const isMulti = Boolean(question.isMulti);
  const correctSet = new Set(question.correctAnswers || []);
  const pickedSet = new Set(pickedAnswers || []);
  const isCorrect = checked && pickedSet.size === correctSet.size && [...pickedSet].every((k) => correctSet.has(k));

  let cardClass = '';
  if (checked) {
    cardClass = isCorrect ? 'answered-correct' : 'answered-wrong';
  }

  return (
    <div
      className={`quiz-card ${cardClass} p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-800/95 border border-slate-200 dark:border-slate-700/80 shadow-sm transition-all`}
      id={`${docId}#${question.number}`}
    >
      {/* Top Header */}
      <div className="quiz-card-top flex items-center justify-between gap-2 mb-3">
        <div className="quiz-question-badge font-bold text-xs px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50">
          Câu {question.number}
        </div>
        <div className="quiz-type-tag text-xs font-semibold text-slate-400 dark:text-slate-500">
          {isMulti ? 'Chọn NHIỀU đáp án' : 'Chọn 1 đáp án'}
        </div>
      </div>

      {/* Question Body */}
      <div
        className="quiz-question-body prose prose-slate dark:prose-invert max-w-none text-sm sm:text-base font-semibold text-slate-900 dark:text-white mb-4 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(question.question || '') }}
      />

      {/* Options List */}
      <div className="quiz-options-list flex flex-col gap-2 mb-4">
        {question.options.map((opt) => {
          const selected = pickedSet.has(opt.key);
          let cls = selected ? 'selected' : '';

          if (checked) {
            if (correctSet.has(opt.key)) {
              cls += ' is-correct-choice';
            } else if (selected) {
              cls += ' is-wrong-choice';
            }
          }

          return (
            <label
              key={opt.key}
              onClick={() => {
                if (!checked) onToggleOption(opt.key, isMulti);
              }}
              className={`quiz-option-label ${cls} flex items-start gap-3 p-3.5 rounded-xl border text-xs sm:text-sm font-medium transition-all ${
                checked ? 'cursor-default' : 'cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500'
              }`}
            >
              <input
                type={isMulti ? 'checkbox' : 'radio'}
                name={`${docId}#${question.number}`}
                value={opt.key}
                checked={selected}
                disabled={checked}
                onChange={() => {}}
                className="mt-0.5 pointer-events-none"
              />
              <span className="quiz-option-key font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
                {opt.key}.
              </span>
              <span
                className="quiz-option-text flex-1 text-slate-800 dark:text-slate-200"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(opt.text || '') }}
              />
            </label>
          );
        })}
      </div>

      {/* Card Footer */}
      <div className="quiz-card-footer flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700/60 flex-wrap gap-2">
        <div className="quiz-footer-status text-xs sm:text-sm">
          {!checked ? (
            <span className="quiz-status-idle text-xs font-semibold text-slate-500 dark:text-slate-400">
              Chọn đáp án rồi bấm Kiểm tra
            </span>
          ) : isCorrect ? (
            <span className="quiz-status-ok font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <span>✓</span> <span>Chính xác!</span>
            </span>
          ) : (
            <span className="quiz-status-bad font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
              <span>✗</span>{' '}
              <span>
                Chưa đúng. Đáp án: <b>{question.correctAnswers.join(', ')}</b>
              </span>
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => onCheckSingle(question.number)}
          className="btn-check-single px-4 py-2 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all"
        >
          {checked ? '🔍 Xem lại giải thích' : 'Kiểm tra đáp án ➔'}
        </button>
      </div>

      {/* Explanation Box */}
      {checked && (
        <div
          className={`quiz-explanation-box show ${!isCorrect ? 'wrong-exp' : ''} mt-4 p-4 rounded-xl text-xs leading-relaxed border ${
            isCorrect
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/50 text-emerald-900 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/50 text-rose-900 dark:text-rose-200'
          }`}
        >
          <div className="quiz-exp-title font-bold mb-2 flex items-center gap-1.5 text-xs">
            <span>{isCorrect ? '💡' : '⚠️'}</span>
            <span>GIẢI THÍCH (Đáp án: {question.correctAnswers.join(', ')})</span>
          </div>
          <div
            className="quiz-exp-text prose prose-sm dark:prose-invert max-w-none text-xs"
            dangerouslySetInnerHTML={{
              __html: renderMarkdown(question.explanation || 'Không có giải thích bổ sung.'),
            }}
          />
        </div>
      )}
    </div>
  );
}
