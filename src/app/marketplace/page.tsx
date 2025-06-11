'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Icons } from '@/components/ui/icons'
import { useAuth } from '@/lib/auth'
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
    color: 'Space Black',
    condition: 'Excellent',
    askingPrice: 55000,
    currentBid: 52000,
    totalBids: 5,
    timeLeft: '18h 24m left',
    location: 'Kochi',
    seller: { name: 'John Doe', rating: 4.8 },
    images: ['/api/placeholder/300/200'],
    isHot: true
  },
  {
    id: '2',
    device: 'Samsung Galaxy S21',
    brand: 'Samsung',
    storage: '128GB',
    color: 'Phantom Silver',
    condition: 'Good',
    askingPrice: 35000,
    currentBid: 33000,
    totalBids: 2,
    timeLeft: '6h 15m left',
    location: 'Thrissur',
    seller: { name: 'Jane Smith', rating: 4.6 },
    images: ['/api/placeholder/300/200'],
    isHot: false
  },
  {
    id: '3',
    device: 'OnePlus 11',
    brand: 'OnePlus',
    storage: '256GB',
    color: 'Titan Black',
    condition: 'Like New',
    askingPrice: 42000,
    currentBid: 39000,
    totalBids: 8,
    timeLeft: '2h 30m left',
    location: 'Ernakulam',
    seller: { name: 'Mike Johnson', rating: 4.9 },
    images: ['/api/placeholder/300/200'],
    isHot: true
  },
  {
    id: '4',
    device: 'iPhone 13',
    brand: 'Apple',
    storage: '128GB',
    color: 'Blue',
    condition: 'Good',
    askingPrice: 48000,
    totalBids: 0,
    timeLeft: '12h 8m left',
    location: 'Kochi',
    seller: { name: 'Sarah Wilson', rating: 4.7 },
    images: ['/api/placeholder/300/200'],
    isHot: false
  },
  {
    id: '5',
    device: 'Google Pixel 7',
    brand: 'Google',
    storage: '128GB',
    color: 'Snow',
    condition: 'Excellent',
    askingPrice: 32000,
    currentBid: 30000,
    totalBids: 1,
    timeLeft: '4h 33m left',
    location: 'Kochi',
    seller: { name: 'Alex Brown', rating: 4.5 },
    images: ['/api/placeholder/300/200'],
    isHot: false
  },
  {
    id: '6',
    device: 'Realme GT Neo 3',
    brand: 'Realme',
    storage: '256GB',
    color: 'Nitro Blue',
    condition: 'Like New',
    askingPrice: 22000,
    totalBids: 0,
    timeLeft: '1h 55m left',
    location: 'Ernakulam',
    seller: { name: 'David Lee', rating: 4.4 },
    images: ['/api/placeholder/300/200'],
    isHot: false
  }
]

export default function MarketplacePage() {
  const { user } = useAuth()
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

  const getTimeLeftColor = (timeLeft: string) => {
    const hours = parseInt(timeLeft)
    if (hours <= 2) return 'text-red-600 bg-red-100'
    if (hours <= 6) return 'text-orange-600 bg-orange-100'
    return 'text-green-600 bg-green-100'
  }

  const getBidStatusColor = (totalBids: number) => {
    if (totalBids === 0) return 'text-gray-600'
    if (totalBids <= 2) return 'text-yellow-600'
    if (totalBids <= 5) return 'text-orange-600'
    return 'text-red-600'
  }

  const handlePlaceBid = (listing: MarketplaceListing) => {
    if (!user) {
      toast.error('Please login to place a bid')
      return
    }
    toast.success(`Bid modal opened for ${listing.device}`)
  }

  const getUserTypeTitle = () => {
    switch (user?.role) {
      case 'VENDOR': return 'Vendor Marketplace'
      case 'AGENT': return 'Agent Marketplace'
      case 'ADMIN': return 'Admin Marketplace'
      default: return 'Device Marketplace'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📱 {getUserTypeTitle()}</h1>
          <p className="text-gray-600">Browse and bid on verified device listings across Kerala</p>
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
              <div className="text-2xl font-bold text-orange-600">2</div>
              <div className="text-sm text-gray-600">Hot Deals</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {user?.role === 'VENDOR' ? '5' : user?.role === 'AGENT' ? '12' : '47'}
              </div>
              <div className="text-sm text-gray-600">
                {user?.role === 'VENDOR' ? 'Your Bids' : user?.role === 'AGENT' ? 'Monitored' : 'Total Bids'}
              </div>
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
                <option value="Google">Google</option>
                <option value="Realme">Realme</option>
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
            <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <img 
                  src={listing.images[0]} 
                  alt={listing.device}
                  className="w-full h-48 object-cover"
                />
                {listing.isHot && (
                  <Badge className="absolute top-2 left-2 bg-red-500 text-white">
                    🔥 HOT
                  </Badge>
                )}
                <div className={`absolute bottom-2 left-2 px-2 py-1 rounded text-sm font-medium ${getTimeLeftColor(listing.timeLeft)}`}>
                  ⏱️ {listing.timeLeft}
                </div>
              </div>
              
              <CardContent className="p-4">
                <div className="mb-3">
                  <h3 className="font-semibold text-lg text-gray-900 mb-1">{listing.device}</h3>
                  <p className="text-sm text-gray-600">{listing.storage}, {listing.color}</p>
                  <p className="text-sm text-gray-600">Condition: {listing.condition}</p>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Asking:</span>
                    <span className="font-semibold text-green-600">{formatCurrency(listing.askingPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Current:</span>
                    <span className="font-semibold">
                      {listing.currentBid ? formatCurrency(listing.currentBid) : 'No bids yet'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Bids:</span>
                    <span className={`font-medium ${getBidStatusColor(listing.totalBids)}`}>
                      {listing.totalBids === 0 ? '🆕 New' : 
                       listing.totalBids <= 2 ? `🟢 ${listing.totalBids} bid${listing.totalBids > 1 ? 's' : ''}` :
                       listing.totalBids <= 5 ? `🟡 ${listing.totalBids} bids` :
                       `🔴 ${listing.totalBids} bids`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">📍 Location:</span>
                    <span>{listing.location}</span>
                  </div>
                </div>
                
                <Button 
                  onClick={() => handlePlaceBid(listing)}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Place Bid
                </Button>
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
