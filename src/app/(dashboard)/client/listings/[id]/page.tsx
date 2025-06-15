'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Icons } from '@/components/ui/icons'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import sellikoClient from '@/selliko-client'
import { toast } from 'react-hot-toast'

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

export default function ListingDetailPage() {
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
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [isAcceptingBid, setIsAcceptingBid] = useState(false)
  const [acceptedBidDetails, setAcceptedBidDetails] = useState<any>(null)

  // Load listing data when page loads
  useEffect(() => {
    const loadListingData = async () => {
      if (!listingId) {
        setError('No listing ID provided')
        setIsLoading(false)
        return
      }

      console.log('🔍 [LISTING-DETAIL] Loading listing data for ID:', listingId)
      setIsLoading(true)
      setError(null)

      try {
        // Call getListingById function from selliko-client
        const result = await sellikoClient.getListingById(listingId, {
          include_images: true,
          include_bids: true,
          include_user_details: true
        })

        console.log('📊 [LISTING-DETAIL] Received listing data:', result)

        if ((result as any).success && (result as any).listing) {
          const apiListing = (result as any).listing
          
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
            highestBid: apiListing.highest_bid || 0,
            instantWin: apiListing.instant_win || false,
            // Additional data from API
            brand: apiListing.devices?.[0]?.brand,
            storage: apiListing.devices?.[0]?.storage,
            color: apiListing.devices?.[0]?.color,
            created_at: apiListing.created_at,
            updated_at: apiListing.updated_at,
            // Rejection information
            rejection_reason: apiListing.rejection_note || apiListing.rejection_reason || apiListing.reason_note,
            rejected_at: apiListing.rejected_at || apiListing.updated_at,
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
            // Address information
            clientAddress: getClientAddress(apiListing),
            pickupAddress: getPickupAddress(apiListing),
            // Agreement information
            agreements: apiListing.agreements?.[0] || {}
          }

          console.log('🔄 [LISTING-DETAIL] Transformed listing data:', transformedListing)
          setListing(transformedListing)
          toast.success('Listing details loaded successfully')
        } else {
          const errorMsg = (result as any).error || 'Failed to load listing data'
          setError(errorMsg)
          toast.error(errorMsg)
          console.error('❌ [LISTING-DETAIL] Failed to load listing:', errorMsg)
        }
      } catch (error) {
        console.error('💥 [LISTING-DETAIL] Error loading listing:', error)
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

  // Helper function to get client address information
  const getClientAddress = (apiListing: any) => {
    const clientAddress = apiListing.addresses?.find((addr: any) => addr.type === 'client')
    return clientAddress || {}
  }

  // Helper function to get pickup address information
  const getPickupAddress = (apiListing: any) => {
    const pickupAddress = apiListing.addresses?.find((addr: any) => addr.type === 'pickup')
    return pickupAddress || {}
  }

  // Helper function to transform API status to component status
  const transformStatus = (apiStatus: string) => {
    switch (apiStatus) {
      case 'pending':
      case 'pending_approval':
        return 'pending_approval'
      case 'approved':
      case 'receiving_bids':
        return 'receiving_bids'
      case 'bid_accepted':
        return 'bid_accepted'
      case 'completed':
      case 'sold':
        return 'sold'
      case 'rejected':
        return 'rejected'
      default:
        return apiStatus || 'unknown'
    }
  }

  // Helper function to transform API bids to component format
  const transformBids = (apiBids: any[]) => {
    if (!Array.isArray(apiBids)) return []
    
    return apiBids
      .filter((bid: any) => bid && typeof bid === 'object') // Filter out invalid bids
      .map((bid: any, index: number) => {
        // Handle vendor identification
        let vendorName = 'Anonymous Vendor'
        let vendorId = bid.vendor_id || `vendor-${index}`
        
        if (bid.vendor_profile && bid.vendor_profile.name) {
          vendorName = bid.vendor_profile.name
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
          vendorRating: bid.vendor_profile?.rating || 4.5,
          amount: bid.bid_amount || 0,
          timestamp: bid.created_at || new Date().toISOString(),
          message: bid.message || 'Interested in this device.',
          isHighest: index === 0, // Assume first bid is highest (API should sort)
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <Icons.spinner className="w-8 h-8 text-white animate-spin" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Listing Details</h2>
          <p className="text-gray-600">Getting your device information...</p>
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

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'receiving_bids':
        return {
          label: 'Receiving Bids',
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: Icons.clock,
          description: 'Your device is live and getting bids!'
        }
      case 'pending_approval':
        return {
          label: 'Under Review',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: Icons.clock,
          description: 'Our team is reviewing your listing'
        }
      case 'bid_accepted':
        return {
          label: 'Bid Accepted',
          color: 'bg-purple-100 text-purple-800 border-purple-200',
          icon: Icons.check,
          description: 'Agent will contact you for pickup'
        }
      case 'bidding_ended':
        return {
          label: 'Bidding Ended',
          color: 'bg-orange-100 text-orange-800 border-orange-200',
          icon: Icons.clock,
          description: 'Bidding period has ended'
        }
      case 'rejected':
        return {
          label: 'Rejected',
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: Icons.x,
          description: 'Listing was rejected during review'
        }
      default:
        return {
          label: status,
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: Icons.smartphone,
          description: ''
        }
    }
  }

  const statusInfo = getStatusInfo(listing.status)
  const StatusIcon = statusInfo.icon

  const handleAcceptBid = (bidId: string) => {
    // Show confirmation modal
    setShowConfirmModal(true)
  }

  const handleConfirmAcceptBid = async () => {
    setShowConfirmModal(false)
    setIsAcceptingBid(true)

    try {
      console.log('🎯 [LISTING-DETAIL] Accepting highest bid for listing:', listingId)
      
      // Call the acceptBid API
      const result = await sellikoClient.acceptBid(listingId)
      
      console.log('📊 [LISTING-DETAIL] Accept bid result:', result)

      if ((result as any).success) {
        // Store the accepted bid details for success modal
        const winningBid = (result as any).listing?.bids?.find((bid: any) => bid.status === 'won')
        setAcceptedBidDetails({
          bidAmount: (result as any).listing?.highest_bid || 0,
          vendorName: winningBid?.vendor_profile?.name || 'Vendor',
          vendorLocation: winningBid?.vendor_profile ? 
            `${winningBid.vendor_profile.city}, ${winningBid.vendor_profile.state}` : 
            'Location not available',
          listingStatus: (result as any).listing?.status || 'bid_accepted'
        })
        
        // Show success modal
        setShowSuccessModal(true)
        toast.success('Bid accepted successfully!')
      } else {
        const errorMsg = (result as any).error || 'Failed to accept bid'
        toast.error(errorMsg)
        console.error('❌ [LISTING-DETAIL] Failed to accept bid:', errorMsg)
      }
    } catch (error) {
      console.error('💥 [LISTING-DETAIL] Error accepting bid:', error)
      toast.error('Network error while accepting bid')
    } finally {
      setIsAcceptingBid(false)
    }
  }

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false)
    setAcceptedBidDetails(null)
    // Refresh the page to show updated listing data
    window.location.reload()
  }

  const handleEditListing = () => {
    router.push(`/client/listings/${listingId}/edit`)
  }

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
                Back
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
        {/* Rejection Notice - Show at top when listing is rejected */}
        {listing.status === 'rejected' && (
          <div className="mb-6">
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <Icons.x className="w-5 h-5 text-red-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-red-900 mb-2">
                      Listing Rejected
                    </h3>
                    <p className="text-red-700 mb-3">
                      Your listing was rejected during the review process. You can make the necessary changes and resubmit for approval.
                    </p>
                    {listing.rejection_reason && (
                      <div className="bg-red-100 border border-red-200 rounded-lg p-3 mb-4">
                        <p className="text-sm font-medium text-red-800 mb-1">Rejection Reason:</p>
                        <p className="text-sm text-red-700">{listing.rejection_reason}</p>
                      </div>
                    )}
                    {listing.rejected_at && (
                      <p className="text-xs text-red-600 mb-4">
                        Rejected on {formatDate(listing.rejected_at)}
                      </p>
                    )}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        onClick={handleEditListing}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        <Icons.edit className="w-4 h-4 mr-2" />
                        Edit & Resubmit Listing
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => router.push('/client/listings')}
                        className="border-red-300 text-red-700 hover:bg-red-50"
                      >
                        <Icons.list className="w-4 h-4 mr-2" />
                        View All Listings
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

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
                    <p className="text-sm font-medium text-gray-500">Your Asking Price</p>
                    <p className="text-lg font-semibold text-gray-900">{formatPrice(listing.askingPrice)}</p>
                  </div>
                </div>

                {/* Technical Details */}
                {listing.deviceDetails && (
                  <>
                    <div className="border-t pt-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Technical Information</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {listing.deviceDetails.imei1 && (
                          <div>
                            <p className="text-sm font-medium text-gray-500">IMEI 1</p>
                            <p className="text-sm font-mono text-gray-900">{listing.deviceDetails.imei1}</p>
                          </div>
                        )}
                        {listing.deviceDetails.imei2 && (
                          <div>
                            <p className="text-sm font-medium text-gray-500">IMEI 2</p>
                            <p className="text-sm font-mono text-gray-900">{listing.deviceDetails.imei2}</p>
                          </div>
                        )}
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
                        {listing.deviceDetails.purchase_price && (
                          <div>
                            <p className="text-sm font-medium text-gray-500">Original Price</p>
                            <p className="text-sm text-gray-900">{formatPrice(listing.deviceDetails.purchase_price)}</p>
                          </div>
                        )}
                        {listing.deviceDetails.warranty_status && (
                          <div>
                            <p className="text-sm font-medium text-gray-500">Warranty Status</p>
                            <p className={`text-sm font-medium ${
                              listing.deviceDetails.warranty_status === 'active' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {listing.deviceDetails.warranty_status === 'active' ? '✅ Active' : '❌ Expired'}
                            </p>
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

                {/* Contact & Pickup Information */}
                {(listing.clientAddress || listing.pickupAddress) && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Contact & Pickup Details</h4>
                    <div className="space-y-4">
                      {/* Client Address */}
                      {listing.clientAddress && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h5 className="font-medium text-blue-900 mb-2">Client Contact Information</h5>
                          {listing.clientAddress.contact_name && (
                            <div className="mb-2">
                              <p className="text-sm font-medium text-gray-700">Contact Person</p>
                              <p className="text-sm text-gray-900">{listing.clientAddress.contact_name}</p>
                            </div>
                          )}
                          {listing.clientAddress.mobile_number && (
                            <div className="mb-2">
                              <p className="text-sm font-medium text-gray-700">Mobile Number</p>
                              <p className="text-sm text-gray-900">{listing.clientAddress.mobile_number}</p>
                            </div>
                          )}
                          {listing.clientAddress.email && (
                            <div className="mb-2">
                              <p className="text-sm font-medium text-gray-700">Email</p>
                              <p className="text-sm text-gray-900">{listing.clientAddress.email}</p>
                            </div>
                          )}
                          {listing.clientAddress.address && (
                            <div className="mb-2">
                              <p className="text-sm font-medium text-gray-700">Full Address</p>
                              <p className="text-sm text-gray-900">{listing.clientAddress.address}</p>
                              {listing.clientAddress.landmark && (
                                <p className="text-xs text-gray-600">Landmark: {listing.clientAddress.landmark}</p>
                              )}
                              <p className="text-sm text-gray-900">
                                {listing.clientAddress.city}, {listing.clientAddress.state} - {listing.clientAddress.pincode}
                              </p>
                            </div>
                          )}
                          {/* Bank Details */}
                          {(listing.clientAddress.bank_name || listing.clientAddress.account_number) && (
                            <div className="border-t border-blue-300 pt-2 mt-3">
                              <p className="text-sm font-medium text-gray-700 mb-1">Bank Details</p>
                              {listing.clientAddress.account_holder_name && (
                                <p className="text-xs text-gray-600">Account Holder: {listing.clientAddress.account_holder_name}</p>
                              )}
                              {listing.clientAddress.bank_name && (
                                <p className="text-xs text-gray-600">Bank: {listing.clientAddress.bank_name}</p>
                              )}
                              {listing.clientAddress.account_number && (
                                <p className="text-xs text-gray-600 font-mono">Account: ****{listing.clientAddress.account_number.slice(-4)}</p>
                              )}
                              {listing.clientAddress.ifsc_code && (
                                <p className="text-xs text-gray-600">IFSC: {listing.clientAddress.ifsc_code}</p>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Pickup Address */}
                      {listing.pickupAddress && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <h5 className="font-medium text-green-900 mb-2">Pickup Address</h5>
                          {listing.pickupAddress.address && (
                            <div className="mb-2">
                              <p className="text-sm font-medium text-gray-700">Full Address</p>
                              <p className="text-sm text-gray-900">{listing.pickupAddress.address}</p>
                              {listing.pickupAddress.landmark && (
                                <p className="text-xs text-gray-600">Landmark: {listing.pickupAddress.landmark}</p>
                              )}
                              <p className="text-sm text-gray-900">
                                {listing.pickupAddress.city}, {listing.pickupAddress.state} - {listing.pickupAddress.pincode}
                              </p>
                            </div>
                          )}
                          {listing.pickupAddress.pickup_time && (
                            <div>
                              <p className="text-sm font-medium text-gray-700">Preferred Pickup Time</p>
                              <p className="text-sm text-gray-900 capitalize">{listing.pickupAddress.pickup_time}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Description */}
                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-gray-500 mb-2">Description</p>
                  <p className="text-gray-700 leading-relaxed">{listing.description}</p>
                </div>

                {/* Listing Created */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>Listed on: {formatDate(listing.created_at)}</span>
                    <span>ID: #{listing.id}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Bids & Actions */}
          <div className="space-y-6">
            {/* Current Status */}
            <Card>
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl">
                    <StatusIcon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{statusInfo.description}</h3>
                    <p className={`text-lg font-semibold ${getTimeRemainingColor(timeRemaining || listing.timeLeft)}`}>
                      {timeRemaining || listing.timeLeft}
                    </p>
                  </div>
                  {highestBid && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-sm font-medium text-green-800">Highest Bid</p>
                      <p className="text-2xl font-bold text-green-900">₹{highestBidAmount.toLocaleString()}</p>
                      <p className="text-sm text-green-700">Selliko Bid #{generateVendorCode(highestBid.vendorId)}</p>
                      {highestBid.isNew && (
                        <Badge className="bg-orange-100 text-orange-800 text-xs mt-2">New!</Badge>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Accept Highest Bid Button - Show only for receiving_bids or bidding_ended status */}
                {highestBid && (listing.status === 'receiving_bids' || listing.status === 'bidding_ended') && (
                  <Button 
                    onClick={() => handleAcceptBid(highestBid.id)}
                    className="w-full bg-green-600 hover:bg-green-700"
                    size="lg"
                  >
                    <Icons.check className="w-4 h-4 mr-2" />
                    Accept Highest Bid
                  </Button>
                )}
                
                {/* Edit Listing Button - Show only for pending_approval or rejected status */}
                {(listing.status === 'pending_approval' || listing.status === 'rejected') && (
                  <Button 
                    onClick={handleEditListing}
                    variant="outline" 
                    className="w-full"
                    size="lg"
                  >
                    <Icons.edit className="w-4 h-4 mr-2" />
                    Edit Listing
                  </Button>
                )}
                
                {/* Show message when no actions are available */}
                {!(highestBid && (listing.status === 'receiving_bids' || listing.status === 'bidding_ended')) && 
                 !(listing.status === 'pending_approval' || listing.status === 'rejected') && (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">No actions available at this time</p>
                  </div>
                )}
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
                        } ${bid.isNew ? 'ring-2 ring-blue-200' : ''}`}
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
                                {bid.vendorName}
                              </p>
                              <div className="flex items-center space-x-1">
                                <Icons.star className="w-3 h-3 text-yellow-400 fill-current" />
                                <span className="text-xs text-gray-600">{bid.vendorRating} rating</span>
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
                              {bid.isNew && (
                                <Badge className="bg-blue-100 text-blue-800 text-xs">New</Badge>
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
                    
                    {listing.totalBids > listing.bids.length && (
                      <div className="text-center py-4">
                        <Button variant="outline" size="sm" className="text-xs">
                          <Icons.chevronDown className="w-3 h-3 mr-1" />
                          View {listing.totalBids - listing.bids.length} more bids
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icons.clock className="w-8 h-8 text-gray-400" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">No Bids Yet</h4>
                    <p className="text-gray-600 mb-4">
                      Your listing is live and waiting for vendors to place bids.
                    </p>
                    <p className="text-sm text-gray-500">
                      Competitive bidding usually starts within 24 hours of listing approval.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 sm:mx-0 sm:h-10 sm:w-10">
                    <Icons.exclamationTriangle className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Accept Highest Bid
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to accept the highest bid of <strong>₹{highestBidAmount.toLocaleString()}</strong>? 
                        This action cannot be undone and will close the auction immediately.
                      </p>
                      {highestBid && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm font-medium text-gray-900">Winning Bid Details:</p>
                          <p className="text-sm text-gray-700">Amount: ₹{highestBidAmount.toLocaleString()}</p>
                          <p className="text-sm text-gray-700">Vendor: {highestBid.vendorName}</p>
                          <p className="text-sm text-gray-700">Rating: {highestBid.vendorRating} stars</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <Button
                  onClick={handleConfirmAcceptBid}
                  disabled={isAcceptingBid}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  {isAcceptingBid ? (
                    <>
                      <Icons.spinner className="animate-spin -ml-1 mr-2 h-4 w-4" />
                      Accepting...
                    </>
                  ) : (
                    'Accept Bid'
                  )}
                </Button>
                <Button
                  onClick={() => setShowConfirmModal(false)}
                  disabled={isAcceptingBid}
                  variant="outline"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && acceptedBidDetails && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                    <Icons.check className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Bid Accepted Successfully!
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 mb-3">
                        Congratulations! You have successfully accepted the highest bid for your device.
                      </p>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 className="font-medium text-green-900 mb-2">Transaction Details:</h4>
                        <div className="space-y-1 text-sm text-green-700">
                          <p><strong>Final Amount:</strong> ₹{acceptedBidDetails.bidAmount.toLocaleString()}</p>
                          <p><strong>Winning Vendor:</strong> {acceptedBidDetails.vendorName}</p>
                          <p><strong>Location:</strong> {acceptedBidDetails.vendorLocation}</p>
                          <p><strong>Status:</strong> <span className="capitalize">{acceptedBidDetails.listingStatus.replace('_', ' ')}</span></p>
                        </div>
                      </div>
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Next Steps:</strong> Our team will contact you within 24 hours to coordinate the device pickup and payment process.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <Button
                  onClick={handleSuccessModalClose}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Continue
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 