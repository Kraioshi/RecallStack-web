export interface QuestionCounts {
  easy: number;
  medium: number;
  hard: number;
  total: number;
}

export interface TopicTree {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  question_counts: QuestionCounts;
  children: TopicTree[];
}

export interface Topic {
  id: string;
  parent_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}
