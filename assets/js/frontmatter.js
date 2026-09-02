// Đọc và ghi frontmatter. Dùng chung cho script build (Node) và trang admin
// (trình duyệt) — một bản duy nhất để hai bên không bao giờ hiểu khác nhau.
//
// Hỗ trợ một tập con YAML: `key: "chuỗi"`, `key: chuỗi trần`, `key: 12`,
// `key: true`, `key: [a, "b", 3]`. Không lồng nhau, không danh sách nhiều
// dòng — cố ý giữ hẹp để hai bên dễ khớp.

(function (root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else Object.assign(root, api);
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const DELIM = /^---[ \t]*\r?\n/;

  function parseScalar(raw) {
    const v = raw.trim();
    if (v === "") return "";
    if (v === "true") return true;
    if (v === "false") return false;
    if (v === "null" || v === "~") return null;
    if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v);
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      if (v[0] === '"') {
        try { return JSON.parse(v); } catch { /* rơi xuống bóc thủ công */ }
      }
      return v.slice(1, -1);
    }
    return v;
  }

  // Tách theo dấu phẩy ở ngoài chuỗi trích dẫn.
  function splitList(inner) {
    const out = [];
    let buf = "", quote = null;
    for (let i = 0; i < inner.length; i++) {
      const ch = inner[i];
      if (quote) {
        buf += ch;
        if (ch === "\\" && i + 1 < inner.length) { buf += inner[++i]; continue; }
        if (ch === quote) quote = null;
      } else if (ch === '"' || ch === "'") {
        quote = ch; buf += ch;
      } else if (ch === ",") {
        out.push(buf); buf = "";
      } else {
        buf += ch;
      }
    }
    if (buf.trim() !== "") out.push(buf);
    return out.map(parseScalar);
  }

  /**
   * @returns {{data: Object, body: string}} `data` rỗng nếu không có frontmatter.
   */
  function parseFrontmatter(text) {
    const src = String(text ?? "").replace(/^﻿/, "");
    if (!DELIM.test(src)) return { data: {}, body: src };

    const afterOpen = src.slice(src.match(DELIM)[0].length);
    const close = afterOpen.match(/^---[ \t]*(\r?\n|$)/m);
    if (!close) return { data: {}, body: src };

    const block = afterOpen.slice(0, close.index);
    const body = afterOpen.slice(close.index + close[0].length);

    const data = {};
    for (const line of block.split(/\r?\n/)) {
      if (!line.trim() || line.trimStart().startsWith("#")) continue;
      const m = line.match(/^([A-Za-z_][\w-]*)\s*:\s*(.*)$/);
      if (!m) continue;
      const [, key, rest] = m;
      const value = rest.trim();
      data[key] = value.startsWith("[") && value.endsWith("]")
        ? splitList(value.slice(1, -1))
        : parseScalar(value);
    }
    return { data, body };
  }

  /**
   * Dựng lại một file markdown hoàn chỉnh. Trường rỗng, null hoặc mảng rỗng
   * bị bỏ qua — build tự suy ra được, ghi ra chỉ tổ nhiễu.
   */
  function stringifyFrontmatter(data, body) {
    const lines = [];
    for (const [key, value] of Object.entries(data)) {
      if (value === undefined || value === null || value === "") continue;
      if (Array.isArray(value)) {
        if (!value.length) continue;
        lines.push(`${key}: [${value.map((v) => JSON.stringify(String(v))).join(", ")}]`);
      } else if (typeof value === "number" || typeof value === "boolean") {
        lines.push(`${key}: ${value}`);
      } else {
        lines.push(`${key}: ${JSON.stringify(String(value))}`);
      }
    }
    const text = String(body ?? "").replace(/^﻿/, "").replace(/\s+$/, "");
    if (!lines.length) return text + "\n";
    return `---\n${lines.join("\n")}\n---\n\n${text}\n`;
  }

  return { parseFrontmatter, stringifyFrontmatter };
});
