export interface RawMaterial {
  id: string | number
  code: string
  name: string
  stockQuantity: number
}

export interface RawMaterialPayload {
  code: string
  name: string
  stockQuantity: number
}
