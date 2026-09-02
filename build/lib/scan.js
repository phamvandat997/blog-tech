"use strict";
const fs = require("fs");
const path = require("path");
const { parseFrontmatter } = require("./frontmatter");

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const formatSize = (bytes) =>
  bytes < 1024 ? `${bytes} B`
  : bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB`
  : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

// id -> tên file phẳng trong generated/docs/. Dùng "__" vì "/" không hợp lệ
// trong tên file và slug đã cấm dấu gạch dưới.
const flatten = (id) => id.replace(/\//g, "__");

const dirsIn = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith("_") && !e.name.startsWith("."))
    .map((e) => e.name);

function firstHeading(body) {
  const m = body.match(/^#\s+(.+)$/m);
  return m ? m[1].trim() : null;
}

function firstParagraph(body) {
  for (const block of body.split(/\r?\n\s*\r?\n/)) {
    const t = block.trim();
    if (!t || t.startsWith("#") || t.startsWith(">") || t.startsWith("```") || t.startsWith("|")) continue;
    const flat = t.replace(/\s+/g, " ").replace(/[*_`]/g, "");
    return flat.length > 180 ? flat.slice(0, 177).trimEnd() + "…" : flat;
  }
  return "";
}

/**
 * Quét content/ thành { sections, docs, warnings }.
 * Ném lỗi khi cấu trúc sai (slug xấu, JSON hỏng) — build phải dừng.
 */
function scanContent(contentDir) {
  const warnings = [];
  const sections = [];
  const docs = [];

  for (const sectionId of dirsIn(contentDir)) {
    if (!SLUG.test(sectionId)) throw new Error(`Tên thư mục section không hợp lệ: "${sectionId}" (chỉ chữ thường, số và dấu -)`);
    const sectionDir = path.join(contentDir, sectionId);

    const metaPath = path.join(sectionDir, "_section.json");
    let meta = {};
    if (fs.existsSync(metaPath)) {
      try { meta = JSON.parse(fs.readFileSync(metaPath, "utf8")); }
      catch (e) { throw new Error(`${metaPath} sai cú pháp JSON: ${e.message}`); }
    } else {
      warnings.push(`${sectionId}/ thiếu _section.json — dùng giá trị mặc định`);
    }

    const declared = new Map((meta.categories || []).map((c) => [c.id, c]));
    const categories = [];

    for (const categoryId of dirsIn(sectionDir)) {
      if (!SLUG.test(categoryId)) throw new Error(`Tên chuyên mục không hợp lệ: "${sectionId}/${categoryId}"`);
      const categoryDir = path.join(sectionDir, categoryId);
      const decl = declared.get(categoryId);
      if (!decl) warnings.push(`${sectionId}/${categoryId} chưa khai báo trong _section.json`);

      let count = 0;
      for (const file of fs.readdirSync(categoryDir).sort()) {
        if (!file.endsWith(".md")) continue;
        const slug = file.slice(0, -3);
        if (!SLUG.test(slug)) throw new Error(`Tên file không hợp lệ: "${sectionId}/${categoryId}/${file}"`);

        const filePath = path.join(categoryDir, file);
        const raw = fs.readFileSync(filePath, "utf8");
        const { data, body } = parseFrontmatter(raw);
        const id = `${sectionId}/${categoryId}/${slug}`;

        if (!data.title) warnings.push(`${id} thiếu "title" trong frontmatter`);

        const quizPath = path.join(categoryDir, `${slug}.quiz.json`);
        let questions = 0, quiz = null;
        if (fs.existsSync(quizPath)) {
          try { quiz = JSON.parse(fs.readFileSync(quizPath, "utf8")); }
          catch (e) { throw new Error(`${quizPath} sai cú pháp JSON: ${e.message}`); }
          questions = (quiz.quizzes || []).length;
        }

        docs.push({
          id, section: sectionId, category: categoryId, slug,
          contentFile: flatten(id),
          title: data.title || firstHeading(body) || slug,
          description: data.description || firstParagraph(body),
          icon: data.icon || meta.icon || "📄",
          difficulty: data.difficulty || "",
          phase: data.phase || "",
          tags: Array.isArray(data.tags) ? data.tags : [],
          order: typeof data.order === "number" ? data.order : 999,
          lines: body.split("\n").length,
          size: formatSize(Buffer.byteLength(raw, "utf8")),
          updatedDate: fs.statSync(filePath).mtime.toISOString().slice(0, 10),
          questions,
          _body: body,
          _quiz: quiz,
        });
        count++;
      }

      categories.push({
        id: categoryId,
        name: decl?.name || categoryId,
        icon: decl?.icon || "📁",
        order: decl?.order ?? 999,
        docCount: count,
      });
    }

    categories.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));

    sections.push({
      id: sectionId,
      name: meta.name || sectionId,
      icon: meta.icon || "📦",
      color: meta.color || "#4f46e5",
      kind: meta.kind === "topic" ? "topic" : "language",
      order: meta.order ?? 999,
      tagline: meta.tagline || "",
      categories,
      phases: Array.isArray(meta.phases) ? meta.phases : [],
      phaseDetails: Array.isArray(meta.phaseDetails) ? meta.phaseDetails : [],
      docCount: categories.reduce((n, c) => n + c.docCount, 0),
    });
  }

  sections.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
  docs.sort((a, b) =>
    a.section.localeCompare(b.section) ||
    a.category.localeCompare(b.category) ||
    a.order - b.order ||
    a.slug.localeCompare(b.slug));

  return { sections, docs, warnings };
}

module.exports = { scanContent, formatSize, flatten, SLUG };
