'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Icons } from '@/components/ui/icons'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { useRouter } from 'next/navigation'

interface Listing {
  id: string
  device: {
    brand: string
    model: string
    storage: string
    color: string
    condition: string
  }
  seller: {
    name: string
    phone: string
    location: string
  }
  pricing: {
    askingPrice: number
    estimatedValue: number
  }
  images: string[]
  documentation: {
    hasWarranty: boolean
    hasBill: boolean
    warrantyMonths?: number
  }
  submittedAt: string
  description: string
  imei1: string
  imei2?: string
  status: 'pending' | 'approved' | 'rejected'
}

export default function PendingApprovals() {
  const { user } = useAuth()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)
  const [processingId, setProcessingId] = useState<string | null>(null)

  // Mock data - in real app, this would come from API
  const [pendingListings, setPendingListings] = useState<Listing[]>([
    {
      id: 'listing-001',
      device: {
        brand: 'Apple',
        model: 'iPhone 14 Pro',
        storage: '256GB',
        color: 'Deep Purple',
        condition: 'Excellent'
      },
      seller: {
        name: 'Rajesh Kumar',
        phone: '+91 9876543210',
        location: 'Kochi, Kerala'
      },
      pricing: {
        askingPrice: 85000,
        estimatedValue: 82000
      },
      images: [
        '/api/placeholder/300/300',
        '/api/placeholder/300/300',
        '/api/placeholder/300/300',
        '/api/placeholder/300/300'
      ],
      documentation: {
        hasWarranty: true,
        hasBill: true,
        warrantyMonths: 8
      },
      submittedAt: '2024-01-15T10:30:00Z',
      description: 'Excellent condition iPhone 14 Pro. No scratches, always used with case and screen protector. All accessories included.',
      imei1: '123456789012345',
      imei2: '123456789012346',
      status: 'pending'
    },
    {
      id: 'listing-002',
      device: {
        brand: 'Samsung',
        model: 'Galaxy S23 Ultra',
        storage: '512GB',
        color: 'Phantom Black',
        condition: 'Very Good'
      },
      seller: {
        name: 'Priya Nair',
        phone: '+91 9876543211',
        location: 'Thiruvananthapuram, Kerala'
      },
      pricing: {
        askingPrice: 75000,
        estimatedValue: 78000
      },
      images: [
        '/api/placeholder/300/300',
        '/api/placeholder/300/300',
        '/api/placeholder/300/300'
      ],
      documentation: {
        hasWarranty: false,
        hasBill: true
      },
      submittedAt: '2024-01-14T15:45:00Z',
      description: 'Very good condition Galaxy S23 Ultra. Minor wear on corners but fully functional. S-Pen included.',
      imei1: '987654321098765',
      status: 'pending'
    },
    {
      id: 'listing-003',
      device: {
        brand: 'OnePlus',
        model: '11 Pro',
        storage: '256GB',
        color: 'Titan Black',
        condition: 'Good'
      },
      seller: {
        name: 'Arjun Menon',
        phone: '+91 9876543212',
        location: 'Kozhikode, Kerala'
      },
      pricing: {
        askingPrice: 45000,
        estimatedValue: 42000
      },
      images: [
        '/api/placeholder/300/300',
        '/api/placeholder/300/300'
      ],
      documentation: {
        hasWarranty: true,
        hasBill: false,
        warrantyMonths: 6
      },
      submittedAt: '2024-01-13T09:15:00Z',
      description: 'Good condition OnePlus 11 Pro. Some minor scratches on the back. Battery health is good.',
      imei1: '456789012345678',
      status: 'pending'
    }
  ])

  const filteredListings = pendingListings.filter(listing =>
    listing.device.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.device.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.seller.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleApproveListing = async (listingId: string) => {
    setProcessingId(listingId)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setPendingListings(prev => 
      prev.map(listing => 
        listing.id === listingId 
          ? { ...listing, status: 'approved' as const }
          : listing
      )
    )
    
    setProcessingId(null)
    
    // In real app, this would trigger notifications to vendors
    alert('Listing approved successfully! Notifications sent to all vendors.')
  }

  const handleRejectListing = async () => {
    if (!selectedListing || !rejectionReason.trim()) return
    
    setProcessingId(selectedListing.id)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setPendingListings(prev => 
      prev.map(listing => 
        listing.id === selectedListing.id 
          ? { ...listing, status: 'rejected' as const }
          : listing
      )
    )
    
    setProcessingId(null)
    setIsRejectModalOpen(false)
    setSelectedListing(null)
    setRejectionReason('')
    
    // In real app, this would send rejection notification to seller
    alert('Listing rejected. Notification sent to seller with reason.')
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

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'Excellent': return 'bg-green-100 text-green-800'
      case 'Very Good': return 'bg-blue-100 text-blue-800'
      case 'Good': return 'bg-yellow-100 text-yellow-800'
      case 'Fair': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50">
      {/* Header - iOS Style */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/60 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.back()}
                className="touch-target btn-ghost p-2 rounded-xl"
              >
                <Icons.arrowLeft className="w-5 h-5" />
              </button>
              <div className="w-10 h-10 bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl flex items-center justify-center shadow-lg">
                <Icons.clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Pending Approvals</h1>
                <p className="text-xs text-gray-500">{filteredListings.length} pending review</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="btn-ghost px-4 py-2 rounded-xl">
                <Icons.refresh className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Icons.search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by brand, model, or seller name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-mobile w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition-mobile"
            />
          </div>
        </div>

        {/* Listings Grid */}
        <div className="space-y-6">
          {filteredListings.length === 0 ? (
            <div className="card-mobile card-elevated p-12 text-center bg-white/80 backdrop-blur-sm">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Icons.inbox className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">No pending approvals</h3>
              <p className="text-gray-600">All listings have been reviewed. New submissions will appear here.</p>
            </div>
          ) : (
            filteredListings.map((listing) => (
              <div key={listing.id} className="card-mobile hover:card-elevated bg-white/80 backdrop-blur-sm border border-gray-200/60 p-6 transition-mobile">
                <div className="">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Device Images */}
                    <div className="lg:col-span-1">
                      <div className="grid grid-cols-2 gap-2">
                        {listing.images.slice(0, 4).map((image, index) => (
                          <div key={index} className="aspect-square rounded-lg overflow-hidden">
                            <img 
                              src={image} 
                              alt={`${listing.device.brand} ${listing.device.model}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Device Details */}
                    <div className="lg:col-span-2">
                      <div className="space-y-4">
                        {/* Device Info */}
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">
                            {listing.device.brand} {listing.device.model}
                          </h3>
                          <p className="text-gray-600">
                            {listing.device.storage} • {listing.device.color}
                          </p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge className={getConditionColor(listing.device.condition)}>
                              {listing.device.condition}
                            </Badge>
                            {listing.documentation.hasWarranty && (
                              <Badge variant="outline" className="text-green-600 border-green-200">
                                <Icons.shield className="w-3 h-3 mr-1" />
                                {listing.documentation.warrantyMonths}m warranty
                              </Badge>
                            )}
                            {listing.documentation.hasBill && (
                              <Badge variant="outline" className="text-blue-600 border-blue-200">
                                <Icons.fileText className="w-3 h-3 mr-1" />
                                Original bill
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Seller Info */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-2">Seller Information</h4>
                          <div className="space-y-1 text-sm">
                            <p><span className="text-gray-600">Name:</span> {listing.seller.name}</p>
                            <p><span className="text-gray-600">Phone:</span> {listing.seller.phone}</p>
                            <p><span className="text-gray-600">Location:</span> {listing.seller.location}</p>
                          </div>
                        </div>

                        {/* Description */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                          <p className="text-sm text-gray-700">{listing.description}</p>
                        </div>

                        {/* Technical Details */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">IMEI 1:</span>
                            <p className="font-mono">{listing.imei1}</p>
                          </div>
                          {listing.imei2 && (
                            <div>
                              <span className="text-gray-600">IMEI 2:</span>
                              <p className="font-mono">{listing.imei2}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Pricing and Actions */}
                    <div className="lg:col-span-1">
                      <div className="space-y-4">
                        {/* Pricing */}
                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200/50">
                          <div className="text-center">
                            <p className="text-sm text-blue-600 font-medium">Asking Price</p>
                            <p className="text-2xl font-bold text-blue-700 mt-1">
                              ₹{listing.pricing.askingPrice.toLocaleString()}
                            </p>
                            <p className="text-xs text-blue-600/80 mt-1">
                              Est. Market: ₹{listing.pricing.estimatedValue.toLocaleString()}
                            </p>
                          </div>
                        </div>

                        {/* Submission Date */}
                        <div className="bg-gray-50 rounded-xl p-3 text-center">
                          <p className="text-xs text-gray-500 font-medium">Submitted</p>
                          <p className="text-sm font-semibold text-gray-700">{formatDate(listing.submittedAt)}</p>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                          <button
                            onClick={() => handleApproveListing(listing.id)}
                            disabled={processingId === listing.id}
                            className="w-full btn-primary px-4 py-3 rounded-xl font-medium text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:opacity-50 flex items-center justify-center space-x-2 active-scale-sm transition-mobile"
                          >
                            {processingId === listing.id ? (
                              <Icons.spinner className="w-5 h-5 animate-spin" />
                            ) : (
                              <>
                                <Icons.check className="w-5 h-5" />
                                <span>Approve</span>
                              </>
                            )}
                          </button>
                          
                          <button
                            onClick={() => {
                              setSelectedListing(listing)
                              setIsRejectModalOpen(true)
                            }}
                            disabled={processingId === listing.id}
                            className="w-full btn-secondary px-4 py-3 rounded-xl font-medium text-red-600 border border-red-200 hover:bg-red-50 disabled:opacity-50 flex items-center justify-center space-x-2 active-scale-sm transition-mobile"
                          >
                            <Icons.x className="w-5 h-5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Rejection Modal */}
      <Modal 
        open={isRejectModalOpen} 
        onOpenChange={setIsRejectModalOpen}
        title="Reject Listing"
        description="Please provide a reason for rejecting this listing. This will be sent to the seller."
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for rejection
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g., Images are not clear, IMEI numbers don't match, description is incomplete..."
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setIsRejectModalOpen(false)
                setRejectionReason('')
                setSelectedListing(null)
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRejectListing}
              disabled={!rejectionReason.trim() || processingId === selectedListing?.id}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              {processingId === selectedListing?.id ? (
                <Icons.spinner className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Reject Listing
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
} 