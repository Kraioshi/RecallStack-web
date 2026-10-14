import type { TopicTree } from '../../src/types/topic'

export function makeTopicTree(overrides: Partial<TopicTree> = {}): TopicTree {
  return {
    id: 'topic-id',
    name: 'Topic',
    slug: 'topic',
    description: null,
    question_counts: {
      easy: 0,
      medium: 0,
      hard: 0,
      total: 0,
    },
    children: [],
    ...overrides,
  }
}
