import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { TopicTree } from '../../src/components/TopicTree'
import { makeTopicTree } from '../fixtures/topics'

describe('TopicTree', () => {
  it('shows an empty state when there are no topics', () => {
    render(
      <MemoryRouter>
        <TopicTree topics={[]} />
      </MemoryRouter>,
    )

    expect(screen.getByText('No topics yet.')).toBeInTheDocument()
  })

  it('renders nested topics with links to the correct detail pages', () => {
    render(
      <MemoryRouter>
        <TopicTree
          topics={[
            makeTopicTree({
              id: 'python',
              name: 'Python',
              children: [makeTopicTree({ id: 'fastapi', name: 'FastAPI' })],
            }),
            makeTopicTree({ id: 'sql', name: 'SQL' }),
          ]}
        />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'Python' })).toHaveAttribute(
      'href',
      '/topics/python',
    )
    expect(screen.getByRole('link', { name: 'SQL' })).toHaveAttribute(
      'href',
      '/topics/sql',
    )
    const fastapiLink = screen.getByRole('link', { name: 'FastAPI' })
    expect(fastapiLink).toHaveAttribute('href', '/topics/fastapi')
    expect(
      within(fastapiLink.closest('li')!).getByText('FastAPI'),
    ).toBeVisible()
  })
})
