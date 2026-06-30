import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState as IRootState } from '@/store'

export interface IEventCategory {
  _id: string
  name: string
  image: string
  isMusicShow: boolean
  isComedyShow: boolean
  isActive: boolean
  eventCount: number
  createdAt: string
  updatedAt: string
}

interface EventCategoryResponse {
  success: boolean
  statusCode: number
  message: string
  data: IEventCategory | IEventCategory[]
  meta?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export const eventCategoryApi = createApi({
  reducerPath: 'eventCategoryApi',
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
  tagTypes: ['EventCategory'],
  endpoints: (builder) => ({
    // Get all event categories
    getEventCategories: builder.query<IEventCategory[], { isActive?: boolean; isMusicShow?: boolean; isComedyShow?: boolean } | void>({
      query: (params) => {
        let url = '/event-categories'
        if (params) {
          const queryParams = new URLSearchParams()
          if (params.isActive !== undefined) queryParams.append('isActive', String(params.isActive))
          if (params.isMusicShow !== undefined) queryParams.append('isMusicShow', String(params.isMusicShow))
          if (params.isComedyShow !== undefined) queryParams.append('isComedyShow', String(params.isComedyShow))
          if (queryParams.toString()) url += `?${queryParams.toString()}`
        }
        return url
      },
      transformResponse: (response: EventCategoryResponse) => (Array.isArray(response.data) ? response.data : [response.data]),
      providesTags: ['EventCategory'],
    }),

    // Get event category by ID
    getEventCategoryById: builder.query<IEventCategory, string>({
      query: (id) => `/event-categories/${id}`,
      transformResponse: (response: EventCategoryResponse) => response.data as IEventCategory,
      providesTags: (result, error, id) => [{ type: 'EventCategory', id }],
    }),

    // Get music show categories
    getMusicShowCategories: builder.query<IEventCategory[], void>({
      query: () => '/event-categories/music-shows',
      transformResponse: (response: EventCategoryResponse) => (Array.isArray(response.data) ? response.data : [response.data]),
      providesTags: ['EventCategory'],
    }),

    // Get comedy show categories
    getComedyShowCategories: builder.query<IEventCategory[], void>({
      query: () => '/event-categories/comedy-shows',
      transformResponse: (response: EventCategoryResponse) => (Array.isArray(response.data) ? response.data : [response.data]),
      providesTags: ['EventCategory'],
    }),

    // Create event category
    createEventCategory: builder.mutation<IEventCategory, FormData>({
      query: (formData) => ({
        url: '/event-categories',
        method: 'POST',
        body: formData,
      }),
      transformResponse: (response: EventCategoryResponse) => response.data as IEventCategory,
      invalidatesTags: ['EventCategory'],
    }),

    // Update event category
    updateEventCategory: builder.mutation<IEventCategory, { id: string; data: FormData }>({
      query: ({ id, data }) => ({
        url: `/event-categories/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: EventCategoryResponse) => response.data as IEventCategory,
      invalidatesTags: (result, error, { id }) => [{ type: 'EventCategory', id }, 'EventCategory'],
    }),

    // Delete event category (soft delete)
    deleteEventCategory: builder.mutation<IEventCategory, string>({
      query: (id) => ({
        url: `/event-categories/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: EventCategoryResponse) => response.data as IEventCategory,
      invalidatesTags: ['EventCategory'],
    }),

    // Permanently delete event category
    permanentDeleteEventCategory: builder.mutation<IEventCategory, string>({
      query: (id) => ({
        url: `/event-categories/${id}/permanent`,
        method: 'DELETE',
      }),
      transformResponse: (response: EventCategoryResponse) => response.data as IEventCategory,
      invalidatesTags: ['EventCategory'],
    }),
  }),
})

export const {
  useGetEventCategoriesQuery,
  useGetEventCategoryByIdQuery,
  useGetMusicShowCategoriesQuery,
  useGetComedyShowCategoriesQuery,
  useCreateEventCategoryMutation,
  useUpdateEventCategoryMutation,
  useDeleteEventCategoryMutation,
  usePermanentDeleteEventCategoryMutation,
} = eventCategoryApi
