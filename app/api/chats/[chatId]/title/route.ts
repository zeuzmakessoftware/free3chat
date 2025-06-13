import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  return handlePostRequest(req);
}

async function handlePostRequest(req: Request) {
  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const chatId = pathParts[pathParts.indexOf('chats') + 1];
    const { anonymousId } = await req.json();
    
    // Verify the user has access to this chat
    const session = await getServerSession(authOptions);
    
    let chatQuery = supabase.from('chats').select('*').eq('id', chatId);
    
    if (session?.user?.id) {
      chatQuery = chatQuery.eq('user_id', session.user.id);
    } else if (anonymousId) {
      chatQuery = chatQuery.eq('anonymous_id', anonymousId);
    } else {
      return NextResponse.json({ error: 'No user ID or anonymous ID provided' }, { status: 400 });
    }
    
    const { data: chat, error: chatError } = await chatQuery.single();
    
    if (chatError || !chat) {
      console.error('Error fetching chat or unauthorized:', chatError);
      return NextResponse.json({ error: 'Chat not found or unauthorized' }, { status: 404 });
    }
    
    // Get the first few messages to generate a title
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true })
      .limit(3);
    
    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
      return NextResponse.json({ error: messagesError.message }, { status: 500 });
    }
    
    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'No messages found in chat' }, { status: 400 });
    }
    
    // Initialize the AI model
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "Missing Gemini API Key" }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Create a prompt to generate a title
    const firstUserMessage = messages.find(msg => msg.role === 'user')?.content || '';
    const prompt = `Based on this conversation, generate a very short, concise title (4-6 words max). 
    Don't use quotes in your response. Just return the title text.
    
    User: ${firstUserMessage}`;
    
    // Generate the title
    const result = await model.generateContent(prompt);
    const title = result.response.text().trim();
    
    // Update the chat title
    const { data: updatedChat, error: updateError } = await supabase
      .from('chats')
      .update({ title })
      .eq('id', chatId)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error updating chat title:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
    
    return NextResponse.json({ chat: updatedChat });
  } catch (error) {
    console.error('Error in POST /api/chats/[chatId]/title:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
