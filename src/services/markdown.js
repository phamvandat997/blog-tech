// Bộ máy render Markdown và Syntax Highlighting cho React

const ALERTS = {
  WARNING:   ["md-alert-warning",   "⚠️ CẢNH BÁO / BẪY THI CỬ"],
  IMPORTANT: ["md-alert-important", "❗ QUAN TRỌNG"],
  TIP:       ["md-alert-tip",       "💡 MẸO TỐI ƯU"],
  NOTE:      ["md-alert-note",      "ℹ️ GHI CHÚ"],
  CAUTION:   ["md-alert-warning",   "🚨 THẬN TRỌNG"],
};

export const escapeText = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;");
export const escapeHtml = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function safeUrl(url) {
  const u = String(url ?? "").trim();
  const probe = u.replace(/[\u0000-\u0020]/g, "").toLowerCase();
  if (/^[a-z][a-z0-9+.-]*:/.test(probe)) {
    const scheme = probe.slice(0, probe.indexOf(":"));
    if (!["http", "https", "mailto", "tel"].includes(scheme)) return "#";
  }
  return u;
}

export function headingSlug(title) {
  const base = title.trim().toLowerCase()
    .replace(/[`*_]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}-]/gu, "");
  return "heading-" + (base || "muc");
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

export function highlightCode(rawCode, lang = "text") {
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

    const [, commentOrStr, annotation, number, arrow, word] = match;
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
      result += escapeCodeText(match[0]);
    }
  }

  if (lastIndex < rawCode.length) {
    result += escapeCodeText(rawCode.slice(lastIndex));
  }

  return result;
}

export function renderMarkdown(md) {
  if (!md) return "";

  const blocks = [];
  let text = md.replace(/```([\w+-]*)\r?\n([\s\S]*?)```/g, (_, lang, code) => {
    const l = (lang || "").toLowerCase();
    if (l === "mermaid") {
      const trimmed = code.trim();
      blocks.push(`<div class="mermaid-block-wrapper">
        <div class="mermaid-block-header">
          <span>📊 SƠ ĐỒ HỆ THỐNG (MERMAID)</span>
          <button class="code-copy-btn" type="button" data-copy-code aria-label="Sao chép mã"><span class="copy-icon">📋</span> <span class="copy-label">Sao chép</span></button>
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
        <button class="code-copy-btn" type="button" data-copy-code aria-label="Sao chép mã"><span class="copy-icon">📋</span> <span class="copy-label">Sao chép</span></button>
      </div>
      <pre><code class="language-${escapeHtml(lang || "text")}">${highlighted}</code></pre>
    </div>`);
    return `%%CODE${blocks.length - 1}%%`;
  });

  text = escapeText(text);

  text = text.replace(/^>\s*\[!(\w+)\]\s*\r?\n((?:>.*(?:\r?\n|$))+)/gim, (match, kind, body) => {
    const alert = ALERTS[kind.toUpperCase()];
    if (!alert) return match;
    const [cls, title] = alert;
    return `<div class="md-alert ${cls}"><div class="md-alert-title">${title}</div><div>${body.replace(/^>\s?/gm, "")}</div></div>\n`;
  });
  text = text.replace(/^>\s+(.*)$/gim, (_, line) => `<blockquote>${line}</blockquote>`);

  text = text
    .replace(/^#{4,6}\s+(.*)$/gim, (_, t) => `<h4>${t}</h4>`)
    .replace(/^###\s+(.*)$/gim, (_, t) => `<h3 id="${escapeHtml(headingSlug(t))}">${t}</h3>`)
    .replace(/^##\s+(.*)$/gim, (_, t) => `<h2 id="${escapeHtml(headingSlug(t))}">${t}</h2>`)
    .replace(/^#\s+(.*)$/gim, (_, t) => `<h1>${t}</h1>`);

  text = text
    .replace(/^\s*(?:---|\*\*\*|___)\s*$/gim, "<hr>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, url) => {
      const u = safeUrl(url.trim());
      const isExternal = /^https?:\/\//i.test(u);
      return `<a href="${escapeHtml(u)}" ${isExternal ? 'target="_blank" rel="noopener noreferrer"' : ""}>${label}</a>`;
    })
    .replace(/\*\*\*([^*]+)\*\*\*/g, (_, t) => `<b><i>${t}</i></b>`)
    .replace(/\*\*([^*]+)\*\*/g, (_, t) => `<b>${t}</b>`)
    .replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, (_, pre, t) => `${pre}<i>${t}</i>`)
    .replace(/`([^`\n]+)`/g, (_, t) => `<code>${t}</code>`);

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

  text = text.replace(/^[ \t]*([-*+]|\d+)[.)]?\s+(.*)$/gim, (full, marker, t) => {
    if (/^[-*+]$/.test(marker)) return `<li data-l="u">${t}</li>`;
    if (!/^\s*\d+[.)]/.test(full)) return full;
    return `<li data-l="o" data-n="${marker}">${t}</li>`;
  });

  text = text.replace(/(?:<li data-l="[uo]"(?: data-n="\d+")?>[\s\S]*?<\/li>\s*)+/g, (block) => {
    const items = [...block.matchAll(/<li data-l="([uo])"(?: data-n="(\d+)")?>([\s\S]*?)<\/li>/g)];
    let html = "";
    let kind = null;
    let start = null;
    let buffer = [];

    const flush = () => {
      if (!buffer.length) return;
      if (kind === "o") {
        const attr = start && start !== "1" ? ` start="${start}"` : "";
        html += `<ol${attr}>${buffer.join("")}</ol>`;
      } else {
        html += `<ul>${buffer.join("")}</ul>`;
      }
      buffer = [];
    };

    for (const [, type, num, content] of items) {
      if (type !== kind) { flush(); kind = type; start = num || null; }
      buffer.push(`<li>${content}</li>`);
    }
    flush();
    return html;
  });

  text = `<p>${text}</p>`.replace(/\r?\n\s*\r?\n/g, "</p><p>");
  text = text.replace(/%%CODE(\d+)%%/g, (_, i) => blocks[Number(i)] || "");
  text = text.replace(/<p>\s*<\/p>/g, "")
             .replace(/<p>\s*(<(?:div|table|ul|ol|h[1-6]|hr|blockquote)[\s\S]*?<\/(?:div|table|ul|ol|h[1-6]|blockquote)>|<hr>)\s*<\/p>/g, "$1");

  return `<div class="markdown-content">${text}</div>`;
}
