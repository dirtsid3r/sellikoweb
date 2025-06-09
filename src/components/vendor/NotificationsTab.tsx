'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Icons } from '@/components/ui/icons'

interface Notification {
  id: string
  type: 'new_listing' | 'bid_placed' | 'bid_outbid' | 'bid_won' | 'order_update' | 'delivery_ready'
  title: string
  message: string
  timestamp: string
  isRead: boolean
  isImportant: boolean
  data?: {
    listingId?: string
    orderId?: string
    deviceName?: string
    amount?: number
  }
}

export function NotificationsTab() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread' | 'important'>('all')

  // Mock data for notifications
  const mockNotifications: Notification[] = [
    {
      id: 'notif-1',
      type: 'new_listing',
      title: 'New Device Available',
      message: 'iPhone 14 Pro Max 256GB listed for ₹55,000 in Kochi',
      timestamp: '2 mins ago',
      isRead: false,
      isImportant: true,
      data: { listingId: 'listing-1', deviceName: 'iPhone 14 Pro Max', amount: 55000 }
    },
    {
      id: 'notif-2',
      type: 'bid_outbid',
      title: 'You\'ve been outbid',
      message: 'Someone bid ₹53,000 on Samsung Galaxy S21. Your bid: ₹52,000',
      timestamp: '1 hour ago',
      isRead: false,
      isImportant: true,
      data: { listingId: 'listing-2', deviceName: 'Samsung Galaxy S21', amount: 53000 }
    },
    {
      id: 'notif-3',
      type: 'bid_won',
      title: 'Congratulations! You won',
      message: 'Your bid of ₹45,000 won the iPhone 13 auction',
      timestamp: '3 hours ago',
      isRead: true,
      isImportant: true,
      data: { orderId: 'order-1', deviceName: 'iPhone 13', amount: 45000 }
    },
    {
      id: 'notif-4',
      type: 'order_update',
      title: 'Order Update',
      message: 'Your iPhone 13 is being verified by our agent',
      timestamp: '4 hours ago',
      isRead: true,
      isImportant: false,
      data: { orderId: 'order-1', deviceName: 'iPhone 13' }
    },
    {
      id: 'notif-5',
      type: 'delivery_ready',
      title: 'Device Ready for Pickup',
      message: 'OnePlus 9 verified and ready for delivery to your store',
      timestamp: 'Yesterday, 4:30 PM',
      isRead: true,
      isImportant: false,
      data: { orderId: 'order-2', deviceName: 'OnePlus 9' }
    },
    {
      id: 'notif-6',
      type: 'bid_placed',
      title: 'Bid Placed Successfully',
      message: 'Your bid of ₹28,000 placed on OnePlus 11',
      timestamp: 'Yesterday, 2:15 PM',
      isRead: true,
      isImportant: false,
      data: { listingId: 'listing-3', deviceName: 'OnePlus 11', amount: 28000 }
    }
  ]

  useEffect(() => {
    setTimeout(() => {
      setNotifications(mockNotifications)
      setLoading(false)
    }, 1000)
  }, [])

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true
    if (filter === 'unread') return !notification.isRead
    if (filter === 'important') return notification.isImportant
    return true
  })

  const unreadCount = notifications.filter(n => !n.isRead).length

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_listing': return '📱'
      case 'bid_placed': return '🔥'
      case 'bid_outbid': return '⚠️'
      case 'bid_won': return '🏆'
      case 'order_update': return '📦'
      case 'delivery_ready': return '🚚'
      default: return '🔔'
    }
  }

  const getNotificationColor = (type: string, isImportant: boolean) => {
    if (isImportant) {
      switch (type) {
        case 'new_listing': return 'bg-blue-100 border-blue-200'
        case 'bid_outbid': return 'bg-red-100 border-red-200'
        case 'bid_won': return 'bg-green-100 border-green-200'
        default: return 'bg-orange-100 border-orange-200'
      }
    }
    return 'bg-gray-50 border-gray-200'
  }

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    )
  }

  const handleMarkAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    )
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification.id)
    }

    // Navigate based on notification type
    if (notification.data?.listingId) {
      alert(`Opening listing: ${notification.data.deviceName}`)
    } else if (notification.data?.orderId) {
      alert(`Opening order tracking: ${notification.data.orderId}`)
    }
  }

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">🔔 Notifications</h2>
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
                          <h4 className={`font-semibold text-gray-900 mb-1 ${
                            !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </h4>
                          <p className={`text-sm mb-2 ${
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
              <Badge variant="outline" className="text-green-600 bg-green-50">
                ✅ Enabled
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">New Listing Alerts</p>
                <p className="text-sm text-gray-600">Notify when devices matching your interests are listed</p>
              </div>
              <Badge variant="outline" className="text-green-600 bg-green-50">
                ✅ Enabled
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Bid Updates</p>
                <p className="text-sm text-gray-600">Get notified when you're outbid or win auctions</p>
              </div>
              <Badge variant="outline" className="text-green-600 bg-green-50">
                ✅ Enabled
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 