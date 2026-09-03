"use strict";
// Hub của một mảng nội dung: danh sách bài để đọc.
// Chuyên mục đọc từ catalog — không hardcode tên mảng nào.

const PAGE_SIZE = 12;

const hub = {
  section: null,
  category: "all",
  phase: "all",
  query: "",
  page: 1,
};

const els = {};

function updateUrl() {
  const params = new URLSearchParams();
  if (hub.section) params.set("s", hub.section.id);
  if (hub.category && hub.category !== "all") params.set("c", hub.category);
  if (hub.phase && hub.phase !== "all") params.set("phase", hub.phase);
  if (hub.query) params.set("q", hub.query);
  if (hub.page > 1) params.set("p", hub.page);
  const newUrl = `${window.location.pathname}?${params.toString()}`;
  history.replaceState(null, "", newUrl);
}

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
  const isCompleted = isDocCompleted(doc.id);
  const readingTime = doc.readingMinutes || 5;
  const phaseBadge = doc.phase ? `<span class="doc-badge doc-badge-phase inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-800/60">${escapeHtml(doc.phase)}</span>` : "";
  const completedBadge = isCompleted ? `<span class="doc-badge doc-badge-completed inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">✓ Đã học</span>` : "";
  const tagsHtml = (doc.tags || []).slice(0, 2).map((t) => `<span class="doc-tag text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/60 px-2 py-0.5 rounded-full">#${escapeHtml(t)}</span>`).join("");

  return `<a class="doc-card ${isCompleted ? "is-completed" : ""} group relative flex flex-col justify-between p-5 rounded-2xl backdrop-blur-md bg-white/95 dark:bg-slate-800/85 border border-slate-200/90 dark:border-slate-700/70 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all no-underline" href="${attr(readerUrl(doc))}">
    <div class="doc-card-top flex items-center justify-between gap-2 mb-3">
      <div class="doc-badges flex items-center gap-1.5 flex-wrap">
        ${phaseBadge}
        ${completedBadge}
      </div>
      <span class="doc-reading-time text-xs font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1">⏱️ ~${readingTime}p</span>
    </div>
    <span class="doc-card-body block flex-1 mb-4">
      <span class="doc-title block text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug mb-1.5">${escapeHtml(doc.title)}</span>
      <span class="doc-desc block text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">${escapeHtml(doc.description)}</span>
    </span>
    <div class="doc-card-footer flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700/60">
      <div class="doc-tags flex items-center gap-1.5 flex-wrap">${tagsHtml}</div>
      <span class="doc-arrow text-indigo-600 dark:text-indigo-400 text-sm font-bold group-hover:translate-x-1 transition-transform">➔</span>
    </div>
  </a>`;
}

function renderProgressTracker() {
  if (!els.progressTracker || !hub.section) return;
  const allDocs = docsOfSection(hub.section.id);
  const total = allDocs.length;
  if (!total) {
    els.progressTracker.hidden = true;
    return;
  }
  const completed = allDocs.filter((d) => isDocCompleted(d.id)).length;
  const percent = Math.round((completed / total) * 100);

  els.progressTracker.hidden = false;
  els.progressTracker.innerHTML = `
    <div class="progress-tracker-header">
      <span class="progress-tracker-title">🎯 Tiến độ ôn luyện ${escapeHtml(hub.section.name)}</span>
      <span class="progress-tracker-count"><b>${completed}</b> / ${total} bài (${percent}%)</span>
    </div>
    <div class="progress-tracker-track">
      <div class="progress-tracker-fill" style="width: ${percent}%;"></div>
    </div>
  `;
}

function paginationRange(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [];
  pages.push(1);
  if (current > 3) pages.push("...");
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) {
    if (!pages.includes(i)) pages.push(i);
  }
  if (current < total - 2) pages.push("...");
  if (!pages.includes(total)) pages.push(total);
  return pages;
}

function renderPagination(total, totalPages, startIdx, endIdx) {
  if (!els.pagination) return;
  if (totalPages <= 1) {
    els.pagination.innerHTML = "";
    return;
  }

  const range = paginationRange(hub.page, totalPages);

  const controlsHtml = [
    `<button class="pagination-btn pagination-prev" data-page="${hub.page - 1}" type="button" ${hub.page === 1 ? "disabled" : ""} aria-label="Trang trước">⬅ Trước</button>`,
    ...range.map((item) => {
      if (item === "...") return `<span class="pagination-ellipsis">…</span>`;
      const isCurrent = item === hub.page;
      return `<button class="pagination-btn ${isCurrent ? "active" : ""}" data-page="${item}" type="button" ${isCurrent ? "disabled" : ""} aria-label="Trang ${item}">${item}</button>`;
    }),
    `<button class="pagination-btn pagination-next" data-page="${hub.page + 1}" type="button" ${hub.page === totalPages ? "disabled" : ""} aria-label="Trang sau">Sau ➡</button>`,
  ].join("");

  els.pagination.innerHTML = `
    <span class="pagination-info">Hiển thị <b>${startIdx + 1}–${endIdx}</b> trong <b>${total}</b> bài viết</span>
    <div class="pagination-controls">${controlsHtml}</div>
  `;
}

function renderFilterBar() {
  if (!els.filterBar || !hub.section) return;
  const docs = docsOfSection(hub.section.id);
  const phases = Array.from(new Set(docs.map((d) => d.phase).filter(Boolean)));
  if (!phases.length) {
    els.filterBar.innerHTML = "";
    els.filterBar.hidden = true;
    return;
  }

  els.filterBar.hidden = false;
  const items = [{ id: "all", label: "Tất cả Phase" }].concat(
    phases.map((p) => ({ id: p, label: p.toUpperCase() }))
  );

  els.filterBar.innerHTML = `
    <div class="phase-filter-list">
      <span class="phase-filter-label">Lọc theo Phase:</span>
      ${items.map((item) => `
        <button class="phase-chip ${hub.phase === item.id ? "active" : ""}" data-phase="${attr(item.id)}" type="button">
          ${escapeHtml(item.label)}
        </button>
      `).join("")}
    </div>
  `;
}

function renderDocs() {
  const docs = filterDocs({ section: hub.section.id, category: hub.category, phase: hub.phase, query: hub.query });
  const total = docs.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  if (hub.page > totalPages) hub.page = totalPages;
  if (hub.page < 1) hub.page = 1;

  const startIdx = (hub.page - 1) * PAGE_SIZE;
  const endIdx = Math.min(startIdx + PAGE_SIZE, total);
  const pagedDocs = docs.slice(startIdx, endIdx);

  if (!total) {
    els.docs.innerHTML = emptyState(
      "🔍",
      "Không có bài nào khớp",
      "Thử đổi từ khoá hoặc chọn lại chuyên mục / phase.",
      '<button class="btn-primary-link" id="btn-reset-filters" type="button">✕ Xoá bộ lọc & Đặt lại</button>'
    );
    if (els.pagination) els.pagination.innerHTML = "";
    return;
  }

  els.docs.innerHTML = pagedDocs.map(docCard).join("");
  renderPagination(total, totalPages, startIdx, endIdx);
}

/* ------------------------------------------------------------------- tabs */

function render() {
  renderSidebar();
  renderProgressTracker();
  renderFilterBar();
  renderDocs();
  updateUrl();
}

/* ------------------------------------------------------------------ events */

function bindEvents() {
  delegate(els.categories, "click", "[data-category]", (_, btn) => {
    hub.category = btn.dataset.category;
    hub.page = 1;
    render();
  });

  els.search.addEventListener("input", () => {
    hub.query = els.search.value.trim();
    hub.page = 1;
    els.searchClear.hidden = !hub.query;
    render();
  });

  els.searchClear.addEventListener("click", () => {
    els.search.value = "";
    hub.query = "";
    hub.page = 1;
    els.searchClear.hidden = true;
    els.search.focus();
    render();
  });

  if (els.pagination) {
    delegate(els.pagination, "click", "[data-page]", (e, btn) => {
      const page = parseInt(btn.dataset.page, 10);
      if (page && page !== hub.page) {
        hub.page = page;
        renderDocs();
        updateUrl();
      }
    });
  }

  if (els.filterBar) {
    delegate(els.filterBar, "click", "[data-phase]", (_, btn) => {
      hub.phase = btn.dataset.phase;
      hub.page = 1;
      render();
    });
  }

  delegate(els.docs, "click", "#btn-reset-filters", () => {
    hub.category = "all";
    hub.phase = "all";
    hub.query = "";
    hub.page = 1;
    els.search.value = "";
    els.searchClear.hidden = true;
    render();
  });
}

/* ------------------------------------------------------------------- start */

document.addEventListener("DOMContentLoaded", async () => {
  initTheme();
  Object.assign(els, {
    categories: qs("#category-container"),
    docs: qs("#docs-container"),
    pagination: qs("#pagination-container"),
    progressTracker: qs("#hub-progress-tracker"),
    filterBar: qs("#hub-filter-bar"),
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
  hub.phase = params.phase && params.phase !== "all" ? params.phase : "all";
  hub.page = params.page || 1;

  setPageMeta({
    title: `${hub.section.name} | Blog Tech`,
    description: hub.section.tagline || `Danh mục bài viết mảng ${hub.section.name}.`,
  });
  qs("#hub-title").textContent = hub.section.name;
  document.documentElement.style.setProperty("--section-color", hub.section.color);

  els.search.value = hub.query;
  els.searchClear.hidden = !hub.query;

  bindEvents();
  initSearchShortcut("#search-input");
  window.addEventListener("doc-completion-changed", () => {
    renderProgressTracker();
    renderDocs();
  });

  render();
  initBackToTop();
});
