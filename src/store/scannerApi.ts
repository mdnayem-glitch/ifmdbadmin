import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState as IRootState } from '@/store'

export interface IScannerAccess {
  _id: string
  vendorId: string | { _id: string; name: string; email: string }
  name: string
  email: string
  phone: string
  allowedEvents: Array<{ _id: string; title: string; startDate: string }> | string[]
  isActive: boolean
  lastLoginAt?: string
  lastScanAt?: string
  totalScans: number
  notes: string
  createdAt: string
  updatedAt: string
}

export interface IScanLog {
  _id: string
  scannerId: { _id: string; name: string; email: string } | string
  ticketId?: string
  bookingReference: string
  eventId?: { _id: string; title: string } | string
  scanResult: 'valid' | 'invalid' | 'already_used' | 'expired' | 'wrong_event' | 'not_found'
  scanMessage: string
  ticketDetails?: {
    customerName?: string
    ticketType?: string
    quantity?: number
    eventName?: string
    eventDate?: string
  }
  deviceInfo: string
  scannedAt: string
  createdAt: string
}

interface ScannerListResponse {
  success: boolean
  data: IScannerAccess[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

interface ScannerSingleResponse {
  success: boolean
  data: IScannerAccess
  message?: string
}

interface ScanLogsResponse {
  success: boolean
  data: IScanLog[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

interface CreateScannerInput {
  name: string
  email: string
  password: string
  phone?: string
  allowedEvents?: string[]
  notes?: string
}

interface UpdateScannerInput {
  id: string
  name?: string
  phone?: string
  password?: string
  allowedEvents?: string[]
  notes?: string
  isActive?: boolean
}

export const scannerApi = createApi({
  reducerPath: 'scannerApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/v1/api',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as IRootState).auth?.token
      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: ['Scanner', 'ScanLogs'],
  endpoints: (builder) => ({
    // Get all scanner accounts for vendor
    getScannerAccounts: builder.query<ScannerListResponse, { page?: number; limit?: number; isActive?: boolean; search?: string }>({
      query: (params) => ({
        url: '/events/scanner-access',
        params,
      }),
      providesTags: ['Scanner'],
    }),

    // Get single scanner by ID
    getScannerById: builder.query<IScannerAccess, string>({
      query: (id) => `/events/scanner-access/${id}`,
      transformResponse: (response: ScannerSingleResponse) => response.data,
      providesTags: (result, error, id) => [{ type: 'Scanner', id }],
    }),

    // Create new scanner access
    createScanner: builder.mutation<ScannerSingleResponse, CreateScannerInput>({
      query: (data) => ({
        url: '/events/scanner-access',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Scanner'],
    }),

    // Update scanner access
    updateScanner: builder.mutation<ScannerSingleResponse, UpdateScannerInput>({
      query: ({ id, ...data }) => ({
        url: `/events/scanner-access/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Scanner'],
    }),

    // Delete scanner access
    deleteScanner: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/events/scanner-access/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Scanner'],
    }),

    // Toggle scanner status
    toggleScannerStatus: builder.mutation<{ success: boolean; data: { isActive: boolean }; message: string }, string>({
      query: (id) => ({
        url: `/events/scanner-access/${id}/toggle`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Scanner'],
    }),

    // Get scan logs
    getScanLogs: builder.query<ScanLogsResponse, { page?: number; limit?: number; scannerId?: string; eventId?: string; scanResult?: string }>({
      query: (params) => ({
        url: '/events/scanner-access/logs',
        params,
      }),
      providesTags: ['ScanLogs'],
    }),
  }),
})

export const {
  useGetScannerAccountsQuery,
  useGetScannerByIdQuery,
  useCreateScannerMutation,
  useUpdateScannerMutation,
  useDeleteScannerMutation,
  useToggleScannerStatusMutation,
  useGetScanLogsQuery,
} = scannerApi
