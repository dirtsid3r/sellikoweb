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

export default function MyListings() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [listings, setListings] = useState<DeviceListing[]>([])
  const [isLoadingListings, setIsLoadingListings] = useState(true)
  const [isAuthChecking, setIsAuthChecking] = useState(true)
  const [selectedTab, setSelectedTab] = useState<'all' | 'active' | 'pending' | 'sold'>('all')


  // Authentication and role check
  useEffect(() => {
    const checkAuthAndRole = async () => {
      console.log('🔒 [MY-LISTINGS] Checking authentication and role...')
      try {
        const user = await sellikoClient.getCurrentUser()
        console.log('👤 [MY-LISTINGS] Current user:', user ? {
          id: user.id,
          role: user.user_role,
        } : 'No user found')
        
        if (!user) {
          console.log('❌ [MY-LISTINGS] No user found, redirecting to login')
          toast.error('Please login to continue')
          router.replace('/login')
          return
        }

        const userRole = (user.user_role || user.role || '').toLowerCase()
        console.log('👑 [MY-LISTINGS] User role:', userRole)
        
        if (userRole !== 'client') {
          console.log(`⚠️ [MY-LISTINGS] Invalid role access attempt: ${userRole}`)
          toast.error('Access denied. Redirecting to your dashboard.')
          router.replace(`/${userRole}`)
          return
        }

        console.log('✅ [MY-LISTINGS] Role verification successful')
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
    
    // Determine status
    let status: 'pending' | 'active' | 'sold' | 'rejected' = 'pending'
    if (apiListing.status === 'receiving_bids' || apiListing.status === 'approved') {
      status = 'active'
    } else if (apiListing.status === 'completed' || apiListing.status === 'sold') {
      status = 'sold'
    } else if (apiListing.status === 'rejected') {
      status = 'rejected'
    }

    // Calculate time left based on status
    let timeLeft = 'Under review'
    let timeLeftMinutes = 0
    if (status === 'active') {
      timeLeft = '24h left' // Default for active listings
      timeLeftMinutes = 1440 // 24 hours in minutes
    }

    return {
      id: apiListing.id,
      device: {
        brand,
        model,
        storage,
        color,
        condition
      },
      images,
      askingPrice: apiListing.asking_price || apiListing.expected_price || 0,
      currentBid: apiListing.highest_bid || undefined,
      totalBids: apiListing.bids || 0,
      timeLeft,
      timeLeftMinutes,
      status,
      submittedAt: apiListing.created_at || new Date().toISOString(),
      bids: [], // TODO: Implement bid details if needed
      description: device.description || 'No description available',
      location: apiListing.pickup_city || 'Unknown location'
    }
  }

  // Load user listings when authentication is complete
  useEffect(() => {
    const loadListings = async () => {
      if (isAuthChecking || isLoading) {
        console.log('⏳ [MY-LISTINGS] Waiting for auth check to complete...')
        return
      }

      console.log('📋 [MY-LISTINGS] Loading user listings...')
      setIsLoadingListings(true)
      
      try {
        // Get current user's listings
        console.log('👤 [MY-LISTINGS] Calling getMyListings()...')
        const myListingsResult = await sellikoClient.getMyListings({
          limit: 50, // Get more listings for the listings page
          sort_by: 'created_at',
          sort_order: 'desc'
        } as any)
        
        console.log('📊 [MY-LISTINGS] My listings result:', myListingsResult)
        
        if ((myListingsResult as any).success && (myListingsResult as any).listings) {
          // Transform API data to match card format
          const transformedListings = (myListingsResult as any).listings.map(transformListingData)
          console.log('🔄 [MY-LISTINGS] Transformed listings:', transformedListings)
          setListings(transformedListings)

          // Demonstrate getListingById function with the first listing
          if (transformedListings.length > 0) {
            const firstListingId = transformedListings[0].id
            console.log('🔍 [MY-LISTINGS] Demonstrating getListingById with first listing:', firstListingId)
            
            try {
              const listingDetails = await sellikoClient.getListingById(firstListingId, {
                include_images: true,
                include_bids: true,
                include_user_details: false
              })
              
              console.log('✨ [MY-LISTINGS] DEMONSTRATION - getListingById result for first listing:', listingDetails)
            } catch (detailError) {
              console.error('❌ [MY-LISTINGS] Failed to fetch first listing details:', detailError)
            }
          }
        } else {
          console.warn('⚠️ [MY-LISTINGS] Failed to load listings or no listings found')
          setListings([])
        }
        
      } catch (error) {
        console.error('💥 [MY-LISTINGS] Error loading listings:', error)
        setListings([])
        toast.error('Failed to load listings. Please try again.')
      } finally {
        setIsLoadingListings(false)
      }
    }

    loadListings()
  }, [isAuthChecking, isLoading])

  // Function to handle listing card click and navigate to listing details page
  const handleListingClick = (listingId: string) => {
    console.log('🖱️ [MY-LISTINGS] Listing card clicked, navigating to:', `/client/listings/${listingId}`)
    router.push(`/client/listings/${listingId}`)
  }

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



  const tabs = [
    { key: 'all', label: 'All Listings', count: listings.length },
    { key: 'active', label: 'Active', count: listings.filter(l => l.status === 'active').length },
    { key: 'pending', label: 'Pending Approval', count: listings.filter(l => l.status === 'pending').length },
    { key: 'sold', label: 'Sold', count: listings.filter(l => l.status === 'sold').length }
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Link href="/client" className="text-gray-500 hover:text-gray-700">
                <Icons.arrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">📱 My Device Listings</h1>
            </div>
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
                ₹{listings.length > 0 ? Math.max(...listings.map(l => l.currentBid || 0)).toLocaleString() : '0'}
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
                      </div>
                    </div>

                    {/* Latest Bid Alert */}
                    {listing.status === 'active' && listing.bids.length > 0 && (
                      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-blue-900">Latest Bid</p>
                          <p className="text-xs text-blue-700">
                            {formatCurrency(listing.bids[0].amount)} by {listing.bids[0].vendorName}
                          </p>
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
        )}


      </div>
    </div>
  )
} 