import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithAuth } from '@/store/baseQueryWithAuth'

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
  baseQuery: baseQueryWithAuth,
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
