import PrefixedImage from './PrefixedImage';

const CustomImg = ({
  src,
  alt,
  loading,
}: {
  src?: string;
  alt?: string;
  loading?: 'eager' | 'lazy';
}) => {
  if (!src) return null;

  let width = 200;
  let height = 200;
  let realAlt = alt || '';

  // 尝试从 alt 中提取 "描述|宽x高"
  if (alt && alt.includes('|')) {
    const [desc, size] = alt.split('|');
    realAlt = desc;
    const match = size?.match(/^(\d+)x(\d+)$/);
    if (match) {
      width = parseInt(match[1], 10);
      height = parseInt(match[2], 10);
    }
  }

  return (
    <PrefixedImage
      src={src}
      alt={realAlt}
      width={width}
      height={height}
      loading={loading}
      style={{ maxWidth: '100%', height: 'auto' }}
    />
  );
};

export default CustomImg;