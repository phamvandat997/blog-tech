"use strict";
// Trang chủ: chọn mảng nội dung. Chia hai khu theo `kind` trong _section.json,
// nên thêm một thư mục mới là có ngay một thẻ, không đụng tới file này.

const KIND_GROUPS = [
  { kind: "language", title: "Ngôn ngữ", hint: "Kiến thức theo từng ngôn ngữ lập trình" },
  { kind: "topic", title: "Chủ đề", hint: "Kiến thức không gắn với một ngôn ngữ cụ thể" },
];

function sectionCard(section) {
  const stats = sectionStats(section.id);
  const isEmpty = stats.docs === 0;
  const meta = isEmpty
    ? '<span class="section-card-soon">Sắp có nội dung</span>'
    : `<span>${stats.docs} bài</span><span>${stats.lines.toLocaleString("vi-VN")} dòng</span>` +
      (stats.questions ? `<span>${stats.questions} câu quiz</span>` : "");

  const progress = isEmpty ? "" : `
    <div class="section-card-progress">
      <div class="progress-bar-container"><div class="progress-bar-fill" style="width: ${stats.pct}%"></div></div>
      <span class="section-card-pct">${stats.done}/${stats.total} đã đọc</span>
    </div>`;

  const tag = `<a class="section-card ${isEmpty ? "is-empty" : ""}" href="${attr(hubUrl(section.id))}"
       style="--section-color: ${attr(section.color)}">
    <div class="section-card-icon">${escapeHtml(section.icon)}</div>
    <h3 class="section-card-name">${escapeHtml(section.name)}</h3>
    <p class="section-card-tagline">${escapeHtml(section.tagline)}</p>
    <div class="section-card-meta">${meta}</div>
    ${progress}
  </a>`;
  return tag;
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
      <div class="section-group-head">
        <h2>${escapeHtml(group.title)}</h2>
        <p>${escapeHtml(group.hint)}</p>
      </div>
      <div class="section-cards">${sections.map(sectionCard).join("")}</div>
    </section>`;
  }).join("");

  const totals = ALL_SECTIONS.reduce((acc, s) => {
    const st = sectionStats(s.id);
    return { docs: acc.docs + st.docs, lines: acc.lines + st.lines, questions: acc.questions + st.questions, done: acc.done + st.done };
  }, { docs: 0, lines: 0, questions: 0, done: 0 });

  qs("#landing-stats").innerHTML = [
    ["📦", ALL_SECTIONS.length, "Mảng nội dung"],
    ["📚", totals.docs, "Bài viết"],
    ["⚡", totals.lines.toLocaleString("vi-VN"), "Dòng kiến thức"],
    ["🎯", totals.questions, "Câu trắc nghiệm"],
    ["✅", `${totals.done}/${totals.docs}`, "Đã đọc xong"],
  ].map(([icon, value, label]) => `<div class="stat-card">
      <div class="stat-icon">${icon}</div>
      <div class="stat-info">
        <div class="stat-value">${escapeHtml(value)}</div>
        <div class="stat-label">${escapeHtml(label)}</div>
      </div>
    </div>`).join("");
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
    const hits = filterDocs({ query, sortBy: "title-asc" }).slice(0, 8);
    if (!hits.length) {
      panel.innerHTML = `<div class="search-hit search-hit-empty">Không có bài nào khớp “${escapeHtml(query)}”</div>`;
    } else {
      panel.innerHTML = hits.map((doc) => {
        const section = getSection(doc.section);
        return `<a class="search-hit" href="${attr(readerUrl(doc))}">
          <span class="search-hit-icon">${escapeHtml(section?.icon || "📄")}</span>
          <span class="search-hit-body">
            <span class="search-hit-title">${escapeHtml(doc.title)}</span>
            <span class="search-hit-path">${escapeHtml(section?.name || doc.section)} › ${escapeHtml(doc.category)}</span>
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
  initBackToTop();
});
