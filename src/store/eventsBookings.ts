import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState as IRootState } from '@/store'

// ---------- Sub Interfaces ----------
interface VenueLocation {
  city: string
  address: string
  pincode: string
  latitude: number
  longitude: number
}

interface Category {
  categoryId: string
  name: string
  price: number
  availableSeats: number
  totalSeats: number
  benefits: string[]
}

interface BookedTicket {
  ticketId: string
  userId: string
  seatNumber: string
  category: string
  pricePaid: number
  status: string
}

// ---------- Main Interface ----------
export interface IEventesTicketBookings {
  _id: string
  eventId: string
  eventName: string
  organizerId: string
  organizerName: string
  venueId: string
  venueName: string
  venueLocation: VenueLocation
  eventDate: string
  startTime: string
  endTime: string
  basePrice: number
  currency: string
  categories: Category[]
  bookedTickets: BookedTicket[]
  ticketTypes: string[]
  maxTicketsPerUser: number
  bookingDeadline: string
  cancellationAllowed: boolean
  cancellationPolicy: string
  cancellationFee: number
  status: string
  isActive: boolean
}

// ---------- API Response ----------
interface EventesTicketBookingsResponse {
  success: boolean
  statusCode: number
  message: string
  data: IEventesTicketBookings | IEventesTicketBookings[]
}

// ---------- API Slice ----------
export const eventesTicketBookingsAPI = createApi({
  reducerPath: 'eventesTicketBookingsAPI',
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
  tagTypes: ['EventesTicketBookings'],
  endpoints: (builder) => ({
    getEventesTicketBookings: builder.query<IEventesTicketBookings[], void>({
      query: () => `/eventesTicketBookings`,
      transformResponse: (response: EventesTicketBookingsResponse) => (Array.isArray(response.data) ? response.data : [response.data]),
      providesTags: ['EventesTicketBookings'],
    }),

    getEventesTicketBookingsById: builder.query<IEventesTicketBookings, string>({
      query: (id) => `/eventesTicketBookings/${id}`,
      transformResponse: (response: EventesTicketBookingsResponse) => response.data as IEventesTicketBookings,
      providesTags: (result, error, id) => [{ type: 'EventesTicketBookings', id }],
    }),

    deleteEventesTicketBookings: builder.mutation<IEventesTicketBookings, string>({
      query: (id) => ({
        url: `/eventesTicketBookings/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: EventesTicketBookingsResponse) => response.data as IEventesTicketBookings,
      invalidatesTags: ['EventesTicketBookings'],
    }),
  }),
})

export const { useGetEventesTicketBookingsQuery, useGetEventesTicketBookingsByIdQuery, useDeleteEventesTicketBookingsMutation } =
  eventesTicketBookingsAPI
