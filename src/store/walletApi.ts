import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState as IRootState } from '@/store'

// Types
export interface IBankDetails {
  accountHolderName: string
  accountNumber: string
  ifscCode: string
  bankName: string
  branchName?: string
  upiId?: string
}

export interface IWallet {
  _id: string
  userId: string
  userType: 'vendor' | 'admin'
  balance: number
  pendingBalance: number
  totalEarnings: number
  totalWithdrawn: number
  currency: string
  isActive: boolean
  bankDetails?: IBankDetails
  razorpayLinkedAccountId?: string
  razorpayAccountStatus?: 'created' | 'activated' | 'suspended' | 'failed' | 'pending' | ''
  razorpayProductId?: string
  createdAt: string
  updatedAt: string
}

export interface IWalletTransaction {
  _id: string
  walletId: string
  userId: string
  type: 'credit' | 'debit' | 'pending_credit' | 'pending_to_available' | 'platform_fee'
  amount: number
  platformFee: number
  netAmount: number
  currency: string
  description: string
  referenceType: 'event_booking' | 'video_purchase' | 'withdrawal' | 'refund' | 'adjustment'
  referenceId?: string
  serviceType?: 'events' | 'movie_watch' | 'film_trade'
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  availableAt?: string
  razorpayTransferId?: string
  razorpayPaymentId?: string
  metadata?: {
    bookingId?: string
    purchaseId?: string
    customerName?: string
    customerEmail?: string
    itemTitle?: string
    isGovernmentEvent?: boolean
    platformFeePercentage?: number
  }
  createdAt: string
  updatedAt: string
}

export interface IWithdrawalRequest {
  _id: string
  walletId: string
  userId: string | { _id: string; name: string; email: string; phone?: string }
  amount: number
  currency: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  bankDetails: IBankDetails
  paymentGateway: string
  gatewayTransactionId?: string
  processedAt?: string
  failureReason?: string
  adminNotes?: string
  isRouteWithdrawal?: boolean
  razorpayTransferIds?: string[]
  createdAt: string
  updatedAt: string
}

export interface IWalletStats {
  wallet: IWallet
  earnings: {
    daily: number
    weekly: number
    monthly: number
    yearly: number
  }
  earningsByService: {
    [key: string]: { total: number; count: number }
  }
  recentTransactions: IWalletTransaction[]
  pendingWithdrawals: number
  pendingWithdrawalAmount: number
}

export interface IAdminWalletStats {
  totalPlatformEarnings: number
  dailyPlatformEarnings: number
  monthlyPlatformEarnings: number
  totalVendorPayouts: number
  pendingWithdrawals: number
  totalVendors: number
  platformFeeByService: {
    [key: string]: { total: number; count: number }
  }
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

export const walletApi = createApi({
  reducerPath: 'walletApi',
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
  tagTypes: ['Wallet', 'WalletTransaction', 'Withdrawal', 'AdminWalletStats'],
  endpoints: (builder) => ({
    // ============ VENDOR/USER WALLET ============
    getMyWallet: builder.query<IWallet, void>({
      query: () => '/wallet',
      transformResponse: (response: ApiResponse<IWallet>) => response.data,
      providesTags: ['Wallet'],
    }),

    getWalletStats: builder.query<IWalletStats, void>({
      query: () => '/wallet/stats',
      transformResponse: (response: ApiResponse<IWalletStats>) => response.data,
      providesTags: ['Wallet', 'WalletTransaction'],
    }),

    getWalletTransactions: builder.query<
      { data: IWalletTransaction[]; meta: ApiResponse<any>['meta'] },
      {
        page?: number
        limit?: number
        type?: string
        status?: string
        serviceType?: string
        startDate?: string
        endDate?: string
      }
    >({
      query: (params) => ({
        url: '/wallet/transactions',
        params,
      }),
      transformResponse: (response: ApiResponse<IWalletTransaction[]>) => ({
        data: response.data,
        meta: response.meta,
      }),
      providesTags: ['WalletTransaction'],
    }),

    updateBankDetails: builder.mutation<IWallet, IBankDetails>({
      query: (data) => ({
        url: '/wallet/bank-details',
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: ApiResponse<IWallet>) => response.data,
      invalidatesTags: ['Wallet'],
    }),

    deleteBankDetails: builder.mutation<IWallet, void>({
      query: () => ({
        url: '/wallet/bank-details',
        method: 'DELETE',
      }),
      transformResponse: (response: ApiResponse<IWallet>) => response.data,
      invalidatesTags: ['Wallet'],
    }),

    // ============ WITHDRAWALS ============
    requestWithdrawal: builder.mutation<IWithdrawalRequest, { amount: number }>({
      query: (data) => ({
        url: '/wallet/withdrawals',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: ApiResponse<IWithdrawalRequest>) => response.data,
      invalidatesTags: ['Wallet', 'Withdrawal'],
    }),

    getMyWithdrawals: builder.query<
      { data: IWithdrawalRequest[]; meta: ApiResponse<any>['meta'] },
      { page?: number; limit?: number; status?: string }
    >({
      query: (params) => ({
        url: '/wallet/withdrawals',
        params,
      }),
      transformResponse: (response: ApiResponse<IWithdrawalRequest[]>) => ({
        data: response.data,
        meta: response.meta,
      }),
      providesTags: ['Withdrawal'],
    }),

    cancelWithdrawal: builder.mutation<IWithdrawalRequest, string>({
      query: (id) => ({
        url: `/wallet/withdrawals/${id}/cancel`,
        method: 'POST',
      }),
      transformResponse: (response: ApiResponse<IWithdrawalRequest>) => response.data,
      invalidatesTags: ['Wallet', 'Withdrawal'],
    }),

    // ============ ADMIN ============
    getAllWallets: builder.query<
      { data: (IWallet & { userId: { _id: string; name: string; email: string; phone?: string } })[]; meta: ApiResponse<any>['meta'] },
      { page?: number; limit?: number; userType?: string }
    >({
      query: (params) => ({
        url: '/wallet/admin/wallets',
        params,
      }),
      transformResponse: (response: ApiResponse<(IWallet & { userId: { _id: string; name: string; email: string; phone?: string } })[]>) => ({
        data: response.data,
        meta: response.meta,
      }),
      providesTags: ['Wallet'],
    }),

    getAdminWalletStats: builder.query<IAdminWalletStats, void>({
      query: () => '/wallet/admin/stats',
      transformResponse: (response: ApiResponse<IAdminWalletStats>) => response.data,
      providesTags: ['AdminWalletStats'],
    }),

    getAllWithdrawals: builder.query<
      { data: IWithdrawalRequest[]; meta: ApiResponse<any>['meta'] },
      { page?: number; limit?: number; status?: string }
    >({
      query: (params) => ({
        url: '/wallet/admin/withdrawals',
        params,
      }),
      transformResponse: (response: ApiResponse<IWithdrawalRequest[]>) => ({
        data: response.data,
        meta: response.meta,
      }),
      providesTags: ['Withdrawal'],
    }),

    processWithdrawal: builder.mutation<
      IWithdrawalRequest,
      { id: string; status: string; gatewayTransactionId?: string; adminNotes?: string; failureReason?: string }
    >({
      query: ({ id, ...data }) => ({
        url: `/wallet/admin/withdrawals/${id}/process`,
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: ApiResponse<IWithdrawalRequest>) => response.data,
      invalidatesTags: ['Wallet', 'Withdrawal', 'AdminWalletStats'],
    }),
  }),
})

export const {
  // Vendor/User
  useGetMyWalletQuery,
  useGetWalletStatsQuery,
  useGetWalletTransactionsQuery,
  useUpdateBankDetailsMutation,
  useDeleteBankDetailsMutation,
  useRequestWithdrawalMutation,
  useGetMyWithdrawalsQuery,
  useCancelWithdrawalMutation,
  // Admin
  useGetAllWalletsQuery,
  useGetAdminWalletStatsQuery,
  useGetAllWithdrawalsQuery,
  useProcessWithdrawalMutation,
} = walletApi
