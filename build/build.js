#!/usr/bin/env node
"use strict";
const fs = require("fs");
const path = require("path");
const { scanContent, scanQuizzes } = require("./lib/scan");
const { resolveSiteUrl, buildSitemap, buildRobots } = require("./lib/seo");

const ROOT = path.join(__dirname, "..");
const CONTENT = path.join(ROOT, "content");
const OUT = path.join(ROOT, "generated");

const banner = "// TỆP SINH TỰ ĐỘNG — đừng sửa tay. Chạy: node build/build.js\n";

function writeFile(rel, body) {
  const full = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, banner + body);
  return Buffer.byteLength(body, "utf8");
}

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
    }
  });

  // Sắp bài theo đúng thứ tự chuyên mục đã khai báo trong _section.json.
  const rank = new Map();
  sections.forEach((s, si) =>
    s.categories.forEach((c, ci) => rank.set(`${s.id}/${c.id}`, si * 1000 + ci)));
  docs.sort((a, b) =>
    (rank.get(`${a.section}/${a.category}`) ?? 1e9) - (rank.get(`${b.section}/${b.category}`) ?? 1e9) ||
    a.order - b.order || a.slug.localeCompare(b.slug));

  fs.rmSync(OUT, { recursive: true, force: true });

  // 1. catalog.js — metadata, nhẹ, mọi trang đều nạp.
  const meta = docs.map(({ _body, ...rest }) => rest);
  writeFile("catalog.js",
    `const SECTIONS = ${JSON.stringify(sections, null, 1)};\n` +
    `const DOCUMENTS = ${JSON.stringify(meta, null, 1)};\n`);

  // 2. Một file nội dung cho mỗi bài — reader chỉ nạp đúng bài đang mở.
  let contentBytes = 0;
  for (const doc of docs) {
    contentBytes += writeFile(`docs/${doc.contentFile}.js`,
      `window.__docLoaded && window.__docLoaded(${JSON.stringify(doc.id)}, ${JSON.stringify(doc._body)});\n`);
  }

  // 3. Quiz bank - một file cho mỗi mảng, nạp động khi luyện quiz
  for (const section of sections) {
    const bank = {};
    docs.filter((d) => d.section === section.id && quizBank[d.id])
        .forEach((d) => {
          bank[d.id] = quizBank[d.id];
        });
    writeFile(`quiz-${section.id}.js`,
      `window.__quizLoaded && window.__quizLoaded(${JSON.stringify(section.id)}, ${JSON.stringify(bank)});\n`);
  }

  // 4. sitemap.xml + robots.txt. Đặt trong generated/ rồi dist.js đưa lên gốc
  //    dist/ — nơi công cụ tìm kiếm mong thấy chúng.
  const siteUrl = resolveSiteUrl();
  fs.writeFileSync(path.join(OUT, "robots.txt"), buildRobots(siteUrl));
  if (siteUrl) {
    fs.writeFileSync(path.join(OUT, "sitemap.xml"), buildSitemap(siteUrl, sections, meta));
  }

  const totalQuestions = docs.reduce((n, d) => n + (d.questions || 0), 0);
  console.log(`✓ ${sections.length} mảng · ${docs.length} bài · ${totalQuestions} câu quiz`);
  console.log(`✓ generated/catalog.js  ${(Buffer.byteLength(JSON.stringify(meta)) / 1024).toFixed(0)} KB`);
  console.log(`✓ generated/docs/       ${docs.length} file, ${(contentBytes / 1024).toFixed(0)} KB tổng ` +
              `(reader chỉ nạp 1 file mỗi lần)`);
  console.log(siteUrl
    ? `✓ generated/sitemap.xml   ${1 + sections.length + meta.length} URL · ${siteUrl}`
    : `· bỏ qua sitemap.xml — chưa biết tên miền. Đặt SITE_URL=... rồi build lại ` +
      `(trên Vercel thì tự có qua VERCEL_PROJECT_PRODUCTION_URL).`);
  sections.forEach((s) => console.log(`   ${s.name}: ${s.docCount} bài, ${s.categories.length} chuyên mục`));
  if (warnings.length) console.log(`\n${warnings.length} cảnh báo ở trên — build vẫn thành công.`);
}

main();
