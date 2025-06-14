// components/ChatMessage.tsx
"use client";
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '@/types';
import { CodeBlock } from './CodeBlock';
import { CopyIcon, EditIcon, RefreshCwIcon, CheckIcon } from './Icons';

interface MessageProps {
  message: Message;
  theme: string;
  onRetry: () => void;
}

interface UserMessageProps extends MessageProps {
  onEdit: (messageId: string, newContent: string) => void;
}

const useCopyToClipboard = () => {
  const [copied, setCopied] = useState(false);

  const copy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return { copied, copy };
};

const ActionButtons = ({ onCopy, onRetry, onEdit, isUser, copied }: { onCopy: () => void; onRetry: () => void; onEdit?: () => void; isUser: boolean; copied: boolean }) => (
  <div className="absolute -bottom-8 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 dark:text-gray-400">
    <button onClick={onRetry} className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10" title="Retry">
      <RefreshCwIcon className="h-4 w-4" />
    </button>
    {isUser && onEdit && (
      <button onClick={onEdit} className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10" title="Edit">
        <EditIcon className="h-4 w-4" />
      </button>
    )}
    <button onClick={onCopy} className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10" title="Copy">
      {copied ? <CheckIcon className="h-4 w-4 text-green-500" /> : <CopyIcon className="h-4 w-4" />}
    </button>
  </div>
);

export function UserMessage({ message, theme, onRetry, onEdit }: UserMessageProps) {
  const { copied, copy } = useCopyToClipboard();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);

  const handleSaveEdit = () => {
    if (editedContent.trim() && editedContent !== message.content) {
      onEdit(message.id, editedContent);
    }
    setIsEditing(false);
  };

  return (
    <div className="group relative flex justify-end">
      <div className={`p-4 max-w-2xl w-full rounded-lg ${theme === 'dark' ? 'bg-white/5 text-white' : 'bg-pink-400/10 text-black'}`}>
        {isEditing ? (
          <div className="flex flex-col gap-2">
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className={`w-full p-2 rounded-md bg-transparent border ${theme === 'dark' ? 'border-white/20' : 'border-black/20'} focus:outline-none focus:ring-1 ${theme === 'dark' ? 'focus:ring-pink-400' : 'focus:ring-pink-600'}`}
              rows={Math.min(10, editedContent.split('\n').length + 1)}
              autoFocus
            />
            <div className="flex justify-end gap-2 text-sm">
                <button onClick={() => setIsEditing(false)} className={`px-3 py-1 rounded-md ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-black/10'}`}>Cancel</button>
                <button onClick={handleSaveEdit} className={`px-3 py-1 rounded-md font-semibold text-white ${theme === 'dark' ? 'bg-pink-600 hover:bg-pink-700' : 'bg-pink-500 hover:bg-pink-600'}`}>Save & Submit</button>
            </div>
          </div>
        ) : (
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        )}
      </div>
      {!isEditing && <ActionButtons onCopy={() => copy(message.content)} onRetry={onRetry} onEdit={() => setIsEditing(true)} isUser={true} copied={copied} />}
    </div>
  );
}

interface AIMessageProps extends MessageProps {
  isLoading: boolean;
}

export function AIMessage({ message, theme, onRetry, isLoading }: AIMessageProps) {
  const { copied, copy } = useCopyToClipboard();

  return (
    <div className="group relative">
        <div className={`prose prose-sm max-w-none break-words ${theme === 'dark' ? 'prose-invert text-white' : 'text-black'}`}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code: (props) => <CodeBlock {...props} theme={theme} onRetry={onRetry} />,
              p: ({...props}) => <p className="mb-4" {...props} />,
            }}
          >
            {message.content}
          </ReactMarkdown>
          {isLoading && !message.content && (
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${theme === 'dark' ? 'bg-white/50' : 'bg-black/50'}`}></div>
              <div className={`w-2 h-2 rounded-full animate-pulse [animation-delay:0.2s] ${theme === 'dark' ? 'bg-white/50' : 'bg-black/50'}`}></div>
              <div className={`w-2 h-2 rounded-full animate-pulse [animation-delay:0.4s] ${theme === 'dark' ? 'bg-white/50' : 'bg-black/50'}`}></div>
            </div>
          )}
      </div>
      {!isLoading && message.content && <ActionButtons onCopy={() => copy(message.content)} onRetry={onRetry} isUser={false} copied={copied} />}
    </div>
  );
}