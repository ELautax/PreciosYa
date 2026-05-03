import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { toBlob } from 'html-to-image'
import type { ApiSuccess } from 'shared'

import { useApiClient } from '@/hooks/useApiClient'

type UploadedPriceList = {
  id: string
  localId: string
  format: 'PNG'
  fileUrl: string | null
  sharedVia: string | null
  createdAt: string
}

export function useExportPriceList(localId: string) {
  const api = useApiClient()

  return useMutation({
    mutationFn: async (input: {
      target: HTMLElement
      sharedVia?: string
    }): Promise<{ uploaded: UploadedPriceList; blob: Blob; fileName: string }> => {
      const blob = await toBlob(input.target, {
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        cacheBust: true,
      })
      if (!blob) {
        throw new Error('No se pudo generar PNG')
      }
      const fileName = `preciosya-${Date.now()}.png`
      const file = new File([blob], fileName, { type: 'image/png' })

      const form = new FormData()
      form.append('localId', localId)
      form.append('sharedVia', input.sharedVia ?? 'web')
      form.append('file', file)

      const res = await api.post<ApiSuccess<{ priceList: UploadedPriceList }>>(
        '/api/exports/price-list',
        form,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      )

      return {
        uploaded: res.data.data.priceList,
        blob,
        fileName,
      }
    },
  })
}

export async function sharePngIfSupported(
  blob: Blob,
  fileName: string,
): Promise<boolean> {
  if (
    typeof navigator === 'undefined' ||
    typeof navigator.share !== 'function' ||
    typeof window === 'undefined' ||
    typeof File === 'undefined'
  ) {
    return false
  }

  const file = new File([blob], fileName, { type: 'image/png' })
  const canShareFiles =
    'canShare' in navigator &&
    typeof navigator.canShare === 'function' &&
    navigator.canShare({ files: [file] })

  if (!canShareFiles) return false

  await navigator.share({
    files: [file],
    title: 'Lista de precios',
    text: 'Lista de precios generada con PreciosYa',
  })
  return true
}

export function getExportErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.error?.message
    if (typeof message === 'string' && message.trim() !== '') return message
    if (typeof error.message === 'string' && error.message.trim() !== '') return error.message
  }
  if (error instanceof Error) return error.message
  return 'No se pudo exportar'
}
