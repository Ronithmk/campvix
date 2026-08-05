import type { Role } from '@/types'
import { schools } from './schools'
import { teachers } from './teachers'
import { students } from './students'
import { parents } from './parents'
import { staff } from './staff'

export interface DemoAccount {
  role: Role
  email: string
  password: string
  name: string
  avatarUrl: string
  schoolId: string
  title: string
  /** id of the underlying roster record this login represents, used to personalize "my data" views */
  personId: string | null
}

const homeSchool = schools[0].id

const sampleStudent = students.find((s) => s.schoolId === homeSchool && s.status === 'active')!
const sampleParent = parents.find((p) => p.id === sampleStudent.parentId)!
const sampleTeacher = teachers.find((t) => t.schoolId === homeSchool && t.status === 'active')!
const sampleAccountant = staff.find((s) => s.schoolId === homeSchool && s.role === 'accountant')!
const sampleReceptionist = staff.find((s) => s.schoolId === homeSchool && s.role === 'receptionist')!
const sampleDriver = staff.find((s) => s.schoolId === homeSchool && s.role === 'driver')!
const sampleLibrarian = staff.find((s) => s.schoolId === homeSchool && s.role === 'librarian')!

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: 'administrator',
    email: 'admin@campusflow.app',
    password: 'demo1234',
    name: 'Aditi Sharma',
    avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4',
    schoolId: homeSchool,
    title: 'School Administrator',
    personId: null,
  },
  {
    role: 'principal',
    email: 'principal@campusflow.app',
    password: 'demo1234',
    name: 'Vikram Rao',
    avatarUrl: 'https://avatars.githubusercontent.com/u/2?v=4',
    schoolId: homeSchool,
    title: 'Principal',
    personId: null,
  },
  {
    role: 'teacher',
    email: 'teacher@campusflow.app',
    password: 'demo1234',
    name: sampleTeacher.name,
    avatarUrl: sampleTeacher.avatarUrl,
    schoolId: homeSchool,
    title: `Teacher · ${sampleTeacher.subjects[0]}`,
    personId: sampleTeacher.id,
  },
  {
    role: 'student',
    email: 'student@campusflow.app',
    password: 'demo1234',
    name: sampleStudent.name,
    avatarUrl: sampleStudent.avatarUrl,
    schoolId: homeSchool,
    title: `Student · ${sampleStudent.className} - ${sampleStudent.section}`,
    personId: sampleStudent.id,
  },
  {
    role: 'parent',
    email: 'parent@campusflow.app',
    password: 'demo1234',
    name: sampleParent.name,
    avatarUrl: sampleParent.avatarUrl,
    schoolId: homeSchool,
    title: 'Parent / Guardian',
    personId: sampleParent.id,
  },
  {
    role: 'accountant',
    email: 'accountant@campusflow.app',
    password: 'demo1234',
    name: sampleAccountant?.name ?? 'Neha Kapoor',
    avatarUrl: sampleAccountant?.avatarUrl ?? 'https://avatars.githubusercontent.com/u/3?v=4',
    schoolId: homeSchool,
    title: 'Accountant',
    personId: sampleAccountant?.id ?? null,
  },
  {
    role: 'receptionist',
    email: 'receptionist@campusflow.app',
    password: 'demo1234',
    name: sampleReceptionist?.name ?? 'Pooja Iyer',
    avatarUrl: sampleReceptionist?.avatarUrl ?? 'https://avatars.githubusercontent.com/u/4?v=4',
    schoolId: homeSchool,
    title: 'Front Desk Receptionist',
    personId: sampleReceptionist?.id ?? null,
  },
  {
    role: 'driver',
    email: 'driver@campusflow.app',
    password: 'demo1234',
    name: sampleDriver?.name ?? 'Suresh Nair',
    avatarUrl: sampleDriver?.avatarUrl ?? 'https://avatars.githubusercontent.com/u/5?v=4',
    schoolId: homeSchool,
    title: 'Transport Driver',
    personId: sampleDriver?.id ?? null,
  },
  {
    role: 'librarian',
    email: 'librarian@campusflow.app',
    password: 'demo1234',
    name: sampleLibrarian?.name ?? 'Meera Pillai',
    avatarUrl: sampleLibrarian?.avatarUrl ?? 'https://avatars.githubusercontent.com/u/6?v=4',
    schoolId: homeSchool,
    title: 'Librarian',
    personId: sampleLibrarian?.id ?? null,
  },
]

export function findDemoAccount(email: string, password: string): DemoAccount | undefined {
  const normalized = email.trim().toLowerCase()
  return DEMO_ACCOUNTS.find((a) => a.email === normalized && a.password === password)
}

export function demoAccountForRole(role: Role): DemoAccount {
  return DEMO_ACCOUNTS.find((a) => a.role === role) ?? DEMO_ACCOUNTS[0]
}
