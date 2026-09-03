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

/**
 * Chỉ cho qua những scheme vô hại. Thoát ký tự thôi là chưa đủ: `javascript:`
 * và `data:` không phá được thuộc tính href nhưng vẫn chạy khi người ta bấm —
 * và trang xem thử chạy cùng origin với /admin, nơi token GitHub nằm trong
 * localStorage. Một file .md lấy từ nguồn lạ là đủ để mất token.
 *
 * Cho phép: http, https, mailto, tel, neo #… và mọi đường dẫn tương đối.
 * Chặn phần còn lại bằng cách trả về "#".
 */
function safeUrl(url) {
  const u = String(url ?? "").trim();
  // Ký tự điều khiển và khoảng trắng chen giữa dùng để né bộ lọc:
  // "java\tscript:" vẫn được trình duyệt hiểu là javascript:
  const probe = u.replace(/[\u0000-\u0020]/g, "").toLowerCase();
  if (/^[a-z][a-z0-9+.-]*:/.test(probe)) {
    const scheme = probe.slice(0, probe.indexOf(":"));
    if (!["http", "https", "mailto", "tel"].includes(scheme)) return "#";
  }
  return u;
}

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

const KEYWORDS = new Set([
  "abstract", "assert", "async", "await", "boolean", "break", "byte", "case", "catch",
  "char", "class", "const", "continue", "default", "do", "double", "else", "enum",
  "export", "extends", "final", "finally", "float", "for", "function", "if", "implements",
  "import", "instanceof", "int", "interface", "let", "long", "native", "new", "non-sealed",
  "package", "permits", "private", "protected", "public", "record", "return", "sealed",
  "short", "static", "strictfp", "super", "switch", "synchronized", "this", "throw",
  "throws", "transient", "try", "typeof", "var", "void", "volatile", "when", "while", "yield",
  "select", "from", "where", "insert", "update", "delete", "join", "order", "by", "group"
]);

const BOOLEANS = new Set(["true", "false", "null", "undefined"]);

const CODE_TOKEN_RE = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/|#(?:!|\s)[^\n]*|"""[\s\S]*?"""|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`[\s\S]*?`)|(@[A-Za-z0-9_]+)|(\b0[xX][0-9a-fA-F_]+[lL]?\b|\b0[bB][01_]+[lL]?\b|\b\d[\d_]*(?:\.[\d_]+)?(?:[eE][+-]?[\d_]+)?[fFdDlL]?\b)|(->|::)|([A-Za-z_$][A-Za-z0-9_$]*)/g;

const escapeCodeText = (s) => String(s ?? "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;");

function highlightCode(rawCode, lang = "text") {
  const l = (lang || "").toLowerCase();
  if (!["java", "js", "javascript", "ts", "typescript", "json", "sql", "sh", "bash"].includes(l)) {
    return escapeCodeText(rawCode);
  }

  let result = "";
  let lastIndex = 0;
  CODE_TOKEN_RE.lastIndex = 0;

  let match;
  while ((match = CODE_TOKEN_RE.exec(rawCode)) !== null) {
    if (match.index > lastIndex) {
      result += escapeCodeText(rawCode.slice(lastIndex, match.index));
    }
    lastIndex = CODE_TOKEN_RE.lastIndex;

    const [full, commentOrStr, annotation, number, arrow, word] = match;
    if (commentOrStr) {
      if (commentOrStr.startsWith("//") || commentOrStr.startsWith("/*") || commentOrStr.startsWith("#")) {
        result += `<span class="tok-comment">${escapeCodeText(commentOrStr)}</span>`;
      } else {
        result += `<span class="tok-string">${escapeCodeText(commentOrStr)}</span>`;
      }
    } else if (annotation) {
      result += `<span class="tok-annotation">${escapeCodeText(annotation)}</span>`;
    } else if (number) {
      result += `<span class="tok-number">${escapeCodeText(number)}</span>`;
    } else if (arrow) {
      result += `<span class="tok-operator">${escapeCodeText(arrow)}</span>`;
    } else if (word) {
      if (KEYWORDS.has(word) || KEYWORDS.has(word.toLowerCase())) {
        result += `<span class="tok-keyword">${escapeCodeText(word)}</span>`;
      } else if (BOOLEANS.has(word)) {
        result += `<span class="tok-boolean">${escapeCodeText(word)}</span>`;
      } else if (/^[A-Z][a-zA-Z0-9_]*$/.test(word)) {
        result += `<span class="tok-type">${escapeCodeText(word)}</span>`;
      } else {
        result += escapeCodeText(word);
      }
    } else {
      result += escapeCodeText(full);
    }
  }

  if (lastIndex < rawCode.length) {
    result += escapeCodeText(rawCode.slice(lastIndex));
  }

  return result;
}

function renderMarkdown(md) {
  if (!md) return "";

  // 1. Rút khối mã ra trước, thay bằng chốt có dấu đóng ở cả hai đầu.
  //    (Bản cũ dùng "code_placeholder_1" nên bị "code_placeholder_10" nuốt mất
  //    — mọi bài có từ 11 khối mã trở lên đều hỏng.)
  const blocks = [];
  let text = md.replace(/```([\w+-]*)\r?\n([\s\S]*?)```/g, (_, lang, code) => {
    const l = (lang || "").toLowerCase();
    if (l === "mermaid") {
      const trimmed = code.trim();
      blocks.push(`<div class="mermaid-block-wrapper">
        <div class="mermaid-block-header">
          <span>📊 SƠ ĐỒ HỆ THỐNG (MERMAID)</span>
          <button class="code-copy-btn" type="button" data-copy-code>Sao chép mã</button>
        </div>
        <div class="mermaid-diagram-container">
          <pre class="mermaid">${escapeHtml(trimmed)}</pre>
        </div>
      </div>`);
      return `%%CODE${blocks.length - 1}%%`;
    }

    const label = (lang || "text").toUpperCase();
    const highlighted = highlightCode(code, lang);
    blocks.push(`<div class="code-block-wrapper">
      <div class="code-block-header">
        <span>${escapeHtml(label)}</span>
        <button class="code-copy-btn" type="button" data-copy-code>Sao chép mã</button>
      </div>
      <pre><code class="language-${escapeHtml(lang || "text")}">${highlighted}</code></pre>
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

  // 5. Đường kẻ ngang, liên kết, nhấn mạnh, mã inline.
  text = text
    .replace(/^\s*(?:---|\*\*\*|___)\s*$/gim, "<hr>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, url) => {
      const u = safeUrl(url.trim());
      const isExternal = /^https?:\/\//i.test(u);
      return `<a href="${attr(u)}" ${isExternal ? 'target="_blank" rel="noopener noreferrer"' : ""}>${label}</a>`;
    })
    .replace(/\*\*\*([^*]+)\*\*\*/g, (_, t) => `<b><i>${t}</i></b>`)
    .replace(/\*\*([^*]+)\*\*/g, (_, t) => `<b>${t}</b>`)
    .replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, (_, pre, t) => `${pre}<i>${t}</i>`)
    .replace(/`([^`\n]+)`/g, (_, t) => `<code>${t}</code>`);

  // 6. Bảng: nhận diện hàng đầu là <th>, các hàng sau là <td>.
  text = text.replace(/^\|(.+)\|[ \t]*$/gim, (row) => {
    const cells = row.trim().slice(1, -1).split("|");
    if (cells.some((c) => /^\s*:?-{2,}:?\s*$/.test(c))) return "%%TSEP%%";
    return "<tr>" + cells.map((c) => `<td>${c.trim()}</td>`).join("") + "</tr>";
  });
  text = text.replace(/<tr>(.*?)<\/tr>\s*%%TSEP%%\r?\n?/g, (_, row) => {
    const ths = row.replace(/<td>/g, "<th>").replace(/<\/td>/g, "</th>");
    return `<thead><tr>${ths}</tr></thead>`;
  });
  text = text.replace(/(?:<thead>[\s\S]*?<\/thead>)?(?:<tr>[\s\S]*?<\/tr>\s*)+/g, (tbl) => {
    let body = tbl;
    let head = "";
    if (tbl.startsWith("<thead>")) {
      const endHead = tbl.indexOf("</thead>") + 8;
      head = tbl.slice(0, endHead);
      body = tbl.slice(endHead).trim();
    }
    const tbody = body ? `<tbody>${body}</tbody>` : "";
    return `<div class="table-responsive-wrapper"><table>${head}${tbody}</table></div>`;
  });

  // 7. Danh sách: bọc các <li> liền nhau vào <ul>.
  text = text.replace(/^[ \t]*(?:[-*+]|\d+\.)\s+(.*)$/gim, (_, t) => `<li>${t}</li>`);
  text = text.replace(/(?:<li>[\s\S]*?<\/li>\s*)+/g, (items) => `<ul>${items.trim()}</ul>`);

  // 8. Đoạn văn.
  text = `<p>${text}</p>`.replace(/\r?\n\s*\r?\n/g, "</p><p>");

  // 9. Trả khối mã về chỗ cũ (dùng hàm nên "$&" trong mã không bị hiểu nhầm).
  text = text.replace(/%%CODE(\d+)%%/g, (_, i) => blocks[Number(i)] || "");

  // Dọn dẹp thẻ p rỗng hoặc bọc ngoài các khối block-level
  text = text.replace(/<p>\s*<\/p>/g, "")
             .replace(/<p>\s*(<(?:div|table|ul|ol|h[1-6]|hr|blockquote)[\s\S]*?<\/(?:div|table|ul|ol|h[1-6]|blockquote)>|<hr>)\s*<\/p>/g, "$1");

  return `<div class="markdown-content">${text}</div>`;
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
