import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithAuth } from '@/store/baseQueryWithAuth'

// Login request payload
export interface LoginRequest {
  email: string
  password: string
}

// User object in response
export interface UserData {
  _id: string
  name: string
  phone: string
  email: string
  role: string
  status: string
  packageFeatures: any[]
  menuBookmarks: any[]
  createdAt: string
  updatedAt: string
  __v: number
}

// Login response
export interface LoginResponse {
  success: boolean
  statusCode: number
  message: string
  token: string
  data: UserData
}

// One-time ticket handed over by the mobile app to sign a vendor in without
// re-entering credentials. Redeems to the same payload as a password login.
export interface SsoExchangeRequest {
  ticket: string
}

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithAuth,
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: 'auth/signin',
        method: 'POST',
        body: credentials, // ✅ Pass the object, not a string
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    }),
    ssoExchange: builder.mutation<LoginResponse, SsoExchangeRequest>({
      query: (body) => ({
        url: 'auth/sso-exchange',
        method: 'POST',
        body,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    }),
  }),
})

export const { useLoginMutation, useSsoExchangeMutation } = apiSlice
