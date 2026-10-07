import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { getTopic } from '../api/topics'
import type { Topic } from '../types/topic'

export function TopicPage() {
  const { topicId } = useParams<{ topicId: string }>()

  const [topic, setTopic] = useState<Topic | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!topicId) {
      return
    }

    const controller = new AbortController()

    async function loadTopic(id: string) {
      try {
        const data = await getTopic(id, controller.signal)
        setTopic(data)
      } catch (error) {
        if (controller.signal.aborted) {
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

  if (error) {
    return <p>{error}</p>
  }

  if (!topic) {
    return <p>Topic not found.</p>
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
    </main>
  )
}
