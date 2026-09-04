---
title: "Java Hiện Đại: Records, Pattern Matching & Best Practices (Java 8 - 21+)"
description: Tổng kết toàn diện những bước tiến vượt bậc của Java hiện đại: Records bất biến, Pattern Matching for switch, Text Blocks, Sequenced Collections, Scoped Values và các nguyên lý Clean Code & SOLID trong Java.
order: 1
featured: true
tags: [Java, Modern-Java, Records, Pattern-Matching, Java21, Best-Practices]
readingMinutes: 16
---

# Java Hiện Đại: Records, Pattern Matching & Best Practices (Java 8 - 21+)

Java ngày nay không còn là ngôn ngữ dài dòng (verbose) của thập kỷ trước. Với chu kỳ phát hành nhanh và các dự án Amber, Loom, Panama, Java đã lột xác thành một ngôn ngữ hiện đại, biểu cảm và tinh gọn.

---

## 1. Java Records (Java 16+) - Khai Tử Boilerplate

**Record** là loại class chuyên dụng để lưu trữ dữ liệu bất biến (*Data Carrier*). Chỉ với một dòng khai báo, trình biên dịch tự động sinh ra:
- Các trường `private final`.
- Canonical Constructor khởi tạo đầy đủ tham số.
- Các phương thức getter (ví dụ `name()`, `age()` thay vì `getName()`).
- `equals()`, `hashCode()` và `toString()` chuẩn mực.

```java
// Chỉ 1 dòng code thay thế cho 50 dòng class truyền thống!
public record UserDto(Long id, String name, String email) {
    // Compact constructor để validate dữ liệu
    public UserDto {
        Objects.requireNonNull(email, "Email không được để trống");
    }
}
```

---

## 2. Text Blocks (Java 15+) - Chuỗi Nhiều Dòng Sạch Sẽ

Sử dụng ba dấu ngoặc kép `"""` để định dạng JSON, SQL, HTML mà không cần thoát ký tự `\n` hay `\"`:

```java
String query = """
    SELECT id, title, content 
    FROM posts 
    WHERE status = 'PUBLISHED' 
    ORDER BY created_at DESC
    """;
```

---

## 3. Pattern Matching Cho `switch` (Java 21 LTS)

Kết hợp giữa `switch` và `instanceof`, kiểm tra kiểu dữ liệu và giải nén biến trực tiếp mà không cần ép kiểu:

```java
public static String formatValue(Object obj) {
    return switch (obj) {
        case Integer i -> String.format("Số nguyên: %d", i);
        case Long l    -> String.format("Số nguyên lớn: %d", l);
        case Double d  -> String.format("Số thực: %.2f", d);
        case String s when s.length() > 10 -> "Chuỗi dài: " + s.substring(0, 10) + "...";
        case String s  -> "Chuỗi ngắn: " + s;
        case null      -> "Giá trị null";
        default        -> obj.toString();
    };
}
```

---

## 4. Sequenced Collections (Java 21 LTS)

Trước Java 21, để lấy phần tử đầu và cuối của các Collection khác nhau phải dùng các hàm không nhất quán (`list.get(0)`, `set.iterator().next()`, `deque.getFirst()`).

Java 21 chuẩn hoá bằng interface `SequencedCollection`:
- `getFirst()` / `getLast()`
- `addFirst()` / `addLast()`
- `removeFirst()` / `removeLast()`
- `reversed()`: Trả về view đảo ngược tức thì trong $O(1)$.

---

## 5. Clean Code & Nguyên Lý SOLID Trong Java

1. **Single Responsibility (SRP):** Mỗi class chỉ gánh vác một trách nhiệm duy nhất.
2. **Open/Closed (OCP):** Mở rộng tính năng bằng kế thừa/interface, không sửa đổi code đang hoạt động ổn định.
3. **Liskov Substitution (LSP):** Lớp con phải thay thế được lớp cha mà không làm hỏng tính đúng đắn của chương trình.
4. **Interface Segregation (ISP):** Chia nhỏ interface lớn thành nhiều interface chuyên biệt.
5. **Dependency Inversion (DIP):** Module cấp cao không phụ thuộc module cấp thấp; cả hai phụ thuộc vào Abstraction.

---

## 6. Tổng Kết Toàn Bộ Lộ Trình

Xin chúc mừng! Bạn đã đi trọn vẹn lộ trình từ cài đặt môi trường, nền tảng cốt lõi, hướng đối tượng, xử lý dữ liệu, đa luồng cho đến những tính năng mới nhất của Java 21. Hãy chinh phục bộ 20 câu hỏi cuối cùng này để hoàn thiện 100% chứng nhận kiến thức!