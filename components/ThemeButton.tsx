import HoldTooltip from "./HoldTooltip";
import { SunMoonIcon } from "@/components/Icons";

export default function ThemeButton({ theme, onToggleTheme }: { theme: string; onToggleTheme: () => void }) {
  return (
    <HoldTooltip tooltip="Theme" position="bottom" theme={theme}>
    <button
      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-muted/40 hover:text-foreground disabled:hover:bg-transparent disabled:hover:text-foreground/50 size-8 rounded-bl-xl ${theme === 'dark' ? 'hover:bg-black/30' : 'hover:bg-pink-500/10'}`}
      tabIndex={-1}
      onClick={onToggleTheme}
      data-state="closed"
  >
    <SunMoonIcon className="absolute size-4" />
    <span className="sr-only">Toggle theme</span>
  </button>
  </HoldTooltip>
  );
}