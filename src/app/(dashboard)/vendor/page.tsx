'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Icons } from '@/components/ui/icons'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useRouter } from 'next/navigation'
import { MarketplaceTab } from '@/components/vendor/MarketplaceTab'
import { MyBidsTab } from '@/components/vendor/MyBidsTab'
import { NotificationsTab } from '@/components/vendor/NotificationsTab'

interface VendorStats {
  activeBids: number
  wonThisMonth: number
  totalDevices: number
  winRate: number
  totalSpent: number
}

interface RecentActivity {
  id: string
  type: 'new_listing' | 'bid_won' | 'device_delivered' | 'bid_outbid'
  message: string
  timestamp: string
  icon: string
}

export default function VendorDashboard() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [stats, setStats] = useState<VendorStats>({
    activeBids: 3,
    wonThisMonth: 12,
    totalDevices: 45,
    winRate: 73,
    totalSpent: 485000
  })

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([
    {
      id: '1',
      type: 'new_listing',
      message: 'New listing: iPhone 14 Pro - ₹55,000',
      timestamp: '2 mins ago',
      icon: 'smartphone'
    },
    {
      id: '2', 
      type: 'bid_won',
      message: 'Your bid accepted: Samsung S21 - ₹35,000',
      timestamp: '1 hour ago',
      icon: 'check'
    },
    {
      id: '3',
      type: 'device_delivered',
      message: 'Device delivered: OnePlus 9 - Order complete',
      timestamp: '3 hours ago',
      icon: 'package'
    }
  ])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    await logout()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Icons.smartphone className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">selliko</h1>
                <p className="text-xs text-gray-500">Vendor Portal</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name || 'Kochi Mobile Store'}</p>
                <p className="text-xs text-gray-500">VENDOR</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <Icons.spinner className="w-4 h-4 animate-spin" />
                ) : (
                  <Icons.logOut className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Icons.home className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="marketplace" className="flex items-center gap-2">
              <Icons.smartphone className="w-4 h-4" />
              Marketplace
            </TabsTrigger>
            <TabsTrigger value="my-bids" className="flex items-center gap-2">
              <Icons.list className="w-4 h-4" />
              My Bids
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Icons.bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Welcome Section */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome back, {user?.name?.split(' ')[0] || 'Vendor'}!
              </h2>
              <p className="text-gray-600">Manage your device purchases and track your business from Kerala's trusted mobile resale platform.</p>
            </div>

            {/* Business Summary Stats */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Your Business Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">🔥 Active</p>
                        <p className="text-sm font-medium text-gray-600">Bids</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeBids}</p>
                      </div>
                      <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                        <Icons.clock className="w-6 h-6 text-red-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">✅ Won</p>
                        <p className="text-sm font-medium text-gray-600">This Month</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{stats.wonThisMonth}</p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <Icons.check className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">📱 Total</p>
                        <p className="text-sm font-medium text-gray-600">Devices</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalDevices}</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Icons.smartphone className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">⭐ Win</p>
                        <p className="text-sm font-medium text-gray-600">Rate</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{stats.winRate}%</p>
                      </div>
                      <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <Icons.star className="w-6 h-6 text-yellow-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Quick Actions</h3>
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Button 
                      className="h-auto p-4 flex flex-col items-center gap-2"
                      onClick={() => setActiveTab('marketplace')}
                    >
                      <Icons.smartphone className="w-6 h-6" />
                      <span>Browse New Listings</span>
                    </Button>
                    <Button 
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-center gap-2"
                      onClick={() => setActiveTab('my-bids')}
                    >
                      <Icons.list className="w-6 h-6" />
                      <span>My Bids</span>
                    </Button>
                    <Button 
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-center gap-2"
                      onClick={() => setActiveTab('notifications')}
                    >
                      <Icons.bell className="w-6 h-6" />
                      <span>Notifications</span>
                    </Button>
                    <Button 
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-center gap-2"
                      onClick={() => setActiveTab('my-bids')}
                    >
                      <Icons.trendingUp className="w-6 h-6" />
                      <span>Transaction History</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          {activity.icon === 'smartphone' && <Icons.smartphone className="w-4 h-4 text-blue-600" />}
                          {activity.icon === 'check' && <Icons.check className="w-4 h-4 text-green-600" />}
                          {activity.icon === 'package' && <Icons.package className="w-4 h-4 text-purple-600" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                          <p className="text-xs text-gray-500">{activity.timestamp}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Marketplace Tab */}
          <TabsContent value="marketplace">
            <MarketplaceTab />
          </TabsContent>

          {/* My Bids Tab */}
          <TabsContent value="my-bids">
            <MyBidsTab />
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <NotificationsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 