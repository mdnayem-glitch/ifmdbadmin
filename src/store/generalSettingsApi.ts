import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithAuth } from '@/store/baseQueryWithAuth'

// ---------- Interfaces ----------
export interface IGeneralSettings {
  _id: string
  number: string
  email: string
  facebook: string
  instagram: string
  linkedin: string
  twitter: string
  youtube: string
  favicon: string | null // URL from API
  logo: string | null // URL from API
  createdAt: string
  updatedAt: string
}

interface GeneralSettingsResponse {
  success: boolean
  statusCode: number
  message: string
  data: IGeneralSettings
}

// ---------- API Slice ----------
export const generalSettingsApi = createApi({
  reducerPath: 'generalSettingsApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['generalSettings'],
  endpoints: (builder) => ({
    getGeneralSettings: builder.query<IGeneralSettings, void>({
      query: () => '/general-settings',
      transformResponse: (response: GeneralSettingsResponse) => response.data,
      providesTags: ['generalSettings'],
    }),

    updateGeneralSettings: builder.mutation<IGeneralSettings, FormData>({
      query: (formData) => ({
        url: '/general-settings',
        method: 'PUT',
        body: formData,
        // ❌ do NOT set Content-Type, browser will set it with boundary
      }),
      transformResponse: (response: GeneralSettingsResponse) => response.data,
      invalidatesTags: ['generalSettings'],
    }),
  }),
})

export const { useGetGeneralSettingsQuery, useUpdateGeneralSettingsMutation } = generalSettingsApi
