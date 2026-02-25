import { apiRequest } from './api'
import type { ProductComposition, ProductCompositionPayload } from '../types/composition'
import type { ApiError } from './api'

export const compositionApiCapabilities = {
  listByProduct: true,
  update: true,
  remove: true,
} as const

const COMPOSITION_ENDPOINTS = {
  listByProduct: (productId: string | number) => `/products/${productId}/raw-materials`,
  createByProduct: (productId: string | number) => `/products/${productId}/raw-materials`,
  updateByProduct: (productId: string | number, compositionId: string | number) =>
    `/products/${productId}/raw-materials/${compositionId}`,
  deleteByProduct: (productId: string | number, compositionId: string | number) =>
    `/products/${productId}/raw-materials/${compositionId}`,
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
}

function asNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }

  return 0
}

function asString(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value : fallback
}

function mapComposition(
  item: unknown,
  index: number,
  fallbackProductId: string | number,
): ProductComposition {
  const data = asRecord(item)
  const rawMaterialId = (data.rawMaterialId ??
    data.raw_material_id ??
    data.materialId ??
    data.material_id ??
    `raw-material-${index + 1}`) as string | number

  const id = (data.id ??
    data.compositionId ??
    data.productRawMaterialId ??
    `${fallbackProductId}-${rawMaterialId}`) as string | number

  return {
    id,
    productId: (data.productId ?? data.product_id ?? fallbackProductId) as string | number,
    rawMaterialId,
    rawMaterialCode: asString(
      data.rawMaterialCode ?? data.raw_material_code ?? data.materialCode ?? data.code,
      `RM-${index + 1}`,
    ),
    rawMaterialName: asString(
      data.rawMaterialName ?? data.raw_material_name ?? data.materialName ?? data.name,
      'Unnamed Raw Material',
    ),
    requiredQuantity: asNumber(
      data.requiredQuantity ??
        data.quantityRequired ??
        data.required_quantity ??
        data.quantity ??
        data.amount,
    ),
  }
}

function extractList(payload: unknown): unknown[] {
  if (Array.isArray(payload)) {
    return payload
  }

  const data = asRecord(payload)
  const candidates = [data.items, data.data, data.compositions, data.materials]

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate
    }
  }

  return []
}

function extractEntity(payload: unknown): unknown {
  if (!payload || typeof payload !== 'object') {
    return payload
  }

  const data = asRecord(payload)
  return data.item ?? data.data ?? data.composition ?? payload
}

export async function listByProduct(productId: string | number): Promise<ProductComposition[]> {
  try {
    const response = await apiRequest<unknown>(COMPOSITION_ENDPOINTS.listByProduct(productId))
    return extractList(response).map((item, index) => mapComposition(item, index, productId))
  } catch (error) {
    const apiError = error as ApiError

    if (apiError?.status === 404 || apiError?.status === 405) {
      return []
    }

    throw error
  }
}

export async function create(
  productId: string | number,
  payload: ProductCompositionPayload,
): Promise<ProductComposition> {
  const response = await apiRequest<unknown>(COMPOSITION_ENDPOINTS.createByProduct(productId), {
    method: 'POST',
    body: JSON.stringify({
      rawMaterialId: payload.rawMaterialId,
      quantityRequired: payload.requiredQuantity,
    }),
  })

  return mapComposition(extractEntity(response), 0, productId)
}

export async function update(
  productId: string | number,
  compositionId: string | number,
  payload: ProductCompositionPayload,
): Promise<ProductComposition> {
  const response = await apiRequest<unknown>(
    COMPOSITION_ENDPOINTS.updateByProduct(productId, compositionId),
    {
      method: 'PUT',
      body: JSON.stringify({
        rawMaterialId: payload.rawMaterialId,
        quantityRequired: payload.requiredQuantity,
      }),
    },
  )

  return mapComposition(extractEntity(response), 0, productId)
}

export async function remove(
  productId: string | number,
  compositionId: string | number,
): Promise<void> {
  await apiRequest<unknown>(COMPOSITION_ENDPOINTS.deleteByProduct(productId, compositionId), {
    method: 'DELETE',
  })
}
