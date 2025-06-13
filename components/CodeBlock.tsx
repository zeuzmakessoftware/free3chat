"use client";
import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CopyIcon, CheckIcon, RefreshCwIcon, WrapTextIcon } from './Icons';

interface CodeBlockProps {
  node?: unknown;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
  theme: string;
  onRetry: () => void;
}

export const CodeBlock = ({
  inline,
  className,
  children,
  theme,
  onRetry,
  ...props
}: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);
  const [wrap, setWrap] = useState(true);

  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : 'text';
  const codeText = String(children).replace(/\n$/, '');

  const handleCopy = () => {
    navigator.clipboard.writeText(codeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (inline) {
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  }

  return (
    <div className="relative text-sm my-4">
      <div
        className={`flex items-center justify-between rounded-t-md px-4 py-2 ${
          theme === 'dark' ? 'bg-white/10 text-gray-300' : 'bg-pink-500/20 text-gray-800'
        }`}
      >
        <span className="font-mono">{language}</span>
        <div className="flex items-center gap-2">
           <button onClick={() => setWrap(!wrap)} className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10" title="Toggle wrap">
             <WrapTextIcon className="h-4 w-4" />
           </button>
           <button onClick={onRetry} className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10" title="Retry">
             <RefreshCwIcon className="h-4 w-4" />
           </button>
           <button onClick={handleCopy} className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10" title="Copy code">
             {copied ? <CheckIcon className="h-4 w-4 text-green-500" /> : <CopyIcon className="h-4 w-4" />}
           </button>
        </div>
      </div>
      <SyntaxHighlighter
        style={atomDark}
        language={language}
        PreTag="pre"
        wrapLines={wrap}
        wrapLongLines={wrap}
        className={`${theme === 'dark' ? 'bg-white/10' : 'bg-pink-500/10'} !m-0 !p-4 !rounded-b-md shadow-none`}
        {...props}
      >
        {codeText}
      </SyntaxHighlighter>
    </div>
  );
};