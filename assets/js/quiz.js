"use strict";
// Bộ máy quiz dùng chung cho tab Quiz ở hub và phần bài tập cuối bài ở reader.
//
// Khoá mỗi câu là "<id bài>#<số câu>" — suy từ id bài nên không còn phụ thuộc
// tên file cũ. Đáp án và trạng thái đã chấm nằm trong localStorage, nên tải lại
// trang không mất bài đang làm.

const QUIZ_BANK = {}; // { "<docId>": { docId, title, quizzes: [...] } }

window.__quizLoaded = function (sectionId, bank) {
  Object.assign(QUIZ_BANK, bank);
};

/**
 * Nạp file quiz của một mảng. Trả về Promise luôn resolve — thiếu quiz không
 * phải lỗi, chỉ là mảng đó chưa có bài tập.
 */
function loadQuizBank(sectionId) {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = `generated/quiz-${encodeURIComponent(sectionId)}.js`;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
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
    return '<span class="quiz-status-idle">Chọn đáp án rồi bấm Kiểm tra</span>';
  }
  return isCorrect(qKey, question)
    ? '<span class="quiz-status-ok">✓ Chính xác!</span>'
    : `<span class="quiz-status-bad">✗ Chưa đúng. Đáp án: <b>${escapeHtml(question.correctAnswers.join(", "))}</b></span>`;
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
      <span class="quiz-option-text">${renderInlineCode(opt.text)}</span>
    </label>`;
  }).join("");

  return `<div class="quiz-card ${cardClass}" id="${attr(qKey)}" data-quiz-card
               data-doc-id="${attr(docId)}" data-number="${attr(question.number)}"
               data-multi="${question.isMulti ? "1" : "0"}">
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
        <span>GIẢI THÍCH (đáp án: ${escapeHtml(question.correctAnswers.join(", "))})</span>
      </div>
      <div class="quiz-exp-text">${renderMarkdown(question.explanation || "Không có giải thích bổ sung.")}</div>
    </div>
  </div>`;
}

/** Phần bài tập gắn ở cuối trang đọc. Rỗng nếu bài không có quiz. */
function renderDocQuizSection(docId) {
  const bank = QUIZ_BANK[docId];
  if (!bank || !bank.quizzes.length) return "";
  const score = scoreOf(docId);
  return `<section class="in-doc-quiz-section" id="in-doc-quiz-root" data-quiz-scope="${attr(docId)}">
    <div class="in-doc-quiz-banner">
      <div class="in-doc-quiz-title">
        <h3>📝 Bài tập trắc nghiệm (${bank.quizzes.length} câu)</h3>
        <p>Chọn đáp án rồi bấm Kiểm tra để xem ngay đúng/sai kèm lời giải.</p>
      </div>
      <div class="in-doc-quiz-actions">
        <div class="quiz-score-badge" data-quiz-score>Kết quả: <b>${score.correct}</b> / ${score.total} (${score.pct}%)</div>
        <button class="btn-quiz-secondary" type="button" data-quiz-reset>🔄 Làm lại</button>
        <button class="btn-quiz-primary" type="button" data-quiz-submit>📝 Chấm toàn bộ</button>
      </div>
    </div>
    <div class="quiz-cards-wrapper">
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
}

/**
 * Gắn toàn bộ tương tác quiz cho một vùng chứa. Uỷ nhiệm sự kiện nên vùng đó
 * render lại bao nhiêu lần cũng không cần gắn lại.
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
    showToast("Đã chấm toàn bộ câu hỏi.");
  });

  delegate(root, "click", "[data-quiz-reset]", (event, button) => {
    const scope = button.closest("[data-quiz-scope]");
    const docId = scope?.dataset.quizScope;
    questionsOf(docId).map(({ docId: id, q }) => qKeyOf(id, q.number)).forEach((qKey) => {
      delete state.quizAnswers[qKey];
      state.quizChecked.delete(qKey);
    });
    persistQuiz();
    if (onRerender) onRerender(scope);
    showToast("Đã làm mới bài tập.");
  });
}
