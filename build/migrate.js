#!/usr/bin/env node
// Chạy MỘT LẦN: chuyển data.js + doc_contents.js + quizzes_data.js cũ
// thành cây content/<section>/<category>/<slug>.md có frontmatter.
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const CONTENT = path.join(ROOT, "content");

function loadLegacy(file, names) {
  const src = fs.readFileSync(path.join(ROOT, file), "utf8");
  return (0, eval)(`${src}\n;({${names.join(",")}})`);
}

const { DOCUMENTS_DATA, CATEGORIES, PHASES, PHASE_DETAILS } = loadLegacy(
  "data.js", ["DOCUMENTS_DATA", "CATEGORIES", "PHASES", "PHASE_DETAILS"]);
const { QUIZZES_DATABASE } = loadLegacy("quizzes_data.js", ["QUIZZES_DATABASE"]);

// fileName cũ -> [section, category, slug]
const PLACEMENT = {
  "ocp_java25_roadmap.md":                            ["java", "roadmap", "ocp-java25-roadmap"],
  "ocp25-giaidoan1-nen-tang-ngon-ngu.md":             ["java", "core", "giai-doan-1-nen-tang-ngon-ngu"],
  "phase1_java_fundamentals.md":                      ["java", "core", "phase1-java-fundamentals"],
  "phase1_deep_theory.md":                            ["java", "core", "phase1-deep-theory"],
  "phase2_oop_class_design.md":                       ["java", "core", "phase2-oop-class-design"],
  "phase2_deep_theory.md":                            ["java", "core", "phase2-deep-theory"],
  "ocp25-giaidoan2-collections-lambda-stream.md":     ["java", "collections-streams", "giai-doan-2-collections-lambda-stream"],
  "phase3_core_apis.md":                              ["java", "collections-streams", "phase3-core-apis"],
  "phase3_deep_theory.md":                            ["java", "collections-streams", "phase3-deep-theory"],
  "phase4_functional_programming.md":                 ["java", "collections-streams", "phase4-functional-programming"],
  "phase4_deep_theory.md":                            ["java", "collections-streams", "phase4-deep-theory"],
  "ocp25-giaidoan3-concurrency-io-module-l10n.md":    ["java", "concurrency", "giai-doan-3-concurrency-io-module-l10n"],
  "phase5_advanced_topics.md":                        ["java", "concurrency", "phase5-advanced-topics"],
  "phase5_deep_theory.md":                            ["java", "concurrency", "phase5-deep-theory"],
  "phase6_java22_25_new_features.md":                 ["java", "new-features", "phase6-java22-25-new-features"],
  "phase6_deep_theory.md":                            ["java", "new-features", "phase6-deep-theory"],
  "ocp_java25_ultimate_handbook.md":                  ["java", "master", "ocp-java25-ultimate-handbook"],
  "java25_complete_code_workbook.md":                 ["java", "master", "java25-complete-code-workbook"],
  "ocp_java25_master_question_bank.md":               ["java", "master", "ocp-java25-master-question-bank"],
  "ocp25-giaidoan4-mock-chien-thuat.md":              ["java", "master", "giai-doan-4-mock-chien-thuat"],
  "phase7_mock_exam.md":                              ["java", "master", "phase7-mock-exam"],
  "summary.md":                                       ["java", "master", "tong-quan-bach-khoa"],
  "dsa_roadmap.md":                                   ["dsa", "roadmap", "dsa-roadmap"],
  "MASTER_OCP_JAVA25_DSA_BIBLE.md":                   ["dsa", "master", "master-bible-ocp-va-dsa"],
  "dsa-giaidoan1-mang-chuoi-stack-linkedlist.md":     ["dsa", "foundations", "giai-doan-1-mang-chuoi-stack-linkedlist"],
};

const SECTIONS = {
  java: {
    name: "Java", icon: "☕", color: "#e76f00", kind: "language", order: 1,
    tagline: "OCP Java SE 25 (1Z0-831) — nền tảng ngôn ngữ, Collections, Concurrency và tính năng mới.",
    categories: [
      { id: "roadmap",             name: "Lộ trình ôn luyện",            icon: "🗺️", order: 1 },
      { id: "core",                name: "Java Core & OOP",              icon: "🧱", order: 2 },
      { id: "collections-streams", name: "Collections, Lambda & Stream", icon: "📚", order: 3 },
      { id: "concurrency",         name: "Concurrency, I/O & Module",    icon: "⚙️", order: 4 },
      { id: "new-features",        name: "Tính năng mới Java 22–25",     icon: "🚀", order: 5 },
      { id: "master",              name: "Sổ tay, Lab & Đề thi thử",     icon: "👑", order: 6 },
    ],
  },
  dsa: {
    name: "Cấu trúc dữ liệu & Giải thuật", icon: "⚡", color: "#2563eb", kind: "topic", order: 10,
    tagline: "Lộ trình luyện thuật toán cho phỏng vấn FAANG / Big Tech.",
    categories: [
      { id: "roadmap",     name: "Lộ trình",            icon: "🗺️", order: 1 },
      { id: "foundations", name: "Nền tảng",            icon: "🧱", order: 2 },
      { id: "master",      name: "Bách khoa toàn thư",  icon: "👑", order: 3 },
    ],
  },
};

const yamlStr = (s) => JSON.stringify(String(s));

function frontmatter(doc, order) {
  const lines = [
    "---",
    `title: ${yamlStr(doc.title)}`,
    `description: ${yamlStr(doc.description.trim().replace(/\.{3,}$/, "").trim())}`,
    `icon: ${yamlStr(doc.icon)}`,
    `difficulty: ${yamlStr(doc.difficulty)}`,
    `order: ${order}`,
  ];
  if (doc.phase && doc.phase !== "Tất cả") lines.push(`phase: ${yamlStr(doc.phase)}`);
  lines.push(`tags: [${doc.tags.map(yamlStr).join(", ")}]`, "---", "");
  return lines.join("\n");
}

const orderIn = {};
let moved = 0, quizzes = 0;

for (const doc of DOCUMENTS_DATA) {
  const place = PLACEMENT[doc.fileName];
  if (!place) throw new Error(`Chưa khai báo vị trí mới cho ${doc.fileName}`);
  if (!fs.existsSync(path.join(ROOT, doc.fileName))) { console.warn(`… bỏ qua ${doc.fileName} (đã chuyển)`); continue; }
  const [section, category, slug] = place;
  const key = `${section}/${category}`;
  orderIn[key] = (orderIn[key] || 0) + 1;

  const dir = path.join(CONTENT, section, category);
  fs.mkdirSync(dir, { recursive: true });

  const target = path.join(dir, `${slug}.md`);
  execFileSync("git", ["mv", doc.fileName, path.relative(ROOT, target)], { cwd: ROOT });
  const body = fs.readFileSync(target, "utf8");
  fs.writeFileSync(target, frontmatter(doc, orderIn[key]) + body.replace(/^﻿/, ""));
  moved++;

  const quiz = QUIZZES_DATABASE[doc.fileName];
  if (quiz && quiz.quizzes && quiz.quizzes.length) {
    fs.writeFileSync(
      path.join(dir, `${slug}.quiz.json`),
      JSON.stringify({ title: quiz.title || doc.title, quizzes: quiz.quizzes }, null, 2) + "\n");
    quizzes++;
  }
}

// _section.json — kèm phase metadata cũ cho Java
for (const [id, meta] of Object.entries(SECTIONS)) {
  const out = { ...meta };
  if (id === "java") {
    out.phases = PHASES.filter((p) => p !== "Tất cả" && p !== "DSA");
    out.phaseDetails = PHASE_DETAILS.map((p) => ({
      ...p,
      docs: p.docs.flatMap((d) => {
        const src = DOCUMENTS_DATA.find((x) => x.id === d.id);
        if (!src) { console.warn(`… ${p.phaseId}: bỏ tham chiếu treo "${d.id}"`); return []; }
        const [s, c, slug] = PLACEMENT[src.fileName];
        return [{ ...d, id: `${s}/${c}/${slug}` }];
      }),
    }));
  }
  fs.writeFileSync(path.join(CONTENT, id, "_section.json"), JSON.stringify(out, null, 2) + "\n");
}

console.log(`✓ Đã chuyển ${moved} bài, tách ${quizzes} bộ quiz vào content/`);
console.log(`✓ Đã sinh ${Object.keys(SECTIONS).length} file _section.json`);
