import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import InvoicesPage from './invoices'
import { useAuthStore } from '@/store/auth-store'
import { usePermissionsStore } from '@/store/permissions-store'
import { schools } from '@/mock/schools'
import { feeRecords } from '@/mock/fees'
import { formatCurrency } from '@/lib/utils'

beforeEach(() => {
  localStorage.clear()
  usePermissionsStore.getState().resetToDefaults()
  useAuthStore.getState().logout()
})

const school = schools[0]
const schoolInvoices = feeRecords.filter((i) => i.schoolId === school.id)
const total = schoolInvoices.reduce((sum, i) => sum + i.amount, 0)
const paid = schoolInvoices.filter((i) => i.status === 'paid').length
const unpaid = schoolInvoices.filter((i) => i.status !== 'paid').length

function invoiceNoOf(row: HTMLElement) {
  return row.querySelector('td:first-child span')?.textContent ?? undefined
}

function statValue(label: string) {
  return screen.getByText(label, { selector: 'p' }).nextElementSibling?.textContent
}

describe('InvoicesPage', () => {
  it('renders for administrator with stat cards matching the underlying mock data', () => {
    useAuthStore.getState().loginAsRole('administrator')
    render(<InvoicesPage />)

    expect(screen.getByRole('heading', { name: 'Invoices' })).toBeInTheDocument()
    expect(statValue('Total Invoiced')).toBe(formatCurrency(total))
    expect(statValue('Paid Invoices')).toBe(String(paid))
    expect(statValue('Unpaid Invoices')).toBe(String(unpaid))
  })

  it('creates a new invoice via the zod-validated form and adds it to the top of the table', async () => {
    const user = userEvent.setup()
    useAuthStore.getState().loginAsRole('administrator')
    render(<InvoicesPage />)

    await user.click(screen.getByRole('button', { name: /create invoice/i }))
    const dialog = screen.getByRole('dialog')

    await user.click(within(dialog).getByRole('combobox', { name: /student/i }))
    const options = await screen.findAllByRole('option')
    await user.click(options[0])

    await user.click(within(dialog).getByRole('button', { name: /^create invoice$/i }))

    const expectedInvoiceNo = `INV-${9000 + feeRecords.length}`
    expect(await screen.findByText(expectedInvoiceNo)).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    const firstRow = screen.getAllByRole('row')[1]
    expect(invoiceNoOf(firstRow)).toBe(expectedInvoiceNo)
    expect(within(firstRow).getByText(formatCurrency(15000))).toBeInTheDocument()
  }, 15000)

  it('rejects submission via zod validation when no student is selected', async () => {
    const user = userEvent.setup()
    useAuthStore.getState().loginAsRole('administrator')
    render(<InvoicesPage />)

    await user.click(screen.getByRole('button', { name: /create invoice/i }))
    const dialog = screen.getByRole('dialog')

    await user.click(within(dialog).getByRole('button', { name: /^create invoice$/i }))

    expect(await screen.findByText(/select a student/i)).toBeInTheDocument()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.queryByText(`INV-${9000 + feeRecords.length}`)).not.toBeInTheDocument()
  })

  it('deletes an invoice through the row action + confirm dialog', async () => {
    const user = userEvent.setup()
    useAuthStore.getState().loginAsRole('administrator')
    render(<InvoicesPage />)

    const targetRow = screen.getAllByRole('row')[1]
    const invoiceNo = invoiceNoOf(targetRow)!

    await user.click(within(targetRow).getByRole('button'))
    await user.click(await screen.findByRole('menuitem', { name: /delete invoice/i }))

    expect(await screen.findByText(/delete this invoice\?/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /^delete$/i }))

    expect(screen.queryByText(invoiceNo)).not.toBeInTheDocument()
  })
})
