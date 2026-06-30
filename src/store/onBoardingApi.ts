import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState as IRootState } from '@/store'

export interface IOnboarding {
  _id: string
  title: string
  subtitle: string
  image: string
  status: 'active' | 'inactive' | string
  createdAt: string
  updatedAt: string
  metaTitle: string
  metaDescription: string
  metaTags: string[]
}

interface OnboardingResponse {
  success: boolean
  statusCode: number
  message: string
  data: IOnboarding | IOnboarding[]
}

export const onboardingApi = createApi({
  reducerPath: 'onboardingApi',
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
  tagTypes: ['onboarding'],
  endpoints: (builder) => ({
    getOnboarding: builder.query<IOnboarding[], void>({
      query: () => '/onboarding',
      transformResponse: (response: OnboardingResponse) => (Array.isArray(response.data) ? response.data : [response.data]),
      providesTags: ['onboarding'],
    }),
    getOnboardingById: builder.query<IOnboarding, string>({
      query: (id) => `/onboarding/${id}`,
      transformResponse: (response: OnboardingResponse) => response.data as IOnboarding,
      providesTags: (result, error, id) => [{ type: 'onboarding', id }],
    }),
    createOnBoardings: builder.mutation<IOnboarding, FormData>({
      query: (formData) => ({
        url: 'onboarding',
        method: 'POST',
        body: formData,
        // ❌ Do NOT set Content-Type manually, the browser will handle boundary for multipart/form-data
      }),
      transformResponse: (response: OnboardingResponse) => response.data as IOnboarding,
      invalidatesTags: ['onboarding'],
    }),

    updateOnBoardings: builder.mutation<IOnboarding, { id: string; data: FormData }>({
      query: ({ id, data }) => ({
        url: `onboarding/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: OnboardingResponse) => response.data as IOnboarding,
      invalidatesTags: (result, error, { id }) => [{ type: 'onboarding', id }, 'onboarding'],
    }),
    deleteOnBoardings: builder.mutation<IOnboarding, string>({
      query: (id) => ({
        url: `onboarding/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: OnboardingResponse) => response.data as IOnboarding,
      invalidatesTags: ['onboarding'],
    }),
  }),
})

export const {
  useGetOnboardingQuery,
  useGetOnboardingByIdQuery,
  useCreateOnBoardingsMutation,
  useUpdateOnBoardingsMutation,
  useDeleteOnBoardingsMutation,
} = onboardingApi
