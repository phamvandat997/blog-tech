"use strict";
// Thứ duy nhất cần nhớ giữa các lần mở trang: giao diện sáng/tối.
// Không theo dõi tiến độ đọc, không đánh dấu yêu thích.

const STORE = {
  theme: "blog.theme",
  completedDocs: "blog.completedDocs",
};

const state = {
  theme: localStorage.getItem(STORE.theme) || "light",
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

function applyTheme(theme) {
  state.theme = theme === "dark" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", state.theme);
  try { localStorage.setItem(STORE.theme, state.theme); } catch { /* bỏ qua */ }
  document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
    btn.textContent = state.theme === "dark" ? "☀️" : "🌙";
  });
  window.dispatchEvent(new CustomEvent("theme-changed", { detail: { theme: state.theme } }));
}

function initTheme() {
  applyTheme(state.theme);
  document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => applyTheme(state.theme === "dark" ? "light" : "dark"));
  });
}
