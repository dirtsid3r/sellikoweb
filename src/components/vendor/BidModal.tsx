'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Icons } from '@/components/ui/icons'
import { toast } from 'react-hot-toast'

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

export function BidModal({ listing, open, onOpenChange }: BidModalProps) {
  const [bidAmount, setBidAmount] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(listing.timeLeftMinutes)
  const [bidHistory, setBidHistory] = useState<BidHistory[]>([
    {
      id: '1',
      vendorName: 'TechBuy Solutions',
      amount: listing.currentBid || listing.askingPrice - 5000,
      timestamp: '2 minutes ago',
      isWinning: true
    },
    {
      id: '2', 
      vendorName: 'Mobile World Kerala',
      amount: (listing.currentBid || listing.askingPrice) - 2000,
      timestamp: '15 minutes ago',
      isWinning: false
    },
    {
      id: '3',
      vendorName: 'Quick Phone Exchange',
      amount: (listing.currentBid || listing.askingPrice) - 3000,
      timestamp: '1 hour ago', 
      isWinning: false
    }
  ])
  const [isWatchingAuction, setIsWatchingAuction] = useState(false)

  const minimumBid = listing.currentBid ? listing.currentBid + 500 : Math.min(listing.askingPrice * 0.8, listing.askingPrice - 1000)
  const isInstantWin = bidAmount && parseInt(bidAmount) >= listing.askingPrice
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

  // Simulate real-time bid updates
  useEffect(() => {
    if (!open || !isWatchingAuction) return

    const bidUpdateTimer = setInterval(() => {
      // Random chance of new bid
      if (Math.random() < 0.1) { // 10% chance every 10 seconds
        const randomBidders = ['Digital Hub Kerala', 'Phone Paradise', 'Smart Gadgets Co']
        const randomBidder = randomBidders[Math.floor(Math.random() * randomBidders.length)]
        const newBidAmount = (listing.currentBid || minimumBid) + Math.floor(Math.random() * 2000) + 500
        
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
  }, [open, isWatchingAuction, listing.currentBid, minimumBid])

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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      if (isInstantWin) {
        toast.success(`🎉 Congratulations! You won this auction instantly!\n\nDevice: ${listing.device}\nAmount: ₹${parseInt(bidAmount).toLocaleString()}\n\nOrder tracking will begin automatically.`)
        
        // Add winning bid to history
        const winningBid: BidHistory = {
          id: Date.now().toString(),
          vendorName: 'You (Winner!)',
          amount: parseInt(bidAmount),
          timestamp: 'Just now',
          isWinning: true
        }
        setBidHistory(prev => [winningBid, ...prev.map(bid => ({ ...bid, isWinning: false }))])
        
        // Close auction
        setTimeRemaining(0)
      } else {
        toast.success(`✅ Bid placed successfully!\n\nDevice: ${listing.device}\nYour Bid: ₹${parseInt(bidAmount).toLocaleString()}\n\nYou'll be notified if you're outbid.`)
        
        // Add bid to history
        const newBid: BidHistory = {
          id: Date.now().toString(),
          vendorName: 'You (Leading)',
          amount: parseInt(bidAmount),
          timestamp: 'Just now',
          isWinning: true
        }
        setBidHistory(prev => [newBid, ...prev.map(bid => ({ ...bid, isWinning: false }))])
      }
      
      setIsWatchingAuction(true)
    } catch (error) {
      toast.error('Failed to place bid. Please try again.')
    } finally {
      setIsSubmitting(false)
      if (!isInstantWin) {
        setBidAmount('')
        setAgreedToTerms(false)
      }
    }
  }

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`
  }

  const handleWatchAuction = () => {
    setIsWatchingAuction(!isWatchingAuction)
         toast(isWatchingAuction ? 'Stopped watching auction' : 'Now watching auction for real-time updates')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icons.smartphone className="w-5 h-5" />
            Bid on {listing.device}
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
                    src={listing.images[0]} 
                    alt={listing.device}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{listing.device}</h3>
                    <p className="text-sm text-gray-600">{listing.storage}, {listing.color}</p>
                    <p className="text-sm text-gray-600">Condition: {listing.condition} • Location: {listing.location}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        📍 {listing.location}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        ⭐ {listing.seller.rating}
                      </Badge>
                    </div>
                  </div>
                </div>
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
                  <span className="font-semibold text-green-600">{formatCurrency(listing.askingPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Highest Bid:</span>
                  <span className="font-semibold">
                    {bidHistory.length > 0 ? formatCurrency(bidHistory[0].amount) : 'No bids yet'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Bids:</span>
                  <span>{bidHistory.length}</span>
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
                        Bidding at or above {formatCurrency(listing.askingPrice)} will immediately close this auction and you'll win the device. Order tracking will begin automatically.
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
                          {formatCurrency(bid.amount)}
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
                  {listing.features.map((feature, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
                <div className="mt-3 space-y-1 text-sm">
                  <p><span className="text-gray-600">Warranty:</span> {listing.warranty}</p>
                  <p><span className="text-gray-600">Description:</span> {listing.description}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 