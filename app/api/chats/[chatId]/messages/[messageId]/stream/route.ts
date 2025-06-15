import { supabase } from '@/lib/supabaseClient';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Groq } from 'groq-sdk';
import { NextResponse } from 'next/server';
import { Message } from '@/types';

export const runtime = 'nodejs';

interface GoogleStreamChunk {
  text(): string;
}

interface GroqStreamChunk {
  choices: Array<{ delta: { content?: string } }>;
}

interface GoogleHistoryItem {
  role: 'model' | 'user';
  parts: Array<{ text: string }>;
}

interface GroqHistoryItem {
  role: 'assistant' | 'user';
  content: string;
}

type ChatHistoryItem = GoogleHistoryItem | GroqHistoryItem;

const modelMapping: Record<string, { provider: 'google' | 'groq'; name: string }> = {
  'gemini-2-5-flash': { provider: 'google', name: 'gemini-2.5-flash' },
  'llama-3-3-70b': { provider: 'groq', name: 'llama-3.3-70b-versatile' },
  'llama-4-maverick': { provider: 'groq', name: 'llama4-maverick' },
  'qwen-qwq-32b': { provider: 'groq', name: 'qwen-qwq-32b' },
  'deepseek-r1-llama-distilled': { provider: 'groq', name: 'deepseek-r1-llama-distilled' },
};
const defaultModel = modelMapping['gemini-2-5-flash'];


async function getChatHistory(chatId: string, provider: 'google'): Promise<GoogleHistoryItem[]>;
async function getChatHistory(chatId: string, provider: 'groq'): Promise<GroqHistoryItem[]>;

async function getChatHistory(
  chatId: string,
  provider: 'google' | 'groq'
): Promise<ChatHistoryItem[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true })
    .limit(20);

  if (error || !data) {
    console.error('Error fetching chat history:', error);
    return [];
  }

  const filtered = data.filter((m: Message) => m.content);

  if (provider === 'google') {
    return filtered.map<GoogleHistoryItem>(msg => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));
  } else {
    return filtered.map<GroqHistoryItem>(msg => ({
      role: msg.role === 'model' ? 'assistant' : 'user',
      content: msg.content,
    }));
  }
}

async function handleRequest(req: Request) {
  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const chatId = pathParts[pathParts.indexOf('chats') + 1];
    const messageId = pathParts[pathParts.indexOf('messages') + 1];
    const { anonymousId } = await req.json();
    
    const session = await getServerSession(authOptions);
    
    let chatQuery = supabase.from('chats').select('id, model_id').eq('id', chatId);
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
    
    const modelInfo = modelMapping[chat.model_id || ''] || defaultModel;
    const { provider, name: apiModelName } = modelInfo;
    
    let apiStream;

    if (provider === 'google') {
      if (!process.env.GEMINI_API_KEY) return NextResponse.json({ error: 'Missing Gemini API Key' }, { status: 500 });
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: apiModelName });
      const history = await getChatHistory(chatId, 'google');
      const chatSession = model.startChat({ history });
      const result = await chatSession.sendMessageStream("");
      apiStream = result.stream;
    } else if (provider === 'groq') {
      if (!process.env.GROQ_API_KEY) return NextResponse.json({ error: 'Missing Groq API Key' }, { status: 500 });
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const messages = await getChatHistory(chatId, 'groq');
      apiStream = await groq.chat.completions.create({
          model: apiModelName,
          messages,
          stream: true,
      });
    } else {
        return NextResponse.json({ error: `Unsupported provider: ${provider}`}, { status: 500 });
    }

    const stream = new ReadableStream({
      async start(controller) {
        let fullResponse = '';
        const encoder = new TextEncoder();
        try {
          if (provider === 'google') {
            const googleStream = apiStream as AsyncIterable<GoogleStreamChunk>;
            for await (const chunk of googleStream) {
              const chunkText = chunk.text();
              if (chunkText) {
                fullResponse += chunkText;
                controller.enqueue(encoder.encode(chunkText));
              }
            }
          } else {
            const groqStream = apiStream as AsyncIterable<GroqStreamChunk>;
            for await (const chunk of groqStream) {
              const chunkText = chunk.choices[0]?.delta?.content ?? '';
              if (chunkText) {
                fullResponse += chunkText;
                controller.enqueue(encoder.encode(chunkText));
              }
            }
          }
          
          if (fullResponse) {
            await supabase.from('messages').update({ content: fullResponse }).eq('id', messageId);
            await supabase.from('chats').update({ updated_at: new Date().toISOString() }).eq('id', chatId);
          }
        } catch (streamError) {
          console.error("Error during stream processing:", streamError);
          controller.error(streamError);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8" } });    
  } catch (error) {
    console.error("Error in chat streaming API:", error);
    return NextResponse.json({ error: "An error occurred." }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  return handleRequest(req);
}

export async function POST(req: Request) {
  return handleRequest(req);
}