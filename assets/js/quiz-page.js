"use strict";
// Quản lý trang quiz.html:
// - Hiển thị danh sách các bài có trắc nghiệm
// - Chuyển sang màn hình làm bài khi chọn bài
// - Chấm điểm, kiểm tra đúng/sai, lọc câu hỏi và xem giải thích

function initQuizPage() {
  initTheme();
  initBackToTop();

  const root = qs("#quiz-root");
  if (!root) return;

  function handleRoute() {
    const params = new URLSearchParams(window.location.search);
    const docId = params.get("id");

    if (docId) {
      openQuizPlayer(docId);
    } else {
      openQuizList();
    }
  }

  window.addEventListener("popstate", handleRoute);
  handleRoute();
}

const getDocs = () => (typeof ALL_DOCUMENTS !== "undefined" ? ALL_DOCUMENTS : (typeof DOCUMENTS !== "undefined" ? DOCUMENTS : []));
const getSections = () => (typeof ALL_SECTIONS !== "undefined" ? ALL_SECTIONS : (typeof SECTIONS !== "undefined" ? SECTIONS : []));

/**
 * Hiển thị danh sách tất cả các bài có câu hỏi quiz
 */
function openQuizList() {
  const root = qs("#quiz-root");
  if (!root) return;

  const docsWithQuiz = getDocs().filter((d) => (d.questions || 0) > 0);

  if (!docsWithQuiz.length) {
    root.innerHTML = emptyState(
      "📝",
      "Chưa có bài tập trắc nghiệm nào",
      "Hiện tại hệ thống đang cập nhật ngân hàng câu hỏi. Vui lòng quay lại sau!",
      '<a href="index.html" class="btn-primary no-underline mt-4 inline-block">← Về trang chủ</a>'
    );
    return;
  }

  // Tải ngầm quiz bank của các section liên quan để tính điểm đã làm
  const sectionIds = [...new Set(docsWithQuiz.map((d) => d.section))];
  Promise.all(sectionIds.map(loadQuizBank)).then(() => {
    // Cập nhật lại các badge điểm khi tải xong
    docsWithQuiz.forEach((d) => {
      const badge = qs(`[data-quiz-list-score="${attr(d.id)}"]`);
      if (badge) {
        const sc = scoreOf(d.id);
        badge.innerHTML = sc.answered > 0
          ? `<span class="text-indigo-600 dark:text-indigo-400 font-bold">Đã làm: ${sc.correct}/${sc.total} (${sc.pct}%)</span>`
          : `<span class="text-slate-400 dark:text-slate-500">Chưa làm</span>`;
      }
    });
  });

  const sectionTabs = [
    { id: "all", name: "Tất cả" },
    ...getSections().filter((s) => docsWithQuiz.some((d) => d.section === s.id))
  ];

  let currentSection = "all";
  let searchQuery = "";

  function renderCards() {
    const query = searchQuery.trim().toLowerCase();
    const filtered = docsWithQuiz.filter((d) => {
      const matchSec = currentSection === "all" || d.section === currentSection;
      const matchQ = !query ||
        d.title.toLowerCase().includes(query) ||
        (d.description || "").toLowerCase().includes(query) ||
        (d.phase || "").toLowerCase().includes(query) ||
        (d.tags || []).some((t) => t.toLowerCase().includes(query));
      return matchSec && matchQ;
    });

    const listEl = qs("#quiz-list-items");
    if (!listEl) return;

    if (!filtered.length) {
      listEl.innerHTML = emptyState("🔍", "Không tìm thấy bài quiz phù hợp", "Thử đổi từ khoá hoặc chọn mảng công nghệ khác.");
      return;
    }

    listEl.innerHTML = filtered.map((doc) => {
      const sec = getSections().find((s) => s.id === doc.section);
      const cat = (sec?.categories || []).find((c) => c.id === doc.category);
      const sc = scoreOf(doc.id);

      const scoreText = sc.answered > 0
        ? `<span class="text-indigo-600 dark:text-indigo-400 font-bold">Đã làm: ${sc.correct}/${sc.total} (${sc.pct}%)</span>`
        : `<span class="text-slate-400 dark:text-slate-500">Chưa làm</span>`;

      return `<div class="quiz-item-card p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-sm hover:shadow-md hover:border-indigo-400 dark:hover:border-indigo-600 transition-all cursor-pointer flex flex-col justify-between gap-4 group"
                   data-doc-id="${attr(doc.id)}">
        <div>
          <div class="flex items-center justify-between gap-2 mb-2.5 flex-wrap">
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50">
                ${escapeHtml(sec?.name || doc.section)}
              </span>
              ${cat ? `<span class="text-xs font-medium text-slate-500 dark:text-slate-400">${escapeHtml(cat.name)}</span>` : ""}
            </div>
            ${doc.phase ? `<span class="text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800/40">${escapeHtml(doc.phase)}</span>` : ""}
          </div>

          <h3 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 mb-1.5">
            ${escapeHtml(doc.title)}
          </h3>
          <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
            ${escapeHtml(doc.description || "Bài tập trắc nghiệm chọn lọc rèn luyện kỹ năng.")}
          </p>
        </div>

        <div class="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700/60 text-xs text-slate-500 dark:text-slate-400">
          <div class="flex items-center gap-3">
            <span class="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <span>📝</span> <span>${escapeHtml(doc.questions)} câu hỏi</span>
            </span>
            <span class="hidden sm:inline">•</span>
            <span data-quiz-list-score="${attr(doc.id)}" class="hidden sm:inline">${scoreText}</span>
          </div>
          <button class="px-3 py-1.5 rounded-xl font-bold text-xs bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
            Làm bài ➔
          </button>
        </div>
      </div>`;
    }).join("");
  }

  root.innerHTML = `
    <div class="quiz-list-view">
      <div class="quiz-list-hero text-center py-6 sm:py-8 mb-6">
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50 mb-3">
          🎯 HỆ THỐNG LUYỆN TẬP TRẮC NGHIỆM
        </div>
        <h1 class="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
          Ngân Hàng Câu Hỏi &amp; Đề Thi Thử
        </h1>
        <p class="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Chọn một bài học bên dưới để bắt đầu làm bài trắc nghiệm. Sau khi nộp bài, hệ thống sẽ tự động chấm điểm và cung cấp phần giải thích chi tiết cho từng câu hỏi.
        </p>
      </div>

      <!-- Thanh công cụ tìm kiếm và lọc mảng -->
      <div class="quiz-search-toolbar bg-white dark:bg-slate-800/90 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm mb-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div class="relative flex-1 max-w-md">
          <input type="text" id="quiz-search-input"
                 placeholder="Tìm kiếm bài trắc nghiệm theo từ khoá, chuyên mục..."
                 class="w-full pl-9 pr-4 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <span class="absolute left-3 top-2.5 text-slate-400 text-sm">🔍</span>
        </div>

        <div class="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          ${sectionTabs.map((sec) => `
            <button class="quiz-section-tab px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${sec.id === currentSection ? "bg-indigo-600 text-white shadow-sm" : "bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"}"
                    data-section-id="${attr(sec.id)}">
              ${escapeHtml(sec.name)}
            </button>
          `).join("")}
        </div>
      </div>

      <div id="quiz-list-items" class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6"></div>
    </div>
  `;

  renderCards();

  // Bắt sự kiện tìm kiếm
  const searchInput = qs("#quiz-search-input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value;
      renderCards();
    });
  }

  // Bắt sự kiện chuyển tab mảng
  delegate(root, "click", ".quiz-section-tab", (e, btn) => {
    currentSection = btn.dataset.sectionId;
    qsa(".quiz-section-tab", root).forEach((t) => {
      const active = t === btn;
      t.className = `quiz-section-tab px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${active ? "bg-indigo-600 text-white shadow-sm" : "bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"}`;
    });
    renderCards();
  });

  // Bắt sự kiện click vào thẻ bài quiz để chuyển sang màn hình làm bài
  delegate(root, "click", ".quiz-item-card", (e, card) => {
    const docId = card.dataset.docId;
    if (!docId) return;
    history.pushState(null, "", `?id=${encodeURIComponent(docId)}`);
    openQuizPlayer(docId);
  });
}

/**
 * Mở giao diện làm bài thi trắc nghiệm cho một bài cụ thể
 */
function openQuizPlayer(docId) {
  const root = qs("#quiz-root");
  if (!root) return;

  const doc = getDocs().find((d) => d.id === docId);
  if (!doc) {
    root.innerHTML = emptyState("⚠️", "Không tìm thấy bài viết", "Bài viết không tồn tại hoặc đã bị xoá.", '<button class="btn-primary mt-4" id="btn-back-quiz-list">← Quay lại danh sách</button>');
    const btn = qs("#btn-back-quiz-list");
    if (btn) btn.onclick = () => { history.pushState(null, "", "quiz.html"); openQuizList(); };
    return;
  }

  // Hiện skeleton loading trong lúc tải bank
  root.innerHTML = `<div class="py-12 text-center text-slate-500 dark:text-slate-400">
    <div class="text-3xl mb-3 animate-spin">⏳</div>
    <div class="text-base font-semibold">Đang nạp ngân hàng câu hỏi...</div>
  </div>`;

  loadQuizBank(doc.section).then((ok) => {
    const bank = QUIZ_BANK[docId];
    if (!ok || !bank || !bank.quizzes || !bank.quizzes.length) {
      root.innerHTML = emptyState(
        "📝",
        "Chưa có câu hỏi trắc nghiệm",
        `Bài viết "${doc.title}" chưa có bộ câu hỏi đi kèm.`,
        '<button class="btn-primary mt-4" id="btn-back-quiz-list">← Quay lại danh sách</button>'
      );
      const btn = qs("#btn-back-quiz-list");
      if (btn) btn.onclick = () => { history.pushState(null, "", "quiz.html"); openQuizList(); };
      return;
    }

    renderPlayer(doc, bank);
  });

  function renderPlayer(doc, bank) {
    const sec = getSections().find((s) => s.id === doc.section);
    const cat = (sec?.categories || []).find((c) => c.id === doc.category);
    const score = scoreOf(docId);

    const total = bank.quizzes.length;
    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;

    bank.quizzes.forEach((q) => {
      const qKey = qKeyOf(docId, q.number);
      if (!isChecked(qKey)) unansweredCount++;
      else if (isCorrect(qKey, q)) correctCount++;
      else wrongCount++;
    });

    const theoryUrl = `reader.html?s=${encodeURIComponent(doc.section)}&d=${encodeURIComponent(`${doc.category}/${doc.slug}`)}`;

    root.innerHTML = `
      <div class="quiz-player-container" data-quiz-scope="${attr(docId)}">
        <!-- Thanh điều hướng đầu trang -->
        <div class="flex items-center justify-between gap-4 mb-2 flex-wrap">
          <button class="btn-back-quiz inline-flex items-center gap-1.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  id="btn-back-list-top">
            <span>‹</span> <span>Quay lại danh sách bài Quiz</span>
          </button>
          <a href="${attr(theoryUrl)}" target="_blank" rel="noopener" class="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
            <span>📖 Đọc lại lý thuyết</span> <span>↗</span>
          </a>
        </div>

        <!-- Header bài quiz -->
        <div class="quiz-dashboard-header">
          <div class="quiz-meta-info">
            <div class="flex items-center gap-2 mb-1.5 flex-wrap">
              <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50">
                ${escapeHtml(sec?.name || doc.section)}
              </span>
              ${cat ? `<span class="text-xs font-medium text-slate-500 dark:text-slate-400">${escapeHtml(cat.name)}</span>` : ""}
              ${doc.phase ? `<span class="text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800/40">${escapeHtml(doc.phase)}</span>` : ""}
            </div>
            <h2>${escapeHtml(bank.title || doc.title)}</h2>
            <p>Chọn đáp án cho từng câu hỏi, sau đó bấm Kiểm tra hoặc Chấm toàn bộ để xem lời giải chi tiết.</p>
          </div>

          <div class="quiz-actions-toolbar">
            <div class="quiz-score-badge" data-quiz-score>
              Kết quả: <b>${score.correct}</b> / ${score.total} (${score.pct}%)
            </div>
            <button class="btn-quiz-secondary" type="button" data-quiz-reset>
              🔄 Làm lại
            </button>
            <button class="btn-quiz-primary" type="button" data-quiz-submit>
              📝 Chấm toàn bộ
            </button>
          </div>
        </div>

        <!-- Bộ lọc tab câu hỏi -->
        <div class="quiz-filter-bar">
          <button class="quiz-tab-pill active" type="button" data-quiz-filter="all">
            Tất cả (<span data-count-all>${total}</span>)
          </button>
          <button class="quiz-tab-pill" type="button" data-quiz-filter="correct">
            Câu đúng (<span data-count-correct>${correctCount}</span>)
          </button>
          <button class="quiz-tab-pill" type="button" data-quiz-filter="wrong">
            Câu sai (<span data-count-wrong>${wrongCount}</span>)
          </button>
          <button class="quiz-tab-pill" type="button" data-quiz-filter="unanswered">
            Chưa làm (<span data-count-unanswered>${unansweredCount}</span>)
          </button>
        </div>

        <!-- Danh sách thẻ câu hỏi -->
        <div class="quiz-cards-wrapper flex flex-col gap-6">
          ${bank.quizzes.map((q) => renderQuestionCard(docId, q)).join("")}
        </div>

        <!-- Thanh hành động cuối bài -->
        <div class="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
          <button class="btn-back-quiz text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  id="btn-back-list-bottom">
            ‹ Quay lại danh sách bài Quiz
          </button>
          <div class="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button class="btn-quiz-secondary flex-1 sm:flex-initial" type="button" data-quiz-reset>
              🔄 Làm lại bài này
            </button>
            <button class="btn-quiz-primary flex-1 sm:flex-initial" type="button" data-quiz-submit>
              📝 Nộp bài &amp; Chấm điểm
            </button>
          </div>
        </div>
      </div>
    `;

    window.scrollTo({ top: 0, behavior: "smooth" });

    // Gắn sự kiện nút quay lại danh sách
    const backBtnTop = qs("#btn-back-list-top");
    if (backBtnTop) backBtnTop.onclick = () => { history.pushState(null, "", "quiz.html"); openQuizList(); };
    const backBtnBottom = qs("#btn-back-list-bottom");
    if (backBtnBottom) backBtnBottom.onclick = () => { history.pushState(null, "", "quiz.html"); openQuizList(); };

    // Gắn toàn bộ sự kiện chọn đáp án, chấm điểm, lọc tab
    bindQuiz(root, () => renderPlayer(doc, bank));
  }
}

document.addEventListener("DOMContentLoaded", initQuizPage);
