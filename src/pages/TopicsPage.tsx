import { useEffect, useState } from 'react'

import { getTopicTree } from '../api/topics'
import { TopicTree } from '../components/TopicTree'
import type { TopicTree as TopicTreeData } from '../types/topic'

export function TopicsPage() {
  const [topics, setTopics] = useState<TopicTreeData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function loadTopics() {
      try {
        const data = await getTopicTree(controller.signal)
        setTopics(data)
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

    void loadTopics()

    return () => {
      controller.abort()
    }
  }, [])

  if (loading) {
    return <p>Loading topics...</p>
  }

  if (error) {
    return <p>{error}</p>
  }

  return (
    <main>
      <h1>RecallStack</h1>
      <TopicTree topics={topics} />
    </main>
  )
}
