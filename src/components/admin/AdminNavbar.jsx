import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';

export function AdminNavbar({ view, onChangeView, user, onLogout }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="navbar sticky top-0 z-40 w-full backdrop-blur-md bg-white/90 dark:bg-slate-900/85 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="navbar-inner w-full lg:w-[85%] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4 flex-wrap">
        {/* Brand */}
        <Link to="/" className="brand flex items-center gap-3 no-underline group">
          <div className="brand-logo">
            <img src="/assets/images/logo.svg" alt="Blog Tech Logo" className="brand-logo-img" />
          </div>
          <div className="brand-text">
            <div className="brand-title flex items-center text-base font-black tracking-tight leading-tight m-0">
              <span className="text-indigo-600 dark:text-indigo-400">Blog</span>
              <span className="text-slate-900 dark:text-white ml-1">Tech</span>
              <span className="ml-2 text-[0.68rem] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
                Admin
              </span>
            </div>
          </div>
        </Link>

        {/* Admin Navigation Tabs */}
        <div className="nav-tabs-group flex items-center gap-1.5 overflow-x-auto">
          <button
            type="button"
            onClick={() => onChangeView('list')}
            className={`nav-tab-btn px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              view === 'list'
                ? 'active bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Danh sách bài viết
          </button>
          <button
            type="button"
            onClick={() => onChangeView('editor')}
            className={`nav-tab-btn px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              view === 'editor'
                ? 'active bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Soạn bài mới
          </button>
          <button
            type="button"
            onClick={() => onChangeView('quiz')}
            className={`nav-tab-btn px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              view === 'quiz'
                ? 'active bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            🎯 Quản lý Quiz
          </button>
        </div>

        {/* User Actions */}
        <div className="nav-actions flex items-center gap-2">
          {user && (
            <span className="admin-whoami text-xs font-semibold text-slate-500 dark:text-slate-400 hidden sm:inline">
              @{user.login}
            </span>
          )}
          <button
            className="btn-icon p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
            onClick={toggleTheme}
            data-theme-toggle
            title="Chuyển giao diện sáng / tối"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          {user && (
            <button
              type="button"
              onClick={onLogout}
              className="btn-icon p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
              title="Đăng xuất"
            >
              🚪
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
