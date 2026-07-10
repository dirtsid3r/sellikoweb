'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import sellikoClient from '@/selliko-client'
import { getNotificationRedirectUrl } from '@/lib/getNotificationRedirectUrl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Icons } from '@/components/ui/icons'

interface Notification {
  id: string | number
  type: string
  title: string
  message: string
  created_at?: string
  timestamp: string
  isRead: boolean
  isImportant: boolean
  metadata?: any
  cta_link?: string
  data?: {
    listingId?: string
    orderId?: string
    deviceName?: string
    amount?: number
  }
}

export function NotificationsTab() {
  const { user } = useAuth()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread' | 'important'>('all')

  const formatTimeAgo = (dateString?: string) => {
    if (!dateString) return ''
    const now = new Date()
    const date = new Date(dateString)
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
    
    return date.toLocaleDateString()
  }

  const fetchNotifications = async () => {
    try {
      const response = await sellikoClient.listenToNotifications()
      if (response.success && response.notifications) {
        const mapped = response.notifications.map((n: any) => {
          const isImportant = n.event_type?.includes('won') || n.event_type?.includes('outbid') || n.event_type?.includes('assign');
          return {
            id: n.id,
            type: n.event_type || 'info',
            event_type: n.event_type,
            title: n.title || 'Notification',
            message: n.message || '',
            created_at: n.created_at,
            timestamp: formatTimeAgo(n.created_at),
            isRead: !!n.read_status,
            isImportant: isImportant,
            metadata: n.metadata,
            cta_link: n.cta_link
          }
        })
        setNotifications(mapped)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true
    if (filter === 'unread') return !notification.isRead
    if (filter === 'important') return notification.isImportant
    return true
  })

  const unreadCount = notifications.filter(n => !n.isRead).length

  const getNotificationIcon = (type: string) => {
    const typeLower = type.toLowerCase();
    if (typeLower.includes('listing')) return <Icons.smartphone className="w-4 h-4" />
    if (typeLower.includes('placed')) return <Icons.zap className="w-4 h-4" />
    if (typeLower.includes('outbid')) return <Icons.exclamationTriangle className="w-4 h-4" />
    if (typeLower.includes('win') || typeLower.includes('won')) return <Icons.trophy className="w-4 h-4" />
    if (typeLower.includes('order')) return <Icons.package className="w-4 h-4" />
    if (typeLower.includes('delivery') || typeLower.includes('pickup')) return <Icons.truck className="w-4 h-4" />
    return <Icons.bell className="w-4 h-4" />
  }

  const getNotificationColor = (type: string, isImportant: boolean) => {
    if (isImportant) {
      const typeLower = type.toLowerCase();
      if (typeLower.includes('listing')) return 'bg-blue-50 border-blue-200'
      if (typeLower.includes('outbid')) return 'bg-red-50 border-red-200'
      if (typeLower.includes('win') || typeLower.includes('won')) return 'bg-green-50 border-green-200'
      return 'bg-orange-50 border-orange-200'
    }
    return 'bg-gray-50 border-gray-200'
  }

  const handleMarkAsRead = async (notificationId: string | number) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    )

    try {
      await sellikoClient.markNotificationAsRead(notificationId)
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    )

    try {
      await sellikoClient.markAllNotificationsAsRead()
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification.id)
    }

    const redirectUrl = getNotificationRedirectUrl(notification, user?.role)
    console.log('🔔 [NAVIGATE] Vendor Notification tab clicked routing to:', redirectUrl)
    router.push(redirectUrl)
  }

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2"><Icons.bell className="w-6 h-6 text-green-600" /> Notifications</h2>
          <p className="text-gray-600">Stay updated with your bidding activity and order status.</p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={handleMarkAllAsRead} variant="outline" size="sm">
            Mark All Read ({unreadCount})
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-2 flex-wrap">
            {[
              { key: 'all', label: 'All' },
              { key: 'unread', label: `Unread (${unreadCount})` },
              { key: 'important', label: 'Important' }
            ].map((filterOption) => (
              <Button
                key={filterOption.key}
                variant={filter === filterOption.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(filterOption.key as 'all' | 'unread' | 'important')}
              >
                {filterOption.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <div className="space-y-4">
        {loading ? (
          // Loading skeleton
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {filteredNotifications.map((notification) => (
              <Card
                key={notification.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  getNotificationColor(notification.type, notification.isImportant)
                } ${!notification.isRead ? 'border-l-4 border-l-blue-500' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg ${
                      notification.isImportant ? 'bg-white' : 'bg-gray-100'
                    }`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h4 className={`font-semibold text-gray-900 mb-1 break-words whitespace-pre-wrap ${
                            !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </h4>
                          <p className={`text-sm mb-2 break-words whitespace-pre-wrap ${
                            !notification.isRead ? 'text-gray-800' : 'text-gray-600'
                          }`}>
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500">{notification.timestamp}</p>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2">
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          )}
                          {notification.isImportant && (
                            <Badge variant="secondary" className="text-xs">
                              Important
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {!loading && filteredNotifications.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Icons.bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications found</h3>
                  <p className="text-gray-600">
                    {filter === 'unread' 
                      ? "You're all caught up! No unread notifications."
                      : filter === 'important'
                      ? "No important notifications at the moment."
                      : "You'll receive notifications about new listings, bids, and order updates here."
                    }
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>

      {/* Notification Preferences (Optional) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icons.settings className="w-5 h-5" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">WhatsApp Notifications</p>
                <p className="text-sm text-gray-600">Get critical updates via WhatsApp</p>
              </div>
              <Badge variant="outline" className="text-green-600 bg-green-50 flex items-center gap-1">
                <Icons.check className="w-3 h-3" /> Enabled
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">New Listing Alerts</p>
                <p className="text-sm text-gray-600">Notify when devices matching your interests are listed</p>
              </div>
              <Badge variant="outline" className="text-green-600 bg-green-50 flex items-center gap-1">
                <Icons.check className="w-3 h-3" /> Enabled
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Bid Updates</p>
                <p className="text-sm text-gray-600">Get notified when you're outbid or win auctions</p>
              </div>
              <Badge variant="outline" className="text-green-600 bg-green-50 flex items-center gap-1">
                <Icons.check className="w-3 h-3" /> Enabled
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 