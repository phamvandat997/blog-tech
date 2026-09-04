import { useState, useEffect, useRef } from 'react';

function formatTocText(rawText) {
  if (!rawText) return '';
  let text = rawText.replace(/#+/g, '').trim();

  if (/java.*is not recognized|command not found.*java/i.test(text)) {
    return "Lỗi 'java' not recognized";
  }
  if (/nhà phát triển chưa được xác minh/i.test(text)) {
    return 'macOS: Lỗi nhà phát triển';
  }
  if (/chạy được nhưng javac thì không/i.test(text)) {
    return 'Lỗi javac không chạy';
  }
  if (/phiên bản khác với mong đợi/i.test(text)) {
    return 'Sai phiên bản java -version';
  }

  // Remove long notes in parentheses
  text = text.replace(/\s*\([^)]*\)/g, '').trim();

  text = text
    .replace(/^Toàn cảnh quá trình cài đặt/i, 'Tổng quan cài đặt')
    .replace(/^Toàn cảnh quá trình/i, 'Tổng quan')
    .replace(/Chọn phiên bản và bản phân phối JDK/i, 'Chọn phiên bản & JDK')
    .replace(/Dòng thời gian các bản LTS/i, 'Dòng thời gian LTS')
    .replace(/Nên chọn phiên bản nào\??/i, 'Chọn phiên bản')
    .replace(/Nên chọn bản phân phối nào\??/i, 'Chọn bản phân phối')
    .replace(/Dùng bộ cài/i, 'Bộ cài')
    .replace(/Dùng winget/i, 'Cài qua Winget')
    .replace(/Cấu hình biến môi trường thủ công/i, 'Cấu hình môi trường')
    .replace(/Cấu hình biến môi trường trên Linux/i, 'Cấu hình môi trường Linux')
    .replace(/Cấu hình biến môi trường/i, 'Cấu hình môi trường')
    .replace(/Cài thủ công từ file/i, 'Cài từ file')
    .replace(/Chuyển đổi phiên bản bằng/i, 'Đổi phiên bản')
    .replace(/Quản lý nhiều phiên bản Java/i, 'Quản lý phiên bản')
    .replace(/Chương trình đầu tiên/i, 'Viết mã đầu tiên')
    .replace(/Xử lý lỗi thường gặp/i, 'Lỗi thường gặp')
    .replace(/Bảng tổng hợp lỗi thường gặp và cách sửa/i, 'Lỗi thường gặp & Sửa lỗi')
    .replace(/Kiểm tra cài đặt và viết chương trình đầu tiên/i, 'Kiểm tra & Viết mã đầu tiên')
    .replace(/Fedora \/ RHEL \/ CentOS \/ Rocky Linux/i, 'Fedora / RHEL / CentOS')
    .replace(/\s+và\s+/g, ' & ')
    .replace(/\s{2,}/g, ' ')
    .trim();

  return text;
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
      const OFFSET = 140;

      // Bottom of page check
      if (scrollY + window.innerHeight >= document.documentElement.scrollHeight - 20) {
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
    return () => window.removeEventListener('scroll', handleScroll);
  }, [headings]);

  if (headings.length <= 3) return null;

  const scrollToHeading = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const navbarOffset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - navbarOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
      setActiveId(id);
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Floating Toggle Button */}
      <button
        id="btn-toc-toggle"
        className="btn-toc-toggle xl:hidden fixed bottom-6 left-6 z-30 p-3 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 flex items-center justify-center font-bold"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Mở mục lục"
        title="Mục lục bài viết"
      >
        📑
      </button>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          id="toc-backdrop"
          className="toc-backdrop fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 xl:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar TOC */}
      <aside
        id="reader-toc"
        className={`reader-toc w-64 shrink-0 transition-transform ${
          isOpen ? 'is-open fixed inset-y-0 left-0 z-50 bg-white dark:bg-slate-900 p-6 shadow-2xl overflow-y-auto block' : 'hidden xl:block'
        }`}
      >
        <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-2 pb-6">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
            <h4 id="toc-title" className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 m-0">
              Mục lục · {headings.length} phần
            </h4>
            {isOpen && (
              <button
                id="btn-toc-close"
                onClick={() => setIsOpen(false)}
                className="xl:hidden text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold p-1 text-sm"
              >
                ✕
              </button>
            )}
          </div>

          <nav id="toc-nav" ref={navRef}>
            <ul className="toc-list space-y-1 text-xs">
              {headings.map((h) => {
                const isActive = activeId === h.id;
                const formatted = formatTocText(h.title);

                return (
                  <li key={h.id} className={`toc-item-h${h.level}`}>
                    <button
                      type="button"
                      onClick={() => scrollToHeading(h.id)}
                      className={`toc-link block w-full text-left py-1.5 transition-all text-xs font-medium rounded-md ${
                        h.level === 3 ? 'pl-4 pr-2' : 'px-2'
                      } ${
                        isActive
                          ? 'is-current text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950/60'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                      }`}
                      title={h.title}
                    >
                      {formatted}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </aside>
    </>
  );
}
