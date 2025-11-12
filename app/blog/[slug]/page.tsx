import { getPostBySlug } from "../../../lib/posts";
import MarkdownRenderer from "../../components/MarkdownRenderer";
import Giscus from "../../components/Giscus";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ slug: string }> | { slug: string };
};

import { ErrorBoundary } from "../../components/ErrorBoundary";

const PostContent = async ({ post }: { post: Awaited<ReturnType<typeof getPostBySlug>> }) => {
const {
  NEXT_PUBLIC_GISCUS_REPO,
  NEXT_PUBLIC_GISCUS_REPO_ID,
  NEXT_PUBLIC_GISCUS_CATEGORY,
  NEXT_PUBLIC_GISCUS_CATEGORY_ID,
} = process.env;
  return (
    <article className="pt-12">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">{post.meta.title}</h1>
        <p className="text-sm text-slate-500 mt-1">{post.meta.date}</p>
      </header>

      <MarkdownRenderer content={post.content} />

      {/* comments */}
      {NEXT_PUBLIC_GISCUS_REPO && NEXT_PUBLIC_GISCUS_REPO_ID && NEXT_PUBLIC_GISCUS_CATEGORY && NEXT_PUBLIC_GISCUS_CATEGORY_ID ? (
        <Giscus
          repo={NEXT_PUBLIC_GISCUS_REPO}
          repoId={NEXT_PUBLIC_GISCUS_REPO_ID}
          category={NEXT_PUBLIC_GISCUS_CATEGORY}
          categoryId={NEXT_PUBLIC_GISCUS_CATEGORY_ID}
        />
      ) : (
        <div className="mt-8 text-sm text-slate-500">
          请在环境变量中配置 Giscus 相关信息以启用评论。
        </div>
      )}
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
    </ErrorBoundary>
  );
}