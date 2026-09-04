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
description: "Kiểu dữ liệu, toán tử"  # thiếu → lấy đoạn văn xuôi đầu tiên
order: 2                               # thứ tự trong chuyên mục
phase: "Phase 1"                       # hiện thành chip lọc và badge ở trang mảng
tags: [Java, OOP]                      # không hiện ra, chỉ giúp tìm kiếm
---
```

Ngày cập nhật do build tự tính. `description` tự sinh thường
đủ dùng; bài nào mở đầu bằng bảng, sơ đồ hay callout thì nên viết tay một câu.

## Thêm một mảng nội dung mới (Python, JavaScript, System Design…)

```bash
mkdir -p content/python/co-ban
cat > content/python/_section.json <<'JSON'
{
  "name": "Python",
  "color": "#3776ab",
  "kind": "language",
  "order": 2,
  "tagline": "Ghi chép về Python từ cơ bản tới nâng cao.",
  "categories": [
    { "id": "co-ban", "name": "Cơ bản", "order": 1 }
  ]
}
JSON
npm run build
```

Thẻ Python xuất hiện ngay trên trang chủ. Không phải sửa dòng JavaScript nào.

- `kind: "language"` → thẻ nằm ở khu **Ngôn ngữ**; `"topic"` → khu **Chủ đề**.
- Thư mục con chưa khai báo trong `categories` vẫn hiện (lấy tên thư mục), build chỉ cảnh báo.

## Quiz — đang tạm gỡ

Tính năng quiz đã được gỡ khỏi giao diện (cả trang đọc lẫn trang admin) để làm sau.
Build cố tình bỏ qua file `.quiz.json`; đổi tên hay xoá bài qua trang admin vẫn mang
theo hoặc dọn file quiz đi kèm, nên không sinh file mồ côi.

> Đã có lần toàn bộ `content/` bị xoá bằng một loạt commit `Delete content/…`.
> Nếu cần khôi phục lại, commit ngay TRƯỚC đợt xoá đó là `6dcc6cb` — 22 bài `.md`
> và 7 file quiz, đủ ba mảng:
>
> ```bash
> git checkout 6dcc6cb -- content/
> npm run build
> ```
>
> Đừng dùng `7aa62e4`: chính nó là commit xoá `content/javascript`, nên khôi phục
> từ đó sẽ thiếu mảng Javascript.

## Trang /admin — quản lý bài viết

Mở `https://<tên-miền>/admin` (ở máy: `npm run dev` rồi vào `localhost:3000/admin`).

Trang này có hai màn hình: **Danh sách** (xem, sửa, xoá bài) và **Soạn bài mới**.

### Mọi thay đổi đều đi qua pull request

Tạo, sửa hay xoá — trang admin đều làm cùng một việc:

1. Tạo nhánh mới từ nhánh chính, tên dạng `post/<hành-động>-<slug>-<thời-điểm>`
2. Commit toàn bộ thay đổi vào nhánh đó (một commit duy nhất)
3. Mở pull request vào nhánh chính

Bài **chỉ lên sóng khi bạn merge PR** — lúc đó Vercel mới build lại từ `content/`.
Nếu commit hoặc mở PR hỏng giữa chừng, nhánh vừa tạo được xoá đi, không để lại rác.

### Trạng thái bài không lưu ở đâu cả

Nó suy ra từ Git, nên không thể lệch với thực tế:

| Trạng thái | Nghĩa là |
|---|---|
| **Đang đăng** | File có trên nhánh chính, không PR nào đang đụng tới |
| **Chờ duyệt bài mới** | File chưa có trên nhánh chính, đang nằm trong một PR mở |
| **Chờ duyệt thay đổi** | File có trên nhánh chính và một PR mở đang sửa nó |
| **Chờ duyệt xoá** | Một PR mở đang xoá file này (nút Xoá tự ẩn để khỏi mở PR trùng) |

Merge PR → lần tải danh sách sau, bài chuyển sang **Đang đăng**. Không có nút nào phải bấm.

### Sửa và xoá

- **Sửa**: nạp nội dung bài vào form. Bài đang chờ duyệt thì đọc từ chính
  nhánh PR của nó. Đổi tên file hoặc chuyển chuyên mục cũng được — đường dẫn cũ được
  xoá trong cùng commit nên không sinh ra bài trùng.
- **Xoá**: mở PR xoá file `.md` và file `.quiz.json` đi kèm (nếu có).

### Lần đầu: tạo token

1. Vào [Settings → Developer settings → Fine-grained tokens](https://github.com/settings/personal-access-tokens/new)
2. **Repository access** → Only select repositories → chọn `blog-tech`
3. **Repository permissions**, bật **hai** quyền:
   - **Contents** → `Read and write`
   - **Pull requests** → `Read and write`
4. Tạo token, copy, dán vào ô ở trang `/admin`

Token lưu trong `localStorage` của chính trình duyệt đó và chỉ được gửi tới
`api.github.com`. Thu hồi bất cứ lúc nào ở trang Settings của GitHub.

### Nên bật xoá nhánh tự động

Mỗi PR để lại một nhánh `post/…`. Vào **Settings → General → Pull Requests** của kho
và bật **Automatically delete head branches** để GitHub tự dọn sau khi merge.

### Đăng nhập báo lỗi thì làm gì

Thông báo lỗi luôn kèm **nguyên văn câu GitHub trả về** và **bước bị hỏng**. Đọc câu đó trước.

Kiểm nhanh token bằng một lệnh (dùng `read -s` nên token không vào lịch sử shell):

```bash
read -rs "TOKEN?Dan token roi Enter: " && curl -s -w '\nHTTP %{http_code}\n' -H "Authorization: Bearer $TOKEN" https://api.github.com/repos/phamvandat997/blog-tech | grep -E '"(message|full_name)"|"push"|HTTP'
```

| Kết quả | Nghĩa là |
|---|---|
| `HTTP 200` và `"push": true` | Token đúng, đăng bài được |
| `HTTP 200` nhưng `"push": false` | Token chỉ đọc — đặt **Contents: Read and write** |
| `HTTP 404` | Token chưa được cấp quyền vào kho này — sửa mục **Repository access** (GitHub cố tình trả 404 thay vì 403 để không lộ kho riêng tư) |
| `HTTP 401` | Token sai hoặc hết hạn |
| `HTTP 403` | Đọc câu `message` — thường là thiếu quyền hoặc token classic thiếu scope `repo` |

Lỗi lúc mở PR mà báo thiếu quyền thì gần như chắc là quên bật **Pull requests: Read and write**.

### Mô hình bảo mật — đọc kỹ chỗ này

Ô email chỉ đối chiếu với `ALLOWED_EMAILS` viết cứng ở đầu
[src/pages/AdminPage.jsx](src/pages/AdminPage.jsx).
**Đó không phải bảo mật** — mã chạy ở trình duyệt nên ai xem mã nguồn cũng đọc
được và bỏ qua được. Nó chỉ để tránh nhầm lẫn.

Thứ thật sự chặn người lạ là **GitHub**: mọi thao tác ghi đều đi qua GitHub API
bằng token của người dùng. Không có token đủ quyền đẩy vào kho thì commit bị từ
chối, kể cả khi đã vào được màn hình soạn bài. Trang admin cũng kiểm tra
`permissions.push` trước khi cho vào.

Hệ quả cần biết: **ai cầm token của bạn thì ghi được vào kho.** Đừng đăng nhập
trên máy lạ; nếu lỡ thì bấm Đăng xuất và thu hồi token trên GitHub.

### Nhờ người khác review — GitHub tự gửi email

Điền tên đăng nhập GitHub vào `REVIEWERS` ở đầu
[src/pages/AdminPage.jsx](src/pages/AdminPage.jsx):

```js
const REVIEWERS = ["ten-dang-nhap-github"];
```

Mỗi PR do trang admin mở (thêm, sửa, xoá bài và cả đăng quiz) sẽ được gán cho họ,
và **chính GitHub gửi email** "X requested your review" — không cần máy chủ gửi
thư nào.

- Người được gán phải có quyền truy cập kho.
- Ai trùng với người đang đăng nhập sẽ tự bị bỏ qua, vì GitHub không cho tự
  review PR của mình (trả lỗi 422).
- Gán review hỏng thì **PR vẫn được mở** — chỉ hiện thông báo, không huỷ bài.
- Để rỗng thì không gán ai.

Muốn đọc thử bài đã render trước khi duyệt thì bật **Preview Deployments** cho
pull request trong dashboard Vercel: mỗi PR sẽ có một URL riêng và Vercel tự
bình luận link vào PR. Người review đọc bài thật thay vì đọc diff markdown.

### Đổi danh sách email được phép

Sửa `ALLOWED_EMAILS` ở đầu [src/pages/AdminPage.jsx](src/pages/AdminPage.jsx)
(viết thường; để mảng rỗng thì không chặn ai), rồi build và push.

## SEO — sitemap.xml và robots.txt

Build sinh cả hai vào `public/`, Vite chép nguyên thư mục này lên gốc `dist/`.

Sitemap cần URL tuyệt đối nên phải biết tên miền:

- **Trên Vercel**: tự có, không cần làm gì — build đọc `VERCEL_PROJECT_PRODUCTION_URL`
  (biến này trỏ đúng tên miền riêng nếu bạn đã gắn).
- **Nơi khác / máy cá nhân**: đặt `SITE_URL`, ví dụ

  ```bash
  SITE_URL=blog.example.com npm run build
  ```

Không biết tên miền thì build **bỏ qua sitemap** kèm ghi chú, chứ không sinh URL sai.
`robots.txt` vẫn được tạo (chặn `/admin`), chỉ thiếu dòng `Sitemap:`.

Mô tả trang: `index/hub/reader/404` có sẵn `<meta name="description">` và thẻ Open
Graph; trang mảng và trang đọc ghi đè chúng theo đúng mảng / bài đang mở. Trang
xem thử tự gắn `noindex`.

## Deploy lên Vercel

Repo đã có sẵn `vercel.json`, Vercel tự nhận cấu hình — không phải chỉnh gì trong dashboard.

**Cách 1 — nối GitHub (khuyến nghị):** vào [vercel.com/new](https://vercel.com/new),
chọn repo `blog-tech`, bấm Deploy. Từ đó mỗi lần `git push` là Vercel tự build lại.

**Cách 2 — deploy từ máy:**

```bash
npx vercel --prod
```

Vercel sẽ chạy `npm run build` rồi phục vụ thư mục `dist/`.

### Quy trình viết bài hằng ngày

```bash
# viết content/java/core/bai-moi.md
npm run dev       # build lại dữ liệu rồi mở Vite ở http://localhost:3000
git add -A && git commit -m "them bai moi" && git push
```

Vercel tự build lại từ `content/`. `dist/`, `src/generated/` và `public/generated/`
đều nằm trong `.gitignore` — chỉ commit nguồn, không commit sản phẩm build.

### Kiểm tra bản deploy ngay tại máy

```bash
npm run build     # đóng gói vào dist/ đúng như Vercel sẽ làm
npm run preview   # phục vụ dist/ qua Vite
```

`dist/` là một SPA: `index.html` cùng bundle trong `assets/`, dữ liệu tĩnh trong
`generated/`, cộng `robots.txt` và `sitemap.xml` ở gốc. Mọi đường dẫn khác được
`vercel.json` rewrite về `index.html` để React Router tự định tuyến.
Nguồn markdown trong `content/`, script trong `build/` và tài liệu thiết kế trong
`docs/` **không** lên production.

## Cấu trúc

```
content/                     nguồn duy nhất — chỉ sửa ở đây
  <mảng>/_section.json       tên, icon, màu, chuyên mục, lộ trình
  <mảng>/<chuyên-mục>/*.md   bài viết
  <mảng>/<chuyên-mục>/*.quiz.json   (giữ nguyên, build đang bỏ qua)
build/                       script sinh dữ liệu và test
  lib/scan.js                quét content/ thành sections + docs
  lib/seo.js                 dựng sitemap.xml và robots.txt
src/                         ứng dụng React (Vite)
  pages/                     Home · Hub · Reader · Quiz · Admin · NotFound
  components/                layout · home · hub · reader · quiz · admin · common
  hooks/                     useCatalog · useQuiz · useTheme · useDocProgress
  services/                  github · markdown · storage
  generated/                 sản phẩm build — KHÔNG commit (xem .gitignore)
    catalog.json             metadata mọi bài + danh sách mảng
    quizBank.json            toàn bộ ngân hàng câu hỏi
    docs/<id>.json           nội dung một bài (reader chỉ nạp bài đang mở)
public/                      Vite chép nguyên lên gốc dist/
  generated/                 bản sao tĩnh của src/generated/
  robots.txt, sitemap.xml    do build sinh — KHÔNG commit
assets/css/base.css          bảng màu, navbar, thẻ bài, markdown (còn CSS quiz để dùng lại)
assets/css/blog.css          trang chủ, mục lục cột trái, breadcrumb, điều hướng bài
assets/js/frontmatter.js     parse/stringify frontmatter — build/lib/scan.js dùng chung
index.html                   vỏ SPA duy nhất; mọi route do React Router xử lý
```

Đường dẫn: `/` trang chủ · `/hub?s=<mảng>` danh mục · `/reader?s=<mảng>&d=<chuyên-mục>/<bài>`
trang đọc · `/quiz` luyện trắc nghiệm · `/admin` quản lý bài viết.

Giao diện sáng/tối: lần đầu vào trang thì theo cài đặt của hệ điều hành; bấm nút đổi
một lần là lựa chọn đó được ghi vào `localStorage` và thắng hệ thống từ đó về sau.

## Phạm vi giao diện

Giao diện cố ý chỉ phục vụ việc **đọc bài**. Không có thống kê, không theo dõi tiến độ
đọc, không đánh dấu yêu thích, không icon, không sắp xếp hay lọc nhiều tầng.
Điều hướng chỉ gồm: chọn mảng → chọn chuyên mục → chọn bài, cộng một ô tìm kiếm.

Trang đọc có **mục lục ở cột trái**, dựng từ heading `##`/`###` của bài:
từ 1101px trở lên hiện sẵn và dính theo màn hình; hẹp hơn thì ẩn đi, mở bằng nút ☰
trên thanh trên. Cuộn tới đâu mục lục tô sáng tới đó; bấm một mục ở chế độ ngăn kéo
thì ngăn kéo tự đóng. Bài có từ 3 heading trở xuống thì không hiện mục lục.

### Về việc mở bằng `file://`

Không còn chạy được nữa: giao diện là SPA đóng gói bằng Vite, dùng ES module và
đường dẫn tuyệt đối. Xem thử ở máy bằng `npm run dev`, xem bản deploy bằng
`npm run build && npm run preview`.
