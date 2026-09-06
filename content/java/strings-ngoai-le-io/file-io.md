---
layout: chapter

title: "Chương 12: File I/O"
subtitle: "File I/O"
exam_objectives:
  - "Đọc và ghi dữ liệu console cũng như dữ liệu file bằng I/O stream."
  - "Serialize và deserialize object Java."
  - "Dựng, duyệt, tạo, đọc và ghi object Path cùng những thuộc tính của chúng bằng java.nio.file API."

previous_link: "/ch10.html"
previous_title: "The Date/Time API"
next_link: "/ch13.html"
next_title: "The Java Platform Module System"
answers_link: "/ch12a.html"

description: "Path và Files của NIO.2, các I/O stream byte và character, PrintStream/PrintWriter, sao chép - di chuyển - xoá file, thuộc tính file, duyệt cây thư mục và serialization trong Java 21."
order: 2
phase: "Chương 12"
tags: [Java, OCP, File I/O, NIO.2, Path, Files, Stream, Serialization]
---

## Khái niệm cơ bản
Hãy bắt đầu bằng việc định nghĩa một vài khái niệm.

Như ta đã biết, dữ liệu trong máy tính được tổ chức thành file, thư mục và hệ thống file.

Một file là một nhóm dữ liệu liên quan được lưu trên đĩa hoặc thiết bị lưu trữ khác. File có thể chứa chương trình, tài liệu, hình ảnh hay bất kỳ loại dữ liệu nào khác. 

Một thư mục (directory), còn gọi là folder, là tập hợp các file và các thư mục khác được lưu dưới cùng một tên. Thư mục cho phép bạn tổ chức file theo cấu trúc phân cấp. Ví dụ:
```
documents/
  work/
    report.pdf  
    presentation.ppt
  personal/
    resume.doc
    family.jpg
```

Thư mục ở trên cùng của cấu trúc được gọi là thư mục gốc (root directory). Trên hệ thống Unix, nó được biểu diễn bằng dấu gạch chéo (`/`), còn trên Windows nó được xác định bằng một ký tự ổ đĩa theo sau bởi dấu hai chấm, như `C:`.

Để định vị một file hay thư mục cụ thể, bạn cần chỉ ra đường dẫn (path) của nó, tức lộ trình từ thư mục gốc đến mục đó trong cây phân cấp. Dấu phân cách đường dẫn khác nhau giữa các hệ điều hành. Unix dùng dấu gạch chéo (`/`) còn Windows dùng dấu gạch chéo ngược (`\`). 

Đường dẫn có thể là tuyệt đối, chỉ rõ toàn bộ lộ trình từ gốc:
```
/home/steve/documents/work/report.pdf
C:\Users\Steve\Documents\Work\report.pdf 
```

Hoặc có thể là tương đối, chỉ lộ trình tính từ thư mục hiện tại, còn gọi là thư mục làm việc (working directory):
```
documents/work/report.pdf
..\personal\resume.doc
```

Hai ký hiệu đặc biệt thường dùng trong đường dẫn tương đối:
- Một dấu chấm (`.`) đại diện cho thư mục hiện tại 
- Hai dấu chấm (`..`) đại diện cho thư mục cha của thư mục hiện tại (lên một cấp trong cây phân cấp)

Chẳng hạn, nếu thư mục hiện tại là `/home/steve/documents` thì:
- `./work/report.pdf` tương đương `work/report.pdf`  
- `../downloads/file.zip` trỏ tới `/home/steve/downloads/file.zip`

Trong Java, bạn làm việc với hệ thống file theo hai cách chính:

1. Dùng class `java.io.File` (I/O API cũ)
2. Dùng interface `java.nio.file.Path` (NIO.2 API) 

Để tạo một instance `File`, chỉ cần truyền đường dẫn file hoặc thư mục vào constructor:

```java
File file = new File("/home/steve/documents/work/report.pdf");
File dir = new File("C:\\Users\\Steve\\Documents");
```

Lưu ý rằng việc này không thực sự tạo ra file hay thư mục trên đĩa, nó chỉ tạo một object biểu diễn đường dẫn đó. Sau đó bạn gọi các method khác nhau trên object `File` để lấy thông tin về file/thư mục hoặc để thao tác với nó.

Trong NIO.2 (New Input/Output) API mới hơn, đường dẫn được biểu diễn bằng interface `Path` thay vì class `File`. Bạn lấy được một instance `Path` theo nhiều cách:

```java
// 1. Using the Paths helper class
Path p1 = Paths.get("/home/steve/documents/work/report.pdf");

// 2. From a File object  
File file = new File("C:\\Users\\Steve\\Documents");
Path p2 = file.toPath();

// 3. By joining path strings
Path p3 = Paths.get("documents", "work", "report.pdf"); 
Path p4 = Paths.get("/home", "steve").resolve("documents");

// 4. From the default FileSystem
Path p5 = FileSystems.getDefault().getPath("documents/work/report.pdf");
```

Bạn dễ dàng chuyển đổi qua lại giữa `File` và `Path` bằng method `toFile()` và `toPath()`:

```java
File file = path.toFile();
Path path = file.toPath();  
```

Interface `Path` cung cấp những method tương tự `File` nhưng linh hoạt hơn và có thêm tính năng để làm việc với đường dẫn.

Ví dụ, bạn trích xuất được những phần cụ thể của một đường dẫn:

```java
Path path = Paths.get("/home/steve/documents/work/report.pdf");
        
Path parent = path.getParent(); // /home/steve/documents/work
Path root = path.getRoot(); // /  
Path name = path.getFileName(); // report.pdf
```

Hoặc dựng đường dẫn bằng cách nối các phần tử:

```java
Path documents = Paths.get("/home/steve/documents");
Path file = documents.resolve("work/report.pdf"); 
```

Đường dẫn thu được không nhất thiết phải tồn tại, nó chỉ là một biểu diễn trừu tượng dùng cho xử lý tiếp theo.

Trong những phần tiếp theo, ta sẽ tập trung vào interface `Path` và NIO.2 API.

## Dùng Path của NIO.2
Hãy tìm hiểu chi tiết hơn một số method và khái niệm quan trọng liên quan đến `Path`.

Interface này cung cấp những method sau để lấy thông tin cơ bản về đường dẫn:
- `String toString()`: Trả về biểu diễn chuỗi của đường dẫn.
- `int getNameCount()`: Trả về số phần tử tên trong đường dẫn.
- `Path getName(int index)`: Trả về phần tử tên tại vị trí chỉ định.

Đây là một ví dụ:
```java
Path path = Paths.get("/home/user/documents/file.txt");
System.out.println(path.toString()); // Output: /home/user/documents/file.txt
System.out.println(path.getNameCount()); // Output: 4
System.out.println(path.getName(0)); // Output: home
System.out.println(path.getName(2)); // Output: documents
```

Ngoài ra, có những method để truy cập các phần tử của đường dẫn:
- `Path getFileName()`: Trả về tên file (phần tử cuối cùng) của đường dẫn.
- `Path getRoot()`: Trả về thành phần gốc của đường dẫn, hoặc `null` nếu đường dẫn là tương đối.
- `Path getParent()`: Trả về đường dẫn cha, hoặc `null` nếu không có cha.

Đây là một ví dụ:
```java
Path path = Paths.get("/home/user/documents/file.txt");
System.out.println(path.getFileName()); // Output: file.txt
System.out.println(path.getRoot()); // Output: /
System.out.println(path.getParent()); // Output: /home/user/documents
```

Method `relativize` dựng một đường dẫn tương đối giữa đường dẫn hiện tại và một đường dẫn cho trước. Ví dụ:
```java
Path base = Paths.get("/home/user");
Path path = Paths.get("/home/user/documents/file.txt");
Path relativePath = base.relativize(path);
System.out.println(relativePath); // Output: documents/file.txt
```

Method `normalize` trả về phiên bản chuẩn hóa của đường dẫn gốc, loại bỏ những phần tử dư thừa như `.` (thư mục hiện tại) và `..` (thư mục cha):
```java
Path path = Paths.get("/home/user/./documents/../file.txt");
Path normalizedPath = path.normalize();
System.out.println(normalizedPath); // Output: /home/user/file.txt
```

Method `toRealPath` trả về đường dẫn thực của một file đang tồn tại trong hệ thống file, phân giải mọi symbolic link:
```java
Path path = Paths.get("/path/to/symlink");
Path realPath = path.toRealPath();
System.out.println(realPath); // Output: /actual/path/to/file
```

Method `resolve` phân giải một đường dẫn dựa trên đường dẫn hiện tại, cho phép bạn trộn lẫn đường dẫn tuyệt đối và tương đối:
```java
Path base = Paths.get("/home/user");
Path relativePath = Paths.get("documents/file.txt");
Path resolvedPath = base.resolve(relativePath);
System.out.println(resolvedPath); // Output: /home/user/documents/file.txt
```

Tuy nhiên, nếu đường dẫn cần phân giải vốn đã là đường dẫn tuyệt đối, nó sẽ được trả về nguyên trạng:
```java
Path base = Paths.get("/home/user");
Path absolutePath = Paths.get("/other/path/file.txt");
Path resolvedPath = base.resolve(absolutePath);
System.out.println(resolvedPath); // Output: /other/path/file.txt
```

## Class `Files`

Class `java.nio.file.Files` là một phần của NIO.2 API. Nó cung cấp một bộ static utility method phong phú để làm việc với file và thư mục một cách ngắn gọn và hiệu quả hơn so với class `File` cũ.

Đây là một số tính năng chính của nó:

- **Xử lý exception tốt hơn:**
  Nhiều method của `Files` ném ra những exception cụ thể hơn như `NoSuchFileException`, `DirectoryNotEmptyException`… giúp xử lý các tình huống lỗi khác nhau dễ dàng hơn. Ngược lại, các method của class `File` thường trả về giá trị boolean hoặc ném ra những exception chung chung hơn.

- **Hỗ trợ symbolic link:**
  Class `Files` hỗ trợ sẵn symbolic link. Bạn tạo, phát hiện và phân giải được symbolic link bằng những method như `createSymbolicLink()`, `isSymbolicLink()` và `readSymbolicLink()`.

- **Thao tác nguyên tử (atomic):**
  Class `Files` cung cấp method để thực hiện các thao tác file mang tính nguyên tử. Ví dụ, `move()` với tuỳ chọn `StandardCopyOption.ATOMIC_MOVE` đảm bảo thao tác di chuyển file được thực hiện nguyên tử.

- **Thuộc tính file:**
  Class `Files` giúp việc đọc và sửa thuộc tính file trở nên dễ dàng, chẳng hạn quyền truy cập, chủ sở hữu, dấu thời gian… Bạn dùng được những method như `readAttributes()`, `setOwner()`, `setLastModifiedTime()`…

- **Duyệt thư mục:** 
  Method `Files.walkFileTree()` cho phép bạn duyệt đệ quy một cây thư mục và thực hiện hành động trên từng file và thư mục gặp phải. Cách này hiệu quả và linh hoạt hơn việc tự duyệt cây bằng class `File`.

- **Stream và buffer:**
  Class `Files` cung cấp method để mở file dưới dạng stream (`newInputStream()`, `newOutputStream()`) hoặc reader/writer có buffer (`newBufferedReader()`, `newBufferedWriter()`), khiến thao tác I/O tiện lợi hơn.

- **Thao tác với đường dẫn:**
  Vì class `Files` làm việc với object `Path`, nó thực hiện được những thao tác liên quan đến đường dẫn như phân giải, chuẩn hóa, lấy các thành phần của đường dẫn…

- **Thao tác với nội dung file:**
  Class `Files` có những method đọc và ghi nội dung file chỉ trong một dòng mã, như `readAllBytes()`, `readAllLines()`, `write()`… Điều này loại bỏ nhu cầu viết mã I/O rườm rà thủ công.

Sau đây là một số method quan trọng mà class `Files` cung cấp:

- **Thao tác với file:**
  - `static Path createFile(Path path)`: Tạo một file mới.
  - `static Path createDirectory(Path path)`: Tạo một thư mục mới.
  - `static Path createDirectories(Path path)`: Tạo một thư mục cùng tất cả thư mục cha chưa tồn tại.
  - `static void delete(Path path)`: Xoá một file hoặc thư mục.
  - `static boolean deleteIfExists(Path path)`: Xoá một file hoặc thư mục nếu nó tồn tại.
  - `static Path copy(Path source, Path target, CopyOption... options)`: Sao chép một file hoặc thư mục.
  - `static Path move(Path source, Path target, CopyOption... options)`: Di chuyển hoặc đổi tên một file hay thư mục.

- **Đọc và ghi:**
  - `static byte[] readAllBytes(Path path)`: Đọc toàn bộ byte từ một file.
  - `static String readString(Path path)`: Đọc một file thành chuỗi.
  - `static List<String> readAllLines(Path path)`: Đọc toàn bộ các dòng từ một file.
  - `static Path write(Path path, byte[] bytes, OpenOption... options)`: Ghi byte vào một file.
  - `static Path writeString(Path path, CharSequence csq, OpenOption... options)`: Ghi một chuỗi vào file.
  - `static Path write(Path path, Iterable<? extends CharSequence> lines, OpenOption... options)`: Ghi các dòng văn bản vào file.

- **Thuộc tính file:**
  - `static boolean exists(Path path, LinkOption... options)`: Kiểm tra file hoặc thư mục có tồn tại không.
  - `static boolean notExists(Path path, LinkOption... options)`: Kiểm tra file hoặc thư mục không tồn tại.
  - `static boolean isReadable(Path path)`: Kiểm tra file có đọc được không.
  - `static boolean isWritable(Path path)`: Kiểm tra file có ghi được không.
  - `static boolean isExecutable(Path path)`: Kiểm tra file có thực thi được không.
  - `static boolean isDirectory(Path path, LinkOption... options)`: Kiểm tra một đường dẫn có phải thư mục không.
  - `static boolean isRegularFile(Path path, LinkOption... options)`: Kiểm tra một đường dẫn có phải file thường không.
  - `static long size(Path path)`: Trả về kích thước của file.

- **Hỗ trợ stream:** 
  - `static Stream<Path> list(Path dir)`: Trả về stream các mục trong một thư mục.
  - `static Stream<Path> walk(Path start, FileVisitOption... options)`: Trả về stream được nạp lazily bằng các `Path` khi duyệt cây file bắt đầu từ file gốc cho trước.
  - `static Path walkFileTree(Path start, FileVisitor<? super Path> visitor)`: Duyệt một cây file.

- **Symbolic link:**
  - `static Path createSymbolicLink(Path link, Path target, FileAttribute<?>... attrs)`: Tạo một symbolic link.
  - `static Path readSymbolicLink(Path link)`: Đọc đích của một symbolic link.

- **Quyền truy cập file:**
  - `static Path setPosixFilePermissions(Path path, Set<PosixFilePermission> perms)`: Đặt quyền file theo POSIX.
  - `static Set<PosixFilePermission> getPosixFilePermissions(Path path, LinkOption... options)`: Đọc quyền file theo POSIX.

Một số method của class `Files` nhận tham số tuỳ chọn điều khiển cách thực hiện thao tác. Sau đây là vài tham số thường gặp:

- `java.nio.file.LinkOption`: Chỉ định cách xử lý symbolic link. Giá trị thường dùng là `LinkOption.NOFOLLOW_LINKS`, nghĩa là không đi theo symbolic link.
- `java.nio.file.StandardCopyOption`: Điều khiển cách thực hiện thao tác sao chép file. Các giá trị gồm `REPLACE_EXISTING` (thay thế đích nếu đã tồn tại), `COPY_ATTRIBUTES` (sao chép cả thuộc tính file), `ATOMIC_MOVE` (thực hiện di chuyển nguyên tử).
- `java.nio.file.StandardOpenOption`: Chỉ định tuỳ chọn khi mở file. Các giá trị thường gặp là `CREATE` (tạo file mới nếu chưa tồn tại), `APPEND` (ghi nối vào cuối file), `TRUNCATE_EXISTING` (cắt bỏ nội dung file nếu đã tồn tại).
- `java.nio.file.FileVisitOption`: Dùng với method `Files.walkFileTree()` để điều khiển cách duyệt cây file. Giá trị `FOLLOW_LINKS` nghĩa là đi theo symbolic link trong quá trình duyệt.

Ở những phần tiếp theo, ta sẽ xem xét kỹ hơn một số method và tham số tuỳ chọn của class này. Nhưng trước hết, hãy nói về I/O stream.


## I/O Stream
Trong Java, I/O (Input/Output) stream cung cấp cách để đọc dữ liệu từ một nguồn hoặc ghi dữ liệu tới một đích.

Đây là một phép so sánh để giải thích I/O stream. Hãy tưởng tượng bạn có một bồn nước và muốn chuyển nước sang một thùng chứa khác. Bạn nối một ống giữa bồn và thùng, nước sẽ chảy từ bồn sang thùng qua ống đó. Tương tự, I/O stream đóng vai trò cái ống, cho phép dữ liệu chảy từ một nguồn (file, mạng hay bộ nhớ) tới một đích (file, mạng hay bộ nhớ khác).

I/O stream được phân thành nhiều nhóm.

Trước hết, Java cung cấp hai loại I/O stream: byte stream và character stream.

- **Byte stream**, đúng như tên gọi, đọc và ghi dữ liệu dưới dạng byte (dữ liệu 8 bit). Chúng phù hợp để xử lý dữ liệu nhị phân thô, như hình ảnh, file âm thanh hay bất kỳ loại dữ liệu phi văn bản nào. Ví dụ gồm `InputStream` và `OutputStream`.

- **Character stream** được thiết kế để đọc và ghi dữ liệu dưới dạng ký tự (dữ liệu Unicode 16 bit). Chúng hữu ích khi xử lý dữ liệu dạng văn bản, chẳng hạn đọc từ hoặc ghi vào file văn bản. Ví dụ gồm `Reader` và `Writer`.

I/O stream cũng được phân thành input stream và output stream.

- **Input stream** được dùng để đọc dữ liệu từ một nguồn. Chúng cung cấp những method như `read()` để đọc byte hoặc ký tự từ nguồn đầu vào. Ví dụ về các class input stream trong Java gồm `FileInputStream`, `BufferedInputStream`, `FileReader` và `BufferedReader`.

- **Output stream** được dùng để ghi dữ liệu tới một đích. Chúng cung cấp những method như `write()` để ghi byte hoặc ký tự tới đích đầu ra. Ví dụ về các class output stream trong Java gồm `FileOutputStream`, `BufferedOutputStream`, `FileWriter` và `BufferedWriter`.

Cuối cùng, I/O stream được phân loại thành low-level stream và high-level stream.

- **Low-level stream**, còn gọi là node stream, kết nối trực tiếp với nguồn hoặc đích dữ liệu. Chúng là những viên gạch nền của thao tác I/O và cung cấp chức năng cơ bản để đọc từ hoặc ghi tới một nguồn/đích cụ thể. Ví dụ về low-level stream gồm `FileInputStream`, `FileOutputStream`, `FileReader` và `FileWriter`.

- **High-level stream**, còn gọi là processing stream hay filter stream, được xây trên nền low-level stream. Chúng cung cấp thêm chức năng và tính năng, như buffering, lọc hay biến đổi dữ liệu khi đi qua stream. Ví dụ về high-level stream gồm `BufferedInputStream`, `BufferedOutputStream`, `BufferedReader`, `BufferedWriter`, `ObjectInputStream` và `ObjectOutputStream`.

### Các class stream
Thư viện `java.io` định nghĩa bốn abstract class đóng vai trò cha của mọi class I/O stream:

- `InputStream`: Class cơ sở cho mọi byte input stream.
- `OutputStream`: Class cơ sở cho mọi byte output stream.
- `Reader`: Class cơ sở cho mọi character input stream.
- `Writer`: Class cơ sở cho mọi character output stream.

Những abstract class này cung cấp các method nền tảng để đọc từ hoặc ghi tới một stream, như `read()`, `write()`, `close()` và nhiều method khác. Các class stream cụ thể kế thừa những class cơ sở này để cung cấp chức năng riêng.

Java cung cấp rất nhiều class I/O stream cụ thể trong package `java.io`. Một số class thường dùng gồm:

- `FileInputStream` và `FileOutputStream`: Dùng để đọc từ và ghi vào file dưới dạng byte stream.
- `FileReader` và `FileWriter`: Dùng để đọc từ và ghi vào file dưới dạng character stream.
- `BufferedInputStream` và `BufferedOutputStream`: Cung cấp khả năng buffering để cải thiện hiệu năng của byte stream.
- `BufferedReader` và `BufferedWriter`: Cung cấp khả năng buffering cùng những method bổ sung để đọc và ghi character stream.
- `ObjectInputStream` và `ObjectOutputStream`: Dùng để đọc và ghi object Java tới stream.
- `PrintStream` và `PrintWriter`: Cung cấp method để ghi dữ liệu đã định dạng tới một stream.

Những class cụ thể này kế thừa class cơ sở tương ứng (`InputStream`, `OutputStream`, `Reader` hoặc `Writer`) và cài đặt chức năng riêng để xử lý các loại nguồn và đích dữ liệu khác nhau.

### `FileInputStream`

`FileInputStream` đọc byte từ một file. Nó kế thừa từ `InputStream`.

Nó tạo được bằng một object `File` hoặc một `String path`:

```java
FileInputStream(File file)
FileInputStream(String path)
```

Đây là cách dùng:

```java
try (InputStream in = new FileInputStream("/file.txt")) {
    int b;
    // -1 indicates the end of the file
    while((b = in.read()) != -1) {
        // Do something with the byte read
    }
} catch(IOException e) {
    /** ... */
}
```

Cũng có một method `read()` đọc byte vào một mảng byte:

```java
byte[] data = new byte[1024];
int numberOfBytesRead;
while((numberOfBytesRead = in.read(data)) != -1) {
    // Do something with the array data
}
```

Mọi class ta sẽ xem xét đều cần được đóng lại. May mắn là chúng implement `java.lang.AutoCloseable` nên dùng được trong `try-with-resources`.

Ngoài ra, gần như mọi method của những class này đều ném `IOException` hoặc một subclass của nó (như `FileNotFoundException`, cái tên khá dễ hiểu).

### `FileOutputStream`

`FileOutputStream` ghi byte vào một file. Nó kế thừa từ `OutputStream`.

Nó tạo được bằng một object `File` hoặc một `String` path, cùng một `boolean` tuỳ chọn cho biết bạn muốn ghi đè hay ghi nối vào file nếu file đã tồn tại (mặc định là ghi đè):

```java
FileOutputStream(File file)
FileOutputStream(File file, boolean append)
FileOutputStream(String path)
FileOutputStream(String path, boolean append)
```

Đây là cách dùng:

```java
try (OutputStream out = new FileOutputStream("/file.txt")) {
    int b;
    // Made up method to get some data
    while((b = getData()) != -1) {
        // Writes b to the file output stream
        out.write(b);
        out.flush();
    }
} catch(IOException e) {
    /** ... */
}
```

Khi bạn ghi vào một `OutputStream`, dữ liệu có thể được cache trong bộ nhớ và chỉ được ghi xuống đĩa vào lúc muộn hơn. Nếu muốn chắc chắn mọi dữ liệu đã được ghi xuống đĩa mà không cần đóng `OutputStream`, bạn gọi method `flush()` theo từng lúc.

`FileOutputStream` cũng chứa những phiên bản nạp chồng của `write()` cho phép bạn ghi dữ liệu chứa trong một mảng byte.

### `FileReader`

`FileReader` đọc ký tự từ một file văn bản. Nó kế thừa từ `Reader`.

Nó tạo được bằng một object `File` hoặc một `String` path:

```java
FileReader(File file)
FileReader(String path)
```

Đây là cách dùng:

```java
try (Reader r = new FileReader("/file.txt")) {
    int c;
    // -1 indicates the end of the file
    while((c = r.read()) != -1) {
        char character = (char)c;
        // Do something with the character
    }
} catch(IOException e) {
    /** ... */
}
```

Cũng có một method `read()` đọc ký tự vào một mảng `char`:

```java
char[] data = new char[1024];
int numberOfCharsRead = r.read(data);
while((numberOfCharsRead = r.read(data)) != -1) {
    // Do something with the array data
}
```

`FileReader` mặc định rằng bạn muốn giải mã các ký tự trong file bằng bảng mã ký tự mặc định của máy đang chạy chương trình.

### `FileWriter`

`FileWriter` ghi ký tự vào một file văn bản. Nó kế thừa từ `Writer`.

Nó tạo được bằng một object `File` hoặc một `String` path, cùng một `boolean` tuỳ chọn cho biết bạn muốn ghi đè hay ghi nối vào file nếu file đã tồn tại (mặc định là ghi đè):

```java
FileWriter(File file)
FileWriter(File file, boolean append)
FileWriter(String path)
FileWriter(String path, boolean append)
```

Đây là cách dùng:

```java
try (Writer w = new FileWriter("/file.txt")) {
    w.write('-'); // writing a character
    // writing a string
    w.write("Writing to the file...");
} catch(IOException e) {
    /** ... */
}
```

Giống như `OutputStream`, dữ liệu có thể được cache trong bộ nhớ và chỉ được ghi xuống đĩa vào lúc muộn hơn. Nếu muốn chắc chắn mọi dữ liệu đã được ghi xuống đĩa mà không cần đóng `FileWriter`, bạn gọi method `flush()` theo từng lúc.

`FileWriter` cũng chứa những phiên bản nạp chồng của `write()` cho phép bạn ghi dữ liệu chứa trong một mảng `char` hoặc trong một `String`.

`FileWriter` mặc định rằng bạn muốn mã hoá các ký tự trong file bằng bảng mã ký tự mặc định của máy đang chạy chương trình.

### `BufferedReader`

`BufferedReader` đọc văn bản từ một character stream. Thay vì đọc từng ký tự một, `BufferedReader` đọc cả một khối lớn vào buffer. Nó kế thừa từ `Reader`.

Đây là một wrapper class, được tạo bằng cách truyền một `Reader` vào constructor, và tuỳ chọn thêm kích thước buffer:

```java
BufferedReader(Reader in)
BufferedReader(Reader in, int size)
```

`BufferedReader` có thêm một method đọc (ngoài những method kế thừa từ `Reader`) là `readLine()`. Đây là cách dùng:

```java
try (BufferedReader br = new BufferedReader(new FileReader("/file.txt"))) {
    String line;
    // null indicates the end of the file
    while((line = br.readLine()) != null) {
        // Do something with the line
    }
} catch(IOException e) {
    /** ... */
}
```

Khi `BufferedReader` được đóng, nó cũng đóng luôn instance `Reader` mà nó đọc từ đó.

### `BufferedWriter`

`BufferedWriter` ghi văn bản tới một character stream, đệm các ký tự để tăng hiệu quả. Nó kế thừa từ `Writer`.

Đây là một wrapper class, được tạo bằng cách truyền một `Writer` vào constructor, và tuỳ chọn thêm kích thước buffer:

```java
BufferedWriter(Writer out)
BufferedWriter(Writer out, int size)
```

`BufferedWriter` có thêm một method ghi (ngoài những method kế thừa từ `Writer`) là `newLine()`. Đây là cách dùng:

```java
try (BufferedWriter bw = new BufferedWriter(new FileWriter("/file.txt"))) {
    bw.write("Writing to the file...");
    bw.newLine();
} catch(IOException e) {
    /** ... */
}
```

Vì dữ liệu được ghi vào buffer trước, bạn gọi method `flush()` để đảm bảo phần văn bản đã ghi tới thời điểm đó thực sự được ghi xuống đĩa.

Khi `BufferedWriter` được đóng, nó cũng đóng luôn instance `Writer` mà nó ghi tới.

### `ObjectInputStream` và `ObjectOutputStream`

Quá trình chuyển một object thành định dạng dữ liệu có thể lưu trữ (chẳng hạn trong một file) được gọi là *serialization*, còn việc chuyển định dạng dữ liệu đã lưu đó trở lại thành object được gọi là *deserialization*.

Nếu bạn muốn serialize một object, class của nó phải implement interface `java.io.Serializable`; interface này không có method nào cần cài đặt, nó chỉ đánh dấu object của class đó là serializable.

Ta sẽ bàn kỹ hơn về quá trình này ở phần sau, nhưng ngay lúc này bạn cần biết rằng `ObjectOutputStream` cho phép serialize object tới một `OutputStream`, còn `ObjectInputStream` cho phép deserialize object từ một `InputStream`. Vậy nên cả hai đều được xem là wrapper class.

Đây là constructor của class `ObjectOutputStream`:

```java
ObjectOutputStream(OutputStream out)
```

Class này có những method để ghi nhiều kiểu nguyên thuỷ, như:

```java
void writeInt(int val)
void writeBoolean(boolean val)
```

Nhưng hữu ích nhất là `writeObject(Object)`. Đây là một ví dụ:

```java
class Box implements java.io.Serializable {
    /** ... */
}
...
try(ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream("obj.dat"))) {
    Box box = new Box();
    oos.writeObject(box);
} catch(IOException e) {
    /** ... */
}
```

Để deserialize file `obj.dat`, ta dùng class `ObjectInputStream`. Đây là constructor của nó:

```java
ObjectInputStream(InputStream in)
```

Class này có những method để đọc nhiều kiểu dữ liệu, trong đó có:

```java
Object readObject() throws IOException, ClassNotFoundException
```

Chú ý rằng nó trả về kiểu `Object`. Do đó, ta phải ép kiểu object một cách tường minh. Điều này có thể dẫn tới `ClassCastException` được ném ra lúc runtime. Lưu ý rằng method này còn ném `ClassNotFoundException` (một checked exception), phòng khi không tìm thấy class của object đã được serialize.

Đây là một ví dụ:

```java
try (ObjectInputStream ois = new ObjectInputStream(new FileInputStream("obj.dat"))) {
    Box box = null;
    Object obj = ois.readObject();
    if(obj instanceof Box) {
        box = (Box)obj;
    }
} catch(IOException ioe) {
    /** ... */
} catch(ClassNotFoundException cnfe) {
    /** ... */
}
```

### `PrintStream`

`PrintStream` là subclass của `OutputStream`, bổ sung khả năng in nhiều kiểu dữ liệu ở dạng dễ đọc với con người. Nó tương tự `PrintWriter`, chỉ khác là nó chỉ làm việc với `OutputStream`. Hãy xem các constructor của nó:

```java
PrintStream(OutputStream out)
PrintStream(OutputStream out, boolean autoFlush)
PrintStream(OutputStream out, boolean autoFlush, String encoding) throws UnsupportedEncodingException
PrintStream(File file) throws FileNotFoundException
PrintStream(File file, String encoding) throws FileNotFoundException, UnsupportedEncodingException
PrintStream(String fileName) throws FileNotFoundException
PrintStream(String fileName, String encoding) throws FileNotFoundException, UnsupportedEncodingException
```

Mặc định, nó dùng charset mặc định của máy đang chạy chương trình, nhưng bạn chỉ định được charset khi cần.

`PrintStream` có method `write()` giống các subclass khác của `OutputStream`, nhưng nó ghi đè những method này để tránh ném `IOException`.

Nó cũng bổ sung những method như `print()`, `println()`, `format()` và `printf()` để xuất dữ liệu thuận tiện. Đây là cách dùng class này:

```java
// Opens or creates the file without automatic line flushing
// and using the default character encoding
try (PrintStream ps = new PrintStream("file.txt")) {
    ps.write("Hi".getBytes()); // Writing a String as bytes
    ps.write(100); // Writing a character as bytes

    // write the string representation of the argument
    // it has versions for all primitives, char[], String, and Object
    ps.print(true);
    ps.print(10);

    // same as print() but it also writes a line break as defined by
    // System.getProperty("line.separator") after the value
    ps.println(); // Just writes a new line
    ps.println("A new line...");

    // format() and printf() are the same methods
    // They write a formatted string using a format string,
    // its arguments and an optional Locale
    ps.format("%s %d", "Formatted string ", 1);
    ps.printf("%s %d", "Formatted string ", 2);
    ps.format(Locale.GERMAN, "%.2f", 3.1416);
    ps.printf(Locale.GERMAN, "%.3f", 3.1416);
} catch (FileNotFoundException e) {
    // if the file cannot be opened or created
}
```

Bạn tìm hiểu thêm về chuỗi định dạng cho `format()` và `printf()` trong [tài liệu của class `java.util.Formatter`](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/Formatter.html).

### `PrintWriter`

`PrintWriter` là subclass của `Writer`, ghi dữ liệu đã định dạng tới một stream khác (được bọc bên trong), kể cả một `OutputStream`. Hãy nhìn các constructor của nó:

```java
PrintWriter(File file) throws FileNotFoundException
PrintWriter(File file, String charset) throws FileNotFoundException, UnsupportedEncodingException
PrintWriter(OutputStream out)
PrintWriter(OutputStream out, boolean autoFlush)
PrintWriter(String fileName) throws FileNotFoundException
PrintWriter(String fileName, String charset) throws FileNotFoundException, UnsupportedEncodingException
PrintWriter(Writer out)
PrintWriter(Writer out, boolean autoFlush)
```

Mặc định, nó dùng charset mặc định của máy đang chạy chương trình, nhưng class này chấp nhận những charset sau (còn có các charset tuỳ chọn khác):

- `US-ASCII`
- `ISO-8859-1`
- `UTF-8`
- `UTF-16BE`
- `UTF-16LE`
- `UTF-16`

Như mọi `Writer`, class này có method `write()` mà ta đã thấy ở các subclass khác của `Writer`, nhưng nó ghi đè những method này để tránh ném `IOException`.

Nó cũng bổ sung các method `format()`, `print()`, `printf()`, `println()`.

Đây là cách dùng class này:

```java
// Opens or creates the file without automatic line flushing
// and converting characters by using the default character encoding
try(PrintWriter pw = new PrintWriter("/file.txt")) {
    pw.write("Hi"); // Writing a String
    pw.write(100); // Writing a character

    // write the string representation of the argument
    // it has versions for all primitives, char[], String, and Object
    pw.print(true);
    pw.print(10);

    // same as print() but it also writes a line break as defined by
    // System.getProperty("line.separator") after the value
    pw.println(); // Just writes a new line
    pw.println("A new line...");

    // format() and printf() are the same methods
    // They write a formatted string using a format string,
    // its arguments and an optional Locale
    pw.format("%s %d", "Formatted string ", 1);
    pw.printf("%s %d", "Formatted string ", 2);
    pw.format(Locale.GERMAN, "%.2f", 3.1416);
    pw.printf(Locale.GERMAN, "%.3f", 3.1416);
} catch(FileNotFoundException e) {
    // if the file cannot be opened or created
}
```

Cũng như với `PrintWriter`, bạn tìm hiểu thêm về chuỗi định dạng cho `format()` và `printf()` trong [tài liệu của class `java.util.Formatter`](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/Formatter.html).


### Stream chuẩn

Java khởi tạo và cung cấp ba object stream dưới dạng field `public static` của class `java.lang.System`:

- `InputStream System.in`  
  Stream đầu vào chuẩn (thường là dữ liệu nhập từ bàn phím)
- `PrintStream System.out`  
  Stream đầu ra chuẩn (thường là màn hình hiển thị mặc định)
- `PrintStream System.err`  
  Stream đầu ra lỗi chuẩn (thường là màn hình hiển thị lỗi mặc định)

Hãy nhớ, `PrintStream` làm đúng những việc và có đúng những tính năng như `PrintWriter`, nó chỉ khác ở chỗ chỉ làm việc với `OutputStream`.

Ví dụ sau minh hoạ cách đọc một ký tự (một byte) từ dòng lệnh:

```java
System.out.print("Enter a character: ");
try {
    int c = System.in.read();
} catch(IOException e) {
    System.err.println("Error: " + e);
}
```

Hoặc để đọc chuỗi:

```java
BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
String line = br.readLine();
// Or using the java.util.Scanner class
Scanner scanner = new Scanner(System.in);
String line = scanner.nextLine();
```

Những stream này (`System.in`, `System.out`, `System.err`) được dùng cho việc nhập/xuất cơ bản trong rất nhiều chương trình Java.


## Sao chép, di chuyển, xoá và so sánh file
Trước đó bạn đã biết rằng class `java.nio.file.Files` cung cấp nhiều method cho các thao tác với file như sao chép, di chuyển, xoá và so sánh. Hãy tìm hiểu chi tiết những thao tác này.

Method `Files.copy()` cho phép bạn sao chép một file từ vị trí này sang vị trí khác. Nó nhận một đường dẫn nguồn và một đường dẫn đích làm tham số.

Nếu file đích đã tồn tại, bạn chỉ định được cách xử lý thao tác sao chép bằng enum `StandardCopyOption`.
```java
Path source = Paths.get("path/to/source/file.txt");
Path target = Paths.get("path/to/target/file.txt");

// Copy the file, replacing the target file if it exists
Files.copy(source, target, StandardCopyOption.REPLACE_EXISTING);
```

Tuỳ chọn `StandardCopyOption.REPLACE_EXISTING` nghĩa là nếu file đích đã tồn tại thì nó sẽ được thay thế bằng file nguồn.

Bạn cũng sao chép file được bằng I/O stream. Cách này hữu ích khi bạn cần kiểm soát quá trình sao chép nhiều hơn hoặc khi làm việc với file lớn:
```java
try (InputStream inputStream = new FileInputStream("source.txt");
     OutputStream outputStream = new FileOutputStream("target.txt")) {
    
    byte[] buffer = new byte[1024]; // Buffer size can be adjusted for performance
    int bytesRead;
    while ((bytesRead = inputStream.read(buffer)) != -1) {
        outputStream.write(buffer, 0, bytesRead);
    }
} catch (IOException e) {
    e.printStackTrace();
}
```

Trong ví dụ này, ta tạo một `InputStream` để đọc từ file nguồn và một `OutputStream` để ghi vào file đích. Ta dùng một buffer để đọc và ghi dữ liệu theo từng khối.

Để sao chép một file vào một thư mục, bạn chỉ định đường dẫn thư mục đích cùng tên file.
```java
Path sourceFile = Paths.get("path/to/source/file.txt");
Path targetDirectory = Paths.get("path/to/target/directory");

// Copy the file into the target directory
Files.copy(sourceFile, targetDirectory.resolve(sourceFile.getFileName()));
```

Biểu thức `targetDirectory.resolve(sourceFile.getFileName())` tạo ra đường dẫn đích bằng cách kết hợp đường dẫn thư mục đích với tên file của file nguồn.

Method `Files.move()` cho phép bạn di chuyển hoặc đổi tên một file hay thư mục.
```java
Path source = Paths.get("path/to/source/file.txt");
Path target = Paths.get("path/to/target/file.txt");

// Move the file
Files.move(source, target);
```

Nếu file đích đã tồn tại, một exception sẽ được ném ra. Bạn dùng tuỳ chọn `StandardCopyOption.REPLACE_EXISTING` để thay thế file đích nếu nó đã tồn tại:
```java
Files.move(source, target, StandardCopyOption.REPLACE_EXISTING);
```

Một phép di chuyển nguyên tử đảm bảo thao tác di chuyển được thực hiện như một thao tác không thể chia nhỏ. Nó hoặc hoàn tất thành công, hoặc thất bại mà không để lại thay đổi dở dang nào:
```java
Path source = Paths.get("path/to/source/file.txt");
Path target = Paths.get("path/to/target/file.txt");

// Perform an atomic move
Files.move(source, target, StandardCopyOption.ATOMIC_MOVE);
```

Tuỳ chọn `StandardCopyOption.ATOMIC_MOVE` đảm bảo thao tác di chuyển là nguyên tử, ngăn dữ liệu bị hỏng trong quá trình di chuyển.

Method `Files.delete()` cho phép bạn xoá một file hoặc một thư mục rỗng:
```java
Path path = Paths.get("path/to/file.txt");

// Delete the file
Files.delete(path);
```

Nếu file không tồn tại, một `NoSuchFileException` sẽ được ném ra.

Method `Files.deleteIfExists()` xoá file nếu nó tồn tại và trả về một boolean cho biết file đã được xoá hay chưa:
```java
Path path = Paths.get("path/to/file.txt");

// Delete the file if it exists
boolean deleted = Files.deleteIfExists(path);
```

Method này không ném exception nếu file không tồn tại.

Method `Files.isSameFile()` cho phép bạn xác định xem hai đường dẫn có trỏ tới cùng một file trong hệ thống file hay không:
```java
Path path1 = Paths.get("path/to/file1.txt");
Path path2 = Paths.get("path/to/file2.txt");

// Check if the paths refer to the same file
boolean isSame = Files.isSameFile(path1, path2);
```

Nó trả về `true` nếu hai đường dẫn trỏ tới cùng một file, ngược lại trả về `false`.

Method `Files.mismatch()` so sánh nội dung của hai file và trả về vị trí byte đầu tiên khác nhau:
```java
Path file1 = Paths.get("path/to/file1.txt");
Path file2 = Paths.get("path/to/file2.txt");

// Compare the content of the files
long mismatchPosition = Files.mismatch(file1, file2);
```

Nếu hai file có nội dung giống hệt nhau, nó trả về -1. Nếu hai file có kích thước khác nhau, nó trả về kích thước của file nhỏ hơn.

Đó là một số method quan trọng mà class `Files` cung cấp để sao chép, di chuyển, xoá và so sánh file trong Java. Chúng đem lại cách thuận tiện để thực hiện những thao tác file thường gặp mà không cần tự xử lý I/O stream thủ công.



## Đọc và ghi file
Java cung cấp một số method trong class `java.nio.file.Files` để đọc từ và ghi vào file. Hãy tìm hiểu một vài method và kỹ thuật thường dùng.

### Đọc file
Class `Files` cung cấp hai method tiện lợi để đọc nội dung của một file: `readAllLines()` và `lines()`.

Method `Files.readAllLines()` đọc toàn bộ các dòng của file vào một `List<String>`:
```java
Path path = Paths.get("path/to/file.txt");

try {
    List<String> lines = Files.readAllLines(path);
    for (String line : lines) {
        System.out.println(line);
    }
} catch (IOException e) {
    e.printStackTrace();
}
```

Method này phù hợp khi bạn cần xử lý toàn bộ các dòng của file cùng lúc. Tuy nhiên, lưu ý rằng nó đọc cả file vào bộ nhớ nên có thể không hiệu quả với file lớn.

Ngược lại, method `Files.lines()` trả về một `Stream<String>` cho phép bạn xử lý các dòng của file một cách lazy:
```java
Path path = Paths.get("path/to/file.txt");

try (Stream<String> lines = Files.lines(path)) {
    lines.forEach(System.out::println);
} catch (IOException e) {
    e.printStackTrace();
}
```
Method này tiết kiệm bộ nhớ hơn vì nó đọc các dòng theo nhu cầu và không nạp cả file vào bộ nhớ một lúc. Nó đặc biệt hữu ích khi bạn cần xử lý file lớn hoặc thực hiện những thao tác như lọc hay ánh xạ trên các dòng.

Tuy nhiên, để kiểm soát quá trình đọc nhiều hơn, bạn dùng method `Files.newBufferedReader()` để tạo một instance `BufferedReader`:
```java
Path path = Paths.get("path/to/file.txt");

try (BufferedReader reader = Files.newBufferedReader(path)) {
    String line;
    while ((line = reader.readLine()) != null) {
        System.out.println(line);
    }
} catch (IOException e) {
    e.printStackTrace();
}
```
`BufferedReader` cung cấp những method như `readLine()` để đọc file theo từng dòng, cho phép bạn xử lý từng dòng theo nhu cầu.

### Ghi file
Class `Files` cung cấp những method để ghi nội dung vào file, như `write()` và `newBufferedWriter()`.

Method `Files.write()` cho phép bạn ghi nội dung vào file chỉ trong một thao tác:
```java
Path path = Paths.get("path/to/file.txt");
String content = "Hello, World!";

try {
    Files.write(path, content.getBytes(StandardCharsets.UTF_8));
} catch (IOException e) {
    e.printStackTrace();
}
```

Method này ghi mảng byte được chỉ định vào file. Nếu file đã tồn tại, mặc định nó sẽ bị ghi đè.

Ngoài ra, bạn chỉ định được thêm tuỳ chọn bằng enum `StandardOpenOption`.
```java
Path path = Paths.get("path/to/file.txt");
String content = "Appended content";

try {
    Files.write(path, content.getBytes(StandardCharsets.UTF_8), StandardOpenOption.APPEND);
} catch (IOException e) {
    e.printStackTrace();
}
```
Tuỳ chọn `StandardOpenOption.APPEND` chỉ định rằng nội dung được ghi nối vào cuối file thay vì ghi đè lên nó.

Những tuỳ chọn hữu ích khác gồm:
- `StandardOpenOption.CREATE`: Tạo file mới nếu nó chưa tồn tại.
- `StandardOpenOption.CREATE_NEW`: Tạo file mới, thất bại nếu file đã tồn tại.
- `StandardOpenOption.TRUNCATE_EXISTING`: Cắt file về 0 byte nếu nó đã tồn tại.

Những tuỳ chọn này cho bạn nhiều quyền kiểm soát hơn với cách file được mở và ghi.

Tuy nhiên, bạn cũng dùng được method `Files.newBufferedWriter()` để tạo một instance `BufferedWriter`:
```java
Path path = Paths.get("path/to/file.txt");

try (BufferedWriter writer = Files.newBufferedWriter(path)) {
    writer.write("Hello, World!");
    writer.newLine();
    writer.write("This is a new line.");
} catch (IOException e) {
    e.printStackTrace();
}
```

`BufferedWriter` cung cấp những method như `write()` và `newLine()` để ghi nội dung vào file, cho phép bạn ghi theo từng dòng hoặc theo từng khối.


## Làm việc với thuộc tính file
Package `java.nio.file` cung cấp những class và method để làm việc với thuộc tính file. Thuộc tính file là siêu dữ liệu gắn với một file hay thư mục, như kích thước, thời điểm sửa đổi, quyền truy cập và nhiều thứ khác. Bạn lấy và chỉnh sửa được thuộc tính file bằng NIO.2 API.

Java định nghĩa một số kiểu attribute và view biểu diễn những tập thuộc tính file khác nhau:

**BasicFileAttributes**
Interface `BasicFileAttributes` cung cấp những thuộc tính file cơ bản, chung cho các hệ thống file khác nhau. Nó gồm những thuộc tính như:
- `FileTime creationTime()`: Trả về thời điểm tạo file.
- `FileTime lastModifiedTime()`: Trả về thời điểm sửa đổi gần nhất của file.
- `FileTime lastAccessTime()`: Trả về thời điểm truy cập gần nhất của file.
- `long size()`: Trả về kích thước file tính bằng byte.
- `boolean isRegularFile()`, `isDirectory()`, `isSymbolicLink()`: Kiểm tra loại của file.

**DosFileAttributes**
Interface `DosFileAttributes` mở rộng `BasicFileAttributes` và cung cấp thêm những thuộc tính riêng cho hệ thống file DOS/Windows. Nó gồm những thuộc tính như:
- `boolean isReadOnly()`: Kiểm tra file có phải chỉ đọc không.
- `boolean isHidden()`: Kiểm tra file có bị ẩn không.
- `boolean isArchive()`: Kiểm tra file có phải file lưu trữ không.
- `boolean isSystem()`: Kiểm tra file có phải file hệ thống không.

**PosixFileAttributes**
Interface `PosixFileAttributes` mở rộng `BasicFileAttributes` và cung cấp thêm những thuộc tính riêng cho hệ thống file tuân thủ POSIX. Nó gồm những thuộc tính như:
- `UserPrincipal owner()`: Trả về chủ sở hữu của file.
- `GroupPrincipal group()`: Trả về nhóm sở hữu file.
- `Set<PosixFilePermission> permissions()`: Trả về quyền truy cập file dưới dạng một tập `PosixFilePermission`.

Để lấy thuộc tính file, bạn dùng method `Files.readAttributes()`, chỉ định kiểu thuộc tính bạn muốn lấy:
```java
Path path = Paths.get("path/to/file.txt");

try {
    BasicFileAttributes attrs = Files.readAttributes(path, BasicFileAttributes.class);
    System.out.println("Creation Time: " + attrs.creationTime());
    System.out.println("Last Modified Time: " + attrs.lastModifiedTime());
    System.out.println("Size: " + attrs.size());
} catch (IOException e) {
    e.printStackTrace();
}
```
Trong ví dụ này, ta lấy `BasicFileAttributes` của file và truy cập thời điểm tạo, thời điểm sửa đổi gần nhất cùng kích thước của nó.

Ngoài ra, bạn chỉ định được `LinkOption` để điều khiển cách xử lý symbolic link:
```java
Path path = Paths.get("path/to/symlink.txt");

try {
    BasicFileAttributes attrs = Files.readAttributes(path, BasicFileAttributes.class, LinkOption.NOFOLLOW_LINKS);
    boolean isSymLink = attrs.isSymbolicLink();
} catch (IOException e) {
    e.printStackTrace();
}
```
Bằng cách truyền `LinkOption.NOFOLLOW_LINKS`, method `readAttributes()` sẽ không đi theo symbolic link mà trả về thuộc tính của chính symbolic link đó.

Để nhanh chóng kiểm tra một file có đọc, ghi hay thực thi được không, bạn dùng những method `Files.isReadable()`, `Files.isWritable()` và `Files.isExecutable()`:
```java
Path path = Paths.get("path/to/file.txt");

boolean isReadable = Files.isReadable(path);
boolean isWritable = Files.isWritable(path);
boolean isExecutable = Files.isExecutable(path);
```
Những method này trả về `true` nếu file cho phép thao tác tương ứng, ngược lại trả về `false`.

Để chỉnh sửa thuộc tính file, bạn dùng method `Files.setAttribute()`, chỉ định tên và giá trị thuộc tính:
```java
Path path = Paths.get("path/to/file.txt");

try {
    Files.setAttribute(path, "dos:readonly", true);
    Files.setAttribute(path, "dos:hidden", true);
} catch (IOException e) {
    e.printStackTrace();
}
```
Trong ví dụ này, ta đặt thuộc tính `readonly` và `hidden` cho một file trên hệ thống file DOS/Windows.

## Duyệt cây thư mục
Duyệt cây thư mục, còn gọi là "walking" cây thư mục, là quá trình thăm đệ quy mọi thư mục con và file bên trong một thư mục cho trước. NIO.2 API, cụ thể là class `Files`, cung cấp những method giúp đơn giản hoá quá trình này và cho phép bạn thực hiện hành động trên từng file và thư mục được thăm.

Method `Files.walk()` là cách thuận tiện để duyệt một cây thư mục. Nó trả về một `Stream<Path>` biểu diễn cây file bắt đầu từ thư mục gốc cho trước:
```java
Path startingDir = Paths.get("/path/to/directory");

try (Stream<Path> stream = Files.walk(startingDir)) {
    stream.forEach(path -> {
        // Process each path
        System.out.println(path);
    });
} catch (IOException e) {
    e.printStackTrace();
}
```

Method `Files.walk()` thăm mọi file và thư mục trong cây, kể cả chính thư mục khởi đầu. Bạn thực hiện được nhiều thao tác khác nhau trên từng path bằng stream API, như lọc, ánh xạ hay thu thập các path.

Bạn kiểm soát được độ sâu duyệt bằng cách truyền giá trị độ sâu tối đa cho method `Files.walk()`:
```java
Path startingDir = Paths.get("/path/to/directory");
int maxDepth = 3;

try (Stream<Path> stream = Files.walk(startingDir, maxDepth)) {
    // ...
} catch (IOException e) {
    e.printStackTrace();
}
```

Trong ví dụ này, việc duyệt sẽ đi tối đa 3 cấp dưới thư mục khởi đầu. Độ sâu bằng 0 nghĩa là chỉ chính thư mục khởi đầu được thăm.

Mặc định, `Files.walk()` đi theo symbolic link. Nếu muốn kiểm soát hành vi này, bạn truyền một `FileVisitOption` cho method:
```java
Path startingDir = Paths.get("/path/to/directory");

try (Stream<Path> stream = Files.walk(startingDir, FileVisitOption.FOLLOW_LINKS)) {
    // ...
} catch (IOException e) {
    e.printStackTrace();
}
```

Tuỳ chọn `FileVisitOption.FOLLOW_LINKS` chỉ định rằng symbolic link sẽ được đi theo trong quá trình duyệt.

Tuy nhiên, khi duyệt cây thư mục trong Java, cần lưu ý tới đường dẫn vòng (circular path) do symbolic link gây ra. Đường dẫn vòng xảy ra khi một symbolic link trỏ tới một thư mục là tổ tiên của chính link đó, tạo thành vòng lặp vô hạn.

Để tránh đường dẫn vòng, bạn dùng tuỳ chọn `FileVisitOption.FOLLOW_LINKS` và tự cài đặt logic phát hiện chu trình. Đây là một ví dụ đầy đủ:

```java
import java.io.IOException;
import java.nio.file.*;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.EnumSet;
import java.util.HashSet;
import java.util.Set;

public class DirectoryTraversal {
    public static void main(String[] args) {
        Path startingDir = Paths.get("/path/to/directory");
        Set<Path> visitedPaths = new HashSet<>();

        try {
            Files.walkFileTree(
                               startingDir, 
                               EnumSet.of(FileVisitOption.FOLLOW_LINKS), 
                               Integer.MAX_VALUE, new SimpleFileVisitor<Path>() {
                @Override
                public FileVisitResult visitFile(
                        Path file, BasicFileAttributes attrs) throws IOException {
                    if (visitedPaths.contains(file)) {
                        // Circular path detected, skip processing
                        return FileVisitResult.CONTINUE;
                    }
                    visitedPaths.add(file);
                    // Process the file
                    System.out.println(file);
                    return FileVisitResult.CONTINUE;
                }

                @Override
                public FileVisitResult preVisitDirectory(
                        Path dir, BasicFileAttributes attrs) throws IOException {
                    if (visitedPaths.contains(dir)) {
                        // Circular path detected, skip processing
                        return FileVisitResult.SKIP_SUBTREE;
                    }
                    visitedPaths.add(dir);
                    // Process the directory
                    System.out.println(dir);
                    return FileVisitResult.CONTINUE;
                }

                @Override
                public FileVisitResult visitFileFailed(
                        Path file, IOException exc) throws IOException {
                    System.err.println(
                        "Error visiting file: " + file + " - " + exc.getMessage()
                    );
                    return FileVisitResult.CONTINUE;
                }
            });
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

Chương trình này minh hoạ cách duyệt một cây thư mục trong khi tránh những đường dẫn vòng do symbolic link gây ra. Nó bắt đầu bằng việc xác định thư mục khởi đầu qua biến `startingDir` và dùng method `Files.walkFileTree` để duyệt cây thư mục. Method này được khuyến nghị vì nó thăm mọi file và thư mục, đồng thời đi theo được symbolic link khi tuỳ chọn `FileVisitOption.FOLLOW_LINKS` được chỉ định. Để ngăn vòng lặp vô hạn do đường dẫn vòng, chương trình duy trì một tập các path đã thăm (`visitedPaths`). Tập này dùng để theo dõi mọi thư mục và file đã được thăm trong quá trình duyệt.

Phần lõi của chương trình là việc cài đặt một `SimpleFileVisitor`, ghi đè vài method để định nghĩa hành vi tuỳ chỉnh khi thăm file và thư mục. Khi chương trình tìm thấy một file hay thư mục, nó kiểm tra tập `visitedPaths` xem path đó đã được thăm chưa. Nếu path đã có trong tập, đó là dấu hiệu của đường dẫn vòng và chương trình bỏ qua việc xử lý tiếp path đó. Nếu path chưa có trong tập, nó được thêm vào `visitedPaths` và được xử lý (ở đây là in ra console). Cách này đảm bảo mỗi path chỉ được xử lý một lần, qua đó ngăn hiệu quả các vòng lặp vô hạn.


## Serialize dữ liệu
Ta đã nói về serialization trước đó. Đây là quá trình chuyển một object thành một byte stream, có thể lưu vào file hoặc truyền qua mạng. Deserialization là quá trình ngược lại, trong đó byte stream được chuyển trở lại thành object. Hãy tìm hiểu những khái niệm và kỹ thuật quan trọng liên quan tới serialization trong Java.

Serialization cho phép bạn lưu giữ trạng thái của một object và tái tạo nó về sau. Điều này hữu ích để:
- Lưu trạng thái object vào file
- Gửi object qua mạng
- Cache object để tăng hiệu năng

Java Object Serialization API cung cấp một cơ chế chuẩn để lập trình viên xử lý quá trình này.

Để một class có thể serialize được, nó phải implement interface `java.io.Serializable`. Đây là một marker interface (không có method nào) báo cho Java runtime biết rằng class đó serialize được:

```java
public class Employee implements Serializable {
    private String name;
    private int age;

    // Constructor, getters, and setters
}
```

Nếu bạn cố serialize một class không implement interface đó, một `java.io.NotSerializableException` (subclass của `IOException`) sẽ được ném ra lúc runtime.

`serialVersionUID` là định danh duy nhất của class được serialize. Nó được dùng trong quá trình deserialization để xác minh rằng bên gửi và bên nhận của một object đã serialize đang nạp những class tương thích với nhau về mặt serialization:

```java
public class Employee implements Serializable {
    private static final long serialVersionUID = 1L;
    // ... rest of the class
}
```

Nếu bạn không khai báo `serialVersionUID` tường minh, Java runtime sẽ sinh ra một giá trị dựa trên nhiều khía cạnh của class. Tuy nhiên, nên khai báo tường minh để giữ quyền kiểm soát việc đánh phiên bản class.

Nếu class của bạn có những field không muốn được serialize (ví dụ dữ liệu nhạy cảm hoặc dữ liệu suy ra được), bạn đánh dấu chúng bằng từ khoá `transient`:

```java
public class Employee implements Serializable {
    private static final long serialVersionUID = 1L;
    private String name;
    private transient String password; // This won't be serialized
    // ... rest of the class
}
```

Tóm lại, để đảm bảo một class serialize được:
1. Class phải được đánh dấu `Serializable`.
2. Mọi thành viên instance của class phải serialize được, được đánh dấu transient, hoặc mang giá trị `null` tại thời điểm serialization.

Sau đó, bạn dùng `ObjectOutputStream` và `ObjectInputStream` cho quá trình serialization/deserialization như đã trình bày ở phần trước. Đây là một ví dụ đầy đủ minh hoạ quá trình này:

```java
import java.io.*;

public class SerializationDemo {
    public static void main(String[] args) {
        Person person = new Person("John Doe", 30);

        // Serialization
        try (ObjectOutputStream out = 
                 new ObjectOutputStream(new FileOutputStream("person.ser"))) {
            out.writeObject(person);
            System.out.println("Person object serialized");
        } catch (IOException e) {
            e.printStackTrace();
        }

        // Deserialization
        try (ObjectInputStream in = 
                new ObjectInputStream(new FileInputStream("person.ser"))) {
            Person deserializedPerson = (Person) in.readObject();
            System.out.println("Person object deserialized");
            System.out.println("Name: " + deserializedPerson.getName());
            System.out.println("Age: " + deserializedPerson.getAge());
        } catch (IOException | ClassNotFoundException e) {
            e.printStackTrace();
        }
    }
}

class Person implements Serializable {
    private static final long serialVersionUID = 1L;
    private String name;
    private int age;

    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }

    // Getters
    public String getName() { return name; }
    public int getAge() { return age; }
                                      
    // ... rest of the class
}
```

Trong ví dụ này, ta serialize một object `Person` vào file tên `person.ser` rồi deserialize nó trở lại thành object `Person`.

Điều quan trọng cần lưu ý là khi deserialize một object, constructor và mọi khối khởi tạo đều không được thực thi. Tuy nhiên, việc khởi tạo mặc định cho các biến instance vẫn diễn ra.

Ngoài ra, khác với class, record tự động serialize được. Chúng ngầm implement interface `Serializable` nên bạn không cần khai báo tường minh:

```java
public record PersonRecord(String name, int age) /** implements Serializable */ {
    // No need to declare serialVersionUID, as it's automatically generated
}
```

Hãy nhớ, record cung cấp cách khai báo gọn gàng cho những class chủ yếu dùng để chứa dữ liệu, và khả năng serialize sẵn có khiến chúng tiện lợi trong các tình huống cần serialization.


## Bảng tra cứu
Đây là một số bảng giúp bạn ôn lại và hiểu các class I/O stream cùng những khái niệm liên quan:

**Tóm tắt các class I/O stream**

| Loại stream | Byte stream                                                                 | Character stream                          |
|-------------|------------------------------------------------------------------------------|--------------------------------------------|
| **Input**   | **Abstract class**: `InputStream`<br>**Class cụ thể**: `FileInputStream`, `BufferedInputStream`, `ObjectInputStream` | **Abstract class**: `Reader`<br>**Class cụ thể**: `FileReader`, `BufferedReader` |
| **Output**  | **Abstract class**: `OutputStream`<br>**Class cụ thể**: `FileOutputStream`, `BufferedOutputStream`, `ObjectOutputStream`, `PrintStream` | **Abstract class**: `Writer`<br>**Class cụ thể**: `FileWriter`, `BufferedWriter`, `PrintWriter` |


**So sánh thao tác File và Path**

| Thao tác | Class File | NIO.2 (Path và Files) |
|-----------|------------|------------------------|
| Tạo file | `file.createNewFile()` | `Files.createFile(path)` |
| Xoá file | `file.delete()` | `Files.delete(path)` |
| Kiểm tra tồn tại | `file.exists()` | `Files.exists(path)` |
| Lấy đường dẫn tuyệt đối | `file.getAbsolutePath()` | `path.toAbsolutePath()` |
| Kiểm tra có phải thư mục | `file.isDirectory()` | `Files.isDirectory(path)` |
| Kiểm tra có phải file | `file.isFile()` | `Files.isRegularFile(path)` |
| Liệt kê nội dung thư mục | `file.list()`, `file.listFiles()` | `Files.list(path)` |
| Tạo thư mục | `file.mkdir()` | `Files.createDirectory(path)` |
| Tạo nhiều thư mục | `file.mkdirs()` | `Files.createDirectories(path)` |
| Đổi tên file | `file.renameTo(dest)` | `Files.move(source, target)` |


**Tóm tắt các method của class Files**

| Method | Mô tả |
|--------|-------------|
| `copy()` | Sao chép một file sang file đích |
| `createDirectories()` | Tạo một thư mục cùng mọi thư mục cha cần thiết |
| `delete()` | Xoá một file hoặc thư mục rỗng |
| `exists()` | Kiểm tra file có tồn tại không |
| `isDirectory()` | Kiểm tra path có phải thư mục không |
| `isRegularFile()` | Kiểm tra path có phải file thường không |
| `move()` | Di chuyển hoặc đổi tên một file |
| `size()` | Trả về kích thước của file |
| `readAllBytes()` | Đọc toàn bộ byte từ một file |
| `readAllLines()` | Đọc toàn bộ các dòng từ một file |
| `walk()` | Trả về một `Stream` biểu diễn cấu trúc cây file |
| `write()` | Ghi byte hoặc các dòng vào file |


**Những thuộc tính file thường gặp**

| Thuộc tính | `BasicFileAttributes` | `DosFileAttributes` | `PosixFileAttributes` |
|-----------|---------------------|-------------------|---------------------|
| Thời điểm tạo | ✓ | ✓ | ✓ |
| Thời điểm sửa gần nhất | ✓ | ✓ | ✓ |
| Thời điểm truy cập gần nhất | ✓ | ✓ | ✓ |
| Kích thước | ✓ | ✓ | ✓ |
| Là thư mục | ✓ | ✓ | ✓ |
| Là file thường | ✓ | ✓ | ✓ |
| Là symbolic link | ✓ | ✓ | ✓ |
| Bị ẩn | | ✓ | |
| Chỉ đọc | | ✓ | |
| Chủ sở hữu | | | ✓ |
| Nhóm | | | ✓ |
| Quyền truy cập | | | ✓ |

**Các giá trị StandardOpenOption**

| Tuỳ chọn | Mô tả |
|--------|-------------|
| `APPEND` | Ghi nối vào cuối file nếu file tồn tại |
| `CREATE` | Tạo file mới nếu chưa tồn tại |
| `CREATE_NEW` | Tạo file mới, thất bại nếu file đã tồn tại |
| `DELETE_ON_CLOSE` | Xoá file khi stream được đóng |
| `DSYNC` | Chỉ đồng bộ nội dung file với thiết bị lưu trữ bên dưới |
| `READ` | Mở với quyền đọc |
| `SPARSE` | Gợi ý rằng file mới tạo sẽ là file thưa (sparse) |
| `SYNC` | Đồng bộ mọi cập nhật về nội dung và siêu dữ liệu của file với thiết bị lưu trữ bên dưới |
| `TRUNCATE_EXISTING` | Cắt file về 0 byte nếu file đã tồn tại |
| `WRITE` | Mở với quyền ghi |


**Các giá trị StandardCopyOption**

| Tuỳ chọn | Mô tả |
|--------|-------------|
| `REPLACE_EXISTING` | Thay thế file đích nếu nó đã tồn tại |
| `COPY_ATTRIBUTES` | Sao chép thuộc tính file sang file đích |
| `ATOMIC_MOVE` | Di chuyển file như một thao tác nguyên tử của hệ thống file |


## Các điểm chính
- Trong NIO.2 API, những class quan trọng cho thao tác file là:
  - `java.nio.file.Path`: Biểu diễn đường dẫn file và thư mục một cách linh hoạt hơn (so với class `java.io.File`).
  - `java.nio.file.Files`: Utility class cho các thao tác file.

- Có hai loại I/O stream chính:
  - Byte stream: Làm việc với dữ liệu nhị phân thô (8 bit). Những abstract class chính là `InputStream` và `OutputStream`.
  - Character stream: Làm việc với dữ liệu văn bản (Unicode 16 bit). Những abstract class chính là `Reader` và `Writer`.

- Tuy nhiên, stream cũng được phân loại thành:
  - Input stream: Dùng để đọc dữ liệu từ một nguồn.
  - Output stream: Dùng để ghi dữ liệu tới một đích.
  - Low-level stream: Kết nối trực tiếp với nguồn hoặc đích dữ liệu.
  - High-level stream: Xây trên nền các stream khác, cung cấp thêm chức năng.

- Đây là những class stream quan trọng nhất:
  - `FileInputStream` và `FileOutputStream`: Đọc và ghi byte từ/tới file.
  - `FileReader` và `FileWriter`: Đọc và ghi ký tự từ/tới file.
  - `BufferedReader` và `BufferedWriter`: Bổ sung khả năng buffering cho character stream.
  - `ObjectInputStream` và `ObjectOutputStream`: Đọc và ghi object đã serialize.
  - `PrintStream` và `PrintWriter`: Ghi dữ liệu đã định dạng lần lượt tới byte stream và character stream.

- Nên dùng câu lệnh `try-with-resources` với các class I/O để đảm bảo quản lý tài nguyên đúng cách.

- Hầu hết thao tác I/O đều có thể ném `IOException` hoặc subclass của nó, và chúng cần được xử lý.

- Stream chuẩn:
  - `System.in`: Stream đầu vào chuẩn (thường là dữ liệu nhập từ bàn phím).
  - `System.out`: Stream đầu ra chuẩn (thường là màn hình console).
  - `System.err`: Stream lỗi chuẩn (thường là console lỗi).

- Khi làm việc với character stream, hãy lưu ý bảng mã ký tự. Mặc định thường là bảng mã mặc định của hệ thống.

- Buffered stream (`BufferedReader`, `BufferedWriter`…) cải thiện hiệu năng bằng cách giảm số thao tác I/O.

- Class `Files` cung cấp method cho nhiều thao tác file như sao chép, di chuyển, xoá và so sánh.

- Sao chép file:
  - Dùng `Files.copy(source, target, CopyOption...)` để sao chép file.
  - `StandardCopyOption.REPLACE_EXISTING` dùng để ghi đè file đã tồn tại.
  - Với file lớn, cân nhắc dùng I/O stream cùng buffer để kiểm soát quá trình sao chép nhiều hơn.

- Di chuyển file:
  - Dùng `Files.move(source, target, CopyOption...)` để di chuyển hoặc đổi tên file.
  - `StandardCopyOption.ATOMIC_MOVE` đảm bảo thao tác di chuyển được thực hiện như một thao tác không thể chia nhỏ.

- Xoá file:
  - `Files.delete(path)` xoá một file hoặc thư mục rỗng.
  - `Files.deleteIfExists(path)` xoá file nếu nó tồn tại và trả về `boolean` cho biết thành công hay không.

- So sánh file:
  - `Files.isSameFile(path1, path2)` kiểm tra hai path có trỏ tới cùng một file không.
  - `Files.mismatch(file1, file2)` so sánh nội dung hai file và trả về vị trí byte đầu tiên khác nhau.

- Đọc file:
  - `Files.readAllLines(path)` đọc toàn bộ các dòng của file vào một `List<String>`.
  - `Files.lines(path)` trả về một `Stream<String>` để xử lý các dòng một cách lazy.
  - `Files.newBufferedReader(path)` tạo một `BufferedReader` để kiểm soát việc đọc nhiều hơn.

- Ghi file:
  - `Files.write(path, bytes, OpenOption...)` ghi nội dung vào file trong một thao tác duy nhất.
  - `Files.newBufferedWriter(path)` tạo một `BufferedWriter` để ghi theo từng dòng hoặc từng khối.
  - Dùng enum `StandardOpenOption` để chỉ định cách file được mở hay ghi.

- Thuộc tính file:
  - Những interface `BasicFileAttributes`, `DosFileAttributes` và `PosixFileAttributes` cho phép truy cập nhiều thuộc tính file khác nhau.
  - Dùng `Files.readAttributes(path, Class<A>, LinkOption...)` để lấy thuộc tính file.
  - `Files.setAttribute(path, attribute, value)` chỉnh sửa thuộc tính file.

- Duyệt thư mục:
  - `Files.walk(path, options)` trả về một `Stream<Path>` để duyệt cây thư mục.
  - Dùng `FileVisitOption.FOLLOW_LINKS` để đi theo symbolic link trong quá trình duyệt.
  - Cài đặt logic phát hiện chu trình để tránh vòng lặp vô hạn do symbolic link vòng gây ra.

- Serialization cho phép chuyển object thành byte stream để lưu hoặc truyền đi. Class phải implement interface `Serializable` mới serialize được.

- Class phải implement interface `Serializable` mới serialize được.

- Dùng `serialVersionUID` để kiểm soát phiên bản của những class được serialize.

- Đánh dấu field là `transient` để loại chúng khỏi quá trình serialization.

- Dùng `ObjectOutputStream` cho serialization và `ObjectInputStream` cho deserialization.

- Record tự động serialize được và không cần implement `Serializable` tường minh.
