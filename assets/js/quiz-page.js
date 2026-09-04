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
    const isPreview = params.get("preview") === "1";
    const docId = params.get("id");

    if (isPreview) {
      openQuizPreview();
    } else if (docId) {
      openQuizPlayer(docId);
    } else {
      openQuizList();
    }
  }

  window.addEventListener("popstate", handleRoute);
  handleRoute();
}

/**
 * Mở giao diện thi thử trực tiếp từ dữ liệu Admin vừa upload / soạn
 */
function openQuizPreview() {
  const root = qs("#quiz-root");
  if (!root) return;
  setNavSearchVisible(false);

  try {
    const raw = sessionStorage.getItem("blog.quiz.preview");
    if (!raw) {
      root.innerHTML = emptyState(
        "⚠️",
        "Không tìm thấy dữ liệu thi thử",
        "Dữ liệu thi thử chưa được tạo hoặc đã hết hạn phiên làm việc. Vui lòng quay lại trang Quản lý Quiz trong Admin.",
        '<a class="btn-primary mt-4 no-underline inline-block" href="admin.html">← Về trang Admin</a>'
      );
      return;
    }

    const data = JSON.parse(raw);
    const docId = data.docId || "preview/quiz";
    const docs = getDocs();
    const linkedDoc = docs.find((d) => d.id === docId);

    const doc = linkedDoc || {
      id: docId,
      title: data.title || "Bài thi trắc nghiệm xem thử",
      section: "preview",
      category: "quiz",
      slug: "preview",
      questions: data.quizzes?.length || 0,
      readingMinutes: Math.max(1, Math.round((data.quizzes?.length || 5) * 1.5))
    };

    const bank = {
      docId: doc.id,
      title: data.title || doc.title,
      quizzes: data.quizzes || []
    };

    QUIZ_BANK[doc.id] = bank;
    renderPlayer(doc, bank, true);
  } catch (err) {
    root.innerHTML = emptyState("⚠️", "Lỗi đọc dữ liệu thi thử", escapeHtml(err.message), '<a class="btn-primary mt-4 no-underline inline-block" href="admin.html">← Về trang Admin</a>');
  }
}

/**
 * Ô tìm kiếm nằm trên navbar nên chỉ có nghĩa ở màn hình danh sách — vào làm
 * bài thì ẩn đi để tránh gõ vào một bộ lọc không còn hiển thị.
 */
let _tagNavResizeHandler = null;

function setNavSearchVisible(visible) {
  const box = qs("#nav-quiz-search");
  if (box) box.classList.toggle("hidden", !visible);
}

const getDocs = () => (typeof ALL_DOCUMENTS !== "undefined" ? ALL_DOCUMENTS : (typeof DOCUMENTS !== "undefined" ? DOCUMENTS : []));
const getSections = () => (typeof ALL_SECTIONS !== "undefined" ? ALL_SECTIONS : (typeof SECTIONS !== "undefined" ? SECTIONS : []));

/**
 * Hiển thị danh sách tất cả các bài có câu hỏi quiz
 */
function openQuizList() {
  const root = qs("#quiz-root");
  if (!root) return;

  const searchInput = qs("#quiz-search-input");
  setNavSearchVisible(true);

  const docsWithQuiz = getDocs().filter((d) => (d.questions || 0) > 0);

  if (!docsWithQuiz.length) {
    setNavSearchVisible(false);
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

  // Tag của bộ đề nằm trong file .quiz.json, build gắn vào catalog thành
  // doc.quizTags. Xếp theo số bài dùng tag đó giảm dần cho carousel.
  const tagCounts = new Map();
  docsWithQuiz.forEach((d) => {
    (d.quizTags || []).forEach((t) => {
      const clean = String(t).trim();
      if (!clean) return;
      const lower = clean.toLowerCase();
      const cur = tagCounts.get(lower) || { name: clean, count: 0 };
      cur.count++;
      tagCounts.set(lower, cur);
    });
  });
  const allTags = Array.from(tagCounts.values()).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  let currentSection = "all";
  let currentTag = "";   // "" = tất cả tag
  let searchQuery = searchInput?.value || "";

  function renderCards() {
    const query = searchQuery.trim().toLowerCase();
    const filtered = docsWithQuiz.filter((d) => {
      const matchSec = currentSection === "all" || d.section === currentSection;
      const matchTag = !currentTag ||
        (d.quizTags || []).some((t) => t.toLowerCase() === currentTag);
      const matchQ = !query ||
        d.title.toLowerCase().includes(query) ||
        (d.description || "").toLowerCase().includes(query) ||
        (d.phase || "").toLowerCase().includes(query) ||
        (d.quizTags || []).some((t) => t.toLowerCase().includes(query)) ||
        (d.tags || []).some((t) => t.toLowerCase().includes(query));
      return matchSec && matchTag && matchQ;
    });

    const listEl = qs("#quiz-list-items");
    if (!listEl) return;

    if (!filtered.length) {
      listEl.innerHTML = emptyState("🔍", "Không tìm thấy bài quiz phù hợp", "Thử đổi từ khoá, bỏ bớt tag hoặc chọn mảng công nghệ khác.");
      return;
    }

    listEl.innerHTML = filtered.map((doc) => {
      const sec = getSections().find((s) => s.id === doc.section);
      const cat = (sec?.categories || []).find((c) => c.id === doc.category);
      const sc = scoreOf(doc.id);

      const tagChips = (doc.quizTags || []).slice(0, 3).map((t) =>
        `<button type="button" class="quiz-tag-chip" data-tag-pick="${attr(t.toLowerCase())}">#${escapeHtml(t)}</button>`
      ).join("");

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
          ${tagChips ? `<div class="flex items-center gap-1.5 flex-wrap mt-2.5">${tagChips}</div>` : ""}
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

      <!-- Thanh lọc: mảng công nghệ + carousel tag (ô tìm kiếm đã nằm trên nav) -->
      <div class="quiz-search-toolbar bg-white dark:bg-slate-800/90 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm mb-8 flex flex-col gap-3">
        <div class="flex items-center gap-1.5 overflow-x-auto pb-1">
          ${sectionTabs.map((sec) => `
            <button class="quiz-section-tab px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${sec.id === currentSection ? "bg-indigo-600 text-white shadow-sm" : "bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"}"
                    data-section-id="${attr(sec.id)}">
              ${escapeHtml(sec.name)}
            </button>
          `).join("")}
        </div>

        ${allTags.length ? `
        <div class="quiz-tag-carousel pt-3 border-t border-slate-100 dark:border-slate-700/60" id="quiz-tag-carousel">
          <div class="flex items-center gap-2">
            <button type="button" class="quiz-tag-nav" data-tag-scroll="-1" aria-label="Xem tag phía trước" hidden>‹</button>
            <div class="quiz-tag-track" id="quiz-tag-track" role="group" aria-label="Lọc bài quiz theo tag">
              <button type="button" class="quiz-tag-pill is-active" data-tag-filter="">
                Tất cả tag
              </button>
              ${allTags.map((t) => `
                <button type="button" class="quiz-tag-pill" data-tag-filter="${attr(t.name.toLowerCase())}">
                  #${escapeHtml(t.name)} <span class="quiz-tag-count">${t.count}</span>
                </button>
              `).join("")}
            </div>
            <button type="button" class="quiz-tag-nav" data-tag-scroll="1" aria-label="Xem tag tiếp theo" hidden>›</button>
          </div>
        </div>` : ""}
      </div>

      <div id="quiz-list-items" class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6"></div>
    </div>
  `;

  renderCards();

  // Ô tìm kiếm nằm ngoài #quiz-root nên không bị render lại — gán thẳng
  // handler (không addEventListener) để quay lại danh sách không chồng listener.
  if (searchInput) {
    searchInput.oninput = () => {
      searchQuery = searchInput.value;
      renderCards();
    };
  }

  /* ------------------------------------------------ carousel lọc theo tag */

  const tagTrack = qs("#quiz-tag-track", root);

  /** Ẩn / hiện hai nút mũi tên tuỳ theo còn chỗ để cuộn hay không. */
  function updateTagNav() {
    if (!tagTrack) return;
    const max = tagTrack.scrollWidth - tagTrack.clientWidth;
    const overflow = max > 4;
    qsa("[data-tag-scroll]", root).forEach((btn) => {
      const dir = Number(btn.dataset.tagScroll);
      btn.hidden = !overflow;
      btn.disabled = dir < 0 ? tagTrack.scrollLeft <= 2 : tagTrack.scrollLeft >= max - 2;
    });
  }

  if (tagTrack) {
    tagTrack.addEventListener("scroll", updateTagNav, { passive: true });
    // Mỗi lần quay lại danh sách là một closure mới — gỡ handler cũ để không
    // tích tụ listener trỏ vào DOM đã bị thay.
    if (_tagNavResizeHandler) window.removeEventListener("resize", _tagNavResizeHandler);
    _tagNavResizeHandler = updateTagNav;
    window.addEventListener("resize", _tagNavResizeHandler);
    updateTagNav();
  }

  // Cuộn mượt tự cài bằng requestAnimationFrame: scrollTo({behavior:"smooth"})
  // bị vô hiệu trong vài trình duyệt nhúng, nút bấm khi đó không nhúc nhích.
  let tagScrollAnim = 0;
  function animateTagScroll(target) {
    if (!tagTrack) return;
    cancelAnimationFrame(tagScrollAnim);
    const from = tagTrack.scrollLeft;
    const delta = target - from;
    if (!delta) return;
    const started = performance.now();
    const DURATION = 260;
    const step = (now) => {
      const t = Math.min(1, (now - started) / DURATION);
      const eased = 1 - Math.pow(1 - t, 3);
      tagTrack.scrollLeft = from + delta * eased;
      if (t < 1) tagScrollAnim = requestAnimationFrame(step);
      else updateTagNav();
    };
    tagScrollAnim = requestAnimationFrame(step);
  }

  delegate(root, "click", "[data-tag-scroll]", (e, btn) => {
    if (!tagTrack) return;
    const step = Math.max(160, Math.round(tagTrack.clientWidth * 0.8));
    const max = tagTrack.scrollWidth - tagTrack.clientWidth;
    const target = Math.max(0, Math.min(max, tagTrack.scrollLeft + step * Number(btn.dataset.tagScroll)));
    animateTagScroll(target);
  });

  /** Chọn một tag (bấm lại tag đang chọn thì bỏ lọc). */
  function selectTag(tag) {
    currentTag = currentTag === tag ? "" : tag;
    qsa(".quiz-tag-pill", root).forEach((pill) => {
      pill.classList.toggle("is-active", pill.dataset.tagFilter === currentTag);
    });
    renderCards();
  }

  delegate(root, "click", ".quiz-tag-pill", (e, pill) => selectTag(pill.dataset.tagFilter));

  // Bấm tag ngay trên thẻ bài quiz cũng lọc theo tag đó. Handler này được gắn
  // TRƯỚC handler mở bài, nên stopImmediatePropagation chặn được việc vào thi.
  delegate(root, "click", "[data-tag-pick]", (e, chip) => {
    e.stopImmediatePropagation();
    selectTag(chip.dataset.tagPick);
    const active = qsa(".quiz-tag-pill", root).find((p) => p.dataset.tagFilter === currentTag);
    if (active && tagTrack) {
      const offset = active.offsetLeft - (tagTrack.clientWidth - active.offsetWidth) / 2;
      animateTagScroll(Math.max(0, Math.min(tagTrack.scrollWidth - tagTrack.clientWidth, offset)));
    }
  });

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
  setNavSearchVisible(false);

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

    renderPlayer(doc, bank, false);
  });
}

function renderPlayer(doc, bank, isPreview = false) {
  const root = qs("#quiz-root");
  if (!root) return;

  const docId = doc.id;
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

  const hasTheory = doc.section && doc.category && doc.slug && doc.section !== "preview";
  const theoryUrl = hasTheory
    ? `reader.html?s=${encodeURIComponent(doc.section)}&d=${encodeURIComponent(`${doc.category}/${doc.slug}`)}`
    : "#";

  const previewBannerHtml = isPreview
    ? `<div class="mb-5 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300/80 dark:border-amber-700/60 flex items-center justify-between gap-3 text-xs shadow-sm flex-wrap">
        <div class="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold">
          <span class="text-base">👁</span>
          <span><b>Chế độ Thi Thử (Live Exam Preview)</b>: Bạn đang trải nghiệm giao diện thi thực tế từ dữ liệu vừa soạn/upload trong Admin. Mọi tính năng chấm điểm và giải thích đều hoạt động thực tế.</span>
        </div>
        <a href="admin.html?view=quiz" class="px-3.5 py-1.5 rounded-xl bg-amber-500 text-white font-bold no-underline hover:bg-amber-600 transition-colors">
          ← Về Quản Lý Quiz
        </a>
      </div>`
    : "";

  const backLabel = isPreview ? "‹ Quay lại Quản lý Quiz" : "‹ Quay lại danh sách bài Quiz";

  root.innerHTML = `
    <div class="quiz-player-container" data-quiz-scope="${attr(docId)}">
      ${previewBannerHtml}

      <!-- Thanh điều hướng đầu trang -->
      <div class="flex items-center justify-between gap-4 mb-2 flex-wrap">
        <button class="btn-back-quiz inline-flex items-center gap-1.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                id="btn-back-list-top">
          <span>${escapeHtml(backLabel)}</span>
        </button>
        ${hasTheory ? `
          <a href="${attr(theoryUrl)}" target="_blank" rel="noopener" class="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
            <span>📖 Đọc lại lý thuyết</span> <span>↗</span>
          </a>
        ` : ""}
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
          ${escapeHtml(backLabel)}
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

  const handleBack = () => {
    if (isPreview) {
      window.location.href = "admin.html?view=quiz";
    } else {
      history.pushState(null, "", "quiz.html");
      openQuizList();
    }
  };

  const backBtnTop = qs("#btn-back-list-top");
  if (backBtnTop) backBtnTop.onclick = handleBack;
  const backBtnBottom = qs("#btn-back-list-bottom");
  if (backBtnBottom) backBtnBottom.onclick = handleBack;

  // Gắn toàn bộ sự kiện chọn đáp án, chấm điểm, lọc tab
  bindQuiz(root, () => renderPlayer(doc, bank, isPreview));
}

document.addEventListener("DOMContentLoaded", initQuizPage);
