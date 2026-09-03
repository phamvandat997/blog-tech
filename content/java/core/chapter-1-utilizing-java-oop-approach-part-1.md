---
title: "Chapter 1: Utilizing Java Object-Oriented Approach - Part 1"
order: 4
phase: "Phase 1"
featured: true
tags: ["OOP", "Classes", "Methods", "Constructors", "Nested Classes"]
---

# Chapter 1: Utilizing Java Object-Oriented Approach - Part 1

> **Exam Objectives:**
> - Declare and instantiate Java objects including nested class objects, and explain the object life-cycle including creation, reassigning references, and garbage collection.
> - Create classes and records, and define and use instance and static fields and methods, constructors, and instance and static initializers.
> - Implement overloading, including var-arg methods.

---

## Chapter Content

- [Introduction to Object-Oriented Programming](#introduction-to-object-oriented-programming)
  - [Objects and Classes](#objects-and-classes)
  - [Higher-Level OOP Principles](#higher-level-oop-principles)
- [Object Life-Cycle in Java](#object-life-cycle-in-java)
  - [Reference Reassignment](#reference-reassignment)
  - [Garbage Collection](#garbage-collection)
- [Keywords](#keywords)
- [Comments](#comments)
- [Organizing Classes into Packages](#organizing-classes-into-packages)
  - [Creating a Package](#creating-a-package)
  - [Using Import Statements](#using-import-statements)
  - [Special Cases and Best Practices](#special-cases-and-best-practices)
  - [Redundant Imports](#redundant-imports)
  - [Access Control](#access-control)
- [Access Modifiers](#access-modifiers)
- [Declaring Classes](#declaring-classes)
- [Static and Instance Members](#static-and-instance-members)
- [Declaring Fields](#declaring-fields)
  - [Accessing and Modifying Fields](#accessing-and-modifying-fields)
- [Declaring Methods](#declaring-methods)
  - [Method Signatures](#method-signatures)
  - [Calling a method](#calling-a-method)
  - [Using Access Modifiers with Methods](#using-access-modifiers-with-methods)
  - [Passing Arguments Among Methods](#passing-arguments-among-methods)
  - [Method Overloading](#method-overloading)
  - [Varargs](#varargs)
  - [The main Method](#the-main-method)
- [Constructors and Initializers](#constructors-and-initializers)
  - [Constructors](#constructors)
  - [Instance Initializers](#instance-initializers)
  - [Static Initializers](#static-initializers)
  - [Initialization Order](#initialization-order)
- [Extending from java.lang.Object](#extending-from-javalangobject)
- [Nested Classes](#nested-classes)
  - [Static Nested Classes](#static-nested-classes)
  - [Non-static Nested Classes](#non-static-nested-classes)
  - [Local Classes](#local-classes)
  - [Anonymous Classes](#anonymous-classes)
- [Classes and Source Files](#classes-and-source-files)
- [Key Points](#key-points)
- [Practice Questions](#practice-questions)

---

## Introduction to Object-Oriented Programming

As the name implies, object-oriented programming (OOP) is a programming paradigm centered around the concept of objects. Rather than structure programs around procedures and functions (like procedural programming), OOP organizes code into objects, which represent real-world entities containing data (attributes) and behaviors (methods). This approach offers several advantages:

- Improved organization and modularity
- Code reuse through inheritance
- Real-world modeling

Java is an OOP language, so its basic building blocks are objects and classes.

### Objects and Classes

Objects are distinct instances in code that contain data and behaviors. Classes, on the other hand, are blueprints or templates that define the data and behaviors common to all objects of that class.

To better understand these concepts, think of cookies made from a cookie cutter. The cookie cutter defines the shape and size of the cookies, just as classes define what attributes and methods the object instances will have. Each cookie can be unique, with different chocolate chip placements, just as objects contain distinct data values.

For example, we can define a `Cookie` class that specifies the attributes of cookies, such as flavor, shape, topping, etc. You can also define methods, which are functions that operate on the data. Methods allow objects to perform actions. Our `Cookie` objects could have an `eat()` method:

```java
public class Cookie {
    // Attributes
    String flavor; 
    int size;
                     
    // Behavior (Method)
    public void eat() {
        System.out.println("That was yummy!");
    }
}
```

- `public class Cookie` defines a new `Cookie` class.
- `public` makes this class accessible from other classes.
- `String flavor;` declares a new String attribute called `flavor`.
- `int size;` declares an integer `size` attribute.
- `public void eat()` defines a public `eat` method that does not return a value (`void`).
- The class and the method bodies are wrapped in `{ }` brackets.
- `System.out.println();` prints text to the standard output (usually the console or terminal window).

And we can instantiate cookie objects from the `Cookie` class:

```java 
Cookie chocoChip = new Cookie();
chocoChip.flavor = "Chocolate Chip";
chocoChip.size = 2;

Cookie oatmealRaisin = new Cookie(); 
oatmealRaisin.flavor = "Oatmeal Raisin";
oatmealRaisin.size = 1;
```

- `Cookie chocoChip = new Cookie();` instantiates a new `Cookie` object called `chocoChip`.
- We use the class name `Cookie` and the default constructor `new Cookie()`.
- `chocoChip.flavor = "Chocolate Chip";` sets the flavor attribute of `chocoChip`.
- `chocoChip.size = 2;` sets the size attribute to `2`.
- We repeat the process for `oatmealRaisin`, creating another unique cookie object.

The objects `chocoChip` and `oatmealRaisin` are both cookies with the same methods defined by the `Cookie` class. However, they contain different data values for attributes like flavor and size.

A common misconception is that objects and classes are the same. However, while objects and classes are related, they serve distinct purposes:

- Classes define object structure.
- Objects represent unique instances.

The class acts as the mold, while objects are the cookies produced.

### Higher-Level OOP Principles

Once you understand objects and classes, grasping the higher-level principles of OOP, like inheritance, encapsulation, and polymorphism, becomes easier:

- **Inheritance** enables code reuse and the creation of class hierarchies. It's like having a basic cookie recipe that serves as a template for many types of cookies. This basic recipe (the parent class) includes common ingredients and methods (attributes and behaviors) that all cookies share. Specialized recipes (subclasses) for different types of cookies, like chocolate chip or oatmeal raisin, inherit common elements but also introduce unique ingredients or steps.

- **Encapsulation** involves bundling data attributes and behaviors into class definitions. It's like wrapping up your cookie dough and recipe instructions into a neat package. Each type of cookie, like chocolate chip or oatmeal raisin, has its own box containing everything needed to make it: ingredients (data) and steps (methods). This package ensures that all the secrets to baking the perfect cookie are held tightly together, accessible only through a specific opening in the box.

- **Polymorphism** enables customizing inherited parent behaviors in subclasses, like overriding the parent `eat()` method inside `ChocolateChip` to print `"Mmm chocolate chip!"`.

Bringing this full circle, we can model real-world cookie hierarchies through:

- **Inheritance** – Leveraging parent cookie traits and expanding on them.
- **Encapsulation** - Bundling cookie ingredients and recipes.
- **Polymorphism** - Customizing behaviors like `eat()` per subclass.

Together, these core OOP concepts enable flexible, modular cookie class design.

---

## Object Life-Cycle in Java

Understanding the different stages of an object's life-cycle is essential in Java's object-oriented programming. This includes the creation of objects, how reference variables access them, and how unused objects are managed by Java's garbage collector.

Here's a diagram that illustrates the typical life-cycle of a Java object, from creation to garbage collection:

```
┌────────────────────┐
│   Object Creation  │
│    (new keyword)   │
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│   Initialization   │
│   (Constructor)    │
└────────┬───────────┘
         │
         ▼
┌───────────────────┐
│     Object Use    │
│ (Active Lifetime) │
└────────┬──────────┘
         │
         ▼
┌────────────────────┐
│     Unreachable    │
│(No more references)│
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│   Garbage Collect  │
│     (finalize)     │
└────────────────────┘
```

To illustrate the life stages of a Java object, consider the analogy of a library book. When a new book arrives at the library, it is similar to constructing a new object using the `new` keyword:

```java
Book javaBook = new Book("The Java Book");
```

Let's break down what happens in that single line step-by-step:

1. **Declaring the Reference Variable:**
    ```java
    Book javaBook;
    ```
    This declares a variable called `javaBook` of type `Book`. At this point, no `Book` object exists yet; we have just created a reference variable that can point to a `Book` object.

2. **Instantiating the Object:**
    ```java
    = new Book("The Java Book");
    ```
    The `new` keyword instantiates or constructs a new `Book` object. This allocates memory on the heap for the object, passes the string argument to the `Book` constructor to initialize its state, and returns a reference to the newly created object.

3. **Assigning the Reference:**
    The `=` operator assigns the reference of the new `Book` object to the `javaBook` variable.

So, `javaBook` now contains a reference pointing to the new `Book` instance in memory:

```
javaBook --> [New Book object]
```

### Reference Reassignment

Like library books being checked out by different people, object references in Java can be reassigned:

```java
Book refBook = javaBook; // Assign second reference
javaBook = null; // Remove original reference
```

Let's review this step by step:

1. **Creating a Second Reference:**
    ```java
    Book refBook = javaBook;
    ```
    Both `javaBook` and `refBook` point to the same `Book` object.

2. **Nullifying the Original Reference:**
    ```java
    javaBook = null;
    ```
    This sets `javaBook` to `null`. Only `refBook` now points to the `Book` object. The object does not qualify for garbage collection because `refBook` still references it.

### Garbage Collection

Books no longer borrowed are eventually removed from a library's catalog. Similarly, in Java, objects with no references are cleaned up by the garbage collector:

```java
refBook = null; // Unreferenced object eligible for garbage collection
```

When all references to an object are gone, it becomes eligible for garbage collection:

1. **Identifying Unused Objects:** The garbage collector (GC) periodically scans the heap to find objects no longer referenced by any part of the application.
2. **Reclaiming Memory:** Unreferenced objects are freed, returning memory to the heap.
3. **Automatic Management:** Garbage collection happens automatically in the background without explicit program triggering.

---

## Keywords

In Java, a keyword is a reserved word that has a predefined meaning in the language. Keywords define the structure and syntax of Java programs. They cannot be used as identifiers (names for variables, methods, classes, etc.).

Commonly used keywords include:
- `class`: Declares a class.
- `public`, `private`, `protected`: Access modifiers.
- `static`: Indicates member belongs to the class itself.
- `void`: Specifies method returns no value.
- `if`, `else`, `switch`, `case`: Conditionals.
- `for`, `while`, `do`: Loops and iteration.
- `return`: Returns a value.
- `new`: Instantiates an object.
- `try`, `catch`, `finally`: Exception handling.
- `import`: Imports classes or packages.

Keywords are case-sensitive: `class` is a keyword, `Class` is not.

---

## Comments

Java supports three types of comments:
1. **Single-line comments**: Start with `//`.
2. **Multi-line comments**: Start with `/*` and end with `*/`.
3. **Documentation (javadoc) comments**: Start with `/**` and end with `*/`. Can be extracted to HTML using the Javadoc tool.

```java
/**
 * Javadoc comment explaining the class.
 */
public class MyClass {
    // Single-line comment
    int val = 10;

    /* Multi-line
       block comment */
    public int add(int a, int b) {
        return a + b;
    }
}
```

---

## Organizing Classes into Packages

A package organizes related classes, interfaces, and sub-packages into a single unit.

### Creating a Package
```java
package com.example.mypackage;
```
The package declaration must be the first non-comment statement in the source file, before any import statements or class declarations.

### Using Import Statements
```java
import java.util.ArrayList;
```
If not imported, fully qualified names must be used: `java.util.ArrayList list = new java.util.ArrayList();`.

### Special Cases and Best Practices
1. **Classes in `java.lang`**: Automatically available without import (e.g., `String`, `Math`, `System`, `Integer`).
2. **Same Package**: Classes in the same package do not require import statements.
3. **Collision**: When two packages contain classes with the same name (e.g., `java.sql.Date` and `java.util.Date`), at least one must be referenced by its fully qualified name.

---

## Access Modifiers

Java provides four access levels:

1. **`public`**: Accessible from anywhere in the application.
2. **`protected`**: Accessible within the same package and by subclasses in other packages.
3. **`default` (package-private)**: No modifier keyword. Accessible only within the same package.
4. **`private`**: Accessible only within the class where it is declared.

```
┌─────────────────────────────────────────────────────────────┐
│                         public                              │
│  ┌─────────────────────────────────────────────────┐        │
│  │               protected                         │        │
│  │  ┌─────────────────────────────────────┐        │        │
│  │  │    default (package-private)        │        │        │
│  │  │  ┌─────────────────────────┐        │        │        │
│  │  │  │      private            │        │        │        │
│  │  │  └─────────────────────────┘        │        │        │
│  │  └─────────────────────────────────────┘        │        │
│  └─────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

---

## Declaring Classes

```java
[accessModifier] class ClassName [extends Superclass] [implements Interface1, ...] {
    // class body
}
```

- Top-level classes can only be `public` or default (package-private).
- Class identifiers cannot start with a digit, cannot contain special characters (other than `_` and `$`), and cannot be reserved words.

---

## Static and Instance Members

- **Instance members**: Belong to each specific object. Accessed via the object reference.
- **Static members**: Belong to the class itself. Shared across all instances. Accessed directly via `ClassName.memberName`.

```java
public class Television {
    private int volume; // Instance field
    private static String manufacturer = "MyBrand"; // Static field

    public void setVolume(int v) { this.volume = v; } // Instance method
    public static void getInfo() { System.out.println(manufacturer); } // Static method
}
```

---

## Declaring Fields & Methods

### Method Signatures
A method signature consists ONLY of:
- **Method Name**
- **Ordered Parameter Types**

Access modifiers, return types, parameter names, and `throws` clauses are NOT part of the signature!

### Pass-by-Value in Java
Java is strictly pass-by-value:
- Primitive variables: The method receives a copy of the primitive value. Changes do not affect the caller.
- Reference variables: The method receives a copy of the reference. Modifying object state via the reference affects the object, but reassigning the reference does NOT affect the caller.

### Method Overloading
Multiple methods in the same class can share the same name as long as their parameter lists differ in type, count, or order. Changing only the return type is NOT valid overloading.

### Varargs (Variable-Length Arguments)
```java
public void print(int count, String... messages) { }
```
Rules:
1. Varargs parameter must be the **last** parameter in the list.
2. Only **one** varargs parameter per method.

---

## Constructors and Initializers

### Execution Order:
1. **Static Initializers & Static Fields**: Run once when the class is loaded into memory, in order of declaration.
2. **Instance Initializers & Instance Fields**: Run every time a new object is created, before constructor, in order of declaration.
3. **Constructor Body**: Runs last.

---

## Nested Classes

| Type | Static Member Allowed? | Access to Outer Members? | Independent Existence? |
|---|---|---|---|
| **Static Nested Class** | Yes | Static members only directly | Yes (`new Outer.Nested()`) |
| **Inner Class (Non-static)** | No (except final static) | Both static and non-static (including private) | No (requires Outer instance) |
| **Local Class** | No | Enclosing block's final/effectively final vars | Confined to method/block |
| **Anonymous Class** | No | Enclosing block's final/effectively final vars | One-time expression |

---

## Classes and Source Files

- **Public Class Rule**: If a source file contains a `public` class, the file name must match the public class name exactly with `.java` extension.
- **Single Public Class Rule**: A source file can contain at most ONE public class.
- **Non-Public Classes**: A source file can contain multiple non-public (package-private) classes.

---

## Key Points Summary

1. Java is OOP: Objects represent data and behaviors; Classes define their blueprint.
2. Objects are garbage collected once unreachable by any active references.
3. Java is strictly pass-by-value.
4. Method signatures only include name and parameter types.
5. Static runs once on class load; instance initializers run before constructors on each instantiation.

---

## Practice Questions

*(Luyện tập trực tiếp với chức năng chấm điểm và giải thích đúng/sai bên dưới hoặc mở trang Luyện Quiz để thi thử)*
