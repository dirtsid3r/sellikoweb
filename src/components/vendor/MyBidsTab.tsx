'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Icons } from '@/components/ui/icons'
import { BidHistorySection } from './BidHistorySection'

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
}

export function MyBidsTab() {
  const [stats, setStats] = useState<BidStats>({
    totalBids: 18,
    bidsWon: 12,
    winRate: 67,
    totalSpent: 485000,
    averageBid: 40417
  })

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">📋 My Bids & Transaction History</h2>
        <p className="text-gray-600">Track your bid history and manage won auctions.</p>
      </div>

      {/* Bid Stats */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalBids}</p>
              <p className="text-sm text-gray-600">Total Bids</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{stats.bidsWon}</p>
              <p className="text-sm text-gray-600">Bids Won</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{stats.winRate}%</p>
              <p className="text-sm text-gray-600">Win Rate</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">{formatCurrency(stats.totalSpent)}</p>
              <p className="text-sm text-gray-600">Total Spent</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">{formatCurrency(stats.averageBid)}</p>
              <p className="text-sm text-gray-600">Average Bid</p>
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