---
title: "Giai đoạn 1 — Nền tảng ngôn ngữ Java 25 (Tuần 1–6)"
order: 3
phase: "Phase 1"
tags: ["Primitives", "String Pool", "var", "Switch", "Stack Memory"]
---
# Giai đoạn 1 — Nền tảng ngôn ngữ Java 25 (Tuần 1–6)

> Mọi output trong tài liệu này đã được chạy thử để xác minh, trừ các mục ghi rõ **[Java 25]** (môi trường kiểm thử chạy JDK 21 — bạn tự chạy lại trên JDK 25).

**Cách dùng:** đọc lý thuyết ở Phần A → gõ lại code bằng tay → làm bài tập Phần B mà **không xem đáp án** → đối chiếu Phần C → ghi mọi câu sai vào `gotchas.md`.

---

# PHẦN A — LÝ THUYẾT & CODE MINH HOẠ

## Module 1.1 — Kiểu dữ liệu, wrapper, Math, `var`

### 8 kiểu nguyên thuỷ

| Kiểu | Bit | Khoảng giá trị | Mặc định |
|---|---|---|---|
| `byte` | 8 | −128 … 127 | 0 |
| `short` | 16 | −32.768 … 32.767 | 0 |
| `int` | 32 | ≈ ±2,1 tỷ | 0 |
| `long` | 64 | ≈ ±9,2 × 10¹⁸ | 0L |
| `float` | 32 | ~7 chữ số | 0.0f |
| `double` | 64 | ~15 chữ số | 0.0d |
| `char` | 16 | 0 … 65.535 (không dấu) | '\u0000' |
| `boolean` | — | true/false | false |

Biến **local** không có giá trị mặc định — bắt buộc gán trước khi dùng, nếu không là lỗi biên dịch.

### Literal

```java
int decimal = 1_000_000;     // dấu _ để đọc dễ, không ở đầu/cuối/cạnh dấu chấm
int binary  = 0b1010;        // 10
int octal   = 017;           // 15  (số 0 đứng đầu = bát phân!)
int hex     = 0xFF;          // 255
long big    = 10_000_000_000L;  // thiếu L -> lỗi biên dịch
float f     = 3.14f;         // thiếu f -> lỗi (double không tự thu hẹp)
```

### Nâng cấp kiểu tự động (numeric promotion)

Quy tắc: mọi phép toán số học trên `byte`, `short`, `char` đều được nâng lên `int` trước.

```java
byte a = 1, b = 2;
byte c = a + b;      // LỖI: a + b là int
byte d = (byte)(a + b);  // OK
char ch = 'a';
System.out.println(ch + 1);      // 98  (int, không phải 'b')
System.out.println("" + ch + 1); // a1  (nối chuỗi)
```

**Toán tử gán ghép chứa ép kiểu ngầm** — đây là bẫy kinh điển:

```java
byte b = 10;
b += 300;            // COMPILE OK, tương đương b = (byte)(b + 300)
System.out.println(b);   // 54   (310 tràn về 54)
```

### Wrapper & bộ nhớ đệm Integer

```java
Integer a = 127, b = 127;
Integer c = 128, d = 128;
System.out.println(a == b);   // true  -> nằm trong cache -128..127
System.out.println(c == d);   // false -> hai object khác nhau
System.out.println(c.equals(d)); // true
```

Luôn dùng `equals()` để so sánh wrapper. `==` chỉ so sánh tham chiếu.

```java
Integer n = null;
int x = n;           // NullPointerException lúc chạy (unboxing null)
```

### Math API

```java
Math.round(2.5);              // 3   (double -> long)
Math.round(-2.5);             // -2  (làm tròn về phía +vô cực!)
Math.round(2.5f);             // 3   (float -> int)
Math.abs(Integer.MIN_VALUE);  // -2147483648  (tràn, vẫn âm!)
-7 % 3;                       // -1  (dấu theo số bị chia)
Math.floorMod(-7, 3);         // 2   (luôn không âm khi chia số dương)
5 / 0;                        // ArithmeticException
5 / 0.0;                      // Infinity
0.0 / 0.0;                    // NaN
Double.NaN == Double.NaN;     // false  -> phải dùng Double.isNaN()
```

### `var` — suy luận kiểu biến local

Được phép: biến local có khởi tạo, vòng `for`, `try-with-resources`, tham số lambda.
Không được phép:

```java
var b;                 // LỖI: không có initializer
var c = null;          // LỖI: không suy luận được kiểu
var e = {1, 2};        // LỖI: mảng rút gọn cần kiểu tường minh
var f = new int[]{1};  // OK
var x = 1, y = 2;      // LỖI: không khai báo nhiều biến
```

`var` **không dùng được** cho: field, tham số phương thức, kiểu trả về, tham số `catch`.

---

## Module 1.2 — String, StringBuilder, Text Block

### String bất biến

```java
String s = "Java";
s.concat(" 25");
s.toUpperCase();
System.out.println(s);   // Java  -> mọi method trả về String MỚI
s = s.concat(" 25");     // phải gán lại
```

### String pool và `==`

```java
String x = "he" + "llo";   // hằng biên dịch -> vào pool
String y = "hel";
String z = y + "lo";       // nối lúc chạy -> object mới trên heap
System.out.println(x == "hello");     // true
System.out.println(z == "hello");     // false
System.out.println(z.equals("hello")); // true
System.out.println(z.intern() == "hello"); // true
```

### Method hay ra đề

```java
"abc".substring(3);    // ""  (hợp lệ, begin == length)
"abc".substring(4);    // StringIndexOutOfBoundsException
"abc".substring(2, 1); // Exception (begin > end)
"  a  ".trim();        // "a"   -> chỉ bỏ ký tự <= U+0020
"  a  ".strip();       // "a"   -> hiểu Unicode, dùng cái này
"".isEmpty();          // true
"   ".isEmpty();       // false
"   ".isBlank();       // true
"ab".repeat(3);        // "ababab"
"a\nb".lines().count(); // 2
"Xin %s".formatted("chào"); // "Xin chào"
"abc".indexOf("z");    // -1  (không ném exception)
```

### StringBuilder — có thể thay đổi, trả về chính nó

```java
StringBuilder sb = new StringBuilder("abcdef");
sb.delete(1, 3)     // "adef"      end là exclusive
  .insert(1, "XY")  // "aXYdef"
  .reverse();       // "fedYXa"
System.out.println(sb);   // fedYXa

new StringBuilder("hello").replace(1, 3, "ZZZ");  // "hZZZlo"  (độ dài thay đổi)
```

`StringBuilder` **không** override `equals()` — `sb1.equals(sb2)` luôn `false` với hai object khác nhau. Muốn so sánh: `sb1.toString().equals(sb2.toString())`.

### Text block

```java
String tb = """
    Hello
      World
    """;
System.out.println(tb.length());   // 14
```

Luật:
1. Sau `"""` mở **bắt buộc** xuống dòng, không được có ký tự nào (trừ khoảng trắng).
2. Khoảng trắng thừa bên trái được cắt theo **dòng thụt lề ít nhất**, tính cả dòng chứa `"""` đóng.
3. Trên: thụt lề nhỏ nhất = 4 → còn `"Hello\n  World\n"` = 6 + 8 = **14** ký tự.
4. Nếu `"""` đóng nằm cùng dòng với nội dung → không có `\n` cuối.
5. `\` cuối dòng = nối dòng, không xuống dòng. `\s` = giữ một khoảng trắng.

---

## Module 1.3 — Date-Time API

### Bốn lớp cốt lõi

```java
LocalDate     d  = LocalDate.of(2026, 3, 15);      // chỉ ngày, tháng 1–12
LocalTime     t  = LocalTime.of(14, 30, 0);        // chỉ giờ
LocalDateTime dt = LocalDateTime.of(d, t);
ZonedDateTime z  = ZonedDateTime.of(dt, ZoneId.of("Asia/Ho_Chi_Minh"));
Instant       i  = Instant.now();                  // mốc thời gian UTC
```

Không có constructor `public` — chỉ dùng factory `of()`, `now()`, `parse()`.
Tất cả đều **bất biến**: `d.plusDays(1);` không đổi `d`, phải gán lại.

```java
LocalDate.of(2026, 2, 29);   // DateTimeException — 2026 không nhuận
LocalDate.of(2026, 13, 1);   // DateTimeException — tháng không hợp lệ
```

### Period vs Duration

| | `Period` | `Duration` |
|---|---|---|
| Đơn vị | năm / tháng / ngày | giờ / phút / giây / nano |
| Dùng với | `LocalDate`, `LocalDateTime` | `LocalTime`, `LocalDateTime`, `Instant` |
| `toString` | `P2M14D` | `PT2H30M` |

```java
LocalDate d = LocalDate.of(2026, 1, 31);
d.plusMonths(1);                     // 2026-02-28  -> tự "kẹp" vào ngày cuối tháng
d.plus(Period.ofMonths(1)).plusMonths(1);  // 2026-03-28  KHÔNG quay lại 31!

LocalDate.now().plus(Duration.ofDays(1));
// Biên dịch OK nhưng ném UnsupportedTemporalTypeException: Unsupported unit: Seconds
```

### Đo khoảng cách

```java
LocalDate a = LocalDate.of(2026, 1, 1), b = LocalDate.of(2026, 3, 15);
Period.between(a, b);              // P2M14D
ChronoUnit.DAYS.between(a, b);     // 73
Instant.now().until(other);        // [Java 23] trả về Duration
```

### Định dạng

```java
DateTimeFormatter f = DateTimeFormatter.ofPattern("dd/MM/yyyy");
System.out.println(d.format(f));            // 31/01/2026
LocalDate.parse("15/03/2026", f);
```

Dùng sai pattern (ví dụ `HH:mm` cho `LocalDate`) → `UnsupportedTemporalTypeException`.

---

## Module 1.4 — Điều khiển luồng

### switch cổ điển — có fall-through

```java
int x = 2, sum = 0;
switch (x) {
    case 1: sum += 1;
    case 2: sum += 2;   // vào đây
    case 3: sum += 3;   // chảy tiếp!
        break;
    case 4: sum += 4;
}
System.out.println(sum);   // 5
```

`case` phải là **hằng biên dịch**: `final int` đã gán, literal, hằng String, tên enum (viết không kèm tên enum).

### switch expression (mũi tên)

```java
String s = switch (day) {
    case 1, 7 -> "cuối tuần";
    case 2, 3, 4, 5, 6 -> { yield "ngày thường"; }
    default -> "không hợp lệ";       // BẮT BUỘC với int/String
};
```

- Không fall-through, không cần `break`.
- Khối `{}` phải trả giá trị bằng `yield`.
- **Phải phủ hết mọi trường hợp.** Với `int`/`String` → luôn cần `default`. Với `enum` liệt kê đủ hằng, hoặc `sealed` liệt kê đủ nhánh → không cần `default`.
- Thiếu `default` khi chưa exhaustive = **lỗi biên dịch**, không phải lỗi lúc chạy.

### Pattern matching (Java 21+)

```java
sealed interface Shape permits Circle, Square {}
record Circle(double r) implements Shape {}
record Square(double s) implements Shape {}

static String f(Shape sh) {
    return switch (sh) {
        case Circle c when c.r() > 10 -> "hình tròn lớn";
        case Circle(double r)         -> "hình tròn " + r;   // record pattern
        case Square(var s)            -> "hình vuông " + s;
    };  // không cần default vì sealed đã đủ
}
f(new Circle(5));    // "hình tròn 5.0"
f(new Circle(20));   // "hình tròn lớn"
```

**Luật thống trị (dominance):** nhánh tổng quát hơn phải đứng sau.

```java
switch (o) {
    case Object obj -> ...;
    case String s   -> ...;   // LỖI: this case label is dominated
}
```

`case null` phải viết tường minh, nếu không `switch` ném NPE khi gặp `null`.

**[Java 22] Unnamed pattern `_`:** dùng khi không cần biến.

```java
case Circle(_) -> "tròn";
for (var _ : list) count++;
```

### Vòng lặp & nhãn

```java
outer:
for (int i = 0; i < 3; i++)
    for (int j = 0; j < 3; j++) {
        if (j == 1) continue outer;
        System.out.print(i + "" + j + " ");
    }
// 00 10 20
```

`while (false) { }` → **lỗi biên dịch** (code không thể tới). `if (false) { }` → hợp lệ.

---

## Module 1.5 — Class, record, constructor, overload

### Thứ tự khởi tạo

```java
class P { static { p("SP"); }  { p("IP"); }  P(){ p("CP"); } }
class C extends P { static { p("SC"); }  { p("IC"); }  C(){ p("CC"); } }
new C();
// SP SC IP CP IC CC
```

Quy tắc: **static của cả cây kế thừa (một lần, từ cha xuống con)** → rồi instance init + constructor của cha → rồi instance init + constructor của con.

### [Java 25] Flexible Constructor Bodies

Trước Java 25, `super()` / `this()` **phải** là câu lệnh đầu tiên. Từ Java 25, được đặt câu lệnh trước — miễn là không đụng vào đối tượng đang xây (`this`).

```java
class Employee extends Person {
    Employee(int age) {
        if (age < 18)                          // hợp lệ từ Java 25
            throw new IllegalArgumentException("chưa đủ tuổi");
        super(age);
    }
}
```

Vẫn cấm: đọc/ghi field của `this`, gọi method instance, trước khi `super()` chạy.

### Record

```java
record Point(int x, int y) {
    Point {                       // compact constructor
        if (x < 0) throw new IllegalArgumentException();
        x = Math.abs(x);          // OK: gán lại THAM SỐ
        // this.x = x;            // LỖI: cannot assign a value to final variable x
    }
    Point() { this(0, 0); }       // constructor phụ phải gọi canonical
    static int origin = 0;        // static field: OK
    // int extra;                 // LỖI: record không có instance field ngoài component
}
```

Record tự có: `x()`, `y()` (không phải `getX()`), `equals`, `hashCode`, `toString`. Lớp record ngầm `final`, kế thừa `java.lang.Record`, không extend được lớp khác.

### Overload & varargs

Thứ tự chọn overload: **khớp chính xác → mở rộng (widening) → boxing → varargs**.

```java
static String go(int a)      { return "single";  }
static String go(Integer a)  { return "boxed";   }
static String go(int... a)   { return "varargs"; }

go(5);   // "single"  — khớp chính xác thắng
```

`int...` phải là tham số **cuối cùng** và chỉ được có **một**. `go(null)` với `go(int[])` truyền mảng null, không phải mảng chứa null.

### Lớp lồng nhau

```java
class Outer {
    static class StaticNested { }
    class Inner { }
}
Outer.StaticNested a = new Outer.StaticNested();      // không cần Outer
Outer.Inner b = new Outer().new Inner();               // BẮT BUỘC có instance Outer
// Outer.Inner c = new Outer.Inner();                  // LỖI
```

Lớp local / lớp vô danh chỉ bắt được biến **effectively final** (không gán lại sau khi khởi tạo).

---

## Module 1.6 — Kế thừa, interface, enum, exception

### Override vs hiding

```java
class A { String name = "A"; String who() { return "A"; } }
class B extends A { String name = "B"; String who() { return "B"; } }

A ref = new B();
System.out.println(ref.name + ref.who());   // "AB"
```

**Field không đa hình** — chọn theo kiểu tham chiếu. **Method thì có** — chọn theo kiểu đối tượng thực. `static` method cũng chỉ bị *che* (hiding), không override.

Luật override: cùng chữ ký, kiểu trả về hiệp biến (covariant), quyền truy cập **không hẹp hơn**, không ném checked exception rộng hơn.

### sealed

```java
public sealed class Shape permits Circle, Square { }
public final class Circle extends Shape { }
public non-sealed class Square extends Shape { }   // mở lại cho kế thừa tự do
```

Mỗi lớp con phải là `final`, `sealed`, hoặc `non-sealed`, và phải cùng module (hoặc cùng package nếu không có module).

### Interface

```java
interface A { default String hi() { return "A"; } }
interface B { default String hi() { return "B"; } }

class C implements A, B {
    public String hi() { return A.super.hi() + B.super.hi(); }   // "AB"
}
```

Đụng độ `default` từ hai interface → **bắt buộc** override, gọi lại bằng `Interface.super.method()`.
Field trong interface ngầm là `public static final`. Method ngầm `public abstract` (trừ `default`/`static`/`private`).

**Functional interface:** đúng **một** abstract method. Method trùng chữ ký với `Object` (`toString`, `equals`, `hashCode`) không tính.

### Enum

```java
enum Op {
    ADD { int f(int a, int b) { return a + b; } },
    MUL { int f(int a, int b) { return a * b; } };
    abstract int f(int a, int b);
}
Op.ADD.f(2, 3);        // 5
Op.MUL.f(2, 3);        // 6
Op.ADD.ordinal();      // 0
Op.values().length;    // 2
Op.valueOf("SUB");     // IllegalArgumentException
```

Constructor enum luôn `private`. Trong `switch`, viết `case ADD:` chứ **không** `case Op.ADD:`.

### Exception

```
Throwable
├── Error            (unchecked — không bắt)
└── Exception        (checked)
    └── RuntimeException  (unchecked)
```

**try-with-resources** — đóng theo thứ tự **ngược**, trước cả `catch`/`finally`:

```java
try (Res a = new Res("A"); Res b = new Res("B")) {
    System.out.print("body ");
}
// openA openB body closeB closeA
```

Resource phải implement `AutoCloseable`. Từ Java 9, được dùng biến effectively final đã khai báo sẵn: `try (a; b) { }`.

**Bẫy `finally`:**

```java
int f() {
    try { return 1; }
    finally { return 2; }   // NUỐT giá trị trên -> trả về 2
}
```

**Multi-catch không được có quan hệ cha–con:**

```java
catch (IOException | Exception e) { }
// LỖI: Alternatives in a multi-catch statement cannot be related by subclassing
```

Tương tự, `catch (Exception e)` đứng trước `catch (IOException e)` → lỗi biên dịch (catch không thể tới).

---

# PHẦN B — 30 BÀI TẬP

> Làm hết rồi mới xem Phần C. Với câu hỏi output, hãy viết đáp án ra giấy trước.

**Câu 1.** Kết quả?
```java
byte b = 10;
b += 300;
System.out.println(b);
```
A. Lỗi biên dịch  B. 310  C. 54  D. ArithmeticException

**Câu 2.** Kết quả?
```java
Integer a = 127, b = 127, c = 128, d = 128;
System.out.println((a == b) + " " + (c == d) + " " + c.equals(d));
```

**Câu 3.** In ra gì?
```java
System.out.println(Math.round(-2.5));
System.out.println(Math.abs(Integer.MIN_VALUE));
System.out.println(-7 % 3);
System.out.println(Math.floorMod(-7, 3));
```

**Câu 4.** Giá trị cuối của `i`?
```java
int i = 0;
i = i++ + ++i;
```

**Câu 5.** Những dòng nào KHÔNG biên dịch được?
```java
var a = 10;              // 1
var b;                   // 2
var c = null;            // 3
var d = new int[]{1, 2}; // 4
var e = {1, 2};          // 5
var f = 1, g = 2;        // 6
```

**Câu 6.** Chương trình in gì rồi dừng ở đâu?
```java
System.out.println(5 / 0.0);
System.out.println(0.0 / 0.0 == 0.0 / 0.0);
System.out.println(5 / 0);
System.out.println("xong");
```

**Câu 7.** Kết quả?
```java
String s = "Java";
s.concat(" 25");
s.toUpperCase();
System.out.println(s);
```

**Câu 8.** Kết quả?
```java
String x = "he" + "llo";
String y = "hel";
String z = y + "lo";
System.out.println((x == "hello") + " " + (z == "hello") + " " + z.equals("hello"));
```

**Câu 9.** Chuyện gì xảy ra ở từng dòng?
```java
System.out.println("[" + "abc".substring(3) + "]");   // dòng 1
System.out.println("abc".substring(4));                // dòng 2
```

**Câu 10.** Kết quả?
```java
StringBuilder sb = new StringBuilder("abcdef");
sb.delete(1, 3).insert(1, "XY").reverse();
System.out.println(sb);
```

**Câu 11.** `tb.length()` bằng bao nhiêu?
```java
String tb = """
    Hello
      World
    """;
```

**Câu 12.** Hai dòng in ra gì?
```java
LocalDate d = LocalDate.of(2026, 1, 31);
System.out.println(d.plusMonths(1));
System.out.println(d.plus(Period.ofMonths(1)).plusMonths(1));
```

**Câu 13.** Dòng dưới gây ra điều gì?
```java
LocalDate.now().plus(Duration.ofDays(1));
```
A. Biên dịch lỗi  B. Chạy bình thường  C. `DateTimeException`  D. `UnsupportedTemporalTypeException`

**Câu 14.** Dòng nào ném ngoại lệ?
```java
LocalDate.of(2026, 2, 28);   // 1
LocalDate.of(2026, 2, 29);   // 2
LocalDate.of(2024, 2, 29);   // 3
LocalDate.of(2026, 13, 1);   // 4
```

**Câu 15.** Kết quả?
```java
LocalDate a = LocalDate.of(2026, 1, 1), b = LocalDate.of(2026, 3, 15);
System.out.println(Period.between(a, b));
System.out.println(ChronoUnit.DAYS.between(a, b));
```

**Câu 16.** Đoạn này có vấn đề gì?
```java
int day = 3;
String s = switch (day) {
    case 1, 7 -> "cuối tuần";
    case 2, 3, 4, 5, 6 -> { yield "ngày thường"; }
};
```

**Câu 17.** `sum` bằng bao nhiêu?
```java
int x = 2, sum = 0;
switch (x) {
    case 1: sum += 1;
    case 2: sum += 2;
    case 3: sum += 3; break;
    case 4: sum += 4;
}
```

**Câu 18.** Vì sao đoạn này không biên dịch được, và sửa thế nào?
```java
Object o = "hi";
switch (o) {
    case Object obj -> System.out.println("obj");
    case String s   -> System.out.println("str");
}
```

**Câu 19.** `f(new Circle(5))` và `f(new Circle(20))` trả về gì? `switch` này có cần `default` không?
```java
sealed interface Shape permits Circle, Square {}
record Circle(double r) implements Shape {}
record Square(double s) implements Shape {}

static String f(Shape sh) {
    return switch (sh) {
        case Circle c when c.r() > 10 -> "big";
        case Circle(double r)         -> "circle " + r;
        case Square(var s)            -> "square " + s;
    };
}
```

**Câu 20.** In ra gì?
```java
outer:
for (int i = 0; i < 3; i++)
    for (int j = 0; j < 3; j++) {
        if (j == 1) continue outer;
        System.out.print(i + "" + j + " ");
    }
```

**Câu 21.** `new C()` in ra thứ tự nào?
```java
class P { static { p("SP"); }  { p("IP"); }  P(){ p("CP"); } }
class C extends P { static { p("SC"); }  { p("IC"); }  C(){ p("CC"); } }
```

**Câu 22.** Đoạn này biên dịch được không?
```java
record Point(int x, int y) {
    Point { this.x = x; }
}
```

**Câu 23.** Gọi `go(5)` chạy method nào?
```java
static String go(int a)     { return "single";  }
static String go(Integer a) { return "boxed";   }
static String go(int... a)  { return "varargs"; }
```

**Câu 24.** Đoạn này biên dịch được trên Java 21 không? Trên Java 25 thì sao?
```java
class Employee extends Person {
    Employee(int age) {
        if (age < 18) throw new IllegalArgumentException();
        super(age);
    }
}
```

**Câu 25.** Dòng nào hợp lệ?
```java
class Outer { static class SN {} class In {} }

Outer.SN a = new Outer.SN();          // 1
Outer.In b = new Outer.In();          // 2
Outer.In c = new Outer().new In();    // 3
Outer.SN d = new Outer().new SN();    // 4
```

**Câu 26.** In ra gì?
```java
class A { String name = "A"; String who() { return "A"; } }
class B extends A { String name = "B"; String who() { return "B"; } }

A ref = new B();
System.out.println(ref.name + ref.who());
```

**Câu 27.** Lớp `C` cần gì để biên dịch được, và `new C().hi()` in gì?
```java
interface A { default String hi() { return "A"; } }
interface B { default String hi() { return "B"; } }
class C implements A, B { }
```

**Câu 28.** Kết quả 4 dòng?
```java
enum Op {
    ADD { int f(int a, int b) { return a + b; } },
    MUL { int f(int a, int b) { return a * b; } };
    abstract int f(int a, int b);
}
System.out.println(Op.ADD.f(2, 3));
System.out.println(Op.MUL.f(2, 3));
System.out.println(Op.ADD.ordinal());
System.out.println(Op.valueOf("SUB"));
```

**Câu 29.** In ra gì?
```java
class Res implements AutoCloseable {
    String n; Res(String n) { this.n = n; System.out.print("open" + n + " "); }
    public void close() { System.out.print("close" + n + " "); }
}
try (Res a = new Res("A"); Res b = new Res("B")) {
    System.out.print("body ");
}
```

**Câu 30.** Hàm `f()` trả về gì, và đoạn `catch` dưới có lỗi gì?
```java
int f() {
    try { return 1; }
    finally { return 2; }
}

try { throw new IOException(); }
catch (IOException | Exception e) { }
```

---

# PHẦN C — ĐÁP ÁN & GIẢI THÍCH

**Câu 1 → C. In ra `54`.**
`b += 300` **không** tương đương `b = b + 300`. Toán tử gán ghép (`+=`, `-=`, `*=`…) chèn sẵn một phép ép kiểu ngầm: `b = (byte)(b + 300)`. Nên nó biên dịch được. 310 ở dạng nhị phân là `1_0011_0110`; giữ lại 8 bit thấp được `0011 0110` = 54, bit dấu bằng 0 nên kết quả dương.
*Nhớ:* viết `b = b + 300` thì mới là lỗi biên dịch.

---

**Câu 2 → `true false true`**
`Integer` được cache các giá trị từ −128 đến 127. Autoboxing trong khoảng này tái dùng cùng object nên `a == b` là `true`. 128 vượt cache → hai object riêng → `false`. `equals()` so sánh giá trị nên `true`.
*Nhớ:* đây là lý do quy tắc "luôn dùng `equals` cho wrapper". Đề thi rất hay đặt số ngay ở biên 127/128.

---

**Câu 3 → `-2`, `-2147483648`, `-1`, `2`**
- `Math.round` làm tròn về phía **+vô cực**, nên −2.5 → −2 (không phải −3).
- `Math.abs(Integer.MIN_VALUE)` tràn: giá trị dương 2147483648 không biểu diễn được bằng `int` nên quay lại chính `MIN_VALUE`.
- `%` trong Java giữ dấu của số bị chia → `-7 % 3` = −1.
- `Math.floorMod` cho kết quả cùng dấu với số chia → 2. Rất hữu ích khi làm bài DSA có index vòng tròn.

---

**Câu 4 → `i == 2`**
Đánh giá từ trái sang phải:
1. `i++` → lấy giá trị 0, sau đó `i` thành 1.
2. `++i` → `i` thành 2, lấy giá trị 2.
3. `0 + 2 = 2`, gán vào `i` → **2**.
Phép gán cuối cùng ghi đè mọi thay đổi trước đó của `i`.

---

**Câu 5 → dòng 2, 3, 5, 6 lỗi**
- (2) `var` cần initializer để suy luận kiểu.
- (3) `null` không mang thông tin kiểu.
- (5) `{1, 2}` là cú pháp rút gọn, cần kiểu đích tường minh; `new int[]{1,2}` ở dòng 4 thì hợp lệ.
- (6) `var` không khai báo nhiều biến trên một dòng.
Thông báo lỗi thật của javac: *cannot infer type for local variable*.

---

**Câu 6 → `Infinity`, `false`, rồi ném `ArithmeticException`; `"xong"` KHÔNG được in.**
Chia số nguyên cho 0 ném exception; chia số thực cho 0 cho `Infinity`. `0.0/0.0` là `NaN`, và `NaN` không bằng chính nó theo chuẩn IEEE 754 — muốn kiểm tra phải dùng `Double.isNaN(x)`.

---

**Câu 7 → `Java`**
`String` bất biến. `concat` và `toUpperCase` tạo object mới rồi bị vứt đi vì không gán lại. Đây là bẫy phổ biến nhất về String trong đề thi — đề hay giấu nó giữa 20 dòng code khác.

---

**Câu 8 → `true false true`**
`"he" + "llo"` gồm toàn hằng biên dịch, javac gộp thành `"hello"` và đưa vào string pool → cùng object với literal `"hello"`. `y + "lo"` có biến ở lúc chạy nên tạo object mới trên heap → `==` cho `false`. Muốn đưa về pool: `z.intern() == "hello"` → `true`.

---

**Câu 9 → dòng 1 in `[]`, dòng 2 ném `StringIndexOutOfBoundsException`**
`substring(begin)` chấp nhận `begin == length` và trả về chuỗi rỗng — hợp lệ, không phải lỗi. Chỉ khi `begin > length` (hoặc `begin > end` ở bản hai tham số) mới ném ngoại lệ. Nhớ rằng tham số `end` luôn là **exclusive**.

---

**Câu 10 → `fedYXa`**
Lần theo từng bước:
- `"abcdef"` → `delete(1, 3)` xoá index 1,2 (không xoá 3) → `"adef"`
- `.insert(1, "XY")` → `"aXYdef"`
- `.reverse()` → `"fedYXa"`
Mấu chốt: các method của `StringBuilder` trả về **chính object đó**, nên nối chuỗi lời gọi sẽ thay đổi tích luỹ. Khác hẳn `String`.

---

**Câu 11 → `14`**
Mức thụt lề nhỏ nhất được tính trên tất cả các dòng nội dung **và cả dòng chứa `"""` đóng**. Ở đây cả `Hello` lẫn `"""` đóng đều thụt 4 khoảng trắng → cắt 4. Kết quả là `"Hello\n  World\n"`: 5 + 1 + 7 + 1 = 14.
*Mẹo:* muốn bỏ dòng trắng cuối, đặt `"""` đóng ngay sau ký tự cuối cùng của nội dung.

---

**Câu 12 → `2026-02-28` và `2026-03-28`**
Cộng tháng vào ngày 31 sẽ "kẹp" xuống ngày cuối cùng hợp lệ của tháng đích (28/2). Nhưng thao tác này **không nhớ** ngày gốc là 31, nên cộng thêm 1 tháng nữa chỉ cho 28/3 chứ không phải 31/3. Đề thi rất thích ví dụ 31/1.

---

**Câu 13 → D. `UnsupportedTemporalTypeException`**
Biên dịch được vì `plus(TemporalAmount)` nhận cả `Period` lẫn `Duration`. Nhưng `LocalDate` không có thành phần thời gian, mà `Duration` được biểu diễn bằng giây → lúc chạy ném `UnsupportedTemporalTypeException: Unsupported unit: Seconds`.
*Nhớ:* `Period` đi với ngày, `Duration` đi với giờ. Nhầm cặp này là lỗi runtime, không phải compile.

---

**Câu 14 → dòng 2 và 4 ném `DateTimeException`**
2026 không phải năm nhuận nên không có 29/2 (dòng 2). 2024 là năm nhuận nên dòng 3 hợp lệ. Tháng chỉ nhận 1–12, `13` không hợp lệ (dòng 4). Lưu ý API mới đánh số tháng từ **1**, khác `java.util.Calendar` cũ đánh từ 0.

---

**Câu 15 → `P2M14D` và `73`**
`Period.between` trả về khoảng cách theo lịch: 2 tháng 14 ngày. `ChronoUnit.DAYS.between` đếm số ngày thật: 31 (tháng 1) + 28 (tháng 2) + 14 = 73.
Hai con số này đo hai thứ khác nhau — đề hay đặt cạnh nhau để đánh lừa.

---

**Câu 16 → Lỗi biên dịch: switch expression chưa exhaustive.**
Với kiểu `int`, trình biên dịch không thể chứng minh mọi giá trị đều được phủ (còn 0, 8, −5…), nên bắt buộc phải có `default`. Đây là **lỗi biên dịch**, không phải ngoại lệ lúc chạy.
Chỉ có hai trường hợp được miễn `default`: `enum` liệt kê đủ mọi hằng, và kiểu `sealed` liệt kê đủ mọi nhánh.

---

**Câu 17 → `5`**
`x == 2` nên nhảy vào `case 2`, cộng 2. Không có `break` → chảy tiếp xuống `case 3`, cộng 3 → tổng 5, rồi mới gặp `break`. `case 1` bị bỏ qua vì nhảy thẳng vào nhãn khớp. `case 4` không chạy vì đã `break`.

---

**Câu 18 → Lỗi *this case label is dominated by a preceding case label*.**
`Object obj` khớp với mọi giá trị, nên nhánh `String s` phía sau không bao giờ đạt tới được. Java bắt lỗi này lúc biên dịch. Sửa bằng cách đảo thứ tự — nhánh cụ thể trước, nhánh tổng quát sau:
```java
case String s -> System.out.println("str");
case Object obj -> System.out.println("obj");
```
*Nhớ thêm:* nếu `o` có thể `null` mà không có `case null`, `switch` sẽ ném `NullPointerException`.

---

**Câu 19 → `"circle 5.0"` và `"big"`. Không cần `default`.**
Guard `when` được kiểm tra sau khi khớp kiểu; `Circle(5)` không thoả `r > 10` nên rơi xuống nhánh sau. `Circle(double r)` là **record pattern** — tự rút component ra biến `r`. `Square(var s)` dùng `var` để suy luận kiểu component.
Vì `Shape` là `sealed` chỉ cho phép `Circle` và `Square`, và cả hai đều được liệt kê, trình biên dịch xác nhận exhaustive → không cần `default`.
*Chú ý:* nếu sau này thêm `permits Triangle` mà quên sửa `switch`, chỗ này lập tức thành lỗi biên dịch — đó chính là lợi ích của `sealed`.

---

**Câu 20 → `00 10 20 `**
`continue outer` nhảy tới lần lặp kế tiếp của vòng **ngoài**, bỏ hết phần còn lại của vòng trong. Nên mỗi giá trị `i` chỉ in được đúng `j == 0`.
So sánh: `break outer` sẽ chỉ in `00 ` rồi thoát hẳn cả hai vòng.

---

**Câu 21 → `SP SC IP CP IC CC`**
Thứ tự chuẩn:
1. Toàn bộ khối `static` từ lớp cha xuống lớp con, chạy **một lần duy nhất** khi lớp được nạp → `SP`, `SC`.
2. Khởi tạo instance của cha: instance initializer trước, thân constructor sau → `IP`, `CP`.
3. Rồi mới tới con → `IC`, `CC`.
Điểm dễ sai nhất: instance initializer chạy **trước** thân constructor, không phải sau. Và `new C()` lần thứ hai sẽ không in lại `SP SC`.

---

**Câu 22 → Không. Lỗi *cannot assign a value to final variable x*.**
Trong compact constructor, các component vẫn là **tham số** chứ chưa phải field; việc gán vào field diễn ra tự động ở cuối. Nên bạn được gán lại tham số (`x = Math.abs(x);`) để chuẩn hoá dữ liệu, nhưng không được viết `this.x = x;`.
Nếu thật sự cần dùng `this.x`, phải viết canonical constructor đầy đủ: `Point(int x, int y) { this.x = x; this.y = y; }`.

---

**Câu 23 → `"single"`**
Trình biên dịch chọn theo độ ưu tiên: khớp chính xác → widening → boxing → varargs. `5` là `int` nên khớp chính xác `go(int)` ngay bước đầu. `go(Integer)` cần boxing, `go(int...)` cần đóng gói mảng — cả hai đều xếp sau.
*Biến thể hay gặp:* nếu bỏ `go(int)` đi, kết quả sẽ là `"boxed"` chứ không phải `"varargs"`, vì boxing đứng trước varargs.

---

**Câu 24 → Java 21: lỗi biên dịch. Java 25: hợp lệ.**
Trước Java 25, `super()`/`this()` bắt buộc là câu lệnh đầu tiên trong constructor. **Flexible Constructor Bodies** (JEP 513, chính thức từ Java 25) cho phép đặt câu lệnh vào phần "prologue" trước lời gọi đó, miễn là không tham chiếu tới đối tượng đang được xây.
Lợi ích: kiểm tra tham số và ném exception **trước** khi lớp cha làm bất cứ việc gì — trước đây phải lách bằng static helper method.
Vẫn cấm trong prologue: đọc/ghi field của `this`, gọi method instance.

---

**Câu 25 → chỉ dòng 1 và 3 hợp lệ**
- (1) Lớp static nested không cần instance của Outer → đúng.
- (2) `In` là inner class (không static), phải có instance Outer → lỗi.
- (3) Cú pháp đúng: `new Outer().new In()`.
- (4) Không được dùng `outer.new` cho lớp static nested → lỗi.
*Mẹo nhớ:* có chữ `static` thì độc lập, không có thì phải "bám" vào một instance.

---

**Câu 26 → `AB`**
`ref.name` chọn theo **kiểu tham chiếu** `A` vì field bị *che* (hiding) chứ không đa hình → `"A"`. `ref.who()` chọn theo **kiểu đối tượng thực** `B` vì method được override → `"B"`.
Đây là lý do không nên đặt field trùng tên trong lớp con. `static` method cũng chỉ bị che chứ không override — gọi qua tham chiếu sẽ dùng kiểu tham chiếu.

---

**Câu 27 → `C` phải override `hi()`; sau khi sửa, in ra `AB`.**
Khi hai interface cung cấp `default` method cùng chữ ký, lớp cài đặt buộc phải override để giải quyết mơ hồ; nếu không sẽ lỗi *class C inherits unrelated defaults*. Trong phần override, gọi lại bản gốc bằng cú pháp `Interface.super.method()`:
```java
class C implements A, B {
    public String hi() { return A.super.hi() + B.super.hi(); }
}
```
*Nếu một bên là abstract, một bên là default* thì không mơ hồ — bản `default` được dùng.

---

**Câu 28 → `5`, `6`, `0`, rồi ném `IllegalArgumentException`.**
Enum có thể chứa method `abstract` với thân riêng cho từng hằng (constant-specific body) — mỗi hằng thực chất là một lớp con vô danh. `ordinal()` trả về vị trí khai báo, tính từ 0. `valueOf` với tên không tồn tại ném `IllegalArgumentException` (không phải trả `null` — đó là điểm hay bị nhầm).
Cũng nên nhớ: `values()` trả về **mảng mới mỗi lần gọi**, nên sửa mảng đó không ảnh hưởng enum.

---

**Câu 29 → `openA openB body closeB closeA `**
Resource được khởi tạo theo thứ tự khai báo và đóng theo thứ tự **ngược lại**. Việc đóng xảy ra ngay khi rời khối `try`, **trước** cả `catch` và `finally`.
Nếu cả thân `try` lẫn `close()` cùng ném exception, exception của thân được ném ra ngoài còn exception của `close()` bị gắn vào làm **suppressed** — lấy bằng `e.getSuppressed()`.

---

**Câu 30 → `f()` trả về `2`; câu `catch` lỗi biên dịch.**
`return` trong `finally` ghi đè hoàn toàn `return` trong `try` — giá trị 1 bị vứt. Đây là lý do không bao giờ nên `return` (hay ném exception) từ `finally` trong code thật; trình biên dịch chỉ cảnh báo chứ không cấm.
Còn `catch (IOException | Exception e)` là **lỗi biên dịch**: *Alternatives in a multi-catch statement cannot be related by subclassing*. `IOException` đã là con của `Exception` nên nhánh đầu thừa. Chỉ cần viết `catch (Exception e)`.
Cùng logic: `catch (Exception e)` đặt trước `catch (IOException e)` cũng lỗi vì nhánh sau không thể tới.

---

# Tự chấm

| Điểm | Ý nghĩa |
|---|---|
| 27–30 | Vững Giai đoạn 1, sang Giai đoạn 2 được |
| 21–26 | Ôn lại các module có câu sai rồi làm lại sau 3 ngày |
| < 21 | Đọc lại Phần A, gõ tay toàn bộ code minh hoạ, làm lại sau 1 tuần |

Ghi mọi câu sai vào `gotchas.md` theo mẫu: *code → mình đoán gì → thực tế → vì sao*. Tuần 23–24 bạn sẽ chỉ ôn file này.
