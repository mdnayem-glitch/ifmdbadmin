# Notification System Integration Guide

## Overview

This guide explains how to integrate the notification system into the MovieMart admin panel and frontend.

## Components Created

### 1. ChannelSubscribeButton Component

Location: `/adminpanel/src/components/ChannelSubscribeButton.tsx`

A reusable component for subscribing/unsubscribing to channels and managing notification preferences.

#### Usage Example

```tsx
import ChannelSubscribeButton from '@/components/ChannelSubscribeButton'

// In your channel page or video page
<ChannelSubscribeButton 
  channelId="channel_id_here"
  channelName="Channel Name"
  variant="primary"
  size="sm"
  showNotificationToggle={true}
/>
```

#### Props

- `channelId` (required): The channel ID to subscribe to
- `channelName` (required): Display name of the channel
- `variant`: Button style ('primary' | 'outline-primary' | 'secondary')
- `size`: Button size ('sm' | 'lg')
- `showNotificationToggle`: Show notification bell toggle button (default: true)

## Integration Steps

### 1. Add Subscribe Button to Channel List

Update: `/adminpanel/src/app/(admin)/watch-videos/channels-list/components/ChannelsList.tsx`

```tsx
import ChannelSubscribeButton from '@/components/ChannelSubscribeButton'

// In your channel list rendering
{channels.map((channel) => (
  <div key={channel._id} className="channel-card">
    <h3>{channel.name}</h3>
    <p>{channel.description}</p>
    
    {/* Add subscribe button */}
    <ChannelSubscribeButton 
      channelId={channel._id}
      channelName={channel.name}
      variant="primary"
      size="sm"
    />
  </div>
))}
```

### 2. Add Subscribe Button to Video Pages

When displaying videos, show the subscribe button for the channel:

```tsx
import ChannelSubscribeButton from '@/components/ChannelSubscribeButton'

// In video details page
<div className="video-channel-info">
  <h4>{video.channelName}</h4>
  <ChannelSubscribeButton 
    channelId={video.channelId}
    channelName={video.channelName}
    variant="outline-primary"
  />
</div>
```

### 3. Create Notification Display Component

Create a notification bell icon in your header/navbar:

```tsx
'use client'
import React, { useState, useEffect } from 'react'
import { Badge, Dropdown } from 'react-bootstrap'
import Link from 'next/link'

const NotificationBell = () => {
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState([])
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/v1/api'

  useEffect(() => {
    fetchUnreadCount()
    fetchNotifications()
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      fetchUnreadCount()
      fetchNotifications()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`${API_BASE_URL}/notifications/unread-count`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setUnreadCount(data.data.unreadCount)
      }
    } catch (error) {
      console.error('Error fetching unread count:', error)
    }
  }

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`${API_BASE_URL}/notifications?limit=5`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.data.notifications)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('authToken')
      await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      fetchUnreadCount()
      fetchNotifications()
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('authToken')
      await fetch(`${API_BASE_URL}/notifications/mark-all-read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      fetchUnreadCount()
      fetchNotifications()
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  return (
    <Dropdown align="end">
      <Dropdown.Toggle variant="link" className="position-relative p-2">
        🔔
        {unreadCount > 0 && (
          <Badge 
            bg="danger" 
            className="position-absolute top-0 start-100 translate-middle"
            pill
          >
            {unreadCount}
          </Badge>
        )}
      </Dropdown.Toggle>

      <Dropdown.Menu style={{ minWidth: '350px', maxHeight: '400px', overflowY: 'auto' }}>
        <Dropdown.Header className="d-flex justify-content-between align-items-center">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <button 
              className="btn btn-sm btn-link p-0"
              onClick={markAllAsRead}
            >
              Mark all as read
            </button>
          )}
        </Dropdown.Header>
        <Dropdown.Divider />
        
        {notifications.length === 0 ? (
          <Dropdown.Item disabled>No notifications</Dropdown.Item>
        ) : (
          notifications.map((notif: any) => (
            <Dropdown.Item
              key={notif._id}
              onClick={() => {
                markAsRead(notif._id)
                // Navigate to video if it's a new video notification
                if (notif.data?.videoId) {
                  window.location.href = `/watch-videos/${notif.data.videoId}`
                }
              }}
              className={!notif.isRead ? 'bg-light' : ''}
            >
              <div>
                <strong>{notif.title}</strong>
                <p className="mb-0 small text-muted">{notif.message}</p>
                <small className="text-muted">
                  {new Date(notif.createdAt).toLocaleDateString()}
                </small>
              </div>
            </Dropdown.Item>
          ))
        )}
        
        <Dropdown.Divider />
        <Dropdown.Item as={Link} href="/notifications" className="text-center">
          View all notifications
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  )
}

export default NotificationBell
```

### 4. Add Notification Bell to Header

Update your header/navbar component:

```tsx
import NotificationBell from '@/components/NotificationBell'

// In your header component
<nav className="navbar">
  <div className="navbar-brand">MovieMart</div>
  <div className="navbar-actions">
    <NotificationBell />
    {/* Other header items */}
  </div>
</nav>
```

### 5. Create Notifications Page

Create a full notifications page at `/adminpanel/src/app/(admin)/notifications/page.tsx`:

```tsx
'use client'
import React, { useState, useEffect } from 'react'
import { Card, Button, Spinner, Badge } from 'react-bootstrap'

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/v1/api'

  useEffect(() => {
    fetchNotifications()
  }, [page])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('authToken')
      const response = await fetch(
        `${API_BASE_URL}/notifications?page=${page}&limit=20`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      )
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.data.notifications)
        setTotalPages(data.data.pagination.totalPages)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('authToken')
      await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      fetchNotifications()
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('authToken')
      await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      fetchNotifications()
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  if (loading) {
    return (
      <div className="text-center p-5">
        <Spinner animation="border" />
      </div>
    )
  }

  return (
    <div className="container py-4">
      <h1 className="mb-4">Notifications</h1>
      
      {notifications.length === 0 ? (
        <Card>
          <Card.Body className="text-center py-5">
            <p className="text-muted">No notifications yet</p>
          </Card.Body>
        </Card>
      ) : (
        <>
          {notifications.map((notif: any) => (
            <Card key={notif._id} className="mb-3">
              <Card.Body className={!notif.isRead ? 'bg-light' : ''}>
                <div className="d-flex justify-content-between align-items-start">
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <h5 className="mb-0">{notif.title}</h5>
                      {!notif.isRead && <Badge bg="primary">New</Badge>}
                    </div>
                    <p className="mb-2">{notif.message}</p>
                    <small className="text-muted">
                      {new Date(notif.createdAt).toLocaleString()}
                    </small>
                  </div>
                  <div className="d-flex gap-2">
                    {!notif.isRead && (
                      <Button 
                        size="sm" 
                        variant="outline-primary"
                        onClick={() => markAsRead(notif._id)}
                      >
                        Mark as read
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="outline-danger"
                      onClick={() => deleteNotification(notif._id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card>
          ))}
          
          {/* Pagination */}
          <div className="d-flex justify-content-center gap-2 mt-4">
            <Button 
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <span className="align-self-center">
              Page {page} of {totalPages}
            </span>
            <Button 
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

export default NotificationsPage
```

## API Integration

All API calls use the following base URL:
```
http://localhost:8080/v1/api (development)
```

Set in environment variable: `NEXT_PUBLIC_API_URL`

### Authentication

All API requests require an Authorization header:
```
Authorization: Bearer {token}
```

The token is stored in `localStorage.getItem('authToken')`

## Testing

1. **Subscribe to a channel**:
   - Navigate to channels list
   - Click "Subscribe" button
   - Verify subscription status changes

2. **Upload a video**:
   - Admin/vendor uploads a video to a channel
   - Subscribed users should receive notifications

3. **Check notifications**:
   - Click notification bell in header
   - Verify unread count updates
   - Click notification to mark as read

4. **Toggle notifications**:
   - Click bell icon next to Subscribe button
   - Verify notification preferences update

## Notes

- Notifications are automatically created when videos are uploaded
- Users only receive notifications for channels they're subscribed to
- Notification preferences can be toggled per channel
- Firebase push notifications require additional setup (see FIREBASE_SETUP.md)
