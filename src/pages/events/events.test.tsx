import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EventsPage from './events'
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

describe('EventsPage', () => {
  it('renders for administrator with stat cards matching mock data for the active school', () => {
    render(<EventsPage />)
    const schoolEvents = eventsFor(schools[0].id)
    const upcoming = schoolEvents.filter((e) => e.type === 'event' || e.type === 'sports')

    expect(screen.getByRole('heading', { name: /^events$/i })).toBeInTheDocument()
    expect(screen.getByText('Total Events')).toBeInTheDocument()
    expect(screen.getByText(String(schoolEvents.length))).toBeInTheDocument()
    expect(screen.getByText('This Month')).toBeInTheDocument()
    expect(screen.getByText(String(upcoming.length))).toBeInTheDocument()

    for (const e of schoolEvents) {
      expect(screen.getByText(e.title)).toBeInTheDocument()
    }
  })

  it('deletes an event when the delete confirmation is accepted and updates the Total Events stat', async () => {
    const user = userEvent.setup()
    render(<EventsPage />)
    const schoolEvents = eventsFor(schools[0].id)
    const target = schoolEvents[0]

    const titleEl = screen.getByText(target.title)
    const card = titleEl.closest('.overflow-hidden') as HTMLElement
    await user.click(within(card).getByRole('button', { name: '' }))

    const dialog = await screen.findByRole('alertdialog')
    await user.click(within(dialog).getByRole('button', { name: /^delete$/i }))

    expect(screen.queryByText(target.title)).not.toBeInTheDocument()
    expect(screen.getByText(String(schoolEvents.length - 1))).toBeInTheDocument()
  })

  it('creates a new event scoped to the current school and adds it to the list', async () => {
    const user = userEvent.setup()
    render(<EventsPage />)
    const before = eventsFor(schools[0].id).length

    await user.click(screen.getByRole('button', { name: /create event/i }))
    await user.type(screen.getByLabelText(/event title/i), 'QA Automation Fest')
    await user.click(screen.getByRole('combobox', { name: /type/i }))
    await user.click(await screen.findByRole('option', { name: /^sports$/i }))
    await user.type(screen.getByLabelText(/location/i), 'Sports Ground')
    await user.click(screen.getByRole('button', { name: /save event/i }))

    expect(await screen.findByText('QA Automation Fest')).toBeInTheDocument()
    expect(screen.getByText(String(before + 1))).toBeInTheDocument()
  })

  it('does not leak one school\'s events into another school\'s view after switching schools', () => {
    // All schools share the same 8 event titles (only ids/dates differ), so we
    // verify isolation via row count rather than title text: a broken schoolId
    // filter would append instead of replace, doubling the rendered rows.
    const { rerender } = render(<EventsPage />)
    expect(screen.getAllByRole('button', { name: '' })).toHaveLength(eventsFor(schools[0].id).length)

    useAuthStore.setState({ schoolId: schools[1].id })
    rerender(<EventsPage />)

    expect(screen.getAllByRole('button', { name: '' })).toHaveLength(eventsFor(schools[1].id).length)
    expect(screen.getByText(String(eventsFor(schools[1].id).length))).toBeInTheDocument()
  })
})
