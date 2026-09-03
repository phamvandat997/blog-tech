"use strict";
// Bảo đảm mọi thứ các trang HTML tham chiếu đều được đóng gói vào dist/.
//
// Đã có thật một lần favicon.svg được thêm vào cả năm trang nhưng không thêm
// vào ENTRIES của dist.js, nên nó 404 trên production. Ở cây nguồn thì file
// vẫn nằm đó và không có test nào kêu — chỉ người dùng thật mới thấy.

const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const { ENTRIES } = require("./dist");

const ROOT = path.join(__dirname, "..");
const PAGES = ["index.html", "hub.html", "reader.html", "quiz.html", "admin.html", "404.html"];

/** Tệp có được ENTRIES phủ không — trực tiếp, hoặc nằm trong một thư mục đã liệt kê. */
const packaged = (file) =>
  ENTRIES.includes(file) || ENTRIES.some((e) => file.startsWith(e + "/"));

test("mọi trang HTML đều nằm trong ENTRIES", () => {
  for (const page of PAGES) assert.ok(packaged(page), `${page} không được đóng gói`);
});

test("mọi tệp cục bộ mà các trang tham chiếu đều được đóng gói", () => {
  const missing = [];
  for (const page of PAGES) {
    const html = fs.readFileSync(path.join(ROOT, page), "utf8");
    const refs = [...html.matchAll(/(?:src|href)="([^"]+)"/gi)]
      .map((m) => m[1].split(/[?#]/)[0])
      .filter((u) => u && !/^(https?:|data:|mailto:|#|\/\/)/i.test(u))
      .filter((u) => !u.endsWith(".html"));       // trang nội bộ, kiểm ở test trên

    for (const ref of new Set(refs)) {
      if (!packaged(ref)) missing.push(`${page} → ${ref}`);
    }
  }
  assert.deepEqual(missing, [],
    `Những tệp này được tham chiếu nhưng KHÔNG có trong ENTRIES của build/dist.js, ` +
    `nên sẽ 404 trên production:\n  ${missing.join("\n  ")}`);
});

test("mọi mục trong ENTRIES đều thật sự tồn tại", () => {
  for (const entry of ENTRIES) {
    if (entry === "generated") continue;          // sinh lúc build
    assert.ok(fs.existsSync(path.join(ROOT, entry)),
      `ENTRIES có "${entry}" nhưng không tìm thấy tệp/thư mục đó`);
  }
});
