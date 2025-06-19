'use client'

import Header from '@/components/layout/header'

export default function VendorProfile() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50">
      <Header variant="vendor" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">My Profile</h1>
          <p className="text-gray-600">Coming soon...</p>
        </div>
      </div>
    </div>
  )
} 