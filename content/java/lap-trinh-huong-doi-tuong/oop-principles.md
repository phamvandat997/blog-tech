---
title: "Lập Trình Hướng Đối Tượng (OOP) Chuyên Sâu Trong Java"
description: Đi sâu vào 4 trụ cột OOP, cơ chế Constructor Chaining, từ khoá static, final, sự khác biệt giữa Abstract Class & Interface, cùng tính năng Sealed Classes từ Java 17.
order: 1
featured: true
tags: [Java, OOP, Inheritance, Polymorphism, Interface, Sealed-Classes]
readingMinutes: 16
---

# Lập Trình Hướng Đối Tượng (OOP) Chuyên Sâu Trong Java

Lập trình hướng đối tượng là triết lý thiết kế trung tâm của Java. Việc hiểu rõ cách tổ chức class, quan hệ kế thừa và cơ chế đa hình giúp bạn thiết kế kiến trúc phần mềm linh hoạt, dễ bảo trì và mở rộng.

---

## 1. Bốn Trụ Cột Của OOP Trong Java

### 1. Tính Đóng Gói (Encapsulation):
Ẩn giấu trạng thái nội tại của đối tượng, chỉ cho phép truy xuất và sửa đổi thông qua các phương thức getter/setter hợp lệ.
- Sử dụng Access Modifiers: `private`, *default (package-private)*, `protected`, `public`.

### 2. Tính Kế Thừa (Inheritance):
Cho phép một lớp con (subclass) tái sử dụng thuộc tính và phương thức của lớp cha (superclass) thông qua từ khoá `extends`. Java **không hỗ trợ đa kế thừa lớp** (Multiple Class Inheritance) để tránh xung đột hình thoi (Diamond Problem).

### 3. Tính Đa Hình (Polymorphism):
Một hành vi có thể thể hiện dưới nhiều hình thái khác nhau:
- **Compile-time Polymorphism (Static Binding):** *Method Overloading* (nạp chồng phương thức - cùng tên, khác danh sách tham số).
- **Runtime Polymorphism (Dynamic Binding):** *Method Overriding* (ghi đè phương thức với `@Override` - resolved tại runtime dựa trên kiểu đối tượng thực tế trên Heap).

### 4. Tính Trừu Tượng (Abstraction):
Tập trung vào những hành vi cốt lõi mà đối tượng cung cấp thay vì chi tiết cài đặt bên trong. Thực hiện qua **Abstract Class** và **Interface**.

---

## 2. Constructor & Constructor Chaining (`this()`, `super()`)

- `this(...)`: Gọi constructor khác trong cùng một class. Phải là **dòng lệnh đầu tiên** trong thân constructor.
- `super(...)`: Gọi constructor của lớp cha trực tiếp. Nếu không khai báo rõ ràng, trình biên dịch sẽ tự động chèn `super()` không tham số vào đầu constructor.

```java
public class Employee extends Person {
    private double salary;

    public Employee() {
        this(0.0); // Gọi constructor dưới
    }

    public Employee(double salary) {
        super("Unknown"); // Gọi constructor của Person
        this.salary = salary;
    }
}
```

---

## 3. Từ Khoá: `static` & `final`

| Khái niệm | Ý nghĩa khi áp dụng cho Biến (Field) | Phương thức (Method) | Lớp (Class) |
|---|---|---|---|
| **`static`** | Thuộc về Class, nạp 1 lần vào Metaspace, dùng chung cho mọi thực thể. | Gọi trực tiếp qua tên Class mà không cần `new`. Không thể truy cập biến `this`. | Chỉ áp dụng cho Nested/Inner class tĩnh. |
| **`final`** | Hằng số, giá trị chỉ được gán 1 lần duy nhất (phải gán khi khai báo hoặc trong constructor). | Phương thức không thể bị ghi đè (`@Override`) bởi lớp con. | Lớp không thể bị kế thừa (ví dụ: `java.lang.String`). |

---

## 4. So Sánh Abstract Class & Interface

| Tiêu chí | Abstract Class | Interface |
|---|---|---|
| **Mục đích** | Biểu diễn quan hệ bản chất `IS-A` (Là một) | Biểu diễn hành vi/năng lực `CAN-DO` (Có thể làm) |
| **Kế thừa** | Đơn kế thừa (`extends`) | Đa cài đặt (`implements` nhiều interface) |
| **Trạng thái (Fields)** | Có thể chứa cả biến instance có trạng thái | Chỉ chứa hằng số `public static final` |
| **Phương thức** | Phương thức trừu tượng, thông thường | Trừu tượng, `default` method, `static` method, `private` method |

---

## 5. Sealed Classes & Interfaces (Java 17+)

Java 17 chính thức hoá **Sealed Classes**, cho phép kiểm soát chính xác những lớp con nào được phép kế thừa:

```java
public sealed interface Shape permits Circle, Rectangle, Square {}

public final class Circle implements Shape {}
public non-sealed class Rectangle implements Shape {}
public final class Square implements Shape {}
```

Điều này giúp trình biên dịch kiểm soát toàn diện cây kế thừa, kết hợp hoàn hảo với **Pattern Matching for switch**.

---

## 6. Tổng Kết

Thấu hiểu các nguyên tắc OOP giúp bạn tiếp cận các Design Patterns và kiến trúc hướng module trong các ứng dụng thực tế. Hãy cùng kiểm tra trình độ với 20 câu hỏi quiz dưới đây!