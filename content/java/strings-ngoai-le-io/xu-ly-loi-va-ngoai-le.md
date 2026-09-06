---
layout: chapter

title: "Chương 7: Xử lý lỗi và ngoại lệ"
subtitle: "Error Handling and Exceptions"
exam_objectives:
  - "Xử lý ngoại lệ bằng try/catch/finally, try-with-resources và khối multi-catch, bao gồm cả exception tự định nghĩa."

previous_link: "/ch06.html"
previous_title: "Arrays, Generics, and Collections"
next_link: "/ch08.html"
next_title: "Functional Interfaces and Lambda Expressions"
answers_link: "/ch07a.html"

description: "Cây phân cấp exception, checked và unchecked, exception tự định nghĩa, stack trace, try-catch, multi-catch, finally và try-with-resources trong Java 21."
order: 1
phase: "Chương 7"
tags: [Java, OCP, Exception, try-catch, finally, try-with-resources, Error Handling]
---

## Nội dung chương

- [Hiểu về exception](#heading-hiểu-về-exception)
    - [Hiểu về các loại exception](#heading-hiểu-về-các-loại-exception)
    - [Ném một exception](#heading-ném-một-exception)
    - [Exception tự định nghĩa](#heading-exception-tự-định-nghĩa)
    - [Exception và method](#heading-exception-và-method)
    - [Hiểu về stack trace](#heading-hiểu-về-stack-trace)
    - [Nhận diện các class exception](#heading-nhận-diện-các-class-exception)
- [Xử lý exception](#heading-xử-lý-exception)
    - [Khối `try-catch`](#heading-khối-try-catch)
    - [Khối `finally`](#heading-khối-finally)
- [Tự động quản lý tài nguyên với khối `try-with-resources`](#heading-tự-động-quản-lý-tài-nguyên-với-khối-try-with-resources)
- [Các điểm chính](#heading-các-điểm-chính)
- [Câu hỏi luyện tập](#heading-câu-hỏi-luyện-tập)

---
## Hiểu về exception

Chạy được một chương trình không đồng nghĩa với việc chạy nó cho đúng. Mọi chương trình không tầm thường đều dễ gặp lỗi: lỗi ở đầu vào người dùng, ở phép toán, ở việc truy cập tài nguyên, v.v.

Đó là lúc exception phát huy vai trò. **Exception** báo hiệu một tình huống bất thường hay ngoại lệ làm gián đoạn luồng bình thường của chương trình.

Khi một tình huống ngoại lệ phát sinh, ta nói một exception được *ném ra* (thrown). Khi điều đó xảy ra, luồng bình thường của chương trình bị gián đoạn và việc thực thi được chuyển tới một khối mã đặc biệt gọi là **exception handler** (bộ xử lý ngoại lệ), nếu tồn tại một handler cho exception ấy.

Mục đích của exception là xử lý những lỗi này một cách mềm mại và ngăn chương trình sập hay hành xử bất thường. Bằng cách dùng exception, bạn tách được mã xử lý lỗi khỏi logic chương trình thông thường, khiến mã sạch hơn và dễ quản lý hơn.

Exception không nhất thiết dừng hẳn chương trình khi chúng xảy ra. Khi một exception được ném ra, nó được lan truyền ngược lên call stack cho tới khi được bắt và xử lý bởi một exception handler. Nếu không tìm được handler phù hợp, chương trình sẽ kết thúc. Nhưng nếu bạn có sẵn khối `try-catch` để xử lý exception, chương trình xử lý được vấn đề và tiếp tục chạy.

### Hiểu về các loại exception

Hầu hết class exception thông dụng trong Java là kiểu con của class `java.lang.Exception`. Nhưng đó chưa phải toàn bộ câu chuyện. Để thực sự hiểu exception, ta cần nhìn vào cây phân cấp exception:
```
                         ┌───────────┐
                         │ Throwable │
                         └─────┬─────┘
                               │
                   ┌───────────┴───────────┐
                   │                       │
           ┌───────────────┐       ┌───────────────┐
           │   Exception   │       │     Error     │
           └───────┬───────┘       └───────────────┘
                   │
       ┌───────────┴───────────┐
       │                       │
┌──────────────────┐   ┌───────────────────┐
│ RuntimeException │   │ Checked Exceptions│
└──────────────────┘   └───────────────────┘
```

Ở đỉnh cây phân cấp là class `java.lang.Throwable`. Bên dưới `Throwable` là hai nhánh: `Exception` và `Error`. Dù nghe có vẻ giống nhau, chúng thực chất biểu diễn những thứ khá khác nhau trong Java.

**Exception** là những tình huống mà một ứng dụng hợp lý có thể muốn bắt và xử lý. Chúng thường biểu diễn những tình huống tuy bất thường nhưng không hoàn toàn ngoài dự kiến. Ví dụ, cố mở một file không tồn tại sẽ ném `FileNotFoundException`.

**Error**, ngược lại, không nhằm để chương trình của bạn bắt hay xử lý. Chúng báo hiệu những vấn đề nghiêm trọng mà một ứng dụng hợp lý không nên cố bắt. Hầu hết những lỗi như vậy là tình trạng bất thường. Ví dụ, nếu ứng dụng của bạn hết bộ nhớ, một `OutOfMemoryError` sẽ được ném ra.

Bên dưới class `Exception` lại có hai nhóm nữa: **checked exception** và **unchecked exception** (còn gọi là runtime exception vì chúng kế thừa từ `java.lang.RuntimeException`).

Checked exception là những tình huống ngoại lệ mà một ứng dụng được viết tốt nên lường trước và xử lý. Chúng thường là những exception nằm ngoài tầm kiểm soát của chương trình, như file không tìm thấy, kết nối mạng thất bại, hay đầu vào người dùng không hợp lệ. Checked exception là lớp con của `Exception` nhưng không phải của `RuntimeException`.

Unchecked exception là những tình huống ngoại lệ mà ứng dụng thường không lường trước hay phục hồi được. Chúng thường báo hiệu lỗi lập trình, như lỗi logic hay dùng API sai cách. Unchecked exception là lớp con của `RuntimeException`.

Dù có vẻ như unchecked exception là đủ, checked exception vẫn phục vụ một mục đích quan trọng. Chúng buộc lập trình viên phải xử lý exception, đảm bảo mã xử lý lỗi được viết đàng hoàng. Điều này dẫn tới mã vững chắc và đáng tin cậy hơn.

Ngược lại, unchecked exception không cần khai báo trong mệnh đề `throws` của method dù chúng có thể được ném ra khi method chạy. Chúng thường biểu diễn khiếm khuyết trong chương trình (bug), và vì vậy không thể kỳ vọng mã phía client của API phục hồi hay xử lý chúng theo cách nào đó. Những exception như vậy thường báo hiệu khiếm khuyết lập trình, và unchecked exception là cách ngôn ngữ Java cho phép lập trình viên chỉ ra một khiếm khuyết tiềm ẩn ở nơi trình biên dịch khó phát hiện vấn đề.

### Ném một exception

Tới giờ ta đã nói về exception là gì và các loại exception. Nhưng exception thực sự được ném ra như thế nào?

Một exception được ném ra theo hai cách: tự động bởi hệ thống runtime của Java, hoặc tường minh bởi mã của bạn.

Nhiều exception được hệ thống runtime của Java ném tự động. Ví dụ, nếu bạn cố truy cập phần tử mảng với chỉ số ngoài giới hạn, một `ArrayIndexOutOfBoundsException` sẽ được ném ra. Nếu bạn chia một số cho không, một `ArithmeticException` sẽ được ném ra.

Nhưng bạn cũng ném exception tường minh được trong mã bằng câu lệnh `throw`. Dạng chung của câu lệnh `throw` là:

```java
throw new ExceptionType(messageString);
```

Ở đây, `ExceptionType` là loại exception bạn muốn ném, còn `messageString` là chuỗi tuỳ chọn cung cấp thêm thông tin về exception.

Ví dụ, giả sử bạn có method nhận tham số số nguyên `age`. Nếu tuổi truyền vào là số âm, bạn có thể muốn ném exception:

```java
public void checkAge(int age) {
    if (age < 0) {
        throw new IllegalArgumentException("Age cannot be negative");
    }
    // rest of the method
}
```

Trong trường hợp này, ta ném `IllegalArgumentException` — một loại unchecked exception.

Có nhiều trường hợp việc bạn tự ném exception trong mã của mình là hợp lý, thậm chí cần thiết.

Bằng cách ném exception, bạn báo hiệu rằng đã có lỗi xảy ra và cung cấp thông tin về điều gì đã sai. Điều này đặc biệt quan trọng khi bạn viết method hay class sẽ được lập trình viên khác dùng. Bằng cách ném exception, bạn truyền đạt cho người dùng mã của mình rằng họ đã dùng method hay class của bạn sai cách, hoặc có gì đó đã sai mà họ cần xử lý.

Hơn nữa, bằng cách ném exception, bạn tách được mã xử lý lỗi khỏi luồng bình thường của chương trình. Điều này khiến mã dễ đọc và dễ bảo trì hơn.

### Exception tự định nghĩa

Dù Java cung cấp một tập exception có sẵn phong phú, vẫn có những tình huống việc tạo exception riêng mang lại lợi ích.

Exception tự định nghĩa cho phép bạn thêm ngữ cảnh và ý nghĩa cho những exception mà ứng dụng ném ra. Chúng giúp đóng gói tốt hơn những tình huống lỗi đặc thù của lĩnh vực ứng dụng.

Ví dụ, nếu bạn viết một thư viện phân tích file XML, bạn có thể định nghĩa một `XMLFileParseException` riêng để ném ra mỗi khi có lỗi phân tích file XML. Điều này truyền đạt cho người dùng thư viện chính xác điều gì đã sai, thay vì chỉ ném một `Exception` chung chung.

Để tạo checked exception tự định nghĩa, bạn chỉ cần kế thừa class `Exception` (hoặc một lớp con của nó):

```java
public class XMLFileParseException extends Exception {
    public XMLFileParseException(String message) {
        super(message);
    }
}
```

Để tạo unchecked exception tự định nghĩa, bạn kế thừa class `RuntimeException` (hoặc một lớp con của nó):

```java
public class InvalidInputException extends RuntimeException {
    public InvalidInputException(String message) {
        super(message);
    }
}
```

Sau đó bạn ném exception tự định nghĩa như bất kỳ exception nào khác:

```java
throw new XMLFileParseException("Error parsing XML file: " + fileName);
throw new InvalidInputException("Input cannot be negative");
```

Khi quyết định exception tự định nghĩa của bạn là checked hay unchecked, hãy cân nhắc những hướng dẫn sau:

- Dùng checked exception cho những tình huống ngoại lệ mà phía gọi nên phục hồi được. Chúng thường biểu diễn tình huống nằm ngoài tầm kiểm soát của chương trình, như file không tìm thấy hay kết nối mạng thất bại.

- Dùng unchecked exception (kế thừa `RuntimeException`) cho những tình huống ngoại lệ mà phía gọi thường không phục hồi được. Chúng thường báo hiệu lỗi lập trình, như cố truy cập phần tử mảng với chỉ số ngoài giới hạn.

Một điều nữa cần cân nhắc khi tạo exception tự định nghĩa là serialization. Nếu class exception của bạn sẽ được ném qua nhiều JVM khác nhau (ví dụ trong hệ thống phân tán), nó nên implement interface `java.io.Serializable`.

```java
public class RemoteServiceException extends Exception implements Serializable {
    // ...
}
```

Điều này đảm bảo object exception được serialize và deserialize thành công khi truyền qua mạng.

Cuối cùng, khi tạo exception tự định nghĩa, một thực hành tốt là cung cấp constructor nhận chuỗi thông điệp và một exception nguyên nhân (cause). Cause là exception đã kích hoạt exception của bạn. Điều này cho phép bạn bọc những exception mức thấp vào exception tự định nghĩa mức cao hơn, cung cấp thêm ngữ cảnh về lỗi.

```java
public class DataAccessException extends Exception {
    public DataAccessException(String message) {
        super(message);
    }
    
    public DataAccessException(String message, Throwable cause) {
        super(message, cause);
    }
}
```

Rồi bạn dùng nó như sau:

```java
try {
    // some database operation that throws a SQLException
} catch (SQLException ex) {
    throw new DataAccessException("Error accessing database", ex);
}
```

Bằng cách này, phía gọi mã của bạn biết rằng một `DataAccessException` đã xảy ra, nhưng vẫn truy cập được nguyên nhân bên dưới (`SQLException`) nếu cần xử lý lỗi hay ghi log chi tiết hơn.

### Exception và method

Khi một method ném exception, nó phải khai báo điều đó trong signature. Việc này được làm bằng keyword `throws` theo sau là danh sách những exception mà method có thể ném.

```java
public void readFile(String fileName) throws FileNotFoundException {
    // code that might throw a FileNotFoundException
}
```

Trong ví dụ này, method `readFile` khai báo rằng nó có thể ném `FileNotFoundException`.

Tuy nhiên, không phải mọi exception đều cần khai báo trong signature. Chỉ **checked exception** mới cần khai báo. Unchecked exception (những exception kế thừa `RuntimeException`) không cần khai báo.

Điều này dẫn tới một phân biệt quan trọng: khác nhau giữa `throw` và `throws`.

- `throw` dùng để thực sự ném một exception bên trong method.
- `throws` dùng trong signature của method để khai báo rằng method có thể ném exception.

Một phép so sánh hữu ích để nhớ khác biệt này là trận bóng chày:

- Người ném bóng (pitcher) *ném* bóng.
- Nhưng trước trận, huấn luyện viên nói với trọng tài về những kiểu bóng mà pitcher của mình *sẽ ném* (fastball, curveball, v.v.).

Tương tự trong Java:

- Một method **ném** (`throw`) exception.
- Nhưng trong signature, method **khai báo** (`throws`) những loại exception nó có thể ném.

#### Override method có exception

Khi bạn override một method ở lớp con, bạn được phép khai báo rằng method đó ném **ít** checked exception hơn method bị override.

```java
class Parent {
    public void doSomething() throws IOException, SQLException {
        // ...
    }
}

class Child extends Parent {
    @Override
    public void doSomething() throws IOException {
        // ...
    }
}
```

Trong ví dụ này, method `doSomething` ở class `Parent` khai báo có thể ném `IOException` hoặc `SQLException`. Nhưng khi override `doSomething` ở class `Child`, ta khai báo nó chỉ ném `IOException`.

Điều này được phép vì nó khiến method dễ dùng hơn. Phía gọi method `doSomething` của `Child` chỉ cần xử lý `IOException`, không cần xử lý `SQLException`.

Tuy nhiên, chiều ngược lại thì không được phép. Nếu method của lớp cha không khai báo exception nào, method override ở lớp con không được khai báo checked exception nào.

```java
class Parent {
    public void doSomething() {
        // ...
    }
}

class Child extends Parent {
    @Override
    public void doSomething() throws IOException {  // Compile-time error
        // ...
    }
}
```

Đoạn mã này sẽ không biên dịch được vì method override (ở `Child`) khai báo một checked exception (`IOException`) mà method gốc (ở `Parent`) không khai báo.

Quy tắc là method override được khai báo ném ít exception hơn hoặc exception hẹp hơn (lớp con của những exception đã khai báo) so với method gốc, nhưng không được nhiều hơn hay rộng hơn.

Quy tắc này tồn tại để đảm bảo lớp con luôn dùng được thay cho lớp cha mà không gây ra những checked exception ngoài dự kiến. Đây là nguyên tắc nền tảng của polymorphism và inheritance trong Java.

Tuy nhiên, lưu ý điều này chỉ áp dụng cho checked exception. Unchecked exception thêm vào thoải mái khi override method.

### Hiểu về stack trace

Khi một exception xảy ra trong chương trình Java, nó in ra một **stack trace**. Stack trace cung cấp thông tin về exception và trạng thái của chương trình lúc exception xảy ra.

Stack trace cực kỳ hữu ích khi gỡ lỗi chương trình. Nó cho bạn biết điều gì đã sai và sai ở đâu trong mã.

Hãy xem một stack trace ví dụ:

```
Exception in thread "main" java.lang.NullPointerException
    at com.example.myproject.Book.getTitle(Book.java:16)
    at com.example.myproject.Author.getBookTitles(Author.java:25)
    at com.example.myproject.App.main(Bootstrap.java:14)
```

Stack trace này cho ta biết một `NullPointerException` xảy ra trong method `getTitle` của class `Book`, được gọi từ dòng 25 của method `getBookTitles` thuộc class `Author`, mà method này lại được gọi từ dòng 14 của method `main` thuộc class `App`.

Mỗi dòng trong stack trace đại diện cho một lời gọi method, với lời gọi gần nhất ở trên cùng. Dòng đầu tiên cho biết exception được ném ra, tiếp theo là các lời gọi method đang nằm trên stack tại thời điểm đó.

Với mỗi lời gọi method, stack trace cho biết:
- Tên đầy đủ của class chứa method
- Tên method
- Tên file mã nguồn chứa method
- Số dòng trong file mã nguồn nơi lời gọi method xảy ra

Để đọc stack trace, bạn bắt đầu từ trên xuống. Dòng đầu cho biết loại exception nào được ném. Các dòng sau đại diện cho những lời gọi method trên stack, với lời gọi gần nhất ở trên cùng.

Mỗi dòng cung cấp một manh mối về trạng thái chương trình khi exception được ném. Bạn dùng những manh mối này để xác định chính xác vị trí trong mã nơi vấn đề xảy ra.

### Nhận diện các class exception

Khi gặp exception trong chương trình Java, một trong những bước đầu tiên để giải quyết là xác định đó là loại exception nào. Trước đó bạn đã học về cây phân cấp class exception, mỗi class được thiết kế để biểu diễn một loại vấn đề cụ thể. Nhận diện được những class này và hiểu khi nào chúng được ném ra giúp bạn chẩn đoán vấn đề nhanh hơn.

**Mẹo 1: Đọc tên class exception**  
Tên class exception thường cho biết điều gì đã sai. Ví dụ, `NullPointerException` gợi ý rằng bạn đang cố dùng một tham chiếu `null`; `ArrayIndexOutOfBoundsException` cho biết bạn đang cố truy cập mảng với chỉ số không hợp lệ; còn `IOException` báo hiệu có gì đó sai trong thao tác nhập/xuất.

Làm quen với tên và ý nghĩa của những class exception phổ biến nhất giúp bạn nhanh chóng nhận ra vấn đề trong mã.

**Mẹo 2: Hiểu cây phân cấp exception**  
Hiểu cây phân cấp exception của Java cũng giúp nhận diện exception. Mọi exception trong Java đều kế thừa từ class `Throwable`, class này có hai lớp con chính: `Exception` và `Error`.

Những exception kế thừa trực tiếp từ class `Exception` là checked exception. Chúng thường biểu diễn những vấn đề nên được xử lý trong mã. Ví dụ phổ biến gồm `IOException` và `SQLException`.

Những exception kế thừa từ class `RuntimeException` (vốn là lớp con của `Exception`) là unchecked exception. Chúng thường báo hiệu lỗi lập trình, như cố truy cập phần tử mảng với chỉ số ngoài giới hạn (`ArrayIndexOutOfBoundsException`) hay cố dùng tham chiếu `null` (`NullPointerException`).

`Error`, ngược lại, biểu diễn những vấn đề nghiêm trọng mà một ứng dụng hợp lý không nên cố bắt. Chúng thường là tình trạng không phục hồi được, như hết bộ nhớ (`OutOfMemoryError`) hay tràn stack (`StackOverflowError`).

**Mẹo 3: Đọc thông điệp của exception**  
Khi một exception được ném ra, nó thường kèm theo một thông điệp với chi tiết về điều gì đã sai. Thông điệp này cực kỳ hữu ích để chẩn đoán vấn đề.

Ví dụ, xét thông điệp exception này:
```
java.lang.ArrayIndexOutOfBoundsException: Index 10 out of bounds for length 5
```

Thông điệp này cho biết mã đang cố truy cập phần tử ở chỉ số 10 trong một mảng chỉ có 5 phần tử.

**Mẹo 4: Nhìn vào stack trace**  
Stack trace đi kèm exception cũng cung cấp những manh mối giá trị về điều gì đã sai. Stack trace cho thấy trình tự các lời gọi method dẫn tới exception.

Mỗi dòng trong stack trace đại diện cho một lời gọi method, với lời gọi gần nhất ở trên cùng. Dòng đó cho bạn biết tên method, class chứa nó, và số dòng trong mã nguồn nơi lời gọi xảy ra.

Bằng cách lần theo stack trace, bạn thường xác định được chính xác vị trí trong mã nơi vấn đề xảy ra.

**Mẹo 5: Tra tài liệu Java API**  
Nếu bạn gặp một exception chưa quen, tài liệu Java API là nguồn tham khảo tuyệt vời. Tài liệu của từng class exception cung cấp thông tin về khi nào exception được ném ra và thường kèm ví dụ cách xử lý.

Chẳng hạn, [tài liệu về `ArrayIndexOutOfBoundsException`](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/ArrayIndexOutOfBoundsException.html) ghi:
```
Thrown to indicate that an array has been accessed with an illegal index. The index is either negative or greater than or equal to the size of the array.
```

Đoạn này giải thích rõ khi nào bạn có thể gặp exception ấy.

Cuối cùng, đây là danh sách những unchecked exception, checked exception và class error phổ biến:

**Unchecked exception phổ biến**  
Unchecked exception là những exception không được kiểm tra lúc biên dịch. Chúng thường biểu diễn lỗi lập trình, như sai logic hay dùng API không đúng cách.

1. **ArithmeticException**
   - Ném ra khi xảy ra một tình huống số học ngoại lệ.
2. **ArrayIndexOutOfBoundsException**
   - Ném ra để báo mảng bị truy cập với chỉ số không hợp lệ.
3. **ClassCastException**
   - Ném ra để báo mã đã cố ép một object sang lớp con mà nó không phải instance.
4. **IllegalArgumentException**
   - Ném ra để báo một method được truyền đối số không hợp lệ hoặc không phù hợp.
5. **IllegalStateException**
   - Báo hiệu một method được gọi vào thời điểm không hợp lệ hoặc không phù hợp.
6. **NullPointerException**
   - Ném ra khi ứng dụng cố dùng `null` ở nơi đòi hỏi một object.
7. **NumberFormatException**
   - Ném ra để báo ứng dụng đã cố chuyển một chuỗi sang kiểu số nhưng chuỗi đó không đúng định dạng.

**Checked exception phổ biến**  
Checked exception là những exception được kiểm tra lúc biên dịch. Chúng thường biểu diễn những tình huống mà một ứng dụng hợp lý có thể muốn bắt.

1. **ClassNotFoundException**
   - Ném ra khi ứng dụng cố nạp một class theo tên chuỗi nhưng không tìm thấy định nghĩa của class đó.
2. **IOException**
   - Báo hiệu đã xảy ra một exception nhập/xuất nào đó.
3. **FileNotFoundException**
   - Báo hiệu việc mở file theo đường dẫn đã nêu đã thất bại.
4. **InterruptedException**
   - Ném ra khi một thread đang chờ, đang ngủ hay đang bận, và thread đó bị ngắt.
5. **SQLException**
   - Exception cung cấp thông tin về lỗi truy cập cơ sở dữ liệu hoặc lỗi khác.
6. **TimeoutException**
   - Ném ra khi một thao tác chặn (blocking) hết thời gian chờ.

**Class error phổ biến**  
Error thường được Java Virtual Machine ném ra và báo hiệu những vấn đề nghiêm trọng mà ứng dụng không nên cố bắt.

1. **OutOfMemoryError**
   - Ném ra khi JVM không cấp phát được object vì hết bộ nhớ.
2. **StackOverflowError**
   - Ném ra khi xảy ra tràn stack do ứng dụng đệ quy quá sâu.
3. **VirtualMachineError**
   - Ném ra để báo Java Virtual Machine bị hỏng hoặc đã cạn những tài nguyên cần thiết để tiếp tục hoạt động.
4. **UnknownError**
   - Ném ra khi xảy ra một exception nghiêm trọng nhưng không xác định.

## Xử lý exception

Khi một exception xảy ra trong chương trình Java, bạn cần xử lý nó để ngăn chương trình kết thúc đột ngột. Việc này được làm bằng khối `try-catch`.

### Khối `try-catch`

Cú pháp cơ bản của khối try-catch như sau:

```java
try {
    // code that might throw an exception
} catch (ExceptionType e) {
    // code to handle the exception
}
```

Bạn đặt mã có thể ném exception vào khối `try`. Nếu exception xảy ra bên trong khối `try`, nó được bắt bởi khối `catch`. Khối `catch` nêu loại exception nó xử lý được (`ExceptionType` trong cú pháp trên) và cung cấp mã xử lý exception ấy.

Đây là ví dụ cụ thể:

```java
try {
    File file = new File("example.txt");
    Scanner scanner = new Scanner(file);
    while (scanner.hasNext()) {
        System.out.println(scanner.nextLine());
    }
    scanner.close();
} catch (FileNotFoundException e) {
    System.out.println("File not found: " + e.getMessage());
}
```

Trong ví dụ này, ta cố đọc từ file tên `example.txt`. Nếu file không tồn tại, một `FileNotFoundException` sẽ được ném ra. Khối `catch` bắt exception này và in thông điệp báo không tìm thấy file.

Bạn dùng được nhiều khối `catch` để xử lý những loại exception khác nhau. Nếu exception xảy ra trong khối `try`, Java sẽ tìm khối `catch` đầu tiên xử lý được exception đó, bắt đầu từ trên xuống.

```java
try {
    // code that might throw exceptions
} catch (IOException e) {
    // handle IOException
} catch (SQLException e) {
    // handle SQLException
}
```

Trong ví dụ này, nếu `IOException` xảy ra trong khối `try`, nó được xử lý bởi khối `catch` đầu tiên. Nếu `SQLException` xảy ra, nó được xử lý bởi khối `catch` thứ hai.

Bạn cũng bắt được nhiều exception trong một khối `catch` duy nhất. Đây gọi là khối **multi-catch**.

```java
try {
    // code that might throw exceptions
} catch (IOException | SQLException e) {
    // handle either IOException or SQLException
}
```

Trong ví dụ này, khối `catch` sẽ xử lý hoặc `IOException` hoặc `SQLException`.

Cách này khiến mã súc tích hơn, nhưng chỉ nên dùng khi bạn muốn xử lý các exception theo cùng một cách. Nếu cần xử lý khác nhau, hãy dùng những khối `catch` riêng.

Ngoài ra, khối multi-catch phải bắt hai hoặc nhiều exception **không liên quan** nhau. Exception không liên quan là những exception không có quan hệ cha-con trong cây phân cấp, như `IOException` và `SQLException` ở ví dụ trên.

Tuy nhiên, cần sắp xếp các khối `catch` từ cụ thể nhất tới tổng quát nhất. Nghĩa là đặt khối catch bắt lớp con của exception trước khối bắt lớp cha của chúng. Nếu bạn đặt khối catch `IOException` trước khối catch `FileNotFoundException`, khối catch `FileNotFoundException` sẽ không bao giờ được tới vì `FileNotFoundException` là lớp con của `IOException`. Kết quả là khối catch `IOException` sẽ bắt mọi exception kiểu `IOException`, kể cả `FileNotFoundException`, và mã xử lý cụ thể cho `FileNotFoundException` bị bỏ qua.

Ví dụ:

```java
try {
    // code that might throw exceptions
} catch (FileNotFoundException e) {
    // handle FileNotFoundException
} catch (IOException e) {
    // handle IOException
}
```

Trong ví dụ này, nếu `FileNotFoundException` xảy ra, nó được bắt bởi khối `catch` đầu tiên. Nếu một `IOException` khác xảy ra, nó được bắt bởi khối `catch` thứ hai. Điều này đảm bảo những exception cụ thể được xử lý phù hợp trước những exception tổng quát hơn.

### Khối `finally`

Khối `finally` được dùng để chạy mã luôn phải thực thi, bất kể có exception được ném ra hay không:

```java
try {
    // code that might throw an exception
} catch (ExceptionType e) {
    // handle the exception
} finally {
    // code that always runs
}
```

Khối `finally` thường dùng cho những tác vụ dọn dẹp, như đóng file hay đóng kết nối cơ sở dữ liệu.

Nếu câu lệnh `return` được thực thi bên trong khối `try`, khối `finally` vẫn chạy trước khi method trả về:

```java
public static int returnTest() {
    try {
        return 1;
    } catch (Exception e) {
        return 2;
    } finally {
        System.out.println("Finally block");
    }
}
```

Trong ví dụ này, dù ta trả về từ bên trong khối `try`, khối `finally` vẫn chạy và in `"Finally block"` trước khi method trả về.

Điều tương tự đúng nếu câu lệnh `return` nằm trong khối `catch`: khối `finally` vẫn chạy trước khi method trả về.

Tuy nhiên, `finally` sẽ **không** chạy nếu bạn gọi `System.exit()` trong khối `try` hay `catch`. `System.exit()` khiến Java Virtual Machine thoát, và khối `finally` sẽ không được chạy trước khi chương trình kết thúc:

```java
try {
    System.out.println("Try block");
    System.exit(0);
} catch (Exception e) {
    System.out.println("Catch block");
} finally {
    System.out.println("Finally block");
}
```

Trong ví dụ này, ta gọi `System.exit(0)` trong khối `try`, nên nó chỉ in `"Try block"` trước khi chương trình kết thúc.

Bạn dùng được khối `try` cùng khối `finally` mà không có khối `catch` nào.

```java
try {
    // code that might throw an exception
} finally {
    // code that always runs
}
```

Cách này hữu ích khi bạn muốn đảm bảo một số mã luôn chạy, ngay cả khi exception được ném ra, nhưng thực sự không muốn xử lý exception trong method này.

Cuối cùng, bản thân khối `finally` cũng có thể ném exception. Nếu điều đó xảy ra, và khối `try` cũng có exception, thì exception từ khối `finally` mới là exception thực sự được ném ra.

```java
try {
    throw new Exception("Exception in try");
} finally {
    throw new Exception("Exception in finally");
}
```

Trong ví dụ này, exception ném ra ở khối `finally` mới là exception thực sự được method ném. Exception từ khối `try` bị lấn át.

## Tự động quản lý tài nguyên với khối `try-with-resources`

Được giới thiệu ở Java 7, câu lệnh `try-with-resources` là một câu lệnh `try` khai báo một hoặc nhiều tài nguyên. **Tài nguyên** là object phải được đóng lại sau khi chương trình dùng xong. Câu lệnh `try-with-resources` đảm bảo mỗi tài nguyên được đóng ở cuối câu lệnh.

Cú pháp cơ bản của câu lệnh `try-with-resources` là:

```java
try (Resource declaration) {
    // use the resource
} catch (ExceptionType e1) {
    // catch block
}
```

Để một tài nguyên dùng được trong câu lệnh `try-with-resources`, nó phải implement interface `java.lang.AutoCloseable`. Interface này có một method duy nhất, `close()`, được gọi tự động ở cuối khối `try`:
```java
public interface AutoCloseable {
    void close() throws Exception;
}
```

Cách khác, tài nguyên implement được interface `java.io.Closeable`:
```java
public interface Closeable  extends AutoCloseable  {
    void close() throws IOException;
}
```

Cả hai đều khai báo method `close()`, và khác biệt thực tế duy nhất giữa chúng là method `close` của `Closeable` chỉ ném exception kiểu `IOException`, còn method `close` của `AutoCloseable` ném exception kiểu `Exception` (nói cách khác, nó ném được mọi loại exception).

Tuy nhiên, nhiều tài nguyên chuẩn của Java như `Scanner`, `FileReader` và `DatabaseConnection` đã implement sẵn `AutoCloseable`.

Tài nguyên khai báo được bên trong cặp ngoặc đơn của câu lệnh `try`, phân tách bởi dấu chấm phẩy nếu có nhiều tài nguyên.

```java
try (Scanner scanner = new Scanner(new File("example.txt"));
     PrintWriter writer = new PrintWriter(new File("output.txt"))) {
    // use the resources
}
```

Tài nguyên được khai báo như vậy để chúng được đóng mà không cần bạn tự làm trong khối `finally`. Thêm nữa, tài nguyên khai báo trong câu lệnh `try-with-resources` chỉ nằm trong phạm vi bên trong khối `try`. Chúng là effectively final, nghĩa là bạn không gán được giá trị mới cho chúng sau khi đã khởi tạo.

Vậy nên nếu tài nguyên được khai báo bên ngoài câu lệnh `try-with-resources`, chúng phải là final:
```java
final Scanner scanner = new Scanner(new File("example.txt"));
final PrintWriter writer = new PrintWriter(new File("output.txt"));

try (scanner; writer) {
    // use the resources
}

```

Hoặc effectively final:
```java
Scanner scanner = new Scanner(new File("example.txt"));
PrintWriter writer = new PrintWriter(new File("output.txt"));

// No reassignment after initialization makes them effectively final
try (scanner; writer) {
    // use the resources
}

```

Nếu khai báo nhiều tài nguyên, chúng phải được phân tách bởi dấu chấm phẩy và được đóng theo **thứ tự ngược** với thứ tự khai báo. Điều này quan trọng nếu các tài nguyên phụ thuộc lẫn nhau.

```java
try (Scanner scanner = new Scanner(new File("example.txt"));
     DatabaseConnection connection = DriverManager.getConnection(DB_URL)) {
    // use the resources
}
```

Trong ví dụ này, `connection` sẽ được đóng trước `scanner`.

Như đã nói, tài nguyên khai báo trong câu lệnh `try-with-resources` là effectively final. Dù bạn không phải khai báo tường minh chúng là `final`, bạn vẫn không gán được giá trị mới cho chúng sau khi đã khởi tạo:

```java
try (Scanner scanner = new Scanner(new File("example.txt"))) {
    scanner = new Scanner(new File("other.txt"));  // This will not compile
}
```

Tuy nhiên, một điều cần lưu ý với `try-with-resources` là khả năng xảy ra **suppressed exception** (exception bị lấn át).

Suppressed exception chỉ xảy ra khi cả khối `try` lẫn method `close()` đều ném exception.

Nếu một exception được ném từ khối `try` và một exception khác được ném từ lời gọi `close()` tự động, exception từ `close()` bị lấn át. Nó được thêm vào như một suppressed exception của exception ném từ khối `try`.

```java
try (Scanner scanner = new Scanner(new File("example.txt"))) {
    throw new IllegalStateException("Thrown from try");
}
```

Nếu lời gọi `scanner.close()` cũng ném exception, exception đó sẽ được thêm vào như suppressed exception của `IllegalStateException`.

Bạn lấy được những suppressed exception này bằng cách gọi method `Throwable[] java.lang.Throwable.getSuppressed()` trên exception do khối `try` ném ra:
```java
try (Scanner scanner = new Scanner(new File("example.txt"))) {
    throw new IllegalStateException("Thrown from try");
} catch (Exception e) {
    System.err.println(e.getMessage());
    Stream.of(e.getSuppressed())
        .forEach(t -> System.err.println(t.getMessage()));
}
```

Đây là kết quả (giả sử method `close()` ném exception):
```
Thrown from try
Close Exception
```

## Các điểm chính

- Exception là một tình huống bất thường làm gián đoạn luồng bình thường của chương trình. Khi exception xảy ra, ta nói nó được *ném ra*.

- Mục đích của exception là xử lý lỗi một cách mềm mại và ngăn chương trình sập hay hành xử bất thường.

- Mọi class exception trong Java đều là kiểu con của class `java.lang.Exception`. Hai nhánh chính dưới `Exception` là checked exception và unchecked exception (còn gọi là runtime exception).

- Checked exception là những tình huống ngoại lệ mà một ứng dụng được viết tốt nên lường trước và xử lý, còn unchecked exception thường không phục hồi được.

- Exception được ném tự động bởi runtime của Java, hoặc tường minh trong mã bằng câu lệnh `throw`.

- Exception tự định nghĩa được tạo bằng cách kế thừa class `Exception` (cho checked exception) hoặc class `RuntimeException` (cho unchecked exception).

- Khi một method ném exception, nó phải khai báo điều đó trong signature bằng keyword `throws`. Chỉ checked exception mới cần khai báo.

- Stack trace cung cấp thông tin về exception và trạng thái chương trình lúc exception xảy ra. Nó dùng được để xác định chính xác vị trí trong mã nơi vấn đề xảy ra.

- Class exception được nhận diện qua tên, vị trí trong cây phân cấp exception, thông điệp exception, và qua việc tra tài liệu Java API.

- Exception được xử lý bằng khối `try-catch`. Khối `finally` dùng để chạy mã phải thực thi bất kể có exception được ném hay không.

- Khối `multi-catch` cho phép ta bắt hai hoặc nhiều exception không liên quan nhau bằng một khối `catch` duy nhất.

- Khối `finally` luôn được chạy, ngay cả khi exception bị bắt hoặc khi khối `try` hay `catch` chứa câu lệnh `return`. Tuy nhiên, khối `finally` sẽ không chạy nếu JVM thoát trong khối `try` hay `catch`, chẳng hạn khi gọi `System.exit()`.

- Câu lệnh `try-with-resources`, giới thiệu ở Java 7, đảm bảo tài nguyên được đóng đúng cách sau khi dùng. Tài nguyên dùng trong câu lệnh `try-with-resources` phải implement interface `AutoCloseable` hoặc `Closeable`.

## Câu hỏi luyện tập

**1. Phát biểu nào sau đây mô tả đúng một checked exception trong Java?**

**A.** Checked exception là loại exception kế thừa từ class `java.lang.RuntimeException`.  
**B.** Checked exception phải được bắt hoặc được khai báo trong signature của method bằng keyword `throws`.  
**C.** Checked exception là lỗi thường do môi trường chạy ứng dụng gây ra và ứng dụng không xử lý được.  
**D.** Checked exception được Java Virtual Machine ném ra khi xảy ra lỗi nghiêm trọng, chẳng hạn lỗi hết bộ nhớ.


**2. Đoạn mã nào sau đây định nghĩa và ném đúng một checked exception tự định nghĩa?**

```java
public class CustomException extends Exception {
    public CustomException(String message) {
        super(message);
    }
}

public class TestCustomException {
    public static void main(String[] args) {
        try {
            methodThatThrowsException();
        } catch (CustomException e) {
            System.out.println(e.getMessage());
        }
    }

    public static void methodThatThrowsException() throws CustomException {
        throw new CustomException("This is a custom checked exception");
    }
}
```

**A.** Đoạn mã này định nghĩa một checked exception tự định nghĩa và ném, xử lý nó đúng cách.  
**B.** Đoạn mã này định nghĩa một unchecked exception tự định nghĩa.  
**C.** Đoạn mã này không biên dịch được vì exception tự định nghĩa không được khai báo đúng trong signature của method.  
**D.** Đoạn mã này biên dịch được nhưng sẽ không ném exception tự định nghĩa lúc chạy.


**3. Cho class sau, kết quả là gì?**

```java
public class Main {
    protected static int myMethod() {
        try {
            throw new RuntimeException();
        } catch(RuntimeException e) {
             return 1;
        } finally {
             return 2;
        }
    }
    public static void main(String[] args) {
        System.out.println(myMethod());
    }
}
```

**A.** `1`  
**B.** `2`  
**C.** Biên dịch thất bại  
**D.** Một exception xảy ra lúc chạy


**4. Cho class sau, phát biểu nào đúng?**

```java
public class Main {
    public static void main(String[] args) {
        try {
            // Do nothing
        } finally {
            // Do nothing
        }
    }
}
```

**A.** Đoạn mã không biên dịch được.  
**B.** Đoạn mã sẽ biên dịch được nếu ta thêm khối `catch`.  
**C.** Đoạn mã sẽ biên dịch được nếu ta bỏ khối `finally`.  
**D.** Đoạn mã biên dịch được như hiện tại.

**5. Những phát biểu nào sau đây đúng? (Chọn tất cả đáp án đúng)**

**A.** Trong `try-with-resources`, khối `catch` là bắt buộc.  
**B.** Keyword `throws` được dùng để ném một exception.  
**C.** Trong khối `try-with-resources`, nếu bạn khai báo nhiều hơn một tài nguyên, chúng phải được phân tách bởi dấu chấm phẩy.  
**D.** Nếu một khối `catch` được định nghĩa cho exception mà mã trong khối `try` không thể ném ra, một lỗi biên dịch sẽ được sinh ra.

**6. Cho class sau, kết quả là gì?**

```java
class Connection implements java.io.Closeable {
    public void close() throws IOException {
        throw new IOException("Close Exception");
    }
}

public class Main {
    public static void main(String[] args) {
        try (Connection c = new Connection()) {
            throw new RuntimeException("RuntimeException");
        } catch (IOException e) {
            System.err.println(e.getMessage());
        }
    }
}
```

**A.** `Close Exception`  
**B.** `RuntimeException`  
**C.** `RuntimeException` rồi tới `CloseException`  
**D.** Biên dịch thất bại  
**E.** Stack trace của một exception không được bắt sẽ được in ra


**7. Những exception nào sau đây là lớp con trực tiếp của `RuntimeException`?**

**A.** `java.io.FileNotFoundException`  
**B.** `java.lang.ArithmeticException`  
**C.** `java.lang.ClassCastException`  
**D.** `java.lang.InterruptedException`


**8. Cho đoạn mã sau, kết quả là gì?**

```java
class MyResource implements AutoCloseable {
    public void close() {
        throw new RuntimeException("Close Exception");
    }
}

public class Main {
    public static void main(String[] args) {
        try (MyResource resource = new MyResource()) {
            throw new RuntimeException("Try Block Exception");
        } catch (RuntimeException e) {
            Throwable[] suppressed = e.getSuppressed();
            if (suppressed.length > 0) {
                for (Throwable t : suppressed) {
                    System.out.println("Suppressed: " + t.getMessage());
                }
            } else {
                System.out.println(e.getMessage());
            }
        }
    }
}
```

**A.** Chỉ `"Try Block Exception"` được in ra.  
**B.** Chỉ `"Close Exception"` được in ra.  
**C.** Cả `"Try Block Exception"` và `"Close Exception"` đều được in ra.  
**D.** `"Suppressed: Close Exception"` được in ra.
