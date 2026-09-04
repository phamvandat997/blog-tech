import { useState, useRef, useEffect } from 'react';

export function CustomDocCombobox({ docs, sections, selectedDocId, onSelectDoc }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const selectedDoc = docs.find((d) => d.id === selectedDocId);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpen = () => {
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleSelect = (doc) => {
    onSelectDoc(doc.id, doc);
    setIsOpen(false);
    setSearchTerm('');
  };

  const query = searchTerm.trim().toLowerCase();

  return (
    <div className="quiz-custom-select relative w-full" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleOpen}
        className="quiz-custom-select-trigger w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-left text-xs sm:text-sm hover:border-indigo-400 dark:hover:border-indigo-500 transition-all cursor-pointer"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="quiz-custom-select-val flex items-center gap-2 flex-1 min-w-0">
          {!selectedDoc ? (
            <>
              <span className="text-base text-slate-400">📖</span>
              <span className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium truncate">
                -- Chọn bài viết lý thuyết để liên kết --
              </span>
            </>
          ) : (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-base">📖</span>
              <span className="px-1.5 py-0.5 rounded text-[0.68rem] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80 shrink-0">
                {selectedDoc.section} / {selectedDoc.category}
              </span>
              <span className="font-bold text-slate-900 dark:text-slate-100 truncate text-xs sm:text-sm">
                {selectedDoc.title}
              </span>
              {(selectedDoc.questions || 0) > 0 ? (
                <span className="ml-auto mr-1 quiz-custom-option-badge-done text-[0.68rem] px-2 py-0.5 rounded-full font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 shrink-0">
                  ✓ {selectedDoc.questions} câu
                </span>
              ) : (
                <span className="ml-auto mr-1 quiz-custom-option-badge-none text-[0.68rem] px-2 py-0.5 rounded-full font-semibold bg-slate-100 dark:bg-slate-800 text-slate-400 shrink-0">
                  Chưa có quiz
                </span>
              )}
            </div>
          )}
        </div>

        <span className="quiz-custom-select-arrow ml-2 text-slate-400">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="quiz-custom-select-menu absolute top-full left-0 right-0 mt-1.5 z-50 p-2 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 shadow-xl max-h-80 flex flex-col">
          {/* Search Box */}
          <div className="quiz-custom-select-search-wrap flex items-center gap-2 p-2 border-b border-slate-100 dark:border-slate-800 mb-1">
            <span className="text-slate-400 text-xs">🔍</span>
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên bài, chuyên mục, slug..."
              className="quiz-custom-select-search-input w-full text-xs bg-transparent border-0 outline-hidden text-slate-800 dark:text-slate-200"
              autoComplete="off"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="text-slate-400 hover:text-slate-600 text-xs p-1"
              >
                ✕
              </button>
            )}
          </div>

          {/* List of sections & docs */}
          <div className="quiz-custom-select-list overflow-y-auto space-y-2 flex-1 pr-1">
            {sections.map((sec) => {
              const secDocs = docs.filter((d) => {
                if (d.section !== sec.id) return false;
                if (!query) return true;
                return (
                  d.title.toLowerCase().includes(query) ||
                  d.category.toLowerCase().includes(query) ||
                  d.slug.toLowerCase().includes(query)
                );
              });

              if (!secDocs.length) return null;

              return (
                <div key={sec.id} className="quiz-custom-optgroup">
                  <div className="quiz-custom-optgroup-title text-[0.7rem] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2 py-1">
                    📚 {sec.name} ({secDocs.length} bài)
                  </div>
                  <div className="space-y-1 mt-0.5">
                    {secDocs.map((doc) => {
                      const isSelected = selectedDocId === doc.id;
                      const hasQ = (doc.questions || 0) > 0;

                      return (
                        <div
                          key={doc.id}
                          onClick={() => handleSelect(doc)}
                          className={`quiz-custom-option flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-xs transition-all ${
                            isSelected
                              ? 'is-selected bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800/60'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1 pr-2">
                            <span className="text-xs opacity-75">{isSelected ? '✓' : '•'}</span>
                            <span className="truncate font-medium">{doc.title}</span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[0.68rem] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
                              {doc.category}
                            </span>
                            {hasQ ? (
                              <span className="text-[0.68rem] px-1.5 py-0.5 rounded-full font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                                ✓ {doc.questions} câu
                              </span>
                            ) : (
                              <span className="text-[0.68rem] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
                                Chưa có quiz
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
