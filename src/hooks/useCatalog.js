import { useMemo } from 'react';
import catalogData from '../generated/catalog.json';

export function useCatalog() {
  const sections = useMemo(() => catalogData.sections || [], []);
  const docs = useMemo(() => catalogData.docs || [], []);

  const getSection = (sectionId) => {
    return sections.find((s) => s.id === sectionId) || null;
  };

  const getDocById = (id) => {
    return docs.find((d) => d.id === id) || null;
  };

  const getDocByRoute = (sectionSlug, docSlug) => {
    if (!docSlug) return null;
    return docs.find((d) => 
      (d.slug === docSlug || d.id === docSlug || d.contentFile?.endsWith(docSlug)) &&
      (!sectionSlug || d.section === sectionSlug)
    ) || null;
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
