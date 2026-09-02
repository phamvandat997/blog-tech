---
title: "DSA Giai đoạn 1 — Mảng, Chuỗi, Con trỏ, Stack & Linked List (Tuần 1–6)"
order: 1
phase: "DSA"
tags: ["DSA", "Algorithms", "LeetCode", "FAANG"]
---
# DSA Giai đoạn 1 — Mảng, Chuỗi, Con trỏ, Stack & Linked List (Tuần 1–6)

> Toàn bộ code trong tài liệu này đã được **chạy thử và xác minh output** trên JDK 21.

**Khác biệt so với bốn file OCP:** ở đây không có trắc nghiệm. Mỗi chủ đề có một **mẫu code chuẩn** để bạn thuộc lòng, rồi 30 bài áp dụng kèm lời giải, độ phức tạp và biến thể thường gặp trong phỏng vấn.

**Điểm cộng có chủ đích:** mọi lời giải đều viết bằng Java hiện đại — `record`, `Deque` thay `Stack`, `Comparator` chaining, `Map.merge`, `var`. Bạn luyện DSA và ôn API thi cùng lúc.

---

# PHẦN A — CHÍN MẪU CODE CHUẨN

## Mẫu 1 — Two Pointers

### 1a. Đối đầu (hai đầu tiến vào giữa)

Dùng khi mảng **đã sắp xếp** hoặc bài toán có tính đối xứng từ hai biên.

```java
static int[] twoSumSorted(int[] a, int t) {
    int l = 0, r = a.length - 1;
    while (l < r) {
        int s = a[l] + a[r];
        if (s == t) return new int[]{l, r};
        if (s < t) l++;      // cần lớn hơn -> đẩy biên trái
        else r--;            // cần nhỏ hơn -> kéo biên phải
    }
    return new int[]{-1, -1};
}
```

Vì sao đúng: mỗi bước loại bỏ **hẳn** một hàng/cột khỏi không gian tìm kiếm. Nếu `a[l]+a[r] < t` thì `a[l]` không thể ghép với bất kỳ phần tử nào bên trái `r` để đạt `t` — nên bỏ `l` là an toàn.

### 1b. Cùng chiều (con trỏ đọc / con trỏ ghi)

Dùng khi cần **sửa mảng tại chỗ** với O(1) bộ nhớ phụ.

```java
static int removeDup(int[] a) {
    if (a.length == 0) return 0;
    int w = 1;                                  // vị trí ghi tiếp theo
    for (int r = 1; r < a.length; r++)          // con trỏ đọc
        if (a[r] != a[w - 1]) a[w++] = a[r];
    return w;                                   // độ dài mới
}
```

Bất biến cần giữ: `a[0..w-1]` luôn là kết quả đúng cho phần đã đọc. Viết ra bất biến này trước khi code sẽ tránh được hầu hết lỗi off-by-one.

---

## Mẫu 2 — Sliding Window

### 2a. Cửa sổ cố định

```java
static int maxSumK(int[] a, int k) {
    int s = 0;
    for (int i = 0; i < k; i++) s += a[i];       // cửa sổ đầu tiên
    int best = s;
    for (int i = k; i < a.length; i++) {
        s += a[i] - a[i - k];                    // vào một, ra một
        best = Math.max(best, s);
    }
    return best;
}
```

### 2b. Cửa sổ co giãn — khung xương chung

```java
int l = 0;
for (int r = 0; r < n; r++) {
    // 1. mở rộng: thêm a[r] vào trạng thái
    while (/* trạng thái vi phạm điều kiện */) {
        // 2. thu hẹp: bỏ a[l] khỏi trạng thái
        l++;
    }
    // 3. cập nhật kết quả với cửa sổ [l, r]
}
```

Ba bước này đúng cho gần như mọi bài sliding window. Khác biệt giữa các bài chỉ nằm ở **trạng thái** lưu gì và **điều kiện vi phạm** là gì.

Độ phức tạp luôn là O(n) dù có vòng `while` lồng trong `for`: mỗi phần tử vào cửa sổ đúng một lần và ra đúng một lần, nên tổng số bước của `l` không quá `n`.

---

## Mẫu 3 — Prefix Sum & Difference Array

### 3a. Prefix sum + HashMap — đếm subarray thoả điều kiện tổng

```java
static int subarraySumK(int[] a, int k) {
    Map<Integer, Integer> cnt = new HashMap<>();
    cnt.put(0, 1);                               // tiền tố rỗng — BẮT BUỘC
    int sum = 0, res = 0;
    for (int x : a) {
        sum += x;
        res += cnt.getOrDefault(sum - k, 0);     // đếm tiền tố phù hợp đã gặp
        cnt.merge(sum, 1, Integer::sum);
    }
    return res;
}
```

Ý tưởng: `sum(i..j) = prefix[j] - prefix[i-1]`. Muốn `= k` thì cần `prefix[i-1] = prefix[j] - k`. Việc `put(0, 1)` xử lý trường hợp subarray bắt đầu từ chỉ số 0.

### 3b. Difference array — cập nhật khoảng, truy vấn cuối

```java
static int[] diffArray(int n, int[][] ops) {     // ops: {lo, hi, val}
    int[] d = new int[n + 1];
    for (int[] o : ops) { d[o[0]] += o[2]; d[o[1] + 1] -= o[2]; }
    int[] res = new int[n]; int run = 0;
    for (int i = 0; i < n; i++) { run += d[i]; res[i] = run; }
    return res;
}
```

Biến `m` phép cộng trên khoảng từ O(m·n) xuống **O(m + n)**. Mảng `d` cần dài `n+1` để `hi+1` không tràn.

---

## Mẫu 4 — HashMap / HashSet

```java
// Đếm tần suất — dùng merge, không dùng containsKey + get + put
Map<Integer, Integer> freq = new HashMap<>();
for (int x : a) freq.merge(x, 1, Integer::sum);

// Multimap — computeIfAbsent
Map<String, List<String>> g = new HashMap<>();
g.computeIfAbsent(key, k -> new ArrayList<>()).add(value);

// Nhóm bằng stream (ngắn hơn, dễ đọc hơn)
Map<String, List<String>> groups = Arrays.stream(words)
    .collect(Collectors.groupingBy(s -> {
        char[] c = s.toCharArray(); Arrays.sort(c); return new String(c);
    }));
```

Ba quy tắc:
1. Khoá là object tự định nghĩa → dùng **`record`**. Nó tự sinh `equals`/`hashCode` nhất quán. Class thường mà quên `hashCode` là bug im lặng.
2. Cần thứ tự khoá → `TreeMap`. Cần thứ tự chèn → `LinkedHashMap`. `HashMap` **không đảm bảo gì**.
3. Khoá là enum → `EnumMap`, nhanh hơn nhiều.

---

## Mẫu 5 — Sorting + Comparator

```java
// Nhiều tiêu chí
list.sort(Comparator.comparingInt(Emp::salary).reversed()
                    .thenComparing(Emp::name));

// Sắp xếp mảng object (giữ ổn định) vs mảng nguyên thuỷ (dual-pivot quicksort)
Arrays.sort(objArr, cmp);
Arrays.sort(intArr);
```

Hai bẫy chết người khi làm DSA:
- **Đừng viết `(a, b) -> a - b`.** Trừ hai số lớn tràn `int` → comparator sai hợp đồng → `sort` có thể ném `IllegalArgumentException`. Dùng `Integer.compare(a, b)`.
- `reversed()` đảo **toàn bộ** chuỗi comparator phía trước, không chỉ tiêu chí cuối.

---

## Mẫu 6 — Binary Search

### 6a. Ba biến thể — thuộc lòng cả ba

```java
// Tìm chính xác
static int exact(int[] a, int t) {
    int l = 0, r = a.length - 1;
    while (l <= r) {                              // <=, r = length-1
        int m = l + (r - l) / 2;                  // tránh tràn int
        if (a[m] == t) return m;
        if (a[m] < t) l = m + 1; else r = m - 1;
    }
    return -1;
}

// Vị trí đầu tiên >= t
static int lowerBound(int[] a, int t) {
    int l = 0, r = a.length;                      // r = length, KHÔNG phải length-1
    while (l < r) {                               // <, không có =
        int m = l + (r - l) / 2;
        if (a[m] < t) l = m + 1; else r = m;
    }
    return l;
}

// Vị trí đầu tiên > t
static int upperBound(int[] a, int t) {
    int l = 0, r = a.length;
    while (l < r) {
        int m = l + (r - l) / 2;
        if (a[m] <= t) l = m + 1; else r = m;     // khác lowerBound đúng một dấu =
    }
    return l;
}
```

Với `a = [1,3,3,5,7]`: `exact(3)=2`, `lowerBound(3)=1`, `upperBound(3)=3`. Số lần xuất hiện của `t` = `upperBound(t) - lowerBound(t)`.

Ba khác biệt cú pháp giữa `exact` và hai cái kia — nhớ kỹ, đây là nguồn bug số một: `r` khởi tạo, điều kiện `while`, và cách cập nhật `r`.

### 6b. Binary search trên đáp án

Dùng khi đáp án nằm trong một khoảng số và có **tính đơn điệu**: nếu `x` khả thi thì mọi giá trị lớn hơn `x` cũng khả thi.

```java
static int minCapacity(int[] w, int days) {
    int lo = Arrays.stream(w).max().getAsInt();   // cận dưới: phải chứa nổi kiện nặng nhất
    int hi = Arrays.stream(w).sum();              // cận trên: chở hết trong 1 ngày
    while (lo < hi) {
        int m = lo + (hi - lo) / 2;
        int d = 1, cur = 0;
        for (int x : w) { if (cur + x > m) { d++; cur = 0; } cur += x; }
        if (d <= days) hi = m; else lo = m + 1;   // khả thi -> thử nhỏ hơn
    }
    return lo;
}
```

Ba câu hỏi phải trả lời trước khi code: cận dưới là gì, cận trên là gì, và hàm kiểm tra khả thi viết thế nào.

---

## Mẫu 7 — Stack & Monotonic Stack

**Luôn dùng `ArrayDeque`, không dùng `Stack`.** Lớp `Stack` kế thừa `Vector`, đồng bộ hoá không cần thiết và chậm hơn. Đề thi OCP cũng hỏi điểm này.

```java
Deque<Integer> st = new ArrayDeque<>();
st.push(x);      // = addFirst
st.pop();        // = removeFirst
st.peek();       // = peekFirst
st.isEmpty();
```

### Monotonic stack — khung xương

```java
// Phần tử lớn hơn tiếp theo bên phải
static int[] nextGreater(int[] a) {
    int[] res = new int[a.length];
    Arrays.fill(res, -1);
    Deque<Integer> st = new ArrayDeque<>();       // chứa CHỈ SỐ, không chứa giá trị
    for (int i = 0; i < a.length; i++) {
        while (!st.isEmpty() && a[st.peek()] < a[i]) res[st.pop()] = a[i];
        st.push(i);
    }
    return res;
}
```

Bốn biến thể chỉ khác nhau ở dấu so sánh và chiều duyệt:

| Cần tìm | Duyệt | Điều kiện `while` |
|---|---|---|
| Lớn hơn tiếp theo bên phải | trái → phải | `a[st.peek()] < a[i]` |
| Nhỏ hơn tiếp theo bên phải | trái → phải | `a[st.peek()] > a[i]` |
| Lớn hơn gần nhất bên trái | phải → trái | `a[st.peek()] < a[i]` |
| Nhỏ hơn gần nhất bên trái | phải → trái | `a[st.peek()] > a[i]` |

Stack luôn **lưu chỉ số**, không lưu giá trị — vì bạn thường cần khoảng cách.

---

## Mẫu 8 — Deque cho cửa sổ trượt

```java
static int[] windowMax(int[] a, int k) {
    int[] res = new int[a.length - k + 1];
    Deque<Integer> dq = new ArrayDeque<>();       // chỉ số, giá trị GIẢM DẦN
    for (int i = 0; i < a.length; i++) {
        while (!dq.isEmpty() && dq.peekFirst() <= i - k) dq.pollFirst();   // hết hạn
        while (!dq.isEmpty() && a[dq.peekLast()] <= a[i]) dq.pollLast();   // bị che khuất
        dq.offerLast(i);
        if (i >= k - 1) res[i - k + 1] = a[dq.peekFirst()];
    }
    return res;
}
```

Hai vòng `while` làm hai việc khác nhau: cái đầu bỏ phần tử **ra khỏi cửa sổ**, cái sau bỏ phần tử **không bao giờ còn là max** (vì có phần tử mới lớn hơn và mới hơn). Đầu deque luôn là max hiện tại.

O(n) vì mỗi chỉ số vào và ra deque đúng một lần.

---

## Mẫu 9 — Linked List

```java
static class Node { int val; Node next; Node(int v) { val = v; } }
```

### 9a. Dummy node — xoá mọi trường hợp đặc biệt

```java
Node dummy = new Node(0);
dummy.next = head;
// ... thao tác, luôn có node đứng trước để sửa .next
return dummy.next;
```

Không có dummy, bạn phải viết `if (head == null)` và `if (cần xoá head)` riêng. Có dummy thì mọi node đều "có cha".

### 9b. Đảo danh sách

```java
static Node reverse(Node h) {
    Node prev = null;
    while (h != null) {
        Node nx = h.next;    // 1. lưu next TRƯỚC khi phá
        h.next = prev;       // 2. đảo hướng
        prev = h;            // 3. tiến prev
        h = nx;              // 4. tiến h
    }
    return prev;
}
```

Bốn dòng, đúng thứ tự này. Quên dòng 1 là mất phần đuôi.

### 9c. Fast & slow pointer

```java
// Giữa danh sách — với độ dài chẵn trả về node thứ hai của cặp giữa
static Node middle(Node h) {
    Node s = h, f = h;
    while (f != null && f.next != null) { s = s.next; f = f.next.next; }
    return s;
}

// Phát hiện chu trình + tìm điểm bắt đầu (Floyd)
static Integer cycleStart(Node h) {
    Node s = h, f = h;
    while (f != null && f.next != null) {
        s = s.next; f = f.next.next;
        if (s == f) {                           // đã gặp nhau trong chu trình
            Node p = h;
            while (p != s) { p = p.next; s = s.next; }   // cùng tốc độ
            return p.val;
        }
    }
    return null;
}
```

Vì sao bước hai của Floyd đúng: gọi `a` là khoảng cách từ đầu tới điểm vào chu trình, `b` là khoảng cách từ điểm vào tới chỗ gặp nhau. Khi gặp nhau, slow đi `a+b`, fast đi `2(a+b)`, chênh lệch `a+b` phải là bội của chu vi. Suy ra đi tiếp `a` bước nữa từ chỗ gặp sẽ về đúng điểm vào — nên cho một con trỏ chạy từ đầu và một từ chỗ gặp, cùng tốc độ, chúng gặp nhau tại điểm vào.

---

# PHẦN B — 30 BÀI TẬP

> Cách làm đúng: đọc đề, tự nghĩ **10 phút** trước khi xem gợi ý mẫu. Code xong tự test 3 trường hợp biên (mảng rỗng, một phần tử, toàn phần tử giống nhau) trước khi xem lời giải.

## Tuần 1–2 — Mảng, hai con trỏ, cửa sổ trượt

**Bài 1.** Cho mảng số nguyên **đã sắp xếp tăng dần** và số `target`. Trả về cặp chỉ số của hai phần tử có tổng bằng `target`. *(mẫu 1a)*

**Bài 2.** Cho mảng `h` biểu diễn chiều cao các cột thẳng đứng cách đều nhau. Chọn hai cột tạo thành thùng chứa nước, tìm lượng nước tối đa. *(mẫu 1a)*

**Bài 3.** Cho mảng đã sắp xếp, xoá phần tử trùng lặp **tại chỗ**, trả về độ dài mới. Bộ nhớ phụ O(1). *(mẫu 1b)*

**Bài 4.** Đưa mọi số 0 về cuối mảng, giữ nguyên thứ tự tương đối của các số khác 0. Tại chỗ. *(mẫu 1b)*

**Bài 5.** Cho mảng chiều cao địa hình, tính tổng lượng nước mưa đọng lại giữa các cột. *(mẫu 1a — khó nhất tuần này)*

**Bài 6.** Tìm subarray liên tiếp có tổng lớn nhất. Mảng có thể toàn số âm.

**Bài 7.** Cho mảng `a`, trả về mảng `r` với `r[i]` = tích mọi phần tử **trừ** `a[i]`. Không được dùng phép chia, O(n) thời gian.

**Bài 8.** Tìm tổng lớn nhất của subarray có đúng `k` phần tử liên tiếp. *(mẫu 2a)*

**Bài 9.** Tìm độ dài chuỗi con liên tiếp dài nhất không có ký tự lặp lại. *(mẫu 2b)*

**Bài 10.** Cho chuỗi `s` và `t`. Tìm chuỗi con ngắn nhất của `s` chứa **tất cả** ký tự của `t` (kể cả số lần lặp). *(mẫu 2b — khó)*

## Tuần 3–4 — HashMap, chuỗi, sắp xếp, tìm kiếm nhị phân

**Bài 11.** Đếm số subarray liên tiếp có tổng đúng bằng `k`. Mảng có thể chứa số âm. *(mẫu 3a)*

**Bài 12.** Cho mảng `n` phần tử ban đầu bằng 0 và `m` thao tác dạng "cộng `val` vào mọi phần tử từ `lo` đến `hi`". Trả mảng cuối cùng, tổng O(n+m). *(mẫu 3b)*

**Bài 13.** Two Sum trên mảng **chưa sắp xếp**, O(n).

**Bài 14.** Nhóm các từ là hoán vị chữ cái của nhau vào cùng một nhóm.

**Bài 15.** Cho mảng số nguyên chưa sắp xếp, tìm độ dài dãy số **liên tiếp** dài nhất (theo giá trị, không cần kề nhau trong mảng). Yêu cầu O(n).

**Bài 16.** Trả về `k` phần tử xuất hiện nhiều nhất.

**Bài 17.** Cho danh sách các khoảng `[lo, hi]`, gộp mọi khoảng chồng lấn.

**Bài 18.** Cài đặt `exact`, `lowerBound`, `upperBound`. Sau đó dùng chúng để đếm số lần xuất hiện của `t` trong mảng đã sắp xếp. *(mẫu 6a)*

**Bài 19.** Mảng đã sắp xếp nhưng bị **xoay** tại một điểm không biết trước (ví dụ `[4,5,6,7,0,1,2]`). Tìm chỉ số của `target`, O(log n).

**Bài 20.** Cho mảng khối lượng các kiện hàng phải chuyển **theo đúng thứ tự** trong `days` ngày. Tìm sức chứa nhỏ nhất của tàu. *(mẫu 6b)*

## Tuần 5–6 — Stack, Deque, Linked List

**Bài 21.** Kiểm tra chuỗi ngoặc `()[]{}` có hợp lệ không.

**Bài 22.** Thiết kế stack hỗ trợ `push`, `pop`, `top` và `getMin` — tất cả trong **O(1)**.

**Bài 23.** Cho mảng nhiệt độ theo ngày. Với mỗi ngày, trả về phải chờ bao nhiêu ngày mới có ngày ấm hơn (0 nếu không có). *(mẫu 7)*

**Bài 24.** Với mỗi phần tử, tìm phần tử **lớn hơn đầu tiên** ở bên phải. *(mẫu 7)*

**Bài 25.** Cho mảng chiều cao các cột trong biểu đồ, tìm hình chữ nhật có diện tích lớn nhất nằm trọn trong biểu đồ. *(mẫu 7 — khó nhất tài liệu này)*

**Bài 26.** Tìm giá trị lớn nhất trong mỗi cửa sổ trượt kích thước `k`. O(n). *(mẫu 8)*

**Bài 27.** Đảo ngược danh sách liên kết đơn. *(mẫu 9b)*

**Bài 28.** Gộp hai danh sách liên kết đã sắp xếp thành một danh sách sắp xếp.

**Bài 29.** Xoá node thứ `n` tính từ cuối danh sách, duyệt **một lượt**. *(mẫu 9a + 9c)*

**Bài 30.** Phát hiện danh sách có chu trình không, và nếu có thì trả về node bắt đầu chu trình. Bộ nhớ O(1). *(mẫu 9c)*

---

# PHẦN C — LỜI GIẢI

## Bài 1 — Two Sum trên mảng đã sắp xếp

```java
static int[] twoSumSorted(int[] a, int t) {
    int l = 0, r = a.length - 1;
    while (l < r) {
        int s = a[l] + a[r];
        if (s == t) return new int[]{l, r};
        if (s < t) l++; else r--;
    }
    return new int[]{-1, -1};
}
```
`twoSumSorted([2,7,11,15], 9)` → `[0, 1]`

**O(n) thời gian, O(1) bộ nhớ.**

Đây là bài nền tảng — hiểu **vì sao** hai con trỏ đúng thì hàng chục bài sau sẽ dễ. Với mảng chưa sắp xếp, sắp xếp trước mất O(n log n) và **làm mất chỉ số gốc**; khi đó dùng HashMap (Bài 13) tốt hơn.

**Biến thể hay hỏi:** 3Sum — cố định một phần tử rồi chạy two pointers cho phần còn lại, O(n²). Nhớ bỏ qua giá trị trùng để không sinh bộ ba lặp.

---

## Bài 2 — Container With Most Water

```java
static int maxArea(int[] h) {
    int l = 0, r = h.length - 1, best = 0;
    while (l < r) {
        best = Math.max(best, (r - l) * Math.min(h[l], h[r]));
        if (h[l] < h[r]) l++; else r--;
    }
    return best;
}
```
`maxArea([1,8,6,2,5,4,8,3,7])` → `49`

**O(n) thời gian, O(1) bộ nhớ.**

Điểm khó là chứng minh tính đúng: ta **luôn dời cột thấp hơn**. Vì diện tích bị chặn bởi cột thấp, giữ cột thấp và thu hẹp chiều rộng chỉ cho kết quả nhỏ hơn — nên bỏ nó đi không làm mất đáp án tối ưu.

Nếu không nghĩ ra, brute force O(n²) vẫn nên viết ra trong phỏng vấn để có điểm khởi đầu, rồi mới tối ưu.

---

## Bài 3 — Xoá trùng lặp tại chỗ

```java
static int removeDup(int[] a) {
    if (a.length == 0) return 0;
    int w = 1;
    for (int r = 1; r < a.length; r++)
        if (a[r] != a[w - 1]) a[w++] = a[r];
    return w;
}
```
`[1,1,2,2,3]` → độ dài `3`, mảng đầu `[1,2,3]`

**O(n) thời gian, O(1) bộ nhớ.**

So sánh `a[r]` với `a[w-1]` (phần tử cuối **đã ghi**) chứ không phải `a[r-1]`. Cả hai đều chạy đúng ở bài này, nhưng chỉ cách đầu tiên tổng quát được sang biến thể "cho phép mỗi giá trị xuất hiện tối đa 2 lần" — khi đó chỉ cần đổi thành `a[r] != a[w-2]`.

---

## Bài 4 — Move Zeroes

```java
static void moveZeroes(int[] a) {
    int w = 0;
    for (int r = 0; r < a.length; r++) if (a[r] != 0) a[w++] = a[r];
    while (w < a.length) a[w++] = 0;
}
```
`[0,1,0,3,12]` → `[1,3,12,0,0]`

**O(n) thời gian, O(1) bộ nhớ.**

Hai lượt nhưng vẫn O(n). Có cách một lượt dùng `swap(a[w], a[r])`, nhưng bản này dễ đọc hơn và ít lỗi hơn — trong phỏng vấn, rõ ràng quan trọng hơn khéo léo.

---

## Bài 5 — Trapping Rain Water

```java
static int trap(int[] h) {
    int l = 0, r = h.length - 1, lm = 0, rm = 0, res = 0;
    while (l < r) {
        if (h[l] < h[r]) { lm = Math.max(lm, h[l]); res += lm - h[l]; l++; }
        else            { rm = Math.max(rm, h[r]); res += rm - h[r]; r--; }
    }
    return res;
}
```
`trap([0,1,0,2,1,0,1,3,2,1,2,1])` → `6`

**O(n) thời gian, O(1) bộ nhớ.**

Nước đọng trên cột `i` bằng `min(maxTrái, maxPhải) - h[i]`. Mấu chốt: khi `h[l] < h[r]`, ta **biết chắc** `maxPhải ≥ h[r] > h[l] ≥ maxTrái`, nên `min` chính là `maxTrái` — tính được ngay mà không cần biết `maxPhải` thực sự là bao nhiêu.

Cách dễ nghĩ hơn: tính sẵn hai mảng `maxTrái[]` và `maxPhải[]` rồi cộng — cũng O(n) thời gian nhưng tốn O(n) bộ nhớ. Nêu cách này trước rồi tối ưu là chiến lược phỏng vấn tốt.

**Biến thể:** cùng bài này giải được bằng monotonic stack (mẫu 7), tính nước theo từng lớp ngang.

---

## Bài 6 — Maximum Subarray (Kadane)

```java
static int maxSub(int[] a) {
    int best = a[0], cur = a[0];
    for (int i = 1; i < a.length; i++) {
        cur = Math.max(a[i], cur + a[i]);      // bắt đầu lại, hay nối tiếp?
        best = Math.max(best, cur);
    }
    return best;
}
```
`maxSub([-2,1,-3,4,-1,2,1,-5,4])` → `6`

**O(n) thời gian, O(1) bộ nhớ.**

`cur` là "tổng lớn nhất của subarray **kết thúc tại `i`**". Câu hỏi duy nhất ở mỗi bước: nối vào đoạn trước có lợi hơn hay bắt đầu lại từ `a[i]`? Đây thực chất là quy hoạch động một chiều với O(1) bộ nhớ — nên Kadane là cầu nối tự nhiên sang DP ở Giai đoạn 3.

**Bẫy:** khởi tạo `best = 0` sẽ sai khi mảng toàn số âm. Phải khởi tạo bằng `a[0]`.

---

## Bài 7 — Product of Array Except Self

```java
static int[] productExceptSelf(int[] a) {
    int n = a.length;
    int[] r = new int[n];
    r[0] = 1;
    for (int i = 1; i < n; i++) r[i] = r[i-1] * a[i-1];   // tích tiền tố
    int suf = 1;
    for (int i = n - 1; i >= 0; i--) { r[i] *= suf; suf *= a[i]; }   // nhân hậu tố
    return r;
}
```
`productExceptSelf([1,2,3,4])` → `[24,12,8,6]`

**O(n) thời gian, O(1) bộ nhớ phụ** (mảng kết quả không tính).

Lượt một ghi tích mọi phần tử **bên trái**. Lượt hai nhân dần tích **bên phải** bằng một biến duy nhất `suf`, tận dụng luôn mảng kết quả làm nơi lưu trữ.

Đề cấm phép chia là có lý do: nếu mảng chứa số 0 thì `tổngTích / a[i]` sẽ hỏng.

---

## Bài 8 — Cửa sổ cố định

```java
static int maxSumK(int[] a, int k) {
    int s = 0;
    for (int i = 0; i < k; i++) s += a[i];
    int best = s;
    for (int i = k; i < a.length; i++) { s += a[i] - a[i-k]; best = Math.max(best, s); }
    return best;
}
```
`maxSumK([2,1,5,1,3,2], 3)` → `9`

**O(n) thời gian, O(1) bộ nhớ.**

Bài này đơn giản nhưng phải viết được không cần nghĩ, vì nó là bước đệm để nhận ra khi nào một bài "tính lại tổng mỗi lần" O(n·k) có thể rút xuống O(n).

---

## Bài 9 — Chuỗi con dài nhất không lặp ký tự

```java
static int longestUnique(String s) {
    Map<Character, Integer> last = new HashMap<>();
    int l = 0, best = 0;
    for (int r = 0; r < s.length(); r++) {
        char c = s.charAt(r);
        if (last.containsKey(c) && last.get(c) >= l) l = last.get(c) + 1;   // nhảy thẳng
        last.put(c, r);
        best = Math.max(best, r - l + 1);
    }
    return best;
}
```
`"abcabcbb"` → `3`, `"pwwkew"` → `3`, `""` → `0`

**O(n) thời gian, O(min(n, bảng chữ cái)) bộ nhớ.**

Bản này lưu **vị trí xuất hiện cuối** nên `l` nhảy thẳng thay vì thu hẹp từng bước. Điều kiện `last.get(c) >= l` rất quan trọng: nếu ký tự đó đã nằm **ngoài** cửa sổ hiện tại thì không được kéo `l` lùi lại.

Bản dùng `Set` và `while (set.contains(c)) { set.remove(s.charAt(l++)); }` cũng O(n) và dễ nhớ hơn — chọn bản nào cũng được, miễn hiểu rõ.

---

## Bài 10 — Minimum Window Substring

```java
static String minWindow(String s, String t) {
    if (t.isEmpty() || s.length() < t.length()) return "";
    int[] need = new int[128];
    for (char c : t.toCharArray()) need[c]++;
    int missing = t.length(), l = 0, bl = 0, bLen = Integer.MAX_VALUE;
    for (int r = 0; r < s.length(); r++) {
        if (need[s.charAt(r)]-- > 0) missing--;          // ký tự này thực sự cần
        while (missing == 0) {                           // đã đủ -> co lại
            if (r - l + 1 < bLen) { bLen = r - l + 1; bl = l; }
            if (++need[s.charAt(l++)] > 0) missing++;    // bỏ đi thì thiếu
        }
    }
    return bLen == Integer.MAX_VALUE ? "" : s.substring(bl, bl + bLen);
}
```
`minWindow("ADOBECODEBANC", "ABC")` → `"BANC"`

**O(|s| + |t|) thời gian, O(1) bộ nhớ** (mảng 128 cố định).

Đây là bài sliding window kinh điển và cũng là bài dễ viết sai nhất. Thủ thuật cốt lõi: `need[c]` **được phép âm** — giá trị âm nghĩa là ký tự đó dư thừa trong cửa sổ. Nhờ vậy chỉ cần một biến đếm `missing` thay vì so sánh hai map.

Đọc kỹ hai dòng có toán tử tăng/giảm: `need[...]-- > 0` so sánh **trước** khi giảm; `++need[...] > 0` tăng **trước** rồi mới so sánh. Đảo thứ tự là sai ngay.

---

## Bài 11 — Subarray Sum Equals K

```java
static int subarraySumK(int[] a, int k) {
    Map<Integer, Integer> cnt = new HashMap<>();
    cnt.put(0, 1);
    int sum = 0, res = 0;
    for (int x : a) {
        sum += x;
        res += cnt.getOrDefault(sum - k, 0);
        cnt.merge(sum, 1, Integer::sum);
    }
    return res;
}
```
`subarraySumK([1,1,1], 2)` → `2`; `subarraySumK([1,2,3], 3)` → `2`

**O(n) thời gian, O(n) bộ nhớ.**

Vì mảng có thể chứa **số âm**, sliding window không dùng được (thêm phần tử không đảm bảo tổng tăng). Prefix sum + HashMap là công cụ đúng.

Hai chi tiết bắt buộc:
1. `cnt.put(0, 1)` — tính cho subarray bắt đầu từ chỉ số 0.
2. **Tra `sum - k` trước, cập nhật `cnt` sau.** Đảo thứ tự sẽ đếm nhầm chính phần tử hiện tại khi `k = 0`.

---

## Bài 12 — Difference Array

```java
static int[] diffArray(int n, int[][] ops) {
    int[] d = new int[n + 1];
    for (int[] o : ops) { d[o[0]] += o[2]; d[o[1] + 1] -= o[2]; }
    int[] res = new int[n]; int run = 0;
    for (int i = 0; i < n; i++) { run += d[i]; res[i] = run; }
    return res;
}
```
`diffArray(5, [[1,3,2],[0,1,1]])` → `[1,3,2,2,0]`

**O(n + m) thời gian, O(n) bộ nhớ** — thay vì O(n·m) nếu cộng trực tiếp.

Difference array là "nghịch đảo" của prefix sum: prefix sum biến truy vấn khoảng thành O(1), difference array biến **cập nhật** khoảng thành O(1). Cần cả hai cùng lúc thì phải dùng Fenwick tree hoặc segment tree (Giai đoạn 3).

Nhớ mảng `d` dài `n+1` để `hi+1 = n` không tràn.

---

## Bài 13 — Two Sum (chưa sắp xếp)

```java
static int[] twoSum(int[] a, int t) {
    Map<Integer, Integer> seen = new HashMap<>();
    for (int i = 0; i < a.length; i++) {
        Integer j = seen.get(t - a[i]);
        if (j != null) return new int[]{j, i};
        seen.put(a[i], i);
    }
    return new int[]{-1, -1};
}
```

**O(n) thời gian, O(n) bộ nhớ.**

Đổi bộ nhớ lấy thời gian, và **giữ được chỉ số gốc** — điều mà cách sắp xếp + two pointers làm mất.

Tra `t - a[i]` **trước** khi `put` để tránh dùng chính phần tử hiện tại hai lần (quan trọng khi `t = 2*a[i]`).

---

## Bài 14 — Group Anagrams

```java
static Map<String, List<String>> groupAnagrams(String[] w) {
    return Arrays.stream(w).collect(Collectors.groupingBy(s -> {
        char[] c = s.toCharArray(); Arrays.sort(c); return new String(c);
    }, TreeMap::new, Collectors.toList()));
}
```
`["eat","tea","tan","ate","nat","bat"]` → `{abt=[bat], aet=[eat, tea, ate], ant=[tan, nat]}`

**O(n·k log k) thời gian** với `k` là độ dài từ, **O(n·k) bộ nhớ.**

Khoá chuẩn hoá là chuỗi đã sắp xếp chữ cái. Nếu bảng chữ cái nhỏ và cố định (26 chữ thường), có thể dùng mảng đếm 26 phần tử làm khoá — giảm xuống **O(n·k)**, nhưng phải chuyển mảng thành `String` vì `int[]` không có `equals`/`hashCode` theo nội dung.

Bản `TreeMap::new` cho thứ tự khoá ổn định — tiện khi so sánh output trong test.

---

## Bài 15 — Longest Consecutive Sequence

```java
static int longestConsecutive(int[] a) {
    Set<Integer> set = Arrays.stream(a).boxed().collect(Collectors.toSet());
    int best = 0;
    for (int x : set) {
        if (set.contains(x - 1)) continue;              // không phải điểm bắt đầu -> bỏ qua
        int len = 1;
        while (set.contains(x + len)) len++;
        best = Math.max(best, len);
    }
    return best;
}
```
`longestConsecutive([100,4,200,1,3,2])` → `4`

**O(n) thời gian, O(n) bộ nhớ.**

Nhìn qua tưởng O(n²) vì có `while` trong `for`, nhưng dòng `if (set.contains(x-1)) continue;` đảm bảo vòng `while` **chỉ chạy tại điểm đầu mỗi dãy**. Mỗi phần tử được vòng `while` chạm đúng một lần trên toàn bộ chương trình → tổng O(n).

Đây là bài rất hay bị hỏi ngược lại trong phỏng vấn: "chứng minh nó là O(n)". Nếu bỏ dòng `continue` thì thành O(n²) thật.

---

## Bài 16 — Top K Frequent Elements

```java
static int[] topK(int[] a, int k) {
    Map<Integer, Integer> f = new HashMap<>();
    for (int x : a) f.merge(x, 1, Integer::sum);
    PriorityQueue<Map.Entry<Integer,Integer>> pq =
        new PriorityQueue<>(Map.Entry.comparingByValue());       // min-heap theo tần suất
    for (var e : f.entrySet()) { pq.offer(e); if (pq.size() > k) pq.poll(); }
    return pq.stream().mapToInt(Map.Entry::getKey).sorted().toArray();
}
```
`topK([1,1,1,2,2,3], 2)` → `[1, 2]`

**O(n log k) thời gian, O(n) bộ nhớ.**

Mẹo quan trọng: dùng **min-heap kích thước k**, không dùng max-heap rồi lấy k lần. Giữ heap luôn ≤ k phần tử cho O(n log k) thay vì O(n log n) — khác biệt lớn khi `k` nhỏ và `n` lớn.

**Biến thể O(n):** bucket sort theo tần suất — tần suất tối đa là `n` nên tạo `n+1` bucket, duyệt ngược lấy `k` phần tử đầu.

---

## Bài 17 — Merge Intervals

```java
record Interval(int lo, int hi) {}

static List<Interval> merge(List<Interval> in) {
    List<Interval> sorted = in.stream().sorted(Comparator.comparingInt(Interval::lo)).toList();
    List<Interval> res = new ArrayList<>();
    for (Interval x : sorted) {
        if (!res.isEmpty() && res.get(res.size()-1).hi() >= x.lo()) {
            Interval last = res.remove(res.size()-1);
            res.add(new Interval(last.lo(), Math.max(last.hi(), x.hi())));
        } else res.add(x);
    }
    return res;
}
```
`[[1,3],[8,10],[2,6],[15,18]]` → `[[1,6],[8,10],[15,18]]`

**O(n log n) thời gian** (chi phí sắp xếp), **O(n) bộ nhớ.**

Sắp xếp theo `lo` là bước quyết định: sau đó chỉ cần so khoảng hiện tại với khoảng **cuối cùng** trong kết quả, không phải với tất cả.

Chú ý `Math.max(last.hi(), x.hi())` — khoảng sau có thể **nằm gọn** trong khoảng trước, khi đó `hi` không được thu nhỏ lại.

Dùng `record` khiến code sạch hơn hẳn `int[]`, và bạn được `toString`/`equals` miễn phí khi debug.

---

## Bài 18 — Ba biến thể binary search

Code ở mẫu 6a. Với `a = [1,3,3,5,7]`:

| Gọi | Kết quả | Ý nghĩa |
|---|---|---|
| `exact(3)` | `2` | một vị trí bất kỳ chứa 3 |
| `lowerBound(3)` | `1` | vị trí đầu tiên `>= 3` |
| `upperBound(3)` | `3` | vị trí đầu tiên `> 3` |
| `lowerBound(4)` | `3` | 4 không có, đây là chỗ nên chèn |
| `upperBound(8)` | `5` | lớn hơn mọi phần tử → trả `length` |

**Đếm số lần xuất hiện:** `upperBound(t) - lowerBound(t)` → với `t=3` cho `3-1 = 2`. Đúng.

**O(log n) thời gian, O(1) bộ nhớ.**

Luôn viết `int m = l + (r - l) / 2;` chứ không phải `(l + r) / 2` — cách sau tràn `int` khi `l` và `r` gần `Integer.MAX_VALUE`. Đây là bug từng tồn tại nhiều năm trong `Arrays.binarySearch` của chính JDK.

Java có sẵn `Arrays.binarySearch`, nhưng nó **không đảm bảo trả về vị trí đầu tiên** khi có phần tử trùng — nên vẫn phải tự viết `lowerBound`.

---

## Bài 19 — Search in Rotated Sorted Array

```java
static int searchRotated(int[] a, int t) {
    int l = 0, r = a.length - 1;
    while (l <= r) {
        int m = l + (r - l) / 2;
        if (a[m] == t) return m;
        if (a[l] <= a[m]) {                              // nửa TRÁI đã sắp xếp
            if (a[l] <= t && t < a[m]) r = m - 1; else l = m + 1;
        } else {                                          // nửa PHẢI đã sắp xếp
            if (a[m] < t && t <= a[r]) l = m + 1; else r = m - 1;
        }
    }
    return -1;
}
```
`searchRotated([4,5,6,7,0,1,2], 0)` → `4`; tìm `3` → `-1`

**O(log n) thời gian, O(1) bộ nhớ.**

Ý tưởng: dù mảng bị xoay, **luôn có ít nhất một nửa đã sắp xếp**. Xác định nửa nào bằng `a[l] <= a[m]`, rồi kiểm tra `t` có nằm trong khoảng đã sắp xếp đó không — nếu có thì tìm ở đó, nếu không thì tìm nửa kia.

Dấu `<=` trong `a[l] <= a[m]` là bắt buộc cho trường hợp `l == m` (mảng còn 2 phần tử). Đổi thành `<` sẽ sai ở biên.

**Biến thể khó hơn:** mảng có phần tử trùng — khi `a[l] == a[m] == a[r]` không xác định được nửa nào đã sắp xếp, phải `l++; r--;` và độ phức tạp xấu nhất trở thành O(n).

---

## Bài 20 — Binary Search trên đáp án

```java
static int minCapacity(int[] w, int days) {
    int lo = Arrays.stream(w).max().getAsInt();
    int hi = Arrays.stream(w).sum();
    while (lo < hi) {
        int m = lo + (hi - lo) / 2;
        int d = 1, cur = 0;
        for (int x : w) { if (cur + x > m) { d++; cur = 0; } cur += x; }
        if (d <= days) hi = m; else lo = m + 1;
    }
    return lo;
}
```
`minCapacity([1..10], 5)` → `15`

**O(n · log(tổng)) thời gian, O(1) bộ nhớ.**

Đây là mẫu quan trọng nhất trong nhóm binary search vì nó **không tìm trong mảng** mà tìm trong **không gian đáp án**. Điều kiện áp dụng: tồn tại ngưỡng `x*` sao cho mọi `x >= x*` đều khả thi và mọi `x < x*` đều không.

Ba việc phải xác định:
- **Cận dưới** = kiện nặng nhất (nhỏ hơn thì không chở nổi kiện đó)
- **Cận trên** = tổng khối lượng (chở hết trong một ngày)
- **Hàm khả thi** = mô phỏng tham lam, đếm số ngày cần

Nhận ra mẫu này bằng cụm từ trong đề: "tìm giá trị **nhỏ nhất** sao cho...", "**tối thiểu hoá** giá trị lớn nhất". Cùng mẫu này giải được nhiều bài khác nhau chỉ bằng cách thay hàm khả thi.

---

## Bài 21 — Valid Parentheses

```java
static boolean validParen(String s) {
    Deque<Character> st = new ArrayDeque<>();
    Map<Character, Character> p = Map.of(')', '(', ']', '[', '}', '{');
    for (char c : s.toCharArray()) {
        if (p.containsValue(c)) st.push(c);
        else if (p.containsKey(c)) { if (st.isEmpty() || st.pop() != p.get(c)) return false; }
    }
    return st.isEmpty();
}
```
`"()[]{}"` → `true`; `"([)]"` → `false`; `"("` → `false`

**O(n) thời gian, O(n) bộ nhớ.**

Hai điều kiện thất bại **đều phải kiểm tra**: gặp ngoặc đóng khi stack rỗng, và kết thúc mà stack còn phần tử. Quên cái thứ hai là lỗi phổ biến nhất — chuỗi `"("` sẽ trả `true` sai.

`Map.of` cho bảng tra sạch sẽ. Lưu ý `p.containsValue` là O(n) trên map — với map 3 phần tử thì không sao, nhưng trong code thật nên dùng một `Set` riêng cho ngoặc mở.

---

## Bài 22 — Min Stack

```java
static class MinStack {
    private final Deque<int[]> st = new ArrayDeque<>();
    void push(int x) {
        int mn = st.isEmpty() ? x : Math.min(x, st.peek()[1]);
        st.push(new int[]{x, mn});               // lưu kèm min TẠI THỜI ĐIỂM đó
    }
    int pop()    { return st.pop()[0]; }
    int top()    { return st.peek()[0]; }
    int getMin() { return st.peek()[1]; }
}
```
push 3, 1, 5 → `getMin()` = 1, `pop()` = 5, `getMin()` vẫn = 1

**Tất cả thao tác O(1), bộ nhớ O(n).**

Mấu chốt: mỗi phần tử mang theo **min của toàn bộ stack tính đến nó**. Nhờ vậy `pop` tự động khôi phục min cũ mà không phải tính lại.

Cách sai hay gặp: giữ một biến `min` duy nhất — khi `pop` đúng phần tử nhỏ nhất thì không biết min mới là gì.

**Tối ưu bộ nhớ:** dùng hai stack riêng, stack min chỉ push khi giá trị mới `<=` min hiện tại. Tiết kiệm khi dữ liệu ít biến động.

---

## Bài 23 — Daily Temperatures

```java
static int[] dailyTemp(int[] t) {
    int[] res = new int[t.length];
    Deque<Integer> st = new ArrayDeque<>();
    for (int i = 0; i < t.length; i++) {
        while (!st.isEmpty() && t[st.peek()] < t[i]) { int j = st.pop(); res[j] = i - j; }
        st.push(i);
    }
    return res;
}
```
`[73,74,75,71,69,72,76,73]` → `[1,1,4,2,1,1,0,0]`

**O(n) thời gian, O(n) bộ nhớ.**

Đây là "next greater element" nhưng trả về **khoảng cách** thay vì giá trị — chính vì thế stack phải lưu **chỉ số**. Ngày nào không bao giờ được pop thì giữ giá trị mặc định 0.

O(n) dù có `while` lồng: mỗi chỉ số được push đúng một lần và pop tối đa một lần.

---

## Bài 24 — Next Greater Element

```java
static int[] nextGreater(int[] a) {
    int[] res = new int[a.length];
    Arrays.fill(res, -1);
    Deque<Integer> st = new ArrayDeque<>();
    for (int i = 0; i < a.length; i++) {
        while (!st.isEmpty() && a[st.peek()] < a[i]) res[st.pop()] = a[i];
        st.push(i);
    }
    return res;
}
```
`nextGreater([2,1,2,4,3])` → `[4,2,4,-1,-1]`

**O(n) thời gian, O(n) bộ nhớ.**

Stack luôn giữ các chỉ số có giá trị **giảm dần** từ đáy lên đỉnh. Khi gặp phần tử lớn hơn đỉnh, nó chính là "lớn hơn tiếp theo" của đỉnh — pop và ghi kết quả.

**Biến thể mảng vòng tròn:** duyệt hai lượt (`i` từ 0 đến `2n-1`, dùng `a[i % n]`), lượt hai không push nữa.

Bảng bốn biến thể ở mẫu 7 phủ hết mọi dạng câu hỏi loại này.

---

## Bài 25 — Largest Rectangle in Histogram

```java
static int largestRect(int[] h) {
    Deque<Integer> st = new ArrayDeque<>();
    int best = 0;
    for (int i = 0; i <= h.length; i++) {
        int cur = i == h.length ? 0 : h[i];               // cột ảo cao 0 để xả stack
        while (!st.isEmpty() && h[st.peek()] >= cur) {
            int ht = h[st.pop()];
            int left = st.isEmpty() ? -1 : st.peek();     // biên trái sau khi pop
            best = Math.max(best, ht * (i - left - 1));
        }
        st.push(i);
    }
    return best;
}
```
`largestRect([2,1,5,6,2,3])` → `10`

**O(n) thời gian, O(n) bộ nhớ.**

Bài khó nhất tài liệu này. Ý tưởng: với mỗi cột, hình chữ nhật **cao bằng đúng cột đó** có chiều rộng kéo dài tới cột thấp hơn gần nhất ở hai bên. Monotonic stack tăng dần cho ta cả hai biên cùng lúc.

Ba chi tiết dễ sai:
1. **Cột ảo `cur = 0`** khi `i == h.length` — không có nó, các cột còn lại trong stack không bao giờ được xử lý.
2. **`left` lấy sau khi pop**, không phải trước. Sau khi pop, đỉnh mới chính là cột thấp hơn gần nhất bên trái.
3. Chiều rộng là `i - left - 1`, không phải `i - left`.

Nếu bí trong phỏng vấn, hãy nêu cách O(n²) (với mỗi cột mở rộng sang hai bên) trước — vẫn có điểm, rồi mới tối ưu.

**Ứng dụng:** bài "hình chữ nhật lớn nhất trong ma trận nhị phân" chính là chạy hàm này trên từng hàng với mảng chiều cao tích luỹ.

---

## Bài 26 — Sliding Window Maximum

```java
static int[] windowMax(int[] a, int k) {
    int[] res = new int[a.length - k + 1];
    Deque<Integer> dq = new ArrayDeque<>();
    for (int i = 0; i < a.length; i++) {
        while (!dq.isEmpty() && dq.peekFirst() <= i - k) dq.pollFirst();
        while (!dq.isEmpty() && a[dq.peekLast()] <= a[i]) dq.pollLast();
        dq.offerLast(i);
        if (i >= k - 1) res[i - k + 1] = a[dq.peekFirst()];
    }
    return res;
}
```
`windowMax([1,3,-1,-3,5,3,6,7], 3)` → `[3,3,5,5,6,7]`

**O(n) thời gian, O(k) bộ nhớ.**

Deque giữ chỉ số với giá trị **giảm dần**. Hai vòng `while` làm hai việc hoàn toàn khác nhau — đừng gộp:
- Vòng một xoá phần tử **hết hạn** (rơi ra khỏi cửa sổ), thao tác ở **đầu**.
- Vòng hai xoá phần tử **vô dụng** (nhỏ hơn phần tử mới, và cũ hơn), thao tác ở **đuôi**.

Dùng `PriorityQueue` cũng giải được nhưng mất O(n log k) và phải xử lý việc xoá phần tử hết hạn khỏi heap — phức tạp hơn hẳn.

Đây là lý do `Deque` xứng đáng được học kỹ: nó vừa là stack, vừa là queue, vừa là công cụ cho bài này.

---

## Bài 27 — Reverse Linked List

```java
static Node reverse(Node h) {
    Node prev = null;
    while (h != null) {
        Node nx = h.next;    // lưu trước
        h.next = prev;       // đảo
        prev = h;            // tiến prev
        h = nx;              // tiến h
    }
    return prev;
}
```
`[1,2,3,4]` → `[4,3,2,1]`

**O(n) thời gian, O(1) bộ nhớ.**

Bốn dòng, đúng thứ tự. Vẽ ba node ra giấy và chạy tay một vòng lặp — làm một lần rồi sẽ không bao giờ quên.

**Bản đệ quy** ngắn hơn nhưng tốn O(n) stack:
```java
static Node rec(Node h) {
    if (h == null || h.next == null) return h;
    Node newHead = rec(h.next);
    h.next.next = h;
    h.next = null;
    return newHead;
}
```
Trong phỏng vấn nên viết bản lặp và **nhắc rằng** bản đệ quy tồn tại nhưng tốn bộ nhớ ngăn xếp.

---

## Bài 28 — Merge Two Sorted Lists

```java
static Node mergeTwo(Node a, Node b) {
    Node d = new Node(0), c = d;                  // dummy
    while (a != null && b != null) {
        if (a.val <= b.val) { c.next = a; a = a.next; }
        else                { c.next = b; b = b.next; }
        c = c.next;
    }
    c.next = a != null ? a : b;                   // nối phần đuôi còn lại
    return d.next;
}
```
`[1,3,5]` + `[2,4]` → `[1,2,3,4,5]`

**O(m + n) thời gian, O(1) bộ nhớ.**

Dummy node xoá hẳn việc phải xử lý riêng "node đầu tiên là của list nào".

Dòng cuối rất quan trọng: khi một list hết, **nối thẳng** phần còn lại thay vì lặp tiếp — vì nó đã sắp xếp sẵn.

Dùng `<=` chứ không `<` để giữ tính **ổn định** (phần tử của `a` đứng trước khi bằng nhau).

**Mở rộng:** gộp `k` danh sách — dùng `PriorityQueue` các node đầu, O(N log k).

---

## Bài 29 — Remove Nth Node From End

```java
static Node removeNth(Node h, int n) {
    Node d = new Node(0); d.next = h;
    Node fast = d, slow = d;
    for (int i = 0; i < n; i++) fast = fast.next;      // tạo khoảng cách n
    while (fast.next != null) { fast = fast.next; slow = slow.next; }
    slow.next = slow.next.next;
    return d.next;
}
```
`[1,2,3,4,5]`, n=2 → `[1,2,3,5]`; `[1]`, n=1 → `[]`

**O(n) thời gian, O(1) bộ nhớ, duyệt một lượt.**

Hai con trỏ cách nhau đúng `n` bước. Khi `fast` chạm cuối, `slow` đang ở ngay **trước** node cần xoá.

Dummy node là thứ khiến trường hợp "xoá chính node đầu" (như `[1]` với `n=1`) chạy đúng mà không cần `if` riêng. Bỏ dummy đi, bạn sẽ phải thêm ít nhất một nhánh đặc biệt.

Cả `fast` và `slow` đều **bắt đầu từ dummy**, không phải từ `head` — lệch một bước là sai kết quả.

---

## Bài 30 — Linked List Cycle + điểm bắt đầu

```java
static Integer cycleStart(Node h) {
    Node s = h, f = h;
    while (f != null && f.next != null) {
        s = s.next; f = f.next.next;
        if (s == f) {
            Node p = h;
            while (p != s) { p = p.next; s = s.next; }
            return p.val;
        }
    }
    return null;
}
```
`1→2→3→4→2` (chu trình về node 2) → trả `2`

**O(n) thời gian, O(1) bộ nhớ.**

Giai đoạn một là thuật toán "rùa và thỏ" của Floyd. Giai đoạn hai dựa trên chứng minh ở mẫu 9c: từ chỗ gặp nhau, đi thêm `a` bước (với `a` = khoảng cách từ đầu tới điểm vào chu trình) sẽ về đúng điểm vào — nên cho một con trỏ chạy từ `head` và một từ chỗ gặp, **cùng tốc độ**, chúng gặp nhau tại điểm vào.

Điều kiện `f != null && f.next != null` phải kiểm tra **cả hai**, vì `f` nhảy hai bước.

Dùng `HashSet` lưu node đã thăm cũng giải được và dễ nghĩ hơn, nhưng tốn O(n) bộ nhớ. Nêu cách đó trước rồi tối ưu xuống O(1) là câu trả lời phỏng vấn tốt.

---

# Tự chấm & bước tiếp

| Số bài tự làm được (không xem lời giải) | Đánh giá |
|---|---|
| 26–30 | Vững, sang Giai đoạn 2 (cây, đồ thị, backtracking) |
| 20–25 | Làm lại các bài chưa được sau 3 ngày, rồi mới đi tiếp |
| 14–19 | Học lại mẫu code tương ứng, làm thêm 15 bài cùng dạng trên LeetCode |
| < 14 | Chậm lại. Mỗi ngày một bài Easy, tập trung viết đúng bất biến trước khi code |

## Quy tắc luyện tập

1. **Tự nghĩ 10 phút** trước khi xem gợi ý. Bí quá thì xem *một* dòng gợi ý, không xem cả lời giải.
2. Sau khi giải xong, **viết lại từ đầu** vào ngày hôm sau mà không nhìn. Chỉ khi đó bạn mới thật sự thuộc mẫu.
3. Luôn tự test **ba trường hợp biên**: rỗng, một phần tử, toàn phần tử giống nhau.
4. Ghi vào `dsa-notes.md`: bài nào thuộc mẫu nào, và **dấu hiệu nào trong đề** giúp nhận ra mẫu đó. Nhận dạng mẫu quan trọng hơn nhớ code.

## Bảng nhận dạng mẫu — in ra dán bàn

| Dấu hiệu trong đề | Mẫu |
|---|---|
| Mảng đã sắp xếp, tìm cặp/bộ ba | Two pointers đối đầu |
| Sửa mảng tại chỗ, O(1) bộ nhớ | Two pointers cùng chiều |
| "chuỗi con liên tiếp", "subarray liên tiếp" + số dương | Sliding window |
| Subarray có tổng bằng k, **có số âm** | Prefix sum + HashMap |
| Nhiều cập nhật trên khoảng, truy vấn cuối | Difference array |
| "phần tử lớn hơn/nhỏ hơn tiếp theo" | Monotonic stack |
| Max/min trong mọi cửa sổ kích thước k | Deque |
| "giá trị nhỏ nhất sao cho...", "tối thiểu hoá giá trị lớn nhất" | Binary search trên đáp án |
| Mảng đã sắp xếp, O(log n) | Binary search |
| "top k", "k phần tử lớn nhất" | Heap kích thước k |
| Danh sách liên kết, xoá/chèn gần đầu | Dummy node |
| Danh sách liên kết, tìm giữa / chu trình | Fast & slow pointer |

---

**Giai đoạn 2** sẽ xây trực tiếp trên nền này: đệ quy và backtracking (mở rộng từ hai con trỏ), cây nhị phân và duyệt DFS/BFS (dùng lại `Deque`), heap (mở rộng từ bài 16), và đồ thị cơ bản với Union-Find.
