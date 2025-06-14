// app/api/chats/[chatId]/title/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request, { params }: { params: { chatId: string } }) {
  try {
    const { chatId } = params;
    if (!chatId) {
        return NextResponse.json({ error: 'Chat ID is missing' }, { status: 400 });
    }
    const { anonymousId } = await req.json();
    
    const session = await getServerSession(authOptions);
    
    let chatQuery = supabase.from('chats').select('id').eq('id', chatId);
    if (session?.user?.id) {
      chatQuery = chatQuery.eq('user_id', session.user.id);
    } else if (anonymousId) {
      chatQuery = chatQuery.eq('anonymous_id', anonymousId);
    } else {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { data: chat, error: chatError } = await chatQuery.single();
    
    if (chatError || !chat) {
      return NextResponse.json({ error: 'Chat not found or unauthorized' }, { status: 404 });
    }
    
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('content')
      .eq('chat_id', chatId)
      .eq('role', 'user')
      .order('created_at', { ascending: true })
      .limit(1);
    
    if (messagesError || !messages || messages.length === 0) {
      return NextResponse.json({ error: 'No user message found to generate title' }, { status: 400 });
    }
    
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "Missing Gemini API Key" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const firstUserMessage = messages[0].content;
    const prompt = `Generate a very short, concise title (4 words max) for a conversation that starts with: "${firstUserMessage}". Do not use quotes or any other formatting in your response. Just return the plain text title.`;
    
    const result = await model.generateContent(prompt);
    let title = result.response.text().trim().replace(/"/g, ''); // Clean up response
    if (!title) title = "Untitled Chat"; // Fallback title
    
    const { data: updatedChat, error: updateError } = await supabase
      .from('chats')
      .update({ title })
      .eq('id', chatId)
      .select()
      .single();
    
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
    
    return NextResponse.json({ chat: updatedChat });
  } catch (error) {
    console.error('Error in POST /api/chats/[chatId]/title:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}