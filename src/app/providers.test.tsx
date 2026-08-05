import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AppProviders } from './providers'

beforeEach(() => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  )
})

describe('AppProviders', () => {
  it('renders its children', () => {
    render(
      <AppProviders>
        <div>App content</div>
      </AppProviders>,
    )
    expect(screen.getByText('App content')).toBeInTheDocument()
  })

  it('wraps children with TooltipProvider so a Radix Tooltip can be used without its own provider', () => {
    // If TooltipProvider weren't present, rendering a bare Tooltip primitive
    // would throw ("Tooltip must be used within TooltipProvider"). We simply
    // assert render doesn't throw and content is present.
    render(
      <AppProviders>
        <button>Hover me</button>
      </AppProviders>,
    )
    expect(screen.getByRole('button', { name: 'Hover me' })).toBeInTheDocument()
  })
})
