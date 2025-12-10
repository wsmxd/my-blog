// lib/upstash.ts
import { Redis } from '@upstash/redis';

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL ?? process.env.UPSTASH_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.UPSTASH_REST_TOKEN;

if (!UPSTASH_URL || !UPSTASH_TOKEN) {
  // 不要在生产环境把 token 打到日志，仅用于开发调试时参考
  // throw new Error('Upstash not configured'); // 可在需要时抛出
}

const redis = UPSTASH_URL && UPSTASH_TOKEN ? new Redis({ url: UPSTASH_URL, token: UPSTASH_TOKEN }) : null;

export async function upstashIncr(key: string, amount = 1): Promise<number> {
  if (!redis) throw new Error('Upstash not configured');
  // 大多数情况下 client 支持 incrby 或 incr
  // 使用 INCRBY 命令
  const res = await (redis.incrby?.(key, amount) ?? redis.incr?.(key));
  return Number(res ?? 0);
}

export async function upstashGet(key: string): Promise<number> {
  const res = await fetch(
    `${UPSTASH_URL}/get/${encodeURIComponent(key)}`,
    {
      headers: {
        Authorization: `Bearer ${UPSTASH_TOKEN}`,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 60 }, // 👈 关键：允许缓存 60 秒
    }
  );

  if (!res.ok) {
    console.error('Upstash get failed', await res.text());
    return 0;
  }

  const data = await res.json();
  return Number(data.result ?? 0);
}

export async function upstashMGet(keys: string[]): Promise<number[]> {
  if (!redis) throw new Error('Upstash not configured');
  if (!keys.length) return [];
  // SDK 支持 mget
  const vals = await (redis.mget?.(...keys) ?? Promise.all(keys.map((k) => redis.get(k))));
  return keys.map((_, i) => Number(vals[i] ?? 0));
}