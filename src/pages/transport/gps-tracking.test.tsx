import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import GpsTrackingPage from './gps-tracking'
import { useAuthStore } from '@/store/auth-store'
import { usePermissionsStore } from '@/store/permissions-store'
import { schools } from '@/mock/schools'
import { transportRoutes } from '@/mock/facilities'

beforeEach(() => {
  localStorage.clear()
  usePermissionsStore.getState().resetToDefaults()
  useAuthStore.getState().logout()
})

const school = schools[0]
const schoolRoutes = transportRoutes.filter((r) => r.schoolId === school.id)
const activeRoutes = schoolRoutes.filter((r) => r.status === 'on_route')

describe('GpsTrackingPage', () => {
  it('renders for administrator and lists every route for the active school', () => {
    useAuthStore.getState().loginAsRole('administrator')
    render(<GpsTrackingPage />)

    expect(screen.getByRole('heading', { name: 'GPS Tracking' })).toBeInTheDocument()
    for (const route of schoolRoutes) {
      expect(screen.getByText(route.name)).toBeInTheDocument()
    }
  })

  it('shows the correct count of vehicles currently on route, matching the mock data', () => {
    useAuthStore.getState().loginAsRole('administrator')
    render(<GpsTrackingPage />)

    expect(screen.getByText(`${activeRoutes.length} vehicles on route`, { exact: false })).toBeInTheDocument()
  })

  it('selects a route card on click, highlighting it', async () => {
    const user = userEvent.setup()
    useAuthStore.getState().loginAsRole('administrator')
    render(<GpsTrackingPage />)

    const secondRoute = schoolRoutes[1]
    if (!secondRoute) return // some schools may only have a single route

    const card = screen.getByText(secondRoute.name).closest('[class*="cursor-pointer"]') as HTMLElement
    expect(card).toBeTruthy()
    expect(card.className).not.toMatch(/border-primary/)

    await user.click(card)
    expect(card.className).toMatch(/border-primary/)
  })
})
