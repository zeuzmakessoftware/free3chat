"use client";
import React, { useRef, useEffect, useState } from "react";
import {
  ArrowUpIcon,
  ChevronDownIcon,
  GlobeIcon,
  PaperclipIcon,
} from "@/components/Icons";
import ModelPickerModal, { Model } from "./ModelPickerModal";
import { Gemini as GeminiIcon, OpenAI as OpenAIIcon, Claude as ClaudeIcon, Meta as MetaIcon, DeepSeek as DeepSeekIcon, Grok as GrokIcon, Qwen as QwenIcon } from "@lobehub/icons";
import { motion } from "framer-motion";

interface ChatInputProps {
  theme: string;
  prompt: string;
  setPrompt: (prompt: string) => void;
  isLoading: boolean;
  onSend: () => void;
  firstPrompt: boolean;
  sidebarState: "expanded" | "collapsed";
}

const rawModels: Record<string, Omit<Model, "id">> = {
  "Gemini 2.5 Flash": { name: "Gemini 2.5 Flash", logo: GeminiIcon, info: "Google's latest fast model", capabilities: ["vision", "web", "pdf"], favorite: true, premium: false, active: true },
  "Gemini 2.5 Pro": { name: "Gemini 2.5 Pro", logo: GeminiIcon, info: "Google's newest experimental model", capabilities: ["vision", "web", "pdf", "reasoning"], favorite: true, premium: false, active: false },
  "GPT ImageGen": { name: "GPT ImageGen", logo: OpenAIIcon, info: "OpenAI's latest and greatest image generation model", capabilities: ["vision", "imagegen"], favorite: true, premium: true, active: false },
  "o4-mini": { name: "o4-mini", logo: OpenAIIcon, info: "OpenAI's latest small reasoning model", capabilities: ["vision", "reasoning"], favorite: true, premium: false, active: false },
  "Claude 4 Sonnet": { name: "Claude 4 Sonnet", logo: ClaudeIcon, info: "Anthropic's flagship model", capabilities: ["vision", "pdf"], favorite: true, premium: true, active: false },
  "Claude 4 Sonnet (Reasoning)": { name: "Claude 4 Sonnet (Reasoning)", logo: ClaudeIcon, info: "Anthropic's flagship model", capabilities: ["vision", "pdf", "reasoning"], favorite: true, premium: true, active: false },
  "DeepSeek R1 (Llama Distilled)": { name: "DeepSeek R1 (Llama Distilled)", logo: ClaudeIcon, info: "DeepSeek R1, distilled on Llama 3.3 70b", capabilities: ["reasoning"], favorite: true, premium: false, active: false },
  "Gemini 2.0 Flash": { name: "Gemini 2.0 Flash", logo: GeminiIcon, info: "Google's stable Flash model", capabilities: ["vision", "web", "pdf"], favorite: false, premium: false, active: false },
  "Gemini 2.0 Flash Lite": { name: "Gemini 2.0 Flash Lite", logo: GeminiIcon, info: "Lightweight Flash variant", capabilities: ["vision", "pdf"], favorite: false, premium: false, active: false },
  "Gemini 2.5 Flash (Thinking)": { name: "Gemini 2.5 Flash", logo: GeminiIcon, info: "(Thinking)", capabilities: ["vision", "web", "pdf"], favorite: false, premium: false, active: false },
  "GPT 4o-mini": { name: "GPT 4o-mini", logo: OpenAIIcon, info: "OpenAI’s compact 4.0 model", capabilities: ["vision"], favorite: false, premium: false, active: true },
  "GPT 4o": { name: "GPT 4o", logo: OpenAIIcon, info: "OpenAI’s standard 4.0", capabilities: ["vision"], favorite: false, premium: false, active: false },
  "GPT 4.1": { name: "GPT 4.1", logo: OpenAIIcon, info: "Next-gen 4.1 model", capabilities: ["vision"], favorite: false, premium: false, active: false },
  "GPT 4.1 Mini": { name: "GPT 4.1 Mini", logo: OpenAIIcon, info: "Slim 4.1 variant", capabilities: ["vision"], favorite: false, premium: false, active: false },
  "GPT 4.1 Nano": { name: "GPT 4.1 Nano", logo: OpenAIIcon, info: "Ultra-compact 4.1", capabilities: ["vision"], favorite: false, premium: false, active: false },
  "o3 mini": { name: "o3 mini", logo: OpenAIIcon, info: "OpenAI’s small-scale 3.0", capabilities: ["reasoning"], favorite: false, premium: false, active: false },
  "o3": { name: "o3", logo: OpenAIIcon, info: "Full-size GPT-3.0", capabilities: ["vision", "reasoning"], favorite: false, premium: true, active: false },
  "o3 Pro": { name: "o3 Pro", logo: OpenAIIcon, info: "GPT-3 Pro unlocked", capabilities: ["vision", "pdf", "reasoning"], favorite: false, premium: false, active: false },
  "Claude 3.5 Sonnet": { name: "Claude 3.5 Sonnet", logo: ClaudeIcon, info: "Anthropic’s 3.5 model", capabilities: ["vision", "pdf"], favorite: false, premium: true, active: false },
  "Claude 3.7 Sonnet": { name: "Claude 3.7 Sonnet", logo: ClaudeIcon, info: "Anthropic’s 3.7 base", capabilities: ["vision", "pdf"], favorite: false, premium: true, active: false },
  "Claude 3.7 Sonnet (Reasoning)": { name: "Claude 3.7 Sonnet (Reasoning)", logo: ClaudeIcon, info: "Anthropic’s reasoning-tuned 3.7", capabilities: ["vision", "pdf", "reasoning"], favorite: false, premium: true, active: false },
  "Claude 4 Opus": { name: "Claude 4 Opus", logo: ClaudeIcon, info: "Anthropic’s Opus (4.0)", capabilities: ["vision", "pdf", "reasoning"], favorite: false, premium: true, active: false },
  "Llama 3.3 70b": { name: "Llama 3.3 70b", logo: MetaIcon, info: "Meta’s Llama 3.3 70b", capabilities: ["vision"], favorite: false, premium: false, active: false },
  "Llama 4 Maverick": { name: "Llama 4 Maverick", logo: MetaIcon, info: "Meta’s Llama 4 Maverick", capabilities: ["vision"], favorite: false, premium: false, active: false },
  "DeepSeek v3 (Fireworks)": { name: "DeepSeek v3 (Fireworks)", logo: DeepSeekIcon, info: "DeepSeek v3 Fireworks release", capabilities: ["vision"], favorite: false, premium: false, active: false },
  "DeepSeek v3 (0324)": { name: "DeepSeek v3 (0324)", logo: DeepSeekIcon, info: "DeepSeek v3 0324 build", capabilities: ["vision"], favorite: false, premium: false, active: false },
  "DeepSeek R1 (OpenRouter)": { name: "DeepSeek R1 (OpenRouter)", logo: DeepSeekIcon, info: "DeepSeek Retrieval-1 on OpenRouter", capabilities: ["reasoning"], favorite: false, premium: false, active: false },
  "DeepSeek R1 (0528)": { name: "DeepSeek R1 (0528)", logo: DeepSeekIcon, info: "DeepSeek R1 0528 snapshot", capabilities: ["reasoning"], favorite: false, premium: false, active: false },
  "DeepSeek R1 (Qwen Distilled)": { name: "DeepSeek R1 (Qwen Distilled)", logo: DeepSeekIcon, info: "R1 distilled on Qwen", capabilities: ["reasoning"], favorite: false, premium: false, active: false },
  "Grok 3": { name: "Grok 3", logo: GrokIcon, info: "Grok version 3", capabilities: [], favorite: false, premium: true, active: false },
  "Grok 3 Mini": { name: "Grok 3 Mini", logo: GrokIcon, info: "Grok 3 Mini", capabilities: ["reasoning"], favorite: false, premium: false, active: false },
  "Qwen qwq-32b": { name: "Qwen qwq-32b", logo: QwenIcon, info: "Qwen base 32b", capabilities: ["reasoning"], favorite: false, premium: false, active: false },
  "Qwen 2.5 32b": { name: "Qwen 2.5 32b", logo: QwenIcon, info: "Qwen 2.5 32b", capabilities: ["vision"], favorite: false, premium: false, active: false },
  "GPT 4.5": { name: "GPT 4.5", logo: OpenAIIcon, info: "OpenAI GPT-4.5", capabilities: ["vision"], favorite: false, premium: false, active: false },
};

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[\s.()]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const models: Model[] = Object.entries(rawModels).map(([name, def]) => ({
  id: slugify(name),
  ...def,
}));

export default function ChatInput({
  theme,
  prompt,
  setPrompt,
  isLoading,
  onSend,
  firstPrompt,
  sidebarState,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showModelModal, setShowModelModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [activeModel, setActiveModel] = useState<Model>(models[0]);

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
        {!firstPrompt && (
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
                      setActiveModel(m);
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
