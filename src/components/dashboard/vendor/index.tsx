'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'
import { MarketplaceTab } from '@/components/vendor/MarketplaceTab'
import { MyBidsTab } from '@/components/vendor/MyBidsTab'
import { NotificationsTab } from '@/components/vendor/NotificationsTab'

interface VendorStats {
  activeBids: number
  wonBids: number
  totalSpent: number
  notifications: number
  marketplaceListings: number
  winRate: number
}

export default function VendorDashboard() {
  const [activeTab, setActiveTab] = useState('marketplace')
  const [stats, setStats] = useState<VendorStats>({
    activeBids: 3,
    wonBids: 12,
    totalSpent: 485000,
    notifications: 5,
    marketplaceListings: 24,
    winRate: 67
  })

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🏢 Vendor Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your bidding activities and track your performance</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="text-green-600 border-green-600">
            {stats.winRate}% Win Rate
          </Badge>
          <Button variant="outline" size="sm">
            <Icons.download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Quick Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.activeBids}</div>
            <div className="text-sm text-gray-600">Active Bids</div>
            <div className="text-xs text-blue-600 mt-1 flex items-center gap-1"><Icons.zap className="w-3 h-3" /> Currently bidding</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.wonBids}</div>
            <div className="text-sm text-gray-600">Won Bids</div>
            <div className="text-xs text-green-600 mt-1 flex items-center gap-1"><Icons.trophy className="w-3 h-3" /> Successful purchases</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-purple-600">{formatCurrency(stats.totalSpent)}</div>
            <div className="text-sm text-gray-600">Total Spent</div>
            <div className="text-xs text-purple-600 mt-1 flex items-center gap-1"><Icons.dollarSign className="w-3 h-3" /> Investment made</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.notifications}</div>
            <div className="text-sm text-gray-600">Notifications</div>
            <div className="text-xs text-orange-600 mt-1 flex items-center gap-1"><Icons.bell className="w-3 h-3" /> Requires attention</div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Tab Selector (shown on mobile/tablet screens) */}
      <div className="block md:hidden mb-6">
        <label htmlFor="tab-select" className="sr-only">Select Tab</label>
        <div className="relative">
          <select
            id="tab-select"
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
            className="w-full p-3.5 pl-10 pr-10 bg-white border border-gray-300 rounded-xl shadow-sm text-gray-900 font-medium focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
          >
            <option value="marketplace">Marketplace ({stats.marketplaceListings})</option>
            <option value="bids">My Bids ({stats.activeBids})</option>
            <option value="orders">Orders ({stats.wonBids})</option>
            <option value="notifications">Notifications ({stats.notifications})</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
            <Icons.chevronDown className="h-5 w-5" />
          </div>
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-500">
            {activeTab === 'marketplace' && <Icons.search className="h-5 w-5 text-green-600" />}
            {activeTab === 'bids' && <Icons.zap className="h-5 w-5 text-green-600" />}
            {activeTab === 'orders' && <Icons.package className="h-5 w-5 text-green-600" />}
            {activeTab === 'notifications' && <Icons.bell className="h-5 w-5 text-green-600" />}
          </div>
        </div>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="hidden md:grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="marketplace" className="flex items-center justify-center gap-2">
            <Icons.search className="w-4 h-4 flex-shrink-0" />
            <span>Marketplace</span>
            <Badge variant="secondary" className="text-xs">
              {stats.marketplaceListings}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="bids" className="flex items-center justify-center gap-2">
            <Icons.zap className="w-4 h-4 flex-shrink-0" />
            <span>My Bids</span>
            <Badge variant="secondary" className="text-xs">
              {stats.activeBids}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center justify-center gap-2">
            <Icons.package className="w-4 h-4 flex-shrink-0" />
            <span>Orders</span>
            <Badge variant="secondary" className="text-xs">
              {stats.wonBids}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center justify-center gap-2">
            <Icons.bell className="w-4 h-4 flex-shrink-0" />
            <span>Notifications</span>
            {stats.notifications > 0 && (
              <Badge variant="destructive" className="text-xs">
                {stats.notifications}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="marketplace" className="mt-6">
          <MarketplaceTab />
        </TabsContent>

        <TabsContent value="bids" className="mt-6">
          <MyBidsTab />
        </TabsContent>

        <TabsContent value="orders" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Icons.package className="w-5 h-5" />
                <span>📦 Order Management</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Icons.package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Order Management</h3>
                <p className="text-gray-600 mb-4">
                  Track your won bids, manage deliveries, and handle order fulfillment.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-md mx-auto">
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">2</div>
                    <div className="text-sm text-yellow-700">Pending Orders</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">3</div>
                    <div className="text-sm text-blue-700">In Transit</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">7</div>
                    <div className="text-sm text-green-700">Delivered</div>
                  </div>
                </div>
                <Button className="mt-6" variant="outline">
                  View All Orders
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <NotificationsTab />
        </TabsContent>
      </Tabs>

      {/* Quick Actions Footer */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">⚡ Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button variant="outline" className="flex flex-col items-center p-6 h-auto">
              <Icons.search className="w-6 h-6 mb-2" />
              <span>Browse Marketplace</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center p-6 h-auto">
              <Icons.clock className="w-6 h-6 mb-2" />
              <span>Active Auctions</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center p-6 h-auto">
              <Icons.user className="w-6 h-6 mb-2" />
              <span>Profile Settings</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center p-6 h-auto">
              <Icons.info className="w-6 h-6 mb-2" />
              <span>Help & Support</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 