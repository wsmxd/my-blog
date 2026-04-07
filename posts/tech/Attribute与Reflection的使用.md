---
title: "Attribute 与反射的结合使用"
date: "2025-12-1"
description: "Attribute 与反射的结合使用"
tags: [C#, .NET]
cover: "attribute_with_reflection.png"
category: "professional"
---

# C# 自定义 Attribute 与反射结合使用详解（完整指南）

在 .NET 开发中，**自定义特性（Custom Attribute）** 与 **反射（Reflection）** 的结合是一种强大而优雅的元编程技术。它允许开发者以**声明式方式**为代码附加元数据，并在运行时通过反射读取这些信息，从而实现高度灵活、可扩展的系统架构。

---

## 一、核心概念

### 1.1 什么是 Attribute？

- **Attribute（特性）** 是一种特殊的类，继承自 `System.Attribute`。
- 它用于在**编译时**为程序元素（如类、方法、属性、参数等）附加**元数据（metadata）**。
- 这些元数据被嵌入到程序集（Assembly）的 IL 中，但**不会自动产生行为**——必须通过反射显式读取。

> ✅ 示例：`[Obsolete("Use NewMethod instead")]` 就是一个内置 Attribute。

### 1.2 什么是反射（Reflection）？

- **反射** 是 .NET 提供的一组 API，用于在**运行时**检查类型信息、创建实例、调用方法、访问字段/属性等。
- 可以通过 `Type`、`PropertyInfo`、`MethodInfo` 等类型获取程序结构。

> 🔗 核心命名空间：`System.Reflection`

---

## 二、使用流程（四步法）

### 步骤 1：定义自定义 Attribute

```csharp
[AttributeUsage(
    AttributeTargets.Class | 
    AttributeTargets.Property,
    AllowMultiple = false,     // 是否允许多次应用
    Inherited = true           // 是否可被继承
)]
public class DescriptionAttribute : Attribute
{
    public string Text { get; }
    public int Order { get; set; } // 命名参数（可选）

    // 位置参数（必须通过构造函数传入）
    public DescriptionAttribute(string text)
    {
        Text = text;
    }
}
```

#### 📌 `AttributeUsage` 参数说明：

| 参数 | 说明 |
|------|------|
| `AttributeTargets` | 指定该 Attribute 可应用的目标（类、方法、属性等） |
| `AllowMultiple` | 是否允许多次标注（默认 `false`） |
| `Inherited` | 子类是否继承父类的 Attribute（默认 `true`） |

> 💡 常见 `AttributeTargets` 枚举值：
> - `Class`, `Method`, `Property`, `Field`
> - `Parameter`, `ReturnValue`, `Assembly`, `All`

---

### 步骤 2：应用 Attribute 到代码元素

```csharp
[Description("表示一本书的信息", Order = 1)]
public class Book
{
    [Description("书名", Order = 10)]
    public string Title { get; set; }

    [Description("作者")]
    public string Author { get; set; }
}
```

> ✅ 命名约定：自定义 Attribute 类名应以 `Attribute` 结尾（如 `DescriptionAttribute`），使用时可省略后缀（写成 `[Description(...)]`）。

---

### 步骤 3：通过反射读取 Attribute

```csharp
var type = typeof(Book);

// 读取类上的 Attribute
var classAttr = type.GetCustomAttribute<DescriptionAttribute>();
Console.WriteLine($"类描述: {classAttr?.Text}, 顺序: {classAttr?.Order}");

// 读取所有属性及其 Attribute
foreach (var prop in type.GetProperties())
{
    var attr = prop.GetCustomAttribute<DescriptionAttribute>();
    if (attr != null)
    {
        Console.WriteLine($"{prop.Name}: {attr.Text} (Order={attr.Order})");
    }
}

// 调用所有无参数且返回 void 的方法
foreach (var method in type.GetMethods(BindingFlags.Public | BindingFlags.Instance | BindingFlags.DeclaredOnly))
{
    if (method.GetParameters().Length == 0 && method.ReturnType == typeof(void))
    {
        method.Invoke(book, null);
    }
}
```

---

### 步骤 4：基于元数据执行逻辑（业务处理）

例如：自动生成表单、验证规则、API 文档等。

```csharp
public static void GenerateForm<T>()
{
    var type = typeof(T);
    var props = type.GetProperties()
                    .Select(p => new { Prop = p, Attr = p.GetCustomAttribute<DescriptionAttribute>() })
                    .Where(x => x.Attr != null)
                    .OrderBy(x => x.Attr.Order);

    foreach (var item in props)
    {
        Console.WriteLine($"{item.Attr.Text}: <input name=\"{item.Prop.Name}\" />");
    }
}
```

---

## 三、常用反射 API 速查表

| 目标 | 方法 | 说明 |
|------|------|------|
| **获取类型** | `typeof(T)` 或 `obj.GetType()` | 获取 `Type` 对象 |
| **获取类上 Attribute** | `type.GetCustomAttribute<T>()` | 返回单个 Attribute |
| | `type.GetCustomAttributes<T>()` | 返回多个（当 `AllowMultiple=true`） |
| **获取属性上 Attribute** | `propertyInfo.GetCustomAttribute<T>()` | |
| **获取方法上 Attribute** | `methodInfo.GetCustomAttribute<T>()` | |
| **判断是否有 Attribute** | `Attribute.IsDefined(member, typeof(T))` | 高性能判断（不创建实例） |
| **获取所有公共属性** | `type.GetProperties()` | |
| **获取所有公共方法** | `type.GetMethods()` | |
| **获取字段** | `type.GetFields()` | |
| **创建实例** | `Activator.CreateInstance(type)` | |
| **调用方法** | `methodInfo.Invoke(obj, args)` | |

> ⚠️ 注意：`GetCustomAttribute<T>()` 默认 **不继承** 父类或接口的 Attribute。如需继承，使用：
> ```csharp
> type.GetCustomAttribute<T>(inherit: true);
> ```

---

## 四、典型应用场景

| 场景 | 使用的 Attribute 示例 | 说明 |
|------|------------------------|------|
| **序列化/反序列化** | `[JsonProperty("title")]` (Newtonsoft.Json) | 控制 JSON 字段名 |
| **数据验证** | `[Required]`, `[StringLength(100)]` | ASP.NET Core 模型验证 |
| **ORM 映射** | `[Column("book_title")]`, `[Key]` (EF Core) | 数据库字段映射 |
| **API 路由** | `[HttpGet("/books")]`, `[FromQuery]` | ASP.NET Core 控制器 |
| **Swagger 文档** | `[SwaggerOperation(Summary = "...")]` | 自动生成 API 文档 |
| **权限控制** | `[Authorize(Roles = "Admin")]` | 基于角色的访问控制 |
| **日志/审计** | `[Auditable]` | 标记需要记录变更的实体 |
| **插件系统** | `[Plugin(Name = "PDF Exporter")]` | 动态加载插件 |

---

## 五、高级技巧与最佳实践

### 5.1 缓存反射结果（提升性能）

反射操作较慢，建议缓存：

```csharp
private static readonly ConcurrentDictionary<Type, DescriptionAttribute> _classCache = new();

public static DescriptionAttribute GetClassDescription(Type type)
{
    return _classCache.GetOrAdd(type, t => t.GetCustomAttribute<DescriptionAttribute>());
}
```

### 5.2 支持继承链

确保子类能继承父类的 Attribute：

```csharp
[AttributeUsage(AttributeTargets.Class, Inherited = true)]
public class MyAttr : Attribute { ... }

public class Base { }
[MyAttr("Child")]
public class Child : Base { }

// 读取时启用继承
var attr = typeof(Child).GetCustomAttribute<MyAttr>(inherit: true);
```

### 5.3 多 Attribute 支持

```csharp
[AttributeUsage(AttributeTargets.Property, AllowMultiple = true)]
public class ValidateAttribute : Attribute { ... }

public class User
{
    [Validate("NotNull"), Validate("EmailFormat")]
    public string Email { get; set; }
}

// 读取多个
var validators = prop.GetCustomAttributes<ValidateAttribute>();
```

### 5.4 与泛型结合

```csharp
public static T GetMetadata<T>(MemberInfo member) where T : Attribute
{
    return member.GetCustomAttribute<T>();
}
```

---

## 六、限制与注意事项

| 问题 | 说明 |
|------|------|
| ❌ 不能动态修改类型结构 | 无法在运行时给已有类添加新属性/方法 |
| ⏱️ 性能开销 | 反射比直接调用慢 10~100 倍，避免高频使用 |
| 🔒 安全性 | 某些环境（如 AOT、Trimmed 应用）可能移除反射所需元数据 |
| 📦 程序集裁剪（Trimming） | 在 .NET 6+ 发布为 trimmed 时，未使用的类型可能被移除，导致反射失败 → 需配置 `rd.xml` 或使用 `DynamicDependency` |

---

## 七、完整示例：简易验证框架

```csharp
[AttributeUsage(AttributeTargets.Property)]
public class RequiredAttribute : Attribute { }

[AttributeUsage(AttributeTargets.Property)]
public class StringLengthAttribute : Attribute
{
    public int MaxLength { get; }
    public StringLengthAttribute(int maxLength) => MaxLength = maxLength;
}

public static class Validator
{
    public static IEnumerable<string> Validate(object obj)
    {
        var type = obj.GetType();
        foreach (var prop in type.GetProperties())
        {
            var value = prop.GetValue(obj);

            if (prop.GetCustomAttribute<RequiredAttribute>() != null && value == null)
                yield return $"{prop.Name} is required.";

            if (value is string str)
            {
                var lenAttr = prop.GetCustomAttribute<StringLengthAttribute>();
                if (lenAttr != null && str.Length > lenAttr.MaxLength)
                    yield return $"{prop.Name} exceeds max length {lenAttr.MaxLength}.";
            }
        }
    }
}

// 使用
public class LoginModel
{
    [Required]
    public string Username { get; set; }

    [Required, StringLength(20)]
    public string Password { get; set; }
}

var model = new LoginModel { Username = "admin", Password = new string('x', 25) };
foreach (var error in Validator.Validate(model))
    Console.WriteLine(error); // 输出密码超长错误
```

---

## 八、总结

> **Attribute + Reflection = 声明式编程 + 运行时智能**

- ✅ **优点**：解耦配置与逻辑、提升可维护性、支持框架扩展。
- ⚠️ **适用场景**：框架开发、中间件、ORM、序列化、验证、文档生成等。
- ❌ **不适用场景**：高频性能路径、简单业务逻辑（过度设计）。

掌握这一组合，是迈向 **高级 .NET 开发者** 的重要一步！

---

> 📘 **延伸学习**：
> - [.NET 官方文档：Attributes](https://learn.microsoft.com/en-us/dotnet/csharp/advanced-topics/reflection-and-attributes/)
> - [System.Reflection 命名空间](https://learn.microsoft.com/en-us/dotnet/api/system.reflection)
> - 《C# in Depth》第 18 章：Reflection and dynamic

--- 

✅ **提示**：在实际项目中，优先考虑使用现成的 Attribute（如 Data Annotations），而非重复造轮子。自定义 Attribute 应用于解决特定领域问题。