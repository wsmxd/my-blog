---
title: "在Avalonia应用中集成WinForm中的WebView2"
date: "2026-1-2"
description: "因为在Avalonia中没有原生且免费的WebView控件，所以这里采用的是使用WinForm中的WebView控件在Avalonia中进行使用(只适用于WIndows)"
tags: ["Avalonia", "WebView"]
cover: "webview.png"
category: "professional"
---

## WinForms WebView2 集成到 Avalonia 的完整过程总结

### 📝 关键步骤

#### **第一步：项目配置** ⭐⭐⭐
```xml
<!-- WebViewTest.csproj -->
<PropertyGroup>
    <OutputType>WinExe</OutputType>
    <TargetFramework>net8.0-windows</TargetFramework>
    <UseWindowsForms>true</UseWindowsForms>  <!-- ⭐ 关键：启用 WinForms 支持 -->
</PropertyGroup>
```

**为什么重要**：
- 必须是 `net8.0-windows` 而非 `net8.0`（需要 Windows API 支持）
- `UseWindowsForms=true` 是必须的，才能使用 WinForms WebView2

---

#### **第二步：安装 NuGet 包** ⭐⭐
```bash
dotnet add package Microsoft.Web.WebView2
dotnet add package Avalonia
dotnet add package Avalonia.Desktop
```

**包的版本关系**：
- WebView2：不需要特定版本（用最新）
- Avalonia：使用 11.3.0+（新版本）

---

#### **第三步：创建 WebView2Host 自定义控件** ⭐⭐⭐⭐⭐ 最关键

```csharp
public class WebView2Host : NativeControlHost
{
    private WebView2? _webView;
    private string? _pendingUrl;

    protected override IPlatformHandle CreateNativeControlCore(IPlatformHandle parent)
    {
        // 1️⃣ 创建 WinForms WebView2 实例
        _webView = new WebView2();
        _webView.Dock = DockStyle.Fill;

        // 2️⃣ 注册初始化完成事件
        _webView.CoreWebView2InitializationCompleted += (s, e) =>
        {
            if (e.IsSuccess && _pendingUrl != null)
            {
                NavigateInternal(_pendingUrl);
                _pendingUrl = null;
            }
        };

        // 3️⃣ 在 Handle 创建后才能调用 EnsureCoreWebView2Async
        if (_webView.IsHandleCreated)
        {
            _webView.Invoke((Action)(async () =>
            {
                await _webView.EnsureCoreWebView2Async();
            }));
        }
        else
        {
            _webView.HandleCreated += async (s, e) =>
            {
                await _webView.EnsureCoreWebView2Async();
            };
        }

        // 4️⃣ 获取并返回窗口句柄
        var hwnd = _webView.Handle;
        if (hwnd != IntPtr.Zero)
        {
            return new PlatformHandle(hwnd, "HWND");
        }
        throw new Exception("Failed to get WebView2 handle");
    }

    // 5️⃣ 支持属性绑定和导航
    public static readonly StyledProperty<string?> SourceProperty =
        AvaloniaProperty.Register<WebView2Host, string?>(nameof(Source));

    public string? Source
    {
        get => GetValue(SourceProperty);
        set => SetValue(SourceProperty, value);
    }

    static WebView2Host()
    {
        SourceProperty.Changed.AddClassHandler<WebView2Host>((x, e) =>
        {
            if (e.NewValue is string url && !string.IsNullOrWhiteSpace(url))
            {
                x.Navigate(url);
            }
        });
    }

    public void Navigate(string url)
    {
        if (_webView?.CoreWebView2 != null)
        {
            _webView.Source = new Uri(url);
        }
        else
        {
            _pendingUrl = url;
        }
    }
}
```

**关键要点**：
- 🔴 **必须继承 `NativeControlHost`** - 这是 Avalonia 提供的原生控件容器
- 🔴 **句柄获取必须在 Handle 创建后** - 不能在构造函数中获取
- 🔴 **初始化必须异步** - EnsureCoreWebView2Async 是异步方法
- 🔴 **需要 _pendingUrl** - 处理初始化前导航的情况
- 🟡 **线程安全** - 使用 `Invoke()` 确保在 UI 线程执行

---

#### **第四步：创建包装的 UserControl** ⭐⭐⭐
```csharp
public partial class WebViewControl : UserControl
{
    public static readonly StyledProperty<string?> StartUrlProperty =
        AvaloniaProperty.Register<WebViewControl, string?>(
            nameof(StartUrl),
            defaultValue: "https://bing.com");

    public string? StartUrl
    {
        get => GetValue(StartUrlProperty);
        set => SetValue(StartUrlProperty, value);
    }

    public WebViewControl()
    {
        InitializeComponent();

        var browser = this.FindControl<WebView2Host>("BrowserHost");
        if (browser != null)
        {
            var url = string.IsNullOrWhiteSpace(StartUrl) ? "https://bing.com" : StartUrl;
            browser.Navigate(url);
        }
    }
}
```

**为什么需要**：
- 提供更高级的 API（StartUrl 属性）
- 初始化逻辑集中管理
- 方便复用和扩展

---

#### **第五步：XAML 集成** ⭐⭐
```xml
<!-- WebViewControl.axaml -->
<UserControl xmlns="https://github.com/avaloniaui"
             xmlns:views="clr-namespace:WebViewTest.Views"
             x:Class="WebViewTest.Views.WebViewControl">
  <views:WebView2Host x:Name="BrowserHost"/>
</UserControl>

<!-- MainWindow.axaml -->
<Window>
    <Grid RowDefinitions="Auto,*">
        <TextBlock Text="以下为网页的展示：" Grid.Row="0"/>
        <views:WebViewControl Grid.Row="1" StartUrl="https://bing.com"/>
    </Grid>
</Window>
```

---

### ⚠️ 常见踩坑与解决方案

| 问题 | 原因 | 解决方案 |
|------|------|--------|
| 窗口句柄为 0 | Handle 还未创建 | 在 HandleCreated 事件后获取 |
| 线程安全异常 | 直接从其他线程调用 | 使用 `Invoke()` |
| CoreWebView2 为 null | 初始化未完成 | 使用 _pendingUrl 延迟导航 |
| 页面显示为黑色 | WebView2 运行时缺失 | 确保系统已安装 WebView2 Runtime |
| 其他控件被覆盖 | Grid 行布局错误 | 使用 `RowDefinitions` 和 `Grid.Row` |

---

### 📊 整个流程的依赖关系

```
项目配置 (net8.0-windows)
    ↓
安装 NuGet 包 (WebView2)
    ↓
创建 WebView2Host (继承 NativeControlHost)
    ├─ 重写 CreateNativeControlCore
    ├─ 获取窗口句柄
    └─ 异步初始化 CoreWebView2
    ↓
创建 WebViewControl UserControl
    ├─ 包含 WebView2Host
    └─ 提供 StartUrl 属性
    ↓
在 MainWindow 中使用
    ├─ XAML 引用命名空间
    └─ 设置 Grid 布局
```

---

### ✅ 完整检查清单

- [ ] ✅ TargetFramework 设为 `net8.0-windows`
- [ ] ✅ UseWPF 和 UseWindowsForms 都设为 true
- [ ] ✅ 安装 Microsoft.Web.WebView2 包
- [ ] ✅ WebView2Host 继承 NativeControlHost（不是 Control）
- [ ] ✅ 在 HandleCreated 事件后才调用 EnsureCoreWebView2Async
- [ ] ✅ 使用 _pendingUrl 处理初始化前导航
- [ ] ✅ 使用 Invoke() 确保线程安全
- [ ] ✅ 在 XAML 中正确注册命名空间
- [ ] ✅ 使用 Grid.Row 分配布局空间
- [ ] ✅ 测试网页加载和交互

---

### 🎯 最终成果

✅ 成功将 WinForms WebView2 集成到 Avalonia 11  
✅ 支持属性绑定和自定义 URL  
✅ 与其他 Avalonia 控件正常共存  
✅ 稳定运行，无版本冲突