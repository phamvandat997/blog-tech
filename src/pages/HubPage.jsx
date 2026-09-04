import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useCatalog } from '../hooks/useCatalog';
import { useDocProgress } from '../hooks/useDocProgress';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { BackToTop } from '../components/layout/BackToTop';
import { CategorySidebar } from '../components/hub/CategorySidebar';
import { SectionProgressTracker } from '../components/hub/SectionProgressTracker';
import { PhaseFilterBar } from '../components/hub/PhaseFilterBar';
import { HubDocCard } from '../components/hub/HubDocCard';
import { Pagination } from '../components/common/Pagination';
import { EmptyState } from '../components/common/EmptyState';

const PAGE_SIZE = 12;

export function HubPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { sections, docs, getSection } = useCatalog();
  const { completedDocs, isCompleted } = useDocProgress();

  const sectionId = searchParams.get('s') || sections[0]?.id || 'java';
  const categoryId = searchParams.get('c') || 'all';
  const phaseId = searchParams.get('phase') || 'all';
  const queryParam = searchParams.get('q') || '';
  const pageParam = parseInt(searchParams.get('p') || '1', 10);

  const [searchInput, setSearchInput] = useState(queryParam);

  const currentSection = getSection(sectionId) || sections[0];

  useEffect(() => {
    if (currentSection) {
      document.title = `${currentSection.name} — Blog Tech`;
    }
  }, [currentSection]);

  useEffect(() => {
    setSearchInput(queryParam);
  }, [queryParam]);

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

  const completedCount = useMemo(() => {
    return sectionDocs.filter((d) => completedDocs.has(d.id)).length;
  }, [sectionDocs, completedDocs]);

  const docCountsByCategory = useMemo(() => {
    const counts = {};
    sectionDocs.forEach((d) => {
      counts[d.category] = (counts[d.category] || 0) + 1;
    });
    return counts;
  }, [sectionDocs]);

  const phases = useMemo(() => {
    return Array.from(new Set(sectionDocs.map((d) => d.phase).filter(Boolean)));
  }, [sectionDocs]);

  const filteredDocs = useMemo(() => {
    const q = queryParam.trim().toLowerCase();
    return sectionDocs.filter((doc) => {
      if (categoryId !== 'all' && doc.category !== categoryId) return false;
      if (phaseId !== 'all' && doc.phase !== phaseId) return false;
      if (q) {
        const matchTitle = doc.title?.toLowerCase().includes(q);
        const matchDesc = doc.description?.toLowerCase().includes(q);
        const matchTags = Array.isArray(doc.tags) && doc.tags.some((t) => t.toLowerCase().includes(q));
        const matchPhase = doc.phase?.toLowerCase().includes(q);
        return matchTitle || matchDesc || matchTags || matchPhase;
      }
      return true;
    });
  }, [sectionDocs, categoryId, phaseId, queryParam]);

  const total = filteredDocs.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(Math.max(1, pageParam), totalPages);
  const startIdx = (currentPage - 1) * PAGE_SIZE;
  const endIdx = Math.min(startIdx + PAGE_SIZE, total);
  const pagedDocs = filteredDocs.slice(startIdx, endIdx);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateFilters({ q: searchInput.trim(), p: null });
  };

  const handleResetFilters = () => {
    setSearchInput('');
    updateFilters({ c: 'all', phase: 'all', q: '', p: null });
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
        {/* Breadcrumb & Section Header */}
        <div className="hub-header mb-8">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-2">
            <Link to="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 no-underline text-slate-500">
              Trang chủ
            </Link>
            <span>›</span>
            <span className="text-slate-800 dark:text-slate-200">{currentSection.name}</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight m-0 mb-1">
                {currentSection.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 m-0 max-w-2xl leading-relaxed">
                {currentSection.tagline}
              </p>
            </div>

            {/* In-Hub Search */}
            <form onSubmit={handleSearchSubmit} className="hub-search relative w-full md:w-72">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={`Tìm trong ${currentSection.name}...`}
                className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 outline-hidden focus:border-indigo-500 shadow-xs"
              />
              <span className="absolute left-3 top-2.5 text-xs text-slate-400">🔍</span>
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput('');
                    updateFilters({ q: '', p: null });
                  }}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </form>
          </div>
        </div>

        {/* Layout Grid: Sidebar (Categories) + Main Content (Docs) */}
        <div className="hub-layout grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <CategorySidebar
                categories={currentSection.categories || []}
                selectedCategory={categoryId}
                onSelectCategory={(catId) => updateFilters({ c: catId, p: null })}
                docCounts={docCountsByCategory}
                totalDocCount={sectionDocs.length}
              />
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <SectionProgressTracker
              section={currentSection}
              docs={sectionDocs}
              completedCount={completedCount}
            />

            <PhaseFilterBar
              phases={phases}
              selectedPhase={phaseId}
              onSelectPhase={(pId) => updateFilters({ phase: pId, p: null })}
            />

            {/* Docs Grid */}
            {!filteredDocs.length ? (
              <div className="py-12">
                <EmptyState
                  icon="🔍"
                  title="Không tìm thấy bài viết nào"
                  text="Thử đổi từ khoá hoặc chọn lại chuyên mục / phase."
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                  {pagedDocs.map((doc) => (
                    <HubDocCard
                      key={doc.id}
                      doc={doc}
                      isCompleted={isCompleted(doc.id)}
                      onTagClick={(tag) => updateFilters({ q: tag, p: null })}
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
          </div>
        </div>
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
}
