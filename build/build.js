#!/usr/bin/env node
"use strict";
const fs = require("fs");
const path = require("path");
const { scanContent } = require("./lib/scan");

const ROOT = path.join(__dirname, "..");
const CONTENT = path.join(ROOT, "content");
const OUT = path.join(ROOT, "generated");

const banner = "// TỆP SINH TỰ ĐỘNG — đừng sửa tay. Chạy: node build/build.js\n";

function writeFile(rel, body) {
  const full = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, banner + body);
  return Buffer.byteLength(body, "utf8");
}

function main() {
  if (!fs.existsSync(CONTENT)) {
    console.error("Không tìm thấy thư mục content/. Tạo content/<mảng>/<chuyên-mục>/bai.md rồi chạy lại.");
    process.exit(1);
  }

  const { sections, docs, warnings } = scanContent(CONTENT);
  warnings.forEach((w) => console.warn(`  ⚠ ${w}`));

  // Sắp bài theo đúng thứ tự chuyên mục đã khai báo trong _section.json.
  const rank = new Map();
  sections.forEach((s, si) =>
    s.categories.forEach((c, ci) => rank.set(`${s.id}/${c.id}`, si * 1000 + ci)));
  docs.sort((a, b) =>
    (rank.get(`${a.section}/${a.category}`) ?? 1e9) - (rank.get(`${b.section}/${b.category}`) ?? 1e9) ||
    a.order - b.order || a.slug.localeCompare(b.slug));

  fs.rmSync(OUT, { recursive: true, force: true });

  // 1. catalog.js — metadata, nhẹ, mọi trang đều nạp.
  const meta = docs.map(({ _body, ...rest }) => rest);
  writeFile("catalog.js",
    `const SECTIONS = ${JSON.stringify(sections, null, 1)};\n` +
    `const DOCUMENTS = ${JSON.stringify(meta, null, 1)};\n`);

  // 2. Một file nội dung cho mỗi bài — reader chỉ nạp đúng bài đang mở.
  let contentBytes = 0;
  for (const doc of docs) {
    contentBytes += writeFile(`docs/${doc.contentFile}.js`,
      `window.__docLoaded && window.__docLoaded(${JSON.stringify(doc.id)}, ${JSON.stringify(doc._body)});\n`);
  }

  console.log(`✓ ${sections.length} mảng · ${docs.length} bài`);
  console.log(`✓ generated/catalog.js  ${(Buffer.byteLength(JSON.stringify(meta)) / 1024).toFixed(0)} KB`);
  console.log(`✓ generated/docs/       ${docs.length} file, ${(contentBytes / 1024).toFixed(0)} KB tổng ` +
              `(reader chỉ nạp 1 file mỗi lần)`);
  sections.forEach((s) => console.log(`   ${s.name}: ${s.docCount} bài, ${s.categories.length} chuyên mục`));
  if (warnings.length) console.log(`\n${warnings.length} cảnh báo ở trên — build vẫn thành công.`);
}

main();
