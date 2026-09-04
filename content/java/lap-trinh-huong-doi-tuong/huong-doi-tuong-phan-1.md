---
layout: chapter

title: "Chương 1: Tiếp cận hướng đối tượng trong Java - Phần 1"
subtitle: "Utilizing Java Object-Oriented Approach - Part 1"
exam_objectives:
  - "Khai báo và khởi tạo đối tượng Java, bao gồm cả đối tượng của nested class; giải thích vòng đời đối tượng gồm việc tạo, gán lại tham chiếu và garbage collection."
  - "Tạo class và record; định nghĩa và sử dụng field/method ở mức instance và static, constructor, cùng instance initializer và static initializer."
  - "Cài đặt overloading, kể cả method có var-args."

previous_link: "/intro.html"
previous_title: "Introduction"
next_link: "/ch02.html"
next_title: "Utilizing Java Object-Oriented Approach - Part 2"
answers_link: "/ch01a.html"

description: "Đối tượng, lớp, vòng đời đối tượng, package, access modifier, field, method, constructor và nested class — nền tảng OOP cho kỳ thi OCP Java 21."
order: 1
phase: "Chương 1"
tags: [Java, OOP, OCP, Class, Object, Package, Constructor, Nested Class]
---
## Giới thiệu về lập trình hướng đối tượng

Đúng như tên gọi, lập trình hướng đối tượng (object-oriented programming — OOP) là một mô hình lập trình xoay quanh khái niệm **object** (đối tượng). Thay vì tổ chức chương trình quanh các thủ tục và hàm (như lập trình thủ tục), OOP tổ chức mã nguồn thành các object đại diện cho những thực thể trong thế giới thực, chứa cả dữ liệu (attribute — thuộc tính) lẫn hành vi (method — phương thức). Cách tiếp cận này mang lại vài lợi ích:

- Mã nguồn được tổ chức tốt hơn và có tính module cao hơn
- Tái sử dụng mã thông qua inheritance (kế thừa)
- Mô hình hoá được thế giới thực

Java là một ngôn ngữ OOP, nên viên gạch nền tảng của nó chính là object và class.

### Object và Class

**Object** là những thể hiện (instance) riêng biệt trong mã nguồn, chứa dữ liệu và hành vi. Còn **class** là bản thiết kế hay khuôn mẫu, định nghĩa phần dữ liệu và hành vi chung cho mọi object thuộc lớp đó.

Để dễ hình dung, hãy nghĩ tới những chiếc bánh quy được cắt ra từ một khuôn cắt bánh. Khuôn cắt định ra hình dáng và kích thước của bánh, giống như class định ra object instance sẽ có những attribute và method nào. Mỗi chiếc bánh vẫn có thể khác nhau — vị trí các hạt sô-cô-la không giống nhau — giống như mỗi object chứa những giá trị dữ liệu riêng.

Ví dụ, ta có thể định nghĩa class `Cookie` mô tả các thuộc tính của bánh quy như hương vị, hình dạng, topping, v.v. Ta cũng định nghĩa được method — những hàm thao tác trên dữ liệu. Method cho phép object thực hiện hành động. Object `Cookie` của chúng ta có thể có method `eat()`:

```java
public class Cookie {
    // Attributes
    String flavor; 
    int size;
                     
    // Behavior (Method)
    public void eat() {
        System.out.println("That was yummy!");
    }
}
```

- `public class Cookie` định nghĩa một class `Cookie` mới.
- `public` khiến class này truy cập được từ các class khác.
- `String flavor;` khai báo một attribute kiểu String tên là `flavor`.
- `int size;` khai báo một attribute `size` kiểu số nguyên.
- `public void eat()` định nghĩa method `eat` công khai, không trả về giá trị (`void`).
- Thân class và thân method đều được bọc trong cặp ngoặc nhọn `{ }`.
- `System.out.println();` in văn bản ra standard output (thường là console hoặc cửa sổ terminal).

Và ta có thể tạo (instantiate) các object bánh quy từ class `Cookie`:

```java
Cookie chocoChip = new Cookie();
chocoChip.flavor = "Chocolate Chip";
chocoChip.size = 2;

Cookie oatmealRaisin = new Cookie(); 
oatmealRaisin.flavor = "Oatmeal Raisin";
oatmealRaisin.size = 1;
```

- `Cookie chocoChip = new Cookie();` tạo một object `Cookie` mới tên `chocoChip`.
- Ta dùng tên class `Cookie` cùng constructor mặc định `new Cookie()`.
- `chocoChip.flavor = "Chocolate Chip";` gán attribute flavor cho `chocoChip`.
- `chocoChip.size = 2;` gán attribute size bằng `2`.
- Lặp lại quy trình đó cho `oatmealRaisin`, tạo ra một object bánh quy riêng biệt khác.

Hai object `chocoChip` và `oatmealRaisin` đều là bánh quy với cùng bộ method do class `Cookie` định nghĩa. Tuy nhiên chúng chứa những giá trị dữ liệu khác nhau ở các attribute như flavor và size.

Một hiểu lầm phổ biến là object và class giống nhau. Thực ra dù có liên quan, chúng phục vụ những mục đích khác biệt:

- Class định nghĩa cấu trúc của object.
- Object đại diện cho từng instance riêng biệt.

Class đóng vai trò cái khuôn, còn object là những chiếc bánh được làm ra.

### Các nguyên lý OOP ở mức cao hơn

Khi đã nắm được object và class, việc hiểu các nguyên lý OOP ở mức cao hơn như inheritance (kế thừa), encapsulation (đóng gói) và polymorphism (đa hình) sẽ dễ dàng hơn:

- **Inheritance** cho phép tái sử dụng mã và xây dựng cây phân cấp class. Nó giống như có một công thức bánh quy cơ bản làm khuôn mẫu cho nhiều loại bánh khác. Công thức cơ bản này (parent class — lớp cha) chứa những nguyên liệu và thao tác chung (attribute và hành vi) mà mọi loại bánh đều có. Các công thức chuyên biệt (subclass — lớp con) cho từng loại bánh như chocolate chip hay oatmeal raisin sẽ thừa hưởng phần chung nhưng bổ sung thêm nguyên liệu hoặc bước riêng.

- **Encapsulation** là việc gói dữ liệu (attribute) và hành vi lại trong định nghĩa class. Nó giống như gói bột bánh và bản hướng dẫn vào cùng một hộp gọn gàng. Mỗi loại bánh, dù là chocolate chip hay oatmeal raisin, đều có hộp riêng chứa đủ mọi thứ cần thiết: nguyên liệu (dữ liệu) và các bước làm (method). Cách đóng gói này đảm bảo mọi bí quyết làm bánh được giữ chặt bên trong, chỉ tiếp cận được qua một cửa nhất định của chiếc hộp.

- **Polymorphism** cho phép tuỳ biến hành vi kế thừa từ lớp cha trong lớp con, ví dụ override method `eat()` của lớp cha bên trong `ChocolateChip` để in ra `"Mmm chocolate chip!"`.

Tổng kết lại, ta mô hình hoá được cây phân cấp bánh quy trong thực tế thông qua:

- **Inheritance** – Tận dụng đặc điểm của bánh quy cha rồi mở rộng thêm.
- **Encapsulation** - Gói gọn nguyên liệu và công thức làm bánh.
- **Polymorphism** - Tuỳ biến hành vi như `eat()` cho từng lớp con.

Kết hợp lại, những khái niệm OOP cốt lõi này cho phép thiết kế class linh hoạt và có tính module. Chúng ta sẽ xem xét kỹ hơn ở chương sau. Trước hết, hãy nói về vòng đời của một object.

## Vòng đời của object trong Java

Hiểu các giai đoạn trong vòng đời của object là điều thiết yếu trong lập trình hướng đối tượng với Java. Nội dung này bao gồm việc tạo object, cách biến tham chiếu (reference variable) truy cập object, và cách những object không còn dùng được garbage collector của Java dọn dẹp.

Dưới đây là sơ đồ minh hoạ vòng đời điển hình của một object Java, từ lúc tạo tới lúc bị thu gom rác:
```
┌────────────────────┐
│   Object Creation  │
│    (new keyword)   │
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│   Initialization   │
│   (Constructor)    │
└────────┬───────────┘
         │
         ▼
┌───────────────────┐
│     Object Use    │
│ (Active Lifetime) │
└────────┬──────────┘
         │
         ▼
┌────────────────────┐
│     Unreachable    │
│(No more references)│
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│   Garbage Collect  │
│     (finalize)     │
└────────────────────┘
```

Để minh hoạ các giai đoạn sống của một object Java, hãy dùng phép so sánh với một cuốn sách thư viện. Khi một cuốn sách mới về tới thư viện, điều đó tương tự việc tạo một object mới bằng từ khoá `new`. Ví dụ:

```java
Book javaBook = new Book("The Java Book");
```

Hãy tách dòng lệnh đó thành từng bước:

1. **Khai báo biến tham chiếu:**
    ```java
    Book javaBook;
    ```
    Dòng này khai báo biến `javaBook` kiểu `Book`. Ở thời điểm này chưa có object `Book` nào tồn tại cả; ta mới chỉ tạo ra một biến tham chiếu có thể trỏ tới một object `Book`.

2. **Khởi tạo object:**
    ```java
    = new Book("The Java Book");
    ```
    Từ khoá `new` khởi tạo (instantiate) một object `Book` mới. Thao tác này cấp phát bộ nhớ trên heap cho object, truyền tham số chuỗi vào constructor của `Book` để khởi tạo trạng thái, rồi trả về tham chiếu tới object vừa tạo.

3. **Gán tham chiếu:**
    Toán tử `=` gán tham chiếu của object `Book` mới cho biến `javaBook`.

Vậy nên `javaBook` giờ đây chứa một tham chiếu trỏ tới instance `Book` mới trong bộ nhớ:

```
javaBook --> [New Book object]
```

Ở đây `javaBook` là biến tham chiếu trỏ tới instance `Book` vừa được tạo trên Java heap.

### Gán lại tham chiếu

Giống như sách thư viện được nhiều người mượn khác nhau, tham chiếu object trong Java có thể được gán lại. Ví dụ:

```java
Book refBook = javaBook; // Assign second reference
javaBook = null; // Remove original reference
```

Xem xét từng bước:

1. **Tạo tham chiếu thứ hai:**
    ```java
    Book refBook = javaBook;
    ```
    Dòng này tạo biến tham chiếu mới `refBook` và gán cho nó giá trị của `javaBook`. Cả `javaBook` lẫn `refBook` giờ đều trỏ tới cùng một object `Book`.

    ```
    javaBook --> [Book object]
    refBook --> [Book object]
    ```

2. **Gán null cho tham chiếu ban đầu:**
    ```java
    javaBook = null;
    ```
    Dòng này đặt `javaBook` thành `null`, nghĩa là nó không còn tham chiếu tới object nào.

    ```
    javaBook --> null
    refBook --> [Book object]
    ```

Giờ chỉ còn `refBook` trỏ tới object `Book`. Object này chưa đủ điều kiện để bị garbage collection vì `refBook` vẫn đang tham chiếu tới nó.

### Garbage Collection

Những cuốn sách không còn ai mượn rốt cuộc sẽ bị loại khỏi danh mục thư viện. Tương tự, trong Java những object không còn tham chiếu nào sẽ được garbage collector dọn dẹp:

```java
refBook = null; // Unreferenced object eligible for garbage collection
```

Khi mọi tham chiếu tới một object đều mất đi, object đó trở nên đủ điều kiện (eligible) để bị thu gom rác.

Quy trình garbage collection có thể tóm tắt như sau:

1. **Nhận diện object không còn dùng:**
    Garbage collector (GC) quét heap định kỳ để tìm những object không còn được bất kỳ phần nào của ứng dụng tham chiếu tới.

2. **Thu hồi bộ nhớ:**
    Những object không còn tham chiếu, không còn cách nào truy cập tới, bị coi là *rác* (garbage). GC giải phóng vùng nhớ mà chúng chiếm giữ, trả lại cho vùng nhớ trống trên heap.

3. **Quản lý tự động:**
    Garbage collection diễn ra tự động ở chế độ nền, không cần chương trình kích hoạt tường minh, đảm bảo việc quản lý bộ nhớ được xử lý hiệu quả.

Ở những ngôn ngữ như C, bộ nhớ phải được quản lý thủ công bằng cách tự cấp phát và giải phóng. Java tự động hoá quy trình này bằng garbage collection, giúp tăng năng suất lập trình viên và giảm rủi ro rò rỉ bộ nhớ cùng các vấn đề liên quan.

Bây giờ, hãy bàn về một số khái niệm sẽ dùng để khai báo class và các thành phần khác.

## Keyword (Từ khoá)

Trong Java, **keyword** là từ dành riêng (reserved word) mang ý nghĩa đã được định sẵn trong ngôn ngữ. Keyword định ra cấu trúc và cú pháp của chương trình Java. Chúng không thể dùng làm identifier (tên biến, method, class, v.v.) vì đã được dành riêng cho những mục đích cụ thể.

Java có một tập keyword mang tính nền tảng. Một số keyword thường gặp:

- `class`: Dùng để khai báo một class.
- `public`, `private`, `protected`: Các access modifier quyết định phạm vi nhìn thấy và khả năng truy cập của class, method và biến.
- `static`: Cho biết thành phần đó thuộc về chính class chứ không thuộc về từng instance.
- `void`: Chỉ ra rằng method không trả về giá trị.
- `if`, `else`, `switch`, `case`: Dùng cho câu lệnh điều kiện.
- `for`, `while`, `do`: Dùng cho vòng lặp.
- `return`: Dùng để trả về giá trị từ một method.
- `new`: Dùng để tạo instance mới của một class.
- `try`, `catch`, `finally`: Dùng cho xử lý ngoại lệ.
- `import`: Dùng để import class hoặc package.

Luôn ghi nhớ rằng mỗi keyword có mục đích riêng và được dùng để định ra cấu trúc cũng như hành vi của chương trình Java.

Ngoài ra, cần lưu ý keyword trong Java phân biệt hoa thường. Ví dụ `class` là keyword, nhưng `Class` thì không. Bên cạnh đó, bạn không thể dùng keyword làm identifier như tên biến hay tên method, vì chúng đã được ngôn ngữ dành riêng.

Đây là ví dụ minh hoạ cách dùng một số keyword:

```java
public class MyClass {
    private static int myVariable;
    
    public static void myMethod() {
        if (myVariable > 0) {
            System.out.println("Positive");
        } else {
            System.out.println("Negative");
        }
    }
}
```

Trong ví dụ này, `public`, `class`, `private`, `static`, `int`, `void`, `if` và `else` đều là keyword dùng để định ra cấu trúc và hành vi của class `MyClass`.

Chúng ta sẽ xem lại những keyword này cùng nhiều keyword khác ở các phần và chương tiếp theo.

## Comment (Chú thích)

Comment là những ghi chú trong mã nguồn mà trình biên dịch bỏ qua. Chúng có thể dùng để:
- Mô tả hoặc giải thích mã nguồn làm gì.
- Ghi lại mục đích của một khối mã cụ thể.
- Giải thích logic đằng sau những thuật toán phức tạp.
- Đánh dấu các phần trong mã nguồn.

Java hỗ trợ ba loại comment:

1. Comment một dòng (single-line)
2. Comment nhiều dòng (multi-line)
3. Comment tài liệu (javadoc)

Comment một dòng bắt đầu bằng hai dấu gạch chéo (`//`). Mọi thứ đứng sau `//` trên cùng dòng đó đều bị trình biên dịch Java bỏ qua:

```java
// This is a single-line comment
int variable = 1; // This is another single-line comment
```

Comment nhiều dòng, còn gọi là block comment, bắt đầu bằng `/*` và kết thúc bằng `*/`. Mọi thứ nằm giữa `/*` và `*/` đều được coi là comment, bất kể trải dài bao nhiêu dòng:

```java
/* This is a multi-line comment
   and it can span multiple lines. */
int variable = 1;
```

Comment tài liệu, hay javadoc comment, được thiết kế để tài liệu hoá mã Java. Chúng bắt đầu bằng `/**` và kết thúc bằng `*/`. Loại comment này có thể được trích xuất thành tài liệu HTML bằng công cụ Javadoc. Comment tài liệu chủ yếu được đặt trước định nghĩa của class, interface, method và field:

```java
/**
 * This is a documentation comment.
 * It can be used to describe classes, interfaces, methods, and fields.
 */
public class MyClass {
    /**
     * This method adds up two int values.
     *
     * @param a First value
     * @param b Second value
     * @return The sum of a and b
     */
    public int add(int a, int b) {
        return a + b;
    }
}
```

## Tổ chức class thành package

**Package** gom các class, interface và sub-package liên quan lại thành một đơn vị.

Ví dụ, hãy tưởng tượng bạn sở hữu một cửa hàng tạp hoá bán rất nhiều loại sản phẩm. Để mọi thứ gọn gàng và dễ tìm, bạn quyết định nhóm các sản phẩm tương tự nhau vào những khu hoặc dãy kệ khác nhau trong cửa hàng.

Trong phép so sánh này:
- Cửa hàng tạp hoá tượng trưng cho dự án Java của bạn.
- Các khu hay dãy kệ trong cửa hàng tượng trưng cho package trong Java.
- Các sản phẩm trên kệ tượng trưng cho class và interface trong Java.

Giống như cách bạn nhóm các sản phẩm liên quan vào cùng một khu, trong Java bạn nhóm các class và interface liên quan vào cùng một package.

Chẳng hạn, trong cửa hàng của bạn có thể có:
- Khu *Trái cây* để tất cả các loại quả như táo, chuối, cam.
- Khu *Sữa* cho sữa tươi, phô mai, sữa chua và các sản phẩm từ sữa khác.
- Khu *Đồ uống* cho nước lọc, nước ép, nước ngọt.

Tương tự, trong dự án Java bạn có thể có:
- Package `com.example.products` cho các class liên quan tới quản lý sản phẩm như `Product`, `Inventory` và `Category`.
- Package `com.example.orders` cho các class liên quan tới xử lý đơn hàng như `Order`, `ShoppingCart` và `Payment`.
- Package `com.example.auth` cho các class liên quan tới xác thực người dùng như `User`, `Login` và `Permission`.

Đây là hình dung trực quan về những package và class đó:
```
┌─────────────────────────────────────────────────────────────┐
│                      com.example                            │
│  ┌─────────────────────────┐  ┌─────────────────────────┐   │
│  │       products          │  │         orders          │   │
│  │  ┌─────────────────┐    │  │  ┌─────────────────┐    │   │
│  │  │  Product.java   │    │  │  │  Order.java     │    │   │
│  │  └─────────────────┘    │  │  └─────────────────┘    │   │
│  │  ┌─────────────────┐    │  │  ┌─────────────────┐    │   │
│  │  │ Inventory.java  │    │  │  │ShoppingCart.java│    │   │
│  │  └─────────────────┘    │  │  └─────────────────┘    │   │
│  │  ┌─────────────────┐    │  │  ┌─────────────────┐    │   │
│  │  │ Category.java   │    │  │  │  Payment.java   │    │   │
│  │  └─────────────────┘    │  │  └─────────────────┘    │   │
│  └─────────────────────────┘  └─────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────┐                                │
│  │         auth            │                                │
│  │  ┌─────────────────┐    │                                │
│  │  │   User.java     │    │                                │
│  │  └─────────────────┘    │                                │
│  │  ┌─────────────────┐    │                                │
│  │  │   Login.java    │    │                                │
│  │  └─────────────────┘    │                                │
│  │  ┌─────────────────┐    │                                │
│  │  │ Permission.java │    │                                │
│  │  └─────────────────┘    │                                │
│  └─────────────────────────┘                                │
└─────────────────────────────────────────────────────────────┘
```

Bằng cách tổ chức class thành package, bạn tạo ra một cấu trúc logic giúp việc định vị và quản lý các thành phần mã liên quan dễ dàng hơn, hệt như việc sắp xếp sản phẩm theo khu giúp khách hàng tìm thứ họ cần dễ hơn trong cửa hàng.

### Tạo một package

Để tạo package, dùng keyword `package` theo sau là tên package, đặt ở đầu file mã nguồn Java. Ví dụ:
```java
package com.example.mypackage;
```

Tên package nên viết thường và tuân theo quy ước tên miền đảo ngược (reverse domain name) để đảm bảo tính duy nhất.

Tên package không được chứa bất kỳ từ dành riêng nào của Java (như `int`, `if`, `for`, v.v.).

Khai báo package phải là câu lệnh đầu tiên trong file mã nguồn, đứng trước mọi câu lệnh import và khai báo class. Đoạn sau sẽ không biên dịch được:
```java
import java.util.ArrayList; // Import statement before the package declaration

package mypackage; // Package declaration not at the beginning

public class MyClass {
    public static void main(String[] args) {
        System.out.println("This will not compile.");
    }
}
```

### Sử dụng câu lệnh import

Câu lệnh `import` được dùng để đưa class hoặc interface từ package khác vào namespace hiện tại. Thay vì phải viết fully qualified name (tên đầy đủ) mỗi lần tham chiếu tới một class ở package khác, bạn có thể dùng `import` để gọi class bằng tên ngắn. Ví dụ:
```java
import java.util.ArrayList;
// ...
ArrayList list = new ArrayList();
```

Nếu bạn chọn không dùng `import` cho một class thuộc package khác, bạn sẽ phải viết fully qualified name của class đó mỗi lần tham chiếu tới nó trong mã. Nhớ rằng fully qualified name gồm cả tên package lẫn tên class.

Ví dụ, nếu không import class `ArrayList` từ package `java.util`, bạn sẽ phải viết `java.util.ArrayList` mỗi lần muốn tạo hay dùng object `ArrayList`:
```java
// No import statement for java.util.ArrayList
// ...
java.util.ArrayList list = new java.util.ArrayList();
```

### Các trường hợp đặc biệt và thực hành tốt

Có vài ngoại lệ hay trường hợp đặc biệt đối với quy tắc dùng fully qualified name và câu lệnh import:

1. **Class trong package `java.lang`**: Class và interface thuộc package `java.lang` không cần import tường minh vì chúng luôn có sẵn. Chẳng hạn bạn không cần import các class như `String`, `Math`, `System`, hay các wrapper class như `Integer`, `Double`, v.v.

2. **Cùng package**: Class và interface nằm cùng package với class bạn đang viết không cần câu lệnh import. Java tự động tìm trong package hiện tại nếu không thấy class hay interface được tham chiếu trong các package đã import.

3. **Trùng tên fully qualified name**: Khi hai class trùng tên nhưng nằm ở hai package khác nhau, và bạn cần dùng cả hai trong cùng một file, bạn không thể import trực tiếp cả hai vì xung đột tên. Trong trường hợp đó, ít nhất một (có thể là cả hai) phải được gọi bằng fully qualified name để tránh nhập nhằng.

Ví dụ minh hoạ cho điểm cuối cùng này:

```java
import java.sql.Date;

public class Example {
    public static void main(String[] args) {
        Date sqlDate = new Date(System.currentTimeMillis());
        java.util.Date utilDate = new java.util.Date();
    }
}
```

Trong ví dụ trên, `Date` của `java.sql` đã được import nên có thể gọi bằng tên ngắn. Tuy nhiên vì ta cũng muốn dùng `Date` của `java.util`, ta phải gọi nó bằng fully qualified name để phân biệt với `java.sql.Date`.

Bạn cũng có thể dùng ký tự đại diện (`*`) để import toàn bộ class trong một package. Ví dụ:
```java
import java.util.*;
```

Tuy nhiên nhìn chung nên import từng class cụ thể thay vì dùng wildcard, vì wildcard làm mã khó đọc hơn, dễ dẫn tới xung đột tên nếu nhiều package có class trùng tên, và tạo ra dư thừa như việc đưa cùng một class vào hai lần.

### Import dư thừa

Dù trình biên dịch cho phép import dư thừa, chúng vẫn làm mã lộn xộn và giảm tính dễ đọc.

Ví dụ, giả sử ta có hai class `MyClass` và `HelperClass` cùng nằm trong package `mypackage`:

```java
// File: HelperClass.java
package mypackage;

public class HelperClass {
    public static void doSomething() {
        System.out.println("Doing something...");
    }
}
```

Class sau minh hoạ những import dư thừa:

```java
package mypackage;

import mypackage.HelperClass; // Redundant import because HelperClass is in the same package
import java.util.List; // Redundant import because it's not used in the class

public class MyClass {
    public static void main(String[] args) {
        HelperClass.doSomething();
    }
}
```

Trong ví dụ này:
- Câu lệnh `import mypackage.HelperClass;` là dư thừa vì `HelperClass` vốn đã nằm cùng package với `MyClass`. Nhớ rằng các class cùng package tự động dùng được lẫn nhau mà không cần import.
- Câu lệnh `import java.util.List;` cũng dư thừa vì interface `List` không được dùng ở đâu trong `MyClass`.

Bỏ những import dư thừa này sẽ làm mã sạch hơn mà không ảnh hưởng tới chức năng.

### Kiểm soát truy cập

Package cung cấp một mức kiểm soát truy cập, tương tự việc một số khu trong cửa hàng chỉ dành cho nhân viên được phép. Bạn dùng access modifier (`public`, `protected`, default, `private`) để kiểm soát phạm vi nhìn thấy và khả năng truy cập của class cùng các thành phần bên trong và giữa các package.

Ví dụ, giả sử bạn có package `com.example.internals` chứa các class và method chỉ dành cho sử dụng nội bộ trong package đó:
```java
package com.example.internals;
class InternalClass {
    void internalMethod() {
        // Internal implementation
    }
}
```

Bây giờ xét một package khác, `com.example.api`:
```java
package com.example.api;
import com.example.internals.InternalClass;
public class APIClass {
    public void someMethod() {
        InternalClass obj = new InternalClass(); // Not accessible
        obj.internalMethod(); // Not accessible
    }
}
```
Trong ví dụ này, `InternalClass` và các method của nó có quyền truy cập mặc định (package-private). Chúng dùng được bên trong package `com.example.internals` nhưng không dùng được từ package khác. `APIClass` thuộc package `com.example.api` không thể truy cập trực tiếp `InternalClass` hay các method của nó.

Hãy xem xét kỹ hơn các access modifier hiện có.

## Access Modifier

Access modifier là những keyword dùng trong khai báo class, method hoặc biến để kiểm soát phạm vi nhìn thấy của thành phần đó từ những phần khác của chương trình. Java có bốn loại access modifier chính:

1. **`public`**: Access modifier `public` xác định rằng thành phần đó truy cập được từ bất kỳ class nào khác trong ứng dụng Java, bất kể nó thuộc package nào. Dùng `public` nghĩa là không có hạn chế nào khi truy cập thành phần đó.

2. **`protected`**: Access modifier `protected` cho phép truy cập thành phần trong chính package của nó, đồng thời cả từ các lớp con (subclass) của class đó ở package khác. Mức này ít hạn chế hơn package-private nhưng hạn chế hơn `public`.

3. **`default`** (còn gọi là **package-private**): Nếu không chỉ định access modifier nào, thành phần đó mặc định có quyền truy cập package-private. Nghĩa là nó chỉ truy cập được bên trong package của chính nó và không nhìn thấy được từ các class ngoài package. Lưu ý quan trọng: Java không có keyword `default` tường minh cho việc này; bạn chỉ đơn giản là bỏ trống access modifier.

4. **`private`**: Access modifier `private` xác định rằng thành phần chỉ truy cập được bên trong class khai báo nó. Đây là mức hạn chế nhất, dùng để đảm bảo thành phần đó không thể bị truy cập từ bên ngoài class của nó, kể cả bởi lớp con.

Mỗi access modifier phục vụ một mục đích cụ thể trong bối cảnh thiết kế hướng đối tượng và encapsulation. Chúng cho phép bạn cấu trúc mã theo cách bảo vệ dữ liệu nhạy cảm và chi tiết cài đặt, đồng thời vẫn phơi bày những chức năng cần thiết cho các phần khác của ứng dụng.

Đây là sơ đồ giúp hình dung phạm vi của từng access modifier dễ hơn:
```
┌─────────────────────────────────────────────────────────────┐
│                         public                              │
│  ┌─────────────────────────────────────────────────┐        │
│  │               protected                         │        │
│  │  ┌─────────────────────────────────────┐        │        │
│  │  │    default (package-private)        │        │        │
│  │  │  ┌─────────────────────────┐        │        │        │
│  │  │  │      private            │        │        │        │
│  │  │  └─────────────────────────┘        │        │        │
│  │  └─────────────────────────────────────┘        │        │
│  └─────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────┘

Access Levels (from most restrictive to least restrictive):
private   : Same class only
default   : Same package
protected : Same package + subclasses in other packages
public    : Accessible from anywhere
```

Ở các phần tiếp theo, chúng ta sẽ giải thích access modifier trong ngữ cảnh class, field và method. Nhưng trước hết, hãy xem cách khai báo một class cho đúng.

## Khai báo class

Class trong Java đóng vai trò bản thiết kế cho object, đóng gói cả dữ liệu lẫn hành vi.

Cú pháp khai báo class theo định dạng sau:

```java
[accessModifier] class ClassName [extends Superclass] [implements Interface1, Interface2, ...] {
    // class body
}
```

Ví dụ, một khai báo class có thể trông như thế này:
```java
public class MyClass extends MySuperClass implements MyInterface {
    private int myField;

    public MyClass() {
        // Constructor body
    }

    public void myMethod() {
        // Method body
    }
}
```
Trước hết, bạn có thể tuỳ chọn chỉ định access modifier để quyết định phạm vi nhìn thấy và khả năng truy cập của class từ những phần khác trong ứng dụng Java:

- **`public`**: Class truy cập được từ bất kỳ class nào khác, kể cả ở package khác.
- **Default (package-private)**: Nếu không chỉ định access modifier, class chỉ truy cập được bởi các class khác trong cùng package. Điều này hữu ích để gom nhóm các class liên quan mà không phơi bày chúng ra toàn bộ ứng dụng.

Sau access modifier tuỳ chọn, bạn phải dùng keyword `class`, tiếp đó là tên class.

Tên class (class identifier) phải tuân theo các quy tắc sau:

1. **Ký tự Unicode**: Java cho phép dùng ký tự Unicode trong identifier, nghĩa là bạn có thể dùng chữ cái từ bảng chữ cái ngoài Latin. Tuy nhiên điều này hiếm khi được dùng và có thể khiến mã khó đọc, khó bảo trì.

2. **Chữ cái, chữ số, dấu gạch dưới (_) và ký hiệu đô-la ($)**: Đây là những ký tự phổ biến nhất trong identifier. Mọi tổ hợp của chúng đều được phép, nhưng tên class **không được** bắt đầu bằng chữ số.

3. **Không dùng ký tự đặc biệt**: Ngoài dấu gạch dưới và ký hiệu đô-la, các ký tự đặc biệt như `@`, `%`, `!`, `?`, `#`, `&`, `*`, `^`, `~`, `_`, `-`, `+`, `=`, `{`, `}`, `[`, `]`, `|`, `,`, `;`, `<`, `>`, `/`, `\` hay `'` đều không được phép trong tên class.

4. **Tên class không được chứa khoảng trắng**. Điều đó khiến mã không hợp lệ và gây lỗi biên dịch.

5. **Không được là từ dành riêng của Java**: Identifier không được dùng bất kỳ từ dành riêng nào của Java (như `int`, `if`, `for`, v.v.). Những từ này mang ý nghĩa cụ thể trong Java và không dùng được làm tên class, tên biến hay bất kỳ identifier nào khác.

6. **Phân biệt hoa thường**: Java phân biệt chữ hoa chữ thường, nghĩa là các identifier như `MyClass`, `myclass` và `MYCLASS` được coi là khác nhau.

7. **Độ dài**: Java không giới hạn độ dài tên class.

Những quy tắc này đảm bảo tên class đúng cú pháp và tránh xung đột với các tính năng có sẵn của Java. Ngoài các quy tắc trên, cũng nên tuân theo quy ước đặt tên của Java, như bắt đầu tên class bằng chữ in hoa và dùng camel case cho tên nhiều từ (dùng `MyClass` thay vì `myclass` hay `MY_CLASS`). Nhưng xin nhắc lại, đây chỉ là quy ước chứ không phải quy tắc bắt buộc.

Sau tên class, bạn có thể tuỳ chọn kế thừa một lớp cha bằng keyword `extends`, theo sau là tên lớp cha. Java hỗ trợ đơn kế thừa (single inheritance), nghĩa là một class chỉ có thể extends đúng một lớp cha.

Tuy nhiên, bạn có thể implement một hoặc nhiều interface bằng keyword `implements`, theo sau là danh sách tên interface phân tách bởi dấu phẩy:
```java
public class MyClass implements MyInterface1, MyInterface2, MyInterface3 {
    // ...
}
```

Cuối cùng, bạn định nghĩa thân class bên trong cặp ngoặc nhọn `{}`. Thân class chứa các thành phần của class, bao gồm field, method, constructor và nested class.

Như vậy, trong ví dụ tiếp theo:
```java
public class MyClass extends MySuperClass implements MyInterface {
    /* Class body begins */
    // Fields
    private int myField;

    // Constructor
    public MyClass() {
        // Constructor body
    }

    // Methods
    public void myMethod() {
        // Method body
    }
    /* Class body ends */
}
```

- `public` là access modifier, cho biết class truy cập được từ bất kỳ đâu.
- `class` là keyword dùng để khai báo class.
- `MyClass` là tên class.
- `extends MySuperClass` xác định rằng `MyClass` kế thừa từ lớp cha `MySuperClass`.
- `implements MyInterface` cho biết `MyClass` cài đặt interface `MyInterface`.
- Thân class chứa một field `private` là `myField`, một constructor `public` là `MyClass()`, và một method `public` là `myMethod()`.

Bây giờ, trước khi xem chi tiết cách khai báo field và method, hãy nói về static member và instance member.

## Static member và instance member

Class có thể có hai loại thành phần: static member và instance member. Hãy dùng phép so sánh với một mẫu TV để hiểu rõ hơn.

Hãy tưởng tượng nhiều chiếc TV cùng model đặt ở những gia đình khác nhau. Mỗi chiếc TV đại diện cho một instance (object) của class `Television`. Còn bản thân model TV đại diện cho class.

**Instance member** — như instance variable và instance method — thuộc về từng chiếc TV riêng lẻ (object):
- Mỗi chiếc TV có bộ instance variable riêng, ví dụ kênh đang xem, âm lượng, và trạng thái bật/tắt.
- Instance method, như `changeChannel()` hay `adjustVolume()`, là những hành động mà mỗi chiếc TV thực hiện độc lập.
- Instance member được truy cập thông qua instance (object) của class.

**Static member** — như static variable và static method — thuộc về chính model TV (class):
- Model TV có những static variable được chia sẻ giữa mọi chiếc TV, ví dụ logo nhà sản xuất hay số hiệu model.
- Static method, như `getManufacturerInfo()` hay `getModelNumber()`, là những hành động thuộc về model TV và truy cập được mà không cần tạo instance của class `Television`.
- Static member được truy cập bằng chính tên class, không cần tạo instance.

Đây là class `Television`:

```java
public class Television {
    // Instance fields
    private int currentChannel;
    private int volume;
    private boolean isOn;
    
    // Static field
    private static String manufacturerLogo = "MyBrand";
    
    // Instance method
    public void changeChannel(int channel) {
        this.currentChannel = channel;
        System.out.println("Channel changed to: " + channel);
    }
    
    // Static method
    public static void getManufacturerInfo() {
        System.out.println("All TVs by: " + manufacturerLogo);
    }
}
```

Trong ví dụ này:
- Các field `currentChannel`, `volume` và `isOn` là instance variable. Mỗi chiếc TV (object) có bộ biến riêng.
- Field `manufacturerLogo` là biến `static`. Nó thuộc về chính class và được chia sẻ giữa mọi chiếc TV.
- Method `changeChannel()` là instance method. Mỗi chiếc TV gọi method này một cách độc lập.
- Method `getManufacturerInfo()` là static method. Nó thuộc về class và có thể được gọi mà không cần tạo instance của `Television`.

Để truy cập instance member, bạn cần tạo một instance của class:
```java
Television tv1 = new Television();
tv1.changeChannel(5); // Changes channel of tv1
```

Nhưng để truy cập static member, bạn dùng trực tiếp tên class:
```java
Television.getManufacturerInfo();
```

Static member hữu ích để biểu diễn dữ liệu và hành vi ở mức class, được chia sẻ giữa mọi instance. Chúng truy cập được mà không cần tạo instance, nên tiết kiệm bộ nhớ. Tuy nhiên static member không thể truy cập trực tiếp instance member, vì chúng không gắn với instance cụ thể nào.

Cần lưu ý rằng Java cho phép truy cập static member (field và method) thông qua instance của class. Ví dụ, static method `getManufacturerInfo()` cũng có thể dùng như sau:
```java
tv1.getManufacturerInfo();
```

Tuy nhiên đây không phải cách làm được khuyến khích, vì nó không thể hiện rõ rằng thành phần đó là static và thuộc về class chứ không thuộc về instance.

Ngược lại, instance member gắn với từng instance riêng của class. Chúng giữ dữ liệu riêng của mỗi object và có thể truy cập cả static member lẫn instance member.

Đến đây bạn có thể thắc mắc: Tại sao static member lại truy cập được mà không cần tạo instance? Điều đó chẳng phải đi ngược lại tinh thần của lập trình hướng đối tượng sao?

Thực ra điều này không nhất thiết đi ngược các nguyên lý OOP, mà bổ sung cho chúng bằng cách cung cấp cơ chế định nghĩa hành vi và trạng thái ở mức class.

Static method có thể dùng để cài đặt các hàm tiện ích hay hàm hỗ trợ không phụ thuộc vào trạng thái của một object instance. Điều này phổ biến ở các utility class, chẳng hạn class `Math`, nơi mọi method đều là static vì chúng không cần truy cập dữ liệu ở mức instance.

Ngoài ra, static member cho phép truy cập toàn cục. Đúng là có tranh cãi quanh chuyện này do nguy cơ tăng độ phụ thuộc (coupling) và khiến mã khó kiểm thử hơn, tuy nhiên nó vẫn phù hợp cho những hằng số toàn cục cần truy cập từ nhiều nơi trong ứng dụng.

Sơ đồ dưới đây minh hoạ vài điểm mấu chốt về static member và instance member trong Java:
```
┌─────────────────────────────────────────────────────────────┐
│                         Class                               │
│  ┌─────────────────────────┐ ┌─────────────────────────┐    │
│  │    Static Members       │ │    Instance Members     │    │
│  │ ┌─────────────────────┐ │ │ ┌─────────────────────┐ │    │
│  │ │   Static Fields     │ │ │ │  Instance Fields    │ │    │
│  │ └─────────────────────┘ │ │ └─────────────────────┘ │    │
│  │ ┌─────────────────────┐ │ │ ┌─────────────────────┐ │    │
│  │ │   Static Methods    │ │ │ │  Instance Methods   │ │    │
│  │ └─────────────────────┘ │ │ └─────────────────────┘ │    │
│  └─────────────────────────┘ └─────────────────────────┘    │
│                                                             │
│  ┌─────────────────────────┐ ┌─────────────────────────┐    │
│  │      Object 1           │ │      Object 2           │    │
│  │ ┌─────────────────────┐ │ │ ┌─────────────────────┐ │    │
│  │ │  Instance Fields    │ │ │ │  Instance Fields    │ │    │
│  │ └─────────────────────┘ │ │ └─────────────────────┘ │    │
│  └─────────────────────────┘ └─────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘

- The class contains both static and instance members.
- Static members (fields and methods) are associated with the class itself.
- Instance members (fields and methods) are associated with objects of the class.
- Multiple objects of the class each have their own instance members.
- All objects share the same static members.
```

Bây giờ, hãy xem chi tiết hơn cách khai báo field.

## Khai báo field

**Field** là biến được khai báo ở mức class. Field — còn được gọi là attribute hay instance variable — dùng để lưu trạng thái của object.

Để khai báo field, dùng cú pháp sau:
```
[accessModifier] [specifiers] type fieldName [= initialValue];
```

Vài ví dụ:
```java
public class MyClass {
    public static final int MAX_VALUE = 100;
    private String name;
    protected double salary;
    boolean active = true;
    
    // ...
}
```

Access modifier là tuỳ chọn, có thể là `public`, `private`, `protected` hoặc default (package-private) nếu không chỉ định. Lưu ý rằng khác với class, field dùng được cả bốn loại access modifier. Tuỳ theo access modifier, field có thể được truy cập từ bên trong class, từ lớp con, từ các class cùng package hoặc từ bất kỳ class nào khác. Chi tiết sẽ nói sau.

Phần specifier cũng là tuỳ chọn, có thể gồm các keyword như `static`, `final`, `transient` và `volatile`. Bạn có thể dùng không hoặc nhiều specifier (như ở khai báo field đầu tiên), nhưng keyword `final` chỉ được áp dụng một lần:

- Field khai báo `static` thuộc về chính class chứ không thuộc một instance cụ thể. Chỉ có duy nhất một bản sao của field `static` được chia sẻ cho mọi instance của class. Một cách dùng phổ biến của field `static` là định nghĩa hằng số.
- Field khai báo `final` không thể gán lại để trỏ tới object hay giá trị khác. Nếu là kiểu nguyên thuỷ (primitive), giá trị không thể thay đổi. Nếu là kiểu tham chiếu, tham chiếu không thể đổi sang object khác, nhưng trạng thái bên trong của object vẫn có thể thay đổi nếu object đó là mutable. Field final dùng cho hằng số hoặc để biến field thành chỉ đọc sau khi khởi tạo. Tuy nhiên, dù bản thân field trở thành chỉ đọc, object mà field final trỏ tới vẫn có thể bị thay đổi trạng thái bên trong nếu nó là mutable.
- Keyword `transient` và `volatile` là nội dung nâng cao hơn, liên quan tới serialization và đa luồng. Chúng ta sẽ bàn ở các chương sau.

Kiểu của field đứng sau phần specifier. Nó có thể là kiểu nguyên thuỷ như `int`, `boolean`, v.v. hoặc kiểu tham chiếu như `String`, `LocalDate`, `ArrayList`, v.v.

Tên field tuân theo quy tắc đặt identifier chuẩn của Java. Đây là các quy tắc chính cần nhớ cho identifier của field:

1. **Ký tự Unicode**: Java cho phép dùng ký tự Unicode trong identifier, nghĩa là bạn có thể dùng ký tự từ bộ chữ ngoài Latin. Tuy nhiên điều này ít được dùng cho tên field vì khiến mã khó đọc và khó bảo trì hơn.

2. **Ký tự được phép**: Identifier của field chỉ được chứa ký tự chữ và số (`A-Z`, `a-z`, `0-9`), dấu gạch dưới (`_`) và ký hiệu đô-la (`$`). Identifier phải bắt đầu bằng chữ cái (`A-Z` hoặc `a-z`), dấu gạch dưới (`_`) hoặc ký hiệu đô-la (`$`). Nó không được bắt đầu bằng chữ số.

3. **Không dùng từ dành riêng**: Identifier không được là từ dành riêng của Java. Từ dành riêng bao gồm các keyword như `int`, `if`, `class`, v.v. Chúng là một phần cú pháp của ngôn ngữ Java và mang ý nghĩa cụ thể với trình biên dịch.

4. **Phân biệt hoa thường**: Java phân biệt chữ hoa chữ thường, nghĩa là các identifier như `myField`, `MyField` và `MYFIELD` được coi là khác nhau.

5. **Không giới hạn độ dài**: Về mặt kỹ thuật, độ dài identifier không bị giới hạn, nhưng nên giữ ở mức hợp lý để dễ đọc và dễ bảo trì.

Cần phân biệt rõ giữa quy tắc (rule) và quy ước (convention). Quy tắc bắt buộc phải tuân theo thì mã Java mới biên dịch được, còn quy ước — như bắt đầu tên field bằng chữ thường hoặc dùng `camelCase` cho tên nhiều từ — là những thực hành tốt giúp mã dễ đọc và dễ bảo trì hơn nhưng không bị trình biên dịch ép buộc.

Cuối cùng, việc cung cấp giá trị khởi tạo là tuỳ chọn. Nếu không cung cấp, field sẽ được khởi tạo với giá trị mặc định (`0`, `false` hoặc `null` tuỳ kiểu). Tuy nhiên, giá trị khởi tạo phải là hằng số tại thời điểm biên dịch (compile-time constant) đối với field static final.

Khi field đã được khai báo, bạn có thể truy cập để đọc giá trị hoặc sửa bằng cách gán giá trị mới. Cách truy cập field phụ thuộc vào việc đó là instance field hay static field, và access modifier nào đang được dùng.

### Truy cập và sửa đổi field

Để truy cập một instance field, trước hết bạn cần một instance của class. Sau đó bạn đọc giá trị field bằng toán tử chấm (`.`) như sau:
```java
instanceVariable.fieldName
```

Ví dụ:
```java
String name = person.firstName;
int age = employee.age;  
```

Để sửa một instance field, bạn dùng toán tử gán (`=`) như sau:
```java
person.firstName = "John";
employee.age = 45;
```

Truy cập field `static` thì hơi khác. Vì chúng thuộc về chính class nên bạn không cần instance. Bạn truy cập static field bằng tên class và toán tử chấm:

```java
ClassName.fieldName
```

Ví dụ:
```java
double pi = Math.PI;
int max = Integer.MAX_VALUE;
```

Bên trong chính class khai báo field, bạn có thể truy cập nó trực tiếp bằng tên, không cần tiền tố, bất kể access modifier là gì. Ngoại lệ duy nhất là khi truy cập static field: nên dùng tên class ngay cả trong cùng class để mã dễ đọc hơn.

Các access modifier `public`, `private`, `protected` và default (package) kiểm soát phạm vi nhìn thấy của field và quyết định nó có được truy cập trực tiếp từ bên ngoài class hay không.

Hãy xem vài ví dụ minh hoạ các mức truy cập khác nhau.

```java
public class Person {
    public String name;
    private int age;
    protected String email;
    double height;
}
```

Field `name` là `public` nên truy cập được từ bất kỳ class nào khác:
```java
Person p = new Person();
p.name = "Alice";
```

Field `age` là `private`. Nó chỉ truy cập được bên trong class `Person`. Cố gắng truy cập trực tiếp từ bên ngoài class sẽ gây lỗi biên dịch:
```java
// This will not compile
p.age = 30; 
```

Field `email` là `protected`. Nó truy cập được bên trong cùng class, trong bất kỳ lớp con nào, và trong các class khác cùng package:

```java
// This is okay
String email = p.email;

// This is also valid in a subclass, even in a different package
class Employee extends Person {
    public void setEmail(String e) {
         email = e;
    }
}
```

Field `height` có quyền truy cập default (package) vì không chỉ định modifier nào. Nó truy cập được bởi các class khác trong cùng package:
```java
// This is okay if Person and Student are in same package 
class Student {
    public void printHeight(Person p) {
        System.out.println(p.height);
    }
}
```

Thông lệ phổ biến là khai báo field là `private` rồi truy cập qua các method getter và setter. Field `public` và `protected` ít được dùng hơn. Quyền truy cập default (package-private) hữu ích cho những class liên quan nằm cùng package.

## Khai báo method

**Method** là một khối mã thực hiện một nhiệm vụ cụ thể và tuỳ chọn trả về giá trị. Method được dùng để định nghĩa hành vi của object. Chúng cung cấp cách đóng gói logic phức tạp, chia nhỏ chương trình thành những phần dễ quản lý, và cho phép tái sử dụng mã.

Để khai báo method, dùng cú pháp sau:
```java
[accessModifier] [specifiers] returnType methodName([parameters]) [throws ExceptionType1, ExceptionType2, ...] {
    // method body
}
```

Ví dụ:
```java
public static String addParenthesis(String s) {
    return "(" + s + ")";
}

private int sum(int a, int b) {
    return a + b;
}

protected void setName(String name) throws IllegalArgumentException {
    if (name == null || name.isEmpty()) {
        throw new IllegalArgumentException("Name cannot be null or empty");
    }
    this.name = name;
}
```

Access modifier là tuỳ chọn và kiểm soát phạm vi nhìn thấy của method. Nó có thể là `public`, `private`, `protected` hoặc default (package) nếu không chỉ định. Các quy tắc giống hệt như với field đã bàn ở trên.

Phần specifier cũng tuỳ chọn, có thể gồm các keyword như `static`, `final`, `abstract` và `synchronized`. Những keyword này thay đổi hành vi của method:

- Method `static` thuộc về chính class và có thể được gọi mà không cần instance của class.
- Method `final` không thể bị lớp con override.
- Method `abstract` không có phần cài đặt trong class hiện tại và bắt buộc phải được override bởi lớp con không trừu tượng.
- Method `synchronized` chỉ có thể được thực thi bởi một thread tại một thời điểm.

Kiểu trả về (return type) xác định loại giá trị mà method trả về. Nó có thể là kiểu nguyên thuỷ, kiểu tham chiếu, hoặc `void` nếu method không trả về gì. Mọi khai báo method đều phải có return type.

Tên method tuân theo cùng quy ước đặt tên như class và field, thường dùng `camelCase`. Hãy chọn tên có ý nghĩa, mô tả được mục đích của method.

Tham số (parameter) được đặt trong cặp ngoặc đơn sau tên method. Có thể có không hoặc nhiều tham số. Nhiều tham số phân tách nhau bởi dấu phẩy. Tham số là các biến nhận giá trị được truyền vào khi method được gọi. Mỗi tham số gồm hai — hoặc tuỳ chọn ba — phần:

```java
[parameterModifier] parameterType parameterName
```

Parameter modifier là tuỳ chọn và chỉ có thể là `final`. Nếu tham số được khai báo `final`, giá trị của nó không thể thay đổi bên trong thân method. Ví dụ:
```java
public void printMessage(final String message) {
    // message = "Hello"; // This would cause a compile error
    System.out.println(message);
}
```

Kiểu tham số là bắt buộc và xác định kiểu dữ liệu của tham số. Nó có thể là kiểu nguyên thuỷ (như `int`, `double`, `boolean`) hoặc kiểu tham chiếu (như `String`, `ArrayList`, hay class tự định nghĩa).

Tên tham số cũng bắt buộc và tuân theo cùng quy ước đặt tên như identifier của class, field và method, thường dùng `camelCase`. Tên tham số được dùng để tham chiếu tới giá trị truyền vào bên trong thân method.

Đây là vài ví dụ định nghĩa tham số:
```java
// A single parameter of type int
public void printNumber(int number) {
    System.out.println("The number is: " + number);
}

// Multiple parameters of different types
public void printPersonDetails(String name, int age, boolean isStudent) {
    System.out.println("Name: " + name);
    System.out.println("Age: " + age);
    System.out.println("Is a student? " + isStudent);
}

// A parameter with a modifier
public void calculateDiscount(final double price, double discountPercentage) {
    double discountAmount = price * (discountPercentage / 100);
    double finalPrice = price - discountAmount;
    System.out.println("Discounted price: " + finalPrice);
}
```

Quay lại các phần của một khai báo method: mệnh đề `throws` là tuỳ chọn, chỉ ra những checked exception mà method có thể ném ra. Nhiều exception phân tách nhau bởi dấu phẩy.

Thân method được bọc trong cặp ngoặc nhọn `{}` và chứa mã cài đặt chức năng của method. Nó có thể gồm khai báo biến, vòng lặp, câu lệnh điều kiện, lời gọi method và các câu lệnh khác.

Nếu method có return type khác `void`, nó bắt buộc phải có câu lệnh `return` chỉ rõ giá trị trả về. Giá trị trả về phải tương thích với return type đã khai báo:
```java
// A simple method that returns a string
public String getName() {
    return "Mark";
}
```

### Method signature

**Method signature** định danh duy nhất một method bên trong class. Nó gồm tên method và danh sách kiểu tham số theo thứ tự. Access modifier (như `public` hay `private`), return type (như `void` hay `int`) và tên tham số **không** thuộc method signature:
```java
methodName(parameterType1, parameterType2, ...)
```

Ví dụ, xét các khai báo method sau:
```java
public void printMessage(String message) {
    System.out.println(message);
}

public int calculateSum(int a, int b) {
    return a + b;
}

private void updateUser(String username, int age, boolean isActive) {
    // method body
}
```

Method signature của chúng lần lượt là:

- `printMessage(String)`
- `calculateSum(int, int)`
- `updateUser(String, int, boolean)`

### Gọi method

Khi gọi một method, bạn truyền vào các đối số (argument) khớp về kiểu và thứ tự với tham số đã khai báo trong method signature. Đối số là những giá trị thực tế được truyền vào method.

Như vậy, để gọi method bạn dùng tên method theo sau là cặp ngoặc đơn và cung cấp các đối số cần thiết. Cú pháp là:
```java
[ObjectReference.]methodName([arguments]);
```

Nếu method là instance method (không static), bạn cần có một object của class chứa method đó. Sau đó gọi method qua tham chiếu object, toán tử chấm và tên method.

Nếu method là `static`, bạn gọi trực tiếp qua tên class, toán tử chấm và tên method. Bạn không cần instance nào để gọi static method.

Vài ví dụ gọi method:
```java
// Calling an instance method
Person person = new Person();
person.setName("John");
String name = person.getName();

// Calling a static method
int max = Math.max(10, 20);
double random = Math.random();

// Calling a method with arguments
Calculator calculator = new Calculator();
int sum = calculator.add(5, 3);
double result = calculator.multiply(2.5, 4.0);
```

Hãy đảm bảo cung cấp đúng số lượng và đúng kiểu đối số như định nghĩa trong method signature. Nếu không khớp, trình biên dịch sẽ báo lỗi.

### Dùng access modifier với method

Cũng như với field, access modifier kiểm soát phạm vi nhìn thấy và khả năng truy cập của method. Vẫn dùng được bốn access modifier: `public`, `private`, `protected` và default (package-private).

Xét class sau:
```java
package com.my.package;

public class MathUtils {
    public static int add(int a, int b) {
        return a + b;
    }

    private static int subtract(int a, int b) {
        return a - b;
    }

    protected static int multiply(int a, int b) {
        return a * b;
    }

    static int divide(int a, int b) {
        return a / b;
    }
}
```

Method `add` khai báo `public` nên gọi được từ bất kỳ class nào khác:

```java
int sum = MathUtils.add(1, 2);
```

Method `subtract` khai báo `private`. Nó chỉ gọi được từ bên trong chính class `MathUtils`. Gọi từ class khác sẽ gây lỗi biên dịch:

```java
// This will not compile
int difference = MathUtils.subtract(10, 7);
```

Method `multiply` khai báo `protected`. Nó gọi được từ bên trong cùng class, từ bất kỳ lớp con nào (kể cả ở package khác), và từ các class khác cùng package:

```java
package com.my.other.package;

// Calling from a subclass in a different package
public class AdvancedMathUtils extends MathUtils {
    public static int square(int a) {
        return multiply(a, a);
    }
}
```

Method `divide` có quyền truy cập default (package-private) vì không chỉ định modifier tường minh. Nhớ rằng điều này nghĩa là method chỉ truy cập được bởi các class trong cùng package:

```java
package com.my.package;

// Calling from another class in the same package
public class ArithmeticOperations {
    public static int performDivision(int a, int b) {
        return MathUtils.divide(a, b);
    }
}
```

### Truyền đối số giữa các method

Trong Java, khi bạn truyền đối số vào method, chúng **luôn** được truyền theo giá trị (pass by value). Nghĩa là một bản sao của giá trị được truyền vào method, chứ không phải tham chiếu tới biến gốc. Tuy nhiên, hành vi của pass-by-value khác nhau tuỳ theo bạn truyền kiểu nguyên thuỷ (như `int`) hay kiểu tham chiếu (như object `String`).

Khi truyền kiểu nguyên thuỷ vào method, method nhận được một bản sao của giá trị. Mọi thay đổi lên tham số bên trong method đều không ảnh hưởng tới biến gốc bên ngoài.

Ví dụ:
```java
public void testPrimitive() {
    int num = 10;
    modifyPrimitive(num);
    System.out.println(num); // Output: 10
}

public void modifyPrimitive(int value) {
    value = 20;
}
```

Trong ví dụ này, method `modifyPrimitive` nhận một bản sao giá trị của `num`. Việc sửa tham số `value` bên trong method không làm thay đổi biến `num` gốc trong method `testPrimitive`.

Khi truyền kiểu tham chiếu vào method, method nhận được một bản sao của **tham chiếu** tới object. Dù bản thân tham chiếu được truyền theo giá trị, method vẫn có thể sửa trạng thái của object mà tham chiếu đó trỏ tới.

Ví dụ:
```java
public void test() {
    Person person = new Person("John", 25);
    modifyPerson(person);
    System.out.println(person.getName()); // Output: Alice
    System.out.println(person.getAge()); // Output: 25
}

public void modifyPerson(Person p) {
    p.setName("Alice"); // Sets a new name
    p = new Person("Bob", 30); // Reassigns p to a new person
}
```

Trong ví dụ này, method `modifyPerson` nhận một bản sao tham chiếu tới object `Person`. Bên trong method, method `setName()` được gọi trên object mà `p` trỏ tới, làm thay đổi tên của object gốc. Tuy nhiên khi `p` được gán lại sang một object `Person` mới, điều đó không ảnh hưởng tới tham chiếu person gốc bên ngoài.

Hãy xem thêm vài ví dụ nữa để làm rõ khác biệt giữa việc gán lại tham chiếu và việc sửa chính object.

Trước hết, xét ví dụ về gán lại tham chiếu:
```java
public void test() {
    StringBuilder sb = new StringBuilder("Hello");
    modifyStringBuilder(sb);
    System.out.println(sb.toString()); // Output: Hello
}

public void modifyStringBuilder(StringBuilder builder) {
    builder = new StringBuilder("World");
}
```

Trong ví dụ này, method `modifyStringBuilder` nhận một bản sao tham chiếu tới object `StringBuilder`. Bên trong method, tham chiếu `builder` được gán lại sang một object `StringBuilder` mới, nhưng điều đó không ảnh hưởng tới tham chiếu `sb` gốc.

Hãy đối chiếu ví dụ trên với ví dụ sau, minh hoạ việc sửa trạng thái của object khác với việc chỉ gán lại tham chiếu như thế nào:
```java
public void test() {
    StringBuilder sb = new StringBuilder("Hello");
    appendToStringBuilder(sb);
    System.out.println(sb.toString()); // Output: Hello, World!
}

public void appendToStringBuilder(StringBuilder builder) {
    builder.append(", World!");
}
```

Ở đây method `appendToStringBuilder` cũng nhận một bản sao tham chiếu tới object `StringBuilder`. Bên trong method, method `append()` được gọi trên object mà `builder` trỏ tới, làm thay đổi trạng thái của object gốc. Những thay đổi lên object này nhìn thấy được từ bên ngoài method.

Hiểu rõ hành vi pass-by-value cùng sự khác biệt giữa gán lại tham chiếu và sửa chính object là điều quan trọng để viết mã đúng đắn và dễ đoán. Luôn cân nhắc xem bạn định sửa object hay chỉ gán lại tham chiếu khi truyền kiểu tham chiếu vào method.

### Method overloading (nạp chồng method)

Trong Java, ta có thể định nghĩa hai hay nhiều method trong cùng một class dùng chung một tên, miễn là phần khai báo tham số của chúng khác nhau. Đó gọi là **method overloading**. Xét các method của class sau:
```java
public class Calculator {
    public int add(int a, int b) {
        return a + b;
    }

    public double add(double a, double b) {
        return a + b;
    }
}
```

Khi method `add` được gọi, trình biên dịch Java quyết định gọi phiên bản nào của method nạp chồng dựa trên kiểu của các đối số được truyền vào.

Điều này giống như gọi cà phê ở quán. Người pha chế có thể làm nhiều biến thể cà phê tuỳ theo yêu cầu của bạn: cà phê đen, cà phê sữa, hay cà phê sữa đường. Mỗi biến thể đều được gọi bằng cùng một từ (cà phê), nhưng những nguyên liệu bạn nêu ra sẽ quyết định chính xác loại cà phê bạn nhận được. Tương tự, khi bạn gọi một method nạp chồng trong Java, các đối số bạn truyền vào quyết định phiên bản nào sẽ được thực thi.

Ví dụ, nếu ta gọi method `add` với những đối số khác nhau:

```java
Calculator calc = new Calculator();

int result1 = calc.add(5, 10);
System.out.println(result1);  // Output: 15

double result2 = calc.add(5.5, 10.2);
System.out.println(result2);  // Output: 15.7

double result3 = calc.add(5, 10.2);
System.out.println(result3);  // Output: 15.2
```

Đây là điều xảy ra:

1. Khi gọi `calc.add(5, 10)`, cả hai đối số đều kiểu `int`. Trình biên dịch Java khớp lời gọi này với method `add` nhận hai tham số `int`, và kết quả là giá trị `int` bằng 15.

2. Khi gọi `calc.add(5.5, 10.2)`, cả hai đối số đều kiểu `double`. Trình biên dịch khớp lời gọi này với method `add` nhận hai tham số `double`, kết quả là giá trị `double` bằng 15.7.

3. Khi gọi `calc.add(5, 10.2)`, một đối số là `int` và một là `double`. Trong trường hợp này trình biên dịch thực hiện chuyển đổi đối số `int` sang `double` để khớp với method `add` nhận hai tham số `double`. Kết quả là giá trị `double` bằng 15.2.

Ví dụ này cho thấy trình biên dịch Java dùng kiểu của đối số để xác định method nạp chồng nào sẽ được gọi. Nó khớp các đối số với method signature cụ thể nhất hiện có.

Java chỉ chọn được method nạp chồng nếu tìm thấy khớp chính xác cho các đối số, hoặc tìm được phiên bản cụ thể hơn thông qua widening conversion.

**Widening conversion** là khi bạn đi từ kiểu dữ liệu nhỏ hơn sang kiểu lớn hơn, ví dụ từ `int` sang `long`, hoặc như ví dụ trên, từ `int` sang `double`.

Tuy nhiên Java không tự động áp dụng narrowing conversion (đi từ kiểu lớn hơn sang kiểu nhỏ hơn). Nếu không tìm được khớp chính xác hoặc khớp qua widening, trình biên dịch sẽ báo lỗi.

Cần lưu ý rằng method overloading không giống method overriding. Chúng ta sẽ bàn kỹ hơn về overriding ở chương sau, nhưng khi override, bạn cung cấp một cài đặt khác cho method được kế thừa. Method bị override phải có cùng tên, cùng return type và cùng tham số với method kế thừa. Ngược lại, method nạp chồng phải cùng tên nhưng khác tham số.

Vậy nên luôn nhớ: chỉ thay đổi return type là chưa đủ để nạp chồng method. Danh sách tham số bắt buộc phải khác.

Ngoài ra, một hiểu lầm phổ biến là Java luôn chọn method nạp chồng có nhiều tham số nhất. Không phải vậy. Java chọn method dựa trên khớp cụ thể nhất với kiểu đối số, không nhất thiết là method có nhiều tham số nhất.

Xét class có nhiều method nạp chồng tên `display`:

```java
public class DisplayOverload {
    
    // Method with a single String argument
    public void display(String str) {
        System.out.println("Displaying a String: " + str);
    }
    
    // Overloaded method with a single int argument
    public void display(int num) {
        System.out.println("Displaying an integer: " + num);
    }
    
    // Overloaded method with two int arguments
    public void display(int num1, int num2) {
        System.out.println("Displaying two integers: " + num1 + " and " + num2);
    }
}

// ...

DisplayOverload obj = new DisplayOverload();
        
obj.display("Hello, World!"); // Calls the method with a String argument
obj.display(5); // Calls the method with a single int argument
obj.display(10, 20); // Calls the method with two int arguments
```

Trong ví dụ này:
- Khi gọi `display("Hello, World!");`, Java chọn method `display(String str)` vì đối số là String, khớp với kiểu tham số của method này.
- Khi gọi `display(5);`, Java chọn method `display(int num)` vì đối số là số nguyên, khiến nó là khớp cụ thể nhất trong các method nạp chồng.
- Khi gọi `display(10, 20);`, dù có những method `display` khác về lý thuyết cũng nhận số nguyên, Java vẫn chọn `display(int num1, int num2)` vì nó khớp cụ thể nhất với hai đối số nguyên được truyền vào.

Điều cuối cần lưu ý là bạn không thể nạp chồng những method chỉ khác nhau ở tham số varargs. Ví dụ, đoạn sau sẽ không biên dịch được:
```java
public void sum(int[] numbers) { }
public void sum(int... numbers) { } // Compile-time error
```

Lý do là dưới góc nhìn của Java, `int[] numbers` và `int... numbers` về bản chất là như nhau, bởi `int...` chỉ là cú pháp đường (syntactic sugar) cho mảng số nguyên (`int[]`). Khi bạn cố nạp chồng method với hai kiểu tham số này, Java coi chúng là hai signature giống hệt nhau. Nhân tiện, hãy bàn kỹ hơn về varargs.

### Varargs

**Varargs** — viết tắt của variable-length arguments — là tính năng cho phép method nhận số lượng đối số tuỳ ý thuộc một kiểu cụ thể. Hãy hình dung varargs như một tiệc buffet ăn thoải mái. Ở buffet, bạn không bị giới hạn ở một số món cố định; bạn có thể chọn bao nhiêu món tuỳ thích, thậm chí quay lại lấy thêm. Tương tự, với varargs, một method có thể được gọi với số lượng đối số thay đổi; bạn không bị bó buộc vào một con số cụ thể. Điều này khiến method linh hoạt hơn và dễ dùng hơn khi số lượng đầu vào có thể khác nhau.

Để định nghĩa method có varargs, bạn dùng dấu ba chấm (`...`) sau kiểu dữ liệu của tham số cuối cùng. Cách hoạt động như sau:

```java
public void display(String... words) {
    for (String word : words) {
        System.out.println(word);
    }
}
```

Trong ví dụ này, `display` có thể được gọi với số lượng đối số `String` bất kỳ, kể cả không có đối số nào. Cứ như thể bạn nói với method: "Đây là những gì tôi có, cứ nhận hết đi." Sự linh hoạt này khiến varargs cực kỳ hữu ích khi tạo những method cần xử lý số lượng object chưa biết trước, như danh sách tên, số, hay thậm chí các object phức tạp.

Có những quy tắc cụ thể bạn phải tuân theo để dùng varargs đúng và hiệu quả.

**Thứ nhất**, tham số varargs phải là tham số **cuối cùng** trong danh sách tham số của method. Quy tắc này đảm bảo method nhận được số lượng đối số thay đổi mà không nhập nhằng về việc đối số nào thuộc về tham số varargs và đối số nào thì không. Ví dụ:

```java
void printStrings(String title, String... strings) {
    System.out.println(title + ":");
    for (String str : strings) {
        System.out.println(str);
    }
}
```

Trong ví dụ này, `String... strings` là tham số varargs có thể nhận số lượng đối số `String` bất kỳ. Việc nó đứng cuối cho phép bạn gọi `printStrings` với bao nhiêu chuỗi tuỳ ý, hoặc thậm chí không chuỗi nào.

**Thứ hai**, mỗi method chỉ được phép có **một** tham số varargs. Hạn chế này ngăn sự nhầm lẫn về việc đối số nào thuộc tham số varargs nào nếu cho phép nhiều hơn một. Ví dụ, nếu bạn muốn tạo method cộng các số, bạn có thể viết:

```java
double multiplyAndSum(double multiplier, int... numbers) {
    double sum = 0;
    for (int num : numbers) {
        sum += num;
    }
    return sum * multiplier;
}
```

Method này chỉ có đúng một tham số varargs (`int... numbers`), đảm bảo rõ ràng về cách gọi và cách nó xử lý các đối số được truyền vào.

**Thứ ba**, method có tham số varargs vẫn nạp chồng được, nhưng bạn phải đảm bảo tránh nhập nhằng. Điều này đòi hỏi mỗi method signature phải đủ khác biệt để tránh lỗi biên dịch. Ví dụ:

```java
void display(String s, int... numbers) {
    System.out.println(s);
    for (int num : numbers) {
        System.out.print(num + " ");
    }
    System.out.println();
}

void display(String first, String second) {
    System.out.println(first + ", " + second);
}
```

Ở đây `display` được nạp chồng với một phiên bản nhận một chuỗi và một tham số varargs số nguyên, và một phiên bản nhận hai chuỗi. Việc nạp chồng này hợp lệ vì các method signature khác biệt nhau, đảm bảo trình biên dịch xác định được method nào cần gọi dựa trên đối số truyền vào.

Bên trong method, việc truy cập các phần tử của tham số varargs có thể làm theo nhiều cách, mỗi cách phù hợp với tình huống khác nhau.

Cách đơn giản nhất để truy cập phần tử trong tham số varargs là coi nó như một mảng và truy cập phần tử trực tiếp bằng chỉ số. Cách này hữu ích khi bạn biết chính xác số lượng đối số hoặc cần truy cập những phần tử cụ thể. Ví dụ, method in ra phần tử thứ nhất, thứ hai và cuối cùng của tham số varargs:

```java
void printSelectedNumbers(int... numbers) {
    if (numbers.length >= 3) {
        System.out.println("First: " + numbers[0]);
        System.out.println("Second: " + numbers[1]);
        System.out.println("Last: " + numbers[numbers.length - 1]);
    } else {
        System.out.println("Insufficient arguments.");
    }
}
```

Method này truy cập trực tiếp các phần tử theo chỉ số, giống truy cập mảng, giúp việc lấy giá trị cụ thể trở nên đơn giản.

Để duyệt qua từng phần tử trong tham số varargs, vòng lặp for nâng cao (enhanced for) cung cấp cách xử lý gọn gàng và súc tích. Cách này có lợi nhất khi bạn cần thao tác trên mọi phần tử hoặc khi số lượng đối số thay đổi. Đây là ví dụ cộng tất cả các số được truyền vào:

```java
int sumAll(int... numbers) {
    int sum = 0;
    for (int num : numbers) {
        sum += num;
    }
    return sum;
}
```

Vòng lặp `for` nâng cao tự động duyệt qua từng phần tử trong `numbers`, giúp việc tổng hợp hay xử lý trở nên dễ dàng.

Dù tương tự việc dùng vòng `for` nâng cao, đôi khi bạn cần tự duyệt thủ công tham số varargs bằng thuộc tính `length` cho logic phức tạp hơn, chẳng hạn khi cần truy cập chỉ số hiện tại. Đây là cách in từng phần tử kèm chỉ số:

```java
void printWithIndices(String... strings) {
    for (int i = 0; i < strings.length; i++) {
        System.out.println("Element " + i + ": " + strings[i]);
    }
}
```

Method này tận dụng thuộc tính `length` của tham số varargs để tự kiểm soát vòng lặp, mang lại sự linh hoạt cho các thao tác dựa trên chỉ số.

Với những thao tác phức tạp hơn — lọc, ánh xạ hay tổng hợp phần tử — Stream API của Java làm việc trực tiếp được với varargs. Cách này đặc biệt mạnh khi xử lý phần tử theo phong cách lập trình hàm. Chúng ta sẽ bàn về stream ở chương sau, nhưng ví dụ, bạn có thể lọc và cộng chỉ những số chẵn như sau:

```java
int sumEvenNumbers(int... numbers) {
    return Arrays.stream(numbers) // Convert varargs to a stream
                 .filter(n -> n % 2 == 0) // Filter even numbers
                 .sum(); // Sum them
}
```

Khi đã định nghĩa method nhận tham số varargs, bạn có thể gọi nó bằng cách truyền từng đối số riêng lẻ, truyền một mảng, hoặc gọi mà không truyền đối số nào.

Cách gọi trực tiếp nhất là truyền từng đối số riêng lẻ. Cách này giống hệt việc gọi method có số tham số cố định, nhưng linh hoạt hơn ở chỗ bạn chỉ định được số lượng đối số tuỳ ý. Đây là ví dụ với method in ra từng đối số:

```java
void printArgs(String... args) {
    for (String arg : args) {
        System.out.println(arg);
    }
}

// Calling the method
printArgs("Hello", "World", "Varargs", "are", "flexible");
```

Trong ví dụ này, method `printArgs` được gọi với năm đối số chuỗi, cho thấy việc truyền số lượng đối số bất kỳ dễ dàng thế nào.

Ngoài ra, bạn có thể gọi method varargs bằng cách truyền vào một mảng thuộc kiểu đã chỉ định. Cách này hữu ích khi các đối số vốn đã nằm trong một mảng, hoặc khi bạn muốn dựng danh sách đối số một cách động. Xét method cộng số lượng số nguyên tuỳ ý:

```java
int sumNumbers(int... numbers) {
    return Arrays.stream(numbers).sum();
}

// Calling the method with an array
int[] numberArray = {1, 2, 3, 4, 5};
int sum = sumNumbers(numberArray);
System.out.println("Sum is: " + sum);
```

Ở đây `sumNumbers` được gọi với một mảng số nguyên, cho thấy mảng khớp với signature varargs như thế nào, tạo ra cách gọn gàng để truyền nhiều đối số.

Cuối cùng, method varargs cũng có thể được gọi mà không truyền đối số nào. Tính năng này đặc biệt hữu ích khi thao tác là tuỳ chọn hoặc khi có hành vi mặc định hợp lệ trong trường hợp không có đầu vào. Đây là method nối số lượng chuỗi tuỳ ý, kèm minh hoạ gọi mà không có đối số:

```java
String concatenateStrings(String... strings) {
    return Stream.of(strings).collect(Collectors.joining(", "));
}

// Calling the method without arguments
String result = concatenateStrings();
System.out.println("Result: " + result);
```

Ví dụ trên minh hoạ rằng gọi `concatenateStrings` mà không có đối số nào là hoàn toàn hợp lệ, và varargs tạo ra method signature linh hoạt, đáp ứng được nhiều tình huống sử dụng.

### Method `main`

Method `main` là một method đặc biệt trong Java, đóng vai trò điểm vào (entry point) của ứng dụng Java. Khi bạn chạy chương trình Java, JVM tìm method này và bắt đầu thực thi mã bên trong nó. Mọi ứng dụng Java đều phải có method `main` trong ít nhất một class.

Đây là cú pháp khai báo method `main`:
```java
public static void main(String[] args) {
    // ...
}
```

Hãy tách từng phần:

- `public`: Method `main` phải khai báo `public` để JVM gọi được nó từ bên ngoài class.
- `static`: Method `main` phải khai báo `static` để có thể gọi mà không cần tạo instance của class.
- `void`: Method `main` không trả về giá trị nào nên return type là `void`.
- `main`: Tên method phải là "main" (viết thường toàn bộ) để JVM nhận diện nó là điểm vào.
- `String[] args`: Method `main` nhận đúng một tham số kiểu mảng `String`, theo quy ước đặt tên là `args`. Tham số này cho phép bạn truyền đối số dòng lệnh vào chương trình.

Đây là ví dụ về một method `main` đơn giản:
```java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
```

Trong ví dụ này, method `main` đơn giản in `Hello, World!` ra console.

Các đối số của chương trình được truyền vào dưới dạng mảng `String`, mỗi phần tử là một đối số riêng:
```java
public class CommandLineArguments {
    public static void main(String[] args) {
        if (args.length > 0) {
            System.out.println("Arguments:");
            for (String arg : args) {
                System.out.println(arg);
            }
        } else {
            System.out.println("No arguments provided.");
        }
    }
}
```

Trong ví dụ này, method `main` kiểm tra xem có đối số nào được truyền vào không bằng `args.length`. Nếu có, nó duyệt mảng `args` và in từng đối số. Nếu không có đối số nào, nó in ra thông báo tương ứng.

Bạn có thể chạy chương trình này từ dòng lệnh và truyền đối số như sau:
```
java CommandLineArguments arg1 arg2 arg3
```

Kết quả sẽ là:
```
Arguments:
arg1
arg2
arg3
```

Nếu bạn chạy chương trình mà không có đối số nào:
```
java CommandLineArguments
```

Kết quả sẽ là:
```
No arguments provided.
```

Một class có thể có nhiều method tên `main`, miễn là chúng có danh sách tham số khác nhau. Tuy nhiên, chỉ method được định nghĩa là `public static void main(String[] args)` mới được coi là điểm vào của ứng dụng:
```java
public class MainOverloading {
    public static void main(String[] args) {
        System.out.println("Main method with String[] args");
        main(42);
    }

    public static void main(int num) {
        System.out.println("Main method with int parameter: " + num);
    }
}
```

Trong ví dụ này, class có hai method `main`: một với signature chuẩn và một với tham số int; tuy nhiên method `main(String[] args)` mới là điểm vào, và nó gọi method `main(int num)`.

Kết quả là:
```
Main method with String[] args
Main method with int parameter: 42
```

## Constructor và initializer

### Constructor

Trong Java, **constructor** là một method đặc biệt dùng để khởi tạo object. Nó được gọi khi một instance của class được tạo ra.

Hãy hình dung constructor như công thức làm một loại bánh cụ thể. Cũng như công thức chứa hướng dẫn và nguyên liệu để làm bánh, constructor chứa mã thiết lập trạng thái ban đầu của object.

Cú pháp định nghĩa constructor rất đơn giản. Nó có cùng tên với class và không có return type, kể cả `void`.

Ví dụ:
```java
class Cake {
    String flavor;
    double price;
    Cake() {
        flavor = "Vanilla";
        price = 9.99;
    }
}
```

Để tạo object, ta dùng keyword `new` theo sau là lời gọi constructor:
```java
Cake myCake = new Cake();
```

Dòng trên tạo một object `Cake` mới với hương vị mặc định `Vanilla` và giá `9.99`.

Nhưng nếu bạn muốn giữ hương vị mặc định nhưng đổi giá thì sao? Hay muốn tuỳ biến cả hai trong một số trường hợp?

Cũng như bạn có thể nướng nhiều loại bánh khác nhau bằng cách chỉnh công thức, bạn có thể tạo object với những trạng thái ban đầu khác nhau bằng cách cung cấp nhiều constructor.

Ví dụ, hãy thêm một constructor nữa vào class `Cake`:
```java
Cake(String flavor, double price) {
    this.flavor = flavor; 
    this.price = price;
}
```

Với constructor này, ta có thể tạo bánh với bất kỳ hương vị và giá nào mong muốn:
```java
Cake specialCake = new Cake("Chocolate", 12.99);
```

Có nhiều constructor mang lại sự linh hoạt khi tạo object. Ta cung cấp được nhiều cách khởi tạo object khác nhau dựa trên dữ liệu sẵn có tại thời điểm tạo.

Constructor không có tham số được gọi là **default constructor**. Nếu bạn không định nghĩa constructor nào trong class, trình biên dịch sẽ tự động cung cấp một default constructor với thân rỗng.

Tuy nhiên, nếu bạn định nghĩa bất kỳ constructor nào (như constructor có tham số ở trên), trình biên dịch sẽ **không** cung cấp default constructor nữa. Trong trường hợp này, nếu bạn vẫn muốn có tuỳ chọn tạo object mà không cần truyền tham số, bạn phải tự định nghĩa default constructor một cách tường minh.

Vậy nên trong class `Cake`, ta có thể có cả hai constructor:
```java
class Cake {
    String flavor;
    double price;

    Cake() {
        flavor = "Vanilla";
        price = 9.99;
    }

    Cake(String flavor, double price) {
        this.flavor = flavor;
        this.price = price;
    }
}
```

Giờ ta có thể tạo bánh vani mặc định bằng `new Cake()` hoặc bánh tuỳ biến bằng `new Cake("Chocolate", 10.99)`.

### Instance initializer

**Instance initializer** là những khối mã được thực thi khi một object được tạo, giống như constructor. Tuy nhiên, trong khi constructor là method có tên cụ thể và có thể có tham số, instance initializer chỉ đơn thuần là khối mã bên trong class.

Hãy dùng một phép so sánh để hiểu instance initializer.

Hãy tưởng tượng bạn chuyển vào một ngôi nhà mới. Ai cũng có những nghi thức riêng để biến ngôi nhà thành tổ ấm. Có người treo ảnh gia đình, người khác sơn tường theo màu ưa thích. Những nghi thức này riêng của từng người, cũng như instance initializer riêng cho từng object.

Đây là cú pháp của instance initializer:
```java
class House {
    String color;
    // instance initializer
    {
        color = "White";
        System.out.println("Performing move-in ritual");
    }
}
```

Mỗi khi một object `House` mới được tạo, mã bên trong khối instance initializer sẽ chạy. Nó đặt màu thành `White` và in ra `"Performing move-in ritual"`.

Vậy instance initializer khác constructor thế nào, và khi nào nên dùng?

Hãy tưởng tượng bạn có một class với nhiều constructor. Mỗi constructor đều cần thực hiện một số tác vụ khởi tạo chung. Thay vì lặp lại mã trong từng constructor, bạn đặt nó vào instance initializer. Mã khởi tạo đó sẽ chạy bất kể constructor nào được dùng.

```java
class House {
    String color;
    int numberOfRooms;

    // instance initializer    
    {
        color = "White";
        System.out.println("Performing move-in ritual");
    }

    House(int numberOfRooms) {
        this.numberOfRooms = numberOfRooms;
    }

    House(String color, int numberOfRooms) {
        this.color = color;
        this.numberOfRooms = numberOfRooms;
    }
}
```

Trong trường hợp này, bất kể constructor nào được dùng để tạo object `House`, instance initializer vẫn chạy, đặt màu mặc định là `White` và in thông điệp chuyển nhà.

Tuy nhiên cần lưu ý rằng trong hầu hết trường hợp, bạn đạt được kết quả tương tự bằng cách chuyển mã khởi tạo chung vào một method riêng rồi gọi method đó từ từng constructor.

Thực tế, có ý kiến cho rằng instance initializer là dư thừa, vì mọi thứ bạn làm được với instance initializer thì cũng làm được với constructor. Khác biệt chính là constructor nhận được tham số, còn instance initializer thì không.

Dẫu vậy, vẫn có những tình huống instance initializer tỏ ra hữu ích. Ví dụ, nếu bạn dùng anonymous class (sẽ bàn ở phần sau), bạn không định nghĩa được constructor, nên instance initializer là lựa chọn duy nhất cho mã khởi tạo.

### Static initializer

**Static initializer** là những khối mã được thực thi khi class được nạp vào bộ nhớ, trước khi bất kỳ instance nào của class được tạo. Chúng dùng để khởi tạo biến static hoặc thực hiện những hành động chung cho mọi instance của class.

Hãy tưởng tượng một cuộc họp hội đồng thị trấn diễn ra đúng một lần khi thị trấn được thành lập. Trong cuộc họp này, lãnh đạo thị trấn lập ra những quy tắc và hướng dẫn áp dụng cho tất cả mọi người. Việc thiết lập một lần này tương tự những gì `static` initializer làm cho một class.

Đây là cú pháp của `static` initializer:
```java
class TownHall {
    static String townName;
    static int population;

    // static initializer
    static {
        townName = "JavaVille";
        population = 1000;
        System.out.println("Town established: " + townName);
    }
}
```

Keyword `static` trước dấu ngoặc nhọn mở cho biết đây là khối static initializer. Nó chạy đúng một lần khi class `TownHall` được nạp, đặt `townName` thành `JavaVille`, `population` ban đầu là `1000`, và in ra `Town established: JavaVille`.

Bạn có thể nghĩ rằng static initializer chỉ là một cách khác để khởi tạo biến static, và bạn đạt được kết quả tương tự bằng cách gán trực tiếp tại chỗ khai báo, kiểu như:
```java
static String townName = "JavaVille";
static int population = 1000;
```

Bạn đúng một phần. Với những khởi tạo đơn giản, gán trực tiếp thường rõ ràng và súc tích hơn.

Tuy nhiên static initializer mang lại nhiều linh hoạt hơn. Chúng cho phép bạn viết logic khởi tạo phức tạp hơn, chẳng hạn:
- Gọi method
- Dùng cấu trúc điều khiển như vòng lặp và câu điều kiện
- Xử lý ngoại lệ

Đây là ví dụ minh hoạ:
```java
static List<String> residents = new ArrayList<>();

static {
    Path path = Paths.get("residents.txt");
    try (Stream<String> lines = Files.lines(path)) {
        lines.forEach(residents::add);
    } catch (IOException e) {
        System.out.println("Residents file not found.");
    }
}
```

Ở đây ta dùng static initializer để đọc danh sách cư dân từ file và nạp vào list `residents`. Kiểu khởi tạo phức tạp thế này không thể làm được bằng phép gán trực tiếp đơn giản.

Một khác biệt quan trọng khác là một class có thể có **nhiều** static initializer, và chúng được thực thi theo thứ tự xuất hiện trong class. Điều này hữu ích để tổ chức logic khởi tạo phức tạp thành những mảnh dễ đọc.

Cần lưu ý rằng static initializer được thực thi trước khi bất kỳ instance nào của class được tạo, và thậm chí trước cả khi method `main` được gọi. Chúng là một phần của quá trình nạp class.

Ngược lại, instance initializer và constructor chạy mỗi lần một instance mới của class được tạo. Chúng là một phần của quá trình tạo object.

### Thứ tự khởi tạo

Chúng ta đã xem qua constructor, instance initializer và static initializer. Nhưng nếu một class có đủ cả ba, cái nào chạy trước? Thứ tự khởi tạo là gì?

Khi class được nạp, những thứ đầu tiên được khởi tạo là biến static và static initializer, theo thứ tự chúng xuất hiện trong class. Việc này xảy ra một lần cho mỗi lần nạp class, trước khi bất kỳ instance nào được tạo.

Sau đó, mỗi khi một instance mới của class được tạo, các biến instance được khởi tạo, rồi instance initializer và constructor chạy.

Thứ tự như sau:

1. Biến instance được khởi tạo về giá trị mặc định (`0`, `false` hoặc `null`). Bước này đảm bảo mọi biến instance có trạng thái khởi đầu dự đoán được trước khi bất kỳ mã khởi tạo nào khác chạy.
2. Instance initializer chạy theo thứ tự xuất hiện trong class.
3. Constructor được thực thi.

Đây là ví dụ minh hoạ thứ tự đó:
```java
class InitializationOrder {
    static int staticVar = 1;
    int instanceVar = 1;

    static {
        System.out.println("Static Initializer: staticVar = " + staticVar);
        staticVar = 2;
    }

    {
        System.out.println("Instance Initializer: instanceVar = " + instanceVar);
        instanceVar = 2;
    }

    InitializationOrder() {
        System.out.println("Constructor: instanceVar = " + instanceVar);
        instanceVar = 3;
    }

    public static void main(String[] args) {
        System.out.println("Creating new instance");
        InitializationOrder obj = new InitializationOrder();
        System.out.println("Created instance: instanceVar = " + obj.instanceVar);
    }
}
```

Nếu bạn chạy đoạn mã này, kết quả sẽ là:
```
Static Initializer: staticVar = 1
Creating new instance
Instance Initializer: instanceVar = 1
Constructor: instanceVar = 2
Created instance: instanceVar = 3
```

Phân tích từng bước:
1. Khi class `InitializationOrder` được nạp, biến static `staticVar` được khởi tạo bằng `1`, rồi static initializer chạy, in giá trị hiện tại của `staticVar` (`1`) và đặt nó thành `2`.
2. Trong method `main`, ta in `Creating new instance` để đánh dấu bắt đầu quá trình tạo instance.
3. Một object `InitializationOrder` mới được tạo. Trước hết, biến instance `instanceVar` được khởi tạo với giá trị `1`.
4. Instance initializer chạy, in giá trị hiện tại của `instanceVar` (`1`) rồi đặt nó thành `2`.
5. Constructor được thực thi, in giá trị hiện tại của `instanceVar` (`2`) rồi đặt nó thành `3`.
6. Cuối cùng, quay lại method `main`, ta in giá trị cuối của `instanceVar` (`3`).

Nhớ kỹ thứ tự này, đặc biệt nếu các initializer và constructor của bạn phụ thuộc lẫn nhau. Giả định sai về thứ tự khởi tạo có thể dẫn tới những lỗi tinh vi.

Cũng lưu ý rằng nếu class có nhiều static initializer, chúng chạy theo thứ tự xuất hiện trong class. Điều tương tự đúng với instance initializer.

Hãy mở rộng ví dụ trước để minh hoạ:

```java
class MultipleInitializers {
    static int staticVar1;
    static int staticVar2;
    int instanceVar1;
    int instanceVar2;

    static {
        System.out.println(
          "Static Initializer 1: staticVar1 = " + staticVar1
        );
        staticVar1 = 1;
    }

    static {
        System.out.println(
          "Static Initializer 2: staticVar2 = " + staticVar2
        );
        staticVar2 = 2;
    }

    {
        System.out.println(
          "Instance Initializer 1: instanceVar1 = " + instanceVar1
        );
        instanceVar1 = 1;
    }

    {
        System.out.println(
          "Instance Initializer 2: instanceVar2 = " + instanceVar2
        );
        instanceVar2 = 2;
    }

    MultipleInitializers() {
        System.out.println("Constructor");
    }

    public static void main(String[] args) {
        System.out.println("Creating new instance");
        MultipleInitializers obj = new MultipleInitializers();
        System.out.println(
          "Created instance: instanceVar1 = " 
              + obj.instanceVar1 
              + ", instanceVar2 = " 
              + obj.instanceVar2
        );
    }
}
```

Khi chạy đoạn mã này, kết quả sẽ là:
```
Static Initializer 1: staticVar1 = 0
Static Initializer 2: staticVar2 = 0
Creating new instance
Instance Initializer 1: instanceVar1 = 0
Instance Initializer 2: instanceVar2 = 0
Constructor
Created instance: instanceVar1 = 1, instanceVar2 = 2
```

Đây là điều đang diễn ra:
1. Khi class `MultipleInitializers` được nạp, các biến static `staticVar1` và `staticVar2` được khởi tạo về giá trị mặc định `0`.

2. Static initializer thứ nhất chạy, in giá trị hiện tại của `staticVar1` (`0`) rồi đặt nó thành `1`.

3. Static initializer thứ hai chạy, in giá trị hiện tại của `staticVar2` (`0`) rồi đặt nó thành `2`.

4. Trong method `main`, ta in `Creating new instance` để đánh dấu bắt đầu tạo instance.

5. Một object `MultipleInitializers` mới được tạo. Trước hết, các biến instance `instanceVar1` và `instanceVar2` được khởi tạo về giá trị mặc định `0`.

6. Instance initializer thứ nhất chạy, in giá trị hiện tại của `instanceVar1` (`0`) rồi đặt nó thành `1`.

7. Instance initializer thứ hai chạy, in giá trị hiện tại của `instanceVar2` (`0`) rồi đặt nó thành `2`.

8. Constructor được thực thi, chỉ đơn giản in `Constructor`.

9. Cuối cùng, quay lại method `main`, ta in giá trị cuối của `instanceVar1` (`1`) và `instanceVar2` (`2`).

Hãy nhớ: mọi static initializer chạy trước mọi instance initializer, và mọi initializer chạy trước constructor. Nhưng trong từng nhóm (static hoặc instance), các initializer chạy theo thứ tự chúng được định nghĩa trong class.

## Kế thừa từ `java.lang.Object`

Trong Java, mọi class đều ngầm định là lớp con của class `java.lang.Object` — gốc của cây phân cấp class. Kể cả khi bạn không extends class nào một cách tường minh, class của bạn vẫn tự động kế thừa từ `Object`.

Class `Object` cung cấp một tập method nền tảng chung cho mọi object. Khi bạn tạo class mới, bạn tự động kế thừa những method này. Một số method thường dùng kế thừa từ `Object` gồm:

1. `toString()`: Trả về biểu diễn chuỗi của object. Mặc định, nó trả về chuỗi gồm tên class của object, ký tự `@`, và mã băm của object dưới dạng thập lục phân. Bạn có thể override method này để cung cấp biểu diễn chuỗi tuỳ biến.

2. `equals(Object obj)`: So sánh object với một object khác để kiểm tra bằng nhau. Mặc định, nó so sánh tham chiếu object bằng toán tử `==`. Bạn có thể override method này để định nghĩa logic so sánh tuỳ biến dựa trên trạng thái của object.

3. `hashCode()`: Trả về giá trị mã băm của object. Mã băm được dùng trong các cấu trúc dữ liệu dựa trên băm như `HashSet` và `HashMap`. Mặc định, nó trả về một số nguyên duy nhất cho mỗi object. Nếu bạn override method `equals()`, bạn cũng nên override `hashCode()` để đảm bảo những object bằng nhau có cùng mã băm.

4. `getClass()`: Trả về class thực tại thời điểm chạy của object. Đây là method `final`, nghĩa là không thể override.

5. `clone()`: Tạo và trả về một bản sao của object. Mặc định, nó thực hiện sao chép nông (shallow copy). Để dùng method này, class của bạn phải implement interface `Cloneable`.

Đây là ví dụ minh hoạ một số method kế thừa từ `Object`:

```java
class MyClass {
    private int value;
    
    public MyClass(int value) {
        this.value = value;
    }
    
    @Override
    public String toString() {
        return "MyClass[value=" + value + "]";
    }
    
    @Override
    public boolean equals(Object obj) {
        if (this == obj)
            return true;
        if (obj == null || getClass() != obj.getClass())
            return false;
        MyClass other = (MyClass) obj;
        return value == other.value;
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(value);
    }
}
```

Trong ví dụ này, `MyClass` override các method `toString()`, `equals()` và `hashCode()` kế thừa từ `Object`. Method `toString()` cung cấp biểu diễn chuỗi tuỳ biến của object, method `equals()` định nghĩa sự bằng nhau dựa trên field value, và method `hashCode()` sinh mã băm dựa trên field value.

Bằng cách tận dụng những method này, bạn cung cấp được biểu diễn chuỗi có ý nghĩa, định nghĩa được phép so sánh bằng nhau, và đảm bảo hành vi đúng đắn trong các cấu trúc dữ liệu dựa trên băm.

## Nested class (Lớp lồng nhau)

Trong Java, ta có thể định nghĩa một class bên trong một class khác. Những class như vậy gọi là **nested class**. Giống như một chiếc hộp có thể chứa nhiều hộp nhỏ hơn bên trong, một class (outer class hay enclosing class — lớp bao ngoài) có thể có các class khác (nested class) được định nghĩa bên trong nó.

Java có bốn loại nested class:

1. Static nested class

2. Inner class (còn gọi là non-static nested class)

3. Local class

4. Anonymous class

Mỗi loại có đặc điểm và tình huống sử dụng riêng:

- **Static nested class** giống chiếc hộp nhỏ không phụ thuộc vào hộp lớn để tồn tại. Nó truy cập trực tiếp được các static member của lớp bao ngoài. Tuy nhiên, để truy cập non-static member, nó cần một instance của lớp bao ngoài, hệt như bất kỳ class bên ngoài nào khác.

- **Inner class**, ngược lại, giống chiếc hộp nhỏ gắn chặt với hộp lớn. Nó truy cập trực tiếp được cả static lẫn non-static member của lớp bao ngoài. Tuy nhiên, một instance của inner class không thể tồn tại nếu không có instance của lớp bao ngoài.

- **Local class** giống chiếc hộp tạm thời được tạo bên trong một method hay một khối của lớp bao ngoài. Phạm vi của local class giới hạn trong khối nơi nó được định nghĩa. Local class không dùng access modifier truyền thống như `public` hay `private`, khả năng truy cập của nó vốn dĩ đã bị giới hạn trong khối bao quanh.

- **Anonymous class** giống chiếc hộp dùng một lần, không tên, được tạo cho mục đích cụ thể. Nó được định nghĩa và khởi tạo trong cùng một câu lệnh, thường là đối số cho một lời gọi method hoặc làm initializer. Khả năng truy cập của anonymous class do ngữ cảnh sử dụng quyết định — chẳng hạn bên trong một method hay làm initializer cho field — và không dùng access modifier truyền thống.

Khi phải chọn giữa static nested class và inner class, hãy cân nhắc mối quan hệ giữa nested class và lớp bao ngoài. Nếu nested class không cần truy cập non-static member của lớp bao ngoài, hãy dùng static nested class. Điều đó khiến class độc lập hơn và tái sử dụng tốt hơn. Nếu nested class cần truy cập non-static member của lớp bao ngoài hoặc cần gắn với một instance của lớp bao ngoài, hãy dùng inner class.

Cần lưu ý rằng dù nested class giúp tổ chức mã tốt hơn, chúng vẫn ảnh hưởng tới cách mã hoạt động. Mỗi loại nested class có hành vi và tình huống dùng riêng. Ví dụ, inner class giữ một tham chiếu ngầm tới instance của lớp bao ngoài, điều này có hệ quả về sử dụng bộ nhớ và serialization.

Một hiểu lầm phổ biến là static nested class và inner class về cơ bản giống nhau vì cả hai đều được định nghĩa bên trong một class khác. Nhưng điều đó không đúng. Static nested class về mặt ngữ nghĩa tương tự bất kỳ class cấp cao nào khác và không có tham chiếu ngầm tới instance của lớp bao ngoài. Inner class thì ngược lại, gắn bó mật thiết với một instance của lớp bao ngoài và không thể tồn tại độc lập.

Về access modifier, nested class có thể khai báo là `public`, package-private (mặc định), `protected` hoặc `private` — khác với class cấp cao vốn không thể khai báo `protected` hay `private`.

Khả năng truy cập của static và non-static nested class phụ thuộc vào access modifier của nó và khả năng truy cập của lớp bao ngoài. Ví dụ, nếu lớp bao ngoài là `public` và nested class là `private`, nested class chỉ truy cập được bên trong lớp bao ngoài. Nếu nested class là public, nó truy cập được từ bất kỳ đâu, miễn là lớp bao ngoài cũng truy cập được.

Chi tiết hơn cho từng loại:

- **Public nested class:** Nested class `public` truy cập được từ bất kỳ class nào khác, nhưng khả năng truy cập vẫn phụ thuộc vào khả năng truy cập của lớp ngoài. Nếu lớp ngoài không truy cập được trong một ngữ cảnh nào đó thì nested class public bên trong nó cũng không truy cập được ở đó.

- **Protected nested class:** Nested class `protected` truy cập được trong package của chính nó và bởi các lớp con của lớp ngoài, bất kể lớp con nằm ở package nào. Điều này cho phép kiểm soát phạm vi nhìn thấy chặt hơn so với nested class public, đặc biệt hữu ích khi bạn chỉ muốn phơi bày một số chức năng cho một số lớp con nhất định.

- **Private nested class:** Nested class `private` chỉ truy cập được bên trong lớp ngoài của nó. Điều này hữu ích để giấu hoàn toàn class khỏi thế giới bên ngoài, chỉ cho lớp ngoài dùng. Cách này thường dùng cho các helper class không có ý nghĩa gì bên ngoài lớp ngoài.

- **Package-private (default) nested class:** Nested class không có access modifier là package-private, nghĩa là chỉ truy cập được trong package của chính nó. Đây là mức truy cập mặc định khi không chỉ định access modifier. Nó nằm ở giữa về mức độ truy cập — chặt hơn `public` nhưng rộng hơn `private`.

Local class được định nghĩa trong một khối, thường là thân method. Phạm vi nhìn thấy của local class giới hạn trong khối nơi nó được định nghĩa. Vì vậy, dù bạn không thể áp dụng access modifier truyền thống (`public`, `protected`, `private`) cho chính class đó — bởi nó không nhìn thấy được bên ngoài khối — bạn vẫn kiểm soát được việc truy cập các instance của class này từ bên trong khối.

Còn anonymous class, do được dùng bên trong một biểu thức, không cho phép access modifier cho chính class. Ngữ cảnh nơi chúng được khai báo quyết định khả năng truy cập. Tuy nhiên, các method và field bên trong anonymous class vẫn có thể có access modifier, tuân theo quy tắc phạm vi thông thường.

Đây là bảng tóm tắt các access modifier được phép cho từng loại nested class:

| Loại nested class | `public` | `protected` | `default` | `private` |
|-------------------|----------|-------------|-----------|-----------|
| Static nested class | Có | Có | Có | Có |
| Inner class       | Có | Có | Có | Có |
| Local class       | Không | Không | Có* | Không |
| Anonymous class   | Không | Không | Có* | Không |

- `Có` nghĩa là access modifier đó được phép.
- `Không` nghĩa là access modifier đó không áp dụng được.
- `Có*` nghĩa là với local class và anonymous class, khái niệm access modifier truyền thống không áp dụng, bởi phạm vi nhìn thấy của chúng vốn dĩ giới hạn trong khối nơi chúng được khai báo. Do đó chúng không có access modifier theo nghĩa truyền thống.

Giờ hãy đi sâu vào từng loại.

### Static nested class

Static nested class là class được định nghĩa bên trong một class khác và được đánh dấu bằng keyword `static`:

```java
class OuterClass {
    static class StaticNestedClass {
        // members of the static nested class
    }
}
```

Static nested class có thể khai báo với bất kỳ access modifier nào trong bốn loại: `public`, `protected`, package-private (mặc định) hoặc `private`. Khả năng truy cập của static nested class phụ thuộc vào access modifier được dùng và khả năng truy cập của lớp bao ngoài. Ví dụ:

```java
public class OuterClass {
    private static class PrivateNestedClass {
        // ...
    }

    protected static class ProtectedNestedClass {
        // ...
    }

    static class PackagePrivateNestedClass {
        // ...
    }

    public static class PublicNestedClass {
        // ...
    }
}
```

Trong ví dụ này, `PrivateNestedClass` chỉ truy cập được bên trong `OuterClass`, `ProtectedNestedClass` truy cập được trong `OuterClass` và các lớp con của nó, `PackagePrivateNestedClass` truy cập được trong cùng package với `OuterClass`, còn `PublicNestedClass` truy cập được từ bất kỳ đâu.

Static nested class có thể extends class khác và implement interface, hệt như bất kỳ class cấp cao nào:
```java
class BaseClass {
    // ...
}

interface MyInterface {
    // ...
}

class OuterClass {
    static class NestedClass extends BaseClass implements MyInterface {
        // ...
    }
}
```

Ở đây `NestedClass` extends `BaseClass` và implement `MyInterface`, cho thấy static nested class có thể kế thừa class khác và cài đặt interface.

Chúng truy cập trực tiếp được các static member của lớp bao ngoài, dùng tên lớp bao ngoài kèm ký pháp chấm. Tuy nhiên, để truy cập non-static member của lớp bao ngoài, static nested class cần một instance của lớp bao ngoài. Lý do là static nested class vốn dĩ không có quyền truy cập vào biến instance của lớp bao ngoài.

Đây là ví dụ về static nested class:
```java
class OuterClass {
    private static int staticField = 10;
    private int instanceField = 20;

    static class NestedClass {
        void accessOuterMembers() {
            System.out.println(staticField); // Accessible directly
            System.out.println(instanceField); // Compilation error: cannot access non-static field
            System.out.println(new OuterClass().instanceField); // Accessible via an instance of OuterClass
        }
    }
}
```

Trong ví dụ này, `NestedClass` truy cập trực tiếp được `staticField` của `OuterClass`, nhưng không truy cập trực tiếp được `instanceField`. Để truy cập `instanceField`, nó cần một instance của `OuterClass`.

Để tạo instance của static nested class, bạn không cần instance của lớp bao ngoài. Bạn khởi tạo nó bằng tên lớp bao ngoài, ký pháp chấm và tên static nested class:

```java
OuterClass.StaticNestedClass nestedObject = new OuterClass.StaticNestedClass();
```

Khi tham chiếu tới static member của static nested class từ bên ngoài lớp bao ngoài, hãy dùng tên lớp bao ngoài, dấu chấm, tên static nested class, dấu chấm nữa, rồi tên thành phần. Cú pháp này làm nổi bật cấu trúc lồng nhau đồng thời cung cấp đường dẫn rõ ràng để truy cập static member:

```java
OuterClass.StaticNestedClass.staticField;
OuterClass.StaticNestedClass.staticMethod();
OuterClass.StaticNestedClass.StaticNestedNestedClass nestedNestedObject 
                  = new OuterClass.StaticNestedClass.StaticNestedNestedClass();
```

Từ bên trong lớp bao ngoài, bạn truy cập trực tiếp được các thành phần của static nested class mà không cần tên lớp bao ngoài:

```java
class OuterClass {
    static class StaticNestedClass {
        static void staticMethod() {
            // ...
        }
    }

    void outerMethod() {
        StaticNestedClass.staticMethod();
    }
}
```

Như bạn thấy, static nested class tương tự class cấp cao thông thường ở nhiều điểm:

1. Chúng dùng được mọi loại access modifier (`public`, `private`, `protected` và package).

2. Chúng extends được class khác và implement được interface.

3. Chúng có được cả static member lẫn non-static member.

4. Chúng khởi tạo được độc lập (không cần instance của lớp bao ngoài).

Tuy nhiên có vài khác biệt then chốt:

1. Static nested class được định nghĩa bên trong một class khác, còn class cấp cao được định nghĩa độc lập.

2. Static nested class truy cập trực tiếp được static member của lớp bao ngoài, còn class cấp cao phải dùng tên lớp bao ngoài để truy cập static member của nó.

3. Static nested class có thể là `private`, cho phép đóng gói tốt hơn, trong khi class cấp cao chỉ có thể là `public` hoặc package-private.

Tóm lại, static nested class về bản chất giống class cấp cao thông thường nhưng được lồng vào một class khác vì mục đích tổ chức. Chúng không có tham chiếu ngầm tới instance của lớp bao ngoài và khởi tạo được độc lập. Điều này khiến chúng hữu ích để gom nhóm các class liên quan và cung cấp một mức đóng gói.

### Non-static nested class (Inner class)

Non-static nested class, còn gọi là **inner class**, là class được định nghĩa bên trong một class khác mà không có keyword `static`:

```java
class OuterClass {
    class InnerClass {
        // members of the inner class
    }
}
```

Inner class có thể khai báo với bất kỳ access modifier nào trong bốn loại: `public`, `protected`, `private` hoặc mức mặc định. Khả năng truy cập của inner class phụ thuộc vào access modifier được dùng và khả năng truy cập của lớp bao ngoài. Nếu lớp ngoài là `public` và inner class là `private`, inner class chỉ truy cập được bên trong lớp ngoài. Ví dụ:

```java
public class OuterClass {
    private class PrivateInnerClass {
        // ...
    }

    protected class ProtectedInnerClass {
        // ...
    }

    class PackagePrivateInnerClass {
        // ...
    }

    public class PublicInnerClass {
        // ...
    }
}
```

Trong ví dụ này, `PrivateInnerClass` chỉ truy cập được bên trong `OuterClass`, `ProtectedInnerClass` truy cập được trong `OuterClass` và các lớp con, `PackagePrivateInnerClass` truy cập được trong cùng package với `OuterClass`, còn `PublicInnerClass` truy cập được từ bất kỳ đâu, miễn là `OuterClass` cũng truy cập được.

Inner class có thể extends class khác và implement interface, hệt như bất kỳ class nào. Điều này cho phép inner class kế thừa hành vi và tuân theo hợp đồng do class và interface khác định nghĩa:
```java
class BaseClass {
    // ...
}

interface MyInterface {
    // ...
}

class OuterClass {
    class InnerClass extends BaseClass implements MyInterface {
        // ...
    }
}
```

Ở đây `InnerClass` extends `BaseClass` và implement `MyInterface`, cho thấy inner class kế thừa được từ class khác và tuân theo được một interface.

Inner class truy cập được **mọi** thành phần (field, method, nested class) của lớp bao ngoài, kể cả thành phần `private`. Lý do là inner class gắn với một instance của lớp ngoài và có mối quan hệ đặc biệt với nó. Inner class truy cập và thao tác trực tiếp được trạng thái của instance lớp ngoài:

```java
class OuterClass {
    private int privateField = 10;
    protected int protectedField = 20;
    int packagePrivateField = 30;
    public int publicField = 40;

    class InnerClass {
        void accessOuterMembers() {
            System.out.println(privateField);
            System.out.println(protectedField);
            System.out.println(packagePrivateField);
            System.out.println(publicField);
        }
    }
}
```

Trong ví dụ này, `InnerClass` truy cập trực tiếp được mọi thành phần của `OuterClass`, kể cả field private `privateField`. Inner class truy cập và thao tác thoải mái trạng thái của instance lớp ngoài.

Để tạo instance của inner class, thông thường bạn cần một instance của lớp ngoài. Cách phổ biến nhất là khởi tạo inner class từ bên trong một method non-static của lớp ngoài:

```java
class OuterClass {
    class InnerClass {
        // ...
    }

    void outerMethod() {
        InnerClass innerObject = new InnerClass();
    }
}
```

Từ bên ngoài lớp ngoài, bạn khởi tạo inner class bằng cú pháp sau:

```java
OuterClass outerObject = new OuterClass();
OuterClass.InnerClass innerObject = outerObject.new InnerClass();
```

Để tham chiếu tới thành phần (field, method, nested class) của inner class từ bên ngoài lớp ngoài, trước hết bạn cần một instance của lớp ngoài, rồi dùng ký pháp chấm để truy cập inner class, tiếp đó là dấu chấm và tên thành phần:

```java
OuterClass outerObject = new OuterClass();
OuterClass.InnerClass innerObject = outerObject.new InnerClass();
innerObject.innerField;
innerObject.innerMethod();
```

Từ bên trong lớp ngoài, bạn truy cập trực tiếp được các thành phần của inner class thông qua một instance của inner class:

```java
class OuterClass {
    class InnerClass {
        void innerMethod() {
            // ...
        }
    }

    void outerMethod() {
        InnerClass innerObject = new InnerClass();
        innerObject.innerMethod();
    }
}
```

Inner class khác class cấp cao thông thường ở vài điểm:

1. Inner class được định nghĩa bên trong một class khác, còn class cấp cao được định nghĩa bên ngoài các class khác.

2. Inner class truy cập được mọi thành phần của lớp bao ngoài, kể cả thành phần `private`, trong khi class cấp cao chỉ truy cập được thành phần `public`, `protected` và `default` của class khác.

3. Inner class gắn với một instance của lớp ngoài và không thể tồn tại độc lập, còn class cấp cao khởi tạo được độc lập.

4. Inner class có thể là `private`, cho phép đóng gói tốt hơn, trong khi class cấp cao chỉ có thể là `public` hoặc package-private.

Inner class hữu ích khi một class gắn bó chặt chẽ với class khác và cần truy cập phần bên trong của nó. Chúng cung cấp cách tổ chức những class liên quan và duy trì sự gắn kết chặt giữa chúng. Inner class thường dùng để cài đặt event listener, iterator, hay những chức năng đặc thù cho lớp bao ngoài.

### Local class

Local class được định nghĩa bên trong một khối mã, thường là bên trong một method hoặc constructor. Chúng có phạm vi hạn chế và chỉ truy cập được bên trong khối nơi chúng được định nghĩa:

```java
void someMethod() {
    class LocalClass {
        // members of the local class
    }
}
```

Local class không thể có access modifier nào. Chúng không thể được truy cập từ bên ngoài khối hay method nơi chúng được định nghĩa. Lý do là local class không phải thành phần của lớp bao ngoài, mà được định nghĩa bên trong một method hay một khối.

Tuy nhiên, chúng vẫn extends được class khác và implement được interface, như bất kỳ class nào.

Ví dụ:
```java
void someMethod() {
    class LocalClass extends BaseClass implements MyInterface {
        // ...
    }
}
```

Ngoài ra, local class truy cập được mọi thành phần (field, method, nested class) của lớp bao ngoài, kể cả thành phần `private`. Thêm nữa, local class truy cập được các biến cục bộ và tham số `final` hoặc effectively final của method bao quanh:
```java
class OuterClass {
    private int privateField = 10;

    void someMethod(final int parameter) {
        final int localVariable = 20;

        class LocalClass {
            void accessOuterMembers() {
                System.out.println(privateField);
                System.out.println(parameter);
                System.out.println(localVariable);
            }
        }

        LocalClass localObject = new LocalClass();
        localObject.accessOuterMembers();
    }
}
```

Trong ví dụ này, `LocalClass` truy cập được field `private` là `privateField` của `OuterClass`, cũng như tham số `final` là `parameter` và biến cục bộ final `localVariable` của `someMethod()`.

Để tạo instance của local class, bạn khởi tạo nó bên trong method hay khối nơi nó được định nghĩa, dùng keyword `new`:
```java
void someMethod() {
    class LocalClass {
        // ...
    }

    LocalClass localObject = new LocalClass();
}
```

Để tham chiếu tới thành phần (field, method, nested class) của local class, bạn truy cập trực tiếp qua một instance của local class bên trong method hay khối nơi nó được định nghĩa:
```java
void someMethod() {
    class LocalClass {
        int localField = 10;

        void localMethod() {
            System.out.println("Local method");
        }
    }

    LocalClass localObject = new LocalClass();
    System.out.println(localObject.localField);
    localObject.localMethod();
}
```

Local class khác class cấp cao thông thường ở vài điểm:

1. Local class được định nghĩa bên trong một method hay khối, còn class cấp cao được định nghĩa độc lập.

2. Local class có phạm vi hạn chế và chỉ truy cập được bên trong khối nơi nó được định nghĩa, còn class cấp cao có phạm vi rộng hơn.

3. Local class không thể có access modifier, còn class cấp cao có thể là `public` hoặc package-private.

4. Local class truy cập được biến cục bộ và tham số `final` hoặc effectively final của method bao quanh, còn class cấp cao không truy cập trực tiếp được biến cục bộ hay tham số.

Local class hữu ích khi bạn cần định nghĩa một class chỉ dùng trong một method hay khối cụ thể và không cần truy cập từ những phần khác của mã. Chúng cung cấp cách đóng gói hành vi và trạng thái trong một phạm vi giới hạn.

### Anonymous class

**Anonymous class** là cách định nghĩa và khởi tạo một class cùng lúc mà không đặt tên cho nó. Chúng được dùng để tạo những cài đặt dùng một lần cho interface hoặc abstract class.

Để khai báo anonymous class, bạn dùng keyword `new` theo sau là tên một interface hoặc abstract class, rồi cung cấp thân class trong cặp ngoặc nhọn.

```java
interface MyInterface {
    void myMethod();
}

MyInterface myObject = new MyInterface() {
    @Override
    public void myMethod() {
        // Implementation of myMethod()
    }
};
```

Vì anonymous class không được đặt tên tường minh và được định nghĩa ngay tại nơi sử dụng, chúng không thể có access modifier tường minh nào. Khả năng truy cập của chúng do ngữ cảnh sử dụng quyết định. Cụ thể, phạm vi nơi anonymous class được định nghĩa quyết định khả năng truy cập của nó. Chẳng hạn, nếu anonymous class được định nghĩa bên trong một method, nó chỉ truy cập được bên trong method đó. Nếu được định nghĩa bên trong một class, nó tuân theo quy tắc truy cập của class ấy.

Anonymous class có thể extends một class hoặc implement một interface, nhưng **không thể làm cả hai cùng lúc**:
```java
class BaseClass {
    void baseMethod() {
        System.out.println("Base method");
    }
}

interface MyInterface {
    void myMethod();
}

BaseClass anonymousObject1 = new BaseClass() {
    @Override
    void baseMethod() {
        System.out.println("New implementation of base method");
    }
};

MyInterface anonymousObject2 = new MyInterface() {
    @Override
    public void myMethod() {
        System.out.println("Implementation of myMethod()");
    }
};
```

Anonymous class truy cập được mọi thành phần (field, method, nested class) của lớp bao ngoài, kể cả thành phần `private`. Thêm nữa, anonymous class truy cập được các biến cục bộ và tham số `final` hoặc effectively `final` của method bao quanh:
```java
class OuterClass {
    private int privateField = 10;

    void someMethod(final int parameter) {
        final int localVariable = 20;

        MyInterface anonymousObject = new MyInterface() {
            @Override
            public void myMethod() {
                System.out.println(privateField);
                System.out.println(parameter);
                System.out.println(localVariable);
            }
        };

        anonymousObject.myMethod();
    }
}
```

Anonymous class không có tên, nên bạn không thể tham chiếu trực tiếp các thành phần của nó từ bên ngoài thân class. Tuy nhiên, bạn tham chiếu được các thành phần của interface hoặc abstract class mà anonymous class đó implement hay extends:
```java
interface MyInterface {
    void myMethod();
    int myField = 10;
}

MyInterface anonymousObject = new MyInterface() {
    @Override
    public void myMethod() {
        System.out.println("Implementation of myMethod()");
    }
};

anonymousObject.myMethod();
System.out.println(MyInterface.myField);
```

Anonymous class khác class cấp cao thông thường ở vài điểm:

1. Anonymous class được định nghĩa và khởi tạo cùng lúc, không có tên tường minh, còn class cấp cao được định nghĩa riêng và khởi tạo bằng keyword `new`.

2. Anonymous class được định nghĩa ngay tại nơi dùng, thường là đối số cho một method hoặc làm initializer, còn class cấp cao được định nghĩa độc lập.

3. Anonymous class không thể có access modifier hay constructor tường minh, còn class cấp cao có đủ những thứ đó.

4. Anonymous class dùng để tạo cài đặt hoặc instance dùng một lần, còn class cấp cao dùng để tạo những class có tên và tái sử dụng được.

Tóm lại, anonymous class hữu ích khi bạn cần tạo một cài đặt dùng một lần cho interface hoặc abstract class mà không cần đến một class có tên. Chúng cung cấp cách súc tích để định nghĩa và khởi tạo class trong một biểu thức duy nhất.

Cuối cùng, để khép lại phần này, đây là bảng tóm tắt nhiều đặc tính của từng loại nested class:

| Đặc tính | Static nested class | Inner class | Local class | Anonymous class |
|---|---|---|---|---|
| Quan hệ với lớp ngoài | Lỏng lẻo (tồn tại được không cần instance của lớp ngoài) | Chặt chẽ (không tồn tại được nếu không có instance của lớp ngoài) | Chặt chẽ (gắn với một instance của khối bao quanh) | Chặt chẽ (khởi tạo bên trong một biểu thức và gắn với instance của khối bao quanh) |
| Khai báo được static member? | Có (gồm cả static method và static field) | Không (trừ final static field) | Không (không khai báo được static member, chỉ biến final) | Không (không khai báo được static member, chỉ biến final) |
| Truy cập thành phần của lớp ngoài | Chỉ static member | Cả static lẫn instance member | Cả static lẫn instance member | Cả static lẫn instance member |
| Cần tham chiếu tới instance lớp ngoài? | Không | Có | Có (kèm biến final hoặc effectively final ngầm định từ phạm vi bao quanh) | Có (kèm biến final hoặc effectively final ngầm định từ phạm vi bao quanh) |
| Tình huống dùng điển hình | Gom nhóm class chỉ dùng ở một nơi, tăng tính đóng gói | Xử lý sự kiện, truy cập thành phần private của lớp ngoài, giúp mã dễ đọc và dễ bảo trì hơn | Đóng gói mã phức tạp trong một method mà không phơi bày ra ngoài | Đơn giản hoá việc tạo object chỉ dùng một lần, hoặc khi định nghĩa một class là không cần thiết |

## Class và file mã nguồn

Cần lưu ý rằng bạn có thể đặt một hoặc nhiều định nghĩa class trong cùng một file mã nguồn Java. Tuy nhiên phải tuân theo các quy tắc sau:

#### Quy tắc class public

Nếu một class Java được khai báo `public`, tên file phải khớp chính xác với tên của class public đó, kể cả phân biệt hoa thường, cộng thêm phần mở rộng `.java`. Ví dụ, nếu bạn có class `public` tên `MyClass`, file mã nguồn phải đặt tên là `MyClass.java`:
```java
// File name: MyClass.java
public class MyClass {
    // class body
}
```

#### Mỗi file chỉ một class public

Một file mã nguồn Java có thể chứa nhiều class, nhưng chỉ được có **một** class `public`. Nếu file có nhiều class và một trong số đó khai báo `public`, tên file phải khớp với tên class `public` đó. Ví dụ, nếu `PublicClass` là class `public`, file phải đặt tên `PublicClass.java`, và nó cũng có thể chứa `AnotherClass` không phải public:
```java
// File name: PublicClass.java
public class PublicClass {
    // class body
}

class AnotherClass {
    // class body
}
```

#### Không có class public

Nếu file không có class `public` nào, bạn đặt tên file thế nào cũng được. Ví dụ, file `ManyClasses.java` sau chứa nhiều class, không class nào là `public`:
```java
// File name: ManyClasses.java
class FirstClass {
    // class body
}

class SecondClass {
    // class body
}
```

#### Các class không public

Nếu nhiều class không public tồn tại trong cùng một file, tên file không cần khớp với tên class nào cả. Ví dụ, bạn có thể có file tên `UtilityClasses.java` chứa nhiều class không public không trùng tên file:
```java
// File name: UtilityClasses.java
class HelperClass {
    // class body
}

class AnotherHelperClass {
    // class body
}
```

#### Phân biệt hoa thường

Java phân biệt chữ hoa chữ thường. Nếu class của bạn tên `CaseSensitiveClass`, tên file phải khớp chính xác (`CaseSensitiveClass.java`):
```java
// File name: CaseSensitiveClass.java
public class CaseSensitiveClass {
    // class body
}
```

Vậy nên hạn chế chính trong Java là một file mã nguồn không được chứa quá một class `public`. Điều này giúp tổ chức mã và quản lý dễ dàng hơn. Mỗi class public phải nằm trong file mã nguồn riêng, và tên file phải khớp tên class (kể cả hoa thường) với phần mở rộng `.java`.

Tuy nhiên, một file mã nguồn Java có thể chứa bao nhiêu class không public tuỳ ý. Những class này mặc định là package-private, và file cũng có thể chứa nested class `protected` hay `private` bên trong các class `public` hoặc package-private. Sự linh hoạt này cho phép gom những class liên quan về mặt logic vào cùng một file nếu chúng không nhằm mục đích dùng `public`, hỗ trợ tính đóng gói và thiết kế module hoá.

## Các điểm chính

- Lập trình hướng đối tượng (OOP) tổ chức mã thành các object, đại diện cho thực thể trong thế giới thực, chứa dữ liệu (attribute) và hành vi (method).

- Class là bản thiết kế hay khuôn mẫu định nghĩa dữ liệu và hành vi chung cho mọi object cùng loại, còn object là những instance riêng biệt của một class chứa các giá trị dữ liệu riêng.

- Các giai đoạn chính trong vòng đời object của Java là: tạo bằng keyword `new`, truy cập qua biến tham chiếu, và dọn dẹp bởi garbage collector khi không còn tham chiếu nào.

- Keyword là những từ dành riêng trong Java, định ra cấu trúc và cú pháp của chương trình. Chúng không thể dùng làm identifier.

- Comment là ghi chú trong mã bị trình biên dịch bỏ qua, dùng để mô tả hay giải thích mã. Java hỗ trợ comment một dòng (`//`), nhiều dòng (`/* */`) và tài liệu (`/** */`).

- Package gom class, interface và sub-package liên quan thành một đơn vị, cung cấp một mức kiểm soát truy cập. Keyword `package` được dùng để tạo package.

- Access modifier (`public`, `protected`, `default`, `private`) kiểm soát phạm vi nhìn thấy và khả năng truy cập của class, method và biến từ những phần khác của ứng dụng Java.

- Class được khai báo bằng keyword `class` theo sau là tên class. Nó có thể tuỳ chọn kế thừa lớp cha bằng `extends` và cài đặt interface bằng `implements`.

- Field là biến khai báo ở mức class để lưu trạng thái của object. Chúng có thể có access modifier, specifier (`static`, `final`), kiểu, và giá trị khởi tạo tuỳ chọn.

- Method là khối mã thực hiện nhiệm vụ cụ thể và tuỳ chọn trả về giá trị. Chúng được khai báo với access modifier tuỳ chọn, specifier, return type, tên, tham số và thân method.

- Method overloading là việc định nghĩa nhiều method cùng tên nhưng khác danh sách tham số trong cùng một class.

- Trình biên dịch Java xác định method nạp chồng nào sẽ được gọi dựa trên số lượng, kiểu và thứ tự của các đối số truyền vào lúc gọi method.

- Java chỉ chọn được method nạp chồng nếu tìm thấy khớp chính xác cho các đối số, hoặc tìm được phiên bản cụ thể hơn thông qua widening conversion (`int` sang `long`, `int` sang `double`, v.v.).

- Varargs (đối số độ dài thay đổi) cho phép method nhận số lượng đối số tuỳ ý thuộc một kiểu cụ thể. Để định nghĩa method có varargs, dùng dấu ba chấm (`...`) sau kiểu dữ liệu của tham số cuối cùng trong method signature.

- Tham số varargs phải là tham số cuối cùng trong danh sách tham số, và mỗi method chỉ được phép có một tham số varargs.

- Method có varargs vẫn nạp chồng được, nhưng bạn phải tránh nhập nhằng bằng cách đảm bảo các method signature khác nhau.

- Constructor là method đặc biệt dùng để khởi tạo object, được gọi khi một instance của class được tạo bằng keyword `new`. Chúng có cùng tên với class và không có return type.

- Instance initializer là khối mã được thực thi khi object được tạo, tương tự constructor nhưng không có tham số. Chúng được đặt trong `{}` bên trong thân class.

- Static initializer là khối mã được thực thi khi class được nạp vào bộ nhớ, trước khi bất kỳ instance nào được tạo. Chúng được định nghĩa bằng keyword `static` theo sau là `{}`.

- Mọi class đều ngầm định kế thừa class `java.lang.Object`, thừa hưởng các method nền tảng như `toString()`, `equals()` và `hashCode()`.

- Nested class là class được định nghĩa bên trong một class khác. Chúng có thể là static nested class, inner class (non-static nested class), local class hoặc anonymous class.

- Static nested class gắn với chính lớp ngoài và truy cập trực tiếp được static member của nó. Chúng khởi tạo được độc lập, không cần instance của lớp ngoài.

- Inner class (non-static nested class) gắn với một instance của lớp ngoài và truy cập được cả static lẫn non-static member của lớp ngoài. Chúng cần một instance của lớp ngoài để khởi tạo.

- Local class được định nghĩa trong một khối, thường là method, và truy cập được các biến final hoặc effectively final từ phạm vi bao quanh. Chúng không thể có access modifier và chỉ nhìn thấy được trong khối định nghĩa.

- Anonymous class được định nghĩa bên trong một biểu thức và dùng để tạo cài đặt dùng một lần cho interface hoặc abstract class. Chúng không có tên và được khởi tạo ngay tại nơi khai báo.

- Nếu một class khai báo `public`, tên file mã nguồn Java phải khớp chính xác tên class `public` đó, kể cả hoa thường, với phần mở rộng `.java`.

- Một file mã nguồn Java có thể chứa nhiều định nghĩa class, nhưng chỉ một trong số đó được khai báo `public`. Nếu không có class `public` nào, tên file có thể khác tên các class.

## Câu hỏi luyện tập

**1. Xét đoạn mã sau:**

```java
public class Main {
    public static void main(String[] args) {
        StringBuilder sb1 = new StringBuilder("Java");
        StringBuilder sb2 = new StringBuilder("Python");
        sb1 = sb2;
        // More code here
    }
}
```

Sau khi đoạn mã trên thực thi, phát biểu nào sau đây đúng về garbage collection?

**A)** Cả `sb1` và `sb2` đều đủ điều kiện bị garbage collection.  
**B)** Chỉ object `StringBuilder` ban đầu được `sb1` tham chiếu là đủ điều kiện bị garbage collection.  
**C)** Chỉ object `StringBuilder` ban đầu được `sb2` tham chiếu là đủ điều kiện bị garbage collection.  
**D)** Không object `StringBuilder` nào đủ điều kiện bị garbage collection.



**2. Những từ nào sau đây là từ khoá dành riêng (reserved keyword) trong Java? (Chọn tất cả đáp án đúng.)**

**A)** `implement`  
**B)** `array`  
**C)** `volatile`  
**D)** `extends`



**3. Xét đoạn mã sau:**

```java
1. // calculates the sum of numbers
2. public class Calculator {
3.     /* Adds two numbers
4.      * @param a the first number
5.      * @param b the second number
6.      * @return the sum of a and b
7.      */
8.     public int add(int a, int b) {
9.         // return the sum
10.        return a + b;
11.    }
12.    //TODO: Implement subtract method
13.}
```

Những phát biểu nào sau đây đúng về các comment trong đoạn mã trên? (Chọn tất cả đáp án đúng.)

**A)** Dòng 1 là ví dụ về comment một dòng.  
**B)** Dòng 3-7 minh hoạ việc dùng javadoc comment.  
**C)** Dòng 9 dùng javadoc comment để giải thích method `add`.  
**D)** Dòng 12 dùng một loại comment `TODO` đặc biệt, khác với comment một dòng.  
**E)** Dòng 3-7 là block comment nhưng được dùng như thể nó là javadoc comment.  


**4. Giả sử bạn có hai file Java sau nằm cùng một thư mục:**

```java
// File 1: Calculator.java
package math;

public class Calculator {
    public int add(int a, int b) {
        return a + b;
    }
}

// File 2: Application.java
package app;

import math.Calculator;

public class Application {
    public static void main(String[] args) {
        Calculator calc = new Calculator();
        System.out.println(calc.add(5, 3));
    }
}
```

Phát biểu nào sau đây đúng về câu lệnh `package` và `import` trong Java?

**A)** Câu lệnh `import` trong `Application.java` là không cần thiết vì hai class nằm cùng thư mục.  
**B)** Câu lệnh `import` trong `Application.java` là cần thiết để dùng class `Calculator` vì chúng thuộc hai package khác nhau.  
**C)** Class `Calculator` sẽ không truy cập được trong `Application.java` vì nằm ở thư mục khác.  
**D)** Bỏ câu lệnh `package` ở cả hai file sẽ cho phép `Application.java` dùng `Calculator` mà không cần câu lệnh `import`, bất kể cấu trúc thư mục.



**5. Xét các mức truy cập mặc định do bốn access modifier của Java cung cấp: `public`, `protected`, `default` (không modifier) và `private`. Những phát biểu nào sau đây mô tả đúng mức truy cập của chúng? (Chọn tất cả đáp án đúng.)**

**A)** Class hoặc thành phần `public` truy cập được bởi bất kỳ class nào khác, cùng package hay khác package.  
**B)** Thành phần `protected` truy cập được bởi mọi class trong cùng package, còn từ ngoài package thì chỉ bởi các class kế thừa class chứa thành phần `protected` đó.  
**C)** Thành phần có mức truy cập `default` (không modifier) truy cập được bởi mọi class cùng package nhưng không từ class ở package khác.  
**D)** Thành phần `private` chỉ truy cập được bởi các method thuộc cùng class hoặc nằm trong cùng file.  
**E)** Thành phần `protected` truy cập được bởi mọi class trong chương trình Java, bất kể package.



**6. Khai báo class nào sau đây minh hoạ đúng cách dùng access modifier, keyword `class` và quy ước đặt tên class trong Java?**

**A)** `class public Vehicle { }`  
**B)** `public class vehicle { }`  
**C)** `Public class Vehicle { }`  
**D)** `public class Vehicle { }`  
**E)** `classVehicle public { }`



**7. Xét đoạn mã sau:**

```java
public class Counter {
    public static int COUNT = 0;
    
    public Counter() {
        COUNT++;
    }
    
    public static void resetCount() {
        COUNT = 0;
    }
    
    public int getCount() {
        return COUNT;
    }
}
```

Những phát biểu nào sau đây đúng về static member và instance member trong class `Counter`? (Chọn tất cả đáp án đúng.)

**A)** Biến `COUNT` truy cập trực tiếp được bằng tên class mà không cần tạo instance của `Counter`.  
**B)** Method `getCount()` là ví dụ về static method vì nó trả về giá trị của một biến static.  
**C)** Mỗi lần một instance mới của `Counter` được tạo, biến `COUNT` tăng lên.  
**D)** Method `resetCount()` đặt lại biến `COUNT` về 0 cho mọi instance của `Counter`.



**8. Những identifier nào sau đây hợp lệ để đặt tên field trong Java? (Chọn tất cả đáp án đúng.)**

**A)** `int _age;`  
**B)** `double 2ndValue;`  
**C)** `boolean is_valid;`  
**D)** `String $name;`  
**E)** `char #char;`



**9. Xét cú pháp dùng để khai báo method trong một class. Khai báo method nào sau đây đúng theo quy tắc cú pháp của Java?**

**A)** `int public static final computeSum(int num1, int num2) { return num1 + num2 }`  
**B)** `private void updateRecord(int id) throws IOException {}`  
**C)** `synchronized boolean checkStatus [int status] { return status == 1; }`  
**D)** `float calculateArea() {}`



**10. Cho các khai báo method dưới đây, những khai báo nào có cùng method signature với nhau?**

**A)** `public void update(int id, String value)`  
**B)** `private void update(int identifier, String data)`  
**C)** `public boolean update(String value, int id)`  
**D)** `void update(String value, int id)`  
**E)** `protected void update(int id, int value) throws IOException`



**11. Cho class sau:**

```java
public class AccountManager {
    private void resetAccountPassword(String accountId) {
        // Implementation code here
    }
    
    void auditTrail(String accountId) {
        // Implementation code here
    }
    
    protected void notifyAccountChanges(String accountId) {
        // Implementation code here
    }
    
    public void updateAccountInformation(String accountId) {
        // Implementation code here
    }
}
```

Những phát biểu nào sau đây mô tả đúng khả năng truy cập các method của class `AccountManager` từ một class cùng package và từ một class khác package?

**A)** Method `resetAccountPassword` truy cập được từ mọi class trong cùng package nhưng không từ class ở package khác.  
**B)** Method `auditTrail` truy cập được từ mọi class trong cùng package và từ lớp con ở package khác.  
**C)** Method `notifyAccountChanges` truy cập được từ mọi class trong cùng package và từ lớp con ở package khác.  
**D)** Method `updateAccountInformation` truy cập được từ bất kỳ class nào, bất kể package của nó.



**12. Chương trình sau in ra gì?**

```java
public class TestPassByValue {
    public static void main(String[] args) {
        int originalValue = 10;
        TestPassByValue test = new TestPassByValue();
        System.out.println("Before calling changeValue: " + originalValue);
        test.changeValue(originalValue);
        System.out.println("After calling changeValue: " + originalValue);
    }

    public void changeValue(int value) {
        value = 20;
    }
}
```

**A)** 
```
Before calling changeValue: 10  
After calling changeValue: 20  
 ```

**B)** 
```
Before calling changeValue: 10  
After calling changeValue: 10  
```

**C)** 
```
Before calling changeValue: 20  
After calling changeValue: 20  
```

**D)** 
```
Before calling changeValue: 20  
After calling changeValue: 10  
```


**13. Chương trình sau in ra gì?**

```java
public class Test {
    public static void main(String[] args) {
        print(null);
    }

    public static void print(Object o) {
        System.out.println("Object");
    }

    public static void print(String s) {
        System.out.println("String");
    }
}
```

**A)** `Object`  
**B)** `String`  
**C)** Biên dịch thất bại  
**D)** Một exception được ném ra lúc chạy  



**14. Những khai báo method nào sau đây dùng varargs đúng cú pháp? Chọn tất cả đáp án đúng.**

**A)** `public void print(String... messages, int count)`  
**B)** `public void print(int count, String... messages)`  
**C)** `public void print(String messages...)`  
**D)** `public void print(String[]... messages)`  
**E)** `public void print(String... messages, String lastMessage)`




**15. Cho class `Vehicle`:**

```java
public class Vehicle {
    private String type;
    private int maxSpeed;

    public Vehicle(String type) {
        this.type = type;
    }

    public Vehicle(int maxSpeed) {
        this.maxSpeed = maxSpeed;
    }

    // Additional methods here
}
```

Phát biểu nào sau đây đúng về các constructor của nó?

**A)** Class `Vehicle` minh hoạ constructor overloading bằng việc có nhiều constructor với danh sách tham số khác nhau.  
**B)** Class `Vehicle` sẽ báo lỗi biên dịch vì không cung cấp default constructor.  
**C)** Có thể tạo instance của `Vehicle` với cả `type` lẫn `maxSpeed` được gán giá trị cụ thể qua một lời gọi constructor duy nhất.  
**D)** Gọi constructor nào cũng sẽ khởi tạo cả hai field `type` và `maxSpeed` của class `Vehicle`.



**16. Xét class sau có khối instance initializer:**

```java
public class Library {
    private int bookCount;
    private List<String> books;

    {
        books = new ArrayList<>();
        books.add("Book 1");
        books.add("Book 2");
        // Instance initializer block
    }

    public Library(int bookCount) {
        this.bookCount = bookCount + books.size();
    }

    public int getBookCount() {
        return bookCount;
    }

    // Additional methods here
}
```

Với class `Library` ở trên, những phát biểu nào sau đây mô tả chính xác vai trò và tác dụng của khối instance initializer?

**A)** Khối instance initializer chạy trước constructor, khởi tạo list `books` và thêm hai cuốn sách vào đó.  
**B)** Khối instance initializer thay thế nhu cầu có constructor trong class `Library`.  
**C)** Khối instance initializer không thể khởi tạo biến instance như `books`.  
**D)** Nếu tạo nhiều instance của `Library`, khối instance initializer sẽ chạy mỗi lần trước constructor, đảm bảo list `books` được khởi tạo và nạp dữ liệu cho từng object.



**17. Xét class Java sau có khối `static` initializer:**

```java
public class Configuration {
    private static Map<String, String> settings;
    
    static {
        settings = new HashMap<>();
        settings.put("url", "https://eherrera.net");
        settings.put("timeout", "30");
        // Static initializer block
    }

    public static String getSetting(String key) {
        return settings.get(key);
    }

    // Additional methods here
}
```

Với class `Configuration` ở trên, phát biểu nào sau đây mô tả chính xác vai trò và tác dụng của khối `static` initializer?

**A)** Khối `static` initializer chỉ chạy đúng một lần khi class được nạp vào bộ nhớ lần đầu, khởi tạo map `settings` với các giá trị mặc định.  
**B)** Khối `static` initializer cho phép instance method sửa map `settings` mà không cần tạo instance của class `Configuration`.  
**C)** Khối `static` initializer chạy mỗi lần một instance mới của class `Configuration` được tạo.  
**D)** Khối `static` initializer chạy trước mọi khối instance initializer và constructor, khi một instance của class được tạo.



**18. Xét định nghĩa class sau:**

```java
public class InitializationOrder {
    static {
        System.out.println("1. Static initializer");
    }

    private static int staticValue = initializeStaticValue();

    private int instanceValue = initializeInstanceValue();

    {
        System.out.println("3. Instance initializer");
    }

    public InitializationOrder() {
        System.out.println("4. Constructor");
    }

    private static int initializeStaticValue() {
        System.out.println("2. Static value initializer");
        return 0;
    }

    private int initializeInstanceValue() {
        System.out.println("3. Instance value initializer");
        return 0;
    }

    public static void main(String[] args) {
        new InitializationOrder();
    }
}
```

Khi method `main` của class `InitializationOrder` được thực thi, thứ tự thực thi đúng của các khối khởi tạo, lời gọi method và constructor là gì?

**A)** 
   ```
   1. Static initializer
   2. Static value initializer
   3. Instance initializer
   3. Instance value initializer
   4. Constructor 
   ```

**B)**  
   ```
   1. Static initializer
   2. Static value initializer
   3. Instance value initializer
   3. Instance initializer
   4. Constructor 
   ```

**C)**  
   ```
   1. Static initializer
   3. Instance initializer
   2. Static value initializer
   3. Instance value initializer
   4. Constructor
   ``` 

**D)**  
   ```
   2. Static value initializer
   1. Static initializer
   3. Instance value initializer
   3. Instance initializer
   4. Constructor 
   ```


**19. Xét class `CustomObject` không override tường minh bất kỳ method nào của `java.lang.Object`:**

```java
public class CustomObject {
    // Class implementation goes here
}
```

Những phát biểu nào sau đây phản ánh đúng kết quả khi các method của `java.lang.Object` được dùng với instance của `CustomObject`? (Chọn tất cả đáp án đúng.)

**A)** Gọi `toString()` trên một instance của `CustomObject` sẽ trả về một `String` gồm tên class, ký tự `@` và mã băm của object.  
**B)** Gọi `equals(Object obj)` trên hai instance khác nhau của `CustomObject` có nội dung giống hệt nhau sẽ trả về `true` vì chúng là instance của cùng một class.  
**C)** Gọi `hashCode()` trên một instance bất kỳ của `CustomObject` sinh ra một số nguyên nhất quán qua nhiều lần gọi trong cùng một lần chạy chương trình.  
**D)** Method `clone()` dùng được để tạo bản sao nông của một instance `CustomObject` mà không cần `CustomObject` implement interface `Cloneable`.  



**20. Xét đoạn mã dưới đây minh hoạ việc dùng static nested class:**

```java
public class OuterClass {
    private static String message = "Hello, World!";

    static class NestedClass {
        void printMessage() {
            // Note: A static nested class can access the static members of its outer class.
            System.out.println(message);
        }
    }

    public static void main(String[] args) {
        OuterClass.NestedClass nested = new OuterClass.NestedClass();
        nested.printMessage();
    }
}
```

Phát biểu nào sau đây đúng về static nested class trong Java?

**A)** Static nested class truy cập trực tiếp được cả static lẫn non-static member của lớp bao ngoài.  
**B)** Instance của static nested class tồn tại được mà không cần instance của lớp bao ngoài.  
**C)** Static nested class chỉ khởi tạo được bên trong static method của lớp bao ngoài.  
**D)** Static nested class không được coi là thành phần của lớp bao ngoài và không truy cập được thành phần nào của lớp đó.



**21. Xét đoạn mã sau minh hoạ việc dùng non-static nested class (inner class):**

```java
public class OuterClass {
    private String message = "Hello, World!";

    class InnerClass {
        void printMessage() {
            System.out.println(message);
        }
    }

    public static void main(String[] args) {
        OuterClass outer = new OuterClass();
        OuterClass.InnerClass inner = outer.new InnerClass();
        inner.printMessage();
    }
}
```

Phát biểu nào sau đây đúng về non-static nested class (inner class) trong Java?

**A)** Non-static nested class truy cập trực tiếp được cả static lẫn non-static member của lớp bao ngoài.  
**B)** Instance của non-static nested class tồn tại được độc lập với instance của lớp bao ngoài.  
**C)** Non-static nested class không truy cập trực tiếp được non-static member của lớp bao ngoài.  
**D)** Non-static nested class phải được khai báo static thì mới truy cập được static member của lớp bao ngoài.



**22. Xét đoạn mã sau minh hoạ việc dùng local class bên trong một method:**

```java
public class LocalClassExample {
    public void printEvenNumbers(int[] numbers, int max) {
        class EvenNumberPrinter {
            public void print() {
                for (int number : numbers) {
                    if (number % 2 == 0 && number <= max) {
                        System.out.println(number);
                    }
                }
            }
        }
        EvenNumberPrinter printer = new EvenNumberPrinter();
        printer.print();
    }

    public static void main(String[] args) {
        LocalClassExample example = new LocalClassExample();
        int[] numbers = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
        example.printEvenNumbers(numbers, 6);
    }
}
```

Dựa trên ví dụ đã cho, những phát biểu nào sau đây mô tả đúng về local class trong Java?

**A)** Local class khai báo được trong bất kỳ khối nào đứng trước một câu lệnh.  
**B)** Instance của local class tạo và dùng được bên ngoài khối định nghĩa local class đó.  
**C)** Local class là một dạng static nested class và truy cập trực tiếp được cả static lẫn non-static member của lớp bao ngoài.  
**D)** Local class chỉ truy cập được biến cục bộ và tham số của khối bao quanh nếu chúng được khai báo `final` hoặc effectively final.  



**23. Xét đoạn mã Java sau minh hoạ việc dùng anonymous class:**

```java
public class HelloWorld {
    interface HelloWorldInterface {
        void greet();
    }

    public void sayHello() {
        HelloWorldInterface myGreeting = new HelloWorldInterface() {
            @Override
            public void greet() {
                System.out.println("Hello, world!");
            }
        };
        myGreeting.greet();
    }

    public static void main(String[] args) {
        new HelloWorld().sayHello();
    }
}
```

Phát biểu nào sau đây đúng về anonymous class trong Java?

**A)** Anonymous class implement được interface và extends được class mà không cần khai báo một class có tên.  
**B)** Anonymous class phải override mọi method của lớp cha hoặc interface mà nó khai báo là implement/extends.  
**C)** Anonymous class có constructor như class có tên.  
**D)** Instance của anonymous class không thể được truyền làm đối số cho method.


**24. Phát biểu nào sau đây phản ánh đúng một quy tắc hợp lệ về cách tổ chức class và file mã nguồn?**

**A)** Một file mã nguồn có thể chứa nhiều class public.  
**B)** Class private khai báo được ở mức cấp cao (top level) trong file mã nguồn.  
**C)** Class `public` phải được khai báo trong file mã nguồn có tên trùng với tên class.  
**D)** Nếu file mã nguồn chứa nhiều hơn một class thì không class nào được là `public`.
