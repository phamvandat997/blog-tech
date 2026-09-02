"use strict";
// Trình dựng Markdown tối giản, đủ cho nội dung của blog: heading có id,
// khối mã có nút chép, GitHub alerts, bảng, danh sách, in đậm/nghiêng.
// Mục lục do trang đọc dựng từ DOM đã render (xem reader.js).
//
// Nguyên tắc an toàn: thoát `&` và `<` trên toàn bộ văn bản TRƯỚC khi biến đổi,
// nên `List<String>` trong nội dung hiển thị đúng thay vì bị trình duyệt nuốt
// như một thẻ. `>` cố ý không thoát để cú pháp blockquote còn nhận ra được.

const ALERTS = {
  WARNING:   ["md-alert-warning",   "⚠️ CẢNH BÁO / BẪY THI CỬ"],
  IMPORTANT: ["md-alert-important", "❗ QUAN TRỌNG"],
  TIP:       ["md-alert-tip",       "💡 MẸO TỐI ƯU"],
  NOTE:      ["md-alert-note",      "ℹ️ GHI CHÚ"],
  CAUTION:   ["md-alert-warning",   "🚨 THẬN TRỌNG"],
};

const escapeText = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;");

function headingSlug(title) {
  const base = title.trim().toLowerCase()
    .replace(/[`*_]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}-]/gu, "");
  return "heading-" + (base || "muc");
}

/** Chuyển `code` trong một dòng văn bản thành <code>, có thoát ký tự. */
function renderInlineCode(text) {
  return escapeText(text).replace(/`([^`]+)`/g, (_, code) => `<code>${code}</code>`);
}

function renderMarkdown(md) {
  if (!md) return "";

  // 1. Rút khối mã ra trước, thay bằng chốt có dấu đóng ở cả hai đầu.
  //    (Bản cũ dùng "code_placeholder_1" nên bị "code_placeholder_10" nuốt mất
  //    — mọi bài có từ 11 khối mã trở lên đều hỏng.)
  const blocks = [];
  let text = md.replace(/```([\w+-]*)\r?\n([\s\S]*?)```/g, (_, lang, code) => {
    const label = (lang || "text").toUpperCase();
    blocks.push(`<div class="code-block-wrapper">
      <div class="code-block-header">
        <span>${escapeHtml(label)}</span>
        <button class="code-copy-btn" type="button" data-copy-code>Sao chép mã</button>
      </div>
      <pre><code class="language-${escapeHtml(lang || "text")}">${escapeText(code)}</code></pre>
    </div>`);
    return `%%CODE${blocks.length - 1}%%`;
  });

  // 2. Thoát phần văn bản còn lại.
  text = escapeText(text);

  // 3. GitHub alerts, rồi blockquote thường.
  text = text.replace(/^>\s*\[!(\w+)\]\s*\r?\n((?:>.*(?:\r?\n|$))+)/gim, (match, kind, body) => {
    const alert = ALERTS[kind.toUpperCase()];
    if (!alert) return match;
    const [cls, title] = alert;
    return `<div class="md-alert ${cls}"><div class="md-alert-title">${title}</div><div>${body.replace(/^>\s?/gm, "")}</div></div>\n`;
  });
  text = text.replace(/^>\s+(.*)$/gim, (_, line) => `<blockquote>${line}</blockquote>`);

  // 4. Heading — h2/h3 có id để mục lục nhảy tới được.
  text = text
    .replace(/^#{4,6}\s+(.*)$/gim, (_, t) => `<h4>${t}</h4>`)
    .replace(/^###\s+(.*)$/gim, (_, t) => `<h3 id="${escapeHtml(headingSlug(t))}">${t}</h3>`)
    .replace(/^##\s+(.*)$/gim, (_, t) => `<h2 id="${escapeHtml(headingSlug(t))}">${t}</h2>`)
    .replace(/^#\s+(.*)$/gim, (_, t) => `<h1>${t}</h1>`);

  // 5. Đường kẻ ngang, nhấn mạnh, mã inline.
  text = text
    .replace(/^\s*(?:---|\*\*\*|___)\s*$/gim, "<hr>")
    .replace(/\*\*\*([^*]+)\*\*\*/g, (_, t) => `<b><i>${t}</i></b>`)
    .replace(/\*\*([^*]+)\*\*/g, (_, t) => `<b>${t}</b>`)
    .replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, (_, pre, t) => `${pre}<i>${t}</i>`)
    .replace(/`([^`\n]+)`/g, (_, t) => `<code>${t}</code>`);

  // 6. Bảng: bỏ dòng phân cách, gộp các <tr> liền nhau thành một <table>.
  text = text.replace(/^\|(.+)\|[ \t]*$/gim, (row) => {
    const cells = row.trim().slice(1, -1).split("|");
    if (cells.some((c) => /^\s*:?-{2,}:?\s*$/.test(c))) return "%%TSEP%%";
    return "<tr>" + cells.map((c) => `<td>${c.trim()}</td>`).join("") + "</tr>";
  });
  text = text.replace(/%%TSEP%%\r?\n?/g, "");
  text = text.replace(/(?:<tr>[\s\S]*?<\/tr>\s*)+/g, (rows) =>
    `<div class="table-responsive-wrapper"><table>${rows.replace(/>\s+</g, "><").trim()}</table></div>`);

  // 7. Danh sách: bọc các <li> liền nhau vào <ul>.
  text = text.replace(/^[ \t]*(?:[-*+]|\d+\.)\s+(.*)$/gim, (_, t) => `<li>${t}</li>`);
  text = text.replace(/(?:<li>[\s\S]*?<\/li>\s*)+/g, (items) => `<ul>${items.trim()}</ul>`);

  // 8. Đoạn văn.
  text = text.replace(/\r?\n\s*\r?\n/g, "</p><p>");

  // 9. Trả khối mã về chỗ cũ (dùng hàm nên "$&" trong mã không bị hiểu nhầm).
  text = text.replace(/%%CODE(\d+)%%/g, (_, i) => blocks[Number(i)] || "");

  return `<div class="markdown-content"><p>${text}</p></div>`;
}

// Nút "Sao chép mã" — uỷ nhiệm một lần cho toàn trang.
document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-copy-code]");
  if (!button) return;
  const code = button.closest(".code-block-wrapper")?.querySelector("pre code");
  if (!code) return;
  navigator.clipboard.writeText(code.innerText).then(() => {
    const original = button.textContent;
    button.textContent = "✓ Đã chép!";
    button.classList.add("copied");
    setTimeout(() => { button.textContent = original; button.classList.remove("copied"); }, 1800);
  }, () => showToast("Trình duyệt chặn truy cập clipboard"));
});
