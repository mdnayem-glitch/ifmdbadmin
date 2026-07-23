import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithAuth } from '@/store/baseQueryWithAuth'

export interface IPartnerTerms {
  _id: string
  content: string
  updatedAt: string
}

interface PartnerTermsResponse {
  success: boolean
  statusCode: number
  message: string
  data: IPartnerTerms
}

export const partnerTermsApi = createApi({
  reducerPath: 'partnerTermsApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['partnerTerms'],
  endpoints: (builder) => ({
    getPartnerTerms: builder.query<IPartnerTerms, void>({
      query: () => '/partner-terms',
      transformResponse: (response: PartnerTermsResponse) => response.data,
      providesTags: ['partnerTerms'],
    }),

    updatePartnerTerms: builder.mutation<IPartnerTerms, { content: string }>({
      query: (data) => ({
        url: '/partner-terms',
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: PartnerTermsResponse) => response.data,
      invalidatesTags: ['partnerTerms'],
    }),
  }),
})

export const { useGetPartnerTermsQuery, useUpdatePartnerTermsMutation } = partnerTermsApi
