# Thiết kế: Blog kỹ thuật đa ngôn ngữ

Ngày: 2026-09-02

## Mục tiêu

Chuyển hub "OCP Java 25 & DSA" từ một trang đơn, dữ liệu viết tay, sang một
blog kỹ thuật nhiều mảng nội dung (Java hôm nay; Python, JavaScript, System
Design về sau). Tiêu chí thành công: **thêm một mảng nội dung mới chỉ cần tạo
thư mục và chạy `node build.js` — không sửa một dòng JavaScript nào.**

## Vấn đề với bản hiện tại

| # | Vấn đề | Vị trí |
|---|---|---|
| 1 | ~150 dòng code chết: drawer không bao giờ mở, `openDocDrawer` chỉ `window.open` | `index.html`, `app.js:200-227`, `app.js:1170`, `app.js:1176-1198` |
| 2 | `viewer.html` mở trần báo lỗi: mặc định `docId = 'master_bible'` không khớp id nào | `viewer.html:197` |
| 3 | Số liệu hardcode (`19`, `210+`, `~7,336`, `0 / 19`) | `index.html` |
| 4 | Không mở rộng được: `if (state.activeCategory === "java_group")` | `app.js:432` |
| 5 | `lines`/`size`/`description` viết tay, đã lệch (`summary.md` ghi 18, `data.js` ghi 19) | `data.js` |
| 6 | Nội suy HTML thô vào template và vào `onclick="...('${doc.id}')"` | `app.js:495,532,540,555` |
| 7 | Mọi trang nạp 864 KB `doc_contents.js`, kể cả landing | `index.html`, `viewer.html` |
| 8 | `app.js` 1406 dòng gộp state, filter, render, quiz engine, markdown parser | `app.js` |

## Kiến trúc

### Nguồn nội dung

```
content/<section>/<category>/<slug>.md
content/<section>/<category>/<slug>.quiz.json   (tuỳ chọn)
content/<section>/_section.json
```

`<section>` cấp 1 = một thẻ trên landing. `<category>` cấp 2 = một mục trong
sidebar của hub. `id` của bài = `<section>/<category>/<slug>`.

`_section.json`:

```json
{
  "name": "Java",
  "icon": "☕",
  "color": "#f89820",
  "kind": "language",
  "order": 1,
  "tagline": "...",
  "categories": [ { "id": "core", "name": "Java Core & OOP", "icon": "🧱", "order": 1 } ],
  "phases": ["Phase 1", "..."],
  "phaseDetails": [ ... ]
}
```

`kind` chỉ nhận `"language"` hoặc `"topic"`; landing chia hai khu theo trường này.
`categories` liệt kê tên hiển thị; thư mục có mặt trên đĩa nhưng thiếu khai báo
vẫn hiện, dùng chính tên thư mục.

### Frontmatter mỗi bài

Khai báo: `title`, `description`, `icon`, `phase`, `difficulty`, `tags`, `order`.
Suy ra từ build: `id`, `section`, `category`, `fileName`, `lines`, `size`,
`updatedDate` (mtime), `questions` (đếm từ file `.quiz.json` cạnh bên).

### Sản phẩm build

| File | Nội dung | Trang nào tải |
|---|---|---|
| `generated/catalog.js` | `SECTIONS` + `DOCUMENTS` (metadata mọi bài) | cả ba |
| `generated/docs/<section>__<category>__<slug>.js` | markdown một bài | reader, nạp động |
| `generated/quiz-<section>.js` | quiz cả section | hub tab Quiz, reader |

Reader nạp nội dung qua `<script src>` chèn động — chạy được trên `file://`,
nơi `fetch()` bị chặn. Tên file phẳng hoá bằng `__` để tránh phải tạo cây thư
mục lồng trong `generated/`, và để id được kiểm chứng bằng một regex duy nhất
trước khi ghép vào `src`.

### Ba trang

- `index.html` — landing. Hai khu Ngôn ngữ / Chủ đề. Thẻ có icon, số bài, tiến
  độ đã đọc. Ô tìm kiếm toàn cục điều hướng sang `hub.html?s=...&q=...`.
- `hub.html?s=<section>` — sidebar chuyên mục, phase pills, lọc trạng thái,
  grid/list, ba tab Docs / Phases / Quiz. Tab Phases ẩn nếu section không khai
  báo `phaseDetails`.
- `reader.html?s=<section>&d=<category>/<slug>` — trang đọc + quiz cuối bài.

### Module JavaScript

`assets/js/` — script thường, không bundler:

| Module | Trách nhiệm | Phụ thuộc |
|---|---|---|
| `catalog.js` | Truy vấn `SECTIONS`/`DOCUMENTS`: lọc, sắp xếp, đếm | generated |
| `state.js` | Ưa thích, đã đọc, theme, view mode; localStorage | — |
| `dom.js` | `escapeHtml`, `el`, delegation, toast | — |
| `markdown.js` | Parser markdown → HTML, TOC, code copy | dom |
| `quiz.js` | Quiz engine (chấm, điểm, reset) | state, dom |
| `landing.js` | Render landing | catalog, state, dom |
| `hub.js` | Render hub | catalog, state, dom, quiz |
| `reader.js` | Render reader | catalog, state, dom, markdown, quiz |

### Xử lý lỗi

- Section/bài không tồn tại → trang trạng thái rỗng có nút quay lại, không throw.
- Script nội dung nạp hỏng (`onerror`) → thông báo "chưa build" kèm lệnh cần chạy.
- Build gặp `.md` thiếu `title` → cảnh báo và dùng heading `#` đầu tiên; thiếu cả
  hai thì lấy tên file.
- Build gặp `.quiz.json` sai cú pháp → in lỗi kèm đường dẫn và thoát mã 1.

### Kiểm chứng

- `node --test build/` cho parser frontmatter, scanner thư mục, sinh slug/id.
- Mở cả ba trang trong browser, xác nhận console sạch và số liệu khớp catalog.

## Di trú

Một script chạy một lần: đọc `data.js` + `quizzes_data.js` cũ, `git mv` từng
`.md` vào `content/`, chèn frontmatter từ metadata cũ, tách quiz thành
`.quiz.json` cạnh bài. Ánh xạ chuyên mục:

| category cũ | đường dẫn mới |
|---|---|
| `roadmap_all` | `java/roadmap/` |
| `java_core` | `java/core/` |
| `java_apis` | `java/collections-streams/` |
| `java_concurrency` | `java/concurrency/` |
| `java_new` | `java/new-features/` |
| `java_master` | `java/master/` |
| `dsa_all` | `dsa/roadmap/`, `dsa/master/`, `dsa/foundations/` (tách tay, 3 bài) |

Sau di trú, `data.js`, `doc_contents.js`, `quizzes_data.js`, `app.js`,
`viewer.html` bị xoá. Commit gốc `78cf495` giữ nguyên trạng để quay lại.

## Ngoài phạm vi

Không làm ở vòng này: RSS, phân trang, tìm kiếm toàn văn nội dung bài, bình
luận, CI/CD, đa ngôn ngữ giao diện.
