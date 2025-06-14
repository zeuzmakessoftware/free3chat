// app/api/chats/[chatId]/messages/[messageId]/stream/route.ts
import { supabase } from '@/lib/supabaseClient';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from 'next/server';
import { Message } from '@/types';

// Using Node.js runtime for full API compatibility with Supabase
export const runtime = 'nodejs';

async function getChatHistory(chatId: string): Promise<{role: string; parts: { text: string; }[] }[]> {
  // --- THIS IS THE FIX ---
  // We need to select all fields ('*') to match the 'Message' type.
  const { data, error } = await supabase
    .from('messages')
    .select('*') // Changed from .select('role, content')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true })
    .limit(20); // Limit context window for performance and cost

  if (error || !data) {
    console.error("Error fetching chat history:", error);
    return [];
  }
  
  // The type annotations below are now correct because `data` contains full Message objects
  return data
    .filter((msg: Message) => msg.content) // Filter out any empty/placeholder messages
    .map((msg: Message) => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));
}

export async function POST(req: Request, { params }: { params: { chatId: string; messageId: string } }) {
  try {
    const { chatId, messageId } = params;
    const { anonymousId } = await req.json();
    
    const session = await getServerSession(authOptions);
    
    // Authorization: Check if the user/anonId owns the chat
    let chatQuery = supabase.from('chats').select('id').eq('id', chatId);
    if (session?.user?.id) {
      chatQuery = chatQuery.eq('user_id', session.user.id);
    } else if (anonymousId) {
      chatQuery = chatQuery.eq('anonymous_id', anonymousId);
    } else {
      return NextResponse.json({ error: 'Unauthorized: No identifiers provided.' }, { status: 401 });
    }
    const { data: chat, error: chatError } = await chatQuery.single();

    if (chatError || !chat) {
      return NextResponse.json({ error: 'Chat not found or you do not have permission to access it.' }, { status: 404 });
    }
    
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Missing Gemini API Key' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // The history will contain the latest user message.
    const history = await getChatHistory(chatId);
    const chatSession = model.startChat({ history });
    
    // The prompt is empty because the message we want a response to is the last one in the history.
    const result = await chatSession.sendMessageStream("");

    const stream = new ReadableStream({
      async start(controller) {
        let fullResponse = '';
        const encoder = new TextEncoder();
        try {
          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            fullResponse += chunkText;
            controller.enqueue(encoder.encode(chunkText));
          }
          
          // Only update the database ONCE after the entire stream is finished.
          if (fullResponse) {
            await supabase
              .from('messages')
              .update({ content: fullResponse })
              .eq('id', messageId);
            
            await supabase
              .from('chats')
              .update({ updated_at: new Date().toISOString() })
              .eq('id', chatId);
          }
        } catch (streamError) {
          console.error("Error during stream processing:", streamError);
          controller.error(streamError);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" }
    });    
  } catch (error) {
    console.error("Error in chat streaming API:", error);
    return NextResponse.json({ error: "An error occurred while processing your request." }, {
      status: 500,
    });
  }
}