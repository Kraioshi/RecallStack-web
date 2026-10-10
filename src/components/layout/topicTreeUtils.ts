import type { TopicTree } from '../../types/topic'

/** Counts returned by the API are direct counts, not descendant totals. */
export function totalQuestions(topic: TopicTree): number {
  return (
    topic.question_counts.total +
    topic.children.reduce((total, child) => total + totalQuestions(child), 0)
  )
}

export function totalSubtopics(topic: TopicTree): number {
  return topic.children.reduce(
    (total, child) => total + 1 + totalSubtopics(child),
    0,
  )
}

/** Returns the root-to-topic ID path, or an empty array if not found. */
export function findTopicIdPath(topics: TopicTree[], id?: string): string[] {
  if (!id) return []

  for (const topic of topics) {
    if (topic.id === id) return [topic.id]

    const childPath = findTopicIdPath(topic.children, id)
    if (childPath.length > 0) return [topic.id, ...childPath]
  }

  return []
}

/** Include matching nodes and the ancestors needed to navigate to them. */
export function filterTopicTree(
  topics: TopicTree[],
  search: string,
): TopicTree[] {
  const term = search.trim().toLocaleLowerCase()
  if (!term) return topics

  return topics.flatMap((topic) => {
    if (topic.name.toLocaleLowerCase().includes(term)) return [topic]

    const children = filterTopicTree(topic.children, term)
    return children.length > 0 ? [{ ...topic, children }] : []
  })
}
