'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Icons } from '@/components/ui/icons'
import { toast } from 'react-hot-toast'

interface MarketplaceListing {
  id: string
  device: string
  brand: string
  storage: string
  color: string
  condition: string
  askingPrice: number
  currentBid?: number
  totalBids: number
  timeLeft: string
  location: string
  seller: {
    name: string
    rating: number
  }
  images: string[]
  isHot: boolean
}

const mockListings: MarketplaceListing[] = [
  {
    id: '1',
    device: 'iPhone 14 Pro Max',
    brand: 'Apple',
    storage: '256GB',
    color: 'Deep Purple',
    condition: 'Excellent',
    askingPrice: 85000,
    currentBid: 82000,
    totalBids: 8,
    timeLeft: '2h 45m',
    location: 'Kochi',
    seller: { name: 'Rajesh Kumar', rating: 4.8 },
    images: ['/api/placeholder/300/300'],
    isHot: true
  },
  {
    id: '2',
    device: 'Samsung Galaxy S23',
    brand: 'Samsung',
    storage: '128GB',
    color: 'Phantom Black',
    condition: 'Good',
    askingPrice: 45000,
    currentBid: 43500,
    totalBids: 5,
    timeLeft: '4h 12m',
    location: 'Thrissur',
    seller: { name: 'Priya Nair', rating: 4.9 },
    images: ['/api/placeholder/300/300'],
    isHot: false
  },
  {
    id: '3',
    device: 'OnePlus 11',
    brand: 'OnePlus',
    storage: '256GB',
    color: 'Titan Black',
    condition: 'Excellent',
    askingPrice: 52000,
    totalBids: 0,
    timeLeft: '18h 30m',
    location: 'Calicut',
    seller: { name: 'Arun Menon', rating: 4.7 },
    images: ['/api/placeholder/300/300'],
    isHot: false
  }
]

export default function VendorMarketplace() {
  const [listings] = useState<MarketplaceListing[]>(mockListings)
  const [filters, setFilters] = useState({
    search: '',
    brand: '',
    sortBy: 'timeLeft'
  })

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString()}`

  const filteredListings = listings.filter(listing => {
    if (filters.search && !listing.device.toLowerCase().includes(filters.search.toLowerCase())) {
      return false
    }
    if (filters.brand && listing.brand !== filters.brand) {
      return false
    }
    return true
  })

  const handlePlaceBid = (listing: MarketplaceListing) => {
    toast.success(`Bid modal opened for ${listing.device}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📱 Vendor Marketplace</h1>
          <p className="text-gray-600">Bid on verified device listings across Kerala</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{filteredListings.length}</div>
              <div className="text-sm text-gray-600">Active Listings</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">3</div>
              <div className="text-sm text-gray-600">Ending Soon</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">1</div>
              <div className="text-sm text-gray-600">Hot Deals</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">5</div>
              <div className="text-sm text-gray-600">Your Bids</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="Search devices..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
              
              <select
                value={filters.brand}
                onChange={(e) => setFilters(prev => ({ ...prev, brand: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">All Brands</option>
                <option value="Apple">Apple</option>
                <option value="Samsung">Samsung</option>
                <option value="OnePlus">OnePlus</option>
              </select>

              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="timeLeft">Ending Soon</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>

              <Button variant="outline" onClick={() => setFilters({ search: '', brand: '', sortBy: 'timeLeft' })}>
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((listing) => (
            <Card key={listing.id} className="hover:shadow-lg transition-all duration-200">
              <CardContent className="p-0">
                <div className="relative">
                  <img 
                    src={listing.images[0]} 
                    alt={listing.device}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  {listing.isHot && (
                    <Badge className="absolute top-2 left-2 bg-red-500 text-white">
                      🔥 HOT
                    </Badge>
                  )}
                  <Badge className="absolute top-2 right-2 bg-green-100 text-green-800">
                    ⏱️ {listing.timeLeft}
                  </Badge>
                </div>

                <div className="p-4">
                  <div className="mb-3">
                    <h3 className="font-semibold text-lg text-gray-900 mb-1">{listing.device}</h3>
                    <p className="text-sm text-gray-600">{listing.storage} • {listing.color} • {listing.condition}</p>
                    <div className="flex items-center mt-1 text-sm text-gray-500">
                      <Icons.mapPin className="w-4 h-4 mr-1" />
                      {listing.location}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-3 text-sm">
                    <div className="flex items-center">
                      <span className="text-gray-600">By: {listing.seller.name}</span>
                      <Icons.shield className="w-4 h-4 text-green-600 ml-1" />
                    </div>
                    <div className="flex items-center">
                      <Icons.star className="w-4 h-4 text-yellow-500 mr-1" />
                      <span>{listing.seller.rating}</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Asking Price</p>
                        <p className="text-xl font-bold text-green-600">{formatCurrency(listing.askingPrice)}</p>
                      </div>
                      {listing.currentBid && (
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Current Bid</p>
                          <p className="text-lg font-semibold text-blue-600">{formatCurrency(listing.currentBid)}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4 text-sm">
                    <span className={`font-medium ${listing.totalBids === 0 ? 'text-gray-600' : 'text-orange-600'}`}>
                      {listing.totalBids === 0 ? 'No bids yet' : `${listing.totalBids} bids`}
                    </span>
                  </div>

                  <div>
                    <Button
                      onClick={() => handlePlaceBid(listing)}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      Place Bid
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredListings.length === 0 && (
          <div className="text-center py-12">
            <Icons.inbox className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No listings found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your filters to see more results</p>
            <Button variant="outline" onClick={() => setFilters({ search: '', brand: '', sortBy: 'timeLeft' })}>
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
} 