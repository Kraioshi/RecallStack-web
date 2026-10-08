import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { ApiError } from '../api/errors'
import { getTopic, getTopicContextTree } from '../api/topics'
import { QuestionList } from '../components/QuestionList'
import { TopicTree } from '../components/TopicTree'
import type { Topic, TopicTree as TopicTreeData } from '../types/topic'

export function TopicPage() {
  const { topicId } = useParams<{ topicId: string }>()

  const [topic, setTopic] = useState<Topic | null>(null)
  const [contextTree, setContextTree] = useState<TopicTreeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!topicId) {
      return
    }

    const controller = new AbortController()

    async function loadTopic(id: string) {
      try {
        const [topicData, contextTreeData] = await Promise.all([
          getTopic(id, controller.signal),
          getTopicContextTree(id, controller.signal),
        ])

        setTopic(topicData)
        setContextTree(contextTreeData)
      } catch (error) {
        if (controller.signal.aborted) {
          return
        }

        if (error instanceof ApiError && error.status === 404) {
          setNotFound(true)
          return
        }

        setError(error instanceof Error ? error.message : 'Unknown error')
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    void loadTopic(topicId)

    return () => {
      controller.abort()
    }
  }, [topicId])

  if (!topicId) {
    return <p>Topic ID is missing.</p>
  }

  if (loading) {
    return <p>Loading topic...</p>
  }

  if (notFound) {
    return <p>Topic not found.</p>
  }

  if (error) {
    return <p>{error}</p>
  }

  if (!topic) {
    return <p>Topic data is unavailable.</p>
  }

  return (
    <main>
      <Link to="/">← Back to topics</Link>

      <h1>{topic.name}</h1>

      <p>{topic.description ?? 'No description.'}</p>

      <dl>
        <dt>Slug</dt>
        <dd>{topic.slug}</dd>

        <dt>Parent ID</dt>
        <dd>{topic.parent_id ?? 'Root topic'}</dd>

        <dt>Created</dt>
        <dd>{topic.created_at}</dd>

        <dt>Updated</dt>
        <dd>{topic.updated_at}</dd>
      </dl>

      {contextTree && (
        <>
          <h2>Topic context</h2>
          <TopicTree topics={[contextTree]} />
        </>
      )}

      <QuestionList key={topic.id} topicId={topic.id} />
    </main>
  )
}
