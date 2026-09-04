import { useState, useEffect, useRef } from 'react';

/**
 * Nhãn hiển thị trong mục lục: chỉ dọn dấu markdown còn sót (`code`, **đậm**)
 * và khoảng trắng thừa. Mục lục xuống được hai dòng nên không rút gọn tiêu đề —
 * trước đây có một dãy replace viết cứng theo đúng bài cài đặt Java, bài khác
 * gặp phải là bị đổi chữ oan.
 */
function formatTocText(rawText) {
  return String(rawText || '')
    .replace(/#+/g, '')
    .replace(/`+/g, '')
    .replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export function TableOfContents({ headings, contentRef }) {
  const [activeId, setActiveId] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const navRef = useRef(null);

  // Scrollspy
  useEffect(() => {
    if (!headings.length) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      const OFFSET = 140;

      // Chạm đáy trang thì sáng mục cuối. Chỉ tính khi trang thật sự cuộn được:
      // lúc mới mount, nội dung chưa dựng xong nên scrollHeight ≈ innerHeight,
      // không chặn thì mục lục sáng ngay mục CUỐI dù đang ở đầu bài.
      const scrollable = docHeight > window.innerHeight + 40;
      if (scrollable && scrollY + window.innerHeight >= docHeight - 20) {
        setActiveId(headings[headings.length - 1].id);
        return;
      }

      let currentId = headings[0]?.id || '';
      for (let i = 0; i < headings.length; i++) {
        const el = document.getElementById(headings[i].id);
        if (el) {
          const top = el.getBoundingClientRect().top + scrollY;
          if (top <= scrollY + OFFSET) {
            currentId = headings[i].id;
          } else {
            break;
          }
        }
      }
      setActiveId(currentId);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // Ảnh, webfont và sơ đồ mermaid dựng xong là chiều cao bài đổi — tính lại,
    // nếu không mục đang sáng sẽ lệch cho tới lần cuộn đầu tiên.
    const observer = new ResizeObserver(handleScroll);
    observer.observe(document.body);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, [headings]);

  // Mục lục dài hơn khung: kéo mục đang đọc vào tầm nhìn, nhưng chỉ cuộn trong
  // khung mục lục (scrollIntoView sẽ kéo cả trang, hỏng luôn vị trí đang đọc).
  useEffect(() => {
    const nav = navRef.current;
    if (!nav || !activeId) return;

    const link = nav.querySelector('.toc-link.is-current');
    if (!link) return;

    const navBox = nav.getBoundingClientRect();
    const linkBox = link.getBoundingClientRect();
    const margin = 24;

    if (linkBox.top < navBox.top + margin) {
      nav.scrollTop -= navBox.top + margin - linkBox.top;
    } else if (linkBox.bottom > navBox.bottom - margin) {
      nav.scrollTop += linkBox.bottom - (navBox.bottom - margin);
    }
  }, [activeId]);

  // Khoá cuộn nền khi ngăn kéo mục lục mở trên màn hình hẹp (blog.css dùng
  // body.toc-open), và luôn dọn lại khi rời trang.
  useEffect(() => {
    document.body.classList.toggle('toc-open', isOpen);
    return () => document.body.classList.remove('toc-open');
  }, [isOpen]);

  if (headings.length <= 3) return null;

  const scrollToHeading = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    // Heading đã có scroll-margin-top trong CSS nên không phải tự trừ navbar.
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveId(id);
    setIsOpen(false);
  };

  return (
    <>
      {/* Nút mở mục lục — chỉ hiện ở màn hình hẹp, do blog.css quyết định */}
      <button
        id="btn-toc-toggle"
        type="button"
        className="btn-toc-toggle"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        aria-controls="reader-toc"
        aria-label="Mở mục lục bài viết"
        title="Mục lục bài viết"
      >
        <span aria-hidden="true">📑</span>
        <span className="btn-toc-toggle-label">Mục lục</span>
      </button>

      {isOpen && (
        <div className="toc-backdrop" onClick={() => setIsOpen(false)} aria-hidden="true" />
      )}

      <aside
        id="reader-toc"
        className={`reader-toc${isOpen ? ' is-open' : ''}`}
        aria-label="Mục lục bài viết"
      >
        <div className="toc-head">
          <span className="toc-title">Mục lục</span>
          <span className="toc-count">{headings.length} phần</span>
          <button
            type="button"
            className="toc-close"
            onClick={() => setIsOpen(false)}
            aria-label="Đóng mục lục"
          >
            ✕
          </button>
        </div>

        <nav className="toc-nav" id="toc-nav" ref={navRef}>
          <ul className="toc-list">
            {headings.map((h) => {
              const isActive = activeId === h.id;
              return (
                <li key={h.id} className={`toc-item-h${h.level}`}>
                  <button
                    type="button"
                    className={`toc-link${isActive ? ' is-current' : ''}`}
                    onClick={() => scrollToHeading(h.id)}
                    aria-current={isActive ? 'true' : undefined}
                    title={h.title}
                  >
                    {/* Cắt hai dòng phải nằm ở span: <button> luôn bị blockify
                        thành flow-root nên -webkit-line-clamp đặt trên nút vô tác dụng. */}
                    <span className="toc-link-text">{formatTocText(h.title)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}
