'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import Link from 'next/link'
import { 
  PlusIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  EyeIcon,
  CurrencyRupeeIcon
} from '@heroicons/react/24/outline'

interface Listing {
  id: string
  brand: string
  model: string
  storage: string
  color: string
  condition: string
  askingPrice: number
  status: 'pending' | 'approved' | 'rejected' | 'live' | 'sold' | 'expired'
  submittedAt: string
  views: number
  devicePhotos: string[]
}

export default function MyListingsPage() {
  const { user, isAuthenticated } = useAuth()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchListings()
    }
  }, [isAuthenticated, user])

  const fetchListings = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/listings?clientId=${user?.id}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('selliko_access_token')}`
          }
        }
      )
      const data = await response.json()
      setListings(data.listings || [])
    } catch (error) {
      console.error('Failed to fetch listings:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-sm p-8 max-w-md w-full text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Login Required</h2>
          <p className="text-gray-600 mb-6">Please login to view your listings</p>
          <Link 
            href="/"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Home
          </Link>
        </div>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon, label: 'Under Review' },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon, label: 'Live' },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircleIcon, label: 'Rejected' },
      live: { color: 'bg-blue-100 text-blue-800', icon: ClockIcon, label: 'Auction Live' },
      sold: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon, label: 'Sold' },
      expired: { color: 'bg-gray-100 text-gray-800', icon: XCircleIcon, label: 'Expired' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    const Icon = config.icon
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Listings</h1>
              <p className="text-gray-600 mt-1">
                {loading ? 'Loading...' : `${listings.length} total listing${listings.length !== 1 ? 's' : ''}`}
              </p>
            </div>
            <Link 
              href="/list-device"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              List New Device
            </Link>
          </div>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
                <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <PlusIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No listings yet</h3>
            <p className="text-gray-600 mb-6">Start by listing your first device to get the best price!</p>
            <Link 
              href="/list-device"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              List Your First Device
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <div key={listing.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                {/* Image */}
                <div className="aspect-video bg-gray-100 relative">
                  {listing.devicePhotos && listing.devicePhotos.length > 0 ? (
                    <img
                      src={listing.devicePhotos[0]}
                      alt={`${listing.brand} ${listing.model}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-gray-400">No image</span>
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    {getStatusBadge(listing.status)}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {listing.brand} {listing.model}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {listing.storage} • {listing.color} • {listing.condition}
                  </p>

                  {/* Price */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center text-green-600">
                      <CurrencyRupeeIcon className="w-4 h-4 mr-1" />
                      <span className="font-semibold">₹{listing.askingPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center text-gray-500 text-sm">
                      <EyeIcon className="w-4 h-4 mr-1" />
                      <span>{listing.views} views</span>
                    </div>
                  </div>

                  {/* Date */}
                  <p className="text-xs text-gray-500">
                    Listed {new Date(listing.submittedAt).toLocaleDateString()}
                  </p>

                  {/* Actions */}
                  <div className="mt-4 flex gap-2">
                    <button className="flex-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                      View Details
                    </button>
                    {listing.status === 'pending' && (
                      <button className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Stats */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {listings.filter(l => l.status === 'pending').length}
              </div>
              <div className="text-sm text-gray-600">Under Review</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {listings.filter(l => l.status === 'live').length}
              </div>
              <div className="text-sm text-gray-600">Live Auctions</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {listings.filter(l => l.status === 'sold').length}
              </div>
              <div className="text-sm text-gray-600">Sold</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">
                {listings.reduce((sum, l) => sum + l.views, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Views</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 