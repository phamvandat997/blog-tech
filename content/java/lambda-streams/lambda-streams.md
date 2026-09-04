---
title: "Lập Trình Hàm, Functional Interfaces & Stream API Chuyên Sâu"
description: Khám phá kiến trúc lập trình hàm trong Java: cơ chế dịch mã invokedynamic & LambdaMetafactory, hệ thống Functional Interfaces chuyên biệt, phân tích Spliterator, kỹ thuật Collectors nâng cao (groupingBy, teeing) và tối ưu hoá Parallel Streams.
order: 1
featured: true
tags: [Java, Lambda, Streams, Functional-Programming, Spliterator, Collectors, ParallelStreams]
readingMinutes: 28
---

# Lập Trình Hàm, Functional Interfaces & Stream API Chuyên Sâu

Sự xuất hiện của Lambda và Stream API trong Java 8 không chỉ là một thay đổi cú pháp, mà là sự chuyển dịch mô thức thiết kế (*Paradigm Shift*) từ hướng đối tượng mệnh lệnh sang lập trình hàm khai báo.

---

## 1. Cơ Chế Nội Tại Của Lambda: `invokedynamic` & `LambdaMetafactory`

Nhiều lập trình viên lầm tưởng biểu thức Lambda chỉ là cú pháp viết tắt (syntactic sugar) của **Anonymous Inner Class**. Điều đó hoàn toàn sai lầm!

### Sự Khác Biệt Giữa Anonymous Inner Class và Lambda:
- **Anonymous Inner Class:** Mỗi lần compile sinh ra một file `.class` độc lập (ví dụ `Outer$1.class`), nạp vào Metaspace làm tăng kích thước bộ nhớ và khởi tạo một đối tượng mới mỗi lần chạy.
- **Biểu Thức Lambda:** Không sinh file `.class` mới! Mã bytecode của Lambda được biên dịch thành một `private static` method bên trong chính class đó.
- Lệnh bytecode **`invokedynamic` (Indy)** kết hợp cùng **`LambdaMetafactory`** liên kết phương thức này với interface mục tiêu một cách động tại lần chạy đầu tiên, tối ưu hiệu năng bộ nhớ vượt trội.

---

## 2. Hệ Thống Functional Interfaces Toàn Diện

Bên cạnh 4 interface nòng cốt (`Predicate`, `Function`, `Consumer`, `Supplier`), Java cung cấp hệ thống giao diện chuyên biệt cho các kiểu nguyên thuỷ nhằm **loại bỏ chi phí đấm mở hộp (Boxing/Unboxing)**:

| Nhóm | Functional Interface | SAM Signature | Ứng dụng |
|---|---|---|---|
| **2 Tham số** | `BiFunction<T, U, R>` | `R apply(T t, U u)` | Tính toán 2 đầu vào khác kiểu |
| **Cùng kiểu** | `UnaryOperator<T>` | `T apply(T t)` | Mở rộng của `Function<T, T>` |
| **Cùng kiểu 2 đối** | `BinaryOperator<T>` | `T apply(T t1, T t2)` | Dùng cho phép `reduce()` |
| **Kiểu nguyên thuỷ** | `IntPredicate`, `LongPredicate` | `boolean test(int value)` | Lọc số không tốn RAM |
| **Hàm tiêu thụ 2 đối**| `BiConsumer<T, U>` | `void accept(T t, U u)` | Duyệt Map `(k, v) -> ...` |

---

## 3. Bản Chất Vòng Đời Của Stream API

Stream là một chuỗi các phần tử hỗ trợ xử lý tuần tự hoặc song song, **không lưu trữ dữ liệu** và **không làm thay đổi nguồn dữ liệu gốc**.

```text
[ Data Source ]  (List, Array, I/O)
       │
       ▼  .stream()  (Tạo Spliterator)
┌─────────────────────────────────────────────────────────┐
│ Intermediate Operations (Lazy Pipeline)                 │
│  - filter(Predicate)    : Không trạng thái (Stateless)   │
│  - map(Function)        : Không trạng thái (Stateless)   │
│  - distinct()           : Có trạng thái (Stateful)       │
│  - sorted()             : Có trạng thái (Stateful)       │
└─────────────────────────────────────────────────────────┘
       │
       ▼  Terminal Operation (Kích hoạt thực thi)
[ Kết quả: List, Map, Primitive, Optional, Side-effect ]
```

### 3.1. Stateless vs Stateful Operations
- **Stateless Operations (`filter`, `map`, `flatMap`):** Xử lý độc lập từng phần tử, không cần nhớ các phần tử trước. Rất lý tưởng cho xử lý song song.
- **Stateful Operations (`sorted`, `distinct`, `limit`):** Phải tích luỹ và ghi nhớ toàn bộ trạng thái của các phần tử trước đó trước khi có thể phát ra phần tử tiếp theo.

### 3.2. Spliterator - Động Cơ Của Stream
Mỗi Stream được điều khiển bởi một `Spliterator` (Splitable Iterator) chịu trách nhiệm duyệt tuần tự và chia tách luồng cho các worker thread khi chạy `parallel()`.
Các cờ đặc trưng (`characteristics`):
- `SIZED`: Biết trước chính xác số phần tử.
- `SORTED`: Dữ liệu đã có thứ tự từ trước.
- `DISTINCT`: Các phần tử không trùng lặp.
- `CONCURRENT`: An toàn khi sửa đổi nguồn đồng thời.

---

## 4. Kỹ Thuật Nâng Cao Với `Collectors`

Gói `java.util.stream.Collectors` cung cấp sức mạnh biến hoá dữ liệu kỳ diệu:

### 4.1. Gom Nhóm Đa Cấp (Multi-level Grouping)
```java
// Nhóm nhân viên theo Phòng ban, sau đó nhóm tiếp theo Chức vụ:
Map<Department, Map<Role, List<Employee>>> tree = employees.stream()
    .collect(Collectors.groupingBy(
        Employee::department,
        Collectors.groupingBy(Employee::role)
    ));
```

### 4.2. Tính Toán Tổng Hợp Đi Kèm:
```java
// Tính lương trung bình của từng phòng ban:
Map<Department, Double> avgSalaryByDept = employees.stream()
    .collect(Collectors.groupingBy(
        Employee::department,
        Collectors.averagingDouble(Employee::salary)
    ));
```

### 4.3. `Collectors.teeing()` (Bổ sung từ Java 12)
Thực hiện đồng thời hai phép thu thập độc lập trên cùng một Stream và ghép kết quả lại:
```java
var result = numbers.stream().collect(
    Collectors.teeing(
        Collectors.minBy(Integer::compareTo), // Thu thập 1: Tìm min
        Collectors.maxBy(Integer::compareTo), // Thu thập 2: Tìm max
        (min, max) -> new MinMaxDto(min.orElse(0), max.orElse(0)) // Ghép kết quả
    )
);
```

---

## 5. Khi Nào KHÔNG Nên Sử Dụng `parallelStream()`?

Chạy song song bằng `parallelStream()` không phải lúc nào cũng nhanh hơn:

1. **Tập dữ liệu nhỏ ($N < 10,000$):** Chi phí phân chia task vào `ForkJoinPool` và gộp kết quả lại lớn hơn nhiều thời gian chạy tuần tự.
2. **Nguồn dữ liệu khó chia tách:** `ArrayList` chia tách cực nhanh $O(1)$, nhưng `LinkedList` hay `Stream.iterate()` chia tách tốn $O(n)$ làm triệt tiêu ưu thế song song.
3. **Tác vụ bị nghẽn I/O:** `parallelStream()` sử dụng chung `ForkJoinPool.commonPool()`. Nếu dính I/O block, toàn bộ các tác vụ song song khác của hệ thống sẽ bị treo theo.

---

## 6. Tổng Kết

Stream API và Lập trình hàm biến mã nguồn Java trở nên ngắn gọn, thanh lịch và mang tính biểu cảm cao. Hãy cùng thử sức với 20 câu hỏi quiz nâng cao dưới đây!