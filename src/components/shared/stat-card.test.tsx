import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Users } from 'lucide-react'
import { StatCard } from './stat-card'

describe('StatCard', () => {
  it('renders the label and value', () => {
    render(<StatCard label="Total Students" value="500" icon={Users} />)
    expect(screen.getByText('Total Students')).toBeInTheDocument()
    expect(screen.getByText('500')).toBeInTheDocument()
  })

  it('does not render a change indicator when change is not provided', () => {
    render(<StatCard label="Total Students" value="500" icon={Users} />)
    expect(screen.queryByText(/vs last month/i)).not.toBeInTheDocument()
  })

  it('renders a positive change with the default "vs last month" label', () => {
    render(<StatCard label="Total Students" value="500" change={4.2} icon={Users} />)
    expect(screen.getByText('4.2%')).toBeInTheDocument()
    expect(screen.getByText('vs last month')).toBeInTheDocument()
  })

  it('renders a negative change using its absolute value and a custom changeLabel', () => {
    render(<StatCard label="Pending Fees" value="$1,200" change={-3.1} changeLabel="vs last week" icon={Users} />)
    expect(screen.getByText('3.1%')).toBeInTheDocument()
    expect(screen.getByText('vs last week')).toBeInTheDocument()
  })

  it('treats a change of exactly 0 as positive', () => {
    render(<StatCard label="Total Students" value="500" change={0} icon={Users} />)
    expect(screen.getByText('0%')).toBeInTheDocument()
  })
})
