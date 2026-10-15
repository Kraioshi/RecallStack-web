import { describe, expect, it } from 'vitest'
import {
  filterTopicTree,
  findTopicIdPath,
  findTopicPath,
  totalQuestions,
  totalSubtopics,
} from '../../src/components/layout/topicTreeUtils'
import type { TopicTree } from '../../src/types/topic'
import { makeTopicTree } from '../fixtures/topics'

describe('totalQuestions', () => {
  it('returns direct question count when topic has no children', () => {
    // Arrange
    const topic: TopicTree = {
      id: 'python',
      name: 'Python',
      slug: 'python',
      description: null,
      question_counts: {
        easy: 2,
        medium: 3,
        hard: 1,
        total: 6,
      },
      children: [],
    }

    // Act
    const result = totalQuestions(topic)

    // Assert
    expect(result).toBe(6)
  })

  it('includes questions from nested descendants', () => {
    // Arrange
    const topic: TopicTree = {
      id: 'python',
      name: 'Python',
      slug: 'python',
      description: null,
      question_counts: {
        easy: 1,
        medium: 0,
        hard: 0,
        total: 1,
      },
      children: [
        {
          id: 'fastapi',
          name: 'FastAPI',
          slug: 'fastapi',
          description: null,
          question_counts: {
            easy: 0,
            medium: 2,
            hard: 0,
            total: 2,
          },
          children: [
            {
              id: 'routing',
              name: 'Routing',
              slug: 'routing',
              description: null,
              question_counts: {
                easy: 0,
                medium: 0,
                hard: 3,
                total: 3,
              },
              children: [],
            },
          ],
        },
      ],
    }

    // Act
    const result = totalQuestions(topic)

    // Assert
    expect(result).toBe(6)
  })
})

describe('totalSubtopics', () => {
  it('returns zero when topic has no children', () => {
    // Arrange
    const topic = makeTopicTree()

    // Act
    const result = totalSubtopics(topic)

    // Assert
    expect(result).toBe(0)
  })

  it('counts all nested descendants', () => {
    // Arrange
    const topic = makeTopicTree({
      name: 'Python',
      children: [
        makeTopicTree({
          name: 'Frameworks',
          children: [
            makeTopicTree({ name: 'FastAPI' }),
            makeTopicTree({ name: 'Django' }),
          ],
        }),
        makeTopicTree({ name: 'Asyncio' }),
      ],
    })

    // Act
    const result = totalSubtopics(topic)

    // Assert
    expect(result).toBe(4)
  })
})

describe('findTopicIdPath', () => {
  const topics = [
    makeTopicTree({
      id: 'python',
      children: [
        makeTopicTree({
          id: 'frameworks',
          children: [makeTopicTree({ id: 'fastapi' })],
        }),
        makeTopicTree({ id: 'asyncio' }),
      ],
    }),
    makeTopicTree({ id: 'sql' }),
  ]

  it.each([
    { id: 'python', expected: ['python'] },
    { id: 'fastapi', expected: ['python', 'frameworks', 'fastapi'] },
    { id: 'asyncio', expected: ['python', 'asyncio'] },
    { id: 'sql', expected: ['sql'] },
    { id: 'missing', expected: [] },
    { id: undefined, expected: [] },
  ])('returns $expected for id $id', ({ id, expected }) => {
    expect(findTopicIdPath(topics, id)).toEqual(expected)
  })
})

describe('findTopicPath', () => {
  const fastapi = makeTopicTree({ id: 'fastapi', name: 'FastAPI' })
  const frameworks = makeTopicTree({
    id: 'frameworks',
    name: 'Frameworks',
    children: [fastapi],
  })
  const python = makeTopicTree({
    id: 'python',
    name: 'Python',
    children: [frameworks],
  })
  const topics = [python, makeTopicTree({ id: 'sql', name: 'SQL' })]

  it('returns root-to-leaf topic objects', () => {
    expect(findTopicPath(topics, 'fastapi')).toEqual([
      python,
      frameworks,
      fastapi,
    ])
  })

  it('returns the root when it is the target', () => {
    expect(findTopicPath(topics, 'python')).toEqual([python])
  })

  it('returns an empty path when the topic is not found', () => {
    expect(findTopicPath(topics, 'missing')).toEqual([])
  })
})

describe('filterTopicTree', () => {
  const fastapi = makeTopicTree({ id: 'fastapi', name: 'FastAPI' })
  const django = makeTopicTree({ id: 'django', name: 'Django' })
  const frameworks = makeTopicTree({
    id: 'frameworks',
    name: 'Frameworks',
    children: [fastapi, django],
  })
  const python = makeTopicTree({
    id: 'python',
    name: 'Python',
    children: [frameworks],
  })
  const sql = makeTopicTree({ id: 'sql', name: 'SQL' })
  const topics = [python, sql]

  it('keeps the original tree when search is empty or whitespace', () => {
    expect(filterTopicTree(topics, '')).toBe(topics)
    expect(filterTopicTree(topics, '   ')).toBe(topics)
  })

  it('matches topic names case-insensitively and trims search terms', () => {
    expect(filterTopicTree(topics, '  SQL  ')).toEqual([sql])
  })

  it('keeps only matching descendants and their ancestors', () => {
    expect(filterTopicTree(topics, 'fast')).toEqual([
      {
        ...python,
        children: [{ ...frameworks, children: [fastapi] }],
      },
    ])
  })

  it('preserves all descendants if an ancestor matches', () => {
    expect(filterTopicTree(topics, 'python')).toEqual([python])
  })

  it('returns an empty array when no topic matches', () => {
    expect(filterTopicTree(topics, 'kubernetes')).toEqual([])
  })
})
