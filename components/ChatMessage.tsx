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
  <div className="absolute -bottom-8 right-2 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
    <button onClick={onRetry} className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10">
      <RefreshCwIcon className="h-4 w-4" />
    </button>
    {isUser && onEdit && (
      <button onClick={onEdit} className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10">
        <EditIcon className="h-4 w-4" />
      </button>
    )}
    <button onClick={onCopy} className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10">
      {copied ? <CheckIcon className="h-4 w-4 text-green-500" /> : <CopyIcon className="h-4 w-4" />}
    </button>
  </div>
);

export function UserMessage({ message, theme, onRetry, onEdit }: UserMessageProps) {
  const { copied, copy } = useCopyToClipboard();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);

  return (
    <div className="group relative my-12 flex justify-end">
      <div className={`p-4 max-w-xs rounded-lg ${theme === 'dark' ? 'bg-white/5 text-white' : 'bg-pink-400/10 text-black'}`}>
        {isEditing ? (
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onEdit(message.id, editedContent);
                setIsEditing(false);
              }
            }}
            className="focus:outline-none"
            rows={1}
          />
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
      <div className="p-4 rounded-lg my-12 text-white opacity-90">
        <div className="prose prose-sm dark:prose-invert max-w-none !text-white break-words">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code: (props) => (
                <CodeBlock {...props} theme={theme} onRetry={onRetry} />
              ),
              p: ({...props}) => <p className={`${theme === 'dark' ? '!text-white' : '!text-black'}`} {...props} />,
              h1: ({...props}) => <h1 className={`${theme === 'dark' ? '!text-white' : '!text-black'}`} {...props} />,
              h2: ({...props}) => <h2 className={`${theme === 'dark' ? '!text-white' : '!text-black'}`} {...props} />,
              h3: ({...props}) => <h3 className={`${theme === 'dark' ? '!text-white' : '!text-black'}`} {...props} />,
              h4: ({...props}) => <h4 className={`${theme === 'dark' ? '!text-white' : '!text-black'}`} {...props} />,
              h5: ({...props}) => <h5 className={`${theme === 'dark' ? '!text-white' : '!text-black'}`} {...props} />,
              h6: ({...props}) => <h6 className={`${theme === 'dark' ? '!text-white' : '!text-black'}`} {...props} />,
              li: ({...props}) => <li className={`${theme === 'dark' ? '!text-white' : '!text-black'}`} {...props} />,
              a: ({...props}) => <a className={`${theme === 'dark' ? '!text-white' : '!text-black'}`} {...props} />,
              strong: ({...props}) => <strong className={`${theme === 'dark' ? '!text-white' : '!text-black'}`} {...props} />,
              span: ({...props}) => <span className={`${theme === 'dark' ? '!text-white' : '!text-black'}`} {...props} />,
              pre: ({...props}) => <pre className={`${theme === 'dark' ? '!bg-transparent p-0 m-0' : '!bg-transparent p-0 m-0'}`} {...props} />,
            }}
          >
            {message.content}
          </ReactMarkdown>
          {isLoading && !message.content && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white/50 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-white/50 rounded-full animate-pulse [animation-delay:0.2s]"></div>
              <div className="w-2 h-2 bg-white/50 rounded-full animate-pulse [animation-delay:0.4s]"></div>
            </div>
          )}
        </div>
      </div>
      {!isLoading && message.content && <ActionButtons onCopy={() => copy(message.content)} onRetry={onRetry} isUser={false} copied={copied} />}
    </div>
  );
}