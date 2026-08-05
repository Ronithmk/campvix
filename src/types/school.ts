export type SubscriptionPlan = 'starter' | 'growth' | 'enterprise'

export interface School {
  id: string
  name: string
  slug: string
  logoUrl: string
  city: string
  country: string
  primaryColor: string
  plan: SubscriptionPlan
  studentCount: number
  establishedYear: number
}
