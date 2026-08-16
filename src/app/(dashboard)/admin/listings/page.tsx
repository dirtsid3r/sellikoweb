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
  ram?: string
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
      const response = await sellikoClient.getMarketplaceListings({
        search: search || '',
        status: null as any, // fetch all statuses
        page: 1,
        limit: 100,
      }) as any

      if (response.success && response.listings) {
        // Transform to admin shape; fallback/compat logic exactly as in MarketplaceTab
        const transformedListings: MarketplaceListing[] = response.listings.map((item: any) => {
          const device = (item.devices && item.devices[0]) || {}
          const brand = item.brand || device.brand || 'Unknown'
          const model = item.model || device.model || ''
          const storage = item.storage || device.variant || device.storage || ''
          const ram = item.ram || device.ram || ''
          const color = item.color || device.color || ''
          const condition = item.condition || device.condition || ''
          const askingPrice = (item.expected_price || item.asking_price || 0) / 100

          // Bids and winning bid (admin listings may differ in fields)
          const bids = Array.isArray(item.bids)
            ? item.bids.map((bid: any) => ({
                id: bid.bid_id?.toString() || '',
                amount: (bid.bid_amount ?? 0) / 100,
                vendor_id: bid.user_id || '',
                vendor_name: bid.vendor_name || 'Vendor',
                created_at: bid.created_at || '',
                instant_win: !!bid.instant_win,
                status: bid.status || 'active',
              }))
            : []
          const totalBids = bids.length
          // Sort for currentBidInfo/winningBid logic
          const highestBid = bids.reduce((max: any, b: any) => b.amount > max.amount ? b : max, { amount: 0 })
          
          const clientAddress = item.addresses?.find((addr: any) => addr.type === 'client') || {}
          const sellerName = item.seller?.name || 
                             item.contact_name || 
                             clientAddress.contact_name || 
                             clientAddress.name || 
                             'Unknown Seller'

          return {
            id: (item.id || '').toString(),
            status: item.status || '',
            device: `${brand} ${model}`.trim() || 'Unknown Device',
            brand,
            storage,
            color,
            condition,
            askingPrice,
            currentBidInfo: highestBid && highestBid.amount > 0 ? highestBid : null,
            bids,
            winningBid: null, // Fill as needed per role/UI, not available in sample
            totalBids,
            timeLeft: '', // If not in API, fallback
            timeRemaining: '',
            location: (item.addresses && item.addresses[0]?.city) || '',
            seller: { name: sellerName, rating: 5, isVerified: false },
            images: item.images || [],
            isHot: false,
            isInstantWin: false,
            isBiddable: true,
            model: model || '',
            timeLeftMinutes: 60, // fallback parseTimeLeftToMinutes
            image: item.images && item.images.length > 0 ? item.images[0] : '/api/placeholder/300/200',
            photos: item.images || [],
            description: `${brand} ${model} ${storage}`.trim(),
            listingDate: item.created_at ? new Date(item.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            features: [],
            warranty: '',
            currentBid: highestBid ? highestBid.amount : 0,
            ram
          }
        })
        setListings(transformedListings)
        setTotalListings(response.total || response.listings.length || 0)
      } else {
        setListings([])
        setTotalListings(0)
      }
    } catch (error) {
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
      return <Badge className="bg-orange-500 text-white">Accepting Bids</Badge>
    }
    if (listing.status === 'bid_accepted') {
      return <Badge className="bg-green-500 text-white">Bid Accepted</Badge>
    }
    if (listing.status === 'pickedup') {
      return <Badge className="bg-orange-500 text-white">Picked Up</Badge>
    }
    if (listing.status === 'completed') {
      return <Badge className="bg-green-600 text-white">Delivered</Badge>
    }
    if (listing.status === 'agent_assigned') {
      return <Badge className="bg-blue-500 text-white">Agent Assigned</Badge>
    }
    if (listing.status === 'verification') {
      return <Badge className="bg-yellow-500 text-white">Verifying</Badge>
    }
    if (listing.status === 'ready_for_pickup') {
      return <Badge className="bg-purple-500 text-white">Ready for Pickup</Badge>
    }
    if (listing.status === 'bidding_ended') {
      return <Badge className="bg-gray-500 text-white">Bidding Ended</Badge>
    }
    if (listing.status === 'pending_approval') {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending Approval</Badge>
    }
    if (listing.status === 'rejected') {
      return <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>
    }
    if (listing.status === 'cancelled') {
      return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Cancelled</Badge>
    }
    if (!listing.isBiddable) {
      return <Badge className="bg-gray-500 text-white">Not Available</Badge>
    }
    if (listing.isInstantWin) {
      return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Instant Win</Badge>
    }
    if (listing.totalBids > 0 && listing.status !== 'receiving_bids') {
      return <Badge className="bg-blue-500 text-white">Bidded</Badge>
    }
    if (listing.status) {
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200">{listing.status}</Badge>
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
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Device Listings</h2>
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
                          Hot
                        </Badge>
                      )}
                      {listing.status === 'receiving_bids' && (
                        <div className={`absolute bottom-2 left-2 px-2 py-1 rounded text-sm font-medium ${getTimeLeftColor(listing.timeRemaining || listing.timeLeft)}`}>
                          {listing.timeRemaining || listing.timeLeft}
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4 flex flex-col gap-2">
                      <h3 className="text-lg font-bold text-gray-900 mb-0.5">{listing.device}</h3>
                      <div className="flex flex-wrap gap-2 text-gray-600 text-xs">
                        <span>Condition: <span className="font-semibold text-gray-800">{listing.condition || 'N/A'}</span></span>
                        <span>Storage: <span className="font-semibold text-gray-800">{listing.storage || 'N/A'}</span></span>
                        <span>RAM: <span className="font-semibold text-gray-800">{listing.ram || 'N/A'}</span></span>
                        <span>Color: <span className="font-semibold text-gray-800">{listing.color || 'N/A'}</span></span>
                      </div>
                      <div className="flex flex-wrap gap-2 text-gray-600 text-xs mb-1">
                        <span>Seller: <span className="font-semibold text-gray-800">{listing.seller?.name || 'Unknown'}</span></span>
                        <span>Location: <span className="font-semibold text-gray-800">{listing.location || 'N/A'}</span></span>
                        <span>Listed: <span className="font-semibold text-gray-800">{listing.listingDate || 'N/A'}</span></span>
                      </div>
                      <p className="text-gray-700 text-sm mb-1">{listing.description}</p>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-gray-700 text-sm mb-2">
                        <span>Asking Price: <Badge className="bg-blue-500 text-white">₹{listing.askingPrice.toLocaleString()}</Badge></span>
                        <span>Current Bid: <Badge className="bg-green-500 text-white">₹{(listing.currentBidInfo?.amount || 0).toLocaleString()}</Badge></span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-gray-700 text-sm mb-2">
                        <span>Bids: <Badge className={`${getBidStatusColor(listing.totalBids)}`}>{listing.totalBids}</Badge></span>
                        <span>Time Left: <Badge className={`${getTimeLeftColor(listing.timeRemaining || listing.timeLeft)}`}>{listing.timeRemaining || listing.timeLeft}</Badge></span>
                      </div>
                      <button
                        onClick={() => router.push(`/admin/listings/${listing.id}`)}
                        className="mt-2 inline-flex items-center px-3 py-2 text-sm font-medium bg-gray-900 text-white rounded hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-800"
                        type="button"
                      >
                        <Icons.smartphone className="w-4 h-4 mr-1" />
                        View Details
                      </button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}