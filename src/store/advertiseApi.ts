import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState as IRootState } from '@/store'

export interface IAdvertise {
  _id: string
  image: File | string
  link: string
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

interface AdvertiseResponse {
  success: boolean
  statusCode: number
  message: string
  data: IAdvertise | IAdvertise[]
}

export const advertiseApi = createApi({
  reducerPath: 'advertiseApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:8080/v1/api',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as IRootState).auth.token
      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: ['advertise'],
  endpoints: (builder) => ({
    getAdvertise: builder.query<IAdvertise[], void>({
      query: () => '/advertisements',
      transformResponse: (response: AdvertiseResponse) => (Array.isArray(response.data) ? response.data : [response.data]),
      providesTags: ['advertise'],
    }),
    getAdvertiseById: builder.query<IAdvertise, string>({
      query: (id) => `/advertisements/${id}`,
      transformResponse: (response: AdvertiseResponse) => response.data as IAdvertise,
      providesTags: (result, error, id) => [{ type: 'advertise', id }],
    }),
    createAdvertise: builder.mutation<IAdvertise, FormData>({
      query: (formData) => ({
        url: 'advertisements',
        method: 'POST',
        body: formData, // FormData for file upload
        // ⚠️ Do not set Content-Type manually, fetch will set the right multipart/form-data boundary
      }),
      transformResponse: (response: AdvertiseResponse) => response.data as IAdvertise,
      invalidatesTags: ['advertise'],
    }),

    updateAdvertise: builder.mutation<IAdvertise, { id: string; data: FormData }>({
      query: ({ id, data }) => ({
        url: `advertisements/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: AdvertiseResponse) => response.data as IAdvertise,
      invalidatesTags: (result, error, { id }) => [{ type: 'advertise', id }, 'advertise'],
    }),
    deleteAdvertise: builder.mutation<IAdvertise, string>({
      query: (id) => ({
        url: `advertisements/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: AdvertiseResponse) => response.data as IAdvertise,
      invalidatesTags: ['advertise'],
    }),
  }),
})

export const { useGetAdvertiseQuery, useGetAdvertiseByIdQuery, useCreateAdvertiseMutation, useUpdateAdvertiseMutation, useDeleteAdvertiseMutation } =
  advertiseApi
