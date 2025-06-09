'use client'

import { useEffect } from 'react'
// Using Preline UI first, shadcn/ui as backup
import { ExclamationTriangleIcon, ArrowPathIcon, HomeIcon } from '@heroicons/react/24/outline'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application Error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Using Preline UI Card Pattern */}
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-200 p-8 text-center">
        {/* Error Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
          </div>
        </div>
        
        {/* Error Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Something went wrong!
        </h1>
        
        {/* Error Description */}
        <p className="text-gray-600 mb-6">
          We're sorry, but something unexpected happened. Please try again or return to the homepage.
        </p>
        
        {/* Development Error Details */}
        {process.env.NODE_ENV === 'development' && (
          <div className="text-left bg-gray-50 p-4 rounded-lg mb-6">
            <p className="text-xs text-gray-600 font-mono break-words">
              {error.message}
            </p>
          </div>
        )}
        
        {/* Action Buttons - Preline UI Button Style */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={reset}
            className="flex-1 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none px-4 py-3 transition-all"
          >
            <ArrowPathIcon className="w-4 h-4" />
            Try again
          </button>
          
          <button
            onClick={() => window.location.href = '/'}
            className="flex-1 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-lg border border-gray-200 bg-white text-gray-800 hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none px-4 py-3 transition-all"
          >
            <HomeIcon className="w-4 h-4" />
            Go home
          </button>
        </div>
      </div>
    </div>
  )
} 