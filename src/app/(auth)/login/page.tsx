'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Icons } from '@/components/ui/icons'
import { toast } from 'react-hot-toast'
import { useAuth } from '@/lib/auth'
import Link from 'next/link'

export default function SignInPage() {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { sendOTP } = useAuth()

  const [isMounted, setIsMounted] = useState(false)

  // Prevent hydration mismatches
  useEffect(() => {
    setIsMounted(true)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('pendingPhone')
      localStorage.removeItem('phoneDigits')
    }
  }, [])

  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Only allow digits, max 10 characters, must start with 6-9
    const digitsOnly = value.replace(/\D/g, '').slice(0, 10)
    
    if (digitsOnly === '' || /^[6-9]/.test(digitsOnly)) {
      setPhoneNumber(digitsOnly)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!phoneNumber.match(/^[6-9]\d{9}$/)) {
      toast.error('Please enter a valid 10-digit mobile number')
      return
    }

    setIsLoading(true)
    const fullPhone = `+91${phoneNumber}`

    try {
      const result = await sendOTP(fullPhone)
      
      if (result.success) {
        toast.success('OTP sent successfully!')
        localStorage.setItem('pendingPhone', fullPhone)
        localStorage.setItem('pendingOtpId', result.otpId || '')
        router.push('/verify-otp')
      } else {
        toast.error(result.error || 'Failed to send OTP')
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const isValid = phoneNumber.length === 10

  // Prevent hydration mismatch by not rendering until mounted
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Icons.spinner className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="flex justify-between items-center p-4 sm:p-6">
        <Link href="/" className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors">
          <Icons.smartphone className="w-5 h-5" />
          <span className="font-bold text-lg">SELLIKO</span>
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center px-4 pb-8">
        <div className="w-full max-w-md">
          {/* Hero Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl mb-6 shadow-lg">
              <Icons.smartphone className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              Welcome to SELLIKO
            </h1>
            <p className="text-gray-600 text-lg">
              Kerala's trusted mobile resale platform
            </p>
          </div>

          {/* Sign In Card */}
          <div className="bg-white rounded-2xl shadow-xl border-0 overflow-hidden">
            <div className="p-6 sm:p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign In</h2>
                <p className="text-gray-600">Enter your phone number to receive an OTP</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Phone Number Input */}
                <div>
                  <label htmlFor="mobile" className="block text-sm font-semibold text-gray-700 mb-3">
                    Phone Number
                  </label>
                  
                  <div className="relative">
                    {/* Phone Icon */}
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                      <Icons.phone className="w-5 h-5 text-gray-400" />
                    </div>
                    
                    {/* Country Code */}
                    <div className="absolute inset-y-0 left-11 flex items-center pl-3 pointer-events-none">
                      <span className="text-gray-600 font-medium">+91</span>
                    </div>
                    
                    {/* Input Field */}
                    <input
                      id="mobile"
                      type="tel"
                      inputMode="numeric"
                      pattern="[6-9][0-9]{9}"
                      placeholder="9876543210"
                      value={phoneNumber}
                      onChange={handlePhoneInput}
                      maxLength={10}
                      required
                      className="block w-full pl-24 pr-4 py-4 text-base border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder:text-gray-400"
                      autoComplete="tel"
                    />
                  </div>
                  
                  <div className="mt-3 flex items-center text-sm text-gray-500">
                    <Icons.messageCircle className="w-4 h-4 mr-2" />
                    We'll send you a 6-digit OTP via WhatsApp
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!isValid || isLoading}
                  className="w-full flex items-center justify-center px-6 py-4 text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
                >
                  {isLoading ? (
                    <>
                      <Icons.spinner className="animate-spin w-5 h-5 mr-3" />
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      <Icons.messageCircle className="w-5 h-5 mr-3" />
                      Send OTP via WhatsApp
                    </>
                  )}
                </button>
              </form>

              {/* Trust Indicators */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-2">
                      <Icons.shield className="w-5 h-5 text-green-600" />
                    </div>
                    <span className="text-xs text-gray-600 font-medium">Secure</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                      <Icons.clock className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-xs text-gray-600 font-medium">Quick Verification</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                      <Icons.users className="w-5 h-5 text-purple-600" />
                    </div>
                    <span className="text-xs text-gray-600 font-medium">Trusted by 1000+</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              By continuing, you agree to our{' '}
              <Link href="/terms" className="text-blue-600 hover:text-blue-700 font-medium">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-blue-600 hover:text-blue-700 font-medium">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 