import React from 'react'

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/60 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">selliko</h1>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <div className="text-gray-600">Home</div>
              <div className="text-gray-600">How it works</div>
              <div className="px-6 py-2 bg-gray-200 rounded-xl animate-pulse">Loading...</div>
            </nav>
          </div>
        </div>
      </header>

      {/* Loading content */}
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading selliko...</p>
        </div>
      </div>
    </div>
  )
} 