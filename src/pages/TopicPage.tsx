import { useEffect, useState } from 'react'
import { Link, useOutletContext, useParams } from 'react-router-dom'

import { ApiError } from '../api/errors'
import { createQuestion } from '../api/questions'
import { getTopic, getTopicContextTree } from '../api/topics'
import { AppIcon } from '../components/AppIcon'
import type { LayoutContext } from '../components/layout/AppLayout'
import { findTopicPath } from '../components/layout/topicTreeUtils'
import { QuestionForm } from '../components/QuestionForm'
import type { QuestionFormValues } from '../components/QuestionForm'
import { QuestionList } from '../components/QuestionList'
import { TopicOverview } from '../components/topics/TopicOverview'
import type { Topic, TopicTree } from '../types/topic'

import './topicPage.css'

export function TopicPage() {
  const { topicId } = useParams<{ topicId: string }>()
  const { topics, refreshTopics } = useOutletContext<LayoutContext>()

  const [topic, setTopic] = useState<Topic | null>(null)
  const [contextTree, setContextTree] = useState<TopicTree | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [creatingQuestion, setCreatingQuestion] = useState(false)
  const [questionListVersion, setQuestionListVersion] = useState(0)
  const [questionNotice, setQuestionNotice] = useState<string | null>(null)

  useEffect(() => {
    if (!topicId) return

    const controller = new AbortController()

    async function loadTopic(id: string) {
      // The topic itself is essential; a failing context-tree request must not
      // prevent viewing its questions or opening practice mode.
      const [topicResult, contextResult] = await Promise.allSettled([
        getTopic(id, controller.signal),
        getTopicContextTree(id, controller.signal),
      ])

      if (controller.signal.aborted) return

      if (topicResult.status === 'rejected') {
        const reason: unknown = topicResult.reason
        if (reason instanceof ApiError && reason.status === 404) {
          setNotFound(true)
        } else {
          setError(
            reason instanceof Error ? reason.message : 'Could not load topic.',
          )
        }
      } else {
        setTopic(topicResult.value)
        if (contextResult.status === 'fulfilled') {
          setContextTree(contextResult.value)
        }
      }
      setLoading(false)
    }

    void loadTopic(topicId)
    return () => controller.abort()
  }, [topicId])

  async function refreshContext(
    id: string,
    action: 'created' | 'updated' | 'deleted',
  ) {
    try {
      setContextTree(await getTopicContextTree(id))
    } catch {
      setQuestionNotice(
        `Question ${action}. Reload to refresh question counts.`,
      )
    }
  }

  async function handleCreateQuestion(
    values: QuestionFormValues,
  ): Promise<void> {
    if (!topic) throw new Error('Topic is unavailable.')

    await createQuestion({ ...values, topicId: topic.id })
    setCreatingQuestion(false)
    setQuestionNotice('Question created successfully.')
    refreshTopics()
    // Remount the list to reuse its established loading and fetching behavior.
    setQuestionListVersion((version) => version + 1)
    void refreshContext(topic.id, 'created')
  }

  function handleQuestionDeleted(): void {
    if (!topic) return
    setQuestionNotice('Question deleted successfully.')
    refreshTopics()
    void refreshContext(topic.id, 'deleted')
  }

  function handleQuestionUpdated(): void {
    if (!topic) return
    setQuestionNotice('Question updated successfully.')
    refreshTopics()
    void refreshContext(topic.id, 'updated')
  }

  if (!topicId) {
    return <p role="alert">Topic ID is missing.</p>
  }

  if (loading) {
    return (
      <main className="topic-page">
        <div className="topic-page__state" role="status">
          <AppIcon name="book" size={25} />
          <h1>Loading topic...</h1>
          <p>Preparing your question bank.</p>
        </div>
      </main>
    )
  }

  if (notFound || error || !topic) {
    return (
      <main className="topic-page">
        <div className="topic-page__state" role="alert">
          <AppIcon name="book" size={25} />
          <h1>{notFound ? 'Topic not found' : 'Could not load topic'}</h1>
          <p>
            {error ??
              (notFound
                ? 'This topic may have been deleted.'
                : 'Topic data is unavailable.')}
          </p>
          <Link to="/" className="ui-button ui-button--secondary">
            Back to topics
          </Link>
        </div>
      </main>
    )
  }

  // Context-tree data is refreshed after mutations. Use the app-wide tree as
  // a fallback for breadcrumbs/counts while it is loading or unavailable.
  const contextPath = contextTree ? findTopicPath([contextTree], topic.id) : []
  const layoutPath = findTopicPath(topics, topic.id)
  const path = contextPath.length > 0 ? contextPath : layoutPath
  const selectedTree = path.at(-1) ?? null

  return (
    <main className="topic-page">
      <TopicOverview topic={topic} path={path} selectedTree={selectedTree} />

      <div className="topic-page__questions-panel">
        <QuestionList
          key={`${topic.id}-${questionListVersion}`}
          topicId={topic.id}
          onQuestionDeleted={handleQuestionDeleted}
          onQuestionUpdated={handleQuestionUpdated}
          actions={
            !creatingQuestion && (
              <button
                className="ui-button ui-button--primary topic-page__add-button"
                type="button"
                onClick={() => {
                  setQuestionNotice(null)
                  setCreatingQuestion(true)
                }}
              >
                <AppIcon name="plus" size={18} />
                Add question
              </button>
            )
          }
        >
          {questionNotice && (
            <p className="topic-page__notice" role="status">
              {questionNotice}
            </p>
          )}

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
      </div>
    </main>
  )
}
