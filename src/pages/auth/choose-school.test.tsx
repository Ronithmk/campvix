import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import ChooseSchoolPage from './choose-school'
import { useAuthStore } from '@/store/auth-store'
import { schools } from '@/mock/schools'

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/choose-school']}>
      <Routes>
        <Route path="/choose-school" element={<ChooseSchoolPage />} />
        <Route path="/app/dashboard" element={<div>Dashboard content</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  localStorage.clear()
  useAuthStore.getState().logout()
})

describe('ChooseSchoolPage', () => {
  it('lists every school from the mock data', () => {
    renderPage()
    schools.forEach((school) => {
      expect(screen.getByText(school.name)).toBeInTheDocument()
    })
  })

  it('selecting a school updates the auth store and navigates to the dashboard', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByText(schools[1].name))

    expect(useAuthStore.getState().schoolId).toBe(schools[1].id)
    expect(await screen.findByText('Dashboard content')).toBeInTheDocument()
  })
})
