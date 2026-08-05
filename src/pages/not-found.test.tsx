import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import NotFoundPage from './not-found'

describe('NotFoundPage', () => {
  it('renders a not-found message with a link back to the dashboard', () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>,
    )

    expect(screen.getByText(/page not found/i)).toBeInTheDocument()
    const link = screen.getByRole('link', { name: /back to dashboard/i })
    expect(link).toHaveAttribute('href', '/app/dashboard')
  })
})
