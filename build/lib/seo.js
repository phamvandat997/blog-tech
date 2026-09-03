"use strict";
// Sinh sitemap.xml và robots.txt.
//
// Tách khỏi build.js và viết thuần (vào chuỗi, ra chuỗi) để kiểm thử được mà
// không cần đụng tới hệ thống tệp.

/** Bỏ dấu / thừa ở cuối và ép về https:// nếu thiếu scheme. */
function normalizeSiteUrl(raw) {
  const value = String(raw || "").trim();
  if (!value) return null;
  const withScheme = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  return withScheme.replace(/\/+$/, "");
}

/**
 * Tên miền production. Vercel tự đặt VERCEL_PROJECT_PRODUCTION_URL (kể cả khi
 * đã gắn tên miền riêng); SITE_URL để ghi đè khi build ở nơi khác.
 */
function resolveSiteUrl(env = process.env) {
  return normalizeSiteUrl(env.SITE_URL || env.VERCEL_PROJECT_PRODUCTION_URL);
}

const xmlEscape = (s) => String(s ?? "")
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;").replace(/'/g, "&apos;");

/** Đúng đường dẫn mà reader.html nhận — xem readerUrl() trong assets/js/catalog.js. */
const docPath = (doc) =>
  `/reader.html?s=${encodeURIComponent(doc.section)}&d=${encodeURIComponent(`${doc.category}/${doc.slug}`)}`;

/**
 * @param {string} siteUrl gốc đã chuẩn hoá, không có / ở cuối
 * @param {Array} sections
 * @param {Array} docs
 */
function buildSitemap(siteUrl, sections, docs) {
  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    { loc: "/", priority: "1.0", lastmod: today },
    ...sections.map((s) => ({
      loc: `/hub.html?s=${encodeURIComponent(s.id)}`, priority: "0.8", lastmod: today,
    })),
    ...docs.map((d) => ({
      loc: docPath(d), priority: "0.6", lastmod: d.updatedDate || today,
    })),
  ];

  const body = urls.map(({ loc, priority, lastmod }) =>
    `  <url>\n` +
    `    <loc>${xmlEscape(siteUrl + loc)}</loc>\n` +
    `    <lastmod>${xmlEscape(lastmod)}</lastmod>\n` +
    `    <priority>${priority}</priority>\n` +
    `  </url>`).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

/** Trang admin không được lập chỉ mục; dòng Sitemap chỉ thêm khi biết tên miền. */
function buildRobots(siteUrl) {
  const lines = ["User-agent: *", "Allow: /", "Disallow: /admin.html", "Disallow: /admin"];
  if (siteUrl) lines.push("", `Sitemap: ${siteUrl}/sitemap.xml`);
  return lines.join("\n") + "\n";
}

module.exports = { normalizeSiteUrl, resolveSiteUrl, buildSitemap, buildRobots };
