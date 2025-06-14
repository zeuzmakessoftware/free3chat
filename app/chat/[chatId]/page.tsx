"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { getAnonymousId } from "@/lib/utils/anonymousId";
import Sidebar from "@/components/Sidebar";
import SidebarTrigger from "@/components/SidebarTrigger";
import ChatArea from "@/components/ChatArea";
import { Message } from "@/types";
import { ClockIcon } from "@/components/Icons";

const InitialLoadingSpinner = ({ theme }: { theme: string }) => (
  <div className="flex h-full w-full items-center justify-center">
    <div className="flex items-center space-x-2">
      <ClockIcon className={`h-6 w-6 animate-spin ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
      <span className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Loading chat...</span>
    </div>
  </div>
);


export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const [chatId, setChatId] = useState<string>(params.chatId as string);
  const [sidebarState, setSidebarState] = useState<"expanded" | "collapsed">("expanded");
  const [theme, setTheme] = useState("light");
  const [anonymousId, setAnonymousId] = useState<string>('');
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [pageStatus, setPageStatus] = useState<'pending' | 'loaded'>('pending');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isInitializing = useRef(false);
  const titleGenerated = useRef(false);

  useEffect(() => {
    const id = getAnonymousId();
    setAnonymousId(id);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const darkPref = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (saved) setTheme(saved);
    else if (darkPref) setTheme("dark");
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setSidebarState("collapsed");
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleSidebar = () => setSidebarState(s => s === "expanded" ? "collapsed" : "expanded");
  const toggleTheme = () => setTheme(t => t === "light" ? "dark" : "light");

  const handleSendMessage = useCallback(async (content: string, targetChatId: string, messageHistory?: Message[]) => {
    if (!content.trim() || !targetChatId) return;
    setIsLoading(true);
    setError(null);

    // Get the current messages state to work with
    // Important: Use the messageHistory parameter if provided, otherwise use the current messages state
    const currentMessages = messageHistory ? [...messageHistory] : [...messages];

    const optimisticUserMessage: Message = {
      id: `user-${Date.now()}`, chat_id: targetChatId, role: 'user', content: content, created_at: new Date().toISOString(),
    };
    const optimisticAiMessage: Message = {
      id: `model-${Date.now()}`, chat_id: targetChatId, role: 'model', content: '', created_at: new Date().toISOString(),
    };

    // Update messages with optimistic updates
    const updatedMessages = [...currentMessages, optimisticUserMessage, optimisticAiMessage];
    setMessages(updatedMessages);

    try {
      const msgResponse = await fetch(`/api/chats/${targetChatId}/messages?anonymousId=${anonymousId}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content }),
      });
      if (!msgResponse.ok) throw new Error('Failed to send message.');
      const { aiMessage: realAiMessage } = await msgResponse.json();

      // Update with real AI message ID - use a functional update to ensure we're working with the latest state
      setMessages(prev => {
        // Find the optimistic message in the current state
        const optimisticIndex = prev.findIndex(m => m.id === optimisticAiMessage.id);
        if (optimisticIndex === -1) return prev; // Safety check
        
        // Create a new array with all messages and replace the optimistic one
        const updated = [...prev];
        updated[optimisticIndex] = {...realAiMessage};
        return updated;
      });

      const streamResponse = await fetch(`/api/chats/${targetChatId}/messages/${realAiMessage.id}/stream`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ anonymousId }),
      });

      if (!streamResponse.ok || !streamResponse.body) throw new Error('Failed to get streaming response.');
      const reader = streamResponse.body.getReader();
      const decoder = new TextDecoder();
      
      // Stream the response
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        
        // Update messages with each chunk using a functional update to ensure we're working with the latest state
        setMessages(prev => {
          // Find the real AI message in the current state
          const messageIndex = prev.findIndex(msg => msg.id === realAiMessage.id);
          if (messageIndex === -1) return prev; // Safety check
          
          // Create a new array with all messages and update the content of the AI message
          const updated = [...prev];
          updated[messageIndex] = { 
            ...updated[messageIndex], 
            content: updated[messageIndex].content + chunk 
          };
          return updated;
        });
      }

      if (!titleGenerated.current && currentMessages.length < 2) {
        titleGenerated.current = true;
        fetch(`/api/chats/${targetChatId}/title`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ anonymousId }),
        }).then(() => window.dispatchEvent(new Event('chats-updated')));
      }

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred.');
    } finally {
      setIsLoading(false);
      window.dispatchEvent(new Event('chats-updated'));
    }
  }, [anonymousId, messages]); // Include messages in the dependency array

  const handleRetry = useCallback(async (userMessageId: string) => {
    // Find the message to retry
    const messageIndex = messages.findIndex(m => m.id === userMessageId);
    if (messageIndex === -1) return;
    
    // Get the content to retry and the history up to that point
    const contentToRetry = messages[messageIndex].content;
    const historyToRetry = [...messages.slice(0, messageIndex)];
    
    // Keep the history in state but add a loading indicator
    setIsLoading(true);
    
    // Send the message with the history
    await handleSendMessage(contentToRetry, chatId, historyToRetry);
  }, [messages, handleSendMessage, chatId]);

  const handleEdit = useCallback(async (userMessageId: string, newContent: string) => {
    // Find the message to edit
    const messageIndex = messages.findIndex(m => m.id === userMessageId);
    if (messageIndex === -1) return;
    
    // Get the history up to that point
    const historyToRetry = [...messages.slice(0, messageIndex)];
    
    // Keep the history in state but add a loading indicator
    setIsLoading(true);
    
    // Send the edited message with the history
    await handleSendMessage(newContent, chatId, historyToRetry);
  }, [messages, handleSendMessage, chatId]);
  
  const initializeChat = useCallback(async () => {
    if (!anonymousId) return;
    setPageStatus('pending');

    if (chatId === 'new') {
      const prompt = searchParams.get('prompt');
      if (!prompt) { router.replace('/'); return; }
      
      try {
        const res = await fetch('/api/chats', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ anonymousId }),
        });
        const { chat } = await res.json();
        if (!chat || !chat.id) throw new Error('Failed to create chat.');
        
        setChatId(chat.id);
        router.replace(`/chat/${chat.id}`, { scroll: false });
        window.dispatchEvent(new Event('chats-updated'));
        
        setPageStatus('loaded');
        await handleSendMessage(prompt, chat.id, []);

      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'An error occurred.');
        setPageStatus('loaded');
      }
    } else {
      try {
        const res = await fetch(`/api/chats/${chatId}/messages?anonymousId=${anonymousId}`);
        if (res.status === 404) { router.replace('/'); return; }
        if (!res.ok) throw new Error('Failed to fetch messages.');
        
        const { messages: fetchedMessages } = await res.json();
        setMessages(fetchedMessages || []);
        if (fetchedMessages && fetchedMessages.length > 0) {
            titleGenerated.current = true;
        }
        
        // Check if there's a prompt parameter to process after loading existing messages
        const prompt = searchParams.get('prompt');
        if (prompt && fetchedMessages) {
          // Wait a moment to ensure messages are rendered first
          setTimeout(() => {
            handleSendMessage(prompt, chatId, fetchedMessages);
          }, 100);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'An error occurred.');
      } finally {
        setPageStatus('loaded');
      }
    }
  }, [chatId, anonymousId, searchParams, router, handleSendMessage]);

  useEffect(() => {
    if (anonymousId && chatId && !isInitializing.current) {
      isInitializing.current = true;
      initializeChat();
    }
  }, [chatId, anonymousId, initializeChat]);
  
  useEffect(() => {
    setChatId(params.chatId as string);
    isInitializing.current = false;
  }, [params.chatId]);

  return (
    <div className={`relative flex h-screen w-full ${theme === 'dark' ? 'bg-[#1C151A]' : 'bg-[#F2E1F4]'}`}>
      <div className="relative">
        <Sidebar 
          sidebarState={sidebarState} 
          theme={theme} 
          currentChatId={chatId}
          anonymousId={anonymousId}
        />
      </div>

      <div className={`flex-1 flex flex-col transition-all duration-300 relative ${sidebarState === "expanded" ? "md:ml-64" : ""}`}>
        <div className="relative">
          <SidebarTrigger onToggle={toggleSidebar} sidebarState={sidebarState} theme={theme} />
        </div>
        <div className="relative flex-1 min-h-0">
          {error && <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-500 text-white p-2 rounded-md z-50">{error}</div>}
          
          {pageStatus === 'pending' ? (
            <InitialLoadingSpinner theme={theme} />
          ) : (
            <ChatArea 
              onToggleTheme={toggleTheme} 
              theme={theme} 
              sidebarState={sidebarState} 
              firstPrompt={false}
              setFirstPrompt={() => {}}
              messages={messages}
              isLoading={isLoading} 
              onSendMessage={(content) => handleSendMessage(content, chatId)}
              onRetry={handleRetry}
              onEdit={handleEdit}
              isHome={false}
            />
          )}
        </div>
      </div>
    </div>
  );
}