import { useId, useState } from 'react'

import type { Question } from '../types/question'
import { AppIcon } from './AppIcon'

interface QuestionCardProps {
  question: Question
  number: number
  onDelete?: (question: Question) => void
  onEdit?: (question: Question) => void
  onRequestDelete?: (question: Question) => void
  onCancelDelete?: () => void
  confirmingDelete?: boolean
  deleteError?: string | null
  deleting?: boolean
  actionsDisabled?: boolean
}

export function QuestionCard({
  question,
  number,
  onDelete,
  onEdit,
  onRequestDelete,
  onCancelDelete,
  confirmingDelete = false,
  deleteError = null,
  deleting = false,
  actionsDisabled = false,
}: QuestionCardProps) {
  const [answerVisible, setAnswerVisible] = useState(false)
  const answerId = useId()

  return (
    <li
      className={`question-card${answerVisible ? ' question-card--expanded' : ''}${confirmingDelete ? ' question-card--confirming' : ''}`}
    >
      <div className="question-card__row">
        <span
          className="question-card__number"
          aria-label={`Question ${number}`}
        >
          {number}
        </span>
        <h3 className="question-card__title">{question.question}</h3>
        <span
          className={`question-card__difficulty question-card__difficulty--${question.difficulty}`}
        >
          {question.difficulty}
        </span>
        <div className="question-card__actions">
          <button
            className="question-card__action question-card__action--answer"
            type="button"
            aria-expanded={answerVisible}
            aria-controls={answerId}
            onClick={() => setAnswerVisible((visible) => !visible)}
            disabled={deleting || confirmingDelete}
          >
            <AppIcon name={answerVisible ? 'eye-off' : 'eye'} size={16} />
            <span>{answerVisible ? 'Hide answer' : 'Show answer'}</span>
          </button>

          {(onEdit || onRequestDelete) && (
            <span
              className="question-card__actions-divider"
              aria-hidden="true"
            />
          )}
          {onEdit && (
            <button
              className="question-card__action question-card__action--edit"
              type="button"
              disabled={actionsDisabled || deleting}
              onClick={() => onEdit(question)}
              aria-label={`Edit question ${number}`}
            >
              <AppIcon name="edit" size={16} />
              <span>Edit</span>
            </button>
          )}
          {onRequestDelete && (
            <button
              className="question-card__action question-card__action--delete"
              type="button"
              disabled={actionsDisabled || deleting}
              onClick={() => onRequestDelete(question)}
              aria-label={`Delete question ${number}`}
            >
              <AppIcon name="trash" size={16} />
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>

      <div
        className="question-card__answer"
        id={answerId}
        hidden={!answerVisible}
      >
        <div className="question-card__answer-label">
          <AppIcon name="file" size={17} />
          <span>Answer</span>
        </div>
        <p>{question.answer}</p>
      </div>

      {confirmingDelete && (
        <div
          className="question-card__confirm"
          role="group"
          aria-label="Confirm deletion"
        >
          <div className="question-card__confirm-copy">
            <AppIcon name="alert-circle" size={20} />
            <div>
              <strong>Delete this question?</strong>
              <p>This action cannot be undone.</p>
            </div>
          </div>
          <div className="question-card__confirm-actions">
            <button
              type="button"
              className="ui-button ui-button--secondary"
              onClick={onCancelDelete}
              disabled={deleting}
              autoFocus
            >
              Cancel
            </button>
            <button
              type="button"
              className="question-card__confirm-delete"
              onClick={() => onDelete?.(question)}
              disabled={deleting}
            >
              <AppIcon name="trash" size={16} />
              {deleting ? 'Deleting...' : 'Delete question'}
            </button>
          </div>
        </div>
      )}
      {deleteError && (
        <p className="question-form__error question-card__error" role="alert">
          <AppIcon name="alert-circle" size={18} />
          <span>{deleteError}</span>
        </p>
      )}
    </li>
  )
}
