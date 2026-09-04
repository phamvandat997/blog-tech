---
title: "Xử Lý Chuỗi, Ngoại Lệ & File I/O Hiện Đại Trong Java"
description: Khám phá kiến trúc bất biến của String, String Pool, phân biệt StringBuilder & StringBuffer, hệ thống cấp bậc Ngoại lệ (Checked vs Unchecked), Try-with-resources và Java NIO.2.
order: 1
featured: true
tags: [Java, Strings, StringPool, Exceptions, TryWithResources, NIO2]
readingMinutes: 15
---

# Xử Lý Chuỗi, Ngoại Lệ & File I/O Hiện Đại Trong Java

Trong các hệ thống phần mềm doanh nghiệp, xử lý chuỗi tối ưu, quản lý ngoại lệ an toàn và thao tác I/O hiệu quả là những kỹ năng cốt lõi quyết định tính ổn định và hiệu năng của ứng dụng.

---

## 1. String Immutability & String Constant Pool

Trong Java, đối tượng `String` mang tính **bất biến (Immutable)**: một khi đã tạo thì nội dung chuỗi không thể thay đổi. Mọi thao tác như `concat()`, `replace()`, `substring()` đều tạo ra một đối tượng String mới trên Heap.

### String Pool:
JVM tối ưu bộ nhớ bằng cách lưu trữ các chuỗi ký tự nguyên bản (String Literals) trong vùng nhớ **String Constant Pool**:
```java
String s1 = "Java";
String s2 = "Java";
String s3 = new String("Java");

System.out.println(s1 == s2); // true (cùng trỏ tới 1 đối tượng trong Pool)
System.out.println(s1 == s3); // false (s3 tạo đối tượng riêng trên Heap)
System.out.println(s1.equals(s3)); // true (so sánh nội dung chuỗi)
```

### So sánh String vs StringBuilder vs StringBuffer:

| Tiêu chí | `String` | `StringBuilder` | `StringBuffer` |
|---|---|---|---|
| **Tính bất biến** | Bất biến (Immutable) | Có thể thay đổi (Mutable) | Có thể thay đổi (Mutable) |
| **Thread-Safe** | Có (Do bất biến) | Không (Not Thread-Safe) | Có (`synchronized` các phương thức) |
| **Hiệu năng** | Chậm khi nối chuỗi nhiều lần | Rất nhanh (Khuyên dùng cho đơn luồng) | Chậm hơn StringBuilder do lock sync |

---

## 2. Hệ Thống Ngoại Lệ (Exception Hierarchy)

Mọi lỗi và ngoại lệ trong Java đều bắt nguồn từ lớp cha `java.lang.Throwable`:

```text
               Throwable
              /                    Error        Exception
                       /                       Checked Exceptions   RuntimeException (Unchecked)
```

- **Error:** Các lỗi nghiêm trọng từ môi trường máy ảo phần cứng (ví dụ: `OutOfMemoryError`, `StackOverflowError`), ứng dụng không nên và không thể phục hồi.
- **Checked Exceptions:** Kế thừa trực tiếp từ `Exception` (trừ `RuntimeException`), trình biên dịch **bắt buộc** phải xử lý bằng `try-catch` hoặc khai báo `throws` ở chữ ký phương thức (ví dụ: `IOException`, `SQLException`).
- **Unchecked Exceptions (Runtime):** Kế thừa từ `RuntimeException`, thường do lỗi logic của lập trình viên, không bắt buộc khai báo (ví dụ: `NullPointerException`, `IndexOutOfBoundsException`, `IllegalArgumentException`).

---

## 3. Quản Lý Tài Nguyên với Try-With-Resources

Kể từ Java 7, câu lệnh `try-with-resources` tự động đóng tất cả các tài nguyên kế thừa từ interface `java.lang.AutoCloseable`, loại bỏ hoàn toàn mã dọn dẹp cồng kềnh trong khối `finally`:

```java
try (BufferedReader reader = Files.newBufferedReader(Path.of("data.txt"))) {
    String line;
    while ((line = reader.readLine()) != null) {
        System.out.println(line);
    }
} catch (IOException e) {
    System.err.println("Lỗi đọc file: " + e.getMessage());
} // reader tự động đóng ngay cả khi có ngoại lệ phát sinh
```

---

## 4. Thao Tác File Hiện Đại với Java NIO.2 (`java.nio.file`)

Gói `java.nio.file` (NIO.2) cung cấp các lớp tiện ích mạnh mẽ như `Path` và `Files`:

```java
Path path = Path.of("notes.txt");

// 1. Ghi file văn bản
Files.writeString(path, "Học Java cùng Blog Tech", StandardOpenOption.CREATE, StandardOpenOption.WRITE);

// 2. Đọc toàn bộ nội dung file thành String
String content = Files.readString(path);

// 3. Đọc từng dòng thành Stream (xử lý file lớn)
try (Stream<String> lines = Files.lines(path)) {
    lines.filter(line -> line.contains("Java"))
         .forEach(System.out::println);
}
```

---

## 5. Tổng Kết

Thao tác chuỗi hiệu quả và xử lý ngoại lệ chặt chẽ với Try-with-resources là những thói quen viết code chuẩn mực của kỹ sư Java chuyên nghiệp. Hãy thử thách với 20 câu hỏi quiz dưới đây!