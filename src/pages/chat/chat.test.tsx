import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ChatPage from './chat'
import { useAuthStore } from '@/store/auth-store'
import { usePermissionsStore } from '@/store/permissions-store'
import { chatThreads } from '@/mock/communication'

beforeEach(() => {
  localStorage.clear()
  usePermissionsStore.getState().resetToDefaults()
  useAuthStore.getState().logout()
  useAuthStore.getState().loginAsRole('administrator')
})

describe('ChatPage', () => {
  it('renders for administrator with the first thread selected by default', () => {
    render(<ChatPage />)
    const first = chatThreads[0]

    expect(screen.getByRole('heading', { name: /parent chat/i })).toBeInTheDocument()
    // participant name appears both in the sidebar row and the active conversation header
    expect(screen.getAllByText(first.participantName).length).toBeGreaterThanOrEqual(2)
    expect(screen.getByPlaceholderText(/type a message/i)).toBeInTheDocument()
  })

  it('filters the conversation list by participant name via search', async () => {
    const user = userEvent.setup()
    render(<ChatPage />)
    // chatThreads[0] stays selected (and thus visible in the header) regardless
    // of the sidebar search filter, so pick target/excluded from index 1+ to
    // keep the assertions unambiguous.
    const target = chatThreads[1]
    const excluded = chatThreads[2]

    await user.type(screen.getByPlaceholderText(/search conversations/i), target.participantName)

    expect(screen.getByText(target.participantName)).toBeInTheDocument()
    expect(screen.queryByText(excluded.participantName)).not.toBeInTheDocument()
  })

  it('sends a new message and updates the thread preview', async () => {
    const user = userEvent.setup()
    render(<ChatPage />)

    const input = screen.getByPlaceholderText(/type a message/i)
    await user.type(input, 'Automated QA message')
    await user.click(within(input.parentElement as HTMLElement).getByRole('button'))

    expect(await screen.findAllByText('Automated QA message')).not.toHaveLength(0)
    expect(input).toHaveValue('')
  })

  it('deletes a conversation thread when the delete confirmation is accepted', async () => {
    const user = userEvent.setup()
    render(<ChatPage />)
    const target = chatThreads[1]

    const row = screen.getByText(target.participantName).closest('.group') as HTMLElement
    await user.click(within(row).getByRole('button'))

    const dialog = await screen.findByRole('alertdialog')
    await user.click(within(dialog).getByRole('button', { name: /^delete$/i }))

    expect(screen.queryByText(target.participantName)).not.toBeInTheDocument()
  })
})
