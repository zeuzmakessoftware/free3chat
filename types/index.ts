export interface Message {
    id: string;
    role: 'user' | 'model';
    content: string;
}