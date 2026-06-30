import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState as IRootState } from '@/store'

export interface IEventType {
  _id: string
  title: string
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

export const eventTypeApi = createApi({
  reducerPath: 'eventTypeApi',
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
  tagTypes: ['EventType'],
  endpoints: (builder) => ({
    getEventTypes: builder.query<
      { data: IEventType[]; meta: any },
      { page?: number; limit?: number; search?: string; isActive?: boolean } | void
    >({
      query: (params) => {
        const q = new URLSearchParams()
        if (params?.page) q.append('page', String(params.page))
        if (params?.limit) q.append('limit', String(params.limit))
        if (params?.search) q.append('search', params.search)
        if (params?.isActive !== undefined) q.append('isActive', String(params.isActive))
        return `/event-types?${q.toString()}`
      },
      transformResponse: (response: ApiResponse<IEventType[]>) => ({
        data: Array.isArray(response.data) ? response.data : [],
        meta: response.meta ?? { page: 1, limit: 50, total: 0, totalPages: 1 },
      }),
      providesTags: ['EventType'],
    }),

    getActiveEventTypes: builder.query<IEventType[], void>({
      query: () => '/event-types/active',
      transformResponse: (response: ApiResponse<IEventType[]>) =>
        Array.isArray(response.data) ? response.data : [],
      providesTags: ['EventType'],
    }),

    getEventTypeById: builder.query<IEventType, string>({
      query: (id) => `/event-types/${id}`,
      transformResponse: (response: ApiResponse<IEventType>) => response.data,
      providesTags: (result, error, id) => [{ type: 'EventType', id }],
    }),

    createEventType: builder.mutation<IEventType, { title: string }>({
      query: (body) => ({
        url: '/event-types',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<IEventType>) => response.data,
      invalidatesTags: ['EventType'],
    }),

    updateEventType: builder.mutation<IEventType, { id: string; data: Partial<IEventType> }>({
      query: ({ id, data }) => ({
        url: `/event-types/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: ApiResponse<IEventType>) => response.data,
      invalidatesTags: (result, error, { id }) => [{ type: 'EventType', id }, 'EventType'],
    }),

    deleteEventType: builder.mutation<IEventType, string>({
      query: (id) => ({
        url: `/event-types/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: ApiResponse<IEventType>) => response.data,
      invalidatesTags: ['EventType'],
    }),
  }),
})

export const {
  useGetEventTypesQuery,
  useGetActiveEventTypesQuery,
  useGetEventTypeByIdQuery,
  useCreateEventTypeMutation,
  useUpdateEventTypeMutation,
  useDeleteEventTypeMutation,
} = eventTypeApi
