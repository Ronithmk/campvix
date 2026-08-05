import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard,
  Users,
  UserPlus,
  CalendarCheck,
  GraduationCap,
  Briefcase,
  UsersRound,
  School,
  Layers,
  BookOpen,
  ClipboardList,
  FileSpreadsheet,
  NotebookPen,
  BookMarked,
  Bus,
  BedDouble,
  Boxes,
  Wallet,
  Receipt,
  CreditCard,
  Banknote,
  Bell,
  Calendar,
  PartyPopper,
  BarChart3,
  LineChart,
  Settings,
  UserCircle,
  LifeBuoy,
  Megaphone,
  MessageSquareText,
  Sparkles,
  Award,
  Newspaper,
  Pin,
  IdCard,
  Video,
  MapPin,
  FileText,
  Mail,
  Building2,
  Users2,
} from 'lucide-react'
import type { Role } from '@/types'

export interface NavItem {
  title: string
  url: string
  icon: LucideIcon
  roles: Role[]
  badge?: string
}

export interface NavSection {
  title: string
  items: NavItem[]
}

const ALL_STAFF: Role[] = ['administrator', 'principal', 'teacher', 'accountant', 'receptionist', 'librarian']
const LEADERSHIP: Role[] = ['administrator', 'principal']

export const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Overview',
    items: [{ title: 'Dashboard', url: '/app/dashboard', icon: LayoutDashboard, roles: ['administrator', 'principal', 'teacher', 'accountant', 'receptionist', 'student', 'parent', 'driver', 'librarian'] }],
  },
  {
    title: 'People',
    items: [
      { title: 'Students', url: '/app/students', icon: Users, roles: ['administrator', 'principal', 'teacher', 'receptionist', 'librarian', 'parent'] },
      { title: 'Admissions', url: '/app/admissions', icon: UserPlus, roles: ['administrator', 'principal', 'receptionist'] },
      { title: 'Attendance', url: '/app/attendance', icon: CalendarCheck, roles: ['administrator', 'principal', 'teacher', 'student', 'parent'] },
      { title: 'Teachers', url: '/app/teachers', icon: GraduationCap, roles: ['administrator', 'principal'] },
      { title: 'Staff', url: '/app/staff', icon: Briefcase, roles: LEADERSHIP },
      { title: 'Parents', url: '/app/parents', icon: UsersRound, roles: ['administrator', 'principal', 'receptionist'] },
    ],
  },
  {
    title: 'Academics',
    items: [
      { title: 'Classes', url: '/app/classes', icon: School, roles: ALL_STAFF },
      { title: 'Sections', url: '/app/sections', icon: Layers, roles: LEADERSHIP },
      { title: 'Subjects', url: '/app/subjects', icon: BookOpen, roles: ALL_STAFF },
      { title: 'Timetable', url: '/app/timetable', icon: ClipboardList, roles: ['administrator', 'principal', 'teacher', 'student', 'parent'] },
      { title: 'Examinations', url: '/app/examinations', icon: FileSpreadsheet, roles: ['administrator', 'principal', 'teacher', 'student', 'parent'] },
      { title: 'Results', url: '/app/results', icon: Award, roles: ['administrator', 'principal', 'teacher', 'student', 'parent'] },
      { title: 'Assignments', url: '/app/assignments', icon: NotebookPen, roles: ['administrator', 'principal', 'teacher', 'student'] },
      { title: 'Homework', url: '/app/homework', icon: BookMarked, roles: ['teacher', 'student', 'parent'] },
    ],
  },
  {
    title: 'Finance',
    items: [
      { title: 'Fee Management', url: '/app/finance/fees', icon: Wallet, roles: ['administrator', 'principal', 'accountant', 'parent'] },
      { title: 'Invoices', url: '/app/finance/invoices', icon: Receipt, roles: ['administrator', 'accountant'] },
      { title: 'Payments', url: '/app/finance/payments', icon: CreditCard, roles: ['administrator', 'accountant'] },
      { title: 'Payroll', url: '/app/finance/payroll', icon: Banknote, roles: ['administrator', 'accountant'] },
    ],
  },
  {
    title: 'Facilities',
    items: [
      { title: 'Library', url: '/app/library', icon: BookMarked, roles: ['administrator', 'librarian', 'teacher', 'student'] },
      { title: 'Transport', url: '/app/transport', icon: Bus, roles: ['administrator', 'driver', 'parent'] },
      { title: 'Hostel', url: '/app/hostel', icon: BedDouble, roles: LEADERSHIP },
      { title: 'Inventory', url: '/app/inventory', icon: Boxes, roles: LEADERSHIP },
    ],
  },
  {
    title: 'Communication',
    items: [
      { title: 'Notifications', url: '/app/notifications', icon: Bell, roles: ['administrator', 'principal', 'teacher', 'accountant', 'receptionist', 'student', 'parent', 'driver', 'librarian'] },
      { title: 'Calendar', url: '/app/calendar', icon: Calendar, roles: ['administrator', 'principal', 'teacher', 'accountant', 'receptionist', 'student', 'parent', 'driver', 'librarian'] },
      { title: 'Events', url: '/app/events', icon: PartyPopper, roles: ALL_STAFF },
      { title: 'Announcements', url: '/app/announcements', icon: Megaphone, roles: ALL_STAFF },
      { title: 'Notice Board', url: '/app/notice-board', icon: Pin, roles: ['administrator', 'principal', 'teacher', 'student', 'parent'] },
      { title: 'Parent Chat', url: '/app/chat', icon: MessageSquareText, roles: ['teacher', 'parent'] },
    ],
  },
  {
    title: 'Insights',
    items: [
      { title: 'Reports', url: '/app/reports', icon: BarChart3, roles: LEADERSHIP },
      { title: 'Analytics', url: '/app/analytics', icon: LineChart, roles: LEADERSHIP },
    ],
  },
  {
    title: 'Platform',
    items: [
      { title: 'AI Assistant', url: '/app/ai-assistant', icon: Sparkles, roles: ['administrator', 'principal', 'teacher', 'accountant', 'receptionist', 'student', 'parent', 'driver', 'librarian'] },
      { title: 'Alumni', url: '/app/alumni', icon: Users2, roles: LEADERSHIP },
      { title: 'LMS', url: '/app/lms', icon: Video, roles: ['administrator', 'teacher', 'student'] },
      { title: 'Documents', url: '/app/documents', icon: FileText, roles: ALL_STAFF },
      { title: 'Email Templates', url: '/app/email-templates', icon: Mail, roles: LEADERSHIP },
      { title: 'Gallery', url: '/app/gallery', icon: Newspaper, roles: ['administrator', 'principal', 'teacher', 'student', 'parent'] },
    ],
  },
  {
    title: 'System',
    items: [
      { title: 'Settings', url: '/app/settings', icon: Settings, roles: LEADERSHIP },
      { title: 'Schools', url: '/app/settings/schools', icon: Building2, roles: LEADERSHIP },
      { title: 'ID Cards', url: '/app/id-cards', icon: IdCard, roles: ['administrator', 'receptionist'] },
      { title: 'GPS Tracking', url: '/app/transport/gps', icon: MapPin, roles: ['administrator', 'driver'] },
      { title: 'Profile', url: '/app/profile', icon: UserCircle, roles: ['administrator', 'principal', 'teacher', 'accountant', 'receptionist', 'student', 'parent', 'driver', 'librarian'] },
      { title: 'Support', url: '/app/support', icon: LifeBuoy, roles: ['administrator', 'principal', 'teacher', 'accountant', 'receptionist', 'student', 'parent', 'driver', 'librarian'] },
    ],
  },
]

export function getNavForRole(role: Role | null, allowedUrls?: string[]): NavSection[] {
  if (!role) return NAV_SECTIONS
  return NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => (allowedUrls ? allowedUrls.includes(item.url) : item.roles.includes(role))),
  })).filter((section) => section.items.length > 0)
}

export function getAllNavItems(): NavItem[] {
  return NAV_SECTIONS.flatMap((section) => section.items)
}

export function findNavItemForPath(pathname: string): NavItem | undefined {
  const items = getAllNavItems()
  const exact = items.find((item) => item.url === pathname)
  if (exact) return exact
  const prefixMatches = items.filter((item) => pathname.startsWith(`${item.url}/`))
  prefixMatches.sort((a, b) => b.url.length - a.url.length)
  return prefixMatches[0]
}
