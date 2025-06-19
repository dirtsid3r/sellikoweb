'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'

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

interface BidHistoryCardProps {
  bid: VendorBid
  onTrackOrder: (orderId: string) => void
  onViewListing: (listingId: string) => void
}

export function BidHistoryCard({ 
  bid, 
  onTrackOrder, 
  onViewListing 
}: BidHistoryCardProps) {
  const router = useRouter()
  
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

  const handleTrackOrder = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    console.log('🔍 [BID-HISTORY-CARD] Track Order clicked:', {
      listingId: bid.listingId,
      bidId: bid.id,
      status: bid.status
    })
    
    if (!bid.listingId) {
      console.error('❌ [BID-HISTORY-CARD] No listingId provided:', bid)
      return
    }
    
    const targetUrl = `/vendor/listings/${bid.listingId}`
    console.log('🔄 [BID-HISTORY-CARD] Navigating to:', targetUrl)
    
    router.push(targetUrl)
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h4 className="font-semibold text-gray-900">{bid.device}</h4>
            <p className="text-sm text-gray-600">{bid.bidDate}</p>
          </div>
          <Badge className={`${getStatusColor(bid.status)} border-none`}>
            {getStatusIcon(bid.status)} {bid.status === 'active' ? 'Highest Bid' : bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
          </Badge>
        </div>
        
        <div className="space-y-1 mb-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Date:</span>
            <span className="font-medium">{bid.bidDate}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Device:</span>
            <span className="font-medium text-right">{bid.device}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">My Bid:</span>
            <span className="font-semibold">{formatCurrency(bid.bidAmount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Status:</span>
            <Badge className={`${getStatusColor(bid.status)} border-none text-xs`}>
              {getStatusIcon(bid.status)} {bid.status === 'active' ? 'Highest Bid' : bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
            </Badge>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Result:</span>
            <span className="font-medium">{getResultText(bid.result, bid.status)}</span>
          </div>
        </div>

        <div className="pt-2 border-t">
          {(bid.status === 'won' || bid.status === 'completed') && (
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full"
              onClick={handleTrackOrder}
            >
              {bid.status === 'completed' ? 'View Receipt' : 'Track Order'}
            </Button>
          )}
          
          {(bid.status === 'active' || bid.status === 'pending') && (
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full"
              onClick={() => onViewListing(bid.listingId)}
            >
              View Listing
            </Button>
          )}
          
          {bid.status === 'lost' && (
            <div className="text-center text-sm text-gray-500 py-2">
              No action available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 