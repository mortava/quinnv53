export type MessageRole = 'user' | 'model' | 'system';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  generativeUI?: GenerativeUIData;
  isError?: boolean;
}

export type GenerativeUIType = 'chart' | 'card' | 'deal' | 'email' | 'leaderboard' | 'ideas' | 'quoteBuilder' | 'image' | 'document' | 'pricing';

export interface GenerativeUIData {
  type: GenerativeUIType;
  data: any;
}

export interface ChatSession {
  id: string;
  title: string;
  updatedAt: Date;
  messages: Message[];
}
