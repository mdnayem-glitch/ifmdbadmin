import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState as IRootState } from '@/store'

export interface ICancellationRefund {
  _id: string
  content: string
  updatedAt: string
}

interface CancellationRefundResponse {
  success: boolean
  statusCode: number
  message: string
  data: ICancellationRefund
}

export const cancellationRefundApi = createApi({
  reducerPath: 'cancellationRefundApi',
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
  tagTypes: ['cancellationRefund'],
  endpoints: (builder) => ({
    getCancellationRefund: builder.query<ICancellationRefund, void>({
      query: () => '/cancellation-refund',
      transformResponse: (response: CancellationRefundResponse) => response.data,
      providesTags: ['cancellationRefund'],
    }),

    updateCancellationRefund: builder.mutation<ICancellationRefund, { content: string }>({
      query: (data) => ({
        url: '/cancellation-refund',
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: CancellationRefundResponse) => response.data,
      invalidatesTags: ['cancellationRefund'],
    }),
  }),
})

export const { useGetCancellationRefundQuery, useUpdateCancellationRefundMutation } = cancellationRefundApi
