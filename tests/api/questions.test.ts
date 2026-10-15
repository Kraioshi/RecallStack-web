import { afterEach, describe, expect, it, vi } from 'vitest'

import { ApiError } from '../../src/api/errors'
import {
  createQuestion,
  deleteQuestion,
  getQuestionsByTopic,
  getRandomQuestion,
  updateQuestion,
} from '../../src/api/questions'
import type { Question } from '../../src/types/question'
import { mockFetchResponse } from '../fixtures/http'

const question: Question = {
  id: 'question-1',
  topic_id: 'python',
  question: 'What is the GIL?',
  answer: 'Global Interpreter Lock',
  difficulty: 'medium',
  created_at: '2026-10-15T00:00:00Z',
  updated_at: '2026-10-15T00:00:00Z',
}

afterEach(() => vi.unstubAllGlobals())

describe('question API client', () => {
  it('passes the topic ID and abort signal when listing questions', async () => {
    const fetchMock = mockFetchResponse([question])
    const controller = new AbortController()

    await expect(
      getQuestionsByTopic('python', controller.signal),
    ).resolves.toEqual([question])
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/questions?topic_id=python'),
      { signal: controller.signal },
    )
  })

  it('constructs random-question filters using backend query names', async () => {
    const fetchMock = mockFetchResponse(question)

    await expect(
      getRandomQuestion({
        topicId: 'python',
        difficulty: 'hard',
        includeDescendants: false,
        excludeId: 'question-0',
      }),
    ).resolves.toEqual(question)

    const url = fetchMock.mock.calls[0][0] as string
    const parsed = new URL(url, 'http://localhost')
    expect(parsed.pathname).toContain('/api/questions/random')
    expect(Object.fromEntries(parsed.searchParams)).toEqual({
      topic_id: 'python',
      difficulty: 'hard',
      include_descendants: 'false',
      exclude_id: 'question-0',
    })
  })

  it('omits random-question query string when no filters are set', async () => {
    const fetchMock = mockFetchResponse(question)

    await getRandomQuestion()

    expect(fetchMock.mock.calls[0][0]).toMatch(/\/api\/questions\/random$/)
  })

  it('maps camelCase create input to the backend JSON contract', async () => {
    const fetchMock = mockFetchResponse(question, 201)

    await expect(
      createQuestion({
        topicId: 'python',
        question: question.question,
        answer: question.answer,
        difficulty: 'medium',
      }),
    ).resolves.toEqual(question)

    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(options.method).toBe('POST')
    expect(options.headers).toEqual({ 'Content-Type': 'application/json' })
    expect(JSON.parse(options.body as string)).toEqual({
      topic_id: 'python',
      question: question.question,
      answer: question.answer,
      difficulty: 'medium',
    })
  })

  it('sends only provided fields for a partial update', async () => {
    const fetchMock = mockFetchResponse(question)

    await updateQuestion('question-1', {
      topicId: 'sql',
      difficulty: 'hard',
    })

    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toContain('/api/questions/question-1')
    expect(options.method).toBe('PATCH')
    expect(JSON.parse(options.body as string)).toEqual({
      topic_id: 'sql',
      difficulty: 'hard',
    })
  })

  it('handles 204 deletion without parsing a JSON body', async () => {
    const fetchMock = mockFetchResponse(undefined, 204)

    await expect(deleteQuestion('question-1')).resolves.toBeUndefined()
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/questions/question-1'),
      { method: 'DELETE' },
    )
  })

  it('maps duplicate creation to a 409 ApiError', async () => {
    mockFetchResponse({ detail: 'Duplicate question' }, 409)

    await expect(
      createQuestion({
        topicId: 'python',
        question: question.question,
        answer: question.answer,
        difficulty: 'medium',
      }),
    ).rejects.toMatchObject({
      name: 'ApiError',
      status: 409,
      message: 'A question with this text already exists in this topic.',
    } satisfies Partial<ApiError>)
  })

  it('maps a missing deletion target to a 404 ApiError', async () => {
    mockFetchResponse({}, 404)

    await expect(deleteQuestion('missing')).rejects.toMatchObject({
      status: 404,
      message: 'Question not found. It may already have been deleted.',
    })
  })
})
