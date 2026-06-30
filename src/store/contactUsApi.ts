import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState as IRootState } from '@/store'

export interface IContactUs {
  _id: string
  content: string
  updatedAt: string
}

interface ContactUsResponse {
  success: boolean
  statusCode: number
  message: string
  data: IContactUs
}

export const contactUsApi = createApi({
  reducerPath: 'contactUsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:8080/v1/api',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as IRootState).auth?.token
      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: ['contactUs'],
  endpoints: (builder) => ({
    getContactUs: builder.query<IContactUs, void>({
      query: () => '/contact-us',
      transformResponse: (response: ContactUsResponse) => response.data,
      providesTags: ['contactUs'],
    }),

    updateContactUs: builder.mutation<IContactUs, { content: string }>({
      query: (data) => ({
        url: '/contact-us',
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: ContactUsResponse) => response.data,
      invalidatesTags: ['contactUs'],
    }),
  }),
})

export const { useGetContactUsQuery, useUpdateContactUsMutation } = contactUsApi
