import { faker } from '@faker-js/faker'
import type { AttendanceRecord } from '@/types'
import { students } from './students'
import { SCHOOL_ROSTER_CONFIG } from './school-roster-config'

faker.seed(106)

const STATUSES: AttendanceRecord['status'][] = ['present', 'present', 'present', 'present', 'present', 'absent', 'late', 'excused']

function lastNDays(n: number) {
  const days: string[] = []
  const today = new Date()
  for (let i = 0; i < n; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    if (d.getDay() === 0 || d.getDay() === 6) continue
    days.push(d.toISOString().slice(0, 10))
  }
  return days
}

export const attendanceDays = lastNDays(14)

const sample = SCHOOL_ROSTER_CONFIG.flatMap((config) => students.filter((s) => s.schoolId === config.schoolId).slice(0, 60))

export const attendanceRecords: AttendanceRecord[] = attendanceDays.flatMap((date, di) =>
  sample.map((student, si) => ({
    id: `att-${di}-${si}`,
    schoolId: student.schoolId,
    studentId: student.id,
    date,
    status: faker.helpers.arrayElement(STATUSES),
    classId: student.classId,
  })),
)

export function buildAttendanceTrend(records: AttendanceRecord[]) {
  return attendanceDays
    .slice()
    .reverse()
    .map((date) => {
      const dayRecords = records.filter((r) => r.date === date)
      const present = dayRecords.filter((r) => r.status === 'present' || r.status === 'late').length
      return {
        date,
        label: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        percent: dayRecords.length ? Math.round((present / dayRecords.length) * 100) : 0,
      }
    })
}
