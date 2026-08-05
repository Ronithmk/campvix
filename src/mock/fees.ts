import { faker } from '@faker-js/faker'
import type { FeeRecord, Payment } from '@/types'
import { students } from './students'
import { SCHOOL_ROSTER_CONFIG, configFor } from './school-roster-config'

faker.seed(107)

const CATEGORIES: FeeRecord['category'][] = ['tuition', 'transport', 'hostel', 'library', 'exam']
const TERMS = ['Term 1', 'Term 2', 'Term 3']
const METHODS: Payment['method'][] = ['card', 'upi', 'bank_transfer', 'cash']

export const feeRecords: FeeRecord[] = students.map((student, i) => {
  const amount = faker.number.int({ min: 8000, max: 65000 })
  const status = student.feeStatus
  const paidAmount = status === 'paid' ? amount : status === 'partial' ? Math.round(amount * 0.5) : status === 'overdue' ? 0 : Math.round(amount * faker.number.float({ min: 0, max: 0.4 }))

  return {
    id: `fee-${i + 1}`,
    schoolId: student.schoolId,
    studentId: student.id,
    studentName: student.name,
    invoiceNo: `INV-${String(9000 + i)}`,
    term: faker.helpers.arrayElement(TERMS),
    amount,
    paidAmount,
    dueDate: faker.date.soon({ days: 45 }).toISOString(),
    status,
    category: faker.helpers.arrayElement(CATEGORIES),
  }
})

export const payments: Payment[] = feeRecords
  .filter((f) => f.paidAmount > 0)
  .map((fee, i) => ({
    id: `pay-${i + 1}`,
    schoolId: fee.schoolId,
    feeId: fee.id,
    studentName: fee.studentName,
    amount: fee.paidAmount,
    method: faker.helpers.arrayElement(METHODS),
    date: faker.date.recent({ days: 30 }).toISOString(),
    reference: faker.string.alphanumeric({ length: 10, casing: 'upper' }),
  }))
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

function hashCode(str: string) {
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) >>> 0
  return hash
}

export function buildRevenueTrend(schoolId: string) {
  const config = configFor(schoolId)
  const seed = hashCode(schoolId)
  const base = config.studentCount * 1800
  return Array.from({ length: 6 }, (_, i) => {
    const month = new Date()
    month.setMonth(month.getMonth() - (5 - i))
    const wobble = ((seed + i * 97) % 21) / 100 - 0.1
    return {
      month: month.toLocaleDateString('en-US', { month: 'short' }),
      revenue: Math.round(base * (0.85 + i * 0.05 + wobble)),
      target: Math.round(base * (0.9 + i * 0.04)),
    }
  })
}

export const revenueTrendBySchool = Object.fromEntries(SCHOOL_ROSTER_CONFIG.map((c) => [c.schoolId, buildRevenueTrend(c.schoolId)]))
