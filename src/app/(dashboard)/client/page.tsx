'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Icons } from '@/components/ui/icons'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function ClientDashboard() {
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  if (isLoading) {
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

  const handleLogout = async () => {
    setIsLoggingOut(true)
    await logout()
    router.push('/')
  }

  // Current listings with real transaction status
  const currentListings = [
    {
      id: 'listing-1',
      device: 'iPhone 14 Pro',
      status: 'receiving_bids',
      currentBid: 65000,
      askingPrice: 70000,
      bidsCount: 8,
      timeLeft: '18h 30m',
      image: '/api/placeholder/120/120',
      highestBidder: 'TechWorld Kochi'
    },
    {
      id: 'listing-2',
      device: 'Samsung Galaxy S23',
      status: 'pending_approval',
      currentBid: 0,
      askingPrice: 45000,
      bidsCount: 0,
      timeLeft: 'Under review',
      image: '/api/placeholder/120/120'
    }
  ]

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
      case 'pickup_scheduled':
        return {
          label: 'Pickup Scheduled',
          color: 'bg-orange-100 text-orange-800 border-orange-200',
          icon: Icons.calendar,
          description: 'Your device pickup is confirmed'
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
              <Link href="/list-device">
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
        {currentListings.length > 0 && (
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Your Active Listings</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentListings.map((listing) => {
                const statusInfo = getStatusInfo(listing.status)
                const StatusIcon = statusInfo.icon
                
                return (
                  <Card key={listing.id} className="group overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-500 border-0 shadow-lg bg-white cursor-pointer rounded-2xl"
                    onClick={() => router.push(`/client/listings/${listing.id}`)}>
                    <CardContent className="p-0">
                      {/* Device Image */}
                      <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
                        <img 
                          src={listing.image} 
                          alt={listing.device}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
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
                              <span className="text-amber-600 font-semibold text-sm bg-amber-50 px-2 py-1 rounded-full">
                                {listing.timeLeft} left
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
        )}

        {/* How It Works - For New Users */}
        {currentListings.length === 0 && (
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
                  <Link href="/list-device">
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
              <Link href="/list-device" className="block">
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