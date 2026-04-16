import Link from 'next/link';
import TagBadge from '../components/TagBadge';
import { getAllScripts } from '../../lib/scripts';

export const dynamic = 'force-static';
export const revalidate = 3600;

export const metadata = {
  title: '脚本',
  description: '实用脚本列表，按标题和标签快速浏览。',
};

export default async function ScriptsPage() {
  const scripts = await getAllScripts();

  return (
    <section className="pt-16 px-4 sm:px-6">
      <div className="mx-auto w-full max-w-5xl px-4">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">实用脚本</h1>
          <p className="mt-2 text-(--muted-foreground)">长条列表展示，快速查看标题和标签。</p>
        </div>

        {scripts.length === 0 ? (
          <div className="rounded-xl border border-(--card-border) bg-(--surface-soft) p-6 text-(--muted-foreground)">
            还没有脚本，先在根目录下的 scripts 文件夹里添加 .md 文件吧。
          </div>
        ) : (
          <div className="space-y-3">
            {scripts.map((script) => (
              <Link
                key={script.slug}
                href={`/scripts/${script.slug}`}
                className="block rounded-xl border border-(--card-border) bg-(--surface-soft) px-5 py-4 hover:bg-(--surface-strong) transition-colors"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-lg font-semibold text-foreground">{script.meta.title}</h2>
                  <TagBadge tags={script.meta.tags} maxTags={4} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
