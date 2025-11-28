
export enum Role {
  USER = 'user',
  MODEL = 'model'
}

export interface Message {
  id: string;
  role: Role;
  text: string;
  timestamp: Date;
  isError?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  lastMessageAt: Date;
  isPinned?: boolean;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
}