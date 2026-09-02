---
title: "Tài Liệu Ôn Thi OCP Java SE 25 (1Z0-831) - Giai Đoạn 4: Functional Programming"
description: "Giai đoạn này tập trung vào Lập Trình Hàm (Functional Programming) trong Java, bao gồm Functional Interfaces, Lambda Expressions, Stream API, Collectors, Optional và Parallel Strea"
icon: "🌊"
difficulty: "Intermediate"
order: 5
phase: "Phase 4"
tags: ["Lambdas", "Stream API", "Collectors", "invokedynamic", "Spliterator"]
---
# Tài Liệu Ôn Thi OCP Java SE 25 (1Z0-831) - Giai Đoạn 4: Functional Programming

Giai đoạn này tập trung vào Lập Trình Hàm (Functional Programming) trong Java, bao gồm Functional Interfaces, Lambda Expressions, Stream API, Collectors, Optional và Parallel Streams. Đây là phần **cực kỳ quan trọng** và chiếm tỷ trọng lớn trong kỳ thi OCP.

---

## 4.1 Functional Interfaces (Giao Diện Hàm)

Một functional interface là một interface có **duy nhất một abstract method** (SAM - Single Abstract Method).

### Built-in Functional Interfaces (Gói `java.util.function`)
Bảng tổng hợp các functional interface cốt lõi:

| Interface | Method Signature | Mô tả |
| :--- | :--- | :--- |
| `Predicate<T>` | `boolean test(T t)` | Kiểm tra điều kiện |
| `BiPredicate<T, U>` | `boolean test(T t, U u)` | Kiểm tra điều kiện với 2 tham số |
| `Consumer<T>` | `void accept(T t)` | Tiêu thụ giá trị, không trả về (Side effects) |
| `BiConsumer<T, U>`| `void accept(T t, U u)` | Tiêu thụ 2 giá trị |
| `Supplier<T>` | `T get()` | Cung cấp/Sinh ra giá trị |
| `Function<T, R>` | `R apply(T t)` | Biến đổi từ kiểu T sang kiểu R |
| `BiFunction<T, U, R>`| `R apply(T t, U u)` | Biến đổi 2 tham số T, U thành kiểu R |
| `UnaryOperator<T>`| `T apply(T t)` | Tương tự Function nhưng T và R giống nhau |
| `BinaryOperator<T>`| `T apply(T t1, T t2)` | Tương tự BiFunction nhưng T, U, R giống nhau|

### Primitive Specializations
Thay vì dùng wrapper classes (`Integer`, `Double`), Java cung cấp các interface cho kiểu nguyên thủy để tránh chi phí autoboxing/unboxing.
- **IntPredicate, LongPredicate, DoublePredicate**
- **IntFunction, LongFunction, DoubleFunction** (Tham số là primitive, trả về Object)
- **ToIntFunction, ToLongFunction, ToDoubleFunction** (Tham số là Object, trả về primitive)
- **IntConsumer, DoubleConsumer**, v.v.

### Chaining Methods (Nối các thao tác)
- `Predicate`: `and()`, `or()`, `negate()`
- `Function`: `andThen()` (thực hiện sau), `compose()` (thực hiện trước)
- `Consumer`: `andThen()`

```java
Predicate<String> p1 = s -> s.length() > 5;
Predicate<String> p2 = s -> s.contains("Java");
Predicate<String> p3 = p1.and(p2).negate();

Function<Integer, Integer> f1 = x -> x * 2;
Function<Integer, Integer> f2 = x -> x + 3;
// f1.andThen(f2).apply(2) -> (2*2) + 3 = 7
// f1.compose(f2).apply(2) -> (2+3) * 2 = 10
```

> [!WARNING]
> **Trap exam:** `Supplier` không có method chaining (không có `andThen` hay `compose`) vì nó không nhận tham số đầu vào.

### @FunctionalInterface Annotation
Annotation này không bắt buộc nhưng giúp trình biên dịch kiểm tra xem interface có thực sự là functional interface hay không (đảm bảo chỉ có 1 abstract method).

---

## 4.2 Lambda Expressions

Lambda là một cách ngắn gọn để implement abstract method của functional interface.

### Cú pháp
```java
// 1. Không tham số
Supplier<String> s = () -> "Hello";

// 2. Một tham số (có thể bỏ dấu ngoặc đơn và kiểu dữ liệu)
Predicate<String> p = x -> x.isEmpty(); 

// 3. Nhiều tham số (phải dùng ngoặc đơn)
BiFunction<Integer, Integer, Integer> add = (a, b) -> a + b;
// Hoặc có khai báo kiểu (phải khai báo cho tất cả)
BiFunction<Integer, Integer, Integer> add2 = (Integer a, Integer b) -> a + b;

// 4. Khối lệnh (phải dùng ngoặc nhọn và từ khóa return nếu có trả về)
Function<String, String> f = x -> {
    String upper = x.toUpperCase();
    return upper;
};
```

> [!WARNING]
> **Trap exam:** Nếu bạn trộn lẫn việc khai báo kiểu và không khai báo, code sẽ lỗi: `(Integer a, b) -> a + b` (LỖI COMPILATION). Hoặc thiếu từ khóa `var` cho 1 tham số: `(var a, b) -> a + b` (LỖI). Phải là `(var a, var b)`.

### Effectively Final Variables
Lambda có thể truy cập biến cục bộ bên ngoài, nhưng biến đó phải là `final` hoặc **effectively final** (không thay đổi giá trị sau khi khởi tạo).

```java
int count = 0;
// count++; // Nếu uncomment dòng này, dòng dưới sẽ lỗi compilation
Runnable r = () -> System.out.println(count); 
```

### Method References
Sử dụng toán tử `::` để viết gọn lambda:
1. **Static method:** `ClassName::methodName` (VD: `Math::max` = `(a, b) -> Math.max(a, b)`)
2. **Instance method trên đối tượng cụ thể (bound):** `instanceRef::methodName` (VD: `System.out::println` = `x -> System.out.println(x)`)
3. **Instance method trên đối tượng không cụ thể (unbound):** `ClassName::methodName` (VD: `String::toLowerCase` = `str -> str.toLowerCase()`)
4. **Constructor:** `ClassName::new` (VD: `ArrayList::new` = `() -> new ArrayList<>()`)

---

## 4.3 Stream API — Complete Guide

### Tạo Streams
```java
Stream<String> s1 = Stream.empty();
Stream<String> s2 = Stream.of("A", "B", "C");
Stream<String> s3 = List.of("X", "Y").stream();
Stream<Double> s4 = Stream.generate(Math::random); // Infinite stream
Stream<Integer> s5 = Stream.iterate(1, n -> n + 1); // Infinite stream
Stream<Integer> s6 = Stream.iterate(1, n -> n <= 10, n -> n + 1); // Finite (Java 9)
IntStream s7 = Arrays.stream(new int[]{1, 2, 3});
IntStream s8 = IntStream.range(1, 5); // 1, 2, 3, 4
IntStream s9 = IntStream.rangeClosed(1, 5); // 1, 2, 3, 4, 5
```

### Intermediate Operations (Thao tác trung gian)
- `filter(Predicate)`: Lọc các phần tử.
- `map(Function)`: Biến đổi từng phần tử.
- `flatMap(Function)`: Làm phẳng (flatten) các stream lồng nhau.
- `distinct()`: Loại bỏ trùng lặp (dựa trên `equals()`).
- `sorted()`, `sorted(Comparator)`: Sắp xếp.
- `peek(Consumer)`: Thường dùng để debug (không thay đổi phần tử).
- `limit(long)`: Lấy n phần tử đầu tiên.
- `skip(long)`: Bỏ qua n phần tử đầu tiên.
- `takeWhile(Predicate)`: (Java 9) Lấy phần tử chừng nào điều kiện còn đúng, sai là dừng ngay.
- `dropWhile(Predicate)`: (Java 9) Bỏ qua phần tử chừng nào điều kiện đúng, sai là lấy từ đó về sau.
- `mapToInt()`, `mapToDouble()`,...: Chuyển sang primitive stream.

### Terminal Operations (Thao tác kết thúc)
Khi gọi thao tác kết thúc, stream mới thực sự chạy (Lazy evaluation). **Sau khi chạy, Stream không thể tái sử dụng.**
- `forEach`, `forEachOrdered`: Duyệt phần tử.
- `collect`: Gộp kết quả (rất mạnh, sẽ học ở 4.4).
- `toList()` (Java 16): Trả về unmodifiable List trực tiếp.
- `toArray()`: Trả về mảng.
- `reduce`: Kết hợp phần tử (có 3 dạng).
- `count`, `min`, `max`: Thống kê.
- `findFirst`, `findAny`: Tìm kiếm (trả về Optional).
- `allMatch`, `anyMatch`, `noneMatch`: Kiểm tra điều kiện (trả về boolean, có tính chất short-circuiting).

> [!IMPORTANT]
> **Stream là Lazy (Lười biếng):** Nếu không có Terminal Operation, Intermediate Operations sẽ KHÔNG thực thi.
> ```java
> Stream.of("A", "B").peek(System.out::print); // KHÔNG IN RA GÌ CẢ
> ```

> [!WARNING]
> **Stream cannot be reused:** 
> ```java
> Stream<String> s = Stream.of("A");
> s.count();
> s.count(); // LỖI IllegalStateException: stream has already been operated upon or closed
> ```

---

## 4.4 Collectors — Deep Dive

Lớp `java.util.stream.Collectors` cung cấp các factory methods cho thao tác gộp (reduction).

### Thu thập cơ bản
- `Collectors.toList()`, `toSet()`: Trả về mutable collection.
- `Collectors.toUnmodifiableList()`, `toUnmodifiableSet()` (Java 10): Trả về immutable collection.

### Collectors.toMap()
Có 3 overload phổ biến:
1. `toMap(keyMapper, valueMapper)`: Lỗi `IllegalStateException` nếu trùng key.
2. `toMap(keyMapper, valueMapper, mergeFunction)`: Xử lý khi trùng key.
3. `toMap(keyMapper, valueMapper, mergeFunction, mapSupplier)`: Trả về Map cụ thể (VD: `TreeMap::new`).

```java
Stream<String> s = Stream.of("apple", "banana", "apricot");
Map<Character, String> map = s.collect(
    Collectors.toMap(
        str -> str.charAt(0),       // Key
        str -> str,                 // Value
        (s1, s2) -> s1 + "," + s2,  // Xử lý đụng độ key
        TreeMap::new                // Map type
    )
);
// {a=apple,apricot, b=banana}
```

### Grouping By & Partitioning By
- `groupingBy(Function)`: Gom nhóm dựa trên hàm phân loại.
- `partitioningBy(Predicate)`: Chia thành 2 nhóm `true` và `false`.

**Downstream Collectors:** Dùng để xử lý tiếp các giá trị trong mỗi nhóm.
- `counting()`, `summingInt()`, `averagingDouble()`
- `mapping()`
- `maxBy()`, `minBy()`
- `collectingAndThen()`

```java
// Gom nhóm String theo độ dài, sau đó đếm số lượng mỗi nhóm
Map<Integer, Long> countByLen = Stream.of("a", "bb", "c")
    .collect(Collectors.groupingBy(String::length, Collectors.counting()));
```

### Collectors.joining()
Nối chuỗi.
```java
String res = Stream.of("a", "b", "c").collect(Collectors.joining("-", "[", "]")); // [a-b-c]
```

### Collectors.teeing() (Java 12)
Cho phép gom kết quả bằng 2 Collector khác nhau, sau đó kết hợp chúng.
```java
// Lấy max và min cùng lúc
var result = Stream.of(1, 5, 3, 9, 2)
    .collect(Collectors.teeing(
        Collectors.maxBy(Integer::compareTo),
        Collectors.minBy(Integer::compareTo),
        (max, min) -> "Max: " + max.get() + ", Min: " + min.get()
    ));
```

---

## 4.5 Optional

`Optional<T>` giúp xử lý giá trị có thể `null` mà không bị `NullPointerException`.

### Tạo Optional
- `Optional.of(value)`: Quăng NPE nếu value là null.
- `Optional.ofNullable(value)`: Trả về Optional rỗng nếu null.
- `Optional.empty()`: Trả về Optional rỗng.

### Sử dụng an toàn
- `ifPresent(Consumer)`: Nếu có giá trị thì thực hiện Consumer.
- `ifPresentOrElse(Consumer, Runnable)` (Java 9): Xử lý cả 2 trường hợp.
- `orElse(T)`: Trả về giá trị mặc định.
- `orElseGet(Supplier)`: Trả về giá trị từ Supplier (Lazy - hiệu suất tốt hơn).
- `orElseThrow(Supplier)`: Ném ngoại lệ tùy chỉnh.
- `map(Function)`, `flatMap(Function)`: Biến đổi giá trị bên trong.
- `filter(Predicate)`: Lọc giá trị.
- `or(Supplier<Optional>)` (Java 9): Trả về Optional thay thế nếu rỗng.
- `stream()` (Java 9): Chuyển Optional thành Stream.

> [!CAUTION]
> **Anti-patterns (Thường bị hỏi trong thi):** 
> - Gọi `get()` mà không kiểm tra (có thể gây `NoSuchElementException`).
> - Dùng `isPresent()` kết hợp `get()` thay vì dùng `ifPresent()` hay `orElse()`.

---

## 4.6 Primitive Streams

Java cung cấp `IntStream`, `LongStream`, `DoubleStream` để tối ưu hiệu suất tính toán số học.

- **Không có `ShortStream` hay `ByteStream`** (Dùng `IntStream`).
- Các hàm tính toán: `sum()`, `average()` (trả về `OptionalDouble`), `min()`, `max()` (trả về `OptionalInt`/`OptionalDouble`).
- `summaryStatistics()`: Lấy đối tượng `IntSummaryStatistics` chứa đồng thời count, sum, min, max, average.
- `mapToObj()`: Chuyển từ primitive stream sang Object stream.
- `boxed()`: Chuyển `IntStream` thành `Stream<Integer>`.

---

## 4.7 Parallel Streams

Xử lý luồng đa luồng (multi-threading) bằng cách chia nhỏ công việc.

### Cách tạo
- `Collection.parallelStream()`
- `Stream.parallel()`

### Reduction trong Parallel Stream
Hàm `reduce` có dạng 3 tham số (Identity, Accumulator, Combiner) được thiết kế riêng cho parallel stream:
- Tham số thứ 3 (Combiner) được dùng để gộp kết quả của các tiểu tiến trình lại với nhau.

### Thread Safety & ForEach
- Trong parallel stream, thứ tự xử lý không được đảm bảo.
- Dùng `forEach()` có thể in ra kết quả không theo thứ tự ban đầu.
- Dùng `forEachOrdered()` nếu muốn ép in đúng thứ tự (nhưng làm giảm hiệu suất của parallel).
- Tránh dùng stateful lambda expressions (lambda làm thay đổi trạng thái của biến bên ngoài) để tránh race conditions.

> [!TIP]
> **Khi nào dùng Parallel Stream:** Khi có số lượng phần tử CỰC LỚN và mỗi thao tác tính toán tốn nhiều thời gian (CPU-intensive), đồng thời các thao tác phải độc lập (stateless, non-interfering).

---

## Bài Tập Thực Hành (15 Câu Hỏi Cấp Độ OCP)

**Câu 1:** Đoạn mã sau có kết quả là gì?
```java
Predicate<String> p1 = s -> s.length() > 3;
Predicate<String> p2 = Predicate.not(String::isEmpty);
System.out.println(p1.and(p2).test(""));
```
A) true
B) false
C) Lỗi biên dịch (Compilation error)
D) Ném ngoại lệ RuntimeException

**Câu 2:** Lựa chọn nào có thể thay thế để đoạn mã sau biên dịch thành công? (Chọn HAI)
```java
var map = new HashMap<String, Integer>();
// INSERT HERE
```
A) `BiConsumer<String, Integer> b = map::put;`
B) `BiFunction<String, Integer, Integer> b = map::put;`
C) `Consumer<String, Integer> b = map::put;`
D) `BiPredicate<String, Integer> b = map::put;`
E) `BiConsumer<String, Integer> b = (k, v) -> map.put(k, v);`

**Câu 3:** Kết quả là gì?
```java
List<Integer> list = List.of(1, 2, 3);
int total = list.stream()
    .peek(System.out::print)
    .mapToInt(x -> x)
    .sum();
```
A) 123
B) 6
C) Không in ra gì cả, `total` bằng 6.
D) In ra 123, `total` bằng 6.

**Câu 4:** Cú pháp Lambda nào là HỢP LỆ? (Chọn BA)
A) `(var x, y) -> x + y`
B) `(String x, String y) -> { return x + y; }`
C) `x, y -> x + y`
D) `(var x, var y) -> x + y`
E) `(x, y) -> x + y`

**Câu 5:** Kết quả là gì?
```java
Stream<String> s = Stream.of("apple", "banana", "cherry");
s.filter(x -> x.startsWith("a"));
long count = s.count();
System.out.println(count);
```
A) 1
B) 3
C) 0
D) Ném ngoại lệ IllegalStateException

**Câu 6:** Phương thức nào của `Stream` KHÔNG trả về một stream mới?
A) filter()
B) flatMap()
C) map()
D) reduce()
E) takeWhile()

**Câu 7:** Biến nào có thể được truy cập bên trong biểu thức lambda? (Chọn HAI)
A) Biến cục bộ (local variable) không có từ khóa `final` nhưng giá trị không bao giờ thay đổi.
B) Biến cục bộ bị thay đổi giá trị trong một phần khác của method (sau khi lambda được định nghĩa).
C) Biến instance của lớp chứa lambda (class instance variable).
D) Bất kỳ biến cục bộ nào.

**Câu 8:** Kết quả là gì?
```java
Optional<String> opt = Optional.ofNullable(null);
String result = opt.orElseGet(() -> "Empty");
System.out.println(result);
```
A) null
B) Empty
C) Ném NullPointerException
D) Ném NoSuchElementException

**Câu 9:** Chuyện gì xảy ra với đoạn mã sau?
```java
Stream<Integer> s = Stream.of(1, 2, 3);
s.map(i -> i * 2).forEach(System.out::print);
s.map(i -> i * 3).forEach(System.out::print);
```
A) 246369
B) 246
C) Ném IllegalStateException tại runtime
D) Lỗi biên dịch

**Câu 10:** Collector nào dùng để nhóm dữ liệu theo một đặc điểm và chia thành đúng 2 tập hợp dựa trên điều kiện boolean?
A) Collectors.groupingBy()
B) Collectors.partitioningBy()
C) Collectors.mapping()
D) Collectors.teeing()

**Câu 11:** Kết quả là gì?
```java
IntStream stream = IntStream.rangeClosed(1, 5);
System.out.println(stream.average().getAsDouble());
```
A) 3.0
B) 3
C) 15.0
D) Lỗi biên dịch do getAsDouble() không tồn tại

**Câu 12:** Điều nào đúng về `Parallel Streams`? (Chọn HAI)
A) Luôn luôn nhanh hơn sequential streams.
B) Có thể làm thay đổi thứ tự in ra khi dùng `forEach`.
C) Hàm `reduce` trên parallel stream bắt buộc phải có identity value để hoạt động chính xác.
D) Dùng stateful lambda expressions trong parallel stream luôn an toàn.

**Câu 13:** Lựa chọn `Downstream Collector` nào có thể truyền vào hàm `groupingBy` để vừa nhóm vừa lấy giá trị lớn nhất trong mỗi nhóm?
A) Collectors.maxBy()
B) Collectors.maximal()
C) Collectors.summarizingInt()
D) Không thể thực hiện được.

**Câu 14:** Hàm nào trên `Optional` thực thi đoạn mã của tham số Runnable nếu Optional rỗng và thực thi Consumer nếu có giá trị?
A) ifPresent()
B) orElse()
C) ifPresentOrElse()
D) orElseGet()

**Câu 15:** Kết quả của đoạn code sau?
```java
List<String> list = List.of("a", "b", "c");
Map<Integer, String> map = list.stream().collect(
    Collectors.toMap(
        String::length,
        s -> s
    )
);
System.out.println(map);
```
A) {1=a, 1=b, 1=c}
B) {1=a}
C) Ném IllegalStateException
D) {1=c}

---

## ĐÁP ÁN VÀ GIẢI THÍCH CHITIẾT

**Câu 1: B.** Hàm `p1` đòi hỏi độ dài > 3, " " rỗng nên sai. Dù kết hợp bằng `and` (cả 2 đều đúng), điều kiện 1 đã sai nên kết quả là `false` mà không cần quan tâm điều kiện 2. Short-circuit logic.
**Câu 2: B, E.** Hàm `map.put(K, V)` nhận 2 tham số và trả về V (giá trị cũ). `BiFunction` biểu diễn thao tác nhận 2 tham số, trả về 1 kết quả (vừa khớp `put`). Lựa chọn A sai vì `BiConsumer` mong đợi không trả về giá trị (void), nhưng cơ chế Method Reference vẫn chấp nhận được nếu ta bỏ qua kết quả trả về? Tuy nhiên theo spec, nếu Method Reference trả về giá trị khác void, nó có thể dùng cho functional interface có kiểu trả về void. NHƯNG, B và E hoàn toàn an toàn và chắc chắn đúng cú pháp.
**Câu 3: D.** Dòng `.peek` là intermediate operation, nhưng do stream được gọi hàm terminal `sum()`, toàn bộ stream sẽ chạy. `peek` sẽ in 1, 2, 3 và `sum` trả về 6.
**Câu 4: B, D, E.** A sai vì không thể trộn `var` và không kiểu. C sai vì nhiều tham số không có kiểu thì phải bọc trong `(x, y)`.
**Câu 5: D.** Lệnh `s.filter(...)` trả về 1 stream mới, nó KHÔNG thay đổi stream `s`. Ngay sau đó `s.count()` được gọi trên stream `s` - hợp lệ vì stream chưa bị duyệt. KHOAN! `s.filter` được gọi tức là stream `s` đã được operate upon! Gọi tiếp `s.count()` sẽ ném `IllegalStateException`.
**Câu 6: D.** `reduce()` là một Terminal Operation, trả về một giá trị (`Optional` hoặc primitive), không phải Stream.
**Câu 7: A, C.** Local variables phải là final hoặc effectively final. Instance variables có thể truy cập và thay đổi tự do bên trong lambda.
**Câu 8: B.** `Optional.ofNullable(null)` tạo ra một optional rỗng. Lệnh `orElseGet` sẽ thực thi Supplier và trả về chuỗi "Empty".
**Câu 9: C.** Stream không thể được sử dụng lại sau khi một Terminal Operation được thực hiện. Ở dòng 2, `forEach` đã đóng stream `s`. Dòng 3 gọi lại `s.map()` sẽ ném `IllegalStateException`.
**Câu 10: B.** `partitioningBy()` nhóm các phần tử thành Map có key là Boolean (chia thành 2 nhóm đúng và sai).
**Câu 11: A.** `IntStream.rangeClosed(1, 5)` sinh ra các phần tử 1, 2, 3, 4, 5. Tổng là 15, trung bình là 3.0. Hàm `average()` trả về `OptionalDouble`, gọi `getAsDouble()` sẽ lấy ra số `double` là `3.0`.
**Câu 12: B, C.** Không phải luôn nhanh hơn (overhead cấp phát luồng). Hàm `reduce` dạng nhiều luồng yêu cầu kết hợp kết quả (combiner) và Identity value rất quan trọng. Dùng lambda thay đổi trạng thái (stateful) trong parallel cực kỳ nguy hiểm.
**Câu 13: A.** Hàm `Collectors.maxBy(Comparator)` thường được truyền làm tham số thứ 2 của `groupingBy` để tìm phần tử lớn nhất trong nhóm.
**Câu 14: C.** `ifPresentOrElse(Consumer, Runnable)` (từ Java 9) cho phép xử lý cả trường hợp có giá trị và không có giá trị.
**Câu 15: C.** Stream có các phần tử "a", "b", "c". Hàm `String::length` sẽ là khóa. Cả ba chuỗi đều có độ dài = 1. `Collectors.toMap` không cung cấp hàm xử lý đụng độ (merge function), vì vậy khi có key trùng lặp, nó sẽ ném `IllegalStateException: Duplicate key`.
