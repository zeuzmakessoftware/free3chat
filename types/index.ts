export interface Message {
    id: string;
    chat_id: string;
    role: 'user' | 'model';
    content: string;
    created_at: string;
}

export interface Chat {
    id: string;
    title: string;
    user_id: string | null;
    anonymous_id: string | null;
    created_at: string;
    updated_at: string;
} 

export type AppFont = 'proxima-nova' | 'inter' | 'comic-sans';