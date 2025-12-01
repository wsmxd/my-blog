---
title: "BindingFlags 的用法"
date: "2025-12-1"
description: "BindingFlags经常与反射一起使用，但它究竟是什么，为什么要用它，以及常见用法"
tags: [C#, 编程]
cover: "/images/BindingFlags.png"
category: "professional"
---

## `BindingFlags` 的详解与常见用法

`BindingFlags` 是 C# 反射（Reflection）中用于**精确控制类型成员查找行为**的枚举标志。它告诉 `Type.GetMethods()`、`GetProperties()`、`GetFields()` 等反射方法：“**你想要哪些方法？从哪里找？访问级别是什么？**”

---
## 🔍 一、为什么需要 `BindingFlags`？

默认情况下，像 `type.GetMethods()` 这样的方法**只返回 public 实例方法**，但很多时候你需要：

- 获取私有方法？
- 获取静态方法？
- 只获取当前类定义的方法（不包括继承的）？
- 同时获取公有 + 私有 + 静态 + 实例方法？

这时候就需要用 `BindingFlags` 来**组合筛选条件**。

---

## 🧩 二、常用 `BindingFlags` 枚举值说明

| 枚举值 | 作用 |
|--------|------|
| `BindingFlags.Public` | 包含 **public** 成员 |
| `BindingFlags.NonPublic` | 包含 **private、protected、internal** 等非公有成员 |
| `BindingFlags.Instance` | 包含 **实例成员**（需通过对象调用） |
| `BindingFlags.Static` | 包含 **静态成员**（通过类型直接调用） |
| `BindingFlags.DeclaredOnly` | **仅返回在当前类型中声明的成员**，不包括从基类或接口继承的成员 |
| `BindingFlags.FlattenHierarchy` | 包含从基类继承的 **public 和 protected 静态成员**（对实例成员无效） |
| `BindingFlags.InvokeMethod` | 用于 `InvokeMember`，表示调用方法（一般不用在 `GetMethods`） |

> 💡 `BindingFlags` 是 `[Flags]` 枚举，支持按位 **OR（`|`）组合**。

---

## 📌 三、代码解析

```csharp
var methods = type.GetMethods(
    BindingFlags.Public | 
    BindingFlags.Instance | 
    BindingFlags.DeclaredOnly
);
```

这行代码的意思是：

> “请返回 **当前类中声明的**、**public 的**、**实例方法**（不包括静态方法，也不包括从父类继承的方法）。”

### ✅ 举例说明

```csharp
public class Animal
{
    public void Eat() { }
    protected void Sleep() { }
    public static void Info() { }
}

public class Dog : Animal
{
    public void Bark() { }
    private void WagTail() { }
    public override string ToString() => "Dog";
}
```

对 `typeof(Dog)` 调用不同 `BindingFlags` 的结果：

| BindingFlags 组合 | 返回的方法 |
|------------------|-----------|
| `Public \| Instance` | `Bark()`, `Eat()`, `ToString()`（包含继承的 public 实例方法） |
| `Public \| Instance \| DeclaredOnly` | **仅 `Bark()`**（只取 Dog 自己声明的） |
| `NonPublic \| Instance \| DeclaredOnly` | `WagTail()`（私有实例方法） |
| `Static \| Public` | （无，因为 Dog 没有 public static 方法） |
| `Public \| NonPublic \| Static \| Instance` | 所有方法（包括私有、静态、继承等）|

---

## 🛠️ 四、常见组合示例

| 目标 | BindingFlags 写法 |
|------|------------------|
| 获取所有 **public 实例方法**（默认行为） | `BindingFlags.Public \| BindingFlags.Instance` |
| 获取当前类定义的 **所有方法**（公有+私有+静态+实例） | `BindingFlags.Public \| BindingFlags.NonPublic \| BindingFlags.Static \| BindingFlags.Instance \| BindingFlags.DeclaredOnly` |
| 获取 **私有实例方法** | `BindingFlags.NonPublic \| BindingFlags.Instance` |
| 获取 **静态方法（含继承）** | `BindingFlags.Public \| BindingFlags.Static` |
| 获取 **仅当前类的公有静态方法** | `BindingFlags.Public \| BindingFlags.Static \| BindingFlags.DeclaredOnly` |

> ✅ 小技巧：你可以封装常用组合：
> ```csharp
> public static class Binding
> {
>     public static readonly BindingFlags AllDeclared = 
>         BindingFlags.Public | BindingFlags.NonPublic |
>         BindingFlags.Static | BindingFlags.Instance |
>         BindingFlags.DeclaredOnly;
> }
> ```

---

## ⚠️ 五、注意事项

1. **必须显式指定 `Instance` 或 `Static`**  
   如果你只写 `BindingFlags.Public`，**不会返回任何方法**！因为反射要求你明确是要实例成员还是静态成员。

2. **`DeclaredOnly` 不影响接口实现的方法**  
   接口方法在实现类中被视为“声明”，所以会被包含。

3. **性能**：获取更多成员（如 `NonPublic`）可能涉及更多元数据解析，但差异通常可忽略。

4. **安全性**：访问 `NonPublic` 成员在某些受限制环境（如沙箱、AOT）中可能被禁止。

---

## ✅ 六、总结

| 问题 | 答案 |
|------|------|
| `BindingFlags` 有什么用？ | **精确控制反射时要查找哪些成员**（访问级别、静态/实例、是否包含继承等） |
| 为什么不能只写 `GetMethods()`？ | 默认只返回 `Public \| Instance`，无法满足复杂需求 |
| 必须组合哪些标志？ | 至少要包含 **`Instance` 或 `Static`** 中的一个，否则返回空数组 |
| 如何只获取当前类的方法？ | 加上 `BindingFlags.DeclaredOnly` |

> 💡 **口诀**：  
> **“要啥加啥，实例静态二选一，继承与否看 DeclaredOnly”**

掌握 `BindingFlags`，你才能真正**精准操控反射**，避免“为什么找不到这个方法？”的困惑！