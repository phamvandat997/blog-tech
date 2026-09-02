// TỆP SINH TỰ ĐỘNG — đừng sửa tay. Chạy: node build/build.js
const SECTIONS = [
 {
  "id": "java",
  "name": "Java",
  "icon": "☕",
  "color": "#e76f00",
  "kind": "language",
  "order": 1,
  "tagline": "OCP Java SE 25 (1Z0-831) — nền tảng ngôn ngữ, Collections, Concurrency và tính năng mới.",
  "categories": [
   {
    "id": "roadmap",
    "name": "Lộ trình ôn luyện",
    "icon": "🗺️",
    "order": 1,
    "docCount": 1
   },
   {
    "id": "core",
    "name": "Java Core & OOP",
    "icon": "🧱",
    "order": 2,
    "docCount": 5
   },
   {
    "id": "collections-streams",
    "name": "Collections, Lambda & Stream",
    "icon": "📚",
    "order": 3,
    "docCount": 5
   },
   {
    "id": "concurrency",
    "name": "Concurrency, I/O & Module",
    "icon": "⚙️",
    "order": 4,
    "docCount": 3
   },
   {
    "id": "new-features",
    "name": "Tính năng mới Java 22–25",
    "icon": "🚀",
    "order": 5,
    "docCount": 2
   },
   {
    "id": "master",
    "name": "Sổ tay, Lab & Đề thi thử",
    "icon": "👑",
    "order": 6,
    "docCount": 6
   }
  ],
  "phases": [
   "Phase 1",
   "Phase 2",
   "Phase 3",
   "Phase 4",
   "Phase 5",
   "Phase 6",
   "Phase 7",
   "Master"
  ],
  "phaseDetails": [
   {
    "phaseId": "Phase 1",
    "title": "Phase 1: Java Fundamentals & Data Types",
    "subtitle": "Cú pháp, Kiểu nguyên thủy, Toán tử & Scope biến",
    "targetWeeks": "Tuần 1 - 2",
    "icon": "☕",
    "color": "#6366f1",
    "totalLines": 780,
    "totalQuestions": 15,
    "tagline": "Làm chủ cấu trúc ngôn ngữ, primitive types, wrapper classes, overflow, widening & narrowing.",
    "coreKnowledge": [
     "Khai báo Package, Import, static import và thứ tự ưu tiên",
     "8 kiểu nguyên thủy: byte, short, int, long, float, double, char, boolean",
     "Toán tử số học, logic, bitwise và thứ tự ưu tiên (precedence)",
     "Scope của biến (Local, Instance, Static) và giá trị khởi tạo mặc định"
    ],
    "commonTraps": [
     "Toán tử chia số nguyên 1 / 2 = 0 thay vì 0.5",
     "Ép kiểu ngầm định khi cộng byte (byte a = 1; byte b = 2; byte c = a + b; // LỖI biên dịch)",
     "So sánh Wrapper object bằng == thay vì .equals()",
     "Phạm vi biến trong khối lệnh if/for/switch"
    ],
    "docs": [
     {
      "id": "java/core/phase1-java-fundamentals",
      "type": "Lý thuyết & Bài tập",
      "questions": 15
     }
    ]
   },
   {
    "phaseId": "Phase 2",
    "title": "Phase 2: Object-Oriented Programming (OOP) & Design",
    "subtitle": "Kế thừa, Đa hình, Interfaces, Records & Sealed Classes",
    "targetWeeks": "Tuần 3 - 4",
    "icon": "🧱",
    "color": "#8b5cf6",
    "totalLines": 1260,
    "totalQuestions": 25,
    "tagline": "Nắm vững 4 trụ cột OOP, phương thức ảo, Interface default/static methods, Pattern Matching.",
    "coreKnowledge": [
     "Kế thừa (Inheritance), Ghi đè (Overriding) và Nạp chồng (Overloading)",
     "Quy tắc phạm vi truy cập (Access Modifiers: private, package-private, protected, public)",
     "Interfaces, Default methods, Private methods và Static interface methods",
     "Records, Sealed Classes & Interfaces, Non-sealed, Final subclasses"
    ],
    "commonTraps": [
     "Ghi đè phương thức không thể thu hẹp phạm vi truy cập (protected -> private là lỗi)",
     "Ghi đè không thể khai báo Checked Exception mới hoặc rộng hơn",
     "Khởi tạo thứ tự Constructor (Static block -> Instance block -> Constructor)",
     "Sealed hierarchy thiếu permits hoặc thiếu final/sealed/non-sealed"
    ],
    "docs": []
   },
   {
    "phaseId": "Phase 3",
    "title": "Phase 3: Core APIs, Strings & Generics",
    "subtitle": "String, StringBuilder, Text Blocks, Generics & Wildcards",
    "targetWeeks": "Tuần 5 - 6",
    "icon": "📚",
    "color": "#06b6d4",
    "totalLines": 950,
    "totalQuestions": 20,
    "tagline": "Hiểu sâu String Pool, Immutability, Type Erasure, Generic bounds <? extends T>, <? super T>.",
    "coreKnowledge": [
     "String Immutability, String Pool, .intern(), StringBuilder & StringBuffer",
     "Text Blocks (Java 15+), Escape sequences, formatted strings",
     "Generics class, method, bounded type parameters <T extends Comparable<T>>",
     "Wildcards: Upper-bounded (<? extends Number>), Lower-bounded (<? super Integer>), Unbounded (<?>)"
    ],
    "commonTraps": [
     "String.replace() không sửa chuỗi gốc (trả về chuỗi mới)",
     "PECS Rule: Producer Extends, Consumer Super - thêm phần tử vào List<? extends Object> bị cấm",
     "Type Erasure: Không thể new T() hay instanceof T",
     "StringBuilder.equals() không so sánh nội dung mà so sánh tham chiếu!"
    ],
    "docs": [
     {
      "id": "java/collections-streams/phase3-deep-theory",
      "type": "Lý thuyết Chuyên sâu",
      "questions": 10
     },
     {
      "id": "java/collections-streams/phase3-core-apis",
      "type": "Thực hành Core APIs",
      "questions": 10
     }
    ]
   },
   {
    "phaseId": "Phase 4",
    "title": "Phase 4: Collections, Lambdas & Streams",
    "subtitle": "List, Set, Map, Functional Interfaces & Stream Pipelines",
    "targetWeeks": "Tuần 7 - 9",
    "icon": "🌊",
    "color": "#10b981",
    "totalLines": 1350,
    "totalQuestions": 25,
    "tagline": "Thành thạo Functional Programming, Method References, Collectors.groupingBy, Parallel Streams.",
    "coreKnowledge": [
     "Collections Framework: ArrayList, LinkedList, HashSet, TreeSet, HashMap, TreeMap, ArrayDeque",
     "4 Functional Interface gốc: Function<T,R>, Predicate<T>, Consumer<T>, Supplier<T> và biến thể primitive",
     "Stream operations: Intermediate (map, filter, flatMap) vs Terminal (collect, reduce, findFirst)",
     "Collectors: toList, toMap, groupingBy, partitioningBy, joining, summarizing"
    ],
    "commonTraps": [
     "Stream chỉ có thể consume 1 lần duy nhất, gọi lần 2 ném IllegalStateException",
     "List.of() và Map.of() trả về Unmodifiable Collection (add/put ném UnsupportedOperationException)",
     "TreeSet/TreeMap yêu cầu Comparable hoặc Comparator, nếu thiếu sẽ ném ClassCastException khi chèn",
     "Collectors.toMap() bị Duplicate Key nếu không truyền merge function"
    ],
    "docs": [
     {
      "id": "java/collections-streams/phase4-deep-theory",
      "type": "Lý thuyết Chuyên sâu",
      "questions": 10
     }
    ]
   },
   {
    "phaseId": "Phase 5",
    "title": "Phase 5: Concurrency, Virtual Threads & IO/NIO.2",
    "subtitle": "Threads, ExecutorService, Lock, Virtual Threads & Files",
    "targetWeeks": "Tuần 10 - 11",
    "icon": "⚙️",
    "color": "#f59e0b",
    "totalLines": 1100,
    "totalQuestions": 20,
    "tagline": "Làm chủ Java Memory Model, Concurrency Utilities, Virtual Threads (Project Loom) & NIO.2 Path/Files.",
    "coreKnowledge": [
     "Thread Lifecycle, Runnable vs Callable, Future, ExecutorService, CompletableFuture",
     "Synchronized, Volatile, Atomic variables, ReentrantLock, ReadWriteLock",
     "Virtual Threads (Java 21+): Thread.ofVirtual(), Structured Concurrency, Pinning traps",
     "I/O Streams vs NIO.2: Path, Paths, Files (readAllLines, lines, walk, find, copy, move)"
    ],
    "commonTraps": [
     "Virtual Threads bị Pinning khi nằm trong synchronized block hoặc gọi Native method (JNI)",
     "Volatile chỉ đảm bảo Visibility, KHÔNG đảm bảo Atomicity (count++ vẫn bị race condition)",
     "Files.walk() cần được đóng trong try-with-resources để tránh leak file descriptor",
     "AtomicInteger vs LongAdder khi có contention cao"
    ],
    "docs": [
     {
      "id": "java/concurrency/phase5-deep-theory",
      "type": "Lý thuyết Chuyên sâu",
      "questions": 10
     },
     {
      "id": "java/concurrency/phase5-advanced-topics",
      "type": "Thực hành Concurrency",
      "questions": 10
     }
    ]
   },
   {
    "phaseId": "Phase 6",
    "title": "Phase 6: Java 22 - 25 New Features",
    "subtitle": "Flexible Constructors, Stream Gatherers, Scoped Values, Unnamed Variables",
    "targetWeeks": "Tuần 12 - 13",
    "icon": "🚀",
    "color": "#ec4899",
    "totalLines": 860,
    "totalQuestions": 25,
    "tagline": "Điểm nhấn mới nhất của kỳ thi 1Z0-831: Statements before super(), Gatherers, ScopedValue, String Templates.",
    "coreKnowledge": [
     "Flexible Constructor Bodies (JEP 482): Cho phép code validation trước super(...) / this(...)",
     "Stream Gatherers (JEP 485): windowFixed, windowSliding, fold, scan, mapConcurrent",
     "Scoped Values (JEP 487): Thay thế ThreadLocal an toàn, nhẹ hơn trong Virtual Threads",
     "Unnamed Variables and Patterns (_) trong catch block, for-each loop, switch pattern matching"
    ],
    "commonTraps": [
     "Trong statements before super(): KHÔNG được đọc instance field hoặc gọi instance method của class đó!",
     "ScopedValue.where().run() không thể thay đổi giá trị của ScopedValue khi đang chạy",
     "Unnamed variable `_` chỉ dùng một lần duy nhất tại vị trí bỏ qua",
     "Gatherer `windowSliding` sinh danh sách gối đầu, khác với `windowFixed` phân mảnh cố định"
    ],
    "docs": [
     {
      "id": "java/new-features/phase6-deep-theory",
      "type": "Lý thuyết Chuyên sâu",
      "questions": 10
     },
     {
      "id": "java/new-features/phase6-java22-25-new-features",
      "type": "Tính năng Java 22-25",
      "questions": 15
     }
    ]
   },
   {
    "phaseId": "Phase 7",
    "title": "Phase 7: Mock Exam & Certification Strategy",
    "subtitle": "Đề thi thử 50 câu chuẩn OCP 1Z0-831 & Chiến lược làm bài",
    "targetWeeks": "Tuần 14",
    "icon": "🏆",
    "color": "#e11d48",
    "totalLines": 450,
    "totalQuestions": 50,
    "tagline": "Đánh giá toàn diện, kiểm tra phản xạ bẫy biên dịch, phân bổ thời gian và đạt chứng chỉ OCP với điểm 90%+.",
    "coreKnowledge": [
     "Chiến lược phân bổ 120 phút cho 50 câu hỏi (trung bình 2.4 phút/câu)",
     "Phương pháp loại trừ đáp án lỗi biên dịch trước khi phân tích logic",
     "Các bẫy lừa phổ biến về ClassCastException, NullPointerException, ConcurrentModificationException",
     "Kiểm tra tổng hợp từ Phase 1 đến Phase 6"
    ],
    "commonTraps": [
     "Không đọc kỹ câu hỏi yêu cầu 'CHỌN HAI' hoặc 'CHỌN BA' đáp án",
     "Bỏ sót các lỗi import thiếu hoặc từ khóa sai cú pháp",
     "Bị lừa bởi đoạn code trông phức tạp nhưng thực chất compile error ngay dòng 1!"
    ],
    "docs": [
     {
      "id": "java/master/phase7-mock-exam",
      "type": "Đề Thi Thử 50 Câu",
      "questions": 50
     }
    ]
   }
  ],
  "docCount": 22
 },
 {
  "id": "dsa",
  "name": "Cấu trúc dữ liệu & Giải thuật",
  "icon": "⚡",
  "color": "#2563eb",
  "kind": "topic",
  "order": 10,
  "tagline": "Lộ trình luyện thuật toán cho phỏng vấn FAANG / Big Tech.",
  "categories": [
   {
    "id": "roadmap",
    "name": "Lộ trình",
    "icon": "🗺️",
    "order": 1,
    "docCount": 1
   },
   {
    "id": "foundations",
    "name": "Nền tảng",
    "icon": "🧱",
    "order": 2,
    "docCount": 1
   },
   {
    "id": "master",
    "name": "Bách khoa toàn thư",
    "icon": "👑",
    "order": 3,
    "docCount": 1
   }
  ],
  "phases": [],
  "phaseDetails": [],
  "docCount": 3
 }
];
const DOCUMENTS = [
 {
  "id": "java/roadmap/ocp-java25-roadmap",
  "section": "java",
  "category": "roadmap",
  "slug": "ocp-java25-roadmap",
  "contentFile": "java__roadmap__ocp-java25-roadmap",
  "title": "📜 Lộ Trình OCP Java SE 25 Developer — Exam 1Z0-831",
  "description": "Chứng chỉ: Oracle Certified Professional: Java SE 25 Developer",
  "icon": "🗺️",
  "difficulty": "Strategy",
  "phase": "Roadmap",
  "tags": [
   "Roadmap",
   "14 Weeks",
   "Domains",
   "Study Plan"
  ],
  "order": 1,
  "lines": 887,
  "size": "32.4 KB",
  "updatedDate": "2026-09-02",
  "questions": 0
 },
 {
  "id": "java/core/giai-doan-1-nen-tang-ngon-ngu",
  "section": "java",
  "category": "core",
  "slug": "giai-doan-1-nen-tang-ngon-ngu",
  "contentFile": "java__core__giai-doan-1-nen-tang-ngon-ngu",
  "title": "Giai đoạn 1 — Nền tảng ngôn ngữ Java 25 (Tuần 1–6)",
  "description": "Mọi output trong tài liệu này đã được chạy thử để xác minh, trừ các mục ghi rõ [Java 25] (môi trường kiểm thử chạy JDK 21 — bạn tự chạy lại trên JDK 25)",
  "icon": "🧱",
  "difficulty": "Fundamental",
  "phase": "Phase 1",
  "tags": [
   "Primitives",
   "String Pool",
   "var",
   "Switch",
   "Stack Memory"
  ],
  "order": 1,
  "lines": 976,
  "size": "36.1 KB",
  "updatedDate": "2026-09-02",
  "questions": 0
 },
 {
  "id": "java/core/phase1-deep-theory",
  "section": "java",
  "category": "core",
  "slug": "phase1-deep-theory",
  "contentFile": "java__core__phase1-deep-theory",
  "title": "Phase 1: Java Fundamentals - Deep Theory Supplement",
  "description": "Tài liệu này cung cấp kiến thức chuyên sâu (Deep Theory) cho Phase 1 của kỳ thi OCP Java SE 25 (1Z0-831). Chúng ta sẽ đi sâu vào cách JVM hoạt động dưới mảng (under the hood), lý d",
  "icon": "🔬",
  "difficulty": "Expert",
  "phase": "Phase 1",
  "tags": [
   "Primitives",
   "String Pool",
   "var",
   "Switch",
   "Stack Memory"
  ],
  "order": 2,
  "lines": 374,
  "size": "17.4 KB",
  "updatedDate": "2026-09-02",
  "questions": 0
 },
 {
  "id": "java/core/phase1-java-fundamentals",
  "section": "java",
  "category": "core",
  "slug": "phase1-java-fundamentals",
  "contentFile": "java__core__phase1-java-fundamentals",
  "title": "Phase 1: Nền tảng Java (Java Fundamentals) - Luyện thi OCP Java SE 25 (1Z0-831)",
  "description": "Tài liệu này bao gồm các kiến thức nền tảng của Java, được thiết kế đặc biệt để giúp bạn vượt qua kỳ thi OCP Java SE 25. Trọng tâm sẽ là các chi tiết kỹ thuật, các trường hợp ngoại",
  "icon": "🧱",
  "difficulty": "Fundamental",
  "phase": "Phase 1",
  "tags": [
   "Primitives",
   "String Pool",
   "var",
   "Switch",
   "Stack Memory"
  ],
  "order": 3,
  "lines": 410,
  "size": "14.8 KB",
  "updatedDate": "2026-09-02",
  "questions": 15
 },
 {
  "id": "java/core/phase2-deep-theory",
  "section": "java",
  "category": "core",
  "slug": "phase2-deep-theory",
  "contentFile": "java__core__phase2-deep-theory",
  "title": "Phase 2: OOP & Class Design — Deep Theory Supplement",
  "description": "Tài liệu này đi sâu vào kiến trúc bên trong (internal mechanisms) của JVM và Java Language Specification (JLS) liên quan đến OOP. Thay vì chỉ học \"cái gì\" (what), chúng ta sẽ khám",
  "icon": "🔬",
  "difficulty": "Expert",
  "phase": "Phase 2",
  "tags": [
   "Records",
   "Sealed Classes",
   "Pattern Matching",
   "Class Loading"
  ],
  "order": 4,
  "lines": 513,
  "size": "19.5 KB",
  "updatedDate": "2026-09-02",
  "questions": 0
 },
 {
  "id": "java/core/phase2-oop-class-design",
  "section": "java",
  "category": "core",
  "slug": "phase2-oop-class-design",
  "contentFile": "java__core__phase2-oop-class-design",
  "title": "Phase 2: Lập trình Hướng đối tượng (OOP) & Thiết kế Lớp",
  "description": "Tài liệu này đi sâu vào các khái niệm cốt lõi của OOP và thiết kế lớp trong Java, bao gồm các tính năng mới nhất được bổ sung trong các phiên bản Java gần đây như Flexible Construc",
  "icon": "📦",
  "difficulty": "Intermediate",
  "phase": "Phase 2",
  "tags": [
   "Records",
   "Sealed Classes",
   "Pattern Matching",
   "Class Loading"
  ],
  "order": 5,
  "lines": 483,
  "size": "20.1 KB",
  "updatedDate": "2026-09-02",
  "questions": 15
 },
 {
  "id": "java/collections-streams/giai-doan-2-collections-lambda-stream",
  "section": "java",
  "category": "collections-streams",
  "slug": "giai-doan-2-collections-lambda-stream",
  "contentFile": "java__collections-streams__giai-doan-2-collections-lambda-stream",
  "title": "Giai đoạn 2 — Collections, Lambda & Stream (Tuần 7–12)",
  "description": "Mọi output đã được chạy thử để xác minh trên JDK 21, trừ các mục ghi rõ [Java 24] (Stream Gatherers) — bạn tự chạy lại trên JDK 25",
  "icon": "📚",
  "difficulty": "Intermediate",
  "phase": "Phase 3",
  "tags": [
   "Collections",
   "Generics",
   "HashMap Treeify",
   "Date/Time"
  ],
  "order": 1,
  "lines": 906,
  "size": "38.4 KB",
  "updatedDate": "2026-09-02",
  "questions": 0
 },
 {
  "id": "java/collections-streams/phase3-core-apis",
  "section": "java",
  "category": "collections-streams",
  "slug": "phase3-core-apis",
  "contentFile": "java__collections-streams__phase3-core-apis",
  "title": "Phase 3: Core APIs - OCP Java SE 25 (1Z0-831)",
  "description": "Tài liệu hướng dẫn ôn tập giai đoạn 3 cho kỳ thi OCP Java SE 25 (1Z0-831). Phần này tập trung vào các API cốt lõi trong Java: Arrays, Collections, Generics, và Date/Time",
  "icon": "📚",
  "difficulty": "Intermediate",
  "phase": "Phase 3",
  "tags": [
   "Collections",
   "Generics",
   "HashMap Treeify",
   "Date/Time"
  ],
  "order": 2,
  "lines": 488,
  "size": "19.3 KB",
  "updatedDate": "2026-09-02",
  "questions": 15
 },
 {
  "id": "java/collections-streams/phase3-deep-theory",
  "section": "java",
  "category": "collections-streams",
  "slug": "phase3-deep-theory",
  "contentFile": "java__collections-streams__phase3-deep-theory",
  "title": "Phase 3: Core APIs - Deep Theory Supplement",
  "description": "Tài liệu bổ sung này cung cấp cái nhìn sâu sắc về internals (cơ chế nội bộ) của các Core APIs trong Java SE 25. Hiểu được \"tại sao\" và \"như thế nào\" đằng sau các API này là chìa kh",
  "icon": "🔬",
  "difficulty": "Expert",
  "phase": "Phase 3",
  "tags": [
   "Collections",
   "Generics",
   "HashMap Treeify",
   "Date/Time"
  ],
  "order": 3,
  "lines": 297,
  "size": "15.6 KB",
  "updatedDate": "2026-09-02",
  "questions": 0
 },
 {
  "id": "java/collections-streams/phase4-deep-theory",
  "section": "java",
  "category": "collections-streams",
  "slug": "phase4-deep-theory",
  "contentFile": "java__collections-streams__phase4-deep-theory",
  "title": "Phase 4: Functional Programming - Deep Theory Supplement",
  "description": "Tài liệu bổ sung này đi sâu vào cơ chế hoạt động thực sự bên dưới của Functional Programming trong Java, đặc biệt phục vụ cho kỳ thi OCP Java SE 25 (1Z0-831). Nó không chỉ trả lời",
  "icon": "🔬",
  "difficulty": "Expert",
  "phase": "Phase 4",
  "tags": [
   "Lambdas",
   "Stream API",
   "Collectors",
   "invokedynamic",
   "Spliterator"
  ],
  "order": 4,
  "lines": 415,
  "size": "22.9 KB",
  "updatedDate": "2026-09-02",
  "questions": 0
 },
 {
  "id": "java/collections-streams/phase4-functional-programming",
  "section": "java",
  "category": "collections-streams",
  "slug": "phase4-functional-programming",
  "contentFile": "java__collections-streams__phase4-functional-programming",
  "title": "Tài Liệu Ôn Thi OCP Java SE 25 (1Z0-831) - Giai Đoạn 4: Functional Programming",
  "description": "Giai đoạn này tập trung vào Lập Trình Hàm (Functional Programming) trong Java, bao gồm Functional Interfaces, Lambda Expressions, Stream API, Collectors, Optional và Parallel Strea",
  "icon": "🌊",
  "difficulty": "Intermediate",
  "phase": "Phase 4",
  "tags": [
   "Lambdas",
   "Stream API",
   "Collectors",
   "invokedynamic",
   "Spliterator"
  ],
  "order": 5,
  "lines": 442,
  "size": "20.5 KB",
  "updatedDate": "2026-09-02",
  "questions": 15
 },
 {
  "id": "java/concurrency/giai-doan-3-concurrency-io-module-l10n",
  "section": "java",
  "category": "concurrency",
  "slug": "giai-doan-3-concurrency-io-module-l10n",
  "contentFile": "java__concurrency__giai-doan-3-concurrency-io-module-l10n",
  "title": "Giai đoạn 3 — Concurrency, I/O, Module, Localization (Tuần 13–18)",
  "description": "Output đã chạy thử để xác minh trên JDK 21, trừ hai nhóm ghi rõ:",
  "icon": "⚙️",
  "difficulty": "Advanced",
  "phase": "Phase 5",
  "tags": [
   "Virtual Threads",
   "Concurrency",
   "JMM",
   "NIO.2",
   "JPMS Modules"
  ],
  "order": 1,
  "lines": 879,
  "size": "41.4 KB",
  "updatedDate": "2026-09-02",
  "questions": 0
 },
 {
  "id": "java/concurrency/phase5-advanced-topics",
  "section": "java",
  "category": "concurrency",
  "slug": "phase5-advanced-topics",
  "contentFile": "java__concurrency__phase5-advanced-topics",
  "title": "Giai đoạn 5: Các Chủ đề Nâng cao (Advanced Topics) - OCP Java SE 25 (1Z0-831)",
  "description": "Tài liệu này bao quát các chủ đề nâng cao quan trọng thường xuất hiện trong bài thi OCP Java SE 25. Bạn cần nắm vững không chỉ cú pháp mà còn cách các thư viện tiêu chuẩn hoạt động",
  "icon": "⚙️",
  "difficulty": "Advanced",
  "phase": "Phase 5",
  "tags": [
   "Virtual Threads",
   "Concurrency",
   "JMM",
   "NIO.2",
   "JPMS Modules"
  ],
  "order": 2,
  "lines": 331,
  "size": "16.4 KB",
  "updatedDate": "2026-09-02",
  "questions": 15
 },
 {
  "id": "java/concurrency/phase5-deep-theory",
  "section": "java",
  "category": "concurrency",
  "slug": "phase5-deep-theory",
  "contentFile": "java__concurrency__phase5-deep-theory",
  "title": "OCP Java SE 25 (1Z0-831) - Phase 5: Advanced Topics (Deep Theory Supplement)",
  "description": "Tài liệu này cung cấp cái nhìn chuyên sâu về các chủ đề nâng cao trong Java, tập trung vào cơ chế nội bộ (internal mechanisms), các trường hợp ngoại lệ (edge cases), và sự khác biệ",
  "icon": "🔬",
  "difficulty": "Expert",
  "phase": "Phase 5",
  "tags": [
   "Virtual Threads",
   "Concurrency",
   "JMM",
   "NIO.2",
   "JPMS Modules"
  ],
  "order": 3,
  "lines": 379,
  "size": "19.0 KB",
  "updatedDate": "2026-09-02",
  "questions": 0
 },
 {
  "id": "java/new-features/phase6-deep-theory",
  "section": "java",
  "category": "new-features",
  "slug": "phase6-deep-theory",
  "contentFile": "java__new-features__phase6-deep-theory",
  "title": "Phase 6: Java 22-25 New Features - Deep Theory Supplement",
  "description": "Tài liệu này cung cấp cái nhìn sâu sắc vào cơ chế hoạt động, lý thuyết nền tảng và các edge cases của các tính năng mới trong Java 22 đến 25, phục vụ cho kỳ thi OCP Java SE 25 (1Z0",
  "icon": "🔬",
  "difficulty": "Expert",
  "phase": "Phase 6",
  "tags": [
   "Flexible Constructors",
   "Gatherers",
   "Scoped Values",
   "Unnamed vars"
  ],
  "order": 1,
  "lines": 412,
  "size": "18.1 KB",
  "updatedDate": "2026-09-02",
  "questions": 0
 },
 {
  "id": "java/new-features/phase6-java22-25-new-features",
  "section": "java",
  "category": "new-features",
  "slug": "phase6-java22-25-new-features",
  "contentFile": "java__new-features__phase6-java22-25-new-features",
  "title": "Giai đoạn 6: Các tính năng mới của Java 22 - 25 (OCP Java SE 25 - 1Z0-831)",
  "description": "Tài liệu này bao gồm tất cả các tính năng mới từ Java 22 đến Java 25 có thể xuất hiện trong bài thi chứng chỉ OCP Java SE 25 Developer (1Z0-831)",
  "icon": "🚀",
  "difficulty": "Advanced",
  "phase": "Phase 6",
  "tags": [
   "Flexible Constructors",
   "Gatherers",
   "Scoped Values",
   "Unnamed vars"
  ],
  "order": 2,
  "lines": 450,
  "size": "21.5 KB",
  "updatedDate": "2026-09-02",
  "questions": 15
 },
 {
  "id": "java/master/java25-complete-code-workbook",
  "section": "java",
  "category": "master",
  "slug": "java25-complete-code-workbook",
  "contentFile": "java__master__java25-complete-code-workbook",
  "title": "SỔ TAY THỰC HÀNH MÃ NGUỒN & PHÒNG THÍ NGHIỆM THỰC THI OCP JAVA SE 25 (1Z0-831)",
  "description": "Tài liệu này cung cấp các ví dụ mã nguồn thực tế, tự chứa và có thể thực thi hoàn toàn trong Java 25. Mỗi Lab tập trung vào một nhóm tính năng cốt lõi của Java 25, với phân tích ch",
  "icon": "💻",
  "difficulty": "Mastery",
  "phase": "Master",
  "tags": [
   "Mock Exam",
   "Handbook",
   "Labs",
   "Traps",
   "Master Question Bank"
  ],
  "order": 1,
  "lines": 293,
  "size": "10.7 KB",
  "updatedDate": "2026-09-02",
  "questions": 0
 },
 {
  "id": "java/master/giai-doan-4-mock-chien-thuat",
  "section": "java",
  "category": "master",
  "slug": "giai-doan-4-mock-chien-thuat",
  "contentFile": "java__master__giai-doan-4-mock-chien-thuat",
  "title": "Giai đoạn 4 — Ôn tập & Mock (Tuần 19–24)",
  "description": "Mọi output đã chạy thử để xác minh trên JDK 21. Các mục [Java 25] chưa chạy được trên môi trường kiểm thử",
  "icon": "🏆",
  "difficulty": "Exam Simulation",
  "phase": "Phase 7",
  "tags": [
   "Mock Exam",
   "Handbook",
   "Labs",
   "Traps",
   "Master Question Bank"
  ],
  "order": 2,
  "lines": 692,
  "size": "35.3 KB",
  "updatedDate": "2026-09-02",
  "questions": 0
 },
 {
  "id": "java/master/ocp-java25-master-question-bank",
  "section": "java",
  "category": "master",
  "slug": "ocp-java25-master-question-bank",
  "contentFile": "java__master__ocp-java25-master-question-bank",
  "title": "MASTER QUESTION BANK: OCP Java SE 25 (1Z0-831)",
  "description": "Tài liệu chuyên khảo MASTER QUESTION BANK: OCP Java SE 25 (1Z0-831) gồm 239 dòng lý thuyết, mã nguồn và câu hỏi trắc nghiệm",
  "icon": "🔥",
  "difficulty": "Mastery",
  "phase": "Master",
  "tags": [
   "Mock Exam",
   "Handbook",
   "Labs",
   "Traps",
   "Master Question Bank"
  ],
  "order": 3,
  "lines": 240,
  "size": "8.8 KB",
  "updatedDate": "2026-09-02",
  "questions": 10
 },
 {
  "id": "java/master/ocp-java25-ultimate-handbook",
  "section": "java",
  "category": "master",
  "slug": "ocp-java25-ultimate-handbook",
  "contentFile": "java__master__ocp-java25-ultimate-handbook",
  "title": "OCP Java SE 25 (1Z0-831): THE ULTIMATE MASTER HANDBOOK",
  "description": "Tài liệu chuyên khảo OCP Java SE 25 (1Z0-831): THE ULTIMATE MASTER HANDBOOK gồm 239 dòng lý thuyết, mã nguồn và câu hỏi trắc nghiệm",
  "icon": "📖",
  "difficulty": "Mastery",
  "phase": "Master",
  "tags": [
   "Mock Exam",
   "Handbook",
   "Labs",
   "Traps",
   "Master Question Bank"
  ],
  "order": 4,
  "lines": 240,
  "size": "11.4 KB",
  "updatedDate": "2026-09-02",
  "questions": 0
 },
 {
  "id": "java/master/phase7-mock-exam",
  "section": "java",
  "category": "master",
  "slug": "phase7-mock-exam",
  "contentFile": "java__master__phase7-mock-exam",
  "title": "Phase 7: Chiến lược thi & Đề thi thử (Mock Exam) - OCP Java SE 25 (1Z0-831)",
  "description": "Tài liệu này cung cấp chiến lược làm bài thi thực tế và một đề thi thử toàn diện mô phỏng kỳ thi OCP Java SE 25 (1Z0-831)",
  "icon": "🏆",
  "difficulty": "Exam Simulation",
  "phase": "Phase 7",
  "tags": [
   "Mock Exam",
   "Handbook",
   "Labs",
   "Traps",
   "Master Question Bank"
  ],
  "order": 5,
  "lines": 288,
  "size": "12.6 KB",
  "updatedDate": "2026-09-02",
  "questions": 12
 },
 {
  "id": "java/master/tong-quan-bach-khoa",
  "section": "java",
  "category": "master",
  "slug": "tong-quan-bach-khoa",
  "contentFile": "java__master__tong-quan-bach-khoa",
  "title": "🏛️ BÁCH KHOA TOÀN THƯ OCP JAVA SE 25 (1Z0-831) & DSA ROADMAP",
  "description": "Tổng quy mô: 18 tài liệu chuyên khảo | ~7,336 dòng nội dung | 210+ câu hỏi trắc nghiệm & tình huống",
  "icon": "🏛️",
  "difficulty": "All-in-One",
  "phase": "Master",
  "tags": [
   "Master Bible",
   "All-in-One",
   "Summary",
   "Architecture"
  ],
  "order": 6,
  "lines": 86,
  "size": "8.0 KB",
  "updatedDate": "2026-09-02",
  "questions": 0
 },
 {
  "id": "dsa/roadmap/dsa-roadmap",
  "section": "dsa",
  "category": "roadmap",
  "slug": "dsa-roadmap",
  "contentFile": "dsa__roadmap__dsa-roadmap",
  "title": "🗺️ Lộ Trình Nghiên Cứu DSA — Phỏng Vấn FAANG/Big Tech",
  "description": "Ngôn ngữ: Java",
  "icon": "⚡",
  "difficulty": "Advanced",
  "phase": "DSA",
  "tags": [
   "DSA",
   "Algorithms",
   "LeetCode",
   "FAANG"
  ],
  "order": 1,
  "lines": 318,
  "size": "13.5 KB",
  "updatedDate": "2026-09-02",
  "questions": 0
 },
 {
  "id": "dsa/foundations/giai-doan-1-mang-chuoi-stack-linkedlist",
  "section": "dsa",
  "category": "foundations",
  "slug": "giai-doan-1-mang-chuoi-stack-linkedlist",
  "contentFile": "dsa__foundations__giai-doan-1-mang-chuoi-stack-linkedlist",
  "title": "DSA Giai đoạn 1 — Mảng, Chuỗi, Con trỏ, Stack & Linked List (Tuần 1–6)",
  "description": "Toàn bộ code trong tài liệu này đã được chạy thử và xác minh output trên JDK 21",
  "icon": "⚡",
  "difficulty": "Advanced",
  "phase": "DSA",
  "tags": [
   "DSA",
   "Algorithms",
   "LeetCode",
   "FAANG"
  ],
  "order": 1,
  "lines": 1211,
  "size": "47.9 KB",
  "updatedDate": "2026-09-02",
  "questions": 0
 },
 {
  "id": "dsa/master/master-bible-ocp-va-dsa",
  "section": "dsa",
  "category": "master",
  "slug": "master-bible-ocp-va-dsa",
  "contentFile": "dsa__master__master-bible-ocp-va-dsa",
  "title": "🏛️ BÁCH KHOA TOÀN THƯ HỢP NHẤT: OCP JAVA SE 25 (1Z0-831) & DSA FAANG MASTER BIBLE",
  "description": "Quy mô Tổng thể: 19 Chuyên đề Hợp nhất | ~7,500+ Dòng Kiến Thức Toàn Diện | 215+ Câu hỏi Trắc Nghiệm & Tình Huống",
  "icon": "⚡",
  "difficulty": "Advanced",
  "phase": "DSA",
  "tags": [
   "DSA",
   "Algorithms",
   "LeetCode",
   "FAANG"
  ],
  "order": 1,
  "lines": 7343,
  "size": "309.6 KB",
  "updatedDate": "2026-09-02",
  "questions": 0
 }
];
