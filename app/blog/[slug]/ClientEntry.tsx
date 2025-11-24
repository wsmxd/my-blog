// app/blog/[slug]/ClientEntry.tsx
'use client';
import ReadTracker from './ReadTracker';

export default function ClientEntry({ slug }: { slug: string }) {
  return <ReadTracker slug={slug} />;
}