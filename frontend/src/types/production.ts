export interface ProductionSuggestion {
  productId: string | number
  productCode: string
  productName: string
  productPrice: number
  producibleQuantity: number
  totalValue: number
}

export interface ProductionSummary {
  suggestions: ProductionSuggestion[]
  grandTotalValue: number
  totalProductsAnalyzed: number
}
