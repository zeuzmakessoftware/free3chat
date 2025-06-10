"use client";
import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import SidebarTrigger from "@/components/SidebarTrigger";
import ChatArea from "@/components/ChatArea";

export default function Page() {
  const [sidebarState, setSidebarState] = useState<"expanded" | "collapsed">("expanded");
  const [theme, setTheme] = useState("light");

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
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleSidebar = () =>
    setSidebarState((s) => (s === "expanded" ? "collapsed" : "expanded"));
  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  return (
    <div className="relative flex h-screen w-full">
      <div className="relative z-10">
        <Sidebar sidebarState={sidebarState} theme={theme} />
      </div>

      <div
        className={`flex-1 transition-all duration-300 relative z-10 ${
          sidebarState === "expanded" ? "ml-64" : "ml-16"
        }`}
      >
        <div className="relative z-20">
          <SidebarTrigger onToggle={toggleSidebar} />
        </div>
        <div className="relative z-10">
          <ChatArea onToggleTheme={toggleTheme} theme={theme} />
        </div>
      </div>
    </div>
  );
}