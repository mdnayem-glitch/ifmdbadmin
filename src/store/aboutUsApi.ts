import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState as IRootState } from '@/store'

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
