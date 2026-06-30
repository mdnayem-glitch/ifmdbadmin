import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState as IRootState } from '@/store'

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
