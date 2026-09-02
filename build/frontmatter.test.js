"use strict";
const { test } = require("node:test");
const assert = require("node:assert");
const { parseFrontmatter, stringifyFrontmatter } = require("../assets/js/frontmatter");

test("không có frontmatter thì trả body nguyên vẹn", () => {
  const { data, body } = parseFrontmatter("# Chào\n\nnội dung");
  assert.deepEqual(data, {});
  assert.equal(body, "# Chào\n\nnội dung");
});

test("đọc chuỗi trích dẫn, giữ nguyên dấu hai chấm bên trong", () => {
  const { data } = parseFrontmatter('---\ntitle: "Phase 1: Nền tảng"\n---\nbody');
  assert.equal(data.title, "Phase 1: Nền tảng");
});

test("đọc số, boolean và chuỗi trần", () => {
  const { data } = parseFrontmatter("---\norder: 3\ndraft: false\nicon: 🧱\n---\n");
  assert.equal(data.order, 3);
  assert.equal(data.draft, false);
  assert.equal(data.icon, "🧱");
});

test("đọc danh sách, không cắt nhầm dấu phẩy trong chuỗi", () => {
  const { data } = parseFrontmatter('---\ntags: [Java, "Stream, Gatherer", 25]\n---\n');
  assert.deepEqual(data.tags, ["Java", "Stream, Gatherer", 25]);
});

test("tách đúng body sau dấu đóng", () => {
  const { body } = parseFrontmatter("---\ntitle: X\n---\n# H1\n\nđoạn văn\n");
  assert.equal(body, "# H1\n\nđoạn văn\n");
});

test("bỏ qua comment và dòng rỗng trong khối", () => {
  const { data } = parseFrontmatter("---\n# ghi chú\n\ntitle: X\n---\n");
  assert.deepEqual(data, { title: "X" });
});

test("thiếu dấu đóng thì coi như không có frontmatter", () => {
  const src = "---\ntitle: X\nkhông đóng";
  assert.deepEqual(parseFrontmatter(src), { data: {}, body: src });
});

test("bỏ BOM đầu file", () => {
  const { data } = parseFrontmatter("﻿---\ntitle: X\n---\nbody");
  assert.equal(data.title, "X");
});

test("ghi lại frontmatter rồi đọc ra được nguyên giá trị", () => {
  const data = { title: "Phase 1: Nền tảng", order: 2, tags: ["Java", "Stream, Gatherer"] };
  const file = stringifyFrontmatter(data, "# H1\n\nnội dung");
  const parsed = parseFrontmatter(file);
  assert.deepEqual(parsed.data, data);
  assert.equal(parsed.body.trim(), "# H1\n\nnội dung");
});

test("bỏ qua trường rỗng khi ghi để build tự suy ra", () => {
  const file = stringifyFrontmatter({ title: "A", description: "", icon: null, tags: [] }, "x");
  assert.equal(parseFrontmatter(file).data.title, "A");
  assert.deepEqual(Object.keys(parseFrontmatter(file).data), ["title"]);
});

test("không có trường nào thì không ghi khối frontmatter", () => {
  assert.equal(stringifyFrontmatter({}, "chỉ là nội dung"), "chỉ là nội dung\n");
});
