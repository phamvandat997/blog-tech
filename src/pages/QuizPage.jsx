import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useCatalog } from '../hooks/useCatalog';
import { useQuiz } from '../hooks/useQuiz';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { BackToTop } from '../components/layout/BackToTop';
import { QuizCard } from '../components/quiz/QuizCard';
import { QuizPlayer } from '../components/quiz/QuizPlayer';
import { QuizTagCarousel } from '../components/quiz/QuizTagCarousel';
import { SocialShare } from '../components/common/SocialShare';
import { EmptyState } from '../components/common/EmptyState';

export function QuizPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { docs, sections } = useCatalog();
  const { quizBank, getScore } = useQuiz();

  const docIdParam = searchParams.get('id');
  const isPreview = searchParams.get('preview') === '1';

  const [currentSection, setCurrentSection] = useState('all');
  const [currentTag, setCurrentTag] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    document.title = 'Luyện tập trắc nghiệm & Ngân hàng câu hỏi | TechMentor Pro';
  }, []);

  const docsWithQuiz = useMemo(() => {
    return docs.filter((d) => (d.questions || 0) > 0);
  }, [docs]);

  // Section tabs
  const sectionTabs = useMemo(() => {
    return [
      { id: 'all', name: 'Tất cả' },
      ...sections.filter((s) => docsWithQuiz.some((d) => d.section === s.id)),
    ];
  }, [sections, docsWithQuiz]);

  // Tags list
  const allTags = useMemo(() => {
    const tagCounts = new Map();
    docsWithQuiz.forEach((d) => {
      (d.quizTags || []).forEach((t) => {
        const clean = String(t).trim();
        if (!clean) return;
        const lower = clean.toLowerCase();
        const cur = tagCounts.get(lower) || { name: clean, count: 0 };
        cur.count++;
        tagCounts.set(lower, cur);
      });
    });
    return Array.from(tagCounts.values()).sort(
      (a, b) => b.count - a.count || a.name.localeCompare(b.name)
    );
  }, [docsWithQuiz]);

  // Filtered docs
  const filteredDocs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return docsWithQuiz.filter((d) => {
      const matchSec = currentSection === 'all' || d.section === currentSection;
      const matchTag =
        !currentTag || (d.quizTags || []).some((t) => t.toLowerCase() === currentTag);
      const matchQ =
        !query ||
        d.title.toLowerCase().includes(query) ||
        (d.description || '').toLowerCase().includes(query) ||
        (d.phase || '').toLowerCase().includes(query) ||
        (d.quizTags || []).some((t) => t.toLowerCase().includes(query)) ||
        (d.tags || []).some((t) => t.toLowerCase().includes(query));
      return matchSec && matchTag && matchQ;
    });
  }, [docsWithQuiz, currentSection, currentTag, searchQuery]);

  // If in Player mode
  if (isPreview || docIdParam) {
    let activeDoc = null;
    let activeBank = null;

    if (isPreview) {
      try {
        const raw = sessionStorage.getItem('blog.quiz.preview');
        if (raw) {
          const parsed = JSON.parse(raw);
          activeDoc = docs.find((d) => d.id === parsed.docId) || {
            id: parsed.docId || 'preview/quiz',
            title: parsed.title || 'Bài thi trắc nghiệm xem thử',
            section: 'preview',
            category: 'quiz',
            slug: 'preview',
            questions: parsed.quizzes?.length || 0,
            readingMinutes: Math.max(1, Math.round((parsed.quizzes?.length || 5) * 1.5)),
          };
          activeBank = {
            docId: activeDoc.id,
            title: parsed.title || activeDoc.title,
            quizzes: parsed.quizzes || [],
          };
        }
      } catch {
        // ignore
      }
    } else {
      activeDoc = docs.find((d) => d.id === docIdParam);
      activeBank = quizBank[docIdParam];
    }

    if (!activeDoc || !activeBank) {
      return (
        <div className="app-container min-h-screen flex flex-col">
          <Navbar />
          <main className="w-full max-w-4xl mx-auto py-12 px-4 flex-1">
            <EmptyState
              icon="⚠️"
              title="Không tìm thấy bài tập trắc nghiệm"
              text="Bài viết không tồn tại hoặc chưa có bộ câu hỏi đi kèm."
              action={
                <button
                  type="button"
                  onClick={() => setSearchParams({})}
                  className="btn-primary no-underline mt-4 inline-block cursor-pointer"
                >
                  ← Về danh sách Quiz
                </button>
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
        <main className="w-full max-w-4xl mx-auto py-8 px-4 sm:px-6 flex-1">
          <QuizPlayer
            doc={activeDoc}
            bank={activeBank}
            isPreview={isPreview}
            onBack={() => {
              if (isPreview) {
                navigate('/admin?view=quiz');
              } else {
                setSearchParams({});
              }
            }}
          />
        </main>
        <Footer />
        <BackToTop />
      </div>
    );
  }

  // Quiz List View
  return (
    <div className="app-container min-h-screen flex flex-col transition-colors duration-200">
      <Navbar />

      <main className="quiz-list-wrapper w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {/* Quiz List Hero */}
        <div className="quiz-list-hero text-center py-6 sm:py-8 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50 mb-3">
            🎯 HỆ THỐNG LUYỆN TẬP TRẮC NGHIỆM
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
            Ngân Hàng Câu Hỏi &amp; Đề Thi Thử
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed mb-4">
            Chọn một bài học bên dưới để bắt đầu làm bài trắc nghiệm. Sau khi nộp bài, hệ thống sẽ tự động chấm điểm và cung cấp phần giải thích chi tiết cho từng câu hỏi.
          </p>
          <div className="flex justify-center">
            <SocialShare
              title="Ngân Hàng Câu Hỏi & Luyện Tập Trắc Nghiệm | TechMentor Pro"
              description="Hệ thống câu hỏi trắc nghiệm kỹ thuật chuyên sâu, giải thích chi tiết và chấm điểm tự động."
              variant="compact"
            />
          </div>
        </div>

        {/* Toolbar: Section Tabs + Tag Carousel */}
        <div className="quiz-search-toolbar bg-white dark:bg-slate-800/90 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm mb-8 flex flex-col gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {sectionTabs.map((sec) => (
              <button
                key={sec.id}
                type="button"
                onClick={() => setCurrentSection(sec.id)}
                className={`quiz-section-tab px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  sec.id === currentSection
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {sec.name}
              </button>
            ))}
          </div>

          <QuizTagCarousel
            tags={allTags}
            selectedTag={currentTag}
            onSelectTag={(t) => setCurrentTag(t)}
          />
        </div>

        {/* Cards Grid */}
        {!filteredDocs.length ? (
          <div className="py-12">
            <EmptyState
              icon="🔍"
              title="Không tìm thấy bài quiz phù hợp"
              text="Thử đổi từ khoá, bỏ bớt tag hoặc chọn mảng công nghệ khác."
              action={
                <button
                  type="button"
                  onClick={() => {
                    setCurrentSection('all');
                    setCurrentTag('');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors cursor-pointer border-0"
                >
                  ✕ Xoá bộ lọc &amp; Đặt lại
                </button>
              }
            />
          </div>
        ) : (
          <div id="quiz-list-items" className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {filteredDocs.map((doc) => {
              const sec = sections.find((s) => s.id === doc.section);
              const score = getScore(doc.id);
              return (
                <QuizCard
                  key={doc.id}
                  doc={doc}
                  section={sec}
                  score={score}
                  onSelect={(id) => setSearchParams({ id })}
                  onTagClick={(t) => setCurrentTag(t)}
                />
              );
            })}
          </div>
        )}
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
}
