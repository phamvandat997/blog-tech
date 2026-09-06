---
layout: chapter

title: "Chương 6: Mảng, Generics và Collections"
subtitle: "Arrays, Generics, and Collections"
exam_objectives:
  - "Tạo mảng cùng các collection List, Set, Map và Deque; thêm, xoá, cập nhật, lấy ra và sắp xếp phần tử của chúng."

previous_link: "/ch05.html"
previous_title: "Controlling Program Flow"
next_link: "/ch07.html"
next_title: "Error Handling and Exceptions"
answers_link: "/ch06a.html"

description: "Mảng một và nhiều chiều, class Arrays, generics và type erasure, wildcard, Collections Framework với List, Set, Deque, Map, cùng Comparable và Comparator."
order: 1
phase: "Chương 6"
tags: [Java, OCP, Array, Generics, Collections, List, Set, Map, Deque, Comparator]
---

## Mảng (Array)

Mảng là một object chứa số lượng cố định các giá trị cùng một kiểu, nằm trên những ô nhớ liền kề. Những giá trị này — gọi là phần tử — có thể thuộc kiểu nguyên thuỷ hoặc kiểu tham chiếu.

Đây là sơ đồ giúp bạn hình dung mảng một chiều và hai chiều:
```
One-dimensional Array:
┌─────┬─────┬─────┬─────┬─────┐
│  0  │  1  │  2  │  3  │  4  │  int[] numbers = new int[5];
└─────┴─────┴─────┴─────┴─────┘
   ▲
   └── Index

Two-dimensional Array:
┌─────┬─────┬─────┐
│ 0,0 │ 0,1 │ 0,2 │
├─────┼─────┼─────┤
│ 1,0 │ 1,1 │ 1,2 │  int[][] matrix = new int[2][3];
└─────┴─────┴─────┘
   ▲     ▲
   │     └── Column Index
   └──────── Row Index
```

Hãy bắt đầu bằng cách xem lại cách tạo và khởi tạo một mảng.

### Tạo và khởi tạo mảng

Để tạo mảng, bạn khai báo một biến thuộc kiểu mảng mong muốn rồi dùng keyword `new` để tạo object mảng và gán cho biến đó:

```java
// Creates an array of integers
int[] myArray; 
myArray = new int[5];
```

Bạn cũng gộp được phần khai báo và phần tạo mảng vào một câu lệnh:

```java
int[] myArray = new int[5];
```

Con số trong cặp ngoặc vuông chỉ định số phần tử mà mảng sẽ chứa, nói cách khác là kích thước của mảng. Kích thước này phải được quyết định lúc mảng được tạo và **không** thay đổi được về sau.

Đây là một hạn chế quan trọng cần nhớ: bạn không đổi được kích thước mảng sau khi nó đã được tạo. Nếu bạn cần một cấu trúc dữ liệu co giãn động, hãy cân nhắc dùng một class collection như `ArrayList` thay thế.

Khi mảng được tạo, các phần tử của nó tự động được khởi tạo với giá trị mặc định:
- `0` cho kiểu số
- `false` cho boolean
- `null` cho kiểu tham chiếu

Tuy nhiên, bạn cũng khởi tạo tường minh được một mảng ngay lúc tạo:

```java
int[] myArray = new int[] {10, 20, 30, 40, 50};
```

Đoạn này tạo mảng 5 số nguyên và khởi tạo chúng với những giá trị đã nêu. Kích thước mảng được xác định bởi số lượng giá trị được cung cấp.

Nếu bạn không cần nêu giá trị ngay lúc khai báo, bạn để một phần hoặc toàn bộ phần tử chưa khởi tạo cũng được:

```java
int[] myArray = new int[5];
myArray[0] = 10;
myArray[1] = 20;
```

Đoạn này tạo mảng 5 số nguyên, khởi tạo hai phần tử đầu, và để phần còn lại mang giá trị mặc định `0`.

Cần lưu ý rằng mọi phần tử của một mảng phải cùng kiểu. Bạn không trộn được các kiểu dữ liệu khác nhau trong một mảng.

### Mảng vô danh (anonymous array)

Mảng vô danh là mảng được khai báo và khởi tạo trong một câu lệnh duy nhất mà không gán cho biến nào:

```java
new int[] {10, 20, 30, 40, 50}
```

Mảng vô danh thường được dùng khi truyền mảng làm đối số cho method:

```java
myMethod(new int[] {10, 20, 30, 40, 50});
```

Chúng cung cấp cách tiện lợi để tạo và truyền mảng ngay tại chỗ, không cần khai báo biến riêng.

Tuy nhiên, mảng vô danh không chỉ giới hạn ở đối số method. Chúng dùng được ở bất cứ đâu cần một mảng, chẳng hạn trong phép gán:

```java
int[] myArray = new int[] {10, 20, 30, 40, 50};
```

Trong trường hợp này, mảng vô danh được tạo rồi gán ngay cho biến `myArray`.

### Dùng mảng

Để truy cập một phần tử của mảng, bạn dùng tên mảng theo sau là chỉ số của phần tử đặt trong ngoặc vuông:

```java
int[] myArray = new int[] {10, 20, 30, 40, 50};
System.out.println(myArray[0]); // Outputs 10
System.out.println(myArray[2]); // Outputs 30
```

Chỉ số mảng bắt đầu từ 0, nên phần tử đầu tiên ở chỉ số 0, phần tử thứ hai ở chỉ số 1, v.v.

Bạn cũng dùng được biến làm chỉ số:

```java
int index = 2;
System.out.println(myArray[index]); // Outputs 30
```

Cố truy cập phần tử ngoài giới hạn của mảng sẽ gây `ArrayIndexOutOfBoundsException`.

Để biết số phần tử trong mảng, bạn dùng thuộc tính `length`:

```java
System.out.println(myArray.length); // Outputs 5
```

Lưu ý đây là thuộc tính chứ không phải method, nên không dùng cặp ngoặc đơn.

Cố thay đổi kích thước mảng sau khi nó đã được tạo — dù bằng cách gán mảng mới cho biến hay bằng thuộc tính `length` — sẽ gây lỗi biên dịch.

Dù không đổi được kích thước mảng, bạn vẫn sao chép được nội dung từ mảng này sang mảng khác:

```java
int[] sourceArray = new int[] {10, 20, 30, 40, 50};
int[] destArray = new int[5];
System.arraycopy(sourceArray, 0, destArray, 0, 5);
```

Đoạn này sao chép các phần tử từ `sourceArray` sang `destArray`. Các đối số lần lượt là: mảng nguồn, vị trí bắt đầu trong mảng nguồn, mảng đích, vị trí bắt đầu trong mảng đích, và số phần tử cần sao chép.

Tuy nhiên, điều này khác với việc gán mảng này cho mảng kia:

```java
int[] sourceArray = new int[] {10, 20, 30, 40, 50};
int[] destArray = sourceArray;
```

Đoạn này **không** tạo bản sao của mảng. Thay vào đó, nó khiến `destArray` tham chiếu tới cùng object mảng như `sourceArray`. Thay đổi thực hiện qua biến nào cũng phản ánh sang biến kia, vì cả hai cùng trỏ tới một mảng trong bộ nhớ.

### Mảng nhiều chiều

Java cũng hỗ trợ mảng nhiều chiều, có thể hiểu là *mảng của các mảng*.

Loại mảng nhiều chiều phổ biến nhất là mảng hai chiều, thường dùng để biểu diễn ma trận hay bảng dữ liệu. Nhưng Java không giới hạn số chiều mà một mảng có được.

Để khai báo mảng nhiều chiều, bạn thêm một cặp ngoặc vuông cho mỗi chiều bổ sung. Ví dụ, đây là cách khai báo mảng hai chiều các số nguyên:

```java
int[][] matrix;
```

Dòng này khai báo biến `matrix` là một mảng của các mảng số nguyên.

Sau đó bạn tạo mảng bằng keyword `new`:

```java
matrix = new int[3][4];
```

Đoạn này tạo mảng hai chiều với 3 hàng và 4 cột. Về bản chất, đó là một mảng chứa 3 mảng, mỗi mảng chứa 4 số nguyên.

Cũng như với mảng một chiều, bạn gộp được phần khai báo và phần tạo:

```java
int[][] matrix = new int[3][4];
```

Bạn cũng khởi tạo mảng ngay lúc tạo được:

```java
int[][] matrix = {
    {1, 2, 3, 4},
    {5, 6, 7, 8},
    {9, 10, 11, 12}
};
```

Đoạn này tạo mảng 3x4 giống như trên, đồng thời khởi tạo nó với các giá trị đã nêu.

Truy cập phần tử trong mảng nhiều chiều tương tự mảng một chiều, nhưng giờ bạn cần nêu chỉ số cho từng chiều:

```java
int[][] matrix = new int[3][4];
matrix[0][0] = 1;
matrix[1][2] = 7;
System.out.println(matrix[1][2]); // Outputs 7
```

Ở đây, `matrix[0][0]` trỏ tới phần tử ở hàng đầu, cột đầu; `matrix[1][2]` trỏ tới phần tử ở hàng hai, cột ba, v.v.

Bạn cũng dùng được vòng lặp lồng nhau để duyệt mảng nhiều chiều:

```java
int[][] matrix = {
    {1, 2, 3, 4},
    {5, 6, 7, 8},
    {9, 10, 11, 12}
};
        
for(int i = 0; i < matrix.length; i++) {
    for(int j = 0; j < matrix[i].length; j++) {
        System.out.print(matrix[i][j] + " ");
    }
    System.out.println();
}
```

Kết quả sẽ là:

```
1 2 3 4 
5 6 7 8 
9 10 11 12 
```

Vòng lặp ngoài duyệt các hàng, còn vòng lặp trong duyệt các cột trong từng hàng.

Lưu ý rằng trong mảng nhiều chiều, thuộc tính `length` cho biết số mảng ở chiều thứ nhất. Để lấy độ dài của các mảng ở chiều thứ hai, bạn cần nêu chỉ số cho chiều thứ nhất, như `matrix[i].length`.

Cũng lưu ý rằng dù mọi mảng ở chiều thứ hai trong ví dụ này có cùng độ dài, đó không phải yêu cầu bắt buộc. Bạn tạo được mảng *răng cưa* (ragged), trong đó mỗi mảng ở chiều thứ hai có độ dài khác nhau:

```java
int[][] ragged = {
    {1, 2, 3, 4},
    {5, 6},
    {7, 8, 9}
};
```

Sự linh hoạt này hữu ích trong một số tình huống, nhưng phổ biến hơn vẫn là làm việc với mảng *chữ nhật*, nơi mọi mảng chiều thứ hai có cùng độ dài.

### Class `java.util.Arrays`

Class `java.util.Arrays` chứa nhiều static method để thao tác trên mảng. Nó cung cấp method để sắp xếp, tìm kiếm, so sánh và điền giá trị vào phần tử mảng. Hãy xem một số method thường dùng nhất.

#### Sắp xếp

Method `sort()` sắp xếp các phần tử của mảng theo thứ tự tăng dần. Nó có nhiều phiên bản nạp chồng cho các kiểu mảng khác nhau:

```java
int[] numbers = {4, 2, 7, 1, 3};
Arrays.sort(numbers);
System.out.println(Arrays.toString(numbers)); // [1, 2, 3, 4, 7]
```

Đoạn này sắp xếp mảng `numbers` tại chỗ, sửa trực tiếp mảng gốc.

Bạn cũng sắp xếp được một phần mảng bằng cách nêu chỉ số đầu (bao gồm) và chỉ số cuối (không bao gồm):

```java
int[] numbers = {4, 2, 7, 1, 3};
Arrays.sort(numbers, 1, 4); 
System.out.println(Arrays.toString(numbers)); // [4, 1, 2, 7, 3]
```

Đoạn này chỉ sắp xếp các phần tử từ chỉ số 1 tới 3, giữ nguyên phần tử ở chỉ số 0 và 4.

Với mảng các object, object phải implement interface `Comparable` thì `sort()` mới hoạt động. Cách khác, bạn cung cấp một object `Comparator` để định nghĩa thứ tự sắp xếp:

```java
String[] strings = {"banana", "apple", "cherry"};
Arrays.sort(strings, Comparator.comparingInt(String::length));
System.out.println(Arrays.toString(strings)); // [apple, banana, cherry]
```

Đoạn này sắp xếp mảng `strings` theo độ dài của từng chuỗi, dùng `Comparator` tạo bởi method `comparingInt()`.

#### Tìm kiếm

Method `binarySearch()` tìm một phần tử cụ thể trong mảng **đã sắp xếp** bằng thuật toán tìm kiếm nhị phân. Nếu tìm thấy, nó trả về chỉ số của phần tử. Nếu không, nó trả về một giá trị âm.

```java
int[] numbers = {1, 2, 3, 4, 7};
System.out.println(Arrays.binarySearch(numbers, 3)); // 2
System.out.println(Arrays.binarySearch(numbers, 5)); // -5
```

Ở lần tìm thứ nhất, phần tử 3 được tìm thấy ở chỉ số 2. Ở lần tìm thứ hai, phần tử 5 không được tìm thấy nên method trả về -5. Giá trị âm được tính theo công thức `-(điểm chèn) - 1`, trong đó điểm chèn là chỉ số mà phần tử sẽ được chèn vào để giữ thứ tự sắp xếp.

Lưu ý rằng để `binarySearch()` hoạt động đúng, mảng phải được sắp xếp. Nếu mảng chưa sắp xếp, kết quả là không xác định.

#### Dùng `compare()`

Method `compare()` so sánh hai mảng theo thứ tự từ điển (lexicographic). Nó trả về giá trị âm nếu mảng thứ nhất *nhỏ hơn* mảng thứ hai, giá trị dương nếu mảng thứ nhất *lớn hơn*, và bằng không nếu chúng bằng nhau.

```java
int[] arr1 = {1, 2, 3};
int[] arr2 = {1, 2, 3};
int[] arr3 = {1, 2, 4};
        
System.out.println(Arrays.compare(arr1, arr2)); // 0
System.out.println(Arrays.compare(arr1, arr3)); // -1
System.out.println(Arrays.compare(arr3, arr1)); // 1
```

Khi so sánh `arr1` và `arr2`, method trả về 0 vì hai mảng bằng nhau. Khi so sánh `arr1` và `arr3`, nó trả về -1 vì `arr1` nhỏ hơn `arr3` theo thứ tự từ điển (do 3 < 4). Tương tự, khi so sánh `arr3` và `arr1`, nó trả về 1.

### Dùng `fill()`

Method `fill()` trong class `Arrays` được dùng để điền một giá trị cụ thể vào toàn bộ hoặc một phần của mảng. Đây là cách tiện lợi để đặt mọi phần tử về cùng một giá trị.

Method `fill()` có vài phiên bản nạp chồng:
- `fill(array, value)`: Điền giá trị đã nêu vào toàn bộ mảng.
- `fill(array, fromIndex, toIndex, value)`: Điền vào một phần mảng, từ `fromIndex` (bao gồm) tới `toIndex` (không bao gồm), với giá trị đã nêu.

Đây là ví dụ dùng `fill()` để điền toàn bộ mảng:

```java
int[] numbers = new int[5];
Arrays.fill(numbers, 10);
System.out.println(Arrays.toString(numbers)); // [10, 10, 10, 10, 10]
```

Đoạn này tạo mảng 5 số nguyên và điền toàn bộ bằng giá trị 10.

Bạn cũng điền được chỉ một phần mảng:

```java
int[] numbers = {1, 2, 3, 4, 5};
Arrays.fill(numbers, 1, 4, 10);
System.out.println(Arrays.toString(numbers)); // [1, 10, 10, 10, 5]
```

Đoạn này điền giá trị 10 vào các phần tử từ chỉ số 1 tới 3 (nhớ rằng `toIndex` không bao gồm), giữ nguyên phần tử ở chỉ số 0 và 4.

Method `fill()` có phiên bản nạp chồng cho mọi kiểu nguyên thuỷ và cho tham chiếu object. Khi dùng với tham chiếu object, mọi phần tử sẽ trỏ tới **cùng một** object:

```java
String[] strings = new String[3];
Arrays.fill(strings, "Hello");
System.out.println(Arrays.toString(strings)); // [Hello, Hello, Hello]
```

Đoạn này điền vào mảng `strings` các tham chiếu tới cùng một chuỗi `"Hello"`.

Cần hiểu rằng method `Arrays.fill()` trong Java **không** tạo object mới cho từng phần tử. Thay vào đó, nó đặt mỗi phần tử tham chiếu tới cùng một object. Nếu bạn sửa object đó qua một trong các tham chiếu này, mọi phần tử trong mảng sẽ phản ánh thay đổi ấy. Tuy nhiên, hành vi này còn phụ thuộc vào việc object là khả biến hay bất biến.

Đây là ví dụ với object bất biến (chuỗi):

```java
String[] strings = new String[3];
Arrays.fill(strings, new String("Hello"));
strings[0] = "Hi";
System.out.println(Arrays.toString(strings)); // [Hi, Hello, Hello]
```

`Arrays.fill(strings, new String("Hello"));` đặt mỗi phần tử trong mảng tham chiếu tới một object `String` mới có giá trị `"Hello"`. Vậy nên ban đầu `strings[0]`, `strings[1]` và `strings[2]` đều tham chiếu tới cùng một object `String`. Khi bạn cập nhật `strings[0] = "Hi";`, bạn đổi tham chiếu tại `strings[0]` sang trỏ tới một object `String` mới có giá trị `"Hi"`. Vì object `String` là bất biến trong Java, điều này không ảnh hưởng tới `strings[1]` và `strings[2]`. Kết quả sẽ là `[Hi, Hello, Hello]`, do sửa một phần tử không ảnh hưởng tới phần tử khác.

Tuy nhiên, khi dùng `Arrays.fill()` với object khả biến, mọi phần tử sẽ tham chiếu tới cùng một object. Nếu bạn sửa một instance, mọi phần tử trong mảng đều phản ánh thay đổi đó:

```java
class Point {
    int x, y;
    
    Point(int x, int y) {
        this.x = x;
        this.y = y;
    }
    
    @Override
    public String toString() {
        return "(" + x + ", " + y + ")";
    }
}

public class Main {
    public static void main(String[] args) {
        Point[] points = new Point[3];
        Arrays.fill(points, new Point(0, 0));

        // Modifying one element
        points[0].x = 1;
        points[0].y = 1;

        System.out.println(Arrays.toString(points)); // Output: [(1, 1), (1, 1), (1, 1)]
    }
}
```

Ở đây, `points[0]`, `points[1]` và `points[2]` đều tham chiếu tới cùng một object `Point`. Thay đổi giá trị `x` và `y` của `points[0]` ảnh hưởng tới cả ba vì chúng cùng tham chiếu tới một instance `Point`.

Còn nhiều method hữu ích khác trong class `Arrays`, như `equals()` hay `copyOf()`, v.v. Đáng để bạn khám phá [tài liệu chính thức](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/Arrays.html) để xem những gì có sẵn.

## Generics

Nếu bạn đã lập trình Java một thời gian, hẳn bạn từng gặp generics. Nhưng chính xác chúng là gì và tại sao hữu ích?

Nói đơn giản, generics cho phép bạn viết mã làm việc được với nhiều kiểu khác nhau mà không mất đi lợi ích của an toàn kiểu. Chúng cung cấp cách tham số hoá kiểu, để bạn tạo được class, interface và method thao tác trên object thuộc nhiều kiểu khác nhau mà vẫn giữ được việc kiểm tra kiểu lúc biên dịch.

Bạn có thể nghĩ: "Chẳng phải generics chỉ là cách hoa mỹ để tránh dùng `Object` khắp nơi sao?" Đúng là trước khi generics được giới thiệu ở Java 5, lập trình viên thường dùng kiểu `Object` để viết mã xử lý được nhiều kiểu. Tuy nhiên cách này có vài nhược điểm. Nó đòi hỏi rất nhiều phép ép kiểu tường minh, dễ dẫn tới lỗi lúc chạy nếu dùng sai kiểu. Nó cũng không cung cấp an toàn kiểu lúc biên dịch. Ngược lại, generics cho phép bạn nêu rõ những kiểu muốn làm việc, mang lại an toàn kiểu tốt hơn và giảm nhu cầu ép kiểu.

### Hiểu về type erasure

**Type erasure** (xoá kiểu) là quá trình trình biên dịch loại bỏ mọi thông tin kiểu generic lúc biên dịch, thay chúng bằng giới hạn (bound) của chúng, hoặc bằng kiểu `Object` nếu không nêu giới hạn. Nghĩa là lúc chạy, một kiểu generic như `List<String>` về bản chất được xử lý như một `List` thuần, không mang thông tin kiểu cụ thể.

Bạn có thể thắc mắc: "Nếu type erasure xoá thông tin kiểu thì generics chẳng cung cấp an toàn kiểu gì cả sao?" Đúng là thông tin kiểu generic không có sẵn lúc chạy do type erasure, nhưng generics vẫn mang lại lợi ích an toàn kiểu đáng kể lúc biên dịch. Trình biên dịch dùng thông tin kiểu generic để kiểm tra kiểu và bắt sớm những lỗi liên quan tới kiểu. Nó đảm bảo bạn không vô tình thêm object sai kiểu vào một collection generic hay trả về sai kiểu từ một method generic.

Tuy nhiên, type erasure áp đặt vài hạn chế. Chẳng hạn, bạn không dùng trực tiếp được toán tử `instanceof` với kiểu generic. Nếu bạn thử:
```java
if (obj instanceof List<String>) {
    // ...
}
```
    
Bạn sẽ gặp lỗi biên dịch. Lý do là thông tin kiểu generic bị xoá lúc chạy, nên toán tử `instanceof` chỉ kiểm tra được với kiểu thô (`List` trong trường hợp này), không phải kiểu tham số hoá cụ thể.

Một hạn chế khác là bạn không tạo được mảng của kiểu tham số hoá. Nên bạn không viết được:
```java
List<String>[] array = new List<String>[10];
```

Một lần nữa, nguyên nhân là type erasure. Trình biên dịch không có đủ thông tin lúc chạy để tạo mảng của kiểu tham số hoá cụ thể.

Bạn có thể thắc mắc tại sao Java lại dùng type erasure ngay từ đầu. Một lý do chính là để duy trì tương thích ngược với những phiên bản Java cũ chưa có generics. Bằng cách xoá thông tin kiểu generic lúc biên dịch, mã generic vẫn dùng chung được với mã cũ không generic mà không gây vấn đề lúc chạy.

Vậy nên dù type erasure đôi khi có cảm giác như một hạn chế, đó là lựa chọn thiết kế có chủ đích của Java. Nó cân bằng giữa việc cung cấp an toàn kiểu lúc biên dịch và duy trì tương thích với các phiên bản trước của ngôn ngữ.

### Tạo class generic

Giờ khi bạn đã nắm vững type erasure, hãy khám phá cách tạo class generic của riêng mình.

Tạo class generic khá đơn giản. Bạn chỉ cần định nghĩa class với một hoặc nhiều tham số kiểu đặt trong dấu ngoặc nhọn sau tên class. Những tham số kiểu này đóng vai trò chỗ giữ cho các kiểu thực tế sẽ được dùng khi class được khởi tạo.

Ví dụ, giả sử bạn muốn tạo một class generic đơn giản tên `Pair`, chứa hai giá trị có thể thuộc hai kiểu khác nhau:

```java
public class Pair<T, U> {
    private T first;
    private U second;

    public Pair(T first, U second) {
        this.first = first;
        this.second = second;
    }

    public T getFirst() {
        return first;
    }

    public U getSecond() {
        return second;
    }

    public void setFirst(T first) {
        this.first = first;
    }

    public void setSecond(U second) {
        this.second = second;
    }

    public static void main(String[] args) {
        Pair<String, Integer> pair = new Pair<>("Hello", 42);

        // Demonstrate compile-time type safety
        String firstElement = pair.getFirst(); // No casting required
        Integer secondElement = pair.getSecond();

        System.out.println("First: " + firstElement);
        System.out.println("Second: " + secondElement);

        // Compiler will catch type mismatch errors
        // pair.setFirst(100); // Uncommenting this line will cause a compile-time error
    }
}
```

Trong ví dụ này, `T` và `U` là các tham số kiểu. Chúng được thay bằng bất kỳ kiểu hợp lệ nào khi tạo instance của class `Pair`. Chẳng hạn, bạn tạo được `Pair<String, Integer>` để chứa cặp gồm một `String` và một `Integer`.

Dùng `Object` để thiết kế một class linh hoạt là chưa đủ. Dù `Object` cho phép bạn lưu bất kỳ loại object nào trong class, nó thiếu an toàn kiểu. Với generics, bạn nêu chính xác được những kiểu muốn làm việc, và trình biên dịch sẽ đảm bảo chỉ object thuộc những kiểu đó được dùng với class của bạn. Điều này bắt được những lỗi liên quan tới kiểu ngay lúc biên dịch thay vì lúc chạy.

Bên cạnh đó, dùng generics không ảnh hưởng đáng kể tới hiệu năng. Nhớ rằng trình biên dịch Java thực hiện type erasure, nên thông tin kiểu generic bị loại bỏ lúc biên dịch, và bytecode sinh ra về cơ bản giống như khi bạn dùng kiểu thô. Trong hầu hết trường hợp, khác biệt hiệu năng là không đáng kể.

### Quy ước đặt tên cho generics

Khi tạo class hay method generic, cần tuân theo những quy ước đặt tên đã được thiết lập cho tham số kiểu. Dù trình biên dịch không bắt buộc, tuân theo các quy ước này khiến mã dễ đọc và dễ bảo trì hơn.

Những tên tham số kiểu phổ biến nhất là chữ in hoa đơn, chẳng hạn:
- `E` cho một phần tử (element)
- `K` cho khoá của map (key)
- `V` cho giá trị của map (value)
- `T` cho một kiểu tổng quát (type)
- `S`, `U`, `V`, v.v. cho các kiểu bổ sung

Về mặt kỹ thuật bạn dùng được tên dài hơn cho tham số kiểu, nhưng điều đó nhìn chung không được khuyến khích. Tên một chữ cái là quy ước được chấp nhận rộng rãi và khiến mã súc tích, dễ đọc hơn. Nên bám theo tên quy ước trừ khi bạn có lý do thuyết phục để làm khác.

Ví dụ, với map, quy ước là dùng `K` cho khoá và `V` cho giá trị, nhưng trình biên dịch không ép buộc điều này. Tuy nhiên, tuân theo quy ước khiến mã của bạn nhất quán và dễ hiểu hơn cho lập trình viên khác.

Những quy ước đặt tên này cung cấp một bộ từ vựng nhất quán mà lập trình viên dựa vào khi đọc và viết mã generic. Tuân theo chúng khiến mã của bạn tự nhiên hơn và dễ bảo trì hơn.

### Viết method và constructor generic

Giờ khi bạn đã quen với class generic và tham số kiểu, hãy khám phá một tính năng mạnh mẽ khác: viết method generic.

Method generic cho phép bạn viết mã tái sử dụng được, làm việc với nhiều kiểu khác nhau, mang lại sự linh hoạt và an toàn kiểu. Bằng cách định nghĩa tham số kiểu ở mức method, bạn tạo được method nhận và trả về giá trị thuộc nhiều kiểu khác nhau.

Đây là ví dụ về method generic:

```java
public static <T> void printArray(T[] array) {
    for (T element : array) {
        System.out.println(element);
    }
}
```

Trong ví dụ này, method `printArray` được định nghĩa với tham số kiểu `T`. Method nhận một mảng kiểu `T` và in từng phần tử. Tham số kiểu `T` được khai báo trước kiểu trả về của method, đặt trong dấu ngoặc nhọn `<>`.

Bạn gọi được method generic này với những mảng thuộc kiểu khác nhau:

```java
String[] strings = { "Hello", "World", "Java" } ;
printArray(strings);

Integer[] integers = { 1, 2, 3, 4, 5 };
printArray(integers);
```

Method `printArray` gọi được với mảng chuỗi hoặc mảng số nguyên, thể hiện sự linh hoạt khi làm việc với nhiều kiểu.

Đây là ví dụ khác về method generic có trả về giá trị:

```java
public static <T> T getFirst(T[] array) {
    if (array != null && array.length > 0) {
        return array[0];
    }
    return null;
}
```

Trong ví dụ này, method `getFirst` được định nghĩa với tham số kiểu `T`. Nó nhận một mảng kiểu `T` và trả về phần tử đầu tiên của mảng, cũng thuộc kiểu `T`. Nếu mảng là `null` hoặc rỗng, nó trả về `null`.

Bạn gọi method này và gán kết quả cho một biến thuộc kiểu phù hợp:

```java
String[] strings = { "Hello", "World", "Java" };
String firstString = getFirst(strings);

Integer[] integers = { 1, 2, 3, 4, 5 };
Integer firstInteger = getFirst(integers);
```

Khi gọi method generic, bạn có tuỳ chọn nêu tường minh đối số kiểu, hoặc để trình biên dịch tự suy ra dựa trên ngữ cảnh.

Đây là ví dụ nêu tường minh kiểu đối số:
```java
String[] strings = { "Hello", "World", "Java" };
String firstString = GenericMethodExample.<String>getFirst(strings);
```

Trong ví dụ này, ta nêu tường minh đối số kiểu `<String>` khi gọi method `getFirst`. Điều đó báo cho trình biên dịch rằng tham số kiểu `T` phải gắn với kiểu `String`.

Và đây là ví dụ về suy luận kiểu:
```java
Integer[] integers = { 1, 2, 3, 4, 5 };
Integer firstInteger = GenericMethodExample.getFirst(integers);
```

Trong trường hợp này, ta bỏ qua đối số kiểu tường minh và để trình biên dịch suy ra kiểu dựa trên đối số method. Trình biên dịch suy ra rằng tham số kiểu `T` phải gắn với kiểu `Integer`.

Tham số generic hoạt động tương tự với constructor:
```java
public class GenericBox<T> {
    private T content;

    public GenericBox(T content) {
        this.content = content;
    }

    public T getContent() {
        return content;
    }
}
```

Trong ví dụ này, class `GenericBox` có constructor nhận một đối số generic kiểu `T`. Để tạo instance của `GenericBox` với một kiểu cụ thể, bạn truyền đối số generic khi gọi constructor:

```java
GenericBox<String> stringBox = new GenericBox<>("Hello");
GenericBox<Integer> integerBox = new GenericBox<>(42);
```

Bằng cách nêu `<String>` hay `<Integer>` khi tạo instance `GenericBox`, bạn định nghĩa tường minh kiểu của `content` được lưu trong từng hộp.

Bạn cũng truyền được đối số generic cho một static factory method, ví dụ:
```java
public class GenericFactory {
    public static <T> List<T> createList(T... elements) {
        return new ArrayList<>(Arrays.asList(elements));
    }
}
```

Ở đây, method `createList` là một static factory method tạo một `ArrayList` mới dựa trên các phần tử được cung cấp. Để truyền đối số generic khi gọi method này, bạn dùng cú pháp sau:

```java
List<String> stringList = GenericFactory.<String>createList("Apple", "Banana", "Orange");
List<Integer> integerList = GenericFactory.<Integer>createList(1, 2, 3, 4, 5);
```

Bằng cách nêu tường minh `<String>` hay `<Integer>` trước tên method, bạn chỉ rõ tham số kiểu mong muốn cho danh sách được tạo.

Cần lưu ý rằng trong nhiều trường hợp, trình biên dịch Java suy ra được đối số kiểu generic dựa trên ngữ cảnh, chẳng hạn kiểu của đối số method hay phép gán biến. Trong những trường hợp đó, bạn bỏ được đối số generic tường minh và để trình biên dịch tự suy ra:

```java
List<String> stringList = GenericFactory.createList("Apple", "Banana", "Orange");
```

Tuy nhiên, vẫn có những tình huống cần truyền tường minh đối số generic, chẳng hạn khi trình biên dịch không suy ra được kiểu hoặc khi bạn muốn ép một kiểu cụ thể.

### Trả về kiểu generic

Ngoài việc tạo class và method generic nhận tham số kiểu, bạn cũng trả về được kiểu generic từ method. Điều này cho phép bạn viết mã linh hoạt và tái sử dụng tốt hơn, bằng cách để method trả về những giá trị mà kiểu của chúng do tham số kiểu quyết định.

Xét ví dụ này:
```java
public class GenericReturn {
    public static <T> T identity(T value) {
        return value;
    }
}
```

Method `identity` nhận một giá trị kiểu `T` và đơn giản trả về nó. Method dùng tham số kiểu `T` để nêu cả kiểu tham số đầu vào lẫn kiểu trả về. Đây là ví dụ đơn giản về việc trả về cùng kiểu với đầu vào.

Tuy nhiên, bạn cũng trả về được kiểu khác dựa trên đầu vào, ví dụ:
```java
public class GenericReturn {
    public static <T, R> R process(T input, Function<T, R> processor) {
        return processor.apply(input);
    }
}
```

Trong ví dụ này, method `process` nhận đầu vào kiểu `T` và một `Function` chuyển `T` thành `R`. Method áp dụng hàm `processor` lên đầu vào và trả về kết quả kiểu `R`. Điều này minh hoạ cách trả về kiểu khác dựa trên đầu vào và một hàm được cung cấp.

Hoặc bạn trả về được một collection generic:
```java
public class GenericReturn {
    public static <T> List<T> toList(T... elements) {
        return Arrays.asList(elements);
    }
}
```

Trong ví dụ này, method `toList` nhận tham số varargs kiểu `T` và trả về một `List` kiểu `T`. Method này chuyển các phần tử đầu vào thành một danh sách generic, cho thấy cách trả về một collection generic.

Và đây là ví dụ trả về kiểu generic dựa trên nhiều tham số kiểu:
```java
public class GenericReturn {
    public static <K, V> Map<K, V> singletonMap(K key, V value) {
        return Collections.singletonMap(key, value);
    }
}
```

Method `singletonMap` nhận một khoá kiểu `K` và một giá trị kiểu `V`, trả về một `Map` chứa cặp khoá-giá trị. Method này minh hoạ cách trả về kiểu generic phụ thuộc vào nhiều tham số kiểu.

Những ví dụ trên cho thấy sự linh hoạt và sức mạnh của việc trả về kiểu generic.

Khi thiết kế method có kiểu trả về generic, hãy cân nhắc những điều sau:
- Dùng tên tham số kiểu mang tính mô tả và có ý nghĩa để tăng tính dễ đọc.
- Đảm bảo kiểu trả về tương thích với mục đích sử dụng của method.
- Cân nhắc ảnh hưởng tới độ phức tạp và khả năng bảo trì khi dùng kiểu trả về generic quá nhiều.

Tận dụng kiểu trả về generic, bạn tạo được những method thích ứng với nhiều kiểu đầu vào và kiểu trả về khác nhau, khiến mã tái sử dụng tốt hơn và áp dụng được cho nhiều tình huống.

### Nạp chồng method generic

Nạp chồng method là tính năng nền tảng trong Java, cho phép nhiều method cùng tên nhưng khác kiểu tham số trong cùng một class. Nguyên tắc này cũng áp dụng cho method generic. Bạn nạp chồng method generic bằng cách cung cấp những tham số kiểu khác nhau hoặc dùng những kiểu tham số khác nhau.

Xét ví dụ sau:

```java
public class GenericMethodOverloading {
    public static <T> void print(T item) {
        System.out.println("Printing single item: " + item);
    }

    public static <T> void print(T item1, T item2) {
        System.out.println("Printing two items: " + item1 + ", " + item2);
    }

    public static <T, U> void print(T item1, U item2) {
        System.out.println("Printing two items of different types: " + item1 + ", " + item2);
    }
}
```

Trong ví dụ này, ta có ba phiên bản nạp chồng của method generic `print`:
1. Method đầu nhận một tham số generic `T` và in nó.
2. Method thứ hai nhận hai tham số generic cùng kiểu `T` và in chúng.
3. Method thứ ba nhận hai tham số generic khác kiểu `T` và `U` rồi in chúng.

Khi gọi những method này, trình biên dịch xác định phiên bản nào được chạy dựa trên số lượng và kiểu của đối số được cung cấp.

```java
GenericMethodOverloading.print("Hello");
GenericMethodOverloading.print(10, 20);
GenericMethodOverloading.print("Hello", 42);
```

Trong đoạn mã trên:
- Lời gọi thứ nhất chạy phiên bản `print` một tham số, với `T` được suy ra là `String`.
- Lời gọi thứ hai chạy phiên bản `print` hai tham số cùng kiểu, với `T` được suy ra là `Integer`.
- Lời gọi thứ ba chạy phiên bản `print` hai tham số khác kiểu, với `T` suy ra là `String` và `U` suy ra là `Integer`.

Nạp chồng method generic mang lại sự linh hoạt và cho phép bạn định nghĩa nhiều biến thể của một method để xử lý những kiểu hoặc tổ hợp kiểu khác nhau.

Tuy nhiên, cần thận trọng khi nạp chồng method generic. Cơ chế suy luận kiểu của trình biên dịch không phải lúc nào cũng xác định được phiên bản method bạn muốn gọi, nhất là khi các method nạp chồng có tham số kiểu tương tự nhau. Trong những trường hợp đó, bạn có thể phải nêu tường minh đối số kiểu để khử nhập nhằng.

```java
GenericMethodOverloading.<String>print("Hello");
```

Trong ví dụ này, ta nêu tường minh đối số kiểu `<String>` để đảm bảo phiên bản `print` một tham số được gọi.

### Cài đặt interface generic

Cũng như định nghĩa được class generic, bạn định nghĩa được interface generic trong Java. Interface generic cung cấp cách nêu một hợp đồng mà các class có thể cài đặt, mang lại sự linh hoạt và khả năng tái sử dụng cao hơn.

Hãy xem một ví dụ để hiểu cách cài đặt interface generic:

```java
public interface Processor<T> {
    void process(T data);
}

public class StringProcessor implements Processor<String> {
    @Override
    public void process(String data) {
        System.out.println("Processing string: " + data);
    }
}

public class IntegerProcessor implements Processor<Integer> {
    @Override
    public void process(Integer data) {
        System.out.println("Processing integer: " + data);
    }
}
```

Trong ví dụ này, ta có interface generic `Processor<T>`. Interface khai báo một method `process` nhận đối số kiểu `T`. Mục đích của interface này là định nghĩa hợp đồng xử lý dữ liệu kiểu `T`.

Sau đó ta có hai class, `StringProcessor` và `IntegerProcessor`, implement interface `Processor` với tham số kiểu khác nhau.

Class `StringProcessor` implement `Processor<String>`, cho biết nó sẽ cung cấp phần cài đặt method `process` xử lý dữ liệu `String`. Bên trong method `process`, ta chỉ đơn giản in một thông điệp kèm dữ liệu chuỗi được cung cấp.

Tương tự, class `IntegerProcessor` implement `Processor<Integer>`, nêu rằng nó sẽ xử lý dữ liệu `Integer`. Method `process` trong class này in một thông điệp kèm dữ liệu số nguyên được cung cấp.

Bằng cách implement interface generic `Processor`, cả hai class đều tuân thủ hợp đồng xử lý dữ liệu, nhưng chúng xử lý những kiểu khác nhau (`String` và `Integer` trong trường hợp này).

Đây là cách bạn dùng class `StringProcessor` và `IntegerProcessor`:

```java
Processor<String> stringProcessor = new StringProcessor();
stringProcessor.process("Hello, World!");

Processor<Integer> integerProcessor = new IntegerProcessor();
integerProcessor.process(42);
```

Trong ví dụ này, ta tạo instance của `StringProcessor` và `IntegerProcessor` rồi gán chúng cho biến kiểu `Processor<String>` và `Processor<Integer>` tương ứng. Sau đó ta gọi method `process` trên từng processor, truyền vào kiểu dữ liệu phù hợp.

Kết quả của đoạn mã này là:
```
Processing string: Hello, World!
Processing integer: 42
```

Cài đặt interface generic cho phép tái sử dụng mã, polymorphism, và khả năng tạo những class cùng thuật toán mang tính tổng quát hơn.

Tuy nhiên, bạn cần ghi nhớ những điều sau:
- Tham số kiểu nêu trong khai báo interface phải khớp với tham số kiểu dùng trong class cài đặt.
- Class cài đặt phải cung cấp phần cài đặt cho mọi method khai báo trong interface generic.
- Tham số kiểu dùng được bên trong class cài đặt để định nghĩa field, tham số method và kiểu trả về.

### Tạo record generic

Record cung cấp cách súc tích để định nghĩa class dữ liệu bất biến. Chúng cũng có thể là generic, cho phép bạn tạo những cấu trúc dữ liệu linh hoạt và tái sử dụng được.

Đây là ví dụ tạo một record generic:

```java
public record Pair<T, U>(T first, U second) {
    public Pair {
        if (first == null || second == null) {
            throw new IllegalArgumentException("Both elements must be non-null");
        }
    }
}
```

Trong ví dụ này, ta định nghĩa record generic tên `Pair`. Nó có hai tham số kiểu `T` và `U`, đại diện cho kiểu của phần tử thứ nhất và thứ hai trong cặp.

Record `Pair` có hai thành phần: `first` kiểu `T` và `second` kiểu `U`. Những thành phần này tự động được chuyển thành field `private final` và accessor method `public`.

Ta cũng đưa vào một compact constructor trong định nghĩa record. Compact constructor cho phép ta thêm logic kiểm tra hoặc xử lý bổ sung trong quá trình tạo instance `Pair`. Ở đây, ta kiểm tra xem `first` hay `second` có `null` không, và nếu có thì ném `IllegalArgumentException` để đảm bảo cả hai phần tử đều khác null.

Việc tạo và dùng instance của record generic `Pair` rất đơn giản:

```java
Pair<String, Integer> pair1 = new Pair<>("Hello", 42);
System.out.println(pair1.first() + ", " + pair1.second());

Pair<Double, Boolean> pair2 = new Pair<>(3.14, true);
System.out.println(pair2.first() + ", " + pair2.second());
```

Trong ví dụ này, ta tạo hai instance của record `Pair` với đối số kiểu khác nhau. `pair1` là `Pair<String, Integer>`, đại diện cho cặp gồm một chuỗi và một số nguyên. Ta tạo nó bằng cách truyền giá trị "Hello" và 42 vào constructor.

Tương tự, `pair2` là `Pair<Double, Boolean>`, đại diện cho cặp gồm một double và một boolean. Ta tạo nó bằng cách truyền giá trị `3.14` và `true` vào constructor.

Ta truy cập được các thành phần của instance `Pair` qua accessor method được sinh tự động là `first()` và `second()`.

Kết quả của đoạn mã này sẽ là:
```
Hello, 42
3.14, true
```

### Giới hạn kiểu generic

Khi làm việc với generics, có những tình huống bạn muốn hạn chế những kiểu được dùng làm đối số kiểu. Đây là lúc việc giới hạn (bounding) kiểu generic phát huy tác dụng. Java cung cấp ba cách giới hạn kiểu generic: wildcard không giới hạn, wildcard có giới hạn trên, và wildcard có giới hạn dưới.

#### Wildcard không giới hạn

Wildcard không giới hạn, biểu diễn bằng ký hiệu `?`, mang lại sự linh hoạt cao nhất khi làm việc với kiểu generic. Chúng cho phép bất kỳ kiểu nào được dùng làm đối số kiểu, hữu ích trong những tình huống bạn không có ràng buộc kiểu cụ thể nào.

Xét ví dụ này:
```java
public static void printList(List<?> list) {
    for (Object item : list) {
        System.out.println(item);
    }
}
```

Ở đây ta có method generic `printList` nhận `List<?>` làm tham số. Wildcard không giới hạn `?` nghĩa là method nhận được danh sách thuộc bất kỳ kiểu nào. Bên trong method, ta duyệt danh sách và in từng phần tử.

Đây là ví dụ gọi method `printList`:
```java
List<String> stringList = Arrays.asList("Hello", "World");
printList(stringList);

List<Integer> integerList = Arrays.asList(1, 2, 3);
printList(integerList);
```

Trong đoạn mã trên, ta tạo một `List<String>` và một `List<Integer>`, rồi truyền chúng vào method `printList`. Method xử lý được danh sách thuộc bất kỳ kiểu nào nhờ wildcard không giới hạn.

Một điều cần lưu ý: khi dùng wildcard không giới hạn, bạn chỉ **đọc** được từ collection và xử lý các phần tử như object thuộc class `Object`. Bạn không thêm được phần tử vào collection vì trình biên dịch không biết kiểu cụ thể của các phần tử.

Wildcard không giới hạn hữu ích khi bạn muốn viết mã generic làm việc được với mọi kiểu, không áp đặt ràng buộc kiểu cụ thể nào.

#### Wildcard giới hạn trên

Wildcard giới hạn trên, biểu diễn bằng `? extends type`, giới hạn những kiểu dùng làm đối số kiểu ở các kiểu con của kiểu đã nêu. Chúng cung cấp cách viết mã generic cụ thể hơn mà vẫn giữ được sự linh hoạt.

Xét ví dụ này:
```java
public static double sumNumbers(List<? extends Number> numbers) {
    double sum = 0;
    for (Number number : numbers) {
        sum += number.doubleValue();
    }
    return sum;
}
```

Ở đây ta có method generic `sumNumbers` nhận `List<? extends Number>` làm tham số. Wildcard giới hạn trên `? extends Number` nghĩa là method nhận được danh sách thuộc bất kỳ kiểu nào là kiểu con của `Number`, như `Integer`, `Double` hay `Long`.

Đây là ví dụ gọi method `sumNumbers`:
```java
List<Integer> integerList = Arrays.asList(1, 2, 3);
double integerSum = sumNumbers(integerList);
System.out.println("Sum of integers: " + integerSum);

List<Double> doubleList = Arrays.asList(1.5, 2.7, 3.2);
double doubleSum = sumNumbers(doubleList);
System.out.println("Sum of doubles: " + doubleSum);
```

Trong đoạn mã trên, ta tạo một `List<Integer>` và một `List<Double>`, rồi truyền chúng vào method `sumNumbers`. Method xử lý được danh sách thuộc bất kỳ kiểu con nào của `Number` nhờ wildcard giới hạn trên.

Nhờ dùng wildcard giới hạn trên, ta gọi an toàn được những method định nghĩa trong class `Number`, như `doubleValue()`, trên các phần tử của danh sách. Điều này cho phép ta thực hiện những thao tác cụ thể trên phần tử mà vẫn giữ được an toàn kiểu.

Tuy nhiên, tương tự wildcard không giới hạn, bạn không thêm được phần tử vào collection dùng wildcard giới hạn trên, vì trình biên dịch không biết kiểu con cụ thể của các phần tử.

Wildcard giới hạn trên hữu ích khi bạn muốn viết mã generic thao tác trên một cây phân cấp kiểu cụ thể, cho phép linh hoạt trong phạm vi cây phân cấp đó.

#### Wildcard giới hạn dưới

Wildcard giới hạn dưới, biểu diễn bằng `? super type`, giới hạn những kiểu dùng làm đối số kiểu ở các kiểu cha của kiểu đã nêu. Chúng cung cấp cách viết mã generic làm việc được với một kiểu cụ thể và các kiểu cha của nó.

Xét ví dụ này:
```java
public static void addNumbers(List<? super Integer> numbers) {
    numbers.add(10);
    numbers.add(20);
    numbers.add(30);
}
```

Ở đây ta có method generic `addNumbers` nhận `List<? super Integer>` làm tham số. Wildcard giới hạn dưới `? super Integer` nghĩa là method nhận được danh sách thuộc bất kỳ kiểu nào là kiểu cha của `Integer`, như `Number` hay `Object`.

Đây là ví dụ gọi method `addNumbers`:
```java
List<Integer> integerList = new ArrayList<>();
addNumbers(integerList);
System.out.println("Integer list: " + integerList);

List<Number> numberList = new ArrayList<>();
addNumbers(numberList);
System.out.println("Number list: " + numberList);
```

Trong đoạn mã trên, ta tạo một `List<Integer>` rỗng và một `List<Number>` rỗng, rồi truyền chúng vào method `addNumbers`. Method thêm được object `Integer` vào cả hai danh sách vì `Integer` là kiểu con của `Number` và `Object`.

Khác với wildcard không giới hạn và giới hạn trên, với wildcard giới hạn dưới bạn **thêm** an toàn được phần tử thuộc kiểu đã nêu (`Integer` trong trường hợp này) vào collection. Lý do là trình biên dịch biết collection chứa được phần tử thuộc kiểu đã nêu hoặc các kiểu cha của nó.

Tuy nhiên, khi đọc phần tử từ collection dùng wildcard giới hạn dưới, bạn chỉ xử lý được chúng như object thuộc kiểu đã nêu hoặc các kiểu cha. Bạn không giả định được thông tin kiểu cụ thể hơn.

Wildcard giới hạn dưới hữu ích khi bạn muốn viết mã generic nhận một kiểu cụ thể và các kiểu cha của nó, cho phép bạn thêm phần tử thuộc kiểu đó vào collection.

Mỗi loại wildcard phục vụ một mục đích riêng và cung cấp những khả năng khác nhau khi làm việc với kiểu generic. Hãy nhớ:
- Dùng wildcard không giới hạn (`?`) khi bạn không có ràng buộc kiểu cụ thể nào và muốn cho phép mọi kiểu.
- Dùng wildcard giới hạn trên (`? extends type`) khi bạn muốn giới hạn ở các kiểu con của một kiểu cụ thể và thực hiện những thao tác riêng của kiểu đó.
- Dùng wildcard giới hạn dưới (`? super type`) khi bạn muốn giới hạn ở các kiểu cha của một kiểu cụ thể và thêm phần tử thuộc kiểu đó vào collection.

## Collections Framework

Một trong những phần hữu ích nhất của thư viện chuẩn Java là **Collections Framework**, cung cấp một bộ thành phần tái sử dụng được để quản lý nhóm object. Framework này gồm vài interface chính kế thừa từ interface `java.util.Collection` (interface này lại kế thừa từ `java.lang.Iterable`) để định nghĩa các loại collection khác nhau:

- Interface `List` biểu diễn một collection có thứ tự và cho phép phần tử trùng lặp. Hai cài đặt chính là `ArrayList` (dựa trên mảng co giãn được) và `LinkedList` (dùng danh sách liên kết đôi).

- Interface `Set` định nghĩa collection không cho phép phần tử trùng lặp. Class `HashSet` cung cấp cài đặt bằng bảng băm, còn `TreeSet` dùng cây đỏ-đen để lưu phần tử, giữ chúng theo thứ tự tăng dần.

- Interface `Deque` — viết tắt của *double-ended queue* (hàng đợi hai đầu) — biểu diễn collection cho phép thêm và xoá ở cả hai đầu. Những cài đặt chính gồm `ArrayDeque` và `LinkedList`, trong đó `ArrayDeque` thường cho hiệu năng tốt hơn với hầu hết thao tác.

- Interface `Map` ánh xạ những khoá duy nhất tới giá trị. Class `HashMap` dùng bảng băm, cho hiệu năng hằng số với các thao tác cơ bản, còn `TreeMap` dùng cây đỏ-đen và sắp xếp phần tử theo thứ tự tự nhiên của khoá hoặc theo một `Comparator` được cung cấp.

Tuy nhiên, đáng lưu ý rằng dù interface `Map` thuộc Java Collections Framework, nó **không** kế thừa từ interface `Collection`.

Java 21 giới thiệu ba interface mới để biểu diễn collection có thứ tự duyệt xác định:

- `SequencedCollection`: Collection có thứ tự duyệt được định nghĩa rõ, cung cấp API thống nhất để truy cập phần tử đầu và cuối, cùng việc xử lý phần tử theo chiều xuôi và chiều ngược.

- `SequencedSet`: Set có thứ tự duyệt xác định, kế thừa cả `Set` lẫn `SequencedCollection`.

- `SequencedMap`: Map có thứ tự duyệt xác định cho các entry, khoá và giá trị của nó.

Những interface mới này cung cấp cách làm việc nhất quán hơn với collection có thứ tự trên nhiều cài đặt khác nhau.

Đây là sơ đồ thể hiện cây phân cấp của những collection này, gồm cả các interface sequenced mới:

```
               ┌───────────────┐               ┌───────────┐
               │  Collection   │               │    Map    │
               └───────┬───────┘               └─────┬─────┘
                       │                             │
    ┌──────────────────┼──────────────┐              │
    │                  │              │              │
┌───┴──────┐    ┌──────┴──────┐  ┌────┴────┐   ┌─────┴─────┐
│   Set    │    │  Sequenced  │  │  Queue  │   │ Sequenced │
│          │    │ Collection  │  │         │   │    Map    │
└─┬─────┬──┘    └──────┬──────┘  └────┬────┘   └─────┬─────┘
  │     │   ┌──────────┼───────┐      │              │
  │     │   │          │       │      │              │
  │ ┌───┴───┴─┐   ┌────┴───┐   │  ┌───┴────┐    ┌────┴────┐
  │ │Sequenced│   │  List  │   └──│  Deque │    │ Sorted  │
  │ │   Set   │   └────────┘      └────────┘    │   Map   │
  │ └───┬─────┘                                 └─────────┘
  │     │                       
  │ ┌───┴────┐ 
  └─│ Sorted │ 
    │  Set   │ 
    └────────┘ 
```

Khi khai báo collection, ta tận dụng được *toán tử kim cương* (`<>`) để nêu kiểu:

```java
List<Integer> numbers = new ArrayList<>();
Map<String, Person> people = new HashMap<>();
```

Trình biên dịch sẽ suy ra đối số kiểu cho constructor dựa trên khai báo biến.

Có vài thao tác thông dụng ta thực hiện được trên collection. Để thêm một phần tử, ta dùng method `add`:

```java
List<String> words = new ArrayList<>();
words.add("hello");
words.add("world");
```

Để thêm toàn bộ phần tử của một collection khác, dùng `addAll`:

```java
List<String> moreWords = Arrays.asList("goodbye", "cruel", "world");
words.addAll(moreWords);
```

Ta xoá phần tử bằng method `remove`, nêu object cần xoá hoặc chỉ số của nó với collection có thứ tự:

```java
words.remove("hello");
words.remove(1); // removes element at index 1
```

Method `size` trả về số phần tử hiện có trong collection:

```java
int count = words.size(); 
```

Để xoá mọi phần tử khỏi collection, gọi method `clear`:

```java
words.clear();
```

Method `contains` kiểm tra collection có chứa một phần tử cụ thể không, trả về `true` nếu tìm thấy và `false` nếu ngược lại:

```java
boolean found = words.contains("hello");
```

Method `removeIf` cho phép xoá mọi phần tử thoả mãn một predicate cho trước:

```java
words.removeIf(word -> word.length() < 5);
```

Đoạn mã trên xoá mọi chuỗi có ít hơn 5 ký tự khỏi danh sách `words`.

Method `forEach` (thực chất đến từ interface `java.lang.Iterable`) thực hiện một hành động cho trước trên từng phần tử của collection:

```java
words.forEach(word -> System.out.println(word));
```

Đoạn này in từng từ trong danh sách ra console.

Method `equals` kiểm tra một object khác có bằng collection không. Để hai collection được coi là bằng nhau, chúng phải chứa cùng những phần tử theo cùng thứ tự (với collection có thứ tự) hoặc cùng những phần tử theo thứ tự bất kỳ (với collection không thứ tự):

```java
List<String> list1 = Arrays.asList("a", "b", "c");
List<String> list2 = Arrays.asList("a", "b", "c");
List<String> list3 = Arrays.asList("c", "b", "a");

System.out.println(list1.equals(list2)); // true
System.out.println(list1.equals(list3)); // false

Set<String> set1 = new HashSet<>(Arrays.asList("a", "b", "c"));
Set<String> set2 = new HashSet<>(Arrays.asList("c", "b", "a"));

System.out.println(set1.equals(set2)); // true
```

Cần lưu ý rằng để hai collection bằng nhau, các phần tử chúng chứa cũng phải cài đặt method `equals` cho đúng.

Với việc giới thiệu sequenced collection trong Java 21, giờ ta có những method nhất quán để làm việc với phần tử đầu và cuối của collection có thứ tự duyệt xác định:

```java
SequencedCollection<String> seq = new ArrayList<>(List.of("first", "second", "third"));

String first = seq.getFirst(); // "first"
String last = seq.getLast();   // "third"

seq.addFirst("new first");
seq.addLast("new last");

SequencedCollection<String> reversed = 
    seq.reversed(); // [new last, third, second, first, new first]
```

Những method này có sẵn trên `List`, `Deque`, `LinkedHashSet` và các collection khác cài đặt những interface sequenced mới.

Ở các phần tiếp theo, chúng ta sẽ xem xét kỹ hơn từng interface.

## Interface `List`

Như đã nói, interface `List` biểu diễn một collection có thứ tự và cho phép phần tử trùng lặp. Hai cài đặt chính của `List` là `ArrayList` và `LinkedList`. Dù cả hai class cài đặt cùng một interface, chúng có đặc tính hiệu năng khác nhau.

`ArrayList` dựa trên mảng động, cho hiệu năng hằng số khấu hao (amortized constant-time) với các thao tác cơ bản (thêm vào cuối, `get` và `set`), giả sử đã biết chỉ số. Tuy nhiên, chèn hay xoá phần tử ở giữa `ArrayList` có thể chậm, vì phải dịch chuyển toàn bộ phần tử phía sau, dẫn tới độ phức tạp `O(n)`.

Ngược lại, `LinkedList` lưu phần tử trong danh sách liên kết đôi. Điều này cho hiệu năng hằng số với thao tác chèn và xoá ở cả hai đầu danh sách. Tuy nhiên, truy cập phần tử theo chỉ số đòi hỏi duyệt danh sách từ đầu hoặc từ cuối, tốn thời gian tuyến tính. Chèn hay xoá ở giữa danh sách cũng tốn thời gian tuyến tính.

Do đó, nếu ứng dụng của bạn chủ yếu cần truy cập phần tử theo chỉ số, `ArrayList` nhìn chung là lựa chọn tốt hơn. Nếu nó thường xuyên chèn hoặc xoá phần tử ở giữa danh sách, `LinkedList` có thể là lựa chọn tốt hơn.

### Tạo một `List`

Cách phổ biến nhất để tạo instance `List` là dùng constructor:

```java
List<String> fruits = new ArrayList<>();
List<String> vegetables = new LinkedList<>();
```

Bạn cũng tạo được `List` từ một mảng bằng method `Arrays.asList`:

```java
String[] fruitArray = {"apple", "banana", "orange"};
List<String> fruits = Arrays.asList(fruitArray);
```

Lưu ý rằng `List` do `Arrays.asList` trả về dựa trên mảng gốc, nên mọi thay đổi trên mảng đều phản ánh vào `List` và ngược lại. Thêm nữa, `List` này có kích thước cố định nên bạn không thêm hay xoá phần tử được.

Bạn cũng dùng được các factory method `List.of` và `List.copyOf` để tạo danh sách không sửa được:

```java
List<String> fruits = List.of("apple", "banana", "orange");
List<String> vegetables = List.copyOf(new ArrayList<>(Arrays.asList("carrot", "broccoli", "potato")));
```

Method `List.of` nhận tham số varargs, cho phép bạn nêu từng phần tử riêng lẻ, còn `List.copyOf` tạo một `List` không sửa được mới từ một collection có sẵn. Những danh sách không sửa được này sẽ ném `UnsupportedOperationException` nếu bạn cố sửa chúng.

### Làm việc với method của `List`

Interface `List` cung cấp vài method để làm việc với phần tử. Method `add` chèn một phần tử tại vị trí đã nêu hoặc nối vào cuối `List`:

```java
List<String> fruits = new ArrayList<>();
fruits.add("apple");
fruits.add(0, "banana");
```

Method `get` và `set` cho phép bạn truy cập và sửa phần tử theo chỉ số:

```java
String fruit = fruits.get(0);
fruits.set(1, "orange");
```

Để xoá một phần tử, dùng method `remove`, nêu object cần xoá hoặc chỉ số của nó:

```java
fruits.remove("banana");
fruits.remove(0);
```

Method `replaceAll` áp dụng một hàm cho trước lên từng phần tử của `List`, thay mỗi phần tử bằng kết quả của hàm:

```java
fruits.replaceAll(String::toUpperCase);
```

Để sắp xếp các phần tử của `List`, dùng method `sort`:

```java
fruits.sort(Comparator.naturalOrder());
```

Method `sort` dùng thứ tự tự nhiên của phần tử, hoặc bạn cung cấp một `Comparator` tuỳ biến.

Để chuyển `List` thành mảng, dùng method `toArray`:

```java
String[] fruitArray = fruits.toArray(new String[0]);
```

Method `toArray` nhận một tham số mảng, đóng vai trò kiểu trả về và cũng dùng được để định kích thước mảng kết quả nếu nó đủ lớn. Nếu mảng được cung cấp nhỏ hơn `List`, một mảng mới cùng kiểu runtime sẽ được tạo với kích thước của `List`.

## Interface `Set`

Interface `Set` định nghĩa một collection không cho phép phần tử trùng lặp. Những cài đặt chính của `Set` là `HashSet`, `LinkedHashSet` và `TreeSet`. Mỗi class có đặc điểm và tình huống dùng riêng:

- `HashSet` lưu phần tử trong bảng băm, cho hiệu năng hằng số với các thao tác cơ bản (`add`, `remove`, `contains` và `size`), giả sử hàm băm phân tán phần tử đều giữa các bucket. Tuy nhiên, `HashSet` không duy trì thứ tự nào cho phần tử.

- `LinkedHashSet` là phiên bản có thứ tự của `HashSet`, duy trì một danh sách liên kết đôi xuyên qua toàn bộ entry. Điều này cho phép `LinkedHashSet` giữ nguyên thứ tự chèn của phần tử. `LinkedHashSet` tốn bộ nhớ hơn một chút và chậm hơn một chút so với `HashSet` ở các thao tác cơ bản.

- `TreeSet` lưu phần tử trong cây đỏ-đen, giữ chúng theo thứ tự tăng dần dựa trên thứ tự tự nhiên hoặc một `Comparator` được cung cấp. Điều này đảm bảo chi phí thời gian log(n) cho các thao tác cơ bản, nhưng nhìn chung chậm hơn `HashSet`.

Khi chọn cài đặt `Set`, hãy cân nhắc:
- Nếu bạn cần hiệu năng hằng số và không quan tâm thứ tự phần tử, dùng `HashSet`.
- Nếu bạn cần giữ thứ tự chèn của phần tử, dùng `LinkedHashSet`.
- Nếu bạn cần giữ phần tử theo thứ tự đã sắp xếp, dùng `TreeSet`.

### Tạo một `Set`

Bạn tạo `Set` bằng constructor, giống như với list:

```java
Set<String> fruits = new HashSet<>();
Set<String> vegetables = new LinkedHashSet<>();
Set<String> nuts = new TreeSet<>();
```

Cách khác, bạn cũng dùng được factory method `Set.of` và `Set.copyOf` để tạo set không sửa được:

```java
Set<String> fruits = Set.of("apple", "banana", "orange");
Set<String> vegetables = Set.copyOf(List.of("carrot", "broccoli", "potato"));
```

### Làm việc với method của `Set`

Interface `Set` cung cấp vài method để làm việc với phần tử. Method `add` chèn một phần tử vào `Set` nếu nó chưa có sẵn:

```java
Set<String> fruits = new HashSet<>();
fruits.add("apple");
fruits.add("banana");
fruits.add("apple"); // This will not be added, as "apple" is already in the Set
```

Để kiểm tra một phần tử có trong `Set` không, dùng method `contains`:

```java
boolean containsApple = fruits.contains("apple"); // true
```

Để xoá một phần tử khỏi `Set`, dùng method `remove`:

```java
fruits.remove("banana");
```

Method `size` trả về số phần tử trong `Set`:

```java
int numberOfFruits = fruits.size();
```

Để duyệt các phần tử của `Set`, bạn dùng vòng lặp `for-each` hoặc method `forEach`:

```java
for (String fruit : fruits) {
    System.out.println(fruit);
}

fruits.forEach(System.out::println);
```

## Interface `Deque`

Interface `Deque` — viết tắt của *double-ended queue* — biểu diễn một collection cho phép thêm và xoá ở cả đầu lẫn cuối. Những cài đặt chính của `Deque` là `ArrayDeque` và `LinkedList`:

- `ArrayDeque` là cài đặt của interface `Deque` dựa trên mảng co giãn được. Nó cho hiệu năng hằng số với thao tác thêm và xoá ở cả hai đầu, hiệu quả hơn `LinkedList` trong hầu hết tình huống. `ArrayDeque` không có sức chứa cố định và tự động lớn lên khi cần.

- `LinkedList` là cài đặt danh sách liên kết đôi và cũng implement interface `Deque`. Nó cho hiệu năng hằng số với thao tác thêm và xoá ở cả hai đầu. `LinkedList` phù hợp khi bạn cần một cài đặt `Deque` đồng thời hoạt động được như `List`.

Khi chọn cài đặt `Deque`, hãy cân nhắc:
- Nếu bạn chủ yếu cần một hàng đợi hai đầu, dùng `ArrayDeque` để có hiệu năng tốt hơn.
- Nếu bạn cần một cài đặt `Deque` đồng thời hoạt động được như `List`, dùng `LinkedList`.

### Tạo một `Deque`

Bạn tạo `Deque` bằng constructor, tương tự các loại collection khác:

```java
Deque<String> fruits = new ArrayDeque<>();
Deque<String> vegetables = new LinkedList<>();
```

Bạn cũng nêu được sức chứa ban đầu cho `ArrayDeque`:

```java
Deque<String> fruits = new ArrayDeque<>(20);
```

Đoạn này tạo một `ArrayDeque` với sức chứa ban đầu là 20 phần tử. Nếu số phần tử vượt quá sức chứa ban đầu, `ArrayDeque` sẽ tự động lớn lên khi cần.

Với `LinkedList`, bạn tạo được deque rỗng hoặc khởi tạo nó từ một collection khác:

```java
Deque<String> fruits = new LinkedList<>();
List<String> fruitList = Arrays.asList("apple", "banana", "orange");
Deque<String> fruitDeque = new LinkedList<>(fruitList);
```

### Làm việc với method của `Deque`

Interface `Deque` cung cấp vài method để làm việc với phần tử ở cả hai đầu. Method `addFirst` và `addLast` lần lượt chèn phần tử vào đầu và cuối deque:

```java
Deque<String> fruits = new ArrayDeque<>();
fruits.addFirst("apple");
fruits.addLast("banana");
```

Method `getFirst` và `getLast` lấy ra nhưng **không** xoá phần tử ở đầu và cuối deque. Nếu deque rỗng, chúng ném `NoSuchElementException`:

```java
String firstFruit = fruits.getFirst();
String lastFruit = fruits.getLast();
```

Để xoá và trả về phần tử ở đầu và cuối deque, dùng method `removeFirst` và `removeLast`. Nếu deque rỗng, chúng ném `NoSuchElementException`:

```java
String removedFirstFruit = fruits.removeFirst();
String removedLastFruit = fruits.removeLast();
```

Interface `Deque` cũng cung cấp method để dùng deque như một ngăn xếp (stack). Method `push` chèn phần tử vào đầu deque, method `pop` xoá và trả về phần tử ở đầu, còn method `peek` lấy ra nhưng không xoá phần tử ở đầu:

```java
Deque<String> stack = new ArrayDeque<>();
stack.push("apple");
stack.push("banana");

String topElement = stack.peek(); // banana
String poppedElement = stack.pop(); // banana
```

Những method này tương đương lần lượt với `addFirst`, `removeFirst` và `getFirst`, nhưng có cách đặt tên trực quan hơn khi dùng deque như một stack.

Thêm nữa, interface `Deque` cung cấp method `offerFirst`, `offerLast`, `peekFirst`, `peekLast`, `pollFirst` và `pollLast`. Chúng tương tự những method cùng tên không có tiền tố `offer`, `peek` hay `poll`, nhưng hành xử khác khi deque rỗng:

- `offerFirst` và `offerLast`: Chèn phần tử vào đầu và cuối deque. Chúng trả về giá trị `boolean` cho biết việc chèn có thành công không.
```java
boolean addedFirst = fruits.offerFirst("apple");
boolean addedLast = fruits.offerLast("banana");
```

- `peekFirst` và `peekLast`: Lấy ra nhưng không xoá phần tử ở đầu và cuối deque. Chúng trả về `null` nếu deque rỗng.
```java
String firstFruit = fruits.peekFirst(); // banana
String lastFruit = fruits.peekLast(); // apple
```

- `pollFirst` và `pollLast`: Xoá và trả về phần tử ở đầu và cuối deque. Chúng trả về `null` nếu deque rỗng.
```java
String removedFirstFruit = fruits.pollFirst(); // banana
String removedLastFruit = fruits.pollLast(); // apple
```

Những method này hữu ích khi bạn muốn tránh exception và xử lý các trường hợp đặc biệt một cách mềm mại hơn.

## Interface `Map`

Interface `Map` biểu diễn một collection ánh xạ những khoá duy nhất tới giá trị. Nó không phải kiểu con của interface `Collection`, nhưng vẫn được coi là một phần của Java Collections Framework. Những cài đặt chính của `Map` là `HashMap`, `LinkedHashMap` và `TreeMap`.

- `HashMap` là cài đặt của interface `Map` lưu cặp khoá-giá trị trong bảng băm. Nó cho hiệu năng hằng số với các thao tác cơ bản (`put`, `get`, `remove`), giả sử hàm băm phân tán phần tử đều giữa các bucket. `HashMap` không đảm bảo thứ tự nào cho phần tử.

- `LinkedHashMap` là cài đặt của interface `Map` duy trì một danh sách liên kết đôi xuyên qua toàn bộ entry. Điều này cho phép nó giữ nguyên thứ tự chèn của các cặp khoá-giá trị. `LinkedHashMap` cho hiệu năng gần như y hệt `HashMap` ở các thao tác cơ bản.

- `TreeMap` là cài đặt của interface `Map` lưu entry trong cây đỏ-đen, sắp xếp theo thứ tự tự nhiên của khoá hoặc theo một `Comparator` được cung cấp. Điều này đảm bảo chi phí thời gian `log(n)` cho các thao tác cơ bản, nhưng nhìn chung chậm hơn `HashMap`.

### Tạo một `Map`

Bạn tạo `Map` bằng constructor, tương tự các loại collection khác:

```java
Map<String, Integer> fruitCounts = new HashMap<>();
Map<String, Integer> vegetableCounts = new LinkedHashMap<>();
Map<String, Integer> nutCounts = new TreeMap<>();
```

Bạn cũng tạo được `Map` với sức chứa ban đầu và hệ số tải (load factor) — áp dụng cho `HashMap` và `LinkedHashMap`:

```java
Map<String, Integer> fruitCounts = new HashMap<>(20, 0.8f);
```

Đoạn này tạo một `HashMap` với sức chứa ban đầu 20 và hệ số tải 0.8. Hệ số tải quyết định khi nào `HashMap` cần được mở rộng để giữ hiệu năng.

### Làm việc với method của `Map`

Interface `Map` cung cấp vài method để làm việc với các cặp khoá-giá trị:

- `clear`: Xoá mọi entry khỏi map.
```java
fruitCounts.clear();
```

- `containsKey`: Trả về `true` nếu map chứa khoá đã nêu.
```java
boolean containsApple = fruitCounts.containsKey("apple");
```

- `containsValue`: Trả về `true` nếu map chứa giá trị đã nêu.
```java
boolean containsCount = fruitCounts.containsValue(5);
```

- `entrySet`: Trả về khung nhìn `Set` của các entry trong map.
```java
Set<Map.Entry<String, Integer>> entries = fruitCounts.entrySet();
```

- `forEach`: Thực hiện hành động cho trước trên từng entry trong map.
```java
fruitCounts.forEach((fruit, count) -> System.out.println(fruit + ": " + count));
```

- `get`: Trả về giá trị gắn với khoá đã nêu, hoặc `null` nếu không tìm thấy khoá.
```java
Integer appleCount = fruitCounts.get("apple");
```

- `getOrDefault`: Trả về giá trị gắn với khoá đã nêu, hoặc giá trị mặc định cho trước nếu không tìm thấy khoá.
```java
Integer appleCount = fruitCounts.getOrDefault("apple", 0);
```

- `isEmpty`: Trả về `true` nếu map không chứa entry nào.
```java
boolean empty = fruitCounts.isEmpty();
```

- `keySet`: Trả về khung nhìn `Set` của các khoá trong map.
```java
Set<String> fruits = fruitCounts.keySet();
```

- `merge`: Nếu khoá đã nêu chưa gắn với giá trị nào hoặc đang gắn với `null`, gắn nó với giá trị khác null cho trước. Ngược lại, thay giá trị đang gắn bằng kết quả của hàm ánh xạ lại (remapping function) cho trước.
```java
fruitCounts.merge("apple", 1, Integer::sum);
```

- `put`: Gắn giá trị đã nêu với khoá đã nêu trong map.
```java
fruitCounts.put("apple", 5);
```

- `putIfAbsent`: Nếu khoá đã nêu chưa gắn với giá trị nào (hoặc đang ánh xạ tới `null`), gắn nó với giá trị cho trước và trả về `null`; ngược lại trả về giá trị hiện tại.
```java
fruitCounts.putIfAbsent("apple", 5);
```

- `remove`: Xoá entry của khoá đã nêu khỏi map nếu có.
```java
fruitCounts.remove("apple");
```

- `replace`: Chỉ thay entry của khoá đã nêu nếu nó đang ánh xạ tới một giá trị nào đó.
```java
fruitCounts.replace("apple", 6);
```

- `replaceAll`: Thay giá trị của từng entry bằng kết quả của việc gọi hàm cho trước trên entry đó, cho tới khi mọi entry được xử lý hoặc hàm ném exception.
```java
fruitCounts.replaceAll((fruit, count) -> count * 2);
```

- `size`: Trả về số entry trong map.
```java
int numberOfFruits = fruitCounts.size();
```

- `values`: Trả về khung nhìn `Collection` của các giá trị chứa trong map.
```java
Collection<Integer> counts = fruitCounts.values();
```

### Override `hashCode()`

Khi dùng `HashMap` hay `LinkedHashMap`, việc đảm bảo method `hashCode` của khoá được override đúng cách là thiết yếu. Method `hashCode` phải trả về cùng một mã băm cho những object được coi là bằng nhau theo method `equals`. Điều này cần thiết để map hoạt động đúng và hiệu quả.

Đây là ví dụ về một class tự định nghĩa với method `hashCode` và `equals` được override đúng cách:

```java
class Person {
    private String name;
    private int age;

    // Constructor, getters, and setters

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Person person = (Person) o;
        return age == person.age && Objects.equals(name, person.name);
    }

    @Override
    public int hashCode() {
        return Objects.hash(name, age);
    }
}
```

Trong ví dụ này, method `hashCode` của class `Person` được cài đặt bằng cách truyền field `name` và `age` vào method `Objects.hash`. Điều này đảm bảo mã băm sinh ra dựa trên giá trị của những field đó.

Method `Objects.hash` là một static utility method do class `java.util.Objects` cung cấp, sinh mã băm cho một dãy giá trị đầu vào. Đây là cú pháp chung của method `Objects.hash`:

```java
public static int hash(Object... values)
```

Method nhận số lượng đối số kiểu `Object` tuỳ ý, nghĩa là bạn truyền được giá trị thuộc nhiều kiểu khác nhau. Nó tính mã băm cho từng giá trị đầu vào bằng method `hashCode` tương ứng của chúng, rồi kết hợp lại để tạo ra một mã băm duy nhất. Nó cũng xử lý giá trị `null` đúng cách, nên bạn không cần đưa phép kiểm tra `null` vào phần cài đặt `hashCode`.

Cần lưu ý rằng khi override method `hashCode` bằng `Objects.hash`, bạn cũng nên override method `equals` để đảm bảo những object được coi là bằng nhau có cùng mã băm. Điều này cần thiết để các collection dựa trên băm như `HashMap` và `HashSet` hoạt động đúng.

## Sắp xếp dữ liệu

Sắp xếp là thao tác cho phép bạn xếp các phần tử theo một thứ tự cụ thể. Trong Java, bạn sắp xếp dữ liệu bằng interface `Comparable` hoặc interface `Comparator`. Interface `Comparable` định nghĩa thứ tự tự nhiên của phần tử, còn interface `Comparator` cho phép bạn định nghĩa thứ tự tuỳ biến.

### Interface `Comparable`

Để tạo một class sắp xếp được theo thứ tự tự nhiên của nó, bạn cần implement interface `Comparable`. Interface này định nghĩa một method duy nhất, `compareTo`, so sánh object hiện tại với một object khác cùng kiểu.

Đây là ví dụ về class `Person` implement `Comparable`:

```java
class Person implements Comparable<Person> {
    private String name;
    private int age;

    // Constructor, getters, and setters

    @Override
    public int compareTo(Person other) {
        // Compare by age first, then by name if ages are equal
        int ageComparison = Integer.compare(this.age, other.age);
        if (ageComparison != 0) {
            return ageComparison;
        }
        return this.name.compareTo(other.name);
    }
}
```

Trong ví dụ này, method `compareTo` trước hết so sánh hai object `Person` theo tuổi. Nếu tuổi bằng nhau, nó so sánh tên theo thứ tự từ điển. Method `compareTo` trả về giá trị âm, không, hoặc dương tương ứng với việc object hiện tại nhỏ hơn, bằng, hay lớn hơn object kia.

Khi cài đặt method `compareTo`, cần xử lý giá trị `null` đúng cách để tránh `NullPointerException`. Bạn làm điều đó bằng cách thêm phép kiểm tra `null` ở đầu method:

```java
@Override
public int compareTo(Person other) {
    if (other == null) {
        return 1; // Consider non-null values to be greater than null values
    }
    // Rest of the comparison logic
}
```

Trong ví dụ này, nếu object `other` là `null`, method trả về 1, cho biết object hiện tại lớn hơn giá trị `null`. Bạn điều chỉnh hành vi này theo yêu cầu cụ thể của mình.

Ngoài ra, cần đảm bảo hành vi của method `compareTo` nhất quán với method `equals`. Nếu hai object được coi là bằng nhau theo `equals`, method `compareTo` của chúng phải trả về không.

Đây là ví dụ về method `equals` nhất quán với method `compareTo`:

```java
class Person implements Comparable<Person> {
    private String name;
    private int age;

    // Constructor, getters, and setters

    @Override
    public int compareTo(Person other) {
        // Compare by age first, then by name if ages are equal
        int ageComparison = Integer.compare(this.age, other.age);
        if (ageComparison != 0) {
            return ageComparison;
        }
        return this.name.compareTo(other.name);
    }
                                            
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Person person = (Person) o;
        return age == person.age && Objects.equals(name, person.name);
    }
}
```

Trong ví dụ này, method `equals` coi hai object `Person` là bằng nhau nếu chúng có cùng tuổi và cùng tên. Điều này nhất quán với method `compareTo`, vốn so sánh tuổi trước rồi tới tên.

### Interface `Comparator`

Trong khi interface `Comparable` định nghĩa thứ tự tự nhiên của phần tử, interface `Comparator` cho phép bạn định nghĩa thứ tự tuỳ biến. `Comparator` là một class riêng chứa logic so sánh.

Đây là ví dụ về `Comparator` so sánh object `Person` theo độ dài tên:

```java
class NameLengthComparator implements Comparator<Person> {
    @Override
    public int compare(Person p1, Person p2) {
        return Integer.compare(p1.getName().length(), p2.getName().length());
    }
}
```

Trong ví dụ này, method `compare` của `NameLengthComparator` so sánh hai object `Person` dựa trên độ dài tên. Nó trả về giá trị âm, không, hoặc dương tương ứng với việc độ dài tên người thứ nhất nhỏ hơn, bằng, hay lớn hơn độ dài tên người thứ hai.

Interface `Comparator` có vài helper method giúp việc dựng comparator dễ hơn:

- `comparing`: Tạo comparator dựa trên một hàm trích ra khoá `Comparable` từ một kiểu.
```java
Comparator<Person> nameComparator = Comparator.comparing(Person::getName);
```

- `comparingDouble`, `comparingInt`, `comparingLong`: Tạo comparator dựa trên hàm trích ra khoá `double`, `int` hoặc `long` từ một kiểu.
```java
Comparator<Person> ageComparator = Comparator.comparingInt(Person::getAge);
```

- `naturalOrder`, `reverseOrder`: Tạo comparator dựa trên thứ tự tự nhiên hoặc thứ tự ngược của thứ tự tự nhiên của một kiểu.
```java
Comparator<String> naturalStringComparator = Comparator.naturalOrder();
Comparator<String> reverseStringComparator = Comparator.reverseOrder();
```

Interface `Comparator` cũng có các default method cho phép bạn kết hợp và biến đổi comparator:

- `reversed`: Đảo ngược thứ tự của một comparator.
```java
Comparator<Person> reversedNameComparator = nameComparator.reversed();
```

- `thenComparing`, `thenComparingDouble`, `thenComparingInt`, `thenComparingLong`: Cho phép nối chuỗi comparator.
```java
Comparator<Person> nameAndAgeComparator = nameComparator.thenComparingInt(Person::getAge);
```

Trong ví dụ này, `nameAndAgeComparator` trước hết so sánh object `Person` theo tên, và nếu tên bằng nhau thì so sánh theo tuổi.

### So sánh `Comparable` và `Comparator`

Cả `Comparable` lẫn `Comparator` đều dùng để sắp xếp phần tử trong Java, nhưng chúng có vài khác biệt then chốt.

Về mục đích:
- `Comparable` dùng để định nghĩa thứ tự tự nhiên của phần tử bên trong một class. Nó phù hợp khi class có một thứ tự vốn có, hợp lý cho hầu hết tình huống.
- `Comparator` dùng để định nghĩa thứ tự tuỳ biến cho phần tử của một class. Nó cho phép nhiều cách so sánh phần tử và hữu ích khi thứ tự tự nhiên không phù hợp, hoặc khi bạn cần sắp xếp phần tử theo những tiêu chí khác nhau.

Về cách cài đặt:
- `Comparable` là interface được cài đặt bởi chính class đó. Class phải định nghĩa method `compareTo`, so sánh object hiện tại với object khác cùng kiểu và trả về giá trị âm, không, hoặc dương tương ứng với việc object hiện tại nhỏ hơn, bằng, hay lớn hơn object kia.
- `Comparator` là interface được cài đặt như một class riêng. Class cài đặt `Comparator` phải định nghĩa method `compare`, so sánh hai object thuộc một kiểu cụ thể và trả về giá trị âm, không, hoặc dương tương ứng với việc object thứ nhất nhỏ hơn, bằng, hay lớn hơn object thứ hai.

Về tính linh hoạt:
- `Comparable` cung cấp **một** cách duy nhất để so sánh phần tử của một class. Khi method `compareTo` đã được định nghĩa, nó trở thành thứ tự tự nhiên của class đó. Nếu cần đổi thứ tự, bạn phải sửa chính class.
- `Comparator` cho phép **nhiều** cách so sánh phần tử của một class. Bạn định nghĩa được nhiều class `Comparator`, mỗi class có method `compare` riêng, để cung cấp những tiêu chí sắp xếp khác nhau. Điều này đặc biệt hữu ích khi bạn cần sắp xếp phần tử theo những thuộc tính khác nhau hoặc muốn có nhiều lựa chọn sắp xếp thay thế.

Đây là ví dụ minh hoạ tính linh hoạt của `Comparator`:

```java
class Person {
    private String name;
    private int age;

    // Constructor, getters, and setters
}

class NameComparator implements Comparator<Person> {
    @Override
    public int compare(Person p1, Person p2) {
        return p1.getName().compareTo(p2.getName());
    }
}

class AgeComparator implements Comparator<Person> {
    @Override
    public int compare(Person p1, Person p2) {
        return Integer.compare(p1.getAge(), p2.getAge());
    }
}

// Usage
List<Person> people = new ArrayList<>();
// Add elements to the list

// Sort using NameComparator
Collections.sort(people, new NameComparator());

// Sort using AgeComparator
Collections.sort(people, new AgeComparator());
```

Trong ví dụ này, ta định nghĩa hai class `Comparator`: `NameComparator` và `AgeComparator`. `NameComparator` so sánh object `Person` theo tên, còn `AgeComparator` so sánh theo tuổi. Ta dùng hai `Comparator` này thay thế cho nhau để sắp xếp danh sách `people` theo những tiêu chí khác nhau.

Tóm lại, khi chọn giữa `Comparable` và `Comparator`, hãy cân nhắc:
- Nếu class có thứ tự tự nhiên phù hợp cho hầu hết tình huống và bạn kiểm soát được class đó, hãy implement `Comparable`.
- Nếu bạn cần nhiều cách so sánh phần tử, muốn định nghĩa thứ tự tuỳ biến, hoặc cần sắp xếp phần tử của một class từ bên thứ ba, hãy dùng `Comparator`.
- Bạn dùng được cả `Comparable` lẫn `Comparator` cùng lúc. Nếu một `Comparator` được truyền cho method sắp xếp, nó được ưu tiên hơn thứ tự tự nhiên do `Comparable` định nghĩa.

### `Collections.sort` và `Collections.binarySearch`

Class `Collections` cung cấp các utility method để làm việc với collection, bao gồm method sắp xếp và tìm kiếm.

Method `Collections.sort` sắp xếp một `List` theo thứ tự tự nhiên (định nghĩa bởi interface `Comparable`) hoặc theo một `Comparator` được cung cấp:

```java
List<Person> people = new ArrayList<>();
// Add elements to the list

// Sort using natural ordering (Comparable)
Collections.sort(people);

// Sort using a custom Comparator
Collections.sort(people, new NameLengthComparator());
```

Trong ví dụ này, lời gọi `Collections.sort` thứ nhất sắp xếp danh sách `people` theo thứ tự tự nhiên do method `compareTo` của class `Person` định nghĩa. Lời gọi thứ hai sắp xếp danh sách theo `NameLengthComparator` tuỳ biến.

Method `Collections.binarySearch` tìm một phần tử trong `List` **đã sắp xếp** bằng thuật toán tìm kiếm nhị phân. `List` phải được sắp xếp tăng dần theo thứ tự tự nhiên (`Comparable`) hoặc theo `Comparator` được cung cấp:

```java
List<Person> people = new ArrayList<>();
// Add elements to the list and sort it

Person searchKey = new Person("John", 30);
int index = Collections.binarySearch(people, searchKey);
if (index >= 0) {
    System.out.println("Found at index: " + index);
} else {
    System.out.println("Not found");
}
```

Trong ví dụ này, method `Collections.binarySearch` tìm object `searchKey` trong danh sách `people` đã sắp xếp. Nếu tìm thấy phần tử, nó trả về chỉ số; ngược lại trả về giá trị âm.

Nếu `List` chưa được sắp xếp hoặc được sắp theo thứ tự khác với thứ tự dùng trong tìm kiếm nhị phân, kết quả là không xác định.

Cần lưu ý rằng khi dùng `Collections.sort` hay `Collections.binarySearch` với `Comparator` tuỳ biến, `Comparator` nên nhất quán với `equals` để đảm bảo hành vi đúng đắn. Nếu hai phần tử bằng nhau theo `Comparator`, chúng cũng nên bằng nhau theo method `equals`.

## Tóm tắt các loại collection

Đây là vài bảng giúp bạn tra nhanh những thông tin then chốt về Java Collections Framework:

### Bảng 1: Interface collection và các cài đặt

| Interface | Mô tả | Cài đặt chính | Đặc điểm |
|-----------|-------------|----------------------|-----------------|
| `List`    | Collection có thứ tự, cho phép phần tử trùng lặp | `ArrayList`, `LinkedList` | `ArrayList` dựa trên mảng co giãn, `LinkedList` dùng danh sách liên kết đôi |
| `Set`     | Collection không cho phép phần tử trùng lặp | `HashSet`, `LinkedHashSet`, `TreeSet` | `HashSet` dùng bảng băm, `LinkedHashSet` giữ thứ tự chèn, `TreeSet` dùng cây đỏ-đen để sắp xếp |
| `Deque`   | Hàng đợi hai đầu, cho phép thêm và xoá ở cả hai đầu | `ArrayDeque`, `LinkedList` | `ArrayDeque` mảng co giãn, `LinkedList` danh sách liên kết đôi |
| `Map`     | Ánh xạ khoá duy nhất tới giá trị | `HashMap`, `LinkedHashMap`, `TreeMap` | `HashMap` bảng băm, `LinkedHashMap` giữ thứ tự chèn, `TreeMap` cây đỏ-đen cho khoá đã sắp xếp |

### Bảng 2: Chức năng của các interface collection cốt lõi

| Interface   | Thứ tự   | Trùng lặp | Giá trị null |
|-------------|------------|------------|-------------|
| `List`      | Có thứ tự    | Cho phép    | Cho phép     |
| `Set`       | Không thứ tự  | Không cho phép| Cho phép     |
| `Deque`     | Có thứ tự    | Cho phép    | Không cho phép |

### Bảng 2.1: Chức năng của interface Map

| Interface   | Thứ tự   | Khoá trùng lặp | Khoá null | Giá trị null |
|-------------|------------|----------------|-----------|-------------|
| `Map`       | Không thứ tự  | Không cho phép    | Cho phép   | Cho phép     |

### Bảng 3: Method chung của collection

| Interface | Method | Mô tả |
|-----------|--------|-------------|
| `Collection` | `add(E e)` | Thêm một phần tử vào collection |
| `Collection` | `addAll(Collection<? extends E> c)` | Thêm toàn bộ phần tử từ một collection khác |
| `Collection` | `remove(Object o)` | Xoá một phần tử đã nêu |
| `Collection` | `size()` | Trả về số phần tử |
| `Collection` | `clear()` | Xoá mọi phần tử |
| `Collection` | `contains(Object o)` | Kiểm tra collection có chứa phần tử đã nêu không |
| `Collection` | `removeIf(Predicate<? super E> filter)` | Xoá mọi phần tử thoả mãn một predicate |
| `Collection` | `forEach(Consumer<? super E> action)` | Thực hiện một hành động cho từng phần tử |
| `Collection` | `equals(Object o)` | Kiểm tra một object khác có bằng collection không |

### Bảng 4: Method riêng của List

| Method | Mô tả |
|--------|-------------|
| `add(int index, E element)` | Chèn một phần tử tại vị trí đã nêu |
| `get(int index)` | Trả về phần tử tại vị trí đã nêu |
| `set(int index, E element)` | Thay phần tử tại vị trí đã nêu |
| `remove(int index)` | Xoá phần tử tại vị trí đã nêu |
| `replaceAll(UnaryOperator<E> operator)` | Thay mỗi phần tử bằng kết quả của một hàm |
| `sort(Comparator<? super E> c)` | Sắp xếp danh sách bằng một comparator |
| `toArray(T[] a)` | Chuyển danh sách thành mảng |

### Bảng 5: Method riêng của Set

| Method | Mô tả |
|--------|-------------|
| `add(E e)` | Thêm phần tử vào set nếu chưa có |
| `contains(Object o)` | Kiểm tra set có chứa phần tử đã nêu không |
| `remove(Object o)` | Xoá một phần tử đã nêu |
| `size()` | Trả về số phần tử |
| `forEach(Consumer<? super E> action)` | Thực hiện một hành động cho từng phần tử |

### Bảng 6: Method riêng của Deque

| Method | Mô tả |
|--------|-------------|
| `addFirst(E e)` | Chèn phần tử vào đầu deque |
| `addLast(E e)` | Chèn phần tử vào cuối deque |
| `getFirst()` | Lấy ra nhưng không xoá phần tử đầu deque |
| `getLast()` | Lấy ra nhưng không xoá phần tử cuối deque |
| `removeFirst()` | Xoá và trả về phần tử đầu deque |
| `removeLast()` | Xoá và trả về phần tử cuối deque |
| `push(E e)` | Chèn phần tử vào đầu deque |
| `pop()` | Xoá và trả về phần tử ở đầu deque |

### Bảng 7: Method riêng của Map

| Method | Mô tả |
|--------|-------------|
| `clear()` | Xoá mọi entry khỏi map |
| `containsKey(Object key)` | Kiểm tra map có chứa khoá đã nêu không |
| `containsValue(Object value)` | Kiểm tra map có chứa giá trị đã nêu không |
| `entrySet()` | Trả về khung nhìn set của các entry trong map |
| `forEach(BiConsumer<? super K,? super V> action)` | Thực hiện một hành động cho từng entry |
| `get(Object key)` | Trả về giá trị gắn với khoá đã nêu |
| `getOrDefault(Object key, V defaultValue)` | Trả về giá trị của khoá, hoặc giá trị mặc định nếu không tìm thấy khoá |
| `isEmpty()` | Kiểm tra map có rỗng không |
| `keySet()` | Trả về khung nhìn set của các khoá trong map |
| `merge(K key, V value, BiFunction<? super V,? super V,? extends V> remappingFunction)` | Trộn giá trị với giá trị hiện có của khoá |
| `put(K key, V value)` | Gắn một giá trị với một khoá |
| `putIfAbsent(K key, V value)` | Gắn giá trị với khoá nếu khoá chưa được gắn |
| `remove(Object key)` | Xoá entry của một khoá |
| `replace(K key, V value)` | Thay entry của một khoá |
| `replaceAll(BiFunction<? super K,? super V,? extends V> function)` | Thay mỗi giá trị bằng kết quả của một hàm |
| `size()` | Trả về số entry |
| `values()` | Trả về khung nhìn collection của các giá trị trong map |

## Các điểm chính

- Mảng là object chứa số lượng cố định các giá trị cùng một kiểu, nằm trên những ô nhớ liền kề.

- Để tạo mảng, bạn khai báo một biến thuộc kiểu mảng mong muốn và dùng keyword `new` để tạo object mảng.

- Phần tử mảng tự động được khởi tạo với giá trị mặc định (0 cho kiểu số, `false` cho boolean, `null` cho kiểu tham chiếu).

- Chỉ số mảng bắt đầu từ 0. Truy cập phần tử ngoài giới hạn mảng sẽ gây `ArrayIndexOutOfBoundsException`.

- Thuộc tính `length` cho biết số phần tử trong mảng. Đây là thuộc tính chứ không phải method nên không dùng cặp ngoặc đơn.

- Mảng nhiều chiều là *mảng của các mảng*. Loại phổ biến nhất là mảng hai chiều, thường dùng để biểu diễn ma trận hay bảng dữ liệu.

- Mảng vô danh được khai báo và khởi tạo trong một câu lệnh duy nhất mà không gán cho biến. Chúng thường dùng khi truyền mảng làm đối số cho method.

- Class `java.util.Arrays` chứa nhiều static method để thao tác trên mảng, gồm method sắp xếp, tìm kiếm, so sánh và điền giá trị.

- Method `Arrays.sort()` sắp xếp phần tử của mảng theo thứ tự tăng dần. Nó có phiên bản nạp chồng cho các kiểu mảng khác nhau và sắp xếp được một phần mảng.

- Method `Arrays.binarySearch()` tìm một phần tử cụ thể trong mảng đã sắp xếp bằng thuật toán tìm kiếm nhị phân. Mảng phải được sắp xếp thì method mới hoạt động đúng.

- Method `Arrays.compare()` so sánh hai mảng theo thứ tự từ điển.

- Method `Arrays.fill()` điền một giá trị cụ thể vào toàn bộ hoặc một phần mảng. Với mảng object, nó đặt mỗi phần tử tham chiếu tới cùng một object.

- Generics là cơ chế trong Java cho phép bạn viết mã làm việc được với nhiều kiểu khác nhau mà vẫn giữ được an toàn kiểu.

- Type erasure là quá trình trình biên dịch loại bỏ mọi thông tin kiểu generic lúc biên dịch, thay chúng bằng giới hạn của chúng hoặc bằng kiểu `Object`.

- Class generic được định nghĩa với một hoặc nhiều tham số kiểu đặt trong dấu ngoặc nhọn sau tên class. Những tham số kiểu này đóng vai trò chỗ giữ cho kiểu thực tế được dùng khi class được khởi tạo.

- Method generic cho phép bạn viết mã tái sử dụng được, làm việc với nhiều kiểu khác nhau. Tham số kiểu được định nghĩa trước kiểu trả về của method.

- Khi gọi method generic, bạn nêu tường minh được đối số kiểu hoặc để trình biên dịch tự suy ra dựa trên ngữ cảnh.

- Constructor generic và static factory method cũng nhận và trả về được kiểu generic.

- Khi thiết kế method có kiểu trả về generic, hãy dùng tên tham số kiểu mang tính mô tả, đảm bảo tương thích với mục đích sử dụng, và cân nhắc ảnh hưởng tới độ phức tạp của mã.

- Interface generic cung cấp cách nêu một hợp đồng mà các class có thể cài đặt, mang lại sự linh hoạt và khả năng tái sử dụng cao hơn.

- Record generic cung cấp cách súc tích để định nghĩa class dữ liệu bất biến làm việc được với nhiều kiểu khác nhau.

- Kiểu wildcard (`?`, `? extends T`, `? super T`) lần lượt cho phép bạn nêu kiểu chưa biết, giới hạn tham số kiểu ở các kiểu con của một kiểu, hoặc giới hạn tham số kiểu ở các kiểu cha của một kiểu.

- Java Collections Framework cung cấp một bộ thành phần tái sử dụng được để quản lý nhóm object, gồm các interface `List`, `Set`, `Deque` và `Map`.

- Interface `Comparable` định nghĩa thứ tự tự nhiên của phần tử bên trong một class, còn interface `Comparator` cho phép bạn định nghĩa thứ tự tuỳ biến cho phần tử của một class.

- Method `Collections.sort()` sắp xếp một `List` theo thứ tự tự nhiên hoặc theo `Comparator` được cung cấp, còn `Collections.binarySearch()` tìm một phần tử trong `List` đã sắp xếp bằng thuật toán tìm kiếm nhị phân.
