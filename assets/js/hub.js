"use strict";
// Hub của một mảng nội dung: danh sách bài, lộ trình (nếu mảng khai báo), quiz.
// Mọi chuyên mục và phase đều đọc từ catalog — không hardcode tên mảng nào.

const hub = {
  section: null,
  tab: "docs",
  category: "all",
  phase: "all",
  query: "",
  sortBy: "default",
  favorite: false,
  completed: false,
  uncompleted: false,
  quizScope: "all",
};

const els = {};

/* ---------------------------------------------------------------- sidebar */

function renderSidebar() {
  const counts = new Map();
  docsOfSection(hub.section.id).forEach((d) => counts.set(d.category, (counts.get(d.category) || 0) + 1));

  const items = [{ id: "all", name: "Tất cả bài viết", icon: "📑", docCount: hub.section.docCount }]
    .concat(hub.section.categories);

  els.categories.innerHTML = items.map((cat) => `
    <button class="category-item ${hub.category === cat.id ? "active" : ""}" data-category="${attr(cat.id)}" type="button">
      <span class="category-icon">${escapeHtml(cat.icon)}</span>
      <span class="category-name">${escapeHtml(cat.name)}</span>
      <span class="category-count">${cat.id === "all" ? hub.section.docCount : counts.get(cat.id) || 0}</span>
    </button>`).join("");

  // Một phase duy nhất thì bộ lọc chẳng lọc được gì — ẩn đi.
  const phases = phasesInUse(hub.section.id);
  els.phaseBlock.hidden = phases.length < 2;
  els.phases.innerHTML = ["all", ...phases].map((p) => `
    <button class="phase-pill ${hub.phase === p ? "active" : ""}" data-phase="${attr(p)}" type="button">
      ${escapeHtml(p === "all" ? "Tất cả" : p)}
    </button>`).join("");
}

/* ------------------------------------------------------------------ stats */

function renderStats() {
  const s = sectionStats(hub.section.id);
  els.stats.innerHTML = [
    ["📚", s.docs, "Bài viết"],
    ["⚡", s.lines.toLocaleString("vi-VN"), "Dòng nội dung"],
    ["🎯", s.questions, "Câu trắc nghiệm"],
  ].map(([icon, value, label]) => `<div class="stat-card">
      <div class="stat-icon">${icon}</div>
      <div class="stat-info"><div class="stat-value">${escapeHtml(value)}</div><div class="stat-label">${escapeHtml(label)}</div></div>
    </div>`).join("") + `
    <div class="stat-card">
      <div class="stat-icon">✅</div>
      <div class="stat-info" style="width:100%">
        <div class="stat-value-row">
          <span class="stat-value">${s.done} / ${s.total}</span>
          <span class="stat-pct">${s.pct}%</span>
        </div>
        <div class="stat-label">Tiến độ đọc</div>
        <div class="progress-bar-container"><div class="progress-bar-fill" style="width:${s.pct}%"></div></div>
      </div>
    </div>`;
}

/* --------------------------------------------------------------- tab: docs */

function docCard(doc) {
  const starred = state.favorites.has(doc.id);
  const done = state.completed.has(doc.id);
  const category = hub.section.categories.find((c) => c.id === doc.category);

  const badges = [
    doc.difficulty && `<span class="badge badge-difficulty">${escapeHtml(doc.difficulty)}</span>`,
    doc.phase && `<span class="badge badge-phase">${escapeHtml(doc.phase)}</span>`,
  ].filter(Boolean).join("");

  const quizLink = doc.questions
    ? `<button class="doc-meta-item doc-meta-quiz" type="button" data-quiz-jump="${attr(doc.id)}">🎯 ${doc.questions} câu ➔</button>`
    : "";

  return `<article class="doc-card" data-doc-id="${attr(doc.id)}">
    <a class="doc-card-link" href="${attr(readerUrl(doc))}">
      <div class="doc-card-header">
        <div class="doc-card-ident">
          <span class="doc-icon-wrap">${escapeHtml(doc.icon)}</span>
          <span class="doc-badge-group">${badges}</span>
        </div>
      </div>
      <h3 class="doc-title">${escapeHtml(doc.title)}</h3>
      <p class="doc-desc">${escapeHtml(doc.description)}</p>
      <div class="doc-tags">${doc.tags.map((t) => `<span class="tag-pill">#${escapeHtml(t)}</span>`).join("")}</div>
    </a>
    <div class="doc-footer">
      <span class="doc-meta-item">${escapeHtml(category?.icon || "📁")} ${escapeHtml(category?.name || doc.category)}</span>
      <span class="doc-meta-item">📄 ${doc.lines} dòng</span>
      <span class="doc-meta-item">💾 ${escapeHtml(doc.size)}</span>
      ${quizLink}
      <div class="doc-actions-quick">
        <button class="btn-star ${starred ? "starred" : ""}" type="button" data-toggle-star title="Yêu thích">${starred ? "★" : "☆"}</button>
        <button class="btn-check ${done ? "completed" : ""}" type="button" data-toggle-done title="Đã đọc">${done ? "✓" : "○"}</button>
      </div>
    </div>
  </article>`;
}

function renderDocs() {
  const docs = filterDocs({
    section: hub.section.id, category: hub.category, phase: hub.phase, query: hub.query,
    favorite: hub.favorite, completed: hub.completed, uncompleted: hub.uncompleted, sortBy: hub.sortBy,
  });

  els.resultsCounter.innerHTML =
    `Hiển thị <b>${docs.length}</b> / ${hub.section.docCount} bài`;

  els.docs.className = `docs-container ${state.viewMode}-view`;
  els.docs.innerHTML = docs.length
    ? docs.map(docCard).join("")
    : emptyState("🔍", "Không có bài nào khớp", "Thử đổi từ khoá hoặc bấm Đặt lại bộ lọc.");
}

/* ------------------------------------------------------------- tab: phases */

function renderPhases() {
  const details = hub.section.phaseDetails
    .filter((p) => hub.phase === "all" || p.phaseId === hub.phase);

  if (!details.length) {
    els.phasesView.innerHTML = emptyState("🧭", "Mảng này chưa có lộ trình",
      "Thêm mục phaseDetails vào content/" + hub.section.id + "/_section.json để hiện lộ trình ở đây.");
    return;
  }

  els.phasesView.innerHTML = details.map((phase) => {
    const list = (items, cls) => (items || []).length
      ? `<ul class="phase-list ${cls}">${items.map((t) => `<li>${renderInlineCode(t)}</li>`).join("")}</ul>` : "";

    const docs = (phase.docs || []).map((ref) => {
      const doc = getDoc(ref.id);
      if (!doc) return "";
      const done = state.completed.has(doc.id);
      return `<a class="phase-doc-row ${done ? "is-done" : ""}" href="${attr(readerUrl(doc))}">
        <span class="phase-doc-icon">${escapeHtml(doc.icon)}</span>
        <span class="phase-doc-body">
          <span class="phase-doc-title">${escapeHtml(doc.title)}</span>
          <span class="phase-doc-meta">${escapeHtml(ref.type || doc.category)} · ${doc.lines} dòng${doc.questions ? ` · ${doc.questions} câu quiz` : ""}</span>
        </span>
        <span class="phase-doc-state">${done ? "✓" : "→"}</span>
      </a>`;
    }).join("");

    return `<article class="phase-card" style="--phase-color: ${attr(phase.color || hub.section.color)}">
      <header class="phase-card-head">
        <span class="phase-card-icon">${escapeHtml(phase.icon || "🧭")}</span>
        <div>
          <h3>${escapeHtml(phase.title || phase.phaseId)}</h3>
          <p>${escapeHtml(phase.subtitle || "")}</p>
        </div>
        ${phase.targetWeeks ? `<span class="phase-card-weeks">${escapeHtml(phase.targetWeeks)}</span>` : ""}
      </header>
      ${phase.tagline ? `<p class="phase-tagline">${escapeHtml(phase.tagline)}</p>` : ""}
      ${phase.coreKnowledge?.length ? `<h4 class="phase-sub">Kiến thức cốt lõi</h4>${list(phase.coreKnowledge, "is-core")}` : ""}
      ${phase.commonTraps?.length ? `<h4 class="phase-sub">Bẫy thường gặp</h4>${list(phase.commonTraps, "is-trap")}` : ""}
      ${docs ? `<h4 class="phase-sub">Tài liệu của phase</h4><div class="phase-doc-list">${docs}</div>` : ""}
    </article>`;
  }).join("");
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
      <div class="quiz-dashboard-header">
        <div class="quiz-meta-info">
          <h2>🎯 Luyện tập trắc nghiệm</h2>
          <p>Chọn đáp án rồi bấm Kiểm tra để xem ngay đúng/sai kèm lời giải. Bài làm được lưu lại.</p>
        </div>
        <div class="quiz-actions-toolbar">
          <div class="quiz-score-badge" data-quiz-score>Kết quả: <b>${score.correct}</b> / ${score.total} (${score.pct}%)</div>
          <button class="btn-quiz-secondary" type="button" data-quiz-reset>🔄 Làm lại</button>
          <button class="btn-quiz-primary" type="button" data-quiz-submit>📝 Chấm toàn bộ</button>
        </div>
      </div>
      <div class="quiz-filter-bar">
        ${tabs.map((t) => `<button class="quiz-tab-pill ${hub.quizScope === t.id ? "active" : ""}" type="button"
             data-quiz-scope-pick="${attr(t.id)}">${escapeHtml(t.title)} (${t.count})</button>`).join("")}
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
  els.toolbar.hidden = tab !== "docs";
  els.docs.hidden = tab !== "docs";
  els.phasesView.hidden = tab !== "phases";
  els.quizView.hidden = tab !== "quizzes";
  render();
}

function render() {
  renderSidebar();
  renderStats();
  if (hub.tab === "docs") renderDocs();
  else if (hub.tab === "phases") renderPhases();
  else renderQuiz();
}

/* ------------------------------------------------------------------ events */

function bindEvents() {
  delegate(els.categories, "click", "[data-category]", (_, btn) => {
    hub.category = btn.dataset.category;
    render();
  });

  delegate(els.phases, "click", "[data-phase]", (_, btn) => {
    hub.phase = btn.dataset.phase;
    render();
  });

  qsa("[data-tab]").forEach((btn) => btn.addEventListener("click", () => switchTab(btn.dataset.tab)));

  els.search.addEventListener("input", () => {
    hub.query = els.search.value.trim();
    qs("#search-clear-btn").hidden = !hub.query;
    render();
  });

  qs("#search-clear-btn").addEventListener("click", () => {
    els.search.value = "";
    hub.query = "";
    qs("#search-clear-btn").hidden = true;
    els.search.focus();
    render();
  });

  els.sort.addEventListener("change", () => { hub.sortBy = els.sort.value; renderDocs(); });

  qsa("[data-view-mode]").forEach((btn) => btn.addEventListener("click", () => {
    setViewMode(btn.dataset.viewMode);
    qsa("[data-view-mode]").forEach((b) => b.classList.toggle("active", b.dataset.viewMode === state.viewMode));
    renderDocs();
  }));

  const filters = { "filter-favorite": "favorite", "filter-completed": "completed", "filter-uncompleted": "uncompleted" };
  Object.entries(filters).forEach(([id, key]) => {
    qs(`#${id}`).addEventListener("change", (event) => {
      hub[key] = event.target.checked;
      // "Đã đọc" và "Chưa đọc" loại trừ nhau.
      if (key === "completed" && event.target.checked) { hub.uncompleted = false; qs("#filter-uncompleted").checked = false; }
      if (key === "uncompleted" && event.target.checked) { hub.completed = false; qs("#filter-completed").checked = false; }
      renderDocs();
    });
  });

  qs("#btn-reset-filters").addEventListener("click", () => {
    Object.assign(hub, { category: "all", phase: "all", query: "", sortBy: "default", favorite: false, completed: false, uncompleted: false });
    els.search.value = "";
    els.sort.value = "default";
    qs("#search-clear-btn").hidden = true;
    Object.keys(filters).forEach((id) => { qs(`#${id}`).checked = false; });
    render();
    showToast("Đã đặt lại bộ lọc.");
  });

  delegate(els.docs, "click", "[data-toggle-star]", (event, btn) => {
    event.preventDefault();
    const id = btn.closest("[data-doc-id]").dataset.docId;
    const on = toggleFavorite(id);
    btn.classList.toggle("starred", on);
    btn.textContent = on ? "★" : "☆";
    if (hub.favorite) renderDocs();
  });

  delegate(els.docs, "click", "[data-toggle-done]", (event, btn) => {
    event.preventDefault();
    const id = btn.closest("[data-doc-id]").dataset.docId;
    const on = toggleCompleted(id);
    btn.classList.toggle("completed", on);
    btn.textContent = on ? "✓" : "○";
    renderStats();
    if (hub.completed || hub.uncompleted) renderDocs();
  });

  delegate(els.docs, "click", "[data-quiz-jump]", (event, btn) => {
    event.preventDefault();
    hub.quizScope = btn.dataset.quizJump;
    switchTab("quizzes");
    window.scrollTo({ top: 0, behavior: "smooth" });
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
    categories: qs("#category-container"),
    phaseBlock: qs("#phase-filter-block"),
    phases: qs("#phase-pills-container"),
    stats: qs("#hub-stats"),
    toolbar: qs("#main-toolbar"),
    docs: qs("#docs-container"),
    phasesView: qs("#phases-view"),
    quizView: qs("#quiz-view"),
    resultsCounter: qs("#results-counter"),
    search: qs("#search-input"),
    sort: qs("#sort-select"),
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
  qs("#hub-tagline").textContent = hub.section.tagline;
  qs("#hub-icon").textContent = hub.section.icon;
  document.documentElement.style.setProperty("--section-color", hub.section.color);

  els.search.value = hub.query;
  qs("#search-clear-btn").hidden = !hub.query;
  qsa("[data-view-mode]").forEach((b) => b.classList.toggle("active", b.dataset.viewMode === state.viewMode));

  // Ẩn tab Lộ trình nếu mảng không khai báo phaseDetails.
  qs('[data-tab="phases"]').hidden = hub.section.phaseDetails.length === 0;

  await loadQuizBank(hub.section.id);

  bindEvents();
  switchTab("docs");
  initBackToTop();
});
