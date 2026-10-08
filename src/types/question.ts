export type QuestionDifficulty = 'easy' | 'medium' | 'hard'

export interface Question {
  id: string
  topic_id: string
  question: string
  answer: string
  difficulty: QuestionDifficulty
  created_at: string
  updated_at: string
}
