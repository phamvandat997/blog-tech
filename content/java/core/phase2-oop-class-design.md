---
title: "Phase 2: Lập trình Hướng đối tượng (OOP) & Thiết kế Lớp"
order: 4
phase: "Phase 2"
tags: ["Records", "Sealed Classes", "Pattern Matching", "Class Loading"]
---
# Phase 2: Lập trình Hướng đối tượng (OOP) & Thiết kế Lớp
**Kỳ thi:** OCP Java SE 25 Developer (1Z0-831)

Tài liệu này đi sâu vào các khái niệm cốt lõi của OOP và thiết kế lớp trong Java, bao gồm các tính năng mới nhất được bổ sung trong các phiên bản Java gần đây như Flexible Constructor Bodies (Java 22+), Records, Sealed Classes, và Pattern Matching tiên tiến.

---

## 2.1 Classes & Objects (Lớp & Đối tượng)

### Cấu trúc cơ bản
Một lớp trong Java định nghĩa trạng thái (fields) và hành vi (methods).

> [!NOTE]
> Khởi tạo biến instance nếu không được gán giá trị: `0` cho số, `false` cho boolean, `null` cho object.

### Access Modifiers (Phạm vi truy cập)

| Modifier | Class | Package | Subclass | World |
| :--- | :---: | :---: | :---: | :---: |
| `public` | Y | Y | Y | Y |
| `protected` | Y | Y | Y | N |
| `default` (package-private) | Y | Y | N | N |
| `private` | Y | N | N | N |

> [!WARNING]
> **Trap exam:** `protected` cho phép subclass ở package khác truy cập, nhưng chỉ thông qua tham chiếu kế thừa. Không thể dùng biến tham chiếu của lớp cha để truy cập thành viên `protected` ở package khác!

### Thứ tự khởi tạo (Initialization Order)
1. **Static variables & static initializers** (Thực hiện một lần khi nạp lớp, từ trên xuống dưới).
2. **Instance variables & instance initializers** (Mỗi khi tạo đối tượng, từ trên xuống dưới).
3. **Constructors** (Hàm tạo).

> [!IMPORTANT]
> Khi có kế thừa, thứ tự là: `Cha (Static) -> Con (Static) -> Cha (Instance -> Constructor) -> Con (Instance -> Constructor)`.

---

## 2.2 Constructors (Hàm tạo)

### Default Constructor
Nếu không khai báo bất kỳ constructor nào, Java compiler sẽ tự tạo một *default no-arg constructor*. Nếu bạn đã viết 1 constructor (dù có tham số hay không), default constructor sẽ KHÔNG được tạo.

### Constructor Chaining (`this()` và `super()`)
Trong các phiên bản trước, `super()` hoặc `this()` **phải là lệnh đầu tiên** trong constructor.

### Flexible Constructor Bodies (Java 22+)
Bắt đầu từ Java 22 (JEP 482), Java cho phép viết các lệnh **trước** lệnh gọi `super()` hoặc `this()`, gọi là *pre-construction contexts*.

```java
public class Animal {
    public Animal(int age) { System.out.println("Animal: " + age); }
}

public class Dog extends Animal {
    public Dog(int age) {
        // Hợp lệ trong Java 22+: Các lệnh trước super()
        if (age < 0) {
            throw new IllegalArgumentException("Tuổi không hợp lệ");
        }
        int calculatedAge = age * 7;
        super(calculatedAge); 
    }
}
```

> [!CAUTION]
> **Trap exam:** Trong khối lệnh trước `super()`/`this()`, bạn **KHÔNG ĐƯỢC PHÉP** truy cập vào bất kỳ thành viên instance nào (biến hoặc phương thức) của lớp hiện tại. Việc sử dụng biến tĩnh (static) hoặc tính toán các biến cục bộ thì hoàn toàn hợp lệ.

---

## 2.3 Inheritance & Polymorphism (Kế thừa & Đa hình)

### Method Overriding (Ghi đè phương thức)
Quy tắc Override hợp lệ:
1. Access modifier không được thu hẹp (Ví dụ: cha là `protected`, con phải là `protected` hoặc `public`).
2. Return type có thể là subclass của kiểu trả về ở lớp cha (Covariant return types).
3. Không được ném checked exception rộng hơn hoặc mới so với lớp cha.

> [!WARNING]
> **Hiding vs Overriding:**
> - Instance methods được **Override** (Đa hình lúc runtime - Virtual method invocation).
> - Static methods và Variables (Fields) bị **Hide** (Quyết định bởi kiểu của tham chiếu lúc compile-time).

```java
class Parent {
    String name = "Parent";
    static void print() { System.out.println("P"); }
}
class Child extends Parent {
    String name = "Child";
    static void print() { System.out.println("C"); }
}
// Exam trick
Parent p = new Child();
System.out.println(p.name); // In ra "Parent" vì field bị HIDING
p.print(); // In ra "P" vì static method bị HIDING
```

---

## 2.4 Abstract Classes & Interfaces

### Interfaces
- Mặc định các phương thức (không body) là `public abstract`.
- Các trường (fields) mặc định là `public static final`.
- **Default methods**: Cho phép interface có method body để tương thích ngược.

> [!IMPORTANT]
> **Diamond Problem:** Khi 1 class implement 2 interface có cùng 1 default method, class đó BẮT BUỘC phải override method đó.
> Để gọi hàm của interface cụ thể: `InterfaceName.super.methodName();`

---

## 2.5 Enums

Enum là các hằng số.
- Các hằng số luôn phải đứng đầu tiên trong enum.
- Constructor của enum ngầm định là `private` (không thể dùng `public` hay `protected`).
- Enum có thể implement Interface, nhưng KHÔNG thể extend lớp khác (vì ngầm định đã extend `java.lang.Enum`).

```java
enum Status {
    OPEN(1), CLOSED(0); // Bắt buộc kết thúc bằng ; nếu có code phía sau
    private int code;
    private Status(int code) { this.code = code; }
}
```

---

## 2.6 Records (Java 16+)

Records là tính năng tạo class dữ liệu một cách ngắn gọn, các trường mặc định là `private final`.

- Tự động tạo: constructor, getters (tên giống tên field, không có chữ `get`), `equals`, `hashCode`, `toString`.
- **Không thể extend** class khác, bản thân record ngầm định là `final`.
- Có thể implement interfaces.
- Không thể khai báo thêm instance fields (nhưng có thể khai báo static fields).

### Compact Constructor
Dùng để kiểm tra dữ liệu hoặc chuẩn hóa trước khi gán.

```java
public record User(String username, int age) {
    // Compact constructor (không có ngoặc chứa tham số)
    public User {
        if (age < 0) throw new IllegalArgumentException();
        username = username.trim();
    }
}
```

---

## 2.7 Sealed Classes & Interfaces (Java 17+)

Dùng để kiểm soát những lớp nào được phép kế thừa.
- Dùng từ khóa `sealed` và `permits`.
- Subclass của một lớp `sealed` BẮT BUỘC phải khai báo 1 trong 3 modifier: `final`, `sealed`, hoặc `non-sealed`.

```java
public sealed class Shape permits Circle, Square {}

public final class Circle extends Shape {}
public non-sealed class Square extends Shape {} // Cho phép các class khác kế thừa Square
```

> [!TIP]
> Nếu các class nằm trong cùng 1 file, ta có thể bỏ qua từ khóa `permits` (compiler tự suy luận ra các permitted classes).

---

## 2.8 Nested Classes

1. **Static Nested Class**: Không gắn với instance bên ngoài, giống class thông thường. Khởi tạo: `new Outer.Nested()`.
2. **Inner Class**: Gắn với 1 instance bên ngoài. Có thể truy cập tất cả thành viên của Outer. Khởi tạo: `outerObj.new Inner()`.
3. **Local Class**: Nằm trong phương thức. Chỉ truy cập được các biến cục bộ `final` hoặc `effectively final`.
4. **Anonymous Class**: Class không tên, tạo ra ngay khi dùng `new InterfaceName()` hoặc `new ClassName()`.

---

## 2.9 Pattern Matching

### Pattern Matching for instanceof
Gộp kiểm tra và ép kiểu:
```java
if (obj instanceof String s) {
    System.out.println(s.length()); // Dùng được biến s luôn
}
```

### Record Patterns
Destructuring (tách) dữ liệu từ record trực tiếp:
```java
if (obj instanceof Point(int x, int y)) {
    System.out.println(x + y);
}
```

### Switch Pattern Matching & Guarded Patterns
Sử dụng switch với các kiểu dữ liệu và điều kiện `when` (thay vì `&&`). Bổ sung biến không tên `_` (Unnamed variables) cho các trường hợp không cần dùng đến giá trị.

```java
return switch(shape) {
    case Circle c when c.radius() > 10 -> "Big Circle";
    case Circle _ -> "Small Circle"; // Dùng _ khi không cần biến
    case Square(int s) -> "Square side " + s;
}; // switch expression phải exhaustive (phủ kín các trường hợp).
```

---

## QUIZ PRACTICE (15 CÂU HỎI)

**Câu 1:** Xem đoạn mã sau mô phỏng Flexible Constructor Bodies trong Java 22.
```java
class Vehicle {
    Vehicle(int wheels) { System.out.print("V" + wheels + " "); }
}
class Car extends Vehicle {
    static int base = 4;
    int extra = 1;
    
    Car(int extraWheels) {
        int total = base + extraWheels;
        super(total);
        System.out.print("C" + this.extra + " ");
    }
}
public class Test {
    public static void main(String[] args) {
        new Car(2);
    }
}
```
Kết quả in ra là gì?
A) `V4 C1`
B) `V6 C1`
C) Compile error tại dòng `int total = base + extraWheels;`
D) Compile error vì `super()` không phải là lệnh đầu tiên.

**Câu 2:** Cho các lớp sau:
```java
sealed class A permits B, C {}
final class B extends A {}
sealed class C extends A permits D {}
non-sealed class D extends C {}
class E extends D {}
```
Class nào bị lỗi biên dịch?
A) Class A
B) Class B
C) Class C
D) Class D
E) Không có class nào lỗi.

**Câu 3:** Chọn HAI đáp án đúng về Records:
A) Record có thể kế thừa (extend) một class thông thường.
B) Bạn có thể thêm instance variables bên trong thân của Record (không nằm trong header).
C) Compact constructor không cần khai báo danh sách tham số đầu vào.
D) Các class tạo từ Record là final một cách ngầm định.
E) Các field của Record là mutable một cách ngầm định.

**Câu 4:** Đoạn mã sau bị lỗi ở dòng nào?
```java
1: interface Walkable {
2:     default void walk() { System.out.println("Walking"); }
3: }
4: interface Runnable {
5:     default void walk() { System.out.println("Running"); }
6: }
7: class Robot implements Walkable, Runnable {
8:     public void walk() {
9:         Walkable.super.walk();
10:    }
11: }
```
A) Dòng 2 và 5
B) Dòng 7
C) Dòng 9
D) Không có lỗi biên dịch.

**Câu 5:** Kết quả khi chạy đoạn mã:
```java
class Alpha {
    String type = "A";
    public Alpha() { print(); }
    public void print() { System.out.print(type + " "); }
}
class Beta extends Alpha {
    String type = "B";
    public Beta() { print(); }
    public void print() { System.out.print(type + " "); }
}
public class Test {
    public static void main(String[] args) {
        new Beta();
    }
}
```
A) `A B `
B) `B B `
C) `null B `
D) `A A `

**Câu 6:** Khi áp dụng switch pattern matching, đoạn code nào sau đây là KHÔNG HỢP LỆ? (Giả sử Object o được truyền vào)
A) `case Integer i when i > 0 -> "Positive";`
B) `case String s && s.length() > 5 -> "Long string";`
C) `case String _ -> "Just a string";`
D) `case null, default -> "Empty or unknown";`

**Câu 7:** Xem đoạn mã Enum sau:
```java
enum TrafficLight {
    RED("Stop"), GREEN("Go"), YELLOW("Wait");
    public String message;
    private TrafficLight(String message) {
        this.message = message;
    }
}
```
Khẳng định nào đúng? (Chọn HAI)
A) Lỗi biên dịch vì hằng số Enum phải ở cuối cùng.
B) Hàm tạo của Enum chỉ có thể gọi thông qua nội bộ class Enum.
C) Cấu trúc `TrafficLight t = new TrafficLight("Slow");` là hợp lệ ở hàm main.
D) Code biên dịch hoàn toàn hợp lệ.
E) `message` phải là hằng số (`final`).

**Câu 8:** Xem xét tính năng Pattern Matching:
```java
record Point(int x, int y) {}
Object obj = new Point(10, 20);
if (obj instanceof Point(int a, int b)) {
    System.out.println(a + b);
}
```
Khẳng định nào sau đây là đúng?
A) Code in ra 30.
B) Lỗi biên dịch vì cần dùng `Point p` rồi mới gọi `p.x()` và `p.y()`.
C) Lỗi biên dịch vì tên biến `a` và `b` không khớp với `x` và `y` trong Record.
D) Ném ra exception lúc chạy.

**Câu 9:** Để sử dụng Flexible Constructor Bodies hợp lệ, dòng code nào KHÔNG được phép đặt trước lệnh `this()` hoặc `super()`?
A) `int x = 5;`
B) `System.out.println("Init");`
C) `if (Math.random() > 0.5) throw new Exception();`
D) `System.out.println(this.toString());`

**Câu 10:** Cho đoạn mã:
```java
class Outer {
    private int x = 10;
    class Inner {
        private int x = 20;
        void print() {
            int x = 30;
            System.out.print(x + " "); // (1)
            System.out.print(this.x + " "); // (2)
            System.out.print(Outer.this.x); // (3)
        }
    }
}
```
Kết quả khi khởi tạo `Inner` và gọi `print()` là gì?
A) `30 20 10`
B) `10 20 30`
C) `30 30 10`
D) Lỗi biên dịch vì Inner truy cập biến private.

**Câu 11:** Trong các thành phần sau của Java, thành phần nào KHÔNG THỂ khai báo biến (fields) kiểu instance (không phải static)?
A) Enum
B) Abstract Class
C) Interface
D) Record (ở phần body của class)

**Câu 12:** Khi thực hiện ghi đè (overriding), luật nào đúng?
A) Access modifier có thể thu hẹp (VD: từ `protected` xuống `default`).
B) Kiểu trả về (return type) có thể là lớp cha của kiểu ban đầu.
C) Phương thức overriding có thể ném thêm RuntimeException bất kỳ.
D) Phương thức overriding có thể ném thêm Checked Exception bất kỳ.

**Câu 13:** Xét đoạn code:
```java
class X {
    static void m() { System.out.print("X"); }
}
class Y extends X {
    static void m() { System.out.print("Y"); }
}
public class Test {
    public static void main(String[] args) {
        X obj = new Y();
        obj.m();
        ((Y)obj).m();
    }
}
```
Kết quả in ra là:
A) `XX`
B) `YY`
C) `XY`
D) Lỗi biên dịch

**Câu 14:** Khi sử dụng `switch` expression trong Java 25 (với pattern matching), điều gì bắt buộc đối với kiểu của argument nếu nó là một lớp `sealed`?
A) Phải có case `default`.
B) Nếu các case đã kiểm tra (cover) toàn bộ các permitted subclasses, không cần `default`.
C) `default` luôn bị cấm.
D) Không thể dùng pattern matching trên lớp `sealed`.

**Câu 15:** Cho phương thức sau chứa một local class:
```java
void doSomething() {
    int count = 10;
    class LocalTask {
        void run() { System.out.println(count); }
    }
    count = 20; // Dòng 5
    new LocalTask().run();
}
```
Điều gì sẽ xảy ra?
A) Code chạy và in ra 10.
B) Code chạy và in ra 20.
C) Lỗi biên dịch tại dòng 5 vì count bị thay đổi, làm mất tính effectively final.
D) Lỗi biên dịch ở dòng in ra `count` vì local class không được truy cập biến của hàm bao ngoài.

---

## ANSWER KEY & EXPLANATIONS (ĐÁP ÁN & GIẢI THÍCH)

**1. B**
_Giải thích:_ Java 22 cho phép Flexible Constructor Bodies. Lệnh tính toán `int total = base + extraWheels;` được chạy trước `super(6)`. Do `base` là static field, có thể truy cập được. In ra `V6`. Sau khi `super()` xong, tiếp tục in ra `C1`.

**2. E**
_Giải thích:_ Mã hoàn toàn hợp lệ. A là lớp `sealed` permit B và C. B dùng `final` (hợp lệ). C dùng `sealed` (hợp lệ, C lại permit D). D dùng `non-sealed` (hợp lệ, do đó D mở hoàn toàn). E extend D là hợp lệ vì D là `non-sealed`.

**3. C, D**
_Giải thích:_ Record sinh ra các class `final` ngầm định (D đúng). Compact constructor không cần danh sách tham số (C đúng). A sai vì record không extend class khác. B sai vì không được có thêm instance variables ngoài các thành phần khai báo. E sai vì fields là `final` (immutable).

**4. D**
_Giải thích:_ Diamond problem xảy ra ở dòng 7, nhưng class `Robot` đã giải quyết xung đột bằng cách chủ động override hàm `walk()` ở dòng 8-10. Cú pháp `Walkable.super.walk()` hợp lệ.

**5. C**
_Giải thích:_ Trap kinh điển về initialization order.
- Khi gọi `new Beta()`, `super()` (hàm tạo của Alpha) được gọi trước.
- Biến `type` của Alpha bằng "A". Nhưng hàm `print()` bị override bởi Beta!
- Hàm `print()` của Beta được gọi (Virtual Method Invocation), nó lấy biến `type` của Beta.
- Lúc này `type` của Beta CHƯA được khởi tạo (vì các instance variables của con chỉ khởi tạo sau khi constructor của cha hoàn tất). Nên `type` mang giá trị mặc định là `null`. In ra `null `.
- Xong `super()`, Beta khởi tạo `type = "B"`, gọi `print()` ở hàm tạo của Beta in ra `B `.

**6. B**
_Giải thích:_ Từ Java 21+, từ khóa được sử dụng trong Guarded Patterns là `when` chứ không phải toán tử `&&`. Cấu trúc B dùng `&&` là sai cú pháp. Các đáp án khác A, C, D đều đúng cú pháp Java 21+. `_` (unnamed variables) là chuẩn thức.

**7. B, D**
_Giải thích:_ Constructor của enum mặc định là `private` và không thể tạo đối tượng enum bên ngoài class (C sai). Hằng số enum phải khai báo ở dòng đầu tiên, nhưng các dòng code vẫn hợp lệ (A sai, D đúng). `message` không nhất thiết phải final (E sai). Code biên dịch hoàn toàn hợp lệ.

**8. A**
_Giải thích:_ Đây là tính năng Record Patterns (Destructuring). Biến `a` và `b` nhận giá trị trích xuất (extract) từ `x` và `y` tương ứng của point. Tên biến không cần trùng với field của record. Kết quả in ra là 30 (10+20).

**9. D**
_Giải thích:_ Với Flexible Constructor Bodies, không được phép truy cập/tham chiếu đến bản thân object (`this`) hoặc superclass object thông qua instance methods/variables trước khi constructor của superclass (lệnh `super()` hoặc `this()`) thực thi xong. A, B, C đều là biến cục bộ/static hoặc code tĩnh hợp lệ.

**10. A**
_Giải thích:_ Shadowing ở Nested class:
- `x` cục bộ in ra 30.
- `this.x` (biến của class Inner) in ra 20.
- `Outer.this.x` (biến của class Outer) in ra 10.

**11. C, D**
_Giải thích:_ Interface chỉ cho phép `public static final` fields. Trong phần thân `{}` của một Record, bạn cũng không được phép khai báo thêm các instance variables (nhưng static thì được). (Câu này mang tính khái niệm chung, có thể hiểu là Interface và Record Body).

**12. C**
_Giải thích:_ Khi override, bạn có thể ném thêm bất kỳ Unchecked Exception (RuntimeException) nào mà không gây lỗi (C đúng). A sai vì access modifier chỉ được mở rộng, không thu hẹp. B sai vì return type chỉ được là covariant (lớp con), không được là lớp cha. D sai vì không được ném checked exception mới/rộng hơn.

**13. C**
_Giải thích:_ Static methods bị HIDING (ẩn), không bị OVERRIDING (ghi đè đa hình). Trình biên dịch dựa vào kiểu biến tham chiếu (Reference Type) để quyết định phương thức static nào được gọi. `obj` có kiểu tham chiếu là `X` -> in ra `X`. Khi ép kiểu `((Y)obj)` -> tham chiếu là `Y` -> in ra `Y`.

**14. B**
_Giải thích:_ Switch expressions đòi hỏi Exhaustiveness (tính bao phủ hoàn toàn). Nếu type của argument là `sealed`, và switch có đầy đủ tất cả `case` cho mọi permitted subclasses, compiler tự hiểu là exhaustive và bạn KHÔNG CẦN (và đôi khi không nên) thêm `default`.

**15. C**
_Giải thích:_ Local Class hoặc Anonymous Class chỉ có thể sử dụng các biến cục bộ (local variables) của phương thức bao ngoài nếu biến đó là `final` hoặc `effectively final`. Vì dòng 5 biến `count` bị gán lại giá trị 20, nó không còn effectively final, gây lỗi biên dịch ở class bên trong khi cố truy cập `count`.
