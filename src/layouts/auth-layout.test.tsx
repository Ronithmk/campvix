import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AuthLayout } from './auth-layout'

describe('AuthLayout', () => {
  it('renders the title, subtitle, and children', () => {
    render(
      <AuthLayout title="Welcome back" subtitle="Sign in to continue">
        <div>Form content</div>
      </AuthLayout>,
    )

    expect(screen.getByRole('heading', { name: 'Welcome back' })).toBeInTheDocument()
    expect(screen.getByText('Sign in to continue')).toBeInTheDocument()
    expect(screen.getByText('Form content')).toBeInTheDocument()
  })

  it('renders the marketing highlights panel', () => {
    render(
      <AuthLayout title="Title" subtitle="Subtitle">
        <div />
      </AuthLayout>,
    )

    expect(screen.getByText(/real-time attendance, fees, and academic insights/i)).toBeInTheDocument()
    expect(screen.getByText(/enterprise-grade security/i)).toBeInTheDocument()
    expect(screen.getByText(/ai-assisted reporting/i)).toBeInTheDocument()
  })
})
