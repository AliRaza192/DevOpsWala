import React, {useState, useCallback} from 'react';
import {Copy, Check} from 'lucide-react';

export default function CopyMarkdownButton(): React.JSX.Element {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      // Get the article content
      const article = document.querySelector('article');
      if (!article) return;

      // Get the markdown source URL from the edit link or construct it
      const editLink = document.querySelector('a[class*="editThisPage"]') as HTMLAnchorElement | null;
      let markdownContent = '';

      if (editLink && editLink.href) {
        // Try to fetch the raw markdown
        const response = await fetch(editLink.href.replace('github.com', 'raw.githubusercontent.com').replace('/tree/main/', '/'));
        if (response.ok) {
          markdownContent = await response.text();
        }
      }

      if (!markdownContent) {
        // Fallback: copy the visible text content
        markdownContent = article.innerText;
      }

      await navigator.clipboard.writeText(markdownContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Silent fail
    }
  }, []);

  return (
    <button
      onClick={handleCopy}
      className={`copy-markdown-btn ${copied ? 'copied' : ''}`}
      title="Copy as Markdown">
      {copied ? (
        <>
          <Check size={14} />
          Copied!
        </>
      ) : (
        <>
          <Copy size={14} />
          Copy as Markdown
        </>
      )}
    </button>
  );
}
