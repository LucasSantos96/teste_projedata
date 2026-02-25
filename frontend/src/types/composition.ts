export interface ProductComposition {
  id: string | number
  productId: string | number
  rawMaterialId: string | number
  rawMaterialCode: string
  rawMaterialName: string
  requiredQuantity: number
}

export interface ProductCompositionPayload {
  rawMaterialId: string | number
  requiredQuantity: number
}
