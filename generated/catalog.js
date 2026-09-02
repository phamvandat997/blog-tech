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
  "phases": [],
  "phaseDetails": [],
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
  "description": "Lộ trình ôn thi Oracle Certified Professional: Java SE 25 Developer (mã đề 1Z0-831) — 50 câu, 120 phút — chia theo tuần và theo domain.",
  "icon": "🗺️",
  "phase": "Roadmap",
  "tags": [
   "Roadmap",
   "14 Weeks",
   "Domains",
   "Study Plan"
  ],
  "order": 1,
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
  "description": "Cách dùng: đọc lý thuyết ở Phần A → gõ lại code bằng tay → làm bài tập Phần B mà không xem đáp án → đối chiếu Phần C → ghi mọi câu sai vào gotchas.md.",
  "icon": "🧱",
  "phase": "Phase 1",
  "tags": [
   "Primitives",
   "String Pool",
   "var",
   "Switch",
   "Stack Memory"
  ],
  "order": 1,
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
  "description": "Tài liệu này cung cấp kiến thức chuyên sâu (Deep Theory) cho Phase 1 của kỳ thi OCP Java SE 25 (1Z0-831). Chúng ta sẽ đi sâu vào cách JVM hoạt động dưới mảng (under the…",
  "icon": "🔬",
  "phase": "Phase 1",
  "tags": [
   "Primitives",
   "String Pool",
   "var",
   "Switch",
   "Stack Memory"
  ],
  "order": 2,
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
  "description": "Tài liệu này bao gồm các kiến thức nền tảng của Java, được thiết kế đặc biệt để giúp bạn vượt qua kỳ thi OCP Java SE 25. Trọng tâm sẽ là các chi tiết kỹ thuật, các…",
  "icon": "🧱",
  "phase": "Phase 1",
  "tags": [
   "Primitives",
   "String Pool",
   "var",
   "Switch",
   "Stack Memory"
  ],
  "order": 3,
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
  "description": "Tài liệu này đi sâu vào kiến trúc bên trong (internal mechanisms) của JVM và Java Language Specification (JLS) liên quan đến OOP. Thay vì chỉ học \"cái gì\" (what), chúng…",
  "icon": "🔬",
  "phase": "Phase 2",
  "tags": [
   "Records",
   "Sealed Classes",
   "Pattern Matching",
   "Class Loading"
  ],
  "order": 4,
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
  "description": "Tài liệu này đi sâu vào các khái niệm cốt lõi của OOP và thiết kế lớp trong Java, bao gồm các tính năng mới nhất được bổ sung trong các phiên bản Java gần đây như…",
  "icon": "📦",
  "phase": "Phase 2",
  "tags": [
   "Records",
   "Sealed Classes",
   "Pattern Matching",
   "Class Loading"
  ],
  "order": 5,
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
  "description": "Đây là phần chiếm tỷ trọng lớn nhất trong đề 1Z0-831 và cũng là phần bạn dùng hằng ngày khi làm DSA. Học kỹ ở đây sẽ tiết kiệm thời gian cho cả hai track.",
  "icon": "📚",
  "phase": "Phase 3",
  "tags": [
   "Collections",
   "Generics",
   "HashMap Treeify",
   "Date/Time"
  ],
  "order": 1,
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
  "description": "Tài liệu hướng dẫn ôn tập giai đoạn 3 cho kỳ thi OCP Java SE 25 (1Z0-831). Phần này tập trung vào các API cốt lõi trong Java: Arrays, Collections, Generics, và Date/Time.",
  "icon": "📚",
  "phase": "Phase 3",
  "tags": [
   "Collections",
   "Generics",
   "HashMap Treeify",
   "Date/Time"
  ],
  "order": 2,
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
  "description": "Tài liệu bổ sung này cung cấp cái nhìn sâu sắc về internals (cơ chế nội bộ) của các Core APIs trong Java SE 25. Hiểu được \"tại sao\" và \"như thế nào\" đằng sau các API này…",
  "icon": "🔬",
  "phase": "Phase 3",
  "tags": [
   "Collections",
   "Generics",
   "HashMap Treeify",
   "Date/Time"
  ],
  "order": 3,
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
  "description": "Tài liệu bổ sung này đi sâu vào cơ chế hoạt động thực sự bên dưới của Functional Programming trong Java, đặc biệt phục vụ cho kỳ thi OCP Java SE 25 (1Z0-831). Nó không…",
  "icon": "🔬",
  "phase": "Phase 4",
  "tags": [
   "Lambdas",
   "Stream API",
   "Collectors",
   "invokedynamic",
   "Spliterator"
  ],
  "order": 4,
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
  "description": "Giai đoạn này tập trung vào Lập Trình Hàm (Functional Programming) trong Java, bao gồm Functional Interfaces, Lambda Expressions, Stream API, Collectors, Optional và…",
  "icon": "🌊",
  "phase": "Phase 4",
  "tags": [
   "Lambdas",
   "Stream API",
   "Collectors",
   "invokedynamic",
   "Spliterator"
  ],
  "order": 5,
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
  "description": "Đây là giai đoạn nhiều người rớt nhất. Lý do đơn giản: đi làm bạn dùng Spring, hiếm khi đụng trực tiếp ExecutorService, gần như không bao giờ viết module-info.java, và…",
  "icon": "⚙️",
  "phase": "Phase 5",
  "tags": [
   "Virtual Threads",
   "Concurrency",
   "JMM",
   "NIO.2",
   "JPMS Modules"
  ],
  "order": 1,
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
  "description": "Tài liệu này bao quát các chủ đề nâng cao quan trọng thường xuất hiện trong bài thi OCP Java SE 25. Bạn cần nắm vững không chỉ cú pháp mà còn cách các thư viện tiêu…",
  "icon": "⚙️",
  "phase": "Phase 5",
  "tags": [
   "Virtual Threads",
   "Concurrency",
   "JMM",
   "NIO.2",
   "JPMS Modules"
  ],
  "order": 2,
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
  "description": "Tài liệu này cung cấp cái nhìn chuyên sâu về các chủ đề nâng cao trong Java, tập trung vào cơ chế nội bộ (internal mechanisms), các trường hợp ngoại lệ (edge cases), và…",
  "icon": "🔬",
  "phase": "Phase 5",
  "tags": [
   "Virtual Threads",
   "Concurrency",
   "JMM",
   "NIO.2",
   "JPMS Modules"
  ],
  "order": 3,
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
  "description": "Tài liệu này cung cấp cái nhìn sâu sắc vào cơ chế hoạt động, lý thuyết nền tảng và các edge cases của các tính năng mới trong Java 22 đến 25, phục vụ cho kỳ thi OCP Java…",
  "icon": "🔬",
  "phase": "Phase 6",
  "tags": [
   "Flexible Constructors",
   "Gatherers",
   "Scoped Values",
   "Unnamed vars"
  ],
  "order": 1,
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
  "description": "Tài liệu này bao gồm tất cả các tính năng mới từ Java 22 đến Java 25 có thể xuất hiện trong bài thi chứng chỉ OCP Java SE 25 Developer (1Z0-831).",
  "icon": "🚀",
  "phase": "Phase 6",
  "tags": [
   "Flexible Constructors",
   "Gatherers",
   "Scoped Values",
   "Unnamed vars"
  ],
  "order": 2,
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
  "description": "Tài liệu này cung cấp các ví dụ mã nguồn thực tế, tự chứa và có thể thực thi hoàn toàn trong Java 25. Mỗi Lab tập trung vào một nhóm tính năng cốt lõi của Java 25, với…",
  "icon": "💻",
  "phase": "Master",
  "tags": [
   "Mock Exam",
   "Handbook",
   "Labs",
   "Traps",
   "Master Question Bank"
  ],
  "order": 1,
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
  "description": "Ba file trước tách theo chủ đề để bạn học. File này cố tình làm ngược lại: mỗi câu trộn 2–4 chủ đề, code dài hơn, đáp án gần giống nhau — vì đó chính là hình dạng thật…",
  "icon": "🏆",
  "phase": "Phase 7",
  "tags": [
   "Mock Exam",
   "Handbook",
   "Labs",
   "Traps",
   "Master Question Bank"
  ],
  "order": 2,
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
  "description": "Ngân hàng câu hỏi trắc nghiệm cực khó mô phỏng đề 1Z0-831, tập trung vào các tính năng Java 22–25: Flexible Constructors, Module Imports, Scoped Values, Virtual Threads, Pattern Matching.",
  "icon": "🔥",
  "phase": "Master",
  "tags": [
   "Mock Exam",
   "Handbook",
   "Labs",
   "Traps",
   "Master Question Bank"
  ],
  "order": 3,
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
  "description": "Kiến trúc Java Virtual Machine chia làm 3 thành phần chính: Class Loader Subsystem, Runtime Data Areas, và Execution Engine.",
  "icon": "📖",
  "phase": "Master",
  "tags": [
   "Mock Exam",
   "Handbook",
   "Labs",
   "Traps",
   "Master Question Bank"
  ],
  "order": 4,
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
  "description": "Tài liệu này cung cấp chiến lược làm bài thi thực tế và một đề thi thử toàn diện mô phỏng kỳ thi OCP Java SE 25 (1Z0-831).",
  "icon": "🏆",
  "phase": "Phase 7",
  "tags": [
   "Mock Exam",
   "Handbook",
   "Labs",
   "Traps",
   "Master Question Bank"
  ],
  "order": 5,
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
  "description": "Bản đồ tổng quan bốn trụ cột tài liệu: lộ trình, lý thuyết theo phase, lý thuyết chuyên sâu và đề thi thử — đọc trước để biết nên bắt đầu từ đâu.",
  "icon": "🏛️",
  "phase": "Master",
  "tags": [
   "Master Bible",
   "All-in-One",
   "Summary",
   "Architecture"
  ],
  "order": 6,
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
  "description": "Lộ trình luyện thuật toán bằng Java cho vòng phỏng vấn kỹ thuật Big Tech, ước tính 3–6 tháng với 2–3 giờ mỗi ngày.",
  "icon": "⚡",
  "phase": "DSA",
  "tags": [
   "DSA",
   "Algorithms",
   "LeetCode",
   "FAANG"
  ],
  "order": 1,
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
  "description": "Khác biệt so với bốn file OCP: ở đây không có trắc nghiệm. Mỗi chủ đề có một mẫu code chuẩn để bạn thuộc lòng, rồi 30 bài áp dụng kèm lời giải, độ phức tạp và biến thể…",
  "icon": "⚡",
  "phase": "DSA",
  "tags": [
   "DSA",
   "Algorithms",
   "LeetCode",
   "FAANG"
  ],
  "order": 1,
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
  "description": "Bản hợp nhất toàn bộ kiến thức OCP Java SE 25 và thuật toán phỏng vấn FAANG trong một tài liệu duy nhất — dùng để tra cứu, không phải để đọc tuần tự.",
  "icon": "⚡",
  "phase": "DSA",
  "tags": [
   "DSA",
   "Algorithms",
   "LeetCode",
   "FAANG"
  ],
  "order": 1,
  "updatedDate": "2026-09-02",
  "questions": 0
 }
];
