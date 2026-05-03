import { ExportFormat } from '@prisma/client'

import { prisma } from '../lib/prisma.js'
import { getSupabaseAdmin } from '../lib/supabase.js'
import { assertLocalOwnership } from './local.service.js'
import { AppError } from '../utils/AppError.js'

const BUCKET_NAME = 'price-lists'

type PriceListDto = {
  id: string
  localId: string
  format: 'PNG'
  fileUrl: string | null
  sharedVia: string | null
  createdAt: string
}

function serializePriceList(row: {
  id: string
  localId: string
  fileUrl: string | null
  sharedVia: string | null
  createdAt: Date
}): PriceListDto {
  return {
    id: row.id,
    localId: row.localId,
    format: 'PNG',
    fileUrl: row.fileUrl,
    sharedVia: row.sharedVia,
    createdAt: row.createdAt.toISOString(),
  }
}

async function ensureBucketExists(): Promise<void> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.storage.getBucket(BUCKET_NAME)
  if (!error && data) return

  const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
    public: true,
    fileSizeLimit: 5 * 1024 * 1024,
    allowedMimeTypes: ['image/png'],
  })

  // Si ya existe por carrera entre requests, no debe cortar el flujo.
  if (
    createError &&
    !createError.message.toLowerCase().includes('already exists')
  ) {
    throw new AppError({
      statusCode: 502,
      message: `No se pudo crear bucket ${BUCKET_NAME}: ${createError.message}`,
      code: 'STORAGE_BUCKET_CREATE_FAILED',
    })
  }
}

export async function uploadPriceListPng(input: {
  userId: string
  localId: string
  fileBuffer: Buffer
  mimeType: string
  sharedVia?: string | null
}): Promise<PriceListDto> {
  await assertLocalOwnership(input.userId, input.localId)

  if (input.mimeType !== 'image/png' && input.mimeType !== 'application/octet-stream') {
    throw new AppError({
      statusCode: 400,
      message: 'El archivo debe ser PNG',
      code: 'INVALID_FILE_TYPE',
    })
  }

  const filePath = `${input.userId}/${input.localId}/${Date.now()}.png`
  const supabase = getSupabaseAdmin()
  await ensureBucketExists()

  let { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, input.fileBuffer, {
      contentType: 'image/png',
      upsert: false,
    })

  if (uploadError?.message.toLowerCase().includes('bucket not found')) {
    await ensureBucketExists()
    const retry = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, input.fileBuffer, {
        contentType: 'image/png',
        upsert: false,
      })
    uploadError = retry.error
  }

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

  return serializePriceList(row)
}

export async function getLatestPriceListForUser(userId: string): Promise<{
  priceList: PriceListDto
  localName: string
} | null> {
  const row = await prisma.priceList.findFirst({
    where: {
      local: { userId, isActive: true },
    },
    include: {
      local: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  if (!row) return null

  return {
    priceList: serializePriceList(row),
    localName: row.local.name,
  }
}
