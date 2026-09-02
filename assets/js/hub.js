"use strict";
// Hub của một mảng nội dung: danh sách bài để đọc, và tab luyện quiz.
// Chuyên mục đọc từ catalog — không hardcode tên mảng nào.

const hub = {
  section: null,
  tab: "docs",
  category: "all",
  query: "",
  quizScope: "all",
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
  const quizNote = doc.questions
    ? `<span class="doc-card-quiz">🎯 ${doc.questions} câu quiz</span>`
    : "";
  return `<a class="doc-card" href="${attr(readerUrl(doc))}">
    <span class="doc-card-body">
      <span class="doc-title">${escapeHtml(doc.title)}</span>
      <span class="doc-desc">${escapeHtml(doc.description)}</span>
      ${quizNote}
    </span>
  </a>`;
}

function renderDocs() {
  const docs = filterDocs({ section: hub.section.id, category: hub.category, query: hub.query });
  els.docs.innerHTML = docs.length
    ? docs.map(docCard).join("")
    : emptyState("🔍", "Không có bài nào khớp", "Thử đổi từ khoá hoặc chọn lại chuyên mục.");
}

/* --------------------------------------------------------------- tab: quiz */

function renderQuiz() {
  const banks = Object.values(QUIZ_BANK);
  if (!banks.length) {
    els.quizView.innerHTML = emptyState("🎯", "Mảng này chưa có câu hỏi nào",
      "Thêm file <tên-bài>.quiz.json cạnh bài viết rồi chạy lại node build/build.js");
    return;
  }

  const tabs = [{ id: "all", title: "🌟 Toàn bộ", count: banks.reduce((n, b) => n + b.quizzes.length, 0) }]
    .concat(banks.map((b) => ({ id: b.docId, title: b.title, count: b.quizzes.length })));

  let entries = questionsOf(hub.quizScope);
  if (hub.query) {
    const q = hub.query.toLowerCase();
    entries = entries.filter(({ q: item }) =>
      item.question.toLowerCase().includes(q) ||
      (item.explanation || "").toLowerCase().includes(q) ||
      item.options.some((o) => o.text.toLowerCase().includes(q)));
  }

  const score = scoreOf(hub.quizScope);

  els.quizView.innerHTML = `
    <div data-quiz-scope="${attr(hub.quizScope)}">
      <div class="quiz-filter-bar">
        ${tabs.map((t) => `<button class="quiz-tab-pill ${hub.quizScope === t.id ? "active" : ""}" type="button"
             data-quiz-scope-pick="${attr(t.id)}">${escapeHtml(t.title)} (${t.count})</button>`).join("")}
      </div>
      <div class="quiz-actions-toolbar">
        <div class="quiz-score-badge" data-quiz-score>Kết quả: <b>${score.correct}</b> / ${score.total} (${score.pct}%)</div>
        <button class="btn-quiz-secondary" type="button" data-quiz-reset>🔄 Làm lại</button>
        <button class="btn-quiz-primary" type="button" data-quiz-submit>📝 Chấm toàn bộ</button>
      </div>
      <div class="quiz-cards-wrapper">
        ${entries.length
          ? entries.map(({ docId, q }) => renderQuestionCard(docId, q)).join("")
          : emptyState("🔍", "Không có câu hỏi nào khớp", "Thử xoá từ khoá tìm kiếm.")}
      </div>
    </div>`;
}

/* ------------------------------------------------------------------- tabs */

function switchTab(tab) {
  hub.tab = tab;
  qsa("[data-tab]").forEach((btn) => btn.classList.toggle("active", btn.dataset.tab === tab));
  els.sidebar.hidden = tab !== "docs";
  // Sidebar ẩn thì lưới hai cột phải thu về một, không để lại khoảng trống.
  els.mainWrapper.classList.toggle("no-sidebar", tab !== "docs");
  els.docs.hidden = tab !== "docs";
  els.quizView.hidden = tab !== "quizzes";
  render();
}

function render() {
  if (hub.tab === "docs") {
    renderSidebar();
    renderDocs();
  } else {
    renderQuiz();
  }
}

/* ------------------------------------------------------------------ events */

function bindEvents() {
  delegate(els.categories, "click", "[data-category]", (_, btn) => {
    hub.category = btn.dataset.category;
    render();
  });

  qsa("[data-tab]").forEach((btn) => btn.addEventListener("click", () => switchTab(btn.dataset.tab)));

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

  delegate(els.quizView, "click", "[data-quiz-scope-pick]", (_, btn) => {
    hub.quizScope = btn.dataset.quizScopePick;
    renderQuiz();
  });

  bindQuiz(els.quizView, () => renderQuiz());
}

/* ------------------------------------------------------------------- start */

document.addEventListener("DOMContentLoaded", async () => {
  initTheme();
  Object.assign(els, {
    mainWrapper: qs(".main-wrapper"),
    sidebar: qs("#hub-sidebar"),
    categories: qs("#category-container"),
    docs: qs("#docs-container"),
    quizView: qs("#quiz-view"),
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

  await loadQuizBank(hub.section.id);
  // Không có câu hỏi nào thì tab Luyện quiz cũng không cần hiện.
  qs('[data-tab="quizzes"]').hidden = Object.keys(QUIZ_BANK).length === 0;

  bindEvents();
  switchTab("docs");
  initBackToTop();
});
