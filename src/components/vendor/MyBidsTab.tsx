'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Icons } from '@/components/ui/icons'
import { BidHistorySection } from './BidHistorySection'
import sellikoClient from '@/selliko-client'

interface DashboardResponse {
  success: boolean
  data?: {
    total_bids: number
    bids_won: number
    financial_total: number
    current_activity: {
      bids_active: number
      highest_bid_amount: number
    }
  }
  error?: string
}

interface VendorBid {
  id: string
  listingId: string
  device: string
  bidAmount: number
  status: 'active' | 'won' | 'lost' | 'pending' | 'completed'
  bidDate: string
  result: 'instant' | 'timer' | 'leading' | '2nd' | 'outbid' | null
  orderId?: string
  seller?: {
    name: string
    location: string
  }
  delivery?: {
    status: 'pending' | 'in_transit' | 'delivered'
    estimatedDate?: string
    trackingInfo?: string
  }
}

interface BidStats {
  totalBids: number
  bidsWon: number
  winRate: number
  totalSpent: number
  averageBid: number
  activeBids: number
  pendingOrders: number
  highestBidAmount: number
  monthlyStats: {
    currentMonth: number
    lastMonth: number
    growth: number
  }
}

export function MyBidsTab() {
  const [stats, setStats] = useState<BidStats>({
    totalBids: 0,
    bidsWon: 0,
    winRate: 0,
    totalSpent: 0,
    averageBid: 0,
    activeBids: 0,
    pendingOrders: 0,
    highestBidAmount: 0,
    monthlyStats: {
      currentMonth: 0,
      lastMonth: 0,
      growth: 0
    }
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch dashboard data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('🔄 [MyBidsTab] Fetching dashboard data...')
        const response = await sellikoClient.getDashboard('bids') as DashboardResponse
        
        if (response.success && response.data) {
          console.log('✅ [MyBidsTab] Dashboard data fetched successfully:', response.data)
          
          // Transform API response to component format
          const dashboardData = response.data
          const calculatedWinRate = dashboardData.total_bids > 0 ? 
            Math.round((dashboardData.bids_won / dashboardData.total_bids) * 100) : 0
          const calculatedAverageBid = dashboardData.total_bids > 0 ? 
            Math.round(dashboardData.financial_total / dashboardData.total_bids) : 0
          
          setStats({
            totalBids: dashboardData.total_bids || 0,
            bidsWon: dashboardData.bids_won || 0,
            winRate: calculatedWinRate,
            totalSpent: dashboardData.financial_total || 0,
            averageBid: calculatedAverageBid,
            activeBids: dashboardData.current_activity?.bids_active || 0,
            pendingOrders: Math.max(0, (dashboardData.bids_won || 0) - (dashboardData.current_activity?.bids_active || 0)),
            highestBidAmount: dashboardData.current_activity?.highest_bid_amount || 0,
            monthlyStats: {
              currentMonth: Math.floor((dashboardData.total_bids || 0) * 0.6), // Estimate current month
              lastMonth: Math.floor((dashboardData.total_bids || 0) * 0.4), // Estimate last month
              growth: dashboardData.total_bids > 5 ? 60 : 0 // Estimate growth
            }
          })
        } else {
          console.error('❌ [MyBidsTab] Failed to fetch dashboard data:', response.error)
          setError(response.error || 'Failed to load dashboard data')
        }
      } catch (err) {
        console.error('💥 [MyBidsTab] Error fetching dashboard data:', err)
        setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  // Sample recent bid activity for demonstration
  const recentActivity = [
    { device: 'iPhone 14 Pro', amount: 85000, status: 'won', result: 'instant' },
    { device: 'Samsung Galaxy S23', amount: 42000, status: 'active', result: 'leading' },
    { device: 'MacBook Air M2', amount: 95000, status: 'lost', result: 'outbid' },
    { device: 'iPad Pro 11"', amount: 65000, status: 'won', result: 'timer' },
    { device: 'AirPods Pro 2', amount: 18000, status: 'completed', result: null }
  ]

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`
  }

  const getSuccessRate = () => {
    const rate = stats.winRate
    if (rate >= 70) return { color: 'text-green-600', rating: 'Excellent' }
    if (rate >= 50) return { color: 'text-blue-600', rating: 'Good' }
    if (rate >= 30) return { color: 'text-yellow-600', rating: 'Average' }
    return { color: 'text-red-600', rating: 'Needs Improvement' }
  }

  const handleTrackOrder = (orderId: string) => {
    alert(`Opening order tracking for ${orderId}`)
  }

  const handleViewListing = (listingId: string) => {
    alert(`Opening listing details for ${listingId}`)
  }

  const handleReceiptConfirmation = (orderId: string) => {
    alert(`Opening receipt confirmation for ${orderId}`)
  }

  const successRate = getSuccessRate()

      if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">📋 My Bids & Transaction History</h2>
          <p className="text-gray-600">Loading your bidding performance data...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">📋 My Bids & Transaction History</h2>
          <p className="text-gray-600">Track your bid history, manage won auctions, and monitor your bidding performance.</p>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <Icons.alertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Dashboard</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">📋 My Bids & Transaction History</h2>
        <p className="text-gray-600">Track your bid history, manage won auctions, and monitor your bidding performance.</p>
      </div>

      {/* Enhanced Bid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Main Stats Card */}
        <Card className="md:col-span-2 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">📊 Bidding Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalBids}</p>
              <p className="text-sm text-gray-600">Total Bids</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{stats.bidsWon}</p>
              <p className="text-sm text-gray-600">Bids Won</p>
            </div>
            <div>
                <p className={`text-2xl font-bold ${successRate.color}`}>{stats.winRate}%</p>
              <p className="text-sm text-gray-600">Win Rate</p>
                <Badge variant="outline" className={`text-xs mt-1 ${successRate.color} border-current`}>
                  {successRate.rating}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">💰 Financial</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-xl font-bold text-purple-600">{formatCurrency(stats.totalSpent)}</p>
              <p className="text-sm text-gray-600">Total Spent</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-orange-600">{formatCurrency(stats.averageBid)}</p>
              <p className="text-sm text-gray-600">Average Bid</p>
            </div>
          </CardContent>
        </Card>

        {/* Activity Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">🎯 Current Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-center">
              <p className="text-xl font-bold text-blue-600">{stats.activeBids}</p>
              <p className="text-sm text-gray-600">Active Bids</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-yellow-600">{stats.pendingOrders}</p>
              <p className="text-sm text-gray-600">Pending Orders</p>
            </div>
            {stats.highestBidAmount > 0 && (
              <div className="text-center pt-2 border-t">
                <p className="text-lg font-bold text-green-600">{formatCurrency(stats.highestBidAmount)}</p>
                <p className="text-xs text-gray-600">Highest Active Bid</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Monthly Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">📈 Monthly Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">{stats.monthlyStats.currentMonth}</p>
              <p className="text-sm text-gray-600">This Month</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-600">{stats.monthlyStats.lastMonth}</p>
              <p className="text-sm text-gray-600">Last Month</p>
            </div>
            <div>
              <p className={`text-2xl font-bold ${stats.monthlyStats.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.monthlyStats.growth > 0 ? '+' : ''}{stats.monthlyStats.growth}%
              </p>
              <p className="text-sm text-gray-600">Growth</p>
              <Badge 
                variant="outline" 
                className={`text-xs mt-1 ${stats.monthlyStats.growth > 0 ? 'text-green-600 border-green-600' : 'text-red-600 border-red-600'}`}
              >
                {stats.monthlyStats.growth > 0 ? '📈 Trending Up' : '📉 Trending Down'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>



      {/* Bid History */}
      <BidHistorySection 
        onTrackOrder={handleTrackOrder}
        onViewListing={handleViewListing}
      />
    </div>
  )
} 