'use client';

import PlayTracker from './PlayTracker';

export default function ClientEntry({ slug }: { slug: string }) {
  return <PlayTracker slug={slug} />;
}
