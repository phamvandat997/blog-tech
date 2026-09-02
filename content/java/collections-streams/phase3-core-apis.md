---
title: "Phase 3: Core APIs - OCP Java SE 25 (1Z0-831)"
order: 1
phase: "Phase 3"
tags: ["Collections", "Generics", "HashMap Treeify", "Date/Time"]
---
# Phase 3: Core APIs - OCP Java SE 25 (1Z0-831)

Tài liệu hướng dẫn ôn tập giai đoạn 3 cho kỳ thi OCP Java SE 25 (1Z0-831). Phần này tập trung vào các API cốt lõi trong Java: Arrays, Collections, Generics, và Date/Time.

---

## 3.1 Arrays (Mảng)

### Khởi tạo và Khai báo
Mảng trong Java có kích thước cố định sau khi khởi tạo.
```java
int[] arr1 = new int[3]; // [0, 0, 0]
int[] arr2 = {1, 2, 3}; 
int[][] matrix = new int[2][];
matrix[0] = new int[3];
matrix[1] = new int[2];
```

> [!WARNING]
> Mảng đa chiều có thể bất đối xứng (asymmetric). Nếu bạn cố gắng truy cập chỉ số ngoài phạm vi đã khởi tạo của một mảng con, `ArrayIndexOutOfBoundsException` sẽ bị ném ra.

### Các phương thức tiện ích `java.util.Arrays`
- `Arrays.sort()`: Sắp xếp các phần tử.
- `Arrays.binarySearch()`: Tìm kiếm nhị phân (yêu cầu mảng đã được sắp xếp).
- `Arrays.compare()`: So sánh hai mảng theo thứ tự từ điển (lexicographically).
- `Arrays.mismatch()`: Trả về chỉ số đầu tiên mà hai mảng khác nhau, hoặc -1 nếu giống nhau.

```java
import java.util.Arrays;

public class ArrayExample {
    public static void main(String[] args) {
        int[] arr1 = {3, 1, 2};
        Arrays.sort(arr1); // [1, 2, 3]
        System.out.println(Arrays.binarySearch(arr1, 2)); // Kết quả: 1
        System.out.println(Arrays.binarySearch(arr1, 4)); // Kết quả: -4 (-(insertion point) - 1 = -3 - 1)
        
        int[] arr2 = {1, 2, 4};
        System.out.println(Arrays.compare(arr1, arr2)); // < 0 vì phần tử index 2: 3 < 4
        System.out.println(Arrays.mismatch(arr1, arr2)); // Kết quả: 2
    }
}
```

> [!IMPORTANT]
> **Trap:** Gọi `binarySearch` trên một mảng chưa sắp xếp sẽ cho kết quả không thể đoán trước.

### Arrays vs Varargs
Varargs (`...`) thực chất được biên dịch thành một mảng. Bạn có thể truyền một mảng vào tham số varargs, nhưng không thể làm ngược lại.

---

## 3.2 Collections Framework

### Các interface cốt lõi
- **List:** `ArrayList` (truy cập nhanh bằng index), `LinkedList` (chèn/xóa đầu cuối nhanh). Có duy trì thứ tự chèn, cho phép trùng lặp.
- **Set:** `HashSet` (không đảm bảo thứ tự, không trùng lặp), `LinkedHashSet` (duy trì thứ tự chèn), `TreeSet` (sắp xếp tăng dần theo Natural Ordering hoặc Comparator).
- **Queue/Deque:** `ArrayDeque` (sử dụng làm stack hoặc queue nhanh hơn LinkedList), `PriorityQueue` (các phần tử được sắp xếp ưu tiên).
- **Map:** `HashMap`, `LinkedHashMap`, `TreeMap`. Map không kế thừa `Collection`.

### Advanced Map Methods (Java 8+)
```java
import java.util.*;

public class MapAdvanced {
    public static void main(String[] args) {
        Map<String, Integer> map = new HashMap<>();
        map.put("A", 1);
        
        // putIfAbsent: Chỉ thêm nếu key chưa có hoặc value đang là null
        map.putIfAbsent("A", 2); // map.get("A") vẫn là 1
        
        // computeIfAbsent: Tính toán giá trị nếu key chưa có
        map.computeIfAbsent("B", k -> k.length()); // "B" -> 1
        
        // computeIfPresent: Cập nhật giá trị nếu key đã tồn tại (nếu function trả về null, key bị xóa)
        map.computeIfPresent("A", (k, v) -> v + 10); // "A" -> 11
        
        // merge: Kết hợp giá trị hiện tại và giá trị mới
        map.merge("A", 5, (oldVal, newVal) -> oldVal + newVal); // "A" -> 16
    }
}
```

### Immutable Collections (Java 9+)
```java
List<String> list = List.of("A", "B");
Set<String> set = Set.of("A"); // Set.of("A", "A") sẽ ném IllegalArgumentException
Map<String, Integer> map = Map.of("A", 1);

// Sao chép từ một collection khác
List<String> copied = List.copyOf(new ArrayList<>(Arrays.asList("C", "D")));
```
> [!WARNING]
> Không thể thêm phần tử `null` vào các collection được tạo bởi `List.of()`, `Set.of()`, hay `Map.of()`. Nếu cố tình thêm sẽ bị `NullPointerException`. Các immutable collection cũng ném `UnsupportedOperationException` nếu bạn gọi `.add()`, `.remove()`.

---

## 3.3 Comparable & Comparator

### Comparable (`java.lang.Comparable`)
Được sử dụng để định nghĩa "Natural Ordering" (thứ tự tự nhiên) của đối tượng. Class tự triển khai interface này.

```java
class Student implements Comparable<Student> {
    int id;
    public Student(int id) { this.id = id; }
    
    @Override
    public int compareTo(Student other) {
        return Integer.compare(this.id, other.id);
    }
}
```

### Comparator (`java.util.Comparator`)
Được sử dụng khi muốn định nghĩa các cách sắp xếp khác nhau, hoặc class không thể sửa đổi đổi để implement `Comparable`.

```java
import java.util.Comparator;

class Employee {
    String name;
    int age;
    // constructor, getters...
}

// Chained comparators
Comparator<Employee> byNameThenAge = Comparator
    .comparing((Employee e) -> e.name)
    .thenComparingInt(e -> e.age)
    .reversed();
```

> [!TIP]
> Sử dụng `Comparator.nullsFirst(Comparator.naturalOrder())` để xử lý các phần tử `null` mà không lo bị ném `NullPointerException`.

---

## 3.4 Generics

### Type Erasure (Xóa kiểu)
Kiểu Generic chỉ tồn tại lúc compile, khi chạy (runtime) tất cả các kiểu generic `T` bị thay thế bằng `Object` (hoặc bound cao nhất).

> [!CAUTION]
> **Những thứ KHÔNG THỂ làm với Generics:**
> 1. `new T()` (Không thể khởi tạo)
> 2. `T[] arr = new T[10]` (Không thể khởi tạo mảng Generic)
> 3. `if (obj instanceof List<String>)` (Sẽ báo lỗi compile vì type erasure, ngoại trừ `instanceof List<?>`)
> 4. `static T field` (Biến static không thể dùng generic type của class)

### Wildcards và PECS
- `<? extends T>`: Read-only (Chỉ đọc). Có thể lấy ra `T`, nhưng không thể thêm phần tử vào (vì không biết chính xác kiểu con nào).
- `<? super T>`: Write-only (Thêm vào). Có thể thêm `T` hoặc kiểu con của `T`, nhưng khi đọc ra chỉ đảm bảo là `Object`.

Quy tắc **PECS** (Producer Extends, Consumer Super):
- Dùng `extends` khi collection sản xuất (trả về) dữ liệu cho bạn đọc.
- Dùng `super` khi collection tiêu thụ dữ liệu (bạn thêm dữ liệu vào).

```java
List<? extends Number> list1 = new ArrayList<Integer>();
// list1.add(1); // LỖI COMPILE
Number n = list1.get(0); // OK

List<? super Integer> list2 = new ArrayList<Number>();
list2.add(10); // OK
// Integer x = list2.get(0); // LỖI COMPILE (phải gán vào Object)
```

---

## 3.5 Date & Time API (java.time)

Các class trong `java.time` đều là **immutable** và **thread-safe**. Bất kỳ phương thức thay đổi nào (`plusDays()`, `withYear()`) đều trả về một object mới.

### Các Class Cơ Bản
- `LocalDate`: Ngày (năm, tháng, ngày).
- `LocalTime`: Giờ (giờ, phút, giây, nano).
- `LocalDateTime`: Kết hợp Ngày và Giờ, không có múi giờ.
- `ZonedDateTime`: Có múi giờ (`ZoneId`).
- `Instant`: Thời điểm trên trục thời gian (tính từ EPOCH). Tốt nhất cho việc lưu DB hoặc log.

```java
import java.time.*;
import java.time.format.DateTimeFormatter;

public class DateTimeExample {
    public static void main(String[] args) {
        LocalDate date = LocalDate.of(2025, Month.OCTOBER, 20); // Không có new LocalDate()!
        
        // Immutability trap
        date.plusDays(2); 
        System.out.println(date); // Vẫn in ra 2025-10-20
        
        date = date.plusDays(2); // 2025-10-22
        
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        System.out.println(date.format(formatter)); // 22/10/2025
    }
}
```

### Period và Duration
- `Period`: Khoảng thời gian dựa trên ngày (năm, tháng, ngày).
- `Duration`: Khoảng thời gian dựa trên giờ (giờ, phút, giây, nano).

> [!WARNING]
> Đừng bao giờ nối kiểu `.ofDays(1).ofYears(1)` với Period. Trình biên dịch coi đó là gọi method static.
> `Period p = Period.ofDays(1).ofYears(2);` // `p` sẽ chỉ có 2 năm, phần 1 ngày bị mất.

### Daylight Saving Time (DST)
Khi đồng hồ bị chỉnh tới (Mùa xuân, mất đi 1 giờ): Nếu tạo local time nằm trong khoảng thời gian không tồn tại, nó sẽ tự đẩy về phía trước 1 tiếng.
Khi đồng hồ bị chỉnh lùi (Mùa thu, lặp lại 1 giờ): Nếu có sự nhập nhằng, hệ thống sẽ ưu tiên múi giờ "trước" khi lùi (offset mùa hè) trừ khi chỉ định cụ thể.

---

## 3.6 Math & Formatting

### Math
- `Math.min()`, `Math.max()`, `Math.abs()`
- `Math.round()` (float -> int, double -> long)
- `Math.ceil()`, `Math.floor()`

### NumberFormat
Sử dụng để format tiền tệ, số nguyên, phần trăm theo `Locale`.
Java 12+ hỗ trợ `CompactNumberFormat`:
```java
import java.text.NumberFormat;
import java.util.Locale;

public class MathFormat {
    public static void main(String[] args) {
        NumberFormat nf = NumberFormat.getCompactNumberInstance(Locale.US, NumberFormat.Style.SHORT);
        System.out.println(nf.format(1500)); // 1.5K
        System.out.println(nf.format(1000000)); // 1M
    }
}
```

---
---

## Bài tập trắc nghiệm (Practice Quiz)

**Câu 1:** Xem đoạn mã sau:
```java
import java.util.Arrays;
public class Test {
    public static void main(String[] args) {
        int[] arr = {4, 1, 3, 5};
        System.out.print(Arrays.binarySearch(arr, 3));
    }
}
```
Đoạn mã sẽ in ra kết quả gì?
A) 2
B) -2
C) Không thể xác định được (Kết quả không đoán trước do mảng chưa sort)
D) Does not compile
E) Throws exception at runtime

**Câu 2:** Cho danh sách các lớp:
```java
List<String> list1 = List.of("A", "B");
List<String> list2 = Arrays.asList("C", "D");
list1.set(0, "X");
list2.set(0, "Y");
```
Dòng mã nào sẽ ném ra ngoại lệ tại Runtime?
A) `list1.set(0, "X");`
B) `list2.set(0, "Y");`
C) Cả 2 dòng `set()` đều ném ngoại lệ
D) Không dòng nào ném ngoại lệ

**Câu 3:** Bạn có khai báo sau `Map<String, String> map = Map.of("1", "A", "2", "B");`. 
Hành động nào sẽ biên dịch và chạy thành công mà KHÔNG ném ngoại lệ?
A) `map.put("3", "C");`
B) `map.putIfAbsent("1", "X");`
C) `map.replace("1", "A");`
D) `map.get("1");`
E) `map.computeIfAbsent("1", k -> "A");`

**Câu 4:** (Chọn HAI phương án đúng)
Những phát biểu nào về TreeSet là đúng?
A) TreeSet cho phép lưu một phần tử null.
B) TreeSet không duy trì thứ tự chèn của các phần tử.
C) Các phần tử thêm vào TreeSet phải thực thi interface Comparable hoặc phải cung cấp Comparator.
D) TreeSet cung cấp thời gian truy cập (O(1)) cho phương thức `contains`.

**Câu 5:** Xem đoạn mã Generics:
```java
List<? super Number> list = new ArrayList<Object>();
list.add(Integer.valueOf(5)); // (1)
list.add(new Object());       // (2)
Number n = list.get(0);       // (3)
```
Dòng code nào gây ra lỗi biên dịch? (Chọn HAI dòng)
A) Dòng (1)
B) Dòng (2)
C) Dòng (3)
D) Không dòng nào lỗi, biên dịch thành công.

**Câu 6:** Khai báo nào sau đây là hợp lệ trong Java? (Chọn HAI)
A) `List<?> list = new ArrayList<String>();`
B) `List<? extends Object> list = new ArrayList<?>();`
C) `List<? super String> list = new ArrayList<Object>();`
D) `List<Object> list = new ArrayList<String>();`

**Câu 7:**
```java
LocalDate d = LocalDate.of(2025, 2, 28);
d.plusDays(1);
System.out.println(d.plusMonths(1));
```
Kết quả in ra là:
A) 2025-03-01
B) 2025-03-28
C) 2025-03-31
D) 2025-04-01

**Câu 8:** Xem xét phương thức sau:
```java
public static <T> void print(T t) {
    if (t instanceof String) {
        System.out.println("String");
    }
}
```
Phát biểu nào là đúng về phương thức này?
A) Lỗi biên dịch vì không thể dùng `instanceof` với Generic parameter T.
B) Biên dịch thành công vì type erasure chỉ xóa T, nhưng `t` vẫn giữ thuộc tính đối tượng lúc runtime.
C) Lỗi biên dịch vì `T` chưa được giới hạn bound (bound type).
D) Báo lỗi ClassCastException lúc runtime.

**Câu 9:**
```java
Map<Integer, String> map = new HashMap<>();
map.put(1, "A");
map.put(2, "B");
map.merge(1, "C", (v1, v2) -> null);
map.merge(2, "C", (v1, v2) -> v1 + v2);
System.out.println(map);
```
Kết quả in ra là gì?
A) `{1=C, 2=BC}`
B) `{1=null, 2=BC}`
C) `{2=BC}`
D) Throws NullPointerException

**Câu 10:** Xem xét mã sau về Date/Time:
```java
Period p = Period.ofMonths(1).ofDays(5);
LocalDate date = LocalDate.of(2025, 1, 1);
System.out.println(date.plus(p));
```
Kết quả?
A) 2025-02-06
B) 2025-01-06
C) 2025-02-05
D) Báo lỗi biên dịch ở khai báo Period

**Câu 11:** 
Để sắp xếp một List chứa các đối tượng class `Dog` theo độ tuổi giảm dần bằng Java 8 Comparator, cú pháp nào sau đây đúng? 
(`Dog` có method `getAge()`)
A) `list.sort(Comparator.comparing(Dog::getAge).reversed());`
B) `list.sort(Comparator.reversed(Dog::getAge));`
C) `list.sort((d1, d2) -> d1.getAge().compareTo(d2.getAge()));`
D) `list.sort(Comparator.comparing(Dog::getAge).descending());`

**Câu 12:**
Giao diện (Interface) nào định nghĩa phương thức `poll()`? (Chọn HAI)
A) List
B) Queue
C) Deque
D) Set
E) Map

**Câu 13:**
Mảng hai chiều nào được khởi tạo HỢP LỆ? (Chọn BA)
A) `int[][] a = new int[2][2];`
B) `int[][] b = new int[2][];`
C) `int[][] c = new int[][2];`
D) `int[] d[] = new int[2][2];`
E) `int[][] e = {{1,2}, {3,4,5}};`

**Câu 14:**
Chuyện gì xảy ra với đoạn mã:
```java
int[] arr1 = {1, 2, 3};
int[] arr2 = {1, 2, 3};
System.out.println(arr1.equals(arr2));
System.out.println(Arrays.equals(arr1, arr2));
```
A) in ra: true, true
B) in ra: false, true
C) in ra: false, false
D) in ra: true, false

**Câu 15:** 
```java
import java.util.*;
public class Main {
    public static void main(String[] args) {
        var queue = new PriorityQueue<String>();
        queue.add("C");
        queue.add("A");
        queue.add("B");
        System.out.print(queue.peek() + " ");
        System.out.print(queue.poll() + " ");
        System.out.print(queue.peek());
    }
}
```
Kết quả in ra là gì?
A) C C A
B) A A B
C) A C B
D) C A B

---
---

## Đáp án và giải thích (Answer Key)

**Câu 1: C**
- `Arrays.binarySearch()` yêu cầu mảng phải được sắp xếp trước (bằng `Arrays.sort()`). Mảng `{4, 1, 3, 5}` chưa sắp xếp nên kết quả trả về là không thể dự đoán được (unpredictable). Không bị lỗi biên dịch và không ném Exception.

**Câu 2: A**
- `List.of()` tạo ra một Immutable collection thật sự, gọi `set()` sẽ ném `UnsupportedOperationException`.
- `Arrays.asList()` tạo ra một list có kích thước cố định (fixed-size). Bạn không thể `add()` hay `remove()`, nhưng BẠN ĐƯỢC PHÉP gọi `set()` để thay đổi phần tử đã có.

**Câu 3: D**
- `Map.of()` tạo ra map immutable. Các phương thức thay đổi nội dung như `put`, `putIfAbsent`, `replace`, `computeIfAbsent` đều ném `UnsupportedOperationException`, cho dù key chưa có hoặc giá trị không thay đổi. Chỉ có phương thức đọc `get()` là an toàn.

**Câu 4: B, C**
- TreeSet được hỗ trợ bởi TreeMap, sử dụng cấu trúc cây Đỏ-Đen. Nó không duy trì thứ tự chèn mà tự động sắp xếp. (B đúng)
- Để sắp xếp, nó dựa vào `Comparable` của đối tượng hoặc `Comparator`. (C đúng)
- Kể từ Java 7, `TreeSet` không cho phép null, ném `NullPointerException`. Truy cập là O(log n), không phải O(1).

**Câu 5: B, C**
- `<? super Number>` nghĩa là list này chứa các đối tượng từ `Number` trở lên (ví dụ Object). Ta có thể thêm `Number` hoặc các lớp con của `Number` (như Integer) vào list (Dòng 1 OK).
- Không thể thêm `Object` vì list có thể đang được khởi tạo là `ArrayList<Number>`, sẽ gây ra ClassCastException. Trình biên dịch cấm điều này (Dòng 2 lỗi).
- Khi lấy ra, ta chỉ biết nó chắc chắn là một `Object`. Gán vào tham chiếu `Number n = ...` sẽ bị lỗi biên dịch vì yêu cầu cast tường minh (Dòng 3 lỗi).

**Câu 6: A, C**
- A đúng: Wildcard `<?>` chấp nhận mọi List.
- C đúng: Khởi tạo List kiểu Object tương thích với reference `<? super String>`.
- B sai: `new ArrayList<?>()` không được phép (Không thể instantiate với wildcard).
- D sai: Không có tính đa hình trong generic parameter, `List<Object>` không thể chứa `ArrayList<String>`.

**Câu 7: B**
- Date API là immutable. Lệnh `d.plusDays(1)` sinh ra ngày mới nhưng không gán lại cho biến `d`. Do đó `d` vẫn là 28/02/2025.
- `d.plusMonths(1)` sẽ thành 2025-03-28.

**Câu 8: B**
- Kiểu `T` được thay thế bằng `Object` khi compile (type erasure). Nhưng `instanceof` chạy lúc runtime kiểm tra đối tượng thực sự tham chiếu bởi `t` (không phải kiểm tra kiểu generic gốc), nên đoạn mã này hoàn toàn hợp lệ và chạy tốt.

**Câu 9: C**
- `map.merge()`: Nếu Bi-Function trả về `null`, key đó sẽ bị XÓA khỏi Map. Nên key 1 bị xóa. Key 2 giá trị "B" kết hợp "C" thành "BC". Kết quả map chỉ còn `{2=BC}`.

**Câu 10: B**
- `Period.ofMonths(1).ofDays(5)`: `.ofDays(5)` là phương thức static, nó tạo ra một đối tượng Period mới chỉ chứa 5 ngày (ghi đè và bỏ qua đối tượng có 1 tháng trước đó). 
- `2025-01-01` cộng thêm 5 ngày là `2025-01-06`. (Trap cực kì phổ biến trong kỳ thi).

**Câu 11: A**
- `Comparator.comparing()` là cách tốt nhất trong Java 8. Gọi `.reversed()` sẽ đảo ngược thứ tự (giảm dần). Cú pháp A chuẩn xác. C sai cú pháp vì lambda trả int chứ không phải gọi compareTo lên primitives.

**Câu 12: B, C**
- `poll()` (lấy và xóa phần tử đầu tiên, trả về null nếu rỗng) thuộc về interface `Queue` và interface con của nó là `Deque`.

**Câu 13: A, B, D, E**
- A: Mảng vuông 2x2.
- B: Mảng rỗng dòng, có 2 dòng (asymmetric array hợp lệ).
- C: SAI cú pháp, chiều đầu tiên bắt buộc phải có độ dài.
- D: Khai báo c-style hợp lệ.
- E: Khởi tạo trực tiếp (array literal) hợp lệ.

**Câu 14: B**
- `arr1.equals(arr2)` dùng phương thức `equals` của Object (kiểm tra tham chiếu ==), nên là `false`.
- `Arrays.equals(arr1, arr2)` kiểm tra nội dung từng phần tử của mảng, nên là `true`.

**Câu 15: B**
- PriorityQueue sắp xếp phần tử theo Natural Order (A, B, C).
- `peek()` trả về "A".
- `poll()` xóa và trả về "A". Phần tử tiếp theo đầu hàng đợi là "B".
- `peek()` trả về "B".
- Do đó in ra `A A B`.
