'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Icons } from '@/components/ui/icons'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import sellikoClient from '@/selliko-client'
import { toast } from 'react-hot-toast'
import Header from '@/components/layout/header'

export default function VendorDeviceDetailPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const deviceId = params.id as string

  // State for device data and loading
  const [device, setDevice] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load device data when page loads
  useEffect(() => {
    const loadDeviceData = async () => {
      if (!deviceId) {
        setError('No device ID provided')
        setIsLoading(false)
        return
      }

      console.log('🔍 [VENDOR-DEVICE-DETAIL] Loading device data for ID:', deviceId)
      setIsLoading(true)
      setError(null)

      try {
        // Call getListingById function from selliko-client
        const result = await sellikoClient.getListingById(deviceId, {
          include_images: true,
          include_bids: false, // Don't need bid data for device detail view
          include_user_details: false // Don't need sensitive user details for vendors
        })

        console.log('📊 [VENDOR-DEVICE-DETAIL] Received device data:', result)

        if ((result as any).success && (result as any).listing) {
          const apiListing = (result as any).listing
          
          // Transform API data to match component format
          const transformedDevice = {
            id: apiListing.id,
            device: `${apiListing.devices?.[0]?.brand || 'Unknown'} ${apiListing.devices?.[0]?.model || 'Device'}`,
            model: `${apiListing.devices?.[0]?.storage || ''} ${apiListing.devices?.[0]?.color || ''}`.trim(),
            condition: apiListing.devices?.[0]?.condition || 'Unknown',
            askingPrice: apiListing.asking_price || apiListing.expected_price || 0,
            description: apiListing.devices?.[0]?.description || 'No description available',
            images: getDeviceImages(apiListing),
            status: transformStatus(apiListing.status),
            // Additional data from API
            brand: apiListing.devices?.[0]?.brand,
            storage: apiListing.devices?.[0]?.storage,
            color: apiListing.devices?.[0]?.color,
            created_at: apiListing.created_at,
            updated_at: apiListing.updated_at,
            // Device specific details
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
            // Address information (limited for vendors)
            location: apiListing.addresses?.find((addr: any) => addr.type === 'pickup')?.city || 
                     apiListing.addresses?.find((addr: any) => addr.type === 'client')?.city || 
                     'Location not specified'
          }

          console.log('🔄 [VENDOR-DEVICE-DETAIL] Transformed device data:', transformedDevice)
          setDevice(transformedDevice)
          toast.success('Device details loaded successfully')
        } else {
          const errorMsg = (result as any).error || 'Failed to load device data'
          setError(errorMsg)
          toast.error(errorMsg)
          console.error('❌ [VENDOR-DEVICE-DETAIL] Failed to load device:', errorMsg)
        }
      } catch (error) {
        console.error('💥 [VENDOR-DEVICE-DETAIL] Error loading device:', error)
        const errorMsg = 'Network error while loading device'
        setError(errorMsg)
        toast.error(errorMsg)
      } finally {
        setIsLoading(false)
      }
    }

    loadDeviceData()
  }, [deviceId])

  // Helper function to get device images
  const getDeviceImages = (apiListing: any) => {
    // Get the first device from the devices array
    const device = apiListing.devices?.[0] || {}
    
    // Return the 4 main device images from the device object
    return {
      front: device.front_image_url || '/api/placeholder/400/400',
      back: device.back_image_url || '/api/placeholder/400/400',
      top: device.top_image_url || '/api/placeholder/400/400',
      bottom: device.bottom_image_url || '/api/placeholder/400/400',
      // Additional images for potential use
      bill: device.bill_image_url,
      warranty: device.warranty_image_url
    }
  }

  // Helper function to transform API status to component status
  const transformStatus = (apiStatus: string) => {
    console.log('🔄 [VENDOR-DEVICE-DETAIL] Transforming status:', apiStatus)
    
    if (!apiStatus) {
      console.warn('⚠️ [VENDOR-DEVICE-DETAIL] No status provided, defaulting to unknown')
      return 'unknown'
    }
    
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
        console.warn('⚠️ [VENDOR-DEVICE-DETAIL] Unknown status:', apiStatus)
        return normalizedStatus || 'unknown'
    }
  }

  // Helper function to format price in Indian format
  const formatPrice = (price: number) => {
    if (price >= 10000000) { // 1 crore or more
      return `₹${(price / 10000000).toFixed(1)} Cr`
    } else if (price >= 100000) { // 1 lakh or more
      return `₹${(price / 100000).toFixed(1)} L`
    } else if (price >= 1000) { // 1 thousand or more
      return `₹${(price / 1000).toFixed(1)} K`
    } else {
      return `₹${price}`
    }
  }

  // Helper function to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-2xl mb-4">
            <Icons.spinner className="w-8 h-8 text-white animate-spin" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Device Details</h2>
          <p className="text-gray-600">Getting device information...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error || !device) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-2xl mb-4">
            <Icons.x className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Device</h2>
          <p className="text-gray-600 mb-4">{error || 'Device not found'}</p>
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

  const getStatusInfo = (status: string) => {
    console.log('🎯 [VENDOR-DEVICE-DETAIL] Getting status info for:', status)
    
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
        console.warn('⚠️ [VENDOR-DEVICE-DETAIL] Unhandled status in getStatusInfo:', status)
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
      <Header variant="vendor" showBackButton />
      
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{device.device}</h1>
              <p className="text-sm text-gray-600">{device.model}</p>
            </div>
            
            <Badge className={`${statusInfo.color} border font-medium`}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {statusInfo.label}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-square bg-gray-100">
                  {/* 2x2 Grid for Device Images */}
                  <div className="grid grid-cols-2 gap-1 h-full">
                    {/* Front Image - Top Left */}
                    <div className="relative bg-gray-200 group cursor-pointer hover:opacity-90 transition-opacity">
                      <img 
                        src={device.images.front}
                        alt={`${device.device} - Front View`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/api/placeholder/400/400'
                        }}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                        <span className="text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
                          Front View
                        </span>
                      </div>
                    </div>

                    {/* Back Image - Top Right */}
                    <div className="relative bg-gray-200 group cursor-pointer hover:opacity-90 transition-opacity">
                      <img 
                        src={device.images.back}
                        alt={`${device.device} - Back View`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/api/placeholder/400/400'
                        }}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                        <span className="text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
                          Back View
                        </span>
                      </div>
                    </div>

                    {/* Top Image - Bottom Left */}
                    <div className="relative bg-gray-200 group cursor-pointer hover:opacity-90 transition-opacity">
                      <img 
                        src={device.images.top}
                        alt={`${device.device} - Top View`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/api/placeholder/400/400'
                        }}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                        <span className="text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
                          Top View
                        </span>
                      </div>
                    </div>

                    {/* Bottom Image - Bottom Right */}
                    <div className="relative bg-gray-200 group cursor-pointer hover:opacity-90 transition-opacity">
                      <img 
                        src={device.images.bottom}
                        alt={`${device.device} - Bottom View`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/api/placeholder/400/400'
                        }}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                        <span className="text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
                          Bottom View
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Image Info Overlay */}
                  <div className="absolute top-3 left-3 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                    Device Images (4 views)
                  </div>
                  
                  {/* Additional Images Indicator */}
                  {(device.images.bill || device.images.warranty) && (
                    <div className="absolute top-3 right-3 bg-blue-600 text-white px-2 py-1 rounded text-xs">
                      + Documents Available
                    </div>
                  )}
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
              <CardContent className="space-y-6">
                {/* Basic Info Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Brand & Model</p>
                    <p className="text-lg font-semibold text-gray-900">{device.device}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Storage & Color</p>
                    <p className="text-lg font-semibold text-gray-900">{device.model}</p>
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

                {/* Technical Details */}
                {device.deviceDetails && (
                  <>
                    <div className="border-t pt-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Technical Information</h4>
                      <div className="grid grid-cols-2 gap-4">
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

                    {/* Purchase & Warranty Info */}
                    <div className="border-t pt-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Purchase & Warranty</h4>
                      <div className="grid grid-cols-2 gap-4">
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

                {/* Description */}
                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-gray-500 mb-2">Description</p>
                  <p className="text-gray-700 leading-relaxed">{device.description}</p>
                </div>

                {/* Device Info */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>Listed on: {formatDate(device.created_at)}</span>
                    <span>Location: {device.location}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Status & Actions */}
          <div className="space-y-6">
            {/* Current Status */}
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

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Vendor Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Back to Marketplace */}
                <Button 
                  onClick={() => router.push('/vendor/marketplace')}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  <Icons.arrowLeft className="w-4 h-4 mr-2" />
                  Back to Marketplace
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}