import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const { bulkMutateAsyncMock, applyIpcMutateAsyncMock } = vi.hoisted(() => ({
  bulkMutateAsyncMock: vi.fn(),
  applyIpcMutateAsyncMock: vi.fn(),
}))

vi.mock('@/hooks/useCategories', () => ({
  useCategories: () => ({
    data: [{ id: 'cat-1', name: 'Lácteos' }],
  }),
}))

vi.mock('@/hooks/useProducts', () => ({
  useBulkUpdate: () => ({
    mutateAsync: bulkMutateAsyncMock,
    isPending: false,
  }),
}))

vi.mock('@/hooks/useLocals', () => ({
  useApplyIpcToLocal: () => ({
    mutateAsync: applyIpcMutateAsyncMock,
    isPending: false,
  }),
}))

import { BulkUpdateModal } from './BulkUpdateModal'

describe('BulkUpdateModal', () => {
  it('deshabilita aplicar IPC cuando no hay IPC disponible', async () => {
    const user = userEvent.setup()
    render(
      <BulkUpdateModal
        localId="11111111-1111-4111-8111-111111111111"
        ipcPct={null}
        onClose={vi.fn()}
      />,
    )

    const ipcButtons = screen.getAllByRole('button', { name: 'Aplicar IPC' })
    await user.click(ipcButtons[0]!)
    const disabledAction = screen
      .getAllByRole('button', { name: 'Aplicar IPC' })
      .find((btn) => btn.hasAttribute('disabled'))
    expect(disabledAction).toBeDefined()
    expect(disabledAction).toBeDisabled()
  })

  it('aplica aumento por porcentaje y muestra resultado', async () => {
    bulkMutateAsyncMock.mockResolvedValue({ updated: 2 })
    const user = userEvent.setup()

    render(
      <BulkUpdateModal
        localId="11111111-1111-4111-8111-111111111111"
        ipcPct={4.2}
        onClose={vi.fn()}
      />,
    )

    await user.type(screen.getByLabelText('Aumento (%)'), '5')
    await user.click(screen.getByRole('button', { name: 'Aplicar aumento' }))

    await waitFor(() => {
      expect(bulkMutateAsyncMock).toHaveBeenCalledWith({
        localId: '11111111-1111-4111-8111-111111111111',
        increasePct: 5,
      })
    })
    expect(screen.getByText('Se actualizaron 2 producto(s).')).toBeInTheDocument()
  })
})
