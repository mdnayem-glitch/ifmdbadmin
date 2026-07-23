import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithAuth } from '@/store/baseQueryWithAuth'

export interface IPrivacyPolicy {
  _id: string
  content: string
  updatedAt: string
}

interface PrivacyPolicyResponse {
  success: boolean
  statusCode: number
  message: string
  data: IPrivacyPolicy
}

export const privacyPolicyApi = createApi({
  reducerPath: 'privacyPolicyApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['privacyPolicy'],
  endpoints: (builder) => ({
    // get privacy policy
    getPrivacyPolicy: builder.query<IPrivacyPolicy, void>({
      query: () => '/privacy-policy',
      transformResponse: (response: PrivacyPolicyResponse) => response.data,
      providesTags: ['privacyPolicy'],
    }),

    // update privacy policy
    updatePrivacyPolicy: builder.mutation<IPrivacyPolicy, { content: string }>({
      query: (data) => ({
        url: '/privacy-policy',
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: PrivacyPolicyResponse) => response.data,
      invalidatesTags: ['privacyPolicy'],
    }),
  }),
})

export const { useGetPrivacyPolicyQuery, useUpdatePrivacyPolicyMutation } = privacyPolicyApi
