import React, { useState } from 'react';
import { SparklesIcon, NewspaperIcon, CodeIcon, GraduationCapIcon } from '@/components/Icons';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';

interface WelcomeScreenProps {
  theme: string;
  setPrompt: (prompt: string) => void;
  isHome: boolean | undefined;
}

export default function WelcomeScreen({ theme, setPrompt, isHome }: WelcomeScreenProps) {
  const options = {
    Create: {
      icon: SparklesIcon,
      description: 'Create something new',
    },
    Explore: {
      icon: NewspaperIcon,
      description: 'Explore something new',
    },
    Code: {
      icon: CodeIcon,
      description: 'Code something new',
    },
    Learn: {
      icon: GraduationCapIcon,
      description: 'Learn something new',
    },
  } as const;

  const initialQuestions = [
    'What is AI?',
    'What is machine learning?',
    'What is deep learning?',
    'What is reinforcement learning?',
  ];

  const questionMap: Record<keyof typeof options, string[]> = {
    Create: ['Generate a poem about the ocean', 'Design a logo for a coffee shop', 'Outline a blog post about Next.js 14'],
    Explore: ["Show me today's headlines in tech", 'Discover a new recipe for pasta', 'Find trending articles on space exploration'],
    Code: ['Generate a React hook for fetching data', 'Debug this Python function for me', 'Convert this JavaScript snippet to TypeScript'],
    Learn: ['Explain recursion with a simple analogy', 'Teach me the basics of calculus', 'What is cryptography and how does it work?'],
  };

  const [activeTab, setActiveTab] = useState<keyof typeof options | null>(null);
  const questionsToShow = activeTab ? questionMap[activeTab] : initialQuestions;
  const { data: session } = useSession();
  const username = session?.user?.username;

  return (
    <motion.div
      className={`mx-auto flex w-full max-w-3xl flex-col space-y-12 px-4 pb-10 pt-safe-offset-10 ${
        theme === 'dark' ? 'dark' : ''
      }`}
      animate={{ scale: [0.95, 1], opacity: [0, 1] }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      {isHome && (
        <div className="flex h-[calc(100vh-20rem)] p-7 items-start justify-center">
          <div className="w-full space-y-6 px-2 pt-[calc(max(15vh,2.5rem))] duration-300 animate-in fade-in-50 zoom-in-95 sm:px-8">
            <div role="heading" aria-level={2} className="text-3xl font-bold">
              {session ? `How can I help you, ${username?.split(' ')[0]}?` : `How can I help you?`}
            </div>

            <div className="flex flex-row flex-wrap gap-2.5 text-sm max-sm:justify-evenly">
              {Object.entries(options).map(([key, { icon: Icon }]) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as keyof typeof options)}
                  className={`
                    flex items-center gap-2
                    px-5 py-2
                    sm:rounded-[40px] rounded-[15px]
                    border ${theme === 'dark' ? 'border-white/10' : '!border-pink-500/20'}
                    max-sm:w-16 max-sm:h-16 max-sm:p-0 max-sm:justify-center max-sm:flex-col
                    transition-all
                    ${
                      activeTab === key
                        ? `${theme === 'dark' ? 'bg-pink-800/40 opacity-100 hover:bg-pink-700/50 border-pink-500/20' : 'text-white bg-pink-800/80 opacity-100 hover:bg-pink-700/50'}`
                        : `${theme === 'dark' ? 'bg-indigo-300/5 opacity-80 hover:bg-indigo-300/10 hover:opacity-100' : 'bg-pink-300/20 opacity-80 hover:bg-pink-200 hover:opacity-100'}`
                    }
                  `}
                >
                  <Icon className="max-sm:block max-sm:h-6 max-sm:w-6" />
                  <span className="font-semibold text-[14px]">{key}</span>
                </button>
              ))}
            </div>

            <div className="flex flex-col text-foreground">
              {questionsToShow.map((q, i) => (
                <div key={i} className="flex items-start gap-2 border-b border-secondary/40 py-1 first:border-t first:border-secondary/40">
                  <button onClick={() => setPrompt(q)} className={`w-full rounded-md py-2 text-left text-secondary-foreground ${theme === 'dark' ? 'hover:bg-purple-300/5' : 'hover:bg-pink-200/50'} sm:px-3`}>
                    <span className="opacity-80">{q}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}