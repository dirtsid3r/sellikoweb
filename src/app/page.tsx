'use client'

import React from 'react'
import Link from 'next/link'
import { 
  ArrowRightIcon,
  DevicePhoneMobileIcon,
  ShieldCheckIcon,
  ClockIcon,
  StarIcon,
  UsersIcon,
  ArrowTrendingUpIcon,
  TrophyIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'
import MobileNavigation from '@/components/navigation/MobileNavigation'
import FeaturedDevices from '@/components/sections/FeaturedDevices'

import { useAuth } from '@/lib/auth'

function TestLoginButton() {
  const { loginAsTestVendor, loginAsTestClient, logout, user } = useAuth()

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
    <>
      <button
        onClick={loginAsTestVendor}
        className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
      >
        Login as Vendor (Kochi Mobile Store)
      </button>
      <button
        onClick={loginAsTestClient}
        className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
      >
        Login as Client (Pradeep Kumar)
      </button>
    </>
  )
}

export default function HomePage() {
  const { isAuthenticated } = useAuth()
  const [showLogin, setShowLogin] = React.useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Mobile-first Navigation */}
      <MobileNavigation />
      
      {/* Hero Section - Mobile First */}
      <section className="pt-8 pb-12 px-4 lg:pt-16 lg:pb-20">
        <div className="container mx-auto text-center max-w-4xl">
          {/* Hero badge */}
          <div className="inline-flex items-center px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-8 animate-fade-in">
            <TrophyIcon className="w-4 h-4 mr-2" />
            Kerala's #1 Mobile Resale Platform
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Sell Your Device,
            <span className="block text-primary">Get Best Price</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Join Kerala's most trusted mobile device auction platform. 
            Get verified buyers, transparent bidding, and secure payments.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            {isAuthenticated ? (
              <Link 
                href="/list-device" 
                className="btn-primary text-lg px-8 py-4 w-full sm:w-auto group transition-mobile"
              >
                Start Selling Now
                <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <button 
                onClick={() => setShowLogin(true)}
                className="btn-primary text-lg px-8 py-4 w-full sm:w-auto group transition-mobile"
              >
                Start Selling Now
                <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
            <Link 
              href="/how-it-works" 
              className="btn-secondary text-lg px-8 py-4 w-full sm:w-auto"
            >
              How It Works
            </Link>
          </div>
          
          {/* Social proof */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center">
              <div className="flex -space-x-2 mr-3">
                {[1,2,3,4].map((i) => (
                  <div key={i} className="w-8 h-8 bg-gray-300 rounded-full border-2 border-white"></div>
                ))}
              </div>
              <span>5,000+ Happy Sellers</span>
            </div>
            <div className="flex items-center">
              <StarIcon className="w-4 h-4 text-yellow-400 mr-1" />
              <span>4.9/5 Rating</span>
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Devices Section */}
      <FeaturedDevices />
      
      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose SELLIKO?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We've built Kerala's most advanced mobile resale platform with your success in mind.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card-mobile group hover:card-elevated cursor-pointer">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <ShieldCheckIcon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Verified Buyers</h3>
              <p className="text-gray-600 leading-relaxed">
                All buyers go through our 10-step verification process. Your device sells only to trusted, verified users.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="card-mobile group hover:card-elevated cursor-pointer">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <ClockIcon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">24-Hour Auctions</h3>
              <p className="text-gray-600 leading-relaxed">
                Quick, competitive bidding cycles ensure you get the best price without long waiting periods.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="card-mobile group hover:card-elevated cursor-pointer">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <ArrowTrendingUpIcon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Best Prices</h3>
              <p className="text-gray-600 leading-relaxed">
                Our auction system ensures competitive bidding, getting you 20-30% more than traditional resale.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Stats Section */}
      <section className="py-16 px-4 bg-primary text-white">
        <div className="container mx-auto max-w-4xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl lg:text-4xl font-bold mb-2">5,000+</div>
              <div className="text-primary-foreground/80">Devices Sold</div>
            </div>
            <div>
              <div className="text-3xl lg:text-4xl font-bold mb-2">₹2.5Cr+</div>
              <div className="text-primary-foreground/80">Value Exchanged</div>
            </div>
            <div>
              <div className="text-3xl lg:text-4xl font-bold mb-2">4.9/5</div>
              <div className="text-primary-foreground/80">User Rating</div>
            </div>
            <div>
              <div className="text-3xl lg:text-4xl font-bold mb-2">24hrs</div>
              <div className="text-primary-foreground/80">Avg. Sale Time</div>
            </div>
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How SELLIKO Works
            </h2>
            <p className="text-lg text-gray-600">
              Simple, secure, and fast - just 4 steps to sell your device
            </p>
          </div>
          
          <div className="space-y-8 lg:space-y-12">
            {[
              {
                step: "01",
                title: "List Your Device",
                description: "Upload photos and details using our smart 4-step wizard. Takes less than 5 minutes.",
                icon: DevicePhoneMobileIcon
              },
              {
                step: "02", 
                title: "Get Verified Bids",
                description: "Verified buyers compete in 24-hour auctions. Watch your price climb in real-time.",
                icon: UsersIcon
              },
              {
                step: "03",
                title: "Accept Best Offer",
                description: "Choose the highest bid or use instant win. Our agents handle verification.",
                icon: TrophyIcon
              },
              {
                step: "04",
                title: "Get Paid Securely",
                description: "Safe pickup, instant payment through Razorpay. Money in your account same day.",
                icon: ShieldCheckIcon
              }
            ].map((item, index) => (
              <div key={index} className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
                <div className="flex-shrink-0 w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <item.icon className="w-8 h-8 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-4xl font-bold text-primary/20">{item.step}</span>
                    <h3 className="text-2xl font-semibold text-gray-900">{item.title}</h3>
                  </div>
                  <p className="text-lg text-gray-600 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-primary to-blue-600 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Get the Best Price?
          </h2>
          <p className="text-xl mb-8 text-primary-foreground/90">
            Join thousands of satisfied sellers on Kerala's #1 mobile resale platform
          </p>
          {isAuthenticated ? (
            <Link 
              href="/sell" 
              className="inline-flex items-center px-8 py-4 bg-white text-primary font-semibold rounded-lg hover:bg-gray-50 transition-colors text-lg group active-scale"
            >
              Start Selling Now
              <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          ) : (
            <Link 
              href="/login"
              className="inline-flex items-center px-8 py-4 bg-white text-primary font-semibold rounded-lg hover:bg-gray-50 transition-colors text-lg group active-scale"
            >
              Start Selling Now
              <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <DevicePhoneMobileIcon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">SELLIKO</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Kerala's premier mobile device resale auction platform. Trusted by thousands of sellers.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <div className="space-y-2 text-gray-400">
                <Link href="/sell" className="block hover:text-white transition-colors">Sell Device</Link>
                <Link href="/buy" className="block hover:text-white transition-colors">Buy Devices</Link>
                <Link href="/how-it-works" className="block hover:text-white transition-colors">How It Works</Link>
                <Link href="/pricing" className="block hover:text-white transition-colors">Pricing</Link>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <div className="space-y-2 text-gray-400">
                <Link href="/help" className="block hover:text-white transition-colors">Help Center</Link>
                <Link href="/contact" className="block hover:text-white transition-colors">Contact Us</Link>
                <Link href="/safety" className="block hover:text-white transition-colors">Safety Tips</Link>
                <Link href="/faq" className="block hover:text-white transition-colors">FAQ</Link>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <div className="space-y-2 text-gray-400">
                <Link href="/privacy" className="block hover:text-white transition-colors">Privacy Policy</Link>
                <Link href="/terms" className="block hover:text-white transition-colors">Terms of Service</Link>
                <Link href="/refund" className="block hover:text-white transition-colors">Refund Policy</Link>
                <Link href="/cookies" className="block hover:text-white transition-colors">Cookie Policy</Link>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8">
            {/* Development Test Accounts */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mb-6 p-4 bg-gray-800 rounded-lg">
                <h5 className="text-sm font-semibold text-yellow-400 mb-3">🧪 Development Test Accounts</h5>
                <div className="flex flex-wrap gap-2">
                  <TestLoginButton />
                </div>
              </div>
            )}
            
            <div className="text-center text-gray-400">
              <p>&copy; 2024 SELLIKO. All rights reserved. Made with ❤️ in Kerala.</p>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Mobile bottom safe area */}
      <div className="safe-bottom lg:hidden"></div>


    </div>
  )
} 