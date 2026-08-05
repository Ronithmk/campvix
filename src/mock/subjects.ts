import type { Subject } from '@/types'

const SUBJECT_DEFS: Array<[string, string, string]> = [
  ['Mathematics', 'MATH', '#2563eb'],
  ['English', 'ENG', '#10b981'],
  ['Science', 'SCI', '#f59e0b'],
  ['Social Studies', 'SOC', '#8b5cf6'],
  ['Computer Science', 'CS', '#0ea5e9'],
  ['Physical Education', 'PE', '#ef4444'],
  ['Art & Design', 'ART', '#ec4899'],
  ['Music', 'MUS', '#14b8a6'],
  ['Hindi', 'HIN', '#f97316'],
  ['Environmental Studies', 'EVS', '#22c55e'],
]

export const subjects: Subject[] = SUBJECT_DEFS.map(([name, code, color], i) => ({
  id: `subj-${i + 1}`,
  name,
  code,
  color,
}))
