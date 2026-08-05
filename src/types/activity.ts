export type NotificationKind = 'info' | 'success' | 'warning' | 'danger'

export interface AppNotification {
  id: string
  schoolId: string
  title: string
  description: string
  kind: NotificationKind
  read: boolean
  timestamp: string
}

export interface ActivityItem {
  id: string
  schoolId: string
  actor: string
  actorAvatar: string
  action: string
  target: string
  timestamp: string
}

export interface CalendarEvent {
  id: string
  schoolId: string
  title: string
  date: string
  time: string
  type: 'exam' | 'holiday' | 'meeting' | 'event' | 'sports'
  location: string
}
