import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PaymentsPage from './payments'
import { useAuthStore } from '@/store/auth-store'
import { usePermissionsStore } from '@/store/permissions-store'
import { schools } from '@/mock/schools'
import { payments } from '@/mock/fees'
import { formatCurrency } from '@/lib/utils'

beforeEach(() => {
  localStorage.clear()
  usePermissionsStore.getState().resetToDefaults()
  useAuthStore.getState().logout()
})

const school = schools[0]
const schoolPayments = payments.filter((p) => p.schoolId === school.id)
const total = schoolPayments.reduce((sum, p) => sum + p.amount, 0)
const avg = schoolPayments.length ? Math.round(total / schoolPayments.length) : 0
const upiShare = schoolPayments.length ? Math.round((schoolPayments.filter((p) => p.method === 'upi').length / schoolPayments.length) * 100) : 0

function referenceOf(row: HTMLElement) {
  return row.querySelector('td:first-child span')?.textContent ?? undefined
}

function statValue(label: string) {
  return screen.getByText(label, { selector: 'p' }).nextElementSibling?.textContent
}

describe('PaymentsPage', () => {
  it('renders for administrator with stat cards matching the underlying mock data', () => {
    useAuthStore.getState().loginAsRole('administrator')
    render(<PaymentsPage />)

    expect(screen.getByRole('heading', { name: 'Payments' })).toBeInTheDocument()
    expect(statValue('Total Collected')).toBe(formatCurrency(total))
    expect(statValue('Transactions')).toBe(String(schoolPayments.length))
    expect(statValue('Avg. Payment')).toBe(formatCurrency(avg))
    expect(statValue('UPI Share')).toBe(`${upiShare}%`)
  })

  it('actually filters rows via the search box', async () => {
    const user = userEvent.setup()
    useAuthStore.getState().loginAsRole('administrator')
    render(<PaymentsPage />)

    const rowsBefore = screen.getAllByRole('row').slice(1)
    const first = referenceOf(rowsBefore[0])!
    const second = referenceOf(rowsBefore[1])!
    expect(first).not.toBe(second)

    await user.type(screen.getByPlaceholderText(/search by reference or student/i), first)

    expect(screen.getByText(first)).toBeInTheDocument()
    expect(screen.queryByText(second)).not.toBeInTheDocument()
  })

  it('deletes a payment record through the row action + confirm dialog', async () => {
    const user = userEvent.setup()
    useAuthStore.getState().loginAsRole('administrator')
    render(<PaymentsPage />)

    const targetRow = screen.getAllByRole('row')[1]
    const reference = referenceOf(targetRow)!

    await user.click(within(targetRow).getByRole('button'))
    await user.click(await screen.findByRole('menuitem', { name: /delete record/i }))

    expect(await screen.findByText(/delete this payment record\?/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /^delete$/i }))

    expect(screen.queryByText(reference)).not.toBeInTheDocument()
  })
})
