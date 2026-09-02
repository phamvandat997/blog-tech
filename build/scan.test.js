"use strict";
const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { scanContent, formatSize, flatten } = require("./lib/scan");

function fixture(tree) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "scan-"));
  for (const [rel, body] of Object.entries(tree)) {
    const full = path.join(dir, rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, body);
  }
  return dir;
}

const SECTION = JSON.stringify({
  name: "Java", icon: "☕", kind: "language", order: 1,
  categories: [{ id: "core", name: "Java Core", icon: "🧱", order: 1 }],
});

test("dựng id từ đường dẫn và suy ra lines/size", () => {
  const dir = fixture({
    "java/_section.json": SECTION,
    "java/core/phase1.md": "---\ntitle: P1\n---\nmột\nhai\n",
  });
  const { docs } = scanContent(dir);
  assert.equal(docs.length, 1);
  assert.equal(docs[0].id, "java/core/phase1");
  assert.equal(docs[0].section, "java");
  assert.equal(docs[0].category, "core");
  assert.equal(docs[0].lines, 3);
  assert.match(docs[0].size, /B$/);
});

test("thiếu title thì lấy heading đầu, thiếu cả hai thì lấy slug", () => {
  const dir = fixture({
    "java/_section.json": SECTION,
    "java/core/co-heading.md": "# Tiêu đề từ H1\n\nvăn bản",
    "java/core/khong-co-gi.md": "chỉ là văn bản",
  });
  const { docs, warnings } = scanContent(dir);
  const byId = Object.fromEntries(docs.map((d) => [d.slug, d]));
  assert.equal(byId["co-heading"].title, "Tiêu đề từ H1");
  assert.equal(byId["khong-co-gi"].title, "khong-co-gi");
  assert.equal(warnings.filter((w) => w.includes('thiếu "title"')).length, 2);
});

test("thiếu description thì lấy đoạn văn đầu, bỏ qua heading và trích dẫn", () => {
  const dir = fixture({
    "java/_section.json": SECTION,
    "java/core/a.md": "---\ntitle: A\n---\n# H1\n\n> ghi chú\n\nĐoạn văn **thật**.\n",
  });
  const { docs } = scanContent(dir);
  assert.equal(docs[0].description, "Đoạn văn thật.");
});

test("đếm câu quiz từ file .quiz.json nằm cạnh", () => {
  const dir = fixture({
    "java/_section.json": SECTION,
    "java/core/a.md": "---\ntitle: A\n---\nx",
    "java/core/a.quiz.json": JSON.stringify({ quizzes: [{ q: 1 }, { q: 2 }] }),
    "java/core/b.md": "---\ntitle: B\n---\nx",
  });
  const { docs } = scanContent(dir);
  assert.equal(docs.find((d) => d.slug === "a").questions, 2);
  assert.equal(docs.find((d) => d.slug === "b").questions, 0);
});

test("thư mục chưa khai báo vẫn hiện, kèm cảnh báo", () => {
  const dir = fixture({
    "java/_section.json": SECTION,
    "java/chua-khai-bao/a.md": "---\ntitle: A\n---\nx",
  });
  const { sections, warnings } = scanContent(dir);
  const cat = sections[0].categories.find((c) => c.id === "chua-khai-bao");
  assert.equal(cat.name, "chua-khai-bao");
  assert.equal(cat.docCount, 1);
  assert.ok(warnings.some((w) => w.includes("chua-khai-bao")));
});

test("bỏ qua thư mục bắt đầu bằng _ hoặc .", () => {
  const dir = fixture({
    "java/_section.json": SECTION,
    "java/_nhap/a.md": "---\ntitle: A\n---\nx",
    "java/core/b.md": "---\ntitle: B\n---\nx",
  });
  const { docs } = scanContent(dir);
  assert.deepEqual(docs.map((d) => d.slug), ["b"]);
});

test("section mới chỉ cần thư mục, không cần sửa code", () => {
  const dir = fixture({
    "java/_section.json": SECTION,
    "java/core/a.md": "---\ntitle: A\n---\nx",
    "python/_section.json": JSON.stringify({ name: "Python", icon: "🐍", kind: "language", order: 2 }),
    "python/co-ban/hello.md": "---\ntitle: Hello\n---\nx",
  });
  const { sections, docs } = scanContent(dir);
  assert.deepEqual(sections.map((s) => s.id), ["java", "python"]);
  assert.equal(docs.find((d) => d.section === "python").id, "python/co-ban/hello");
});

test("tên file sai quy ước làm build dừng", () => {
  const dir = fixture({
    "java/_section.json": SECTION,
    "java/core/Phase_1.md": "---\ntitle: X\n---\nx",
  });
  assert.throws(() => scanContent(dir), /không hợp lệ/);
});

test("JSON hỏng làm build dừng, báo rõ đường dẫn", () => {
  const dir = fixture({
    "java/_section.json": SECTION,
    "java/core/a.md": "---\ntitle: A\n---\nx",
    "java/core/a.quiz.json": "{ hỏng",
  });
  assert.throws(() => scanContent(dir), /a\.quiz\.json sai cú pháp JSON/);
});

test("id phẳng hoá không đụng nhau", () => {
  assert.equal(flatten("java/core/phase1"), "java__core__phase1");
  assert.notEqual(flatten("a/b-c/d"), flatten("a/b/c-d"));
});

test("formatSize đổi đơn vị theo ngưỡng", () => {
  assert.equal(formatSize(512), "512 B");
  assert.equal(formatSize(2048), "2.0 KB");
  assert.equal(formatSize(2 * 1024 * 1024), "2.0 MB");
});
