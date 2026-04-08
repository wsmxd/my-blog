import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import CustomImg from "./CustomImg";

const rehypeHighlightPlugin = rehypeHighlight as any;

export default function MarkdownRenderer({ content }: { content: string }) {
  return (
    // prose prose-slate dark:prose-invert这些样式会导致在浏览器中内容显示被限制在了一定的宽度，而导致右边有很多空白
    <article className="markdown-body max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeSlug,
          [
            rehypeAutolinkHeadings,
            {
              behavior: "append",
              properties: {
                className: ["heading-anchor"],
                ariaLabel: "Link to this section",
              },
              content: {
                type: "text",
                value: " #",
              },
            },
          ],
          rehypeHighlightPlugin,
        ]}
        components={{
          img({ src, alt }: { src?: string; alt?: string; width?: string | number; height?: string | number }) {
            return <CustomImg src={src} alt={alt} />;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}