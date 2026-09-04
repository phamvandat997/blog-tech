---
title: "Lập Trình Hàm, Functional Interfaces & Stream API"
description: Chinh phục phong cách lập trình hàm trong Java: biểu thức Lambda, Method References, 4 Functional Interfaces nòng cốt, toàn bộ vòng đời của Stream API, Collectors và xử lý an toàn với Optional.
order: 1
featured: true
tags: [Java, Lambda, Streams, Functional-Programming, Optional, Collectors]
readingMinutes: 16
---

# Lập Trình Hàm, Functional Interfaces & Stream API

Kể từ Java 8, việc bổ sung biểu thức Lambda và Stream API đã tạo nên một cuộc cách mạng trong cách viết code Java: từ mệnh lệnh (*imperative*) sang khai báo (*declarative*), giúp mã nguồn ngắn gọn, trực quan và dễ dàng xử lý song song.

---

## 1. Functional Interface & 4 Giao Diện Nòng Cốt

Một **Functional Interface** là interface chỉ chứa **duy nhất một phương thức trừu tượng (Single Abstract Method - SAM)**, thường được đánh dấu bằng `@FunctionalInterface`.

Java cung cấp sẵn 4 functional interfaces quan trọng nhất trong gói `java.util.function`:

| Interface | Phương thức SAM | Mô tả | Ứng dụng thực tế |
|---|---|---|---|
| **`Predicate<T>`** | `boolean test(T t)` | Nhận 1 tham số, kiểm tra điều kiện trả về boolean | Lọc dữ liệu (`filter()`) |
| **`Function<T, R>`** | `R apply(T t)` | Nhận tham số kiểu `T`, chuyển đổi sang kiểu `R` | Ánh xạ dữ liệu (`map()`) |
| **`Consumer<T>`** | `void accept(T t)` | Nhận tham số và thực hiện hành động, không trả về giá trị | Duyệt in ra (`forEach()`) |
| **`Supplier<T>`** | `T get()` | Không nhận tham số, cung cấp/tạo mới một đối tượng | Khởi tạo lazy (`orElseGet()`) |

---

## 2. Cú Pháp Lambda & Method References

```java
// Lambda biểu thức
(a, b) -> a + b

// Method Reference tương đương:
String::toUpperCase          // Static/Instance method reference
System.out::println          // Tham chiếu đến instance cụ thể
ArrayList::new               // Constructor reference
```

---

## 3. Kiến Trúc Vòng Đời Của Stream API

Một chuỗi xử lý Stream (Stream Pipeline) bao gồm 3 giai đoạn:

```text
[Nguồn dữ liệu (Source)] ──> [Thao tác trung gian (Intermediate)] ──> [Thao tác kết thúc (Terminal)]
```

### 1. Nguồn dữ liệu (Source):
Tạo từ Collection (`list.stream()`), mảng (`Arrays.stream(arr)`), hoặc số (`IntStream.range(1, 10)`).

### 2. Thao tác trung gian (Intermediate Operations):
Có tính chất **Lazy Evaluation** (chỉ thực thi khi có Terminal Operation kích hoạt) và trả về một `Stream<T>` mới:
- `filter(Predicate)`: Giữ lại phần tử thoả điều kiện.
- `map(Function)`: Biến đổi phần tử.
- `flatMap(Function)`: Làm phẳng cấu trúc phân cấp (Stream of Streams -> Single Stream).
- `distinct()`: Bỏ trùng lặp.
- `sorted()`: Sắp xếp phần tử.

### 3. Thao tác kết thúc (Terminal Operations):
Kích hoạt chu trình xử lý và đóng Stream (Stream không thể tái sử dụng sau khi đã đóng):
- `collect(Collectors.toList())`, `toList()` (Java 16+)
- `forEach(Consumer)`
- `count()`, `reduce()`, `findFirst()`, `anyMatch(Predicate)`

---

## 4. Xử Lý Null An Toàn với `Optional<T>`

`Optional` là chiếc hộp bọc giá trị có thể rỗng, giúp loại bỏ hoàn toàn mã kiểm tra `null` rải rác:

```java
Optional<String> nameOpt = findUsernameById(10);

// Xử lý giá trị nếu có, nếu không thì lấy giá trị mặc định
String name = nameOpt.orElse("Khách vãng lai");

// Hoặc ném ngoại lệ nếu vắng mặt
String validName = nameOpt.orElseThrow(() -> new NotFoundException("User not found"));
```

---

## 5. Tổng Kết

Stream API và Lambda giúp bạn xử lý các tập dữ liệu phức tạp chỉ với vài dòng code thanh thoát. Hãy cùng kiểm tra kiến thức qua 20 câu hỏi quiz dưới đây!