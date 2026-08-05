import { faker } from '@faker-js/faker'
import type { PayrollRecord } from '@/types'
import { teachers } from './teachers'
import { staff } from './staff'

faker.seed(205)

const STAFF_ROLE_LABELS: Record<string, string> = {
  accountant: 'Accountant',
  receptionist: 'Receptionist',
  driver: 'Driver',
  librarian: 'Librarian',
  admin_staff: 'Admin Staff',
}

const STATUSES: PayrollRecord['status'][] = ['paid', 'paid', 'paid', 'processing', 'pending']

function buildRecord(id: string, schoolId: string, name: string, avatarUrl: string, role: string, baseSalary: number, index: number): PayrollRecord {
  const allowances = Math.round(baseSalary * 0.15)
  const deductions = Math.round(baseSalary * 0.08)
  const status = STATUSES[index % STATUSES.length]

  return {
    id,
    schoolId,
    employeeId: `EMP-${1000 + index}`,
    name,
    avatarUrl,
    role,
    baseSalary,
    allowances,
    deductions,
    netPay: baseSalary + allowances - deductions,
    month: 'August 2026',
    status,
    paymentDate: status === 'paid' ? faker.date.recent({ days: 15 }).toISOString() : null,
  }
}

export const payrollRecords: PayrollRecord[] = [
  ...teachers.map((t, i) => buildRecord(`payroll-teacher-${t.id}`, t.schoolId, t.name, t.avatarUrl, 'Teacher', t.salary, i)),
  ...staff.map((s, i) => buildRecord(`payroll-staff-${s.id}`, s.schoolId, s.name, s.avatarUrl, STAFF_ROLE_LABELS[s.role], faker.number.int({ min: 22000, max: 55000 }), i + teachers.length)),
]
