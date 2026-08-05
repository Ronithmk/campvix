import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import GalleryPage from './gallery'
import { useAuthStore } from '@/store/auth-store'
import { usePermissionsStore } from '@/store/permissions-store'
import { schools } from '@/mock/schools'

beforeEach(() => {
  localStorage.clear()
  usePermissionsStore.getState().resetToDefaults()
  useAuthStore.getState().logout()
})

describe('GalleryPage — role-gated album creation', () => {
  it('shows the New Album button for administrator', () => {
    useAuthStore.getState().loginAsRole('administrator')
    render(<GalleryPage />)
    expect(screen.getByRole('button', { name: /^new album$/i })).toBeInTheDocument()
  })

  it('shows the New Album button for teacher', () => {
    useAuthStore.getState().loginAsRole('teacher')
    render(<GalleryPage />)
    expect(screen.getByRole('button', { name: /^new album$/i })).toBeInTheDocument()
  })

  it('hides the New Album button for student', () => {
    useAuthStore.getState().loginAsRole('student')
    render(<GalleryPage />)
    expect(screen.queryByRole('button', { name: /^new album$/i })).not.toBeInTheDocument()
  })

  it('hides the New Album button for parent', () => {
    useAuthStore.getState().loginAsRole('parent')
    render(<GalleryPage />)
    expect(screen.queryByRole('button', { name: /^new album$/i })).not.toBeInTheDocument()
  })

  it('creates a new album scoped to the current school, defaulting to public', async () => {
    const user = userEvent.setup()
    useAuthStore.getState().loginAsRole('teacher')
    render(<GalleryPage />)

    await user.click(screen.getByRole('button', { name: /^new album$/i }))
    await user.type(screen.getByLabelText(/album title/i), 'QA Test Album')
    await user.click(screen.getByRole('button', { name: /create album/i }))

    expect(await screen.findByText('QA Test Album')).toBeInTheDocument()
  })

  it('rejects a title shorter than 2 characters via zod validation', async () => {
    const user = userEvent.setup()
    useAuthStore.getState().loginAsRole('teacher')
    render(<GalleryPage />)

    await user.click(screen.getByRole('button', { name: /^new album$/i }))
    await user.type(screen.getByLabelText(/album title/i), 'A')
    await user.click(screen.getByRole('button', { name: /create album/i }))

    expect(await screen.findByText(/title is required/i)).toBeInTheDocument()
    expect(screen.queryByText('A')).not.toBeInTheDocument()
  })

  it('does not show an album created for one school when viewing another (Architecture #1)', async () => {
    const user = userEvent.setup()
    useAuthStore.getState().loginAsRole('teacher')
    useAuthStore.setState({ schoolId: schools[0].id })
    const { rerender } = render(<GalleryPage />)

    await user.click(screen.getByRole('button', { name: /^new album$/i }))
    await user.type(screen.getByLabelText(/album title/i), 'School A Exclusive Album')
    await user.click(screen.getByRole('button', { name: /create album/i }))
    expect(await screen.findByText('School A Exclusive Album')).toBeInTheDocument()

    useAuthStore.setState({ schoolId: schools[1].id })
    rerender(<GalleryPage />)
    expect(screen.queryByText('School A Exclusive Album')).not.toBeInTheDocument()
  })
})
