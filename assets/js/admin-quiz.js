"use strict";
// Module Quản lý Quiz cho trang Admin:
// - Upload file quiz (.json / .quiz.json)
// - Liên kết với bài viết lý thuyết trong hệ thống
// - Export template bài quiz chuẩn (chọn 1 đáp án, chọn nhiều đáp án, giải thích đúng sai)
// - Xem trước bài thi trực tiếp & mở trang thi thử thực tế
// - Tải về file .quiz.json hoặc đăng lên GitHub (tạo Pull Request)

const QUIZ_TEMPLATE = {
  title: "Mẫu bài trắc nghiệm — Ví dụ: Luyện tập Java OOP Cốt lõi",
  docId: "java/core/chapter-1-utilizing-java-oop-approach-part-1",
  tags: ["Java", "OOP", "Cơ bản"],
  quizzes: [
    {
      number: 1,
      question: "Đây là mẫu câu hỏi CHỌN 1 ĐÁP ÁN (Single Choice).\nXét đoạn mã Java sau:\n```java\nint a = 5;\nint b = a++;\nSystem.out.println(\"b = \" + b);\n```\nKết quả in ra màn hình là gì?",
      isMulti: false,
      options: [
        { key: "A", text: "b = 4" },
        { key: "B", text: "b = 5" },
        { key: "C", text: "b = 6" },
        { key: "D", text: "Lỗi biên dịch (Compilation error)" }
      ],
      correctAnswers: ["B"],
      explanation: "Toán tử hậu tố `a++` (postfix increment) trả về giá trị ban đầu của `a` (tức là 5) trước khi tăng `a` lên 6. Do đó biến `b` được gán giá trị 5. Sau lệnh này `a` có giá trị là 6."
    },
    {
      number: 2,
      question: "Đây là mẫu câu hỏi CHỌN NHIỀU ĐÁP ÁN (Multiple Choice).\nNhững từ khoá nào sau đây là từ khoá hợp lệ (reserved keywords) trong ngôn ngữ Java? (Chọn tất cả các đáp án đúng)",
      isMulti: true,
      options: [
        { key: "A", text: "`volatile`" },
        { key: "B", text: "`transient`" },
        { key: "C", text: "`include`" },
        { key: "D", text: "`implements`" },
        { key: "E", text: "`unsigned`" }
      ],
      correctAnswers: ["A", "B", "D"],
      explanation: "• A, B, D đúng: `volatile`, `transient` và `implements` đều là từ khóa dành riêng trong Java.\n• C sai: `include` là lệnh tiền xử lý trong C/C++, Java dùng từ khóa `import`.\n• E sai: Java không có từ khóa `unsigned` cho kiểu nguyên thủy."
    }
  ]
};

let _quizInitialized = false;

/* --------------------------------------------------- tag của bộ đề trắc nghiệm */
// Tag được lưu thẳng vào trường `tags` của file .quiz.json. build/lib/scan.js
// đọc lên và gắn vào catalog thành doc.quizTags để trang Luyện Quiz lọc theo.

let _quizTags = [];

const getQuizTags = () => [..._quizTags];

/** Bỏ khoảng trắng thừa và dấu "#" đầu; trả về "" nếu tag rỗng. */
function cleanQuizTag(tag) {
  return String(tag ?? "").trim().replace(/^#+/, "").trim();
}

function setQuizTags(tags) {
  const list = Array.isArray(tags) ? tags : String(tags || "").split(",");
  const seen = new Set();
  _quizTags = [];
  list.forEach((t) => {
    const clean = cleanQuizTag(t);
    const lower = clean.toLowerCase();
    if (clean && !seen.has(lower)) {
      seen.add(lower);
      _quizTags.push(clean);
    }
  });
  renderQuizTagChips();
  updateQuizTagSuggestionsState();
}

function addQuizTag(tag) {
  const clean = cleanQuizTag(tag);
  if (!clean) return;
  if (_quizTags.some((t) => t.toLowerCase() === clean.toLowerCase())) return;
  _quizTags.push(clean);
  renderQuizTagChips();
  updateQuizTagSuggestionsState();
  syncQuizTagsIntoJson();
}

function removeQuizTag(tag) {
  const lower = cleanQuizTag(tag).toLowerCase();
  _quizTags = _quizTags.filter((t) => t.toLowerCase() !== lower);
  renderQuizTagChips();
  updateQuizTagSuggestionsState();
  syncQuizTagsIntoJson();
}

function renderQuizTagChips() {
  const container = qs("#quiz-tags-list");
  if (!container) return;
  container.innerHTML = _quizTags.map((t) =>
    `<span class="admin-tag-chip">
      <span>#${escapeHtml(t)}</span>
      <button type="button" class="admin-tag-remove" data-remove-quiz-tag="${attr(t)}" title="Xoá tag ${attr(t)}">✕</button>
    </span>`
  ).join("");
}

function updateQuizTagSuggestionsState() {
  const lowerSet = new Set(_quizTags.map((t) => t.toLowerCase()));
  qsa("#quiz-tags-suggestions .admin-tag-suggestion-chip").forEach((chip) => {
    const isSel = lowerSet.has(chip.dataset.tag.toLowerCase());
    chip.classList.toggle("is-selected", isSel);
    chip.setAttribute("aria-disabled", String(isSel));
  });
}

/**
 * Ghi danh sách tag hiện tại vào ô soạn JSON để admin luôn nhìn thấy đúng nội
 * dung sẽ được lưu. JSON hỏng cú pháp thì bỏ qua — người dùng đang gõ dở.
 */
function syncQuizTagsIntoJson() {
  const jsonEl = qs("#quiz-json-content");
  if (!jsonEl || !jsonEl.value.trim()) return;
  try {
    const data = JSON.parse(jsonEl.value);
    if (!data || Array.isArray(data) || typeof data !== "object") return;
    if (_quizTags.length) data.tags = getQuizTags();
    else delete data.tags;
    jsonEl.value = JSON.stringify(data, null, 2);
  } catch (err) {
    /* JSON đang dở dang — tag vẫn được ghép lại lúc tải về / tạo PR */
  }
}

/**
 * Gợi ý tag: gộp tag của các bộ quiz đã có (doc.quizTags) và tag bài viết,
 * xếp theo độ phổ biến giảm dần.
 */
function initQuizTagsManager() {
  const container = qs("#quiz-tags-container");
  const input = qs("#quiz-tags-input");
  const suggestionsList = qs("#quiz-tags-suggestions");
  if (!container || !input) return;

  const docs = typeof ALL_DOCUMENTS !== "undefined" ? ALL_DOCUMENTS : (typeof DOCUMENTS !== "undefined" ? DOCUMENTS : []);
  const counts = new Map();
  docs.forEach((d) => {
    [...(d.quizTags || []), ...(d.tags || [])].forEach((t) => {
      const clean = cleanQuizTag(t);
      if (clean) counts.set(clean, (counts.get(clean) || 0) + 1);
    });
  });

  const sorted = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([tag]) => tag)
    .slice(0, 16);

  if (suggestionsList) {
    if (sorted.length) {
      suggestionsList.innerHTML = sorted.map((t) =>
        `<button type="button" class="admin-tag-suggestion-chip" data-tag="${attr(t)}">#${escapeHtml(t)}</button>`
      ).join("");
    } else {
      const box = qs("#quiz-tags-suggestions-box");
      if (box) box.hidden = true;
    }
  }

  const flushInput = () => {
    const val = input.value.trim();
    if (!val) return;
    val.split(",").forEach((sub) => addQuizTag(sub));
    input.value = "";
  };

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      flushInput();
    } else if (e.key === "Backspace" && !input.value && _quizTags.length) {
      removeQuizTag(_quizTags[_quizTags.length - 1]);
    }
  });
  input.addEventListener("blur", flushInput);

  container.addEventListener("click", (e) => {
    if (e.target === container || e.target.id === "quiz-tags-list") input.focus();
  });

  delegate(container, "click", "[data-remove-quiz-tag]", (e, btn) => {
    e.preventDefault();
    removeQuizTag(btn.dataset.removeQuizTag);
  });

  if (suggestionsList) {
    delegate(suggestionsList, "click", ".admin-tag-suggestion-chip", (e, chip) => {
      e.preventDefault();
      const tag = chip.dataset.tag;
      if (_quizTags.some((t) => t.toLowerCase() === tag.toLowerCase())) removeQuizTag(tag);
      else addQuizTag(tag);
    });
  }
}

/**
 * Khởi tạo bộ điều khiển Quản lý Quiz trong trang Admin
 */
function initQuizManager() {
  if (_quizInitialized) return;
  _quizInitialized = true;

  initDocSelector();
  initQuizTagsManager();
  bindQuizManagerEvents();

  // Nạp sẵn template nếu ô soạn còn trống
  const jsonEl = qs("#quiz-json-content");
  if (jsonEl && !jsonEl.value.trim()) {
    jsonEl.value = JSON.stringify(QUIZ_TEMPLATE, null, 2);
    qs("#quiz-title").value = QUIZ_TEMPLATE.title;
    setQuizTags(QUIZ_TEMPLATE.tags);
    updateQuizLiveStats();
  }
}

let customSelectEventsBound = false;

/**
 * Điền danh sách các bài viết lý thuyết vào dropdown
 */
function initDocSelector() {
  const select = qs("#quiz-doc-select");
  if (!select) return;

  const docs = typeof ALL_DOCUMENTS !== "undefined" ? ALL_DOCUMENTS : (typeof DOCUMENTS !== "undefined" ? DOCUMENTS : []);
  const sections = typeof ALL_SECTIONS !== "undefined" ? ALL_SECTIONS : (typeof SECTIONS !== "undefined" ? SECTIONS : []);

  if (!docs.length) {
    select.innerHTML = '<option value="">(Chưa có bài viết lý thuyết nào trong hệ thống)</option>';
    renderCustomDocDropdown();
    return;
  }

  let html = '<option value="">-- Chọn bài viết lý thuyết để liên kết --</option>';

  // Nhóm bài viết theo từng Mảng công nghệ (Section)
  sections.forEach((sec) => {
    const secDocs = docs.filter((d) => d.section === sec.id);
    if (!secDocs.length) return;

    html += `<optgroup label="📚 ${escapeHtml(sec.name)} (${secDocs.length} bài)">`;
    secDocs.forEach((doc) => {
      const qStatus = (doc.questions || 0) > 0 ? `[✓ ${doc.questions} câu]` : "[Chưa có quiz]";
      html += `<option value="${attr(doc.id)}" data-section="${attr(doc.section)}" data-category="${attr(doc.category)}" data-slug="${attr(doc.slug)}">
        ${qStatus} ${escapeHtml(doc.title)}
      </option>`;
    });
    html += "</optgroup>";
  });

  html += '<option value="__custom__">➕ Nhập bài viết / slug tuỳ chỉnh...</option>';
  select.innerHTML = html;

  // Nếu bài đầu tiên khớp với template docId thì chọn
  if (QUIZ_TEMPLATE.docId) {
    select.value = QUIZ_TEMPLATE.docId;
  }
  updateDocLinkInfo();
  renderCustomDocDropdown();
}

/**
 * Render giao diện dropdown tùy chỉnh cao cấp thay thế native select
 */
function renderCustomDocDropdown() {
  const listEl = qs("#quiz-custom-select-list");
  const select = qs("#quiz-doc-select");
  if (!listEl || !select) return;

  const docs = typeof ALL_DOCUMENTS !== "undefined" ? ALL_DOCUMENTS : (typeof DOCUMENTS !== "undefined" ? DOCUMENTS : []);
  const sections = typeof ALL_SECTIONS !== "undefined" ? ALL_SECTIONS : (typeof SECTIONS !== "undefined" ? SECTIONS : []);

  if (!docs.length) {
    listEl.innerHTML = '<div class="p-4 text-center text-xs text-slate-400">(Chưa có bài viết lý thuyết nào trong hệ thống)</div>';
    bindCustomSelectEvents();
    syncCustomDocSelect();
    return;
  }

  let html = "";
  sections.forEach((sec) => {
    const secDocs = docs.filter((d) => d.section === sec.id);
    if (!secDocs.length) return;

    html += `<div class="quiz-custom-optgroup" data-group="${attr(sec.id)}">`;
    html += `<div class="quiz-custom-optgroup-title">📚 ${escapeHtml(sec.name)} (${secDocs.length} bài)</div>`;
    secDocs.forEach((doc) => {
      const hasQ = (doc.questions || 0) > 0;
      const isSelected = select.value === doc.id;
      html += `
        <div class="quiz-custom-option ${isSelected ? "is-selected" : ""}"
             role="option"
             aria-selected="${isSelected}"
             data-doc-id="${attr(doc.id)}"
             data-section="${attr(doc.section)}"
             data-category="${attr(doc.category)}"
             data-slug="${attr(doc.slug)}"
             data-title="${attr(doc.title)}">
          <div class="flex items-center gap-2 min-w-0 flex-1">
            <span class="text-xs opacity-75">${isSelected ? "✓" : "•"}</span>
            <span class="truncate font-medium text-xs sm:text-sm">${escapeHtml(doc.title)}</span>
          </div>
          <div class="flex items-center gap-1.5 flex-shrink-0">
            <span class="text-[0.68rem] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">${escapeHtml(doc.category)}</span>
            ${hasQ
              ? `<span class="quiz-custom-option-badge-done">✓ ${doc.questions} câu</span>`
              : `<span class="quiz-custom-option-badge-none">Chưa có quiz</span>`
            }
          </div>
        </div>
      `;
    });
    html += `</div>`;
  });

  listEl.innerHTML = html;
  bindCustomSelectEvents();
  syncCustomDocSelect();
}

/**
 * Đồng bộ nhãn hiển thị trên trigger button theo giá trị hiện tại của select
 */
function syncCustomDocSelect() {
  const select = qs("#quiz-doc-select");
  const valEl = qs("#quiz-custom-select-val");
  const listEl = qs("#quiz-custom-select-list");
  if (!select || !valEl) return;

  const docId = select.value;
  const docs = typeof ALL_DOCUMENTS !== "undefined" ? ALL_DOCUMENTS : (typeof DOCUMENTS !== "undefined" ? DOCUMENTS : []);
  const doc = docs.find((d) => d.id === docId);

  // Cập nhật trạng thái active trong danh sách
  if (listEl) {
    listEl.querySelectorAll(".quiz-custom-option").forEach((opt) => {
      const active = opt.dataset.docId === docId;
      opt.classList.toggle("is-selected", active);
      opt.setAttribute("aria-selected", active ? "true" : "false");
      const mark = opt.querySelector(".opacity-75");
      if (mark) mark.textContent = active ? "✓" : "•";
    });
  }

  if (!doc) {
    valEl.innerHTML = `
      <span class="text-base text-slate-400">📖</span>
      <span class="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium truncate">-- Chọn bài viết lý thuyết để liên kết --</span>
    `;
    return;
  }

  const hasQ = (doc.questions || 0) > 0;
  valEl.innerHTML = `
    <div class="flex items-center gap-2 flex-1 min-w-0">
      <span class="text-base">📖</span>
      <span class="px-1.5 py-0.5 rounded text-[0.68rem] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80 flex-shrink-0">${escapeHtml(doc.section)} / ${escapeHtml(doc.category)}</span>
      <span class="font-bold text-slate-900 dark:text-slate-100 truncate text-xs sm:text-sm">${escapeHtml(doc.title)}</span>
      ${hasQ
        ? `<span class="ml-auto mr-1 quiz-custom-option-badge-done flex-shrink-0">✓ ${doc.questions} câu</span>`
        : `<span class="ml-auto mr-1 quiz-custom-option-badge-none flex-shrink-0">Chưa có quiz</span>`
      }
    </div>
  `;
}

/**
 * Gắn sự kiện cho dropdown tùy chỉnh (Mở/đóng, tìm kiếm, chọn bài)
 */
function bindCustomSelectEvents() {
  if (customSelectEventsBound) return;
  customSelectEventsBound = true;

  const container = qs("#quiz-custom-select");
  const triggerBtn = qs("#quiz-custom-select-btn");
  const menu = qs("#quiz-custom-select-menu");
  const searchInput = qs("#quiz-custom-select-search");
  const clearBtn = qs("#quiz-custom-select-clear");
  const listEl = qs("#quiz-custom-select-list");
  const select = qs("#quiz-doc-select");

  if (!container || !triggerBtn || !menu || !listEl) return;

  function openMenu() {
    menu.hidden = false;
    container.classList.add("is-open");
    triggerBtn.setAttribute("aria-expanded", "true");
    if (searchInput) {
      searchInput.value = "";
      filterOptions("");
      setTimeout(() => searchInput.focus(), 50);
    }
  }

  function closeMenu() {
    menu.hidden = true;
    container.classList.remove("is-open");
    triggerBtn.setAttribute("aria-expanded", "false");
  }

  triggerBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (menu.hidden) {
      openMenu();
    } else {
      closeMenu();
    }
  });

  // Tìm kiếm bài viết trong dropdown
  function filterOptions(q) {
    const query = (q || "").trim().toLowerCase();
    if (clearBtn) clearBtn.hidden = !query;

    const groups = listEl.querySelectorAll(".quiz-custom-optgroup");
    let totalVisible = 0;

    groups.forEach((grp) => {
      const options = grp.querySelectorAll(".quiz-custom-option");
      let grpVisible = 0;
      options.forEach((opt) => {
        const title = (opt.dataset.title || "").toLowerCase();
        const category = (opt.dataset.category || "").toLowerCase();
        const slug = (opt.dataset.slug || "").toLowerCase();
        const match = !query || title.includes(query) || category.includes(query) || slug.includes(query);
        opt.style.display = match ? "flex" : "none";
        if (match) {
          grpVisible++;
          totalVisible++;
        }
      });
      grp.style.display = grpVisible > 0 ? "block" : "none";
    });

    let emptyMsg = listEl.querySelector(".quiz-custom-select-empty");
    if (totalVisible === 0) {
      if (!emptyMsg) {
        emptyMsg = document.createElement("div");
        emptyMsg.className = "quiz-custom-select-empty p-4 text-center text-xs text-slate-400";
        emptyMsg.textContent = "🔍 Không tìm thấy bài viết nào phù hợp";
        listEl.appendChild(emptyMsg);
      }
      emptyMsg.style.display = "block";
    } else if (emptyMsg) {
      emptyMsg.style.display = "none";
    }
  }

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      filterOptions(searchInput.value);
    });
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeMenu();
        triggerBtn.focus();
      }
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (searchInput) {
        searchInput.value = "";
        filterOptions("");
        searchInput.focus();
      }
    });
  }

  // Chọn option
  listEl.addEventListener("click", (e) => {
    const option = e.target.closest(".quiz-custom-option");
    if (!option) return;

    const docId = option.dataset.docId;
    if (select) {
      select.value = docId;
      select.dispatchEvent(new Event("change", { bubbles: true }));
    }
    syncCustomDocSelect();
    closeMenu();
    triggerBtn.focus();
  });

  // Đóng khi click ngoài
  document.addEventListener("click", (e) => {
    if (!container.contains(e.target)) {
      closeMenu();
    }
  });

  // Đóng khi bấm Esc
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !menu.hidden) {
      closeMenu();
      triggerBtn.focus();
    }
  });
}

/**
 * Cập nhật thông tin đường dẫn file và bài đọc lý thuyết khi chọn bài
 */
function updateDocLinkInfo() {
  const select = qs("#quiz-doc-select");
  if (!select) return;

  const docId = select.value;
  const docs = typeof ALL_DOCUMENTS !== "undefined" ? ALL_DOCUMENTS : (typeof DOCUMENTS !== "undefined" ? DOCUMENTS : []);
  const doc = docs.find((d) => d.id === docId);

  syncCustomDocSelect();

  if (!doc) return;

  // Chưa gắn tag nào thì mượn tạm tag của bài viết lý thuyết làm điểm khởi đầu
  if (!getQuizTags().length) {
    const seed = (doc.quizTags && doc.quizTags.length) ? doc.quizTags : (doc.tags || []);
    if (seed.length) setQuizTags(seed);
  }

  // Tự điền tiêu đề nếu đang trống
  const titleInput = qs("#quiz-title");
  if (titleInput && (!titleInput.value.trim() || titleInput.value.startsWith("Mẫu bài trắc nghiệm"))) {
    titleInput.value = `${doc.title} (Quiz)`;
  }
}

/**
 * Tải file về máy tính
 */
function downloadFile(filename, text, mimeType = "application/json;charset=utf-8") {
  const blob = new Blob([text], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Tải template mẫu quiz JSON
 */
function exportQuizTemplate() {
  const content = JSON.stringify(QUIZ_TEMPLATE, null, 2);
  downloadFile("quiz-template.json", content);
}

/**
 * Phân tích JSON và cập nhật thông số thống kê câu hỏi
 */
function updateQuizLiveStats() {
  const jsonEl = qs("#quiz-json-content");
  if (!jsonEl) return;

  const totalEl = qs("#stat-total-q");
  const singleEl = qs("#stat-single-q");
  const multiEl = qs("#stat-multi-q");
  const expEl = qs("#stat-explained-q");

  try {
    const raw = jsonEl.value.trim();
    if (!raw) {
      if (totalEl) totalEl.textContent = "0";
      if (singleEl) singleEl.textContent = "0";
      if (multiEl) multiEl.textContent = "0";
      if (expEl) expEl.textContent = "0";
      return;
    }

    const data = JSON.parse(raw);
    const list = Array.isArray(data.quizzes) ? data.quizzes : (Array.isArray(data) ? data : []);

    // Mã JSON là nguồn sự thật khi admin gõ tay: đồng bộ ngược tag ra ô chip.
    if (!Array.isArray(data)) setQuizTags(Array.isArray(data.tags) ? data.tags : []);

    const total = list.length;
    const single = list.filter((q) => !q.isMulti).length;
    const multi = list.filter((q) => q.isMulti).length;
    const explained = list.filter((q) => q.explanation && q.explanation.trim()).length;

    if (totalEl) totalEl.textContent = String(total);
    if (singleEl) singleEl.textContent = String(single);
    if (multiEl) multiEl.textContent = String(multi);
    if (expEl) expEl.textContent = `${explained}/${total}`;

    // Cập nhật tab xem trước nếu đang mở
    renderQuizVisualPreview(list);
  } catch (err) {
    if (totalEl) totalEl.textContent = "Lỗi JSON";
  }
}

/**
 * Render thẻ xem trước trực quan các câu hỏi
 */
function renderQuizVisualPreview(quizzes) {
  const container = qs("#quiz-questions-preview");
  if (!container) return;

  if (!quizzes || !quizzes.length) {
    container.innerHTML = `<div class="py-8 text-center text-slate-400 text-xs">
      Chưa có câu hỏi nào để hiển thị. Hãy dán mã JSON hoặc nạp file template.
    </div>`;
    return;
  }

  container.innerHTML = quizzes.map((q, idx) => {
    const isMulti = Boolean(q.isMulti);
    const badgeType = isMulti
      ? '<span class="px-2 py-0.5 rounded text-[0.68rem] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">Chọn nhiều đáp án</span>'
      : '<span class="px-2 py-0.5 rounded text-[0.68rem] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">Chọn 1 đáp án</span>';

    const correct = Array.isArray(q.correctAnswers) ? q.correctAnswers : [];

    const optionsHtml = (q.options || []).map((opt) => {
      const isCorrectOpt = correct.includes(opt.key);
      const optClass = isCorrectOpt
        ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700/60 font-semibold text-emerald-900 dark:text-emerald-200"
        : "bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300";

      return `<div class="p-2.5 rounded-xl border text-xs flex items-start gap-2.5 ${optClass}">
        <span class="font-mono font-bold ${isCorrectOpt ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}">${escapeHtml(opt.key)}.</span>
        <span class="flex-1">${escapeHtml(opt.text)}</span>
        ${isCorrectOpt ? '<span class="text-emerald-600 dark:text-emerald-400 font-bold">✓ Đúng</span>' : ""}
      </div>`;
    }).join("");

    const expHtml = q.explanation
      ? `<div class="mt-2.5 p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/40 text-xs text-amber-900 dark:text-amber-200">
           <div class="font-bold mb-1 flex items-center gap-1.5 text-amber-700 dark:text-amber-300">
             <span>💡 Giải thích chi tiết:</span>
           </div>
           <div class="leading-relaxed whitespace-pre-line">${escapeHtml(q.explanation)}</div>
         </div>`
      : '<div class="mt-2 text-[0.7rem] text-slate-400 italic">Chưa có giải thích cho câu hỏi này.</div>';

    return `<div class="p-4 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-sm space-y-3">
      <div class="flex items-center justify-between gap-2">
        <span class="text-xs font-bold text-slate-500 dark:text-slate-400">Câu ${q.number || (idx + 1)}</span>
        ${badgeType}
      </div>
      <div class="text-xs font-medium text-slate-900 dark:text-white leading-relaxed whitespace-pre-line">${escapeHtml(q.question)}</div>
      <div class="space-y-1.5">${optionsHtml}</div>
      ${expHtml}
    </div>`;
  }).join("");
}

/**
 * Xử lý khi upload file JSON
 */
function handleQuizFileUpload(file) {
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const text = e.target.result;
      const data = JSON.parse(text);

      const jsonEl = qs("#quiz-json-content");
      if (jsonEl) {
        jsonEl.value = JSON.stringify(data, null, 2);
      }

      // Cập nhật tiêu đề nếu có trong JSON
      if (data.title && qs("#quiz-title")) {
        qs("#quiz-title").value = data.title;
      }

      // Tag đi kèm file (nếu có) — không có thì xoá sạch ô tag cho khỏi lẫn
      setQuizTags(Array.isArray(data.tags) ? data.tags : []);

      // Tự chọn bài liên kết nếu file có docId
      if (data.docId && qs("#quiz-doc-select")) {
        qs("#quiz-doc-select").value = data.docId;
        updateDocLinkInfo();
      } else {
        // Hoặc đoán theo tên file, ví dụ: chapter-1-utilizing-java-oop-approach-part-1.quiz.json
        const cleanSlug = file.name.replace(/\.quiz\.json$|\.json$/, "");
        const docs = typeof ALL_DOCUMENTS !== "undefined" ? ALL_DOCUMENTS : (typeof DOCUMENTS !== "undefined" ? DOCUMENTS : []);
        const matched = docs.find((d) => d.slug === cleanSlug || d.id.endsWith("/" + cleanSlug));
        if (matched && qs("#quiz-doc-select")) {
          qs("#quiz-doc-select").value = matched.id;
          updateDocLinkInfo();
        }
      }

      updateQuizLiveStats();

      const count = Array.isArray(data.quizzes) ? data.quizzes.length : (Array.isArray(data) ? data.length : 0);
      showQuizAlert("ok", `Đã tải lên thành công file "${file.name}" gồm ${count} câu hỏi trắc nghiệm!`);
    } catch (err) {
      showQuizAlert("error", `File không hợp lệ hoặc lỗi cú pháp JSON: ${err.message}`);
    }
  };
  reader.readAsText(file);
}

/**
 * Format làm đẹp JSON
 */
function formatQuizJson() {
  const jsonEl = qs("#quiz-json-content");
  if (!jsonEl) return;
  try {
    const obj = JSON.parse(jsonEl.value);
    jsonEl.value = JSON.stringify(obj, null, 2);
    updateQuizLiveStats();
    showQuizAlert("ok", "Đã format chuẩn hóa mã JSON!");
  } catch (err) {
    showQuizAlert("error", `Lỗi cú pháp JSON: ${err.message}`);
  }
}

/**
 * Mở bài thi thử (Preview Exam Page) trong tab mới
 */
function launchQuizTestRun() {
  const jsonEl = qs("#quiz-json-content");
  const titleEl = qs("#quiz-title");
  const selectEl = qs("#quiz-doc-select");

  if (!jsonEl) return;

  try {
    const raw = jsonEl.value.trim();
    if (!raw) {
      showQuizAlert("error", "Vui lòng nhập hoặc tải lên nội dung câu hỏi JSON trước khi thi thử!");
      return;
    }

    const data = JSON.parse(raw);
    const quizzes = Array.isArray(data.quizzes) ? data.quizzes : (Array.isArray(data) ? data : []);

    if (!quizzes.length) {
      showQuizAlert("error", "Bộ câu hỏi trắc nghiệm đang rỗng (không có câu hỏi nào)!");
      return;
    }

    const title = (titleEl?.value || data.title || "Bài thi trắc nghiệm xem thử").trim();
    const docId = selectEl?.value || data.docId || "preview/quiz";

    const docs = typeof ALL_DOCUMENTS !== "undefined" ? ALL_DOCUMENTS : (typeof DOCUMENTS !== "undefined" ? DOCUMENTS : []);
    const linkedDoc = docs.find((d) => d.id === docId);

    const previewPayload = {
      docId,
      title,
      tags: getQuizTags(),
      doc: linkedDoc || {
        id: docId,
        title,
        section: "preview",
        category: "quiz",
        slug: "preview",
        questions: quizzes.length,
        readingMinutes: Math.max(1, Math.round(quizzes.length * 1.5))
      },
      quizzes
    };

    sessionStorage.setItem("blog.quiz.preview", JSON.stringify(previewPayload));
    window.open("quiz.html?preview=1", "_blank");
  } catch (err) {
    showQuizAlert("error", `Lỗi cú pháp JSON khi thi thử: ${err.message}`);
  }
}

/**
 * Tải về file .quiz.json
 */
function downloadCurrentQuizFile() {
  const jsonEl = qs("#quiz-json-content");
  const titleEl = qs("#quiz-title");
  const selectEl = qs("#quiz-doc-select");

  if (!jsonEl) return;

  try {
    const raw = jsonEl.value.trim();
    if (!raw) {
      showQuizAlert("error", "Chưa có nội dung JSON để tải về!");
      return;
    }

    const data = JSON.parse(raw);
    if (!data.title && titleEl?.value.trim()) {
      data.title = titleEl.value.trim();
    }
    if (!data.docId && selectEl?.value && selectEl.value !== "__custom__") {
      data.docId = selectEl.value;
    }
    const tags = getQuizTags();
    if (tags.length) data.tags = tags;
    else delete data.tags;

    const docs = typeof ALL_DOCUMENTS !== "undefined" ? ALL_DOCUMENTS : (typeof DOCUMENTS !== "undefined" ? DOCUMENTS : []);
    const doc = docs.find((d) => d.id === selectEl?.value);
    const filename = (doc?.slug || "quiz-bank") + ".quiz.json";

    downloadFile(filename, JSON.stringify(data, null, 2));
    showQuizAlert("ok", `Đã tải về file "${filename}". Bạn có thể đặt file này vào thư mục content/... của bài viết.`);
  } catch (err) {
    showQuizAlert("error", `Lỗi JSON: ${err.message}`);
  }
}

/**
 * Đăng lên GitHub (Tạo PR) nếu đã đăng nhập token
 */
async function submitQuizPullRequest(event) {
  event.preventDefault();

  const jsonEl = qs("#quiz-json-content");
  const titleEl = qs("#quiz-title");
  const selectEl = qs("#quiz-doc-select");
  const submitBtn = qs("#btn-quiz-submit-pr");

  if (!jsonEl || !titleEl || !selectEl) return;

  const docId = selectEl.value;
  if (!docId || docId === "__custom__") {
    showQuizAlert("error", "Vui lòng chọn bài viết lý thuyết trong danh sách để liên kết và xác định đường dẫn lưu file!");
    return;
  }

  const docs = typeof ALL_DOCUMENTS !== "undefined" ? ALL_DOCUMENTS : (typeof DOCUMENTS !== "undefined" ? DOCUMENTS : []);
  const doc = docs.find((d) => d.id === docId);
  if (!doc) {
    showQuizAlert("error", "Không tìm thấy thông tin bài viết được chọn trong Catalog!");
    return;
  }

  let data;
  try {
    data = JSON.parse(jsonEl.value);
  } catch (err) {
    showQuizAlert("error", `Mã JSON không hợp lệ: ${err.message}`);
    return;
  }

  const quizzes = Array.isArray(data.quizzes) ? data.quizzes : (Array.isArray(data) ? data : []);
  if (!quizzes.length) {
    showQuizAlert("error", "Bộ câu hỏi đang rỗng!");
    return;
  }

  const title = titleEl.value.trim() || doc.title;
  data.title = title;
  data.docId = doc.id;
  const tags = getQuizTags();
  if (tags.length) data.tags = tags;
  else delete data.tags;

  const targetPath = `content/${doc.section}/${doc.category}/${doc.slug}.quiz.json`;

  // Kiểm tra nếu admin chưa đăng nhập GitHub
  if (!window.admin || !window.admin.gh) {
    showQuizAlert("error", `Bạn chưa đăng nhập GitHub Personal Access Token trong Admin. Vui lòng đăng nhập ở trang Quản lý bài viết để tạo Pull Request tự động, hoặc bấm nút "💾 Tải về file .quiz.json" để lưu thủ công vào "${targetPath}".`);
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "⏳ Đang tạo nhánh & commit...";
  showQuizAlert("ok", "Đang xử lý đẩy câu hỏi lên GitHub...");

  try {
    const branch = `quiz-${doc.slug}-${Date.now().toString(36)}`;
    await window.admin.gh.createBranch(branch);

    const fileContent = JSON.stringify(data, null, 2) + "\n";
    await window.admin.gh.commitFiles(
      [{ path: targetPath, content: fileContent }],
      `content: them bo quiz ${quizzes.length} cau cho bai "${title}"`,
      branch
    );

    submitBtn.textContent = "⏳ Đang mở Pull Request...";
    const pr = await window.admin.gh.createPullRequest({
      head: branch,
      title: `content: them bo quiz ${quizzes.length} cau cho bai "${title}"`,
      body: `Thêm bộ câu hỏi trắc nghiệm từ trang Quản lý Quiz Admin.\n\n- File: \`${targetPath}\`\n- Số câu hỏi: ${quizzes.length}\n- Bài viết liên kết: ${doc.title}\n\nMerge PR này để tự động build và xuất hiện trên trang Luyện Quiz.`
    });

    showQuizAlert("ok", `🎉 Thành công! Đã mở Pull Request #${pr.number}: <a href="${attr(pr.html_url)}" target="_blank" rel="noopener" class="font-bold underline text-emerald-800 dark:text-emerald-200">Xem PR trên GitHub ➔</a>`);
  } catch (err) {
    showQuizAlert("error", `Lỗi khi đẩy lên GitHub: ${err.message}`);
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = "<span>🚀</span> <span>Đăng lên GitHub (Tạo PR)</span>";
  }
}

/**
 * Hiển thị thông báo trạng thái
 */
function showQuizAlert(type, message) {
  const errEl = qs("#quiz-error");
  const okEl = qs("#quiz-success");

  if (errEl) errEl.hidden = true;
  if (okEl) okEl.hidden = true;

  const target = type === "ok" ? okEl : errEl;
  if (target) {
    target.innerHTML = message;
    target.hidden = !message;
    if (message) {
      target.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }
}

/**
 * Gắn các sự kiện của giao diện Quiz Manager
 */
function bindQuizManagerEvents() {
  const select = qs("#quiz-doc-select");
  if (select) {
    select.addEventListener("change", updateDocLinkInfo);
  }

  const exportBtn = qs("#btn-export-template");
  if (exportBtn) {
    exportBtn.addEventListener("click", exportQuizTemplate);
  }

  const loadSampleBtn = qs("#btn-load-sample");
  if (loadSampleBtn) {
    loadSampleBtn.addEventListener("click", () => {
      const jsonEl = qs("#quiz-json-content");
      if (jsonEl) {
        jsonEl.value = JSON.stringify(QUIZ_TEMPLATE, null, 2);
        qs("#quiz-title").value = QUIZ_TEMPLATE.title;
        setQuizTags(QUIZ_TEMPLATE.tags);
        updateQuizLiveStats();
        showQuizAlert("ok", "Đã nạp template câu hỏi mẫu vào ô soạn!");
      }
    });
  }

  const formatBtn = qs("#btn-format-json");
  if (formatBtn) {
    formatBtn.addEventListener("click", formatQuizJson);
  }

  const fileInput = qs("#quiz-file-input");
  if (fileInput) {
    fileInput.addEventListener("change", (e) => {
      const file = e.target.files?.[0];
      if (file) handleQuizFileUpload(file);
    });
  }

  const jsonContent = qs("#quiz-json-content");
  if (jsonContent) {
    jsonContent.addEventListener("input", updateQuizLiveStats);
  }

  // Chuyển tab soạn JSON / xem trước
  qsa("[data-quiz-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.quizTab;
      qsa("[data-quiz-tab]").forEach((b) => b.classList.toggle("active", b.dataset.quizTab === tab));
      qsa("[data-quiz-pane]").forEach((p) => {
        p.hidden = p.dataset.quizPane !== tab;
      });
      const editorActions = qs("#quiz-editor-actions");
      if (editorActions) {
        editorActions.style.display = tab === "json" ? "flex" : "none";
      }
      if (tab === "preview") {
        updateQuizLiveStats();
      }
    });
  });

  const testRunBtn = qs("#btn-quiz-test-run");
  if (testRunBtn) {
    testRunBtn.addEventListener("click", launchQuizTestRun);
  }

  const downloadBtn = qs("#btn-download-quiz-file");
  if (downloadBtn) {
    downloadBtn.addEventListener("click", downloadCurrentQuizFile);
  }

  const form = qs("#quiz-form");
  if (form) {
    form.addEventListener("submit", submitQuizPullRequest);
  }

  // Cho phép kéo thả file JSON vào ô soạn
  if (jsonContent) {
    jsonContent.addEventListener("dragover", (e) => {
      e.preventDefault();
      jsonContent.classList.add("border-indigo-500");
    });
    jsonContent.addEventListener("dragleave", () => {
      jsonContent.classList.remove("border-indigo-500");
    });
    jsonContent.addEventListener("drop", (e) => {
      e.preventDefault();
      jsonContent.classList.remove("border-indigo-500");
      const file = e.dataTransfer.files?.[0];
      if (file) handleQuizFileUpload(file);
    });
  }
}
