"use client"

import { ChevronUp, DiamondIcon, FilterIcon, InfoIcon, SearchIcon, ChevronDown, EyeIcon, GlobeIcon, FileTextIcon, BrainIcon, ImageIcon } from "lucide-react";
import { useState, useMemo, FC, SVGProps, ComponentType, useEffect, useRef } from "react";
import HoldTooltip from "@/components/HoldTooltip";

const capabilityIcons: Record<string, FC<SVGProps<SVGSVGElement>>> = {
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

export interface Model {
  id?: string;
  name: string;
  logo: ComponentType<any>;
  info: string;
  capabilities: string[];
  favorite: boolean;
  premium: boolean;
  active: boolean;
}

interface ModelPickerModalProps {
  models: Model[];
  current: Model;
  theme: "light" | "dark";
  isOpen: boolean;
  onClose: () => void;
  onSelect: (model: Model) => void;
  onToggleFavorite: (model: Model) => void;
}

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

const ModelItem = ({
    model,
    view,
    theme,
    isCurrent,
    onSelectModel
}: {
    model: Model;
    view: 'list' | 'grid';
    theme: "light" | "dark";
    isCurrent: boolean;
    onSelectModel: () => void;
}) => {
    const isEnabled = model.active;
    const inactiveClasses = !isEnabled ? "opacity-50 cursor-not-allowed" : "opacity-100";
    const currentSelectionClasses = isCurrent && isEnabled ? (theme === "dark" ? "ring-1 ring-pink-500 shadow-lg shadow-pink-500/30" : "ring-1 ring-pink-500 shadow-lg shadow-pink-500/30") : "";

    const commonDivProps = {
        onClick: isEnabled ? onSelectModel : undefined,
        className: `transition duration-200 ease-in-out ${inactiveClasses} ${currentSelectionClasses} ${isEnabled ? 'cursor-pointer' : ''}`
    };

    if (view === 'list') {
        return (
            <div {...commonDivProps} className={`${commonDivProps.className} flex justify-between items-center py-4 rounded-lg ${theme === "dark" ? "hover:bg-white/10" : "hover:bg-pink-300/10"}`}>
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
        <div {...commonDivProps} className={`${commonDivProps.className} flex flex-col items-center p-2 justify-between w-26 h-36 border !border-pink-400/30 rounded-lg ${theme === "dark" ? "hover:bg-white/10" : "bg-pink-300/10 !hover:bg-white"}`}>
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
        <h2 className={`text-left mb-2 !font-semibold !text-lg ${theme === "dark" ? "!text-white" : "!text-pink-800"}`}>Unlock all models + higher limits</h2>
        <div className="flex justify-between">
            <h4 className={`text-xl ${theme === "dark" ? "!text-white" : "!text-pink-400"}`}><span className="text-pink-400 text-3xl font-bold">$8</span>/month</h4>
            <button className={`${theme === "dark" ? "bg-pink-950/80 hover:bg-pink-950" : "bg-pink-800/80 hover:bg-pink-800/60"} border !border-pink-400/30 rounded-xl font-bold text-sm text-white/80 px-4 py-2`}>Go to T3.chat</button>
        </div>
    </div>
);

const FilterMenu = ({ selectedFilters, setSelectedFilters, theme }: { selectedFilters: string[]; setSelectedFilters: (filters: string[]) => void; theme: "light" | "dark" }) => {
    const filterOptions: Record<string, { text: string; Icon: FC<any> }> = {
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
        <button onClick={() => setFavoriteMode(!favoriteMode)} className={`flex items-center justify-between gap-2 h-10 p-2 rounded-lg ${theme === "dark" ? "hover:!bg-white/10" : "hover:!bg-pink-100/50"}`}>
            {favoriteMode ? <ChevronDown className={`w-4 h-4 ${theme === "dark" ? "!text-white" : "!text-pink-800"}`} /> : <ChevronUp className={`w-4 h-4 ${theme === "dark" ? "!text-white" : "!text-pink-800"}`} />}
            <p className={`${theme === "dark" ? "!text-white" : "!text-pink-800"} text-sm`}>{favoriteMode ? "Show All" : "Favorites"}</p>
            {favoriteMode && <span className="text-pink-400 text-5xl mb-2">•</span>}
        </button>
        <div className="relative">
            <button onClick={() => setIsFilterOpen(!isFilterOpen)} className={`flex items-center justify-between gap-2 h-10 p-2 rounded-lg ${theme === "dark" ? "hover:!bg-white/10" : "hover:!bg-pink-100/50"}`}>
                <FilterIcon className={`w-4 h-4 ${theme === "dark" ? "!text-white/80" : "!text-pink-800"}`} />
            </button>
            {isFilterOpen && <FilterMenu selectedFilters={selectedFilters} setSelectedFilters={setSelectedFilters} theme={theme} />}
        </div>
    </div>
);

const ModelGridSection = ({
    title,
    models,
    theme,
    currentModelName,
    onSelectModel
}: {
    title: string;
    models: Model[];
    theme: "light" | "dark";
    currentModelName: string;
    onSelectModel: (model: Model) => void;
}) => {
    if (models.length === 0) return null;
    return (
        <div>
            <h3 className={`${theme === "dark" ? "!text-white" : "!text-pink-900"} text-left mb-2 !font-semibold !text-lg`}>{title}</h3>
            <div className="flex flex-wrap gap-2 mb-4">
                {models.map((model) => (
                    <ModelItem
                        key={model.name}
                        model={model}
                        view="grid"
                        theme={theme}
                        isCurrent={model.name === currentModelName}
                        onSelectModel={() => onSelectModel(model)}
                    />
                ))}
            </div>
        </div>
    );
};

export default function ModelPickerModal({
  models: modelsProp,
  current,
  theme,
  isOpen,
  onClose,
  onSelect,
  onToggleFavorite,
}: ModelPickerModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  const [favoriteMode, setFavoriteMode] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filteredModels = useMemo(() => {
    return modelsProp.filter(model => {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = model.name.toLowerCase().includes(searchLower) || model.info.toLowerCase().includes(searchLower);
        const matchesFilter = selectedFilters.length === 0 || selectedFilters.every(filter => model.capabilities.includes(filter));
        return matchesSearch && matchesFilter;
    });
  }, [modelsProp, searchQuery, selectedFilters]);

  const favoriteModels = useMemo(() => filteredModels.filter(model => model.favorite), [filteredModels]);
  const otherModels = useMemo(() => filteredModels.filter(model => !model.favorite), [filteredModels]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

    const commonFooterProps = { favoriteMode, setFavoriteMode, isFilterOpen, setIsFilterOpen, selectedFilters, setSelectedFilters, theme };

    if (favoriteMode) {
        return (
            <div ref={modalRef} className={`absolute bottom-full left-0 mb-2 z-[9999] pointer-events-auto`}>
                <div className={`w-[420px] px-4 py-2 rounded-lg ${theme === "dark" ? "bg-[#100A0E] text-white" : "bg-white text-black"} border ${theme === "dark" ? "border-neutral-700" : "border-neutral-300"} shadow-2xl pointer-events-auto`} onClick={(e) => e.stopPropagation()}>
                    <SearchInput searchQuery={searchQuery} setSearchQuery={setSearchQuery} theme={theme} />
                    <UpgradeCard theme={theme} />
                    <div className="max-h-[45vh] overflow-y-auto pr-1">
                        {favoriteModels.map((model) => (
                            <ModelItem
                                key={model.name}
                                model={model}
                                view="list"
                                theme={theme}
                                isCurrent={model.name === current.name}
                                onSelectModel={() => onSelect(model)}
                            />
                        ))}
                         {favoriteModels.length === 0 && <p className={`text-sm ${theme === 'dark' ? 'text-neutral-400' : 'text-neutral-600'} text-center py-4`}>No favorite models match your search/filters.</p>}
                    </div>
                    <ModalFooter {...commonFooterProps} />
                </div>
            </div>
        );
    }

    return (
        <div ref={modalRef} className={`absolute bottom-full left-0 mb-2 z-[9999] pointer-events-auto`}>
             <div className={`w-[600px] px-4 py-2 rounded-lg ${theme === "dark" ? "!bg-[#100A0E] text-white" : "!bg-white text-black"} border ${theme === "dark" ? "border-neutral-700" : "border-neutral-300"} shadow-2xl flex flex-col pointer-events-auto`} onClick={(e) => e.stopPropagation()}>
                <SearchInput searchQuery={searchQuery} setSearchQuery={setSearchQuery} theme={theme} />
                <div className="overflow-y-auto h-[70vh] pr-1 flex-grow">
                    <UpgradeCard theme={theme} />
                    <ModelGridSection title="Favorites" models={favoriteModels} theme={theme} currentModelName={current.name} onSelectModel={onSelect} />
                    <ModelGridSection title="Others" models={otherModels} theme={theme} currentModelName={current.name} onSelectModel={onSelect} />
                    {filteredModels.length === 0 && <p className={`text-sm ${theme === 'dark' ? 'text-neutral-400' : 'text-neutral-600'} text-center py-8`}>No models match your search/filters.</p>}
                </div>
                <ModalFooter {...commonFooterProps} />
            </div>
        </div>
    );
}

