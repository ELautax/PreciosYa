import html2canvas from 'html2canvas'
import { useMutation } from '@tanstack/react-query'
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

async function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('No se pudo generar PNG'))
        return
      }
      resolve(blob)
    }, 'image/png')
  })
}

export function useExportPriceList(localId: string) {
  const api = useApiClient()

  return useMutation({
    mutationFn: async (input: {
      target: HTMLElement
      sharedVia?: string
    }): Promise<{ uploaded: UploadedPriceList; blob: Blob; fileName: string }> => {
      const canvas = await html2canvas(input.target, {
        scale: 2,
        backgroundColor: '#ffffff',
      })
      const blob = await canvasToBlob(canvas)
      const fileName = `preciosya-${Date.now()}.png`

      const form = new FormData()
      form.append('localId', localId)
      form.append('sharedVia', input.sharedVia ?? 'web')
      form.append('file', blob, fileName)

      const res = await api.post<ApiSuccess<{ priceList: UploadedPriceList }>>(
        '/api/exports/price-list',
        form,
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
