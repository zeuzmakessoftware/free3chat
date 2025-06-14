// app/chat/[chatId]/page.tsx
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { getAnonymousId } from "@/lib/utils/anonymousId";
import Sidebar from "@/components/Sidebar";
import SidebarTrigger from "@/components/SidebarTrigger";
import ChatArea from "@/components/ChatArea";
import { Message } from "@/types";

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const [chatId, setChatId] = useState<string>(params.chatId as string);
  const [sidebarState, setSidebarState] = useState<"expanded" | "collapsed">("expanded");
  const [theme, setTheme] = useState("light");
  const [anonymousId, setAnonymousId] = useState<string>('');
  
  const [messages, setMessages] = useState<Message[]>([]);
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

  // --- THE FIX: `handleSendMessage` now accepts `targetChatId` ---
  const handleSendMessage = useCallback(async (content: string, targetChatId: string, messageHistory?: Message[]) => {
    if (!content.trim() || !targetChatId) return;
    setIsLoading(true);
    setError(null);

    const currentMessages = messageHistory || messages;

    const optimisticUserMessage: Message = {
      id: `user-${Date.now()}`,
      chat_id: targetChatId, // Use targetChatId
      role: 'user',
      content: content,
      created_at: new Date().toISOString(),
    };
    const optimisticAiMessage: Message = {
      id: `model-${Date.now()}`,
      chat_id: targetChatId, // Use targetChatId
      role: 'model',
      content: '',
      created_at: new Date().toISOString(),
    };

    setMessages([...currentMessages, optimisticUserMessage, optimisticAiMessage]);

    try {
      // Use targetChatId for API calls
      const msgResponse = await fetch(`/api/chats/${targetChatId}/messages?anonymousId=${anonymousId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (!msgResponse.ok) throw new Error('Failed to send message.');
      const { aiMessage: realAiMessage } = await msgResponse.json();

      setMessages(prev => prev.map(m => m.id === optimisticAiMessage.id ? realAiMessage : m));

      const streamResponse = await fetch(`/api/chats/${targetChatId}/messages/${realAiMessage.id}/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ anonymousId }),
      });

      if (!streamResponse.ok || !streamResponse.body) {
        throw new Error('Failed to get streaming response.');
      }

      const reader = streamResponse.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages(prev => prev.map(msg => 
          msg.id === realAiMessage.id 
            ? { ...msg, content: msg.content + chunk } 
            : msg
        ));
      }

      if (!titleGenerated.current && (messageHistory || []).length < 2) {
        titleGenerated.current = true;
        fetch(`/api/chats/${targetChatId}/title`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ anonymousId }),
        }).then(() => {
          window.dispatchEvent(new Event('chats-updated'));
        });
      }

    } catch (err: any) {
      setError(err.message || 'An error occurred.');
      setMessages(prev => prev.filter(m => m.id !== optimisticUserMessage.id && m.id !== optimisticAiMessage.id));
    } finally {
      setIsLoading(false);
      window.dispatchEvent(new Event('chats-updated'));
    }
  }, [anonymousId, messages]);

  const handleRetry = useCallback(async (userMessageId: string) => {
    const messageIndex = messages.findIndex(m => m.id === userMessageId);
    if (messageIndex === -1) return;

    const contentToRetry = messages[messageIndex].content;
    const historyToRetry = messages.slice(0, messageIndex);
    
    setMessages(historyToRetry);
    // Use the current state `chatId` which is correct here
    await handleSendMessage(contentToRetry, chatId, historyToRetry);
  }, [messages, handleSendMessage, chatId]);

  const handleEdit = useCallback(async (userMessageId: string, newContent: string) => {
    const messageIndex = messages.findIndex(m => m.id === userMessageId);
    if (messageIndex === -1) return;

    const historyToRetry = messages.slice(0, messageIndex);
    
    setMessages(historyToRetry);
    // Use the current state `chatId` which is correct here
    await handleSendMessage(newContent, chatId, historyToRetry);
  }, [messages, handleSendMessage, chatId]);
  
  const initializeChat = useCallback(async () => {
    if (!anonymousId) return;

    if (chatId === 'new') {
      const prompt = searchParams.get('prompt');
      if (!prompt) {
        router.replace('/');
        return;
      }
      setIsLoading(true);
      try {
        const res = await fetch('/api/chats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ anonymousId }),
        });
        const { chat } = await res.json();
        if (!chat || !chat.id) throw new Error('Failed to create chat.');
        
        // Update state and URL before sending the message
        setChatId(chat.id);
        router.replace(`/chat/${chat.id}`, { scroll: false });
        window.dispatchEvent(new Event('chats-updated'));
        
        // --- THE FIX: Pass the newly created `chat.id` directly ---
        await handleSendMessage(prompt, chat.id, []);

      } catch (err) {
        setError('Could not start a new chat. Please try again.');
        setIsLoading(false);
      }
    } else {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/chats/${chatId}/messages?anonymousId=${anonymousId}`);
        if (res.status === 404) {
          router.replace('/');
          return;
        }
        if (!res.ok) throw new Error('Failed to fetch messages.');
        const { messages: fetchedMessages } = await res.json();
        setMessages(fetchedMessages || []);
        if (fetchedMessages && fetchedMessages.length > 0) {
            titleGenerated.current = true;
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
  }, [chatId, anonymousId, searchParams, router, handleSendMessage]);

  useEffect(() => {
    if (anonymousId && chatId && !isInitializing.current) {
      isInitializing.current = true;
      initializeChat();
    }
  }, [chatId, anonymousId, initializeChat]);

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
          <ChatArea 
            onToggleTheme={toggleTheme} 
            theme={theme} 
            sidebarState={sidebarState} 
            firstPrompt={false}
            setFirstPrompt={() => {}}
            messages={messages}
            isLoading={isLoading}
            // --- THE FIX: Use the updated `handleSendMessage` ---
            onSendMessage={(content) => handleSendMessage(content, chatId)}
            onRetry={handleRetry}
            onEdit={handleEdit}
          />
        </div>
      </div>
    </div>
  );
}