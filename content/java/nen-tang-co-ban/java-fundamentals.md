---
title: "Nền Tảng Căn Bản Java: Cú Pháp, Kiểu Dữ Liệu & Luồng Điều Khiển"
description: Đi sâu vào hệ thống kiểu dữ liệu nguyên thuỷ vs tham chiếu, phân tích nhị phân số học, bẫy Integer Cache và Autoboxing, cơ chế phân bổ Stack Frame & Heap, toán tử dịch bit (Bitwise), Switch Expression hiện đại và các kỹ thuật điều khiển luồng nâng cao.
order: 1
featured: true
tags: [Java, Fundamentals, Memory, Stack-Heap, Bitwise, Autoboxing, Switch-Expression]
readingMinutes: 28
---

# Nền Tảng Căn Bản Java: Cú Pháp, Kiểu Dữ Liệu & Luồng Điều Khiển

Viết mã Java chạy được là điều bình thường; viết mã Java tối ưu bộ nhớ, loại bỏ bẫy sai số nhị phân và ngăn ngừa ngoại lệ bất ngờ mới là dấu ấn của một kỹ sư lành nghề.

---

## 1. Bản Chất 8 Kiểu Dữ Liệu Nguyên Thủy (Primitive Types)

Trong Java, các kiểu dữ liệu nguyên thuỷ được lưu trữ **trực tiếp giá trị nhị phân** thay vì con trỏ tham chiếu:

| Kiểu | Kích thước | Khoảng giá trị nhị phân | Biểu diễn bộ nhớ | Giá trị mặc định |
|---|---|---|---|---|
| `byte` | 1 byte (8-bit) | $-2^7$ đến $2^7 - 1$ ($-128$ đến $127$) | Dạng bù 2 (Two's complement) | `0` |
| `short` | 2 bytes (16-bit) | $-2^{15}$ đến $2^{15} - 1$ ($-32,768$ đến $32,767$) | Dạng bù 2 | `0` |
| `int` | 4 bytes (32-bit) | $-2^{31}$ đến $2^{31} - 1$ ($pprox \pm 2.14$ tỷ) | Dạng bù 2 | `0` |
| `long` | 8 bytes (64-bit) | $-2^{63}$ đến $2^{63} - 1$ | Hậu tố `L` hoặc `l` (khuyên dùng `L`) | `0L` |
| `float` | 4 bytes (32-bit) | Chuẩn IEEE 754 đơn | 1 bit dấu, 8 bit mũ, 23 bit trị | `0.0f` |
| `double` | 8 bytes (64-bit) | Chuẩn IEEE 754 kép | 1 bit dấu, 11 bit mũ, 52 bit trị | `0.0d` |
| `char` | 2 bytes (16-bit) | $0$ đến $65,535$ | Ký tự Unicode UTF-16 code unit | `'\u0000'` |
| `boolean` | JVM quy định | `true` hoặc `false` | JVM thường dùng 1 byte hoặc int biểu diễn | `false` |

### 1.1. Cạm Bẫy Sai Số Dấu Phẩy Động & Giải Pháp `BigDecimal`
Kiểu `float` và `double` không thể biểu diễn chính xác các số thập phân hữu hạn cơ số 10 (ví dụ `0.1` hay `0.2`) do biểu diễn phân số nhị phân:
```java
System.out.println(0.1 + 0.2); // In ra: 0.30000000000000004 thay vì 0.3!
```

> **Nguyên tắc tài chính & kế toán:**  
> Tuyệt đối KHÔNG sử dụng `double` hay `float` để tính toán tiền tệ. Bắt buộc sử dụng `java.math.BigDecimal` với khởi tạo bằng chuỗi ký tự (`new BigDecimal("0.1")` hoặc `BigDecimal.valueOf(0.1)`).

---

## 2. Autoboxing, Unboxing & Cạm Bẫy `Integer Cache`

### 2.1. Cơ Chế Chuyển Đổi Tự Động
Java tự động chuyển đổi giữa kiểu nguyên thuỷ và Wrapper Object tương ứng:
- **Autoboxing:** `Integer boxed = 10;` (JVM tự gọi `Integer.valueOf(10)`).
- **Unboxing:** `int val = boxed;` (JVM tự gọi `boxed.intValue()`).

### 2.2. Bẫy NullPointerException Khi Unboxing:
```java
Integer count = null;
int result = count; // Ném ngay java.lang.NullPointerException lúc chạy!
```

### 2.3. Bẫy Bí Hiểm `Integer Cache`:
Theo đặc tả Java Language Specification (JLS), JVM có vùng đệm cache các đối tượng số nguyên trong khoảng **`-128` đến `127`**:
```java
Integer a = 100;
Integer b = 100;
System.out.println(a == b); // true (Do lấy cùng 1 instance từ IntegerCache)

Integer c = 200;
Integer d = 200;
System.out.println(c == d); // FALSE! (200 vượt ngưỡng cache, tạo 2 đối tượng riêng biệt trên Heap)
System.out.println(c.equals(d)); // true (So sánh giá trị chính xác)
```

---

## 3. Phân Tách Bộ Nhớ: Stack Frame vs Heap Space

```text
       STACK MEMORY (Thread-isolated)                 HEAP MEMORY (Shared)
  ┌────────────────────────────────────────┐       ┌────────────────────────┐
  │ Stack Frame (methodB)                  │       │                        │
  │  - Local var: int count = 5            │       │   ┌────────────────┐   │
  │  - Operand Stack                       │       │   │ Object B       │   │
  ├────────────────────────────────────────┤       │   └────────────────┘   │
  │ Stack Frame (methodA)                  │       │                        │
  │  - Local var: userRef (Địa chỉ 0x1A2F) ┼───────┼──>┌────────────────┐   │
  │                                        │       │   │ User Object    │   │
  │                                        │       │   │ (id, name...)  │   │
  └────────────────────────────────────────┘       │   └────────────────┘   │
                                                   └────────────────────────┘
```

1. **Stack Memory:**
   - Mỗi luồng có một Stack riêng biệt, không chia sẻ giữa các luồng (Thread-safe tự nhiên).
   - Tốc độ cấp phát và giải phóng cực nhanh (chỉ dịch chuyển con trỏ Stack Pointer).
   - Biến nguyên thuỷ cục bộ nằm hoàn toàn trên Stack.
2. **Heap Memory:**
   - Dùng chung cho toàn ứng dụng, nơi mọi đối tượng sinh ra qua `new` cư ngụ.
   - Garbage Collector dọn dẹp các đối tượng không còn đường đi tham chiếu (*Unreachable Objects*).

---

## 4. Làm Chủ Toán Tử Dịch Bit (Bitwise Operators)

Các toán tử bit thao tác trực tiếp trên từng bit nhị phân, là công cụ tối thượng để tối ưu hiệu năng và biểu diễn cờ trạng thái (*Bitmask*):

- `&` (AND): Bit ra 1 khi cả hai bit cùng là 1.
- `|` (OR): Bit ra 1 khi ít nhất một bit là 1.
- `^` (XOR): Bit ra 1 khi hai bit khác nhau.
- `~` (NOT / Bitwise Complement): Đảo ngược toàn bộ các bit.
- `<<` (Signed Left Shift): Dịch trái $n$ bit (tương đương nhân với $2^n$).
- `>>` (Signed Right Shift): Dịch phải $n$ bit, **giữ nguyên bit dấu**.
- `>>>` (Unsigned Right Shift): Dịch phải $n$ bit, **luôn chèn số 0 vào bit dấu** (chỉ có trong Java).

### Ứng dụng Bitmask quản lý quyền hạn (Permissions):
```java
final int READ_PERMISSION    = 1 << 0; // 0001 (1)
final int WRITE_PERMISSION   = 1 << 1; // 0010 (2)
final int EXECUTE_PERMISSION = 1 << 2; // 0100 (4)

int userPermissions = READ_PERMISSION | WRITE_PERMISSION; // 0011 (3)

// Kiểm tra quyền ghi (Write):
boolean canWrite = (userPermissions & WRITE_PERMISSION) != 0; // true
```

---

## 5. Cấu Trúc Điều Khiển Hiện Đại & Pattern Matching

### 5.1. Switch Expression với cú pháp Arrow (`->`)
Không cần lệnh `break`, không lo lỗi trôi code (*fall-through*), và có thể trả về giá trị:

```java
public enum Status { PENDING, PROCESSING, COMPLETED, REJECTED }

String message = switch (status) {
    case PENDING -> "Đơn hàng đang chờ duyệt";
    case PROCESSING -> "Đang xử lý đóng gói";
    case COMPLETED -> "Giao hàng thành công";
    case REJECTED -> {
        log.warn("Đơn hàng bị từ chối!");
        yield "Đơn hàng thất bại";
    }
};
```

### 5.2. Nhãn Điều Khiển Vòng Lặp Lồng Nhau (Labeled Break / Continue)
Khi có nhiều vòng lặp lồng nhau, nhãn (*Label*) cho phép nhảy thẳng ra khỏi vòng lặp ngoài:

```java
searchLoop:
for (int i = 0; i < matrix.length; i++) {
    for (int j = 0; j < matrix[i].length; j++) {
        if (matrix[i][j] == target) {
            System.out.printf("Tìm thấy tại [%d, %d]%n", i, j);
            break searchLoop; // Thoát lập tức cả 2 vòng lặp!
        }
    }
}
```

---

## 6. Tổng Kết

Hiểu thấu đáo về biểu diễn nhị phân, cơ chế phân bổ Stack/Heap và cạm bẫy Autoboxing giúp bạn không chỉ viết code đúng mà còn đạt hiệu năng tối ưu cấp độ phần cứng. Hãy cùng thử thách với 20 câu hỏi trắc nghiệm dưới đây!