"use client";
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

type CodeRendererProps = {
  node?: unknown;
  inline?: boolean;
  className?: string;
  children: React.ReactNode;
};

const syntaxTheme = oneDark as unknown as { [key: string]: React.CSSProperties };

export default function MarkdownRenderer({ content }: { content: string }) {
  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
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
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}