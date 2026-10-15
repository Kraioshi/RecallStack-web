import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { PracticeFilters } from '../../src/components/PracticeFilters'

describe('PracticeFilters', () => {
  const counts = { easy: 2, medium: 3, hard: 1, total: 6 }

  it('shows counts in the difficulty options', () => {
    render(
      <PracticeFilters
        difficulty=""
        includeDescendants={false}
        showDescendants={false}
        questionCounts={counts}
        onDifficultyChange={vi.fn()}
        onIncludeDescendantsChange={vi.fn()}
      />,
    )

    expect(
      screen.getByRole('option', { name: 'All difficulties (6)' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Easy (2)' })).toBeInTheDocument()
    expect(
      screen.getByRole('option', { name: 'Medium (3)' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Hard (1)' })).toBeInTheDocument()
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
  })

  it('reports difficulty and descendant changes through callbacks', async () => {
    const user = userEvent.setup()
    const onDifficultyChange = vi.fn()
    const onIncludeDescendantsChange = vi.fn()

    render(
      <PracticeFilters
        difficulty=""
        includeDescendants={false}
        showDescendants
        questionCounts={counts}
        onDifficultyChange={onDifficultyChange}
        onIncludeDescendantsChange={onIncludeDescendantsChange}
      />,
    )

    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Difficulty' }),
      'hard',
    )
    await user.click(
      screen.getByRole('checkbox', { name: 'Include subtopics' }),
    )

    expect(onDifficultyChange).toHaveBeenCalledWith('hard')
    expect(onIncludeDescendantsChange).toHaveBeenCalledWith(true)
  })

  it('renders labels without counts while counts are loading', () => {
    render(
      <PracticeFilters
        difficulty="medium"
        includeDescendants
        showDescendants
        questionCounts={null}
        onDifficultyChange={vi.fn()}
        onIncludeDescendantsChange={vi.fn()}
      />,
    )

    expect(screen.getByRole('option', { name: 'Medium' })).toBeInTheDocument()
    expect(
      screen.getByRole('checkbox', { name: 'Include subtopics' }),
    ).toBeChecked()
  })
})
