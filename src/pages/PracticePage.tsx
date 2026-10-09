import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { ApiError } from '../api/errors'
import { getRandomQuestion } from '../api/questions'
import { getTopicTree } from '../api/topics'
import { PracticeCard } from '../components/PracticeCard'
import { PracticeFilters } from '../components/PracticeFilters'
import type { Question, QuestionDifficulty } from '../types/question'
import type { QuestionCounts, TopicTree } from '../types/topic'

import './practice.css'

type PracticeStatus = 'loading' | 'ready' | 'empty' | 'error'

type QuestionRequest = {
  excludeId?: string
}

function findTopic(topics: TopicTree[], topicId: string): TopicTree | null {
  for (const topic of topics) {
    if (topic.id === topicId) return topic

    const found = findTopic(topic.children, topicId)
    if (found) return found
  }

  return null
}

// The backend returns counts for each individual topic, not its descendants.
function sumQuestionCounts(topics: TopicTree[]): QuestionCounts {
  const counts: QuestionCounts = { easy: 0, medium: 0, hard: 0, total: 0 }

  function visit(topic: TopicTree) {
    counts.easy += topic.question_counts.easy
    counts.medium += topic.question_counts.medium
    counts.hard += topic.question_counts.hard
    counts.total += topic.question_counts.total

    topic.children.forEach(visit)
  }

  topics.forEach(visit)
  return counts
}

export function PracticePage() {
  const [searchParams] = useSearchParams()
  const topicId = searchParams.get('topic_id') || undefined

  // A different topic should start a fresh practice session.
  return <PracticeSession key={topicId ?? 'all'} topicId={topicId} />
}

function PracticeSession({ topicId }: { topicId?: string }) {
  const [difficulty, setDifficulty] = useState<QuestionDifficulty | ''>('')
  const [includeDescendants, setIncludeDescendants] = useState(true)

  const [question, setQuestion] = useState<Question | null>(null)
  const [status, setStatus] = useState<PracticeStatus>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [request, setRequest] = useState<QuestionRequest>({})

  const [topicTree, setTopicTree] = useState<TopicTree[] | null>(null)
  const [countsError, setCountsError] = useState(false)

  // Fetch the topic tree once per practice session for names and counts.
  useEffect(() => {
    const controller = new AbortController()

    getTopicTree(controller.signal)
      .then((tree) => {
        if (!controller.signal.aborted) setTopicTree(tree)
      })
      .catch(() => {
        if (!controller.signal.aborted) setCountsError(true)
      })

    return () => controller.abort()
  }, [])

  const selectedTopic =
    topicId && topicTree ? findTopic(topicTree, topicId) : null

  // Derive these values rather than storing another copy in React state.
  const counts: QuestionCounts | null = !topicTree
    ? null
    : !topicId
      ? sumQuestionCounts(topicTree)
      : !selectedTopic
        ? null
        : includeDescendants
          ? sumQuestionCounts([selectedTopic])
          : selectedTopic.question_counts

  const availableCount = counts ? counts[difficulty || 'total'] : null

  function beginLoading(excludeId?: string) {
    setStatus('loading')
    setErrorMessage(null)
    setRequest({ excludeId })
  }

  function handleDifficultyChange(value: QuestionDifficulty | '') {
    beginLoading()
    setDifficulty(value)
  }

  function handleIncludeDescendantsChange(value: boolean) {
    beginLoading()
    setIncludeDescendants(value)
  }

  // Start the HTTP request in an effect; update React state after it settles.
  useEffect(() => {
    const controller = new AbortController()

    getRandomQuestion(
      {
        topicId,
        difficulty: difficulty || undefined,
        includeDescendants: topicId ? includeDescendants : undefined,
        excludeId: request.excludeId,
      },
      controller.signal,
    )
      .then((nextQuestion) => {
        if (controller.signal.aborted) return

        setQuestion(nextQuestion)
        setStatus('ready')
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return

        setQuestion(null)

        if (error instanceof ApiError && error.status === 404) {
          setStatus('empty')
        } else {
          setErrorMessage(
            error instanceof Error ? error.message : 'Unknown error',
          )
          setStatus('error')
        }
      })

    return () => controller.abort()
  }, [topicId, difficulty, includeDescendants, request])

  return (
    <main className="practice-page">
      <Link to={topicId ? `/topics/${topicId}` : '/'}>← Back to topics</Link>

      <h1>
        {topicId
          ? selectedTopic
            ? `Practice: ${selectedTopic.name}`
            : 'Practice this topic'
          : 'Practice all topics'}
      </h1>

      <p className="practice-page__intro">
        Select your preferences, try answering each question, then reveal its
        answer.
      </p>

      <PracticeFilters
        difficulty={difficulty}
        includeDescendants={includeDescendants}
        showDescendants={Boolean(topicId)}
        questionCounts={counts}
        onDifficultyChange={handleDifficultyChange}
        onIncludeDescendantsChange={handleIncludeDescendantsChange}
      />

      <p className="practice-page__availability" role="status">
        {availableCount !== null
          ? `${availableCount} ${availableCount === 1 ? 'question' : 'questions'} available with these filters`
          : countsError
            ? 'Question counts are unavailable; practice still works.'
            : topicTree && topicId && !selectedTopic
              ? 'This topic was not found in the topic tree.'
              : 'Loading question counts...'}
      </p>

      <section className="practice-session" aria-live="polite">
        {status === 'loading' && <p role="status">Loading a question...</p>}

        {status === 'ready' && question && (
          <>
            <PracticeCard key={question.id} question={question} />
            <button
              className="practice-button"
              type="button"
              onClick={() => beginLoading(question.id)}
            >
              Next question →
            </button>
          </>
        )}

        {status === 'empty' && (
          <div className="practice-message">
            <p>
              {request.excludeId
                ? 'No other question matches these filters.'
                : 'No questions match these filters.'}
            </p>
            <p>Try another difficulty or include subtopics if available.</p>
            {request.excludeId && (
              <button
                className="practice-button"
                type="button"
                onClick={() => beginLoading()}
              >
                Allow repeats
              </button>
            )}
          </div>
        )}

        {status === 'error' && (
          <div className="practice-message" role="alert">
            <p>{errorMessage ?? 'Could not load a question.'}</p>
            <button
              className="practice-button"
              type="button"
              onClick={() => beginLoading()}
            >
              Try again
            </button>
          </div>
        )}
      </section>
    </main>
  )
}
