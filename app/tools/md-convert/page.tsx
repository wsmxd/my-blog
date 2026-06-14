'use client';

import { useState, useRef } from 'react';
import MarkdownRenderer from '@/app/components/MarkdownRenderer';

const INDEPENDENT_CSS = `
  body { background: #ffffff !important; margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; color: #24292e; line-height: 1.6; }
  .print-content { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; line-height: 1.6; color: #24292e; background: #ffffff; }
  .print-content blockquote, .print-content details, .print-content dl, .print-content ol, .print-content p, .print-content pre, .print-content table, .print-content ul { margin-top: 0; margin-bottom: 16px; break-inside: avoid; page-break-inside: avoid; }
  .print-content h1, .print-content h2, .print-content h3, .print-content h4, .print-content h5, .print-content h6 { color: #24292e; font-weight: 600; margin-top: 24px; margin-bottom: 16px; break-after: avoid; page-break-after: avoid; break-inside: avoid; page-break-inside: avoid; }
  .print-content h1, .print-content h2 { border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; }
  .print-content table { border-collapse: collapse; width: 100%; margin-bottom: 16px; }
  .print-content table th, .print-content table td { border: 1px solid #dfe2e5; padding: 6px 13px; }
  .print-content table tr { break-inside: avoid; page-break-inside: avoid; }
  .print-content table tr:nth-child(2n) { background-color: #f6f8fa; }
  .print-content pre { background: #f6f8fa; padding: 16px; overflow: auto; border-radius: 6px; margin-bottom: 16px; }
  .print-content pre code { color: #24292e; background: none; padding: 0; border: none; font-size: 85%; line-height: 1.45; }
  .print-content code { background: rgba(27,31,35,0.05); padding: 0.2em 0.4em; border-radius: 3px; font-family: Consolas, monospace; color: #24292e; font-size: 85%; }
  .print-content img { max-width: 100%; box-sizing: content-box; background-color: #fff; }
  .print-content blockquote { border-left: 4px solid #dfe2e5; padding: 0 1em; color: #6a737d; break-inside: avoid; page-break-inside: avoid; }
  .print-content li { break-inside: avoid; page-break-inside: avoid; }
  .print-content a { color: #0366d6; text-decoration: none; }
  .hljs-comment, .hljs-quote { color: #6a737d; }
  .hljs-keyword, .hljs-selector-tag, .hljs-addition { color: #d73a49; }
  .hljs-number, .hljs-string, .hljs-meta .hljs-meta-string, .hljs-literal, .hljs-doctag, .hljs-regexp { color: #032f62; }
  .hljs-title, .hljs-section, .hljs-name, .hljs-selector-id, .hljs-selector-class { color: #6f42c1; }
  .hljs-attribute, .hljs-attr, .hljs-variable, .hljs-template-variable, .hljs-class .hljs-title, .hljs-type { color: #e36209; }
  .hljs-symbol, .hljs-bullet, .hljs-subst, .hljs-meta, .hljs-meta .hljs-keyword, .hljs-selector-attr, .hljs-selector-pseudo, .hljs-link { color: #005cc5; }
  .hljs-built_in, .hljs-deletion { color: #b31d28; }
`;

export default function MdConvertPage() {
  const [markdown, setMarkdown] = useState('');
  const previewRef = useRef<HTMLDivElement>(null);

  const exportWord = () => {
    if (!previewRef.current) return;
    const htmlContent = previewRef.current.innerHTML;
    const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>文档导出</title>
        <style>${INDEPENDENT_CSS}</style>
      </head>
      <body>`;
    const footer = `</body></html>`;
    const sourceHTML = header + htmlContent + footer;
    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = 'document.doc';
    fileDownload.click();
    document.body.removeChild(fileDownload);
  };

  const exportPDF = () => {
    if (!previewRef.current) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = previewRef.current.innerHTML;
    const printDoc = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>导出 PDF</title>
  <style>
    @page { size: A4; margin: 15mm; }
    body { background: #ffffff; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; color: #24292e; line-height: 1.6; }
    .print-content { padding: 0; }
    .print-content blockquote, .print-content details, .print-content dl, .print-content ol, .print-content p, .print-content pre, .print-content table, .print-content ul { margin-top: 0; margin-bottom: 16px; break-inside: avoid; page-break-inside: avoid; }
    .print-content h1, .print-content h2, .print-content h3, .print-content h4, .print-content h5, .print-content h6 { color: #24292e; font-weight: 600; margin-top: 24px; margin-bottom: 16px; break-after: avoid; page-break-after: avoid; break-inside: avoid; page-break-inside: avoid; }
    .print-content h1, .print-content h2 { border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; }
    .print-content table { border-collapse: collapse; width: 100%; margin-bottom: 16px; }
    .print-content table th, .print-content table td { border: 1px solid #dfe2e5; padding: 6px 13px; }
    .print-content table tr:nth-child(2n) { background-color: #f6f8fa; }
    .print-content pre { background: #f6f8fa; padding: 16px; overflow: auto; border-radius: 6px; margin-bottom: 16px; }
    .print-content pre code { color: #24292e; background: none; padding: 0; border: none; font-size: 85%; line-height: 1.45; }
    .print-content code { background: rgba(27,31,35,0.05); padding: 0.2em 0.4em; border-radius: 3px; font-family: Consolas, monospace; color: #24292e; font-size: 85%; }
    .print-content img { max-width: 100%; box-sizing: content-box; background-color: #fff; break-inside: avoid; page-break-inside: avoid; }
    .print-content blockquote { border-left: 4px solid #dfe2e5; padding: 0 1em; color: #6a737d; break-inside: avoid; page-break-inside: avoid; }
    .print-content li { break-inside: avoid; page-break-inside: avoid; }
    .print-content a { color: #0366d6; text-decoration: none; }
    .hljs-comment, .hljs-quote { color: #6a737d; }
    .hljs-keyword, .hljs-selector-tag, .hljs-addition { color: #d73a49; }
    .hljs-number, .hljs-string, .hljs-meta .hljs-meta-string, .hljs-literal, .hljs-doctag, .hljs-regexp { color: #032f62; }
    .hljs-title, .hljs-section, .hljs-name, .hljs-selector-id, .hljs-selector-class { color: #6f42c1; }
    .hljs-attribute, .hljs-attr, .hljs-variable, .hljs-template-variable, .hljs-class .hljs-title, .hljs-type { color: #e36209; }
    .hljs-symbol, .hljs-bullet, .hljs-subst, .hljs-meta, .hljs-meta .hljs-keyword, .hljs-selector-attr, .hljs-selector-pseudo, .hljs-link { color: #005cc5; }
    .hljs-built_in, .hljs-deletion { color: #b31d28; }
  </style>
</head>
<body>
  <div class="print-content">${htmlContent}</div>
</body>
</html>`;

    printWindow.document.write(printDoc);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        setMarkdown(content);
      }
    };
    reader.readAsText(file);
    
    // 清空 input 的 value，确保下次可以上传同一个文件
    e.target.value = '';
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl pt-24 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Markdown 转换器</h1>
          <p className="text-gray-500 mt-2">在客户端将 Markdown 文本转换为 PDF 或 Word 文档</p>
        </div>
        <div className="flex gap-4">
          <label className="cursor-pointer px-4 py-2 bg-zinc-600 text-white rounded hover:bg-zinc-700 transition-colors shadow-sm inline-block">
            上传 MD
            <input type="file" accept=".md,.markdown" className="hidden" onChange={handleFileUpload} />
          </label>
          <button 
            onClick={exportWord}
            disabled={!markdown}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            导出 Word
          </button>
          <button 
            onClick={exportPDF}
            disabled={!markdown}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            导出 PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[65vh] min-h-[500px]">
        {/* Editor */}
        <div className="flex flex-col h-full border rounded-lg overflow-hidden border-(--header-border) bg-(--header-bg) shadow-sm">
          <div className="bg-gray-100 dark:bg-zinc-800/50 px-4 py-3 border-b border-(--header-border) font-medium text-sm text-gray-700 dark:text-gray-300">
            编辑器
          </div>
          <textarea
            className="flex-1 w-full p-4 resize-none outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-transparent"
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder="在此粘贴或输入 Markdown 内容..."
          />
        </div>

        {/* Preview */}
        <div className="flex flex-col h-full border rounded-lg overflow-hidden border-(--header-border) bg-white dark:bg-zinc-900 shadow-sm">
          <div className="bg-gray-100 dark:bg-zinc-800/50 px-4 py-3 border-b border-(--header-border) font-medium text-sm text-gray-700 dark:text-gray-300">
            预览 (PDF/Word 将以此格式输出)
          </div>
          <div className="flex-1 overflow-auto p-6 lg:p-8">
            <div ref={previewRef} className="print-content text-black dark:text-zinc-100">
              {markdown ? (
                <MarkdownRenderer content={markdown} />
              ) : (
                <div className="text-gray-400 italic text-center h-full flex flex-col items-center justify-center">
                  预览区
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}