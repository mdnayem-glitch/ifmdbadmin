import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState as IRootState } from '@/store'

export interface IUserProfile {
  _id: string
  name: string
  email: string
  phone?: string
  img?: string
  role: 'admin' | 'vendor' | 'user'
  vendorServices?: ('film_trade' | 'events' | 'movie_watch')[]
  authProvider?: 'local' | 'google' | 'phone'
  status?: string
  createdAt: string
  updatedAt: string
}

interface ProfileResponse {
  success: boolean
  statusCode: number
  message: string
  data: IUserProfile
}

interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

interface UpdateProfileRequest {
  name?: string
  phone?: string
}

export const profileApi = createApi({
  reducerPath: 'profileApi',
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
  tagTypes: ['Profile'],
  endpoints: (builder) => ({
    getProfile: builder.query<IUserProfile, string>({
      query: (userId) => `/auth/profile/${userId}`,
      transformResponse: (response: ProfileResponse) => response.data,
      providesTags: ['Profile'],
    }),

    updateProfile: builder.mutation<IUserProfile, { userId: string; data: UpdateProfileRequest }>({
      query: ({ userId, data }) => ({
        url: `/auth/profile/${userId}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: ProfileResponse) => response.data,
      invalidatesTags: ['Profile'],
    }),

    changePassword: builder.mutation<{ success: boolean; message: string }, { userId: string; data: ChangePasswordRequest }>({
      query: ({ userId, data }) => ({
        url: `/auth/change-password/${userId}`,
        method: 'POST',
        body: data,
      }),
    }),
  }),
})

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
} = profileApi
