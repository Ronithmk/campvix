import { faker } from '@faker-js/faker'
import type { ActivityItem, AppNotification, CalendarEvent } from '@/types'
import { students } from './students'
import { teachers } from './teachers'
import { SCHOOL_ROSTER_CONFIG } from './school-roster-config'

faker.seed(109)

const NOTIF_DEFS: Array<[string, string, AppNotification['kind']]> = [
  ['Fee payment received', 'Ravi Kumar paid ₹42,000 for Term 2 tuition fees.', 'success'],
  ['New admission request', 'A new admission application is awaiting review.', 'info'],
  ['Attendance below threshold', 'Grade 8 - B attendance dropped below 75% this week.', 'warning'],
  ['Server maintenance', 'Scheduled maintenance tonight from 1 AM to 3 AM.', 'info'],
  ['Overdue fee reminder', '14 students have overdue fee payments.', 'danger'],
  ['Exam schedule published', 'Mid-term exam schedule has been published.', 'info'],
  ['Leave request', 'A teacher submitted a leave request for review.', 'warning'],
  ['Transport delay', 'Route B bus is running 15 minutes behind schedule.', 'warning'],
]

export const notifications: AppNotification[] = SCHOOL_ROSTER_CONFIG.flatMap((config) =>
  NOTIF_DEFS.map(([title, description, kind], i) => ({
    id: `notif-${config.schoolId}-${i + 1}`,
    schoolId: config.schoolId,
    title,
    description,
    kind,
    read: i > 3,
    timestamp: faker.date.recent({ days: 5 }).toISOString(),
  })),
)

const ACTIONS = ['updated the profile of', 'marked attendance for', 'uploaded a document for', 'sent a message to', 'graded an assignment for', 'approved a leave request from']

export const activityFeed: ActivityItem[] = SCHOOL_ROSTER_CONFIG.flatMap((config) => {
  const schoolTeachers = teachers.filter((t) => t.schoolId === config.schoolId)
  const schoolStudents = students.filter((s) => s.schoolId === config.schoolId)
  return Array.from({ length: 10 }, (_, i) => {
    const actor = faker.helpers.arrayElement(schoolTeachers)
    const target = faker.helpers.arrayElement(schoolStudents)
    return {
      id: `activity-${config.schoolId}-${i + 1}`,
      schoolId: config.schoolId,
      actor: actor.name,
      actorAvatar: actor.avatarUrl,
      action: faker.helpers.arrayElement(ACTIONS),
      target: target.name,
      timestamp: faker.date.recent({ days: 3 }).toISOString(),
    } satisfies ActivityItem
  })
})

const EVENT_DEFS: Array<[string, CalendarEvent['type']]> = [
  ['Annual Sports Day', 'sports'],
  ['Parent-Teacher Meeting', 'meeting'],
  ['Mid-Term Examinations', 'exam'],
  ['Independence Day Celebration', 'event'],
  ['Republic Day Holiday', 'holiday'],
  ['Science Exhibition', 'event'],
  ['Staff Meeting', 'meeting'],
  ['Winter Break', 'holiday'],
]

export const calendarEvents: CalendarEvent[] = SCHOOL_ROSTER_CONFIG.flatMap((config) =>
  EVENT_DEFS.map(([title, type], i) => ({
    id: `event-${config.schoolId}-${i + 1}`,
    schoolId: config.schoolId,
    title,
    date: faker.date.soon({ days: 90 }).toISOString(),
    time: `${faker.number.int({ min: 8, max: 15 })}:00`,
    type,
    location: faker.helpers.arrayElement(['Main Auditorium', 'Sports Ground', 'Assembly Hall', 'Classroom Block A', 'Online']),
  })),
).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
