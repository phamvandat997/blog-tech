"use strict";
// Trang chủ: chọn mảng nội dung. Chia hai khu theo `kind` trong _section.json,
// nên thêm một thư mục mới là có ngay một thẻ, không đụng tới file này.

const KIND_GROUPS = [
  { kind: "language", title: "Ngôn ngữ" },
  { kind: "topic", title: "Chủ đề" },
];

function sectionCard(section) {
  const docs = docsOfSection(section.id);
  const meta = docs.length ? `${docs.length} bài` : "Sắp có nội dung";

  return `<a class="section-card ${docs.length ? "" : "is-empty"}" href="${attr(hubUrl(section.id))}"
       style="--section-color: ${attr(section.color)}">
    <h3 class="section-card-name">${escapeHtml(section.name)}</h3>
    <p class="section-card-tagline">${escapeHtml(section.tagline)}</p>
    <div class="section-card-meta">${escapeHtml(meta)}</div>
  </a>`;
}

function renderLanding() {
  const root = qs("#sections-root");
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

/** Tìm kiếm toàn cục: gợi ý bài từ mọi mảng, Enter đi thẳng vào hub. */
function bindGlobalSearch() {
  const input = qs("#global-search");
  const panel = qs("#global-search-results");
  if (!input || !panel) return;

  const close = () => { panel.innerHTML = ""; panel.classList.remove("open"); };

  input.addEventListener("input", () => {
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
    if (event.key !== "Enter") return;
    const query = input.value.trim();
    if (!query) return;
    const first = filterDocs({ query })[0];
    if (first) window.location.href = hubUrl(first.section, { q: query });
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
});
