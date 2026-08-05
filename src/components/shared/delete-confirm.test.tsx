import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DeleteConfirm } from './delete-confirm'

describe('DeleteConfirm', () => {
  it('does not show the dialog until the trigger is clicked', () => {
    render(
      <DeleteConfirm onConfirm={vi.fn()}>
        <button>Delete</button>
      </DeleteConfirm>,
    )
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })

  it('opens the dialog with default title/description when the trigger child is clicked', async () => {
    const user = userEvent.setup()
    render(
      <DeleteConfirm onConfirm={vi.fn()}>
        <button>Delete</button>
      </DeleteConfirm>,
    )
    await user.click(screen.getByRole('button', { name: 'Delete' }))

    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
    expect(screen.getByText('Are you sure?')).toBeInTheDocument()
    expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument()
  })

  it('renders custom title, description, and confirmLabel', async () => {
    const user = userEvent.setup()
    render(
      <DeleteConfirm onConfirm={vi.fn()} title="Delete this student?" description="This will remove all records." confirmLabel="Remove">
        <button>Trigger</button>
      </DeleteConfirm>,
    )
    await user.click(screen.getByRole('button', { name: 'Trigger' }))

    expect(screen.getByText('Delete this student?')).toBeInTheDocument()
    expect(screen.getByText('This will remove all records.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument()
  })

  it('calls onConfirm when the confirm action is clicked', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    render(
      <DeleteConfirm onConfirm={onConfirm}>
        <button>Open</button>
      </DeleteConfirm>,
    )
    await user.click(screen.getByRole('button', { name: 'Open' }))
    const dialog = screen.getByRole('alertdialog')
    await user.click(within(dialog).getByRole('button', { name: 'Delete' }))

    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('does not call onConfirm and closes the dialog when Cancel is clicked', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    render(
      <DeleteConfirm onConfirm={onConfirm}>
        <button>Open</button>
      </DeleteConfirm>,
    )
    await user.click(screen.getByRole('button', { name: 'Open' }))
    const dialog = screen.getByRole('alertdialog')
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }))

    expect(onConfirm).not.toHaveBeenCalled()
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })
})
