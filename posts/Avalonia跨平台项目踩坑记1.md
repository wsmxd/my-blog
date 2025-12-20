---
title: "Avalonia跨平台项目踩坑记1"
date: "2025-12-9"
description: "我之前弄过一个基于Avalonia的跨平台小项目，今天用Rider打开后发现Android项目中突然就有报错了，这次记录一下踩的坑。"
tags: [C#, Android, Avalonia]
cover: "AvaloniaCrossError.png"
category: "professional"
---
## 🕳️ 在Android项目中主要踩的 5 个大坑

#### 🔴 坑 1：**安装 .NET 10 预览版后，Android 项目突然构建失败**

- **现象**：之前能跑的 `net8.0-android` 项目报错 `NETSDK1202` 或 `NETSDK1147`
- **原因**：
  - `.NET CLI 默认使用最高版本 SDK`（10.0.100）
  - 但你的项目是 `net8.0`，而 **.NET 10 的 Android workload 不兼容 .NET 8 项目**
- **教训**：  
  > **预览版 SDK 会“劫持”全局构建环境，破坏稳定项目**

✅ **对策**：所有生产/学习项目都加 `global.json` 锁定 SDK 版本。

---

#### 🔴 坑 2：**误以为工作负载是全局共享的**

- **现象**：明明装过 `android` workload，为什么现在说“没安装”？
- **真相**：
  - 工作负载 **按 SDK 版本隔离存储**
  - `.NET 8` 的 workload ≠ `.NET 10` 的 workload
  - 它们物理路径不同，互不可见
- **教训**：  
  > **每个 SDK 版本需要独立安装自己的 workload**

✅ **对策**：在正确 SDK 环境下（通过 `global.json` 控制）运行 `dotnet workload install android`

---

#### 🔴 坑 3：**`global.json` 写错版本号导致 SDK 找不到**

- **错误写法**：
  ```json
  { "sdk": { "version": "8.0.0" } }
  ```
- **问题**：  
  - **不存在 `8.0.0` 的 SDK**！.NET SDK 版本从 `8.0.100` 起
  - 即使有 `8.0.201`，也不会自动匹配 `8.0.0`
- **结果**：`dotnet --info` 报错 `NETSDK1141`

✅ **对策**：  
  - 查 `dotnet --list-sdks`，**精确写已安装的版本**（如 `8.0.201`）
  - 或用 `8.0.100` + `"rollForward": "latestPatch"`

---

#### 🔴 坑 4：**Android 项目 TargetFramework 不完整**

- **错误写法**：
  ```xml
  <TargetFramework>net8.0-android</TargetFramework>
  ```
- **问题**：  
  - 缺少 API 级别 → `TargetPlatformVersion=0.0`
  - 触发错误：`[NETSDK1135] SupportedOSPlatformVersion 21 不能高于 TargetPlatformVersion 0.0`
- **原因**：某些环境下无法自动推断 Android API 版本

**ps**:我一开始在Avalonia的跨平台项目里面的安卓没有显示指定API版本，构建的时候也成功了。像这样`<TargetFramework>net8.0-android</TargetFramework>`

✅ **对策**：显式指定完整 TFM：
```xml
<TargetFramework>net8.0-android34.0</TargetFramework>
```

---

#### 🔴 坑 5：**混淆“工作负载用途”和“是否需要”**

- **现象**：看到 `wasm-tools-net8` 装在 .NET 10 下，疑惑“这对我有用吗？”
- **真相**：
  - 它是为 **Blazor WebAssembly** 服务的
  - **Avalonia 桌面/Android 完全不需要它**
  - 但它被装上，可能是因为你曾创建过 Blazor 项目，或 VS 自动恢复了 workload
- **教训**：  
  > **不是所有 workload 都和你当前项目相关**

✅ **对策**：定期清理不用的 workload，保持环境干净。

---
## 🕳️ 总结
1. 在正式的项目中还是要显示配置global.json，锁定SDK版本，避免版本冲突,像下面这样。
    1. `"version": "8.0.201"`,
    2. `"rollForward": "disable"`,
    3. `"allowPrerelease": false`
2. 注意安装的workload是否和当前项目相关，不要安装多余的workload。