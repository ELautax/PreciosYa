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

const PNG_CAPTURE_OPTS = {
  pixelRatio: 2,
  backgroundColor: '#ffffff',
  cacheBust: true,
} as const

export async function capturePriceListPng(target: HTMLElement): Promise<{
  blob: Blob
  fileName: string
}> {
  const blob = await toBlob(target, PNG_CAPTURE_OPTS)
  if (!blob) {
    throw new Error('No se pudo generar PNG')
  }
  return { blob, fileName: `preciosya-${Date.now()}.png` }
}

export function useExportPriceList(localId: string) {
  const api = useApiClient()

  return useMutation({
    mutationFn: async (input: {
      target?: HTMLElement
      blob?: Blob
      fileName?: string
      sharedVia?: string
    }): Promise<{ uploaded: UploadedPriceList; blob: Blob; fileName: string }> => {
      let blob = input.blob
      let fileName = input.fileName

      if (!blob || !fileName) {
        if (!input.target) {
          throw new Error('No se pudo generar PNG')
        }
        const captured = await capturePriceListPng(input.target)
        blob = captured.blob
        fileName = captured.fileName
      }

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

function isShareAbortError(error: unknown): boolean {
  if (!(error instanceof Error)) return false
  const name = error.name
  return name === 'AbortError' || name === 'NotAllowedError'
}

export type ShareAttemptResult = 'shared' | 'aborted' | 'unsupported'

/** Intenta el sheet nativo con el PNG. Debe llamarse lo antes posible tras el tap. */
export async function sharePngIfSupported(
  blob: Blob,
  fileName: string,
): Promise<ShareAttemptResult> {
  if (
    typeof navigator === 'undefined' ||
    typeof navigator.share !== 'function' ||
    typeof window === 'undefined' ||
    typeof File === 'undefined'
  ) {
    return 'unsupported'
  }

  const file = new File([blob], fileName, { type: 'image/png' })
  const payload = {
    files: [file],
    title: 'Lista de precios',
    text: 'Lista de precios generada con PreciosYa',
  }

  if (typeof navigator.canShare === 'function' && !navigator.canShare({ files: [file] })) {
    return 'unsupported'
  }

  try {
    await navigator.share(payload)
    return 'shared'
  } catch (error) {
    if (isShareAbortError(error)) return 'aborted'
    return 'unsupported'
  }
}

/** Fallback: compartir enlace público de la lista ya subida. */
export async function shareUrlIfSupported(fileUrl: string): Promise<ShareAttemptResult> {
  if (typeof navigator === 'undefined' || typeof navigator.share !== 'function') {
    return 'unsupported'
  }

  const payload = {
    title: 'Lista de precios',
    text: 'Lista de precios generada con PreciosYa',
    url: fileUrl,
  }

  if (typeof navigator.canShare === 'function' && !navigator.canShare(payload)) {
    return 'unsupported'
  }

  try {
    await navigator.share(payload)
    return 'shared'
  } catch (error) {
    if (isShareAbortError(error)) return 'aborted'
    return 'unsupported'
  }
}

export function openWhatsAppShare(fileUrl: string): void {
  const text = `Lista de precios PreciosYa: ${fileUrl}`
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer')
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
