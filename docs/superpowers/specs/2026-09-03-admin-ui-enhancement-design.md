# Nâng cấp UI trang admin

Ngày: 2026-09-03 · Trạng thái: đã duyệt

## Vấn đề

Trang `/admin` đạt yêu cầu chức năng nhưng kém ở bốn mặt người dùng nêu ra:
chậm lúc mở trang, chậm sau khi đăng nhập, khó dùng khi soạn bài, và giao
diện chưa cùng hệ với trang blog.

## Ràng buộc

- Không thêm dependency. Kho này cố ý không có runtime package nào.
- Giữ nguyên kiến trúc "mọi thay đổi đi qua pull request" trong `assets/js/admin.js`.
- Giữ Google Fonts (Inter + JetBrains Mono) — quyết định của người dùng.
- Desktop và mobile quan trọng ngang nhau.

## Thiết kế

### 1. Tốc độ mở trang

- Google Fonts tải bất đồng bộ: `media="print"` + `onload` đổi về `all`, kèm
  `<noscript>` dự phòng. Giữ đúng font, bỏ chặn render.
- `assets/js/markdown.js` chỉ nạp động lần đầu cần render preview.
- CSS màn đăng nhập inline vào `<head>`; phần còn lại giữ ở `assets/css/admin.css`.

### 2. Tốc độ sau đăng nhập

`enterApp()` đang `await loadSections()` trước `switchView("list")` → `loadPosts()`.
Hai việc độc lập (sections chỉ cần cho màn soạn bài) nhưng chạy nối đuôi: 4 vòng
round-trip trước khi thấy bài đầu tiên.

Sửa: chạy song song, không chặn danh sách bằng sections. Còn 2 vòng.
Thêm skeleton khi chờ, và chống gọi chồng `loadPosts()`.

### 3. Soạn bài

- Lưu nháp tự động vào `localStorage`, debounce 800ms; hỏi khôi phục khi quay
  lại; xoá nháp sau khi tạo PR thành công.
- `beforeunload` chặn rời trang khi form còn thay đổi chưa gửi.
- Xem trước 2 cột từ 1100px trở lên; dưới ngưỡng giữ 2 tab như cũ.
- Phím tắt: `Ctrl/Cmd+S` gửi form, `Ctrl/Cmd+K` vào ô lọc danh sách.
- Thông báo thoáng qua dùng `showToast()` sẵn có; alert tĩnh giữ cho lỗi cần đọc kỹ.

### 4. Danh sách bài

- Bộ lọc trạng thái bấm được, kèm số đếm: Tất cả / Đang đăng / Chờ duyệt / Chờ xoá.
- Nhóm theo mảng, tiêu đề nhóm sticky.
- Ô lọc thêm phím tắt và nút xoá nhanh.

### 5. Giao diện

Viết lại `assets/css/admin.css` bám token có sẵn trong `base.css`: card nhất quán,
focus ring rõ, vùng bấm ≥44px trên mobile, kiểm lại dark mode.

## Kiểm chứng

Không có test tự động cho UI. Chạy `dist/` trên localhost, kiểm bằng trình duyệt:
màn đăng nhập desktop + mobile 375px, light + dark, console sạch. Phần sau đăng
nhập cần token GitHub nên kiểm bằng dữ liệu giả bơm vào `admin.posts`; luồng thật
với GitHub do người dùng xác nhận.

## Đã cân nhắc và bỏ

- **GraphQL** gộp `listOpenPullRequests` + N×`pullRequestFiles` thành 1 request:
  sau khi sửa mục 2 thì đây không còn là chỗ nghẽn, không đáng thêm nhánh code
  thứ hai kèm fallback REST.
- **Tự host font / font hệ thống**: người dùng chọn giữ Google Fonts.
- **Cache danh sách vào localStorage**: người dùng chọn luôn hiển thị dữ liệu thật.
