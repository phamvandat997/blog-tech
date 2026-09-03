"use strict";
// Thứ duy nhất cần nhớ giữa các lần mở trang: giao diện sáng/tối.
// Không theo dõi tiến độ đọc, không đánh dấu yêu thích.

const STORE = {
  theme: "blog.theme",
  completedDocs: "blog.completedDocs",
};

/**
 * Chưa từng chọn thì theo cài đặt của hệ điều hành, chứ không mặc định sáng —
 * người để máy ở chế độ tối vào lần đầu sẽ bị loá cả trang.
 * Đã bấm nút đổi giao diện thì lựa chọn đó thắng, kể cả khi hệ thống khác.
 */
function preferredTheme() {
  try {
    const saved = localStorage.getItem(STORE.theme);
    if (saved === "dark" || saved === "light") return saved;
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  } catch { return "light"; }
}

const hasThemeChoice = () => {
  try { return !!localStorage.getItem(STORE.theme); } catch { return false; }
};

const state = {
  theme: preferredTheme(),
  completedDocs: null,
};

function getCompletedDocs() {
  if (state.completedDocs) return state.completedDocs;
  try {
    const raw = localStorage.getItem(STORE.completedDocs);
    state.completedDocs = new Set(raw ? JSON.parse(raw) : []);
  } catch {
    state.completedDocs = new Set();
  }
  return state.completedDocs;
}

function isDocCompleted(id) {
  return getCompletedDocs().has(id);
}

function toggleDocCompleted(id) {
  const set = getCompletedDocs();
  const isNowCompleted = !set.has(id);
  if (isNowCompleted) set.add(id); else set.delete(id);
  try {
    localStorage.setItem(STORE.completedDocs, JSON.stringify(Array.from(set)));
  } catch { /* bỏ qua */ }
  window.dispatchEvent(new CustomEvent("doc-completion-changed", { detail: { id, isCompleted: isNowCompleted } }));
  return isNowCompleted;
}

function applyTheme(theme, { remember = true } = {}) {
  state.theme = theme === "dark" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", state.theme);
  if (remember) {
    try { localStorage.setItem(STORE.theme, state.theme); } catch { /* bỏ qua */ }
  }
  document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
    btn.textContent = state.theme === "dark" ? "☀️" : "🌙";
  });
  window.dispatchEvent(new CustomEvent("theme-changed", { detail: { theme: state.theme } }));
}

function initTheme() {
  // Lượt áp đầu tiên KHÔNG được ghi nhớ: nếu ghi, theme suy từ hệ điều hành sẽ
  // bị coi là lựa chọn của người dùng và trang thôi đi theo hệ thống mãi mãi.
  applyTheme(state.theme, { remember: hasThemeChoice() });
  document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => applyTheme(state.theme === "dark" ? "light" : "dark"));
  });

  // Người dùng đổi chế độ ở cấp hệ điều hành giữa chừng: đi theo, nhưng chỉ khi
  // họ chưa tự chọn trên trang này.
  try {
    window.matchMedia?.("(prefers-color-scheme: dark)").addEventListener("change", (event) => {
      if (hasThemeChoice()) return;
      applyTheme(event.matches ? "dark" : "light", { remember: false });
    });
  } catch { /* trình duyệt cũ không có addEventListener trên MediaQueryList */ }
}
