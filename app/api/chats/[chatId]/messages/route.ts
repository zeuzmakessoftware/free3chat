import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
  return handleGetRequest(req);
}

export async function POST(req: Request) {
  return handlePostRequest(req);
}

async function handleGetRequest(req: Request) {
  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const chatId = pathParts[pathParts.indexOf('chats') + 1];
    const { searchParams } = url;
    const anonymousId = searchParams.get('anonymousId');
    
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
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });
    
    if (messagesError) {
      return NextResponse.json({ error: messagesError.message }, { status: 500 });
    }
    
    return NextResponse.json({ messages: messages || [] });
  } catch (error) {
    console.error('Error in GET /api/chats/[chatId]/messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function handlePostRequest(req: Request) {
  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const chatId = pathParts[pathParts.indexOf('chats') + 1];
    const { searchParams } = url;
    const anonymousId = searchParams.get('anonymousId');
    const { content } = await req.json();
    
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
    
    const { data: userMessage, error: userMessageError } = await supabase
      .from('messages')
      .insert({ chat_id: chatId, role: 'user', content })
      .select()
      .single();
    
    if (userMessageError) {
      return NextResponse.json({ error: userMessageError.message }, { status: 500 });
    }
    
    const { data: aiMessage, error: aiMessageError } = await supabase
      .from('messages')
      .insert({ chat_id: chatId, role: 'model', content: '' })
      .select()
      .single();
    
    if (aiMessageError) {
      await supabase.from('messages').delete().eq('id', userMessage.id);
      return NextResponse.json({ error: aiMessageError.message }, { status: 500 });
    }
    
    supabase
      .from('chats')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', chatId)
      .then();
    
    return NextResponse.json({ userMessage, aiMessage });
  } catch (error) {
    console.error('Error in POST /api/chats/[chatId]/messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}