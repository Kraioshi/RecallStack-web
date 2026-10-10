import { useId, useState } from 'react'
import type { FormEvent } from 'react'

import type { QuestionDifficulty } from '../types/question'

import './questions.css'

export interface QuestionFormValues {
  question: string
  answer: string
  difficulty: QuestionDifficulty
  topicId?: string
}

export interface QuestionFormTopicOption {
  id: string
  label: string
}

interface QuestionFormProps {
  onSubmit: (values: QuestionFormValues) => Promise<void>
  onCancel: () => void
  initialValues?: QuestionFormValues
  initialTopicId?: string
  topicOptions?: QuestionFormTopicOption[]
  submitLabel?: string
}

export function QuestionForm({
  onSubmit,
  onCancel,
  initialValues,
  initialTopicId,
  topicOptions,
  submitLabel = 'Save question',
}: QuestionFormProps) {
  const id = useId()
  const [question, setQuestion] = useState(initialValues?.question ?? '')
  const [answer, setAnswer] = useState(initialValues?.answer ?? '')
  const [difficulty, setDifficulty] = useState<QuestionDifficulty>(
    initialValues?.difficulty ?? 'medium',
  )
  const [selectedTopicId, setSelectedTopicId] = useState(initialTopicId ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedQuestion = question.trim()
    const trimmedAnswer = answer.trim()

    if (!trimmedQuestion || !trimmedAnswer) {
      setError('Question and answer cannot be empty.')
      return
    }

    if (topicOptions && !selectedTopicId) {
      setError('Please choose a topic.')
      return
    }

    setError(null)
    setSubmitting(true)

    try {
      await onSubmit({
        question: trimmedQuestion,
        answer: trimmedAnswer,
        difficulty,
        ...(topicOptions ? { topicId: selectedTopicId } : {}),
      })
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Could not save question.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form
      className="question-form"
      onSubmit={(event) => void handleSubmit(event)}
    >
      <div className="question-form__field">
        <label htmlFor={`${id}-question`}>Question</label>
        <textarea
          id={`${id}-question`}
          required
          rows={3}
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          disabled={submitting}
        />
      </div>

      <div className="question-form__field">
        <label htmlFor={`${id}-answer`}>Answer</label>
        <textarea
          id={`${id}-answer`}
          required
          rows={5}
          value={answer}
          onChange={(event) => setAnswer(event.target.value)}
          disabled={submitting}
        />
      </div>

      <div className="question-form__field">
        <label htmlFor={`${id}-difficulty`}>Difficulty</label>
        <select
          id={`${id}-difficulty`}
          value={difficulty}
          onChange={(event) =>
            setDifficulty(event.target.value as QuestionDifficulty)
          }
          disabled={submitting}
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      {topicOptions && (
        <div className="question-form__field">
          <label htmlFor={`${id}-topic`}>Topic</label>
          <select
            id={`${id}-topic`}
            value={selectedTopicId}
            onChange={(event) => setSelectedTopicId(event.target.value)}
            disabled={submitting}
            required
          >
            {topicOptions.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {error && (
        <p role="alert" className="question-form__error">
          {error}
        </p>
      )}

      <div className="question-form__actions">
        <button
          className="question-form__primary"
          type="submit"
          disabled={submitting}
        >
          {submitting ? 'Saving...' : submitLabel}
        </button>
        <button type="button" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
      </div>
    </form>
  )
}
