"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Icons } from '@/components/ui/icons'
import { Badge } from '@/components/ui/badge'
import { useRouter, useParams } from 'next/navigation'
import sellikoClient from '@/selliko-client'
import ZoomableImage from '@/components/shared/ZoomableImage'
import VerificationDetailsModal from '@/components/shared/VerificationDetailsModal'


export default function AdminListingDetailPage() {
  const router = useRouter()
  const params = useParams()
  const listingId = params.id as string

  const [device, setDevice] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isVerificationOpen, setIsVerificationOpen] = useState(false)

  useEffect(() => {
    const loadDeviceData = async () => {
      if (!listingId) {
        setError('No listing ID provided')
        setIsLoading(false)
        return
      }
      setIsLoading(true)
      setError(null)
      try {
        const result = await sellikoClient.getListingById(listingId, {
          include_images: true,
          include_bids: false,
          include_user_details: true // Admin can see more details
        })
        if ((result as any).success && (result as any).listing) {
          const apiListing = (result as any).listing
          const transformedDevice = {
            id: apiListing.id,
            device: `${apiListing.devices?.[0]?.brand || 'Unknown'} ${apiListing.devices?.[0]?.model || 'Device'}`,
            model: `${apiListing.devices?.[0]?.storage || ''} ${apiListing.devices?.[0]?.color || ''}`.trim(),
            condition: apiListing.devices?.[0]?.condition || 'Unknown',
            askingPrice: apiListing.asking_price || apiListing.expected_price || 0,
            description: apiListing.devices?.[0]?.description || 'No description available',
            images: getDeviceImages(apiListing),
            status: transformStatus(apiListing.status),
            brand: apiListing.devices?.[0]?.brand,
            storage: apiListing.devices?.[0]?.storage,
            color: apiListing.devices?.[0]?.color,
            ram: apiListing.devices?.[0]?.ram || '',
            created_at: apiListing.created_at,
            updated_at: apiListing.updated_at,
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
            location: apiListing.addresses?.find((addr: any) => addr.type === 'pickup')?.city || 
                     apiListing.addresses?.find((addr: any) => addr.type === 'client')?.city || 
                     'Location not specified',
            // Admin can see more fields if needed
            client: apiListing.client || null,
            owner: apiListing.owner || null,
            verification: apiListing.verification || null
          }
          setDevice(transformedDevice)
        } else {
          const errorMsg = (result as any).error || 'Failed to load listing data'
          setError(errorMsg)
        }
      } catch (error) {
        setError('Network error while loading listing')
      } finally {
        setIsLoading(false)
      }
    }
    loadDeviceData()
  }, [listingId])

  const getDeviceImages = (apiListing: any) => {
    const device = apiListing.devices?.[0] || {}
    return {
      front: device.front_image_url || '/api/placeholder/400/400',
      back: device.back_image_url || '/api/placeholder/400/400',
      top: device.top_image_url || '/api/placeholder/400/400',
      bottom: device.bottom_image_url || '/api/placeholder/400/400',
      bill: device.bill_image_url,
      warranty: device.warranty_image_url
    }
  }

  const transformStatus = (apiStatus: string) => {
    if (!apiStatus) return 'unknown'
    const normalizedStatus = apiStatus.toLowerCase().trim()
    switch (normalizedStatus) {
      case 'pending':
      case 'pending_approval':
      case 'draft':
        return 'pending_approval'
      case 'approved':
      case 'receiving_bids':
      case 'accepting_bids':
      case 'active':
        return 'active'
      case 'bid_accepted':
      case 'won':
      case 'accepted':
        return 'bid_accepted'
      case 'completed':
      case 'sold':
      case 'delivered':
        return 'sold'
      case 'rejected':
      case 'cancelled':
      case 'declined':
        return 'rejected'
      default:
        return normalizedStatus || 'unknown'
    }
  }

  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(1)} Cr`
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)} L`
    } else if (price >= 1000) {
      return `₹${(price / 1000).toFixed(1)} K`
    } else {
      return `₹${price}`
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-2xl mb-4">
            <Icons.spinner className="w-8 h-8 text-white animate-spin" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Listing Details</h2>
          <p className="text-gray-600">Getting listing information...</p>
        </div>
      </div>
    )
  }

  if (error || !device) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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

  // Status badge info
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'active':
        return {
          label: 'Available',
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: Icons.check,
          description: 'This device is available for viewing'
        }
      case 'pending_approval':
        return {
          label: 'Under Review',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: Icons.clock,
          description: 'Device is under review'
        }
      case 'bid_accepted':
        return {
          label: 'Bid Accepted',
          color: 'bg-purple-100 text-purple-800 border-purple-200',
          icon: Icons.check,
          description: 'A bid has been accepted for this device'
        }
      case 'sold':
        return {
          label: 'Sold',
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: Icons.check,
          description: 'This device has been sold'
        }
      case 'rejected':
        return {
          label: 'Rejected',
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: Icons.x,
          description: 'Device was rejected during review'
        }
      case 'unknown':
        return {
          label: 'Status Unknown',
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: Icons.alertCircle,
          description: 'Device status is not available'
        }
      default:
        return {
          label: status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown',
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: Icons.smartphone,
          description: `Status: ${status || 'Unknown'}`
        }
    }
  }

  const statusInfo = getStatusInfo(device.status)
  const StatusIcon = statusInfo.icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{device.device}</h1>
              <p className="text-sm text-gray-600">
                {device.model}
                {device.storage && ` | Storage: ${device.storage}`}
                {device.ram && ` | RAM: ${device.ram}`}
                {device.color && ` | Color: ${device.color}`}
              </p>
            </div>
            <Badge className={`${statusInfo.color} border font-medium w-fit`}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {statusInfo.label}
            </Badge>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-square bg-gray-100">
                  <div className="grid grid-cols-2 gap-1 h-full">
                    <div className="relative bg-gray-200 overflow-hidden">
                      <ZoomableImage
                        src={device.images.front}
                        alt={`${device.device} - Front View`}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/api/placeholder/400/400'
                        }}
                      />
                    </div>
                    <div className="relative bg-gray-200 overflow-hidden">
                      <ZoomableImage
                        src={device.images.back}
                        alt={`${device.device} - Back View`}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/api/placeholder/400/400'
                        }}
                      />
                    </div>
                    <div className="relative bg-gray-200 overflow-hidden">
                      <ZoomableImage
                        src={device.images.top}
                        alt={`${device.device} - Top View`}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/api/placeholder/400/400'
                        }}
                      />
                    </div>
                    <div className="relative bg-gray-200 overflow-hidden">
                      <ZoomableImage
                        src={device.images.bottom}
                        alt={`${device.device} - Bottom View`}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/api/placeholder/400/400'
                        }}
                      />
                    </div>
                  </div>
                  <div className="absolute top-3 left-3 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                    Device Images (4 views)
                  </div>
                  {(device.images.bill || device.images.warranty) && (
                    <div className="absolute top-3 right-3 bg-blue-600 text-white px-2 py-1 rounded text-xs">
                      + Documents Available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Icons.smartphone className="w-5 h-5" />
                  <span>Device Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Storage</p>
                    <p className="text-lg font-semibold text-gray-900">{device.storage || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">RAM</p>
                    <p className="text-lg font-semibold text-gray-900">{device.ram || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Color</p>
                    <p className="text-lg font-semibold text-gray-900">{device.color || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Condition</p>
                    <p className="text-lg font-semibold text-gray-900">{device.condition}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Asking Price</p>
                    <p className="text-lg font-semibold text-gray-900">{formatPrice(device.askingPrice)}</p>
                  </div>
                </div>
                {device.deviceDetails && (
                  <>
                    <div className="border-t pt-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Technical Information</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {device.deviceDetails.battery_health && (
                          <div>
                            <p className="text-sm font-medium text-gray-500">Battery Health</p>
                            <p className="text-sm text-gray-900">{device.deviceDetails.battery_health}%</p>
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-500">Has Original Bill</p>
                          <p className="text-sm text-gray-900">
                            {device.deviceDetails.has_bill ? '✅ Yes' : '❌ No'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Purchase & Warranty</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {device.deviceDetails.purchase_date && (
                          <div>
                            <p className="text-sm font-medium text-gray-500">Purchase Date</p>
                            <p className="text-sm text-gray-900">{formatDate(device.deviceDetails.purchase_date)}</p>
                          </div>
                        )}
                        {device.deviceDetails.warranty_status && (
                          <div>
                            <p className="text-sm font-medium text-gray-500">Warranty Status</p>
                            <p className="text-sm text-gray-900 capitalize">{device.deviceDetails.warranty_status}</p>
                          </div>
                        )}
                        {device.deviceDetails.warranty_expiry && (
                          <div>
                            <p className="text-sm font-medium text-gray-500">Warranty Expiry</p>
                            <p className="text-sm text-gray-900">{formatDate(device.deviceDetails.warranty_expiry)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-gray-500 mb-2">Description</p>
                  <p className="text-gray-700 leading-relaxed">{device.description}</p>
                </div>
                {(device.images.bill || device.images.warranty) && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Icons.fileText className="w-5 h-5 text-gray-500" />
                      Uploaded Documents
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {device.images.bill && (
                        <div className="border border-gray-200/60 rounded-xl p-4 flex flex-col bg-gray-50/50">
                          <p className="text-sm font-semibold text-gray-700 mb-2 text-center">Purchase Bill/Invoice</p>
                          <div className="w-full aspect-[4/3] relative rounded-lg overflow-hidden border bg-white mb-3 max-h-[200px]">
                            <ZoomableImage
                              src={device.images.bill}
                              alt="Purchase Bill"
                            />
                          </div>
                          <a 
                            href={device.images.bill} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="inline-flex items-center justify-center text-sm text-blue-600 hover:text-blue-800 font-semibold mt-auto"
                          >
                            <Icons.download className="w-4 h-4 mr-1.5" />
                            Open Original Bill
                          </a>
                        </div>
                      )}
                      {device.images.warranty && (
                        <div className="border border-gray-200/60 rounded-xl p-4 flex flex-col bg-gray-50/50">
                          <p className="text-sm font-semibold text-gray-700 mb-2 text-center">Warranty Certificate</p>
                          <div className="w-full aspect-[4/3] relative rounded-lg overflow-hidden border bg-white mb-3 max-h-[200px]">
                            <ZoomableImage
                              src={device.images.warranty}
                              alt="Warranty Certificate"
                            />
                          </div>
                          <a 
                            href={device.images.warranty} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="inline-flex items-center justify-center text-sm text-blue-600 hover:text-blue-800 font-semibold mt-auto"
                          >
                            <Icons.download className="w-4 h-4 mr-1.5" />
                            Open Original Warranty
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>Listed on: {formatDate(device.created_at)}</span>
                    <span>Location: {device.location}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-600 to-green-700 rounded-2xl">
                    <StatusIcon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{statusInfo.description}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Admin Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {device.verification && (
                  <Button 
                    onClick={() => setIsVerificationOpen(true)}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    size="lg"
                  >
                    <Icons.fileText className="w-4 h-4 mr-2" />
                    Verification Report
                  </Button>
                )}
                <Button 
                  onClick={() => router.push('/admin/listings')}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  <Icons.arrowLeft className="w-4 h-4 mr-2" />
                  Back to Listings
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <VerificationDetailsModal
        isOpen={isVerificationOpen}
        onClose={() => setIsVerificationOpen(false)}
        verification={device.verification}
        deviceTitle={device.device}
        deviceModel={device.model}
      />
    </div>
  )
}
