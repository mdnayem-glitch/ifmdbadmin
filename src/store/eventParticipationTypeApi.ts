import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState as IRootState } from '@/store'

export interface IEventParticipationType {
  _id: string
  name: string
  description: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface ApiResponse<T> {
  success: boolean
  statusCode: number
  message: string
  data: T
  meta?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export const eventParticipationTypeApi = createApi({
  reducerPath: 'eventParticipationTypeApi',
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
  tagTypes: ['EventParticipationType'],
  endpoints: (builder) => ({
    getParticipationTypes: builder.query<{ data: IEventParticipationType[]; meta: any }, { page?: number; limit?: number; search?: string; isActive?: boolean } | void>({
      query: (params) => {
        const q = new URLSearchParams()
        if (params?.page) q.append('page', String(params.page))
        if (params?.limit) q.append('limit', String(params.limit))
        if (params?.search) q.append('search', params.search)
        if (params?.isActive !== undefined) q.append('isActive', String(params.isActive))
        return `/event-participation-types?${q.toString()}`
      },
      transformResponse: (response: ApiResponse<IEventParticipationType[]>) => ({
        data: Array.isArray(response.data) ? response.data : [],
        meta: response.meta ?? { page: 1, limit: 50, total: 0, totalPages: 1 },
      }),
      providesTags: ['EventParticipationType'],
    }),

    getActiveParticipationTypes: builder.query<IEventParticipationType[], void>({
      query: () => '/event-participation-types/active',
      transformResponse: (response: ApiResponse<IEventParticipationType[]>) =>
        Array.isArray(response.data) ? response.data : [],
      providesTags: ['EventParticipationType'],
    }),

    getParticipationTypeById: builder.query<IEventParticipationType, string>({
      query: (id) => `/event-participation-types/${id}`,
      transformResponse: (response: ApiResponse<IEventParticipationType>) => response.data,
      providesTags: (result, error, id) => [{ type: 'EventParticipationType', id }],
    }),

    createParticipationType: builder.mutation<IEventParticipationType, { name: string; description?: string }>({
      query: (body) => ({
        url: '/event-participation-types',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<IEventParticipationType>) => response.data,
      invalidatesTags: ['EventParticipationType'],
    }),

    updateParticipationType: builder.mutation<IEventParticipationType, { id: string; data: Partial<IEventParticipationType> }>({
      query: ({ id, data }) => ({
        url: `/event-participation-types/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: ApiResponse<IEventParticipationType>) => response.data,
      invalidatesTags: (result, error, { id }) => [{ type: 'EventParticipationType', id }, 'EventParticipationType'],
    }),

    deleteParticipationType: builder.mutation<IEventParticipationType, string>({
      query: (id) => ({
        url: `/event-participation-types/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: ApiResponse<IEventParticipationType>) => response.data,
      invalidatesTags: ['EventParticipationType'],
    }),
  }),
})

export const {
  useGetParticipationTypesQuery,
  useGetActiveParticipationTypesQuery,
  useGetParticipationTypeByIdQuery,
  useCreateParticipationTypeMutation,
  useUpdateParticipationTypeMutation,
  useDeleteParticipationTypeMutation,
} = eventParticipationTypeApi
