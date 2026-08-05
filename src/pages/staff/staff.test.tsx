import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import StaffPage from './staff'
import { useAuthStore } from '@/store/auth-store'
import { usePermissionsStore } from '@/store/permissions-store'
import { staff as mockStaff } from '@/mock/staff'
import { formatNumber } from '@/lib/utils'

beforeEach(() => {
  localStorage.clear()
  usePermissionsStore.getState().resetToDefaults()
  useAuthStore.getState().logout()
  useAuthStore.getState().loginAsRole('administrator')
})

const schoolId = () => useAuthStore.getState().schoolId!

describe('StaffPage — rendering and stats', () => {
  it('renders for administrator', () => {
    render(<StaffPage />)
    expect(screen.getByRole('heading', { name: /staff/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add staff/i })).toBeInTheDocument()
  })

  it('shows stat cards matching the underlying mock data', () => {
    render(<StaffPage />)
    const schoolStaff = mockStaff.filter((s) => s.schoolId === schoolId())
    const active = schoolStaff.filter((s) => s.status === 'active').length
    const drivers = schoolStaff.filter((s) => s.role === 'driver').length
    const librarians = schoolStaff.filter((s) => s.role === 'librarian').length

    expect(screen.getByText('Total Staff', { selector: 'p.text-muted-foreground' }).nextElementSibling).toHaveTextContent(formatNumber(schoolStaff.length))
    expect(screen.getByText('Active', { selector: 'p.text-muted-foreground' }).nextElementSibling).toHaveTextContent(formatNumber(active))
    expect(screen.getByText('Drivers', { selector: 'p.text-muted-foreground' }).nextElementSibling).toHaveTextContent(formatNumber(drivers))
    expect(screen.getByText('Librarians', { selector: 'p.text-muted-foreground' }).nextElementSibling).toHaveTextContent(formatNumber(librarians))
  })
})

describe('StaffPage — filter', () => {
  it('filters rows down by role', async () => {
    const user = userEvent.setup()
    render(<StaffPage />)
    const expectedCount = mockStaff.filter((s) => s.schoolId === schoolId() && s.role === 'driver').length

    await user.click(screen.getAllByRole('combobox')[0])
    await user.click(await screen.findByRole('option', { name: /^driver$/i }))

    expect(await screen.findByText(new RegExp(`showing \\d+ of ${expectedCount} rows`, 'i'))).toBeInTheDocument()
  })
})

describe('StaffPage — Add Staff', () => {
  it('creates a new staff member scoped to the current school and adds it to the list', async () => {
    const user = userEvent.setup()
    render(<StaffPage />)
    const before = mockStaff.filter((s) => s.schoolId === schoolId()).length

    await user.click(screen.getByRole('button', { name: /add staff/i }))
    await user.type(screen.getByLabelText(/full name/i), 'Test Automation Staffer')
    await user.type(screen.getByLabelText(/email/i), 'test.staff@school.edu')
    await user.click(screen.getByRole('combobox', { name: /role/i }))
    await user.click(await screen.findByRole('option', { name: /^librarian$/i }))
    await user.click(screen.getByRole('button', { name: /save staff member/i }))

    expect(await screen.findByText('Test Automation Staffer')).toBeInTheDocument()
    expect(screen.getByText('Total Staff', { selector: 'p.text-muted-foreground' }).nextElementSibling).toHaveTextContent(formatNumber(before + 1))
  })
})

describe('StaffPage — delete flow', () => {
  it('removes the staff row after confirming delete', async () => {
    const user = userEvent.setup()
    render(<StaffPage />)
    const target = mockStaff.find((s) => s.schoolId === schoolId())!

    const nameCell = screen.getByText(target.name)
    const row = nameCell.closest('tr')!
    await user.click(within(row).getByRole('button'))
    await user.click(await screen.findByRole('menuitem', { name: /^remove$/i }))

    const dialog = await screen.findByRole('alertdialog')
    expect(within(dialog).getByText(/remove this staff member\?/i)).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: /^delete$/i }))

    expect(screen.queryByText(target.name)).not.toBeInTheDocument()
  })
})
