import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link, useParams } from 'react-router-dom';
import { useCatalog } from '../hooks/useCatalog';
import { useDocProgress } from '../hooks/useDocProgress';
import { useTheme } from '../hooks/useTheme';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { BackToTop } from '../components/layout/BackToTop';
import { ReadingProgressBar } from '../components/reader/ReadingProgressBar';
import { TableOfContents } from '../components/reader/TableOfContents';
import { MarkdownViewer } from '../components/reader/MarkdownViewer';
import { renderMarkdownWithHeadings } from '../services/markdown';
import { DocCompletionButton } from '../components/reader/DocCompletionButton';
import { DocQuizWidget } from '../components/reader/DocQuizWidget';
import { RelatedDocs } from '../components/reader/RelatedDocs';
import { DocComments } from '../components/reader/DocComments';
import { EmptyState } from '../components/common/EmptyState';
import { showToast } from '../components/common/Toast';

import { fetchDocData } from '../services/docs';

export function ReaderPage() {
  const [searchParams] = useSearchParams();
  const routeParams = useParams();
  const { isDark } = useTheme();
  const { docs, getSection, getDocByRoute } = useCatalog();
  const { isCompleted, toggleCompleted } = useDocProgress();

  const isPreview = searchParams.get('preview') === '1';
  const sectionParam = routeParams.section || searchParams.get('s');
  const docParam = routeParams['*'] || routeParams.slug || searchParams.get('d');

  const [docContent, setDocContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fontSize, setFontSize] = useState(100);
  const [isZenMode, setIsZenMode] = useState(false);

  // Match doc from catalog or preview
  const currentDoc = useMemo(() => {
    if (isPreview) {
      try {
        const raw = localStorage.getItem('blog.readerPreview');
        if (raw) {
          const preview = JSON.parse(raw);
          return preview.doc;
        }
      } catch {
        // ignore
      }
    }
    if (sectionParam || docParam) {
      const found = getDocByRoute(sectionParam, docParam);
      if (found) return found;
      if (sectionParam) {
        const firstInSec = docs.find((d) => d.section === sectionParam);
        if (firstInSec) return firstInSec;
      }
    }
    return docs[0] || null;
  }, [isPreview, sectionParam, docParam, getDocByRoute, docs]);

  const currentSection = useMemo(() => {
    if (!currentDoc) return null;
    return getSection(currentDoc.section);
  }, [currentDoc, getSection]);

  // Load article content
  useEffect(() => {
    let cancelled = false;

    if (isPreview) {
      try {
        const raw = localStorage.getItem('blog.readerPreview');
        if (raw) {
          const preview = JSON.parse(raw);
          setDocContent(preview.body || '');
          setLoading(false);
          return;
        }
      } catch {
        // ignore
      }
    }

    if (!currentDoc) {
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchDocData(currentDoc.contentFile).then((data) => {
      if (!cancelled) {
        setDocContent(data?.body || '');
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [currentDoc, isPreview]);

  // Set document title
  useEffect(() => {
    if (currentDoc) {
      document.title = `${currentDoc.title} | ${currentSection?.name || 'Blog Tech'}`;
    }
  }, [currentDoc, currentSection]);

  // Font size handlers
  const handleDecFontSize = () => {
    const SIZES = [85, 100, 115, 130, 145];
    const idx = SIZES.indexOf(fontSize);
    if (idx > 0) {
      setFontSize(SIZES[idx - 1]);
      showToast(`Cỡ chữ: ${SIZES[idx - 1]}%`);
    } else {
      showToast('Đã ở mức cỡ chữ nhỏ nhất (85%)');
    }
  };

  const handleIncFontSize = () => {
    const SIZES = [85, 100, 115, 130, 145];
    const idx = SIZES.indexOf(fontSize);
    if (idx < SIZES.length - 1) {
      setFontSize(SIZES[idx + 1]);
      showToast(`Cỡ chữ: ${SIZES[idx + 1]}%`);
    } else {
      showToast('Đã ở mức cỡ chữ lớn nhất (145%)');
    }
  };

  const toggleZen = () => {
    setIsZenMode((prev) => {
      const next = !prev;
      showToast(next ? '🧘 Đã bật chế độ tập trung' : 'Đã thoát chế độ tập trung');
      return next;
    });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(
      () => showToast('✓ Đã sao chép liên kết bài viết!'),
      () => showToast('Không thể sao chép liên kết')
    );
  };

  // Bỏ H1 đầu bài vì tiêu đề đã nằm ở header trang.
  const cleanBody = useMemo(
    () => (docContent || '').replace(/^\s*#[^\n]*\r?\n?/, ''),
    [docContent]
  );

  // Một lần dựng, dùng cho cả nội dung lẫn mục lục — id đề mục vì thế luôn khớp.
  const { html: bodyHtml, headings } = useMemo(
    () => renderMarkdownWithHeadings(cleanBody),
    [cleanBody]
  );

  if (!loading && !currentDoc) {
    return (
      <div className="app-container min-h-screen flex flex-col">
        <Navbar />
        <main className="p-12 text-center flex-1">
          <EmptyState
            icon="⚠️"
            title="Không tìm thấy bài viết"
            text="Đường dẫn không tồn tại hoặc đã bị đổi vị trí."
            action={
              <Link to="/" className="btn-primary no-underline inline-block mt-4">
                ← Về trang chủ
              </Link>
            }
          />
        </main>
        <Footer />
      </div>
    );
  }


  return (
    <div className={`app-container min-h-screen flex flex-col transition-colors duration-200 ${isZenMode ? 'zen-mode' : ''}`}>
      <ReadingProgressBar />
      {!isZenMode && <Navbar />}

      {/* Preview Banner */}
      {isPreview && (
        <div className="bg-amber-50 dark:bg-amber-950/80 border-b border-amber-300 dark:border-amber-700/80 p-3 text-center text-xs font-bold text-amber-900 dark:text-amber-200">
          👁 Bạn đang ở chế độ xem thử bài viết nháp trước khi đăng.
        </div>
      )}

      {/* Trang đọc chạy hết bề ngang màn hình (bề rộng cột do .reader-grid
          trong blog.css chia), không bó trong max-w-7xl như các trang khác. */}
      <main className="reader-wrapper w-full flex-1">
        {/* Breadcrumb & Navigation */}
        {!isZenMode && currentSection && currentDoc && (
          <div className="flex items-center justify-between gap-4 mb-6">
            {/* min-w-0 ở cả hàng lẫn mẩu cuối: thiếu nó thì truncate không bao
                giờ chạy, tiêu đề dài tràn khỏi màn hình điện thoại. */}
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 min-w-0 flex-1">
              <Link
                to="/"
                className="hover:text-indigo-600 dark:hover:text-indigo-400 no-underline text-slate-500 whitespace-nowrap hidden sm:inline"
              >
                Trang chủ
              </Link>
              <span className="hidden sm:inline" aria-hidden="true">›</span>
              <Link
                to={`/hub?s=${currentSection.id}`}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 no-underline text-slate-500 whitespace-nowrap"
              >
                {currentSection.name}
              </Link>
              <span aria-hidden="true">›</span>
              <span className="text-slate-800 dark:text-slate-200 truncate min-w-0">{currentDoc.title}</span>
            </div>

            <Link
              to={`/hub?s=${currentSection.id}&c=${currentDoc.category}`}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline whitespace-nowrap shrink-0"
            >
              <span className="hidden sm:inline">⬅ Về danh mục</span>
              <span className="sm:hidden" aria-label="Về danh mục">⬅ Danh mục</span>
            </Link>
          </div>
        )}


        {/* Reader Layout Grid */}
        {/* Lưới do blog.css định nghĩa, không dùng breakpoint của Tailwind: mục
            lục đổi giữa cột dính và ngăn kéo ở 1150px, còn `xl:` của Tailwind là
            1280px — lệch nhau nên dải 1151–1279px hỏng bố cục. */}
        <div className="reader-grid">
          {/* Cột mục lục — display:contents nên .reader-toc vào thẳng lưới */}
          {!isZenMode && (
            <div className="toc-column">
              <TableOfContents headings={headings} />
            </div>
          )}

          {/* Main Article Content */}
          <div className={isZenMode ? 'reader-main-column w-full max-w-3xl mx-auto' : 'reader-main-column'}>
          {/* Article Header Card */}
          {currentDoc && (
            <header className="reader-header mb-8 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-sm">
              <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="px-2.5 py-0.5 rounded-full text-xs font-bold"
                    style={{
                      backgroundColor: `${currentSection?.color || '#6366f1'}15`,
                      color: currentSection?.color || '#6366f1',
                      border: `1px solid ${currentSection?.color || '#6366f1'}33`,
                    }}
                  >
                    {currentSection?.name || currentDoc.section}
                  </span>
                  {currentDoc.phase && (
                    <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800/40">
                      {currentDoc.phase}
                    </span>
                  )}
                  {currentDoc.questions > 0 && (
                    <Link
                      to={`/quiz?id=${encodeURIComponent(currentDoc.id)}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline no-underline"
                    >
                      <span>🎯</span> <span>Làm Quiz ({currentDoc.questions} câu)</span>
                    </Link>
                  )}
                </div>

                {/* Reader Controls Toolbar */}
                <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={handleDecFontSize}
                    className="px-2 py-1 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded cursor-pointer"
                    title="Giảm cỡ chữ"
                  >
                    A-
                  </button>
                  <span className="text-[0.68rem] font-bold text-slate-400 px-1">{fontSize}%</span>
                  <button
                    type="button"
                    onClick={handleIncFontSize}
                    className="px-2 py-1 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded cursor-pointer"
                    title="Tăng cỡ chữ"
                  >
                    A+
                  </button>
                  <div className="h-3 w-px bg-slate-300 dark:bg-slate-700 mx-1" />
                  <button
                    type="button"
                    onClick={toggleZen}
                    className="p-1 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded cursor-pointer"
                    title={isZenMode ? 'Thoát chế độ tập trung (Z)' : 'Chế độ tập trung (Z)'}
                  >
                    {isZenMode ? '✕' : '🧘'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="p-1 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded cursor-pointer"
                    title="Sao chép liên kết"
                  >
                    🔗
                  </button>
                </div>
              </div>

              {/* text-balance chia đều chữ giữa các dòng, max-w giữ cho tiêu đề
                  không kéo dài hết màn hình rộng rồi rớt lại một dòng cụt. */}
              <h1
                id="reader-title"
                className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight text-balance max-w-4xl m-0 mb-3"
              >
                {currentDoc.title}
              </h1>

              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                {currentDoc.updatedDate && <span>📅 Cập nhật: {currentDoc.updatedDate}</span>}
                <span>⏱️ ~{currentDoc.readingMinutes || 5} phút đọc</span>
              </div>

              {currentDoc.tags && currentDoc.tags.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60">
                  {currentDoc.tags.map((tag) => (
                    <Link
                      key={tag}
                      to={`/hub?s=${currentDoc.section}&q=${tag}`}
                      className="doc-tag text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/60 px-2.5 py-0.5 rounded-full hover:bg-indigo-100 transition-colors no-underline"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              )}
            </header>
          )}
            {loading ? (
              <div className="py-16 text-center text-slate-400">
                <div className="text-3xl mb-3 animate-spin">⏳</div>
                <div className="text-sm font-semibold">Đang nạp nội dung bài học...</div>
              </div>
            ) : (
              <div style={{ fontSize: `${fontSize}%` }}>
                <MarkdownViewer html={bodyHtml} isDark={isDark} />

                {/* Completion Check Button */}
                {currentDoc && !isPreview && (
                  <DocCompletionButton
                    isCompleted={isCompleted(currentDoc.id)}
                    onToggle={() => toggleCompleted(currentDoc.id)}
                  />
                )}

                {/* Embedded Quiz Section (if available) */}
                {currentDoc && currentDoc.questions > 0 && !isPreview && (
                  <DocQuizWidget doc={currentDoc} />
                )}

                {/* Bình luận qua GitHub Discussions */}
                {currentDoc && !isPreview && (
                  <DocComments docId={currentDoc.id} isDark={isDark} />
                )}
              </div>
            )}
          </div>

          {/* Cột phải: bài viết liên quan. Là ô lưới riêng (không nằm trong cột
              nội dung) nên desktop mới dính được bên phải; ≤1150px blog.css tự
              hạ nó xuống dưới bài viết. */}
          {currentDoc && !isPreview && !isZenMode && (
            <div className="related-column">
              <RelatedDocs currentDoc={currentDoc} allDocs={docs} isDocCompleted={isCompleted} />
            </div>
          )}
        </div>
      </main>

      {!isZenMode && <Footer />}
      <BackToTop />
    </div>
  );
}
