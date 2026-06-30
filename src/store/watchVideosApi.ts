import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState as IRootState } from '@/store'

// Interfaces
export interface ICountryPricing {
  countryCode: string
  countryName: string
  currency: string
  price: number
  isActive: boolean
}

export interface IEpisode {
  episodeNumber: number
  title: string
  description: string
  videoUrl: string
  thumbnailUrl: string
  duration: number
  releaseDate: string
  isActive: boolean
}

export interface ISeason {
  seasonNumber: number
  title: string
  description: string
  episodes: IEpisode[]
  releaseDate: string
  isActive: boolean
}

export interface ICast {
  name: string
  role: string
  image: string
}

export interface ICrew {
  name: string
  designation: string
  image: string
}

export interface IChannel {
  _id: string
  name: string
  description: string
  logoUrl: string
  bannerUrl: string
  ownerId: string
  ownerType: 'admin' | 'vendor'
  subscriberCount: number
  totalViews: number
  isVerified: boolean
  isActive: boolean
  socialLinks: {
    website?: string
    youtube?: string
    instagram?: string
    twitter?: string
    facebook?: string
  }
  createdAt: string
  updatedAt: string
}

export interface IWatchVideo {
  _id: string
  title: string
  description: string
  channelId: IChannel | string
  videoType: 'single' | 'series'
  category: string
  categoryId?: string
  genres: string[]
  languages: string[]
  tags: string[]
  videoUrl: string
  trailerUrl: string
  seasons: ISeason[]
  totalEpisodes: number
  thumbnailUrl: string
  posterUrl: string
  backdropUrl: string
  galleryImages: string[]
  duration: number
  releaseDate: string
  isFree: boolean
  defaultPrice: number
  countryPricing: ICountryPricing[]
  averageRating: number
  totalRatings: number
  viewCount: number
  likeCount: number
  ageRating: string
  certification: string
  director: string
  producer: string
  cast: ICast[]
  crew: ICrew[]
  status: 'draft' | 'published' | 'archived'
  isActive: boolean
  isFeatured: boolean
  uploadedBy: string
  uploadedByType: 'admin' | 'vendor'
  createdAt: string
  updatedAt: string
}

export interface IWatchVideoCategory {
  _id: string
  name: string
  description: string
  imageUrl: string
  iconUrl: string
  parentId?: string
  order: number
  isActive: boolean
  createdAt: string
  updatedAt: string
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

export const watchVideosApi = createApi({
  reducerPath: 'watchVideosApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:8080/v1/api',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as IRootState).auth?.token
      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: ['WatchVideos', 'Channels', 'WatchVideoCategories', 'VideoPurchases'],
  endpoints: (builder) => ({
    // ==================== CHANNELS ====================
    
    getChannels: builder.query<{ data: IChannel[]; meta: any }, any>({
      query: (params) => {
        const queryParams = new URLSearchParams()
        if (params?.page) queryParams.append('page', String(params.page))
        if (params?.limit) queryParams.append('limit', String(params.limit))
        if (params?.search) queryParams.append('search', params.search)
        return `/watch-videos/channels?${queryParams.toString()}`
      },
      transformResponse: (response: ApiResponse<IChannel[]>) => ({
        data: Array.isArray(response.data) ? response.data : [response.data],
        meta: response.meta || { page: 1, limit: 10, total: 0, totalPages: 0 }
      }),
      providesTags: ['Channels'],
    }),

    getChannelById: builder.query<IChannel, string>({
      query: (id) => `/watch-videos/channels/${id}`,
      transformResponse: (response: ApiResponse<IChannel>) => response.data,
      providesTags: (result, error, id) => [{ type: 'Channels', id }],
    }),

    createChannel: builder.mutation<IChannel, Partial<IChannel>>({
      query: (channel) => ({
        url: '/watch-videos/channels',
        method: 'POST',
        body: channel,
      }),
      transformResponse: (response: ApiResponse<IChannel>) => response.data,
      invalidatesTags: ['Channels'],
    }),

    updateChannel: builder.mutation<IChannel, { id: string; data: Partial<IChannel> }>({
      query: ({ id, data }) => ({
        url: `/watch-videos/channels/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: ApiResponse<IChannel>) => response.data,
      invalidatesTags: ['Channels'],
    }),

    deleteChannel: builder.mutation<void, string>({
      query: (id) => ({
        url: `/watch-videos/channels/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Channels'],
    }),

    // ==================== CATEGORIES ====================
    
    getWatchVideoCategories: builder.query<IWatchVideoCategory[], void>({
      query: () => '/watch-videos/categories',
      transformResponse: (response: ApiResponse<IWatchVideoCategory[]>) => 
        Array.isArray(response.data) ? response.data : [response.data],
      providesTags: ['WatchVideoCategories'],
    }),

    createWatchVideoCategory: builder.mutation<IWatchVideoCategory, Partial<IWatchVideoCategory>>({
      query: (category) => ({
        url: '/watch-videos/categories',
        method: 'POST',
        body: category,
      }),
      transformResponse: (response: ApiResponse<IWatchVideoCategory>) => response.data,
      invalidatesTags: ['WatchVideoCategories'],
    }),

    updateWatchVideoCategory: builder.mutation<IWatchVideoCategory, { id: string; data: Partial<IWatchVideoCategory> }>({
      query: ({ id, data }) => ({
        url: `/watch-videos/categories/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: ApiResponse<IWatchVideoCategory>) => response.data,
      invalidatesTags: ['WatchVideoCategories'],
    }),

    deleteWatchVideoCategory: builder.mutation<void, string>({
      query: (id) => ({
        url: `/watch-videos/categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['WatchVideoCategories'],
    }),

    // ==================== WATCH VIDEOS ====================
    
    getWatchVideos: builder.query<{ data: IWatchVideo[]; meta: any }, any>({
      query: (params) => {
        const queryParams = new URLSearchParams()
        if (params?.page) queryParams.append('page', String(params.page))
        if (params?.limit) queryParams.append('limit', String(params.limit))
        if (params?.search) queryParams.append('search', params.search)
        if (params?.status) queryParams.append('status', params.status)
        if (params?.videoType) queryParams.append('videoType', params.videoType)
        if (params?.category) queryParams.append('category', params.category)
        if (params?.channelId) queryParams.append('channelId', params.channelId)
        if (params?.uploadedBy) queryParams.append('uploadedBy', params.uploadedBy)
        return `/watch-videos?${queryParams.toString()}`
      },
      transformResponse: (response: ApiResponse<IWatchVideo[]>) => ({
        data: Array.isArray(response.data) ? response.data : [response.data],
        meta: response.meta || { page: 1, limit: 10, total: 0, totalPages: 0 }
      }),
      providesTags: ['WatchVideos'],
    }),

    getWatchVideoById: builder.query<IWatchVideo, string>({
      query: (id) => `/watch-videos/${id}`,
      transformResponse: (response: ApiResponse<IWatchVideo>) => response.data,
      providesTags: (result, error, id) => [{ type: 'WatchVideos', id }],
    }),

    createWatchVideo: builder.mutation<IWatchVideo, Partial<IWatchVideo>>({
      query: (video) => ({
        url: '/watch-videos',
        method: 'POST',
        body: video,
      }),
      transformResponse: (response: ApiResponse<IWatchVideo>) => response.data,
      invalidatesTags: ['WatchVideos'],
    }),

    updateWatchVideo: builder.mutation<IWatchVideo, { id: string; data: Partial<IWatchVideo> }>({
      query: ({ id, data }) => ({
        url: `/watch-videos/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: ApiResponse<IWatchVideo>) => response.data,
      invalidatesTags: ['WatchVideos'],
    }),

    deleteWatchVideo: builder.mutation<void, string>({
      query: (id) => ({
        url: `/watch-videos/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['WatchVideos'],
    }),

    // Add Season
    addSeason: builder.mutation<IWatchVideo, { videoId: string; seasonData: Partial<ISeason> }>({
      query: ({ videoId, seasonData }) => ({
        url: `/watch-videos/${videoId}/seasons`,
        method: 'POST',
        body: seasonData,
      }),
      transformResponse: (response: ApiResponse<IWatchVideo>) => response.data,
      invalidatesTags: ['WatchVideos'],
    }),

    // Add Episode
    addEpisode: builder.mutation<IWatchVideo, { videoId: string; seasonNumber: number; episodeData: Partial<IEpisode> }>({
      query: ({ videoId, seasonNumber, episodeData }) => ({
        url: `/watch-videos/${videoId}/seasons/${seasonNumber}/episodes`,
        method: 'POST',
        body: episodeData,
      }),
      transformResponse: (response: ApiResponse<IWatchVideo>) => response.data,
      invalidatesTags: ['WatchVideos'],
    }),

    // ==================== PURCHASES ====================
    
    getVideoPurchases: builder.query<{ data: any[]; meta: any }, any>({
      query: (params) => {
        const queryParams = new URLSearchParams()
        if (params?.page) queryParams.append('page', String(params.page))
        if (params?.limit) queryParams.append('limit', String(params.limit))
        if (params?.videoId) queryParams.append('videoId', params.videoId)
        if (params?.userId) queryParams.append('userId', params.userId)
        if (params?.paymentStatus) queryParams.append('paymentStatus', params.paymentStatus)
        return `/watch-videos/purchases?${queryParams.toString()}`
      },
      transformResponse: (response: any) => ({
        data: Array.isArray(response.data) ? response.data : [response.data],
        meta: response.meta || { page: 1, limit: 10, total: 0, totalPages: 0 }
      }),
      providesTags: ['VideoPurchases'],
    }),
  }),
})

export const {
  // Channels
  useGetChannelsQuery,
  useGetChannelByIdQuery,
  useCreateChannelMutation,
  useUpdateChannelMutation,
  useDeleteChannelMutation,
  
  // Categories
  useGetWatchVideoCategoriesQuery,
  useCreateWatchVideoCategoryMutation,
  useUpdateWatchVideoCategoryMutation,
  useDeleteWatchVideoCategoryMutation,
  
  // Watch Videos
  useGetWatchVideosQuery,
  useGetWatchVideoByIdQuery,
  useCreateWatchVideoMutation,
  useUpdateWatchVideoMutation,
  useDeleteWatchVideoMutation,
  useAddSeasonMutation,
  useAddEpisodeMutation,
  
  // Purchases
  useGetVideoPurchasesQuery,
} = watchVideosApi
