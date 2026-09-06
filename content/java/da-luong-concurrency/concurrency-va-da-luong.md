---
layout: chapter

title: "Chương 10: Concurrency và đa luồng"
subtitle: "Concurrency and Multithreading"
exam_objectives:
  - "Tạo cả platform thread lẫn virtual thread. Dùng object Runnable và Callable, quản lý vòng đời thread, và dùng các Executor service cùng concurrent API khác nhau để chạy tác vụ."
  - "Phát triển mã an toàn luồng, dùng cơ chế khoá và concurrent API."
  - "Xử lý collection của Java một cách đồng thời và tận dụng parallel stream."

previous_link: "/ch09.html"
previous_title: "Streams"
next_link: "/ch11.html"
next_title: "The Date/Time API"
answers_link: "/ch10a.html"

description: "Platform thread và virtual thread, deadlock, starvation, livelock, race condition, volatile, atomic, synchronized, Lock, ExecutorService, concurrent collection và parallel stream trong Java 21."
order: 1
phase: "Chương 10"
tags: [Java, OCP, Thread, Virtual Thread, Concurrency, synchronized, Lock, ExecutorService, Parallel Stream]
---

## Giới thiệu về thread

Thread cho phép nhiều luồng thực thi diễn ra đồng thời bên trong một chương trình. Mỗi thread đại diện cho một luồng thực thi riêng, cho phép những phần khác nhau của mã chạy cùng lúc. Bạn có thể hình dung thread như các làn đường trên xa lộ. Cũng như nhiều làn cho phép nhiều xe chạy cùng lúc, nhiều thread cho phép những đoạn mã khác nhau chạy đồng thời trong cùng ứng dụng. Tuy nhiên, cũng như xe ở các làn khác nhau phải phối hợp khi nhập hoặc thoát làn, thread phải phối hợp cẩn thận khi truy cập tài nguyên dùng chung để tránh xung đột.

Trong Java 21 có hai loại thread:
1. **Platform thread:** Đây là thread truyền thống, được ánh xạ trực tiếp tới thread của hệ điều hành.
2. **Virtual thread:** Đây là thread nhẹ do Java Virtual Machine (JVM) quản lý.

Hãy bắt đầu với platform thread — loại đã có từ những ngày đầu của Java.

Để tạo một platform thread mới, bạn kế thừa class `Thread` hoặc implement interface `Runnable`. Khi kế thừa `Thread`, bạn override method `run()` để định nghĩa mã sẽ chạy trong thread mới:

```java
public class MyThread extends Thread {
    public void run() {
        System.out.println("New platform thread is running");
    } 
}
```

Để khởi chạy thread mới, tạo instance của class rồi gọi method `start()` của nó:

```java
MyThread myThread = new MyThread();
myThread.start();
```

Method `start()` khởi tạo một thread mới thực thi mã định nghĩa trong `run()`. Cách khác, bạn tạo thread mới bằng cách implement `Runnable`:

```java
@FunctionalInterface
public interface Runnable {
    public abstract void run();
}
```

Rồi truyền một instance vào constructor của `Thread`:

```java
public class MyRunnable implements Runnable {
    public void run() {
        System.out.println("New platform thread is running");
    }
} 

MyRunnable myRunnable = new MyRunnable();
Thread myThread = new Thread(myRunnable);
myThread.start();
```

Tuy nhiên, trong Java 21 bạn dùng được class `Thread.Builder.OfPlatform` để tạo platform thread. Đây là ví dụ đơn giản:
   
```java
// Create a Runnable task
Runnable task = () -> {
   System.out.println("Platform thread is running");
};

// Create a platform thread using Thread.Builder.OfPlatform
Thread platformThread = Thread.ofPlatform().start(task);

// Wait for the thread to finish
try {
   platformThread.join();
} catch (InterruptedException e) {
   e.printStackTrace();
}
```

Trong ví dụ này:
- Một tác vụ `Runnable` được định nghĩa, chỉ đơn giản in một thông điệp ra console.
- Method `Thread.ofPlatform().start(task)` được dùng để tạo và khởi chạy một platform thread mới với tác vụ đã cho.
- Method `join()` được gọi trên thread để chờ nó chạy xong.

Bạn tuỳ biến được platform thread bằng cách đặt tên, độ ưu tiên và các thuộc tính khác theo mẫu builder. Ví dụ:
   
```java
// Create a Runnable task
Runnable task = () -> {
   System.out.println("Custom platform thread is running");
};

// Create and customize a platform thread
Thread platformThread = Thread.ofPlatform()
                             .name("CustomThread", 0)
                             .priority(Thread.MAX_PRIORITY)
                             .unstarted(task);

// Start the thread
platformThread.start();

// Wait for the thread to finish
try {
   platformThread.join();
} catch (InterruptedException e) {
   e.printStackTrace();
}
```
Trong ví dụ này:
- Method `name("CustomThread", 0)` đặt tên thread thành `"CustomThread"` kèm một số duy nhất nối vào nếu cần.
- Method `priority(Thread.MAX_PRIORITY)` đặt độ ưu tiên của thread ở mức cao nhất.
- Method `unstarted(task)` tạo thread nhưng không khởi chạy ngay. Bạn cần gọi `start()` để bắt đầu thực thi.

Mặt khác, bạn dùng class `Thread.Builder.OfVirtual` để tạo virtual thread:

```java
Thread vThread = Thread.ofVirtual().start(() -> {
    System.out.println("Hello from a virtual thread!");
});
vThread.join();
```

Với platform thread, Java phân biệt thread daemon và không phải daemon. Thread daemon là những thread không ngăn JVM thoát khi chương trình kết thúc. Chúng chạy ở nền và thường dùng cho những tác vụ như thu gom rác, dọn dẹp nền, v.v. JVM tiếp tục chạy chừng nào còn ít nhất một thread không phải daemon đang hoạt động. Thread daemon bị kết thúc khi mọi thread không phải daemon hoàn tất. Để biến một thread thành daemon, gọi method `setDaemon(true)` của nó trước khi khởi chạy:

```java
public class DaemonThreadExample {
    public static void main(String[] args) {
        Thread daemonThread = new Thread(() -> {
            while (true) {
                System.out.println("Daemon thread is running");
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        });

        daemonThread.setDaemon(true);
        daemonThread.start();

        try {
            Thread.sleep(5000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        System.out.println("Main thread exiting");
    }
}
```

Trong ví dụ này, ta tạo một thread daemon bằng lambda expression. Thread daemon chạy trong vòng lặp vô hạn, in một thông điệp mỗi giây. Ta biến nó thành daemon bằng cách gọi `setDaemon(true)` trước khi khởi chạy.

Thread chính ngủ 5 giây rồi tiếp tục thực thi. Khi thread chính (vốn không phải daemon) kết thúc, JVM sẽ tự động kết thúc thread daemon.

Bạn cũng dùng được `Thread.ofPlatform()` để đặt trạng thái daemon:
```java
Thread platformThread = Thread.ofPlatform()
                                      .name("CustomThread", 0)
                                      .daemon(false)
```

Cài đặt mặc định gọi `daemon(boolean)` với giá trị `true`.

Mặt khác, virtual thread **luôn** là thread daemon, nên chúng không ngăn JVM thoát khi chương trình kết thúc.

Một thread đi qua vài trạng thái trong vòng đời của nó:
```
                                   ┌─────────┐
                                   │   NEW   │
                                   └────┬────┘
                                        │
                                        │ start()
                                        │
                                        ▼
                                ┌──────────────┐
                       ┌───────▶│   RUNNABLE   │◀────────┐
                       │        └──────┬───────┘         │
                       │               │                 │
                       │               │ run()           │
                       │               │ completes       │
                       │               ▼                 │
                       │        ┌─────────────┐          │
                       │        │ TERMINATED  │          │
                       │        └─────────────┘          │
                       │                                 │
                       │                                 │
                       │                                 │
                       │        ┌──────────────┐         │
                       │        │   BLOCKED    │◀────────┘
                       │        └───────┬──────┘         │
                       │                │                │
                       │                │ Lock           │
                       │                │ acquired       │
                       │                │                │
                       │                │                │
                       │                ▼                │
                       │        ┌──────────────┐         │
                       └───────▶│   WAITING    │         │
                                └───────┬──────┘         │
                                        │                │
                                        │ interrupt()    │
                                        │ notify()       │
                                        │ notifyAll()    │
                                        │                │
                                        ▼                │
                                ┌───────────────┐        │
                                │ TIMED_WAITING │────────┘
                                └───────────────┘
                                        ▲
                                        │
                                        │
                            sleep()─────┘
                            wait(long)
                            join(long)
                            LockSupport.parkNanos(long)
                            LockSupport.parkUntil(long)
```

Vòng đời này áp dụng cho cả platform thread lẫn virtual thread, dù cách quản lý những trạng thái này bên trong khác nhau giữa hai loại.

Static method `Thread.sleep(long millis)` khiến thread hiện tại tạm dừng thực thi trong số mili-giây đã nêu:

```java
try {
    Thread.sleep(1000); 
} catch (InterruptedException e) {
    // Handle interruption
}
```

Để đánh thức sớm một thread đang ngủ hay đang chờ, bạn gọi method `interrupt()` của nó. Việc này sẽ ném `InterruptedException` trong thread đích, và exception đó phải được xử lý:

```java
public class InterruptExample {
    public static void main(String[] args) {
        Thread thread = Thread.ofVirtual().start(() -> {
            try {
                System.out.println("Thread is going to sleep");
                Thread.sleep(5000);
                System.out.println("Thread woke up");
            } catch (InterruptedException e) {
                System.out.println("Thread was interrupted");
            }
        });

        try {
            Thread.sleep(2000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        thread.interrupt();
                                            
        try {
            // Ensures the virtual thread completes before the main thread exits
            thread.join();
        }  catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}
```

Trong ví dụ này, ta tạo một virtual thread ngủ 5 giây. Thread chính ngủ 2 giây rồi gọi `interrupt()` trên thread kia.

Khi `interrupt()` được gọi, nó đặt trạng thái bị ngắt của thread đích. Nếu thread đích đang ngủ hoặc đang chờ, nó sẽ ném `InterruptedException` ngay lập tức. Thread khi đó xử lý việc bị ngắt cho phù hợp. Ngoài ra, sau khi gọi `thread.interrupt()`, ta gọi `thread.join()` để đảm bảo thread chính chờ virtual thread hoàn tất.

Trong ví dụ, kết quả sẽ là:
```
Thread is going to sleep
Thread was interrupted
```

Giấc ngủ của thread bị ngắt sớm sau 2 giây, và nó bắt `InterruptedException` rồi in một thông điệp.

## Virtual thread

### Đặc điểm của virtual thread

Đặc điểm then chốt của virtual thread là bản chất nhẹ của chúng. Khác platform thread vốn được ánh xạ trực tiếp tới thread của hệ điều hành, virtual thread do JVM quản lý — JVM ánh xạ một lượng lớn virtual thread lên một số nhỏ thread của hệ điều hành.

Khi một virtual thread cần chạy, Java runtime gắn nó vào một thread thông thường (gọi là **carrier thread**). Việc này như cấp cho virtual thread một phương tiện tạm thời để di chuyển.

Hệ điều hành khi đó lập lịch cho platform thread này như bình thường. Trong lúc gắn với carrier, virtual thread thực thi được mã của nó.

Nếu virtual thread cần thực hiện một thao tác có thể mất thời gian, như đọc file hay chờ phản hồi mạng, nó tách khỏi carrier được. Việc này gọi là **unmounting**. Khi điều đó xảy ra, carrier trở nên rảnh và JVM dùng nó để chạy một virtual thread khác.

Tuy nhiên, có những tình huống virtual thread không tách khỏi carrier được. Việc này gọi là bị **pinned** (ghim) vào carrier. Hai kịch bản phổ biến:
1. Khi virtual thread đang dùng khối hoặc method `synchronized`. Chúng dùng để kiểm soát truy cập tài nguyên dùng chung, và cần ở nguyên trên cùng carrier để hoạt động đúng.

2. Khi virtual thread đang chạy mã tương tác trực tiếp với hệ điều hành hay những hàm mức thấp khác (native method hoặc foreign function). Chúng cũng cần ở nguyên trên cùng carrier vì gắn chặt với hệ thống bên dưới.

Trong những tình huống bị ghim, virtual thread phải ở nguyên trên carrier cho tới khi xong những thao tác đặc biệt này. Nghĩa là carrier không dùng được cho virtual thread khác trong khoảng thời gian đó, có thể làm giảm phần nào lợi ích hiệu quả của virtual thread.

Vì lý do này, virtual thread đặc biệt hiệu quả với những tác vụ thiên về I/O. JVM tạm treo được virtual thread và giải phóng platform thread để làm việc khác. Cách này hiệu quả vì thao tác I/O thường liên quan tới việc chờ tài nguyên bên ngoài, trong thời gian đó CPU không bận rộn.

Tuy nhiên, virtual thread không nhằm phục vụ những thao tác nặng CPU kéo dài. Những thao tác này dùng CPU liên tục trong thời gian dài. Khi virtual thread thực hiện tác vụ nặng CPU, nó chiếm dụng liên tục platform thread mà nó đang chạy trên đó. Khi ấy, runtime không có cơ hội tạm treo virtual thread và chuyển platform thread sang việc khác, vì CPU luôn bận với phép tính nặng.

Thêm nữa, virtual thread có độ ưu tiên cố định, không thay đổi được. Lựa chọn thiết kế này đơn giản hoá việc lập lịch cho virtual thread, vì chúng nhằm phục vụ tính song song theo cách trực diện hơn so với platform thread.

Virtual thread mặc định **không có tên**. Method `getName` trả về chuỗi rỗng nếu tên thread chưa được đặt:
```java
// Create a virtual thread without setting its name
Thread virtualThread = Thread.ofVirtual().start(() -> {
    System.out.println("Running in a virtual thread");
});

// Check and print the name of the virtual thread
String threadName = virtualThread.getName();
if (threadName.isEmpty()) {
    System.out.println("The virtual thread has no name.");
} else {
    System.out.println("The virtual thread name is: " + threadName);
}
```

Trong ví dụ này, `virtualThread` được tạo mà không đặt tên, nên gọi `getName` trên nó trả về chuỗi rỗng. Kết quả sẽ là:

```
Running in a virtual thread
The virtual thread has no name.
```

Bạn đặt được tên cho virtual thread bằng method `name` của class `Thread.Builder.OfVirtual`:

```java
// Create a virtual thread with a specific name
Thread virtualThread = Thread.ofVirtual()
    .name("MyVirtualThread")
    .start(() -> {
        System.out.println("Running in a virtual thread");
    });

// Check and print the name of the virtual thread
String threadName = virtualThread.getName();
if (threadName.isEmpty()) {
    System.out.println("The virtual thread has no name.");
} else {
    System.out.println("The virtual thread name is: " + threadName);
}
```

Trong ví dụ này, `virtualThread` được tạo với tên `"MyVirtualThread"` bằng method `name`. Kết quả sẽ là:

```
Running in a virtual thread
The virtual thread name is: MyVirtualThread
```

Một tính năng quan trọng khác của virtual thread là khả năng đơn giản hoá lập trình đồng thời. Với virtual thread, bạn viết được mã trông tuần tự, thẳng thớm mà thực chất chạy đồng thời. Điều này khiến mã dễ đọc và dễ bảo trì hơn, vì bạn không cần quản lý thread pool một cách tường minh hay dùng những mô hình lập trình bất đồng bộ phức tạp.

### Tạo virtual thread

Java 21 giới thiệu vài cách tạo và dùng virtual thread. Hãy khám phá chi tiết những cách này.

Cách chính để tạo virtual thread là dùng method `Thread.ofVirtual()`. Method này trả về một `Thread.Builder` dùng để cấu hình và khởi chạy virtual thread. Đây là ví dụ:

```java
Thread vThread = Thread.ofVirtual().start(() -> {
    System.out.println("Virtual thread is running");
});

try {
    vThread.join();
} catch (InterruptedException e) {
    e.printStackTrace();
}
```

Trong ví dụ này, ta tạo và khởi chạy virtual thread chỉ trong một dòng. Method `start()` nhận một `Runnable` và khởi chạy thread ngay lập tức.

Nếu bạn muốn tạo virtual thread mà không khởi chạy ngay, dùng method `unstarted()`:

```java
Thread vThread = Thread.ofVirtual().unstarted(() -> {
    System.out.println("Virtual thread is running");
});

vThread.start();
try {
    vThread.join();
} catch (InterruptedException e) {
    e.printStackTrace();
}
```

Một cách tiện lợi khác để tạo và khởi chạy virtual thread là `Thread.startVirtualThread(Runnable task)`. Static method này tạo một virtual thread, khởi chạy nó và trả về object `Thread`:

```java
Thread vThread = Thread.startVirtualThread(() -> {
    System.out.println("Virtual thread created with startVirtualThread");
});

try {
    vThread.join();
} catch (InterruptedException e) {
    e.printStackTrace();
}
```

Với những trường hợp cần tạo nhiều virtual thread có cùng cấu hình, bạn dùng `java.util.concurrent.ThreadFactory`. Method `Thread.ofVirtual().factory()` trả về một `ThreadFactory` tạo virtual thread:

```java
ThreadFactory virtualThreadFactory = Thread.ofVirtual().factory();

for (int i = 0; i < 10; i++) {
    Thread vThread = virtualThreadFactory.newThread(() -> {
        System.out.println("Virtual thread " + Thread.currentThread().threadId() + " is running");
    });
    vThread.start();
}
```

Ví dụ này tạo một `ThreadFactory` cho virtual thread rồi dùng nó để tạo và khởi chạy 10 virtual thread.

Bạn cũng tuỳ biến được `ThreadFactory` để đặt tên cho những virtual thread mà nó tạo:

```java
ThreadFactory namedVirtualThreadFactory = Thread.ofVirtual().name("worker-", 0).factory();

for (int i = 0; i < 5; i++) {
    Thread vThread = namedVirtualThreadFactory.newThread(() -> {
        System.out.println(Thread.currentThread().getName() + " is running");
    });
    vThread.start();
}
```

Đoạn này tạo những virtual thread với tên như `worker-0`, `worker-1`, v.v.

Đáng lưu ý rằng dù virtual thread rất nhẹ, chúng không miễn phí. Tạo hàng triệu virtual thread chỉ để chúng kết thúc ngay vẫn là thao tác không hề tầm thường. Trên thực tế, bạn nên tạo virtual thread khi cần cho những tác vụ đồng thời thực sự, thay vì tạo sẵn một lượng khổng lồ từ đầu.

### Virtual thread so với platform thread

Đây là bảng so sánh nhanh virtual thread và platform thread:

| Đặc điểm | Virtual thread | Platform thread |
|----------------|-----------------|-------------------|
| Quản lý     | Do JVM quản lý  | Do hệ điều hành quản lý     |
| Mức dùng tài nguyên | Rất nhẹ | Nặng hơn, bị hệ điều hành giới hạn |
| Khả năng mở rộng    | Tạo được hàng triệu | Thường giới hạn ở hàng nghìn |
| Hành vi khi chặn | Tự động nhường carrier thread | Chặn thread của hệ điều hành |
| Tình huống dùng       | Lý tưởng cho tác vụ thiên về I/O | Tốt hơn cho tác vụ thiên về CPU |
| Kích thước stack     | Co giãn theo nhu cầu | Cố định |
| Biến thread-local | Nên dùng thận trọng | Dùng thoải mái |

Virtual thread toả sáng trong những kịch bản có nhiều tác vụ đồng thời mà phần lớn thời gian là nhàn rỗi. Ví dụ, trong một web server xử lý nhiều kết nối cùng lúc, mỗi kết nối được xử lý bởi một virtual thread riêng. Điều này cho phép viết mã theo phong cách đồng bộ đơn giản mà vẫn mở rộng cực tốt.

Đây là ví dụ minh hoạ khác biệt về khả năng mở rộng:

```java
long start = System.currentTimeMillis();

List<FutureTask<Integer>> tasks = new ArrayList<>();
ThreadFactory threadFactory = Thread.ofVirtual().factory();

for (int i = 0; i < 100_000; i++) {
    int taskId = i;
    FutureTask<Integer> task = new FutureTask<>(() -> {
        Thread.sleep(Duration.ofSeconds(1));
        return taskId;
    });
    tasks.add(task);
    threadFactory.newThread(task).start();
}

for (FutureTask<Integer> task : tasks) {
    task.get();
}

long end = System.currentTimeMillis();
System.out.println("Time taken: " + (end - start) + "ms");
```

Đoạn mã này chạy 100.000 virtual thread, mỗi thread ngủ một giây rồi trả về ID tác vụ của nó. Khi chạy chương trình, tổng thời gian thực thi chưa tới 2 giây:
```
Time taken: 1713ms
```

Nhưng nếu đổi dòng này:
```java
ThreadFactory threadFactory = Thread.ofVirtual().factory();
```

Thành dòng sau để dùng platform thread:
```java
ThreadFactory threadFactory = Thread.ofPlatform().factory();
```

Chương trình cạn tài nguyên. Đây là kết quả:
```
[0.307s][warning][os,thread] Failed to start thread "Unknown thread" - pthread_create failed (EAGAIN) for attributes: stacksize: 1024k, guardsize: 4k, detached.
[0.307s][warning][os,thread] Failed to start the native thread for java.lang.Thread "Thread-2021"
Exception in thread "main" java.lang.OutOfMemoryError: unable to create native thread: possibly out of memory or process/resource limits reached
	at java.base/java.lang.Thread.start0(Native Method)
	at java.base/java.lang.Thread.start(Thread.java:1526)
	at App.main(App.java:42)
```

Tuy nhiên, đáng nói là dù virtual thread mang lại nhiều lợi ích, chúng không thay đổi những nguyên tắc nền tảng của lập trình đồng thời. Bạn vẫn phải đồng bộ hoá đúng cách việc truy cập trạng thái khả biến dùng chung, bất kể bạn dùng virtual thread hay platform thread.

Tiếp theo, hãy xem một số vấn đề phổ biến với thread.

## Các vấn đề với thread

Khi làm việc với thread, cần ý thức về những vấn đề tiềm ẩn phát sinh do bản chất phức tạp của lập trình đồng thời. Những vấn đề này dẫn tới hành vi bất thường, giảm hiệu năng, hoặc thậm chí làm chương trình hỏng hoàn toàn.

Trong bối cảnh lập trình đa luồng, vấn đề bắt đầu xảy ra khi thread mắc kẹt ở trạng thái không tiến triển được, khiến chương trình không đi tiếp. Hãy nói về một số vấn đề phổ biến nhất.

### Deadlock (Bế tắc)

Deadlock xảy ra khi hai hay nhiều thread không tiến triển được vì mỗi thread đang chờ một tài nguyên mà thread khác đang giữ, tạo thành phụ thuộc vòng tròn. Đó là tình huống thread bị chặn vĩnh viễn, chờ nhau giải phóng tài nguyên cần thiết.

Hãy tưởng tượng hai người bạn, Anne và Joe, mỗi người đang cố băng qua một cây cầu hẹp từ hai đầu ngược nhau. Cầu hẹp tới mức chỉ một người qua được mỗi lần. Anne bắt đầu đi từ một đầu, Joe đi từ đầu kia. Khi gặp nhau ở giữa, không ai đi tiếp được, cũng không ai lùi lại được vì không có chỗ quay đầu. Họ mắc kẹt ở tình huống không ai tiến cũng không ai lùi. Tình huống bế tắc này chặn đứng tiến trình của họ, giống hệt cách deadlock trong Java chặn việc thực thi của những thread đang chờ nhau giải phóng tài nguyên.

Trong lập trình đa luồng, tài nguyên thường là lock hay các cơ chế đồng bộ khác dùng để kiểm soát truy cập dữ liệu dùng chung. Deadlock xảy ra khi bốn điều kiện sau đồng thời được thoả mãn:

1. **Loại trừ tương hỗ (Mutual Exclusion):** Ít nhất một tài nguyên phải được giữ ở chế độ không chia sẻ, nghĩa là chỉ một thread dùng được tài nguyên đó tại một thời điểm.

2. **Giữ và chờ (Hold and Wait):** Một thread phải đang giữ ít nhất một tài nguyên trong khi chờ để giành thêm tài nguyên do thread khác giữ.

3. **Không trưng dụng (No Preemption):** Tài nguyên không bị lấy đi bằng vũ lực khỏi thread; chúng phải được thread đang giữ tự nguyện giải phóng.

4. **Chờ vòng tròn (Circular Wait):** Phải tồn tại một chuỗi vòng gồm hai hay nhiều thread, mỗi thread chờ tài nguyên do thread kế tiếp trong chuỗi giữ.

Xét class minh hoạ phép so sánh về deadlock:

```java
public class DeadlockExample {
    private static final Object narrowBridgePart1 = new Object();
    private static final Object narrowBridgePart2 = new Object();

    public static void main(String[] args) {
        Runnable anneTask = () -> {
            synchronized (narrowBridgePart1) {
                System.out.println("Anne: Holding part 1 of the bridge...");
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                System.out.println("Anne: Waiting for part 2 of the bridge...");
                synchronized (narrowBridgePart2) {
                    System.out.println("Anne: Holding part 1 and part 2 of the bridge...");
                }
            }
        };

        Runnable joeTask = () -> {
            synchronized (narrowBridgePart2) {
                System.out.println("Joe: Holding part 2 of the bridge...");
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                System.out.println("Joe: Waiting for part 1 of the bridge...");
                synchronized (narrowBridgePart1) {
                    System.out.println("Joe: Holding part 1 and part 2 of the bridge...");
                }
            }
        };

        // Create and start Anne's thread
        Thread.ofPlatform().start(anneTask);

        // Create and start Joe's thread
        Thread.ofPlatform().start(joeTask);
    }
}
```

Trong ví dụ này, ta có hai thread `Anne` và `Joe`, cùng hai lock `narrowBridgePart1` và `narrowBridgePart2`. Chương trình rơi vào deadlock khi trình tự sự kiện sau xảy ra:

1. `Anne` giành `narrowBridgePart1` và vào khối synchronized đầu tiên.

2. `Joe` giành `narrowBridgePart2` và vào khối synchronized đầu tiên.

3. `Anne` cố giành `narrowBridgePart2` ở khối synchronized thứ hai nhưng bị chặn vì `narrowBridgePart2` đang do `Joe` giữ.

4. `Joe` cố giành `narrowBridgePart1` ở khối synchronized thứ hai nhưng bị chặn vì `narrowBridgePart1` đang do `Anne` giữ.

Tại thời điểm này, cả hai thread đều chờ nhau giải phóng phần cầu mà mình đang giữ, dẫn tới deadlock. Anne và Joe mắc kẹt giữa cầu, không tiến cũng không lùi được — hệt như các thread trong tình huống deadlock của Java. Chương trình sẽ treo vô thời hạn, không thread nào tiến triển được.

Để tránh deadlock, cần tuân theo những thực hành tốt như:

- **Giành lock theo thứ tự nhất quán:** Nếu cần giành nhiều lock, mọi thread nên giành chúng theo cùng một thứ tự để tránh điều kiện chờ vòng tròn.

- **Cơ chế timeout:** Dùng cơ chế timeout khi cố giành lock, để thread không chờ vô thời hạn nếu không giành được lock.

- **Sắp thứ tự tài nguyên:** Gán thứ tự số cho tài nguyên và đảm bảo thread giành tài nguyên theo thứ tự tăng dần để ngăn chờ vòng tròn.

- **Độ mịn của lock:** Dùng lock mịn khi có thể, chỉ khoá những đoạn mã cần thiết để giảm khả năng tranh chấp và deadlock.

### Starvation (Bỏ đói)

Starvation xảy ra khi một thread liên tục bị từ chối truy cập tài nguyên dùng chung, khiến nó không tiến triển được. Nói cách khác, thread bị *bỏ đói* những tài nguyên cần thiết để hoàn thành nhiệm vụ. Starvation xảy ra khi những thread khác liên tục giành tài nguyên dùng chung, khiến thread bị bỏ đói phải chờ vô thời hạn.

Hãy nghĩ tới cảnh một nhóm người xếp hàng mua vé cho buổi hoà nhạc đông khách. Nếu ai đó liên tục chen ngang, hoặc người bán vé chỉ phục vụ một nhóm nhất định, sẽ có người không bao giờ có cơ hội mua vé. Họ về cơ bản bị bỏ đói cơ hội mua hàng.

Trong chương trình đa luồng, starvation thường phát sinh khi thread được gán độ ưu tiên khác nhau. Java gán độ ưu tiên cho thread từ 1 (thấp nhất) tới 10 (cao nhất), với 5 là mặc định. Khi những thread ưu tiên cao liên tục được ưu ái hơn thread ưu tiên thấp, thread ưu tiên thấp có thể bị bỏ đói.

Hãy xem class minh hoạ phép so sánh về vé hoà nhạc:

```java
public class ConcertTicketStarvationExample {
    private static final Object ticketSeller = new Object();

    public static void main(String[] args) {
        Runnable impatientFanTask = () -> {
            while (true) {
                synchronized (ticketSeller) {
                    System.out.println("Impatient Fan: Bought a ticket");
                    // Simulate buying a ticket
                }
            }
        };

        Runnable patientFanTask = () -> {
            while (true) {
                synchronized (ticketSeller) {
                    System.out.println("Patient Fan: Bought a ticket");
                    // Simulate buying a ticket
                }
            }
        };

        // Create and start the impatient fan thread with MAX_PRIORITY
        Thread impatientFan = Thread.ofPlatform()
                                .priority(Thread.MAX_PRIORITY)
                                .start(impatientFanTask);

        // Create and start the patient fan thread with MIN_PRIORITY
        Thread patientFan = Thread.ofPlatform()
                                .priority(Thread.MIN_PRIORITY)
                                .start(patientFanTask);
    }
}
```

Trong ví dụ này, ta có hai thread `impatientFan` và `patientFan` cùng tranh giành một object lock là `ticketSeller`. Hai thread được gán độ ưu tiên khác nhau: `impatientFan` có độ ưu tiên tối đa (10), còn `patientFan` có độ ưu tiên tối thiểu (1).

Khi chương trình chạy, `impatientFan` với độ ưu tiên cao hơn nhiều khả năng sẽ giành lock thường xuyên hơn `patientFan`. Kết quả là `patientFan` có thể bị bỏ đói, chờ mãi tới lượt truy cập tài nguyên dùng chung. Kết quả chương trình có thể cho thấy `impatientFan` giành lock liên tục, còn `patientFan` không có nhiều cơ hội chạy như `impatientFan`.

Cần lưu ý rằng độ ưu tiên thread không được đảm bảo là Java Virtual Machine (JVM) sẽ tuân thủ nghiêm ngặt. Bộ lập lịch thread của JVM dùng độ ưu tiên như một gợi ý khi ra quyết định lập lịch, nhưng không phải lúc nào cũng tuân theo. Dù vậy, gán độ ưu tiên hợp lý cho thread vẫn giúp giảm rủi ro bỏ đói.

Để giảm thiểu starvation, hãy cân nhắc những cách sau:

- **Lập lịch công bằng:** Dùng cơ chế lập lịch công bằng như fair lock hay semaphore, đảm bảo thread được cấp quyền truy cập tài nguyên dùng chung theo đúng thứ tự yêu cầu.

- **Tránh tác vụ chạy dài:** Chia nhỏ tác vụ chạy dài thành những đơn vị công việc nhỏ hơn, cho phép thread khác có cơ hội chạy xen kẽ.

- **Điều chỉnh độ ưu tiên thread:** Gán độ ưu tiên phù hợp cho thread dựa trên tầm quan trọng và nhu cầu tài nguyên. Tuy nhiên hãy thận trọng khi thao tác với độ ưu tiên, vì nó dẫn tới hành vi phức tạp và khó đoán.

- **Cơ chế timeout:** Cài đặt cơ chế timeout cho phép thread từ bỏ việc chờ tài nguyên nếu đã chờ quá lâu.

### Livelock (Bế tắc sống)

Livelock xảy ra khi hai hay nhiều thread liên tục phản ứng với hành động của nhau nhưng không tiến triển được. Khác deadlock — nơi thread mắc kẹt ở trạng thái chờ — thread trong livelock liên tục đổi trạng thái để đáp lại hành động của thread khác. Tuy nhiên, dù hoạt động liên tục, không có tiến triển thực nào hướng tới việc hoàn thành nhiệm vụ.

Hãy tưởng tượng cảnh hai vợ chồng ngồi bên bàn ăn chỉ có một chiếc thìa để chia nhau. Cả hai đều cực kỳ lịch sự và khăng khăng người kia ăn trước. Người chồng cầm thìa, mời vợ, nhưng vợ từ chối và bảo chồng ăn trước. Cuộc nhường qua nhường lại này tiếp diễn vô tận, và không ai ăn được vì họ cứ mời thìa cho nhau.

Trong lập trình đa luồng, livelock thường xảy ra khi thread liên tục nhường nhau mà không tạo ra tiến triển thực nào. Livelock cũng xảy ra khi thread cứ thử lại một thao tác liên tục thất bại do hành động của thread khác.

Xét chương trình sau:

```java
public class LivelockExample {

    static class Spoon {
        private Diner owner;

        public Spoon(Diner d) {
            owner = d;
        }

        public Diner getOwner() {
            return owner;
        }

        public synchronized void setOwner(Diner d) {
            owner = d;
        }

        public synchronized void use() {
            System.out.println(owner.name + " is eating.");
        }
    }

    static class Diner {
        private String name;
        private boolean isHungry;

        public Diner(String n) {
            name = n;
            isHungry = true;
        }

        public String getName() {
            return name;
        }

        public boolean isHungry() {
            return isHungry;
        }

        public void eatWith(Spoon spoon, Diner spouse) {
            while (isHungry) {
                if (spoon.getOwner() != this) {
                    try {
                        Thread.sleep(1); // wait for the spoon to be free
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                    continue;
                }

                if (spouse.isHungry()) {
                    System.out.println(name + ": " + spouse.getName() + " you eat first.");
                    spoon.setOwner(spouse);
                    continue;
                }

                spoon.use();
                isHungry = false;
                System.out.println(name + ": I am done eating.");
                spoon.setOwner(spouse);
            }
        }
    }

    public static void main(String[] args) {
        Diner husband = new Diner("Husband");
        Diner wife = new Diner("Wife");

        Spoon spoon = new Spoon(husband);

        Thread husbandThread = 
            Thread.ofPlatform().start(() -> husband.eatWith(spoon, wife));
        Thread wifeThread = 
            Thread.ofPlatform().start(() -> wife.eatWith(spoon, husband));
    }
}
```

Chương trình này khá phức tạp, nên hãy đi qua từng bước.

Trước hết, ta có class `Spoon`:

```java
static class Spoon {
    private Diner owner;

    public Spoon(Diner d) {
        owner = d;
    }

    public Diner getOwner() {
        return owner;
    }

    public synchronized void setOwner(Diner d) {
        owner = d;
    }

    public synchronized void use() {
        System.out.println(owner.name + " is eating.");
    }
}
```

Hãy xem chiếc thìa như một tài nguyên dùng chung. Class này theo dõi ai đang giữ thìa. Nó có vài method:

- Một constructor để đặt chủ sở hữu ban đầu của thìa.

- `getOwner()` để biết ai đang giữ thìa.

- `setOwner(Diner d)` để đổi chủ sở hữu của thìa.

- `use()` để mô phỏng hành động dùng thìa ăn, chỉ in một thông điệp.

Tiếp theo là class `Diner`:

```java
static class Diner {
    private String name;
    private boolean isHungry;

    public Diner(String n) {
        name = n;
        isHungry = true;
    }

    public String getName() {
        return name;
    }

    public boolean isHungry() {
        return isHungry;
    }

    public void eatWith(Spoon spoon, Diner spouse) {
        while (isHungry) {
            if (spoon.getOwner() != this) {
                try {
                    Thread.sleep(1); // wait for the spoon to be free
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                continue;
            }

            if (spouse.isHungry()) {
                System.out.println(name + ": " + spouse.getName() + " you eat first.");
                spoon.setOwner(spouse);
                continue;
            }

            spoon.use();
            isHungry = false;
            System.out.println(name + ": I am done eating.");
            spoon.setOwner(spouse);
        }
    }
}
```

Nó đại diện cho mỗi người muốn ăn. Mỗi thực khách có tên và một cờ cho biết họ có đói không. Phần then chốt của class này là method `eatWith`, nơi livelock xảy ra. Method này làm những việc sau:

1. Kiểm tra thực khách có đang giữ thìa không.

2. Nếu không, họ chờ một chút rồi kiểm tra lại.

3. Nếu có, họ kiểm tra người bạn đời có đói không.

4. Nếu bạn đời đói, họ mời thìa cho bạn đời rồi chờ.

5. Nếu bạn đời không đói, họ dùng thìa ăn rồi hết đói.

Trong method `main`, ta tạo hai object `Diner`: husband và wife. Ta cũng tạo một object `Spoon` và giao nó cho husband lúc đầu. Rồi ta khởi chạy hai thread, mỗi thread cho một thực khách. Mỗi thread chạy method `eatWith` cho thực khách tương ứng, cố dùng thìa:

```java
public static void main(String[] args) {
    Diner husband = new Diner("Husband");
    Diner wife = new Diner("Wife");

    Spoon spoon = new Spoon(husband);

    Thread husbandThread = 
        Thread.ofPlatform().start(() -> husband.eatWith(spoon, wife));
    Thread wifeThread = 
        Thread.ofPlatform().start(() -> wife.eatWith(spoon, husband));
}
```

Khi chương trình chạy, cả chồng lẫn vợ đều cố ăn bằng chiếc thìa. Đây là diễn biến từng bước:

1. Người chồng bắt đầu với chiếc thìa.

2. Người chồng kiểm tra vợ có đói không (có), nên anh mời thìa cho vợ.

3. Người vợ giờ giữ thìa. Cô kiểm tra chồng có đói không (có), nên cô mời thìa lại cho chồng.

4. Quá trình này lặp lại vô tận, cả chồng lẫn vợ liên tục mời thìa cho nhau mà không ai ăn được.

Việc qua lại liên tục mà không tiến triển này chính là livelock. Cả hai thread (chồng và vợ) đều hoạt động và liên tục đổi trạng thái, nhưng không thể tiến tới việc ăn vì họ cứ nhường nhau.

Để giải quyết livelock, hãy cân nhắc những cách sau:

- **Lùi ngẫu nhiên (randomized backoff):** Đưa yếu tố ngẫu nhiên vào cơ chế nhường. Thay vì nhường ngay, thread chờ một khoảng thời gian ngẫu nhiên rồi mới thử lại. Điều này giảm khả năng thread liên tục nhường nhau một cách đồng bộ.

- **Sắp thứ tự tài nguyên:** Gán thứ tự cụ thể cho tài nguyên hay điều kiện mà thread đang chờ. Đảm bảo thread giành tài nguyên hoặc kiểm tra điều kiện theo thứ tự nhất quán để tránh phụ thuộc vòng tròn.

- **Cơ chế timeout:** Cài đặt cơ chế timeout cho phép thread từ bỏ việc chờ và thực hiện hành động thay thế nếu đã chờ quá lâu. Điều này ngăn thread nhường nhau vô thời hạn.

- **Chiến lược khoá:** Dùng chiến lược khoá phù hợp, như read-write lock hay lock mịn, để giảm tranh chấp và giảm khả năng livelock.

### Race condition (Điều kiện tranh đua)

Race condition xảy ra khi nhiều thread truy cập dữ liệu dùng chung một cách đồng thời, và kết quả cuối phụ thuộc vào thời điểm tương đối của việc thực thi. Nói cách khác, hành vi chương trình trở nên khó đoán và không nhất quán vì các thread *chạy đua* với nhau để thao tác trên dữ liệu dùng chung. Race condition dẫn tới kết quả sai, hỏng dữ liệu và hành vi chương trình bất thường.

Hãy tưởng tượng cảnh hai người, Anne và Joe, có chung một tài khoản ngân hàng. Cả hai độc lập quyết định rút tiền ở ATM cùng lúc. Giả sử tài khoản ban đầu có 100 đô. Anne cố rút 50 đô, còn Joe cố rút 70 đô. Nếu ATM xử lý hai yêu cầu đồng thời mà không đồng bộ hoá đúng cách, kết quả trở nên khó đoán. Số dư cuối có thể là 50 đô, 30 đô, hoặc thậm chí âm 20 đô, tuỳ theo thứ tự xử lý các lệnh rút.

Trong chương trình đa luồng, race condition thường phát sinh khi nhiều thread truy cập biến hay tài nguyên dùng chung mà không có cơ chế đồng bộ phù hợp. Các thread có thể đọc và ghi dữ liệu dùng chung cùng lúc, dẫn tới kết quả không nhất quán hoặc ngoài dự kiến.

Class sau mô phỏng race condition mô tả trong phép so sánh trên:

```java
public class BankAccount {
    private int balance;

    public BankAccount(int initialBalance) {
        this.balance = initialBalance;
    }

    public void withdraw(String name, int amount) {
        if (balance >= amount) {
            System.out.println(name + " is going to withdraw " + amount);
            try {
                // Simulate the time taken to process withdrawal
                Thread.sleep(100);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            balance -= amount;
            System.out.println(name + " completed the withdrawal of " + amount);
        } else {
            System.out.println(name + " tried to withdraw " + amount + " but insufficient balance.");
        }
        System.out.println("Current balance: " + balance);
    }

    public static void main(String[] args) {
        BankAccount account = new BankAccount(100);

        Runnable anneWithdrawal = () -> {
            account.withdraw("Anne", 50);
        };

        Runnable joeWithdrawal = () -> {
            account.withdraw("Joe", 70);
        };

        Thread anneThread = Thread.ofPlatform().unstarted(anneWithdrawal);
        Thread joeThread = Thread.ofPlatform().unstarted(joeWithdrawal);

        anneThread.start();
        joeThread.start();

        try {
            anneThread.join();
            joeThread.join();
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        System.out.println("Final balance: " + account.balance);
    }
}
```

Class này dùng thread để biểu diễn Anne và Joe rút tiền từ tài khoản ngân hàng dùng chung:
1. Class `BankAccount` có số dư mà cả Anne lẫn Joe đều cố rút từ đó.

2. Method `withdraw` kiểm tra có đủ số dư không, mô phỏng thời gian xử lý bằng `Thread.sleep(100)`, rồi trừ số tiền khỏi số dư.

3. Method `main` tạo một instance `BankAccount` với số dư ban đầu 100 đô.

4. Nó định nghĩa hai tác vụ `Runnable` cho Anne và Joe, mỗi người cố rút tiền.

5. Hai thread được tạo và khởi chạy để mô phỏng việc rút tiền đồng thời.

6. Method `join` đảm bảo thread chính chờ cả hai thao tác rút hoàn tất trước khi in số dư cuối.

Chạy đoạn mã này nhiều lần có thể cho ra số dư cuối âm, minh hoạ race condition do truy cập biến `balance` dùng chung mà không đồng bộ.

Để ngăn race condition, cần dùng những cơ chế đồng bộ đảm bảo quyền truy cập độc quyền vào tài nguyên dùng chung. Một số kỹ thuật phổ biến:

- **Lock**: Dùng object lock như `ReentrantLock` (từ `java.util.concurrent.locks`) hoặc khối `synchronized` để đảm bảo chỉ một thread truy cập tài nguyên dùng chung tại một thời điểm.

- **Biến atomic**: Dùng biến atomic như `AtomicInteger`, cung cấp thao tác an toàn luồng để đọc và ghi biến dùng chung.

- **Cấu trúc dữ liệu đồng thời**: Tận dụng những cấu trúc dữ liệu an toàn luồng từ package `java.util.concurrent`, như `ConcurrentHashMap` hay `CopyOnWriteArrayList`, vốn được thiết kế để xử lý truy cập đồng thời.

- **Nguyên thuỷ đồng bộ**: Dùng những nguyên thuỷ đồng bộ như semaphore, barrier hay latch để điều phối việc thực thi thread và truy cập tài nguyên dùng chung.

Cần lưu ý rằng dù đồng bộ hoá là cần thiết để ngăn race condition, đồng bộ hoá quá mức dẫn tới chi phí hiệu năng và những vấn đề về tính sống (liveness) như deadlock. Do đó cần cân bằng, chỉ đồng bộ khi cần thiết, dùng lock mịn và thu hẹp phạm vi vùng synchronized.

Nói chung, việc nhận diện và giải quyết vấn đề đa luồng đòi hỏi phân tích cẩn thận và hiểu rõ hành vi của chương trình. Bằng cách ý thức về những vấn đề như deadlock, starvation, livelock và race condition, bạn thiết kế và cài đặt được mã an toàn luồng trong chương trình đồng thời.

Ở phần tiếp theo, chúng ta sẽ khám phá những kỹ thuật đồng bộ hoá truy cập tài nguyên dùng chung và điều phối việc thực thi thread để ngăn những vấn đề phổ biến này.

## Viết mã an toàn luồng

Khi phát triển ứng dụng đa luồng, cần đảm bảo mã là an toàn luồng (thread-safe).

**Thread-safety** là tính chất của một chương trình hay đoạn mã đảm bảo nó thực thi đúng trong môi trường đa luồng. Mã an toàn luồng đảm bảo dữ liệu dùng chung giữ được tính nhất quán và chương trình cho ra kết quả như mong đợi, bất kể việc thực thi các thread đan xen hay xảy ra vào thời điểm nào.

Để đạt được thread-safety, ta cần giải quyết hai mối quan tâm chính:
1. **Khả năng nhìn thấy dữ liệu (Data Visibility):** Đảm bảo những thay đổi do một thread thực hiện được các thread khác nhìn thấy.

2. **Tính nhất quán dữ liệu (Data Consistency):** Duy trì tính toàn vẹn và đúng đắn của dữ liệu dùng chung khi nhiều thread truy cập và sửa đổi nó đồng thời.

Java cung cấp vài cơ chế để giải quyết những mối quan tâm này và hỗ trợ lập trình an toàn luồng:
```
┌───────────────────────────────────────────────────────────┐
│             Thread-Safety Mechanisms                      │
│                                                           │
│  ┌─────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │  volatile   │    │   Atomic     │    │ synchronized │  │
│  │             │    │   Classes    │    │              │  │
│  │ Visibility  │    │ Atomicity of │    │  Exclusivity │  │
│  │ guarantee   │    │  operations  │    │ of execution │  │
│  └─────────────┘    └──────────────┘    └──────────────┘  │
│                                                           │
│  ┌─────────────┐    ┌───────────────┐    ┌─────────────┐  │
│  │    Lock     │    │   Cyclic      │    │  Concurrent │  │
│  │  Interface  │    │   Barrier     │    │ Collections │  │
│  │             │    │               │    │             │  │
│  │ Fine-grained│    │Synchronization│    │ Thread-safe │  │
│  │   control   │    │     point     │    │ data struct │  │
│  └─────────────┘    └───────────────┘    └─────────────┘  │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

Hãy khám phá chúng chi tiết hơn.

### Truy cập dữ liệu với `volatile`

Keyword `volatile` trong Java dùng để chỉ ra rằng một biến có thể bị nhiều thread sửa đổi đồng thời. Khi một biến được khai báo `volatile`, nó đảm bảo mọi thao tác ghi lên biến đó lập tức được các thread khác nhìn thấy, và mọi lần đọc sau đó luôn thấy giá trị mới nhất.

Đây là ví dụ:

```java
public class VolatileExample {
    private static volatile boolean flag = false;

    public static void main(String[] args) {
        Thread thread1 = Thread.ofVirtual().unstarted(() -> {
            while (!flag) {
                // Wait for the flag to become true
            }
            System.out.println("Thread 1 finished");
        });

        Thread thread2 = Thread.ofVirtual().unstarted(() -> {
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            flag = true;
            System.out.println("Thread 2 set the flag");
        });

        thread1.start();
        thread2.start();

        try {
            thread1.join();
            thread2.join();
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}
```

Trong ví dụ này, ta có biến `volatile` tên `flag`. `thread1` liên tục kiểm tra giá trị của `flag` và chờ nó thành `true`. `thread2` ngủ một giây rồi đặt `flag` thành `true`.

Bằng cách khai báo `flag` là `volatile`, ta đảm bảo khi `thread2` sửa giá trị của nó, thay đổi lập tức được `thread1` nhìn thấy. Điều này đảm bảo `thread1` sẽ thấy giá trị cập nhật và thoát khỏi vòng lặp chờ.

Tuy nhiên, cần lưu ý rằng `volatile` **chỉ** đảm bảo khả năng nhìn thấy chứ không cung cấp tính nguyên tử hay loại trừ tương hỗ. Nếu nhiều thread thực hiện thao tác ghép (như đọc-sửa-ghi) trên một biến `volatile` đồng thời, race condition vẫn xảy ra được. Trong những trường hợp đó cần thêm cơ chế đồng bộ khác.

### Bảo vệ dữ liệu với các class atomic

Java cung cấp một tập class atomic trong package `java.util.concurrent.atomic`, cho phép thao tác an toàn luồng trên từng biến đơn lẻ. Những class này đảm bảo các thao tác thực hiện trên biến là nguyên tử, nghĩa là chúng được thực thi như một đơn vị công việc duy nhất, không thể chia cắt.

Một số class atomic thường dùng:
- `AtomicBoolean`: Cung cấp thao tác nguyên tử trên giá trị boolean.

- `AtomicInteger`: Cung cấp thao tác nguyên tử trên giá trị số nguyên.

- `AtomicLong`: Cung cấp thao tác nguyên tử trên giá trị long.

- `AtomicReference<V>`: Cung cấp thao tác nguyên tử trên tham chiếu object kiểu `V`.

Đây là ví dụ dùng `AtomicInteger`:

```java
import java.util.concurrent.atomic.AtomicInteger;

public class AtomicExample {
    private static AtomicInteger count = new AtomicInteger(0);

    public static void main(String[] args) throws InterruptedException {
        Thread thread1 = Thread.ofPlatform().start(() -> {
            for (int i = 0; i < 1000; i++) {
                count.incrementAndGet();
            }
        });

        Thread thread2 = Thread.ofPlatform().start(() -> {
            for (int i = 0; i < 1000; i++) {
                count.incrementAndGet();
            }
        });

        thread1.join();
        thread2.join();

        System.out.println("Final count: " + count.get());
    }
}
```

Trong ví dụ này, ta có hai thread, mỗi thread tăng biến `count` 1000 lần. Biến `count` là instance của `AtomicInteger`, cung cấp thao tác an toàn luồng để tăng và lấy giá trị.

Bằng cách dùng `AtomicInteger`, ta đảm bảo thao tác tăng được thực hiện một cách nguyên tử, tránh race condition. Method `incrementAndGet()` tăng giá trị một cách nguyên tử và trả về giá trị đã cập nhật. Method `get()` lấy giá trị hiện tại của `AtomicInteger`.

Các class atomic cung cấp nhiều method để thực hiện thao tác an toàn luồng trên biến. Một số method thường dùng:
- `get()`: Trả về giá trị hiện tại.

- `set(type newValue)`: Đặt giá trị thành `newValue`.

- `getAndSet(type newValue)`: Đặt giá trị thành `newValue` và trả về giá trị trước đó.

- `incrementAndGet()`: Tăng giá trị lên một cách nguyên tử và trả về giá trị đã cập nhật.

- `getAndIncrement()`: Tăng giá trị lên một cách nguyên tử và trả về giá trị trước đó.

- `decrementAndGet()`: Giảm giá trị đi một cách nguyên tử và trả về giá trị đã cập nhật.

- `getAndDecrement()`: Giảm giá trị đi một cách nguyên tử và trả về giá trị trước đó.

Đây là ví dụ minh hoạ cách dùng những method này:

```java
import java.util.concurrent.atomic.AtomicInteger;

public class AtomicMethodsExample {
    private static AtomicInteger value = new AtomicInteger(0);

    public static void main(String[] args) {
        // get(): Returns the current value
        int currentValue = value.get();
        System.out.println("Current value: " + currentValue);

        // set(type newValue): Sets the value to newValue
        value.set(10);
        System.out.println("Value after set(10): " + value.get());

        // getAndSet(type newValue): Sets the value to newValue and returns the previous value
        int previousValue = value.getAndSet(20);
        System.out.println("Previous value: " + previousValue);
        System.out.println("Value after getAndSet(20): " + value.get());

        // incrementAndGet(): Atomically increments the value by one and returns the updated value
        int incrementedValue = value.incrementAndGet();
        System.out.println("Value after incrementAndGet(): " + incrementedValue);

        // getAndIncrement(): Atomically increments the value by one and returns the previous value
        previousValue = value.getAndIncrement();
        System.out.println("Previous value: " + previousValue);
        System.out.println("Value after getAndIncrement(): " + value.get());

        // decrementAndGet(): Atomically decrements the value by one and returns the updated value
        int decrementedValue = value.decrementAndGet();
        System.out.println("Value after decrementAndGet(): " + decrementedValue);

        // getAndDecrement(): Atomically decrements the value by one and returns the previous value
        previousValue = value.getAndDecrement();
        System.out.println("Previous value: " + previousValue);
        System.out.println("Value after getAndDecrement(): " + value.get());
    }
}
```

Đây là kết quả của chương trình:
```
Current value: 0
Value after set(10): 10
Previous value: 10
Value after getAndSet(20): 20
Value after incrementAndGet(): 21
Previous value: 21
Value after getAndIncrement(): 22
Value after decrementAndGet(): 21
Previous value: 21
Value after getAndDecrement(): 20
```

Ví dụ này minh hoạ cách dùng các method mà class `AtomicInteger` cung cấp:

1. `get()`: Lấy giá trị hiện tại của `AtomicInteger` bằng `get()` rồi in ra.

2. `set(type newValue)`: Đặt giá trị của `AtomicInteger` thành 10 bằng `set(10)` rồi in giá trị đã cập nhật.

3. `getAndSet(type newValue)`: Đặt giá trị thành 20 bằng `getAndSet(20)`. Method này trả về giá trị trước đó, ta lưu vào biến `previousValue` rồi in ra. Ta cũng in giá trị đã cập nhật sau thao tác.

4. `incrementAndGet()`: Tăng giá trị lên một cách nguyên tử bằng `incrementAndGet()`. Method này trả về giá trị sau khi tăng, ta lưu vào biến `incrementedValue` rồi in ra.

5. `getAndIncrement()`: Tăng giá trị lên một cách nguyên tử bằng `getAndIncrement()`. Method này trả về giá trị **trước** khi tăng, ta lưu vào `previousValue` rồi in ra. Ta cũng in giá trị sau thao tác.

6. `decrementAndGet()`: Giảm giá trị đi một cách nguyên tử bằng `decrementAndGet()`. Method này trả về giá trị sau khi giảm, ta lưu vào `decrementedValue` rồi in ra.

7. `getAndDecrement()`: Giảm giá trị đi một cách nguyên tử bằng `getAndDecrement()`. Method này trả về giá trị trước khi giảm, ta lưu vào `previousValue` rồi in ra. Ta cũng in giá trị sau thao tác.

Bạn dùng được những method tương tự cho các class atomic khác như `AtomicLong`, `AtomicBoolean`, v.v., tuỳ theo kiểu biến bạn cần làm việc.

### Khối synchronized

Trong Java, keyword `synchronized` dùng để đạt loại trừ tương hỗ và đồng bộ hoá truy cập tài nguyên dùng chung. Khi một khối mã được đánh dấu `synchronized`, chỉ một thread thực thi khối đó tại một thời điểm, trong khi các thread khác cố vào khối `synchronized` sẽ bị chặn cho tới khi lock được giải phóng.

Cú pháp chung của khối `synchronized` như sau:

```java
synchronized (lockObject) {
    // Code block that requires synchronization
}
```

Ở đây, `lockObject` là object đóng vai trò lock. Thread vào khối `synchronized` phải giành được lock trên `lockObject` trước khi chạy mã bên trong khối. Khi thread thoát khỏi khối `synchronized`, nó tự động giải phóng lock, cho phép thread khác giành lấy và vào khối.

Đây là ví dụ minh hoạ cách dùng khối `synchronized`:

```java
public class SynchronizedExample {
    private static int count = 0;
    private static final Object lock = new Object();

    public static void increment() {
        synchronized (lock) {
            count++;
        }
    }

    public static void main(String[] args) throws InterruptedException {
        Thread thread1 = Thread.ofPlatform().start(() -> {
            for (int i = 0; i < 1000; i++) {
                increment();
            }
        });

        Thread thread2 = Thread.ofPlatform().start(() -> {
            for (int i = 0; i < 1000; i++) {
                increment();
            }
        });

        thread1.join();
        thread2.join();

        System.out.println("Final count: " + count);
    }
}
```

Trong ví dụ này, ta có biến dùng chung `count` cần được nhiều thread tăng lên. Để đảm bảo an toàn luồng, ta dùng khối `synchronized` bên trong method `increment()`. Object `lock` đóng vai trò lock để đồng bộ.

Khi một thread vào method `increment()`, nó giành lock trên `lock` trước khi vào khối `synchronized`. Khi đã ở trong khối, thread tăng biến `count`. Sau khi thoát khỏi khối, lock được giải phóng tự động, cho phép thread khác giành lấy và vào khối.

Bằng cách đồng bộ hoá truy cập biến `count` qua khối `synchronized`, ta đảm bảo chỉ một thread tăng biến tại một thời điểm, ngăn race condition và giữ tính nhất quán dữ liệu.

### Đồng bộ hoá trên method

Ngoài việc dùng khối `synchronized`, Java cho phép bạn đồng bộ hoá cả method bằng keyword `synchronized`. Lock gắn với method phụ thuộc vào việc đó là instance method hay static method.

Với instance method, lock gắn với object mà method được gọi trên đó. Mỗi instance của class có lock riêng, nên nhiều thread thực thi đồng thời được những synchronized instance method trên những instance khác nhau của class.

Ngược lại, với static method, lock gắn với chính class chứ không gắn với instance cụ thể nào. Vì mỗi JVM chỉ có một object class, chỉ một thread thực thi được synchronized static method trong class tại một thời điểm, bất kể có bao nhiêu instance của class đó.

Đây là ví dụ đồng bộ hoá một method:

```java
public class SynchronizedMethodExample {
    private static int count = 0;

    public static synchronized void increment() {
        count++;
    }

    public static void main(String[] args) throws InterruptedException {
        Thread thread1 = Thread.ofPlatform().start(() -> {
            for (int i = 0; i < 1000; i++) {
                increment();
            }
        });

        Thread thread2 = Thread.ofPlatform().start(() -> {
            for (int i = 0; i < 1000; i++) {
                increment();
            }
        });

        thread1.join();
        thread2.join();

        System.out.println("Final count: " + count);
    }
}
```

Trong ví dụ này, method `increment()` được khai báo `synchronized`. Khi một thread gọi method `increment()`, nó tự động giành lock gắn với object mà method được gọi trên đó (ở đây là chính class, vì method là static).

Chỉ một thread thực thi method `increment()` tại một thời điểm, trong khi thread khác cố gọi method sẽ bị chặn cho tới khi lock được giải phóng. Điều này đảm bảo biến `count` được tăng một cách nguyên tử và tránh race condition.

Cần lưu ý rằng đồng bộ hoá static method có thể làm giảm tính đồng thời, vì cả class chỉ có một lock duy nhất. Nếu nhiều thread cần truy cập những tài nguyên dùng chung khác nhau trong class, đồng bộ ở mức method có thể quá thô, và dùng khối `synchronized` hay cơ chế khoá mịn hơn sẽ phù hợp hơn.

Đồng bộ hoá method cung cấp cách đạt thread-safety sạch sẽ và súc tích hơn so với dùng khối `synchronized`. Tuy nhiên, cần lưu ý rằng đồng bộ hoá cả method có thể làm giảm tính đồng thời nếu method chứa mã không cần đồng bộ.

Nói chung, nên chỉ đồng bộ hoá những đoạn mã then chốt truy cập tài nguyên dùng chung, dùng khối hay method `synchronized` một cách khôn ngoan để cân bằng giữa an toàn luồng và hiệu năng.

Điều này đặc biệt quan trọng với virtual thread. Nhớ rằng có một hạn chế khi dùng khối hay method `synchronized` với virtual thread.

Khi một virtual thread thực hiện thao tác chặn (như I/O) bên trong khối hay method `synchronized`, nó khiến bộ lập lịch virtual thread chặn một thread của hệ điều hành. Tình huống này gọi là **pinning**. Bình thường, ngoài ngữ cảnh synchronized, virtual thread sẽ không chặn thread của hệ điều hành trong những thao tác như vậy.

Pinning ảnh hưởng tiêu cực tới thông lượng server nếu thao tác chặn kéo dài và xảy ra thường xuyên. Tuy nhiên, dùng `synchronized` cho những thao tác ngắn hoặc không thường xuyên thì không gây vấn đề.

Nếu bạn phát hiện pinning thường xuyên và kéo dài, khuyến nghị là thay khối `synchronized` bằng một lock (như `ReentrantLock`) ở những vùng cụ thể đó.

### Interface `Lock`

Java cung cấp interface `Lock` trong package `java.util.concurrent.locks` như một lựa chọn thay thế cho keyword `synchronized`. Interface `Lock` mang lại nhiều linh hoạt và quyền kiểm soát hơn đối với việc giành và giải phóng lock so với cơ chế khoá ngầm của `synchronized`.

Những method chính mà interface `Lock` cung cấp:

1. `void lock()`: Giành lock, chặn lại cho tới khi lock khả dụng.

2. `void unlock()`: Giải phóng lock. Luôn gọi `unlock()` trong khối `finally` để đảm bảo lock được giải phóng đúng cách.

3. `boolean tryLock()`: Cố giành lock mà không chặn. Trả về `true` nếu giành được, `false` nếu không.

4. `boolean tryLock(long time, TimeUnit unit)`: Cố giành lock, chặn lại trong khoảng thời gian đã nêu. Trả về `true` nếu giành được trong thời gian đó, `false` nếu không.

5. `Condition newCondition()`: Tạo một instance `Condition` mới gắn với lock, để điều phối việc thực thi thread dựa trên điều kiện.

Package `java.util.concurrent.locks` cung cấp vài cài đặt của interface `Lock`, gồm:

- `ReentrantLock`: Cài đặt được dùng nhiều nhất, cung cấp chức năng cơ bản giống `synchronized` nhưng có thêm những tính năng như kiểm soát tính công bằng và truy vấn trạng thái lock.

- `ReentrantReadWriteLock.ReadLock` và `ReentrantReadWriteLock.WriteLock`: Cung cấp một cặp lock gắn với nhau cho truy cập đọc và ghi. Nhiều thread giành được read lock đồng thời, trong khi chỉ một thread giành được write lock tại một thời điểm.

Để dùng `Lock`, làm theo các bước sau:

1. Tạo instance của cài đặt `Lock` mong muốn.

2. Giành lock bằng `lock()`, `tryLock()`, hoặc `tryLock(long time, TimeUnit unit)`.

3. Thực hiện thao tác trong vùng then chốt trong khi đang giữ lock.

4. Giải phóng lock bằng `unlock()` trong khối `finally`.

Đây là ví dụ dùng `ReentrantLock`:

```java
Lock lock = new ReentrantLock();
try {
    lock.lock();
    // Critical section
} finally {
    lock.unlock();
}
```

Interface `Lock` cung cấp thêm những tính năng so với `synchronized`, chẳng hạn:

- Thử giành lock không chặn bằng `tryLock()`:

```java
Lock lock = new ReentrantLock();
if (lock.tryLock()) {
    try {
        // Critical section
    } finally {
        lock.unlock();
    }
} else {
    // Lock not acquired, perform alternative actions
}
```

- Thử giành lock có giới hạn thời gian bằng `tryLock(long time, TimeUnit unit)`:

```java
Lock lock = new ReentrantLock();
try {
    if (lock.tryLock(1, TimeUnit.SECONDS)) {
        try {
            // Critical section
        } finally {
            lock.unlock();
        }
    } else {
        // Lock not acquired within the specified time
    }
} catch (InterruptedException e) {
    // Handle interruption
}
```

- Kiểm soát tính công bằng:

```java
Lock lock = new ReentrantLock(true); // Creating a fair lock
try {
    lock.lock();
    // Critical section
} finally {
    lock.unlock();
}
```

Class `ReentrantLock` là cài đặt phổ biến nhất của interface `Lock`. Nó cung cấp việc giành và giải phóng lock một cách tường minh, xử lý exception khi dùng lock sai cách, và tính tái nhập (reentrancy) của lock.

Đây là ví dụ so sánh `synchronized` và `ReentrantLock`:

```java
// Using synchronized
synchronized (lock) {
    // Critical section
}

// Using ReentrantLock
Lock lock = new ReentrantLock();
try {
    lock.lock();
    // Critical section
} finally {
    lock.unlock();
}
```

Class `ReentrantReadWriteLock.ReadLock` và `ReentrantReadWriteLock.WriteLock` cung cấp cách xử lý truy cập đọc và ghi đồng thời trên một tài nguyên dùng chung. Đây là ví dụ đơn giản:

```java
import java.util.concurrent.locks.ReentrantReadWriteLock;

public class ReadWriteLockExample {
    private final ReentrantReadWriteLock rwLock = new ReentrantReadWriteLock();
    private final ReentrantReadWriteLock.ReadLock readLock = rwLock.readLock();
    private final ReentrantReadWriteLock.WriteLock writeLock = rwLock.writeLock();
    private int sharedResource = 0;

    public void write(int value) {
        writeLock.lock();
        try {
            sharedResource = value;
            System.out.println("Written: " + value);
        } finally {
            writeLock.unlock();
        }
    }

    public void read() {
        readLock.lock();
        try {
            System.out.println("Read: " + sharedResource);
        } finally {
            readLock.unlock();
        }
    }

    public static void main(String[] args) {
        ReadWriteLockExample example = new ReadWriteLockExample();

        Thread writer = Thread.ofPlatform().start(() -> {
            example.write(42);
        });

        Thread reader = Thread.ofPlatform().start(() -> {
            example.read();
        });

        try {
            writer.join();
            reader.join();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
```

Như bạn thấy, interface `Lock` cung cấp nhiều tính năng nâng cao và quyền kiểm soát hơn so với keyword `synchronized`, cho phép khoá mịn, thử giành lock không chặn, và kiểm soát tính công bằng. Tuy nhiên, nó cũng đòi hỏi bạn tự quản lý việc giành và giải phóng lock, dễ sinh lỗi nếu không xử lý cẩn thận.

### Class `CyclicBarrier`

Trong lập trình đồng thời, có những tình huống nhiều thread cần phối hợp và đồng bộ tiến độ tại một số điểm nhất định. Class `java.util.concurrent.CyclicBarrier` cung cấp một công cụ đồng bộ cho phép một nhóm thread chờ nhau tới một điểm rào chung trước khi đi tiếp.

Class `CyclicBarrier` được thiết kế để hỗ trợ phối hợp giữa một số lượng thread cố định. Nó đặc biệt hữu ích khi bạn có một nhóm thread cần thực hiện tác vụ song song rồi chờ nhau hoàn tất trước khi sang giai đoạn kế tiếp.

Đây là cách `CyclicBarrier` hoạt động:

1. Khi tạo `CyclicBarrier`, bạn nêu số thread cần tới rào trước khi tất cả được đi tiếp.

2. Mỗi thread thực hiện tác vụ của mình rồi gọi method `await()` trên `CyclicBarrier` để báo rằng nó đã tới rào.

3. Thread gọi `await()` bị chặn cho tới khi đủ số thread đã nêu tới rào.

4. Khi mọi thread đã tới rào, rào được mở và tất cả thread đi tiếp được.

5. Nếu muốn, bạn nêu được một hành động rào (barrier action) — một tác vụ `Runnable` được một trong các thread chạy sau khi mọi thread đã tới rào nhưng trước khi chúng được thả.

Đây là ví dụ đơn giản minh hoạ cách dùng `CyclicBarrier`:

```java
import java.util.concurrent.BrokenBarrierException;
import java.util.concurrent.CyclicBarrier;

public class CyclicBarrierExample {
    private static final int NUM_THREADS = 3;

    public static void main(String[] args) {
        CyclicBarrier barrier = new CyclicBarrier(NUM_THREADS, () -> {
            System.out.println("All threads reached the barrier");
        });

        for (int i = 0; i < NUM_THREADS; i++) {
            final int threadId = i;
            Thread.ofPlatform().start(() -> {
                try {
                    System.out.println("Thread " + threadId + " is performing task");
                    Thread.sleep(1000); // Simulating task execution
                    System.out.println("Thread " + threadId + " reached the barrier");
                    barrier.await();
                    System.out.println("Thread " + threadId + " continued after the barrier");
                } catch (InterruptedException | BrokenBarrierException e) {
                    e.printStackTrace();
                }
            });
        }
    }
}
```

Trong ví dụ này, ta tạo một `CyclicBarrier` với số đếm là `NUM_THREADS` (3 ở đây). Ta cũng nêu một hành động rào sẽ chạy khi mọi thread đã tới rào.

Sau đó ta khởi chạy ba thread, mỗi thread thực hiện một tác vụ (mô phỏng bằng việc ngủ một lúc ngắn). Sau khi hoàn tất tác vụ, mỗi thread gọi `await()` trên rào để báo rằng nó đã tới điểm đồng bộ.

Kết quả của chương trình sẽ tương tự như sau:

```
Thread 0 is performing task
Thread 1 is performing task
Thread 2 is performing task
Thread 1 reached the barrier
Thread 0 reached the barrier
Thread 2 reached the barrier
All threads reached the barrier
Thread 2 continued after the barrier
Thread 1 continued after the barrier
Thread 0 continued after the barrier
```

Như bạn thấy, mọi thread thực hiện tác vụ đồng thời. Khi tất cả đã tới rào, hành động rào được chạy, rồi mọi thread đi tiếp.

`CyclicBarrier` được gọi là *cyclic* (tuần hoàn) vì nó tái sử dụng được sau khi mọi thread đã qua rào. Bạn gọi lại `await()` trên cùng object rào đó, và nó sẽ lại chờ đủ số thread đã nêu tới rào.

Cần lưu ý rằng nếu bất kỳ thread nào rời rào sớm do tự ngắt hoặc ném exception, mọi thread khác đang chờ ở rào sẽ nhận `BrokenBarrierException`. Trong những trường hợp đó, bạn cần xử lý exception cho phù hợp và quyết định tiếp tục hay dừng việc thực thi.

## Concurrency API

Java cung cấp một Concurrency API mạnh mẽ và linh hoạt trong package `java.util.concurrent`, gồm nhiều class và interface để quản lý các thao tác đồng thời. API này đơn giản hoá việc phát triển ứng dụng đồng thời bằng cách cung cấp những trừu tượng mức cao và tiện ích để quản lý thread, điều phối tác vụ và đồng bộ hoá truy cập tài nguyên dùng chung.

Concurrency API được giới thiệu ở Java 5 và liên tục được cải tiến qua các phiên bản sau. Nó gồm vài thành phần then chốt:

1. **Executor:** Interface `Executor` và `ExecutorService` cung cấp cách quản lý việc thực thi tác vụ trong một thread pool, cho phép bạn tập trung định nghĩa tác vụ thay vì trực tiếp quản lý thread.

2. **Concurrent Collection:** Package `java.util.concurrent` cung cấp những collection an toàn luồng như `ConcurrentHashMap`, `CopyOnWriteArrayList` và `BlockingQueue`, cho hiệu năng và khả năng mở rộng tốt hơn so với dùng collection được đồng bộ hoá.

3. **Synchronizer:** Những class như `CountDownLatch`, `CyclicBarrier`, `Semaphore` và `Phaser` giúp điều phối hành động của nhiều thread, cho phép chúng chờ nhau hoặc kiểm soát truy cập tài nguyên dùng chung.

4. **Lock:** Interface `Lock` và các cài đặt của nó cung cấp cơ chế khoá nâng cao hơn so với keyword `synchronized`.

5. **Biến atomic:** Package `java.util.concurrent.atomic` cung cấp những biến atomic như `AtomicInteger` và `AtomicReference`, cho phép thao tác an toàn luồng trên từng biến mà không cần đồng bộ hoá tường minh.

Những thành phần này phối hợp với nhau tạo thành một framework toàn diện để xây dựng ứng dụng đồng thời và song song trong Java.

Ở các phần trước ta đã bàn về biến atomic, lock và `CyclicBarrier`. Ở phần này, ta sẽ tập trung vào executor.

### Interface `ExecutorService`

Interface `ExecutorService` là phần trung tâm của Concurrency API và kế thừa interface `Executor`. Nó cung cấp method để nộp tác vụ cho việc thực thi và quản lý vòng đời của thread pool bên dưới.

**Thread pool** là một tập hợp thread đã được tạo sẵn và tái sử dụng được, luôn sẵn sàng thực hiện tác vụ. Nó hoạt động như một hồ chứa thread thợ (worker thread) dùng để thực thi tác vụ đồng thời.

Hãy tưởng tượng bạn có một công việc lớn cần làm, như sơn nhà. Bạn tự làm hết cũng được, nhưng sẽ mất rất nhiều thời gian. Thay vào đó, bạn thuê một nhóm thợ giúp sơn nhà. Nhóm thợ này giống một thread pool. Khi có việc cần làm, chẳng hạn sơn một căn phòng, bạn giao cho một thợ trong nhóm. Người thợ nhận việc, làm xong rồi quay lại nhóm, sẵn sàng nhận việc khác.

Ưu điểm của thread pool là bạn không phải tạo thợ (thread) mới mỗi khi có việc cần làm. Tạo thread mới cho mỗi tác vụ rất tốn thời gian và tài nguyên. Thay vào đó, bạn có sẵn một nhóm thợ (thread) chờ nhận việc khi việc tới. Thread pool quản lý vòng đời của thread: tạo thread khi pool được khởi tạo và huỷ chúng khi pool đóng lại. Nó cũng lo việc phân bổ tác vụ cho các thread rảnh trong pool.

Đây là ví dụ tạo `ExecutorService` bằng class factory `Executors`:
```java
ExecutorService executorService = Executors.newFixedThreadPool(5);
```
Trong trường hợp này, ta tạo một thread pool cố định gồm 5 thread bằng method `Executors.newFixedThreadPool()`.

Những method chính của interface `ExecutorService` gồm:

- `void execute(Runnable command)`: Nộp một tác vụ `Runnable` để thực thi mà không trả về kết quả.

- `<T> Future<T> submit(Callable<T> task)`: Nộp một tác vụ `Callable` để thực thi và trả về một `Future` đại diện cho kết quả đang chờ của tác vụ.

- `<T> Future<T> submit(Runnable task, T result)`: Nộp một tác vụ `Runnable` để thực thi và trả về một `Future` đại diện cho kết quả đã cho khi hoàn tất.

- `Future<?> submit(Runnable task)`: Nộp một tác vụ `Runnable` để thực thi và trả về một `Future` đại diện cho việc hoàn tất tác vụ.

- `<T> List<Future<T>> invokeAll(Collection<? extends Callable<T>> tasks)`: Nộp một collection tác vụ `Callable` để thực thi và trả về danh sách object `Future` đại diện cho kết quả của từng tác vụ.

- `<T> T invokeAny(Collection<? extends Callable<T>> tasks)`: Nộp một collection tác vụ `Callable` để thực thi và trả về kết quả của một trong những tác vụ hoàn tất thành công.

Interface `ExecutorService` cũng cung cấp method để quản lý vòng đời của thread pool:

- `void shutdown()`: Khởi động quá trình đóng có trật tự cho `ExecutorService`: những tác vụ đã nộp trước đó vẫn được thực thi, nhưng không nhận tác vụ mới. Method này không chờ các tác vụ đang chạy hoàn tất.

- `List<Runnable> shutdownNow()`: Cố dừng mọi tác vụ đang chạy và ngừng xử lý những tác vụ đang chờ. Nó trả về danh sách các tác vụ còn chờ thực thi.

- `boolean isShutdown()`: Trả về `true` nếu `ExecutorService` đã bị đóng, dù bằng `shutdown()` hay `shutdownNow()`.

- `boolean isTerminated()`: Trả về `true` nếu mọi tác vụ đã hoàn tất sau một yêu cầu đóng.

Cần đóng `ExecutorService` đúng cách khi không còn cần tới, để thread kết thúc êm đẹp và giải phóng mọi tài nguyên mà thread pool đang giữ.

Đây là ví dụ minh hoạ cách dùng những method này:
```java
ExecutorService executorService = Executors.newFixedThreadPool(5);

// Submit tasks for execution
executorService.execute(() -> {
    System.out.println("Task 1 executed by " + Thread.currentThread().getName());
});
executorService.execute(() -> {
    System.out.println("Task 2 executed by " + Thread.currentThread().getName());
});

// Initiate orderly shutdown
executorService.shutdown();

// Check if the ExecutorService has been shut down
boolean isShutdown = executorService.isShutdown();
System.out.println("ExecutorService is shut down: " + isShutdown);

// Wait for all tasks to complete and check if the ExecutorService has terminated
try {
    boolean isTerminated = executorService.awaitTermination(1, TimeUnit.MINUTES);
    System.out.println("ExecutorService is terminated: " + isTerminated);
} catch (InterruptedException e) {
    throw new RuntimeException(e);
}
```

Trong ví dụ này, ta tạo một `ExecutorService`, nộp tác vụ bằng method `execute()`, khởi động quá trình đóng có trật tự bằng `shutdown()`, rồi kiểm tra trạng thái của `ExecutorService` bằng `isShutdown()` và `isTerminated()`.

Tuy nhiên, đáng lưu ý rằng từ Java 19, `ExecutorService` kế thừa interface `AutoCloseable`. Điều này cho phép ta dùng khối `try-with-resources`, khối này tự động gọi method `close()` ở cuối khối `try`. Nên ví dụ trên viết lại được như sau:

```java
try (ExecutorService executorService = Executors.newFixedThreadPool(5)) {
    // Submit tasks for execution
    executorService.execute(() -> {
        System.out.println("Task 1 executed by " + Thread.currentThread().getName());
    });
    executorService.execute(() -> {
        System.out.println("Task 2 executed by " + Thread.currentThread().getName());
    });
} // ExecutorService.close() is called automatically here, which calls shutdown()
```

Thay đổi này đơn giản hoá việc dùng instance `ExecutorService` và giúp ngăn rò rỉ tài nguyên bằng cách đảm bảo executor được đóng đúng cách, ngay cả khi có exception xảy ra.

### Nộp tác vụ

Interface `ExecutorService` cung cấp vài method để nộp tác vụ cho việc thực thi:

- `void execute(Runnable command)`: Nộp một tác vụ `Runnable` để thực thi mà không trả về kết quả. Method `execute()` được kế thừa từ interface `Executor`.

- `<T> Future<T> submit(Callable<T> task)`: Nộp một tác vụ `Callable` để thực thi và trả về một `Future` đại diện cho kết quả đang chờ. `Future` cho phép bạn lấy kết quả khi tác vụ hoàn tất.

- `<T> Future<T> submit(Runnable task, T result)`: Nộp một tác vụ `Runnable` để thực thi và trả về một `Future` đại diện cho kết quả đã cho khi hoàn tất. Hữu ích khi bạn muốn trả về một kết quả cụ thể từ tác vụ `Runnable`.

- `Future<?> submit(Runnable task)`: Nộp một tác vụ `Runnable` để thực thi và trả về một `Future` đại diện cho việc hoàn tất tác vụ. Method `get()` của `Future` sẽ trả về `null` khi hoàn tất.

Ngoài việc nộp từng tác vụ riêng lẻ, interface `ExecutorService` còn cung cấp method để nộp nhiều tác vụ cùng lúc:

- `<T> List<Future<T>> invokeAll(Collection<? extends Callable<T>> tasks)`: Nộp một collection tác vụ `Callable` để thực thi và trả về danh sách object `Future` đại diện cho kết quả của từng tác vụ. Method này chặn lại cho tới khi mọi tác vụ hoàn tất.

- `<T> T invokeAny(Collection<? extends Callable<T>> tasks)`: Nộp một collection tác vụ `Callable` để thực thi và trả về kết quả của một trong những tác vụ đã hoàn tất. Method này chặn lại cho tới khi ít nhất một tác vụ hoàn tất thành công.

Những method này cho phép bạn nộp nhiều tác vụ đồng thời và lấy kết quả qua interface `Future`.

Xét ví dụ sau:

```java
try (ExecutorService executorService = Executors.newFixedThreadPool(5)) {
    // Submit a Runnable task using execute()
    executorService.execute(() -> {
        System.out.println("Task executed by " + Thread.currentThread().getName());
    });

    // Submit a Callable task using submit()
    Future<String> future = executorService.submit(() -> {
        // Perform some computation
        return "Result of the task";
    });

    // Submit multiple Callable tasks using invokeAll()
    List<Callable<Integer>> tasks = Arrays.asList(
            () -> 1,
            () -> 2,
            () -> 3
    );
    List<Future<Integer>> futures = executorService.invokeAll(tasks);

    // Submit multiple Callable tasks using invokeAny()
    Integer result = executorService.invokeAny(tasks);
} catch (Exception e) {
    e.printStackTrace();
}
```

Ví dụ này minh hoạ việc nộp tác vụ bằng `execute()` cho tác vụ `Runnable`, `submit()` cho tác vụ `Callable`, `invokeAll()` để nộp nhiều tác vụ `Callable` và lấy kết quả dưới dạng danh sách object `Future`, và `invokeAny()` để nộp nhiều tác vụ `Callable` rồi lấy kết quả của một trong những tác vụ đã hoàn tất.

Khi nộp tác vụ bằng method `submit()` hay `invokeAll()`, bạn nhận về object `Future` đại diện cho kết quả đang chờ. Interface `Future` cung cấp method để kiểm tra trạng thái tác vụ và lấy kết quả:

- `boolean isDone()`: Trả về `true` nếu tác vụ đã hoàn tất, dù bình thường hay do exception.

- `boolean isCancelled()`: Trả về `true` nếu tác vụ bị huỷ trước khi hoàn tất bình thường.

- `boolean cancel(boolean mayInterruptIfRunning)`: Cố huỷ việc thực thi tác vụ. Nếu tác vụ đã hoàn tất hoặc đã bị huỷ, method này không có tác dụng.

- `V get()`: Chờ (nếu cần) tới khi tác vụ hoàn tất rồi lấy kết quả. Nếu tác vụ ném exception, exception đó được bọc trong `ExecutionException`.

- `V get(long timeout, TimeUnit unit)`: Chờ tối đa khoảng thời gian đã nêu để tác vụ hoàn tất rồi lấy kết quả. Nếu hết thời gian trước khi tác vụ xong, một `TimeoutException` được ném ra.

Với method `invokeAny()`, kết quả thực (`T`) của tác vụ hoàn tất đầu tiên được trả về.

Những method này cho phép bạn đồng bộ thread chính với việc hoàn tất của các tác vụ đã nộp và lấy kết quả khi cần.

Xét ví dụ sau:
```java
try (ExecutorService executorService = Executors.newSingleThreadExecutor()) {
    // Submit a Callable task using submit()
    Future<String> future = executorService.submit(() -> {
        // Simulate a long-running task
        Thread.sleep(2000);
        return "Result of the task";
    });

    // Check if the task is done
    boolean isDone = future.isDone();
    System.out.println("Task is done: " + isDone);

    // Cancel the task
    //boolean isCancelled = future.cancel(true);
    //System.out.println("Task is cancelled: " + isCancelled);

    // Retrieve the result of the task
    // Calling get() on an already cancelled task will throw 
    // a CancellationException, regardless of the timeout value
    String result = null;
    try {
        result = future.get(1, TimeUnit.SECONDS);
    } catch (InterruptedException | ExecutionException | TimeoutException e) {
        e.printStackTrace();
    }
    System.out.println("Result: " + result);
}
```

Trong ví dụ này, ta nộp một tác vụ `Callable` bằng `submit()`, kiểm tra tác vụ đã xong chưa bằng `isDone()`, thử huỷ tác vụ bằng `cancel()`, và lấy kết quả bằng `get()` có timeout. Nếu tác vụ hoàn tất trong thời gian đã nêu, ta nhận được kết quả. Ngược lại, một `TimeoutException` được ném ra.

### Interface `Callable`

Như bạn đã thấy ở các ví dụ trước, interface `Callable` tương tự interface `Runnable` nhưng có vài khác biệt then chốt. Trong khi `Runnable` biểu diễn một tác vụ thực thi đồng thời được, `Callable` biểu diễn một tác vụ **trả về kết quả** và **có thể ném exception**.

Đây là khai báo của interface `Callable`:

```java
public interface Callable<V> {
    V call() throws Exception;
}
```

Interface `Callable` có một method duy nhất là `call()`, trả về giá trị kiểu `V` và có thể ném exception. Điều này trái với interface `Runnable`, vốn có method `void run()` không trả về giá trị và không ném checked exception.

Những khác biệt chính giữa `Callable` và `Runnable`:

1. **Giá trị trả về:** Tác vụ `Callable` trả về được kết quả, còn tác vụ `Runnable` thì không. Method `call()` của `Callable` trả về giá trị kiểu `V` đã nêu, trong khi method `run()` của `Runnable` là `void`.

2. **Xử lý exception:** Tác vụ `Callable` ném được checked exception, còn tác vụ `Runnable` thì không. Method `call()` của `Callable` khai báo có thể ném `Exception`, trong khi method `run()` của `Runnable` không khai báo checked exception nào.

Đây là ví dụ minh hoạ cách dùng `Callable`:

```java
try (ExecutorService executorService = Executors.newSingleThreadExecutor()) {
    // Create a Callable task
    Callable<Integer> task = () -> {
        // Perform some computation
        int result = 0;
        for (int i = 1; i <= 10; i++) {
            result += i;
        }
        return result;
    };

    // Submit the Callable task to the ExecutorService
    Future<Integer> future = executorService.submit(task);

    // Retrieve the result of the task
    try {
        Integer result = future.get();
        System.out.println("Result: " + result); // Prints 55
    } catch (InterruptedException | ExecutionException e) {
        e.printStackTrace();
    }
}
```

Trong ví dụ này, ta tạo một tác vụ `Callable` thực hiện phép tính đơn giản rồi trả về kết quả. Ta nộp tác vụ cho `ExecutorService` bằng method `submit()`, method này trả về object `Future` đại diện cho kết quả đang chờ. Sau đó ta dùng method `get()` của `Future` để lấy kết quả. Nếu tác vụ ném exception, exception được bọc trong `ExecutionException`; ngoài ra `InterruptedException` cũng có thể được ném nếu thread hiện tại bị ngắt trong lúc chờ.

Việc chọn giữa `Callable` và `Runnable` phụ thuộc vào chuyện bạn có cần trả về kết quả từ tác vụ và xử lý checked exception hay không. Nếu tác vụ không cần trả về giá trị và không ném checked exception, dùng `Runnable`. Nhưng nếu tác vụ cần trả về kết quả hoặc ném checked exception, hãy dùng `Callable`.

### Lập lịch tác vụ

Ngoài việc thực thi tác vụ ngay lập tức, Concurrency API còn cho phép lập lịch tác vụ để chạy sau, hoặc chạy lặp lại với độ trễ cố định hay theo nhịp cố định. Chức năng này do interface `ScheduledExecutorService` cung cấp — interface này kế thừa `ExecutorService`.

Interface `ScheduledExecutorService` cung cấp những method sau để lập lịch tác vụ:

1. `schedule(Runnable command, long delay, TimeUnit unit)`: Lập lịch cho tác vụ `Runnable` chạy sau khoảng `delay` đã nêu, tính theo `TimeUnit` cho trước.

2. `schedule(Callable<V> callable, long delay, TimeUnit unit)`: Lập lịch cho tác vụ `Callable` chạy sau khoảng `delay` đã nêu và trả về một `ScheduledFuture` đại diện cho kết quả đang chờ.

3. `scheduleAtFixedRate(Runnable command, long initialDelay, long period, TimeUnit unit)`: Lập lịch cho tác vụ `Runnable` chạy định kỳ, với khoảng thời gian cố định giữa **thời điểm bắt đầu** của lần chạy này và lần chạy kế tiếp. Tham số `initialDelay` nêu độ trễ trước lần chạy đầu, còn `period` nêu khoảng thời gian cố định giữa các lần chạy.

4. `scheduleWithFixedDelay(Runnable command, long initialDelay, long delay, TimeUnit unit)`: Lập lịch cho tác vụ `Runnable` chạy lặp lại, với độ trễ cố định giữa **thời điểm kết thúc** của lần chạy này và thời điểm bắt đầu lần kế tiếp.

Đây là ví dụ minh hoạ cách dùng những method của `ScheduledExecutorService`:

```java
try (ScheduledExecutorService scheduledExecutorService =
            Executors.newSingleThreadScheduledExecutor()) {
    // Schedule a task to run after a delay of 2 seconds
    scheduledExecutorService.schedule(() -> {
        System.out.println("Task executed after 2 seconds delay");
    }, 2, TimeUnit.SECONDS);

    // Schedule a task to run repeatedly at a fixed rate of 1 second
    scheduledExecutorService.scheduleAtFixedRate(() -> {
        System.out.println("Task executed at fixed rate");
    }, 0, 1, TimeUnit.SECONDS);

    // Schedule a task to run repeatedly with a fixed delay of 500 milliseconds
    scheduledExecutorService.scheduleWithFixedDelay(() -> {
        System.out.println("Task executed with fixed delay");
    }, 0, 500, TimeUnit.MILLISECONDS);

    // Keep the main thread alive for 5 seconds
    try {
        Thread.sleep(5000);
    } catch (InterruptedException e) {
        e.printStackTrace();
    }
}
```

Trong ví dụ này, ta tạo một `ScheduledExecutorService` bằng method `Executors.newSingleThreadScheduledExecutor()`. Sau đó ta minh hoạ cách dùng `schedule()`, `scheduleAtFixedRate()` và `scheduleWithFixedDelay()`.

Method `schedule()` được dùng để lập lịch cho tác vụ chạy sau 2 giây. Method `scheduleAtFixedRate()` lập lịch cho tác vụ chạy lặp lại theo nhịp cố định 1 giây, nghĩa là lần chạy kế tiếp bắt đầu đúng 1 giây sau khi lần trước bắt đầu, bất kể tác vụ mất bao lâu để hoàn tất. Method `scheduleWithFixedDelay()` lập lịch cho tác vụ chạy lặp lại với độ trễ cố định 500 mili-giây giữa lúc lần chạy này kết thúc và lúc lần kế tiếp bắt đầu.

Cần lưu ý rằng `ScheduledExecutorService` **không** tự động kết thúc sau khi các tác vụ đã lập lịch chạy xong. Bạn phải đóng nó tường minh bằng method `shutdown()` khi không còn cần tới.

Nhớ rằng `ScheduledExecutorService` dùng một số lượng thread hữu hạn để chạy tác vụ đã lập lịch, nên cần chọn phương thức thực thi phù hợp với yêu cầu và đảm bảo các tác vụ đã lập lịch không làm quá tải tài nguyên sẵn có.

### Các factory method của Executors

Xuyên suốt phần này, ta đã dùng nhiều factory method mà class `Executors` cung cấp để tạo instance của `ExecutorService` và `ScheduledExecutorService`. Class `Executors` là một utility class cung cấp vài static factory method để tạo những loại thread pool và executor service khác nhau.

Đây là tổng quan những factory method thường dùng của class `Executors`:

1. `ExecutorService newSingleThreadExecutor()`: Tạo một `ExecutorService` dùng một thread thợ duy nhất để chạy tác vụ. Tác vụ được đảm bảo chạy tuần tự, và không quá một tác vụ hoạt động tại bất kỳ thời điểm nào.

2. `ScheduledExecutorService newSingleThreadScheduledExecutor()`: Tạo một `ScheduledExecutorService` đơn luồng, lập lịch được cho tác vụ chạy sau một độ trễ hoặc chạy định kỳ.

3. `ExecutorService newCachedThreadPool()`: Tạo một thread pool tạo thread mới khi cần nhưng tái sử dụng thread đã dựng trước đó khi chúng rảnh. Thread rảnh được giữ trong pool 60 giây trước khi bị kết thúc và loại khỏi pool.

4. `ExecutorService newFixedThreadPool(int nThreads)`: Tạo một thread pool với số thread cố định. Tham số `nThreads` nêu số thread trong pool. Nếu có thêm tác vụ được nộp khi mọi thread đang bận, chúng sẽ chờ trong hàng đợi cho tới khi có thread rảnh.

5. `ScheduledExecutorService newScheduledThreadPool(int corePoolSize)`: Tạo một thread pool lập lịch được cho tác vụ chạy sau một độ trễ hoặc chạy định kỳ. Tham số `corePoolSize` nêu số thread giữ lại trong pool, ngay cả khi chúng rảnh.

Đây là các ví dụ mã minh hoạ cách dùng từng factory method:

```java
// newSingleThreadExecutor()
try (ExecutorService singleThreadExecutor = Executors.newSingleThreadExecutor()) {
    singleThreadExecutor.submit(() -> {
        System.out.println("Task executed by single thread");
    });
}

// newSingleThreadScheduledExecutor()
try (ScheduledExecutorService singleThreadScheduledExecutor = Executors.newSingleThreadScheduledExecutor()) {
    singleThreadScheduledExecutor.schedule(() -> {
        System.out.println("Task scheduled by single thread scheduled executor");
    }, 2, TimeUnit.SECONDS);
}

// newCachedThreadPool()
try (ExecutorService cachedThreadPool = Executors.newCachedThreadPool()) {
    for (int i = 0; i < 5; i++) {
        cachedThreadPool.submit(() -> {
            System.out.println("Task executed by cached thread pool");
        });
    }
}

// newFixedThreadPool(int nThreads)
try (ExecutorService fixedThreadPool = Executors.newFixedThreadPool(3)) {
    for (int i = 0; i < 10; i++) {
        fixedThreadPool.submit(() -> {
            System.out.println("Task executed by fixed thread pool");
        });
    }
}

// newScheduledThreadPool(int corePoolSize)
try (ScheduledExecutorService scheduledThreadPool = Executors.newScheduledThreadPool(2)) {
    scheduledThreadPool.scheduleAtFixedRate(() -> {
        System.out.println("Task scheduled by scheduled thread pool");
    }, 0, 1, TimeUnit.SECONDS);

    // Keep the main thread alive for 3 seconds
    try {
        Thread.sleep(3000);
    } catch (InterruptedException e) {
        e.printStackTrace();
    }
}
```

Trong những ví dụ này, ta tạo các loại executor service khác nhau bằng những factory method tương ứng của class `Executors`.

Method `newSingleThreadExecutor()` tạo một `ExecutorService` với một thread thợ duy nhất, đảm bảo tác vụ chạy tuần tự. Method `newSingleThreadScheduledExecutor()` tạo một `ScheduledExecutorService` đơn luồng để lập lịch tác vụ có độ trễ hoặc chạy định kỳ.

Method `newCachedThreadPool()` tạo một thread pool tạo thread mới khi cần và tái sử dụng thread rảnh. Method `newFixedThreadPool(int nThreads)` tạo thread pool với số thread cố định do tham số `nThreads` nêu.

Method `newScheduledThreadPool(int corePoolSize)` tạo một `ScheduledExecutorService` với số thread cố định do tham số `corePoolSize` nêu. Nó cho phép lập lịch tác vụ có độ trễ hoặc chạy định kỳ.

Những factory method này cung cấp cách tiện lợi để tạo các loại executor service khác nhau tuỳ theo yêu cầu cụ thể. Chúng đóng gói sự phức tạp của việc tạo, quản lý và kết thúc thread, cho phép lập trình viên tập trung vào việc định nghĩa và nộp tác vụ.

Cần chọn factory method phù hợp với nhu cầu của ứng dụng. Hãy cân nhắc những yếu tố như số lượng tác vụ, yêu cầu về tính đồng thời, nhu cầu lập lịch và ràng buộc tài nguyên khi chọn executor service.

Dù sao đi nữa, nhớ đóng executor service đúng cách bằng method `shutdown()` khi không còn cần tới, để đảm bảo kết thúc êm đẹp và dọn dẹp tài nguyên.

### Executor nhận biết virtual thread

Cùng với việc giới thiệu virtual thread, Java bổ sung một factory method mới trong class `Executors` để tạo instance `ExecutorService` hoạt động trơn tru với virtual thread: `newVirtualThreadPerTaskExecutor()`.

Method này tương đương việc gọi `newThreadPerTaskExecutor(ThreadFactory)` với một thread factory tạo virtual thread. `newThreadPerTaskExecutor(ThreadFactory)` tạo một `Executor` khởi chạy một `Thread` mới cho mỗi tác vụ. Số thread mà `Executor` này tạo ra là không giới hạn.

Chìa khoá để hiểu điều này là nhận ra rằng dù virtual thread hành xử như platform thread, chúng đại diện cho một khái niệm khác. Platform thread là tài nguyên khan hiếm nên cần quản lý cẩn thận, thường qua thread pool. Câu hỏi "Pool nên có bao nhiêu thread?" là điều thường phải cân nhắc với platform thread.

Ngược lại, có thể có hàng triệu virtual thread. Thay vì đại diện cho một tài nguyên dùng chung được gộp lại, mỗi virtual thread nên đại diện cho một **tác vụ** trong ứng dụng. Số virtual thread bạn dùng nên bằng số tác vụ đồng thời trong ứng dụng.

Vậy nên, thay vì dùng một shared thread pool executor như thế này:

```java
try (var sharedThreadPoolExecutor = Executors.newFixedThreadPool(4)) {
    Future<TaskA> f1 = sharedThreadPoolExecutor.submit(task1);
    Future<TaskB> f2 = sharedThreadPoolExecutor.submit(task2);
    // ... use futures
}
```

Bạn dùng được virtual thread executor:

```java
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    Future<TaskA> f1 = executor.submit(task1);
    Future<TaskB> f2 = executor.submit(task2);
    // ... use futures
}
```

Method `Executors.newVirtualThreadPerTaskExecutor()` trả về một `ExecutorService` **không** dùng thread pool. Thay vào đó, nó tạo một virtual thread mới cho mỗi tác vụ được nộp. Executor này rất nhẹ, cho phép bạn tạo mới dễ dàng như tạo bất kỳ object đơn giản nào.

Vì `ExecutorService` kế thừa interface `AutoCloseable`, ở cuối khối `try-with-resources`, method `close()` chờ mọi tác vụ đã nộp cho `ExecutorService` (mọi virtual thread do `ExecutorService` sinh ra) kết thúc.

Mẫu này đặc biệt hữu ích khi bạn cần thực hiện đồng thời nhiều lời gọi ra ngoài tới các dịch vụ khác nhau. Đây là ví dụ:

```java
void handle(Request request, Response response) {
    var url1 = ...
    var url2 = ...
    try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
        var future1 = executor.submit(() -> fetchURL(url1));
        var future2 = executor.submit(() -> fetchURL(url2));
        response.send(future1.get() + future2.get());
    } catch (ExecutionException | InterruptedException e) {
        response.fail(e);
    }
}

String fetchURL(URL url) throws IOException {
    try (var in = url.openStream()) {
        return new String(in.readAllBytes(), StandardCharsets.UTF_8);
    }
}
```

Ví dụ này tạo một virtual thread mới cho mỗi thao tác tải URL, dù đây là những tác vụ nhỏ và ngắn. Đó chính xác là kiểu kịch bản dành cho virtual thread.

Cần hiểu rằng việc chuyển `n` platform thread thành `n` virtual thread sẽ không mang lại lợi ích đáng kể. Sức mạnh thực sự đến từ việc chuyển **tác vụ** thành virtual thread. Theo kinh nghiệm, nếu ứng dụng của bạn không bao giờ chạm tới 10.000 virtual thread trở lên, khả năng cao là nó chưa tận dụng hết lợi ích của virtual thread. Điều đó nghĩa là hoặc tải của ứng dụng quá nhẹ nên không cần cải thiện thông lượng, hoặc bạn chưa biểu diễn đủ số tác vụ dưới dạng virtual thread.

## Concurrent collection

Khi làm việc với những collection Java như `ArrayList`, `HashMap`, v.v. trong môi trường đa luồng, có lẽ bạn từng gặp `ConcurrentModificationException`. Exception này được ném ra khi một thread đang duyệt collection trong lúc thread khác cố sửa đổi cấu trúc của nó, chẳng hạn bằng cách thêm hay xoá phần tử.

Giải pháp là dùng những concurrent collection an toàn luồng. Java cung cấp vài class concurrent collection cho phép nhiều thread truy cập và sửa đổi chúng an toàn, không có rủi ro `ConcurrentModificationException`.

Một số class concurrent collection then chốt gồm:

- `java.util.concurrent.ConcurrentHashMap<K,V>`  
Phiên bản an toàn luồng của `HashMap`, đạt tính đồng thời cao nhờ những kỹ thuật nâng cao như thao tác CAS (Compare-And-Swap). Điều này cho phép nhiều thread đọc và ghi map đồng thời:

    ```java
    Map<String, Integer> map = new ConcurrentHashMap<>();
    map.put("apple", 1);
    map.put("banana", 2);
    ```

- `java.util.concurrent.ConcurrentLinkedQueue<E>`   
Hàng đợi an toàn luồng dựa trên các nút liên kết. Nó cho phép nhiều thread thêm phần tử ở đuôi và xoá phần tử ở đầu một cách đồng thời:

    ```java
    Queue<String> queue = new ConcurrentLinkedQueue<>();
    queue.add("task1");
    queue.add("task2");
    String task = queue.poll();
    ```

- `java.util.concurrent.ConcurrentSkipListMap<K,V>`  
Map đồng thời, có sắp xếp, cung cấp chức năng tương tự `TreeMap` nhưng dùng skip list, giữ phần tử theo thứ tự dựa trên thứ tự tự nhiên hoặc một `Comparator` được cung cấp. Nó cho phép nhiều thread truy cập đồng thời:

    ```java
    ConcurrentNavigableMap<Integer, String> map = new ConcurrentSkipListMap<>();
    map.put(1, "one");
    map.put(2, "two");
    String value = map.get(1);
    ```

- `java.util.concurrent.ConcurrentSkipListSet<E>`  
Set đồng thời, có sắp xếp, cung cấp chức năng tương tự `TreeSet` nhưng dùng skip list, giữ phần tử theo thứ tự tự nhiên hoặc theo một `Comparator` được cung cấp lúc tạo set, tuỳ constructor nào được dùng. Nó cho chi phí thời gian `log (n)` với thao tác add, remove và contains:

    ```java
    Set<String> set = new ConcurrentSkipListSet<>();
    set.add("apple");
    set.add("banana");
    set.add("orange");
    System.out.println(set); // [apple, banana, orange]
    ```  

- `java.util.concurrent.CopyOnWriteArrayList<E>` và `java.util.concurrent.CopyOnWriteArraySet<E>`  
Đây lần lượt là biến thể an toàn luồng của `ArrayList` và `HashSet`. Chúng đạt được thread-safety bằng cách tạo một bản sao mới của mảng bên dưới mỗi lần có thao tác ghi (add, set, remove, v.v.). Nghĩa là nhiều thread duyệt collection an toàn mà không cần đồng bộ hoá. Tuy nhiên, hành vi copy-on-write tốn đáng kể bộ nhớ nếu collection lớn và thao tác ghi diễn ra thường xuyên:

    ```java
    List<Integer> list = new CopyOnWriteArrayList<>();
    list.add(1);
    list.add(2);
    list.add(3);
    System.out.println(list); // [1, 2, 3]

    Set<String> set = new CopyOnWriteArraySet<>();
    set.add("apple");
    set.add("banana");
    set.add("apple");
    System.out.println(set); // [apple, banana]
    ```

- `java.util.concurrent.LinkedBlockingQueue<E>`  
Biến thể an toàn luồng của `LinkedList`, cài đặt interface `BlockingQueue`. Nó hữu ích để cài đặt mẫu producer-consumer, nơi một hay nhiều thread sản xuất phần tử rồi đặt vào hàng đợi, và một hay nhiều thread tiêu thụ lấy phần tử ra khỏi hàng đợi để xử lý. Nếu hàng đợi rỗng, phía tiêu thụ sẽ bị chặn cho tới khi có phần tử. Nếu hàng đợi đầy, phía sản xuất sẽ bị chặn cho tới khi có chỗ trống:

    ```java
    BlockingQueue<String> queue = new LinkedBlockingQueue<>(10);

    // Producer thread
    new Thread(() -> {
        try {
            for (int i = 0; i < 20; i++) {
                queue.put("item-" + i);
                System.out.println("Produced: " + "item-" + i);
            }
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }).start();

    // Consumer thread
    new Thread(() -> {
        try {
            for (int i = 0; i < 20; i++) {
                String item = queue.take();
                System.out.println("Consumed: " + item);
            }
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }).start();
    ```

Trong ví dụ này, thread sản xuất cố đặt 20 phần tử vào hàng đợi, nhưng hàng đợi có sức chứa tối đa là 10. Khi chạm giới hạn, phía sản xuất sẽ bị chặn cho tới khi phía tiêu thụ lấy bớt phần tử ra. Thread tiêu thụ liên tục lấy phần tử khỏi hàng đợi và xử lý. Nếu hàng đợi rỗng, phía tiêu thụ sẽ bị chặn cho tới khi phía sản xuất đặt thêm phần tử vào.

Khi chạy ví dụ trên, kết quả cụ thể có thể khác nhau do các thread chạy đồng thời.

Ngoài những class chuyên dụng cho tính đồng thời này, class `java.util.Collections` cũng cung cấp method để lấy phiên bản đã đồng bộ hoá của collection thông thường. Những lớp bọc đồng bộ này thêm một tầng an toàn luồng quanh một collection không đồng thời có sẵn.

Một số ví dụ về các method đó:
- `synchronizedCollection(Collection<T> c)`

- `synchronizedList(List<T> list)`

- `synchronizedMap(Map<K,V> m)`  

- `synchronizedNavigableMap(NavigableMap<K,V> m)`  

- `synchronizedNavigableSet(NavigableSet<T> s)`  

- `synchronizedSet(Set<T> s)`  

- `synchronizedSortedMap(SortedMap<K,V> m)`  

- `synchronizedSortedSet(SortedSet<T> s)` 

Ví dụ, để tạo phiên bản đồng bộ hoá của một `ArrayList`:
```java
List<String> list = new ArrayList<>();
List<String> syncList = Collections.synchronizedList(list);
```

Giờ `syncList` là một collection an toàn luồng, nhiều thread truy cập và sửa đổi an toàn được. Tuy nhiên, việc đồng bộ hoá diễn ra ở mức method, nghĩa là mỗi method của collection đều được synchronized. Điều này hạn chế tính đồng thời so với những concurrent collection chuyên dụng vốn thường dùng kỹ thuật tinh vi hơn như thao tác CAS và thuật toán không chặn.

Nói chung, nên dùng trực tiếp các class concurrent collection, vì chúng được thiết kế từ đầu cho tính đồng thời cao. Những lớp bọc đồng bộ hữu ích khi bạn cần thêm thread-safety cho một collection có sẵn, hoặc khi dùng một loại collection ít gặp không có bản đồng thời tương ứng trực tiếp.

## Parallel stream

Trong thế giới Java stream, có một tính năng giúp nâng cao đáng kể hiệu năng khi làm việc với tập dữ liệu lớn: **parallel stream** (stream song song).

Parallel stream là stream chia các phần tử của nó thành nhiều mảnh, xử lý mỗi mảnh bằng một thread khác nhau một cách song song. Điều này tăng tốc đáng kể các thao tác trên tập dữ liệu lớn nhờ tận dụng sức mạnh của bộ xử lý đa nhân.

Tuy nhiên, có một mối bận tâm quan trọng khi dùng parallel stream: **thứ tự phần tử**. Khác stream tuần tự thông thường, thứ tự phần tử trong parallel stream không được đảm bảo trừ khi được ép buộc tường minh. Nghĩa là những thao tác như `forEach` vốn dựa vào thứ tự duyệt có thể cho ra kết quả bất ngờ.
```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
numbers.parallelStream().forEach(System.out::println);
```

Khi chạy ví dụ trên, kết quả sẽ hiện ra theo thứ tự khó đoán. Ví dụ:
```
7
6
8
9
10
1
3
5
4
2
```

Một cân nhắc then chốt khác khi dùng parallel stream là tránh lambda expression có trạng thái (stateful). Lambda stateful là lambda sửa đổi trạng thái dùng chung giữa các lần gọi. Trong parallel stream, nhiều thread có thể chạy cùng một lambda đồng thời, dẫn tới race condition và hành vi khó đoán nếu lambda đó stateful:
```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);
int[] state = {0}; // Shared state

numbers.parallelStream().forEach(n -> {
    // Simulate some processing time
    try {
        Thread.sleep(100);
    } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
    }
    state[0] += n; // Stateful lambda, unsafe
});

System.out.println(state[0]); // Unpredictable result due to race conditions
```

Trong ví dụ này, ta dùng một mảng để giữ trạng thái dùng chung, cho phép sửa nó bên trong lambda expression. Lời gọi `Thread.sleep(100)` tạo ra một độ trễ nhỏ, làm tăng khả năng xảy ra race condition. Có lúc kết quả là 15. Lúc khác lại là 13 hoặc con số nào đó.

Để tránh những vấn đề này, cần dùng lambda expression **stateless** khi làm việc với parallel stream.

### Tạo parallel stream

Có vài cách tạo parallel stream trong Java:

1. Dùng method `parallelStream()` trên một collection:

    ```java
    List<String> list = Arrays.asList("a", "b", "c");
    Stream<String> parallelStream = list.parallelStream();
    ```

2. Dùng method `parallel()` trên một stream có sẵn:

    ```java
    List<String> list = Arrays.asList("a", "b", "c");
    Stream<String> stream = list.stream();
    Stream<String> parallelStream = stream.parallel();
    ```

3. Dùng `StreamSupport.stream()` với cờ song song đã nêu:

    ```java
    List<String> list = Arrays.asList("a", "b", "c");
    boolean isParallel = true;
    Stream<String> parallelStream = StreamSupport.stream(list.spliterator(), isParallel);
    ```

### Phân rã song song (parallel decomposition)

Phân rã song song là quá trình chia một tác vụ thành những tác vụ con nhỏ hơn, độc lập, xử lý được đồng thời, rồi kết hợp kết quả để tạo ra đầu ra cuối cùng. Đây là khái niệm nền tảng của tính toán song song, và là chìa khoá để hiểu parallel stream hoạt động thế nào ở bên dưới.

Khi bạn gọi một thao tác kết thúc trên parallel stream, Java runtime thực hiện phân rã song song stream ở hậu trường. Việc này gồm vài bước:

1. **Chia stream thành các stream con**: Stream gốc được chia thành nhiều stream con nhỏ hơn. Việc chia thường mang tính đệ quy và không nhất thiết khớp trực tiếp với số nhân của bộ xử lý. Mỗi stream con đại diện cho một phần của stream gốc, xử lý được độc lập, cho phép tận dụng tối ưu tài nguyên tính toán.

2. **Xử lý từng stream con độc lập**: Mỗi stream con được xử lý bởi một thread riêng từ `ForkJoinPool` — thread pool có sẵn của Java cho việc thực thi song song. `ForkJoinPool` dùng thuật toán work-stealing để cân bằng tải và phân bổ tác vụ động giữa các thread. Điều này cho phép nhiều stream con được xử lý đồng thời, tận dụng sức mạnh của bộ xử lý đa nhân. Mỗi thread áp dụng các thao tác stream lên stream con được giao, độc lập với những thread khác.

3. **Kết hợp kết quả**: Khi mọi stream con đã được xử lý, kết quả riêng của chúng cần được kết hợp để tạo ra kết quả cuối. Quá trình kết hợp cũng tận dụng khả năng của `ForkJoinPool` để song song hoá bước này, nhất là với những thao tác có tính kết hợp. Cách kết hợp cụ thể phụ thuộc vào thao tác kết thúc. Ví dụ với thao tác `reduce`, kết quả rút gọn của từng stream con được kết hợp bằng hàm tích luỹ được cung cấp. Với thao tác `collect`, kết quả được kết hợp bằng hàm combiner được cung cấp.

Xét ví dụ sau:
```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
int sum = numbers.parallelStream().reduce(0, Integer::sum);
System.out.println(sum); // Output: 55
```

Trong ví dụ này, thao tác `reduce` được thực hiện song song. Stream được chia thành các stream con, mỗi stream con được cộng độc lập, rồi kết quả được kết hợp để tạo ra tổng cuối.

Đây là hình dung trực quan quá trình đó:

```
          [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
                         |
                     Split into
                     substreams
          ______________|________________
         |     |         |     |     |   |
       [1, 2] [3, 4] [5, 6] [7, 8] [9, 10]
         |     |     |     |     |     |
    Process each substream independently
         |     |     |     |     |     |
       [3]   [7]   [11]  [15]  [19]
         \     |     |     |     /
          \    |     |     |    /
         Combine the subresults
                    |
                  [55]
```

Sức mạnh của phân rã song song nằm ở khả năng chia nhỏ một tác vụ lớn thành những mảnh dễ quản lý hơn, xử lý được đồng thời. Điều này mang lại cải thiện hiệu năng đáng kể, nhất là với những tác vụ tính toán nặng trên tập dữ liệu lớn.

Tuy nhiên, cần lưu ý rằng không phải mọi thao tác đều song song hoá hiệu quả được. Để phân rã song song hoạt động, các tác vụ con phải **độc lập** — nghĩa là việc xử lý một tác vụ con không được phụ thuộc vào kết quả của tác vụ con khác. Đây chính là lý do lambda expression stateful gây vấn đề trong parallel stream: chúng tạo ra phụ thuộc giữa các tác vụ con.

Thêm nữa, chi phí chia stream và kết hợp kết quả cũng cần được tính tới. Với stream nhỏ hoặc thao tác đơn giản, chi phí phân rã song song có thể lớn hơn lợi ích của việc xử lý đồng thời. Java runtime cố ra quyết định thông minh về việc khi nào nên song song hoá một stream dựa trên những yếu tố như kích thước stream và độ phức tạp của thao tác, nhưng bạn vẫn cần hiểu hệ quả của việc dùng parallel stream trong tình huống cụ thể của mình.

### Những method của Stream thực hiện tác vụ dựa trên thứ tự

Có những thao tác dựa vào thứ tự duyệt của phần tử. Chúng được gọi là tác vụ dựa trên thứ tự (order-based task), và có thể hành xử khác khi dùng với parallel stream so với stream tuần tự. Hãy xem kỹ hơn một số method này và hệ quả của chúng.

#### `forEach` và `forEachOrdered`

Cần hiểu rõ khác biệt giữa hai thao tác kết thúc `forEach` và `forEachOrdered`.

Thao tác `forEach`, như đã thấy, dùng để thực hiện một hành động trên từng phần tử của stream. Khi dùng với parallel stream, `forEach` **không** đảm bảo thứ tự xử lý phần tử. Mỗi stream con được một thread khác nhau xử lý độc lập, và thứ tự lập lịch cho các thread là không xác định.

```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);
numbers.parallelStream().forEach(System.out::println);
// Possible output: 3, 1, 4, 2, 5
```

Trong ví dụ này, các số có thể được in theo thứ tự bất kỳ, tuỳ vào cách parallel stream được chia và cách các thread được lập lịch.

Thứ tự không xác định này lại có lợi trong một số tình huống. Ví dụ, nếu bạn thực hiện thao tác mà thứ tự không quan trọng — như thêm phần tử vào một collection an toàn luồng hay cập nhật bộ đếm một cách an toàn luồng — `forEach` tăng đáng kể hiệu năng bằng cách cho phép thao tác chạy song song mà không tốn chi phí duy trì thứ tự.

Ngược lại, `forEachOrdered` đảm bảo hành động được thực hiện trên các phần tử **theo đúng thứ tự duyệt**, ngay cả khi dùng với parallel stream. Nghĩa là phần tử được xử lý theo cùng thứ tự như trong stream tuần tự, dù việc xử lý diễn ra song song.

```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);
numbers.parallelStream().forEachOrdered(System.out::println);
// Output: 1, 2, 3, 4, 5
```

Trong trường hợp này, các số luôn được in theo thứ tự gốc, bất kể parallel stream được chia và xử lý thế nào.

Tuy nhiên, sự đảm bảo về thứ tự này có cái giá của nó. Để duy trì thứ tự duyệt, `forEachOrdered` đưa vào một mức độ đồng bộ hoá và giao tiếp giữa các thread xử lý stream con. Điều này làm giảm lợi ích hiệu năng của tính song song, nhất là với stream lớn hoặc thao tác phức tạp.

Vậy khi nào nên dùng `forEach`, khi nào nên dùng `forEachOrdered`? Câu trả lời phụ thuộc vào tình huống cụ thể của bạn.

Dùng `forEach` khi:
- Thứ tự xử lý không quan trọng.
- Bạn thực hiện những thao tác an toàn luồng (như thêm vào `ConcurrentHashMap`).
- Bạn muốn tối đa hoá hiệu năng và tính song song.

Dùng `forEachOrdered` khi:
- Thứ tự xử lý là quan trọng.
- Bạn thực hiện những thao tác phụ thuộc thứ tự (như in ra, thêm vào một `List`).
- Bạn sẵn sàng hy sinh một phần hiệu năng để có thứ tự xác định.

Đáng lưu ý rằng trong nhiều trường hợp, nếu bạn cần thứ tự xác định thì dùng stream tuần tự có thể hiệu quả hơn là dùng parallel stream với `forEachOrdered`. Stream tuần tự giữ thứ tự duyệt một cách tự nhiên, không tốn chi phí phân rã song song và đồng bộ hoá.

#### `findFirst()`

Method `findFirst()` trả về một `Optional` mô tả phần tử đầu tiên của stream, hoặc `Optional` rỗng nếu stream rỗng. Với stream tuần tự, điều này rất trực tiếp: nó đơn giản trả về phần tử đầu tiên gặp trong stream.

```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);
Optional<Integer> first = numbers.stream().findFirst();
System.out.println(first.get()); // Output: 1
```

Tuy nhiên, khi dùng với parallel stream, `findFirst()` trả về phần tử đầu tiên từ stream con đầu tiên tạo ra kết quả. Vì thứ tự xử lý các stream con là không xác định, phần tử mà `findFirst()` trả về trên parallel stream có thể không phải lúc nào cũng giống nhau.

```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);
Optional<Integer> first = numbers.parallelStream().findFirst();
System.out.println(first.get()); // Output: non-deterministic (could be 1, 2, 3, 4, or 5)
```

#### `limit()`

Method `limit()` trả về stream gồm `n` phần tử đầu của stream gốc. Với stream tuần tự, điều này lại rất trực tiếp: nó đơn giản trả về `n` phần tử đầu theo thứ tự duyệt.

```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);
numbers.stream().limit(3).forEach(System.out::println);
// Output: 1, 2, 3
```

Khi dùng với parallel stream, `limit()` trả về `n` phần tử đầu từ stream, nhưng thứ tự trả về có thể không khớp thứ tự duyệt. Lý do là mỗi stream con được xử lý độc lập, và `n` phần tử đầu từ kết quả gộp của các stream con được trả về.

```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);
numbers.parallelStream().limit(3).forEach(System.out::println);
// Possible output: 1, 3, 2
```

#### `skip()`

Method `skip()` là bổ trợ của `limit()`. Nó trả về stream gồm những phần tử còn lại của stream gốc sau khi bỏ đi `n` phần tử đầu. Với stream tuần tự, nó bỏ `n` phần tử đầu theo thứ tự duyệt.

```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);
numbers.stream().skip(3).forEach(System.out::println);
// Output: 4, 5
```

Với parallel stream, `skip()` bỏ `n` phần tử đầu từ kết quả gộp của các stream con. Tuy nhiên, vì các stream con được xử lý độc lập, những phần tử bị bỏ có thể không phải `n` phần tử đầu theo thứ tự duyệt.

```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);
numbers.parallelStream().skip(3).forEach(System.out::println);
// Possible output: 5, 4 (but could also be 1, 5 or 2, 4 or other combinations)
```

Hành vi không xác định của những method dựa trên thứ tự này khi dùng với parallel stream dẫn tới kết quả bất ngờ và có thể sai nếu không được xử lý đúng. Nếu thao tác của bạn dựa vào thứ tự duyệt của phần tử, nhìn chung dùng stream tuần tự sẽ an toàn hơn.

Tuy nhiên, có những tình huống thứ tự không xác định là chấp nhận được, thậm chí đáng mong muốn. Ví dụ, nếu bạn dùng `findFirst()` để tìm bất kỳ phần tử nào khớp một predicate và không quan tâm phần tử khớp nào được trả về, dùng parallel stream sẽ tăng hiệu năng.

Như mọi khía cạnh của lập trình song song, chìa khoá là hiểu hành vi và hệ quả của những method bạn đang dùng, và cân nhắc cẩn thận xem lợi ích hiệu năng tiềm năng có đáng với rủi ro kết quả không xác định hay không.

### Rút gọn parallel stream

Những thao tác rút gọn như `reduce()`, `collect()` và `sum()` là công cụ mạnh để kết hợp các phần tử của stream thành một kết quả duy nhất. Khi dùng với parallel stream, chúng mang lại lợi ích hiệu năng đáng kể bằng cách cho phép việc rút gọn diễn ra đồng thời trên nhiều stream con. Tuy nhiên, có vài cái bẫy cần lưu ý, đặc biệt là việc chọn hàm tích luỹ.

Hàm tích luỹ (accumulator) kết hợp các phần tử trong một thao tác rút gọn. Ví dụ, ở method `reduce()`, hàm tích luỹ nhận hai tham số: kết quả rút gọn cục bộ tới thời điểm đó, và phần tử kế tiếp cần đưa vào.

```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);
int sum = numbers.parallelStream().reduce(0, Integer::sum);
System.out.println(sum); // Output: 15
```

Trong ví dụ này, hàm tích luỹ là `Integer::sum`, chỉ đơn giản cộng hai số nguyên.

Để phép rút gọn trong parallel stream cho ra kết quả đúng, hàm tích luỹ phải có **tính kết hợp** (associative) và **không giữ trạng thái** (stateless). Hàm có tính kết hợp là hàm mà thứ tự áp dụng không quan trọng, tức `(a op b) op c` bằng `a op (b op c)`, với `op` là hàm tích luỹ.

Tuy nhiên, một số hàm tích luỹ gây vấn đề trong parallel stream. Ví dụ, dùng một accumulator khả biến:

```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);
ArrayList<Integer> list = numbers.parallelStream().reduce(
        new ArrayList<>(),
        (l, i) -> { l.add(i); return l; },
        (l1, l2) -> { l1.addAll(l2); return l1; });
System.out.println(list); // Output: non-deterministic (could be [1, 2, 3, 4, 5], [1, 3, 5, 2, 4], etc.)
```

Kết quả không xác định vì ta dùng một `ArrayList` khả biến làm accumulator. Các lambda expression sửa cùng một `ArrayList` đồng thời từ nhiều thread, dẫn tới race condition và kết quả không xác định.

Để tránh những vấn đề này và đảm bảo kết quả đúng, xác định từ phép rút gọn song song, hãy tuân theo những thực hành tốt sau:

1. **Dùng hàm tích luỹ có tính kết hợp và không giữ trạng thái.** Nếu hàm tích luỹ của bạn không có tính kết hợp, hãy cân nhắc dùng stream tuần tự.

2. **Tránh dùng accumulator khả biến.** Nếu bạn cần thu thập kết quả vào một container khả biến, hãy dùng method `collect()` với một concurrent collector như `toConcurrentMap()`, thay vì `reduce()`. Concurrent collector được thiết kế để xử lý an toàn việc sửa đổi song song.

3. **Thận trọng với số học dấu phẩy động.** Do hạn chế của biểu diễn dấu phẩy động, phép cộng và nhân số thực không hoàn toàn có tính kết hợp. Nếu cần độ chính xác tuyệt đối, hãy cân nhắc dùng stream tuần tự hoặc một cách biểu diễn số khác.

4. **Kiểm thử kỹ các phép rút gọn.** Hãy thử với những kích thước stream và mức độ song song khác nhau để đảm bảo chúng cho ra kết quả nhất quán và đúng đắn.

### Kết hợp kết quả trong parallel stream

Method `collect()` là thao tác kết thúc cho phép bạn tích luỹ phần tử của stream vào một collection hay cấu trúc dữ liệu khác. Khi dùng với parallel stream, `collect()` mang lại lợi ích hiệu năng đáng kể bằng cách cho phép việc tích luỹ diễn ra đồng thời trên nhiều stream con. Tuy nhiên, để đảm bảo hoạt động đúng và hiệu quả, có vài điều cần cân nhắc.

Nhớ rằng method `collect()` nhận một `Collector`, thứ quy định cách các phần tử của stream được tích luỹ. Một `Collector` được định nghĩa bởi bốn thành phần:

1. Hàm supplier tạo một container kết quả mới.

2. Hàm accumulator thêm một phần tử vào container kết quả.

3. Hàm combiner gộp hai container kết quả thành một.

4. Hàm finisher thực hiện một phép biến đổi cuối tuỳ chọn trên container kết quả.

Class `Collectors` của Java cung cấp rất nhiều collector định sẵn như `toList()`, `toSet()`, `toMap()`, `groupingBy()` và nhiều collector khác.

Khi dùng `collect()` với parallel stream, có vài điểm then chốt cần cân nhắc để đảm bảo hoạt động đúng và hiệu quả:

1. **Collector nên là loại concurrent.** Nghĩa là hàm accumulator và combiner phải an toàn luồng và không được phụ thuộc vào thứ tự xử lý phần tử. Class `Collectors` cung cấp vài concurrent collector như `toConcurrentMap()`, `groupingByConcurrent()`, v.v.:

    ```java
    List<String> strings = Arrays.asList("a", "b", "c", "d", "e");
    ConcurrentMap<String, Integer> map = strings.parallelStream()
            .collect(Collectors.toConcurrentMap(s -> s, s -> 1, Integer::sum));
    System.out.println(map); // Output: {a=1, b=1, c=1, d=1, e=1}
    ```

2. **Nếu collector không phải loại concurrent, hãy cân nhắc dùng container kết quả concurrent.** Ví dụ, bạn thu thập vào `ConcurrentHashMap` hay `CopyOnWriteArrayList`:

    ```java
    List<String> strings = Arrays.asList("a", "b", "c", "d", "e");
    ConcurrentHashMap<String, Integer> map = strings.parallelStream()
            .collect(ConcurrentHashMap::new, 
                     (m, s) -> m.put(s, 1), 
                     ConcurrentHashMap::putAll);
    System.out.println(map); // Output: {a=1, b=1, c=1, d=1, e=1}
    ```

3. **Cẩn thận với những collector phụ thuộc thứ tự.** Những collector như `Collectors.toList()` và `Collectors.toCollection(ArrayList::new)` giữ thứ tự duyệt của phần tử trong stream tuần tự, nhưng không nhất thiết trong parallel stream. Nếu thứ tự phần tử trong kết quả là quan trọng, hãy cân nhắc dùng `Collectors.toCollection(LinkedHashSet::new)`, hoặc thu thập vào container concurrent rồi sao sang container có thứ tự:

    ```java
    List<String> strings = Arrays.asList("a", "b", "c", "d", "e");
    List<String> list = strings.parallelStream()
            .collect(Collectors.toCollection(CopyOnWriteArrayList::new))
            .stream()
            .sorted()
            .collect(Collectors.toList());
    System.out.println(list); // Output: [a, b, c, d, e]
    ```

4. **Cân nhắc các đặc tính của collector.** Interface `Collector` định nghĩa ba đặc tính (`java.util.stream.Collector.Characteristics`):
    - `CONCURRENT`: Cho biết collector này là concurrent, nghĩa là container kết quả hỗ trợ việc hàm accumulator được gọi đồng thời trên cùng container kết quả từ nhiều thread.
    - `UNORDERED`: Cho biết thao tác thu thập không cam kết giữ thứ tự duyệt của phần tử đầu vào.
    - `IDENTITY_FINISH`: Cho biết hàm finisher là hàm đồng nhất và bỏ đi được.

Những đặc tính này cung cấp gợi ý cho framework stream về cách tối ưu hoá collector. Ví dụ, nếu một collector là `UNORDERED`, framework stream tự do sắp xếp lại phần tử, mở đường cho một số tối ưu hoá:

```java
List<String> strings = Arrays.asList("a", "b", "c", "d", "e");
Set<String> set = strings.parallelStream()
        .collect(Collectors.toUnmodifiableSet()); // UNORDERED collector
System.out.println(set); // Output: [a, b, c, d, e] (possibly in a different order)
```

Bằng cách hiểu những cân nhắc này và chọn collector phù hợp cho tình huống của mình, bạn khai thác hiệu quả sức mạnh của `collect()` với parallel stream để đạt cải thiện hiệu năng đáng kể trong các thao tác dựa trên stream.

Ngoài những collector định sẵn mà class `Collectors` cung cấp, bạn cũng tạo được collector riêng bằng method `Collector.of()`. Điều này cho phép bạn tự định nghĩa hàm supplier, accumulator, combiner và finisher để thu thập phần tử vào một cấu trúc dữ liệu tuỳ biến hoặc thực hiện một thao tác tích luỹ tuỳ biến.

Đây là ví dụ dùng stream tuần tự để nối chuỗi, đảm bảo kết quả xác định và hiệu năng tốt hơn:

```java
List<String> strings = Arrays.asList("a", "b", "c", "d", "e");

String concatenated = strings.stream() // Using a sequential stream
    .collect(Collector.of(
        StringBuilder::new,                // Supplier
        StringBuilder::append,             // Accumulator
        (sb1, sb2) -> {
            sb1.append(sb2);
            return sb1;
        },                                 // Combiner
        StringBuilder::toString            // Finisher
    ));

System.out.println(concatenated); // Output: abcde
```

Trong ví dụ này, ta dùng stream tuần tự để nối một danh sách chuỗi thành một chuỗi duy nhất. Một collector tuỳ biến được tạo bằng `Collector.of()`, với `StringBuilder` làm container tích luỹ chuỗi. Method `StringBuilder::append` được dùng làm accumulator, đảm bảo chuỗi được nối đúng thứ tự. Combiner được định nghĩa để gộp các instance `StringBuilder` khi xử lý song song, nhưng vì ta dùng stream tuần tự nên phép nối diễn ra hiệu quả và xác định. Cuối cùng, method `StringBuilder::toString` được dùng làm finisher để tạo ra chuỗi nối cuối cùng. Cách này đảm bảo đúng thứ tự phần tử và hiệu năng tối ưu cho việc nối chuỗi.

Tuy nhiên, nối chuỗi vốn dĩ mang tính tuần tự, và dùng parallel stream ở đây nhiều khả năng kém hiệu quả hơn dùng stream tuần tự. Thực tế, kết quả của thao tác này là không xác định với parallel stream, vì thứ tự gộp các stream con không được đảm bảo.

Một ví dụ tốt hơn cho parallel stream với collector tuỳ biến nên là tác vụ hưởng lợi từ xử lý song song và có thứ tự phần tử được định nghĩa rõ. Xét ví dụ cộng các số nguyên, nơi xử lý song song mang lại lợi ích hiệu năng:

```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);
Integer sum = numbers.parallelStream() // Using a parallel stream
    .collect(Collector.of(
        () -> new int[1],               // Supplier
        (a, t) -> a[0] += t,            // Accumulator
        (a1, a2) -> {
            a1[0] += a2[0];
            return a1;
        },                              // Combiner
        a -> a[0]                       // Finisher
    ));

System.out.println(sum); // Output: 15
```

Trong ví dụ này, một collector tuỳ biến được định nghĩa bằng `Collector.of()`, với một mảng số nguyên làm container giữ tổng. Hàm accumulator cộng từng số nguyên vào phần tử duy nhất của mảng, còn hàm combiner gộp hai mảng bằng cách cộng phần tử của chúng. Hàm finisher lấy giá trị tổng ra khỏi mảng.

Tuy nhiên, việc tạo collector tuỳ biến vừa đúng vừa hiệu quả cho parallel stream là điều khó. Nó đòi hỏi hiểu sâu về tính đồng thời, an toàn luồng, cùng các đặc tính của stream và collector. Nếu có thể, nhìn chung nên dùng những collector định sẵn hoặc kết hợp chúng để đạt được thao tác mong muốn.

## Các điểm chính

- Thread cho phép nhiều luồng thực thi diễn ra đồng thời bên trong một chương trình.

- Trong Java 21 có hai loại thread: platform thread và virtual thread.

- Platform thread là thread truyền thống, ánh xạ trực tiếp tới thread của hệ điều hành.

- Virtual thread là thread nhẹ do Java Virtual Machine (JVM) quản lý.

- Để tạo platform thread, bạn kế thừa class `Thread`, implement interface `Runnable`, hoặc dùng `Thread.Builder.OfPlatform`.

- Virtual thread tạo được bằng `Thread.ofVirtual()`, `Thread.startVirtualThread()`, hoặc một `ThreadFactory` từ `Thread.ofVirtual().factory()`.

- Virtual thread đặc biệt hiệu quả với tác vụ thiên về I/O nhưng không phù hợp với thao tác nặng CPU kéo dài.

- Virtual thread luôn là thread daemon và có độ ưu tiên cố định, không đổi được.

- Method `start()` khởi tạo một thread mới thực thi mã định nghĩa trong method `run()`.

- Method `sleep()` khiến thread hiện tại tạm dừng thực thi trong số mili-giây đã nêu.

- Method `interrupt()` dùng để đánh thức sớm một thread đang ngủ hay đang chờ.

- Các trạng thái trong vòng đời thread gồm `NEW`, `RUNNABLE`, `BLOCKED`, `WAITING`, `TIMED_WAITING` và `TERMINATED`.

- Những vấn đề phổ biến với thread gồm:
  - Deadlock: Khi hai hay nhiều thread không tiến triển được vì mỗi thread chờ tài nguyên do thread khác giữ.
  - Starvation: Khi một thread liên tục bị từ chối truy cập tài nguyên dùng chung cần thiết để tiến triển.
  - Livelock: Khi các thread liên tục phản ứng với nhau nhưng không tiến triển được.
  - Race condition: Khi hành vi chương trình phụ thuộc vào thời điểm tương đối của việc thực thi các thread.

- Để ngăn race condition, dùng những cơ chế đồng bộ như lock, biến atomic, hoặc cấu trúc dữ liệu đồng thời.

- Quản lý thread và đồng bộ hoá đúng cách là điều then chốt để viết chương trình đồng thời hiệu quả và không lỗi.

- Thread-safety đảm bảo mã thực thi đúng trong môi trường đa luồng, duy trì tính nhất quán và khả năng nhìn thấy của dữ liệu.

- Keyword `volatile` đảm bảo thay đổi trên biến lập tức được các thread nhìn thấy, nhưng không cung cấp tính nguyên tử cho thao tác ghép.

- Các class atomic (như `AtomicInteger`, `AtomicBoolean`) cho phép thao tác an toàn luồng trên từng biến mà không cần đồng bộ hoá tường minh.

- Keyword `synchronized` dùng được trên method hay khối để đảm bảo truy cập độc quyền vào tài nguyên dùng chung, ngăn race condition.

- Interface `Lock` cung cấp quyền kiểm soát linh hoạt và mịn hơn so với `synchronized`, gồm những tính năng như thử giành lock có giới hạn thời gian và kiểm soát tính công bằng.

- `CyclicBarrier` cho phép một số thread cố định chờ nhau tại một điểm đồng bộ chung trước khi đi tiếp.

- Interface `ExecutorService` quản lý thread pool và việc thực thi tác vụ, cung cấp method để nộp và quản lý tác vụ đồng thời.

- Interface `Callable` biểu diễn một tác vụ trả về kết quả và ném được exception, khác `Runnable` vốn không trả về giá trị.

- `ScheduledExecutorService` cho phép lập lịch tác vụ chạy sau hoặc chạy định kỳ.

- Class `Executors` cung cấp factory method để tạo các loại thread pool và executor service khác nhau (như `newFixedThreadPool`, `newCachedThreadPool`).

- Virtual thread, được giới thiệu ở những phiên bản Java gần đây, là lựa chọn nhẹ thay cho platform thread trong lập trình đồng thời.

- Method `Executors.newVirtualThreadPerTaskExecutor()` tạo một `ExecutorService` sinh ra một virtual thread mới cho mỗi tác vụ được nộp, lý tưởng cho những thao tác thiên về I/O.

- Khi dùng virtual thread, hãy tập trung vào việc biểu diễn **tác vụ** thành thread, thay vì quản lý kích thước thread pool cố định.

- Virtual thread cho lợi ích rõ rệt khi ứng dụng của bạn tận dụng được hàng nghìn thread đồng thời, đặc biệt với tác vụ thiên về I/O.

- Concurrent collection là lựa chọn an toàn luồng thay cho collection thông thường trong môi trường đa luồng.

- Những concurrent collection then chốt gồm:
  - `ConcurrentHashMap<K,V>`: Phiên bản an toàn luồng của `HashMap`.
  - `ConcurrentLinkedQueue<E>`: Hàng đợi an toàn luồng dựa trên các nút liên kết.
  - `ConcurrentSkipListMap<K,V>`: Phiên bản đồng thời của `TreeMap`.
  - `ConcurrentSkipListSet<E>`: Phiên bản đồng thời, mở rộng tốt của `TreeSet`.
  - `CopyOnWriteArrayList<E>` và `CopyOnWriteArraySet<E>`: Biến thể an toàn luồng của `ArrayList` và `HashSet`.
  - `LinkedBlockingQueue<E>`: Biến thể an toàn luồng của `LinkedList`, cài đặt interface `BlockingQueue`.

- Class `Collections` cung cấp method để lấy phiên bản đồng bộ hoá của collection thông thường (như `synchronizedList()`, `synchronizedMap()`).

- Parallel stream chia phần tử thành nhiều mảnh để xử lý đồng thời.

- Parallel stream được tạo bằng `parallelStream()` trên collection hoặc `parallel()` trên stream có sẵn.

- Thứ tự phần tử trong parallel stream không được đảm bảo trừ khi được ép buộc tường minh.

- Tránh lambda expression stateful trong parallel stream để ngăn race condition.

- Phân rã song song gồm việc chia stream, xử lý các stream con độc lập, rồi kết hợp kết quả. Nó hiệu quả với tập dữ liệu lớn và tác vụ tính toán nặng.

- Với những thao tác stream dựa trên thứ tự:
  - `forEach()`: Không đảm bảo thứ tự trong parallel stream.
  - `forEachOrdered()`: Giữ thứ tự duyệt ngay cả trong parallel stream, nhưng có thể làm giảm lợi ích hiệu năng.
  - `findFirst()`: Trả về phần tử đầu từ stream con được xử lý đầu tiên trong parallel stream.
  - `limit()` và `skip()`: Có thể không giữ thứ tự duyệt trong parallel stream.

- Những thao tác rút gọn (`reduce()`, `collect()`, `sum()`) thực hiện được đồng thời trên các stream con.

- Hàm tích luỹ phải có tính kết hợp và không giữ trạng thái thì phép rút gọn song song mới đúng.

- Tránh dùng accumulator khả biến trong parallel stream.

- Cẩn thận với số học dấu phẩy động trong phép rút gọn song song.

- Để kết hợp kết quả trong parallel stream, hãy dùng concurrent collector (như `toConcurrentMap()`, `groupingByConcurrent()`) để đảm bảo an toàn luồng.

- Cân nhắc dùng container kết quả concurrent (như `ConcurrentHashMap`, `CopyOnWriteArrayList`) với những collector không phải loại concurrent.

- Lưu ý những collector phụ thuộc thứ tự và hành vi của chúng trong parallel stream.

- Interface `Collector` định nghĩa ba đặc tính (`java.util.stream.Collector.Characteristics`):
    - `CONCURRENT`: Cho biết collector này là concurrent, nghĩa là container kết quả hỗ trợ việc hàm accumulator được gọi đồng thời trên cùng container kết quả từ nhiều thread.
    - `UNORDERED`: Cho biết thao tác thu thập không cam kết giữ thứ tự duyệt của phần tử đầu vào.
    - `IDENTITY_FINISH`: Cho biết hàm finisher là hàm đồng nhất và bỏ đi được.

- Collector tuỳ biến tạo được bằng method `Collector.of()`. Chúng đòi hỏi cân nhắc kỹ về an toàn luồng và hiệu quả cho parallel stream. Nhìn chung, hãy ưu tiên collector định sẵn hoặc kết hợp chúng khi có thể.
