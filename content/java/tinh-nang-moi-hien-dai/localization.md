---
layout: chapter

title: "Chương 14: Localization"
subtitle: "Localization"
exam_objectives:
  - "Cài đặt localization bằng locale và resource bundle. Parse và định dạng thông điệp, ngày, giờ và số, bao gồm cả giá trị tiền tệ và phần trăm."

previous_link: "/ch13.html"
previous_title: "Java Platform Module System"
answers_link: "/ch14a.html"

description: "Locale và Locale.Category, resource bundle, MessageFormat, NumberFormat, DecimalFormat, CompactNumberFormat và DateTimeFormatter bản địa hoá trong Java 21."
order: 3
phase: "Chương 14"
tags: [Java, OCP, Localization, Locale, ResourceBundle, MessageFormat, NumberFormat, DateTimeFormatter]
---

## Nội dung chương

- [Giới thiệu về Localization](#heading-giới-thiệu-về-localization)
- [Class `Locale`](#heading-class-locale)
    - [Các category của Locale](#heading-các-category-của-locale)
- [Resource bundle](#heading-resource-bundle)
- [Class `MessageFormat`](#heading-class-messageformat)
- [Class `NumberFormat`](#heading-class-numberformat)
    - [Class `DecimalFormat`](#heading-class-decimalformat)
    - [Class `CompactNumberFormat`](#heading-class-compactnumberformat)
- [Class `DateTimeFormatter`](#heading-class-datetimeformatter)
- [Các điểm chính](#heading-các-điểm-chính)
- [Câu hỏi luyện tập](#heading-câu-hỏi-luyện-tập)

---
## Giới thiệu về Localization
Chuyện thường thấy là các ứng dụng phần mềm được dùng bởi người dùng khắp thế giới, nói những ngôn ngữ khác nhau và sống ở nhiều quốc gia, nền văn hoá khác nhau. Để một ứng dụng dễ tiếp cận và thân thiện trên toàn cầu, nó cần thích ứng với ngôn ngữ và chuẩn mực văn hoá của người dùng. Đây là lúc localization xuất hiện.

Localization là quá trình thiết kế và phát triển ứng dụng sao cho nó thích ứng được với nhiều locale khác nhau mà không cần thay đổi kỹ thuật. Hãy coi đó như việc tạo ra một ứng dụng "sẵn sàng cho thế giới".

Một locale đại diện cho một khu vực địa lý, chính trị hay văn hoá cụ thể. Nó gồm mã ngôn ngữ, mã quốc gia và tuỳ chọn thêm một variant.

Đây là ví dụ về biểu diễn của một locale:
```
fr_CA
```

Lưu ý rằng:
- Phần ngôn ngữ là bắt buộc
- Phần quốc gia là tuỳ chọn (nhưng nếu bạn đưa vào thì phải theo đúng định dạng)
- Phần ngôn ngữ viết thường
- Phần quốc gia viết hoa
- Ngôn ngữ và quốc gia phân tách bằng dấu gạch dưới

Ví dụ, `en` đại diện cho tiếng Anh, `en_US` đại diện cho tiếng Anh dùng ở Hoa Kỳ, vốn có thể khác `en_UK` (tiếng Anh dùng ở Vương quốc Anh) ở những điểm như chính tả (color và colour), từ vựng (truck và lorry) hay tiền tệ ($100 và £100).

## Class `Locale`
Locale được biểu diễn bởi class `java.util.Locale`. Về cơ bản, class này biểu diễn một ngôn ngữ và một quốc gia, dù nói chính xác thì một locale chứa được những thông tin sau:

- Mã ngôn ngữ ISO 639 alpha-2 hoặc alpha-3, như *ja* (tiếng Nhật)
- Mã quốc gia ISO 3166 alpha-2 hoặc mã khu vực UN M.49 numeric-3, như *JP* (Nhật Bản)
- Tên variant, thường rỗng nhưng có thể là chuỗi bất kỳ.
- Mã chữ viết ISO 15924 alpha-4, như *Latn* (Latin)
- Một tập extension biểu diễn bằng ký tự đơn, như *u*.

Có vài cách để lấy hoặc tạo một object `Locale` trong Java.

Để lấy locale mặc định của Java Virtual Machine (JVM), bạn dùng:

```java
Locale locale = Locale.getDefault();
```

Class `Locale` cung cấp sẵn vài hằng cho những locale thường dùng. Ví dụ:

```java
Locale usLocale = Locale.US;  // English as used in the US
Locale frLocale = Locale.FRANCE; // French as used in France 
```

Bạn cũng tạo được object `Locale` mới bằng một trong các constructor của nó:
```java
Locale(String language)
Locale(String language, String country)
Locale(String language, String country, String variant)
```

Ví dụ:

```java
Locale locale = new Locale("fr", "CA", "POSIX");
```

Câu lệnh này tạo một object `Locale` mới biểu diễn tiếng Pháp dùng ở Canada với variant POSIX.

Tham số đầu tiên là mã ngôn ngữ, tham số thứ hai là mã quốc gia, và tham số thứ ba (tuỳ chọn) là mã variant. Mã ngôn ngữ gồm hai hoặc ba chữ cái viết thường theo định nghĩa của ISO 639. Mã quốc gia gồm hai chữ cái viết hoa theo định nghĩa của ISO 3166. Variant là giá trị tuỳ ý dùng để chỉ bất kỳ dạng biến thể nào, không chỉ biến thể ngôn ngữ.

Bạn cũng dùng được factory method `forLanguageTag(String)`. Method này mong nhận một mã ngôn ngữ, ví dụ:
```java
Locale german = Locale.forLanguageTag("de");
```

Ngoài ra, với `Locale.Builder`, bạn đặt những thuộc tính cần thiết rồi dựng object ở cuối, ví dụ:
```java
Locale japan = new Locale.Builder()
                 .setRegion("JP")
                 .setLanguage("ja")
                 .build();
```

Truyền một tham số không hợp lệ cho bất kỳ constructor hay method nào ở trên sẽ không ném exception; nó chỉ tạo ra một object với những tuỳ chọn không hợp lệ khiến chương trình chạy sai:
```java
Locale badLocale = new Locale("a", "A"); // No error
System.out.println(badLocale); // It prints a_A
```

Method `getDefault()` trả về giá trị hiện tại của locale mặc định cho instance JVM này. JVM đặt locale mặc định lúc khởi động dựa trên môi trường máy chủ. Nó được rất nhiều method nhạy locale sử dụng nếu không có locale nào được chỉ định tường minh. Tuy nhiên, nó thay đổi được bằng method `setDefault(Locale)`:
```java
System.out.println(Locale.getDefault()); // Let's say it prints en_GB
Locale.setDefault(new Locale("en", "US"));
System.out.println(Locale.getDefault()); // Now prints en_US
```

### Các category của Locale
Enum `Locale.Category` định nghĩa hai category dùng để phân biệt mục đích sử dụng của một `Locale`: `Locale.Category.DISPLAY` và `Locale.Category.FORMAT`. Những category này giúp chỉ rõ nên áp dụng thiết lập locale nào trong từng ngữ cảnh.

1. **Locale.Category.DISPLAY**:
   - Category này dùng cho chuỗi giao diện người dùng, như thông điệp, nhãn và menu.
   - Nó được áp dụng khi bạn cần bản địa hoá nội dung hiển thị cho người dùng.
   - Chẳng hạn, khi ứng dụng cần hiển thị ngày, giờ hay tiền tệ theo cách bản địa hoá, nó dùng locale `DISPLAY` để đảm bảo định dạng và thông điệp phù hợp với ngôn ngữ và vùng của người dùng.

2. **Locale.Category.FORMAT**:
   - Category này dùng để định dạng ngày, số và những giá trị khác thuộc phần xử lý dữ liệu hay hệ thống backend.
   - Nó được áp dụng khi bạn cần parse, format hay kiểm tra dữ liệu nhạy locale.
   - Chẳng hạn, khi cần định dạng một ngày để lưu trữ hoặc xử lý tiếp, locale `FORMAT` được dùng để đảm bảo dữ liệu theo đúng định dạng bản địa hoá.

Đây là ví dụ cho thấy cách dùng những category này:

```java
// Setting the DISPLAY locale
Locale.setDefault(Locale.Category.DISPLAY, Locale.FRANCE);

// Setting the FORMAT locale
Locale.setDefault(Locale.Category.FORMAT, Locale.US);

// Getting the DISPLAY locale
Locale displayLocale = Locale.getDefault(Locale.Category.DISPLAY);
System.out.println("DISPLAY Locale: " + displayLocale);

// Getting the FORMAT locale
Locale formatLocale = Locale.getDefault(Locale.Category.FORMAT);
System.out.println("FORMAT Locale: " + formatLocale);
```

Trong ví dụ này, locale `DISPLAY` được đặt là `Locale.FRANCE`, nghĩa là các phần tử giao diện người dùng sẽ được bản địa hoá cho người Pháp. Locale `FORMAT` được đặt là `Locale.US`, nghĩa là mọi định dạng ngày hay số sẽ theo quy ước dùng ở Hoa Kỳ.

Đây là output:
```
DISPLAY Locale: fr_FR
FORMAT Locale: en_US
```

Đây là sơ đồ tóm tắt cấu trúc của một locale:
```
┌──────────────────────────────────────────┐
│              Locale Structure            │
│                                          │
│  ┌───────────────────────────────────┐   │
│  │              Locale               │   │
│  │  ┌─────────────┐ ┌─────────────┐  │   │
│  │  │  Language   │ │  Country    │  │   │
│  │  │   (en)      │ │   (US)      │  │   │
│  │  └─────────────┘ └─────────────┘  │   │
│  │         ┌─────────────┐           │   │
│  │         │  Variant    │           │   │
│  │         │ (Optional)  │           │   │
│  │         └─────────────┘           │   │
│  └───────────────────────────────────┘   │
│                                          │
│  Locale Categories:                      │
│  ┌─────────────┐ ┌─────────────┐         │
│  │ DISPLAY     │ │ FORMAT      │         │
│  │             │ │             │         │
│  └─────────────┘ └─────────────┘         │
│                                          │
│  Examples:                               │
│  - en_US                                 │
│  - fr_FR                                 │
│  - de_DE_EURO                            │
│                                          │
└──────────────────────────────────────────┘

Điểm chính:
- Ngôn ngữ là bắt buộc, quốc gia và variant là tuỳ chọn
- Mã ngôn ngữ viết thường, mã quốc gia viết hoa
- Variant dùng để phân biệt sâu hơn (như phương ngữ)
- Category DISPLAY ảnh hưởng tới cách chính locale được hiển thị
- Category FORMAT ảnh hưởng tới việc định dạng ngày, số…
```

## Resource bundle
Resource bundle là cách để tổ chức và truy cập dữ liệu đặc thù theo locale như thông điệp hay nhãn trong ứng dụng. Hãy coi nó như một tập hợp cặp khoá-giá trị, trong đó khoá giống nhau ở mọi locale còn giá trị thì đặc thù theo locale.

Để hỗ trợ điều này, ta có abstract class `java.util.ResourceBundle` với hai subclass:

- `java.util.PropertyResourceBundle`: Mỗi locale được biểu diễn bằng một file property. Khoá và giá trị đều thuộc kiểu `String`.

- `java.util.ListResourceBundle`: Mỗi locale được biểu diễn bằng một subclass của class này, ghi đè method `Object[][] getContents()`. Mảng trả về biểu diễn các khoá và giá trị. Khoá phải thuộc kiểu `String`, nhưng giá trị có thể là object bất kỳ.

Trong Java, resource bundle thường được cài đặt dưới dạng file property. File property là file văn bản thuần chứa các cặp khoá-giá trị phân tách bằng dấu bằng (`=`). Ví dụ:

```
greeting=Hello
farewell=Goodbye
```

Tên của file property rất quan trọng. Nó phải theo định dạng `<basename>_<language>_<country>_<variant>.properties`, trong đó:
- `<basename>` là tên bạn đặt cho resource bundle
- `<language>` là mã ngôn ngữ ISO-639 hai chữ cái viết thường
- `<country>` là mã quốc gia ISO-3166 hai chữ cái viết hoa 
- `<variant>` là mã tuỳ chọn đặc thù nhà cung cấp hay trình duyệt

Ví dụ, ta có thể có những bundle với tên sau (giả sử ta làm việc với file property, dù với class thì cũng tương tự):
```
MyBundle.properties
MyBundle_en.properties
MyBundle_en_NZ.properties
MyBundle_en_US.properties
```

Trong trường hợp này, `MyBundle_en_US.properties` sẽ chứa thông điệp cho tiếng Anh dùng ở Hoa Kỳ.

Để tạo resource bundle, trước hết bạn tạo file property cho từng locale muốn hỗ trợ. Sau đó dùng class `java.util.ResourceBundle` để nạp file property phù hợp với locale hiện tại:

```java
ResourceBundle bundle = ResourceBundle.getBundle("MyBundle", locale);
```

Câu lệnh này nạp resource bundle tên `MyBundle` cho locale cho trước. Java sẽ tìm file property khớp nhất với locale được yêu cầu theo thứ tự ưu tiên sau:

1. Ngôn ngữ + Quốc gia + Variant
2. Ngôn ngữ + Quốc gia
3. Ngôn ngữ
4. Locale mặc định (do `Locale.getDefault()` trả về)
5. Resource bundle gốc (chỉ có basename, không có thông tin locale)

Nếu không tìm thấy file property nào khớp, một `MissingResourceException` sẽ được ném ra.

Khi đã có `ResourceBundle`, bạn lấy được giá trị đặc thù theo locale cho một khoá bằng method `getString`:
```java
String greeting = bundle.getString("greeting");
```

Để lấy giá trị dạng object, dùng:
```java
Integer num = (Integer) bundle.getObject("number");
```

Điều đáng lưu ý là `getString(key)` thực chất là lối tắt của:
```java
String val = (String) bundle.getObject(key);
```

Bạn dùng được những khoá của resource bundle khớp cùng khoá của mọi bundle cha của nó.

Bundle cha của một resource bundle là những bundle cùng tên nhưng ít thành phần hơn. Ví dụ, cha của `MyBundle_es_ES` là:
```
MyBundle_es
MyBundle
```

Giả sử locale mặc định là `en_US`, và chương trình của bạn dùng những file property sau (cùng các file khác), tất cả trong package mặc định, với giá trị:
```
MyBundle_en.properties
s = buddy

MyBundle_es_ES.properties
s = tío

MyBundle_es.properties
s = amigo

MyBundle.properties
hi = Hola
```

Ta tạo resource bundle như sau:
```java
Locale spain = new Locale("es", "ES");
Locale spanish = new Locale("es");

ResourceBundle rb = ResourceBundle.getBundle("MyBundle", spain);
System.out.format("%s %s\n",
    rb.getString("hi"), rb.getString("s"));

rb = ResourceBundle.getBundle("MyBundle", spanish);
System.out.format("%s %s\n",
    rb.getString("hi"), rb.getString("s"));
```

Đây sẽ là output:
```
Hola tío
Hola amigo
```

Như bạn thấy, mỗi locale lấy giá trị khác nhau cho khoá `s`, nhưng cả hai đều dùng chung giá trị cho `hi` vì khoá này được định nghĩa ở bundle cha của chúng.

Nếu bạn không chỉ định locale, class `ResourceBundle` sẽ dùng locale mặc định của hệ thống:
```java
ResourceBundle rb = ResourceBundle.getBundle("MyBundle");
System.out.format("%s %s\n",
    rb.getString("hi"), rb.getString("s"));
```

Vì ta giả sử locale mặc định là `en_US`, output là:
```
Hola buddy
```

Ta cũng lấy được mọi khoá trong một resource bundle bằng method `keySet()`:
```java
ResourceBundle rb =
    ResourceBundle.getBundle("MyBundle", spain);
Set<String> keys = rb.keySet();
keys.stream()
    .forEach(key ->
        System.out.format("%s %s\n", key, rb.getString(key)));
```

Đây là output (chú ý rằng nó in cả khoá của bundle cha):
```
hi Hola
s tío
```


## Class `MessageFormat`
Đôi khi bạn cần định dạng những thông điệp có chứa dữ liệu biến đổi. Ví dụ, bạn muốn hiển thị lời chào cá nhân hoá kèm tên người dùng, hay một thông báo lỗi kèm chi tiết cụ thể về lỗi đó. 

Class `java.text.MessageFormat` cung cấp cách mạnh mẽ để tạo thông điệp bản địa hoá bằng cách kết hợp một chuỗi mẫu với các tham số. Nó cho phép bạn định nghĩa một khuôn mẫu thông điệp với chỗ giữ chỗ cho dữ liệu biến đổi, rồi thay những chỗ giữ chỗ đó bằng giá trị thực lúc runtime.

Method then chốt của class `MessageFormat` là `format`:
```java
static String format(String pattern, Object... arguments)
```

Static method này nhận một mẫu thông điệp cùng một mảng tham số, và trả về thông điệp đã định dạng dưới dạng chuỗi. Tuy nhiên, còn hai method `format` khác được định nghĩa dưới dạng instance method:
```java
final StringBuffer format(Object[] arguments, StringBuffer result, FieldPosition pos)
final StringBuffer format(Object arguments, StringBuffer result, FieldPosition pos)
```

Những method này định dạng một mảng object rồi nối mẫu của instance `MessageFormat`, với các phần tử định dạng đã được thay bằng object đã định dạng, vào `StringBuffer` được truyền vào.

Ngoài ra, class cha của nó là `java.text.Format` định nghĩa thêm một method `format` nữa:
```java
public final String format(Object obj)
```

Method này định dạng một object để tạo ra chuỗi. Nó tương đương với:
```java
format(obj, new StringBuffer(), new FieldPosition(0)).toString();
```

Mẫu thông điệp là một chuỗi chứa phần văn bản tĩnh của thông điệp cùng những chỗ giữ chỗ cho phần biến đổi. Chỗ giữ chỗ được đánh dấu bằng cặp ngoặc nhọn `{}` cùng một con số chỉ vị trí của tham số trong mảng tham số.

Cú pháp của một mẫu message format theo cấu trúc:

```
Literal text {argumentIndex,formatType,formatStyle} Literal text
```

Trong đó:

- **Văn bản nguyên văn**: Là bất kỳ đoạn văn bản nào bạn muốn đưa trực tiếp vào thông điệp. Ví dụ, trong `Hello, {0}` thì `Hello, ` là văn bản nguyên văn.

- **Argument Index**: `{argumentIndex}` chỉ định nơi chèn một tham số. Con số trong ngoặc nhọn tương ứng vị trí của tham số trong danh sách bạn cung cấp khi định dạng thông điệp. Chẳng hạn, `{0}` sẽ được thay bằng tham số đầu tiên, `{1}` bằng tham số thứ hai, và cứ thế.

-. **Format Type**: `{argumentIndex,formatType}` bổ sung kiểu định dạng cho tham số. Những kiểu định dạng thường gặp gồm:
   - `number`: Định dạng tham số thành số.
   - `date`: Định dạng tham số thành ngày.
   - `time`: Định dạng tham số thành giờ.
   - `choice`: Dùng choice format cho tham số.

- **Format Style**: `{argumentIndex,formatType,formatStyle}` tinh chỉnh thêm kiểu định dạng bằng một style cụ thể. Ví dụ:
   - `number,currency`: Định dạng số thành tiền tệ.
   - `date,short`: Định dạng ngày theo style ngắn.
   - `number,percent`: Định dạng số thành phần trăm.

Văn bản được trích dẫn bằng dấu nháy đơn `'`, và bản thân dấu nháy đơn được escape thành `''`. Mọi ngoặc nhọn không thành cặp phải được escape bằng dấu nháy đơn. Ví dụ:
- `"'{0}'"` biểu diễn chuỗi nguyên văn `"{0}"` 
- `"'{'"` biểu diễn chuỗi nguyên văn `"{"` 
- `"'}'"` biểu diễn chuỗi nguyên văn `"}"` 

Đây là vài ví dụ về mẫu message format hợp lệ:

- **Chèn tham số đơn giản**:
  ```
  "The value is {0}"
  ```
  Nếu tham số là `42`, kết quả sẽ là "The value is 42".

- **Định dạng số**:
  ```
  "The total amount is {0,number,currency}"
  ```
  Nếu tham số là `1234.56`, kết quả sẽ là "The total amount is $1,234.56".

- **Định dạng ngày**:
  ```
  "The date today is {0,date,full}"
  ```
  Nếu tham số là một ngày, kết quả có thể là "The date today is Thursday, July 25, 2024".

- **Định dạng choice**:
  ```
  "There are {0,choice,0#no files|1#one file|1<many files}"
  ```
  Nếu tham số là `0`, `1` hay `2`, kết quả lần lượt là `There are no files`, `There is one file` và `There are many files`.


Tuy nhiên, thay vì dùng static method `format`, bạn tạo được một instance `MessageFormat` bằng cách truyền vào constructor của class một chuỗi mẫu và tuỳ chọn thêm một `Locale`:

```java
String pattern = "The disk \"{1}\" contains {0} file(s).";
MessageFormat messageFormat = new MessageFormat(pattern, Locale.US);
```

Bạn cũng đặt được `Locale` cho instance `MessageFormat` bằng `setLocale()`. Nó quyết định cách các tham số được định dạng.

Trong mọi trường hợp, để tạo chuỗi thông điệp đã định dạng, hãy gọi `format()` với một mảng object tham số:

```java
Object[] arguments = {42, "MyDisk"};
String result = messageFormat.format(arguments);
// result: "The disk "MyDisk" contains 42 file(s)."
```

Có vài quy tắc về argument index:
- `format()` thay mỗi phần tử định dạng `{argumentIndex}` bằng object tương ứng trong mảng `arguments`.  
- Nếu một argument index được dùng nhiều lần, mọi lần xuất hiện đều được thay bằng cùng một giá trị đã định dạng.
- Tham số không dùng tới sẽ bị bỏ qua. Thiếu hoặc thừa tham số sẽ gây exception.

Giả sử ta có mẫu message format và tham số sau:

```java
String pattern = "Hello, {0}. Today is {1,date,long}. Your balance is {2,number,currency}. Hello again, {0}!";
Object[] arguments = {"John", new Date(), 1234.56};
```

Khi định dạng mẫu này với mảng `arguments`, cách hoạt động như sau:

- `{0}` được thay bằng `John`.
- `{1,date,long}` được thay bằng ngày hiện tại theo định dạng dài (ví dụ `July 25, 2024`).
- `{2,number,currency}` được thay bằng số đã định dạng theo tiền tệ (ví dụ `$1,234.56`).
- Lần xuất hiện thứ hai của `{0}` cũng được thay bằng `John`.

Đây là thông điệp đã định dạng thu được:

```
"Hello, John. Today is July 25, 2024. Your balance is $1,234.56. Hello again, John!"
```

Về format type và style:
- Nếu không chỉ định format type, một giá trị mặc định dựa trên kiểu tham số sẽ được dùng (ví dụ số thì dùng `NumberFormat`).
- Format type tuỳ chỉnh được định nghĩa bằng cách truyền một chuỗi subformat pattern, ví dụ `{0,number,#,##0.0}`.
- `formatStyle` là tuỳ chọn và chỉ định được style định sẵn như `short`, `long`, `integer`, `currency`…

Hãy xét mẫu message format và tham số sau:

```java
String pattern = "The item costs {0}. The item costs {0,number,currency}. Custom format: {0,number,#,##0.0}. Today is {1,date,long}. Short date: {1,date,short}";
Object[] arguments = {1234.567, new Date()};
```

Khi định dạng với mảng `arguments`, nó hoạt động như sau:

- `{0}` không có format type nên mặc định dùng định dạng số (ví dụ `1234.567`).
- `{0,number,currency}` chỉ định format type `number` với style `currency` (ví dụ `$1,234.57`).
- `{0,number,#,##0.0}` dùng một mẫu định dạng số tuỳ chỉnh (ví dụ `1,234.6`).
- `{1,date,long}` chỉ định format type `date` với style `long` (ví dụ `July 25, 2024`).
- `{1,date,short}` chỉ định format type `date` với style `short` (ví dụ `7/25/24`).

Đây là thông điệp đã định dạng thu được:

```
"The item costs 1234.567. The item costs $1,234.57. Custom format: 1,234.6. Today is July 25, 2024. Short date: 7/25/24"
```

Ngoài `MessageFormat`, còn có hai subclass khác của `Format`: `java.text.NumberFormat` và `java.text.DateFormat`, lần lượt dùng để định dạng số và ngày.

Giá trị format type và style được dùng để tạo một instance `Format` cho phần tử định dạng. Bảng sau cho thấy các giá trị ánh xạ tới instance `Format` ra sao. Những tổ hợp không có trong bảng đều không hợp lệ. *SubformatPattern* phải là một chuỗi mẫu hợp lệ cho subclass `Format` được dùng.

| FormatType | FormatStyle | Subformat được tạo |
|------------|-------------|-------------------|
| *(không có)*   | *(không có)*    | `null`            |
| `number`   | *(không có)*    | `NumberFormat.getInstance(getLocale())` |
|            | `integer`   | `NumberFormat.getIntegerInstance(getLocale())` |
|            | `currency`  | `NumberFormat.getCurrencyInstance(getLocale())` |
|            | `percent`   | `NumberFormat.getPercentInstance(getLocale())` |
|            | *SubformatPattern* | `new` `DecimalFormat(subformatPattern, DecimalFormatSymbols.getInstance(getLocale()))` |
| `date`     | *(không có)*    | `DateFormat.getDateInstance(DateFormat.DEFAULT, getLocale())` |
|            | `short`     | `DateFormat.getDateInstance(DateFormat.SHORT, getLocale())` |
|            | `medium`    | `DateFormat.getDateInstance(DateFormat.DEFAULT, getLocale())` |
|            | `long`      | `DateFormat.getDateInstance(DateFormat.LONG, getLocale())` |
|            | `full`      | `DateFormat.getDateInstance(DateFormat.FULL, getLocale())` |
|            | *SubformatPattern* | `new` `SimpleDateFormat(subformatPattern, getLocale())` |
| `time`     | *(không có)*    | `DateFormat.getTimeInstance(DateFormat.DEFAULT, getLocale())` |
|            | `short`     | `DateFormat.getTimeInstance(DateFormat.SHORT, getLocale())` |
|            | `medium`    | `DateFormat.getTimeInstance(DateFormat.DEFAULT, getLocale())` |
|            | `long`      | `DateFormat.getTimeInstance(DateFormat.LONG, getLocale())` |
|            | `full`      | `DateFormat.getTimeInstance(DateFormat.FULL, getLocale())` |
|            | *SubformatPattern* | `new` `SimpleDateFormat(subformatPattern, getLocale())` |
| `choice`   | *SubformatPattern* | `new` `ChoiceFormat(subformatPattern)` |

Ở những phần tiếp theo, ta sẽ xem xét kỹ hơn class `NumberFormat` và `DateFormat`.


## Class `NumberFormat`
`NumberFormat` là abstract base class để định dạng và parse số trong Java. Nó cung cấp cách xử lý giá trị số theo hướng nhạy locale, cho phép bạn định dạng và parse số, tiền tệ và phần trăm theo quy ước của những locale khác nhau.

Để lấy một instance `NumberFormat` cho locale cụ thể, bạn thường dùng một trong các factory method của nó:

```java
NumberFormat defaultFormat = NumberFormat.getInstance();
NumberFormat currencyFormat = NumberFormat.getCurrencyInstance();
NumberFormat percentFormat = NumberFormat.getPercentInstance();
```

Những method này trả về một formatter đặc thù locale dựa trên locale `FORMAT` mặc định. Bạn cũng chỉ định được locale tường minh:

```java
Locale franceLocale = new Locale("fr", "FR");
NumberFormat franceFormat = NumberFormat.getInstance(franceLocale);
```

Để định dạng một số, dùng một trong các method `format()`:

```java
double value = 1234.56;
String formattedValue = defaultFormat.format(value);  // "1,234.56"
```

`NumberFormat` cũng cung cấp method để định dạng giá trị `long` và `double` trực tiếp vào một `StringBuffer`, cách này hiệu quả hơn khi cần định dạng khối lượng lớn:
```
abstract StringBuffer format(double number, StringBuffer toAppendTo, FieldPosition pos)
abstract StringBuffer format(long number, StringBuffer toAppendTo, FieldPosition pos)
```

Ngược lại, để parse một chuỗi thành số, dùng method `parse()`:

```java
String text = "1,234.56";
Number number = defaultFormat.parse(text);  // Returns a Long or Double
```

Method `parse()` nhạy locale và sẽ nhận diện được dấu thập phân cùng dấu phân nhóm đặc thù theo locale.

`NumberFormat` còn cung cấp vài method để điều khiển đầu ra định dạng:

- `setMinimumIntegerDigits()` và `setMaximumIntegerDigits()`: Điều khiển số chữ số ở phần nguyên.
- `setMinimumFractionDigits()` và `setMaximumFractionDigits()`: Điều khiển số chữ số ở phần thập phân.
- `setGroupingUsed()`: Bật hoặc tắt dấu phân nhóm.
- `setRoundingMode()`: Đặt chế độ làm tròn cho formatter.

Để kiểm soát nhiều hơn, `NumberFormat` có vài subclass cụ thể cho những nhu cầu định dạng riêng:

- `DecimalFormat`: Formatter đa dụng cho số thập phân.
- `CompactNumberFormat`: Định dạng số theo cách gọn và nhạy locale, như "1.2K" cho 1200.
- `ChoiceFormat`: Cho phép bạn ánh xạ số thành chuỗi dựa trên một tập khoảng giá trị.

### Class `DecimalFormat`

Subclass được dùng nhiều nhất là `DecimalFormat`, cung cấp mức kiểm soát cao với mẫu định dạng. Bạn tạo được một `DecimalFormat` với mẫu và ký hiệu cụ thể:

```java
DecimalFormat format = new DecimalFormat("#,##0.00", DecimalFormatSymbols.getInstance(Locale.US));
```

Tham số thứ hai (`DecimalFormatSymbols`) là tuỳ chọn. Mẫu chỉ định định dạng của đầu ra, với những ký tự đặc biệt biểu diễn vị trí chữ số, phần thập phân, phân nhóm… Object `DecimalFormatSymbols` định nghĩa những ký tự cụ thể dùng cho các ký tự đặc biệt này dựa trên một locale.

Mẫu `DecimalFormat` chứa một subpattern dương và một subpattern âm, ví dụ `#,##0.00;(#,##0.00)`. Mỗi subpattern có tiền tố, phần số và hậu tố. Subpattern âm là tuỳ chọn; nếu vắng mặt thì subpattern dương kèm dấu trừ ở đầu (`'-' U+002D HYPHEN-MINUS`) được dùng làm subpattern âm. 

Nhiều ký tự trong mẫu được hiểu theo nghĩa đen: chúng được so khớp khi parse và giữ nguyên trong đầu ra khi định dạng. Ngược lại, những ký tự đặc biệt đại diện cho ký tự, chuỗi hay lớp ký tự khác và phải được trích dẫn.

Những ký tự liệt kê trong bảng sau được dùng trong mẫu chưa bản địa hoá. Mẫu đã bản địa hoá dùng những ký tự tương ứng lấy từ object `DecimalFormatSymbols` của formatter thay vào đó, và những ký tự này mất đi vị thế đặc biệt. Hai ngoại lệ là dấu tiền tệ và dấu nháy, vốn không được bản địa hoá:

| Ký hiệu               | Vị trí        | Bản địa hoá? | Ý nghĩa                                                                                       |
|----------------------|-----------------|------------|-----------------------------------------------------------------------------------------------|
| `0`                  | Số          | Có        | Chữ số                                                                                        |
| `#`                  | Số          | Có        | Chữ số, số không thì không hiển thị                                                                  |
| `.`                  | Số          | Có        | Dấu thập phân hoặc dấu thập phân tiền tệ                                              |
| `-`                  | Số          | Có        | Dấu trừ                                                                                   |
| `,`                  | Số          | Có        | Dấu phân nhóm hoặc dấu phân nhóm tiền tệ                                            |
| `E`                  | Số          | Có        | Ngăn cách phần định trị và số mũ trong ký hiệu khoa học. *Không cần trích dẫn ở tiền tố hay hậu tố.* |
| `;`                  | Ranh giới subpattern | Có    | Ngăn cách subpattern dương và âm                                                  |
| `%`                  | Tiền tố hoặc hậu tố | Có       | Nhân với 100 và hiển thị dưới dạng phần trăm                                                       |
| `&#92;u2030`         | Tiền tố hoặc hậu tố | Có       | Nhân với 1000 và hiển thị dưới dạng phần nghìn                                                 |
| `&#164;` (`&#92;u00A4`) | Tiền tố hoặc hậu tố | Không     | Dấu tiền tệ, được thay bằng ký hiệu tiền tệ. Nếu viết đôi, được thay bằng ký hiệu tiền tệ quốc tế. Nếu xuất hiện trong mẫu, dấu thập phân và dấu phân nhóm tiền tệ được dùng thay cho dấu thập phân và dấu phân nhóm thông thường. |
| `'`                  | Tiền tố hoặc hậu tố | Không        | Dùng để trích dẫn ký tự đặc biệt trong tiền tố hay hậu tố, ví dụ `" '#' "` định dạng 123 thành `"#123"`. Để tạo chính dấu nháy đơn, dùng hai dấu liền nhau: `"# o''clock"`. |


Đây là vài ví dụ:

```java
// Number Formatting
DecimalFormat numberFormat = new DecimalFormat("###,###.##");
System.out.println("Number Formatting: " + numberFormat.format(1234567.89));

// Percentage Formatting
DecimalFormat percentFormat = new DecimalFormat("##.##%");
System.out.println("Percentage Formatting: " + percentFormat.format(0.1234));

// Per Mille Formatting
DecimalFormat perMilleFormat = new DecimalFormat("##.##‰");
System.out.println("Per Mille Formatting: " + perMilleFormat.format(0.1234));

// Currency Formatting
DecimalFormat currencyFormat = new DecimalFormat("$###,###.##");
System.out.println("Currency Formatting: " + currencyFormat.format(1234.56));

// Scientific Notation
DecimalFormat scientificFormat = new DecimalFormat("0.###E0");
System.out.println("Scientific Notation: " + scientificFormat.format(12345));

// Positive and Negative Subpatterns
DecimalFormat positiveNegativeFormat = new DecimalFormat("###.##;(#.##)");
System.out.println("Positive Number: " + positiveNegativeFormat.format(1234.56));
System.out.println("Negative Number: " + positiveNegativeFormat.format(-1234.56));

// Custom Text with Numbers
DecimalFormat customTextFormat = new DecimalFormat("'Number: '###");
System.out.println("Custom Text with Numbers: " + customTextFormat.format(123));

// Custom Grouping and Decimal Separators
DecimalFormat customGroupingFormat = new DecimalFormat("'Amount: '###,###.##");
System.out.println("Custom Grouping and Decimal Separators: " + customGroupingFormat.format(1234567.89));

//  Quoting Special Characters
DecimalFormat quotingSpecialFormat = new DecimalFormat("''#''###");
System.out.println("Quoting Special Characters: " + quotingSpecialFormat.format(123));

// Integer Formatting
DecimalFormat integerFormat = new DecimalFormat("###");
System.out.println("Integer Formatting: " + integerFormat.format(1234.56));
```

Đây là output:
```
Number Formatting: 1,234,567.89
Percentage Formatting: 12.34%
Per Mille Formatting: 123.4‰
Currency Formatting: $1,234.56
Scientific Notation: 1.234E4
Positive Number: 1234.56
Negative Number: (1234.56)
Custom Text with Numbers: Number: 123
Custom Grouping and Decimal Separators: Amount: 1,234,567.89
Quoting Special Characters: '123'
Integer Formatting: 1235
```

### Class `CompactNumberFormat`
`CompactNumberFormat` hỗ trợ định dạng số ở dạng gọn. Định dạng này đặc biệt hữu ích để hiển thị những số lớn theo cách dễ đọc hơn và nhạy locale.

Class này hỗ trợ hai style:

1. `NumberFormat.Style.SHORT`: Dùng ký hiệu viết tắt (ví dụ `K` cho nghìn, `M` cho triệu, `B` cho tỷ…)
2. `NumberFormat.Style.LONG`: Dùng từ đầy đủ (ví dụ "thousand", "million")

Để lấy một instance `CompactNumberFormat`, bạn dùng factory method `getCompactNumberInstance()`:

```java
NumberFormat shortFormat = NumberFormat.getCompactNumberInstance(Locale.US, NumberFormat.Style.SHORT);
NumberFormat longFormat = NumberFormat.getCompactNumberInstance(Locale.US, NumberFormat.Style.LONG);
```

Đây là vài ví dụ về cách `CompactNumberFormat` hoạt động:

```java
double number = 1_234_567.89;

System.out.println(shortFormat.format(number));  // Output: 1M
System.out.println(longFormat.format(number));   // Output: 1 million

number = 1_234;
System.out.println(shortFormat.format(number));  // Output: 1K
System.out.println(longFormat.format(number));   // Output: 1 thousand
```

`CompactNumberFormat` tự động điều chỉnh số chữ số hiển thị dựa trên độ lớn của con số. Nó cũng xử lý được các locale khác nhau một cách phù hợp:

```java
NumberFormat frFormat = NumberFormat.getCompactNumberInstance(Locale.FRANCE, NumberFormat.Style.SHORT);
System.out.println(frFormat.format(1_234_567.89));  // Output: 1 M
```

Mặc định, `CompactNumberFormat` không hiển thị chữ số thập phân. Tuy nhiên, bạn thay đổi được hành vi này bằng method `setMinimumFractionDigits()` và `setMaximumFractionDigits()`. 

Ngoài ra, class này còn hỗ trợ nhiều chế độ làm tròn thông qua `setRoundingMode` cùng enum `java.math.RoundingMode`, với mặc định là `RoundingMode.HALF_EVEN`:

| Hằng enum | Mô tả |
|---------------|-------------|
| `CEILING` | Làm tròn về phía dương vô cực. |
| `DOWN` | Làm tròn về phía số không. |
| `FLOOR` | Làm tròn về phía âm vô cực. |
| `HALF_DOWN` | Làm tròn về "hàng xóm gần nhất", trừ khi hai hàng xóm cách đều thì làm tròn xuống. |
| `HALF_EVEN` | Làm tròn về "hàng xóm gần nhất", trừ khi hai hàng xóm cách đều thì làm tròn về phía hàng xóm chẵn. |
| `HALF_UP` | Làm tròn về "hàng xóm gần nhất", trừ khi hai hàng xóm cách đều thì làm tròn lên. |
| `UNNECESSARY` | Chế độ khẳng định rằng thao tác yêu cầu cho kết quả chính xác, do đó không cần làm tròn. |
| `UP` | Làm tròn ra xa số không. |

Đây là vài ví dụ:

```java
double number = 1_234_567.89;
NumberFormat shortFormat = NumberFormat.getCompactNumberInstance(Locale.US, NumberFormat.Style.SHORT);

// Default behavior (no fractional digits)
System.out.println(shortFormat.format(number));  // Output: 1M

// Adding fractional digits
shortFormat.setMinimumFractionDigits(1);
shortFormat.setMaximumFractionDigits(2);
System.out.println(shortFormat.format(number));  // Output: 1.23M

// Changing rounding mode
shortFormat.setRoundingMode(RoundingMode.DOWN);
System.out.println(shortFormat.format(number));  // Output: 1.23M

shortFormat.setRoundingMode(RoundingMode.UP);
System.out.println(shortFormat.format(number));  // Output: 1.24M

// Behavior with smaller numbers
number = 1234.56;
System.out.println(shortFormat.format(number));  // Output: 1.24K

// Resetting to default behavior
shortFormat = NumberFormat.getCompactNumberInstance(Locale.US, NumberFormat.Style.SHORT);
System.out.println(shortFormat.format(number));  // Output: 1K
```


## Class `DateTimeFormatter`
Ở chương Date/Time API, ta đã bàn về class `java.time.format.DateTimeFormatter`, class cung cấp cách linh hoạt và hiện đại để định dạng ngày giờ được biểu diễn bởi những class `java.time` như `LocalDate`, `LocalTime` và `LocalDateTime`.

Tuy nhiên, một trong những tính năng then chốt của `DateTimeFormatter` là khả năng tạo formatter bản địa hoá bằng những method `ofLocalized...()`:

- `static DateTimeFormatter ofLocalizedDate(FormatStyle dateStyle)`: Tạo formatter định dạng một ngày theo style chỉ định cho locale hiện tại.
- `static DateTimeFormatter ofLocalizedTime(FormatStyle timeStyle)`: Tạo formatter định dạng một giờ theo style chỉ định cho locale hiện tại.
- `static DateTimeFormatter ofLocalizedDateTime(FormatStyle dateStyle, FormatStyle timeStyle)`: Tạo formatter định dạng ngày và giờ theo những style chỉ định cho locale hiện tại.
- `static DateTimeFormatter ofLocalizedDateTime(FormatStyle dateTimeStyle)`: Tạo formatter định dạng ngày và giờ theo style kết hợp chỉ định cho locale hiện tại.

Enum `FormatStyle` định nghĩa những style khả dụng: `SHORT`, `MEDIUM`, `LONG` và `FULL`.

Đây là ví dụ dùng những method này:

```java
LocalDate date = LocalDate.now();
LocalTime time = LocalTime.now();
LocalDateTime dateTime = LocalDateTime.now();

DateTimeFormatter dateFormatter = DateTimeFormatter.ofLocalizedDate(FormatStyle.FULL);
DateTimeFormatter timeFormatter = DateTimeFormatter.ofLocalizedTime(FormatStyle.MEDIUM);
DateTimeFormatter dateTimeFormatter = DateTimeFormatter.ofLocalizedDateTime(FormatStyle.LONG, FormatStyle.SHORT);

String formattedDate = date.format(dateFormatter);
String formattedTime = time.format(timeFormatter);
String formattedDateTime = dateTime.format(dateTimeFormatter);

System.out.println("Formatted date: " + formattedDate);
System.out.println("Formatted time: " + formattedTime);
System.out.println("Formatted date-time: " + formattedDateTime);
```

Những method `ofLocalized...()` tự động dùng locale hiện tại để xác định cách định dạng phù hợp. Nếu muốn chỉ định locale khác, bạn dùng method `withLocale()`:

```java
DateTimeFormatter frenchDateFormatter = DateTimeFormatter.ofLocalizedDate(FormatStyle.FULL).withLocale(Locale.FRANCE);
String formattedDateInFrench = date.format(frenchDateFormatter);
System.out.println("Formatted date in French: " + formattedDateInFrench);
```

Những formatter bản địa hoá này đem lại cách dễ dàng để định dạng ngày giờ theo quy ước của một locale cụ thể mà không phải tự chỉ định mẫu định dạng.

Bạn cũng dùng được một mẫu để tạo instance `DateTimeFormatter` thông qua method `ofPattern(String)` và `ofPattern(String, Locale)`. Ví dụ, `"d MMM uuuu"` sẽ định dạng `2011-12-03` thành `'3 Dec 2011'`. Formatter tạo từ một mẫu dùng lại được bao nhiêu lần tuỳ ý. Nó immutable và thread-safe.

Đây là một ví dụ:

```java
LocalDate date = LocalDate.now();
DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yy MM dd");

// Format the date
String text = date.format(formatter);
System.out.println("Formatted date: " + text);

// Parse the date
LocalDate parsedDate = LocalDate.parse(text, formatter);
System.out.println("Parsed date: " + parsedDate);
```

Đây là một output mẫu:
```
Formatted date: 24 07 25
Parsed date: 2024-07-25
```

Bảng sau liệt kê mọi chữ cái mẫu được định nghĩa (mọi chữ cái từ 'A' đến 'Z' và 'a' đến 'z' đều được dành riêng):

| Ký hiệu | Ý nghĩa                       | Cách biểu diễn | Ví dụ                                             |
|--------|-------------------------------|--------------|------------------------------------------------------|
| `G`    | kỷ nguyên (era)                | text         | `AD`; `Anno Domini`; `A`                             |
| `u`    | năm                          | year         | `2004`; `04`                                         |
| `y`    | năm trong kỷ nguyên                   | year         | `2004`; `04`                                         |
| `D`    | ngày trong năm                   | number       | `189`                                                |
| `M/L`  | tháng trong năm                 | number/text  | `7`; `07`; `Jul`; `July`; `J`                        |
| `d`    | ngày trong tháng                  | number       | `10`                                                 |
| `g`    | modified-julian-day           | number       | `2451334`                                            |
| `Q/q`  | quý trong năm               | number/text  | `3`; `03`; `Q3`; `3rd quarter`                       |
| `Y`    | năm tính theo tuần               | year         | `1996`; `96`                                         |
| `w`    | tuần trong năm tính theo tuần       | number       | `27`                                                 |
| `W`    | tuần trong tháng                 | number       | `4`                                                  |
| `E`    | thứ trong tuần                   | text         | `Tue`; `Tuesday`; `T`                                |
| `e/c`  | thứ trong tuần theo locale         | number/text  | `2`; `02`; `Tue`; `Tuesday`; `T`                     |
| `F`    | thứ trong tuần tính theo tháng          | number       | `3`                                                  |
| `a`    | AM/PM trong ngày                  | text         | `PM`                                                 |
| `B`    | buổi trong ngày                 | text         | `in the morning`                                     |
| `h`    | giờ đồng hồ AM/PM (1-12)    | number       | `12`                                                 |
| `K`    | giờ trong AM/PM (0-11)          | number       | `0`                                                  |
| `k`    | giờ đồng hồ trong ngày (1-24)      | number       | `24`                                                 |
| `H`    | giờ trong ngày (0-23)            | number       | `0`                                                  |
| `m`    | phút trong giờ                | number       | `30`                                                 |
| `s`    | giây trong phút              | number       | `55`                                                 |
| `S`    | phần lẻ của giây            | fraction     | `978`                                                |
| `A`    | mili-giây trong ngày                  | number       | `1234`                                               |
| `n`    | nano-giây trong giây                | number       | `987654321`                                          |
| `N`    | nano-giây trong ngày                   | number       | `1234000000`                                         |
| `V`    | ID múi giờ                  | zone-id      | `America/Los_Angeles`; `Z`; `-08:30`                 |
| `v`    | tên múi giờ chung        | zone-name    | `Pacific Time`; `PT`                                 |
| `z`    | tên múi giờ                | zone-name    | `Pacific Standard Time`; `PST`                       |
| `O`    | zone-offset theo locale         | offset-O     | `GMT+8`; `GMT+08:00`; `UTC-08:00`                    |
| `X`    | zone-offset, 'Z' cho giá trị không      | offset-X     | `Z`; `-08`; `-0830`; `-08:30`; `-083015`; `-08:30:15`|
| `x`    | zone-offset                   | offset-x     | `+0000`; `-08`; `-0830`; `-08:30`; `-083015`; `-08:30:15`|
| `Z`    | zone-offset                   | offset-Z     | `+0000`; `-0800`; `-08:00`                           |
| `p`    | đệm cho ký hiệu kế tiếp                     | pad modifier | `1`                                                  |
| `'`    | escape cho văn bản               | delimiter    |                                                      |
| `''`   | dấu nháy đơn                  | literal      | `'`                                                  |
| `[`    | bắt đầu phần tuỳ chọn        |              |                                                      |
| `]`    | kết thúc phần tuỳ chọn          |              |                                                      |
| `#`    | dành riêng cho tương lai       |              |                                                      |
| `{`    | dành riêng cho tương lai       |              |                                                      |
| `}`    | dành riêng cho tương lai       |              |                                                      |

Đây là những ví dụ dùng nhiều mẫu trong số đó:

```java
LocalDate date = LocalDate.now();
LocalTime time = LocalTime.now();
ZonedDateTime zonedDateTime = ZonedDateTime.now();

// Era
DateTimeFormatter formatter1 = DateTimeFormatter.ofPattern("G");
System.out.println("Era: " + date.format(formatter1));

// Year
DateTimeFormatter formatter2 = DateTimeFormatter.ofPattern("yyyy");
System.out.println("Year: " + date.format(formatter2));

// Day of Year
DateTimeFormatter formatter3 = DateTimeFormatter.ofPattern("D");
System.out.println("Day of Year: " + date.format(formatter3));

// Month of Year
DateTimeFormatter formatter4 = DateTimeFormatter.ofPattern("MMMM");
System.out.println("Month of Year: " + date.format(formatter4));

// Day of Month
DateTimeFormatter formatter5 = DateTimeFormatter.ofPattern("d");
System.out.println("Day of Month: " + date.format(formatter5));

// Day of Week
DateTimeFormatter formatter6 = DateTimeFormatter.ofPattern("EEEE");
System.out.println("Day of Week: " + date.format(formatter6));

// AM/PM of Day
DateTimeFormatter formatter7 = DateTimeFormatter.ofPattern("a");
System.out.println("AM/PM of Day: " + time.format(formatter7));

// Hour of Day (0-23)
DateTimeFormatter formatter8 = DateTimeFormatter.ofPattern("H");
System.out.println("Hour of Day (0-23): " + time.format(formatter8));

// Minute of Hour
DateTimeFormatter formatter9 = DateTimeFormatter.ofPattern("m");
System.out.println("Minute of Hour: " + time.format(formatter9));

// Second of Minute
DateTimeFormatter formatter10 = DateTimeFormatter.ofPattern("s");
System.out.println("Second of Minute: " + time.format(formatter10));

// Time Zone Name
DateTimeFormatter formatter11 = DateTimeFormatter.ofPattern("z");
System.out.println("Time Zone Name: " + zonedDateTime.format(formatter11));

// ISO 8601 Time Zone
DateTimeFormatter formatter12 = DateTimeFormatter.ofPattern("X");
System.out.println("ISO 8601 Time Zone: " + zonedDateTime.format(formatter12));
```

Output sẽ tương tự thế này:
```
Era: AD
Year: 2024
Day of Year: 207
Month of Year: July
Day of Month: 25
Day of Week: Thursday
AM/PM of Day: PM
Hour of Day (0-23): 20
Minute of Hour: 31
Second of Minute: 16
Time Zone Name: CDT
ISO 8601 Time Zone: -05
```

Với kỳ thi chứng chỉ Java, bạn không cần thuộc lòng từng mẫu, nhưng nên quen thuộc với những mẫu then chốt có khả năng xuất hiện trong đề. Đây là danh sách những mẫu bạn nên tập trung:
- **Kỷ nguyên (Era)**: `G`
- **Năm trong kỷ nguyên**: `y`
- **Tháng**: `M`
- **Ngày trong tháng**: `d`
- **Giờ (0-23)**: `H`
- **Giờ (1-12)**: `h`
- **Phút**: `m`
- **Giây**: `s`
- **AM/PM**: `a`
- **Năm tính theo tuần**: `Y`
- **Ngày trong năm**: `D`
- **Thứ trong tuần**: `E`, `e`
- **Buổi trong ngày**: `B`
- **Phần lẻ của giây**: `S`
- **Nano-giây trong giây**: `n`
- **Nano-giây trong ngày**: `N`
- **ID múi giờ**: `V`
- **Tên múi giờ**: `z`
- **Múi giờ ISO 8601**: `X`
- **Zone Offset theo locale**: `O`



## Các điểm chính

- Localization là quá trình thiết kế và phát triển ứng dụng sao cho nó thích ứng được với nhiều locale mà không cần thay đổi kỹ thuật. Một locale đại diện cho một khu vực địa lý, chính trị hay văn hoá cụ thể.

- Locale được biểu diễn bởi class `java.util.Locale`. Bạn lấy được locale mặc định của JVM bằng `Locale.getDefault()`, dùng những hằng dựng sẵn như `Locale.US`, hoặc tạo object `Locale` mới bằng constructor hay method `forLanguageTag()`.

- Enum `Locale.Category` định nghĩa hai category: `DISPLAY` (cho phần tử giao diện người dùng) và `FORMAT` (cho việc parse và định dạng dữ liệu). Bạn đặt và lấy được locale mặc định cho từng category bằng `Locale.setDefault()` và `Locale.getDefault()`.

- Resource bundle được dùng để tổ chức và truy cập dữ liệu đặc thù theo locale. Chúng thường được cài đặt dưới dạng file property đặt tên theo định dạng `<basename>_<language>_<country>_<variant>.properties`.

- Class `java.util.ResourceBundle` được dùng để nạp file property phù hợp với locale hiện tại. Bạn lấy được giá trị đặc thù theo locale bằng `getString()` hoặc `getObject()`.

- Class `java.text.MessageFormat` được dùng để tạo thông điệp bản địa hoá bằng cách kết hợp một chuỗi mẫu với các tham số. Mẫu chứa chỗ giữ chỗ đánh dấu bằng `{}` cùng argument index. Format type (như `number` hay `date`) và style đều chỉ định được.

- Class `java.text.Format` có những subclass để định dạng tham số dựa trên kiểu của chúng và style được chỉ định. Những subclass chính là `java.text.NumberFormat` cho số và `java.text.DateFormat` cho ngày.

- `java.text.NumberFormat` là abstract base class để định dạng và parse số trong Java. Nó cung cấp các factory method để lấy formatter đặc thù locale cho số, tiền tệ và phần trăm.

- `java.text.DecimalFormat` là subclass cụ thể của `NumberFormat`, cho phép kiểm soát chi tiết hơn việc định dạng số thập phân bằng mẫu. Mẫu chứa được những ký tự đặc biệt biểu diễn vị trí chữ số, phần thập phân, phân nhóm…

- `java.time.format.DateTimeFormatter` là class để định dạng ngày giờ từ package `java.time`. Nó làm việc với những class ngày/giờ hiện đại như `LocalDate`, `LocalTime`, `LocalDateTime`.

- `DateTimeFormatter` cung cấp những method `ofLocalized...()` để tạo formatter đặc thù locale theo nhiều style khác nhau, tương tự `DateFormat`. Nó cũng cho phép tạo formatter từ mẫu tuỳ chỉnh bằng `ofPattern()`.

- Với kỳ thi chứng chỉ, hãy tập trung vào những mẫu thường gặp như kỷ nguyên (`G`), năm trong kỷ nguyên (`y`), tháng (`M`), ngày trong tháng (`d`), giờ (`H`, `h`), phút (`m`), giây (`s`), AM/PM (`a`) và một số mẫu khác.


## Câu hỏi luyện tập

**1. Hãy xét đoạn mã sau:**

```java
import java.util.Locale;

public class LocaleTest {
    public static void main(String[] args) {
        Locale locale1 = new Locale("fr", "CA");
        Locale locale2 = new Locale("fr", "CA", "UNIX2024");
        Locale locale3 = Locale.CANADA_FRENCH;
        
        System.out.println(locale1.equals(locale2));
        System.out.println(locale1.equals(locale3));
        System.out.println(locale2.equals(locale3));
        
        System.out.println(locale1.getDisplayName(Locale.ENGLISH));
        System.out.println(locale2.getDisplayName(Locale.ENGLISH));
        System.out.println(locale3.getDisplayName(Locale.ENGLISH));
    }
}
```

Output khi thực thi đoạn mã này là gì?

**A)** 
```
true
true
true
French (Canada)
French (Canada)
French (Canada)
```

**B)** 
```
false
true
false
French (Canada)
French (Canada, UNIX2024)
French (Canada)
```

**C)** 
```
false
true
false
French (Canada)
French (Canada, UNIX2024)
Canadian French
```

**D)** 
```
false
false
false
French (Canada)
French (Canada, UNIX2024)
Canadian French
```

**E)** Đoạn mã sẽ ném `IllegalArgumentException` vì `UNIX2024` không phải variant hợp lệ.


**2. Phát biểu nào sau đây về category của `Locale` là đúng?**

**A)** Enum `Locale.Category` có ba giá trị: `DISPLAY`, `FORMAT` và `LANGUAGE`.  
**B)** Method `Locale.setDefault(Locale.Category, Locale)` chỉ đặt được locale mặc định cho category `FORMAT`.  
**C)** Dùng `Locale.getDefault(Locale.Category)` luôn trả về cùng một locale bất kể category được chỉ định.  
**D)** Category `DISPLAY` ảnh hưởng tới ngôn ngữ dùng để hiển thị các phần tử giao diện người dùng, còn category `FORMAT` ảnh hưởng tới việc định dạng số, ngày và tiền tệ.  
**E)** Category của Locale được giới thiệu ở Java 8 để thay thế những method `Locale` cũ.


**3. Phát biểu nào sau đây về Resource Bundle là đúng?**

**A)** Resource bundle chỉ lưu được trong file `.properties`.  
**B)** Method `ResourceBundle.getBundle()` luôn ném `MissingResourceException` nếu không tìm thấy bundle được yêu cầu.  
**C)** Khi tìm resource bundle, Java chỉ xét locale được chỉ định và ngôn ngữ của nó.  
**D)** Nếu không tìm thấy một khoá trong resource bundle của locale cụ thể, Java sẽ tìm nó trong bundle của locale cha.  
**E)** Resource bundle được nạp động lúc runtime, nên thay đổi trong file `.properties` được phản ánh ngay vào ứng dụng đang chạy.


**4. Hãy xét đoạn mã sau:**

```java
import java.util.*;
import java.io.*;

public class ConfigTest {
    public static void main(String[] args) throws IOException {
        Properties props = new Properties();
        props.setProperty("color", "blue");
        props.setProperty("size", "medium");
        
        try (OutputStream out = new FileOutputStream("config.properties")) {
            props.store(out, "Config File");
        }
        
        props.clear();
        System.out.println(props.getProperty("color", "red"));
        
        try (InputStream in = new FileInputStream("config.properties")) {
            props.load(in);
        }
        
        System.out.println(props.getProperty("color", "red"));
    }
}
```

Output khi thực thi đoạn mã này là gì?

**A)** 
```
red
blue
```

**B)**
```
blue
blue
```

**C)** 
```
red
red
```

**D)** Đoạn mã sẽ ném `FileNotFoundException`.

**E)** 
```
null
blue
```


**5. Hãy xét đoạn mã sau:**

```java
import java.text.MessageFormat;
import java.util.Date;
import java.util.Locale;

public class MessageFormatTest {
    public static void main(String[] args) {
        String pattern = "On {0, date, long}, {1} bought {2,number,integer} {3} for {4,number,currency}.";
        Object[] params = {
            new Date(),
            "Alice",
            3,
            "apples",
            19.99
        };
        
        MessageFormat mf = new MessageFormat(pattern, Locale.US);
        String result = mf.format(params);
        System.out.println(result);
    }
}
```

Phát biểu nào sau đây về đoạn mã này là đúng?

**A)** Đoạn mã sẽ ném `IllegalArgumentException` vì định dạng ngày không hợp lệ.  
**B)** Output sẽ chứa ngày ở định dạng long, tên `"Alice"`, số 3, từ `"apples"` và giá theo định dạng tiền tệ Hoa Kỳ.
**C)** Định dạng `{2,number,integer}` sẽ hiển thị 3 thành `"3.0"`.  
**D)** Đoạn mã không biên dịch được vì `MessageFormat` không nhận `Locale` trong constructor.  
**E)** Định dạng `{4,number,currency}` sẽ luôn hiển thị giá bằng USD, bất kể `Locale`.



**6. Phát biểu nào sau đây về class `NumberFormat` trong Java là đúng?**

**A)** Method `NumberFormat.getCurrencyInstance()` trả về một formatter định dạng được giá trị tiền tệ theo quy ước của locale chỉ định.  
**B)** `NumberFormat` là class cụ thể, khởi tạo trực tiếp được bằng constructor của nó.  
**C)** Method `setMaximumFractionDigits()` trong `NumberFormat` chỉ nhận giá trị từ 0 đến 3.  
**D)** Khi parse chuỗi, `NumberFormat` luôn ném `ParseException` nếu đầu vào không khớp chính xác định dạng mong đợi.  
**E)** Class `NumberFormat` chỉ định dạng và parse được giá trị nguyên, không xử lý được số dấu phẩy động.


**7. Hãy xét đoạn mã sau:**

```java
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;

public class DateTimeFormatterTest {
    public static void main(String[] args) {
        LocalDateTime ldt = LocalDateTime.of(2023, 6, 15, 10, 30);
        ZoneId zoneNY = ZoneId.of("America/New_York");
        ZonedDateTime zdtNY = ldt.atZone(zoneNY);
        
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm z VV");
        System.out.println(formatter.format(zdtNY));
        
        ZoneId zoneTokyo = ZoneId.of("Asia/Tokyo");
        ZonedDateTime zdtTokyo = zdtNY.withZoneSameInstant(zoneTokyo);
        System.out.println(formatter.format(zdtTokyo));
    }
}
```

Output khi thực thi đoạn mã này là gì?

**A)** 
```
2023-06-15 10:30 EDT America/New_York
2023-06-15 23:30 JST Asia/Tokyo
```

**B)** 
```
2023-06-15 10:30 EDT New_York
2023-06-15 23:30 JST Tokyo
```

**C)** 
```
2023-06-15 10:30 -04:00 America/New_York
2023-06-15 23:30 +09:00 Asia/Tokyo
```

**D)** 
```
2023-06-15 10:30 America/New_York
2023-06-15 23:30 Asia/Tokyo
```

**E)** Đoạn mã sẽ ném `DateTimeException` vì mẫu của formatter không hợp lệ.
