'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Icons } from '@/components/ui/icons'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { BidModal } from './BidModal'
import sellikoClient from '@/selliko-client'
import { toast } from 'react-hot-toast'

// Updated API Response types based on new marketplace API
interface MarketplaceAPIResponse {
  success: boolean
  listings?: MarketplaceListing[]
  total?: number
  page?: number
  limit?: number
  error?: string
  message?: string
}

// Bid object structure from new API
interface BidInfo {
  id: string
  amount: number
  vendor_id: string
  vendor_name: string
  created_at: string
  instant_win: boolean
  status: 'active' | 'accepted' | 'rejected'
}

// Updated listing interface to match new API response
interface MarketplaceListing {
  id: string
  status: string // Current listing status
  device: string
  brand: string
  storage: string
  color: string
  condition: string
  askingPrice: number // Asking price from seller
  // New bid information from API
  currentBidInfo: BidInfo | null // Highest bid details (null if no bids)
  bids: BidInfo[] // Array of all bids sorted by amount (highest first)
  winningBid: BidInfo | null // Details of accepted/winning bid (null if none)
  totalBids: number
  timeLeft: string
  timeRemaining?: string // New field from API for accepting_bids status
  location: string
  seller: {
    name: string
    rating: number
    isVerified: boolean
  }
  images: string[]
  isHot: boolean
  isInstantWin: boolean // True if any bid has instant_win flag
  isBiddable: boolean // Whether listing accepts new bids (based on auth + status + time)
  
  // Legacy fields for backward compatibility (derived from new data)
  model: string
  timeLeftMinutes: number
  image?: string
  photos?: string[]
  description: string
  listingDate: string
  features: string[]
  warranty: string
  // Compatibility field for BidModal component
  currentBid?: number // Legacy format - just the amount
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
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [trackingModalOpen, setTrackingModalOpen] = useState(false)
  const [selectedWinningListing, setSelectedWinningListing] = useState<MarketplaceListing | null>(null)
  const [trackingData, setTrackingData] = useState<any>(null)
  const [trackingLoading, setTrackingLoading] = useState(false)

  // Fetch marketplace listings from API
  const fetchMarketplaceListings = async (search?: string) => {
    console.log('🔄 [MARKETPLACE-TAB] Fetching marketplace listings...', { search })
    setLoading(true)
    setError(null)
    
    try {
      const response = await sellikoClient.getMarketplaceListings({
        search: search || '',
        status: null as any, // Remove status constraint by passing null
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
        // The new API already returns properly structured data
        // Add legacy compatibility fields for existing UI components
        const transformedListings: MarketplaceListing[] = response.listings.map((item: MarketplaceListing) => ({
          ...item,
          // Legacy compatibility fields derived from new structure
          model: item.device || item.brand, // Use device as model fallback
          timeLeftMinutes: parseTimeLeftToMinutes(item.timeLeft) || 60, // Ensure it's always a number
          image: item.images && item.images.length > 0 ? item.images[0] : '/api/placeholder/300/200',
          photos: item.images || [],
          description: `${item.condition} condition ${item.device}`,
          listingDate: new Date().toISOString().split('T')[0], // Use today's date as fallback
          features: [], // Empty array as fallback
          warranty: 'N/A', // Default warranty status
          // Use highest bid instead of currentBidInfo for more accurate data
          currentBid: item.bids && item.bids.length > 0 ? Math.max(...item.bids.map(bid => bid.amount)) : item.currentBidInfo?.amount,
          seller: {
            name: item.seller?.name || 'Unknown Seller',
            rating: item.seller?.rating || 5, // Default rating
            isVerified: true // Default verification status for legacy compatibility
          }
        }))

        setListings(transformedListings)
        setTotalListings(response.total || 0)
        console.log('✅ [MARKETPLACE-TAB] Listings loaded successfully:', transformedListings.length)
        
        // Log sample listing structure for debugging
        if (transformedListings.length > 0) {
          console.log('📋 [MARKETPLACE-TAB] Sample listing structure:', {
            id: transformedListings[0].id,
            status: transformedListings[0].status,
            device: transformedListings[0].device,
            askingPrice: transformedListings[0].askingPrice,
            currentBid: transformedListings[0].currentBid,
            totalBids: transformedListings[0].totalBids,
            isBiddable: transformedListings[0].isBiddable,
            isInstantWin: transformedListings[0].isInstantWin,
            timeLeft: transformedListings[0].timeLeft,
            hasImages: transformedListings[0].images.length > 0
          })
        }
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

  // Helper function to parse timeLeft string to minutes
  const parseTimeLeftToMinutes = (timeLeft: any): number => {
    // Handle non-string or invalid values
    if (!timeLeft || typeof timeLeft !== 'string' || timeLeft === 'Expired' || timeLeft === 'N/A') {
      return 0
    }
    
    // Parse formats like "22h 44m", "1h 30m", "45m"
    const hourMatch = timeLeft.match(/(\d+)h/)
    const minuteMatch = timeLeft.match(/(\d+)m/)
    
    const hours = hourMatch ? parseInt(hourMatch[1]) : 0
    const minutes = minuteMatch ? parseInt(minuteMatch[1]) : 0
    
    return (hours * 60) + minutes
  }

  // Fetch current user on component mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await sellikoClient.getCurrentUser()
        setCurrentUser(user)
        console.log('👤 [MARKETPLACE-TAB] Current user:', user ? user.id : 'Not logged in')
      } catch (error) {
        console.error('❌ [MARKETPLACE-TAB] Failed to get current user:', error)
      }
    }
    
    fetchCurrentUser()
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
    if (selectedFilter === 'ending-soon') return matchesSearch && listing.timeLeftMinutes && listing.timeLeftMinutes <= 360 // 6 hours
    if (selectedFilter === 'apple') return matchesSearch && listing.brand.toLowerCase() === 'apple'
    if (selectedFilter === 'samsung') return matchesSearch && listing.brand.toLowerCase() === 'samsung'
    
    return matchesSearch
  })

  const getTimeLeftColor = (timeLeft: any) => {
    if (!timeLeft || typeof timeLeft !== 'string' || timeLeft === 'Expired' || timeLeft === 'N/A') {
      return 'text-gray-600 bg-gray-100'
    }
    
    const minutes = parseTimeLeftToMinutes(timeLeft)
    if (minutes <= 120) return 'text-red-600 bg-red-100' // 2 hours
    if (minutes <= 360) return 'text-orange-600 bg-orange-100' // 6 hours
    return 'text-green-600 bg-green-100'
  }

  const getBidStatusColor = (totalBids: number) => {
    if (totalBids === 0) return 'text-gray-600'
    if (totalBids <= 2) return 'text-yellow-600'
    if (totalBids <= 5) return 'text-orange-600'
    return 'text-red-600'
  }

  const getStatusBadge = (listing: MarketplaceListing) => {
    // Handle bid_accepted status with win/loss logic
    if (listing.status === 'bid_accepted' && listing.winningBid && currentUser) {
      const isMyWinningBid = listing.winningBid.vendor_id === currentUser.id
      
      if (isMyWinningBid) {
        // Show won badge based on instant_win flag
        if (listing.winningBid.instant_win) {
          return <Badge className="bg-green-500 text-white">⚡ Instant Won!</Badge>
        } else {
          return <Badge className="bg-green-500 text-white">🏆 You Won!</Badge>
        }
      } else {
        // Show lost badge for other users
        return <Badge className="bg-red-500 text-white">😔 You Lost</Badge>
      }
    }
    
    // Handle order processing statuses
    if (listing.status === 'agent_assigned') {
      return <Badge className="bg-blue-500 text-white">👤 Agent Assigned</Badge>
    }
    if (listing.status === 'verification') {
      return <Badge className="bg-yellow-500 text-white">🔍 Verifying</Badge>
    }
    if (listing.status === 'ready_for_pickup') {
      return <Badge className="bg-purple-500 text-white">📦 Ready for Pickup</Badge>
    }
    if (listing.status === 'pickedup') {
      return <Badge className="bg-orange-500 text-white">🚚 Picked Up</Badge>
    }
    if (listing.status === 'completed') {
      return <Badge className="bg-green-600 text-white">🎉 Delivered</Badge>
    }
    if (listing.status === 'bidding_ended') {
      return <Badge className="bg-gray-500 text-white">⏰ Bidding Ended</Badge>
    }
    if (listing.status === 'bid_accepted') {
      return <Badge className="bg-green-500 text-white">✅ Bid Accepted</Badge>
    }
    if (!listing.isBiddable) {
      return <Badge className="bg-gray-500 text-white">🚫 Not Available</Badge>
    }
    if (listing.isInstantWin) {
      return <Badge className="bg-orange-100 text-orange-800 border-orange-200">⚡ Instant Win</Badge>
    }
    return null
  }

  const handlePlaceBid = (listing: MarketplaceListing) => {
    // Check if user has the highest bid (if there are bids)
    const hasHighestBid = currentUser && listing.currentBidInfo && listing.currentBidInfo.vendor_id === currentUser.id
    
    // Allow bidding if status is receiving_bids and user doesn't have the highest bid
    if (listing.status !== 'receiving_bids' || hasHighestBid) {
      if (hasHighestBid) {
        toast.error('You already have the highest bid on this listing')
      } else {
        toast.error('Bidding is not available for this listing')
      }
      return
    }
    
    // Close any existing modal first to reset state
    if (bidModalOpen) {
      setBidModalOpen(false)
      // Small delay to ensure modal closes before opening new one
      setTimeout(() => {
        setSelectedListing(listing)
        setBidModalOpen(true)
      }, 100)
    } else {
      setSelectedListing(listing)
      setBidModalOpen(true)
    }
  }

  const handleTrackOrder = async (listing: MarketplaceListing) => {
    setSelectedWinningListing(listing)
    setTrackingModalOpen(true)
    setTrackingLoading(true)
    setTrackingData(null)
    
    try {
      console.log('🔍 [MARKETPLACE-TAB] Fetching tracking data for listing:', listing.id)
      
      const response = await sellikoClient.trackOrder(listing.id)
      
      console.log('📥 [MARKETPLACE-TAB] Tracking API response:', response)
      
      if (response && response.listing_id) {
        setTrackingData(response)
        console.log('✅ [MARKETPLACE-TAB] Tracking data loaded successfully:', response.status)
      } else {
        console.error('❌ [MARKETPLACE-TAB] Invalid tracking response:', response)
        toast.error('Failed to load tracking information')
      }
    } catch (error) {
      console.error('💥 [MARKETPLACE-TAB] Tracking API error:', error)
      toast.error('Network error occurred while loading tracking data')
    } finally {
      setTrackingLoading(false)
    }
  }

  const handleInstantWin = (listing: MarketplaceListing) => {
    if (!listing.isBiddable || !listing.isInstantWin) {
      toast.error('Instant win is not available for this listing')
      return
    }
    // Implement instant win logic
    toast.success(`Instant win: ${listing.device} for ₹${listing.askingPrice.toLocaleString()}`)
  }

  const handleRefresh = () => {
    const searchTerm = searchQuery.trim() || undefined
    fetchMarketplaceListings(searchTerm)
  }

  const handleModalClose = (open: boolean) => {
    setBidModalOpen(open)
    if (!open) {
      // Reset selected listing when modal closes to ensure clean state
      setTimeout(() => {
        setSelectedListing(null)
      }, 300) // Wait for modal close animation
    }
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
                  src={listing.image || (listing.images && listing.images.length > 0 ? listing.images[0] : '/api/placeholder/300/200')} 
                  alt={listing.device}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    // Fallback to placeholder if image fails to load
                    e.currentTarget.src = '/api/placeholder/300/200'
                  }}
                />
                
                {/* Status badges */}
                <div className="absolute top-2 right-2 flex flex-col gap-1">
                  {getStatusBadge(listing)}
                </div>
                
                {/* Check if user has the highest bid */}
                {currentUser && listing.currentBidInfo && listing.currentBidInfo.vendor_id === currentUser.id ? (
                  <Badge className="absolute top-2 left-2 bg-blue-500 text-white">
                    🏆 Highest Bid
                  </Badge>
                ) : listing.isHot && (
                  <Badge className="absolute top-2 left-2 bg-red-500 text-white">
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
                
                <div className="flex gap-2">
                  {/* Check if this is a winning bid for current user and show appropriate button/status */}
                  {currentUser && listing.winningBid && listing.winningBid.vendor_id === currentUser.id ? (
                    <>
                      {/* Show DELIVERED text for completed status */}
                      {listing.status === 'completed' ? (
                        <div className="flex-1 text-center">
                          <div className="text-2xl font-bold text-green-600 py-2">
                            🎉 DELIVERED
                          </div>
                        </div>
                      ) : (
                        /* Show Track Order button for bid_accepted, agent_assigned, verification, ready_for_pickup, pickedup */
                        (listing.status === 'bid_accepted' || 
                         listing.status === 'agent_assigned' || 
                         listing.status === 'verification' || 
                         listing.status === 'ready_for_pickup' || 
                         listing.status === 'pickedup') && (
                          <Button 
                            size="sm" 
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            onClick={() => handleTrackOrder(listing)}
                          >
                            🚚 Track Order
                          </Button>
                        )
                      )}
                    </>
                  ) : (
                    <>
                      {/* Show Place Bid button when status is receiving_bids */}
                      {listing.status === 'receiving_bids' ? (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => handlePlaceBid(listing)}
                            disabled={currentUser && listing.currentBidInfo && listing.currentBidInfo.vendor_id === currentUser.id}
                          >
                            {currentUser && listing.currentBidInfo && listing.currentBidInfo.vendor_id === currentUser.id 
                              ? 'Highest Bidder' 
                              : 'Place Bid'}
                          </Button>
                          {listing.isInstantWin && !(currentUser && listing.currentBidInfo && listing.currentBidInfo.vendor_id === currentUser.id) && (
                            <Button 
                              size="sm" 
                              className="flex-1 bg-orange-600 hover:bg-orange-700"
                              onClick={() => handleInstantWin(listing)}
                            >
                              Buy Now
                            </Button>
                          )}
                        </>
                      ) : (
                        <div className="flex-1 text-center text-sm text-gray-500 py-2">
                          {listing.status === 'bid_accepted' ? 'Sold' : 
                           listing.status === 'agent_assigned' ? 'Agent Assigned' :
                           listing.status === 'verification' ? 'Under Verification' :
                           listing.status === 'ready_for_pickup' ? 'Ready for Pickup' :
                           listing.status === 'pickedup' ? 'Picked Up' :
                           listing.status === 'completed' ? 'Delivered' :
                           listing.status === 'bidding_ended' ? 'Bidding Ended' : 'Not Available'}
                        </div>
                      )}
                    </>
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
          key={`bid-modal-${selectedListing.id}`}
          listing={selectedListing}
          open={bidModalOpen}
          onOpenChange={handleModalClose}
          currentUserId={currentUser?.id}
        />
      )}

      {/* Order Tracking Modal */}
      {selectedWinningListing && (
        <Dialog open={trackingModalOpen} onOpenChange={setTrackingModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Icons.package className="w-5 h-5" />
                Order Tracking - {selectedWinningListing.device}
              </DialogTitle>
            </DialogHeader>

            {trackingLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Icons.spinner className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">Loading tracking information...</p>
                </div>
              </div>
            ) : trackingData ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Agent Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">👤 Agent Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        {trackingData.agent?.profile_image_url ? (
                          <img 
                            src={trackingData.agent.profile_image_url} 
                            alt={trackingData.agent.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <Icons.user className="w-6 h-6 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold">{trackingData.agent?.name || 'Agent Name'}</p>
                        <p className="text-sm text-gray-600">Agent Code: {trackingData.agent?.agent_code || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">📞 Phone:</span>
                        <span>{trackingData.agent?.number || trackingData.agent?.contact_person_phone || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">📧 Email:</span>
                        <span>{trackingData.agent?.email || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">👤 Contact Person:</span>
                        <span>{trackingData.agent?.contact_person || trackingData.agent?.name || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">📍 Location:</span>
                        <span>{selectedWinningListing.location}</span>
                      </div>
                    </div>

                    {/* Show Delivery OTP if status is pickedup */}
                    {trackingData.status === 'pickedup' && trackingData.delivery_otp && (
                      <Card className="border-green-200 bg-green-50">
                        <CardContent className="p-4">
                          <div className="text-center">
                            <h4 className="font-semibold text-green-800 mb-2">🔑 Delivery OTP</h4>
                            <div className="text-2xl font-bold text-green-600 bg-white rounded-lg py-2 px-4 inline-block">
                              {trackingData.delivery_otp}
                            </div>
                            <p className="text-sm text-green-700 mt-2">
                              Share this OTP with the agent for device delivery
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    <div className="pt-4 border-t">
                      {trackingData.agent?.number && (
                        <Button className="w-full" variant="outline" onClick={() => window.open(`tel:${trackingData.agent.number}`)}>
                          📞 Call Agent
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Order Timeline */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">📋 Order Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { 
                          status: 'bid_accepted', 
                          label: 'Bid Accepted', 
                          date: 'Completed', 
                          completed: true, 
                          icon: '✅' 
                        },
                        { 
                          status: 'agent_assigned', 
                          label: 'Agent Assigned', 
                          date: trackingData.status === 'agent_assigned' ? 'In Progress' : trackingData.status === 'verification' || trackingData.status === 'ready_for_pickup' || trackingData.status === 'pickedup' || trackingData.status === 'completed' ? 'Completed' : 'Pending', 
                          completed: trackingData.status === 'agent_assigned' || trackingData.status === 'verification' || trackingData.status === 'ready_for_pickup' || trackingData.status === 'pickedup' || trackingData.status === 'completed', 
                          icon: '👤' 
                        },
                        { 
                          status: 'verification', 
                          label: 'Device Verification', 
                          date: trackingData.status === 'verification' ? 'In Progress' : trackingData.status === 'ready_for_pickup' || trackingData.status === 'pickedup' || trackingData.status === 'completed' ? 'Completed' : 'Pending', 
                          completed: trackingData.status === 'verification' || trackingData.status === 'ready_for_pickup' || trackingData.status === 'pickedup' || trackingData.status === 'completed', 
                          icon: '🔍' 
                        },
                        { 
                          status: 'ready_for_pickup', 
                          label: 'Ready for Pickup', 
                          date: trackingData.status === 'ready_for_pickup' ? 'Ready Now' : trackingData.status === 'pickedup' || trackingData.status === 'completed' ? 'Completed' : 'Pending', 
                          completed: trackingData.status === 'ready_for_pickup' || trackingData.status === 'pickedup' || trackingData.status === 'completed', 
                          icon: '📦' 
                        },
                        { 
                          status: 'pickedup', 
                          label: 'Device Picked Up', 
                          date: trackingData.status === 'pickedup' ? 'Picked Up' : trackingData.status === 'completed' ? 'Completed' : 'Pending', 
                          completed: trackingData.status === 'pickedup' || trackingData.status === 'completed', 
                          icon: '🚚' 
                        },
                        { 
                          status: 'completed', 
                          label: 'Delivered & Completed', 
                          date: trackingData.status === 'completed' ? 'Completed' : 'Pending', 
                          completed: trackingData.status === 'completed', 
                          icon: '🎉' 
                        }
                      ].map((step, index) => (
                        <div key={index} className={`flex items-center gap-3 p-3 rounded-lg border ${
                          step.completed ? 'bg-green-50 border-green-200' : 
                          trackingData.status === step.status ? 'bg-blue-50 border-blue-200' : 
                          'bg-gray-50 border-gray-200'
                        }`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                            step.completed ? 'bg-green-500 text-white' : 
                            trackingData.status === step.status ? 'bg-blue-500 text-white' : 
                            'bg-gray-300 text-gray-600'
                          }`}>
                            {step.icon}
                          </div>
                          <div className="flex-1">
                            <p className={`font-medium ${
                              step.completed ? 'text-green-800' : 
                              trackingData.status === step.status ? 'text-blue-800' : 
                              'text-gray-700'
                            }`}>
                              {step.label}
                            </p>
                            <p className={`text-sm ${
                              step.completed ? 'text-green-600' : 
                              trackingData.status === step.status ? 'text-blue-600' : 
                              'text-gray-500'
                            }`}>
                              {step.date}
                            </p>
                          </div>
                          {trackingData.status === step.status && (
                            <Badge className="bg-blue-100 text-blue-800 text-xs">
                              Current
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Icons.alertCircle className="w-8 h-8 mx-auto mb-4 text-red-500" />
                  <p className="text-red-600 mb-4">Failed to load tracking information</p>
                  <Button onClick={() => handleTrackOrder(selectedWinningListing)} variant="outline">
                    Retry
                  </Button>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setTrackingModalOpen(false)}>
                Close
              </Button>
              {trackingData && (
                <Button>
                  📱 Get Updates via WhatsApp
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
} 