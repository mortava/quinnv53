export type MessageRole = 'user' | 'model' | 'system';

export interface SourceRef {
  docId: string;
  sectionId: string;
  sectionTitle: string;
  anchor?: string;
  content?: string;
}

export interface CitationSource {
  document: string;
  section: string;
  content?: string;
  docId?: string;
  sectionId?: string;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  generativeUI?: GenerativeUIData;
  sources?: CitationSource[];
  isError?: boolean;
}

export type GenerativeUIType = 'answer' | 'chart' | 'card' | 'deal' | 'email' | 'leaderboard' | 'ideas' | 'quoteBuilder' | 'image' | 'document' | 'pricing';

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
