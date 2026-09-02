# MASTER QUESTION BANK: OCP Java SE 25 (1Z0-831)

> [!IMPORTANT]
> Tài liệu này chứa các câu hỏi trắc nghiệm cực khó mô phỏng kỳ thi OCP Java SE 25 (1Z0-831), bao gồm các tính năng mới nhất từ Java 22 đến 25 (JEP 485, Flexible Constructors, Module Imports, Scoped Values, Virtual Threads, Pattern Matching). Do giới hạn hệ thống, đây là cấu trúc mẫu tập trung vào các khái niệm khó nhất.

---

## PHẦN 1: CÂU HỎI (QUESTIONS)

### Section 1: Java Fundamentals, Operators, Type Promotion, Memory & String Internals

**Câu 1:** Xem xét đoạn mã sau:
```java
public class StringInternals {
    public static void main(String[] args) {
        String s1 = "Java25";
        String s2 = "Java" + 25;
        String s3 = new String("Java25").intern();
        String s4 = """
                    Java25\
                    """;
        System.out.println((s1 == s2) + " " + (s2 == s3) + " " + (s3 == s4));
    }
}
```
**Choose ONE:**
A. true true true
B. false false true
C. true false true
D. false true false
E. Compile error

**Câu 2:** Chuyện gì xảy ra khi thực thi đoạn mã sau?
```java
public class TypePromotion {
    public static void main(String[] args) {
        final byte b1 = 10;
        final byte b2 = 20;
        byte b3 = b1 + b2;
        var result = (b1 == 10) ? b1 : 20.0;
        System.out.println(((Object)result).getClass().getName() + " " + b3);
    }
}
```
**Choose ONE:**
A. java.lang.Byte 30
B. java.lang.Double 30
C. java.lang.Double 30.0
D. Compile error tại dòng `byte b3 = b1 + b2;`
E. Compile error tại dòng `var result = ...`

**Câu 3:** Mã nào dưới đây hợp lệ với Unnamed Variables (JEP 456 / Java 22+)?
```java
// 1
try {
    int _ = Integer.parseInt("abc");
} catch (NumberFormatException _) { }

// 2
int _ = 5;
System.out.println(_);

// 3
for (int _ = 0; _ < 10; _++) {}
```
**Choose ONE:**
A. Chỉ 1
B. 1 và 2
C. 1 và 3
D. 2 và 3
E. Tất cả đều không hợp lệ

**Câu 4:** Toán tử `==` và Float/Double `NaN`:
```java
public class NaNCheck {
    public static void main(String[] args) {
        double d1 = Double.NaN;
        double d2 = Double.NaN;
        System.out.println((d1 == d2) + " " + Double.compare(d1, d2));
    }
}
```
**Choose ONE:**
A. true 0
B. false 0
C. false -1
D. false 1
E. true 1

**Câu 5:** Garbage Collection & JVM Memory: Khi một đối tượng String được tạo qua `new String("OCP")`, đối tượng được cấp phát ở đâu?
**Choose ONE:**
A. Stack
B. String Pool (Method Area/Metaspace)
C. Eden space của Heap, và "OCP" literal nằm trong String Pool.
D. Tenured Generation

### Section 2: Advanced OOP, Constructors, Flexible Constructor Bodies

**Câu 6:** Flexible Constructor Bodies (JEP 482 / Java 23+):
```java
public class Base {
    public Base(int x) { System.out.print("Base" + x); }
}
public class Sub extends Base {
    public Sub(int y) {
        int z = y * 2;
        super(z);
        System.out.print("Sub" + z);
    }
    public static void main(String[] args) { new Sub(5); }
}
```
**Choose ONE:**
A. Base10Sub10
B. Sub10Base10
C. Compile Error ở dòng `int z = y * 2;`
D. Compile Error ở `super(z)`

**Câu 7:** Records và Compact Constructor:
```java
public record Point(int x, int y) {
    public Point {
        if (x < 0) x = 0;
        this.y = y + 1; // 1
    }
}
```
**Choose ONE:**
A. Compile error ở (1)
B. Chạy bình thường, y được gán y + 1
C. Cần phải gán `this.x = x`

**Câu 8:** Sealed Classes:
```java
public sealed class A permits B, C {}
final class B extends A {}
non-sealed class C extends A {}
class D extends C {}
class E extends A {}
```
Khai báo nào lỗi?
**Choose ONE:**
A. final class B
B. non-sealed class C
C. class D
D. class E

### Section 3: Pattern Matching, Switch Expressions, Dominance

**Câu 9:** Pattern Matching cho Switch (JEP 441):
```java
Object obj = "Java";
String res = switch(obj) {
    case String s when s.length() > 5 -> "Long String";
    case String s -> "Short String";
    default -> "Unknown";
};
```
**Choose ONE:**
A. Short String
B. Long String
C. Compile error do sử dụng từ khoá `when` (Java 21+)
D. Compile error do default không cần thiết.

**Câu 10:** Dominance rule trong Switch:
```java
Object obj = 10;
switch(obj) {
    case CharSequence c -> {}
    case String s -> {}
    default -> {}
}
```
**Choose ONE:**
A. Hợp lệ
B. Compile error tại `case String s` vì bị chi phối (dominated) bởi `CharSequence c`.
C. Hợp lệ nhưng sẽ không bao giờ vào `String`.

---

## PHẦN 2: GIẢI THÍCH CHI TIẾT (EXPLANATIONS)

### Section 1 Explanations

> [!TIP]
> String Interning and Type Promotion frequently appear in the real 1Z0-831 exam. Understand constant expressions!

**Câu 1:**
- **Correct Answer: A (true true true)**
- **Phân tích:**
  - `s1 = "Java25"`: literal vào String Pool.
  - `s2 = "Java" + 25`: Hằng số biên dịch, được compiler gộp thành `"Java25"` và trỏ tới cùng 1 pool reference. Do đó `s1 == s2` là **true**.
  - `s3 = new String("Java25").intern()`: `.intern()` sẽ tìm kiếm `"Java25"` trong pool, và trả về reference của nó. Do đó `s2 == s3` là **true**.
  - `s4 = """Java25\""";`: Text block, kết thúc bởi `\` để tránh ký tự newline. Nó biên dịch thành `"Java25"`. `s3 == s4` là **true**.

**Câu 2:**
- **Correct Answer: B (java.lang.Double 30)**
- **Phân tích:**
  - `b1` và `b2` là `final byte` và giá trị biên dịch được, nên `b1 + b2` được ngầm định cast về `byte` (constant expression). `byte b3` hợp lệ. (Không bị lỗi cast từ int sang byte).
  - Biểu thức điều kiện `(b1 == 10) ? b1 : 20.0`: Khi trộn `byte` (b1) và `double` (20.0), type promotion của Ternary operator nâng toàn bộ biểu thức lên `double`. Vì vậy `result` mang giá trị `10.0` và kiểu `Double`. `System.out.println` sẽ in ra `java.lang.Double 30`.

**Câu 3:**
- **Correct Answer: A (Chỉ 1)**
- **Phân tích:**
  - `_` là Unnamed Variable (JEP 456). Nó chỉ được dùng khi khởi tạo biến và không thể được truy cập (không thể `System.out.println(_)` hoặc dùng `_ < 10`). Vì thế, đoạn mã 2 và 3 lỗi compile do cố gắng đọc giá trị của `_`. Đoạn 1 hợp lệ (catch parameter không sử dụng).

**Câu 4:**
- **Correct Answer: B (false 0)**
- **Phân tích:**
  - Theo chuẩn IEEE 754, `NaN == NaN` luôn là **false**.
  - Tuy nhiên, phương thức `Double.compare(NaN, NaN)` được thiết kế để sắp xếp, nên nó coi `NaN` bằng `NaN` và trả về **0**.

**Câu 5:**
- **Correct Answer: C**
- **Phân tích:** `new String("OCP")` tạo 2 đối tượng: Literal `"OCP"` được lưu trong String Pool (Method Area / Metaspace tùy phiên bản JVM nhưng thuộc non-heap class data / heap intern), và một đối tượng `String` được cấp phát ở Eden space trên Heap.

### Section 2 Explanations

**Câu 6:**
- **Correct Answer: A (Base10Sub10)**
- **Phân tích:** JEP 482 (Flexible Constructor Bodies) trong Java 23+ cho phép thực hiện các đoạn mã (không tham chiếu đến `this`) TRƯỚC `super(...)`. `int z = y * 2` (10) thực thi trước, sau đó gọi `super(10)` in "Base10", rồi in "Sub10".

**Câu 7:**
- **Correct Answer: A (Compile error ở (1))**
- **Phân tích:** Compact constructor của Record không được phép gán tường minh cho `this.y`. Việc gán giá trị phải được thực hiện bằng cách thay đổi giá trị của tham số cục bộ (`y = y + 1`), compiler sẽ tự động thực hiện gán `this.y = y` ở cuối khối.

**Câu 8:**
- **Correct Answer: D (class E)**
- **Phân tích:** Class E kế thừa A nhưng không nằm trong danh sách `permits B, C` của lớp A. Điều này vi phạm quy tắc của Sealed Classes.

### Section 3 Explanations

**Câu 9:**
- **Correct Answer: A (Short String)**
- **Phân tích:** `obj` là `"Java"` có length = 4. Nó không khớp với guard condition `when s.length() > 5`, do đó nó sẽ xuống case tiếp theo `case String s` và trả về "Short String".

**Câu 10:**
- **Correct Answer: B**
- **Phân tích:** Trong pattern matching switch, một case cụ thể hơn phải xuất hiện trước case tổng quát. `String` là subclass của `CharSequence`. Vì `CharSequence` xử lý trước, case `String` sẽ không bao giờ đạt tới, gây ra lỗi compile-time: **Dominance rule error**.
