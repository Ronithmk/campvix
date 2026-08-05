import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NotificationsPanel } from './notifications-panel'
import { useAuthStore } from '@/store/auth-store'
import { schools } from '@/mock/schools'
import { notifications } from '@/mock/notifications'

beforeEach(() => {
  localStorage.clear()
  useAuthStore.getState().logout()
  useAuthStore.setState({ schoolId: schools[0].id })
})

describe('NotificationsPanel', () => {
  it('shows the unread count for the active school in the trigger popover', async () => {
    const user = userEvent.setup()
    render(<NotificationsPanel />)
    const schoolUnread = notifications.filter((n) => n.schoolId === schools[0].id && !n.read).length

    await user.click(screen.getByRole('button', { name: /notifications/i }))

    expect(await screen.findByText(`${schoolUnread} unread`)).toBeInTheDocument()
  })

  it('lists exactly one row per notification belonging to the active school', async () => {
    const user = userEvent.setup()
    render(<NotificationsPanel />)
    await user.click(screen.getByRole('button', { name: /notifications/i }))

    const schoolItems = notifications.filter((n) => n.schoolId === schools[0].id)
    expect(schoolItems.length).toBeGreaterThan(0)
    for (const item of schoolItems) {
      expect(await screen.findByText(item.title)).toBeInTheDocument()
    }
  })

  it('"Mark all read" only marks the active school\'s notifications as read, leaving other schools untouched', async () => {
    const user = userEvent.setup()
    const { rerender } = render(<NotificationsPanel />)

    await user.click(screen.getByRole('button', { name: /notifications/i }))
    await user.click(screen.getByRole('button', { name: /mark all read/i }))
    expect(await screen.findByText('0 unread')).toBeInTheDocument()

    // Switch active school — the popover is already open, so the unread
    // count for the newly active school should update reactively.
    useAuthStore.setState({ schoolId: schools[1].id })
    rerender(<NotificationsPanel />)

    const otherSchoolUnread = notifications.filter((n) => n.schoolId === schools[1].id && !n.read).length
    expect(otherSchoolUnread).toBeGreaterThan(0)
    expect(await screen.findByText(`${otherSchoolUnread} unread`)).toBeInTheDocument()
  })

  it('switching the active school changes which notifications are counted as unread', async () => {
    const user = userEvent.setup()
    const { rerender } = render(<NotificationsPanel />)
    await user.click(screen.getByRole('button', { name: /notifications/i }))
    const school0Unread = notifications.filter((n) => n.schoolId === schools[0].id && !n.read).length
    expect(await screen.findByText(`${school0Unread} unread`)).toBeInTheDocument()

    useAuthStore.setState({ schoolId: schools[2].id })
    rerender(<NotificationsPanel />)
    const school2Unread = notifications.filter((n) => n.schoolId === schools[2].id && !n.read).length
    expect(await screen.findByText(`${school2Unread} unread`)).toBeInTheDocument()
  })

  it('clicking a single unread notification marks only that one as read', async () => {
    const user = userEvent.setup()
    render(<NotificationsPanel />)
    await user.click(screen.getByRole('button', { name: /notifications/i }))

    const schoolUnread = notifications.filter((n) => n.schoolId === schools[0].id && !n.read).length
    const firstUnreadTitle = notifications.find((n) => n.schoolId === schools[0].id && !n.read)!.title
    await user.click(await screen.findByText(firstUnreadTitle))

    expect(await screen.findByText(`${schoolUnread - 1} unread`)).toBeInTheDocument()
  })
})
