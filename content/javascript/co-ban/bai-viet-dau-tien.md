---
title: "JavaScript Cơ Bản — Nhập Môn & Tổng Quan"
order: 1
tags: ["JavaScript", "Basics", "Fundamentals"]
---

# Giai đoạn 5: Các Chủ đề Nâng cao (Advanced Topics) - OCP Java SE 25 (1Z0-831)

Tài liệu này bao quát các chủ đề nâng cao quan trọng thường xuất hiện trong bài thi OCP Java SE 25. Bạn cần nắm vững không chỉ cú pháp mà còn cách các thư viện tiêu chuẩn hoạt động, đặc biệt là các cạm bẫy liên quan đến thứ tự thực thi, đa luồng, và I/O.

---

## 5.1 Xử lý ngoại lệ (Exception Handling)

### Hệ thống phân cấp Checked vs Unchecked
- **Checked Exceptions**: Mở rộng từ `Exception` (nhưng không phải `RuntimeException`). Bắt buộc phải xử lý bằng `try-catch` hoặc khai báo `throws` trên method. (VD: `IOException`, `SQLException`).
- **Unchecked Exceptions**: Kế thừa `RuntimeException` hoặc `Error`. Không bắt buộc phải xử lý hay khai báo (VD: `NullPointerException`, `IllegalArgumentException`, `StackOverflowError`).

> [!IMPORTANT]
> `Error` (như `OutOfMemoryError`) là unchecked. Không nên cố gắng `catch` `Error` trừ trường hợp cực kỳ đặc biệt.

### try-catch-finally và Multi-catch
Thứ tự thực thi luôn ưu tiên khối `finally` cho dù `try` hoặc `catch` có `return` hay `throw` exception.

```java
public static int testFinally() {
    try {
        throw new RuntimeException("Lỗi trong try");
    } catch (Exception e) {
        return 1; // Sẽ không được trả về ngay!
    } finally {
        return 2; // Khối finally ghi đè kết quả trả về của catch. Kết quả hàm là 2.
    }
}
```

**Multi-catch**: Giúp gộp nhiều catch có chung xử lý.
> [!WARNING]
> **Trap exam**: Trong multi-catch, các ngoại lệ KHÔNG được có quan hệ cha-con.
> `catch (FileNotFoundException | IOException e)` -> **Lỗi biên dịch** vì `FileNotFoundException` là con của `IOException`.

### try-with-resources
Tự động đóng tài nguyên, các lớp phải implement `AutoCloseable` hoặc `Closeable`.
Tài nguyên được khai báo sẽ bị đóng theo **thứ tự ngược lại** với lúc khởi tạo.

```java
try (var r1 = new MyResource("R1"); var r2 = new MyResource("R2")) {
    throw new Exception("Lỗi chính");
} catch (Exception e) {
    // Thứ tự đóng: R2 đóng trước, R1 đóng sau.
}
```
**Suppressed exceptions**: Nếu khối `try` ném ra ngoại lệ A, và quá trình `close()` ném ra ngoại lệ B, B sẽ bị thêm vào thành "suppressed exception" của A. A là ngoại lệ chính bị bắt.

---

## 5.2 Java I/O

Java sử dụng khái niệm luồng (Stream) để đọc/ghi dữ liệu.
- **Byte streams**: (`InputStream`, `OutputStream`) Dùng cho dữ liệu nhị phân (hình ảnh, âm thanh...).
- **Character streams**: (`Reader`, `Writer`) Dùng cho dữ liệu văn bản.

### Console
Lớp `java.io.Console` thường được dùng để đọc chuỗi không hiển thị (như mật khẩu).
```java
Console console = System.console();
if (console != null) {
    char[] password = console.readPassword("Nhập mật khẩu: "); // Trả về mảng char, không phải String
    Arrays.fill(password, ' '); // Bảo mật: Xóa bộ nhớ sau khi dùng
}
```
> [!TIP]
> Hàm `readPassword()` trả về `char[]` để có thể xóa mảng ngay lập tức, thay vì `String` sẽ tồn tại trong String Pool.

### Serialization
Chuyển đổi đối tượng thành mảng byte để lưu trữ hoặc truyền qua mạng. Lớp phải `implements Serializable`.
- **transient**: Đánh dấu thuộc tính không cần tuần tự hóa. Khi giải tuần tự hóa (deserialize), nó sẽ nhận giá trị mặc định (`null` với object, `0` với số).
- **serialVersionUID**: Đảm bảo tương thích phiên bản.

> [!WARNING]
> **Trap exam**: Khi deserialize, **constructor của đối tượng được deserialize KHÔNG được gọi**. Tuy nhiên, no-arg constructor của lớp cha **không implement Serializable** đầu tiên trong cây kế thừa sẽ được gọi.

---

## 5.3 NIO.2 (java.nio.file)

### Lớp Path
`Path` là một interface. Cách tạo: `Path.of("dir/file.txt")`.

Các hàm thường gặp:
- `normalize()`: Loại bỏ các đoạn `.` và `..` thừa. VD: `a/./b/../c` -> `a/c`.
- `relativize(Path p)`: Trả về đường dẫn tương đối từ Path hiện tại đến `p`. 
- `resolve(Path p)`: Gộp 2 đường dẫn. Nếu `p` là đường dẫn tuyệt đối, kết quả trả về chính là `p`.

> [!WARNING]
> **Trap exam về relativize()**:
> 1. Không thể `relativize` giữa đường dẫn tuyệt đối và tương đối (gây `IllegalArgumentException`).
> 2. `Path.of("a").relativize(Path.of("b"))` -> `../b`.

### Lớp Files
Cung cấp các hàm tiện ích static hoạt động với `Path`.
- Đọc/ghi: `Files.readAllLines(path)`, `Files.readString(path)`, `Files.writeString(path, text)`.
- Liệt kê thư mục: `Files.list(path)` (không đệ quy, trả về `Stream<Path>`), `Files.walk(path)` (đệ quy).

> [!IMPORTANT]
> Stream trả về từ `Files.list()` hoặc `Files.walk()` cần nằm trong `try-with-resources` để tự động đóng luồng đọc thư mục, tránh rò rỉ tài nguyên hệ điều hành.

---

## 5.4 Đồng thời và Đa luồng (Concurrency & Multithreading)

### Tạo luồng
- Kế thừa `Thread` hoặc implement `Runnable` / `Callable`.
- `Callable<V>` có hàm `call() throws Exception` có thể trả về kết quả và ném ngoại lệ. `Runnable.run()` thì không.

### Virtual Threads (Java 21)
Tính năng mới quan trọng trong Java 21! Virtual Threads là luồng siêu nhẹ do JVM quản lý thay vì OS quản lý.
```java
// Tạo và chạy ngay
Thread vThread = Thread.ofVirtual().start(() -> System.out.println("Hello from VT"));

// Dùng qua ExecutorService
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    executor.submit(() -> "Task 1");
} // Tự động đợi tất cả task xong rồi đóng executor
```

### ExecutorService
- `submit()`: Nhận `Runnable` hoặc `Callable`, trả về `Future`.
- `execute()`: Chỉ nhận `Runnable`, không trả về gì.
- `Future.get()`: Block luồng hiện tại cho đến khi có kết quả. Dùng `Future.get(timeout, unit)` để tránh đợi vô tận.

### Cấu trúc dữ liệu đồng thời
- `ConcurrentHashMap`, `CopyOnWriteArrayList`: Cho phép an toàn đa luồng.
- `CopyOnWriteArrayList`: Rất tốt cho kịch bản đọc nhiều, ghi ít, vì mỗi khi cập nhật, nó sẽ sao chép toàn bộ danh sách.

---

## 5.5 JDBC

Các thành phần chính:
- `Connection`: Quản lý kết nối tới DB.
- `PreparedStatement`: Pre-compiled query, chống SQL Injection, hỗ trợ truyền tham số `?`. (Kế thừa `Statement`).
- `ResultSet`: Duyệt kết quả. **Index của cột (column) bắt đầu bằng 1, không phải 0.**

```java
String url = "jdbc:mysql://localhost:3306/db";
try (Connection conn = DriverManager.getConnection(url, "user", "pass");
     PreparedStatement ps = conn.prepareStatement("SELECT name FROM users WHERE id = ?")) {
    
    ps.setInt(1, 100); // Đặt tham số đầu tiên (index = 1)
    
    try (ResultSet rs = ps.executeQuery()) {
        while (rs.next()) {
            System.out.println(rs.getString(1)); // hoặc rs.getString("name")
        }
    }
}
```

> [!TIP]
> **Transaction Management**: 
> - Tắt chế độ tự commit: `conn.setAutoCommit(false);`
> - Xác nhận thay đổi: `conn.commit();`
> - Hoàn tác: `conn.rollback();`

---

## 5.6 Nội địa hóa (Localization)

### Locale
Biểu diễn ngôn ngữ/khu vực: `Locale.of("vi", "VN")`.

### ResourceBundle
Tải file cấu hình ngôn ngữ (`.properties` hoặc Java Class).
Quá trình dự phòng (Fallback):
Nếu dùng `Locale("fr", "CA")` và tìm gói `Messages`, nó sẽ tìm theo thứ tự:
1. `Messages_fr_CA.properties`
2. `Messages_fr.properties`
3. Tìm theo Locale mặc định của hệ thống (VD: `Messages_en_US.properties`)
4. `Messages_en.properties`
5. `Messages.properties`
6. `MissingResourceException` nếu không tìm thấy.

### Định dạng
- `NumberFormat.getCurrencyInstance(locale)`: Format tiền tệ.
- `DateTimeFormatter.ofPattern("dd/MM/yyyy").withLocale(locale)`: Format ngày tháng.

---

## 5.7 Modules (JPMS)

Khai báo trong tệp `module-info.java`:
- `requires <module>`: Module này cần phụ thuộc vào module khác.
- `requires transitive <module>`: Bất kỳ module nào phụ thuộc vào module này cũng sẽ tự động đọc được `<module>`.
- `exports <package>`: Cho phép các module khác import các class public trong package này.
- `opens <package>`: Tương tự `exports` nhưng cho phép cả **Reflection** truy cập các thành phần private.

### Các loại module:
- **Named module**: Có file `module-info.java`, nằm trong module path.
- **Automatic module**: File `.jar` không có `module-info.java` nhưng đặt ở module path. Tên module tự động suy ra từ tên file JAR.
- **Unnamed module**: Tất cả các file JAR/class nằm ở classpath.

---

## Bài tập thực hành (15 câu)

**Câu 1.** Kết quả của đoạn mã sau là gì?
```java
public class Test {
    public static void main(String[] args) {
        System.out.print(checkValue());
    }
    static int checkValue() {
        try {
            return 10;
        } finally {
            return 20;
        }
    }
}
```
A) 10
B) 20
C) Lỗi biên dịch
D) Throws RuntimeException

**Câu 2.** Chọn cú pháp `catch` hợp lệ? (Chọn HAI)
A) `catch (Exception1 e1 | Exception2 e2)`
B) `catch (SQLException | IOException e)`
C) `catch (FileNotFoundException | IOException e)`
D) `catch (IllegalArgumentException | NullPointerException e)`

**Câu 3.** Lớp MyClass triển khai `AutoCloseable` và in ra tên khi được close. Xem đoạn mã:
```java
try (MyClass m1 = new MyClass("1"); MyClass m2 = new MyClass("2")) {
    // do nothing
}
```
Thứ tự in ra trên console khi thoát khỏi try là gì?
A) 1, 2
B) 2, 1
C) Không in gì
D) Lỗi biên dịch

**Câu 4.** Trong Serialization, khi deserialize một đối tượng, thuộc tính nào sau đây của đối tượng không được bảo toàn và mang giá trị mặc định của hệ thống?
A) `private`
B) `protected`
C) `transient`
D) `static`

**Câu 5.** Giả sử `Path p1 = Path.of("/home/user");` và `Path p2 = Path.of("docs/file.txt");`. Kết quả của `p1.resolve(p2)` là gì?
A) `/home/user/docs/file.txt`
B) `docs/file.txt`
C) `/docs/file.txt`
D) Lỗi runtime

**Câu 6.** Giả sử `Path p1 = Path.of("/a/b/c");` và `Path p2 = Path.of("/a/x/y");`. Giá trị của `p1.relativize(p2)` là gì?
A) `../../x/y`
B) `../x/y`
C) `x/y`
D) `/x/y`

**Câu 7.** Khẳng định nào sau đây là **ĐÚNG** về Virtual Threads trong Java 21? (Chọn HAI)
A) Virtual Threads do Hệ điều hành (OS) quản lý, không phải JVM.
B) Có thể khởi tạo hàng triệu Virtual Threads mà không gây ra OutOfMemoryError thông thường.
C) Virtual Threads luôn cần được map cứng 1-1 với các luồng của hệ điều hành.
D) `Executors.newVirtualThreadPerTaskExecutor()` trả về một ExecutorService sử dụng Virtual Threads.

**Câu 8.** Phương thức nào của `ExecutorService` dùng để đẩy một `Callable` vào hàng đợi và trả về đối tượng `Future`?
A) `execute()`
B) `call()`
C) `submit()`
D) `invoke()`

**Câu 9.** Để sử dụng Concurrent Collections thay vì Synchronization thông thường nhằm tối ưu hiệu suất khi đọc (số lượng thao tác đọc nhiều hơn ghi rất lớn), class nào phù hợp nhất cho danh sách các phần tử?
A) `Vector`
B) `CopyOnWriteArrayList`
C) `ConcurrentArrayList`
D) `Collections.synchronizedList(new ArrayList<>())`

**Câu 10.** Index cho cột dữ liệu đầu tiên khi truy xuất dữ liệu từ `ResultSet` của JDBC là bao nhiêu?
A) -1
B) 0
C) 1
D) Tùy thuộc vào CSDL

**Câu 11.** Trong JDBC, cách tốt nhất để cấu hình để thay đổi (insert/update) chỉ có hiệu lực khi bạn gọi hàm `.commit()` là gì?
A) `conn.commitOnClose(true);`
B) `conn.setAutoCommit(false);`
C) `conn.setTransactionLevel(0);`
D) Mặc định của Connection đã như vậy, không cần gọi gì.

**Câu 12.** Bạn đang tìm kiếm file resource theo `Locale("es", "MX")`. Nếu file `Messages_es_MX.properties` không tồn tại, file nào sau đây sẽ được tìm tiếp theo trong quá trình Fallback? (Giả sử hệ thống đang ở Locale là `en_US`).
A) `Messages_es.properties`
B) `Messages_MX.properties`
C) `Messages_en_US.properties`
D) `Messages.properties`

**Câu 13.** Từ khóa nào trong `module-info.java` cho phép các package có thể được truy cập thông qua **Reflection** kể cả khi chúng được khai báo private?
A) `exports`
B) `requires`
C) `opens`
D) `provides`

**Câu 14.** Từ khóa `requires transitive moduleB;` trong file `module-info.java` của `moduleA` có ý nghĩa gì?
A) `moduleB` không thể chạy nếu không có `moduleA`.
B) Nếu `moduleC` requires `moduleA`, thì `moduleC` cũng tự động đọc được `moduleB`.
C) `moduleA` sẽ dịch `moduleB` tại thời điểm biên dịch.
D) Gây ra lỗi biên dịch vì không có từ khóa `transitive` trong Java Modules.

**Câu 15.** Class nào KHÔNG phải là Checked Exception?
A) `IOException`
B) `SQLException`
C) `ClassNotFoundException`
D) `NullPointerException`

---

## Đáp án và Giải thích

1. **B**. Khối `finally` luôn được thực thi và có thể ghi đè (override) giá trị trả về của `try`.
2. **B, D**. (A) sai cú pháp (chỉ dùng chung biến e). (C) sai vì `FileNotFoundException` là subclass của `IOException` (không được có quan hệ cha-con trong multi-catch).
3. **B**. try-with-resources đóng tài nguyên theo thứ tự **ngược lại** với lúc khai báo. `m2` khai báo sau nên đóng trước.
4. **C**. Thuộc tính `transient` không được lưu trạng thái vào mảng byte khi Serialize. Do đó khi Deserialize nó mang giá trị mặc định của kiểu. Thuộc tính `static` thuộc về Class, không liên quan tới serialization của đối tượng.
5. **A**. `resolve()` gộp hai đường dẫn. Nếu argument là relative, nó sẽ nối thêm vào path gốc. Kết quả là `/home/user/docs/file.txt`.
6. **A**. `relativize()` tính toán từ `/a/b/c` đi đến `/a/x/y`. Phải lùi 2 cấp (từ `c` về `b`, từ `b` về `a`), dùng `../../`, sau đó tiến tới `x/y`.
7. **B, D**. (A) sai vì VT do JVM quản lý. (C) sai vì VT không map 1-1 với OS thread (đây là đặc điểm của platform thread).
8. **C**. `submit()` nhận Callable hoặc Runnable và trả về Future. `execute()` chỉ nhận Runnable và không trả kết quả.
9. **B**. `CopyOnWriteArrayList` tạo bản sao của toàn bộ mảng mỗi khi ghi, làm cho tác vụ đọc không bao giờ cần block. Rất phù hợp kịch bản nhiều Read ít Write. `ConcurrentArrayList` không tồn tại.
10. **C**. Trong JDBC (ResultSet và PreparedStatement), chỉ mục cột (column index) và tham số luôn **bắt đầu bằng 1**.
11. **B**. Để quản lý transaction thủ công bằng `commit()` hoặc `rollback()`, bạn phải tắt chế độ `autoCommit` mặc định bằng `conn.setAutoCommit(false)`.
12. **A**. Chuỗi Fallback: `es_MX` -> `es` -> `en_US` (mặc định) -> `en` -> Root. File tiếp theo tìm kiếm là `Messages_es.properties`.
13. **C**. `opens` cho phép Deep Reflection (truy cập cả thành phần private) vào package, trong khi `exports` chỉ cho phép truy cập các thành phần public lúc compile/runtime.
14. **B**. Bất kỳ module nào phụ thuộc vào `moduleA` sẽ ngầm định cũng phụ thuộc vào (và đọc được) `moduleB`.
15. **D**. `NullPointerException` kế thừa từ `RuntimeException`, do đó nó là Unchecked Exception.
