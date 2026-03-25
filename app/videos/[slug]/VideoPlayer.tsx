'use client';

import ReactPlayer from 'react-player';

export default function VideoPlayer({ url }: { url: string }) {
  return (
    <div className="relative w-full aspect-video overflow-hidden rounded-2xl border border-(--card-border) bg-black/70">
      <ReactPlayer src={url} controls width="100%" height="100%" playsInline />
    </div>
  );
}
