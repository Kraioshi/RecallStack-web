import type { Question } from '../../src/types/question'

export function makeQuestion(overrides: Partial<Question> = {}): Question {
  return {
    id: 'question-1',
    topic_id: 'python',
    question: 'What is the GIL?',
    answer: 'Global Interpreter Lock',
    difficulty: 'medium',
    created_at: '2026-10-15T00:00:00Z',
    updated_at: '2026-10-15T00:00:00Z',
    ...overrides,
  }
}
