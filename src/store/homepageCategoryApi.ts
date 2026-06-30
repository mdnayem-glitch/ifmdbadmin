import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState as IRootState } from '@/store'

export interface IHomepageCategory {
  _id: string
  title: string
  image: string
  link: string
  order: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface HomepageCategoryResponse {
  success: boolean
  statusCode: number
  message: string
  data: IHomepageCategory | IHomepageCategory[]
}

export const homepageCategoryApi = createApi({
  reducerPath: 'homepageCategoryApi',
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
  tagTypes: ['homepageCategory'],
  endpoints: (builder) => ({
    getHomepageCategories: builder.query<IHomepageCategory[], void>({
      query: () => '/homepage-categories',
      transformResponse: (response: HomepageCategoryResponse) => (Array.isArray(response.data) ? response.data : [response.data]),
      providesTags: ['homepageCategory'],
    }),

    getHomepageCategoryById: builder.query<IHomepageCategory, string>({
      query: (id) => `/homepage-categories/${id}`,
      transformResponse: (response: HomepageCategoryResponse) => response.data as IHomepageCategory,
      providesTags: (result, error, id) => [{ type: 'homepageCategory', id }],
    }),

    createHomepageCategory: builder.mutation<IHomepageCategory, FormData>({
      query: (formData) => ({
        url: '/homepage-categories',
        method: 'POST',
        body: formData,
      }),
      transformResponse: (response: HomepageCategoryResponse) => response.data as IHomepageCategory,
      invalidatesTags: ['homepageCategory'],
    }),

    updateHomepageCategory: builder.mutation<IHomepageCategory, { id: string; data: FormData }>({
      query: ({ id, data }) => ({
        url: `/homepage-categories/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: HomepageCategoryResponse) => response.data as IHomepageCategory,
      invalidatesTags: (result, error, { id }) => [{ type: 'homepageCategory', id }, 'homepageCategory'],
    }),

    deleteHomepageCategory: builder.mutation<IHomepageCategory, string>({
      query: (id) => ({
        url: `/homepage-categories/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: HomepageCategoryResponse) => response.data as IHomepageCategory,
      invalidatesTags: ['homepageCategory'],
    }),
  }),
})

export const {
  useGetHomepageCategoriesQuery,
  useGetHomepageCategoryByIdQuery,
  useCreateHomepageCategoryMutation,
  useUpdateHomepageCategoryMutation,
  useDeleteHomepageCategoryMutation,
} = homepageCategoryApi
