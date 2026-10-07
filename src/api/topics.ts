import type { Topic, TopicTree } from '../types/topic'
import { ApiError } from './errors'

const API_URL = import.meta.env.VITE_API_URL

// GET /api/topics
export async function getRootTopics(signal?: AbortSignal): Promise<Topic[]> {
  const response = await fetch(`${API_URL}/api/topics`, {
    signal,
  })

  if (!response.ok) {
    throw new ApiError(
      response.status,
      `Failed to fetch root topics: ${response.status} ${response.statusText}`,
    )
  }

  return response.json()
}

// GET /api/topics/{topic_id}
export async function getTopic(
  topicId: string,
  signal?: AbortSignal,
): Promise<Topic> {
  const response = await fetch(`${API_URL}/api/topics/${topicId}`, {
    signal,
  })

  if (!response.ok) {
    throw new ApiError(
      response.status,
      `Failed to fetch topic: ${response.status} ${response.statusText}`,
    )
  }

  return response.json()
}

// GET /api/topics/tree
export async function getTopicTree(signal?: AbortSignal): Promise<TopicTree[]> {
  const response = await fetch(`${API_URL}/api/topics/tree`, {
    signal,
  })

  if (!response.ok) {
    throw new ApiError(
      response.status,
      `Failed to fetch topic tree: ${response.status} ${response.statusText}`,
    )
  }

  return response.json()
}

// GET /api/topics/{topic_id}/tree
export async function getTopicContextTree(
  topicId: string,
  signal?: AbortSignal,
): Promise<TopicTree> {
  const response = await fetch(`${API_URL}/api/topics/${topicId}/tree`, {
    signal,
  })

  if (!response.ok) {
    throw new ApiError(
      response.status,
      `Failed to fetch topic context tree: ${response.status} ${response.statusText}`,
    )
  }

  return response.json()
}

// GET /api/topics/{topic_id}/children
export async function getTopicChildren(
  topicId: string,
  signal?: AbortSignal,
): Promise<Topic[]> {
  const response = await fetch(`${API_URL}/api/topics/${topicId}/children`, {
    signal,
  })

  if (!response.ok) {
    throw new ApiError(
      response.status,
      `Failed to fetch topic children: ${response.status} ${response.statusText}`,
    )
  }

  return response.json()
}
