import { getPostBySlug, getAllPosts } from '../../../lib/posts';
import MarkdownRenderer from '../../components/MarkdownRenderer';
import Giscus from '../../components/Giscus';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import PrefixedImage from '../../components/PrefixedImage';
import { notFound } from 'next/navigation';
import ClientEntry from '../[slug]/ClientEntry';

export const dynamic = 'force-static';
export const revalidate = 3600;

type Props = {
  params: Promise<{ slug: string[] }> | { slug: string[] };
};

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({
    slug: post.slug.split('/'),
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
    <article className="pt-12 max-w-4xl mx-auto relative overflow-x-hidden w-full">
      <div className="absolute -top-20 -right-20 w-72 h-72 bg-purple-400/5 dark:bg-purple-900/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-40 -left-20 w-96 h-96 bg-blue-400/5 dark:bg-blue-900/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="mb-8 overflow-hidden rounded-[2rem] border border-(--card-border) bg-(--surface-soft) shadow-[0_24px_70px_-34px_rgba(15,23,42,0.55)]">
        <div className="relative aspect-[21/9] min-h-[220px] w-full">
          <PrefixedImage
            src={post.meta.cover || '/images/default-cover.svg'}
            alt={post.meta.title}
            fill
            priority
            loading="eager"
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 960px"
          />
          <div className="absolute inset-0 bg-linear-to-t from-slate-950/55 via-slate-950/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between gap-4 p-5 sm:p-6">
            <div className="max-w-[80%]">
              <p className="mb-2 inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur-md">
                图床封面
              </p>
              <p className="text-sm text-white/75 line-clamp-1">
                {post.meta.cover}
              </p>
            </div>
          </div>
        </div>
      </div>

      <header className="mb-8 pb-6 border-slate-200 dark:border-slate-700/50 border-b relative">
        <h1
          className="text-4xl sm:text-5xl font-bold mb-3 bg-clip-text text-transparent leading-tight"
          style={{
            backgroundImage: `linear-gradient(to right, var(--article-title-from), var(--article-title-via), var(--article-title-to))`,
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
        {post.meta.folder ? (
          <div className="mt-3">
            <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full border border-(--tag-border) bg-(--tag-bg) text-(--tag-text)">
              {post.meta.folder}
            </span>
          </div>
        ) : null}
      </header>

      <div className="prose-container bg-white dark:bg-slate-900/50 rounded-3xl p-6 sm:p-8 lg:p-12 shadow-none dark:shadow-xl backdrop-blur-lg border-slate-100 dark:border-slate-700/30 border relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/5 dark:bg-linear-to-br dark:from-blue-500/10 dark:to-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative">
          <MarkdownRenderer content={post.content} eagerImageCount={3} />
        </div>
      </div>

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
  const postSlug = Array.isArray(resolvedParams.slug) ? resolvedParams.slug.join('/') : resolvedParams.slug;

  if (!postSlug) {
    notFound();
  }

  let post;
  try {
    post = await getPostBySlug(postSlug);
  } catch (error) {
    console.error('Error loading post:', error);
    notFound();
  }

  if (!post) {
    notFound();
  }

  return (
    <ErrorBoundary>
      <PostContent post={post} />
      <ClientEntry slug={postSlug} />
    </ErrorBoundary>
  );
}