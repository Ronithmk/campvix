import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RouteErrorBoundary, RouteLoadingFallback } from './route-boundary'

function Bomb(): never {
  throw new Error('boom')
}

describe('RouteLoadingFallback', () => {
  it('renders a skeleton without throwing', () => {
    const { container } = render(<RouteLoadingFallback />)
    expect(container.firstChild).not.toBeNull()
  })
})

describe('RouteErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <RouteErrorBoundary>
        <div>Page content</div>
      </RouteErrorBoundary>,
    )
    expect(screen.getByText('Page content')).toBeInTheDocument()
  })

  it('renders the fallback UI with a Reload button when a child throws during render', () => {
    // React logs the caught render error to console.error; this is expected
    // for this test, so we suppress it rather than let it pollute test output.
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <RouteErrorBoundary>
        <Bomb />
      </RouteErrorBoundary>,
    )

    expect(screen.getByText("This page couldn't load")).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reload page/i })).toBeInTheDocument()

    consoleSpy.mockRestore()
  })
})
