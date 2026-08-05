import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { LegacyColumnDef as ColumnDef } from '@tanstack/react-table/legacy'
import { DataTable } from './data-table'

interface Row {
  id: string
  name: string
  role: string
}

const columns: ColumnDef<Row, unknown>[] = [
  { id: 'name', accessorKey: 'name', header: 'Name' },
  { id: 'role', accessorKey: 'role', header: 'Role' },
]

function makeRows(count: number): Row[] {
  return Array.from({ length: count }, (_, i) => ({ id: `row-${i + 1}`, name: `Person ${i + 1}`, role: i % 2 === 0 ? 'Teacher' : 'Student' }))
}

describe('DataTable — rendering', () => {
  it('renders a row per data item', () => {
    render(<DataTable columns={columns} data={makeRows(3)} />)
    expect(screen.getByText('Person 1')).toBeInTheDocument()
    expect(screen.getByText('Person 2')).toBeInTheDocument()
    expect(screen.getByText('Person 3')).toBeInTheDocument()
  })

  it('shows the empty state when data is empty', () => {
    render(<DataTable columns={columns} data={[]} emptyLabel="Nothing here" />)
    expect(screen.getByText('Nothing here')).toBeInTheDocument()
  })

  it('uses the default empty label when none is provided', () => {
    render(<DataTable columns={columns} data={[]} />)
    expect(screen.getByText('No results found')).toBeInTheDocument()
  })

  it('shows the row count summary', () => {
    render(<DataTable columns={columns} data={makeRows(3)} />)
    expect(screen.getByText('Showing 3 of 3 rows')).toBeInTheDocument()
  })
})

describe('DataTable — global filter search', () => {
  it('filters visible rows down to those matching the search box', async () => {
    const user = userEvent.setup()
    render(<DataTable columns={columns} data={makeRows(3)} searchPlaceholder="Search rows..." />)

    const searchBox = screen.getByPlaceholderText('Search rows...')
    await user.type(searchBox, 'Person 2')

    expect(screen.getByText('Person 2')).toBeInTheDocument()
    expect(screen.queryByText('Person 1')).not.toBeInTheDocument()
    expect(screen.queryByText('Person 3')).not.toBeInTheDocument()
    expect(screen.getByText('Showing 1 of 1 rows')).toBeInTheDocument()
  })

  it('shows the empty state when the search matches nothing', async () => {
    const user = userEvent.setup()
    render(<DataTable columns={columns} data={makeRows(3)} />)

    await user.type(screen.getByPlaceholderText('Search...'), 'nonexistent-person-zzz')

    expect(screen.getByText('No results found')).toBeInTheDocument()
  })

  it('restores all rows when the search box is cleared', async () => {
    const user = userEvent.setup()
    render(<DataTable columns={columns} data={makeRows(3)} />)

    const searchBox = screen.getByPlaceholderText('Search...')
    await user.type(searchBox, 'Person 2')
    expect(screen.queryByText('Person 1')).not.toBeInTheDocument()

    await user.clear(searchBox)
    expect(screen.getByText('Person 1')).toBeInTheDocument()
    expect(screen.getByText('Person 2')).toBeInTheDocument()
    expect(screen.getByText('Person 3')).toBeInTheDocument()
  })
})

describe('DataTable — pagination', () => {
  it('shows only the first page worth of rows by default (page size 10)', () => {
    render(<DataTable columns={columns} data={makeRows(15)} />)
    expect(screen.getByText('Person 1')).toBeInTheDocument()
    expect(screen.getByText('Person 10')).toBeInTheDocument()
    expect(screen.queryByText('Person 11')).not.toBeInTheDocument()
    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument()
  })

  it('next-page button navigates forward and back button returns to page 1', async () => {
    const user = userEvent.setup()
    const { container } = render(<DataTable columns={columns} data={makeRows(15)} />)

    const paginationButtons = container.querySelectorAll('.flex.items-center.gap-1 button')
    // Order: first-page, prev-page, next-page, last-page
    expect(paginationButtons).toHaveLength(4)
    const [firstPageBtn, prevPageBtn, nextPageBtn, lastPageBtn] = Array.from(paginationButtons) as HTMLButtonElement[]

    expect(prevPageBtn).toBeDisabled()
    expect(firstPageBtn).toBeDisabled()

    await user.click(nextPageBtn)
    expect(screen.getByText('Page 2 of 2')).toBeInTheDocument()
    expect(screen.getByText('Person 11')).toBeInTheDocument()
    expect(screen.queryByText('Person 1')).not.toBeInTheDocument()
    expect(nextPageBtn).toBeDisabled()
    expect(lastPageBtn).toBeDisabled()

    await user.click(prevPageBtn)
    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument()
    expect(screen.getByText('Person 1')).toBeInTheDocument()
  })

  it('jumps to the last page directly', async () => {
    const user = userEvent.setup()
    const { container } = render(<DataTable columns={columns} data={makeRows(25)} />)

    const paginationButtons = container.querySelectorAll('.flex.items-center.gap-1 button')
    const lastPageBtn = paginationButtons[3] as HTMLButtonElement

    await user.click(lastPageBtn)
    expect(screen.getByText('Page 3 of 3')).toBeInTheDocument()
  })

  it('changing the page size shows more rows per page', async () => {
    const user = userEvent.setup()
    render(<DataTable columns={columns} data={makeRows(15)} />)

    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument()

    // Rows-per-page select trigger currently shows "10"
    await user.click(screen.getByRole('combobox'))
    await user.click(await screen.findByRole('option', { name: '20' }))

    expect(screen.getByText('Page 1 of 1')).toBeInTheDocument()
    expect(screen.getByText('Person 15')).toBeInTheDocument()
  })
})

describe('DataTable — column visibility and export', () => {
  it('toggling a column checkbox off hides that column header', async () => {
    const user = userEvent.setup()
    render(<DataTable columns={columns} data={makeRows(2)} />)

    expect(screen.getByRole('columnheader', { name: 'Role' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /columns/i }))
    await user.click(await screen.findByRole('menuitemcheckbox', { name: 'role' }))

    expect(screen.queryByRole('columnheader', { name: 'Role' })).not.toBeInTheDocument()
  })

  it('calls onExport with the currently filtered rows when Export is clicked', async () => {
    const user = userEvent.setup()
    const onExport = vi.fn()
    render(<DataTable columns={columns} data={makeRows(3)} onExport={onExport} />)

    await user.click(screen.getByRole('button', { name: /export/i }))

    expect(onExport).toHaveBeenCalledTimes(1)
    expect(onExport).toHaveBeenCalledWith(makeRows(3))
  })
})
