'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Icons } from '@/components/ui/icons'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { useRouter } from 'next/navigation'
import sellikoClient from '@/selliko-client'
import { toast } from 'react-hot-toast'
import Header from '@/components/layout/header'

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
    email: string
    location: string
    fullAddress: string
    pincode: string
    landmark: string | null
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
    warrantyType: string | null
    warrantyExpiry: string | null
    purchaseDate: string | null
    purchasePrice: number | null
  }
  submittedAt: string
  description: string
  imei1: string
  imei2: string | null
  batteryHealth: string | null
  status: 'pending' | 'approved' | 'rejected'
  pickup: {
    address: string
    city: string
    state: string
    pincode: string
    landmark: string | null
    preferredTime: string
  }
  bankDetails: {
    accountHolderName: string | null
    bankName: string | null
    accountNumber: string | null
    ifscCode: string | null
  }
}

export default function PendingApprovals() {
  const { user } = useAuth()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [pendingListings, setPendingListings] = useState<any[]>([])
  const [isLoadingListings, setIsLoadingListings] = useState(false)
  const [listingsError, setListingsError] = useState<string | null>(null)
  const [rejectingListingId, setRejectingListingId] = useState<string | null>(null)
  const [rejectionMessage, setRejectionMessage] = useState('')

  // Fetch pending approval listings
  useEffect(() => {
    const fetchPendingListings = async () => {
      console.log('📋 [PENDING-APPROVALS] Fetching pending approval listings...')
      setIsLoadingListings(true)
      setListingsError(null)
      
      try {
        const response = await (sellikoClient.getListings as any)({
          status: 'pending_approval',
          limit: 1000,
          sort_by: 'created_at',
          sort_order: 'desc',
          include_images: true
        })
        
        console.log('📥 [PENDING-APPROVALS] Listings response:', {
          success: response.success,
          listingsCount: response.listings?.length || 0,
          error: response.error
        })
        
        if (response.success && response.listings) {
          // Transform API data to match the existing UI structure
          const transformedListings = response.listings.map((listing: any) => {
            const device = listing.devices?.[0] || {}
            const clientAddress = listing.addresses?.find((addr: any) => addr.type === 'client') || {}
            const pickupAddress = listing.addresses?.find((addr: any) => addr.type === 'pickup') || {}
            
            // Extract device images from the device object
            const deviceImages = [
              device.front_image_url,
              device.back_image_url,
              device.top_image_url,
              device.bottom_image_url,
              device.bill_image_url,
              device.warranty_image_url
            ].filter(Boolean) // Remove null/undefined values
            
            // Debug logging for images
            console.log(`📸 [PENDING-APPROVALS] Images for listing ${listing.id}:`, {
              deviceImages,
              deviceObject: device,
              imageFields: {
                front: device.front_image_url,
                back: device.back_image_url,
                top: device.top_image_url,
                bottom: device.bottom_image_url,
                bill: device.bill_image_url,
                warranty: device.warranty_image_url
              }
            })
            
            // Extract seller information with fallbacks
            const sellerName = listing.contact_name || 
                              clientAddress.contact_name || 
                              clientAddress.name || 
                              'Unknown Seller'
            
            const sellerPhone = listing.mobile_number || 
                               clientAddress.mobile_number || 
                               'N/A'
            
            const sellerEmail = clientAddress.email || 
                               listing.email || 
                               'N/A'
            
            // Debug logging for seller information
            console.log(`👤 [PENDING-APPROVALS] Seller info for listing ${listing.id}:`, {
              sellerName,
              sellerPhone,
              sellerEmail,
              rawListing: {
                contact_name: listing.contact_name,
                mobile_number: listing.mobile_number,
                email: listing.email
              },
              clientAddress: {
                contact_name: clientAddress.contact_name,
                mobile_number: clientAddress.mobile_number,
                email: clientAddress.email,
                name: clientAddress.name
              }
            })
            
            return {
              id: listing.id,
      device: {
                brand: device.brand || 'Unknown',
                model: device.model || 'Model',
                storage: device.storage || 'Unknown',
                color: device.color || 'Unknown',
                condition: device.condition || 'Unknown'
      },
      seller: {
                name: sellerName,
                phone: sellerPhone,
                email: sellerEmail,
                location: `${clientAddress.city || 'Unknown'}, ${clientAddress.state || 'Kerala'}`,
                fullAddress: clientAddress.address || 'Address not provided',
                pincode: clientAddress.pincode || 'N/A',
                landmark: clientAddress.landmark || null
      },
      pricing: {
                askingPrice: listing.expected_price || listing.asking_price || 0,
                estimatedValue: listing.expected_price || listing.asking_price || 0
      },
              images: deviceImages,
      documentation: {
                hasWarranty: device.warranty_status === 'active',
                hasBill: device.has_bill || false,
                warrantyMonths: device.warranty_expiry ? Math.ceil((new Date(device.warranty_expiry).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30)) : undefined,
                warrantyType: device.warranty_type || null,
                warrantyExpiry: device.warranty_expiry || null,
                purchaseDate: device.purchase_date || null,
                purchasePrice: device.purchase_price || null
              },
              submittedAt: listing.created_at,
              description: device.description || 'No description provided',
              imei1: device.imei1 || 'N/A',
              imei2: device.imei2 || null,
              batteryHealth: device.battery_health || null,
              status: 'pending',
              // Pickup information
              pickup: {
                address: pickupAddress.address || clientAddress.address || 'Same as contact address',
                city: pickupAddress.city || clientAddress.city || 'Unknown',
                state: pickupAddress.state || clientAddress.state || 'Kerala',
                pincode: pickupAddress.pincode || clientAddress.pincode || 'N/A',
                landmark: pickupAddress.landmark || clientAddress.landmark || null,
                preferredTime: pickupAddress.pickup_time || 'Not specified'
              },
              // Bank details (for admin review)
              bankDetails: {
                accountHolderName: clientAddress.account_holder_name || null,
                bankName: clientAddress.bank_name || null,
                accountNumber: clientAddress.account_number || null,
                ifscCode: clientAddress.ifsc_code || null
              }
            }
          })
          
          setPendingListings(transformedListings)
          console.log('✅ [PENDING-APPROVALS] Pending listings loaded:', transformedListings.length)
        } else {
          setListingsError(response.error || 'Failed to fetch listings')
          console.error('❌ [PENDING-APPROVALS] Failed to fetch listings:', response.error)
        }
      } catch (error: any) {
        console.error('💥 [PENDING-APPROVALS] Error fetching pending listings:', error)
        setListingsError(error.message || 'Network error occurred')
      } finally {
        setIsLoadingListings(false)
      }
    }

    // Fetch listings when component mounts
    fetchPendingListings()
  }, [])

  const filteredListings = pendingListings.filter((listing: any) =>
    listing.device.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.device.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.seller.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleApproveListing = async (listingId: string) => {
    console.log('✅ [PENDING-APPROVALS] Approving listing:', listingId)
    setProcessingId(listingId)
    
    try {
      const result = await sellikoClient.approveListing(listingId, true) as any
      
      if (result.success) {
        toast.success('Listing approved successfully!')
        console.log('✅ [PENDING-APPROVALS] Listing approved:', listingId)
        
        // Remove the approved listing from the pending list
        setPendingListings(prev => prev.filter((listing: any) => listing.id !== listingId))
      } else {
        toast.error(result.error || 'Failed to approve listing')
        console.error('❌ [PENDING-APPROVALS] Approval failed:', result.error)
      }
    } catch (error: any) {
      console.error('💥 [PENDING-APPROVALS] Approval error:', error)
      toast.error('Network error occurred while approving listing')
    } finally {
    setProcessingId(null)
    }
  }

  const handleRejectClick = (listingId: string) => {
    console.log('❌ [PENDING-APPROVALS] Initiating rejection for listing:', listingId)
    setRejectingListingId(listingId)
    setRejectionMessage('')
  }

  const handleRejectConfirm = async (listingId: string) => {
    console.log('❌ [PENDING-APPROVALS] Confirming rejection for listing:', listingId)
    
    if (!rejectionMessage.trim()) {
      toast.error('Please provide a rejection reason')
      return
    }
    
    setProcessingId(listingId)
    
    try {
      const result = await sellikoClient.approveListing(listingId, false, rejectionMessage.trim()) as any
      
      if (result.success) {
        toast.success('Listing rejected successfully!')
        console.log('❌ [PENDING-APPROVALS] Listing rejected:', listingId, 'Reason:', rejectionMessage)
        
        // Remove the rejected listing from the pending list
        setPendingListings(prev => prev.filter((listing: any) => listing.id !== listingId))
        
        // Reset rejection state
        setRejectingListingId(null)
        setRejectionMessage('')
      } else {
        toast.error(result.error || 'Failed to reject listing')
        console.error('❌ [PENDING-APPROVALS] Rejection failed:', result.error)
      }
    } catch (error: any) {
      console.error('💥 [PENDING-APPROVALS] Rejection error:', error)
      toast.error('Network error occurred while rejecting listing')
    } finally {
      setProcessingId(null)
    }
  }

  const handleRejectCancel = () => {
    console.log('🚫 [PENDING-APPROVALS] Cancelling rejection')
    setRejectingListingId(null)
    setRejectionMessage('')
  }

  // Legacy modal-based rejection for backward compatibility
  const handleRejectListing = async () => {
    if (!selectedListing || !rejectionReason.trim()) return
    
    await handleRejectConfirm(selectedListing.id)
    
    setIsRejectModalOpen(false)
    setSelectedListing(null)
    setRejectionReason('')
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
      <Header variant="admin" showBackButton />
      
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl flex items-center justify-center shadow-lg">
                <Icons.clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Pending Approvals</h1>
                <p className="text-sm text-gray-500">{filteredListings.length} pending review</p>
              </div>
            </div>
            
            <button className="btn-ghost px-4 py-2 rounded-xl" onClick={() => window.location.reload()}>
              <Icons.refresh className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

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
          {isLoadingListings ? (
            <div className="card-mobile card-elevated p-12 text-center bg-white/80 backdrop-blur-sm">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Icons.spinner className="w-8 h-8 text-orange-500 animate-spin" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Loading pending approvals</h3>
              <p className="text-gray-600">Fetching latest listings for review...</p>
            </div>
          ) : listingsError ? (
            <div className="card-mobile card-elevated p-12 text-center bg-white/80 backdrop-blur-sm">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Icons.alertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Failed to load listings</h3>
              <p className="text-red-600 mb-4">{listingsError}</p>
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline"
                size="sm"
              >
                <Icons.refresh className="w-4 h-4 mr-1" />
                Retry
              </Button>
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="card-mobile card-elevated p-12 text-center bg-white/80 backdrop-blur-sm">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Icons.inbox className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">No pending approvals</h3>
              <p className="text-gray-600">All listings have been reviewed. New submissions will appear here.</p>
            </div>
          ) : (
            filteredListings.map((listing: any) => (
              <div key={listing.id} className="card-mobile hover:card-elevated bg-white/80 backdrop-blur-sm border border-gray-200/60 overflow-hidden transition-mobile">
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Device Images */}
                    <div className="lg:col-span-1">
                      <div className="relative grid grid-cols-2 gap-2">
                        {listing.images.length > 0 ? (
                          listing.images.slice(0, 4).map((image: string, index: number) => (
                            <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                            <img 
                              src={image} 
                                alt={`${listing.device.brand} ${listing.device.model} - View ${index + 1}`}
                              className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/api/placeholder/200/200'
                                }}
                              />
                            </div>
                          ))
                        ) : (
                          // Show placeholder images when no images are available
                          Array.from({ length: 4 }).map((_, index) => (
                            <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                              <div className="text-center">
                                <Icons.camera className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                                <p className="text-xs text-gray-500">No Image</p>
                              </div>
                            </div>
                          ))
                        )}
                        {listing.images.length > 4 && (
                          <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                            +{listing.images.length - 4} more
                          </div>
                        )}
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

                        {/* Technical Details */}
                        <div className="bg-blue-50 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                            <Icons.smartphone className="w-4 h-4 mr-2" />
                            Technical Details
                          </h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">IMEI 1:</span>
                              <p className="font-mono text-gray-900">{listing.imei1}</p>
                            </div>
                            {listing.imei2 && (
                              <div>
                                <span className="text-gray-600">IMEI 2:</span>
                                <p className="font-mono text-gray-900">{listing.imei2}</p>
                              </div>
                            )}
                            {listing.batteryHealth && (
                              <div>
                                <span className="text-gray-600">Battery Health:</span>
                                <p className="text-gray-900">{listing.batteryHealth}%</p>
                              </div>
                            )}
                            {listing.documentation.purchaseDate && (
                              <div>
                                <span className="text-gray-600">Purchase Date:</span>
                                <p className="text-gray-900">{new Date(listing.documentation.purchaseDate).toLocaleDateString('en-IN')}</p>
                              </div>
                            )}
                            {listing.documentation.purchasePrice && (
                              <div>
                                <span className="text-gray-600">Original Price:</span>
                                <p className="text-gray-900">₹{listing.documentation.purchasePrice.toLocaleString()}</p>
                              </div>
                            )}
                            {listing.documentation.warrantyType && (
                              <div>
                                <span className="text-gray-600">Warranty Type:</span>
                                <p className="text-gray-900">{listing.documentation.warrantyType}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Seller Info */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                            <Icons.user className="w-4 h-4 mr-2" />
                            Seller Information
                          </h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Name:</span>
                              <p className="text-gray-900 font-medium">{listing.seller.name}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Phone:</span>
                              <p className="text-gray-900 font-mono">{listing.seller.phone}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Email:</span>
                              <p className="text-gray-900">{listing.seller.email}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">City:</span>
                              <p className="text-gray-900">{listing.seller.location}</p>
                            </div>
                            <div className="col-span-2">
                              <span className="text-gray-600">Full Address:</span>
                              <p className="text-gray-900">{listing.seller.fullAddress}</p>
                              {listing.seller.landmark && (
                                <p className="text-gray-600 text-xs mt-1">Landmark: {listing.seller.landmark}</p>
                              )}
                              <p className="text-gray-600 text-xs mt-1">Pincode: {listing.seller.pincode}</p>
                            </div>
                          </div>
                        </div>

                        {/* Pickup Information */}
                        <div className="bg-green-50 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                            <Icons.mapPin className="w-4 h-4 mr-2" />
                            Pickup Information
                          </h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="col-span-2">
                              <span className="text-gray-600">Pickup Address:</span>
                              <p className="text-gray-900">{listing.pickup.address}</p>
                              {listing.pickup.landmark && (
                                <p className="text-gray-600 text-xs mt-1">Landmark: {listing.pickup.landmark}</p>
                              )}
                            </div>
                            <div>
                              <span className="text-gray-600">City:</span>
                              <p className="text-gray-900">{listing.pickup.city}, {listing.pickup.state}</p>
                            </div>
                        <div>
                              <span className="text-gray-600">Pincode:</span>
                              <p className="text-gray-900">{listing.pickup.pincode}</p>
                            </div>
                            <div className="col-span-2">
                              <span className="text-gray-600">Preferred Time:</span>
                              <p className="text-gray-900 capitalize">{listing.pickup.preferredTime}</p>
                            </div>
                          </div>
                        </div>

                        {/* Bank Details (for admin review) */}
                        {(listing.bankDetails.accountHolderName || listing.bankDetails.bankName) && (
                          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                              <Icons.shield className="w-4 h-4 mr-2" />
                              Bank Details (Admin Only)
                            </h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                              {listing.bankDetails.accountHolderName && (
                                <div>
                                  <span className="text-gray-600">Account Holder:</span>
                                  <p className="text-gray-900">{listing.bankDetails.accountHolderName}</p>
                                </div>
                              )}
                              {listing.bankDetails.bankName && (
                                <div>
                                  <span className="text-gray-600">Bank:</span>
                                  <p className="text-gray-900">{listing.bankDetails.bankName}</p>
                                </div>
                              )}
                              {listing.bankDetails.accountNumber && (
                          <div>
                                  <span className="text-gray-600">Account Number:</span>
                                  <p className="text-gray-900 font-mono">****{listing.bankDetails.accountNumber.slice(-4)}</p>
                          </div>
                              )}
                              {listing.bankDetails.ifscCode && (
                            <div>
                                  <span className="text-gray-600">IFSC Code:</span>
                                  <p className="text-gray-900 font-mono">{listing.bankDetails.ifscCode}</p>
                                </div>
                              )}
                            </div>
                            </div>
                          )}

                        {/* Description */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                            <Icons.fileText className="w-4 h-4 mr-2" />
                            Description
                          </h4>
                          <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{listing.description}</p>
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
                            disabled={processingId === listing.id || rejectingListingId === listing.id}
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
                          
                          {rejectingListingId === listing.id ? (
                            // Show cancel button when in rejection mode
                            <button
                              onClick={handleRejectCancel}
                              disabled={processingId === listing.id}
                              className="w-full btn-secondary px-4 py-3 rounded-xl font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center space-x-2 active-scale-sm transition-mobile"
                            >
                              <Icons.x className="w-5 h-5" />
                              <span>Cancel</span>
                            </button>
                          ) : (
                            // Show reject button when not in rejection mode
                          <button
                              onClick={() => handleRejectClick(listing.id)}
                            disabled={processingId === listing.id}
                            className="w-full btn-secondary px-4 py-3 rounded-xl font-medium text-red-600 border border-red-200 hover:bg-red-50 disabled:opacity-50 flex items-center justify-center space-x-2 active-scale-sm transition-mobile"
                          >
                            <Icons.x className="w-5 h-5" />
                            <span>Reject</span>
                          </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Rejection message input - only show when rejecting this listing */}
                {rejectingListingId === listing.id && (
                  <div className="border-t border-gray-200 bg-red-50 p-4">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Reason for rejection <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={rejectionMessage}
                          onChange={(e) => setRejectionMessage(e.target.value)}
                          placeholder="e.g., Device specifications do not meet our requirements, Images are not clear, etc."
                          rows={3}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                          disabled={processingId === listing.id}
                        />
                      </div>
                      
                      <div className="flex justify-end space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleRejectCancel}
                          disabled={processingId === listing.id}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleRejectConfirm(listing.id)}
                          disabled={processingId === listing.id || !rejectionMessage.trim()}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          {processingId === listing.id ? (
                            <>
                              <Icons.spinner className="w-4 h-4 mr-1 animate-spin" />
                              Rejecting...
                            </>
                          ) : (
                            <>
                              <Icons.x className="w-4 h-4 mr-1" />
                              Confirm Reject
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
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