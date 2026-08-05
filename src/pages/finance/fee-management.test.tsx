import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import FeeManagementPage from './fee-management'
import { useAuthStore } from '@/store/auth-store'
import { usePermissionsStore } from '@/store/permissions-store'
import { schools } from '@/mock/schools'
import { feeRecords } from '@/mock/fees'
import { formatCurrency } from '@/lib/utils'

// This file also exercises src/features/finance/columns.tsx (getFeeColumns),
// which FeeManagementPage renders via DataTable — column headers and the
// delete (void) row action are covered by the tests below rather than in an
// isolated file, since the factory has no behavior independent of the page.

beforeEach(() => {
  localStorage.clear()
  usePermissionsStore.getState().resetToDefaults()
  useAuthStore.getState().logout()
})

const school = schools[0]
const schoolFees = feeRecords.filter((f) => f.schoolId === school.id)
const totalAmount = schoolFees.reduce((sum, f) => sum + f.amount, 0)
const collected = schoolFees.reduce((sum, f) => sum + f.paidAmount, 0)
const pendingAmount = schoolFees.filter((f) => f.status === 'pending' || f.status === 'partial').reduce((sum, f) => sum + (f.amount - f.paidAmount), 0)
const overdueCount = schoolFees.filter((f) => f.status === 'overdue').length

function invoiceNoOf(row: HTMLElement) {
  return row.querySelectorAll('td:first-child span')[0]?.textContent ?? undefined
}

function studentNameOf(row: HTMLElement) {
  return row.querySelectorAll('td:first-child span')[1]?.textContent ?? undefined
}

function statValue(label: string) {
  return screen.getByText(label, { selector: 'p' }).nextElementSibling?.textContent
}

function renderPage() {
  return render(
    <MemoryRouter>
      <FeeManagementPage />
    </MemoryRouter>,
  )
}

describe('FeeManagementPage', () => {
  it('renders for administrator with stat cards matching the underlying mock data', () => {
    useAuthStore.getState().loginAsRole('administrator')
    renderPage()

    expect(screen.getByRole('heading', { name: 'Fee Management' })).toBeInTheDocument()
    expect(statValue('Total Billed')).toBe(formatCurrency(totalAmount))
    expect(statValue('Collected')).toBe(formatCurrency(collected))
    expect(statValue('Outstanding')).toBe(formatCurrency(pendingAmount))
    expect(statValue('Overdue Invoices')).toBe(String(overdueCount))
  })

  it('links Create Invoice to the real invoices page instead of a stub toast', () => {
    useAuthStore.getState().loginAsRole('administrator')
    renderPage()

    const link = screen.getByRole('link', { name: /create invoice/i })
    expect(link).toHaveAttribute('href', '/app/finance/invoices')
  })

  it('renders the fee columns from getFeeColumns via DataTable', () => {
    useAuthStore.getState().loginAsRole('administrator')
    renderPage()

    expect(screen.getByRole('columnheader', { name: 'Invoice' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Category' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Term' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Amount' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Due Date' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Status' })).toBeInTheDocument()
  })

  it('filters rows by status using the status select', async () => {
    expect(overdueCount).toBeGreaterThan(0)
    const user = userEvent.setup()
    useAuthStore.getState().loginAsRole('administrator')
    renderPage()

    await user.click(screen.getAllByRole('combobox')[0])
    await user.click(await screen.findByRole('option', { name: /^overdue$/i }))

    const rows = screen.getAllByRole('row').slice(1)
    expect(rows.length).toBe(Math.min(overdueCount, 10))
    for (const row of rows) {
      expect(within(row).getByText(/overdue/i)).toBeInTheDocument()
    }
  })

  it('actually filters rows via the search box (not just cosmetic)', async () => {
    const user = userEvent.setup()
    useAuthStore.getState().loginAsRole('administrator')
    renderPage()

    const rowsBefore = screen.getAllByRole('row').slice(1)
    const first = invoiceNoOf(rowsBefore[0])!
    const second = invoiceNoOf(rowsBefore[1])!
    expect(first).not.toBe(second)

    await user.type(screen.getByPlaceholderText(/search by invoice number or student/i), first)

    expect(screen.getByText(first)).toBeInTheDocument()
    expect(screen.queryByText(second)).not.toBeInTheDocument()
  })

  it('also filters by student name, matching the search box placeholder', async () => {
    const user = userEvent.setup()
    useAuthStore.getState().loginAsRole('administrator')
    renderPage()

    const rowsBefore = screen.getAllByRole('row').slice(1)
    const targetStudent = studentNameOf(rowsBefore[0])!
    const otherInvoice = invoiceNoOf(rowsBefore[1])!

    await user.type(screen.getByPlaceholderText(/search by invoice number or student/i), targetStudent)

    expect(screen.getByText(targetStudent)).toBeInTheDocument()
    expect(screen.queryByText(otherInvoice)).not.toBeInTheDocument()
  })

  it('voids (deletes) an invoice through the row action + confirm dialog, and removes it from the table', async () => {
    const user = userEvent.setup()
    useAuthStore.getState().loginAsRole('administrator')
    renderPage()

    const targetRow = screen.getAllByRole('row')[1]
    const invoiceNo = invoiceNoOf(targetRow)!

    await user.click(within(targetRow).getByRole('button'))
    await user.click(await screen.findByRole('menuitem', { name: /void invoice/i }))

    expect(await screen.findByText(/void this invoice\?/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /^void invoice$/i }))

    expect(screen.queryByText(invoiceNo)).not.toBeInTheDocument()
  })
})
