---
layout: chapter

title: "Chương 5: Điều khiển luồng chương trình"
subtitle: "Controlling Program Flow"
exam_objectives:
  - "Tạo các cấu trúc điều khiển luồng chương trình gồm if/else, câu lệnh và biểu thức switch, vòng lặp, cùng câu lệnh break và continue."
  - "Cài đặt inheritance, bao gồm abstract type, sealed type và record class. Override method, kể cả method của class Object. Cài đặt polymorphism và phân biệt object type với reference type. Thực hiện ép kiểu tham chiếu, xác định kiểu object bằng toán tử instanceof, và pattern matching với instanceof cùng cấu trúc switch."

previous_link: "/ch04.html"
previous_title: "Working with Data"
next_link: "/ch06.html"
next_title: "Arrays, Generics, and Collections"
answers_link: "/ch05a.html"

description: "Câu lệnh if, pattern matching, record pattern, flow scoping, switch và switch expression, vòng lặp while/do-while/for/for-each, break, continue và nhãn trong Java 21."
order: 2
phase: "Chương 5"
tags: [Java, OCP, if, switch, Pattern Matching, Loop, break, continue]
---

## Câu lệnh `if`

Một trong những câu lệnh điều khiển luồng nền tảng nhất trong Java và nhiều ngôn ngữ lập trình khác là câu lệnh `if`. Nó cho phép chương trình đưa ra quyết định và chạy những nhánh mã khác nhau tuỳ theo điều kiện nào được thoả mãn.

Về bản chất, mục đích của câu lệnh `if` là thực thi một khối mã một cách có điều kiện. Nếu điều kiện đã nêu cho ra `true`, khối mã sẽ chạy. Nếu không, khối đó bị bỏ qua và chương trình tiếp tục với câu lệnh kế tiếp sau khối `if`.

Đây là sơ đồ luồng cho câu lệnh `if`:
```
          ┌─────────┐
          │  Start  │
          └────┬────┘
               │
         ┌─────┴─────┐
         │ Condition │
         └─────┬─────┘
               │
        ┌──────┴──────┐
   ┌────┤  Is true?   ├────┐
   │    └─────────────┘    │
   │                       │
┌──┴──┐                 ┌──┴──┐
│ Yes │                 │ No  │
│     │                 │     │
│─────┴──────────┐   ┌──┴─────┴─────┐
│    Execute     │   │  Execute     │
│    if block    │   │  else block  │
└─────────┬──────┘   └──────┬───────┘
          │                 │
          └────────┬────────┘
                   │
             ┌─────┴─────┐
             │   End     │
             └───────────┘
```

Cú pháp cơ bản của câu lệnh `if` như sau:
```java
if (condition) {
    // Code to execute if condition is true
}
```

Điều kiện đặt trong cặp ngoặc đơn và phải cho ra giá trị boolean, `true` hoặc `false`. Mã cần thực thi có điều kiện đặt trong cặp ngoặc nhọn. Nếu khối mã chỉ chứa một câu lệnh duy nhất, bạn bỏ được cặp ngoặc nhọn:
```java
if (x > 10) 
    System.out.println("x is greater than 10");
```

Tuy nhiên, dùng ngoặc nhọn được xem là thực hành tốt ngay cả với câu lệnh đơn, vì nó khiến mã rõ ràng hơn và ít sinh lỗi hơn nếu sau này bạn thêm câu lệnh vào khối.

Bạn nối nhiều điều kiện lại với nhau bằng cấu trúc `else if`:
```java
if (condition1) {
    // Code to execute if condition1 is true
} else if (condition2) {  
    // Code to execute if condition1 is false and condition2 is true
} else {
    // Code to execute if both condition1 and condition2 are false
}
```

Ở đây, mỗi điều kiện `else if` chỉ được kiểm tra nếu mọi điều kiện `if`/`else if` trước đó đều cho ra `false`. Ngay khi một điều kiện được xác định là `true`, khối tương ứng của nó chạy và phần còn lại của chuỗi `if`/`else if`/`else` bị bỏ qua. Khối `else` cuối cùng chạy nếu không điều kiện nào là `true`.

Không có giới hạn cứng về số lượng câu lệnh `else if` bạn dùng được, nhưng nếu bạn thấy mình có những chuỗi `if`/`else if` rất dài, hãy cân nhắc tái cấu trúc sang cách tiếp cận sạch hơn, như câu lệnh `switch` hoặc polymorphism.

Một điểm gây nhầm lẫn phổ biến là cố truy cập biến khai báo bên trong khối `if` từ khối `else` tương ứng:
```java
if (condition) {
    int x = 10;
} else {
    System.out.println(x); // Compile error - x is not in scope! 
}
```

Điều này thất bại vì biến khai báo bên trong khối `if` hay `else` chỉ nằm trong phạm vi của khối đó. Để dùng một biến ở cả phần `if` lẫn `else`, bạn phải khai báo nó bên ngoài (trước) câu lệnh `if`.

### Pattern matching trong câu lệnh `if`

Java đã và đang mở rộng khả năng pattern matching, giúp làm việc với cấu trúc dữ liệu phức tạp dễ hơn. Hãy xem pattern matching hoạt động thế nào với câu lệnh `if`.

#### Type pattern

Type pattern cho phép bạn kiểm tra một object có phải instance của một kiểu cụ thể không, và nếu đúng, tạo luôn một biến thuộc kiểu đó trong cùng một bước:

```java
if (obj instanceof String s) {
    System.out.println(s.toUpperCase());
}
```

Ở đây `obj` được kiểm tra xem có phải instance của `String` không. Nếu đúng, nó được ép sang `String` và gán cho biến pattern `s`, biến này sau đó dùng được trong khối `if`.

Có vài quy tắc khi dùng type pattern trong câu lệnh `if`:
- Kiểu của biến pattern phải là kiểu con của biến nằm bên trái `instanceof`.
- Biến pattern chỉ dùng được khi trình biên dịch khẳng định chắc chắn được kiểu của nó; nếu có nhập nhằng, nó có thể bị coi là chưa khởi tạo.
- Pattern matching dùng được với mọi biểu thức hợp lệ, kể cả lời gọi method, chứ không chỉ phép kiểm tra biến đơn giản.

Ví dụ:
```java
if (getObject() instanceof String s) {
    System.out.println(s); // s in scope here
} else {
    System.out.println(s); //Compile error! s is definitely not a String
}

// ...

Object getObject() {
    return "hi";
}
```

#### Record pattern

Java 21 giới thiệu **record pattern**, cho phép bạn tách rời (destructure) instance record ngay trong câu lệnh `if`. Điều này mang lại cách làm việc với dữ liệu mang tính khai báo và dễ kết hợp hơn. Ví dụ:
```java
record Book(String title, String author) {}

static void printDetails(Object obj) {
    if (obj instanceof Book(String title, String author)) {
        System.out.println("Title: " + title);
        System.out.println("Author: " + author);
    }
}
```

Trong đoạn mã này, `Book(String title, String author)` là một record pattern. Nó không chỉ kiểm tra `obj` có phải instance của `Book` không, mà còn trích luôn thành phần `title` và `author` vào các biến pattern. Điều này loại bỏ nhu cầu gọi riêng các accessor method.

Record pattern cũng lồng nhau được, cho phép bạn tách rời những đồ thị object phức tạp chỉ trong một bước:

```java
record Book(String title, String author) {}
record Library(String name, Book bestSeller) {}

Library myLibrary = new Library("City Library", new Book("Java Programming", "John Doe"));

if (myLibrary instanceof Library(var name, Book(var title, var author))) {
    System.out.println("Best seller at " + name + " is '" + title + "' by " + author);
}
```

Trong ví dụ này, ta dùng record pattern lồng nhau để khớp đồng thời với record `Library` và thành phần `Book` của nó. Nếu pattern khớp, ta truy cập trực tiếp được các thành phần `name`, `title` và `author` mà không cần dùng accessor method.

Record pattern cũng hoạt động với record generic. Trình biên dịch sẽ suy ra đối số kiểu khi có thể:
```java
record Box<T>(T t) {}

public class GenericRecord {
    static void unbox(Box<Box<Integer>> box) {
        if (box instanceof Box(Box(var u))) {
            System.out.println("Unboxed Integer: " + u);
        }
    }

    public static void main(String[] args) {
        unbox(new Box<>(new Box<>(8))); // Prints Unboxed Integer: 8
    }
}
```

Ở đây, trình biên dịch suy ra `u` là `Integer` dựa trên kiểu của `box`.

Cần lưu ý rằng record pattern **không** khớp với `null`. Nếu bạn cần xử lý giá trị `null` tiềm ẩn, hãy làm điều đó trước khi pattern matching:
```java
if (obj != null && obj instanceof Book(String title, String author)) {
    System.out.println("Title: " + title);
    System.out.println("Author: " + author);
}
```

Tóm lại, đây là những điểm mấu chốt về record pattern:

1. Chúng gồm kiểu record class theo sau là danh sách pattern trong ngoặc đơn cho từng thành phần.
2. Chúng lồng nhau được, cho phép tách rời cây phân cấp record phức tạp trong một pattern duy nhất.
3. Keyword `var` dùng được để suy ra kiểu của một thành phần.
4. Giá trị `null` không khớp với bất kỳ record pattern nào.
5. Với record class generic, đối số kiểu được suy ra nếu không nêu tường minh.

### Flow scoping (phạm vi theo luồng)

Một khái niệm quan trọng cần hiểu khi dùng pattern matching trong câu lệnh `if` là **flow scoping**. Nó nói về cách trình biên dịch suy luận phạm vi và khả năng dùng được của biến pattern dựa trên luồng điều khiển đi qua mã của bạn.

Xét ví dụ này:
```java
if (obj instanceof String s) {
    System.out.println(s); // s is definitely a String here
} else {
    System.out.println(s); // Compiler error: s might not be initialized
}
System.out.println(s); // Compiler error: s is not in scope here
```

Bên trong khối `if`, `s` chắc chắn là `String`; trình biên dịch biết điều này vì phép kiểm tra `instanceof` phải thành công thì khối đó mới chạy. Do đó dùng `s` như một `String` trong phạm vi này là an toàn.

Tuy nhiên, trong khối `else` tương ứng, `s` bị coi là chưa khởi tạo. Trình biên dịch không giả định điều ngược lại của điều kiện `if`; nó suy luận rằng nếu khối `else` đang chạy thì phép kiểm tra `instanceof` đã thất bại, nên `s` chưa bao giờ được gán giá trị. Cố dùng `s` ở đây sẽ gây lỗi biên dịch.

Bên ngoài toàn bộ câu lệnh `if-else`, `s` hoàn toàn không nằm trong phạm vi. Biến pattern chỉ truy cập được bên trong khối `if` nơi chúng được khai báo, và trong các khối `else if` hay `else` tiếp theo nếu trình biên dịch chứng minh được chúng chắc chắn đã được gán.

Flow scoping trở nên phức tạp hơn khi có nhiều biến pattern cùng tham gia:
```java
if (obj instanceof String s || obj instanceof Integer i) {
    // s or i is in scope, but not both 
} else {
    // neither s nor i are in scope
}
```

Trong trường hợp này, bên trong khối `if`, chỉ một trong hai biến `s` hoặc `i` nằm trong phạm vi, tuỳ theo phép kiểm tra `instanceof` nào thành công. Trình biên dịch không cho bạn dùng một biến pattern trừ khi nó khẳng định chắc chắn được biến đó đã được gán.

Nếu bạn cần dùng một biến pattern ở nhiều phạm vi, bạn phải gán nó riêng:
```java
String s = null;
if (obj instanceof String temp) {
    s = temp;
}
// s is now in scope, but may be null if the if block didn't execute
```

Điều này nghe có vẻ là hạn chế, nhưng thực chất là một tính năng an toàn mạnh mẽ. Bằng cách kiểm soát chặt phạm vi của biến pattern, Java giúp ngăn những lỗi phổ biến và khiến mã của bạn vững chắc hơn.

Đáng lưu ý rằng flow scoping chỉ áp dụng cho chính các biến pattern được khai báo, không áp dụng cho biến gốc. Trong ví dụ trên, `obj` vẫn nằm trong phạm vi xuyên suốt, vì nó được khai báo trước câu lệnh `if`.

## Câu lệnh `switch`

Đôi khi bạn cần kiểm tra giá trị của một biến hay biểu thức và chạy mã khác nhau tuỳ theo giá trị đó. Nếu chỉ có vài lựa chọn, câu lệnh `if-else` là đủ:

```java
String animal = "cat";
if(animal.equals("dog")) {
    System.out.println("Woof!");
} else {
    System.out.println("Meow!");
}
```

Nhưng nếu có nhiều giá trị cần kiểm tra thì sao? Bạn có thể nối một loạt câu lệnh `if-else`:

```java
String animal = "horse";
if(animal.equals("dog")) {
    System.out.println("Woof!"); 
} else if(animal.equals("cat")) {
    System.out.println("Meow!");
} else if(animal.equals("pig")) {
    System.out.println("Oink!");
} else if(animal.equals("horse")) {
    System.out.println("Neigh!");
} else {
    System.out.println("Unknown animal!");
}
```

Tuy nhiên cách này nhanh chóng trở nên cồng kềnh và lộn xộn. Đó là lúc câu lệnh `switch` xuất hiện. Nó cho phép bạn định nghĩa những khối mã riêng cho từng giá trị của một biến hay biểu thức.

Đây là sơ đồ cho câu lệnh `switch`:
```
┌─────────────────────────────────────┐
│          switch (variable)          │
│   ┌───────────────────────────────┐ │
│   │         case value1:          │ │
│   │           // code block       │ │
│   │           break;              │ │
│   ├───────────────────────────────┤ │
│   │         case value2:          │ │
│   │           // code block       │ │
│   │           break;              │ │
│   ├───────────────────────────────┤ │
│   │         case value3:          │ │
│   │           // code block       │ │
│   │           break;              │ │
│   ├───────────────────────────────┤ │
│   │         default:              │ │
│   │           // code block       │ │
│   └───────────────────────────────┘ │
└─────────────────────────────────────┘
```

Và đây là cú pháp cơ bản của nó:

```java
switch(variable) {
    case value1:
        // code to run if variable == value1
        break;
    case value2: 
        // code to run if variable == value2
        break;
    default:
        // code to run if no case matches
}
```

Vậy ví dụ về động vật viết lại gọn gàng hơn thành:

```java
String animal = "horse";
switch(animal) {
    case "dog":
        System.out.println("Woof!");
        break;
    case "cat":
        System.out.println("Meow!");
        break; 
    case "pig":
        System.out.println("Oink!");
        break;
    case "horse":
        System.out.println("Neigh!");
        break;
    default:
        System.out.println("Unknown animal!");
}
```

Mỗi `case` định nghĩa một giá trị để so sánh với biến của switch. Nếu khớp, mã của case đó chạy. Lệnh `break` khiến việc thực thi nhảy tới cuối khối `switch`. Nếu không case nào khớp, khối `default` chạy.

Cần đưa câu lệnh `break` (hoặc `return`) vào từng case, nếu không việc thực thi sẽ *rơi xuyên* (fall through) sang case kế tiếp — điều hiếm khi bạn muốn. Case `default` không cần `break` tường minh vì nó là case cuối cùng.

### Các kiểu dùng được trong `case`

Không phải kiểu nào cũng dùng được trong `switch`. Trước đây, switch chỉ làm việc được với những kiểu số nguyên sau cùng wrapper class của chúng:
- `int`/`Integer`
- `byte`/`Byte`
- `short`/`Short`
- `char`/`Character`

Sau đó, ở những phiên bản Java mới hơn, `String`, record và hằng số của `enum` được bổ sung.

Ngoài ra, bạn dùng được `var` trong câu lệnh `switch` miễn là kiểu suy ra được là một trong những kiểu được phép:

```java
var animal = "horse";
switch(animal) {
    case "dog":
        System.out.println("Woof!");
        break;
    case "cat":
        System.out.println("Meow!");
        break; 
    case "pig":
        System.out.println("Oink!");
        break;
    case "horse":
        System.out.println("Neigh!");
        break;
    default:
        System.out.println("Unknown animal!");
}
```

Trong trường hợp này, `animal` được suy ra là `String` dựa trên giá trị gán cho nó. Vì `String` là kiểu hợp lệ cho switch nên dùng `var` ở đây hoàn toàn ổn.

Tuy nhiên, nếu bạn thử làm thế này:

```java
var data = 3.14;
switch(data) {
    // ...
}
```

Bạn sẽ nhận lỗi biên dịch vì `data` được suy ra là `double`, kiểu không được phép trong câu lệnh `switch`.

Về enum, hãy xét một interface `Season` và một enum `Weather` implement interface này:

```java
sealed interface Season permits Weather {}
enum Weather implements Season { SPRING, SUMMER, FALL, WINTER }
```

Ở những phiên bản Java cũ hơn, câu lệnh switch yêu cầu bạn chỉ dùng tên đơn giản của hằng số enum:

```java
void oldEnumSwitch(Weather w) {
    switch (w) {
        case SPRING -> {
            System.out.println("It's spring!");
        }
        case SUMMER -> {
            System.out.println("It's summer!");
        }
        case FALL -> {
            System.out.println("It's fall!");
        }
        case WINTER -> {
            System.out.println("It's winter!");
        }
    }
}
```

Hạn chế này ổn với những tình huống cơ bản nhưng trở nên cồng kềnh khi xử lý những kịch bản phức tạp hơn, như kết hợp nhiều kiểu enum hoặc dùng sealed interface.

Trong Java 21, bạn giờ dùng được tên đầy đủ (fully qualified) của hằng số enum và trộn chúng với các nhãn case khác, mang lại sự linh hoạt lớn hơn và cho phép viết biểu thức switch phức tạp hơn:

```java
void newEnumSwitch1(Season s) {
    switch (s) {
        case Weather.SPRING -> {  // Qualified name of enum constant
            System.out.println("It's spring!");
        }
        case Weather.SUMMER -> {
            System.out.println("It's summer!");
        }
        case Weather.FALL -> {
            System.out.println("It's fall!");
        }
        case Weather.WINTER -> {
            System.out.println("It's winter!");
        }
    }
}
```

Thêm nữa, yêu cầu rằng biểu thức chọn (selector expression) phải thuộc kiểu enum cũng được nới lỏng, cho phép bạn dùng tên đầy đủ của hằng số enum ngay cả khi biểu thức chọn không thuộc kiểu enum đó, miễn là tương thích về gán — như trong ví dụ trên.

Tuy nhiên, một trường hợp dùng không hợp lệ là khi hằng số enum không được viết đầy đủ:

```java
void invalidEnumSwitch(Season s) {
    switch (s) {
        case SPRING -> { // Error: SPRING must be qualified as Weather.SPRING
            System.out.println("It's spring!");
        }
        case Weather.SUMMER -> {
            System.out.println("It's summer!");
        }
        case Weather.FALL -> {
            System.out.println("It's fall!");
        }
        case Weather.WINTER -> {
            System.out.println("It's winter!");
        }
        default -> {
            System.out.println("Unknown season");
        }
    }
}
```

### Giá trị trong `case`

Khi định nghĩa giá trị cho từng `case`, có vài quy tắc quan trọng cần nhớ. Giá trị phải là **hằng số tại thời điểm biên dịch** (compile-time constant), nghĩa là nó phải được biết lúc mã được biên dịch chứ không phải xác định lúc chạy.

Vậy nên bạn dùng được giá trị literal như `"dog"` hay `3`, biến `final` (miễn là chúng được khởi tạo bằng giá trị hằng), và hằng số `enum`. Nhưng bạn không dùng được biến thường hay lời gọi method, ngay cả khi method luôn trả về cùng một giá trị. Ví dụ:

```java
final int NUMBER = 2;

int getSome() {
    return 1;
}

int x = 3;

switch(value) {
    case NUMBER: // OK, NUMBER is final and initialized with a constant
    case getSome(): // Error! Method calls aren't allowed
    case x: // Error! x is not final
    ...
}
```

Đôi khi bạn muốn chạy cùng một đoạn mã cho nhiều giá trị `case`. Thay vì lặp lại mã, bạn chỉ cần liệt kê các giá trị cùng nhau cho một case duy nhất:

```java
int dayNumber;
switch(dayName) {
    case "Monday":
        dayNumber = 1;
        break;
    case "Tuesday":
        dayNumber = 2;
        break;
    case "Saturday", "Sunday": // Runs the same code for "Saturday" and "Sunday"
        dayNumber = 0;
        break;
    default:
        throw new IllegalArgumentException("Invalid day: " + dayName);
}
```

Điều này đã nhắc ở trên nhưng đáng nói lại: đừng quên `break` ra khỏi từng khối case (hoặc dùng `return`), trừ khi bạn cố ý muốn việc thực thi rơi xuyên sang case kế tiếp. Quên `break` là nguồn lỗi phổ biến trong câu lệnh switch.

### Biểu thức `switch`

Java 14 chính thức giới thiệu một dạng `switch` mới, gọi là **switch expression** (biểu thức switch). Nó có vài khác biệt then chốt so với câu lệnh `switch` truyền thống. Trước hết là cú pháp:

```java
variable = switch(anotherVariable) {
    case value1 -> expression1;
    case value2 -> { statements; yield expression2; }
    default -> expression3;
};
```

Thay vì `case:` và `break`, biểu thức switch dùng `->` để ánh xạ mỗi case tới một giá trị hoặc khối mã. Nếu bạn cần nhiều câu lệnh cho một case, hãy dùng ngoặc nhọn cùng keyword `yield` để chỉ rõ giá trị trả về.

Chú ý các dấu chấm phẩy. Mỗi case cần một dấu ở cuối, và toàn bộ biểu thức `switch` cũng vậy.

Biểu thức `switch` phải luôn trả về một giá trị, và các case phải phủ hết mọi khả năng (tường minh hoặc bằng `default`). Kiểu dữ liệu của mọi kết quả `case` cũng phải nhất quán với nhau.

Đây là ví dụ cụ thể hơn:

```java
String animal = "horse";
String sound = switch(animal) {
    case "dog" -> "Woof!";
    case "cat" -> "Meow!";
    case "pig" -> "Oink!";
    case "horse" -> "Neigh!";
    case "human" -> {
        String greeting = "Hello!";
        yield greeting; // Use yield when there are multiple statements
    }
    default -> throw new IllegalArgumentException("Unknown animal: " + animal);
};
```

Trong trường hợp này, mỗi con vật được ánh xạ trực tiếp tới âm thanh nó tạo ra, trừ `human` có một khối mã. Case `default` ném exception vì biểu thức `switch` phải phủ hết mọi giá trị đầu vào khả dĩ.

### Pattern matching trong câu lệnh `switch`

Java 21 giới thiệu một tính năng mới mạnh mẽ: pattern matching trong câu lệnh và biểu thức `switch`. Nó cho phép bạn kiểm tra cấu trúc của một object ngay trong `switch`, khiến mã biểu đạt tốt hơn và ít sinh lỗi hơn.

Hãy bắt đầu bằng một ví dụ đơn giản:

```java
Object obj = "Hello, World!";
String result = switch (obj) {
    case Integer i -> "It's an integer: " + i;
    case String s -> "It's a string: " + s;
    case Double d -> "It's a double: " + d;
    default -> "It's something else";
};
System.out.println(result); // Outputs: It's a string: Hello, World!
```

Trong ví dụ này, ta switch trên một `Object`, và mỗi case kiểm tra object có thuộc một kiểu cụ thể không. Nếu khớp, ta dùng trực tiếp được biến khai báo trong pattern (như `s` cho String) trong thân case.

Ta thêm được **guard** vào nhãn case để khớp chính xác hơn nữa:

```java
Object obj = 42;
String category = switch (obj) {
    case Integer i when i < 0 -> "Negative integer";
    case Integer i when i > 0 -> "Positive integer";
    case Integer i -> "Zero";
    case String s when s.length() > 5 -> "Long string";
    case String s -> "Short string";
    default -> "Something else";
};
System.out.println(category); // Outputs: Positive integer
```

Mệnh đề `when` cho phép ta thêm điều kiện bổ sung vào pattern matching.

Tuy nhiên, khi dùng pattern matching, **thứ tự các case rất quan trọng**. Pattern cụ thể hơn phải đứng trước pattern tổng quát hơn:

```java
Object obj = "Hello";
String result = switch (obj) {
    case String s when s.length() > 5 -> "Long string";
    case String s -> "Short string";
    case CharSequence cs -> "Some other CharSequence";
    default -> "Not a CharSequence";
};
System.out.println(result); // Outputs: Short string
```

Nếu ta đặt `case String s` trước `case String s when s.length() > 5`, guard sẽ không bao giờ được tới, và trình biên dịch sẽ báo lỗi biên dịch về case không thể tới được (unreachable case).

Pattern matching trong switch cũng đưa ra cách xử lý giá trị `null` thanh lịch hơn:

```java
String str = null;
String description = switch (str) {
    case null -> "It's null!";
    case String s -> "It's a string of length " + s.length();
};
System.out.println(description); // Outputs: It's null!
```

Trong switch truyền thống, giá trị `null` sẽ ném `NullPointerException`. Với pattern matching, ta xử lý được trường hợp `null` một cách tường minh.

Tuy nhiên, bạn phải cẩn thận để chỉ có **một** nhãn case khớp-tất-cả (match-all) trong một khối `switch`. Ví dụ, nếu bạn thêm case `default` vào ví dụ trên:

```java
String str = null;
String description = switch (str) {
    case null -> "It's null!";
    case String s -> "It's a string of length " + s.length();
    default -> "default";
};
System.out.println(description); // Outputs: It's null!
```

Bạn sẽ nhận lỗi biên dịch: `switch has both an unconditional pattern and a default label`.

Có nhiều hơn một nhãn case khớp-tất-cả trong câu lệnh hay biểu thức `switch` sẽ sinh lỗi biên dịch. Những nhãn case khớp-tất-cả gồm:
- Nhãn case với pattern khớp vô điều kiện với biểu thức chọn
- Nhãn case `default`

Tuy nhiên, đoạn sau biên dịch được:
```java
Object obj = null; // Notice the Object type
String description = switch (obj) {
    case String s -> "It's a string of length " + s.length();
    case null, default  -> "It's null or not a string!";
};
System.out.println(description); // Outputs: It's null or not a string!
```

Nếu biểu thức chọn cho ra `null` và khối switch không có nhãn case `null`, như trong trường hợp sau:
```java
Object obj = null;
String description = switch (obj) { // Throws NullPointerException
    case String s -> "It's a string of length " + s.length();
    default  -> "It's null or not a string";
};
System.out.println(description); 
```

Thì một `NullPointerException` sẽ được ném ra.

Một lợi ích then chốt khác của pattern matching trong `switch` là **kiểm tra tính đầy đủ** (exhaustiveness checking). Trình biên dịch đảm bảo mọi trường hợp khả dĩ đều được phủ:

```java
sealed interface Shape permits Circle, Rectangle, Triangle {}
record Circle(double radius) implements Shape {}
record Rectangle(double width, double height) implements Shape {}
record Triangle(double base, double height) implements Shape {}

public class SwitchExhaustiveness {
    public static void main(String[] args) {
        Shape shape = new Circle(5);
        double area = switch (shape) {
            case Circle c -> Math.PI * c.radius() * c.radius();
            case Rectangle r -> r.width() * r.height();
            case Triangle t -> 0.5 * t.base() * t.height();
        };
        System.out.println("Area: " + area);
    }
}
```

Trong ví dụ này, vì `Shape` là sealed interface và ta đã phủ hết mọi lớp con được phép, trình biên dịch biết rằng ta đã phủ đầy đủ mọi khả năng. Nếu biểu thức thuộc kiểu `sealed`, chỉ những class khai báo trong mệnh đề `permits` của kiểu `sealed` mới cần được `switch` xử lý.

Tuy nhiên, nếu bạn không phủ hết mọi khả năng:
```java
double area = switch (shape) {
    case Circle c -> Math.PI * c.radius() * c.radius();
    case Rectangle r -> r.width() * r.height();
};
```

Một lỗi biên dịch được sinh ra: `switch expression does not cover all possible input values`.

Vấn đề khắc phục được đơn giản bằng cách thêm case `default`:
```java
double area = switch (shape) {
    case Circle c -> Math.PI * c.radius() * c.radius();
    case Rectangle r -> r.width() * r.height();
    default -> 0;
};
```

Cuối cùng, trong câu lệnh `switch`, trình biên dịch cũng suy ra được đối số kiểu cho record pattern generic. Ví dụ, với khai báo record sau:
```java
record Point<T, U>(T x, U y) { }
```

Trình biên dịch suy ra được `Point(var x, var y)` là `Point<Long, Long>(Long x, Long x)`:
```java
Point<Long, Long> p = new Point(1L, 2L);

switch (p) {
    case Point(var x, var y) -> 
        System.out.println(x + ", " + y);
}
```

## Vòng lặp `while`

Vòng lặp `while` cho phép bạn lặp đi lặp lại một khối mã chừng nào điều kiện `boolean` đã nêu còn `true`.

Đây là sơ đồ luồng cho câu lệnh `while`:
```
          ┌─────────┐
          │  Start  │
          └────┬────┘
               │
         ┌─────┴─────┐
    ┌────┤ Condition │
    │    └─────┬─────┘
    │          │
    │    ┌─────┴─────┐
    │    │  Is true? ├───────┐
    │    └─────┬─────┘       │
    │          │             │
    │    ┌─────┴─────┐ ┌─────┴─────┐
    │    │    Yes    │ │    No     │
    │    └─────┬─────┘ └─────┬─────┘
    │          │             │
    │    ┌─────┴─────┐       │
    │    │  Execute  │       │
    │    │   Loop    │       │
    │    │   Body    │       │
    │    └─────┬─────┘       │
    │          │             │
    └──────────┘             │
                             │
                        ┌────┴────┐
                        │  End    │
                        └─────────┘
```

Thực ra có hai biến thể của vòng lặp `while` trong Java:
1. Vòng lặp `while` chuẩn
2. Vòng lặp `do-while`

Vòng lặp `while` chuẩn có cấu trúc như sau:
```java
while(condition) {
    // code block to be executed
}
```

Điều kiện là một biểu thức `boolean` được tính trước mỗi lần lặp. Nếu điều kiện là `true`, khối mã được thực thi. Quá trình này lặp lại cho tới khi điều kiện trở thành `false`.

Cần lưu ý rằng nếu điều kiện là `false` ngay lần đầu tới vòng lặp, khối mã sẽ hoàn toàn không được chạy. Vòng lặp bị bỏ qua toàn bộ.

Đây là ví dụ in các số từ 0 tới 9:
```java
int count = 0;
while(count < 10) {
    System.out.println(count);
    count++;
}
```

Vòng lặp tiếp tục chạy cho tới khi `count` không còn nhỏ hơn 10.

Vòng lặp `do-while` tương tự vòng lặp `while` chuẩn nhưng có một khác biệt then chốt: điều kiện được tính **sau** khi khối mã đã chạy. Nghĩa là khối mã luôn chạy ít nhất một lần, ngay cả khi điều kiện ban đầu là `false`.

Đây là cú pháp của vòng lặp `do-while`:
```java
do {
    // code block to be executed
} while(condition);
```

Như bạn thấy, khối mã đứng trước keyword `while` và điều kiện. Điều kiện được kiểm tra sau mỗi lần lặp, quyết định vòng lặp có tiếp tục hay dừng lại.

Ví dụ sau tương đương về mặt chức năng với ví dụ `while` trước đó:
```java
int count = 0; 
do {
    System.out.println(count);
    count++;
} while(count < 10);
```

Dù cấu trúc khác nhau, vòng lặp `do-while` này cho cùng kết quả như vòng lặp `while` chuẩn: in các số từ 0 tới 9.

Vậy tại sao bạn lại chọn `do-while` thay vì `while` chuẩn? Điều đó thực sự phụ thuộc vào bài toán cụ thể bạn đang giải. Nếu bạn biết mình luôn muốn khối mã chạy ít nhất một lần bất kể trạng thái điều kiện ban đầu, `do-while` là lựa chọn tốt và làm rõ ý định của bạn hơn. Tuy nhiên, trong nhiều trường hợp, vòng lặp `while` chuẩn là đủ và phổ biến hơn.

### Vòng lặp lồng nhau

Bạn đặt được một vòng lặp bên trong thân của vòng lặp khác. Điều này gọi là lồng vòng lặp (loop nesting). Vòng lặp lồng nhau cho phép bạn duyệt qua nhiều chiều, chẳng hạn hàng và cột của một mảng hai chiều.

Đây là ví dụ dùng vòng lặp `while` lồng nhau để in bảng cửu chương:
```java
int i = 1;
while(i <= 10) {
    int j = 1;
    while(j <= 10) {
        System.out.print(i * j + "\t");
        j++;
    }
    System.out.println();
    i++;
}
```

Vòng lặp ngoài chạy từ 1 tới 10, tượng trưng cho các hàng của bảng cửu chương. Với mỗi lần lặp của vòng ngoài, vòng lặp trong cũng chạy từ 1 tới 10, tượng trưng cho các cột. Tích của giá trị hàng và cột hiện tại được in ra, theo sau là ký tự tab (`\t`) để định dạng. Sau khi mỗi hàng hoàn tất, một dấu xuống dòng được in để chuyển sang hàng kế tiếp.

Dù ví dụ này dùng vòng lặp `while`, bạn cũng lồng được vòng lặp `do-while` theo cách tương tự. Việc chọn loại vòng lặp phụ thuộc vào yêu cầu cụ thể của bài toán.

### Câu lệnh `break` và `continue`

Câu lệnh `break` được dùng để dừng ngay lập tức một vòng lặp hoặc câu lệnh switch. Khi gặp bên trong vòng lặp, `break` khiến quyền điều khiển chương trình chuyển tới câu lệnh kế tiếp sau vòng lặp.

Đây là ví dụ dùng `break` trong vòng lặp `while`:
```java
int count = 0;
while(true) {
    System.out.println(count);
    count++;
    if(count >= 5) {
        break;
    }
}
```

Vòng lặp này sẽ chạy vô hạn vì điều kiện luôn `true`. Tuy nhiên, câu lệnh `break` bên trong vòng lặp khiến nó dừng lại ngay khi `count` đạt 5.

Mặt khác, câu lệnh `continue` được dùng để bỏ qua phần còn lại của lần lặp hiện tại và chuyển ngay sang lần lặp kế tiếp.

Đây là ví dụ dùng `continue`:
```java
int i = 0;
while(i < 10) {
    if(i % 2 == 0) {
        i++;
        continue;
    }
    System.out.println(i);
    i++;
}
```

Vòng lặp này chạy từ 0 tới 9. Tuy nhiên, khi `i` là số chẵn (chia hết cho 2), câu lệnh `continue` được thực thi, khiến phần còn lại của lần lặp bị bỏ qua. Kết quả là chỉ những số lẻ được in ra.

Tuy nhiên, cần lưu ý rằng dùng `break` hay `continue` đôi khi dẫn tới mã không thể tới được (unreachable code), gây lỗi biên dịch.

Xét ví dụ này:
```java
while(condition) {
    // code block
    break;
    // more code
}
```

Mã sau câu lệnh `break` sẽ không bao giờ được chạy vì `break` luôn khiến vòng lặp dừng lại. Trình biên dịch Java phát hiện điều này và báo lỗi biên dịch "unreachable code".

Điều tương tự áp dụng cho `continue`. Bất kỳ mã nào đặt sau câu lệnh `continue` trong cùng lần lặp đều không thể tới được.

Để tránh những lỗi này, hãy đảm bảo mọi mã đặt sau `break` hay `continue` đều có cơ hội chạy trong một điều kiện nào đó.

### Thêm nhãn (label)

Cuối cùng, bạn gắn được một nhãn (label) cho vòng lặp. Nhãn cung cấp cách thoát khỏi hoặc tiếp tục một vòng lặp ngoài cụ thể từ bên trong vòng lặp lồng nhau. Đây là cú pháp thêm nhãn cho vòng lặp:
```java
label: 
while(condition) {
    // code block
}
```

Nhãn là một identifier theo sau bởi dấu hai chấm. Nó được đặt ngay trước khai báo vòng lặp.

Đây là ví dụ minh hoạ việc dùng nhãn:
```java
int i = 0;
outerLoop:
while(i < 10) {
    int j = 0;
    while(j < 10) {
        if(j == 5) {
            break outerLoop;
        }
        System.out.println("i: " + i + ", j: " + j);
        j++;
    }
    i++;
}
```

Trong trường hợp này, vòng lặp ngoài được gắn nhãn `outerLoop`. Bên trong vòng lặp lồng, có một điều kiện kiểm tra `j` có bằng 5 không. Khi điều kiện này thoả mãn, câu lệnh `break` được dùng cùng nhãn `outerLoop`, khiến việc thực thi nhảy ra khỏi cả vòng trong lẫn vòng ngoài. Không có nhãn, `break` sẽ chỉ thoát khỏi vòng lặp trong.

Giống `break`, `continue` cũng dùng được với nhãn để nhảy tới lần lặp kế tiếp của vòng lặp ngoài.

Đây là ví dụ minh hoạ:
```java
int i = 0;
outerLoop:
while(i < 3) {
    int j = 0;
    while(j < 3) {
        if(i == 1 && j == 1) {
            i++;
            continue outerLoop;
        }
        System.out.println("i: " + i + ", j: " + j);
        j++;
    }
    i++;
}
```

Trong ví dụ này, vòng lặp ngoài được gắn nhãn `outerLoop`. Vòng lặp ngoài duyệt giá trị `i` từ 0 tới 2, còn vòng lặp trong duyệt giá trị `j` từ 0 tới 2.

Bên trong các vòng lặp lồng nhau, có một điều kiện kiểm tra cả `i` và `j` có bằng 1 không. Khi điều kiện này thoả mãn, câu lệnh `continue` được dùng cùng nhãn `outerLoop`. Điều này khiến quyền điều khiển chương trình nhảy ngay tới lần lặp kế tiếp của vòng lặp ngoài, bỏ qua phần còn lại của vòng lặp trong.

Kết quả, đầu ra của đoạn mã này sẽ là:
```
i: 0, j: 0
i: 0, j: 1
i: 0, j: 2
i: 1, j: 0
i: 2, j: 0
i: 2, j: 1
i: 2, j: 2
```

Chú ý rằng dòng `i: 1, j: 1` bị thiếu, vì khi cả `i` và `j` đều bằng 1, câu lệnh `continue outerLoop` được thực thi, khiến chương trình nhảy tới lần lặp kế tiếp của vòng lặp ngoài, bỏ qua câu lệnh in.

Dùng `continue` với nhãn ít phổ biến hơn dùng `break` với nhãn, nhưng nó hữu ích trong những tình huống bạn muốn bỏ qua nhiều tầng vòng lặp lồng nhau dựa trên một điều kiện nhất định.

## Vòng lặp `for`

Giống vòng lặp `while`, vòng lặp `for` được dùng để lặp đi lặp lại một khối mã. Tuy nhiên, vòng lặp `for` cung cấp cú pháp súc tích hơn để duyệt qua một dải giá trị hoặc các phần tử trong một collection.

Trong Java có hai loại vòng lặp `for`:
- Vòng lặp `for` truyền thống
- Vòng lặp `for-each` (còn gọi là vòng lặp `for` nâng cao)

Đây là sơ đồ với những điểm mấu chốt của vòng lặp `for`:
```
┌─────────────────────────────────────────────────────────────┐
│                     Java for Loops                          │
│                                                             │
│  Traditional for Loop        │     for-each Loop            │
│                              │                              │
│  for (int i = 0; i < 5; i++) │  for (int num : numbers) {   │
│  {                           │      // code block           │
│      // code block           │  }                           │
│  }                           │                              │
│                              │                              │
│  Components:                 │  Components:                 │
│  1. Initialization           │  1. Element variable         │
│  2. Condition                │  2. Collection to iterate    │
│  3. Update statement         │                              │
│                              │                              │
│  Use when:                   │  Use when:                   │
│  - Need index                │  - Don't need index          │
│  - Custom increments         │  - Iterating full collection │
│  - Multiple counters         │  - Simpler syntax preferred  │
└─────────────────────────────────────────────────────────────┘
```

Hãy bắt đầu bằng việc xem xét kỹ hơn vòng lặp `for` truyền thống.

### Vòng lặp `for` truyền thống

Vòng lặp `for` truyền thống có cấu trúc sau:
```java
for(initialization; booleanExpression; updateStatement) {
    // code block to be executed
}
```

Vòng lặp gồm ba phần phân tách bởi dấu chấm phẩy:
1. **Khởi tạo (initialization):** Đây là nơi bạn khởi tạo biến điều khiển vòng lặp. Nó chỉ chạy một lần duy nhất ở đầu vòng lặp.

2. **Biểu thức boolean:** Đây là điều kiện được kiểm tra trước mỗi lần lặp. Nếu cho ra `true`, vòng lặp tiếp tục. Nếu `false`, vòng lặp dừng.

3. **Câu lệnh cập nhật (update):** Đây là nơi bạn nêu cách cập nhật biến điều khiển sau mỗi lần lặp. Nó chạy ở cuối mỗi lần lặp.

Đây là ví dụ đơn giản in các số từ 0 tới 4:
```java
for(int i = 0; i < 5; i++) {
    System.out.println(i);
}
```

Vòng lặp khởi tạo `i` bằng 0, kiểm tra `i` có nhỏ hơn 5 không, và nếu đúng thì chạy khối mã (in giá trị của `i`). Sau mỗi lần lặp, `i` tăng thêm 1. Vòng lặp tiếp tục cho tới khi `i` không còn nhỏ hơn 5.

Bạn cũng dùng được keyword `var` ở phần khởi tạo:
```java
for(var i = 0; i < 5; i++) {
    System.out.println(i);
}
```

Nếu bạn bỏ trống biểu thức boolean, nó mặc định là `true`, tạo ra vòng lặp vô hạn:
```java
for(int i = 0; ; i++) {
    System.out.println(i);
}
```

Vòng lặp này chạy mãi vì không có điều kiện nào khiến nó thành `false`. Để dừng một vòng lặp vô hạn, bạn cần dùng câu lệnh `break` hoặc cách khác để ngắt vòng lặp.

Bạn khởi tạo được nhiều biến và đưa vào nhiều câu lệnh cập nhật trong vòng lặp `for` bằng cách phân tách chúng bởi dấu phẩy:
```java
for(int i = 0, j = 10; i < j; i++, j--) {
    System.out.println("i: " + i + ", j: " + j);
}
```

Vòng lặp này khởi tạo `i` bằng 0 và `j` bằng 10, kiểm tra `i` có nhỏ hơn `j` không, và nếu đúng thì chạy khối mã. Sau mỗi lần lặp, `i` tăng và `j` giảm.

Cần lưu ý rằng bạn không khai báo lại được một biến trong khối khởi tạo của vòng lặp `for`:
```java
int i = 0;
for(int i = 0; i < 5; i++) { // Doesn't compile
    System.out.println(i);
}
```

Đoạn mã này không biên dịch được vì `i` được khai báo hai lần. Nếu bạn cần dùng một biến đã được khai báo, chỉ cần bỏ kiểu dữ liệu trong khối khởi tạo:
```java
int i = 0;
for(i = 0; i < 5; i++) { // OK
    System.out.println(i);
}
```
Ngoài ra, mọi biến khai báo trong khối khởi tạo phải cùng kiểu dữ liệu hoặc kiểu tương thích:
```java
for(int i = 0, long j = 10; i < j; i++, j--) { // Doesn't compile
    System.out.println("i: " + i + ", j: " + j);
}
```

Đoạn mã này không biên dịch được vì `i` kiểu `int` còn `j` kiểu `long`. Đây là ví dụ đã sửa:
```java
for(int i = 0, j = 10; i < j; i++, j--) {
    System.out.println("i: " + i + ", j: " + j);
}
```

Cách khác, nếu bạn cần dùng các kiểu dữ liệu khác nhau, hãy khai báo chúng trước vòng lặp:

```java
int i = 0;
long j = 10;
for(; i < j; i++, j--) {
    System.out.println("i: " + i + ", j: " + j);
}
```

Về phạm vi của biến khai báo trong khối khởi tạo, nó giới hạn trong vòng lặp `for`. Bạn không dùng được nó bên ngoài vòng lặp:
```java
for(int i = 0; i < 5; i++) {
    System.out.println(i);
}
System.out.println(i); // Doesn't compile
```

Một lần nữa, nếu bạn cần dùng giá trị cuối của biến điều khiển sau vòng lặp, bạn phải khai báo nó trước vòng lặp:
```java
int i;
for(i = 0; i < 5; i++) {
    System.out.println(i);
}
System.out.println(i); // OK, prints 5
```
Trong nhiều trường hợp, bạn có thể cần so sánh biến điều khiển hiện tại với các phần tử khác trong vòng lặp. Vòng lặp `for` truyền thống cho phép làm điều này bằng cách đọc phần tử tiến hoặc lùi:
```java
int[] arr = {1,2,3,4,5};
for(int i = 0; i < arr.length; i++) {
    // Read forward
    if(i < arr.length - 1) {
        System.out.println("Current: " + arr[i] + ", Next: " + arr[i+1]);
    }
 
    // Read backward
    if(i > 0) {
        System.out.println("Current: " + arr[i] + ", Previous: " + arr[i-1]);
    }
}
```

Điều kiện `if` đọc tiến kiểm tra phần tử hiện tại có phải phần tử cuối không, và nếu không thì in phần tử hiện tại cùng phần tử kế tiếp.

Điều kiện `if` đọc lùi kiểm tra phần tử hiện tại có phải phần tử đầu không, và nếu không thì in phần tử hiện tại cùng phần tử liền trước.

### Vòng lặp `for-each`

Vòng lặp `for-each`, còn gọi là vòng lặp `for` nâng cao, cung cấp cách đơn giản hơn để duyệt qua mảng và collection. Nó loại bỏ nhu cầu khai báo và cập nhật biến điều khiển một cách tường minh.

Cấu trúc của vòng lặp `for-each` như sau:
```java
for(dataType item : collection) {
    // code block to be executed
}
```

Vòng lặp gồm hai phần với ba thành tố:
1. **dataType:** Kiểu dữ liệu của các phần tử trong collection.

2. **item:** Biến giữ phần tử hiện tại trong mỗi lần lặp.

3. **collection:** Mảng hoặc collection cần duyệt.

Đây là ví dụ in các phần tử của một mảng bằng vòng lặp `for-each`:
```java
int[] numbers = {1, 2, 3, 4, 5};
for(int num : numbers) {
    System.out.println(num);
}
```

Ở mỗi lần lặp, vòng lặp gán phần tử kế tiếp của mảng `numbers` cho biến `num` rồi chạy khối mã.

Vòng lặp `for-each` dùng được với mảng và với mọi object implement interface `Iterable`, bao gồm hầu hết các class collection như `ArrayList` và `HashSet`.

Nếu bạn thắc mắc liệu mọi thứ áp dụng cho vòng lặp `for` có áp dụng cho `for-each` không, câu trả lời là không hẳn. Dù `for` và `for-each` có vài điểm chung, chúng vẫn khác nhau ở vài chỗ then chốt về hành vi và khả năng:

1. **Duyệt:** Vòng lặp `for-each` tự động duyệt qua mọi phần tử trong mảng hay collection, từ đầu tới cuối. Bạn không kiểm soát được chỉ số hay thứ tự duyệt. Ngược lại, vòng lặp `for` truyền thống cho bạn toàn quyền kiểm soát phần khởi tạo, điều kiện và cập nhật, cho phép duyệt theo thứ tự bất kỳ hoặc bỏ qua phần tử.

2. **Sửa đổi:** Vòng lặp `for-each` không ngăn bạn sửa các phần tử của mảng hay collection bên trong vòng lặp, nhưng nó không cho truy cập trực tiếp vào chỉ số. Bạn sửa được phần tử nếu collection bên dưới hỗ trợ. Ngược lại, vòng lặp `for` truyền thống cho phép sửa phần tử bằng cách truy cập qua chỉ số của chúng.

3. **Duyệt mảng và collection:** Vòng lặp `for-each` dùng được để duyệt mảng và mọi object implement interface `Iterable`, bao gồm hầu hết class collection. Vòng lặp `for` truyền thống cũng duyệt được mảng và collection, nhưng bạn cần dùng chỉ số tường minh hoặc iterator.

4. **Truy cập chỉ số:** Trong vòng lặp `for-each`, bạn không truy cập trực tiếp được chỉ số của phần tử hiện tại. Nếu cần chỉ số, bạn phải dùng vòng lặp `for` truyền thống — nó cho bạn truy cập chỉ số qua biến điều khiển.

5. **Hiệu năng:** Với mảng, khác biệt hiệu năng giữa `for-each` và `for` truyền thống nhìn chung không đáng kể. Với collection, hiệu năng cũng tương đương vì `for-each` là cú pháp đường cho việc dùng iterator.

Đây là ví dụ minh hoạ tình huống không dùng được vòng lặp `for-each`:

```java
int[] numbers = {1, 2, 3, 4, 5};
for(int i = 0; i < numbers.length; i++) {
    if(numbers[i] % 2 == 0) {
        numbers[i] *= 2; // Double even numbers
    }
}
```

Trong trường hợp này, ta cần sửa các phần tử của mảng dựa trên một điều kiện. Ta cũng cần truy cập chỉ số để thực hiện việc sửa. Điều này không làm được với vòng lặp `for-each`.

Tuy nhiên, nếu ta chỉ cần in ra các số chẵn đã nhân đôi, vòng lặp `for-each` là phù hợp:

```java
int[] numbers = {1, 2, 3, 4, 5};
for(int num : numbers) {
    if(num % 2 == 0) {
        System.out.println(num * 2); // Print doubled even numbers
    }
}
```

Tóm lại, vòng lặp `for-each` cung cấp cú pháp súc tích để duyệt qua mọi phần tử, còn vòng lặp `for` cho nhiều quyền kiểm soát và linh hoạt hơn, cho phép truy cập chỉ số và duyệt theo cách tuỳ biến.

### Vòng lặp `for` lồng nhau

Cũng như vòng lặp `while`, vòng lặp `for` lồng nhau được. Điều này cho phép bạn duyệt mảng nhiều chiều hoặc thực hiện những phép duyệt phức tạp.
```java
int[][] matrix = { {1, 2, 3}, {4, 5, 6}, {7, 8, 9} };
for(int[] row : matrix) {
    for(int cell : row) {
        System.out.print(cell + " ");
    }
    System.out.println();
}
```

Đoạn mã này dùng hai vòng lặp `for-each` lồng nhau để duyệt một mảng hai chiều. Vòng lặp ngoài duyệt từng hàng, còn vòng lặp trong duyệt từng ô trong hàng hiện tại.

### Câu lệnh `break` và `continue`

Câu lệnh `break` dùng được trong vòng lặp `for` để dừng vòng lặp sớm.
```java
int[] numbers = {1, 2, 3, 4, 5};
for(int num : numbers) {
    if(num == 3) {
        break;
    }
    System.out.println(num);
}
```

Trong ví dụ này, vòng lặp dừng khi `num` bằng 3. Kết quả sẽ là:
```
1
2
```

Mặt khác, câu lệnh `continue` dùng được trong vòng lặp `for` để bỏ qua phần còn lại của lần lặp hiện tại và chuyển sang lần lặp kế tiếp.
```java
int[] numbers = {1, 2, 3, 4, 5};
for(int num : numbers) {
    if(num % 2 == 0) {
        continue;
    }
    System.out.println(num);
}
```

Vòng lặp này chỉ in các số lẻ trong mảng. Khi `num` là số chẵn, câu lệnh `continue` được thực thi và phần còn lại của lần lặp bị bỏ qua.

Ngoài ra, dùng `break` hay `continue` trong vòng lặp `for` đôi khi dẫn tới mã không thể tới được, gây lỗi biên dịch.
```java
for(int i = 0; i < 10; i++) {
    System.out.println(i);
    break;
    System.out.println("Unreachable"); // Unreachable code
}
```

Trong ví dụ này, mã sau câu lệnh `break` không thể tới được vì `break` luôn khiến vòng lặp dừng. Trình biên dịch Java phát hiện điều này và báo lỗi biên dịch.

Nguyên tắc tương tự áp dụng cho `continue`. Bất kỳ mã nào sau câu lệnh `continue` trong cùng lần lặp đều không thể tới được.

Để tránh những lỗi này, hãy đảm bảo mọi mã đặt sau câu lệnh `break` hay `continue` đều có cơ hội chạy trong một điều kiện nào đó.

### Thêm nhãn

Nhãn thêm được vào vòng lặp `for` theo cách giống vòng lặp `while`. Chúng hữu ích để thoát khỏi hoặc tiếp tục vòng lặp ngoài từ bên trong vòng lặp lồng nhau:
```java
int[][] matrix = { {1, 2, 3}, {4, 5, 6}, {7, 8, 9} };
outerLoop:
for(int[] row : matrix) {
    for(int cell : row) {
        if(cell == 5) {
            break outerLoop;
        }
        System.out.print(cell + " ");
    }
    System.out.println();
}
```

Trong ví dụ này, vòng lặp ngoài được gắn nhãn `outerLoop`. Khi giá trị của `cell` là 5, câu lệnh `break` được dùng cùng nhãn `outerLoop`, khiến chương trình dừng cả vòng lặp trong lẫn vòng lặp ngoài. Diễn biến như sau:
1. Vòng lặp ngoài bắt đầu với hàng đầu tiên `(1, 2, 3)` của `matrix`.
   - Vòng lặp trong in "1 ", rồi "2 ", rồi "3 ".
   - Vòng lặp trong kết thúc, một dấu xuống dòng được in.

2. Vòng lặp ngoài chuyển sang hàng thứ hai `(4, 5, 6)`.
   - Vòng lặp trong in "4 ".
   - Vòng lặp trong gặp giá trị 5, và `break outerLoop;` được thực thi.
   - Cả vòng lặp trong lẫn vòng lặp ngoài đều dừng.

Chương trình kết thúc tại đây. Kết quả là:
```
1 2 3
4
```

Hàng thứ ba `(7, 8, 9)` không bao giờ được xử lý vì các vòng lặp đã dừng sớm.

## Các điểm chính

- Câu lệnh `if` cho phép chương trình thực thi có điều kiện một khối mã dựa trên một điều kiện boolean.

- Cú pháp cơ bản của câu lệnh `if` là: `if (condition) { code }`. Khối mã chạy nếu điều kiện là `true`.

- Bạn nối được nhiều điều kiện bằng `else if`. Các điều kiện được kiểm tra theo thứ tự cho tới khi một điều kiện đúng hoặc tới khối `else`.

- Biến khai báo bên trong khối `if` hay `else` chỉ nằm trong phạm vi của khối đó.

- Câu lệnh `if` dùng được pattern matching với toán tử `instanceof`, gán object khớp cho một biến pattern để dùng trong khối `if`.

- Java 21 giới thiệu record pattern, cho phép tách rời instance record ngay trong câu lệnh `if`.

- Record pattern lồng nhau được, cho phép tách rời những đồ thị object phức tạp trong một bước.

- Pattern matching không khớp với giá trị `null`.

- Phạm vi của biến pattern được trình biên dịch kiểm soát chặt theo quy tắc flow scoping nhằm ngăn lỗi.

- Câu lệnh `switch` cho phép chạy những khối mã khác nhau dựa trên giá trị của một biến hay biểu thức.

- Java 21 cho phép dùng tên đầy đủ của hằng số enum trong câu lệnh `switch`.

- Hằng số enum giờ trộn được với các nhãn case khác trong cùng một `switch`.

- Yêu cầu biểu thức chọn phải thuộc kiểu enum được nới lỏng, cho phép dùng tên đầy đủ của hằng số enum ngay cả khi biểu thức chọn không thuộc kiểu enum (nhưng tương thích về gán).

- Mỗi `case` trong `switch` định nghĩa một giá trị để so sánh. Nếu khớp, khối mã của case đó chạy.

- Hãy đưa câu lệnh `break` vào cuối mỗi khối case để ngăn rơi xuyên, trừ khi bạn cố ý muốn rơi xuyên.

- Câu lệnh `switch` làm việc được với `String`, hằng số `enum` và các kiểu số nguyên như `int`, `char`, v.v.

- Giá trị case phải là hằng số tại thời điểm biên dịch.

- Java 14 chính thức giới thiệu biểu thức `switch`, dùng `->` để ánh xạ case tới giá trị kết quả và phải phủ hết mọi khả năng đầu vào.

- Java 21 giới thiệu pattern matching trong câu lệnh và biểu thức `switch`. Nó cho phép kiểm tra cấu trúc của một object ngay trong `switch`.

- Bạn dùng được type pattern, record pattern, và thêm guard bằng mệnh đề `when` để khớp chính xác hơn.

- Thứ tự các case rất quan trọng; pattern cụ thể hơn phải đứng trước pattern tổng quát hơn.

- Pattern matching trong `switch` đưa ra cách xử lý giá trị `null` một cách tường minh.

- Trình biên dịch đảm bảo tính đầy đủ trong câu lệnh và biểu thức `switch`: khối `switch` phải có các mệnh đề xử lý mọi giá trị khả dĩ của biểu thức chọn.

- Vòng lặp `while` lặp lại một khối mã chừng nào điều kiện boolean của nó còn `true`.

- Nếu điều kiện ban đầu là `false`, khối mã sẽ hoàn toàn không chạy.

- Vòng lặp `do-while` tương tự nhưng điều kiện được kiểm tra sau mỗi lần lặp, nên khối mã luôn chạy ít nhất một lần.

- Bạn lồng được một vòng lặp bên trong vòng lặp khác để duyệt qua nhiều chiều.

- Câu lệnh `break` dừng vòng lặp ngay lập tức, còn `continue` nhảy tới lần lặp kế tiếp.

- Bạn gắn được nhãn cho vòng lặp rồi dùng `break` hay `continue` với nhãn đó để thoát khỏi hoặc tiếp tục vòng lặp ngoài đã gắn nhãn.

- Vòng lặp `for` cung cấp cú pháp súc tích để duyệt qua một dải giá trị.

- Vòng lặp `for` truyền thống có phần khởi tạo, điều kiện và câu lệnh cập nhật. Khối mã chạy lặp đi lặp lại cho tới khi điều kiện là `false`.

- Biến khai báo trong khối khởi tạo có phạm vi giới hạn trong vòng lặp `for`.

- Vòng lặp `for-each` (vòng lặp `for` nâng cao) đơn giản hoá việc duyệt mảng/collection, loại bỏ nhu cầu đánh chỉ số tường minh.

- Không dùng được `for-each` nếu bạn cần chỉ số hoặc muốn duyệt theo thứ tự tuỳ biến. Hãy dùng vòng lặp `for` truyền thống trong những trường hợp đó.

- Bạn dùng được `break`/`continue` và nhãn với vòng lặp `for` y như với vòng lặp `while`.

- Tránh mã không thể tới được sau câu lệnh `break` hay `continue`.
