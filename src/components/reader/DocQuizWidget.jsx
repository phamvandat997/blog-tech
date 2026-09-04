import React from 'react';
import { useQuiz } from '../../hooks/useQuiz';
import { QuizQuestionCard } from '../quiz/QuizQuestionCard';

export function DocQuizWidget({ doc }) {
  const {
    quizBank,
    qKeyOf,
    getAnswers,
    isChecked,
    toggleAnswer,
    checkSingleQuestion,
    submitAll,
    resetQuiz,
    getScore,
  } = useQuiz();

  const docId = doc.id;
  const bank = quizBank[docId];

  if (!bank || !bank.quizzes || !bank.quizzes.length) {
    return null;
  }

  const score = getScore(docId);

  return (
    <section className="in-doc-quiz-section mt-10 pt-8 border-t border-slate-200 dark:border-slate-800" id="in-doc-quiz-root" data-quiz-scope={docId}>
      <div className="in-doc-quiz-banner p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="in-doc-quiz-title">
          <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2 m-0 mb-1">
            <span>📝</span> Bài tập trắc nghiệm ({bank.quizzes.length} câu)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 m-0">
            Chọn đáp án rồi bấm Kiểm tra để xem ngay đúng/sai kèm lời giải chi tiết.
          </p>
        </div>

        <div className="in-doc-quiz-actions flex items-center gap-2 flex-wrap">
          <div className="quiz-score-badge px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
            Kết quả: <b>{score.correct}</b> / {score.total} ({score.pct}%)
          </div>
          <button
            type="button"
            onClick={() => resetQuiz(docId)}
            className="btn-quiz-secondary px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition-all cursor-pointer"
          >
            🔄 Làm lại
          </button>
          <button
            type="button"
            onClick={() => submitAll(docId)}
            className="btn-quiz-primary px-4 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500 shadow-xs shadow-indigo-600/30 transition-all cursor-pointer"
          >
            📝 Chấm toàn bộ
          </button>
        </div>
      </div>

      <div className="quiz-cards-wrapper flex flex-col gap-6 mt-4">
        {bank.quizzes.map((q) => {
          const qKey = qKeyOf(docId, q.number);
          const checked = isChecked(qKey);
          const picked = getAnswers(qKey);

          return (
            <QuizQuestionCard
              key={q.number}
              docId={docId}
              question={q}
              checked={checked}
              pickedAnswers={picked}
              onToggleOption={(optKey, isMulti) => toggleAnswer(qKey, optKey, isMulti)}
              onCheckSingle={() => checkSingleQuestion(qKey)}
            />
          );
        })}
      </div>
    </section>
  );
}
