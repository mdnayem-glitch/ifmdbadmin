import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { RootState as IRootState } from '@/store'

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
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:8080/v1/api',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as IRootState).auth?.token
      if (token) headers.set('Authorization', `Bearer ${token}`)
      return headers
    },
  }),
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
