"use strict";
const { test } = require("node:test");
const assert = require("node:assert");
const { parseFrontmatter } = require("./lib/frontmatter");

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
