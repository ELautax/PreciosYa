import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const { createMutateAsyncMock, updateMutateAsyncMock } = vi.hoisted(() => ({
  createMutateAsyncMock: vi.fn(),
  updateMutateAsyncMock: vi.fn(),
}))

vi.mock('@/hooks/useCategories', () => ({
  useCategories: () => ({
    data: [{ id: 'cat-1', name: 'Lácteos' }],
  }),
}))

vi.mock('@/hooks/useProducts', () => ({
  useCreateProduct: () => ({
    mutateAsync: createMutateAsyncMock,
    isPending: false,
  }),
  useUpdateProduct: () => ({
    mutateAsync: updateMutateAsyncMock,
    isPending: false,
  }),
}))

import { ProductForm } from './ProductForm'

describe('ProductForm', () => {
  it('envía create con payload normalizado', async () => {
    createMutateAsyncMock.mockResolvedValue({})
    const onClose = vi.fn()
    const user = userEvent.setup()

    const { container } = render(
      <ProductForm
        localId="11111111-1111-4111-8111-111111111111"
        onClose={onClose}
      />,
    )

    const nameInput = container.querySelector<HTMLInputElement>('input[name="name"]')
    const costInput = container.querySelector<HTMLInputElement>('input[name="cost"]')
    const barcodeInput = container.querySelector<HTMLInputElement>('input[name="barcode"]')

    expect(nameInput).not.toBeNull()
    expect(costInput).not.toBeNull()
    expect(barcodeInput).not.toBeNull()

    const nameInputEl = nameInput as HTMLInputElement
    const costInputEl = costInput as HTMLInputElement
    const barcodeInputEl = barcodeInput as HTMLInputElement

    await user.type(nameInputEl, 'Leche')
    await user.clear(costInputEl)
    await user.type(costInputEl, '100')
    await user.type(barcodeInputEl, ' 123 ')

    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() => {
      expect(createMutateAsyncMock).toHaveBeenCalled()
    })
    expect(createMutateAsyncMock).toHaveBeenCalledWith(
      expect.objectContaining({
        localId: '11111111-1111-4111-8111-111111111111',
        name: 'Leche',
        cost: 100,
        barcode: '123',
      }),
    )
    expect(onClose).toHaveBeenCalled()
  })
})
