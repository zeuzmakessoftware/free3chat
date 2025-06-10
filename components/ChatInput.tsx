import { ArrowUpIcon, ChevronDownIcon, GlobeIcon, PaperclipIcon } from '@/components/Icons';

export default function ChatInput({ theme }: { theme: string }) {
  return (
    <div className="pointer-events-none absolute bottom-0 z-10 w-full px-2">
      <div className="relative mx-auto flex w-full max-w-3xl flex-col text-center">
        <div className="pointer-events-auto mx-auto w-fit">
          <div className="m-3 -mb-px flex justify-center">
            <div className={`rounded-t-md border border-secondary/40 bg-chat-background/50 p-4 text-sm ${theme === 'dark' ? 'text-white/80' : 'text-black'} backdrop-blur-md blur-fallback:bg-chat-background`}>
              Make sure you agree to our <a href="/terms-of-service" className="underline font-semibold">Terms</a> and our <a href="/privacy-policy" className="underline font-semibold">Privacy Policy</a>
            </div>
          </div>
        </div>
        <div className="pointer-events-auto">
          <div className="border-reflect rounded-t-[20px] bg-[--chat-input-background] p-2 pb-0 backdrop-blur-lg ![--c:--chat-input-gradient]" style={{ '--gradientBorder-gradient': 'linear-gradient(180deg, var(--min), var(--max), var(--min)), linear-gradient(15deg, var(--min) 50%, var(--max))', '--start': '#000000e0', '--opacity': '1' } as React.CSSProperties}>
            <form className="relative flex w-full flex-col items-stretch gap-2 rounded-t-xl border border-b-0 border-white/70 bg-[--chat-input-background] px-3 pt-3 text-secondary-foreground outline outline-8 outline-[hsl(var(--chat-input-gradient)/0.5)] pb-safe-offset-3 max-sm:pb-6 sm:max-w-3xl dark:border-[hsl(0,0%,83%)]/[0.04] dark:bg-secondary/[0.045] dark:outline-chat-background/40" style={{ boxShadow: 'rgba(0, 0, 0, 0.1) 0px 80px 50px 0px, rgba(0, 0, 0, 0.07) 0px 50px 30px 0px, rgba(0, 0, 0, 0.06) 0px 30px 15px 0px, rgba(0, 0, 0, 0.04) 0px 15px 8px, rgba(0, 0, 0, 0.04) 0px 6px 4px, rgba(0, 0, 0, 0.02) 0px 2px 2px' }}>
              <div className="flex flex-grow flex-col">
                <div className="flex flex-grow flex-row items-start">
                  <textarea name="input" id="chat-input" placeholder="Type your message here..." className="w-full resize-none bg-transparent text-base leading-6 text-foreground outline-none placeholder:text-secondary-foreground/60 disabled:opacity-0" style={{ height: '48px' }}></textarea>
                </div>
                <div className="-mb-px mt-2 flex w-full flex-row-reverse justify-between">
                  <div className="-mr-0.5 -mt-0.5 flex items-center justify-center gap-2" aria-label="Message actions">
                    <button type="submit" disabled className="..."><ArrowUpIcon className="!size-5" /></button>
                  </div>
                  <div className="flex flex-col gap-2 pr-2 sm:flex-row sm:items-center">
                    <div className="ml-[-7px] flex items-center gap-1">
                      <button type="button" className="..."><div className="text-left text-sm font-medium">Gemini 2.5 Flash</div><ChevronDownIcon className="right-0 size-4" /></button>
                      <button type="button" className="..."><GlobeIcon className="h-4 w-4" /><span className="max-sm:hidden">Search</span></button>
                      <button type="button" className="..."><PaperclipIcon className="size-4" /></button>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
// NOTE: I've truncated the repetitive button classes for brevity. Copy the full classes from the original.