import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AdmissionsPage from './admissions'
import { useAuthStore } from '@/store/auth-store'
import { usePermissionsStore } from '@/store/permissions-store'
import { admissions as mockAdmissions } from '@/mock/admissions'

beforeEach(() => {
  localStorage.clear()
  usePermissionsStore.getState().resetToDefaults()
  useAuthStore.getState().logout()
  useAuthStore.getState().loginAsRole('administrator')
})

const schoolId = () => useAuthStore.getState().schoolId!

function laneCount(label: string) {
  const labelEl = screen.getByText(label, { selector: 'p.text-foreground' })
  const header = labelEl.parentElement!
  return within(header).getByText(/^\d+$/).textContent
}

describe('AdmissionsPage — rendering and stats', () => {
  it('renders for administrator', () => {
    render(<AdmissionsPage />)
    expect(screen.getByRole('heading', { name: /admissions/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /new application/i })).toBeInTheDocument()
  })

  it('shows stat cards matching the underlying mock data', () => {
    render(<AdmissionsPage />)
    const schoolAdmissions = mockAdmissions.filter((a) => a.schoolId === schoolId())
    const enrolled = schoolAdmissions.filter((a) => a.stage === 'enrolled').length
    const inPipeline = schoolAdmissions.filter((a) => a.stage !== 'enrolled' && a.stage !== 'rejected').length
    const conversionRate = Math.round((enrolled / schoolAdmissions.length) * 100)

    expect(screen.getByText('Total Applicants', { selector: 'p.text-muted-foreground' }).nextElementSibling).toHaveTextContent(String(schoolAdmissions.length))
    expect(screen.getByText('In Pipeline', { selector: 'p.text-muted-foreground' }).nextElementSibling).toHaveTextContent(String(inPipeline))
    expect(screen.getByText('Enrolled', { selector: 'p.text-muted-foreground' }).nextElementSibling).toHaveTextContent(String(enrolled))
    expect(screen.getByText('Conversion Rate', { selector: 'p.text-muted-foreground' }).nextElementSibling).toHaveTextContent(`${conversionRate}%`)
  })
})

describe('AdmissionsPage — New Application', () => {
  it('records a new application scoped to the current school and adds it to the Inquiry lane', async () => {
    const user = userEvent.setup()
    render(<AdmissionsPage />)
    const total = mockAdmissions.filter((a) => a.schoolId === schoolId()).length
    const inquiryBefore = laneCount('Inquiry')

    await user.click(screen.getByRole('button', { name: /new application/i }))
    await user.type(screen.getByLabelText(/applicant name/i), 'Test Automation Applicant')
    await user.type(screen.getByLabelText(/grade applied for/i), 'Grade 6')
    await user.type(screen.getByLabelText(/parent \/ guardian name/i), 'Test Automation Parent')
    await user.type(screen.getByLabelText(/parent email/i), 'test.parent@example.com')
    await user.type(screen.getByLabelText(/parent phone/i), '+91 90000 00001')
    await user.click(screen.getByRole('button', { name: /record application/i }))

    expect(await screen.findByText('Test Automation Applicant')).toBeInTheDocument()
    expect(screen.getByText('Total Applicants', { selector: 'p.text-muted-foreground' }).nextElementSibling).toHaveTextContent(String(total + 1))
    expect(laneCount('Inquiry')).toBe(String(Number(inquiryBefore) + 1))
  })
})

describe('AdmissionsPage — search filter', () => {
  it('filters the pipeline down to matching applicants by name', async () => {
    const user = userEvent.setup()
    render(<AdmissionsPage />)
    const schoolAdmissions = mockAdmissions.filter((a) => a.schoolId === schoolId())
    const target = schoolAdmissions[0]
    const other = schoolAdmissions.find((a) => a.applicantName !== target.applicantName)!

    await user.type(screen.getByPlaceholderText(/search applicants/i), target.applicantName)

    expect(await screen.findAllByText(target.applicantName)).toHaveLength(1)
    expect(screen.queryByText(other.applicantName)).not.toBeInTheDocument()
  })
})

describe('AdmissionsPage — stage advancement', () => {
  it('moves an applicant to the next stage when its card is clicked', async () => {
    const user = userEvent.setup()
    render(<AdmissionsPage />)
    const schoolAdmissions = mockAdmissions.filter((a) => a.schoolId === schoolId())
    const target = schoolAdmissions.find((a) => a.stage === 'inquiry')!

    const inquiryBefore = laneCount('Inquiry')
    const applicationBefore = laneCount('Application')

    await user.click(screen.getByText(target.applicantName))

    expect(laneCount('Inquiry')).toBe(String(Number(inquiryBefore) - 1))
    expect(laneCount('Application')).toBe(String(Number(applicationBefore) + 1))
  })
})

describe('AdmissionsPage — delete flow', () => {
  it('removes an application from the pipeline after confirming delete', async () => {
    const user = userEvent.setup()
    render(<AdmissionsPage />)
    const target = mockAdmissions.find((a) => a.schoolId === schoolId())!
    const total = mockAdmissions.filter((a) => a.schoolId === schoolId()).length

    const nameCell = screen.getByText(target.applicantName)
    const card = nameCell.closest('[class*="cursor-pointer"]') as HTMLElement
    await user.click(within(card).getByRole('button'))

    const dialog = await screen.findByRole('alertdialog')
    expect(within(dialog).getByText(/remove this application\?/i)).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: /^delete$/i }))

    expect(screen.queryByText(target.applicantName)).not.toBeInTheDocument()
    expect(screen.getByText('Total Applicants', { selector: 'p.text-muted-foreground' }).nextElementSibling).toHaveTextContent(String(total - 1))
  })
})
