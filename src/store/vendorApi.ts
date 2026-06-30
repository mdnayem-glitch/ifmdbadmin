import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState as IRootState } from '@/store'

// Types
export interface IVendorPackage {
  _id: string
  name: string
  description: string
  price: number
  duration: number
  durationType: 'days' | 'months' | 'years'
  features: string[]
  serviceType: 'film_trade'
  isPopular: boolean
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface IPlatformSetting {
  _id: string
  key: string
  value: number
  label: string
  description: string
  updatedAt: string
}

export interface ISelectedService {
  serviceType: 'film_trade' | 'events' | 'movie_watch'
  packageId?: string
  packageName?: string
  packagePrice?: number
  platformFee?: number
}

export interface IPaymentInfo {
  transactionId?: string
  amount: number
  status: 'pending' | 'completed' | 'failed'
  paymentMethod?: string
  paidAt?: string
}

export interface IVendorUserPopulated {
  _id: string
  name?: string
  email?: string
  phone?: string
  role?: string
  isBlocked?: boolean
  blockedAt?: string
  blockedReason?: string
}

export interface IVendorApplication {
  _id: string
  userId?: string
  vendorName: string
  businessType: string
  gstNumber?: string
  country: string
  address: string
  email: string
  phone: string
  // India specific KYC
  aadharFrontUrl?: string
  aadharBackUrl?: string
  panImageUrl?: string
  // International KYC
  nationalIdUrl?: string
  passportUrl?: string
  selectedServices: ISelectedService[]
  paymentInfo?: IPaymentInfo
  requiresPayment: boolean
  totalAmount: number
  status: 'pending' | 'approved' | 'rejected'
  rejectionReason?: string
  // Populated linked User account (when present) so admin UI can show block state
  vendorUserId?: string | IVendorUserPopulated
  approvedAt?: string
  createdAt: string
  updatedAt: string
}

interface ApiResponse<T> {
  success: boolean
  statusCode: number
  message: string
  data: T
}

export const vendorApi = createApi({
  reducerPath: 'vendorApi',
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
  tagTypes: ['VendorPackage', 'PlatformSetting', 'VendorApplication', 'MySubscription'],
  endpoints: (builder) => ({
    // ============ PACKAGES ============
    getVendorPackages: builder.query<IVendorPackage[], { activeOnly?: boolean } | void>({
      query: (params) => ({
        url: '/vendors/packages',
        params: params || {},
      }),
      transformResponse: (response: ApiResponse<IVendorPackage[]>) => response.data,
      providesTags: ['VendorPackage'],
    }),

    getVendorPackageById: builder.query<IVendorPackage, string>({
      query: (id) => `/vendors/packages/${id}`,
      transformResponse: (response: ApiResponse<IVendorPackage>) => response.data,
      providesTags: (result, error, id) => [{ type: 'VendorPackage', id }],
    }),

    createVendorPackage: builder.mutation<IVendorPackage, Partial<IVendorPackage>>({
      query: (data) => ({
        url: '/vendors/packages',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: ApiResponse<IVendorPackage>) => response.data,
      invalidatesTags: ['VendorPackage'],
    }),

    updateVendorPackage: builder.mutation<IVendorPackage, { id: string; data: Partial<IVendorPackage> }>({
      query: ({ id, data }) => ({
        url: `/vendors/packages/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: ApiResponse<IVendorPackage>) => response.data,
      invalidatesTags: (result, error, { id }) => [{ type: 'VendorPackage', id }, 'VendorPackage'],
    }),

    deleteVendorPackage: builder.mutation<void, string>({
      query: (id) => ({
        url: `/vendors/packages/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['VendorPackage'],
    }),

    // ============ PLATFORM SETTINGS ============
    getPlatformSettings: builder.query<IPlatformSetting[], void>({
      query: () => '/vendors/settings',
      transformResponse: (response: ApiResponse<IPlatformSetting[]>) => response.data,
      providesTags: ['PlatformSetting'],
    }),

    updatePlatformSetting: builder.mutation<IPlatformSetting, { key: string; value: number }>({
      query: (data) => ({
        url: '/vendors/settings',
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: ApiResponse<IPlatformSetting>) => response.data,
      invalidatesTags: ['PlatformSetting'],
    }),

    // ============ VENDOR APPLICATIONS ============
    getVendorApplications: builder.query<IVendorApplication[], { status?: string; search?: string } | void>({
      query: (params) => ({
        url: '/vendors/applications',
        params: params || {},
      }),
      transformResponse: (response: ApiResponse<IVendorApplication[]>) => response.data,
      providesTags: ['VendorApplication'],
    }),

    getVendorApplicationById: builder.query<IVendorApplication, string>({
      query: (id) => `/vendors/applications/${id}`,
      transformResponse: (response: ApiResponse<IVendorApplication>) => response.data,
      providesTags: (result, error, id) => [{ type: 'VendorApplication', id }],
    }),

    approveVendorApplication: builder.mutation<IVendorApplication, string>({
      query: (id) => ({
        url: `/vendors/applications/${id}/decision`,
        method: 'PATCH',
        body: { decision: 'approve' },
      }),
      transformResponse: (response: ApiResponse<IVendorApplication>) => response.data,
      invalidatesTags: ['VendorApplication'],
    }),

    rejectVendorApplication: builder.mutation<IVendorApplication, { id: string; rejectionReason: string }>({
      query: ({ id, rejectionReason }) => ({
        url: `/vendors/applications/${id}/decision`,
        method: 'PATCH',
        body: { decision: 'reject', rejectionReason },
      }),
      transformResponse: (response: ApiResponse<IVendorApplication>) => response.data,
      invalidatesTags: ['VendorApplication'],
    }),

    deleteVendorApplication: builder.mutation<void, string>({
      query: (id) => ({
        url: `/vendors/applications/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['VendorApplication'],
    }),

    // Block a vendor — disables their login and hides their events/movies/videos on the frontend
    blockVendorApplication: builder.mutation<{ application: IVendorApplication; vendorUser: IVendorUserPopulated }, { id: string; reason?: string }>({
      query: ({ id, reason }) => ({
        url: `/vendors/applications/${id}/block`,
        method: 'PATCH',
        body: { reason: reason || '' },
      }),
      transformResponse: (response: ApiResponse<{ application: IVendorApplication; vendorUser: IVendorUserPopulated }>) => response.data,
      invalidatesTags: ['VendorApplication'],
    }),

    // Unblock a vendor — restores login and content visibility
    unblockVendorApplication: builder.mutation<{ application: IVendorApplication; vendorUser: IVendorUserPopulated }, string>({
      query: (id) => ({
        url: `/vendors/applications/${id}/unblock`,
        method: 'PATCH',
      }),
      transformResponse: (response: ApiResponse<{ application: IVendorApplication; vendorUser: IVendorUserPopulated }>) => response.data,
      invalidatesTags: ['VendorApplication'],
    }),

    // ============ MY SUBSCRIPTION (Vendor - Film Trade) ============
    getMySubscription: builder.query<IMySubscriptionResponse, void>({
      query: () => '/vendors/my-subscription',
      transformResponse: (response: ApiResponse<IMySubscriptionResponse>) => response.data,
      providesTags: ['MySubscription'],
    }),

    createRenewalOrder: builder.mutation<IRenewalOrderResponse, { packageId: string }>({
      query: (data) => ({
        url: '/vendors/my-subscription/renew/create-order',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: ApiResponse<IRenewalOrderResponse>) => response.data,
    }),

    verifyRenewal: builder.mutation<
      { subscriptionEnd: string; lastRenewedAt: string; packageName: string; amount: number },
      {
        razorpay_order_id: string
        razorpay_payment_id: string
        razorpay_signature: string
        packageId: string
      }
    >({
      query: (data) => ({
        url: '/vendors/my-subscription/renew/verify',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: ApiResponse<any>) => response.data,
      invalidatesTags: ['MySubscription'],
    }),
  }),
})

// ===== Subscription response types =====
export interface ISubscriptionPaymentEntry {
  transactionId?: string
  amount: number
  status: 'pending' | 'completed' | 'failed'
  paymentMethod?: string
  paidAt?: string
  type: 'initial' | 'renewal'
  packageId?: string
  packageName?: string
  durationDays?: number
  periodStart?: string
  periodEnd?: string
}

export interface IMySubscription {
  packageId?: string | IVendorPackage
  packageName?: string
  subscriptionStart?: string
  subscriptionEnd?: string
  status: 'active' | 'expired' | 'pending_payment'
  daysRemaining: number | null
  daysOverdue: number | null
  lastRenewedAt?: string
  paymentHistory: ISubscriptionPaymentEntry[]
}

export interface IMySubscriptionResponse {
  hasFilmTrade: boolean
  subscription: IMySubscription | null
  packages: IVendorPackage[]
}

export interface IRenewalOrderResponse {
  orderId: string
  razorpayOrderId: string
  amount: number
  currency: string
  packageId: string
  packageName: string
  keyId: string
}

export const {
  // Packages
  useGetVendorPackagesQuery,
  useGetVendorPackageByIdQuery,
  useCreateVendorPackageMutation,
  useUpdateVendorPackageMutation,
  useDeleteVendorPackageMutation,
  // Settings
  useGetPlatformSettingsQuery,
  useUpdatePlatformSettingMutation,
  // Applications
  useGetVendorApplicationsQuery,
  useGetVendorApplicationByIdQuery,
  useApproveVendorApplicationMutation,
  useRejectVendorApplicationMutation,
  useDeleteVendorApplicationMutation,
  useBlockVendorApplicationMutation,
  useUnblockVendorApplicationMutation,
  // Subscription
  useGetMySubscriptionQuery,
  useCreateRenewalOrderMutation,
  useVerifyRenewalMutation,
} = vendorApi
