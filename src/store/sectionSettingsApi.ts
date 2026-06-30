import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState as IRootState } from '@/store'

export interface ISectionDividerStyle {
  backgroundType: 'solid' | 'gradient' | 'image'
  backgroundColor: string
  gradientFrom: string
  gradientVia: string
  gradientTo: string
  gradientDirection: string
  backgroundImage: string
  backgroundOpacity: number
  titleColor: string
  titleGradientEnabled: boolean
  titleGradientFrom: string
  titleGradientVia: string
  titleGradientTo: string
  subtitleColor: string
  titleFontSize: string
  titleFontWeight: string
  subtitleFontSize: string
  borderColor: string
  borderWidth: string
  borderStyle: string
  paddingY: string
  paddingX: string
  animation: string
}

export interface ISectionDivider {
  _id: string
  sectionKey: string
  title: string
  subtitle: string
  icon: string
  isActive: boolean
  order: number
  style: ISectionDividerStyle
  createdAt: string
  updatedAt: string
}

export interface ISectionTitleStyle {
  textColor: string
  textGradientEnabled: boolean
  gradientFrom: string
  gradientVia: string
  gradientTo: string
  fontSize: string
  fontWeight: string
  iconColor: string
  iconSize: string
  iconPosition: string
  backgroundColor: string
  backgroundOpacity: number
  borderRadius: string
  borderColor: string
  borderWidth: string
  paddingY: string
  paddingX: string
  marginBottom: string
  accentEnabled: boolean
  accentColor: string
  accentWidth: string
  accentPosition: string
  hoverEffect: string
  hoverColor: string
}

export interface ISectionTitle {
  _id: string
  sectionKey: string
  parentDivider: string
  title: string
  icon: string
  viewMoreLink: string
  isActive: boolean
  order: number
  style: ISectionTitleStyle
  createdAt: string
  updatedAt: string
}

interface ApiResponse<T> {
  success: boolean
  statusCode: number
  message: string
  data: T
}

export const sectionSettingsApi = createApi({
  reducerPath: 'sectionSettingsApi',
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
  tagTypes: ['SectionDivider', 'SectionTitle'],
  endpoints: (builder) => ({
    // Get all section settings (public)
    getAllSectionSettings: builder.query<{ dividers: ISectionDivider[]; titles: ISectionTitle[]; grouped: any[] }, void>({
      query: () => '/section-settings',
      transformResponse: (response: ApiResponse<{ dividers: ISectionDivider[]; titles: ISectionTitle[]; grouped: any[] }>) => response.data,
      providesTags: ['SectionDivider', 'SectionTitle'],
    }),

    // Dividers
    getSectionDividers: builder.query<ISectionDivider[], void>({
      query: () => '/section-settings/dividers',
      transformResponse: (response: ApiResponse<ISectionDivider[]>) => response.data,
      providesTags: ['SectionDivider'],
    }),

    getSectionDividerByKey: builder.query<ISectionDivider, string>({
      query: (key) => `/section-settings/dividers/${key}`,
      transformResponse: (response: ApiResponse<ISectionDivider>) => response.data,
      providesTags: (result, error, key) => [{ type: 'SectionDivider', id: key }],
    }),

    createSectionDivider: builder.mutation<ISectionDivider, Partial<ISectionDivider>>({
      query: (data) => ({
        url: '/section-settings/dividers',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: ApiResponse<ISectionDivider>) => response.data,
      invalidatesTags: ['SectionDivider'],
    }),

    updateSectionDivider: builder.mutation<ISectionDivider, { key: string; data: Partial<ISectionDivider> }>({
      query: ({ key, data }) => ({
        url: `/section-settings/dividers/${key}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: ApiResponse<ISectionDivider>) => response.data,
      invalidatesTags: ['SectionDivider'],
    }),

    deleteSectionDivider: builder.mutation<void, string>({
      query: (key) => ({
        url: `/section-settings/dividers/${key}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SectionDivider'],
    }),

    // Titles
    getSectionTitles: builder.query<ISectionTitle[], void>({
      query: () => '/section-settings/titles',
      transformResponse: (response: ApiResponse<ISectionTitle[]>) => response.data,
      providesTags: ['SectionTitle'],
    }),

    getSectionTitleByKey: builder.query<ISectionTitle, string>({
      query: (key) => `/section-settings/titles/${key}`,
      transformResponse: (response: ApiResponse<ISectionTitle>) => response.data,
      providesTags: (result, error, key) => [{ type: 'SectionTitle', id: key }],
    }),

    createSectionTitle: builder.mutation<ISectionTitle, Partial<ISectionTitle>>({
      query: (data) => ({
        url: '/section-settings/titles',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: ApiResponse<ISectionTitle>) => response.data,
      invalidatesTags: ['SectionTitle'],
    }),

    updateSectionTitle: builder.mutation<ISectionTitle, { key: string; data: Partial<ISectionTitle> }>({
      query: ({ key, data }) => ({
        url: `/section-settings/titles/${key}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: ApiResponse<ISectionTitle>) => response.data,
      invalidatesTags: ['SectionTitle'],
    }),

    deleteSectionTitle: builder.mutation<void, string>({
      query: (key) => ({
        url: `/section-settings/titles/${key}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SectionTitle'],
    }),

    // Seed defaults
    seedDefaultSettings: builder.mutation<{ dividers: ISectionDivider[]; titles: ISectionTitle[] }, void>({
      query: () => ({
        url: '/section-settings/seed',
        method: 'POST',
      }),
      transformResponse: (response: ApiResponse<{ dividers: ISectionDivider[]; titles: ISectionTitle[] }>) => response.data,
      invalidatesTags: ['SectionDivider', 'SectionTitle'],
    }),
  }),
})

export const {
  useGetAllSectionSettingsQuery,
  useGetSectionDividersQuery,
  useGetSectionDividerByKeyQuery,
  useCreateSectionDividerMutation,
  useUpdateSectionDividerMutation,
  useDeleteSectionDividerMutation,
  useGetSectionTitlesQuery,
  useGetSectionTitleByKeyQuery,
  useCreateSectionTitleMutation,
  useUpdateSectionTitleMutation,
  useDeleteSectionTitleMutation,
  useSeedDefaultSettingsMutation,
} = sectionSettingsApi
