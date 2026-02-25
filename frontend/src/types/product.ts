export interface Product {
  id: string | number
  code: string
  name: string
  price: number
}

export interface ProductPayload {
  code: string
  name: string
  price: number
}
