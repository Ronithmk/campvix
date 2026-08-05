import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PageHeader } from './page-header'

describe('PageHeader', () => {
  it('renders the title', () => {
    render(<PageHeader title="Students" />)
    expect(screen.getByRole('heading', { name: 'Students' })).toBeInTheDocument()
  })

  it('renders the description when provided', () => {
    render(<PageHeader title="Students" description="Manage your student roster" />)
    expect(screen.getByText('Manage your student roster')).toBeInTheDocument()
  })

  it('does not render a description paragraph when none is provided', () => {
    render(<PageHeader title="Students" />)
    expect(screen.queryByText(/manage/i)).not.toBeInTheDocument()
  })

  it('renders actions when provided', () => {
    render(<PageHeader title="Students" actions={<button>Add Student</button>} />)
    expect(screen.getByRole('button', { name: 'Add Student' })).toBeInTheDocument()
  })
})
