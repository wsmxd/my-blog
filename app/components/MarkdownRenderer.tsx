"use client";
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import CustomImg from "./CustomImg";

type CodeRendererProps = {
  node?: unknown;
  inline?: boolean;
  className?: string;
  children: React.ReactNode;
};

const syntaxTheme = oneDark as unknown as { [key: string]: React.CSSProperties };

export default function MarkdownRenderer({ content }: { content: string }) {
  return (
    // prose prose-slate dark:prose-invert这些样式会导致在浏览器中内容显示被限制在了一定的宽度，而导致右边有很多空白
    <article className="markdown-body max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          [
            rehypeSanitize,
            {
              ...defaultSchema,
              attributes: {
                ...defaultSchema.attributes,
                code: [...(defaultSchema.attributes?.code || []), "className"],
                pre:  [...(defaultSchema.attributes?.pre  || []), "className"],
              },
            },
          ],
        ]}
        components={{
          code({ inline, className, children }: CodeRendererProps) {
            const match = /language-(\w+)/.exec(className || "");
            if (!inline && match) {
              return (
                <SyntaxHighlighter
                  style={syntaxTheme}
                  language={match[1]}
                  PreTag="div"
                >
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              );
            }
            return <code className={className}>{children}</code>;
          },
          img({ src, alt }: { src?: string; alt?: string; width?: string | number; height?: string | number }) {
            return (
              CustomImg({ src, alt })
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}