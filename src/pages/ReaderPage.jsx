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
import { DocCompletionButton } from '../components/reader/DocCompletionButton';
import { DocQuizWidget } from '../components/reader/DocQuizWidget';
import { AdjacentDocNav } from '../components/reader/AdjacentDocNav';
import { RelatedDocs } from '../components/reader/RelatedDocs';
import { EmptyState } from '../components/common/EmptyState';
import { showToast } from '../components/common/Toast';

const docModules = import.meta.glob('../generated/docs/*.json');

async function fetchDocData(contentFile) {
  const path = `../generated/docs/${contentFile}.json`;
  if (docModules[path]) {
    const mod = await docModules[path]();
    return mod.default || mod;
  }
  try {
    const res = await fetch(`/generated/docs/${contentFile}.json`);
    if (res.ok) return await res.json();
  } catch {
    // ignore
  }
  return null;
}

function toSlug(text) {
  return String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function extractHeadings(markdown) {
  if (!markdown) return [];
  const lines = markdown.split('\n');
  const headings = [];
  let inCode = false;
  const seen = new Map();

  lines.forEach((line) => {
    if (line.trim().startsWith('```')) {
      inCode = !inCode;
      return;
    }
    if (inCode) return;
    const match = line.match(/^(#{2,3})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const rawTitle = match[2].trim();
      const baseId = toSlug(rawTitle) || 'heading';
      const n = (seen.get(baseId) || 0) + 1;
      seen.set(baseId, n);
      const id = n === 1 ? baseId : `${baseId}-${n}`;
      headings.push({ id, title: rawTitle, level });
    }
  });

  return headings;
}

export function ReaderPage() {
  const [searchParams] = useSearchParams();
  const routeParams = useParams();
  const { isDark } = useTheme();
  const { docs, getSection, getDocByRoute, getAdjacentDocs } = useCatalog();
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
    return getDocByRoute(sectionParam, docParam);
  }, [isPreview, sectionParam, docParam, getDocByRoute]);

  const currentSection = useMemo(() => {
    if (!currentDoc) return null;
    return getSection(currentDoc.section);
  }, [currentDoc, getSection]);

  const adjacent = useMemo(() => {
    if (!currentDoc || isPreview) return { prev: null, next: null };
    return getAdjacentDocs(currentDoc.id);
  }, [currentDoc, isPreview, getAdjacentDocs]);

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

  const headings = useMemo(() => {
    return extractHeadings(docContent || '');
  }, [docContent]);

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

  // Remove first H1 from body if it matches title
  const cleanBody = (docContent || '').replace(/^\s*#[^\n]*\r?\n?/, '');

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

      <main className="reader-wrapper w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {/* Breadcrumb & Navigation */}
        {!isZenMode && currentSection && currentDoc && (
          <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
              <Link to="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 no-underline text-slate-500">
                Trang chủ
              </Link>
              <span>›</span>
              <Link
                to={`/hub?s=${currentSection.id}`}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 no-underline text-slate-500"
              >
                {currentSection.name}
              </Link>
              <span>›</span>
              <span className="text-slate-800 dark:text-slate-200 truncate max-w-xs">{currentDoc.title}</span>
            </div>

            <Link
              to={`/hub?s=${currentSection.id}&c=${currentDoc.category}`}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              ⬅ Về danh mục
            </Link>
          </div>
        )}

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

            <h1
              id="reader-title"
              className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight m-0 mb-3"
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

        {/* Reader Layout Grid */}
        <div className="reader-grid grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Table of Contents Column */}
          {!isZenMode && (
            <div className="hidden xl:block xl:col-span-1">
              <TableOfContents headings={headings} />
            </div>
          )}

          {/* Main Article Content */}
          <div className={isZenMode ? 'w-full max-w-3xl mx-auto' : 'xl:col-span-3'}>
            {loading ? (
              <div className="py-16 text-center text-slate-400">
                <div className="text-3xl mb-3 animate-spin">⏳</div>
                <div className="text-sm font-semibold">Đang nạp nội dung bài học...</div>
              </div>
            ) : (
              <div style={{ fontSize: `${fontSize}%` }}>
                <MarkdownViewer markdown={cleanBody} isDark={isDark} />

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

                {/* Adjacent Previous / Next Doc Links */}
                {!isPreview && (
                  <AdjacentDocNav prev={adjacent.prev} next={adjacent.next} />
                )}

                {/* Related Articles */}
                {currentDoc && !isPreview && (
                  <RelatedDocs currentDoc={currentDoc} allDocs={docs} isDocCompleted={isCompleted} />
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {!isZenMode && <Footer />}
      <BackToTop />
    </div>
  );
}
