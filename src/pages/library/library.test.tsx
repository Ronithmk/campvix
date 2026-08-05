import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LibraryPage from './library'
import { useAuthStore } from '@/store/auth-store'
import { usePermissionsStore } from '@/store/permissions-store'
import { schools } from '@/mock/schools'
import { libraryBooks, bookIssues } from '@/mock/library'
import { formatCurrency } from '@/lib/utils'

beforeEach(() => {
  localStorage.clear()
  usePermissionsStore.getState().resetToDefaults()
  useAuthStore.getState().logout()
})

const school = schools[0]
const schoolBooks = libraryBooks.filter((b) => b.schoolId === school.id)
const schoolIssues = bookIssues.filter((i) => i.schoolId === school.id)
const availableBooks = schoolBooks.reduce((sum, b) => sum + b.availableCopies, 0)
const overdue = schoolIssues.filter((i) => i.status === 'overdue').length
const totalFines = schoolIssues.reduce((sum, i) => sum + i.fine, 0)

function statValue(label: string) {
  return screen.getByText(label, { selector: 'p' }).nextElementSibling?.textContent
}

describe('LibraryPage', () => {
  it('renders for administrator with stat cards matching the underlying mock data', () => {
    useAuthStore.getState().loginAsRole('administrator')
    render(<LibraryPage />)

    expect(screen.getByRole('heading', { name: 'Library' })).toBeInTheDocument()
    expect(statValue('Total Titles')).toBe(String(schoolBooks.length))
    expect(statValue('Available Copies')).toBe(String(availableBooks))
    expect(statValue('Overdue Books')).toBe(String(overdue))
    expect(statValue('Outstanding Fines')).toBe(formatCurrency(totalFines))
  })

  it('shows catalog books by default and switches to the issued books tab', async () => {
    const user = userEvent.setup()
    useAuthStore.getState().loginAsRole('administrator')
    render(<LibraryPage />)

    // A book's title can legitimately also appear in the Issued Books tab (a
    // book can be issued multiple times), so use the catalog-only shelf
    // location to prove the catalog tab actually unmounted, not the title.
    const target = schoolBooks[0]
    expect(screen.getByText(target.title)).toBeInTheDocument()
    expect(screen.getByText(target.shelfLocation)).toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: /issued books/i }))
    expect(screen.queryByText(target.shelfLocation)).not.toBeInTheDocument()
  })

  it('removes a book from the catalog after confirming the delete dialog', async () => {
    const user = userEvent.setup()
    useAuthStore.getState().loginAsRole('administrator')
    render(<LibraryPage />)

    const target = schoolBooks[0]
    const card = screen.getByText(target.title).closest('[class*="overflow-hidden"]') as HTMLElement
    expect(card).toBeTruthy()

    await user.click(within(card).getByRole('button'))
    expect(await screen.findByText(/remove this book\?/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /^delete$/i }))

    expect(screen.queryByText(target.title)).not.toBeInTheDocument()
  })

  it('adds a new book to the catalog scoped to the current school', async () => {
    const user = userEvent.setup()
    useAuthStore.getState().loginAsRole('administrator')
    render(<LibraryPage />)

    await user.click(screen.getByRole('button', { name: /add book/i }))
    const dialog = screen.getByRole('dialog')

    await user.type(screen.getByLabelText(/^title$/i), 'Automated Testing 101')
    await user.type(screen.getByLabelText(/^author$/i), 'QA Bot')
    await user.click(screen.getByRole('combobox', { name: /category/i }))
    await user.click(await screen.findByRole('option', { name: /^science$/i }))
    const copiesInput = screen.getByLabelText(/total copies/i)
    await user.clear(copiesInput)
    await user.type(copiesInput, '5')
    await user.click(within(dialog).getByRole('button', { name: /^add book$/i }))

    expect(await screen.findByText('Automated Testing 101')).toBeInTheDocument()
    expect(screen.getByText('QA Bot')).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('removes an issue record after confirming the delete dialog', async () => {
    const user = userEvent.setup()
    useAuthStore.getState().loginAsRole('administrator')
    render(<LibraryPage />)

    await user.click(screen.getByRole('tab', { name: /issued books/i }))

    const statusPattern = /^(issued|returned|overdue)$/i
    const before = screen.getAllByText(statusPattern).length
    expect(before).toBe(schoolIssues.length)

    const firstBadge = screen.getAllByText(statusPattern)[0]
    const row = firstBadge.closest('[class*="py-3"]') as HTMLElement
    expect(row).toBeTruthy()

    await user.click(within(row).getByRole('button'))
    expect(await screen.findByText(/remove this issue record\?/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /^delete$/i }))

    expect(screen.getAllByText(statusPattern).length).toBe(before - 1)
  })
})
