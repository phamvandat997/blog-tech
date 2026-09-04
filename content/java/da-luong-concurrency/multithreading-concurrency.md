---
title: "Đa Luồng & Lập Trình Đồng Thời (Multithreading & Concurrency)"
description: Hướng dẫn chuyên sâu về Concurrency trong Java: vòng đời Thread, Race Condition, Deadlock, từ khoá synchronized & volatile, ReentrantLock, ExecutorService, CompletableFuture và đột phá Virtual Threads trong Java 21.
order: 1
featured: true
tags: [Java, Concurrency, Multithreading, Virtual-Threads, ExecutorService, Locks]
readingMinutes: 18
---

# Đa Luồng & Lập Trình Đồng Thời (Multithreading & Concurrency)

Lập trình đa luồng và đồng thời là nền tảng cốt lõi để xây dựng các hệ thống backend chịu tải cao, tận dụng tối đa sức mạnh của bộ xử lý đa lõi (multi-core CPUs).

---

## 1. Vòng Đời Của Thread & Cách Khởi Tạo Luồng

Trong Java, một Thread trải qua 6 trạng thái trong enum `Thread.State`:
1. **`NEW`:** Thread vừa được khởi tạo, chưa gọi `start()`.
2. **`RUNNABLE`:** Đang chạy hoặc sẵn sàng chờ CPU cấp phát thời gian chạy.
3. **`BLOCKED`:** Chờ lấy khoá monitor (monitor lock) để vào khối `synchronized`.
4. **`WAITING`:** Chờ vô thời hạn tín hiệu từ luồng khác (`wait()`, `join()`).
5. **`TIMED_WAITING`:** Chờ có thời hạn (`sleep(ms)`, `wait(ms)`).
6. **`TERMINATED`:** Đã hoàn thành công việc hoặc bị dừng do lỗi.

### 2 Cách tạo luồng truyền thống:
```java
// Cách 1: Kế thừa lớp Thread
class MyThread extends Thread {
    public void run() { System.out.println("Running..."); }
}

// Cách 2: Triển khai Runnable (Khuyến nghị để tách rời tác vụ khỏi luồng)
Runnable task = () -> System.out.println("Running task...");
new Thread(task).start();
```

---

## 2. Race Condition, Deadlock & Cơ Chế Đồng Bộ Hoá

- **Race Condition (Xung đột dữ liệu):** Xảy ra khi nhiều luồng cùng đọc-ghi một biến dùng chung mà không có cơ chế bảo vệ.
- **`synchronized`:** Đảm bảo chỉ có duy nhất 1 luồng được thực thi một khối mã tại một thời điểm (Mutual Exclusion).
- **`volatile`:** Đảm bảo tính khả kiến (**Visibility**) của biến trên bộ nhớ RAM: mọi luồng luôn đọc giá trị mới nhất từ Main Memory thay vì cache trên CPU core.
- **Deadlock (Khoá chết):** Hai hoặc nhiều luồng cùng chờ tài nguyên mà luồng kia đang giữ. Khắc phục bằng cách luôn yêu cầu khoá theo **thứ tự cố định**.

---

## 3. Quản Lý Luồng Hiện Đại: `ExecutorService` & Thread Pools

Thay vì tự tạo `new Thread(...)` thủ công gây tốn kém bộ nhớ hệ thống, ta sử dụng **Thread Pool**:

```java
// Tạo pool cố định 4 worker threads
try (ExecutorService executor = Executors.newFixedThreadPool(4)) {
    // Nộp tác vụ trả về kết quả qua Callable & Future
    Future<String> future = executor.submit(() -> {
        Thread.sleep(1000);
        return "Kết quả xử lý";
    });

    String result = future.get(); // Chờ và lấy kết quả
    System.out.println(result);
}
```

---

## 4. Xử Lý Bất Đồng Bộ Hiện Đại với `CompletableFuture`

Hỗ trợ lập trình bất đồng bộ không chặn (Non-blocking Asynchronous Pipeline):

```java
CompletableFuture.supplyAsync(() -> fetchUserData())
    .thenApplyAsync(user -> processPayment(user))
    .thenAccept(receipt -> sendEmail(receipt))
    .exceptionally(ex -> {
        System.err.println("Lỗi: " + ex.getMessage());
        return null;
    });
```

---

## 5. Đột Phá Lớn: Virtual Threads (Java 21 LTS - Project Loom)

Trước Java 21, mỗi `java.lang.Thread` ánh xạ 1-1 với một **Platform Thread (OS Thread)**, tốn khoảng 1MB bộ nhớ RAM và bị giới hạn ở vài nghìn luồng.

Từ Java 21, **Virtual Threads** là các luồng siêu nhẹ do chính máy ảo JVM quản lý:
- Tiêu tốn chỉ vài trăm bytes bộ nhớ.
- Khi gặp thao tác I/O chặn (blocking I/O như gọi database, API), JVM tự động ngắt Virtual Thread khỏi OS Thread và gán cho công việc khác.
- Dễ dàng tạo hàng triệu luồng đồng thời theo mô hình "Thread-per-Request":

```java
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    IntStream.range(0, 10_000).forEach(i -> {
        executor.submit(() -> {
            Thread.sleep(Duration.ofSeconds(1));
            return i;
        });
    });
} // Chạy 10,000 tasks cùng lúc cực kỳ mượt mà!
```

---

## 6. Tổng Kết

Làm chủ Concurrency là bước ngoặt đưa bạn trở thành Senior Java Developer có khả năng thiết kế hệ thống phân tán chịu tải cao. Hãy kiểm tra kiến thức qua 20 câu hỏi quiz dưới đây!