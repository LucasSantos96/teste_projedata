import { apiRequest } from './api'
import type { RawMaterial, RawMaterialPayload } from '../types/rawMaterial'

const RAW_MATERIALS_ENDPOINT = '/raw-materials'

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

function mapRawMaterial(item: unknown, index: number): RawMaterial {
  const data = asRecord(item)
  const fallbackId = `raw-material-${index + 1}`

  return {
    id: (data.id ?? data.rawMaterialId ?? fallbackId) as string | number,
    code: asString(data.code ?? data.rawMaterialCode, `RM-${index + 1}`),
    name: asString(data.name ?? data.rawMaterialName, 'Unnamed Raw Material'),
    stockQuantity: asNumber(
      data.stockQuantity ?? data.stock_quantity ?? data.quantityInStock ?? data.quantity,
    ),
  }
}

function extractList(payload: unknown): unknown[] {
  if (Array.isArray(payload)) {
    return payload
  }

  const data = asRecord(payload)
  const candidates = [data.items, data.data, data.rawMaterials]

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
  return data.item ?? data.data ?? data.rawMaterial ?? payload
}

export async function list(): Promise<RawMaterial[]> {
  const response = await apiRequest<unknown>(RAW_MATERIALS_ENDPOINT)
  return extractList(response).map(mapRawMaterial)
}

export async function create(payload: RawMaterialPayload): Promise<RawMaterial> {
  const response = await apiRequest<unknown>(RAW_MATERIALS_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  return mapRawMaterial(extractEntity(response), 0)
}

export async function update(id: RawMaterial['id'], payload: RawMaterialPayload): Promise<RawMaterial> {
  const response = await apiRequest<unknown>(`${RAW_MATERIALS_ENDPOINT}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })

  return mapRawMaterial(extractEntity(response), 0)
}

export async function remove(id: RawMaterial['id']): Promise<void> {
  await apiRequest<unknown>(`${RAW_MATERIALS_ENDPOINT}/${id}`, {
    method: 'DELETE',
  })
}
