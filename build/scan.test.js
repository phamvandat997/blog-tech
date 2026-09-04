"use strict";
const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { scanContent, scanQuizzes, flatten } = require("./lib/scan");

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

test("dựng id từ đường dẫn và suy ra ngày cập nhật", () => {
  const dir = fixture({
    "java/_section.json": SECTION,
    "java/core/phase1.md": "---\ntitle: P1\n---\nmột\nhai\n",
  });
  const { docs } = scanContent(dir);
  assert.equal(docs.length, 1);
  assert.equal(docs[0].id, "java/core/phase1");
  assert.equal(docs[0].section, "java");
  assert.equal(docs[0].category, "core");
  assert.match(docs[0].updatedDate, /^\d{4}-\d{2}-\d{2}$/);
});

test("không mang theo trường đã bỏ khỏi giao diện", () => {
  const dir = fixture({
    "java/_section.json": SECTION,
    "java/core/a.md": "---\ntitle: A\ndifficulty: Expert\nicon: 🧱\n---\nx",
    "java/core/a.quiz.json": JSON.stringify({ quizzes: [{ q: 1 }] }),
  });
  const { docs } = scanContent(dir);
  for (const field of ["lines", "size", "difficulty", "icon", "questions"]) {
    assert.equal(docs[0][field], undefined, `catalog vẫn còn trường "${field}"`);
  }
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

test("thiếu description thì lấy đoạn văn đầu, bỏ heading, trích dẫn, đường kẻ", () => {
  const dir = fixture({
    "java/_section.json": SECTION,
    "java/core/a.md": "---\ntitle: A\n---\n# H1\n\n> ghi chú\n\n---\n\n| a | b |\n\nĐoạn văn **thật**.\n",
  });
  const { docs } = scanContent(dir);
  assert.equal(docs[0].description, "Đoạn văn thật.");
});

test("mô tả dài bị cắt ở ranh giới từ, không đứt giữa chữ", () => {
  const long = "Nhập môn ".repeat(40).trim();
  const dir = fixture({
    "java/_section.json": SECTION,
    "java/core/a.md": `---\ntitle: A\n---\n${long}\n`,
  });
  const { description } = scanContent(dir).docs[0];
  assert.ok(description.endsWith("…"), "phải có dấu … ở cuối");
  assert.ok(description.length <= 171, `dài ${description.length}`);
  const kept = description.slice(0, -1);
  assert.ok(long.startsWith(kept), "phần giữ lại phải khớp đầu bài");
  // Ký tự ngay sau chỗ cắt phải là khoảng trắng — nghĩa là cắt trọn một từ.
  assert.equal(long[kept.length], " ", `cắt giữa từ: ...${kept.slice(-12)}|${long.slice(kept.length, kept.length + 6)}`);
});

test("link markdown trong mô tả chỉ còn phần chữ", () => {
  const dir = fixture({
    "java/_section.json": SECTION,
    "java/core/a.md": "---\ntitle: A\n---\nXem [tài liệu Oracle](https://example.com) để rõ hơn.\n",
  });
  assert.equal(scanContent(dir).docs[0].description, "Xem tài liệu Oracle để rõ hơn.");
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

test("_section.json hỏng làm build dừng, báo rõ đường dẫn", () => {
  const dir = fixture({
    "java/_section.json": "{ hỏng",
    "java/core/a.md": "---\ntitle: A\n---\nx",
  });
  assert.throws(() => scanContent(dir), /_section\.json sai cú pháp JSON/);
});

test("file .quiz.json cạnh bài được giữ nguyên nhưng build bỏ qua", () => {
  const dir = fixture({
    "java/_section.json": SECTION,
    "java/core/a.md": "---\ntitle: A\n---\nx",
    "java/core/a.quiz.json": "{ hỏng cũng không sao",
  });
  const { docs } = scanContent(dir);
  assert.equal(docs.length, 1, "quiz hỏng không được làm dừng build");
  assert.equal(docs[0].questions, undefined);
});

test("id phẳng hoá không đụng nhau", () => {
  assert.equal(flatten("java/core/phase1"), "java__core__phase1");
  assert.notEqual(flatten("a/b-c/d"), flatten("a/b/c-d"));
});

test("tag của bộ quiz được chuẩn hoá: bỏ #, bỏ trùng, giữ thứ tự", () => {
  const dir = fixture({
    "java/_section.json": SECTION,
    "java/core/a.md": "---\ntitle: A\n---\nx",
    "java/core/a.quiz.json": JSON.stringify({
      title: "Quiz A",
      tags: ["#OOP", " Java ", "oop", ""],
      quizzes: [{ number: 1 }],
    }),
  });
  const bank = scanQuizzes(dir);
  assert.deepEqual(bank["java/core/a"].tags, ["OOP", "Java"]);
});

test("bộ quiz không khai báo tag thì trả về mảng rỗng", () => {
  const dir = fixture({
    "java/_section.json": SECTION,
    "java/core/a.md": "---\ntitle: A\n---\nx",
    "java/core/a.quiz.json": JSON.stringify({ quizzes: [{ number: 1 }] }),
  });
  assert.deepEqual(scanQuizzes(dir)["java/core/a"].tags, []);
});
