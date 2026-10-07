import type { TopicTree as TopicTreeData } from '../types/topic'

interface TopicTreeNodeProps {
  topic: TopicTreeData
}

export function TopicTreeNode({ topic }: TopicTreeNodeProps) {
  return (
    <li>
      <strong>{topic.name}</strong>

      {topic.children.length > 0 && (
        <ul>
          {topic.children.map((child) => (
            <TopicTreeNode key={child.id} topic={child} />
          ))}
        </ul>
      )}
    </li>
  )
}
