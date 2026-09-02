---
title: "Phase 1: Nền tảng Java (Java Fundamentals) - Luyện thi OCP Java SE 25 (1Z0-831)"
icon: "🧱"
order: 3
phase: "Phase 1"
tags: ["Primitives", "String Pool", "var", "Switch", "Stack Memory"]
---
# Phase 1: Nền tảng Java (Java Fundamentals) - Luyện thi OCP Java SE 25 (1Z0-831)

Tài liệu này bao gồm các kiến thức nền tảng của Java, được thiết kế đặc biệt để giúp bạn vượt qua kỳ thi OCP Java SE 25. Trọng tâm sẽ là các chi tiết kỹ thuật, các trường hợp ngoại lệ (edge cases) và các "bẫy" thường gặp trong bài thi.

---

## 1.1 Các kiểu dữ liệu nguyên thủy (Primitive Data Types) & Wrapper Classes

Java có 8 kiểu dữ liệu nguyên thủy. Hãy nhớ kỹ kích thước và phạm vi của chúng:

| Kiểu | Kích thước | Ký tự mặc định | Giá trị mặc định |
|---|---|---|---|
| `boolean` | Không xác định chính xác | N/A | `false` |
| `byte` | 8-bit | N/A | `0` |
| `short` | 16-bit | N/A | `0` |
| `char` | 16-bit | N/A (Unsigned) | `'\u0000'` |
| `int` | 32-bit | N/A | `0` |
| `long` | 64-bit | `L` hoặc `l` | `0L` |
| `float` | 32-bit | `F` hoặc `f` | `0.0f` |
| `double` | 64-bit | `D` hoặc `d` (tùy chọn) | `0.0d` |

### Literals (Giá trị hằng)
Bạn có thể biểu diễn số nguyên ở nhiều hệ cơ số:
- **Binary (Nhị phân):** Bắt đầu bằng `0b` hoặc `0B` (VD: `0b1010`)
- **Octal (Bát phân):** Bắt đầu bằng `0` (VD: `012` = 10 trong hệ thập phân)
- **Hexadecimal (Thập lục phân):** Bắt đầu bằng `0x` hoặc `0X` (VD: `0xA`)
- **Underscores (Dấu gạch dưới):** Dùng để dễ đọc (VD: `1_000_000`).

> [!WARNING]
> **BẪY:** Không được đặt dấu gạch dưới ở đầu, cuối một số, hoặc liền kề với dấu thập phân (`.`), hoặc liền kề với tiền tố hệ cơ số (`0x`, `0b`).
> Ví dụ LỖI: `_100`, `100_`, `3._14`, `0x_A`.

### Wrapper Classes, Autoboxing/Unboxing và Integer Caching
Autoboxing tự động chuyển đổi kiểu nguyên thủy sang Wrapper (VD: `int` -> `Integer`). Unboxing thì ngược lại.

> [!IMPORTANT]
> **Integer Caching:** Java cache các đối tượng `Integer` trong khoảng từ **-128 đến 127**.

```java
Integer a = 127;
Integer b = 127;
System.out.println(a == b); // true (vì nằm trong cache)

Integer c = 128;
Integer d = 128;
System.out.println(c == d); // false (tạo object mới)
System.out.println(c.equals(d)); // true (so sánh giá trị)
```

> [!WARNING]
> **BẪY Unboxing:** Cẩn thận với `NullPointerException` khi unbox một Wrapper có giá trị `null`.
> ```java
> Integer val = null;
> int primitive = val; // Ném NullPointerException tại runtime
> ```

---

## 1.2 Ép kiểu (Type Casting)

### Widening (Ép kiểu ngầm định - Implicit)
Chuyển từ kiểu nhỏ sang kiểu lớn hơn (VD: `int` -> `long`). Java tự động thực hiện.
`byte -> short -> int -> long -> float -> double` (`char` cũng có thể implicit sang `int`).

### Narrowing (Ép kiểu tường minh - Explicit)
Chuyển từ kiểu lớn sang kiểu nhỏ, có nguy cơ mất mát dữ liệu hoặc tràn số (overflow). Bắt buộc phải ép kiểu.

```java
long l = 1000L;
int i = (int) l;
```

> [!CAUTION]
> **Toán tử gán phức hợp (Compound Assignment Operators):** Các toán tử như `+=`, `-=`, `*=` tự động thực hiện ép kiểu tường minh ngầm!
> ```java
> short s = 10;
> s = s + 5; // LỖI BIÊN DỊCH: s + 5 trả về int, không thể gán trực tiếp cho short
> s += 5;    // HỢP LỆ: Tương đương với s = (short)(s + 5)
> ```

---

## 1.3 String, StringBuilder, Text Blocks

### String Immutability và String Pool
`String` trong Java là bất biến (immutable). String literals được lưu trong String Pool.

```java
String s1 = "hello";
String s2 = "hello";
String s3 = new String("hello");

System.out.println(s1 == s2);      // true (cùng tham chiếu trong Pool)
System.out.println(s1 == s3);      // false (s3 là object mới trên Heap)
System.out.println(s1.intern() == s3.intern()); // true
```

### Các method quan trọng của String
- `strip()`, `trim()`: Loại bỏ khoảng trắng. `strip()` sử dụng định nghĩa Unicode chuẩn hơn so với `trim()`.
- `indent(int n)`: Thêm hoặc bớt thụt lề.
- `isBlank()` vs `isEmpty()`.

### StringBuilder
Mutable, không an toàn luồng (thread-safe) (dùng `StringBuffer` nếu cần thread-safe).

```java
StringBuilder sb = new StringBuilder("Java");
sb.append(" 25").reverse(); // "52 avaJ"
```

### Text Blocks (Java 15+)
Sử dụng `"""` để khai báo String nhiều dòng.

```java
String html = """
        <html>
            <body>
                <p>Hello</p>
            </body>
        </html>"""; 
```
- **Thụt lề:** Khoảng trắng chung ở đầu các dòng sẽ bị tự động loại bỏ (incidental whitespace).
- Vị trí đóng `"""` quyết định khoảng trắng phía sau cuối cùng.
- Ký tự `\` ở cuối dòng giúp nối dòng tiếp theo thành một dòng duy nhất.
- Ký tự `\s` đại diện cho một khoảng trắng tường minh (ngăn chặn việc cắt bỏ khoảng trắng thừa ở cuối dòng).

---

## 1.4 `var` (Local Variable Type Inference)

`var` cho phép compiler suy luận kiểu dữ liệu. Chỉ áp dụng cho **biến cục bộ**.

> [!WARNING]
> **BẪY - Nơi KHÔNG thể dùng `var`:**
> - Khai báo trường (fields/instance variables) trong class
> - Tham số của phương thức hoặc hàm tạo
> - Kiểu trả về của phương thức
> - Khai báo biến mà không khởi tạo ngay (VD: `var x; x = 10;` -> Lỗi biên dịch)
> - Khởi tạo với `null` (VD: `var x = null;` -> Lỗi biên dịch)
> - Gán trực tiếp một mảng mà không có từ khóa `new` (VD: `var arr = {1, 2, 3};` -> Lỗi, phải là `var arr = new int[]{1, 2, 3};`)

```java
var map = new HashMap<String, Integer>(); // Hợp lệ, map là HashMap<String, Integer>
var list = new ArrayList<>(); // Hợp lệ, nhưng list là ArrayList<Object>
var lambda = (String s) -> s.length(); // Lỗi biên dịch! var không thể suy luận trực tiếp lambda
```

---

## 1.5 Toán tử (Operators)

### Short-circuit vs Non-short-circuit
- `&&` và `||`: Short-circuit (ngắt đoản mạch) - Nếu phần bên trái đã đủ quyết định kết quả, phần bên phải sẽ KHÔNG được thực thi.
- `&` và `|`: Luôn luôn thực thi cả hai bên.

```java
int x = 0;
boolean a = (x > 0) && (++x > 0); 
System.out.println(x); // In ra 0 vì ++x không chạy

int y = 0;
boolean b = (y > 0) & (++y > 0);
System.out.println(y); // In ra 1 vì ++y được thực thi
```

### `instanceof` Pattern Matching
Tránh ép kiểu thừa thãi.
```java
Object obj = "Java 25";
if (obj instanceof String s && s.length() > 5) {
    System.out.println(s.toUpperCase()); // s được định nghĩa và dùng ngay!
}
```

---

## 1.6 Điều khiển luồng (Control Flow)

### `switch` Expression và Pattern Matching (Java 21+)
`switch` hiện tại có thể trả về giá trị (Expression) và hỗ trợ cú pháp mũi tên `->`.

```java
int day = 3;
String type = switch (day) {
    case 1, 2, 3, 4, 5 -> "Weekday";
    case 6, 7 -> "Weekend";
    default -> {
        System.out.println("Invalid");
        yield "Unknown"; // Dùng yield thay cho return để trả về giá trị trong block
    }
};
```

> [!IMPORTANT]
> `switch` Expression bắt buộc phải bao quát TẤT CẢ các trường hợp (exhaustive). Bạn gần như luôn cần `default` trừ khi dùng `enum` hoặc `sealed classes`.

### Pattern Matching for switch (Java 21+) với `when` guard
```java
Object obj = 120;
String msg = switch(obj) {
    case Integer i when i > 100 -> "Large integer";
    case Integer i -> "Small integer";
    case String s -> "String";
    default -> "Unknown";
};
```

### Unreachable Code
Mã không thể đạt tới sẽ gây lỗi biên dịch.
```java
while (false) { 
    System.out.println("Hi"); // Lỗi biên dịch: Unreachable code
}
```

---

# Practice Quiz

**Câu 1:** Xem xét đoạn mã sau:
```java
int val = 012;
System.out.println(val);
```
Kết quả in ra là gì?
A) 12
B) 012
C) 10
D) Lỗi biên dịch

**Câu 2:** Biểu thức nào sau đây gây lỗi biên dịch? (Chọn HAI)
A) `long x = 10; int y = 2 * (int)x;`
B) `short s = 5; s = s * 2;`
C) `float f = 3.14;`
D) `double d = 3.14f;`
E) `char c = 65;`

**Câu 3:** Đoạn mã sau có kết quả gì?
```java
Integer a = 100;
Integer b = 100;
Integer c = 500;
Integer d = 500;
System.out.println((a == b) + " " + (c == d));
```
A) true true
B) false false
C) true false
D) false true

**Câu 4:** Dòng nào sau đây khởi tạo biến bằng `var` hợp lệ? (Chọn HAI)
A) `var name = null;`
B) `var list = new ArrayList<String>();`
C) `var nums = {1, 2, 3};`
D) `var text = """
    Hello
    """;`
E) `var x = 10, y = 20;`

**Câu 5:** Kết quả của đoạn mã sau?
```java
String s1 = "Java";
s1.concat(" 25");
s1.toUpperCase();
System.out.println(s1);
```
A) Java
B) Java 25
C) JAVA
D) JAVA 25

**Câu 6:** Khai báo số nguyên nào sau đây hợp lệ?
A) `int a = _1000;`
B) `int b = 10_00.00_0;`
C) `int c = 1_000_000;`
D) `int d = 1000_;`

**Câu 7:** Xem xét đoạn mã sau.
```java
int a = 5;
int b = 10;
boolean result = (a++ > 5) && (++b > 10);
System.out.println(a + " " + b);
```
Kết quả in ra là gì?
A) 6 11
B) 6 10
C) 5 10
D) 5 11

**Câu 8:** Cú pháp `switch` nào sau đây hợp lệ trong Java 21+?
```java
int x = 2;
int y = switch (x) {
    case 1 -> 10;
    case 2 -> { yield 20; }
    default -> 30;
};
```
A) Hợp lệ, `y` nhận giá trị 20.
B) Lỗi biên dịch ở `yield 20;`.
C) Lỗi biên dịch vì thiếu `break;`.
D) Lỗi biên dịch ở mũi tên `->`.

**Câu 9:** Chuyện gì xảy ra với đoạn mã sau?
```java
Object obj = "Hello";
if (obj instanceof String s && s.length() > 3) {
    System.out.println(s.substring(1));
} else {
    System.out.println(s);
}
```
A) In ra "ello"
B) In ra "Hello"
C) Lỗi biên dịch
D) Ném ngoại lệ RuntimeException

**Câu 10:** Cho đoạn mã sau:
```java
StringBuilder sb = new StringBuilder("123");
sb.append("45").reverse().delete(1, 3);
System.out.println(sb);
```
Kết quả in ra là gì?
A) 521
B) 543
C) 541
D) 12345

**Câu 11:** Khai báo Text Block nào sau đây bị LỖI biên dịch?
A)
```java
String a = """
  hello""";
```
B)
```java
String b = """hello
""";
```
C)
```java
String c = """
    hello \
    world""";
```
D)
```java
String d = """
    """;
```

**Câu 12:** Vòng lặp nào sau đây là vòng lặp vô hạn hợp lệ? (Chọn HAI)
A) `for(;;) {}`
B) `while() {}`
C) `do {} while (true);`
D) `for(int i=0; i<10;) {}`

**Câu 13:** Đoạn mã sau in ra gì?
```java
int x = 10;
long y = 10L;
System.out.println(x == y);
```
A) true
B) false
C) Lỗi biên dịch vì khác kiểu
D) Ném ngoại lệ

**Câu 14:** Khi sử dụng Pattern Matching for switch (Java 21+), nguyên tắc thứ tự các case là gì?
A) Không quan trọng thứ tự.
B) Các case hẹp (ràng buộc nhiều hơn) phải đứng TRƯỚC các case rộng hơn.
C) Các case rộng hơn phải đứng trước các case hẹp.
D) Các case phải sắp xếp theo thứ tự bảng chữ cái của tên lớp.

**Câu 15:** Đoạn mã sau in ra gì?
```java
Integer x = null;
if (x > 0) {
    System.out.println("Positive");
} else {
    System.out.println("Not positive");
}
```
A) Positive
B) Not positive
C) Lỗi biên dịch
D) Ném NullPointerException tại runtime

---

# Đáp án và giải thích

1. **C** - `012` bắt đầu bằng `0` nên là hệ bát phân (octal). 1*8^1 + 2*8^0 = 8 + 2 = 10.
2. **B, C** - (B) `s * 2` trả về `int`, không thể gán lại cho `short` nếu không ép kiểu hoặc dùng `*=`. (C) `3.14` mặc định là `double`, không thể gán cho `float` mà không có hậu tố `f`.
3. **C** - Cache của `Integer` chỉ lưu giá trị từ -128 đến 127. 100 nằm trong khoảng này nên cùng tham chiếu (`a == b` là true). 500 nằm ngoài, tạo 2 object mới (`c == d` là false).
4. **B, D** - (A) Không thể gán null cho `var`. (C) Cần `new int[]{1,2,3}`. (E) Không thể khai báo nhiều biến trên một dòng với `var`.
5. **A** - `String` là bất biến. Các phương thức `concat` và `toUpperCase` trả về một chuỗi mới, nhưng không được gán lại cho `s1`. Giá trị `s1` vẫn là "Java".
6. **C** - Dấu gạch dưới ở đầu (A), ở cuối (D), và trong số thập phân nhưng khai báo là int (B) đều lỗi. C hợp lệ.
7. **B** - Toán tử `&&` bị short-circuit. `a++` trả về 5, so sánh `5 > 5` là false. Do đó vế sau `++b > 10` KHÔNG ĐƯỢC CHẠY. `a` tăng lên 6, `b` giữ nguyên 10.
8. **A** - Cú pháp hoàn toàn hợp lệ. Khi dùng khối `{}` trong switch expression, phải dùng `yield` để trả về giá trị thay vì `return`.
9. **C** - Lỗi biên dịch ở khối `else`. Biến `s` được tạo ra trong câu lệnh `if` do Pattern Matching, nhưng theo quy tắc scoping (phạm vi), nó chỉ tồn tại trong nhánh mà điều kiện đúng (khối `if`). Trong `else`, `s` không tồn tại.
10. **A** - Ban đầu "123". Sau `append` -> "12345". Sau `reverse()` -> "54321". `delete(1, 3)` xóa ký tự ở index 1 và 2 ('4' và '3'). Kết quả còn "521".
11. **B** - Mở block `"""` bắt buộc phải được theo sau ngay lập tức bởi một dòng mới (newline). Không thể có ký tự nào cùng dòng với `"""` mở (ngoại trừ khoảng trắng có thể bỏ qua).
12. **A, C** - (B) `while()` thiếu điều kiện là lỗi cú pháp. (D) không lặp vô hạn vì điều kiện `i<10` sẽ kết thúc nếu i được thay đổi trong thân. A và C là cú pháp hợp lệ cho lặp vô hạn.
13. **A** - Toán tử `==` tự động gán kiểu mở rộng (widening) `x` thành `long` để so sánh với `y`. `10L == 10L` trả về `true`.
14. **B** - Switch pattern matching yêu cầu "Dominance checking". Các case chung chung (như `Object` hoặc `Integer i`) phải để ở dưới cùng. Nếu để case chung lên trước, các case hẹp hơn bên dưới sẽ thành "Unreachable code" và gây lỗi biên dịch.
15. **D** - Cố gắng so sánh `x > 0`. `x` là một `Integer` và có giá trị `null`. Để thực hiện so sánh số học `>`, Java sẽ tự động unbox `x` thành `int`. Việc gọi unboxing trên một đối tượng `null` ném ra `NullPointerException`.
