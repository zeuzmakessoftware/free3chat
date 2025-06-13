"use client"

import { ChevronUp, DiamondIcon, FilterIcon, InfoIcon, SearchIcon, ChevronDown, EyeIcon, GlobeIcon, FileTextIcon, BrainIcon, ImageIcon } from "lucide-react";
import { useState, useMemo } from "react";
import { Gemini, OpenAI, Claude, Meta, DeepSeek, Grok, Qwen } from "@lobehub/icons";
import HoldTooltip from "@/components/HoldTooltip";

const capabilityIcons: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
    vision: EyeIcon,
    web: GlobeIcon,
    pdf: FileTextIcon,
    reasoning: BrainIcon,
    imagegen: ImageIcon,
};

const capabilityStyles: Record<string, { bg: string; text: string }> = {
    vision: { bg: "bg-emerald-500/20", text: "text-emerald-400" },
    web: { bg: "bg-sky-500/20", text: "text-sky-400" },
    pdf: { bg: "bg-indigo-500/20", text: "text-indigo-400" },
    reasoning: { bg: "bg-purple-500/20", text: "text-purple-400" },
    imagegen: { bg: "bg-orange-500/20", text: "text-orange-400" },
};

interface ModelDefinition {
  name: string;
  logo: React.ComponentType<any>;
  info: string;
  capabilities: string[];
  favorite: boolean;
  premium: boolean;
  active: boolean;
}

const models: Record<string, ModelDefinition> = {
    "Gemini 2.5 Flash": { name: "Gemini 2.5 Flash", logo: Gemini, info: "Google's latest fast model", capabilities: ["vision", "web", "pdf"], favorite: true, premium: false, active: true },
    "Gemini 2.5 Pro": { name: "Gemini 2.5 Pro", logo: Gemini, info: "Google's newest experimental model", capabilities: ["vision", "web", "pdf", "reasoning"], favorite: true, premium: false, active: false },
    "GPT ImageGen": { name: "GPT ImageGen", logo: OpenAI, info: "OpenAI's latest and greatest image generation model", capabilities: ["vision", "imagegen"], favorite: true, premium: true, active: false },
    "o4-mini": { name: "o4-mini", logo: OpenAI, info: "OpenAI's latest small reasoning model", capabilities: ["vision", "reasoning"], favorite: true, premium: false, active: false },
    "Claude 4 Sonnet": { name: "Claude 4 Sonnet", logo: Claude, info: "Anthropic's flagship model", capabilities: ["vision", "pdf"], favorite: true, premium: true, active: false },
    "Claude 4 Sonnet (Reasoning)": { name: "Claude 4 Sonnet (Reasoning)", logo: Claude, info: "Anthropic's flagship model", capabilities: ["vision", "pdf", "reasoning"], favorite: true, premium: true, active: false },
    "DeepSeek R1 (Llama Distilled)": { name: "DeepSeek R1 (Llama Distilled)", logo: Claude, info: "DeepSeek R1, distilled on Llama 3.3 70b", capabilities: ["reasoning"], favorite: true, premium: false, active: false },
    "Gemini 2.0 Flash": { name: "Gemini 2.0 Flash", logo: Gemini, info: "Google's stable Flash model", capabilities: ["vision", "web", "pdf"], favorite: false, premium: false, active: false },
    "Gemini 2.0 Flash Lite": { name: "Gemini 2.0 Flash Lite", logo: Gemini, info: "Lightweight Flash variant", capabilities: ["vision", "pdf"], favorite: false, premium: false, active: false },
    "Gemini 2.5 Flash (Thinking)": { name: "Gemini 2.5 Flash", logo: Gemini, info: "(Thinking)", capabilities: ["vision", "web", "pdf"], favorite: false, premium: false, active: false },
    "GPT 4o-mini": { name: "GPT 4o-mini", logo: OpenAI, info: "OpenAI’s compact 4.0 model", capabilities: ["vision"], favorite: false, premium: false, active: true },
    "GPT 4o": { name: "GPT 4o", logo: OpenAI, info: "OpenAI’s standard 4.0", capabilities: ["vision"], favorite: false, premium: false, active: false },
    "GPT 4.1": { name: "GPT 4.1", logo: OpenAI, info: "Next-gen 4.1 model", capabilities: ["vision"], favorite: false, premium: false, active: false },
    "GPT 4.1 Mini": { name: "GPT 4.1 Mini", logo: OpenAI, info: "Slim 4.1 variant", capabilities: ["vision"], favorite: false, premium: false, active: false },
    "GPT 4.1 Nano": { name: "GPT 4.1 Nano", logo: OpenAI, info: "Ultra-compact 4.1", capabilities: ["vision"], favorite: false, premium: false, active: false },
    "o3 mini": { name: "o3 mini", logo: OpenAI, info: "OpenAI’s small-scale 3.0", capabilities: ["reasoning"], favorite: false, premium: false, active: false },
    "o3": { name: "o3", logo: OpenAI, info: "Full-size GPT-3.0", capabilities: ["vision", "reasoning"], favorite: false, premium: true, active: false },
    "o3 Pro": { name: "o3 Pro", logo: OpenAI, info: "GPT-3 Pro unlocked", capabilities: ["vision", "pdf", "reasoning"], favorite: false, premium: false, active: false },
    "Claude 3.5 Sonnet": { name: "Claude 3.5 Sonnet", logo: Claude, info: "Anthropic’s 3.5 model", capabilities: ["vision", "pdf"], favorite: false, premium: true, active: false },
    "Claude 3.7 Sonnet": { name: "Claude 3.7 Sonnet", logo: Claude, info: "Anthropic’s 3.7 base", capabilities: ["vision", "pdf"], favorite: false, premium: true, active: false },
    "Claude 3.7 Sonnet (Reasoning)": { name: "Claude 3.7 Sonnet (Reasoning)", logo: Claude, info: "Anthropic’s reasoning-tuned 3.7", capabilities: ["vision", "pdf", "reasoning"], favorite: false, premium: true, active: false },
    "Claude 4 Opus": { name: "Claude 4 Opus", logo: Claude, info: "Anthropic’s Opus (4.0)", capabilities: ["vision", "pdf", "reasoning"], favorite: false, premium: true, active: false },
    "Llama 3.3 70b": { name: "Llama 3.3 70b", logo: Meta, info: "Meta’s Llama 3.3 70b", capabilities: ["vision"], favorite: false, premium: false, active: false },
    "Llama 4 Maverick": { name: "Llama 4 Maverick", logo: Meta, info: "Meta’s Llama 4 Maverick", capabilities: ["vision"], favorite: false, premium: false, active: false },
    "DeepSeek v3 (Fireworks)": { name: "DeepSeek v3 (Fireworks)", logo: DeepSeek, info: "DeepSeek v3 Fireworks release", capabilities: ["vision"], favorite: false, premium: false, active: false },
    "DeepSeek v3 (0324)": { name: "DeepSeek v3 (0324)", logo: DeepSeek, info: "DeepSeek v3 0324 build", capabilities: ["vision"], favorite: false, premium: false, active: false },
    "DeepSeek R1 (OpenRouter)": { name: "DeepSeek R1 (OpenRouter)", logo: DeepSeek, info: "DeepSeek Retrieval-1 on OpenRouter", capabilities: ["reasoning"], favorite: false, premium: false, active: false },
    "DeepSeek R1 (0528)": { name: "DeepSeek R1 (0528)", logo: DeepSeek, info: "DeepSeek R1 0528 snapshot", capabilities: ["reasoning"], favorite: false, premium: false, active: false },
    "DeepSeek R1 (Qwen Distilled)": { name: "DeepSeek R1 (Qwen Distilled)", logo: DeepSeek, info: "R1 distilled on Qwen", capabilities: ["reasoning"], favorite: false, premium: false, active: false },
    "Grok 3": { name: "Grok 3", logo: Grok, info: "Grok version 3", capabilities: [], favorite: false, premium: true, active: false },
    "Grok 3 Mini": { name: "Grok 3 Mini", logo: Grok, info: "Grok 3 Mini", capabilities: ["reasoning"], favorite: false, premium: false, active: false },
    "Qwen qwq-32b": { name: "Qwen qwq-32b", logo: Qwen, info: "Qwen base 32b", capabilities: ["reasoning"], favorite: false, premium: false, active: false },
    "Qwen 2.5 32b": { name: "Qwen 2.5 32b", logo: Qwen, info: "Qwen 2.5 32b", capabilities: ["vision"], favorite: false, premium: false, active: false },
    "GPT 4.5": { name: "GPT 4.5", logo: OpenAI, info: "OpenAI GPT-4.5", capabilities: ["vision"], favorite: false, premium: false, active: false },
};

const CapabilityBadges = ({ capabilities, theme }: { capabilities: string[]; theme: "light" | "dark" }) => (
    <>
        {capabilities.map((cap) => {
            const Icon = capabilityIcons[cap];
            const style = capabilityStyles[cap] ?? { bg: "bg-gray-500/20", text: "text-gray-400" };
            return Icon ? (
                <HoldTooltip key={cap} tooltip={cap} position="top" theme={theme}>
                    <span className={`${style.bg} ${style.text} p-1 rounded-lg`}>
                        <Icon className="w-4 h-4" />
                    </span>
                </HoldTooltip>
            ) : null;
        })}
    </>
);

const ModelItem = ({ model, view, theme }: { model: ModelDefinition; view: 'list' | 'grid'; theme: "light" | "dark" }) => {
    const inactiveClasses = !model.active ? "opacity-50 cursor-not-allowed" : "opacity-100";
    if (view === 'list') {
        return (
            <div className={`flex justify-between items-center py-4 rounded-lg transition duration-200 ease-in-out ${theme === "dark" ? "hover:bg-white/10" : "hover:bg-pink-300/10"} ${inactiveClasses}`}>
                <div className="flex items-center justify-between gap-3">
                    <model.logo className={`w-4 h-4 ${theme === "dark" ? "!text-pink-400/60" : "!text-pink-400/60"}`} />
                    <h2 className={`${theme === "dark" ? "!text-white" : "!text-pink-800"} !font-semibold !text-sm`}>{model.name}</h2>
                    {model.premium && (
                        <HoldTooltip tooltip="Premium" position="top" theme={theme}>
                            <DiamondIcon className="w-3 h-3 text-neutral-400" />
                        </HoldTooltip>
                    )}
                    <HoldTooltip tooltip={model.info} position="top" theme={theme}>
                        <InfoIcon className={`w-3 h-3 ${theme === "dark" ? "!text-pink-400/70" : "!text-pink-400/70"}`} />
                    </HoldTooltip>
                </div>
                <div className="flex items-center gap-2">
                    <CapabilityBadges capabilities={model.capabilities} theme={theme} />
                </div>
            </div>
        );
    }
    return (
        <div className={`flex flex-col items-center p-2 justify-between w-26 h-36 border !border-pink-400/30 rounded-lg transition duration-200 ease-in-out ${theme === "dark" ? "hover:bg-white/10" : "bg-pink-300/10 !hover:bg-white"} ${inactiveClasses} ${model.active && "cursor-pointer"}`}>
            <model.logo className={`w-8 h-8 ${theme === "dark" ? "!text-white/80" : "!text-pink-950/80"}`} />
            <h2 className={`${theme === "dark" ? "!text-white" : "!text-pink-800"} text-center !font-semibold !text-sm`}>{model.name}</h2>
            <div className="flex items-center justify-center gap-1 w-[90%]">
                <CapabilityBadges capabilities={model.capabilities} theme={theme} />
            </div>
        </div>
    );
};


const SearchInput = ({ searchQuery, setSearchQuery, theme }: { searchQuery: string; setSearchQuery: (query: string) => void; theme: "light" | "dark" }) => (
    <div className={`flex items-center border-b py-2 ${theme === "dark" ? "!border-white/10" : "!border-pink-400/30"}`}>
        <SearchIcon className={`w-3 h-3 ${theme === "dark" ? "!text-white/60" : "!text-pink-400/60"}`} />
        <input
            placeholder="Search models..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`ml-4 !text-xs bg-transparent w-full focus:outline-none ${theme === "dark" ? "!placeholder-white/60 text-white" : "!placeholder-pink-400/60 text-black"}`}
        />
    </div>
);

const UpgradeCard = ({ theme }: { theme: "light" | "dark" }) => (
    <div className={`p-4 my-2 rounded-lg border !border-pink-400/30 ${theme === "dark" ? "bg-[#15000a]" : "!bg-gradient-to-b from-pink-200 to-white"}`}>
        <h2 className={`mb-2 !font-semibold !text-lg ${theme === "dark" ? "!text-white" : "!text-pink-800"}`}>Unlock all models + higher limits</h2>
        <div className="flex justify-between">
            <h4 className={`text-xl ${theme === "dark" ? "!text-white" : "!text-pink-400"}`}><span className="text-pink-400 text-3xl font-bold">$8</span>/month</h4>
            <button className={`${theme === "dark" ? "bg-pink-950/80 hover:bg-pink-950" : "bg-pink-800/80 hover:bg-pink-800/60"} border !border-pink-400/30 rounded-xl font-bold text-sm text-white/80 px-4 py-2`}>Go to T3.chat</button>
        </div>
    </div>
);

const FilterMenu = ({ selectedFilters, setSelectedFilters, theme }: { selectedFilters: string[]; setSelectedFilters: (filters: string[]) => void; theme: "light" | "dark" }) => {
    const filterOptions: Record<string, { text: string; Icon: React.FC<any> }> = {
        'vision': { text: "Vision", Icon: EyeIcon },
        'web': { text: "Web Browsing", Icon: GlobeIcon },
        'pdf': { text: "PDF Analysis", Icon: FileTextIcon },
        'reasoning': { text: "Reasoning", Icon: BrainIcon },
        'imagegen': { text: "Image Generation", Icon: ImageIcon },
    };

    const handleFilterToggle = (filterKey: string) => {
        setSelectedFilters(
            selectedFilters.includes(filterKey)
                ? selectedFilters.filter((f) => f !== filterKey)
                : [...selectedFilters, filterKey]
        );
    };

    return (
        <div className={`absolute bottom-full right-0 mb-2 w-56 rounded-lg shadow-lg z-10 ${theme === "dark" ? "bg-neutral-900 border border-neutral-700" : "bg-white border border-neutral-700 text-neutral-800"}`}>
            <ul className="p-1">
                {Object.entries(filterOptions).map(([key, { text, Icon }]) => {
                    const isSelected = selectedFilters.includes(key);
                    const style = capabilityStyles[key];
                    return (
                        <li key={key}>
                            <button
                                onClick={() => handleFilterToggle(key)}
                                className={`w-full flex items-center gap-3 p-2 text-sm rounded-md text-left ${theme === "dark" ? "text-white/90 hover:bg-white/10" : "text-pink-900 hover:bg-pink-100/50"} ${isSelected ? (theme === 'dark' ? 'bg-white/10' : 'bg-pink-200/50') : ''}`}
                            >
                                <Icon className={`w-4 h-4 ${style?.text || 'text-white/70'}`} />
                                <span>{text}</span>
                            </button>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

const ModalFooter = ({ favoriteMode, setFavoriteMode, isFilterOpen, setIsFilterOpen, selectedFilters, setSelectedFilters, theme }: {
    favoriteMode: boolean;
    setFavoriteMode: (mode: boolean) => void;
    isFilterOpen: boolean;
    setIsFilterOpen: (isOpen: boolean) => void;
    selectedFilters: string[];
    setSelectedFilters: (filters: string[]) => void;
    theme: "light" | "dark";
}) => (
    <div className="flex items-center justify-between border-t !border-pink-400/30 pt-2">
        <button onClick={() => setFavoriteMode(!favoriteMode)} className={`flex items-center justify-between gap-2 h-10 p-2 rounded-lg ${theme === "dark" ? "!hover:bg-white/10" : "!hover:bg-pink-100/50"}`}>
            {favoriteMode ? <ChevronDown className={`w-4 h-4 ${theme === "dark" ? "!text-white" : "!text-pink-800"}`} /> : <ChevronUp className={`w-4 h-4 ${theme === "dark" ? "!text-white" : "!text-pink-800"}`} />}
            <p className={`${theme === "dark" ? "!text-white" : "!text-pink-800"} text-sm`}>{favoriteMode ? "Favorites" : "Show All"}</p>
            {favoriteMode && <span className="text-pink-400 text-5xl mb-2">•</span>}
        </button>
        <div className="relative">
            <button onClick={() => setIsFilterOpen(!isFilterOpen)} className={`flex items-center justify-between gap-2 h-10 p-2 rounded-lg ${theme === "dark" ? "!hover:bg-white/10" : "!hover:bg-pink-100/50"}`}>
                <FilterIcon className={`w-4 h-4 ${theme === "dark" ? "!text-white/80" : "!text-pink-800"}`} />
            </button>
            {isFilterOpen && <FilterMenu selectedFilters={selectedFilters} setSelectedFilters={setSelectedFilters} theme={theme} />}
        </div>
    </div>
);

const ModelGridSection = ({ title, models, theme }: { title: string; models: [string, ModelDefinition][]; theme: "light" | "dark" }) => {
    if (models.length === 0) return null;
    return (
        <div>
            <h3 className={`${theme === "dark" ? "!text-white" : "!text-pink-900"} mb-2 !font-semibold !text-lg`}>{title}</h3>
            <div className="flex flex-wrap gap-2 mb-4">
                {models.map(([id, model]) => (
                    <ModelItem key={id} model={model} view="grid" theme={theme} />
                ))}
            </div>
        </div>
    );
};

const ModalBuild = () => {
    const [favoriteMode, setFavoriteMode] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [theme] = useState<"light" | "dark">("light");

    const filteredModels = useMemo(() => {
        return Object.entries(models).filter(([_, model]) => {
            const searchLower = searchQuery.toLowerCase();
            const matchesSearch = model.name.toLowerCase().includes(searchLower) || model.info.toLowerCase().includes(searchLower);
            const matchesFilter = selectedFilters.length === 0 || selectedFilters.every(filter => model.capabilities.includes(filter));
            return matchesSearch && matchesFilter;
        });
    }, [searchQuery, selectedFilters]);

    const favoriteModels = useMemo(() => filteredModels.filter(([, model]) => model.favorite), [filteredModels]);
    const otherModels = useMemo(() => filteredModels.filter(([, model]) => !model.favorite), [filteredModels]);

    const commonFooterProps = { favoriteMode, setFavoriteMode, isFilterOpen, setIsFilterOpen, selectedFilters, setSelectedFilters, theme };

    if (favoriteMode) {
        return (
            <div className={`w-[420px] px-4 py-2 rounded-lg ${theme === "dark" ? "bg-neutral-950" : "bg-white"}`}>
                <SearchInput searchQuery={searchQuery} setSearchQuery={setSearchQuery} theme={theme} />
                <UpgradeCard theme={theme} />
                <div>
                    {favoriteModels.map(([id, model]) => (
                        <ModelItem key={id} model={model} view="list" theme={theme} />
                    ))}
                </div>
                <ModalFooter {...commonFooterProps} />
            </div>
        );
    }

    return (
        <div className={`w-[600px] px-4 py-2 rounded-lg ${theme === "dark" ? "!bg-[#15000a]" : "!bg-white"}`}>
            <SearchInput searchQuery={searchQuery} setSearchQuery={setSearchQuery} theme={theme} />
            <div className="overflow-y-auto h-[60vh]">
                <UpgradeCard theme={theme} />
                <ModelGridSection title="Favorites" models={favoriteModels} theme={theme} />
                <ModelGridSection title="Others" models={otherModels} theme={theme} />
            </div>
            <ModalFooter {...commonFooterProps} />
        </div>
    );
}

export default ModalBuild;