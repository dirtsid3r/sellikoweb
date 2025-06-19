'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Icons } from '@/components/ui/icons'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import sellikoClient from '@/selliko-client'
import { toast } from 'react-hot-toast'
import { BidModal } from '@/components/vendor/BidModal'

// Helper function to calculate time remaining based on approval time
const calculateTimeRemaining = (timeApproved: string | null): string => {
  if (!timeApproved) {
    return 'Pending approval'
  }

  try {
    const approvedTime = new Date(timeApproved)
    const endTime = new Date(approvedTime.getTime() + (24 * 60 * 60 * 1000)) // Add 24 hours
    const now = new Date()
    const timeLeft = endTime.getTime() - now.getTime()

    if (timeLeft <= 0) {
      return 'Auction ended'
    }

    const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60))
    const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))

    if (hoursLeft > 0) {
      return `${hoursLeft}h ${minutesLeft}m left`
    } else if (minutesLeft > 0) {
      return `${minutesLeft}m left`
    } else {
      return 'Less than 1m left'
    }
  } catch (error) {
    console.error('Error calculating time remaining:', error)
    return 'Time unavailable'
  }
}

// Helper function to get time remaining status color
const getTimeRemainingColor = (timeRemaining: string): string => {
  if (timeRemaining.includes('ended') || timeRemaining.includes('unavailable')) {
    return 'text-red-600'
  }
  
  // Extract hours if present
  const hoursMatch = timeRemaining.match(/(\d+)h/)
  const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0
  
  if (hours < 1) {
    return 'text-red-600' // Less than 1 hour - red
  } else if (hours < 6) {
    return 'text-orange-600' // Less than 6 hours - orange
  } else {
    return 'text-green-600' // More than 6 hours - green
  }
}

export default function VendorListingDetailPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const listingId = params.id as string

  // State for listing data and loading
  const [listing, setListing] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState<string>('')

  // Modal states
  const [bidModalOpen, setBidModalOpen] = useState(false)
  const [marketplaceListing, setMarketplaceListing] = useState<any>(null)
  const [trackingModalOpen, setTrackingModalOpen] = useState(false)
  const [trackingData, setTrackingData] = useState<any>(null)
  const [trackingLoading, setTrackingLoading] = useState(false)

  // Load listing data when page loads
  useEffect(() => {
    const loadListingData = async () => {
      if (!listingId) {
        setError('No listing ID provided')
        setIsLoading(false)
        return
      }

      console.log('🔍 [VENDOR-LISTING-DETAIL] Loading listing data for ID:', listingId)
      setIsLoading(true)
      setError(null)

      try {
        // Call getListingById function from selliko-client
        const result = await sellikoClient.getListingById(listingId, {
          include_images: true,
          include_bids: true,
          include_user_details: false // Don't need sensitive user details for vendors
        })

        console.log('📊 [VENDOR-LISTING-DETAIL] Received listing data:', result)

        if ((result as any).success && (result as any).listing) {
          const apiListing = (result as any).listing
          
          // Get highest bid from sorted bids array
          const sortedBids = Array.isArray(apiListing.bids) ? 
            [...apiListing.bids].sort((a, b) => b.bid_amount - a.bid_amount) : []
          const highestBid = sortedBids.length > 0 ? sortedBids[0].bid_amount : 0
          
          // Transform API data to match component format
          const transformedListing = {
            id: apiListing.id,
            device: `${apiListing.devices?.[0]?.brand || 'Unknown'} ${apiListing.devices?.[0]?.model || 'Device'}`,
            model: `${apiListing.devices?.[0]?.storage || ''} ${apiListing.devices?.[0]?.color || ''}`.trim(),
            condition: apiListing.devices?.[0]?.condition || 'Unknown',
            askingPrice: apiListing.asking_price || apiListing.expected_price || 0,
            description: apiListing.devices?.[0]?.description || 'No description available',
            images: getListingImages(apiListing),
            status: transformStatus(apiListing.status),
            timeLeft: calculateTimeRemaining(apiListing.time_approved),
            totalBids: Array.isArray(apiListing.bids) ? apiListing.bids.length : 0,
            bids: transformBids(apiListing.bids || []),
            highestBid: highestBid,
            instantWin: apiListing.instant_win || false,
            // Additional data from API
            brand: apiListing.devices?.[0]?.brand,
            storage: apiListing.devices?.[0]?.storage,
            color: apiListing.devices?.[0]?.color,
            created_at: apiListing.created_at,
            updated_at: apiListing.updated_at,
            // Time approved
            time_approved: apiListing.time_approved,
            // Device specific details
            deviceDetails: {
              imei1: apiListing.devices?.[0]?.imei1,
              imei2: apiListing.devices?.[0]?.imei2,
              has_bill: apiListing.devices?.[0]?.has_bill,
              purchase_date: apiListing.devices?.[0]?.purchase_date,
              purchase_price: apiListing.devices?.[0]?.purchase_price,
              battery_health: apiListing.devices?.[0]?.battery_health,
              warranty_type: apiListing.devices?.[0]?.warranty_type,
              warranty_status: apiListing.devices?.[0]?.warranty_status,
              warranty_expiry: apiListing.devices?.[0]?.warranty_expiry
            },
            // Address information (limited for vendors)
            location: apiListing.addresses?.find((addr: any) => addr.type === 'pickup')?.city || 
                     apiListing.addresses?.find((addr: any) => addr.type === 'client')?.city || 
                     'Location not specified',
            // Agreement information
            agreements: apiListing.agreements?.[0] || {}
          }

          console.log('🔄 [VENDOR-LISTING-DETAIL] Transformed listing data:', transformedListing)
          console.log('📊 [VENDOR-LISTING-DETAIL] Status transformation:', {
            originalStatus: apiListing.status,
            transformedStatus: transformedListing.status,
            timeApproved: apiListing.time_approved,
            timeLeft: transformedListing.timeLeft
          })
          setListing(transformedListing)
          
          // Create marketplace listing object for BidModal
          const marketplaceListingForModal = {
            id: transformedListing.id,
            device: transformedListing.device,
            brand: transformedListing.brand,
            model: transformedListing.model,
            storage: transformedListing.storage,
            color: transformedListing.color,
            condition: transformedListing.condition,
            askingPrice: transformedListing.askingPrice,
            currentBid: transformedListing.highestBid > 0 ? transformedListing.highestBid : undefined,
            totalBids: transformedListing.totalBids,
            timeLeft: transformedListing.timeLeft,
            timeLeftMinutes: calculateTimeLeftMinutes(transformedListing.timeLeft),
            location: transformedListing.location,
            seller: {
              name: 'Device Owner',
              rating: 5,
              isVerified: true
            },
            images: [
              transformedListing.images.front,
              transformedListing.images.back,
              transformedListing.images.top,
              transformedListing.images.bottom
            ].filter(Boolean),
            description: transformedListing.description,
            listingDate: new Date(transformedListing.created_at).toISOString().split('T')[0],
            features: [
              transformedListing.storage,
              transformedListing.color,
              transformedListing.condition,
              transformedListing.deviceDetails?.warranty_status === 'active' ? 'Under Warranty' : null,
              transformedListing.deviceDetails?.has_bill === true ? 'With Bill' : null
            ].filter(Boolean),
            warranty: transformedListing.deviceDetails?.warranty_status === 'active' ? 
              `Active${transformedListing.deviceDetails?.warranty_expiry ? ` until ${transformedListing.deviceDetails?.warranty_expiry}` : ''}` : 
              transformedListing.deviceDetails?.warranty_status || 'N/A',
            isHot: transformedListing.totalBids > 5,
            isInstantWin: transformedListing.askingPrice > 0
          }
          
          setMarketplaceListing(marketplaceListingForModal)
          toast.success('Listing details loaded successfully')
        } else {
          const errorMsg = (result as any).error || 'Failed to load listing data'
          setError(errorMsg)
          toast.error(errorMsg)
          console.error('❌ [VENDOR-LISTING-DETAIL] Failed to load listing:', errorMsg)
        }
      } catch (error) {
        console.error('💥 [VENDOR-LISTING-DETAIL] Error loading listing:', error)
        const errorMsg = 'Network error while loading listing'
        setError(errorMsg)
        toast.error(errorMsg)
      } finally {
        setIsLoading(false)
      }
    }

    loadListingData()
  }, [listingId])

  // Update time remaining every minute for active auctions
  useEffect(() => {
    if (!listing || !listing.time_approved) return

    const updateTimeRemaining = () => {
      const newTimeRemaining = calculateTimeRemaining(listing.time_approved)
      setTimeRemaining(newTimeRemaining)
    }

    // Update immediately
    updateTimeRemaining()

    // Set up interval to update every minute
    const interval = setInterval(updateTimeRemaining, 60000)

    return () => clearInterval(interval)
  }, [listing?.time_approved])

  // Helper function to calculate time left in minutes
  const calculateTimeLeftMinutes = (timeLeft: string): number => {
    if (!timeLeft || timeLeft.includes('ended') || timeLeft.includes('unavailable')) {
      return 0
    }
    
    const hoursMatch = timeLeft.match(/(\d+)h/)
    const minutesMatch = timeLeft.match(/(\d+)m/)
    
    const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0
    const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0
    
    return (hours * 60) + minutes
  }

  // Helper function to get listing images
  const getListingImages = (apiListing: any) => {
    // Get the first device from the devices array
    const device = apiListing.devices?.[0] || {}
    
    // Return the 4 main device images from the device object
    return {
      front: device.front_image_url || '/api/placeholder/400/400',
      back: device.back_image_url || '/api/placeholder/400/400',
      top: device.top_image_url || '/api/placeholder/400/400',
      bottom: device.bottom_image_url || '/api/placeholder/400/400',
      // Additional images for potential use
      bill: device.bill_image_url,
      warranty: device.warranty_image_url
    }
  }

  // Helper function to transform API status to component status
  const transformStatus = (apiStatus: string) => {
    console.log('🔄 [VENDOR-LISTING-DETAIL] Transforming status:', apiStatus)
    
    if (!apiStatus) {
      console.warn('⚠️ [VENDOR-LISTING-DETAIL] No status provided, defaulting to unknown')
      return 'unknown'
    }
    
    const normalizedStatus = apiStatus.toLowerCase().trim()
    
    switch (normalizedStatus) {
      case 'pending':
      case 'pending_approval':
      case 'draft':
        return 'pending_approval'
      case 'approved':
      case 'receiving_bids':
      case 'accepting_bids':
      case 'active':
        return 'receiving_bids'
      case 'bid_accepted':
      case 'won':
      case 'accepted':
        return 'bid_accepted'
      case 'completed':
      case 'sold':
      case 'delivered':
        return 'sold'
      case 'rejected':
      case 'cancelled':
      case 'declined':
        return 'rejected'
      case 'bidding_ended':
      case 'expired':
      case 'ended':
        return 'bidding_ended'
      default:
        console.warn('⚠️ [VENDOR-LISTING-DETAIL] Unknown status:', apiStatus)
        return normalizedStatus || 'unknown'
    }
  }

  // Helper function to transform API bids to component format
  const transformBids = (apiBids: any[]) => {
    if (!Array.isArray(apiBids)) return []
    
    return apiBids
      .filter((bid: any) => bid && typeof bid === 'object') // Filter out invalid bids
      .sort((a, b) => b.bid_amount - a.bid_amount) // Sort by bid amount in descending order
      .map((bid: any, index: number) => {
        // Handle vendor identification
        let vendorName = 'Anonymous Vendor'
        let vendorId = bid.vendor_id || `vendor-${index}`
        
        if (bid.vendor && bid.vendor.name) {
          vendorName = bid.vendor.name
        } else if (bid.vendor_id) {
          // Create vendor name from vendor_id
          vendorName = `Vendor ${bid.vendor_id.substring(0, 8)}...`
        } else {
          // Use index-based naming for null vendor_id
          vendorName = `Vendor ${index + 1}`
        }

        return {
          id: bid.id || `bid-${index}`,
          vendorId: vendorId,
          vendorName: vendorName,
          vendorCode: bid.vendor_code || generateVendorCode(vendorId), // Use API vendor_code or generate one
          vendorRating: bid.vendor?.rating || 4.5,
          amount: bid.bid_amount || 0,
          timestamp: bid.created_at || new Date().toISOString(),
          message: bid.message || 'Interested in this device.',
          isHighest: index === 0, // First bid after sorting is highest
          isNew: false, // Could be calculated based on timestamp
          status: bid.status || 'active',
          instantWin: bid.instant_win || false
        }
      })
      .filter((bid: any) => bid.amount > 0) // Only include bids with valid amounts
  }

  // Helper function to format price in Indian format
  const formatPrice = (price: number) => {
    if (price >= 10000000) { // 1 crore or more
      return `₹${(price / 10000000).toFixed(1)} Cr`
    } else if (price >= 100000) { // 1 lakh or more
      return `₹${(price / 100000).toFixed(1)} L`
    } else if (price >= 1000) { // 1 thousand or more
      return `₹${(price / 1000).toFixed(1)} K`
    } else {
      return `₹${price}`
    }
  }

  // Helper function to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  // Generate masked vendor ID (5-digit alphanumeric)
  const generateVendorCode = (vendorId: string) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 5; i++) {
      result += chars.charAt((vendorId.charCodeAt(i % vendorId.length) + i) % chars.length)
    }
    return result
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-2xl mb-4">
            <Icons.spinner className="w-8 h-8 text-white animate-spin" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Listing Details</h2>
          <p className="text-gray-600">Getting device information...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error || !listing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-2xl mb-4">
            <Icons.x className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Listing</h2>
          <p className="text-gray-600 mb-4">{error || 'Listing not found'}</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => router.back()} variant="outline">
              <Icons.arrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
            <Button onClick={() => window.location.reload()}>
              <Icons.refresh className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const highestBid = listing.bids.find((bid: any) => bid.isHighest) || 
                    (listing.bids.length > 0 ? listing.bids[0] : null)
  const highestBidAmount = listing.highestBid || highestBid?.amount || 0
  
  // Check if current vendor has the highest bid
  const currentVendorHasHighestBid = user && highestBid && highestBid.vendorId === user.id
  
  console.log('🏆 [VENDOR-LISTING-DETAIL] Highest bid check:', {
    currentUserId: user?.id,
    highestBidVendorId: highestBid?.vendorId,
    hasHighestBid: currentVendorHasHighestBid,
    highestBidAmount: highestBidAmount
  })

  const getStatusInfo = (status: string) => {
    console.log('🎯 [VENDOR-LISTING-DETAIL] Getting status info for:', status)
    
    // If current vendor has highest bid, show special status
    if (currentVendorHasHighestBid && status === 'receiving_bids') {
      return {
        label: 'You Won This Bid',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: Icons.star,
        description: 'Congratulations! You have the highest bid!'
      }
    }
    
    switch (status) {
      case 'receiving_bids':
        return {
          label: 'Accepting Bids',
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: Icons.clock,
          description: 'This listing is accepting bids!'
        }
      case 'pending_approval':
        return {
          label: 'Under Review',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: Icons.clock,
          description: 'Listing is under review'
        }
      case 'bid_accepted':
        return {
          label: 'Bid Accepted',
          color: 'bg-purple-100 text-purple-800 border-purple-200',
          icon: Icons.check,
          description: 'A bid has been accepted'
        }
      case 'bidding_ended':
        return {
          label: 'Bidding Ended',
          color: 'bg-orange-100 text-orange-800 border-orange-200',
          icon: Icons.clock,
          description: 'Bidding period has ended'
        }
      case 'sold':
        return {
          label: 'Sold',
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: Icons.check,
          description: 'This device has been sold'
        }
      case 'rejected':
        return {
          label: 'Rejected',
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: Icons.x,
          description: 'Listing was rejected during review'
        }
      case 'unknown':
        return {
          label: 'Status Unknown',
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: Icons.alertCircle,
          description: 'Listing status is not available'
        }
      default:
        console.warn('⚠️ [VENDOR-LISTING-DETAIL] Unhandled status in getStatusInfo:', status)
        return {
          label: status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown',
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: Icons.smartphone,
          description: `Status: ${status || 'Unknown'}`
        }
    }
  }

  const statusInfo = getStatusInfo(listing.status)
  const StatusIcon = statusInfo.icon

  const handlePlaceBid = () => {
    if (!marketplaceListing) {
      toast.error('Listing data not available for bidding')
      return
    }
    setBidModalOpen(true)
  }

  const handleTrackOrder = async () => {
    setTrackingModalOpen(true)
    setTrackingLoading(true)
    setTrackingData(null)
    
    try {
      console.log('🔍 [VENDOR-LISTING-DETAIL] Fetching tracking data for listing:', listingId)
      
      const response = await sellikoClient.trackOrder(listingId)
      
      console.log('📥 [VENDOR-LISTING-DETAIL] Tracking API response:', response)
      
      if (response && response.listing_id) {
        setTrackingData(response)
        console.log('✅ [VENDOR-LISTING-DETAIL] Tracking data loaded successfully:', response.status)
      } else {
        console.error('❌ [VENDOR-LISTING-DETAIL] Invalid tracking response:', response)
        toast.error('Failed to load tracking information')
      }
    } catch (error) {
      console.error('💥 [VENDOR-LISTING-DETAIL] Tracking API error:', error)
      toast.error('Network error occurred while loading tracking data')
    } finally {
      setTrackingLoading(false)
    }
  }

  // Check if bidding is available
  const isBiddingAvailable = () => {
    console.log('🔍 [VENDOR-LISTING-DETAIL] Checking bidding availability:', {
      status: listing.status,
      timeRemaining: timeRemaining,
      timeLeft: listing.timeLeft,
      timeLeftMinutes: calculateTimeLeftMinutes(timeRemaining || listing.timeLeft),
      currentVendorHasHighestBid: currentVendorHasHighestBid
    })
    
    // Must be in receiving_bids status
    if (listing.status !== 'receiving_bids') {
      console.log('❌ [VENDOR-LISTING-DETAIL] Bidding not available - wrong status:', listing.status)
      return false
    }
    
    // Must have time remaining
    const timeLeftMinutes = calculateTimeLeftMinutes(timeRemaining || listing.timeLeft)
    if (timeLeftMinutes <= 0) {
      console.log('❌ [VENDOR-LISTING-DETAIL] Bidding not available - no time left:', timeLeftMinutes)
      return false
    }
    
    // Don't allow bidding if vendor already has highest bid
    if (currentVendorHasHighestBid) {
      console.log('❌ [VENDOR-LISTING-DETAIL] Bidding not available - vendor already has highest bid')
      return false
    }
    
    console.log('✅ [VENDOR-LISTING-DETAIL] Bidding is available')
    return true
  }
  
  const biddingAvailable = isBiddingAvailable()
  
  // Check if tracking is available (vendor has won and order is in progress)
  const isTrackingAvailable = currentVendorHasHighestBid && 
    ['bid_accepted', 'agent_assigned', 'verification', 'ready_for_pickup', 'pickedup'].includes(listing.status)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/60 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="hover:bg-gray-100"
              >
                <Icons.arrowLeft className="w-4 h-4 mr-2" />
                Back to Marketplace
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{listing.device}</h1>
                <p className="text-sm text-gray-600">{listing.model}</p>
              </div>
            </div>
            
            <Badge className={`${statusInfo.color} border font-medium`}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {statusInfo.label}
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-square bg-gray-100">
                  {/* 2x2 Grid for Device Images */}
                  <div className="grid grid-cols-2 gap-1 h-full">
                    {/* Front Image - Top Left */}
                    <div className="relative bg-gray-200 group cursor-pointer hover:opacity-90 transition-opacity">
                      <img 
                        src={listing.images.front}
                        alt={`${listing.device} - Front View`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/api/placeholder/400/400'
                        }}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                        <span className="text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
                          Front View
                        </span>
                      </div>
                    </div>

                    {/* Back Image - Top Right */}
                    <div className="relative bg-gray-200 group cursor-pointer hover:opacity-90 transition-opacity">
                      <img 
                        src={listing.images.back}
                        alt={`${listing.device} - Back View`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/api/placeholder/400/400'
                        }}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                        <span className="text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
                          Back View
                        </span>
                      </div>
                    </div>

                    {/* Top Image - Bottom Left */}
                    <div className="relative bg-gray-200 group cursor-pointer hover:opacity-90 transition-opacity">
                      <img 
                        src={listing.images.top}
                        alt={`${listing.device} - Top View`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/api/placeholder/400/400'
                        }}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                        <span className="text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
                          Top View
                        </span>
                      </div>
                    </div>

                    {/* Bottom Image - Bottom Right */}
                    <div className="relative bg-gray-200 group cursor-pointer hover:opacity-90 transition-opacity">
                      <img 
                        src={listing.images.bottom}
                        alt={`${listing.device} - Bottom View`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/api/placeholder/400/400'
                        }}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                        <span className="text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
                          Bottom View
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Image Info Overlay */}
                  <div className="absolute top-3 left-3 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                    Device Images (4 views)
                  </div>
                  
                  {/* Additional Images Indicator */}
                  {(listing.images.bill || listing.images.warranty) && (
                    <div className="absolute top-3 right-3 bg-blue-600 text-white px-2 py-1 rounded text-xs">
                      + Documents Available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Bidding Summary */}
            <Card className="border-blue-200 bg-blue-50/50">
              <CardContent className="p-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{listing.totalBids}</p>
                    <p className="text-sm text-gray-600">Total Bids</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      {highestBidAmount > 0 ? `₹${highestBidAmount.toLocaleString()}` : 'No bids yet'}
                    </p>
                    <p className="text-sm text-gray-600">Highest Bid</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-orange-600">
                      {highestBidAmount > 0 ? Math.round(((highestBidAmount - listing.askingPrice) / listing.askingPrice) * 100) : 0}%
                    </p>
                    <p className="text-sm text-gray-600">vs Asking Price</p>
                  </div>
                </div>
                {listing.instantWin && (
                  <div className="mt-4 bg-orange-100 border border-orange-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <Icons.star className="w-4 h-4 text-orange-600" />
                      <p className="text-sm font-medium text-orange-800">Instant Win Available</p>
                    </div>
                    <p className="text-xs text-orange-700 mt-1">
                      Bids at asking price will immediately close the auction
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Device Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Icons.smartphone className="w-5 h-5" />
                  <span>Device Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Info Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Brand & Model</p>
                    <p className="text-lg font-semibold text-gray-900">{listing.device}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Storage & Color</p>
                    <p className="text-lg font-semibold text-gray-900">{listing.model}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Condition</p>
                    <p className="text-lg font-semibold text-gray-900">{listing.condition}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Asking Price</p>
                    <p className="text-lg font-semibold text-gray-900">{formatPrice(listing.askingPrice)}</p>
                  </div>
                </div>

                {/* Technical Details */}
                {listing.deviceDetails && (
                  <>
                    <div className="border-t pt-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Technical Information</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {listing.deviceDetails.battery_health && (
                          <div>
                            <p className="text-sm font-medium text-gray-500">Battery Health</p>
                            <p className="text-sm text-gray-900">{listing.deviceDetails.battery_health}%</p>
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-500">Has Original Bill</p>
                          <p className="text-sm text-gray-900">
                            {listing.deviceDetails.has_bill ? '✅ Yes' : '❌ No'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Purchase & Warranty Info */}
                    <div className="border-t pt-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Purchase & Warranty</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {listing.deviceDetails.purchase_date && (
                          <div>
                            <p className="text-sm font-medium text-gray-500">Purchase Date</p>
                            <p className="text-sm text-gray-900">{formatDate(listing.deviceDetails.purchase_date)}</p>
                          </div>
                        )}
                        {listing.deviceDetails.warranty_status && (
                          <div>
                            <p className="text-sm font-medium text-gray-500">Warranty Status</p>
                            <p className="text-sm text-gray-900 capitalize">{listing.deviceDetails.warranty_status}</p>
                          </div>
                        )}
                        {listing.deviceDetails.warranty_expiry && (
                          <div>
                            <p className="text-sm font-medium text-gray-500">Warranty Expiry</p>
                            <p className="text-sm text-gray-900">{formatDate(listing.deviceDetails.warranty_expiry)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* Description */}
                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-gray-500 mb-2">Description</p>
                  <p className="text-gray-700 leading-relaxed">{listing.description}</p>
                </div>

                {/* Listing Info */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>Listed on: {formatDate(listing.created_at)}</span>
                    <span>Location: {listing.location}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Bidding & Actions */}
          <div className="space-y-6">
            {/* Current Status */}
            <Card>
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-600 to-green-700 rounded-2xl">
                    <StatusIcon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{statusInfo.description}</h3>
                    {/* Hide time left if vendor has highest bid */}
                    {!currentVendorHasHighestBid && (
                      <p className={`text-lg font-semibold ${getTimeRemainingColor(timeRemaining || listing.timeLeft)}`}>
                        {timeRemaining || listing.timeLeft}
                      </p>
                    )}
                  </div>
                  {highestBid && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-sm font-medium text-green-800">
                        {currentVendorHasHighestBid ? 'Your Highest Bid' : 'Highest Bid'}
                      </p>
                      <p className="text-2xl font-bold text-green-900">₹{highestBidAmount.toLocaleString()}</p>
                      <p className="text-sm text-green-700">
                        {currentVendorHasHighestBid ? 'Your Bid' : `Vendor ${highestBid.vendorCode}`}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Vendor Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Place Bid Button - Main action for vendors */}
                {biddingAvailable ? (
                  <Button 
                    onClick={handlePlaceBid}
                    className="w-full bg-green-600 hover:bg-green-700"
                    size="lg"
                  >
                    <Icons.trendingUp className="w-4 h-4 mr-2" />
                    Place Bid
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    disabled
                    className="w-full"
                    size="lg"
                  >
                    <Icons.clock className="w-4 h-4 mr-2" />
                    {currentVendorHasHighestBid ? 'You Have the Highest Bid' : 
                     listing.status === 'bid_accepted' ? 'Bidding Closed' : 
                     'Bidding Not Available'}
                  </Button>
                )}
                
                {/* Instant Win Button */}
                {biddingAvailable && listing.askingPrice > 0 && (
                  <Button 
                    onClick={handlePlaceBid}
                    variant="outline"
                    className="w-full border-orange-500 text-orange-600 hover:bg-orange-50"
                    size="lg"
                  >
                    <Icons.star className="w-4 h-4 mr-2" />
                    🎯 Buy at Asking Price
                  </Button>
                )}
                
                {/* Track Order Button */}
                {isTrackingAvailable && (
                  <Button 
                    onClick={handleTrackOrder}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    size="lg"
                  >
                    <Icons.package className="w-4 h-4 mr-2" />
                    🚚 Track Order
                  </Button>
                )}
                
                {/* Completed Status Display */}
                {currentVendorHasHighestBid && listing.status === 'completed' && (
                  <div className="w-full text-center py-4">
                    <div className="text-2xl font-bold text-green-600">
                      🎉 DELIVERED
                    </div>
                    <p className="text-sm text-green-700 mt-1">Your order has been completed!</p>
                  </div>
                )}
                
                {/* Back to Marketplace */}
                <Button 
                  onClick={() => router.push('/vendor/marketplace')}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  <Icons.arrowLeft className="w-4 h-4 mr-2" />
                  Back to Marketplace
                </Button>
              </CardContent>
            </Card>

            {/* Bid History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Bid History ({listing.totalBids} total)</span>
                  {listing.totalBids > 0 && <Icons.trendingUp className="w-5 h-5 text-green-600" />}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {listing.bids && listing.bids.length > 0 ? (
                  <>
                    {listing.bids.map((bid: any, index: number) => (
                      <div 
                        key={bid.id} 
                        className={`relative border rounded-lg p-4 transition-all ${
                          bid.isHighest 
                            ? 'bg-green-50 border-green-200 shadow-sm' 
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                              bid.isHighest ? 'bg-green-600 text-white' : 'bg-gray-400 text-white'
                            }`}>
                              #{index + 1}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {bid.vendorId === user?.id ? 'You' : `Vendor ${bid.vendorCode}`}
                              </p>
                              <div className="flex items-center space-x-1">
                                <Icons.star className="w-3 h-3 text-yellow-400 fill-current" />
                                <span className="text-xs text-gray-600">{bid.vendorRating} rating</span>
                                {bid.vendorId === user?.id && (
                                  <Badge className="bg-blue-100 text-blue-800 text-xs ml-1">Your Bid</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-lg font-bold ${bid.isHighest ? 'text-green-700' : 'text-gray-700'}`}>
                              ₹{bid.amount.toLocaleString()}
                            </p>
                            <div className="flex items-center space-x-1 mt-1">
                              {bid.isHighest && (
                                <Badge className="bg-green-100 text-green-800 text-xs">Highest</Badge>
                              )}
                              {bid.instantWin && (
                                <Badge className="bg-orange-100 text-orange-800 text-xs">Instant Win</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {bid.message && (
                          <div className="bg-white/70 border border-gray-200 rounded p-3 mb-3">
                            <p className="text-sm text-gray-700 italic">"{bid.message}"</p>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{new Date(bid.timestamp).toLocaleString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}</span>
                          <span className="flex items-center">
                            <Icons.clock className="w-3 h-3 mr-1" />
                            {Math.round((Date.now() - new Date(bid.timestamp).getTime()) / (1000 * 60))}m ago
                          </span>
                        </div>
                        
                        {/* Timeline connector */}
                        {index < listing.bids.length - 1 && (
                          <div className="absolute left-6 top-16 w-px h-4 bg-gray-300"></div>
                        )}
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icons.clock className="w-8 h-8 text-gray-400" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">No Bids Yet</h4>
                    <p className="text-gray-600 mb-4">
                      This listing is waiting for vendors to place bids.
                    </p>
                    <p className="text-sm text-gray-500">
                      Be the first to bid and secure this device!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Bid Modal */}
      {marketplaceListing && (
        <BidModal
          listing={marketplaceListing}
          open={bidModalOpen}
          onOpenChange={setBidModalOpen}
          currentUserId={user?.id}
        />
      )}

      {/* Order Tracking Modal */}
      <Dialog open={trackingModalOpen} onOpenChange={setTrackingModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icons.package className="w-5 h-5" />
              Order Tracking - {listing.device}
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
                      <span>{listing.location}</span>
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
                <Button onClick={handleTrackOrder} variant="outline">
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
    </div>
  )
}