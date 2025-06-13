"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { getAnonymousId } from "@/lib/utils/anonymousId";

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    // Create a new chat and redirect to it
    const createNewChat = async () => {
      try {
        // Get or create anonymous ID
        const anonymousId = getAnonymousId();
        
        // Create a new chat
        const response = await fetch('/api/chats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ anonymousId }),
        });
        
        const data = await response.json();
        
        if (data.chat && data.chat.id) {
          // Redirect to the new chat
          router.push(`/chat/${data.chat.id}`);
        } else {
          console.error('Failed to create chat:', data);
          // Fallback to a client-side UUID if API fails
          const fallbackChatId = uuidv4();
          router.push(`/chat/${fallbackChatId}`);
        }
      } catch (error) {
        console.error('Error creating chat:', error);
        // Fallback to a client-side UUID if API fails
        const fallbackChatId = uuidv4();
        router.push(`/chat/${fallbackChatId}`);
      }
    };
    
    createNewChat();
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#F2E1F4] dark:bg-[#1C151A]">
      <div className="text-center">
        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-t-[#ba4077] mx-auto"></div>
        <p className="text-[#ba4077] dark:text-[#f2c0d7]">Creating a new chat...</p>
      </div>
    </div>
  );
}