export interface JournalEntry {
  id: string;
  content: string;
  date: string; // ISO string
  mood?: 'happy' | 'neutral' | 'sad' | 'anxious' | 'hopeful';
}

export interface Goal {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: string | null; // null implies "No timeline"
}

export enum MessageRole {
  USER = 'user',
  MODEL = 'model',
  SYSTEM = 'system'
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  imageUrl?: string;
  sources?: Array<{
    title: string;
    uri: string;
  }>;
  isAudioPlaying?: boolean;
}

export interface VisionItem {
  id: string;
  imageUrl: string; // Base64
  caption: string;
  dateAdded: string;
  rotation: number; // Degrees for the corkboard effect
}
