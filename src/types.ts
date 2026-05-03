export type MessageRole = 'user' | 'model' | 'system';

export interface SourceRef {
  docId: string;
  sectionId: string;
  sectionTitle: string;
  anchor?: string;
  content?: string; // For highlighting in the UI
}

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
  sourceRef?: SourceRef;
}

export interface ChatAreaProps {
  onMenuClick: () => void;
}

export interface ChatAreaHandle {
  handleAction: (action: string) => void;
}

export interface ChatSession {
  id: string;
  title: string;
  updatedAt: Date;
  messages: Message[];
}
