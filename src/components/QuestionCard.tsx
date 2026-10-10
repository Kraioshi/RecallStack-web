import { useState } from 'react'

import type { Question } from '../types/question'

interface QuestionCardProps {
  question: Question
  onDelete?: (question: Question) => void
  deleting?: boolean
}

export function QuestionCard({
  question,
  onDelete,
  deleting = false,
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

        {onDelete && (
          <button
            className="question-card__delete"
            type="button"
            disabled={deleting}
            onClick={() => onDelete(question)}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        )}
      </div>
    </li>
  )
}
