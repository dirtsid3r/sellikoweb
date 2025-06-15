'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Icons } from '@/components/ui/icons'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import sellikoClient from '@/selliko-client'
import { toast } from 'react-hot-toast'

// Helper function to calculate time remaining based on approval time
const calculateTimeRemaining = (timeApproved: string | null, status: string): string => {
  // Only show time calculation for receiving_bids status
  if (status !== 'receiving_bids') {
    return 'Pending approval'
  }

  if (!timeApproved) {
    return 'Pending approval'
  }

  try {
    const approvedTime = new Date(timeApproved)
    const endTime = new Date(approvedTime.getTime() + (24 * 60 * 60 * 1000)) // Add 24 hours
    const now = new Date()
    const timeLeft = endTime.getTime() - now.getTime()

    // No negative time - minimum 0m
    if (timeLeft <= 0) {
      return '0m left'
    }

    const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60))
    const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))

    if (hoursLeft > 0) {
      return `${hoursLeft}h ${minutesLeft}m left`
    } else if (minutesLeft > 0) {
      return `${minutesLeft}m left`
    } else {
      return '0m left'
    }
  } catch (error) {
    console.error('Error calculating time remaining:', error)
    return 'Pending approval'
  }
}

// Helper function to get time remaining status color
const getTimeRemainingColor = (timeRemaining: string): string => {
  if (timeRemaining.includes('Pending') || timeRemaining === '0m left') {
    return 'text-gray-600'
  }
  
  // Extract hours if present
  const hoursMatch = timeRemaining.match(/(\d+)h/)
  const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0
  
  if (hours < 1) {
    return 'text-red-600' // Less than 1 hour - red
  } else if (hours < 6) {
    return 'text-orange-600' // Less than 6 hours - orange
  } else {
    return 'text-green-600' // More than 6 hours - green
  }
}

export default function ClientDashboard() {
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isAuthChecking, setIsAuthChecking] = useState(true)
  const [currentListings, setCurrentListings] = useState<any[]>([])
  const [isLoadingListings, setIsLoadingListings] = useState(true)
  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now())

  // Update time remaining every minute for real-time countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdateTime(Date.now())
      // This will cause listings to re-render with updated time calculations
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  // Re-calculate time remaining when lastUpdateTime changes
  const updateListingTimes = (listings: any[]) => {
    return listings.map(listing => ({
      ...listing,
      timeLeft: calculateTimeRemaining(listing.time_approved, listing.status)
    }))
  }

  useEffect(() => {
    const checkAuthAndRole = async () => {
      console.log('🔒 [CLIENT-DASH] Checking authentication and role...')
      try {
        const user = await sellikoClient.getCurrentUser()
        console.log('👤 [CLIENT-DASH] Current user:', user ? {
          id: user.id,
          role: user.user_role,
        } : 'No user found')
        
        if (!user) {
          console.log('❌ [CLIENT-DASH] No user found, redirecting to login')
          toast.error('Please login to continue')
          router.replace('/login')
          return
        }

        const userRole = (user.user_role || user.role || '').toLowerCase()
        console.log('👑 [CLIENT-DASH] User role:', userRole)
        
        if (userRole !== 'client') {
          console.log(`⚠️ [CLIENT-DASH] Invalid role access attempt: ${userRole}`)
          toast.error('Access denied. Redirecting to your dashboard.')
          router.replace(`/${userRole}`)
          return
        }

        console.log('✅ [CLIENT-DASH] Role verification successful')
        setIsAuthChecking(false)
      } catch (error) {
        console.error('💥 [CLIENT-DASH] Auth check error:', error)
        toast.error('Authentication error')
        router.replace('/login')
      }
    }

    checkAuthAndRole()
  }, [router])

  const handleLogout = () => {
    console.log('🔄 [CLIENT-DASH] Logout button clicked')
    setIsLoggingOut(true)
    router.push('/logout')
  }

  // Transform API listing data to match card format
  const transformListingData = (apiListing: any) => {
    const device = apiListing.devices?.[0] || {}
    
    // Create full device title: Brand Model Storage Color
    const brand = device.brand || 'Unknown'
    const model = device.model || 'Device'
    const storage = device.storage || ''
    const color = device.color || ''
    
    const deviceName = [brand, model, storage, color].filter(Boolean).join(' ')
    
    // Get ALL available images (device images + bill/warranty as fallbacks)
    const availableImages = [
      // Device images (priority)
      device.front_image_url,
      device.back_image_url, 
      device.top_image_url,
      device.bottom_image_url,
      // Bill and warranty images as fallbacks
      device.bill_image_url,
      device.warranty_image_url
    ].filter(Boolean) // Remove null/undefined values
    
    // Use a solid color placeholder if no images available
    const image = availableImages.length > 0 ? availableImages[0] : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMjUgMTAwSDE3NVYxMjVIMTc1VjE3NUgxMjVWMTAwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K'
    
    console.log('🖼️ [CLIENT-DASH] Image analysis for listing', apiListing.id, ':', {
      deviceImages: {
        front: device.front_image_url ? 'Available' : 'NULL',
        back: device.back_image_url ? 'Available' : 'NULL',
        top: device.top_image_url ? 'Available' : 'NULL',
        bottom: device.bottom_image_url ? 'Available' : 'NULL'
      },
      fallbackImages: {
        bill: device.bill_image_url ? 'Available' : 'NULL',
        warranty: device.warranty_image_url ? 'Available' : 'NULL'
      },
      selectedImage: image,
      totalAvailable: availableImages.length,
      actualUrls: availableImages
    })

    return {
      id: apiListing.id,
      device: deviceName,
      status: apiListing.status === 'pending' ? 'pending_approval' : apiListing.status,
      currentBid: apiListing.highest_bid || 0,
      askingPrice: apiListing.asking_price || apiListing.expected_price || 0,
      bidsCount: Array.isArray(apiListing.bids) ? apiListing.bids.length : 0,
      timeLeft: calculateTimeRemaining(apiListing.time_approved, apiListing.status),
      image: image,
      storage: device.storage,
      condition: device.condition,
      color: device.color,
      created_at: apiListing.created_at,
      // Include all available images for potential use
      allImages: {
        front: device.front_image_url,
        back: device.back_image_url,
        top: device.top_image_url,
        bottom: device.bottom_image_url,
        bill: device.bill_image_url,
        warranty: device.warranty_image_url
      },
      // Include time_approved for real-time calculations
      time_approved: apiListing.time_approved
    }
  }

  // Load user listings when authentication is complete
  useEffect(() => {
    const loadListings = async () => {
      if (isAuthChecking || isLoading) {
        console.log('⏳ [CLIENT-DASH] Waiting for auth check to complete...')
        return
      }

      console.log('📋 [CLIENT-DASH] Loading user listings...')
      setIsLoadingListings(true)
      
      try {
        // Get current user's listings
        console.log('👤 [CLIENT-DASH] Calling getMyListings()...')
        const myListingsResult = await sellikoClient.getMyListings({
          limit: 10,
          sort_by: 'created_at',
          sort_order: 'desc'
        } as any)
        
        console.log('📊 [CLIENT-DASH] My listings result:', myListingsResult)
        
        if ((myListingsResult as any).success && (myListingsResult as any).listings) {
          // Transform API data to match card format
          const transformedListings = (myListingsResult as any).listings.map(transformListingData)
          console.log('🔄 [CLIENT-DASH] Transformed listings:', transformedListings)
          setCurrentListings(transformedListings)
        } else {
          console.warn('⚠️ [CLIENT-DASH] Failed to load listings or no listings found')
          setCurrentListings([])
        }
        
      } catch (error) {
        console.error('💥 [CLIENT-DASH] Error loading listings:', error)
        setCurrentListings([])
      } finally {
        setIsLoadingListings(false)
      }
    }

    loadListings()
  }, [isAuthChecking, isLoading])

  if (isLoading || isAuthChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <Icons.spinner className="w-8 h-8 text-white animate-spin" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Dashboard</h2>
          <p className="text-gray-600">Getting your listings ready...</p>
        </div>
      </div>
    )
  }

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
      case 'pending':
        return {
          label: 'Under Review',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: Icons.clock,
          description: 'Our team is reviewing your listing'
        }
      case 'approved':
        return {
          label: 'Approved',
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: Icons.check,
          description: 'Your listing is approved and live'
        }
      case 'bid_accepted':
        return {
          label: 'Bid Accepted',
          color: 'bg-purple-100 text-purple-800 border-purple-200',
          icon: Icons.check,
          description: 'Agent will contact you for pickup'
        }
      case 'pickup_scheduled':
        return {
          label: 'Pickup Scheduled',
          color: 'bg-orange-100 text-orange-800 border-orange-200',
          icon: Icons.calendar,
          description: 'Your device pickup is confirmed'
        }
      case 'completed':
        return {
          label: 'Completed',
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: Icons.check,
          description: 'Transaction completed successfully'
        }
      case 'rejected':
        return {
          label: 'Rejected',
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: Icons.x,
          description: 'Listing was rejected - please review requirements'
        }
      case 'cancelled':
        return {
          label: 'Cancelled',
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: Icons.x,
          description: 'Listing was cancelled'
        }
      default:
        return {
          label: status.charAt(0).toUpperCase() + status.slice(1),
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: Icons.smartphone,
          description: `Status: ${status}`
        }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/60 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <Icons.smartphone className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">SELLIKO</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Your device marketplace</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-900">{user?.name || 'Test User 1'}</p>
                <p className="text-xs text-gray-500">Ready to sell?</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="hover:bg-gray-100"
              >
                {isLoggingOut ? (
                  <Icons.spinner className="w-4 h-4 animate-spin" />
                ) : (
                  <Icons.logOut className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="mb-6 sm:mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-blue-700/90"></div>
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                Ready to sell your phone?
              </h2>
              <p className="text-blue-100 mb-4 sm:mb-6 text-base sm:text-lg">
                Get competitive bids from verified buyers within 24 hours
              </p>
              <Link href="/client/list-device">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-50 font-semibold w-full sm:w-auto">
                  <Icons.plus className="w-5 h-5 mr-2" />
                  List Your Device
                </Button>
              </Link>
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 sm:w-32 sm:h-32 opacity-20">
              <Icons.smartphone className="w-full h-full" />
            </div>
          </div>
        </div>

        {/* Current Listings - Airbnb Style Cards */}
        {isLoadingListings ? (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Your Active Listings</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="border-0 shadow-lg bg-white rounded-2xl">
                  <CardContent className="p-0">
                    <div className="aspect-square bg-gray-200 animate-pulse"></div>
                    <div className="p-6">
                      <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse mb-4 w-3/4"></div>
                      <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : currentListings.length > 0 ? (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Your Active Listings</h3>
              <Link href="/client/my-listings">
                <Button variant="outline" size="sm">
                  <Icons.list className="w-4 h-4 mr-2" />
                  View All Listings
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {updateListingTimes(currentListings).map((listing) => {
                const statusInfo = getStatusInfo(listing.status)
                const StatusIcon = statusInfo.icon
                
                return (
                  <Card key={`${listing.id}-${lastUpdateTime}`} className="group overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-500 border-0 shadow-lg bg-white cursor-pointer rounded-2xl"
                    onClick={() => router.push(`/client/listings/${listing.id}`)}>
                    <CardContent className="p-0">
                      {/* Device Image */}
                      <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
                        <img 
                          src={listing.image} 
                          alt={listing.device}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            console.warn('🖼️ [CLIENT-DASH] Image failed to load:', listing.image, 'for listing:', listing.id)
                            // Try alternative images if available
                            const target = e.target as HTMLImageElement
                            if (listing.allImages && !target.dataset.retried) {
                              const alternatives = [
                                listing.allImages.front,
                                listing.allImages.back,
                                listing.allImages.top,
                                listing.allImages.bottom,
                                listing.allImages.bill,
                                listing.allImages.warranty
                              ].filter(Boolean).filter(url => url !== listing.image)
                              
                              if (alternatives.length > 0) {
                                target.dataset.retried = 'true'
                                target.src = alternatives[0]
                                console.log('🔄 [CLIENT-DASH] Trying alternative image:', alternatives[0])
                                return
                              }
                            }
                            // Final fallback - solid SVG placeholder
                            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMjUgMTAwSDE3NVYxMjVIMTc1VjE3NUgxMjVWMTAwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K'
                            console.log('📷 [CLIENT-DASH] Using SVG placeholder for listing:', listing.id)
                          }}
                          onLoad={() => {
                            console.log('✅ [CLIENT-DASH] Image loaded successfully:', listing.image, 'for listing:', listing.id)
                          }}
                        />
                        {/* Subtle overlay for better badge contrast */}
                        <div className="absolute inset-0 bg-black/5"></div>
                        
                        <Badge className={`absolute top-4 right-4 ${statusInfo.color} border-0 font-semibold text-xs px-3 py-1.5 shadow-lg backdrop-blur-sm`}>
                          <StatusIcon className="w-3 h-3 mr-1.5" />
                          {statusInfo.label}
                        </Badge>
                      </div>
                      
                      {/* Card Content */}
                      <div className="p-6">
                        <div className="mb-4">
                          <h4 className="text-xl font-bold text-gray-900 mb-2">{listing.device}</h4>
                          <p className="text-gray-500 text-sm leading-relaxed">{statusInfo.description}</p>
                        </div>
                        
                        {/* Key Metrics */}
                        {listing.status === 'receiving_bids' ? (
                          <div className="space-y-3 mb-6">
                            <div className="flex justify-between items-center py-2">
                              <span className="text-gray-500 text-sm font-medium">Highest Bid</span>
                              <span className="font-bold text-xl text-emerald-600">₹{listing.currentBid.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center py-1">
                              <span className="text-gray-500 text-sm">{listing.bidsCount} bids</span>
                              <span className={`font-semibold text-sm px-2 py-1 rounded-full ${
                                listing.timeLeft.includes('Pending') 
                                  ? 'bg-blue-50 text-blue-600' 
                                  : listing.timeLeft === '0m left'
                                  ? 'bg-red-50 text-red-600'
                                  : listing.timeLeft.includes('h') && parseInt(listing.timeLeft) >= 6
                                  ? 'bg-green-50 text-green-600'
                                  : listing.timeLeft.includes('h') || parseInt(listing.timeLeft.replace('m', '')) > 60
                                  ? 'bg-orange-50 text-orange-600'
                                  : 'bg-red-50 text-red-600'
                              }`}>
                                {listing.timeLeft}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="mb-6">
                            <div className="flex justify-between items-center py-3">
                              <span className="text-gray-500 text-sm font-medium">Asking Price</span>
                              <span className="font-bold text-xl text-gray-900">₹{listing.askingPrice.toLocaleString()}</span>
                            </div>
                          </div>
                        )}
                        
                        {/* View Details */}
                        <div className="pt-4 border-t border-gray-100">
                          <div className="flex items-center justify-center text-blue-600 group-hover:text-blue-700 font-semibold text-sm transition-colors">
                            View Details
                            <Icons.arrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        ) : null}

        {/* How It Works - For New Users */}
        {!isLoadingListings && currentListings.length === 0 && (
          <div className="mb-6 sm:mb-8">
            <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900">How SELLIKO Works</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
                  <div className="text-center">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Icons.smartphone className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">1. List Your Device</h3>
                    <p className="text-sm sm:text-base text-gray-600">Upload photos and details. Takes just 5 minutes.</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Icons.users className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">2. Get Bids</h3>
                    <p className="text-sm sm:text-base text-gray-600">Verified buyers compete for 24 hours.</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Icons.check className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">3. Get Paid</h3>
                    <p className="text-sm sm:text-base text-gray-600">Safe pickup, instant payment to your account.</p>
                  </div>
                </div>
                
                <div className="mt-6 sm:mt-8 text-center">
                  <Link href="/client/list-device">
                    <Button size="lg" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 w-full sm:w-auto">
                      <Icons.plus className="w-5 h-5 mr-2" />
                      List Your First Device
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recent Activity & Support */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/client/list-device" className="block">
                <div className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <Icons.plus className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">List New Device</p>
                    <p className="text-sm text-gray-500">Start selling another device</p>
                  </div>
                </div>
              </Link>
              
              <Link href="/my-listings" className="block">
                <div className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <Icons.eye className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">View All Listings</p>
                    <p className="text-sm text-gray-500">Check your listing history</p>
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>

          {/* Support */}
          <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Need Help?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center p-3 rounded-lg bg-blue-50">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <Icons.messageCircle className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">WhatsApp Support</p>
                  <p className="text-sm text-gray-500">Get instant help on WhatsApp</p>
                </div>
              </div>
              
              <div className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <Icons.phone className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Call Support</p>
                  <p className="text-sm text-gray-500">+91 9876543210</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 