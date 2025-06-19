'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Icons } from '@/components/ui/icons'
import { BidHistoryCard } from './BidHistoryCard'
import sellikoClient from '@/selliko-client'

// API Response interfaces based on /bids endpoint documentation
interface ApiBidResponse {
  success: boolean
  bids?: Array<{
    bid: string
    listing_id: string
    device: string
    bid_amnt: number
    bid_status: string
    result: string
    vendor_id: string
    creation_timestamp: string
  }>
  total?: number
  vendorCode?: string
  error?: string
  message?: string
}

interface VendorBid {
  id: string
  listingId: string
  device: string
  bidAmount: number
  status: 'active' | 'won' | 'lost' | 'pending' | 'completed'
  bidDate: string
  result: 'instant' | 'timer' | 'leading' | '2nd' | 'outbid' | null
  orderId?: string
  seller?: {
    name: string
    location: string
  }
  delivery?: {
    status: 'pending' | 'in_transit' | 'delivered'
    estimatedDate?: string
    trackingInfo?: string
  }
}

interface BidHistorySectionProps {
  onTrackOrder: (orderId: string) => void
  onViewListing: (listingId: string) => void
}

export function BidHistorySection({ 
  onTrackOrder, 
  onViewListing 
}: BidHistorySectionProps) {
  const router = useRouter()
  const [bids, setBids] = useState<VendorBid[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch bid history on component mount
  useEffect(() => {
    const fetchBidHistory = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('🔄 [BidHistorySection] Fetching bid history...')
        const response = await sellikoClient.getMyBids() as ApiBidResponse
        
        if (response.success && response.bids) {
          console.log('✅ [BidHistorySection] Bid history fetched successfully:', response.bids.length)
          
          // Transform API response to component format
          const transformedBids: VendorBid[] = response.bids.map((bid: any, index: number) => {
            console.log(`📋 [BidHistorySection] Transforming bid ${index + 1}:`, {
              bidId: bid.bid,
              device: bid.device,
              amount: bid.bid_amnt,
              status: bid.bid_status,
              result: bid.result,
              timestamp: bid.creation_timestamp
            })
            
            const listingId = extractListingId(bid)
            console.log(`🎯 [BidHistorySection] Extracted listing ID for bid ${index + 1}:`, listingId)
            
            return {
              id: bid.bid || `bid_${Date.now()}_${Math.random()}`,
              listingId: listingId || 'unknown',
              device: bid.device || 'Unknown Device',
              bidAmount: bid.bid_amnt || 0,
              status: mapBidStatus(bid.bid_status),
              bidDate: formatDate(bid.creation_timestamp),
              result: mapBidResult(bid.result, bid.bid_status),
              orderId: bid.bid_status === 'accepted' ? `ORD_${bid.bid}` : undefined,
              seller: undefined, // Not provided by /bids endpoint
              delivery: bid.bid_status === 'accepted' ? {
                status: 'pending',
                estimatedDate: undefined,
                trackingInfo: undefined
              } : undefined
            }
          })
          
          setBids(transformedBids)
        } else {
          console.error('❌ [BidHistorySection] Failed to fetch bid history:', response.error)
          setError(response.error || 'Failed to load bid history')
        }
      } catch (err) {
        console.error('💥 [BidHistorySection] Error fetching bid history:', err)
        setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchBidHistory()
  }, [])

  // Helper function to map API bid status to component status
  const mapBidStatus = (apiStatus: string): VendorBid['status'] => {
    switch (apiStatus?.toLowerCase()) {
      case 'won':
        return 'won'
      case 'active':
        return 'active'
      case 'lost':
        return 'lost'
      default:
        return 'pending'
    }
  }

  // Helper function to map API result to component result
  const mapBidResult = (apiResult: string, status: string): VendorBid['result'] => {
    if (status === 'completed') return null // Will show "Delivered" in getResultText
    if (apiResult?.includes('instant win') || apiResult?.includes('instant')) return 'instant'
    if (status === 'won' && (!apiResult?.includes('instant win') && !apiResult?.includes('instant'))) return null // Will show "User Accepted the bid" in getResultText
    if (apiResult?.includes('timer') || apiResult?.includes('time')) return 'timer'
    if (apiResult?.includes('position 1') || apiResult?.includes('leading')) return 'leading'
    if (apiResult?.includes('position 2') || apiResult?.includes('2nd')) return '2nd'
    if (apiResult?.includes('outbid') || status === 'lost') return 'outbid'
    return null
  }

  // Helper function to extract listing ID from API response
  const extractListingId = (bid: any): string => {
    console.log('🔍 [BidHistorySection] Extracting listing ID from bid:', bid)
    
    // First try to use the listing_id field directly from API
    if (bid.listing_id) {
      console.log('✅ [BidHistorySection] Using listing_id from API:', bid.listing_id)
      
      // Extract numeric part from listing_id (e.g., "listing_98765xyz" -> "98765")
      const listingId = bid.listing_id
      if (typeof listingId === 'string') {
        // Try to extract numeric part
        const numericMatch = listingId.match(/\d+/)
        if (numericMatch) {
          const extractedId = numericMatch[0]
          console.log('🔢 [BidHistorySection] Extracted numeric listing ID:', extractedId)
          return extractedId
        }
      }
      
      // If no numeric part found, use the full listing_id
      return listingId
    }
    
    // Fallback: try to extract from bid ID if it's a string
    const bidId = bid.bid
    if (typeof bidId === 'string' && bidId) {
      console.log('🔄 [BidHistorySection] Fallback: extracting from bid ID:', bidId)
      
      // Try to extract listing ID from various bid ID formats
      if (bidId.includes('_')) {
        const parts = bidId.split('_')
        console.log('📋 [BidHistorySection] Bid ID parts:', parts)
        
        // If first part looks like a number/ID, use it as listing ID
        if (parts[0] && /^\d+$/.test(parts[0])) {
          console.log('✅ [BidHistorySection] Using first part as listing ID:', parts[0])
          return parts[0]
        }
      }
      
      // If bid ID is just a number, it might be the listing ID
      if (/^\d+$/.test(bidId)) {
        console.log('✅ [BidHistorySection] Using bid ID as listing ID:', bidId)
        return bidId
      }
      
      // Use the bid ID itself as fallback
      console.log('🔄 [BidHistorySection] Using bid ID as fallback listing ID:', bidId)
      return bidId
    }
    
    console.warn('⚠️ [BidHistorySection] No valid listing ID found, using unknown')
    return 'unknown'
  }

  // Helper function to format date
  const formatDate = (dateString: string): string => {
    if (!dateString) return 'Unknown Date'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    } catch {
      return 'Invalid Date'
    }
  }
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'won': return '🏆'
      case 'completed': return '✅'
      case 'active': return '🔥'
      case 'pending': return '⏱️'
      case 'lost': return '❌'
      default: return '⚪'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'won': return 'text-yellow-600 bg-yellow-100'
      case 'completed': return 'text-green-600 bg-green-100'
      case 'active': return 'text-blue-600 bg-blue-100'
      case 'pending': return 'text-orange-600 bg-orange-100'
      case 'lost': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getResultText = (result: string | null, status: string) => {
    if (status === 'completed') return 'Delivered'
    if (result?.includes('instant win') || result === 'instant') return 'Instant Win'
    if (status === 'won' && (!result?.includes('instant win') && result !== 'instant')) return 'User Accepted the bid'
    if (result?.includes('timer') || result === 'timer') return 'Timer End'
    if (result?.includes('leading') || result === 'leading') return 'Leading'
    if (result?.includes('position 2') || result === '2nd') return '2nd Place'
    if (result?.includes('outbid') || result === 'outbid') return 'Outbid'
    if (result === 'lost') return 'Lost'
    return '-'
  }

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`
  }

  // Handle track order navigation
  const handleTrackOrderNavigation = (bid: VendorBid) => {
    console.log('🚚 [BidHistorySection] Navigating to listing for tracking:', {
      bidId: bid.id,
      listingId: bid.listingId,
      status: bid.status
    })
    
    if (bid.listingId && bid.listingId !== 'unknown') {
      router.push(`/vendor/listings/${bid.listingId}`)
    } else {
      console.error('❌ [BidHistorySection] Cannot navigate - invalid listingId:', bid.listingId)
      alert('Unable to track order - listing information not available')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bid History</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex items-center space-x-4 p-4 border rounded-lg">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <Icons.alertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Bids</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
            >
              Try Again
            </Button>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Date</th>
                      <th className="text-left py-3 px-4">Device</th>
                      <th className="text-left py-3 px-4">My Bid</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Result</th>
                      <th className="text-left py-3 px-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bids.map((bid) => (
                      <tr key={bid.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{bid.bidDate}</td>
                        <td className="py-3 px-4">{bid.device}</td>
                        <td className="py-3 px-4 font-semibold">{formatCurrency(bid.bidAmount)}</td>
                        <td className="py-3 px-4">
                          <Badge className={`${getStatusColor(bid.status)} border-none`}>
                            {getStatusIcon(bid.status)} {bid.status === 'active' ? 'Highest Bid' : bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">{getResultText(bid.result, bid.status)}</td>
                        <td className="py-3 px-4">
                          {bid.status === 'won' || bid.status === 'completed' ? (
                            <Button size="sm" variant="outline" onClick={() => handleTrackOrderNavigation(bid)}>
                              {bid.status === 'completed' ? 'Receipt' : 'Track Order'}
                            </Button>
                          ) : bid.status === 'active' || bid.status === 'pending' ? (
                            <Button size="sm" variant="outline" onClick={() => router.push(`/vendor/listings/${bid.listingId}`)}>
                              View Listing
                            </Button>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {bids.map((bid) => (
                <BidHistoryCard
                  key={bid.id}
                  bid={bid}
                  onTrackOrder={onTrackOrder}
                  onViewListing={onViewListing}
                />
              ))}
            </div>
          </>
        )}

        {!loading && bids.length === 0 && (
          <div className="text-center py-12">
            <Icons.list className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No bids found</h3>
            <p className="text-gray-600">You haven't placed any bids yet. Start bidding on devices!</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 