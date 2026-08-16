'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Icons } from '@/components/ui/icons'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import sellikoClient from '@/selliko-client'
import Header from '@/components/layout/header'

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
  status: string
  statusCategory: 'active' | 'pending' | 'accepted' | 'sold' | 'rejected'
  statusLabel: string
  submittedAt: string
  bids: Array<{
    id: string
    vendorName: string
    amount: number
    timestamp: string
    status: string
  }>
  rejectionReason?: string
  description: string
  location: string
}

export default function MyListings() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [listings, setListings] = useState<DeviceListing[]>([])
  const [isLoadingListings, setIsLoadingListings] = useState(true)
  const [isAuthChecking, setIsAuthChecking] = useState(true)
  const [selectedTab, setSelectedTab] = useState<'all' | 'active' | 'accepted' | 'pending' | 'sold'>('all')

  // Authentication and role check
  useEffect(() => {
    const checkAuthAndRole = async () => {
      console.log('🔒 [MY-LISTINGS] Checking authentication and role...')
      try {
        const user = await sellikoClient.getCurrentUser()
        
        if (!user) {
          toast.error('Please login to continue')
          router.replace('/login')
          return
        }

        const userRole = (user.user_role || user.role || '').toLowerCase()
        
        if (userRole !== 'client') {
          toast.error('Access denied. Redirecting to your dashboard.')
          router.replace(`/${userRole}`)
          return
        }

        setIsAuthChecking(false)
      } catch (error) {
        console.error('💥 [MY-LISTINGS] Auth check error:', error)
        toast.error('Authentication error')
        router.replace('/login')
      }
    }

    checkAuthAndRole()
  }, [router])

  // Transform API listing data to match card format
  const transformListingData = (apiListing: any): DeviceListing => {
    const device = apiListing.devices?.[0] || {}
    
    // Create full device info
    const brand = device.brand || 'Unknown Brand'
    const model = device.model || 'Unknown Model'
    const storage = device.storage || ''
    const color = device.color || ''
    const condition = device.condition || 'Unknown'
    
    // Get available images
    const availableImages = [
      device.front_image_url,
      device.back_image_url, 
      device.top_image_url,
      device.bottom_image_url,
      device.bill_image_url,
      device.warranty_image_url
    ].filter(Boolean)
    
    // Use placeholder if no images
    const images = availableImages.length > 0 ? availableImages : ['/api/placeholder/300/300']
    
    const rawStatus = (apiListing.status || 'pending_approval').toLowerCase()
    
    // Categorize status for tabs
    let statusCategory: 'active' | 'pending' | 'accepted' | 'sold' | 'rejected' = 'pending'
    let statusLabel = 'Under Review'

    if (rawStatus === 'receiving_bids' || rawStatus === 'approved') {
      statusCategory = 'active'
      statusLabel = 'Receiving Bids'
    } else if (rawStatus === 'bidding_ended') {
      statusCategory = 'accepted'
      statusLabel = 'Bidding Ended'
    } else if (rawStatus === 'bid_accepted') {
      statusCategory = 'accepted'
      statusLabel = 'Bid Accepted'
    } else if (['agent_assigned', 'verification', 'ready_for_pickup', 'pickedup'].includes(rawStatus)) {
      statusCategory = 'accepted'
      statusLabel = rawStatus === 'agent_assigned' ? 'Agent Assigned' :
                    rawStatus === 'verification' ? 'Verification' :
                    rawStatus === 'ready_for_pickup' ? 'Ready for Pickup' : 'Picked Up'
    } else if (rawStatus === 'completed' || rawStatus === 'sold') {
      statusCategory = 'sold'
      statusLabel = 'Completed'
    } else if (rawStatus === 'rejected') {
      statusCategory = 'rejected'
      statusLabel = 'Rejected'
    } else if (rawStatus === 'cancelled') {
      statusCategory = 'rejected'
      statusLabel = 'Cancelled'
    }

    // Calculate actual time left
    let timeLeft = statusLabel
    let timeLeftMinutes = 0

    if (statusCategory === 'active') {
      if (apiListing.time_approved) {
        const approvedTime = new Date(apiListing.time_approved).getTime()
        const endTime = approvedTime + 24 * 60 * 60 * 1000
        const diffMs = endTime - Date.now()
        timeLeftMinutes = Math.max(0, Math.floor(diffMs / (1000 * 60)))
        const hours = Math.floor(timeLeftMinutes / 60)
        const mins = timeLeftMinutes % 60
        timeLeft = timeLeftMinutes > 0 ? `${hours}h ${mins}m left` : '0m left'
      } else {
        timeLeft = '24h left'
        timeLeftMinutes = 1440
      }
    }

    // Process bids data correctly
    const bidsArray = Array.isArray(apiListing.bids) ? apiListing.bids : []
    const transformedBids = bidsArray
      .filter((b: any) => typeof b === 'object' && b !== null)
      .sort((a: any, b: any) => (b.bid_amount || 0) - (a.bid_amount || 0))
      .map((bid: any) => ({
        id: bid.id?.toString() || '',
        vendorName: bid.vendor_profile?.name || bid.vendor?.name || 'Verified Vendor',
        amount: Number(bid.bid_amount || 0),
        timestamp: bid.created_at || new Date().toISOString(),
        status: bid.status || 'active'
      }))

    // Calculate highest bid reliably
    const validAmounts = transformedBids.map((b: { amount: number }) => b.amount).filter((a: number) => a > 0)
    const highestFromBids = validAmounts.length > 0 ? Math.max(...validAmounts) : 0
    const highestBidAmount = Number(apiListing.highest_bid_value || 0) || 
                             (typeof apiListing.highest_bid === 'object' && apiListing.highest_bid ? Number(apiListing.highest_bid.bid_amount || 0) : 0) ||
                             highestFromBids || undefined

    return {
      id: apiListing.id?.toString() || '',
      device: {
        brand,
        model,
        storage,
        color,
        condition
      },
      images,
      askingPrice: Number(apiListing.asking_price || apiListing.expected_price || 0),
      currentBid: highestBidAmount,
      totalBids: bidsArray.length,
      timeLeft,
      timeLeftMinutes,
      status: rawStatus,
      statusCategory,
      statusLabel,
      submittedAt: apiListing.created_at || new Date().toISOString(),
      bids: transformedBids,
      rejectionReason: apiListing.rejection_note || apiListing.rejection_reason || apiListing.reason_note,
      description: device.description || 'No description available',
      location: apiListing.pickup_city || 'Kerala, India'
    }
  }

  // Load user listings with periodic background polling
  useEffect(() => {
    let isMounted = true

    const loadListings = async (showLoadingSpinner = false) => {
      if (isAuthChecking || isLoading) {
        return
      }

      if (showLoadingSpinner) {
        setIsLoadingListings(true)
      }
      
      try {
        const myListingsResult = await sellikoClient.getMyListings({
          limit: 50,
          sort_by: 'created_at',
          sort_order: 'desc'
        } as any)
        
        if (isMounted) {
          if ((myListingsResult as any).success && (myListingsResult as any).listings) {
            const transformedListings = (myListingsResult as any).listings.map(transformListingData)
            setListings(transformedListings)
          } else {
            setListings([])
          }
        }
      } catch (error) {
        console.error('💥 [MY-LISTINGS] Error loading listings:', error)
        if (isMounted && showLoadingSpinner) {
          setListings([])
        }
      } finally {
        if (isMounted && showLoadingSpinner) {
          setIsLoadingListings(false)
        }
      }
    }

    loadListings(true)

    // Poll every 15s for live updates
    const pollInterval = setInterval(() => {
      loadListings(false)
    }, 15000)

    return () => {
      isMounted = false
      clearInterval(pollInterval)
    }
  }, [isAuthChecking, isLoading])

  // Function to handle listing card click and navigate to listing details page
  const handleListingClick = (listingId: string) => {
    router.push(`/client/listings/${listingId}`)
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
      case 'receiving_bids':
      case 'approved':
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'bid_accepted':
      case 'bidding_ended':
      case 'agent_assigned':
      case 'verification':
      case 'ready_for_pickup':
      case 'pickedup':
      case 'accepted':
        return 'bg-purple-100 text-purple-800'
      case 'pending_approval':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'sold':
      case 'completed':
        return 'bg-emerald-100 text-emerald-800'
      case 'rejected':
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTimeColor = (minutes: number) => {
    if (minutes <= 60) return 'text-red-600'
    if (minutes <= 360) return 'text-orange-600'
    return 'text-green-600'
  }

  const filteredListings = listings.filter(listing => {
    if (selectedTab === 'all') return true
    return listing.statusCategory === selectedTab
  })

  const tabs = [
    { key: 'all', label: 'All Listings', count: listings.length },
    { key: 'active', label: 'Receiving Bids', count: listings.filter(l => l.statusCategory === 'active').length },
    { key: 'accepted', label: 'In Progress / Accepted', count: listings.filter(l => l.statusCategory === 'accepted').length },
    { key: 'pending', label: 'Under Review', count: listings.filter(l => l.statusCategory === 'pending').length },
    { key: 'sold', label: 'Completed', count: listings.filter(l => l.statusCategory === 'sold').length }
  ]

  // Loading state
  if (isLoading || isAuthChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-green-50">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-2xl mb-4">
            <Icons.spinner className="w-8 h-8 text-white animate-spin" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Your Listings</h2>
          <p className="text-gray-600">Getting your device listings ready...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Header variant="client" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Link href="/client" className="text-gray-500 hover:text-gray-700">
                <Icons.arrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Device Listings</h1>
            </div>
            <p className="text-gray-600">Track your device sales and manage bids</p>
          </div>
          <Link href="/client/list-device" className="w-full sm:w-auto">
            <Button className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
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
                ₹{listings.length > 0 ? Math.max(...listings.map(l => l.currentBid || 0)).toLocaleString() : '0'}
              </div>
              <div className="text-sm text-gray-600">Highest Bid</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
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

        {/* Loading State for Listings */}
        {isLoadingListings ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-0">
                  <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredListings.length === 0 ? (
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
        ) : (
          /* Listings Grid */
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <Card 
                key={listing.id} 
                className="hover:shadow-lg transition-all duration-200 cursor-pointer"
                onClick={() => handleListingClick(listing.id)}
              >
                <CardContent className="p-0">
                  {/* Image and Status */}
                  <div className="relative">
                    <img 
                      src={listing.images[0]} 
                      alt={listing.device.model}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <Badge className={`absolute top-2 left-2 ${getStatusColor(listing.status)}`}>
                      {listing.statusLabel}
                    </Badge>
                    {listing.statusCategory === 'active' && (
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
                          <p className="text-xs sm:text-sm text-gray-600">Asking Price</p>
                          <p className="text-base sm:text-lg font-bold text-gray-900">{formatCurrency(listing.askingPrice)}</p>
                        </div>
                        {listing.currentBid ? (
                          <div className="text-right">
                            <p className="text-xs sm:text-sm text-gray-600">
                              {listing.statusCategory === 'accepted' || listing.statusCategory === 'sold'
                                ? 'Winning Bid'
                                : 'Highest Bid'}
                            </p>
                            <p className={`text-base sm:text-lg font-bold ${
                              listing.statusCategory === 'accepted' || listing.statusCategory === 'sold'
                                ? 'text-purple-600'
                                : 'text-emerald-600'
                            }`}>
                              {formatCurrency(listing.currentBid)}
                            </p>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    {/* Bidding Status */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className={`font-medium ${listing.totalBids > 0 ? 'text-emerald-600' : 'text-gray-500'}`}>
                          {listing.totalBids === 0 ? 'No bids placed yet' : `${listing.totalBids} bid${listing.totalBids > 1 ? 's' : ''} received`}
                        </span>
                      </div>
                    </div>

                    {/* Latest Bid Alert */}
                    {listing.statusCategory === 'active' && listing.bids.length > 0 && (
                      <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div>
                          <p className="text-xs font-semibold text-blue-900">Highest Active Bid</p>
                          <p className="text-xs text-blue-700">
                            {formatCurrency(listing.bids[0].amount)} by {listing.bids[0].vendorName}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Status-specific content */}
                    {listing.statusCategory === 'accepted' && (
                      <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-xs sm:text-sm">
                        <div className="flex items-center gap-2">
                          <Icons.check className="w-4 h-4 text-purple-600 flex-shrink-0" />
                          <span className="text-purple-800 font-semibold">{listing.statusLabel}</span>
                        </div>
                        <p className="text-purple-700 text-xs mt-1">
                          {listing.status === 'bid_accepted'
                            ? 'Winning bid accepted. Agent will be assigned for pickup.'
                            : listing.status === 'agent_assigned'
                            ? 'An agent is assigned to inspect and collect your device.'
                            : listing.status === 'verification'
                            ? 'Agent is verifying your device condition.'
                            : listing.status === 'ready_for_pickup'
                            ? 'Inspection complete. Ready for pickup and bank payout.'
                            : listing.status === 'bidding_ended'
                            ? 'Bidding ended. Click to review and accept the highest bid.'
                            : 'Fulfillment in progress.'}
                        </p>
                      </div>
                    )}

                    {listing.statusCategory === 'pending' && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs sm:text-sm">
                        <div className="flex items-center gap-2">
                          <Icons.clock className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                          <span className="text-yellow-800 font-medium">Awaiting Admin Approval</span>
                        </div>
                        <p className="text-yellow-700 text-xs mt-1">Your listing will be live for bidding once approved.</p>
                      </div>
                    )}

                    {listing.statusCategory === 'rejected' && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs sm:text-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <Icons.x className="w-4 h-4 text-red-600 flex-shrink-0" />
                          <span className="text-red-800 font-medium">Listing Rejected</span>
                        </div>
                        <p className="text-red-700 text-xs">{listing.rejectionReason || 'Please review device details and resubmit.'}</p>
                      </div>
                    )}

                    {listing.statusCategory === 'sold' && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-xs sm:text-sm">
                        <div className="flex items-center gap-2">
                          <Icons.check className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <span className="text-green-800 font-medium">Successfully Sold!</span>
                        </div>
                        <p className="text-green-700 text-xs mt-1">Payment and order fulfillment completed.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}


      </div>
    </div>
  )
} 