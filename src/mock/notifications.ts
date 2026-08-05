import { faker } from '@faker-js/faker'
import type { ActivityItem, AppNotification, CalendarEvent } from '@/types'
import { students } from './students'
import { teachers } from './teachers'

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

export const notifications: AppNotification[] = NOTIF_DEFS.map(([title, description, kind], i) => ({
  id: `notif-${i + 1}`,
  title,
  description,
  kind,
  read: i > 3,
  timestamp: faker.date.recent({ days: 5 }).toISOString(),
}))

const ACTIONS = ['updated the profile of', 'marked attendance for', 'uploaded a document for', 'sent a message to', 'graded an assignment for', 'approved a leave request from']

export const activityFeed: ActivityItem[] = Array.from({ length: 10 }, (_, i) => {
  const actor = faker.helpers.arrayElement(teachers)
  const target = faker.helpers.arrayElement(students)
  return {
    id: `activity-${i + 1}`,
    actor: actor.name,
    actorAvatar: actor.avatarUrl,
    action: faker.helpers.arrayElement(ACTIONS),
    target: target.name,
    timestamp: faker.date.recent({ days: 3 }).toISOString(),
  }
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

export const calendarEvents: CalendarEvent[] = EVENT_DEFS.map(([title, type], i) => ({
  id: `event-${i + 1}`,
  title,
  date: faker.date.soon({ days: 90 }).toISOString(),
  time: `${faker.number.int({ min: 8, max: 15 })}:00`,
  type,
  location: faker.helpers.arrayElement(['Main Auditorium', 'Sports Ground', 'Assembly Hall', 'Classroom Block A', 'Online']),
})).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
