import { ChangeEvent, FormEvent, useEffect, useState } from 'react'
// import { v4 as uuid } from 'uuid'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import ProductCard from './components/ProductCard'
import { categories, formInputsList } from './data'
import Modal from './ui/Modal'
import Button from './ui/Button'
import Input from './ui/Input'
import { IProduct } from './interfaces'
import { productValidation } from './validation'
import ErrorMessage from './components/ErrorMessage'
// import { ColorCircle } from './components/ColorCircle'
import Select from './ui/Select'
import { TProductNames } from './types'
import { Helmet } from 'react-helmet'
import useHttp from './hooks/use-http'
// import { findCategoryIndex } from "./utils";

function App() {
  const defaultProductObj = {
    title: '',
    description: '',
    images: [],
    imageURL: '',
    price: '',
    category: {
      name: '',
      imageURL: '',
    },
    state: '',
    brand: '',
  }
  const { sendData } = useHttp()
  /*~~~~~~~~$ states $~~~~~~~~*/
  const [isOpenModal, setIsOpenModal] = useState(false)
  const [isOpenEditModal, setIsOpenEditModal] = useState(false)
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false)
  const [products, setProducts] = useState<IProduct[]>([])
  const [product, setProduct] = useState<IProduct>(defaultProductObj)
  const [errors, setErrors] = useState({
    title: '',
    description: '',
    imageURL: '',
    price: '',
    state: '',
    brand: '',
  })
  const [selectedCategory, setSelectedCategory] = useState(categories[0])
  const [productIndex, setProductIndex] = useState<number>(0)
  const [editProduct, setEditProduct] = useState<IProduct>(defaultProductObj)
  const [searchKeyword, setSearchKeyword] = useState('')

  useEffect(() => {
    const options = {
      method: 'GET',
    }

    sendData<{ products: IProduct }[]>('products', options, (res, err) => {
      if (!err && res) {
        setProducts(res?.products)
      }
    })
  }, [sendData])

  /*~~~~~~~~$ all notifications $~~~~~~~~*/
  const notification = (message: string) => {
    toast.success(message, {
      position: 'top-right',
      autoClose: 1500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'light',
      // transition: Slide,
    })
  }

  /*~~~~~~~~$ handlers $~~~~~~~~*/
  const openModal = () => {
    setIsOpenModal(true)
  }

  const closeModal = () => {
    setIsOpenModal(false)
  }

  const openEditModal = () => {
    setIsOpenEditModal(true)
  }

  const closeEditModal = () => {
    setIsOpenEditModal(false)
  }

  const openDeleteModal = () => {
    setIsOpenDeleteModal(true)
  }

  const closeDeleteModal = () => {
    setIsOpenDeleteModal(false)
  }

  const cancelHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault() // ! Prevent default form submission
    setProduct(defaultProductObj)
    closeModal()
    closeEditModal()
  }

  const deleteHandler = () => {
    const filteredProduct = products.filter(
      (product) => product._id !== editProduct._id
    )
    const options = {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    }
    sendData(`admin/remove-product/${editProduct._id}`, options, () => {
      setProducts(filteredProduct)
      closeDeleteModal()
      notification('Product deleted successfully !')
    })
  }

  const onChangeSearchHandler = (even: ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(even.target.value.toLowerCase())
  }

  const onChangeHandler = (even: ChangeEvent<HTMLInputElement>) => {
    const { value, name } = even.target
    setProduct({
      ...product,
      [name]: value,
    })
    setErrors({
      ...errors,
      [name]: '',
    })
  }

  const onImageChangeHandler = (even: ChangeEvent<HTMLInputElement>) => {
    const { files, name } = even.target

    setProduct({
      ...product,
      [name]: files,
    })
    setErrors({
      ...errors,
      [name]: '',
    })
  }

  const eidtOnChangeHandler = (even: ChangeEvent<HTMLInputElement>) => {
    const { value, name } = even.target
    setEditProduct({
      ...editProduct,
      [name]: value,
    })
    setErrors({
      ...errors,
      [name]: '',
    })
  }

  const eidtImageOnChangeHandler = (even: ChangeEvent<HTMLInputElement>) => {
    const { files, name } = even.target
    setEditProduct({
      ...editProduct,
      [name]: files,
    })

    console.log(files, name)

    setErrors({
      ...errors,
      [name]: '',
    })
  }

  const submitHandler = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    /*~~~~~~~~$ old way $~~~~~~~~*/
    // const errors = productValidation({
    //   title: product.title,
    //   describtion: product.description,
    //   imageURL: product.imageURL,
    //   price: product.price,
    // });

    /*~~~~~~~~$ modern way (ES6) "if key == value then you can write just the key" $~~~~~~~~*/
    const {
      title,
      description,
      imageURL: images,
      price,
      state,
      brand,
    } = product

    const formData = new FormData()
    const errors = productValidation({
      title,
      description,
      imageURL: images && images[0],
      price,
      state,
      brand,
    })

    formData.append('title', title)
    formData.append('description', description)
    formData.append('price', price)
    formData.append('brand', brand)

    Array.from(images).forEach((img) => {
      formData.append('imageURl', img)
    })

    formData.append('category', JSON.stringify(selectedCategory))
    formData.append('state', state)

    /*~~~~~~~~$ make sure there is` no error $~~~~~~~~*/
    const errorMsg =
      Object.values(errors).some((value) => value === '') &&
      Object.values(errors).every((value) => value === '')

    if (!errorMsg) {
      setErrors(errors)
      // ? check if user choose a color
      // if (!tempColorCircle.length) setIsTempColorCircle(false)
      return
    }

    // add new item
    const options = {
      method: 'POST',
      body: formData,
    }

    sendData<IProduct>('admin/add-product', options, (res, err) => {
      if (!err && res) {
        setProducts((prev: IProduct[]) => {
          return [...prev, res]
        })
      }
    })

    // clear form inputs
    setProduct(defaultProductObj)

    // clear circle colors temp
    // setTempColorCircle([])

    // close modal
    closeModal()

    // sucess notification
    notification('product added successfully !')
  }

  const editSubmitHandler = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    /*~~~~~~~~$ modern way (ES6) "if key == value then you can write just the key" $~~~~~~~~*/
    const { title, description, imageURL, price, state, brand } = editProduct
    // const category =

    const formData = new FormData()
    const editedProduct = {
      ...editProduct,
      category: {
        name: editProduct.category.name,
        imageURL: editProduct.category.imageURL,
      },
    }

    /*~~~~~~~~$ make sure there is no error $~~~~~~~~*/
    const errors = productValidation({
      title,
      description,
      imageURL,
      price,
      state,
      brand,
    })
    const errorMsg =
      Object.values(errors).some((value) => value === '') &&
      Object.values(errors).every((value) => value === '')

    if (!errorMsg) {
      setErrors(errors)
      // ? check if user choose a color
      // if (!tempColorCircle.length) setIsTempColorCircle(false)
      return
    }
    formData.append('title', editedProduct.title)
    formData.append('imageURl', editedProduct.imageURL[0])
    formData.append('description', editedProduct.description)
    formData.append('price', editedProduct.price)
    formData.append('category', JSON.stringify(editedProduct.category))
    formData.append('state', editedProduct.state)
    formData.append('brand', editedProduct.brand)

    // const updatedProducts = [...products] // here updatedProducts instead of product

    const options = {
      method: 'PUT',
      body: formData,
    }
    sendData<IProduct>(
      `admin/update-product/${editedProduct._id}`,
      options,
      (res, err) => {
        if (!err && res) {
          setProducts((prev) => {
            const updatedProducts = [...prev] // here updatedProducts instead of product
            updatedProducts[productIndex] = res
            return updatedProducts
          })
          // clear form inputs
          setEditProduct(defaultProductObj)

          // close modal
          closeEditModal()

          // update message
          notification('product updated successfully !')
        }
      }
    )
  }

  /*~~~~~~~~$ all renders $~~~~~~~~*/
  const renderProductCard = products
    .filter((product) =>
      searchKeyword === ''
        ? product
        : product.title.toLowerCase().includes(searchKeyword)
    )
    .map((product, index) => (
      <ProductCard
        key={product._id}
        product={product}
        category={product.category}
        productIndex={index}
        setProductIndex={setProductIndex}
        openEditModal={openEditModal}
        openDeleteModal={openDeleteModal}
        setEditProduct={setEditProduct}
      />
    ))

  const renderFormInputs = formInputsList.map((input) => (
    <div key={input.id} className='flex flex-col'>
      <label className='text-lg' htmlFor={input.id}>
        {input.label}
      </label>
      {input.name === 'imageURL' ? (
        <Input
          type={input.type}
          name={input.name}
          id={input.id}
          multiple={true}
          // value={product[input.name]}
          onChange={onImageChangeHandler}
        />
      ) : (
        <Input
          type={input.type}
          name={input.name}
          id={input.id}
          value={product[input.name]}
          onChange={onChangeHandler}
        />
      )}
      <ErrorMessage message={errors[input.name]} />
    </div>
  ))

  const renderFormInputsWhileEditing = (
    id: string,
    label: string,
    name: TProductNames
    // image: boolean = true
  ) => {
    return (
      <>
        <Helmet>
          <title>Product Dashboard</title>
          <meta name='description' content='product dashboard crud system' />
          <meta name='viewport' content='width=device-width, initial-scale=1' />
          <link rel='icon' href='/public/images/categories/polo.webp' />
        </Helmet>

        <div className='flex flex-col'>
          <label className='text-lg capitalize' htmlFor={id}>
            {`edit product ${label}`}
          </label>
          {name === 'imageURL' ? (
            <Input
              type='file'
              name={name}
              id={id}
              multiple={true}
              onChange={eidtImageOnChangeHandler}
            />
          ) : (
            <Input
              type='text'
              name={name}
              id={id}
              value={editProduct[name]}
              onChange={eidtOnChangeHandler}
            />
          )}
          <ErrorMessage message={errors[name]} />
        </div>
      </>
    )
  }

  return (
    <>
      <main className='p-5 lg:px-12 xl:px-24'>
        {/*~~~~~~~~$ add product button $~~~~~~~~*/}
        <div className='w-2/3 mx-auto my-10 flex flex-col gap-4 md:w-1/3'>
          <Button
            className='bg-[#222] order-1'
            width='w-full'
            title='add product'
            onClick={openModal}
          />

          {/*~~~~~~~~$ search box $~~~~~~~~*/}
          <div className='w-full flex items-center border-2 border-[#222] rounded-md'>
            <div className='flex items-center'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                strokeWidth={1.5}
                stroke='currentColor'
                className='w-10 h-10 p-2'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z'
                />
              </svg>

              <div className='w-[2px] h-6 bg-[#222] rounded-full' />
            </div>

            <div>
              <label htmlFor='search' className='hidden'>
                enter search key word
              </label>
              <Input
                type='text'
                id='search'
                className='border-none outline-none focus:outline-none'
                onChange={onChangeSearchHandler}
                placeholder='search by keyword'
              />
            </div>
          </div>
        </div>

        {/*~~~~~~~~$ display products $~~~~~~~~*/}
        <div className='flex flex-wrap items-center justify-center gap-6'>
          {renderProductCard}
        </div>

        {/*~~~~~~~~$ add a new product modal $~~~~~~~~*/}
        <Modal
          title='add a new product'
          isOpen={isOpenModal}
          closeModal={closeModal}
        >
          <form className='flex flex-col space-y-3' onSubmit={submitHandler}>
            {renderFormInputs}

            <Select
              selected={selectedCategory}
              setSelected={setSelectedCategory}
            />

            {/*~~~~~~~~$ modal buttons $~~~~~~~~*/}
            <div className='flex space-x-3 mt-4'>
              <Button className='bg-blue-600' title='submit' />
              <Button
                className='bg-red-600'
                title='cancel'
                onClick={cancelHandler}
              />
            </div>
          </form>
        </Modal>

        {/*~~~~~~~~$ edit product modal $~~~~~~~~*/}
        <Modal
          title='edit this product'
          isOpen={isOpenEditModal}
          closeModal={closeEditModal}
        >
          <form
            className='flex flex-col space-y-3'
            onSubmit={editSubmitHandler}
          >
            {renderFormInputsWhileEditing('title', 'title', 'title')}
            {renderFormInputsWhileEditing(
              'description',
              'description',
              'description'
            )}
            {renderFormInputsWhileEditing('state', 'state', 'state')}
            {renderFormInputsWhileEditing('brand', 'brand', 'brand')}
            {renderFormInputsWhileEditing('imageURL', 'imageURL', 'imageURL')}
            {renderFormInputsWhileEditing('price', 'price', 'price')}

            <Select
              selected={editProduct.category}
              setSelected={(value) =>
                setEditProduct({ ...editProduct, category: value })
              }
            />

            {/*~~~~~~~~$ modal buttons $~~~~~~~~*/}
            <div className='flex space-x-3 mt-4'>
              <Button className='bg-blue-600' title='submit' />
              <Button
                className='bg-red-600'
                title='cancel'
                onClick={cancelHandler}
              />
            </div>
          </form>
        </Modal>

        {/*~~~~~~~~$ delete product modal $~~~~~~~~*/}
        <Modal
          title='Are you sure you want to remove this Product from your Store?'
          desc='Deleting this product will remove it permanently from your inventory. Any associated data, sales history, and other related information will also be deleted. Please make sure this is the intended action.'
          isOpen={isOpenDeleteModal}
          closeModal={closeDeleteModal}
        >
          {/*~~~~~~~~$ modal buttons $~~~~~~~~*/}
          <div className='flex space-x-3 mt-4'>
            <Button
              className='bg-red-600'
              title='yes, delete'
              onClick={deleteHandler}
            />
            <Button
              className='bg-gray-400'
              title='cancel'
              onClick={closeDeleteModal}
            />
          </div>
        </Modal>

        <ToastContainer
          theme='colored'
          position='top-right'
          autoClose={1500}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </main>
    </>
  )
}

export default App
