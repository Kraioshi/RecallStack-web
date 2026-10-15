import { afterEach, describe, expect, it, vi } from 'vitest'

import { ApiError } from '../../src/api/errors'
import {
  createTopic,
  deleteTopic,
  getTopicContextTree,
  getTopicTree,
  updateTopic,
} from '../../src/api/topics'
import type { Topic } from '../../src/types/topic'
import { makeTopicTree } from '../fixtures/topics'
import { mockFetchResponse } from '../fixtures/http'

const topic: Topic = {
  id: 'python',
  parent_id: null,
  name: 'Python',
  slug: 'python',
  description: null,
  created_at: '2026-10-15T00:00:00Z',
  updated_at: '2026-10-15T00:00:00Z',
}

afterEach(() => vi.unstubAllGlobals())

describe('topic API client', () => {
  it('retrieves a topic tree and forwards abort signals', async () => {
    const tree = [makeTopicTree({ id: 'python', name: 'Python' })]
    const fetchMock = mockFetchResponse(tree)
    const controller = new AbortController()

    await expect(getTopicTree(controller.signal)).resolves.toEqual(tree)
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/topics/tree'),
      { signal: controller.signal },
    )
  })

  it('surfaces the status code when a context tree cannot be loaded', async () => {
    mockFetchResponse({}, 404)

    await expect(getTopicContextTree('missing')).rejects.toMatchObject({
      name: 'ApiError',
      status: 404,
      message: expect.stringContaining('Failed to fetch topic context tree'),
    } satisfies Partial<ApiError>)
  })

  it('translates parentId to parent_id when creating a topic', async () => {
    const fetchMock = mockFetchResponse(topic, 201)

    await expect(
      createTopic({
        name: 'Python',
        slug: 'python',
        description: null,
        parentId: 'programming',
      }),
    ).resolves.toEqual(topic)

    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toMatch(/\/api\/topics\/$/)
    expect(options.method).toBe('POST')
    expect(JSON.parse(options.body as string)).toEqual({
      name: 'Python',
      slug: 'python',
      description: null,
      parent_id: 'programming',
    })
  })

  it('sends only the provided fields when updating a topic', async () => {
    const fetchMock = mockFetchResponse(topic)

    await updateTopic('python', { description: null })

    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toContain('/api/topics/python')
    expect(options.method).toBe('PATCH')
    expect(JSON.parse(options.body as string)).toEqual({ description: null })
  })

  it('handles a successful 204 response when deleting a topic', async () => {
    const fetchMock = mockFetchResponse(undefined, 204)

    await expect(deleteTopic('python')).resolves.toBeUndefined()
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/topics/python'),
      { method: 'DELETE' },
    )
  })

  it('explains why a topic cannot be deleted when server returns 409', async () => {
    mockFetchResponse({}, 409)

    await expect(deleteTopic('python')).rejects.toMatchObject({
      status: 409,
      message: 'This topic cannot be deleted while it has dependent content.',
    })
  })

  it('shows a validation message on invalid topic changes', async () => {
    mockFetchResponse({}, 422)

    await expect(updateTopic('python', { name: '' })).rejects.toMatchObject({
      status: 422,
      message: 'Invalid topic data. Please check the form.',
    })
  })

  it('uses a plain detail string for unexpected backend errors', async () => {
    mockFetchResponse({ detail: 'Database temporarily unavailable' }, 503)

    await expect(deleteTopic('python')).rejects.toMatchObject({
      status: 503,
      message: 'Database temporarily unavailable',
    })
  })
})
