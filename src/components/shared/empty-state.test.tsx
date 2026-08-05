import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Inbox } from 'lucide-react'
import { EmptyState } from './empty-state'

describe('EmptyState', () => {
  it('renders the title', () => {
    render(<EmptyState icon={Inbox} title="No results found" />)
    expect(screen.getByText('No results found')).toBeInTheDocument()
  })

  it('renders the description when provided', () => {
    render(<EmptyState icon={Inbox} title="No results found" description="Try adjusting your filters" />)
    expect(screen.getByText('Try adjusting your filters')).toBeInTheDocument()
  })

  it('omits the description paragraph when none is provided', () => {
    render(<EmptyState icon={Inbox} title="No results found" />)
    expect(screen.queryByText(/try adjusting/i)).not.toBeInTheDocument()
  })

  it('renders the action node when provided', () => {
    render(<EmptyState icon={Inbox} title="No results found" action={<button>Reset filters</button>} />)
    expect(screen.getByRole('button', { name: 'Reset filters' })).toBeInTheDocument()
  })
})
