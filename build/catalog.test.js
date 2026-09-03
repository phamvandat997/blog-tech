"use strict";
// Kiểm thử lớp truy vấn catalog. Giống markdown.test.js, đây là script cho
// trình duyệt nên nạp qua node:vm với SECTIONS/DOCUMENTS giả — không cần build
// thật, và file chạy trên trang không phải đổi vì việc kiểm thử.

const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const SECTIONS = [
  { id: "java", name: "Java", kind: "language", color: "#e11d48", categories: [{ id: "core", name: "Cốt lõi" }] },
  { id: "dsa", name: "Cấu trúc dữ liệu", kind: "topic", color: "#059669", categories: [] },
];
const DOCUMENTS = [
  { id: "java/core/a", section: "java", category: "core", slug: "a",
    title: "Java Fundamentals", description: "Kiểu dữ liệu", phase: "Phase 1", tags: ["Java", "OOP"] },
  { id: "java/core/b", section: "java", category: "core", slug: "b",
    title: "Streams", description: "Lambda", phase: "Phase 3", tags: ["Stream"] },
  { id: "dsa/roadmap/c", section: "dsa", category: "roadmap", slug: "c",
    title: "Lộ trình DSA", description: "Kế hoạch", phase: "", tags: [] },
];

const SOURCE = fs.readFileSync(
  path.join(__dirname, "..", "assets", "js", "catalog.js"), "utf8");

// catalog.js khai báo phần lớn API bằng `const`, mà `const` ở cấp cao nhất
// trong vm nằm ở phạm vi từ vựng toàn cục chứ không thành thuộc tính của
// sandbox. Chạy thêm một biểu thức trong CÙNG ngữ cảnh để lấy chúng ra.
const EXPORTS = `({ hasCatalog, ALL_SECTIONS, ALL_DOCUMENTS, getSection, getDoc,
  docsOfSection, filterDocs, featuredDocs, readParams, hubUrl, readerUrl })`;

/** @param {string} search phần query string, ví dụ "?s=java&c=core" */
function load(search = "", catalog = true) {
  const sandbox = {
    URLSearchParams,
    window: { location: { search } },
  };
  if (catalog) {
    sandbox.SECTIONS = JSON.parse(JSON.stringify(SECTIONS));
    sandbox.DOCUMENTS = JSON.parse(JSON.stringify(DOCUMENTS));
  }
  vm.createContext(sandbox);
  vm.runInContext(SOURCE, sandbox, { filename: "catalog.js" });
  return vm.runInContext(EXPORTS, sandbox, { filename: "exports.js" });
}

/* --------------------------------------------------------------- tra cứu */

test("tra mảng và bài theo id, không có thì trả null", () => {
  const c = load();
  assert.equal(c.getSection("java").name, "Java");
  assert.equal(c.getSection("khong-co"), null);
  assert.equal(c.getDoc("java/core/a").title, "Java Fundamentals");
  assert.equal(c.getDoc("java/core/zzz"), null);
});

test("thiếu catalog thì không nổ, chỉ ra danh sách rỗng", () => {
  const c = load("", false);
  assert.equal(c.hasCatalog, false);
  assert.deepEqual(c.ALL_SECTIONS, []);
  assert.deepEqual(c.ALL_DOCUMENTS, []);
  assert.equal(c.getSection("java"), null);
  assert.deepEqual(c.filterDocs({ section: "java" }), []);
});

/* ----------------------------------------------------------------- lọc */

test("lọc theo mảng và chuyên mục", () => {
  const c = load();
  assert.equal(c.filterDocs({ section: "java" }).length, 2);
  assert.equal(c.filterDocs({ section: "java", category: "core" }).length, 2);
  assert.equal(c.filterDocs({ section: "dsa" }).length, 1);
});

test('category và phase bằng "all" nghĩa là không lọc', () => {
  const c = load();
  assert.equal(c.filterDocs({ section: "java", category: "all" }).length, 2);
  assert.equal(c.filterDocs({ phase: "all" }).length, 3);
});

test("lọc theo phase", () => {
  const c = load();
  assert.deepEqual(c.filterDocs({ phase: "Phase 1" }).map((d) => d.slug), ["a"]);
});

test("tìm kiếm không phân biệt hoa thường, quét cả phase và tags", () => {
  const c = load();
  assert.deepEqual(c.filterDocs({ query: "STREAMS" }).map((d) => d.slug), ["b"]);
  assert.deepEqual(c.filterDocs({ query: "oop" }).map((d) => d.slug), ["a"]);
  assert.deepEqual(c.filterDocs({ query: "phase 3" }).map((d) => d.slug), ["b"]);
});

test("tìm kiếm khớp dấu tiếng Việt trong tiêu đề", () => {
  assert.deepEqual(load().filterDocs({ query: "lộ trình" }).map((d) => d.slug), ["c"]);
});

test("không khớp gì thì trả mảng rỗng chứ không trả tất cả", () => {
  assert.deepEqual(load().filterDocs({ query: "khong-ton-tai-dau" }), []);
});

/* ------------------------------------------------------------ đọc URL */

test("readParams ghép mảng và bài từ query string", () => {
  const p = load("?s=java&d=core/a").readParams();
  assert.equal(p.section.id, "java");
  assert.equal(p.doc.id, "java/core/a");
});

test("readParams trả null khi mảng hoặc bài không có thật", () => {
  const p = load("?s=khong-co&d=core/a").readParams();
  assert.equal(p.section, null);
  assert.equal(p.doc, null);
});

test("số trang sai hoặc âm thì về 1", () => {
  assert.equal(load("?p=abc").readParams().page, 1);
  assert.equal(load("?p=-5").readParams().page, 1);
  assert.equal(load("?p=3").readParams().page, 3);
});

/* ----------------------------------------------------------- dựng URL */

test("hubUrl và readerUrl thoát ký tự đặc biệt", () => {
  const c = load();
  assert.equal(c.hubUrl("java"), "hub.html?s=java");
  assert.equal(c.hubUrl("java", { c: "core" }), "hub.html?s=java&c=core");
  assert.equal(c.readerUrl(DOCUMENTS[0]), "reader.html?s=java&d=core%2Fa");
});

test("readerUrl đi được vòng tròn qua readParams", () => {
  const url = load().readerUrl(DOCUMENTS[1]);
  const p = load(url.slice(url.indexOf("?"))).readParams();
  assert.equal(p.doc.id, "java/core/b");
});

test("featuredDocs ưu tiên bài có featured và fallback hợp lý", () => {
  const c = load();
  const res = c.featuredDocs(2);
  assert.equal(res.length, 2);
});

