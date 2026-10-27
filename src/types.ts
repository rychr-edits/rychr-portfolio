export interface ProjectVideo {
  id: string;
  title: string;
  category: 'long-form' | 'documentary' | 'commercial' | 'short';
  description: string;
  retentionRate?: string;
  views?: string;
  duration?: string;
  videoUrl?: string; // local blob URL or online URL
  thumbnailGradient: string;
  tags: string[];
  aspectRatio?: '16:9' | '9:16';
}

export interface FaqItem {
  question: string;
  answer: string;
}
