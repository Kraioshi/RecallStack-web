import { describe, expect, it } from 'vitest'

import { totalQuestions } from '../../src/components/layout/topicTreeUtils'
import type { TopicTree } from '../../src/types/topic'

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
