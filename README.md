# Blog kỹ thuật

Blog chia sẻ kiến thức lập trình. Nội dung là markdown thuần trong `content/`,
giao diện là HTML/CSS/JS tĩnh — không framework, không bundler.

## Thêm một bài viết

1. Tạo file `.md` trong `content/<mảng>/<chuyên-mục>/<tên-bài>.md`
2. Chạy `npm run build`

Tên thư mục và tên file dùng chữ thường, số và dấu `-` (ví dụ `phase1-java-fundamentals.md`).

Frontmatter — mọi trường đều tuỳ chọn, thiếu thì build tự suy ra:

```yaml
---
title: "Phase 1: Nền tảng Java"       # thiếu → lấy heading # đầu tiên
description: "Kiểu dữ liệu, toán tử"  # thiếu → lấy đoạn văn đầu tiên
icon: "🧱"
phase: "Phase 1"                       # để lọc theo phase ở sidebar
difficulty: "Intermediate"
tags: [Java, OOP]
order: 2                               # thứ tự trong chuyên mục
---
```

Số dòng, dung lượng, ngày cập nhật và số câu quiz do build tự tính — không khai báo.

## Thêm một mảng nội dung mới (Python, JavaScript, System Design…)

```bash
mkdir -p content/python/co-ban
cat > content/python/_section.json <<'JSON'
{
  "name": "Python",
  "icon": "🐍",
  "color": "#3776ab",
  "kind": "language",
  "order": 2,
  "tagline": "Ghi chép về Python từ cơ bản tới nâng cao.",
  "categories": [
    { "id": "co-ban", "name": "Cơ bản", "icon": "🧱", "order": 1 }
  ]
}
JSON
npm run build
```

Thẻ Python xuất hiện ngay trên trang chủ. Không phải sửa dòng JavaScript nào.

- `kind: "language"` → thẻ nằm ở khu **Ngôn ngữ**; `"topic"` → khu **Chủ đề**.
- Thư mục con chưa khai báo trong `categories` vẫn hiện (lấy tên thư mục), build chỉ cảnh báo.
- Muốn có tab **Lộ trình**: thêm `phases` và `phaseDetails` vào `_section.json` — xem `content/java/_section.json`.

## Thêm quiz cho một bài

Đặt file `<tên-bài>.quiz.json` cạnh file `.md`:

```json
{
  "title": "Phase 1: Java Fundamentals",
  "quizzes": [
    {
      "number": 1,
      "question": "Nội dung câu hỏi, hỗ trợ ```java ... ``` và `mã inline`",
      "isMulti": false,
      "options": [{ "key": "A", "text": "..." }, { "key": "B", "text": "..." }],
      "correctAnswers": ["B"],
      "explanation": "Vì sao đáp án B đúng."
    }
  ]
}
```

Quiz hiện ở cuối bài viết và trong tab **Luyện quiz** của mảng đó.

## Chạy

```bash
npm run build   # sinh generated/ từ content/
npm test        # 19 test cho parser frontmatter và scanner
npm run serve   # http://localhost:8080
```

`generated/` được commit vào repo để mở thử ở máy (và để deploy tĩnh kiểu GitHub Pages)
không cần chạy build trước. Vercel tự build lại từ `content/` nên không bắt buộc, nhưng
nên chạy `npm run build` và commit lại `generated/` mỗi khi sửa nội dung cho khỏi lệch.

## Deploy lên Vercel

Repo đã có sẵn `vercel.json`, Vercel tự nhận cấu hình — không phải chỉnh gì trong dashboard.

**Cách 1 — nối GitHub (khuyến nghị):** vào [vercel.com/new](https://vercel.com/new),
chọn repo `blog-tech`, bấm Deploy. Từ đó mỗi lần `git push` là Vercel tự build lại.

**Cách 2 — deploy từ máy:**

```bash
npx vercel --prod
```

Vercel sẽ chạy `npm run dist` rồi phục vụ thư mục `dist/`.

### Quy trình viết bài hằng ngày

```bash
# viết content/java/core/bai-moi.md
npm run build     # cập nhật generated/ để xem thử ở máy
npm run serve     # http://localhost:8080
git add -A && git commit -m "them bai moi" && git push
```

Vercel tự build lại từ `content/`, bạn không cần commit `dist/` (đã nằm trong `.gitignore`).

### Kiểm tra bản deploy ngay tại máy

```bash
npm run dist        # đóng gói vào dist/ đúng như Vercel sẽ làm
npm run serve:dist  # http://localhost:8080
```

`dist/` chỉ chứa `index.html`, `hub.html`, `reader.html`, `404.html`, `assets/`, `generated/`
— khoảng 1,05 MB. Nguồn markdown trong `content/`, script trong `build/` và tài liệu
thiết kế trong `docs/` **không** lên production.

## Cấu trúc

```
content/                     nguồn duy nhất — chỉ sửa ở đây
  <mảng>/_section.json       tên, icon, màu, chuyên mục, lộ trình
  <mảng>/<chuyên-mục>/*.md   bài viết
  <mảng>/<chuyên-mục>/*.quiz.json
build/                       script sinh dữ liệu, đóng gói dist, test
generated/                   sản phẩm build (đừng sửa tay)
  catalog.js                 metadata mọi bài (~16 KB, mọi trang đều nạp)
  docs/<id>.js               nội dung một bài (reader chỉ nạp bài đang mở)
  quiz-<mảng>.js             ngân hàng câu hỏi của một mảng
assets/css/base.css          bảng màu, navbar, thẻ bài, quiz, markdown
assets/css/blog.css          trang chủ, breadcrumb, điều hướng bài
assets/js/                   dom · state · catalog · markdown · quiz · landing · hub · reader
404.html                     trang không tìm thấy (Vercel dùng tự động)
index.html                   trang chủ — chọn mảng nội dung
hub.html?s=<mảng>            danh mục bài viết của một mảng
reader.html?s=<mảng>&d=<chuyên-mục>/<bài>   trang đọc
```

Tiến độ đọc, bài đánh dấu và bài quiz đang làm lưu ở `localStorage` của trình duyệt.

### Về việc mở bằng `file://`

Nội dung nạp bằng thẻ `<script>` chèn động (không dùng `fetch`), nên về nguyên
tắc mở thẳng `index.html` bằng `file://` vẫn chạy. Điều này **chưa được kiểm
chứng** trên máy này vì không có Chrome/Chromium để chạy thử — cách chắc chắn
là `npm run serve`.
