'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { 
  ClockIcon, 
  MapPinIcon, 
  StarIcon, 
  ArrowTrendingUpIcon, 
  UsersIcon, 
  EyeIcon,
  HeartIcon,
  ShareIcon,
  BoltIcon
} from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'

export interface DeviceCardProps {
  device: {
    id: string
    title: string
    brand: string
    model: string
    images: string[]
    condition: 'excellent' | 'good' | 'fair' | 'poor'
    startingPrice: number
    currentBid?: number
    buyNowPrice?: number
    timeLeft: string
    location: string
    seller: {
      name: string
      rating: number
      avatar?: string
    }
    bidsCount: number
    viewsCount: number
    isLiked?: boolean
    hasInstantWin?: boolean
    isVerified?: boolean
    isUrgent?: boolean
  }
  variant?: 'default' | 'compact' | 'featured'
  showActions?: boolean
  className?: string
}

const conditionColors = {
  excellent: 'bg-green-500 text-white',
  good: 'bg-blue-500 text-white',
  fair: 'bg-yellow-500 text-white',
  poor: 'bg-red-500 text-white'
}

const conditionLabels = {
  excellent: 'Excellent',
  good: 'Good',
  fair: 'Fair',
  poor: 'Poor'
}

export default function DeviceCard({ 
  device, 
  variant = 'default',
  showActions = true,
  className 
}: DeviceCardProps) {
  const isCompact = variant === 'compact'
  const isFeatured = variant === 'featured'

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price)
  }

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('Like device:', device.id)
  }

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('Share device:', device.id)
  }

  return (
    <div 
      className={cn(
        "bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer hover:scale-[1.02] active:scale-[0.98]",
        isFeatured && "ring-2 ring-blue-500 ring-offset-2",
        isCompact ? "p-3" : "p-4",
        className
      )}
    >
      <Link href={`/device/${device.id}`} className="block">
        {/* Image Section */}
        <div className="relative mb-4">
          <div className={cn(
            "relative rounded-lg overflow-hidden bg-gray-100",
            isCompact ? "aspect-square" : "aspect-[4/3]"
          )}>
            <Image
              src={device.images[0] || '/placeholder-device.jpg'}
              alt={`${device.brand} ${device.model}`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            
            {/* Top badges */}
            <div className="absolute top-3 left-3 flex flex-wrap gap-2">
              <span className={cn(
                "inline-flex items-center gap-x-1.5 py-1.5 px-3 rounded-full text-xs font-medium",
                conditionColors[device.condition]
              )}>
                {conditionLabels[device.condition]}
              </span>
              
              {device.isVerified && (
                <span className="inline-flex items-center gap-x-1.5 py-1.5 px-3 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Verified
                </span>
              )}
              
              {device.isUrgent && (
                <span className="inline-flex items-center gap-x-1.5 py-1.5 px-3 rounded-full text-xs font-medium bg-red-500 text-white animate-pulse">
                  Urgent
                </span>
              )}
              
              {device.hasInstantWin && (
                <span className="inline-flex items-center gap-x-1.5 py-1.5 px-3 rounded-full text-xs font-medium bg-amber-500 text-white">
                  <BoltIcon className="w-3 h-3" />
                  Instant Win
                </span>
              )}
            </div>

            {/* Action buttons */}
            {showActions && (
              <div className="absolute top-3 right-3 flex gap-2">
                <button
                  onClick={handleLike}
                  className="w-8 h-8 inline-flex justify-center items-center text-sm font-semibold rounded-full border border-transparent bg-white/90 text-gray-800 hover:bg-white transition-all"
                >
                  <HeartIcon className={cn(
                    "w-4 h-4",
                    device.isLiked && "fill-red-500 text-red-500"
                  )} />
                </button>
                
                <button
                  onClick={handleShare}
                  className="w-8 h-8 inline-flex justify-center items-center text-sm font-semibold rounded-full border border-transparent bg-white/90 text-gray-800 hover:bg-white transition-all"
                >
                  <ShareIcon className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Time left indicator */}
            <div className="absolute bottom-3 left-3">
              <span className="inline-flex items-center gap-x-1.5 py-1.5 px-3 rounded-full text-xs font-medium bg-white/90 text-gray-900">
                <ClockIcon className="w-3 h-3" />
                {device.timeLeft}
              </span>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className={cn("space-y-3", isCompact && "space-y-2")}>
          {/* Title and Brand */}
          <div>
            <h3 className={cn(
              "font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors",
              isCompact ? "text-sm" : "text-base"
            )}>
              {device.title}
            </h3>
            <p className={cn(
              "text-gray-600",
              isCompact ? "text-xs" : "text-sm"
            )}>
              {device.brand} {device.model}
            </p>
          </div>

          {/* Pricing Section */}
          <div className="space-y-2">
            {/* Current Bid */}
            {device.currentBid && (
              <div className="flex items-center justify-between">
                <span className={cn(
                  "text-gray-600",
                  isCompact ? "text-xs" : "text-sm"
                )}>
                  Current Bid
                </span>
                <span className={cn(
                  "font-bold text-blue-600",
                  isCompact ? "text-sm" : "text-lg"
                )}>
                  {formatPrice(device.currentBid)}
                </span>
              </div>
            )}
            
            {/* Starting Price */}
            <div className="flex items-center justify-between">
              <span className={cn(
                "text-gray-600",
                isCompact ? "text-xs" : "text-sm"
              )}>
                Starting Price
              </span>
              <span className={cn(
                "font-medium text-gray-900",
                isCompact ? "text-xs" : "text-sm"
              )}>
                {formatPrice(device.startingPrice)}
              </span>
            </div>
            
            {/* Buy Now Price */}
            {device.buyNowPrice && (
              <div className="flex items-center justify-between">
                <span className={cn(
                  "text-gray-600",
                  isCompact ? "text-xs" : "text-sm"
                )}>
                  Buy Now
                </span>
                <span className={cn(
                  "font-medium text-amber-600",
                  isCompact ? "text-xs" : "text-sm"
                )}>
                  {formatPrice(device.buyNowPrice)}
                </span>
              </div>
            )}
          </div>

          {/* Location and Seller Info */}
          <div className="flex items-center justify-between text-xs text-gray-600">
            <div className="flex items-center">
              <MapPinIcon className="w-3 h-3 mr-1" />
              {device.location}
            </div>
            <div className="flex items-center">
              <StarIcon className="w-3 h-3 mr-1 text-yellow-400" />
              {device.seller.rating}
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center">
              <UsersIcon className="w-3 h-3 mr-1" />
              {device.bidsCount} bids
            </div>
            <div className="flex items-center">
              <EyeIcon className="w-3 h-3 mr-1" />
              {device.viewsCount} views
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {!isCompact && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex gap-2">
              <button className="flex-1 py-2 px-3 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 transition-all">
                Place Bid
              </button>
              
              {device.buyNowPrice && (
                <button className="flex-1 py-2 px-3 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-lg border border-gray-200 bg-white text-gray-800 hover:bg-gray-50 transition-all">
                  <BoltIcon className="w-4 h-4" />
                  Buy Now
                </button>
              )}
            </div>
          </div>
        )}
      </Link>
    </div>
  )
} 