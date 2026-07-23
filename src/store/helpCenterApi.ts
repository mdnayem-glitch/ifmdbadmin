import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithAuth } from '@/store/baseQueryWithAuth'

export interface IHelpCenter {
  _id: string
  content: string
  updatedAt: string
}

interface HelpCenterResponse {
  success: boolean
  statusCode: number
  message: string
  data: IHelpCenter
}

export const helpCenterApi = createApi({
  reducerPath: 'helpCenterApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['helpCenterApi'],
  endpoints: (builder) => ({
    gethelpCenter: builder.query<IHelpCenter, void>({
      query: () => '/help-center',
      transformResponse: (response: HelpCenterResponse) => response.data,
      providesTags: ['helpCenterApi'],
    }),

    // update
    updateHelpCenter: builder.mutation<IHelpCenter, { content: string }>({
      query: (data) => ({
        url: '/help-center',
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: HelpCenterResponse) => response.data,
      invalidatesTags: ['helpCenterApi'],
    }),
  }),
})

export const { useGethelpCenterQuery, useUpdateHelpCenterMutation } = helpCenterApi
