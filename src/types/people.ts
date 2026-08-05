import type { Gender } from './academic'

export type StudentStatus = 'active' | 'inactive' | 'graduated' | 'suspended'

export interface Student {
  id: string
  schoolId: string
  admissionNo: string
  name: string
  avatarUrl: string
  gender: Gender
  dateOfBirth: string
  classId: string
  className: string
  section: string
  rollNo: number
  status: StudentStatus
  email: string
  phone: string
  address: string
  bloodGroup: string
  parentId: string
  parentName: string
  transportRoute: string | null
  hostelRoom: string | null
  admissionDate: string
  feeStatus: 'paid' | 'pending' | 'overdue' | 'partial'
  attendancePercent: number
  gpa: number
}

export type TeacherStatus = 'active' | 'on_leave' | 'inactive'

export interface Teacher {
  id: string
  schoolId: string
  employeeId: string
  name: string
  avatarUrl: string
  gender: Gender
  email: string
  phone: string
  subjects: string[]
  classes: string[]
  qualification: string
  experienceYears: number
  joiningDate: string
  status: TeacherStatus
  salary: number
  address: string
  performanceScore: number
}

export interface Parent {
  id: string
  schoolId: string
  name: string
  avatarUrl: string
  email: string
  phone: string
  occupation: string
  childrenIds: string[]
  address: string
}

export type StaffRole = 'accountant' | 'receptionist' | 'driver' | 'librarian' | 'admin_staff'

export interface Staff {
  id: string
  schoolId: string
  name: string
  avatarUrl: string
  role: StaffRole
  email: string
  phone: string
  joiningDate: string
  status: 'active' | 'inactive'
}
