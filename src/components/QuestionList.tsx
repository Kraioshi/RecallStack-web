import { useEffect, useState } from 'react'

import { getQuestionsByTopic } from '../api/questions'
import type { Question } from '../types/question'
import { QuestionCard } from './QuestionCard'

import './questions.css'

interface QuestionListProps {
  topicId: string
}

export function QuestionList({ topicId }: QuestionListProps) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function loadQuestions() {
      try {
        const data = await getQuestionsByTopic(topicId, controller.signal)
        if (!controller.signal.aborted) {
          setQuestions(data)
        }
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

    void loadQuestions()

    return () => controller.abort()
  }, [topicId])

  return (
    <section className="questions-section" aria-labelledby="questions-heading">
      <h2 id="questions-heading">Questions</h2>

      {loading ? (
        <p>Loading questions...</p>
      ) : error ? (
        <p role="alert">{error}</p>
      ) : questions.length === 0 ? (
        <p>No questions in this topic yet.</p>
      ) : (
        <ul className="question-list">
          {questions.map((question) => (
            <QuestionCard key={question.id} question={question} />
          ))}
        </ul>
      )}
    </section>
  )
}
