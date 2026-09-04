import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuiz } from '../../hooks/useQuiz';
import { useCatalog } from '../../hooks/useCatalog';
import { QuizQuestionCard } from './QuizQuestionCard';
import { SocialShare } from '../common/SocialShare';

export function QuizPlayer({ doc, bank, isPreview = false, onBack }) {
  const { sections } = useCatalog();
  const {
    qKeyOf,
    getAnswers,
    isChecked,
    isCorrect,
    toggleAnswer,
    checkSingleQuestion,
    submitAll,
    resetQuiz,
    getScore,
  } = useQuiz();

  const [filter, setFilter] = useState('all'); // 'all' | 'correct' | 'wrong' | 'unanswered'

  const docId = doc.id;
  const sec = sections.find((s) => s.id === doc.section);
  const cat = sec?.categories?.find((c) => c.id === doc.category);
  const score = getScore(docId);
  const quizzes = bank.quizzes || [];

  // Count categories
  const counts = useMemo(() => {
    let correct = 0;
    let wrong = 0;
    let unanswered = 0;

    quizzes.forEach((q) => {
      const qKey = qKeyOf(docId, q.number);
      if (!isChecked(qKey)) {
        unanswered++;
      } else if (isCorrect(qKey, q)) {
        correct++;
      } else {
        wrong++;
      }
    });

    return { all: quizzes.length, correct, wrong, unanswered };
  }, [quizzes, docId, qKeyOf, isChecked, isCorrect]);

  // Filtered questions
  const filteredQuizzes = useMemo(() => {
    return quizzes.filter((q) => {
      const qKey = qKeyOf(docId, q.number);
      const checked = isChecked(qKey);
      if (filter === 'correct') return checked && isCorrect(qKey, q);
      if (filter === 'wrong') return checked && !isCorrect(qKey, q);
      if (filter === 'unanswered') return !checked;
      return true;
    });
  }, [quizzes, filter, docId, qKeyOf, isChecked, isCorrect]);

  const hasTheory = doc.section && doc.category && doc.slug && doc.section !== 'preview';
  const theoryUrl = `/reader?s=${encodeURIComponent(doc.section)}&d=${encodeURIComponent(`${doc.category}/${doc.slug}`)}`;
  const backLabel = isPreview ? '‹ Quay lại Quản lý Quiz' : '‹ Quay lại danh sách bài Quiz';

  return (
    <div className="quiz-player-container" data-quiz-scope={docId}>
      {/* Preview Banner */}
      {isPreview && (
        <div className="mb-5 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300/80 dark:border-amber-700/60 flex items-center justify-between gap-3 text-xs shadow-sm flex-wrap">
          <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold">
            <span className="text-base">👁</span>
            <span>
              <b>Chế độ Thi Thử (Live Exam Preview)</b>: Bạn đang trải nghiệm giao diện thi thực tế từ dữ liệu vừa
              soạn/upload trong Admin. Mọi tính năng chấm điểm và giải thích đều hoạt động thực tế.
            </span>
          </div>
          <Link
            to="/admin?view=quiz"
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-white font-bold no-underline hover:bg-amber-600 transition-colors"
          >
            ← Về Quản Lý Quiz
          </Link>
        </div>
      )}

      {/* Top Back & Theory Links */}
      <div className="flex items-center justify-between gap-4 mb-3 flex-wrap">
        <button
          type="button"
          onClick={onBack}
          className="btn-back-quiz inline-flex items-center gap-1.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <span>{backLabel}</span>
        </button>
        {hasTheory && (
          <Link
            to={theoryUrl}
            target="_blank"
            rel="noopener"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <span>📖 Đọc lại lý thuyết</span> <span>↗</span>
          </Link>
        )}
      </div>

      {/* Dashboard Header */}
      <div className="quiz-dashboard-header p-6 rounded-3xl bg-white dark:bg-slate-800/95 border border-slate-200 dark:border-slate-700/80 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="quiz-meta-info flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50">
              {sec?.name || doc.section}
            </span>
            {cat && (
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {cat.name}
              </span>
            )}
            {doc.phase && (
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800/40">
                {doc.phase}
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight m-0 mb-2">
            {bank.title || doc.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 m-0 leading-relaxed mb-3">
            Chọn đáp án cho từng câu hỏi, sau đó bấm Kiểm tra hoặc Chấm toàn bộ để xem lời giải chi tiết.
          </p>
          {!isPreview && (
            <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
              <SocialShare
                title={`Luyện tập trắc nghiệm: ${bank.title || doc.title}`}
                variant="compact"
              />
            </div>
          )}
        </div>

        <div className="quiz-actions-toolbar flex items-center gap-2.5 flex-wrap">
          <div className="quiz-score-badge px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 shadow-xs">
            Kết quả: <b>{score.correct}</b> / {score.total} ({score.pct}%)
          </div>
          <button
            type="button"
            onClick={() => resetQuiz(docId)}
            className="btn-quiz-secondary px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
          >
            🔄 Làm lại
          </button>
          <button
            type="button"
            onClick={() => submitAll(docId)}
            className="btn-quiz-primary px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500 transition-all shadow-sm shadow-indigo-600/30 cursor-pointer"
          >
            📝 Chấm toàn bộ
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="quiz-filter-bar flex items-center gap-2 overflow-x-auto pb-2 mb-6">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`quiz-tab-pill px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            filter === 'all'
              ? 'active bg-indigo-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          Tất cả (<span>{counts.all}</span>)
        </button>
        <button
          type="button"
          onClick={() => setFilter('correct')}
          className={`quiz-tab-pill px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            filter === 'correct'
              ? 'active bg-emerald-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          Câu đúng (<span>{counts.correct}</span>)
        </button>
        <button
          type="button"
          onClick={() => setFilter('wrong')}
          className={`quiz-tab-pill px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            filter === 'wrong'
              ? 'active bg-rose-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          Câu sai (<span>{counts.wrong}</span>)
        </button>
        <button
          type="button"
          onClick={() => setFilter('unanswered')}
          className={`quiz-tab-pill px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            filter === 'unanswered'
              ? 'active bg-amber-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          Chưa làm (<span>{counts.unanswered}</span>)
        </button>
      </div>

      {/* Questions List */}
      <div className="quiz-cards-wrapper flex flex-col gap-4 mb-6">
        {filteredQuizzes.map((q) => {
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

      {/* Bottom Footer Actions */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
        <button
          type="button"
          onClick={onBack}
          className="btn-back-quiz text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          {backLabel}
        </button>
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={() => {
              resetQuiz(docId);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="btn-quiz-secondary px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition-all flex-1 sm:flex-initial"
          >
            🔄 Làm lại bài này
          </button>
          <button
            type="button"
            onClick={() => {
              submitAll(docId);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="btn-quiz-primary px-5 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all flex-1 sm:flex-initial"
          >
            📝 Nộp bài &amp; Chấm điểm
          </button>
        </div>
      </div>
    </div>
  );
}
