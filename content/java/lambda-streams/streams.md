---
layout: chapter

title: "Chương 9: Stream"
subtitle: "Streams"
exam_objectives:
  - "Sử dụng Stream cho object và kiểu nguyên thuỷ trong Java, bao gồm lambda expression cài đặt functional interface, để tạo, lọc, biến đổi, xử lý và sắp xếp dữ liệu."
  - "Thực hiện phân rã, nối, rút gọn, gom nhóm và phân hoạch trên stream tuần tự và song song."

previous_link: "/ch08.html"
previous_title: "Functional Interfaces and Lambda Expressions"
next_link: "/ch10.html"
next_title: "Concurrency and Multithreading"
answers_link: "/ch09a.html"

description: "Class Optional, pipeline stream, thao tác trung gian và kết thúc, primitive stream, filter, map, flatMap, reduce cùng toàn bộ họ Collectors trong Java 21."
order: 2
phase: "Chương 9"
tags: [Java, OCP, Stream, Optional, filter, map, reduce, Collectors, flatMap]
---

## Nội dung chương

- [Class Optional](#heading-class-optional)
- [Stream](#heading-stream)
    - [Stream là gì?](#heading-stream-là-gì)
    - [Tạo stream](#heading-tạo-stream)
    - [Thao tác trung gian (intermediate operation)](#heading-thao-tác-trung-gian-intermediate-operation)
    - [Thao tác kết thúc (terminal operation)](#heading-thao-tác-kết-thúc-terminal-operation)
    - [Thao tác lười biếng (lazy)](#heading-thao-tác-lười-biếng-lazy)
- [Primitive stream](#heading-primitive-stream)
- [Lọc stream](#heading-lọc-stream)
- [Ánh xạ stream](#heading-ánh-xạ-stream)
- [Phân rã stream](#heading-phân-rã-stream)
- [Nối stream](#heading-nối-stream)
- [Rút gọn stream](#heading-rút-gọn-stream)
- [Thu thập kết quả](#heading-thu-thập-kết-quả)
    - [Dùng các collector cơ bản](#heading-dùng-các-collector-cơ-bản)
    - [Thu thập vào Map](#heading-thu-thập-vào-map)
    - [Gom nhóm, phân hoạch, ánh xạ và teeing](#heading-gom-nhóm-phân-hoạch-ánh-xạ-và-teeing)
- [Các điểm chính](#heading-các-điểm-chính)
- [Câu hỏi luyện tập](#heading-câu-hỏi-luyện-tập)

---
## Class Optional

Hầu hết ngôn ngữ lập trình đều có một kiểu dữ liệu biểu diễn sự vắng mặt của giá trị, và nó mang nhiều tên gọi:

`NULL, nil, None, Nothing`

Kiểu `null` được Tony Hoare giới thiệu trong ALGOL W năm 1965, và nó được xem là một trong những sai lầm tồi tệ nhất của khoa học máy tính. Theo lời chính Tony Hoare:

*Tôi gọi nó là sai lầm tỉ đô của mình. Đó là phát minh về tham chiếu null năm 1965. Khi ấy tôi đang thiết kế hệ thống kiểu toàn diện đầu tiên cho tham chiếu trong một ngôn ngữ hướng đối tượng (ALGOL W). Mục tiêu của tôi là đảm bảo mọi việc dùng tham chiếu đều tuyệt đối an toàn, với việc kiểm tra do trình biên dịch tự động thực hiện. Nhưng tôi không cưỡng lại được cám dỗ đưa vào một tham chiếu null, đơn giản vì nó quá dễ cài đặt. Điều này đã dẫn tới vô số lỗi, lỗ hổng và sự cố hệ thống, có lẽ đã gây ra cả tỉ đô-la thiệt hại và đau đầu trong bốn mươi năm qua.*

Dù vậy, vẫn có người thắc mắc: vấn đề với `null` là gì?

Nếu bạn thấy hơi lo lắng về những rắc rối mà đoạn mã này có thể gây ra, thì bạn đã biết câu trả lời rồi:

```java
String summary = 
  book.getChapter(10)
      .getSummary().toUpperCase();
```

Vấn đề với đoạn mã đó là nếu bất kỳ method nào trong số này trả về tham chiếu `null` (ví dụ nếu cuốn sách không có chương thứ mười), một `NullPointerException` — exception phổ biến nhất trong Java — sẽ được ném ra lúc chạy, làm dừng chương trình.

Ta làm gì để tránh exception này?

Có lẽ cách dễ nhất là kiểm tra `null`. Đây là một cách làm:

```java
String summary = "";
if(book != null) {
    Chapter chapter = book.getChapter(10);
    if(chapter != null) {
        if(chapter.getSummary() != null) {
            summary = chapter.getSummary()
                             .toUpperCase();
        }
    }
}
```

Bạn không biết object nào trong cây phân cấp này có thể là `null`, nên bạn kiểm tra mọi object. Rõ ràng đây không phải giải pháp tốt nhất; nó không thực tế lắm và làm hỏng tính dễ đọc.

Còn một vấn đề nữa. Kiểm tra `null` có thực sự đáng mong muốn không? Ý tôi là, nếu những object đó lẽ ra không bao giờ được `null` thì sao? Bằng cách kiểm tra `null`, ta giấu lỗi đi thay vì xử lý nó.

Dĩ nhiên đây cũng là vấn đề thiết kế. Ví dụ, nếu một chương chưa có phần tóm tắt, dùng giá trị mặc định nào thì tốt hơn — chuỗi rỗng hay `null`?

Class `java.util.Optional<T>` giải quyết vấn đề này.

Nhiệm vụ của class này là bao gói một giá trị tuỳ chọn — một object có thể là `null`.

Với ví dụ trước, nếu ta biết không phải chương nào cũng có phần tóm tắt, thay vì mô hình hoá class như thế này:

```java
class Chapter {
    private String summary;
    // Other attributes and methods
}
```

Ta dùng được class `Optional`:

```java
class Chapter {
    private Optional<String> summary;
    // Other attributes and methods
}
```

Vậy nên nếu có giá trị, class `Optional` chỉ đơn giản bọc nó lại. Ngược lại, giá trị rỗng được biểu diễn bằng method `Optional.empty()`, method này trả về một instance singleton của `Optional`.

Bằng cách dùng class này thay cho `null`, ta khai báo tường minh rằng attribute `summary` là tuỳ chọn. Khi đó ta tránh được `NullPointerException` đồng thời có sẵn những method hữu ích của `Optional` để dùng — ta sẽ xem ngay sau đây.

Trước hết, hãy xem cách tạo instance của class này.

Để lấy một object `Optional` rỗng, dùng:

```java
Optional<String> summary = Optional.empty();
```

Nếu bạn chắc chắn một object không phải `null`, bạn bọc nó vào object `Optional` như sau:

```java
Optional<String> summary = Optional.of("A summary");
```

Một `NullPointerException` sẽ được ném ra nếu object là `null`. Tuy nhiên, bạn dùng được:

```java
Optional<String> summary = Optional.ofNullable("A summary");
```

Method này trả về một instance `Optional` với giá trị đã nêu nếu nó khác `null`. Ngược lại, nó trả về một `Optional` rỗng.

Nếu bạn muốn biết một `Optional` có chứa giá trị hay không, bạn làm như sau:

```java
if (summary.isPresent()) {
    // Do something
}
```

Hoặc theo phong cách hàm hơn:

```java
summary.ifPresent(s -> System.out.println(s));
// Or summary.ifPresent(System.out::println);
```

Method `ifPresent()` nhận một `Consumer<T>` làm đối số, và consumer này chỉ chạy nếu `Optional` chứa giá trị.

Để lấy giá trị của một `Optional`, dùng:

```java
String s = summary.get();
```

Tuy nhiên method này sẽ ném `java.util.NoSuchElementException` nếu `Optional` không chứa giá trị, nên tốt hơn là dùng method `ifPresent()`.

Cách khác, nếu ta muốn trả về gì đó khi `Optional` không chứa giá trị, có ba method nữa dùng được:

```java
String summaryOrDefault = summary.orElse("Default summary");
```

Method `orElse()` trả về đối số (phải thuộc kiểu `T`, ở đây là `String`) khi `Optional` rỗng. Ngược lại nó trả về giá trị được bao gói.

```java
String summaryOrDefault = 
    summary.orElseGet(() -> "Default summary");
```

Method `orElseGet()` nhận một `Supplier<? extends T>` làm đối số, supplier này trả về giá trị khi `Optional` rỗng. Ngược lại nó trả về giá trị được bao gói.

```java
String summaryOrException = 
    summary.orElseThrow(() -> new Exception());
```

Method `orElseThrow()` nhận một `Supplier<? extends X>`, trong đó `X` là kiểu exception cần ném khi `Optional` rỗng. Ngược lại nó trả về giá trị được bao gói.

Có những phiên bản của class `Optional` để làm việc với kiểu nguyên thuỷ: `OptionalInt`, `OptionalLong` và `OptionalDouble`, nên bạn dùng được `OptionalInt` thay cho `Optional<Integer>`:

```java
OptionalInt optionalInt = OptionalInt.of(1);
int i = optionalInt.getAsInt();
```

Tuy nhiên, việc dùng những phiên bản nguyên thuỷ này không được khuyến khích, đặc biệt vì chúng thiếu ba method hữu ích của `Optional`: `filter()`, `map()` và `flatMap()`. Và vì `Optional` chỉ chứa một giá trị, chi phí boxing/unboxing một giá trị nguyên thuỷ là không đáng kể.

Method `filter()` trả về chính `Optional` đó nếu có giá trị và giá trị khớp predicate cho trước. Ngược lại, một `Optional` rỗng được trả về.

```java
String summaryStr = 
    summary.filter(s -> s.length() > 10).orElse("Short summary");
```

Method `map()` nhìn chung dùng để biến đổi từ kiểu này sang kiểu khác. Nếu có giá trị, nó áp dụng `Function<? super T, ? extends U>` được cung cấp lên giá trị đó. Ví dụ:

```java
int summaryLength = summary.map(s -> s.length()).orElse(0);
```

Method `flatMap()` tương tự `map()`, nhưng nó nhận đối số kiểu `Function<? super T, Optional<U>>` và nếu có giá trị, nó trả về `Optional` là kết quả của việc áp dụng hàm được cung cấp. Ngược lại, nó trả về một `Optional` rỗng.

## Stream

Giả sử bạn có một danh sách sinh viên và yêu cầu là trích ra những sinh viên có điểm từ `90.0` trở lên rồi sắp xếp họ theo điểm tăng dần.

Một cách làm là:

```java
List<Student> studentsScore = new ArrayList<Student>();
for(Student s : students) {
   if(s.getScore() >= 90.0) {
       studentsScore.add(s);
   }
}
Collections.sort(studentsScore, new Comparator<Student>() {
   public int compare(Student s1, Student s2) {
       return Double.compare(s1.getScore(), s2.getScore());
   }
});
```

Rất dài dòng khi so với cách cài đặt dùng stream:

```java
List<Student> studentsScore = students
    .stream()
    .filter(s -> s.getScore() >= 90.0)
    .sorted(Comparator.comparing(Student::getScore))
    .collect(Collectors.toList());
```

Đừng lo nếu bạn chưa hiểu hết đoạn mã, ta sẽ xem ý nghĩa của nó sau.

### Stream là gì?

Trước hết, stream **KHÔNG** phải collection.

Một định nghĩa đơn giản là: stream là *lớp bọc* cho collection hay mảng. Chúng bọc một collection có sẵn (hoặc một nguồn dữ liệu khác) để hỗ trợ những thao tác biểu diễn bằng lambda, nên bạn nêu ra **điều bạn muốn làm**, chứ không phải **cách làm**. Bạn đã thấy điều đó rồi.

Đây là những đặc điểm của stream:

- **Stream hoạt động hoàn hảo với lambda.** Mọi thao tác của stream đều nhận functional interface làm đối số, nên bạn đơn giản hoá được mã bằng lambda expression (và method reference).

- **Stream không lưu trữ phần tử của nó.** Các phần tử được lưu trong một collection hoặc được sinh ra tại chỗ. Chúng chỉ được đưa từ nguồn đi qua một pipeline các thao tác.

- **Stream là bất biến.** Stream không làm thay đổi nguồn phần tử bên dưới. Thay vào đó, chúng tạo ra stream mới phản ánh những biến đổi đã áp dụng.

- **Stream không tái sử dụng được.** Stream chỉ duyệt được một lần. Sau khi một thao tác kết thúc (terminal operation) được thực thi — ta sẽ xem điều này nghĩa là gì ngay — bạn phải tạo stream khác từ nguồn để xử lý tiếp.

- **Stream không hỗ trợ truy cập phần tử theo chỉ số.** Một lần nữa, stream không phải collection hay mảng. Nhiều nhất bạn lấy được phần tử đầu tiên của nó.

- **Stream dễ song song hoá.** Chỉ với một lời gọi method (và tuân theo vài quy tắc), bạn khiến stream thực thi các thao tác một cách đồng thời mà không phải viết mã đa luồng nào.

- **Thao tác của stream là lười biếng (lazy) khi có thể.** Stream trì hoãn việc thực thi các thao tác cho tới khi kết quả thực sự cần, hoặc tới khi biết được cần bao nhiêu dữ liệu.

Một điều cho phép tính lười biếng này là cách các thao tác được thiết kế. Hầu hết chúng trả về một stream mới, cho phép nối chuỗi thao tác và tạo thành pipeline, mở đường cho những tối ưu hoá kiểu này.

Để dựng pipeline này, bạn:

1. Tạo stream.
2. Áp dụng không hoặc nhiều thao tác trung gian (intermediate operation) để biến stream ban đầu thành những stream mới.
3. Áp dụng một thao tác kết thúc (terminal operation) để sinh ra kết quả hoặc một *tác dụng phụ*.

Đây là sơ đồ giúp bạn hình dung pipeline này:
```
┌─────────────┐   ┌───────────────────────────┐   ┌───────────────┐
│             │   │  Intermediate Ops         │   │               │
│   Source    │   │ ┌─────┐ ┌──────┐ ┌──────┐ │   │   Terminal    │
│ (Collection │ → │ │ map │→│filter│→│sorted│ │ → │  Operation    │
│  or Array)  │   │ └─────┘ └──────┘ └──────┘ │   │(e.g., collect)│
│             │   │                           │   │               │
└─────────────┘   └───────────────────────────┘   └───────────────┘
       ↑                       ↑                        ↑
       │                       │                        │
    Creation              Processing                 Result
```

### Tạo stream

Stream được biểu diễn bởi interface `java.util.stream.Stream<T>`. Interface này chỉ làm việc với object.

Cũng có những chuyên biệt hoá để làm việc với kiểu nguyên thuỷ, như `IntStream`, `LongStream` và `DoubleStream`.

Có nhiều cách tạo stream. Hãy bắt đầu với ba cách phổ biến nhất.

Cách thứ nhất là tạo stream từ một cài đặt của `java.util.Collection` bằng method `stream()`:

```java
List<String> words = Arrays.asList("hello", "hola", "hallo", "ciao");;
Stream<String> stream = words.stream();
```

Cách thứ hai là tạo stream từ những giá trị riêng lẻ:

```java
Stream<String> stream = Stream.of("hello","hola", "hallo", "ciao");
```

Cách thứ ba là tạo stream từ một mảng:

```java
String[] words = {"hello", "hola", "hallo", "ciao"};
Stream<String> stream = Stream.of(words);
```

Tuy nhiên, bạn phải cẩn thận với cách cuối này khi làm việc với kiểu nguyên thuỷ.

Đây là lý do. Giả sử có mảng `int`:

```java
int[] nums = {1, 2, 3, 4, 5};
```

Khi ta tạo stream từ mảng này như sau:

```java
Stream.of(nums)
```

Ta **không** tạo ra stream các `Integer` (`Stream<Integer>`), mà tạo ra stream các mảng `int` (`Stream<int[]>`). Nghĩa là thay vì có stream với năm phần tử, ta có stream với **một** phần tử:

```java
System.out.println(Stream.of(nums).count()); // It prints 1!
```

Nguyên nhân nằm ở signature của method `of`:

```java
// returns a stream of one element
static <T> Stream<T> of(T t)
// returns a stream whose elements are the specified values
static <T> Stream<T> of(T... values)
```

Vì `int` không phải object nhưng `int[]` thì có, method được chọn để tạo stream là method đầu tiên (`Stream.of(T t)`) chứ không phải bản varargs, nên một stream của `int[]` được tạo ra; và vì chỉ truyền vào một mảng, kết quả là stream có một phần tử.

Để khắc phục, ta ép Java chọn bản varargs bằng cách tạo mảng object (với `Integer`):

```java
Integer[] nums = {1, 2, 3, 4, 5};
// It prints 5!
System.out.println(Stream.of(nums).count());
```

Hoặc dùng cách thứ tư để tạo stream (thực chất cách này được dùng bên trong `Stream.of(T... values)`):

```java
int[] nums = {1, 2, 3, 4, 5};
// It also prints 5!
System.out.println(Arrays.stream(nums).count());
```

Hoặc dùng phiên bản nguyên thuỷ `IntStream`:

```java
int[] nums = {1, 2, 3, 4, 5};
// It also prints 5!
System.out.println(IntStream.of(nums).count());
```

Vậy nên đừng dùng `Stream<T>.of()` khi làm việc với kiểu nguyên thuỷ.

Đây là những cách khác để tạo stream:

```java
static <T> Stream<T> generate(Supplier<T> s)
```

Method này trả về một stream **vô hạn** trong đó mỗi phần tử được sinh bởi `Supplier` được cung cấp, và thường dùng cùng method:

```java
Stream<T> limit(long maxSize)
```

Method này cắt bớt stream để nó không dài quá `maxSize`.

Ví dụ:

```java
Stream<Double> s = Stream.generate(new Supplier<Double>() {
   public Double get() {
       return Math.random();
   }
}).limit(5);
```

Hoặc:

```java
Stream<Double> s = Stream.generate(() -> Math.random()).limit(5);
```

Hoặc chỉ đơn giản:

```java
Stream<Double> s = Stream.generate(Math::random).limit(5);
```

Đoạn này sinh ra stream gồm năm số `double` ngẫu nhiên.

Tiếp theo là method `iterate`:

```java
static <T> Stream<T> iterate(T seed, UnaryOperator<T> f)
```

Nó trả về một stream vô hạn sinh ra bằng cách áp dụng lặp đi lặp lại hàm `f` lên một phần tử ban đầu (seed). Phần tử đầu tiên (`n = 0`) trong stream sẽ là seed được cung cấp. Với `n > 0`, phần tử ở vị trí `n` là kết quả của việc áp dụng hàm `f` lên phần tử ở vị trí `n - 1`. Ví dụ:

```java
Stream<Integer> s = Stream.iterate(1, new UnaryOperator<Integer>() {
   @Override
   public Integer apply(Integer t) {
       return t * 2; }
}).limit(5);
```

Hoặc chỉ đơn giản:

```java
Stream<Integer> s = Stream.iterate(1, t -> t * 2).limit(5);
```

Đoạn này sinh ra các phần tử `1`, `2`, `4`, `8`, `16`.

Có một class `Stream.Builder<T>` (theo mẫu thiết kế builder) với những method thêm phần tử vào stream đang được dựng:

```java
void accept(T t)
default Stream.Builder<T> add(T t)
```

Ví dụ:

```java
Stream.Builder<String> builder = Stream.<String>builder().add("h").add("e").add("l").add("l");
builder.accept("o");
Stream<String> s = builder.build();
```

`IntStream` và `LongStream` định nghĩa những method:

```java
static IntStream range(int startInclusive, int endExclusive)
static IntStream rangeClosed(int startInclusive, int endInclusive)
static LongStream range(long startInclusive, long endExclusive)
static LongStream rangeClosed(long startInclusive, long endInclusive)
```

Chúng trả về một stream tuần tự cho dải phần tử `int` hoặc `long`. Ví dụ:

```java
// stream of 1, 2, 3
IntStream s = IntStream.range(1, 4);
// stream of 1, 2, 3, 4
IntStream s = IntStream.rangeClosed(1, 4);
```

Ngoài ra, còn có những method trong Java API sinh ra stream. Ví dụ:

```java
IntStream s1 = new Random().ints(5, 1, 10);
```

Method này trả về một `IntStream` gồm năm số `int` ngẫu nhiên từ một (bao gồm) tới mười (không bao gồm).

### Thao tác trung gian (intermediate operation)

Bạn dễ dàng nhận ra thao tác trung gian: chúng luôn trả về một stream mới. Điều này cho phép nối chuỗi các thao tác.

Ví dụ:

```java
Stream<String> s = Stream.of("m", "k", "c", "t")
    .sorted()
    .limit(3)
```

Một đặc điểm quan trọng của thao tác trung gian là chúng không xử lý phần tử cho tới khi một thao tác kết thúc được gọi — nghĩa là chúng lười biếng (lazy).

Thao tác trung gian có thể là *stateless* (không giữ trạng thái) hoặc *stateful* (có giữ trạng thái).

Thao tác stateless không giữ trạng thái nào từ các phần tử trước khi xử lý phần tử mới, nên mỗi phần tử được xử lý độc lập với thao tác trên phần tử khác.

Thao tác stateful, như `distinct` và `sorted`, đòi hỏi xử lý toàn bộ stream hoặc theo dõi trạng thái từ những phần tử đã xử lý trước đó để tạo ra kết quả.

Bảng sau tóm tắt những method của interface `Stream` biểu diễn thao tác trung gian.

| Method | Loại | Mô tả |
|--------------------------------------------------------------------------------------------------|-----------|--------------------------------------------------------------------------------------------------------------------|
| `Stream<T> distinct()`                                                                           | Stateful  | Trả về stream gồm những phần tử khác nhau (loại trùng lặp). |
| `Stream<T> filter(Predicate<? super T> predicate)`                                               | Stateless | Trả về stream gồm những phần tử khớp predicate cho trước. |
| `<R> Stream<R> flatMap(Function<? super T,? extends Stream<? extends R>> mapper)`                | Stateless | Trả về stream với nội dung tạo ra từ việc áp dụng hàm ánh xạ lên từng phần tử. Cũng có phiên bản cho `int`, `long` và `double`. |
| `Stream<T> limit(long maxSize)`                                                                  | Stateful  | Trả về stream bị cắt bớt để không dài quá `maxSize`. |
| `<R> Stream<R> map(Function<? super T,? extends R> mapper)`                                      | Stateless | Trả về stream gồm kết quả của việc áp dụng hàm cho trước lên các phần tử của stream này. Cũng có phiên bản cho `int`, `long` và `double`. |
| `Stream<T> peek(Consumer<? super T> action)`                                                     | Stateless | Trả về stream với các phần tử của stream này, đồng thời thực hiện hành động cho trước trên từng phần tử. |
| `Stream<T> skip(long n)`                                                                         | Stateful  | Trả về stream với những phần tử còn lại sau khi bỏ đi `n` phần tử đầu. |
| `Stream<T> sorted()`                                                                             | Stateful  | Trả về stream được sắp xếp theo thứ tự tự nhiên của phần tử. |
| `Stream<T> sorted(Comparator<? super T> comparator)`                                             | Stateful  | Trả về stream được sắp xếp theo `Comparator` được cung cấp. |
| `Stream<T> parallel()`                                                                           | N/A       | Trả về stream tương đương nhưng song song. |
| `Stream<T> sequential()`                                                                         | N/A       | Trả về stream tương đương nhưng tuần tự. |
| `Stream<T> unordered()`                                                                          | N/A       | Trả về stream tương đương nhưng không có thứ tự. |

### Thao tác kết thúc (terminal operation)

Bạn cũng dễ dàng nhận ra thao tác kết thúc: chúng luôn trả về thứ gì đó **không phải** stream.

Sau khi thao tác kết thúc được thực hiện, pipeline stream đã bị *tiêu thụ* và không dùng lại được. Ví dụ:

```java
int[] digits = {0, 1, 2, 3, 4 , 5, 6, 7, 8, 9};
IntStream s = IntStream.of(digits);
long n = s.count();
System.out.println(s.findFirst()); // An exception is thrown
```

Nếu bạn cần duyệt lại cùng một stream, bạn phải quay lại nguồn dữ liệu để lấy stream mới. Ví dụ:

```java
int[] digits = {0, 1, 2, 3, 4 , 5, 6, 7, 8, 9};
long n = IntStream.of(digits).count();
System.out.println(IntStream.of(digits).findFirst()); // OK
```

Bảng sau tóm tắt những method của interface `Stream` biểu diễn thao tác kết thúc.

| Method | Mô tả |
|-------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------|
| `boolean allMatch(Predicate<? super T> predicate)`                                              | Trả về việc mọi phần tử của stream có khớp predicate cho trước không. Nếu stream rỗng thì trả về `true` và predicate không được đánh giá. |
| `boolean anyMatch(Predicate<? super T> predicate)`                                              | Trả về việc có phần tử nào của stream khớp predicate cho trước không. Nếu stream rỗng thì trả về `false` và predicate không được đánh giá. |
| `boolean noneMatch(Predicate<? super T> predicate)`                                             | Trả về việc không phần tử nào của stream khớp predicate cho trước. Nếu stream rỗng thì trả về `true` và predicate không được đánh giá. |
| `Optional<T> findAny()`                                                                         | Trả về một `Optional` mô tả một phần tử nào đó của stream. |
| `Optional<T> findFirst()`                                                                       | Trả về một `Optional` mô tả phần tử đầu tiên của stream này. |
| `<R,A> R collect(Collector<? super T,A,R> collector)`                                           | Thực hiện thao tác rút gọn khả biến trên các phần tử của stream bằng một `Collector`. |
| `long count()`                                                                                  | Trả về số phần tử trong stream này. |
| `void forEach(Consumer<? super T> action)`                                                      | Thực hiện một hành động cho từng phần tử của stream này. |
| `void forEachOrdered(Consumer<? super T> action)`                                               | Thực hiện một hành động cho từng phần tử của stream này, theo thứ tự duyệt nếu stream có thứ tự duyệt xác định. |
| `Optional<T> max(Comparator<? super T> comparator)`                                             | Trả về phần tử lớn nhất của stream theo `Comparator` được cung cấp. |
| `Optional<T> min(Comparator<? super T> comparator)`                                             | Trả về phần tử nhỏ nhất của stream theo `Comparator` được cung cấp. |
| `T reduce(T identity, BinaryOperator<T> accumulator)`                                           | Thực hiện phép rút gọn trên các phần tử của stream, dùng giá trị đơn vị (identity) và một hàm tích luỹ có tính kết hợp, rồi trả về giá trị đã rút gọn. |
| `Object[] toArray()`                                                                            | Trả về mảng chứa các phần tử của stream này. |
| `<A> A[] toArray(IntFunction<A[]> generator)`                                                   | Trả về mảng chứa các phần tử của stream này, dùng hàm sinh được cung cấp để cấp phát mảng trả về. |
| `Iterator<T> iterator()`                                                                        | Trả về một iterator cho các phần tử của stream. |
| `Spliterator<T> spliterator()`                                                                  | Trả về một spliterator cho các phần tử của stream. |

### Thao tác lười biếng (lazy)

Thao tác trung gian được trì hoãn cho tới khi một thao tác kết thúc được gọi. Lý do là thao tác trung gian thường được thao tác kết thúc gộp lại hoặc tối ưu hoá.

Hãy lấy ví dụ pipeline stream này:

```java
Stream.of("sun", "pool", "beach", "kid", "island", "sea", "sand")
    .map(str -> str.length())
    .filter(i -> i > 3)
    .limit(2)
    .forEach(System.out::println);
```

Đây là những gì nó làm:

- Sinh ra một stream các chuỗi,
- Rồi chuyển stream thành stream các `int` (biểu diễn độ dài của từng chuỗi)
- Rồi lọc những độ dài lớn hơn ba,
- Rồi lấy hai phần tử đầu của stream và
- Cuối cùng in ra hai phần tử đó.

Bạn có thể nghĩ thao tác `map` được áp dụng lên cả bảy phần tử, rồi thao tác `filter` lại áp lên cả bảy, rồi lấy hai phần tử đầu, và cuối cùng in giá trị.

Nhưng nó không hoạt động như vậy. Nếu ta sửa các lambda expression của `map` và `filter` để in thông điệp:

```java
Stream.of("sun", "pool", "beach", "kid", "island", "sea", "sand")
    .map(str -> {
        System.out.println("Mapping: " + str);
        return str.length();
    })
    .filter(i -> {
        System.out.println("Filtering: " + i);
        return i > 3;
    })
    .limit(2)
    .forEach(System.out::println);
```

Thứ tự đánh giá sẽ lộ ra:

```java
Mapping: sun
Filtering: 3
Mapping: pool
Filtering: 4
4
Mapping: beach
Filtering: 5
5
```

Từ ví dụ này, ta thấy stream chỉ áp dụng các thao tác cho tới khi tìm đủ phần tử để trả về kết quả (do thao tác `limit(2)`). Đây gọi là **đoản mạch** (short-circuiting).

Thao tác đoản mạch khiến các thao tác trung gian chỉ được xử lý tới khi tạo ra được kết quả.

Nhờ vậy, do các thao tác lười biếng và đoản mạch, stream không thực thi mọi thao tác trên mọi phần tử. Thay vào đó, các phần tử của stream đi qua một pipeline thao tác cho tới điểm mà kết quả suy ra được hoặc sinh ra được.

Bạn xem đoản mạch như một phân loại con. Chỉ có một thao tác trung gian đoản mạch:

```java
Stream<T> limit(long maxSize)
```

Vì nó không cần xử lý mọi phần tử của stream để tạo ra một stream có kích thước cho trước.

Số còn lại đều là thao tác kết thúc:

```java
boolean anyMatch(Predicate<? super T> predicate)
boolean allMatch(Predicate<? super T> predicate)
boolean noneMatch(Predicate<? super T> predicate)
Optional<T> findFirst()
Optional<T> findAny()
```

Vì ngay khi tìm được một phần tử khớp, không cần tiếp tục xử lý stream nữa.

## Primitive stream

Phần lớn thời gian, ta dùng `Stream<T>` chứa object làm phần tử. Tuy nhiên, cũng có những stream chuyên biệt để xử lý kiểu nguyên thuỷ như `int`, `long` và `double`, cho phép bạn tránh chi phí tự động boxing và unboxing phần tử thành wrapper class. Những primitive stream này là `IntStream`, `LongStream` và `DoubleStream`.

Mỗi primitive stream có những method tương tự các method trong class `Stream` thông thường, như `map()` (biến đổi phần tử), `filter()` (chọn phần tử theo predicate), `reduce()` (tổng hợp phần tử), v.v. Nhưng vì chúng chỉ xử lý được kiểu nguyên thuỷ tương ứng, còn có những method chuyên biệt để làm việc với chúng. Hãy xem những method quan trọng nhất.

Method `average()` trả về một `OptionalDouble` chứa trung bình cộng của các phần tử, hoặc một `OptionalDouble` rỗng nếu primitive stream rỗng:

```java
IntStream stream = IntStream.range(1, 10);
OptionalDouble ave = stream.average();
System.out.println(ave.getAsDouble());
```

Đoạn mã này in ra trung bình của các số từ 1 tới 9 (không bao gồm 10):
```
5.0
```

Nếu bạn cần chuyển primitive stream thành stream object thông thường, dùng method `boxed()`:
```java
Stream<Double> boxed = DoubleStream.of(1.2, 2.4).boxed();
```

Để tìm giá trị lớn nhất trong primitive stream, dùng `max()`:
```java
IntStream stream = IntStream.of(1, 10, 2, 20);
OptionalInt max = stream.max();
System.out.println(max.getAsInt());
```

Đoạn này in:
```
20
```

Mỗi primitive stream có method `max()` riêng trả về kiểu `Optional` tương ứng (`OptionalInt`, `OptionalLong`, `OptionalDouble`). Điều tương tự với `min()`.

Một đặc điểm riêng của `IntStream` và `LongStream` là chúng có method đặc biệt `range()` và `rangeClosed()` để sinh dãy số trong một khoảng.

`range(int a, int b)` tạo một `IntStream` gồm các giá trị từ `a` (bao gồm) tới `b` (không bao gồm). `rangeClosed(int a, int b)` làm điều tương tự nhưng bao gồm cả `b`:
```java
IntStream stream = IntStream.range(1, 5);
stream.forEach(System.out::println);
```

Đoạn này in:
```
1
2
3
4
```

Trong khi:
```java
LongStream stream = LongStream.rangeClosed(1, 5);
stream.forEach(System.out::println);
```

In ra:
```
1
2
3
4
5
```

Lưu ý rằng `DoubleStream` **không** có method `range()` hay `rangeClosed()`.

Method `sum()` trả về tổng của tất cả phần tử:
```java
IntStream stream = IntStream.of(1, 10, 2, 20);
int sum = stream.sum();
System.out.println(sum);
```

Đoạn này in:
```
33
```

Một lần nữa, mỗi primitive stream có method `sum()` riêng trả về kết quả kiểu nguyên thuỷ (`int`, `long`, `double`).

Cuối cùng, mỗi primitive stream có method `summaryStatistics()` trả về bản tóm tắt thống kê của các phần tử. Hãy xem ví dụ với `IntStream`:

```java
IntStream stream = IntStream.of(1, 10, 2, 20);
IntSummaryStatistics stats = stream.summaryStatistics();
System.out.println(stats);
```

Đoạn này in:
```
IntSummaryStatistics{count=4, sum=33, min=1, average=8.250000, max=20}
```

`LongStream` và `DoubleStream` có class tương tự là `LongSummaryStatistics` và `DoubleSummaryStatistics`.

Những object thống kê tóm tắt này cung cấp method để lấy riêng từng chỉ số (`getCount()`, `getSum()`, `getMin()`, `getAverage()`, `getMax()`).

Nếu bạn cần thống kê nâng cao hơn, bạn dùng được một `Collector` cùng method `summarizingInt()`, `summarizingLong()` hoặc `summarizingDouble()` làm đối số:

```java
List<Integer> list = List.of(1, 10, 2, 20);
IntSummaryStatistics stats = list.stream()
        .collect(Collectors.summarizingInt(i -> i));
System.out.println(stats);  
```

Đoạn này in:
```
IntSummaryStatistics{count=4, sum=33, min=1, average=8.250000, max=20}
```

Giờ hãy bàn kỹ hơn về một số thao tác stream phổ biến nhất.

## Lọc stream

Lọc là một trong những thao tác phổ biến nhất khi làm việc với stream trong Java. Nó cho phép bạn chỉ chọn những phần tử thoả mãn một predicate cho trước, bỏ đi phần còn lại. Method `filter()` được dùng cho mục đích này:

```java
Stream<T> filter(Predicate<? super T> predicate);
```

Method `filter()` nhận một functional interface `Predicate` làm đối số. `Predicate` là hàm nhận một phần tử và trả về `boolean`. Chỉ những phần tử mà predicate trả về `true` mới được đưa vào stream kết quả.

Hãy xem ví dụ đơn giản:
```java
List<Integer> list = List.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
List<Integer> evenList = list.stream()
        .filter(i -> i % 2 == 0)
        .collect(Collectors.toList());
System.out.println(evenList);
```

Đoạn mã này lọc danh sách gốc, chỉ giữ lại số chẵn. Nó in:
```
[2, 4, 6, 8, 10]
```

Bạn nối chuỗi được nhiều lời gọi `filter()` để áp dụng vài điều kiện:
```java
List<Integer> list = List.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
List<Integer> filteredList = list.stream()
        .filter(i -> i > 3)
        .filter(i -> i < 8)
        .collect(Collectors.toList());
System.out.println(filteredList);
```

Đoạn này chọn những số lớn hơn 3 và nhỏ hơn 8:
```
[4, 5, 6, 7]
```

Interface `Predicate` cũng có những default method cho phép bạn kết hợp predicate bằng phép logic:
- `default Predicate<T> and(Predicate<? super T> other)`
- `default Predicate<T> or(Predicate<? super T> other)` 
- `default Predicate<T> negate()`

Ví dụ, để lấy những số lớn hơn 3 và nhỏ hơn 8, bạn cũng làm được:
```java
List<Integer> list = List.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
List<Integer> filteredList = list.stream()
        .filter(i -> i > 3 && i < 8)
        .collect(Collectors.toList());
```

Hoặc dùng method của `Predicate`:
```java
Predicate<Integer> greaterThan3 = i -> i > 3;
Predicate<Integer> lessThan8 = i -> i < 8;
List<Integer> filteredList = list.stream()
        .filter(greaterThan3.and(lessThan8))
        .collect(Collectors.toList());
```

Method `filter()` là stateless, nghĩa là việc thực thi predicate cho một phần tử không ảnh hưởng tới việc thực thi cho phần tử khác.

Một method rất hữu ích liên quan tới `filter()` là `distinct()`:
```java
Stream<T> distinct();
```

Method này trả về stream gồm những phần tử duy nhất, loại bỏ trùng lặp:
```java
List<Integer> list = List.of(1, 2, 2, 3, 4, 4, 5);
List<Integer> distinctList = list.stream()
        .distinct()
        .collect(Collectors.toList());
System.out.println(distinctList);
```

Đoạn này in:
```
[1, 2, 3, 4, 5]
```

Bạn xem `distinct()` như một thao tác lọc đặc biệt.

Cuối cùng, có hai method khác tương tự `filter()` nhưng phục vụ mục đích khác:
- `default Stream<T> takeWhile(Predicate<? super T> predicate)`
- `default Stream<T> dropWhile(Predicate<? super T> predicate)`

`takeWhile()` trả về stream chứa đoạn đầu dài nhất gồm những phần tử lấy từ stream gốc mà khớp predicate cho trước.
```java
List<Integer> list = List.of(2, 4, 6, 7, 8, 10, 11);
List<Integer> prefixList = list.stream()
        .takeWhile(i -> i % 2 == 0)
        .collect(Collectors.toList());
System.out.println(prefixList);
```

Đoạn này chọn những số chẵn từ đầu stream cho tới khi gặp số lẻ đầu tiên (7):
```
[2, 4, 6]
```

Ngược lại là `dropWhile()`, bỏ đi đoạn đầu dài nhất gồm những phần tử thoả mãn predicate và trả về stream chứa phần còn lại:
```java
List<Integer> list = List.of(2, 4, 6, 7, 8, 10, 11);
List<Integer> postfixList = list.stream()
        .dropWhile(i -> i % 2 == 0)
        .collect(Collectors.toList());
System.out.println(postfixList);
```

Đoạn này bỏ những số chẵn ở đầu và trả về phần còn lại của stream:
```
[7, 8, 10, 11]
```

Cần lưu ý rằng predicate dùng trong `takeWhile()` và `dropWhile()` phải là stateless. Việc thực thi cho một phần tử không được ảnh hưởng tới việc thực thi cho phần tử khác, nếu không kết quả sẽ khó đoán.

## Ánh xạ stream

Khi làm việc với stream, ta thường cần biến đổi phần tử từ kiểu này sang kiểu khác hoặc trích một số dữ liệu từ chúng. Đây là lúc thao tác `map()` và `flatMap()` phát huy tác dụng.

Method `map()` áp dụng một hàm lên từng phần tử của stream, biến nó thành phần tử mới. Nó như một cỗ máy nhận vào nguyên liệu thô (phần tử gốc) và cho ra sản phẩm tinh chế (phần tử đã biến đổi).

```java
<R> Stream<R> map(Function<? super T, ? extends R> mapper);
```

Method `map()` nhận một `Function` làm đối số — interface biểu diễn hàm nhận một đối số và trả về kết quả. Ở đây, nó nhận phần tử kiểu `T` và trả về phần tử kiểu `R`.

Đây là ví dụ:
```java
List<String> list = List.of("1", "2", "3", "4", "5");
List<Integer> intList = list.stream()
        .map(Integer::parseInt)
        .collect(Collectors.toList());
System.out.println(intList);
```

Đoạn mã này chuyển danh sách chuỗi thành danh sách số nguyên bằng method `parseInt` của class `Integer`. Nó in:
```
[1, 2, 3, 4, 5]
```

Bạn nối chuỗi được nhiều thao tác `map()` để thực hiện các phép biến đổi liên tiếp:
```java
List<String> list = List.of("1", "2", "3", "4", "5");
List<Integer> doubledList = list.stream()
        .map(Integer::parseInt)
        .map(i -> i * 2)
        .collect(Collectors.toList());
System.out.println(doubledList);
```

Đoạn này trước hết chuyển chuỗi thành số nguyên rồi nhân đôi từng số:
```
[2, 4, 6, 8, 10]
```

Vậy nếu thay vì biến đổi từng phần tử, bạn muốn trích **nhiều** phần tử từ mỗi phần tử thì sao? Đây là lúc `flatMap()` xuất hiện.

`flatMap()` như một cỗ máy nhận vào những thùng chứa đầy nguyên liệu thô, mở từng thùng, xử lý nguyên liệu, rồi cho ra sản phẩm tinh chế trong một stream duy nhất.

```java
<R> Stream<R> flatMap(Function<? super T, ? extends Stream<? extends R>> mapper);
```

Method `flatMap()` nhận một hàm trả về một stream cho mỗi phần tử. Sau đó nó làm phẳng tất cả những stream này thành một stream duy nhất.

Một tình huống dùng phổ biến là khi bạn có stream các danh sách và muốn xử lý phần tử của tất cả danh sách như một stream duy nhất:

```java
List<List<Integer>> listOfLists = List.of(
        List.of(1, 2, 3),
        List.of(4, 5, 6),
        List.of(7, 8, 9)
);
List<Integer> flattenedList = listOfLists.stream()
        .flatMap(List::stream)
        .collect(Collectors.toList());
System.out.println(flattenedList);
```

Đoạn mã này làm phẳng danh sách của các danh sách thành một danh sách duy nhất:
```
[1, 2, 3, 4, 5, 6, 7, 8, 9]
```

Khi làm việc với primitive stream, có những thao tác ánh xạ chuyên biệt để tránh chi phí boxing và unboxing:
- `IntStream mapToInt(ToIntFunction<? super T> mapper)`
- `LongStream mapToLong(ToLongFunction<? super T> mapper)`
- `DoubleStream mapToDouble(ToDoubleFunction<? super T> mapper)`

Những method này lần lượt nhận `ToIntFunction`, `ToLongFunction` và `ToDoubleFunction`, rồi trả về `IntStream`, `LongStream` và `DoubleStream`.

```java
List<String> list = List.of("1", "2", "3", "4", "5");
IntStream intStream = list.stream()
        .mapToInt(Integer::parseInt);
intStream.forEach(System.out::println);
```

Đoạn mã này chuyển stream chuỗi thành `IntStream` và in từng phần tử:
```
1
2
3
4
5
```

Bạn cũng ánh xạ được từ kiểu nguyên thuỷ này sang kiểu nguyên thuỷ khác:
```java
IntStream intStream = IntStream.range(1, 6);
DoubleStream doubleStream = intStream.mapToDouble(i -> i / 2.0);
doubleStream.forEach(System.out::println);
```

Đoạn này chuyển một `IntStream` thành `DoubleStream`, chia mỗi số cho 2:
```
0.5
1.0
1.5
2.0
2.5
```

## Phân rã stream

Khi làm việc với stream, đôi khi ta cần chia nhỏ chúng, phân tích phần tử, hoặc kết hợp chúng theo cách nào đó. Đây là điều ta gọi là phân rã stream, và có vài thao tác cho phép làm việc này.

Trước hết, hãy nói về `skip()` và `limit()`. Những method này cho phép ta cắt stream thành từng phần, bỏ đi một số phần tử và giữ lại số khác.

`skip(long n)` trả về stream đã bỏ đi `n` phần tử đầu của stream gốc. Nó như cắt bỏ phần trên của một khúc gỗ.

Đây là ví dụ:
```java
List<Integer> list = List.of(1, 2, 3, 4, 5);
List<Integer> skippedList = list.stream()
        .skip(2)
        .collect(Collectors.toList());
System.out.println(skippedList);
```

Đoạn này bỏ hai phần tử đầu và thu phần còn lại vào danh sách mới:
```
[3, 4, 5]
```

Ngược lại, `limit(long maxSize)` trả về stream đã cắt bớt stream gốc để không dài quá `maxSize`. Nó như cắt bỏ phần dưới của khúc gỗ.

Đây là ví dụ:
```java
List<Integer> list = List.of(1, 2, 3, 4, 5);
List<Integer> limitedList = list.stream()
        .limit(3)
        .collect(Collectors.toList());
System.out.println(limitedList);
```

Đoạn này chỉ giữ ba phần tử đầu và bỏ phần còn lại:
```
[1, 2, 3]
```

Bạn kết hợp được `skip()` và `limit()` để trích ra một stream con:
```java
List<Integer> list = List.of(1, 2, 3, 4, 5);
List<Integer> subList = list.stream()
        .skip(1)
        .limit(3)
        .collect(Collectors.toList());
System.out.println(subList);
```

Đoạn này bỏ phần tử đầu rồi lấy ba phần tử kế tiếp:
```
[2, 3, 4]
```

Giờ hãy nói về `forEach()` và `forEachOrdered()`. Những method này cho phép ta thực hiện một hành động trên từng phần tử của stream.

`forEach(Consumer action)` thực hiện hành động cho trước trên từng phần tử. Thứ tự xử lý không được đảm bảo là thứ tự duyệt nếu stream là stream song song.

```java
List<Integer> list = List.of(1, 2, 3, 4, 5);
list.stream()
    .forEach(System.out::println);
```

Đoạn này in từng phần tử của stream:
```
1
2
3
4
5
```

`forEachOrdered(Consumer action)` tương tự, nhưng nó đảm bảo hành động được thực hiện trên các phần tử theo đúng thứ tự duyệt của stream, kể cả khi đó là stream song song:

```java
List<Integer> list = List.of(1, 2, 3, 4, 5);
list.stream()
    .forEachOrdered(System.out::println);
```

Đoạn này cũng in từng phần tử, nhưng đảm bảo thứ tự:
```
1
2
3
4
5
```

Method `allMatch()`, `anyMatch()` và `noneMatch()` cho phép ta kiểm tra một số điều kiện có đúng với các phần tử của stream không.

`allMatch(Predicate predicate)` trả về `true` nếu **mọi** phần tử thoả predicate, ngược lại trả về `false`:

```java
List<Integer> list = List.of(2, 4, 6, 8, 10);
boolean allEven = list.stream()
        .allMatch(i -> i % 2 == 0);
System.out.println(allEven);
```

Ví dụ trên kiểm tra mọi phần tử có phải số chẵn không:
```
true
```

`anyMatch(Predicate predicate)` trả về `true` nếu **có** phần tử nào thoả predicate, ngược lại trả về `false`:

```java
List<Integer> list = List.of(1, 2, 3, 4, 5);
boolean anyEven = list.stream()
        .anyMatch(i -> i % 2 == 0);
System.out.println(anyEven);
```

Đoạn này kiểm tra có phần tử nào là số chẵn không:
```
true
```

`noneMatch(Predicate predicate)` trả về `true` nếu **không** phần tử nào thoả predicate, ngược lại trả về `false`:

```java
List<Integer> list = List.of(1, 3, 5, 7, 9);
boolean noneEven = list.stream()
        .noneMatch(i -> i % 2 == 0);
System.out.println(noneEven);
```

Đoạn này kiểm tra không phần tử nào là số chẵn:
```
true
```

Method `findFirst()` và `findAny()` trả về một phần tử của stream, nếu có.

`findFirst()` trả về một `Optional` mô tả phần tử đầu tiên của stream, hoặc `Optional` rỗng nếu stream rỗng:

```java
List<Integer> list = List.of(1, 2, 3, 4, 5);
Optional<Integer> firstElem = list.stream()
        .findFirst();
System.out.println(firstElem.get());
```

Đoạn này tìm và in phần tử đầu tiên:
```
1
```

`findAny()` trả về một `Optional` mô tả một phần tử nào đó của stream, hoặc `Optional` rỗng nếu stream rỗng. Với stream song song, nó hữu ích khi bạn không quan tâm phần tử cụ thể nào, chỉ cần có một phần tử tồn tại:

```java
List<Integer> list = List.of(1, 2, 3, 4, 5);
Optional<Integer> anyElem = list.parallelStream()
        .findAny();
System.out.println(anyElem.get());
```

Ví dụ trên tìm và in một phần tử bất kỳ (phần tử cụ thể không được đảm bảo do xử lý song song):
```
3
```

## Nối stream

Đôi khi khi làm việc với stream, ta cần kết hợp chúng, gộp các phần tử vào một stream duy nhất. Đây là điều ta gọi là nối stream, và có vài cách để làm điều này trong Java.

Cách trực tiếp nhất để nối stream là dùng method `concat()`. Static method này nhận hai stream làm đầu vào và trả về một stream mới là phần nối của hai stream đầu vào:

```java
static <T> Stream<T> concat(Stream<? extends T> a, Stream<? extends T> b)
```

Nó như nối hai ống nước, để nước (các phần tử) chảy từ ống này sang ống kia.

Hãy xem ví dụ:
```java
Stream<Integer> stream1 = Stream.of(1, 2, 3);
Stream<Integer> stream2 = Stream.of(4, 5, 6);
Stream<Integer> concatenated = Stream.concat(stream1, stream2);
concatenated.forEach(System.out::println);
```

Đoạn này nối `stream1` và `stream2`, rồi in các phần tử của stream kết quả:
```
1
2
3
4
5
6
```

Cần lưu ý rằng `concat()` là static method và không sửa đổi các stream gốc. Thay vào đó, nó tạo một stream mới lấy phần tử một cách lười biếng từ stream thứ nhất rồi tới stream thứ hai khi được yêu cầu.

Cũng nhớ rằng bạn chỉ nối được những stream cùng kiểu. Nếu bạn cố nối stream khác kiểu, bạn sẽ gặp lỗi biên dịch.

Một cách khác để nối stream là dùng method `flatMap()` kết hợp với `Stream.of()`.

`Stream.of()` tạo một stream từ số lượng đối số tuỳ ý. Bạn truyền những stream cần nối làm đối số cho `Stream.of()`, rồi dùng `flatMap()` để làm phẳng stream của các stream thành một stream duy nhất:

```java
Stream<Integer> stream1 = Stream.of(1, 2, 3);
Stream<Integer> stream2 = Stream.of(4, 5, 6);
Stream<Integer> concatenated = Stream.of(stream1, stream2)
        .flatMap(stream -> stream);
concatenated.forEach(System.out::println);
```
Đoạn mã này làm giống ví dụ trước, nhưng dùng `flatMap()` và `Stream.of()`.

Cách này dài dòng hơn dùng trực tiếp `concat()`, nhưng lại tiện khi bạn có cả một collection các stream cần nối.

Ví dụ, giả sử bạn có danh sách các stream:
```java
List<Stream<Integer>> listOfStreams = List.of(
        Stream.of(1, 2, 3),
        Stream.of(4, 5, 6),
        Stream.of(7, 8, 9)
);
```

Bạn nối được tất cả những stream này thành một bằng `flatMap()` và `Stream.of()`:
```java
Stream<Integer> concatenated = listOfStreams.stream()
        .flatMap(stream -> stream);
concatenated.forEach(System.out::println);
```

Đoạn này in:
```
1
2
3
4
5
6
7
8
9
```

Ở đây, trước hết ta tạo một stream từ `List` các stream bằng method `stream()`. Sau đó ta dùng `flatMap()` để làm phẳng stream của các stream này thành một stream duy nhất.

Nó như có một mớ ống nước và nối tất cả lại thành một ống lớn.

Tuy nhiên, một điều cần nhớ khi nối stream là thứ tự duyệt. Stream kết quả sẽ có các phần tử của stream thứ nhất, tiếp đó là phần tử của stream thứ hai, và cứ thế, theo đúng thứ tự chúng được nối.

## Rút gọn stream

Khi làm việc với stream, ta thường cần kết hợp các phần tử theo cách nào đó để tạo ra một kết quả duy nhất. Đây là điều ta gọi là **rút gọn** (reduce) một stream, và nó là một trong những thao tác mạnh nhất của Java Streams API.

Thao tác `reduce()` cho phép ta thực hiện phép rút gọn trên các phần tử của stream, dùng một hàm tích luỹ có tính kết hợp. Nó như nấu một món ăn:

1. Bạn bắt đầu với một mớ nguyên liệu thô (các phần tử của stream).

2. Bạn áp dụng một công thức (hàm tích luỹ) để kết hợp chúng.

3. Bạn kết thúc với một món ăn hoàn chỉnh (kết quả của phép rút gọn).

Method `reduce()` có ba dạng:
```java
Optional<T> reduce(BinaryOperator<T> accumulator)

T reduce(T identity, BinaryOperator<T> accumulator)

<U> U reduce(U identity, BiFunction<U, ? super T, U> accumulator, BinaryOperator<U> combiner)
```

Hãy bắt đầu với dạng thứ nhất. Dạng `reduce()` này nhận một tham số duy nhất: hàm tích luỹ. Đây là một `BinaryOperator`, nghĩa là hàm nhận hai phần tử của stream và kết hợp chúng thành một.

Ví dụ, giả sử ta có stream các số nguyên và muốn tìm tổng của chúng:
```java
Stream<Integer> stream = Stream.of(1, 2, 3, 4, 5);
Optional<Integer> sum = stream.reduce((a, b) -> a + b);
System.out.println(sum.get());
```

Đoạn này in:
```
15
```

Ở đây, hàm tích luỹ `(a, b) -> a + b` nhận hai số nguyên và trả về tổng của chúng. Thao tác `reduce()` áp dụng hàm này lên các phần tử của stream, hai phần tử một lần, cho tới khi mọi phần tử được xử lý và thu về một kết quả duy nhất.

Cần lưu ý rằng dạng `reduce()` này trả về một `Optional`. Lý do là stream có thể rỗng, khi đó không có phần tử nào để rút gọn và do đó không có kết quả để trả về. `Optional` cho phép ta xử lý trường hợp này một cách mềm mại.

Dạng thứ hai của `reduce()` nhận hai tham số: một giá trị đơn vị (identity) và hàm tích luỹ.

Giá trị đơn vị là điểm khởi đầu của phép rút gọn, đồng thời là giá trị được trả về nếu stream rỗng. Nó như nguyên liệu nền trong phép so sánh nấu ăn của ta.

```java
Stream<Integer> stream = Stream.of(1, 2, 3, 4, 5);
Integer sum = stream.reduce(0, (a, b) -> a + b);
System.out.println(sum);
```

Đoạn này cũng in:
```
15
```

Nhưng trong trường hợp này, ta bắt đầu phép rút gọn với 0, và nhận về một `Integer` thuần. Đây không phải `Optional` vì ngay cả khi stream rỗng, ta vẫn trả về được giá trị đơn vị.

Dạng thứ ba của `reduce()` phức tạp hơn chút. Nó nhận ba tham số: một giá trị đơn vị, một hàm tích luỹ, và một hàm kết hợp (combiner).

Giá trị đơn vị và hàm tích luỹ phục vụ cùng mục đích như ở dạng thứ hai. Hàm kết hợp được dùng để gộp kết quả của phép rút gọn khi stream được xử lý song song.

Dạng `reduce()` này hữu ích cho xử lý song song, đảm bảo phép rút gọn được thực hiện đúng trên nhiều thread.

Ví dụ, giả sử ta muốn nối một stream các chuỗi:
```java
Stream<String> stream = Stream.of("a", "b", "c", "d", "e");
String concatenated = stream.reduce("", (a, b) -> a + b, (a, b) -> a + b);
System.out.println(concatenated);
```

Đoạn này in:
```
abcde
```

Ở đây, giá trị đơn vị là chuỗi rỗng, hàm tích luỹ nối hai chuỗi, và hàm kết hợp cũng nối hai chuỗi.

Trong trường hợp này, hàm kết hợp là cần thiết để đảm bảo tính đúng đắn khi xử lý song song, dù phép nối chuỗi vốn có tính kết hợp.

Ví dụ, giả sử ta muốn tính tổng độ dài của một danh sách chuỗi, nhưng muốn ưu tiên những chuỗi bắt đầu bằng nguyên âm bằng cách nhân đôi độ dài của chúng:

```java
boolean startsWithVowel(String str) {
    return str.matches("^[AEIOUaeiou].*");
}

// ...

Stream<String> stream = Stream.of("apple", "banana", "orange", "grape", "pear");

int sumOfLengths = stream.reduce(0, 
    (sum, str) -> sum + (startsWithVowel(str) ? str.length() * 2 : str.length()), 
    Integer::sum);

System.out.println(sumOfLengths);
```

Đoạn mã này in:
```
37
```

Ở đây, giá trị đơn vị là 0, hàm tích luỹ cộng vào tổng đang chạy hoặc độ dài nhân đôi của chuỗi (nếu chuỗi bắt đầu bằng nguyên âm) hoặc độ dài thường của nó, còn hàm kết hợp cộng hai kết quả trung gian.

Trong ví dụ này, hàm kết hợp `Integer::sum` quan trọng để gộp đúng các tổng cục bộ khi stream được xử lý song song, đảm bảo kết quả cuối chính xác bất kể thứ tự xử lý.

## Thu thập kết quả

Sau khi xử lý stream, ta thường cần thu thập kết quả vào một cấu trúc dữ liệu để dùng tiếp. Đây là lúc thao tác `collect()` và class `Collectors` phát huy tác dụng.

### Dùng các collector cơ bản

Method `collect()` là thao tác kết thúc cho phép ta tích luỹ các phần tử của stream vào một collection hay cấu trúc dữ liệu khác. Nó nhận một `Collector`, thứ quy định cách các phần tử được thu thập.

Class `Collectors` cung cấp rất nhiều collector định sẵn cho những tình huống phổ biến. Ta đã dùng `Collectors.toList()` ở vài ví dụ trước; giờ hãy xem kỹ hơn một số collector này.

Những collector đơn giản nhất là `toList()` và `toSet()`, thu thập phần tử của stream lần lượt vào `List` hoặc `Set`:

```java
Stream<String> stream = Stream.of("cat", "dog", "elephant", "fox", "giraffe");
List<String> list = stream.collect(Collectors.toList());
System.out.println(list);
```

Ví dụ trên in:
```
[cat, dog, elephant, fox, giraffe]
```

Nếu bạn cần thu thập vào một loại collection cụ thể, dùng `toCollection()` và cung cấp một supplier cho collection đó:

```java
Stream<String> stream = Stream.of("cat", "dog", "elephant", "fox", "giraffe");
LinkedList<String> linkedList = stream.collect(Collectors.toCollection(LinkedList::new));
System.out.println(linkedList);
```

Đoạn này thu thập phần tử vào một `LinkedList`.

Collector `joining()` cho phép bạn nối các phần tử của stream thành một chuỗi duy nhất, tuỳ chọn kèm dấu phân tách, tiền tố và hậu tố:
```java
Stream<String> stream = Stream.of("cat", "dog", "elephant", "fox", "giraffe");
String joined = stream.collect(Collectors.joining(", "));
System.out.println(joined);
```

Đoạn này in:
```
cat, dog, elephant, fox, giraffe
```

Cũng có những collector để tính thống kê đơn giản trên stream số, như `counting()`, `summing()`, `averaging()` và `summarizing()`:
```java
Stream<Integer> stream1 = Stream.of(1, 2, 3, 4, 5);
long count = stream1.collect(Collectors.counting());
System.out.println(count);

Stream<Integer> stream2 = Stream.of(1, 2, 3, 4, 5);
double average = stream2.collect(Collectors.averagingInt(i -> i));
System.out.println(average);

Stream<Integer> stream3 = Stream.of(1, 2, 3, 4, 5);
int sum = stream3.collect(Collectors.summingInt(i -> i));
System.out.println(sum);

Stream<Integer> stream4 = Stream.of(1, 2, 3, 4, 5);
IntSummaryStatistics stats = stream4.collect(Collectors.summarizingInt(i -> i));
System.out.println(stats);
```

Kết quả là:
```
5
3.0
15
IntSummaryStatistics{count=5, sum=15, min=1, average=3.000000, max=5}
```

Những collector này có ba biến thể cho ba kiểu nguyên thuỷ: `int`, `long` và `double`.

Collector `maxBy()` và `minBy()` cho phép bạn tìm phần tử lớn nhất và nhỏ nhất theo một `Comparator` cho trước:
```java
Stream<String> stream = Stream.of("cat", "dog", "elephant", "fox", "giraffe");
Optional<String> max = stream.collect(Collectors.maxBy(Comparator.comparingInt(String::length)));
max.ifPresent(System.out::println);
```

Đoạn này in ra `"elephant"` — chuỗi dài nhất trong stream.

### Thu thập vào Map

Một trong những tính năng mạnh nhất của class `Collectors` là khả năng thu thập phần tử vào một `Map`.

Cách đơn giản nhất là dùng collector `toMap()`, nhận hai hàm: một để trích khoá từ mỗi phần tử, một để trích giá trị:
```java
Stream<String> stream = Stream.of("elephant", "fox", "giraffe");
Map<Integer, String> map = stream.collect(Collectors.toMap(String::length, s -> s));
System.out.println(map);
```

Đoạn này thu thập các chuỗi vào một map, dùng độ dài của chúng làm khoá:
```
{3=fox, 7=giraffe, 8=elephant}
```

Nếu có khoá trùng lặp, collector `toMap()` sẽ ném exception. Để xử lý, bạn cung cấp một hàm trộn (merge function) làm đối số thứ ba:
```java
Stream<String> stream = Stream.of("cat", "elephant", "fox", "giraffe");
Map<Integer, String> map = stream.collect(Collectors.toMap(String::length, s -> s, (s1, s2) -> s1 + "," + s2));
System.out.println(map);
```

Giờ nếu nhiều chuỗi có cùng độ dài, chúng sẽ được nối bằng dấu phẩy. Đây là kết quả của ví dụ trên:
```
{3=cat,fox, 7=giraffe, 8=elephant}
```

### Gom nhóm, phân hoạch, ánh xạ và teeing

Collector `groupingBy()` cho phép bạn gom nhóm các phần tử của stream theo một hàm phân loại:
```java
Stream<String> stream = Stream.of("cat", "dog", "elephant", "fox", "giraffe");
Map<Integer, List<String>> map = stream.collect(Collectors.groupingBy(String::length));
System.out.println(map);
```

Đoạn này gom nhóm các chuỗi theo độ dài:
```
{3=[cat, dog, fox], 7=[giraffe], 8=[elephant]}
```

Bạn cũng cung cấp được một downstream collector để quy định cách các nhóm được thu thập:
```java
Stream<String> stream = Stream.of("cat", "dog", "elephant", "fox", "giraffe");
Map<Integer, Set<String>> map = stream.collect(Collectors.groupingBy(String::length, Collectors.toSet()));
```

Đoạn này thu thập các nhóm vào `Set` thay vì `List`.

Collector `partitioningBy()` là trường hợp đặc biệt của `groupingBy()`, phân hoạch stream thành hai nhóm theo một predicate:
```java
Stream<String> stream = Stream.of("cat", "dog", "elephant", "fox", "giraffe");
Map<Boolean, List<String>> map = stream.collect(Collectors.partitioningBy(s -> s.length() > 5));
System.out.println(map);
```

Đoạn này phân hoạch các chuỗi thành nhóm dài hơn 5 ký tự và nhóm không dài hơn 5 ký tự. Đây là kết quả của ví dụ trên:
```
{false=[cat, dog, fox], true=[elephant, giraffe]}
```

Collector `mapping()` cho phép bạn áp dụng một hàm lên từng phần tử trước khi thu thập kết quả:
```java
Stream<String> stream = Stream.of("cat", "dog", "elephant", "fox", "giraffe");
List<Integer> list = stream.collect(Collectors.mapping(String::length, Collectors.toList()));
System.out.println(list);
```

Đoạn này thu thập độ dài của các chuỗi vào một danh sách. Kết quả là:
```
[3, 3, 8, 3, 7]
```

Cuối cùng, một collector mạnh mẽ và ít được biết tới hơn là `Collectors.teeing()`. Collector này cho phép bạn thực hiện hai thao tác thu thập riêng biệt trên cùng một stream rồi kết hợp kết quả của chúng bằng một hàm trộn. Nó đặc biệt hữu ích khi bạn cần thực hiện hai thao tác khác nhau trên cùng tập dữ liệu rồi gộp kết quả lại một cách có ý nghĩa.

Dạng chung của method `teeing()` như sau:
```java
public static <T, R1, R2, R> Collector<T, ?, R> teeing(
    Collector<? super T, A1, R1> downstream1,
    Collector<? super T, A2, R2> downstream2,
    BiFunction<? super R1, ? super R2, R> merger
)
```

Nó nhận ba đối số:
1. **downstream1**: Collector thứ nhất cần áp dụng.
2. **downstream2**: Collector thứ hai cần áp dụng.
3. **merger**: Hàm trộn kết quả của hai collector.

Ví dụ, giả sử bạn có một danh sách số nguyên và muốn tính cả tổng lẫn số lượng phần tử chỉ trong một lượt duyệt stream, rồi gộp hai kết quả này lại thành một.

Đây là cách làm:

```java
List<Integer> numbers = List.of(1, 2, 3, 4, 5);
var result = numbers.stream().collect(Collectors.teeing(
    Collectors.summingInt(Integer::intValue),  // First collector: Sum of the integers
    Collectors.counting(),                      // Second collector: Count of the integers
    (sum, count) -> String.format("Sum: %d, Count: %d", sum, count)  // Merger function
));

System.out.println(result);
```

Kết quả là:
```
Sum: 15, Count: 5
```

Như bạn thấy, collector này đơn giản hoá mã cho những tác vụ tổng hợp phức tạp bằng cách loại bỏ nhu cầu duyệt stream nhiều lượt. Bạn dùng được bất kỳ tổ hợp collector nào, và hàm trộn cho phép kết hợp kết quả một cách linh hoạt.

## Các điểm chính

- Class `Optional` dùng để bao gói một giá trị tuỳ chọn và tránh tham chiếu `null`. Nó cung cấp những method như `isPresent()`, `ifPresent()`, `get()`, `orElse()`, `orElseGet()` và `orElseThrow()` để làm việc với giá trị bên trong.

- Stream là lớp bọc cho collection hay mảng, cho phép biểu diễn thao tác bằng lambda. Chúng không lưu phần tử, bất biến, không tái sử dụng được, không hỗ trợ truy cập theo chỉ số, dễ song song hoá, và trì hoãn thực thi cho tới khi cần.

- Stream tạo được từ collection bằng `stream()`, từ giá trị riêng lẻ bằng `Stream.of()`, từ mảng bằng `Arrays.stream()`, và bằng những cách khác như `generate()`, `iterate()` và `range()`.

- Thao tác trung gian luôn trả về stream mới và có tính lười biếng, chỉ xử lý phần tử khi một thao tác kết thúc được gọi. Chúng có thể là stateless (như `filter()` và `map()`) hoặc stateful (như `distinct()` và `sorted()`).

- Thao tác kết thúc trả về thứ gì đó không phải stream và tiêu thụ pipeline stream. Chúng gồm `forEach()`, `count()`, `collect()`, `findFirst()`, `findAny()`, `anyMatch()`, `allMatch()` và `noneMatch()`.

- Primitive stream `IntStream`, `LongStream` và `DoubleStream` tránh chi phí boxing/unboxing. Chúng có những method như `average()`, `max()`, `min()`, `sum()`, `range()` và `summaryStatistics()`.

- Thao tác đoản mạch như `limit()`, `findFirst()` và `anyMatch()` cho phép stream tránh xử lý mọi phần tử bằng cách tạo ra kết quả ngay khi đã xử lý đủ phần tử.

- Method `filter()` dùng để chỉ chọn những phần tử của stream thoả mãn predicate cho trước. Nó trả về stream mới chỉ chứa những phần tử đã lọc.

- Method `distinct()` trả về stream gồm những phần tử duy nhất, loại bỏ trùng lặp. Nó có thể xem như một thao tác lọc đặc biệt.

- Method `takeWhile()` trả về stream chứa đoạn đầu dài nhất gồm những phần tử khớp predicate cho trước, còn `dropWhile()` bỏ đoạn đầu này và trả về những phần tử còn lại.

- Method `map()` biến đổi từng phần tử của stream thành phần tử mới bằng cách áp dụng một hàm. Nó trả về stream mới gồm những phần tử đã biến đổi.

- Method `flatMap()` dùng để làm phẳng một stream các collection thành một stream phần tử duy nhất. Nó áp dụng một hàm trả về stream lên từng phần tử, rồi làm phẳng tất cả những stream đó thành một.

- Primitive stream (`IntStream`, `LongStream`, `DoubleStream`) có những thao tác ánh xạ chuyên biệt để tránh chi phí boxing và unboxing.

- Method `skip()` bỏ đi n phần tử đầu của stream, còn `limit()` cắt stream để không dài quá kích thước đã nêu.

- Method `forEach()` thực hiện một hành động trên từng phần tử của stream, còn `forEachOrdered()` làm điều tương tự nhưng đảm bảo thứ tự xử lý với stream song song.

- Method `allMatch()`, `anyMatch()` và `noneMatch()` kiểm tra một số điều kiện có đúng với các phần tử của stream không.

- Method `findFirst()` trả về phần tử đầu tiên của stream, còn `findAny()` trả về một phần tử bất kỳ (hữu ích với stream song song).

- Method `concat()` nối hai stream thành một stream duy nhất. Cách khác, `flatMap()` dùng được cùng `Stream.of()` để nối nhiều stream.

- Method `reduce()` thực hiện phép rút gọn trên các phần tử của stream bằng một hàm tích luỹ có tính kết hợp. Nó trả về kết quả kiểu `Optional`, hoặc nhận một giá trị đơn vị để trả về kết quả không phải Optional.

- Method `collect()` dùng để tích luỹ các phần tử của stream vào một collection hay cấu trúc dữ liệu khác, dùng một `Collector` để quy định cách thu thập.

- Class `Collectors` cung cấp nhiều collector định sẵn, gồm `toList()`, `toSet()`, `toMap()`, `joining()`, `counting()`, `summing()`, `averaging()`, `maxBy()`, `minBy()`, `groupingBy()`, `partitioningBy()`, `mapping()` và `teeing()`.

## Câu hỏi luyện tập

**1. Dòng mã nào sau đây minh hoạ việc dùng class `Optional` để xử lý một giá trị có thể `null` nhằm tránh exception?**

```java
import java.util.Optional;

public class Main {
    public static void main(String[] args) {
        String value = getValue();
        // Insert code here
    }
    
    public static String getValue() {
        return null; // This method may return null
    }
}
```

**A)** `Optional<String> optional = new Optional<>(value);`  
**B)** `Optional<String> optional = Optional.of(value);`  
**C)** `Optional<String> optional = Optional.ofNullable(value);`  
**D)** `Optional<String> optional = Optional.empty(value);`  
**E)** `Optional<String> optional = Optional.nullable(value);`


**2. Dòng mã nào sau đây minh hoạ đúng việc dùng một thao tác kết thúc?**

```java
List<String> list = List.of("apple", "banana", "cherry", "date");

Stream<String> stream = list.stream()
                            .filter(s -> s.length() > 5)
                            .peek(System.out::println)
                            .map(String::toUpperCase);

// Insert terminal operation here
```

**A)** `stream.filter(s -> s.contains("A"));`  
**B)** `stream.map(String::toLowerCase);`  
**C)** `stream.distinct();`  
**D)** `stream.limit(2);`  
**E)** `stream.collect(Collectors.toList());`


**3. Dòng mã nào sau đây dùng đúng primitive stream để tính tổng của một mảng số nguyên?**

```java
int[] numbers = {1, 2, 3, 4, 5};

// Insert code here to calculate sum
```

**A)** `int sum = numbers.stream().sum();`  
**B)** `int sum = IntStream.range(0, numbers.length).sum();`  
**C)** `int sum = IntStream.from(numbers).sum();`  
**D)** `int sum = IntStream.of(numbers).sum();`  
**E)** `int sum = IntStream.range(numbers).sum();`


**4. Dòng mã nào sau đây lọc đúng một stream để chỉ giữ những chuỗi có độ dài lớn hơn 3?**

```java
List<String> list = List.of("one", "two", "three", "four");

Stream<String> stream = list.stream();

// Insert code here to filter the stream
```

**A)** `Stream<String> filteredStream = stream.filter(s -> s.length() > 3);`  
**B)** `Stream<String> filteredStream = stream.map(s -> s.length() > 3);`  
**C)** `Stream<String> filteredStream = stream.collect(Collectors.filtering(s -> s.length() > 3));`  
**D)** `Stream<String> filteredStream = stream.filtering(s -> s.length() > 3);`  
**E)** `Stream<String> filteredStream = stream.filterByLength(3);`


**5. Dòng mã nào sau đây ánh xạ đúng một stream các chuỗi thành độ dài của chúng?**

```java
List<String> list = List.of("apple", "banana", "cherry", "date");

Stream<String> stream = list.stream();

// Insert code here to map the stream
```

**A)** `Stream<String> lengthStream = stream.map(s -> s.length());`  
**B)** `Stream<String> lengthStream = stream.mapToInt(s -> s.length());`  
**C)** `Stream<Integer> lengthStream = stream.map(s -> s.length());`  
**D)** `IntStream lengthStream = stream.map(s -> s.length());`  
**E)** `Stream<String> lengthStream = stream.flatMap(s -> Stream.of(s.length()));`


**6. Dòng mã nào sau đây giới hạn stream còn 3 phần tử đầu sau khi đã bỏ qua 2 phần tử đầu tiên?**

```java
List<String> list = List.of("one", "two", "three", "four", "five", "six");

Stream<String> stream = list.stream();

// Insert code here to skip and limit the stream
```

**A)** `Stream<String> resultStream = stream.skip(2).limit(3);`  
**B)** `Stream<String> resultStream = stream.limit(3).skip(2);`  
**C)** `Stream<String> resultStream = stream.skip(3).limit(2);`  
**D)** `Stream<String> resultStream = stream.limit(2).skip(3);`  
**E)** `Stream<String> resultStream = stream.slice(2, 5);`


**7. Dòng mã nào sau đây nối đúng hai stream?**

```java
Stream<String> stream1 = list1.stream();
Stream<String> stream2 = list2.stream();

// Insert code here to concatenate the streams
```

**A)** `Stream<String> resultStream = Stream.concat(stream1, stream2.collect(Collectors.toList()));`  
**B)** `Stream<String> resultStream = Stream.concat(stream1, stream2);`  
**C)** `Stream<String> resultStream = stream1.concat(stream2);`  
**D)** `Stream<String> resultStream = stream1.merge(stream2);`  
**E)** `Stream<String> resultStream = Stream.of(stream1, stream2);`


**8. Dòng mã nào sau đây dùng method `reduce` để tính đúng tích của mọi phần tử trong một stream số nguyên?**

```java
List<Integer> numbers = List.of(1, 2, 3, 4, 5);

Stream<Integer> stream = numbers.stream();

// Insert code here to calculate the product
```

**A)** `int product = stream.reduce(1, (a, b) -> a + b);`  
**B)** `int product = stream.reduce((a, b) -> a * b);`  
**C)** `int product = stream.reduce(0, (a, b) -> a * b);`  
**D)** `Optional<Integer> product = stream.reduce(1, (a, b) -> a * b);`  
**E)** `int product = stream.reduce(1, (a, b) -> a * b, (a, b) -> a * b);`


**9. Dòng mã nào sau đây thu thập đúng các phần tử của stream vào một `Set` đồng thời đảm bảo giữ nguyên thứ tự ban đầu của phần tử?**

```java
List<String> list = List.of("apple", "banana", "cherry", "date");

Stream<String> stream = list.stream();

// Insert code here to collect the elements into a Set while maintaining order
```

**A)** `Set<String> resultSet = stream.collect(Collectors.toSet());`  
**B)** `Set<String> resultSet = stream.collect(Collectors.toCollection(LinkedHashSet::new));`  
**C)** `Set<String> resultSet = stream.collect(Collectors.toCollection(TreeSet::new));`  
**D)** `Set<String> resultSet = stream.collect(Collectors.toList());`  
**E)** `Set<String> resultSet = stream.collect(Collectors.toMap());`
