"use client";
import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import SidebarTrigger from "@/components/SidebarTrigger";
import ChatArea from "@/components/ChatArea";

export default function Page() {
  const [sidebarState, setSidebarState] = useState<"expanded" | "collapsed">("expanded");
  const [theme, setTheme] = useState("light");
  const [firstPrompt, setFirstPrompt] = useState(false);

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

  return (
    <div className={`relative flex h-screen w-full ${theme === 'dark' ? 'bg-[#1C151A]' : 'bg-[#F2E1F4]'}`}>
      <div className="relative">
        <Sidebar sidebarState={sidebarState} theme={theme} />
      </div>

      <div
        className={`flex-1 transition-all duration-300 relative ${
          sidebarState === "expanded" ? "ml-64" : ""
        }`}
      >
        <div className="relative">
          <SidebarTrigger onToggle={toggleSidebar} sidebarState={sidebarState} theme={theme} />
        </div>
        <div className="relative">
          <ChatArea onToggleTheme={toggleTheme} theme={theme} sidebarState={sidebarState} firstPrompt={firstPrompt} setFirstPrompt={setFirstPrompt} />
        </div>
      </div>
    </div>
  );
}