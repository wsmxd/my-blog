export async function getTotalReads(): Promise<number> {
  try {
    const { getAllPosts } = await import('./posts');
    const { upstashGet } = await import('./upstash');
    const posts = await getAllPosts();
    const counts = await Promise.all(posts.map(async (p) => {
      try {
        const v = await upstashGet(`reads:${p.slug}`);
        return Number(v || 0);
      } catch (e) {
        console.error(e);
        return 0;
      }
    }));
    return counts.reduce((s, v) => s + v, 0);
  } catch (err) {
    console.error(err);
    return 0;
  }
}
