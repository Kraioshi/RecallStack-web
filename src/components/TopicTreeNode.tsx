import { Link } from 'react-router-dom'

import type { TopicTree as TopicTreeData } from '../types/topic'

interface TopicTreeNodeProps {
  topic: TopicTreeData
}

export function TopicTreeNode({ topic }: TopicTreeNodeProps) {
  return (
    <li>
      <Link to={`/topics/${topic.id}`}>{topic.name}</Link>

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
