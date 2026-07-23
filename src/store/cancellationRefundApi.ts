import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithAuth } from '@/store/baseQueryWithAuth'

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
  baseQuery: baseQueryWithAuth,
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
