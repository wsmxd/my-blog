import { NextResponse } from 'next/server';

// 仅用于调试：返回运行时是否能读取到 Upstash 的 URL 和 TOKEN（布尔值）
// 切勿在生产长期保留此路由；确认后请删除
export async function GET() {
  const hasUrl = Boolean(process.env.UPSTASH_REDIS_REST_URL ?? process.env.UPSTASH_REST_URL);
  const hasToken = Boolean(process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.UPSTASH_REST_TOKEN);
  return NextResponse.json({ upstash_env_present: hasUrl && hasToken, hasUrl, hasToken });
}
