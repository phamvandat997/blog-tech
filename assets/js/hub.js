"use strict";
// Hub của một mảng nội dung: danh sách bài để đọc.
// Chuyên mục đọc từ catalog — không hardcode tên mảng nào.

const hub = {
  section: null,
  category: "all",
  query: "",
};

const els = {};

/* ---------------------------------------------------------------- sidebar */

function renderSidebar() {
  const counts = new Map();
  docsOfSection(hub.section.id).forEach((d) => counts.set(d.category, (counts.get(d.category) || 0) + 1));

  const items = [{ id: "all", name: "Tất cả bài viết" }].concat(hub.section.categories);

  els.categories.innerHTML = items.map((cat) => `
    <button class="category-item ${hub.category === cat.id ? "active" : ""}" data-category="${attr(cat.id)}" type="button">
      <span class="category-name">${escapeHtml(cat.name)}</span>
      <span class="category-count">${cat.id === "all" ? hub.section.docCount : counts.get(cat.id) || 0}</span>
    </button>`).join("");
}

/* --------------------------------------------------------------- tab: docs */

function docCard(doc) {
  return `<a class="doc-card" href="${attr(readerUrl(doc))}">
    <span class="doc-card-body">
      <span class="doc-title">${escapeHtml(doc.title)}</span>
      <span class="doc-desc">${escapeHtml(doc.description)}</span>
    </span>
  </a>`;
}

function renderDocs() {
  const docs = filterDocs({ section: hub.section.id, category: hub.category, query: hub.query });
  els.docs.innerHTML = docs.length
    ? docs.map(docCard).join("")
    : emptyState("🔍", "Không có bài nào khớp", "Thử đổi từ khoá hoặc chọn lại chuyên mục.");
}

/* ------------------------------------------------------------------- tabs */

function render() {
  renderSidebar();
  renderDocs();
}

/* ------------------------------------------------------------------ events */

function bindEvents() {
  delegate(els.categories, "click", "[data-category]", (_, btn) => {
    hub.category = btn.dataset.category;
    render();
  });

  els.search.addEventListener("input", () => {
    hub.query = els.search.value.trim();
    els.searchClear.hidden = !hub.query;
    render();
  });

  els.searchClear.addEventListener("click", () => {
    els.search.value = "";
    hub.query = "";
    els.searchClear.hidden = true;
    els.search.focus();
    render();
  });

}

/* ------------------------------------------------------------------- start */

document.addEventListener("DOMContentLoaded", async () => {
  initTheme();
  Object.assign(els, {
    categories: qs("#category-container"),
    docs: qs("#docs-container"),
    search: qs("#search-input"),
    searchClear: qs("#search-clear-btn"),
  });

  const params = readParams();
  if (!params.section) {
    qs("#hub-root").innerHTML = emptyState("🧭", "Không tìm thấy mảng nội dung này",
      "Đường dẫn thiếu hoặc sai tham số ?s=",
      '<a class="btn-primary-link" href="index.html">⬅ Về trang chủ</a>');
    return;
  }

  hub.section = params.section;
  hub.query = params.query;
  hub.category = params.category && params.category !== "all" ? params.category : "all";

  document.title = `${hub.section.name} | Blog kỹ thuật`;
  qs("#hub-title").textContent = hub.section.name;
  document.documentElement.style.setProperty("--section-color", hub.section.color);

  els.search.value = hub.query;
  els.searchClear.hidden = !hub.query;

  bindEvents();
  render();
  initBackToTop();
});
