#!/usr/bin/env node
"use strict";
// Đóng gói bản deploy vào dist/: chỉ những gì trình duyệt cần.
// Nguồn markdown, script build và tài liệu thiết kế không lên production.
// Chạy sau build/build.js (npm run dist làm cả hai).

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DIST = path.join(ROOT, "dist");

const ENTRIES = [
  "index.html",
  "hub.html",
  "reader.html",
  "quiz.html",
  "admin.html",
  "404.html",
  "favicon.svg",
  "assets",
  "generated",
  "src",
];

function sizeOf(target) {
  const stat = fs.statSync(target);
  if (stat.isFile()) return stat.size;
  return fs.readdirSync(target).reduce((n, name) => n + sizeOf(path.join(target, name)), 0);
}

function countFiles(target) {
  const stat = fs.statSync(target);
  if (stat.isFile()) return 1;
  return fs.readdirSync(target).reduce((n, name) => n + countFiles(path.join(target, name)), 0);
}

function main() {
  const missing = ENTRIES.filter((e) => !fs.existsSync(path.join(ROOT, e)));
  if (missing.length) {
    console.error(`Thiếu ${missing.join(", ")}. Chạy "npm run build" trước.`);
    process.exit(1);
  }

  fs.rmSync(DIST, { recursive: true, force: true });
  fs.mkdirSync(DIST, { recursive: true });

  let files = 0;
  let bytes = 0;
  for (const entry of ENTRIES) {
    const from = path.join(ROOT, entry);
    fs.cpSync(from, path.join(DIST, entry), { recursive: true });
    files += countFiles(from);
    bytes += sizeOf(from);
  }

  // robots.txt và sitemap.xml do build sinh vào generated/, nhưng công cụ tìm
  // kiếm chỉ tìm chúng ở gốc site — nâng lên một tầng.
  const promoted = [];
  for (const name of ["robots.txt", "sitemap.xml"]) {
    const from = path.join(ROOT, "generated", name);
    if (!fs.existsSync(from)) continue;
    fs.copyFileSync(from, path.join(DIST, name));
    promoted.push(name);
  }

  console.log(`✓ dist/ · ${files} file · ${(bytes / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  ${ENTRIES.join(", ")}`);
  console.log(promoted.length
    ? `  + ${promoted.join(", ")} (đưa từ generated/ lên gốc)`
    : "  (chưa có robots.txt/sitemap.xml — xem ghi chú ở bước build)");
  console.log("  (content/, build/, docs/ không đưa lên production)");
}

if (require.main === module) main();

// Xuất ra để build/dist.test.js đối chiếu: mọi tệp cục bộ mà các trang HTML
// tham chiếu đều phải nằm trong danh sách này, nếu không production sẽ 404.
module.exports = { ENTRIES };
