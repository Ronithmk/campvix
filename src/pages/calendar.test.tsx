import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CalendarPage from './calendar'
import { useAuthStore } from '@/store/auth-store'
import { usePermissionsStore } from '@/store/permissions-store'
import { schools } from '@/mock/schools'
import { calendarEvents } from '@/mock/notifications'

beforeEach(() => {
  localStorage.clear()
  usePermissionsStore.getState().resetToDefaults()
  useAuthStore.getState().logout()
  useAuthStore.getState().loginAsRole('administrator')
  useAuthStore.setState({ schoolId: schools[0].id })
})

function eventsFor(schoolId: string) {
  return calendarEvents.filter((e) => e.schoolId === schoolId)
}

describe('CalendarPage', () => {
  it('renders for administrator and lists upcoming events scoped to the active school', () => {
    render(<CalendarPage />)
    expect(screen.getByRole('heading', { name: /calendar/i })).toBeInTheDocument()

    const schoolEvents = eventsFor(schools[0].id)
    for (const e of schoolEvents) {
      expect(screen.getByText(e.title)).toBeInTheDocument()
    }
  })

  it('deletes an event when the delete confirmation is accepted', async () => {
    const user = userEvent.setup()
    render(<CalendarPage />)

    const schoolEvents = eventsFor(schools[0].id)
    const target = schoolEvents[0]
    expect(screen.getByText(target.title)).toBeInTheDocument()

    const row = screen.getByText(target.title).closest('div.flex.items-start.gap-3') as HTMLElement
    const deleteTrigger = within(row).getByRole('button')
    await user.click(deleteTrigger)

    const dialog = await screen.findByRole('alertdialog')
    await user.click(within(dialog).getByRole('button', { name: /^delete$/i }))

    expect(screen.queryByText(target.title)).not.toBeInTheDocument()
  })

  it('does not leak one school\'s events into another school\'s view after switching schools', () => {
    // Every school shares the same 8 event titles (only ids/dates/schoolId differ),
    // so isolation is verified by row *count* rather than title text: if the
    // schoolId filter ever no-ops, switching schools would append instead of
    // replace and the row count would double up.
    useAuthStore.setState({ schoolId: schools[0].id })
    const { rerender } = render(<CalendarPage />)

    const deleteButtonsA = screen.getAllByRole('button', { name: '' })
    expect(deleteButtonsA).toHaveLength(eventsFor(schools[0].id).length)

    useAuthStore.setState({ schoolId: schools[1].id })
    rerender(<CalendarPage />)

    const deleteButtonsB = screen.getAllByRole('button', { name: '' })
    expect(deleteButtonsB).toHaveLength(eventsFor(schools[1].id).length)
  })
})
