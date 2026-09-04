---
title: "Làm Chủ Java Collections Framework & Generics Chuyên Sâu"
description: Chuyên khảo bách khoa toàn thư: Mổ xẻ giải thuật băm HashMap (Treeify, Rehashing, Load Factor), cơ chế mở rộng ArrayList, Queue/Deque circular buffer, bản chất Type Erasure & Bridge Methods trong Generics và nguyên tắc PECS thực chiến.
order: 1
featured: true
tags: [Java, Collections, HashMap, ArrayList, Generics, DataStructures, TypeErasure]
readingMinutes: 30
---

# Làm Chủ Java Collections Framework & Generics Chuyên Sâu

Java Collections Framework (JCF) là trái tim của mọi ứng dụng Java. Nắm bắt được cấu trúc dữ liệu bên dưới và giải thuật băm phân bổ ô nhớ giúp bạn tối ưu hoá hiệu năng hệ thống lên gấp nhiều lần.

---

## 1. Mổ Xẻ Nội Tại HashMap (HashMap Internals)

`HashMap` là cấu trúc dữ liệu được hỏi nhiều nhất trong các cuộc phỏng vấn Java. Hãy cùng phân tích cách nó hoạt động ở cấp độ mã nguồn OpenJDK.

### 1.1. Cấu Trúc Lưu Trữ & Tính Toán Chỉ Số (Index Calculation)
`HashMap` dựa trên một mảng các Node: `Node<K,V>[] table`.
Kích thước mảng luôn là **luỹ thừa của 2** ($16, 32, 64, \dots$).

Khi gọi `map.put(key, value)`:
1. **Tính Hash Code hỗn hợp:** Trộn bit để hạn chế xung đột:
```java
static final int hash(Object key) {
    int h;
    return (key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16);
}
```
2. **Tính vị trí Bucket Index:** Thay vì dùng phép chia lấy dư `%` chậm chạp, Java dùng phép toán bitwise AND cực nhanh:
$$	ext{index} = (n - 1) \ \& \ 	ext{hash}$$
*(Với $n$ là kích thước mảng luôn là luỹ thừa của 2).*

```text
  Key: "Java"  ──> hashCode()  ──> hash() trộn bit  ──> & (n - 1)  ──> Index: 5
                                                                          │
  Node table[]:                                                           ▼
  [0] -> null                                                      ┌──────────────┐
  [1] -> Node -> Node                                              │ Node("Java") │
  ...                                                              └──────┬───────┘
  [5] ────────────────────────────────────────────────────────────────────┘
```

### 1.2. Cơ Chế Chuyển Đổi Sang Cây Đỏ-Đen (Treeify)
- Trước Java 8: Khi xảy ra va chạm băm (collision), các phần tử được nối vào danh sách liên kết đơn (LinkedList). Nếu bị tấn công Hash Collision DoS, thời gian tìm kiếm rơi về $O(n)$.
- Kể từ Java 8:
  - Khi số phần tử trong 1 bucket đạt tới ngưỡng **`TREEIFY_THRESHOLD = 8`** và tổng dung lượng mảng $\ge 64$, bucket đó sẽ được biến đổi thành **Cây Đỏ-Đen (Red-Black Tree)** với cấu trúc `TreeNode`.
  - Thời gian tìm kiếm và chèn giảm từ $O(n)$ xuống **$O(\log n)$**.
  - Nếu sau các thao tác xoá, số phần tử trong cây giảm xuống dưới **`UNTREEIFY_THRESHOLD = 6`**, nó sẽ được thoái hoá lại thành danh sách liên kết đơn.

### 1.3. Load Factor & Quá Trình Tái Băm (Rehashing)
- **Default Initial Capacity:** 16
- **Default Load Factor:** `0.75f` (Điểm cân bằng tối ưu giữa chi phí thời gian và không gian bộ nhớ).
- Khi $	ext{size} > 	ext{Capacity} 	imes 	ext{LoadFactor}$ (ví dụ $16 	imes 0.75 = 12$), mảng sẽ tăng gấp đôi kích thước ($32$) và thực hiện tái phân bổ lại các phần tử (*Rehash*).

---

## 2. Chi Tiết Các Cấu Trúc Dữ Liệu List & Queue

### 2.1. Giải Thuật Tự Tăng Dung Lượng Của `ArrayList`
Khi mảng `Object[] elementData` đầy, `ArrayList` tự động mở rộng thêm **50% dung lượng cũ**:
```java
// Mã nguồn OpenJDK:
int newCapacity = oldCapacity + (oldCapacity >> 1);
```
- Phép dịch phải `oldCapacity >> 1` tương đương chia đôi, sau đó mảng mới được cấp phát và `System.arraycopy()` sao chép dữ liệu sang mảng mới.

### 2.2. `ArrayDeque` vs `LinkedList` & `Stack`
- **`Stack`:** Lớp cổ từ Java 1.0, kế thừa `Vector`, mọi hàm đều có `synchronized` nên rất chậm.
- **`LinkedList`:** Tốn bộ nhớ vì mỗi phần tử phải bọc trong một đối tượng `Node` chứa 2 con trỏ (`prev`, `next`), gây phân mảnh bộ nhớ Heap và làm hỏng CPU cache locality.
- **`ArrayDeque`:** Triển khai hàng đợi hai đầu bằng **Mảng Vòng (Circular Array Buffer)** không đồng bộ hoá. **Luôn là lựa chọn số 1** khi bạn cần cấu trúc Stack (LIFO) hoặc Queue (FIFO) trong môi trường đơn luồng.

---

## 3. Generics Chuyên Sâu: Type Erasure & Bridge Methods

### 3.1. Bản Chất Type Erasure (Xoá Kiểu)
Java Generics được bổ sung ở Java 5 với mục tiêu **Tương thích ngược hoàn toàn (Backward Compatibility)** với các file `.class` cũ. Trình biên dịch xóa sạch tham số kiểu:
```java
// Mã nguồn Java:
List<String> list = new ArrayList<>();
list.add("Hello");
String s = list.get(0);

// Mã Bytecode thực tế sinh ra tương đương:
List list = new ArrayList();
list.add("Hello");
String s = (String) list.get(0); // Compiler tự chèn ép kiểu
```

### 3.2. Phương Thức Cầu Nối (Bridge Methods)
Để duy trì tính đa hình khi một class con kế thừa một lớp generic cụ thể hoá, compiler tự động sinh ra một phương thức cầu nối nhân tạo (*synthetic bridge method*):

```java
public class MyNode extends Node<Integer> {
    public void setData(Integer data) { ... }
    
    // Compiler ngầm sinh Bridge Method để khớp với Node.setData(Object):
    // public void setData(Object data) { setData((Integer) data); }
}
```

---

## 4. Làm Chủ Nguyên Tắc PECS (Producer Extends, Consumer Super)

Hãy ghi nhớ câu thần chú: **PECS = Producer Extends, Consumer Super**.

```java
public class Collections {
    // Đọc từ src (Producer) -> dùng ? extends T
    // Ghi vào dest (Consumer) -> dùng ? super T
    public static <T> void copy(List<? super T> dest, List<? extends T> src) {
        for (int i = 0; i < src.size(); i++) {
            dest.set(i, src.get(i));
        }
    }
}
```

- Nếu bạn chỉ **lấy dữ liệu ra** từ Collection: Dùng `<? extends T>`.
- Nếu bạn chỉ **đẩy dữ liệu vào** Collection: Dùng `<? super T>`.
- Nếu vừa lấy ra vừa đẩy vào: Dùng chính xác `<T>`.

---

## 5. Tổng Kết

Hiểu thấu đáo từ cơ chế băm phân bổ bucket của `HashMap` đến nguyên lý biến đổi bytecode của Generics giúp bạn tự tin xử lý các bài toán cấu trúc dữ liệu phức tạp. Hãy kiểm tra kiến thức qua 20 câu hỏi quiz nâng cao dưới đây!