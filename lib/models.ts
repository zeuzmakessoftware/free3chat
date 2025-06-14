import { Gemini as GeminiIcon, OpenAI as OpenAIIcon, Claude as ClaudeIcon, Meta as MetaIcon, DeepSeek as DeepSeekIcon, Grok as GrokIcon, Qwen as QwenIcon } from "@lobehub/icons";
import { ComponentType, SVGProps } from "react";

export interface Model {
  id?: string;
  name: string;
  logo: ComponentType<SVGProps<SVGSVGElement>>;
  info: string;
  capabilities: string[];
  favorite: boolean;
  premium: boolean;
  active: boolean;
}

export const rawModels: Record<string, Omit<Model, "id">> = {
  "Gemini 2.5 Flash": { name: "Gemini 2.5 Flash", logo: GeminiIcon, info: "Google's latest fast model", capabilities: ["vision", "web", "pdf"], favorite: true, premium: false, active: true },
  "Llama 3.3 70b": { name: "Llama 3.3 70b", logo: MetaIcon, info: "Meta’s Llama 3.3 70b on Groq", capabilities: [], favorite: true, premium: false, active: true },
  "Llama 4 Maverick": { name: "Llama 4 Maverick", logo: MetaIcon, info: "Meta’s Llama 4 Maverick on Groq", capabilities: [], favorite: true, premium: false, active: true },
  "Qwen qwq-32b": { name: "Qwen qwq-32b", logo: QwenIcon, info: "Qwen base 32b on Groq", capabilities: ["reasoning"], favorite: true, premium: false, active: true },
  "DeepSeek R1 (Llama Distilled)": { name: "DeepSeek R1 (Llama Distilled)", logo: DeepSeekIcon, info: "DeepSeek R1 on Groq, distilled on Llama 3.3 70b", capabilities: ["reasoning"], favorite: true, premium: false, active: true },
  "Gemini 2.5 Pro": { name: "Gemini 2.5 Pro", logo: GeminiIcon, info: "Google's newest experimental model", capabilities: ["vision", "web", "pdf", "reasoning"], favorite: true, premium: false, active: false },
  "GPT ImageGen": { name: "GPT ImageGen", logo: OpenAIIcon, info: "OpenAI's latest and greatest image generation model", capabilities: ["vision", "imagegen"], favorite: true, premium: true, active: false },
  "o4-mini": { name: "o4-mini", logo: OpenAIIcon, info: "OpenAI's latest small reasoning model", capabilities: ["vision", "reasoning"], favorite: true, premium: false, active: false },
  "Claude 4 Sonnet": { name: "Claude 4 Sonnet", logo: ClaudeIcon, info: "Anthropic's flagship model", capabilities: ["vision", "pdf"], favorite: true, premium: true, active: false },
  "Claude 4 Sonnet (Reasoning)": { name: "Claude 4 Sonnet (Reasoning)", logo: ClaudeIcon, info: "Anthropic's flagship model", capabilities: ["vision", "pdf", "reasoning"], favorite: true, premium: true, active: false },
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
  "DeepSeek v3 (Fireworks)": { name: "DeepSeek v3 (Fireworks)", logo: DeepSeekIcon, info: "DeepSeek v3 Fireworks release", capabilities: ["vision"], favorite: false, premium: false, active: false },
  "DeepSeek v3 (0324)": { name: "DeepSeek v3 (0324)", logo: DeepSeekIcon, info: "DeepSeek v3 0324 build", capabilities: ["vision"], favorite: false, premium: false, active: false },
  "DeepSeek R1 (OpenRouter)": { name: "DeepSeek R1 (OpenRouter)", logo: DeepSeekIcon, info: "DeepSeek Retrieval-1 on OpenRouter", capabilities: ["reasoning"], favorite: false, premium: false, active: false },
  "DeepSeek R1 (0528)": { name: "DeepSeek R1 (0528)", logo: DeepSeekIcon, info: "DeepSeek R1 0528 snapshot", capabilities: ["reasoning"], favorite: false, premium: false, active: false },
  "DeepSeek R1 (Qwen Distilled)": { name: "DeepSeek R1 (Qwen Distilled)", logo: DeepSeekIcon, info: "R1 distilled on Qwen", capabilities: ["reasoning"], favorite: false, premium: false, active: false },
  "Grok 3": { name: "Grok 3", logo: GrokIcon, info: "Grok version 3", capabilities: [], favorite: false, premium: true, active: false },
  "Grok 3 Mini": { name: "Grok 3 Mini", logo: GrokIcon, info: "Grok 3 Mini", capabilities: ["reasoning"], favorite: false, premium: false, active: false },
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

export const models: Model[] = Object.entries(rawModels).map(([name, def]) => ({
  id: slugify(name),
  ...def,
}));