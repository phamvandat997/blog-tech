import React from 'react';
import { Link } from 'react-router-dom';
import { useCatalog } from '../../hooks/useCatalog';

const KIND_GROUPS = [
  { kind: 'language', title: 'Ngôn ngữ' },
  { kind: 'topic', title: 'Chủ đề' },
];

export function SectionGrid() {
  const { sections, docs } = useCatalog();

  if (!sections.length) {
    return (
      <div id="sections-root" className="w-full lg:w-[60%] lg:max-w-[60%] mx-auto py-10 text-center">
        <div className="p-8 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xs">
          <span className="text-4xl mb-3 block">📚</span>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">Chưa có chủ đề nào</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Hệ thống đang sẵn sàng. Bạn có thể bắt đầu tạo chủ đề và bài viết mới từ trang quản trị hoặc thư mục <code>content/</code>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div id="sections-root" className="w-full lg:w-[60%] lg:max-w-[60%] mx-auto space-y-10">
      {KIND_GROUPS.map((group) => {
        const groupSections = sections.filter((s) => s.kind === group.kind);
        if (!groupSections.length) return null;

        return (
          <section key={group.kind} className="section-group mb-10">
            <h2 className="section-group-head text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-400 mb-4 flex items-center gap-2">
              <span>{group.title}</span>
              <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
            </h2>

            <div className="section-cards grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {groupSections.map((section) => {
                const secDocs = docs.filter((d) => d.section === section.id);
                const metaText = secDocs.length ? `${secDocs.length} bài viết` : 'Sắp có nội dung';

                return (
                  <Link
                    key={section.id}
                    to={`/hub?s=${encodeURIComponent(section.id)}`}
                    className={`section-card ${secDocs.length ? '' : 'is-empty'} group relative flex flex-col justify-between p-6 rounded-2xl backdrop-blur-md bg-white/90 dark:bg-slate-800/85 border border-slate-200/90 dark:border-slate-700/70 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all no-underline`}
                    style={{ '--section-color': section.color || '#6366f1' }}
                  >
                    <div>
                      <div className="section-card-header flex items-start justify-between gap-3 mb-2">
                        <h3 className="section-card-name text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors m-0">
                          {section.name}
                        </h3>
                      </div>
                      <p className="section-card-tagline text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mb-4 leading-relaxed">
                        {section.tagline}
                      </p>
                    </div>

                    <div className="section-card-meta flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700/60 text-xs font-semibold text-slate-500 dark:text-slate-400">
                      <span>{metaText}</span>
                      <span className="text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform">
                        Khám phá ➔
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
