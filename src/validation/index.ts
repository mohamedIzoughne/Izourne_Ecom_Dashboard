interface IProductValidation {
  title: string
  description: string
  imageURL: string
  price: string
  state: string
  brand: string
}

export const productValidation = (product: IProductValidation) => {
  // const onlineImageURL = /^(ftp|http|https):\/\/[^ "]+$/
  // const regex =
  //   /^(ftp|http|https):\/\/\S+\.(?:webp)(?:\?[\S]*)?$|^\/images\/(?:items|categories)\/\S+\.(?:webp)(?:\?[\S]*)?$/
  // const validUrl =
  //   regex.test(product.imageURL) || onlineImageURL.test(product.imageURL)
  const errors: IProductValidation = {
    title: '',
    description: '',
    imageURL: '',
    price: '',
    state: '',
    brand: '',
  }
  if (!product.title.trim()) {
    errors.title = 'Product title is required!'
  } else if (product.title.length < 4 || product.title.length > 50) {
    errors.title = 'Product title must be between 4 and 50 characters!'
  }

  if (!product.description.trim()) {
    errors.description = 'Product description is required!'
  } else if (
    product.description.length < 8 ||
    product.description.length > 500
  ) {
    errors.description =
      'Product description must be between 8 and 500 characters!'
  }

  if (!product.price.toString().trim()) {
    errors.price = 'Product price is required!'
  } else if (isNaN(Number(product.price))) {
    errors.price = 'Price must be a number!'
  }

  if (!product.imageURL) {
    errors.imageURL = 'Product image URL is required!'
  }

  if (!product.state) {
    errors.state = 'Product state is required!'
  }

  if (!product.brand) {
    errors.state = 'Product brand is required!'
  }

  return errors
}

export function stringValidator(value: string): boolean {
  const regex = /^[(a-zA-Z\u0600-\u06FF)]+(?: [a-zA-Z\u0600-\u06FF',.-]+)*$/

  return regex.test(value)
}
