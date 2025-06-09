'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, BoltIcon, ClockIcon } from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'

export interface PriceDisplayProps {
  currentPrice: number
  originalPrice?: number
  priceType: 'starting' | 'current' | 'buyNow' | 'sold'
  currency?: 'INR' | 'USD'
  showTrend?: boolean
  trendPercentage?: number
  timeLeft?: string
  isInstantWin?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function PriceDisplay({
  currentPrice,
  originalPrice,
  priceType,
  currency = 'INR',
  showTrend = false,
  trendPercentage,
  timeLeft,
  isInstantWin = false,
  className,
  size = 'md'
}: PriceDisplayProps) {
  
  const formatPrice = (price: number) => {
    if (currency === 'INR') {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
      }).format(price)
    }
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price)
  }

  const getPriceLabel = () => {
    switch (priceType) {
      case 'starting':
        return 'Starting Price'
      case 'current':
        return 'Current Bid'
      case 'buyNow':
        return 'Buy Now Price'
      case 'sold':
        return 'Sold For'
      default:
        return 'Price'
    }
  }

  const getPriceColor = () => {
    switch (priceType) {
      case 'starting':
        return 'text-gray-900'
      case 'current':
        return 'text-primary'
      case 'buyNow':
        return 'text-warning'
      case 'sold':
        return 'text-success'
      default:
        return 'text-gray-900'
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          price: 'text-lg font-bold',
          label: 'text-xs',
          original: 'text-sm',
          trend: 'text-xs'
        }
      case 'lg':
        return {
          price: 'text-3xl font-bold',
          label: 'text-sm',
          original: 'text-lg',
          trend: 'text-sm'
        }
      default:
        return {
          price: 'text-2xl font-bold',
          label: 'text-sm',
          original: 'text-base',
          trend: 'text-sm'
        }
    }
  }

  const sizeClasses = getSizeClasses()
  const isPositiveTrend = trendPercentage && trendPercentage > 0
  const isNegativeTrend = trendPercentage && trendPercentage < 0

  return (
    <div className={cn("space-y-1", className)}>
      {/* Price Label */}
      <div className="flex items-center justify-between">
        <p className={cn("text-gray-600 font-medium", sizeClasses.label)}>
          {getPriceLabel()}
        </p>
        
        {/* Time Left Badge */}
        {timeLeft && priceType === 'current' && (
          <Badge variant="secondary" className="text-xs">
            <ClockIcon className="w-3 h-3 mr-1" />
            {timeLeft}
          </Badge>
        )}
      </div>

      {/* Main Price */}
      <div className="flex items-baseline space-x-2">
        <span className={cn(sizeClasses.price, getPriceColor())}>
          {formatPrice(currentPrice)}
        </span>
        
        {/* Instant Win Badge */}
        {isInstantWin && priceType === 'buyNow' && (
          <Badge className="bg-warning text-white">
            <BoltIcon className="w-3 h-3 mr-1" />
            Instant
          </Badge>
        )}
      </div>

      {/* Original Price (if different) */}
      {originalPrice && originalPrice !== currentPrice && (
        <div className="flex items-center space-x-2">
          <span className={cn("text-gray-500 line-through", sizeClasses.original)}>
            {formatPrice(originalPrice)}
          </span>
          {showTrend && trendPercentage && (
            <div className={cn(
              "flex items-center",
              sizeClasses.trend,
              isPositiveTrend ? "text-success" : isNegativeTrend ? "text-destructive" : "text-gray-500"
            )}>
              {isPositiveTrend && <ArrowTrendingUpIcon className="w-3 h-3 mr-1" />}
              {isNegativeTrend && <ArrowTrendingDownIcon className="w-3 h-3 mr-1" />}
              <span className="font-medium">
                {isPositiveTrend ? '+' : ''}{Math.abs(trendPercentage)}%
              </span>
            </div>
          )}
        </div>
      )}

      {/* Trend (without original price) */}
      {!originalPrice && showTrend && trendPercentage && (
        <div className={cn(
          "flex items-center",
          sizeClasses.trend,
          isPositiveTrend ? "text-success" : isNegativeTrend ? "text-destructive" : "text-gray-500"
        )}>
          {isPositiveTrend && <ArrowTrendingUpIcon className="w-3 h-3 mr-1" />}
          {isNegativeTrend && <ArrowTrendingDownIcon className="w-3 h-3 mr-1" />}
          <span className="font-medium">
            {isPositiveTrend ? '+' : ''}{Math.abs(trendPercentage)}% from starting price
          </span>
        </div>
      )}

      {/* Additional Info for Sold Items */}
      {priceType === 'sold' && originalPrice && (
        <div className="text-xs text-gray-500">
          {currentPrice > originalPrice 
            ? `₹${(currentPrice - originalPrice).toLocaleString()} above starting price`
            : currentPrice < originalPrice
            ? `₹${(originalPrice - currentPrice).toLocaleString()} below starting price`
            : 'Sold at starting price'
          }
        </div>
      )}
    </div>
  )
} 