import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { QuestionCard } from '../../src/components/QuestionCard'
import { makeQuestion } from '../fixtures/questions'

describe('QuestionCard', () => {
  const question = makeQuestion()

  it('toggles the answer with accessible button state', async () => {
    const user = userEvent.setup()
    render(<QuestionCard question={question} number={1} />)

    expect(screen.getByRole('button', { name: 'Show answer' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
    expect(screen.queryByText(question.answer)).not.toBeVisible()

    await user.click(screen.getByRole('button', { name: 'Show answer' }))
    expect(screen.getByText(question.answer)).toBeVisible()
    expect(screen.getByRole('button', { name: 'Hide answer' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
  })

  it('passes the question to edit and request-delete handlers', async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()
    const onRequestDelete = vi.fn()
    render(
      <QuestionCard
        question={question}
        number={3}
        onEdit={onEdit}
        onRequestDelete={onRequestDelete}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Edit question 3' }))
    await user.click(screen.getByRole('button', { name: 'Delete question 3' }))

    expect(onEdit).toHaveBeenCalledExactlyOnceWith(question)
    expect(onRequestDelete).toHaveBeenCalledExactlyOnceWith(question)
  })

  it('confirms deletion only after explicit confirmation', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    const onCancelDelete = vi.fn()
    render(
      <QuestionCard
        question={question}
        number={1}
        confirmingDelete
        onDelete={onDelete}
        onCancelDelete={onCancelDelete}
      />,
    )

    expect(
      screen.getByRole('group', { name: 'Confirm deletion' }),
    ).toBeVisible()
    expect(onDelete).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Delete question' }))
    expect(onDelete).toHaveBeenCalledExactlyOnceWith(question)

    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onCancelDelete).toHaveBeenCalledOnce()
  })

  it('disables destructive actions while a deletion is running', () => {
    render(
      <QuestionCard
        question={question}
        number={1}
        confirmingDelete
        deleting
        onDelete={vi.fn()}
        onRequestDelete={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: 'Deleting...' })).toBeDisabled()
    expect(
      screen.getByRole('button', { name: 'Delete question 1' }),
    ).toBeDisabled()
  })
})
