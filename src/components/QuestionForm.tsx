import { useId, useState } from 'react'
import type { FormEvent } from 'react'

import type { QuestionDifficulty } from '../types/question'
import { AppIcon } from './AppIcon'

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

const difficultyOptions: { value: QuestionDifficulty; label: string }[] = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
]

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
          placeholder="What concept do you want to remember?"
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
          placeholder="Write a clear explanation. Line breaks are preserved."
          value={answer}
          onChange={(event) => setAnswer(event.target.value)}
          disabled={submitting}
        />
        <span className="question-form__hint">
          Keep it useful for future review. Formatting and line breaks are
          preserved.
        </span>
      </div>

      <fieldset className="question-form__difficulty-field">
        <legend>Difficulty</legend>
        <div className="question-form__difficulty-options">
          {difficultyOptions.map((option) => (
            <label
              key={option.value}
              className={`question-form__difficulty-choice question-form__difficulty-choice--${option.value}${difficulty === option.value ? ' question-form__difficulty-choice--selected' : ''}`}
            >
              <input
                type="radio"
                name={`${id}-difficulty`}
                value={option.value}
                checked={difficulty === option.value}
                onChange={() => setDifficulty(option.value)}
                disabled={submitting}
              />
              <span
                className={`question-form__difficulty-dot question-form__difficulty-dot--${option.value}`}
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

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
          <span className="question-form__hint">
            Moving the question to another topic will remove it from this list.
          </span>
        </div>
      )}

      {error && (
        <p role="alert" className="question-form__error">
          <AppIcon name="alert-circle" size={17} />
          <span>{error}</span>
        </p>
      )}

      <div className="question-form__actions">
        <button
          className="ui-button ui-button--primary question-form__primary"
          type="submit"
          disabled={submitting}
        >
          {submitting ? 'Saving...' : submitLabel}
        </button>
        <button
          className="ui-button ui-button--secondary"
          type="button"
          onClick={onCancel}
          disabled={submitting}
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
