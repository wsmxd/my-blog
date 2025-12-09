interface TagBadgeProps {
  tags?: string[];
  maxTags?: number;
}

export default function TagBadge({ tags, maxTags = 3 }: TagBadgeProps) {
  if (!tags || tags.length === 0) return null;

  const displayTags = tags.slice(0, maxTags);
  const remainingCount = tags.length - displayTags.length;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {displayTags.map((tag, index) => (
        <span
          key={index}
          className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-md bg-blue-500/10 text-blue-300 border border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-500/40 transition-all duration-300"
        >
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          {tag}
        </span>
      ))}
      {remainingCount > 0 && (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-slate-400">
          +{remainingCount}
        </span>
      )}
    </div>
  );
}
