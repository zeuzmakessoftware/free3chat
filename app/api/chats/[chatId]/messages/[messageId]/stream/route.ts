import { supabase } from '@/lib/supabaseClient';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function PATCH(req: Request) {
  return handleRequest(req);
}

export async function POST(req: Request) {
  return handleRequest(req);
}

async function handleRequest(req: Request) {
  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const chatId = pathParts[pathParts.indexOf('chats') + 1];
    const messageId = pathParts[pathParts.indexOf('messages') + 1];
    const { prompt, anonymousId } = await req.json();
    
    const session = await getServerSession(authOptions);
    
    const headers = req.headers;
    const headerAnonymousId = anonymousId || headers.get('x-anonymous-id');
    
    let chatQuery = supabase.from('chats').select('*').eq('id', chatId);
    
    if (session?.user?.id) {
      chatQuery = chatQuery.eq('user_id', session.user.id);
    } else if (headerAnonymousId) {
      chatQuery = chatQuery.eq('anonymous_id', headerAnonymousId);
    } else {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { data: chat, error: chatError } = await chatQuery.single();
    
    if (chatError || !chat) {
      console.error('Error fetching chat or unauthorized:', chatError);
      return NextResponse.json({ error: 'Chat not found or unauthorized' }, { status: 404 });
    }
    
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .select('*')
      .eq('id', messageId)
      .eq('chat_id', chatId)
      .single();
    
    if (messageError || !message) {
      console.error('Error fetching message:', messageError);
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }
    
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Missing Gemini API Key' }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
      }
    });

    const { error: historyError } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });
    
    if (historyError) {
      console.error('Error fetching chat history:', historyError);
      return NextResponse.json({ error: 'Error fetching chat history' }, { status: 500 });
    }
    
    const result = await model.generateContentStream(prompt);

    const stream = new ReadableStream({
      async start(controller) {
        let fullResponse = '';
        
        for await (const chunk of result.stream) {
          try {
            const chunkText = chunk.text();
            fullResponse += chunkText;
            
            await supabase
              .from('messages')
              .update({ content: fullResponse })
              .eq('id', messageId);
            
            const encoded = new TextEncoder().encode(chunkText);
            controller.enqueue(encoded);
          } catch (error) {
            console.error("Error processing chunk:", error);
          }
        }
        
        await supabase
          .from('chats')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', chatId);
        
        controller.close();
      },
    });

    return new NextResponse(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" }
    });    
  } catch (error) {
    console.error("Error in chat streaming API:", error);
    return NextResponse.json({ error: "An error occurred while processing your request." }, {
      status: 500,
    });
  }
}
