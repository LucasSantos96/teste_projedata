import { apiRequest } from './api'
import type { ProductionSuggestion, ProductionSummary } from '../types/production'

const PRODUCTION_SUGGESTIONS_ENDPOINT = '/production-suggestions'

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

function mapSuggestion(item: unknown, index: number): ProductionSuggestion {
  const data = asRecord(item)

  const productId = (data.productId ??
    data.product_id ??
    data.id ??
    `product-${index + 1}`) as string | number

  const productCode = asString(data.productCode ?? data.product_code ?? data.code, `PRD-${index + 1}`)
  const productName = asString(data.productName ?? data.product_name ?? data.name, 'Unnamed Product')
  const productPrice = asNumber(data.productPrice ?? data.product_price ?? data.price)
  const producibleQuantity = asNumber(
    data.producibleQuantity ?? data.producible_quantity ?? data.quantityPossible ?? data.quantity,
  )
  const totalValue = asNumber(
    data.totalValue ?? data.total_value ?? data.total ?? productPrice * producibleQuantity,
  )

  return {
    productId,
    productCode,
    productName,
    productPrice,
    producibleQuantity,
    totalValue,
  }
}

function extractSuggestions(payload: unknown): ProductionSuggestion[] {
  if (Array.isArray(payload)) {
    return payload.map(mapSuggestion)
  }

  const data = asRecord(payload)
  const candidates = [data.suggestions, data.items, data.data]

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate.map(mapSuggestion)
    }
  }

  return []
}

export async function getSuggestions(): Promise<ProductionSummary> {
  const response = await apiRequest<unknown>(PRODUCTION_SUGGESTIONS_ENDPOINT)
  const data = asRecord(response)
  const suggestions = extractSuggestions(response)

  const apiGrandTotal = asNumber(data.grandTotalValue ?? data.grand_total_value ?? data.totalValue)
  const grandTotalValue =
    apiGrandTotal || suggestions.reduce((sum, suggestion) => sum + suggestion.totalValue, 0)

  return {
    suggestions,
    grandTotalValue,
  }
}
