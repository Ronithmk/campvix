import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AnnouncementsPage from './announcements'
import { useAuthStore } from '@/store/auth-store'
import { usePermissionsStore } from '@/store/permissions-store'
import { schools } from '@/mock/schools'
import { announcements } from '@/mock/communication'
import { formatNumber } from '@/lib/utils'

beforeEach(() => {
  localStorage.clear()
  usePermissionsStore.getState().resetToDefaults()
  useAuthStore.getState().logout()
  useAuthStore.getState().loginAsRole('administrator')
  useAuthStore.setState({ schoolId: schools[0].id })
})

function announcementsFor(schoolId: string) {
  return announcements.filter((a) => a.schoolId === schoolId)
}

describe('AnnouncementsPage', () => {
  it('renders for administrator with stat cards matching mock data for the active school', () => {
    render(<AnnouncementsPage />)
    const schoolAnnouncements = announcementsFor(schools[0].id)
    const pinned = schoolAnnouncements.filter((a) => a.pinned).length

    expect(screen.getByRole('heading', { name: /announcements/i })).toBeInTheDocument()
    expect(screen.getByText('Total Announcements')).toBeInTheDocument()
    expect(screen.getByText(String(schoolAnnouncements.length))).toBeInTheDocument()
    expect(screen.getByText('Pinned')).toBeInTheDocument()
    expect(screen.getByText(String(pinned))).toBeInTheDocument()
    expect(screen.getByText(formatNumber(schools[0].studentCount))).toBeInTheDocument()

    for (const a of schoolAnnouncements) {
      expect(screen.getByText(a.title)).toBeInTheDocument()
    }
  })

  it('filters the list down to a single audience via the audience select', async () => {
    const user = userEvent.setup()
    render(<AnnouncementsPage />)
    const schoolAnnouncements = announcementsFor(schools[0].id)
    const teacherOnly = schoolAnnouncements.filter((a) => a.audience === 'teachers')
    const nonTeacher = schoolAnnouncements.filter((a) => a.audience !== 'teachers')
    expect(teacherOnly.length).toBeGreaterThan(0)
    expect(nonTeacher.length).toBeGreaterThan(0)

    await user.click(screen.getByRole('combobox'))
    await user.click(await screen.findByRole('option', { name: /^teachers$/i }))

    for (const a of teacherOnly) {
      expect(screen.getByText(a.title)).toBeInTheDocument()
    }
    for (const a of nonTeacher) {
      expect(screen.queryByText(a.title)).not.toBeInTheDocument()
    }
  })

  it('deletes an announcement when the delete confirmation is accepted and updates the Total Announcements stat', async () => {
    const user = userEvent.setup()
    render(<AnnouncementsPage />)
    const schoolAnnouncements = announcementsFor(schools[0].id)
    const target = schoolAnnouncements[0]

    const titleEl = screen.getByText(target.title)
    const card = titleEl.closest('.flex.flex-col.gap-2\\.5') as HTMLElement
    await user.click(within(card).getByRole('button'))

    const dialog = await screen.findByRole('alertdialog')
    await user.click(within(dialog).getByRole('button', { name: /^delete$/i }))

    expect(screen.queryByText(target.title)).not.toBeInTheDocument()
    expect(screen.getByText(String(schoolAnnouncements.length - 1))).toBeInTheDocument()
  })
})
