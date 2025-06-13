"use client";
import TopRightControls from '@/components/TopRightControls';
import WelcomeScreen from './WelcomeScreen';
import ChatInput from './ChatInput';
import TopRightCurve from '@/components/TopRightCurve';
import { useEffect, useState, useRef } from 'react';
import { Message } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { AIMessage, UserMessage } from './ChatMessage';
import { ChevronDownIcon } from './Icons';

interface ChatAreaProps {
  onToggleTheme: () => void;
  theme: "light" | "dark";
  sidebarState: 'expanded' | 'collapsed';
  firstPrompt: boolean;
  setFirstPrompt: (firstPrompt: boolean) => void;
}

export default function ChatArea({ onToggleTheme, theme, sidebarState, firstPrompt, setFirstPrompt }: ChatAreaProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  };

  useEffect(() => {
    if (!isLoading) {
      scrollToBottom();
    }
  }, [messages, isLoading]);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      setShowScrollButton(scrollHeight - scrollTop - clientHeight > 300);
    }
  };
  
  const streamAndSetAiResponse = async (promptContent: string, aiMessageIdToUpdate: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptContent }),
      });

      if (!response.body) {
        throw new Error("Response body is null");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let streamedContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        streamedContent += decoder.decode(value, { stream: true });
        setMessages(prev => prev.map(msg => 
          msg.id === aiMessageIdToUpdate ? { ...msg, content: streamedContent } : msg
        ));
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setMessages(prev => prev.map(msg => 
        msg.id === aiMessageIdToUpdate ? { ...msg, content: 'Sorry, I encountered an error. Please try again.' } : msg
      ));
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  };

  const handleSend = async (messageContent: string) => {
    if (!messageContent.trim()) return;

    const userMessage: Message = { id: uuidv4(), role: 'user', content: messageContent };
    const aiMessageId = uuidv4();
    const newAiMessage: Message = { id: aiMessageId, role: 'model', content: '' };

    setMessages(prev => [...prev, userMessage, newAiMessage]);
    setInput('');
    setFirstPrompt(true);
    
    await streamAndSetAiResponse(messageContent, aiMessageId);
  };
  
  const handleRetry = (index: number) => {
    const userMessageContent = messages[index].content;
    const messagesToRetry = messages.slice(0, index);
    setMessages(messagesToRetry);
    handleSend(userMessageContent);
  };
  
  const handleEdit = async (originalUserMessageId: string, newContent: string) => {
    if (!newContent.trim()) return;

    const newAiMessageId = uuidv4();

    setMessages(prevMessages => {
      const userMessageIndex = prevMessages.findIndex(msg => msg.id === originalUserMessageId);
      if (userMessageIndex === -1) {
        console.warn(`Message with id ${originalUserMessageId} not found for editing.`);
        return prevMessages; 
      }

      let updatedMessages = [...prevMessages];
      updatedMessages[userMessageIndex] = { ...updatedMessages[userMessageIndex], content: newContent };

      if (userMessageIndex + 1 < updatedMessages.length && updatedMessages[userMessageIndex + 1].role === 'model') {
        updatedMessages.splice(userMessageIndex + 1, 1);
      }
      
      const newAiPlaceholder: Message = { id: newAiMessageId, role: 'model', content: '' };
      updatedMessages.splice(userMessageIndex + 1, 0, newAiPlaceholder);
      
      return updatedMessages;
    });

    await streamAndSetAiResponse(newContent, newAiMessageId);
  };

  const showWelcome = messages.length === 0;
  
  return (
    <main className={`firefox-scrollbar-margin-fix relative flex w-full h-full flex-col overflow-hidden transition-[width,height] ${sidebarState === 'expanded' ? 'mt-4' : ''}`}>
      <div className={`absolute bottom-0 ${sidebarState === 'expanded' ? 'top-0' : 'top-0'} w-full overflow-hidden border-l border-t border-chat-border ${theme === 'dark' ? 'bg-[#211C26]' : 'bg-[#FBF5FA]'} bg-fixed pb-[140px] transition-all ease-snappy max-sm:border-none sm:translate-y-3.5 ${sidebarState === 'expanded' ? 'sm:rounded-tl-xl' : ''}`}>
        <div className="bg-noise absolute inset-0 -top-3.5 bg-fixed transition-transform ease-snappy [background-position:right_bottom]"></div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 w-full z-2 mt-4">
        <div className="fixed right-0 top-0 max-sm:hidden">
          {sidebarState === 'expanded' && (
            <TopRightCurve theme={theme} />
          )}
        </div>
        <ChatInput 
          theme={theme} 
          prompt={input} 
          setPrompt={setInput}
          isLoading={isLoading}
          onSend={() => handleSend(input)}
          firstPrompt={firstPrompt}
          sidebarState={sidebarState}
        />
      </div>

      <div ref={scrollRef} onScroll={handleScroll} className={`absolute inset-0 overflow-y-scroll overflow-x-hidden sm:pt-3.5 ${sidebarState === 'expanded' ? '' : 'mt-4'}`} style={{ paddingBottom: '144px', scrollbarGutter: 'stable both-edges' }}>
        <TopRightControls onToggleTheme={onToggleTheme} sidebarState={sidebarState} theme={theme} />
        
        <div role="log" aria-label="Chat messages" aria-live="polite" className="px-2">
          {showWelcome ? (
            <WelcomeScreen theme={theme} setPrompt={setInput} />
          ) : (
            <div className="mx-auto max-w-3xl space-y-6 mb-32">
              {messages.map((msg, index) => 
                msg.role === 'user' ? (
                  <UserMessage key={msg.id} message={msg} theme={theme} onRetry={() => handleRetry(index)} onEdit={(messageId, newContent) => handleEdit(messageId, newContent)} />
                ) : (
                  <AIMessage key={msg.id} message={msg} theme={theme} onRetry={() => handleRetry(index - 1)} isLoading={isLoading && index === messages.length - 1} />
                )
              )}
            </div>
          )}
        </div>
      </div>

      {showScrollButton && (
        <div className="absolute bottom-[140px] inset-x-0 z-20 flex justify-center">
          <button
            onClick={scrollToBottom}
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