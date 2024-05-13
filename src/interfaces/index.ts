import { TProductNames } from '../types'

export interface IProduct {
  // ! id is optional to solve "setEditProduct" state problem (because "defaultProductObj" does not contain "id" key)
  _id?: string
  title: string
  description: string
  images: string[]
  imageURL: string // string[]
  price: string
  category: {
    name: string
    imageURL: string
  }
  // to add
  state: string
  brand: string
}

export interface IFormInput {
  id: string
  name: TProductNames
  label: string
  type: string
}

export interface ICategory {
  id: string
  name: string
  imageURL: string
}
