import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithAuth } from '@/store/baseQueryWithAuth'

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
  baseQuery: baseQueryWithAuth,
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
