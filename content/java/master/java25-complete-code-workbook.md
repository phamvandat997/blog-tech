---
title: "SỔ TAY THỰC HÀNH MÃ NGUỒN & PHÒNG THÍ NGHIỆM THỰC THI OCP JAVA SE 25 (1Z0-831)"
icon: "💻"
order: 1
phase: "Master"
tags: ["Mock Exam", "Handbook", "Labs", "Traps", "Master Question Bank"]
---
# SỔ TAY THỰC HÀNH MÃ NGUỒN & PHÒNG THÍ NGHIỆM THỰC THI OCP JAVA SE 25 (1Z0-831)

Tài liệu này cung cấp các ví dụ mã nguồn thực tế, tự chứa và có thể thực thi hoàn toàn trong Java 25. Mỗi Lab tập trung vào một nhóm tính năng cốt lõi của Java 25, với phân tích chi tiết từng bước thực thi (Execution Trace), trạng thái bộ nhớ và giải thích cơ chế nội tại (Under the hood) theo chuẩn JLS.

---

## LAB 1: JAVA 22-25 MODERN FEATURES LAB

### Lab 1.1: Flexible Constructor Bodies (JEP 482)
Tính năng này cho phép các câu lệnh (statements) được thực thi trước lệnh gọi `super(...)` hoặc `this(...)` trong hàm tạo, giúp xác thực tham số hoặc thiết lập biến cục bộ an toàn hơn.

```java
public class FlexibleConstructorLab {
    public static class Animal {
        String type;
        public Animal(String type) {
            this.type = type;
        }
    }

    public static class Dog extends Animal {
        String name;
        
        public Dog(String name) {
            // Statements before super()
            if (name == null || name.isBlank()) {
                throw new IllegalArgumentException("Name cannot be blank");
            }
            String defaultType = "Canine";
            
            // Lệnh gọi super()
            super(defaultType);
            
            // Không được đọc trường (field) trước khi super() được gọi.
            // System.out.println(this.name); // ILLEGAL READ
            this.name = name;
        }
    }

    public static void main(String[] args) {
        Dog d = new Dog("Rex");
        System.out.println("Tạo thành công: " + d.name + " - " + d.type);
    }
}
```

**Execution Trace:**
1. Khởi tạo `new Dog("Rex")`.
2. Hàm tạo `Dog("Rex")` chạy các lệnh `if` kiểm tra null. `name` hợp lệ.
3. Gán `defaultType = "Canine"`.
4. Gọi `super("Canine")`. Hàm tạo `Animal` khởi tạo trường `type`.
5. Quay lại hàm tạo `Dog`, gán `this.name = "Rex"`.

**Expected Output:**
```
Tạo thành công: Rex - Canine
```

> [!NOTE]
> **TẠI SAO LẠI NHƯ VẬY?**
> Theo JLS, trước đây Java bắt buộc `super()` phải là lệnh đầu tiên. Bytecode sinh ra với Flexible Constructor sẽ chứa các lệnh (ví dụ: `aload`, `ifnull`, `athrow`) trước lệnh `invokespecial` gọi `<init>` của lớp cha. Mục đích là ngăn ngừa đối tượng khởi tạo một phần nếu tham số truyền vào không hợp lệ.

---

### Lab 1.2: Instance Main Methods & Compact Source Files (JEP 477)
Java đơn giản hóa phương thức `main` và quá trình khởi chạy.

```java
// CompactSourceLab.java (Không cần khai báo public class)
void main() {
    System.out.println("Instance Main Method without String[] args");
    helperMethod();
}

void helperMethod() {
    System.out.println("Helper invoked");
}
```

**Expected Output:**
```
Instance Main Method without String[] args
Helper invoked
```

> [!IMPORTANT]
> **TẠI SAO LẠI NHƯ VẬY?**
> JVM giờ đây sẽ kiểm tra ưu tiên các hàm `main` theo thứ tự: 
> 1. `public static void main(String[] args)`
> 2. `protected/package-private static void main(String[] args)`
> 3. `void main(String[] args)`
> 4. `void main()`
> Trình biên dịch tạo ra một lớp vô danh ở cấp package để bao bọc các mã nguồn không chứa cấu trúc lớp rõ ràng, và tự động sử dụng `invokevirtual` để chạy instance method.

---

### Lab 1.3: Unnamed Variables & Patterns (JEP 456)
Sử dụng `_` cho các biến không sử dụng.

```java
public class UnnamedVariablesLab {
    public static void main(String[] args) {
        String[] data = {"1", "invalid", "3"};
        int sum = 0;
        
        for (String s : data) {
            try {
                sum += Integer.parseInt(s);
            } catch (NumberFormatException _) { // Sử dụng _ cho exception không cần đọc
                System.out.println("Bỏ qua lỗi format");
            }
        }
        
        var map = java.util.Map.of("A", 1, "B", 2);
        map.forEach((_, v) -> System.out.println("Value: " + v)); // Sử dụng _ trong lambda
    }
}
```

**Expected Output:**
```
Bỏ qua lỗi format
Value: 1
Value: 2
```

> [!TIP]
> **TẠI SAO LẠI NHƯ VẬY?**
> Biến unnamed `_` không thể bị đọc hay gán giá trị lại trong scope. Ở mức Bytecode, trình biên dịch bỏ qua việc khởi tạo tham chiếu cục bộ trong `LocalVariableTable` cho biến này, tiết kiệm bộ nhớ stack cục bộ và tránh cảnh báo "unused variable".

---

### Lab 1.4: Stream Gatherers trong hành động (JEP 473)
Gatherers cho phép tạo ra các thao tác trung gian linh hoạt hơn.

```java
import java.util.stream.Stream;
import java.util.stream.Gatherers;
import java.util.List;

public class GathererLab {
    public static void main(String[] args) {
        // windowFixed
        List<List<Integer>> windows = Stream.of(1, 2, 3, 4, 5)
            .gather(Gatherers.windowFixed(2))
            .toList();
        System.out.println("Fixed Window: " + windows);
        
        // scan (Cumulative sum)
        List<Integer> cumulativeSum = Stream.of(1, 2, 3, 4, 5)
            .gather(Gatherers.scan(() -> 0, (sum, next) -> sum + next))
            .toList();
        System.out.println("Scan Sum: " + cumulativeSum);
    }
}
```

**Expected Output:**
```
Fixed Window: [[1, 2], [3, 4], [5]]
Scan Sum: [1, 3, 6, 10, 15]
```

> [!NOTE]
> **TẠI SAO LẠI NHƯ VẬY?**
> `Gatherer` là giao diện có thiết kế giống `Collector` nhưng hoạt động trong pipeline trung gian. Các trạng thái được duy trì nội bộ bởi interface `Gatherer.Integrator`.

---

## LAB 2: OOP, RECORDS, SEALED CLASSES & PATTERN MATCHING LAB

### Lab 2.4: Sealed Class Hierarchy + Exhaustive Switch Pattern Matching
Với Java 21+, kết hợp Sealed Classes và Switch Pattern Matching với Guard.

```java
public class SealedSwitchLab {
    sealed interface Shape permits Circle, Rectangle {}
    record Circle(double radius) implements Shape {}
    record Rectangle(double w, double h) implements Shape {}

    public static void main(String[] args) {
        Shape s = new Rectangle(5, 5);
        
        String result = switch (s) {
            case Circle c when c.radius() > 10 -> "Large Circle";
            case Circle c -> "Small Circle";
            case Rectangle r when r.w() == r.h() -> "Square";
            case Rectangle r -> "Rectangle";
        }; // Exhaustive, no default needed
        
        System.out.println(result);
    }
}
```

**Expected Output:**
```
Square
```

> [!CAUTION]
> **TẠI SAO LẠI NHƯ VẬY?**
> Trình biên dịch sử dụng chỉ thị `lookupswitch` với invokedynamic để thực hiện pattern matching. Trình biên dịch xác thực tính đầy đủ (exhaustiveness) nhờ vào `sealed interface`. Nếu có class mới kế thừa Shape mà không có `case` trong switch, sẽ gây lỗi **Compile Error**.

---

## LAB 3: STREAMS, COLLECTORS & OPTIONAL ADVANCED LAB

### Lab 3.1: Complex Collector pipeline

```java
import java.util.*;
import java.util.stream.Collectors;

public class CollectorLab {
    record Employee(String dept, String name, double salary) {}

    public static void main(String[] args) {
        List<Employee> emps = List.of(
            new Employee("IT", "Alice", 7000),
            new Employee("IT", "Bob", 6000),
            new Employee("HR", "Charlie", 5000)
        );

        // teeing: Tìm Max Salary và Tính Average Salary
        var stats = emps.stream().collect(
            Collectors.teeing(
                Collectors.maxBy(Comparator.comparingDouble(Employee::salary)),
                Collectors.averagingDouble(Employee::salary),
                (max, avg) -> "Max: " + max.get().name() + ", Avg: " + avg
            )
        );
        
        System.out.println(stats);
    }
}
```

**Expected Output:**
```
Max: Alice, Avg: 6000.0
```

> [!TIP]
> **TẠI SAO LẠI NHƯ VẬY?**
> `Collectors.teeing` sử dụng 2 downstream collector song song trên cùng một stream. Trạng thái accumulator được duy trì theo cặp và hợp nhất ở cuối bằng `BiFunction`. Không làm cạn kiệt Stream hai lần.

---

## LAB 4: CONCURRENCY, VIRTUAL THREADS & I/O LAB

### Lab 4.1: Virtual Threads và Pinning
Virtual Threads mang lại M:N scheduling bằng cách bind virtual thread vào carrier (OS) thread. Tuy nhiên, khối `synchronized` có thể gây "pinning".

```java
import java.util.concurrent.Executors;
import java.util.concurrent.locks.ReentrantLock;

public class VirtualThreadLab {
    static final ReentrantLock lock = new ReentrantLock();

    public static void main(String[] args) throws InterruptedException {
        Runnable task = () -> {
            lock.lock();
            try {
                System.out.println(Thread.currentThread() + " is running");
                Thread.sleep(100); // Thread yields instead of blocking carrier thread
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            } finally {
                lock.unlock();
            }
        };

        try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
            for (int i = 0; i < 5; i++) {
                executor.submit(task);
            }
        } // Tự động đóng executor (chờ task xong)
    }
}
```

**Trạng thái bộ nhớ (Stack & Heap):**
Khi `Thread.sleep` được gọi, trạng thái stack của Virtual Thread được sao chép vào bộ nhớ **Heap**. Carrier Thread được giải phóng để chạy task khác. Khi sleep kết thúc, trạng thái lại được chuyển từ Heap vào Stack của Carrier thread mới để thực thi tiếp.

> [!WARNING]
> **TẠI SAO LẠI NHƯ VẬY?**
> Nếu thay `ReentrantLock` bằng khối `synchronized`, do cấu trúc `monitorenter/monitorexit` trong JVM bytecode gắn liền với ngăn xếp native (JNI stack frames), carrier thread sẽ bị "Pinning" (kẹt) khi bị block, làm giảm hiệu năng hệ thống. Java khuyến nghị dùng `ReentrantLock` khi dùng Virtual Threads thay cho `synchronized` block.

---
*End of Workbook*
