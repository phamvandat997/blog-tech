import { useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useCatalog } from '../hooks/useCatalog';
import { useDocProgress } from '../hooks/useDocProgress';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { BackToTop } from '../components/layout/BackToTop';
import { HubTagCarousel } from '../components/hub/HubTagCarousel';
import { HubDocCard } from '../components/hub/HubDocCard';
import { Pagination } from '../components/common/Pagination';
import { EmptyState } from '../components/common/EmptyState';

const PAGE_SIZE = 12;

export function HubPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { sections, docs, getSection } = useCatalog();
  const { isCompleted } = useDocProgress();

  const sectionId = searchParams.get('s') || sections[0]?.id || 'java';
  const selectedTag = searchParams.get('tag') || '';
  const queryParam = searchParams.get('q') || '';
  const pageParam = parseInt(searchParams.get('p') || '1', 10);

  const currentSection = getSection(sectionId) || sections[0];

  useEffect(() => {
    if (currentSection) {
      document.title = `${currentSection.name} — Blog Tech`;
    }
  }, [currentSection]);

  const updateFilters = (newParams) => {
    const updated = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, val]) => {
      if (val === null || val === undefined || val === '' || val === 'all') {
        updated.delete(key);
      } else {
        updated.set(key, val);
      }
    });
    setSearchParams(updated);
  };

  const sectionDocs = useMemo(() => {
    return docs.filter((d) => d.section === currentSection?.id);
  }, [docs, currentSection]);

  const tagList = useMemo(() => {
    const counts = new Map();
    sectionDocs.forEach((d) => {
      (d.tags || []).forEach((t) => {
        const name = String(t || '').trim();
        if (name) {
          counts.set(name, (counts.get(name) || 0) + 1);
        }
      });
    });
    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [sectionDocs]);

  const filteredDocs = useMemo(() => {
    const q = queryParam.trim().toLowerCase();
    const tag = selectedTag.trim().toLowerCase();
    return sectionDocs.filter((doc) => {
      if (tag) {
        const hasTag = Array.isArray(doc.tags) && doc.tags.some((t) => t.toLowerCase() === tag);
        if (!hasTag) return false;
      }
      if (q) {
        const matchTitle = doc.title?.toLowerCase().includes(q);
        const matchDesc = doc.description?.toLowerCase().includes(q);
        const matchTags = Array.isArray(doc.tags) && doc.tags.some((t) => t.toLowerCase().includes(q));
        return matchTitle || matchDesc || matchTags;
      }
      return true;
    });
  }, [sectionDocs, selectedTag, queryParam]);

  const total = filteredDocs.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(Math.max(1, pageParam), totalPages);
  const startIdx = (currentPage - 1) * PAGE_SIZE;
  const endIdx = Math.min(startIdx + PAGE_SIZE, total);
  const pagedDocs = filteredDocs.slice(startIdx, endIdx);

  const handleResetFilters = () => {
    updateFilters({ tag: '', q: '', p: null });
  };

  if (!currentSection) {
    return (
      <div className="app-container min-h-screen flex flex-col">
        <Navbar />
        <main className="p-12 text-center">
          <EmptyState
            icon="⚠️"
            title="Không tìm thấy mảng nội dung"
            text="Vui lòng kiểm tra lại đường dẫn."
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
    <div className="app-container min-h-screen flex flex-col transition-colors duration-200">
      <Navbar />

      <main className="hub-wrapper w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-6">
          <Link to="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 no-underline text-slate-500">
            Trang chủ
          </Link>
          <span>›</span>
          <span className="text-slate-800 dark:text-slate-200">{currentSection.name}</span>
        </div>

        {/* Tag Carousel */}
        {tagList.length > 0 && (
          <HubTagCarousel
            tags={tagList}
            selectedTag={selectedTag}
            onSelectTag={(tag) => updateFilters({ tag: tag || null, p: null })}
          />
        )}

        {/* Docs Grid */}
        {!filteredDocs.length ? (
          <div className="py-12">
            <EmptyState
              icon="🔍"
              title="Không tìm thấy bài viết nào"
              text="Thử chọn lại tag khác."
              action={
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors cursor-pointer border-0"
                >
                  ✕ Xoá bộ lọc &amp; Đặt lại
                </button>
              }
            />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {pagedDocs.map((doc) => (
                <HubDocCard
                  key={doc.id}
                  doc={doc}
                  isCompleted={isCompleted(doc.id)}
                  onTagClick={(tag) => updateFilters({ tag, p: null })}
                />
              ))}
            </div>

            <Pagination
              page={currentPage}
              totalPages={totalPages}
              total={total}
              startIdx={startIdx}
              endIdx={endIdx}
              noun="bài viết"
              onPageChange={(newPage) => {
                updateFilters({ p: newPage });
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </>
        )}
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
}
