---
title: "Xử Lý Chuỗi, Ngoại Lệ & File I/O Hiện Đại Trong Java"
description: Chuyên khảo chuyên sâu: Compact Strings (Latin1 vs UTF-16), String Constant Pool, bộ đệm mảng StringBuilder, hệ thống ngoại lệ Checked vs Unchecked, cơ chế Suppressed Exceptions trong Try-with-resources và tối ưu hoá I/O với Java NIO.2.
order: 1
featured: true
tags: [Java, Strings, StringPool, Exceptions, TryWithResources, NIO2, CompactStrings]
readingMinutes: 28
---

# Xử Lý Chuỗi, Ngoại Lệ & File I/O Hiện Đại Trong Java

Trong các ứng dụng doanh nghiệp xử lý dữ liệu lớn, việc hiểu cách Java tối ưu hoá chuỗi ký tự trong bộ nhớ, quản lý vòng đời tài nguyên I/O và xử lý ngoại lệ chuẩn mực quyết định trực tiếp tới khả năng sống còn của hệ thống.

---

## 1. Bản Chất Chuỗi Trong Java: Compact Strings & String Constant Pool

### 1.1. Bước Đột Phá "Compact Strings" (Java 9+)
Trước Java 9, mỗi ký tự trong `String` được lưu trữ bằng một mảng `char[]` (mỗi `char` chiếm 2 bytes theo UTF-16), gây lãng phí 50% bộ nhớ vì phần lớn chuỗi trong ứng dụng chỉ chứa các ký tự ASCII/Latin-1 (chỉ cần 1 byte).

Kể từ Java 9, Java áp dụng **Compact Strings**:
- Nội dung chuỗi chuyển sang mảng `byte[] value`.
- Trường cờ `byte coder` nhận 1 trong 2 giá trị:
  - `LATIN1` (0): Nếu toàn bộ ký tự vừa trong 1 byte (tiết kiệm ngay 50% RAM!).
  - `UTF16` (1): Nếu chứa ký tự đặc biệt/Unicode đa ngôn ngữ (2 bytes mỗi ký tự).

```java
// Cấu trúc nội bộ của String trong OpenJDK:
public final class String implements java.io.Serializable, Comparable<String>, CharSequence {
    @Stable
    private final byte[] value;
    private final byte coder;
    private int hash; // Cache hashcode sau lần tính toán đầu tiên
}
```

### 1.2. Tại Sao String Lại Bất Biến (Immutable)?
1. **String Constant Pool:** Nếu String có thể sửa đổi, việc thay đổi chuỗi ở một nơi sẽ làm thay đổi ngầm định giá trị của tất cả các biến khác đang dùng chung tham chiếu trong Pool!
2. **Bảo mật (Security):** Tên người dùng, mật khẩu kết nối DB, URL mạng thường truyền dưới dạng String. Tính bất biến ngăn ngừa các cuộc tấn công thay đổi tham số giữa chừng.
3. **Thread-Safety tuyệt đối:** Đối tượng bất biến có thể chia sẻ tự do giữa hàng triệu luồng mà không cần đồng bộ hoá (`synchronized`).
4. **Caching Hashcode:** Mã băm `hash` chỉ cần tính một lần và lưu lại (caching), giúp tra cứu trong `HashMap` đạt hiệu năng tối đa.

---

## 2. So Sánh Chuyên Sâu: String vs StringBuilder vs StringBuffer

| Tiêu chí | `String` | `StringBuilder` | `StringBuffer` |
|---|---|---|---|
| **Cơ chế lưu trữ** | Bất biến (Immutable) | Có thể biến đổi (Mutable) | Có thể biến đổi (Mutable) |
| **Đồng bộ hoá** | Không cần (Immutable) | Non-thread-safe | Thread-safe (Mọi hàm có `synchronized`) |
| **Dung lượng mảng** | Cố định theo chuỗi | Khởi tạo 16 ký tự, tự mở rộng $(Old 	imes 2) + 2$ | Khởi tạo 16 ký tự, tự mở rộng $(Old 	imes 2) + 2$ |
| **Trường hợp sử dụng** | Hằng số, khoá Map, DTO | Nối chuỗi, vòng lặp đơn luồng | Đa luồng chia sẻ bộ đệm chung (rất hiếm dùng) |

---

## 3. Hệ Thống Ngoại Lệ & Best Practices Xử Lý Ngoại Lệ

```text
                           Throwable
                          /                               Error         Exception
                   (JVM Fatal)     /                                ┌──────────┘           └──────────┐
               Checked Exceptions                 RuntimeException
           (IOException, SQLException)       (NullPointerException...)
```

### 3.1. Phân biệt Checked vs Unchecked Exception:
- **Checked Exceptions:** Kế thừa từ `Exception` nhưng không thuộc `RuntimeException`. Buộc lập trình viên phải dự liệu trước các sự cố môi trường (File không tồn tại, đứt kết nối mạng).
- **Unchecked Exceptions:** Kế thừa từ `RuntimeException`. Biểu thị lỗi lập trình (Logic Bugs) như chia cho 0, null pointer, ép kiểu sai.

### 3.2. Cạm Bẫy Nguy Hiểm: "Swallowing Exceptions" (Nuốt Ngoại Lệ)
```java
// SAI LẦM NGHIÊM TRỌNG: Nuốt ngoại lệ làm che giấu lỗi hệ thống
try {
    processPayment();
} catch (PaymentException e) {
    // Để trống hoặc chỉ in printStackTrace không xử lý!
}

// CHUẨN MỰC: Ghi log đầy đủ hoặc ném lại bọc trong RuntimeException (Exception Chaining)
try {
    processPayment();
} catch (PaymentException e) {
    logger.error("Xử lý thanh toán thất bại cho khách hàng: {}", customerId, e);
    throw new ServiceException("Lỗi hệ thống thanh toán", e); // Lưu vết cause
}
```

---

## 4. Try-With-Resources & Cơ Chế Suppressed Exceptions

### 4.1. Thứ Tự Đóng Tài Nguyên
Tài nguyên khai báo trong `try (...)` sẽ được tự động đóng theo **thứ tự ngược lại với thứ tự khai báo** (như ngăn xếp LIFO):

```java
try (ResourceA a = new ResourceA(); // Đóng THỨ HAI
     ResourceB b = new ResourceB()) { // Đóng ĐẦU TIÊN
    // Thực thi công việc
}
```

### 4.2. Cơ Chế Suppressed Exceptions (Ngoại Lệ Bị Kìm Nén)
Nếu khối `try` ném ngoại lệ $E_1$ và quá trình gọi `close()` ném ngoại lệ $E_2$:
- $E_1$ là ngoại lệ chính được ném ra ngoài.
- $E_2$ được gắn vào $E_1$ dưới dạng **Suppressed Exception**.
- Có thể truy xuất danh sách này bằng lệnh `e.getSuppressed()`.

---

## 5. Hiện Đại Hoá File I/O Với Java NIO.2 (`java.nio.file`)

Gói NIO.2 thay thế hoàn toàn lớp `java.io.File` cổ xưa bằng kiến trúc hướng bộ đệm hiện đại:

```java
Path source = Path.of("input.txt");
Path destination = Path.of("output.txt");

// 1. Sao chép file ghi đè an toàn
Files.copy(source, destination, StandardCopyOption.REPLACE_EXISTING);

// 2. Di chuyển file nguyên tử (Atomic Move)
Files.move(source, destination, StandardCopyOption.ATOMIC_MOVE);

// 3. Đọc dữ liệu theo Stream tránh tràn bộ nhớ với file lớn:
try (Stream<String> lines = Files.lines(source, StandardCharsets.UTF_8)) {
    long errorCount = lines.filter(line -> line.startsWith("[ERROR]"))
                           .count();
    System.out.println("Số dòng lỗi: " + errorCount);
}
```

---

## 6. Tổng Kết

Hiểu sâu về cơ chế quản lý chuỗi, thứ tự dọn dẹp tài nguyên trong Try-with-resources và kỹ thuật I/O hiệu năng cao giúp bạn xây dựng những ứng dụng doanh nghiệp ổn định và bền vững. Hãy chinh phục 20 câu hỏi quiz nâng cao dưới đây!