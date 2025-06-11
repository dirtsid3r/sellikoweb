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

  // Generate masked vendor ID (5-digit alphanumeric)
  const generateVendorCode = (vendorId: string) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 5; i++) {
      result += chars.charAt((vendorId.charCodeAt(i % vendorId.length) + i) % chars.length)
    }
    return result
  }

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
    totalBids: 8,
    bids: [
      {
        id: 'bid-1',
        vendorId: 'vendor-001',
        vendorName: 'TechWorld Kochi',
        vendorRating: 4.8,
        amount: 68500,
        timestamp: '2024-06-04T18:45:00Z',
        message: 'Ready for immediate pickup. Cash payment.',
        isHighest: true,
        isNew: true
      },
      {
        id: 'bid-2',
        vendorId: 'vendor-002',
        vendorName: 'Mobile Hub Ernakulam',
        vendorRating: 4.6,
        amount: 68000,
        timestamp: '2024-06-04T17:30:00Z',
        message: 'Interested in this device. Can pickup today.',
        isHighest: false,
        isNew: false
      },
      {
        id: 'bid-3',
        vendorId: 'vendor-003',
        vendorName: 'Kerala Mobiles',
        vendorRating: 4.9,
        amount: 67500,
        timestamp: '2024-06-04T16:20:00Z',
        message: 'Good condition device. Fair price offered.',
        isHighest: false,
        isNew: false
      },
      {
        id: 'bid-4',
        vendorId: 'vendor-004',
        vendorName: 'Smart Device Store',
        vendorRating: 4.7,
        amount: 66000,
        timestamp: '2024-06-04T15:10:00Z',
        message: 'Verified buyer. Quick transaction.',
        isHighest: false,
        isNew: false
      },
      {
        id: 'bid-5',
        vendorId: 'vendor-005',
        vendorName: 'Techno Mart',
        vendorRating: 4.5,
        amount: 65000,
        timestamp: '2024-06-04T14:30:00Z',
        message: 'Interested buyer from Kochi.',
        isHighest: false,
        isNew: false
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

            {/* Bidding Summary */}
            <Card className="border-blue-200 bg-blue-50/50">
              <CardContent className="p-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{listing.totalBids}</p>
                    <p className="text-sm text-gray-600">Total Bids</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">₹{highestBid?.amount.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Highest Bid</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-orange-600">
                      {highestBid ? Math.round(((highestBid.amount - listing.askingPrice) / listing.askingPrice) * 100) : 0}%
                    </p>
                    <p className="text-sm text-gray-600">vs Asking Price</p>
                  </div>
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
                    <p className="text-2xl font-bold text-green-600">₹{highestBid?.amount.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Highest Bid</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-orange-600">
                      {highestBid ? Math.round(((highestBid.amount - listing.askingPrice) / listing.askingPrice) * 100) : 0}%
                    </p>
                    <p className="text-sm text-gray-600">vs Asking Price</p>
                  </div>
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

            {/* Bid History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Bid History ({listing.totalBids} total)</span>
                  <Icons.trendingUp className="w-5 h-5 text-green-600" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {listing.bids.map((bid, index) => (
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
                            Selliko Bid #{generateVendorCode(bid.vendorId)}
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
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 