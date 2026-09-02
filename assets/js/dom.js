"use strict";
// Tiện ích DOM dùng chung cho cả ba trang.

/** Thoát ký tự HTML. Mọi dữ liệu từ frontmatter đều phải đi qua đây. */
function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Thoát cho thuộc tính — dùng khi nhúng vào `data-*` hoặc `href`. */
const attr = escapeHtml;

const qs = (sel, root = document) => root.querySelector(sel);
const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/**
 * Uỷ nhiệm sự kiện: gắn một lần lên container, hoạt động với cả nội dung
 * render lại. Thay cho onclick nội suy trong chuỗi HTML.
 */
function delegate(root, eventName, selector, handler) {
  if (!root) return;
  root.addEventListener(eventName, (event) => {
    const target = event.target.closest(selector);
    if (target && root.contains(target)) handler(event, target);
  });
}

let toastTimer = null;
function showToast(message) {
  let toast = qs(".app-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "app-toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("visible"), 2200);
}

function emptyState(icon, title, text, actionHtml = "") {
  return `<div class="empty-state">
    <div class="empty-icon">${escapeHtml(icon)}</div>
    <h3>${escapeHtml(title)}</h3>
    <p>${escapeHtml(text)}</p>
    ${actionHtml}
  </div>`;
}

function initBackToTop() {
  const btn = qs("#btn-back-to-top");
  if (!btn) return;
  window.addEventListener("scroll", () => {
    btn.classList.toggle("visible", window.scrollY > 280);
  }, { passive: true });
  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

function initSearchShortcut(inputSelector) {
  const input = qs(inputSelector);
  if (!input) return;

  const isMac = typeof navigator !== "undefined" && /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform || navigator.userAgent);
  qsa(".search-kbd").forEach((k) => (k.textContent = isMac ? "⌘K" : "Ctrl+K"));

  document.addEventListener("keydown", (e) => {
    const tag = document.activeElement?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || document.activeElement?.isContentEditable) {
      if (e.key === "Escape" && document.activeElement === input) {
        input.blur();
      }
      return;
    }
    if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
      e.preventDefault();
      input.focus();
      input.select();
    }
  });
}
