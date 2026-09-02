"use strict";
// Chỉ hai thứ cần nhớ giữa các lần mở trang: giao diện sáng/tối và bài quiz
// đang làm dở. Không theo dõi tiến độ đọc, không đánh dấu yêu thích.

const STORE = {
  theme: "blog.theme",
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
  theme: localStorage.getItem(STORE.theme) || "light",
  // { "<docId>#<số câu>": ["A","C"] } — lưu mảng để JSON hoá được.
  quizAnswers: readJson(STORE.quizAnswers, {}),
  quizChecked: new Set(readJson(STORE.quizChecked, [])),
};

function persistQuiz() {
  writeJson(STORE.quizAnswers, state.quizAnswers);
  writeJson(STORE.quizChecked, [...state.quizChecked]);
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
