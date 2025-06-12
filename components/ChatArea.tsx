import TopRightControls from '@/components/TopRightControls';
import WelcomeScreen from './WelcomeScreen';
import ChatInput from './ChatInput';
import TopRightCurve from '@/components/TopRightCurve';
import { useEffect, useState } from 'react';

interface ChatAreaProps {
  onToggleTheme: () => void;
  theme: string;
  sidebarState: 'expanded' | 'collapsed';
  prompt: string;
  setPrompt: (prompt: string) => void;
}

export default function ChatArea({ onToggleTheme, theme, sidebarState, prompt, setPrompt }: ChatAreaProps) {
  const [showWelcome, setShowWelcome] = useState(true);
  
  useEffect(() => {
    if (prompt) {
      setShowWelcome(false);
    }
    else {
      setShowWelcome(true);
    }
  }, [prompt]);
  
  return (
    <main className="firefox-scrollbar-margin-fix min-h-pwa relative flex w-full flex-1 flex-col overflow-hidden transition-[width,height]">
      <div className={`absolute bottom-0 ${sidebarState === 'expanded' ? 'top-4' : 'top-0'} w-full overflow-hidden border-l border-t border-chat-border bg-chat-background bg-fixed pb-[140px] transition-all ease-snappy max-sm:border-none sm:translate-y-3.5 ${sidebarState === 'expanded' ? 'sm:rounded-tl-xl' : ''}`}>
        <div className="bg-noise absolute inset-0 -top-3.5 bg-fixed transition-transform ease-snappy [background-position:right_bottom]"></div>
      </div>

      <div className="absolute bottom-0 top-0 w-full">
        <div className="fixed right-0 top-0 max-sm:hidden">
          {sidebarState === 'expanded' && (
            <TopRightCurve theme={theme} />
          )}
        </div>
        <ChatInput theme={theme} prompt={prompt} setPrompt={setPrompt} />
      </div>

      <div className="absolute inset-0 overflow-y-scroll sm:pt-3.5" style={{ paddingBottom: '144px', scrollbarGutter: 'stable both-edges' }}>
        <TopRightControls onToggleTheme={onToggleTheme} sidebarState={sidebarState} theme={theme} />
        
        <div role="log" aria-label="Chat messages" aria-live="polite">
          {showWelcome && <WelcomeScreen theme={theme} prompt={prompt} setPrompt={setPrompt} />}
        </div>
      </div>
    </main>
  );
}