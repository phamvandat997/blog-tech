"use strict";
// Truy vấn trên SECTIONS / DOCUMENTS do generated/catalog.js cung cấp.
// Không chỗ nào ở đây biết "java" hay "python" là gì — tất cả đến từ dữ liệu.

const hasCatalog = typeof SECTIONS !== "undefined" && typeof DOCUMENTS !== "undefined";
const ALL_SECTIONS = hasCatalog ? SECTIONS : [];
const ALL_DOCUMENTS = hasCatalog ? DOCUMENTS : [];

const getSection = (id) => ALL_SECTIONS.find((s) => s.id === id) || null;
const docsOfSection = (id) => ALL_DOCUMENTS.filter((d) => d.section === id);
const getDoc = (id) => ALL_DOCUMENTS.find((d) => d.id === id) || null;

/** Tiến độ đọc của một mảng: { total, done, pct }. */
function sectionProgress(sectionId) {
  const docs = docsOfSection(sectionId);
  const done = docs.filter((d) => state.completed.has(d.id)).length;
  return { total: docs.length, done, pct: docs.length ? Math.round((done / docs.length) * 100) : 0 };
}

function sectionStats(sectionId) {
  const docs = docsOfSection(sectionId);
  return {
    docs: docs.length,
    lines: docs.reduce((n, d) => n + d.lines, 0),
    questions: docs.reduce((n, d) => n + d.questions, 0),
    ...sectionProgress(sectionId),
  };
}

const SORTERS = {
  default: () => 0,
  "title-asc": (a, b) => a.title.localeCompare(b.title, "vi"),
  "title-desc": (a, b) => b.title.localeCompare(a.title, "vi"),
  "lines-desc": (a, b) => b.lines - a.lines,
  "lines-asc": (a, b) => a.lines - b.lines,
  "questions-desc": (a, b) => b.questions - a.questions,
  "updated-desc": (a, b) => b.updatedDate.localeCompare(a.updatedDate),
};

/**
 * @param {object} f - { section, category, phase, query, favorite, completed,
 *                       uncompleted, sortBy }
 */
function filterDocs(f) {
  const query = (f.query || "").trim().toLowerCase();
  const result = ALL_DOCUMENTS.filter((doc) => {
    if (f.section && doc.section !== f.section) return false;
    if (f.category && f.category !== "all" && doc.category !== f.category) return false;
    if (f.phase && f.phase !== "all" && doc.phase !== f.phase) return false;
    if (f.favorite && !state.favorites.has(doc.id)) return false;
    if (f.completed && !state.completed.has(doc.id)) return false;
    if (f.uncompleted && state.completed.has(doc.id)) return false;
    if (query) {
      const haystack = [doc.title, doc.description, doc.slug, doc.phase, ...doc.tags]
        .join(" ").toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
  return result.sort(SORTERS[f.sortBy] || SORTERS.default);
}

/** Các phase thực sự có bài trong mảng, theo thứ tự _section.json khai báo. */
function phasesInUse(sectionId) {
  const section = getSection(sectionId);
  const used = new Set(docsOfSection(sectionId).map((d) => d.phase).filter(Boolean));
  const declared = (section?.phases || []).filter((p) => used.has(p));
  const extra = [...used].filter((p) => !declared.includes(p)).sort();
  return [...declared, ...extra];
}

/** Đọc ?s= và ?d= từ URL, chỉ trả về giá trị có thật trong catalog. */
function readParams() {
  const params = new URLSearchParams(window.location.search);
  const sectionId = params.get("s") || "";
  const section = getSection(sectionId);
  const docPath = params.get("d") || "";
  const doc = docPath ? getDoc(`${sectionId}/${docPath}`) : null;
  return { section, doc, query: params.get("q") || "", category: params.get("c") || "" };
}

const hubUrl = (sectionId, extra = {}) => {
  const params = new URLSearchParams({ s: sectionId, ...extra });
  return `hub.html?${params}`;
};

const readerUrl = (doc) =>
  `reader.html?s=${encodeURIComponent(doc.section)}&d=${encodeURIComponent(`${doc.category}/${doc.slug}`)}`;
