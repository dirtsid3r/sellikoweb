'use client'

import React from 'react'
import Link from 'next/link'
import DeviceCard from '@/components/device/DeviceCard'
import { ArrowRightIcon, ArrowTrendingUpIcon, BoltIcon, FireIcon } from '@heroicons/react/24/outline'

// Mock data for featured devices - this would come from API
const featuredDevices = [
  {
    id: '1',
    title: 'iPhone 14 Pro Max - Excellent Condition',
    brand: 'Apple',
    model: 'iPhone 14 Pro Max',
    images: ['/api/placeholder/400/300'],
    condition: 'excellent' as const,
    startingPrice: 85000,
    currentBid: 92000,
    buyNowPrice: 105000,
    timeLeft: '4h 23m',
    location: 'Kochi',
    seller: {
      name: 'Rajesh Kumar',
      rating: 4.8,
    },
    bidsCount: 15,
    viewsCount: 234,
    isLiked: false,
    hasInstantWin: true,
    isVerified: true,
    isUrgent: false
  },
  {
    id: '2',
    title: 'Samsung Galaxy S23 Ultra - Like New',
    brand: 'Samsung',
    model: 'Galaxy S23 Ultra',
    images: ['/api/placeholder/400/300'],
    condition: 'excellent' as const,
    startingPrice: 65000,
    currentBid: 71500,
    buyNowPrice: 78000,
    timeLeft: '12h 45m',
    location: 'Thiruvananthapuram',
    seller: {
      name: 'Priya Nair',
      rating: 4.9,
    },
    bidsCount: 23,
    viewsCount: 456,
    isLiked: true,
    hasInstantWin: true,
    isVerified: true,
    isUrgent: false
  },
  {
    id: '3',
    title: 'OnePlus 11 5G - Mint Condition',
    brand: 'OnePlus',
    model: 'OnePlus 11',
    images: ['/api/placeholder/400/300'],
    condition: 'excellent' as const,
    startingPrice: 38000,
    currentBid: 41200,
    timeLeft: '2h 18m',
    location: 'Kozhikode',
    seller: {
      name: 'Arjun Menon',
      rating: 4.7,
    },
    bidsCount: 18,
    viewsCount: 189,
    isLiked: false,
    hasInstantWin: false,
    isVerified: true,
    isUrgent: true
  },
  {
    id: '4',
    title: 'Google Pixel 7 Pro - Pristine',
    brand: 'Google',
    model: 'Pixel 7 Pro',
    images: ['/api/placeholder/400/300'],
    condition: 'excellent' as const,
    startingPrice: 42000,
    currentBid: 45800,
    buyNowPrice: 52000,
    timeLeft: '8h 52m',
    location: 'Thrissur',
    seller: {
      name: 'Sneha Thomas',
      rating: 5.0,
    },
    bidsCount: 12,
    viewsCount: 167,
    isLiked: false,
    hasInstantWin: true,
    isVerified: true,
    isUrgent: false
  }
]

const hotCategories = [
  { name: 'iPhone', count: 45, trending: true },
  { name: 'Samsung Galaxy', count: 38, trending: true },
  { name: 'OnePlus', count: 22, trending: false },
  { name: 'Google Pixel', count: 15, trending: true },
  { name: 'Xiaomi', count: 28, trending: false },
  { name: 'Vivo', count: 19, trending: false }
]

export default function FeaturedDevices() {
  return (
    <section className="py-16 px-4 bg-white">
      <div className="container mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-12">
          {/* Preline UI Badge */}
          <div className="inline-flex items-center gap-x-2 py-2 px-4 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4">
            <FireIcon className="w-4 h-4" />
            Hot Auctions
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Featured Devices
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Don't miss out on these popular auctions ending soon. 
            Place your bid now or grab them instantly!
          </p>
        </div>

        {/* Hot Categories Pills - Preline UI Button Group */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {hotCategories.map((category) => (
            <Link
              key={category.name}
              href={`/marketplace?category=${category.name.toLowerCase()}`}
              className="inline-flex items-center gap-x-2 py-2 px-4 text-sm font-medium rounded-full border border-gray-200 bg-white text-gray-800 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all"
            >
              {category.trending && (
                <ArrowTrendingUpIcon className="w-3 h-3 text-green-500" />
              )}
              {category.name}
              <span className="inline-flex items-center py-0.5 px-2 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {category.count}
              </span>
            </Link>
          ))}
        </div>

        {/* Featured Devices Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {featuredDevices.map((device, index) => (
            <div
              key={device.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <DeviceCard
                device={device}
                variant={index === 0 ? 'featured' : 'default'}
              />
            </div>
          ))}
        </div>

        {/* Stats Row - Preline UI Stats Component */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 mb-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">156</div>
              <div className="text-sm text-gray-600">Active Auctions</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">₹2.3L</div>
              <div className="text-sm text-gray-600">Avg. Sale Price</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">4.9⭐</div>
              <div className="text-sm text-gray-600">User Rating</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">24h</div>
              <div className="text-sm text-gray-600">Avg. Sale Time</div>
            </div>
          </div>
        </div>

        {/* CTA Section - Preline UI Hero Pattern */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to Find Your Next Device?
            </h3>
            <p className="text-lg text-blue-100 mb-6 max-w-2xl mx-auto">
              Browse our full marketplace with hundreds of verified devices. 
              From budget-friendly to premium, find exactly what you're looking for.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {/* Preline UI Primary Button */}
              <Link
                href="/marketplace"
                className="inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-white text-blue-600 hover:bg-gray-50 transition-all py-3 px-6"
              >
                Browse All Devices
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
              
              {/* Preline UI Secondary Button */}
              <Link
                href="/sell"
                className="inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-lg border border-white/20 bg-transparent text-white hover:bg-white/10 transition-all py-3 px-6"
              >
                <BoltIcon className="w-4 h-4" />
                Start Selling
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 