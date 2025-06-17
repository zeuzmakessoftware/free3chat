'use client';

import { SearchIcon, LogInIcon, XIcon } from '@/components/Icons';
import HoldTooltip from './HoldTooltip';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { CgProfile } from "react-icons/cg";
import { useEffect, useState, useCallback } from 'react';
import { Chat } from '@/types';
import Link from 'next/link';
import DeleteConfirmationModal from './DeleteConfirmationModal';

interface SidebarProps {
  sidebarState: 'expanded' | 'collapsed';
  theme: string;
  currentChatId?: string;
  anonymousId?: string;
}

const getLocalChats = (): Chat[] => {
  if (typeof window === 'undefined') return [];
  try {
    const localData = localStorage.getItem('anonymousChats');
    if (!localData) return [];
    const chats: Chat[] = JSON.parse(localData);
    return chats.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  } catch (error) {
    console.error("Failed to parse local chats", error);
    localStorage.removeItem('anonymousChats');
    return [];
  }
};

const deleteLocalChat = (chatId: string) => {
  if (typeof window === 'undefined') return;
  const chats = getLocalChats();
  const updatedChats = chats.filter(chat => chat.id !== chatId);
  localStorage.setItem('anonymousChats', JSON.stringify(updatedChats));
};

export default function Sidebar({ sidebarState, theme, currentChatId }: SidebarProps) {
  const isExpanded = sidebarState === 'expanded';
  const { data: session, status } = useSession();
  const router = useRouter();
  const [chats, setChats] = useState<Chat[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [chatToDelete, setChatToDelete] = useState<Chat | null>(null);

  const loadChats = useCallback(async () => {
    if (status === 'loading') return;

    if (session) {
      try {
        const response = await fetch(`/api/chats`);
        const data = await response.json();
        setChats(data.chats || []);
      } catch (error) {
        console.error('Error fetching user chats:', error);
        setChats([]);
      }
    } else {
      setChats(getLocalChats());
    }
  }, [status, session]);

  useEffect(() => {
    loadChats();
    window.addEventListener('chats-updated', loadChats);
    return () => {
      window.removeEventListener('chats-updated', loadChats);
    };
  }, [loadChats]);

  const handleDeleteConfirm = () => {
    if (!chatToDelete) return;
    const id = chatToDelete.id;
  
    setChats(prev => prev.filter(c => c.id !== id));
    setChatToDelete(null);
  
    if (currentChatId === id) {
      router.push('/');
    }
  
    if (session) {
      fetch(`/api/chats/${id}`, { method: 'DELETE' })
        .catch(err => {
          console.error('Failed to delete chat on server:', err);
        })
        .finally(() => {
          window.dispatchEvent(new CustomEvent('chats-updated'));
        });
    } else {
      deleteLocalChat(id);
      window.dispatchEvent(new CustomEvent('chats-updated'));
    }
  };
  

  const filteredChats = searchQuery
    ? chats.filter(chat => chat.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : chats;

  return (
    <>
      <aside
        role="complementary"
        aria-label="Sidebar"
        className={`fixed top-0 left-0 h-full bg-gradient-to-t ${theme === 'dark' ? 'from-[#0F0A0D] to-[#1C151A]' : 'bg-[#F2E1F4]'} shadow-lg transition-transform duration-300 ease-in-out ${
          isExpanded ? 'w-64' : 'w-0'
        } flex flex-col z-30`}
      >
        {isExpanded && (
          <>
        <header className="flex items-center justify-center px-4 py-4 border-b border-white/5">
          <h1 className={`text-xl font-bold ${theme === 'dark' ? 'text-[#f2c0d7]' : 'text-[#ba4077]'}`}>Free3 chat</h1>
        </header>

        <div className="flex-1 px-4 py-2 space-y-4 overflow-y-auto">
          <>
            <HoldTooltip tooltip="" shortcut={["⌘", "Shift", "O"]} position="right" theme={theme} className="w-full">
              <button
                onClick={() => router.push('/')}
                className={`w-full flex border !border-[#3e183d]/50 items-center justify-center rounded-md px-4 py-2 font-bold text-sm transition ${theme === 'dark' ? 'text-[#f2c0d7]' : 'text-[#f2f0f7]'}`}
                style={{
                  background: theme === 'dark' 
                    ? 'radial-gradient(circle at center, #5e183d, #401020)'
                    : '#aa3067',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  if (theme === 'dark') {
                    e.currentTarget.style.background = 'radial-gradient(circle at center, #8e486d, #6e284d)';
                  } else {
                    e.currentTarget.style.background = '#ea70a7';
                  }
                }}
                onMouseOut={(e) => {
                  if (theme === 'dark') {
                    e.currentTarget.style.background = 'radial-gradient(circle at center, #5e183d, #401020)';
                  } else {
                    e.currentTarget.style.background = '#aa3067';
                  }
                }}
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
                  <div key={chat.id} className="group relative">
                    <Link 
                      href={`/chat/${chat.id}`} 
                      className={`block rounded-lg px-3 py-2 text-sm transition-colors ${chat.id === currentChatId 
                        ? theme === 'dark' 
                          ? 'bg-white/10 text-[#f2c0d7]' 
                          : 'bg-[#e2a0c7] text-[#7a2a50]'
                        : theme === 'dark'
                          ? 'text-[#d8a0b7] hover:bg-[#2a1a24]'
                          : 'text-[#ba4077] hover:bg-[#f2d1e4]'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="truncate flex-1 pr-4" title={chat.title}>{chat.title}</span>
                        {/* <span className="text-xs opacity-60 flex-shrink-0 flex items-center ml-2">
                          <ClockIcon className="h-3 w-3 mr-1" />
                          {formatDate(chat.updated_at)}
                        </span> */}
                      </div>
                    </Link>
                    <button
                      onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setChatToDelete(chat);
                      }}
                      className={`absolute right-2 top-[16%] -translate-y-1/2 p-1 rounded-full opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity ${
                        theme === 'dark' ? 'text-white/80 hover:bg-white/10' : 'text-black/80 hover:bg-black/10'
                      }`}
                      title="Delete chat"
                    >
                        <XIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))
              ) : (
                <div className={`text-center py-4 text-sm ${theme === 'dark' ? 'text-[#927987]' : 'text-[#b27987]'}`}>
                  {searchQuery ? 'No chats found' : 'No chats yet'}
                </div>
              )}
            </div>
          </>
        </div>

        <div className="p-5">
            <div className={`flex items-center rounded-lg ${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-black/5'} transition-colors`}>
              {session ? (
                <Link href="/settings" className="flex items-center gap-3 w-full px-2 py-2 text-left">
                  <CgProfile size={24} className={theme === 'dark' ? 'text-white' : 'text-black'} />
                  <div className="flex flex-col">
                    <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{session.user?.username || 'User'}</p>
                    <p className={`text-xs ${theme === 'dark' ? 'text-white/70' : 'text-black/70'}`}>Free Plan</p>
                  </div>
                </Link>
              ) : (
                <button onClick={() => window.location.href = "/auth"} className={`flex items-center gap-3 w-full p-3 rounded-lg font-semibold ${theme === 'dark' ? 'text-[#f2c0d7]' : 'text-[#ba4077]'}`}>
                  <LogInIcon className="h-5 w-5" /> 
                  <span>Login</span>
                </button>
              )}
            </div>
        </div>
        </>
      )}
      </aside>

      <DeleteConfirmationModal
        isOpen={!!chatToDelete}
        onClose={() => setChatToDelete(null)}
        onConfirm={handleDeleteConfirm}
        chatTitle={chatToDelete?.title || ''}
        theme={theme}
      />
    </>
  );
}