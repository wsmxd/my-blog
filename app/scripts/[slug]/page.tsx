import { notFound } from 'next/navigation';
import MarkdownRenderer from '../../components/MarkdownRenderer';
import { getAllScripts, getScriptBySlug } from '../../../lib/scripts';

export const dynamic = 'force-static';
export const revalidate = 3600;

type Props = {
  params: Promise<{ slug: string }> | { slug: string };
};

export async function generateStaticParams() {
  const scripts = await getAllScripts();
  return scripts.map((script) => ({ slug: script.slug }));
}

export default async function ScriptDetailPage({ params }: Props) {
  const resolvedParams = await params;

  if (!resolvedParams.slug) {
    notFound();
  }

  let script;
  try {
    script = await getScriptBySlug(resolvedParams.slug);
  } catch (error) {
    console.error('Error loading script:', error);
    notFound();
  }

  if (!script) {
    notFound();
  }

  return (
    <article className="pt-12 max-w-4xl mx-auto relative overflow-x-hidden w-full">
      <header className="mb-8 pb-6 border-slate-200 dark:border-slate-700/50 border-b">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3 text-foreground">{script.meta.title}</h1>
        <div className="flex flex-wrap gap-2 text-sm text-(--muted-foreground)">
          {(script.meta.tags || []).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2.5 py-1 rounded-full border border-(--tag-border) bg-(--tag-bg) text-(--tag-text)"
            >
              {tag}
            </span>
          ))}
        </div>
      </header>

      <div className="prose-container bg-white dark:bg-slate-900/50 rounded-3xl p-6 sm:p-8 lg:p-12 shadow-none dark:shadow-xl backdrop-blur-lg border-slate-100 dark:border-slate-700/30 border relative overflow-hidden">
        <MarkdownRenderer content={script.content} />
      </div>
    </article>
  );
}
