import { useEffect, useState } from 'react'
import { Link, useOutletContext, useParams } from 'react-router-dom'

import { ApiError } from '../api/errors'
import { createQuestion } from '../api/questions'
import { getTopic, getTopicContextTree } from '../api/topics'
import type { LayoutContext } from '../components/layout/AppLayout'
import { QuestionForm } from '../components/QuestionForm'
import type { QuestionFormValues } from '../components/QuestionForm'
import { QuestionList } from '../components/QuestionList'
import { TopicTree } from '../components/TopicTree'
import type { Topic, TopicTree as TopicTreeData } from '../types/topic'

export function TopicPage() {
  const { topicId } = useParams<{ topicId: string }>()
  const { refreshTopics } = useOutletContext<LayoutContext>()

  const [topic, setTopic] = useState<Topic | null>(null)
  const [contextTree, setContextTree] = useState<TopicTreeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [creatingQuestion, setCreatingQuestion] = useState(false)
  const [questionListVersion, setQuestionListVersion] = useState(0)
  const [questionNotice, setQuestionNotice] = useState<string | null>(null)

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

  async function handleCreateQuestion(
    values: QuestionFormValues,
  ): Promise<void> {
    if (!topic) throw new Error('Topic is unavailable.')

    await createQuestion({ ...values, topicId: topic.id })

    setCreatingQuestion(false)
    setQuestionNotice('Question created successfully.')
    refreshTopics()
    // Remount the list to reuse its existing loading and fetching behavior.
    setQuestionListVersion((version) => version + 1)

    // A count refresh failing must not turn a successful POST into a form error.
    void getTopicContextTree(topic.id)
      .then(setContextTree)
      .catch(() => {
        setQuestionNotice('Question created. Reload to refresh topic counts.')
      })
  }

  function handleQuestionDeleted(): void {
    if (!topic) return

    setQuestionNotice('Question deleted successfully.')
    refreshTopics()

    // Refresh tree counts; deleting a question has already succeeded.
    void getTopicContextTree(topic.id)
      .then(setContextTree)
      .catch(() => {
        setQuestionNotice('Question deleted. Reload to refresh topic counts.')
      })
  }

  function handleQuestionUpdated(): void {
    if (!topic) return

    setQuestionNotice('Question updated successfully.')
    refreshTopics()

    // Refresh difficulty counts even when the question stays in this topic.
    void getTopicContextTree(topic.id)
      .then(setContextTree)
      .catch(() => {
        setQuestionNotice('Question updated. Reload to refresh topic counts.')
      })
  }

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

      <p>
        <Link to={`/practice?topic_id=${topic.id}`}>Practice this topic →</Link>
      </p>

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

      <QuestionList
        key={`${topic.id}-${questionListVersion}`}
        topicId={topic.id}
        onQuestionDeleted={handleQuestionDeleted}
        onQuestionUpdated={handleQuestionUpdated}
        actions={
          !creatingQuestion && (
            <button
              className="question-create-button"
              type="button"
              onClick={() => {
                setQuestionNotice(null)
                setCreatingQuestion(true)
              }}
            >
              Add question
            </button>
          )
        }
      >
        {questionNotice && <p role="status">{questionNotice}</p>}

        {creatingQuestion && (
          <div className="question-create-panel">
            <h3>New question for {topic.name}</h3>
            <QuestionForm
              onSubmit={handleCreateQuestion}
              onCancel={() => setCreatingQuestion(false)}
              submitLabel="Create question"
            />
          </div>
        )}
      </QuestionList>
    </main>
  )
}
