import React from 'react';
import { Link } from 'react-router-dom';
import { useCatalog } from '../../hooks/useCatalog';

export function HeroSection() {
  const { docs } = useCatalog();

  const totalDocs = docs.length;
  const totalQuizzes = docs.reduce((sum, d) => sum + (d.questions || 0), 0);

  return (
    <section className="hero-section relative text-center py-8 sm:py-12 px-4 sm:px-6 mb-12 w-full lg:w-[60%] lg:max-w-[60%] mx-auto">
      {/* Ambient Glow Effect */}
      <div
        className="hero-glow pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 w-[340px] sm:w-[560px] md:w-[680px] h-[260px] sm:h-[340px] bg-gradient-to-tr from-indigo-500/20 via-purple-500/15 to-pink-500/10 dark:from-indigo-500/25 dark:via-purple-500/20 dark:to-pink-500/15 blur-3xl -z-10 rounded-full"
        aria-hidden="true"
      />

      {/* Tech Pill Badge */}
      <div className="hero-badge inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/70 text-slate-700 dark:text-slate-200 shadow-xs mb-5 transition-all hover:border-indigo-500/50">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <span className="text-indigo-600 dark:text-indigo-400 font-black">TechMentor Pro</span>
        <span className="text-slate-300 dark:text-slate-600">/</span>
        <span>Nền Tảng Học Tập &amp; Ôn Luyện Kỹ Thuật</span>
      </div>

      {/* High-Impact Hero Title */}
      <h1 className="hero-title text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.15] mb-5">
        Chia Sẽ <br className="hidden sm:inline" />
        <span className="hero-gradient-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 dark:from-indigo-400 dark:via-purple-300 dark:to-pink-400 bg-clip-text text-transparent">
          Kiến Thức Lập Trình
        </span>
      </h1>

      {/* Quick Action CTA Buttons */}
      {totalQuizzes > 0 && (
        <div className="hero-cta flex items-center justify-center gap-3 sm:gap-4 flex-wrap mb-9">
          <Link
            to="/quiz"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all no-underline"
          >
            <span>🎯</span>
            <span>Luyện Quiz Ngay</span>
            <span className="text-[0.7rem] px-2 py-0.5 rounded-full bg-white/20 font-mono">
              {totalQuizzes}+ câu
            </span>
          </Link>
        </div>
      )}

      {/* Hero Statistics Bar */}
      <div className="hero-stats flex flex-wrap justify-center items-center gap-3 sm:gap-4">
        <div className="hero-stat-item flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/85 dark:bg-slate-800/85 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/70 shadow-xs hover:-translate-y-0.5 hover:border-indigo-500/60 transition-all">
          <span className="hero-stat-icon text-xl">📚</span>
          <span className="hero-stat-val text-lg font-black text-indigo-600 dark:text-indigo-400" id="hero-docs-val">
            {totalDocs}
          </span>
          <span className="hero-stat-lbl text-xs font-semibold text-slate-500 dark:text-slate-400">
            Bài viết chuyên sâu
          </span>
        </div>
        {totalQuizzes > 0 && (
          <Link
            to="/quiz"
            className="hero-stat-item flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/85 dark:bg-slate-800/85 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/70 shadow-xs hover:-translate-y-0.5 hover:border-indigo-500/60 transition-all no-underline"
            title="Xem tất cả bài tập trắc nghiệm"
          >
            <span className="hero-stat-icon text-xl">📝</span>
            <span className="hero-stat-val text-lg font-black text-indigo-600 dark:text-indigo-400" id="hero-quiz-val">
              {totalQuizzes}
            </span>
            <span className="hero-stat-lbl text-xs font-semibold text-slate-500 dark:text-slate-400">
              Câu trắc nghiệm
            </span>
          </Link>
        )}
      </div>
    </section>
  );
}
