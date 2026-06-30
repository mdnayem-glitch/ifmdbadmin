import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState as IRootState } from '@/store'

export interface ITermsConditions {
  _id: string
  content: string
  updatedAt: string
}

interface TermsConditionsResponse {
  success: boolean
  statusCode: number
  message: string
  data: ITermsConditions
}

export const termsConditionsApi = createApi({
  reducerPath: 'termsConditionsApi',
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
  tagTypes: ['termsConditions'],
  endpoints: (builder) => ({
    // get
    getTermsConditions: builder.query<ITermsConditions, void>({
      query: () => '/terms-condition',
      transformResponse: (response: TermsConditionsResponse) => response.data,
      providesTags: ['termsConditions'],
    }),

    // update
    updateTermsConditions: builder.mutation<ITermsConditions, { content: string }>({
      query: (data) => ({
        url: '/terms-condition',
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: TermsConditionsResponse) => response.data,
      invalidatesTags: ['termsConditions'],
    }),
  }),
})

export const { useGetTermsConditionsQuery, useUpdateTermsConditionsMutation } = termsConditionsApi
