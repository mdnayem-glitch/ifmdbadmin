import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithAuth } from '@/store/baseQueryWithAuth'

export interface IAboutUs {
  _id: string
  content: string
  updatedAt: string
}

interface AboutUsResponse {
  success: boolean
  statusCode: number
  message: string
  data: IAboutUs
}

export const aboutUsApi = createApi({
  reducerPath: 'aboutUsApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['aboutUs'],
  endpoints: (builder) => ({
    getAboutUs: builder.query<IAboutUs, void>({
      query: () => '/about-us',
      transformResponse: (response: AboutUsResponse) => response.data,
      providesTags: ['aboutUs'],
    }),

    updateAboutUs: builder.mutation<IAboutUs, { content: string }>({
      query: (data) => ({
        url: '/about-us',
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: AboutUsResponse) => response.data,
      invalidatesTags: ['aboutUs'],
    }),
  }),
})

export const { useGetAboutUsQuery, useUpdateAboutUsMutation } = aboutUsApi
