---
layout: chapter

title: "Chương 4: Làm việc với dữ liệu"
subtitle: "Working with Data"
exam_objectives:
  - "Sử dụng kiểu nguyên thuỷ và wrapper class. Tính biểu thức số học và boolean, dùng Math API cùng việc áp dụng quy tắc độ ưu tiên, chuyển đổi kiểu và ép kiểu."
  - "Thao tác văn bản, kể cả text block, bằng class String và StringBuilder."

previous_link: "/ch03.html"
previous_title: "Working with Records and Enums"
next_link: "/ch05.html"
next_title: "Controlling Program Flow"
answers_link: "/ch04a.html"

description: "Kiểu nguyên thuỷ và tham chiếu, wrapper class, autoboxing, toàn bộ hệ toán tử, String, StringBuilder, text block và Math API trong Java 21."
order: 1
phase: "Chương 4"
tags: [Java, OCP, Primitive, Wrapper, Operator, String, StringBuilder, Text Block, Math]
---

## Hiểu về kiểu dữ liệu

Có hai loại kiểu dữ liệu chính: primitive (nguyên thuỷ) và reference (tham chiếu):
```
┌───────────────────────────────────────────────────┐
│                  Java Data Types                  │
│                         │                         │
│          ┌──────────────┴──────────────┐          │
│          │                             │          │
│    Primitive Types               Reference Types  │
│          │                             │          │
│  ┌───────┴───────┐             ┌───────┴───────┐  │
│  │ byte          │             │ Classes       │  │
│  │ short         │             │ Interfaces    │  │
│  │ int           │             │ Arrays        │  │
│  │ long          │             │ Enums         │  │
│  │ float         │             └───────────────┘  │
│  │ double        │                                │
│  │ boolean       │                                │
│  │ char          │                                │
│  └───────────────┘                                │
└───────────────────────────────────────────────────┘
```

Hãy xem xét kỹ hơn từng loại.

### Kiểu nguyên thuỷ (primitive)

Java là ngôn ngữ định kiểu tĩnh (statically typed), nghĩa là mọi biến đều phải được khai báo trước khi dùng. Kiểu của biến quyết định những giá trị nó chứa được và những thao tác thực hiện được trên nó.

Trong Java, kiểu nguyên thuỷ là những kiểu dữ liệu cơ bản nhất. Chúng không phải object và không thuộc class nào. Thay vào đó, chúng được định nghĩa bởi chính ngôn ngữ. Kiểu nguyên thuỷ dùng để lưu những giá trị đơn giản như số nguyên, số thực dấu phẩy động, giá trị boolean và ký tự.

Kiểu nguyên thuỷ được lưu trực tiếp trong bộ nhớ và được truy cập theo giá trị. Điều này trái ngược với kiểu tham chiếu (object), vốn được truy cập qua tham chiếu. Nhờ lưu trực tiếp, kiểu nguyên thuỷ nhanh hơn và tốn ít bộ nhớ hơn object.

Java có tám kiểu dữ liệu nguyên thuỷ:

| Kiểu      |  Kích thước (bit)  | Giá trị nhỏ nhất              | Giá trị lớn nhất             | Mặc định |
|-----------|---------------|----------------------------|---------------------------|---------|
| `byte`    | 8             | -128                       | 127                       | 0       |
| `short`   | 16            | -32,768                    | 32,767                    | 0       |
| `int`     | 32            | -2,147,483,648             | 2,147,483,647             | 0       |
| `long`    | 64            | -9,223,372,036,854,775,808 | 9,223,372,036,854,775,807 | 0L      |
| `float`   | 32            | 1.4E-45                    | 3.4028235E38              | 0.0f    |
| `double`  | 64            | 4.9E-324                   | 1.7976931348623157E308    | 0.0d    |
| `boolean` | n/a           | n/a                        | n/a                       | false   |
| `char`    | 16            | `'\u0000'` (0)             | `'\uffff'` (65.535)       | `'\u0000'` |

Hãy phân tích bảng này.

Các kiểu số nguyên (`byte`, `short`, `int`, `long`) dùng cho giá trị nguyên. Chúng khác nhau ở dải giá trị chứa được. `byte` có `8` bit, chứa được giá trị từ `-128` tới `127`. `short` có `16` bit, chứa từ `-32,768` tới `32,767`. `int` có `32` bit, chứa từ `-2,147,483,648` tới `2,147,483,647`. Còn `long` có 64 bit, chứa từ `-9,223,372,036,854,775,808` tới `9,223,372,036,854,775,807`.

Bạn có thể thắc mắc: chẳng phải mọi con số trong Java đều được xử lý như nhau sao? Vậy tại sao lại cần những kiểu khác nhau như `int`, `long`, v.v.? Lý do là hiệu quả và mức dùng bộ nhớ. Nếu bạn biết giá trị của mình luôn nằm trong một dải nhất định, bạn dùng kiểu nhỏ hơn để tiết kiệm bộ nhớ. Ví dụ, `int` chiếm một nửa bộ nhớ so với `long`. Trong những ứng dụng quy mô lớn với nhiều dữ liệu, điều này tạo ra khác biệt đáng kể.

Các kiểu dấu phẩy động (`float` và `double`) dùng cho số có phần thập phân. `float` có 32 bit và `double` có 64 bit. Điều này khiến `double` có độ chính xác cao hơn `float` nhiều. Nhiều lập trình viên chọn dùng `double` cho mọi giá trị thập phân để tránh vấn đề về độ chính xác, nhưng vẫn có những tình huống dùng `float` để tiết kiệm bộ nhớ khi không cần độ chính xác cao.

Trong Java, kích thước của `boolean` không được Java Language Specification quy định tường minh. Kích thước bộ nhớ thực tế của biến boolean phụ thuộc vào phần cài đặt và thay đổi tuỳ theo Java Virtual Machine đang dùng. Tuy nhiên, với kỳ thi, bạn chỉ cần biết kiểu `boolean` chỉ có hai giá trị khả dĩ: `true` và `false`, và nó được dùng cho logic điều kiện.

Kiểu `char` dùng cho ký tự đơn. Nó dùng 16 bit vì dùng mã hoá Unicode, cho phép biểu diễn nhiều loại ký tự từ các ngôn ngữ khác nhau.

Một điều quan trọng cần nhớ là giá trị mặc định chỉ áp dụng cho field. Ngược lại, biến cục bộ bắt buộc phải được khởi tạo tường minh trước khi dùng; nếu không, mã của bạn sẽ không biên dịch được.

Bạn gán giá trị cho biến bằng literal (giá trị hằng viết trực tiếp). Ngoài ký pháp thập phân chuẩn, Java còn cho phép gán literal số nguyên bằng ký pháp thập lục phân (tiền tố `0x` hoặc `0X`), bát phân (tiền tố `0`) và nhị phân (tiền tố `0b` hoặc `0B`).

Ví dụ:
```java
// Decimal notation
int decimalNum = 42;

// Hexadecimal notation
int hexNum = 0x2A; // Equivalent to decimal 42
        
// Octal notation
int octalNum = 052; // Equivalent to decimal 42
        
// Binary notation
int binaryNum = 0b101010; // Equivalent to decimal 42
```

Khi gán literal cho biến, cần lưu ý rằng kiểu của literal phải khớp kiểu của biến. Nếu không khớp, bạn có thể phải dùng hậu tố để chỉ rõ kiểu của literal.

Với literal số nguyên:
- Literal `long` dùng hậu tố `L` hoặc `l`: `long longNum = 1000L;`
- Literal `int` không cần hậu tố, vì `int` là kiểu mặc định cho số nguyên: `int intNum = 1000;`

Với literal dấu phẩy động:
- Literal `float` dùng hậu tố `F` hoặc `f`: `float floatNum = 3.14f;`
- Literal `double` dùng hậu tố `D` hoặc `d`, dù hậu tố này là tuỳ chọn vì `double` là kiểu mặc định cho literal thập phân: `double doubleNum = 3.14D;`

Vài ví dụ:

```java
long longNum = 1000L; // Suffix L is required
float floatNum = 3.14f; // Suffix f is required
double doubleNum1 = 3.14; // Suffix d is optional
double doubleNum2 = 3.14d; // Suffix d is optional 
```

Nếu bạn không dùng đúng hậu tố, bạn có thể gặp lỗi biên dịch. Ví dụ:

```java
byte longNum = 1000; // Compilation error: integer literal is too large
float floatNum = 3.14; // Compilation error: incompatible types
```

Trong những trường hợp này, Java coi literal lần lượt là kiểu `int` và `double`, và chúng không gán trực tiếp được cho biến `byte` hay `float` nếu không ép kiểu tường minh.

Bạn cũng dùng được dấu gạch dưới trong literal số để dễ đọc hơn, ví dụ `1_000_000`. Đây là vài ví dụ minh hoạ:
```java
// Valid use of underscores
int million = 1_000_000;
long creditCardNumber = 1234_5678_9012_3456L;
float pi = 3.14_15F;
double avogadro = 6.022_140_857e23;
```

Tuy nhiên có vài hạn chế. Bạn không được đặt dấu gạch dưới:
- Ở đầu hoặc cuối một con số
- Ngay cạnh dấu chấm thập phân trong literal dấu phẩy động
- Ngay trước hậu tố `F` hoặc `L`
- Ở những vị trí mà cú pháp đang chờ một chuỗi chữ số

Vài ví dụ nữa về vị trí đặt dấu gạch dưới không hợp lệ:
```java
// Invalid use of underscores
int x1 = _1000; // Compilation error: illegal underscore
int x2 = 1000_; // Compilation error: illegal underscore
float y1 = 3_.14F; // Compilation error: illegal underscore
float y2 = 3._14F; // Compilation error: illegal underscore

float y3 = 3.14__F; // Compilation error: consecutive underscores
long z1 = 1000_L; // Compilation error: underscore before L suffix

int x3 = 0_x42; // Compilation error: underscore in position where digits are expected
int x4 = 0b_101010; // Compilation error: underscore in position where digits are expected
```

Những quy tắc này tồn tại để tránh nhập nhằng và đảm bảo việc dùng dấu gạch dưới không xung đột với các phần khác trong cú pháp ngôn ngữ.

### Kiểu tham chiếu (reference)

Ở phần trước ta đã tìm hiểu khái niệm kiểu nguyên thuỷ trong Java. Tuy nhiên, như ta biết, Java là ngôn ngữ hướng đối tượng, và gần như mọi thứ đều được xem là object. Trong khi kiểu nguyên thuỷ cung cấp những viên gạch cơ bản, kiểu tham chiếu cho phép ta làm việc với object và tận dụng trọn vẹn các tính năng hướng đối tượng của Java.

Vậy chính xác kiểu tham chiếu là gì? Khác kiểu nguyên thuỷ vốn giữ trực tiếp giá trị, kiểu tham chiếu lưu địa chỉ bộ nhớ nơi object thực sự nằm. Nói cách khác, biến tham chiếu *trỏ tới* vị trí của object chứ không chứa bản thân object.

```java
String myString = "Hello"; // Reference type
```

Trong ví dụ này, `myString` là biến tham chiếu kiểu `String`. Nó không giữ giá trị chuỗi thực tế mà giữ một tham chiếu tới vị trí bộ nhớ nơi object `"Hello"` được lưu.

Điều này khác với cách kiểu nguyên thuỷ hoạt động:

```java
int myNumber = 42; // Primitive type 
```

Ở đây `myNumber` giữ trực tiếp giá trị nguyên `42` chứ không trỏ tới một object.

Nhưng nếu ta muốn xử lý kiểu nguyên thuỷ như object thì sao? Đây là lúc **wrapper class** xuất hiện. Java cung cấp một tập wrapper class tương ứng với từng kiểu nguyên thuỷ, cho phép chúng được dùng trong những tình huống đòi hỏi object:

|  Kiểu nguyên thuỷ  |  Wrapper class  | Kế thừa từ Number |
|------------------|-----------------|----------------------|
| `boolean`        | `Boolean`       | Không                   |
| `byte`           | `Byte`          | Có                  |
| `short`          | `Short`         | Có                  |
| `int`            | `Integer`       | Có                  |
| `long`           | `Long`          | Có                  |
| `float`          | `Float`         | Có                  |
| `double`         | `Double`        | Có                  |
| `char`           | `Character`     | Không                   |

Mỗi kiểu nguyên thuỷ có một wrapper class tương ứng, hầu hết kế thừa từ class `Number`. Class `Boolean` và `Character` là ngoại lệ vì chúng không biểu diễn giá trị số.

Wrapper class cung cấp method để tạo instance từ nhiều dạng biểu diễn và để chuyển đổi giữa các kiểu dữ liệu khác nhau. Vài ví dụ:

1. Method phân tích chuỗi (parsing):
   - `Integer.parseInt(String s)`: Phân tích đối số chuỗi thành số nguyên thập phân có dấu.
   - `Double.parseDouble(String s)`: Phân tích đối số chuỗi thành số dấu phẩy động độ chính xác kép.
   - `Boolean.parseBoolean(String s)`: Phân tích đối số chuỗi thành giá trị boolean.

   Ví dụ:
   ```java
   int num = Integer.parseInt("42");
   double value = Double.parseDouble("3.14");
   boolean flag = Boolean.parseBoolean("true");
   ```

2. Method chuyển đổi:
   - `Integer.valueOf(String s)`: Trả về object `Integer` giữ giá trị của chuỗi đã nêu.
   - `Long.valueOf(long l)`: Trả về object `Long` giữ giá trị long nguyên thuỷ đã nêu.
   - `Double.valueOf(double d)`: Trả về object `Double` giữ giá trị double nguyên thuỷ đã nêu.

   Ví dụ:
   ```java
   Integer myInt = Integer.valueOf("100");
   Long myLong = Long.valueOf(1234567890L);
   Double myDouble = Double.valueOf(2.71828);
   ```

3. Chuyển đổi giữa các kiểu số:
   - `Integer.byteValue()`: Trả về giá trị của một `Integer` dưới dạng byte.
   - `Long.intValue()`: Trả về giá trị của một `Long` dưới dạng int.
   - `Float.doubleValue()`: Trả về giá trị của một `Float` dưới dạng double.

   Ví dụ:
   ```java
   byte myByte = myInt.byteValue();
   long myLong = myInt.longValue();
   ```

4. Method cho ký tự:
   - `Character.isDigit(char ch)`: Xác định ký tự đã nêu có phải chữ số không.
   - `Character.isLetter(char ch)`: Xác định ký tự đã nêu có phải chữ cái không.
   - `Character.toUpperCase(char ch)`: Chuyển đối số ký tự thành chữ hoa.

   Ví dụ:
   ```java
   char myChar = '7';
   boolean isDigit = Character.isDigit(myChar);
   boolean isLetter = Character.isLetter(myChar);
   char upperCase = Character.toUpperCase(myChar);
   ```

Lưu ý những method này là `static`, cho phép bạn dùng chúng mà không cần tạo instance của wrapper class.

Đây chỉ là vài ví dụ trong số các method mà wrapper class cung cấp để tạo instance và chuyển đổi giữa các dạng biểu diễn khác nhau. Mỗi wrapper class cung cấp một loạt method riêng cho kiểu nguyên thuỷ tương ứng, mang lại sự linh hoạt và tiện lợi khi làm việc với các định dạng dữ liệu và phép chuyển đổi khác nhau.

Vậy wrapper class có biến kiểu nguyên thuỷ thành object không? Không hẳn. Wrapper class tách biệt với kiểu nguyên thuỷ nhưng cung cấp cách bọc kiểu nguyên thuỷ dưới dạng object. Điều này cho phép kiểu nguyên thuỷ được dùng trong những ngữ cảnh đòi hỏi object, như collection hay khi dùng generic.

Để nối liền khoảng cách giữa kiểu nguyên thuỷ và wrapper class, Java đưa ra **autoboxing** và **unboxing**. Như đã nói, autoboxing là việc tự động chuyển kiểu nguyên thuỷ sang wrapper class tương ứng, còn unboxing là quá trình ngược lại:

```java
int num = 42;
Integer objNum = num; // Autoboxing
int num2 = objNum;    // Unboxing
```

Trong ví dụ này, `num` được tự động đóng gói (box) thành object `Integer` khi gán cho `objNum`. Tương tự, `objNum` được mở gói (unbox) trở lại thành `int` khi gán cho `num2`. Việc này diễn ra ngầm định, giúp việc chuyển qua lại giữa kiểu nguyên thuỷ và wrapper class trở nên tiện lợi.

Autoboxing và unboxing hoạt động với mọi kiểu nguyên thuỷ cùng wrapper class tương ứng, không chỉ riêng `int` và `Integer`. Java xử lý những phép chuyển đổi này tự động dựa trên ngữ cảnh sử dụng.

Cần lưu ý rằng dù autoboxing và unboxing giúp mã dễ đọc hơn, chúng vẫn có thể ảnh hưởng tới hiệu năng. Mỗi lần chuyển đổi giữa kiểu nguyên thuỷ và wrapper class đều liên quan tới việc tạo hoặc huỷ một object, tạo ra một chút chi phí. Trong hầu hết trường hợp chi phí này không đáng kể, nhưng nó có thể cộng dồn trong những tình huống nhạy cảm về hiệu năng với thao tác autoboxing/unboxing diễn ra thường xuyên.

Một ưu điểm của wrapper class là khả năng biểu diễn sự vắng mặt của giá trị bằng `null`. Kiểu nguyên thuỷ không thể là `null`, nhưng object wrapper thì có thể.

```java
Integer num = null;
int value = num; // NullPointerException
```

Ở đây, gán `null` cho `num` là hợp lệ vì nó là object `Integer`. Tuy nhiên, cố unbox `num` thành `int` sẽ ném `NullPointerException`. Hành vi này cho phép xử lý giá trị `null` một cách tường minh hơn và hữu ích trong những tình huống một biến có thể chưa được gán giá trị.

Ngoài ra, đáng lưu ý là wrapper class là bất biến (immutable), nghĩa là giá trị của chúng không đổi được sau khi gán. Khi bạn thực hiện thao tác trên một object wrapper, một object mới được tạo với giá trị đã cập nhật thay vì sửa object hiện có.

```java
Integer num = 42;
num++;
```

Trong ví dụ này, phép `++` trên `num` tạo ra một object `Integer` mới với giá trị 43 thay vì sửa object gốc. Hành vi này đảm bảo an toàn luồng và tránh những tác dụng phụ ngoài ý muốn khi chia sẻ object wrapper giữa nhiều phần của chương trình.

## Toán tử (Operator)

### Giới thiệu về toán tử

Toán tử là ký hiệu báo cho trình biên dịch thực hiện những phép toán học hoặc logic cụ thể.

Java cung cấp một tập toán tử phong phú để thao tác trên biến và giá trị:
- **Toán tử một ngôi (unary):** Toán tử tác động lên một toán hạng duy nhất, như `++` để tăng giá trị hay `!` để phủ định một boolean.
- **Toán tử hai ngôi (binary):** Toán tử tác động lên hai toán hạng, như toán tử số học (`+`, `-`, `*`, `/`, `%`) và toán tử so sánh (`>`, `<`, `>=`, `<=`, `==`, `!=`).
- **Toán tử ba ngôi (ternary):** Toán tử điều kiện nhận ba toán hạng (`condition ? value_if_true : value_if_false`).
- **Toán tử gán:** Toán tử dùng để gán giá trị cho biến (`=`, `+=`, `-=`, `*=`, `/=`, `%=`, `&=`, `^=`, `|=`, `<<=`, `>>=`, `>>>=`).
- **Toán tử logic:** Toán tử dùng để xác định quan hệ logic giữa các biến hay giá trị (`&&`, `||`).

Nhiều lập trình viên mới học Java nhầm tưởng toán tử chỉ dùng cho phép toán học. Nhưng toán tử còn đóng vai trò quan trọng trong việc điều khiển luồng chương trình, thực hiện phép logic, thao tác bit và nhiều việc khác. Ví dụ:

```java
int a = 10;
int b = 5;
        
// Arithmetic operator
System.out.println(a + b);  // 15 

// Comparison operator  
System.out.println(a > b);  // true

// Logical operator
System.out.println((a > b) && (a != b)); // true
```

Như bạn thấy, toán tử trong Java vượt xa phép số học cơ bản.

### Độ ưu tiên của toán tử

Một khái niệm quan trọng cần nắm là **độ ưu tiên** (precedence). Cũng như trong toán học, một số toán tử trong Java có độ ưu tiên cao hơn những toán tử khác, nghĩa là chúng được tính trước trong một biểu thức.

Ví dụ, xét đoạn mã sau:
```java
int result = 10 + 5 * 2;
System.out.println(result);
```

Bạn có thể nghĩ `result` là `30` (`10 + 5` được `15`, rồi `15 * 2`). Nhưng thực tế nó in ra `20`. Vì toán tử `*` có độ ưu tiên cao hơn `+`. Nên `5 * 2` được tính trước, được `10`, rồi `10` được cộng vào `10` ban đầu.

Đây là bảng độ ưu tiên toán tử trong Java, từ cao xuống thấp:

| Nhóm         | Toán tử                                        | Chiều kết hợp |
|------------------|-------------------------------------------------|---------------|
| Hậu tố (postfix)          | `expr++`  `expr--`                              | Trái sang phải |
| Một ngôi (unary)            | `++expr`  `--expr`  `+expr`  `-expr`  `~`  `!`  | Phải sang trái |
| Nhân/chia   | `*` `/` `%`                                     | Trái sang phải |
| Cộng/trừ         | `+` `-`                                         | Trái sang phải |
| Dịch bit (shift)            | `<<` `>>` `>>>`                                 | Trái sang phải |
| Quan hệ       | `<` `>` `<=` `>=` `instanceof`                  | Trái sang phải |
| Bằng nhau         | `==` `!=`                                       | Trái sang phải |
| Bitwise AND      | `&`                                             | Trái sang phải |
| Bitwise XOR      | `^`                                             | Trái sang phải |
| Bitwise OR       | `\|`                                            | Trái sang phải |
| Logical AND      | `&&`                                            | Trái sang phải |
| Logical OR       | `\|\|`                                          | Trái sang phải |
| Ba ngôi          | `? :`                                           | Phải sang trái |
| Gán       | `=` `+=` `-=` `*=` `/=` `%=` `&=` `^=` `\|=` `<<=` `>>=` `>>>=` | Phải sang trái |

Như bảng cho thấy, hầu hết toán tử được tính từ trái sang phải. Nên trong biểu thức như `a + b - c`, `a + b` xảy ra trước, rồi mới `- c`.

Nhưng toán tử gán và toán tử một ngôi thực chất được tính từ phải sang trái. Xét đoạn mã sau:

```java
int a = 10;
int b = 20;
int c = (a = 3) + (b = 5);
System.out.println(a + ", " + b + ", " + c); // 3, 5, 8
```

Ở đây `a` được gán `3`, `b` được gán `5`, và vì phép gán tính từ phải sang trái nên các phép gán xảy ra trước phép cộng. Nên `c` cuối cùng là `8` (`3 + 5`), trong khi `a` là `3` và `b` là `5`.

Việc tính từ phải sang trái này cho phép gán chuỗi, như `a = b = c = 5`. Số `5` được gán cho `c`, rồi kết quả đó gán cho `b`, và cuối cùng cho `a`, theo chiều phải sang trái.

Có nhiều thứ phải nhớ, và việc thuộc lòng toàn bộ bảng độ ưu tiên là không cần thiết. Những điểm mấu chốt là:
1. Phép hậu tố như `x++` xảy ra trước phép tiền tố như `++x`.
2. Phép nhân/chia (`*`, `/`, `%`) xảy ra trước phép cộng/trừ (`+`, `-`).
3. Phép bitwise (`&`, `|`, `^`) xảy ra sau phép so sánh (`>`, `==`, v.v.) nhưng trước phép logic (`&&`, `||`).
4. Phép gán được tính cuối cùng, và theo chiều phải sang trái.

Khi phân vân, luôn dùng được dấu ngoặc đơn để làm rõ thứ tự. Hai biểu thức `(a + b) * c` và `a + (b * c)` khác nhau rõ ràng.

Nói chung, nên dùng ngoặc đơn bất cứ khi nào độ ưu tiên không rõ ràng hoặc để tăng tính dễ đọc. Nhưng đừng lạm dụng tới mức rối mắt. Khi đã nắm vững độ ưu tiên toán tử, nhiều dấu ngoặc trở nên không cần thiết, khiến mã sạch và dễ đọc hơn.

Hãy xem thêm vài ví dụ để hiểu rõ hơn về toán tử và độ ưu tiên trong Java:

```java
int x = 10;
int y = 20;
int z = 30;

System.out.println(x + y - z);  // 10 + 20 - 30 = 0
System.out.println(x - y + z);  // 10 - 20 + 30 = 20
System.out.println(x * y / z);  // 10 * 20 / 30 = 6
System.out.println(x / y * z);  // 10 / 20 * 30 = 0
```

Ở hai câu lệnh đầu, các toán tử có cùng độ ưu tiên (`+` và `-`) nên chúng được tính từ trái sang phải. Ở câu thứ ba và thứ tư, `*` và `/` có độ ưu tiên cao hơn nên được tính trước, theo chiều trái sang phải. Ở ví dụ thứ tư, `10 / 20` bằng không (vì ta đang dùng số nguyên).

Giờ hãy trộn thêm vài phép gán và toán tử một ngôi:

```java
int a = 5;
int b = 10;
int c = ++a * b--;
System.out.println(a + ", " + b + ", " + c);  // 6, 9, 60
```

Ở đây, `++a` tăng `a` lên 6 trước phép nhân. Rồi `6 * 10` được 60, gán cho `c`. Cuối cùng, `b--` giảm `b` xuống 9, nhưng sau phép nhân. Nên ta có `a` là 6, `b` là 9, và `c` là 60.

Bản chất phải-sang-trái của phép gán rất quan trọng cần hiểu:

```java
int x = 2;
int y = 3;
int z = 1;
x += y -= z;
System.out.println(x + ", " + y + ", " + z);  // 4, 2, 1
```

Trước hết, `z` (1) được trừ khỏi `y` (3), được 2, rồi gán lại cho `y`. Sau đó giá trị này (2) được cộng vào `x` (2), được 4, rồi gán lại cho `x`. Nên `x` cuối cùng là 4, `y` là 2, và `z` vẫn là 1.

Toán tử logic và bitwise có thể tạo thêm độ phức tạp:

```java
int a = 10;  // 1010 in binary
int b = 6;   // 0110 in binary

System.out.println(a & b);  // 1010 & 0110 = 0010 (2 in decimal)
System.out.println(a | b);  // 1010 | 0110 = 1110 (14 in decimal)
System.out.println(a ^ b);  // 1010 ^ 0110 = 1100 (12 in decimal)

System.out.println(a > 5 && b < 10); // true && true = true
System.out.println(a > 5 || b < 5);  // true || false = true
```

Toán tử bitwise `&`, `|` và `^` thực hiện phép AND, OR và XOR trên từng bit của các số. Toán tử logic `&&` và `||` thực hiện AND và OR trên điều kiện boolean, trong đó `&&` có độ ưu tiên cao hơn.

Cuối cùng, đừng quên toán tử ba ngôi — giống câu lệnh `if`-`else` viết gọn:

```java
int x = 10;
int y = 20;
int max = (x > y) ? x : y;
System.out.println(max);  // 20
```

Ở đây `(x > y)` là false, nên giá trị sau dấu hai chấm (`y`, tức 20) được gán cho `max`.

Ở các phần tiếp theo, chúng ta sẽ xem xét kỹ hơn từng loại toán tử.

### Toán tử một ngôi

Toán tử một ngôi là những toán tử chỉ làm việc với một toán hạng. Bạn đã thấy vài toán tử một ngôi hoạt động, như toán tử phủ định logic (`!`) dùng với giá trị boolean. Tuy nhiên, ở phần này ta sẽ nói về những toán tử một ngôi chủ yếu dùng với kiểu số.

#### Toán tử bù và phủ định

Toán tử bù một ngôi (`~`), còn gọi là toán tử bù bit (bitwise complement), đảo mọi bit trong một số, biến mỗi 0 thành 1 và mỗi 1 thành 0. Trong Java, số nguyên được biểu diễn bằng 32 bit ở dạng bù hai (two's complement).

Với số dương, phép bù bit sẽ lật toàn bộ bit, và số kết quả là số đối của số ban đầu trừ đi một. Lý do là việc đảo mọi bit rồi diễn giải kết quả theo bù hai cho ra `-(n + 1)`.

Cách hoạt động như sau:

Với một số dương như 5, biểu diễn nhị phân là:
```
0000 0000 0000 0000 0000 0000 0000 0101
```

Khi áp dụng toán tử bù bit, nó lật toàn bộ bit:
```
1111 1111 1111 1111 1111 1111 1111 1010
```

Ở dạng bù hai, đây là biểu diễn của `-6`. Vì vậy `~5` trong Java bằng `-6`.

Với số âm, toán tử bù bit cũng lật toàn bộ bit. Kết quả là số dương tương ứng của số ban đầu trừ đi một, vì lật mọi bit của một số âm rồi diễn giải theo bù hai cho ra số dương tương ứng giảm đi 1.

Ví dụ, lấy -5. Ở dạng bù hai, nó được biểu diễn là:
```
1111 1111 1111 1111 1111 1111 1111 1011
```

Áp dụng toán tử bù bit:
```
0000 0000 0000 0000 0000 0000 0000 0100
```

Số nhị phân này biểu diễn 4 ở hệ thập phân. Vậy `~(-5)` bằng 4.

Tóm lại:
- `~n` với số dương `n` cho kết quả `-(n + 1)`.
- `~(-n)` cho kết quả `n - 1`.

Mặt khác, toán tử phủ định một ngôi (`-`) dễ hiểu hơn. Toán tử này dùng để đổi dấu một giá trị số. Ví dụ, nếu `x` là 5 thì `-x` sẽ là -5.

Một hiểu lầm phổ biến là toán tử phủ định giống với việc lấy không trừ đi số đó. Dù kết quả cuối cùng có thể giống nhau, toán tử phủ định hoạt động khác ở bên dưới. Nó trực tiếp đổi bit dấu của số, chứ không thực hiện phép trừ.

#### Toán tử tăng và giảm

Java cũng cung cấp toán tử tăng (`++`) và giảm (`--`), dùng để tăng hoặc giảm giá trị của biến đi 1. Những toán tử này dùng được ở dạng tiền tố (prefix) hoặc hậu tố (postfix).

Đây là bảng tóm tắt các toán tử tăng và giảm:

| Toán tử | Tên                      | Mô tả                                                  | Ví dụ  |
|----------|---------------------------|--------------------------------------------------------------|----------|
| `++x`      | Tăng tiền tố | Tăng `x` lên 1, rồi trả về giá trị mới của `x`           | `++x`      |
| `x++`      | Tăng hậu tố| Trả về giá trị hiện tại của `x`, rồi tăng `x` lên 1       | `x++`      | 
| `--x`      | Giảm tiền tố | Giảm `x` đi 1, rồi trả về giá trị mới của `x`           | `--x`      |
| `x--`      | Giảm hậu tố| Trả về giá trị hiện tại của `x`, rồi giảm `x` đi 1       | `x--`      |

Một câu hỏi là liệu có dùng được toán tử tăng/giảm với giá trị boolean không. Câu trả lời là không. Những toán tử này chỉ áp dụng cho kiểu số như `int`, `long`, `float`, `double`, v.v.

Một điểm gây nhầm lẫn khác là `x++` tăng `x` trước hay sau biểu thức chứa nó. Toán tử tăng hậu tố (`x++`) trả về giá trị ban đầu của `x`, rồi mới tăng `x` sau khi giá trị đó được trả về. Nên nếu bạn có biểu thức như `y = x++;`, `y` sẽ được gán giá trị ban đầu của `x`, rồi `x` mới được tăng.

Ngược lại, nếu bạn dùng `--x`, nó giảm giá trị của `x` trước khi biểu thức được tính. Nên `y = --x;` sẽ giảm `x` trước, rồi gán giá trị mới của `x` cho `y`.

Bạn cũng có thể thắc mắc liệu có khác biệt giữa `++x` và `x++` khi chúng là thao tác duy nhất trong một câu lệnh không. Trong trường hợp này, không có khác biệt. Cả hai đều tăng `x` lên 1. Khác biệt chỉ xuất hiện khi phép tăng là một phần của biểu thức lớn hơn.

#### Tóm tắt toán tử một ngôi

Đây là bảng đầy đủ các toán tử một ngôi trong Java:

| Toán tử | Tên                      | Mô tả                                                  | Ví dụ                |
|----------|---------------------------|--------------------------------------------------------------|------------------------|
| `+`        | Cộng một ngôi                | Chỉ ra giá trị dương (hiếm dùng)                     | `+x`                     |
| `-`        | Trừ một ngôi               | Đổi dấu một giá trị                                              | `-x`                     |
| `++`       | Tăng                 | Tăng giá trị lên 1                                      | `++x (prefix) x++ (postfix)`|
| `--`       | Giảm                 | Giảm giá trị đi 1                                      | `--x (prefix) x-- (postfix)`|
| `~`        | Bù bit        | Đảo toàn bộ bit                                             | `~x`                     |

Lưu ý toán tử bù (`~`) chỉ hoạt động với kiểu số nguyên, không dùng được với `float` hay `double`.

Vài điểm tinh tế nữa cần cân nhắc:

- Khi dùng `++x` và `x++`, thứ tự thao tác và tác dụng phụ có vai trò quan trọng. Xét ví dụ:
  ```java
  int x = 5;
  int y = ++x + x++; // y = 12, x = 7
  ```
  Điều đang xảy ra:
  1. Toán tử tăng tiền tố (`++x`) được áp dụng trước. Nó tăng `x` lên 6, và giá trị của biểu thức `++x` là 6.
  2. Sau đó, toán tử tăng hậu tố (`x++`) được áp dụng. Nó trả về giá trị hiện tại của `x` là 6, rồi tăng `x` lên 7.
  3. Giá trị của `y` là tổng của biểu thức tăng tiền tố (6) và biểu thức tăng hậu tố (6), tức 12.
  4. Sau khi câu lệnh chạy xong, `x` là 7 (do phép tăng hậu tố), và `y` là 12.

- Bạn dùng được toán tử tăng/giảm bên trong một biểu thức phức tạp mà không ảnh hưởng kết quả, nhưng điều đó khiến mã khó đọc và khó hiểu hơn nhiều. Ví dụ:
  ```java
  int x = 5;
  int y = 3 * x++ + 2; // y = 17, x = 6
  ```
  Cách này chạy được, nhưng rõ ràng hơn là thực hiện phép tăng ở một dòng riêng trước biểu thức.

- Toán tử tăng và giảm không dùng được với giá trị boolean vì giá trị boolean chỉ có thể là `true` hoặc `false`. Chúng không có giá trị "kế tiếp" hay "liền trước" như số.

- Nếu bạn dùng nhiều toán tử tăng/giảm trên cùng một biến trong một câu lệnh, thứ tự thao tác là từ trái sang phải:
  ```java
  int x = 5;
  System.out.println(++x + x++ + x--); // Output: 19
  ```
  Điều đang xảy ra:
  1. `++x` tăng `x` lên 6 và trả về 6
  2. `x++` trả về 6 (giá trị hiện tại của `x`), rồi tăng `x` lên 7
  3. `x--` trả về 7 (giá trị hiện tại của `x`), rồi giảm `x` xuống 6
  4. Tổng là 6 + 6 + 7 = 19

- Toán tử bù (`~`) hữu ích cho những tác vụ thao tác bit mức thấp, thường dùng trong lập trình hệ thống, hệ thống nhúng, giao thức mạng, mật mã học và nhiều lĩnh vực khác.

- Trình biên dịch Java nhận diện toán tử tăng/giảm và sinh bytecode phù hợp tuỳ theo toán tử được dùng ở dạng tiền tố hay hậu tố. Đây không phải điều bạn cần bận tâm với tư cách lập trình viên, nhưng nó được xử lý ở mức bytecode.

- Toán tử tăng và giảm dùng được trên biến kiểu `float` và `double`. Cùng quy tắc tiền tố/hậu tố như với kiểu số nguyên.

- Nếu bạn dùng `++x` so với `x++` bên trong vòng lặp, khác biệt về giá trị cuối của `x` sau vòng lặp phụ thuộc vào thời điểm phép tăng xảy ra. Xét:
  ```java
  int x = 0;
  for(int i = 0; i < 5; i++) {
      System.out.println(++x);
  }
  // Output: 1 2 3 4 5
  // x is 5 after the loop

  x = 0;
  for(int i = 0; i < 5; i++) {
      System.out.println(x++);
  }
  // Output: 0 1 2 3 4
  // x is 5 after the loop
  ```
  Ở cả hai trường hợp, `x` cuối cùng đều bằng 5, nhưng thời điểm in giá trị lại khác nhau. Với `++x`, `x` được tăng trước khi giá trị của nó được in, còn với `x++`, giá trị ban đầu của `x` được in trước khi tăng.

### Toán tử hai ngôi

Toán tử hai ngôi là những toán tử làm việc với hai toán hạng. Java cung cấp một tập toán tử số học hai ngôi để thực hiện các phép toán cơ bản trên toán hạng số. Những toán tử này gồm cộng (`+`), trừ (`-`), nhân (`*`), chia (`/`) và chia lấy dư (`%`).

#### Toán tử số học

Toán tử cộng (`+`), trừ (`-`) và nhân (`*`) hoạt động đúng như bạn mong đợi:
```java
int a = 10;
int b = 20;
int sum = a + b; // 30
int difference = b - a; // 10
int product = a * b; // 200
```

Toán tử chia (`/`) thực hiện phép chia giữa hai toán hạng số. Cần lưu ý rằng khi dùng với toán hạng số nguyên, toán tử chia thực hiện phép chia nguyên, nghĩa là nó trả về thương và bỏ đi phần dư.
```java
int a = 10;
int b = 3;
int quotient = a / b; // 3
```

Nếu bạn muốn thực hiện phép chia dấu phẩy động và nhận kết quả có phần lẻ, ít nhất một trong hai toán hạng phải là kiểu dấu phẩy động (`float` hoặc `double`).
```java
int a = 10;
double b = 3.0;
double quotient = a / b; // 3.3333333333333335
```

Toán tử chia lấy dư (`%`) trả về phần dư sau khi thực hiện phép chia nguyên.
```java
int a = 10;
int b = 3;
int remainder = a % b; // 1
```

#### Nâng kiểu số (Numeric promotion)

Khi thực hiện phép toán số học trên các toán hạng khác kiểu, Java tự động nâng kiểu toán hạng theo một bộ quy tắc gọi là **numeric promotion**.

Numeric promotion là việc tự động chuyển một kiểu số nhỏ hơn sang kiểu số lớn hơn để ngăn mất độ chính xác trong phép toán. Điều này cho phép bạn thực hiện phép toán trên các kiểu trộn lẫn mà không cần ép kiểu tường minh.

Java tuân theo những quy tắc sau khi nâng kiểu số:

1. Nếu một trong hai toán hạng là kiểu `double`, toán hạng còn lại được nâng lên `double`.
2. Ngược lại, nếu một trong hai toán hạng là kiểu `float`, toán hạng còn lại được nâng lên `float`.
3. Ngược lại, nếu một trong hai toán hạng là kiểu `long`, toán hạng còn lại được nâng lên `long`.
4. Ngược lại, cả hai toán hạng đều được nâng lên `int`.

Vài ví dụ:
```java
int a = 10;
double b = 20.0;
double result1 = a + b; // a is promoted to double

float c = 10.0f;
long d = 20L;
float result2 = c + d; // d is promoted to float

short e = 10;
short f = 20;
int result3 = e + f; // e and f are promoted to int
```

#### Thêm dấu ngoặc để đổi thứ tự thực hiện

Bạn dùng dấu ngoặc đơn để đổi thứ tự thực hiện mặc định trong một biểu thức số học. Biểu thức bên trong ngoặc được tính trước.
```java
int a = 10;
int b = 20;
int c = 30;
int result = a + b * c; // 610 (multiplication happens first)
int result2 = (a + b) * c; // 900 (addition happens first)
```

Tuy nhiên, khi dùng ngoặc đơn, cần đảm bảo chúng được cân bằng đúng. Mỗi ngoặc mở phải có một ngoặc đóng tương ứng. Ngoặc lệch nhau sẽ gây lỗi biên dịch.
```java
int result = (a + b) * c; // correct
int result2 = (a + b * c; // compilation error (mismatched parentheses)
```

#### Tóm tắt toán tử hai ngôi

Đây là bảng tóm tắt các toán tử hai ngôi trong Java:

| Toán tử   | Tên           | Mô tả                                      | Ví dụ      |
|------------|----------------|--------------------------------------------------|--------------|
| `+`        | Cộng       | Cộng hai toán hạng                                | `a + b`      |
| `-`        | Trừ    | Trừ toán hạng thứ hai khỏi toán hạng thứ nhất      | `a - b`      | 
| `*`        | Nhân | Nhân hai toán hạng                          | `a * b`      |
| `/`        | Chia       | Chia toán hạng thứ nhất cho toán hạng thứ hai          | `a / b`      |
| `%`        | Chia lấy dư        | Trả về phần dư của phép chia                | `a % b`      |

Vài điểm tinh tế cần cân nhắc:

- Khi làm việc với số dấu phẩy động (`float` và `double`), cần nhớ rằng chúng có độ chính xác hữu hạn. Điều này dẫn tới những sai lệch nhỏ trong tính toán.
   ```java
   double a = 0.1;
   double b = 0.2;
   double sum = a + b; // 0.30000000000000004 (not exactly 0.3)
   ```
   Nguyên nhân nằm ở cách số dấu phẩy động được biểu diễn ở dạng nhị phân. Với những phép tính thập phân cần chính xác, bạn nên dùng class `BigDecimal`.

- Khi kết quả của một phép toán vượt quá giá trị lớn nhất hoặc nhỏ nhất mà kiểu đích biểu diễn được, hiện tượng tràn trên (overflow) hoặc tràn dưới (underflow) xảy ra. Trong Java, tràn số nguyên không ném exception; giá trị đơn giản là quay vòng.
   ```java
   int a = Integer.MAX_VALUE;
   int b = 1;
   int sum = a + b; // -2147483648 (minimum int value)
   ```
   Với kiểu dấu phẩy động, tràn trên cho kết quả `Infinity` còn tràn dưới cho kết quả 0.

- Cố chia một số nguyên cho không sẽ ném `ArithmeticException`.
   ```java
   int a = 10;
   int b = 0;
   int result = a / b; // throws ArithmeticException
   ```
   Tuy nhiên, chia một số dấu phẩy động cho không thì không ném exception. Kết quả là `Infinity` hoặc `NaN` (Not-a-Number).
   ```java
   double a = 10.0;
   double b = 0.0;
   double result = a / b; // Infinity or NaN (Not-a-Number)
   ```

### Toán tử bitwise và dịch bit

Ngoài các toán tử số học, Java còn cung cấp một tập toán tử bitwise và dịch bit cho phép bạn thao tác trên từng bit riêng lẻ của giá trị số nguyên. Những toán tử này đặc biệt hữu ích khi làm việc với cờ (flag), mặt nạ (mask) và các thao tác hệ thống mức thấp.

#### Toán tử bitwise

Java có bốn toán tử bitwise: AND (`&`), OR (`|`), XOR (`^`) và bù (`~`).

Toán tử bitwise AND (`&`) trả về bit 1 ở mỗi vị trí mà bit tương ứng của **cả hai** toán hạng đều là 1.
```java
int a = 0b1010; // 10
int b = 0b1100; // 12
int result = a & b; // 0b1000 = 8
```

Toán tử bitwise OR (`|`) trả về bit 1 ở mỗi vị trí mà bit tương ứng của **một hoặc cả hai** toán hạng là 1.
```java
int a = 0b1010; // 10
int b = 0b1100; // 12
int result = a | b; // 0b1110 = 14
```

Toán tử bitwise XOR (OR loại trừ) (`^`) trả về bit 1 ở mỗi vị trí mà bit tương ứng của **đúng một** toán hạng là 1.
```java
int a = 0b1010; // 10
int b = 0b1100; // 12
int result = a ^ b; // 0b0110 = 6
```

Toán tử bù bit (`~`) là toán tử một ngôi, đảo toàn bộ bit của toán hạng.
```java
int a = 0b1010; // 10
int result = ~a; // 0b11111111111111111111111111110101 = -11
```

#### Toán tử dịch bit

Java cung cấp ba toán tử dịch bit: dịch trái (`<<`), dịch phải có dấu (`>>`) và dịch phải không dấu (`>>>`).

Toán tử dịch trái (`<<`) dịch các bit của toán hạng thứ nhất sang trái theo số vị trí mà toán hạng thứ hai chỉ định. Các bit mới ở bên phải được điền bằng 0.
```java
int a = 0b1010; // 10
int result = a << 1; // 0b10100 = 20
```
Mỗi lần dịch trái thực chất nhân đôi con số.

Toán tử dịch phải có dấu (`>>`) dịch các bit của toán hạng thứ nhất sang phải theo số vị trí mà toán hạng thứ hai chỉ định. Các bit mới ở bên trái được điền bằng bit dấu (0 với số dương, 1 với số âm), giữ nguyên dấu của số.
```java
int a = 0b1010; // 10
int result = a >> 1; // 0b0101 = 5
```
Mỗi lần dịch phải có dấu thực chất chia đôi con số, làm tròn xuống.

Toán tử dịch phải không dấu (`>>>`) tương tự dịch phải có dấu, nhưng các bit mới ở bên trái luôn được điền bằng 0, bất kể dấu.
```java
int a = 0b11111111111111111111111111110110; // -10
int result = a >>> 1; // 0b01111111111111111111111111111011 = 2147483643
```

#### Tóm tắt toán tử bitwise và dịch bit

Đây là bảng tóm tắt các toán tử bitwise và dịch bit trong Java:

| Toán tử   | Tên                | Mô tả                                                 | Ví dụ    |
|------------|---------------------|-------------------------------------------------------------|------------|
| `&`        | Bitwise AND         | Trả về 1 nếu cả hai bit đều là 1                                | `a & b`    |
| `\|`        | Bitwise OR          | Trả về 1 nếu ít nhất một bit là 1                         | `a \| b`   |
| `^`        | Bitwise XOR         | Trả về 1 nếu đúng một bit là 1                           | `a ^ b`    |
| `~`        | Bù bit  | Đảo toàn bộ bit                                            | `~a`       |
| `<<`       | Dịch trái          | Dịch bit sang trái, điền 0                           | `a << b`   |
| `>>`       | Dịch phải có dấu  | Dịch bit sang phải, điền bằng bit dấu                    | `a >> b`   |
| `>>>`      | Dịch phải không dấu| Dịch bit sang phải, điền 0                          | `a >>> b`  |

Vài điểm tinh tế nữa cần cân nhắc:

- Toán hạng bên trái của toán tử dịch bit quyết định kiểu của kết quả. Toán hạng bên phải (khoảng cách dịch) luôn được nâng lên `int`.
   ```java
   byte a = 10;
   byte b = a << 1; // Compilation error: the result is int
   int c = a << 1; // OK
   ```

- Java **không** có toán tử dịch trái không dấu riêng. Toán tử dịch trái (`<<`) vốn dĩ dịch bit sang trái và điền các bit bên phải bằng số không, khiến nó thực chất là không dấu. Khái niệm có dấu hay không dấu không áp dụng cho dịch trái theo cách như với dịch phải, vì dịch trái không liên quan tới bit dấu.

- Toán tử bitwise và dịch bit có độ ưu tiên thấp hơn toán tử số học nhưng cao hơn toán tử so sánh và toán tử logic. Hãy dùng ngoặc đơn để làm rõ độ ưu tiên và khiến mã dễ đọc hơn.

### Toán tử gán

Toán tử gán được dùng để gán giá trị cho biến. Ngoài toán tử gán đơn giản (`=`), Java còn cung cấp các toán tử gán ghép (compound assignment) kết hợp một phép số học hoặc bitwise với phép gán.

Toán tử gán ghép kết hợp một phép số học hoặc bitwise với phép gán. Chúng cung cấp cách súc tích để sửa giá trị của biến dựa trên giá trị hiện tại của nó.

Cú pháp chung của toán tử gán ghép là:
```
variable op= expression;
```

Trong đó `op` là một trong các toán tử số học hoặc bitwise (`+`, `-`, `*`, `/`, `%`, `&`, `|`, `^`, `<<`, `>>`, `>>>`).

Nó tương đương với:
```
variable = variable op expression;
```

Các toán tử gán ghép gồm:
- `+=` (gán cộng)
- `-=` (gán trừ)
- `*=` (gán nhân)
- `/=` (gán chia)
- `%=` (gán chia lấy dư)
- `&=` (gán bitwise AND)
- `|=` (gán bitwise OR)
- `^=` (gán bitwise XOR)
- `<<=` (gán dịch trái)
- `>>=` (gán dịch phải có dấu)
- `>>>=` (gán dịch phải không dấu)

Đây là ví dụ cho từng toán tử gán ghép:
```java
int a = 10;

a += 5;  // equivalent to a = a + 5; a is now 15
a -= 3;  // equivalent to a = a - 3; a is now 12
a *= 2;  // equivalent to a = a * 2; a is now 24
a /= 4;  // equivalent to a = a / 4; a is now 6
a %= 5;  // equivalent to a = a % 5; a is now 1

int b = 0b1010; // binary representation of 10

b &= 0b1100;  // equivalent to b = b & 0b1100; b is now 0b1000 (8 in decimal)
b |= 0b0101;  // equivalent to b = b | 0b0101; b is now 0b1101 (13 in decimal)
b ^= 0b1001;  // equivalent to b = b ^ 0b1001; b is now 0b0100 (4 in decimal)
b <<= 2;      // equivalent to b = b << 2; b is now 0b10000 (16 in decimal)
b >>= 1;      // equivalent to b = b >> 1; b is now 0b01000 (8 in decimal)
b >>>= 2;     // equivalent to b = b >>> 2; b is now 0b00010 (2 in decimal)
```

Toán tử gán ghép không chỉ súc tích hơn mà còn có thể hiệu quả hơn dạng viết đầy đủ tương đương. Lý do là biến chỉ được tính một lần ở dạng ghép, trong khi nó được tính hai lần ở dạng đầy đủ.

Ví dụ, xét đoạn mã sau:
```java
int[] array = {1, 2, 3, 4, 5};
int index = 2;

array[index++] += 10; // More efficient
array[index++] = array[index++] + 10; // Less efficient
```

Ở dòng đầu, `index` chỉ được tăng một lần sau khi giá trị của nó đã được dùng để truy cập phần tử mảng. Ở dòng thứ hai, `index` được tăng hai lần, dẫn tới hành vi ngoài ý muốn và mã kém hiệu quả hơn.

#### Đổi kiểu nguyên thuỷ bằng hậu tố

Khi gán một giá trị cho biến thuộc kiểu nguyên thuỷ khác, bạn dùng được hậu tố `f`, `l` và `d` để chỉ rõ kiểu của giá trị literal.

- `f` dùng cho literal float
- `l` hoặc `L` dùng cho literal long
- `d` hoặc `D` dùng cho literal double

```java
float a = 3.14f;
long b = 100L;
double c = 3.14d; // d is optional here, as double is the default for decimal literals
```

#### Ép kiểu giá trị

Khi gán giá trị của một kiểu cho biến thuộc kiểu khác, bạn có thể cần dùng ép kiểu để chuyển tường minh giá trị sang kiểu đích.
```java
int a = 10;
byte b = (byte) a;
```
Trong ví dụ này, giá trị `int` được ép sang `byte` trước khi gán.

Khi gán một giá trị quá lớn hoặc quá nhỏ so với kiểu đích, hiện tượng tràn trên hoặc tràn dưới có thể xảy ra.
```java
byte a = 127;
a++; // a is now -128 (underflow)

byte b = -128;
b--; // b is now 127 (overflow)
```
Trong những ví dụ này, tăng giá trị lớn nhất của một `byte` gây tràn dưới, còn giảm giá trị nhỏ nhất gây tràn trên.

Để tránh hành vi ngoài ý muốn do tràn số, cần rà lại các phép gán và đảm bảo giá trị phù hợp với kiểu đích.
```java
int a = 1000;
byte b = (byte) a; // b is now -24 (overflow)
```
Ở đây, ép giá trị int 1000 sang `byte` gây tràn, vì 1000 nằm ngoài dải của `byte` (-128 tới 127).

#### Tóm tắt toán tử gán

Đây là bảng tóm tắt các toán tử gán trong Java:

| Toán tử | Tên                      | Ví dụ |
|----------|---------------------------|---------|
| `=`        | Gán đơn giản         | `a = 10`  |
| `+=`       | Gán cộng       | `a += 5`  |
| `-=`       | Gán trừ    | `a -= 5`  |
| `*=`       | Gán nhân | `a *= 5`  |
| `/=`       | Gán chia       | `a /= 5`  |
| `%=`       | Gán chia lấy dư        | `a %= 5`  |
| `&=`       | Gán bitwise AND    | `a &= 5`  |
| `\|=`       | Gán bitwise OR    | `a \|= 5`  |
| `^=`       | Gán bitwise XOR    | `a ^= 5`  |
| `<<=`      | Gán dịch trái     | `a <<= 2` |
| `>>=`      | Gán dịch phải có dấu | `a >>= 2` |
| `>>>=`     | Gán dịch phải không dấu | `a >>>= 2` |

Vài điểm tinh tế cần cân nhắc:
- Khi ép một giá trị dấu phẩy động sang kiểu số nguyên, phần thập phân bị cắt bỏ (chứ không làm tròn).
   ```java
   double a = 3.9999;
   int b = (int) a; // b is now 3
   ```

- Toán tử gán ghép có độ ưu tiên thấp hơn toán tử số học nhưng cao hơn toán tử gán đơn giản.
   ```java
   int a = 10;
   a *= 5 + 2; // a is now 70 ((10 * 5) + 2)
   a = 10;
   a = a * 5 + 2; // a is now 52 ((10 * 5) + 2)
   ```

- Toán tử gán đơn giản (`=`) nối chuỗi được để gán cùng một giá trị cho nhiều biến.
   ```java
   int a, b, c;
   a = b = c = 10; // a, b, and c are all 10
   ```

- Khi gán một biến cho chính nó bằng toán tử gán ghép, phép toán được thực hiện với giá trị ban đầu của biến.
   ```java
   int a = 5;
   a += a++; // a is now 10 (5 + 5, then a is incremented)
   ```
- Khi dùng toán tử gán ghép với biểu thức, hãy để ý độ ưu tiên toán tử để tránh kết quả ngoài ý muốn.
    ```java
    int a = 10;
    a *= 2 + 5; // a is now 70, not 25! (a = a * (2 + 5))
    ```

### Toán tử so sánh bằng

Toán tử so sánh bằng trong Java dùng để so sánh hai giá trị xem chúng bằng nhau hay khác nhau. Chúng trả về kết quả `boolean` (`true` hoặc `false`) dựa trên phép so sánh.

Java cung cấp hai toán tử so sánh bằng:
- `==` (bằng)
- `!=` (khác)

Đây là ví dụ dùng những toán tử này:
```java
int a = 10;
int b = 20;

boolean result1 = (a == b); // false
boolean result2 = (a != b); // true
```

#### Hiểu về sự bằng nhau

Khi dùng toán tử so sánh bằng, cần hiểu Java so sánh giá trị như thế nào.

Với kiểu nguyên thuỷ, toán tử `==` so sánh giá trị thực tế:
```java
int a = 10;
int b = 10;
boolean result = (a == b); // true
```

Tuy nhiên, với object, toán tử `==` so sánh **tham chiếu object**, không phải nội dung của object:
```java
String s1 = new String("Hello");
String s2 = new String("Hello");
boolean result = (s1 == s2); // false
```

Trong trường hợp này, `s1` và `s2` là hai object khác nhau trong bộ nhớ, dù chúng chứa cùng giá trị chuỗi.

Để so sánh nội dung của object, bạn nên dùng method `equals()`:
```java
String s1 = new String("Hello");
String s2 = new String("Hello");
boolean result = s1.equals(s2); // true
```

Tuy nhiên, khi so sánh object bằng method `equals()`, cần đảm bảo class của object đã override method `equals(Object)` để cung cấp phép so sánh có ý nghĩa.

Phần cài đặt mặc định của `equals(Object)` trong class `Object` đơn giản chỉ so sánh tham chiếu object, hệt như toán tử `==`. Để so sánh nội dung object, bạn cần override `equals(Object)` trong class của mình:
```java
class Person {
    private String name;
    private int age;

    // Constructor, getters, setters...

    @Override
    public boolean equals(Object obj) {
        // Implementation...
    }
}
```

Để override method `equals` trong Java, bạn cần tuân theo một số quy tắc nhằm đảm bảo method hoạt động đúng và tuân thủ hợp đồng do class `Object` định nghĩa:

1. **Đối xứng (Symmetry)**: Nếu `a.equals(b)` là `true` thì `b.equals(a)` cũng phải là `true`.

2. **Phản xạ (Reflexivity)**: Một object phải bằng chính nó; nghĩa là `a.equals(a)` phải là `true`.

3. **Bắc cầu (Transitivity)**: Nếu `a.equals(b)` là `true` và `b.equals(c)` là `true` thì `a.equals(c)` phải là `true`.

4. **Nhất quán (Consistency)**: Nếu `a.equals(b)` trả về `true` một lần, nó phải tiếp tục trả về `true` chừng nào cả hai object đều không bị sửa. Tương tự, nếu nó trả về `false`, nó phải luôn trả về `false`.

5. **Không null (Non-nullity)**: `a.equals(null)` phải luôn trả về `false`.

Đây là ví dụ override method `equals` trong class `Person`:

```java
public class Person {
    private String name;
    private int age;

    // Constructor, getters, and setters

    @Override // 1.
    public boolean equals(Object obj) {
        // 2. Check if obj is the same as this object
        if (this == obj) {
            return true;
        }
        // 3. Check if obj is null or not an instance of Person
        if (obj == null || getClass() != obj.getClass()) {
            return false;
        }
        // 4. Cast obj to Person and compare significant fields
        Person person = (Person) obj;
                                       
        // 5. Compare significant fields
        return age == person.age && (name != null ? name.equals(person.name) : person.name == null);
    }

    @Override
    public int hashCode() {
        // Ensure consistency with the equals method
        int result = name != null ? name.hashCode() : 0;
        result = 31 * result + age;
        return result;
    }
}
```

Ví dụ trên cho thấy cách override method `equals` cho đúng:

1. **Dùng annotation `@Override`**: Điều này đảm bảo bạn đang override method đúng cách và giúp mã dễ đọc hơn.

2. **Kiểm tra `null`**: Kiểm tra đầu tiên nên là xem object đang được so sánh có phải `null` không.

3. **Kiểm tra kiểu**: Dùng toán tử `instanceof` để đảm bảo các object đang so sánh cùng kiểu.

4. **Ép kiểu object**: Ép object sang kiểu đúng sau khi đã kiểm tra.

5. **So sánh các field quan trọng**: So sánh những field quyết định sự bằng nhau, dùng toán tử `==` cho field nguyên thuỷ và method `equals` cho field kiểu object.

Ngoài ra, luôn override `hashCode` khi override `equals` để duy trì hợp đồng chung rằng những object bằng nhau phải có mã băm bằng nhau.

#### Tóm tắt toán tử bằng và khác

Đây là bảng tóm tắt toán tử bằng và khác trong Java:

| Toán tử | Tên         | Ví dụ    |
|----------|--------------|------------|
| `==`       | Bằng     | `a == b`     |
| `!=`       | Khác | `a != b`     |

Vài điểm tinh tế cần cân nhắc:
- Khi so sánh giá trị dấu phẩy động (`float` và `double`) bằng `==` hay `!=`, hãy lưu ý rằng kết quả có thể không như mong đợi do bản chất thiếu chính xác của biểu diễn dấu phẩy động.
   ```java
   double a = 0.1 + 0.2;
   double b = 0.3;
   boolean result = (a == b); // false
   ```

- Toán tử `==` và `!=` có độ ưu tiên cao hơn toán tử logic (`&&`, `||`) nhưng thấp hơn toán tử quan hệ (`<`, `>`, `<=`, `>=`).

- Toán tử `!=` là phủ định của toán tử `==`, nên `a != b` tương đương `!(a == b)`.

### Toán tử quan hệ

Toán tử quan hệ trong Java dùng để so sánh hai giá trị và xác định mối quan hệ giữa chúng. Chúng trả về kết quả `boolean` (`true` hoặc `false`) dựa trên phép so sánh.

Java cung cấp bốn toán tử quan hệ:
- `<` (nhỏ hơn)
- `>` (lớn hơn)
- `<=` (nhỏ hơn hoặc bằng)
- `>=` (lớn hơn hoặc bằng)

Những toán tử này dùng được với các kiểu nguyên thuỷ dạng số và `char`.

Đây là ví dụ dùng toán tử quan hệ với giá trị số nguyên:
```java
int a = 10;
int b = 20;

boolean result1 = (a < b);  // true
boolean result2 = (a > b);  // false
boolean result3 = (a <= b); // true
boolean result4 = (a >= b); // false
```

Và đây là ví dụ với giá trị `char`, so sánh giá trị Unicode của các ký tự:
```java
char c1 = 'a';
char c2 = 'b';
boolean result = (c1 < c2); // true
```

#### Tóm tắt toán tử quan hệ

Đây là bảng tóm tắt các toán tử quan hệ trong Java:

| Toán tử | Tên                     | Ví dụ |
|----------|--------------------------|---------|
| `<`        | Nhỏ hơn                | `a < b`   |
| `>`        | Lớn hơn             | `a > b`   |
| `<=`       | Nhỏ hơn hoặc bằng    | `a <= b`  |
| `>=`       | Lớn hơn hoặc bằng | `a >= b`  |

Ngoài ra có hai điểm tinh tế cần cân nhắc:
- Khi so sánh giá trị dấu phẩy động (`float` và `double`) bằng toán tử quan hệ, hãy lưu ý rằng kết quả có thể không như mong đợi do bản chất thiếu chính xác của biểu diễn dấu phẩy động.
   ```java
   double a = 0.1 + 0.2;
   double b = 0.3;
   boolean result = (a <= b); // false
   ```

- Toán tử quan hệ có độ ưu tiên cao hơn toán tử so sánh bằng (`==`, `!=`) và toán tử logic (`&&`, `||`), nhưng thấp hơn toán tử số học (`+`, `-`, `*`, `/`, `%`).

### Toán tử logic

Toán tử logic trong Java dùng để thực hiện các phép logic trên biểu thức boolean. Chúng trả về kết quả `boolean` (`true` hoặc `false`) dựa trên toán hạng và toán tử cụ thể được dùng.

Java cung cấp sáu toán tử logic:
- `&` (logical AND)
- `|` (logical OR)
- `^` (logical XOR)
- `&&` (logical AND đoản mạch)
- `||` (logical OR đoản mạch)
- `!` (logical NOT)

Những toán tử này dùng được với giá trị `boolean` hoặc biểu thức cho ra giá trị `boolean`.

Đây là ví dụ dùng toán tử logic:
```java
boolean a = true;
boolean b = false;

boolean result1 = a & b;  // false
boolean result2 = a | b;  // true
boolean result3 = a ^ b;  // true
boolean result4 = a && b; // false
boolean result5 = a || b; // true
boolean result6 = !a;     // false
```

Và đây là bảng chân trị cho toán tử logical AND (`&`), logical OR (`|`) và logical XOR (`^`):

Logical AND (`&`):

| a       | b       | a & b   |
|---------|---------|---------|
| `false` | `false` | `false` |
| `false` | `true`  | `false` |
| `true`  | `false` | `false` |
| `true`  | `true`  | `true`  |

Logical OR (`|`):

| a       | b       | a \| b  |
|---------|---------|---------|
| `false` | `false` | `false` |
| `false` | `true`  | `true`  |
| `true`  | `false` | `true`  |
| `true`  | `true`  | `true`  |

Logical XOR (`^`):

| a       | b       | a ^ b   |
|---------|---------|---------|
| `false` | `false` | `false` |
| `false` | `true`  | `true`  |
| `true`  | `false` | `true`  |
| `true`  | `true`  | `false` |

Tóm lại:
- `&` (AND) là `true` chỉ khi cả hai toán hạng đều `true`.
- `|` (OR) là `true` nếu ít nhất một toán hạng là `true`.
- `^` (XOR) là `true` nếu đúng một toán hạng là `true`.

#### Đoản mạch (short-circuit)

Toán tử `&&` và `||` là toán tử đoản mạch. Chúng chỉ tính toán hạng thứ hai khi cần thiết, dựa trên kết quả của toán hạng thứ nhất.

Với `&&`, nếu toán hạng thứ nhất là `false` thì toàn bộ biểu thức sẽ là `false`, bất kể toán hạng thứ hai. Do đó toán hạng thứ hai không được tính.

Với `||`, nếu toán hạng thứ nhất là `true` thì toàn bộ biểu thức sẽ là `true`, bất kể toán hạng thứ hai. Do đó toán hạng thứ hai không được tính.

Đoản mạch hữu ích để tránh `NullPointerException` khi kiểm tra `null` trước khi truy cập method hay field của một object:
```java
String str = null;
if (str != null && str.length() > 0) {
    // This code will not throw a NullPointerException
}
```
Tuy nhiên, hãy cẩn thận khi dùng toán tử đoản mạch với những biểu thức có tác dụng phụ (ví dụ lời gọi method làm thay đổi dữ liệu hoặc gây hệ quả khác):
```java
int a = 10;
if (a > 5 || ++a > 10) {
    // a will be 11 if a > 5, but will remain 10 if a <= 5
}
```

#### Tóm tắt toán tử logic

Đây là bảng tóm tắt các toán tử logic trong Java:

| Toán tử | Tên                       | Ví dụ |
|----------|----------------------------|---------|
| `&`        | Logical AND                | `a & b`   |
| `\|`        | Logical OR                 | `a \| b`  |
| `^`        | Logical XOR (OR loại trừ) | `a ^ b`   |
| `&&`       | Logical AND đoản mạch  | `a && b`  |
| `\|\|`       | Logical OR đoản mạch | `a \|\| b`|
| `!`        | Logical NOT                | `!a`      |

Vài điểm tinh tế cần cân nhắc:
- Toán tử `&`, `|` và `^` cũng dùng được như toán tử bitwise khi áp dụng cho kiểu số nguyên (`byte`, `short`, `int`, `long`). Trong ngữ cảnh đó, chúng thực hiện phép bitwise AND, OR và XOR trên từng bit của các toán hạng.

- Toán tử `!` có độ ưu tiên cao hơn các toán tử `&`, `|`, `^`, `&&` và `||`.

- Toán tử `&`, `|` và `^` có độ ưu tiên thấp hơn toán tử `&&` và `||`.

- Toán tử `&`, `|` và `^` **luôn** tính cả hai toán hạng, ngay cả khi kết quả đã xác định được từ toán hạng thứ nhất. Điều này kém hiệu quả hơn dùng toán tử đoản mạch `&&` và `||` khi toán hạng thứ hai tốn kém để tính hoặc có tác dụng phụ.

- Toán tử `^` trả về `true` khi và chỉ khi đúng một trong hai toán hạng là `true`. Điều này khác hành vi của toán tử `!=`, vốn trả về `true` nếu các toán hạng không bằng nhau.

- Toán tử logic kết hợp được với nhau để tạo biểu thức boolean phức tạp. Cần dùng ngoặc đơn để chỉ rõ thứ tự tính toán mong muốn khi dùng nhiều toán tử.
   ```java
   boolean result = (a && b) || (c && d);
   ```

## `String` và `StringBuilder`

Chuỗi (string) đơn giản là một dãy ký tự. Tuy nhiên, bên dưới, chuỗi có vài đặc tính và tối ưu hoá riêng mà bạn cần hiểu.

```java
String greeting = "Hello World!";
```

Class `String` trong Java là bất biến (immutable), nghĩa là một khi object string được tạo, giá trị của nó không thể thay đổi. Điều này thoạt nghe có vẻ trái trực giác — dù sao ta vẫn thường xuyên sửa chuỗi trong chương trình. Nhưng điều thực sự xảy ra là một object string mới được tạo ra mỗi lần, còn object gốc giữ nguyên.

Tính bất biến này mang lại vài lợi ích. Chuỗi được chia sẻ an toàn giữa nhiều phần của chương trình mà không lo một phần vô tình sửa chuỗi cho tất cả các phần còn lại. JVM cũng tối ưu được bộ nhớ bằng cách tái sử dụng những chuỗi phổ biến.

Tuy nhiên, tính bất biến cũng đồng nghĩa những thao tác làm thay đổi chuỗi (như nối chuỗi) kém hiệu quả hơn, vì mỗi lần đều phải tạo một chuỗi mới.

### Tạo chuỗi

Có vài cách tạo chuỗi trong Java:

```java
String literalString = "I am a literal string";
String objectString = new String("I am a String object");
```

Cả hai đều cho ra kết quả cuối giống nhau: một chuỗi với giá trị đã nêu. Tuy nhiên có chút khác biệt trong cách JVM xử lý chúng.

Khi bạn tạo một string literal, JVM trước hết kiểm tra **string pool** — vùng nhớ đặc biệt dành riêng cho chuỗi. Nếu một chuỗi tương đương đã có trong pool, JVM đơn giản trả về tham chiếu tới chuỗi có sẵn đó thay vì cấp phát bộ nhớ mới.

```java
String s1 = "Hello";
String s2 = "Hello";
System.out.println(s1 == s2);  // Prints 'true'
```

Ở đây, `s1` và `s2` thực sự trỏ tới cùng một object string trong bộ nhớ, vì `"Hello"` đã có sẵn trong string pool.

Ngược lại, dùng keyword `new` luôn tạo một object mới, ngay cả khi chuỗi tương đương đã có trong pool.

```java
String s3 = new String("Hello");
System.out.println(s1 == s3);  // Prints 'false'
```

Ở đây, dù `s1` và `s3` có cùng nội dung, chúng trỏ tới hai object khác nhau trong bộ nhớ.

Nếu bạn có một object string và muốn đảm bảo nó dùng chuỗi đã tối ưu bộ nhớ từ pool, bạn dùng được method `intern()`.

```java
String s4 = s3.intern();
System.out.println(s1 == s4);  // Prints 'true'
```

Sau khi intern `s3`, `s4` giờ trỏ tới cùng chuỗi trong pool như `s1`.

Tuy nhiên, cần dùng `intern()` một cách chừng mực. Lạm dụng nó thực chất có thể gây vấn đề hiệu năng, vì string pool là tài nguyên hữu hạn. Nó phù hợp nhất cho những chuỗi bạn dự đoán sẽ được tái sử dụng thường xuyên trong chương trình.

### Nối chuỗi

Nối chuỗi là thao tác phổ biến, và Java cung cấp hai cách chính để làm việc đó.

```java
String s1 = "Hello";
String s2 = "World";
String s3 = s1 + " " + s2;  // Using the + operator
String s4 = s1.concat(" ").concat(s2);  // Using the concat() method
```

Cả hai cách đều cho cùng kết quả. Tuy nhiên có vài khác biệt cần cân nhắc.

Toán tử `+` thường dễ đọc hơn và được trình biên dịch Java tối ưu thành thao tác `StringBuilder` (sẽ nói ngay sau đây). Khi bạn dùng `+`, trình biên dịch thực chất biến đổi nó thành đại loại như:

```java
String s3 = new StringBuilder(s1).append(" ").append(s2).toString();
```

Nên dù trông như bạn đang tạo chuỗi mới với mỗi dấu `+`, trình biên dịch đủ thông minh để dùng `StringBuilder` ở bên dưới nhằm tối ưu.

Mặt khác, method `concat` là method trực tiếp của class `String`. Nó nối chuỗi đã nêu vào cuối chuỗi hiện tại và trả về một chuỗi mới. Đây là signature của method:

```java
String concat(String str)
```

Và đây là một ví dụ khác:

```java
String s4 = s1.concat(" ");  // s4 is "Hello "
s4 = s4.concat(s2);  // s4 is now "Hello World"
```

Một ưu điểm của `concat` là nó tường minh hơn về việc đang xảy ra: bạn đang gọi một method để nối chuỗi thay vì dùng toán tử. Điều này khiến mã dễ đọc hơn, nhất là với lập trình viên mới học Java, chưa quen cách toán tử `+` được tối ưu.

Tuy nhiên, `concat` chỉ nối được một chuỗi mỗi lần, nên để nối nhiều chuỗi bạn cần gọi `concat` nhiều lần, khá cồng kềnh. Toán tử `+` cho phép nối nhiều chuỗi trong một biểu thức duy nhất, thường tiện hơn.

Suy cho cùng, lựa chọn giữa `+` và `concat` thường phụ thuộc sở thích cá nhân và phong cách viết mã. Nhiều lập trình viên thích `+` vì súc tích và dễ đọc, trong khi số khác thích sự tường minh của `concat`.

Tuy nhiên, cần thận trọng khi dùng bất kỳ cách nào trong vòng lặp, vì nó có thể gây vấn đề hiệu năng do tạo ra nhiều object chuỗi trung gian. Trong những trường hợp đó nên dùng trực tiếp `StringBuilder`.

```java
String result = "";
for (int i = 0; i < 100; i++) {
    result = result.concat(Integer.toString(i));  // Inefficient!
}
```

Đoạn mã này tạo một chuỗi mới ở mỗi vòng lặp. Với số vòng lặp lớn, cách này rất kém hiệu quả cả về thời gian lẫn bộ nhớ. Nên dùng `StringBuilder` trong những trường hợp như vậy (sẽ bàn ở phần sau).

### Các method quan trọng của String

Class `String` cung cấp một tập method phong phú để kiểm tra và thao tác nội dung chuỗi. Đây là một số method thường dùng nhất:

- `int length()`: Trả về số ký tự trong chuỗi.

- `char charAt(int index)`: Trả về ký tự tại chỉ số đã nêu.

- `int indexOf(String str)`: Trả về chỉ số trong chuỗi của lần xuất hiện đầu tiên của chuỗi con đã nêu.

- `String substring(int beginIndex, int endIndex)`: Trả về chuỗi mới là chuỗi con của chuỗi này.

- `String toLowerCase()`: Chuyển toàn bộ ký tự trong chuỗi này thành chữ thường.

- `String toUpperCase()`: Chuyển toàn bộ ký tự trong chuỗi này thành chữ hoa.

- `boolean equals(Object anObject)`: So sánh chuỗi này với object đã nêu.

- `boolean equalsIgnoreCase(String anotherString)`: So sánh chuỗi này với chuỗi khác, bỏ qua phân biệt hoa thường.

- `boolean startsWith(String prefix)`: Kiểm tra chuỗi này có bắt đầu bằng tiền tố đã nêu không.

- `boolean endsWith(String suffix)`: Kiểm tra chuỗi này có kết thúc bằng hậu tố đã nêu không.

- `boolean contains(CharSequence s)`: Trả về `true` khi và chỉ khi chuỗi này chứa dãy giá trị `char` đã nêu.

- `String replace(char oldChar, char newChar)`: Trả về chuỗi mới có được bằng cách thay mọi lần xuất hiện của `oldChar` trong chuỗi này bằng `newChar`.

- `String strip()`: Trả về chuỗi có giá trị là chuỗi này, đã loại bỏ toàn bộ khoảng trắng ở đầu và cuối.

- `String trim()`: Trả về chuỗi có giá trị là chuỗi này, đã loại bỏ toàn bộ khoảng trắng ở đầu và cuối, trong đó khoảng trắng được định nghĩa là mọi ký tự có codepoint nhỏ hơn hoặc bằng `'U+0020'` (ký tự khoảng trắng).

- `String indent(int n)`: Điều chỉnh mức thụt lề của từng dòng trong chuỗi này dựa trên giá trị `n`.

- `String stripIndent()`: Trả về chuỗi có giá trị là chuỗi này, đã loại bỏ khoảng trắng phụ trợ ở đầu và cuối mỗi dòng.

- `boolean isEmpty()`: Trả về `true` khi và chỉ khi `length()` bằng 0.

- `boolean isBlank()`: Trả về `true` nếu chuỗi rỗng hoặc chỉ chứa các codepoint khoảng trắng, ngược lại trả về `false`.

Mỗi method trên cung cấp một tiện ích cụ thể, và cùng nhau chúng tạo thành bộ công cụ mạnh mẽ để làm việc với chuỗi. Tuy nhiên, nhớ rằng do tính bất biến của chuỗi, những method có kiểu trả về là `String` sẽ trả về chuỗi **mới** chứ không sửa chuỗi gốc. Ví dụ:

```java
String s1 = "  Hello World   ";
String s2 = s1.strip();
System.out.println(s1);  // Still prints "  Hello World   "
System.out.println(s2);  // Prints "Hello World"
```

Điều này cũng cho phép một kỹ thuật gọi là **method chaining** (nối chuỗi lời gọi method), trong đó nhiều method được gọi trong một biểu thức duy nhất.

```java
String result = "  Hello World  ".trim().toUpperCase().replace('O', '0');
System.out.println(result);  // Prints "HELL0 W0RLD"
```

Ở đây, chuỗi gốc được cắt khoảng trắng, rồi chuyển thành chữ hoa, và cuối cùng mọi ký tự `'O'` được thay bằng `'0'`. Mỗi method trả về một chuỗi mới, chuỗi đó trở thành nền cho method kế tiếp trong chuỗi lời gọi.

Chaining khiến mã súc tích và dễ đọc hơn, nhưng đừng lạm dụng. Những chuỗi lời gọi quá dài sẽ khó hiểu và khó gỡ lỗi.

Ngoài ra, một số method trong đó làm việc với chỉ số. Chỉ số chạy từ 0 tới `length()` - 1. Ký tự đầu tiên của dãy nằm ở chỉ số 0, ký tự kế tiếp ở chỉ số 1, v.v., y như cách hoạt động với mảng.

### Override `toString()`

Một method đặc biệt cần biết là `toString()`. Method này được định nghĩa trong class `Object`, mà mọi class trong Java đều kế thừa. Nó trả về biểu diễn chuỗi của object.

Mặc định, chuỗi này không mấy hữu ích (nó gồm tên class của object và mã băm). Tuy nhiên, ta override được `toString()` trong class của mình để cung cấp biểu diễn hữu ích hơn.

```java
public class Person {
    private String name;
    private int age;

    // Constructor and other methods...

    @Override
    public String toString() {
        return "Person[name=" + name + ",age=" + age + "]";
    }
}
```

Giờ khi ta in một object `Person`, ta sẽ nhận được chuỗi được định dạng đẹp:

```java
Person alice = new Person("Alice", 25);
System.out.println(alice);  // Prints "Person[name=Alice,age=25]"
```

Điều này đặc biệt hữu ích cho việc ghi log và gỡ lỗi.

### Định dạng chuỗi

Ngoài việc thao tác chuỗi, Java còn cung cấp những công cụ mạnh mẽ để định dạng chúng. Class `String` có method `format()` và `formatted()` cho phép bạn tạo một chuỗi được định dạng từ một chuỗi định dạng cùng các đối số.

```java
String name = "Alice";
int age = 25;
String city = "Florida";
String formatted = String.format("My name is %s, I'm %d years old, and I live in %s.", name, age, city);
System.out.println(formatted);
// Prints "My name is Alice, I'm 25 years old, and I live in Florida."
```

Chuỗi định dạng chứa các chỗ giữ (placeholder) — `%s` cho chuỗi, `%d` cho số nguyên, v.v. — được thay bằng những đối số tương ứng.

Đây là một số placeholder định dạng phổ biến nhất:

| Ký hiệu định dạng   | Mô tả |
|--------------------|-------------|
| `%s`               | Chuỗi      |
| `%c`               | Ký tự   |
| `%d`               | Số nguyên thập phân |
| `%f`               | Số dấu phẩy động |
| `%t`               | Ngày/giờ   |
| `%n`               | Xuống dòng     |

Đây chỉ là vài ví dụ; [danh sách đầy đủ các tuỳ chọn định dạng](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/Formatter.html#syntax) khá đồ sộ, cho phép kiểm soát chính xác định dạng đầu ra.

### Dùng class `StringBuilder`

Dù class `String` rất mạnh, tính bất biến của nó có thể gây vấn đề hiệu năng khi bạn cần sửa chuỗi nhiều lần. Đây là lúc `StringBuilder` xuất hiện.

`StringBuilder` là một dãy ký tự **khả biến**. Nó cung cấp những method tương tự `String` để nối, chèn và xoá ký tự. Tuy nhiên, những method này sửa chính `StringBuilder` chứ không tạo object mới.

Tính khả biến này cho phép viết mã hiệu quả hơn khi bạn cần sửa chuỗi nhiều lần. Với `String`, mỗi lần sửa đều tạo một object chuỗi mới, tốn kém về thời gian và bộ nhớ nếu làm thường xuyên, chẳng hạn trong vòng lặp. `StringBuilder` tránh được điều đó bằng cách sửa trực tiếp dãy ký tự bên trong nó.

Hơn nữa, các method của `StringBuilder` nối chuỗi lời gọi được với nhau, tương tự method của `String`. Tuy nhiên, vì `StringBuilder` là khả biến, mỗi method trong chuỗi lời gọi sửa cùng một instance `StringBuilder` và trả về tham chiếu tới nó, cho phép tiếp tục nối:

```java
StringBuilder sb = new StringBuilder("Hello");
sb.append(" World").insert(0, "Hey, ").delete(4, 10);
System.out.println(sb);  // Prints "Hey, World"
```

Trong ví dụ này, ta bắt đầu với một `StringBuilder` chứa `"Hello"`. Sau đó ta nối thêm `" World"`, chèn `"Hey, "` vào đầu, và xoá các ký tự từ chỉ số 4 tới 9 (bao gồm). Mỗi thao tác đều sửa cùng một instance `StringBuilder`.

Bạn tạo được `StringBuilder` theo vài cách:

```java
StringBuilder sb1 = new StringBuilder();  // Creates an empty StringBuilder
StringBuilder sb2 = new StringBuilder(10);  // Creates a StringBuilder with initial capacity of 10
StringBuilder sb3 = new StringBuilder("Hello");  // Creates a StringBuilder initialized with the string "Hello"
```

Khi bạn tạo một `StringBuilder` mà không nêu chuỗi khởi tạo, nó bắt đầu với sức chứa mặc định 16 ký tự. Nếu bạn biết mình sẽ dựng một chuỗi lớn hơn, bạn nêu sức chứa ban đầu cao hơn để tránh việc tự động mở rộng sau này — thao tác vốn tốn kém.

### Các method quan trọng của `StringBuilder`

`StringBuilder` cung cấp nhiều method giống `String` để kiểm tra và sửa dãy ký tự, tuy nhiên có hai điều đáng nhắc:
- Những method này sửa chính instance `StringBuilder` chứ không tạo instance mới.
- `StringBuilder` **không** kế thừa từ `String`; tuy nhiên cả hai class đều cài đặt interface [CharSequence](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/CharSequence.html).

**Method dùng chung với `String`:**
- `int length()`: Trả về số ký tự trong `StringBuilder`.
- `char charAt(int index)`: Trả về ký tự tại vị trí đã nêu.
- `int indexOf(String str)`: Trả về chỉ số của lần xuất hiện đầu tiên của chuỗi con đã nêu.
- `String substring(int start)` và `substring(int start, int end)`: Trả về chuỗi mới là chuỗi con của dãy này.

**Nối thêm giá trị:**
- `StringBuilder append(...)`: Nối biểu diễn chuỗi của đối số vào cuối dãy. Có các phiên bản nạp chồng cho mọi kiểu nguyên thuỷ, mảng `char`, `CharSequence` và `Object`.

**Chèn dữ liệu:**
- `StringBuilder insert(int offset, ...)`: Chèn biểu diễn chuỗi của đối số thứ hai vào dãy tại vị trí do đối số thứ nhất chỉ định. Có các phiên bản nạp chồng cho mọi kiểu nguyên thuỷ, mảng `char`, `CharSequence` và `Object`.

**Xoá nội dung:**
- `StringBuilder delete(int start, int end)`: Xoá các ký tự trong một đoạn con của dãy này.
- `StringBuilder deleteCharAt(int index)`: Xoá ký tự tại vị trí đã nêu.

**Thay thế một phần:**
- `StringBuilder replace(int start, int end, String str)`: Thay các ký tự trong một đoạn con của dãy này bằng các ký tự của chuỗi đã nêu.
- `setCharAt(int index, char ch)`: Đặt ký tự tại chỉ số đã nêu thành `ch`.

**Đảo ngược:**
- `void StringBuilder reverse()`: Thay dãy ký tự này bằng dãy đảo ngược của nó.

**Chuyển sang `String`:**
- `String toString()`: Trả về chuỗi biểu diễn dữ liệu trong dãy này.

Đây là ví dụ minh hoạ vài method trong số đó:

```java
StringBuilder sb = new StringBuilder("Hello");
sb.append(" there");  // Now contains "Hello there"
sb.insert(5, ",");  // Now contains "Hello, there"
sb.replace(7, 12, "world");  // Now contains "Hello, world"
sb.delete(5, 7);  // Now contains "Helloworld"
sb.reverse();  // Now contains "dlrowolleH"

String finalString = sb.toString();
System.out.println(finalString);  // Prints "dlrowolleH"
```

Trong ví dụ này, ta bắt đầu với một `StringBuilder` chứa `"Hello"`, rồi nối `" there"`, chèn dấu phẩy sau `"Hello"`, thay `"there"` bằng `"world"`, xoá dấu phẩy và khoảng trắng, đảo ngược toàn bộ chuỗi, và cuối cùng chuyển nó thành `String`.

Cần lưu ý rằng dù `StringBuilder` là khả biến, nó **không** được đồng bộ hoá. Nếu nhiều thread cùng truy cập một instance `StringBuilder` và ít nhất một thread đang sửa nó, bạn phải đảm bảo đồng bộ hoá đúng cách trong mã để tránh hỏng dữ liệu. Nếu cần phiên bản an toàn với đa luồng, bạn dùng `StringBuffer` — giống `StringBuilder` nhưng được đồng bộ hoá (đánh đổi bằng một chút chi phí hiệu năng).

Cuối cùng, đây là sơ đồ tóm tắt khác biệt giữa `String` và `StringBuilder`:
```
┌───────────────────────────────────────────────────┐
│           String vs StringBuilder                 │
│                                                   │
│  ┌─────────────────────┐ ┌─────────────────────┐  │
│  │       String        │ │    StringBuilder    │  │
│  ├─────────────────────┤ ├─────────────────────┤  │
│  │ - Immutable         │ │ - Mutable           │  │
│  │ - Thread-safe       │ │ - Not thread-safe   │  │
│  │ - Slower for        │ │ - Faster for        │  │
│  │   concatenation     │ │   concatenation     │  │
│  │ - Less memory       │ │ - More memory       │  │
│  │   efficient for     │ │   efficient for     │  │
│  │   many modifications│ │   many modifications│  │
│  └─────────────────────┘ └─────────────────────┘  │
│                                                   │
│  Use for:               Use for:                  │
│  - Constant strings     - Building strings        │
│  - Simple concatenation - Many modifications      │
│  - Thread safety needed - Performance critical    │
│                           string operations       │
└───────────────────────────────────────────────────┘
```

## Text Block

Text block cung cấp cú pháp súc tích và trực quan hơn để biểu diễn chuỗi, giữ nguyên dấu xuống dòng và thụt lề mà không cần dãy escape tường minh hay phép nối chuỗi:
```java
String traditional = "{\n" +
                     "  \"name\": \"John Doe\",\n" +
                     "  \"age\": 30\n" +
                     "}";

String textBlock = """
                   {
                     "name": "John Doe",  
                     "age": 30
                   }
                   """;
```

Như bạn thấy, bản text block sạch sẽ và dễ đọc hơn nhiều. Nó loại bỏ toàn bộ những ký tự xuống dòng (`\n`) và dấu nháy escape (`\"`) gây rối mắt trong string literal truyền thống. Với text block, thấy sao được vậy — chuỗi hiện trong mã của bạn đúng như nó sẽ được xuất ra.

Để định nghĩa một text block, bạn dùng ba dấu nháy kép (`"""`) làm dấu mở và dấu đóng. Nội dung của text block nằm giữa hai dấu này và trải được nhiều dòng:
```java
String textBlock = """
                   This is a Text Block.
                   It can contain multiple lines,
                     indentation,
                   and "special" characters.
                   """;
```

Lưu ý dấu đóng (`"""`) phải nằm riêng trên một dòng và theo sau là dấu chấm phẩy. Mọi khoảng trắng sau dấu đóng trên dòng đó đều bị bỏ qua.

Một hiểu lầm phổ biến là bạn dùng được một dấu nháy đơn để đóng text block đã mở bằng ba dấu nháy. Nhưng không phải vậy. Dấu mở và dấu đóng của text block luôn phải là ba dấu nháy kép (`"""`).

Trình biên dịch coi toàn bộ nội dung giữa hai dấu là một phần của string literal, gồm cả dấu xuống dòng, thụt lề và mọi khoảng trắng khác. Tuy nhiên có vài quy tắc về thụt lề và escape mà ta sẽ bàn ngay sau đây.

### Đặc điểm của text block

Một trong những đặc điểm then chốt của text block là khả năng biểu diễn chuỗi nhiều dòng một cách tự nhiên, không cần dùng ký tự xuống dòng tường minh hay phép nối chuỗi.
```java
String multiLine = """
                   First line
                   Second line
                   Third line
                   """;
```

Text block này giữ nguyên dấu xuống dòng và thụt lề đúng như đã viết, cho ra chuỗi gồm ba dòng văn bản. Bạn không cần tự thêm ký tự `\n` hay lo việc căn chỉnh các chuỗi được nối.

Text block cũng tự động xử lý thụt lề dựa trên vị trí của dấu đóng. Trình biên dịch xác định phần khoảng trắng chung ở đầu các dòng nằm giữa hai dấu và tự động cắt bỏ phần đó khỏi mỗi dòng.
```java
String indented = """
                    Line 1
                      Line 2
                    Line 3
                    """;

// Equivalent to:
// "Line 1\n  Line 2\nLine 3\n"
```

Trong ví dụ này, dấu đóng được căn thẳng với dòng ít thụt lề nhất (`Line 1`). Do đó phần khoảng trắng chung là bốn dấu cách, và nó bị cắt khỏi mỗi dòng. Chuỗi kết quả sẽ có `Line 2` thụt vào hai dấu cách so với các dòng khác.

Cần lưu ý rằng text block **không** tự động cắt toàn bộ khoảng trắng ở đầu và cuối. Trình biên dịch chỉ loại bỏ phần khoảng trắng chung ở đầu, dựa trên vị trí dấu đóng. Mọi khoảng trắng đầu/cuối còn lại sẽ được giữ nguyên trong chuỗi cuối cùng.

Xét ví dụ này:
```java
String traditional = "  \n  ";  // This evaluates to two spaces, a newline, and two more spaces.
String textBlock = """
                     \n  
                   """;        // Evaluates to two spaces, a newline, two spaces, 
                               // and an additional final newline added by the text block syntax.

```

Ở đây, chuỗi `traditional` sẽ chứa các dấu cách trước và sau dấu xuống dòng vì chúng là một phần tường minh của chuỗi. Trong `textBlock`, mọi dấu cách và dấu xuống dòng được giữ nguyên như chúng xuất hiện, và một dấu xuống dòng được thêm ở cuối do cách text block xử lý dấu đóng.

Một khía cạnh quan trọng khác của text block là việc escape ký tự đặc biệt. Quy tắc escape trong text block hầu như giống string literal truyền thống, với vài lưu ý:
- Một dấu nháy kép đơn lẻ hoặc một cặp dấu nháy kép bên trong text block không cần escape.
- Ba dấu nháy kép bên trong text block cần được escape để tránh kết thúc khối sớm.
- Để đưa ký tự gạch chéo ngược (`\`) vào text block, bạn phải escape nó bằng một gạch chéo ngược nữa (`\\`).

Ví dụ:
```java
String escaped = """
                 This is a "quoted" text with \\ and @.
                 """;
```

Một hiểu lầm phổ biến là gạch chéo ngược bị bỏ qua trong text block vì đây là literal nhiều dòng. Nhưng không phải vậy. Gạch chéo ngược vẫn giữ ý nghĩa đặc biệt trong text block và cần được escape nếu bạn muốn có một gạch chéo ngược thật trong chuỗi.

Và như bạn thấy trong ví dụ trên, text block cũng hỗ trợ dùng Unicode escape (`\uXXXX`) để biểu diễn ký tự theo code point Unicode.

Cuối cùng, text block kết hợp được với string literal truyền thống và thậm chí với text block khác bằng toán tử `+`, hệt như chuỗi thường:
```java
String name = "John";
String greeting = """
                  Hello, """ + name + """
                  . How are you?
                  """;
```

Ở đây ta nối một text block với một string literal truyền thống (`name`) để tạo lời chào cá nhân hoá. Toán tử `+` xuất hiện trên cùng dòng với dấu mở và dấu đóng của các text block. Đặt nó ở dòng riêng có thể dẫn tới khoảng trắng ngoài ý muốn trong chuỗi kết quả.

## Math API

`Math` API cung cấp một tập static method phong phú để thực hiện các phép toán. Nó gồm method tìm giá trị nhỏ nhất và lớn nhất của hai giá trị, làm tròn số, xác định trần và sàn của một giá trị, và sinh số ngẫu nhiên. Hãy xem qua từng nhóm.

### Tìm giá trị nhỏ nhất và lớn nhất

Class `Math` cung cấp method `min` và `max` để lần lượt tìm giá trị nhỏ nhất và lớn nhất của hai giá trị. Những method này được nạp chồng để nhận đối số kiểu `int`, `long`, `float` và `double`:

```java
static double max(double a, double b)
static float max(float a, float b)
static int max(int a, int b)
static long max(long a, long b)

static double min(double a, double b)
static float min(float a, float b)
static int min(int a, int b)
static long min(long a, long b)
```

Vài ví dụ:

```java
int min = Math.min(5, 10);  // min is 5
int max = Math.max(5, 10);  // max is 10

double min2 = Math.min(5.7, 10.2);  // min2 is 5.7
double max2 = Math.max(5.7, 10.2);  // max2 is 10.2
```

Những method này hữu ích khi bạn cần ép một giá trị nằm trong một khoảng nhất định.

### Làm tròn số

Class `Math` cung cấp vài method để làm tròn số:

- `int round(float)` và `long round(double)`: Trả về giá trị `int` hoặc `long` gần nhất với đối số. Giá trị ở chính giữa (như 0.5) được làm tròn lên, theo quy ước làm tròn nửa lên.
- `double rint(double)`: Trả về giá trị `double` gần nhất với đối số và bằng một số nguyên toán học. Nếu hai giá trị `double` là số nguyên toán học có khoảng cách bằng nhau, giá trị chẵn được chọn.
- `double floor(double)`: Trả về giá trị `double` lớn nhất (gần dương vô cực nhất) nhỏ hơn hoặc bằng đối số và bằng một số nguyên toán học.
- `double ceil(double)`: Trả về giá trị `double` nhỏ nhất (gần âm vô cực nhất) lớn hơn hoặc bằng đối số và bằng một số nguyên toán học.

Vài ví dụ:

```java
long roundedLong = Math.round(5.7);  // roundedLong is 6
int roundedInt = Math.round(5.4f);  // roundedInt is 5

double rintValue = Math.rint(5.5);  // rintValue is 6.0 (ties round to even)
double rintValue2 = Math.rint(6.5);  // rintValue2 is 6.0

double floorValue = Math.floor(5.7);  // floorValue is 5.0
double ceilingValue = Math.ceil(5.2);  // ceilingValue is 6.0
```

Như bạn thấy, sàn (floor) là số nguyên lớn nhất nhỏ hơn hoặc bằng giá trị, còn trần (ceiling) là số nguyên nhỏ nhất lớn hơn hoặc bằng giá trị.

### Sinh số ngẫu nhiên

Class `Math` có method `random()` trả về giá trị `double` mang dấu dương, lớn hơn hoặc bằng 0.0 và nhỏ hơn 1.0:
```java
static double random()
```

Method này hữu ích để sinh số ngẫu nhiên.

```java
double randomValue = Math.random();  // randomValue is a random double between 0.0 and 1.0
```

Bạn dùng `Math.random()` kết hợp với các method `Math` khác để sinh số ngẫu nhiên trong một khoảng cụ thể. Ví dụ, để sinh một số nguyên ngẫu nhiên từ 1 tới 10 (bao gồm hai đầu), bạn làm thế này:

```java
int randomInt = (int)(Math.random() * 10) + 1;
```

Cách hoạt động:
1. `Math.random()` sinh một số double ngẫu nhiên giữa 0.0 và 1.0, gọi nó là `r`.
2. `r * 10` khi đó là một số double ngẫu nhiên giữa 0.0 và 10.0.
3. `(int)(r * 10)` ép số double này sang int, thực chất là làm tròn xuống. Giờ ta có một số nguyên ngẫu nhiên từ 0 tới 9.
4. Cuối cùng, ta cộng 1 để dịch khoảng thành từ 1 tới 10.

Bạn điều chỉnh công thức này để sinh số ngẫu nhiên trong bất kỳ khoảng số nguyên nào. Ví dụ, để sinh một số ngẫu nhiên giữa `min` và `max` (bao gồm hai đầu), bạn dùng:

```java
int randomNum = (int)(Math.random() * (max - min + 1)) + min;
```

## Các điểm chính

- Java có 8 kiểu dữ liệu nguyên thuỷ: `byte`, `short`, `int`, `long`, `float`, `double`, `boolean` và `char`.

- Kiểu nguyên thuỷ là những kiểu dữ liệu cơ bản nhất và không phải object. Chúng lưu giá trị đơn giản trực tiếp trong bộ nhớ.

- Literal số nguyên gán được bằng ký pháp thập phân, thập lục phân (tiền tố `0x` hoặc `0X`), bát phân (tiền tố `0`) hoặc nhị phân (tiền tố `0b` hoặc `0B`).

- Dấu gạch dưới dùng được trong literal số để dễ đọc hơn nhưng có hạn chế về vị trí đặt.

- Kiểu tham chiếu lưu địa chỉ bộ nhớ nơi object nằm, chứ không lưu bản thân object.

- Wrapper class (`Boolean`, `Byte`, `Short`, `Integer`, `Long`, `Float`, `Double`, `Character`) cho phép kiểu nguyên thuỷ được dùng như object.

- Autoboxing tự động chuyển kiểu nguyên thuỷ sang wrapper class, còn unboxing chuyển object wrapper về kiểu nguyên thuỷ.

- Wrapper class cung cấp method để phân tích chuỗi, chuyển đổi giữa các kiểu và nhiều việc khác.

- Object wrapper có thể là `null`, còn kiểu nguyên thuỷ thì không. Unbox một object wrapper `null` sẽ ném `NullPointerException`.

- Java cung cấp một tập toán tử phong phú cho các phép toán học, logic và bitwise.

- Độ ưu tiên toán tử quyết định thứ tự tính toán trong biểu thức. Dấu ngoặc đơn thay đổi được độ ưu tiên mặc định.

- Toán tử một ngôi (`++`, `--`, `+`, `-`, `~`, `!`) tác động lên một toán hạng. Toán tử tăng và giảm (`++` và `--`) dùng được ở dạng tiền tố hoặc hậu tố.

- Toán tử hai ngôi (`+`, `-`, `*`, `/`, `%`) tác động lên hai toán hạng. Numeric promotion tự động chuyển toán hạng sang kiểu lớn hơn để tránh mất độ chính xác.

- Toán tử bitwise (`&`, `|`, `^`, `~`) và toán tử dịch bit (`<<`, `>>`, `>>>`) thao tác trên từng bit của giá trị số nguyên.

- Toán tử gán (`=`, `+=`, `-=`, `*=`, `/=`, `%=`, `&=`, `^=`, `|=`, `<<=`, `>>=`, `>>>=`) gán giá trị cho biến. Toán tử gán ghép kết hợp một phép toán với phép gán.

- Toán tử so sánh bằng (`==` và `!=`) so sánh giá trị. Với object, `==` so sánh tham chiếu, còn `equals()` so sánh nội dung.

- Toán tử quan hệ (`<`, `>`, `<=`, `>=`) so sánh giá trị và xác định mối quan hệ giữa chúng.

- Toán tử logic (`&`, `|`, `^`, `&&`, `||`, `!`) thực hiện phép logic trên biểu thức boolean. Toán tử đoản mạch (`&&` và `||`) bỏ qua việc tính toán hạng thứ hai dựa trên giá trị của toán hạng thứ nhất.

- Chuỗi trong Java là bất biến, nghĩa là giá trị của chúng không thay đổi được sau khi tạo. Mọi thao tác trông như sửa chuỗi thực chất đều tạo ra chuỗi mới.

- String literal được lưu trong string pool, một vùng nhớ đặc biệt. Nếu một chuỗi tương đương đã có trong pool, tham chiếu tới chuỗi đó được trả về thay vì tạo object mới.

- Chuỗi nối được bằng toán tử `+` hoặc method `concat()`. Toán tử `+` được trình biên dịch tối ưu thành thao tác `StringBuilder`.

- Class `String` cung cấp nhiều method để kiểm tra và thao tác nội dung chuỗi, như `length()`, `charAt()`, `substring()`, `toLowerCase()`, `equals()`, `startsWith()`, `endsWith()`, `replace()`, `trim()` và nhiều method khác.

- Method `toString()` kế thừa từ class `Object` trả về biểu diễn chuỗi của một object. Nó override được trong class tự định nghĩa để cung cấp biểu diễn nhiều thông tin hơn.

- Class `String` cung cấp method `format()` và `formatted()` để tạo chuỗi được định dạng bằng placeholder.

- `StringBuilder` là một dãy ký tự khả biến. Nó cung cấp những method tương tự `String` để nối, chèn và xoá ký tự, nhưng những method này sửa chính `StringBuilder` chứ không tạo object mới.

- `StringBuilder` hiệu quả hơn `String` khi cần sửa nhiều lần, vì nó tránh việc tạo object mới cho mỗi lần sửa.

- Những method quan trọng của `StringBuilder` gồm `append()`, `insert()`, `delete()`, `replace()`, `reverse()` và `toString()`.

- Text block cung cấp cú pháp súc tích và trực quan hơn để biểu diễn chuỗi nhiều dòng. Chúng được định nghĩa bằng ba dấu nháy kép (`"""`) làm dấu phân cách.

- Text block tự động xử lý dấu xuống dòng, thụt lề và phần khoảng trắng chung ở đầu, khiến chúng dễ đọc và dễ viết hơn string literal truyền thống.

- Class `Math` cung cấp nhiều static method để thực hiện phép toán, gồm `min()`, `max()`, `round()`, `floor()`, `ceil()` và `random()`.

- Method `random()` dùng kết hợp với các method `Math` khác để sinh số ngẫu nhiên trong một khoảng cụ thể.
