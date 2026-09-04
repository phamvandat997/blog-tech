---
title: Hướng Dẫn Cài Đặt Môi Trường Java (JDK 21, IDE & Build Tools)
description: Hướng dẫn toàn diện thiết lập môi trường lập trình Java hiện đại với JDK 21 LTS, cấu hình biến môi trường, làm quen với IntelliJ IDEA, VS Code và các công cụ quản lý dự án Maven, Gradle.
order: 1
featured: true
tags: [Java, Setup, JDK, Maven, Gradle, IntelliJ]
readingMinutes: 12
---

# Hướng Dẫn Cài Đặt Môi Trường Java (JDK 21, IDE & Build Tools)

Để bắt đầu hành trình chinh phục Java, việc thiết lập một môi trường lập trình chuẩn mực và hiểu rõ các khái niệm nền tảng là bước đi đầu tiên vô cùng quan trọng.

---

## 1. Phân Biệt JVM, JRE và JDK

Trước khi tải bất kỳ phần mềm nào, bạn cần nắm vững kiến trúc 3 tầng của hệ sinh thái Java:

| Thành phần | Tên viết tắt | Chức năng chính | Đối tượng sử dụng |
|---|---|---|---|
| **Java Virtual Machine** | **JVM** | Máy ảo thực thi bytecode (`.class`), quản lý bộ nhớ (Garbage Collection), độc lập nền tảng. | Trình thông dịch lõi |
| **Java Runtime Environment** | **JRE** | Bao gồm JVM + Thư viện chuẩn (`rt.jar`, module hệ thống). Đủ để chạy ứng dụng đã biên dịch. | Người dùng cuối |
| **Java Development Kit** | **JDK** | Bao gồm JRE + Trình biên dịch (`javac`) + Công cụ debug (`jdb`), phân tích (`jconsole`, `jcmd`). | Lập trình viên |

> **Nguyên tắc "Write Once, Run Anywhere" (WORA):**  
> Mã nguồn `.java` được `javac` biên dịch thành bytecode `.class`. Bytecode này có thể chạy trên bất kỳ hệ điều hành nào (Windows, macOS, Linux) miễn là ở đó có cài đặt JVM tương thích.

---

## 2. Lựa Chọn Bản Phân Phối JDK (Distributions)

Kể từ khi Java chuyển sang chu kỳ phát hành 6 tháng/lần, các bản **LTS (Long-Term Support)** là lựa chọn ưu tiên hàng đầu cho các dự án thương mại:
- **Java 17 LTS** (2021)
- **Java 21 LTS** (2023 - Khuyến nghị sử dụng với Virtual Threads, Pattern Matching)

Các bản OpenJDK phổ biến và uy tín:
1. **Eclipse Temurin (Adoptium):** Chuẩn cộng đồng, miễn phí, kiểm định TCK nghiêm ngặt.
2. **Amazon Corretto:** Tối ưu hoá cho môi trường production và đám mây AWS.
3. **Oracle JDK:** Bản chính thức từ Oracle (miễn phí theo điều khoản NFTC cho dev/prod).

---

## 3. Cài Đặt và Cấu Hình Biến Môi Trường

### Trên macOS / Linux:
Thêm vào file `~/.zshrc` hoặc `~/.bashrc`:
```bash
export JAVA_HOME=$(/usr/libexec/java_home -v 21) # macOS
# hoặc: export JAVA_HOME=/usr/lib/jvm/temurin-21-jdk # Linux
export PATH=$JAVA_HOME/bin:$PATH
```

### Trên Windows:
1. Mở **System Properties** -> **Environment Variables**.
2. Tạo biến hệ thống mới:
   - Tên biến: `JAVA_HOME`
   - Giá trị: `C:\Program Files\Eclipse Adoptium\jdk-21.0.x-hotspot`
3. Thêm `%JAVA_HOME%\bin` vào biến `Path`.

### Kiểm tra cài đặt thành công:
```bash
java -version
javac -version
```

---

## 4. Công Cụ Lập Trình (IDEs)

- **IntelliJ IDEA (JetBrains):** Chuẩn mực ngành công nghiệp cho Java. Bản *Community Edition* hoàn toàn miễn phí và đầy đủ tính năng cho hầu hết tác vụ lập trình Java Core.
- **Visual Studio Code:** Nhẹ, khởi động nhanh, chỉ cần cài extension pack **Extension Pack for Java** của Microsoft.

---

## 5. Giới Thiệu Build Tools: Maven & Gradle

Trong các dự án thực tế, chúng ta không biên dịch thủ công bằng `javac` mà sử dụng các công cụ tự động hoá quản lý thư viện (dependencies) và quy trình đóng gói:

### Apache Maven (`pom.xml`):
Sử dụng định dạng XML, tuân theo quy ước cấu trúc thư mục chuẩn (*Convention over Configuration*):
```xml
<project xmlns="http://maven.apache.org/POM/4.0.0">
  <modelVersion>4.0.0</modelVersion>
  <groupId>com.blogtech</groupId>
  <artifactId>java-quickstart</artifactId>
  <version>1.0.0</version>
  <properties>
    <maven.compiler.source>21</maven.compiler.source>
    <maven.compiler.target>21</maven.compiler.target>
  </properties>
</project>
```

### Gradle (`build.gradle` / `build.gradle.kts`):
Cú pháp DSL dựa trên Groovy hoặc Kotlin, linh hoạt và tốc độ biên dịch nhanh nhờ cache thông minh.

---

## 6. Tổng Kết

Sau khi hoàn tất cài đặt, bạn đã có một môi trường vững chắc gồm JDK 21, IDE hiện đại và kiến thức nền về chu trình biên dịch Java. Hãy thử sức với 20 câu hỏi trắc nghiệm dưới đây để củng cố toàn diện các khái niệm vừa học!