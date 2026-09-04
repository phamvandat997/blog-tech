import { useMemo } from 'react';
import catalogData from '../generated/catalog.json';

export function useCatalog() {
  const sections = useMemo(() => catalogData.sections || [], []);
  // build/build.js ghi danh sách bài dưới khoá "documents"; giữ thêm "docs"
  // để không vỡ nếu tệp catalog cũ còn nằm đâu đó.
  const docs = useMemo(() => catalogData.documents || catalogData.docs || [], []);

  const getSection = (sectionId) => {
    return sections.find((s) => s.id === sectionId) || null;
  };

  const getDocById = (id) => {
    return docs.find((d) => d.id === id) || null;
  };

  const getDocByRoute = (sectionSlug, docSlug) => {
    if (!docSlug) return null;
    // Link trong app có dạng ?s=<mảng>&d=<chuyên mục>/<slug>, nên phải so cả
    // cặp "category/slug" và id đầy đủ, không chỉ mỗi slug.
    const wanted = String(docSlug).replace(/^\/+|\/+$/g, '');
    return docs.find((d) => {
      if (sectionSlug && d.section !== sectionSlug) return false;
      return (
        d.id === wanted ||
        d.slug === wanted ||
        `${d.category}/${d.slug}` === wanted ||
        `${d.section}/${d.category}/${d.slug}` === wanted ||
        d.contentFile === wanted
      );
    }) || null;
  };

  const getDocsBySection = (sectionId) => {
    return docs.filter((d) => d.section === sectionId);
  };

  const getAdjacentDocs = (currentDocId) => {
    const doc = getDocById(currentDocId);
    if (!doc) return { prev: null, next: null };

    const sectionDocs = docs
      .filter((d) => d.section === doc.section)
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    const index = sectionDocs.findIndex((d) => d.id === currentDocId);
    return {
      prev: index > 0 ? sectionDocs[index - 1] : null,
      next: index >= 0 && index < sectionDocs.length - 1 ? sectionDocs[index + 1] : null,
    };
  };

  const searchDocs = (keyword) => {
    if (!keyword || !keyword.trim()) return [];
    const q = keyword.trim().toLowerCase();
    return docs.filter((d) => {
      const matchTitle = d.title?.toLowerCase().includes(q);
      const matchDesc = d.description?.toLowerCase().includes(q);
      const matchTags = Array.isArray(d.tags) && d.tags.some((t) => t.toLowerCase().includes(q));
      const matchSlug = d.slug?.toLowerCase().includes(q);
      return matchTitle || matchDesc || matchTags || matchSlug;
    });
  };

  return {
    sections,
    docs,
    getSection,
    getDocById,
    getDocByRoute,
    getDocsBySection,
    getAdjacentDocs,
    searchDocs,
  };
}
