"use strict";
// Kiểm tra cấu trúc các trang HTML.
//
// Có thật một lần cả trang /admin trắng xoá vì một commit thay dòng
// </noscript> bằng một thẻ <link>. Khi JavaScript bật, nội dung trong
// <noscript> được coi là văn bản thô cho tới thẻ đóng — thiếu thẻ đóng thì
// trình duyệt nuốt sạch phần còn lại của tài liệu, gồm cả <body> và mọi
// <script>. Trang trả về HTTP 200, console không một lỗi nào, nên không có
// gì báo cho ta biết. Những test dưới đây bắt đúng loại lỗi câm đó.

const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const PAGES = ["index.html", "hub.html", "reader.html", "admin.html", "404.html"];
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const count = (s, re) => (s.match(re) || []).length;

for (const page of PAGES) {
  test(`${page}: mọi <noscript> đều có thẻ đóng`, () => {
    const html = read(page);
    assert.equal(
      count(html, /<noscript[\s>]/gi), count(html, /<\/noscript>/gi),
      `${page}: số thẻ <noscript> mở và đóng không khớp — phần còn lại của ` +
      `trang sẽ bị nuốt thành văn bản thô và trang hiện ra trắng.`);
  });

  test(`${page}: có <body> và </html> đóng đúng`, () => {
    const html = read(page);
    assert.equal(count(html, /<body[\s>]/gi), 1, `${page}: thiếu hoặc thừa <body>`);
    assert.equal(count(html, /<\/body>/gi), 1, `${page}: thiếu </body>`);
    assert.match(html.trimEnd(), /<\/html>$/i, `${page}: không kết thúc bằng </html>`);
  });

  test(`${page}: mọi tệp cục bộ được tham chiếu đều tồn tại`, () => {
    const html = read(page);
    const refs = [...html.matchAll(/(?:src|href)="([^"]+)"/gi)]
      .map((m) => m[1])
      .filter((u) => !/^(https?:|data:|mailto:|#|\/\/)/i.test(u))
      .filter((u) => !u.startsWith("generated/"));   // sinh lúc build, có thể chưa có

    for (const ref of new Set(refs)) {
      const file = ref.split(/[?#]/)[0];
      assert.ok(fs.existsSync(path.join(ROOT, file)),
        `${page} trỏ tới "${file}" nhưng tệp đó không tồn tại`);
    }
  });

  test(`${page}: <script> nằm sau nơi khai báo, không kẹt trong noscript`, () => {
    const html = read(page);
    // Mọi thẻ script phải nằm ngoài mọi khối noscript.
    const noscriptBlocks = [...html.matchAll(/<noscript[\s>][\s\S]*?<\/noscript>/gi)]
      .map((m) => m[0]).join("\n");
    assert.equal(count(noscriptBlocks, /<script[\s>]/gi), 0,
      `${page}: có <script> nằm trong <noscript> — nó sẽ không bao giờ chạy`);
  });
}
