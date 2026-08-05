import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useActiveSchool, useActiveSchoolId } from './use-active-school'
import { useAuthStore } from '@/store/auth-store'
import { schools } from '@/mock/schools'

beforeEach(() => {
  localStorage.clear()
  useAuthStore.getState().logout()
})

function ProbeId() {
  const id = useActiveSchoolId()
  return <div data-testid="school-id">{id}</div>
}

function ProbeSchool() {
  const school = useActiveSchool()
  return <div data-testid="school-name">{school.name}</div>
}

describe('useActiveSchoolId', () => {
  it('falls back to the first school id when the store has no schoolId', () => {
    useAuthStore.setState({ schoolId: null })
    render(<ProbeId />)
    expect(screen.getByTestId('school-id')).toHaveTextContent(schools[0].id)
  })

  it('returns the schoolId from the auth store when set', () => {
    useAuthStore.setState({ schoolId: schools[1].id })
    render(<ProbeId />)
    expect(screen.getByTestId('school-id')).toHaveTextContent(schools[1].id)
  })
})

describe('useActiveSchool', () => {
  it('resolves the full School object matching the active schoolId', () => {
    useAuthStore.setState({ schoolId: schools[2].id })
    render(<ProbeSchool />)
    expect(screen.getByTestId('school-name')).toHaveTextContent(schools[2].name)
  })

  it('falls back to the first school if schoolId does not match any known school', () => {
    useAuthStore.setState({ schoolId: 'not-a-real-school-id' })
    render(<ProbeSchool />)
    expect(screen.getByTestId('school-name')).toHaveTextContent(schools[0].name)
  })
})
