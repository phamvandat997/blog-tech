"use strict";
// Trang /admin: soạn một bài markdown rồi commit thẳng vào content/ trên GitHub.
// Vercel thấy commit mới là tự build và deploy.
//
// VỀ BẢO MẬT: danh sách email dưới đây chỉ là rào chắn nhầm lẫn, KHÔNG phải
// bảo mật — ai xem mã nguồn trang cũng đọc được. Thứ thật sự chặn người lạ là
// GitHub: không có token đủ quyền đẩy vào kho thì commit bị từ chối, dù có
// vào được màn hình này.

const ALLOWED_EMAILS = ["phamvandat0029@gmail.com"];

const DEFAULT_REPO = { owner: "phamvandat997", repo: "blog-tech", branch: "master" };
const SESSION_KEY = "blog.adminSession";
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const NEW = "__new__";

const admin = {
  /** @type {GitHubRepo|null} */ gh: null,
  sections: [],   // [{ id, name, icon, categories: [{id,name,icon,order}] }]
  quizFile: null, // { name, content }
  busy: false,
};

/* ------------------------------------------------------------- tiện ích */

/** "Phase 1: Nền tảng Java" → "phase-1-nen-tang-java" */
function toSlug(text) {
  return String(text || "")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")  // bỏ dấu tiếng Việt
    .replace(/đ/g, "d").replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function readSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function writeSession(session) {
  try { localStorage.setItem(SESSION_KEY, JSON.stringify(session)); } catch { /* bỏ qua */ }
}

function clearSession() {
  try { localStorage.removeItem(SESSION_KEY); } catch { /* bỏ qua */ }
}

function showAlert(el, message) {
  el.textContent = message;
  el.hidden = !message;
}

/* --------------------------------------------------------- đăng nhập */

async function handleLogin(event) {
  event.preventDefault();
  const button = qs("#login-submit");
  const error = qs("#login-error");
  showAlert(error, "");

  const email = qs("#login-email").value.trim().toLowerCase();
  const token = qs("#login-token").value.trim();
  const config = {
    owner: qs("#login-owner").value.trim(),
    repo: qs("#login-repo").value.trim(),
    branch: qs("#login-branch").value.trim(),
  };

  if (!ALLOWED_EMAILS.includes(email)) {
    return showAlert(error, "Email này không nằm trong danh sách được phép đăng bài.");
  }

  button.disabled = true;
  button.textContent = "Đang kiểm tra token…";
  try {
    const gh = new GitHubRepo({ token, ...config });
    const user = await gh.verify();
    admin.gh = gh;
    writeSession({ email, token, ...config, login: user.login });
    await enterEditor(email, user.login);
  } catch (err) {
    showAlert(error, err.message);
  } finally {
    button.disabled = false;
    button.textContent = "Đăng nhập";
  }
}

async function enterEditor(email, login) {
  qs("#admin-login").hidden = true;
  qs("#admin-editor").hidden = false;
  qs("#btn-logout").hidden = false;
  const who = qs("#admin-whoami");
  who.textContent = `${email} · @${login}`;
  who.hidden = false;
  await loadSections();
}

/* --------------------------------------- đọc cây thư mục từ GitHub */

/** Đọc content/ trên GitHub: mảng nào có, mỗi mảng có chuyên mục nào. */
async function loadSections() {
  const select = qs("#field-section");
  select.disabled = true;
  select.innerHTML = '<option>Đang đọc thư mục content/ …</option>';

  const keep = { section: select.value, category: qs("#field-category").value };

  try {
    const ids = await admin.gh.listDirs("content");
    admin.sections = await Promise.all(ids.map(async (id) => {
      const [dirs, metaRaw] = await Promise.all([
        admin.gh.listDirs(`content/${id}`),
        admin.gh.readFile(`content/${id}/_section.json`),
      ]);
      let meta = {};
      try { meta = metaRaw ? JSON.parse(metaRaw) : {}; } catch { meta = {}; }
      const declared = new Map((meta.categories || []).map((c) => [c.id, c]));
      return {
        id,
        name: meta.name || id,
        icon: meta.icon || "📦",
        meta,
        categories: dirs.map((dirId) => ({
          id: dirId,
          name: declared.get(dirId)?.name || dirId,
          icon: declared.get(dirId)?.icon || "📁",
        })),
      };
    }));
    renderSectionSelect(keep);
  } catch (err) {
    select.innerHTML = '<option value="">Không đọc được</option>';
    showAlert(qs("#post-error"), `Không đọc được thư mục content/: ${err.message}`);
  } finally {
    select.disabled = false;
  }
}

/** @param {{section?: string, category?: string}} keep giữ lại lựa chọn đang có */
function renderSectionSelect(keep = {}) {
  const select = qs("#field-section");
  select.innerHTML =
    '<option value="">— Chọn mảng —</option>' +
    admin.sections.map((s) =>
      `<option value="${attr(s.id)}">${escapeHtml(s.icon)} ${escapeHtml(s.name)} (${escapeHtml(s.id)})</option>`).join("") +
    `<option value="${NEW}">➕ Tạo mảng mới…</option>`;

  // Đăng nhiều bài vào cùng một chỗ là chuyện thường — đừng bắt chọn lại.
  if (keep.section && admin.sections.some((s) => s.id === keep.section)) {
    select.value = keep.section;
  }
  renderCategorySelect(keep.category);
}

function renderCategorySelect(keepCategory) {
  const sectionId = qs("#field-section").value;
  const select = qs("#field-category");
  const isNewSection = sectionId === NEW;

  qs("#new-section-form").hidden = !isNewSection;

  if (!sectionId) {
    select.innerHTML = '<option value="">— Chọn mảng trước —</option>';
    select.disabled = true;
    qs("#new-category-form").hidden = true;
    return updatePathPreview();
  }

  select.disabled = false;
  const section = admin.sections.find((s) => s.id === sectionId);
  // Mảng mới thì chưa có chuyên mục nào, buộc phải tạo mới.
  const options = isNewSection ? [] : (section?.categories || []);

  select.innerHTML =
    (options.length ? '<option value="">— Chọn chuyên mục —</option>' : "") +
    options.map((c) =>
      `<option value="${attr(c.id)}">${escapeHtml(c.icon)} ${escapeHtml(c.name)} (${escapeHtml(c.id)})</option>`).join("") +
    `<option value="${NEW}"${options.length ? "" : " selected"}>➕ Tạo chuyên mục mới…</option>`;

  if (keepCategory && options.some((c) => c.id === keepCategory)) select.value = keepCategory;

  qs("#new-category-form").hidden = select.value !== NEW;
  updatePathPreview();
}

/* ----------------------------------------------- đường dẫn sẽ ghi */

function resolvePlacement() {
  const sectionId = qs("#field-section").value === NEW
    ? toSlug(qs("#new-section-id").value)
    : qs("#field-section").value;
  const categoryId = qs("#field-category").value === NEW
    ? toSlug(qs("#new-category-id").value)
    : qs("#field-category").value;
  return { sectionId, categoryId, slug: toSlug(qs("#field-slug").value) };
}

function updatePathPreview() {
  const { sectionId, categoryId, slug } = resolvePlacement();
  qs("#path-preview").textContent =
    `content/${sectionId || "…"}/${categoryId || "…"}/${slug || "…"}.md`;
}

/* ------------------------------------------------------ nạp file .md */

function handleMarkdownFile(file) {
  const reader = new FileReader();
  reader.onload = () => {
    const { data, body } = parseFrontmatter(String(reader.result));
    qs("#field-body").value = body.trim();

    // Frontmatter sẵn có thì điền vào form, nhưng không ghi đè thứ đã gõ.
    const fill = (id, value) => {
      const el = qs(id);
      if (value !== undefined && value !== null && value !== "" && !el.value) el.value = value;
    };
    fill("#field-title", data.title);
    fill("#field-description", data.description);
    fill("#field-icon", data.icon);
    fill("#field-order", data.order);
    fill("#field-phase", data.phase);
    fill("#field-tags", Array.isArray(data.tags) ? data.tags.join(", ") : data.tags);

    if (!qs("#field-slug").value) {
      qs("#field-slug").value = toSlug(file.name.replace(/\.(md|markdown)$/i, ""));
    }
    if (!qs("#field-title").value) {
      const heading = body.match(/^#\s+(.+)$/m);
      if (heading) qs("#field-title").value = heading[1].trim();
    }

    qs("#file-markdown-name").textContent = `Đã nạp ${file.name}`;
    updatePathPreview();
    showAlert(qs("#post-error"), "");
  };
  reader.onerror = () => showAlert(qs("#post-error"), `Không đọc được ${file.name}.`);
  reader.readAsText(file);
}

function handleQuizFile(file) {
  const reader = new FileReader();
  reader.onload = () => {
    const text = String(reader.result);
    try {
      const parsed = JSON.parse(text);
      const count = (parsed.quizzes || []).length;
      if (!count) throw new Error('không thấy mảng "quizzes" nào có câu hỏi');
      admin.quizFile = { name: file.name, content: text };
      qs("#file-quiz-name").textContent = `${file.name} — ${count} câu`;
      qs("#file-quiz-clear").hidden = false;
      showAlert(qs("#post-error"), "");
    } catch (err) {
      admin.quizFile = null;
      qs("#file-quiz-name").textContent = "Chưa chọn file";
      showAlert(qs("#post-error"), `File quiz không hợp lệ: ${err.message}`);
    }
  };
  reader.readAsText(file);
}

/* ------------------------------------------------------- kiểm tra form */

/** @returns {{files: {path,content}[], message: string, docUrl: string}} */
function buildCommit() {
  const { sectionId, categoryId, slug } = resolvePlacement();
  const body = qs("#field-body").value.trim();
  const isNewSection = qs("#field-section").value === NEW;
  const isNewCategory = qs("#field-category").value === NEW;

  const fail = (msg) => { throw new Error(msg); };

  if (!sectionId) fail("Chưa chọn mảng nội dung.");
  if (!SLUG_RE.test(sectionId)) fail(`Tên thư mục mảng "${sectionId}" không hợp lệ — chỉ chữ thường, số và dấu -`);
  if (!categoryId) fail("Chưa chọn chuyên mục.");
  if (!SLUG_RE.test(categoryId)) fail(`Tên thư mục chuyên mục "${categoryId}" không hợp lệ — chỉ chữ thường, số và dấu -`);
  if (!slug) fail("Chưa đặt tên file.");
  if (!SLUG_RE.test(slug)) fail(`Tên file "${slug}" không hợp lệ — chỉ chữ thường, số và dấu -`);
  if (!body) fail("Nội dung bài đang trống.");

  if (isNewSection) {
    if (!qs("#new-section-name").value.trim()) fail("Mảng mới cần tên hiển thị.");
    if (admin.sections.some((s) => s.id === sectionId)) fail(`Mảng "${sectionId}" đã tồn tại — chọn nó ở dropdown thay vì tạo mới.`);
  }
  if (isNewCategory && !qs("#new-category-name").value.trim()) fail("Chuyên mục mới cần tên hiển thị.");

  const section = admin.sections.find((s) => s.id === sectionId);
  if (isNewCategory && !isNewSection && section?.categories.some((c) => c.id === categoryId)) {
    fail(`Chuyên mục "${categoryId}" đã có trong ${sectionId} — chọn nó ở dropdown.`);
  }

  const tags = qs("#field-tags").value.split(",").map((t) => t.trim()).filter(Boolean);
  const order = qs("#field-order").value.trim();

  const markdown = stringifyFrontmatter({
    title: qs("#field-title").value.trim(),
    description: qs("#field-description").value.trim(),
    icon: qs("#field-icon").value.trim(),
    order: order ? Number(order) : "",
    phase: qs("#field-phase").value.trim(),
    tags,
  }, body);

  const dir = `content/${sectionId}/${categoryId}`;
  const files = [{ path: `${dir}/${slug}.md`, content: markdown }];
  if (admin.quizFile) files.push({ path: `${dir}/${slug}.quiz.json`, content: admin.quizFile.content });

  // _section.json: tạo mới, hoặc bổ sung chuyên mục vào mảng đã có.
  const newCategory = {
    id: categoryId,
    name: qs("#new-category-name").value.trim() || categoryId,
    icon: qs("#new-category-icon").value.trim() || "📁",
    order: (section?.categories.length || 0) + 1,
  };

  if (isNewSection) {
    files.push({
      path: `content/${sectionId}/_section.json`,
      content: JSON.stringify({
        name: qs("#new-section-name").value.trim(),
        icon: qs("#new-section-icon").value.trim() || "📦",
        color: qs("#new-section-color").value,
        kind: qs("#new-section-kind").value,
        order: admin.sections.length + 1,
        tagline: qs("#new-section-tagline").value.trim(),
        categories: [{ ...newCategory, order: 1 }],
      }, null, 2) + "\n",
    });
  } else if (isNewCategory) {
    const meta = JSON.parse(JSON.stringify(section?.meta || {}));
    meta.categories = [...(meta.categories || []), newCategory];
    files.push({
      path: `content/${sectionId}/_section.json`,
      content: JSON.stringify(meta, null, 2) + "\n",
    });
  }

  const title = qs("#field-title").value.trim() || slug;
  return {
    sectionId,
    categoryId,
    files,
    message: `content: them bai "${title}"\n\n${files.map((f) => `- ${f.path}`).join("\n")}`,
    docUrl: `reader.html?s=${encodeURIComponent(sectionId)}&d=${encodeURIComponent(`${categoryId}/${slug}`)}`,
  };
}

/* ------------------------------------------------------------ đăng bài */

async function handlePost(event) {
  event.preventDefault();
  if (admin.busy) return;

  const button = qs("#post-submit");
  const status = qs("#post-status");
  showAlert(qs("#post-error"), "");
  showAlert(qs("#post-success"), "");

  let plan;
  try {
    plan = buildCommit();
  } catch (err) {
    return showAlert(qs("#post-error"), err.message);
  }

  // Ghi đè bài đã có là chuyện lớn — hỏi trước.
  const existing = await admin.gh.readFile(plan.files[0].path).catch(() => null);
  if (existing !== null &&
      !window.confirm(`${plan.files[0].path} đã tồn tại.\n\nĐăng tiếp sẽ GHI ĐÈ toàn bộ nội dung cũ. Tiếp tục?`)) {
    return;
  }

  admin.busy = true;
  button.disabled = true;
  button.textContent = "Đang commit…";
  status.textContent = `${plan.files.length} file`;

  try {
    const commit = await admin.gh.commitFiles(plan.files, plan.message);
    const success = qs("#post-success");
    success.innerHTML =
      `✅ Đã commit <a href="${attr(commit.url)}" target="_blank" rel="noopener"><code>${escapeHtml(commit.sha.slice(0, 7))}</code></a>. ` +
      `Vercel đang build — khoảng một phút nữa bài sẽ lên sóng tại ` +
      `<a href="${attr(plan.docUrl)}">${escapeHtml(plan.files[0].path.replace(/^content\//, "").replace(/\.md$/, ""))}</a>.`;
    success.hidden = false;
    status.textContent = "";
    resetForm();
    // Nạp lại để mảng/chuyên mục vừa tạo xuất hiện ở dropdown, rồi chọn đúng
    // chỗ vừa đăng để viết bài tiếp không phải chọn lại.
    await loadSections();
    qs("#field-section").value = plan.sectionId;
    renderCategorySelect(plan.categoryId);
  } catch (err) {
    showAlert(qs("#post-error"), err.message);
    status.textContent = "";
  } finally {
    admin.busy = false;
    button.disabled = false;
    button.textContent = "Đăng bài";
  }
}

function resetForm() {
  ["#field-slug", "#field-title", "#field-description", "#field-icon",
   "#field-order", "#field-phase", "#field-tags", "#field-body"].forEach((id) => { qs(id).value = ""; });
  ["#new-section-id", "#new-section-name", "#new-section-icon", "#new-section-tagline",
   "#new-category-id", "#new-category-name", "#new-category-icon"].forEach((id) => { qs(id).value = ""; });
  admin.quizFile = null;
  qs("#file-quiz").value = "";
  qs("#file-quiz-name").textContent = "Chưa chọn file";
  qs("#file-quiz-clear").hidden = true;
  qs("#file-markdown").value = "";
  qs("#file-markdown-name").textContent = "Hoặc gõ thẳng vào ô bên dưới";
  updatePathPreview();
}

/* ------------------------------------------------------------- sự kiện */

function bindEvents() {
  qs("#login-form").addEventListener("submit", handleLogin);
  qs("#post-form").addEventListener("submit", handlePost);

  qs("#btn-logout").addEventListener("click", () => {
    clearSession();
    window.location.reload();
  });

  qs("#field-section").addEventListener("change", renderCategorySelect);
  qs("#field-category").addEventListener("change", () => {
    qs("#new-category-form").hidden = qs("#field-category").value !== NEW;
    updatePathPreview();
  });

  ["#field-slug", "#new-section-id", "#new-category-id"].forEach((id) =>
    qs(id).addEventListener("input", updatePathPreview));

  // Tên thư mục gõ tự do nhưng chuẩn hoá khi rời ô, để không commit tên sai.
  ["#field-slug", "#new-section-id", "#new-category-id"].forEach((id) =>
    qs(id).addEventListener("blur", (event) => {
      event.target.value = toSlug(event.target.value);
      updatePathPreview();
    }));

  qs("#new-section-name").addEventListener("input", (event) => {
    if (!qs("#new-section-id").value) {
      qs("#new-section-id").value = toSlug(event.target.value);
      updatePathPreview();
    }
  });
  qs("#new-category-name").addEventListener("input", (event) => {
    if (!qs("#new-category-id").value) {
      qs("#new-category-id").value = toSlug(event.target.value);
      updatePathPreview();
    }
  });

  qs("#field-title").addEventListener("input", (event) => {
    // Slug bám theo tiêu đề cho tới khi người dùng tự sửa slug.
    if (!qs("#field-slug").dataset.touched) {
      qs("#field-slug").value = toSlug(event.target.value);
      updatePathPreview();
    }
  });
  qs("#field-slug").addEventListener("input", (event) => {
    event.target.dataset.touched = event.target.value ? "1" : "";
  });

  qs("#file-markdown").addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) handleMarkdownFile(file);
  });
  qs("#file-quiz").addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) handleQuizFile(file);
  });
  qs("#file-quiz-clear").addEventListener("click", () => {
    admin.quizFile = null;
    qs("#file-quiz").value = "";
    qs("#file-quiz-name").textContent = "Chưa chọn file";
    qs("#file-quiz-clear").hidden = true;
  });

  qsa("[data-editor-tab]").forEach((btn) => btn.addEventListener("click", () => {
    const isPreview = btn.dataset.editorTab === "preview";
    qsa("[data-editor-tab]").forEach((b) => b.classList.toggle("active", b === btn));
    qs("#field-body").hidden = isPreview;
    qs("#body-preview").hidden = !isPreview;
    if (isPreview) {
      const text = qs("#field-body").value.trim();
      qs("#body-preview").innerHTML = text
        ? renderMarkdown(text)
        : '<p class="admin-hint">Chưa có nội dung để xem trước.</p>';
    }
  }));
}

/* -------------------------------------------------------------- khởi động */

document.addEventListener("DOMContentLoaded", async () => {
  initTheme();
  bindEvents();

  const session = readSession();
  qs("#login-owner").value = session?.owner || DEFAULT_REPO.owner;
  qs("#login-repo").value = session?.repo || DEFAULT_REPO.repo;
  qs("#login-branch").value = session?.branch || DEFAULT_REPO.branch;
  qs("#login-email").value = session?.email || "";

  if (!session?.token) {
    qs("#admin-login").hidden = false;
    return;
  }

  // Có phiên cũ: kiểm token còn dùng được không rồi mới vào thẳng.
  try {
    const gh = new GitHubRepo(session);
    const user = await gh.verify();
    admin.gh = gh;
    await enterEditor(session.email, user.login);
  } catch (err) {
    clearSession();
    qs("#admin-login").hidden = false;
    showAlert(qs("#login-error"), `Phiên cũ không dùng được nữa — ${err.message}`);
  }
});
