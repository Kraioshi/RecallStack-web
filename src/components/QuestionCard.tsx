import { useState } from 'react'

import type { Question } from '../types/question'

interface QuestionCardProps {
  question: Question
  onDelete?: (question: Question) => void
  onEdit?: (question: Question) => void
  deleting?: boolean
  actionsDisabled?: boolean
}

export function QuestionCard({
  question,
  onDelete,
  onEdit,
  deleting = false,
  actionsDisabled = false,
}: QuestionCardProps) {
  const [answerVisible, setAnswerVisible] = useState(false)

  return (
    <li className="question-card">
      <div className="question-card__header">
        <h3>{question.question}</h3>
        <span
          className={`question-card__difficulty question-card__difficulty--${question.difficulty}`}
        >
          {question.difficulty}
        </span>
      </div>

      {answerVisible && (
        <div className="question-card__answer">
          <strong>Answer</strong>
          <p>{question.answer}</p>
        </div>
      )}

      <div className="question-card__actions">
        <button
          className="question-card__toggle"
          type="button"
          aria-expanded={answerVisible}
          onClick={() => setAnswerVisible((visible) => !visible)}
          disabled={deleting}
        >
          {answerVisible ? 'Hide answer' : 'Reveal answer'}
        </button>

        {onEdit && (
          <button
            className="question-card__toggle"
            type="button"
            disabled={actionsDisabled || deleting}
            onClick={() => onEdit(question)}
          >
            Edit
          </button>
        )}

        {onDelete && (
          <button
            className="question-card__delete"
            type="button"
            disabled={actionsDisabled || deleting}
            onClick={() => onDelete(question)}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        )}
      </div>
    </li>
  )
}
