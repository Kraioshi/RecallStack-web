import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { ApiError } from '../api/errors'
import { getRandomQuestion } from '../api/questions'
import { PracticeCard } from '../components/PracticeCard'
import { PracticeFilters } from '../components/PracticeFilters'
import type { Question, QuestionDifficulty } from '../types/question'

import './practice.css'

type PracticeStatus = 'loading' | 'ready' | 'empty' | 'error'

type QuestionRequest = {
  excludeId?: string
}

export function PracticePage() {
  const [searchParams] = useSearchParams()
  const topicId = searchParams.get('topic_id') || undefined

  const [difficulty, setDifficulty] = useState<QuestionDifficulty | ''>('')
  const [includeDescendants, setIncludeDescendants] = useState(true)

  const [question, setQuestion] = useState<Question | null>(null)
  const [status, setStatus] = useState<PracticeStatus>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Each new request object triggers the fetching effect.
  const [request, setRequest] = useState<QuestionRequest>({})

  // Prepare the UI for a new question request.
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

  // Fetch on initial mount and whenever filters or request change.
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

    // Cancel the previous request when dependencies change.
    return () => controller.abort()
  }, [topicId, difficulty, includeDescendants, request])

  return (
    <main className="practice-page">
      <Link to={topicId ? `/topics/${topicId}` : '/'}>← Back to topics</Link>

      <h1>{topicId ? 'Practice this topic' : 'Practice all topics'}</h1>

      <p className="practice-page__intro">
        Select your preferences, try answering each question, then reveal its
        answer.
      </p>

      <PracticeFilters
        difficulty={difficulty}
        includeDescendants={includeDescendants}
        showDescendants={Boolean(topicId)}
        onDifficultyChange={handleDifficultyChange}
        onIncludeDescendantsChange={handleIncludeDescendantsChange}
      />

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
