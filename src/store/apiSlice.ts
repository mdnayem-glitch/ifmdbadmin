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
  }),
})

export const { useLoginMutation } = apiSlice
