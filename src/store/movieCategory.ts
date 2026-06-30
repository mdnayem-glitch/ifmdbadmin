import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState as IRootState } from '@/store'

// Interface
export interface IMovieCategory {
  _id: string
  title: string
  status: 'active' | 'inactive' | string
  createdAt: string
  updatedAt: string
}

interface MovieCategoryResponse {
  success: boolean
  statusCode: number
  message: string
  data: IMovieCategory | IMovieCategory[]
}

export const movieCategoryApi = createApi({
  reducerPath: 'movieCategoryApi',
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
  tagTypes: ['movieCategory'],
  endpoints: (builder) => ({
    getMovieCategories: builder.query<IMovieCategory[], void>({
      query: () => '/movies/categories',
      transformResponse: (response: MovieCategoryResponse) => (Array.isArray(response.data) ? response.data : [response.data]),
      providesTags: ['movieCategory'],
    }),

    getMovieCategoryById: builder.query<IMovieCategory, string>({
      query: (id) => `/movies/categories/${id}`,
      transformResponse: (response: MovieCategoryResponse) => response.data as IMovieCategory,
      providesTags: (result, error, id) => [{ type: 'movieCategory', id }],
    }),

    createMovieCategory: builder.mutation<IMovieCategory, Partial<IMovieCategory>>({
      query: (data) => ({
        url: '/movies/categories',
        method: 'POST',
        body: data, // ✅ JSON body
      }),
      transformResponse: (response: MovieCategoryResponse) => response.data as IMovieCategory,
      invalidatesTags: ['movieCategory'],
    }),

    updateMovieCategory: builder.mutation<IMovieCategory, { id: string; data: Partial<IMovieCategory> }>({
      query: ({ id, data }) => ({
        url: `/movies/categories/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: MovieCategoryResponse) => response.data as IMovieCategory,
      invalidatesTags: (result, error, { id }) => [{ type: 'movieCategory', id }, 'movieCategory'],
    }),

    deleteMovieCategory: builder.mutation<IMovieCategory, string>({
      query: (id) => ({
        url: `/movies/categories/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: MovieCategoryResponse) => response.data as IMovieCategory,
      invalidatesTags: ['movieCategory'],
    }),
  }),
})

export const {
  useGetMovieCategoriesQuery,
  useGetMovieCategoryByIdQuery,
  useCreateMovieCategoryMutation,
  useUpdateMovieCategoryMutation,
  useDeleteMovieCategoryMutation,
} = movieCategoryApi
