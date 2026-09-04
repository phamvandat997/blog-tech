---
layout: chapter

title: "Chương 2: Tiếp cận hướng đối tượng trong Java - Phần 2"
subtitle: "Utilizing Java Object-Oriented Approach - Part 2"
exam_objectives:
  - "Hiểu phạm vi của biến, áp dụng encapsulation và tạo object immutable. Dùng local variable type inference."
  - "Cài đặt inheritance, bao gồm abstract type, sealed type và record class. Override method, kể cả method của class Object. Cài đặt polymorphism và phân biệt object type với reference type. Thực hiện ép kiểu tham chiếu, xác định kiểu object bằng toán tử instanceof, và pattern matching với instanceof cùng cấu trúc switch."
  - "Tạo và dùng interface, nhận diện functional interface, và tận dụng private method, static method cùng default method của interface."

previous_link: "/ch01.html"
previous_title: "Utilizing Java Object-Oriented Approach - Part 1"
next_link: "/ch03.html"
next_title: "Working with Records and Enums"
answers_link: "/ch02a.html"

description: "Phạm vi biến, var, inheritance, abstract class, sealed class, interface, polymorphism, ép kiểu, pattern matching và encapsulation cho kỳ thi OCP Java 21."
order: 2
phase: "Chương 2"
tags: [Java, OOP, OCP, Inheritance, Polymorphism, Interface, Encapsulation, var]
---

## Nội dung chương

- [Biến](#heading-biến)
    - [Phạm vi của biến](#heading-phạm-vi-của-biến)
    - [Khai báo biến](#heading-khai-báo-biến)
    - [Suy luận kiểu biến (var)](#heading-suy-luận-kiểu-biến-var)
- [Inheritance (Kế thừa)](#heading-inheritance-kế-thừa)
    - [Giới thiệu về inheritance](#heading-giới-thiệu-về-inheritance)
    - [Abstract class](#heading-abstract-class)
    - [Interface](#heading-interface)
    - [Sealed class](#heading-sealed-class)
    - [Tham chiếu `this`](#heading-tham-chiếu-this)
    - [Tham chiếu `super`](#heading-tham-chiếu-super)
- [Polymorphism (Đa hình)](#heading-polymorphism-đa-hình)
    - [Giới thiệu về polymorphism](#heading-giới-thiệu-về-polymorphism)
    - [Các quy tắc overriding](#heading-các-quy-tắc-overriding)
    - [Truy cập object Java](#heading-truy-cập-object-java)
    - [Ép kiểu (Type casting)](#heading-ép-kiểu-type-casting)
    - [Toán tử `instanceof`](#heading-toán-tử-instanceof)
- [Encapsulation (Đóng gói)](#heading-encapsulation-đóng-gói)
    - [Encapsulation là gì?](#heading-encapsulation-là-gì)
    - [Object immutable (bất biến)](#heading-object-immutable-bất-biến)
- [Các điểm chính](#heading-các-điểm-chính)
- [Câu hỏi luyện tập](#heading-câu-hỏi-luyện-tập)

---
## Biến

### Phạm vi của biến

Có thể hiểu phạm vi (scope) của biến là mức độ nhìn thấy của nó — nơi nào trong mã có thể thấy và truy cập được nó. Quản lý phạm vi biến đúng cách giúp ta viết mã sạch hơn, dễ bảo trì hơn và tránh những lỗi liên quan tới việc truy cập biến sai ngữ cảnh.

Ở mức cao nhất, phạm vi của một biến được quyết định bởi nơi nó được khai báo. Trong Java có năm phạm vi chính cần nắm:
- Biến trong khối (block variable)
- Biến cục bộ (local variable)
- Tham số method (method parameter)
- Field (instance variable)
- Biến class (static field)

Sơ đồ hình dung:
```
┌───────────────────────────────────────────────┐
│ Class                                         │
│ ┌───────────────────────────────────────────┐ │
│ │ Static/Class Variables                    │ │
│ │ ┌───────────────────────────────────────┐ │ │
│ │ │ Instance Variables                    │ │ │
│ │ │ ┌───────────────────────────────────┐ │ │ │
│ │ │ │ Method                            │ │ │ │
│ │ │ │ ┌───────────────────────────────┐ │ │ │ │
│ │ │ │ │ Method Parameters             │ │ │ │ │
│ │ │ │ │ Other Local Variables         │ │ │ │ │
│ │ │ │ │ ┌───────────────────────────┐ │ │ │ │ │
│ │ │ │ │ │ Block                     │ │ │ │ │ │
│ │ │ │ │ │ ┌───────────────────────┐ │ │ │ │ │ │
│ │ │ │ │ │ │ Block Variables       │ │ │ │ │ │ │
│ │ │ │ │ │ └───────────────────────┘ │ │ │ │ │ │
│ │ │ │ │ └───────────────────────────┘ │ │ │ │ │
│ │ │ │ └───────────────────────────────┘ │ │ │ │
│ │ │ └───────────────────────────────────┘ │ │ │
│ │ └───────────────────────────────────────┘ │ │
│ └───────────────────────────────────────────┘ │
└───────────────────────────────────────────────┘
```

Biến cục bộ được khai báo bên trong method nơi chúng được định nghĩa, còn biến trong khối chỉ truy cập được bên trong khối định nghĩa chúng. Chúng vào phạm vi tại chỗ khai báo và ra khỏi phạm vi ở cuối method/khối bao quanh:

```java
void myMethod() {
    int x = 1;
    if (x > 0) { 
        int y = 2;
        System.out.println(x + y); // x and y both in scope here
    }
    System.out.println(x); // Only x is in scope here
    System.out.println(y); // Compile error! y is out of scope
}
```

Như bạn thấy, `y` chỉ nhìn thấy được bên trong khối `if` nơi nó được khai báo. Cố truy cập nó bên ngoài khối đó sẽ gây lỗi biên dịch.

Nếu bạn khai báo biến bên trong vòng lặp, bạn không truy cập được nó ngoài vòng lặp. Dù tất cả cùng nằm trong một method, phạm vi vẫn kết thúc ở dấu `}` đóng vòng lặp. Ví dụ:

```java
void myLoopingMethod() {
    for (int i = 0; i < 10; i++) { 
        System.out.println(i);
    }
    System.out.println(i); // Compile error! i is out of scope
}
```

Tương tự, biến khai báo trong phần khởi tạo của vòng `for`, như `int i` ở trên, chỉ có phạm vi trong thân vòng lặp, không phải toàn bộ method bao quanh.

Khái niệm này cũng áp dụng cho các khối khác như `if/else`. Biến khai báo bên trong `if` không nhìn thấy được ở `else` tương ứng:

```java
void myIfElseMethod(int x) {
    if (x > 0) {
        int y = 1; 
    } else {
        System.out.println(y); // Compile error! y not in scope
    }
}
```

Tiếp theo là tham số method. Chúng cũng được coi là biến cục bộ, nhưng có phạm vi trải khắp thân method. Chúng vào phạm vi khi method được gọi và ra khỏi phạm vi khi method kết thúc.

Tham số là cục bộ với method; không method nào khác nhìn thấy chúng, kể cả khi method đó đang thực thi:

```java
void methodA(int x) {
    methodB();
    System.out.println(x); // x is in scope
}

void methodB() {
    System.out.println(x); // Compile error! x is not in scope
}
```

Field, hay instance variable, là biến khai báo ở mức class, bên ngoài mọi method. Chúng vào phạm vi khi object được khởi tạo và ở trong phạm vi chừng nào object còn trong bộ nhớ:

```java
class MyClass {
    private int x; // Instance variable (field)

    void myMethod() {
        System.out.println(x); // x is in scope here
    }
}
```

Vì instance variable thuộc về một object instance, chúng không truy cập được từ ngữ cảnh static, nhưng truy cập được bởi mọi instance method trong class.

Một hiểu lầm phổ biến là instance variable bị thu gom rác ngay khi method dùng chúng kết thúc — điều này không đúng. Field của một object nằm trong bộ nhớ tới khi chính object đó đủ điều kiện bị thu gom, có thể là rất lâu sau khi một lời gọi method cụ thể kết thúc.

Ngoài ra, nhớ rằng nếu biến hoặc class của nó khai báo `private` thì chỉ class khai báo mới truy cập được. Nhưng nếu chúng có quyền truy cập `public`, `protected` hay default (package), các class khác cũng có thể truy cập được.

Cuối cùng, biến class (class variable) hay static field là những biến `static` khai báo ở mức class. Chúng vào phạm vi khi class được nạp và ở trong phạm vi tới khi chương trình kết thúc. Chỉ có một bản sao duy nhất của biến class được chia sẻ cho mọi instance của class.

Biến class thuộc về chính class chứ không thuộc một object instance cụ thể. Và khác instance variable, biến class truy cập được từ cả ngữ cảnh static lẫn instance:

```java
class MyClass {
    private static int x; // Class variable

    void myMethod() {
        System.out.println(x); // x is in scope 
    }

    static void myStaticMethod() {
        System.out.println(x); // x is also in scope
    }
}
```

Biến class truy cập được từ bất kỳ đâu trong chương trình, kể cả khi chưa tạo instance nào của class. Nhưng chúng vẫn chịu sự kiểm soát truy cập như `private` và `public`.

Một trường hợp thú vị là khi bạn có hai biến trùng tên nhưng khác phạm vi:

```java
class MyClass {
    private int x; // Instance variable 
    
    void myMethod() {
        int x = 1; // Local variable
        System.out.println(x); // Prints 1 (local variable)
        System.out.println(this.x); // Prints 0 (instance variable) 
    }
}
```

Trong tình huống này, biến cục bộ **che khuất** (shadow) instance variable trong phạm vi của nó. Để truy cập instance variable, ta phải dùng keyword `this`. Chúng ta sẽ bàn về `this` sau trong chương này, nhưng như bạn thấy, việc giới hạn phạm vi đúng cách không nhằm cải thiện hiệu năng, mà để tổ chức mã và kiểm soát truy cập biến.

### Khai báo biến

Khi mới học Java, rất dễ nghĩ rằng field và biến cục bộ về cơ bản là một. Dù sao thì chúng cũng chỉ là biến, đúng không? Bạn khai báo chúng, cho chúng kiểu và tên, có thể gán giá trị, rồi dùng trong mã. Có gì to tát đâu?

Thực ra, có vài khác biệt khá quan trọng giữa field và biến cục bộ trong Java.

Field được khai báo trực tiếp bên trong class, nhưng bên ngoài mọi method hay constructor. Chúng là một phần trạng thái của class, và mỗi instance của class có bản sao riêng của những field này.

Biến cục bộ thì ngược lại, được khai báo bên trong một method hay constructor. Chúng chỉ tồn tại trong suốt lời gọi method/constructor đó và không truy cập được từ bên ngoài. Khi method thực thi xong, biến cục bộ biến mất.

Ví dụ:

```java
public class MyClass {
    private int myField; // This is a field

    public void myMethod() {
        int myLocalVar = 25; // This is a local variable
        // Do something with myLocalVar...
    } // myLocalVar no longer exists after this point
}
```

Bạn có thể nghĩ: "Được rồi, field nằm trong class, biến cục bộ nằm trong method. Nhưng ngoài chuyện đó thì dùng thay thế nhau được chứ?" Không hẳn. Có vài khác biệt then chốt về cách chúng hành xử.

Thứ nhất, field tự động nhận giá trị mặc định nếu bạn không khởi tạo tường minh. Với kiểu số (`int`, `long`, `float`, `double`) mặc định là `0`. Với `boolean` là `false`. Với kiểu tham chiếu (như `String` hay bất kỳ object nào) là `null`.

Ngược lại, biến cục bộ không nhận giá trị mặc định nào. Nếu bạn cố dùng biến cục bộ trước khi khởi tạo, bạn sẽ gặp lỗi biên dịch. Nói cách khác, trình biên dịch Java muốn bạn nói rõ ý định của mình với biến cục bộ:

```java
public void myMethod() {
    int uninitialized;
    System.out.println(uninitialized); // Compile error!
}
```

Vậy Java yêu cầu bạn khởi tạo biến cục bộ trước khi dùng. Nhưng chính xác thì khi nào phải khởi tạo? Quy tắc rất đơn giản: việc khởi tạo phải diễn ra trên **mọi** nhánh thực thi có thể xảy ra, trước lần dùng đầu tiên của biến:

```java
int myVar;
if (someCondition) {
    myVar = 1;
} else {
    myVar = 2;
}
System.out.println(myVar); // This is fine

int myOtherVar;
if (someCondition) {
    myOtherVar = 1;
}
System.out.println(myOtherVar); // Compile error! Not initialized on the else path.
```

Ở ví dụ đầu, `myVar` chắc chắn được khởi tạo trước khi dùng, bất kể `if/else` đi theo nhánh nào. Nhưng ở ví dụ thứ hai, nếu `someCondition` là `false`, `myOtherVar` sẽ chưa được khởi tạo trước lần dùng đầu tiên, do đó gây lỗi biên dịch.

Dù là field hay biến cục bộ, Java đều cho phép bạn khai báo nhiều biến cùng kiểu trên một dòng, phân tách bởi dấu phẩy:

```java
int a, b, c;
```

Nhưng điều đó không có nghĩa các biến này chia sẻ cùng một giá trị. Chúng là những biến hoàn toàn độc lập, chỉ tình cờ được khai báo cùng nhau. Bạn gán cho chúng những giá trị khác nhau được:

```java
int a = 1, b = 2, c = 3;
```

Thực tế, bạn không bắt buộc phải gán giá trị cho tất cả ngay lập tức. Viết thế này hoàn toàn ổn:

```java
int a, b, c;
a = 1;
b = 2;
// c remains uninitialized for now
```

Chỉ cần nhớ rằng bạn không dùng được `c` cho tới khi khởi tạo nó, nếu không sẽ gặp lỗi biên dịch.

Vậy còn khi muốn khai báo nhiều biến khác kiểu thì sao? Bạn không làm được trên một dòng như với biến cùng kiểu. Bạn phải khai báo từng cái riêng:

```java
int a = 1;
String b = "hello";
// This won't compile: int a = 1, String b = "hello";
```

Một khác biệt khác giữa biến cục bộ và field nằm ở cách dùng `final`. Đánh dấu một field là `final` nghĩa là nó phải được khởi tạo khi object được dựng, và sau đó không bao giờ thay đổi được nữa. Với biến cục bộ, `final` chỉ có nghĩa là bạn chỉ được gán giá trị cho nó một lần. Nhưng việc gán đó không nhất thiết phải diễn ra ngay tại chỗ khai báo:

```java
public class MyClass {
    private final int myFinalField = 42; // Must initialize here

    public void myMethod(int arg) {
        final int myFinalVar; // Okay to initialize later
        if (arg > 0) {
            myFinalVar = arg;
        } else {
            myFinalVar = 0;
        }
        // Can't assign to myFinalVar again after this point
    }
}
```

Phép gán phải xảy ra trước lần dùng đầu tiên của biến, và chỉ được xảy ra một lần. Điều này thường hữu ích khi bạn muốn gán giá trị theo điều kiện như ví dụ trên. Hoặc khi bạn muốn gán giá trị trong vòng lặp nhưng đảm bảo nó không đổi sau vòng lặp:

```java
final int myFinalVar;
for (int i = 0; i < 10; i++) {
    // Some calculation...
    myFinalVar = result;
    // Can't assign to myFinalVar again after this point
}
```

Tuy nhiên, khi làm việc với tham chiếu và object, nếu bạn khai báo biến cục bộ là `final`, bạn vẫn thay đổi được thuộc tính của object mà nó tham chiếu. `final` chỉ ngăn bạn gán giá trị mới cho chính biến đó. Nếu biến là tham chiếu tới object, bạn vẫn sửa được object ấy:

```java
final StringBuilder sb = new StringBuilder();
sb.append("Hello"); // This is fine
sb = new StringBuilder(); // This won't compile
```

Trong ví dụ này, ta gọi được các method trên `sb` để sửa object `StringBuilder`, nhưng không gán được instance `StringBuilder` mới cho `sb`.

### Suy luận kiểu biến (var)

Java 10 trở đi giới thiệu tính năng mới: `var`. Nó cho phép bạn khai báo biến cục bộ mà không cần chỉ rõ kiểu:

```java
var myVar = 42;
```

Đây gọi là **local variable type inference** (suy luận kiểu biến cục bộ). Trình biên dịch nhìn vào giá trị bạn gán cho biến và tự xác định kiểu phù hợp. Trong trường hợp này, nó suy ra `myVar` là `int`.

Theo cách truyền thống, khai báo biến cục bộ thường dẫn tới mã dài dòng và lặp lại. Ví dụ:
```java
HashMap<Integer, String> map = new HashMap<>();
List<String> list = new ArrayList<>();
AtomicInteger counter = new AtomicInteger(0);
```

Ở mỗi trường hợp, kiểu được nhắc tới hai lần: một lần bên trái và một lần bên phải. Đây là lúc keyword `var` phát huy tác dụng.

Dùng `var`, đoạn mã trên viết lại thành:
```java
var map = new HashMap<Integer, String>();
var list = new ArrayList<String>();
var counter = new AtomicInteger(0);
```

Kiểu của `map`, `list` và `counter` được trình biên dịch suy ra từ biểu thức khởi tạo. Điều này khiến mã súc tích và dễ đọc hơn, đồng thời vẫn giữ được tính an toàn kiểu.

Cần lưu ý rằng `var` hành xử như một keyword trong ngữ cảnh sử dụng, dù về mặt kỹ thuật nó là một tên kiểu dành riêng cho local variable type inference. Nghĩa là mã đang dùng `var` làm tên biến, tên method hay tên package sẽ không bị ảnh hưởng.

`var` chỉ dùng được cho biến cục bộ bên trong method, constructor hoặc khối initializer. Nó không dùng được để khai báo instance variable (field) hay biến class (static). Hạn chế này đảm bảo kiểu của biến class và biến instance luôn rõ ràng từ API của class, chứ không chỉ từ phần cài đặt:
```java
public class MyClass {
   var myVar = "Hello"; // This will not compile
}
```

Tương tự, `var` không dùng được để khai báo tham số method. Method signature là một phần API công khai của class và cần nêu rõ kiểu tham số để rõ ràng và đảm bảo tính ổn định của hợp đồng:
```java
public void myMethod(var param) { // This will not compile
   // ...
}
```

Ngoài ra, `var` dùng được trong nhiều tình huống khác. Ví dụ trong chỉ số vòng `for`:
```java
var numbers = Arrays.asList(1, 2, 3, 4, 5);
for (var num : numbers) {
    System.out.println(num);
}

// Or

for (var i = 1; i <= 10; i++) {
    System.out.println(i);
}
```

Trong câu lệnh `try-with-resources`:
```java
try (var stream = Files.lines(Path.of("file.txt"))) {
    stream.forEach(System.out::println);
}
```

Hoặc cho tham số của lambda expression có kiểu ngầm định:
```java
Function<Integer, String> toString = (var i) -> String.valueOf(i);
```

Nhớ rằng trong một lambda expression, hoặc **tất cả** tham số đều khai báo bằng `var`, hoặc **không** tham số nào. Trộn `var` với kiểu tường minh hay kiểu suy luận là không được phép.

Tuy nhiên, hãy thận trọng với `var` — nó không phải lúc nào cũng là lựa chọn tốt nhất. Đôi khi khai báo kiểu tường minh khiến mã dễ đọc và dễ bảo trì hơn. Bạn chỉ dùng được `var` khi khởi tạo biến ngay tại chỗ khai báo:

```java
var myVar; // This won't compile
var myOtherVar = someMethodThatReturnsAnObject(); // Fine, as long as the method return type is clear
```

Tương tự, `var` không dùng được khi khởi tạo biến với giá trị `null` mà không nêu kiểu, vì trình biên dịch không suy ra được kiểu:
```java
// This will not compile because the type cannot be inferred
var myVar = null;
```

Tuy nhiên, một khi `var` đã được dùng để khai báo biến với kiểu cụ thể, biến đó vẫn gán lại được giá trị `null`:
```java
var myString = "Hello, World!"; // Inferred as String
myString = null; // This is allowed
```

Cuối cùng, khi dùng `var` với khởi tạo mảng, bắt buộc phải khởi tạo tường minh. Bạn không dùng được cú pháp rút gọn vì trình biên dịch không suy ra được kiểu:
```java
var numbers = new int[] {1, 2, 3}; // This works
// var numbers = {1, 2, 3}; // This will not compile
```

## Inheritance (Kế thừa)

### Giới thiệu về inheritance

Inheritance (kế thừa) là một trong những khái niệm cốt lõi của lập trình hướng đối tượng. Nó cho phép bạn định nghĩa một class mới dựa trên một class đã có. Class mới thừa hưởng các attribute và method của class cũ, giúp bạn tái sử dụng mã và xây dựng quan hệ phân cấp giữa các class.

Bạn còn nhớ class `Cookie` ở đầu chương trước chứ?

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

Bạn sẽ định nghĩa class bánh quy sô-cô-la chip thế nào?

Bánh quy chocolate chip có hương vị, số lượng chip, và ăn được như bánh quy thường. Nhưng chúng còn có thêm thuộc tính riêng như số chip trên mỗi cái bánh. Nên class `ChocolateChipCookie` ngây thơ ban đầu có thể trông như sau:

```java
public class ChocolateChipCookie {

  String flavor;  
  int size;

  void eat() {
    System.out.println("That was yummy!"); 
  }

  int chips;

}
```

Chúng ta đã nhân bản lại các attribute và method của cookie! Đây không phải thiết kế tốt.

Đây chính là lúc khái niệm inheritance bước vào OOP.

Mọi loại bánh quy đều chia sẻ những thuộc tính chung như có hương vị và ăn được. Ta biểu diễn điều đó bằng class cha `Cookie` chứa `flavor`, `size` và method `eat()`.

Các class con, như `ChocolateChipCookie`, khi đó thừa hưởng những thành phần chung này từ class cha `Cookie`. Bằng cách này, ta tạo được nhiều biến thể cụ thể mà vẫn kế thừa các thuộc tính chung. Các class con vẫn định nghĩa được attribute chuyên biệt riêng, như số lượng chocolate chip, nhưng tái sử dụng mã kế thừa từ lớp cha.

Trong Java, bạn dùng keyword `extends` để tạo lớp con kế thừa từ lớp cha. Đây là cách định nghĩa class `ChocolateChipCookie` dùng inheritance:

```java
public class ChocolateChipCookie extends Cookie {

  int chips;

  public void addChips(int chipsPerCookie) {
    this.chips += chipsPerCookie;
  }

}  
```

Ở đây, `ChocolateChipCookie` là lớp con của `Cookie`. Nó kế thừa field `flavor`, `size` và method `eat()`. Lớp con khai báo được method riêng, như cách `ChocolateChipCookie` khai báo method `addChips()`.

Tuy nhiên, lớp con **không** truy cập trực tiếp được thành phần `private` của lớp cha. Lớp con chỉ truy cập trực tiếp được thành phần `protected` và `public` của lớp cha. Để truy cập field `private`, lớp cha phải cung cấp accessor `public` hoặc `protected`.

Một điều quan trọng cần biết là trong Java, một class chỉ extends được từ **một** class, do lựa chọn thiết kế nhằm tránh sự phức tạp và nhập nhằng của đa kế thừa. Nói cách khác, đa kế thừa — nơi một class extends nhiều class — có thể dẫn tới:

1. **Vấn đề kim cương (Diamond Problem):** Đây là rắc rối nổi tiếng khi một class kế thừa từ hai class vốn có chung một lớp cơ sở. Kịch bản này tạo ra nhập nhằng trong cây phân cấp kế thừa khi hai lớp cha có method cùng signature, vì hệ thống có thể không xác định được nên dùng phiên bản nào.

2. **Tăng độ phức tạp:** Cho phép đa kế thừa khiến việc thiết kế và bảo trì chương trình phức tạp hơn. Việc hiểu luồng đi của method và biến trở nên khó hơn, đặc biệt trong những codebase lớn.

Một số class modifier quan trọng liên quan tới inheritance là `final`, `abstract` và `sealed`.

Class `final` không thể bị kế thừa. Nếu bạn cố extends một class `final`, bạn sẽ gặp lỗi biên dịch. Với ví dụ cookie, nếu class `Cookie` được khai báo `final`:

```java
public final class Cookie {
    // ...
}
```

Thì khai báo class `ChocolateChip` sẽ sinh lỗi biên dịch.

Đánh dấu class là `final` đảm bảo phần cài đặt của nó không bị thay đổi bằng cách kế thừa. Tuy nhiên, trái với một hiểu lầm phổ biến, class `final` **không** chạy nhanh hơn lúc runtime chỉ vì chúng là `final`. Modifier `final` liên quan tới kế thừa, không liên quan tới hiệu năng.

Abstract class không thể được khởi tạo, chỉ có thể được kế thừa. Chúng tự thân là không hoàn chỉnh và cần được extends mới dùng được. Abstract class thường chứa abstract method — những method không có phần cài đặt trong abstract class và bắt buộc phải được lớp con cụ thể cài đặt. Cố tạo instance của abstract class bằng `new` sẽ gây lỗi biên dịch.

Sealed class cung cấp một điểm trung gian giữa class final và class thường. Sealed class extends được, nhưng chỉ bởi những class được cho phép tường minh trong khai báo sealed class. Điều này cho bạn quyền kiểm soát chi tiết đối với kế thừa. Lớp con của sealed class bản thân nó phải được khai báo là `sealed`, `non-sealed` hoặc `final`. Sealed class hạn chế chứ không cấm hoàn toàn kế thừa như class final.

Hãy xem xét kỹ hơn abstract class và sealed class.

### Abstract class

Abstract class là class không thể được khởi tạo, nghĩa là bạn không tạo được instance mới của nó. Nó đóng vai trò nền tảng cho các lớp con:
```java
abstract class Cookie {
    abstract void flavor(); 
}
```

Bạn phải dùng keyword `abstract` để khai báo một class hay một method là trừu tượng. Abstract class có thể có hoặc không có abstract method.

Abstract method được khai báo mà không có phần cài đặt (không có ngoặc nhọn, kết thúc bằng dấu chấm phẩy):
```java
abstract void flavor();
```

Abstract method tương tự method thông thường ở chỗ bạn khai báo chúng có hoặc không có tham số, có giá trị trả về hoặc `void`, và với bất kỳ access modifier nào như `public`, `protected` hay default. Khác biệt duy nhất là abstract method không có phần cài đặt, không có thân, do đó kết thúc bằng dấu chấm phẩy (`;`) chứ không phải cặp ngoặc nhọn (`{}`).

Để dùng abstract class, bạn phải kế thừa nó từ một class khác bằng keyword `extends`. Xem ví dụ:
```java
class OatmealRaisinCookie extends Cookie {
    void flavor() {
        System.out.println("Oatmeal and raisin flavor");
    }
}
```

Khi kế thừa từ abstract class, lớp con thường cung cấp phần cài đặt cho tất cả abstract method của lớp cha. Nếu không, lớp con cũng phải được khai báo là abstract:
```java
abstract class Cookie {
    abstract void flavor();
    
    public void bake() {
        System.out.println("Cookie is baking");
    }
}

abstract class OatmealRaisinCookie extends Cookie {
    // Abstract method which makes the class abstract
    // (Otherwise it will not compile)
    abstract void flavor();
    
    // Even if it defines concrete method(s)
    public void addRaisins() {
        System.out.println("Adding raisins");
    }
}
```

Tại sao?

Vì abstract class là (hoặc được dự định là) không hoàn chỉnh. Tạo object từ một class không hoàn chỉnh sẽ là sai. Abstract class cần được extends mới dùng được, rất giống một khuôn mẫu.

Abstract class hữu ích để chia sẻ mã giữa những class có quan hệ gần gũi. Quan trọng hơn, abstract class định nghĩa được những method mà lớp con bắt buộc phải cài đặt, thiết lập một hợp đồng hay giao ước mà lớp con phải tuân theo.

Nên nghĩ về concrete class như những chuyên biệt hoá của abstract class. Giống như xe cỡ nhỏ là chuyên biệt hoá của khái niệm chung "xe hơi", abstract class là khái niệm chung còn concrete class là một cài đặt cụ thể của khái niệm ấy.

Concrete class phải cài đặt mọi abstract method nhưng cũng định nghĩa được method mới của riêng nó. Không phải mọi method trong concrete class đều phải abstract, chỉ những method được khai báo abstract ở lớp cha. Đây là ví dụ minh hoạ:

```java
abstract class Cookie {
    abstract void flavor();
    
    public void bake() {
        System.out.println("Cookie is baking");
    }
}

class ChocolateCookie extends Cookie {
    // Implementing the abstract method
    void flavor() {
        System.out.println("Chocolate flavor");
    }
    
    // Defining its own new method
    public void addChocolateChips() {
        System.out.println("Adding chocolate chips");
    }
}

class OatmealRaisinCookie extends Cookie {
    // Implementing the abstract method
    void flavor() {
        System.out.println("Oatmeal and raisin flavor");
    }
    
    // Defining its own new method
    public void addRaisins() {
        System.out.println("Adding raisins");
    }
}
```

Trong ví dụ này, `Cookie` là abstract class với một abstract method `flavor()` và một concrete method `bake()`.

Class `ChocolateCookie` và `OatmealRaisinCookie` là concrete class extends abstract class `Cookie`. Cả hai đều cài đặt abstract method `flavor()` kế thừa từ `Cookie`. Xin nhắc lại, điều này là bắt buộc, nếu không chúng cũng sẽ phải được khai báo abstract.

Nhưng `ChocolateCookie` và `OatmealRaisinCookie` cũng định nghĩa method mới của riêng chúng, lần lượt là `addChocolateChips()` và `addRaisins()`. Những method này đặc thù cho từng loại bánh và không liên quan tới abstract class.

Khi bạn tạo instance của `ChocolateCookie` và `OatmealRaisinCookie`, bạn gọi được tất cả method của chúng:

```java
ChocolateCookie chocolateCookie = new ChocolateCookie();
chocolateCookie.flavor();          // Output: Chocolate flavor
chocolateCookie.addChocolateChips();  // Output: Adding chocolate chips
chocolateCookie.bake();            // Output: Cookie is baking

OatmealRaisinCookie oatmealRaisinCookie = new OatmealRaisinCookie();
oatmealRaisinCookie.flavor();      // Output: Oatmeal and raisin flavor
oatmealRaisinCookie.addRaisins();  // Output: Adding raisins
oatmealRaisinCookie.bake();        // Output: Cookie is baking
```

Abstract class có thể có constructor. Bạn cần chúng để khởi tạo attribute và chạy bất kỳ logic nào cần chạy khi một instance của lớp con cụ thể được tạo. Abstract class vẫn là một class, và như mọi class khác, nó có attribute và những attribute đó có thể cần được khởi tạo khi một instance (của concrete class) được tạo. Ví dụ:

```java
abstract class Cookie {
    protected String name;
    
    public Cookie(String name) {
        this.name = name;
        System.out.println("Cookie constructor is called");
    }
    
    abstract void flavor();
    
    public void bake() {
        System.out.println(name + " is baking");
    }
}
```

Trong ví dụ cập nhật này, abstract class `Cookie` giờ có constructor nhận tham số `name`. Nó khởi tạo attribute `name` của bánh. Attribute `name` được khai báo `protected`, nghĩa là lớp con truy cập được.

Nhờ vậy, các concrete class `ChocolateCookie` và `OatmealRaisinCookie` gọi được constructor của abstract class `Cookie` bằng `super()`, truyền vào tên cụ thể cho từng loại bánh. Chúng ta sẽ xem cách dùng `super()` ở phần sau của chương này.

Khi bạn xem abstract class như một hợp đồng hay khuôn mẫu mà lớp con phải tuân theo và hoàn thiện để đảm bảo hành vi chung, những quy tắc sau trở nên hợp lý:

- Abstract class không thể là `final`. Modifier `final` ngăn class bị kế thừa, điều này mâu thuẫn với bản chất của abstract class — nó phải được kế thừa mới dùng được. Nên không, đánh dấu abstract class là `final` không làm nó an toàn hơn, mà làm nó vô dụng.

- Abstract method cũng không thể là `final`, vì cùng lý do: chúng phải được override ở lớp con.

- Abstract method không thể là native hay `synchronized`, vì những lý do hơi khác. Native method được cài đặt bằng ngôn ngữ khác như C++ trong JVM, nên nó vốn đã có phần cài đặt. Chúng ta sẽ bàn về method `synchronized` ở chương sau, nhưng modifier `synchronized` dùng để điều phối truy cập đa luồng, và để làm được điều đó method cần có thân, cần có phần cài đặt.

- Abstract method không thể là `private`. Việc một method bắt buộc phải được cài đặt bởi lớp con ở class khác lại không nhìn thấy được bởi class đó là vô lý. Nên không, abstract method `private` không tồn tại.

- Cuối cùng, abstract method cũng không thể là `static`. Static method thuộc về chính class chứ không thuộc instance nào. Abstract method chỉ hữu ích khi được lớp con cài đặt, nghĩa là được dùng bởi một instance.

Tóm lại, đây là các quy tắc khai báo abstract class và abstract method cho đúng:

- Nếu class chứa một hoặc nhiều abstract method, class đó phải được khai báo là abstract.

- Abstract class có thể có cả method abstract lẫn method không abstract (concrete).

- Abstract class có thể extends một class abstract hoặc concrete khác, và abstract class có thể bị extends bởi một class abstract hoặc concrete khác.

- Lớp con có thể override một concrete method của lớp cha và khai báo nó là abstract.

- Một lớp con abstract có thể override một phần hoặc không override abstract method nào của lớp cha, nhưng lớp con concrete đầu tiên phải cài đặt tất cả.

Bây giờ, trước khi bàn về sealed class, hãy xem chủ đề interface.

### Interface

Về lập trình hướng đối tượng, ngoài class, Java còn cung cấp một công cụ mạnh mẽ khác: **interface**. Interface trong Java về bản chất là một hợp đồng định nghĩa tập method mà một class phải cài đặt. Nó giống thực đơn ở nhà hàng. Thực đơn liệt kê các món có sẵn nhưng không nêu chi tiết cách chế biến. Khi bạn gọi một món từ thực đơn, nhà bếp (class) cung cấp cách chế biến cụ thể cho món đó (method).

Vậy chính xác interface là gì và nó khác class thường hay thậm chí abstract class ở chỗ nào?

Interface trong Java là một kiểu tham chiếu, tương tự class, chỉ có thể chứa hằng số, method signature, default method, static method và nested type. Interface không thể được khởi tạo; chúng chỉ có thể được class implement hoặc được interface khác extends.

Để khai báo interface, bạn dùng keyword `interface` thay cho keyword `class`. Ví dụ:

```java
public interface Drawable {
    void draw();
}
```

Bất kỳ class nào implement interface `Drawable` đều phải cung cấp phần cài đặt cho method `draw()`.

Thoạt nhìn, interface có vẻ rất giống abstract class. Dù sao thì cả hai đều chứa được abstract method — method không có thân. Tuy nhiên có vài khác biệt then chốt:
- Abstract class có instance variable và constructor, còn interface thì không.

- Abstract class có method không abstract, trong khi mọi method trong interface đều ngầm định là abstract (trừ default method và static method, sẽ bàn sau).

- Một class chỉ extends được một abstract class, nhưng implement được nhiều interface.

Vậy nên dù có phần chồng lấn, interface và abstract class phục vụ mục đích khác nhau và không thay thế cho nhau được.

Để dùng interface, một class phải implement nó. Keyword `implements` được dùng để cài đặt interface:

```java
public class Circle implements Drawable {
    public void draw() {
        System.out.println("Drawing a circle");
    }
}
```

Nếu một class implement interface nhưng không cài đặt hết các method, nó phải được khai báo là `abstract`.

```java
public abstract class Shape implements Drawable {
    // Class content
}
```

Mọi method trong interface đều ngầm định là `public` và `abstract`. Bạn không cần dùng keyword `public` hay `abstract` khi khai báo method trong interface.

Mọi biến khai báo trong interface đều ngầm định là `public`, `static` và `final`.

Vậy đoạn này:

```java
public interface MyInterface {
    int NUMBER = 10;
    void method();
}
```

Tương đương với đoạn này:

```java
public interface MyInterface {
    public static final int NUMBER = 10;
    public abstract void method();
}
```

Cần lưu ý rằng vì method của interface là `abstract`, chúng không thể khai báo là `private`, `protected`, `final` hay `static` (trừ static method, sẽ bàn sau).

Một interface có thể extends interface khác, tương tự việc một class extends class khác. Keyword `extends` được dùng cho việc này:

```java
public interface Moveable {
    void move();
}

public interface Drawable extends Moveable {
    void draw();
}
```

Trong trường hợp này, bất kỳ class nào implement `Drawable` đều phải cung cấp cài đặt cho cả `draw()` lẫn `move()`.

Một class chỉ extends được từ một class. Tuy nhiên, một class implement được nhiều interface. Đây là cách đạt được một dạng đa kế thừa trong Java:

```java
public interface Moveable {
    void move();
}

public interface Drawable {
    void draw();
}

public class Circle implements Drawable, Moveable {
    public void draw() {
        System.out.println("Drawing a circle");
    }

    public void move() {
        System.out.println("Moving a circle");
    }
}
```

Điều này không vi phạm quy tắc đơn kế thừa của Java vì interface không chứa phần cài đặt nào. Nếu một class implement hai interface có cùng method, đó không phải vấn đề. Class chỉ đơn giản cung cấp một cài đặt duy nhất cho method đó, giải quyết được nhập nhằng và phức tạp:

```java
public interface A {
    void method();
}

public interface B {
    void method();
}

public class C implements A, B {
    public void method() {
        System.out.println("Method implementation");
    }
}
```

Ngoài ra, interface có thể có **default method**. Đây là những method có thân, cung cấp phần cài đặt mặc định nếu class không override chúng:

```java
public interface Drawable {
    void draw();
    default void print() {
        System.out.println("Printing...");
    }
}
```

Class implement `Drawable` có thể override method `print()`, nhưng không bắt buộc.

Nếu một class implement hai interface và cả hai đều có cùng default method, class đó bắt buộc phải override method ấy. Nếu muốn gọi default method từ một trong hai interface, nó dùng được keyword `super`:

```java
public interface A {
    default void method() {
        System.out.println("A's method");
    }
}

public interface B {
    default void method() {
        System.out.println("B's method");
    }
}

public class C implements A, B {
    public void method() {
        A.super.method();
    }
}
```

Interface cũng có thể có static method, tương tự static method trong class:

```java
public interface Drawable {
    static void staticMethod() {
        System.out.println("Static method");
    }
}
```

Static method trong interface **không** được kế thừa bởi class hay interface extends interface đó.

Với ví dụ trên, bạn dùng chính interface `Drawable` để gọi `staticMethod` như sau:

```java
Drawable.staticMethod();
```

Ngoài default method và static method, interface còn có thể có method `private`. Chúng hữu ích để chia sẻ mã giữa các default method trong interface:

```java
public interface Drawable {
    default void print() {
        printLine();
        System.out.println("Printing...");
    }

    private void printLine() {
        System.out.println("---");
    }
}
```

Method `private` trong interface không truy cập được bởi các class implement interface đó.

### Sealed class

Hãy tưởng tượng một hoàng gia có quy định nghiêm ngặt: chỉ một số người nhất định mới được trở thành vua hay nữ hoàng tương lai, và quy định này không thể thay đổi. Trong Java, sealed class giống hoàng gia đó. Chúng cho phép một class kiểm soát chặt chẽ những class nào được phép kế thừa nó, hệt như hoàng gia kiểm soát ai được nằm trong danh sách kế vị.

Vậy nếu một class là sealed thì có nghĩa nó bị khoá hoàn toàn và không ai extends được? Không hẳn. Sealed class chỉ đơn giản hạn chế ai được extends nó, chứ không cấm tiệt. Bạn được chỉ định một tập lớp con được phép.

Tính năng này hữu ích vì nhiều lý do:
- Cho phép tác giả thư viện phát triển API theo thời gian mà tránh được những phần mở rộng ngoài ý muốn.
- Cho phép mô hình hoá cây phân cấp và máy trạng thái với một tập lớp con hữu hạn.
- Cung cấp an toàn tại thời điểm biên dịch bằng cách giới hạn khả năng của mã bên ngoài.

Để tạo sealed class, bạn dùng modifier `sealed` trong khai báo class, cùng mệnh đề `permits` để chỉ định các lớp con được phép:

```java
public sealed class Vehicle permits Car, Truck, Motorcycle {
    public void startEngine() {
        System.out.println("Starting the vehicle's engine.");
    }
}

final class Car extends Vehicle {
    @Override
    public void startEngine() {
        System.out.println("Starting the car's engine.");
    }
}

final class Truck extends Vehicle {
    @Override
    public void startEngine() {
        System.out.println("Starting the truck's engine.");
    }
}

final class Motorcycle extends Vehicle {
    @Override
    public void startEngine() {
        System.out.println("Starting the motorcycle's engine." );
    }
}
```

Modifier `sealed` cho biết class là sealed. Mệnh đề `permits` liệt kê những class được phép extends sealed class đó.

Sealed class và các lớp con phải được khai báo trong cùng package (hoặc cùng named module) với các lớp con trực tiếp của nó. Điều này đảm bảo mối quan hệ gần gũi giữa sealed class và các lớp con được phép.

Mọi class extends trực tiếp một sealed class phải chỉ định **đúng một** trong ba modifier sau: `final`, `sealed` hoặc `non-sealed`:

- `final`: Lớp con không thể bị extends thêm nữa. Đây là lựa chọn hạn chế nhất.
- `sealed`: Lớp con cũng là sealed và phải chỉ định danh sách lớp con được phép của riêng nó.
- `non-sealed`: Lớp con mở cho việc extends bởi những lớp con chưa biết trước. Đây là lựa chọn thoáng nhất.

Nếu bạn không chỉ định một trong các modifier này ở lớp con trực tiếp của sealed class, bạn sẽ gặp lỗi biên dịch. Trình biên dịch ép buộc điều này để đảm bảo cây phân cấp được định nghĩa rõ ràng.

Đánh dấu một lớp con là `non-sealed` chỉ đơn giản nghĩa là nó mở cho việc extends. Nó không bắt buộc bạn phải thực sự tạo lớp con mới. Lỡ dùng `non-sealed` mà không thêm lớp con nào cũng không hỏng gì, nhưng nó báo hiệu cho lập trình viên khác rằng ý định của bạn là cho phép class được extends.

Mệnh đề `permits` là tuỳ chọn nếu sealed class và các lớp con trực tiếp của nó được khai báo trong cùng một file, hoặc các lớp con được lồng bên trong sealed class. Trong những trường hợp đó trình biên dịch suy ra được danh sách lớp con được phép, nên bạn bỏ được phần liệt kê tường minh.

Đây là ví dụ bỏ mệnh đề `permits`:

```java
// Beverage.java
public sealed class Beverage {
    void pour();
}

final class Coffee implements Beverage {
    public void pour() {
        System.out.println("Pouring coffee");
    } 
}

final class Tea implements Beverage {
    public void pour() {
        System.out.println("Pouring tea");
    }
}
```

Vì `Coffee` và `Tea` được khai báo trong cùng file với sealed class `Beverage` (`Beverage.java`), trình biên dịch suy ra được mệnh đề `permits`.

Vậy sealed class chỉ dùng được trong cùng một file thôi sao? Không, sealed class và các lớp con của nó nằm ở những file khác nhau được, miễn là cùng package hoặc cùng module. Hạn chế cùng file chỉ liên quan tới việc bỏ mệnh đề `permits`.

Và để trả lời một câu hỏi phổ biến khác: "Nếu tôi seal một class, tôi không dùng được nó ở package khác đúng không?" Bạn **dùng** được sealed class từ package khác, nhưng bạn không **khai báo lớp con** của nó ở package khác được. Việc sử dụng không bị hạn chế, chỉ việc mở rộng mới bị.

Dù sao đi nữa, một khi class đã được seal, tập lớp con được phép là cố định. Bạn không thêm được lớp con mới ngoài danh sách trong mệnh đề `permits`. Nếu sau này cần mở rộng cây phân cấp, bạn phải sửa sealed class để cho phép thêm lớp con. Việc này đòi hỏi biên dịch lại sealed class cùng các lớp con hiện có.

Nếu bạn thắc mắc có giới hạn số lớp con mà một sealed class được phép hay không, câu trả lời là không, không có giới hạn cứng. Tuy nhiên, ý đồ của sealed class là có một tập lớp con hữu hạn và quản lý được. Cho phép hàng trăm lớp con sẽ đi ngược tinh thần đó và nhiều khả năng cho thấy vấn đề trong thiết kế. Hãy giữ ở con số hợp lý phù hợp với bài toán của bạn.

Việc seal không chỉ giới hạn ở class. Bạn seal được cả interface.

Interface có thể được seal để giới hạn những class implement nó hoặc những interface extends nó. Ví dụ:

```java
public sealed interface Shape permits Circle, Rectangle, Triangle, Polygon {
    double getArea();
}

final class Circle implements Shape {
    public double getArea() {
        // Implementation of getArea() for circles
    }
}

final class Rectangle implements Shape {
    public double getArea() {
        // Implementation of getArea() for rectangles
    }
}

final class Triangle implements Shape {
    public double getArea() {
        // Implementation of getArea() for triangles
    }
}

sealed interface Polygon extends Shape permits RegularPolygon, IrregularPolygon {
    int getNumberOfSides();
}

final class RegularPolygon implements Polygon {
    public double getArea() {
        // Implementation of getArea() for regular polygons
    }
    
    public int getNumberOfSides() {
        // Implementation of getNumberOfSides() for regular polygons
    }
}

final class IrregularPolygon implements Polygon {
    public double getArea() {
        // Implementation of getArea() for irregular polygons
    }
    
    public int getNumberOfSides() {
        // Implementation of getNumberOfSides() for irregular polygons
    }
}
```

Trong ví dụ này, interface `Shape` là sealed và cho phép bốn class implement nó: `Circle`, `Rectangle`, `Triangle` và `Polygon`. Nghĩa là chỉ bốn class này mới implement trực tiếp được interface `Shape`.

Nhưng interface `Polygon` cũng là sealed và extends interface `Shape`. Nó cho phép hai class implement nó: `RegularPolygon` và `IrregularPolygon`. Điều này minh hoạ cách dùng seal để kiểm soát interface nào được phép extends một sealed interface.

Bằng cách seal interface `Polygon`, ta giới hạn các class implement nó chỉ còn `RegularPolygon` và `IrregularPolygon`. Không class nào khác implement trực tiếp `Polygon` được. Tuy nhiên, vì `Polygon` extends `Shape`, hai class `RegularPolygon` và `IrregularPolygon` cũng gián tiếp implement `Shape`.

Điều này tạo ra cấu trúc kế thừa được định nghĩa rõ ràng và có ràng buộc.

Những điều trên cũng áp dụng cho class: bạn đổi interface `Shape` thành class và chỉnh sửa các class còn lại cho phù hợp là đạt được cấu trúc phân cấp tương tự.

Tóm lại, đây là các quy tắc then chốt của sealed class:

1. Sealed class được khai báo với modifier `sealed` và `permits`.

2. Sealed class phải được khai báo trong cùng package hoặc cùng named module với các lớp con trực tiếp của nó.

3. Lớp con trực tiếp của sealed class phải được đánh dấu `final`, `sealed` hoặc `non-sealed`.

4. Mệnh đề `permits` là tuỳ chọn nếu sealed class và các lớp con trực tiếp được khai báo trong cùng một file, hoặc các lớp con được lồng bên trong sealed class.

5. Interface có thể được seal để giới hạn những class implement nó hoặc những interface extends nó.

### Tham chiếu `this`

Khi viết mã Java, bạn sẽ thường thấy keyword `this` rải rác trong các method và constructor. Nhưng chính xác `this` là gì, và tại sao ta dùng nó?

`this` là tham chiếu tới instance hiện tại của class. Nói cách khác, khi bạn đang ở bên trong một method hay constructor của class, `this` trỏ tới chính object mà method/constructor đó thuộc về. Ví dụ đơn giản:

```java
public class Person {
    private String name;
    
    public Person(String name) {
        this.name = name;
    }
}
```

Trong constructor, ta dùng `this.name` để nói rõ rằng ta đang nói tới field `name` của chính object `Person` này, chứ không phải một biến `name` nào khác.

Nhưng khoan, bạn có thể nghĩ: "Vậy `this` chỉ là một biến khác mà tôi thay đổi được, đúng không?" Không hẳn. `this` là một tham chiếu final, nghĩa là bạn không gán nó cho thứ khác được. Nó luôn trỏ tới instance object hiện tại.

`this` không dùng được ở mọi nơi trong mã, ví dụ trong static method. Nó chỉ có ý nghĩa trong ngữ cảnh của instance method hoặc constructor. Static method thuộc về chính class chứ không thuộc instance cụ thể nào, nên `this` không mang ý nghĩa gì ở đó.

Vậy bạn có phải dùng `this` mỗi khi tham chiếu tới attribute hay method không, bất kể tình huống? Không nhất thiết. Nếu không có nhập nhằng, bạn thường bỏ được `this`. Tuy nhiên, có lúc dùng `this` khiến mã rõ ràng hơn và tránh nhầm lẫn. Ví dụ:

```java
public class Person {
    private String name;
    
    public Person(String name) {
        this.name = name;
    }
    
    public void introduce(Person other) {
        System.out.println("Hi " + other.name + ", I'm " + this.name);
    }
}
```

Ở đây, dùng `this.name` làm rõ rằng ta đang nói tới `name` của instance `Person` hiện tại, chứ không phải của `other`.

Một số tình huống bắt buộc phải dùng `this`:
- Để phân biệt biến cục bộ với instance variable trùng tên
- Để truyền instance hiện tại làm đối số cho một method
- Để gọi một constructor khác từ bên trong constructor

Nói về constructor, bạn không dùng `this` để gọi constructor từ bất kỳ đâu trong class được. Bạn chỉ dùng `this` để gọi constructor khác từ bên trong một constructor, và nó phải là câu lệnh đầu tiên:

```java
public class Person {
    private String name;
    private int age;
    
    public Person(String name) {
        this(name, 0);
    }
    
    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }
}
```

Cách này hữu ích khi bạn có nhiều constructor và muốn tránh lặp mã.

Tuy nhiên có một quy tắc: nếu bạn dùng `this` để gọi constructor khác, nó phải là câu lệnh **đầu tiên** trong constructor. Quy tắc này đảm bảo constructor kia được gọi trước khi thực thi bất kỳ mã nào trong constructor chứa lời gọi `this`, ngăn việc dùng field chưa khởi tạo hoặc lặp mã khởi tạo. Ví dụ, đoạn sau sẽ không biên dịch được:
```java
public class Person {
    private String name;
    private int age;
    
    public Person(String name) {
        System.out.println("Person(String) Constructor Called");
        // The following line will cause a compilation error
        this(name, 0); // ERROR: Constructor call must be the first statement in a constructor
    }
    
    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }
}
```

Ngoài ra, nhớ rằng `this` không trỏ tới chính class. `this` trỏ tới instance hiện tại. Mỗi instance có tham chiếu `this` riêng. Nó không bao giờ là `null`.

Điều này cũng có nghĩa `this` được dùng cho instance member. Static field và static method thuộc về chính class chứ không thuộc instance cụ thể nào, nên `this` không áp dụng được.

Thêm nữa, khi bạn dùng `this` bên trong một method, bạn đang tham chiếu tới instance object mà method đó thuộc về, chứ không phải bản thân method.

Cuối cùng, truyền `this` làm đối số rất hữu ích khi bạn muốn cho một method khác truy cập instance hiện tại. Ví dụ, bạn có thể truyền `this` vào method của một class khác để nó gọi ngược lại object gốc:

```java
public class Person {
    private String name;
    
    public Person(String name) {
        this.name = name;
    }
    
    public void introduceYourselfTo(IntroductionService service) {
        service.introduce(this);
    }
    
    public String getName() {
        return name;
    }
}

public class IntroductionService {
    public void introduce(Person person) {
        System.out.println("Hello, my name is " + person.getName());
    }
}
```

Trong ví dụ này ta có hai class: `Person` và `IntroductionService`.

Class `Person` có method `introduceYourselfTo` nhận một `IntroductionService` làm tham số. Bên trong method này, `this` (trỏ tới instance `Person` hiện tại) được truyền làm đối số cho method `introduce` của `IntroductionService`.

Class `IntroductionService` có method `introduce` nhận một `Person` làm tham số. Method này khi đó truy cập được method `getName()` của `Person` để in ra lời giới thiệu.

Đây là cách bạn dùng những class này:

```java
Person alice = new Person("Steve");
IntroductionService service = new IntroductionService();
alice.introduceYourselfTo(service);
```

Và kết quả là:
```
Hello, my name is Steve
```

### Tham chiếu `super`

Keyword `this` dùng để tham chiếu tới instance hiện tại của class. Nhưng nếu bạn muốn tham chiếu tới lớp cha mà class hiện tại kế thừa từ đó thì sao? Đó là lúc `super` xuất hiện.

Keyword `super` đóng vai trò tham chiếu tới lớp cha (superclass) của class hiện tại. Nó cho phép truy cập các thành phần của lớp cha (field, method và constructor).

Mục đích chính của `super` là phân biệt thành phần của lớp cha với thành phần của class hiện tại khi chúng trùng tên. Bằng cách đặt `super` trước tên thành phần, bạn chỉ rõ rằng bạn muốn dùng phiên bản của lớp cha chứ không phải phiên bản của class hiện tại.

Cú pháp dùng `super` rất đơn giản:
```java
super.memberName
```

Ở đây `memberName` có thể là field, method hoặc constructor của lớp cha.

Overriding trong Java là tính năng cho phép lớp con cung cấp một cài đặt riêng cho method vốn đã được lớp cha cung cấp.

Khi bạn override một method ở lớp con, bạn không xoá hay thay thế method gốc ở lớp cha. Method của lớp cha vẫn còn đó, nhưng khi bạn gọi method trên một object của lớp con, phiên bản override ở lớp con sẽ được thực thi. Vì vậy, khi override một method ở lớp con, đôi khi bạn muốn gọi phần cài đặt gốc từ lớp cha.

Trong trường hợp đó, bạn dùng `super` để gọi phiên bản của lớp cha:
```java
@Override
public void someMethod() {
    super.someMethod(); // Calls the superclass's implementation
    // Additional code specific to the subclass
}
```

Một tình huống dùng phổ biến khác của `super` là khi bạn muốn gọi constructor của lớp cha từ constructor của class hiện tại. Cũng như với `this`, bạn phải gọi `super()` như câu lệnh đầu tiên trong constructor:
```java
public class SubClass extends SuperClass {
    public SubClass() {
        super(); // Invokes the superclass constructor
        // Other initialization code
    }
}
```

Nếu không, bạn sẽ gặp lỗi biên dịch.

Nếu lớp cha không có constructor mặc định (không tham số), bạn sẽ phải gọi tường minh một constructor có tham số bằng `super(arguments)`. Bạn không dùng được `super` mà không nêu các đối số cần thiết.

Xét ví dụ sau:
```java
// Superclass without a default constructor
public class Person {
    private String name;
    private int age;

    // Constructor that requires parameters
    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }

    // Getter methods for name and age
    public String getName() {
        return name;
    }

    public int getAge() {
        return age;
    }
}

// Subclass that extends Person
public class Student extends Person {
    private String studentID;

    // Since Person does not have a default constructor, we must explicitly call a parameterized constructor
    public Student(String name, int age, String studentID) {
        super(name, age); // Calls the superclass constructor with arguments
        this.studentID = studentID;
    }

    // Getter method for studentID
    public String getStudentID() {
        return studentID;
    }
}
```

Trong constructor của `Student`, `super(name, age);` được dùng để gọi tường minh constructor có tham số của class `Person`. Điều này là bắt buộc vì `Person` không có constructor không tham số. Nếu bỏ lời gọi `super` này, mã sẽ không biên dịch được, vì Java sẽ cố gọi constructor mặc định của `Person` — thứ không tồn tại trong trường hợp này.

Bạn có thể thắc mắc: nếu tôi dùng `super` thì có nghĩa tôi không dùng được `this` trong cùng method sao? Câu trả lời là không. Bạn dùng được cả `this` lẫn `super` trong cùng một method, vì chúng phục vụ mục đích khác nhau. `this` trỏ tới instance hiện tại, còn `super` trỏ tới lớp cha.

Tuy nhiên, cần ghi nhớ rằng `super` **không** dùng để truy cập trực tiếp thành phần private (field hay method) của lớp cha. Thành phần private chỉ truy cập được trong chính class đó. Nếu cần truy cập, bạn phải dựa vào các method `public` hoặc `protected` mà lớp cha cung cấp.

Cuối cùng, cũng đáng lưu ý rằng dù `super` chủ yếu dùng để gọi method hay truy cập field của lớp cha trực tiếp, nó vẫn gián tiếp cho phép tương tác với cây kế thừa rộng hơn. Cụ thể, nếu lớp cha trực tiếp kế thừa method từ tổ tiên của nó (lớp ông bà trở lên), `super` gián tiếp truy cập được những method đó. Lý do là những method kế thừa từ lớp cha — thứ mà `super` gọi được — bản thân chúng có thể gọi method từ tổ tiên trong chuỗi kế thừa. Tuy nhiên, gọi trực tiếp method hay truy cập field của lớp ông bà trở lên bằng `super` là **không** thể. Để truy cập trực tiếp những method đó, bạn thường phải dựa vào các method kế thừa đã đóng gói chức năng ấy trong lớp cha trực tiếp của mình.

Xét ví dụ sau, mở rộng ví dụ trước bằng cách thêm class mới `GraduateStudent` kế thừa từ `Student`, và một lớp ông bà `Human` mà `Person` kế thừa từ đó:

```java
// Grandparent class
public class Human {
    private String nationality;

    public Human(String nationality) {
        this.nationality = nationality;
    }

    protected void sayHello() {
        System.out.println("Hello from Human!");
    }
}

// Parent class
public class Person extends Human {
    private String name;
    private int age;

    public Person(String name, int age, String nationality) {
        super(nationality); // Calls the Human constructor
        this.name = name;
        this.age = age;
    }

    // Overriding the sayHello method
    @Override
    protected void sayHello() {
        super.sayHello(); // Calls Human's sayHello
        System.out.println("Hello from Person!");
    }
}

// Current class
public class Student extends Person {
    private String studentID;

    public Student(String name, int age, String nationality, String studentID) {
        super(name, age, nationality); // Calls the Person constructor
        this.studentID = studentID;
    }

    // Overriding the sayHello method again
    @Override
    protected void sayHello() {
        super.sayHello(); // Calls Person's sayHello, which in turn calls Human's sayHello
        System.out.println("Hello from Student!");
    }
}

// New Subclass that extends Student
public class GraduateStudent extends Student {
    private String researchTopic;

    public GraduateStudent(String name, int age, String nationality, String studentID, String researchTopic) {
        super(name, age, nationality, studentID); // Calls the Student constructor
        this.researchTopic = researchTopic;
    }

    public void introduce() {
        super.sayHello(); // Calls Student's sayHello, which in turn calls Person's, and then Human's sayHello
        System.out.println("I am a graduate student working on " + researchTopic + ".");
    }
}

```

Trong ví dụ này, class `GraduateStudent` dùng `super.sayHello()` trong method `introduce`. Lời gọi này chạy method `sayHello` của class `Student`, mà bản thân nó override method `sayHello` của `Person`. Method `sayHello` của `Person` khi đó gọi `sayHello` của `Human`. Điều này minh hoạ cách `super` được dùng để gián tiếp truy cập method ngược lên chuỗi kế thừa, từ class `Human` tới class `GraduateStudent`, dù truy cập trực tiếp method của `Human` từ `GraduateStudent` bằng `super` là không thể.

Bây giờ hãy bàn kỹ hơn về overriding và polymorphism.

## Polymorphism (Đa hình)

### Giới thiệu về polymorphism

Polymorphism (đa hình) là một trong những trụ cột của lập trình hướng đối tượng, và là khái niệm mạnh mẽ trong Java. Nói đơn giản, polymorphism cho phép bạn xử lý object của các lớp con khác nhau như thể chúng là object của cùng một lớp cha. Nó giống như có một chiếc điều khiển từ xa duy nhất vận hành được nhiều loại thiết bị: TV, dàn âm thanh và đầu DVD. Cũng như chiếc điều khiển gửi tín hiệu tới từng thiết bị và thiết bị thực hiện chức năng khác nhau tuỳ theo loại, trong Java bạn dùng một kiểu tham chiếu duy nhất để tương tác với object của nhiều class khác nhau, cho phép chúng thực hiện hành vi riêng thông qua một giao diện chung.

Tuy nhiên, polymorphism không có nghĩa là method tuỳ tiện thay đổi hành vi. Thay vào đó, nó cho phép lớp con cung cấp cài đặt riêng cho method đã được định nghĩa ở lớp cha — khái niệm gọi là **method overriding**.

Như đã nói trước đó, khi bạn override một method ở lớp con, bạn không xoá hay thay thế method gốc ở lớp cha. Method của lớp cha vẫn còn đó, nhưng khi bạn gọi method trên một object của lớp con, phiên bản override ở lớp con sẽ được thực thi. Cần lưu ý overriding không giống với việc che khuất (hiding) thành phần — chúng ta sẽ bàn sau.

Để override một method cho đúng, method ở lớp con phải có cùng:
- Tên
- Kiểu trả về
- Danh sách tham số

như method ở lớp cha. Ví dụ:

```java
class Animal {
    public void makeSound() {
        System.out.println("The animal makes a sound");
    }
}

class Pig extends Animal {
    @Override
    public void makeSound() {
        System.out.println("Oink");
    }
}

class Duck extends Animal {
    @Override
    public void makeSound() {
        System.out.println("Quack");
    }
}
```

Và sơ đồ hình dung cây phân cấp này:
```
┌──────────────────────────────────────────┐
│            Animal makeSound()            │
└──────────────────────┬───────────────────┘
                       │
           ┌───────────┴─────────┐
           │                     │
┌──────────┴────────┐  ┌─────────┴─────────┐
│    Pig (Oink)     │  │   Duck (Quack)    │
└───────────────────┘  └───────────────────┘

```

Class `Animal` có method `makeSound()`. Class `Pig` và `Duck` extends `Animal` và override method `makeSound()` để cung cấp cài đặt riêng. Giờ hãy xem polymorphism hoạt động:

```java
Animal animal1 = new Pig();
Animal animal2 = new Duck();

animal1.makeSound(); // Output: Oink
animal2.makeSound(); // Output: Quack
```

Ở đây ta tạo hai biến kiểu `Animal`, nhưng gán cho chúng object của class `Pig` và `Duck`. Khi ta gọi method `makeSound()` trên từng biến, method override tương ứng ở lớp con được gọi. Đó chính là sức mạnh của polymorphism: khả năng xử lý object của các lớp con khác nhau như object của một lớp cha chung.

Cần hiểu rằng overriding không giống overloading. Overloading là việc có nhiều method cùng tên nhưng khác danh sách tham số trong cùng một class. Còn overriding là việc cung cấp cài đặt khác cho một method ở lớp con.

Một hiểu lầm phổ biến khác là overriding áp dụng cho mọi thành phần của class, kể cả biến. Điều đó không đúng. Overriding chỉ áp dụng cho method. Khi bạn khai báo một biến trùng tên ở lớp con, bạn thực chất đang **che khuất** (hiding) biến của lớp cha, chứ không phải override nó.

Hãy xem một số quy tắc liên quan tới overriding.

### Các quy tắc overriding

Có vài quy tắc bạn phải tuân theo khi override method từ lớp cha:

**Quy tắc #1: Method signature**  
Quy tắc đầu tiên và quan trọng nhất là method signature phải khớp chính xác giữa lớp cha và lớp con. Nghĩa là tên, tham số và kiểu trả về phải giống hệt nhau (với một ngoại lệ sẽ bàn sau). Bạn không thể tuỳ ý thay đổi tham số hay kiểu trả về:

```java
// Superclass
class Cookie {
    // Define a method 'eat' in the superclass
    public String eat() {
        return "Eating a plain cookie";
    }
}

// Subclass
class ChocolateChipCookie extends Cookie {
    // Override the 'eat' method in the subclass
    @Override
    public String eat() {
        return "Eating a chocolate chip cookie";
    }
}
```

Trong ví dụ này:
- Class `Cookie` định nghĩa method `eat` trả về `String`.

- Class `ChocolateChipCookie` extends `Cookie` và override method `eat`. Method override trong `ChocolateChipCookie` có cùng tên, cùng kiểu trả về và cùng danh sách tham số (ở đây là rỗng) như method của `Cookie`.

- Khi một instance của `ChocolateChipCookie` gọi `eat`, phiên bản override được thực thi, trả về `"Eating a chocolate chip cookie"`.

Tại sao method signature phải giữ nguyên? Hãy nghĩ về nó như một hợp đồng giữa lớp cha và lớp con. Lớp cha định nghĩa một method cụ thể mà lớp con có thể override nếu cần. Nếu bạn đổi signature, bạn phá vỡ hợp đồng đó. Method của lớp con sẽ không còn là bản override thực sự của method lớp cha nữa.

**Quy tắc #2: Access modifier**  
Khi override một method, bạn có thể làm access modifier **thoáng hơn**, nhưng không được **chặt hơn**. Ví dụ, bạn override được method `protected` của lớp cha và biến nó thành `public` ở lớp con. Nhưng bạn không làm ngược lại được, như đổi method `public` thành `private`:

```java
// Superclass
class Cookie {
    // Define a method with 'protected' access modifier in the superclass
    protected String recipe() {
        return "Default cookie recipe";
    }
}

// Subclass
class ChocolateChipCookie extends Cookie {
    // Override the 'recipe' method in the subclass and change the access modifier to 'public'
    @Override
    public String recipe() {
        return "Chocolate chip cookie recipe";
    }
}
```

Trong ví dụ này:
- Class `Cookie` định nghĩa method `recipe` với access modifier `protected`. Nghĩa là `recipe` chỉ truy cập được bên trong chính class, các lớp con, hoặc trong cùng package.

- Class `ChocolateChipCookie` extends `Cookie` và override method `recipe`, đổi access modifier thành `public` — thoáng hơn `protected`.

- Cố truy cập method `recipe` trực tiếp từ một instance `Cookie` sẽ gây lỗi biên dịch do kiểm soát truy cập `protected`. Nhưng truy cập `recipe` qua một instance của `ChocolateChipCookie` thì được, vì nó là `public`.

Điều này thường gây nhầm lẫn. Người ta nghĩ: "Đây là lớp con của tôi, sao tôi không được giới hạn quyền truy cập method nếu tôi muốn?" Nhưng điều đó đi ngược nguyên tắc rằng lớp con phải luôn dùng được ở bất kỳ đâu lớp cha được dùng. Nếu bạn siết quyền truy cập method ở lớp con, bạn phá vỡ tính tương thích này.

**Quy tắc #3: Checked exception**  
Chúng ta sẽ xem kỹ về exception ở chương sau, nhưng nếu method của lớp cha khai báo checked exception trong mệnh đề `throws`, method override ở lớp con chỉ được khai báo exception giống hệt hoặc cụ thể hơn. Nó không được thêm checked exception mới nào không phải lớp con của những exception mà lớp cha khai báo:

```java
class BakingException extends Exception {
    public BakingException(String message) {
        super(message);
    }
}

class OverBakingException extends BakingException {
    public OverBakingException(String message) {
        super(message);
    }
}

// Superclass
class Cookie {
    // Define a method that declares throwing a general BakingException
    public String bake() throws BakingException {
        return "Cookie is baked";
    }
}

// Subclass
class ChocolateChipCookie extends Cookie {
    // Override the 'bake' method, declaring a more specific exception, OverBakingException
    @Override
    public String bake() throws OverBakingException {
        return "Chocolate chip cookie is baked";
    }
}
```

Trong ví dụ này:
- `BakingException` là checked exception biểu diễn lỗi nướng bánh nói chung.

- `OverBakingException` là checked exception cụ thể hơn, báo hiệu bánh bị nướng quá lửa, và nó extends `BakingException`.

- Class `Cookie` có method `bake` khai báo có thể ném `BakingException`.

- Class `ChocolateChipCookie` override method `bake` và khai báo có thể ném `OverBakingException` — một lớp con của `BakingException`.

Người ta thường nghĩ mình được ném bất kỳ checked exception nào trong method override, nhất là khi lớp cha không khai báo exception nào. Nhưng không phải vậy. Một lần nữa, tất cả quy về hợp đồng do method lớp cha định nghĩa. Lớp con không thể đột ngột đưa vào những checked exception mới mà phía gọi không lường trước để xử lý.

**Quy tắc #4: Covariant return type**  
Đây chính là ngoại lệ của quy tắc về method signature. Method override được phép có **covariant return type**. Nghĩa là kiểu trả về có thể là lớp con của kiểu trả về mà method lớp cha khai báo. Tuy nhiên nó không được tự do trả về bất cứ thứ gì có liên hệ mơ hồ.

Ví dụ, nếu method lớp cha trả về `Number`, lớp con trả về `Integer` được, vì `Integer` là lớp con của `Number`. Nhưng nó không trả về `String` được, bất chấp mọi liên hệ mơ hồ nào với `Number` ban đầu. Kiểu trả về phải có quan hệ phân cấp trực tiếp đó.

Đây là ví dụ minh hoạ quy tắc này:

```java
class Cookie {
    // A method in the superclass that returns an instance of Cookie
    public Cookie getCookie() {
        return new Cookie();
    }
}

class ChocolateChipCookie extends Cookie {
    // An overriding method with a covariant return type
    // It returns ChocolateChipCookie, a subclass of Cookie
    @Override
    public ChocolateChipCookie getCookie() {
        return new ChocolateChipCookie();
    }
}
```

Trong ví dụ này:
- Class `Cookie` có method `getCookie` trả về một instance của `Cookie`.

- Class `ChocolateChipCookie` extends `Cookie` và override method `getCookie`. Kiểu trả về của method override là `ChocolateChipCookie`, một lớp con của `Cookie`. Việc đổi kiểu trả về này là ví dụ về covariant return type.

- Khi `getCookie` được gọi trên một instance của `ChocolateChipCookie`, nó trả về một instance `ChocolateChipCookie`, minh hoạ method override với covariant return type trong thực tế.

Được rồi.

Bạn có để ý annotation `@Override` trong tất cả các ví dụ trên không?

Annotation `@Override` đánh dấu tường minh những method có ý định override method của lớp cha. Nhưng dùng nó để làm gì? Chỉ cho rõ ràng, hay có mục đích thực sự?

Đúng là `@Override` khiến mã dễ đọc hơn bằng cách chỉ rõ đâu là method override, nhưng nó còn là lá chắn chống lỗi vô ý. Xét tình huống sau:

```java
class Cookie {
    public String recipe() {
        return "Default cookie recipe";
    }
}

class ChocolateChipCookie extends Cookie {
    @Override
    public String recipes() { // Oops, typo in the method name!
        return "Chocolate chip cookie recipe";
    }
}
```

Trong trường hợp này, lớp con định override `recipe` nhưng vô tình gõ nhầm thành `recipes`. Không có annotation `@Override`, đoạn mã này vẫn biên dịch bình thường. Lớp con đơn giản là có hai method riêng biệt: `recipe` kế thừa và `recipes` mới.

Nhưng với `@Override`, trình biên dịch bắt được lỗi và báo rằng `recipes` không override method nào cả. Annotation buộc trình biên dịch kiểm tra rằng method thực sự override một method của lớp cha, tạo thêm một lớp an toàn.

Vậy điều gì xảy ra nếu bạn khai báo lại một method private của lớp cha trong lớp con? Đó có được coi là overriding không? Câu trả lời là không. Method private hoàn toàn không được kế thừa, nên chẳng có gì để override cả.

Nếu bạn khai báo lại một method private ở lớp con, về bản chất đó là một method hoàn toàn riêng biệt chỉ tình cờ trùng tên. Nó không tương tác gì với method của lớp cha. Ví dụ:

```java
class Cookie {
    private String recipe() {
        return "Default cookie recipe";
    }
}

class ChocolateChipCookie extends Cookie {
    private String recipe() {
        return "Chocolate chip cookie recipe";
    }
}
```

Trong trường hợp này, `Cookie` và `ChocolateChipCookie` mỗi class có `recipe` riêng. Gọi `recipe` trên một instance `ChocolateChipCookie` sẽ luôn chạy phiên bản của lớp con, không bao giờ chạy phiên bản của lớp cha.

Một nguồn nhầm lẫn khác là khác biệt giữa **hiding** (che khuất) và **overriding** đối với static method. Khi bạn khai báo lại một method `static` ở lớp con, đó gọi là hiding chứ không phải overriding. Method của lớp con che khuất method của lớp cha, nhưng thực sự không override nó.

Khác biệt then chốt là overriding là khái niệm ở thời điểm chạy (runtime), còn hiding là khái niệm ở thời điểm biên dịch (compile-time). Với overriding, method cụ thể được gọi phụ thuộc vào kiểu object thực tế lúc chạy. Nhưng với hiding, method được gọi phụ thuộc vào kiểu tham chiếu lúc biên dịch.

Đây là ví dụ minh hoạ:

```java
class Cookie {
    public static String bake() {
        return "Cookie is baked";
    }
}

class ChocolateChipCookie extends Cookie {
    public static String bake() {
        return "Chocolate chip cookie is baked";
    }
}
```

Giờ xét đoạn mã sau:

```java
Cookie obj1 = new Cookie();
System.out.println(obj1.bake());  // Output: "Cookie is baked"

ChocolateChipCookie obj2 = new ChocolateChipCookie();
System.out.println(obj2.bake());  // Output: "Chocolate chip cookie is baked"

Cookie obj3 = new ChocolateChipCookie();
System.out.println(obj3.bake());  // Output: "Cookie is baked"
```

Ở trường hợp cuối, dù `obj3` thực chất là instance `ChocolateChipCookie` lúc chạy, kiểu tham chiếu vẫn là `Cookie`. Nên nó gọi method bị che khuất của `Cookie`, chứ không phải method của `ChocolateChipCookie`.

Tương tự static method, biến cũng bị che khuất được ở lớp con. Nếu lớp con khai báo một biến trùng tên với biến ở lớp cha, nó che khuất biến của lớp cha trong phạm vi lớp con.

Ví dụ:

```java
class Cookie {
    protected int size = 10;
}

class ChocolateChipCookie extends Cookie {
    private int size = 20;
}
```

Trong trường hợp này, biến `size` trong `ChocolateChipCookie` che khuất biến `size` của `Cookie`. Mọi tham chiếu tới `size` bên trong `ChocolateChipCookie` sẽ truy cập biến của lớp con, không phải của lớp cha.

Nhưng đây mới là phần khó nhằn: biến bị che khuất của lớp cha **không** biến mất. Nó vẫn còn đó và truy cập được qua tham chiếu kiểu lớp cha. Xét đoạn này:

```java
Cookie cookie = new ChocolateChipCookie();
System.out.println(cookie.size);  // Output: 10
```

Dù `cookie` thực chất là instance `ChocolateChipCookie`, biến được khai báo kiểu `Cookie`. Nên nó truy cập biến bị che khuất của `Cookie`, không phải của `ChocolateChipCookie`.

Điều này dễ gây nhầm lẫn và những lỗi tinh vi. Nói chung, tốt nhất là tránh hẳn việc che khuất biến. Nếu bạn cần "ghi đè" một biến của lớp cha, hãy cân nhắc dùng method getter/setter thay thế — chúng override được đàng hoàng.

Cuối cùng, hãy nói về keyword `final`. Khi áp dụng cho method, `final` ngăn method đó bị override ở lớp con. Về cơ bản nó khoá method lại, đảm bảo phần cài đặt giữ nguyên xuyên suốt cây phân cấp.

Một hiểu lầm phổ biến là lớp con hoàn toàn không truy cập được method `final`. Điều đó không đúng. Lớp con vẫn gọi và dùng được method `final`; chúng chỉ không override được thôi.

Ví dụ:

```java
class Cookie {
    public final void bake(int temp) {
        System.out.println("Baking at " + temp);
    }
}

class ChocolateChipCookie extends Cookie {
    // Attempting to override bake() will cause a compile error
    // @Override
    // public void bake(int temp) { ... }
    
    public void extras() {
        bake(350);  // Calling the final bake() method is allowed
    }
}
```

Method `bake()` trong `Cookie` là `final`, nên `ChocolateChipCookie` không override được. Nhưng nó vẫn gọi `bake()` bất cứ khi nào cần.

Vậy khi nào nên dùng method `final`? Chỉ khi bạn có lý do quan trọng để ngăn việc override. Lạm dụng `final` khiến mã cứng nhắc và khó mở rộng. Trong hầu hết trường hợp, tốt hơn là để method mở cho việc override, vì điều đó thúc đẩy tính linh hoạt và khả năng tái sử dụng.

### Truy cập object Java

Ở chương trước, bạn đã học rằng khi khai báo một field hay một biến, kiểu tham chiếu (reference type) là một chuyện, còn kiểu object (object type) lại là chuyện khác.

Xét điều đó, có ba cách chính để truy cập một object trong Java:
1. Dùng tham chiếu có cùng kiểu với object

2. Dùng tham chiếu là lớp cha của kiểu object

3. Dùng tham chiếu định nghĩa một interface mà class của object implement hoặc kế thừa

Hãy đi sâu vào từng cách.

**Dùng tham chiếu cùng kiểu với object.**

Cách truy cập object đơn giản nhất là dùng biến tham chiếu khớp chính xác kiểu của object.

Xét class này:
```java
class Dog {    
    public void bark() {
        System.out.println("Woof!");
    }
}
```

Và đoạn mã này:
```java
Dog myDog = new Dog();
myDog.bark(); // Can access all public methods of Dog
```

Ở đây, `myDog` là biến tham chiếu kiểu `Dog`, và nó trỏ tới một object `Dog`. Với cách này, ta truy cập trực tiếp được mọi method hay biến `public` định nghĩa trong class `Dog` qua tham chiếu `myDog`.

Nếu bạn thắc mắc liệu polymorphism có diễn ra khi kiểu tham chiếu và kiểu object trùng nhau không, câu trả lời là có. Ngay cả khi kiểu khớp nhau, polymorphism vẫn hoạt động ngầm bên dưới. Kiểu tham chiếu quyết định bạn gọi được method nào, còn kiểu object thực tế quyết định cài đặt nào của method đó được dùng lúc chạy.

**Dùng tham chiếu là lớp cha của object.**

Mọi thứ thú vị hơn khi ta đưa inheritance vào. Trong Java, hoàn toàn hợp lệ khi có một biến tham chiếu với kiểu là lớp cha của kiểu object thực tế.

Xét class này và lớp con của nó:
```java
class Animal {
    public void eat() {
        System.out.println("Animal is eating.");
    }
}

class Dog extends Animal {
    public void eat() {
        System.out.println("Dog is eating.");
    }
    
    public void bark() {
        System.out.println("Woof!");
    }
}
```

Ta viết được thế này:

```java
Animal myAnimal = new Dog();
```

Ở đây ta có một tham chiếu kiểu `Animal` trỏ tới object `Dog`. Vì `Dog` extends `Animal` nên điều này được phép. Nhưng nó có ý nghĩa gì với việc truy cập chức năng của object?

Khi bạn có tham chiếu kiểu lớp cha trỏ tới object lớp con, bạn truy cập được mọi method định nghĩa ở lớp cha, nhưng không truy cập được method riêng của lớp con. Nên ở ví dụ trên, ta gọi được `myAnimal.eat()` vì `eat()` được định nghĩa trong `Animal`, nhưng không gọi được `myAnimal.bark()` vì `bark()` chỉ được định nghĩa trong `Dog`. Kiểu tham chiếu giới hạn bạn ở những method mà kiểu đó định nghĩa. Tuy nhiên, Java cho ta một lối thoát: **casting** (ép kiểu).

Nếu bạn chắc chắn tham chiếu lớp cha của mình đang trỏ tới một object lớp con cụ thể, bạn ép kiểu tham chiếu sang kiểu lớp con đó rồi gọi method của lớp con:

```java
Dog myDog = (Dog) myAnimal; // Casting from Animal to Dog
myDog.bark(); // Now we can call Dog-specific methods
```

Ép kiểu về cơ bản nói rằng: "Tôi biết cái này trông như `Animal`, nhưng tin tôi đi, nó thực sự là `Dog`." Dĩ nhiên bạn phải cẩn thận: nếu ép sai lớp con, bạn sẽ nhận `ClassCastException` lúc chạy.

Chúng ta sẽ tiếp tục xem về casting ở phần sau, nhưng tóm lại, tham chiếu kiểu lớp cha cho bạn sự linh hoạt (bạn dùng được `Dog` ở bất cứ đâu cần `Animal`) nhưng lại hạn chế truy cập trực tiếp chức năng riêng của lớp con. Đây là khía cạnh then chốt của polymorphism trong Java.

**Dùng tham chiếu định nghĩa một interface mà object implement.**

Cách thứ ba để truy cập object trong Java là qua tham chiếu kiểu interface. Nếu một class implement một interface, bạn tham chiếu instance của class đó bằng biến kiểu interface được.

Xét interface này và các cài đặt của nó:
```java
interface Pet {
    void play();
}

class Dog implements Pet {
    public void play() {
        System.out.println("Dog is playing!");
    }
    
    public void bark() {
        System.out.println("Woof!");
    }
}

class Cat implements Pet {
    public void play() {
        System.out.println("Cat is playing!");
    }
    
    public void meow() {
        System.out.println("Meow!");
    }
}
```

Nhờ vậy ta viết được thế này:

```java
Pet myPet = new Dog();
```

Trong ví dụ này, `Dog` implement interface `Pet`, nên ta tạo được tham chiếu `Pet` và trỏ nó tới một object `Dog`.

Bạn có thể nghĩ: tạo tham chiếu interface tới một object nghĩa là tôi chỉ dùng được những method định nghĩa trong interface thôi sao? Câu trả lời là đúng. Khi bạn có tham chiếu interface, bạn chỉ gọi trực tiếp được những method định nghĩa trong interface đó, dù object thực tế có sẵn nhiều method khác.

```java
myPet.play(); // Valid, play() is defined in Pet
myPet.bark(); // Not valid, bark() is not part of Pet
```

Điều này nghe có vẻ hạn chế, nhưng thực ra là một tính năng mạnh. Bằng cách lập trình hướng interface, bạn viết được mã linh hoạt và dễ bảo trì hơn. Bạn đổi được kiểu object thực tế (ví dụ từ `Dog` sang `Cat`) mà không phải sửa bất kỳ mã nào dùng tham chiếu interface:
```java
Pet myPet = new Dog();
myPet.play(); // Output: Dog is playing!
        
myPet = new Cat();
myPet.play(); // Output: Cat is playing!
```

Điểm mấu chốt trong ví dụ này là tham chiếu `myPet` không quan tâm nó đang làm việc với `Dog` hay `Cat`. Nó chỉ biết mình đang làm việc với một `Pet` nào đó. Ta đổi kiểu object thực tế từ `Dog` sang `Cat`, và method `play` vẫn chạy mà không cần sửa gì.

Nhưng nếu bạn cần truy cập method riêng của kiểu object thực tế thì sao? Cũng như với tham chiếu lớp cha, bạn dùng ép kiểu:

```java
Dog myDog = (Dog) myPet; // Casting from Pet to Dog
myDog.bark(); // Now we can call Dog-specific methods
```

Một lần nữa, bạn phải chắc chắn tham chiếu interface thực sự đang trỏ tới một object `Dog` trước khi ép kiểu, nếu không bạn sẽ nhận exception lúc chạy.

Và nhớ rằng interface không có instance — bạn không tạo trực tiếp được object kiểu interface. Tuy nhiên, mọi object thuộc class implement interface đó đều tham chiếu được bằng kiểu interface. Theo nghĩa đó, object *là một* (is-a) dạng của kiểu interface.

Cũng đáng nhớ rằng một class implement được nhiều interface. Nếu một class implement nhiều interface, bạn dùng tham chiếu thuộc bất kỳ kiểu interface nào trong đó để trỏ tới instance của class:

```java
interface Trainable {
    void doTrick();
}

class Dog implements Pet, Trainable {
    // Implement methods from both interfaces
}

Pet myPet = new Dog();
Trainable myStudent = (Trainable) myPet;
```

Trong ví dụ này, một object `Dog` duy nhất được tham chiếu vừa như `Pet` vừa như `Trainable`, vì `Dog` implement cả hai interface.

Vậy nên tham chiếu interface tạo ra cách viết mã trừu tượng và linh hoạt hơn. Chúng cho phép bạn tập trung vào một tập hành vi cụ thể mà object thực hiện được, bất kể kiểu class thực tế của nó. Đây là nguyên tắc nền tảng của thiết kế hướng đối tượng.

Một lưu ý cuối: nhớ rằng interface không phải một phần của cây kế thừa của object. Chúng là cấu trúc riêng biệt. Vậy nên dù một object `Dog` được tham chiếu như `Pet`, tham chiếu `Pet` không phải lớp cha của `Dog`. Đó là một kiểu quan hệ khác.

### Ép kiểu (Type casting)

Để hiểu ép kiểu, bạn có thể nghĩ về biến như các diễn viên. Mỗi biến có một vai diễn cụ thể, do kiểu dữ liệu của nó quyết định. Nhưng đôi khi, như trong phim, một biến cần tạm nhận vai mới để phù hợp với nhu cầu của một cảnh cụ thể trong mã. Đó là lúc ép kiểu xuất hiện.

Với kiểu nguyên thuỷ, ép kiểu cho phép bạn gán giá trị của một kiểu nguyên thuỷ này sang kiểu khác. Với object, nó cho phép bạn xử lý object của một class như object của class khác, miễn là hai class có quan hệ kế thừa.

Vậy ép kiểu một object có làm thay đổi kiểu thực tế của nó không? Không hẳn. Khi bạn ép kiểu một object, bạn không thay đổi kiểu nền tảng của nó; bạn chỉ đang tạm xử lý nó như một kiểu khác trong một ngữ cảnh cụ thể. Giống như diễn viên khoác lên bộ trang phục cho một cảnh quay. Bên dưới, họ vẫn là chính họ, chỉ đang đóng vai khác trong khoảnh khắc ấy. Khi cảnh quay kết thúc, biến trở lại kiểu ban đầu — như diễn viên cởi bỏ trang phục sau cảnh quay.

Bạn có thể thắc mắc, vậy có ép được kiểu bất kỳ sang kiểu bất kỳ không? Dù sao thì tất cả cũng chỉ là dữ liệu mà? Không hẳn. Java là ngôn ngữ định kiểu chặt (strongly-typed), nghĩa là nó có quy tắc nghiêm ngặt về tương thích kiểu. Bạn không thể tuỳ tiện ép kiểu giữa những kiểu không liên quan, như ép `int` sang `String`. Trình biên dịch sẽ báo lỗi nếu bạn thử.

Các quy tắc ép kiểu trong Java như sau:

1. Ép tham chiếu từ kiểu con sang kiểu cha không cần ép kiểu tường minh.

2. Ép tham chiếu từ kiểu cha sang kiểu con cần ép kiểu tường minh.

3. Lúc chạy, một phép ép kiểu không hợp lệ sang kiểu không tương thích sẽ ném `ClassCastException`.

4. Trình biên dịch cấm ép kiểu sang những kiểu không liên quan.

Hãy phân tích từng quy tắc.

Quy tắc thứ nhất nói rằng ép tham chiếu từ kiểu con sang kiểu cha không cần ép kiểu tường minh. Đây gọi là **upcasting**. Nếu bạn có cây phân cấp trong đó class `B` extends class `A`, bạn gán được tham chiếu kiểu `B` cho biến kiểu `A` mà không cần ép kiểu tường minh:

```java
class A {}
class B extends A {}

B b = new B();
A a = b; // upcasting, no explicit cast needed
```

Upcasting an toàn vì lớp con luôn chứa đủ mọi đặc tính của lớp cha. Nên xử lý một object lớp con như object lớp cha sẽ không bao giờ gây vấn đề.

Quy tắc thứ hai nói rằng ép tham chiếu từ kiểu cha sang kiểu con cần ép kiểu tường minh. Đây gọi là **downcasting**. Nếu bạn có biến kiểu cha và muốn xử lý nó như kiểu con, bạn phải ép kiểu tường minh:

```java
A a = new B(); // upcasting
B b = (B) a; // downcasting, explicit cast needed
```

Downcasting là cần thiết khi bạn muốn truy cập method hay biến riêng của lớp con, không có ở lớp cha.

Tuy nhiên downcasting đi kèm rủi ro. Nếu object được tham chiếu thực ra không phải instance của lớp con mà bạn định ép sang thì sao? Điều này dẫn ta tới quy tắc thứ ba.

Lúc chạy, phép ép kiểu không hợp lệ sang kiểu không tương thích sẽ ném `ClassCastException`:

```java
A a = new A();
B b = (B) a; // Compiles but throws ClassCastException at runtime
```

Trong ví dụ này, `a` trỏ tới một instance của class `A`, không phải class `B`. Khi ta ép nó sang `B`, mã biên dịch không lỗi vì trình biên dịch chấp nhận khả năng `a` có thể đang trỏ tới một object `B`. Nhưng lúc chạy, khi phép ép kiểu thực sự diễn ra, Java nhận ra `a` không phải `B` và ném `ClassCastException`.

Đây là điểm quan trọng: ép kiểu không biến hoá một object thành thứ nó không phải. Nếu bạn cố ép object sang kiểu không tương thích, kết quả là exception lúc chạy. Ép kiểu tường minh về cơ bản là nói với trình biên dịch: "Tin tôi đi, tôi biết mình đang làm gì." Nhưng nếu bạn sai, Java sẽ cho bạn biết lúc chạy.

Tuy nhiên, quy tắc thứ tư nói rằng trình biên dịch cấm ép kiểu sang những kiểu không liên quan. Nếu bạn cố ép kiểu giữa các class không cùng cây kế thừa, trình biên dịch sẽ báo lỗi:

```java
class A {}
class C {}

A a = new A();
C c = (C) a; // Compilation error
```

Class `A` và `C` không liên quan qua kế thừa, nên trình biên dịch biết chắc một object `A` không bao giờ có thể là object `C`. Nó thậm chí không cho đoạn mã này biên dịch.

Vậy nếu ép kiểu không thành công, đó là vấn đề lúc biên dịch hay lúc chạy? Có thể là một trong hai, tuỳ tình huống. Nếu bạn ép sang kiểu không liên quan, đó là lỗi biên dịch. Nếu bạn ép sang kiểu có liên quan nhưng object thực ra không phải instance của kiểu đó, đó là exception lúc chạy.

Bạn có thể nghĩ, chẳng phải tất cả chuyện ép kiểu này rất nguy hiểm sao? Chẳng phải nó về cơ bản qua mặt hệ thống kiểm tra kiểu của Java? Không hẳn. Hệ thống kiểu của Java vẫn có hiệu lực, và trình biên dịch không cho bạn làm điều gì quá mất an toàn. Ép kiểu tường minh là cách bạn nói với trình biên dịch rằng bạn có thêm hiểu biết về kiểu của object, nhưng nó vẫn được kiểm tra lúc chạy.

Dẫu vậy, nói chung nên tránh ép kiểu quá nhiều, đặc biệt là downcasting. Nếu bạn thấy mình downcast liên tục, đó có thể là dấu hiệu cây phân cấp class của bạn cần được thiết kế lại.

Vậy khi nào ép kiểu thực sự hữu ích? Upcasting rất phổ biến và là phần quan trọng của polymorphism trong Java. Nó cho phép bạn xử lý một kiểu cụ thể hơn như một kiểu tổng quát hơn — an toàn và thường là cần thiết.

Ví dụ, giả sử bạn có method nhận tham số kiểu `List`. Bạn truyền vào `ArrayList`, `LinkedList` hay bất kỳ lớp con nào khác của `List` đều chạy tốt nhờ upcasting.

```java
void processNames(List<String> names) {
    // code here
}

ArrayList<String> nameList = new ArrayList<>();
processNames(nameList); // upcasting from ArrayList to List
```

Downcasting ít phổ biến hơn và nên dùng dè dặt. Nó cần thiết khi bạn có tham chiếu tới lớp cha nhưng cần truy cập method hay biến chỉ có ở lớp con.

```java
class Shape {
    void draw() { /* ... */ }
}

class Circle extends Shape {
    void drawCircle() { /* ... */ }
}

Shape shape = new Circle();
shape.draw(); // Fine, draw() is defined in Shape
((Circle)shape).drawCircle(); // Downcast to access drawCircle()
```

Trong trường hợp này, downcast an toàn vì ta biết `shape` thực sự đang trỏ tới một object `Circle`.

Tóm lại, ép kiểu trong Java cho phép bạn tạm xử lý một object như một kiểu khác — lớp cha (upcasting) hoặc lớp con (downcasting) — miễn là có quan hệ kế thừa. Upcasting an toàn và phổ biến, còn downcasting cần ép kiểu tường minh và phải dùng cẩn thận. Trình biên dịch kiểm tra những phép ép kiểu không hợp lệ sang kiểu không liên quan, còn ép kiểu không hợp lệ sang kiểu có liên quan sẽ gây exception lúc chạy. Và luôn nhớ rằng bên dưới lớp ép kiểu, bản thân object không đổi — nó chỉ đang được nhìn qua một lăng kính khác.

Nhưng để an toàn hơn nữa, bạn dùng được toán tử `instanceof` để kiểm tra kiểu trước khi ép. Hãy bàn về nó tiếp theo.

### Toán tử `instanceof`

Trong Java, toán tử `instanceof` dùng để kiểm tra xem một object có phải instance của một class cụ thể hay có implement một interface cụ thể hay không. Nó trả về giá trị `boolean`: `true` nếu object là instance của class/interface đó, `false` nếu ngược lại.

Cú pháp dùng `instanceof` là:
```java
objectReference instanceof ClassName/InterfaceName  
```

Ví dụ:
```java
Object obj = "Hello";
if(obj instanceof String) {
    System.out.println("obj is a String");
}
```

Đoạn này sẽ in `"obj is a String"` vì object mà `obj` tham chiếu tới là instance của class `String`.

Cần lưu ý rằng dùng `instanceof` hoàn toàn không làm thay đổi object hay kiểu của nó. Nó chỉ kiểm tra object với class/interface đã nêu và trả về kết quả `boolean`. `instanceof` không dùng được với kiểu nguyên thuỷ như `int` hay `double`; nó chỉ làm việc với tham chiếu object.

Vượt qua kiểm tra `instanceof` với một class nghĩa là object là instance của chính class đó hoặc một trong các lớp con của nó. Mọi object trong Java đều kế thừa từ class `Object`, nên `instanceof Object` luôn trả về `true`:
```java
String str = "abc";
if(str instanceof Object) {
    System.out.println("This will always print");
}
```

Ngoại lệ của quy tắc này là khi tham chiếu bằng `null`:
```java
String str = null;
if(str instanceof String) {
    System.out.println("This will never be executed");
}
```

`instanceof` cũng kiểm tra được một object có implement một interface cụ thể hay không. Nếu một class implement interface đó trực tiếp hoặc qua kế thừa, `instanceof` sẽ trả về `true` cho interface ấy:
```java
interface Trainable {
    void doTrick();
}

interface Pet extends Trainable {
    void play();
}

class Dog implements Pet {
    // Implement methods from both interfaces
}
```

```java
Pet dog = new Dog();
if(dog instanceof Pet) {
    System.out.println("A Dog is a Pet");
}
if(dog instanceof Trainable) {
    System.out.println("A Dog is a Trainable");
}
```

Cả hai câu lệnh in này đều chạy, vì `Dog` implement trực tiếp `Pet`, và `Pet` extends `Trainable`.

Một tình huống dùng phổ biến của `instanceof` là downcast an toàn một object trước khi gọi method riêng của lớp con. Nhớ rằng downcast là khi bạn ép tham chiếu từ kiểu lớp cha sang kiểu lớp con:
```java
Object obj = getSomeObject();
if(obj instanceof String) {
    String str = (String) obj;
    System.out.println(str.toUpperCase());
}
```

Ở đây trước hết ta kiểm tra `obj` có thực sự là `String` không rồi mới downcast và gọi method `toUpperCase()` riêng của `String`. Phép ép kiểu tường minh `(String)` vẫn bắt buộc dù ta đã xác nhận kiểu bằng `instanceof`.

Tuy nhiên, ta dùng được **pattern matching** cho toán tử `instanceof` để đơn giản hoá quá trình kiểm tra và ép kiểu.

Thay vì ép kiểu tường minh, bạn gộp việc kiểm tra kiểu và ép kiểu vào một thao tác duy nhất bằng cú pháp sau:
```java
if (objectReference instanceof ClassName variableName) {
    // Use variableName here, which is automatically cast to ClassName
}
```

Cú pháp này kiểm tra `objectReference` có phải instance của `ClassName` không. Nếu đúng, `objectReference` được ép sang `ClassName` và object đã ép được gán cho `variableName` trong phạm vi câu lệnh `if`. Nếu kiểm tra thất bại, không exception nào được ném ra. Mã trong khối đơn giản là không chạy, và biến pattern không truy cập được. Điều này loại bỏ nhu cầu ép kiểu tường minh và giảm mã rườm rà.

Đây là ví dụ downcast ở trên viết lại bằng pattern matching:
```java
Object obj = getSomeObject();
if(obj instanceof String str) {
    System.out.println(str.toUpperCase());
}
```

Trong ví dụ này, `str` là biến pattern được tự động ép sang `String` nếu `obj` là instance của `String`. Biến pattern được khởi tạo ngầm khi khớp thành công. Không cần ép kiểu thêm.

Biến pattern có phạm vi hạn chế. Chúng chỉ truy cập được ở nơi việc khớp kiểu được đảm bảo. `str` trong ví dụ trên không dùng được bên ngoài khối `if`. Lựa chọn thiết kế này đảm bảo biến pattern chỉ được dùng trong những ngữ cảnh mà kiểu của nó đã chắc chắn, loại bỏ một nguồn lỗi phổ biến.

Tuy nhiên, điều đó không phải lúc nào cũng có nghĩa phạm vi chính là khối `if` nơi chúng được định nghĩa. Khi dùng pattern matching với `instanceof`, nếu điều kiện là `true` — nghĩa là object là instance của kiểu đã nêu — biến pattern quả thực có phạm vi và truy cập được bên trong khối theo sau điều kiện. Tuy nhiên, xét ví dụ sau, nơi pattern matching được dùng cùng phép phủ định:

```java
Object obj = getSomeObject();
if (!(obj instanceof String str)) {
    // The pattern variable str is NOT accessible here
    return "";
}
// But, because the execution only reaches this point if str IS an instance of String,
// the pattern variable str is accessible here.
return str.toUpperCase();
```

Trong ví dụ này, câu `if` kiểm tra `obj` **không** phải instance của `String`. Nếu `obj` không phải `String`, method trả về ngay, và biến pattern `str` không truy cập được bên trong khối `if` vì điều kiện khởi tạo nó (`obj` là instance của `String`) là `false`.

Tuy nhiên, ngay sau khối `if` này, mã chỉ chạy tiếp nếu `obj` quả thực là instance của `String`, nghĩa là `str` đã khớp thành công và giờ truy cập, dùng được bên ngoài — ngay sau — khối `if` chứa pattern matching. Đây là tình huống cụ thể mà luồng chương trình đảm bảo biến pattern `str` đã được khởi tạo và dùng được an toàn, vì method đã thoát sớm nếu điều kiện là `false`.

Bạn cũng dùng được biến pattern theo cách này:
```java
Object obj = getSomeObject();
if(obj instanceof String str && str.length() > 3) {
    System.out.println(str.toUpperCase());
}
```

Bởi vì toán tử AND điều kiện (`&&`) có tính đoản mạch (short-circuit), chương trình chỉ tới được biểu thức `str.length() > 3` nếu biểu thức `instanceof` trả về `true`.

Tuy nhiên, bạn không dùng được toán tử OR (`||`):
```java
Object obj = getSomeObject();
if(obj instanceof String str || str.length() > 3) { // Error
    System.out.println(str.toUpperCase());
}
```

Đoạn này sẽ gây lỗi vì biểu thức `str.length() > 3` có thể chạy khi `obj` không phải instance của `String`, dẫn tới việc cố truy cập `str` khi nó có thể chưa được khởi tạo.

Ngoài ra, pattern matching với `instanceof` được thiết kế cho một kiểu tại một thời điểm. Nó đơn giản hoá việc kiểm tra và ép kiểu cho một kiểu duy nhất chứ không mở rộng cho nhiều kiểu cùng lúc:
```java
Object obj = getSomeObject();

if (obj instanceof String str) {
    // obj is a String, use str here
    System.out.println("String length: " + str.length());
} else if (obj instanceof Integer intVal) {
    // obj is an Integer, use intVal here
    System.out.println("Integer value: " + intVal);
} else if (obj instanceof List<?> list) {
    // obj is a List, use list here
    System.out.println("List size: " + list.size());
}
```

Trong ví dụ này, `obj` được kiểm tra với nhiều kiểu: `String`, `Integer` và `List`. Tuỳ theo kiểu thực tế của `obj`, khối mã tương ứng sẽ chạy. Bên trong mỗi khối, object `obj` được tự động ép sang kiểu đang kiểm tra, và bạn dùng trực tiếp được object đã ép mà không cần ép kiểu tường minh.

Cách tiếp cận này giữ mã sạch sẽ và an toàn kiểu, cho phép viết mã dễ đọc và dễ bảo trì hơn khi làm việc với nhiều kiểu khả dĩ cho một tham chiếu object.

Nói chung nên dùng `instanceof` dè dặt và ưu tiên polymorphism khi có thể. Kiểm tra `instanceof` thường xuyên có thể là dấu hiệu thiết kế hướng đối tượng kém. Nhưng nó vẫn có những công dụng chính đáng: downcast an toàn, mã phản chiếu (reflective), và một số phép so sánh bằng nhau.

Cuối cùng, đây là hai điều then chốt khác về `instanceof`:

- Lớp con được coi là instance của lớp cha, nhưng lớp cha không được coi là instance của lớp con.

- Nó kiểm tra được việc cài đặt interface, nhưng không phân biệt được giữa cài đặt trực tiếp trong class và cài đặt kế thừa từ lớp cha.

## Encapsulation (Đóng gói)

### Encapsulation là gì?

Encapsulation (đóng gói) là một trong những nguyên lý nền tảng của lập trình hướng đối tượng trong Java. Nó bao gồm việc gói dữ liệu (attribute) và method (hành vi) thao tác trên dữ liệu đó vào cùng một đơn vị (như một class), đồng thời hạn chế truy cập từ bên ngoài vào phần bên trong của class.

Encapsulation trong Java có thể ví như một máy bán hàng tự động. Cũng như bạn tương tác với máy qua các nút bấm để chọn món ăn vặt hay đồ uống, mà không cần hiểu hay chạm vào cơ chế bên trong thực sự nhả hàng ra, encapsulation cho phép bạn tương tác với object qua các method public, trong khi trạng thái bên trong và chi tiết cài đặt vẫn được giấu kín và bảo vệ khỏi can thiệp từ bên ngoài.

Mục đích chính của encapsulation là bảo vệ dữ liệu khỏi việc truy cập và sửa đổi trái phép, đồng thời tách giao diện của class (cách dùng nó) khỏi phần cài đặt (cách nó thực sự hoạt động bên trong). Bằng cách đóng gói trạng thái bên trong của object, ta đảm bảo nó không thể bị mã bên ngoài đưa vào trạng thái không hợp lệ hay không nhất quán.

Vài lập trình viên có thể thắc mắc: "Sao tôi không để tất cả là public cho đơn giản? Việc gì phải giấu phần bên trong của class?"

Cách này có vẻ đơn giản hơn trong ngắn hạn, nhưng nhanh chóng dẫn tới mã cứng nhắc, dễ vỡ và khó bảo trì. Encapsulation giúp quản lý độ phức tạp bằng cách giảm sự phụ thuộc lẫn nhau giữa các phần khác nhau của chương trình. Khi một class được đóng gói tốt, thay đổi phần cài đặt bên trong của nó không ảnh hưởng tới phần còn lại của codebase, giúp bảo trì, tái cấu trúc và cập nhật class dễ dàng hơn mà không gây hiệu ứng lan truyền khắp chương trình.

Vậy chính xác ta cài đặt encapsulation trong Java thế nào? Cơ chế chính là dùng access modifier trên các thành phần của class.

Nhớ rằng có bốn access modifier quyết định phạm vi nhìn thấy và khả năng truy cập của class, field và method:
- `private`: Chỉ truy cập được trong cùng class.

- `default` (package-private): Truy cập được trong cùng class và từ bất kỳ class nào khác trong cùng package.

- `protected`: Truy cập được trong cùng class, từ bất kỳ class nào khác trong cùng package, và từ các lớp con (kể cả ở package khác).

- `public`: Truy cập được từ bất kỳ đâu.

Bạn áp dụng những modifier này cho class, attribute và method theo bảng sau:

| Access Modifier | Class/Interface | Attribute của class | Method của class | Attribute của interface | Method của interface |
|-----------------|-----------------|-----------------|--------------|---------------------|------------------|
| **public**      | ✓               | ✓               | ✓            | ✓                   | ✓                |
| **private**     |                 | ✓               | ✓            |                     |                  |
| **protected**   |                 | ✓               | ✓            |                     |                  |
| **default**     | ✓               | ✓               | ✓            | ✓                   | ✓                |

Và đây là bảng tóm tắt quy tắc của access modifier:

| Access Modifier | Cùng class | Lớp con (cùng package) | Lớp con (khác package) | Class khác (cùng package) | Class khác (khác package) |
|-----------------|------------|-------------------------|------------------------------|------------------------------|-----------------------------------|
| **public**      | ✓          | ✓                       | ✓                            | ✓                            | ✓                                 |
| **private**     | ✓          |                         |                              |                              |                                   |
| **protected**   | ✓          | ✓                       | ✓                            | ✓                            |                                   |
| **default**     | ✓          | ✓                       |                              | ✓                            |                                   |

Để đóng gói một class, ta thường:
1. Khai báo field (instance variable) của class là `private`. Điều này ngăn truy cập trực tiếp vào field từ bên ngoài class.

2. Cung cấp method getter `public` để lấy giá trị field, và method setter để sửa chúng nếu cần. Những method này cung cấp truy cập có kiểm soát tới field và cho phép thêm logic kiểm tra, ghi log hay bất kỳ xử lý nào khác khi giá trị field được đọc hoặc sửa.

Đây là ví dụ về class `BankAccount` được đóng gói tốt:

```java
public class BankAccount {
    private String accountNumber;
    private double balance;

    public String getAccountNumber() {
        return accountNumber;
    }

    public double getBalance() {
        return balance;
    }

    public void deposit(double amount) {
        if (amount > 0) {
            balance += amount;
        } else {
            throw new IllegalArgumentException("Deposit amount must be positive.");
        }
    }

    public void withdraw(double amount) {
        if (amount > balance) {
            throw new IllegalArgumentException("Insufficient funds.");
        } else if (amount < 0) {
            throw new IllegalArgumentException("Withdrawal amount must be positive.");
        } else {
            balance -= amount;
        }
    }
}
```

Và sơ đồ hình dung:
```
┌─────────────────────────────────────────┐
│              BankAccount                │
├─────────────────────────────────────────┤
│ - accountNumber: String                 │
│ - balance: double                       │
├─────────────────────────────────────────┤
│ + getAccountNumber(): String            │
│ + getBalance(): double                  │
│ + deposit(amount: double): void         │
│ + withdraw(amount: double): boolean     │
└─────────────────────────────────────────┘
```

Trong ví dụ này, field `accountNumber` và `balance` được khai báo `private` nên không thể truy cập hay sửa trực tiếp từ bên ngoài class `BankAccount`. Method public `getAccountNumber()` và `getBalance()` cho phép lấy giá trị field một cách có kiểm soát, còn method `deposit()` và `withdraw()` cho phép sửa field `balance` có kiểm soát kèm logic kiểm tra.

Bạn có thể thắc mắc: "Nếu tôi dùng getter và setter cho mọi field thì class của tôi tự động được đóng gói tốt đúng không?"

Không nhất thiết. Dù dùng getter và setter là cách phổ biến để đóng gói field, chỉ có những method này không đảm bảo đóng gói tốt. Encapsulation không chỉ là giấu dữ liệu. Nó là việc đảm bảo trạng thái bên trong của object luôn hợp lệ và nhất quán. Getter và setter chỉ là một công cụ để đạt điều đó.

Ví dụ, xét class `Rectangle` này:

```java
public class Rectangle {
    private double width;
    private double height;

    public double getWidth() {
        return width;
    }

    public void setWidth(double width) {
        this.width = width;
    }

    public double getHeight() {
        return height;
    }

    public void setHeight(double height) {
        this.height = height;
    }

    public double getArea() {
        return width * height;
    }
}
```

Dù class này dùng getter và setter, nó không thực sự được đóng gói tốt. `width` và `height` gán được giá trị bất kỳ, kể cả số âm — điều vô nghĩa với một hình chữ nhật. Cách tốt hơn là kiểm tra đầu vào trong setter:

```java
public void setWidth(double width) {
    if (width > 0) {
        this.width = width;
    } else {
        throw new IllegalArgumentException("Width must be positive.");
    }
}

public void setHeight(double height) {
    if (height > 0) {
        this.height = height;
    } else {
        throw new IllegalArgumentException("Height must be positive.");
    }
}
```

Bằng cách thêm logic kiểm tra này, ta đảm bảo trạng thái bên trong của object `Rectangle` luôn hợp lệ, nhờ đó đạt được mức đóng gói tốt hơn.

Tóm lại, encapsulation là việc quản lý độ phức tạp, bảo vệ tính toàn vẹn dữ liệu và tách giao diện của class khỏi phần cài đặt. Nó chủ yếu đạt được qua việc dùng access modifier, với mẫu phổ biến là field `private` cùng getter và setter `public`. Tuy nhiên, đóng gói tốt vượt xa việc chỉ dùng getter và setter; nó đòi hỏi thiết kế cẩn thận giao diện `public` của class và đảm bảo trạng thái bên trong luôn hợp lệ, nhất quán.

### Object immutable (bất biến)

Trong lập trình hướng đối tượng, tính bất biến (immutability) là khả năng tạo ra những object mà trạng thái không thể thay đổi sau khi chúng được tạo.

Object immutable trong Java giống một cuốn sách đã in: một khi nội dung được xuất bản (object được tạo), nó không thể bị sửa. Cũng như bạn không thể đổi chữ trên trang sách đã in mà không làm một cuốn sách mới, bạn không thể sửa một object immutable mà không tạo instance mới với những thay đổi mong muốn.

Vậy điều gì khiến một object trở nên immutable trong Java? Không đơn giản chỉ là bỏ các method setter. Có vài yêu cầu then chốt:

1. Đánh dấu class là `final`, hoặc để mọi constructor là `private`. Điều này ngăn việc kế thừa — thứ có thể khiến tính khả biến lọt vào.

2. Đánh dấu mọi instance variable là `private` và `final`. Điều này đảm bảo trạng thái không sửa trực tiếp được từ bên ngoài class. Nhưng chỉ vậy đã đủ cho tính bất biến chưa?

3. Không định nghĩa bất kỳ method setter nào. Bất kỳ method nào sửa trạng thái, kể cả gián tiếp, đều phá vỡ tính bất biến.

4. Không cho phép sửa các object khả biến được tham chiếu. Nếu class của bạn giữ tham chiếu tới một object khả biến (như `Date` hay một `Collection`), bạn phải đảm bảo tham chiếu đó không dùng được để thay đổi trạng thái của object ấy.

5. Dùng constructor để đặt mọi thuộc tính của object, tạo bản sao phòng vệ (defensive copy) nếu cần. Một khi object immutable đã được dựng, trạng thái của nó không bao giờ đổi. Constructor phải thiết lập các bất biến (invariant).

Hãy đi sâu vào từng yêu cầu.

Đánh dấu class là `final` ngăn nó bị kế thừa. Nếu cho phép kế thừa, lớp con có thể thêm trạng thái khả biến hoặc override method thành khả biến, phá vỡ hợp đồng bất biến.

```java
public final class ImmutableExample {
    // class definition here
}
```

Cách khác, ta để constructor là `private` và kiểm soát việc khởi tạo qua factory method:

```java
public class ImmutableExample {
    private ImmutableExample() {
        // private constructor
    }
    
    public static ImmutableExample create() {
        return new ImmutableExample();
    }
}
```

Nhưng đánh dấu class `final` không tự động khiến nó immutable. Ta còn cần đảm bảo mọi field của nó là `private` và `final`:

```java
public final class ImmutableExample {
    private final int value;
    
    public ImmutableExample(int value) {
        this.value = value;
    }
    
    public int getValue() {
        return value;
    }
}
```

Bằng cách để field là `private`, ta ngăn truy cập trực tiếp từ bên ngoài class. Và bằng cách để chúng là `final`, ta đảm bảo chúng chỉ được gán một lần, trong constructor.

Nhưng ngay cả với field `private final`, tính bất biến vẫn bị vi phạm nếu class có method thay đổi trạng thái:

```java
public final class NotActuallyImmutable {
    private final int value;
    
    public NotActuallyImmutable(int value) {
        this.value = value; 
    }
    
    public void setValue(int value) {
        this.value = value; // Mutates state - not okay!
    }
}
```

Để thực sự bất biến, class không được có bất kỳ method setter nào hay bất kỳ method nào khác làm thay đổi field của nó sau khi dựng xong.

Tuy nhiên, tính bất biến vượt xa trạng thái trực tiếp của object. Trạng thái của một object immutable bao gồm cả trạng thái của những object khác mà nó giữ tham chiếu tới.

Xét class này:

```java
public final class NotImmutable {
    private final Date start;
    
    public NotImmutable(Date start) {
        this.start = start;
    }
    
    public Date getStart() {
        return start;
    }
}
```

Thoạt nhìn nó có vẻ immutable: field `start` là `private` và `final`, không có setter nào. Nhưng class `Date` là khả biến. Ai đó có thể làm thế này:

```java
NotImmutable example = new NotImmutable(new Date());
example.getStart().setTime(0); // Mutates the internal state of example!
```

Để sửa lỗi này, ta cần tạo bản sao phòng vệ của `Date` trong constructor:

```java
public final class ActuallyImmutable {
    private final Date start;
    
    public ActuallyImmutable(Date start) {
        this.start = new Date(start.getTime()); // Defensive copy
    }
    
    public Date getStart() {
        return new Date(start.getTime()); // Defensive copy
    }
}
```

Giờ trạng thái của instance `ActuallyImmutable` không thể bị thay đổi qua tham chiếu mà nó giữ.

Nguyên tắc tương tự áp dụng cho collection và mảng: nếu một class immutable giữ tham chiếu tới collection hay mảng khả biến, nó phải sao chép phòng vệ và không cung cấp cách nào để collection bên trong bị sửa.

Dùng constructor đúng cách cũng là chìa khoá của tính bất biến. Trạng thái của một object immutable phải được xác định hoàn toàn bởi các đối số truyền vào constructor. Và constructor phải thiết lập mọi bất biến của object.

Điều này nghĩa là class immutable không nên có constructor không tham số, vì khi đó trạng thái của nó sẽ không được xác định đầy đủ khi dựng xong. Mọi thuộc tính phải được đặt qua đối số constructor.

Đây là ví dụ về class immutable có chứa collection:

```java
public final class ImmutableCollection {
    private final List<String> strings;
    
    public ImmutableCollection(List<String> strings) {
        this.strings = List.copyOf(strings); // Immutable copy
    }
    
    public List<String> getStrings() {
        return strings;
    }
}
```

Bằng cách tuân theo những quy tắc này — để class và field là final, không cung cấp method thay đổi trạng thái, sao chép phòng vệ các thành phần khả biến, và đặt toàn bộ trạng thái trong constructor — ta tạo được những object thực sự bất biến trong Java.

Object immutable có nhiều ưu điểm, đặc biệt trong ngữ cảnh đồng thời (concurrent). Vì trạng thái của chúng không bao giờ đổi, chúng vốn dĩ an toàn với đa luồng (thread-safe). Chúng chia sẻ thoải mái giữa các thread mà không cần đồng bộ hoá.

Chúng cũng dễ suy luận hơn, vì bạn biết trạng thái của chúng luôn giữ nguyên. Và chúng đóng vai trò viên gạch để xây những cấu trúc thread-safe phức tạp hơn.

Tuy nhiên, tính bất biến cũng có cái giá của nó. Object immutable có thể tốn kém hơn khi tạo, vì chúng thường đòi hỏi tạo bản sao phòng vệ. Và nếu bạn cần thay đổi gì đó, bạn phải tạo instance mới — điều này có thể tốn kém với những object lớn.

## Các điểm chính

- Phạm vi biến (variable scope) là mức độ nhìn thấy và khả năng truy cập của một biến trong mã. Bốn phạm vi chính trong Java là biến cục bộ, tham số method, field (instance variable) và biến class (static field).

- Biến cục bộ được khai báo bên trong một method hay một khối và chỉ truy cập được trong khối đó. Chúng vào phạm vi tại chỗ khai báo và ra khỏi phạm vi ở cuối khối bao quanh.

- Tham số method cũng được coi là biến cục bộ, với phạm vi trải khắp thân method. Chúng vào phạm vi khi method được gọi và ra khỏi phạm vi khi method kết thúc.

- Field, hay instance variable, là biến khai báo ở mức class. Chúng vào phạm vi khi object được khởi tạo và ở trong phạm vi chừng nào object còn trong bộ nhớ.

- Biến class, hay static field, là biến static khai báo ở mức class. Chúng vào phạm vi khi class được nạp và ở trong phạm vi tới khi chương trình kết thúc.

- Field tự động nhận giá trị mặc định nếu không khởi tạo tường minh, còn biến cục bộ bắt buộc phải được khởi tạo tường minh trước khi dùng.

- Keyword `var` cho phép suy luận kiểu biến cục bộ. Trình biên dịch suy ra kiểu dựa trên biểu thức khởi tạo.

- Inheritance cho phép một class mới dựa trên một class đã có, kế thừa attribute và method của nó. Keyword `extends` được dùng để tạo lớp con.

- Abstract class không thể được khởi tạo và được thiết kế để kế thừa. Chúng chứa được abstract method — những method không có phần cài đặt trong abstract class và bắt buộc phải được lớp con cụ thể cài đặt.

- Interface định nghĩa hợp đồng gồm những method mà class phải cài đặt. Keyword `implements` được dùng để cài đặt interface. Một class implement được nhiều interface.

- Sealed class hạn chế những class nào được phép extends chúng. Lớp con được phép được chỉ định bằng keyword `permits`. Lớp con của sealed class phải được khai báo là `final`, `sealed` hoặc `non-sealed`.

- Keyword `this` là tham chiếu tới instance hiện tại của class. Nó dùng để phân biệt biến cục bộ với instance variable, truyền instance hiện tại làm đối số method, và gọi constructor khác từ bên trong constructor.

- Keyword `super` là tham chiếu tới lớp cha của class hiện tại. Nó dùng để truy cập thành phần của lớp cha và gọi constructor của lớp cha từ constructor của lớp con.

- Polymorphism cho phép bạn xử lý object của các lớp con khác nhau như thể chúng là object của cùng một lớp cha.

- Method overriding là khái niệm then chốt trong polymorphism, nơi lớp con cung cấp cài đặt riêng cho method đã được định nghĩa ở lớp cha.

- Để override một method cho đúng, method ở lớp con phải có cùng tên, cùng kiểu trả về và cùng danh sách tham số như method ở lớp cha.

- Khi override method, bạn có thể làm access modifier thoáng hơn ở lớp con, nhưng không được chặt hơn. Method override cũng chỉ được khai báo những exception giống hệt hoặc cụ thể hơn so với method của lớp cha.

- Method override được phép có covariant return type, nghĩa là kiểu trả về có thể là lớp con của kiểu trả về mà method lớp cha khai báo.

- Annotation `@Override` đánh dấu tường minh những method có ý định override method của lớp cha và tạo lá chắn chống lỗi vô ý.

- Khai báo lại một method private của lớp cha trong lớp con không được coi là overriding. Method private không được kế thừa.

- Khai báo lại một static method ở lớp con gọi là hiding (che khuất) chứ không phải overriding. Method của lớp con che khuất method của lớp cha nhưng thực sự không override nó.

- Biến cũng bị che khuất được ở lớp con nếu lớp con khai báo biến trùng tên với biến của lớp cha.

- Có ba cách chính để truy cập object trong Java: dùng tham chiếu cùng kiểu với object, dùng tham chiếu là lớp cha của kiểu object, và dùng tham chiếu định nghĩa một interface mà class của object implement hoặc kế thừa.

- Ép kiểu cho phép bạn gán giá trị của một kiểu nguyên thuỷ sang kiểu khác, hoặc xử lý object của một class như object của class khác, miễn là hai class có quan hệ kế thừa.

- Ép tham chiếu từ kiểu con sang kiểu cha (upcasting) không cần ép kiểu tường minh, còn ép từ kiểu cha sang kiểu con (downcasting) thì cần.

- Toán tử `instanceof` dùng để kiểm tra một object có phải instance của một class cụ thể hay có implement một interface cụ thể hay không. Nó trả về giá trị `boolean`.

- Pattern matching cho toán tử `instanceof` cho phép bạn gộp việc kiểm tra kiểu và ép kiểu vào một thao tác duy nhất, giảm mã rườm rà.

## Câu hỏi luyện tập

**1. Kết quả của việc biên dịch và chạy đoạn mã sau là gì?**

```java
void myMethod() {
    int x = 1;
    if (x > 0) { 
        int y = 2;
        System.out.println(x + y);
    }
    System.out.println(x);
    System.out.println(y);
}
```

**A)** Mã biên dịch được và in ra `3` rồi `1`.  
**B)** Mã biên dịch được và in ra `3` rồi `1` và một giá trị không xác định cho `y`.  
**C)** Mã không biên dịch được vì `y` bị truy cập ngoài phạm vi của nó.  
**D)** Mã biên dịch được nhưng ném exception lúc chạy khi cố in `y`.


**2. Những câu lệnh khai báo biến nào sau đây hợp lệ? (Chọn tất cả đáp án đúng.)**

**A)** `double x, double y;`  
**B)** `int i = 0, String s = "hello";`  
**C)** `float f1 = 3.14f, f2 = 6.28f;`  
**D)** `char a = 'A', b, c = 'C';`  


**3. Những phát biểu nào sau đây đúng về việc dùng `var` trong Java? (Chọn tất cả đáp án đúng.)**

**A)** `var` dùng được để khai báo cả biến cục bộ trong method lẫn instance variable trong class.  
**B)** Việc dùng `var` chỉ giới hạn ở biến cục bộ trong method, constructor hoặc khối initializer.  
**C)** `var` dùng được để khai báo tham số method.  
**D)** `var` tăng tính dễ đọc bằng cách suy luận kiểu ở những chỗ ngữ cảnh đã rõ, nhưng không được phép dùng trong method signature để giữ sự rõ ràng.  
**E)** `var` dùng được để khai báo biến class (static).


**4. Những phát biểu nào sau đây mô tả đúng việc dùng inheritance trong Java? (Chọn tất cả đáp án đúng.)**

**A)** Lớp con chỉ truy cập trực tiếp được thành phần `protected` và `public` của lớp cha.  
**B)** Trong Java, một class extends được nhiều class để đạt đa kế thừa.  
**C)** Keyword `extends` được dùng trong Java để tạo lớp con kế thừa từ lớp cha.  
**D)** Lớp con trong Java truy cập trực tiếp được thành phần `private` của lớp cha.


**5. Xét đoạn mã sau:**

```java
abstract class Animal {
    abstract void eat();
}

class Dog extends Animal {
    void eat() {
        System.out.println("Dog eats");
    }
}

class Cat extends Animal {
    void eat() {
        System.out.println("Cat eats");
    }
}

public class Test {
    public static void main(String[] args) {
        Animal myAnimal = new Dog();
        myAnimal.eat();
    }
}
```

Những phát biểu nào sau đây đúng về đoạn mã trên? Chọn tất cả đáp án đúng.

**A)** Mã sẽ biên dịch được và in ra `"Dog eats"` khi chạy.  
**B)** Class `Animal` khởi tạo được.  
**C)** Bỏ method `eat` khỏi class `Dog` sẽ gây lỗi biên dịch.  
**D)** Class `Cat` là cần thiết để mã biên dịch và chạy được.


**6. Xét các interface sau:**

```java
interface Walkable {
    int distance = 10;
    void walk();
}

interface Runnable {
    void run();
    default void getSpeed() {
        System.out.println("Default speed");
    }
}

class Person implements Walkable, Runnable {
    public void walk() {
        System.out.println("Walking...");
    }
    public void run() {
        System.out.println("Running...");
    }
}
```

Phát biểu nào sau đây đúng?

**A)** Class `Person` bắt buộc phải override method `getSpeed`.  
**B)** Biến `distance` trong interface `Walkable` ngầm định là `public`, `static` và `final`.  
**C)** Một object `Person` gọi được method `getSpeed` mà không cần cài đặt gì trong class `Person`.  
**D)** Interface `Runnable` gây lỗi biên dịch do xung đột tên với `java.lang.Runnable`.


**7. Xét đoạn mã sau liên quan tới sealed class:**

```java
sealed abstract class Shape permits Circle, Square {
    abstract double area();
}

final class Circle extends Shape {
    private final double radius;

    Circle(double radius) {
        this.radius = radius;
    }

    public double area() {
        return Math.PI * radius * radius;
    }
}

non-sealed class Square extends Shape {
    private final double side;

    Square(double side) {
        this.side = side;
    }

    public double area() {
        return side * side;
    }
}

public class TestShapes {
    public static void main(String[] args) {
        Shape shape = new Circle(10);
        System.out.println("Area: " + shape.area());
    }
}
```

Phát biểu nào sau đây đúng?

**A)** Class `Shape` được định nghĩa đúng như một sealed class, chỉ cho phép những class đã nêu extends nó.  
**B)** Class `Square` extends class `Shape` không đúng vì nó không được đánh dấu `final`.  
**C)** Class `Circle` có thể bị các class khác extends thêm.  
**D)** Method `area` trong class `Shape` bắt buộc phải có cài đặt mặc định.


**8. Xét class sau:**

```java
public class Widget {
    private int size;

    public Widget() {
        this(10); // Line 5
    }

    public Widget(int size) {
        this.size = size;
    }

    public void resize(int size) {
        if (size > this.size) {
            this.size = size; // Line 14
            updateWidget();
        }
    }

    private void updateWidget() {
        System.out.println("Widget updated to size " + this.size);
    }

    public static void main(String[] args) {
        Widget widget = new Widget();
        widget.resize(15);
    }
}
```

Ở dòng 14, keyword `this` đại diện cho điều gì trong ngữ cảnh class `Widget`?

**A)** Tham chiếu tới ngữ cảnh `static` của class, cho phép truy cập static method và static field.  
**B)** Một biến đặc biệt lưu giá trị trả về của method.  
**C)** Một keyword tuỳ chọn, luôn bỏ đi được mà không ảnh hưởng tới chức năng của mã.  
**D)** Tham chiếu tới object hiện tại, mà instance variable của nó đang được gọi tới.


**9. Xét các class sau:**

```java
class Animal {
    String name;

    Animal(String name) {
        this.name = name;
    }

    protected void eat() {
        System.out.println("Animal eats");
    }
}

class Dog extends Animal {
    Dog(String name) {
        super(name);
    }

    @Override
    protected void eat() {
        super.eat();
        System.out.println(name + " (Dog) eats");
    }
}

public class TestAnimal {
    public static void main(String[] args) {
        Animal myDog = new Dog("Buddy");
        myDog.eat();
    }
}
```

Những phát biểu nào sau đây đúng về việc dùng `super` trong đoạn mã trên? (Chọn tất cả đáp án đúng.)

**A)** Keyword `super` được dùng trong constructor của `Dog` để gọi constructor của lớp cha.  
**B)** Method `eat` trong class `Dog` dùng `super` để gọi method `eat` của lớp cha.  
**C)** Bỏ lời gọi `super.eat();` trong method `eat` của class `Dog` sẽ khiến class `Dog` không biên dịch được.  
**D)** Keyword `super` dùng được để truy cập static method của lớp cha.



**10. Xét các class sau:**

```java
class Vehicle {
    public void drive(int speed) {
        System.out.println("Vehicle driving at speed: " + speed);
    }
}

class Car extends Vehicle {
    @Override
    public void drive(long speed) {
        System.out.println("Car driving at speed: " + speed);
    }
}

public class TestDrive {
    public static void main(String[] args) {
        Vehicle myCar = new Car();
        myCar.drive(60);
    }
}
```

Kết quả của việc biên dịch và chạy đoạn mã trên là gì?

**A)** Mã biên dịch được và in ra `"Car driving at speed: 60"`.  
**B)** Mã không biên dịch được vì method `drive` không gọi được qua tham chiếu `Vehicle`.  
**C)** Mã không biên dịch được vì method `drive` trong class `Car` không override đúng method `drive` của class `Vehicle`.  
**D)** Mã biên dịch được và in ra `"Vehicle driving at speed: 60"` vì method `drive` trong class `Car` là overload chứ không phải override.


**11. Xét đoạn mã sau:**

```java
class Fruit {
    public void flavor() {
        System.out.println("Fruit flavor");
    }
}

class Apple extends Fruit {
    @Override
    public void flavor() {
        System.out.println("Apple flavor");
    }

    public void color() {
        System.out.println("Red");
    }
}

public class TestFruit {
    public static void main(String[] args) {
        Fruit myFruit = new Apple();
        myFruit.flavor();
        // myFruit.color();
    }
}
```

Nếu bỏ chú thích ở dòng `// myFruit.color();`, kết quả của việc biên dịch và chạy đoạn mã trên là gì?

**A)** Mã biên dịch được và in ra `"Apple flavor"` rồi `"Red"`.  
**B)** Mã biên dịch được và in ra `"Fruit flavor"`.  
**C)** Mã biên dịch được nhưng ném exception lúc chạy khi cố gọi `color()`.  
**D)** Mã không biên dịch được vì `Apple` không phải một kiểu hợp lệ của `Fruit`.  
**E)** Mã không biên dịch được vì method `color` không được định nghĩa trong class `Fruit`.


**12. Xét đoạn mã sau:**

```java
class Animal {}

class Dog extends Animal {
    public void bark() {
        System.out.println("Woof");
    }
}

class Cat extends Animal {
    public void meow() {
        System.out.println("Meow");
    }
}

public class TestCasting {
    public static void main(String[] args) {
        Animal animal = new Dog();
        ((Dog)animal).bark();

        Animal anotherAnimal = new Animal();
        // Line 1
    }
}
```

Những dòng mã nào sau đây, nếu chèn độc lập vào Line 1, sẽ biên dịch được mà không gây exception lúc chạy? (Chọn tất cả đáp án đúng.)

**A)** `((Dog)anotherAnimal).bark();`  
**B)** `if (anotherAnimal instanceof Dog) ((Dog)anotherAnimal).bark();`  
**C)** `((Cat)animal).meow();`  
**D)** `if (anotherAnimal instanceof Cat) ((Cat)anotherAnimal).meow();`


**13. Xét đoạn mã sau:**

```java
public class AdvancedPatternMatching {
    public static void process(Object input) {
        if (input instanceof String s && s.contains("Java")) {
            System.out.println("String with Java: " + s);
        } else if (input instanceof Integer i && i > 10) {
            System.out.println("Integer greater than 10: " + i);
        }
    }

    public static void main(String[] args) {
        process("Hello Java!");
        process(15);
        process("Just a string");
        process(5);
    }
}
```

Với đoạn mã trên, phát biểu nào mô tả chính xác kết quả thực thi của nó?

**A)** Mã biên dịch được và in ra `"String with Java: Hello Java!"` rồi `"Integer greater than 10: 15"`.  
**B)** Mã biên dịch được nhưng chỉ in ra `"String with Java: Hello Java!"` vì số nguyên không được hỗ trợ với pattern matching.  
**C)** Mã không biên dịch được vì pattern matching trong `instanceof` không kết hợp được với toán tử logic như `&&`.  
**D)** Mã biên dịch được nhưng in ra cả bốn dòng do dùng pattern matching sai khiến kết quả luôn là `true`.


**14. Xét thực hành đóng gói trong cấu trúc class sau:**

```java
package store;

public class Product {
    private String name;
    private double price;
    private int stock;

    public Product(String name, double price, int stock) {
        setName(name);
        setPrice(price);
        setStock(stock);
    }

    public String getName() {
        return name;
    }

    private void setName(String name) {
        this.name = name;
    }

    public double getPrice() {
        return price;
    }

    private void setPrice(double price) {
        if (price >= 0) {
            this.price = price;
        }
    }

    public int getStock() {
        return stock;
    }

    private void setStock(int stock) {
        if (stock >= 0) {
            this.stock = stock;
        }
    }
}
```

Phát biểu nào đúng về tính đóng gói của class `Product`?

**A)** Đổi các method `setName`, `setPrice` và `setStock` thành `public` sẽ tăng tính đóng gói của class.  
**B)** Class không được đóng gói vì các field của `Product` là `private`.  
**C)** Tính đóng gói bị suy yếu vì constructor cho phép gán trực tiếp field mà không kiểm tra.  
**D)** Class `Product` nên có getter package-private để cải thiện tính đóng gói.  
**E)** Class được đóng gói đúng cách nhờ cung cấp getter `public` cho mọi field và setter `private` có kiểm tra, đảm bảo kiểm soát trạng thái của object.


**15. Xét các class sau được định nghĩa trong cùng một package:**

```java
class Account {
    private double balance;
    
    Account(double initialBalance) {
        if (initialBalance > 0) {
            balance = initialBalance;
        }
    }
    
    void deposit(double amount) {
        if (amount > 0) {
            balance += amount;
        }
    }
    
    protected double getBalance() {
        return balance;
    }
}

public class SavingsAccount extends Account {
    private double interestRate;
    
    public SavingsAccount(double initialBalance, double interestRate) {
        super(initialBalance);
        this.interestRate = interestRate;
    }
    
    public void applyInterest() {
        double interest = getBalance() * interestRate / 100;
        deposit(interest);
    }
}
```

Phát biểu nào về nguyên lý đóng gói và cách dùng access modifier mô tả đúng đoạn mã trên? Chọn tất cả đáp án đúng.

**A)** Class `SavingsAccount` không truy cập trực tiếp được field `balance` do access modifier `private` của nó trong class `Account`.  
**B)** Method `getBalance` nên là `public` để cho phép `SavingsAccount` truy cập số dư tài khoản.  
**C)** Method `deposit` trong class `Account` nên được đánh dấu `final` để ngăn việc override.  
**D)** Field `interestRate` trong class `SavingsAccount` vi phạm nguyên lý đóng gói vì nó là `private`.  
**E)** Class `Account` đóng gói field `balance` đúng cách, và `SavingsAccount` tuân thủ đóng gói khi truy cập `balance` thông qua `getBalance` và `deposit`.


**16. Xét class sau:**

```java
public final class Contact {
    private final String name;
    private final String email;
    private final Address address;

    public Contact(String name, String email, Address address) {
        this.name = name;
        this.email = email;
        this.address = new Address(address.getStreet(), address.getCity());
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public Address getAddress() {
        return new Address(address.getStreet(), address.getCity());
    }

    public static class Address {
        private final String street;
        private final String city;

        public Address(String street, String city) {
            this.street = street;
            this.city = city;
        }

        public String getStreet() {
            return street;
        }

        public String getCity() {
            return city;
        }
    }
}
```

Với cài đặt trên, phát biểu nào mô tả chính xác object `Contact`?

**A)** Object `Contact` là khả biến vì class `Address` không phải `final`.  
**B)** Object `Contact` là bất biến, nhưng chỉ vì nó không cung cấp setter.  
**C)** Object `Contact` là bất biến, và nó ngăn được việc rò rỉ trạng thái nội bộ khả biến nhờ sao chép phòng vệ.  
**D)** Object `Contact` là khả biến vì object `Address` có thể bị thay đổi qua method `getAddress`.  
**E)** Object `Contact` là bất biến nhưng không ngăn được việc truy cập trạng thái nội bộ khả biến của nó.
