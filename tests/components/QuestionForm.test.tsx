import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { QuestionForm } from '../../src/components/QuestionForm'

describe('QuestionForm', () => {
  it('trims input before submitting and uses medium difficulty by default', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)

    render(<QuestionForm onSubmit={onSubmit} onCancel={vi.fn()} />)

    await user.type(
      screen.getByRole('textbox', { name: 'Question' }),
      '  What is Python?  ',
    )
    await user.type(
      screen.getByRole('textbox', { name: 'Answer' }),
      '  A language  ',
    )
    await user.click(screen.getByRole('button', { name: 'Save question' }))

    expect(onSubmit).toHaveBeenCalledExactlyOnceWith({
      question: 'What is Python?',
      answer: 'A language',
      difficulty: 'medium',
    })
  })

  it('rejects whitespace-only question content before calling onSubmit', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)

    render(<QuestionForm onSubmit={onSubmit} onCancel={vi.fn()} />)

    await user.type(screen.getByRole('textbox', { name: 'Question' }), '   ')
    await user.type(
      screen.getByRole('textbox', { name: 'Answer' }),
      'An answer',
    )
    await user.click(screen.getByRole('button', { name: 'Save question' }))

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Question and answer cannot be empty.',
    )
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits changed difficulty and selected topic when editing', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)

    render(
      <QuestionForm
        onSubmit={onSubmit}
        onCancel={vi.fn()}
        initialValues={{
          question: 'What is Python?',
          answer: 'A language',
          difficulty: 'easy',
        }}
        initialTopicId="python"
        topicOptions={[
          { id: 'python', label: 'Python' },
          { id: 'sql', label: 'SQL' },
        ]}
      />,
    )

    await user.click(screen.getByRole('radio', { name: 'Hard' }))
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Topic' }),
      'sql',
    )
    await user.click(screen.getByRole('button', { name: 'Save question' }))

    expect(onSubmit).toHaveBeenCalledExactlyOnceWith({
      question: 'What is Python?',
      answer: 'A language',
      difficulty: 'hard',
      topicId: 'sql',
    })
  })

  it('displays an error if saving fails', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockRejectedValue(new Error('Server unavailable'))
    render(
      <QuestionForm
        onSubmit={onSubmit}
        onCancel={vi.fn()}
        initialValues={{
          question: 'What is Python?',
          answer: 'A language',
          difficulty: 'medium',
        }}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Save question' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Server unavailable',
    )
    expect(screen.getByRole('button', { name: 'Save question' })).toBeEnabled()
  })

  it('calls onCancel without submitting the form', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    const onCancel = vi.fn()
    render(<QuestionForm onSubmit={onSubmit} onCancel={onCancel} />)

    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onCancel).toHaveBeenCalledOnce()
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
