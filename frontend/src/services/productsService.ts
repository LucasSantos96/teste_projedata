import { apiRequest } from './api'
import type { Product, ProductPayload } from '../types/product'

const PRODUCTS_ENDPOINT = '/products'

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

function mapProduct(item: unknown, index: number): Product {
  const data = asRecord(item)
  const fallbackId = `product-${index + 1}`

  return {
    id: (data.id ?? data.productId ?? fallbackId) as string | number,
    code: asString(data.code ?? data.productCode, `PRD-${index + 1}`),
    name: asString(data.name ?? data.productName, 'Unnamed Product'),
    price: asNumber(data.price ?? data.productPrice),
  }
}

function extractList(payload: unknown): unknown[] {
  if (Array.isArray(payload)) {
    return payload
  }

  const data = asRecord(payload)
  const candidates = [data.items, data.data, data.products]

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
  return data.item ?? data.data ?? data.product ?? payload
}

export async function list(): Promise<Product[]> {
  const response = await apiRequest<unknown>(PRODUCTS_ENDPOINT)
  return extractList(response).map(mapProduct)
}

export async function create(payload: ProductPayload): Promise<Product> {
  const response = await apiRequest<unknown>(PRODUCTS_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  return mapProduct(extractEntity(response), 0)
}

export async function update(id: Product['id'], payload: ProductPayload): Promise<Product> {
  const response = await apiRequest<unknown>(`${PRODUCTS_ENDPOINT}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })

  return mapProduct(extractEntity(response), 0)
}

export async function remove(id: Product['id']): Promise<void> {
  await apiRequest<unknown>(`${PRODUCTS_ENDPOINT}/${id}`, {
    method: 'DELETE',
  })
}
