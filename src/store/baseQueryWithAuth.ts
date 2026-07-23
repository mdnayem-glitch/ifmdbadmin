import {
  BaseQueryFn,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react'
import { logout } from '@/store/authSlice'

const rawBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as { auth?: { token?: string | null } }).auth?.token
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
    return headers
  },
})

const PUBLIC_AUTH_PATHS = [
  'auth/signin',
  'auth/signup',
  'auth/forgot-password',
  'auth/reset-password',
  'auth/verify-otp',
]

function isPublicAuthRequest(args: string | FetchArgs): boolean {
  const url = typeof args === 'string' ? args : args.url
  return PUBLIC_AUTH_PATHS.some((path) => url.includes(path))
}

let isHandlingUnauthorized = false

function handleUnauthorized(): void {
  if (typeof window === 'undefined' || isHandlingUnauthorized) return

  isHandlingUnauthorized = true

  const pathname = window.location.pathname
  const isOnSignIn = pathname.startsWith('/auth/sign-in')
  const redirectQuery =
    !isOnSignIn && pathname !== '/'
      ? `?redirectTo=${encodeURIComponent(pathname)}`
      : ''

  window.location.href = `/auth/sign-in${redirectQuery}`
}

export const baseQueryWithAuth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions)

  if (
    result.error &&
    result.error.status === 401 &&
    !isPublicAuthRequest(args)
  ) {
    api.dispatch(logout())
    handleUnauthorized()
  }

  return result
}
