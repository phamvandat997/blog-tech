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
  "admin.html",
  "404.html",
  "assets",
  "generated",
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

  console.log(`✓ dist/ · ${files} file · ${(bytes / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  ${ENTRIES.join(", ")}`);
  console.log("  (content/, build/, docs/ không đưa lên production)");
}

main();
