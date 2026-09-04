---
title: "Lập Trình Hướng Đối Tượng (OOP) Chuyên Sâu Trong Java"
description: Chuyên khảo bách khoa toàn thư về OOP trong Java: vtable & Dynamic Dispatch dưới góc nhìn JVM bytecode, thứ tự khởi tạo đối tượng, phân giải xung đột default method trong Interface, Sealed Classes (Java 17) và nguyên tắc Composition over Inheritance.
order: 1
featured: true
tags: [Java, OOP, Inheritance, Polymorphism, Interface, Sealed-Classes, Bytecode, vtable]
readingMinutes: 28
---

# Lập Trình Hướng Đối Tượng (OOP) Chuyên Sâu Trong Java

Lập trình hướng đối tượng (OOP) không đơn thuần là gom nhóm biến và hàm vào một class. Trong Java, OOP gắn liền với cách máy ảo JVM định vị bảng phương thức ảo (*vtable*), thực hiện phân phối đa hình thời gian chạy (*Dynamic Dispatch*) và tối ưu hóa mã máy.

---

## 1. Bốn Trụ Cột OOP Dưới Góc Nhìn Kỹ Thuật

### 1.1. Tính Đóng Gói (Encapsulation) & Information Hiding
Encapsulation không chỉ là viết `private` kèm `get/set`. Nó là việc bảo vệ tính toàn vẹn của **Bất biến trạng thái (Class Invariants)**:

```java
public class BankAccount {
    private BigDecimal balance; // Ẩn giấu tuyệt đối trạng thái

    public BankAccount(BigDecimal initialBalance) {
        if (initialBalance == null || initialBalance.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Số dư khởi tạo không được âm!");
        }
        this.balance = initialBalance;
    }

    public void withdraw(BigDecimal amount) {
        // Kiểm soát tính hợp lệ trước khi biến đổi trạng thái
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Số tiền rút phải lớn hơn 0");
        }
        if (balance.compareTo(amount) < 0) {
            throw new InsufficientFundsException("Số dư không đủ để thực hiện giao dịch");
        }
        this.balance = this.balance.subtract(amount);
    }
}
```

### 1.2. Tính Kế Thừa (Inheritance) & Hiểm Hoạ "Fragile Base Class"
Kế thừa biểu diễn quan hệ **IS-A**. Tuy nhiên, lạm dụng kế thừa dẫn đến phụ thuộc chặt chẽ giữa lớp con và cấu trúc nội bộ của lớp cha (*Fragile Base Class problem*).

> **Nguyên tắc vàng của Gang of Four (GoF):**  
> *"Favor object composition over class inheritance"* (Ưu tiên bao hàm đối tượng hơn là kế thừa class).

### 1.3. Tính Đa Hình (Polymorphism) & JVM Dynamic Method Dispatch
Đa hình là khả năng một lời gọi phương thức thực thi hành vi khác nhau dựa trên kiểu thực tế của đối tượng lúc chạy (*Runtime Dynamic Binding*).

#### Cách JVM thực thi đa hình qua vtable (Virtual Method Table):
Mỗi Class có một bảng `vtable` chứa con trỏ tới địa chỉ bộ nhớ của các phương thức. Khi lớp con ghi đè phương thức, vị trí con trỏ tương ứng trong `vtable` sẽ được trỏ tới địa chỉ code của lớp con:
- `invokevirtual`: Gọi phương thức đối tượng (sử dụng tra cứu vtable để quyết định đa hình lúc runtime).
- `invokestatic`: Gọi static method (quyết định tĩnh lúc compile-time, không có đa hình).
- `invokespecial`: Gọi private method, constructor (`<init>`) hoặc `super.method()`.
- `invokeinterface`: Gọi phương thức thông qua interface (sử dụng bảng `itable`).

---

## 2. Thứ Tự Khởi Tạo Đối Tượng Toàn Diện (Initialization Order)

Một trong những câu hỏi phỏng vấn hóc búa nhất là thứ tự thực thi khi khởi tạo một đối tượng:

```text
┌────────────────────────────────────────────────────────────────────────┐
│ 1. Nạp Class cha: Khối static và biến static của lớp cha               │
│ 2. Nạp Class con: Khối static và biến static của lớp con               │
│ 3. Khối khởi tạo instance { ... } và biến instance của lớp cha         │
│ 4. Constructor của lớp cha                                             │
│ 5. Khối khởi tạo instance { ... } và biến instance của lớp con         │
│ 6. Constructor của lớp con                                             │
└────────────────────────────────────────────────────────────────────────┘
```

Ví dụ minh chứng:
```java
class Base {
    static { System.out.print("1"); }
    { System.out.print("3"); }
    Base() { System.out.print("4"); }
}

class Derived extends Base {
    static { System.out.print("2"); }
    { System.out.print("5"); }
    Derived() { System.out.print("6"); }
}

// Khi gọi: new Derived();
// Đầu ra chính xác là: 123456
```

---

## 3. Abstract Class vs Interface Hiện Đại

Kể từ Java 8 và Java 9, Interface đã có bước tiến hoá vượt bậc:

| Đặc tính | Abstract Class | Interface (Java 9+) |
|---|---|---|
| **Từ khoá kế thừa** | `extends` (Chỉ đơn kế thừa) | `implements` (Đa kế thừa hành vi) |
| **Instance Variables** | Chứa bất kỳ biến nào có trạng thái | CHỈ chứa hằng số `public static final` |
| **Constructor** | Có thể có constructor để lớp con gọi `super()` | Không thể có constructor |
| **Phương thức có thân hàm** | Mặc định có thể viết thân hàm | `default` method, `static` method, `private` method (Java 9) |
| **Triết lý thiết kế** | Định nghĩa bản chất danh tính (*Identity - Is-A*) | Định nghĩa hợp đồng hành vi (*Contract / Capability - Can-Do*) |

### Giải Quyết Xung Đột Default Method (Diamond Problem trong Interface):
Nếu một class cài đặt 2 interface cùng có một `default` method trùng tên và tham số, trình biên dịch sẽ **báo lỗi bắt buộc ghi đè tường minh**:

```java
interface Left {
    default void print() { System.out.println("Left"); }
}

interface Right {
    default void print() { System.out.println("Right"); }
}

class Child implements Left, Right {
    @Override
    public void print() {
        // Chỉ định rõ ràng gọi default method của Left
        Left.super.print();
    }
}
```

---

## 4. Sealed Classes & Interfaces (Java 17 LTS)

Trước Java 17, để ngăn chặn người khác kế thừa một class, bạn chỉ có 2 lựa chọn cực đoan:
1. Đặt `final`: Cấm hoàn toàn mọi lớp kế thừa.
2. Đặt `package-private`: Chỉ cho phép trong cùng package.

**Sealed Classes** cho phép mở quyền kế thừa nhưng **giới hạn chính xác danh sách các lớp được uỷ quyền** thông qua từ khoá `permits`:

```java
public sealed interface PaymentMethod permits CreditCard, BankTransfer, CryptoWallet {}

public final class CreditCard implements PaymentMethod { ... }
public final class BankTransfer implements PaymentMethod { ... }
public non-sealed class CryptoWallet implements PaymentMethod { ... }
```

- Lớp con của Sealed class bắt buộc phải là một trong ba loại:
  - `final`: Chặn kế thừa tiếp theo.
  - `sealed`: Tiếp tục đóng kín cây kế thừa phía sau.
  - `non-sealed`: Mở tự do cho các lớp khác kế thừa.

---

## 5. Tổng Kết

Hiểu rõ từ vtable bytecode đến nguyên tắc thiết kế Interface và Sealed Classes giúp bạn xây dựng những hệ thống có kiến trúc mạch lạc, chuẩn mực và sẵn sàng cho các bài kiểm tra chứng chỉ quốc tế. Hãy cùng kiểm tra trình độ với 20 câu hỏi quiz nâng cao dưới đây!