"use strict";
// Bộ máy Quiz chung cho toàn trang Blog Tech:
// - Quản lý ngân hàng câu hỏi QUIZ_BANK
// - Tính điểm, kiểm tra đúng/sai, hiển thị giải thích chi tiết
// - Lọc câu hỏi (Tất cả, Đúng, Sai, Chưa làm)
// - Lưu trữ trạng thái làm bài vào localStorage qua state.js

const QUIZ_BANK = {}; // { "<docId>": { docId, section, category, title, quizzes: [...] } }

window.__quizLoaded = function (sectionId, bank) {
  Object.assign(QUIZ_BANK, bank);
};

const _loadingPromises = {};

/**
 * Nạp file quiz của một mảng. Trả về Promise luôn resolve — thiếu quiz không
 * phải lỗi, chỉ là mảng đó chưa có bài tập.
 */
function loadQuizBank(sectionId) {
  if (!sectionId) return Promise.resolve(false);
  if (_loadingPromises[sectionId]) return _loadingPromises[sectionId];

  _loadingPromises[sectionId] = new Promise((resolve) => {
    // Nếu ngân hàng đã có ít nhất một bài của mảng này thì không nạp lại
    const hasAny = Object.values(QUIZ_BANK).some((b) => b.section === sectionId);
    if (hasAny) return resolve(true);

    const script = document.createElement("script");
    script.src = `generated/quiz-${encodeURIComponent(sectionId)}.js`;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.warn(`Không tải được quiz cho mảng ${sectionId}`);
      resolve(false);
    };
    document.head.appendChild(script);
  });

  return _loadingPromises[sectionId];
}

const qKeyOf = (docId, number) => `${docId}#${number}`;
const answersOf = (qKey) => new Set(state.quizAnswers[qKey] || []);
const isChecked = (qKey) => state.quizChecked.has(qKey);

function isCorrect(qKey, question) {
  const picked = answersOf(qKey);
  const correct = new Set(question.correctAnswers);
  return picked.size === correct.size && [...picked].every((k) => correct.has(k));
}

/** Danh sách câu hỏi của một bài, hoặc của tất cả khi docId === "all". */
function questionsOf(docId) {
  if (docId === "all") {
    return Object.values(QUIZ_BANK).flatMap((b) => b.quizzes.map((q) => ({ docId: b.docId, q })));
  }
  return (QUIZ_BANK[docId]?.quizzes || []).map((q) => ({ docId, q }));
}

function scoreOf(docId) {
  const entries = questionsOf(docId);
  const done = entries.filter(({ docId: id, q }) => isChecked(qKeyOf(id, q.number)));
  const correct = done.filter(({ docId: id, q }) => isCorrect(qKeyOf(id, q.number), q)).length;
  const total = entries.length;
  return { correct, answered: done.length, total, pct: total ? Math.round((correct / total) * 100) : 0 };
}

function statusHtml(qKey, question) {
  if (!isChecked(qKey)) {
    return '<span class="quiz-status-idle text-xs font-semibold text-slate-500 dark:text-slate-400">Chọn đáp án rồi bấm Kiểm tra</span>';
  }
  return isCorrect(qKey, question)
    ? '<span class="quiz-status-ok font-bold text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm flex items-center gap-1"><span>✓</span> <span>Chính xác!</span></span>'
    : `<span class="quiz-status-bad font-bold text-rose-600 dark:text-rose-400 text-xs sm:text-sm flex items-center gap-1"><span>✗</span> <span>Chưa đúng. Đáp án: <b>${escapeHtml(question.correctAnswers.join(", "))}</b></span></span>`;
}

function renderQuestionCard(docId, question) {
  const qKey = qKeyOf(docId, question.number);
  const picked = answersOf(qKey);
  const checked = isChecked(qKey);
  const correct = checked && isCorrect(qKey, question);
  const cardClass = checked ? (correct ? "answered-correct" : "answered-wrong") : "";

  const options = question.options.map((opt) => {
    const selected = picked.has(opt.key);
    let cls = selected ? "selected" : "";
    if (checked) {
      if (question.correctAnswers.includes(opt.key)) cls += " is-correct-choice";
      else if (selected) cls += " is-wrong-choice";
    }
    return `<label class="quiz-option-label ${cls}" data-quiz-option data-opt-key="${attr(opt.key)}">
      <input type="${question.isMulti ? "checkbox" : "radio"}" name="${attr(qKey)}"
             value="${attr(opt.key)}" ${selected ? "checked" : ""} ${checked ? "disabled" : ""} tabindex="-1">
      <span class="quiz-option-key">${escapeHtml(opt.key)}.</span>
      <span class="quiz-option-text">${renderMarkdown(opt.text)}</span>
    </label>`;
  }).join("");

  return `<div class="quiz-card ${cardClass}" id="${attr(qKey)}" data-quiz-card
               data-doc-id="${attr(docId)}" data-number="${attr(question.number)}"
               data-multi="${question.isMulti ? "1" : "0"}"
               data-checked="${checked ? "1" : "0"}"
               data-correct="${correct ? "1" : "0"}">
    <div class="quiz-card-top">
      <div class="quiz-question-badge">Câu ${escapeHtml(question.number)}</div>
      <div class="quiz-type-tag">${question.isMulti ? "Chọn NHIỀU đáp án" : "Chọn 1 đáp án"}</div>
    </div>
    <div class="quiz-question-body">${renderMarkdown(question.question)}</div>
    <div class="quiz-options-list">${options}</div>
    <div class="quiz-card-footer">
      <div class="quiz-footer-status">${statusHtml(qKey, question)}</div>
      <button class="btn-check-single" type="button" data-quiz-check>
        ${checked ? "🔍 Xem lại giải thích" : "Kiểm tra đáp án ➔"}
      </button>
    </div>
    <div class="quiz-explanation-box ${checked ? "show" : ""} ${checked && !correct ? "wrong-exp" : ""}">
      <div class="quiz-exp-title">
        <span>${checked && correct ? "💡" : "⚠️"}</span>
        <span>GIẢI THÍCH (Đáp án: ${escapeHtml(question.correctAnswers.join(", "))})</span>
      </div>
      <div class="quiz-exp-text">${renderMarkdown(question.explanation || "Không có giải thích bổ sung.")}</div>
    </div>
  </div>`;
}

/** Phần bài tập gắn ở cuối trang đọc. Rỗng nếu bài không có quiz. */
function renderDocQuizSection(docId) {
  const bank = QUIZ_BANK[docId];
  if (!bank || !bank.quizzes || !bank.quizzes.length) return "";
  const score = scoreOf(docId);
  return `<section class="in-doc-quiz-section" id="in-doc-quiz-root" data-quiz-scope="${attr(docId)}">
    <div class="in-doc-quiz-banner">
      <div class="in-doc-quiz-title">
        <h3><span>📝</span> Bài tập trắc nghiệm (${bank.quizzes.length} câu)</h3>
        <p>Chọn đáp án rồi bấm Kiểm tra để xem ngay đúng/sai kèm lời giải chi tiết.</p>
      </div>
      <div class="in-doc-quiz-actions flex items-center gap-2 flex-wrap">
        <div class="quiz-score-badge" data-quiz-score>Kết quả: <b>${score.correct}</b> / ${score.total} (${score.pct}%)</div>
        <button class="btn-quiz-secondary" type="button" data-quiz-reset>🔄 Làm lại</button>
        <button class="btn-quiz-primary" type="button" data-quiz-submit>📝 Chấm toàn bộ</button>
      </div>
    </div>
    <div class="quiz-cards-wrapper flex flex-col gap-6 mt-4">
      ${bank.quizzes.map((q) => renderQuestionCard(docId, q)).join("")}
    </div>
  </section>`;
}

function findQuestion(docId, number) {
  return (QUIZ_BANK[docId]?.quizzes || []).find((q) => String(q.number) === String(number)) || null;
}

/** Chấm một câu và cập nhật đúng thẻ đó, không render lại cả trang. */
function checkQuestion(card) {
  const docId = card.dataset.docId;
  const question = findQuestion(docId, card.dataset.number);
  if (!question) return;

  const qKey = qKeyOf(docId, question.number);
  state.quizChecked.add(qKey);
  persistQuiz();

  const correct = isCorrect(qKey, question);
  const picked = answersOf(qKey);

  card.dataset.checked = "1";
  card.dataset.correct = correct ? "1" : "0";

  card.classList.remove("answered-correct", "answered-wrong");
  card.classList.add(correct ? "answered-correct" : "answered-wrong");

  qsa(".quiz-option-label", card).forEach((label) => {
    const key = label.dataset.optKey;
    const input = label.querySelector("input");
    if (input) input.disabled = true;
    label.classList.remove("is-correct-choice", "is-wrong-choice");
    if (question.correctAnswers.includes(key)) label.classList.add("is-correct-choice");
    else if (picked.has(key)) label.classList.add("is-wrong-choice");
  });

  const status = qs(".quiz-footer-status", card);
  if (status) status.innerHTML = statusHtml(qKey, question);

  const button = qs("[data-quiz-check]", card);
  if (button) button.textContent = "🔍 Xem lại giải thích";

  const box = qs(".quiz-explanation-box", card);
  if (box) {
    box.classList.toggle("wrong-exp", !correct);
    box.classList.add("show");
  }
}

function refreshScopeScore(scope) {
  const docId = scope?.dataset.quizScope;
  const badge = scope && qs("[data-quiz-score]", scope);
  if (!docId || !badge) return;
  const score = scoreOf(docId);
  badge.innerHTML = `Kết quả: <b>${score.correct}</b> / ${score.total} (${score.pct}%)`;

  // Cập nhật số lượng đếm trên các filter pills nếu có
  const scopeRoot = scope.closest(".quiz-player-container") || scope;
  updateFilterCounts(scopeRoot, docId);
}

function updateFilterCounts(root, docId) {
  const entries = questionsOf(docId);
  const total = entries.length;
  let correct = 0;
  let wrong = 0;
  let unanswered = 0;

  entries.forEach(({ docId: id, q }) => {
    const qKey = qKeyOf(id, q.number);
    if (!isChecked(qKey)) {
      unanswered++;
    } else if (isCorrect(qKey, q)) {
      correct++;
    } else {
      wrong++;
    }
  });

  const countAll = qs("[data-count-all]", root);
  if (countAll) countAll.textContent = total;
  const countCorrect = qs("[data-count-correct]", root);
  if (countCorrect) countCorrect.textContent = correct;
  const countWrong = qs("[data-count-wrong]", root);
  if (countWrong) countWrong.textContent = wrong;
  const countUnanswered = qs("[data-count-unanswered]", root);
  if (countUnanswered) countUnanswered.textContent = unanswered;
}

/**
 * Gắn toàn bộ tương tác quiz cho một vùng chứa.
 * @param {(scope: Element) => void} [onRerender] gọi khi cần dựng lại danh sách.
 */
function bindQuiz(root, onRerender) {
  if (!root) return;

  delegate(root, "click", "[data-quiz-option]", (event, label) => {
    event.preventDefault();
    const card = label.closest("[data-quiz-card]");
    if (!card) return;
    const qKey = qKeyOf(card.dataset.docId, card.dataset.number);
    if (isChecked(qKey)) return;

    const picked = answersOf(qKey);
    const key = label.dataset.optKey;
    if (card.dataset.multi === "1") {
      picked.has(key) ? picked.delete(key) : picked.add(key);
    } else {
      picked.clear();
      picked.add(key);
    }
    state.quizAnswers[qKey] = [...picked];
    persistQuiz();

    qsa(".quiz-option-label", card).forEach((el) => {
      const selected = picked.has(el.dataset.optKey);
      el.classList.toggle("selected", selected);
      const input = el.querySelector("input");
      if (input) input.checked = selected;
    });
  });

  delegate(root, "click", "[data-quiz-check]", (event, button) => {
    const card = button.closest("[data-quiz-card]");
    if (!card) return;
    checkQuestion(card);
    refreshScopeScore(card.closest("[data-quiz-scope]"));
  });

  delegate(root, "click", "[data-quiz-submit]", (event, button) => {
    const scope = button.closest("[data-quiz-scope]");
    qsa("[data-quiz-card]", scope).forEach(checkQuestion);
    refreshScopeScore(scope);
    if (typeof showToast === "function") {
      const docId = scope?.dataset.quizScope;
      const score = scoreOf(docId);
      showToast(`Đã chấm xong! Điểm của bạn: ${score.correct}/${score.total} (${score.pct}%)`);
    }
  });

  delegate(root, "click", "[data-quiz-reset]", (event, button) => {
    if (!confirm("Bạn có chắc chắn muốn xoá câu trả lời và làm lại bài này không?")) return;
    const scope = button.closest("[data-quiz-scope]");
    const docId = scope?.dataset.quizScope;
    questionsOf(docId).map(({ docId: id, q }) => qKeyOf(id, q.number)).forEach((qKey) => {
      delete state.quizAnswers[qKey];
      state.quizChecked.delete(qKey);
    });
    persistQuiz();
    if (onRerender) {
      onRerender(scope);
    } else {
      // Làm mới lại các card trong scope
      const bank = QUIZ_BANK[docId];
      if (bank) {
        const wrapper = qs(".quiz-cards-wrapper", scope);
        if (wrapper) wrapper.innerHTML = bank.quizzes.map((q) => renderQuestionCard(docId, q)).join("");
        refreshScopeScore(scope);
      }
    }
    if (typeof showToast === "function") showToast("Đã đặt lại bài thi.");
  });

  // Xử lý bộ lọc filter tabs (Tất cả, Câu đúng, Câu sai, Chưa làm)
  delegate(root, "click", "[data-quiz-filter]", (event, tab) => {
    event.preventDefault();
    const filter = tab.dataset.quizFilter;
    const scope = tab.closest("[data-quiz-scope]") || root;

    qsa("[data-quiz-filter]", root).forEach((t) => t.classList.toggle("active", t === tab));

    qsa("[data-quiz-card]", scope).forEach((card) => {
      const checked = card.dataset.checked === "1";
      const correct = card.dataset.correct === "1";
      let show = true;
      if (filter === "correct") show = checked && correct;
      else if (filter === "wrong") show = checked && !correct;
      else if (filter === "unanswered") show = !checked;

      card.style.display = show ? "" : "none";
    });
  });
}
