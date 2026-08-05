import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TransportPage from './transport'
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
const totalCapacity = schoolRoutes.reduce((sum, r) => sum + r.capacity, 0)
const totalOccupied = schoolRoutes.reduce((sum, r) => sum + r.occupied, 0)
const onRoute = schoolRoutes.filter((r) => r.status === 'on_route').length

describe('TransportPage', () => {
  it('renders for administrator with stat cards matching the underlying mock data', () => {
    useAuthStore.getState().loginAsRole('administrator')
    render(<TransportPage />)

    expect(screen.getByRole('heading', { name: 'Transport' })).toBeInTheDocument()
    expect(screen.getByText(String(schoolRoutes.length))).toBeInTheDocument()
    expect(screen.getByText(String(onRoute))).toBeInTheDocument()
    expect(screen.getByText(String(totalOccupied))).toBeInTheDocument()
    const expectedUtilization = totalCapacity ? `${Math.round((totalOccupied / totalCapacity) * 100)}%` : '0%'
    expect(screen.getByText(expectedUtilization)).toBeInTheDocument()
  })

  it('shows a route card for every route belonging to the active school', () => {
    useAuthStore.getState().loginAsRole('administrator')
    render(<TransportPage />)

    for (const route of schoolRoutes) {
      expect(screen.getByText(route.name)).toBeInTheDocument()
      expect(screen.getByText(route.driverName)).toBeInTheDocument()
    }
  })

  it('adds a new route scoped to the current school', async () => {
    const user = userEvent.setup()
    useAuthStore.getState().loginAsRole('administrator')
    render(<TransportPage />)

    await user.click(screen.getByRole('button', { name: /add route/i }))
    const dialog = screen.getByRole('dialog')

    await user.type(screen.getByLabelText(/route name/i), 'Route Z - Automated')
    await user.type(screen.getByLabelText(/vehicle number/i), 'KA-09-ZZ-9999')
    await user.type(screen.getByLabelText(/driver name/i), 'QA Bot')
    const capacityInput = screen.getByLabelText(/capacity/i)
    await user.clear(capacityInput)
    await user.type(capacityInput, '45')
    await user.click(within(dialog).getByRole('button', { name: /^add route$/i }))

    expect(await screen.findByText('Route Z - Automated')).toBeInTheDocument()
    expect(screen.getByText('QA Bot')).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('deletes a route after confirming the delete dialog, removing its card', async () => {
    const user = userEvent.setup()
    useAuthStore.getState().loginAsRole('administrator')
    render(<TransportPage />)

    const target = schoolRoutes[0]
    const card = screen.getByText(target.name).closest('[class*="transition-shadow"]') as HTMLElement
    expect(card).toBeTruthy()

    await user.click(within(card).getByRole('button'))
    expect(await screen.findByText(/delete this route\?/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /^delete$/i }))

    expect(screen.queryByText(target.name)).not.toBeInTheDocument()
  })
})
