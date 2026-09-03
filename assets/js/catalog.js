"use strict";
// Truy vấn trên SECTIONS / DOCUMENTS do generated/catalog.js cung cấp.
// Không chỗ nào ở đây biết "java" hay "python" là gì — tất cả đến từ dữ liệu.

const hasCatalog = typeof SECTIONS !== "undefined" && typeof DOCUMENTS !== "undefined";
const ALL_SECTIONS = hasCatalog ? SECTIONS : [];
const ALL_DOCUMENTS = hasCatalog ? DOCUMENTS : [];

const getSection = (id) => ALL_SECTIONS.find((s) => s.id === id) || null;
const docsOfSection = (id) => ALL_DOCUMENTS.filter((d) => d.section === id);
const getDoc = (id) => ALL_DOCUMENTS.find((d) => d.id === id) || null;
const featuredDocs = (limit = 6) => {
  const explicit = ALL_DOCUMENTS.filter((d) => d.featured);
  if (explicit.length >= limit) return explicit.slice(0, limit);
  const rest = ALL_DOCUMENTS.filter((d) => !d.featured);
  return [...explicit, ...rest].slice(0, limit);
};

/**
 * Lọc bài theo mảng, chuyên mục và từ khoá. Thứ tự luôn là thứ tự trong
 * catalog (chuyên mục theo _section.json, bài theo `order`).
 * @param {{section?: string, category?: string, query?: string}} f
 */
function filterDocs(f) {
  const query = (f.query || "").trim().toLowerCase();
  return ALL_DOCUMENTS.filter((doc) => {
    if (f.section && doc.section !== f.section) return false;
    if (f.category && f.category !== "all" && doc.category !== f.category) return false;
    if (f.phase && f.phase !== "all" && doc.phase !== f.phase) return false;
    if (query) {
      // phase và tags không hiện trên giao diện nhưng vẫn giúp tìm thấy bài.
      const haystack = [doc.title, doc.description, doc.slug, doc.phase, ...doc.tags]
        .join(" ").toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
}

function readParams() {
  const params = new URLSearchParams(window.location.search);
  const sectionId = params.get("s") || "";
  const section = getSection(sectionId);
  const docPath = params.get("d") || "";
  const doc = docPath ? getDoc(`${sectionId}/${docPath}`) : null;
  const pageNum = parseInt(params.get("p") || params.get("page") || "1", 10);
  const page = isNaN(pageNum) || pageNum < 1 ? 1 : pageNum;
  return {
    section,
    doc,
    query: params.get("q") || "",
    category: params.get("c") || "",
    phase: params.get("phase") || "all",
    page
  };
}

const hubUrl = (sectionId, extra = {}) => {
  const params = new URLSearchParams({ s: sectionId, ...extra });
  return `hub.html?${params}`;
};

const readerUrl = (doc) =>
  `reader.html?s=${encodeURIComponent(doc.section)}&d=${encodeURIComponent(`${doc.category}/${doc.slug}`)}`;
