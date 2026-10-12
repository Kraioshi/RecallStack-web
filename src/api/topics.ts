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

// Topic writes intentionally mirror the existing FastAPI contracts.
// Parent assignment happens at creation; editing does not reparent a topic.
export interface CreateTopicInput {
  name: string
  slug: string
  description: string | null
  parentId: string | null
}

export interface UpdateTopicInput {
  name?: string
  slug?: string
  description?: string | null
}

async function topicMutationError(
  response: Response,
  operation: 'create' | 'update' | 'delete',
): Promise<ApiError> {
  if (response.status === 404) {
    return new ApiError(404, 'Topic not found. It may have been deleted.')
  }
  if (response.status === 409) {
    return new ApiError(
      409,
      operation === 'delete'
        ? 'This topic cannot be deleted while it has dependent content.'
        : 'A topic with this slug already exists at this level.',
    )
  }
  if (response.status === 422) {
    return new ApiError(422, 'Invalid topic data. Please check the form.')
  }

  // Surface a plain-text API detail when available without coupling to its shape.
  let detail: unknown
  try {
    detail = ((await response.json()) as { detail?: unknown }).detail
  } catch {
    // Responses from proxies or server errors may not contain JSON.
  }
  const description =
    typeof detail === 'string' && detail.length < 300
      ? detail
      : `Failed to ${operation} topic (${response.status}).`
  return new ApiError(response.status, description)
}

// POST /api/topics/ (the FastAPI root collection route)
export async function createTopic(input: CreateTopicInput): Promise<Topic> {
  const response = await fetch(`${API_URL}/api/topics/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: input.name,
      slug: input.slug,
      description: input.description,
      parent_id: input.parentId,
    }),
  })

  if (!response.ok) throw await topicMutationError(response, 'create')
  return response.json()
}

// PATCH /api/topics/{topic_id}: only changed fields are sent.
export async function updateTopic(
  topicId: string,
  input: UpdateTopicInput,
): Promise<Topic> {
  const response = await fetch(`${API_URL}/api/topics/${topicId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })

  if (!response.ok) throw await topicMutationError(response, 'update')
  return response.json()
}

// DELETE /api/topics/{topic_id} -> 204 No Content.
export async function deleteTopic(topicId: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/topics/${topicId}`, {
    method: 'DELETE',
  })

  if (!response.ok) throw await topicMutationError(response, 'delete')
}
