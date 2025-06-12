import { Settings2Icon, SunMoonIcon } from '@/components/Icons';
import HoldTooltip from '@/components/HoldTooltip';

interface TopRightControlsProps {
  onToggleTheme: () => void;
  sidebarState: 'expanded' | 'collapsed';
  theme: string;
}

export default function TopRightControls({ onToggleTheme, sidebarState, theme }: TopRightControlsProps) {
  return (
    <div className="fixed right-2 top-2 z-20 max-sm:hidden" style={{ right: 'var(--firefox-scrollbar, 0.5rem)' } as React.CSSProperties}>
      <div className={`flex flex-row items-center text-muted-foreground gap-0.5 rounded-md p-1 transition-all rounded-bl-xl ${sidebarState === 'expanded' ? '' : `${theme === 'dark' ? 'bg-black/20' : 'bg-fuchsia-500/10'} rounded-lg`}`}>
        <HoldTooltip tooltip="Settings" position="bottom" theme={theme}>
          <a aria-label="Go to settings" role="button" data-state="closed" href="/settings/customization" data-discover="true">
            <button className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-muted/40 hover:text-foreground disabled:hover:bg-transparent disabled:hover:text-foreground/50 size-8 rounded-bl-xl ${theme === 'dark' ? 'hover:bg-black/30' : 'hover:bg-pink-500/10'}`}>
              <Settings2Icon className="size-4" />
            </button>
          </a>
        </HoldTooltip>
        <HoldTooltip tooltip="Theme" position="bottom" theme={theme}>
          <button
            className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-muted/40 hover:text-foreground disabled:hover:bg-transparent disabled:hover:text-foreground/50 group relative size-8 hover:bg-black/10 ${theme === 'dark' ? 'hover:bg-black/30' : 'hover:bg-pink-500/10'}`}
            tabIndex={-1}
            onClick={onToggleTheme}
            data-state="closed"
          >
            <SunMoonIcon className="absolute size-4" />
            <span className="sr-only">Toggle theme</span>
          </button>
        </HoldTooltip>
      </div>
    </div>
  );
}