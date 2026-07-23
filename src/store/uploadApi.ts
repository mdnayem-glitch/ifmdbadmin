import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithAuth } from '@/store/baseQueryWithAuth'

interface UploadSingleResponse {
  success: boolean
  statusCode: number
  message: string
  data: {
    url: string
    filename: string
    originalname: string
    mimetype: string
    size: number
  }
}

export const uploadApi = createApi({
  reducerPath: 'uploadApi',
  baseQuery: baseQueryWithAuth,
  endpoints: (builder) => ({
    uploadSingle: builder.mutation<string, File>({
      query: (file) => {
        const formData = new FormData()
        formData.append('image', file)
        return {
          url: '/upload/single',
          method: 'POST',
          body: formData,
        }
      },
      transformResponse: (response: UploadSingleResponse) => response.data.url,
    }),
  }),
})

export const { useUploadSingleMutation } = uploadApi
