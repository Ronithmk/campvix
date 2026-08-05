import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EmailTemplatesPage from './email-templates'
import { useAuthStore } from '@/store/auth-store'
import { schools } from '@/mock/schools'
import { emailTemplates as mockTemplates } from '@/mock/platform'

beforeEach(() => {
  localStorage.clear()
  useAuthStore.getState().logout()
  useAuthStore.getState().loginAsRole('administrator')
  useAuthStore.setState({ schoolId: schools[0].id })
})

function schoolTemplates(schoolId: string) {
  return mockTemplates.filter((t) => t.schoolId === schoolId)
}

describe('EmailTemplatesPage', () => {
  it('renders stat cards matching the underlying mock data for the active school', () => {
    render(<EmailTemplatesPage />)
    const templates = schoolTemplates(schools[0].id)
    const totalSent = templates.reduce((sum, t) => sum + t.sentCount, 0)

    expect(screen.getByText('Total Templates')).toBeInTheDocument()
    expect(screen.getByText(String(templates.length))).toBeInTheDocument()
    expect(screen.getByText(totalSent.toLocaleString('en-IN'))).toBeInTheDocument()
  })

  it('renders a card for every template of the active school', () => {
    render(<EmailTemplatesPage />)
    for (const t of schoolTemplates(schools[0].id)) {
      expect(screen.getByText(t.name)).toBeInTheDocument()
    }
  })

  it('opens a preview dialog with the template subject and body when a card is clicked', async () => {
    const user = userEvent.setup()
    render(<EmailTemplatesPage />)
    const target = schoolTemplates(schools[0].id)[0]

    await user.click(screen.getByText(target.name))

    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText(target.name)).toBeInTheDocument()
    expect(within(dialog).getByText(target.subject)).toBeInTheDocument()
  })

  it('deletes a template from the list after confirming, without opening the preview dialog', async () => {
    const user = userEvent.setup()
    render(<EmailTemplatesPage />)
    const target = schoolTemplates(schools[0].id)[0]

    const deleteButtons = screen.getAllByRole('button').filter((b) => b.querySelector('svg.lucide-trash-2'))
    await user.click(deleteButtons[0])
    await user.click(await screen.findByRole('button', { name: /^delete$/i }))

    expect(screen.queryByText(target.name)).not.toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('re-scopes the template list to the newly active school (multi-tenant isolation)', () => {
    // Template names come from a fixed template list shared by every school
    // (TEMPLATE_DEFS in mock/platform.ts), so the same name legitimately appears
    // for every school — it's the sent-count/last-edited on each card that's
    // school-specific. We assert on that card fingerprint instead of on name-presence.
    useAuthStore.setState({ schoolId: schools[0].id })
    const { rerender } = render(<EmailTemplatesPage />)
    const schoolATemplates = schoolTemplates(schools[0].id)
    const targetName = schoolATemplates[0].name
    const cardFingerprintBefore = screen.getByText(targetName).closest('div')!.parentElement!.textContent

    useAuthStore.setState({ schoolId: schools[1].id })
    rerender(<EmailTemplatesPage />)

    const schoolBTemplates = schoolTemplates(schools[1].id)
    expect(schoolBTemplates).not.toEqual(schoolATemplates)
    const cardFingerprintAfter = screen.getByText(targetName).closest('div')!.parentElement!.textContent
    expect(cardFingerprintAfter).not.toBe(cardFingerprintBefore)
    expect(schoolTemplates(schools[1].id)).toHaveLength(schoolATemplates.length)
  })
})
