import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/layouts/app-shell'
import { ProtectedRoute } from '@/routes/protected-route'
import { RoleProtectedRoute } from '@/routes/role-protected-route'

import LoginPage from '@/pages/auth/login'
import ForgotPasswordPage from '@/pages/auth/forgot-password'
import OtpVerificationPage from '@/pages/auth/otp-verification'
import ResetPasswordPage from '@/pages/auth/reset-password'
import ChooseSchoolPage from '@/pages/auth/choose-school'

import DashboardPage from '@/pages/dashboard'
import StudentsListPage from '@/pages/students/students-list'
import StudentProfilePage from '@/pages/students/student-profile'
import TeachersListPage from '@/pages/teachers/teachers-list'
import AttendancePage from '@/pages/attendance'
import AdmissionsPage from '@/pages/admissions/admissions'
import StaffPage from '@/pages/staff/staff'
import ParentsPage from '@/pages/parents/parents'
import ClassesPage from '@/pages/classes/classes'
import SectionsPage from '@/pages/sections/sections'
import SubjectsPage from '@/pages/subjects/subjects'
import TimetablePage from '@/pages/timetable/timetable'
import ExaminationsPage from '@/pages/examinations/examinations'
import ResultsPage from '@/pages/results/results'
import AssignmentsPage from '@/pages/assignments/assignments'
import HomeworkPage from '@/pages/homework/homework'
import LibraryPage from '@/pages/library/library'
import TransportPage from '@/pages/transport/transport'
import GpsTrackingPage from '@/pages/transport/gps-tracking'
import HostelPage from '@/pages/hostel/hostel'
import InventoryPage from '@/pages/inventory/inventory'

import FeeManagementPage from '@/pages/finance/fee-management'
import PaymentsPage from '@/pages/finance/payments'
import InvoicesPage from '@/pages/finance/invoices'
import PayrollPage from '@/pages/finance/payroll'

import CalendarPage from '@/pages/calendar'
import NotificationsPage from '@/pages/notifications'
import EventsPage from '@/pages/events/events'
import AnnouncementsPage from '@/pages/announcements/announcements'
import NoticeBoardPage from '@/pages/notice-board/notice-board'
import ChatPage from '@/pages/chat/chat'

import ReportsPage from '@/pages/reports/reports'
import AnalyticsPage from '@/pages/analytics/analytics'

import AiAssistantPage from '@/pages/ai-assistant/ai-assistant'
import AlumniPage from '@/pages/alumni/alumni'
import LmsPage from '@/pages/lms/lms'
import DocumentsPage from '@/pages/documents/documents'
import EmailTemplatesPage from '@/pages/email-templates/email-templates'
import GalleryPage from '@/pages/gallery/gallery'

import SettingsPage from '@/pages/settings/settings'
import SchoolsSettingsPage from '@/pages/settings/schools'
import IdCardsPage from '@/pages/id-cards/id-cards'
import ProfilePage from '@/pages/profile'
import SupportPage from '@/pages/support'
import NotFoundPage from '@/pages/not-found'

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
