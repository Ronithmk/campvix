import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AlumniPage from './alumni'
import { useAuthStore } from '@/store/auth-store'
import { schools } from '@/mock/schools'
import { alumni as mockAlumni } from '@/mock/platform'

beforeEach(() => {
  localStorage.clear()
  useAuthStore.getState().logout()
  useAuthStore.getState().loginAsRole('administrator')
  useAuthStore.setState({ schoolId: schools[0].id })
})

function schoolAlumni(schoolId: string) {
  return mockAlumni.filter((a) => a.schoolId === schoolId)
}

describe('AlumniPage', () => {
  it('renders stat cards matching the underlying mock data for the active school', () => {
    render(<AlumniPage />)
    const alumni = schoolAlumni(schools[0].id)
    const years = new Set(alumni.map((a) => a.graduationYear))
    const donors = alumni.filter((a) => a.donated).length

    expect(screen.getByText('Total Alumni')).toBeInTheDocument()
    expect(screen.getByText(String(alumni.length))).toBeInTheDocument()
    expect(screen.getByText(String(years.size))).toBeInTheDocument()
    expect(screen.getByText(String(donors))).toBeInTheDocument()
  })

  it('renders a card for every alumnus of the active school', () => {
    render(<AlumniPage />)
    const alumni = schoolAlumni(schools[0].id)
    for (const a of alumni) {
      expect(screen.getByText(a.name)).toBeInTheDocument()
    }
  })

  it('filters the rendered alumni by the search box', async () => {
    const user = userEvent.setup()
    render(<AlumniPage />)
    const alumni = schoolAlumni(schools[0].id)
    const target = alumni[0]
    const others = alumni.filter((a) => a.name !== target.name)

    await user.type(screen.getByPlaceholderText(/search alumni/i), target.name)

    expect(screen.getByText(target.name)).toBeInTheDocument()
    for (const other of others) {
      if (other.name.toLowerCase().includes(target.name.toLowerCase())) continue
      expect(screen.queryByText(other.name)).not.toBeInTheDocument()
    }
  })

  it('filters the rendered alumni by graduation year', async () => {
    const user = userEvent.setup()
    render(<AlumniPage />)
    const alumni = schoolAlumni(schools[0].id)
    const year = alumni[0].graduationYear
    const inYear = alumni.filter((a) => a.graduationYear === year)
    const outOfYear = alumni.filter((a) => a.graduationYear !== year)

    await user.click(screen.getByRole('combobox'))
    await user.click(await screen.findByRole('option', { name: `Class of ${year}` }))

    for (const a of inYear) expect(screen.getByText(a.name)).toBeInTheDocument()
    for (const a of outOfYear) {
      if (a.graduationYear === year) continue
      expect(screen.queryByText(a.name)).not.toBeInTheDocument()
    }
  })

  it('removes an alumnus from the list after confirming delete', async () => {
    const user = userEvent.setup()
    render(<AlumniPage />)
    const target = schoolAlumni(schools[0].id)[0]

    // Alumni cards render in schoolAlumni order, so the first delete (trash) button
    // belongs to the target alumnus's card.
    const deleteButtons = screen.getAllByRole('button').filter((b) => b.querySelector('svg.lucide-trash-2'))
    await user.click(deleteButtons[0])

    await user.click(await screen.findByRole('button', { name: /^delete$/i }))

    expect(screen.queryByText(target.name)).not.toBeInTheDocument()
  })

  it('invites a new alumnus scoped to the current school and adds it to the list', async () => {
    const user = userEvent.setup()
    render(<AlumniPage />)

    await user.click(screen.getByRole('button', { name: /invite alumni/i }))
    const dialog = await screen.findByRole('dialog')
    await user.type(within(dialog).getByLabelText(/full name/i), 'QA Test Alum')
    await user.clear(within(dialog).getByLabelText(/graduation year/i))
    await user.type(within(dialog).getByLabelText(/graduation year/i), '2020')
    await user.type(within(dialog).getByLabelText(/current role/i), 'QA Engineer')
    await user.type(within(dialog).getByLabelText(/company/i), 'Anthropic')
    await user.type(within(dialog).getByLabelText(/email/i), 'qa.alum@example.com')
    await user.click(within(dialog).getByRole('button', { name: /send invitation/i }))

    expect(await screen.findByText('QA Test Alum')).toBeInTheDocument()
  })

  it('does not show alumni from one school when viewing another (multi-tenant isolation)', () => {
    useAuthStore.setState({ schoolId: schools[0].id })
    const { rerender } = render(<AlumniPage />)
    const schoolAAlumni = schoolAlumni(schools[0].id)
    expect(screen.getByText(schoolAAlumni[0].name)).toBeInTheDocument()

    useAuthStore.setState({ schoolId: schools[1].id })
    rerender(<AlumniPage />)

    expect(screen.queryByText(schoolAAlumni[0].name)).not.toBeInTheDocument()
    const schoolBAlumni = schoolAlumni(schools[1].id)
    expect(screen.getByText(schoolBAlumni[0].name)).toBeInTheDocument()
  })
})
