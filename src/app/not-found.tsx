import React from 'react'
import Link from 'next/link'
import { ExclamationTriangleIcon, HomeIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-md w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ExclamationTriangleIcon className="w-16 h-16 text-blue-600" />
          </div>
          
          {/* 404 Text */}
          <h1 className="text-8xl font-bold text-blue-600 mb-4">404</h1>
        </div>
        
        {/* Error Message */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Page Not Found
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Sorry, we couldn't find the page you're looking for. 
            The device you're searching for might have been sold or the link might be outdated.
          </p>
        </div>
        
        {/* Action Buttons - Preline UI Style */}
        <div className="space-y-3">
          {/* Primary Action */}
          <Link
            href="/"
            className="w-full inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none py-3 px-4 transition-all"
          >
            <HomeIcon className="w-4 h-4" />
            Back to Homepage
          </Link>
          
          {/* Secondary Action */}
          <Link
            href="/marketplace"
            className="w-full inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-lg border border-gray-200 bg-white text-gray-800 hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none py-3 px-4 transition-all"
          >
            <MagnifyingGlassIcon className="w-4 h-4" />
            Browse Marketplace
          </Link>
        </div>
        
        {/* Help Text */}
        <div className="mt-8 text-sm text-gray-500">
          <p>
            Looking for something specific? Try our{' '}
            <Link href="/search" className="text-blue-600 hover:text-blue-700 font-medium">
              search page
            </Link>{' '}
            or{' '}
            <Link href="/help" className="text-blue-600 hover:text-blue-700 font-medium">
              contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
} 