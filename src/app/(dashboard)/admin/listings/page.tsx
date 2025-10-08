"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Icons } from '@/components/ui/icons'
import sellikoClient from '@/selliko-client'
import Header from '@/components/layout/header'

// Types copied from MarketplaceTab
interface BidInfo {
  id: string
  amount: number
  vendor_id: string
  vendor_name: string
  created_at: string
  instant_win: boolean
  status: 'active' | 'accepted' | 'rejected'
}

interface MarketplaceListing {
  id: string
  status: string
  device: string
  brand: string
  storage: string
  color: string
  condition: string
  askingPrice: number
  currentBidInfo: BidInfo | null
  bids: BidInfo[]
  winningBid: BidInfo | null
  totalBids: number
  timeLeft: string
  timeRemaining?: string
  location: string
  seller: {
    name: string
    rating: number
    isVerified: boolean
  }
  images: string[]
  isHot: boolean
  isInstantWin: boolean
  isBiddable: boolean
  model: string
  timeLeftMinutes: number
  image?: string
  photos?: string[]
  description: string
  listingDate: string
  features: string[]
  warranty: string
  currentBid?: number
}

export default function AdminListingsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [listings, setListings] = useState<MarketplaceListing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalListings, setTotalListings] = useState(0)

  // Fetch all listings for admin using getListings API
  const fetchAdminListings = async (search?: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await sellikoClient.getListings({
        user_id: '',
        status: '',
        brand: '',
        model: '',
        min_price: 0,
        max_price: 0,
        condition: '',
        search: search || '',
        sort_by: 'created_at',
        sort_order: 'desc',
        page: 1,
        limit: 100,
        include_images: true,
        my_listings_only: false,
      })
      if (response.success && response.listings) {
        const transformedListings: MarketplaceListing[] = response.listings.map((item: any) => ({
          ...item,
          currentBidInfo: item.currentBidInfo || null,
          model: item.device || item.brand || item.model,
          timeLeftMinutes: item.timeLeft ? parseTimeLeftToMinutes(item.timeLeft) : 60,
          image: item.images && item.images.length > 0 ? item.images[0] : '/api/placeholder/300/200',
          photos: item.images || [],
          description: `${item.condition || ''} condition ${item.device || item.brand || ''}`,
          listingDate: item.created_at ? new Date(item.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          features: item.features || [],
          warranty: item.warranty || 'N/A',
          currentBid: item.bids && item.bids.length > 0 ? Math.max(...item.bids.map((bid: any) => bid.amount)) : item.currentBidInfo?.amount,
          seller: {
            name: item.seller?.name || item.contact_name || 'Unknown Seller',
            rating: item.seller?.rating || 5,
            isVerified: true
          },
          totalBids: item.bids ? item.bids.length : 0,
          bids: item.bids || [],
          winningBid: item.winningBid || null,
          isHot: item.isHot || false,
          isInstantWin: item.isInstantWin || false,
          isBiddable: item.isBiddable !== undefined ? item.isBiddable : true,
          timeLeft: item.timeLeft || '',
          timeRemaining: item.timeRemaining,
          storage: item.storage || '',
          color: item.color || '',
          brand: item.brand || '',
          condition: item.condition || '',
          location: item.location || (item.addresses && item.addresses[0]?.city) || 'N/A',
        }))
        setListings(transformedListings)
        setTotalListings(response.total || response.listings.length || 0)
      } else {
        setError(response.error || 'Failed to load listings')
        setListings([])
        setTotalListings(0)
      }
    } catch (error) {
      setError('Network error occurred while loading listings')
      setListings([])
      setTotalListings(0)
    } finally {
      setLoading(false)
    }
  }

  // Helper function to parse timeLeft string to minutes
  const parseTimeLeftToMinutes = (timeLeft: any): number => {
    if (!timeLeft || typeof timeLeft !== 'string' || timeLeft === 'Expired' || timeLeft === 'N/A') {
      return 0
    }
    const hourMatch = timeLeft.match(/(\d+)h/)
    const minuteMatch = timeLeft.match(/(\d+)m/)
    const hours = hourMatch ? parseInt(hourMatch[1]) : 0
    const minutes = minuteMatch ? parseInt(minuteMatch[1]) : 0
    return (hours * 60) + minutes
  }

  useEffect(() => {
    fetchAdminListings()
  }, [])

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchQuery.trim()) {
        fetchAdminListings(searchQuery.trim())
      } else {
        fetchAdminListings()
      }
    }, 500)
    return () => clearTimeout(delayedSearch)
  }, [searchQuery])

  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.device.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         listing.brand.toLowerCase().includes(searchQuery.toLowerCase())
    if (selectedFilter === 'all') return matchesSearch
    if (selectedFilter === 'instant-win') return matchesSearch && listing.isInstantWin
    return matchesSearch
  })

  const getTimeLeftColor = (timeLeft: any) => {
    if (!timeLeft || typeof timeLeft !== 'string' || timeLeft === 'Expired' || timeLeft === 'N/A') {
      return 'text-gray-600 bg-gray-100'
    }
    const minutes = parseTimeLeftToMinutes(timeLeft)
    if (minutes <= 120) return 'text-red-600 bg-red-100'
    if (minutes <= 360) return 'text-orange-600 bg-orange-100'
    return 'text-green-600 bg-green-100'
  }

  const getBidStatusColor = (totalBids: number) => {
    if (totalBids === 0) return 'text-gray-600'
    if (totalBids <= 2) return 'text-yellow-600'
    if (totalBids <= 5) return 'text-orange-600'
    return 'text-red-600'
  }

  const getStatusBadge = (listing: MarketplaceListing) => {
    if (listing.status === 'receiving_bids') {
      return <Badge className="bg-orange-500 text-white">⏳ Accepting Bids</Badge>
    }
    if (listing.status === 'bid_accepted') {
      return <Badge className="bg-green-500 text-white">✅ Bid Accepted</Badge>
    }
    if (listing.status === 'pickedup') {
      return <Badge className="bg-orange-500 text-white">🚚 Picked Up</Badge>
    }
    if (listing.status === 'completed') {
      return <Badge className="bg-green-600 text-white">🎉 Delivered</Badge>
    }
    if (listing.status === 'agent_assigned') {
      return <Badge className="bg-blue-500 text-white">👤 Agent Assigned</Badge>
    }
    if (listing.status === 'verification') {
      return <Badge className="bg-yellow-500 text-white">🔍 Verifying</Badge>
    }
    if (listing.status === 'ready_for_pickup') {
      return <Badge className="bg-purple-500 text-white">📦 Ready for Pickup</Badge>
    }
    if (listing.status === 'bidding_ended') {
      return <Badge className="bg-gray-500 text-white">⏰ Bidding Ended</Badge>
    }
    if (!listing.isBiddable) {
      return <Badge className="bg-gray-500 text-white">🚫 Not Available</Badge>
    }
    if (listing.isInstantWin) {
      return <Badge className="bg-orange-100 text-orange-800 border-orange-200">⚡ Instant Win</Badge>
    }
    if (listing.totalBids > 0 && listing.status !== 'receiving_bids') {
      return <Badge className="bg-blue-500 text-white">📈 Bidded</Badge>
    }
    return null
  }

  const handleRefresh = () => {
    const searchTerm = searchQuery.trim() || undefined
    fetchAdminListings(searchTerm)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header variant="admin" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">📱 Device Listings (Admin)</h2>
                <p className="text-gray-600">Browse all device listings as an admin. You can view details for each listing.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  {loading ? 'Loading...' : `${totalListings} listings available`}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={loading}
                >
                  {loading ? (
                    <Icons.spinner className="w-4 h-4 animate-spin" />
                  ) : (
                    <Icons.refresh className="w-4 h-4" />
                  )}
                  Refresh
                </Button>
              </div>
            </div>

            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-red-800">
                    <Icons.alertCircle className="w-5 h-5" />
                    <span className="font-medium">Error loading listings:</span>
                    <span>{error}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    className="mt-2"
                  >
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            )}

            <Card className="mb-4">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Icons.search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search devices..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { key: 'all', label: 'All' },
                      { key: 'instant-win', label: 'Instant Win' }
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
                </div>
              </CardContent>
            </Card>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="bg-gray-200 h-48 rounded-t-lg"></div>
                    <CardContent className="p-4">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                      <div className="h-8 bg-gray-200 rounded mb-2"></div>
                      <div className="h-8 bg-gray-200 rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredListings.map((listing) => (
                  <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <img
                        src={listing.image || (listing.images && listing.images.length > 0 ? listing.images[0] : '/api/placeholder/300/200')}
                        alt={listing.device}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/api/placeholder/300/200'
                        }}
                      />
                      <div className="absolute top-2 right-2 flex flex-col gap-1">
                        {getStatusBadge(listing)}
                      </div>
                      {listing.isHot && (
                        <Badge className="absolute top-2 left-2 bg-purple-500 text-white">
                          🔥 HOT
                        </Badge>
                      )}
                      {listing.status === 'receiving_bids' && (
                        <div className={`absolute bottom-2 left-2 px-2 py-1 rounded text-sm font-medium ${getTimeLeftColor(listing.timeRemaining || listing.timeLeft)}`}>
                          ⏱️ {listing.timeRemaining || listing.timeLeft}
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <div className="mb-3">
                        <h3 className="font-semibold text-gray-900 text-lg">{listing.device}</h3>
                        <p className="text-sm text-gray-600">{listing.storage}, {listing.color}</p>
                        <p className="text-sm text-gray-600">Condition: {listing.condition}</p>
                        <p className="text-xs text-gray-500">Status: {listing.status}</p>
                      </div>
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Asking:</span>
                          <span className="font-semibold text-green-600">₹{listing.askingPrice.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Current:</span>
                          <span className="font-semibold">
                            {listing.currentBidInfo ? `₹${listing.currentBidInfo.amount.toLocaleString()}` : 'No bids yet'}
                          </span>
                        </div>
                        {listing.winningBid && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Winning:</span>
                            <span className="font-semibold text-green-600">
                              ₹{listing.winningBid.amount.toLocaleString()}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Bids:</span>
                          <span className={`font-medium ${getBidStatusColor(listing.totalBids)}`}>
                            {listing.totalBids === 0 ? '🆕 New' :
                              listing.totalBids <= 2 ? `🟢 ${listing.totalBids} bid${listing.totalBids > 1 ? 's' : ''}` :
                              listing.totalBids <= 5 ? `🟡 ${listing.totalBids} bids` :
                              `🔴 ${listing.totalBids} bids`}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">📍 Location:</span>
                          <span>{listing.location}</span>
                        </div>
                        {listing.currentBidInfo && (
                          <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                            <p className="text-blue-800">
                              <strong>Top Bidder:</strong> {listing.currentBidInfo.vendor_name}
                            </p>
                            <p className="text-blue-600">
                              Bid: ₹{listing.currentBidInfo.amount.toLocaleString()}
                              {listing.currentBidInfo.instant_win && <span className="ml-1">⚡</span>}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full"
                          onClick={() => router.push(`/admin/listings/${listing.id}`)}
                        >
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            {!loading && !error && filteredListings.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Icons.search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No devices found</h3>
                  <p className="text-gray-600 mb-4">
                    {searchQuery ?
                      `No devices found matching "${searchQuery}". Try adjusting your search terms.` :
                      'No marketplace listings are currently available.'
                    }
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button
                      variant="outline"
                      onClick={() => setSearchQuery('')}
                      disabled={!searchQuery}
                    >
                      Clear Search
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleRefresh}
                    >
                      Refresh Listings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
