import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState as IRootState } from '@/store'

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
