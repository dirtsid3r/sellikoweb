'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Icons } from '@/components/ui/icons'
import { toast } from 'react-hot-toast'
import sellikoClient from '@/selliko-client'

interface MarketplaceListing {
  id: string
  device: string
  brand: string
  model: string
  storage: string
  color: string
  condition: string
  askingPrice: number
  currentBid?: number
  totalBids: number
  timeLeft: string
  timeLeftMinutes: number
  location: string
  seller: {
    name: string
    rating: number
    isVerified: boolean
  }
  images: string[]
  description: string
  listingDate: string
  features: string[]
  warranty: string
  isHot: boolean
  isInstantWin: boolean
}

interface BidModalProps {
  listing: MarketplaceListing
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface BidHistory {
  id: string
  vendorName: string
  amount: number
  timestamp: string
  isWinning: boolean
}

// Extended interface for detailed listing data from API
interface DetailedListing {
  id: number
  user_id: string
  listing_type: string
  status: string
  asking_price: number
  expected_price: number
  created_at: string
  updated_at: string
  vendor_id?: string
  agent_id?: string
  bids: Array<{
    id: number
    status: string
    vendor_id: string
    bid_amount: number
    created_at: string
    listing_id: number
    updated_at: string
    instant_win: boolean
  }>
  highest_bid: number
  rejection_note?: string
  time_approved?: string
  devices: Array<{
    id: string
    brand: string
    color: string
    imei1: string
    imei2: string
    model: string
    storage: string
    has_bill: boolean
    condition: string
    created_at: string
    listing_id: number
    updated_at: string
    description?: string
    purchase_date?: string
    top_image_url?: string
    warranty_type?: string
    back_image_url?: string
    battery_health?: number
    bill_image_url?: string
    purchase_price?: number
    front_image_url?: string
    warranty_expiry?: string
    warranty_status: string
    bottom_image_url?: string
    warranty_image_url?: string
  }>
  addresses: Array<{
    id: string
    city: string
    type: 'client' | 'pickup'
    email?: string
    state: string
    address: string
    pincode: string
    landmark?: string
    bank_name?: string
    ifsc_code?: string
    created_at: string
    listing_id: number
    updated_at: string
    pickup_time?: string
    contact_name?: string
    mobile_number?: string
    account_number?: string
    account_holder_name?: string
  }>
  agreements: Array<{
    id: string
    created_at: string
    listing_id: number
    updated_at: string
    terms_accepted: boolean
    privacy_accepted: boolean
    whatsapp_consent: boolean
  }>
}

export function BidModal({ listing, open, onOpenChange }: BidModalProps) {
  const [bidAmount, setBidAmount] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(listing.timeLeftMinutes)
  const [bidHistory, setBidHistory] = useState<BidHistory[]>([])
  const [isWatchingAuction, setIsWatchingAuction] = useState(false)

  // New state for API data
  const [detailedListing, setDetailedListing] = useState<DetailedListing | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch detailed listing data when modal opens
  useEffect(() => {
    const fetchListingDetails = async () => {
      if (!open || !listing.id) return

      console.log('🔍 [BID-MODAL] Fetching detailed listing data for ID:', listing.id)
      setIsLoading(true)
      setError(null)

      try {
        const response: any = await sellikoClient.getListingById(listing.id, {
          include_images: true,
          include_bids: true,
          include_user_details: false // Don't need sensitive user details for bidding
        })

        console.log('📥 [BID-MODAL] API response:', {
          success: response.success,
          hasListing: !!response.listing,
          error: response.error
        })

        if (response.success && response.listing) {
          setDetailedListing(response.listing)
          
          // Debug: Log image information
          console.log('🖼️ [BID-MODAL] Device images from API:', {
            devices: response.listing.devices,
            firstDevice: response.listing.devices[0],
            imageUrls: response.listing.devices[0] ? [
              response.listing.devices[0].front_image_url,
              response.listing.devices[0].back_image_url,
              response.listing.devices[0].top_image_url,
              response.listing.devices[0].bottom_image_url
            ] : [],
            validImages: response.listing.devices[0] ? [
              response.listing.devices[0].front_image_url,
              response.listing.devices[0].back_image_url,
              response.listing.devices[0].top_image_url,
              response.listing.devices[0].bottom_image_url
            ].filter(Boolean) : []
          })
          
          // Transform bid history from API response
          if (response.listing.bids && response.listing.bids.length > 0) {
            console.log('🔄 [BID-MODAL] Processing bids:', response.listing.bids)
            
            const transformedBids: BidHistory[] = response.listing.bids
              .filter((bid: any) => bid && typeof bid === 'object') // Filter out invalid bids
              .map((bid: any, index: number) => {
                console.log(`📋 [BID-MODAL] Processing bid ${index + 1}:`, {
                  id: bid.id,
                  bid_amount: bid.bid_amount,
                  vendor_id: bid.vendor_id,
                  created_at: bid.created_at,
                  status: bid.status,
                  instant_win: bid.instant_win
                })
                
                return {
                  id: bid.id || `bid_${index}`,
                  vendorName: bid.vendor_id ? `Vendor ${bid.vendor_id.substring(0, 8)}...` : `Vendor ${index + 1}`,
                  amount: bid.bid_amount || 0,
                  timestamp: bid.created_at ? new Date(bid.created_at).toLocaleString() : 'Unknown time',
                  isWinning: index === 0 // First bid is highest (assuming sorted)
                }
              })
              .filter((bid: BidHistory) => bid.amount > 0) // Only include bids with valid amounts
              
            console.log('✅ [BID-MODAL] Transformed bids:', transformedBids)
            setBidHistory(transformedBids)
          } else {
            console.log('ℹ️ [BID-MODAL] No bids found in response')
            setBidHistory([])
          }
          
          console.log('✅ [BID-MODAL] Detailed listing data loaded successfully')
        } else {
          console.error('❌ [BID-MODAL] Failed to load listing details:', response.error)
          setError(response.error || 'Failed to load listing details')
        }
      } catch (error) {
        console.error('💥 [BID-MODAL] Error fetching listing details:', error)
        setError('Network error occurred while loading listing details')
      } finally {
        setIsLoading(false)
      }
    }

    fetchListingDetails()
  }, [open, listing.id])

  // Use detailed listing data if available, fallback to marketplace listing
  const currentListing = detailedListing ? {
    id: detailedListing.id.toString(),
    device: `${detailedListing.devices[0]?.brand} - ${detailedListing.devices[0]?.model} - ${detailedListing.devices[0]?.storage} - ${detailedListing.devices[0]?.color}`,
    brand: detailedListing.devices[0]?.brand || '',
    model: detailedListing.devices[0]?.model || '',
    storage: detailedListing.devices[0]?.storage || '',
    color: detailedListing.devices[0]?.color || '',
    condition: detailedListing.devices[0]?.condition || '',
    askingPrice: detailedListing.asking_price || detailedListing.expected_price,
    currentBid: detailedListing.highest_bid > 0 ? detailedListing.highest_bid : undefined,
    totalBids: detailedListing.bids?.length || 0,
    location: detailedListing.addresses.find(addr => addr.type === 'pickup')?.city || 
              detailedListing.addresses.find(addr => addr.type === 'client')?.city || 
              'Location not specified',
    seller: {
      name: detailedListing.addresses.find(addr => addr.type === 'client')?.contact_name || 'Unknown Seller',
      rating: 5, // Default rating
      isVerified: true // Default verification
    },
    images: [
      detailedListing.devices[0]?.front_image_url,
      detailedListing.devices[0]?.back_image_url,
      detailedListing.devices[0]?.top_image_url,
      detailedListing.devices[0]?.bottom_image_url
    ].filter(Boolean),
    description: detailedListing.devices[0]?.description || 
                `${detailedListing.devices[0]?.condition} condition ${detailedListing.devices[0]?.brand} ${detailedListing.devices[0]?.model}`,
    warranty: detailedListing.devices[0]?.warranty_status === 'active' ? 
      `Active${detailedListing.devices[0]?.warranty_expiry ? ` until ${detailedListing.devices[0]?.warranty_expiry}` : ''}` : 
      detailedListing.devices[0]?.warranty_status || 'N/A',
    features: [
      detailedListing.devices[0]?.storage,
      detailedListing.devices[0]?.color,
      detailedListing.devices[0]?.condition,
      detailedListing.devices[0]?.warranty_status === 'active' ? 'Under Warranty' : null,
      detailedListing.devices[0]?.has_bill === true ? 'With Bill' : null
    ].filter(Boolean),
    timeLeft: listing.timeLeft,
    timeLeftMinutes: listing.timeLeftMinutes,
    listingDate: new Date(detailedListing.created_at).toISOString().split('T')[0],
    isHot: listing.isHot,
    isInstantWin: listing.isInstantWin
  } : {
    ...listing,
    device: `${listing.brand} - ${listing.model} - ${listing.storage} - ${listing.color}`
  }

  const minimumBid = currentListing.currentBid ? currentListing.currentBid + 1000 : 1000
  const isInstantWin = bidAmount && parseInt(bidAmount) >= currentListing.askingPrice
  const isValidBid = bidAmount && parseInt(bidAmount) >= minimumBid

  // Real-time timer countdown
  useEffect(() => {
    if (!open || timeRemaining <= 0) return

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          toast.error('Auction has ended!')
          return 0
        }
        return prev - 1
      })
    }, 60000) // Update every minute

    return () => clearInterval(timer)
  }, [open, timeRemaining])

  // Simulate real-time bid updates (only if watching)
  useEffect(() => {
    if (!open || !isWatchingAuction) return

    const bidUpdateTimer = setInterval(() => {
      // Random chance of new bid
      if (Math.random() < 0.1) { // 10% chance every 10 seconds
        const randomBidders = ['Digital Hub Kerala', 'Phone Paradise', 'Smart Gadgets Co']
        const randomBidder = randomBidders[Math.floor(Math.random() * randomBidders.length)]
        const newBidAmount = (currentListing.currentBid || minimumBid) + Math.floor(Math.random() * 2000) + 500
        
        const newBid: BidHistory = {
          id: Date.now().toString(),
          vendorName: randomBidder,
          amount: newBidAmount,
          timestamp: 'Just now',
          isWinning: true
        }

        setBidHistory(prev => [newBid, ...prev.map(bid => ({ ...bid, isWinning: false }))])
                 toast(`New bid: ₹${newBidAmount.toLocaleString()} by ${randomBidder}`)
      }
    }, 10000) // Check every 10 seconds

    return () => clearInterval(bidUpdateTimer)
  }, [open, isWatchingAuction, currentListing.currentBid, minimumBid])

  const formatTimeRemaining = (minutes: number): string => {
    if (minutes <= 0) return 'Auction Ended'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m remaining`
    }
    return `${mins} minutes remaining`
  }

  const getTimeColor = (minutes: number): string => {
    if (minutes <= 30) return 'text-red-600 bg-red-100'
    if (minutes <= 120) return 'text-orange-600 bg-orange-100'  
    return 'text-green-600 bg-green-100'
  }

  const handleSubmitBid = async () => {
    if (!isValidBid || !agreedToTerms || timeRemaining <= 0) return

    setIsSubmitting(true)
    
    try {
      console.log('💰 [BID-MODAL] Submitting bid:', {
        listingId: currentListing.id,
        bidAmount: parseInt(bidAmount),
        isInstantWin: isInstantWin
      })

      // Call the real API to place bid
      const result = await sellikoClient.placeBid(currentListing.id, parseInt(bidAmount))
      
      console.log('📥 [BID-MODAL] Bid placement result:', result)
      
      if (result.success) {
        if (result.instant_win || isInstantWin) {
          toast.success(`🎉 Congratulations! You won this auction instantly!\n\nDevice: ${currentListing.device}\nAmount: ₹${parseInt(bidAmount).toLocaleString()}\n\nOrder tracking will begin automatically.`)
        
        // Add winning bid to history
        const winningBid: BidHistory = {
            id: result.bid?.id || Date.now().toString(),
          vendorName: 'You (Winner!)',
          amount: parseInt(bidAmount),
          timestamp: 'Just now',
          isWinning: true
        }
        setBidHistory(prev => [winningBid, ...prev.map(bid => ({ ...bid, isWinning: false }))])
        
        // Close auction
        setTimeRemaining(0)
      } else {
          toast.success(`✅ Bid placed successfully!\n\nDevice: ${currentListing.device}\nYour Bid: ₹${parseInt(bidAmount).toLocaleString()}\n\nYou'll be notified if you're outbid.`)
        
        // Add bid to history
        const newBid: BidHistory = {
            id: result.bid?.id || Date.now().toString(),
          vendorName: 'You (Leading)',
          amount: parseInt(bidAmount),
          timestamp: 'Just now',
          isWinning: true
        }
        setBidHistory(prev => [newBid, ...prev.map(bid => ({ ...bid, isWinning: false }))])
      }
      
      setIsWatchingAuction(true)
        
        // Reset form if not instant win
        if (!result.instant_win && !isInstantWin) {
          setBidAmount('')
          setAgreedToTerms(false)
        }
      } else {
        console.error('❌ [BID-MODAL] Bid placement failed:', result.error)
        toast.error(`Failed to place bid: ${result.error || 'Unknown error occurred'}`)
      }
      
    } catch (error) {
      console.error('💥 [BID-MODAL] Bid placement error:', error)
      toast.error('Network error occurred while placing bid. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`
  }

  const handleWatchAuction = () => {
    setIsWatchingAuction(!isWatchingAuction)
         toast(isWatchingAuction ? 'Stopped watching auction' : 'Now watching auction for real-time updates')
  }

  // Show loading state
  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icons.smartphone className="w-5 h-5" />
              Loading Listing Details...
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Icons.spinner className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">Fetching complete listing information...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // Show error state
  if (error) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icons.smartphone className="w-5 h-5" />
              Error Loading Listing
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Icons.alertCircle className="w-8 h-8 mx-auto mb-4 text-red-500" />
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => onOpenChange(false)} variant="outline">
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icons.smartphone className="w-5 h-5" />
            Bid on {currentListing.device}
            {detailedListing && (
              <Badge variant="outline" className="ml-2 text-xs">
                Live Data
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Device Info & Bidding */}
          <div className="space-y-6">
            {/* Device Summary */}
            <Card>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <img 
                    src={currentListing.images && currentListing.images.length > 0 ? currentListing.images[0] : '/api/placeholder/80/80'} 
                    alt={currentListing.device}
                    className="w-20 h-20 object-cover rounded-lg"
                    onError={(e) => {
                      console.log('❌ [BID-MODAL] Image failed to load:', e.currentTarget.src)
                      e.currentTarget.src = '/api/placeholder/80/80'
                    }}
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{currentListing.device}</h3>
                    <p className="text-sm text-gray-600">{currentListing.storage}, {currentListing.color}</p>
                    <p className="text-sm text-gray-600">Condition: {currentListing.condition} • Location: {currentListing.location}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        📍 {currentListing.location}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        ⭐ {currentListing.seller.rating}
                      </Badge>
                      {currentListing.seller.isVerified && (
                        <Badge variant="outline" className="text-xs text-green-600">
                          ✓ Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Debug: Show all available images */}
                {detailedListing && detailedListing.devices[0] && (
                  <div className="mt-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Available Images:</h5>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { position: 'front', url: detailedListing.devices[0].front_image_url },
                        { position: 'back', url: detailedListing.devices[0].back_image_url },
                        { position: 'top', url: detailedListing.devices[0].top_image_url },
                        { position: 'bottom', url: detailedListing.devices[0].bottom_image_url }
                      ].map(({ position, url }) => (
                        url ? (
                          <div key={position} className="relative">
                            <img
                              src={url}
                              alt={`${currentListing.device} - ${position}`}
                              className="w-16 h-16 object-cover rounded border"
                              onError={(e) => {
                                console.log(`❌ [BID-MODAL] ${position} image failed:`, url)
                                e.currentTarget.style.display = 'none'
                              }}
                            />
                            <span className="absolute -bottom-1 -right-1 bg-blue-500 text-white text-xs px-1 rounded">
                              {position}
                            </span>
                          </div>
                        ) : null
                      ))}
                    </div>
                    {[
                      detailedListing.devices[0].front_image_url,
                      detailedListing.devices[0].back_image_url,
                      detailedListing.devices[0].top_image_url,
                      detailedListing.devices[0].bottom_image_url
                    ].filter(Boolean).length === 0 && (
                      <p className="text-sm text-gray-500">No images available</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Auction Timer */}
            <Card className="border-2 border-dashed border-gray-300">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Icons.clock className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-900">Auction Status</span>
                </div>
                <Badge className={`text-sm px-3 py-1 ${getTimeColor(timeRemaining)}`}>
                  {formatTimeRemaining(timeRemaining)}
                </Badge>
                {timeRemaining > 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    Auction auto-extends by 5 minutes if bid placed in last 5 minutes
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Current Bidding Status */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Current Bidding Status</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Asking Price:</span>
                  <span className="font-semibold text-green-600">{formatCurrency(currentListing.askingPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Highest Bid:</span>
                  <span className="font-semibold">
                    {bidHistory.length > 0 && bidHistory[0].amount > 0 ? formatCurrency(bidHistory[0].amount) : 
                     currentListing.currentBid && currentListing.currentBid > 0 ? formatCurrency(currentListing.currentBid) : 'No bids yet'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Bids:</span>
                  <span>{currentListing.totalBids || bidHistory.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Minimum Next Bid:</span>
                  <span className="font-semibold text-blue-600">{formatCurrency(minimumBid)}</span>
                </div>
              </div>
            </div>

            {/* Bid Amount Input */}
            {timeRemaining > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Your Bid Amount *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                  <Input
                    type="number"
                    placeholder={`Minimum ${formatCurrency(minimumBid)}`}
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    className="pl-8"
                    min={minimumBid}
                    step={100}
                  />
                </div>
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-gray-600">
                    ⚠️ Minimum bid: {formatCurrency(minimumBid)}
                  </p>
                  {isInstantWin && (
                    <p className="text-xs text-orange-600 font-medium">
                      🎯 Instant Win: This bid will immediately close the auction!
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Instant Win Callout */}
            {isInstantWin && timeRemaining > 0 && (
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Icons.star className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-orange-900 mb-1">🏆 BID AT ASKING PRICE TO WIN INSTANTLY</h4>
                      <p className="text-sm text-orange-800">
                        Bidding at or above {formatCurrency(currentListing.askingPrice)} will immediately close this auction and you'll win the device. Order tracking will begin automatically.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Bid Terms */}
            {timeRemaining > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Bid Terms</h4>
                <div className="space-y-2">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-1"
                    />
                    <span className="text-sm text-gray-700">
                      I understand bids are binding commitments and I agree to complete purchase if I win this auction.
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
                disabled={isSubmitting}
              >
                Close
              </Button>
              
              {timeRemaining > 0 ? (
                <Button
                  onClick={handleSubmitBid}
                  className="flex-1"
                  disabled={!isValidBid || !agreedToTerms || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Icons.spinner className="w-4 h-4 mr-2 animate-spin" />
                      {isInstantWin ? 'Winning...' : 'Placing Bid...'}
                    </>
                  ) : (
                    isInstantWin ? '🏆 Win Instantly' : 'Place Bid'
                  )}
                </Button>
              ) : (
                <Button variant="outline" disabled className="flex-1">
                  Auction Ended
                </Button>
              )}
            </div>
          </div>

          {/* Right Column - Bid History & Real-time Updates */}
          <div className="space-y-6">
            {/* Watch Auction Toggle */}
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-900">Live Bid History</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={handleWatchAuction}
                className={isWatchingAuction ? 'bg-green-50 border-green-200' : ''}
              >
                <Icons.eye className="w-4 h-4 mr-2" />
                {isWatchingAuction ? 'Watching' : 'Watch Live'}
              </Button>
            </div>

            {/* Live Updates Indicator */}
            {isWatchingAuction && (
              <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Live updates enabled
              </div>
            )}

            {/* Bid History */}
            <Card className="max-h-96 overflow-y-auto">
              <CardContent className="p-4">
                <div className="space-y-3">
                  {bidHistory.map((bid, index) => (
                    <div key={bid.id} className={`flex items-center justify-between p-3 rounded-lg border ${
                      bid.isWinning ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{bid.vendorName}</span>
                          {bid.isWinning && (
                            <Badge className="bg-green-100 text-green-800 text-xs">Leading</Badge>
                          )}
                          {bid.vendorName.includes('You') && (
                            <Badge className="bg-blue-100 text-blue-800 text-xs">Your Bid</Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">{bid.timestamp}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${bid.isWinning ? 'text-green-600' : 'text-gray-600'}`}>
                          {bid.amount > 0 ? formatCurrency(bid.amount) : 'Amount unavailable'}
                        </p>
                        <p className="text-xs text-gray-500">#{index + 1}</p>
                      </div>
                    </div>
                  ))}
                  
                  {bidHistory.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Icons.clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No bids yet. Be the first to bid!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Device Features */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Device Features</h4>
                <div className="flex flex-wrap gap-2">
                  {currentListing.features.map((feature, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
                <div className="mt-3 space-y-1 text-sm">
                  <p><span className="text-gray-600">Warranty:</span> {currentListing.warranty}</p>
                  <p><span className="text-gray-600">Description:</span> {currentListing.description}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 