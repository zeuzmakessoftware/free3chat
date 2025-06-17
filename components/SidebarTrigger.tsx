// components/SidebarTrigger.tsx
import { PanelLeftIcon, SearchIcon, PlusIcon } from '@/components/Icons';
import { motion } from 'framer-motion';

interface SidebarTriggerProps {
  onToggle: () => void;
  sidebarState: 'expanded' | 'collapsed';
  theme: string;
  onSearchClick: () => void;
}

export default function SidebarTrigger({ onToggle, sidebarState, theme, onSearchClick }: SidebarTriggerProps) {
  const isExpanded = sidebarState === 'expanded';
  
  const iconVariants = {
    expanded: { x: -60, opacity: 0 },
    collapsed: (custom: number) => ({
      x: 0,
      opacity: custom,
      transition: {
        duration: 0.09,
        type: 'easeInOut',
        stiffness: 260,
        damping: 20,
        delay: custom === 0.25 ? 0.1 : 0,
      }
    })
  };
  return (
    <div className={`pointer-events-auto fixed left-2 top-2 z-50 flex flex-row gap-0.5 top-safe-offset-2 p-1 ${sidebarState === 'expanded' ? '' : `${theme === 'dark' ? 'bg-black/20' : 'bg-fuchsia-500/10'} rounded-lg`}`}>
      <div className="duration-250 pointer-events-none absolute inset-0 right-auto -z-10 w-10 rounded-md bg-transparent backdrop-blur-sm transition-[background-color,width] delay-0 max-sm:delay-125 max-sm:duration-125 max-sm:w-[6.75rem] max-sm:bg-sidebar/50"></div>
      <button
        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-muted/40 hover:text-foreground disabled:hover:bg-transparent disabled:hover:text-foreground/50 z-10 h-8 w-8 text-muted-foreground"
        data-sidebar="trigger"
        onClick={onToggle}
      >
        <PanelLeftIcon />
        <span className="sr-only">Toggle Sidebar</span>
      </button>
      <motion.button 
        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-muted/40 hover:text-foreground disabled:hover:bg-transparent disabled:hover:text-foreground/50 size-8 text-muted-foreground"
        variants={iconVariants}
        animate={isExpanded ? 'expanded' : 'collapsed'}
        custom={1}
        initial={false}
        onClick={onSearchClick}
      >
        <SearchIcon />
        <span className="sr-only">Search</span>
      </motion.button>
      <motion.a 
        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-muted/40 hover:text-foreground disabled:hover:bg-transparent disabled:hover:text-foreground/50 size-8 text-muted-foreground pointer-events-none"
        variants={iconVariants}
        animate={isExpanded ? 'expanded' : 'collapsed'}
        custom={0.45}
        initial={false}
        aria-disabled="true" 
        href="/" 
        data-discover="true"
      >
        <PlusIcon />
        <span className="sr-only">New Thread</span>
      </motion.a>
    </div>
  );
}