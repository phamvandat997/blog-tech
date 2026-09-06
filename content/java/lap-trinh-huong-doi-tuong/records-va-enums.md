---
layout: chapter

title: "Chương 3: Làm việc với Record và Enum"
subtitle: "Working with Records and Enums"
exam_objectives:
  - "Tạo class và record; định nghĩa và sử dụng field/method ở mức instance và static, constructor, cùng instance initializer và static initializer."
  - "Tạo và sử dụng kiểu enum có field, method và constructor."

previous_link: "/ch02.html"
previous_title: "Utilizing Java Object-Oriented Approach - Part 2"
next_link: "/ch04.html"
next_title: "Working with Data"
answers_link: "/ch03a.html"

description: "Record như vật mang dữ liệu bất biến, compact constructor, tuỳ biến record, cùng enum với field, method, constructor và các method đặc biệt trong Java 21."
order: 3
phase: "Chương 3"
tags: [Java, OCP, Record, Enum, Immutable, Constructor]
---

## Nội dung chương

- [Record](#heading-record)
    - [Giới thiệu về record](#heading-giới-thiệu-về-record)
    - [Tính bất biến của record](#heading-tính-bất-biến-của-record)
    - [Khởi tạo record](#heading-khởi-tạo-record)
    - [Tuỳ biến record](#heading-tuỳ-biến-record)
- [Enum](#heading-enum)
    - [Giới thiệu về enum](#heading-giới-thiệu-về-enum)
    - [Khai báo enum](#heading-khai-báo-enum)
    - [Các method đặc biệt của enum](#heading-các-method-đặc-biệt-của-enum)
    - [Tuỳ biến enum](#heading-tuỳ-biến-enum)
- [Các điểm chính](#heading-các-điểm-chính)
- [Câu hỏi luyện tập](#heading-câu-hỏi-luyện-tập)

---
## Record

### Giới thiệu về record

Record cung cấp cách khai báo class súc tích hơn cho những class chủ yếu đóng vai trò vật mang dữ liệu đơn giản. Bạn có thể hình dung record như một dạng class đặc biệt được thiết kế riêng để lưu dữ liệu bất biến, kiểu như một chiếc két chắc chắn, chống can thiệp dành cho thông tin của bạn.

Nhưng chính xác record là gì? Về bản chất, record là một class `final` tự động sinh ra constructor, các field `private final` cho những tham số bạn khai báo, cùng phần cài đặt các method `equals()`, `hashCode()` và `toString()` dựa trên những field đó. Nghĩa là record cho bạn cách viết tắt để tạo một class đóng gói dữ liệu mà không phải viết nhiều mã rườm rà lặp đi lặp lại.

Đây là sơ đồ thể hiện cấu trúc và các thành phần cơ bản của một khai báo record:
```
┌─────────────────────────────────────────────────┐
│ public record Person(String name, int age) {    │
│                                                 │
│  ┌─────────────────────────────────────────┐    │
│  │ Implicit Components                     │    │
│  │ ● Private final fields                  │    │
│  │ ● Public constructor                    │    │
│  │ ● Public accessor methods               │    │
│  │ ● equals(), hashCode(), toString()      │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│  ┌─────────────────────────────────────────┐    │
│  │ Customizable Components                 │    │
│  │ ● Compact constructor                   │    │
│  │ ● Additional methods                    │    │
│  │ ● Static fields and methods             │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
└─────────────────────────────────────────────────┘
```

Và đây là ví dụ định nghĩa một record:

```java
record Person(String name, int age) {}
```

Chỉ với một dòng này, ta đã định nghĩa record `Person` có hai field: `name` và `age`. Record tự động sinh constructor nhận những field đó làm tham số, nên ta tạo được instance của record như sau:

```java
Person john = new Person("John Doe", 30);
```

Một điều quan trọng cần hiểu về record là chúng không chỉ là cách viết tắt cho class. Dù có cú pháp súc tích hơn, record có vài đặc điểm riêng khiến chúng khác biệt với class thường. Nổi bật nhất là record ngầm định là `final`, nghĩa là chúng không thể bị class khác extends. Điều này củng cố mục đích của chúng: vật mang dữ liệu đơn giản, bất biến.

Thêm nữa, record ngầm định là `static` khi được khai báo như kiểu lồng nhau. Nghĩa là chúng không giữ tham chiếu tới instance của lớp bao ngoài:
```java
public class OuterClass {

    // Nested record
    public record NestedRecord(int value) {
    }

    // ...
}
```

Trong ví dụ này, `NestedRecord` là record lồng bên trong `OuterClass`. Nó ngầm định là static, nghĩa là khởi tạo được mà không cần instance của `OuterClass`:
```java
OuterClass.NestedRecord nestedRecord = new OuterClass.NestedRecord(8);
```

Vậy khi nào nên dùng record thay vì class? Record lý tưởng cho những tình huống bạn cần biểu diễn một cấu trúc dữ liệu đơn giản, bất biến — như một điểm với toạ độ x, y, hay một người với tên và tuổi. Trong những trường hợp đó, dùng record tiết kiệm rất nhiều thời gian và giảm độ dài dòng của mã:

```java
record Point(int x, int y) {}
```

Ngược lại, nếu bạn cần cấu trúc dữ liệu phức tạp hơn đòi hỏi hành vi bổ sung hay trạng thái khả biến, class thường vẫn là lựa chọn đúng. Record không nhằm thay thế hoàn toàn class, mà bổ sung cho chúng bằng một giải pháp gọn gàng cho một tình huống cụ thể.

### Tính bất biến của record

Một trong những đặc trưng của record là tính bất biến. Khi ta nói record là bất biến, nghĩa là một khi instance của record được tạo, trạng thái của nó không thể thay đổi. Điều này được đảm bảo bởi việc mọi field trong record đều ngầm định là `final`, nghĩa là chúng phải được khởi tạo khi record được tạo và không sửa được sau đó.

```java
record Person(String name, int age) {
    void birthday() {
        age++; // Compile-time error: Cannot assign a value to final variable age
    }
}
```

Vì record được thiết kế để bất biến, không có cách nào khiến từng field trở nên khả biến. Nếu bạn thấy mình cần sửa giá trị field sau khi khởi tạo, đó là dấu hiệu rõ ràng rằng record có thể không phải lựa chọn phù hợp, và class thường sẽ hợp lý hơn.

Về tính bất biến, có vài lý do khiến record thường được ưa chuộng hơn object khả biến:

1. Record vốn dĩ thread-safe vì trạng thái của chúng không sửa được sau khi tạo, loại bỏ rủi ro về truy cập đồng thời.
2. Record dễ suy luận hơn và ít lỗi hơn vì trạng thái của chúng giữ nguyên suốt vòng đời.
3. Record chia sẻ và tái sử dụng an toàn được mà không cần sao chép phòng vệ.

Tuy nhiên cần lưu ý rằng tính bất biến của record chỉ áp dụng cho bản thân record và các field của nó. Nếu record chứa tham chiếu tới một object khả biến như list hay mảng, object đó vẫn sửa được dù bản thân record là bất biến:

```java
record Numbers(List<Integer> values) {}

Numbers numbers = new Numbers(new ArrayList<>(List.of(1, 2, 3)));
numbers.values().add(4); // The list can still be modified
```

Trong ví dụ này, dù record `Numbers` là bất biến, `List` lưu trong field `values` vẫn sửa được vì nó là object khả biến.

Vậy nên khi thiết kế record, cần cân nhắc tính bất biến của những object mà chúng chứa. Nếu bạn muốn đảm bảo bất biến hoàn toàn, hãy dùng object bất biến hoặc kỹ thuật sao chép phòng vệ khi lưu object khả biến bên trong record.

### Khởi tạo record

Trước đó bạn đã thấy record tự động sinh constructor dựa trên các thành phần (component) của record. Constructor mặc định này đủ dùng cho nhiều tình huống, nhưng đôi khi bạn cần kiểm soát nhiều hơn với quá trình khởi tạo. May thay, record cung cấp vài cách để tuỳ biến constructor và thêm logic khởi tạo của riêng bạn.

Constructor dài, còn gọi là **canonical constructor**, là constructor mặc định do record sinh ra. Nó nhận tất cả các component của record làm tham số theo đúng thứ tự khai báo.

```java
record Person(String name, int age) {}

Person john = new Person("John Doe", 30);
```

Trong ví dụ này, record `Person` có constructor mặc định nhận một `String` cho `name` và một `int` cho `age`.

Nếu bạn cần kiểm tra hay tiền xử lý bất kỳ field nào trước khi chúng được gán, bạn dùng **compact constructor**. Constructor này không nêu tham số tường minh. Thay vào đó, bạn viết constructor không có danh sách tham số, và trình biên dịch hiểu rằng nó dùng các tham số của record. Bên trong compact constructor, bạn thêm được logic kiểm tra hoặc biến đổi. Tuy nhiên, khác canonical constructor, bạn không gán giá trị cho field một cách trực tiếp — việc đó được xử lý tự động.

Đây là ví dụ compact constructor cho record `Person`:

```java
record Person(String name, int age) {
    public Person {
        if (age < 0) {
            throw new IllegalArgumentException("Age cannot be negative");
        }
    }
}
```

Thân constructor chứa phép kiểm tra để đảm bảo `age` không âm. Nếu truyền vào tuổi không hợp lệ, một `IllegalArgumentException` sẽ được ném ra.

Record cũng hỗ trợ nạp chồng constructor, nghĩa là bạn định nghĩa được nhiều constructor với danh sách tham số khác nhau. Điều này hữu ích khi bạn muốn cung cấp những cách khởi tạo thay thế cho record.

Tuy nhiên, mỗi constructor như vậy phải uỷ quyền (delegate) về canonical constructor — trực tiếp hoặc gián tiếp qua một constructor tuỳ biến khác — để đảm bảo mọi field đều được khởi tạo. Việc này thường làm bằng lời gọi `this()` với các tham số cần thiết.

Đây là ví dụ về constructor tuỳ biến/nạp chồng:

```java
record Person(String name, int age) {
    public Person(String name) {
        this(name, 0);
    }
}

Person john = new Person("John Doe", 30);
Person jane = new Person("Jane Smith");
```

Trong ví dụ này, ta thêm một constructor nạp chồng chỉ nhận tham số `name`. Bên trong constructor, ta gọi canonical constructor bằng `this()`, truyền vào `name` được cung cấp và giá trị `age` mặc định là `0`.

Cách tiếp cận này cho phép bạn:
- Định nghĩa constructor tuỳ biến để khởi tạo record theo nhiều cách khác nhau, mang lại sự linh hoạt khi tạo instance.
- Thêm logic khởi tạo và kiểm tra của riêng bạn bằng compact constructor hoặc constructor nạp chồng.

### Tuỳ biến record

Dù record dùng ngay được rất đơn giản, Java vẫn cung cấp vài cách để tuỳ biến chúng theo nhu cầu.

#### Instance method

Dù record chủ yếu được thiết kế để mang dữ liệu, điều đó không có nghĩa chúng không thể có hành vi. Cũng như class thường, bạn thêm được instance method vào record để đóng gói logic thao tác trên các component của record. Ví dụ:

```java
public record Point(int x, int y) {
    public double distance(Point other) {
        int dx = x - other.x;
        int dy = y - other.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
}
```

Ở đây, record `Point` có instance method `distance()` tính khoảng cách Euclid giữa chính nó và một `Point` khác. Method truy cập trực tiếp được các component `x` và `y` của record.

Bạn cũng override được những method kế thừa từ class `Object` như `equals()`, `hashCode()` và `toString()`. Mặc định record cung cấp cài đặt hợp lý cho những method này dựa trên các component, nhưng bạn tuỳ biến được nếu cần:

```java
public record Person(String name, int age) {
    @Override
    public String toString() {
        return name + " (" + age + " years old)";
    }
}
```

Trong ví dụ này, `toString()` được override để cho ra biểu diễn dễ đọc hơn của một record `Person`.

Tuy nhiên, khi override `equals()` và `hashCode()`, hãy cẩn thận giữ tính nhất quán với phần cài đặt được sinh tự động. Các component của record nên được đưa vào phép so sánh bằng nhau và phép tính mã băm, để đảm bảo hai record có cùng giá trị component được coi là bằng nhau và có cùng mã băm.

#### Kiểu lồng nhau

Record chứa được nested class, interface, annotation, enum và thậm chí cả record khác. Điều này cho phép bạn gom những kiểu liên quan lại bên trong record, tăng tính đóng gói và dễ đọc. Ví dụ:

```java
public record Employee(String name, Department department) {
    public class Department { 
        // Implementation of the class
    }
    
    public static record Manager(String name) {
        // Additional fields and methods for managers
    }
}
```

Trong ví dụ này, record `Employee` có nested class `Department` biểu diễn chẳng hạn các phòng ban mà nhân viên có thể thuộc về. Nó cũng có một nested static record `Manager`, có thể có thêm field và method riêng cho quản lý.

Các kiểu lồng nhau khai báo bên trong record ngầm định là static, nên truy cập được bằng tên record theo sau là tên kiểu, như `Employee.Department` hay `Employee.Manager`.

#### Generic và tham số kiểu

Record có thể là generic và nhận tham số kiểu, hệt như class và interface. Điều này cho phép bạn tạo record làm việc được với nhiều kiểu dữ liệu khác nhau mà vẫn giữ an toàn kiểu. Đây là ví dụ về record `Pair` generic:

```java
public record Pair<T, U>(T first, U second) { }
```

Sau đó bạn tạo instance của record `Pair` với các kiểu cụ thể:

```java
Pair<String, Integer> nameAge = new Pair<>("Alice", 30);
```

Record generic hoạt động trơn tru với hệ thống kiểu của Java, kể cả wildcard, tham số kiểu có ràng buộc và suy luận kiểu. Chúng ta sẽ bàn kỹ hơn về generic ở chương khác.

#### Local record

Ngoài việc khai báo ở mức class, record còn khai báo được cục bộ bên trong method. Điều này tiện khi bạn cần một cấu trúc dữ liệu tạm thời với phạm vi hạn chế. Ví dụ:

```java
public void processCoordinates() {
    record Coordinate(int x, int y) { }
    
    Coordinate point1 = new Coordinate(10, 20);
    Coordinate point2 = new Coordinate(30, 40);
    
    // Process the coordinates...
}
```

Record `Coordinate` được khai báo bên trong method `processCoordinates()` và chỉ truy cập được trong method đó.

#### Cài đặt interface

Dù record chủ yếu được thiết kế để đóng gói dữ liệu, chúng vẫn implement được interface. Điều này cho phép record thoả mãn các hợp đồng và được dùng trong những ngữ cảnh đòi hỏi một interface cụ thể. Ví dụ:

```java
public interface Drawable {
    void draw();
}

public record ColoredPoint(int x, int y, String color) implements Drawable {
    @Override
    public void draw() {
        System.out.println("Drawing a " + color + " point at (" + x + ", " + y + ")");
    }
}
```

Ở đây, record `ColoredPoint` implement interface `Drawable` và cung cấp phần cài đặt cho method `draw()`.

#### Các hạn chế

Trước hết, record không extends được class và cũng không bị class khác extends. Hạn chế này củng cố ý tưởng rằng record là vật mang dữ liệu độc lập, không thuộc cây phân cấp kế thừa. Tuy nhiên, record vẫn implement được interface như đã thấy.

Một hạn chế quan trọng khác là record không cho phép thêm instance field ngoài những field đã định nghĩa trong khai báo record. Các component của record là những instance field duy nhất được phép. Ví dụ:

```java
public record Point(int x, int y) {
    private int z; // Compilation error: field declaration must be static
}
```

Thêm instance field như `z` trong ví dụ này sẽ gây lỗi biên dịch. Mục đích của hạn chế này là duy trì tính bất biến của record và giữ trạng thái của nó chỉ gắn với các component.

Nhu cầu có thêm instance field cho thấy class thường có lẽ phù hợp hơn record. Record được thiết kế làm vật mang dữ liệu nhẹ, không phải object phức tạp với trạng thái khả biến.

Tuy nhiên, cần lưu ý rằng thông báo lỗi nói rõ field phải là static. Vậy nên nếu ta sửa ví dụ để `z` thành field `static`:

```java
public record Point(int x, int y) {
    private static int z; // Compiles successfully
}
```

Phiên bản này của record `Point` biên dịch được bình thường. Tuy nhiên nhớ rằng field static được chia sẻ giữa mọi instance của record, nên chúng không đóng góp vào trạng thái riêng của từng record.

Một điều nữa cần nhớ là record không hỗ trợ instance initializer. Nếu bạn thử thêm khối instance initializer vào record như thế này:

```java
public record Point(int x, int y) {
    // Instance initializer block
    { 
        System.out.println("Initializing Point...");
    } // Compiler error: instance initializers not allowed in records
}
```

Trình biên dịch Java sẽ báo lỗi. Lý do là record được thiết kế để đơn giản và bất biến, còn instance initializer có thể đưa vào logic khởi tạo phức tạp vi phạm những nguyên tắc đó.

Nếu bạn cần thực hiện thêm logic khởi tạo, hãy dùng compact constructor thay thế:

```java
public record Point(int x, int y) {
    public Point {
        System.out.println("Initializing Point...");
    }
}
```

Compact constructor cho phép bạn chạy mã tại thời điểm record được khởi tạo mà vẫn đảm bảo các component được khởi tạo đúng cách.

Tuy nhiên, static initializer thì được phép. Đoạn sau biên dịch không lỗi:
```java
public record Point(int x, int y) {
    // Static initializer block
    static { 
        System.out.println("Initializing Point...");
    }
}
```

Tại sao?

Static initializer được phép trong record vì cùng lý do chúng được phép trong các class khác: để khởi tạo static field hoặc chạy khối khởi tạo static khi class được nạp.

Vậy nên dù bạn thêm được instance method, static field và khối static initializer, bạn không thêm được instance field hay khối instance initializer, vì những thứ này có thể phá vỡ tính bất biến.

Nhớ rằng record không phải vật thay thế cho class thường, mà là tính năng bổ trợ cho những tình huống cụ thể cần vật mang dữ liệu bất biến.

## Enum

### Giới thiệu về enum

Trong Java, một enumeration (hay enum) là một dạng class đặc biệt dùng để định nghĩa tập các hằng số định sẵn. Đó là cách đặt tên cho các giá trị số, giúp mã dễ đọc và dễ bảo trì hơn.

Hãy hình dung enum như danh sách khách VIP cho một sự kiện độc quyền. Danh sách (enum) xác định ai được vào (các hằng số định sẵn), nhưng mỗi người trong danh sách cũng có thuộc tính riêng (field) và những hành động họ thực hiện được (method). Quá trình thêm ai đó vào danh sách kèm thuộc tính cụ thể tương tự việc dùng constructor trong một enumeration.

Giả sử bạn đang xây ứng dụng quản lý cửa hàng thú cưng. Bạn có thể có một biến biểu diễn loại động vật:
```java
String animalType;
//...
if(animalType.equals("DOG")) { 
    // process dog
} else if(animalType.equals("CAT")) {
    // process cat
} else if(animalType.equals("BIRD")) {
    // process bird
}
```

Nhưng cách này có vài vấn đề. Thứ nhất, nó dễ sinh lỗi. Nếu ở đâu đó bạn gõ nhầm "DOG" thành "DIG" thì sao? Trình biên dịch không bắt được lỗi đó. Thứ hai, nó không dễ đọc lắm. Người đọc mã này có thể không hiểu ngay "BIRD" nghĩa là gì trong ngữ cảnh ứng dụng của bạn.

Đây là lúc enum xuất hiện:
```java
enum AnimalType {
    DOG, CAT, BIRD
}
```

Giờ bạn dùng enum như sau:
```java
AnimalType animalType;
//...  
if(animalType == AnimalType.DOG) {
    // process dog
} else if(animalType == AnimalType.CAT) {
    // process cat  
} else if(animalType == AnimalType.BIRD) {
    // process bird
}
```

Nếu bạn gõ nhầm `DOG`, trình biên dịch sẽ bắt được. Và mã cũng dễ đọc hơn nhiều.

Vậy về bản chất, enum cung cấp cách định nghĩa một tập hằng số có tên, giúp mã dễ đọc hơn, dễ bảo trì hơn và ít sinh lỗi hơn.

Đây là sơ đồ thể hiện cấu trúc và các thành phần cơ bản của một khai báo enum:
```
┌─────────────────────────────────────────────────┐
│ public enum DayOfWeek {                         │
│     MONDAY, TUESDAY, WEDNESDAY, THURSDAY,       │
│     FRIDAY, SATURDAY, SUNDAY;                   │
│                                                 │
│  ┌─────────────────────────────────────────┐    │
│  │ Implicit Components                     │    │
│  │ ● ordinal() : int                       │    │
│  │ ● name() : String                       │    │
│  │ ● values() : DayOfWeek[]                │    │
│  │ ● valueOf(String) : DayOfWeek           │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│  ┌─────────────────────────────────────────┐    │
│  │ Customizable Components                 │    │
│  │ ● Fields                                │    │
│  │ ● Constructors                          │    │
│  │ ● Methods                               │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Khai báo enum

Khai báo enum tương tự khai báo class, nhưng bạn dùng keyword `enum` thay cho `class`:
```java
public enum AnimalType {
    DOG, CAT, BIRD
}
```

Mỗi hằng số (`DOG`, `CAT`, `BIRD`) ngầm định là `public`, `static` và `final`. Quy ước là viết hoa toàn bộ tên của chúng.

Cần lưu ý rằng enum chỉ có quyền truy cập `public` hoặc default (package-private) khi khai báo bên ngoài class; chúng không thể khai báo với quyền `protected` hay `private`. Nếu enum được định nghĩa bên trong một class, nó có thể mang bất kỳ mức truy cập nào mà một inner class thông thường có được.

Ví dụ:
```java
public class PetStore {
    // This is okay
    private enum EmployeeLevel {
        TRAINEE, MANAGER, DIRECTOR
    }
    
    // This is okay
    protected enum AnimalBreed {
        LABRADOR, SIAMESE, PARROT
    }
}

// This is okay  
enum AnimalType {
    DOG, CAT, BIRD
}

// This will not compile
private enum FoodType {
    KIBBLE, CANNED, SEEDS
}
```
Như bạn thấy, enum khai báo bên trong một class (`EmployeeLevel`) mang được bất kỳ access modifier nào mà inner class thông thường mang được. Còn khi enum được khai báo bên ngoài class, nó phải là public hoặc có quyền truy cập mặc định, không thể là private (`FoodType`).

Ngoài ra, nếu bạn khai báo enum trong file riêng, tên enum phải khớp với tên file.

Nhưng enum không chỉ là một danh sách hằng số. Chúng có được constructor, method và field, hệt như một class thông thường. Tuy nhiên, constructor của enum **luôn** là `private`, dù tường minh hay ngầm định. Mặc định, nếu không chỉ định access modifier, constructor ngầm định là private. Constructor của enum không thể là `public` hay `protected`. Lý do là bạn không tạo instance của enum bằng `new`; thay vào đó, các instance đã được định sẵn.
```java
public enum AnimalType {
    DOG("Dog"), CAT("Cat"), BIRD("Bird");

    private String displayName;

    AnimalType(String displayName) {
        this.displayName = displayName;  
    }

    public String getDisplayName() {
        return displayName;
    }
}
```

Trong ví dụ này, mỗi hằng số được tạo kèm một tên hiển thị, được truyền vào constructor. Constructor là private — mặc định của enum. Mỗi hằng số về bản chất là một instance của class enum.

Điều này trả lời vài câu hỏi phổ biến về enum:
- Enum có được method, constructor và field bên cạnh các hằng số định sẵn.
- Constructor trong enum luôn là private (hoặc package-private), ngay cả khi không khai báo tường minh. Đó là lý do bạn không khởi tạo enum bằng `new` được. Nếu bạn đánh dấu constructor là `public` hay `protected`, trình biên dịch sẽ báo lỗi.
- Enum không chỉ là danh sách hằng số nguyên. Mỗi hằng số enum thực chất là một instance của class enum, có trạng thái riêng (field) và hành vi riêng (method).

Một điều quan trọng khác là mọi enum đều ngầm định extends `java.lang.Enum`. Đây là một class đặc biệt trong Java cung cấp sẵn một số method cho enum.

Vì việc extends ngầm định này, enum không extends được class nào khác. Tuy nhiên, nó vẫn implement được interface.

### Các method đặc biệt của enum

Class enum ngầm khai báo một số method `public static` khá hữu ích mà thoạt nhìn không thấy rõ, như method `values()` và `valueOf()`.

Ví dụ, giả sử ta có enum này:
```java
enum Season {
    WINTER, SPRING, SUMMER, FALL;
}
```

Method `public static T[] values()` trả về một mảng chứa tất cả hằng số của class enum, theo đúng thứ tự khai báo. Method này thường được dùng để duyệt qua toàn bộ hằng số. Ví dụ:

```java
for(Season s : Season.values()) {
    System.out.println(s);
}
```

Kết quả:
```
WINTER
SPRING
SUMMER
FALL
```

Bạn có thể thắc mắc method này đến từ đâu, vì nó không được nhắc tới trong [javadoc của class enum](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Enum.html). Câu trả lời là trình biên dịch Java tự động thêm nó vào class enum lúc biên dịch. Nên theo một nghĩa nào đó, nó là cú pháp đường (syntactic sugar) do ngôn ngữ cung cấp.

Method `public static T valueOf(String)` trả về hằng số enum có tên đã nêu. Tên phải khớp chính xác với identifier dùng để khai báo hằng số trong class enum. Ví dụ:

```java
Season s = Season.valueOf("SUMMER");
```

Ngoài những method đó, mỗi hằng số enum còn có method `name()` để lấy tên hằng số như đã khai báo trong enum, và method `ordinal()` để lấy vị trí của nó theo thứ tự khai báo (bắt đầu từ `0`). Ví dụ:

```java
Season.WINTER.name();    // "WINTER"
Season.SPRING.ordinal(); // 1
```

Method `compareTo(E o)` là một method quan trọng khác có ở mọi kiểu enum. Method này so sánh hằng số enum với một hằng số enum khác cùng kiểu dựa trên giá trị ordinal của chúng. Nó trả về số nguyên âm, không, hoặc số nguyên dương tương ứng với việc hằng số enum này nhỏ hơn, bằng, hay lớn hơn hằng số enum được nêu. Method này cho phép dùng hằng số enum trong các collection có sắp xếp hoặc trong bất kỳ thao tác nào dựa trên so sánh. Ví dụ:

```java
Season.WINTER.compareTo(Season.SUMMER); // Returns a negative number
Season.FALL.compareTo(Season.SPRING);   // Returns a positive number
Season.SPRING.compareTo(Season.SPRING); // Returns 0
```

Đáng lưu ý rằng thứ tự tự nhiên mà `compareTo()` cung cấp cho hằng số enum dựa trên thứ tự khai báo, và điều đó không phải lúc nào cũng là thứ tự có ý nghĩa nhất cho bài toán cụ thể của bạn. Trong những tình huống như vậy, bạn có thể cần cài đặt một `Comparator` tuỳ biến cho kiểu enum của mình.

Đây là bảng không chỉ tóm tắt tất cả những method này mà còn đi sâu hơn một chút về cách dùng và những điều cần lưu ý:

| Method      | Mô tả                                           | Kiểu trả về | Ghi chú                                         |
|-------------|-------------------------------------------------------|-------------|-------------------------------------------------|
| `values()`  | Trả về mảng chứa toàn bộ hằng số enum theo thứ tự khai báo. | `EnumType[]` | Hữu ích để duyệt qua mọi hằng số trong enum. |
| `valueOf(String name)` | Trả về hằng số enum có tên đã nêu.    | `EnumType`   | Ném `IllegalArgumentException` nếu tên nêu ra không khớp hằng số enum nào. |
| `name()`    | Trả về tên của hằng số enum này, đúng như đã khai báo trong enum. | `String`     | Giống với việc gọi `toString()`, nhưng `name()` là `final` và không override được. |
| `ordinal()` | Trả về ordinal của hằng số enum này (vị trí của nó trong khai báo enum, hằng số đầu tiên nhận ordinal bằng không). | `int`        | Dùng được để gắn chỉ số mảng hay list trực tiếp với hằng số enum. Nếu bạn có mảng mà mỗi vị trí ứng với một hằng số enum cụ thể, `ordinal()` giúp truy cập trực tiếp phần tử mảng theo thứ tự hằng số. |
| `compareTo(E o)` | So sánh enum này với object đã nêu theo thứ tự. | `int` | Trả về số nguyên âm, không, hoặc dương tuỳ theo object này nhỏ hơn, bằng, hay lớn hơn object được nêu. Thứ tự tự nhiên dựa trên giá trị ordinal của các hằng số enum. |

### Tuỳ biến enum

Như đã nói, bạn thêm được constructor của riêng mình vào class enum. Yêu cầu duy nhất là constructor phải là `private` hoặc package-private. Ngoài ra, bạn cũng thêm được field và method để tuỳ biến class enum.

Giả sử ta muốn gắn nhiệt độ trung bình tối thiểu và tối đa cho mỗi mùa:

```java
public enum Season {
    WINTER(-5, 10), 
    SPRING(11, 20), 
    SUMMER(21, 35), 
    FALL(5, 20);

    private int minTemp;
    private int maxTemp;
    
    Season(int minTemp, int maxTemp) {
        this.minTemp = minTemp;
        this.maxTemp = maxTemp;
    }
    
    public int getMinTemp() { return minTemp; }
    public int getMaxTemp() { return maxTemp; }
}
```

Ví dụ này thêm một constructor nhận vào các mức nhiệt độ. Nó là package-private, đúng như yêu cầu. Đồng thời nó khai báo các field để lưu giá trị và getter public cho chúng.

Với cách này, ta tra được nhiệt độ gắn với một mùa:

```java
Season.WINTER.getMaxTemp(); // 10
```

Ta thêm được bất kỳ field và method nào khác để enum trở nên thú vị hơn.

Điều duy nhất cần nhớ là phải khai báo các hằng số enum **trước tiên** trong class. Ta khai báo field và constructor ở giữa được, nhưng không được có hằng số nào bên dưới chúng, nếu không sẽ gặp lỗi biên dịch.

Ví dụ sau cố khai báo field ở giữa các hằng số enum. Điều này dẫn tới lỗi biên dịch:

```java
public enum Season {
    WINTER(-5, 10), 
    SPRING(11, 20),
    
    private int minTemp; // Compile error: enum constant expected here
    private int maxTemp;

    SUMMER(21, 35), 
    FALL(5, 20);
    
    Season(int minTemp, int maxTemp) {
        this.minTemp = minTemp;
        this.maxTemp = maxTemp;
    }
    
    public int getMinTemp() { return minTemp; }
    public int getMaxTemp() { return maxTemp; }
}
```

Vậy nên hãy cẩn thận: khai báo hằng số enum sau bất kỳ field hay constructor nào là một cái bẫy phổ biến khi định nghĩa enum có constructor và field tuỳ biến.

## Các điểm chính

- Record cung cấp cách khai báo class súc tích cho những class chủ yếu đóng vai trò vật mang dữ liệu đơn giản, bất biến.

- Record tự động sinh constructor, các field `private final` cho các tham số, cùng phần cài đặt `equals()`, `hashCode()` và `toString()` dựa trên những field đó.

- Record ngầm định là `final` và không thể bị class khác extends.

- Mọi field trong record ngầm định là `final`, đảm bảo tính bất biến. Trạng thái của record không thể thay đổi sau khi khởi tạo.

- Record cung cấp canonical constructor mặc định nhận tất cả component của record làm tham số.

- Compact constructor cho phép thêm logic kiểm tra hoặc tiền xử lý mà không cần nêu tham số tường minh.

- Record hỗ trợ nạp chồng constructor, nhưng mỗi constructor phải uỷ quyền về canonical constructor để đảm bảo field được khởi tạo.

- Instance method thêm được vào record để đóng gói hành vi thao tác trên các component của record.

- Record chứa được nested class, interface, annotation, enum và các record khác.

- Record có thể là generic và nhận tham số kiểu, cho phép làm việc với nhiều kiểu dữ liệu khác nhau mà vẫn giữ an toàn kiểu.

- Local record khai báo được bên trong method cho những cấu trúc dữ liệu tạm thời có phạm vi hạn chế.

- Record implement được interface để thoả mãn hợp đồng và dùng được ở nơi đòi hỏi một interface cụ thể.

- Record không extends được class và không bị extends, không có thêm instance field ngoài các component, và không hỗ trợ instance initializer.

- Static field và static initializer thì được phép trong record.

- Enum là một dạng class đặc biệt dùng để định nghĩa tập hằng số định sẵn, giúp mã dễ đọc và dễ bảo trì hơn.

- Mỗi hằng số enum ngầm định là `public`, `static` và `final`, và theo quy ước, tên của chúng viết hoa toàn bộ.

- Constructor của enum luôn là `private` (hoặc package-private), nên không tạo được instance enum bằng `new`.

- Mọi enum đều ngầm định extends `java.lang.Enum`, class này cung cấp sẵn các method như `valueOf()`.

- Method `values()` trả về mảng chứa toàn bộ hằng số enum theo thứ tự khai báo.

- Method `valueOf()` trả về hằng số enum có tên đã nêu.

- Mỗi hằng số enum còn có method `name()` để lấy tên đã khai báo và method `ordinal()` để lấy vị trí của nó.

- Enum tuỳ biến được bằng field, constructor và method để gắn thêm dữ liệu và hành vi cho từng hằng số.

- Khi định nghĩa enum có field và constructor tuỳ biến, mọi hằng số enum phải được khai báo trước bất kỳ field hay constructor nào.

## Câu hỏi luyện tập

**1. Xét định nghĩa record sau:**

```java
public record Employee(String name, int age) {}
```

Phát biểu nào sau đây đúng về record `Employee`?

**A)** Record `Employee` định nghĩa tường minh một constructor public để khởi tạo các field của nó.  
**B)** Field `name` và `age` gán lại được giá trị mới sau khi object `Employee` được tạo.  
**C)** Record `Employee` ngầm tạo ra một constructor public và các field `private final` cho `name` và `age`.  
**D)** Bắt buộc phải định nghĩa getter cho field `name` và `age` trong record `Employee`.


**2. Cho định nghĩa record dưới đây:**

```java
public record Account(String id, double balance) {}
```

Phát biểu nào mô tả chính xác tính bất biến của record?

**A)** Field `balance` sửa được bằng một method setter public bên trong record `Account`.  
**B)** Một khi object `Account` được tạo, `id` và `balance` của nó không thể thay đổi.  
**C)** Tính bất biến của record bị vượt qua được bằng cách định nghĩa method setter tuỳ biến cho field `id` và `balance`.  
**D)** Record cho phép sửa giá trị field nếu truy cập trực tiếp, không cần dùng method setter.


**3. Xét khai báo record sau:**

```java
public record Product(int id, String name, double price) {}
```

Bạn khởi tạo đúng một instance của record `Product` như thế nào?

**A)** `Product p = new Product();`  
**B)** `Product p = Product(101, "Coffee", 15.99);`  
**C)** `Product p = {101, "Coffee", 15.99};`  
**D)** `Product p = new Product(101, "Coffee", 15.99);`


**4. Xét một record cần implement interface `Comparable` để cho phép sắp xếp dựa trên một trong các field của nó. Cho định nghĩa record sau:**

```java
public record Item(int id, String name, double price) implements Comparable<Item> {
    public int compareTo(Item other) {
        return Double.compare(this.price, other.price);
    }
}
```

Phát biểu nào mô tả đúng cách tuỳ biến record bằng việc cài đặt interface?

**A)** Record không implement được interface vì chúng là `final` và bất biến theo thiết kế, điều này ngăn mọi hình thức tuỳ biến hành vi.  
**B)** Record này cài đặt đúng interface `Comparable`, cho phép sắp xếp các object `Item` dựa trên `price`.  
**C)** Việc cài đặt interface trong record bị giới hạn chỉ ở functional interface do bản chất bất biến của chúng.  
**D)** Method `compareTo` không override được trong record vì kiểu record không hỗ trợ override method.


**5. Xét các cách khai báo enum trong Java. Những khai báo nào sau đây hợp lệ? (Chọn tất cả đáp án đúng.)**

**A)** 
```java
public enum Day {
    MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY
}
```

**B)** 
```java
enum Month {
    private JANUARY, FEBRUARY, MARCH, APRIL, MAY, JUNE, JULY, AUGUST, SEPTEMBER, OCTOBER, NOVEMBER, DECEMBER;
}
```

**C)** 
```java
protected enum Season {
    WINTER, SPRING, SUMMER, FALL
}
```

**D)**  
```java
enum Status {
    ACTIVE, INACTIVE, DELETED;

    public void printStatus() {
        System.out.println("Current status: " + this);
    }
}
```

**6. Xét khai báo enum sau:**

```java
public enum Color {
    RED, GREEN, BLUE;
}
```

Kết quả của lời gọi `Color.GREEN.ordinal()` là gì?

**A)** `1`  
**B)** `2`  
**C)** `0`  
**D)** `Color.GREEN`


**7. Xét một enum cần cung cấp method tuỳ biến để hiển thị thông điệp dựa trên hằng số enum. Cài đặt nào sau đây định nghĩa đúng một enum như vậy?**

**A)** 
```java
public enum Size {
    SMALL, MEDIUM, LARGE;
    public static void printSize() {
        System.out.println("The size is " + this.name());
    }
}
```

**B)** 
```java
enum Flavor {
    CHOCOLATE, VANILLA, STRAWBERRY;
    void printFlavor() {
        System.out.println("Flavor: " + Flavor.name);
    }
}
```

**C)** 
```java
protected enum Direction {
    NORTH, SOUTH, EAST, WEST;
    private printDirection() {
        System.out.println("Going " + this.toString());
    }
}
```

**D)** 
```java
public enum Season {
    WINTER, SPRING, SUMMER, FALL;
    public void printSeason() {
        System.out.println("The season is " + this.name());
    }
}
```
