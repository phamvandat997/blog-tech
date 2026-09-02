"use strict";
// Parser cho một tập con YAML đủ dùng cho frontmatter của bài viết.
// Hỗ trợ: `key: "chuỗi"`, `key: chuỗi trần`, `key: 12`, `key: true`,
// `key: [a, "b", 3]`. Không hỗ trợ lồng nhau hay danh sách nhiều dòng — cố ý.

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
  const src = text.replace(/^﻿/, "");
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

module.exports = { parseFrontmatter };
