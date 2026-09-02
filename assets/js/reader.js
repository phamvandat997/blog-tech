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

/** Bài trước / bài sau trong cùng mảng, theo đúng thứ tự catalog. */
function renderNeighbours(doc) {
  const siblings = docsOfSection(doc.section);
  const index = siblings.findIndex((d) => d.id === doc.id);
  const link = (target, label, side) => target
    ? `<a class="reader-nav-link is-${side}" href="${attr(readerUrl(target))}">
         <span class="reader-nav-label">${label}</span>
         <span class="reader-nav-title">${escapeHtml(target.title)}</span>
       </a>`
    : '<span class="reader-nav-link is-empty"></span>';
  return link(siblings[index - 1], "⬅ Bài trước", "prev") + link(siblings[index + 1], "Bài sau ➔", "next");
}

function showError(title, text, action) {
  qs("#reader-root").innerHTML = emptyState("🔍", title, text, action);
}

document.addEventListener("DOMContentLoaded", async () => {
  initTheme();
  initBackToTop();

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
  qs("#reader-date").textContent = `Cập nhật ${doc.updatedDate}`;
  qs("#reader-breadcrumb").innerHTML =
    `<a href="index.html">Trang chủ</a> <span>›</span>
     <a href="${attr(hubUrl(section.id))}">${escapeHtml(section.name)}</a>
     <span>›</span>
     <a href="${attr(hubUrl(section.id, { c: doc.category }))}">${escapeHtml(category?.name || doc.category)}</a>`;
  qs("#reader-back").href = hubUrl(section.id, { c: doc.category });

  const [body] = await Promise.all([loadDocContent(doc), loadQuizBank(section.id)]);

  if (body === null) {
    qs("#reader-body").innerHTML = emptyState("⚙️", "Chưa có dữ liệu đã build cho bài này",
      "Chạy lệnh sau ở thư mục gốc rồi tải lại trang: node build/build.js");
    return;
  }

  qs("#reader-body").innerHTML = renderMarkdown(body);
  qs("#reader-quiz").innerHTML = renderDocQuizSection(doc.id);
  qs("#reader-neighbours").innerHTML = renderNeighbours(doc);

  bindQuiz(qs("#reader-quiz"), () => {
    qs("#reader-quiz").innerHTML = renderDocQuizSection(doc.id);
  });
});
