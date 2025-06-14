// components/ChatInput.tsx
"use client";
import React, { useRef, useEffect, useState } from "react";
import {
  ArrowUpIcon,
  ChevronDownIcon,
  GlobeIcon,
  PaperclipIcon,
} from "@/components/Icons";
import ModelPickerModal from "./ModelPickerModal";
import { motion } from "framer-motion";
import { models, type Model } from "@/lib/models";

interface ChatInputProps {
  theme: string;
  prompt: string;
  setPrompt: (prompt: string) => void;
  isLoading: boolean;
  onSend: () => void;
  firstPrompt: boolean;
  sidebarState: "expanded" | "collapsed";
  activeModel: Model;
  onModelSelect: (model: Model) => void;
}

export default function ChatInput({
  theme,
  prompt,
  setPrompt,
  isLoading,
  onSend,
  firstPrompt,
  sidebarState,
  activeModel,
  onModelSelect,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showModelModal, setShowModelModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const showTerms = false;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [prompt]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading) {
      onSend();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 z-10 w-full px-2 pointer-events-none">
      <div className="mx-auto w-full max-w-3xl text-center pointer-events-auto">
        {!firstPrompt && showTerms && (
          <div
            className={`mt-3 rounded-t-md border border-secondary/40 bg-chat-background/50 p-4 text-sm ${
              theme === "dark" ? "text-white/80" : "text-black"
            } backdrop-blur-md transition-opacity duration-500`}
          >
            Make sure you agree to our{' '}
            <a href="/terms-of-service" className="!underline font-semibold">
              Terms
            </a>{' '}
            and our{' '}
            <a href="/privacy-policy" className="!underline font-semibold">
              Privacy Policy
            </a>
          </div>
        )}

        <div
          className={`mt-2 rounded-t-[20px] border-reflect ${
            theme === "dark" ? "bg-[#251f2a]" : "bg-[#f5d5f5]"
          } p-2 ${sidebarState === "expanded" ? "pb-4" : "pb-0"} backdrop-blur-lg`}
        >
          <form
            onSubmit={handleSubmit}
            className={`relative flex flex-col items-stretch gap-2 rounded-t-xl border border-b-0 ${
              theme === "dark" ? "!border-white/10 bg-[#2c2333]" : "!border-white/70 bg-[#fff0ff]"
            } px-3 pt-3 pb-[env(safe-area-inset-bottom)] text-secondary-foreground sm:max-w-3xl h-[7.2rem] max-sm:h-[8.0rem]`}
          >
            <textarea
              ref={textareaRef}
              name="input"
              id="chat-input"
              placeholder="Type your message here..."
              className="w-full resize-none bg-transparent text-base leading-6 text-foreground placeholder:text-secondary-foreground/60 disabled:opacity-50 max-h-48 outline-none"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              rows={1}
            />

            <div className="mt-8 flex items-center justify-between">
              <div className="flex items-center space-x-2 pb-2 relative">
                <div style={{ position: 'relative' }}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowModelModal((open) => !open);
                    }}
                    className="flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium hover:bg-white/10"
                  >
                    {activeModel.name}
                    <ChevronDownIcon className="h-4 w-4" />
                  </button>
                  <ModelPickerModal
                    models={models}
                    current={activeModel}
                    theme={theme}
                    isOpen={showModelModal}
                    onClose={() => setShowModelModal(false)}
                    onSelect={(m) => {
                      onModelSelect(m);
                      setShowModelModal(false);
                    }}
                  />
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowUpgradeModal((show) => !show);
                  }}
                  className="flex items-center gap-2 rounded-2xl px-2 py-1.5 border !border-white/10 hover:bg-black/20 disabled:text-secondary/40 disabled:cursor-not-allowed"
                >
                  <GlobeIcon className="h-4 w-4" />
                  <span className="max-sm:hidden text-xs">Search</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowUpgradeModal((show) => !show);
                  }}
                  className="px-1.5 py-1.5 border rounded-full !border-white/10 hover:bg-black/20 disabled:text-secondary/40 disabled:cursor-not-allowed"
                >
                  <PaperclipIcon className="h-4 w-4" />
                </button>

                {showUpgradeModal && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.2 }}  className={`absolute bottom-full mb-2 left-30 w-72 border ${theme === "dark" ? "bg-[#15000a] border-!pink-700/70" : "bg-white border-pink-400/30"} p-4 rounded-lg shadow-md text-center z-10`}>
                    <p className="text-md font-semibold mb-1 text-left opacity-90">Upgrade to Pro</p>
                    <p className="text-sm mb-2 text-left opacity-80">Get access to web search and more features with Pro</p>
                    <button
                      onClick={() => {
                        window.open("https://t3.chat", "_blank");
                      }}
                      className={`w-full text-sm font-semibold rounded-md py-2 text-white ${theme === 'dark' ? 'bg-radial from-[#5e183d] to-[#401020] text-[#f2c0d7] hover:from-[#8e486d] hover:to-[#6e284d]' : 'bg-[#aa3067] text-[#f2f0f7] hover:bg-[#ea70a7] hover:text-[#f2f0f7]'}`}
                    >
                      Go To T3.chat
                    </button>
                  </motion.div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="submit"
                  disabled={!prompt.trim() || isLoading}
                  className="rounded-md bg-primary-foreground p-1 text-white hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowUpIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}