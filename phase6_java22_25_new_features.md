# Giai đoạn 6: Các tính năng mới của Java 22 - 25 (OCP Java SE 25 - 1Z0-831)

Tài liệu này bao gồm **tất cả** các tính năng mới từ Java 22 đến Java 25 có thể xuất hiện trong bài thi chứng chỉ OCP Java SE 25 Developer (1Z0-831).

---

## 6.1 Flexible Constructor Bodies (JEP 482 — Java 24, Final trong Java 25)

> [!NOTE]
> Trước Java 22, câu lệnh `super()` hoặc `this()` (nếu có) phải là câu lệnh **đầu tiên** trong constructor. JEP 482 thay đổi điều này, cho phép viết các đoạn mã khởi tạo, tính toán và xác thực *trước* khi gọi constructor của lớp cha hoặc constructor khác.

### Động lực (Motivation)
Việc bắt buộc `super()` phải đứng đầu gây khó khăn nếu chúng ta cần tính toán phức tạp hoặc xác thực tham số (validate) trước khi truyền cho lớp cha, hoặc khi lớp cha tốn nhiều tài nguyên khởi tạo trong khi tham số đầu vào lại không hợp lệ.

### Quy tắc (Rules)

#### NHỮNG ĐIỀU ĐƯỢC PHÉP (CAN do before `super()`/`this()`)
1. Khai báo biến cục bộ.
2. Thực hiện các cấu trúc điều khiển (`if`, `for`, `try-catch`).
3. Đọc biến `static`, gọi phương thức `static`.
4. **Đặc biệt (từ JEP 482)**: Gán giá trị (assign) cho các trường (fields) của chính đối tượng hiện tại (`this.field`).

#### NHỮNG ĐIỀU KHÔNG ĐƯỢC PHÉP (CANNOT do before `super()`/`this()`)
1. **Không được ĐỌC** bất kỳ trường instance nào của đối tượng (dù đã gán hay chưa).
2. **Không được GỌI** bất kỳ phương thức instance nào của đối tượng.
3. **Không được sử dụng `this`** như một tham số truyền vào phương thức khác.

### Ví dụ (Code Examples)

```java
public class PositiveNumber extends Number {
    private final int value;
    private final long timestamp;

    public PositiveNumber(int value) {
        // HỢP LỆ: Xác thực trước khi gọi super()
        if (value <= 0) {
            throw new IllegalArgumentException("Must be positive");
        }
        
        // HỢP LỆ: Gán giá trị cho field TRƯỚC super() - Tính năng mới JEP 482!
        this.timestamp = System.currentTimeMillis();
        
        // Gọi lớp cha
        super();
        
        // HỢP LỆ: Gán giá trị bình thường SAU super()
        this.value = value;
    }

    // LỖI BIÊN DỊCH (DOES NOT COMPILE)
    public PositiveNumber(int value, boolean flag) {
        this.value = value; // Hợp lệ (Gán trước super)
        
        // LỖI: Không được phép ĐỌC this.value trước khi super() hoàn tất
        // System.out.println(this.value); 
        
        // LỖI: Không được gọi instance method trước super()
        // this.printInfo();
        
        super();
    }
}
```

> [!WARNING]
> **Trap đi thi:** Bài thi sẽ cố tình gài một constructor mà trong đó có lệnh in ra (hoặc đọc) giá trị của một field đã được gán trước lệnh `super()`. Nhớ kỹ: **Gán thì được, nhưng ĐỌC thì KHÔNG THỂ trước khi `super()` kết thúc.**

---

## 6.2 Instance Main Methods (JEP 495 — Java 25)

> [!TIP]
> Java 21 giới thiệu tính năng này dưới dạng Preview và Java 25 chính thức hoàn thiện. Giờ đây, bạn không cần phải viết `public static void main(String[] args)` phức tạp nữa.

### Launch protocol priority (Thứ tự ưu tiên khởi chạy)
Khi chạy một class `MyProgram`, JVM sẽ tìm kiếm phương thức khởi chạy theo thứ tự ưu tiên sau:
1. `static void main(String[] args)` (Truyền thống, ưu tiên cao nhất)
2. `static void main()`
3. `void main(String[] args)` (Instance method)
4. `void main()` (Instance method không tham số, ưu tiên thấp nhất)

### Lớp IO và Implicit Classes
Java 25 tự động import (ngầm định) class `java.io.IO`, cung cấp các phương thức như `println()`, `readln()` để sử dụng trực tiếp.
Đồng thời, bạn có thể tạo **Implicit class** (không cần khai báo `class` bao bọc bên ngoài).

```java
// Tập tin: HelloWorld.java
// Không cần public class HelloWorld { ... }

void main() {
    println("Hello, Instance Main!"); // Lấy từ java.io.IO
    String name = readln("What is your name? ");
    println("Welcome, " + name);
}
```

> [!CAUTION]
> **Trap đi thi:** Nếu một class định nghĩa cả `static void main(String[] args)` và `void main()`, và bạn chạy class đó, JVM sẽ chỉ gọi bản **static có tham số**. Hãy nhớ kỹ thứ tự ưu tiên!

---

## 6.3 Unnamed Variables & Patterns (JEP 456 — Java 22)

Cho phép sử dụng ký tự gạch dưới `_` thay cho tên biến khi bạn **không định sử dụng biến đó**. 
Điểm đặc biệt nhất: Bạn có thể khai báo **nhiều biến `_` trong cùng một phạm vi (scope)** mà không bị lỗi trùng tên biến.

### Các trường hợp sử dụng hợp lệ

```java
public class UnnamedExample {
    public void process(Object obj) {
        // 1. Unnamed variable trong catch
        try {
            int x = 10 / 0;
        } catch (ArithmeticException _) { // HỢP LỆ
            System.out.println("Lỗi toán học!");
        } catch (Exception _) {           // HỢP LỆ, _ không bị trùng
            System.out.println("Lỗi chung!");
        }

        // 2. Unnamed variable trong vòng lặp for
        int count = 0;
        for (String _ : List.of("A", "B", "C")) {
            count++; // Bỏ qua giá trị phần tử
        }

        // 3. Unnamed pattern trong instanceof / switch
        if (obj instanceof Point(int x, int _)) { 
            // Chỉ quan tâm x, không quan tâm y
            System.out.println("X = " + x);
        }

        // 4. Lambda parameter
        BiFunction<Integer, Integer, Integer> add = (a, _) -> a + 10;
        
        // 5. Try-with-resources
        try (var _ = new ScopedResource()) {
            System.out.println("Làm việc với resource");
        }
    }
}
```

---

## 6.4 Module Import Declarations (JEP 494 — Java 25)

Cú pháp mới để import tất cả các gói (packages) được export bởi một module cụ thể.

```java
import module java.base; // Import toàn bộ public packages của java.base
import module java.sql;
```

### Xử lý nhập nhằng (Ambiguity Resolution)
Mức độ ưu tiên của các loại import từ cao xuống thấp:
1. **Single-type-import** (vd: `import java.util.Date;`)
2. **Type-import-on-demand** (vd: `import java.util.*;`)
3. **Module-import** (vd: `import module java.base;`)

> [!WARNING]
> **Trap đi thi:** Nếu dùng `import module java.base;` và `import module java.sql;`, cả hai đều export class tên là `Date` (`java.util.Date` và `java.sql.Date`). Nếu trong code bạn dùng trực tiếp `Date d = ...;`, trình biên dịch sẽ báo **lỗi Ambiguous** (Không rõ ràng). Giải pháp là thêm `import java.sql.Date;` (ưu tiên cao hơn) hoặc dùng tên đầy đủ (FQCN).

---

## 6.5 Stream Gatherers (JEP 485 — Java 25)

> [!IMPORTANT]
> `Stream API` bổ sung một intermediate operation mới là `gather(Gatherer)`. Đây là mảnh ghép còn thiếu để tạo các phép biến đổi Stream phức tạp (như stateful mapping) mà không làm mất tính song song (parallel) của Stream.

### Built-in Gatherers (trong `java.util.stream.Gatherers`)

1. **`windowFixed(int size)`**: Nhóm các phần tử thành các list có kích thước cố định.
2. **`windowSliding(int size)`**: Nhóm thành list trượt (sliding window).
3. **`fold(Supplier, BiFunction)`**: Giống `reduce` nhưng có thể thay đổi kiểu dữ liệu, dừng lại tại bất kỳ điểm nào, tạo thành Stream chứa **1 phần tử duy nhất**.
4. **`scan(Supplier, BiFunction)`**: Tương tự `fold` nhưng giữ lại toàn bộ các giá trị trung gian (prefix scan).
5. **`mapConcurrent(int maxConcurrency, Function)`**: Chạy map đồng thời, hữu ích khi hàm map bị block (IO-bound).

```java
import java.util.stream.*;
import java.util.List;

public class GathererDemo {
    public static void main() {
        // 1. windowFixed
        List<List<Integer>> fixed = Stream.of(1, 2, 3, 4, 5)
            .gather(Gatherers.windowFixed(3))
            .toList();
        // Kết quả: [[1, 2, 3], [4, 5]]

        // 2. windowSliding
        List<List<Integer>> sliding = Stream.of(1, 2, 3, 4)
            .gather(Gatherers.windowSliding(2))
            .toList();
        // Kết quả: [[1, 2], [2, 3], [3, 4]]
    }
}
```

---

## 6.6 Scoped Values (JEP 487 — Java 25)

Scoped Values là công cụ thay thế cho `ThreadLocal` nhằm truyền dữ liệu (data) sâu xuống call stack mà không cần khai báo tham số. 
Đặc điểm nổi bật: **Immutable (Bất biến)**, **Vòng đời hẹp (Chỉ tồn tại trong khối `run()` hoặc `call()`)**, cực kỳ phù hợp và tối ưu bộ nhớ cho **Virtual Threads**.

```java
public class ScopedValueDemo {
    // Khai báo một ScopedValue
    private static final ScopedValue<String> USER_NAME = ScopedValue.newInstance();

    public static void main() {
        // Gắn (bind) giá trị và chạy hàm
        ScopedValue.where(USER_NAME, "DatPham").run(() -> {
            processRequest(); 
        });
        
        // Bên ngoài khối run, isBound() trả về false
        System.out.println(USER_NAME.isBound()); // false
    }

    private static void processRequest() {
        // Lấy giá trị ra
        if (USER_NAME.isBound()) {
            System.out.println("Processing for: " + USER_NAME.get());
        }
    }
}
```

> [!CAUTION]
> Gọi `USER_NAME.get()` khi Scoped Value chưa được bind (isBound() == false) sẽ ném ra ngoại lệ `NoSuchElementException`. Đây là điểm bài thi hay kiểm tra!

---

## 6.7 Structured Concurrency (JEP 505 — Preview trong Java 25)

Cho phép gộp nhiều concurrent tasks thành một đơn vị công việc duy nhất để quản lý vòng đời và lỗi dễ dàng hơn bằng `StructuredTaskScope`. (Lưu ý: Tính năng preview ít khi có câu hỏi khó, nhưng cần nhận diện cú pháp).

```java
import java.util.concurrent.StructuredTaskScope;

void handle() throws InterruptedException {
    try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {
        // fork()
        StructuredTaskScope.Subtask<String> task1 = scope.fork(() -> fetchA());
        StructuredTaskScope.Subtask<Integer> task2 = scope.fork(() -> fetchB());
        
        // join() tất cả và tự động xử lý huỷ bỏ nếu có 1 task lỗi
        scope.join().throwIfFailed();
        
        System.out.println(task1.get() + task2.get());
    }
}
```

---

## 6.8 Các thay đổi đáng chú ý khác (Other Notable Changes)

- Lớp `Console`: Giờ có các phương thức tiện lợi thay thế `System.out.print` và `Scanner`. VD: `System.console().readLine()`.
- Lớp `IO`: Các hàm tĩnh `IO.println` và `IO.readln`.
- **Primitive types in patterns**: Hỗ trợ kiểu nguyên thuỷ (int, long...) trực tiếp trong pattern matching `instanceof` và `switch` (tuy nhiên vẫn ở dạng Preview JEP 455 - chưa chính thức).

---

## Bài tập trắc nghiệm (Quiz - 15 câu hỏi)

**Câu 1:** Xem đoạn mã sau sử dụng tính năng Flexible Constructor.
```java
class Person {
    String name;
}
class Employee extends Person {
    int id;
    Employee(int id, String name) {
        this.id = id; 
        System.out.println(this.id);
        super();
        this.name = name;
    }
}
```
Kết quả khi biên dịch là gì?
A) Biên dịch thành công và chương trình chạy bình thường.
B) Lỗi biên dịch vì `this.id` không thể được gán (assigned) trước khi gọi `super()`.
C) Lỗi biên dịch vì không được gọi `super()` sau khi thực hiện các phép gán.
D) Lỗi biên dịch vì không được PHÉP ĐỌC `this.id` trong lệnh `println` trước khi gọi `super()`.

**Câu 2:** Một chương trình Java chỉ có nội dung sau nằm trong một file `App.java`:
```java
void main(String[] args) {
    System.out.println("A");
}
static void main(String[] args) {
    System.out.println("B");
}
void main() {
    System.out.println("C");
}
```
Nếu chạy bằng lệnh `java App.java`, kết quả in ra là gì?
A) A
B) B
C) C
D) Lỗi biên dịch vì có quá nhiều hàm main.

**Câu 3:** Trong cùng một khối `catch`, đoạn mã sau có hợp lệ trong Java 22+ không?
```java
try {
    // code
} catch (IllegalArgumentException _) {
    System.out.println("Lỗi A");
} catch (NullPointerException _) {
    System.out.println("Lỗi B");
}
```
A) Không hợp lệ vì biến `_` bị trùng tên.
B) Hợp lệ, chương trình biên dịch bình thường.
C) Lỗi biên dịch, `_` chỉ được dùng cho biến cục bộ, không dùng được cho tham số ngoại lệ.

**Câu 4:** Tính năng "Module Import Declarations". Khi bạn viết đoạn code sau:
```java
import module java.base;
import module java.sql;
// Cả hai module đều export lớp Date
```
Và bạn sử dụng class `Date` trong mã nguồn mà không import tường minh class nào. Chuyện gì sẽ xảy ra?
A) Ưu tiên sử dụng `java.util.Date` vì `java.base` là module cốt lõi.
B) Ưu tiên sử dụng `java.sql.Date`.
C) Lỗi biên dịch do nhập nhằng (ambiguous) giữa 2 lớp Date.
D) Trình biên dịch cảnh báo nhưng chọn class đầu tiên được phát hiện.

**Câu 5:** Kết quả của đoạn code sử dụng Stream Gatherers sau đây là gì?
```java
var result = Stream.of("A", "B", "C", "D")
                   .gather(Gatherers.windowSliding(2))
                   .toList();
System.out.println(result.size());
```
A) 2
B) 3
C) 4
D) 5

**Câu 6:** Khi làm việc với `ScopedValue`, phương thức nào dùng để tạo ra một ScopedValue mới?
A) `new ScopedValue<>()`
B) `ScopedValue.create()`
C) `ScopedValue.newInstance()`
D) `ScopedValue.of()`

**Câu 7:** (Chọn HAI đáp án). Những hành động nào bị CẤM thực hiện **trước** lệnh `super()` trong Java 25 (Flexible Constructor Bodies)?
A) Gọi một phương thức static của lớp đó.
B) Gọi một phương thức instance của lớp đó.
C) Gán giá trị cho một biến instance của lớp đó.
D) Truyền tham chiếu `this` vào một phương thức thuộc lớp khác.
E) Khai báo và gán giá trị cho một biến cục bộ (local variable).

**Câu 8:** Xem đoạn mã sau:
```java
void process(int code) {
    switch (code) {
        case 1, _ -> System.out.println("One or other"); // Dòng 1
        default -> System.out.println("Default");
    }
}
```
Khẳng định nào đúng?
A) Dòng 1 bị lỗi biên dịch vì không thể dùng `_` (unnamed pattern) cho kiểu nguyên thuỷ (primitive type) trong case switch (không phải pattern switch).
B) Hợp lệ, in ra "One or other".
C) Dòng 1 hợp lệ, nhưng báo lỗi vì `_` và `default` gây trùng lặp logic.

**Câu 9:** Output của đoạn mã sau là gì?
```java
public class Demo {
    static final ScopedValue<String> SV = ScopedValue.newInstance();
    public static void main(String[] args) {
        ScopedValue.where(SV, "Value1").run(() -> {
            ScopedValue.where(SV, "Value2").run(() -> {
                System.out.print(SV.get() + " ");
            });
            System.out.print(SV.get());
        });
    }
}
```
A) Value1 Value1
B) Value2 Value1
C) Value2 Value2
D) Runtime Exception tại lần gọi `where()` thứ hai.

**Câu 10:** Khi sử dụng `Gatherers.fold`, điều gì phân biệt nó với phép toán `reduce` thông thường của Stream?
A) `fold` không thể trả về giá trị kiểu dữ liệu khác với cấu trúc phần tử của Stream, còn `reduce` thì có thể.
B) `fold` có thể dừng (short-circuit) việc duyệt Stream bất cứ lúc nào, trong khi `reduce` bắt buộc duyệt hết các phần tử.
C) `fold` sinh ra một List các phần tử kết quả, còn `reduce` trả về một số.
D) `fold` không hoạt động với parallel stream.

**Câu 11:** Trong `StructuredTaskScope.ShutdownOnFailure`, nếu có 3 subtasks, trong đó 1 subtask ném ra ngoại lệ và 2 subtasks khác đang chạy. Điều gì xảy ra?
A) Scope sẽ tự động gọi phương thức hủy bỏ (cancel) đối với 2 tasks đang chạy còn lại.
B) Scope sẽ chờ 2 tasks còn lại chạy xong rồi mới ném ra lỗi.
C) Scope sẽ bỏ qua lỗi và trả về null cho task thất bại.
D) Chương trình văng `OutOfMemoryError`.

**Câu 12:** Lớp `IO` được import ngầm định (implicitly imported) cung cấp phương thức `println`. Có thể sử dụng lớp `IO` trong các class được khai báo `public class` thông thường thay vì implicit class được không?
A) Không, `IO` chỉ dành cho Implicit classes / Instance main methods.
B) Có, nhưng bạn phải tự thêm `import static java.io.IO.*;` hoặc `import module java.base;` đối với class thông thường.

**Câu 13:** Code sau có in ra lỗi không?
```java
BiFunction<String, String, Boolean> isEqual = (_, _) -> true;
System.out.println(isEqual.apply("A", "B"));
```
A) Có lỗi vì thiếu dấu gạch dưới hợp lệ.
B) Có lỗi vì nhiều `_` trong cùng một danh sách tham số.
C) Biên dịch thành công và in ra `true`.

**Câu 14:** Khi chạy phương thức instance `void main()` bằng lệnh `java`, đối tượng của class được khởi tạo như thế nào?
A) Bằng constructor ngầm định không tham số. Nếu class chỉ có constructor có tham số, chương trình sẽ báo lỗi.
B) JVM bỏ qua khởi tạo và gọi phương thức thông qua Reflection với con trỏ null.
C) Chương trình dùng Unsafe để cấp phát bộ nhớ.

**Câu 15:** Điều kiện tiên quyết để được dùng Unnamed variable `_` trong lệnh `try-with-resources` là gì?
A) Biến phải là kiểu nguyên thuỷ (primitive).
B) Resource phải được gọi phương thức `close()` ngầm định lúc kết thúc và bạn không được phép tham chiếu tới nó bên trong khối `try`.
C) Class của resource phải implement giao diện `AutoCloseable`. (Cả B và C).

---

## Đáp án & Giải thích (Answer Key)

1. **D** - Cú pháp JEP 482 cho phép GÁN trước `super()`, nhưng CẤM việc ĐỌC (bao gồm cả in ra màn hình `this.id`) giá trị field trước khi gọi `super()`.
2. **B** - Thứ tự Launch protocol priority: JVM luôn ưu tiên bản `static void main(String[] args)` cao nhất.
3. **B** - Tính năng mới (JEP 456) cho phép sử dụng ký tự `_` nhiều lần mà không bị lỗi "variable already defined".
4. **C** - Bị lỗi nhập nhằng (ambiguous). Bạn phải phân giải nó bằng cách `import java.sql.Date;` hoặc dùng FQCN (Fully Qualified Class Name).
5. **B** - `windowSliding(2)` trên `[A, B, C, D]` sẽ tạo ra 3 lists: `[A, B]`, `[B, C]`, `[C, D]`. Kết quả in ra `3`.
6. **C** - Cú pháp đúng là `ScopedValue.newInstance()`.
7. **B, D** - Bạn không được phép gọi instance method (B) và không được rò rỉ con trỏ `this` (D) trước lệnh `super()`. Lựa chọn (A) và (C) được phép.
8. **A** - `case 1, _` là không hợp lệ đối với hằng số và switch truyền thống. Unnamed pattern `_` dùng cho cấu trúc pattern matching (vd: `case Point(_, int y)` hoặc `case String _`). 
9. **B** - Scoped Value hỗ trợ **rebinding**. Trong lần lồng ghép (nesting) bên trong, giá trị được re-bind thành "Value2". Khi ra khỏi phạm vi, giá trị phục hồi lại "Value1". Do đó in ra "Value2 Value1".
10. **B** - Tính năng thiết kế nổi bật của Stream Gatherers là cho phép "short-circuiting" linh hoạt mà phép toán `reduce` không làm được.
11. **A** - `ShutdownOnFailure` thiết kế theo tư duy "có lỗi thì dừng tất cả". Nó sẽ cancel các subtasks còn lại ngay lập tức nếu một subtask fail.
12. **B** - Đối với class thông thường (có từ khóa class), nó không tự động import `IO`. Bạn cần import thủ công các package liên quan.
13. **C** - Hợp lệ 100%. Đây là chức năng của Unnamed variable `_` được sử dụng cho cả tham số Lambda.
14. **A** - JVM sẽ dùng reflection khởi tạo đối tượng qua **constructor không tham số**. Nếu bạn tự định nghĩa một constructor có tham số nhưng không có constructor không tham số, runtime sẽ quăng exception vì không biết cách khởi tạo class để gọi `main()`.
15. **C** - Để dùng được trong try-with-resources, đối tượng phải implement `AutoCloseable` và nếu dùng `_`, bạn xác nhận chỉ muốn khối lệnh tự đóng file chứ không dùng đối tượng bên trong block đó. (Cả ý B và C đều là đặc điểm cốt lõi).

---
*Chúc bạn thi tốt chứng chỉ OCP Java SE 25 (1Z0-831)!*
