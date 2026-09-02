---
title: "Phase 7: Chiến lược thi & Đề thi thử (Mock Exam) - OCP Java SE 25 (1Z0-831)"
order: 5
phase: "Phase 7"
tags: ["Mock Exam", "Handbook", "Labs", "Traps", "Master Question Bank"]
---
# Phase 7: Chiến lược thi & Đề thi thử (Mock Exam) - OCP Java SE 25 (1Z0-831)

Tài liệu này cung cấp chiến lược làm bài thi thực tế và một đề thi thử toàn diện mô phỏng kỳ thi OCP Java SE 25 (1Z0-831).

---

## Phần 1: Hướng dẫn Chiến lược thi

### Quản lý thời gian
- **Thời lượng:** 120 phút cho 50 câu hỏi (trung bình 2.4 phút/câu).
- **Chiến lược Mark & Move:** Đừng kẹt lại ở một câu hỏi quá 3 phút. Nếu chưa tìm ra đáp án, hãy đánh dấu (mark), chọn tạm một đáp án cảm thấy đúng nhất và chuyển sang câu tiếp theo.
- **Khi nào nên đoán:** Kỳ thi không trừ điểm cho câu trả lời sai. LUÔN LUÔN chọn một đáp án trước khi hết giờ.

### Các "Cạm bẫy" (Traps) phổ biến
> [!WARNING]
> Hãy cẩn thận với những lỗi thường gặp sau đây trong kỳ thi:

1. **Thiếu import statements:** Mã sử dụng `List`, `LocalDate` nhưng không có `import java.util.*;` hay `import java.time.*;` -> Lỗi biên dịch.
2. **Đối tượng Immutable (String, LocalDate):** Gọi phương thức thay đổi giá trị nhưng không gán lại (`str.concat("a");` thay vì `str = str.concat("a");`).
3. **Autoboxing NullPointerException:** Gán `null` cho `Integer`, sau đó dùng như `int` hoặc dùng trong phép toán.
4. **Stream reuse:** Một Stream chỉ được tiêu thụ (consume) một lần. Gọi terminal operation lần thứ hai sẽ ném `IllegalStateException`.
5. **Giới hạn của `var`:** Không thể dùng `var` cho thuộc tính của lớp, tham số phương thức, hoặc khởi tạo với `null` mà không ép kiểu.
6. **Câu hỏi "Select TWO/THREE":** Luôn chú ý số lượng đáp án cần chọn.
7. **Switch exhaustiveness:** `switch` expression hoặc pattern matching phải bao quát tất cả các trường hợp (hoặc có `default`).
8. **Record và Sealed class:** `record` không thể extends lớp khác (đã tự động extends `Record`), `sealed` class phải có danh sách `permits` hoặc các subclass nằm trong cùng một file.

### Checklist Đọc Code
1. **Kiểm tra biên dịch trước:** Có import không? Các biến đã được khởi tạo chưa? Có lỗi cú pháp/kiểu dữ liệu không?
2. **Kiểm tra Runtime:** Có khả năng `NullPointerException`, `IndexOutOfBoundsException`, `ClassCastException` không?
3. **Phân tích Logic:** Đọc kỹ từng vòng lặp, điều kiện rẽ nhánh.

---

## Phần 2: Đề thi thử Toàn diện (Trích xuất)

*(Để phù hợp với định dạng, đề thi thử này cung cấp các câu hỏi khó bao phủ toàn bộ các chủ đề).*

### Câu 1 (Phase 1)
Đoạn mã sau in ra kết quả gì?
```java
public class Main {
    public static void main(String[] args) {
        int x = 5;
        int y = x++ * ++x;
        System.out.println(y);
    }
}
```
A) 25  
B) 30  
C) 35  
D) Lỗi biên dịch

### Câu 2 (Phase 1)
Chọn HAI câu phát biểu đúng về từ khóa `var`:
A) `var` có thể được sử dụng để khai báo kiểu trả về của phương thức.
B) `var` có thể được gán `null` nếu được ép kiểu rõ ràng, ví dụ: `var x = (String) null;`.
C) `var` không thể được dùng trong vòng lặp for.
D) `var` chỉ có thể dùng cho biến cục bộ (local variables).

### Câu 3 (Phase 2)
Đoạn mã sau in ra gì?
```java
class A {
    static void print() { System.out.print("A"); }
}
class B extends A {
    static void print() { System.out.print("B"); }
}
public class Test {
    public static void main(String[] args) {
        A obj = new B();
        obj.print();
    }
}
```
A) A  
B) B  
C) Lỗi biên dịch  
D) Ném ngoại lệ tại runtime

### Câu 4 (Phase 2)
Cho định nghĩa record sau:
```java
public record Point(int x, int y) {
    public Point {
        if (x < 0) x = 0;
    }
}
```
Đoạn mã trên có biên dịch được không?
A) Có, và nó biên dịch thành một compact constructor hợp lệ.
B) Không, compact constructor không được thay đổi giá trị của tham số đầu vào.
C) Không, vì thiếu gán `this.x = x`.
D) Có, nhưng `x` không bao giờ bị thay đổi.

### Câu 5 (Phase 2)
Lớp `Vehicle` được khai báo như sau:
```java
public sealed class Vehicle permits Car, Truck {}
final class Car extends Vehicle {}
non-sealed class Truck extends Vehicle {}
```
Chọn MỘT phát biểu SAI:
A) `Car` không thể có lớp con.
B) `Truck` có thể được kế thừa bởi bất kỳ lớp nào khác.
C) Nếu `Car` và `Truck` nằm ở một file khác `Vehicle`, mã vẫn biên dịch thành công mà không cần cấu hình gì thêm.
D) `Vehicle` quản lý chặt chẽ những lớp nào được phép kế thừa trực tiếp từ nó.

### Câu 6 (Phase 3)
```java
import java.util.*;
public class Main {
    public static void main(String[] args) {
        List<String> list = new ArrayList<>(List.of("A", "B", "C"));
        for (String s : list) {
            if (s.equals("B")) {
                list.remove(s);
            }
        }
        System.out.println(list);
    }
}
```
A) [A, C]  
B) [A, B, C]  
C) Lỗi biên dịch  
D) ConcurrentModificationException bị ném ra tại runtime

### Câu 7 (Phase 3)
```java
import java.util.*;
public class Main {
    public static void main(String[] args) {
        var map = new HashMap<String, Integer>();
        map.put("A", 1);
        map.put("B", 2);
        map.merge("A", 3, (v1, v2) -> v1 + v2);
        map.merge("B", 3, (v1, v2) -> null);
        System.out.println(map);
    }
}
```
A) {A=4, B=null}  
B) {A=4, B=5}  
C) {A=4}  
D) {A=4, B=3}

### Câu 8 (Phase 4)
Đoạn mã sau có kết quả gì?
```java
import java.util.stream.*;
public class StreamTest {
    public static void main(String[] args) {
        Stream<Integer> s = Stream.of(1, 2, 3);
        s.map(i -> i * 2);
        long count = s.count();
        System.out.println(count);
    }
}
```
A) 3  
B) 6  
C) IllegalStateException tại runtime  
D) Lỗi biên dịch

### Câu 9 (Phase 4)
Để gộp tất cả các chuỗi trong `Stream<String>` bằng dấu phẩy `,`, cách nào sau đây đúng? (Chọn HAI)
A) `stream.collect(Collectors.joining(","))`
B) `stream.reduce((a, b) -> a + "," + b).orElse("")`
C) `stream.join(",")`
D) `stream.collect(Collectors.concat(","))`

### Câu 10 (Phase 5)
```java
import java.io.*;
public class Main {
    public void readFile() {
        try (var br = new BufferedReader(new FileReader("test.txt"))) {
            throw new IOException("File error");
        } catch (IOException e) {
            System.out.println(e.getMessage());
        } finally {
            System.out.println("Done");
        }
    }
}
```
Giả sử tệp "test.txt" không tồn tại. Kết quả in ra là gì?
A) File error \n Done
B) test.txt (No such file or directory) \n Done
C) Lỗi biên dịch
D) Chương trình crash không in ra Done

### Câu 11 (Phase 6 - Java 21+)
Pattern matching trong switch:
```java
public class Main {
    public static void main(String[] args) {
        Object obj = 123;
        String result = switch(obj) {
            case String s -> "String";
            case Integer i when i > 100 -> "Large Integer";
            case Integer i -> "Small Integer";
            default -> "Unknown";
        };
        System.out.println(result);
    }
}
```
A) Large Integer
B) Small Integer
C) Lỗi biên dịch ở từ khóa `when`
D) Lỗi biên dịch vì `switch` expressions không hỗ trợ logic này.

### Câu 12 (Phase 5)
Sử dụng Concurrency:
```java
import java.util.concurrent.*;
public class Main {
    public static void main(String[] args) {
        ExecutorService service = Executors.newFixedThreadPool(1);
        Future<Integer> future = service.submit(() -> {
            Thread.sleep(1000);
            return 42;
        });
        service.shutdownNow();
        try {
            System.out.println(future.get());
        } catch (Exception e) {
            System.out.println("Exception");
        }
    }
}
```
Kết quả in ra màn hình là gì?
A) 42
B) Exception
C) null
D) Không bao giờ dừng (Deadlock)


---

## Phần 3: Đáp án và Giải thích chi tiết

**Câu 1:** C
- **Giải thích:** Khởi tạo `x = 5`. Trong biểu thức `y = x++ * ++x`:
  - `x++` trả về 5 (và `x` trở thành 6).
  - Tiếp theo, `++x` tăng `x` lên thành 7 và trả về 7.
  - Vậy `y = 5 * 7 = 35`. Cạm bẫy: thứ tự ưu tiên của toán tử và cách hoạt động của tiền tố/hậu tố.

**Câu 2:** B, D
- **Giải thích:** `var` chỉ dùng cho biến cục bộ (local variables) (D đúng). Không dùng cho thuộc tính hay tham số (A sai). `var` dùng được trong vòng lặp `for (var x : list)` (C sai). `var` có thể gán null nếu có ép kiểu `(String) null` (B đúng).

**Câu 3:** A
- **Giải thích:** Phương thức tĩnh (static method) không bị override (ghi đè) mà chỉ bị ẩn (hide). Kiểu tham chiếu của `obj` là `A`, nên phương thức tĩnh được gọi phụ thuộc vào kiểu tham chiếu tĩnh chứ không phải kiểu đối tượng runtime, vậy `A.print()` được gọi.

**Câu 4:** A
- **Giải thích:** Đây là một compact constructor hợp lệ. Tham số `x` và `y` ở đây đóng vai trò biến cục bộ trong constructor, việc gán `x = 0` là hợp lệ. Trình biên dịch sẽ tự động chèn `this.x = x; this.y = y;` ở cuối khối. 

**Câu 5:** C
- **Giải thích:** Một `sealed class` bắt buộc các class con nằm khác file phải được chỉ định rõ qua `permits` và phải nằm trong cùng package (hoặc cùng module). Phát biểu C SAI vì không thể để chúng nằm tuỳ ý mà không theo quy tắc package.

**Câu 6:** D
- **Giải thích:** Đây là cạm bẫy kinh điển. Duyệt qua `ArrayList` bằng vòng lặp for-each (sử dụng Iterator ngầm) và đồng thời thay đổi kích thước danh sách bằng `list.remove()` trực tiếp sẽ dẫn đến `ConcurrentModificationException`.

**Câu 7:** C
- **Giải thích:** Phương thức `merge` áp dụng hàm remapping. Với `"A"`, hàm remapping `1+3=4`, map thành `{A=4}`. Với `"B"`, hàm trả về `null`. Trong Map, khi hàm remapping trả về `null`, key đó sẽ bị xóa. Vậy map chỉ còn `{A=4}`.

**Câu 8:** C
- **Giải thích:** Lời gọi `s.map(i -> i * 2)` trả về một Stream mới, nhưng nó thao tác trực tiếp trên dòng gốc `s`. Theo đặc tả Java, khi một operation được gọi trên Stream, dòng đó coi như đã bị tiêu thụ (operated upon). Gọi `s.count()` trên tham chiếu `s` đã dùng sẽ ném `IllegalStateException`.

**Câu 9:** A, B
- **Giải thích:** `Collectors.joining(",")` là cách chuẩn. Cách dùng `reduce((a, b) -> a + "," + b).orElse("")` cũng hoạt động (mặc dù giảm hiệu suất hơn so với joining). C và D không tồn tại trong API chuẩn.

**Câu 10:** B
- **Giải thích:** Khối `try-with-resources` cố gắng khởi tạo `FileReader("test.txt")`. Nếu file không tồn tại, nó ném `FileNotFoundException` (con của `IOException`) TRƯỚC KHI đi vào trong thân block. Do đó exception được catch là exception từ việc khởi tạo, thông báo của nó thường là `test.txt (No such file or directory)`. Sau đó khối `finally` in ra `Done`. 

**Câu 11:** A
- **Giải thích:** Ở Java 21+, pattern matching cho switch sử dụng `when` làm guard clause. `obj` là `Integer = 123`. Nó khớp `case Integer i when i > 100`, trả về "Large Integer". (Thay thế cho từ khóa cũ mà một số syntax preview từng dùng).

**Câu 12:** B
- **Giải thích:** `shutdownNow()` sẽ gửi tín hiệu interrupt tới các thread đang chạy. `Thread.sleep(1000)` sẽ bị gián đoạn và ném `InterruptedException`. Do ngoại lệ xảy ra bên trong Callable, nó được chuyển thành `ExecutionException` khi gọi `future.get()`. Khối catch bên ngoài sẽ bắt và in "Exception".

> [!TIP]
> Hãy thực hành viết mã và cố gắng tự mình gây ra các lỗi như trên. Không có gì hiệu quả hơn việc học từ những lỗi sai khi tự tay gõ lệnh!
