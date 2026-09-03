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
  let meta = docs.length ? `${docs.length} bài viết` : "Sắp có nội dung";
  let progressBadge = "";

  if (docs.length > 0 && completedCount > 0) {
    const pct = Math.round((completedCount / docs.length) * 100);
    progressBadge = `<span class="section-card-progress inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">✓ ${completedCount}/${docs.length} (${pct}%)</span>`;
  }

  return `<a class="section-card ${docs.length ? "" : "is-empty"} group relative flex flex-col justify-between p-6 rounded-2xl backdrop-blur-md bg-white/90 dark:bg-slate-800/85 border border-slate-200/90 dark:border-slate-700/70 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all no-underline" href="${attr(hubUrl(section.id))}"
       style="--section-color: ${attr(section.color)}">
    <div class="section-card-header flex items-start justify-between gap-3 mb-2">
      <h3 class="section-card-name text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors m-0">${escapeHtml(section.name)}</h3>
      ${progressBadge}
    </div>
    <p class="section-card-tagline text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mb-4 leading-relaxed">${escapeHtml(section.tagline)}</p>
    <div class="section-card-meta flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700/60 text-xs font-semibold text-slate-500 dark:text-slate-400">
      <span>${escapeHtml(meta)}</span>
      <span class="text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform">Khám phá ➔</span>
    </div>
  </a>`;
}

function featuredDocCard(doc) {
  const section = getSection(doc.section);
  const isCompleted = isDocCompleted(doc.id);
  const sectionColor = section?.color || "#6366f1";

  const completedBadge = isCompleted
    ? `<span class="inline-flex items-center gap-1 text-[0.7rem] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">✓ Đã học</span>`
    : "";

  const quizBadge = doc.questions > 0
    ? `<span class="inline-flex items-center gap-1 text-[0.7rem] font-extrabold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60">🎯 ${doc.questions} quiz</span>`
    : "";

  const tagsHtml = (doc.tags || []).slice(0, 2).map((tag) =>
    `<span class="text-[0.68rem] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300">#${escapeHtml(tag)}</span>`
  ).join("");

  return `
    <a href="${attr(readerUrl(doc))}" class="featured-card group relative flex-none w-[285px] sm:w-[325px] md:w-[350px] snap-start flex flex-col justify-between p-5 sm:p-6 rounded-2xl backdrop-blur-md bg-white/95 dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700/80 hover:border-indigo-500/60 dark:hover:border-indigo-500/60 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all no-underline overflow-hidden">
      <div class="absolute top-0 left-0 right-0 h-1" style="background: ${attr(sectionColor)}"></div>
      
      <div>
        <div class="flex items-center justify-between gap-2 mb-3">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="inline-flex items-center text-xs font-black px-2.5 py-0.5 rounded-full" style="background: ${attr(sectionColor)}18; color: ${attr(sectionColor)}; border: 1px solid ${attr(sectionColor)}33">
              ${escapeHtml(section?.name || doc.section)}
            </span>
            <span class="inline-flex items-center gap-1 text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
              ⭐ Nổi bật
            </span>
            ${quizBadge}
            ${completedBadge}
          </div>
          <span class="text-xs font-medium text-slate-400 dark:text-slate-500 whitespace-nowrap">⏱️ ~${doc.readingMinutes}p</span>
        </div>

        <h3 class="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 mb-2 leading-snug">
          ${escapeHtml(doc.title)}
        </h3>

        <p class="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed mb-4">
          ${escapeHtml(doc.description)}
        </p>
      </div>

      <div class="pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2 mt-auto">
        <div class="flex items-center gap-1.5 flex-wrap">
          ${completedBadge}
          ${tagsHtml}
        </div>
        <span class="text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform whitespace-nowrap">
          Đọc ngay ➔
        </span>
      </div>
    </a>
  `;
}

function renderFeaturedSection() {
  const root = qs("#featured-root");
  if (!root) return;

  const docs = typeof featuredDocs === "function" ? featuredDocs(8) : [];
  if (!docs.length) {
    root.hidden = true;
    return;
  }

  root.hidden = false;
  root.innerHTML = `
    <div class="flex items-center justify-between gap-4 mb-4">
      <h2 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight m-0">
        Bài Viết Nổi Bật Dành Cho Bạn
      </h2>
      <div class="carousel-nav flex items-center gap-2" id="featured-nav">
        <button id="featured-prev" class="featured-carousel-btn rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-sm transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed" aria-label="Bài trước" title="Bài trước">
          ‹
        </button>
        <button id="featured-next" class="featured-carousel-btn rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-sm transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed" aria-label="Bài tiếp" title="Bài tiếp">
          ›
        </button>
      </div>
    </div>
    <div class="featured-carousel-container relative">
      <div id="featured-carousel" class="featured-carousel flex gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory py-2 px-1">
        ${docs.map(featuredDocCard).join("")}
      </div>
    </div>
  `;

  setupFeaturedCarousel();
}

function setupFeaturedCarousel() {
  const carousel = qs("#featured-carousel");
  const prevBtn = qs("#featured-prev");
  const nextBtn = qs("#featured-next");
  const nav = qs("#featured-nav");
  if (!carousel || !prevBtn || !nextBtn) return;

  const updateButtons = () => {
    // Không đủ số lượng item để cuộn (scrollWidth <= clientWidth) -> ẩn 2 nút điều hướng
    const maxScroll = carousel.scrollWidth - carousel.clientWidth;
    const canScroll = maxScroll > 15;
    if (nav) nav.style.display = canScroll ? "flex" : "none";
    prevBtn.disabled = carousel.scrollLeft <= 10;
    nextBtn.disabled = carousel.scrollLeft >= maxScroll - 10;
  };

  prevBtn.addEventListener("click", () => {
    const slide = carousel.querySelector(".featured-card");
    const amount = slide ? slide.offsetWidth + 20 : 340;
    carousel.scrollBy({ left: -amount, behavior: "smooth" });
  });

  nextBtn.addEventListener("click", () => {
    const slide = carousel.querySelector(".featured-card");
    const amount = slide ? slide.offsetWidth + 20 : 340;
    carousel.scrollBy({ left: amount, behavior: "smooth" });
  });

  carousel.addEventListener("scroll", updateButtons, { passive: true });
  window.addEventListener("resize", updateButtons);
  updateButtons();
  requestAnimationFrame(updateButtons);
  setTimeout(updateButtons, 100);
}

function renderLanding() {
  const root = qs("#sections-root");
  updateHeroStats();
  renderFeaturedSection();
  if (!hasCatalog || ALL_SECTIONS.length === 0) {
    root.innerHTML = emptyState("📦", "Chưa có nội dung nào",
      "Tạo content/<mảng>/<chuyên-mục>/bai-viet.md rồi chạy: node build/build.js");
    return;
  }

  root.innerHTML = KIND_GROUPS.map((group) => {
    const sections = ALL_SECTIONS.filter((s) => s.kind === group.kind);
    if (!sections.length) return "";
    return `<section class="section-group mb-10">
      <h2 class="section-group-head text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-400 mb-4 flex items-center gap-2">
        <span>${escapeHtml(group.title)}</span>
        <span class="h-px flex-1 bg-slate-200 dark:bg-slate-800"></span>
      </h2>
      <div class="section-cards grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">${sections.map(sectionCard).join("")}</div>
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

  const quizVal = qs("#hero-quiz-val");
  if (quizVal) {
    const totalQuiz = allDocs.reduce((sum, d) => sum + (d.questions || 0), 0);
    quizVal.textContent = String(totalQuiz);
  }

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

  const showFeaturedSuggestions = () => {
    selectedIdx = -1;
    const fDocs = typeof featuredDocs === "function" ? featuredDocs(4) : [];
    if (!fDocs.length) return;
    panel.innerHTML = `
      <div class="px-3 py-1.5 text-[0.7rem] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1.5">
        <span>⭐</span> Gợi ý bài viết nổi bật
      </div>
      ${fDocs.map((doc) => {
        const section = getSection(doc.section);
        const category = section?.categories?.find((c) => c.id === doc.category);
        return `<a class="search-hit" href="${attr(readerUrl(doc))}">
          <span class="search-hit-body">
            <span class="search-hit-title">${escapeHtml(doc.title)}</span>
            <span class="search-hit-path">${escapeHtml(section?.name || doc.section)} › ${escapeHtml(category?.name || doc.category)}</span>
          </span>
        </a>`;
      }).join("")}
    `;
    panel.classList.add("open");
  };

  input.addEventListener("focus", () => {
    if (input.value.trim().length < 2) showFeaturedSuggestions();
  });

  input.addEventListener("input", () => {
    selectedIdx = -1;
    const query = input.value.trim();
    if (query.length < 2) {
      showFeaturedSuggestions();
      return;
    }
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
