import { useState, useEffect, useRef } from 'react';
import { renderMarkdown } from '../../services/markdown';

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

export function PostEditor({ sections, editingPost, onSavePost, onCancel, loading }) {
  const [section, setSection] = useState(editingPost?.section || sections[0]?.id || 'java');
  const [category, setCategory] = useState(editingPost?.category || '');
  const [slug, setSlug] = useState(editingPost?.slug || '');
  const [body, setBody] = useState(editingPost?.body || '');
  const [title, setTitle] = useState(editingPost?.title || '');
  const [description, setDescription] = useState(editingPost?.description || '');
  const [tags, setTags] = useState(editingPost?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [featured, setFeatured] = useState(Boolean(editingPost?.featured));
  const [tab, setTab] = useState('write'); // 'write' | 'preview'
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Đồng bộ form khi editingPost thay đổi (khi người dùng bấm Sửa bài từ danh sách)
  useEffect(() => {
    if (editingPost) {
      setSection(editingPost.section || sections[0]?.id || 'java');
      setCategory(editingPost.category || '');
      setSlug(editingPost.slug || '');
      setBody(editingPost.body || '');
      setTitle(editingPost.title || '');
      setDescription(editingPost.description || '');
      setTags(Array.isArray(editingPost.tags) ? editingPost.tags : []);
      setFeatured(Boolean(editingPost.featured));
      setError('');
      setSuccess('');
    } else {
      setSection(sections[0]?.id || 'java');
      setCategory('');
      setSlug('');
      setBody('');
      setTitle('');
      setDescription('');
      setTags([]);
      setFeatured(false);
      setError('');
      setSuccess('');
    }
  }, [editingPost, sections]);

  const currentSection = sections.find((s) => s.id === section);
  const categories = currentSection?.categories || [];

  useEffect(() => {
    if (!category && categories.length > 0) {
      setCategory(categories[0].id);
    }
  }, [section, categories, category]);

  const handleTitleChange = (val) => {
    setTitle(val);
    if (!editingPost) {
      setSlug(toSlug(val));
    }
  };

  const handleAddTag = (t) => {
    const clean = t.trim().replace(/^#+/, '');
    if (!clean) return;
    if (!tags.some((tag) => tag.toLowerCase() === clean.toLowerCase())) {
      setTags([...tags, clean]);
    }
  };

  const handleRemoveTag = (t) => {
    setTags(tags.filter((tag) => tag.toLowerCase() !== t.toLowerCase()));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        setBody(content);
        // Extract title from first # heading if empty
        const titleMatch = content.match(/^#\s+(.+)$/m);
        if (titleMatch && !title) {
          handleTitleChange(titleMatch[1]);
        }
      }
    };
    reader.readAsText(file);
  };

  const handlePreview = () => {
    const previewData = {
      doc: {
        id: `${section}/${category}/${slug || 'preview'}`,
        section,
        category,
        slug: slug || 'preview',
        title: title || 'Bản xem thử',
        description,
        tags,
        featured,
        readingMinutes: Math.max(1, Math.round(body.trim().split(/\s+/).length / 200)),
      },
      section: currentSection,
      body,
    };
    try {
      localStorage.setItem('blog.readerPreview', JSON.stringify(previewData));
      window.open('/reader?preview=1', '_blank');
    } catch {
      alert('Không thể lưu dữ liệu xem thử');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!slug) {
      setError('Vui lòng nhập tên file (slug).');
      return;
    }
    if (!body.trim()) {
      setError('Nội dung bài viết không được để trống.');
      return;
    }

    try {
      await onSavePost({
        section,
        category,
        slug,
        title: title || slug,
        description,
        tags,
        featured,
        body,
        isEdit: Boolean(editingPost),
      });
      setSuccess('Đã tạo Pull Request thành công trên GitHub!');
    } catch (err) {
      setError(err.message || 'Lỗi khi lưu bài viết.');
    }
  };

  return (
    <main className="admin-editor-view w-full max-w-5xl mx-auto py-6 px-4">
      <form onSubmit={handleSubmit} className="admin-form space-y-6">
        {/* Editing Banner */}
        {editingPost && (
          <div className="p-4 rounded-2xl bg-indigo-50/90 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="text-xl">✏️</span>
              <div>
                <div className="text-xs font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-2">
                  <span>Chỉnh sửa bài viết:</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">{title || editingPost.slug}</span>
                </div>
                <div className="text-[0.7rem] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                  Đường dẫn: {editingPost.path}
                </div>
              </div>
            </div>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-3 py-1 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer"
              >
                ← Huỷ chỉnh sửa
              </button>
            )}
          </div>
        )}

        {/* Destination Card */}
        <section className="admin-card p-6 rounded-3xl bg-white dark:bg-slate-800/95 border border-slate-200 dark:border-slate-700/80 shadow-sm">
          <h2 className="text-lg font-black text-slate-900 dark:text-white m-0 mb-4">
            {editingPost ? 'Thông tin phân loại & đường dẫn' : 'Nơi lưu bài'}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <label className="admin-field block">
              <span className="admin-label block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Mảng nội dung <b className="text-rose-500">*</b>
              </span>
              <select
                value={section}
                onChange={(e) => {
                  setSection(e.target.value);
                  const newSec = sections.find((s) => s.id === e.target.value);
                  if (newSec?.categories?.length) setCategory(newSec.categories[0].id);
                }}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-medium text-slate-900 dark:text-white"
              >
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="admin-field block">
              <span className="admin-label block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Chuyên mục <b className="text-rose-500">*</b>
              </span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-medium text-slate-900 dark:text-white"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="admin-field block">
            <span className="admin-label block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Tên file (Slug) <b className="text-rose-500">*</b>
            </span>
            <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 overflow-hidden text-xs">
              <span className="px-3 text-slate-400 font-mono">content/{section}/{category}/</span>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(toSlug(e.target.value))}
                placeholder="bai-viet-dau-tien"
                className="flex-1 py-2.5 bg-transparent border-0 outline-hidden font-mono text-slate-900 dark:text-white"
              />
              <span className="px-3 text-slate-400 font-mono">.md</span>
            </div>
            <span className="text-[0.7rem] text-slate-500 dark:text-slate-400 mt-1 block">
              Tự sinh từ tiêu đề, sửa lại được. Đây cũng là địa chỉ bài trên web.
            </span>
          </label>
        </section>

        {/* Content Card */}
        <section className="admin-card p-6 rounded-3xl bg-white dark:bg-slate-800/95 border border-slate-200 dark:border-slate-700/80 shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
            <h2 className="text-lg font-black text-slate-900 dark:text-white m-0">Nội dung</h2>
            <div className="flex items-center gap-2">
              <label className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 text-xs font-bold text-slate-700 dark:text-slate-300 transition-all cursor-pointer">
                📄 Chọn file .md
                <input type="file" accept=".md,.markdown,text/markdown" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          </div>

          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 mb-3">
            <button
              type="button"
              onClick={() => setTab('write')}
              className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${
                tab === 'write'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Soạn
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
              Xem trước
            </button>
          </div>

          {tab === 'write' ? (
            <textarea
              rows={18}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="# Tiêu đề bài viết&#10;&#10;Nội dung markdown..."
              className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-mono text-xs leading-relaxed text-slate-900 dark:text-white outline-hidden focus:border-indigo-500"
              spellCheck="false"
            />
          ) : (
            <div
              className="p-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 max-h-[500px] overflow-y-auto prose prose-slate dark:prose-invert max-w-none text-xs"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(body) }}
            />
          )}
        </section>

        {/* Post Metadata Card */}
        <section className="admin-card p-6 rounded-3xl bg-white dark:bg-slate-800/95 border border-slate-200 dark:border-slate-700/80 shadow-sm">
          <h2 className="text-lg font-black text-slate-900 dark:text-white m-0 mb-4">Thông tin bài viết</h2>

          <div className="space-y-4">
            <label className="admin-field block">
              <span className="admin-label block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Tiêu đề bài viết
              </span>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="VD: Chapter 1: OOP Approach - Part 1"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-hidden focus:border-indigo-500"
              />
            </label>

            <label className="admin-field block">
              <span className="admin-label block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Mô tả tóm tắt</span>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tóm tắt ngắn gọn nội dung bài học..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-hidden focus:border-indigo-500"
              />
            </label>

            {/* Tags Input */}
            <div>
              <span className="admin-label block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Thẻ phân loại (Tags)
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

            {/* Featured Checkbox */}
            <div className="pt-2">
              <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="rounded text-indigo-600"
                />
                <span>⭐ Đánh dấu là bài viết nổi bật (Featured)</span>
              </label>
              <span className="block text-[0.7rem] text-slate-500 dark:text-slate-400 ml-5 mt-0.5">
                Xuất hiện trên thanh Carousel bài viết nổi bật tại trang chủ.
              </span>
            </div>
          </div>
        </section>

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

        {/* Actions Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Huỷ, quay lại danh sách
            </button>
          )}

          <button
            type="button"
            onClick={handlePreview}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 text-xs font-bold text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
          >
            👁 Xem thử
          </button>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Đang gửi...' : editingPost ? '💾 Cập nhật bài viết (Mở PR)' : '🚀 Đăng bài viết (Mở PR)'}
          </button>
        </div>
      </form>
    </main>
  );
}
