import { lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/layouts/app-shell'
import { ProtectedRoute } from '@/routes/protected-route'
import { RoleProtectedRoute } from '@/routes/role-protected-route'

import LoginPage from '@/pages/auth/login'
import ForgotPasswordPage from '@/pages/auth/forgot-password'
import OtpVerificationPage from '@/pages/auth/otp-verification'
import ResetPasswordPage from '@/pages/auth/reset-password'
import ChooseSchoolPage from '@/pages/auth/choose-school'
import NotFoundPage from '@/pages/not-found'

const DashboardPage = lazy(() => import('@/pages/dashboard'))
const StudentsListPage = lazy(() => import('@/pages/students/students-list'))
const StudentProfilePage = lazy(() => import('@/pages/students/student-profile'))
const TeachersListPage = lazy(() => import('@/pages/teachers/teachers-list'))
const AttendancePage = lazy(() => import('@/pages/attendance'))
const AdmissionsPage = lazy(() => import('@/pages/admissions/admissions'))
const StaffPage = lazy(() => import('@/pages/staff/staff'))
const ParentsPage = lazy(() => import('@/pages/parents/parents'))
const ClassesPage = lazy(() => import('@/pages/classes/classes'))
const SectionsPage = lazy(() => import('@/pages/sections/sections'))
const SubjectsPage = lazy(() => import('@/pages/subjects/subjects'))
const TimetablePage = lazy(() => import('@/pages/timetable/timetable'))
const ExaminationsPage = lazy(() => import('@/pages/examinations/examinations'))
const ResultsPage = lazy(() => import('@/pages/results/results'))
const AssignmentsPage = lazy(() => import('@/pages/assignments/assignments'))
const HomeworkPage = lazy(() => import('@/pages/homework/homework'))
const LibraryPage = lazy(() => import('@/pages/library/library'))
const TransportPage = lazy(() => import('@/pages/transport/transport'))
const GpsTrackingPage = lazy(() => import('@/pages/transport/gps-tracking'))
const HostelPage = lazy(() => import('@/pages/hostel/hostel'))
const InventoryPage = lazy(() => import('@/pages/inventory/inventory'))

const FeeManagementPage = lazy(() => import('@/pages/finance/fee-management'))
const PaymentsPage = lazy(() => import('@/pages/finance/payments'))
const InvoicesPage = lazy(() => import('@/pages/finance/invoices'))
const PayrollPage = lazy(() => import('@/pages/finance/payroll'))

const CalendarPage = lazy(() => import('@/pages/calendar'))
const NotificationsPage = lazy(() => import('@/pages/notifications'))
const EventsPage = lazy(() => import('@/pages/events/events'))
const AnnouncementsPage = lazy(() => import('@/pages/announcements/announcements'))
const NoticeBoardPage = lazy(() => import('@/pages/notice-board/notice-board'))
const ChatPage = lazy(() => import('@/pages/chat/chat'))

const ReportsPage = lazy(() => import('@/pages/reports/reports'))
const AnalyticsPage = lazy(() => import('@/pages/analytics/analytics'))

const AiAssistantPage = lazy(() => import('@/pages/ai-assistant/ai-assistant'))
const AlumniPage = lazy(() => import('@/pages/alumni/alumni'))
const LmsPage = lazy(() => import('@/pages/lms/lms'))
const DocumentsPage = lazy(() => import('@/pages/documents/documents'))
const EmailTemplatesPage = lazy(() => import('@/pages/email-templates/email-templates'))
const GalleryPage = lazy(() => import('@/pages/gallery/gallery'))

const SettingsPage = lazy(() => import('@/pages/settings/settings'))
const SchoolsSettingsPage = lazy(() => import('@/pages/settings/schools'))
const IdCardsPage = lazy(() => import('@/pages/id-cards/id-cards'))
const ProfilePage = lazy(() => import('@/pages/profile'))
const SupportPage = lazy(() => import('@/pages/support'))

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/otp-verification" element={<OtpVerificationPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/choose-school" element={<ChooseSchoolPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<RoleProtectedRoute />}>
        <Route path="/app" element={<AppShell />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />

          <Route path="students" element={<StudentsListPage />} />
          <Route path="students/:studentId" element={<StudentProfilePage />} />
          <Route path="admissions" element={<AdmissionsPage />} />
          <Route path="attendance" element={<AttendancePage />} />
          <Route path="teachers" element={<TeachersListPage />} />
          <Route path="staff" element={<StaffPage />} />
          <Route path="parents" element={<ParentsPage />} />

          <Route path="classes" element={<ClassesPage />} />
          <Route path="sections" element={<SectionsPage />} />
          <Route path="subjects" element={<SubjectsPage />} />
          <Route path="timetable" element={<TimetablePage />} />
          <Route path="examinations" element={<ExaminationsPage />} />
          <Route path="results" element={<ResultsPage />} />
          <Route path="assignments" element={<AssignmentsPage />} />
          <Route path="homework" element={<HomeworkPage />} />

          <Route path="finance/fees" element={<FeeManagementPage />} />
          <Route path="finance/payments" element={<PaymentsPage />} />
          <Route path="finance/invoices" element={<InvoicesPage />} />
          <Route path="finance/payroll" element={<PayrollPage />} />

          <Route path="library" element={<LibraryPage />} />
          <Route path="transport" element={<TransportPage />} />
          <Route path="transport/gps" element={<GpsTrackingPage />} />
          <Route path="hostel" element={<HostelPage />} />
          <Route path="inventory" element={<InventoryPage />} />

          <Route path="calendar" element={<CalendarPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="events" element={<EventsPage />} />
          <Route path="announcements" element={<AnnouncementsPage />} />
          <Route path="notice-board" element={<NoticeBoardPage />} />
          <Route path="chat" element={<ChatPage />} />

          <Route path="reports" element={<ReportsPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />

          <Route path="ai-assistant" element={<AiAssistantPage />} />
          <Route path="alumni" element={<AlumniPage />} />
          <Route path="lms" element={<LmsPage />} />
          <Route path="documents" element={<DocumentsPage />} />
          <Route path="email-templates" element={<EmailTemplatesPage />} />
          <Route path="gallery" element={<GalleryPage />} />

          <Route path="settings" element={<SettingsPage />} />
          <Route path="settings/schools" element={<SchoolsSettingsPage />} />
          <Route path="id-cards" element={<IdCardsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="support" element={<SupportPage />} />
        </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
