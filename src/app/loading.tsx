import React from 'react'

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="text-center">
        {/* SELLIKO Logo */}
        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-6 mx-auto">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-primary rounded"></div>
          </div>
        </div>
        
        {/* Loading Animation */}
        <div className="flex space-x-2 justify-center mb-4">
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
        </div>
        
        {/* Loading Text */}
        <h2 className="text-xl font-bold text-gray-900 mb-2">SELLIKO</h2>
        <p className="text-gray-600">Loading your experience...</p>
      </div>
    </div>
  )
} 