---
title: "Giai đoạn 2 — Collections, Lambda & Stream (Tuần 7–12)"
icon: "📚"
order: 1
phase: "Phase 3"
tags: ["Collections", "Generics", "HashMap Treeify", "Date/Time"]
---
# Giai đoạn 2 — Collections, Lambda & Stream (Tuần 7–12)

> Mọi output đã được chạy thử để xác minh trên JDK 21, trừ các mục ghi rõ **[Java 24]** (Stream Gatherers) — bạn tự chạy lại trên JDK 25.

Đây là phần **chiếm tỷ trọng lớn nhất** trong đề 1Z0-831 và cũng là phần bạn dùng hằng ngày khi làm DSA. Học kỹ ở đây sẽ tiết kiệm thời gian cho cả hai track.

---

# PHẦN A — LÝ THUYẾT & CODE MINH HOẠ

## Module 2.1 — Mảng & Collections framework

### Ba loại List bất biến khác nhau — đừng nhầm

```java
List<Integer> a = Arrays.asList(1, 2, 3);   // kích thước CỐ ĐỊNH, phần tử đổi được
a.set(0, 99);   // OK  -> [99, 2, 3]
a.add(4);       // UnsupportedOperationException

List<Integer> b = List.of(1, 2, 3);         // BẤT BIẾN hoàn toàn
b.set(0, 99);   // UnsupportedOperationException
b.add(4);       // UnsupportedOperationException

List<Integer> c = new ArrayList<>(List.of(1, 2, 3));  // sửa thoải mái
```

`List.of(...)` cũng **không cho phép `null`** — truyền `null` vào là `NullPointerException` ngay lúc tạo.

### `remove` — bẫy nạp chồng kinh điển

```java
List<Integer> l = new ArrayList<>(List.of(10, 20, 30));
l.remove(1);                      // remove(int index)    -> [10, 30]
l.remove(Integer.valueOf(30));    // remove(Object o)     -> [10]
```

Với `List<Integer>`, `remove(1)` xoá **vị trí** 1 chứ không xoá **giá trị** 1. Muốn xoá theo giá trị phải boxing tường minh.

### `Arrays.asList` với mảng nguyên thuỷ

```java
int[] arr = {1, 2, 3};
Arrays.asList(arr).size();       // 1   -> List<int[]> chứa đúng 1 phần tử!
Integer[] arr2 = {1, 2, 3};
Arrays.asList(arr2).size();      // 3   -> List<Integer>
Arrays.stream(arr).boxed().toList();  // cách đúng cho mảng int
```

Generic không nhận kiểu nguyên thuỷ, nên `int[]` bị coi là **một** object.

### `null` được chấp nhận ở đâu?

| Cấu trúc | key/phần tử `null` | value `null` |
|---|---|---|
| `HashSet` / `LinkedHashSet` | 1 cái | — |
| `TreeSet` | ❌ NPE | — |
| `HashMap` / `LinkedHashMap` | 1 key | nhiều |
| `TreeMap` | ❌ NPE | nhiều |
| `ArrayDeque` | ❌ NPE | — |
| `List.of` / `Map.of` | ❌ NPE | ❌ NPE |

### API Map hiện đại

```java
Map<String, Integer> m = new HashMap<>();
m.put("a", 1);
m.merge("a", 5, Integer::sum);    // có key -> áp dụng hàm  -> a=6
m.merge("b", 5, Integer::sum);    // vắng key -> đặt value   -> b=5
m.merge("a", 0, (x, y) -> null);  // hàm trả null -> XOÁ key -> {b=5}

m.putIfAbsent("b", 100);          // đã có -> không đổi
m.getOrDefault("z", -1);          // -1, KHÔNG thêm key mới
m.computeIfAbsent("k", k -> new ArrayList<>()).add(1);  // mẫu multimap
```

`computeIfAbsent` là công cụ số một khi làm graph/adjacency list trong DSA.

### Deque — dùng thay `Stack` đã lỗi thời

```java
Deque<Integer> dq = new ArrayDeque<>();
dq.push(1); dq.push(2);   // push = addFirst  -> [2, 1]
dq.offerLast(3);          //                  -> [2, 1, 3]
dq.pop();                 // = removeFirst    -> 2
dq.peek();                // = peekFirst      -> 1
```

| Thao tác | Ném exception | Trả giá trị đặc biệt |
|---|---|---|
| Thêm | `addFirst` / `addLast` | `offerFirst` / `offerLast` (false) |
| Xoá | `removeFirst` / `removeLast` | `pollFirst` / `pollLast` (null) |
| Xem | `getFirst` / `getLast` | `peekFirst` / `peekLast` (null) |

### Sửa collection khi đang duyệt

```java
List<Integer> a = new ArrayList<>(List.of(1, 2, 3));
for (Integer i : a) if (i == 1) a.remove(i);   // ConcurrentModificationException
for (Integer i : a) if (i == 2) a.remove(i);   // KHÔNG lỗi! -> [1, 3]
```

Vì sao khác nhau: sau khi xoá phần tử **áp chót**, con trỏ `cursor` bằng đúng `size` mới, nên `hasNext()` trả `false` và vòng lặp kết thúc trước khi kịp kiểm tra `modCount`. Đây là lỗi ẩn nguy hiểm trong code thật.
Cách đúng: `a.removeIf(i -> i == 2);` hoặc dùng `Iterator.remove()`.

### View và bản sao

```java
List<String> src = new ArrayList<>(List.of("a"));
List<String> view = Collections.unmodifiableList(src);
List<String> copy = List.copyOf(src);
src.add("b");
view;   // [a, b]   -> VIEW, thay đổi theo nguồn
copy;   // [a]      -> BẢN SAO độc lập
```

---

## Module 2.2 — Comparable, Comparator, equals/hashCode

### Comparable vs Comparator

```java
record P(String name, int age) implements Comparable<P> {
    public int compareTo(P o) { return Integer.compare(age, o.age); }  // thứ tự "tự nhiên"
}

list.sort(null);                                  // dùng compareTo
list.sort(Comparator.comparingInt(P::age));       // thứ tự riêng
```

Dùng `Integer.compare(a, b)` chứ **đừng** viết `a - b` — trừ hai số lớn sẽ tràn `int` và cho kết quả sai dấu.

### Chuỗi Comparator — vị trí `reversed()` rất quan trọng

```java
List<String> n = new ArrayList<>(List.of("bob", "al", "Cara", "dan"));

n.sort(Comparator.comparing(String::length)
                 .thenComparing(Comparator.naturalOrder()));
// [al, bob, dan, Cara]

n.sort(Comparator.comparing(String::length).reversed());
// [Cara, bob, dan, al]
```

`reversed()` đảo **toàn bộ chuỗi phía trước nó**, không chỉ tiêu chí cuối. Muốn chỉ đảo một tiêu chí:
`Comparator.comparing(P::name).thenComparing(P::age, Comparator.reverseOrder())`.

Sắp xếp trong Java là **ổn định** (stable) với object: phần tử bằng nhau giữ nguyên thứ tự tương đối.

### Hợp đồng equals/hashCode

```java
class K {
    int v;
    K(int v) { this.v = v; }
    public boolean equals(Object o) { return o instanceof K k && k.v == v; }
    // QUÊN hashCode!
}
Set<K> s = new HashSet<>();
s.add(new K(1));
s.contains(new K(1));   // false
```

Hai object `equals` nhau **bắt buộc** phải có `hashCode` bằng nhau. Thiếu `hashCode`, `HashSet`/`HashMap` tìm sai bucket → không thấy. Ngược lại, `hashCode` bằng nhau **không** bắt buộc `equals`.
Cũng đừng thay đổi field dùng trong `hashCode` sau khi đã bỏ object vào `HashSet` — nó sẽ "mất tích".

`record` tự sinh cả hai đúng chuẩn → nên ưu tiên dùng `record` làm key.

### Sắp xếp object không so sánh được

```java
Stream.of(new Object(), new Object()).sorted().toList();  // ClassCastException lúc chạy
```

Biên dịch vẫn qua vì `sorted()` không ràng buộc kiểu — lỗi chỉ lộ lúc chạy. `Collections.binarySearch` trên list **chưa sắp xếp** thì kết quả không xác định, không ném exception.

---

## Module 2.3 — Generics & wildcard

### Generic không hiệp biến

```java
List<Object> l = new ArrayList<String>();   // LỖI: incompatible types
Object[] arr = new String[3];               // OK (mảng thì hiệp biến — và không an toàn)
arr[0] = 1;                                 // ArrayStoreException lúc chạy
```

### PECS — Producer Extends, Consumer Super

```java
void f(List<? extends Number> l) {
    Number n = l.get(0);   // OK  — đọc được
    l.add(1);              // LỖI: no suitable method found for add(int)
}

void g(List<? super Integer> l) {
    l.add(1);              // OK  — ghi được
    Integer x = l.get(0);  // LỖI: CAP#1 cannot be converted to Integer
    Object o = l.get(0);   // OK  — chỉ đọc ra Object
}
```

Mẹo nhớ: `? extends` = **chỉ đọc** (không biết kiểu thật là gì nên không dám ghi). `? super` = **chỉ ghi** (biết chắc chứa được Integer, nhưng không biết đọc ra kiểu gì).
Ngoại lệ duy nhất: `l.add(null)` luôn hợp lệ với `? extends`.

### Type erasure

```java
static void h(List<String> a) { }
static void h(List<Integer> a) { }   // LỖI: name clash — have the same erasure
```

Sau biên dịch, cả hai đều là `h(List)`. Cũng vì erasure:
- không có `new T[]`, `new T()`
- không dùng `instanceof List<String>` (chỉ được `instanceof List<?>`)
- không có static field kiểu `T`

---

## Module 2.4 — Lambda, functional interface, method reference

### Functional interface có sẵn cần thuộc lòng

| Interface | Method | Chữ ký |
|---|---|---|
| `Supplier<T>` | `get()` | `() -> T` |
| `Consumer<T>` | `accept(T)` | `T -> void` |
| `BiConsumer<T,U>` | `accept(T,U)` | `(T,U) -> void` |
| `Predicate<T>` | `test(T)` | `T -> boolean` |
| `BiPredicate<T,U>` | `test(T,U)` | `(T,U) -> boolean` |
| `Function<T,R>` | `apply(T)` | `T -> R` |
| `BiFunction<T,U,R>` | `apply(T,U)` | `(T,U) -> R` |
| `UnaryOperator<T>` | `apply(T)` | `T -> T` |
| `BinaryOperator<T>` | `apply(T,T)` | `(T,T) -> T` |

Biến thể nguyên thuỷ hay ra đề: `IntSupplier`, `IntPredicate`, `IntFunction<R>` (int → R), `ToIntFunction<T>` (T → int), `IntUnaryOperator`, `ObjIntConsumer<T>`.

**Functional interface** = đúng **một** abstract method. Method trùng chữ ký với `Object` (`toString`, `equals`, `hashCode`) không được tính.

### Biến bắt buộc effectively final

```java
int c = 0;
Runnable r = () -> System.out.println(c);
c = 5;   // LỖI: local variables referenced from a lambda expression
         //      must be final or effectively final
```

Field của instance thì **không** bị ràng buộc này — đây là lối thoát khi cần biến đổi.

### Bốn dạng method reference

```java
Function<String, Integer>          f1 = Integer::parseInt;   // static
Predicate<String>                  f2 = "xin"::startsWith;   // bound — receiver cố định
Function<String, Integer>          f3 = String::length;      // unbound — tham số 1 là receiver
BiFunction<String, String, Boolean> f4 = String::startsWith; // unbound 2 tham số
Supplier<ArrayList<String>>        f5 = ArrayList::new;      // constructor
```

Điểm dễ nhầm: `String::startsWith` **không** phải static — tham số đầu tiên đóng vai `this`, nên nó khớp `BiFunction` chứ không phải `Function`.

---

## Module 2.5 — Stream & Optional

### Stream chỉ dùng được một lần

```java
Stream<String> s = Stream.of("a", "b");
s.count();
s.count();   // IllegalStateException: stream has already been operated upon or closed
```

### Lazy — không có terminal operation thì không có gì chạy

```java
Stream.of(1, 2, 3).peek(x -> System.out.print(x));   // không in gì cả
```

Nhưng cẩn thận chiều ngược lại:

```java
Stream.of(1, 2, 3).peek(x -> System.out.print("p" + x)).count();   // vẫn KHÔNG in gì, trả về 3
```

Từ Java 9, `count()` được phép **bỏ qua toàn bộ pipeline** nếu tính được số phần tử mà không cần duyệt (không có `filter`/`flatMap` chen vào). Vì thế `peek` không chạy.

### Short-circuit trên stream vô hạn

```java
Stream.iterate(1, x -> x + 1).filter(x -> x % 7 == 0).findFirst().get();   // 7
Stream.iterate(1, x -> x < 20, x -> x * 2).toList();   // [1, 2, 4, 8, 16]  (dạng 3 tham số, Java 9)
```

Các thao tác short-circuit: `findFirst`, `findAny`, `anyMatch`, `allMatch`, `noneMatch`, `limit`.
Dùng `sorted()` hay `count()` trên stream vô hạn sẽ treo vĩnh viễn.

### Stream nguyên thuỷ

```java
IntStream.range(1, 5).count();       // 4  — không bao gồm 5
IntStream.rangeClosed(1, 5).count(); // 5
IntStream.of(1,2,3).sum();           // 6            -> int
IntStream.of(1,2,3).average();       // OptionalDouble[2.0]
IntStream.of().average();            // OptionalDouble.empty
IntStream.of(1,2).boxed().toList();  // List<Integer>
list.stream().mapToInt(Integer::intValue).sum();
```

Nhớ: `sum()` trả số thường, nhưng `average()`, `max()`, `min()` trả `Optional…` vì stream có thể rỗng.

### `allMatch` trên stream rỗng

```java
Stream.of().anyMatch(x -> true);    // false
Stream.of().allMatch(x -> false);   // true   (chân lý rỗng — vacuous truth)
Stream.of().noneMatch(x -> true);   // true
```

### Optional

```java
Optional.of(null);          // NullPointerException
Optional.ofNullable(null);  // Optional.empty
Optional.empty().get();     // NoSuchElementException

opt.orElse(expensive());     // expensive() LUÔN được gọi, kể cả khi opt có giá trị
opt.orElseGet(() -> expensive());  // chỉ gọi khi rỗng  <- ưu tiên dùng
opt.orElseThrow();           // NoSuchElementException
opt.ifPresentOrElse(v -> ..., () -> ...);
```

### `reduce`

```java
Stream.of(1,2,3).reduce(Integer::sum);        // Optional[6]  — không có identity
Stream.<Integer>of().reduce(0, Integer::sum); // 0            — có identity, không bao giờ rỗng
```

---

## Module 2.6 — Collectors, parallel, Gatherers

### Nhóm và phân hoạch

```java
record P(String name, String city, int age) {}
List<P> ps = List.of(new P("An","HCM",30), new P("Bao","HN",25), new P("Cuc","HCM",35));

ps.stream().collect(Collectors.groupingBy(P::city));
// {HCM=[...], HN=[...]}   -> mặc định trả về HashMap

ps.stream().collect(Collectors.groupingBy(P::city, Collectors.counting()));
// {HCM=2, HN=1}

ps.stream().collect(Collectors.groupingBy(P::city, TreeMap::new, Collectors.toList()));
// chỉ định kiểu Map cụ thể

Stream.<Integer>of().collect(Collectors.partitioningBy(x -> x > 0));
// {false=[], true=[]}   -> LUÔN có đủ cả hai key, kể cả khi rỗng
```

`groupingBy` chỉ tạo key khi có phần tử. `partitioningBy` luôn có đúng hai key `false`/`true`.

### `toMap` và bẫy trùng key

```java
ps.stream().collect(Collectors.toMap(P::city, P::name));
// IllegalStateException: Duplicate key HCM

ps.stream().collect(Collectors.toMap(P::city, P::name, (a, b) -> a + "|" + b));
// {HCM=An|Cuc, HN=Bao}
```

### Các collector khác hay ra đề

```java
Collectors.joining(", ", "[", "]");        // "[An, Bao, Cuc]"
Collectors.averagingInt(P::age);           // Double (không phải Optional)
Collectors.summingInt(P::age);             // Integer
Collectors.summarizingInt(P::age);         // IntSummaryStatistics (count/sum/min/max/avg)
Collectors.mapping(P::name, Collectors.toList());
Collectors.teeing(Collectors.counting(),
                  Collectors.averagingInt(P::age),
                  (c, a) -> c + " người, TB " + a);   // "3 người, TB 30.0"
```

### flatMap

```java
Stream.of(List.of(1,2), List.of(3)).flatMap(List::stream).toList();   // [1, 2, 3]
```

Dùng để "làm phẳng" một tầng lồng nhau. Rất hay dùng cho graph, ma trận trong DSA.

### Parallel stream

```java
IntStream.rangeClosed(1, 8).parallel().forEach(System.out::print);         // thứ tự KHÔNG đảm bảo
IntStream.rangeClosed(1, 8).parallel().forEachOrdered(System.out::print);  // 12345678
```

Điều kiện để parallel cho kết quả đúng: hàm phải **stateless**, **không side effect**, và với `reduce` phải **kết hợp được** (associative). `findFirst` trên parallel vẫn tốn kém vì phải giữ thứ tự — dùng `findAny` nếu không cần.
Parallel thường **chậm hơn** với dữ liệu nhỏ, `LinkedList`, hoặc thao tác tuần tự phụ thuộc như `limit`/`sorted`.

### [Java 24] Stream Gatherers — thao tác trung gian tự định nghĩa

Đây là điểm mới quan trọng nhất của đề Java 25 so với Java 21. `gather()` bổ sung cho `collect()`: `collect` là terminal, `gather` là intermediate.

```java
Stream.of(1,2,3,4,5).gather(Gatherers.windowFixed(2)).toList();
// [[1, 2], [3, 4], [5]]

Stream.of(1,2,3,4).gather(Gatherers.windowSliding(2)).toList();
// [[1, 2], [2, 3], [3, 4]]

Stream.of(1,2,3).gather(Gatherers.scan(() -> 0, Integer::sum)).toList();
// [1, 3, 6]      -> phát ra từng kết quả tích luỹ, KHÔNG phát giá trị khởi tạo

Stream.of(1,2,3).gather(Gatherers.fold(() -> 0, Integer::sum)).toList();
// [6]            -> gộp thành đúng một phần tử

stream.gather(Gatherers.mapConcurrent(4, this::callApi));
// chạy song song tối đa 4 tác vụ trên virtual thread, giữ nguyên thứ tự
```

Trước Java 24, `windowSliding` phải tự viết bằng `IntStream.range` + `subList` — nay có sẵn.

---

# PHẦN B — 30 BÀI TẬP

**Câu 1.** Dòng nào ném exception?
```java
List<Integer> a = Arrays.asList(1, 2, 3);
a.set(0, 99);   // 1
a.add(4);       // 2
List<Integer> b = List.of(1, 2, 3);
b.set(0, 99);   // 3
```

**Câu 2.** Kết quả cuối?
```java
List<Integer> l = new ArrayList<>(List.of(10, 20, 30));
l.remove(1);
l.remove(Integer.valueOf(30));
System.out.println(l);
```

**Câu 3.** In ra gì?
```java
int[] arr = {1, 2, 3};
System.out.println(Arrays.asList(arr).size());
```

**Câu 4.** Dòng nào ném `NullPointerException`?
```java
new HashSet<String>().add(null);        // 1
new TreeSet<String>().add(null);        // 2
new HashMap<String,String>().put(null, "a");   // 3
new TreeMap<String,String>().put(null, "a");   // 4
```

**Câu 5.** `m` cuối cùng là gì?
```java
Map<String, Integer> m = new HashMap<>();
m.put("a", 1);
m.merge("a", 5, Integer::sum);
m.merge("b", 5, Integer::sum);
m.merge("a", 0, (x, y) -> null);
System.out.println(m);
```

**Câu 6.** In ra gì?
```java
Deque<Integer> dq = new ArrayDeque<>();
dq.push(1);
dq.push(2);
dq.offerLast(3);
System.out.println(dq + " " + dq.pop() + " " + dq.peek());
```

**Câu 7.** Đoạn nào ném `ConcurrentModificationException`, đoạn nào không? Vì sao?
```java
List<Integer> a = new ArrayList<>(List.of(1, 2, 3));
for (Integer i : a) if (i == 1) a.remove(i);   // A

List<Integer> b = new ArrayList<>(List.of(1, 2, 3));
for (Integer i : b) if (i == 2) b.remove(i);   // B
```

**Câu 8.** `view` và `copy` in ra gì?
```java
List<String> src = new ArrayList<>(List.of("a"));
List<String> view = Collections.unmodifiableList(src);
List<String> copy = List.copyOf(src);
src.add("b");
System.out.println(view + " " + copy);
```

**Câu 9.** Hai lần sắp xếp cho kết quả nào?
```java
List<String> n = new ArrayList<>(List.of("bob", "al", "Cara", "dan"));
n.sort(Comparator.comparing(String::length).thenComparing(Comparator.naturalOrder()));
System.out.println(n);
n.sort(Comparator.comparing(String::length).reversed());
System.out.println(n);
```

**Câu 10.** In ra gì, và sai ở đâu?
```java
class K {
    int v;
    K(int v) { this.v = v; }
    public boolean equals(Object o) { return o instanceof K k && k.v == v; }
}
Set<K> s = new HashSet<>();
s.add(new K(1));
System.out.println(s.contains(new K(1)));
```

**Câu 11.** Comparator nào có lỗi tiềm ẩn?
```java
Comparator<Integer> c1 = (a, b) -> a - b;                 // 1
Comparator<Integer> c2 = (a, b) -> Integer.compare(a, b); // 2
Comparator<Integer> c3 = Comparator.naturalOrder();       // 3
```

**Câu 12.** Chuyện gì xảy ra?
```java
Stream.of(new Object(), new Object()).sorted().toList();
```

**Câu 13.** Dòng nào không biên dịch?
```java
List<Object> a = new ArrayList<String>();   // 1
Object[] b = new String[3];                 // 2
b[0] = 1;                                   // 3
```

**Câu 14.** Dòng nào lỗi biên dịch?
```java
void f(List<? extends Number> l) {
    Number n = l.get(0);   // 1
    l.add(1);              // 2
    l.add(null);           // 3
}
void g(List<? super Integer> l) {
    l.add(1);              // 4
    Integer x = l.get(0);  // 5
    Object o = l.get(0);   // 6
}
```

**Câu 15.** Vì sao đoạn này không biên dịch?
```java
static void h(List<String> a) { }
static void h(List<Integer> a) { }
```

**Câu 16.** Interface nào là functional interface?
```java
interface A { void f(); String toString(); }                  // 1
interface B { void f(); void g(); }                           // 2
interface C { void f(); default void g() {} static void k(){} } // 3
interface D { }                                                // 4
```

**Câu 17.** Vì sao lỗi, sửa thế nào?
```java
int c = 0;
Runnable r = () -> System.out.println(c);
c = 5;
```

**Câu 18.** Ghép mỗi method reference với kiểu đúng.
```java
? f1 = Integer::parseInt;
? f2 = "xin"::startsWith;
? f3 = String::length;
? f4 = String::startsWith;
? f5 = ArrayList::new;
```

**Câu 19.** In ra gì?
```java
Stream<String> s = Stream.of("a", "b");
System.out.println(s.count());
System.out.println(s.count());
```

**Câu 20.** In ra gì?
```java
Stream.of(1, 2, 3).peek(x -> System.out.print("p" + x + " "));
System.out.println("---");
System.out.println(Stream.of(1, 2, 3).peek(x -> System.out.print("q" + x + " ")).count());
```

**Câu 21.** In ra gì?
```java
System.out.println(Stream.iterate(1, x -> x + 1).filter(x -> x % 7 == 0).findFirst().get());
System.out.println(Stream.iterate(1, x -> x < 20, x -> x * 2).toList());
```

**Câu 22.** Giá trị và **kiểu** của mỗi biểu thức?
```java
IntStream.range(1, 5).count();
IntStream.rangeClosed(1, 5).count();
IntStream.of(1, 2, 3).sum();
IntStream.of(1, 2, 3).average();
IntStream.of().average();
```

**Câu 23.** In ra gì?
```java
System.out.println(Stream.of().anyMatch(x -> true));
System.out.println(Stream.of().allMatch(x -> false));
```

**Câu 24.** Dòng nào ném exception, dòng nào trả `Optional.empty`?
```java
Optional.of(null);          // 1
Optional.ofNullable(null);  // 2
Optional.empty().get();     // 3
```

**Câu 25.** Sự khác biệt về hành vi giữa hai dòng khi `opt` **có** giá trị?
```java
opt.orElse(makeDefault());
opt.orElseGet(() -> makeDefault());
```

**Câu 26.** Hai biểu thức trả về gì (giá trị và kiểu)?
```java
Stream.of(1, 2, 3).reduce(Integer::sum);
Stream.<Integer>of().reduce(0, Integer::sum);
```

**Câu 27.** In ra gì?
```java
List<P> ps = List.of(new P("An","HCM",30), new P("Bao","HN",25), new P("Cuc","HCM",35));
System.out.println(ps.stream().collect(Collectors.toMap(P::city, P::name)));
```

**Câu 28.** In ra gì?
```java
System.out.println(Stream.<Integer>of().collect(Collectors.partitioningBy(x -> x > 0)));
System.out.println(Stream.<Integer>of().collect(Collectors.groupingBy(x -> x > 0)));
```

**Câu 29.** Kết quả nào **không** đảm bảo?
```java
IntStream.rangeClosed(1, 8).parallel().forEach(System.out::print);         // A
IntStream.rangeClosed(1, 8).parallel().forEachOrdered(System.out::print);  // B
IntStream.rangeClosed(1, 8).parallel().sum();                              // C
```

**Câu 30.** **[Java 24]** Mỗi dòng cho ra list nào?
```java
Stream.of(1,2,3,4,5).gather(Gatherers.windowFixed(2)).toList();
Stream.of(1,2,3,4).gather(Gatherers.windowSliding(2)).toList();
Stream.of(1,2,3).gather(Gatherers.scan(() -> 0, Integer::sum)).toList();
Stream.of(1,2,3).gather(Gatherers.fold(() -> 0, Integer::sum)).toList();
```

---

# PHẦN C — ĐÁP ÁN & GIẢI THÍCH

**Câu 1 → dòng 2 và 3 ném `UnsupportedOperationException`.**
`Arrays.asList` trả về một list **kích thước cố định** được "bọc" quanh mảng gốc: đổi phần tử được (`set`), thêm/bớt thì không. `List.of` bất biến hoàn toàn nên `set` cũng hỏng.
*Thêm:* `List.of(1, null)` ném `NullPointerException` ngay lúc tạo, còn `Arrays.asList(1, null)` thì được.

---

**Câu 2 → `[10]`**
`remove(1)` khớp với overload `remove(int index)` — xoá **vị trí** 1, tức số 20 → `[10, 30]`. `remove(Integer.valueOf(30))` khớp `remove(Object)` — xoá **giá trị** 30 → `[10]`.
Đây là chỗ duy nhất trong Collections mà kiểu tham số quyết định ngữ nghĩa hoàn toàn khác nhau. Với `List<Integer>` hãy luôn viết `remove(Integer.valueOf(x))` hoặc `remove((Integer) x)` khi muốn xoá theo giá trị.

---

**Câu 3 → `1`**
`Arrays.asList` là generic nên tham số phải là kiểu tham chiếu. `int[]` không tự tách thành `Integer...`, nó bị coi là **một** object duy nhất → `List<int[]>` có size 1.
Với `Integer[]` thì kết quả là 3. Cách đúng cho mảng nguyên thuỷ: `Arrays.stream(arr).boxed().toList()`.

---

**Câu 4 → dòng 2 và 4.**
`TreeSet`/`TreeMap` phải gọi `compareTo` để xác định vị trí, mà `null.compareTo` là NPE. `HashSet`/`HashMap` xử lý `null` riêng (hash coi như 0) nên chấp nhận **một** phần tử/key `null`.
`ArrayDeque` cũng cấm `null` vì nó dùng `null` làm tín hiệu "rỗng" cho `poll`/`peek`.

---

**Câu 5 → `{b=5}`**
Lần theo:
1. `put("a",1)` → `{a=1}`
2. `merge("a",5,sum)`: key có sẵn → áp dụng hàm → `a=6`
3. `merge("b",5,sum)`: key vắng → **bỏ qua hàm**, đặt thẳng value → `b=5`
4. `merge("a",0,(x,y)->null)`: hàm trả `null` → **xoá hẳn key** → `{b=5}`
Ba hành vi khác nhau trong cùng một method — đề rất thích ghép cả ba vào một câu.

---

**Câu 6 → `[2, 1, 3] 2 1`**
`push` là bí danh của `addFirst`, nên push(1) rồi push(2) cho `[2, 1]`. `offerLast(3)` thêm vào cuối → `[2, 1, 3]`. `pop` = `removeFirst` → 2, còn lại `[1, 3]`. `peek` = `peekFirst` → 1.
Nhớ: `Deque` hoạt động như stack ở **đầu** danh sách, ngược với `Stack` cũ dùng cuối mảng.

---

**Câu 7 → A ném `ConcurrentModificationException`, B thì không (kết quả `[1, 3]`).**
`Iterator.next()` kiểm tra `modCount` để phát hiện thay đổi bên ngoài. Nhưng `hasNext()` chỉ so `cursor != size`.
Ở B, sau khi xoá phần tử **áp chót**, `size` giảm từ 3 xuống 2 và `cursor` cũng đang là 2 → `hasNext()` trả `false`, vòng lặp thoát **trước khi** `next()` kịp kiểm tra. Ở A xoá phần tử đầu nên vẫn còn lượt `next()` → phát hiện được.
Bài học: CME là cơ chế "best effort", đừng bao giờ dựa vào nó. Dùng `removeIf` hoặc `Iterator.remove()`.

---

**Câu 8 → `[a, b] [a]`**
`Collections.unmodifiableList` trả về một **view**: bạn không sửa được qua nó, nhưng nó phản ánh mọi thay đổi của list nguồn. `List.copyOf` tạo **bản sao** độc lập, hoàn toàn bất biến.
Khi cần trả list ra ngoài API mà muốn thật sự an toàn, dùng `List.copyOf`.

---

**Câu 9 → `[al, bob, dan, Cara]` rồi `[Cara, bob, dan, al]`**
Lần 1: sắp theo độ dài (2, 3, 3, 4), hai chuỗi cùng dài 3 thì so tiếp theo thứ tự tự nhiên → `bob` trước `dan`.
Lần 2: `reversed()` áp lên **toàn bộ** comparator đứng trước, tức đảo theo độ dài giảm dần → `Cara`(4), rồi hai chuỗi dài 3, rồi `al`(2). Vì `sort` của Java **ổn định**, `bob` và `dan` giữ nguyên thứ tự tương đối từ lần sắp trước.
*Bẫy:* nhiều người tưởng `reversed()` chỉ đảo tiêu chí cuối cùng.

---

**Câu 10 → `false`. Lỗi: override `equals` mà quên `hashCode`.**
`HashSet` tìm phần tử theo hai bước: tính `hashCode` để chọn bucket, rồi mới `equals` trong bucket đó. Hai object `K(1)` có `hashCode` mặc định khác nhau (theo địa chỉ) nên rơi vào hai bucket khác nhau — `equals` không bao giờ được gọi.
Sửa: thêm `public int hashCode() { return Integer.hashCode(v); }`, hoặc tốt hơn là dùng `record K(int v) {}`.

---

**Câu 11 → `c1` có lỗi tiềm ẩn.**
`a - b` tràn `int` khi hai số cách xa nhau: với `a = 2_000_000_000` và `b = -2_000_000_000`, hiệu thực là 4 tỷ, vượt `Integer.MAX_VALUE` → kết quả âm → comparator báo sai chiều, vi phạm hợp đồng và có thể khiến `sort` ném `IllegalArgumentException: Comparison method violates its general contract`.
`Integer.compare` xử lý đúng mọi trường hợp. Trong DSA, đây là bug hay gặp khi so sánh timestamp hoặc toạ độ lớn.

---

**Câu 12 → biên dịch OK, ném `ClassCastException` lúc chạy.**
`sorted()` không có ràng buộc kiểu ở mức generic, nó chỉ ép kiểu về `Comparable` khi thực thi. `Object` không implement `Comparable` → lỗi runtime.
Cùng loại bẫy: `Collections.binarySearch` trên list chưa sắp xếp không ném exception mà trả về **kết quả vô nghĩa** — còn nguy hiểm hơn.

---

**Câu 13 → dòng 1 lỗi biên dịch; dòng 3 lỗi lúc chạy (`ArrayStoreException`).**
Generic **không hiệp biến**: `List<String>` không phải là `List<Object>`, vì nếu cho phép thì ta có thể nhét `Integer` vào list của String.
Mảng thì hiệp biến (quyết định từ Java 1.0, trước khi có generic) nên dòng 2 qua được biên dịch, nhưng JVM kiểm tra lúc chạy và ném `ArrayStoreException` ở dòng 3. Đây chính là lý do generic được thiết kế chặt hơn.

---

**Câu 14 → dòng 2 và 5 lỗi.**
- (2) Với `? extends Number`, kiểu thật có thể là `List<Double>` — thêm `Integer` vào sẽ phá kiểu, nên compiler cấm mọi `add` (thông báo *no suitable method found for add(int)*).
- (3) `add(null)` được phép vì `null` hợp với mọi kiểu.
- (4) Với `? super Integer`, kiểu thật ít nhất là `List<Integer>` nên thêm `Integer` luôn an toàn.
- (5) Nhưng đọc ra thì chỉ biết chắc là `Object` (có thể là `List<Object>`) → gán vào `Integer` là lỗi.
Ghi nhớ PECS: **P**roducer → `extends`, **C**onsumer → `super`.

---

**Câu 15 → *name clash: have the same erasure*.**
Java xoá thông tin generic khi biên dịch, cả hai method đều trở thành `h(List)` → trùng chữ ký. Đổi tên method, hoặc đổi kiểu tham số thành `List<?>` cộng thêm tham số phân biệt.
Cùng hệ quả của erasure: không có `new T[]`, không `instanceof List<String>`, không static field kiểu `T`.

---

**Câu 16 → 1 và 3.**
- (1) `toString()` trùng chữ ký với method của `Object` nên **không tính** là abstract method → còn đúng một là `f()`. ✅
- (2) Hai abstract method → không phải. ❌
- (3) `default` và `static` không tính → còn đúng `f()`. ✅
- (4) Không có abstract method nào → không phải. ❌
Annotation `@FunctionalInterface` chỉ để compiler kiểm tra hộ, không bắt buộc.

---

**Câu 17 → Lỗi *local variables referenced from a lambda expression must be final or effectively final*.**
Lambda "chụp" giá trị của biến local tại thời điểm tạo, nên biến đó không được thay đổi ở bất cứ đâu trong phạm vi. Chỉ cần bỏ dòng `c = 5;` là biến trở thành effectively final.
Nếu thật sự cần biến đổi: dùng field của lớp, mảng một phần tử `int[] c = {0}`, hoặc `AtomicInteger`.

---

**Câu 18**
```java
Function<String, Integer>           f1 = Integer::parseInt;   // static
Predicate<String>                   f2 = "xin"::startsWith;   // bound
Function<String, Integer>           f3 = String::length;      // unbound, 1 tham số
BiFunction<String, String, Boolean> f4 = String::startsWith;  // unbound, 2 tham số
Supplier<ArrayList<String>>         f5 = ArrayList::new;      // constructor
```
Điểm mấu chốt là `f2` và `f4` dùng **cùng một method** `startsWith` nhưng khác kiểu: khi receiver đã cố định (`"xin"::`) thì method reference nhận 1 tham số; khi receiver để trống (`String::`) thì tham số đầu tiên đóng vai `this`, nên tổng cộng 2 tham số.

---

**Câu 19 → `2`, rồi `IllegalStateException`.**
Mỗi stream chỉ tiêu thụ được một lần. Sau terminal operation, nó bị đánh dấu đã đóng. Thông báo: *stream has already been operated upon or closed*.
Muốn dùng lại, hãy tạo `Supplier<Stream<...>>` rồi gọi `get()` mỗi lần cần.

---

**Câu 20 → chỉ in `---` rồi `3`. Cả `p` lẫn `q` đều không được in.**
Dòng đầu không có terminal operation → pipeline không chạy (lazy).
Dòng sau có `count()`, nhưng từ Java 9, `count()` được phép bỏ qua toàn bộ pipeline nếu suy ra được số phần tử mà không cần duyệt — `Stream.of(1,2,3)` có kích thước đã biết và `peek` không đổi số phần tử, nên JVM trả thẳng 3.
*Thử đối chứng:* thêm `.filter(x -> true)` vào giữa thì `peek` sẽ chạy, vì `filter` khiến kích thước không còn xác định trước.

---

**Câu 21 → `7` và `[1, 2, 4, 8, 16]`**
`findFirst` là thao tác short-circuit nên stream vô hạn vẫn dừng được ngay khi tìm thấy phần tử đầu tiên chia hết cho 7.
Dạng `iterate` ba tham số (Java 9) có sẵn điều kiện dừng, tương đương vòng `for`: bắt đầu 1, chạy khi `x < 20`, mỗi bước nhân đôi → dừng ở 16 (32 không thoả điều kiện nên không được phát ra).
*Cảnh báo:* `sorted()`, `count()`, `max()` trên stream vô hạn sẽ treo mãi mãi.

---

**Câu 22**
| Biểu thức | Giá trị | Kiểu |
|---|---|---|
| `IntStream.range(1,5).count()` | 4 | `long` |
| `IntStream.rangeClosed(1,5).count()` | 5 | `long` |
| `IntStream.of(1,2,3).sum()` | 6 | `int` |
| `IntStream.of(1,2,3).average()` | `OptionalDouble[2.0]` | `OptionalDouble` |
| `IntStream.of().average()` | `OptionalDouble.empty` | `OptionalDouble` |

`range` loại trừ cận trên, `rangeClosed` bao gồm. `sum()` trả số thường vì stream rỗng có kết quả hợp lý là 0; `average()`, `max()`, `min()` phải trả `Optional…` vì trung bình của tập rỗng không tồn tại.
Lưu ý `count()` luôn trả `long`, không phải `int`.

---

**Câu 23 → `false` rồi `true`.**
`anyMatch` cần **ít nhất một** phần tử thoả — tập rỗng thì không có → `false`.
`allMatch` hỏi "mọi phần tử đều thoả?" — với tập rỗng, mệnh đề đúng một cách hình thức (vacuous truth) → `true`, kể cả khi predicate là `x -> false`.
`noneMatch` trên rỗng cũng `true`. Đề rất hay hỏi câu này.

---

**Câu 24 → 1 ném `NullPointerException`; 2 trả `Optional.empty`; 3 ném `NoSuchElementException`.**
`Optional.of` yêu cầu giá trị khác `null` — dùng nó khi bạn muốn "nổ" sớm nếu có bug. `ofNullable` là bản khoan dung, biến `null` thành rỗng.
`get()` trên rỗng ném `NoSuchElementException` (không phải NPE). Từ Java 10 nên dùng `orElseThrow()` — cùng hành vi nhưng tên gọi trung thực hơn.

---

**Câu 25 → `orElse` vẫn gọi `makeDefault()`, `orElseGet` thì không.**
`orElse(x)` nhận một **giá trị**, nên biểu thức `makeDefault()` phải được tính trước khi truyền vào — kể cả khi `opt` có giá trị và kết quả bị vứt đi. `orElseGet` nhận một **Supplier**, chỉ gọi khi thật sự cần.
Hệ quả thực tế: nếu `makeDefault()` truy vấn database hoặc ném exception, `orElse` sẽ gây bug im lặng. Mặc định nên dùng `orElseGet`.

---

**Câu 26 → `Optional[6]` (kiểu `Optional<Integer>`) và `0` (kiểu `Integer`).**
Bản `reduce(accumulator)` không có giá trị khởi tạo nên với stream rỗng không biết trả gì → phải bọc trong `Optional`.
Bản `reduce(identity, accumulator)` luôn có sẵn `identity` để trả về → kiểu trả về là `T` thuần.
Còn bản ba tham số `reduce(identity, accumulator, combiner)` dùng cho parallel stream khi kiểu tích luỹ khác kiểu phần tử.

---

**Câu 27 → `IllegalStateException: Duplicate key HCM`**
`Collectors.toMap` hai tham số không biết xử lý key trùng nên ném exception. An → HCM, rồi Cuc cũng → HCM → nổ.
Sửa bằng cách thêm merge function: `toMap(P::city, P::name, (a, b) -> a + "|" + b)` → `{HCM=An|Cuc, HN=Bao}`.
Muốn chỉ định kiểu Map, dùng bản bốn tham số: `toMap(k, v, mergeFn, TreeMap::new)`.

---

**Câu 28 → `{false=[], true=[]}` và `{}`**
`partitioningBy` luôn tạo đúng hai khoá `false` và `true`, ngay cả khi không có phần tử nào rơi vào — nên bạn không bao giờ phải kiểm tra `null` khi gọi `get(true)`.
`groupingBy` chỉ tạo khoá khi có ít nhất một phần tử, nên với stream rỗng ta được map rỗng, và `get(x)` có thể trả `null`.
Thêm: `groupingBy` mặc định trả `HashMap` (không đảm bảo thứ tự) — muốn có thứ tự phải chỉ định `TreeMap::new` hoặc `LinkedHashMap::new`.

---

**Câu 29 → A không đảm bảo.**
`forEach` trên parallel stream không giữ thứ tự gặp (encounter order) — mỗi lần chạy có thể ra khác nhau. `forEachOrdered` ép giữ thứ tự (đánh đổi bằng hiệu năng). `sum()` luôn đúng vì phép cộng có tính kết hợp.
Nguyên tắc chung cho parallel: hàm phải stateless, không side effect, và với `reduce` phải associative. Đừng dùng biến chung để tích luỹ — hãy dùng collector.

---

**Câu 30 → [Java 24]**
```
windowFixed(2)   -> [[1, 2], [3, 4], [5]]      cửa sổ rời nhau, phần dư giữ nguyên
windowSliding(2) -> [[1, 2], [2, 3], [3, 4]]   cửa sổ trượt, chồng lấn
scan(0, sum)     -> [1, 3, 6]                  tổng tích luỹ, KHÔNG phát giá trị khởi tạo
fold(0, sum)     -> [6]                        gộp về đúng một phần tử
```
Khác biệt then chốt so với `collect`: `gather` là thao tác **trung gian**, nên nối tiếp được — `stream.gather(...).filter(...).gather(...)`. Trước Java 24, muốn có cửa sổ trượt phải tự viết bằng `IntStream.range` + `subList`.
`Gatherers.mapConcurrent(n, fn)` chạy `fn` song song trên tối đa `n` virtual thread nhưng vẫn giữ thứ tự đầu ra — rất tiện khi gọi API hàng loạt.

---

# Tự chấm

| Điểm | Ý nghĩa |
|---|---|
| 27–30 | Vững, sang Giai đoạn 3 |
| 21–26 | Ôn lại module có câu sai, làm lại sau 3 ngày |
| < 21 | Đọc lại Phần A, tự gõ lại từng đoạn code, làm lại sau 1 tuần |

**Bài tập tổng hợp cuối giai đoạn:** viết một chương trình đọc `List<record Employee(String name, String dept, int salary)>` và trả về:
1. Map từ phòng ban → nhân viên lương cao nhất (`groupingBy` + `maxBy`)
2. Tổng quỹ lương mỗi phòng, sắp xếp giảm dần (`groupingBy` + `summingInt` + sort trên entrySet)
3. Chuỗi tên nhân viên lương trên trung bình, nối bằng dấu phẩy (hai lượt stream, hoặc `teeing`)
4. Chia nhân viên thành nhóm 3 người liên tiếp (`Gatherers.windowFixed(3)` — Java 24)

Làm được cả bốn mà không tra tài liệu nghĩa là bạn đã sẵn sàng.
