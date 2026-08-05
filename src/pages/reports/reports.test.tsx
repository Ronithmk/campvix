import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ReportsPage from './reports'
import { useAuthStore } from '@/store/auth-store'
import { usePermissionsStore } from '@/store/permissions-store'

beforeEach(() => {
  localStorage.clear()
  usePermissionsStore.getState().resetToDefaults()
  useAuthStore.getState().logout()
  useAuthStore.getState().loginAsRole('administrator')
})

describe('ReportsPage', () => {
  it('renders for administrator with all report type cards and recent reports', () => {
    render(<ReportsPage />)
    expect(screen.getByRole('heading', { name: /^reports$/i })).toBeInTheDocument()
    expect(screen.getByText('Attendance Report')).toBeInTheDocument()
    expect(screen.getByText('Fee Collection Report')).toBeInTheDocument()
    expect(screen.getByText('Academic Performance Report')).toBeInTheDocument()
    expect(screen.getByText('Teacher Workload Report')).toBeInTheDocument()
    expect(screen.getByText('Student Growth Report')).toBeInTheDocument()

    expect(screen.getByText('Attendance Summary - July 2026')).toBeInTheDocument()
    expect(screen.getByText('Fee Collection - Term 2')).toBeInTheDocument()
    expect(screen.getByText('Academic Performance - Grade 8')).toBeInTheDocument()
    expect(screen.getByText('Teacher Workload Q2')).toBeInTheDocument()
  })

  it('deletes a recent report when the delete confirmation is accepted', async () => {
    const user = userEvent.setup()
    render(<ReportsPage />)
    const targetName = 'Fee Collection - Term 2'

    const row = screen.getByText(targetName).closest('.flex.items-center.gap-3') as HTMLElement
    const deleteButton = within(row).getAllByRole('button')[1]
    await user.click(deleteButton)

    const dialog = await screen.findByRole('alertdialog')
    await user.click(within(dialog).getByRole('button', { name: /^delete$/i }))

    expect(screen.queryByText(targetName)).not.toBeInTheDocument()
  })

  it('keeps the report row when delete is cancelled', async () => {
    const user = userEvent.setup()
    render(<ReportsPage />)
    const targetName = 'Teacher Workload Q2'

    const row = screen.getByText(targetName).closest('.flex.items-center.gap-3') as HTMLElement
    const deleteButton = within(row).getAllByRole('button')[1]
    await user.click(deleteButton)

    const dialog = await screen.findByRole('alertdialog')
    await user.click(within(dialog).getByRole('button', { name: /cancel/i }))

    expect(screen.getByText(targetName)).toBeInTheDocument()
  })
})
