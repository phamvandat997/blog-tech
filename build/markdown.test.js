"use strict";
// Kiểm thử trình dựng markdown.
//
// assets/js/markdown.js là script cho trình duyệt, không phải module Node, và
// nó dùng chung escapeHtml/attr với dom.js. Nạp cả hai vào một ngữ cảnh vm
// thay vì bọc UMD, để file chạy trên trang không phải đổi vì việc kiểm thử.

const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

function loadRenderer() {
  const sandbox = {
    // markdown.js gắn một listener click ở cấp cao nhất cho nút "Sao chép mã".
    document: { addEventListener() {} },
    setTimeout, clearTimeout, console,
  };
  vm.createContext(sandbox);
  for (const file of ["dom.js", "markdown.js"]) {
    const src = fs.readFileSync(path.join(__dirname, "..", "assets", "js", file), "utf8");
    vm.runInContext(src, sandbox, { filename: file });
  }
  return sandbox.renderMarkdown;
}

const renderMarkdown = loadRenderer();
const hrefOf = (html) => (html.match(/<a href="([^"]*)"/) || [])[1];

/* ------------------------------------------------------- an toàn liên kết */

test("giữ nguyên liên kết http và https", () => {
  assert.equal(hrefOf(renderMarkdown("[x](https://example.com/a?b=1)")), "https://example.com/a?b=1");
  assert.equal(hrefOf(renderMarkdown("[x](http://example.com)")), "http://example.com");
});

test("giữ nguyên đường dẫn tương đối, neo và mailto", () => {
  assert.equal(hrefOf(renderMarkdown("[x](hub.html?s=java)")), "hub.html?s=java");
  assert.equal(hrefOf(renderMarkdown("[x](/tai-lieu/a.pdf)")), "/tai-lieu/a.pdf");
  assert.equal(hrefOf(renderMarkdown("[x](#heading-mo-dau)")), "#heading-mo-dau");
  assert.equal(hrefOf(renderMarkdown("[x](mailto:ai@example.com)")), "mailto:ai@example.com");
});

test("chặn javascript: — bấm vào không chạy được mã", () => {
  assert.equal(hrefOf(renderMarkdown('[x](javascript:alert(1))')), "#");
  assert.equal(hrefOf(renderMarkdown("[x](JaVaScRiPt:alert(1))")), "#");
});

test("chặn cả khi chèn khoảng trắng và ký tự điều khiển để né bộ lọc", () => {
  assert.equal(hrefOf(renderMarkdown("[x](java\tscript:alert(1))")), "#");
  assert.equal(hrefOf(renderMarkdown("[x](  javascript:alert(1))")), "#");
  assert.equal(hrefOf(renderMarkdown("[x](java\nscript:alert(1))")), "#");
});

test("chặn data: và vbscript:", () => {
  assert.equal(hrefOf(renderMarkdown("[x](data:text/html,<h1>hi</h1>)")), "#");
  assert.equal(hrefOf(renderMarkdown("[x](vbscript:msgbox)")), "#");
});

test("liên kết ngoài mở tab mới kèm rel an toàn, liên kết nội bộ thì không", () => {
  assert.match(renderMarkdown("[x](https://example.com)"), /rel="noopener noreferrer"/);
  assert.doesNotMatch(renderMarkdown("[x](hub.html)"), /target="_blank"/);
});

/* --------------------------------------------------------- thoát ký tự */

// markdown.js cố ý thoát `&` và `<` nhưng KHÔNG thoát `>`, để cú pháp
// blockquote còn nhận ra được. Thoát `<` là đủ: trình duyệt không mở thẻ nào.
test("thẻ HTML trong nội dung bị thoát, không mở được thẻ", () => {
  const html = renderMarkdown("Xem <script>alert(1)</script> nhé");
  assert.doesNotMatch(html, /<script/);
  assert.match(html, /&lt;script/);
});

test("generic Java hiển thị đúng thay vì bị nuốt như thẻ", () => {
  assert.match(renderMarkdown("Dùng List<String> ở đây"), /List&lt;String/);
});

test("nhãn liên kết không thoát ra khỏi thẻ a", () => {
  const html = renderMarkdown('[a"onmouseover="x](https://example.com)');
  assert.equal(hrefOf(html), "https://example.com");
});
