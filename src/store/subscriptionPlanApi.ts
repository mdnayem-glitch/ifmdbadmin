import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState as IRootState } from '@/store'

// Types
export interface ISubscriptionPlan {
  _id: string
  planName: string
  planCost: number
  planInclude: string[]
  metaTitle: string
  metaTag: string[]
  metaDescription: string
  createdAt: string
  updatedAt: string
}

interface SubscriptionPlanResponse {
  success: boolean
  statusCode: number
  message: string
  data: ISubscriptionPlan | ISubscriptionPlan[]
}

export const subscriptionPlanApi = createApi({
  reducerPath: 'subscriptionPlanApi',
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
  tagTypes: ['subscriptionPlan'],
  endpoints: (builder) => ({
    // ✅ Get all
    getSubscriptionPlans: builder.query<ISubscriptionPlan[], void>({
      query: () => '/subscription-plans',
      transformResponse: (response: SubscriptionPlanResponse) => (Array.isArray(response.data) ? response.data : [response.data]),
      providesTags: ['subscriptionPlan'],
    }),

    // ✅ Get by ID
    getSubscriptionPlanById: builder.query<ISubscriptionPlan, string>({
      query: (id) => `/subscription-plans/${id}`,
      transformResponse: (response: SubscriptionPlanResponse) => response.data as ISubscriptionPlan,
      providesTags: (result, error, id) => [{ type: 'subscriptionPlan', id }],
    }),

    // ✅ Create (JSON body)
    createSubscriptionPlan: builder.mutation<ISubscriptionPlan, Partial<ISubscriptionPlan>>({
      query: (newSubscriptionPlan) => ({
        url: '/subscription-plans',
        method: 'POST',
        body: newSubscriptionPlan,
      }),
      transformResponse: (response: SubscriptionPlanResponse) => response.data as ISubscriptionPlan,
      invalidatesTags: ['subscriptionPlan'],
    }),

    // ✅ Update (JSON body)
    updateSubscriptionPlan: builder.mutation<ISubscriptionPlan, { id: string; data: Partial<ISubscriptionPlan> }>({
      query: ({ id, data }) => ({
        url: `/subscription-plans/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: SubscriptionPlanResponse) => response.data as ISubscriptionPlan,
      invalidatesTags: (result, error, { id }) => [{ type: 'subscriptionPlan', id }, 'subscriptionPlan'],
    }),

    // ✅ Delete
    deleteSubscriptionPlan: builder.mutation<ISubscriptionPlan, string>({
      query: (id) => ({
        url: `/subscription-plans/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: SubscriptionPlanResponse) => response.data as ISubscriptionPlan,
      invalidatesTags: ['subscriptionPlan'],
    }),
  }),
})

export const {
  useGetSubscriptionPlansQuery,
  useGetSubscriptionPlanByIdQuery,
  useCreateSubscriptionPlanMutation,
  useUpdateSubscriptionPlanMutation,
  useDeleteSubscriptionPlanMutation,
} = subscriptionPlanApi
