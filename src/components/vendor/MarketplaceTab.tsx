'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Icons } from '@/components/ui/icons'
import { BidModal } from './BidModal'
import sellikoClient from '@/selliko-client'
import { toast } from 'react-hot-toast'

// API Response types
interface MarketplaceAPIResponse {
  success: boolean
  listings?: any[]
  total?: number
  page?: number
  limit?: number
  error?: string
  message?: string
}

interface MarketplaceListing {
  id: string
  device: string
  brand: string
  model: string
  storage: string
  color: string
  condition: string
  currentBid: number | null
  askingPrice: number
  totalBids: number
  timeLeft: string
  location: string
  image: string
  isInstantWin: boolean
  isBiddable: boolean
  photos: string[]
  description: string
  seller: {
    name: string
    location: string
  }
  images: string[]
  isHot: boolean
}

export function MarketplaceTab() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [listings, setListings] = useState<MarketplaceListing[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedListing, setSelectedListing] = useState<MarketplaceListing | null>(null)
  const [bidModalOpen, setBidModalOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalListings, setTotalListings] = useState(0)

  // Fetch marketplace listings from API
  const fetchMarketplaceListings = async (search?: string) => {
    console.log('🔄 [MARKETPLACE-TAB] Fetching marketplace listings...', { search })
    setLoading(true)
    setError(null)
    
    try {
      const response = await sellikoClient.getMarketplaceListings({
        search: search || '',
        status: 'receiving_bids',
        page: 1,
        limit: 100 // As requested
      }) as MarketplaceAPIResponse

      console.log('📥 [MARKETPLACE-TAB] API response:', {
        success: response.success,
        listingsCount: response.listings?.length || 0,
        total: response.total,
        error: response.error
      })

      if (response.success && response.listings) {
        // Transform API response to match our interface
        const transformedListings: MarketplaceListing[] = response.listings.map((item: any) => ({
          id: item.id,
          device: item.device,
          brand: item.brand,
          model: item.device, // Use device as model fallback
          storage: item.storage,
          color: item.color,
          condition: item.condition,
          currentBid: item.currentBid || null,
          askingPrice: item.askingPrice,
          totalBids: item.totalBids || 0,
          timeLeft: item.timeLeft || 'N/A',
          location: item.location,
          image: item.images && item.images.length > 0 ? item.images[0] : '/api/placeholder/300/200',
          isInstantWin: item.isInstantWin || false,
          isBiddable: item.isBiddable !== false, // Default to true if not specified
          photos: item.images || [],
          description: `${item.condition} condition ${item.device}`,
          seller: {
            name: item.seller?.name || 'Unknown Seller',
            location: item.location
          },
          images: item.images || [],
          isHot: item.isHot || false
        }))

        setListings(transformedListings)
        setTotalListings(response.total || 0)
        console.log('✅ [MARKETPLACE-TAB] Listings loaded successfully:', transformedListings.length)
      } else {
        console.error('❌ [MARKETPLACE-TAB] API error:', response.error)
        setError(response.error || 'Failed to load marketplace listings')
        setListings([])
        setTotalListings(0)
      }
    } catch (error) {
      console.error('💥 [MARKETPLACE-TAB] Fetch error:', error)
      setError('Network error occurred while loading listings')
      setListings([])
      setTotalListings(0)
    } finally {
      setLoading(false)
    }
  }

  // Load listings on component mount
  useEffect(() => {
    fetchMarketplaceListings()
  }, [])

  // Handle search with debouncing
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchQuery.trim()) {
        fetchMarketplaceListings(searchQuery.trim())
      } else {
        fetchMarketplaceListings()
      }
    }, 500) // 500ms debounce

    return () => clearTimeout(delayedSearch)
  }, [searchQuery])

  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.device.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         listing.brand.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (selectedFilter === 'all') return matchesSearch
    if (selectedFilter === 'instant-win') return matchesSearch && listing.isInstantWin
    if (selectedFilter === 'ending-soon') return matchesSearch && listing.timeLeft.includes('h') && parseInt(listing.timeLeft) <= 6
    if (selectedFilter === 'apple') return matchesSearch && listing.brand.toLowerCase() === 'apple'
    if (selectedFilter === 'samsung') return matchesSearch && listing.brand.toLowerCase() === 'samsung'
    
    return matchesSearch
  })

  const getTimeLeftColor = (timeLeft: string) => {
    const hours = parseInt(timeLeft)
    if (hours <= 2) return 'text-red-600 bg-red-100'
    if (hours <= 6) return 'text-orange-600 bg-orange-100'
    return 'text-green-600 bg-green-100'
  }

  const getBidStatusColor = (totalBids: number) => {
    if (totalBids === 0) return 'text-gray-600'
    if (totalBids <= 2) return 'text-yellow-600'
    if (totalBids <= 5) return 'text-orange-600'
    return 'text-red-600'
  }

  const handlePlaceBid = (listing: MarketplaceListing) => {
    // Transform to match BidModal interface
    const bidModalListing = {
      ...listing,
      timeLeftMinutes: parseInt(listing.timeLeft) * 60 || 60, // Convert hours to minutes, default to 60
      listingDate: new Date().toISOString().split('T')[0], // Use today's date as fallback
      features: [], // Empty array as fallback
      warranty: 'N/A', // Default warranty status
      seller: {
        ...listing.seller,
        rating: 5, // Default rating
        isVerified: true // Default verification status
      }
    }
    setSelectedListing(bidModalListing as any)
    setBidModalOpen(true)
  }

  const handleInstantWin = (listing: MarketplaceListing) => {
    // Implement instant win logic
    toast.success(`Instant win: ${listing.device} for ₹${listing.askingPrice.toLocaleString()}`)
  }

  const handleRefresh = () => {
    const searchTerm = searchQuery.trim() || undefined
    fetchMarketplaceListings(searchTerm)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">📱 Device Marketplace</h2>
          <p className="text-gray-600">Browse and bid on verified devices from trusted sellers across Kerala.</p>
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

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-800">
              <Icons.alertCircle className="w-5 h-5" />
              <span className="font-medium">Error loading marketplace:</span>
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

      {/* Search and Filters */}
      <Card>
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
                { key: 'instant-win', label: 'Instant Win' },
                { key: 'ending-soon', label: 'Ending Soon' },
                { key: 'apple', label: 'Apple' },
                { key: 'samsung', label: 'Samsung' }
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

      {/* Listings Grid */}
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
                  src={listing.image} 
                  alt={listing.device}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    // Fallback to placeholder if image fails to load
                    e.currentTarget.src = '/api/placeholder/300/200'
                  }}
                />
                {listing.isInstantWin && (
                  <Badge className="absolute top-2 right-2 bg-orange-100 text-orange-800 border-orange-200">
                    ⚡ Instant Win
                  </Badge>
                )}
                {listing.isHot && (
                  <Badge className="absolute top-2 left-2 bg-red-500 text-white">
                    🔥 HOT
                  </Badge>
                )}
                {!listing.isBiddable && (
                  <Badge className="absolute top-2 left-2 bg-gray-500 text-white">
                    🚫 Bidding Closed
                  </Badge>
                )}
                <div className={`absolute bottom-2 left-2 px-2 py-1 rounded text-sm font-medium ${getTimeLeftColor(listing.timeLeft)}`}>
                  ⏱️ {listing.timeLeft} left
                </div>
              </div>
              
              <CardContent className="p-4">
                <div className="mb-3">
                  <h3 className="font-semibold text-gray-900 text-lg">{listing.device}</h3>
                  <p className="text-sm text-gray-600">{listing.storage}, {listing.color}</p>
                  <p className="text-sm text-gray-600">Condition: {listing.condition}</p>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Asking:</span>
                    <span className="font-semibold text-green-600">₹{listing.askingPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Current:</span>
                    <span className="font-semibold">
                      {listing.currentBid ? `₹${listing.currentBid.toLocaleString()}` : 'No bids yet'}
                    </span>
                  </div>
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
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handlePlaceBid(listing)}
                    disabled={!listing.isBiddable}
                  >
                    {listing.isBiddable ? 'Place Bid' : 'Bidding Closed'}
                  </Button>
                  {listing.isInstantWin && listing.isBiddable && (
                    <Button 
                      size="sm" 
                      className="flex-1 bg-orange-600 hover:bg-orange-700"
                      onClick={() => handleInstantWin(listing)}
                    >
                      Buy Now
                    </Button>
                  )}
                  {!listing.isBiddable && (
                    <div className="flex-1 text-center text-sm text-gray-500 py-2">
                      Bidding not available
                    </div>
                  )}
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

      {/* Bid Modal */}
      {selectedListing && (
        <BidModal
          listing={selectedListing}
          open={bidModalOpen}
          onOpenChange={setBidModalOpen}
        />
      )}
    </div>
  )
} 