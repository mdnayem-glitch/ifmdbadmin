import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState as IRootState } from '@/store'

// Individual seat info
interface BookingSet {
  seatNumber: string
  type: string
  priceMultiplier: number
  status: string
}

// Seat layout
interface SeatLayout {
  rows: number
  columns: number
  seats: BookingSet[]
}

// Theater location
interface TheaterLocation {
  city: string
  address: string
  pincode: string
}

// Main booking interface
export interface IMoviesBookings {
  _id: string
  movieId: string
  movieName: string
  hallId: string
  hallName: string
  showDate: string
  showTime: string
  endTime: string
  basePrice: number
  formatType: string
  language: string
  availableSeats: number
  totalSeats: number
  bookedSeats: BookingSet[]
  seatLayout: SeatLayout
  status: string
  isActive: boolean
  theaterLocation: TheaterLocation
  amenities: string[]
  bookingDeadline: string
  cancellationAllowed: boolean
  cancellationFee: number
}

// API Response wrapper
interface MoviesBookingsResponse {
  success: boolean
  statusCode: number
  message: string
  data: IMoviesBookings | IMoviesBookings[]
}

export const moviesBookingsApi = createApi({
  reducerPath: 'moviesBookingsApi',
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
  tagTypes: ['moviesBookings'],
  endpoints: (builder) => ({
    getBookings: builder.query<IMoviesBookings[], void>({
      query: () => '/moviesBookings',
      transformResponse: (response: MoviesBookingsResponse) => (Array.isArray(response.data) ? response.data : [response.data]),
      providesTags: ['moviesBookings'],
    }),

    getMoviesBookingsById: builder.query<IMoviesBookings, string>({
      query: (id) => `/moviesBookings/${id}`,
      transformResponse: (response: MoviesBookingsResponse) => response.data as IMoviesBookings,
      providesTags: (result, error, id) => [{ type: 'moviesBookings', id }],
    }),

    deleteMovieBookings: builder.mutation<IMoviesBookings, string>({
      query: (id) => ({
        url: `/moviesBookings/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: MoviesBookingsResponse) => response.data as IMoviesBookings,
      invalidatesTags: ['moviesBookings'],
    }),
  }),
})

export const { useGetBookingsQuery, useGetMoviesBookingsByIdQuery, useDeleteMovieBookingsMutation } = moviesBookingsApi
