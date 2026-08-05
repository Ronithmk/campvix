import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DocumentsPage from './documents'
import { useAuthStore } from '@/store/auth-store'
import { schools } from '@/mock/schools'
import { documents as mockDocuments } from '@/mock/platform'

beforeEach(() => {
  localStorage.clear()
  useAuthStore.getState().logout()
  useAuthStore.getState().loginAsRole('administrator')
  useAuthStore.setState({ schoolId: schools[0].id })
})

function schoolDocs(schoolId: string) {
  return mockDocuments.filter((d) => d.schoolId === schoolId)
}

describe('DocumentsPage', () => {
  it('renders stat cards matching the underlying mock data for the active school', () => {
    render(<DocumentsPage />)
    const docs = schoolDocs(schools[0].id)
    const folders = new Set(docs.map((d) => d.folder))
    const starred = docs.filter((d) => d.starred).length

    expect(screen.getByText('Total Files')).toBeInTheDocument()
    expect(screen.getByText(String(docs.length))).toBeInTheDocument()
    expect(screen.getByText(String(folders.size))).toBeInTheDocument()
    expect(screen.getByText(String(starred))).toBeInTheDocument()
  })

  it('renders a row for every document of the active school', () => {
    render(<DocumentsPage />)
    for (const d of schoolDocs(schools[0].id)) {
      expect(screen.getByText(d.name)).toBeInTheDocument()
    }
  })

  it('filters the rendered documents by folder', async () => {
    const user = userEvent.setup()
    render(<DocumentsPage />)
    const docs = schoolDocs(schools[0].id)
    const folder = docs[0].folder
    const inFolder = docs.filter((d) => d.folder === folder)
    const outOfFolder = docs.filter((d) => d.folder !== folder)

    await user.click(screen.getByRole('combobox'))
    await user.click(await screen.findByRole('option', { name: folder }))

    for (const d of inFolder) expect(screen.getByText(d.name)).toBeInTheDocument()
    for (const d of outOfFolder) {
      if (d.folder === folder) continue
      expect(screen.queryByText(d.name)).not.toBeInTheDocument()
    }
  })

  it('deletes a document from the list after confirming the delete dialog', async () => {
    const user = userEvent.setup()
    render(<DocumentsPage />)
    const target = schoolDocs(schools[0].id)[0]

    const row = screen.getByText(target.name).closest('div')!.parentElement as HTMLElement
    const menuTrigger = within(row).getByRole('button')
    await user.click(menuTrigger)
    await user.click(await screen.findByRole('menuitem', { name: /delete/i }))
    await user.click(await screen.findByRole('button', { name: /^delete$/i }))

    expect(screen.queryByText(target.name)).not.toBeInTheDocument()
  })

  it('re-scopes the document list to the newly active school (multi-tenant isolation)', () => {
    // Document file names come from a fixed template list shared by every school
    // (DOC_DEFS in mock/platform.ts), so the same file name legitimately appears
    // for every school — it's the owner/size/date on each row that's school-specific.
    // We assert on that row fingerprint instead of on name-presence.
    useAuthStore.setState({ schoolId: schools[0].id })
    const { rerender } = render(<DocumentsPage />)
    const schoolADocs = schoolDocs(schools[0].id)
    const targetName = schoolADocs[0].name
    const rowFingerprintBefore = screen.getByText(targetName).closest('div')!.parentElement!.textContent

    useAuthStore.setState({ schoolId: schools[1].id })
    rerender(<DocumentsPage />)

    const schoolBDocs = schoolDocs(schools[1].id)
    expect(schoolBDocs).not.toEqual(schoolADocs)
    const rowFingerprintAfter = screen.getByText(targetName).closest('div')!.parentElement!.textContent
    expect(rowFingerprintAfter).not.toBe(rowFingerprintBefore)
    // Still scoped correctly — same fixed template count per school (12 files each).
    expect(schoolDocs(schools[1].id)).toHaveLength(schoolADocs.length)
  })
})
