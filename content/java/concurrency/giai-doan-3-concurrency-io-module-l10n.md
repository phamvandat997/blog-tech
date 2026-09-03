---
title: "Giai đoạn 3 — Concurrency, I/O, Module, Localization (Tuần 13–18)"
order: 3
phase: "Phase 5"
tags: ["Virtual Threads", "Concurrency", "JMM", "NIO.2", "JPMS Modules"]
---
# Giai đoạn 3 — Concurrency, I/O, Module, Localization (Tuần 13–18)

> Output đã chạy thử để xác minh trên JDK 21, trừ hai nhóm ghi rõ:
> **[Java 25]** — Scoped Values, `java.lang.IO`, `ForkJoinPool` mở rộng (chưa có trên JDK 21)
> **[chưa chạy thử]** — phần Module, vì môi trường kiểm thử không có `javac`/`jar`/`jlink`

Đây là giai đoạn nhiều người rớt nhất. Lý do đơn giản: đi làm bạn dùng Spring, hiếm khi đụng trực tiếp `ExecutorService`, gần như không bao giờ viết `module-info.java`, và chưa từng làm i18n. Nhưng đề thi **không hề nương tay** ở bốn mảng này.

---

# PHẦN A — LÝ THUYẾT & CODE MINH HOẠ

## Module 3.1 — Thread & Virtual Thread

### Platform thread vs Virtual thread

```java
Thread v = Thread.ofVirtual().unstarted(() -> {});
v.isDaemon();     // true   -> LUÔN là daemon, không đổi được
v.getPriority();  // 5      -> luôn NORM_PRIORITY
v.isVirtual();    // true
v.setPriority(9); // không lỗi, nhưng BỊ BỎ QUA — vẫn là 5

Thread p = Thread.ofPlatform().unstarted(() -> {});
p.isDaemon();     // false
```

Bốn cách tạo virtual thread:

```java
Thread.startVirtualThread(runnable);              // tạo và chạy luôn
Thread.ofVirtual().start(runnable);
Thread.ofVirtual().name("worker-", 0).start(r);   // đánh số tự động
Executors.newVirtualThreadPerTaskExecutor();      // dùng nhiều nhất
```

Điểm quan trọng cho đề thi:
- Virtual thread **luôn daemon** → JVM không chờ chúng, chương trình có thể thoát khi chúng đang chạy.
- Không có thread pool cho virtual thread — mỗi task một thread, tạo hàng triệu cũng được.
- Đừng bao giờ `pool` chúng lại; cũng đừng dùng `ThreadLocal` nặng với chúng.
- **[Java 24]** Virtual thread bị chặn trong khối `synchronized` **không còn ghim (pin)** carrier thread nữa. Trước đó, khuyến nghị là thay `synchronized` bằng `ReentrantLock`; từ Java 24 hạn chế này biến mất.

### Vòng đời thread

`NEW → RUNNABLE → (BLOCKED | WAITING | TIMED_WAITING) → TERMINATED`

`start()` gọi hai lần → `IllegalThreadStateException`. Gọi `run()` trực tiếp thì **không** tạo thread mới, chỉ chạy tuần tự trên thread hiện tại — bẫy kinh điển.

---

## Module 3.2 — ExecutorService & Callable

### Runnable vs Callable

| | `Runnable` | `Callable<V>` |
|---|---|---|
| Method | `void run()` | `V call()` |
| Trả giá trị | không | có |
| Ném checked exception | không | có |

```java
try (ExecutorService es = Executors.newVirtualThreadPerTaskExecutor()) {
    Future<Integer> f = es.submit(() -> 42);   // Callable
    f.get();                                    // 42

    Future<?> r = es.submit(() -> { throw new RuntimeException("boom"); });
    r.get();   // ExecutionException, getCause() là RuntimeException("boom")
}
```

Từ Java 19, `ExecutorService` implement `AutoCloseable`: dùng try-with-resources thì `close()` sẽ **chờ mọi task hoàn tất** rồi mới đóng. Đây là cách viết được khuyến nghị hiện nay.

Khác biệt cần nhớ: `execute(Runnable)` trả `void` và exception nổi lên handler mặc định. `submit(...)` trả `Future` và **nuốt** exception cho tới khi bạn gọi `get()`.

### invokeAll vs invokeAny

```java
List<Callable<String>> tasks = List.of(() -> "a", () -> "b");
es.invokeAll(tasks);   // List<Future<String>>, CHỜ tất cả xong
es.invokeAny(tasks);   // "a" — trả về kết quả của task đầu tiên hoàn tất, huỷ phần còn lại
```

### Vòng đời

```java
es.shutdown();       // không nhận task mới, task đang chờ vẫn chạy hết
es.shutdownNow();    // cố huỷ task đang chạy, trả về List<Runnable> chưa chạy
es.submit(...);      // sau shutdown -> RejectedExecutionException
es.isShutdown();     // true ngay sau shutdown()
es.isTerminated();   // chỉ true khi mọi task đã xong
es.awaitTermination(5, TimeUnit.SECONDS);
```

Bẫy: `isShutdown()` và `isTerminated()` **khác nhau**. Ngay sau `shutdown()` thì cái đầu là `true`, cái sau là `false`.

---

## Module 3.3 — Đồng bộ hoá & concurrent API

### Atomic

```java
AtomicInteger ai = new AtomicInteger(5);
ai.getAndIncrement();   // trả 5, sau đó thành 6
ai.incrementAndGet();   // thành 7, trả 7
ai.compareAndSet(7, 10);
ai.updateAndGet(x -> x * 2);
```

Quy tắc đọc tên: `getAndXxx` trả giá trị **cũ**, `xxxAndGet` trả giá trị **mới**.

### synchronized và Lock

```java
synchronized (lock) { ... }              // tự nhả khi thoát khối, kể cả khi ném exception

Lock l = new ReentrantLock();
l.lock();
try { ... } finally { l.unlock(); }      // BẮT BUỘC unlock trong finally

if (l.tryLock(1, TimeUnit.SECONDS)) {    // không chờ vô hạn -> tránh deadlock
    try { ... } finally { l.unlock(); }
}
```

`ReentrantLock` cho thêm: `tryLock` có timeout, khoá công bằng (`new ReentrantLock(true)`), nhiều `Condition`. Đổi lại bạn phải tự nhớ `unlock`.

### Collection an toàn luồng

```java
Map<String,Integer> chm = new ConcurrentHashMap<>();
chm.put(null, 1);          // NullPointerException — KHÔNG cho null key/value

List<Integer> cow = new CopyOnWriteArrayList<>(List.of(1,2,3));
for (Integer i : cow) if (i == 1) cow.add(99);   // KHÔNG ném CME
// sau vòng lặp: [1, 2, 3, 99]
```

`CopyOnWriteArrayList` cho iterator một **ảnh chụp** tại thời điểm bắt đầu duyệt, nên phần tử vừa thêm không xuất hiện trong lượt duyệt đó. Ghi rất tốn kém (sao chép cả mảng) nên chỉ hợp khi đọc nhiều ghi ít.

Các lớp khác hay ra đề: `ConcurrentLinkedQueue`, `BlockingQueue` (`put`/`take` có chặn), `CountDownLatch` (đếm **một chiều**, về 0 rồi không reset được), `CyclicBarrier` (dùng lại được), `Semaphore`.

### Parallel stream & reduce

Nhắc lại từ Giai đoạn 2: hàm phải stateless, không side effect, và `reduce` phải kết hợp được. Đừng cộng dồn vào biến chung — dùng collector hoặc `LongAdder`.

---

## Module 3.4 — CompletableFuture & ForkJoinPool

```java
CompletableFuture<Integer> cf = CompletableFuture.supplyAsync(() -> 10);

cf.thenApply(x -> x * 2).join();                                  // 20   — biến đổi giá trị
CompletableFuture.supplyAsync(() -> 1)
    .thenCompose(x -> CompletableFuture.supplyAsync(() -> x + 1)) // 2    — nối CF khác (flatMap)
    .join();
CompletableFuture.supplyAsync(() -> 1)
    .thenCombine(CompletableFuture.supplyAsync(() -> 2), Integer::sum)   // 3 — gộp hai CF
    .join();
cf.thenAccept(x -> {}).join();                                    // null — Consumer, không trả gì
```

**Ngoại lệ — điểm rất hay ra đề:**

```java
CompletableFuture<Integer> bad = CompletableFuture.supplyAsync(() -> { throw new IllegalStateException("x"); });
bad.exceptionally(e -> -1).join();   // -1
bad.join();                          // CompletionException  (unchecked)
bad.get();                           // ExecutionException    (checked)
```

`join()` và `get()` cùng chờ kết quả nhưng bọc lỗi bằng **hai kiểu khác nhau**, và `join()` không buộc bạn `try/catch`.

### ForkJoinPool

```java
class SumTask extends RecursiveTask<Integer> {
    protected Integer compute() {
        if (hi - lo <= 2) { /* làm trực tiếp */ }
        SumTask left = new SumTask(a, lo, mid);
        left.fork();                       // giao cho pool
        SumTask right = new SumTask(a, mid, hi);
        return right.compute() + left.join();   // tự làm nửa còn lại rồi mới join
    }
}
ForkJoinPool.commonPool().invoke(new SumTask(arr, 0, 10));
```

Mẫu chuẩn là **fork một nhánh, tự tính nhánh kia, rồi join**. Viết `left.fork(); right.fork(); left.join(); right.join();` vẫn chạy nhưng kém hiệu quả; viết `left.fork(); left.join(); right.fork(); right.join();` thì mất hẳn tính song song — cả ba biến thể này đều từng xuất hiện trong đề.

`RecursiveTask<V>` có trả giá trị, `RecursiveAction` thì không.

**[Java 25]** `ForkJoinPool` nay implement `ScheduledExecutorService` và có thêm `submitWithTimeout(...)` — task tự huỷ khi quá hạn.

---

## Module 3.5 — [Java 25] Scoped Values

`ThreadLocal` có ba vấn đề: không rõ vòng đời, dễ rò rỉ, và tốn bộ nhớ khi có hàng triệu virtual thread. Scoped Values (JEP 506, chính thức từ Java 25) thay thế cho trường hợp **chia sẻ dữ liệu bất biến xuống dưới ngăn xếp lời gọi**.

```java
private static final ScopedValue<String> USER = ScopedValue.newInstance();

ScopedValue.where(USER, "an").run(() -> {
    service();          // mọi lời gọi bên trong đều đọc được
});
// ra khỏi khối -> giá trị tự biến mất

void service() {
    USER.get();             // "an"
    USER.isBound();         // true
}
USER.get();                 // NoSuchElementException — ngoài phạm vi
```

| | `ThreadLocal` | `ScopedValue` |
|---|---|---|
| Gán lại | `set()` bất cứ lúc nào | bất biến trong phạm vi |
| Dọn dẹp | thủ công (`remove()`) | tự động khi thoát khối |
| Thread con | chỉ với `InheritableThreadLocal` | tự kế thừa trong structured concurrency |
| Chi phí | cao khi nhiều thread | thấp |

---

## Module 3.6 — I/O truyền thống & Serialization

### Byte stream vs Character stream

| | Byte (8-bit) | Character (16-bit) |
|---|---|---|
| Gốc | `InputStream` / `OutputStream` | `Reader` / `Writer` |
| File | `FileInputStream` | `FileReader` |
| Đệm | `BufferedInputStream` | `BufferedReader` |
| Dùng cho | ảnh, file nhị phân | văn bản |

Mẹo nhận diện: tên lớp có `Stream` → byte; có `Reader`/`Writer` → ký tự.
`InputStreamReader` là cầu nối giữa hai thế giới.

Từ Java 18, charset mặc định là **UTF-8** trên mọi nền tảng (trước đó phụ thuộc hệ điều hành).

### Serialization

```java
class Base { Base() { System.out.print("Base-ctor "); } }     // KHÔNG Serializable

class P extends Base implements Serializable {
    private static final long serialVersionUID = 1L;
    String name;
    transient int age;              // không được ghi
    static String company = "ACME"; // static không thuộc về instance -> không được ghi
}
```

Chạy thử: ghi `P("An", 30)` rồi đổi `P.company = "CHANGED"`, đọc lại được `An/0/CHANGED`.

Ba điều rút ra:
1. `transient` → khôi phục về **giá trị mặc định** (0, `null`, `false`), không phải giá trị cũ.
2. `static` không được ghi → sau khi đọc lại nó mang giá trị **hiện tại** của lớp.
3. Khi deserialize, constructor của lớp Serializable **không chạy** — chỉ chạy constructor không tham số của **lớp cha không-Serializable đầu tiên**. Output thực tế: ghi in `Base-ctor P-ctor`, đọc chỉ in `Base-ctor`.

Nếu lớp cha đó không có constructor không tham số → `InvalidClassException`.
`serialVersionUID` không khớp giữa lúc ghi và lúc đọc → `InvalidClassException`.
Field không Serializable mà không đánh `transient` → `NotSerializableException`.

### **[Java 25]** `java.lang.IO`

```java
// Trước:
BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
String name = br.readLine();
System.out.println("Chào " + name);

// Java 25:
String name = IO.readln("Tên bạn: ");
IO.println("Chào " + name);
```

`IO` nằm trong `java.lang` nên **không cần import**, và kết hợp với compact source file cho ra chương trình chỉ vài dòng. Đây là tính năng mới của đề Java 25.
Lưu ý `System.console()` trả `null` khi chạy trong IDE hoặc pipeline — code dựa vào `Console` sẽ NPE.

---

## Module 3.7 — NIO.2: Path & Files

### Path là thao tác trên chuỗi, không đụng đĩa

```java
Path p = Path.of("/a/b/c.txt");
p.getNameCount();   // 3        -> KHÔNG tính root
p.getName(0);       // a
p.getFileName();    // c.txt
p.getParent();      // /a/b
p.getRoot();        // /
p.subpath(0, 2);    // a/b      -> kết quả là path TƯƠNG ĐỐI
Files.exists(Path.of("/khong/co/that"));   // false — Path.of không kiểm tra gì
```

### resolve, normalize, relativize

```java
Path.of("/a/b").resolve("c/d");        // /a/b/c/d
Path.of("/a/b").resolve("/x/y");       // /x/y      <- đối số TUYỆT ĐỐI thì trả luôn đối số!
Path.of("/a/b/../c/./d").normalize();  // /a/c/d
Path.of("/a/b").relativize(Path.of("/a/b/c/d"));   // c/d
Path.of("/a/b/c/d").relativize(Path.of("/a/b"));   // ../..
Path.of("/a").relativize(Path.of("b"));            // IllegalArgumentException
```

`relativize` yêu cầu **cả hai cùng loại** — cùng tuyệt đối hoặc cùng tương đối, trộn lẫn là `IllegalArgumentException`.

### Files

```java
Files.readAllLines(f);      // List<String>, đọc hết vào RAM
try (Stream<String> s = Files.lines(f)) { ... }   // lazy — PHẢI đóng, nếu không rò file handle
Files.readString(f);
Files.writeString(f, "nội dung");
Files.newBufferedReader(f);
Files.walk(dir, 1);         // Stream<Path>, cũng cần đóng
Files.delete(missing);      // NoSuchFileException
Files.deleteIfExists(missing);  // false, không ném
Files.size(f);  Files.isDirectory(f);  Files.copy(a, b);  Files.move(a, b);
```

Mọi method của `Files` đều ném `IOException` (checked). Các method trả `Stream` (`lines`, `walk`, `find`, `list`) **phải** dùng try-with-resources.

---

## Module 3.8 — Module system **[chưa chạy thử]**

### module-info.java

```java
module com.example.app {
    requires com.example.core;            // phụ thuộc
    requires transitive java.sql;         // ai dùng module này cũng thấy java.sql
    requires static lombok;               // chỉ cần lúc biên dịch

    exports com.example.app.api;          // cho mọi module
    exports com.example.app.spi to com.example.plugin;   // chỉ cho module chỉ định
    opens com.example.app.model;          // cho reflection lúc chạy (Jackson, Hibernate)

    uses com.example.app.Codec;                            // consumer dịch vụ
    provides com.example.app.Codec with com.example.app.JsonCodec;   // provider
}
```

- `java.base` được `requires` **ngầm định**, không cần khai báo.
- `exports` cho phép truy cập **lúc biên dịch và lúc chạy** nhưng **không** cho reflection sâu; muốn reflection phải `opens`.
- File `module-info.java` đặt ở gốc source, không có package.

### Loại module

| Loại | Mô tả |
|---|---|
| Named | có `module-info.java` |
| Automatic | JAR không có `module-info` nhưng đặt trên module path; tên suy ra từ tên file hoặc `Automatic-Module-Name` trong manifest; ngầm `requires` mọi module và `exports` mọi package |
| Unnamed | mọi thứ trên classpath; đọc được tất cả, nhưng named module **không** đọc được nó |

Chiều di trú: đưa thư viện lên module path dần từ dưới lên (bottom-up), hoặc dùng automatic module làm bước đệm (top-down).

### Lệnh cần thuộc

```bash
javac -d out --module-source-path src $(find src -name "*.java")
java --module-path out --module com.example.app/com.example.app.Main
java -p out -m com.example.app/com.example.app.Main      # dạng viết tắt

jar --create --file app.jar --main-class com.example.app.Main -C out .
jar --describe-module --file app.jar

jdeps --module-path out app.jar        # phân tích phụ thuộc
jlink --module-path out --add-modules com.example.app --output myimage
```

`-p` = `--module-path`, `-m` = `--module`, `-cp` = classpath. Cú pháp `--module` luôn là `tên-module/tên-lớp-đầy-đủ`.

**[Java 25]** Module Import Declarations — nhập toàn bộ package mà một module xuất ra bằng một dòng:

```java
import module java.base;    // thay cho hàng loạt import java.util.*, java.io.*, ...
```

### Kiểm tra lúc chạy

```java
String.class.getModule().getName();   // "java.base"
M1.class.getModule().getName();       // null nếu chạy trên classpath (unnamed module)
ModuleLayer.boot().findModule("java.base").isPresent();   // true
```

---

## Module 3.9 — Localization

### Locale

```java
Locale.US;  Locale.GERMANY;  Locale.of("vi", "VN");   // Locale.of có từ Java 19
new Locale("vi", "VN");                                // ĐÃ DEPRECATED — đề mới không dùng nữa
Locale.setDefault(Locale.GERMANY);
Locale.getDefault(Locale.Category.FORMAT);             // tách riêng ngôn ngữ hiển thị và định dạng
```

Định dạng chuẩn: `ngôn ngữ_QUỐC GIA` — `vi_VN`, `en_GB`. Ngôn ngữ **luôn viết thường**, quốc gia **luôn viết hoa**.

### ResourceBundle — thứ tự tìm kiếm

Với các file `Msg.properties`, `Msg_en_GB.properties`, `Msg_vi.properties`:

```java
ResourceBundle.getBundle("Msg", Locale.of("en","GB")).getString("hello");  // "Hello UK"
ResourceBundle.getBundle("Msg", Locale.of("en","GB")).getString("bye");    // "Bye"  <- kế thừa!
ResourceBundle.getBundle("Msg", Locale.of("vi")).getString("hello");       // "Xin chao"
ResourceBundle.getBundle("Msg", Locale.FRANCE).getString("hello");         // "Hello" <- rơi về mặc định
bundle.getString("khongco");                                                // MissingResourceException
```

Thứ tự dò từ cụ thể tới tổng quát:
`Msg_en_GB` → `Msg_en` → (bundle theo locale mặc định của máy) → `Msg` → `MissingResourceException`.

Điểm quan trọng nhất: **khoá được kế thừa từ bundle cha**. `Msg_en_GB.properties` chỉ cần chứa khoá khác biệt; khoá thiếu sẽ lấy từ `Msg.properties`. Nhưng khi đã chọn được một bundle, Java **không** nhảy sang nhánh locale khác để tìm khoá.

### Định dạng số, tiền tệ, ngày

```java
NumberFormat.getCurrencyInstance(Locale.US).format(1234.5);      // $1,234.50
NumberFormat.getCurrencyInstance(Locale.GERMANY).format(1234.5); // 1.234,50 €
NumberFormat.getPercentInstance(Locale.US).format(0.256);        // 26%    <- làm tròn!
NumberFormat.getInstance(Locale.GERMANY).format(1234567.89);     // 1.234.567,89
NumberFormat.getCompactNumberInstance(Locale.US, Style.SHORT).format(1234567);  // 1M

LocalDate d = LocalDate.of(2026, 3, 15);
d.format(DateTimeFormatter.ofLocalizedDate(FormatStyle.MEDIUM).withLocale(Locale.US));      // Mar 15, 2026
d.format(DateTimeFormatter.ofLocalizedDate(FormatStyle.MEDIUM).withLocale(Locale.GERMANY)); // 15.03.2026

MessageFormat.format("{0} có {1} tin nhắn", "An", 3);   // "An có 3 tin nhắn"
```

Chú ý Đức dùng dấu chấm làm phân cách hàng nghìn và dấu phẩy làm phần thập phân — **ngược** với Mỹ. Đề rất thích hỏi chỗ này.
`LocalDate` gặp pattern chứa giờ (`HH:mm`) → `UnsupportedTemporalTypeException` lúc chạy.

---

# PHẦN B — 30 BÀI TẬP

**Câu 1.** In ra gì?
```java
Thread v = Thread.ofVirtual().unstarted(() -> {});
v.setPriority(9);
System.out.println(v.isDaemon() + " " + v.getPriority() + " " + v.isVirtual());
```

**Câu 2.** Hai đoạn này khác nhau thế nào?
```java
new Thread(() -> System.out.println("A")).start();   // đoạn 1
new Thread(() -> System.out.println("B")).run();     // đoạn 2
```

**Câu 3.** Chuyện gì xảy ra?
```java
Thread t = new Thread(() -> {});
t.start();
t.start();
```

**Câu 4.** Điền kiểu cho `f1` và `f2`, và cho biết đoạn nào không biên dịch được.
```java
ExecutorService es = Executors.newFixedThreadPool(2);
? f1 = es.submit(() -> 42);
? f2 = es.execute(() -> System.out.println("x"));
```

**Câu 5.** `r.get()` ném exception gì, và `getCause()` là gì?
```java
Future<?> r = es.submit(() -> { throw new RuntimeException("boom"); });
r.get();
```

**Câu 6.** Sau `es.shutdown()`, giá trị của hai biểu thức?
```java
es.shutdown();
es.isShutdown();
es.isTerminated();
es.submit(() -> 1);   // và dòng này?
```

**Câu 7.** `invokeAll` và `invokeAny` trả về gì?
```java
List<Callable<String>> tasks = List.of(() -> "a", () -> "b");
es.invokeAll(tasks);
es.invokeAny(tasks);
```

**Câu 8.** In ra gì?
```java
AtomicInteger ai = new AtomicInteger(5);
System.out.println(ai.getAndIncrement());
System.out.println(ai.get());
System.out.println(ai.incrementAndGet());
```

**Câu 9.** Sai ở đâu?
```java
Lock l = new ReentrantLock();
l.lock();
doWork();          // có thể ném exception
l.unlock();
```

**Câu 10.** Dòng nào ném exception?
```java
new ConcurrentHashMap<String,Integer>().put(null, 1);   // 1
new HashMap<String,Integer>().put(null, 1);             // 2
new ArrayDeque<String>().add(null);                     // 3
```

**Câu 11.** In ra gì, và có ném `ConcurrentModificationException` không?
```java
List<Integer> cow = new CopyOnWriteArrayList<>(List.of(1,2,3));
for (Integer i : cow) if (i == 1) cow.add(99);
System.out.println(cow);
```

**Câu 12.** Mỗi dòng trả về gì?
```java
CompletableFuture<Integer> cf = CompletableFuture.supplyAsync(() -> 10);
cf.thenApply(x -> x * 2).join();
cf.thenAccept(x -> {}).join();
CompletableFuture.supplyAsync(() -> 1).thenCombine(CompletableFuture.supplyAsync(() -> 2), Integer::sum).join();
```

**Câu 13.** `join()` và `get()` ném exception gì khi CF thất bại?
```java
CompletableFuture<Integer> bad = CompletableFuture.supplyAsync(() -> { throw new IllegalStateException("x"); });
bad.join();
bad.get();
bad.exceptionally(e -> -1).join();
```

**Câu 14.** `thenApply` và `thenCompose` khác nhau ở đâu? Cái nào dùng cho đoạn dưới?
```java
CompletableFuture.supplyAsync(() -> 1)
    .???(x -> CompletableFuture.supplyAsync(() -> x + 1))
    .join();   // muốn kết quả là 2, không phải CompletableFuture lồng nhau
```

**Câu 15.** Biến thể nào đúng chuẩn ForkJoin, biến thể nào mất tính song song?
```java
// A
left.fork(); return right.compute() + left.join();
// B
left.fork(); right.fork(); return left.join() + right.join();
// C
left.fork(); int a = left.join(); right.fork(); return a + right.join();
```

**Câu 16.** **[Java 25]** In ra gì?
```java
static final ScopedValue<String> USER = ScopedValue.newInstance();

ScopedValue.where(USER, "an").run(() -> System.out.println(USER.get()));
System.out.println(USER.get());
```

**Câu 17.** Nêu ba điểm khác nhau giữa `ScopedValue` và `ThreadLocal`.

**Câu 18.** Phân loại: lớp nào là byte stream, lớp nào là character stream?
```
FileInputStream, FileReader, BufferedWriter, ObjectOutputStream,
InputStreamReader, PrintWriter, BufferedInputStream
```

**Câu 19.** Ghi rồi đọc lại `new P("An", 30)`, sau đó `P.company = "CHANGED"`. In ra gì?
```java
class Base { Base() { System.out.print("Base-ctor "); } }
class P extends Base implements Serializable {
    String name;  transient int age;  static String company = "ACME";
    P(String n, int a) { name = n; age = a; System.out.print("P-ctor "); }
    public String toString() { return name + "/" + age + "/" + company; }
}
```
Cụ thể: (a) lúc ghi in gì, (b) lúc đọc in gì, (c) `toString()` của object đọc về là gì?

**Câu 20.** Trường hợp nào ném `InvalidClassException`, trường hợp nào ném `NotSerializableException`?
1. `serialVersionUID` lúc đọc khác lúc ghi
2. Lớp có field kiểu không Serializable, không đánh `transient`
3. Lớp cha không-Serializable không có constructor không tham số

**Câu 21.** In ra gì?
```java
Path p = Path.of("/a/b/c.txt");
System.out.println(p.getNameCount() + " " + p.getName(0) + " " + p.getRoot() + " " + p.subpath(0, 2));
```

**Câu 22.** In ra gì?
```java
System.out.println(Path.of("/a/b").resolve("c/d"));
System.out.println(Path.of("/a/b").resolve("/x/y"));
System.out.println(Path.of("/a/b/../c/./d").normalize());
```

**Câu 23.** In ra gì, dòng nào lỗi?
```java
System.out.println(Path.of("/a/b").relativize(Path.of("/a/b/c/d")));   // 1
System.out.println(Path.of("/a/b/c/d").relativize(Path.of("/a/b")));   // 2
System.out.println(Path.of("/a").relativize(Path.of("b")));            // 3
```

**Câu 24.** Dòng nào bắt buộc phải dùng try-with-resources? Dòng nào ném exception khi file không tồn tại?
```java
Files.readAllLines(f);        // 1
Files.lines(f);               // 2
Files.walk(dir);              // 3
Files.delete(missing);        // 4
Files.deleteIfExists(missing); // 5
```

**Câu 25.** Module nào cần khai báo `requires`, module nào không?
```java
module app {
    requires java.base;   // 1
    requires java.sql;    // 2
}
```

**Câu 26.** `exports` và `opens` khác nhau ở đâu? Jackson cần cái nào để đọc field private?

**Câu 27.** Ba loại module — điền vào chỗ trống:
1. JAR không có `module-info.java` đặt trên **module path** → module gì?
2. Mọi thứ trên **classpath** → module gì?
3. Named module có đọc được (2) không?

**Câu 28.** Với ba file `Msg.properties` (`hello=Hello`, `bye=Bye`), `Msg_en_GB.properties` (`hello=Hello UK`), `Msg_vi.properties` (`hello=Xin chao`) — mỗi dòng trả về gì?
```java
ResourceBundle.getBundle("Msg", Locale.of("en","GB")).getString("hello");   // 1
ResourceBundle.getBundle("Msg", Locale.of("en","GB")).getString("bye");     // 2
ResourceBundle.getBundle("Msg", Locale.of("vi")).getString("bye");          // 3
ResourceBundle.getBundle("Msg", Locale.FRANCE).getString("hello");          // 4
ResourceBundle.getBundle("Msg", Locale.of("vi")).getString("khongco");      // 5
```

**Câu 29.** In ra gì?
```java
System.out.println(NumberFormat.getCurrencyInstance(Locale.GERMANY).format(1234.5));
System.out.println(NumberFormat.getPercentInstance(Locale.US).format(0.256));
System.out.println(NumberFormat.getInstance(Locale.GERMANY).format(1234567.89));
```

**Câu 30.** Chuyện gì xảy ra?
```java
LocalDate.now().format(DateTimeFormatter.ofPattern("HH:mm"));
```

---

# PHẦN C — ĐÁP ÁN & GIẢI THÍCH

**Câu 1 → `true 5 true`**
Virtual thread **luôn** là daemon và **luôn** có priority 5. `setPriority(9)` không ném exception — nó chỉ bị bỏ qua âm thầm, đây mới là chỗ dễ sai.
Hệ quả thực tế: JVM không chờ virtual thread, nên nếu `main` kết thúc trong khi chúng đang chạy thì chương trình thoát luôn. Muốn chờ, dùng `join()` hoặc bọc trong try-with-resources của `ExecutorService`.

---

**Câu 2 → Đoạn 1 tạo thread mới. Đoạn 2 KHÔNG.**
`run()` chỉ là một method thường — gọi nó chạy tuần tự ngay trên thread hiện tại, `Thread` object trở nên vô dụng. Chỉ `start()` mới yêu cầu JVM cấp thread.
Trong đề, cách nhận diện là xem có `start()` hay không; nếu chỉ có `run()` thì output hoàn toàn xác định, không có tính bất định.

---

**Câu 3 → `IllegalThreadStateException` ở lần `start()` thứ hai.**
Một `Thread` object chỉ chạy được một lần. Sau khi kết thúc, trạng thái là `TERMINATED` và không quay lại được. Muốn chạy lại phải tạo object mới.

---

**Câu 4 → `f1` là `Future<Integer>`; dòng `f2` KHÔNG biên dịch được.**
`execute(Runnable)` trả về `void` nên không gán được vào biến. `submit` mới trả `Future`.
Khác biệt sâu hơn: exception ném từ `execute` nổi lên `UncaughtExceptionHandler` ngay; exception từ `submit` bị **nuốt** vào `Future` và chỉ lộ ra khi bạn gọi `get()`. Đây là nguồn bug âm thầm rất phổ biến.

---

**Câu 5 → `ExecutionException`, `getCause()` là `RuntimeException("boom")`.**
`Future.get()` luôn bọc lỗi của task vào `ExecutionException` (checked). Muốn biết lỗi gốc phải gọi `getCause()`.
So sánh với Câu 13: `CompletableFuture.join()` lại bọc bằng `CompletionException` (unchecked). Hai API, hai kiểu bọc khác nhau.

---

**Câu 6 → `isShutdown()` = `true`, `isTerminated()` = `false`, `submit` ném `RejectedExecutionException`.**
`shutdown()` chỉ nói "không nhận task mới"; các task đã nộp vẫn chạy tới hết. Vì thế `isTerminated()` còn `false` cho tới khi mọi task xong.
Muốn chờ thật sự: `es.awaitTermination(5, TimeUnit.SECONDS)`. Hoặc gọn hơn, dùng try-with-resources vì `ExecutorService` là `AutoCloseable` từ Java 19.

---

**Câu 7 → `invokeAll` trả `List<Future<String>>` gồm 2 phần tử; `invokeAny` trả `"a"` (một `String`).**
`invokeAll` **chặn cho tới khi tất cả xong**, rồi trả danh sách `Future` đã hoàn tất — nên `get()` trên chúng không bao giờ phải chờ.
`invokeAny` trả **giá trị** của task đầu tiên hoàn tất thành công và huỷ phần còn lại. Chú ý kiểu trả về khác nhau: một bên `List<Future<T>>`, một bên `T`.

---

**Câu 8 → `5`, `6`, `7`**
`getAndIncrement()` trả giá trị **cũ** (5) rồi tăng lên 6. `incrementAndGet()` tăng lên 7 rồi trả 7.
Quy tắc chung cho mọi lớp atomic: đọc tên từ trái sang phải chính là thứ tự thực hiện — `getAndAdd` lấy trước cộng sau, `addAndGet` cộng trước lấy sau.

---

**Câu 9 → thiếu `try/finally`. Nếu `doWork()` ném exception, `unlock()` không bao giờ chạy → khoá bị giữ vĩnh viễn → deadlock.**
```java
l.lock();
try { doWork(); } finally { l.unlock(); }
```
Đây chính là điểm `synchronized` an toàn hơn: nó tự nhả khoá khi thoát khối, kể cả khi có exception. Đổi lại `ReentrantLock` cho bạn `tryLock` có timeout và khoá công bằng.

---

**Câu 10 → dòng 1 và 3 ném `NullPointerException`; dòng 2 hợp lệ.**
`ConcurrentHashMap` cấm cả `null` key lẫn `null` value, vì trong môi trường đa luồng không thể phân biệt "không có khoá" với "khoá ánh xạ tới null" bằng `get()` — sẽ phải dùng `containsKey`, mà thao tác đó không nguyên tử.
`ArrayDeque` cấm `null` vì dùng `null` làm tín hiệu rỗng cho `poll`/`peek`.
`HashMap` một luồng thì không có vấn đề đó nên cho phép một key `null`.

---

**Câu 11 → in `[1, 2, 3, 99]`, KHÔNG ném CME.**
`CopyOnWriteArrayList` cấp cho iterator một **ảnh chụp** mảng tại thời điểm bắt đầu duyệt. Mọi thao tác ghi tạo ra mảng mới, không đụng vào ảnh chụp đó. Nên vòng lặp chỉ đi qua `1, 2, 3` — phần tử `99` không xuất hiện trong lượt duyệt, nhưng có mặt khi in ra sau đó.
Hệ quả: iterator không hỗ trợ `remove()` (ném `UnsupportedOperationException`), và mỗi lần ghi phải sao chép cả mảng nên chỉ hợp khi đọc nhiều ghi ít.

---

**Câu 12 → `20`, `null`, `3`**
- `thenApply` nhận `Function` → biến đổi giá trị → 20.
- `thenAccept` nhận `Consumer` → trả `CompletableFuture<Void>` → `join()` cho `null`.
- `thenCombine` chờ **cả hai** CF rồi gộp bằng `BiFunction` → 3.
Bộ ba cần phân biệt: `thenApply` (Function, đổi giá trị), `thenAccept` (Consumer, không trả gì), `thenRun` (Runnable, không nhận cũng không trả).

---

**Câu 13 → `join()` ném `CompletionException`; `get()` ném `ExecutionException`; `exceptionally(...)` trả `-1`.**
`join()` không khai báo checked exception nên dùng được trong lambda mà không cần `try/catch` — vì thế nó bọc lỗi bằng `CompletionException` (unchecked). `get()` kế thừa từ `Future` nên giữ `ExecutionException` (checked).
`exceptionally` là nhánh phục hồi, chỉ chạy khi có lỗi. Cần xử lý cả hai chiều thì dùng `handle((v, e) -> ...)` hoặc `whenComplete`.

---

**Câu 14 → dùng `thenCompose`.**
`thenApply` với hàm trả về CF sẽ cho `CompletableFuture<CompletableFuture<Integer>>` — lồng hai tầng. `thenCompose` "làm phẳng" đúng một tầng.
Đối chiếu với Stream: `thenApply` ↔ `map`, `thenCompose` ↔ `flatMap`. Nhớ cặp tương ứng này là không bao giờ nhầm.

---

**Câu 15 → A đúng chuẩn; B chấp nhận được nhưng kém hơn; C mất hoàn toàn tính song song.**
- **A**: fork nhánh trái cho pool, thread hiện tại tự tính nhánh phải, rồi mới join. Không thread nào rảnh rỗi.
- **B**: fork cả hai rồi join cả hai — thread hiện tại chỉ ngồi chờ, lãng phí một thread.
- **C**: `left.join()` chặn **trước khi** `right` được fork, nên hai nhánh chạy tuần tự. Đây là lỗi thường bị cài vào đề.
Quy tắc thuộc lòng: **fork một, tính một, join sau cùng**.

---

**Câu 16 → in `an`, sau đó ném `NoSuchElementException`.**
Giá trị chỉ tồn tại **trong phạm vi** của `run()`. Ra khỏi khối, binding tự huỷ — không cần dọn thủ công như `ThreadLocal.remove()`.
Muốn kiểm tra an toàn trước khi đọc: `USER.isBound()`, hoặc `USER.orElse(default)`.

---

**Câu 17**
| | `ThreadLocal` | `ScopedValue` |
|---|---|---|
| Thay đổi | `set()` bất cứ lúc nào, ở bất cứ đâu | bất biến, chỉ gán khi mở phạm vi |
| Vòng đời | thủ công, quên `remove()` là rò rỉ | tự huỷ khi thoát khối |
| Chi phí | mỗi thread một map — rất nặng với hàng triệu virtual thread | nhẹ, chia sẻ được xuống thread con |

Lý do ra đời: virtual thread khiến `ThreadLocal` trở thành gánh nặng bộ nhớ, còn mô hình "gán bất cứ lúc nào" khiến luồng dữ liệu khó lần theo.

---

**Câu 18**
- **Byte stream:** `FileInputStream`, `ObjectOutputStream`, `BufferedInputStream`
- **Character stream:** `FileReader`, `BufferedWriter`, `PrintWriter`
- **Cầu nối:** `InputStreamReader` — nhận `InputStream` (byte), cho ra `Reader` (ký tự)

Mẹo: tên có `Stream` → byte, tên có `Reader`/`Writer` → ký tự. Ngoại lệ duy nhất cần nhớ là `PrintStream` (`System.out`) — tên có `Stream` nhưng làm việc với text.

---

**Câu 19 → (a) `Base-ctor P-ctor`, (b) chỉ `Base-ctor`, (c) `An/0/CHANGED`**
Ba cơ chế cùng lúc:
1. **Constructor không chạy khi deserialize.** JVM cấp phát object rồi đổ dữ liệu trực tiếp vào field. Nhưng nó **phải** khởi tạo phần thuộc lớp cha không-Serializable, nên constructor không tham số của `Base` **có** chạy → in `Base-ctor`.
2. `transient int age` không được ghi → khôi phục về giá trị mặc định `0`, không phải 30.
3. `static company` thuộc về lớp chứ không thuộc instance → không nằm trong luồng byte → object đọc về thấy giá trị **hiện tại** là `"CHANGED"`.

---

**Câu 20 → 1 và 3 ném `InvalidClassException`; 2 ném `NotSerializableException`.**
`InvalidClassException` là lỗi về **cấu trúc lớp**: UID không khớp, hoặc lớp cha không-Serializable thiếu constructor không tham số (JVM không có cách nào khởi tạo phần đó).
`NotSerializableException` là lỗi về **dữ liệu**: gặp một object không ghi được lúc đang ghi. Sửa bằng cách cho lớp đó implement `Serializable`, hoặc đánh `transient` cho field.

---

**Câu 21 → `3 a / a/b`**
`getNameCount()` đếm các thành phần tên, **không tính root** → `a`, `b`, `c.txt` = 3. `getName(0)` là thành phần đầu tiên sau root → `a`. `getRoot()` → `/`. `subpath(0, 2)` lấy từ index 0 đến trước 2 → `a/b`, và kết quả **luôn là path tương đối** dù nguồn là tuyệt đối.

---

**Câu 22 → `/a/b/c/d`, `/x/y`, `/a/c/d`**
Dòng 2 là bẫy quan trọng nhất: `resolve` với đối số **tuyệt đối** thì bỏ qua hoàn toàn path gốc và trả về chính đối số. Logic là "nếu đã có đường tuyệt đối thì còn ghép vào đâu nữa".
`normalize()` xử lý `..` và `.` thuần trên chuỗi, không kiểm tra file có thật hay không — nên `/a/b/../c` thành `/a/c` kể cả khi `/a/b` không tồn tại.

---

**Câu 23 → 1: `c/d`; 2: `../..`; 3: `IllegalArgumentException`**
`relativize` trả lời "đi từ path này tới path kia bằng cách nào". Từ `/a/b` tới `/a/b/c/d` thì đi xuống hai cấp → `c/d`. Chiều ngược lại thì lùi hai cấp → `../..`.
Dòng 3 lỗi vì trộn **tuyệt đối** với **tương đối** — không có cách nào tính được, ném `IllegalArgumentException` (không phải `IOException`).

---

**Câu 24 → dòng 2 và 3 bắt buộc try-with-resources; dòng 4 ném `NoSuchFileException`, dòng 5 trả `false`.**
`Files.lines`, `Files.walk`, `Files.find`, `Files.list` trả `Stream` giữ **file handle mở**. Không đóng thì rò tài nguyên và trên Windows còn khoá luôn file.
`Files.readAllLines` đọc hết vào RAM rồi đóng ngay — không cần đóng, nhưng không dùng được cho file lớn.
`delete` vs `deleteIfExists`: cái đầu ném, cái sau trả `boolean`. Tất cả method của `Files` đều ném `IOException` (checked), phải xử lý.

---

**Câu 25 → dòng 1 thừa, dòng 2 cần thiết.**
`java.base` được `requires` **ngầm định** cho mọi module — viết ra không sai nhưng dư. Mọi module khác của JDK (`java.sql`, `java.logging`, `java.desktop`, `java.xml`…) đều phải khai báo tường minh.
Đây là thay đổi lớn khi di trú từ Java 8: những gì trước đây "có sẵn" nay phải xin phép.

---

**Câu 26 → Jackson cần `opens`.**
`exports` cho phép truy cập **bình thường** lúc biên dịch và lúc chạy — tức là các thành viên `public` của package đó. Nó **không** cho phép reflection sâu vào field `private`.
`opens` cho phép reflection sâu **lúc chạy** (kể cả `setAccessible(true)` trên field private) nhưng không cấp quyền truy cập lúc biên dịch.
Vì thế package chứa DTO/entity thường cần `opens com.example.model to com.fasterxml.jackson.databind;` — mở có giới hạn, chỉ cho đúng thư viện cần.

---

**Câu 27**
1. → **Automatic module**. Tên suy ra từ tên file JAR (bỏ số phiên bản, thay `-` bằng `.`) hoặc từ `Automatic-Module-Name` trong manifest. Nó ngầm `requires` mọi module và `exports` mọi package.
2. → **Unnamed module**.
3. → **Không.** Named module không đọc được unnamed module. Đây chính là lý do automatic module tồn tại: làm bước đệm để đưa thư viện cũ từ classpath lên module path mà chưa cần sửa code.

---

**Câu 28 → 1: `Hello UK`; 2: `Bye`; 3: `Bye`; 4: `Hello`; 5: `MissingResourceException`**
Điểm cốt lõi là **kế thừa khoá**. Khi đã chọn được `Msg_en_GB`, các khoá thiếu sẽ tìm ngược lên chuỗi cha: `Msg_en_GB` → `Msg_en` → `Msg`. Nên `bye` tuy không có trong file `en_GB` vẫn lấy được từ `Msg.properties`.
Dòng 4: không có `Msg_fr` nên rơi về bundle mặc định `Msg`.
Dòng 5: khoá không tồn tại ở bất kỳ tầng nào → `MissingResourceException` (unchecked).
Lưu ý điều Java **không** làm: sau khi đã chốt một nhánh locale, nó không nhảy sang nhánh khác (ví dụ `Msg_vi`) để tìm khoá thiếu.

---

**Câu 29 → `1.234,50 €`, `26%`, `1.234.567,89`**
Đức đảo ngược quy ước so với Mỹ: dấu **chấm** phân cách hàng nghìn, dấu **phẩy** cho phần thập phân, ký hiệu tiền tệ đứng **sau** số và cách một khoảng trắng.
`getPercentInstance` nhân với 100 rồi **làm tròn về số nguyên** theo mặc định — 0.256 thành `26%` chứ không phải `25.6%`. Muốn giữ số lẻ phải gọi `setMaximumFractionDigits(1)`.

---

**Câu 30 → `UnsupportedTemporalTypeException` lúc chạy.**
`LocalDate` không mang thông tin giờ, nên formatter yêu cầu `HH:mm` không tìm được trường tương ứng. Biên dịch vẫn qua vì `format` chỉ nhận một `DateTimeFormatter` bất kỳ.
Cùng họ lỗi với bẫy `LocalDate.plus(Duration)` ở Giai đoạn 1 — hai bên đều là "sai kiểu thời gian" và đều chỉ lộ ra lúc chạy.

---

# Tự chấm

| Điểm | Ý nghĩa |
|---|---|
| 27–30 | Vững, sang Giai đoạn 4 (mock) |
| 21–26 | Ôn lại module có câu sai, làm lại sau 3 ngày |
| < 21 | Đây là giai đoạn khó nhất — đọc lại Phần A, tự gõ code, làm lại sau 1 tuần |

Nếu điểm thấp, đừng vội sang giai đoạn sau. Đây là phần Oracle hỏi nhiều mà hầu hết người thi lại chuẩn bị ít nhất.

**Bài tập tổng hợp cuối giai đoạn:** viết một chương trình modular hoá gồm:
1. Module `core` xuất một interface `Report`, module `app` `requires` nó
2. Dùng `Executors.newVirtualThreadPerTaskExecutor()` chạy song song 1000 tác vụ đọc file bằng `Files.readString`
3. Gộp kết quả bằng `CompletableFuture.allOf(...)` và xử lý lỗi bằng `handle`
4. Xuất báo cáo có định dạng tiền tệ theo `Locale` truyền từ dòng lệnh, chuỗi hiển thị lấy từ `ResourceBundle`
5. Đóng gói bằng `jar`, chạy bằng `java -p out -m app/app.Main`, kiểm tra phụ thuộc bằng `jdeps`

Làm được trọn vẹn nghĩa là bạn đã chạm vào cả bốn mảng của giai đoạn này trong một bài.
