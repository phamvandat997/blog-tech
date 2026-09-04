---
title: "Nền Tảng Căn Bản Java: Cú Pháp, Kiểu Dữ Liệu & Luồng Điều Khiển"
description: Khám phá toàn diện nền tảng ngôn ngữ Java từ biến, 8 kiểu dữ liệu nguyên thuỷ, kiểu tham chiếu, bộ nhớ Stack & Heap, toán tử đến các cấu trúc rẽ nhánh hiện đại (Switch Expression) và vòng lặp.
order: 1
featured: true
tags: [Java, Fundamentals, Syntax, Data-Types, Switch-Expression]
readingMinutes: 15
---

# Nền Tảng Căn Bản Java: Cú Pháp, Kiểu Dữ Liệu & Luồng Điều Khiển

Hiểu sâu về các kiểu dữ liệu, cơ chế quản lý bộ nhớ và cú pháp điều khiển là chìa khóa để viết mã nguồn Java chuẩn xác, tối ưu và tránh các lỗi runtime tiềm ẩn.

---

## 1. 8 Kiểu Dữ Liệu Nguyên Thủy (Primitive Types)

Java chia hệ thống kiểu thành hai nhóm: **Primitive Types** (lưu trữ giá trị trực tiếp) và **Reference Types** (lưu trữ địa chỉ tham chiếu).

| Kiểu dữ liệu | Kích thước | Giá trị mặc định | Khoảng giá trị | Wrapper Class |
|---|---|---|---|---|
| `byte` | 1 byte (8-bit) | `0` | -128 đến 127 | `Byte` |
| `short` | 2 bytes (16-bit) | `0` | -32,768 đến 32,767 | `Short` |
| `int` | 4 bytes (32-bit) | `0` | -2^31 đến 2^31 - 1 (~2.1 tỷ) | `Integer` |
| `long` | 8 bytes (64-bit) | `0L` | -2^63 đến 2^63 - 1 (hậu tố `L`) | `Long` |
| `float` | 4 bytes (32-bit) | `0.0f` | Số thực dấu phẩy động (hậu tố `f`) | `Float` |
| `double` | 8 bytes (64-bit) | `0.0d` | Số thực dấu phẩy động chính xác kép | `Double` |
| `char` | 2 bytes (16-bit) | `\u0000` | Ký tự Unicode (0 đến 65,535) | `Character` |
| `boolean` | JVM quyết định | `false` | `true` hoặc `false` | `Boolean` |

> **Lưu ý về Bộ Nhớ:**  
> - Các biến nguyên thủy cục bộ trong phương thức được lưu trên **Stack**.  
> - Các đối tượng (Objects/Arrays) và dữ liệu của chúng luôn được cấp phát trên **Heap**.

---

## 2. Ép Kiểu (Type Casting) & Tràn Số (Overflow)

### 1. Ép kiểu tự động (Widening / Implicit Casting):
Chuyển từ kiểu nhỏ sang kiểu lớn hơn không làm mất dữ liệu:
```java
int myInt = 100;
long myLong = myInt;    // Tự động chuyển int -> long
double myDouble = myLong; // Tự động chuyển long -> double
```

### 2. Ép kiểu tường minh (Narrowing / Explicit Casting):
Chuyển từ kiểu lớn sang kiểu nhỏ hơn có thể gây mất mát dữ liệu hoặc tràn số (Overflow):
```java
double d = 9.78;
int i = (int) d; // i = 9 (phần thập phân bị cắt bỏ)

int over = 130;
byte b = (byte) over; // b = -126 do tràn số nhị phân 8-bit!
```

---

## 3. Toán Tử Quan Trọng & Short-Circuit Evaluation

Toán tử logic điều kiện `&&` và `||` sử dụng cơ chế **Short-Circuit**:
- `A && B`: Nếu `A` là `false`, biểu thức `B` **sẽ không được tính toán**.
- `A || B`: Nếu `A` là `true`, biểu thức `B` **sẽ không được tính toán**.

Ví dụ bảo vệ chống lỗi `NullPointerException`:
```java
String text = null;
if (text != null && text.length() > 5) {
    // text.length() an toàn, không bị NullPointerException vì vế trái đã false
}
```

---

## 4. Cấu Trúc Rẽ Nhánh Hiện Đại (Switch Expressions)

Từ Java 14, cấu trúc `switch` đã được nâng cấp thành **Switch Expression**, hỗ trợ cú pháp mũi tên `->` gọn gàng, tự động break và có thể trả về giá trị:

```java
int day = 3;
String dayType = switch (day) {
    case 1, 7 -> "Cuối tuần";
    case 2, 3, 4, 5, 6 -> "Ngày trong tuần";
    default -> {
        System.out.println("Kiểm tra ngày không hợp lệ");
        yield "Không xác định";
    }
};
```

---

## 5. Vòng Lặp: for, while, do-while & Enhanced for-each

```java
// 1. For truyền thống
for (int i = 0; i < 5; i++) { ... }

// 2. Enhanced For (For-each)
String[] skills = {"Java", "Spring", "Docker"};
for (String skill : skills) {
    System.out.println(skill);
}

// 3. While & Do-while
int count = 0;
while (count < 3) { count++; }

do {
    // Luôn thực thi ít nhất 1 lần
} while (false);
```

---

## 6. Tổng Kết

Nắm vững cách vận hành của các kiểu dữ liệu, các phép toán tử logic và cấu trúc điều khiển hiện đại giúp bạn viết code Java sạch và an toàn. Hãy kiểm tra kiến thức của mình qua 20 câu hỏi quiz dưới đây!