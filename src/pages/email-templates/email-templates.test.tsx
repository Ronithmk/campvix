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

  it('creates a new template scoped to the current school and adds it to the list', async () => {
    const user = userEvent.setup()
    render(<EmailTemplatesPage />)

    await user.click(screen.getByRole('button', { name: /new template/i }))
    const dialog = await screen.findByRole('dialog')
    await user.type(within(dialog).getByLabelText(/template name/i), 'QA Welcome Email')
    await user.type(within(dialog).getByLabelText(/subject line/i), 'Welcome to QA')
    await user.click(within(dialog).getByRole('combobox', { name: /category/i }))
    await user.click(await screen.findByRole('option', { name: 'Admission' }))
    await user.click(within(dialog).getByRole('button', { name: /create template/i }))

    expect(await screen.findByText('QA Welcome Email')).toBeInTheDocument()
  })

  it('re-scopes the template list to the newly active school (multi-tenant isolation)', () => {
    useAuthStore.setState({ schoolId: schools[0].id })
    const { rerender } = render(<EmailTemplatesPage />)
    const schoolATemplates = schoolTemplates(schools[0].id)
    const targetName = schoolATemplates[0].name
    expect(screen.getByText(targetName)).toBeInTheDocument()

    useAuthStore.setState({ schoolId: schools[1].id })
    rerender(<EmailTemplatesPage />)

    // Template names are now school-specific (prefixed with the school's short
    // name), so School A's template name genuinely disappears from School B's view.
    expect(screen.queryByText(targetName)).not.toBeInTheDocument()
    const schoolBTemplates = schoolTemplates(schools[1].id)
    expect(screen.getByText(schoolBTemplates[0].name)).toBeInTheDocument()
    expect(schoolBTemplates).toHaveLength(schoolATemplates.length)
  })
})
