// app/page.tsx
"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAnonymousId } from "@/lib/utils/anonymousId";
import Sidebar from "@/components/Sidebar";
import SidebarTrigger from "@/components/SidebarTrigger";
import ChatArea from "@/components/ChatArea";
import { Message } from "@/types";

export default function Page() {
  const router = useRouter();
  const [sidebarState, setSidebarState] = useState<"expanded" | "collapsed">("expanded");
  const [theme, setTheme] = useState("light");
  const [firstPrompt, setFirstPrompt] = useState(true); // Welcome screen is active by default
  const [messages, setMessages] = useState<Message[]>([]); // Always empty on main page
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

  const toggleSidebar = () =>
    setSidebarState((s) => (s === "expanded" ? "collapsed" : "expanded"));
  
  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  // This is the new, streamlined way to start a chat.
  const handleSend = async (messageContent: string) => {
    if (!messageContent.trim() || isLoading) return;
    
    setIsLoading(true); // Visual feedback to prevent double-clicks
    
    // Navigate immediately to the new chat page with the prompt.
    // The chat page will handle creating the chat and sending the message.
    // This provides the fastest possible user experience.
    router.push(`/chat/new?prompt=${encodeURIComponent(messageContent)}`);
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
            messages={messages} // This will always be empty, showing the WelcomeScreen
            isLoading={isLoading}
            onSendMessage={handleSend}
          />
        </div>
      </div>
    </div>
  );
}