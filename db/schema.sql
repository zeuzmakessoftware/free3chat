-- Enable UUID extension (required for uuid_generate_v4())
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    hashed_password TEXT NOT NULL,
    username TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

-- Create chats table
CREATE TABLE public.chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL DEFAULT 'New Chat',
    user_id UUID REFERENCES public.users(id),
    anonymous_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    model_id TEXT,
    pinned BOOLEAN
);

-- Create messages table
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id UUID NOT NULL REFERENCES public.chats(id),
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    parent_id UUID REFERENCES public.messages(id),
    active_child_id UUID REFERENCES public.messages(id)
);

-- Create indexes
CREATE INDEX chats_user_id_idx ON public.chats USING btree (user_id);
CREATE INDEX chats_anonymous_id_idx ON public.chats USING btree (anonymous_id);
CREATE INDEX messages_chat_id_idx ON public.messages USING btree (chat_id);
CREATE INDEX messages_created_at_idx ON public.messages USING btree (created_at);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Allow sign-up" ON public.users
    FOR INSERT TO public
    WITH CHECK (true);

CREATE POLICY "Allow read self" ON public.users
    FOR SELECT TO public
    USING (auth.role() = 'anon');

-- RLS Policies for chats table
CREATE POLICY "Enable read access for all users" ON public.chats
    FOR SELECT TO public
    USING (true);

CREATE POLICY "Enable insert access for all users" ON public.chats
    FOR INSERT TO public
    WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON public.chats
    FOR UPDATE TO public
    USING (true);

CREATE POLICY "Enable delete access for all users" ON public.chats
    FOR DELETE TO public
    USING (true);

-- RLS Policies for messages table
CREATE POLICY "Enable read access for all users" ON public.messages
    FOR SELECT TO public
    USING (true);

CREATE POLICY "Enable insert access for all users" ON public.messages
    FOR INSERT TO public
    WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON public.messages
    FOR UPDATE TO public
    USING (true);

CREATE POLICY "Enable delete access for all users" ON public.messages
    FOR DELETE TO public
    USING (true);