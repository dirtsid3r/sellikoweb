'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Icons } from '@/components/ui/icons'
import { toast } from 'react-hot-toast'
import sellikoClient from '@/selliko-client'
import Link from 'next/link'

export default function SignInPage() {
  
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const [isMounted, setIsMounted] = useState(false)

  // Check authentication status and redirect if needed
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await sellikoClient.getCurrentUser()
        
        if (user) {
          const userRole = (user.user_role || user.role || '').toLowerCase()
          router.replace(`/${userRole}`)
          return
        }
        
      } catch (error) {
        console.error('❌ [LOGIN] Error checking auth status:', error)
      }
      
      setIsMounted(true)
    }

    checkAuth()
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('pendingPhone')
      localStorage.removeItem('pendingOtpId')
      localStorage.removeItem('pendingUserId')
      localStorage.removeItem('pendingOtp')
      
    }
  }, [router])

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
      const result = await sellikoClient.getAuthOTP(fullPhone)
      
      if (result.success) {
        toast.success('OTP sent successfully!')
        
        localStorage.setItem('pendingPhone', fullPhone)
        localStorage.setItem('pendingOtpId', result.otp_id || '')
        localStorage.setItem('pendingUserId', result.user_id || '')
        // Store the OTP returned from the API so it can be pre-filled in verify-otp
        localStorage.setItem('pendingOtp', result.otp || '')
        
        router.push('/verify-otp')
      } else {
        console.error('❌ [LOGIN] OTP sending failed')
        console.error('📋 [LOGIN] Error details:', {
          error: result.error || 'NO_ERROR_MESSAGE',
          success: result.success,
          fullResponse: Object.keys(result)
        })
        toast.error(result.error || 'Failed to send OTP')
      }
    } catch (error) {
      console.error('💥 [LOGIN] Exception during OTP request:', error)
      console.error('📋 [LOGIN] Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      })
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
      <div className="flex items-center justify-center min-h-[calc(100vh-100px)] px-4">
        <div className="w-full max-w-md">
          {/* Logo and Branding */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
              <Icons.smartphone className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome to SELLIKO</h1>
            <p className="text-gray-600 mt-2">Sign in to access your account</p>
          </div>

          {/* Login Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-900">Sign In</h2>
                <p className="text-gray-600 mt-1">Enter your mobile number to continue</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 text-sm">+91</span>
                    </div>
                    <input
                      id="phone"
                      type="tel"
                      placeholder="9876543210"
                      value={phoneNumber}
                      onChange={handlePhoneInput}
                      className="block w-full pl-12 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                      maxLength={10}
                      required
                      autoComplete="tel"
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    We'll send you an OTP via WhatsApp to verify your number
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !isValid}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {isLoading ? (
                    <>
                      <Icons.spinner className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      <Icons.messageCircle className="mr-2 h-5 w-5" />
                      Send OTP
                    </>
                  )}
                </button>
              </form>

              {/* Terms and Privacy */}
              <div className="text-center text-xs text-gray-500">
                By continuing, you agree to our{' '}
                <Link href="/terms" className="text-blue-600 hover:text-blue-800">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-blue-600 hover:text-blue-800">
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="mt-8 text-center">
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Icons.shield className="w-4 h-4 text-green-500" />
                <span>Secure</span>
              </div>
              <div className="flex items-center space-x-1">
                <Icons.zap className="w-4 h-4 text-yellow-500" />
                <span>Fast</span>
              </div>
              <div className="flex items-center space-x-1">
                <Icons.smartphone className="w-4 h-4 text-blue-500" />
                <span>Mobile First</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 