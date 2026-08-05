import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatusBadge } from './status-badge'

describe('StatusBadge', () => {
  it('renders a known status with its capitalized label', () => {
    render(<StatusBadge status="active" />)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('renders a custom label for statuses that override it (on_leave)', () => {
    render(<StatusBadge status="on_leave" />)
    expect(screen.getByText('On Leave')).toBeInTheDocument()
    expect(screen.queryByText('on_leave')).not.toBeInTheDocument()
  })

  it('humanizes an underscored status with no explicit label mapping', () => {
    render(<StatusBadge status="some_unmapped_status" />)
    expect(screen.getByText('Some unmapped status')).toBeInTheDocument()
  })

  it('falls back to the secondary variant for an unrecognized status', () => {
    const { container } = render(<StatusBadge status="totally-unknown" />)
    expect(screen.getByText('Totally-unknown')).toBeInTheDocument()
    // secondary variant badges don't carry the destructive/success/warning/accent classes
    expect(container.querySelector('[class*="destructive"]')).not.toBeInTheDocument()
  })

  it('applies the passed className', () => {
    render(<StatusBadge status="active" className="my-extra-class" />)
    expect(screen.getByText('Active').closest('span')).toHaveClass('my-extra-class')
  })
})
