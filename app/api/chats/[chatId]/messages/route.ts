import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
  return handleGetRequest(req);
}

async function handleGetRequest(req: Request) {
  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const chatId = pathParts[pathParts.indexOf('chats') + 1];
    
    const session = await getServerSession(authOptions);
    const anonymousId = url.searchParams.get('anonymousId');
    
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
    
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });
    
    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
      return NextResponse.json({ error: messagesError.message }, { status: 500 });
    }
    
    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error in GET /api/chats/[chatId]/messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  return handlePostRequest(req);
}

async function handlePostRequest(req: Request) {
  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const chatId = pathParts[pathParts.indexOf('chats') + 1];
    const { content } = await req.json();
    
    const session = await getServerSession(authOptions);
    const anonymousId = url.searchParams.get('anonymousId');
    
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
    
    const { data: userMessage, error: userMessageError } = await supabase
      .from('messages')
      .insert({
        chat_id: chatId,
        role: 'user',
        content,
      })
      .select()
      .single();
    
    if (userMessageError) {
      console.error('Error saving user message:', userMessageError);
      return NextResponse.json({ error: userMessageError.message }, { status: 500 });
    }
    
    await supabase
      .from('chats')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', chatId);
    
    const { data: aiMessage, error: aiMessageError } = await supabase
      .from('messages')
      .insert({
        chat_id: chatId,
        role: 'model',
        content: '',
      })
      .select()
      .single();
    
    if (aiMessageError) {
      console.error('Error creating AI message placeholder:', aiMessageError);
      return NextResponse.json({ error: aiMessageError.message }, { status: 500 });
    }
    
    return NextResponse.json({ 
      userMessage,
      aiMessage
    });
  } catch (error) {
    console.error('Error in POST /api/chats/[chatId]/messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
