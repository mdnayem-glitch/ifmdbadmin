'use client'
import React, { useState, useEffect } from 'react'
import { Button, Spinner } from 'react-bootstrap'

interface ChannelSubscribeButtonProps {
  channelId: string
  channelName: string
  variant?: 'primary' | 'outline-primary' | 'secondary'
  size?: 'sm' | 'lg'
  showNotificationToggle?: boolean
}

const ChannelSubscribeButton: React.FC<ChannelSubscribeButtonProps> = ({
  channelId,
  channelName,
  variant = 'primary',
  size,
  showNotificationToggle = true
}) => {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingStatus, setIsCheckingStatus] = useState(true)

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/v1/api'

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('authToken') || ''
  }

  // Check subscription status on mount
  useEffect(() => {
    checkSubscriptionStatus()
  }, [channelId])

  const checkSubscriptionStatus = async () => {
    try {
      setIsCheckingStatus(true)
      const token = getAuthToken()
      
      const response = await fetch(
        `${API_BASE_URL}/watch-videos/channels/${channelId}/subscription`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        setIsSubscribed(data.data.isSubscribed)
        setIsNotificationEnabled(data.data.isNotificationEnabled)
      }
    } catch (error) {
      console.error('Error checking subscription status:', error)
    } finally {
      setIsCheckingStatus(false)
    }
  }

  const handleSubscribe = async () => {
    try {
      setIsLoading(true)
      const token = getAuthToken()

      const response = await fetch(
        `${API_BASE_URL}/watch-videos/channels/${channelId}/subscribe`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (response.ok) {
        setIsSubscribed(true)
        setIsNotificationEnabled(true)
        // Show success message
        alert(`Successfully subscribed to ${channelName}!`)
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to subscribe')
      }
    } catch (error) {
      console.error('Error subscribing:', error)
      alert('Failed to subscribe. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUnsubscribe = async () => {
    if (!confirm(`Are you sure you want to unsubscribe from ${channelName}?`)) {
      return
    }

    try {
      setIsLoading(true)
      const token = getAuthToken()

      const response = await fetch(
        `${API_BASE_URL}/watch-videos/channels/${channelId}/unsubscribe`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (response.ok) {
        setIsSubscribed(false)
        setIsNotificationEnabled(false)
        alert(`Successfully unsubscribed from ${channelName}`)
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to unsubscribe')
      }
    } catch (error) {
      console.error('Error unsubscribing:', error)
      alert('Failed to unsubscribe. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleNotification = async () => {
    try {
      setIsLoading(true)
      const token = getAuthToken()
      const newNotificationState = !isNotificationEnabled

      const response = await fetch(
        `${API_BASE_URL}/watch-videos/channels/${channelId}/toggle-notification`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            isNotificationEnabled: newNotificationState
          })
        }
      )

      if (response.ok) {
        setIsNotificationEnabled(newNotificationState)
        alert(
          newNotificationState
            ? `Notifications enabled for ${channelName}`
            : `Notifications disabled for ${channelName}`
        )
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to update notification settings')
      }
    } catch (error) {
      console.error('Error toggling notification:', error)
      alert('Failed to update notification settings. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isCheckingStatus) {
    return (
      <Button variant={variant} size={size} disabled>
        <Spinner animation="border" size="sm" />
      </Button>
    )
  }

  return (
    <div className="d-flex gap-2 align-items-center">
      <Button
        variant={isSubscribed ? 'outline-secondary' : variant}
        size={size}
        onClick={isSubscribed ? handleUnsubscribe : handleSubscribe}
        disabled={isLoading}
      >
        {isLoading ? (
          <Spinner animation="border" size="sm" />
        ) : isSubscribed ? (
          'Subscribed'
        ) : (
          'Subscribe'
        )}
      </Button>

      {isSubscribed && showNotificationToggle && (
        <Button
          variant={isNotificationEnabled ? 'primary' : 'outline-secondary'}
          size={size}
          onClick={handleToggleNotification}
          disabled={isLoading}
          title={
            isNotificationEnabled
              ? 'Notifications enabled'
              : 'Notifications disabled'
          }
        >
          {isNotificationEnabled ? '🔔' : '🔕'}
        </Button>
      )}
    </div>
  )
}

export default ChannelSubscribeButton
