import { Metadata } from 'next'
import { Suspense } from 'react'
import FallbackLoading from '@/components/FallbackLoading'
import SsoSignIn from './components/SsoSignIn'

export const metadata: Metadata = { title: 'Signing In' }

// The ticket arrives as a query param, so this route is always client-rendered.
export const dynamic = 'force-dynamic'

const page = () => {
  return (
    <Suspense fallback={<FallbackLoading />}>
      <SsoSignIn />
    </Suspense>
  )
}

export default page
