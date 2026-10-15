import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { PracticeCard } from '../../src/components/PracticeCard'
import { makeQuestion } from '../fixtures/questions'

describe('PracticeCard', () => {
  it('initially hides the answer but shows the question and difficulty', () => {
    render(<PracticeCard question={makeQuestion()} />)

    expect(
      screen.getByRole('heading', { name: 'What is the GIL?' }),
    ).toBeVisible()
    expect(screen.getByText('medium')).toBeVisible()
    expect(
      screen.queryByText('Global Interpreter Lock'),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Reveal answer' }),
    ).toHaveAttribute('aria-expanded', 'false')
  })

  it('reveals and hides the answer on successive clicks', async () => {
    const user = userEvent.setup()
    render(<PracticeCard question={makeQuestion()} />)

    await user.click(screen.getByRole('button', { name: 'Reveal answer' }))

    expect(screen.getByText('Global Interpreter Lock')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Hide answer' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )

    await user.click(screen.getByRole('button', { name: 'Hide answer' }))
    expect(
      screen.queryByText('Global Interpreter Lock'),
    ).not.toBeInTheDocument()
  })
})
