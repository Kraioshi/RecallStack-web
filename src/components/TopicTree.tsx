import { TopicTreeNode } from './TopicTreeNode'
import type { TopicTree as TopicTreeData } from '../types/topic'

interface TopicTreeProps {
  topics: TopicTreeData[]
}

export function TopicTree({ topics }: TopicTreeProps) {
  if (topics.length === 0) {
    return <p>No topics yet.</p>
  }

  return (
    <ul>
      {topics.map((topic) => (
        <TopicTreeNode key={topic.id} topic={topic} />
      ))}
    </ul>
  )
}
