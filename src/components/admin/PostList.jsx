import { useState, useMemo } from 'react';
import { Pagination } from '../common/Pagination';

const PAGE_SIZE = 15;

export function PostList({ posts, onEditPost, onDeletePost, onRefresh, loading }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'published' | 'pending'
  const [page, setPage] = useState(1);

  const filteredPosts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return posts.filter((p) => {
      if (filter === 'published' && p.status !== 'published') return false;
      if (filter === 'pending' && p.status !== 'pending') return false;
      if (q) {
        const matchTitle = p.title?.toLowerCase().includes(q);
        const matchPath = p.path?.toLowerCase().includes(q);
        const matchSection = p.section?.toLowerCase().includes(q);
        return matchTitle || matchPath || matchSection;
      }
      return true;
    });
  }, [posts, search, filter]);

  const total = filteredPosts.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const startIdx = (currentPage - 1) * PAGE_SIZE;
  const endIdx = Math.min(startIdx + PAGE_SIZE, total);
  const pagedPosts = filteredPosts.slice(startIdx, endIdx);

  return (
    <main className="admin-list-view w-full max-w-5xl mx-auto py-6 px-4">
      {/* Search & Refresh Toolbar */}
      <div className="admin-list-bar flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
        <div className="admin-field admin-list-search relative w-full sm:w-80">
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Lọc theo tiêu đề hoặc đường dẫn…"
            className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 outline-hidden focus:border-indigo-500"
          />
          <span className="absolute left-2.5 top-2.5 text-xs text-slate-400">🔍</span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="admin-btn-secondary px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-300 transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Đang tải...' : '↻ Tải lại'}
          </button>
        </div>
      </div>

      {/* Status Filters */}
      <div className="admin-filters flex items-center gap-1.5 mb-6" role="group">
        <button
          type="button"
          onClick={() => {
            setFilter('all');
            setPage(1);
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            filter === 'all'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          Tất cả ({posts.length})
        </button>
        <button
          type="button"
          onClick={() => {
            setFilter('published');
            setPage(1);
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            filter === 'published'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          Đang đăng ({posts.filter((p) => p.status === 'published').length})
        </button>
        <button
          type="button"
          onClick={() => {
            setFilter('pending');
            setPage(1);
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            filter === 'pending'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          Chờ duyệt ({posts.filter((p) => p.status === 'pending').length})
        </button>
      </div>

      {/* Post Items */}
      {!filteredPosts.length ? (
        <div className="text-center py-12 p-8 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
          Không tìm thấy bài viết nào phù hợp.
        </div>
      ) : (
        <div className="admin-list space-y-3 mb-6">
          {pagedPosts.map((post) => {
            const isPending = post.status === 'pending';

            return (
              <div
                key={post.path}
                className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-xs hover:shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all"
              >
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="text-[0.68rem] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-mono">
                      {post.path}
                    </span>
                    {isPending ? (
                      <span className="text-[0.68rem] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">
                        Chờ duyệt {post.pr ? `(PR #${post.pr.number})` : ''}
                      </span>
                    ) : (
                      <span className="text-[0.68rem] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                        Đang đăng
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate m-0">{post.title}</h4>
                </div>

                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => onEditPost(post)}
                    disabled={loading}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    ✏️ Sửa bài
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeletePost(post)}
                    disabled={loading}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    🗑️ Xoá
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      <Pagination
        page={currentPage}
        totalPages={totalPages}
        total={total}
        startIdx={startIdx}
        endIdx={endIdx}
        noun="bài viết"
        onPageChange={setPage}
      />
    </main>
  );
}
