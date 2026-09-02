"use strict";
// Thứ duy nhất cần nhớ giữa các lần mở trang: giao diện sáng/tối.
// Không theo dõi tiến độ đọc, không đánh dấu yêu thích.

const STORE = { theme: "blog.theme" };

const state = { theme: localStorage.getItem(STORE.theme) || "light" };

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
