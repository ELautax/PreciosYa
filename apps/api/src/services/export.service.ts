import { ExportFormat } from '@prisma/client'

import { prisma } from '../lib/prisma.js'
import { getSupabaseAdmin } from '../lib/supabase.js'
import { assertLocalOwnership } from './local.service.js'
import { AppError } from '../utils/AppError.js'

const BUCKET_NAME = 'price-lists'

export async function uploadPriceListPng(input: {
  userId: string
  localId: string
  fileBuffer: Buffer
  mimeType: string
  sharedVia?: string | null
}): Promise<{
  id: string
  localId: string
  format: 'PNG'
  fileUrl: string | null
  sharedVia: string | null
  createdAt: string
}> {
  await assertLocalOwnership(input.userId, input.localId)

  if (input.mimeType !== 'image/png') {
    throw new AppError({
      statusCode: 400,
      message: 'El archivo debe ser PNG',
      code: 'INVALID_FILE_TYPE',
    })
  }

  const filePath = `${input.userId}/${input.localId}/${Date.now()}.png`
  const supabase = getSupabaseAdmin()

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, input.fileBuffer, {
      contentType: 'image/png',
      upsert: false,
    })

  if (uploadError) {
    throw new AppError({
      statusCode: 502,
      message: uploadError.message,
      code: 'STORAGE_UPLOAD_FAILED',
    })
  }

  let fileUrl: string | null = null
  const { data: signedData, error: signedError } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(filePath, 60 * 60 * 24 * 30)

  if (!signedError && signedData?.signedUrl) {
    fileUrl = signedData.signedUrl
  } else {
    const publicData = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath).data
    fileUrl = publicData.publicUrl ?? null
  }

  const row = await prisma.priceList.create({
    data: {
      localId: input.localId,
      format: ExportFormat.PNG,
      fileUrl,
      sharedVia: input.sharedVia ?? null,
    },
  })

  return {
    id: row.id,
    localId: row.localId,
    format: 'PNG',
    fileUrl: row.fileUrl,
    sharedVia: row.sharedVia,
    createdAt: row.createdAt.toISOString(),
  }
}
