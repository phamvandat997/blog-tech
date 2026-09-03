"use strict";
const { test } = require("node:test");
const assert = require("node:assert");
const { normalizeSiteUrl, resolveSiteUrl, buildSitemap, buildRobots } = require("./lib/seo");

/* ------------------------------------------------------------- tên miền */

test("thêm https khi thiếu scheme, bỏ dấu / thừa", () => {
  assert.equal(normalizeSiteUrl("blog.example.com"), "https://blog.example.com");
  assert.equal(normalizeSiteUrl("https://blog.example.com/"), "https://blog.example.com");
  assert.equal(normalizeSiteUrl("http://localhost:8080///"), "http://localhost:8080");
});

test("không có tên miền thì trả null, không đoán bừa", () => {
  assert.equal(normalizeSiteUrl(""), null);
  assert.equal(normalizeSiteUrl("   "), null);
  assert.equal(normalizeSiteUrl(undefined), null);
  assert.equal(resolveSiteUrl({}), null);
});

test("SITE_URL thắng biến của Vercel", () => {
  assert.equal(
    resolveSiteUrl({ SITE_URL: "a.com", VERCEL_PROJECT_PRODUCTION_URL: "b.vercel.app" }),
    "https://a.com");
  assert.equal(
    resolveSiteUrl({ VERCEL_PROJECT_PRODUCTION_URL: "b.vercel.app" }),
    "https://b.vercel.app");
});

/* ------------------------------------------------------------- sitemap */

const SECTIONS = [{ id: "java" }, { id: "dsa" }];
const DOCS = [
  { section: "java", category: "core", slug: "phase1", updatedDate: "2026-01-15" },
  { section: "dsa", category: "roadmap", slug: "lo-trinh", updatedDate: "2026-02-20" },
];

test("liệt kê trang chủ, từng mảng và từng bài", () => {
  const xml = buildSitemap("https://blog.example.com", SECTIONS, DOCS);
  assert.equal((xml.match(/<url>/g) || []).length, 1 + 2 + 2);
  assert.match(xml, /<loc>https:\/\/blog\.example\.com\/<\/loc>/);
  assert.match(xml, /<loc>https:\/\/blog\.example\.com\/hub\.html\?s=java<\/loc>/);
});

test("đường dẫn bài khớp readerUrl của giao diện: ?s=<mảng>&d=<chuyên mục>/<slug>", () => {
  const xml = buildSitemap("https://x.com", SECTIONS, DOCS);
  assert.match(xml, /\/reader\.html\?s=java&amp;d=core%2Fphase1/);
});

test("lastmod lấy đúng ngày cập nhật của bài", () => {
  const xml = buildSitemap("https://x.com", [], DOCS);
  assert.match(xml, /<lastmod>2026-01-15<\/lastmod>/);
  assert.match(xml, /<lastmod>2026-02-20<\/lastmod>/);
});

test("ký tự đặc biệt trong slug được thoát, XML không vỡ", () => {
  const xml = buildSitemap("https://x.com", [{ id: 'a&b' }], []);
  assert.match(xml, /hub\.html\?s=a%26b/);
  assert.doesNotMatch(xml, /<loc>[^<]*[^;]&[^a-z]/);
});

test("catalog rỗng vẫn ra XML hợp lệ, chỉ còn trang chủ", () => {
  const xml = buildSitemap("https://x.com", [], []);
  assert.match(xml, /^<\?xml version="1\.0" encoding="UTF-8"\?>/);
  assert.equal((xml.match(/<url>/g) || []).length, 1);
  assert.match(xml, /<\/urlset>\n$/);
});

/* -------------------------------------------------------------- robots */

test("chặn trang admin khỏi công cụ tìm kiếm", () => {
  const txt = buildRobots("https://x.com");
  assert.match(txt, /Disallow: \/admin\.html/);
  assert.match(txt, /Disallow: \/admin$/m);
});

test("chỉ ghi dòng Sitemap khi biết tên miền", () => {
  assert.match(buildRobots("https://x.com"), /^Sitemap: https:\/\/x\.com\/sitemap\.xml$/m);
  assert.doesNotMatch(buildRobots(null), /Sitemap:/);
});
