'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Icons } from '@/components/ui/icons'
import { toast } from 'react-hot-toast'
import sellikoClient from '@/selliko-client'
import Link from 'next/link'

export default function SignInPage() {
  console.log('🚀 [LOGIN] Component initialization started')
  
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const [isMounted, setIsMounted] = useState(false)

  console.log('🔧 [LOGIN] Initial state set:', {
    phoneNumber: phoneNumber || 'empty',
    isLoading,
    isMounted
  })

  // Check authentication status and redirect if needed
  useEffect(() => {
    const checkAuth = async () => {
      console.log('🔒 [LOGIN] Checking authentication status...')
      try {
        const user = await sellikoClient.getCurrentUser()
        console.log('👤 [LOGIN] Current user:', user ? {
          id: user.id,
          role: user.user_role,
        } : 'No user found')
        
        if (user) {
          console.log('✅ [LOGIN] User is authenticated, redirecting...')
          const userRole = (user.user_role || user.role || '').toLowerCase()
          router.replace(`/${userRole}`)
          return
        }
        
        console.log('ℹ️ [LOGIN] No authenticated user, showing login page')
      } catch (error) {
        console.error('❌ [LOGIN] Error checking auth status:', error)
      }
      
      setIsMounted(true)
    }

    checkAuth()
    
    if (typeof window !== 'undefined') {
      console.log('🧹 [LOGIN] Clearing previous pending data from localStorage')
      localStorage.removeItem('pendingPhone')
      localStorage.removeItem('pendingOtpId')
      localStorage.removeItem('pendingUserId')
      
      console.log('📱 [LOGIN] LocalStorage after cleanup:', {
        pendingPhone: localStorage.getItem('pendingPhone') || 'CLEARED',
        pendingOtpId: localStorage.getItem('pendingOtpId') || 'CLEARED',
        pendingUserId: localStorage.getItem('pendingUserId') || 'CLEARED'
      })
    }
  }, [router])

  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Only allow digits, max 10 characters, must start with 6-9
    const digitsOnly = value.replace(/\D/g, '').slice(0, 10)
    
    console.log('⌨️ [LOGIN] Phone input change:', {
      rawValue: value ? value.substring(0, 3) + '***' : 'empty',
      processedValue: digitsOnly ? digitsOnly.substring(0, 3) + '***' : 'empty',
      length: digitsOnly.length,
      isValid: digitsOnly.length === 10 && /^[6-9]/.test(digitsOnly)
    })
    
    if (digitsOnly === '' || /^[6-9]/.test(digitsOnly)) {
      setPhoneNumber(digitsOnly)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🚀 [LOGIN] Form submission started')
    console.log('📊 [LOGIN] Form data:', {
      phoneLength: phoneNumber.length,
      phonePreview: phoneNumber ? phoneNumber.substring(0, 3) + '***' : 'empty',
      isValid: phoneNumber.match(/^[6-9]\d{9}$/),
      isLoading
    })
    
    if (!phoneNumber.match(/^[6-9]\d{9}$/)) {
      console.error('❌ [LOGIN] Invalid phone number format')
      toast.error('Please enter a valid 10-digit mobile number')
      return
    }

    console.log('✅ [LOGIN] Phone validation passed, starting OTP request')
    setIsLoading(true)
    const fullPhone = `+91${phoneNumber}`
    
    console.log('📞 [LOGIN] Formatted phone number:', {
      original: phoneNumber.substring(0, 3) + '***',
      formatted: fullPhone.substring(0, 6) + '***'
    })

    try {
      console.log('🌐 [LOGIN] Calling sellikoClient.getAuthOTP...')
      const result = await sellikoClient.getAuthOTP(fullPhone)
      
      console.log('📥 [LOGIN] API Response received:', {
        success: result.success,
        hasOtp: !!result.otp,
        hasOtpId: !!result.otp_id,
        hasUserId: !!result.user_id,
        otpIdValue: result.otp_id || 'MISSING',
        userIdValue: result.user_id || 'MISSING',
        errorMessage: result.error || 'NO_ERROR'
      })
      
      if (result.success) {
        console.log('🎉 [LOGIN] OTP sent successfully!')
        toast.success('OTP sent successfully!')
        
        console.log('💾 [LOGIN] Storing data in localStorage...')
        console.log('💾 [LOGIN] Values to store:', {
          pendingPhone: fullPhone.substring(0, 6) + '***',
          pendingOtpId: result.otp_id || 'UNDEFINED',
          pendingUserId: result.user_id || 'UNDEFINED'
        })
        
        localStorage.setItem('pendingPhone', fullPhone)
        localStorage.setItem('pendingOtpId', result.otp_id || '')
        localStorage.setItem('pendingUserId', result.user_id || '')
        
        console.log('📱 [LOGIN] LocalStorage after storing:', {
          pendingPhone: localStorage.getItem('pendingPhone') || 'NOT_STORED',
          pendingOtpId: localStorage.getItem('pendingOtpId') || 'NOT_STORED',
          pendingUserId: localStorage.getItem('pendingUserId') || 'NOT_STORED'
        })
        
        console.log('🔄 [LOGIN] Navigating to verify-otp page...')
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
      console.log('🏁 [LOGIN] Setting loading to false')
      setIsLoading(false)
    }
  }

  const isValid = phoneNumber.length === 10

  // Component render logging
  console.log('🎨 [LOGIN] Component rendering with state:', {
    phoneLength: phoneNumber.length,
    isValid,
    isLoading,
    isMounted
  })

  // Prevent hydration mismatch by not rendering until mounted
  if (!isMounted) {
    console.log('⏳ [LOGIN] Component not mounted yet, showing loading...')
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
                      onFocus={() => console.log('🎯 [LOGIN] Phone input focused')}
                      onBlur={() => console.log('👋 [LOGIN] Phone input blurred')}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    We'll send you an OTP via WhatsApp to verify your number
                  </p>
                  {/* Debug info */}
                  <div className="text-xs text-gray-400 text-center font-mono">
                    Debug: {phoneNumber.length}/10 digits • Valid: {isValid ? '✓' : '✗'} • Loading: {isLoading ? '✓' : '✗'}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !isValid}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  onClick={() => console.log('🖱️ [LOGIN] Submit button clicked')}
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

          {/* Debug Panel */}
          <div className="mt-4 p-3 bg-gray-100 rounded-lg text-xs font-mono">
            <div className="font-bold mb-2">Debug Info:</div>
            <div>Phone: {phoneNumber ? `${phoneNumber.length}/10 digits` : 'empty'}</div>
            <div>Valid: {isValid ? 'yes' : 'no'}</div>
            <div>Loading: {isLoading ? 'yes' : 'no'}</div>
            <div>Mounted: {isMounted ? 'yes' : 'no'}</div>
            <div>Submit Ready: {isValid && !isLoading ? 'yes' : 'no'}</div>
          </div>
        </div>
      </div>
    </div>
  )
} 