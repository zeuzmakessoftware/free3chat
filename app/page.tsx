"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAnonymousId } from "@/lib/utils/anonymousId";
import Sidebar from "@/components/Sidebar";
import SidebarTrigger from "@/components/SidebarTrigger";
import ChatArea from "@/components/ChatArea";
import { models, type Model } from "@/lib/models";
import { useTheme } from "next-themes";
import { useFont } from "@/components/FontProvider";

export default function Page() {
  const router = useRouter();
  const [sidebarState, setSidebarState] = useState<"expanded" | "collapsed">("expanded");
  const { theme: nextTheme, setTheme: setNextTheme } = useTheme();
  const [theme, setTheme] = useState<string>("system");
  const [firstPrompt, setFirstPrompt] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [anonymousId, setAnonymousId] = useState<string>('');
  const { font, setFont } = useFont();
  
  const [activeModel, setActiveModel] = useState<Model>(() => models.find(m => m.active) || models[0]);

  useEffect(() => {
    const id = getAnonymousId();
    setAnonymousId(id);
  }, []);

  useEffect(() => {
    if (nextTheme) {
      setTheme(nextTheme);
    }
  }, [nextTheme]);



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
    if (theme && theme !== nextTheme && theme !== 'system') {
      setNextTheme(theme);
    }
  }, [theme, nextTheme, setNextTheme]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey && e.shiftKey && e.code === 'KeyO') {
        e.preventDefault();
        router.push('/');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  const toggleSidebar = () =>
    setSidebarState((s) => (s === "expanded" ? "collapsed" : "expanded"));
  
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    setNextTheme(newTheme);
  };

  const handleSend = async (messageContent: string) => {
    if (!messageContent.trim() || isLoading) return;
    
    setIsLoading(true);
    
    try {
      const res = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ anonymousId, modelId: activeModel.id }),
      });
      
      const { chat } = await res.json();
      if (!chat || !chat.id) throw new Error('Failed to create chat.');
      
      router.push(`/chat/${chat.id}?prompt=${encodeURIComponent(messageContent)}`);
    } catch (error) {
      console.error('Error creating chat:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className={`relative flex h-screen w-full ${theme === 'dark' ? 'bg-[#1C151A]' : 'bg-[#F2E1F4]'}`}>
      <div className="relative">
        <Sidebar 
          sidebarState={sidebarState} 
          theme={theme} 
          anonymousId={anonymousId}
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
            firstPrompt={firstPrompt} 
            setFirstPrompt={setFirstPrompt}
            isLoading={isLoading}
            onSendMessage={handleSend}
            isHome={true}
            activeModel={activeModel}
            onModelSelect={setActiveModel}
            font={font}
            setFont={setFont}
          />
        </div>
      </div>
    </div>
  );
}