import { PanelLeftIcon, SearchIcon, PlusIcon } from '@/components/Icons';
import Link from 'next/link';

interface SidebarTriggerProps {
  onToggle: () => void;
}

export default function SidebarTrigger({ onToggle }: SidebarTriggerProps) {
  return (
    <div className="pointer-events-auto fixed left-4 top-3 z-50 flex flex-row gap-0.5 top-safe-offset-2">
      <div className="duration-250 pointer-events-none absolute inset-0 right-auto -z-10 w-10 rounded-md bg-transparent backdrop-blur-sm transition-[background-color,width] delay-0 max-sm:delay-125 max-sm:duration-125 max-sm:w-[6.75rem] max-sm:bg-sidebar/50"></div>
      <button
        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-muted/40 hover:text-foreground disabled:hover:bg-transparent disabled:hover:text-foreground/50 z-10 h-8 w-8 text-muted-foreground"
        data-sidebar="trigger"
        onClick={onToggle}
      >
        <PanelLeftIcon />
        <span className="sr-only">Toggle Sidebar</span>
      </button>
      {/* Other buttons that were grouped with the trigger */}
      <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-muted/40 hover:text-foreground disabled:hover:bg-transparent disabled:hover:text-foreground/50 duration-250 size-8 translate-x-0 text-muted-foreground opacity-100 transition-[transform,opacity] delay-150 sm:pointer-events-none sm:-translate-x-[2.125rem] sm:opacity-0 sm:delay-0 sm:duration-150">
        <SearchIcon />
        <span className="sr-only">Search</span>
      </button>
      <Link className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-muted/40 hover:text-foreground disabled:hover:bg-transparent disabled:hover:text-foreground/50 size-8 translate-x-0 text-muted-foreground transition-[transform,opacity] delay-150 duration-150 sm:pointer-events-none sm:-translate-x-[2.125rem] sm:opacity-0 sm:delay-0 sm:duration-150 pointer-events-none opacity-25" aria-disabled="true" href="/" data-discover="true">
        <PlusIcon />
        <span className="sr-only">New Thread</span>
      </Link>
    </div>
  );
}