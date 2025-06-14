"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { getAnonymousId } from "@/lib/utils/anonymousId";
import Sidebar from "@/components/Sidebar";
import SidebarTrigger from "@/components/SidebarTrigger";
import ChatArea from "@/components/ChatArea";
import { models, type Model } from "@/lib/models";
import { Message, Chat } from "@/types";

export default function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const chatId = params.chatId as string;

  const [sidebarState, setSidebarState] = useState<"expanded" | "collapsed">("expanded");
  const [theme, setTheme] = useState("light");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [anonymousId, setAnonymousId] = useState<string>('');
  const [activeModel, setActiveModel] = useState<Model | null>(null);

  const initialPromptHandled = useRef(false);

  useEffect(() => {
    const id = getAnonymousId();
    setAnonymousId(id);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const darkPref = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(saved || (darkPref ? "dark" : "light"));
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setSidebarState("collapsed");
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchDataAndSendInitialPrompt = useCallback(async () => {
    if (!chatId || !anonymousId) return;

    setIsLoading(true);
    try {
      const chatDetailsRes = await fetch(`/api/chats?chatId=${chatId}&anonymousId=${anonymousId}`);
      if (!chatDetailsRes.ok) throw new Error('Failed to fetch chat details');
      const { chats } = await chatDetailsRes.json();
      const currentChat = chats.find((c: Chat) => c.id === chatId);
      
      if (currentChat && currentChat.model_id) {
        const modelForChat = models.find(m => m.id === currentChat.model_id) || models.find(m => m.active)!;
        setActiveModel(modelForChat);
      } else {
        setActiveModel(models.find(m => m.active)!);
      }

      const messagesRes = await fetch(`/api/chats/${chatId}/messages?anonymousId=${anonymousId}`);
      if (!messagesRes.ok) throw new Error('Failed to fetch messages');
      const { messages: fetchedMessages } = await messagesRes.json();
      setMessages(fetchedMessages);

      const initialPrompt = searchParams.get('prompt');
      if (initialPrompt && !initialPromptHandled.current) {
        initialPromptHandled.current = true;
        router.replace(`/chat/${chatId}`, { scroll: false });
        await handleSendMessage(initialPrompt);
      }
    } catch (error) {
      console.error("Error fetching chat data:", error);
      router.push('/');
    } finally {
      setIsLoading(false);
    }
  }, [chatId, anonymousId, searchParams, router]);

  useEffect(() => {
    fetchDataAndSendInitialPrompt();
  }, [fetchDataAndSendInitialPrompt]);

  const toggleSidebar = () => setSidebarState(s => s === "expanded" ? "collapsed" : "expanded");
  const toggleTheme = () => setTheme(t => t === "light" ? "dark" : "light");

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    setIsLoading(true);
    const tempUserMessageId = `temp-user-${Date.now()}`;
    const userMessage: Message = { id: tempUserMessageId, chat_id: chatId, role: 'user', content, created_at: new Date().toISOString() };
    const aiPlaceholderMessage: Message = { id: `temp-ai-${Date.now()}`, chat_id: chatId, role: 'model', content: '', created_at: new Date().toISOString() };

    setMessages(prev => [...prev, userMessage, aiPlaceholderMessage]);

    try {
      const createRes = await fetch(`/api/chats/${chatId}/messages?anonymousId=${anonymousId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      const { userMessage: dbUserMessage, aiMessage: dbAiMessage } = await createRes.json();

      setMessages(prev => prev.map(m => m.id === tempUserMessageId ? dbUserMessage : m.id === aiPlaceholderMessage.id ? dbAiMessage : m));
      
      const streamRes = await fetch(`/api/chats/${chatId}/messages/${dbAiMessage.id}/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ anonymousId }),
      });

      if (!streamRes.body) throw new Error("No response body");
      const reader = streamRes.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        const chunk = decoder.decode(value, { stream: true });
        setMessages(prev => prev.map(m => 
          m.id === dbAiMessage.id ? { ...m, content: m.content + chunk } : m
        ));
      }
      
      const currentChat = (await (await fetch(`/api/chats?chatId=${chatId}&anonymousId=${anonymousId}`)).json()).chats[0];
      if (currentChat.title === 'New Chat') {
        fetch(`/api/chats/${chatId}/title`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ anonymousId }),
        }).then(() => window.dispatchEvent(new CustomEvent('chats-updated')));
      }

    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.filter(m => m.id !== tempUserMessageId && m.id !== aiPlaceholderMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = async (userMessageId: string) => {
    const userMessageIndex = messages.findIndex(m => m.id === userMessageId);
    if (userMessageIndex === -1) return;

    const content = messages[userMessageIndex].content;
    const conversationHistory = messages.slice(0, userMessageIndex + 1);
    setMessages(conversationHistory);

    await handleSendMessage(content);
  };
  
  const handleEdit = async (originalUserMessageId: string, newContent: string) => {
      const userMessageIndex = messages.findIndex(m => m.id === originalUserMessageId);
      if (userMessageIndex === -1) return;

      const conversationHistory = messages.slice(0, userMessageIndex);
      setMessages(conversationHistory);

      await handleSendMessage(newContent);
  };


  return (
    <div className={`relative flex h-screen w-full ${theme === 'dark' ? 'bg-[#1C151A]' : 'bg-[#F2E1F4]'}`}>
      <div className="relative">
        <Sidebar 
          sidebarState={sidebarState} 
          theme={theme} 
          currentChatId={chatId}
        />
      </div>

      <div className={`flex-1 flex flex-col transition-all duration-300 relative ${sidebarState === "expanded" ? "md:ml-64" : ""}`}>
        <div className="relative">
          <SidebarTrigger onToggle={toggleSidebar} sidebarState={sidebarState} theme={theme} />
        </div>
        <div className="relative flex-1 min-h-0">
          <ChatArea 
            onToggleTheme={toggleTheme} 
            theme={theme} 
            sidebarState={sidebarState} 
            firstPrompt={messages.length === 0} 
            setFirstPrompt={() => {}}
            messages={messages}
            isLoading={isLoading}
            onSendMessage={handleSendMessage}
            onRetry={handleRetry}
            onEdit={handleEdit}
            isHome={false}
            activeModel={activeModel || undefined}
            onModelSelect={() => {}}
          />
        </div>
      </div>
    </div>
  );
}