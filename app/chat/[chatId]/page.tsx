"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import SidebarTrigger from "@/components/SidebarTrigger";
import ChatArea from "@/components/ChatArea";
import { Message } from "@/lib/supabaseClient";
import { getAnonymousId } from "@/lib/utils/anonymousId";

export default function ChatPage() {
  const params = useParams();
  const chatId = params.chatId as string;
  const [sidebarState, setSidebarState] = useState<"expanded" | "collapsed">("expanded");
  const [theme, setTheme] = useState("light");
  const [firstPrompt, setFirstPrompt] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [anonymousId, setAnonymousId] = useState<string>('');

  useEffect(() => {
    const id = getAnonymousId();
    setAnonymousId(id);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const darkPref = window.matchMedia("(prefers-color-scheme: dark)").matches;
  
    if (saved) {
      setTheme(saved);
    } else if (darkPref) {
      setTheme("dark");
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarState("collapsed");
      }
    };
    
    handleResize();
    
    window.addEventListener("resize", handleResize);
    
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    if (chatId && anonymousId) {
      fetchMessages();
    }
  }, [chatId, anonymousId]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/chats/${chatId}/messages?anonymousId=${anonymousId}`);
      const data = await response.json();
      
      if (data.messages) {
        setMessages(data.messages as Message[]);
        if (data.messages.length > 0) {
          setFirstPrompt(true);
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const streamAndSetAiResponse = async (promptContent: string, aiMessageId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/chats/${chatId}/messages/${aiMessageId}/stream`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-anonymous-id': anonymousId
        },
        body: JSON.stringify({ prompt: promptContent, anonymousId }),
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
          msg.id === aiMessageId ? { ...msg, content: streamedContent } : msg
        ));
      }

      if (messages.length <= 2) {
        generateChatTitle();
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setMessages(prev => prev.map(msg => 
        msg.id === aiMessageId ? { ...msg, content: 'Sorry, I encountered an error. Please try again.' } : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const generateChatTitle = async () => {
    try {
      await fetch(`/api/chats/${chatId}/title`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ anonymousId }),
      });
    } catch (error) {
      console.error('Error generating chat title:', error);
    }
  };

  const handleSend = async (messageContent: string) => {
    if (!messageContent.trim() || isLoading) return;

    try {
      const response = await fetch(`/api/chats/${chatId}/messages?anonymousId=${anonymousId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: messageContent }),
      });

      const data = await response.json();
      
      if (data.userMessage && data.aiMessage) {
        setMessages(prev => [
          ...prev,
          data.userMessage,
          data.aiMessage
        ]);
        setFirstPrompt(true);
        await streamAndSetAiResponse(messageContent, data.aiMessage.id);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleRetry = async (messageId: string) => {
    if (isLoading) return;
    
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1) return;
    
    const userMessageContent = messages[messageIndex].content;
    const messagesToRetry = messages.slice(0, messageIndex);
    setMessages(messagesToRetry);
    
    try {
      const response = await fetch(`/api/chats/${chatId}/messages?anonymousId=${anonymousId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: userMessageContent }),
      });

      const data = await response.json();
      
      if (data.userMessage && data.aiMessage) {
        setMessages(prev => [
          ...prev,
          data.userMessage,
          data.aiMessage
        ]);
        setFirstPrompt(true);
        await streamAndSetAiResponse(userMessageContent, data.aiMessage.id);
      }
    } catch (error) {
      console.error('Error retrying message:', error);
    }
  };

  const handleEdit = async (originalUserMessageId: string, newContent: string) => {
    if (!newContent.trim() || isLoading) return;

    try {
      const response = await fetch(`/api/chats/${chatId}/messages?anonymousId=${anonymousId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newContent }),
      });

      const data = await response.json();
      
      if (data.userMessage && data.aiMessage) {
        setMessages(prev => [
          ...prev,
          data.userMessage,
          data.aiMessage
        ]);
        setFirstPrompt(true);
        await streamAndSetAiResponse(newContent, data.aiMessage.id);
      }
    } catch (error) {
      console.error('Error editing message:', error);
    }
  };

  const toggleSidebar = () =>
    setSidebarState((s) => (s === "expanded" ? "collapsed" : "expanded"));
  
  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

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

      <div
        className={`flex-1 flex flex-col transition-all duration-300 relative ${
          sidebarState === "expanded" ? "ml-64" : ""
        }`}
      >
        <div className="relative">
          <SidebarTrigger onToggle={toggleSidebar} sidebarState={sidebarState} theme={theme} />
        </div>
        <div className="relative flex-1 min-h-0">
          <ChatArea 
            onToggleTheme={toggleTheme} 
            theme={theme} 
            sidebarState={sidebarState} 
            firstPrompt={firstPrompt} 
            setFirstPrompt={setFirstPrompt}
            messages={messages}
            isLoading={isLoading}
            chatId={chatId}
            anonymousId={anonymousId}
            onSendMessage={handleSend}
            onRetry={handleRetry}
            onEdit={handleEdit}
          />
        </div>
      </div>
    </div>
  );
}
