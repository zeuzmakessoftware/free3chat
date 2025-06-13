'use client';

import { SearchIcon, LogInIcon, ClockIcon } from '@/components/Icons';
import HoldTooltip from './HoldTooltip';
import { useSession } from 'next-auth/react';
import { CgProfile } from "react-icons/cg";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Chat } from '@/lib/supabaseClient';
import { getAnonymousId } from '@/lib/utils/anonymousId';
import Link from 'next/link';

interface SidebarProps {
  sidebarState: 'expanded' | 'collapsed';
  theme: string;
  currentChatId?: string;
  anonymousId?: string;
}

// Helper function to format dates in a human-readable way
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) {
    return 'Just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} min${diffInMinutes === 1 ? '' : 's'} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  } else {
    return date.toLocaleDateString();
  }
}

export default function Sidebar({ sidebarState, theme, currentChatId, anonymousId: propAnonymousId }: SidebarProps) {
  const isExpanded = sidebarState === 'expanded';
  const { data: session } = useSession();
  const router = useRouter();
  const [chats, setChats] = useState<Chat[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [anonymousId, setAnonymousId] = useState<string>(propAnonymousId || '');
  const [isLoading, setIsLoading] = useState(false);

  // Initialize anonymousId if not provided as prop
  useEffect(() => {
    if (!propAnonymousId) {
      const id = getAnonymousId();
      setAnonymousId(id);
    }
  }, [propAnonymousId]);

  // Fetch chats when anonymousId is available
  useEffect(() => {
    if (anonymousId) {
      fetchChats();
    }
  }, [anonymousId, session]);

  const fetchChats = async () => {
    try {
      const response = await fetch(`/api/chats?anonymousId=${anonymousId}`);
      const data = await response.json();
      
      if (data.chats) {
        setChats(data.chats);
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  };

  const handleNewChat = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ anonymousId }),
      });
      
      const data = await response.json();
      
      if (data.chat && data.chat.id) {
        router.push(`/chat/${data.chat.id}`);
      }
    } catch (error) {
      console.error('Error creating new chat:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter chats based on search query
  const filteredChats = searchQuery
    ? chats.filter(chat => chat.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : chats;

  return (
    <aside
      role="complementary"
      aria-label="Sidebar"
      className={`fixed top-0 left-0 h-full bg-gradient-to-t ${theme === 'dark' ? 'from-[#0F0A0D] to-[#1C151A]' : 'from-[#F2E1F4] to-[#F2E1F4]'} dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-lg transition-width duration-300 ease-in-out ${
        isExpanded ? 'w-64' : 'w-0'
      } overflow-visible flex flex-col z-10`}
    >
      <header className="flex items-center justify-center px-4 py-4 border-gray-200 dark:border-gray-700">
        {isExpanded ? (
          <h1 className={`text-xl !font-bold ${theme === 'dark' ? 'text-[#f2c0d7]' : 'text-[#ba4077]'}`}>OST3.chat</h1>
        ) : (
          <div className="w-6 h-6"></div>
        )}
      </header>
      <div className="flex-1 px-4 space-y-4 overflow-y-auto">
        {isExpanded && (
          <>
            <HoldTooltip tooltip="" shortcut={["⌘", "Shift", "O"]} position="right" theme={theme} className="w-full">
            <button
              onClick={handleNewChat}
              disabled={isLoading}
              className={`w-full flex border !border-[#3e183d]/50 ${theme === 'dark' ? 'bg-radial from-[#5e183d] to-[#401020] text-[#f2c0d7] hover:from-[#8e486d] hover:to-[#6e284d]' : 'bg-[#aa3067] text-[#f2f0f7] hover:bg-[#ea70a7] hover:text-[#f2f0f7]'} items-center justify-center rounded-md px-4 py-2 font-bold text-sm transition ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <span>{isLoading ? 'Creating...' : 'New Chat'}</span>
            </button>
            </HoldTooltip>
            <div className="flex items-center w-full px-1" style={{ marginTop: '0rem', borderBottom: theme === 'dark' ? '1px solid #2C252A' : '1px solid #E2C1D4' }}>
              <SearchIcon className={`h-4 w-4 ${theme === 'dark' ? 'text-[#f2c0d7]' : 'text-[#ba4077]'}`} />
              <input
                id="threads"
                type="text"
                placeholder="Search your threads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full rounded-md py-2 pl-2 pr-4 text-[14px] ${theme === 'dark' ? '!placeholder-[#927987] text-[#f2c0d7]' : '!placeholder-[#b27987] text-[#ba4077]'} bg-transparent focus:outline-none focus:ring-2 focus:ring-primary`}
              />
            </div>
            <div className="space-y-1 mt-2">
              {filteredChats.length > 0 ? (
                filteredChats.map((chat) => (
                  <Link 
                    href={`/chat/${chat.id}`} 
                    key={chat.id}
                    className={`block rounded-lg px-3 py-2 text-sm transition-colors ${chat.id === currentChatId 
                      ? theme === 'dark' 
                        ? 'bg-[#3e183d] text-[#f2c0d7]' 
                        : 'bg-[#e2a0c7] text-[#7a2a50]'
                      : theme === 'dark'
                        ? 'text-[#d8a0b7] hover:bg-[#2a1a24]'
                        : 'text-[#ba4077] hover:bg-[#f2d1e4]'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="truncate flex-1">{chat.title}</span>
                      <span className="text-xs opacity-60 flex items-center ml-1">
                        <ClockIcon className="h-3 w-3 mr-1" />
                        {formatDate(chat.updated_at)}
                      </span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className={`text-center py-4 text-sm ${theme === 'dark' ? 'text-[#927987]' : 'text-[#b27987]'}`}>
                  {searchQuery ? 'No chats found' : 'No chats yet'}
                </div>
              )}
            </div>
          </>
        )}
      </div>
      <div className="px-4 py-4">
        {isExpanded && (
          <div 
            className={`flex items-center hover:text-primary ${theme === 'dark' ? 'text-[#f2c0d7]' : 'text-[#ba4077]'}`}
          >
            {session ? 
            <>
            <button className="flex items-center gap-3 hover:bg-white/20 w-full px-4 py-2 rounded-xl">
              <CgProfile size={24} />
            <div className="flex flex-col">
            <p className={`text-sm text-left ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{session?.user?.username}</p>
            <p className={`text-xs text-left ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Free</p>
            </div>
            </button>
            </> : 
            <button onClick={() => window.open("/auth")} className="flex items-center gap-3 hover:bg-white/20 w-full p-4 rounded-xl">
              <LogInIcon className="mr-2 h-5 w-5" /> 
            <p>Login</p>
            </button>
            }
          </div>
        )}
      </div>
    </aside>
  );
}
