import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ResultsPage from './results'
import { useAuthStore } from '@/store/auth-store'
import { usePermissionsStore } from '@/store/permissions-store'
import { results as mockResults } from '@/mock/exams'
import { students as allStudents } from '@/mock/students'
import { exams as allExams } from '@/mock/exams'

beforeEach(() => {
  localStorage.clear()
  usePermissionsStore.getState().resetToDefaults()
  useAuthStore.getState().logout()
  useAuthStore.getState().loginAsRole('administrator')
})

const schoolId = () => useAuthStore.getState().schoolId!

describe('ResultsPage — rendering and stats', () => {
  it('renders for administrator', () => {
    render(<ResultsPage />)
    expect(screen.getByRole('heading', { name: /^results$/i })).toBeInTheDocument()
  })

  it('shows stat cards matching the underlying mock data', () => {
    render(<ResultsPage />)
    const schoolResults = mockResults.filter((r) => r.schoolId === schoolId())
    const avgScore = Math.round(schoolResults.reduce((sum, r) => sum + (r.marksObtained / r.maxMarks) * 100, 0) / schoolResults.length)
    const topScorers = schoolResults.filter((r) => r.marksObtained / r.maxMarks >= 0.9).length

    expect(screen.getByText('Results Recorded', { selector: 'p.text-muted-foreground' }).nextElementSibling).toHaveTextContent(String(schoolResults.length))
    expect(screen.getByText('Average Score', { selector: 'p.text-muted-foreground' }).nextElementSibling).toHaveTextContent(`${avgScore}%`)
    expect(screen.getByText('Top Scorers (A+/A)', { selector: 'p.text-muted-foreground' }).nextElementSibling).toHaveTextContent(String(topScorers))
  })
})

describe('ResultsPage — delete flow', () => {
  it('removes the result row after confirming delete', async () => {
    const user = userEvent.setup()
    render(<ResultsPage />)
    const target = mockResults.find((r) => r.schoolId === schoolId())!
    const before = mockResults.filter((r) => r.schoolId === schoolId()).length
    const studentName = allStudents.find((s) => s.id === target.studentId)!.name
    const examName = allExams.find((e) => e.id === target.examId)!.name

    const rows = screen.getAllByRole('row')
    const row = rows.find((r) => r.textContent?.includes(studentName) && r.textContent?.includes(examName) && r.textContent?.includes(String(target.marksObtained)))!
    await user.click(within(row).getByRole('button'))
    await user.click(await screen.findByRole('menuitem', { name: /delete result/i }))

    const dialog = await screen.findByRole('alertdialog')
    expect(within(dialog).getByText(/delete this result\?/i)).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: /^delete$/i }))

    expect(screen.getByText('Results Recorded', { selector: 'p.text-muted-foreground' }).nextElementSibling).toHaveTextContent(String(before - 1))
  })
})
