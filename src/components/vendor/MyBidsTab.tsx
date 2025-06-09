'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Icons } from '@/components/ui/icons'

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
  const [bids, setBids] = useState<VendorBid[]>([])
  const [stats, setStats] = useState<BidStats>({
    totalBids: 18,
    bidsWon: 12,
    winRate: 67,
    totalSpent: 485000,
    averageBid: 40417
  })
  const [loading, setLoading] = useState(true)
  const [selectedFilter, setSelectedFilter] = useState('all')

  // Mock data
  const mockBids: VendorBid[] = [
    {
      id: 'bid-1',
      listingId: 'listing-1',
      device: 'iPhone 14 Pro Max 256GB',
      bidAmount: 55000,
      status: 'won',
      bidDate: '2024-12-15',
      result: 'instant',
      orderId: 'ORD-001',
      seller: { name: 'Pradeep Kumar', location: 'Kochi' },
      delivery: { status: 'in_transit', estimatedDate: 'Today evening' }
    },
    {
      id: 'bid-2',
      listingId: 'listing-2',
      device: 'Samsung Galaxy S21 128GB',
      bidAmount: 35000,
      status: 'active',
      bidDate: '2024-12-14',
      result: 'leading'
    },
    {
      id: 'bid-3',
      listingId: 'listing-3',
      device: 'OnePlus 9 256GB',
      bidAmount: 28000,
      status: 'lost',
      bidDate: '2024-12-13',
      result: 'outbid'
    },
    {
      id: 'bid-4',
      listingId: 'listing-4',
      device: 'iPhone 13 128GB',
      bidAmount: 48000,
      status: 'pending',
      bidDate: '2024-12-12',
      result: '2nd'
    },
    {
      id: 'bid-5',
      listingId: 'listing-5',
      device: 'Google Pixel 7 256GB',
      bidAmount: 32000,
      status: 'completed',
      bidDate: '2024-12-11',
      result: 'timer',
      orderId: 'ORD-002',
      seller: { name: 'Anjali Nair', location: 'Thrissur' },
      delivery: { status: 'delivered' }
    }
  ]

  useEffect(() => {
    setTimeout(() => {
      setBids(mockBids)
      setLoading(false)
    }, 1000)
  }, [])

  const filteredBids = bids.filter(bid => {
    if (selectedFilter === 'all') return true
    if (selectedFilter === 'active') return bid.status === 'active' || bid.status === 'pending'
    if (selectedFilter === 'won') return bid.status === 'won' || bid.status === 'completed'
    if (selectedFilter === 'lost') return bid.status === 'lost'
    return true
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'won': return '🏆'
      case 'completed': return '✅'
      case 'active': return '🟡'
      case 'pending': return '⏱️'
      case 'lost': return '❌'
      default: return '⚪'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'won': return 'text-yellow-600 bg-yellow-100'
      case 'completed': return 'text-green-600 bg-green-100'
      case 'active': return 'text-blue-600 bg-blue-100'
      case 'pending': return 'text-orange-600 bg-orange-100'
      case 'lost': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getResultText = (result: string | null, status: string) => {
    if (status === 'completed') return 'Delivered'
    if (result === 'instant') return 'Instant Win'
    if (result === 'timer') return 'Timer End'
    if (result === 'leading') return 'Leading'
    if (result === '2nd') return '2nd Place'
    if (result === 'outbid') return 'Outbid'
    return '-'
  }

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

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-2 flex-wrap">
            {[
              { key: 'all', label: 'All Status' },
              { key: 'active', label: 'Active' },
              { key: 'won', label: 'Won' },
              { key: 'lost', label: 'Lost' }
            ].map((filter) => (
              <Button
                key={filter.key}
                variant={selectedFilter === filter.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter(filter.key)}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bids Table */}
      <Card>
        <CardHeader>
          <CardTitle>Bid History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Date</th>
                        <th className="text-left py-3 px-4">Device</th>
                        <th className="text-left py-3 px-4">My Bid</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Result</th>
                        <th className="text-left py-3 px-4">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBids.map((bid) => (
                        <tr key={bid.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">{bid.bidDate}</td>
                          <td className="py-3 px-4">{bid.device}</td>
                          <td className="py-3 px-4 font-semibold">{formatCurrency(bid.bidAmount)}</td>
                          <td className="py-3 px-4">
                            <Badge className={`${getStatusColor(bid.status)} border-none`}>
                              {getStatusIcon(bid.status)} {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">{getResultText(bid.result, bid.status)}</td>
                          <td className="py-3 px-4">
                            {bid.status === 'won' || bid.status === 'completed' ? (
                              <Button size="sm" variant="outline" onClick={() => handleTrackOrder(bid.orderId!)}>
                                {bid.status === 'completed' ? 'Receipt' : 'Track Order'}
                              </Button>
                            ) : bid.status === 'active' || bid.status === 'pending' ? (
                              <Button size="sm" variant="outline" onClick={() => handleViewListing(bid.listingId)}>
                                View Listing
                              </Button>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {filteredBids.map((bid) => (
                  <Card key={bid.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900">{bid.device}</h4>
                          <p className="text-sm text-gray-600">{bid.bidDate}</p>
                        </div>
                        <Badge className={`${getStatusColor(bid.status)} border-none`}>
                          {getStatusIcon(bid.status)} {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1 mb-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">My Bid:</span>
                          <span className="font-semibold">{formatCurrency(bid.bidAmount)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Result:</span>
                          <span>{getResultText(bid.result, bid.status)}</span>
                        </div>
                      </div>

                      {(bid.status === 'won' || bid.status === 'completed') && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full"
                          onClick={() => handleTrackOrder(bid.orderId!)}
                        >
                          {bid.status === 'completed' ? 'View Receipt' : 'Track Order'}
                        </Button>
                      )}
                      
                      {(bid.status === 'active' || bid.status === 'pending') && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full"
                          onClick={() => handleViewListing(bid.listingId)}
                        >
                          View Listing
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}

          {!loading && filteredBids.length === 0 && (
            <div className="text-center py-12">
              <Icons.list className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No bids found</h3>
              <p className="text-gray-600">You haven't placed any bids yet. Start bidding on devices!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 