# My Modern Blog

这是一个基于 Next.js App Router 的现代化个人博客骨架，支持 Markdown 文章和 Giscus（基于 GitHub Discussions）的评论系统。

主要特性
- Markdown 博客（放在 `posts/` 目录）
- Markdown 渲染：`react-markdown` + `remark-gfm` + `rehype-sanitize`
- 代码高亮：`react-syntax-highlighter`
- 评论：Giscus（需要在环境变量中配置）

快速开始

1. 安装依赖

```powershell
npm install
```

2. 本地启动

```powershell
npm run dev
```

文章位置

在仓库根目录下的 `posts/` 中创建 `.md` 文件。示例：`posts/hello-world.md`。

配置 Giscus（GitHub Discussions）

1. 在你的 GitHub 仓库中启用 Discussions，并创建一个 category 用于评论（记下 category 名称及其 ID）。
2. 获取仓库的 repo ID（GraphQL、或在 Giscus 设置中可见）、category id。
3. 在 Vercel（或本地 .env）中添加以下环境变量：

- `GISCUS_REPO`（格式：owner/repo）
- `GISCUS_REPO_ID`（GitHub 提供的 repo id）
- `GISCUS_CATEGORY`（category 名称）
- `GISCUS_CATEGORY_ID`（category id）

部署到 Vercel

1. 在 Vercel 中导入该仓库。
2. 在 Vercel 项目设置 -> Environment Variables 中添加上面 4 个 Giscus 环境变量。
3. 部署（Vercel 会自动运行 `npm install && npm run build`）。

注意事项
- 添加或修改依赖后请运行 `npm install`。
- 若想改善样式，建议启用 Tailwind 的 typography 插件以获得更好的 `prose` 样式。
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
