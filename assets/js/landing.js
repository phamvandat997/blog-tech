"use strict";
// Trang chủ: chọn mảng nội dung. Chia hai khu theo `kind` trong _section.json,
// nên thêm một thư mục mới là có ngay một thẻ, không đụng tới file này.

const KIND_GROUPS = [
  { kind: "language", title: "Ngôn ngữ" },
  { kind: "topic", title: "Chủ đề" },
];

function sectionCard(section) {
  const docs = docsOfSection(section.id);
  const completedCount = docs.filter((d) => isDocCompleted(d.id)).length;
  let meta = docs.length ? `${docs.length} bài` : "Sắp có nội dung";
  let progressBadge = "";

  if (docs.length > 0 && completedCount > 0) {
    const pct = Math.round((completedCount / docs.length) * 100);
    progressBadge = `<span class="section-card-progress">✓ ${completedCount}/${docs.length} bài (${pct}%)</span>`;
  }

  return `<a class="section-card ${docs.length ? "" : "is-empty"}" href="${attr(hubUrl(section.id))}"
       style="--section-color: ${attr(section.color)}">
    <div class="section-card-header">
      <h3 class="section-card-name">${escapeHtml(section.name)}</h3>
      ${progressBadge}
    </div>
    <p class="section-card-tagline">${escapeHtml(section.tagline)}</p>
    <div class="section-card-meta">${escapeHtml(meta)}</div>
  </a>`;
}

function renderLanding() {
  const root = qs("#sections-root");
  updateHeroStats();
  if (!hasCatalog || ALL_SECTIONS.length === 0) {
    root.innerHTML = emptyState("📦", "Chưa có nội dung nào",
      "Tạo content/<mảng>/<chuyên-mục>/bai-viet.md rồi chạy: node build/build.js");
    return;
  }

  root.innerHTML = KIND_GROUPS.map((group) => {
    const sections = ALL_SECTIONS.filter((s) => s.kind === group.kind);
    if (!sections.length) return "";
    return `<section class="section-group">
      <h2 class="section-group-head">${escapeHtml(group.title)}</h2>
      <div class="section-cards">${sections.map(sectionCard).join("")}</div>
    </section>`;
  }).join("");
}

/** Số liệu Hero Banner lấy từ catalog, không hard-code — catalog rỗng thì về 0. */
function updateHeroStats() {
  const allDocs = hasCatalog ? ALL_DOCUMENTS : [];
  const completedTotal = allDocs.filter((d) => isDocCompleted(d.id)).length;

  const docsVal = qs("#hero-docs-val");
  if (docsVal) docsVal.textContent = String(allDocs.length);

  const sectionsVal = qs("#hero-sections-val");
  if (sectionsVal) sectionsVal.textContent = String(ALL_SECTIONS.length);

  const progressVal = qs("#hero-progress-val");
  const progressLbl = qs("#hero-progress-lbl");
  if (!progressVal || !progressLbl) return;

  if (!allDocs.length) {
    progressVal.textContent = "0%";
    progressLbl.textContent = "Chưa có bài nào";
    return;
  }
  const pct = Math.round((completedTotal / allDocs.length) * 100);
  progressVal.textContent = `${pct}%`;
  progressLbl.textContent = `${completedTotal}/${allDocs.length} bài đã hoàn thành`;
}

/** Tìm kiếm toàn cục: gợi ý bài từ mọi mảng, phím mũi tên & Enter. */
function bindGlobalSearch() {
  const input = qs("#global-search");
  const panel = qs("#global-search-results");
  if (!input || !panel) return;

  let selectedIdx = -1;

  const close = () => {
    panel.innerHTML = "";
    panel.classList.remove("open");
    selectedIdx = -1;
  };

  const updateSelection = (hits) => {
    hits.forEach((h, i) => {
      h.classList.toggle("is-selected", i === selectedIdx);
      if (i === selectedIdx) h.scrollIntoView({ block: "nearest" });
    });
  };

  input.addEventListener("input", () => {
    selectedIdx = -1;
    const query = input.value.trim();
    if (query.length < 2) return close();
    const hits = filterDocs({ query }).slice(0, 8);
    if (!hits.length) {
      panel.innerHTML = `<div class="search-hit search-hit-empty">Không có bài nào khớp “${escapeHtml(query)}”</div>`;
    } else {
      panel.innerHTML = hits.map((doc) => {
        const section = getSection(doc.section);
        const category = section?.categories.find((c) => c.id === doc.category);
        return `<a class="search-hit" href="${attr(readerUrl(doc))}">
          <span class="search-hit-body">
            <span class="search-hit-title">${escapeHtml(doc.title)}</span>
            <span class="search-hit-path">${escapeHtml(section?.name || doc.section)} › ${escapeHtml(category?.name || doc.category)}</span>
          </span>
        </a>`;
      }).join("");
    }
    panel.classList.add("open");
  });

  input.addEventListener("keydown", (event) => {
    const hits = qsa(".search-hit", panel);
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!hits.length) return;
      selectedIdx = (selectedIdx + 1) % hits.length;
      updateSelection(hits);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!hits.length) return;
      selectedIdx = (selectedIdx - 1 + hits.length) % hits.length;
      updateSelection(hits);
    } else if (event.key === "Enter") {
      if (selectedIdx >= 0 && hits[selectedIdx]) {
        event.preventDefault();
        window.location.href = hits[selectedIdx].href;
      } else {
        const query = input.value.trim();
        if (!query) return;
        const first = filterDocs({ query })[0];
        if (first) window.location.href = hubUrl(first.section, { q: query });
      }
    } else if (event.key === "Escape") {
      close();
      input.blur();
    }
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".search-wrapper")) close();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  renderLanding();
  bindGlobalSearch();
  initSearchShortcut("#global-search");
  initBackToTop();
  window.addEventListener("doc-completion-changed", renderLanding);
});
