---
title: "Giai đoạn 4 — Ôn tập & Mock (Tuần 19–24)"
description: "Mọi output đã chạy thử để xác minh trên JDK 21. Các mục [Java 25] chưa chạy được trên môi trường kiểm thử"
icon: "🏆"
difficulty: "Exam Simulation"
order: 2
phase: "Phase 7"
tags: ["Mock Exam", "Handbook", "Labs", "Traps", "Master Question Bank"]
---
# Giai đoạn 4 — Ôn tập & Mock (Tuần 19–24)

> Mọi output đã chạy thử để xác minh trên JDK 21. Các mục **[Java 25]** chưa chạy được trên môi trường kiểm thử.

Ba file trước tách theo chủ đề để bạn **học**. File này cố tình làm ngược lại: mỗi câu trộn 2–4 chủ đề, code dài hơn, đáp án gần giống nhau — vì đó chính là hình dạng thật của đề 1Z0-831.

---

# PHẦN A — CHIẾN THUẬT PHÒNG THI

## Hình dạng thật của đề

50 câu / 120 phút / đậu 68% (≈ 34 câu). Trung bình 2,4 phút mỗi câu — nghe rộng rãi, nhưng thực tế không phải.

Theo mô tả của những người đã thi bản tiền nhiệm 1Z0-830, phần lớn câu hỏi phải **cuộn qua nhiều trang**. Có câu mà mỗi lựa chọn chứa 20–30 dòng code, với 6–10 lựa chọn. Loại trừ 9 phương án sai là công việc tốn thời gian. Người thi đạt thường kết thúc chỉ còn dư vài phút.

Hệ quả cho cách ôn: **kỹ năng đọc code nhanh quan trọng ngang kiến thức**. Đừng để tới tuần 23 mới bấm giờ.

Oracle công bố 10 nhóm objective nhưng **không công bố tỷ trọng** cho từng nhóm. Đừng đoán rằng Stream sẽ nhiều hơn Localization — chiến lược đúng là phủ đều, học Module và Localization nghiêm túc như học Stream.

## Ba vòng làm bài

**Vòng 1 (≈ 70 phút) — quét và gặt.**
Làm mọi câu ngắn, trả lời được trong 90 giây. Câu nào phải cuộn quá một màn hình thì đánh dấu và bỏ qua **ngay lập tức**, không đọc thêm dòng nào. Mục tiêu: xong 30–35 câu.

**Vòng 2 (≈ 40 phút) — câu dài.**
Quay lại các câu đã đánh dấu. Với câu có nhiều lựa chọn code dài, **đừng đọc từ đầu tới cuối từng lựa chọn**. Thay vào đó, so sánh chúng theo cột để tìm điểm khác biệt — thường chỉ khác nhau một modifier, một kiểu trả về, hoặc thứ tự hai dòng.

**Vòng 3 (≈ 10 phút) — rà soát.**
Kiểm tra các câu "chọn tất cả đáp án đúng" xem đã tick đủ số lượng yêu cầu chưa. Đây là chỗ mất điểm oan nhiều nhất.

## Kỹ thuật loại trừ nhanh

Trước khi đọc logic, quét ba thứ này — chúng loại được phương án nhanh nhất:

| Quét gì | Loại được gì |
|---|---|
| Access modifier | override thu hẹp quyền → không biên dịch |
| Kiểu trả về | `Math.round(double)` là `long`, `count()` là `long`, `average()` là `OptionalDouble` |
| `final` / `static` | gán lại `final`, override `static` |
| Thứ tự `case` | nhánh tổng quát đứng trước → dominance error |
| `default` trong switch expression | thiếu với `int`/`String` → lỗi biên dịch |
| Gán lại kết quả `String` | `s.toUpperCase();` không gán → `s` không đổi |

Khi câu hỏi là "đoạn code này in gì", luôn kiểm tra trước xem nó **có biên dịch được không**. Rất nhiều câu có đáp án đúng là "compilation fails" — và người thi vội vàng sẽ bỏ qua khả năng đó.

## Phân biệt ba loại "hỏng"

Đề rất thích đặt ba phương án cạnh nhau: *compilation fails* / *throws an exception at runtime* / *prints X*. Bảng sau là ranh giới hay bị nhầm nhất:

| Tình huống | Kết quả |
|---|---|
| `LocalDate.plus(Duration)` | **Runtime** — `UnsupportedTemporalTypeException` |
| `LocalDate.format(pattern có HH)` | **Runtime** — `UnsupportedTemporalTypeException` |
| switch expression thiếu `default` (int) | **Compile** |
| `case Object o` đứng trước `case String s` | **Compile** — dominance |
| `catch (IOException \| Exception e)` | **Compile** — multi-catch có quan hệ cha con |
| `catch (Exception)` trước `catch (IOException)` | **Compile** — unreachable |
| `Stream.of(new Object()).sorted()` | **Runtime** — `ClassCastException` |
| `Collectors.toMap` trùng key | **Runtime** — `IllegalStateException` |
| dùng lại stream đã đóng | **Runtime** — `IllegalStateException` |
| `while (false) { }` | **Compile** — unreachable |
| `if (true) return 1;` không có else | **Compile** — missing return statement |
| gán lại biến local dùng trong lambda | **Compile** — must be effectively final |

## Lịch 6 tuần

| Tuần | Việc |
|---|---|
| 19 | Mock #1, #2. Chấm theo domain, khoanh 3 domain yếu nhất. Chưa cần bấm giờ nghiêm. |
| 20 | Học lại 3 domain yếu (đọc lại Phần A của file tương ứng, gõ tay code). Mock #3, #4. |
| 21 | Bắt đầu bấm giờ nghiêm: 120 phút liên tục, không dừng, không tra cứu. Mock #5, #6. |
| 22 | Mock #7–#9. Tập riêng chiến thuật ba vòng. Đo xem vòng 1 xong được bao nhiêu câu. |
| 23 | Mock #10–#12. Ôn **toàn bộ sổ lỗi** — không học kiến thức mới. |
| 24 | 1–2 mock nhẹ đầu tuần. Ba ngày cuối chỉ đọc sổ lỗi. Ngủ đủ. Đi thi. |

**Điều kiện đặt lịch thi:** đạt ≥ 80% ổn định trong **3 mock liên tiếp**. Mock chất lượng thường khó hơn đề thật một chút, nên 80% là biên an toàn cho mức đậu 68%. Đạt 75% một lần rồi đặt lịch là canh bạc.

## Sổ lỗi — thứ quyết định điểm số

Từ tuần 19, mọi câu sai đều ghi vào `gotchas.md` theo đúng bốn dòng:

```markdown
## 2026-03-14 — Stream
```java
Stream.of(1,2,3).peek(System.out::print).count()
```
- Mình đoán: in 123, trả 3
- Thực tế: không in gì, trả 3
- Vì sao: từ Java 9, count() bỏ qua pipeline nếu suy ra được size mà không cần duyệt
```

Tuần 23–24 bạn sẽ **chỉ** đọc file này. Một sổ lỗi 80 mục đọc trong 40 phút có giá trị hơn đọc lại 300 trang sách.

## Checklist ba ngày cuối

- [ ] Đọc lại toàn bộ sổ lỗi, hai lượt
- [ ] Rà bảng "ba loại hỏng" ở trên cho tới khi không cần nghĩ
- [ ] Ôn nhanh những thứ dễ quên nhất: thứ tự lookup của `ResourceBundle`, `relativize`/`resolve`, `Period` vs `Duration`, thứ tự khởi tạo, `exports` vs `opens`
- [ ] Kiểm tra giấy tờ tuỳ thân và yêu cầu kỹ thuật của trung tâm/thi online
- [ ] **Không** học kiến thức mới. Không làm mock mới trong 24 giờ cuối.

---

# PHẦN B — 30 CÂU TỔNG HỢP

> Bấm giờ: **75 phút cho 30 câu**. Không tra cứu. Ghi đáp án ra giấy rồi mới xem Phần C.

**Câu 1.** In ra gì?
```java
System.out.println(true ? 1 : 2.0);
Object o = true ? Integer.valueOf(1) : Double.valueOf(2.0);
System.out.println(o + " " + o.getClass().getSimpleName());
```

**Câu 2.** Kết quả?
```java
static String f(String s)        { return "String"; }
static String f(Object o)        { return "Object"; }
static String g(String s)        { return "String"; }
static String g(StringBuilder s) { return "SB"; }

System.out.println(f(null));
System.out.println(g(null));
```

**Câu 3.** Hai trường hợp in ra gì?
```java
class Res implements AutoCloseable {
    String n; Res(String n) { this.n = n; }
    public void close() { throw new IllegalStateException("close-" + n); }
}

// TH1
try (Res a = new Res("A"); Res b = new Res("B")) { throw new RuntimeException("body"); }
// TH2
try (Res a = new Res("A"); Res b = new Res("B")) { }
```
Với mỗi trường hợp: exception **chính** là gì, và `getSuppressed()` chứa gì theo thứ tự nào?

**Câu 4.** In ra gì?
```java
class A { static String s() { return "A.s"; }  String i() { return "A.i"; } }
class B extends A { static String s() { return "B.s"; }  String i() { return "B.i"; } }

A r = new B();
System.out.println(A.s() + " " + B.s() + " " + r.i());
```

**Câu 5.** In ra gì?
```java
enum Day { MON, TUE, WED }

EnumMap<Day,Integer> em = new EnumMap<>(Day.class);
em.put(Day.WED, 3); em.put(Day.MON, 1);

Map<Day,Integer> hm = new HashMap<>();
hm.put(Day.WED, 3); hm.put(Day.MON, 1);

System.out.println(em);
System.out.println(hm);
```

**Câu 6.** In ra gì?
```java
sealed interface Ev permits Click, Key {}
record Click(int x, int y) implements Ev {}
record Key(char c) implements Ev {}

List<Ev> evs = List.of(new Click(1,2), new Key('a'), new Click(30,4));
System.out.println(evs.stream()
    .map(e -> switch (e) {
        case Click(int x, int y) when x > 10 -> "BIG";
        case Click(int x, int y)             -> "C" + x + y;
        case Key(char c)                     -> "K" + c;
    })
    .collect(Collectors.joining("|")));
```
Ngoài ra: `switch` này có cần `default` không? Nếu đảo hai nhánh `Click` cho nhau thì sao?

**Câu 7.** In ra gì?
```java
record Emp(String name, String dept, int salary) {}
List<Emp> es = List.of(new Emp("An","IT",1000), new Emp("Bao","HR",800),
                       new Emp("Cuc","IT",1500), new Emp("Dung","HR",800));

System.out.println(es.stream().collect(
    Collectors.groupingBy(Emp::dept, TreeMap::new,
      Collectors.collectingAndThen(
        Collectors.maxBy(Comparator.comparingInt(Emp::salary)),
        op -> op.map(Emp::name).orElse("-")))));
```

**Câu 8.** Dòng nào ném exception?
```java
List<Integer> a = Stream.of(1,2,3).toList();
List<Integer> b = Stream.of(1,2,3).collect(Collectors.toList());
a.add(4);   // 1
b.add(4);   // 2
```

**Câu 9.** Mỗi dòng in ra số mấy?
```java
Integer[] boxed = {1,2,3};
int[] prim = {1,2,3};
System.out.println(Stream.of(boxed).count());
System.out.println(Arrays.stream(boxed).count());
System.out.println(Stream.of(prim).count());
```

**Câu 10.** Đoạn này biên dịch được không? In ra gì?
```java
interface Svc {
    private String base() { return "base"; }
    default String call() { return base() + "-default"; }
    static String make() { return "static"; }
}
System.out.println(new Svc(){}.call() + " " + Svc.make());
```

**Câu 11.** Hai đoạn khác nhau thế nào?
```java
String s = null;
switch (s) { case "a": break; default: System.out.println("d"); }   // A

Object o = null;
switch (o) { case null -> System.out.println("null"); default -> System.out.println("d"); }   // B
```

**Câu 12.** In ra gì?
```java
static String loop() {
    for (int i = 0; i < 3; i++) {
        try { if (i == 1) break; }
        finally { System.out.print("f" + i + " "); }
    }
    return "done";
}
System.out.println(loop());
```

**Câu 13.** In ra gì?
```java
List<Integer> l = IntStream.rangeClosed(1,5).boxed().collect(Collectors.toList());
l.replaceAll(x -> x * x);
l.removeIf(x -> x % 2 == 0);
System.out.println(l);
```

**Câu 14.** Ngày 8/3/2026 là ngày New York chuyển sang giờ mùa hè (2h sáng nhảy thành 3h). In ra gì?
```java
ZonedDateTime z = ZonedDateTime.of(LocalDateTime.of(2026,3,8,1,30), ZoneId.of("America/New_York"));
System.out.println(z.plusHours(2));
System.out.println(z.plusDays(1));
System.out.println(z.plusHours(24));
```

**Câu 15.** In ra gì?
```java
ZonedDateTime z = ZonedDateTime.of(LocalDateTime.of(2026,3,8,1,30), ZoneId.of("America/New_York"));
System.out.println(z.withZoneSameInstant(ZoneId.of("Asia/Ho_Chi_Minh")));
```

**Câu 16.** `NumberFormat` mặc định dùng chế độ làm tròn nào? Ba dòng dưới in ra số nào (VND không có phần thập phân)?
```java
NumberFormat n = NumberFormat.getCurrencyInstance(Locale.of("vi","VN"));
n.format(1234.5);
n.format(1235.5);
n.format(1234.6);
```

**Câu 17.** Ba dòng in ra gì?
```java
LocalDate d = LocalDate.of(2026, 3, 5);
d.format(DateTimeFormatter.ISO_DATE);
d.format(DateTimeFormatter.ofLocalizedDate(FormatStyle.MEDIUM).withLocale(Locale.GERMANY));
d.format(DateTimeFormatter.ofPattern("HH:mm"));
```

**Câu 18.** Method nào không biên dịch được, vì sao?
```java
static int f() { int i = 0; while (true) { i++; if (i > 2) return i; } }   // 1
static int g() { if (true) return 1; }                                     // 2
```

**Câu 19.** `tb.length()`, `tb.lines().count()`, `tb.strip().length()` bằng bao nhiêu?
```java
String tb = """
    a \
    b
      c   \s
    """;
```

**Câu 20.** Mỗi biểu thức trả về số mấy?
```java
IntStream.rangeClosed(1, 200).filter(i -> { Integer a = i; Integer b = i; return a == b; }).count();
IntStream.rangeClosed(-200, -1).filter(i -> { Integer a = i; Integer b = i; return a == b; }).count();
```

**Câu 21.** In ra gì?
```java
try (ExecutorService es = Executors.newVirtualThreadPerTaskExecutor()) {
    List<Future<Integer>> fs = es.invokeAll(List.of(() -> 1, () -> 2, () -> 3));
    int sum = 0;
    for (Future<Integer> f : fs) sum += f.get();
    System.out.println(sum);
}
```
Thêm: vì sao không cần gọi `shutdown()`?

**Câu 22.** Mỗi dòng cho kết quả gì?
```java
CompletableFuture<Integer> bad = CompletableFuture.supplyAsync(() -> { throw new IllegalStateException("x"); });
bad.exceptionally(e -> -1).join();   // 1
bad.join();                          // 2
bad.get();                           // 3
CompletableFuture.supplyAsync(() -> 10).thenAccept(x -> {}).join();   // 4
```

**Câu 23.** Ghi object rồi đọc lại. (a) lúc ghi in gì, (b) lúc đọc in gì, (c) `toString()` của object đọc về?
```java
class Base { Base() { System.out.print("Base-ctor "); } }
class P extends Base implements Serializable {
    String name; transient int age; static String company = "ACME";
    P(String n, int a) { name = n; age = a; System.out.print("P-ctor "); }
    public String toString() { return name + "/" + age + "/" + company; }
}
// ghi new P("An", 30), rồi P.company = "CHANGED", rồi đọc lại
```

**Câu 24.** Mỗi dòng in ra gì (dòng nào ném exception)?
```java
Path.of("/a/b").resolve("/x/y");                     // 1
Path.of("/a/b/../c/./d").normalize();                // 2
Path.of("/a/b/c/d").relativize(Path.of("/a/b"));     // 3
Path.of("/a").relativize(Path.of("b"));              // 4
Path.of("/a/b/c.txt").getNameCount();                // 5
```

**Câu 25.** Dòng nào lỗi biên dịch?
```java
void f(List<? extends Number> l) {
    Number n = l.get(0);   // 1
    l.add(1);              // 2
    l.add(null);           // 3
}
void g(List<? super Integer> l) {
    l.add(1);              // 4
    Integer x = l.get(0);  // 5
}
static void h(List<String> a) { }   // 6
static void h(List<Integer> a) { }  // 7
```

**Câu 26.** In ra gì? Nếu đổi `record P` thành `class P` chỉ override `equals` thì kết quả đổi thế nào?
```java
record P(int x) {}
Set<P> s = new HashSet<>();
s.add(new P(1));
s.add(new P(1));
System.out.println(s.size() + " " + s.contains(new P(1)));
```

**Câu 27.** `new C()` in ra thứ tự nào? Lần gọi `new C()` thứ hai in gì?
```java
class P { static { p("SP"); }  { p("IP"); }  P() { p("CP"); } }
class C extends P { static { p("SC"); }  { p("IC"); }  C() { p("CC"); } }
```

**Câu 28.** In ra gì?
```java
StringBuilder sb = new StringBuilder();
outer:
for (int i = 0; i < 3; i++) {
    String r = switch (i) {
        case 0 -> "z";
        case 1 -> { yield "o"; }
        default -> "t";
    };
    sb.append(r);
    if (i == 1) break outer;
}
System.out.println(sb);
```

**Câu 29.** Đoạn nào có lỗi, sửa thế nào?
```java
Stream<String> s = Files.lines(Path.of("data.txt"));   // 1
System.out.println(s.count());
System.out.println(s.count());                          // 2
```

**Câu 30.** Chọn đúng/sai cho từng phát biểu:
1. `requires java.base` bắt buộc phải khai báo trong mọi `module-info.java`
2. `exports` cho phép Jackson đọc field private của package đó
3. Named module đọc được unnamed module
4. JAR không có `module-info` đặt trên module path trở thành automatic module
5. `requires transitive java.sql` khiến module nào requires module này cũng thấy `java.sql`

---

# PHẦN C — ĐÁP ÁN & GIẢI THÍCH

**Câu 1 → `1.0` và `1.0 Double`**
Toán tử ba ngôi phải có **một** kiểu kết quả duy nhất. Khi hai nhánh là `int` và `double`, Java nâng cả hai lên `double` — nên `1` in ra thành `1.0` dù nhánh đó được chọn.
Dòng thứ hai khắc nghiệt hơn: `Integer` và `Double` bị **unbox** cả hai, nâng lên `double`, rồi **box lại** thành `Double`. Kết quả là một `Double`, mặc dù nhánh được chọn viết rõ `Integer.valueOf(1)`.
Đây là một trong những bẫy khó chịu nhất của Java. Muốn giữ kiểu, phải tách ra `if/else`.

---

**Câu 2 → `f(null)` in `String`; `g(null)` KHÔNG biên dịch được.**
Với `null`, trình biên dịch chọn phương án **cụ thể nhất**. `String` là con của `Object` nên `f(String)` cụ thể hơn → thắng.
Nhưng `String` và `StringBuilder` **không có quan hệ cha con** — không cái nào cụ thể hơn cái nào → *reference to g is ambiguous*, lỗi biên dịch.
Sửa bằng ép kiểu tường minh: `g((String) null)`.

---

**Câu 3**
- **TH1:** chính = `RuntimeException("body")`, suppressed = `[close-B, close-A]`
- **TH2:** chính = `IllegalStateException("close-B")`, suppressed = `[close-A]`

Hai quy tắc kết hợp:
1. Resource đóng theo thứ tự **ngược** với khai báo → B trước, A sau.
2. Exception của **thân** `try` là chính; exception từ `close()` bị gắn vào `getSuppressed()`.
Khi thân không ném gì (TH2), exception `close()` **đầu tiên** trở thành chính, các cái sau thành suppressed. Vì B đóng trước nên `close-B` là chính.
Đây là câu rất hay ra ở dạng "sắp xếp thứ tự output".

---

**Câu 4 → `A.s B.s B.i`**
`static` method chỉ bị **che** (hiding), không override — gọi qua tên lớp nào thì chạy bản của lớp đó. `A.s()` và `B.s()` là hai method độc lập.
Instance method thì đa hình thật: `r` khai báo kiểu `A` nhưng đối tượng thực là `B` → chạy `B.i()`.
*Biến thể hay gặp trong đề:* `r.s()` — hợp lệ về cú pháp (gọi static qua tham chiếu) nhưng chạy `A.s()` theo **kiểu tham chiếu**, không phải kiểu đối tượng. Nhiều IDE cảnh báo, nhưng đề thi thì không.

---

**Câu 5 → `{MON=1, WED=3}` và `{WED=3, MON=1}`**
`EnumMap` luôn duyệt theo **thứ tự khai báo** của enum (`ordinal`), bất kể thứ tự chèn — nên `MON` đứng trước `WED`.
`HashMap` không đảm bảo thứ tự nào cả. Ở đây tình cờ ra thứ tự chèn, nhưng bạn **không được** dựa vào điều đó — nếu đề hỏi "thứ tự nào được đảm bảo", đáp án là chỉ `EnumMap`.
`EnumMap` cũng nhanh hơn nhiều vì dùng mảng theo `ordinal` thay vì băm.

---

**Câu 6 → `C12|Ka|BIG`. Không cần `default`. Đảo hai nhánh `Click` → lỗi biên dịch.**
Guard `when` được kiểm tra **sau** khi khớp kiểu và theo đúng thứ tự khai báo. `Click(1,2)` không thoả `x > 10` nên rơi xuống nhánh dưới → `"C" + 1 + 2` = `C12` (nối chuỗi, không phải cộng số).
Không cần `default` vì `Ev` là `sealed` và cả hai nhánh con đều được liệt kê → compiler xác nhận exhaustive.
Nếu đảo thứ tự, `case Click(int x, int y)` không guard sẽ khớp mọi `Click`, khiến nhánh có guard phía sau không bao giờ tới được → *dominated by a preceding case label*. **Nhánh có guard luôn phải đứng trước nhánh không guard cùng kiểu.**

---

**Câu 7 → `{HR=Bao, IT=Cuc}`**
Đọc từ trong ra ngoài:
1. `maxBy(...)` cho `Optional<Emp>` lương cao nhất mỗi nhóm.
2. `collectingAndThen(..., op -> op.map(Emp::name).orElse("-"))` biến `Optional<Emp>` thành `String` tên — đây là công dụng chính của `collectingAndThen`: hậu xử lý kết quả của collector.
3. `TreeMap::new` ép Map có thứ tự khoá → `HR` trước `IT`.
Nếu bỏ `TreeMap::new` thì được `HashMap`, thứ tự không đảm bảo. Đề hay hỏi chính điểm này.

---

**Câu 8 → chỉ dòng 1 ném `UnsupportedOperationException`.**
Ba cách thu về List cho ba kết quả khác nhau:

| Cách | Kết quả |
|---|---|
| `stream.toList()` (Java 16) | **bất biến**, cho phép `null` |
| `Collectors.toList()` | `ArrayList` **sửa được** |
| `Collectors.toUnmodifiableList()` | bất biến, **không** cho `null` |

Đây là thay đổi hay khiến người quen Java 8 sai: `stream.toList()` trông giống `collect(toList())` nhưng kết quả không sửa được.

---

**Câu 9 → `3`, `3`, `1`**
`Stream.of(Integer[])` khớp `of(T... values)` với `T = Integer` → mảng được trải ra thành 3 phần tử.
`Stream.of(int[])` không trải được vì generic không nhận kiểu nguyên thuỷ → `int[]` bị coi là **một** object, cho `Stream<int[]>` có 1 phần tử.
Với mảng nguyên thuỷ, cách đúng là `Arrays.stream(prim)` → `IntStream` 3 phần tử.
Cùng gốc rễ với bẫy `Arrays.asList(int[])` ở Giai đoạn 2.

---

**Câu 10 → Biên dịch được. In `base-default static`.**
Từ Java 9, interface có `private` method — dùng để chia sẻ code giữa các `default` method mà không lộ ra ngoài. `private` method **không** phải abstract nên `Svc` vẫn không có abstract method nào.
`new Svc(){}` tạo lớp vô danh — hợp lệ vì không còn abstract method nào cần cài đặt.
`static` method của interface **chỉ** gọi được qua tên interface (`Svc.make()`), không gọi qua instance và không được kế thừa.

---

**Câu 11 → A ném `NullPointerException`; B in `null`.**
`switch` cổ điển trên `String` gọi `hashCode()` trên biểu thức → NPE khi `null`. `default` **không** bắt được `null`.
`switch` pattern (Java 21) cho phép `case null` tường minh. Nếu **không** viết `case null`, nó vẫn ném NPE giống bản cũ.
Ghi nhớ: `case null` là cách duy nhất để `switch` xử lý `null` an toàn. Có thể ghép `case null, default ->` thành một nhánh.

---

**Câu 12 → `f0 f1 done`**
`finally` chạy **trước** khi `break` thực sự thoát vòng lặp. Vòng `i=0`: không break, in `f0`. Vòng `i=1`: gặp `break`, nhưng `finally` vẫn chạy → in `f1`, rồi mới thoát.
Cùng nguyên lý với bẫy `return` trong `finally` ở Giai đoạn 1: `finally` luôn chạy trước khi luồng điều khiển rời khối, dù bằng `return`, `break`, `continue` hay exception.

---

**Câu 13 → `[1, 9, 25]`**
`replaceAll` biến đổi tại chỗ → `[1, 4, 9, 16, 25]`. `removeIf` loại phần tử chẵn → còn `[1, 9, 25]`.
Điểm cần chú ý: cả hai method này **sửa list gốc**, nên list phải sửa được. Nếu dùng `Stream.of(...).toList()` hoặc `List.of(...)` thì cả hai đều ném `UnsupportedOperationException` — nối với Câu 8.

---

**Câu 14 → `2026-03-08T04:30-04:00[America/New_York]`, `2026-03-09T01:30-04:00`, `2026-03-09T02:30-04:00`**
Đây là ví dụ rõ nhất về khác biệt giữa "thời gian theo lịch" và "thời gian theo đồng hồ vật lý":
- `plusHours(2)`: cộng 2 giờ **thật**. Từ 01:30 EST đi 2 tiếng, nhưng 02:00 bị nhảy sang 03:00, nên đồng hồ chỉ **04:30** EDT.
- `plusDays(1)`: cộng theo **lịch** — giữ nguyên 01:30, chỉ đổi ngày. Kết quả 09/03 lúc 01:30.
- `plusHours(24)`: cộng 24 giờ **thật**, mà ngày 08/03 chỉ dài 23 giờ → vượt qua thành **02:30**.
Quy tắc: `Period`/`plusDays` làm việc trên lịch, `Duration`/`plusHours` làm việc trên trục thời gian thật. Qua mốc DST thì hai cái **không** bằng nhau.

---

**Câu 15 → `2026-03-08T13:30+07:00[Asia/Ho_Chi_Minh]`**
`withZoneSameInstant` giữ nguyên **mốc thời gian tuyệt đối**, chỉ đổi cách hiển thị theo múi giờ khác. NY lúc đó là UTC−5, HCM là UTC+7 → chênh 12 giờ → 01:30 thành 13:30.
Đừng nhầm với `withZoneSameLocal`, cái này **giữ nguyên số trên đồng hồ** (vẫn 01:30) và đổi sang mốc thời gian khác hẳn. Đề rất hay đặt hai method này cạnh nhau.

---

**Câu 16 → `HALF_EVEN`. Kết quả: `1.234 ₫`, `1.236 ₫`, `1.235 ₫`**
`NumberFormat` mặc định dùng **làm tròn ngân hàng** (half-even): khi đúng ở giữa thì làm tròn về số **chẵn** gần nhất.
- 1234.5 → 1234 (chẵn), không phải 1235
- 1235.5 → 1236 (chẵn)
- 1234.6 → 1235 (không ở giữa nên làm tròn bình thường)

Rất khác `Math.round`, vốn luôn làm tròn lên phía +vô cực. Muốn đổi: `n.setRoundingMode(RoundingMode.HALF_UP)`.
Ngoài ra VND không có phần thập phân nên phần lẻ biến mất hoàn toàn — số chữ số thập phân do **locale** quyết định, không do bạn.

---

**Câu 17 → `2026-03-05`, `05.03.2026`, và dòng 3 ném `UnsupportedTemporalTypeException`.**
`ISO_DATE` cho định dạng chuẩn quốc tế, không phụ thuộc locale.
Đức dùng `dd.MM.yyyy` với dấu chấm — khác Mỹ (`Mar 5, 2026`) và khác cả Anh.
Dòng 3 lỗi vì `LocalDate` không có trường giờ. Đây là cùng họ với bẫy `LocalDate.plus(Duration)` — sai kiểu thời gian thì luôn là lỗi **runtime**, không phải compile.

---

**Câu 18 → `f()` OK; `g()` lỗi *missing return statement*.**
Đây là bẫy tinh vi về phân tích luồng của compiler. Với `while (true)` không có `break`, compiler **biết** vòng lặp không bao giờ kết thúc bình thường nên chấp nhận không cần `return` sau nó.
Nhưng với `if (true) return 1;`, compiler **không** áp dụng rút gọn hằng cho `if` — nó vẫn coi nhánh `else` là có thể xảy ra, nên đòi một `return` nữa.
Quy tắc bất đối xứng này được quy định trong Java Language Specification: `while (true)` được đặc cách, `if (true)` thì không.

---

**Câu 19 → `12`, `2`, `7`**
Ba escape của text block cùng xuất hiện:
- Dấu `\` cuối dòng = **nối dòng**, không sinh `\n` → `a ` và `b` gộp thành `a b`.
- `\s` = giữ **một** khoảng trắng và **chặn** việc cắt khoảng trắng cuối dòng → dòng thứ hai giữ được các dấu cách đuôi.
- Thụt lề chung 4 khoảng trắng bị cắt (tính cả dòng `"""` đóng).

Kết quả thật là `"a b\n  c    \n"` — 4 + 8 = **12** ký tự. `lines()` đếm **2** dòng. `strip()` cắt hai đầu còn `"a b\n  c"` = **7**.

---

**Câu 20 → `127` và `128`**
Bộ nhớ đệm `Integer` phủ **−128 đến 127**. Trong đoạn code, `i` là `int` nên `a` và `b` được box **riêng biệt** — chỉ trùng object khi nằm trong cache.
- Từ 1 đến 200: đúng với 1..127 → **127** lần.
- Từ −200 đến −1: đúng với −128..−1 → **128** lần.

Con số lệch nhau vì phạm vi cache không đối xứng (−128 có, +128 không).
*Bẫy phụ:* nếu viết `.boxed()` trước rồi mới so sánh, `a` và `b` cùng trỏ vào một object có sẵn → luôn `true` với mọi giá trị. Đề có thể cài biến thể này.

---

**Câu 21 → in `6`. Không cần `shutdown()` vì `ExecutorService` là `AutoCloseable` từ Java 19.**
`invokeAll` **chặn cho tới khi tất cả task xong** rồi mới trả danh sách `Future`, nên `f.get()` không phải chờ thêm. Thứ tự `Future` trong list khớp thứ tự `Callable` đầu vào — nên tổng luôn là 6, hoàn toàn xác định.
Khi dùng try-with-resources, `close()` gọi `shutdown()` rồi **chờ** mọi task hoàn tất. Đây là cách viết được khuyến nghị hiện nay và rất có khả năng xuất hiện trong đề Java 25.

---

**Câu 22 → 1: `-1`; 2: `CompletionException`; 3: `ExecutionException`; 4: `null`**
`join()` không khai báo checked exception (dùng được trong lambda) nên bọc lỗi bằng `CompletionException` **unchecked**. `get()` kế thừa từ `Future` nên giữ `ExecutionException` **checked** — bắt buộc `try/catch`.
`exceptionally` là nhánh phục hồi, chỉ chạy khi có lỗi, trả về giá trị thay thế.
`thenAccept` nhận `Consumer` → trả `CompletableFuture<Void>` → `join()` cho `null`.
Nhớ bộ ba: `thenApply` (Function, đổi giá trị) / `thenAccept` (Consumer, `Void`) / `thenRun` (Runnable, không nhận không trả).

---

**Câu 23 → (a) `Base-ctor P-ctor`  (b) chỉ `Base-ctor`  (c) `An/0/CHANGED`**
Ba cơ chế cùng lúc:
1. Khi deserialize, constructor của lớp **Serializable** không chạy — JVM đổ dữ liệu thẳng vào field. Nhưng nó phải khởi tạo phần thuộc lớp cha **không**-Serializable, nên constructor không tham số của `Base` **có** chạy.
2. `transient int age` không được ghi → khôi phục về mặc định **0**, không phải 30.
3. `static company` thuộc về lớp chứ không thuộc instance → không nằm trong luồng byte → object đọc về thấy giá trị **hiện tại** `"CHANGED"`.

Nếu `Base` không có constructor không tham số → `InvalidClassException`.

---

**Câu 24 → 1: `/x/y`; 2: `/a/c/d`; 3: `../..`; 4: `IllegalArgumentException`; 5: `3`**
- (1) `resolve` với đối số **tuyệt đối** bỏ qua hoàn toàn path gốc và trả về chính đối số.
- (2) `normalize` xử lý `..` và `.` thuần trên chuỗi, không kiểm tra file có thật.
- (3) Đi từ `/a/b/c/d` về `/a/b` phải lùi hai cấp.
- (4) Trộn tuyệt đối với tương đối → `IllegalArgumentException` (không phải `IOException`).
- (5) `getNameCount` **không tính root** → `a`, `b`, `c.txt` = 3.

---

**Câu 25 → dòng 2, 5 và cặp 6–7 lỗi.**
- (2) Với `? extends Number`, kiểu thật có thể là `List<Double>` → cấm mọi `add`.
- (3) `add(null)` được phép vì `null` hợp mọi kiểu.
- (4) Với `? super Integer`, thêm `Integer` luôn an toàn.
- (5) Đọc ra chỉ biết chắc là `Object` → gán vào `Integer` là lỗi.
- (6)(7) Sau xoá kiểu (erasure), cả hai đều là `h(List)` → *name clash: have the same erasure*.

PECS: **P**roducer → `extends` (chỉ đọc), **C**onsumer → `super` (chỉ ghi).

---

**Câu 26 → in `1 true`. Đổi sang `class` chỉ override `equals` → in `2 false`.**
`record` tự sinh `equals` **và** `hashCode` nhất quán, nên hai `P(1)` được coi là trùng → `HashSet` chỉ giữ một, và `contains` tìm thấy.
Nếu chỉ override `equals` mà quên `hashCode`, hai object rơi vào hai bucket khác nhau (hash mặc định theo địa chỉ) → `equals` không bao giờ được gọi → set có 2 phần tử và `contains` trả `false`.
Đây là lý do nên dùng `record` làm key cho Map/Set — cả trong đề thi lẫn khi làm DSA.

---

**Câu 27 → lần đầu `SP SC IP CP IC CC`; lần thứ hai chỉ `IP CP IC CC`.**
Thứ tự chuẩn:
1. Toàn bộ khối `static` từ cha xuống con — chạy **một lần duy nhất** khi lớp được nạp.
2. Instance initializer rồi thân constructor của **cha**.
3. Instance initializer rồi thân constructor của **con**.

Hai điểm dễ sai: instance initializer chạy **trước** thân constructor (không phải sau), và `static` không lặp lại ở lần khởi tạo thứ hai. Câu hỏi "gọi hai lần thì in gì" là biến thể rất hay gặp.

---

**Câu 28 → `zo`**
`i=0`: switch expression trả `"z"`, append. `i=1`: nhánh dùng khối `{}` nên bắt buộc `yield` để trả giá trị → `"o"`, append, rồi `break outer` thoát vòng lặp. `i=2` không bao giờ chạy.
Điểm cần thuộc: trong switch expression, nhánh `->` với biểu thức đơn thì trả thẳng; nhánh có khối `{}` **bắt buộc** `yield`. Dùng `return` trong đó là lỗi biên dịch.

---

**Câu 29 → Hai lỗi.**
1. `Files.lines` trả `Stream` giữ **file handle mở** — phải dùng try-with-resources, nếu không rò tài nguyên (trên Windows còn khoá luôn file).
2. Stream chỉ tiêu thụ được **một lần** — `count()` lần hai ném `IllegalStateException: stream has already been operated upon or closed`.

Sửa:
```java
try (Stream<String> s = Files.lines(Path.of("data.txt"))) {
    System.out.println(s.count());
}
```
Cần đếm hai lần thì dùng `Supplier<Stream<String>>` và gọi `get()` mỗi lượt, hoặc đơn giản là `Files.readAllLines`.
Nhóm method trả `Stream` phải đóng: `Files.lines`, `Files.walk`, `Files.find`, `Files.list`.

---

**Câu 30 → 1: Sai. 2: Sai. 3: Sai. 4: Đúng. 5: Đúng.**
1. `java.base` được `requires` **ngầm định** — viết ra không sai nhưng thừa.
2. `exports` chỉ cho truy cập bình thường tới thành viên `public`. Reflection sâu vào field private cần `opens` (thường viết `opens com.example.model to com.fasterxml.jackson.databind;`).
3. Named module **không** đọc được unnamed module. Đây chính là lý do automatic module tồn tại — làm bước đệm để đưa thư viện cũ lên module path.
4. Đúng. Tên suy ra từ tên file JAR (bỏ số phiên bản, `-` thành `.`) hoặc từ `Automatic-Module-Name` trong manifest. Nó ngầm `requires` mọi module và `exports` mọi package.
5. Đúng. Đó chính là ý nghĩa của `transitive`: phụ thuộc được "truyền tiếp" cho ai dùng module này, tránh phải khai báo lại.

---

# Tự chấm

| Điểm | Hành động |
|---|---|
| 27–30 | Sẵn sàng. Đặt lịch thi khi mock ≥ 80% ba lần liên tiếp. |
| 24–26 | Gần tới. Ôn kỹ các domain có câu sai, thêm 2–3 mock nữa. |
| 20–23 | Chưa nên đặt lịch. Quay lại file Giai đoạn tương ứng với câu sai. |
| < 20 | Lùi lịch thi 3–4 tuần, học lại theo trình tự. |

Ghi nhớ: mock khó hơn đề thật một chút, nhưng khoảng cách đó không đủ để bù cho 60%. Đừng đặt lịch vì sốt ruột.

---

# Ma trận rà soát cuối cùng

Trước ngày thi, tự trả lời được hết bảng này mà không tra tài liệu:

| Domain | Câu hỏi tự kiểm |
|---|---|
| Kiểu & toán tử | `b += 300` với `byte` cho gì? Ternary `1 : 2.0` cho kiểu gì? |
| String | Khi nào `==` đúng với String? Text block cắt thụt lề theo dòng nào? |
| Date-Time | `Period` vs `Duration` dùng với lớp nào? Qua DST thì `plusDays` khác `plusHours` ra sao? |
| Luồng điều khiển | Khi nào switch expression cần `default`? Nhánh có guard đứng trước hay sau? |
| OOP | Thứ tự khởi tạo 6 bước? Field có đa hình không? |
| Exception | Thứ tự đóng resource? Cái nào thành suppressed? |
| Collections | `stream.toList()` sửa được không? `remove(1)` xoá gì? |
| Stream | `count()` có chạy `peek` không? `allMatch` trên rỗng trả gì? |
| Concurrency | `join()` và `get()` ném exception gì? Virtual thread có phải daemon không? |
| I/O & NIO | `resolve` với path tuyệt đối cho gì? Method nào trả Stream phải đóng? |
| Module | `exports` vs `opens`? Named module đọc được unnamed không? |
| Localization | Thứ tự lookup của `ResourceBundle`? Rounding mặc định của `NumberFormat`? |

Trả lời trôi chảy cả 12 dòng nghĩa là bạn đã sẵn sàng bước vào phòng thi.
