// app/api/chats/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

// GET handler remains unchanged...
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const url = new URL(req.url);
    const anonymousId = url.searchParams.get('anonymousId');

    let query = supabase.from('chats').select('*').order('updated_at', { ascending: false });

    if (session?.user?.id) {
      query = query.eq('user_id', session.user.id);
    } else if (anonymousId) {
      query = query.eq('anonymous_id', anonymousId);
    } else {
      return NextResponse.json({ error: 'No user ID or anonymous ID provided' }, { status: 400 });
    }

    const { data: chats, error } = await query;

    if (error) {
      console.error('Error fetching chats:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ chats });
  } catch (error) {
    console.error('Error in GET /api/chats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Updated POST handler to save the modelId
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { anonymousId, title = 'New Chat', modelId } = await req.json();

    const chatId = uuidv4();
    
    // Add model_id to the insert statement.
    // Assumes your 'chats' table has a 'model_id' column (e.g., TEXT).
    const { data: chat, error } = await supabase
      .from('chats')
      .insert({
        id: chatId,
        title,
        user_id: session?.user?.id || null,
        anonymous_id: !session?.user?.id ? anonymousId : null,
        model_id: modelId,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating chat:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ chat });
  } catch (error) {
    console.error('Error in POST /api/chats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}