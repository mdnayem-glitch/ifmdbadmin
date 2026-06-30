import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState as IRootState } from '@/store'

// Types
export interface IContentStats {
  totalMovies: number
  totalEvents: number
  totalWatchVideos: number
  totalChannels: number
  activeMovies: number
  activeEvents: number
  activeWatchVideos: number
}

export interface IRevenueData {
  // Admin fields
  totalPlatformRevenue?: number
  dailyRevenue?: number
  weeklyRevenue?: number
  monthlyRevenue?: number
  yearlyRevenue?: number
  eventBookingsRevenue?: number
  eventBookingsCount?: number
  watchVideoRevenue?: number
  watchVideoCount?: number
  // Vendor fields
  walletBalance?: number
  pendingBalance?: number
  totalEarnings?: number
  totalWithdrawn?: number
  dailyEarnings?: number
  weeklyEarnings?: number
  monthlyEarnings?: number
}

export interface IVendorStats {
  totalVendors: number
  pendingVendorApplications: number
  approvedVendors: number
  totalVendorPayouts: number
  pendingWithdrawals: number
}

export interface IUserStats {
  totalUsers: number
  totalCustomers: number
  newUsersToday: number
  newUsersThisMonth: number
}

export interface IServiceBreakdown {
  [key: string]: {
    total: number
    count: number
  }
}

export interface ITrendData {
  _id: string | { year: number; month: number }
  total: number
  count: number
}

export interface ITransaction {
  _id: string
  userId: any
  type: string
  amount: number
  platformFee: number
  netAmount: number
  description: string
  referenceType: string
  serviceType?: string
  status: string
  createdAt: string
}

export interface IDashboardStats {
  role: string
  contentStats: IContentStats
  revenueData: IRevenueData
  vendorStats: IVendorStats
  userStats: IUserStats
  serviceBreakdown: IServiceBreakdown
  monthlyTrend: ITrendData[]
  dailyTrend: ITrendData[]
  recentTransactions: ITransaction[]
}

export interface IVideoPurchase {
  _id: string
  userId: any
  videoId: any
  amount: number
  paymentStatus: string
  paymentMethod: string
  transactionId: string
  purchasedAt: string
}

export interface IVendorRegistration {
  _id: string
  vendorName: string
  email: string
  phone: string
  status: string
  paymentInfo?: {
    amount: number
    status: string
  }
  createdAt: string
}

export const dashboardApi = createApi({
  reducerPath: 'dashboardApi',
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:8080/v1/api",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as IRootState).auth.token
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: ['DashboardStats', 'Transactions', 'VideoPurchases', 'VendorRegistrations'],
  endpoints: (builder) => ({
    // Get Dashboard Stats
    getDashboardStats: builder.query<IDashboardStats, void>({
      query: () => '/dashboard/stats',
      transformResponse: (response: { data: IDashboardStats }) => response.data,
      providesTags: ['DashboardStats'],
    }),

    // Get All Transactions (Admin)
    getAllTransactions: builder.query<
      { data: ITransaction[]; meta: { page: number; limit: number; total: number; totalPages: number } },
      { page?: number; limit?: number; type?: string; serviceType?: string; status?: string; startDate?: string; endDate?: string }
    >({
      query: (params) => ({
        url: '/dashboard/transactions',
        params,
      }),
      transformResponse: (response: { data: ITransaction[]; meta: any }) => ({
        data: response.data,
        meta: response.meta,
      }),
      providesTags: ['Transactions'],
    }),

    // Get Video Purchases
    getVideoPurchases: builder.query<
      { data: IVideoPurchase[]; meta: { page: number; limit: number; total: number; totalPages: number; totalRevenue: number } },
      { page?: number; limit?: number; paymentStatus?: string; startDate?: string; endDate?: string }
    >({
      query: (params) => ({
        url: '/dashboard/video-purchases',
        params,
      }),
      transformResponse: (response: { data: IVideoPurchase[]; meta: any }) => ({
        data: response.data,
        meta: response.meta,
      }),
      providesTags: ['VideoPurchases'],
    }),

    // Get Vendor Registrations (Admin)
    getVendorRegistrations: builder.query<
      { data: IVendorRegistration[]; meta: { page: number; limit: number; total: number; totalPages: number; totalPayments: number; paidCount: number } },
      { page?: number; limit?: number; status?: string; startDate?: string; endDate?: string }
    >({
      query: (params) => ({
        url: '/dashboard/vendor-registrations',
        params,
      }),
      transformResponse: (response: { data: IVendorRegistration[]; meta: any }) => ({
        data: response.data,
        meta: response.meta,
      }),
      providesTags: ['VendorRegistrations'],
    }),
  }),
})

export const {
  useGetDashboardStatsQuery,
  useGetAllTransactionsQuery,
  useGetVideoPurchasesQuery,
  useGetVendorRegistrationsQuery,
} = dashboardApi
