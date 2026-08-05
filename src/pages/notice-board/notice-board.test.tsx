import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NoticeBoardPage from './notice-board'
import { useAuthStore } from '@/store/auth-store'
import { usePermissionsStore } from '@/store/permissions-store'
import { schools } from '@/mock/schools'
import { noticeBoardPosts } from '@/mock/communication'

beforeEach(() => {
  localStorage.clear()
  usePermissionsStore.getState().resetToDefaults()
  useAuthStore.getState().logout()
  useAuthStore.getState().loginAsRole('administrator')
  useAuthStore.setState({ schoolId: schools[0].id })
})

function noticesFor(schoolId: string) {
  return noticeBoardPosts.filter((n) => n.schoolId === schoolId)
}

describe('NoticeBoardPage', () => {
  it('renders for administrator, listing notices scoped to the active school', () => {
    render(<NoticeBoardPage />)
    const schoolNotices = noticesFor(schools[0].id)

    expect(screen.getByRole('heading', { name: /notice board/i })).toBeInTheDocument()
    expect(screen.getByText(new RegExp(schools[0].name))).toBeInTheDocument()
    for (const n of schoolNotices) {
      expect(screen.getByText(n.title)).toBeInTheDocument()
    }
  })

  it('deletes a notice when the delete confirmation is accepted', async () => {
    const user = userEvent.setup()
    render(<NoticeBoardPage />)
    const target = noticesFor(schools[0].id)[0]

    const titleEl = screen.getByText(target.title)
    const card = titleEl.closest('.flex.flex-col.gap-2\\.5') as HTMLElement
    await user.click(within(card).getByRole('button'))

    const dialog = await screen.findByRole('alertdialog')
    await user.click(within(dialog).getByRole('button', { name: /^delete$/i }))

    expect(screen.queryByText(target.title)).not.toBeInTheDocument()
  })

  it('keeps the notice when delete is cancelled', async () => {
    const user = userEvent.setup()
    render(<NoticeBoardPage />)
    const target = noticesFor(schools[0].id)[0]

    const titleEl = screen.getByText(target.title)
    const card = titleEl.closest('.flex.flex-col.gap-2\\.5') as HTMLElement
    await user.click(within(card).getByRole('button'))

    const dialog = await screen.findByRole('alertdialog')
    await user.click(within(dialog).getByRole('button', { name: /cancel/i }))

    expect(screen.getByText(target.title)).toBeInTheDocument()
  })
})
