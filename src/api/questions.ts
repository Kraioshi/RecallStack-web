import type { Question } from '../types/question'
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
