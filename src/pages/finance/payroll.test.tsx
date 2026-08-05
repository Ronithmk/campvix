import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PayrollPage from './payroll'
import { useAuthStore } from '@/store/auth-store'
import { usePermissionsStore } from '@/store/permissions-store'
import { schools } from '@/mock/schools'
import { payrollRecords } from '@/mock/payroll'
import { formatCurrency } from '@/lib/utils'

beforeEach(() => {
  localStorage.clear()
  usePermissionsStore.getState().resetToDefaults()
  useAuthStore.getState().logout()
})

const school = schools[0]
const schoolPayroll = payrollRecords.filter((p) => p.schoolId === school.id)
const totalNet = schoolPayroll.reduce((sum, p) => sum + p.netPay, 0)
const paid = schoolPayroll.filter((p) => p.status === 'paid').length
const pending = schoolPayroll.filter((p) => p.status !== 'paid').length
const pendingOnly = schoolPayroll.filter((p) => p.status === 'pending').length

// The Employee cell renders an Avatar first (whose AvatarFallback is itself a
// <span> of initials), so scope inside the flex-col wrapper to skip it and
// land on the name/employeeId spans specifically.
function employeeNameOf(row: HTMLElement) {
  return row.querySelectorAll('td:first-child [class*="flex-col"] span')[0]?.textContent ?? undefined
}

function employeeIdOf(row: HTMLElement) {
  return row.querySelectorAll('td:first-child [class*="flex-col"] span')[1]?.textContent ?? undefined
}

function statValue(label: string) {
  return screen.getByText(label, { selector: 'p' }).nextElementSibling?.textContent
}

describe('PayrollPage', () => {
  it('renders for administrator with stat cards matching the underlying mock data', () => {
    useAuthStore.getState().loginAsRole('administrator')
    render(<PayrollPage />)

    expect(screen.getByRole('heading', { name: 'Payroll' })).toBeInTheDocument()
    expect(statValue('Total Payout')).toBe(formatCurrency(totalNet))
    expect(statValue('Paid')).toBe(String(paid))
    expect(statValue('Pending / Processing')).toBe(String(pending))
  })

  it('filters rows by status using the status select', async () => {
    expect(pending).toBeGreaterThan(0)
    const user = userEvent.setup()
    useAuthStore.getState().loginAsRole('administrator')
    render(<PayrollPage />)

    await user.click(screen.getAllByRole('combobox')[0])
    await user.click(await screen.findByRole('option', { name: /^pending$/i }))

    const rows = screen.getAllByRole('row').slice(1)
    const expectedPending = schoolPayroll.filter((p) => p.status === 'pending').length
    expect(rows.length).toBe(Math.min(expectedPending, 10))
  })

  it('actually filters rows via the search box', async () => {
    const user = userEvent.setup()
    useAuthStore.getState().loginAsRole('administrator')
    render(<PayrollPage />)

    const rowsBefore = screen.getAllByRole('row').slice(1)
    const first = employeeNameOf(rowsBefore[0])!
    const second = employeeNameOf(rowsBefore[1])!
    expect(first).not.toBe(second)

    await user.type(screen.getByPlaceholderText(/search employees/i), first)

    expect(screen.getByText(first)).toBeInTheDocument()
    expect(screen.queryByText(second)).not.toBeInTheDocument()
  })

  it('also filters by employee ID, matching the search box placeholder', async () => {
    const user = userEvent.setup()
    useAuthStore.getState().loginAsRole('administrator')
    render(<PayrollPage />)

    const rowsBefore = screen.getAllByRole('row').slice(1)
    const targetId = employeeIdOf(rowsBefore[0])!
    const otherName = employeeNameOf(rowsBefore[1])!

    await user.type(screen.getByPlaceholderText(/search employees/i), targetId)

    expect(screen.getByText(targetId)).toBeInTheDocument()
    expect(screen.queryByText(otherName)).not.toBeInTheDocument()
  })

  it('transitions pending records to processing when Run Payroll is clicked', async () => {
    expect(pendingOnly).toBeGreaterThan(0)
    const user = userEvent.setup()
    useAuthStore.getState().loginAsRole('administrator')
    render(<PayrollPage />)

    await user.click(screen.getAllByRole('combobox')[0])
    await user.click(await screen.findByRole('option', { name: /^pending$/i }))
    expect(screen.getAllByRole('row').length - 1).toBe(Math.min(pendingOnly, 10))

    await user.click(screen.getAllByRole('combobox')[0])
    await user.click(await screen.findByRole('option', { name: /^all status$/i }))

    await user.click(screen.getByRole('button', { name: /run payroll/i }))

    await user.click(screen.getAllByRole('combobox')[0])
    await user.click(await screen.findByRole('option', { name: /^pending$/i }))
    expect(await screen.findByText(/no results found/i)).toBeInTheDocument()
  })

  it('disables Run Payroll once there are no pending records left', async () => {
    expect(pendingOnly).toBeGreaterThan(0)
    const user = userEvent.setup()
    useAuthStore.getState().loginAsRole('administrator')
    render(<PayrollPage />)

    expect(screen.getByRole('button', { name: /run payroll/i })).not.toBeDisabled()
    await user.click(screen.getByRole('button', { name: /run payroll/i }))
    expect(screen.getByRole('button', { name: /run payroll/i })).toBeDisabled()
  })

  it('removes a payroll record through the row action + confirm dialog', async () => {
    const user = userEvent.setup()
    useAuthStore.getState().loginAsRole('administrator')
    render(<PayrollPage />)

    const targetRow = screen.getAllByRole('row')[1]
    const employeeId = employeeIdOf(targetRow)!

    await user.click(within(targetRow).getByRole('button'))
    await user.click(await screen.findByRole('menuitem', { name: /remove record/i }))

    expect(await screen.findByText(/remove this payroll record\?/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /^delete$/i }))

    expect(screen.queryByText(employeeId)).not.toBeInTheDocument()
  })
})
