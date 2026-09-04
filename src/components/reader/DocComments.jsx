import { useEffect, useRef } from 'react';

// Bình luận bằng GitHub Discussions (giscus). Cấu hình lấy nguyên từ bản trước
// khi chuyển sang React — đổi repo thì phải đổi cả repo-id và category-id, lấy
// ở https://giscus.app.
const GISCUS = {
  repo: 'phamvandat997/blog-tech',
  repoId: 'R_kgDOULiDYw',
  category: 'General',
  categoryId: 'DIC_kwDOULiDY84DEw-j',
};

export function DocComments({ docId, isDark }) {
  const containerRef = useRef(null);

  // Nạp lại khung bình luận mỗi khi đổi bài: giscus gắn theo data-term nên
  // không tự đổi discussion khi điều hướng trong SPA.
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !docId) return;

    container.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.async = true;
    script.crossOrigin = 'anonymous';

    const attrs = {
      'data-repo': GISCUS.repo,
      'data-repo-id': GISCUS.repoId,
      'data-category': GISCUS.category,
      'data-category-id': GISCUS.categoryId,
      'data-mapping': 'specific',
      'data-term': docId,
      'data-strict': '0',
      'data-reactions-enabled': '1',
      'data-emit-metadata': '0',
      'data-input-position': 'top',
      'data-theme': isDark ? 'dark' : 'light',
      'data-lang': 'vi',
      'data-loading': 'lazy',
    };
    Object.entries(attrs).forEach(([k, v]) => script.setAttribute(k, v));

    container.appendChild(script);

    return () => {
      container.innerHTML = '';
    };
    // isDark cố tình không nằm trong deps: đổi giao diện thì báo cho iframe qua
    // postMessage ở effect dưới, dựng lại cả khung sẽ mất bình luận đang gõ dở.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docId]);

  // Đồng bộ sáng/tối cho iframe đã nạp.
  useEffect(() => {
    const iframe = document.querySelector('iframe.giscus-frame');
    if (!iframe?.contentWindow) return;
    iframe.contentWindow.postMessage(
      { giscus: { setConfig: { theme: isDark ? 'dark' : 'light' } } },
      'https://giscus.app'
    );
  }, [isDark]);

  if (!docId) return null;

  return (
    <section className="reader-comments-section" id="reader-comments-section">
      <div className="comments-header flex items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700/60">
        <div className="comments-title flex items-center gap-3">
          <span className="comments-icon text-2xl" aria-hidden="true">💬</span>
          <h3 className="text-base font-bold text-slate-900 dark:text-white m-0">
            Bình luận &amp; Thảo luận
          </h3>
        </div>
      </div>
      <div className="giscus-container" ref={containerRef} />
    </section>
  );
}
