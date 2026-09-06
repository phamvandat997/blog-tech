---
layout: chapter

title: "Chương 13: Java Platform Module System"
subtitle: "The Java Platform Module System"
exam_objectives:
  - "Định nghĩa module và phơi bày nội dung module, kể cả qua reflection, khai báo dependency giữa các module, định nghĩa service, provider và consumer."
  - "Biên dịch mã Java, tạo jar module hoá và phi module, tạo runtime image, và thực hiện việc chuyển sang module bằng unnamed module cùng automatic module."

previous_link: "/ch12.html"
previous_title: "File I/O"
next_link: "/ch14.html"
next_title: "Localization"
answers_link: "/ch13a.html"

description: "JPMS trong Java 21: named/automatic/unnamed module, module-info.java, exports, requires, opens, service với ServiceLoader, cùng các công cụ javac, jar, jdeps, jmod và jlink."
order: 2
phase: "Chương 13"
tags: [Java, OCP, JPMS, Module, module-info, jdeps, jlink, jmod, ServiceLoader]
---

## Nội dung chương

- [Giới thiệu](#heading-giới-thiệu)
- [Các loại module](#heading-các-loại-module)
    - [Named module](#heading-named-module)
    - [Automatic module](#heading-automatic-module)
    - [Unnamed module](#heading-unnamed-module)
- [Tạo một module](#heading-tạo-một-module)
    - [Cấu trúc thư mục](#heading-cấu-trúc-thư-mục)
    - [Các file class](#heading-các-file-class)
    - [File `module-info.java`](#heading-file-module-infojava)
- [Khai báo module](#heading-khai-báo-module)
    - [Export một package](#heading-export-một-package)
    - [Kiểm soát truy cập với module](#heading-kiểm-soát-truy-cập-với-module)
    - [Require một module](#heading-require-một-module)
    - [Mở một package](#heading-mở-một-package)
- [Những module có sẵn](#heading-những-module-có-sẵn)
    - [Các module Java cốt lõi](#heading-các-module-java-cốt-lõi)
    - [Các module JDK](#heading-các-module-jdk)
- [Dùng dòng lệnh](#heading-dùng-dòng-lệnh)
    - [Biên dịch class bằng `javac`](#heading-biên-dịch-class-bằng-javac)
    - [Chạy class bằng `java`](#heading-chạy-class-bằng-java)
    - [Đóng gói bằng `jar`](#heading-đóng-gói-bằng-jar)
- [Nhiều module](#heading-nhiều-module)
    - [Thiết kế ứng dụng nhiều module](#heading-thiết-kế-ứng-dụng-nhiều-module)
    - [Giao tiếp giữa các module](#heading-giao-tiếp-giữa-các-module)
    - [Giải quyết xung đột giữa các module](#heading-giải-quyết-xung-đột-giữa-các-module)
- [Tạo một service](#heading-tạo-một-service)
- [Xem chi tiết module](#heading-xem-chi-tiết-module)
    - [Mô tả một module](#heading-mô-tả-một-module)
    - [Liệt kê những module khả dụng](#heading-liệt-kê-những-module-khả-dụng)
    - [Phân giải module](#heading-phân-giải-module)
    - [Dùng lệnh `jar`](#heading-dùng-lệnh-jar)
- [Phân tích dependency bằng `jdeps`](#heading-phân-tích-dependency-bằng-jdeps)
- [Dùng file module với `jmod`](#heading-dùng-file-module-với-jmod)
    - [Định dạng file JMOD](#heading-định-dạng-file-jmod)
    - [Các chế độ hoạt động](#heading-các-chế-độ-hoạt-động)
    - [Thực hành tốt và giới hạn](#heading-thực-hành-tốt-và-giới-hạn)
- [Tạo runtime image bằng `jlink`](#heading-tạo-runtime-image-bằng-jlink)
    - [Cú pháp và tuỳ chọn của `jlink`](#heading-cú-pháp-và-tuỳ-chọn-của-jlink)
    - [Plugin](#heading-plugin)
    - [Tối ưu runtime image](#heading-tối-ưu-runtime-image)
- [Chuyển đổi một ứng dụng](#heading-chuyển-đổi-một-ứng-dụng)
- [Các điểm chính](#heading-các-điểm-chính)
- [Câu hỏi luyện tập](#heading-câu-hỏi-luyện-tập)

---
## Giới thiệu

Một trong những thay đổi quan trọng nhất được giới thiệu ở Java 9 là Java Platform Module System (JPMS). Nhưng chính xác thì JPMS là gì, và tại sao ta nên quan tâm tới nó?

Hãy bắt đầu bằng việc hiểu module là gì trong ngữ cảnh này.

Một module trong Java giống như một khu vực trong thư viện được sắp xếp ngăn nắp. Mỗi module có nhãn rõ ràng (tên của nó) và chứa những cuốn sách cụ thể (các package Java). Tuy nhiên, bạn không thể mượn cuốn sách nào nếu không có thẻ thư viện (một khai báo dependency) cho khu vực đó.

Trong ví dụ này:
```java
module com.myapp.core {
    requires java.base;
    exports com.myapp.core.api;
}
```

Ta đang khai báo một module tên `com.myapp.core`. Nó yêu cầu module `java.base` (giống như có thẻ thư viện cho khu vực Java cơ bản) và export package `com.myapp.core.api` (khiến một số cuốn sách của nó khả dụng với các module khác).

Trong khi package nhóm các class liên quan lại với nhau, module đẩy khái niệm này đi xa hơn bằng cách nhóm các package liên quan và khai báo tường minh dependency cùng API được phơi bày của chúng.

Hãy xét những lợi ích của việc dùng JPMS:

- **Đóng gói (encapsulation) tốt hơn:** Module cho phép bạn giấu chi tiết cài đặt hiệu quả hơn so với chỉ dùng package, giảm rủi ro API nội bộ bị dùng ngoài ý muốn.
- **Dependency rõ ràng hơn:** Module nêu tường minh các dependency, khiến cấu trúc hệ thống dễ thấy hơn và giúp tránh *JAR hell* do dependency xung đột.
- **Hiệu năng tốt hơn:** JVM tối ưu được thời gian khởi động và mức dùng bộ nhớ vì nó biết chính xác cần những đoạn mã nào.
- **Bảo mật tốt hơn:** Bằng cách kiểm soát truy cập, bạn giảm được bề mặt tấn công của ứng dụng.

JPMS gồm:

- File `module-info.java`: Định nghĩa module của bạn, các dependency của nó và những gì nó export.
- Các từ khoá mới: `module`, `requires`, `exports`, `opens`, `uses` và `provides`.
- Công cụ để làm việc với module: Như `jlink`, dùng để tạo runtime image tuỳ chỉnh.

Đây là một file `module-info.java` mẫu phức tạp hơn:

```java
module com.myapp.core {
    requires java.base;
    requires java.sql;
    
    exports com.myapp.core.api;
    exports com.myapp.core.util to com.myapp.plugin;
    
    opens com.myapp.core.model;
    
    uses com.myapp.core.spi.Plugin;
    provides com.myapp.core.spi.Logger 
        with com.myapp.core.logging.FileLogger;
}
```

Khai báo module này cho thấy:
- Nhiều module được yêu cầu.
- Export một package cho mọi module và một package khác chỉ cho một module cụ thể.
- Mở một package cho reflection.
- Dùng một service interface và cung cấp một implementation.

Bạn vẫn dùng được classpath, nhưng sẽ bỏ lỡ những lợi ích của JPMS. Classpath giống như một đống sách lớn không được sắp xếp, còn module path là một thư viện ngăn nắp với quyền truy cập được kiểm soát và dependency rõ ràng.

Ngay cả trong dự án nhỏ, module vẫn cải thiện được khả năng đóng gói và bảo trì. Hãy xét ví dụ nhỏ sau:

```java
// In module com.myapp.core
module com.myapp.core {
    exports com.myapp.core.api;
}

package com.myapp.core.api;
public interface UserService {
    User getUser(String id);
}

package com.myapp.core.internal;
class UserServiceImpl implements UserService {
    public User getUser(String id) {
        // Implementation
    }
}

// In module com.myapp.web
module com.myapp.web {
    requires com.myapp.core;
}

package com.myapp.web;
import com.myapp.core.api.UserService;
// import com.myapp.core.internal.UserServiceImpl; // This would cause a compile-time error

public class UserController {
    private UserService userService;
    // ...
}
```

Trong ví dụ này, module `web` chỉ truy cập được package `api` của module `core`, chứ không truy cập được phần cài đặt nội bộ của nó.

Module cung cấp công cụ để áp đặt và diễn đạt kiến trúc hệ thống của bạn ở mức ngôn ngữ và JVM.

Hãy nghĩ thế này: Bạn muốn có một hộp lớn đầy gạch LEGO lộn xộn, hay những bộ được sắp xếp gọn gàng kèm hướng dẫn rõ ràng? Cả hai cách đều dựng được những thứ tuyệt vời, nhưng một cách khiến quá trình mượt mà và ít lỗi hơn nhiều.


## Các loại module
Giờ khi đã nắm được module là gì và vì sao chúng hữu ích, hãy đi sâu vào những loại module khác nhau trong JPMS. Cũng như không phải cuốn sách nào trong thư viện cũng giống nhau, không phải module nào cũng như nhau. JPMS giới thiệu ba loại module: 

- Named module
- Automatic module
- Unnamed module

### Named module
Named module giống như những cuốn sách được biên mục đàng hoàng trong thư viện của ta, có tiêu đề rõ ràng, thông tin tác giả và một vị trí trên kệ. Theo thuật ngữ Java, một named module được định nghĩa bằng file `module-info.java` đặt tại thư mục gốc của module.

Đây là ví dụ về nội dung của file này:

```java
module com.myapp.core {
    requires java.base;
    exports com.myapp.core.api;
}
```

File `module-info.java` này là chứng minh thư của module. Nó đặt tên cho module (`com.myapp.core` trong trường hợp này), liệt kê các dependency (`requires java.base`) và khai báo những phần nó sẵn sàng chia sẻ với các module khác (`exports com.myapp.core.api`).

Named module là loại module mạnh mẽ và linh hoạt nhất. Chúng cho bạn toàn quyền kiểm soát dependency của module và những gì nó phơi bày ra bên ngoài. Nếu bạn bắt đầu một dự án mới hoặc tái cấu trúc dự án hiện có để dùng JPMS, named module là thứ bạn sẽ làm việc cùng hầu hết thời gian.

### Automatic module

Nhưng còn tất cả những thư viện bên thứ ba chưa được module hoá thì sao? Đây là lúc automatic module xuất hiện. Chúng giống như những cuốn sách trong thư viện chưa có mục lục đàng hoàng, nhưng ta vẫn muốn mượn được.

Khi bạn đặt một file JAR phi module lên module path, Java runtime tự động coi nó như một module. Module này được gọi là automatic module.

Trong ví dụ này:
```java
module com.myapp.core {
    requires java.base;
    requires commons.lang; // This is an automatic module
    exports com.myapp.core.api;
}
```

`commons.lang` là một automatic module. Ta require nó y như với một named module, dù nó không có file `module-info.java`.

Nhưng Java xác định tên của một automatic module bằng cách nào? Quá trình diễn ra như sau:

1. Đầu tiên, nó tìm mục `Automatic-Module-Name` trong file `MANIFEST.MF` của JAR. Nếu có, đó chính là tên module.
2. Nếu không có, nó suy ra tên từ tên file JAR. Nó bỏ phần mở rộng và số phiên bản, rồi thay các ký tự không phải chữ-số bằng dấu chấm.

Ví dụ:
- `commons-lang3-3.14.jar` trở thành automatic module `commons.lang3`
- `guava-33.2.1-jre.jar` trở thành `guava`

Bạn thấy được điều này khi dùng lệnh `jar`:

```
$ jar --describe-module --file=guava-28.0-jre.jar
No module descriptor found. Derived automatic module.

Automatic module name: guava
...
```

### Unnamed module
Cuối cùng nhưng không kém phần quan trọng, ta có unnamed module. Chúng giống như cái hộp linh tinh trong thư viện, nơi chứa mọi tờ giấy rời và mẩu đánh dấu không thuộc về đâu cả.

Khi bạn chạy ứng dụng trên classpath (không phải module path), mọi đoạn mã không thuộc về named module hay automatic module đều rơi vào một unnamed module lớn duy nhất. Unnamed module này đọc được mọi module khác, nghĩa là nó truy cập được mọi package do các module khác export.

Trong lệnh này:

```
java -cp app.jar:lib/* com.myapp.Main
```

`app.jar` và mọi thứ trong thư mục `lib` sẽ thuộc về unnamed module.

Unnamed module quan trọng cho tính tương thích ngược, cho phép mã Java hiện có chạy mà không cần sửa đổi trên Java 9 và các phiên bản sau. Tuy nhiên, mã trong unnamed module không hưởng được lợi ích đóng gói mạnh mà named module đem lại.

Đây là một bảng so sánh nhanh:

| Loại module | Có module-info.java | Trên Module Path | Trên Classpath |
|-------------|----------------------|----------------|--------------|
| Named       | Có                  | Có            | Không           |
| Automatic   | Không                   | Có            | Không           |
| Unnamed     | Không                   | Không             | Có          |

Hiểu những loại module khác nhau này là chìa khoá để làm việc hiệu quả với JPMS. Named module cho bạn nhiều quyền kiểm soát và lợi ích nhất, automatic module giúp bạn tích hợp các thư viện phi module, còn unnamed module đảm bảo mã hiện có của bạn vẫn chạy được.

Đây là sơ đồ tóm tắt các loại module:
```
┌─────────────────────────────────────────────────────────┐
│                   Java Module Types                     │
│                                                         │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │   Named     │    │  Automatic  │    │   Unnamed   │  │
│  │   Module    │    │   Module    │    │   Module    │  │
│  ├─────────────┤    ├─────────────┤    ├─────────────┤  │
│  │ - Explicit  │    │ - No module-│    │ - No module-│  │
│  │   module-   │    │   info.java │    │   info.java │  │
│  │   info.java │    │ - On module │    │ - Not on    │  │
│  │ - Defined   │    │   path      │    │   module    │  │
│  │   exports   │    │ - Name      │    │   path      │  │
│  │ - Defined   │    │   derived   │    │ - Implicitly│  │
│  │   requires  │    │   from JAR  │    │   exports   │  │
│  │             │    │   filename  │    │   all pkgs  │  │
│  └─────────────┘    └─────────────┘    └─────────────┘  │
│                                                         │
│  Use for:           Use for:           Use for:         │
│  - New Java 9+      - Legacy JARs      - Class path     │
│    projects         - Transition       - Compatibility  │
│  - Full module      - Third-party      - Non-modular    │
│    control            libraries          code           │
│                                                         │
└─────────────────────────────────────────────────────────┘

Điểm chính:
- Named module cho toàn quyền kiểm soát exports và requires
- Automatic module bắc cầu giữa mã module hoá và mã phi module
- Unnamed module đảm bảo tương thích ngược
```

## Tạo một module

Giờ khi đã tìm hiểu các loại module, hãy tự tay tạo một module. Tạo module giống như dựng một khu vực mới trong thư viện của bạn. Ta cần quyết định cấu trúc của nó, nó chứa những cuốn sách (class) nào, và những quy tắc (`module-info.java`) nào chi phối việc sử dụng nó.

### Cấu trúc thư mục

Cấu trúc thư mục cho một module khá đơn giản, nhưng quan trọng là phải làm đúng. Đây là bố cục điển hình:

```
mymodule/
├── src/
│   ├── module-info.java
│   ├── com/
│   │   └── mycompany/
│   │       └── mymodule/
│   │           ├── MyClass.java
│   │           └── AnotherClass.java
│   └── resources/
│       └── config.properties
```

Hãy phân tích:

- Thư mục cấp cao nhất (`mymodule/`) thường được đặt theo tên module.
- Bên trong, ta có thư mục `src/`. Đây là nơi chứa mọi file mã nguồn.
- File `module-info.java` nằm ngay dưới `src/`. Điều này quan trọng, vì nó định nghĩa module của ta.
- Cấu trúc package Java thực tế (`com.mycompany.mymodule`) được thể hiện bằng các thư mục lồng nhau dưới `src/`.
- Tài nguyên (những file không phải Java) đặt được trong một thư mục riêng.

Cấu trúc này có thể trông quen thuộc; nó rất giống cách ta tổ chức dự án Java phi module. Khác biệt then chốt là sự hiện diện của file `module-info.java`.

### Các file class

Giờ hãy xem bên trong những file Java của ta có gì. Đây là ví dụ về `MyClass.java`:

```java
package com.mycompany.mymodule;

public class MyClass {
    public void doSomething() {
        System.out.println("MyClass is doing something!");
    }
}
```

Đây chỉ là một class Java thông thường. Tuy nhiên, khai báo `package` ở đầu file rất quan trọng vì nó xác định class này nằm ở đâu trong cấu trúc module.

Đây là `AnotherClass.java`:

```java
package com.mycompany.mymodule;

public class AnotherClass {
    private MyClass myClass = new MyClass();

    public void doSomethingElse() {
        System.out.println("AnotherClass is doing something else!");
        myClass.doSomething();
    }
}
```

Một lần nữa, đây là class Java tiêu chuẩn. Chú ý cách nó dùng `MyClass` mà không cần import đặc biệt nào, vì cả hai nằm trong cùng package.

### File `module-info.java`

File này là thứ biến tập hợp package của ta thành một module thực thụ. Nó giống như tủ mục lục cho khu vực thư viện, xác định cái gì có sẵn và cái gì cần thiết.

Đây là nội dung mà một `module-info.java` cơ bản có thể có:

```java
module com.mycompany.mymodule {
    exports com.mycompany.mymodule;
    requires java.base;
}
```

Hãy phân tích:

- `module com.mycompany.mymodule`: Khai báo tên module. Theo quy ước, tên này thường trùng với tên package gốc.
- `exports com.mycompany.mymodule`: Dòng này khiến package của ta truy cập được từ các module khác. Không có nó, các class của ta sẽ bị ẩn với thế giới bên ngoài.
- `requires java.base`: Khai báo dependency tới module Java cơ sở. Thực ra dòng này là tuỳ chọn, vì mọi module đều ngầm require `java.base`.

Nhưng ta làm được những thứ tinh vi hơn. Giả sử ta muốn dùng một framework logging và cung cấp một service:

```java
module com.mycompany.mymodule {
    exports com.mycompany.mymodule;
    requires java.base;
    requires org.apache.logging.log4j;
    
    provides com.mycompany.service.MyService 
        with com.mycompany.mymodule.MyServiceImpl;
    
    uses com.mycompany.service.AnotherService;
}
```

Ở đây ta require module Log4j, cung cấp một implementation của `MyService`, và khai báo rằng ta sẽ dùng `AnotherService` (được một module khác cung cấp).

File `module-info.java` này chẳng phải giống nhãn dinh dưỡng trên bao bì thực phẩm sao? Nó cho bạn biết bên trong có gì (exports), nó cần gì (requires), nó làm được gì cho bạn (provides) và nó mong dùng cái gì (uses).

Một điều cần lưu ý: nếu bạn dùng IDE, hãy đảm bảo nó được thiết lập để làm việc với module Java. Một số IDE tự tạo file `module-info.java` khi bạn tạo module mới, số khác lại yêu cầu bạn tự tạo thủ công.

Ví dụ, giả sử có một class `Main` như sau:
```java
package com.mycompany.mymodule;

public class Main {
    public static void main(String[] args) {
        System.out.println("Main class is running!");
        
        MyClass myClass = new MyClass();
        myClass.doSomething();
        
        AnotherClass anotherClass = new AnotherClass();
        anotherClass.doSomethingElse();
    }
}

```

Đây là cách biên dịch và chạy module này từ dòng lệnh:

```
javac -d mods/com.mycompany.mymodule 
    src/module-info.java 
    src/com/mycompany/mymodule/*.java

java --module-path mods -m com.mycompany.mymodule/com.mycompany.mymodule.Main
```

Lệnh đầu biên dịch module, lệnh thứ hai chạy nó. Chú ý cách ta chỉ định module path (`--module-path mods`) và class chính (`-m com.mycompany.mymodule/com.mycompany.mymodule.Main`). Ngoài ra, với cả lệnh `javac` lẫn `java`, bạn dùng được tuỳ chọn ngắn `-p` thay cho `--module-path`.


## Khai báo module

Giờ khi đã dựng xong cấu trúc module, hãy xem xét chính phần khai báo module trong file `module-info.java`.

### Export một package

Từ khoá `exports` được dùng để khiến các package của module truy cập được từ những module khác. Đây là một ví dụ:

```java
module com.mycompany.mymodule {
    exports com.mycompany.mymodule.api;
}
```

Trong ví dụ này, ta khiến package `com.mycompany.mymodule.api` khả dụng cho các module khác dùng. Mọi kiểu public trong package này giờ truy cập được từ những module require nó.

Nhưng nếu ta muốn chọn lọc hơn thì sao? Module Java cũng cho phép điều đó:

```java
module com.mycompany.mymodule {
    exports com.mycompany.mymodule.api to com.mycompany.anothermodule, com.mycompany.yetanothermodule;
}
```

Khai báo này export package, nhưng chỉ cho những module được chỉ định. Đây là cách kiểm soát truy cập vào phần bên trong module của bạn.

### Kiểm soát truy cập với module

Module bổ sung một lớp kiểm soát truy cập nữa lên trên những modifier sẵn có của Java là `public`, `protected`, package-private và `private`. Cách hoạt động như sau:

1. Kiểu public trong package được export thì truy cập được từ những module khác.
2. Kiểu public trong package không được export thì chỉ truy cập được bên trong module.
3. Thành viên protected trong package được export thì truy cập được trong các subclass ở module khác.
4. Mọi quy tắc truy cập khác (`protected`, package-private, `private`) vẫn áp dụng như thường lệ.

Hãy xem điều này trong thực tế:

```java
// In module com.mycompany.mymodule
module com.mycompany.mymodule {
    exports com.mycompany.mymodule.api;
}

// In package com.mycompany.mymodule.api
public class PublicAPI {
    public void doSomething() { ... }
}

// In package com.mycompany.mymodule.internal
public class InternalClass {
    public void doSomethingElse() { ... }
}

// In another module
import com.mycompany.mymodule.api.PublicAPI; // This works
import com.mycompany.mymodule.internal.InternalClass; // This fails!
```

Dù `InternalClass` là public, nó vẫn không truy cập được từ bên ngoài module vì package của nó không được export. Giống như có một phòng đọc "công cộng" nhưng chỉ nhân viên mới vào được.

### Require một module

Từ khoá `requires` là cách ta khai báo dependency tới những module khác. Hãy xét ví dụ này:

```java
module com.mycompany.mymodule {
    requires java.sql;
}
```

Điều này báo cho Java runtime biết module của ta phụ thuộc vào module `java.sql`.

Nhưng nếu ta xây trên nền một module khác và muốn phơi bày chức năng của nó qua module của mình thì sao? Đó là lúc `requires transitive` phát huy tác dụng:

```java
module com.mycompany.mymodule {
    requires transitive java.sql;
}
```

Giờ đây, mọi module require module của ta cũng sẽ tự động require `java.sql`. Giống như nói "nếu bạn mượn sách ở khu vực của chúng tôi, bạn cũng sẽ được cấp thẻ thư viện cho khu vực SQL."

Điều này đặc biệt hữu ích khi bạn tạo một API xây trên module khác. Người dùng của bạn không cần biết về những dependency bên dưới, họ chỉ cần require module của bạn và mọi thứ khác sẽ đi kèm.

### Mở một package

Đôi khi ta cần cho phép truy cập bằng reflection tới một package lúc runtime, dù package đó không được export. Đây là lúc từ khoá `opens` trở nên tiện dụng. Hãy xét ví dụ này:

```java
module com.mycompany.mymodule {
    opens com.mycompany.mymodule.internal;
}
```

Điều này cho phép truy cập bằng reflection tới mọi kiểu của package lúc runtime, nhưng không cho phép truy cập lúc biên dịch từ những module khác.

Bạn cũng mở được một package cho những module cụ thể:

```java
module com.mycompany.mymodule {
    opens com.mycompany.mymodule.internal to com.mycompany.testmodule;
}
```

Điều này đặc biệt hữu ích với các framework kiểm thử hoặc thư viện dependency injection cần truy cập phần bên trong module của bạn.

Nếu bạn cần mở toàn bộ package trong module cho reflection, dùng từ khoá `open` ngay trên phần khai báo module:

```java
open module com.mycompany.mymodule {
    // module declarations
}
```

Hệ thống module này chẳng phải giống việc thiết lập cấp độ an ninh trong một thư viện mật sao? Bạn có khu vực công cộng (package được export), khu vực hạn chế (package không export), đặc quyền truy cập riêng (opens), và cả cấp phép an ninh mang tính bắc cầu (requires transitive). Nó cho bạn quyền kiểm soát chi tiết về việc ai truy cập được cái gì trong codebase.

Đây là một ví dụ phức tạp hơn tổng hợp mọi thứ:

```java
module com.mycompany.mymodule {
    exports com.mycompany.mymodule.api;
    exports com.mycompany.mymodule.util to com.mycompany.partnermodule;
    
    requires java.base; // This is implicit
    requires transitive com.mycompany.commonmodule;
    requires org.apache.logging.log4j;
    
    opens com.mycompany.mymodule.internal to org.junit.jupiter.api;
}
```

Module này export một package cho toàn cục và một package khác cho một module cụ thể, require vài module (một trong số đó theo kiểu transitive), và mở một package cho việc kiểm thử.



## Những module có sẵn

Giờ khi đã tìm hiểu cách tạo module và service của riêng mình, hãy xem những module có sẵn trong nền tảng Java. Những module dựng sẵn này cung cấp các dịch vụ và tài nguyên thiết yếu để mọi thứ khác xây dựng lên trên.

### Các module Java cốt lõi

Những module bắt đầu bằng `java` là module cốt lõi của Java SE Platform. Chúng chứa những API nền tảng mà hầu hết ứng dụng Java đều dựa vào.

Đây là vài module `java` thường dùng nhất:

1. `java.base`: Đây là module nền móng của Java SE Platform. Nó được mọi module khác tự động require, giống như mọi khu vực của thư viện đều dựa trên các nguyên tắc tổ chức cơ bản.

   ```java
   // You don't need to explicitly require java.base
   module com.mycompany.app {
       // java.base is implicitly required
   }
   ```

2. `java.sql`: Cung cấp API để truy cập và xử lý dữ liệu lưu trong một nguồn dữ liệu (thường là cơ sở dữ liệu quan hệ) bằng ngôn ngữ Java.

   ```java
   module com.mycompany.app {
       requires java.sql;
   }
   ```

3. `java.xml`: Chứa các API để xử lý XML.

   ```java
   module com.mycompany.app {
       requires java.xml;
   }
   ```

4. `java.desktop`: Định nghĩa các API để tạo ứng dụng desktop phong phú, gồm AWT và Swing.

   ```java
   module com.mycompany.app {
       requires java.desktop;
   }
   ```

5. `java.logging`: Cung cấp các class và interface của Java Logging API.

   ```java
   module com.mycompany.app {
       requires java.logging;
   }
   ```

Những module `java` này cung cấp chức năng cốt lõi mà hầu hết ứng dụng Java dựa vào. Chúng ổn định, được tài liệu hoá tốt và tạo thành xương sống của hệ sinh thái Java.

### Các module JDK

Những module bắt đầu bằng `jdk` cũng là một phần của Java Development Kit, nhưng chúng không được coi là thuộc đặc tả Java SE Platform cốt lõi. Chúng cung cấp thêm công cụ và API hữu ích cho một số loại hệ thống nhưng không cần thiết với mọi ứng dụng.

Đây là vài ví dụ về module `jdk`:

1. `jdk.httpserver`: Cung cấp một API HTTP server đơn giản.

   ```java
   module com.mycompany.app {
       requires jdk.httpserver;
   }
   ```

2. `jdk.jshell`: Chứa JShell API, cho phép bạn tạo một shell Java tương tác.

   ```java
   module com.mycompany.app {
       requires jdk.jshell;
   }
   ```

3. `jdk.security.auth`: Cung cấp các implementation của những interface javax.security.auth.*.

   ```java
   module com.mycompany.app {
       requires jdk.security.auth;
   }
   ```

Điều quan trọng cần lưu ý là trong khi module `java` được đảm bảo có mặt ở mọi bản cài đặt Java SE, module `jdk` thì có thể không. Chúng thuộc về JDK nhưng không thuộc đặc tả Java SE. Nghĩa là nếu bạn dùng một module `jdk`, mã của bạn có thể không khả chuyển trên mọi bản cài đặt Java SE.

Đây là ví dụ về cách bạn dùng cả hai loại module:

```java
module com.mycompany.app {
    requires java.base;  // This is implicit
    requires java.sql;   // For database operations
    requires java.logging;  // For logging
    requires jdk.httpserver;  // To create a simple HTTP server
    
    exports com.mycompany.app.api;
}
```

Trong khai báo module này, ta dùng cả module `java` lẫn `jdk`. Ta dựa vào chức năng Java cốt lõi cho thao tác database và logging, đồng thời dùng HTTP server đơn giản của JDK cho một số chức năng bổ sung.



## Dùng dòng lệnh

IDE rất tốt cho năng suất, nhưng hiểu cách dùng lệnh `javac` và `java` vẫn quan trọng. Giống như biết nấu một bữa ăn từ đầu thay vì chỉ hâm lại món làm sẵn.

Có vài lý do chính đáng để học cách biên dịch và chạy mã Java từ dòng lệnh:

- Hiểu điều gì đang diễn ra bên dưới.
- Gỡ rối các vấn đề khi build.
- Viết script build hoặc thiết lập pipeline CI/CD.
- Làm việc trong môi trường không có IDE.

Hãy coi đó như học cách thay lốp xe. Bạn có thể không cần làm thường xuyên, nhưng khi cần, bạn sẽ mừng vì mình biết cách.

### Biên dịch class bằng `javac`

Hãy bắt đầu từ những điều cơ bản. Đây là cách bạn biên dịch một file Java đơn giản:

```
javac MyClass.java
```

Lệnh này biên dịch `MyClass.java` trong package mặc định. Nhưng khi bạn có package thì sao?

```
javac com/mycompany/myapp/MyClass.java
```

Lệnh này biên dịch `MyClass.java` trong package `com.mycompany.myapp`.

Gõ ra từng tên file có thể rất mệt. May thay, bạn dùng được ký tự đại diện:

```
javac com/mycompany/myapp/*.java
```

Lệnh này biên dịch mọi file `.java` trong thư mục `com/mycompany/myapp`.

Ta thường muốn tách file mã nguồn khỏi class đã biên dịch. Tuỳ chọn `-d` cho phép chỉ định thư mục đầu ra:

```
javac -d bin com/mycompany/myapp/*.java
```

Lệnh này biên dịch mọi file `.java` và đặt các file `.class` kết quả vào thư mục `bin`, giữ nguyên cấu trúc package.

Khi mã của ta phụ thuộc vào thư viện bên ngoài, ta cần báo cho trình biên dịch biết tìm chúng ở đâu. Đó là lúc tuỳ chọn classpath xuất hiện:

```
javac -cp lib/dependency.jar com/mycompany/myapp/*.java
```

Lệnh này báo trình biên dịch tìm class trong `dependency.jar` khi biên dịch mã của ta. Bạn chỉ định được nhiều file JAR hoặc thư mục bằng cách phân tách chúng bằng dấu hai chấm (`:`) trên hệ thống kiểu Unix hoặc dấu chấm phẩy (`;`) trên Windows.

Nhân nói về file JAR, đây là cách biên dịch với nhiều JAR:

```
javac -cp lib/dependency1.jar:lib/dependency2.jar com/mycompany/myapp/*.java
```

Lệnh này biên dịch mã của ta bằng class từ cả `dependency1.jar` lẫn `dependency2.jar`.

Khi làm việc với module, ta cần chỉ định module path:

```
javac --module-path mods -d out src/module-info.java src/com/mycompany/myapp/*.java
```

Lệnh này biên dịch module của ta, tìm dependency trong thư mục `mods` và xuất kết quả ra thư mục `out`.

### Chạy class bằng `java`

Khi đã biên dịch xong một class, bạn chạy nó bằng:

```
java com.mycompany.myapp.MyClass
```

Lệnh này chạy `MyClass` trong package `com.mycompany.myapp`. Lưu ý rằng ta không kèm phần mở rộng `.class`.

Cũng như khi biên dịch, ta có thể cần chỉ định classpath khi chạy mã:

```
java -cp bin:lib/dependency.jar com.mycompany.myapp.MyClass
```

Lệnh này chạy `MyClass`, tìm class trong cả thư mục `bin` lẫn `dependency.jar`.

Để chạy một ứng dụng module hoá, ta dùng tuỳ chọn `--module-path` và `-m`:

```
java --module-path out:mods -m com.mycompany.myapp/com.mycompany.myapp.MyClass
```

Lệnh này chạy `MyClass` từ module `com.mycompany.myapp`, tìm module trong thư mục `out` và `mods`.

### Đóng gói bằng `jar`

Bạn thường sẽ muốn đóng gói ứng dụng thành một file JAR. Lệnh `jar` giúp bạn làm điều đó:

```
jar -cvf myapp.jar -C bin .
```

Hãy phân tích:
- `-c` hoặc `--create`: Tạo một archive mới
- `-v` hoặc `--verbose`: Xuất thông tin chi tiết
- `-f` hoặc `--file`: Chỉ định tên file archive
- `-C bin`: Chuyển sang thư mục `bin` trước khi thêm file
- `.`: Thêm mọi file trong thư mục hiện tại (giờ là `bin`)

Với ứng dụng module hoá, bạn đóng gói module thành một modular JAR:

```
jar --create --file mods/com.mycompany.myapp.jar --main-class com.mycompany.myapp.MyClass -C out .
```

Lệnh này tạo một file modular JAR, tuỳ chọn chỉ định `MyClass` làm class chính.

Đây là ví dụ phức tạp hơn kết nối mọi thứ lại:

```bash
# Compile the module
javac --module-path mods -d out \
    src/module-info.java \
    src/com/mycompany/myapp/*.java

# Package the module
jar --create --file mods/com.mycompany.myapp.jar \
    --main-class com.mycompany.myapp.MyClass \
    -C out .

# Run the module
java --module-path mods \
    -m com.mycompany.myapp/com.mycompany.myapp.MyClass
```

Chuỗi lệnh này biên dịch module, đóng gói nó thành JAR rồi chạy nó.

Theo quy ước, ta lưu các module đã biên dịch trong thư mục `mods`. Khi dùng `--module-path mods` trong lệnh Java, ta đang báo cho Java tìm module trong thư mục `mods` này.


## Nhiều module
Đến giờ ta mới làm việc với một module duy nhất, giống như sắp xếp một kệ sách trong thư viện. Nhưng ứng dụng thực tế thường cần nhiều module phối hợp với nhau, gần với việc tổ chức cả một thư viện gồm nhiều khu vực hơn. 

### Thiết kế ứng dụng nhiều module

Thiết kế ứng dụng nhiều module giống như lên sơ đồ bố trí cho một thư viện lớn. Bạn cần nghĩ xem các khu vực (module) khác nhau sẽ tương tác ra sao, chúng chia sẻ tài nguyên gì, và tổ chức thế nào để dễ điều hướng và bảo trì.

Đây là ví dụ đơn giản về cấu trúc một ứng dụng nhiều module:

```
myapp/
├── core/
│   └── src/
│       ├── main/
│       │   └── java/
│       │       ├── module-info.java
│       │       └── com/mycompany/core/
│       └── test/
├── api/
│   └── src/
│       ├── main/
│       │   └── java/
│       │       ├── module-info.java
│       │       └── com/mycompany/api/
│       └── test/
└── app/
    └── src/
        ├── main/
        │   └── java/
        │       ├── module-info.java
        │       └── com/mycompany/app/
        └── test/
```

Trong cấu trúc này:
- `core` chứa chức năng cốt lõi và logic nghiệp vụ miền
- `api` định nghĩa những interface công khai cho ứng dụng
- `app` là ứng dụng chính kết nối mọi thứ lại

Khi làm việc với nhiều module, hiểu được dependency giữa chúng là điều quan trọng.

Hãy xem cách ta định nghĩa dependency cho ví dụ trên:

```java
// core/src/main/java/module-info.java
module com.mycompany.core {
    exports com.mycompany.core;
}

// api/src/main/java/module-info.java
module com.mycompany.api {
    requires com.mycompany.core;
    exports com.mycompany.api;
}

// app/src/main/java/module-info.java
module com.mycompany.app {
    requires com.mycompany.core;
    requires com.mycompany.api;
}
```

Trong thiết lập này, cả `api` lẫn `app` đều phụ thuộc vào `core`, và `app` còn phụ thuộc vào `api`. Điều này tạo ra một hệ phân cấp dependency ảnh hưởng tới cách bạn phát triển và bảo trì ứng dụng:

- Thay đổi trong `core` ảnh hưởng tới cả `api` lẫn `app`.
- Thay đổi trong `api` ảnh hưởng tới `app`, nhưng không ảnh hưởng `core`.
- Thay đổi trong `app` không trực tiếp ảnh hưởng tới các module khác.

Tuy nhiên, cấu trúc dependency này giúp áp đặt một kiến trúc sạch sẽ, ngăn module ở tầng thấp phụ thuộc vào module ở tầng cao hơn. 

Khi tổ chức mã qua nhiều module, hãy nghĩ tới việc phân tách mối quan tâm và che giấu thông tin. Mỗi module nên có một mục đích rõ ràng, tập trung, và chỉ nên phơi bày những gì các module khác cần dùng.

Đây là ví dụ về cách bạn tổ chức một số class:

```java
// In core module
public class User { ... }
public class UserService { ... }

// In api module
public interface UserAPI { ... }

// In app module
public class UserController { ... }
```

Module `core` định nghĩa những object và service nền tảng của miền nghiệp vụ. Module `api` định nghĩa những interface công khai mà các phần khác của ứng dụng (hoặc hệ thống bên ngoài) sẽ dùng. Module `app` chứa logic riêng của ứng dụng, kết nối mọi thứ lại.

Cách tổ chức này cho phép bạn thay đổi phần bên trong của module `core` mà không ảnh hưởng tới bên dùng `api`, miễn là `api` giữ nguyên ổn định.

Dù vậy, quyết định mức độ chi tiết phù hợp cho module có thể khá khó. Quá ít module thì bạn mất đi lợi ích của việc module hoá; quá nhiều thì bạn thêm vào sự phức tạp không cần thiết. Đây là một số thực hành tốt:

1. **Nguyên tắc trách nhiệm đơn nhất:** Mỗi module chỉ nên có một, và chỉ một, lý do để thay đổi. 

2. **Đóng gói:** Module nên giấu phần bên trong và chỉ phơi bày những gì cần thiết. 

3. **Dependency ổn định:** Module nên phụ thuộc vào những module ổn định hơn chính nó. 

4. **Khả năng tái sử dụng:** Nếu một nhóm chức năng có thể hữu ích trong ngữ cảnh khác, hãy cân nhắc tách nó thành module riêng. 

5. **Kích thước:** Dù không có quy tắc cứng nhắc nào, module quá lớn sẽ trở nên khó xoay xở, còn module quá nhỏ có thể dẫn tới *dependency hell*. Hãy hướng tới những module mà một nhóm nhỏ có thể hiểu và bảo trì được một cách hợp lý.

Đây là ví dụ tái cấu trúc cấu trúc ở trên theo một hướng khác để cải thiện mức độ chi tiết:

```
myapp/
├── core/
│   ├── domain/
│   └── services/
├── api/
│   ├── internal/
│   └── public/
├── infrastructure/
│   ├── persistence/
│   └── messaging/
└── app/
    ├── web/
    └── cli/
```

Trong cấu trúc đã tái cấu trúc này:
- Ta tách `core` thành `domain` và `services` để phân biệt thực thể với logic nghiệp vụ.
- `api` được chia thành `internal` (dùng bên trong ứng dụng) và `public` (cho bên tiêu thụ bên ngoài).
- Ta thêm module `infrastructure` để xử lý những mối quan tâm xuyên suốt.
- `app` được tách thành `web` và `cli` cho những giao diện người dùng khác nhau.

Mức chi tiết này cho phép các module tập trung hơn, mỗi module có trách nhiệm rõ ràng, mà vẫn giữ cấu trúc tổng thể trong tầm quản lý.

### Giao tiếp giữa các module

Khi làm việc với nhiều module, việc giao tiếp giữa chúng trở nên quan trọng. Trong Java, giao tiếp giữa các module thường diễn ra qua những API được định nghĩa rõ ràng. 

Đây là cách bạn thiết lập điều đó:

```java
// In api module
module com.mycompany.api {
    exports com.mycompany.api;
}

public interface UserService {
    User getUser(String id);
    void updateUser(User user);
}

// In core module
module com.mycompany.core {
    requires com.mycompany.api;
    provides com.mycompany.api.UserService 
        with com.mycompany.core.UserServiceImpl;
}

public class UserServiceImpl implements UserService {
    public User getUser(String id) { ... }
    public void updateUser(User user) { ... }
}

// In app module
module com.mycompany.app {
    requires com.mycompany.api;
    uses com.mycompany.api.UserService;
}

public class UserController {
    @Inject
    private UserService userService;

    public void handleUserUpdate(String id, UserUpdateRequest request) {
        User user = userService.getUser(id);
        // Update user based on request
        userService.updateUser(user);
    }
}
```

Trong thiết lập này:
- Module `api` định nghĩa interface `UserService`.
- Module `core` cung cấp một implementation của `UserService`.
- Module `app` dùng `UserService` mà không cần biết về implementation của nó.

Cách tiếp cận này cho phép các module giao tiếp qua những interface được định nghĩa rõ ràng, thúc đẩy sự ghép nối lỏng và giúp thay đổi implementation dễ dàng hơn mà không ảnh hưởng tới các module khác.

### Giải quyết xung đột giữa các module

Khi ứng dụng lớn dần, bạn có thể gặp xung đột giữa các module. Đây là vài xung đột thường gặp và cách giải quyết:

1. **Xung đột phiên bản:** Khi hai module yêu cầu những phiên bản khác nhau của cùng một dependency.
   **Giải pháp:** Dùng chỉ thị `requires` với một phiên bản cụ thể, hoặc dùng công cụ build như Maven hay Gradle để quản lý phiên bản.

   ```
   module com.mycompany.moduleA {
       requires com.fasterxml.jackson.databind;
   }

   module com.mycompany.moduleB {
       requires com.fasterxml.jackson.databind@2.11.0;
   }
   ```

2. **Split package:** Khi các class trong cùng một package bị rải rác qua nhiều module.
   **Giải pháp:** Tái cấu trúc mã để đảm bảo mỗi package chỉ nằm trong một module duy nhất.

3. **Xung đột tên:** Khi hai module export cùng một tên package.
   **Giải pháp:** Đổi tên một trong hai package để đảm bảo tính duy nhất trong toàn ứng dụng.

4. **Dependency vòng:** Khi các module phụ thuộc lẫn nhau theo vòng tròn.
   **Giải pháp:** Thêm một module mới mà cả hai đều phụ thuộc vào, hoặc dùng mẫu Service Provider Interface (SPI).

   ```java
   // Before (cyclic dependency)
   module com.mycompany.moduleA {
       requires com.mycompany.moduleB;
   }
   module com.mycompany.moduleB {
       requires com.mycompany.moduleA;
   }

   // After (using SPI)
   module com.mycompany.api {
       exports com.mycompany.api;
   }
   module com.mycompany.moduleA {
       requires com.mycompany.api;
       provides com.mycompany.api.ServiceA with com.mycompany.moduleA.ServiceAImpl;
   }
   module com.mycompany.moduleB {
       requires com.mycompany.api;
       uses com.mycompany.api.ServiceA;
   }
   ```

Để hiểu rõ hơn giải pháp này, hãy xem xét service chi tiết hơn.


## Tạo một service

Hãy đi sâu vào một trong những tính năng mạnh mẽ nhất của Java Module System: service. Service cho phép ta tạo ra những ứng dụng linh hoạt, dễ mở rộng bằng cách tách rời interface khỏi implementation.

Trong ngữ cảnh Java Module System, một service là một tập hợp interface và class lập trình được định nghĩa rõ ràng, cung cấp quyền truy cập tới một chức năng hay tính năng cụ thể của ứng dụng. Nó giống như một bộ phận chuyên trách trong thư viện cung cấp một dịch vụ cụ thể, chẳng hạn phục chế sách.

Mô hình service gồm ba thành phần chính:

1. **Service Provider Interface (SPI):** Đây là hợp đồng định nghĩa service làm gì.
2. **Service Provider:** Đây là implementation của SPI.
3. **Service Consumer:** Đây là đoạn mã dùng service.

Sự phân tách này cho phép ghép nối lỏng giữa các module. Bên tiêu thụ không cần biết về implementation cụ thể của service, chỉ cần biết interface mà nó dùng.

Hãy bắt đầu bằng việc khai báo Service Provider Interface. Ta sẽ dùng `UserService` ở phần trước làm service mẫu:

```java
// In the api module
module com.mycompany.api {
    exports com.mycompany.api;
}

package com.mycompany.api;

public interface UserService {
    User getUser(String id);
    void updateUser(User user);
}
```

Interface `UserService` này định nghĩa hợp đồng cho service quản lý người dùng. Bất kỳ module nào implement interface này đều cung cấp được chức năng quản lý người dùng.

Giờ khi đã có Service Provider Interface, ta cần cách để khám phá và nạp các implementation của service này. Đây là lúc Service Locator xuất hiện. Từ Java 9 trở đi, ta dùng class `ServiceLoader` cho mục đích này.

Đây là cách ta tạo một `UserServiceLocator`:

```java
// In the app module
module com.mycompany.app {
    requires com.mycompany.api;
    uses com.mycompany.api.UserService;
}

package com.mycompany.app;

import com.mycompany.api.UserService;
import java.util.ServiceLoader;

public class UserServiceLocator {
    private static final ServiceLoader<UserService> loader = ServiceLoader.load(UserService.class);

    public static UserService getUserService() {
        return loader.findFirst().orElseThrow(() -> new IllegalStateException("No UserService implementation found"));
    }
}
```

Hãy phân tích:

- Ta dùng method `ServiceLoader.load()` để tạo một `ServiceLoader` cho interface `UserService`.
- Method `getUserService()` dùng `findFirst()` để lấy implementation khả dụng đầu tiên của `UserService`.
- Nếu không tìm thấy implementation nào, ta ném một `IllegalStateException`.

Chú ý chỉ thị `uses` trong khai báo module. Nó báo cho hệ thống module biết module này sẽ dùng service `UserService`.

Cách tiếp cận này đem lại vài lợi ích:

- **Ghép nối lỏng:** Module `app` không cần biết về implementation cụ thể của `UserService`.
- **Linh hoạt:** Ta dễ dàng thay đổi giữa các implementation khác nhau của `UserService` mà không phải sửa mã bên tiêu thụ.
- **Dễ mở rộng:** Module bên thứ ba cung cấp được implementation `UserService` của riêng họ, mở rộng chức năng cho ứng dụng của ta.

Đây là cách ta dùng nó trong `UserController`:

```java
package com.mycompany.app;

public class UserController {
    private final UserService userService;

    public UserController() {
        this.userService = UserServiceLocator.getUserService();
    }

    public void handleUserUpdate(String id, UserUpdateRequest request) {
        User user = userService.getUser(id);
        // Update user based on request
        userService.updateUser(user);
    }
}
```

Trong thiết lập này, `UserController` không cần biết gì về việc `UserService` được cài đặt ra sao hay đến từ đâu. Nó chỉ dùng service locator để lấy một instance rồi sử dụng.

Tuy nhiên, ta vẫn chưa thực sự cung cấp một implementation nào. Hãy làm điều đó ngay bây giờ.

Trước hết, ta tạo một implementation cho `UserService`:

```java
// In the core module
package com.mycompany.core;

import com.mycompany.api.User;
import com.mycompany.api.UserService;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public class UserServiceImpl implements UserService {
    private final Map<String, User> users = new HashMap<>();

    @Override
    public User getUser(String id) {
        return users.get(id);
    }

    @Override
    public void updateUser(User user) {
        if (user.getId() == null) {
            user.setId(UUID.randomUUID().toString());
        }
        users.put(user.getId(), user);
    }
}
```

Giờ ta cần báo cho hệ thống module biết rằng implementation này cung cấp `UserService`. Ta làm điều đó trong file `module-info.java` của module core:

```java
module com.mycompany.core {
    requires com.mycompany.api;
    provides com.mycompany.api.UserService with com.mycompany.core.UserServiceImpl;
}
```

Mệnh đề `provides ... with` báo cho hệ thống module biết rằng module này cung cấp một implementation của `UserService` bằng class `UserServiceImpl`.

Giờ đây, khi `ServiceLoader` trong `UserServiceLocator` tìm implementation của `UserService`, nó sẽ tìm thấy và dùng `UserServiceImpl` này.

Sự phân tách giữa interface và implementation cho ta độ linh hoạt đáng kinh ngạc. Ta dễ dàng thay `UserServiceImpl` bằng một implementation khác mà không phải sửa bất kỳ mã tiêu thụ nào. Chẳng hạn một implementation dùng database thay cho map trong bộ nhớ:

```java
// In the core module
package com.mycompany.core;

import com.mycompany.api.User;
import com.mycompany.api.UserService;
import java.sql.*;
import java.util.UUID;

public class DatabaseUserServiceImpl implements UserService {
    private static final String DB_URL = "jdbc:sqlite:users.db";

    @Override
    public User getUser(String id) {
        String sql = "SELECT * FROM users WHERE id = ?";
        // ...
    }

    @Override
    public void updateUser(User user) {
        String sql = "INSERT OR REPLACE INTO users(id, username, email, active) VALUES(?,?,?,?)";
        // ...
    }
}
```

Giờ để dùng implementation mới này, ta chỉ cần đổi mệnh đề `provides` trong file `module-info.java`:

```java
module com.mycompany.core {
    requires com.mycompany.api;
    requires java.sql;  // We need this for JDBC
    provides com.mycompany.api.UserService with com.mycompany.core.DatabaseUserServiceImpl;
}
```

Vậy thôi! Ta vừa thay implementation trong bộ nhớ bằng một implementation dựa trên database. Cái hay của cách tiếp cận này là ta không phải sửa dòng mã nào trong `UserController` hay bất kỳ class tiêu thụ nào khác. Chúng vẫn làm việc với interface `UserService` và không hề biết implementation bên dưới đã thay đổi.

Để thêm một implementation `UserService` khác mà không thay thế implementation hiện có, trước hết ta sửa module core để chứa cả hai implementation:

```java
// In the core module
module com.mycompany.core {
    requires com.mycompany.api;
    requires java.sql;  // We need this for JDBC

    provides com.mycompany.api.UserService with 
        com.mycompany.core.UserServiceImpl,
        com.mycompany.core.DatabaseUserServiceImpl;
}
```

Giờ hệ thống module biết rằng có hai provider cho `UserService`.

Tiếp theo, ta cập nhật `UserServiceLocator` để trả về mọi implementation khả dụng:

```java
// In the app module
module com.mycompany.app {
    requires com.mycompany.api;
    uses com.mycompany.api.UserService;
}

package com.mycompany.app;

import com.mycompany.api.UserService;
import java.util.ServiceLoader;
import java.util.List;
import java.util.stream.Collectors;

public class UserServiceLocator {
    private static final ServiceLoader<UserService> loader = ServiceLoader.load(UserService.class);

    public static List<UserService> getUserServices() {
        return loader.stream()
                     .map(ServiceLoader.Provider::get)
                     .collect(Collectors.toList());
    }
}
```

Method này trả về danh sách mọi implementation `UserService` khả dụng. 

Giờ ta cập nhật `UserController` để dùng, chẳng hạn, tất cả service khả dụng:

```java
package com.mycompany.app;

import com.mycompany.api.User;
import com.mycompany.api.UserService;

import java.util.List;

public class UserController {
    private final List<UserService> userServices;

    public UserController() {
        this.userServices = UserServiceLocator.getUserServices();
    }

    public void handleUserUpdate(String id, UserUpdateRequest request) {
        for (UserService userService : userServices) {
            User user = userService.getUser(id);
            // Update user based on request
            userService.updateUser(user);
        }
    }
}
```

Trong thiết lập này, `UserController` sẽ duyệt qua mọi implementation `UserService` khả dụng và gọi method `getUser` cùng `updateUser` trên từng cái.

Cách tiếp cận hướng service này cho phép ta xây dựng những ứng dụng module hoá và linh hoạt hơn. Một ứng dụng được thiết kế tốt, tận dụng tính năng service của Java Module System, sẽ dễ dàng mở rộng và thay đổi chức năng theo thời gian.


## Xem chi tiết module

Khi ứng dụng module hoá của bạn lớn dần, bạn có thể cần kiểm tra các module để hiểu cấu trúc, dependency và cách chúng được phân giải. Java cung cấp vài công cụ dòng lệnh giúp làm việc này.

### Mô tả một module

Hãy bắt đầu với việc mô tả module. Lệnh `java` kèm tuỳ chọn `--describe-module` (hoặc `-d`) cho phép ta xem chi tiết về một module cụ thể:

```bash
java --describe-module java.sql
```

Kết quả có thể trông như sau:

```
java.sql@18.0.3
exports java.sql
exports javax.sql
requires java.logging transitive
requires java.transaction.xa transitive
requires java.base mandated
requires java.xml transitive
uses java.sql.Driver
```

Nó cho ta biết module export những package nào, require những module nào và dùng những service nào. Đây là cách nhanh chóng để có cái nhìn tổng quan về cấu trúc và dependency của một module.

Bạn cũng mô tả được những module không thuộc Java runtime. Ví dụ, nếu bạn có module `com.mycompany.core` trong một file JAR:

```bash
java --module-path mods --describe-module com.mycompany.core
```

Kết quả có thể là:

```
com.mycompany.core@1.0
requires java.base mandated
requires com.mycompany.api
provides com.mycompany.api.UserService with com.mycompany.core.DatabaseUserServiceImpl
```

### Liệt kê những module khả dụng

Đôi khi bạn muốn xem mọi module khả dụng với ứng dụng của mình. Bạn làm điều đó bằng tuỳ chọn `--list-modules`:

```bash
java --list-modules
```

Lệnh này liệt kê mọi module trong Java runtime. Nếu muốn kèm cả module của riêng bạn, dùng:

```bash
java --module-path mods --list-modules
```

Lệnh này liệt kê cả module của Java runtime lẫn mọi module trong thư mục `mods` (theo quy ước là thư mục nơi bạn lưu các module đã biên dịch).

### Phân giải module

Khi bạn xử lý những dependency module phức tạp, việc xem hệ thống module phân giải các dependency này ra sao rất hữu ích. Bạn làm điều đó bằng tuỳ chọn `--show-module-resolution`:

```bash
java --show-module-resolution --module-path mods -m com.mycompany.app/com.mycompany.app.Main
```

Lệnh này hiển thị thông tin chi tiết về cách từng module được phân giải khi ứng dụng khởi động. Nó đặc biệt hữu ích khi gỡ rối các vấn đề về dependency module.

### Dùng lệnh `jar`

Lệnh `java` rất tốt để mô tả module lúc runtime, nhưng đôi khi bạn muốn kiểm tra một module mà không chạy nó. Lệnh `jar` giúp được việc này:

```bash
jar --describe-module --file mods/com.mycompany.core.jar
```

Kết quả có thể trông như sau:

```
com.mycompany.core jar:file:///.../mods/com.mycompany.core.jar/!module-info.class
requires java.base mandated
requires com.mycompany.api
provides com.mycompany.api.UserService with com.mycompany.core.DatabaseUserServiceImpl
```

Nó cung cấp thông tin tương tự lệnh `java --describe-module`, nhưng làm việc trực tiếp trên file JAR mà không cần thiết lập module path.

Đây là một ví dụ phức tạp hơn. Giả sử ta có ứng dụng nhiều module và muốn hiểu mọi mảnh ghép khớp với nhau ra sao:

```bash
# List all modules
java --module-path mods --list-modules

# Describe each of our modules
java --module-path mods --describe-module com.mycompany.api
java --module-path mods --describe-module com.mycompany.core
java --module-path mods --describe-module com.mycompany.app

# Show module resolution for our main application
java --show-module-resolution --module-path mods -m com.mycompany.app/com.mycompany.app.Main

# Describe our core module JAR file
jar --describe-module --file mods/com.mycompany.core.jar
```

Bằng cách chạy những lệnh này, bạn có được cái nhìn toàn diện về cấu trúc module của ứng dụng: từ danh sách tổng quát mọi module, qua chi tiết của từng module, tới quá trình phân giải từng bước khi bạn chạy ứng dụng.


## Phân tích dependency bằng `jdeps`
`jdeps` là công cụ cung cấp khả năng mạnh mẽ để phân tích và trực quan hoá dependency ở cả mức module lẫn mức class. Nó cho phép bạn xem xét quan hệ giữa module, package và class, từ đó đưa ra những quyết định có căn cứ về cấu trúc và cách tổ chức codebase.

Để bắt đầu với `jdeps`, hãy tìm hiểu cú pháp cơ bản và những tuỳ chọn thường gặp. Định dạng chung để chạy `jdeps` như sau:
```
jdeps [options] path
```

Ở đây, `path` là vị trí của những file class Java, file JAR hay thư mục bạn muốn phân tích. Phần `options` cho phép bạn tuỳ chỉnh hành vi của jdeps theo nhu cầu cụ thể.

Đây là một số tuỳ chọn chung quan trọng nhất:
- `-dotoutput dir hoặc --dot-output dir`: Chỉ định thư mục đích cho đầu ra dạng file DOT. Nếu tuỳ chọn này được dùng, lệnh `jdeps` sinh ra một file .dot cho mỗi archive được phân tích, đặt tên `archive-file-name.dot`, liệt kê các dependency, cùng một file tóm tắt tên `summary.dot` liệt kê dependency giữa các file archive.
- `-s hoặc -summary`: Chỉ in bản tóm tắt dependency.
- `-v hoặc -verbose`: In mọi dependency ở mức class. Tương đương `-verbose:class -filter:none`
- `-verbose:package`: In dependency ở mức package, mặc định loại trừ dependency trong cùng một package.
- `-verbose:class`: In dependency ở mức class, mặc định loại trừ dependency trong cùng một archive.
- `-apionly hoặc --api-only`: Giới hạn phân tích trong phạm vi API, ví dụ dependency từ chữ ký của các thành viên public và protected của class public, gồm kiểu field, kiểu tham số method, kiểu trả về và kiểu checked exception.
- `-jdkinternals hoặc --jdk-internals`: Tìm dependency mức class tới những API nội bộ của JDK. Mặc định, tuỳ chọn này phân tích mọi class được chỉ định trong tuỳ chọn `--classpath` cùng các file đầu vào, trừ khi bạn dùng tuỳ chọn `-include`. Bạn không dùng được tuỳ chọn này cùng `-p`, `-e` và `-s`.
- `-cp path, -classpath path, hoặc --class-path path`: Chỉ định nơi tìm file class.
- `--module-path module-path`: Chỉ định module path.
- `--add-modules module-name[, module-name...]`: Thêm module vào tập gốc để phân tích.
- `-q hoặc -quiet`: Không hiển thị dependency bị thiếu trong đầu ra của `-generate-module-info`.

Đây là những tuỳ chọn phân tích dependency module:
- `-m module-name hoặc --module module-name`: Chỉ định module gốc để phân tích.
- `--generate-module-info dir`: Sinh `module-info.java` trong thư mục chỉ định. Những file JAR được chỉ định sẽ được phân tích. Tuỳ chọn này không dùng được cùng `--dot-output` hay `--class-path`. Dùng tuỳ chọn `--generate-open-module` cho open module.
- `--generate-open-module dir`: Sinh `module-info.java` cho những file JAR chỉ định trong thư mục chỉ định dưới dạng open module. Tuỳ chọn này không dùng được cùng `--dot-output` hay `--class-path`.
- `--check module-name [, module-name...]`: Phân tích dependency của những module chỉ định. Nó in module descriptor, các dependency module sau khi phân tích và đồ thị sau khi rút gọn bắc cầu. Nó cũng chỉ ra những qualified export không được dùng.
- `--list-deps`: Liệt kê dependency module cùng tên package của những API nội bộ JDK (nếu được tham chiếu). Tuỳ chọn này phân tích bắc cầu các thư viện trên class path và module path nếu được tham chiếu. Dùng tuỳ chọn `--no-recursive` để phân tích dependency không bắc cầu.
- `--list-reduced-deps`: Giống `--list-deps` nhưng không liệt kê những cạnh đọc ngầm định từ đồ thị module. Nếu module M1 đọc M2, và M2 `requires transitive` M3, thì việc M1 đọc M3 là ngầm định và không hiển thị trong đồ thị.
- `--print-module-deps`: Giống `--list-reduced-deps` nhưng in ra danh sách dependency module phân tách bằng dấu phẩy. Đầu ra dùng được cho `jlink --add-modules` để tạo image tuỳ chỉnh chứa những module đó cùng dependency bắc cầu của chúng.
- `--ignore-missing-deps`: Bỏ qua những dependency bị thiếu.

Đây là những tuỳ chọn để lọc dependency:
- `-p pkg_name, -package pkg_name, hoặc --package pkg_name`: Tìm dependency khớp tên package chỉ định. Bạn dùng được tuỳ chọn này nhiều lần cho những package khác nhau. Tuỳ chọn `-p` và `-e` loại trừ lẫn nhau.
- `-e regex, -regex regex, hoặc --regex regex`: Tìm dependency khớp mẫu chỉ định. Tuỳ chọn `-p` và `-e` loại trừ lẫn nhau.
- `--require module-name`: Tìm dependency khớp tên module cho trước (có thể dùng nhiều lần). Những tuỳ chọn `--package`, `--regex` và `--require` loại trừ lẫn nhau.
- `-f regex hoặc -filter regex`: Lọc những dependency khớp mẫu cho trước. Nếu dùng nhiều lần, cái cuối cùng được chọn.
- `-filter:package`: Lọc dependency trong cùng một package. Đây là mặc định.
- `-filter:archive`: Lọc dependency trong cùng một archive.
- `-filter:module`: Lọc dependency trong cùng một module.
- `-filter:none`: Không áp dụng `-filter:package` và `-filter:archive`. Bộ lọc chỉ định qua tuỳ chọn `-filter` vẫn có hiệu lực.
- `--missing-deps`: Tìm những dependency bị thiếu. Tuỳ chọn này không dùng được cùng `-p`, `-e` và `-s`.

Và đây là những tuỳ chọn để lọc class cần phân tích:
- `-include regex`: Giới hạn phân tích trong những class khớp mẫu. Tuỳ chọn này lọc danh sách class được phân tích. Nó dùng được cùng `-p` và `-e`, vốn áp mẫu lên các dependency.
- `-P hoặc -profile`: Hiển thị profile chứa một package.
- `-R hoặc --recursive`: Duyệt đệ quy mọi dependency lúc chạy. Tuỳ chọn `-R` kéo theo `-filter:none`. Nếu có dùng `-p`, `-e` hay `-f`, chỉ những dependency khớp mới được phân tích.
- `--no-recursive`: Không duyệt dependency theo kiểu đệ quy.
-- `I hoặc --inverse`: Phân tích dependency theo những tuỳ chọn khác đã cho rồi tìm mọi artifact phụ thuộc trực tiếp và gián tiếp vào các nút khớp. Điều này tương đương với nghịch đảo của phân tích góc nhìn lúc biên dịch cùng việc in tóm tắt dependency. Tuỳ chọn này phải dùng cùng `--require`, `--package` hoặc `--regex`.
- `--compile-time`: Phân tích góc nhìn lúc biên dịch của dependency bắc cầu, tương tự góc nhìn lúc biên dịch của tuỳ chọn `-R`. Phân tích dependency theo những tuỳ chọn khác đã chỉ định. Nếu tìm thấy một dependency từ một thư mục, file JAR hay module, mọi class trong archive chứa nó đều được phân tích.

Một trong những trường hợp dùng chính của `jdeps` là phân tích dependency module. Bằng cách chạy `jdeps` trên một module, bạn nhận được báo cáo chi tiết về những module nó phụ thuộc vào và những package nó dùng từ mỗi module:
```
jdeps --module-path mods --add-modules com.example.myapp mymodule.jar
```

Trong ví dụ này, ta chỉ định module path bằng tuỳ chọn `--module-path`, trỏ tới thư mục chứa các định nghĩa module. Tuỳ chọn `--add-modules` dùng để chỉ định module chính của ứng dụng. Cuối cùng, ta cung cấp đường dẫn tới file JAR đại diện cho module của mình.

`jdeps` sẽ phân tích dependency và sinh ra một báo cáo trông như sau:
```
mymodule.jar -> java.base
   com.example.myapp                         -> java.io
   com.example.myapp                         -> java.lang
   com.example.myapp                         -> java.util
mymodule.jar -> java.desktop
   com.example.myapp                         -> java.awt
   com.example.myapp                         -> javax.swing
```

Báo cáo này cho thấy dependency của `mymodule.jar` tới những module khác như `java.base` và `java.desktop`. Nó cũng liệt kê các package cụ thể trong `mymodule.jar` phụ thuộc vào package của những module đó.

Ngoài phân tích ở mức module, `jdeps` còn cho phép bạn xem xét dependency ở mức class. Bằng cách chạy `jdeps` trên từng file class hoặc thư mục chứa file class, bạn hiểu được quan hệ giữa các class và package.

Hãy xét ví dụ này:
```
jdeps --verbose --class-path lib/* com/example/MyClass.class
```

Ở đây ta dùng tuỳ chọn `--class-path` để chỉ định classpath chứa những dependency cần thiết. Cờ `--verbose` cung cấp đầu ra chi tiết hơn, cho thấy những class và thành viên cụ thể đang được dùng.

Báo cáo dependency mức class do `jdeps` sinh ra sẽ chứa thông tin như thế này:
```
com.example.MyClass -> java.lang.Object
com.example.MyClass -> java.lang.String
com.example.MyClass -> java.util.ArrayList
com.example.MyClass -> java.util.List
com.example.MyClass -> com.example.HelperClass
```

Báo cáo này cho biết `MyClass` phụ thuộc vào các class từ package `java.lang` và `java.util`, cũng như một class khác tên `HelperClass` trong cùng package.

`jdeps` còn có khả năng sinh báo cáo dependency toàn diện ở nhiều định dạng. Bằng cách dùng tuỳ chọn `--dot-output`, bạn sinh được file DOT trực quan hoá các dependency dưới dạng đồ thị. Biểu diễn đồ hoạ này cực kỳ hữu ích để hiểu những cấu trúc dependency phức tạp và phát hiện vấn đề tiềm ẩn.
```
jdeps --dot-output docs --module-path mods --add-modules com.example.myapp mymodule.jar
```

Trong ví dụ này, `jdeps` sẽ sinh một file DOT đặt tên theo module trong thư mục `docs`. Sau đó bạn dùng những công cụ như [Graphviz](https://graphviz.org) để dựng file DOT thành đồ thị trực quan.

Một tính năng hữu ích khác của `jdeps` là khả năng phát hiện việc dùng các API nội bộ. Cờ `--jdk-internals` giúp bạn phát hiện và phân tích việc dùng API nội bộ của JDK trong mã của mình. Điều này quan trọng vì dựa vào API nội bộ có thể dẫn tới vấn đề tương thích và hành vi bất ngờ khi nâng cấp lên phiên bản Java mới hơn.
```
jdeps --jdk-internals --class-path lib/* com/example/MyClass.class
```

Nếu `MyClass` dùng bất kỳ API nội bộ nào của JDK, `jdeps` sẽ báo cáo chúng trong đầu ra, cho phép bạn hành động để tái cấu trúc hoặc loại bỏ những dependency tới API nội bộ.

Nếu bạn cung cấp đường dẫn tới một file JAR hay thư mục, `jdeps` sẽ phân tích đệ quy mọi class bên trong và sinh ra báo cáo dependency toàn diện.

Đây là một ví dụ:
```
jdeps --recursive lib/myapp.jar
```

Tuỳ chọn `--recursive` đảm bảo `jdeps` duyệt mọi class và thư mục lồng nhau bên trong file JAR hay thư mục chỉ định, đem lại bức tranh đầy đủ về các dependency.

`jdeps` cũng cung cấp tính năng phân tích dependency đệ quy, cho phép bạn hiểu những dependency bắc cầu của mã mình. Bằng cách phân tích không chỉ dependency trực tiếp mà cả dependency của những dependency đó, `jdeps` giúp bạn phát hiện vấn đề và xung đột tiềm ẩn.

Hãy xét ví dụ này:
```
jdeps --recursive --module-path mods --add-modules com.example.myapp mymodule.jar
```

Với cờ `--recursive`, `jdeps` sẽ duyệt toàn bộ đồ thị dependency, bắt đầu từ module hay file JAR chỉ định. Nó sinh ra báo cáo bao gồm mọi dependency bắc cầu, đem lại cho bạn cái nhìn toàn diện về cấu trúc dependency của dự án.


## Dùng file module với `jmod`
`jmod` là công cụ dòng lệnh làm việc với một định dạng file gọi là JMOD. File JMOD tương tự file JAR ở chỗ chúng đóng gói class Java, tài nguyên và siêu dữ liệu. Tuy nhiên, file JMOD được thiết kế riêng để làm việc với hệ thống module và cung cấp thêm những khả năng so với file JAR truyền thống.

### Định dạng file JMOD
Định dạng file JMOD được tối ưu cho JPMS và đóng vai trò container cho nội dung module hoá. Nó đóng gói không chỉ class Java đã biên dịch và tài nguyên, mà còn cả module descriptor, thư viện native và những thông tin đặc thù khác của module. File JMOD có phần mở rộng `.jmod` và tuân theo một cấu trúc thư mục cụ thể để tổ chức nội dung.

File JMOD không thay thế file JAR.

File JAR (Java Archive) là định dạng phổ biến và được dùng rộng rãi nhất để đóng gói class Java và tài nguyên. Về bản chất chúng là file zip chứa class Java đã biên dịch, siêu dữ liệu và tài nguyên. Ngoài ra, file JAR đặt được lên classpath để chương trình Java truy cập dễ dàng.

Có vài khác biệt chính giữa file JAR và JMOD:
- **Tính module:** File JMOD chủ yếu dùng cho phát triển Java module hoá, còn file JAR dùng cho cả mã module hoá lẫn phi module.

- **Mã native:** File JMOD chứa được thư viện native và file thực thi, điều mà file JAR không làm được.

- **Đánh phiên bản:** File JMOD hỗ trợ đánh phiên bản module qua tuỳ chọn `--module-version`, cho phép quản lý phiên bản tốt hơn.

- **Tối ưu:** File JMOD được tối ưu cho hệ thống module và đem lại hiệu năng cùng khả năng đóng gói tốt hơn file JAR.

- **Cách dùng:** File JAR được dùng rộng rãi để phân phối thư viện và ứng dụng, còn file JMOD chủ yếu dùng để tạo và đóng gói module.

Vậy khi nào nên dùng file JMOD thay cho file JAR? Đây là vài hướng dẫn:
- Nếu bạn phát triển ứng dụng Java module hoá bằng JPMS, file JMOD là định dạng được khuyến nghị để đóng gói module.

- Nếu module của bạn cần thư viện native hay file thực thi, file JMOD cung cấp cách thuận tiện để đưa chúng đi kèm mã Java.

- Nếu bạn cần tạo runtime image tuỳ chỉnh hay một JRE (Java Runtime Environment) riêng cho ứng dụng, file JMOD được dùng làm đầu vào cho công cụ `jlink` để tạo runtime image tối ưu.

Tuy nhiên, nếu bạn phát triển ứng dụng Java phi module hoặc thư viện cần tương thích với những phiên bản Java cũ hơn, file JAR vẫn là lựa chọn ưu tiên.

Một trong những ưu điểm chính của file JMOD là khả năng chứa thư viện native và file thực thi. Điều này đặc biệt hữu ích với những module có dependency đặc thù nền tảng hoặc cần tích hợp mã native. Bằng cách đóng gói thư viện native bên trong file JMOD, module được phân phối và triển khai dễ dàng trên nhiều nền tảng khác nhau.

File JMOD cũng hỗ trợ đánh phiên bản, cho phép module chỉ định thông tin phiên bản của mình. Điều này quan trọng để quản lý dependency và đảm bảo tương thích giữa các phiên bản module. Module descriptor trong file `module-info.class` chứa được các annotation liên quan tới phiên bản để cung cấp siêu dữ liệu phiên bản.

### Các chế độ hoạt động
Đây là cú pháp cơ bản của lệnh `jmod`:
```
jmod (create|extract|list|describe|hash) [options] jmod-file
```

Những chế độ hoạt động chính là:
- `create`: Tạo một file JMOD archive mới.
- `extract`: Trích xuất mọi file từ file JMOD archive.
- `list`: In tên của mọi mục.
- `describe`: In chi tiết module.
- `hash`: Xác định các module lá và ghi lại hash của những dependency trực tiếp và gián tiếp require chúng.

Đây là những tuỳ chọn quan trọng nhất:
- `--class-path path`: Chỉ định vị trí của file JAR ứng dụng hoặc thư mục chứa class để sao chép vào file JMOD kết quả.
- `--cmds path`: Chỉ định vị trí của các lệnh native để sao chép vào file JMOD kết quả.
- `--config path`: Chỉ định vị trí của những file cấu hình người dùng sửa được để sao chép vào file JMOD kết quả.
- `--dir path`: Chỉ định vị trí nơi jmod đặt các file được trích xuất từ JMOD archive chỉ định.
- `--dry-run`: Chạy thử chế độ hash. Nó xác định các module lá và những module chúng require mà không ghi lại giá trị hash nào.
- `--hash-modules regex-pattern`: Xác định các module lá và ghi lại hash của những dependency trực tiếp và gián tiếp require chúng, dựa trên đồ thị module của những module khớp regex-pattern cho trước. Các hash được ghi vào file JMOD archive đang được tạo, hoặc vào một JMOD archive hay modular JAR trên module path chỉ định bởi lệnh `jmod hash`.
- `--help hoặc -h`: In thông điệp hướng dẫn sử dụng.
- `--libs path`: Chỉ định vị trí của thư viện native để sao chép vào file JMOD kết quả.
- `--main-class class-name`: Chỉ định class chính để ghi vào file `module-info.class`.
- `--module-version version`: Chỉ định phiên bản module để ghi vào file `module-info.class`.
- `--module-path path hoặc -p path`: Chỉ định module path. Tuỳ chọn này bắt buộc nếu bạn cũng dùng `--hash-modules`.
- `--target-platform platform`: Chỉ định nền tảng đích.
- `--version`: In thông tin phiên bản của lệnh `jmod`.

Đây là vài ví dụ minh hoạ cách dùng cơ bản của từng chế độ:

1. **Chế độ create:**
    ```
    jmod create \
        --class-path classes \
        --main-class com.example.Main \
        --module-version 1.0 \
        --module-path lib \
        mymodule.jmod
    ```

    Lệnh này tạo một file JMOD archive mới tên `mymodule.jmod`. Nó gồm các class từ thư mục `classes`, đặt class chính là `com.example.Main`, chỉ định phiên bản module là 1.0, và dùng thư mục `lib` làm module path.

2. **Chế độ extract:**
    ```
    jmod extract --dir extracted_files mymodule.jmod
    ```

    Lệnh này trích xuất mọi file từ `mymodule.jmod` vào thư mục tên `extracted_files`.

3. **Chế độ list:**
    ```
    jmod list mymodule.jmod
    ```

    Lệnh này in tên của mọi mục trong `mymodule.jmod`.

4. **Chế độ describe:**
    ```
    jmod describe mymodule.jmod
    ```

    Lệnh này in chi tiết module của `mymodule.jmod`.

5. **Chế độ hash:**
    ```
    jmod hash --module-path lib \
        --hash-modules java.base \
        mymodule.jmod
    ```

    Lệnh này xác định các module lá và ghi lại hash của những dependency trực tiếp và gián tiếp require chúng. Nó dùng thư mục `lib` làm module path và xét những module khớp mẫu `java.base`.


### Thực hành tốt và giới hạn
Khi làm việc với file JMOD, có vài thực hành tốt cần nhớ:
- Dùng tên mô tả rõ ràng, có ý nghĩa cho file JMOD, tuân theo quy ước đặt tên module.

- Đưa file `module-info.java` vào mã nguồn module để định nghĩa tên module, dependency và những package được export.

- Tổ chức class, tài nguyên và thư viện native của module trong những thư mục thích hợp bên trong file JMOD.

- Dùng tuỳ chọn `--module-version` khi tạo file JMOD để chỉ định phiên bản module.

- Lưu file JMOD trong một cấu trúc thư mục riêng, tách khỏi mã nguồn và các artifact khác của dự án.

- Dùng công cụ jmod để tạo, trích xuất và thao tác với file JMOD khi cần.

- Khi phân phối ứng dụng module hoá, cân nhắc dùng `jlink` để tạo runtime image tối ưu chỉ chứa những module cần thiết.

Dù file JMOD đem lại nhiều lợi ích cho phát triển Java module hoá, vẫn có vài giới hạn và điều cần cân nhắc:

- File JMOD đặc thù cho Java Platform Module System và không tương thích ngược với những phiên bản Java cũ hơn.

- Không phải mọi thư viện và framework Java đều đã module hoá hay cung cấp file JMOD. Bạn có thể vẫn phải dựa vào file JAR truyền thống cho những dependency chưa được module hoá.

- Công cụ và hệ thống build cho phát triển Java module hoá vẫn đang tiến hoá, và có thể cần một chút thời gian học cùng cấu hình để tận dụng trọn vẹn file JMOD trong dự án.

- File JMOD không nhằm dùng làm định dạng phân phối tới người dùng cuối. Chúng thường được dùng như định dạng trung gian để tạo runtime image hoặc tích hợp với công cụ build.


## Tạo runtime image bằng `jlink`
Theo truyền thống, ứng dụng Java dựa vào Java Runtime Environment (JRE) để chạy. JRE chứa rất nhiều module và thư viện, nhiều trong số đó có thể không cần thiết với một ứng dụng cụ thể. Điều này dẫn tới kích thước bản phân phối lớn hơn và những dependency có thể không cần thiết.

Với `jlink`, ta tạo được runtime image tuỳ chỉnh chỉ chứa những module mà ứng dụng cần. Những runtime image tuỳ chỉnh này khép kín và phân phối được dưới dạng file thực thi độc lập. Chúng đem lại vài lợi ích như giảm kích thước bản phân phối, cải thiện thời gian khởi động và tăng cường bảo mật nhờ thu hẹp bề mặt tấn công.

### Cú pháp và tuỳ chọn của `jlink`
Để tạo runtime image tuỳ chỉnh bằng `jlink`, ta dùng cú pháp cơ bản sau:
```
jlink [options] --module-path <modulepath> --add-modules <modules>
```

Hãy phân tích những thành phần chính của lệnh `jlink`:
- `[options]`: Những tuỳ chọn bổ sung để cấu hình hành vi của `jlink`, như nén, gỡ lỗi và nhiều thứ khác.
- `--module-path <modulepath>`: Chỉ định module path nơi tìm được những module cần thiết, gồm module của ứng dụng và mọi dependency.
- `--add-modules <modules>`: Chỉ định những module sẽ được đưa vào runtime image. Đây có thể là danh sách tên module phân tách bằng dấu phẩy, hoặc từ khoá `ALL-MODULE-PATH` để đưa vào mọi module tìm thấy trên module path.

Một trong những mục tiêu chính khi tạo runtime image tuỳ chỉnh là giảm thiểu kích thước và chỉ đưa vào những module cần thiết. `jlink` cung cấp các tuỳ chọn để tạo một runtime tối giản chỉ gồm những module thiết yếu cho ứng dụng chạy được.

Đây là vài tuỳ chọn quan trọng nhất:
- `--add-modules mod [, mod...]`: Thêm những module có tên `mod` vào tập module gốc mặc định. Tập module gốc mặc định là rỗng.
- `--bind-services`: Liên kết các module service provider cùng dependency của chúng.
- `-c ={0|1|2} hoặc --compress={0|1|2}`: Bật nén tài nguyên.
- `--disable-plugin pluginname`: Vô hiệu hoá plug-in chỉ định.
- `--endian {little|big}`: Chỉ định thứ tự byte của image được sinh ra. Giá trị mặc định là định dạng theo kiến trúc hệ thống của bạn.
- `-h hoặc --help`: In thông điệp trợ giúp.
- `--ignore-signing-information`: Chặn lỗi nghiêm trọng khi các modular JAR đã ký được liên kết vào runtime image. Những file liên quan tới chữ ký của modular JAR đã ký sẽ không được sao chép vào runtime image.
- `--launcher command=module hoặc --launcher command=module/main`: Chỉ định tên lệnh launcher cho module, hoặc tên lệnh cho module kèm class chính (tên module và tên class chính phân tách bằng dấu gạch chéo).
- `--limit-modules mod [, mod...]`: Giới hạn tập module quan sát được trong bao đóng bắc cầu của những module có tên `mod`, cộng với module chính (nếu có), cộng với mọi module khác được chỉ định trong tuỳ chọn `--add-modules`.
- `--list-plugins`: Liệt kê những plug-in khả dụng mà bạn truy cập được qua tuỳ chọn dòng lệnh.
- `-p hoặc --module-path modulepath`: Chỉ định module path. Nếu không dùng tuỳ chọn này, module path mặc định là `$JAVA_HOME/jmods`. Thư mục này chứa module `java.base` cùng các module chuẩn và module JDK khác. Nếu tuỳ chọn này được dùng nhưng module `java.base` không phân giải được từ đó, lệnh jlink sẽ nối thêm `$JAVA_HOME/jmods` vào module path.
- `--output path`: Chỉ định vị trí của runtime image được sinh ra.
- `--suggest-providers [name, ...]`: Gợi ý những provider cài đặt các kiểu service cho trước từ module path.
- `--version`: In thông tin phiên bản.

Để tạo một runtime tối giản, ta dùng lệnh sau:
```
jlink --module-path <modulepath> \
      --add-modules <modules> \
      --compress 2 \
      --strip-debug \
      --no-header-files \
      --no-man-pages \
      --output <path>
```

Trong lệnh này, ta dùng vài tuỳ chọn để tối ưu runtime image:
- `--compress 2`: Bật nén cho runtime image được sinh ra, giảm kích thước của nó.
- `--strip-debug`: Loại bỏ thông tin gỡ lỗi khỏi runtime image, giảm kích thước thêm nữa.
- `--no-header-files`: Loại header file khỏi runtime image.
- `--no-man-pages`: Loại trang hướng dẫn (man page) khỏi runtime image.

Bằng cách chỉ định đúng những module cần thiết với `--add-modules` và dùng các tuỳ chọn tối ưu này, ta tạo được runtime image tối giản được may đo cho yêu cầu cụ thể của ứng dụng.

`jlink` cũng cho phép ta đưa vào hoặc loại ra module khỏi runtime image một cách tường minh. Điều này cho ta quyền kiểm soát chi tiết những module được đóng gói vào image.

Để đưa vào những module cụ thể, ta dùng tuỳ chọn `--add-modules` theo sau là danh sách tên module phân tách bằng dấu phẩy. Ví dụ:
```
jlink --module-path <modulepath> \
      --add-modules module1,module2,module3 \
      --output <path>
```

Lệnh này tạo ra runtime image chỉ gồm `module1`, `module2` và `module3` cùng những dependency bắc cầu của chúng.

Mặt khác, nếu muốn loại một số module khỏi runtime image, ta dùng tuỳ chọn `--exclude-modules` theo sau là danh sách tên module phân tách bằng dấu phẩy. Ví dụ:
```
jlink --module-path <modulepath> \
      --add-modules ALL-MODULE-PATH \
      --exclude-modules module4,module5 \
      --output <path>
```

Trong trường hợp này, jlink sẽ đưa vào mọi module tìm thấy trên module path ngoại trừ `module4` và `module5`.

### Plugin
Plugin là những thành phần bổ sung mở rộng chức năng của công cụ `jlink`. Chúng cho phép lập trình viên tuỳ chỉnh việc tạo runtime image theo nhiều cách, như tối ưu image sinh ra, thêm hoặc bớt tài nguyên, và cấu hình cách bố trí image.

Nếu bạn chạy:
```
jlink --list-plugins
```

Bạn sẽ nhận được danh sách mọi plugin khả dụng. Ví dụ:

- `--add-options <options>`: Chèn chuỗi `<options>` chỉ định (có thể chứa khoảng trắng) vào trước mọi tuỳ chọn khác khi gọi máy ảo trong image kết quả.
- `--compress <compress>`: Kiểu nén dùng khi nén tài nguyên. Giá trị chấp nhận là `zip-[0-9]`, trong đó `zip-0` không nén và `zip-9` nén tốt nhất. Mặc định là `zip-6`.
- `--exclude-files <pattern-list>`: Chỉ định những file cần loại. Ví dụ: `**.java`, `glob:/java.base/lib/client/**`
- `--exclude-jmod-section <section-name>`: Chỉ định một mục JMOD cần loại, với `<section-name>` là `man` hoặc `headers`.
- `--exclude-resources <pattern-list>`: Chỉ định những tài nguyên cần loại. Ví dụ: `**.jcov`, `glob:**/META-INF/**`
- `--include-locales <langtag>[,<langtag>]*`: Các thẻ ngôn ngữ BCP 47 phân tách bằng dấu phẩy, cho phép so khớp locale theo định nghĩa trong RFC 4647. Ví dụ: `en`, `ja`, `*-IN`
- `--strip-debug`: Loại bỏ thông tin gỡ lỗi khỏi image đầu ra
- `--strip-java-debug-attributes`: Loại bỏ các thuộc tính gỡ lỗi Java khỏi class trong image đầu ra
- `--strip-native-commands`: Loại những lệnh native (như `java/java.exe`) khỏi image.
- `--vm <client|server|minimal|all>`: Chọn HotSpot VM trong image đầu ra. Mặc định là `all`.

Đây là vài ví dụ về cách dùng những plugin này với lệnh `jlink`:
```
# Create a runtime image with maximum compression,
# exclude specific files, and strip debug information
jlink --module-path $JAVA_HOME/jmods \
      --add-modules java.base \
      --compress zip-9 \
      --exclude-files "**.java,glob:/java.base/lib/client/**" \
      --strip-debug \
      --output custom-runtime-image

# Create a runtime image that includes only the
# specified locales and uses the server VM
jlink --module-path $JAVA_HOME/jmods \
      --add-modules java.base \
      --include-locales en,ja \
      --vm server \
      --output custom-runtime-image
```

### Tối ưu runtime image
Ngoài việc tạo runtime image tối giản, `jlink` còn cung cấp các tuỳ chọn để tối ưu thêm runtime được sinh ra. Những tối ưu này giúp giảm kích thước runtime image và cải thiện hiệu năng của nó.

Một tối ưu quan trọng là nén. Mặc định, `jlink` không nén runtime image được sinh ra. Tuy nhiên, ta bật được nén bằng tuỳ chọn `--compress` theo sau là mức nén. Mức nén đặt được là 0 (không nén), 1 (chia sẻ chuỗi hằng) hoặc 2 (nén ZIP). Ví dụ:
```
jlink --module-path <modulepath> 
      --add-modules <modules> \
      --compress 2 \
      --output <path>
```

Dùng `--compress 2` áp dụng nén ZIP lên runtime image được sinh ra, giảm đáng kể kích thước của nó.

Một tối ưu khác là loại bỏ thông tin gỡ lỗi khỏi runtime image. Thông tin gỡ lỗi hữu ích trong quá trình phát triển nhưng không cần thiết khi triển khai production. Ta loại nó bằng tuỳ chọn `--strip-debug`:
```
jlink --module-path <modulepath> 
      --add-modules <modules> \
      --strip-debug \
      --output <path>
```

Bằng cách này, ta giảm thêm được kích thước của runtime image.


## Chuyển đổi một ứng dụng
Chuyển một ứng dụng sẵn có sang dùng module có thể là nhiệm vụ đầy thách thức. Việc này khả thi, nhưng đòi hỏi lên kế hoạch và thực hiện cẩn thận. 

Trước khi bắt tay vào quá trình chuyển đổi, điều quan trọng là hiểu cách các package và thư viện trong ứng dụng hiện tại được cấu trúc. Việc này bao gồm phân tích codebase và xác định dependency giữa những phần khác nhau của ứng dụng.

Một cách để hiểu rõ cấu trúc ứng dụng là dùng `jdeps`. Bằng cách chạy `jdeps` trên các file JAR hoặc file class của ứng dụng, ta sinh được một báo cáo dependency cung cấp thông tin giá trị về quan hệ giữa các package và class.

Đây là ví dụ chạy `jdeps` trên một file JAR ứng dụng:
```
jdeps -s -recursive application.jar
```

Tuỳ chọn `-s` sinh đầu ra tóm tắt, còn `-recursive` phân tích cả những file JAR phụ thuộc.

Đầu ra của jdeps cho ta cái nhìn tổng quan về các package và dependency của chúng. Nó làm nổi bật mọi dependency tới API nội bộ của JDK, điều đáng lưu ý vì những API này có thể không truy cập được ở các phiên bản Java tương lai.

Nếu muốn chi tiết hơn, bạn dùng tuỳ chọn `-verbose`:
```
jdeps -verbose application.jar
```

Đầu ra sẽ cho thấy dependency giữa các package và class, cũng như dependency tới thư viện bên ngoài.

Ở giai đoạn này, việc phát hiện và giải quyết mọi dependency vòng hay dependency không cần thiết là rất quan trọng. Dependency vòng gây rắc rối khi module hoá ứng dụng vì module không được phép có dependency vòng. Dependency không cần thiết làm ứng dụng phình to và khiến việc module hoá hiệu quả khó hơn.

Giờ khi đã có bản đồ dependency của ứng dụng, đã đến lúc bắt đầu lên kế hoạch chuyển đổi. Một chiến lược phổ biến là chia dự án lớn thành những module nhỏ hơn, dễ quản lý hơn. Quá trình này bao gồm việc xác định ranh giới logic bên trong ứng dụng và tách mã thành những module riêng biệt dựa trên chức năng và dependency.

JPMS cho ta vài công cụ để làm dịu quá trình chuyển tiếp này: unnamed module và automatic module.

Giả sử ta có một ứng dụng nguyên khối lớn tên `BigApp`. Ta có thể bắt đầu bằng cách chạy nó theo cách truyền thống trên classpath:

```
java -cp BigApp.jar:lib/* com.example.MainClass
```

Cách này đặt `BigApp` và mọi dependency của nó vào **unnamed module**. Đây là cách những ứng dụng tiền JPMS chạy: mọi thứ trên classpath đều trở thành một phần của unnamed module.

Bước đầu tiên hướng tới module hoá, ta chuyển `BigApp` sang module path mà chưa định nghĩa file `module-info.java`:

```
java --module-path BigApp.jar 
     --add-modules ALL-MODULE-PATH
     com.example.MainClass
```

Cách này biến `BigApp` thành một **automatic module**. Nó chưa phải module JPMS thực thụ, nhưng đây là khởi đầu: giờ nó có tên module (suy ra từ tên JAR) và require được những module khác.

Với những thư viện bên thứ ba chưa module hoá, ta dùng automatic module. Giả sử ta đang dùng thư viện tên `CoolLib`. Ta đặt nó lên module path cùng với ứng dụng:

```
java --module-path BigApp.jar:CoolLib.jar 
     --add-modules ALL-MODULE-PATH
     com.example.MainClass
```

Giờ cả `BigApp` lẫn `CoolLib` đều trở thành automatic module. Hệ thống module suy ra tên của chúng từ tên file JAR, và chúng export mọi package của mình. Nhưng hãy nhớ, đây chỉ là giải pháp tạm thời. Mục tiêu cuối cùng của ta là có những module tường minh, đàng hoàng, với file `module-info.java` cho mọi thứ.

Khi chia dự án thành module, cần cân nhắc dependency giữa các module. Hãy hướng tới việc giảm thiểu sự ghép nối giữa các module và thúc đẩy ghép nối lỏng thông qua những interface và API được định nghĩa rõ ràng.

Đây là vài chiến lược để chia một dự án lớn thành module đúng cách:

1. **Chia theo package:** Một cách là tạo module dựa trên cấu trúc package sẵn có. Mỗi package hay một nhóm package liên quan có thể được chuyển thành một module riêng. Cách này giúp duy trì sự phân tách mối quan tâm và tính đóng gói rõ ràng.

2. **Kiến trúc phân tầng:** Nếu ứng dụng theo kiến trúc phân tầng (tầng trình bày, tầng logic nghiệp vụ, tầng truy cập dữ liệu), mỗi tầng có thể được tách thành module riêng. Cách này cho phép module hoá tốt hơn và bảo trì từng tầng độc lập dễ dàng hơn.

3. **Chia theo tính năng:** Một cách khác là chia ứng dụng dựa trên tính năng hay mảng chức năng. Mỗi tính năng lớn có thể được đóng gói trong module riêng, thúc đẩy khả năng tái sử dụng và bảo trì.

4. **Chia theo dependency:** Phân tích dependency giữa các phần khác nhau của ứng dụng giúp xác định ranh giới module tự nhiên. Những thành phần ghép nối chặt được gom vào một module, còn những thành phần ghép nối lỏng được tách thành module riêng.

Nhưng bạn có thể đang tự hỏi nói chung ta có những chiến lược nào cho việc chuyển đổi. Đây là vài cách tiếp cận:

1. **Chuyển đổi tăng dần:** Ở cách này, việc chuyển đổi được thực hiện dần dần, mỗi lần một module. Hãy bắt đầu bằng việc xác định module phù hợp để chuyển trước, thường là module có ít dependency nhất tới những phần khác của ứng dụng. Khi module đó được chuyển thành công, chuyển sang module tiếp theo, và cứ thế.

2. **Chuyển đổi từ dưới lên:** Chiến lược này bắt đầu chuyển đổi từ những module ở tầng thấp nhất rồi dần đi lên theo hệ phân cấp dependency. Bắt đầu bằng việc module hoá những module không phụ thuộc vào module nào khác, rồi tiếp tục với những module phụ thuộc vào các module đã module hoá.

3. **Chuyển đổi từ trên xuống:** Ngược với cách từ dưới lên, chuyển đổi từ trên xuống bắt đầu với những module ở tầng cao rồi đi xuống theo chuỗi dependency. Chiến lược này hữu ích khi các module tầng cao có sự phân tách mối quan tâm rõ ràng và dễ module hoá.

4. **Phát triển song song:** Nếu thời gian và nguồn lực cho phép, có thể dùng phát triển song song. Ở cách này, một nhánh hay codebase riêng được tạo cho phiên bản module hoá của ứng dụng, trong khi phiên bản phi module hiện tại vẫn tiếp tục được bảo trì. Việc phát triển diễn ra đồng thời trên cả hai phiên bản, dần dần chuyển các module sang nhánh module hoá.

Ví dụ, ta có thể bắt đầu module hoá một phần ứng dụng theo cách từ dưới lên:

```java
module com.myapp.core {
    requires java.base;
    requires com.coollib;  // This is our automatic module
    exports com.myapp.core.api;
}
```

File `module-info.java` này định nghĩa một module mới `com.myapp.core`. Ta bắt đầu với một module core vốn có ít dependency hơn, điều đặc trưng cho cách tiếp cận từ dưới lên. Nó require module `java.base` (vốn ngầm định nhưng ở đây ta viết tường minh) và `CoolLib`, một automatic module. Nó cũng export package `com.myapp.core.api` cho những module khác dùng.

Khi tạo thêm module, ta cần suy nghĩ kỹ về ranh giới module.

Một điều quan trọng cần nhớ là trong giai đoạn này, ta có thể phải mở ra nhiều hơn mức mong muốn. Ví dụ:

```java
open module com.myapp.core {
    requires java.base;
    requires com.coollib;
    exports com.myapp.core.api;
}
```

Bằng cách biến nó thành open module, ta cho phép reflection sâu vào mọi package của nó. Điều này không lý tưởng về mặt bảo mật, nhưng có thể cần thiết trong quá trình chuyển đổi để mọi thứ vẫn chạy. Khi tiến triển trong quá trình chuyển đổi, ta sẽ muốn siết chặt những quyền này, chỉ export và mở những gì cần thiết.

Hãy nhớ, chuyển đổi là một quá trình. Dùng unnamed module và automatic module như những bậc thang là hoàn toàn ổn. Điều then chốt là có kế hoạch chuyển đổi rõ ràng và tiến đều đặn về phía một hệ thống module hoá trọn vẹn. Chia nhỏ quá trình chuyển đổi thành những nhiệm vụ dễ quản lý giúp theo dõi tiến độ và phát hiện mọi thách thức hay trở ngại trên đường đi.


## Các điểm chính
- Module trong Java là một tập hợp mã và dữ liệu có tên, tự mô tả. Nó được định nghĩa trong file `module-info.java`.

- Những thành phần chính của khai báo module là:
  - `module`: Khai báo tên module
  - `requires`: Chỉ định dependency module
  - `exports`: Khiến package truy cập được từ module khác
  - `provides`: Khai báo implementation của service
  - `uses`: Cho biết module dùng một service

- Có ba loại module:
  1. Named module: Được định nghĩa tường minh bằng file `module-info.java`
  2. Automatic module: Được tạo từ file JAR đặt trên module path
  3. Unnamed module: Chứa mọi class trên classpath

- Lợi ích chính của JPMS gồm đóng gói tốt hơn, dependency rõ ràng hơn, hiệu năng tốt hơn và bảo mật được tăng cường.

- Từ khoá `exports` kiểm soát những package nào truy cập được từ module khác. Bạn cũng dùng được `exports...to` để giới hạn quyền truy cập cho những module cụ thể.

- Từ khoá `requires` khai báo dependency module. Dùng `requires transitive` để những dependency của một module khả dụng với các module phụ thuộc vào nó.

- Từ khoá `opens` cho phép truy cập bằng reflection tới một package lúc runtime.

- Service trong JPMS gồm:
  1. Service Provider Interface (SPI): Định nghĩa hợp đồng của service
  2. Service Provider: Cài đặt SPI
  3. Service Consumer: Dùng service

- Mệnh đề `provides...with` trong khai báo module chỉ định rằng module cung cấp một implementation của service.

- Mệnh đề `uses` cho biết module tiêu thụ một service.

- `ServiceLoader` được dùng để khám phá và nạp các implementation của service lúc runtime.

- Những module Java dựng sẵn bắt đầu bằng `java` (nền tảng SE cốt lõi) hoặc `jdk` (những API bổ sung đặc thù JDK).

- Khi thiết kế ứng dụng nhiều module, hãy cân nhắc sự phân tách mối quan tâm, tính đóng gói, dependency ổn định, khả năng tái sử dụng và kích thước module phù hợp.

- Biên dịch module bằng `javac` với tuỳ chọn `--module-path`. Chạy ứng dụng module hoá bằng `java` với tuỳ chọn `--module-path` và `-m`.

- Dùng lệnh `jar` để đóng gói module thành file modular JAR.

- Giải quyết xung đột giữa các module bằng cách quản lý phiên bản, tránh split package, đảm bảo tên package là duy nhất giữa các module và phá vỡ dependency vòng.

- Lệnh `java` với tuỳ chọn `--describe-module` cung cấp chi tiết về một module cụ thể, gồm exports, requires và service.

- Tuỳ chọn `--list-modules` liệt kê mọi module khả dụng trong Java runtime cùng những module tuỳ chỉnh.

- Tuỳ chọn `--show-module-resolution` giúp gỡ rối những dependency module phức tạp bằng cách cho thấy từng module được phân giải ra sao.

- Lệnh `jar` dùng được để kiểm tra module mà không cần chạy chúng, thông qua tuỳ chọn `--describe-module`.

- `jdeps` là công cụ để phân tích và trực quan hoá dependency ở cả mức module lẫn mức class.

- Đây là cú pháp cơ bản của nó: `jdeps [options] path`. Sau đây là vài tuỳ chọn quan trọng nhất:
    - Tuỳ chọn `--dot-output` sinh file DOT để trực quan hoá đồ thị dependency.
    - Cờ `--jdk-internals` giúp phát hiện việc dùng API nội bộ của JDK.
    - Tuỳ chọn `--recursive` cung cấp phân tích dependency bắc cầu.

- File JMOD được thiết kế cho Java Platform Module System (JPMS) và có phần mở rộng `.jmod`.

- File JMOD chứa được class đã biên dịch, tài nguyên, thư viện native và module descriptor.

- `jmod` có vài chế độ: create, extract, describe, list và hash.

- Những thực hành tốt gồm dùng tên mô tả rõ ràng, đưa `module-info.java` vào và tổ chức nội dung module đúng cách.

- `jlink` tạo runtime image tuỳ chỉnh chỉ chứa những module cần thiết.

- Đây là cú pháp cơ bản của `jlink`: `jlink [options] --module-path <modulepath> --add-modules <modules>`

- Plugin mở rộng được chức năng của `jlink` cho những tối ưu hay tuỳ chỉnh bổ sung.

- Những tuỳ chọn như `--compress`, `--strip-debug`, `--no-header-files` và `--no-man-pages` giúp tối ưu runtime image.

- Để chuyển một ứng dụng sang dùng module:
    - Dùng `jdeps` để phân tích cấu trúc và dependency của ứng dụng hiện tại trước khi chuyển đổi.

    - Chiến lược chia dự án thành module: theo package, theo kiến trúc phân tầng, theo tính năng và theo dependency.

    - Cách tiếp cận chuyển đổi: tăng dần, từ dưới lên, từ trên xuống và phát triển song song.

    - Unnamed module và automatic module dùng được như giải pháp tạm thời trong quá trình chuyển đổi.

    - Cân nhắc dùng open module trong quá trình chuyển đổi để cho phép reflection, nhưng hãy hướng tới siết chặt quyền khi quá trình tiến triển.

    - Chuyển đổi là một quá trình; dùng unnamed module và automatic module như bậc thang hướng tới module hoá trọn vẹn là hoàn toàn ổn.



## Câu hỏi luyện tập

**1. Những loại nào sau đây là loại module trong Java Platform Module System (JPMS)? (Chọn tất cả phương án đúng.)**

**A)** Automatic module  
**B)** Default module  
**C)** Unnamed module  
**D)** Core module  
**E)** Primary module


**2. Cách nào sau đây là cách đúng để khai báo một module tên `com.example` trong Java Platform Module System (JPMS)?**

**A)** `module com.example { export com.example.api; }`  
**B)** `declare module com.example { }`  
**C)** `create module com.example { requires java.base; }`  
**D)** `module com.example { }`  
**E)** `module com.example requires java.base;`


**3. Câu lệnh kiểm soát truy cập nào sau đây giới hạn đúng quyền truy cập tới package `com.example.internal` sao cho chỉ module `com.example.client` truy cập được?**

**A)** `module com.example { exports com.example.internal to com.example.client; }`  
**B)** `module com.example { opens com.example.internal to com.example.client; }`  
**C)** `module com.example { requires com.example.internal; }`  
**D)** `module com.example { provides com.example.internal to com.example.client; }`  
**E)** `module com.example { uses com.example.internal; }`


**4. Với những khai báo module sau, phát biểu nào đúng về khả năng truy cập package `com.example.api` bằng deep reflection từ module `com.example.client`?**

```java
module com.example {
    exports com.example.api;
    opens com.example.internal to com.example.client;
}

module com.example.client {
    requires com.example;
}
```

**A)** Module `com.example.client` truy cập được package `com.example.api` bằng deep reflection.  
**B)** Module `com.example.client` không truy cập được package `com.example.api` bằng deep reflection.  
**C)** Package `com.example.api` được mở cho mọi module dùng deep reflection.  
**D)** Package `com.example.internal` được export cho module `com.example.client`.  
**E)** Package `com.example.api` được export cho module `com.example.client` để dùng deep reflection.


**5. Phát biểu nào sau đây là đúng về các module Java cốt lõi và chức năng của chúng?**

**A)** Module `java.base` cung cấp thư viện Swing và AWT để xây giao diện đồ hoạ.  
**B)** Module `java.logging` chịu trách nhiệm xử lý collection, gồm list, set và map.  
**C)** Module `java.desktop` cung cấp các class để cài đặt stream nhập/xuất chuẩn.  
**D)** Module `java.xml` chứa các class để xử lý tài liệu XML.  
**E)** Module `java.naming` cung cấp API để truy cập và xử lý annotation.


**6. Câu lệnh dòng lệnh nào sau đây biên dịch đúng module nằm trong thư mục `src/com.example` và xuất module đã biên dịch ra thư mục `out`?**

**A)** `javac -d out src/com.example/module-info.java src/com.example/com/example/*.java`  
**B)** `javac -sourcepath src -d out com.example/module-info.java com.example/com/example/*.java`  
**C)** `javac -d out --module-source-path src -m com.example`  
**D)** `javac -modulepath out -d src src/com.example/module-info.java src/com.example/com/example/*.java`  
**E)** `javac --module-path src --module com.example -d out`


**7. Với cấu trúc ứng dụng nhiều module sau, lệnh nào biên dịch đúng cả hai module?**

```
src/
├── com.foo/
│   ├── module-info.java
│   └── com/foo/Foo.java
└── com.bar/
    ├── module-info.java
    └── com/bar/Bar.java
```

**A)** `javac --module-source-path src -d out $(find src -name "*.java")`  
**B)** `javac -d out --module com.foo,com.bar --module-source-path src`  
**C)** `javac -sourcepath src -d out src/com.foo/module-info.java src/com.foo/com/foo/*.java src/com.bar/module-info.java src/com.bar/com/bar/*.java`  
**D)** `javac -modulepath src -d out src/com.foo/*.java src/com.bar/*.java`  
**E)** `javac --module-source-path src/com.foo,src/com.bar -d out`


**8. Câu lệnh nào sau đây chỉ định đúng một service provider implementation cho service `com.example.Service` trong `module-info.java` của module `com.provider`?**

**A)** `requires com.example.Service with com.provider.ServiceImpl;`  
**B)** `exports com.example.Service with com.provider.ServiceImpl;`  
**C)** `provides com.example.Service with com.provider.ServiceImpl;`  
**D)** `uses com.example.Service with com.provider.ServiceImpl;`


**9. Câu lệnh dòng lệnh nào sau đây mô tả đúng module `com.example` bằng tuỳ chọn `--describe-module`?**

**A)** `java --describe-module com.example/module-info.java`  
**B)** `javac --describe-module com.example`  
**C)** `jar --describe-module com.example`  
**D)** `java --describe-module com.example`


**10. Câu lệnh dòng lệnh nào sau đây dùng `jdeps` đúng cách để phân tích dependency của một file JAR tên `example.jar`? (Chọn tất cả phương án đúng)**

**A)** `jdeps --list-deps example.jar`  
**B)** `jdeps -verbose example.jar`  
**C)** `jdeps -s example.jar`  
**D)** `jdeps --check example.jar`


**11. Câu lệnh dòng lệnh nào sau đây tạo đúng một file JMOD từ nội dung của thư mục `mods/com.example`?**

**A)** `jmod create --class-path mods/com.example --output com.example.jmod`  
**B)** `jmod --create --class-path mods/com.example --output com.example.jmod`  
**C)** `jmod --create --dir mods/com.example --output com.example.jmod`  
**D)** `jmod create --dir mods/com.example --output com.example.jmod`


**12. Câu lệnh dòng lệnh nào sau đây tạo đúng một runtime image tuỳ chỉnh bằng công cụ `jlink` với module `java.base` và `com.example`, xuất ra thư mục `myimage`?**

**A)** `jlink --module-path java.base:com.example --output myimage`  
**B)** `jlink --module-path mods --add-modules java.base,com.example --output myimage`  
**C)** `jlink --add-modules java.base,com.example --image myimage`  
**D)** `jlink --modules java.base,com.example --dir myimage`


**13. Phát biểu nào sau đây là đúng về việc chuyển một ứng dụng cũ sang Java Platform Module System bằng unnamed module và automatic module?**

**A)** Một unnamed module phụ thuộc được vào named module và những unnamed module khác.  
**B)** Automatic module phải có file `module-info.java` mới đặt được lên module path.  
**C)** Unnamed module export được package của nó cho named module bằng `module-info.java`.  
**D)** Automatic module được tạo ra khi một file JAR không có `module-info.java` được đặt lên module path, và nó đọc được mọi module khác.
