import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConfirmDeleteDialog } from './confirm-delete-dialog'

describe('ConfirmDeleteDialog', () => {
  it('is not rendered when open is false', () => {
    render(<ConfirmDeleteDialog open={false} onOpenChange={vi.fn()} onConfirm={vi.fn()} />)
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })

  it('renders default title/description and a Delete confirm button when open', () => {
    render(<ConfirmDeleteDialog open onOpenChange={vi.fn()} onConfirm={vi.fn()} />)
    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
    expect(screen.getByText('Are you sure?')).toBeInTheDocument()
    expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
  })

  it('renders custom title, description, and confirmLabel', () => {
    render(
      <ConfirmDeleteDialog
        open
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
        title="Remove teacher?"
        description="They will lose access immediately."
        confirmLabel="Remove"
      />,
    )
    expect(screen.getByText('Remove teacher?')).toBeInTheDocument()
    expect(screen.getByText('They will lose access immediately.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument()
  })

  it('calls onConfirm then onOpenChange(false) when the confirm button is clicked', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    const onOpenChange = vi.fn()
    render(<ConfirmDeleteDialog open onOpenChange={onOpenChange} onConfirm={onConfirm} />)

    await user.click(screen.getByRole('button', { name: 'Delete' }))

    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('calls onOpenChange(false) but not onConfirm when Cancel is clicked', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    const onOpenChange = vi.fn()
    render(<ConfirmDeleteDialog open onOpenChange={onOpenChange} onConfirm={onConfirm} />)

    const dialog = screen.getByRole('alertdialog')
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }))

    expect(onConfirm).not.toHaveBeenCalled()
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})
