export const ROLES = [
  'administrator',
  'principal',
  'teacher',
  'accountant',
  'receptionist',
  'student',
  'parent',
  'driver',
  'librarian',
] as const

export type Role = (typeof ROLES)[number]

export const ROLE_LABELS: Record<Role, string> = {
  administrator: 'Administrator',
  principal: 'Principal',
  teacher: 'Teacher',
  accountant: 'Accountant',
  receptionist: 'Receptionist',
  student: 'Student',
  parent: 'Parent',
  driver: 'Driver',
  librarian: 'Librarian',
}
