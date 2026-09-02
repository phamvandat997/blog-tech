"use strict";
// Trang /admin: quản lý bài viết của blog.
//
// MỌI thay đổi — tạo, sửa, xoá — đều đi qua pull request: tạo nhánh mới từ
// nhánh chính, commit vào đó, rồi mở PR. Bài chỉ lên sóng khi PR được merge,
// vì lúc đó Vercel mới build lại từ content/ trên nhánh chính.
//
// Nhờ vậy KHÔNG cần lưu trạng thái bài ở đâu cả — trạng thái suy ra từ Git:
//   nằm trên nhánh chính     → đang đăng
//   chỉ nằm trong PR đang mở → chờ duyệt
// Không có field nào để lệch với thực tế.
//
// VỀ BẢO MẬT: danh sách email dưới đây chỉ là rào chắn nhầm lẫn, KHÔNG phải
// bảo mật — ai xem mã nguồn trang cũng đọc được. Thứ thật sự chặn người lạ là
// GitHub: không có token đủ quyền đẩy vào kho thì commit bị từ chối.

const ALLOWED_EMAILS = ["phamvandat0029@gmail.com"];

const DEFAULT_REPO = { owner: "phamvandat997", repo: "blog-tech", branch: "master" };
const SESSION_KEY = "blog.adminSession";
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const NEW = "__new__";
const BRANCH_PREFIX = "post/";

const admin = {
  /** @type {GitHubRepo|null} */ gh: null,
  sections: [],    // [{ id, name, meta, categories: [{id, name}] }]
  posts: [],       // [{ path, section, category, slug, title, status, pr }]
  /** null khi tạo mới; { path, quizPath, quizContent } khi đang sửa bài có sẵn */
  editing: null,
  busy: false,
};

/* ------------------------------------------------------------- tiện ích */

/** "Phase 1: Nền tảng Java" → "phase-1-nen-tang-java" */
function toSlug(text) {
  return String(text || "")
    .normalize("NFD").replace(/[̀-ͯ]/g, "")  // bỏ dấu tiếng Việt
    .replace(/đ/g, "d").replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** post/them-bai-abc-20260902-143512 */
function branchName(action, slug) {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}` +
    `-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  return `${BRANCH_PREFIX}${action}-${slug}-${stamp}`;
}

const readSession = () => {
  try { const raw = localStorage.getItem(SESSION_KEY); return raw ? JSON.parse(raw) : null; }
  catch { return null; }
};
const writeSession = (s) => { try { localStorage.setItem(SESSION_KEY, JSON.stringify(s)); } catch { /* bỏ qua */ } };
const clearSession = () => { try { localStorage.removeItem(SESSION_KEY); } catch { /* bỏ qua */ } };

function showAlert(el, message, html = false) {
  if (html) el.innerHTML = message; else el.textContent = message;
  el.hidden = !message;
}

/** Tiêu đề lấy từ catalog đã build; bài chờ duyệt chưa có trong đó. */
function titleFromCatalog(id) {
  if (typeof DOCUMENTS === "undefined") return null;
  return DOCUMENTS.find((d) => d.id === id)?.title || null;
}

/** Một client đọc cùng kho nhưng ở nhánh khác — dùng khi sửa bài đang chờ duyệt. */
const repoAtBranch = (branch) => new GitHubRepo({
  token: admin.gh.token, owner: admin.gh.owner, repo: admin.gh.repo, branch,
});

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
    await enterApp(email, user.login);
  } catch (err) {
    showAlert(error, err.message);
  } finally {
    button.disabled = false;
    button.textContent = "Đăng nhập";
  }
}

async function enterApp(email, login) {
  qs("#admin-login").hidden = true;
  qs("#admin-tabs").hidden = false;
  qs("#btn-logout").hidden = false;
  const who = qs("#admin-whoami");
  who.textContent = `${email} · @${login}`;
  who.hidden = false;
  await loadSections();
  switchView("list");
}

/* ------------------------------------------------------ chuyển màn hình */

function switchView(view) {
  qsa("[data-view]").forEach((b) => b.classList.toggle("active", b.dataset.view === view));
  qs("#admin-list").hidden = view !== "list";
  qs("#admin-editor").hidden = view !== "editor";
  if (view === "list") loadPosts();
}

/* --------------------------------------- đọc cây thư mục từ GitHub */

/** Đọc content/ trên nhánh chính: mảng nào có, mỗi mảng có chuyên mục nào. */
async function loadSections() {
  const select = qs("#field-section");
  const keep = { section: select.value, category: qs("#field-category").value };
  select.disabled = true;
  select.innerHTML = "<option>Đang đọc thư mục content/ …</option>";

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
        meta,
        categories: dirs.map((dirId) => ({ id: dirId, name: declared.get(dirId)?.name || dirId })),
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

function renderSectionSelect(keep = {}) {
  const select = qs("#field-section");
  select.innerHTML =
    '<option value="">— Chọn mảng —</option>' +
    admin.sections.map((s) =>
      `<option value="${attr(s.id)}">${escapeHtml(s.name)} (${escapeHtml(s.id)})</option>`).join("") +
    `<option value="${NEW}">➕ Tạo mảng mới…</option>`;

  // Đăng nhiều bài vào cùng một chỗ là chuyện thường — đừng bắt chọn lại.
  if (keep.section && admin.sections.some((s) => s.id === keep.section)) select.value = keep.section;
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
      `<option value="${attr(c.id)}">${escapeHtml(c.name)} (${escapeHtml(c.id)})</option>`).join("") +
    `<option value="${NEW}"${options.length ? "" : " selected"}>➕ Tạo chuyên mục mới…</option>`;

  if (keepCategory && options.some((c) => c.id === keepCategory)) select.value = keepCategory;

  qs("#new-category-form").hidden = select.value !== NEW;
  updatePathPreview();
}

/* ------------------------------------------- danh sách & trạng thái bài */

/**
 * Trạng thái suy ra từ Git, không lưu ở đâu:
 *   có trên nhánh chính, không PR nào đụng → đang đăng
 *   có trên nhánh chính, đang có PR đụng   → chờ duyệt thay đổi
 *   chưa có trên nhánh chính, nằm trong PR → chờ duyệt bài mới
 */
async function loadPosts() {
  const list = qs("#post-list");
  showAlert(qs("#list-error"), "");
  list.innerHTML = '<p class="admin-hint">Đang đọc danh sách bài…</p>';

  try {
    const [paths, pulls] = await Promise.all([
      admin.gh.listContentFiles(),
      admin.gh.listOpenPullRequests(BRANCH_PREFIX),
    ]);

    // Mỗi PR đụng file nào — cần để gắn trạng thái cho đúng bài.
    const prFiles = await Promise.all(pulls.map((p) => admin.gh.pullRequestFiles(p.number)));
    const touched = new Map(); // đường dẫn -> { pr, fileStatus }
    pulls.forEach((pr, i) => prFiles[i]
      .filter((f) => f.path.endsWith(".md"))
      .forEach((f) => touched.set(f.path, { pr, fileStatus: f.status })));

    const onMaster = new Set(paths.filter((p) => p.endsWith(".md")));

    admin.posts = [...new Set([...onMaster, ...touched.keys()])].map((path) => {
      const [, section, category, file] = path.split("/");
      const slug = (file || "").replace(/\.md$/, "");
      const hit = touched.get(path) || null;
      return {
        path, section, category, slug,
        pr: hit?.pr || null,
        title: titleFromCatalog(`${section}/${category}/${slug}`) || slug,
        status: !hit ? "active"
          : hit.fileStatus === "removed" ? "removing"
          : !onMaster.has(path) ? "pending"
          : "changing",
      };
    }).sort((a, b) => a.path.localeCompare(b.path));

    renderPosts();
  } catch (err) {
    list.innerHTML = "";
    showAlert(qs("#list-error"), err.message);
  }
}

const STATUS_LABEL = {
  active:   ["Đang đăng", "is-active"],
  pending:  ["Chờ duyệt bài mới", "is-pending"],
  changing: ["Chờ duyệt thay đổi", "is-pending"],
  removing: ["Chờ duyệt xoá", "is-removing"],
};

function renderPosts() {
  const query = qs("#list-search").value.trim().toLowerCase();
  const posts = query
    ? admin.posts.filter((p) => `${p.title} ${p.path}`.toLowerCase().includes(query))
    : admin.posts;

  const list = qs("#post-list");
  if (!posts.length) {
    list.innerHTML = admin.posts.length
      ? '<p class="admin-hint">Không có bài nào khớp từ khoá.</p>'
      : '<p class="admin-hint">Chưa có bài nào. Bấm “Soạn bài mới” để bắt đầu.</p>';
    return;
  }

  const waiting = admin.posts.filter((p) => p.pr).length;
  list.innerHTML =
    `<p class="admin-list-count">${posts.length} bài${waiting ? ` · ${waiting} đang chờ duyệt` : ""}</p>` +
    posts.map((post) => {
      const [label, cls] = STATUS_LABEL[post.status];
      const prLink = post.pr
        ? `<a class="admin-pr-link" href="${attr(post.pr.html_url)}" target="_blank" rel="noopener">PR #${post.pr.number} ↗</a>`
        : "";
      return `<article class="admin-list-row" data-path="${attr(post.path)}">
        <div class="admin-list-main">
          <span class="admin-list-title">${escapeHtml(post.title)}</span>
          <code class="admin-list-path">${escapeHtml(post.path)}</code>
        </div>
        <div class="admin-list-side">
          <span class="admin-status ${cls}">${label}</span>
          ${prLink}
          <button class="admin-btn-secondary admin-btn-xs" type="button" data-edit>Sửa</button>
          ${post.status === "removing" ? ""
            : '<button class="admin-btn-danger admin-btn-xs" type="button" data-delete>Xoá</button>'}
        </div>
      </article>`;
    }).join("");
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

/* ------------------------------------------------------ nạp nội dung */

/** Đổ frontmatter + thân bài vào form. `overwrite` dùng khi mở bài để sửa. */
function fillEditor(data, body, { overwrite = false } = {}) {
  qs("#field-body").value = body.trim();
  const fill = (id, value) => {
    const el = qs(id);
    const empty = value === undefined || value === null || value === "";
    if (overwrite) el.value = empty ? "" : value;
    else if (!empty && !el.value) el.value = value;
  };
  fill("#field-title", data.title);
  fill("#field-description", data.description);
  fill("#field-order", data.order);
  fill("#field-phase", data.phase);
  fill("#field-tags", Array.isArray(data.tags) ? data.tags.join(", ") : data.tags);

  if (!qs("#field-title").value) {
    const heading = body.match(/^#\s+(.+)$/m);
    if (heading) qs("#field-title").value = heading[1].trim();
  }
}

function handleMarkdownFile(file) {
  const reader = new FileReader();
  reader.onload = () => {
    const { data, body } = parseFrontmatter(String(reader.result));
    fillEditor(data, body);
    if (!qs("#field-slug").value) {
      qs("#field-slug").value = toSlug(file.name.replace(/\.(md|markdown)$/i, ""));
    }
    qs("#file-markdown-name").textContent = `Đã nạp ${file.name}`;
    updatePathPreview();
    showAlert(qs("#post-error"), "");
  };
  reader.onerror = () => showAlert(qs("#post-error"), `Không đọc được ${file.name}.`);
  reader.readAsText(file);
}

/* ------------------------------------------------------- dựng thay đổi */

/** @returns {{files, message, sectionId, categoryId, slug, path, action, title}} */
function buildChange() {
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
    order: order ? Number(order) : "",
    phase: qs("#field-phase").value.trim(),
    tags,
  }, body);

  const dir = `content/${sectionId}/${categoryId}`;
  const path = `${dir}/${slug}.md`;
  const files = [{ path, content: markdown }];

  // Sửa bài mà đổi chỗ hoặc đổi tên file → xoá đường dẫn cũ trong cùng commit,
  // nếu không sẽ thành hai bài trùng nội dung.
  if (admin.editing && admin.editing.path !== path) {
    files.push({ path: admin.editing.path, remove: true });
    // Tính năng quiz đang tạm gỡ nhưng file .quiz.json vẫn nằm trên kho —
    // đổi tên bài thì mang nó theo, đừng để mất dữ liệu hay bỏ lại file mồ côi.
    if (admin.editing.quizContent !== null) {
      files.push({ path: `${dir}/${slug}.quiz.json`, content: admin.editing.quizContent });
      files.push({ path: admin.editing.quizPath, remove: true });
    }
  }

  const newCategory = {
    id: categoryId,
    name: qs("#new-category-name").value.trim() || categoryId,
    order: (section?.categories.length || 0) + 1,
  };

  if (isNewSection) {
    files.push({
      path: `content/${sectionId}/_section.json`,
      content: JSON.stringify({
        name: qs("#new-section-name").value.trim(),
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
    files.push({ path: `content/${sectionId}/_section.json`, content: JSON.stringify(meta, null, 2) + "\n" });
  }

  const title = qs("#field-title").value.trim() || slug;
  const action = admin.editing ? "sua" : "them";
  return { files, sectionId, categoryId, slug, path, action, title,
    message: `content: ${action} bai "${title}"` };
}

/* ------------------------------------------------ tạo nhánh + mở PR */

/**
 * Tạo nhánh từ nhánh chính, commit vào đó, mở PR. Nhánh được dọn nếu commit
 * hoặc PR hỏng giữa chừng, để không bỏ lại nhánh rác trên kho.
 */
async function openPullRequest({ files, message, action, slug, title }) {
  const branch = branchName(action, slug);
  await admin.gh.createBranch(branch);
  try {
    await admin.gh.commitFiles(files, message, branch);
    return await admin.gh.createPullRequest({
      head: branch,
      title: message,
      body: `Tạo từ trang /admin.\n\n` +
        files.map((f) => `- ${f.remove ? "xoá" : "ghi"} \`${f.path}\``).join("\n") +
        `\n\nMerge vào \`${admin.gh.branch}\` là Vercel build lại và bài "${title}" lên sóng.`,
    });
  } catch (error) {
    await admin.gh.deleteBranch(branch).catch(() => { /* dọn được thì tốt */ });
    throw error;
  }
}

/* ------------------------------------------------------------ đăng bài */

async function handleSubmit(event) {
  event.preventDefault();
  if (admin.busy) return;

  const button = qs("#post-submit");
  const editing = admin.editing;
  showAlert(qs("#post-error"), "");
  showAlert(qs("#post-success"), "");

  let plan;
  try {
    plan = buildChange();
  } catch (err) {
    return showAlert(qs("#post-error"), err.message);
  }

  // Tạo mới mà trùng đường dẫn có sẵn thì hỏi trước.
  if (!editing) {
    const existing = await admin.gh.readFile(plan.path).catch(() => null);
    if (existing !== null && !window.confirm(
        `${plan.path} đã tồn tại trên ${admin.gh.branch}.\n\n` +
        `Đăng tiếp sẽ GHI ĐÈ nội dung cũ khi PR được merge. Tiếp tục?`)) {
      return;
    }
  }

  admin.busy = true;
  button.disabled = true;
  button.textContent = "Đang tạo nhánh và mở PR…";

  try {
    const pr = await openPullRequest(plan);
    showAlert(qs("#post-success"),
      `✅ Đã mở <a href="${attr(pr.html_url)}" target="_blank" rel="noopener">PR #${pr.number}</a>. ` +
      `Bài chỉ lên sóng sau khi PR được merge — Vercel build lại khoảng một phút sau đó.`, true);
    resetForm();
    await loadSections();
    qs("#field-section").value = plan.sectionId;
    renderCategorySelect(plan.categoryId);
  } catch (err) {
    showAlert(qs("#post-error"), err.message);
  } finally {
    admin.busy = false;
    button.disabled = false;
    button.textContent = admin.editing ? "Tạo pull request cập nhật" : "Tạo pull request";
  }
}

/* ------------------------------------------------------------ sửa bài */

async function startEdit(post) {
  resetForm();
  switchView("editor");

  const banner = qs("#edit-banner");
  showAlert(banner, `Đang tải ${post.path}…`);

  try {
    // Bài chờ duyệt còn nằm trên nhánh PR, chưa có trên nhánh chính.
    const source = post.pr ? repoAtBranch(post.pr.head.ref) : admin.gh;
    const raw = await source.readFile(post.path);
    if (raw === null) throw new Error(`Không đọc được ${post.path} trên nhánh ${source.branch}.`);

    const quizPath = post.path.replace(/\.md$/, ".quiz.json");
    const quizRaw = await source.readFile(quizPath);

    const { data, body } = parseFrontmatter(raw);
    admin.editing = { path: post.path, quizPath, quizContent: quizRaw };

    qs("#field-section").value = post.section;
    renderCategorySelect(post.category);
    qs("#field-slug").value = post.slug;
    qs("#field-slug").dataset.touched = "1";
    fillEditor(data, body, { overwrite: true });


    updatePathPreview();
    showAlert(banner,
      `Đang sửa <code>${escapeHtml(post.path)}</code>` +
      (post.pr ? ` — đọc từ nhánh của PR #${post.pr.number}.` : ".") +
      ` Lưu lại sẽ mở một pull request mới.`, true);
    qs("#btn-cancel-edit").hidden = false;
    qs("#post-submit").textContent = "Tạo pull request cập nhật";
  } catch (err) {
    admin.editing = null;
    showAlert(banner, "");
    showAlert(qs("#post-error"), err.message);
  }
}

/* ------------------------------------------------------------ xoá bài */

async function handleDelete(post) {
  if (!window.confirm(
    `Xoá bài này?\n\n${post.path}\n\n` +
    `Thao tác sẽ mở một pull request xoá file. Bài chỉ thật sự biến mất khỏi ` +
    `site sau khi bạn merge PR đó.`)) return;

  showAlert(qs("#list-error"), "");
  const row = qs(`[data-path="${CSS.escape(post.path)}"]`);
  const button = row && qs("[data-delete]", row);
  if (button) { button.disabled = true; button.textContent = "Đang mở PR…"; }

  try {
    const files = [{ path: post.path, remove: true }];
    // Quiz đi kèm bài thì xoá luôn, đừng để lại file mồ côi.
    const quizPath = post.path.replace(/\.md$/, ".quiz.json");
    if (await admin.gh.readFile(quizPath).catch(() => null) !== null) {
      files.push({ path: quizPath, remove: true });
    }

    const pr = await openPullRequest({
      files,
      message: `content: xoa bai "${post.title}"`,
      action: "xoa",
      slug: post.slug,
      title: post.title,
    });
    showToast(`Đã mở PR #${pr.number} để xoá bài.`);
    window.open(pr.html_url, "_blank", "noopener");
    await loadPosts();
  } catch (err) {
    showAlert(qs("#list-error"), err.message);
    if (button) { button.disabled = false; button.textContent = "Xoá"; }
  }
}

/* ------------------------------------------------------------- form */

function resetForm() {
  ["#field-slug", "#field-title", "#field-description",
   "#field-order", "#field-phase", "#field-tags", "#field-body"].forEach((id) => { qs(id).value = ""; });
  ["#new-section-id", "#new-section-name", "#new-section-tagline",
   "#new-category-id", "#new-category-name"].forEach((id) => { qs(id).value = ""; });
  ["#field-slug", "#new-section-id", "#new-category-id"].forEach((id) => { qs(id).dataset.touched = ""; });

  admin.editing = null;
  qs("#file-markdown").value = "";
  qs("#file-markdown-name").textContent = "Hoặc gõ thẳng vào ô bên dưới";
  qs("#edit-banner").hidden = true;
  qs("#btn-cancel-edit").hidden = true;
  qs("#post-submit").textContent = "Tạo pull request";
  updatePathPreview();
}

/* ------------------------------------------------------------- sự kiện */

function bindEvents() {
  qs("#login-form").addEventListener("submit", handleLogin);
  qs("#post-form").addEventListener("submit", handleSubmit);

  qs("#btn-logout").addEventListener("click", () => { clearSession(); window.location.reload(); });

  qsa("[data-view]").forEach((btn) => btn.addEventListener("click", () => {
    // Bấm "Soạn bài mới" khi đang sửa dở thì phải về trạng thái tạo mới.
    if (btn.dataset.view === "editor" && admin.editing) resetForm();
    switchView(btn.dataset.view);
  }));

  qs("#btn-cancel-edit").addEventListener("click", () => { resetForm(); switchView("list"); });
  qs("#btn-refresh").addEventListener("click", loadPosts);
  qs("#list-search").addEventListener("input", renderPosts);

  const rowAction = (selector, handler) =>
    delegate(qs("#post-list"), "click", selector, (_, btn) => {
      const post = admin.posts.find((p) => p.path === btn.closest("[data-path]").dataset.path);
      if (post) handler(post);
    });
  rowAction("[data-edit]", startEdit);
  rowAction("[data-delete]", handleDelete);

  qs("#field-section").addEventListener("change", () => renderCategorySelect());
  qs("#field-category").addEventListener("change", () => {
    qs("#new-category-form").hidden = qs("#field-category").value !== NEW;
    updatePathPreview();
  });

  ["#field-slug", "#new-section-id", "#new-category-id"].forEach((id) => {
    qs(id).addEventListener("input", (event) => {
      event.target.dataset.touched = event.target.value ? "1" : "";
      updatePathPreview();
    });
    // Chuẩn hoá khi rời ô, để không commit ra tên thư mục sai quy ước.
    qs(id).addEventListener("blur", (event) => {
      event.target.value = toSlug(event.target.value);
      updatePathPreview();
    });
  });

  // Tên thư mục bám theo tên hiển thị cho tới khi người dùng tự sửa nó.
  const bindAutoSlug = (nameId, idField) => qs(nameId).addEventListener("input", (event) => {
    if (qs(idField).dataset.touched) return;
    qs(idField).value = toSlug(event.target.value);
    updatePathPreview();
  });
  bindAutoSlug("#new-section-name", "#new-section-id");
  bindAutoSlug("#new-category-name", "#new-category-id");

  qs("#field-title").addEventListener("input", (event) => {
    if (qs("#field-slug").dataset.touched) return;
    qs("#field-slug").value = toSlug(event.target.value);
    updatePathPreview();
  });

  qs("#file-markdown").addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) handleMarkdownFile(file);
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
    await enterApp(session.email, user.login);
  } catch (err) {
    clearSession();
    qs("#admin-login").hidden = false;
    showAlert(qs("#login-error"), `Phiên cũ không dùng được nữa — ${err.message}`);
  }
});
