// === KHỞI TẠO STATE & QUẢN LÝ DỮ LIỆU ===
const savedUiState = JSON.parse(sessionStorage.getItem("ocp_ui_state") || "null");

const state = {
  mainTab: savedUiState?.mainTab || "docs", // 'docs' | 'phases' | 'quizzes'
  activeCategory: savedUiState?.activeCategory || "all",
  activePhase: savedUiState?.activePhase || "Tất cả",
  searchQuery: savedUiState?.searchQuery || "",
  sortBy: savedUiState?.sortBy || "default",
  viewMode: localStorage.getItem("ocp_view_mode") || "grid",
  filterFavorite: savedUiState?.filterFavorite || false,
  filterCompleted: savedUiState?.filterCompleted || false,
  filterUncompleted: savedUiState?.filterUncompleted || false,
  favorites: new Set(JSON.parse(localStorage.getItem("ocp_favorites") || "[]")),
  completed: new Set(JSON.parse(localStorage.getItem("ocp_completed") || "[]")),
  currentTheme: localStorage.getItem("ocp_theme") || "light",
  selectedDoc: null,
  isFullscreen: false,
  scrollY: savedUiState?.scrollY || 0,

  // Quiz Engine State
  activeQuizFile: savedUiState?.activeQuizFile || "phase1_java_fundamentals.md",
  userAnswers: {}, // { "q_filename_num": Set(['A', 'B']) }
  checkedQuestions: new Set(), // Set of "q_filename_num"
  quizScores: { correct: 0, total: 0 }
};

function saveUiState() {
  const uiState = {
    mainTab: state.mainTab,
    activeCategory: state.activeCategory,
    activePhase: state.activePhase,
    searchQuery: state.searchQuery,
    sortBy: state.sortBy,
    filterFavorite: state.filterFavorite,
    filterCompleted: state.filterCompleted,
    filterUncompleted: state.filterUncompleted,
    activeQuizFile: state.activeQuizFile,
    scrollY: window.scrollY
  };
  sessionStorage.setItem("ocp_ui_state", JSON.stringify(uiState));
}

// === DOM ELEMENTS ===
const els = {
  tabDocsBtn: document.getElementById("tab-docs-btn"),
  tabPhasesBtn: document.getElementById("tab-phases-btn"),
  tabQuizzesBtn: document.getElementById("tab-quizzes-btn"),
  mainToolbar: document.getElementById("main-toolbar"),
  categoryContainer: document.getElementById("category-container"),
  phaseContainer: document.getElementById("phase-pills-container"),
  docsContainer: document.getElementById("docs-container"),
  phaseExplorerContainer: document.getElementById("phase-explorer-container"),
  quizPlayerContainer: document.getElementById("quiz-player-container"),
  resultsCounter: document.getElementById("results-counter"),
  searchInput: document.getElementById("search-input"),
  searchClearBtn: document.getElementById("search-clear-btn"),
  sortSelect: document.getElementById("sort-select"),
  viewGridBtn: document.getElementById("view-grid-btn"),
  viewListBtn: document.getElementById("view-list-btn"),
  themeToggleBtn: document.getElementById("btn-theme-toggle"),
  resetFiltersBtn: document.getElementById("btn-reset-filters"),
  filterFavoriteCb: document.getElementById("filter-favorite"),
  filterCompletedCb: document.getElementById("filter-completed"),
  filterUncompletedCb: document.getElementById("filter-uncompleted"),
  brandHome: document.getElementById("brand-home"),
  
  // Stats
  statTotalDocs: document.getElementById("stat-total-docs"),
  statTotalQuestions: document.getElementById("stat-total-questions"),
  statTotalLines: document.getElementById("stat-total-lines"),
  statProgressText: document.getElementById("stat-progress-text"),
  statProgressPct: document.getElementById("stat-progress-pct"),
  statProgressBar: document.getElementById("stat-progress-bar"),

  // Quiz Engine DOMs
  quizHeaderTitle: document.getElementById("quiz-header-title"),
  quizHeaderSubtitle: document.getElementById("quiz-header-subtitle"),
  quizScoreNum: document.getElementById("quiz-score-num"),
  quizTotalNum: document.getElementById("quiz-total-num"),
  quizScorePct: document.getElementById("quiz-score-pct"),
  btnResetQuiz: document.getElementById("btn-reset-quiz"),
  btnSubmitAllQuiz: document.getElementById("btn-submit-all-quiz"),
  quizPhaseTabs: document.getElementById("quiz-phase-tabs"),
  quizCardsWrapper: document.getElementById("quiz-cards-wrapper"),

  // Drawer Modal
  drawerBackdrop: document.getElementById("drawer-backdrop"),
  drawerContainer: document.getElementById("drawer-container"),
  drawerTitle: document.getElementById("drawer-title"),
  drawerMetaBadges: document.getElementById("drawer-meta-badges"),
  drawerBody: document.getElementById("drawer-body"),
  drawerNewTabBtn: document.getElementById("drawer-newtab-btn"),
  drawerFullscreenBtn: document.getElementById("drawer-fullscreen-btn"),
  drawerCloseBtn: document.getElementById("drawer-close-btn"),
  drawerStarBtn: document.getElementById("drawer-star-btn"),
  drawerCheckBtn: document.getElementById("drawer-check-btn"),
  drawerCopyBtn: document.getElementById("drawer-copy-btn")
};

// === INITIALIZATION ===
function init() {
  applyTheme(state.currentTheme);
  applyViewMode(state.viewMode);
  
  // Restore form inputs from state
  if (state.searchQuery && els.searchInput) {
    els.searchInput.value = state.searchQuery;
    if (els.searchClearBtn) els.searchClearBtn.style.display = "block";
  }
  if (state.sortBy && els.sortSelect) {
    els.sortSelect.value = state.sortBy;
  }
  if (els.filterFavoriteCb) els.filterFavoriteCb.checked = state.filterFavorite;
  if (els.filterCompletedCb) els.filterCompletedCb.checked = state.filterCompleted;
  if (els.filterUncompletedCb) els.filterUncompletedCb.checked = state.filterUncompleted;

  renderCategories();
  renderPhases();
  updateStats();
  
  // Cleanly switch and initialize the active tab
  switchMainTab(state.mainTab || "docs");
  
  bindEvents();

  // Restore scroll position
  if (state.scrollY > 0) {
    setTimeout(() => {
      window.scrollTo({ top: state.scrollY, behavior: 'instant' });
    }, 60);
  }
}

// === EVENT BINDINGS ===
function bindEvents() {
  // Main Tabs Switching
  els.tabDocsBtn.addEventListener("click", () => switchMainTab("docs"));
  els.tabPhasesBtn.addEventListener("click", () => switchMainTab("phases"));
  els.tabQuizzesBtn.addEventListener("click", () => switchMainTab("quizzes"));

  // Search
  els.searchInput.addEventListener("input", (e) => {
    state.searchQuery = e.target.value.trim().toLowerCase();
    els.searchClearBtn.style.display = state.searchQuery ? "block" : "none";
    renderCurrentView();
  });

  els.searchClearBtn.addEventListener("click", () => {
    els.searchInput.value = "";
    state.searchQuery = "";
    els.searchClearBtn.style.display = "none";
    els.searchInput.focus();
    renderCurrentView();
  });

  // Sort
  els.sortSelect.addEventListener("change", (e) => {
    state.sortBy = e.target.value;
    renderDocs();
  });

  // View Mode
  els.viewGridBtn.addEventListener("click", () => setViewMode("grid"));
  els.viewListBtn.addEventListener("click", () => setViewMode("list"));

  // Theme Toggle
  els.themeToggleBtn.addEventListener("click", toggleTheme);

  // Status Filter Checkboxes
  els.filterFavoriteCb.addEventListener("change", (e) => {
    state.filterFavorite = e.target.checked;
    renderDocs();
  });

  els.filterCompletedCb.addEventListener("change", (e) => {
    state.filterCompleted = e.target.checked;
    if (e.target.checked) els.filterUncompletedCb.checked = false;
    state.filterUncompleted = els.filterUncompletedCb.checked;
    renderDocs();
  });

  els.filterUncompletedCb.addEventListener("change", (e) => {
    state.filterUncompleted = e.target.checked;
    if (e.target.checked) els.filterCompletedCb.checked = false;
    state.filterCompleted = els.filterCompletedCb.checked;
    renderDocs();
  });

  // Reset Filters
  els.resetFiltersBtn.addEventListener("click", resetAllFilters);
  els.brandHome.addEventListener("click", (e) => {
    e.preventDefault();
    resetAllFilters();
  });

  // Quiz Engine Global Buttons
  els.btnResetQuiz.addEventListener("click", resetCurrentQuiz);
  els.btnSubmitAllQuiz.addEventListener("click", submitAllCurrentQuizzes);

  // Drawer events
  els.drawerCloseBtn.addEventListener("click", closeDrawer);
  els.drawerBackdrop.addEventListener("click", closeDrawer);

  els.drawerFullscreenBtn.addEventListener("click", () => {
    state.isFullscreen = !state.isFullscreen;
    els.drawerContainer.classList.toggle("fullscreen", state.isFullscreen);
    els.drawerFullscreenBtn.textContent = state.isFullscreen ? "🗗" : "⛶";
  });

  els.drawerStarBtn.addEventListener("click", () => {
    if (!state.selectedDoc) return;
    toggleStar(state.selectedDoc.id);
    updateDrawerActions();
  });

  els.drawerCheckBtn.addEventListener("click", () => {
    if (!state.selectedDoc) return;
    toggleComplete(state.selectedDoc.id);
    updateDrawerActions();
  });

  els.drawerCopyBtn.addEventListener("click", () => {
    if (!state.selectedDoc) return;
    navigator.clipboard.writeText(state.selectedDoc.fileName);
    showToast(`Đã sao chép tên file: ${state.selectedDoc.fileName}`);
  });

  // Floating Back to Top Button
  const backToTopBtn = document.getElementById("btn-back-to-top");
  if (backToTopBtn) {
    window.addEventListener("scroll", () => {
      state.scrollY = window.scrollY;
      saveUiState();
      if (window.scrollY > 280) {
        backToTopBtn.classList.add("visible");
      } else {
        backToTopBtn.classList.remove("visible");
      }
    }, { passive: true });

    backToTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  } else {
    // Scroll position tracking fallback
    window.addEventListener("scroll", () => {
      state.scrollY = window.scrollY;
      saveUiState();
    }, { passive: true });
  }

  // Handle back-forward cache (bfcache)
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
      const restored = JSON.parse(sessionStorage.getItem("ocp_ui_state") || "null");
      if (restored && restored.scrollY > 0) {
        window.scrollTo({ top: restored.scrollY, behavior: 'instant' });
      }
    }
  });
}

// === TAB SWITCHING ===
function switchMainTab(tab) {
  state.mainTab = tab;
  
  els.tabDocsBtn.classList.toggle("active", tab === "docs");
  els.tabPhasesBtn.classList.toggle("active", tab === "phases");
  els.tabQuizzesBtn.classList.toggle("active", tab === "quizzes");

  if (tab === "docs") {
    els.mainToolbar.style.display = "flex";
    els.docsContainer.style.display = state.viewMode === "grid" ? "grid" : "flex";
    els.phaseExplorerContainer.style.display = "none";
    els.quizPlayerContainer.style.display = "none";
    renderDocs();
  } else if (tab === "phases") {
    els.mainToolbar.style.display = "none";
    els.docsContainer.style.display = "none";
    els.phaseExplorerContainer.style.display = "flex";
    els.quizPlayerContainer.style.display = "none";
    renderPhaseExplorer();
  } else if (tab === "quizzes") {
    els.mainToolbar.style.display = "none";
    els.docsContainer.style.display = "none";
    els.phaseExplorerContainer.style.display = "none";
    els.quizPlayerContainer.style.display = "flex";
    renderQuizPlayer();
  }
}

function renderCurrentView() {
  saveUiState();
  if (state.mainTab === "docs") {
    renderDocs();
  } else if (state.mainTab === "phases") {
    renderPhaseExplorer();
  } else if (state.mainTab === "quizzes") {
    renderQuizPlayer();
  }
}

// === THEME & VIEW MODE ===
function toggleTheme() {
  const newTheme = state.currentTheme === "dark" ? "light" : "dark";
  applyTheme(newTheme);
}

function applyTheme(theme) {
  state.currentTheme = theme;
  document.documentElement.setAttribute("data-theme", theme);
  els.themeToggleBtn.textContent = theme === "dark" ? "☀️" : "🌙";
  localStorage.setItem("ocp_theme", theme);
}

function setViewMode(mode) {
  state.viewMode = mode;
  localStorage.setItem("ocp_view_mode", mode);
  applyViewMode(mode);
  renderDocs();
}

function applyViewMode(mode) {
  if (mode === "grid") {
    els.viewGridBtn.classList.add("active");
    els.viewListBtn.classList.remove("active");
    els.docsContainer.className = "docs-container grid-view";
  } else {
    els.viewListBtn.classList.add("active");
    els.viewGridBtn.classList.remove("active");
    els.docsContainer.className = "docs-container list-view";
  }
}

// === RENDER CATEGORIES & PHASES ===
function renderCategories() {
  els.categoryContainer.innerHTML = CATEGORIES.map(cat => {
    const isActive = state.activeCategory === cat.id;
    let count = 0;
    if (cat.id === "all") {
      count = DOCUMENTS_DATA.length;
    } else if (cat.id === "java_group") {
      count = DOCUMENTS_DATA.filter(d => d.group === "Java").length;
    } else {
      count = DOCUMENTS_DATA.filter(d => d.category === cat.id).length;
    }

    return `
      <button class="category-item ${isActive ? 'active' : ''}" data-cat="${cat.id}">
        <span class="category-item-label">
          <span>${cat.icon}</span>
          <span>${cat.name}</span>
        </span>
        <span class="category-item-count">${count}</span>
      </button>
    `;
  }).join("");

  els.categoryContainer.querySelectorAll(".category-item").forEach(btn => {
    btn.addEventListener("click", () => {
      state.activeCategory = btn.dataset.cat;
      if (state.mainTab !== "docs") switchMainTab("docs");
      renderCategories();
      renderDocs();
    });
  });
}

function renderPhases() {
  els.phaseContainer.innerHTML = PHASES.map(phase => {
    const isActive = state.activePhase === phase;
    return `
      <button class="phase-pill ${isActive ? 'active' : ''}" data-phase="${phase}">
        ${phase}
      </button>
    `;
  }).join("");

  els.phaseContainer.querySelectorAll(".phase-pill").forEach(btn => {
    btn.addEventListener("click", () => {
      state.activePhase = btn.dataset.phase;
      renderPhases();
      renderCurrentView();
    });
  });
}

// === STATS CALCULATION ===
function updateStats() {
  const totalDocs = DOCUMENTS_DATA.length;
  const completedCount = state.completed.size;
  const pct = Math.round((completedCount / totalDocs) * 100);

  const totalQuestions = DOCUMENTS_DATA.reduce((acc, d) => acc + (d.questions || 0), 0);
  const totalLines = DOCUMENTS_DATA.reduce((acc, d) => acc + (d.lines || 0), 0);

  els.statTotalDocs.textContent = totalDocs;
  els.statTotalQuestions.textContent = `${totalQuestions}+`;
  els.statTotalLines.textContent = `~${totalLines.toLocaleString()}`;
  els.statProgressText.textContent = `${completedCount} / ${totalDocs}`;
  els.statProgressPct.textContent = `${pct}%`;
  els.statProgressBar.style.width = `${pct}%`;
}

// === RESET ALL FILTERS ===
function resetAllFilters() {
  state.activeCategory = "all";
  state.activePhase = "Tất cả";
  state.searchQuery = "";
  state.sortBy = "default";
  state.filterFavorite = false;
  state.filterCompleted = false;
  state.filterUncompleted = false;

  els.searchInput.value = "";
  els.searchClearBtn.style.display = "none";
  els.sortSelect.value = "default";
  els.filterFavoriteCb.checked = false;
  els.filterCompletedCb.checked = false;
  els.filterUncompletedCb.checked = false;

  renderCategories();
  renderPhases();
  renderCurrentView();
}

// === FILTERING & SORTING LOGIC FOR DOCS ===
function getFilteredDocs() {
  return DOCUMENTS_DATA.filter(doc => {
    // Category Filter
    if (state.activeCategory === "java_group") {
      if (doc.group !== "Java") return false;
    } else if (state.activeCategory !== "all" && doc.category !== state.activeCategory) {
      return false;
    }

    // Phase Filter
    if (state.activePhase !== "Tất cả" && doc.phase !== state.activePhase) return false;

    // Favorite Filter
    if (state.filterFavorite && !state.favorites.has(doc.id)) return false;

    // Completed Filter
    if (state.filterCompleted && !state.completed.has(doc.id)) return false;

    // Uncompleted Filter
    if (state.filterUncompleted && state.completed.has(doc.id)) return false;

    // Search Query (Fuzzy check in title, description, filename, tags)
    if (state.searchQuery) {
      const q = state.searchQuery;
      const matchTitle = doc.title.toLowerCase().includes(q);
      const matchDesc = doc.description.toLowerCase().includes(q);
      const matchFile = doc.fileName.toLowerCase().includes(q);
      const matchTags = doc.tags.some(t => t.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchFile && !matchTags) return false;
    }

    return true;
  }).sort((a, b) => {
    switch (state.sortBy) {
      case "title-asc": return a.title.localeCompare(b.title);
      case "title-desc": return b.title.localeCompare(a.title);
      case "lines-desc": return b.lines - a.lines;
      case "lines-asc": return a.lines - b.lines;
      case "questions-desc": return (b.questions || 0) - (a.questions || 0);
      default: return 0; // Default order
    }
  });
}

// === RENDER DOCUMENTS ===
function renderDocs() {
  const docs = getFilteredDocs();
  els.resultsCounter.innerHTML = `Đang hiển thị <b>${docs.length}</b> / ${DOCUMENTS_DATA.length} tài liệu`;

  if (docs.length === 0) {
    els.docsContainer.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-icon">🔍</div>
        <h3>Không tìm thấy tài liệu phù hợp</h3>
        <p>Thử đổi từ khóa tìm kiếm hoặc bấm "Đặt lại bộ lọc" để xem toàn bộ danh mục.</p>
      </div>
    `;
    return;
  }

  els.docsContainer.innerHTML = docs.map(doc => {
    const isStarred = state.favorites.has(doc.id);
    const isCompleted = state.completed.has(doc.id);

    if (state.viewMode === "grid") {
      return `
        <article class="doc-card" onclick="openDocDrawer('${doc.id}')">
          <div>
            <div class="doc-card-header">
              <div style="display: flex; align-items: center; gap: 0.6rem; min-width: 0; flex: 1;">
                <div class="doc-icon-wrap">${doc.icon}</div>
                <div class="doc-badge-group">
                  <span class="badge badge-${doc.badgeColor}">${doc.difficulty}</span>
                  <span class="badge badge-phase">${doc.phase}</span>
                </div>
              </div>
              <div class="doc-actions-quick" onclick="event.stopPropagation()">
                <a class="btn-icon" href="viewer.html?doc=${encodeURIComponent(doc.id)}" target="_blank" title="Mở trong tab mới" style="text-decoration: none;">
                  🔗
                </a>
                <button class="btn-star ${isStarred ? 'starred' : ''}" onclick="toggleStar('${doc.id}', event)" title="Đánh dấu yêu thích">
                  ${isStarred ? '★' : '☆'}
                </button>
                <button class="btn-check ${isCompleted ? 'completed' : ''}" onclick="toggleComplete('${doc.id}', event)" title="Đánh dấu đã đọc">
                  ${isCompleted ? '✓' : '○'}
                </button>
              </div>
            </div>

            <div>
              <h3 class="doc-title">${doc.title}</h3>
              <p class="doc-desc">${doc.description}</p>
            </div>
          </div>

          <div>
            <div class="doc-tags" style="margin-bottom: 0.75rem;">
              ${doc.tags.map(t => `<span class="tag-pill">#${t}</span>`).join("")}
            </div>

            <div class="doc-footer">
              <span class="doc-meta-item">📄 ${doc.lines} dòng</span>
              <span class="doc-meta-item">💾 ${doc.size}</span>
              ${doc.questions > 0 ? `<span class="doc-meta-item" style="color: var(--accent-rose); font-weight: 700; cursor: pointer;" onclick="event.stopPropagation(); startQuizForFile('${doc.fileName}')" title="Bấm để làm bài Quiz của tài liệu này">🎯 ${doc.questions} quiz ➔</span>` : ''}
            </div>
          </div>
        </article>
      `;
    } else {
      // List view
      return `
        <article class="doc-card" onclick="openDocDrawer('${doc.id}')">
          <div class="doc-icon-wrap">${doc.icon}</div>
          <div class="doc-card-main">
            <div class="doc-title-desc">
              <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                <h3 class="doc-title" style="margin-bottom: 0;">${doc.title}</h3>
                <span class="badge badge-${doc.badgeColor}">${doc.difficulty}</span>
                <span class="badge badge-phase">${doc.phase}</span>
              </div>
              <p class="doc-desc" style="margin-top: 0.35rem;">${doc.description}</p>
            </div>

            <div class="doc-footer">
              <span class="doc-meta-item">📄 ${doc.lines} dòng</span>
              <span class="doc-meta-item">💾 ${doc.size}</span>
              ${doc.questions > 0 ? `<span class="doc-meta-item" style="color: var(--accent-rose); font-weight: 700; cursor: pointer;" onclick="event.stopPropagation(); startQuizForFile('${doc.fileName}')" title="Bấm để làm bài Quiz của tài liệu này">🎯 ${doc.questions} câu ➔</span>` : ''}
              
              <div class="doc-actions-quick" onclick="event.stopPropagation()">
                <a class="btn-icon" href="viewer.html?doc=${encodeURIComponent(doc.id)}" target="_blank" title="Mở trong tab mới" style="text-decoration: none;">
                  🔗
                </a>
                <button class="btn-star ${isStarred ? 'starred' : ''}" onclick="toggleStar('${doc.id}', event)" title="Yêu thích">
                  ${isStarred ? '★' : '☆'}
                </button>
                <button class="btn-check ${isCompleted ? 'completed' : ''}" onclick="toggleComplete('${doc.id}', event)" title="Đã hoàn thành">
                  ${isCompleted ? '✓' : '○'}
                </button>
              </div>
            </div>
          </div>
        </article>
      `;
    }
  }).join("");
}

// === RENDER PHASE EXPLORER (CHI TIẾT TỪNG PHASE) ===
function renderPhaseExplorer() {
  let phasesToShow = PHASE_DETAILS;

  // Filter by Phase if specific phase selected
  if (state.activePhase !== "Tất cả") {
    phasesToShow = PHASE_DETAILS.filter(p => p.phaseId === state.activePhase);
  }

  // Search filter
  if (state.searchQuery) {
    const q = state.searchQuery;
    phasesToShow = phasesToShow.filter(p => 
      p.title.toLowerCase().includes(q) || 
      p.subtitle.toLowerCase().includes(q) ||
      p.tagline.toLowerCase().includes(q) ||
      p.coreKnowledge.some(k => k.toLowerCase().includes(q)) ||
      p.commonTraps.some(t => t.toLowerCase().includes(q))
    );
  }

  if (phasesToShow.length === 0) {
    els.phaseExplorerContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🧭</div>
        <h3>Không tìm thấy Phase phù hợp</h3>
        <p>Thử chọn "Tất cả" hoặc nhập từ khóa tìm kiếm khác.</p>
      </div>
    `;
    return;
  }

  els.phaseExplorerContainer.innerHTML = phasesToShow.map(phase => {
    // Calculate phase completion
    const totalDocsInPhase = phase.docs.length;
    const completedDocsInPhase = phase.docs.filter(d => state.completed.has(d.id)).length;
    const phasePct = Math.round((completedDocsInPhase / totalDocsInPhase) * 100);

    return `
      <section class="phase-card-detail" style="--phase-color: ${phase.color}">
        <!-- Header -->
        <div class="phase-header-wrap">
          <div class="phase-main-heading">
            <div class="phase-avatar">${phase.icon}</div>
            <div class="phase-title-text">
              <h3>${phase.title}</h3>
              <p>${phase.subtitle} • <span style="color: ${phase.color}; font-weight: 700;">⏱️ ${phase.targetWeeks}</span></p>
            </div>
          </div>

          <div class="phase-stats-pills">
            <div class="phase-stat-pill">📄 ${phase.totalLines} dòng</div>
            <button class="phase-stat-pill btn-launch-quiz" onclick="startQuizForPhase('${phase.phaseId}')" title="Làm trắc nghiệm tương tác">
              🎯 Làm Quiz (${phase.totalQuestions} câu) ➔
            </button>
            <div class="phase-stat-pill" style="color: var(--accent-emerald);">✅ ${completedDocsInPhase}/${totalDocsInPhase} (${phasePct}%)</div>
          </div>
        </div>

        <!-- Tagline -->
        <div class="phase-tagline-box">
          💡 <b>Mục tiêu chuyên đề:</b> ${phase.tagline}
        </div>

        <!-- Two Column Breakdown: Core Knowledge vs Traps -->
        <div class="phase-two-col-grid">
          <!-- Column 1: Core Knowledge -->
          <div class="phase-info-block">
            <h4>🧠 Trọng tâm Kiến thức Cốt lõi</h4>
            <ul class="phase-bullet-list">
              ${phase.coreKnowledge.map(item => `<li>${item}</li>`).join("")}
            </ul>
          </div>

          <!-- Column 2: Common Traps -->
          <div class="phase-info-block" style="border-color: rgba(225, 29, 72, 0.2);">
            <h4 style="color: var(--accent-rose);">⚠️ Cạm Bẫy Biên Dịch & Thi Cử Thường Gặp</h4>
            <ul class="phase-bullet-list phase-trap-list">
              ${phase.commonTraps.map(trap => `<li>${trap}</li>`).join("")}
            </ul>
          </div>
        </div>

        <!-- Action Bar: Documents in this Phase -->
        <div class="phase-docs-bar">
          <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-muted);">
            📚 Tài liệu nghiên cứu trong Phase:
          </div>

          <div class="phase-docs-list">
            ${phase.docs.map(d => {
              const isDone = state.completed.has(d.id);
              return `
                <a class="phase-doc-btn" href="viewer.html?doc=${encodeURIComponent(d.id)}" target="_blank" style="text-decoration: none;">
                  <span>${isDone ? '✅' : '📖'}</span>
                  <span>${d.type}</span>
                  <span style="font-size: 0.75rem; color: var(--text-muted); font-family: var(--font-mono);">(${d.questions > 0 ? d.questions + ' quiz' : 'lab'})</span>
                  <span style="font-size: 0.75rem; opacity: 0.7;">↗</span>
                </a>
              `;
            }).join("")}
          </div>
        </div>
      </section>
    `;
  }).join("");
}

// =================================================================
// === INTERACTIVE QUIZ ENGINE LOGIC (STANDALONE & IN-DOC) ===
// =================================================================

// Helper to look up a question by qKey across QUIZZES_DATABASE
function getQuestionByKey(qKey) {
  if (typeof QUIZZES_DATABASE === "undefined") return null;
  for (const fileKey in QUIZZES_DATABASE) {
    const list = QUIZZES_DATABASE[fileKey].quizzes || [];
    const found = list.find(q => `q_${q.file}_${q.number}` === qKey);
    if (found) return found;
  }
  return null;
}

function getCurrentQuizQuestions() {
  if (typeof QUIZZES_DATABASE === "undefined") return [];
  let questions = [];
  if (state.activeQuizFile === "all") {
    Object.keys(QUIZZES_DATABASE).forEach(f => {
      questions = questions.concat(QUIZZES_DATABASE[f].quizzes || []);
    });
  } else if (QUIZZES_DATABASE[state.activeQuizFile]) {
    questions = QUIZZES_DATABASE[state.activeQuizFile].quizzes || [];
  }
  return questions;
}

function renderQuizPlayer() {
  if (typeof QUIZZES_DATABASE === "undefined" || !els.quizCardsWrapper) {
    if (els.quizCardsWrapper) {
      els.quizCardsWrapper.innerHTML = `<div class="empty-state"><h3>Không tìm thấy dữ liệu Quiz</h3></div>`;
    }
    return;
  }

  // 1. Render Quiz Phase Filter Tabs
  const quizFiles = Object.keys(QUIZZES_DATABASE);
  if (els.quizPhaseTabs) {
    els.quizPhaseTabs.innerHTML = `
      <button class="quiz-tab-pill ${state.activeQuizFile === 'all' ? 'active' : ''}" onclick="selectQuizFile('all')">
        🌟 Toàn bộ Ngân hàng (${Object.values(QUIZZES_DATABASE).reduce((acc, c) => acc + (c.quizzes?.length || 0), 0)} câu)
      </button>
    ` + quizFiles.map(fileKey => {
      const item = QUIZZES_DATABASE[fileKey];
      const isActive = state.activeQuizFile === fileKey;
      return `
        <button class="quiz-tab-pill ${isActive ? 'active' : ''}" onclick="selectQuizFile('${fileKey}')">
          ${item.title} (${item.quizzes.length} câu)
        </button>
      `;
    }).join("");
  }

  // 2. Determine questions to show
  let questions = getCurrentQuizQuestions();
  if (els.quizHeaderTitle) {
    if (state.activeQuizFile === "all") {
      els.quizHeaderTitle.textContent = "🎯 Toàn Bộ Ngân Hàng Câu Hỏi OCP Java 25";
    } else if (QUIZZES_DATABASE[state.activeQuizFile]) {
      els.quizHeaderTitle.textContent = "🎯 " + QUIZZES_DATABASE[state.activeQuizFile].title;
    }
  }

  // Filter with Search if present
  if (state.searchQuery) {
    const q = state.searchQuery;
    questions = questions.filter(item => 
      item.question.toLowerCase().includes(q) ||
      item.explanation.toLowerCase().includes(q) ||
      item.options.some(o => o.text.toLowerCase().includes(q))
    );
  }

  // Update Header Score
  updateQuizLiveScore(questions);

  if (questions.length === 0) {
    els.quizCardsWrapper.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3>Không tìm thấy câu hỏi phù hợp</h3>
        <p>Thử đổi chuyên đề hoặc xóa bộ lọc tìm kiếm.</p>
      </div>
    `;
    return;
  }

  // 3. Render Question Cards
  els.quizCardsWrapper.innerHTML = questions.map((q, idx) => renderSingleQuestionCard(q, false)).join("");
}

// Render a single interactive question card (used in both Quiz Tab & In-Doc Viewer)
function renderSingleQuestionCard(q, isInDoc = false) {
  const qKey = `q_${q.file}_${q.number}`;
  const userSelected = state.userAnswers[qKey] || new Set();
  const isChecked = state.checkedQuestions.has(qKey);

  // Calculate correctness if checked
  let isCorrect = false;
  let cardClass = "";
  if (isChecked) {
    const correctSet = new Set(q.correctAnswers);
    const isSameSize = userSelected.size === correctSet.size;
    const allMatch = [...userSelected].every(val => correctSet.has(val));
    isCorrect = isSameSize && allMatch;
    cardClass = isCorrect ? "answered-correct" : "answered-wrong";
  }

  const inputType = q.isMulti ? "checkbox" : "radio";
  const typeLabel = q.isMulti ? "Chọn NHIỀU đáp án (Checkbox)" : "Chọn 1 đáp án duy nhất (Radio)";

  return `
    <div class="quiz-card ${cardClass}" id="${qKey}">
      <div class="quiz-card-top">
        <div class="quiz-question-badge">Câu ${q.number}</div>
        <div class="quiz-type-tag">${typeLabel}</div>
      </div>

      <div class="quiz-question-body">
        ${renderMarkdown(q.question)}
      </div>

      <!-- Options Selection -->
      <div class="quiz-options-list">
        ${q.options.map(opt => {
          const isOptSelected = userSelected.has(opt.key);
          let optClass = isOptSelected ? "selected" : "";

          if (isChecked) {
            if (q.correctAnswers.includes(opt.key)) {
              optClass += " is-correct-choice";
            } else if (isOptSelected) {
              optClass += " is-wrong-choice";
            }
          }

          return `
            <label class="quiz-option-label ${optClass}" data-opt-key="${opt.key}" onclick="handleQuizOptionClick('${qKey}', '${opt.key}', ${q.isMulti}, ${isInDoc}, event)">
              <input 
                type="${inputType}" 
                name="${qKey}" 
                value="${opt.key}" 
                ${isOptSelected ? 'checked' : ''} 
                ${isChecked ? 'disabled' : ''}
                style="pointer-events: none;"
              >
              <span class="quiz-option-key">${opt.key}.</span>
              <span style="flex: 1;">${renderInlineCode(opt.text)}</span>
            </label>
          `;
        }).join("")}
      </div>

      <!-- Card Footer & Check Action -->
      <div class="quiz-card-footer">
        <div class="quiz-footer-status" style="font-size: 0.85rem; font-weight: 600;">
          ${isChecked ? (isCorrect 
              ? '<span style="color: #10b981;">✓ Chính xác! Tuyệt vời.</span>' 
              : `<span style="color: #e11d48;">✗ Chưa chính xác. Đáp án đúng: <b>${q.correctAnswers.join(", ")}</b></span>`
            ) : '<span style="color: var(--text-muted);">Hãy chọn đáp án rồi bấm Kiểm tra</span>'}
        </div>

        <button class="btn-check-single" onclick="checkSingleQuestion('${qKey}', ${isInDoc})">
          ${isChecked ? '🔍 Xem lại giải thích' : 'Kiểm tra đáp án ➔'}
        </button>
      </div>

      <!-- Explanation Box -->
      <div class="quiz-explanation-box ${isChecked ? 'show' : ''} ${isChecked && !isCorrect ? 'wrong-exp' : ''}">
        <div class="quiz-exp-title" style="color: ${isCorrect ? 'var(--accent-emerald)' : 'var(--accent-rose)'};">
          <span>${isCorrect ? '💡' : '⚠️'}</span>
          <span>PHÂN TÍCH & GIẢI THÍCH CHI TIẾT (ĐÁP ÁN: ${q.correctAnswers.join(", ")}):</span>
        </div>
        <div class="quiz-exp-text">
          ${renderMarkdown(q.explanation || "Không có giải thích bổ sung.")}
        </div>
      </div>
    </div>
  `;
}

// Generate the In-Doc Quiz Widget HTML to append at the bottom of the document
function generateInDocQuizWidget(doc) {
  if (typeof QUIZZES_DATABASE === "undefined" || !QUIZZES_DATABASE[doc.fileName]) {
    return "";
  }

  const quizData = QUIZZES_DATABASE[doc.fileName];
  const questions = quizData.quizzes;

  let correctCount = 0;
  questions.forEach(q => {
    const qKey = `q_${q.file}_${q.number}`;
    if (state.checkedQuestions.has(qKey)) {
      const userSelected = state.userAnswers[qKey] || new Set();
      const correctSet = new Set(q.correctAnswers);
      if (userSelected.size === correctSet.size && [...userSelected].every(val => correctSet.has(val))) {
        correctCount++;
      }
    }
  });

  const pct = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;

  return `
    <section class="in-doc-quiz-section" id="in-doc-quiz-root">
      <div class="in-doc-quiz-banner">
        <div class="in-doc-quiz-title">
          <h3>📝 BÀI TẬP TRẮC NGHIỆM TƯƠNG TÁC (${questions.length} CÂU)</h3>
          <p>Làm bài trực tiếp tại đây: Chọn đáp án và bấm "Kiểm tra" để xem ngay đúng/sai và lời giải chi tiết!</p>
        </div>

        <div style="display: flex; align-items: center; gap: 0.65rem; flex-wrap: wrap;">
          <div class="quiz-score-badge in-doc-score-text">
            Kết quả: <b>${correctCount}</b> / ${questions.length} (${pct}%)
          </div>
          <button class="btn-quiz-secondary" onclick="resetInDocQuiz('${doc.fileName}')">🔄 Làm lại bài</button>
          <button class="btn-quiz-primary" onclick="submitAllInDocQuiz('${doc.fileName}')">📝 Chấm điểm toàn bộ</button>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 1.25rem;">
        ${questions.map(q => renderSingleQuestionCard(q, true)).join("")}
      </div>
    </section>
  `;
}

// Option selection handler with surgical DOM update (0ms lag, no scroll jumps)
window.handleQuizOptionClick = function(qKey, optKey, isMulti, isInDoc = false, event) {
  if (state.checkedQuestions.has(qKey)) return;
  if (event) {
    event.preventDefault();
  }

  if (!state.userAnswers[qKey]) {
    state.userAnswers[qKey] = new Set();
  }

  const ansSet = state.userAnswers[qKey];
  if (isMulti) {
    if (ansSet.has(optKey)) {
      ansSet.delete(optKey);
    } else {
      ansSet.add(optKey);
    }
  } else {
    ansSet.clear();
    ansSet.add(optKey);
  }

  // Directly update option classes and checkboxes in this card only
  const card = document.getElementById(qKey);
  if (card) {
    const labels = card.querySelectorAll(".quiz-option-label");
    labels.forEach(label => {
      const input = label.querySelector("input");
      const key = label.getAttribute("data-opt-key") || input?.value;
      const isSelected = ansSet.has(key);
      if (input) input.checked = isSelected;
      label.classList.toggle("selected", isSelected);
    });
  }
};

// Check single question
window.checkSingleQuestion = function(qKey, isInDoc = false) {
  const q = getQuestionByKey(qKey);
  if (!q) return;

  state.checkedQuestions.add(qKey);
  const userSelected = state.userAnswers[qKey] || new Set();
  const correctSet = new Set(q.correctAnswers);
  const isCorrect = (userSelected.size === correctSet.size) && [...userSelected].every(val => correctSet.has(val));

  const card = document.getElementById(qKey);
  if (card) {
    card.classList.remove("answered-correct", "answered-wrong");
    card.classList.add(isCorrect ? "answered-correct" : "answered-wrong");

    const labels = card.querySelectorAll(".quiz-option-label");
    labels.forEach(label => {
      const input = label.querySelector("input");
      const key = label.getAttribute("data-opt-key") || input?.value;
      if (input) input.disabled = true;

      label.classList.remove("is-correct-choice", "is-wrong-choice");
      if (q.correctAnswers.includes(key)) {
        label.classList.add("is-correct-choice");
      } else if (userSelected.has(key)) {
        label.classList.add("is-wrong-choice");
      }
    });

    const footerMsg = card.querySelector(".quiz-footer-status");
    if (footerMsg) {
      footerMsg.innerHTML = isCorrect 
        ? '<span style="color: #10b981;">✓ Chính xác! Tuyệt vời.</span>' 
        : `<span style="color: #e11d48;">✗ Chưa chính xác. Đáp án đúng: <b>${q.correctAnswers.join(", ")}</b></span>`;
    }

    const checkBtn = card.querySelector(".btn-check-single");
    if (checkBtn) {
      checkBtn.textContent = "🔍 Xem lại giải thích";
    }

    const expBox = card.querySelector(".quiz-explanation-box");
    if (expBox) {
      expBox.classList.remove("wrong-exp");
      if (!isCorrect) expBox.classList.add("wrong-exp");
      expBox.classList.add("show");
      expBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  // Update Score Header / In-Doc Banner
  if (isInDoc) {
    updateInDocBannerScore();
  } else {
    updateQuizLiveScore(getCurrentQuizQuestions());
  }
};

function updateInDocBannerScore() {
  if (!state.selectedDoc || !QUIZZES_DATABASE[state.selectedDoc.fileName]) return;
  const questions = QUIZZES_DATABASE[state.selectedDoc.fileName].quizzes;
  let correctCount = 0;
  questions.forEach(q => {
    const qKey = `q_${q.file}_${q.number}`;
    if (state.checkedQuestions.has(qKey)) {
      const userSelected = state.userAnswers[qKey] || new Set();
      const correctSet = new Set(q.correctAnswers);
      if (userSelected.size === correctSet.size && [...userSelected].every(val => correctSet.has(val))) {
        correctCount++;
      }
    }
  });
  const pct = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
  const scoreBadge = document.querySelector("#in-doc-quiz-root .in-doc-score-text");
  if (scoreBadge) {
    scoreBadge.innerHTML = `Kết quả: <b>${correctCount}</b> / ${questions.length} (${pct}%)`;
  }
}

// Submit all in-doc questions
window.submitAllInDocQuiz = function(fileName) {
  if (QUIZZES_DATABASE[fileName]) {
    QUIZZES_DATABASE[fileName].quizzes.forEach(q => {
      const qKey = `q_${q.file}_${q.number}`;
      checkSingleQuestion(qKey, true);
    });
    updateInDocBannerScore();
    showToast("Đã chấm điểm toàn bộ bài tập trong tài liệu!");
  }
};

// Reset in-doc questions
window.resetInDocQuiz = function(fileName) {
  if (QUIZZES_DATABASE[fileName]) {
    QUIZZES_DATABASE[fileName].quizzes.forEach(q => {
      const qKey = `q_${q.file}_${q.number}`;
      delete state.userAnswers[qKey];
      state.checkedQuestions.delete(qKey);
    });
    if (state.selectedDoc) {
      const root = document.getElementById('in-doc-quiz-root');
      if (root) {
        root.outerHTML = generateInDocQuizWidget(state.selectedDoc);
      }
    }
    showToast("Đã làm mới lại bài tập của tài liệu này.");
  }
};

// Submit all questions in current standalone quiz tab
function submitAllCurrentQuizzes() {
  const questions = getCurrentQuizQuestions();
  questions.forEach(q => {
    const qKey = `q_${q.file}_${q.number}`;
    checkSingleQuestion(qKey, false);
  });
  showToast("Đã chấm điểm toàn bộ câu hỏi! Hãy xem kết quả và giải thích.");
}

// Reset current quiz in standalone tab
function resetCurrentQuiz() {
  const questions = getCurrentQuizQuestions();
  questions.forEach(q => {
    const qKey = `q_${q.file}_${q.number}`;
    delete state.userAnswers[qKey];
    state.checkedQuestions.delete(qKey);
  });
  renderQuizPlayer();
  showToast("Đã làm mới lại toàn bộ câu hỏi của bài này.");
}

// Select specific quiz file
window.selectQuizFile = function(fileKey) {
  state.activeQuizFile = fileKey;
  renderQuizPlayer();
};

// Launch quiz for a specific file
window.startQuizForFile = function(fileName) {
  switchMainTab("quizzes");
  if (typeof QUIZZES_DATABASE !== "undefined" && QUIZZES_DATABASE[fileName]) {
    selectQuizFile(fileName);
  } else {
    selectQuizFile("all");
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Launch quiz for a specific phase
window.startQuizForPhase = function(phaseId) {
  switchMainTab("quizzes");
  if (typeof QUIZZES_DATABASE !== "undefined") {
    const fileKey = Object.keys(QUIZZES_DATABASE).find(k => QUIZZES_DATABASE[k].phase === phaseId);
    if (fileKey) {
      selectQuizFile(fileKey);
    } else {
      selectQuizFile("all");
    }
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Helper to update live score
function updateQuizLiveScore(questions) {
  if (!els.quizScoreNum || !els.quizTotalNum || !els.quizScorePct) return;
  let correctCount = 0;
  let answeredCount = 0;

  questions.forEach(q => {
    const qKey = `q_${q.file}_${q.number}`;
    if (state.checkedQuestions.has(qKey)) {
      answeredCount++;
      const userSelected = state.userAnswers[qKey] || new Set();
      const correctSet = new Set(q.correctAnswers);
      const isSameSize = userSelected.size === correctSet.size;
      const allMatch = [...userSelected].every(val => correctSet.has(val));
      if (isSameSize && allMatch) {
        correctCount++;
      }
    }
  });

  const total = questions.length;
  const pct = total > 0 ? Math.round((correctCount / total) * 100) : 0;

  els.quizScoreNum.textContent = correctCount;
  els.quizTotalNum.textContent = total;
  els.quizScorePct.textContent = `${pct}%`;
}

function renderInlineCode(text) {
  if (!text) return "";
  return text.replace(/`([^`]+)`/g, '<code>$1</code>');
}

// === STAR & COMPLETE ACTIONS ===
function toggleStar(docId, event) {
  if (event) event.stopPropagation();
  if (state.favorites.has(docId)) {
    state.favorites.delete(docId);
  } else {
    state.favorites.add(docId);
  }
  localStorage.setItem("ocp_favorites", JSON.stringify([...state.favorites]));
  renderCurrentView();
}

function toggleComplete(docId, event) {
  if (event) event.stopPropagation();
  if (state.completed.has(docId)) {
    state.completed.delete(docId);
  } else {
    state.completed.add(docId);
  }
  localStorage.setItem("ocp_completed", JSON.stringify([...state.completed]));
  updateStats();
  renderCurrentView();
}

// === AUTO OPEN DOCUMENT IN NEW TAB (NO POPUP) ===
window.openDocDrawer = function(docId) {
  const doc = DOCUMENTS_DATA.find(d => d.id === docId);
  if (!doc) return;
  window.open(`viewer.html?doc=${encodeURIComponent(doc.id)}`, '_blank');
};

function closeDrawer() {
  els.drawerBackdrop.classList.remove("open");
  els.drawerContainer.classList.remove("open");
  if (state.isFullscreen) {
    state.isFullscreen = false;
    els.drawerContainer.classList.remove("fullscreen");
    els.drawerFullscreenBtn.textContent = "⛶";
  }
  document.body.style.overflow = "";
  state.selectedDoc = null;
}

function updateDrawerActions() {
  if (!state.selectedDoc) return;
  const isStarred = state.favorites.has(state.selectedDoc.id);
  const isCompleted = state.completed.has(state.selectedDoc.id);

  els.drawerStarBtn.textContent = isStarred ? "★" : "☆";
  els.drawerStarBtn.style.color = isStarred ? "#f59e0b" : "";
  els.drawerCheckBtn.textContent = isCompleted ? "✓" : "○";
  els.drawerCheckBtn.style.color = isCompleted ? "#10b981" : "";
}

// === ADVANCED PURE JS MARKDOWN PARSER WITH TOC, ALERTS & CODE COPY ===
function renderMarkdown(md) {
  if (!md) return "";

  // 1. Extract Headings for Table of Contents
  const headings = [];
  const lines = md.split('\n');
  lines.forEach((line) => {
    const h2Match = line.match(/^##\s+(.+)$/);
    const h3Match = line.match(/^###\s+(.+)$/);
    if (h2Match) {
      const title = h2Match[1].trim();
      const slug = 'heading-' + encodeURIComponent(title.replace(/\s+/g, '-').toLowerCase());
      headings.push({ level: 2, title, slug });
    } else if (h3Match) {
      const title = h3Match[1].trim();
      const slug = 'heading-' + encodeURIComponent(title.replace(/\s+/g, '-').toLowerCase());
      headings.push({ level: 3, title, slug });
    }
  });

  // 2. Generate TOC HTML block if document has headings
  let tocHtml = "";
  if (headings.length > 3) {
    tocHtml = `
      <div class="toc-box">
        <div class="toc-title">📑 Mục Lục Điều Hướng Nhanh (${headings.length} phần)</div>
        <ul class="toc-list">
          ${headings.map(h => `
            <li class="toc-item-h${h.level}">
              <a href="#${h.slug}">• ${h.title}</a>
            </li>
          `).join("")}
        </ul>
      </div>
    `;
  }

  // 3. Process Code Blocks with syntax header & copy button
  let codeBlockCounter = 0;
  const codeBlocksMap = {};

  let processed = md.replace(/```([\w-]*)\n([\s\S]*?)```/g, (match, lang, code) => {
    const id = `code_placeholder_${codeBlockCounter++}`;
    const cleanLang = lang || 'java';
    const escapedCode = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    codeBlocksMap[id] = `
      <div class="code-block-wrapper">
        <div class="code-block-header">
          <span>☕ ${cleanLang.toUpperCase()}</span>
          <button class="code-copy-btn" onclick="copyCodeSnippet(this)">Sao chép mã</button>
        </div>
        <pre><code class="language-${cleanLang}">${escapedCode}</code></pre>
      </div>
    `;
    return id;
  });

  // 4. Process GitHub Alerts (> [!WARNING], > [!IMPORTANT], > [!NOTE], > [!TIP])
  processed = processed
    .replace(/^\>\s*\[\!WARNING\]\s*\n((?:\>.*(?:\n|$))+)/gim, (match, body) => {
      const cleanBody = body.replace(/^\>\s?/gm, '');
      return `<div class="md-alert md-alert-warning"><div class="md-alert-title">⚠️ CẢNH BÁO / BẪY THI CỬ</div><div>${cleanBody}</div></div>\n`;
    })
    .replace(/^\>\s*\[\!IMPORTANT\]\s*\n((?:\>.*(?:\n|$))+)/gim, (match, body) => {
      const cleanBody = body.replace(/^\>\s?/gm, '');
      return `<div class="md-alert md-alert-important"><div class="md-alert-title">❗ QUAN TRỌNG</div><div>${cleanBody}</div></div>\n`;
    })
    .replace(/^\>\s*\[\!TIP\]\s*\n((?:\>.*(?:\n|$))+)/gim, (match, body) => {
      const cleanBody = body.replace(/^\>\s?/gm, '');
      return `<div class="md-alert md-alert-tip"><div class="md-alert-title">💡 MẸO TỐI ƯU</div><div>${cleanBody}</div></div>\n`;
    })
    .replace(/^\>\s*\[\!NOTE\]\s*\n((?:\>.*(?:\n|$))+)/gim, (match, body) => {
      const cleanBody = body.replace(/^\>\s?/gm, '');
      return `<div class="md-alert md-alert-note"><div class="md-alert-title">ℹ️ GHI CHÚ</div><div>${cleanBody}</div></div>\n`;
    });

  // 5. Standard Blockquotes
  processed = processed.replace(/^\>\s+(.*$)/gim, '<blockquote>$1</blockquote>');

  // 6. Headers with ID anchors for Table of Contents
  processed = processed
    .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
    .replace(/^### (.*$)/gim, (match, title) => {
      const slug = 'heading-' + encodeURIComponent(title.replace(/\s+/g, '-').toLowerCase());
      return `<h3 id="${slug}">${title}</h3>`;
    })
    .replace(/^## (.*$)/gim, (match, title) => {
      const slug = 'heading-' + encodeURIComponent(title.replace(/\s+/g, '-').toLowerCase());
      return `<h2 id="${slug}">${title}</h2>`;
    })
    .replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // 7. Horizontal Rules
  processed = processed.replace(/^---$/gim, '<hr>');

  // 8. Bold, Italic, Inline Code
  processed = processed
    .replace(/\*\*\*(.*?)\*\*\*/gim, '<b><i>$1</i></b>')
    .replace(/\*\*(.*?)\*\*/gim, '<b>$1</b>')
    .replace(/\*(.*?)\*/gim, '<i>$1</i>')
    .replace(/`([^`]+)`/gim, '<code>$1</code>');

  // 9. Markdown Tables
  processed = processed.replace(/^\|(.+)\|$/gim, (match) => {
    const cells = match.split('|').filter((_, i, arr) => i > 0 && i < arr.length - 1);
    const isHeaderSep = cells.some(c => c.trim().startsWith('---'));
    if (isHeaderSep) return '';
    return '<tr>' + cells.map(c => `<td>${c.trim()}</td>`).join('') + '</tr>';
  });

  // Wrap rows in table with responsive wrapper
  processed = processed.replace(/(<tr>[\s\S]*?<\/tr>)/g, '<div class="table-responsive-wrapper"><table>$1</table></div>');
  processed = processed.replace(/<\/table><\/div>\s*<div class="table-responsive-wrapper"><table>/g, '');

  // 10. Lists
  processed = processed.replace(/^\s*-\s+(.*$)/gim, '<li>$1</li>');
  processed = processed.replace(/^\s*\*\s+(.*$)/gim, '<li>$1</li>');

  // 11. Paragraphs
  processed = processed.replace(/\n\n/g, '</p><p>');

  // 12. Restore Code Blocks
  Object.keys(codeBlocksMap).forEach(id => {
    processed = processed.replace(id, codeBlocksMap[id]);
  });

  return tocHtml + `<div class="markdown-content"><p>${processed}</p></div>`;
}

// === CODE COPY HELPER ===
window.copyCodeSnippet = function(button) {
  const codeEl = button.closest('.code-block-wrapper').querySelector('pre code');
  if (!codeEl) return;
  navigator.clipboard.writeText(codeEl.innerText);
  const originalText = button.textContent;
  button.textContent = "✓ Đã chép!";
  button.style.background = "#10b981";
  button.style.color = "#ffffff";
  setTimeout(() => {
    button.textContent = originalText;
    button.style.background = "";
    button.style.color = "";
  }, 1800);
};

// === FALLBACK PREVIEW GENERATOR ===
function generateDocumentPreview(doc) {
  return `
    <div style="background: var(--bg-surface-subtle); padding: 1.25rem; border-radius: var(--radius-md); margin-bottom: 1.5rem; border-left: 4px solid var(--primary);">
      <h3 style="margin-top: 0; color: var(--primary);">📋 Tóm tắt nội dung tài liệu</h3>
      <p style="margin-bottom: 0;">${doc.description}</p>
    </div>

    <h3>🏷️ Các chủ đề & Từ khóa trọng tâm:</h3>
    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1.5rem;">
      ${doc.tags.map(t => `<span class="tag-pill" style="font-size: 0.85rem; padding: 0.3rem 0.6rem;">#${t}</span>`).join("")}
    </div>

    <h3>📁 Thông tin File hệ thống:</h3>
    <div class="table-responsive-wrapper">
      <table>
        <tr><th>Thuộc tính</th><th>Chi tiết</th></tr>
        <tr><td>Tên file lưu trữ</td><td><code>${doc.fileName}</code></td></tr>
        <tr><td>Quy mô & Dung lượng</td><td>${doc.lines} dòng (${doc.size})</td></tr>
        <tr><td>Chuyên mục</td><td>${doc.category}</td></tr>
        <tr><td>Cấp độ độ khó</td><td>${doc.difficulty}</td></tr>
        <tr><td>Số lượng câu hỏi luyện tập</td><td>${doc.questions > 0 ? doc.questions + ' câu trắc nghiệm' : 'Tài liệu lý thuyết / Lab'}</td></tr>
        <tr><td>Cập nhật lần cuối</td><td>${doc.updatedDate}</td></tr>
      </table>
    </div>
  `;
}

// === TOAST NOTIFICATION ===
function showToast(msg) {
  const toast = document.createElement("div");
  toast.style.cssText = `
    position: fixed;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    background: #0f172a;
    color: #ffffff;
    padding: 0.75rem 1.5rem;
    border-radius: var(--radius-full);
    font-size: 0.875rem;
    font-weight: 500;
    box-shadow: var(--shadow-lg);
    z-index: 100;
    transition: opacity 0.3s ease;
  `;
  toast.textContent = msg;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  }, 2200);
}

// Start app only on index.html
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("docs-container")) {
    init();
  }
});
