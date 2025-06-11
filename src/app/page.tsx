'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  ArrowRightIcon,
  DevicePhoneMobileIcon,
  ShieldCheckIcon,
  ClockIcon,
  StarIcon,
  TrophyIcon,
  CurrencyRupeeIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'
import { useAuth } from '@/lib/auth'

function TestLoginButton() {
  const { loginAsTestVendor, loginAsTestClient, loginAsTestAgent, loginAsTestAdmin, logout, user } = useAuth()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex justify-center">
        <div className="inline-flex items-center px-4 py-3 bg-gray-600 text-white rounded-xl opacity-50">
          <span className="text-sm">Loading...</span>
        </div>
      </div>
    )
  }

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400">
          Logged in as: {user.name} ({user.role})
        </span>
        <button
          onClick={logout}
          className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
        >
          Logout
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-3 justify-center">
      <button
        onClick={loginAsTestVendor}
        className="inline-flex items-center px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
      >
        <span className="mr-2">📱</span>
        <div className="text-left">
          <div className="text-sm font-semibold">Vendor Login</div>
          <div className="text-xs opacity-90">+91 98765 43210</div>
        </div>
      </button>
      
      <button
        onClick={loginAsTestClient}
        className="inline-flex items-center px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium"
      >
        <span className="mr-2">💚</span>
        <div className="text-left">
          <div className="text-sm font-semibold">Client Login</div>
          <div className="text-xs opacity-90">+91 87654 32109</div>
        </div>
      </button>

      <button
        onClick={loginAsTestAgent}
        className="inline-flex items-center px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium"
      >
        <span className="mr-2">🚗</span>
        <div className="text-left">
          <div className="text-sm font-semibold">Agent Login</div>
          <div className="text-xs opacity-90">+91 98765 43212</div>
        </div>
      </button>

      <button
        onClick={loginAsTestAdmin}
        className="inline-flex items-center px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
      >
        <span className="mr-2">👤</span>
        <div className="text-left">
          <div className="text-sm font-semibold">Admin Login</div>
          <div className="text-xs opacity-90">+91 99888 77665</div>
        </div>
      </button>
    </div>
  )
}

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Avoid hydration issues by showing a loading state until both mounted and auth is loaded
  if (!mounted || isLoading) {
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
                <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">Home</Link>
                <Link href="/how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors">How it works</Link>
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
              <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">Home</Link>
              <Link href="/how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors">How it works</Link>
              {isAuthenticated ? (
                <>
                  <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 transition-colors">Dashboard</Link>
                  <Link href="/list-device" className="btn-primary px-6 py-2 rounded-xl">Sell Phone</Link>
                </>
              ) : (
                <Link href="/login" className="btn-primary px-6 py-2 rounded-xl">Login</Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-16 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            {/* Hero badge */}
            <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-8">
              <TrophyIcon className="w-4 h-4 mr-2" />
              Kerala's #1 Mobile Resale Platform
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Sell Your Phone in
              <span className="block text-green-600">24 Hours at Your Price</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Kerala's first verified vendor bidding marketplace for used phones.
            </p>
            
            {/* Trust Indicators */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <div className="flex items-center bg-green-100 px-4 py-2 rounded-full">
                <ShieldCheckIcon className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-green-700 font-medium">200+ Verified Vendors</span>
              </div>
              <div className="flex items-center bg-yellow-100 px-4 py-2 rounded-full">
                <StarSolidIcon className="w-5 h-5 text-yellow-500 mr-2" />
                <span className="text-yellow-700 font-medium">4.9/5 User Rating</span>
              </div>
            </div>
            
            {/* CTA Button */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              {isAuthenticated ? (
                <Link href="/list-device" className="btn-primary text-lg px-8 py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg transition-mobile inline-flex items-center justify-center">
                  Sell Your Phone Now
                  <ArrowRightIcon className="w-5 h-5 ml-2" />
                </Link>
              ) : (
                <Link href="/login" className="btn-primary text-lg px-8 py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg transition-mobile inline-flex items-center justify-center">
                  Sell Your Phone Now
                  <ArrowRightIcon className="w-5 h-5 ml-2" />
                </Link>
              )}
            </div>

            {/* Hero Phone Image */}
            <div className="flex justify-center">
              <div className="relative max-w-md mx-auto">
                <Image
                  src="/images/phone.png"
                  alt="Selliko - Kerala's premier phone resale platform"
                  width={400}
                  height={400}
                  className="object-contain drop-shadow-2xl"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brands We Accept */}
      <section className="py-16 bg-gradient-to-r from-gray-50 to-blue-50/30">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">We accept all major brands</h3>
          <p className="text-gray-600 mb-8">From premium flagships to budget-friendly devices</p>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6 items-center">
            {/* Apple */}
            <div className="flex flex-col items-center group cursor-pointer">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-3 group-hover:shadow-md transition-shadow border border-gray-100">
                <div className="text-2xl font-bold text-gray-700" style={{ fontFamily: 'system-ui' }}>
                  
                </div>
              </div>
              <span className="text-sm font-medium text-gray-700">Apple</span>
            </div>

            {/* Samsung */}
            <div className="flex flex-col items-center group cursor-pointer">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-3 group-hover:shadow-md transition-shadow border border-gray-100">
                <span className="text-lg font-bold text-blue-600" style={{ fontFamily: 'Arial, sans-serif' }}>S</span>
              </div>
              <span className="text-sm font-medium text-gray-700">Samsung</span>
            </div>

            {/* OnePlus */}
            <div className="flex flex-col items-center group cursor-pointer">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-3 group-hover:shadow-md transition-shadow border border-gray-100">
                <span className="text-lg font-bold text-red-600">1+</span>
              </div>
              <span className="text-sm font-medium text-gray-700">OnePlus</span>
            </div>

            {/* Xiaomi */}
            <div className="flex flex-col items-center group cursor-pointer">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-3 group-hover:shadow-md transition-shadow border border-gray-100">
                <span className="text-lg font-bold text-orange-600">Mi</span>
              </div>
              <span className="text-sm font-medium text-gray-700">Xiaomi</span>
            </div>

            {/* Oppo */}
            <div className="flex flex-col items-center group cursor-pointer">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-3 group-hover:shadow-md transition-shadow border border-gray-100">
                <span className="text-lg font-bold text-green-600">O</span>
              </div>
              <span className="text-sm font-medium text-gray-700">Oppo</span>
            </div>

            {/* Vivo */}
            <div className="flex flex-col items-center group cursor-pointer">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-3 group-hover:shadow-md transition-shadow border border-gray-100">
                <span className="text-lg font-bold text-purple-600">V</span>
              </div>
              <span className="text-sm font-medium text-gray-700">Vivo</span>
            </div>

            {/* Realme */}
            <div className="flex flex-col items-center group cursor-pointer">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-3 group-hover:shadow-md transition-shadow border border-gray-100">
                <span className="text-lg font-bold text-yellow-600">R</span>
              </div>
              <span className="text-sm font-medium text-gray-700">Realme</span>
            </div>

            {/* More */}
            <div className="flex flex-col items-center group cursor-pointer">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-3 group-hover:shadow-md transition-shadow border border-gray-100">
                <span className="text-lg font-bold text-gray-600">+10</span>
              </div>
              <span className="text-sm font-medium text-gray-700">& More</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Sell your phone in <span className="text-green-600">3 simple steps</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our streamlined process makes selling your phone fast, secure, and profitable
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-12">
            {/* Step 1 */}
            <div className="relative text-center">
              {/* Step Number */}
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-900 text-white rounded-full text-2xl font-bold mb-8">
                1
              </div>
              
              {/* Icon */}
              <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-gray-100">
                <DevicePhoneMobileIcon className="w-10 h-10 text-gray-700" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Upload & List</h3>
              <p className="text-gray-600 leading-relaxed mb-6 max-w-sm mx-auto">
                Take photos of your device, enter specifications, and set your asking price. Our smart wizard guides you through the entire process.
              </p>
              
              <div className="space-y-3 text-sm text-gray-500">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                  <span>4-angle photo upload</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                  <span>IMEI verification</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                  <span>Set your price</span>
                </div>
              </div>
              
              {/* Connection Line */}
              <div className="hidden md:block absolute top-8 left-full w-12 h-px bg-gray-200" style={{ width: 'calc(100% - 2rem)', left: 'calc(50% + 2rem)' }}></div>
            </div>
            
            {/* Step 2 */}
            <div className="relative text-center">
              {/* Step Number */}
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-900 text-white rounded-full text-2xl font-bold mb-8">
                2
              </div>
              
              {/* Icon */}
              <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-gray-100">
                <CurrencyRupeeIcon className="w-10 h-10 text-gray-700" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Get Competitive Bids</h3>
              <p className="text-gray-600 leading-relaxed mb-6 max-w-sm mx-auto">
                Verified vendors across Kerala compete to give you the best price. Receive multiple offers within hours of listing.
              </p>
              
              <div className="space-y-3 text-sm text-gray-500">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                  <span>200+ verified vendors</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                  <span>Real-time bidding</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                  <span>Instant notifications</span>
                </div>
              </div>
              
              {/* Connection Line */}
              <div className="hidden md:block absolute top-8 left-full w-12 h-px bg-gray-200" style={{ width: 'calc(100% - 2rem)', left: 'calc(50% + 2rem)' }}></div>
            </div>
            
            {/* Step 3 */}
            <div className="relative text-center">
              {/* Step Number */}
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-900 text-white rounded-full text-2xl font-bold mb-8">
                3
              </div>
              
              {/* Icon */}
              <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-gray-100">
                <ShieldCheckIcon className="w-10 h-10 text-gray-700" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Doorstep Verification</h3>
              <p className="text-gray-600 leading-relaxed mb-6 max-w-sm mx-auto">
                Our certified agents visit your location, verify the device condition, and complete the payment instantly.
              </p>
              
              <div className="space-y-3 text-sm text-gray-500">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                  <span>Professional verification</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                  <span>Same-day pickup</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                  <span>Instant payment</span>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Badge */}
          <div className="text-center mt-20">
            <div className="inline-flex items-center px-8 py-4 bg-gray-50 rounded-full border border-gray-200">
              <ShieldCheckIcon className="w-5 h-5 text-gray-700 mr-3" />
              <span className="text-gray-800 font-medium">100% Safe & Secure Process</span>
            </div>
          </div>
        </div>
      </section>

      {/* Why RePhone? */}
      <section className="py-20 bg-gradient-to-r from-gray-50 to-green-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why selliko?</h2>
            <p className="text-lg text-gray-600">Upload phone and get your asking price in minutes.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* 24 Hours */}
            <div className="card-mobile bg-white/80 backdrop-blur-sm p-6 text-center hover:card-elevated transition-mobile">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ClockIcon className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">24 Hours</h3>
              <p className="text-gray-600 text-sm">Turnaround from listing to verification and pickup.</p>
            </div>

            {/* Verified */}
            <div className="card-mobile bg-white/80 backdrop-blur-sm p-6 text-center hover:card-elevated transition-mobile">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ShieldCheckIcon className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Verified</h3>
              <p className="text-gray-600 text-sm">All vendors go through our verification process.</p>
            </div>

            {/* Your Price */}
            <div className="card-mobile bg-white/80 backdrop-blur-sm p-6 text-center hover:card-elevated transition-mobile">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CurrencyRupeeIcon className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Your Price</h3>
              <p className="text-gray-600 text-sm">Set your asking price and get competitive bids.</p>
            </div>

            {/* Doorstep */}
            <div className="card-mobile bg-white/80 backdrop-blur-sm p-6 text-center hover:card-elevated transition-mobile">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <UserGroupIcon className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Doorstep</h3>
              <p className="text-gray-600 text-sm">Convenient pickup and payment at your location.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="card-mobile bg-white/80 backdrop-blur-sm p-8 lg:p-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">R</span>
              </div>
            </div>
            
            <blockquote className="text-xl md:text-2xl text-gray-900 font-medium mb-6">
              "I sold my <span className="text-green-600 font-bold">iPhone 12</span> in less than{' '}
              <span className="text-green-600 font-bold">6 hours!</span> The vendors bought it for my price. 
              The agents came to my home, verified the phone, and paid me cash. 
              <span className="text-green-600 font-bold">Excellent service!</span>"
            </blockquote>
            
            <div className="flex flex-col items-center">
              <div className="w-4 h-4 bg-red-500 rounded-full mb-2"></div>
              <cite className="text-gray-700 font-semibold">Rahul M.</cite>
              <p className="text-gray-500 text-sm">Kochi, Kerala</p>
              <p className="text-gray-500 text-sm">iPhone 12, 128GB</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to turn your used phone into cash?
          </h2>
          <p className="text-xl mb-8 text-green-100">
            Join thousands of satisfied sellers across Kerala.
          </p>
          {isAuthenticated ? (
            <Link href="/list-device" className="inline-flex items-center px-8 py-4 bg-white text-green-600 font-semibold text-lg rounded-xl hover:bg-gray-50 transition-mobile shadow-lg active-scale-sm">
              Sell Your Phone Now
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </Link>
          ) : (
            <Link href="/login" className="inline-flex items-center px-8 py-4 bg-white text-green-600 font-semibold text-lg rounded-xl hover:bg-gray-50 transition-mobile shadow-lg active-scale-sm">
              Sell Your Phone Now
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </Link>
          )}
        </div>
      </section>

      {/* Test Accounts Section */}
      <section className="py-12 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <h3 className="text-xl font-semibold mb-2">📱 Quick Demo Access</h3>
            <p className="text-gray-400 text-sm">One-click login to explore different user experiences</p>
          </div>
          
          <div className="text-center">
            <TestLoginButton />
          </div>
          
          <div className="text-center mt-6">
            <p className="text-xs text-gray-500">
              * Demo accounts simulate WhatsApp OTP login experience
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-6">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-400">made by fairtreez</p>
        </div>
      </footer>
    </div>
  )
}
