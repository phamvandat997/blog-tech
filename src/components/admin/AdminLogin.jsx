import { useState } from 'react';

export function AdminLogin({ onLogin, onOpenGuestQuiz, error, loading }) {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [owner, setOwner] = useState('phamvandat997');
  const [repo, setRepo] = useState('blog-tech');
  const [branch, setBranch] = useState('master');
  const [showConfig, setShowConfig] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin({ email: email.trim(), token: token.trim(), owner: owner.trim(), repo: repo.trim(), branch: branch.trim() });
  };

  return (
    <main className="admin-login min-h-[75vh] flex items-center justify-center p-4">
      <form className="admin-login-card w-full max-w-md p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-xl" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Đăng nhập</h2>
        <p className="admin-login-lead text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
          Quyền ghi do GitHub quyết định: token phải có quyền đẩy vào kho này thì mới đăng bài được.
        </p>

        <div className="space-y-4 mb-6">
          <label className="admin-field block">
            <span className="admin-label block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Email</span>
            <input
              type="email"
              required
              placeholder="ban@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm focus:border-indigo-500 outline-hidden transition-all text-slate-900 dark:text-white"
            />
          </label>

          <label className="admin-field block">
            <span className="admin-label block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              GitHub personal access token
            </span>
            <input
              type="password"
              required
              placeholder="github_pat_…"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm focus:border-indigo-500 outline-hidden transition-all text-slate-900 dark:text-white font-mono"
            />
            <span className="admin-hint block text-[0.72rem] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              Tạo ở{' '}
              <a
                href="https://github.com/settings/personal-access-tokens/new"
                target="_blank"
                rel="noopener"
                className="text-indigo-600 dark:text-indigo-400 underline"
              >
                Settings → Developer settings → Fine-grained tokens
              </a>
              , chọn đúng kho này và bật <b>hai</b> quyền: <b>Contents: Read and write</b> và <b>Pull requests: Read and write</b>.
            </span>
          </label>

          <details className="admin-repo-config text-xs" open={showConfig} onToggle={(e) => setShowConfig(e.currentTarget.open)}>
            <summary className="cursor-pointer font-bold text-indigo-600 dark:text-indigo-400 py-1">Cấu hình kho</summary>
            <div className="admin-repo-grid grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
              <label className="admin-field block">
                <span className="admin-label block font-semibold text-slate-600 dark:text-slate-400 mb-1">Chủ kho</span>
                <input
                  type="text"
                  required
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                />
              </label>
              <label className="admin-field block">
                <span className="admin-label block font-semibold text-slate-600 dark:text-slate-400 mb-1">Tên kho</span>
                <input
                  type="text"
                  required
                  value={repo}
                  onChange={(e) => setRepo(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                />
              </label>
              <label className="admin-field block">
                <span className="admin-label block font-semibold text-slate-600 dark:text-slate-400 mb-1">Nhánh chính</span>
                <input
                  type="text"
                  required
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                />
              </label>
            </div>
          </details>
        </div>

        {error && (
          <div className="admin-alert admin-alert-error mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-700 dark:text-rose-300">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="admin-btn-primary w-full py-3 rounded-xl font-bold text-xs sm:text-sm bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
        >
          {loading ? 'Đang xác thực...' : 'Đăng nhập'}
        </button>

        <p className="admin-login-note text-[0.7rem] text-slate-400 dark:text-slate-500 mt-4 leading-relaxed">
          Token được lưu trong <code>localStorage</code> của chính trình duyệt này và không gửi đi đâu ngoài <code>api.github.com</code>.
        </p>

        <p className="admin-login-note text-center pt-3 mt-4 border-t border-slate-200 dark:border-slate-700/60 text-xs">
          Hoặc bạn chỉ cần tạo / tải lên bài quiz?{' '}
          <button
            type="button"
            onClick={onOpenGuestQuiz}
            className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline bg-transparent border-0 cursor-pointer p-0"
          >
            Mở Quản lý Quiz (không cần GitHub) ➔
          </button>
        </p>
      </form>
    </main>
  );
}
