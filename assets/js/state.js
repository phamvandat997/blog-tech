"use strict";
// Trạng thái người đọc, lưu ở localStorage nên sống qua mọi lần tải lại.
// Khoá tiền tố "blog." — bản cũ dùng "ocp." và được nâng cấp một lần.

const STORE = {
  favorites: "blog.favorites",
  completed: "blog.completed",
  theme: "blog.theme",
  viewMode: "blog.viewMode",
  quizAnswers: "blog.quizAnswers",
  quizChecked: "blog.quizChecked",
};

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* quota/private mode */ }
}

const state = {
  favorites: new Set(readJson(STORE.favorites, [])),
  completed: new Set(readJson(STORE.completed, [])),
  theme: localStorage.getItem(STORE.theme) || "light",
  viewMode: localStorage.getItem(STORE.viewMode) || "grid",
  // { "<docId>#<số câu>": ["A","C"] } — lưu mảng để JSON hoá được.
  quizAnswers: readJson(STORE.quizAnswers, {}),
  quizChecked: new Set(readJson(STORE.quizChecked, [])),
};

function persistFavorites() { writeJson(STORE.favorites, [...state.favorites]); }
function persistCompleted() { writeJson(STORE.completed, [...state.completed]); }
function persistQuiz() {
  writeJson(STORE.quizAnswers, state.quizAnswers);
  writeJson(STORE.quizChecked, [...state.quizChecked]);
}

function toggleFavorite(docId) {
  state.favorites.has(docId) ? state.favorites.delete(docId) : state.favorites.add(docId);
  persistFavorites();
  return state.favorites.has(docId);
}

function toggleCompleted(docId) {
  state.completed.has(docId) ? state.completed.delete(docId) : state.completed.add(docId);
  persistCompleted();
  return state.completed.has(docId);
}

function applyTheme(theme) {
  state.theme = theme === "dark" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", state.theme);
  try { localStorage.setItem(STORE.theme, state.theme); } catch { /* bỏ qua */ }
  document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
    btn.textContent = state.theme === "dark" ? "☀️" : "🌙";
  });
}

function initTheme() {
  applyTheme(state.theme);
  document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => applyTheme(state.theme === "dark" ? "light" : "dark"));
  });
}

function setViewMode(mode) {
  state.viewMode = mode === "list" ? "list" : "grid";
  try { localStorage.setItem(STORE.viewMode, state.viewMode); } catch { /* bỏ qua */ }
}
