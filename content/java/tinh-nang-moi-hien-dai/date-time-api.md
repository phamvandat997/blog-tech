---
layout: chapter

title: "Chương 11: Date/Time API"
subtitle: "The Date/Time API"
exam_objectives:
  - "Thao tác với các object date, time, duration, period, instant và time-zone, bao gồm cả giờ mùa hè (daylight saving time) bằng Date-Time API."

previous_link: "/ch10.html"
previous_title: "Concurrency and Multithreading"
next_link: "/ch12.html"
next_title: "File I/O and Serialization"
answers_link: "/ch11a.html"

description: "LocalDate, LocalTime, LocalDateTime, Instant, Period, Duration, múi giờ với ZoneId/ZoneOffset/ZonedDateTime, giờ mùa hè (DST) và parsing/formatting bằng DateTimeFormatter trong Java 21."
order: 1
phase: "Chương 11"
tags: [Java, OCP, Date/Time API, LocalDate, Instant, Duration, ZonedDateTime, DateTimeFormatter]
---

## Các class Date/Time cốt lõi

Java 8 giới thiệu một Date/Time API mới trong package `java.time`. Những class thuộc API này đều bất biến và an toàn luồng.

Ở phần này, ta sẽ xem qua các class sau:

- **LocalDate:** Biểu diễn một ngày với thông tin năm, tháng và ngày trong tháng. Ví dụ `2025-08-25`.

- **LocalTime:** Biểu diễn một thời điểm trong ngày với thông tin giờ, phút, giây và nano-giây. Ví dụ `13:21:05.123456789`.

- **LocalDateTime:** Kết hợp hai class trên. Ví dụ `2025-08-25T13:21:05.123456789`.

- **Instant:** Biểu diễn một điểm duy nhất trên trục thời gian với giây và nano-giây. Ví dụ `1970-01-01T00:00:00Z (seconds since epoch: 923456789, nanoseconds: 186,054,812)`.

- **Period:** Biểu diễn một lượng thời gian theo năm, tháng và ngày. Ví dụ `5 năm, 2 tháng và 9 ngày`.

- **Duration:** Biểu diễn một lượng thời gian theo giây và nano-giây. Ví dụ `12.87656 giây`.

Ngoại trừ `Instant`, những class này không lưu hay biểu diễn múi giờ.

Ngoài ra, `LocalDate`, `LocalTime`, `LocalDateTime` và `Instant` đều implement interface `java.time.temporal.Temporal`, nên chúng có những method tương tự nhau. `Period` và `Duration` implement interface `java.time.temporal.TemporalAmount`, khiến chúng cũng rất giống nhau.

Đây là sơ đồ giúp bạn hình dung các class của Date/Time API:
```
┌─────────────────────────────────────────────────────────┐
│                  Java Date/Time API                     │
│                                                         │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │  LocalDate  │    │  LocalTime  │    │LocalDateTime│  │
│  │ (Date only) │    │ (Time only) │    │(Date + Time)│  │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘  │
│         │                  │                  │         │
│         └──────────────────┼──────────────────┘         │
│                            │                            │
│                     ┌──────┴──────┐                     │
│                     │   Instant   │                     │
│                     │ (Time-stamp)│                     │
│                     └──────┬──────┘                     │
│                            │                            │
│              ┌─────────────┴─────────────┐              │
│              │                           │              │
│        ┌─────┴─────┐               ┌─────┴─────┐        │
│        │  Period   │               │ Duration  │        │
│        │(Date-based│               │(Time-based│        │
│        │  amount)  │               │  amount)  │        │
│        └───────────┘               └───────────┘        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Class `LocalDate`

Chìa khoá để học cách dùng class này là hiểu rằng nó giữ năm, tháng, ngày và những thông tin suy ra từ một ngày. Mọi method của nó đều dùng những thông tin đó hoặc có phiên bản làm việc với từng thành phần.

Sau đây là những method quan trọng nhất của class này.

Để tạo instance, ta dùng static method `of`:

```java
// With year (-999999999 to 999999999), month (1 to 12), day of the month (1 - 31)
LocalDate newYear2001 = LocalDate.of(2001, 1, 1);
// This version uses the enum java.time.Month
LocalDate newYear2002 = LocalDate.of(2002, Month.JANUARY, 1);
```

Lưu ý rằng khác `java.util.Date`, tháng ở đây bắt đầu từ một. Nếu bạn cố tạo một ngày với giá trị không hợp lệ (như 29 tháng 2 vào năm không nhuận), một exception sẽ được ném ra. Với ngày hôm nay, dùng `now()`:

```java
LocalDate today = LocalDate.now();
```

Khi đã có instance `LocalDate`, ta lấy được năm, tháng và ngày bằng những method như sau:

```java
int year = today.getYear();
int month = today.getMonthValue();
Month monthAsEnum = today.getMonth(); // As an enum: JANUARY, FEBRUARY, etc.
int dayYear = today.getDayOfYear();
int dayMonth = today.getDayOfMonth();
DayOfWeek dayWeekEnum = today.getDayOfWeek(); // As an enum: MONDAY, TUESDAY, etc.
```

Ta cũng dùng được method `get`:

```java
int get(java.time.temporal.TemporalField field); // value as int
long getLong(java.time.temporal.TemporalField field); // value as long
```

Method này nhận một cài đặt của interface `java.time.temporal.TemporalField` để truy cập một trường cụ thể của ngày. `java.time.temporal.ChronoField` là một enum implement interface đó, nên ta viết được, chẳng hạn:

```java
int year2 = today.get(ChronoField.YEAR);
int month2 = today.get(ChronoField.MONTH_OF_YEAR);
int dayYear2 = today.get(ChronoField.DAY_OF_YEAR);
int dayMonth2 = today.get(ChronoField.DAY_OF_MONTH);
int dayWeek = today.get(ChronoField.DAY_OF_WEEK);
long dayEpoch = today.getLong(ChronoField.EPOCH_DAY);
```

Những giá trị `ChronoField` được hỗ trợ gồm:

- `DAY_OF_WEEK`
- `ALIGNED_DAY_OF_WEEK_IN_MONTH`
- `ALIGNED_DAY_OF_WEEK_IN_YEAR`
- `DAY_OF_MONTH`
- `DAY_OF_YEAR`
- `EPOCH_DAY`
- `ALIGNED_WEEK_OF_MONTH`
- `ALIGNED_WEEK_OF_YEAR`
- `MONTH_OF_YEAR`
- `PROLEPTIC_MONTH`
- `YEAR_OF_ERA`
- `YEAR`
- `ERA`

Dùng giá trị không được hỗ trợ sẽ ném exception. Điều tương tự xảy ra khi lấy một giá trị không vừa với `int` bằng `get(TemporalField)`.

Để so sánh một `LocalDate` với instance khác, ta có ba method, cùng một method nữa cho năm nhuận:

```java
boolean after = newYear2001.isAfter(newYear2002); // false
boolean before = newYear2001.isBefore(newYear2002); // true
boolean equal = newYear2001.equals(newYear2002); // false
boolean leapYear = newYear2001.isLeapYear(); // false
```

Khi một instance của class này đã được tạo, nó không sửa được, nhưng ta tạo được instance khác từ instance có sẵn.

Một cách là dùng method `with()` cùng các biến thể của nó:

```java
LocalDate newYear2003 = newYear2001.with(ChronoField.YEAR, 2003);
LocalDate newYear2004 = newYear2001.withYear(2004);
LocalDate december2001 = newYear2001.withMonth(12);
LocalDate february2001 = newYear2001.withDayOfYear(32);
// Since these methods return a new instance, we can chain them!
LocalDate xmas2001 = newYear2001.withMonth(12).withDayOfMonth(25);
```

Cách khác là cộng hoặc trừ năm, tháng, ngày, hay thậm chí tuần:

```java
// Adding
LocalDate newYear2005 = newYear2001.plusYears(4);
LocalDate march2001 = newYear2001.plusMonths(2);
LocalDate january15_2001 = newYear2001.plusDays(14);
LocalDate lastWeekJanuary2001 = newYear2001.plusWeeks(3);
LocalDate newYear2006 = newYear2001.plus(5, ChronoUnit.YEARS);

// Subtracting
LocalDate newYear2000 = newYear2001.minusYears(1);
LocalDate nov2000 = newYear2001.minusMonths(2);
LocalDate dec30_2000 = newYear2001.minusDays(2);
LocalDate lastWeekDec2000 = newYear2001.minusWeeks(1);
LocalDate newYear1999 = newYear2001.minus(2, ChronoUnit.YEARS);
```

Lưu ý rằng method `plus` và `minus` nhận enum `java.time.temporal.ChronoUnit` — khác với `java.time.temporal.ChronoField`. Những giá trị được hỗ trợ gồm:

- `DAYS`
- `WEEKS`
- `MONTHS`
- `YEARS`
- `DECADES`
- `CENTURIES`
- `MILLENNIA`
- `ERAS`

Cuối cùng, method `toString()` trả về ngày theo định dạng `uuuu-MM-dd`:

```java
System.out.println(newYear2001.toString()); // Prints 2001-01-01
```

### Class `LocalTime`

Chìa khoá để học cách dùng class này là ghi nhớ rằng nó giữ giờ, phút, giây và nano-giây. Mọi method của nó đều dùng những thông tin đó hoặc có phiên bản làm việc với từng thành phần.

Sau đây là những method quan trọng nhất của class này. Như bạn thấy, chúng giống (hoặc rất giống) các method của `LocalDate`, chỉ được điều chỉnh để làm việc với thời gian trong ngày (giờ, phút, giây) thay vì ngày tháng (ngày, tháng, năm).

Để tạo instance, ta dùng static method `of`:

```java
// With hour (0-23) and minutes (0-59)
LocalTime fiveThirty = LocalTime.of(5, 30);
// With hour, minutes, and seconds (0-59)
LocalTime noon = LocalTime.of(12, 0, 0);
// With hour, minutes, seconds, and nanoseconds (0-999_999_999)
LocalTime almostMidnight = LocalTime.of(23, 59, 59, 999_999_999);
```

Nếu bạn cố tạo một thời điểm với giá trị không hợp lệ (như `LocalTime.of(24, 0)`), một exception sẽ được ném ra. Để lấy thời gian hiện tại, dùng `now()`:

```java
LocalTime now = LocalTime.now();
```

Khi đã có instance `LocalTime`, ta lấy được giờ, phút và những thông tin khác bằng những method như sau:

```java
int hour = now.getHour();
int minute = now.getMinute();
int second = now.getSecond();
int nanosecond = now.getNano();
```

Ta cũng dùng được method `get()`:

```java
int value = now.get(java.time.temporal.TemporalField field); // value as int
long valueLong = now.getLong(java.time.temporal.TemporalField field); // value as long
```

Giống trường hợp `LocalDate`, ta viết được, chẳng hạn:

```java
int hourAMPM = now.get(ChronoField.HOUR_OF_AMPM); // 0 - 11
int hourDay = now.get(ChronoField.HOUR_OF_DAY); // 0 - 23
int minuteDay = now.get(ChronoField.MINUTE_OF_DAY); // 0 - 1,439
int minuteHour = now.get(ChronoField.MINUTE_OF_HOUR); // 0 - 59
int secondDay = now.get(ChronoField.SECOND_OF_DAY); // 0 - 86,399
int secondMinute = now.get(ChronoField.SECOND_OF_MINUTE); // 0 - 59
long nanoDay = now.getLong(ChronoField.NANO_OF_DAY); // 0-86_399_999_999
int nanoSecond = now.get(ChronoField.NANO_OF_SECOND); // 0-999_999_999
```

Những giá trị `ChronoField` được hỗ trợ gồm:

- `NANO_OF_SECOND`
- `NANO_OF_DAY`
- `MICRO_OF_SECOND`
- `MICRO_OF_DAY`
- `MILLI_OF_SECOND`
- `MILLI_OF_DAY`
- `SECOND_OF_MINUTE`
- `SECOND_OF_DAY`
- `MINUTE_OF_HOUR`
- `MINUTE_OF_DAY`
- `HOUR_OF_AMPM`
- `CLOCK_HOUR_OF_AMPM`
- `HOUR_OF_DAY`
- `CLOCK_HOUR_OF_DAY`
- `AMPM_OF_DAY`

Dùng giá trị khác sẽ ném exception. Điều tương tự xảy ra khi lấy một giá trị không vừa với `int` bằng `get(TemporalField)`.

Để so sánh một object thời gian với object khác, ta có ba method:

```java
boolean after = fiveThirty.isAfter(noon); // false
boolean before = fiveThirty.isBefore(noon); // true
boolean equal = noon.equals(almostMidnight); // false
```

Giống `LocalDate`, khi một instance `LocalTime` đã được tạo ta không sửa được nó, nhưng tạo được instance khác từ instance có sẵn.

Một cách là qua method `with` cùng các phiên bản của nó:

```java
LocalTime ten = noon.with(ChronoField.HOUR_OF_DAY, 10);
LocalTime eight = noon.withHour(8);
LocalTime twelveThirty = noon.withMinute(30);
LocalTime thirtyTwoSeconds = noon.withSecond(32);
// Since these methods return a new instance, we can chain them!
LocalTime secondsNano = noon.withSecond(20).withNano(999_999);
```

Dĩ nhiên, cách khác là cộng hoặc trừ giờ, phút, giây hay nano-giây:

```java
// Adding
LocalTime sixThirty = fiveThirty.plusHours(1);
LocalTime fiveForty = fiveThirty.plusMinutes(10);
LocalTime plusSeconds = fiveThirty.plusSeconds(14);
LocalTime plusNanos = fiveThirty.plusNanos(99_999_999);
LocalTime sevenThirty = fiveThirty.plus(2, ChronoUnit.HOURS);

// Subtracting
LocalTime fourThirty = fiveThirty.minusHours(1);
LocalTime fiveTen = fiveThirty.minusMinutes(20);
LocalTime minusSeconds = fiveThirty.minusSeconds(2);
LocalTime minusNanos = fiveThirty.minusNanos(1);
LocalTime fiveTwenty = fiveThirty.minus(10, ChronoUnit.MINUTES);
```

Lưu ý rằng các phiên bản `plus` và `minus` nhận enum `java.time.temporal.ChronoUnit` — khác với `java.time.temporal.ChronoField`. Những giá trị được hỗ trợ gồm:

- `NANOS`
- `MICROS`
- `MILLIS`
- `SECONDS`
- `MINUTES`
- `HOURS`
- `HALF_DAYS`

Cuối cùng, method `toString()` trả về thời gian theo định dạng `HH:mm:ss.SSSSSSSSS`, bỏ qua những phần có giá trị không (ví dụ chỉ trả về `HH:mm` nếu giây/nano-giây bằng không):

```java
System.out.println(fiveThirty.toString()); // Prints 05:30
```

### Class `LocalDateTime`

Chìa khoá để học cách dùng class này là nhớ rằng nó kết hợp class `LocalDate` và `LocalTime`.

Nó biểu diễn cả ngày lẫn thời gian, với thông tin như năm, tháng, ngày, giờ, phút, giây và nano-giây. Những trường khác như ngày trong năm, thứ trong tuần và tuần trong năm cũng truy cập được.

Để tạo instance, ta dùng static method `of()` hoặc tạo từ một instance `LocalDate` hay `LocalTime`:

```java
// Setting seconds and nanoseconds to zero
LocalDateTime dt1 = LocalDateTime.of(2024, 9, 19, 14, 5);
// Setting nanoseconds to zero
LocalDateTime dt2 = LocalDateTime.of(2024, 9, 19, 14, 5, 20);
// Setting all fields
LocalDateTime dt3 = LocalDateTime.of(2024, 9, 19, 14, 5, 20, 9);
// Assuming this date
LocalDate date = LocalDate.now();
// And this time
LocalTime time = LocalTime.now();
// Combine the above date with the given time like this
LocalDateTime dt4 = date.atTime(14, 30, 59, 999999);
// Or this
LocalDateTime dt5 = date.atTime(time);
// Combine this time with the given date. Notice that LocalTime
// only has this method to be combined with a LocalDate
LocalDateTime dt6 = time.atDate(date);
```

Nếu bạn cố tạo một instance với giá trị hay ngày không hợp lệ, một exception sẽ được ném ra. Để lấy ngày/giờ hiện tại, dùng `now()`:

```java
LocalDateTime now = LocalDateTime.now();
```

Khi đã có instance `LocalDateTime`, ta lấy được thông tin bằng những method quen thuộc từ `LocalDate` và `LocalTime`, chẳng hạn:

```java
int year = now.getYear();
int dayYear = now.getDayOfYear();
int hour = now.getHour();
int minute = now.getMinute();
```

Ta cũng dùng được method `get()`:

```java
int get(java.time.temporal.TemporalField field)
long getLong(java.time.temporal.TemporalField field)
```

Ví dụ:

```java
int month = now.get(ChronoField.MONTH_OF_YEAR);
int minuteHour = now.get(ChronoField.MINUTE_OF_HOUR);
```

Những giá trị `ChronoField` được hỗ trợ gồm:

- `NANO_OF_SECOND`
- `NANO_OF_DAY`
- `MICRO_OF_SECOND`
- `MICRO_OF_DAY`
- `MILLI_OF_SECOND`
- `MILLI_OF_DAY`
- `SECOND_OF_MINUTE`
- `SECOND_OF_DAY`
- `MINUTE_OF_HOUR`
- `MINUTE_OF_DAY`
- `HOUR_OF_AMPM`
- `CLOCK_HOUR_OF_AMPM`
- `HOUR_OF_DAY`
- `CLOCK_HOUR_OF_DAY`
- `AMPM_OF_DAY`
- `DAY_OF_WEEK`
- `ALIGNED_DAY_OF_WEEK_IN_MONTH`
- `ALIGNED_DAY_OF_WEEK_IN_YEAR`
- `DAY_OF_MONTH`
- `DAY_OF_YEAR`
- `EPOCH_DAY`
- `ALIGNED_WEEK_OF_MONTH`
- `ALIGNED_WEEK_OF_YEAR`
- `MONTH_OF_YEAR`
- `PROLEPTIC_MONTH`
- `YEAR_OF_ERA`
- `YEAR`
- `ERA`

Dùng giá trị khác sẽ ném exception. Điều tương tự xảy ra khi lấy một giá trị không vừa với `int` bằng `get(TemporalField)`.

Để so sánh một object `LocalDateTime` với object khác, ta có ba method:

```java
boolean after = now.isAfter(dt1); // true
boolean before = now.isBefore(dt1); // false
boolean equal = now.equals(dt1); // false
```

Khi một instance đã được tạo, ta không sửa được nó, nhưng tạo được instance khác từ instance có sẵn.

Một cách là qua method `with` cùng các phiên bản của nó:

```java
LocalDateTime dt7 = now.with(ChronoField.HOUR_OF_DAY, 10);
LocalDateTime dt8 = now.withMonth(8);
// Since these methods return a new instance, we can chain them!
LocalDateTime dt9 = now.withYear(2013).withMinute(0);
```

Cách khác là cộng hoặc trừ năm, tháng, ngày, tuần, giờ, phút, giây hay nano-giây:

```java
// Adding
LocalDateTime dt10 = now.plusYears(4);
LocalDateTime dt11 = now.plusWeeks(3);
LocalDateTime dt12 = now.plus(2, ChronoUnit.HOURS);

// Subtracting
LocalDateTime dt13 = now.minusMonths(2);
LocalDateTime dt14 = now.minusNanos(1);
LocalDateTime dt15 = now.minus(10, ChronoUnit.SECONDS);
```

Trong trường hợp này, những giá trị `ChronoUnit` được hỗ trợ gồm:

- `NANOS`
- `MICROS`
- `MILLIS`
- `SECONDS`
- `MINUTES`
- `HOURS`
- `HALF_DAYS`
- `DAYS`
- `WEEKS`
- `MONTHS`
- `YEARS`
- `DECADES`
- `CENTURIES`
- `MILLENNIA`
- `ERAS`

Cuối cùng, method `toString()` trả về ngày-giờ theo định dạng `uuuu-MM-dd'T'HH:mm:ss.SSSSSSSSS`, bỏ qua những phần có giá trị không, ví dụ:

```java
System.out.println(dt1.toString()); // Prints 2024-09-19T14:05
```

### Class `Instant`

Dù xét về mặt thực dụng, một instance `LocalDateTime` cũng biểu diễn một thời điểm trên trục thời gian, vẫn có một class khác phù hợp hơn.

Class `java.time.Instant` biểu diễn một thời điểm bằng số giây đã trôi qua kể từ **epoch** — quy ước được dùng trong hệ thống UNIX/POSIX, đặt tại nửa đêm ngày 1 tháng 1 năm 1970 theo giờ UTC.

Kể từ mốc đó, thời gian được đo theo 86.400 giây mỗi ngày. Thông tin này được lưu dưới dạng `long`. Class này cũng hỗ trợ độ chính xác nano-giây, lưu dưới dạng `int`.

Bạn tạo được instance của class này bằng những method sau:

```java
// Setting seconds
Instant fiveSecondsAfterEpoch = Instant.ofEpochSecond(5);
// Setting seconds and nanoseconds (can be negative)
Instant sixSecTwoNanBeforeEpoch = Instant.ofEpochSecond(-6, -2);
// Setting milliseconds after (can be before also) epoch
Instant fiftyMilliSecondsAfterEpoch = Instant.ofEpochMilli(50);
```

Để lấy thời điểm hiện tại theo đồng hồ hệ thống, dùng:

```java
Instant now = Instant.now();
```

Khi đã có instance `Instant`, ta lấy được thông tin bằng những method sau:

```java
long seconds = now.getEpochSecond(); // Gets the seconds
int nanos1 = now.getNano(); // Gets the nanoseconds
// Gets the value as an int
int millis = now.get(ChronoField.MILLI_OF_SECOND);
// Gets the value as a long
long nanos2 = now.getLong(ChronoField.NANO_OF_SECOND);
```

Những giá trị `ChronoField` được hỗ trợ gồm:

- `NANO_OF_SECOND`
- `MICRO_OF_SECOND`
- `MILLI_OF_SECOND`
- `INSTANT_SECONDS`

Dùng bất kỳ giá trị nào khác sẽ ném exception. Điều tương tự xảy ra khi lấy một giá trị không vừa với `int` bằng `get(TemporalField)`.

Để so sánh một object `Instant` với object khác, ta có ba method:

```java
boolean after = now.isAfter(fiveSecondsAfterEpoch); // true
boolean before = now.isBefore(fiveSecondsAfterEpoch); // false
boolean equal = now.equals(fiveSecondsAfterEpoch); // false
```

Khi một instance của object này đã được tạo, ta không sửa được nó, nhưng tạo được instance khác từ instance có sẵn.

Một cách là dùng method `with`:

```java
Instant i1 = now.with(ChronoField.NANO_OF_SECOND, 10);
```

Cách khác là cộng hoặc trừ giây, mili-giây hay nano-giây:

```java
// Adding
Instant i10 = now.plusSeconds(400);
Instant i11 = now.plusMillis(98622200);
Instant i12 = now.plusNanos(300013890);
Instant i13 = now.plus(2, ChronoUnit.MINUTES);

// Subtracting
Instant i14 = now.minusSeconds(2);
Instant i15 = now.minusMillis(1);
Instant i16 = now.minusNanos(1);
Instant i17 = now.minus(10, ChronoUnit.SECONDS);
```

Những giá trị `ChronoUnit` được hỗ trợ gồm:

- `NANOS`
- `MICROS`
- `MILLIS`
- `SECONDS`
- `MINUTES`
- `HOURS`
- `HALF_DAYS`
- `DAYS`

Cuối cùng, method `toString()` trả về biểu diễn của `Instant` theo định dạng `uuuu-MM-dd'T'HH:mm:ss.SSSSSSSSS`, ví dụ:

```java
// Prints 1970-01-01T00:00:00.050Z
System.out.println(fiftyMilliSecondsAfterEpoch.toString());
```

Lưu ý rằng nó chứa thông tin múi giờ (`Z`). Lý do là `Instant` biểu diễn một thời điểm tính từ epoch `1970-01-01Z` theo múi giờ UTC.

### Class `Period`

Class `java.time.Period` biểu diễn một lượng thời gian theo năm, tháng và ngày.

Bạn tạo được instance của class này bằng những method sau:

```java
// Setting years, months, days (can be negative)
Period period5y4m3d = Period.of(5, 4, 3);
// Setting days (can be negative), years and months will be zero
Period period2d = Period.ofDays(2);
// Setting months (can be negative), years and days will be zero
Period period2m = Period.ofMonths(2);
// Setting weeks (can be negative). The resulting period will
// be in days (1 week = 7 days). Years and months will be zero
Period period14d = Period.ofWeeks(2);
// Setting years (can be negative), days and months will be zero
Period period2y = Period.ofYears(2);
```

`Period` cũng có thể được hiểu là hiệu số giữa hai `LocalDate`. May mắn là có sẵn một method hỗ trợ khái niệm này:

```java
LocalDate march2003 = LocalDate.of(2003, 3, 1);
LocalDate may2003 = LocalDate.of(2003, 5, 1);
Period dif = Period.between(march2003, may2003); // 2 months
```

Ngày bắt đầu được tính vào, còn ngày kết thúc thì không.

Hãy cẩn thận với cách tính ngày.

Trước tiên, số tháng trọn vẹn được đếm, rồi mới tính số ngày còn lại. Số tháng sau đó được tách thành năm (1 năm bằng 12 tháng). Một tháng được tính khi ngày kết thúc trong tháng lớn hơn hoặc bằng ngày bắt đầu trong tháng.

Kết quả của method này có thể là một period âm nếu điểm kết thúc nằm trước điểm bắt đầu (năm, tháng và ngày đều mang dấu âm).

Vài ví dụ:

```java
// dif1 will be 1 year 2 months 2 days
Period dif1 = Period.between(LocalDate.of(2000, 2, 10), LocalDate.of(2001, 4, 12));
// dif2 will be 25 days
Period dif2 = Period.between(LocalDate.of(2013, 5, 9), LocalDate.of(2013, 6, 3));
// dif3 will be -2 years -3 days
Period dif3 = Period.between(LocalDate.of(2014, 11, 3), LocalDate.of(2012, 10, 31));
```

Khi đã có instance `Period`, ta lấy được thông tin bằng những method sau:

```java
int days = period5y4m3d.getDays();
int months = period5y4m3d.getMonths();
int year = period5y4m3d.getYears();
long days2 = period5y4m3d.get(ChronoUnit.DAYS);
```

Chú ý rằng method `get` trả về kiểu `long`.

Ngoài ra, những giá trị `ChronoUnit` được hỗ trợ gồm:

- `DAYS`
- `MONTHS`
- `YEARS`

Dùng bất kỳ giá trị nào khác sẽ ném exception.

Khi một instance `Period` đã được tạo, ta không sửa được nó, nhưng tạo được instance khác dựa trên instance có sẵn.

Một cách là dùng method `with` cùng các phiên bản của nó:

```java
Period period8d = period2d.withDays(8);
// Since these methods return a new instance, we can chain them!
Period period2y1m2d = period2d.withYears(2).withMonths(1);
```

Cách khác là cộng hoặc trừ năm, tháng hay ngày:

```java
// Adding
Period period9y4m3d = period5y4m3d.plusYears(4);
Period period5y7m3d = period5y4m3d.plusMonths(3);
Period period5y4m6d = period5y4m3d.plusDays(3);
Period period7y4m3d = period5y4m3d.plus(period2y);

// Subtracting
Period period5y4m1d = period5y4m3d.minusYears(2);
Period period5y3m3d = period5y4m3d.minusMonths(1);
Period period5y4m2d = period5y4m3d.minusDays(1);
Period period3y4m3d = period5y4m3d.minus(period2y);
```

Method `plus` và `minus` nhận một implementation của interface `java.time.temporal.TemporalAmount` (một instance `Period` khác hoặc một instance `Duration`).

Cuối cùng, method `toString()` trả về period theo định dạng `P<years>Y<months>M<days>D`, ví dụ:

```java
System.out.println(period5y4m3d.toString()); // Prints P5Y4M3D
```

Một period bằng không sẽ được biểu diễn là không ngày, `P0D`.


### Class `Duration`

Class `java.time.Duration` tương tự class `Period`, chỉ khác ở chỗ nó biểu diễn một lượng thời gian theo giây và nano-giây.

Bạn tạo được instance của class này bằng những method sau:

```java
Duration oneDay = Duration.ofDays(1); // 1 day = 86400 seconds
Duration oneHour = Duration.ofHours(1); // 1 hour = 3600 seconds
Duration oneMin = Duration.ofMinutes(1); // 1 minute = 60 seconds
Duration tenSeconds = Duration.ofSeconds(10);
// Set seconds and nanoseconds (if they are outside the range
// 0 to 999,999,999, the seconds will be altered, like below)
Duration twoSeconds = Duration.ofSeconds(1, 1000000000);
// Seconds and nanoseconds are extracted from the passed millisecs
Duration oneSecondFromMillis = Duration.ofMillis(2);
// Seconds and nanoseconds are extracted from the passed nanos
Duration oneSecondFromNanos = Duration.ofNanos(1000000000);
Duration oneSecond = Duration.of(1, ChronoUnit.SECONDS);
```

Những giá trị `ChronoUnit` hợp lệ cho method `Duration.of(long amount, TemporalUnit unit)` gồm:

- `NANOS`
- `MICROS`
- `MILLIS`
- `SECONDS`
- `MINUTES`
- `HOURS`
- `HALF_DAYS`
- `DAYS`

`Duration` cũng có thể được tạo dưới dạng hiệu số giữa hai implementation của interface `java.time.temporal.Temporal`, miễn là chúng hỗ trợ giây (và để chính xác hơn là nano-giây), như `LocalTime`, `LocalDateTime` và `Instant`. Vậy nên ta viết được:

```java
Duration diff = Duration.between(Instant.ofEpochSecond(123456789), Instant.ofEpochSecond(99999));
```

Kết quả có thể âm nếu điểm kết thúc nằm trước điểm bắt đầu. Một duration âm được biểu thị bằng dấu âm ở phần giây. Ví dụ, duration -100 nano-giây được lưu thành -1 giây cộng 999.999.900 nano-giây.

Nếu các object thuộc kiểu khác nhau thì duration được tính dựa trên kiểu của object đầu tiên. Điều này chỉ hoạt động khi tham số đầu là `LocalTime` và tham số thứ hai là `LocalDateTime` (vì nó chuyển được sang `LocalTime`). Ngược lại, một exception sẽ được ném ra.

Khi đã có instance `Duration`, ta lấy được thông tin bằng những method sau:

```java
// The nanoseconds part the duration, from 0 to 999,999,999
int nanos = oneSecond.getNano();
// The seconds part of the duration, positive or negative
long seconds = oneSecond.getSeconds();
// It supports SECONDS and NANOS. Other units throw an exception
long oneSec = oneSecond.get(ChronoUnit.SECONDS);
```

Lưu ý rằng method `getSeconds()` và `get(TemporalUnit)` trả về kiểu `long`. Ngoài ra, method sau chỉ hỗ trợ `SECONDS` và `NANOS` làm tham số.

Khi một instance `Duration` đã được tạo, ta không sửa được nó, nhưng tạo được instance khác từ instance có sẵn. Một cách là dùng method `withNanos` và `withSeconds`:

```java
Duration duration1sec8nan = oneSecond.withNanos(8);
Duration duration2sec1nan = oneSecond.withSeconds(2).withNanos(1);
```

Cách khác là cộng hoặc trừ ngày, giờ, phút, giây, mili-giây hay nano-giây:

```java
// Adding
Duration plus4Days = oneSecond.plusDays(4);
Duration plus3Hours = oneSecond.plusHours(3);
Duration plus3Minutes = oneSecond.plusMinutes(3);
Duration plus3Seconds = oneSecond.plusSeconds(3);
Duration plus3Millis = oneSecond.plusMillis(3);
Duration plus3Nanos = oneSecond.plusNanos(3);
Duration plusAnotherDuration = oneSecond.plus(twoSeconds);
Duration plusChronoUnits = oneSecond.plus(1, ChronoUnit.DAYS);

// Subtracting
Duration minus4Days = oneSecond.minusDays(4);
Duration minus3Hours = oneSecond.minusHours(3);
Duration minus3Minutes = oneSecond.minusMinutes(3);
Duration minus3Seconds = oneSecond.minusSeconds(3);
Duration minus3Millis = oneSecond.minusMillis(3);
Duration minus3Nanos = oneSecond.minusNanos(3);
Duration minusAnotherDuration = oneSecond.minus(twoSeconds);
Duration minusChronoUnits = oneSecond.minus(1, ChronoUnit.DAYS);
```

Method `plus` và `minus` nhận hoặc một `Duration` khác, hoặc một giá trị `ChronoUnit` hợp lệ (chính những giá trị dùng để tạo instance).

Cuối cùng, method `toString()` trả về duration theo định dạng `PTnHnMnS`. Phần giây lẻ được đặt sau dấu thập phân trong phần giây. Nếu một phần có giá trị bằng không, nó sẽ bị bỏ qua. Ví dụ:

```java
2 days 4 minutes PT48H4M
45 seconds 99 milliseconds PT45.099S
```


## Múi giờ và giờ mùa hè (Daylight Savings)
Nếu bạn muốn làm việc với thông tin múi giờ, Date/Time API có những class sau:

- **ZoneId:** Biểu diễn ID của một múi giờ. Ví dụ, `Asia/Tokyo`.

- **ZoneOffset:** Biểu diễn độ lệch (offset) của một múi giờ. Đây là subclass của `ZoneId`. Ví dụ, `-06:00`.

- **ZonedDateTime:** Biểu diễn một ngày/giờ kèm thông tin múi giờ. Ví dụ, `2025-08-30T20:05:12.463-05:00[America/Mexico_City]`.

- **OffsetDateTime:** Biểu diễn một ngày/giờ kèm độ lệch so với UTC/Greenwich. Ví dụ, `2025-08-30T20:05:12.463-05:00`.

- **OffsetTime:** Biểu diễn một giờ kèm độ lệch so với UTC/Greenwich. Ví dụ, `20:05:12.463-05:00`.

Giống các class ở phần trước, những class này nằm trong package `java.time` và đều immutable.

Đây là sơ đồ minh họa các class có nhận biết múi giờ:
```
┌────────────────────────────────────────────────────────┐
│             Java Time Zone-Aware Classes               │
│                                                        │
│  ┌─────────────┐    ┌─────────────┐                    │
│  │  ZoneId     │    │ ZoneOffset  │                    │
│  │ (Time zone) │    │(UTC offset) │                    │
│  └──────┬──────┘    └──────┬──────┘                    │
│         │                  │                           │
│         └──────────────────┼────────────────┐          │
│                            │                │          │
│                     ┌──────┴──────┐  ┌──────┴───────┐  │
│                     │ZonedDateTime│  │OffsetDateTime│  │
│                     │(Date + Time │  │ (Date + Time │  │
│                     │ + Time Zone)│  │ + UTC offset)│  │
│                     └─────────────┘  └──────┬───────┘  │
│                                             │          │
│                                       ┌─────┴─────┐    │
│                                       │OffsetTime │    │
│                                       │ (Time +   │    │
│                                       │UTC offset)│    │
│                                       └───────────┘    │
│                                                        │
└────────────────────────────────────────────────────────┘

Điểm chính:
- ZoneId biểu diễn một múi giờ (như "America/New_York")
- ZoneOffset biểu diễn độ lệch cố định so với UTC (như "+05:00")
- ZonedDateTime kết hợp LocalDateTime với một ZoneId
- OffsetDateTime kết hợp LocalDateTime với một ZoneOffset
- OffsetTime kết hợp LocalTime với một ZoneOffset
```

### Class `ZoneId` và `ZoneOffset`

Thế giới được chia thành các múi giờ, trong đó cùng một giờ chuẩn được duy trì. Theo quy ước, một múi giờ được biểu thị bằng số giờ chênh lệch so với Giờ Phối hợp Quốc tế (*UTC*). Vì Giờ Trung bình Greenwich (*GMT*) và giờ Zulu (*Z*) dùng trong quân đội không lệch so với *UTC*, chúng thường được coi là đồng nghĩa.

Java dùng cơ sở dữ liệu múi giờ của Internet Assigned Numbers Authority (IANA), nơi lưu trữ mọi múi giờ đã biết trên thế giới và được cập nhật nhiều lần mỗi năm.

Mỗi múi giờ có một ID, được biểu diễn bởi class `java.time.ZoneId`. Có ba loại ID:

Loại thứ nhất chỉ nêu độ lệch so với giờ UTC/GMT. Chúng được biểu diễn bởi class `ZoneOffset` và gồm các chữ số bắt đầu bằng `+` hoặc `-`, ví dụ `+02:00`.

Loại thứ hai cũng nêu độ lệch so với giờ UTC/GMT, nhưng kèm một trong các tiền tố sau: *UTC*, *GMT* và *UT*, ví dụ `UTC+11:00`. Chúng cũng được biểu diễn bởi class `ZoneOffset`.

Loại thứ ba dựa trên khu vực. Các ID này có định dạng *area/city*, ví dụ `Europe/London`.

Bạn lấy được toàn bộ zone ID khả dụng bằng static method:

```java
Set<String> getAvailableZoneIds()
```

Ví dụ, để in chúng ra console:

```java
ZoneId.getAvailableZoneIds().stream().forEach(System.out::println);
```

Để lấy zone ID của hệ thống, dùng static method:

```java
ZoneId.systemDefault()
```

Bên dưới, nó dùng `java.util.TimeZone.getDefault()` để tìm múi giờ mặc định rồi chuyển thành `ZoneId`.

Nếu bạn muốn tạo một object `ZoneId` cụ thể, dùng method `of()`:

```java
ZoneId singaporeZoneId = ZoneId.of("Asia/Singapore");
```

Method này parse ID và tạo ra một `ZoneId` hoặc một `ZoneOffset` (kế thừa từ `ZoneId`). Một `ZoneOffset` được trả về nếu, chẳng hạn, ID là `Z`, hoặc bắt đầu bằng `+` hay `-`. Ví dụ:

```java
ZoneId zoneId = ZoneId.of("Z"); // Z represents the zone ID for UTC
ZoneId zoneId2 = ZoneId.of("-2"); // -02:00
```

Quy tắc của method này là:

- Nếu zone ID bằng `Z`, kết quả là `ZoneOffset.UTC`. Bất kỳ chữ cái nào khác sẽ ném exception.
- Nếu zone ID bắt đầu bằng `+` hoặc `-`, ID được parse thành `ZoneOffset` bằng `ZoneOffset.of(String)`.
- Nếu zone ID bằng `GMT`, `UTC` hoặc `UT` thì kết quả là một `ZoneId` với cùng ID và quy tắc tương đương `ZoneOffset.UTC`.
- Nếu zone ID bắt đầu bằng `UTC+`, `UTC-`, `GMT+`, `GMT-`, `UT+` hay `UT-` thì ID được tách làm hai, gồm tiền tố hai hoặc ba chữ cái và hậu tố bắt đầu bằng dấu. Hậu tố được parse thành `ZoneOffset`. Kết quả sẽ là một `ZoneId` với tiền tố đã cho và offset ID đã chuẩn hóa.
- Mọi ID khác được parse thành zone ID dựa trên khu vực. Nếu định dạng không hợp lệ (nó phải khớp biểu thức `[A-Za-z][A-Za-z0-9~/._+-]+)`) hoặc không tìm thấy, một exception sẽ được ném ra.

Hãy nhớ rằng `ZoneOffset` biểu diễn một độ lệch, thường là so với UTC. Class này có nhiều constructor hơn hẳn `ZoneId`:

```java
// The offset must be in the range of -18 to +18
ZoneOffset offsetHours = ZoneOffset.ofHours(1);
// The range is -18 to +18 for hours and 0 to ± 59 for minutes
// If the hours are negative, the minutes must be negative or zero
ZoneOffset offsetHrMin = ZoneOffset.ofHoursMinutes(1, 30);
// The range is -18 to +18 for hours and 0 to ± 59 for mins and secs
// If the hours are negative, mins and secs must be negative or zero
ZoneOffset offsetHrMinSe = ZoneOffset.ofHoursMinutesSeconds(1, 30, 0);
// The offset must be in the range -18:00 to +18:00
// Which corresponds to -64800 to +64800
ZoneOffset offsetTotalSeconds = ZoneOffset.ofTotalSeconds(3600);
// The range must be from +18:00 to -18:00
ZoneOffset offset = ZoneOffset.of("+01:30:00");
```

Những định dạng được method `of()` chấp nhận là:

- *Z (cho UTC)*
- *+h*
- *+hh*
- *+hh:mm*
- *-hh:mm*
- *+hhmm*
- *-hhmm*
- *+hh:mm:ss*
- *-hh:mm:ss*
- *+hhmmss*
- *-hhmmss*

Nếu bạn truyền một định dạng không hợp lệ hoặc một giá trị ngoài phạm vi cho bất kỳ method nào trong số này, một exception sẽ được ném ra.

Để lấy giá trị của offset, bạn dùng:

```java
// Gets the offset as int
int offsetInt = offset.get(ChronoField.OFFSET_SECONDS);
// Gets the offset as long
long offsetLong= offset.getLong(ChronoField.OFFSET_SECONDS);
// Gets the offset in seconds
int offsetSeconds = offset.getTotalSeconds();
```

`ChronoField.OFFSET_SECONDS` là giá trị `ChronoField` duy nhất được chấp nhận, nên ba câu lệnh trên trả về cùng một kết quả. Những giá trị khác sẽ ném exception.

Dù sao, khi đã có một object `ZoneId`, bạn dùng nó để tạo một instance `ZonedDateTime`.


### Class `ZonedDateTime`

Một object `java.time.ZonedDateTime` biểu diễn một thời điểm tương đối với một múi giờ.

Object `ZonedDateTime` gồm ba phần:

- Một ngày
- Một giờ
- Một múi giờ

Nghĩa là nó lưu mọi trường ngày và giờ với độ chính xác nano-giây, cùng một múi giờ với zone offset.

Đây là một ví dụ:
```
2025-08-31 T08:45:20.000 +02:00[Africa/Cairo]
```

Trong đó các phần như sau:

| Ngày | Giờ | Offset | Múi giờ |
|------|-----|--------|---------|
| `2025-08-31` | `T08:45:20.000` | `+02:00` | `[Africa/Cairo]` |

Khi đã có một object `ZoneId`, bạn kết hợp nó với `LocalDate`, `LocalDateTime` hoặc `Instant` để chuyển thành `ZonedDateTime`:

```java
ZoneId australiaZone = ZoneId.of("Australia/Victoria");

LocalDate date = LocalDate.of(2020, 7, 3);
ZonedDateTime zonedDate = date.atStartOfDay(australiaZone);

LocalDateTime dateTime = LocalDateTime.of(2020, 7, 3, 9, 0);
ZonedDateTime zonedDateTime = dateTime.atZone(australiaZone);

Instant instant = Instant.now();
ZonedDateTime zonedInstant = instant.atZone(australiaZone);
```

Hoặc dùng method `of`:

```java
ZonedDateTime zonedDateTime2 = 
    ZonedDateTime.of(LocalDate.now(), LocalTime.now(), australiaZone);
ZonedDateTime zonedDateTime3 = 
    ZonedDateTime.of(LocalDateTime.now(), australiaZone);
ZonedDateTime zonedDateTime4 = 
    ZonedDateTime.ofInstant(Instant.now(), australiaZone);
// year, month, day, hours, minutes, seconds, nanoseconds, zoneId
ZonedDateTime zonedDateTime5 = 
    ZonedDateTime.of(2025, 1, 30, 13, 59, 59, 999, australiaZone);
```

Bạn cũng lấy được ngày/giờ hiện tại từ đồng hồ hệ thống theo múi giờ mặc định bằng:

```java
ZonedDateTime now = ZonedDateTime.now();
```

Từ một `ZonedDateTime`, bạn lấy được `LocalDate`, `LocalTime` hoặc `LocalDateTime` (không có phần múi giờ) bằng:

```java
LocalDate currentDate = now.toLocalDate();
LocalTime currentTime = now.toLocalTime();
LocalDateTime currentDateTime = now.toLocalDateTime();
```

`ZonedDateTime` cũng có hầu hết method của `LocalDateTime` mà ta đã xem ở phần trước:

```java
// To get the value of a specified field
int day = now.getDayOfMonth();
int dayYear = now.getDayOfYear();
int nanos = now.getNano();
Month monthEnum = now.getMonth();
int year = now.get(ChronoField.YEAR);
long micro = now.getLong(ChronoField.MICRO_OF_DAY);
// This is new, gets the zone offset such as "-03:00"
ZoneOffset offset = now.getOffset();
// To create another instance
ZonedDateTime zdt1 = now.with(ChronoField.HOUR_OF_DAY, 10);
ZonedDateTime zdt2 = now.withSecond(49);
// Since these methods return a new instance, we can chain them!
ZonedDateTime zdt3 = now.withYear(2023).withMonth(12);

// The following two methods are specific to ZonedDateTime
// Returns a copy of the date/time with a different zone, retaining the instant
ZonedDateTime zdt4 = now.withZoneSameInstant(australiaZone);
// Returns a copy of this date/time with a different time zone,
// retaining the local date/time if it's valid for the new time zone
ZonedDateTime zdt5 = now.withZoneSameLocal(australiaZone);

// Adding
ZonedDateTime zdt6 = now.plusDays(4);
ZonedDateTime zdt7 = now.plusWeeks(3);
ZonedDateTime zdt8 = now.plus(2, ChronoUnit.HOURS);

// Subtracting
ZonedDateTime zdt9 = now.minusMinutes(20);
ZonedDateTime zdt10 = now.minusNanos(99999);
ZonedDateTime zdt11 = now.minus(10, ChronoUnit.SECONDS);
```

Method `toString()` trả về ngày/giờ theo định dạng của một `LocalDateTime` kèm theo một `ZoneOffset`, và tùy trường hợp có thêm `ZoneId` nếu nó khác với offset, đồng thời bỏ qua những phần có giá trị bằng không:

```java
// Prints 2024-09-19T00:30Z
System.out.println(
    ZonedDateTime.of(2024, 9, 19, 0, 30, 0, 0, ZoneId.of("Z")));
// Prints, for example, 2024-06-17T19:48:39.113332-04:00[America/Montreal]
System.out.println(
    ZonedDateTime.now(ZoneId.of("America/Montreal")));
```


### Giờ mùa hè (Daylight Savings)

Nhiều quốc gia trên thế giới áp dụng cái gọi là Giờ Tiết kiệm Ánh sáng Ban ngày (Daylight Saving Time — DST), tức là tập quán vặn đồng hồ nhanh thêm một giờ khi bước vào giai đoạn giờ mùa hè, thường là vào mùa xuân nhưng đôi khi vào cuối đông hoặc đầu thu, tùy khu vực.

Khi giai đoạn giờ mùa hè kết thúc, đồng hồ được vặn lùi lại một giờ. Việc này nhằm tận dụng ánh sáng ban ngày tự nhiên tốt hơn.

`ZonedDateTime` nhận biết đầy đủ DST.

Ví dụ, hãy lấy một quốc gia áp dụng DST đầy đủ như Ý (UTC+1 theo giờ chuẩn, UTC+2 theo giờ mùa hè).

Năm 2023, DST ở Ý bắt đầu ngày 26 tháng 3 và kết thúc ngày 29 tháng 10. Nghĩa là:

*Ngày 26/3/2023 lúc **2:00:00** sáng, đồng hồ được vặn **tiến** 1 giờ thành*  
*ngày 26/3/2023 lúc **3:00:00** sáng theo giờ mùa hè địa phương*  
(Nên một thời điểm như 2:30:00 sáng ngày 26/3/2023 thực ra không hề tồn tại!)

*Ngày 29/10/2023 lúc **3:00:00** sáng, đồng hồ được vặn **lùi** 1 giờ thành*  
*ngày 29/10/2023 lúc **2:00:00** sáng theo giờ mùa hè địa phương*  
(Nên một thời điểm như 2:30:00 sáng ngày 29/10/2023 thực ra tồn tại hai lần!)

Nếu ta tạo một instance `LocalDateTime` với ngày/giờ này và in ra:

```java
LocalDateTime ldt = LocalDateTime.of(2023, 3, 26, 2, 30);
System.out.println(ldt);
```

Kết quả sẽ là:

```java
2023-03-26T02:30 // Wrong
```

Nhưng nếu ta tạo một instance `ZonedDateTime` cho Ý (lưu ý rằng định dạng dùng tên thành phố, không phải tên quốc gia) và in ra:

```java
ZonedDateTime zdt = ZonedDateTime.of(
   2023, 3, 26, 2, 30, 0, 0, ZoneId.of("Europe/Rome"));
System.out.println(zdt);
```

Kết quả sẽ giống hệt ngoài đời thực khi áp dụng DST:

```java
2023-03-26T03:30+02:00[Europe/Rome] // Correct
```

Nhưng hãy cẩn thận. Ta phải dùng một `ZoneId` theo khu vực; một `ZoneOffset` sẽ không làm được việc này vì class đó không có thông tin quy tắc múi giờ để tính đến DST:

```java
ZonedDateTime zdt1 = ZonedDateTime.of(
   2023, 3, 26, 2, 30, 0, 0, ZoneOffset.ofHours(2));
System.out.println(zdt1);

ZonedDateTime zdt2 = ZonedDateTime.of(
   2023, 3, 26, 2, 30, 0, 0, ZoneId.of("UTC+2"));
System.out.println(zdt2);
```

Kết quả sẽ là:

```java
2023-03-26T02:30+02:00              // Wrong
2023-03-26T02:30+02:00[UTC+02:00]   // Wrong
```

Khi tạo một instance `ZonedDateTime` cho Ý, ta phải cộng thêm một giờ mới thấy được hiệu ứng:

```java
ZonedDateTime zdt3 = ZonedDateTime.of(
   2023, 10, 29, 2, 30, 0, 0, ZoneId.of("Europe/Rome"));
System.out.println(zdt3);

ZonedDateTime zdt4 = zdt3.plusHours(1);
System.out.println(zdt4);
```

Kết quả sẽ là:

```java
2023-10-29T02:30+02:00[Europe/Rome]
2023-10-29T02:30+01:00[Europe/Rome]
```

Ngược lại, ta sẽ tạo ra `ZonedDateTime` ở mốc 3:00 của giờ mới:
```java
ZonedDateTime zdt5 = ZonedDateTime.of(
        2023, 10, 29, 3, 30, 0, 0, ZoneId.of("Europe/Rome"));
System.out.println(zdt5); // Prints 2023-10-29T03:30+01:00[Europe/Rome]
```


Ta cũng cần cẩn thận khi điều chỉnh thời gian vượt qua ranh giới DST bằng method `plus()` và `minus()` nhận một implementation của `TemporalAmount`, nói cách khác là một `Period` hoặc một `Duration`. Lý do là hai kiểu này xử lý giờ mùa hè khác nhau.

Xét thời điểm một giờ trước khi DST bắt đầu ở Ý:

```java
ZonedDateTime zdt6 = ZonedDateTime.of(
   2023, 3, 26, 1, 0, 0, 0, ZoneId.of("Europe/Rome"));
```

Khi ta cộng thêm một `Duration` một ngày:

```java
System.out.println(zdt6.plus(Duration.ofDays(1)));
```

Kết quả là:

```java
2023-03-27T02:00+02:00[Europe/Rome]
```

Khi ta cộng thêm một `Period` một ngày:

```java
System.out.println(zdt6.plus(Period.ofDays(1)));
```

Kết quả là:

```java
2023-03-27T01:00+02:00[Europe/Rome]
```

Lý do là `Period` cộng thêm một ngày về mặt *khái niệm*, còn `Duration` cộng *đúng* một ngày (24 giờ hay 86.400 giây); khi vượt qua ranh giới DST thì có thêm một giờ được cộng vào, và giờ cuối cùng là *02:00* thay vì *01:00*.


### Class `OffsetDateTime` và `OffsetTime`

`OffsetDateTime` biểu diễn một object có thông tin ngày/giờ kèm độ lệch so với UTC, ví dụ `2025-01-01T11:30-06:00`.

Bạn có thể nghĩ `Instant`, `OffsetDateTime` và `ZonedDateTime` rất giống nhau — suy cho cùng thì cả ba đều lưu ngày và giờ với độ chính xác nano-giây. Tuy nhiên, có những khác biệt tinh tế nhưng quan trọng:

- `Instant` biểu diễn một thời điểm trong múi giờ UTC.
- `OffsetDateTime` biểu diễn một thời điểm kèm một offset (bất kỳ offset nào).
- `ZonedDateTime` biểu diễn một thời điểm trong một múi giờ (bất kỳ múi giờ nào), bổ sung đầy đủ quy tắc múi giờ như điều chỉnh giờ mùa hè.

`OffsetTime` biểu diễn một giờ kèm độ lệch so với UTC, ví dụ `11:30-06:00`. Cách thông dụng để tạo instance của những class này là:

```java
OffsetDateTime odt = OffsetDateTime.of(
    LocalDateTime.now(), ZoneOffset.of("+03:00"));
OffsetTime ot = OffsetTime.of(
    LocalTime.now(), ZoneOffset.of("-08:00"));

System.out.println(odt);
System.out.println(ot);
```

Nếu bạn chạy ví dụ trên, output sẽ tương tự thế này:
```
2024-06-17T19:19:32.645941+03:00
19:19:32.648413-08:00
```

Cả hai class đều có gần như cùng bộ method với các class tương ứng `LocalDateTime`, `ZonedDateTime` và `LocalTime`. Với một offset so với UTC và không có biến động múi giờ, chúng luôn biểu diễn một thời điểm chính xác, điều có thể phù hợp hơn với một số loại ứng dụng (tài liệu Java khuyến nghị dùng `OffsetDateTime` khi giao tiếp với database hoặc trong một network protocol).


## Parsing và Formatting

`java.time.format.DateTimeFormatter` là class dùng để parse và format ngày tháng. Nó được dùng theo hai cách:

- Các class ngày/giờ (ký hiệu là `T`) gồm `LocalDate`, `LocalTime`, `LocalDateTime`, `ZonedDateTime` và `OffsetDateTime` đều có ba method sau: 

  ```java
  // Formats the date/time object using the specified formatter
  String format(DateTimeFormatter formatter)

  // Obtains an instance of a date/time object (of type T) from a string with a default format
  static T parse(CharSequence text)

  // Obtains an instance of a date/time object (of type T) from a string using a specific formatter
  static T parse(CharSequence text, DateTimeFormatter formatter)
  ```

- `DateTimeFormatter` có hai method sau: 

  ```java
  // Formats a date/time object using the formatter instance
  String format(TemporalAccessor temporal)

  // Parses the text producing a temporal object
  TemporalAccessor parse(CharSequence text)
  ```

Mọi method format đều ném runtime exception `java.time.DateTimeException`.

Mọi method parse đều ném runtime exception `java.time.format.DateTimeParseException`.

`DateTimeFormatter` cung cấp ba cách để format object ngày/giờ:

- Formatter định sẵn (predefined)
- Formatter theo locale
- Formatter với pattern tùy chỉnh

**Formatter định sẵn**

| Formatter | Mô tả | Ví dụ |
|-----------|-------------|---------|
| `BASIC_ISO_DATE` | Các trường ngày không có dấu phân cách | *20250803* |
| `ISO_LOCAL_DATE`<br>`ISO_LOCAL_TIME`<br>`ISO_LOCAL_DATE_TIME` | Các trường ngày có dấu phân cách | *2025-08-03*<br>*13:40:10*<br>*2025-08-03T13:40:10* |
| `ISO_OFFSET_DATE`<br>`ISO_OFFSET_TIME`<br>`ISO_OFFSET_DATE_TIME` | Các trường ngày có dấu phân cách và zone offset | *2025-08-03+07:00*<br>*13:40:10+07:00*<br>*2025-08-03T13:40:10+07:00* |
| `ISO_ZONED_DATE_TIME` | Ngày và giờ kèm múi giờ | *2025-08-03T13:40:10+07:00[Asia/Bangkok]* |
| `ISO_DATE`<br>`ISO_TIME`<br>`ISO_DATE_TIME` | Ngày hoặc Giờ có hoặc không có offset<br>DateTime kèm ZoneId | *2025-08-03+07:00*<br>*13:40:10*<br>*2025-08-03T13:40:10+07:00[Asia/Bangkok]* |
| `ISO_INSTANT` | Ngày và Giờ của một Instant | *2025-08-03T13:40:10Z* |
| `ISO_ORDINAL_DATE` | Năm và ngày thứ mấy trong năm | *2025-200* |
| `ISO_WEEK_DATE` | Năm, tuần và thứ trong tuần | *2025-W34-2* |
| `RFC_1123_DATE_TIME` | Định dạng ngày RFC 1123 / RFC 822 | *Sun, 3 Aug 2025 13:40:10 GMT* |

**Formatter theo locale**

| Style  | Ngày | Giờ |
|--------|------|------|
| `SHORT` | 8/3/15 | *1:40 PM* |
| `MEDIUM` | Aug 03, 2025 | *1:40:00 PM* |
| `LONG` | August 03, 2025 | *1:40:00 PM PDT* |
| `FULL` | Monday, August 03, 2025 | *1:40:00 PM PDT* |

**Pattern tùy chỉnh**

| Ký hiệu | Ý nghĩa | Ví dụ |
|--------|---------|----------|
| `G` | Kỷ nguyên (Era) | *AD; Anno Domini; A* |
| `u` | Năm | *2025; 15* |
| `y` | Năm trong kỷ nguyên | *2025; 15* |
| `D` | Ngày trong năm | *150* |
| `M / L` | Tháng trong năm | *7; 07; Jul; July; J* |
| `d` | Ngày trong tháng | *20* |
| `Q / q` | Quý trong năm | *2; 02; Q2; 2nd quarter* |
| `Y` | Năm tính theo tuần | *2025; 15* |
| `w` | Tuần trong năm tính theo tuần | *30* |
| `W` | Tuần trong tháng | *2* |
| `E` | Thứ trong tuần | *Tue; Tuesday; T* |
| `e / c` | Thứ trong tuần theo locale | *2; 02; Tue; Tuesday; T* |
| `F` | Tuần trong tháng | *2* |
| `a` | AM/PM trong ngày | *AM* |
| `h` | Giờ (1-12) | *10* |
| `K` | Giờ (0-11) | *1* |
| `k` | Giờ (1-24) | *20* |
| `H` | Giờ (0-23) | *23* |
| `m` | Phút | *10* |
| `s` | Giây | *11* |
| `S` | Phần lẻ của giây | *999* |
| `A` | Mili-giây trong ngày | *2345* |
| `n` | Nano-giây trong giây | *865437987* |
| `N` | Nano-giây trong ngày | *12986497300* |
| `V` | ID múi giờ | *Asia/Manila; Z; -06:00* |
| `z` | Tên múi giờ | *Pacific Standard Time; PST* |
| `O` | Zone Offset theo locale | *GMT+4; GMT+04:00; UTC-04:00;* |
| `X` | Zone Offset ('Z' cho giá trị không) | *Z; -08; -0830; -08:30* |
| `x` | Zone Offset | *+0000; -08; -0830; -08:30* |
| `Z` | Zone Offset | *+0000; -0800; -08:00* |
| `'` | Ký tự escape cho văn bản | |
| `''` | Dấu nháy đơn | |
| `[ ]` | Bắt đầu / Kết thúc phần tùy chọn | |
| `# { }` | Dành riêng cho tương lai | |

Giả sử:

```java
LocalDate ldt = LocalDate.of(2025, 1, 20);
```

Đây là ví dụ dùng formatter định sẵn:

```java
System.out.println(DateTimeFormatter.ISO_DATE.format(ldt));
System.out.println(ldt.format(DateTimeFormatter.ISO_DATE));
```

Output sẽ là:

```java
2025-01-20
2025-01-20
```

Đây là ví dụ dùng style theo locale:

```java
DateTimeFormatter formatter = DateTimeFormatter.ofLocalizedDate(FormatStyle.SHORT);
// With the current locale
System.out.println(formatter.format(ldt));
System.out.println(ldt.format(formatter));
// With another locale
System.out.println(formatter.withLocale(Locale.GERMAN).format(ldt));
```

Một output có thể là:

```java
1/20/25
1/20/25
20.01.25
```

Và đây là ví dụ dùng pattern tùy chỉnh:

```java
DateTimeFormatter formatter = DateTimeFormatter.ofPattern("QQQQ Y");
// With the current locale
System.out.println(formatter.format(ldt));
System.out.println(ldt.format(formatter));
// With another locale
System.out.println(formatter.withLocale(Locale.GERMAN).format(ldt));
```

Một output có thể là:

```java
1st quarter 2025
1st quarter 2025
1. Quartal 2025
```

Nếu formatter dùng thông tin không có sẵn, một `DateTimeException` sẽ được ném ra. Ví dụ, dùng `DateTimeFormatter.ISO_OFFSET_DATE` với một instance `LocalDate` (nó không có thông tin offset).

Để parse một giá trị ngày và/hoặc giờ từ một chuỗi, dùng một trong các method `parse`. Ví dụ:

```java
// Format according to ISO-8601
String dateTimeStr1 = "2025-06-29T14:45:30";
// Custom format
String dateTimeStr2 = "2025/06/29 14:45:30";
LocalDateTime ldt = LocalDateTime.parse(dateTimeStr1);
// Using DateTimeFormatter
DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy/MM/dd HH:mm:ss");
// DateTimeFormatter returns a TemporalAccessor instance
TemporalAccessor ta = formatter.parse(dateTimeStr2);
// LocalDateTime returns an instance of the same type
ldt = LocalDateTime.parse(dateTimeStr2, formatter);
```

Phiên bản `parse()` của các object ngày/giờ nhận một chuỗi theo định dạng ISO-8601, cụ thể là:

| Class | Định dạng | Ví dụ |
|-------|--------|---------|
| `LocalDate` | `uuuu-MM-dd` | *2024-12-03* |
| `LocalTime` | `HH:mm:ss` | *10:15* |
| `LocalDateTime` | `uuuu-MM-dd'T'HH:mm:ss` | *2024-12-03T10:15:30* |
| `ZonedDateTime` | `uuuu-MM-dd'T'HH:mm:ssXXXXX[VV]` | *2023-12-03T10:15:30+01:00[Europe/Paris]* |
| `OffsetDateTime` | `uuuu-MM-dd'T'HH:mm:ssXXXXX` | *2023-12-03T10:15:30+01:00* |
| `OffsetTime` | `HH:mm:ssXXXXX` | *10:15:30+01:00* |

Nếu formatter dùng thông tin không có sẵn hoặc pattern của định dạng không hợp lệ, một `DateTimeParseException` sẽ được ném ra.

Trong chương Localization, ta sẽ quay lại class `DateTimeFormatter`, tập trung vào việc áp dụng nó trong localization.


## Các điểm chính
- `LocalDate`, `LocalTime`, `LocalDateTime`, `Instant`, `Period` và `Duration` là những class cốt lõi của Date/Time API mới trong Java, nằm trong package `java.time`. Chúng immutable, thread-safe, và ngoại trừ `Instant`, chúng không lưu hay biểu diễn múi giờ.

- `LocalDate`, `LocalTime`, `LocalDateTime` và `Instant` implement interface `java.time.temporal.Temporal`, nên tất cả đều có những method tương tự nhau. Còn `Period` và `Duration` implement interface `java.time.temporal.TemporalAmount`, điều này cũng khiến chúng rất giống nhau.

- `LocalDate` biểu diễn một ngày với thông tin năm, tháng và ngày trong tháng. Bạn tạo được instance bằng:
  ```java
  LocalDate.of(2025, 8, 1);
  ```

- Những giá trị `ChronoField` hợp lệ để dùng với method `get()` là: `DAY_OF_WEEK, ALIGNED_DAY_OF_WEEK_IN_MONTH, ALIGNED_DAY_OF_WEEK_IN_YEAR, DAY_OF_MONTH, DAY_OF_YEAR, EPOCH_DAY, ALIGNED_WEEK_OF_MONTH, ALIGNED_WEEK_OF_YEAR, MONTH_OF_YEAR, PROLEPTIC_MONTH, YEAR_OF_ERA, YEAR,` và `ERA`.

- Những giá trị `ChronoUnits` hợp lệ để dùng với method `plus()` và `minus()` là: `DAYS, WEEKS, MONTHS, YEARS, DECADES, CENTURIES, MILLENNIA,` và `ERAS`.

- `LocalTime` biểu diễn một giờ với thông tin giờ, phút, giây và nano-giây. Bạn tạo được instance bằng:
  ```java
  LocalTime.of(14, 20, 50, 99999);
  ```

- Những giá trị `ChronoField` hợp lệ để dùng với method `get()` là: `NANO_OF_SECOND, NANO_OF_DAY, MICRO_OF_SECOND, MICRO_OF_DAY, MILLI_OF_SECOND, MILLI_OF_DAY, SECOND_OF_MINUTE, SECOND_OF_DAY, MINUTE_OF_HOUR, MINUTE_OF_DAY, HOUR_OF_AMPM, CLOCK_HOUR_OF_AMPM, HOUR_OF_DAY, CLOCK_HOUR_OF_DAY,` và `AMPM_OF_DAY`.

- Những giá trị `ChronoUnits` hợp lệ để dùng với method `plus()` và `minus()` là: `NANOS, MICROS, MILLIS, SECONDS, MINUTES, HOURS,` và `HALF_DAYS`.

- `LocalDateTime` là sự kết hợp của `LocalDate` và `LocalTime`. Bạn tạo được instance bằng:
  ```java
  LocalDateTime.of(2025, 8, 1, 14, 20, 50, 99999);
  ```

- Những giá trị `ChronoField` và `ChronoUnits` hợp lệ là sự kết hợp của những giá trị dùng cho `LocalDate` và `LocalTime`.

- `Instant` biểu diễn một thời điểm duy nhất tính theo giây và nano-giây. Bạn tạo được instance bằng:
  ```java
  Instant.ofEpochSecond(134556767, 999999999);
  ```

- Những giá trị `ChronoField` hợp lệ để dùng với method `get()` là: `NANO_OF_SECOND, MICRO_OF_SECOND, MILLI_OF_SECOND,` và `INSTANT_SECONDS`.

- Những giá trị `ChronoUnit` hợp lệ để dùng với method `plus()` và `minus()` là: `NANOS, MICROS, MILLIS, SECONDS, MINUTES, HOURS, HALF_DAYS,` và `DAYS`.

- `Period` biểu diễn một lượng thời gian theo năm, tháng và ngày. Bạn tạo được instance bằng:
  ```java
  Period.of(3, 12, 30);
  ```

- Những giá trị `ChronoUnits` hợp lệ để dùng với method `get()` là: `DAYS, MONTHS, YEARS`.

- `Duration` biểu diễn một lượng thời gian theo giây và nano-giây. Bạn tạo được instance bằng:
  ```java
  Duration.ofSeconds(50, 999999);
  ```

- Những giá trị `ChronoUnits` hợp lệ để dùng với method `of()` là: `NANOS, MICROS, MILLIS, SECONDS, MINUTES, HOURS, HALF_DAYS,` và `DAYS`. Với method `get()`, chỉ `NANOS` và `SECONDS` là hợp lệ.

- `ZoneId`, `ZoneOffset`, `ZonedDateTime`, `OffsetDateTime` và `OffsetTime` là những class của Java Date/Time API lưu thông tin về múi giờ và độ lệch giờ. Chúng nằm trong package `java.time` và đều immutable.

- Mỗi múi giờ có một ID, được biểu diễn bởi class `ZoneId`. Có ba loại ID.

- Loại thứ nhất chỉ nêu độ lệch so với giờ UTC/GMT. Chúng được biểu diễn bởi class `ZoneOffset` và gồm các chữ số bắt đầu bằng `+` hoặc `-`, ví dụ `+02:00`.

- Loại thứ hai cũng nêu độ lệch so với giờ UTC/GMT, nhưng kèm một trong các tiền tố sau: UTC, GMT và UT, ví dụ `UTC+11:00`. Chúng cũng được biểu diễn bởi class `ZoneOffset`.

- Loại thứ ba dựa trên khu vực. Các ID này có định dạng *area/city*, ví dụ *Europe/London*.

- Nếu bạn muốn tạo một object `ZoneId` cụ thể, dùng method `of`:
  ```java
  ZoneId.of("Asia/Singapore");
  ZoneId.of("+3");
  ZoneId.of("Z");
  ```

- Cách đầu tiên ở trên tạo ra một object kiểu `ZoneId`. Hai cách còn lại tạo ra object kiểu `ZoneOffset`.

- Một object `java.time.ZonedDateTime` biểu diễn một thời điểm tương đối với một múi giờ.

- Object `ZonedDateTime` gồm ba phần: một ngày, một giờ và một múi giờ. Nó tạo được bằng:
  ```java
  ZoneId australiaZone = ZoneId.of("Australia/Victoria");
  ZonedDateTime zonedDateTime5 =
      ZonedDateTime.of(2025, 1, 30, 13, 59, 59, 999, australiaZone);
  ```

- Hoặc bằng cách dùng `LocalDate`, `LocalTime`, `LocalDateTime` hay `Instant` cộng với `ZoneId`.

- Nếu ta tạo một instance `ZonedDateTime` cho khu vực có áp dụng Giờ mùa hè (DST), instance đó sẽ hỗ trợ DST, vặn đồng hồ tiến một giờ khi DST bắt đầu và vặn lùi lại khi DST kết thúc.

- `Period` và `Duration` xử lý DST khác nhau.

- `Period` cộng thêm một ngày về mặt khái niệm vào một ngày tháng, còn `Duration` cộng đúng một ngày, không tính đến DST.

- `OffsetDateTime` biểu diễn một object có thông tin ngày/giờ kèm độ lệch so với UTC, ví dụ `2025-01-01T11:30-06:00`.

- `OffsetTime` biểu diễn một giờ kèm độ lệch so với UTC, ví dụ `11:30-06:00`.

- `java.time.format.DateTimeFormatter` là class dùng để parse và format ngày tháng. Nó được dùng theo hai cách:
    - Các class ngày/giờ `LocalDate`, `LocalTime`, `LocalDateTime`, `ZonedDateTime`, `OffsetDateTime` đều có những method:
      ```java
      String format(DateTimeFormatter formatter)
      static T parse(CharSequence text)
      static T parse(CharSequence text, DateTimeFormatter formatter)
      ```
    - `DateTimeFormatter` có hai method sau:
      ```java
      String format(TemporalAccessor temporal)
      TemporalAccessor parse(CharSequence text)
      ```

- Mọi method `format` đều ném runtime exception `java.time.DateTimeException`, còn mọi method `parse` đều ném runtime exception `java.time.format.DateTimeParseException`.
