// components/Sidebar.tsx
'use client';

import { SearchIcon, LogInIcon, ClockIcon } from '@/components/Icons';
import HoldTooltip from './HoldTooltip';
import { useSession } from 'next-auth/react';
import { CgProfile } from "react-icons/cg";
import { useEffect, useState, useCallback } from 'react';
import { Chat } from '@/types';
import Link from 'next/link';

// Helper function to format dates in a human-readable way
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString();
}

export default function Sidebar({ sidebarState, theme, currentChatId, anonymousId }: SidebarProps) {
  const isExpanded = sidebarState === 'expanded';
  const { data: session } = useSession();
  const [chats, setChats] = useState<Chat[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchChats = useCallback(async () => {
    if (!anonymousId) return;
    try {
      const response = await fetch(`/api/chats?anonymousId=${anonymousId}`);
      const data = await response.json();
      if (data.chats) {
        setChats(data.chats);
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  }, [anonymousId]);

  useEffect(() => {
    fetchChats();
    // Listen for custom event to refetch chats
    window.addEventListener('chats-updated', fetchChats);
    return () => {
      window.removeEventListener('chats-updated', fetchChats);
    };
  }, [fetchChats]);

  const filteredChats = searchQuery
    ? chats.filter(chat => chat.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : chats;

  return (
    <aside
      role="complementary"
      aria-label="Sidebar"
      className={`fixed top-0 left-0 h-full bg-gradient-to-t ${theme === 'dark' ? 'from-[#0F0A0D] to-[#1C151A]' : 'bg-[#F2E1F4]'} shadow-lg transition-transform duration-300 ease-in-out ${
        isExpanded ? 'translate-x-0' : '-translate-x-full'
      } w-64 flex flex-col z-30`}
    >
      <header className="flex items-center justify-center px-4 py-4 border-b border-white/5">
        <h1 className={`text-xl font-bold ${theme === 'dark' ? 'text-[#f2c0d7]' : 'text-[#ba4077]'}`}>OST3.chat</h1>
      </header>

      <div className="flex-1 px-4 py-2 space-y-4 overflow-y-auto">
        <>
          <HoldTooltip tooltip="" shortcut={["⌘", "Shift", "O"]} position="right" theme={theme} className="w-full">
            <button
              onClick={() => window.location.href = '/'}
              className={`w-full flex border !border-[#3e183d]/50 ${theme === 'dark' ? 'bg-radial from-[#5e183d] to-[#401020] text-[#f2c0d7] hover:from-[#8e486d] hover:to-[#6e284d]' : 'bg-[#aa3067] text-[#f2f0f7] hover:bg-[#ea70a7] hover:text-[#f2f0f7]'} items-center justify-center rounded-md px-4 py-2 font-bold text-sm transition`}
            >
              <span>New Chat</span>
            </button>
          </HoldTooltip>
          <div className="flex items-center w-full px-1" style={{ marginTop: '0rem', borderBottom: theme === 'dark' ? '1px solid #2C252A' : '1px solid #E2C1D4' }}>
            <SearchIcon className={`h-4 w-4 ${theme === 'dark' ? 'text-[#f2c0d7]' : 'text-[#ba4077]'}`} />
            <input
              id="threads"
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full rounded-md py-2 pl-2 pr-4 text-[14px] ${theme === 'dark' ? '!placeholder-[#927987] text-[#f2c0d7]' : '!placeholder-[#b27987] text-[#ba4077]'} bg-transparent focus:outline-none`}
            />
          </div>
          <div className="space-y-1 mt-2 flex-grow overflow-y-auto">
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
                    <span className="truncate flex-1" title={chat.title}>{chat.title}</span>
                    <span className="text-xs opacity-60 flex-shrink-0 flex items-center ml-2">
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
      </div>

      <div className="p-2 border-t border-white/5">
          <div className={`flex items-center rounded-lg ${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-black/5'} transition-colors`}>
            {session ? (
              <button className="flex items-center gap-3 w-full px-2 py-2 text-left">
                <CgProfile size={24} className={theme === 'dark' ? 'text-white' : 'text-black'} />
                <div className="flex flex-col">
                  <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{session.user?.name || 'User'}</p>
                  <p className={`text-xs ${theme === 'dark' ? 'text-white/70' : 'text-black/70'}`}>Free Plan</p>
                </div>
              </button>
            ) : (
              <button onClick={() => window.open("/auth")} className={`flex items-center gap-3 w-full p-3 rounded-lg font-semibold ${theme === 'dark' ? 'text-[#f2c0d7]' : 'text-[#ba4077]'}`}>
                <LogInIcon className="h-5 w-5" /> 
                <span>Login</span>
              </button>
            )}
          </div>
      </div>
    </aside>
  );
}

interface SidebarProps {
  sidebarState: 'expanded' | 'collapsed';
  theme: string;
  currentChatId?: string;
  anonymousId?: string;
}