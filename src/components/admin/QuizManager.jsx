import { useState, useMemo } from 'react';
import { CustomDocCombobox } from './CustomDocCombobox';
import { QuizQuestionCard } from '../quiz/QuizQuestionCard';

const DEFAULT_QUIZ_TEMPLATE = {
  title: 'Mẫu bài trắc nghiệm — Ví dụ: Luyện tập Java OOP Cốt lõi',
  docId: 'java/core/chapter-1-utilizing-java-oop-approach-part-1',
  tags: ['Java', 'OOP', 'Cơ bản'],
  quizzes: [
    {
      number: 1,
      question:
        'Đây là mẫu câu hỏi CHỌN 1 ĐÁP ÁN (Single Choice).\nXét đoạn mã Java sau:\n```java\nint a = 5;\nint b = a++;\nSystem.out.println("b = " + b);\n```\nKết quả in ra màn hình là gì?',
      isMulti: false,
      options: [
        { key: 'A', text: 'b = 4' },
        { key: 'B', text: 'b = 5' },
        { key: 'C', text: 'b = 6' },
        { key: 'D', text: 'Lỗi biên dịch (Compilation error)' },
      ],
      correctAnswers: ['B'],
      explanation:
        'Toán tử hậu tố `a++` (postfix increment) trả về giá trị ban đầu của `a` (tức là 5) trước khi tăng `a` lên 6. Do đó biến `b` được gán giá trị 5. Sau lệnh này `a` có giá trị là 6.',
    },
    {
      number: 2,
      question:
        'Đây là mẫu câu hỏi CHỌN NHIỀU ĐÁP ÁN (Multiple Choice).\nNhững từ khoá nào sau đây là từ khoá hợp lệ (reserved keywords) trong ngôn ngữ Java? (Chọn tất cả các đáp án đúng)',
      isMulti: true,
      options: [
        { key: 'A', text: '`volatile`' },
        { key: 'B', text: '`transient`' },
        { key: 'C', text: '`include`' },
        { key: 'D', text: '`implements`' },
        { key: 'E', text: '`unsigned`' },
      ],
      correctAnswers: ['A', 'B', 'D'],
      explanation:
        '• A, B, D đúng: `volatile`, `transient` và `implements` đều là từ khóa dành riêng trong Java.\n• C sai: `include` là lệnh tiền xử lý trong C/C++, Java dùng từ khóa `import`.\n• E sai: Java không có từ khóa `unsigned` cho kiểu nguyên thủy.',
    },
  ],
};

export function QuizManager({ docs, sections, onSubmitQuiz, isGuestMode, loading }) {
  const [title, setTitle] = useState(DEFAULT_QUIZ_TEMPLATE.title);
  const [selectedDocId, setSelectedDocId] = useState(DEFAULT_QUIZ_TEMPLATE.docId);
  const [tags, setTags] = useState(DEFAULT_QUIZ_TEMPLATE.tags);
  const [tagInput, setTagInput] = useState('');
  const [jsonText, setJsonText] = useState(() => JSON.stringify(DEFAULT_QUIZ_TEMPLATE, null, 2));
  const [tab, setTab] = useState('json'); // 'json' | 'preview'
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Live parsed quiz data & stats
  const parsedData = useMemo(() => {
    try {
      const data = JSON.parse(jsonText);
      return data;
    } catch {
      return null;
    }
  }, [jsonText]);

  const stats = useMemo(() => {
    if (!parsedData || !Array.isArray(parsedData.quizzes)) {
      return { total: 0, single: 0, multi: 0, explained: 0 };
    }
    const qList = parsedData.quizzes;
    return {
      total: qList.length,
      single: qList.filter((q) => !q.isMulti).length,
      multi: qList.filter((q) => q.isMulti).length,
      explained: qList.filter((q) => Boolean(q.explanation?.trim())).length,
    };
  }, [parsedData]);

  const handleSelectDoc = (docId, doc) => {
    setSelectedDocId(docId);
    if (parsedData) {
      const updated = { ...parsedData, docId };
      setJsonText(JSON.stringify(updated, null, 2));
    }
  };

  const handleAddTag = (t) => {
    const clean = t.trim().replace(/^#+/, '');
    if (!clean) return;
    if (!tags.some((tag) => tag.toLowerCase() === clean.toLowerCase())) {
      const nextTags = [...tags, clean];
      setTags(nextTags);
      if (parsedData) {
        setJsonText(JSON.stringify({ ...parsedData, tags: nextTags }, null, 2));
      }
    }
  };

  const handleRemoveTag = (t) => {
    const nextTags = tags.filter((tag) => tag.toLowerCase() !== t.toLowerCase());
    setTags(nextTags);
    if (parsedData) {
      setJsonText(JSON.stringify({ ...parsedData, tags: nextTags }, null, 2));
    }
  };

  const handleLoadSample = () => {
    setTitle(DEFAULT_QUIZ_TEMPLATE.title);
    setSelectedDocId(DEFAULT_QUIZ_TEMPLATE.docId);
    setTags(DEFAULT_QUIZ_TEMPLATE.tags);
    setJsonText(JSON.stringify(DEFAULT_QUIZ_TEMPLATE, null, 2));
    setError('');
  };

  const handleFormatJson = () => {
    try {
      const obj = JSON.parse(jsonText);
      setJsonText(JSON.stringify(obj, null, 2));
      setError('');
    } catch (err) {
      setError(`Lỗi cú pháp JSON: ${err.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedDocId) {
      setError('Vui lòng chọn bài viết lý thuyết để liên kết.');
      return;
    }

    let quizPayload;
    try {
      quizPayload = JSON.parse(jsonText);
    } catch (err) {
      setError(`Mã JSON không hợp lệ: ${err.message}`);
      return;
    }

    if (!quizPayload.quizzes || !quizPayload.quizzes.length) {
      setError('Bộ quiz phải có ít nhất 1 câu hỏi.');
      return;
    }

    quizPayload.title = title || quizPayload.title;
    quizPayload.docId = selectedDocId;
    quizPayload.tags = tags;

    if (isGuestMode) {
      try {
        sessionStorage.setItem('blog.quiz.preview', JSON.stringify(quizPayload));
        window.open('/quiz?preview=1', '_blank');
        setSuccess('Đang ở chế độ khách: Đã lưu bản thi thử vào phiên và mở trang thi!');
      } catch (err) {
        setError(`Lỗi lưu bản thi thử: ${err.message}`);
      }
      return;
    }

    try {
      await onSubmitQuiz({
        docId: selectedDocId,
        title,
        tags,
        quizPayload,
      });
      setSuccess('Đã đăng bài quiz thành công (tạo PR trên GitHub)!');
    } catch (err) {
      setError(err.message || 'Lỗi khi gửi bài quiz lên GitHub.');
    }
  };

  return (
    <main className="admin-quiz-view w-full max-w-5xl mx-auto py-6 px-4">
      <div className="admin-quiz-header mb-6 pb-4 border-b border-slate-200 dark:border-slate-700/60">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white m-0">
          🎯 Quản Lý &amp; Soạn Bài Quiz
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="admin-form space-y-6">
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-700 dark:text-rose-300">
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            {success}
          </div>
        )}

        <section className="admin-card p-6 rounded-3xl bg-white dark:bg-slate-800/95 border border-slate-200 dark:border-slate-700/80 shadow-sm">
          <h2 className="text-lg font-black text-slate-900 dark:text-white m-0 mb-4 flex items-center gap-2">
            <span>📝</span>
            <span>Nội Dung Câu Hỏi Trắc Nghiệm</span>
          </h2>

          {/* 1. Quiz Title */}
          <label className="admin-field block mb-4">
            <span className="admin-label block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Tiêu đề bài trắc nghiệm <b className="text-rose-500">*</b>
            </span>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Chapter 1: OOP Approach - Part 1 (24 Practice Questions)"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white outline-hidden focus:border-indigo-500"
            />
          </label>

          {/* 2. Choose Linked Doc (Below Title as per request #4) */}
          <div className="admin-field mb-4">
            <label className="admin-label block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Chọn bài viết lý thuyết <b className="text-rose-500">*</b>
            </label>
            <CustomDocCombobox
              docs={docs}
              sections={sections}
              selectedDocId={selectedDocId}
              onSelectDoc={handleSelectDoc}
            />
          </div>

          {/* 3. Tags */}
          <div className="admin-field mb-4">
            <span className="admin-label block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Thẻ phân loại bài quiz (Tags)
            </span>
            <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 min-h-[42px]">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-medium"
                >
                  #{t}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="hover:text-rose-500 cursor-pointer ml-0.5"
                  >
                    ✕
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    handleAddTag(tagInput);
                    setTagInput('');
                  }
                }}
                placeholder="Nhập tag rồi ấn Enter..."
                className="flex-1 min-w-[120px] bg-transparent border-0 outline-hidden text-xs text-slate-900 dark:text-white p-1"
              />
            </div>
          </div>

          {/* 4. Live Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 text-center">
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/40">
              <div className="text-base font-black text-indigo-600 dark:text-indigo-400">{stats.total}</div>
              <div className="text-[0.7rem] font-bold text-slate-500 dark:text-slate-400 uppercase">Tổng câu hỏi</div>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/40">
              <div className="text-base font-black text-blue-600 dark:text-blue-400">{stats.single}</div>
              <div className="text-[0.7rem] font-bold text-slate-500 dark:text-slate-400 uppercase">Chọn 1 đáp án</div>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-800/40">
              <div className="text-base font-black text-purple-600 dark:text-purple-400">{stats.multi}</div>
              <div className="text-[0.7rem] font-bold text-slate-500 dark:text-slate-400 uppercase">Chọn nhiều đáp án</div>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/40">
              <div className="text-base font-black text-emerald-600 dark:text-emerald-400">{stats.explained}</div>
              <div className="text-[0.7rem] font-bold text-slate-500 dark:text-slate-400 uppercase">Có giải thích</div>
            </div>
          </div>

          {/* 5. Buttons Above Question Editor (as per request #2) */}
          <div className="admin-tabs-bar flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2 mb-3 flex-wrap gap-2">
            <div className="admin-tabs flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTab('json')}
                className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${
                  tab === 'json'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                Mã JSON
              </button>
              <button
                type="button"
                onClick={() => setTab('preview')}
                className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${
                  tab === 'preview'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                Xem trước câu hỏi
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleLoadSample}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 text-xs font-bold text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
                title="Điền dữ liệu mẫu chuẩn"
              >
                ✨ Nạp template mẫu vào ô soạn
              </button>
              <button
                type="button"
                onClick={handleFormatJson}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 text-xs font-bold text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
                title="Format làm đẹp mã JSON"
              >
                🪄 Format JSON
              </button>
            </div>
          </div>

          {/* 6. Editor Panes */}
          {tab === 'json' ? (
            <textarea
              rows={18}
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder="Dán hoặc gõ nội dung JSON câu hỏi tại đây..."
              className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-mono text-xs leading-relaxed text-slate-900 dark:text-white outline-hidden focus:border-indigo-500"
              spellCheck="false"
            />
          ) : (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 max-h-[550px] overflow-y-auto">
              {parsedData?.quizzes?.map((q) => (
                <QuizQuestionCard
                  key={q.number}
                  docId={selectedDocId}
                  question={q}
                  checked={false}
                  pickedAnswers={[]}
                  onToggleOption={() => {}}
                  onCheckSingle={() => {}}
                />
              ))}
            </div>
          )}
        </section>

        {/* 7. Action Button: "Đăng bài quiz" (as per request #4) */}
        <div className="admin-actions flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
          >
            <span>🚀</span>
            <span>Đăng bài quiz</span>
          </button>
        </div>
      </form>
    </main>
  );
}
