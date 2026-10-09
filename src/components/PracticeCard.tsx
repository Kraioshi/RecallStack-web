import { useState } from 'react'

import type { Question } from '../types/question'

interface PracticeCardProps {
  question: Question
}

export function PracticeCard({ question }: PracticeCardProps) {
  const [answerVisible, setAnswerVisible] = useState(false)

  return (
    <article className="practice-card">
      <div className="practice-card__heading">
        <h2>{question.question}</h2>
        <span className="practice-card__difficulty">{question.difficulty}</span>
      </div>

      {answerVisible && (
        <div className="practice-card__answer">
          <strong>Answer</strong>
          <p>{question.answer}</p>
        </div>
      )}

      <button
        className="practice-button practice-button--outline"
        type="button"
        aria-expanded={answerVisible}
        onClick={() => setAnswerVisible((visible) => !visible)}
      >
        {answerVisible ? 'Hide answer' : 'Reveal answer'}
      </button>
    </article>
  )
}
