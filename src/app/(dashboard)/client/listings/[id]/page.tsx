'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Icons } from '@/components/ui/icons'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'

export default function ListingDetailPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const listingId = params.id as string

  // Mock data - replace with actual API call
  const listing = {
    id: listingId,
    device: 'iPhone 14 Pro',
    model: '128GB Deep Purple',
    condition: 'Excellent',
    askingPrice: 70000,
    description: 'iPhone 14 Pro in excellent condition. No scratches, original box included.',
    images: ['/api/placeholder/400/400'],
    status: 'receiving_bids',
    timeLeft: '18h 30m',
    bids: [
      {
        id: 'bid-1',
        vendorName: 'TechWorld Kochi',
        vendorRating: 4.8,
        amount: 65000,
        timestamp: '2024-06-04T16:20:00Z',
        message: 'Interested in this device.',
        isHighest: true
      }
    ]
  }

  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const highestBid = listing.bids.find(bid => bid.isHighest)

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
    // Handle bid acceptance
    console.log('Accepting bid:', bidId)
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-square bg-gray-100">
                  <img 
                    src={listing.images[currentImageIndex]}
                    alt={listing.device}
                    className="w-full h-full object-cover"
                  />
                </div>
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
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Condition</p>
                    <p className="text-lg font-semibold text-gray-900">{listing.condition}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Your Asking Price</p>
                    <p className="text-lg font-semibold text-gray-900">₹{listing.askingPrice.toLocaleString()}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Description</p>
                  <p className="text-gray-700 leading-relaxed">{listing.description}</p>
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
                    <p className="text-gray-600">Time left: {listing.timeLeft}</p>
                  </div>
                  {highestBid && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-sm font-medium text-green-800">Highest Bid</p>
                      <p className="text-2xl font-bold text-green-900">₹{highestBid.amount.toLocaleString()}</p>
                      <p className="text-sm text-green-700">by {highestBid.vendorName}</p>
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
                {highestBid && (
                  <Button 
                    onClick={() => handleAcceptBid(highestBid.id)}
                    className="w-full bg-green-600 hover:bg-green-700"
                    size="lg"
                  >
                    <Icons.check className="w-4 h-4 mr-2" />
                    Accept Highest Bid
                  </Button>
                )}
                <Button 
                  onClick={handleEditListing}
                  variant="outline" 
                  className="w-full"
                  size="lg"
                >
                  <Icons.edit className="w-4 h-4 mr-2" />
                  Edit Listing
                </Button>
              </CardContent>
            </Card>

            {/* All Bids */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>All Bids ({listing.bids.length})</span>
                  <Icons.trendingUp className="w-5 h-5 text-green-600" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {listing.bids.map((bid) => (
                  <div 
                    key={bid.id} 
                    className="bg-green-50 border border-green-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">{bid.vendorName}</p>
                        <div className="flex items-center space-x-1">
                          <Icons.star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600">{bid.vendorRating}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-green-700">₹{bid.amount.toLocaleString()}</p>
                        <Badge className="bg-green-100 text-green-800 text-xs">Highest</Badge>
                      </div>
                    </div>
                    {bid.message && (
                      <p className="text-sm text-gray-600 mt-2">{bid.message}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(bid.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 