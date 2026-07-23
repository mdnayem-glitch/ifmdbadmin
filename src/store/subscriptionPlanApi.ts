import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithAuth } from '@/store/baseQueryWithAuth'

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
  baseQuery: baseQueryWithAuth,
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
