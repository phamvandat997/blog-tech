"use strict";
// Trang đọc một bài. Nội dung nạp bằng thẻ <script> chèn động — đúng bài đang
// mở, không phải cả kho — và cách này vẫn chạy khi mở bằng file:// (nơi fetch
// bị chặn).

let pendingContent = null;

window.__docLoaded = function (docId, body) {
  if (pendingContent && pendingContent.docId === docId) pendingContent.resolve(body);
};

function loadDocContent(doc) {
  return new Promise((resolve) => {
    pendingContent = { docId: doc.id, resolve };
    const script = document.createElement("script");
    script.src = `generated/docs/${encodeURIComponent(doc.contentFile)}.js`;
    script.onerror = () => resolve(null);
    document.head.appendChild(script);
  });
}

/** Tìm các bài viết liên quan dựa theo cùng mảng, chuyên mục, phase và tag tương đồng. */
function getRelatedDocs(currentDoc, limit = 3) {
  const currentTags = new Set(currentDoc.tags || []);
  const candidates = ALL_DOCUMENTS.filter((d) => d.id !== currentDoc.id);

  const scored = candidates.map((d) => {
    let score = 0;
    if (d.section === currentDoc.section) score += 10;
    if (d.category === currentDoc.category) score += 15;
    if (d.phase && currentDoc.phase && d.phase === currentDoc.phase) score += 5;
    if (d.tags && currentTags.size > 0) {
      for (const t of d.tags) {
        if (currentTags.has(t)) score += 4;
      }
    }
    return { doc: d, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.doc);
}

function renderRelatedSection(doc) {
  const sidebar = qs("#reader-related-sidebar");
  const list = qs("#reader-related-list");
  if (!sidebar || !list) return;

  const related = getRelatedDocs(doc, 4);
  if (related.length === 0) {
    sidebar.hidden = true;
    return;
  }

  sidebar.hidden = false;
  list.innerHTML = related.map((d) => {
    const isCompleted = isDocCompleted(d.id);
    const phaseBadge = d.phase ? `<span class="related-card-phase">${escapeHtml(d.phase.toUpperCase())}</span>` : "";
    const readingTime = d.readingMinutes ? `<span class="related-card-time">⏱️ ~${d.readingMinutes}p</span>` : "";
    const completedMark = isCompleted ? `<span class="related-card-completed">✓ Đã học</span>` : "";

    return `
      <a class="related-card ${isCompleted ? "is-completed" : ""}" href="${attr(readerUrl(d))}">
        <div class="related-card-meta">
          ${phaseBadge}
          <div style="display:flex;align-items:center;gap:0.4rem;">
            ${completedMark}
            ${readingTime}
          </div>
        </div>
        <h4 class="related-card-title">${escapeHtml(d.title)}</h4>
        <p class="related-card-desc">${escapeHtml(d.description)}</p>
      </a>
    `;
  }).join("");
}

/**
 * Đo chiều cao navbar vào biến --navbar-h. Mục lục dính ngay dưới nó và
 * heading chừa chỗ cho nó, nên con số này không được đoán bừa: cỡ chữ, thu
 * phóng hay dòng tiêu đề dài đều làm navbar cao thấp khác nhau.
 */
function trackNavbarHeight() {
  const navbar = qs(".navbar");
  if (!navbar) return;
  const apply = () => document.documentElement.style.setProperty(
    "--navbar-h", `${Math.round(navbar.getBoundingClientRect().height)}px`);
  apply();
  if (typeof ResizeObserver !== "undefined") new ResizeObserver(apply).observe(navbar);
  else window.addEventListener("resize", apply);
}

/* ---------------------------------------------------------------- mục lục */

/**
 * Mục lục dựng từ CHÍNH DOM đã render, không phải từ markdown thô.
 *
 * Dựng từ markdown thô thì lệch: dòng bắt đầu bằng "##" nằm trong khối mã vẫn
 * bị đếm thành mục (link chết), còn heading rỗng lại bị bỏ sót. Đọc từ DOM thì
 * mục lục và nội dung khớp 1-1 theo định nghĩa.
 *
 * Tiện thể khử trùng id: hai heading cùng tiêu đề sinh cùng slug, để nguyên thì
 * mọi link đều nhảy về heading đầu tiên.
 */
function collectHeadings() {
  const seen = new Map();
  return qsa("#reader-body h2, #reader-body h3").map((el) => {
    const base = el.id || "heading-muc";
    const n = (seen.get(base) || 0) + 1;
    seen.set(base, n);
    el.id = n === 1 ? base : `${base}-${n}`;
    return { el, id: el.id, level: el.tagName === "H2" ? 2 : 3, title: el.textContent.trim() };
  });
}

/**
 * Mục lục ở cột trái. Desktop hiện sẵn; tablet/mobile ẩn, mở bằng nút ☰.
 * Cuộn tới đâu tô sáng tới đó.
 */
function setupToc() {
  const aside = qs("#reader-toc");
  const toggle = qs("#btn-toc-toggle");
  const backdrop = qs("#toc-backdrop");
  const headings = collectHeadings();

  // Bài ngắn không cần mục lục — ẩn luôn cả nút ☰.
  if (headings.length <= 3) {
    aside.hidden = true;
    toggle.hidden = true;
    document.body.classList.add("no-toc");
    return;
  }

  qs("#toc-nav").innerHTML = `<ul class="toc-list">${headings.map((h) =>
    `<li class="toc-item-h${h.level}">` +
    `<a class="toc-link" href="#${attr(h.id)}" data-toc-for="${attr(h.id)}">${escapeHtml(h.title)}</a></li>`
  ).join("")}</ul>`;
  qs("#toc-title").textContent = `Mục lục · ${headings.length} phần`;
  aside.hidden = false;
  toggle.hidden = false;

  const setOpen = (open) => {
    aside.classList.toggle("is-open", open);
    backdrop.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
    // Khoá cuộn nền khi ngăn kéo đang mở, nếu không nền trôi sau lưng.
    document.body.classList.toggle("toc-open", open);
  };

  toggle.addEventListener("click", () => setOpen(!aside.classList.contains("is-open")));
  qs("#btn-toc-close").addEventListener("click", () => setOpen(false));
  backdrop.addEventListener("click", () => setOpen(false));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });

  // Bấm một mục thì đóng ngăn kéo, nếu không nó che mất chỗ vừa nhảy tới.
  delegate(qs("#toc-nav"), "click", ".toc-link", () => {
    if (window.matchMedia("(max-width: 1100px)").matches) setOpen(false);
  });

  setupScrollSpy(headings);
}

/**
 * Tô sáng mục ứng với phần đang đọc.
 *
 * Vị trí các heading được đo MỘT LẦN rồi đo lại khi bố cục đổi, thay vì gọi
 * getBoundingClientRect trong mỗi khung hình cuộn — bài dài có tới 51 heading.
 */
function setupScrollSpy(headings) {
  const links = new Map(qsa("#toc-nav .toc-link").map((a) => [a.dataset.tocFor, a]));
  if (!headings.length) return;

  const OFFSET = 120; // chừa chỗ cho navbar dính
  let tops = [];
  const measure = () => {
    tops = headings.map((h) => h.el.getBoundingClientRect().top + window.scrollY);
  };

  let current = null;
  const highlight = (id) => {
    if (id === current) return;
    if (current) links.get(current)?.classList.remove("is-current");
    current = id;
    const link = links.get(id);
    if (!link) return;
    link.classList.add("is-current");
    // Mục lục dài thì kéo mục đang sáng vào tầm nhìn.
    const nav = qs("#toc-nav");
    const target = link.offsetTop - nav.clientHeight / 2;
    if (Math.abs(nav.scrollTop - target) > nav.clientHeight / 3) {
      nav.scrollTo({ top: Math.max(0, target), behavior: "smooth" });
    }
  };

  /** @returns {string} id của heading đang đọc */
  function activeId(scrollY = window.scrollY) {
    // Chạm đáy trang thì phần cuối mới là phần đang đọc, dù chưa qua mốc.
    if (scrollY + window.innerHeight >= document.documentElement.scrollHeight - 8) {
      return headings[headings.length - 1].id;
    }
    let index = 0;
    for (let i = 0; i < tops.length; i++) {
      if (tops[i] <= scrollY + OFFSET) index = i; else break;
    }
    return headings[index].id;
  }

  let queued = false;
  const onScroll = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; highlight(activeId()); });
  };

  measure();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => { measure(); highlight(activeId()); });
  highlight(activeId());

  // Cho phép kiểm chứng thuật toán mà không cần cuộn thật.
  window.__scrollSpy = { activeId, measure, tops: () => tops };
}

function setupReadingProgress() {
  const bar = qs("#reading-progress");
  if (!bar) return;
  const onScroll = () => {
    const scrollY = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (maxScroll <= 0) {
      bar.style.width = "0%";
      return;
    }
    const pct = Math.min(100, Math.max(0, (scrollY / maxScroll) * 100));
    bar.style.width = `${pct}%`;
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

function setupCompletionWidget(doc) {
  const box = qs("#reader-complete-box");
  const btn = qs("#btn-toggle-complete");
  if (!box || !btn) return;
  box.hidden = false;

  const updateButton = (completed) => {
    btn.classList.toggle("is-completed", completed);
    btn.querySelector(".complete-btn-label").textContent = completed
      ? "✓ Đã hoàn thành (nhấn để huỷ)"
      : "Đánh dấu đã học";
  };

  updateButton(isDocCompleted(doc.id));

  btn.addEventListener("click", () => {
    const isNow = toggleDocCompleted(doc.id);
    updateButton(isNow);
    showToast(isNow ? "🎉 Đã lưu vào tiến độ ôn tập!" : "Đã huỷ đánh dấu bài học.");
  });
}

function showError(title, text, action) {
  document.body.classList.add("no-toc");
  qs("#reader-root").innerHTML = emptyState("🔍", title, text, action);
}

document.addEventListener("DOMContentLoaded", async () => {
  initTheme();
  initBackToTop();
  trackNavbarHeight();

  const params = readParams();
  const home = '<a class="btn-primary-link" href="index.html">⬅ Về trang chủ</a>';

  if (!params.section) {
    return showError("Không tìm thấy mảng nội dung", "Đường dẫn thiếu hoặc sai tham số ?s=", home);
  }
  if (!params.doc) {
    return showError("Không tìm thấy bài viết",
      "Đường dẫn thiếu hoặc sai tham số ?d=",
      `<a class="btn-primary-link" href="${attr(hubUrl(params.section.id))}">⬅ Về ${escapeHtml(params.section.name)}</a>`);
  }

  const doc = params.doc;
  const section = params.section;
  const category = section.categories.find((c) => c.id === doc.category);

  document.title = `${doc.title} | ${section.name}`;
  document.documentElement.style.setProperty("--section-color", section.color);
  qs("#reader-title").textContent = doc.title;
  qs("#reader-breadcrumb").innerHTML =
    `<a href="index.html">Trang chủ</a> <span>›</span>
     <a href="${attr(hubUrl(section.id))}">${escapeHtml(section.name)}</a>
     <span>›</span>
     <a href="${attr(hubUrl(section.id, { c: doc.category }))}">${escapeHtml(category?.name || doc.category)}</a>`;
  qs("#reader-back").href = hubUrl(section.id, { c: doc.category });

  const body = await loadDocContent(doc);

  if (body === null) {
    document.body.classList.add("no-toc");
    qs("#reader-body").innerHTML = emptyState("⚙️", "Chưa có dữ liệu đã build cho bài này",
      "Chạy lệnh sau ở thư mục gốc rồi tải lại trang: node build/build.js");
    return;
  }

  const readingMinutes = doc.readingMinutes || Math.max(1, Math.round(body.trim().split(/\s+/).length / 200));
  qs("#reader-date").innerHTML = `📅 Cập nhật ${doc.updatedDate} &nbsp;·&nbsp; ⏱️ ~${readingMinutes} phút đọc`;

  // Bỏ heading H1 đầu bài nếu có vì đã hiển thị ở phần header #reader-title
  const cleanBody = body.replace(/^\s*#[^\n]*\r?\n?/, "");

  qs("#reader-body").innerHTML = renderMarkdown(cleanBody);
  renderRelatedSection(doc);
  setupToc();
  setupReadingProgress();
  setupCompletionWidget(doc);
});
