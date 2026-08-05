export type AdmissionStage = 'inquiry' | 'application' | 'entrance_test' | 'interview' | 'offer' | 'enrolled' | 'rejected'

export interface Admission {
  id: string
  schoolId: string
  applicantName: string
  avatarUrl: string
  gradeAppliedFor: string
  parentName: string
  parentEmail: string
  parentPhone: string
  stage: AdmissionStage
  appliedDate: string
  score: number | null
  source: 'website' | 'referral' | 'walk_in' | 'agent'
}

export type AssignmentStatus = 'draft' | 'published' | 'grading' | 'completed'

export interface Assignment {
  id: string
  schoolId: string
  title: string
  subjectId: string
  classId: string
  teacherId: string
  assignedDate: string
  dueDate: string
  totalSubmissions: number
  totalStudents: number
  graded: number
  status: AssignmentStatus
  maxScore: number
}

export interface HomeworkEntry {
  id: string
  schoolId: string
  subjectId: string
  classId: string
  title: string
  description: string
  date: string
  completionPercent: number
}

export type BookCategory = 'fiction' | 'non_fiction' | 'science' | 'reference' | 'biography' | 'children'

export interface LibraryBook {
  id: string
  schoolId: string
  title: string
  author: string
  isbn: string
  category: BookCategory
  coverColor: string
  totalCopies: number
  availableCopies: number
  shelfLocation: string
}

export type IssueStatus = 'issued' | 'returned' | 'overdue'

export interface BookIssue {
  id: string
  schoolId: string
  bookId: string
  bookTitle: string
  studentName: string
  studentAvatar: string
  issueDate: string
  dueDate: string
  returnDate: string | null
  status: IssueStatus
  fine: number
}

export interface TransportRoute {
  id: string
  schoolId: string
  name: string
  vehicleNo: string
  driverName: string
  driverAvatar: string
  driverPhone: string
  capacity: number
  occupied: number
  stops: string[]
  status: 'on_route' | 'idle' | 'maintenance'
  currentStop: string
  etaMinutes: number
}

export interface HostelRoom {
  id: string
  schoolId: string
  roomNo: string
  block: string
  floor: number
  capacity: number
  occupied: number
  wardenName: string
  type: 'single' | 'double' | 'dormitory'
  occupants: string[]
}

export type InventoryCategory = 'furniture' | 'electronics' | 'sports' | 'lab_equipment' | 'stationery' | 'books'

export interface InventoryItem {
  id: string
  schoolId: string
  name: string
  category: InventoryCategory
  quantity: number
  minThreshold: number
  unit: string
  location: string
  lastRestocked: string
  vendor: string
}

export interface PayrollRecord {
  id: string
  schoolId: string
  employeeId: string
  name: string
  avatarUrl: string
  role: string
  baseSalary: number
  allowances: number
  deductions: number
  netPay: number
  month: string
  status: 'paid' | 'pending' | 'processing'
  paymentDate: string | null
}

export type AnnouncementAudience = 'all' | 'teachers' | 'students' | 'parents' | 'staff'

export interface Announcement {
  id: string
  schoolId: string
  title: string
  body: string
  audience: AnnouncementAudience
  author: string
  authorAvatar: string
  publishedDate: string
  pinned: boolean
}

export interface NoticeBoardPost {
  id: string
  schoolId: string
  title: string
  category: 'academic' | 'event' | 'administrative' | 'urgent'
  body: string
  postedBy: string
  postedDate: string
  expiryDate: string
}

export interface ChatMessage {
  id: string
  senderId: string
  senderName: string
  text: string
  timestamp: string
  isSelf: boolean
}

export interface ChatThread {
  id: string
  participantName: string
  participantAvatar: string
  participantRole: 'parent' | 'teacher'
  lastMessage: string
  lastMessageTime: string
  unread: number
  messages: ChatMessage[]
}

export interface AlumniProfile {
  id: string
  schoolId: string
  name: string
  avatarUrl: string
  graduationYear: number
  currentRole: string
  company: string
  location: string
  email: string
  linkedIn: string
  donated: boolean
}

export type CourseStatus = 'draft' | 'published' | 'archived'

export interface Course {
  id: string
  schoolId: string
  title: string
  subjectId: string
  instructor: string
  thumbnail: string
  lessonsCount: number
  enrolledCount: number
  progress: number
  status: CourseStatus
  duration: string
}

export type DocumentType = 'pdf' | 'doc' | 'sheet' | 'image' | 'folder'

export interface DocumentItem {
  id: string
  schoolId: string
  name: string
  type: DocumentType
  size: string
  owner: string
  modifiedDate: string
  folder: string
  starred: boolean
}

export interface EmailTemplate {
  id: string
  schoolId: string
  name: string
  subject: string
  category: 'fee_reminder' | 'admission' | 'attendance' | 'exam' | 'general'
  lastEdited: string
  sentCount: number
  preview: string
}

export interface GalleryAlbum {
  id: string
  schoolId: string
  title: string
  coverColor: string
  eventDate: string
  photoCount: number
  isPublic: boolean
}
