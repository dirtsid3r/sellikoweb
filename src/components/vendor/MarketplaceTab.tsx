'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Icons } from '@/components/ui/icons'
import { BidModal } from './BidModal'

interface MarketplaceListing {
  id: string
  device: string
  brand: string
  model: string
  storage: string
  color: string
  condition: string
  currentBid: number | null
  askingPrice: number
  totalBids: number
  timeLeft: string
  location: string
  image: string
  isInstantWin: boolean
  photos: string[]
  description: string
  seller: {
    name: string
    location: string
  }
}

export function MarketplaceTab() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [listings, setListings] = useState<MarketplaceListing[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedListing, setSelectedListing] = useState<MarketplaceListing | null>(null)
  const [bidModalOpen, setBidModalOpen] = useState(false)

  // Mock data for demonstration - should come from API
  const mockListings: MarketplaceListing[] = [
    {
      id: 'listing-1',
      device: 'iPhone 14 Pro Max',
      brand: 'Apple',
      model: 'iPhone 14 Pro Max',
      storage: '256GB',
      color: 'Space Black',
      condition: 'Excellent',
      currentBid: 52000,
      askingPrice: 55000,
      totalBids: 5,
      timeLeft: '18h 24m',
      location: 'Kochi',
      image: '/api/placeholder/300/200',
      isInstantWin: false,
      photos: ['/api/placeholder/300/200'],
      description: 'Excellent condition iPhone with all accessories',
      seller: { name: 'Pradeep Kumar', location: 'Kochi' }
    },
    {
      id: 'listing-2',
      device: 'Samsung Galaxy S21',
      brand: 'Samsung',
      model: 'Galaxy S21',
      storage: '128GB',
      color: 'Phantom Silver',
      condition: 'Good',
      currentBid: 33000,
      askingPrice: 35000,
      totalBids: 2,
      timeLeft: '6h 15m',
      location: 'Thrissur',
      image: '/api/placeholder/300/200',
      isInstantWin: true,
      photos: ['/api/placeholder/300/200'],
      description: 'Good condition Samsung with original box',
      seller: { name: 'Rahul Menon', location: 'Thrissur' }
    },
    {
      id: 'listing-3',
      device: 'OnePlus 9',
      brand: 'OnePlus',
      model: 'OnePlus 9',
      storage: '256GB',
      color: 'Arctic Sky',
      condition: 'Excellent',
      currentBid: null,
      askingPrice: 28000,
      totalBids: 0,
      timeLeft: '12h 8m',
      location: 'Calicut',
      image: '/api/placeholder/300/200',
      isInstantWin: false,
      photos: ['/api/placeholder/300/200'],
      description: 'Like new OnePlus 9 with all accessories',
      seller: { name: 'Arjun Nair', location: 'Calicut' }
    },
    {
      id: 'listing-4',
      device: 'iPhone 13',
      brand: 'Apple',
      model: 'iPhone 13',
      storage: '128GB',
      color: 'Pink',
      condition: 'Good',
      currentBid: 45000,
      askingPrice: 48000,
      totalBids: 3,
      timeLeft: '4h 33m',
      location: 'Kochi',
      image: '/api/placeholder/300/200',
      isInstantWin: false,
      photos: ['/api/placeholder/300/200'],
      description: 'Good condition iPhone 13',
      seller: { name: 'Sneha Das', location: 'Kochi' }
    }
  ]

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setListings(mockListings)
      setLoading(false)
    }, 1000)
  }, [])

  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.device.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         listing.brand.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (selectedFilter === 'all') return matchesSearch
    if (selectedFilter === 'instant-win') return matchesSearch && listing.isInstantWin
    if (selectedFilter === 'ending-soon') return matchesSearch && listing.timeLeft.includes('h') && parseInt(listing.timeLeft) <= 6
    if (selectedFilter === 'apple') return matchesSearch && listing.brand === 'Apple'
    if (selectedFilter === 'samsung') return matchesSearch && listing.brand === 'Samsung'
    
    return matchesSearch
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
    setSelectedListing(listing)
    setBidModalOpen(true)
  }

  const handleInstantWin = (listing: MarketplaceListing) => {
    // Implement instant win logic
    alert(`Instant win: ${listing.device} for ₹${listing.askingPrice.toLocaleString()}`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">📱 Device Marketplace</h2>
        <p className="text-gray-600">Browse and bid on verified devices from trusted sellers across Kerala.</p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Icons.search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search devices..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2 flex-wrap">
              {[
                { key: 'all', label: 'All' },
                { key: 'instant-win', label: 'Instant Win' },
                { key: 'ending-soon', label: 'Ending Soon' },
                { key: 'apple', label: 'Apple' },
                { key: 'samsung', label: 'Samsung' }
              ].map((filter) => (
                <Button
                  key={filter.key}
                  variant={selectedFilter === filter.key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedFilter(filter.key)}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Listings Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="bg-gray-200 h-48 rounded-t-lg"></div>
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((listing) => (
            <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <img 
                  src={listing.image} 
                  alt={listing.device}
                  className="w-full h-48 object-cover"
                />
                {listing.isInstantWin && (
                  <Badge className="absolute top-2 right-2 bg-orange-100 text-orange-800 border-orange-200">
                    ⚡ Instant Win
                  </Badge>
                )}
                <div className={`absolute bottom-2 left-2 px-2 py-1 rounded text-sm font-medium ${getTimeLeftColor(listing.timeLeft)}`}>
                  ⏱️ {listing.timeLeft} left
                </div>
              </div>
              
              <CardContent className="p-4">
                <div className="mb-3">
                  <h3 className="font-semibold text-gray-900 text-lg">{listing.device}</h3>
                  <p className="text-sm text-gray-600">{listing.storage}, {listing.color}</p>
                  <p className="text-sm text-gray-600">Condition: {listing.condition}</p>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Asking:</span>
                    <span className="font-semibold text-green-600">₹{listing.askingPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Current:</span>
                    <span className="font-semibold">
                      {listing.currentBid ? `₹${listing.currentBid.toLocaleString()}` : 'No bids yet'}
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
                
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => handlePlaceBid(listing)}
                  >
                    Place Bid
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && filteredListings.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Icons.search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No devices found</h3>
            <p className="text-gray-600">Try adjusting your search or filters to find more devices.</p>
          </CardContent>
        </Card>
      )}

      {/* Bid Modal */}
      {selectedListing && (
        <BidModal
          listing={selectedListing}
          open={bidModalOpen}
          onOpenChange={setBidModalOpen}
        />
      )}
    </div>
  )
} 