import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TimetablePage from './timetable'
import { useAuthStore } from '@/store/auth-store'
import { usePermissionsStore } from '@/store/permissions-store'
import { classes as allClasses } from '@/mock/classes'

beforeEach(() => {
  localStorage.clear()
  usePermissionsStore.getState().resetToDefaults()
  useAuthStore.getState().logout()
  useAuthStore.getState().loginAsRole('administrator')
})

const schoolId = () => useAuthStore.getState().schoolId!

describe('TimetablePage — rendering', () => {
  it('renders for administrator showing the first class room by default', () => {
    render(<TimetablePage />)
    const schoolClasses = allClasses.filter((c) => c.schoolId === schoolId())

    expect(screen.getByRole('heading', { name: /timetable/i })).toBeInTheDocument()
    expect(screen.getByText(new RegExp(`Room ${schoolClasses[0].room}`))).toBeInTheDocument()
  })

  it('shows a Lunch Break slot for every weekday', () => {
    render(<TimetablePage />)
    expect(screen.getAllByText('Lunch Break')).toHaveLength(5)
  })
})

describe('TimetablePage — class switcher', () => {
  it('updates the displayed room when a different class is selected', async () => {
    const user = userEvent.setup()
    render(<TimetablePage />)
    const schoolClasses = allClasses.filter((c) => c.schoolId === schoolId())
    const nextClass = schoolClasses[1]

    await user.click(screen.getByRole('combobox'))
    await user.click(await screen.findByRole('option', { name: nextClass.name }))

    expect(await screen.findByText(new RegExp(`Room ${nextClass.room}`))).toBeInTheDocument()
  })
})

describe('TimetablePage — Print', () => {
  it('opens the browser print dialog instead of just showing a toast', async () => {
    const user = userEvent.setup()
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {})
    render(<TimetablePage />)

    await user.click(screen.getByRole('button', { name: /print/i }))

    expect(printSpy).toHaveBeenCalledTimes(1)
    printSpy.mockRestore()
  })
})

describe('TimetablePage — Auto-generate', () => {
  it('regenerates the displayed schedule with a different arrangement of slots', async () => {
    const user = userEvent.setup()
    render(<TimetablePage />)

    const before = screen.getAllByRole('cell').map((c) => c.textContent)
    await user.click(screen.getByRole('button', { name: /auto-generate/i }))
    const after = screen.getAllByRole('cell').map((c) => c.textContent)

    expect(after).not.toEqual(before)
  })
})
