---
title: "Đa Luồng & Concurrency Chuyên Sâu: Từ Java Memory Model Đến Virtual Threads"
description: Chuyên khảo toàn diện về lập trình đồng thời trong Java: Mổ xẻ Java Memory Model (JMM), Cache Coherence MESI, volatile & memory barriers, Monitor & Mark Word lock escalation, AQS & ReentrantLock, ThreadPool sizing, CompletableFuture và cuộc cách mạng Virtual Threads (Project Loom) trong Java 21 LTS.
order: 1
featured: true
tags: [Java, Multithreading, Concurrency, JMM, VirtualThreads, Loom, AQS, CompletableFuture]
readingMinutes: 35
---

# Đa Luồng & Concurrency Chuyên Sâu: Từ Java Memory Model Đến Virtual Threads

Lập trình đồng thời (Concurrent Programming) là đỉnh cao kỹ thuật và cũng là bài kiểm tra khắc nghiệt nhất đối với bất kỳ kỹ sư phần mềm Java nào. Để xây dựng các hệ thống tài chính, e-commerce hay streaming có khả năng xử lý hàng triệu transactions mỗi giây, bạn không thể chỉ dừng lại ở mức `new Thread()` hay `synchronized`.

Chuyên khảo này sẽ đưa bạn đi từ tầng vi kiến trúc phần cứng (CPU cache, memory fences, MESI protocol), tiến qua mô hình bộ nhớ Java (**Java Memory Model - JMM**), cơ chế khoá **AQS**, kỹ thuật mở rộng **ThreadPool**, lập trình bất đồng bộ phản ứng với **CompletableFuture**, và chạm đến cuộc cách mạng hiện đại: **Virtual Threads (Project Loom)** trong Java 21 LTS.

---

## 1. Tầng Vi Kiến Trúc & Java Memory Model (JMM)

Để hiểu tại sao race conditions và memory visibility bugs lại xảy ra, ta cần nhìn vào cách phần cứng hiện đại xử lý dữ liệu.

### 1.1. Kiến Trúc Phần Cứng: Cache Coherence (MESI) & Store Buffers
Tốc độ của CPU nhanh hơn RAM hàng trăm lần (CPU clock cycle ~ 0.3ns, trong khi truy cập RAM tốn 50–100ns). Để bù đắp độ trễ, mỗi lõi CPU được trang bị các tầng bộ nhớ đệm: **L1 Cache (~1ns)**, **L2 Cache (~4ns)**, và chia sẻ chung **L3 Cache (~10ns)**.

```text
  ┌─────────────────────────────────────────────────────────────┐
  │                         MAIN MEMORY                         │
  └──────────────────────────────┬──────────────────────────────┘
                                 │
  ┌──────────────────────────────┴──────────────────────────────┐
  │                        L3 SHARED CACHE                      │
  └──────────────┬──────────────────────────────┬───────────────┘
                 │                              │
         ┌───────┴───────┐              ┌───────┴───────┐
         │   L2 CACHE    │              │   L2 CACHE    │
         └───────┬───────┘              └───────┬───────┘
                 │                              │
         ┌───────┴───────┐              ┌───────┴───────┐
         │   L1 CACHE    │              │   L1 CACHE    │
         └───────┬───────┘              └───────┬───────┘
                 │                              │
         ┌───────┴───────┐              ┌───────┴───────┐
         │ STORE BUFFER  │              │ STORE BUFFER  │
         └───────┬───────┘              └───────┬───────┘
                 │                              │
           [ CPU CORE 0 ]                 [ CPU CORE 1 ]
```

* **Giao thức MESI:** Các lõi CPU giao tiếp qua bus để đồng bộ trạng thái của từng Cache Line (thường là 64 bytes):
  * **M (Modified):** Dòng cache đã bị sửa đổi, khác với RAM, chỉ tồn tại duy nhất ở lõi này.
  * **E (Exclusive):** Dòng cache chỉ nằm ở lõi này, giống hệt RAM.
  * **S (Shared):** Dòng cache có thể nằm ở nhiều lõi CPU, dữ liệu giống RAM (chỉ đọc).
  * **I (Invalid):** Dòng cache không còn hợp lệ.
* **Store Buffer & Invalidate Queues:** Khi CPU ghi biến, thay vì đợi các lõi khác xác nhận Invalidate (mất hàng chục cycles), nó đẩy giá trị vào **Store Buffer** cục bộ rồi thực thi tiếp. Điều này dẫn đến hiện tượng: **Một lõi ghi giá trị mới nhưng lõi khác vẫn đọc giá trị cũ!**

### 1.2. Hiện Tượng Tái Cấu Trúc Lệnh (Instruction Reordering)
Cả trình biên dịch (JIT Compiler) và CPU đều có quyền đảo thứ tự thực thi các dòng lệnh độc lập để tối ưu hoá pipeline (Instruction-Level Parallelism), miễn là không làm thay đổi kết quả của một luồng đơn lẻ (**as-if-serial semantics**).

Tuy nhiên, trong môi trường đa luồng:
```java
// Thread 1
a = 1;
flag = true;

// Thread 2
if (flag) {
    print(a); // CPU có thể thấy flag = true trước khi a = 1! Kết quả in ra 0!
}
```

### 1.3. Quy Tắc Happens-Before Trong JMM (JSR-133)
Java Memory Model định nghĩa một quan hệ toán học gọi là **happens-before**: Nếu thao tác $X$ happens-before thao tác $Y$, thì mọi thay đổi bộ nhớ thực hiện bởi $X$ chắc chắn sẽ được nhìn thấy bởi $Y$.

Các quy tắc then chốt:
1. **Program Order Rule:** Trong cùng một luồng, mỗi thao tác happens-before thao tác đứng sau nó theo thứ tự mã nguồn.
2. **Monitor Lock Rule:** Thao tác giải phóng lock (`unlock`) trên một monitor happens-before mọi thao tác nhận lock (`lock`) tiếp theo trên cùng monitor đó.
3. **Volatile Variable Rule:** Thao tác ghi (`write`) vào một biến `volatile` happens-before mọi thao tác đọc (`read`) tiếp theo từ chính biến đó.
4. **Thread Start Rule:** Lời gọi `Thread.start()` happens-before mọi thao tác bên trong luồng mới được tạo.
5. **Thread Termination Rule:** Mọi thao tác trong một luồng happens-before thời điểm luồng khác phát hiện nó đã kết thúc qua `Thread.join()` hoặc `Thread.isAlive() == false`.
6. **Transitivity (Bắc cầu):** Nếu $A$ happens-before $B$ và $B$ happens-before $C$, thì $A$ happens-before $C$.

### 1.4. Bản Chất Của Từ Khoá `volatile` & Memory Barriers
Khi một biến được đánh dấu `volatile`:
* JIT Compiler chèn các lệnh **Memory Barrier (Memory Fence)** ở cấp vi mã CPU:
  * **StoreStore Barrier:** Đảm bảo toàn bộ thao tác ghi trước đó được flush trước khi ghi biến volatile.
  * **StoreLoad Barrier:** Đảm bảo thao tác ghi volatile được đẩy hoàn toàn ra bus trước khi thực hiện các thao tác đọc/ghi tiếp theo.
  * **LoadLoad & LoadStore Barriers:** Đảm bảo đọc volatile xong mới nạp các biến phía sau.
* **Tại sao `volatile` KHÔNG đảm bảo tính nguyên tử (Atomicity)?**
  Xét phép tính: `count++`:
  ```text
  getfield count  // 1. Đọc giá trị từ bộ nhớ vào thanh ghi
  iadd            // 2. Tăng giá trị lên 1 trong ALU
  putfield count  // 3. Ghi kết quả ngược lại bộ nhớ
  ```
  Nếu hai luồng cùng chạy 3 bước này đồng thời, chúng sẽ ghi đè kết quả của nhau. `volatile` chỉ đảm bảo **Visibility** (khả năng hiển thị giá trị mới nhất) và **Ordering** (chống reordering), hoàn toàn **không có tính nguyên tử**.

### 1.5. Hiện Tượng False Sharing & Annotation `@Contended`
* Bộ nhớ đệm CPU nạp dữ liệu theo từng khối **Cache Line (64 bytes)**.
* Giả sử hai biến độc lập `x` và `y` nằm liền kề nhau trong ô nhớ và rơi vào cùng một Cache Line 64 bytes.
* Khi Core 1 sửa `x`, toàn bộ Cache Line chứa cả `x` và `y` ở Core 2 bị đánh dấu `Invalid` (theo giao thức MESI), buộc Core 2 phải nạp lại từ L3/RAM dù Core 2 chỉ đọc `y`.
* Hiện tượng này gọi là **False Sharing (Chia sẻ giả mạo)**, làm suy giảm hiệu năng nghiêm trọng.
* **Giải pháp trong Java:** Thêm biến đệm (padding) 64/128 bytes hoặc sử dụng `@jdk.internal.vm.annotation.Contended` (cần flag `-XX:-RestrictContended`).

---

## 2. Đồng Bộ Hoá & Cơ Chế Khoá Của JVM (Locking & Monitor Internals)

Khi dùng từ khoá `synchronized`, HotSpot JVM thực hiện việc khoá đối tượng thông qua cấu trúc dữ liệu của chính Object Header.

### 2.1. Cấu Trúc Object Header & Mark Word
Mỗi đối tượng trên Java Heap có một Object Header gồm 2 hoặc 3 phần:
1. **Mark Word (64-bit trên 64-bit JVM):** Chứa Hashcode, GC age, và thông tin trạng thái khoá (Lock state).
2. **Klass Word (64-bit hoặc 32-bit khi bật Compressed OOPs):** Con trỏ trỏ tới metadata của Class trong Metaspace.
3. **Array Length (32-bit):** Chỉ có nếu đối tượng là mảng.

```text
┌────────────────────────────────────────────────────────────────────────┐
│                      64-bit Mark Word Layout                           │
├──────────────────────────────────────────────────────┬─────────┬───────┤
│ Biến dữ liệu / Trạng thái con trỏ                     │ GC Age  │ Lock  │
├──────────────────────────────────────────────────────┼─────────┼───────┤
│ Unlocked:           hash code (31 bit) | unused (25) │ 4 bits  │  001  │
│ Lightweight Locked: ptr to Lock Record on stack (62) │  --     │  000  │
│ Heavyweight Locked: ptr to ObjectMonitor object (62) │  --     │  010  │
│ Marked for GC:      ptr to forwarding address (62)   │  --     │  011  │
└──────────────────────────────────────────────────────┴─────────┴───────┘
```
*(Lưu ý: Biased Locking đã bị deprecated từ JDK 15 và loại bỏ hoàn toàn trong các phiên bản LTS mới).*

### 2.2. Cơ Chế Thăng Cấp Khoá (Lock Escalation)
JVM tối ưu hoá việc đồng bộ qua quá trình nâng cấp khoá một chiều (không hạ cấp trong lúc luồng đang tranh chấp):

```text
[ Không khoá (Unlocked) ]
           │
           │ Luồng đầu tiên vào synchronized (Dùng CAS ghi Lock Record lên Call Stack)
           ▼
[ Khoá nhẹ (Lightweight Lock) ]
           │
           │ Xảy ra tranh chấp luồng (CAS thất bại, luồng quay vòng Spin)
           ▼
[ Khoá nặng (Heavyweight Lock) ] ──> Hệ thống tạo ObjectMonitor, luồng bị Park bởi OS Mutex
```

### 2.3. Cấu Trúc `ObjectMonitor` & Bản Chất `wait()` / `notify()`
Khi khoá được nâng lên Heavyweight Lock, Mark Word trỏ tới cấu trúc C++ `ObjectMonitor`:
* `_owner`: Con trỏ trỏ tới luồng đang nắm giữ lock.
* `_EntryList`: Hàng đợi chứa các luồng đang bị chặn (BLOCKED) chờ xin lock.
* `_WaitSet`: Hàng đợi chứa các luồng đang gọi `wait()` (chuyển sang WAITING / TIMED_WAITING).

**Tại sao bắt buộc phải gọi `wait()` trong vòng lặp `while`?**
```java
synchronized (lock) {
    while (!condition) { // KHÔNG ĐƯỢC DÙNG IF
        lock.wait();
    }
    // Thực thi xử lý khi condition == true
}
```
* **Spurious Wakeup:** Hệ điều hành có thể đánh thức luồng ngay cả khi không có `notify()` nào được gọi.
* **Race Condition sau notifyAll():** Nhiều luồng cùng thức dậy, nhưng chỉ có một luồng chiếm được monitor trước và thay đổi `condition`. Các luồng vào sau nếu không kiểm tra lại bằng `while` sẽ xử lý trên trạng thái không hợp lệ!

---

## 3. Thư Viện java.util.concurrent (JUC) & AbstractQueuedSynchronizer (AQS)

Để đạt được hiệu năng cao và tránh các hạn chế của `synchronized`, Doug Lea đã thiết kế framework **AQS (AbstractQueuedSynchronizer)** — xương sống của toàn bộ gói `java.util.concurrent`.

### 3.1. Cấu Trúc Bên Dưới Của AQS
AQS quản lý trạng thái đồng bộ hóa bằng:
1. **Biến `state` kiểu `volatile int`:**
   * Với `ReentrantLock`: `state` biểu thị số lần lock tái nhập (reentrant count).
   * Với `Semaphore`: `state` biểu thị số permits còn khả dụng.
   * Với `CountDownLatch`: `state` biểu thị số đếm còn lại cho đến 0.
2. **Hàng đợi FIFO biến thể từ thuật toán CLH Lock:**
   * Danh sách liên kết đôi chứa các Node đại diện cho các luồng đang chờ.
   * Sử dụng thao tác CAS nguyên tử để thêm Node vào đuôi (`tail`) và đánh thức Node ở đầu (`head`) bằng `LockSupport.unpark()`.

### 3.2. So Sánh Chi Tiết `ReentrantLock` vs `synchronized`
| Tiêu chí | `synchronized` | `ReentrantLock` |
| :--- | :--- | :--- |
| **Cơ chế triển khai** | Tích hợp sâu ở mức bytecode JVM (`monitorenter`/`monitorexit`) | Mã nguồn thuần Java sử dụng AQS & CAS |
| **Chính sách công bằng (Fairness)** | Không hỗ trợ (Non-fair, ưu tiên luồng đang chạy) | Tuỳ chọn công bằng: `new ReentrantLock(true)` (FIFO) |
| **Thử khoá không chặn** | Không hỗ trợ (phải chờ đến khi lấy được) | Hỗ trợ: `tryLock()` hoặc `tryLock(time, unit)` |
| **Khả năng ngắt (Interruption)** | Không thể ngắt khi đang chờ lấy lock | Hỗ trợ: `lockInterruptibly()` |
| **Điều kiện chờ (Condition)** | Chỉ có duy nhất 1 wait-set (`wait/notify`) | Hỗ trợ nhiều wait-set độc lập qua `newCondition()` |
| **Rủi ro quên mở khoá** | Không bao giờ (JVM tự giải phóng khi ra khỏi block) | Phải luôn đặt trong khối `try-finally` |

### 3.3. StampedLock & Kỹ Thuật Optimistic Reading
`ReentrantReadWriteLock` phân biệt ReadLock và WriteLock, nhưng nếu số lượng luồng đọc quá áp đảo, luồng ghi sẽ bị "đói tài nguyên" (Write Starvation). `StampedLock` (từ Java 8) giải quyết triệt để vấn đề này với chế độ **Optimistic Read**:

```java
public class Point {
    private double x, y;
    private final StampedLock sl = new StampedLock();

    public double distanceFromOrigin() {
        // 1. Nhận tem đọc lạc quan (KHÔNG chiếm lock thực sự, không chặn luồng ghi)
        long stamp = sl.tryOptimisticRead();
        double currentX = x;
        double currentY = y;

        // 2. Kiểm tra xem có luồng ghi nào chen ngang làm bẩn tem không
        if (!sl.validate(stamp)) {
            // Có luồng ghi chen vào -> Nâng cấp lên Read Lock truyền thống
            stamp = sl.readLock();
            try {
                currentX = x;
                currentY = y;
            } finally {
                sl.unlockRead(stamp);
            }
        }
        return Math.hypot(currentX, currentY);
    }
}
```

---

## 4. Kiến Trúc Thread Pool & Quản Trị Vòng Đời

Tạo mới một OS Thread tốn rất nhiều chi phí (cấp phát ~1MB Stack memory, gọi system call vào OS Kernel, chuyển ngữ cảnh CPU). `ThreadPoolExecutor` tái sử dụng các worker threads sẵn có.

### 4.1. Giải Thuật Xử Lý Nhiệm Vụ Của `ThreadPoolExecutor`
Khi gọi `executor.execute(task)`:
1. Nếu số luồng hiện tại $< 	ext{corePoolSize}$: Tạo ngay một worker thread mới để thực thi task.
2. Nếu số luồng hiện tại $\ge 	ext{corePoolSize}$: Đẩy task vào hàng đợi `workQueue`.
3. Nếu `workQueue` đã đầy và số luồng $< 	ext{maximumPoolSize}$: Tạo một worker thread tạm thời để xử lý task mới này.
4. Nếu số luồng đã đạt $	ext{maximumPoolSize}$ và `workQueue` đã đầy: Kích hoạt chính sách từ chối (**RejectedExecutionHandler**).

```text
 Task mới ──> [ Active < corePoolSize? ] ──Có──> Tạo Core Worker mới
                         │ Không
                         ▼
             [ workQueue đầy chưa? ]     ──Chưa─> Lưu vào BlockingQueue
                         │ Đầy
                         ▼
             [ Active < maxPoolSize? ]   ──Có──> Tạo Non-core Worker mới
                         │ Đầy
                         ▼
             Kích hoạt RejectedExecutionHandler (Abort / CallerRuns / Discard)
```

> [!WARNING]
> **Cạm bẫy chết người với `Executors.newFixedThreadPool(n)`:**
> Factory method này khởi tạo một `LinkedBlockingQueue` không giới hạn kích thước (`Integer.MAX_VALUE`). Khi tải tăng đột biến, hàng triệu tasks tích tụ trong hàng đợi khiến ứng dụng gặp lỗi sập nguồn kinh điển: `java.lang.OutOfMemoryError: Java heap space`. Hãy luôn chủ động dùng `new ThreadPoolExecutor(...)` với hàng đợi có dung lượng giới hạn (`ArrayBlockingQueue`).

### 4.2. Công Thức Tính Toán Kích Thước Thread Pool Chuẩn
* **Tác vụ CPU-Bound (Mã hoá, tính toán khoa học, xử lý JSON nặng):**
  $$N_{	ext{threads}} = N_{	ext{cpu}} + 1$$
  *(Thêm 1 luồng dự phòng khi xảy ra page fault).*
* **Tác vụ I/O-Bound (Gọi Database, REST API, đọc ghi file/network):**
  $$N_{	ext{threads}} = N_{	ext{cpu}} 	imes \left(1 + rac{	ext{Wait Time}}{	ext{Compute Time}}ight)$$
  *Ví dụ: Nếu thời gian chờ I/O chiếm 80% (Wait = 80ms, Compute = 20ms) trên máy chủ 8 Cores: $8 	imes (1 + 80/20) = 40 	ext{ threads}$.*

### 4.3. Xử Lý Ngắt Luồng & Shutdown Chuẩn Mực
Tuyệt đối không nuốt chửng ngoại lệ `InterruptedException`! Nếu không thể ném tiếp ra ngoài, phải khôi phục lại trạng thái ngắt của luồng:

```java
public void run() {
    while (!Thread.currentThread().isInterrupted()) {
        try {
            processNextBatch();
        } catch (InterruptedException e) {
            // KHÔI PHỤC LẠI INTERRUPTED STATUS ĐỂ VÒNG LẶP DỪNG ĐÚNG CÁCH
            Thread.currentThread().interrupt();
            log.warn("Worker thread was interrupted, terminating cleanly.");
            break;
        }
    }
}
```

---

## 5. Lập Trình Bất Đồng Bộ Với CompletableFuture

`CompletableFuture<T>` cung cấp giao diện lập trình hướng hàm (Monadic Future) cho phép kết hợp các pipeline bất đồng bộ mà không rơi vào địa ngục callback.

```java
public CompletableFuture<OrderSummary> processOrderAsync(String orderId) {
    return CompletableFuture.supplyAsync(() -> fetchOrder(orderId), customIoExecutor)
        .thenCompose(order -> CompletableFuture.supplyAsync(() -> enrichCustomer(order), customIoExecutor))
        .thenCombine(
            CompletableFuture.supplyAsync(() -> fetchExchangeRates(), customIoExecutor),
            (order, rates) -> calculateTotal(order, rates)
        )
        .exceptionally(ex -> {
            log.error("Failed to calculate order summary", ex);
            return OrderSummary.empty();
        });
}
```
* `thenApply(Function<T, U>)`: Chuyển đổi giá trị đồng bộ ($T 	o U$).
* `thenCompose(Function<T, CompletableFuture<U>>)`: Làm phẳng (flat-mapping) chuỗi future bất đồng bộ liên tiếp.
* `thenCombine(CompletionStage, BiFunction)`: Chờ cả 2 future chạy song song hoàn tất rồi gộp kết quả.
* Luôn truyền `customIoExecutor` vào các phương thức `*Async` để tránh nghẽn luồng `ForkJoinPool.commonPool()`.

---

## 6. Cuộc Cách Mạng Virtual Threads (Project Loom - Java 21 LTS)

Java 21 chính thức đưa **Virtual Threads (JEP 444)** trở thành chuẩn mực công nghiệp, thay đổi hoàn toàn cách chúng ta viết các ứng dụng I/O concurrent.

### 6.1. Platform Threads vs Virtual Threads
* **Platform Threads (Luồng Hệ Điều Hành):**
  * Tỉ lệ $1:1$ với OS Kernel Thread.
  * Chi phí bộ nhớ lớn: cố định khoảng 1MB call stack cho mỗi luồng.
  * Giới hạn: Một máy chủ thường chỉ chịu được vài nghìn OS threads trước khi sập vì cạn kiệt bộ nhớ hoặc quá tải context switching.
* **Virtual Threads (Luồng Ảo):**
  * Tỉ lệ $M:N$ do JVM tự quản lý hoàn toàn ở User Space.
  * Chi phí bộ nhớ siêu nhẹ: Khởi đầu chỉ vài trăm bytes, lưu trữ trực tiếp trên Java Heap, mở rộng co giãn linh hoạt.
  * Quy mô: Có thể tạo hàng triệu Virtual Threads trên một máy chủ duy nhất!

```text
[ Virtual Thread 1 ]   [ Virtual Thread 2 ]   ...   [ Virtual Thread 1,000,000 ]
         │                      │                               │
         └──────────────────────┼───────────────────────────────┘
                                ▼ (JVM Loom Scheduler)
                   ┌─────────────────────────┐
                   │ Carrier Platform Pool   │ (ForkJoinPool kích thước = số CPU cores)
                   └────────────┬────────────┘
                                │
               ┌────────────────┴────────────────┐
               ▼                                 ▼
      [ OS Kernel Thread 0 ]            [ OS Kernel Thread 1 ]
```

### 6.2. Cơ Chế Tháo Dỡ & Tái Gắn (Mounting / Unmounting)
Khi một Virtual Thread chạy đến một thao tác I/O chặn (ví dụ đọc Socket HTTP, JDBC Query, hoặc `Thread.sleep()`):
1. **Unmount (Tháo dỡ):** JVM bắt giữ trạng thái Call Stack của Virtual Thread bằng cơ chế `Continuation.yield()` và lưu vào Heap.
2. **Giải phóng Carrier Thread:** Luồng nền tảng (Carrier Thread) lập tức được giải phóng để nhận một Virtual Thread khác đang sẵn sàng chạy.
3. **Đăng ký Poller:** Thao tác I/O được uỷ quyền cho cơ chế non-blocking của OS kernel (`epoll` trên Linux, `kqueue` trên macOS).
4. **Mount (Tái gắn):** Khi I/O hoàn tất dữ liệu, kernel gửi thông báo đánh thức, JVM xếp Virtual Thread vào hàng đợi để một Carrier Thread rảnh rỗi tiếp tục chạy tiếp từ đúng điểm đã dừng!

### 6.3. Cạm Bẫy Thread Pinning (Ghim Luồng)
Trong một số tình huống đặc biệt, Virtual Thread **không thể tháo dỡ** khỏi Carrier Thread, dẫn đến việc Carrier Thread bị chiếm giữ và chặn đứng luồng nền tảng. Hiện tượng này gọi là **Thread Pinning**:
1. **Thực thi bên trong khối `synchronized`:** Khi gọi I/O chặn bên trong `synchronized (lock) { socket.read(); }`.
2. **Thực thi mã bản địa (Native Code):** Gọi hàm native qua JNI hoặc Foreign Function API.

> [!TIP]
> **Giải pháp khắc phục Pinning:**
> Thay thế toàn bộ các khối `synchronized` bao bọc tác vụ I/O dài hạn bằng `java.util.concurrent.locks.ReentrantLock`. `ReentrantLock` hỗ trợ tương thích hoàn hảo với cơ chế tháo dỡ của Virtual Threads.

---

## 7. Tổng Kết Kiến Trúc Đồng Thời
* **Tầng sâu:** Luôn ghi nhớ quy tắc `happens-before`, hiểu rõ giới hạn của `volatile` và tránh cạm bẫy Cache Line False Sharing.
* **Tầng cấu trúc:** Sử dụng `ReentrantLock`, `StampedLock`, và các cấu trúc JUC chuyên dụng thay vì lạm dụng `synchronized`.
* **Tầng hệ thống:** Thiết lập ThreadPool giới hạn dung lượng hàng đợi, áp dụng công thức sizing theo đặc thù tác vụ.
* **Thời đại mới:** Đón nhận Virtual Threads trong Java 21 LTS cho toàn bộ tác vụ mạng/I/O để tận hưởng mô hình đồng thời hàng triệu kết nối mà không cần từ bỏ mã lập trình đồng bộ rõ ràng, dễ debug.
