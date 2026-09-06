---
layout: chapter

title: "Chương 8: Functional Interface và Lambda Expression"
subtitle: "Functional Interfaces and Lambda Expressions"
exam_objectives:
  - "Sử dụng Stream cho object và kiểu nguyên thuỷ trong Java, bao gồm lambda expression cài đặt functional interface, để tạo, lọc, biến đổi, xử lý và sắp xếp dữ liệu."

previous_link: "/ch07.html"
previous_title: "Error Handling and Exceptions"
next_link: "/ch09.html"
next_title: "Streams"
answers_link: "/ch08a.html"

description: "Functional interface, @FunctionalInterface, cú pháp lambda expression, các interface có sẵn trong java.util.function và bốn loại method reference trong Java 21."
order: 1
phase: "Chương 8"
tags: [Java, OCP, Lambda, Functional Interface, Method Reference, Predicate, Function, Consumer, Supplier]
---

## Functional interface

Java 8 mang tới lambda expression — tính năng mới nhằm đơn giản hoá việc phát triển bằng cách tiếp cận theo hướng lập trình hàm nhiều hơn. Nhưng để điều này hoạt động, Java cũng giới thiệu khái niệm **functional interface**.

Functional interface là interface chỉ chứa **một** abstract method duy nhất. Chúng có thể chứa một hoặc nhiều default method hay static method, nhưng chỉ được có đúng một abstract method.

Thoạt nhìn, bạn có thể nghĩ dùng functional interface chẳng khác mấy so với dùng class và object thông thường. Dù sao ta cũng đã định nghĩa được interface có một method từ lâu rồi. Nhưng khác biệt then chốt nằm ở chỗ chúng cho phép dùng lambda expression.

Lambda expression cho phép bạn xử lý chức năng như đối số của method, hay xử lý mã như dữ liệu. Thay vì định nghĩa một class implement interface một-method, bạn truyền trực tiếp một lambda expression làm instance của functional interface, giúp mã sạch và súc tích hơn.

```java
public interface MyInterface {
    public void myMethod();
}

MyInterface ref = () -> System.out.println("Hello World!"); 
```

Trong ví dụ này, lambda expression `() -> System.out.println("Hello World!")` được xử lý như một instance của functional interface `MyInterface`. Ta đang gán một khối mã cho biến `ref`.

### Annotation `@FunctionalInterface`

Java 8 cũng giới thiệu annotation `@FunctionalInterface`, dùng để chỉ ra rằng một interface được dự định làm functional interface. Nó là một dạng *gợi ý* cho trình biên dịch rằng bạn muốn interface này tuân theo các quy tắc của functional interface:

```java
@FunctionalInterface
public interface MyInterface {
    void myMethod();
}
```

Tuy nhiên, annotation `@FunctionalInterface` **không bắt buộc**. Nếu một interface thoả tiêu chí của functional interface (chỉ có một abstract method), nó là functional interface dù có annotation hay không.

Vậy tại sao lại dùng nó?

Có vài lý do:

1. Nó làm rõ ý định của bạn. Bằng cách dùng `@FunctionalInterface`, bạn báo hiệu cho lập trình viên khác (và cho chính bạn trong tương lai) rằng interface này nhằm dùng với lambda expression.

2. Nó bật kiểm tra ở trình biên dịch. Nếu bạn gắn annotation `@FunctionalInterface` cho một interface rồi cố thêm abstract method thứ hai, trình biên dịch sẽ báo lỗi. Điều này giúp ngăn việc vô tình vi phạm hợp đồng của functional interface.

```java
@FunctionalInterface
public interface MyInterface {
    void myMethod();
    void myOtherMethod();  // This will cause a compiler error
}
```

Tuy nhiên, annotation này không nằm trong bytecode được sinh ra. Nó thuần tuý phục vụ kiểm tra lúc biên dịch và làm rõ ý cho lập trình viên.

Cũng lưu ý rằng nếu một interface được gắn `@FunctionalInterface` nhưng thực tế không thoả tiêu chí (ví dụ nó hoàn toàn không có abstract method nào), trình biên dịch sẽ báo lỗi:

```java
@FunctionalInterface
public interface NonFunctionalInterface {
    // No abstract methods
}  // This will cause a compiler error
```

### Quy tắc định nghĩa functional interface

Functional interface không giới hạn những gì bạn làm được. Bạn vẫn định nghĩa được bao nhiêu default method và static method tuỳ ý trên interface.

Default method cho phép bạn thêm chức năng mới vào interface của thư viện và đảm bảo tương thích nhị phân với mã viết cho phiên bản cũ của interface đó. Static method trong interface dùng để cung cấp những method tiện ích, chẳng hạn kiểm tra `null`.

```java
interface MyInterface {
    void abstractMethod(int x);  
    default void defaultMethod() { }        
    static void staticMethod() { }  
}
```

Chỉ `abstractMethod` được tính vào phép kiểm tra "một abstract method duy nhất" của functional interface.

Cũng cần lưu ý rằng nếu một interface khai báo abstract method override một trong các public method của `java.lang.Object`, method đó **không** được tính vào số abstract method của interface, vì mọi cài đặt của interface đều đã có sẵn phần cài đặt từ `java.lang.Object` hoặc từ nơi khác. Ví dụ:

```java
interface MyInterface {
    boolean equals(Object obj); 
    // Other methods
}
```

Trong trường hợp này, `MyInterface` vẫn là functional interface vì `equals` là public method trong `Object`.

Dùng lambda expression với functional interface chỉ đơn giản là một lựa chọn mới trong bộ công cụ lập trình. Bạn vẫn dùng được anonymous inner class hoặc cài đặt interface theo kiểu truyền thống:

```java
MyInterface ref = new MyInterface() {
    @Override
    public void myMethod() {
        System.out.println("Hello World!");
    }
};

// Implementing the interface in a separate class
class MyClass implements MyInterface {
    @Override
    public void myMethod() {
        System.out.println("Hello World!");
    }
}
MyInterface ref = new MyClass();
```

Ngoài ra, một class hay một lambda expression implement được nhiều functional interface nếu chúng tương thích. Ví dụ, nếu hai interface có abstract method giống hệt nhau, chúng thực chất là cùng một functional interface:
```java
@FunctionalInterface
interface Interface1 {
    void method();
}

@FunctionalInterface
interface Interface2 {
    void method();
}

// Implementing multiple compatible interfaces in a class
class MyClass implements Interface1, Interface2 {
    @Override
    public void method() {
        System.out.println("Hello World!");
    }
}

// Using a lambda expression 
Interface1 ref1 = () -> System.out.println("Hello World!");
Interface2 ref2 = () -> System.out.println("Hello World!");
```

Và nếu những functional interface có sẵn như `Runnable` hay `Comparator` không đáp ứng nhu cầu của bạn, bạn dễ dàng tự định nghĩa interface riêng. Chỉ cần nhớ quy tắc một abstract method duy nhất.

## Lambda expression

Lambda expression cho phép bạn xử lý chức năng như đối số của method, hay xử lý mã như dữ liệu, mở ra phong cách lập trình hàm hơn. Chẳng hạn, chúng cho phép bạn viết mã như thế này:
```java
List<Car> compactCars = findCars(cars,
     (Car c) ->
        c.getType().equals(CarTypes.COMPACT)
);
```

Thay vì:
```java
List<Car> compactCars = findCars(cars,
     new Searchable() {
        public boolean test(Car car) {
           return car.getType().equals(
                     CarTypes.COMPACT);
        }
});
```

Về bản chất, lambda expression là cách súc tích để biểu diễn một hàm. Thuật ngữ lambda expression đến từ phép tính lambda (λ-calculus), trong đó λ là chữ cái Hy Lạp lambda. Dạng phép tính này bàn về việc định nghĩa và áp dụng hàm.

Functional interface là nền tảng để xây dựng lambda expression. Ví dụ, xét functional interface sau:
```java
@FunctionalInterface
interface MyFunction {
    int apply(int a);
}
```

Bạn dùng được lambda expression ở bất cứ đâu cần một instance của interface này:
```java
MyFunction doubler = (int a) -> a * 2;
```

Lambda expression `a -> a * 2` khớp với signature của method `apply` trong `MyFunction`.

### Cú pháp của lambda expression

Lambda expression có ba phần: danh sách tham số, ký hiệu mũi tên (`->`), và thân hàm.

Đây là cú pháp cơ bản:
```java
(parameters) -> expression
// or 
(parameters) -> { statements; }
```

Ví dụ, xét functional interface này:
```java
@FunctionalInterface
interface MyFunction {
    int apply(int a, int b);
}
```

Và lambda expression nhận hai số nguyên rồi trả về tổng của chúng:
```java
MyFunction f = (int a, int b) -> a + b
```

Bạn dùng được keyword `var` trong danh sách tham số của lambda expression. Điều này cho phép trình biên dịch suy ra kiểu của tham số:
```java
MyFunction f = (var a, var b) -> a + b
```

Bạn cũng bỏ được kiểu tham số; trình biên dịch suy ra chúng từ ngữ cảnh:
```java
MyFunction f = (a, b) -> a + b
```

Nếu lambda expression chỉ nhận một tham số, bạn thậm chí bỏ được cặp ngoặc đơn:
```java
@FunctionalInterface
interface MyFunction {
    int apply(int a);
}

//...

MyFunction f = a -> a * 2
```

Bạn cũng dùng được keyword `var` để khai báo biến mà không nêu kiểu, nhưng chỉ khi trình biên dịch suy ra được kiểu từ ngữ cảnh.

Ví dụ, với interface `MyFunction` ở ví dụ trước và chỉ mỗi biểu thức sau:
```java
var f = a -> a * 2;
```

Bạn sẽ nhận lỗi biên dịch với thông điệp: "Cannot infer type: lambda expression requires an explicit target type."

Bạn không dùng trực tiếp `var` với lambda expression như `var f = (var a) -> a * 2;`, vì lambda cần một kiểu đích (target type) mà `var` không cung cấp được.

Tuy nhiên, trong trường hợp này:
```java
MyInterface f = (a) -> a * 2; // Lambda assigned to functional interface
var fVar = f; // `var` infers type MyInterface
System.out.println(fVar.apply(5)); // Outputs 10
```

Bạn dùng được `var` vì bạn đang gán lambda cho một functional interface đã được định nghĩa trước, nơi kiểu suy ra được từ ngữ cảnh.

Những ngữ cảnh mà kiểu đích (functional interface) của lambda expression suy ra được gồm:
- Khai báo biến
- Phép gán
- Câu lệnh `return`
- Khởi tạo mảng
- Đối số của method hay constructor
- Biểu thức điều kiện ba ngôi
- Biểu thức ép kiểu

Nếu bạn hiểu khái niệm, bạn không cần học thuộc danh sách này.

### Lambda expression và anonymous class

Trước Java 8, anonymous class là cách chính để biểu diễn một mẩu chức năng dùng một lần. Với việc giới thiệu lambda expression ở Java 8, giờ ta có cách súc tích hơn để viết một số loại anonymous class.

Xét anonymous class này:

```java
Runnable r1 = new Runnable() {
    public void run() {
        System.out.println("Hello!");
    }
};
```

Nó thay được bằng lambda expression:

```java
Runnable r2 = () -> System.out.println("Hello!");
```

Tuy nhiên, dù lambda expression và anonymous class có vài điểm chung, chúng cũng khác nhau đáng kể:

**Điểm giống nhau:**

- Biến cục bộ chỉ dùng được nếu chúng được khai báo `final` hoặc là effectively final.
- Bạn truy cập được biến instance hay biến static của class bao quanh.
- Chúng không được ném nhiều checked exception hơn số đã nêu trong mệnh đề `throws` của method thuộc functional interface.

**Điểm khác nhau:**

- Trong anonymous class, `this` trỏ tới chính instance của anonymous class. Trong lambda expression, `this` trỏ tới instance của class bao quanh.
- Default method của functional interface không truy cập được từ bên trong lambda expression, nhưng truy cập được từ anonymous class.
- Lambda expression cho phép bạn bỏ kiểu của tham số trong danh sách tham số, điều không làm được với anonymous class.
- Nếu bạn tham chiếu một biến instance bên trong lambda expression, bạn đang tham chiếu biến đó từ instance bao quanh. Trong anonymous class, bạn sẽ tham chiếu một bản sao riêng của biến.

Đây là ví dụ về việc dùng biến cục bộ bên trong thân lambda:

```java
public class LambdaExample {
    public void testLambda() {
        int localVariable = 10;
        Runnable r = () -> {
            System.out.println("Lambda: " + localVariable);
        };
        r.run();
    }

    public void testAnonymous() {
        int localVariable = 10;
        Runnable r = new Runnable() {
            public void run() {
                System.out.println("Anonymous: " + localVariable);
            }
        };
        r.run();
    }

    public static void main(String[] args) {
        LambdaExample example = new LambdaExample();
        example.testLambda();
        example.testAnonymous();
    }
}
```

Kết quả là:
```
Lambda: 10
Anonymous: 10
```

Trong ví dụ này, cả lambda expression lẫn anonymous class đều truy cập được `localVariable` định nghĩa trong method tương ứng. Tuy nhiên, nếu ta cố sửa `localVariable` sau khi nó đã được dùng trong lambda expression hay anonymous class, ta sẽ gặp lỗi biên dịch:

```java
public void testLambda() {
    int localVariable = 10;
    Runnable r = () -> {
        System.out.println("Lambda: " + localVariable); // Compilation error
    };
    localVariable = 20;  // Because of this
    r.run();
}
```

Lý do là `localVariable` phải là effectively final (giá trị không đổi sau khi khởi tạo) thì mới dùng được bên trong lambda expression hay anonymous class.

Biến cục bộ phải là final vì cách chúng được cài đặt trong Java. Biến instance được lưu trên heap, còn biến cục bộ sống trên stack. Biến trên heap được chia sẻ giữa các thread, còn biến trên stack bị giới hạn trong thread chứa chúng.

Khi bạn tạo instance của anonymous inner class hay lambda expression, giá trị của biến cục bộ được **sao chép**. Điều này ngăn những vấn đề liên quan tới thread và đảm bảo bạn làm việc với một giá trị nhất quán, vì biến không sửa được sau khi khởi tạo.

Bằng cách yêu cầu biến final (hoặc effectively final), Java đảm bảo an toàn luồng và tính nhất quán, vì giá trị không thay đổi được, loại bỏ vấn đề về khả năng nhìn thấy (visibility) và những rắc rối tiềm ẩn với thread.

## Các lambda interface có sẵn của Java

Ở phần trước, ta đã dùng những functional interface như sau:
```java
@FunctionalInterface
interface MyFunction {
    int apply(int a, int b);
}
```

Tuy nhiên, bạn không phải viết một interface như vậy trong mỗi chương trình dùng tới nó (hay phải liên kết một thư viện chứa nó). Một interface làm đúng việc đó nhưng nhận mọi kiểu object đã có sẵn trong ngôn ngữ.

Java cung cấp những functional interface cho các tình huống phổ biến trong package `java.util.function`.

Đây là năm interface chính:
- `Predicate<T>`
- `Consumer<T>`
- `Function<T, R>`
- `Supplier<T>`
- `UnaryOperator<T>`

Trong đó `T` và `R` là các kiểu generic (`T` là kiểu tham số, `R` là kiểu trả về).

Chúng cũng có những phiên bản chuyên biệt cho trường hợp tham số đầu vào là kiểu nguyên thuỷ (cụ thể là `int`, `long`, `double`, và `boolean` với `Supplier`), ví dụ:
- `IntPredicate`
- `LongConsumer`
- `BooleanSupplier`

Trong đó tên được đặt sau kiểu nguyên thuỷ tương ứng.

Thêm nữa, bốn trong số chúng có phiên bản hai ngôi (binary), nghĩa là nhận hai tham số thay vì một:
- `BiPredicate<L, R>`
- `BiConsumer<T, U>`
- `BiFunction<T, U, R>`
- `BinaryOperator<T>`

Trong đó `T`, `U` và `R` là các kiểu generic (`T` và `U` là kiểu tham số, `R` là kiểu trả về).

Những bảng sau liệt kê đầy đủ các interface. Bạn không cần học thuộc, chỉ cần cố hiểu chúng.

| Functional Interface | Phiên bản nguyên thuỷ |
|----------------------|--------------------|
| `Predicate<T>`       | `IntPredicate`<br/> `LongPredicate`<br/> `DoublePredicate` |
| `Consumer<T>`        | `IntConsumer`<br/> `LongConsumer`<br/> `DoubleConsumer` |
| `Function<T, R>`     | `IntFunction<R>`<br/> `IntToDoubleFunction`<br/> `IntToLongFunction`<br/> `LongFunction<R>`<br/> `LongToDoubleFunction`<br/> `LongToIntFunction`<br/> `DoubleFunction<R>`<br/> `DoubleToIntFunction`<br/> `DoubleToLongFunction`<br/> `ToIntFunction<T>`<br/> `ToDoubleFunction<T>`<br/> `ToLongFunction<T>` |
| `Supplier<T>`        | `BooleanSupplier`<br/> `IntSupplier`<br/> `LongSupplier`<br/> `DoubleSupplier` |
| `UnaryOperator<T>`   | `IntUnaryOperator`<br/> `LongUnaryOperator`<br/> `DoubleUnaryOperator` |


| Functional Interface     | Phiên bản nguyên thuỷ |
|--------------------------|--------------------|
| `BiPredicate<L, R>`      |                    |
| `BiConsumer<T, U>`       | `ObjIntConsumer<T>`<br/> `ObjLongConsumer<T>`<br/> `ObjDoubleConsumer<T>` |
| `BiFunction<T, U, R>`    | `ToIntBiFunction<T, U>`<br/> `ToLongBiFunction<T, U>`<br/> `ToDoubleBiFunction<T, U>` |
| `BinaryOperator<T>`      | `IntBinaryOperator`<br/> `LongBinaryOperator`<br/> `DoubleBinaryOperator` |

### `Predicate`

Predicate là một mệnh đề có thể `true` hoặc `false` tuỳ theo giá trị của các biến trong đó.

Functional interface này dùng được ở bất cứ đâu bạn cần đánh giá một điều kiện `boolean`.

Đây là cách interface được định nghĩa:

```java
@FunctionalInterface
public interface Predicate<T> {
    boolean test(T t);
    // Other default and static methods
    // ...
}
```

Mô tả hàm (signature của method) là:

```java
Predicate<T>
```

Đây là ví dụ dùng anonymous class:

```java
Predicate<String> startsWithA = new Predicate<String>() {
    @Override
    public boolean test(String t) {
        return t.startsWith("A");
    }
};
boolean result = startsWithA.test("Arthur");
```

Và với lambda expression:

```java
Predicate<String> startsWithA = t -> t.startsWith("A");
boolean result = startsWithA.test("Arthur");
```

Interface này cũng có những default method sau:

```java
default Predicate<T> and(Predicate<? super T> other)
default Predicate<T> or(Predicate<? super T> other)
default Predicate<T> negate()
```

Những method này trả về một `Predicate` ghép, biểu diễn phép **AND** và **OR** logic có đoản mạch giữa predicate này với predicate khác, cùng phép phủ định logic của nó.

Đoản mạch nghĩa là predicate thứ hai sẽ không được đánh giá nếu giá trị của predicate thứ nhất đã đủ quyết định kết quả (nếu predicate thứ nhất trả về `false` với **AND**, hoặc trả về `true` với **OR**).

Những method này hữu ích để kết hợp predicate và khiến mã dễ đọc hơn, ví dụ:

```java
Predicate<String> startsWithA = t -> t.startsWith("A");
Predicate<String> endsWithA = t -> t.endsWith("A");
boolean result = startsWithA.and(endsWithA).test("Hi");
```

Ngoài ra còn có một static method:

```java
static <T> Predicate<T> isEqual(Object targetRef)
```

Method này trả về một `Predicate` kiểm tra hai đối số có bằng nhau không theo `Objects.equals(Object, Object)`.

Cũng có những phiên bản nguyên thuỷ cho `int`, `long` và `double`. Chúng **không** kế thừa từ `Predicate`.

Ví dụ, đây là định nghĩa của `IntPredicate`:

```java
@FunctionalInterface
public interface IntPredicate {
    boolean test(int value);
    // And the default methods: and, or, negate
}
```

Nên thay vì dùng:

```java
Predicate<Integer> even = t -> t % 2 == 0;
boolean result = even.test(5);
```

Bạn dùng được:

```java
IntPredicate even = t -> t % 2 == 0;
boolean result = even.test(5);
```

Tại sao?

Chỉ để tránh việc chuyển đổi từ `Integer` sang `int` và làm việc trực tiếp với kiểu nguyên thuỷ.

Lưu ý những phiên bản nguyên thuỷ này không có kiểu generic. Do cách generics được cài đặt, tham số của functional interface chỉ gắn được với kiểu object.

Vì việc chuyển từ kiểu wrapper (`Integer`) sang kiểu nguyên thuỷ (`int`) tốn thêm bộ nhớ và kèm chi phí hiệu năng, Java cung cấp những phiên bản này để tránh thao tác autoboxing khi đầu vào hoặc đầu ra là kiểu nguyên thuỷ.

### `Consumer`

`Consumer` biểu diễn một thao tác nhận một đối số đầu vào và **không** trả về kết quả — nó chỉ thực hiện một số thao tác trên đối số.

Đây là cách interface được định nghĩa:

```java
@FunctionalInterface
public interface Consumer<T> {
    void accept(T t);
    // And a default method
    // ...
}
```

Mô tả hàm (signature của method) là:

```java
T -> void
```

Đây là ví dụ dùng anonymous class:

```java
Consumer<String> consumeStr = new Consumer<String>() {
    @Override
    public void accept(String t) {
        System.out.println(t);
    }
};
consumeStr.accept("Hi");
```

Và với lambda expression:

```java
Consumer<String> consumeStr = t -> System.out.println(t);
consumeStr.accept("Hi");
```

Interface này cũng có default method sau:

```java
default Consumer<T> andThen(Consumer<? super T> after)
```

Method này trả về một `Consumer` ghép, thực hiện tuần tự thao tác của consumer hiện tại rồi tới thao tác của tham số.

Những method này hữu ích để kết hợp `Consumer` và khiến mã dễ đọc hơn, ví dụ:

```java
Consumer<String> first = t ->
    System.out.println("First:" + t);
Consumer<String> second = t ->
    System.out.println("Second:" + t);
first.andThen(second).accept("Hi");
```

Kết quả là:

```java
First: Hi
Second: Hi
```

Hãy chú ý cách cả hai `Consumer` nhận cùng một đối số và thứ tự thực thi của chúng.

Cũng có những phiên bản nguyên thuỷ cho `int`, `long` và `double`. Chúng không kế thừa từ `Consumer`.

Ví dụ, đây là định nghĩa của `IntConsumer`:

```java
@FunctionalInterface
public interface IntConsumer {
    void accept(int value);
    default IntConsumer andThen(IntConsumer after) {
        // ...
    }
}
```

Nên thay vì dùng:

```java
int[] a = { 1,2,3,4,5,6,7,8 };
printList(a, t -> System.out.println(t));
//...
void printList(int[] a, Consumer<Integer> c) {
    for(int i : a) {
        c.accept(i);
    }
}
```

Bạn dùng được:

```java
int[] a = { 1,2,3,4,5,6,7,8 };
printList(a, (IntConsumer) t -> System.out.println(t));
//...
void printList(int[] a, IntConsumer c) {
    for(int i : a) {
        c.accept(i);
    }
}
```

### `Function`

`Function` biểu diễn một thao tác nhận đối số đầu vào thuộc một kiểu và tạo ra kết quả thuộc kiểu khác.

Một cách dùng phổ biến là chuyển đổi hay biến đổi từ object này sang object khác.

Đây là cách interface được định nghĩa:

```java
@FunctionalInterface
public interface Function<T, R> {
    R apply(T t);
    // Other default and static methods
    // ...
}
```

Mô tả hàm (signature của method) là:

```java
T -> R
```

Giả sử có method:

```java
void round(double d, Function<Double, Long> f) {
    long result = f.apply(d);
    System.out.println(result);
}
```

Đây là ví dụ dùng anonymous class:

```java
round(5.4, new Function<Double, Long>() {
    @Override
    public Long apply(Double d) {
        return Math.round(d);
    }
});
```

Và với lambda expression:

```java
round(5.4, d -> Math.round(d));
```

Interface này cũng có những default method sau:

```java
default <V> Function<V,R> compose(
    Function<? super V,? extends T> before)
default <V> Function<T,V> andThen(
    Function<? super R,? extends V> after)
```

Khác biệt giữa hai method này là `compose` áp dụng hàm truyền vào **trước**, và kết quả của nó làm đầu vào cho hàm còn lại. Còn `andThen` áp dụng hàm gọi method trước, và kết quả của nó làm đầu vào cho hàm truyền vào.

Ví dụ:

```java
Function<String, String> f1 = s -> s.toUpperCase();
Function<String, String> f2 = s -> s.toLowerCase();
System.out.println(f1.compose(f2).apply("Compose"));
System.out.println(f1.andThen(f2).apply("AndThen"));
```

Kết quả là:

```java
COMPOSE
andthen
```

Ở trường hợp đầu, `f2` là hàm được áp dụng trước. Ở trường hợp sau, `f2` là hàm được áp dụng sau cùng.

Ngoài ra còn có một static method:

```java
static <T> Function<T, T> identity()
```

Method này trả về một hàm luôn trả về chính đối số đầu vào của nó.

Với các phiên bản nguyên thuỷ, chúng cũng áp dụng cho `int`, `long` và `double`, nhưng có nhiều tổ hợp hơn so với các interface trước:

- Để chỉ ra rằng hàm trả về kiểu generic và nhận đối số nguyên thuỷ, interface được đặt tên **XXXFunction**, ví dụ `IntFunction`:
    ```java
    @FunctionalInterface
    public interface IntFunction<R> {
        R apply(int value);
    }
    ```

- Để chỉ ra rằng hàm trả về kiểu nguyên thuỷ và nhận đối số generic, interface được đặt tên **ToXXXFunction**, ví dụ `ToIntFunction`:
    ```java
    @FunctionalInterface
    public interface ToIntFunction<T> {
        int applyAsInt(T value);
    }
    ```

- Để chỉ ra rằng hàm nhận đối số nguyên thuỷ và trả về kiểu nguyên thuỷ khác, interface được đặt tên **XXXToYYYFunction**, trong đó **XXX** là kiểu đối số và **YYY** là kiểu trả về, ví dụ `IntToDoubleFunction`:
    ```java
    @FunctionalInterface
    public interface IntToDoubleFunction {
        double applyAsDouble(int value);
    }
    ```

Nhớ rằng những interface này tồn tại vì sự tiện lợi, để làm việc trực tiếp với kiểu nguyên thuỷ, ví dụ:

`DoubleFunction<R>` thay cho `Function<Double, R>`  
`ToLongFunction<T>` thay cho `Function<T, Long>`  
`IntToLongFunction` thay cho `Function<Integer, Long>`

### `Supplier`

`Supplier` là đối lập của `Consumer`. Nó không nhận đối số nào và chỉ trả về một giá trị.

Đây là cách interface được định nghĩa:

```java
@FunctionalInterface
public interface Supplier<T> {
    T get();
}
```

Mô tả hàm (signature của method) là:

```java
() -> T
```

Đây là ví dụ dùng anonymous class:

```java
String t = "One";
Supplier<String> supplierStr = new Supplier<String>() {
    @Override
    public String get() {
        return t.toUpperCase();
    }
};
System.out.println(supplierStr.get());
```

Và với lambda expression:

```java
String t = "One";
Supplier<String> supplierStr = () -> t.toUpperCase();
System.out.println(supplierStr.get());
```

Interface này không định nghĩa default method nào.

Cũng có những phiên bản nguyên thuỷ cho `int`, `long`, `double` và `boolean`, nhưng chúng không kế thừa từ `Supplier`.

Ví dụ, đây là định nghĩa của `BooleanSupplier`:

```java
@FunctionalInterface
public interface BooleanSupplier {
    boolean getAsBoolean();
}
```

Những phiên bản nguyên thuỷ này được dùng thay cho `Supplier` với kiểu tương ứng của chúng.

### `UnaryOperator`

`UnaryOperator` chỉ là một chuyên biệt hoá của interface `Function` (thực tế interface này kế thừa từ `Function`) cho trường hợp đối số và kết quả cùng kiểu.

Đây là cách interface được định nghĩa:

```java
@FunctionalInterface
public interface UnaryOperator<T> extends Function<T, T> {
    // Just the identity
    // method is defined
}
```

Mô tả hàm (signature của method) là:

```java
T -> T
```

Đây là ví dụ dùng anonymous class:

```java
UnaryOperator<String> uOp = new UnaryOperator<String>() {
    @Override
    public String apply(String t) {
        return t.substring(0,2);
    }
};
System.out.println(uOp.apply("Hello"));
```

Và với lambda expression:

```java
UnaryOperator<String> uOp = t -> t.substring(0,2);
System.out.println(uOp.apply("Hello"));
```

Interface này kế thừa các default method của interface `Function`:

```java
default <V> Function<V, T> compose(
    Function<? super V, ? extends T> before)
default <V> Function<T, V> andThen(
    Function<? super T, ? extends V> after)
```

Và chỉ định nghĩa riêng static method `identity()` cho interface này (vì static method không được kế thừa):

```java
static <T> UnaryOperator<T> identity()
```

Method này trả về một `UnaryOperator` luôn trả về chính đối số đầu vào của nó.

Cũng có những phiên bản nguyên thuỷ cho `int`, `long` và `double`. Chúng không kế thừa từ `UnaryOperator`.

Ví dụ, đây là định nghĩa của `IntUnaryOperator`:

```java
@FunctionalInterface
public interface IntUnaryOperator {
    int applyAsInt(int operand);
    // Definitions for compose, andThen, and identity
}
```

Nên thay vì dùng:

```java
int[] a = {1,2,3,4,5,6,7,8};
int sum = sumNumbers(a, t -> t * 2);
//...
int sumNumbers(int[] a, UnaryOperator<Integer> unary) {
    int sum = 0;
    for(int i : a) {
        sum += unary.apply(i);
    }
    return sum;
}
```

Bạn dùng được:

```java
int[] a = {1,2,3,4,5,6,7,8};
int sum = sumNumbers(a, t -> t * 2);
//...
int sumNumbers(int[] a, IntUnaryOperator unary) {
    int sum = 0;
    for(int i : a) {
        sum += unary.applyAsInt(i);
    }
    return sum;
}
```

### `BiPredicate`

Interface này biểu diễn một predicate nhận hai đối số.

Nó được định nghĩa như sau:

```java
@FunctionalInterface
public interface BiPredicate<T, U> {
    boolean test(T t, U u);
    // Default methods are also defined
}
```

Mô tả hàm (signature của method) là:

```java
(T, U) -> boolean
```

Đây là ví dụ dùng anonymous class:

```java
BiPredicate<Integer, Integer> divisible =
    new BiPredicate<Integer, Integer>() {
        @Override
        public boolean test(Integer t, Integer u) {
            return t % u == 0;
        }
    };
boolean result = divisible.test(10, 5);
```

Và với lambda expression:

```java
BiPredicate<Integer, Integer> divisible =
    (t, u) -> t % u == 0;
boolean result = divisible.test(10, 5);
```

Interface này định nghĩa những default method giống interface `Predicate`, nhưng với hai đối số:

```java
default BiPredicate<T, U> and(
    BiPredicate<? super T, ? super U> other) {
    return (t, u) -> test(t, u) && other.test(t, u);
}

default BiPredicate<T, U> or(
    BiPredicate<? super T, ? super U> other) {
    return (t, u) -> test(t, u) || other.test(t, u);
}

default BiPredicate<T, U> negate() {
    return (t, u) -> !test(t, u);
}
```

Interface này không có phiên bản nguyên thuỷ.

### `BiConsumer`

Interface này biểu diễn một consumer nhận hai đối số (và không trả về kết quả).

Đây là cách nó được định nghĩa:

```java
@FunctionalInterface
public interface BiConsumer<T, U> {
    void accept(T t, U u);
    // andThen default method is defined
}
```

Mô tả hàm (signature của method) là:

```java
(T, U) -> void
```

Đây là ví dụ dùng anonymous class:

```java
BiConsumer<String, String> consumeStr =
    new BiConsumer<String, String>() {
        @Override
        public void accept(String t, String u) {
            System.out.println(t + " " + u);
        }
    };
consumeStr.accept("Hi", "there");
```

Và với lambda expression:

```java
BiConsumer<String, String> consumeStr =
    (t, u) -> System.out.println(t + " " + u);
consumeStr.accept("Hi", "there");
```

Interface này cũng có default method sau:

```java
default BiConsumer<T, U> andThen(
    BiConsumer<? super T, ? super U> after)
```

Method này trả về một `BiConsumer` ghép, thực hiện tuần tự thao tác của consumer hiện tại rồi tới thao tác của tham số. Nó sẽ ném `NullPointerException` nếu tham số `after` là `null`.

Như với `Consumer`, những method này hữu ích để kết hợp `BiConsumer` và khiến mã dễ đọc hơn, ví dụ:

```java
BiConsumer<String, String> first = (t, u) -> System.out.println(t.toUpperCase() + u.toUpperCase());
BiConsumer<String, String> second = (t, u) -> System.out.println(t.toLowerCase() + u.toLowerCase());
first.andThen(second).accept("Again", " and again");
```

Kết quả là:

```java
AGAIN AND AGAIN
again and again
```

Cũng có những phiên bản chuyên biệt cho kiểu nguyên thuỷ `int`, `long` và `double`. Chúng không kế thừa từ `BiConsumer`, và thay vì nhận hai `int` chẳng hạn, chúng nhận một object và một giá trị nguyên thuỷ làm đối số thứ hai. Nên quy ước đặt tên đổi thành **ObjXXXConsumer**, trong đó **XXX** là kiểu nguyên thuỷ. Ví dụ, đây là định nghĩa của `ObjIntConsumer`:

```java
@FunctionalInterface
public interface ObjIntConsumer<T> {
    void accept(T t, int value);
}
```

Nên thay vì dùng:

```java
int[] a = {1,2,3,4,5,6,7,8};
printList(a, (t, i) -> System.out.println(t + i));
//...
void printList(int[] a, BiConsumer<String, Integer> c) {
    for(int i : a) {
        c.accept("Number:", i);
    }
}
```

Bạn dùng được:

```java
int[] a = {1,2,3,4,5,6,7,8};
printList(a, (t, i) -> System.out.println(t + i));
//...
void printList(int[] a, ObjIntConsumer<String> c) {
    for(int i : a) {
        c.accept("Number:", i);
    }
}
```

### `BiFunction`

Interface này biểu diễn một hàm nhận hai đối số thuộc hai kiểu khác nhau và tạo ra kết quả thuộc kiểu khác.

Đây là cách nó được định nghĩa:

```java
@FunctionalInterface
public interface BiFunction<T, U, R> {
    R apply(T t, U u);
    // Other default and static methods
    // ...
}
```

Mô tả hàm (signature của method) là:

```java
(T, U) -> R
```

Giả sử có method:

```java
void round(double d1, double d2, BiFunction<Double, Double, Long> f) {
    long result = f.apply(d1, d2);
    System.out.println(result);
}
```

Đây là ví dụ dùng anonymous class:

```java
round(5.4, 3.8, new BiFunction<Double, Double, Long>() {
    @Override
    public Long apply(Double d1, Double d2) {
        return Math.round(d1 + d2);
    }
});
```

Và với lambda expression:

```java
round(5.4, 3.8, (d1, d2) -> Math.round(d1 + d2));
```

Interface này, khác `Function`, chỉ có một default method:

```java
default <V> BiFunction<T, U, V> andThen(Function<? super R, ? extends V> after)
```

Method này trả về một hàm ghép, trước hết áp dụng hàm gọi `andThen` lên đầu vào của nó, rồi áp dụng hàm truyền vào lên kết quả.

Interface này cũng có ít phiên bản nguyên thuỷ hơn `Function`. Nó chỉ có những phiên bản nhận kiểu generic làm đối số và trả về kiểu nguyên thuỷ `int`, `long`, `double`, theo quy ước đặt tên **ToXXXBiFunction**, trong đó XXX là kiểu nguyên thuỷ.

Ví dụ, đây là định nghĩa của `ToIntBiFunction`:

```java
@FunctionalInterface
public interface ToIntBiFunction<T, U> {
    int applyAsInt(T t, U u);
}
```

Nó thay thế cho `BiFunction`.

### `BinaryOperator`

Interface này là chuyên biệt hoá của interface `BiFunction` (thực tế nó kế thừa `BiFunction`) cho trường hợp các đối số và kết quả cùng kiểu.

Đây là cách interface được định nghĩa:

```java
@FunctionalInterface
public interface BinaryOperator<T> extends BiFunction<T, T, T> {
    // Two static methods are defined
}
```

Mô tả hàm (signature của method) là:

```java
(T, T) -> T
```

Đây là ví dụ dùng anonymous class:

```java
BinaryOperator<String> binOp = new BinaryOperator<String>() {
    @Override
    public String apply(String t, String u) {
        return t.concat(u);
    }
};
System.out.println(binOp.apply("Hello", " there"));
```

Và với lambda expression:

```java
BinaryOperator<String> binOp = (t, u) -> t.concat(u);
System.out.println(binOp.apply("Hello", " there"));
```

Interface này kế thừa default method của interface `BiFunction`:

```java
default <V> BiFunction<T, T, V> andThen(Function<? super T, ? extends V> after)
```

Và định nghĩa thêm hai static method mới:

```java
static <T> BinaryOperator<T> minBy(Comparator<? super T> comparator)
static <T> BinaryOperator<T> maxBy(Comparator<? super T> comparator)
```

Chúng trả về một `BinaryOperator` cho ra phần tử nhỏ hơn hoặc lớn hơn trong hai phần tử, theo `Comparator` đã nêu.

Đây là ví dụ đơn giản:

```java
BinaryOperator<Integer> biOp = BinaryOperator.maxBy(Comparator.naturalOrder());
System.out.println(biOp.apply(28, 8));
```

Như bạn thấy, những method này chỉ là lớp bọc để chạy một `Comparator`.

`Comparator.naturalOrder()` trả về một `Comparator` so sánh các object `Comparable` theo thứ tự tự nhiên. Để chạy nó, ta chỉ cần gọi method `apply()` với hai đối số mà `BinaryOperator` cần. Không có gì bất ngờ, kết quả là:

```java
28
```

Cũng có những phiên bản nguyên thuỷ cho `int`, `long` và `double`, trong đó hai đối số và kiểu trả về cùng thuộc một kiểu nguyên thuỷ. Chúng không kế thừa `BinaryOperator` hay `BiFunction`.

Ví dụ, đây là định nghĩa của `IntBinaryOperator`:

```java
@FunctionalInterface
public interface IntBinaryOperator {
    int applyAsInt(int left, int right);
}
```

Bạn dùng nó thay cho `BinaryOperator`.

### Functional interface chuyên biệt cho kiểu nguyên thuỷ

Còn có một tập functional interface được thiết kế riêng để làm việc với kiểu nguyên thuỷ. Những interface này cho hiệu năng tốt hơn so với phiên bản generic tương ứng khi làm việc với kiểu nguyên thuỷ, vì chúng tránh được chi phí boxing và unboxing.

Có vài nhóm functional interface chuyên biệt cho kiểu nguyên thuỷ:

1. `ToDoubleFunction<T>`, `ToIntFunction<T>`, `ToLongFunction<T>`: Những interface này biểu diễn hàm nhận một object kiểu `T` và trả về kiểu nguyên thuỷ `double`, `int` hoặc `long` tương ứng. Ví dụ, đây là cách `ToIntFunction<T>` được định nghĩa:
```java
@FunctionalInterface
public interface ToIntFunction<T> {
    int applyAsInt(T value);
}
```

Và đây là ví dụ cách dùng:
```java
ToIntFunction<String> stringToInt = Integer::parseInt;
int i = stringToInt.applyAsInt("123");  // 123
```

2. `ToDoubleBiFunction<T, U>`, `ToIntBiFunction<T, U>`, `ToLongBiFunction<T, U>`: Những interface này biểu diễn hàm nhận hai object kiểu `T` và `U`, trả về kiểu nguyên thuỷ `double`, `int` hoặc `long` tương ứng. Ví dụ, đây là cách `ToIntBiFunction<T, U>` được định nghĩa:
```java
@FunctionalInterface
public interface ToIntBiFunction<T, U> {
    int applyAsInt(T t, U u);
}
```

Và đây là ví dụ cách dùng:
```java
ToIntBiFunction<String, String> comparator = String::compareTo;
int result = comparator.applyAsInt("abc", "def");  // a negative value
```

3. `DoubleToIntFunction`, `DoubleToLongFunction`, `IntToDoubleFunction`, `IntToLongFunction`, `LongToDoubleFunction`, `LongToIntFunction`: Những interface này biểu diễn hàm nhận một kiểu nguyên thuỷ và trả về một kiểu nguyên thuỷ khác. Ví dụ, đây là cách `DoubleToIntFunction` được định nghĩa:
```java
@FunctionalInterface
public interface DoubleToIntFunction {
    int applyAsInt(double value);
}
```

Và đây là ví dụ cách dùng:
```java
DoubleToIntFunction roundDown = d -> (int) d;
int i = roundDown.applyAsInt(9.9);  // 9
```

4. `ObjDoubleConsumer<T>`, `ObjIntConsumer<T>`, `ObjLongConsumer<T>`: Những interface này biểu diễn hàm nhận một object kiểu `T` cùng một giá trị nguyên thuỷ `double`, `int` hoặc `long`, và trả về `void`. Ví dụ, đây là cách `ObjIntConsumer<T>` được định nghĩa:
```java
@FunctionalInterface
public interface ObjIntConsumer<T> {

    /**
     * Performs this operation on the given arguments.
     *
     * @param t the first input argument
     * @param value the second input argument
     */
    void accept(T t, int value);
}
```

Và đây là ví dụ cách dùng:
```java
ObjIntConsumer<List<Integer>> listAddInt = List::add;
List<Integer> list = new ArrayList<>();
listAddInt.accept(list, 1);  // [1]
```

Những interface này khác `DoubleFunction<R>`, `IntFunction<R>`, `LongFunction<R>`, v.v. ở chỗ nhóm sau nhận kiểu nguyên thuỷ và trả về object. Ví dụ:

```java
IntFunction<String> intToString = Integer::toString;
String s = intToString.apply(123);  // "123"
```

Việc chọn interface nào phụ thuộc vào nhu cầu cụ thể của bạn. Nếu bạn chủ yếu làm việc với kiểu nguyên thuỷ và muốn tránh chi phí autoboxing/unboxing, những interface chuyên biệt là lựa chọn tốt. Tuy nhiên, nếu bạn cần làm việc với object, hoặc chi phí boxing không phải vấn đề, những interface generic như `Function<T, R>` và `BiFunction<T, U, R>` thường tiện lợi hơn.

## Method reference

Như bạn biết, trong Java ta dùng được tham chiếu tới object, bằng cách tạo object mới:

```java
List list = new ArrayList();
store(new ArrayList());
```

Hoặc dùng object có sẵn:

```java
List list2 = list;
isFull(list2);
```

Nhưng còn tham chiếu tới một *method* thì sao?

Nếu ta chỉ dùng một method của object bên trong một method khác, ta vẫn phải truyền cả object làm đối số. Chẳng phải sẽ thực tế hơn nếu chỉ truyền method làm đối số sao? Kiểu như:

```java
isFull(list.size);
```

Nhờ lambda expression, ta làm được điều tương tự. Ta dùng được method như thể chúng là object hay giá trị nguyên thuỷ.

Và đó là vì **method reference** là cú pháp rút gọn cho một lambda expression chỉ thực thi đúng **một** method.

Đây là cú pháp của method reference:

```java
Object :: methodName
```

Bạn dùng được lambda expression thay cho anonymous class, nhưng đôi khi lambda expression thực chất chỉ là lời gọi tới một method nào đó. Ví dụ:

```java
Consumer<String> c = s -> System.out.println(s);
```

Để mã rõ ràng hơn, bạn biến lambda expression đó thành method reference:

```java
Consumer<String> c = System.out::println;
```

Trong method reference, bạn đặt object (hoặc class) chứa method trước toán tử `::`, và tên method sau nó, không kèm đối số.

Nhưng có lẽ bạn đang nghĩ:

- Thế này rõ ràng hơn ở chỗ nào?
- Các đối số đi đâu mất rồi?
- Sao đây lại là một biểu thức hợp lệ?
- Tôi không hiểu cách dựng một method reference hợp lệ

Trước hết, method reference không dùng được cho mọi method. Chúng chỉ dùng để thay thế một lambda expression chỉ gọi một method duy nhất.

Vậy nên để dùng method reference, trước hết bạn cần một lambda expression với một method. Và để dùng lambda expression, trước hết bạn cần một functional interface — interface chỉ có một abstract method.

Nói cách khác:

Thay vì dùng

**ANONYMOUS CLASS**

bạn dùng được

**LAMBDA EXPRESSION**

Và nếu lambda đó chỉ gọi một method, bạn dùng được

**METHOD REFERENCE**

Có bốn loại method reference:

- Method reference tới một *static method*
- Method reference tới một *instance method của object thuộc một kiểu cụ thể*
- Method reference tới một *instance method của một object có sẵn*
- Method reference tới một *constructor*

Hãy bắt đầu bằng trường hợp tự nhiên nhất: *static method*.

### Static method

Trong trường hợp này, ta có lambda expression như sau:

```java
(args) -> Class.staticMethod(args)
```

Nó biến được thành method reference sau:

```java
Class::staticMethod
```

Chú ý rằng giữa static method và method reference tới static method, thay vì toán tử `.` ta dùng toán tử `::`, và ta không truyền đối số cho method reference.

Nói chung, ta không phải truyền đối số cho method reference. Tuy nhiên, đối số được xử lý khác nhau tuỳ loại method reference.

Trong trường hợp này, mọi đối số (nếu có) mà method nhận đều được truyền tự động ở phía sau hậu trường.

Ở bất cứ đâu ta truyền được một lambda expression chỉ gọi một static method, ta dùng được method reference. Ví dụ, với class này:

```java
class Numbers {
    public static boolean isMoreThanFifty(int n1, int n2) {
        return (n1 + n2) > 50;
    }
    public static List<Integer> findNumbers(
        List<Integer> l, BiPredicate<Integer, Integer> p) {
        List<Integer> newList = new ArrayList<>();
        for (Integer i : l) {
            if (p.test(i, i + 10)) {
                newList.add(i);
            }
        }
        return newList;
    }
}
```

Ta gọi method `findNumbers()` như sau:

```java
List<Integer> list = Arrays.asList(12, 5, 45, 18, 33, 24, 40);

// Using an anonymous class
findNumbers(list, new BiPredicate<Integer, Integer>() {
    public boolean test(Integer i1, Integer i2) {
        return Numbers.isMoreThanFifty(i1, i2);
    }
});

// Using a lambda expression
findNumbers(list, (i1, i2) -> Numbers.isMoreThanFifty(i1, i2));

// Using a method reference
findNumbers(list, Numbers::isMoreThanFifty);
```

### Instance method của object thuộc một kiểu cụ thể

Trong trường hợp này, ta có lambda expression như sau:

```java
(obj, args) -> obj.instanceMethod(args)
```

Trong đó một instance của object được truyền vào, và một method của nó được thực thi với vài tham số tuỳ chọn.

Nó biến được thành method reference sau:

```java
ObjectType::instanceMethod
```

Lần này việc chuyển đổi không đơn giản như trước. Thứ nhất, trong method reference ta không dùng chính instance mà dùng **kiểu** của nó.

Thứ hai, đối số còn lại của lambda expression (nếu có) không xuất hiện trong method reference, mà được truyền ở hậu trường như trường hợp static method.

Ví dụ, với class này:

```java
class Shipment {
    public double calculateWeight() {
        double weight = 0;
        // Calculate weight
        return weight;
    }
}
```

Và method này:

```java
public List<Double> calculateOnShipments(
    List<Shipment> l, Function<Shipment, Double> f) {
    List<Double> results = new ArrayList<>();
    for (Shipment s : l) {
        results.add(f.apply(s));
    }
    return results;
}
```

Ta gọi method đó bằng:

```java
List<Shipment> l = new ArrayList<Shipment>();

// Using an anonymous class
calculateOnShipments(l, new Function<Shipment, Double>() {
    public Double apply(Shipment s) { // The object
        return s.calculateWeight(); // The method
    }
});

// Using a lambda expression
calculateOnShipments(l, s -> s.calculateWeight());

// Using a method reference
calculateOnShipments(l, Shipment::calculateWeight);
```

Trong ví dụ này, ta không truyền đối số nào cho method. Điểm mấu chốt ở đây là một instance của object chính là tham số của lambda expression, và ta dựng tham chiếu tới instance method bằng **kiểu** của instance đó.

Đây là ví dụ khác, nơi ta truyền hai đối số cho method reference.

Java có interface `Function` nhận một tham số, `BiFunction` nhận hai tham số, nhưng không có `TriFunction` nhận ba tham số, nên hãy tự tạo một cái:

```java
interface TriFunction<T, U, V, R> {
    R apply(T t, U u, V v);
}
```

Giờ giả sử có một class với method nhận hai tham số và trả về kết quả, như thế này:

```java
class Sum {
    Integer doSum(String s1, String s2) {
        return Integer.parseInt(s1) + Integer.parseInt(s2);
    }
}
```

Ta bọc được method `doSum()` trong một cài đặt `TriFunction` bằng anonymous class:

```java
TriFunction<Sum, String, String, Integer> anon =
    new TriFunction<Sum, String, String, Integer>() {
        @Override
        public Integer apply(Sum s, String arg1, String arg2) {
            return s.doSum(arg1, arg2);
        }
    };
System.out.println(anon.apply(new Sum(), "1", "4"));
```

Hoặc bằng lambda expression:

```java
TriFunction<Sum, String, String, Integer> lambda =
    (Sum s, String arg1, String arg2) -> s.doSum(arg1, arg2);
System.out.println(lambda.apply(new Sum(), "1", "4"));
```

Hoặc chỉ bằng method reference:

```java
TriFunction<Sum, String, String, Integer> mRef = Sum::doSum;
System.out.println(mRef.apply(new Sum(), "1", "4"));
```

Ở đây:

- Tham số kiểu thứ nhất của `TriFunction` là kiểu object chứa method cần thực thi.
- Tham số kiểu thứ hai của `TriFunction` là kiểu của tham số thứ nhất.
- Tham số kiểu thứ ba của `TriFunction` là kiểu của tham số thứ hai.
- Tham số kiểu cuối cùng của `TriFunction` là kiểu trả về của method cần thực thi. Chú ý cách nó được bỏ đi (suy ra) trong lambda expression và method reference.

Có thể hơi lạ khi chỉ nhìn interface, class và cách chúng được dùng với method reference, nhưng điều này trở nên rõ ràng hơn khi bạn xem bản anonymous class hay thậm chí bản lambda.

Từ:

```java
(Sum s, String arg1, String arg2) -> s.doSum(arg1, arg2)
```

Thành:

```java
Sum::doSum
```

### Instance method của một object có sẵn

Trong trường hợp này, ta có lambda expression như sau:

```java
(args) -> obj.instanceMethod(args)
```

Nó biến được thành method reference sau:

```java
obj::instanceMethod
```

Lần này, một instance được định nghĩa ở nơi khác được dùng, và các đối số (nếu có) được truyền ở hậu trường như trường hợp static method.

Ví dụ, với những class này:

```java
class Car {
    private int id;
    private String color;
    // More properties
    // And getters and setters
}
class Mechanic {
    public void fix(Car c) {
        System.out.println("Fixing car " + c.getId());
    }
}
```

Và method này:

```java
public static void execute(Car car, Consumer<Car> c) {
    c.accept(car);
}
```

Ta gọi method trên bằng:

```java
final Mechanic mechanic = new Mechanic();
Car car = new Car();

// Using an anonymous class
execute(car, new Consumer<Car>() {
    public void accept(Car c) {
        mechanic.fix(c);
    }
});

// Using a lambda expression
execute(car, c -> mechanic.fix(c));

// Using a method reference
execute(car, mechanic::fix);
```

Điểm mấu chốt trong trường hợp này là dùng bất kỳ object nào mà anonymous class/lambda expression nhìn thấy được, rồi truyền vài đối số cho một instance method của object đó.

Đây là ví dụ nhanh khác dùng một `Consumer` khác:

```java
Consumer<String> c = System.out::println;
c.accept("Hello");
```

## Constructor

Trong trường hợp này, ta có lambda expression như sau:

```java
(args) -> new ClassName(args)
```

Nó biến được thành method reference sau:

```java
ClassName::new
```

Việc duy nhất lambda expression này làm là tạo một object mới, nên ta chỉ cần tham chiếu tới constructor của class bằng keyword `new`. Như các trường hợp khác, đối số (nếu có) không được truyền trong method reference.

Phần lớn thời gian, ta dùng được cú pháp này với hai (hoặc ba) interface từ package `java.util.function`.

Nếu constructor không nhận đối số, một `Supplier` là đủ:

```java
// Using an anonymous class
Supplier<List<String>> s = new Supplier<List<String>>() {
    public List<String> get() {
        return new ArrayList<String>();
    }
};
List<String> l = s.get();

// Using a lambda expression
Supplier<List<String>> s = () -> new ArrayList<String>();
List<String> l = s.get();

// Using a method reference
Supplier<List<String>> s = ArrayList::new;
List<String> l = s.get();
```

Nếu constructor nhận một đối số, ta dùng interface `Function`. Ví dụ:

```java
// Using an anonymous class
Function<String, Integer> f =
    new Function<String, Integer>() {
        public Integer apply(String s) {
            return new Integer(s);
        }
    };
Integer i = f.apply("100");

// Using a lambda expression
Function<String, Integer> f = s -> new Integer(s);
Integer i = f.apply("100");

// Using a method reference
Function<String, Integer> f = Integer::new;
Integer i = f.apply("100");
```

Nếu constructor nhận hai đối số, ta dùng interface `BiFunction`:

```java
// Using an anonymous class
BiFunction<String, String, Locale> f = new BiFunction<String, String, Locale>() {
    public Locale apply(String lang, String country) {
        return new Locale(lang, country);
    }
};
Locale loc = f.apply("en", "UK");

// Using a lambda expression
BiFunction<String, String, Locale> f = (lang, country) -> new Locale(lang, country);
Locale loc = f.apply("en", "UK");

// Using a method reference
BiFunction<String, String, Locale> f = Locale::new;
Locale loc = f.apply("en", "UK");
```

Nếu bạn có constructor với ba đối số trở lên, bạn sẽ phải tự tạo functional interface riêng.

Bạn thấy rằng tham chiếu tới constructor rất giống tham chiếu tới static method. Khác biệt là *tên method* của constructor là `new`.

Nhiều ví dụ trong chương này rất đơn giản và có lẽ chưa đủ để biện minh cho việc dùng lambda expression hay method reference.

Như đã nói ở đầu chương, hãy dùng method reference nếu chúng khiến mã của bạn rõ ràng hơn.

Bạn tránh được hạn chế "một method" bằng cách gom toàn bộ mã vào một static method chẳng hạn, rồi tạo tham chiếu tới method đó thay vì dùng class hay một lambda expression dài nhiều dòng.

Nhưng sức mạnh thực sự của lambda expression và method reference chỉ bộc lộ khi chúng được kết hợp với một tính năng khác của Java: **stream**.

Đó sẽ là chủ đề của chương tiếp theo.

## Các điểm chính

- Functional interface là interface chỉ chứa một abstract method. Nó có thể chứa default method hoặc static method.

- Annotation `@FunctionalInterface` dùng để chỉ ra rằng một interface được dự định làm functional interface. Nó bật kiểm tra ở trình biên dịch nhưng không bắt buộc nếu interface đã thoả tiêu chí.

- Nếu một interface khai báo abstract method override một public method trong `java.lang.Object`, method đó không được tính vào số abstract method của interface.

- Lambda expression cho phép bạn xử lý chức năng như đối số của method, hay xử lý mã như dữ liệu.

- Cú pháp của lambda là: `(parameters) -> expression` hoặc `(parameters) -> { statements; }`.

- Bạn dùng được `var` trong danh sách tham số của lambda expression để cho phép suy luận kiểu.

- Kiểu đích của lambda expression suy ra được trong những ngữ cảnh như khai báo biến, phép gán, câu lệnh `return`, khởi tạo mảng, đối số của method/constructor, biểu thức ba ngôi và biểu thức ép kiểu.

- Lambda expression giống anonymous class ở vài mặt, như cách dùng biến cục bộ, nhưng khác nhau ở cách xử lý `this`, default method, danh sách tham số và biến instance.

- Biến cục bộ dùng trong lambda expression hay anonymous class phải là final hoặc effectively final (không bị sửa sau khi khởi tạo) để đảm bảo an toàn luồng và tính nhất quán.

- Java cung cấp những functional interface có sẵn trong package `java.util.function` cho các tình huống phổ biến. Những interface chính là `Predicate<T>`, `Consumer<T>`, `Function<T, R>`, `Supplier<T>` và `UnaryOperator<T>`.

- Những interface này cũng có phiên bản chuyên biệt cho kiểu nguyên thuỷ (như `IntPredicate`, `LongConsumer`, v.v.) để tránh chi phí autoboxing khi làm việc với kiểu nguyên thuỷ.

- Cũng có những phiên bản hai ngôi của một số interface này, nhận hai tham số, như `BiPredicate<L, R>`, `BiConsumer<T, U>`, `BiFunction<T, U, R>` và `BinaryOperator<T>`.

- `Predicate<T>` biểu diễn một hàm trả về boolean, nhận đầu vào là object kiểu `T`. Nó có các default method `and`, `or` và `negate` để kết hợp predicate.

- `Consumer<T>` biểu diễn một thao tác nhận một đối số đầu vào và không trả về kết quả. Nó có default method `andThen` để nối chuỗi consumer.

- `Function<T, R>` biểu diễn một hàm nhận một đối số và trả về kết quả. Nó có các default method `compose` và `andThen` để kết hợp hàm.

- `Supplier<T>` biểu diễn một nguồn cung cấp kết quả: nó không nhận đối số nào và trả về một kết quả.

- `UnaryOperator<T>` biểu diễn một thao tác trên một toán hạng duy nhất, cho ra kết quả cùng kiểu với toán hạng. Nó là chuyên biệt hoá của `Function` khi kiểu đối số và kiểu kết quả trùng nhau.

- Method reference cung cấp cách tham chiếu tới một method mà không gọi nó, dùng toán tử `::`. Chúng dùng được ở nơi cần một lambda expression.

- Có bốn loại method reference: tới static method, tới instance method của object thuộc một kiểu cụ thể, tới instance method của một object có sẵn, và tới constructor.
