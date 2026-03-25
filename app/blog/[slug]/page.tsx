import { getPostBySlug, getAllPosts } from "../../../lib/posts";
import MarkdownRenderer from "../../components/MarkdownRenderer";
import Giscus from "../../components/Giscus";
import { notFound } from "next/navigation";

// 强制静态生成
export const dynamic = 'force-static';
export const revalidate = 3600; // 1小时重新验证一次

type Props = {
  params: Promise<{ slug: string }> | { slug: string };
};

import { ErrorBoundary } from "../../components/ErrorBoundary";
import ClientEntry from "./ClientEntry";

// 生成所有文章的静态路径
export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

const PostContent = async ({ post }: { post: Awaited<ReturnType<typeof getPostBySlug>> }) => {
const {
  NEXT_PUBLIC_GISCUS_REPO,
  NEXT_PUBLIC_GISCUS_REPO_ID,
  NEXT_PUBLIC_GISCUS_CATEGORY,
  NEXT_PUBLIC_GISCUS_CATEGORY_ID,
} = process.env;
  return (
    // 👇 添加 overflow-x-hidden w-full
    <article className="pt-12 max-w-4xl mx-auto relative overflow-x-hidden w-full">
      {/* 👇 背景装饰 - 添加 pointer-events-none 和 -z-10 */}
      <div className="absolute -top-20 -right-20 w-72 h-72 bg-purple-400/5 dark:bg-purple-900/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-40 -left-20 w-96 h-96 bg-blue-400/5 dark:bg-blue-900/10 rounded-full blur-3xl pointer-events-none -z-10" />
      
      <header className="mb-8 pb-6 border-slate-200 dark:border-slate-700/50 border-b relative">
        <h1 
          className="text-4xl sm:text-5xl font-bold mb-3 bg-clip-text text-transparent leading-tight"
          style={{
            backgroundImage: `linear-gradient(to right, var(--article-title-from), var(--article-title-via), var(--article-title-to))`
          }}
        >
          {post.meta.title}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {post.meta.date}
        </p>
      </header>

      <div className="prose-container bg-white dark:bg-slate-900/50 rounded-3xl p-6 sm:p-8 lg:p-12 shadow-xl backdrop-blur-lg border-slate-100 dark:border-slate-700/30 border relative overflow-hidden">
        {/* 👇 内容区装饰效果 - 添加 pointer-events-none */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/5 dark:bg-linear-to-br dark:from-blue-500/10 dark:to-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative">
          <MarkdownRenderer content={post.content} />
        </div>
      </div>

      {/* comments */}
      <div className="mt-12">
        {NEXT_PUBLIC_GISCUS_REPO && NEXT_PUBLIC_GISCUS_REPO_ID && NEXT_PUBLIC_GISCUS_CATEGORY && NEXT_PUBLIC_GISCUS_CATEGORY_ID ? (
          <div className="bg-white dark:bg-slate-900/50 rounded-3xl p-6 backdrop-blur-lg border-slate-100 dark:border-slate-700/30 border">
            <Giscus
              repo={NEXT_PUBLIC_GISCUS_REPO}
              repoId={NEXT_PUBLIC_GISCUS_REPO_ID}
              category={NEXT_PUBLIC_GISCUS_CATEGORY}
              categoryId={NEXT_PUBLIC_GISCUS_CATEGORY_ID}
            />
          </div>
        ) : (
          <div className="mt-8 text-sm text-slate-600 dark:text-slate-400 text-center p-8 bg-slate-100 dark:bg-slate-800/50 rounded-3xl backdrop-blur-sm">
            请在环境变量中配置 Giscus 相关信息以启用评论。
          </div>
        )}
      </div>
    </article>
  );
};

export default async function PostPage({ params }: Props) {
  const resolvedParams = await params;
  
  if (!resolvedParams?.slug) {
    notFound();
  }

  let post;
  try {
    post = await getPostBySlug(resolvedParams.slug);
  } catch (error) {
    console.error("Error loading post:", error);
    notFound();
  }

  if (!post) {
    notFound();
  }
    
  return (
    <ErrorBoundary>
      <PostContent post={post} />
      {/* client-only: trigger read increment */}
      <ClientEntry slug={resolvedParams.slug} />
    </ErrorBoundary>
  );
}