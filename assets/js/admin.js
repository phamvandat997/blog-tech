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
const DRAFT_KEY = "blog.adminDraft";
const DRAFT_DEBOUNCE_MS = 800;
const SPLIT_QUERY = "(min-width: 1100px)";
const PREVIEW_KEY = "blog.readerPreview";

const admin = {
  /** @type {GitHubRepo|null} */ gh: null,
  sections: [],    // [{ id, name, meta, categories: [{id, name}] }]
  posts: [],       // [{ path, section, category, slug, title, status, pr }]
  /** null khi tạo mới; { path, quizPath, quizContent } khi đang sửa bài có sẵn */
  editing: null,
  busy: false,
  /** Trường frontmatter form không còn ô nhập nhưng phải giữ nguyên khi lưu lại. */
  carried: {},
  filter: "all",       // bộ lọc trạng thái ở màn danh sách
  postsToken: 0,       // chống kết quả của lượt loadPosts cũ ghi đè lượt mới
  dirty: false,        // form có thay đổi chưa gửi
  restoring: false,    // đang đổ dữ liệu vào form, đừng coi là người dùng gõ
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
    enterApp(email, user.login);
  } catch (err) {
    showAlert(error, err.message);
  } finally {
    button.disabled = false;
    button.textContent = "Đăng nhập";
  }
}

function enterApp(email, login) {
  qs("#admin-boot").hidden = true;
  qs("#admin-login").hidden = true;
  qs("#admin-tabs").hidden = false;
  qs("#btn-logout").hidden = false;
  const who = qs("#admin-whoami");
  who.textContent = `${email} · @${login}`;
  who.hidden = false;

  // Hai lời gọi này không phụ thuộc nhau — danh sách bài không cần cây thư mục,
  // cây thư mục chỉ cần cho màn soạn bài. Chạy nối đuôi thì mất gấp đôi số vòng
  // round-trip trước khi thấy bài đầu tiên, nên bắn song song.
  loadSections();
  switchView("list");
}

/* ------------------------------------------------------ chuyển màn hình */

function switchView(view) {
  qsa("[data-view]").forEach((b) => b.classList.toggle("active", b.dataset.view === view));
  qs("#admin-list").hidden = view !== "list";
  qs("#admin-editor").hidden = view !== "editor";
  if (view === "list") loadPosts();
  else syncEditorPanes();
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
function listSkeleton(rows = 5) {
  return `<div class="admin-skeleton" aria-busy="true" aria-label="Đang tải danh sách bài">` +
    Array.from({ length: rows }, () => `<div class="admin-skeleton-row">
      <div class="skeleton-line skeleton-title"></div>
      <div class="skeleton-line skeleton-path"></div>
    </div>`).join("") + `</div>`;
}

async function loadPosts() {
  const list = qs("#post-list");
  showAlert(qs("#list-error"), "");
  list.innerHTML = listSkeleton();
  qs("#list-filters").hidden = true;

  // Bấm "Tải lại" liên tục thì lượt chậm về sau không được ghi đè lượt mới.
  const token = ++admin.postsToken;
  const stale = () => token !== admin.postsToken;

  try {
    const [paths, pulls] = await Promise.all([
      admin.gh.listContentFiles(),
      admin.gh.listOpenPullRequests(BRANCH_PREFIX),
    ]);
    if (stale()) return;

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

    if (stale()) return;
    renderPosts();
  } catch (err) {
    if (stale()) return;
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

const FILTERS = [
  ["all",     "Tất cả",     () => true],
  ["active",  "Đang đăng",  (p) => p.status === "active"],
  ["waiting", "Chờ duyệt",  (p) => p.status === "pending" || p.status === "changing"],
  ["removing","Chờ xoá",    (p) => p.status === "removing"],
];

function renderFilters() {
  const bar = qs("#list-filters");
  const counts = new Map(FILTERS.map(([id, , match]) => [id, admin.posts.filter(match).length]));

  bar.innerHTML = FILTERS
    // Đừng bày ra ô lọc rỗng — trừ "Tất cả", luôn cần để quay về.
    .filter(([id]) => id === "all" || counts.get(id) > 0)
    .map(([id, label]) => `<button type="button" class="admin-filter${id === admin.filter ? " active" : ""}"
        data-filter="${attr(id)}" aria-pressed="${id === admin.filter}">
      ${escapeHtml(label)}<span class="admin-filter-count">${counts.get(id)}</span>
    </button>`).join("");
  bar.hidden = !admin.posts.length;
}

function renderPosts() {
  renderFilters();

  const query = qs("#list-search").value.trim().toLowerCase();
  const match = (FILTERS.find(([id]) => id === admin.filter) || FILTERS[0])[2];
  const posts = admin.posts
    .filter(match)
    .filter((p) => !query || `${p.title} ${p.path}`.toLowerCase().includes(query));

  const list = qs("#post-list");
  if (!posts.length) {
    list.innerHTML = admin.posts.length
      ? '<p class="admin-hint">Không có bài nào khớp bộ lọc hiện tại.</p>'
      : '<p class="admin-hint">Chưa có bài nào. Bấm “Soạn bài mới” để bắt đầu.</p>';
    return;
  }

  // admin.posts đã sắp theo đường dẫn nên bài cùng một mảng vẫn nằm liền nhau;
  // mảng của mỗi bài đọc được ngay trên dòng đường dẫn của nó.
  list.innerHTML = posts.map(postRow).join("");
}

function postRow(post) {
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
  const { sectionId, categoryId } = resolvePlacement();
  // Tiền tố và đuôi .md nằm ngay hai bên ô nhập, nên chỉ cần cập nhật tiền tố.
  qs("#path-prefix").textContent = `content/${sectionId || "…"}/${categoryId || "…"}/`;
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

  // order, phase và tags không còn ô nhập trên form. Bài cũ có sẵn các trường
  // này thì giữ nguyên giá trị, đừng để việc lưu lại làm mất chúng khỏi file.
  const carry = (key, value) => {
    if (value === undefined || value === null || value === "") return;
    if (Array.isArray(value) && !value.length) return;
    if (overwrite || admin.carried[key] === undefined) admin.carried[key] = value;
  };
  carry("order", data.order);
  carry("phase", data.phase);
  carry("tags", Array.isArray(data.tags)
    ? data.tags
    : String(data.tags || "").split(",").map((t) => t.trim()).filter(Boolean));

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
    markDirty();
    schedulePreview();
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

  const markdown = stringifyFrontmatter({
    title: qs("#field-title").value.trim(),
    description: qs("#field-description").value.trim(),
    order: admin.carried.order ?? "",
    phase: admin.carried.phase ?? "",
    tags: admin.carried.tags ?? [],
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
    clearDraft();
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
    admin.dirty = false;
    if (isSplit()) renderPreview();
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

/* ------------------------------------------------- xem thử trong trang đọc */

/**
 * Mở bài trong CHÍNH reader.html để thấy đúng thứ sẽ lên sóng — mục lục, cỡ
 * chữ, zen mode, mermaid đều là hàng thật.
 *
 * Bài chưa có trong catalog (và mảng cũng có thể chưa tồn tại), nên gói đủ dữ
 * liệu để reader tự dựng doc/section giả. Đi qua localStorage chứ không phải
 * sessionStorage: bản sao sessionStorage sang tab mới tuỳ trình duyệt, còn
 * localStorage thì tab mới đọc chắc chắn và F5 vẫn còn.
 */
function buildPreview() {
  const body = qs("#field-body").value.trim();
  if (!body) throw new Error("Chưa có nội dung để xem thử.");

  const { sectionId, categoryId, slug } = resolvePlacement();
  const isNewSection = qs("#field-section").value === NEW;
  const section = admin.sections.find((sec) => sec.id === sectionId);
  const category = section?.categories.find((c) => c.id === categoryId);

  const title = qs("#field-title").value.trim()
    || (body.match(/^#\s+(.+)$/m)?.[1] || "").trim()
    || slug
    || "Bài chưa đặt tên";

  return {
    savedAt: Date.now(),
    body,
    doc: {
      id: `${sectionId || "preview"}/${categoryId || "preview"}/${slug || "preview"}`,
      section: sectionId || "preview",
      category: categoryId || "preview",
      slug: slug || "preview",
      title,
      description: qs("#field-description").value.trim(),
      tags: admin.carried.tags ?? [],
      order: admin.carried.order ?? 999,
      phase: admin.carried.phase ?? "",
      updatedDate: new Date().toISOString().slice(0, 10),
    },
    section: {
      id: sectionId || "preview",
      // Mảng mới chưa có trên kho: lấy tên và màu từ form đang điền.
      name: isNewSection ? (qs("#new-section-name").value.trim() || sectionId) : (section?.name || sectionId || "Xem thử"),
      color: isNewSection ? qs("#new-section-color").value : (section?.meta?.color || "#4f46e5"),
    },
    categoryName: qs("#field-category").value === NEW
      ? (qs("#new-category-name").value.trim() || categoryId)
      : (category?.name || categoryId),
  };
}

function handlePreview() {
  showAlert(qs("#post-error"), "");
  let payload;
  try {
    payload = buildPreview();
  } catch (err) {
    return showAlert(qs("#post-error"), err.message);
  }

  try {
    localStorage.setItem(PREVIEW_KEY, JSON.stringify(payload));
  } catch {
    return showAlert(qs("#post-error"),
      "Không lưu được bản xem thử — bộ nhớ trình duyệt đã đầy. Thử xoá bớt dữ liệu trang rồi làm lại.");
  }

  const tab = window.open("reader.html?preview=1", "_blank", "noopener");
  if (!tab) showAlert(qs("#post-error"), "Trình duyệt chặn mở tab mới — cho phép pop-up cho trang này rồi thử lại.");
}

/* --------------------------------------------- xem trước & bộ dựng markdown */

/**
 * markdown.js chỉ cần khi thật sự xem trước, nên không nạp tĩnh trong <head>.
 * Nạp một lần, các lần sau dùng lại cùng promise.
 */
let markdownReady = null;
function loadMarkdownRenderer() {
  if (typeof renderMarkdown === "function") return Promise.resolve();
  if (markdownReady) return markdownReady;
  markdownReady = new Promise((resolve, reject) => {
    const el = document.createElement("script");
    el.src = "assets/js/markdown.js";
    el.onload = resolve;
    el.onerror = () => reject(new Error("Không nạp được assets/js/markdown.js"));
    document.head.appendChild(el);
  });
  return markdownReady;
}

let previewTimer = null;
async function renderPreview() {
  const target = qs("#body-preview");
  const text = qs("#field-body").value.trim();
  if (!text) {
    target.innerHTML = '<p class="admin-hint">Chưa có nội dung để xem trước.</p>';
    return;
  }
  try {
    await loadMarkdownRenderer();
    target.innerHTML = renderMarkdown(text);
  } catch (err) {
    target.innerHTML = `<p class="admin-hint">${escapeHtml(err.message)}</p>`;
  }
}

/** Gõ liên tục thì đừng dựng lại markdown mỗi phím. */
function schedulePreview() {
  if (!isSplit()) return;              // chế độ tab chỉ dựng khi bấm sang tab
  clearTimeout(previewTimer);
  previewTimer = setTimeout(renderPreview, 250);
}

const isSplit = () => window.matchMedia(SPLIT_QUERY).matches;

/**
 * Màn rộng: soạn và xem trước cạnh nhau, ẩn thanh tab.
 * Màn hẹp: giữ hai tab như cũ, mỗi lúc hiện một pane.
 */
function syncEditorPanes() {
  const split = isSplit();
  const panes = qs("#editor-panes");
  if (!panes) return;

  panes.classList.toggle("is-split", split);
  qs("#editor-tabs").hidden = split;

  if (split) {
    qsa("[data-pane]", panes).forEach((el) => { el.hidden = false; });
    renderPreview();
    return;
  }
  const active = qsa("[data-editor-tab]").find((b) => b.classList.contains("active"));
  showPane(active?.dataset.editorTab || "write");
}

function showPane(name) {
  qsa("[data-pane]", qs("#editor-panes")).forEach((el) => {
    el.hidden = el.dataset.pane !== name;
  });
  if (name === "preview") renderPreview();
}

/* ------------------------------------------------------------- bản nháp */

// Nháp chỉ áp dụng cho bài tạo mới. Bài đang sửa đọc thẳng từ nhánh Git nên
// khôi phục nửa vời sẽ nguy hiểm hơn là mất công gõ lại.
const DRAFT_FIELDS = [
  "#field-section", "#field-category", "#field-slug", "#field-title",
  "#field-description", "#field-body",
  "#new-section-id", "#new-section-name", "#new-section-tagline",
  "#new-section-color", "#new-section-kind",
  "#new-category-id", "#new-category-name",
];

const isFormEmpty = () =>
  !qs("#field-body").value.trim() && !qs("#field-title").value.trim() && !qs("#field-slug").value.trim();

let draftTimer = null;
function scheduleDraftSave() {
  clearTimeout(draftTimer);
  draftTimer = setTimeout(saveDraft, DRAFT_DEBOUNCE_MS);
}

function saveDraft() {
  if (admin.editing || isFormEmpty()) return;
  const values = {};
  DRAFT_FIELDS.forEach((id) => { values[id] = qs(id).value; });
  try {
    localStorage.setItem(DRAFT_KEY,
      JSON.stringify({ savedAt: Date.now(), values, carried: admin.carried }));
  } catch { /* hết chỗ thì thôi, không chặn việc soạn bài */ }
}

const clearDraft = () => { try { localStorage.removeItem(DRAFT_KEY); } catch { /* bỏ qua */ } };

function readDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    const draft = raw ? JSON.parse(raw) : null;
    return draft && draft.values ? draft : null;
  } catch { return null; }
}

/** Chào mời khôi phục, không tự áp — người dùng quyết. */
function offerDraft() {
  const draft = readDraft();
  const banner = qs("#draft-banner");
  if (!draft) return;

  const when = new Date(draft.savedAt);
  const hhmm = `${String(when.getHours()).padStart(2, "0")}:${String(when.getMinutes()).padStart(2, "0")}`;
  const sameDay = when.toDateString() === new Date().toDateString();
  const label = sameDay ? `lúc ${hhmm}` : `ngày ${when.toLocaleDateString("vi-VN")} ${hhmm}`;
  const title = draft.values["#field-title"] || draft.values["#field-slug"] || "bài chưa đặt tên";

  showAlert(banner,
    `Có bản nháp chưa gửi ${escapeHtml(label)} — <b>${escapeHtml(title)}</b>. ` +
    `<button type="button" class="admin-btn-link" data-draft="restore">Khôi phục</button>` +
    `<button type="button" class="admin-btn-link" data-draft="discard">Bỏ qua</button>`, true);
}

function applyDraft() {
  const draft = readDraft();
  if (!draft) return;
  admin.restoring = true;
  try {
    // Mảng và chuyên mục phải đặt trước rồi mới dựng lại dropdown con.
    DRAFT_FIELDS.forEach((id) => {
      const el = qs(id);
      if (el && draft.values[id] !== undefined) el.value = draft.values[id];
    });
    admin.carried = draft.carried || {};
    renderCategorySelect(draft.values["#field-category"]);
    qs("#field-category").value = draft.values["#field-category"] || "";
    qs("#new-section-form").hidden = qs("#field-section").value !== NEW;
    qs("#new-category-form").hidden = qs("#field-category").value !== NEW;
    if (qs("#field-slug").value) qs("#field-slug").dataset.touched = "1";
    updatePathPreview();
  } finally {
    admin.restoring = false;
  }
  admin.dirty = true;
  showAlert(qs("#draft-banner"), "");
  schedulePreview();
  showToast("Đã khôi phục bản nháp.");
}

function markDirty() {
  if (admin.restoring) return;
  admin.dirty = true;
  scheduleDraftSave();
}

/* ------------------------------------------------------------- form */

function resetForm() {
  ["#field-slug", "#field-title", "#field-description",
   "#field-body"].forEach((id) => { qs(id).value = ""; });
  admin.carried = {};
  ["#new-section-id", "#new-section-name", "#new-section-tagline",
   "#new-category-id", "#new-category-name"].forEach((id) => { qs(id).value = ""; });
  ["#field-slug", "#new-section-id", "#new-category-id"].forEach((id) => { qs(id).dataset.touched = ""; });

  admin.editing = null;
  admin.dirty = false;
  clearTimeout(draftTimer);
  qs("#body-preview").innerHTML = "";
  showAlert(qs("#draft-banner"), "");
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
    if (btn.dataset.view === "editor" && !admin.editing && isFormEmpty()) offerDraft();
  }));

  qs("#btn-preview").addEventListener("click", handlePreview);
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
    qsa("[data-editor-tab]").forEach((b) => b.classList.toggle("active", b === btn));
    showPane(btn.dataset.editorTab);
  }));

  // Đổi bề ngang màn hình thì đổi giữa hai cột và hai tab.
  window.matchMedia(SPLIT_QUERY).addEventListener("change", syncEditorPanes);

  // Bộ lọc trạng thái ở màn danh sách.
  delegate(qs("#list-filters"), "click", "[data-filter]", (_, btn) => {
    admin.filter = btn.dataset.filter;
    renderPosts();
  });

  // Nháp: mọi ô trong form đều đánh dấu bẩn và hẹn giờ lưu.
  qs("#post-form").addEventListener("input", markDirty);
  qs("#post-form").addEventListener("change", markDirty);
  qs("#field-body").addEventListener("input", schedulePreview);

  delegate(qs("#draft-banner"), "click", "[data-draft]", (_, btn) => {
    if (btn.dataset.draft === "restore") return applyDraft();
    clearDraft();
    showAlert(qs("#draft-banner"), "");
  });

  // Rời trang khi còn thay đổi chưa gửi — trình duyệt sẽ tự hỏi lại.
  window.addEventListener("beforeunload", (event) => {
    if (!admin.dirty || isFormEmpty()) return;
    saveDraft();
    event.preventDefault();
    event.returnValue = "";
  });

  document.addEventListener("keydown", (event) => {
    const mod = event.metaKey || event.ctrlKey;
    if (!mod) return;
    const key = event.key.toLowerCase();

    if (key === "s" && !qs("#admin-editor").hidden) {
      event.preventDefault();
      qs("#post-form").requestSubmit();
    }
    if (key === "k" && !qs("#admin-list").hidden) {
      event.preventDefault();
      qs("#list-search").focus();
      qs("#list-search").select();
    }
  });
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

  const showLogin = (message) => {
    qs("#admin-boot").hidden = true;
    qs("#admin-login").hidden = false;
    if (message) showAlert(qs("#login-error"), message);
  };

  if (!session?.token) return showLogin();

  // Có phiên cũ: kiểm token còn dùng được không rồi mới vào thẳng.
  try {
    const gh = new GitHubRepo(session);
    const user = await gh.verify();
    admin.gh = gh;
    enterApp(session.email, user.login);
  } catch (err) {
    clearSession();
    showLogin(`Phiên cũ không dùng được nữa — ${err.message}`);
  }
});
