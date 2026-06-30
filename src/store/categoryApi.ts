import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState as IRootState } from '@/store'

export interface ICategory {
  _id: string
  title: string
  image: string
  status: 'active' | 'inactive' | string
  createdAt: string
  updatedAt: string
}

interface CategoryResponse {
  success: boolean
  statusCode: number
  message: string
  data: ICategory | ICategory[]
}

export const categoryApi = createApi({
  reducerPath: 'categoryApi',
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
  tagTypes: ['category'],
  endpoints: (builder) => ({
    getCategories: builder.query<ICategory[], void>({
      query: () => '/categories',
      transformResponse: (response: CategoryResponse) => (Array.isArray(response.data) ? response.data : [response.data]),
      providesTags: ['category'],
    }),

    getCategoriesById: builder.query<ICategory, string>({
      query: (id) => `/categories/${id}`,
      transformResponse: (response: CategoryResponse) => response.data as ICategory,
      providesTags: (result, error, id) => [{ type: 'category', id }],
    }),

    createCategory: builder.mutation<ICategory, FormData>({
      query: (formData) => ({
        url: 'categories',
        method: 'POST',
        body: formData,
      }),
      transformResponse: (response: CategoryResponse) => response.data as ICategory,
      invalidatesTags: ['category'],
    }),

    updateCategory: builder.mutation<ICategory, { id: string; data: FormData }>({
      query: ({ id, data }) => ({
        url: `categories/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: CategoryResponse) => response.data as ICategory,
      invalidatesTags: (result, error, { id }) => [{ type: 'category', id }, 'category'],
    }),

    deleteCategory: builder.mutation<ICategory, string>({
      query: (id) => ({
        url: `/categories/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: CategoryResponse) => response.data as ICategory,
      invalidatesTags: ['category'],
    }),
  }),
})

export const { useGetCategoriesQuery, useGetCategoriesByIdQuery, useCreateCategoryMutation, useUpdateCategoryMutation, useDeleteCategoryMutation } =
  categoryApi
