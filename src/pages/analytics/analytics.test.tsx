import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import AnalyticsPage from './analytics'
import { useAuthStore } from '@/store/auth-store'
import { usePermissionsStore } from '@/store/permissions-store'
import { schools } from '@/mock/schools'
import { students } from '@/mock/students'
import { feeRecords } from '@/mock/fees'
import { formatCurrency, formatNumber } from '@/lib/utils'

beforeEach(() => {
  localStorage.clear()
  usePermissionsStore.getState().resetToDefaults()
  useAuthStore.getState().logout()
  useAuthStore.getState().loginAsRole('administrator')
  useAuthStore.setState({ schoolId: schools[0].id })
})

describe('AnalyticsPage', () => {
  it('renders for administrator with stat cards matching mock data for the active school', () => {
    render(<AnalyticsPage />)
    const schoolStudents = students.filter((s) => s.schoolId === schools[0].id)
    const schoolFeeRecords = feeRecords.filter((f) => f.schoolId === schools[0].id)
    const atRiskCount = schoolStudents.filter((s) => s.attendancePercent < 75 || s.gpa < 6.5).length
    const totalRevenue = schoolFeeRecords.reduce((sum, f) => sum + f.paidAmount, 0)
    const revenuePerStudent = schoolStudents.length ? Math.round(totalRevenue / schoolStudents.length) : 0

    expect(screen.getByRole('heading', { name: /^analytics$/i })).toBeInTheDocument()
    expect(screen.getByText('Total Enrollment')).toBeInTheDocument()
    expect(screen.getByText(formatNumber(schoolStudents.length))).toBeInTheDocument()
    expect(screen.getByText('At-Risk Students')).toBeInTheDocument()
    expect(screen.getByText(String(atRiskCount))).toBeInTheDocument()
    expect(screen.getByText('Revenue per Student')).toBeInTheDocument()
    expect(screen.getByText(formatCurrency(revenuePerStudent))).toBeInTheDocument()
  })

  it('lists at-risk students matching low attendance/GPA mock data, capped at 6', () => {
    render(<AnalyticsPage />)
    const schoolStudents = students.filter((s) => s.schoolId === schools[0].id)
    const atRisk = schoolStudents.filter((s) => s.attendancePercent < 75 || s.gpa < 6.5).slice(0, 6)

    expect(screen.getByText('At-risk students')).toBeInTheDocument()
    for (const s of atRisk) {
      expect(screen.getByText(s.name)).toBeInTheDocument()
    }
  })

  it('recomputes stats for a different school after switching the active school', () => {
    const { rerender } = render(<AnalyticsPage />)
    useAuthStore.setState({ schoolId: schools[1].id })
    rerender(<AnalyticsPage />)

    const schoolBStudents = students.filter((s) => s.schoolId === schools[1].id)
    expect(screen.getByText(formatNumber(schoolBStudents.length))).toBeInTheDocument()
    expect(screen.getByText(new RegExp(schools[1].name))).toBeInTheDocument()
  })
})
