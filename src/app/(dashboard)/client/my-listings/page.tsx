'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Icons } from '@/components/ui/icons'
import { toast } from 'react-hot-toast'
import Link from 'next/link'

interface DeviceListing {
  id: string
  device: {
    brand: string
    model: string
    storage: string
    color: string
    condition: string
  }
  images: string[]
  askingPrice: number
  currentBid?: number
  totalBids: number
  timeLeft: string
  timeLeftMinutes: number
  status: 'pending' | 'active' | 'sold' | 'rejected'
  submittedAt: string
  bids: Array<{
    id: string
    vendorName: string
    amount: number
    timestamp: string
    status: 'active' | 'accepted' | 'declined'
  }>
  rejectionReason?: string
  description: string
  location: string
}

const mockListings: DeviceListing[] = [
  {
    id: 'listing-1',
    device: {
      brand: 'Apple',
      model: 'iPhone 14 Pro Max',
      storage: '256GB',
      color: 'Deep Purple',
      condition: 'Excellent'
    },
    images: ['/api/placeholder/300/300'],
    askingPrice: 85000,
    currentBid: 82000,
    totalBids: 8,
    timeLeft: '2h 45m',
    timeLeftMinutes: 165,
    status: 'active',
    submittedAt: '2024-01-15T10:30:00Z',
    bids: [
      {
        id: 'bid-1',
        vendorName: 'TechBuy Solutions',
        amount: 82000,
        timestamp: '5 minutes ago',
        status: 'active'
      },
      {
        id: 'bid-2',
        vendorName: 'Mobile World Kerala',
        amount: 80000,
        timestamp: '1 hour ago',
        status: 'active'
      },
      {
        id: 'bid-3',
        vendorName: 'Digital Hub Kochi',
        amount: 78000,
        timestamp: '3 hours ago',
        status: 'active'
      }
    ],
    description: 'Like new condition, barely used for 3 months. All accessories included.',
    location: 'Kochi'
  },
  {
    id: 'listing-2',
    device: {
      brand: 'Samsung',
      model: 'Galaxy S23',
      storage: '128GB',
      color: 'Phantom Black',
      condition: 'Good'
    },
    images: ['/api/placeholder/300/300'],
    askingPrice: 45000,
    currentBid: 43500,
    totalBids: 5,
    timeLeft: '1d 12h',
    timeLeftMinutes: 2160,
    status: 'active',
    submittedAt: '2024-01-14T15:45:00Z',
    bids: [
      {
        id: 'bid-4',
        vendorName: 'Smart Gadgets Co',
        amount: 43500,
        timestamp: '30 minutes ago',
        status: 'active'
      },
      {
        id: 'bid-5',
        vendorName: 'Phone Paradise',
        amount: 42000,
        timestamp: '2 hours ago',
        status: 'active'
      }
    ],
    description: 'Minor scratches on back, screen is perfect. Charger included.',
    location: 'Thrissur'
  },
  {
    id: 'listing-3',
    device: {
      brand: 'OnePlus',
      model: '11',
      storage: '256GB',
      color: 'Titan Black',
      condition: 'Excellent'
    },
    images: ['/api/placeholder/300/300'],
    askingPrice: 52000,
    totalBids: 0,
    timeLeft: 'Pending approval',
    timeLeftMinutes: 0,
    status: 'pending',
    submittedAt: '2024-01-16T09:15:00Z',
    bids: [],
    description: 'Purchased 6 months ago, excellent condition with box and all accessories.',
    location: 'Calicut'
  }
]

export default function MyListings() {
  const [listings, setListings] = useState<DeviceListing[]>(mockListings)
  const [selectedTab, setSelectedTab] = useState<'all' | 'active' | 'pending' | 'sold'>('all')
  const [selectedListing, setSelectedListing] = useState<DeviceListing | null>(null)
  const [bidDetailsOpen, setBidDetailsOpen] = useState(false)

  // Real-time updates simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setListings(prev => prev.map(listing => {
        if (listing.status === 'active' && listing.timeLeftMinutes > 0) {
          return {
            ...listing,
            timeLeftMinutes: Math.max(0, listing.timeLeftMinutes - 1),
            timeLeft: formatTimeLeft(Math.max(0, listing.timeLeftMinutes - 1))
          }
        }
        return listing
      }))
    }, 60000) // Update every minute

    return () => clearInterval(timer)
  }, [])

  // Simulate new bids
  useEffect(() => {
    const bidTimer = setInterval(() => {
      if (Math.random() < 0.05) { // 5% chance every 30 seconds
        setListings(prev => prev.map(listing => {
          if (listing.status === 'active' && listing.timeLeftMinutes > 0 && Math.random() < 0.3) {
            const vendors = ['TechWorld Kerala', 'Mobile Express', 'Phone Hub', 'Digital Bazaar']
            const randomVendor = vendors[Math.floor(Math.random() * vendors.length)]
            const newBidAmount = (listing.currentBid || listing.askingPrice - 5000) + Math.floor(Math.random() * 1000) + 500
            
            const newBid = {
              id: `bid-${Date.now()}`,
              vendorName: randomVendor,
              amount: newBidAmount,
              timestamp: 'Just now',
              status: 'active' as const
            }

            toast.success(`🔔 New bid on your ${listing.device.model}!\n₹${newBidAmount.toLocaleString()} from ${randomVendor}`)

            return {
              ...listing,
              currentBid: newBidAmount,
              totalBids: listing.totalBids + 1,
              bids: [newBid, ...listing.bids]
            }
          }
          return listing
        }))
      }
    }, 30000) // Check every 30 seconds

    return () => clearInterval(bidTimer)
  }, [])

  const formatTimeLeft = (minutes: number): string => {
    if (minutes <= 0) return 'Ended'
    const days = Math.floor(minutes / 1440)
    const hours = Math.floor((minutes % 1440) / 60)
    const mins = minutes % 60
    
    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h ${mins}m`
    return `${mins}m`
  }

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'sold': return 'bg-blue-100 text-blue-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTimeColor = (minutes: number) => {
    if (minutes <= 60) return 'text-red-600'
    if (minutes <= 360) return 'text-orange-600'
    return 'text-green-600'
  }

  const filteredListings = listings.filter(listing => {
    if (selectedTab === 'all') return true
    return listing.status === selectedTab
  })

  const handleAcceptBid = (listingId: string, bidId: string) => {
    toast.success('Bid accepted! Order tracking will begin automatically.')
    // In real app, this would call API to accept bid and start order process
  }

  const handleDeclineBid = (listingId: string, bidId: string) => {
    toast('Bid declined')
    // In real app, this would call API to decline bid
  }

  const handleViewBidDetails = (listing: DeviceListing) => {
    setSelectedListing(listing)
    setBidDetailsOpen(true)
  }

  const tabs = [
    { key: 'all', label: 'All Listings', count: listings.length },
    { key: 'active', label: 'Active', count: listings.filter(l => l.status === 'active').length },
    { key: 'pending', label: 'Pending Approval', count: listings.filter(l => l.status === 'pending').length },
    { key: 'sold', label: 'Sold', count: listings.filter(l => l.status === 'sold').length }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">📱 My Device Listings</h1>
            <p className="text-gray-600">Track your device sales and manage bids</p>
          </div>
          <Link href="/client/list-device">
            <Button className="bg-green-600 hover:bg-green-700">
              <Icons.plus className="w-4 h-4 mr-2" />
              List New Device
            </Button>
          </Link>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{listings.length}</div>
              <div className="text-sm text-gray-600">Total Listings</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {listings.filter(l => l.status === 'active').length}
              </div>
              <div className="text-sm text-gray-600">Active Auctions</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {listings.reduce((sum, l) => sum + l.totalBids, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Bids Received</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                ₹{Math.max(...listings.map(l => l.currentBid || 0)).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Highest Bid</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedTab(tab.key as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedTab === tab.key
                  ? 'bg-green-100 text-green-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredListings.map((listing) => (
            <Card key={listing.id} className="hover:shadow-lg transition-all duration-200">
              <CardContent className="p-0">
                {/* Image and Status */}
                <div className="relative">
                  <img 
                    src={listing.images[0]} 
                    alt={listing.device.model}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <Badge className={`absolute top-2 left-2 ${getStatusColor(listing.status)}`}>
                    {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                  </Badge>
                  {listing.status === 'active' && (
                    <Badge className={`absolute top-2 right-2 bg-white/90 ${getTimeColor(listing.timeLeftMinutes)}`}>
                      ⏱️ {listing.timeLeft}
                    </Badge>
                  )}
                </div>

                <div className="p-4">
                  {/* Device Info */}
                  <div className="mb-3">
                    <h3 className="font-semibold text-lg text-gray-900 mb-1">
                      {listing.device.brand} {listing.device.model}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {listing.device.storage} • {listing.device.color} • {listing.device.condition}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Listed on {formatDate(listing.submittedAt)}
                    </p>
                  </div>

                  {/* Pricing Info */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Your Asking Price</p>
                        <p className="text-lg font-bold text-green-600">{formatCurrency(listing.askingPrice)}</p>
                      </div>
                      {listing.currentBid && (
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Highest Bid</p>
                          <p className="text-lg font-semibold text-blue-600">{formatCurrency(listing.currentBid)}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bidding Status */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className={`font-medium ${listing.totalBids > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                        {listing.totalBids === 0 ? 'No bids yet' : `${listing.totalBids} bid${listing.totalBids > 1 ? 's' : ''} received`}
                      </span>
                      {listing.status === 'active' && listing.totalBids > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewBidDetails(listing)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          View Bids
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Latest Bid Alert */}
                  {listing.status === 'active' && listing.bids.length > 0 && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-900">Latest Bid</p>
                          <p className="text-xs text-blue-700">
                            {formatCurrency(listing.bids[0].amount)} by {listing.bids[0].vendorName}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleAcceptBid(listing.id, listing.bids[0].id)}
                          >
                            Accept
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => handleDeclineBid(listing.id, listing.bids[0].id)}
                          >
                            Decline
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Status-specific content */}
                  {listing.status === 'pending' && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
                      <div className="flex items-center gap-2">
                        <Icons.clock className="w-4 h-4 text-yellow-600" />
                        <span className="text-yellow-800">Awaiting admin approval</span>
                      </div>
                      <p className="text-yellow-700 text-xs mt-1">Your listing will be live once approved</p>
                    </div>
                  )}

                  {listing.status === 'rejected' && listing.rejectionReason && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <Icons.x className="w-4 h-4 text-red-600" />
                        <span className="text-red-800 font-medium">Listing Rejected</span>
                      </div>
                      <p className="text-red-700 text-xs">{listing.rejectionReason}</p>
                    </div>
                  )}

                  {listing.status === 'sold' && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm">
                      <div className="flex items-center gap-2">
                        <Icons.check className="w-4 h-4 text-green-600" />
                        <span className="text-green-800 font-medium">Successfully Sold!</span>
                      </div>
                      <p className="text-green-700 text-xs mt-1">Order tracking has been initiated</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredListings.length === 0 && (
          <div className="text-center py-12">
            <Icons.smartphone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {selectedTab === 'all' ? 'No device listings yet' : `No ${selectedTab} listings`}
            </h3>
            <p className="text-gray-600 mb-4">
              {selectedTab === 'all' 
                ? 'Start by listing your first device for sale'
                : `You don't have any ${selectedTab} listings at the moment`
              }
            </p>
            {selectedTab === 'all' && (
              <Link href="/client/list-device">
                <Button className="bg-green-600 hover:bg-green-700">
                  <Icons.plus className="w-4 h-4 mr-2" />
                  List Your First Device
                </Button>
              </Link>
            )}
          </div>
        )}

        {/* Bid Details Modal */}
        {selectedListing && bidDetailsOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">Bids for {selectedListing.device.model}</h3>
                  <Button variant="ghost" onClick={() => setBidDetailsOpen(false)}>
                    <Icons.x className="w-5 h-5" />
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {selectedListing.bids.map((bid, index) => (
                    <div key={bid.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{bid.vendorName}</p>
                          <p className="text-sm text-gray-500">{bid.timestamp}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-green-600">
                            {formatCurrency(bid.amount)}
                          </p>
                          <p className="text-xs text-gray-500">Bid #{index + 1}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => {
                            handleAcceptBid(selectedListing.id, bid.id)
                            setBidDetailsOpen(false)
                          }}
                        >
                          Accept Bid
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeclineBid(selectedListing.id, bid.id)}
                        >
                          Decline
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 