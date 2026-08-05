import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NotificationsPage from './notifications'
import { useAuthStore } from '@/store/auth-store'
import { usePermissionsStore } from '@/store/permissions-store'
import { schools } from '@/mock/schools'
import { notifications } from '@/mock/notifications'

beforeEach(() => {
  localStorage.clear()
  usePermissionsStore.getState().resetToDefaults()
  useAuthStore.getState().logout()
  useAuthStore.getState().loginAsRole('administrator')
  useAuthStore.setState({ schoolId: schools[0].id })
})

function notifsFor(schoolId: string) {
  return notifications.filter((n) => n.schoolId === schoolId)
}

describe('NotificationsPage', () => {
  it('renders for administrator with tab counts matching mock data for the active school', () => {
    render(<NotificationsPage />)
    const schoolNotifs = notifsFor(schools[0].id)
    const unreadCount = schoolNotifs.filter((n) => !n.read).length

    expect(screen.getByRole('heading', { name: /notifications/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: `All (${schoolNotifs.length})` })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: `Unread (${unreadCount})` })).toBeInTheDocument()
    for (const n of schoolNotifs) {
      expect(screen.getByText(n.title)).toBeInTheDocument()
    }
  })

  it('marks a single notification as read when clicked, updating the unread tab count', async () => {
    const user = userEvent.setup()
    render(<NotificationsPage />)
    const schoolNotifs = notifsFor(schools[0].id)
    const unreadBefore = schoolNotifs.filter((n) => !n.read).length
    const target = schoolNotifs.find((n) => !n.read)!

    const row = screen.getByText(target.title).closest('.cursor-pointer') as HTMLElement
    await user.click(row)

    expect(screen.getByRole('tab', { name: `Unread (${unreadBefore - 1})` })).toBeInTheDocument()
  })

  it('marks all notifications read for the active school without affecting another school', async () => {
    const user = userEvent.setup()
    const { rerender } = render(<NotificationsPage />)

    await user.click(screen.getByRole('button', { name: /mark all read/i }))
    expect(screen.getByRole('tab', { name: 'Unread (0)' })).toBeInTheDocument()

    const schoolBUnread = notifsFor(schools[1].id).filter((n) => !n.read).length
    useAuthStore.setState({ schoolId: schools[1].id })
    rerender(<NotificationsPage />)

    expect(screen.getByRole('tab', { name: `Unread (${schoolBUnread})` })).toBeInTheDocument()
    expect(schoolBUnread).toBeGreaterThan(0)
  })

  it('deletes a notification when the delete confirmation is accepted', async () => {
    const user = userEvent.setup()
    render(<NotificationsPage />)
    const schoolNotifs = notifsFor(schools[0].id)
    const target = schoolNotifs[0]

    const row = screen.getByText(target.title).closest('.cursor-pointer') as HTMLElement
    await user.click(within(row).getByRole('button'))

    const dialog = await screen.findByRole('alertdialog')
    await user.click(within(dialog).getByRole('button', { name: /^delete$/i }))

    expect(screen.queryByText(target.title)).not.toBeInTheDocument()
    expect(screen.getByRole('tab', { name: `All (${schoolNotifs.length - 1})` })).toBeInTheDocument()
  })

  it('shows an empty state on the unread tab once everything is read', async () => {
    const user = userEvent.setup()
    render(<NotificationsPage />)

    await user.click(screen.getByRole('button', { name: /mark all read/i }))
    await user.click(screen.getByRole('tab', { name: /^unread/i }))

    expect(await screen.findByText(/you're all caught up/i)).toBeInTheDocument()
  })

  it('does not render another school\'s notifications after switching the active school', () => {
    const { rerender } = render(<NotificationsPage />)
    const countA = notifsFor(schools[0].id).length

    useAuthStore.setState({ schoolId: schools[1].id })
    rerender(<NotificationsPage />)

    const countB = notifsFor(schools[1].id).length
    expect(screen.getByRole('tab', { name: `All (${countB})` })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: '' })).toHaveLength(countB)
    expect(countA).toBeGreaterThan(0)
  })
})
