import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState as IRootState } from '@/store'

export interface ILocation {
  venueName: string
  address: string
  city: string
  state: string
  postalCode: string
  latitude: number
  longitude: number
}

export interface IPerformer {
  name: string
  type: 'artist' | 'comedian' | 'band' | string
  image: string
  bio: string
}

export interface IOrganizer {
  name: string
  email: string
  phone: string
  logo: string
}

export interface ISeatType {
  name: string
  price: number
  totalSeats: number
  availableSeats: number
}

export interface IEventPass {
  name: string
  price: number
  totalPasses: number
  availablePasses: number
  maxPassesPerPerson?: number
  foodIncluded?: boolean
  parkingAvailable?: boolean
  description?: string
}

export interface IEvents {
  _id: string
  title: string
  description: string
  eventType: string
  category: string
  categoryId?: string
  eventLanguage: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  location: ILocation
  ticketPrice: number
  totalSeats: number
  availableSeats: number
  seatTypes: ISeatType[]
  eventPasses?: IEventPass[]
  maxTicketsPerPerson: number
  totalTicketsSold: number
  posterImage: string
  galleryImages: string[]
  performers: IPerformer[]
  organizers: IOrganizer[]
  tags: string[]
  videoUrl?: string
  cloudflareVideoUid?: string
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled' | string
  isActive: boolean
  isScheduled?: boolean
  visibleFrom?: string
  visibleUntil?: string
  vendorId?: string
  createdAt: string
  updatedAt: string
}

interface EventsResponse {
  success: boolean
  statusCode: number
  message: string
  data: IEvents | IEvents[]
}

export const eventsApi = createApi({
  reducerPath: 'eventsApi',
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
  tagTypes: ['Events'],
  endpoints: (builder) => ({
    getEvents: builder.query<IEvents[], void>({
      query: () => '/events?vendorOnly=true&limit=1000&sortBy=createdAt&sortOrder=desc',
      transformResponse: (response: EventsResponse) => (Array.isArray(response.data) ? response.data : [response.data]),
      providesTags: ['Events'],
    }),

    getEventsById: builder.query<IEvents, string>({
      query: (id) => `/events/${id}`,
      transformResponse: (response: EventsResponse) => response.data as IEvents,
      providesTags: (result, error, id) => [{ type: 'Events', id }],
    }),

    createEvents: builder.mutation<IEvents, Partial<IEvents>>({
      query: (newEvent) => ({
        url: 'events',
        method: 'POST',
        body: newEvent, // plain JSON
        headers: {
          'Content-Type': 'application/json', // make sure JSON is sent
        },
      }),
      transformResponse: (response: EventsResponse) => response.data as IEvents,
      invalidatesTags: ['Events'],
    }),

    updateEvents: builder.mutation<IEvents, { id: string; data: Partial<IEvents> | FormData }>({
      query: ({ id, data }) => {
        // Check if data is FormData or JSON
        const isFormData = data instanceof FormData
        return {
          url: `events/${id}`,
          method: 'PUT',
          body: data,
          headers: isFormData ? undefined : { 'Content-Type': 'application/json' },
        }
      },
      transformResponse: (response: EventsResponse) => response.data as IEvents,
      invalidatesTags: (result, error, { id }) => [{ type: 'Events', id }, 'Events'],
    }),

    deleteEvents: builder.mutation<IEvents, string>({
      query: (id) => ({
        url: `events/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: EventsResponse) => response.data as IEvents,
      invalidatesTags: ['Events'],
    }),

    // Get best events this week
    getBestEventsThisWeek: builder.query<IEvents[], { page?: number; limit?: number } | void>({
      query: (params) => {
        let url = '/events/best-this-week'
        if (params) {
          const queryParams = new URLSearchParams()
          if (params.page) queryParams.append('page', String(params.page))
          if (params.limit) queryParams.append('limit', String(params.limit))
          if (queryParams.toString()) url += `?${queryParams.toString()}`
        }
        return url
      },
      transformResponse: (response: EventsResponse) => (Array.isArray(response.data) ? response.data : [response.data]),
      providesTags: ['Events'],
    }),

    // Get events by category
    getEventsByCategory: builder.query<IEvents[], { categoryId: string; page?: number; limit?: number }>({
      query: ({ categoryId, page, limit }) => {
        let url = `/events/category/${categoryId}`
        const queryParams = new URLSearchParams()
        if (page) queryParams.append('page', String(page))
        if (limit) queryParams.append('limit', String(limit))
        if (queryParams.toString()) url += `?${queryParams.toString()}`
        return url
      },
      transformResponse: (response: EventsResponse) => (Array.isArray(response.data) ? response.data : [response.data]),
      providesTags: ['Events'],
    }),

    // Get events by language
    getEventsByLanguage: builder.query<IEvents[], { eventLanguage: string; page?: number; limit?: number }>({
      query: ({ eventLanguage, page, limit }) => {
        let url = `/events/language/${eventLanguage}`
        const queryParams = new URLSearchParams()
        if (page) queryParams.append('page', String(page))
        if (limit) queryParams.append('limit', String(limit))
        if (queryParams.toString()) url += `?${queryParams.toString()}`
        return url
      },
      transformResponse: (response: EventsResponse) => (Array.isArray(response.data) ? response.data : [response.data]),
      providesTags: ['Events'],
    }),

    // ===== Event Bookings =====
    
    // Get all event bookings
    getEventBookings: builder.query<{ bookings: any[]; meta: any }, { 
      page?: number; 
      limit?: number; 
      userId?: string;
      eventId?: string;
      paymentStatus?: string;
      bookingStatus?: string;
      startDate?: string;
      endDate?: string;
      sortBy?: string;
      sortOrder?: string;
    } | void>({
      query: (params) => {
        let url = '/events/bookings'
        if (params) {
          const queryParams = new URLSearchParams()
          if (params.page) queryParams.append('page', String(params.page))
          if (params.limit) queryParams.append('limit', String(params.limit))
          if (params.userId) queryParams.append('userId', params.userId)
          if (params.eventId) queryParams.append('eventId', params.eventId)
          if (params.paymentStatus) queryParams.append('paymentStatus', params.paymentStatus)
          if (params.bookingStatus) queryParams.append('bookingStatus', params.bookingStatus)
          if (params.startDate) queryParams.append('startDate', params.startDate)
          if (params.endDate) queryParams.append('endDate', params.endDate)
          if (params.sortBy) queryParams.append('sortBy', params.sortBy)
          if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder)
          if (queryParams.toString()) url += `?${queryParams.toString()}`
        }
        return url
      },
      transformResponse: (response: any) => ({
        bookings: Array.isArray(response.data) ? response.data : [response.data],
        meta: response.meta || { page: 1, limit: 10, total: 0, totalPages: 0 }
      }),
      providesTags: ['Events'],
    }),

    // Get event booking by ID
    getEventBookingById: builder.query<any, string>({
      query: (id) => `/events/bookings/${id}`,
      transformResponse: (response: any) => response.data,
      providesTags: (result, error, id) => [{ type: 'Events', id }],
    }),

    // Delete event booking
    deleteEventBooking: builder.mutation<void, string>({
      query: (id) => ({
        url: `/events/bookings/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Events'],
    }),

    // Cancel event booking
    cancelEventBooking: builder.mutation<any, string>({
      query: (id) => ({
        url: `/events/bookings/${id}/cancel`,
        method: 'PUT',
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: ['Events'],
    }),
  }),
})

// Event Booking interfaces
export interface ICustomerDetails {
  name: string
  email: string
  phone: string
}

export interface IEventBooking {
  _id: string
  eventId: IEvents | string
  userId: { _id: string; name: string; email: string; phone?: string } | string
  bookingReference: string
  quantity: number
  bookingType?: 'ticket' | 'pass'
  seatType: string
  eventPass?: string
  passPerks?: {
    foodIncluded: boolean
    parkingAvailable: boolean
    description: string
  }
  eventCategory?: string
  attendanceDate?: string | null
  unitPrice: number
  totalAmount: number
  bookingFee: number
  taxAmount: number
  discountAmount: number
  finalAmount: number
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded'
  bookingStatus: 'confirmed' | 'cancelled' | 'expired'
  paymentMethod: string
  transactionId: string
  bookedAt: string
  expiresAt: string
  customerDetails: ICustomerDetails
  createdAt: string
  updatedAt: string
}

interface EventBookingsResponse {
  success: boolean
  statusCode: number
  message: string
  data: IEventBooking | IEventBooking[]
  meta?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export const { 
  useGetEventsQuery, 
  useGetEventsByIdQuery, 
  useCreateEventsMutation, 
  useUpdateEventsMutation, 
  useDeleteEventsMutation,
  useGetBestEventsThisWeekQuery,
  useGetEventsByCategoryQuery,
  useGetEventsByLanguageQuery,
  // Event Bookings
  useGetEventBookingsQuery,
  useGetEventBookingByIdQuery,
  useDeleteEventBookingMutation,
  useCancelEventBookingMutation,
} = eventsApi
