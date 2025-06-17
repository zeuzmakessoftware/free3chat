"use client";
import TopRightControls from '@/components/TopRightControls';
import WelcomeScreen from './WelcomeScreen';
import ChatInput from './ChatInput';
import type { Model } from '@/lib/models';
import TopRightCurve from '@/components/TopRightCurve';
import { useEffect, useState, useRef } from 'react';
import { Message } from '@/types';
import { AIMessage, UserMessage } from './ChatMessage';
import { ChevronDownIcon } from './Icons';

interface ChatAreaProps {
  onToggleTheme: () => void;
  theme: string;
  sidebarState: 'expanded' | 'collapsed';
  firstPrompt: boolean;
  setFirstPrompt: (firstPrompt: boolean) => void;
  messages?: Message[];
  isLoading?: boolean;
  onSendMessage?: (content: string) => Promise<void>;
  onRetry?: (messageId: string) => Promise<void>;
  onEdit?: (originalUserMessageId: string, newContent: string) => Promise<void>;
  isHome?: boolean;
  activeModel?: Model;
  onModelSelect?: (model: Model) => void;
}

export default function ChatArea({ 
  onToggleTheme, 
  theme, 
  sidebarState, 
  firstPrompt, 
  setFirstPrompt,
  messages = [],
  isLoading = false,
  onSendMessage,
  onRetry,
  onEdit,
  isHome,
  activeModel,
  onModelSelect,
}: ChatAreaProps) {
  const [input, setInput] = useState('');
  const [showScrollButton, setShowScrollButton] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (behavior: 'smooth' | 'auto' = 'smooth') => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior });
  };

  useEffect(() => {
      if(messages.length > 0) {
        scrollToBottom('auto');
      }
  }, []); 

  useEffect(() => {
    if (!isLoading) {
      scrollToBottom('smooth');
    }
  }, [messages, isLoading]);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      setShowScrollButton(scrollHeight - scrollTop - clientHeight > 300);
    }
  };
  
  const handleSend = async (content: string) => {
    if (!content.trim() || !onSendMessage || isLoading) return;
    setInput('');
    setFirstPrompt(false);
    await onSendMessage(content);
  };
    
  return (
    <main className={`firefox-scrollbar-margin-fix relative flex w-full h-full flex-col overflow-hidden transition-[width,height] ${sidebarState === 'expanded' ? 'mt-4' : ''}`}>
      <div className={`absolute bottom-0 ${sidebarState === 'expanded' ? 'top-0' : 'top-0'} w-full overflow-hidden border-l border-t border-chat-border ${theme === 'dark' ? 'bg-[#211C26]' : 'bg-[#FBF5FA]'} bg-fixed pb-[140px] transition-all ease-snappy max-sm:border-none sm:translate-y-3.5 ${sidebarState === 'expanded' ? 'sm:rounded-tl-xl' : ''}`}>
        <div className="bg-noise absolute inset-0 -top-3.5 bg-fixed transition-transform ease-snappy [background-position:right_bottom]"></div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 w-full z-20 mt-4">
        <div className="fixed right-0 top-0 max-sm:hidden">
          {sidebarState === 'expanded' && (
            <TopRightCurve theme={theme} />
          )}
        </div>
        {activeModel && onModelSelect && (
          <ChatInput 
            theme={theme} 
            prompt={input} 
            setPrompt={setInput}
            isLoading={isLoading}
            onSend={() => handleSend(input)}
            firstPrompt={firstPrompt}
            sidebarState={sidebarState}
            activeModel={activeModel}
            onModelSelect={onModelSelect}
          />
        )}
      </div>

      <div ref={scrollRef} onScroll={handleScroll} className={`absolute inset-0 overflow-y-scroll overflow-x-hidden sm:pt-3.5 ${sidebarState === 'expanded' ? '' : 'mt-4'}`} style={{ paddingBottom: '144px', scrollbarGutter: 'stable both-edges' }}>
        <TopRightControls onToggleTheme={onToggleTheme} sidebarState={sidebarState} theme={theme} />
        
        <div role="log" aria-label="Chat messages" aria-live="polite" className="px-2">
          {firstPrompt && isHome ? (
            <WelcomeScreen theme={theme} setPrompt={setInput} isHome={isHome} />
          ) : (
            <div className="mx-auto max-w-3xl space-y-12 mb-48 mt-12">
              {messages.map((msg, index) => 
                msg.role === 'user' ? (
                  <UserMessage key={msg.id} message={msg} theme={theme} onRetry={() => onRetry && onRetry(msg.id)} onEdit={(messageId, newContent) => onEdit && onEdit(messageId, newContent)} />
                ) : (
                  <AIMessage key={msg.id} message={msg} theme={theme} modelName={activeModel?.name || ''} onRetry={() => {
                      if (onRetry && index > 0 && messages[index - 1].role === 'user') {
                          onRetry(messages[index - 1].id);
                      }
                  }} isLoading={isLoading && index === messages.length - 1} />
                )
              )}
            </div>
          )}
        </div>
      </div>

      {showScrollButton && (
        <div className="absolute bottom-[140px] inset-x-0 z-20 flex justify-center">
          <button
            onClick={() => scrollToBottom('smooth')}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium shadow-lg transition-colors ${
              theme === 'dark'
                ? 'bg-[#2a2131] border !border-white/10 text-white/50 hover:bg-gray-700'
                : 'bg-pink-100 border border-[#2a2131] text-black/50 hover:bg-gray-200'
            }`}
          >
            Scroll to bottom
            <ChevronDownIcon className="h-4 w-4" />
          </button>
        </div>
      )}
    </main>
  );
}