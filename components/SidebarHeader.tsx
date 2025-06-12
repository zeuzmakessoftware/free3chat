import { Logo, SearchIcon } from '@/components/Icons';
import Link from 'next/link';
export default function SidebarHeader() {
  return (
    <div data-sidebar="header" className="flex flex-col gap-2 relative m-1 mb-0 space-y-1 p-0 !pt-safe">
      <h1 className="flex h-8 shrink-0 items-center justify-center text-lg text-muted-foreground transition-opacity delay-75 duration-75">
        <Link className="relative flex h-8 w-24 items-center justify-center text-sm font-semibold text-foreground" href="/" data-discover="true">
          <div className="h-3.5 select-none">
            <Logo className="size-full text-[--wordmark-color]" />
          </div>
        </Link>
      </h1>
      <div className="px-1">
        <Link className="inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border-reflect button-reflect rounded-lg bg-[rgb(162,59,103)] p-2 font-semibold text-primary-foreground shadow hover:bg-[#d56698] active:bg-[rgb(162,59,103)] disabled:hover:bg-[rgb(162,59,103)] disabled:active:bg-[rgb(162,59,103)] dark:bg-primary/20 dark:hover:bg-pink-800/70 dark:active:bg-pink-800/40 disabled:dark:hover:bg-primary/20 disabled:dark:active:bg-primary/20 h-9 px-4 py-2 w-full select-none text-sm" href="/" data-discover="true">
          <span className="w-full select-none text-center" data-state="closed" onClick={() => window.location.reload()}>New Chat</span>
        </Link>
      </div>
      <div className="border-b border-chat-border px-3">
        <div className="flex items-center">
          <SearchIcon className="lucide lucide-search -ml-[3px] mr-3 !size-4 text-muted-foreground" />
          <input
            role="searchbox"
            aria-label="Search threads"
            placeholder="Search your threads..."
            className="w-full bg-transparent py-2 text-sm text-foreground placeholder-muted-foreground/50 placeholder:select-none focus:outline-none"
            defaultValue=""
          />
        </div>
      </div>
    </div>
  );
}