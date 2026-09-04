#!/usr/bin/env node
"use strict";
const fs = require("fs");
const path = require("path");
const { scanContent, scanQuizzes } = require("./lib/scan");
const { resolveSiteUrl, buildSitemap, buildRobots } = require("./lib/seo");

const ROOT = path.join(__dirname, "..");
const CONTENT = path.join(ROOT, "content");
const PUBLIC = path.join(ROOT, "public");
const SRC_GEN = path.join(ROOT, "src", "generated");

function main() {
  // content/ trống hoặc chưa có: vẫn sinh catalog rỗng để UI đồng bộ (hiện "Chưa có nội dung nào")
  // thay vì fail build và để deploy cũ tiếp tục hiển thị bài đã xoá.
  const hasContent = fs.existsSync(CONTENT);
  if (!hasContent) {
    console.warn("  ⚠ Không tìm thấy thư mục content/ — sinh catalog rỗng.");
  }

  const { sections, docs, warnings } = hasContent
    ? scanContent(CONTENT)
    : { sections: [], docs: [], warnings: [] };
  warnings.forEach((w) => console.warn(`  ⚠ ${w}`));

  const quizBank = hasContent ? scanQuizzes(CONTENT) : {};
  docs.forEach((doc) => {
    const qz = quizBank[doc.id];
    if (qz) {
      doc.questions = qz.quizzes.length;
      // Tag của bộ quiz nằm trong file .quiz.json, tách khỏi tag bài viết —
      // trang Luyện Quiz lọc theo trường này.
      if (qz.tags && qz.tags.length) doc.quizTags = qz.tags;
    }
  });

  // Sắp bài theo đúng thứ tự chuyên mục đã khai báo trong _section.json.
  const rank = new Map();
  sections.forEach((s, si) =>
    s.categories.forEach((c, ci) => rank.set(`${s.id}/${c.id}`, si * 1000 + ci)));
  docs.sort((a, b) =>
    (rank.get(`${a.section}/${a.category}`) ?? 1e9) - (rank.get(`${b.section}/${b.category}`) ?? 1e9) ||
    a.order - b.order || a.slug.localeCompare(b.slug));

  // 1. Metadata bài viết, dùng cho cả catalog.json lẫn sitemap.
  const meta = docs.map(({ _body, ...rest }) => rest);

  // 2. sitemap.xml + robots.txt viết thẳng vào public/ — Vite chép nguyên thư
  //    mục này lên gốc dist/, đúng nơi công cụ tìm kiếm mong thấy chúng.
  const siteUrl = resolveSiteUrl();
  fs.mkdirSync(PUBLIC, { recursive: true });
  fs.writeFileSync(path.join(PUBLIC, "robots.txt"), buildRobots(siteUrl));
  const sitemapPath = path.join(PUBLIC, "sitemap.xml");
  if (siteUrl) fs.writeFileSync(sitemapPath, buildSitemap(siteUrl, sections, meta));
  else fs.rmSync(sitemapPath, { force: true });

  // 3. Dữ liệu JSON cho React SPA trong src/generated/
  fs.rmSync(SRC_GEN, { recursive: true, force: true });
  fs.mkdirSync(SRC_GEN, { recursive: true });

  const writeJson = (dir, rel, obj) => {
    const full = path.join(dir, rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, JSON.stringify(obj, null, 2));
  };

  writeJson(SRC_GEN, "catalog.json", { sections, documents: meta });
  writeJson(SRC_GEN, "quizBank.json", quizBank);

  for (const doc of docs) {
    writeJson(SRC_GEN, `docs/${doc.contentFile}.json`, {
      id: doc.id,
      title: doc.title,
      section: doc.section,
      category: doc.category,
      slug: doc.slug,
      readingMinutes: doc.readingMinutes,
      questions: doc.questions,
      body: doc._body,
    });
  }

  // 4. Bản sao tĩnh của src/generated/ trong public/ — ReaderPage fetch
  //    /generated/docs/<file>.json khi import.meta.glob chưa có bài đó.
  const PUB_GEN = path.join(PUBLIC, "generated");
  fs.rmSync(PUB_GEN, { recursive: true, force: true });
  fs.cpSync(SRC_GEN, PUB_GEN, { recursive: true });

  const totalQuestions = docs.reduce((n, d) => n + (d.questions || 0), 0);
  console.log(`✓ ${sections.length} mảng · ${docs.length} bài · ${totalQuestions} câu quiz`);
  console.log(`✓ src/generated/catalog.json  ${(Buffer.byteLength(JSON.stringify(meta)) / 1024).toFixed(0)} KB`);
  console.log(`✓ src/generated/docs/         ${docs.length} file (reader chỉ nạp bài đang mở)`);
  console.log(siteUrl
    ? `✓ public/sitemap.xml   ${1 + sections.length + meta.length} URL · ${siteUrl}`
    : `· bỏ qua sitemap.xml — chưa biết tên miền. Đặt SITE_URL=... rồi build lại ` +
      `(trên Vercel thì tự có qua VERCEL_PROJECT_PRODUCTION_URL).`);
  sections.forEach((s) => console.log(`   ${s.name}: ${s.docCount} bài, ${s.categories.length} chuyên mục`));
  if (warnings.length) console.log(`\n${warnings.length} cảnh báo ở trên — build vẫn thành công.`);
}

main();
