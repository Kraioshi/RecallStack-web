import type { Question, QuestionDifficulty } from '../types/question'
import { ApiError } from './errors'

const API_URL = import.meta.env.VITE_API_URL

// GET /api/questions?topic_id={topic_id}
export async function getQuestionsByTopic(
  topicId: string,
  signal?: AbortSignal,
): Promise<Question[]> {
  const params = new URLSearchParams({ topic_id: topicId })
  const response = await fetch(`${API_URL}/api/questions?${params}`, {
    signal,
  })

  if (!response.ok) {
    throw new ApiError(
      response.status,
      `Failed to fetch questions: ${response.status} ${response.statusText}`,
    )
  }

  return response.json()
}

// Translate to FastAPI query params here.
export interface RandomQuestionOptions {
  topicId?: string
  difficulty?: QuestionDifficulty
  includeDescendants?: boolean
  excludeId?: string
}

// GET /api/questions/random
export async function getRandomQuestion(
  options: RandomQuestionOptions = {},
  signal?: AbortSignal,
): Promise<Question> {
  const params = new URLSearchParams()

  if (options.topicId) {
    params.set('topic_id', options.topicId)
  }

  if (options.difficulty) {
    params.set('difficulty', options.difficulty)
  }

  if (options.includeDescendants !== undefined) {
    params.set('include_descendants', String(options.includeDescendants))
  }

  if (options.excludeId) {
    params.set('exclude_id', options.excludeId)
  }

  const query = params.toString()
  const url = `${API_URL}/api/questions/random${query ? `?${query}` : ''}`
  const response = await fetch(url, { signal })

  if (!response.ok) {
    throw new ApiError(
      response.status,
      `Failed to fetch a random question: ${response.status} ${response.statusText}`,
    )
  }

  return response.json()
}

// Request input for POST /api/questions.
// Keep the React-facing API in camelCase and translate at the boundary.
export interface CreateQuestionInput {
  topicId: string
  question: string
  answer: string
  difficulty: QuestionDifficulty
}

export async function createQuestion(
  input: CreateQuestionInput,
): Promise<Question> {
  const response = await fetch(`${API_URL}/api/questions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      topic_id: input.topicId,
      question: input.question,
      answer: input.answer,
      difficulty: input.difficulty,
    }),
  })

  if (!response.ok) {
    if (response.status === 409) {
      throw new ApiError(
        response.status,
        'A question with this text already exists in this topic.',
      )
    }

    throw new ApiError(
      response.status,
      `Failed to create question: ${response.status} ${response.statusText}`,
    )
  }

  return response.json()
}

// DELETE /api/questions/{question_id}
export async function deleteQuestion(questionId: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/questions/${questionId}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    if (response.status === 404) {
      throw new ApiError(
        response.status,
        'Question not found. It may already have been deleted.',
      )
    }

    throw new ApiError(
      response.status,
      `Failed to delete question: ${response.status} ${response.statusText}`,
    )
  }

  // The backend returns 204 No Content; there is no JSON body to parse.
}
