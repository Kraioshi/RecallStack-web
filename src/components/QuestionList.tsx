import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'

import { deleteQuestion, getQuestionsByTopic } from '../api/questions'
import type { Question } from '../types/question'
import { QuestionCard } from './QuestionCard'

import './questions.css'

interface QuestionListProps {
  topicId: string
  actions?: ReactNode
  children?: ReactNode
  onQuestionDeleted?: () => void
}

export function QuestionList({
  topicId,
  actions,
  children,
  onQuestionDeleted,
}: QuestionListProps) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingQuestionId, setDeletingQuestionId] = useState<string | null>(
    null,
  )
  const [deleteError, setDeleteError] = useState<string | null>(null)

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

  async function handleDeleteQuestion(question: Question): Promise<void> {
    if (deletingQuestionId !== null) return

    const confirmed = window.confirm(
      `Delete this question?\n\n${question.question.slice(0, 120)}\n\nThis action cannot be undone.`,
    )
    if (!confirmed) return

    setDeleteError(null)
    setDeletingQuestionId(question.id)

    try {
      await deleteQuestion(question.id)
      setQuestions((current) =>
        current.filter((item) => item.id !== question.id),
      )
      onQuestionDeleted?.()
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : 'Could not delete question.',
      )
    } finally {
      setDeletingQuestionId(null)
    }
  }

  return (
    <section className="questions-section" aria-labelledby="questions-heading">
      <div className="questions-section__header">
        <h2 id="questions-heading">Questions</h2>
        {actions}
      </div>

      {children}

      {deleteError && (
        <p className="question-form__error" role="alert">
          {deleteError}
        </p>
      )}

      {loading ? (
        <p>Loading questions...</p>
      ) : error ? (
        <p role="alert">{error}</p>
      ) : questions.length === 0 ? (
        <p>No questions in this topic yet.</p>
      ) : (
        <ul className="question-list">
          {questions.map((question) => (
            <QuestionCard
              key={question.id}
              question={question}
              deleting={deletingQuestionId === question.id}
              onDelete={(item) => void handleDeleteQuestion(item)}
            />
          ))}
        </ul>
      )}
    </section>
  )
}
