import {
  ArrowUpIcon,
  ChevronDownIcon,
  GlobeIcon,
  PaperclipIcon,
} from '@/components/Icons';
import HoldTooltip from './HoldTooltip';

interface ChatInputProps {
  theme: string;
  prompt: string;
  setPrompt: (prompt: string) => void;
}

export default function ChatInput({ theme, prompt, setPrompt }: ChatInputProps) {
  return (
    <div className="absolute bottom-0 left-0 right-0 z-10 w-full px-2 pointer-events-none">
      <div className="mx-auto w-full max-w-3xl text-center pointer-events-auto">
        <div className="mt-3 flex justify-center">
          <div
            className={`rounded-t-md border border-secondary/40 bg-chat-background/50 p-4 text-sm ${
              theme === 'dark' ? 'text-white/80' : 'text-black'
            } backdrop-blur-md`}
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
        </div>

        <div
          className={`mt-2 rounded-t-[20px] border-reflect ${theme === 'dark' ? 'bg-[#251f2a]' : 'bg-[#f5d5f5]'} p-2 pb-0 backdrop-blur-lg`}
        >
          <form
            className={`relative flex flex-col items-stretch gap-2 rounded-t-xl border border-b-0 ${theme === 'dark' ? '!border-white/10 bg-[#2c2333]' : '!border-white/70 bg-[#fff0ff]'} px-3 pt-3 pb-[env(safe-area-inset-bottom)] text-secondary-foreground sm:max-w-3xl h-[7.5rem] max-sm:h-[8.3rem]`}
          >
            <textarea
              name="input"
              id="chat-input"
              placeholder="Type your message here..."
              className="w-full outline-none resize-none text-base leading-6 text-foreground outline-none placeholder:text-secondary-foreground/60 disabled:opacity-0"
              style={{ height: '48px' }}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />

            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center space-x-2 pb-2">
                <button
                  type="button"
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium hover:bg-secondary/10"
                >
                  Gemini 2.5 Flash
                  <ChevronDownIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-2xl px-2 py-2 border !border-white/10 bg-black/10 hover:bg-black/20 disabled:text-secondary/40 disabled:cursor-not-allowed"
                >
                  <GlobeIcon className="h-4 w-4" />
                  <span className="max-sm:hidden text-xs">Search</span>
                </button>

                <button
                  type="button"
                  className="px-2 py-2 border rounded-full !border-white/10 bg-black/10 hover:bg-black/20 hover:bg-secondary/10 disabled:text-secondary/40 disabled:cursor-not-allowed"
                >
                  <PaperclipIcon className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-center space-x-2">


              <HoldTooltip tooltip="Message requires text" position="top" theme={theme}>
                <button
                  type="submit"
                  disabled
                  className="rounded-md bg-primary-foreground p-1 text-white hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowUpIcon className="h-5 w-5" />
                </button>
              </HoldTooltip>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
