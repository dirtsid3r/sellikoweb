'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Icons } from '@/components/ui/icons'
import { Card, CardContent } from '@/components/ui/card'

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
  photos: string[]
  description: string
  seller: {
    name: string
    location: string
  }
}

interface BidModalProps {
  listing: MarketplaceListing
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BidModal({ listing, open, onOpenChange }: BidModalProps) {
  const [bidAmount, setBidAmount] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const minimumBid = listing.currentBid ? listing.currentBid + 100 : 1000
  const isInstantWin = bidAmount && parseInt(bidAmount) >= listing.askingPrice
  const isValidBid = bidAmount && parseInt(bidAmount) >= minimumBid

  const handleSubmitBid = async () => {
    if (!isValidBid || !agreedToTerms) return

    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (isInstantWin) {
      alert(`🎉 Congratulations! You won this auction instantly!\n\nDevice: ${listing.device}\nAmount: ₹${parseInt(bidAmount).toLocaleString()}\n\nOrder tracking will begin automatically.`)
    } else {
      alert(`✅ Bid placed successfully!\n\nDevice: ${listing.device}\nYour Bid: ₹${parseInt(bidAmount).toLocaleString()}\n\nYou'll be notified if you're outbid.`)
    }
    
    setIsSubmitting(false)
    onOpenChange(false)
    setBidAmount('')
    setAgreedToTerms(false)
  }

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icons.smartphone className="w-5 h-5" />
            Place Your Bid
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Device Summary */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <img 
                  src={listing.image} 
                  alt={listing.device}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{listing.device}</h3>
                  <p className="text-sm text-gray-600">{listing.storage}, {listing.color}</p>
                  <p className="text-sm text-gray-600">Condition: {listing.condition} • Location: {listing.location}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      ⏱️ Time Left: {listing.timeLeft}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Bidding Status */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Current Bidding Status:</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">• Asking Price:</span>
                <span className="font-semibold text-green-600">{formatCurrency(listing.askingPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">• Highest Bid:</span>
                <span className="font-semibold">
                  {listing.currentBid ? formatCurrency(listing.currentBid) : 'No bids yet'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">• Total Bids:</span>
                <span>{listing.totalBids}</span>
              </div>
            </div>
          </div>

          {/* Bid Amount Input */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Your Bid Amount *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
              <Input
                type="number"
                placeholder="Enter your bid"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                className="pl-8"
                min={minimumBid}
              />
            </div>
            <div className="mt-2 space-y-1">
              <p className="text-xs text-gray-600">
                ⚠️ Minimum bid: {formatCurrency(minimumBid)} (current + ₹100)
              </p>
              {isInstantWin && (
                <p className="text-xs text-orange-600 font-medium">
                  🎯 Instant Win: Bidding at or above {formatCurrency(listing.askingPrice)} will immediately close this auction!
                </p>
              )}
            </div>
          </div>

          {/* Instant Win Callout */}
          {isInstantWin && (
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Icons.star className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-orange-900 mb-1">🏆 BID AT ASKING PRICE TO WIN INSTANTLY</h4>
                    <p className="text-sm text-orange-800">
                      Bidding at or above {formatCurrency(listing.askingPrice)} will immediately close this auction and you'll win the device. Order tracking will begin automatically.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Bid Terms */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Bid Terms:</h4>
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

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 