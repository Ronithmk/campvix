import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Breadcrumbs } from './breadcrumbs'

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Breadcrumbs />
    </MemoryRouter>,
  )
}

describe('Breadcrumbs', () => {
  it('renders only the home link for the dashboard root', () => {
    renderAt('/app/dashboard')
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('renders a humanized, capitalized segment for a nested path', () => {
    renderAt('/app/finance/fee-management')
    expect(screen.getByText('Finance')).toBeInTheDocument()
    expect(screen.getByText('Fee Management')).toBeInTheDocument()
  })

  it('renders the last segment as plain text (not a link) and earlier segments as links', () => {
    renderAt('/app/finance/fee-management')
    expect(screen.queryByRole('link', { name: 'Fee Management' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Finance' })).toBeInTheDocument()
  })

  it('strips the "app" prefix segment from the breadcrumb trail', () => {
    renderAt('/app/students')
    expect(screen.queryByText('App')).not.toBeInTheDocument()
    expect(screen.getByText('Students')).toBeInTheDocument()
  })
})
