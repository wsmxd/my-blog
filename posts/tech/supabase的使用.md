---
title: "supabase的使用"
date: "2026-5-19"
description: "supabase目前提供免费的数据库服务配合上vercel即可实现轻量的可正式上线的项目，本文说明supabase数据库服务的使用说明"
tags: ["supabase", "数据库"]
cover: "https://wsmxd.top/upload-worker/images/2026/05/1778483795963-0a82c88e-4c8a-4cff-78b4-6144f2e2165b.jpeg"
---

## ☁️ 远程（云端）使用流程

![流程图](https://067srb2nq0mqarev.public.blob.vercel-storage.com/post-bed/supabase1-lAVq3coGbEdfYuJAYylRb7Uosv1SSD.png)

### 第一步：注册与创建项目

访问 [app.supabase.com](https://app.supabase.com)，用 GitHub 账号登录后点击 **New Project**，填写：

- 项目名称
- 数据库密码（务必保存好，后续无法直接查看）
- 区域（选离用户最近的，亚洲推荐 `ap-northeast-1` 东京或 `ap-southeast-1` 新加坡）

等待约 1 分钟，项目初始化完成。

---

### 第二步：设计数据库

进入项目后，有两种方式建表：

**Table Editor（可视化）**：点击左侧 Table Editor → New Table，图形化设置字段、类型、默认值、外键等。

**SQL Editor（更灵活）**：
```sql
create table profiles (
  id uuid references auth.users on delete cascade,
  username text unique not null,
  avatar_url text,
  updated_at timestamptz,
  primary key (id)
);
```

---

### 第三步：配置 Auth 认证

在 **Authentication → Providers** 中开启需要的登录方式（Email、Google、GitHub 等）。

配置回调 URL（在 **Authentication → URL Configuration**）：
```
Site URL:  https://your-app.com
Redirect URLs: https://your-app.com/auth/callback
```

---

### 第四步：设置 RLS（行级安全）

RLS 是 Supabase 的核心安全机制，**建表后默认关闭，务必手动启用**：

```sql
-- 启用 RLS
alter table profiles enable row level security;

-- 用户只能读写自己的数据
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);
```

---

### 第五步：获取 API Keys

在 **Settings → API** 中获取：

| Key | 用途 |
|-----|------|
| `anon public` | 前端使用，配合 RLS 控权 |
| `service_role` | 服务端使用，**绕过** RLS，千万不要暴露给前端 |
| Project URL | `https://xxxx.supabase.co` |

---

### 第六步：接入 SDK

```bash
npm install @supabase/supabase-js
```

```ts
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

常见操作示例：

```ts
// 查询
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)

// 注册
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
})

// 上传文件
const { data, error } = await supabase.storage
  .from('avatars')
  .upload(`${userId}/avatar.png`, file)
```

---

## 🖥️ 本地开发流程

本地开发使用 **Supabase CLI**，在本机运行一套完整的 Supabase 服务（PostgreSQL + Auth + Storage + Studio），适合开发和测试。

### 前置条件

- Docker Desktop（必须，本地服务基于 Docker 容器运行）
- Node.js 18+（可选，用于 Edge Functions）

---

### 第一步：安装 CLI

```bash
# macOS
brew install supabase/tap/supabase

# npm（跨平台）
npm install -g supabase

# Windows（Scoop）
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

验证安装：
```bash
supabase --version
```

---

### 第二步：初始化项目

在你的代码仓库根目录执行：

```bash
supabase init
```

这会生成 `supabase/` 目录结构：
```
supabase/
├── config.toml        # 本地配置（端口、Auth 设置等）
├── migrations/        # SQL 迁移文件
├── functions/         # Edge Functions
└── seed.sql           # 初始种子数据（可选）
```

然后启动本地服务：
```bash
supabase start
```

首次运行会拉取 Docker 镜像，约需几分钟。成功后输出：

```
Started supabase local development setup.

         API URL: http://localhost:54321
     GraphQL URL: http://localhost:54321/graphql/v1
          DB URL: postgresql://postgres:postgres@localhost:54322/postgres
      Studio URL: http://localhost:54323
    Inbucket URL: http://localhost:54324   ← 本地邮件测试收件箱
        anon key: eyJhbGc...
service_role key: eyJhbGc...
```

---

### 第三步：本地 Studio

打开 `http://localhost:54323`，获得与云端完全一致的可视化管理界面，可以建表、写 SQL、查看 Auth 用户等。

邮件验证测试用 `http://localhost:54324`（Inbucket），所有发出的邮件都会在这里收到，无需真实邮箱。

---

### 第四步：编写 Migration 迁移文件

**方式一：通过命令生成空文件**
```bash
supabase migration new create_profiles_table
# 生成 supabase/migrations/20240519120000_create_profiles_table.sql
```

然后在文件中写 SQL：
```sql
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  created_at timestamptz default now()
);

alter table profiles enable row level security;
```

应用迁移：
```bash
supabase db reset  # 重置并重新跑所有 migration（开发阶段常用）
```

**方式二：从本地 Studio 改好后导出**
```bash
supabase db diff --use-migra -f my_changes
# 自动比对差异并生成 migration 文件
```

---

### 第五步：与远程同步

**本地推送到远程：**
```bash
# 登录
supabase login

# 关联远程项目（Project ID 在云端 Settings 里找）
supabase link --project-ref your-project-id

# 将本地 migration 推送到远程数据库
supabase db push
```

**从远程拉取 schema 到本地：**
```bash
supabase db pull
```

---

### 第六步：生成 TypeScript 类型

```bash
# 从本地数据库生成（推荐开发时用）
supabase gen types typescript --local > src/types/database.types.ts

# 从远程数据库生成
supabase gen types typescript --project-id your-project-id > src/types/database.types.ts
```

生成后在 SDK 中使用：
```ts
import { Database } from '@/types/database.types'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient<Database>(URL, KEY)

// 查询时有完整的类型提示
const { data } = await supabase.from('profiles').select('username')
//     ^ data 类型自动推断为 { username: string }[]
```

---

### 第七步：Edge Functions（可选）

```bash
# 新建一个函数
supabase functions new hello-world

# 本地调试
supabase functions serve

# 部署到远程
supabase functions deploy hello-world
```

函数文件 `supabase/functions/hello-world/index.ts`：
```ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  const { name } = await req.json()
  return new Response(JSON.stringify({ message: `Hello ${name}!` }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

---

## 🔄 推荐开发流程

```
本地开发 → migration 文件 → git 提交 → supabase db push → 远程生产
```

所有 schema 变更通过 migration 文件版本化管理，不要直接在远程 Studio 点来点去，保持本地和远程的一致性是关键。

---

## 常用命令速查

| 命令 | 作用 |
|------|------|
| `supabase start` | 启动本地服务 |
| `supabase stop` | 停止本地服务 |
| `supabase db reset` | 重置本地 DB，重跑所有 migration |
| `supabase db push` | 推送 migration 到远程 |
| `supabase db pull` | 从远程拉取 schema |
| `supabase db diff` | 生成 schema 差异文件 |
| `supabase gen types typescript --local` | 生成 TS 类型 |
| `supabase status` | 查看本地服务状态和端口 |
