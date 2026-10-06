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
