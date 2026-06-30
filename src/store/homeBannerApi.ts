import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState as IRootState } from '@/store'

export type BannerType = 'home' | 'film_mart' | 'events' | 'watch_movies'
export type BannerPlatform = 'web' | 'mobile' | 'both'

export const BANNER_TYPE_LABELS: Record<BannerType, string> = {
  home: 'Home',
  film_mart: 'Film Trade',
  events: 'Events',
  watch_movies: 'Watch Movies',
}

export const BANNER_TYPE_IMAGE_SIZES: Record<BannerType, { web: string; mobile: string }> = {
  home: { web: '1920 × 600 px', mobile: '1080 × 400 px' },
  film_mart: { web: '1920 × 400 px', mobile: '1080 × 360 px' },
  events: { web: '1920 × 400 px', mobile: '1080 × 360 px' },
  watch_movies: { web: '1920 × 400 px', mobile: '1080 × 360 px' },
}

export interface IHomeBanner {
  _id: string
  title?: string
  order?: number
  image: string
  bannerType: BannerType
  platform: BannerPlatform
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface HomeBannerResponse {
  success: boolean
  statusCode: number
  message: string
  data: IHomeBanner | IHomeBanner[]
}

export const homeBannerApi = createApi({
  reducerPath: 'homeBannerApi',
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
  tagTypes: ['homeBanner'],
  endpoints: (builder) => ({
    getHomeBanner: builder.query<IHomeBanner[], void>({
      query: () => '/banners',
      transformResponse: (response: HomeBannerResponse) => (Array.isArray(response.data) ? response.data : [response.data]),
      providesTags: ['homeBanner'],
    }),

    getHomeBannerById: builder.query<IHomeBanner, string>({
      query: (id) => `/banners/${id}`,
      transformResponse: (response: HomeBannerResponse) => response.data as IHomeBanner,
      providesTags: (result, error, id) => [{ type: 'homeBanner', id }],
    }),

    createHomeBanner: builder.mutation<IHomeBanner, FormData>({
      query: (formData) => ({
        url: '/banners',
        method: 'POST',
        body: formData,
      }),
      transformResponse: (response: HomeBannerResponse) => response.data as IHomeBanner,
      invalidatesTags: ['homeBanner'],
    }),

    updateHomeBanner: builder.mutation<IHomeBanner, { id: string; data: FormData }>({
      query: ({ id, data }) => ({
        url: `/banners/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: HomeBannerResponse) => response.data as IHomeBanner,
      invalidatesTags: (result, error, { id }) => [{ type: 'homeBanner', id }, 'homeBanner'],
    }),

    deleteHomeBanner: builder.mutation<IHomeBanner, string>({
      query: (id) => ({
        url: `/banners/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: HomeBannerResponse) => response.data as IHomeBanner,
      invalidatesTags: ['homeBanner'],
    }),
  }),
})

export const {
  useGetHomeBannerQuery,
  useGetHomeBannerByIdQuery,
  useCreateHomeBannerMutation,
  useUpdateHomeBannerMutation,
  useDeleteHomeBannerMutation,
} = homeBannerApi
