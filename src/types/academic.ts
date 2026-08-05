export interface SchoolClass {
  id: string
  schoolId: string
  name: string
  sections: string[]
  classTeacherId: string
  strength: number
  room: string
}

export interface Subject {
  id: string
  name: string
  code: string
  color: string
}

export type Gender = 'male' | 'female' | 'other'

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused'

export interface AttendanceRecord {
  id: string
  schoolId: string
  studentId: string
  date: string
  status: AttendanceStatus
  classId: string
}

export type FeeStatus = 'paid' | 'pending' | 'overdue' | 'partial'

export interface FeeRecord {
  id: string
  schoolId: string
  studentId: string
  studentName: string
  invoiceNo: string
  term: string
  amount: number
  paidAmount: number
  dueDate: string
  status: FeeStatus
  category: 'tuition' | 'transport' | 'hostel' | 'library' | 'exam'
}

export interface Payment {
  id: string
  schoolId: string
  feeId: string
  studentName: string
  amount: number
  method: 'card' | 'upi' | 'bank_transfer' | 'cash'
  date: string
  reference: string
}

export type ExamStatus = 'upcoming' | 'ongoing' | 'completed' | 'graded'

export interface Exam {
  id: string
  schoolId: string
  name: string
  subjectId: string
  classId: string
  date: string
  maxMarks: number
  status: ExamStatus
}

export interface Result {
  id: string
  schoolId: string
  examId: string
  studentId: string
  marksObtained: number
  maxMarks: number
  grade: string
}
