import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { TooltipContentProps } from 'recharts'
import { ChartTooltip } from './chart-tooltip'

type Entry = { dataKey: string; name: string; value: number | string; color: string }

function makeProps(overrides: { active: boolean; payload: Entry[]; label?: string }): TooltipContentProps {
  return {
    active: overrides.active,
    label: overrides.label,
    payload: overrides.payload.map((e) => ({ ...e, graphicalItemId: e.dataKey })),
    coordinate: undefined,
    accessibilityLayer: false,
    activeIndex: undefined,
  }
}

describe('ChartTooltip', () => {
  it('renders nothing when inactive', () => {
    const { container } = render(<ChartTooltip {...makeProps({ active: false, payload: [{ dataKey: 'revenue', name: 'Revenue', value: 1000, color: '#000' }], label: 'Jan' })} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing when payload is empty', () => {
    const { container } = render(<ChartTooltip {...makeProps({ active: true, payload: [], label: 'Jan' })} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders the label and each payload entry name/value when active with data', () => {
    render(
      <ChartTooltip
        {...makeProps({
          active: true,
          label: 'Jan',
          payload: [
            { dataKey: 'revenue', name: 'Revenue', value: 42000, color: '#2563eb' },
            { dataKey: 'target', name: 'Target', value: 50000, color: '#94a3b8' },
          ],
        })}
      />,
    )
    expect(screen.getByText('Jan')).toBeInTheDocument()
    expect(screen.getByText('Revenue')).toBeInTheDocument()
    expect(screen.getByText('42,000')).toBeInTheDocument()
    expect(screen.getByText('Target')).toBeInTheDocument()
    expect(screen.getByText('50,000')).toBeInTheDocument()
  })

  it('renders a non-numeric value as-is without number formatting', () => {
    render(<ChartTooltip {...makeProps({ active: true, label: 'Category', payload: [{ dataKey: 'status', name: 'Status', value: 'Active', color: '#000' }] })} />)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('omits the label element when label is undefined', () => {
    render(<ChartTooltip {...makeProps({ active: true, payload: [{ dataKey: 'revenue', name: 'Revenue', value: 10, color: '#000' }] })} />)
    expect(screen.queryByText('undefined')).not.toBeInTheDocument()
    expect(screen.getByText('Revenue')).toBeInTheDocument()
  })
})
