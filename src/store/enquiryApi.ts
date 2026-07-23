import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithAuth } from '@/store/baseQueryWithAuth'

export interface IEnquiry {
  _id: string
  name: string
  email: string
  phone: string
  purpose: string
  message: string
  createdAt: string
  updatedAt: string
}

interface EnquiryResponse {
  success: boolean
  statusCode: number
  message: string
  data: IEnquiry | IEnquiry[]
}

export const enquiryApi = createApi({
  reducerPath: 'enquiryApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['enquiry'],
  endpoints: (builder) => ({
    getEnquiry: builder.query<IEnquiry[], void>({
      query: () => '/inquiries',
      transformResponse: (response: EnquiryResponse) => (Array.isArray(response.data) ? response.data : [response.data]),
      providesTags: ['enquiry'],
    }),
    delteEnquiry: builder.mutation<IEnquiry, string>({
      query: (id) => ({
        url: `/inquiries/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: EnquiryResponse) => response.data as IEnquiry,
      invalidatesTags: ['enquiry'],
    }),
  }),
})

export const { useGetEnquiryQuery, useDelteEnquiryMutation } = enquiryApi
