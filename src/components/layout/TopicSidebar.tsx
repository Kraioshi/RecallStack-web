import { useState } from 'react'
import type { CSSProperties } from 'react'
import { NavLink } from 'react-router-dom'

import { AppIcon } from '../AppIcon'
import type { TopicTree } from '../../types/topic'
import {
  filterTopicTree,
  findTopicIdPath,
  totalQuestions,
} from './topicTreeUtils'

interface TopicSidebarProps {
  topics: TopicTree[]
  loading: boolean
  error: string | null
  selectedTopicId?: string
  search: string
  onSearchChange: (search: string) => void
  onNavigate: () => void
  onRetry: () => void
}

interface TreeItemProps {
  topic: TopicTree
  depth: number
  currentTopicId?: string
  activePath: Set<string>
  expanded: Record<string, boolean>
  searching: boolean
  onToggle: (id: string, open: boolean) => void
  onNavigate: () => void
}

function TreeItem({
  topic,
  depth,
  currentTopicId,
  activePath,
  expanded,
  searching,
  onToggle,
  onNavigate,
}: TreeItemProps) {
  const hasChildren = topic.children.length > 0
  const isOpen =
    searching ||
    (expanded[topic.id] ?? (depth === 0 || activePath.has(topic.id)))
  const isCurrent = topic.id === currentTopicId

  return (
    <li className="sidebar-tree__item">
      <div
        className={`sidebar-tree__row${isCurrent ? ' sidebar-tree__row--current' : ''}`}
        style={{ paddingLeft: `${8 + depth * 18}px` }}
      >
        {hasChildren ? (
          <button
            type="button"
            className="sidebar-tree__toggle"
            aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${topic.name}`}
            aria-expanded={isOpen}
            onClick={() => onToggle(topic.id, !isOpen)}
            disabled={searching}
          >
            <AppIcon
              name={isOpen ? 'chevron-down' : 'chevron-right'}
              size={16}
            />
          </button>
        ) : (
          <span
            className="sidebar-tree__toggle-placeholder"
            aria-hidden="true"
          />
        )}

        <NavLink
          to={`/topics/${topic.id}`}
          className="sidebar-tree__link"
          onClick={onNavigate}
          title={topic.name}
          aria-current={isCurrent ? 'page' : undefined}
        >
          <AppIcon
            name={hasChildren ? 'folder' : 'file'}
            size={17}
            className="sidebar-tree__node-icon"
          />
          <span className="sidebar-tree__name">{topic.name}</span>
          <span
            className="sidebar-tree__count"
            aria-label={`${totalQuestions(topic)} questions including subtopics`}
          >
            {totalQuestions(topic)}
          </span>
        </NavLink>
      </div>

      {hasChildren && isOpen && (
        <ul
          className="sidebar-tree__children"
          style={{ '--guide-left': `${19 + depth * 18}px` } as CSSProperties}
        >
          {topic.children.map((child) => (
            <TreeItem
              key={child.id}
              topic={child}
              depth={depth + 1}
              currentTopicId={currentTopicId}
              activePath={activePath}
              expanded={expanded}
              searching={searching}
              onToggle={onToggle}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

export function TopicSidebar({
  topics,
  loading,
  error,
  selectedTopicId,
  search,
  onSearchChange,
  onNavigate,
  onRetry,
}: TopicSidebarProps) {
  // A user override wins over default expansion of roots and the active path.
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const activePath = new Set(findTopicIdPath(topics, selectedTopicId))
  const matchingTopics = filterTopicTree(topics, search)
  const searching = search.trim().length > 0

  return (
    <nav className="topic-sidebar__inner" aria-label="Topics navigation">
      <div className="topic-sidebar__heading">
        <span className="topic-sidebar__heading-icon">
          <AppIcon name="book" size={19} />
        </span>
        <h2>Topics</h2>
      </div>

      <label className="topic-sidebar__search" htmlFor="sidebar-topic-search">
        <AppIcon name="search" size={19} />
        <span className="sr-only">Search topics</span>
        <input
          id="sidebar-topic-search"
          type="search"
          placeholder="Search topics..."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          autoComplete="off"
        />
      </label>

      {loading && topics.length === 0 ? (
        <p className="topic-sidebar__message" role="status">
          Loading topics...
        </p>
      ) : error && topics.length === 0 ? (
        <div className="topic-sidebar__message" role="alert">
          <p>Could not load topics.</p>
          <button type="button" onClick={onRetry}>
            Try again
          </button>
        </div>
      ) : matchingTopics.length === 0 ? (
        <p className="topic-sidebar__message">
          {searching ? 'No matching topics.' : 'No topics yet.'}
        </p>
      ) : (
        <ul className="sidebar-tree">
          {matchingTopics.map((topic) => (
            <TreeItem
              key={topic.id}
              topic={topic}
              depth={0}
              currentTopicId={selectedTopicId}
              activePath={activePath}
              expanded={expanded}
              searching={searching}
              onToggle={(id, open) =>
                setExpanded((state) => ({ ...state, [id]: open }))
              }
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      )}
      <div className="topic-sidebar__footer">
        <NavLink
          to="/practice"
          className="topic-sidebar__practice"
          onClick={onNavigate}
        >
          <AppIcon name="play" size={17} />
          Practice all topics
          <AppIcon name="arrow-right" size={16} />
        </NavLink>
      </div>
    </nav>
  )
}
