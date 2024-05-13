import { useCallback, useState } from 'react'

type optionsType = {
  method?: string
  body?: string | FormData
  headers?: { 'Content-Type'?: string; Authorization?: string }
}

const useHttp = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>('')

  const sendData = useCallback(async function <responseType>(
    endpoint: string,
    options: optionsType,
    successHandler: (data?: responseType, err?: Error) => void
  ) {
    setIsLoading(true)
    try {
      const url = (import.meta.env.VITE_SERVER_API || '') + endpoint
      const response = await fetch(url, options)
      const data = await response.json()
      if (response.ok) {
        successHandler(data)
      } else {
        const error = new Error(data.message)
        throw error
      }
    } catch (err) {
      if (err instanceof Error){
        successHandler(undefined, err)
        setErrorMessage(err.message)
      } 
    }

    setIsLoading(false)
  },
  [])

  return { sendData, isLoading, errorMessage, setErrorMessage }
}

export default useHttp
