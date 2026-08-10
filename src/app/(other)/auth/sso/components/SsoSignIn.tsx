'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Card, Spinner } from 'react-bootstrap'

import defaultLogo from '@/assets/images/logo.png'
import { useAppDispatch } from '@/hooks/useAppDispatch'
import { setCredentials } from '@/store/authSlice'
import { useSsoExchangeMutation } from '@/store/apiSlice'
import { authService } from '@/services/authService'
import { useGetGeneralSettingsQuery } from '@/store/generalSettingsApi'

/**
 * Landing page for the mobile app's "Dashboard" button.
 *
 * The app opens this route with a one-time ticket in the query string. We trade
 * the ticket for a real session token, store it exactly like a password login
 * would, then hand off to the dashboard. The vendor never sees a login form.
 */
const SsoSignIn = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const [ssoExchange] = useSsoExchangeMutation()
  const { data: generalSettings } = useGetGeneralSettingsQuery()

  const [error, setError] = useState<string | null>(null)

  const ticket = searchParams.get('ticket')
  const redirectTo = searchParams.get('redirectTo') || '/dashboard'

  // Tickets are single-use, so this must fire exactly once — React's dev-mode
  // double-invoked effects would otherwise burn the ticket on the first call
  // and fail on the second.
  const hasRedeemed = useRef(false)

  const logoUrl = generalSettings?.logo || defaultLogo
  const isExternal = typeof logoUrl === 'string' && (logoUrl.includes('cloudinary') || logoUrl.includes('http'))

  useEffect(() => {
    if (hasRedeemed.current) return
    hasRedeemed.current = true

    if (!ticket) {
      setError('This dashboard link is missing its access ticket. Please open the dashboard from the app again.')
      return
    }

    const redeem = async () => {
      try {
        const result = await ssoExchange({ ticket }).unwrap()

        dispatch(setCredentials({ token: result.token, user: result.data }))
        authService.setToken(result.token)

        // replace() so the ticket URL never sits in the WebView's history.
        router.replace(redirectTo)
      } catch (err: any) {
        setError(
          err?.data?.message ||
            'We could not sign you in automatically. Please open the dashboard from the app again.',
        )
      }
    }

    redeem()
  }, [ticket, redirectTo, ssoExchange, dispatch, router])

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      <Card className="shadow-lg border-0 rounded-4 w-100 my-auto" style={{ maxWidth: '460px', marginInline: 'auto' }}>
        <div className="text-center p-5">
          <Link href="/dashboard" className="d-inline-block mb-3">
            <Image src={logoUrl} height={50} width={50} alt="logo" unoptimized={isExternal} />
          </Link>

          {error ? (
            <>
              <h2 className="fw-bold fs-20 mb-2">Sign-in link problem</h2>
              <p className="text-muted mb-4">{error}</p>
              <Link href="/auth/sign-in" className="btn btn-primary">
                Sign in with email instead
              </Link>
            </>
          ) : (
            <>
              <Spinner animation="border" variant="primary" className="mb-3" />
              <h2 className="fw-bold fs-20 mb-2">Signing you in…</h2>
              <p className="text-muted mb-0">Taking you to your dashboard.</p>
            </>
          )}
        </div>
      </Card>
    </div>
  )
}

export default SsoSignIn
