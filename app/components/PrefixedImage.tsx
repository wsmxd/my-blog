import NextImage, { ImageProps } from 'next/image';

const BLOB_PREFIX = 'https://067srb2nq0mqarev.public.blob.vercel-storage.com/';

function withBlobPrefix(src: string): string {
  // absolute URLs or root-relative paths are kept as-is
  if (/^https?:\/\//i.test(src) || src.startsWith('/')) return src;
  // ensure no leading slashes and concatenate
  return BLOB_PREFIX + src.replace(/^\/+/, '');
}

export default function PrefixedImage(props: ImageProps) {
  const { src, ...rest } = props;
  const transformed = typeof src === 'string' ? withBlobPrefix(src) : src;
  return <NextImage src={transformed} {...rest} />;
}
