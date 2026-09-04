---
title: "Làm Chủ Java Collections Framework & Generics"
description: Toàn tập về cấu trúc dữ liệu trong Java: List (ArrayList vs LinkedList), Set (HashSet, TreeSet), Map (HashMap, TreeMap), hợp đồng equals() & hashCode(), cùng kỹ thuật Generics nâng cao và Wildcards (? extends, ? super).
order: 1
featured: true
tags: [Java, Collections, Generics, HashMap, ArrayList, Data-Structures]
readingMinutes: 16
---

# Làm Chủ Java Collections Framework & Generics

Java Collections Framework (JFC) cung cấp hệ thống cấu trúc dữ liệu và giải thuật phong phú được tối ưu hoá sẵn, là phần kiến thức xuất hiện trong mọi cuộc phỏng vấn Java.

---

## 1. Cấu Trúc Tổng Quan Của Collections Framework

Tất cả các cấu trúc dạng tập hợp (trừ `Map`) đều kế thừa từ interface gốc `java.util.Collection`:

```text
               Iterable
                  │
              Collection
         ┌────────┼────────┐
       List      Set     Queue/Deque
```

`Map` đứng độc lập biểu diễn cấu trúc ánh xạ khoá - giá trị (*Key-Value Pair*): `java.util.Map`.

---

## 2. Phân Biệt Các Cấu Trúc Cốt Lõi

### 1. Phân hệ List (Có thứ tự, cho phép phần tử trùng lặp):
- **`ArrayList`:** Dựa trên mảng động (*dynamic array*). Truy xuất ngẫu nhiên cực nhanh theo chỉ số $O(1)$. Thêm/xoá ở giữa mảng tốn kém $O(n)$ do phải dịch chuyển các phần tử.
- **`LinkedList`:** Dựa trên danh sách liên kết đôi (*doubly linked list*). Thêm/xoá ở đầu/cuối rất nhanh $O(1)$, nhưng truy xuất ngẫu nhiên tốn $O(n)$. Tốn nhiều bộ nhớ do phải lưu node pointers.

### 2. Phân hệ Set (Không trùng lặp):
- **`HashSet`:** Dựa trên bảng băm (`HashMap` ngầm bên dưới). Không bảo đảm thứ tự. Độ phức tạp trung bình các thao tác thêm, xoá, tìm kiếm là $O(1)$.
- **`LinkedHashSet`:** Duy trì thứ tự chèn (*insertion-order*) nhờ danh sách liên kết.
- **`TreeSet`:** Triển khai bằng cây đỏ-đen (*Red-Black Tree*). Luôn tự động sắp xếp các phần tử theo thứ tự tự nhiên hoặc qua `Comparator`. Thao tác tốn $O(\log n)$.

### 3. Phân hệ Map (Ánh xạ Key -> Value):
- **`HashMap`:** Phổ biến nhất, key duy nhất, cho phép 1 key `null`. Khi xảy ra xung đột băm (collision), từ Java 8, bucket sẽ chuyển từ LinkedList sang Red-Black Tree nếu số phần tử vượt ngưỡng 8 và bảng đủ lớn.
- **`ConcurrentHashMap`:** Phiên bản thread-safe tối ưu hoá cao, sử dụng phân đoạn khoá (bucket-level lock) thay vì khoá toàn bộ bảng như `Hashtable`.

---

## 3. Hợp Đồng `equals()` và `hashCode()` (Contract)

Khi dùng một đối tượng làm Key trong `HashMap` hoặc phần tử trong `HashSet`, bạn **BẮT BUỘC** phải ghi đè đồng thời cả `equals()` và `hashCode()` theo nguyên tắc:

1. Nếu `a.equals(b) == true` thì **bắt buộc** `a.hashCode() == b.hashCode()`.
2. Nếu `a.hashCode() == b.hashCode()`, `a` và `b` **chưa chắc** đã bằng nhau (xung đột băm - collision).

Nếu vi phạm nguyên tắc này, `HashMap` sẽ không thể tìm thấy phần tử ngay cả khi key có cùng thuộc tính!

---

## 4. Kỹ Thuật Generics & Wildcards (`PECS`)

Generics giúp kiểm tra kiểu dữ liệu an toàn tại thời điểm biên dịch (*Compile-time Type Safety*) và loại bỏ việc ép kiểu tường minh.

### Nguyên tắc PECS (Producer Extends, Consumer Super):
- **`? extends T` (Upper Bounded Wildcard):** Dùng khi tập hợp đóng vai trò là **Producer** (chỉ đọc dữ liệu ra).
- **`? super T` (Lower Bounded Wildcard):** Dùng khi tập hợp đóng vai trò là **Consumer** (ghi dữ liệu vào).

```java
// Producer: Chỉ đọc số Number ra
public double sumOfList(List<? extends Number> list) {
    double s = 0.0;
    for (Number n : list) s += n.doubleValue();
    return s;
}

// Consumer: Ghi thêm Integer vào
public void addNumbers(List<? super Integer> list) {
    list.add(1);
    list.add(2);
}
```

---

## 5. Tổng Kết

Hiểu sâu bản chất cấu trúc dữ liệu và cơ chế Generics giúp bạn lựa chọn đúng Collection cho từng bài toán hiệu năng. Hãy kiểm tra kiến thức của mình qua 20 câu hỏi quiz dưới đây!