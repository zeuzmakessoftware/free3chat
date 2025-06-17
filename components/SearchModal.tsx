"use client";

import { Clock, Plus, Search } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from 'framer-motion';
import { Chat } from "@/types";
import { useSession } from "next-auth/react";
import Link from 'next/link';
import { getAnonymousId } from "@/lib/utils/anonymousId";

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    theme: string;
}

const SearchModal = ({ isOpen, onClose, theme }: SearchModalProps) => {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [chats, setChats] = useState<Chat[]>([]);
    const [filteredChats, setFilteredChats] = useState<Chat[]>([]);
    const { data: session, status } = useSession();
    const inputRef = useRef<HTMLInputElement>(null);

    const loadChats = useCallback(async () => {
        if (status === 'loading') return;

        let fetchedChats: Chat[] = [];
        if (session) {
            try {
                const response = await fetch(`/api/chats`);
                const data = await response.json();
                fetchedChats = data.chats || [];
            } catch (error) {
                console.error('Error fetching user chats:', error);
            }
        } else {
            if (typeof window !== 'undefined') {
                try {
                    const localData = localStorage.getItem('anonymousChats');
                    fetchedChats = localData ? JSON.parse(localData) : [];
                } catch (error) {
                    console.error("Failed to parse local chats", error);
                    localStorage.removeItem('anonymousChats');
                }
            }
        }
        const sortedChats = fetchedChats.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
        setChats(sortedChats);
    }, [status, session]);

    useEffect(() => {
        if (isOpen) {
            loadChats();
            window.addEventListener('chats-updated', loadChats);
        }
        return () => {
            window.removeEventListener('chats-updated', loadChats);
        };
    }, [isOpen, loadChats]);
    
    useEffect(() => {
        if (isOpen) {
            const lowerCaseQuery = query.toLowerCase();
            const results = query
                ? chats.filter(chat => chat.title.toLowerCase().includes(lowerCaseQuery))
                : chats;
            setFilteredChats(results.slice(0, 5)); // Limit results
        }
    }, [query, chats, isOpen]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            setTimeout(() => inputRef.current?.focus(), 100);
        } else {
            setQuery(""); // Reset query on close
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    const handleEnter = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            onClose();
            if (query.trim()) {
                const anonymousId = getAnonymousId();
                const res = await fetch('/api/chats', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ anonymousId, modelId: "gemini-1.5-flash" }),
                  });
                  
                const { chat } = await res.json();
                if (chat && chat.id) {
                    router.push(`/chat/${chat.id}?prompt=${encodeURIComponent(query)}`);
                } else {
                    console.error("Failed to create new chat");
                }
            } else {
                router.push('/');
            }
        }
    };
    
    return (
        <AnimatePresence>
            {isOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.98 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                        className={`relative flex flex-col gap-4 p-4 shadow-lg min-w-[500px] rounded-lg max-w-[95%] ${
                            theme === 'dark'
                                ? 'bg-[#1C151A] text-white border border-white/10'
                                : 'bg-white text-black border'
                        }`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-2">
                            <Search className="w-5 h-5 text-pink-500" />
                            <input
                                ref={inputRef}
                                type="text"
                                id="search-input"
                                placeholder="Search chats or press Enter to start new..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={handleEnter}
                                className={`w-full border-none bg-transparent focus:outline-none ${theme === 'dark' ? 'text-white placeholder:!text-white/50' : 'text-black placeholder:!text-black/50'}`}
                            />
                        </div>
                        <div>
                            <div className={`w-full h-[1px] ${theme === 'dark' ? 'bg-white/10' : 'bg-pink-400/30'} mb-2`}></div>
                            {filteredChats.length > 0 && (
                                <div className="flex items-center gap-2 mb-2">
                                    <Clock className={`w-3 h-3 ${theme === 'dark' ? 'text-white/70' : 'text-black/70'}`} />
                                    <h2 className={`text-sm font-semibold ${theme === 'dark' ? 'text-white/70' : 'text-black/70'}`}>Recent Chats</h2>
                                </div>
                            )}
                            <div className="ml-2 flex flex-col gap-1">
                                {filteredChats.length > 0 ? (
                                    filteredChats.map(chat => (
                                        <Link href={`/chat/${chat.id}`} key={chat.id} onClick={onClose}
                                          className={`block text-sm p-2 rounded-md cursor-pointer ${theme === 'dark' ? 'text-white/90 hover:bg-white/10' : 'text-black/90 hover:bg-pink-100/50'}`}
                                        >
                                            {chat.title}
                                        </Link>
                                    ))
                                ) : (
                                    <p className={`text-sm text-center py-4 ${theme === 'dark' ? 'text-white/50' : 'text-black/50'}`}>
                                        {query ? "No chats found." : "No recent chats."}
                                    </p>
                                )}
                            </div>
                             <div className={`w-full h-[1px] ${theme === 'dark' ? 'bg-white/10' : 'bg-pink-400/30'} mt-4 mb-2`}></div>
                             <button
                                onClick={() => {
                                    onClose();
                                    router.push('/');
                                }}
                                className={`w-full flex items-center gap-3 p-2 rounded-md text-sm ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-pink-100/50'}`}
                             >
                                <Plus className="w-4 h-4" />
                                New Chat
                             </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

export default SearchModal;