import { useState } from 'react'

import type { Question } from '../types/question'

interface QuestionCardProps {
  question: Question
}

export function QuestionCard({ question }: QuestionCardProps) {
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

      <button
        className="question-card__toggle"
        type="button"
        aria-expanded={answerVisible}
        onClick={() => setAnswerVisible((visible) => !visible)}
      >
        {answerVisible ? 'Hide answer' : 'Reveal answer'}
      </button>
    </li>
  )
}
