import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState as IRootState } from '@/store'

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
