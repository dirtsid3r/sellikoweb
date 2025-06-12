'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Icons } from '@/components/ui/icons'
import { toast } from 'react-hot-toast'
import sellikoClient from '@/selliko-client'
import Link from 'next/link'

export default function VerifyOTPPage() {
  console.log('[VERIFY-OTP] Page loaded')
  
  const [otp, setOtp] = useState('')
  const [phone, setPhone] = useState('')
  const [otpId, setOtpId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const [criticalError, setCriticalError] = useState<string | null>(null)
  const router = useRouter()

  console.log('🔧 [VERIFY-OTP] Initial state set:', {
    otp: otp.length > 0 ? `${otp.length} digits` : 'empty',
    phone: phone || 'empty',
    otpId: otpId ? 'set' : 'empty',
    isLoading,
    countdown,
    canResend
  })

  useEffect(() => {
    console.log('⚡ [VERIFY-OTP] useEffect triggered - checking localStorage')
    
    // Check if we're in a redirect loop
    const isRedirectComplete = sessionStorage.getItem('auth_redirect_complete')
    if (isRedirectComplete) {
      console.log('🔄 [VERIFY-OTP] Auth redirect already completed, clearing flag')
      sessionStorage.removeItem('auth_redirect_complete')
      setCriticalError('Session expired or invalid. Please start from the login page.')
      return
    }
    
    // Get phone and otpId from localStorage
    const pendingPhone = localStorage.getItem('pendingPhone')
    const pendingOtpId = localStorage.getItem('pendingOtpId')
    const pendingUserId = localStorage.getItem('pendingUserId')

    console.log('📱 [VERIFY-OTP] LocalStorage data retrieved:', {
      pendingPhone: pendingPhone || 'NOT_FOUND',
      pendingOtpId: pendingOtpId || 'NOT_FOUND',
      pendingUserId: pendingUserId || 'NOT_FOUND'
    })

    const missingFields = []
    if (!pendingPhone) missingFields.push('pendingPhone')
    if (!pendingOtpId) missingFields.push('pendingOtpId')
    // pendingUserId is optional for now
    if (missingFields.length > 0) {
      const details = `Missing required field(s): ${missingFields.join(', ')}`
      const troubleshooting = [
        '• This can happen if you refresh the page, open it in a new tab, or your session expired.',
        '• Please start the login process again.',
        '• If the problem persists, clear your browser cache and cookies.'
      ].join('\n')
      setCriticalError(`${details}.\n\nTroubleshooting:\n${troubleshooting}`)
      toast.error('Please start from login page')
      return
    }

    console.log('✅ [VERIFY-OTP] Required data found, setting state')
    setPhone(pendingPhone)
    setOtpId(pendingOtpId)

    console.log('⏰ [VERIFY-OTP] Starting countdown timer')
    // Start countdown timer
    const timer = setInterval(() => {
      console.log('⏱️ [VERIFY-OTP] Timer tick')
      setCountdown((prev) => {
        const newCount = prev - 1
        console.log(`⏱️ [VERIFY-OTP] Countdown: ${prev} -> ${newCount}`)
        
        if (newCount <= 0) {
          console.log('🔄 [VERIFY-OTP] Countdown finished, enabling resend')
          setCanResend(true)
          clearInterval(timer)
          return 0
        }
        return newCount
      })
    }, 1000)

    console.log('🧹 [VERIFY-OTP] Setting up cleanup function')
    return () => {
      console.log('🧹 [VERIFY-OTP] Cleaning up timer')
      clearInterval(timer)
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🚀 [VERIFY-OTP] Form submission started')
    console.log('📊 [VERIFY-OTP] Form data:', {
      otpLength: otp.length,
      otp: otp ? '***masked***' : 'empty',
      otpId: otpId ? 'present' : 'missing',
      phone: phone ? phone.substring(0, 5) + '***' : 'missing'
    })
    
    if (otp.length !== 6) {
      console.error('❌ [VERIFY-OTP] Invalid OTP length:', otp.length)
      toast.error('Please enter a valid 6-digit OTP')
      return
    }

    console.log('✅ [VERIFY-OTP] OTP validation passed, starting verification')
    setIsLoading(true)

    try {
      console.log('🌐 [VERIFY-OTP] Calling sellikoClient.verifyAuthOTP...')
      console.log('📤 [VERIFY-OTP] API Request params:', {
        otp: '***masked***',
        otpId: otpId ? 'present' : 'missing',
        phone: phone ? phone.substring(0, 5) + '***' : 'missing'
      })

      const result = await sellikoClient.verifyAuthOTP(otp, otpId, phone)
      
      console.log('📥 [VERIFY-OTP] API Response received:', {
        success: result.success,
        hasUser: !!result.user,
        hasSession: !!result.session,
        userRole: result.user?.user_role || 'NOT_FOUND',
        errorMessage: result.error || 'NO_ERROR'
      })

      if (result.success) {
        console.log('🎉 [VERIFY-OTP] Verification successful!')
        if (result.user) {
          console.log('👤 [VERIFY-OTP] User data from API:', result.user)
        }
        if (result.session) {
          console.log('🔐 [VERIFY-OTP] Session data:', result.session)
        }
        toast.success('Login successful!')
        localStorage.removeItem('pendingPhone')
        localStorage.removeItem('pendingOtpId')
        localStorage.removeItem('pendingUserId')
        localStorage.removeItem('selliko_instance_id')
        let userRole = result.user?.user_role || result.user?.role || 'client';
        if (typeof userRole !== 'string') userRole = 'client';
        const normalizedRole = userRole.trim().toLowerCase();
        const validRoles = ['client', 'vendor', 'agent', 'admin'];
        const targetRoute = validRoles.includes(normalizedRole) ? `/${normalizedRole}` : '/client';
        console.log('[VERIFY-OTP] Routing decision:', {
          userRole,
          normalizedRole,
          targetRoute,
          userObj: result.user
        });
        setTimeout(() => {
          console.log(`🔄 [VERIFY-OTP] Redirecting to: ${targetRoute}`);
          window.location.replace(targetRoute);
        }, 100); // allow logs to flush
        return;
      } else {
        console.error('❌ [VERIFY-OTP] Verification failed')
        console.error('📋 [VERIFY-OTP] Error details:', {
          error: result.error || 'NO_ERROR_MESSAGE',
          success: result.success,
          hasData: !!result.data
        })
        toast.error(result.error || 'Invalid OTP. Please try again.')
        // No redirect or navigation here
      }
    } catch (error: any) {
      console.error('💥 [VERIFY-OTP] Exception during verification:', error)
      console.error('📋 [VERIFY-OTP] Error stack:', error.stack)
      console.error('📋 [VERIFY-OTP] Error details:', {
        name: error.name,
        message: error.message,
        cause: error.cause
      })
      toast.error('Something went wrong. Please try again.')
    } finally {
      console.log('🏁 [VERIFY-OTP] Setting loading to false')
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
    console.log('🔄 [VERIFY-OTP] Resend OTP requested')
    console.log('🔍 [VERIFY-OTP] Resend conditions:', {
      canResend,
      isLoading,
      phone: phone ? phone.substring(0, 5) + '***' : 'missing'
    })

    if (!canResend) {
      console.warn('⚠️ [VERIFY-OTP] Resend not allowed yet')
      return
    }

    console.log('🚀 [VERIFY-OTP] Starting resend process')
    setIsLoading(true)
    setCanResend(false)
    setCountdown(60)

    try {
      console.log('🌐 [VERIFY-OTP] Calling sellikoClient.getAuthOTP for resend...')
      const result = await sellikoClient.getAuthOTP(phone)
      
      console.log('📥 [VERIFY-OTP] Resend API Response:', {
        success: result.success,
        hasOtpId: !!result.otp_id,
        errorMessage: result.error || 'NO_ERROR'
      })
      
      if (result.success) {
        console.log('✅ [VERIFY-OTP] OTP resent successfully')
        toast.success('OTP sent successfully!')
        
        const newOtpId = result.otp_id || ''
        console.log('🔄 [VERIFY-OTP] Updating OTP ID:', {
          oldOtpId: otpId ? 'present' : 'missing',
          newOtpId: newOtpId ? 'present' : 'missing'
        })
        
        setOtpId(newOtpId)
        localStorage.setItem('pendingOtpId', newOtpId)
        
        console.log('⏰ [VERIFY-OTP] Restarting countdown timer')
        // Restart countdown
        const timer = setInterval(() => {
          console.log('⏱️ [VERIFY-OTP] Resend timer tick')
          setCountdown((prev) => {
            const newCount = prev - 1
            console.log(`⏱️ [VERIFY-OTP] Resend countdown: ${prev} -> ${newCount}`)
            
            if (newCount <= 0) {
              console.log('🔄 [VERIFY-OTP] Resend countdown finished')
              setCanResend(true)
              clearInterval(timer)
              return 0
            }
            return newCount
          })
        }, 1000)
      } else {
        console.error('❌ [VERIFY-OTP] Resend failed')
        toast.error(result.error || 'Failed to resend OTP')
        console.log('🔄 [VERIFY-OTP] Re-enabling resend button due to error')
        setCanResend(true)
      }
    } catch (error: any) {
      console.error('💥 [VERIFY-OTP] Exception during resend:', error)
      console.error('📋 [VERIFY-OTP] Error details:', error)
      toast.error('Failed to resend OTP. Please try again.')
      console.log('🔄 [VERIFY-OTP] Re-enabling resend button due to exception')
      setCanResend(true)
    } finally {
      console.log('🏁 [VERIFY-OTP] Resend process completed, setting loading to false')
      setIsLoading(false)
    }
  }

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value
    const value = rawValue.replace(/\D/g, '').slice(0, 6)
    
    console.log('⌨️ [VERIFY-OTP] OTP input change:', {
      rawValue: rawValue ? '***masked***' : 'empty',
      processedValue: value ? `${value.length} digits` : 'empty',
      isComplete: value.length === 6
    })
    
    setOtp(value)
  }

  const formatPhone = (phoneNumber: string) => {
    console.log('📱 [VERIFY-OTP] Formatting phone number')
    if (phoneNumber.startsWith('+91')) {
      const formatted = phoneNumber.replace('+91', '+91 ').replace(/(\d{5})(\d{5})/, '$1 $2')
      console.log('📱 [VERIFY-OTP] Phone formatted:', {
        original: phoneNumber.substring(0, 5) + '***',
        formatted: formatted.substring(0, 8) + '***'
      })
      return formatted
    }
    return phoneNumber
  }

  // Component render logging
  console.log('🎨 [VERIFY-OTP] Component rendering with state:', {
    otpLength: otp.length,
    hasPhone: !!phone,
    hasOtpId: !!otpId,
    isLoading,
    countdown,
    canResend,
    isOtpComplete: otp.length === 6
  })

  if (criticalError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <div className="w-full max-w-md text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-2xl mb-4">
            <Icons.x className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-red-700 mb-2">Authentication Error</h1>
          <pre className="bg-red-50 text-red-800 rounded-lg p-4 text-left whitespace-pre-wrap mb-4 border border-red-200">
            {criticalError}
          </pre>
          <Link href="/login" className="text-blue-600 hover:underline font-medium">Go to Login</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md">
        {/* Logo and Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <Icons.shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Verify OTP</h1>
          <p className="text-gray-600 mt-2">Enter the code sent to {formatPhone(phone)}</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold text-center">Enter Verification Code</CardTitle>
            <CardDescription className="text-center">
              We've sent a 6-digit code to your WhatsApp
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="123456"
                  value={otp}
                  onChange={handleOtpChange}
                  className="text-center text-2xl font-mono tracking-widest"
                  maxLength={6}
                  required
                  autoComplete="one-time-code"
                  onFocus={() => console.log('🎯 [VERIFY-OTP] OTP input focused')}
                  onBlur={() => console.log('👋 [VERIFY-OTP] OTP input blurred')}
                />
                <p className="text-xs text-gray-500 text-center">
                  Check your WhatsApp for the verification code
                </p>
                {/* Debug info */}
                <div className="text-xs text-gray-400 text-center font-mono">
                  Debug: {otp.length}/6 digits • OTP ID: {otpId ? '✓' : '✗'} • Phone: {phone ? '✓' : '✗'}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || otp.length !== 6}
                onClick={() => console.log('🖱️ [VERIFY-OTP] Submit button clicked')}
              >
                {isLoading ? (
                  <>
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Icons.check className="mr-2 h-4 w-4" />
                    Verify & Sign In
                  </>
                )}
              </Button>

              {/* Resend OTP */}
              <div className="text-center">
                {canResend ? (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      console.log('🖱️ [VERIFY-OTP] Resend button clicked')
                      handleResendOTP()
                    }}
                    disabled={isLoading}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Icons.messageCircle className="mr-2 h-4 w-4" />
                    Resend OTP
                  </Button>
                ) : (
                  <p className="text-sm text-gray-500">
                    Resend OTP in {countdown} seconds
                  </p>
                )}
                {/* Debug countdown info */}
                <div className="text-xs text-gray-400 font-mono mt-1">
                  Debug: Timer {countdown}s • Can resend: {canResend ? '✓' : '✗'} • Loading: {isLoading ? '✓' : '✗'}
                </div>
              </div>
            </form>

            {/* Back to Login */}
            <div className="mt-6 text-center">
              <Link 
                href="/login" 
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                onClick={() => console.log('🔄 [VERIFY-OTP] Back to login clicked')}
              >
                ← Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Security Note */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <div className="flex items-center justify-center space-x-2">
            <Icons.shield className="w-3 h-3" />
            <span>Your data is protected with end-to-end encryption</span>
          </div>
        </div>

        {/* Debug Panel */}
        <div className="mt-4 p-3 bg-gray-100 rounded-lg text-xs font-mono">
          <div className="font-bold mb-2">Debug Info:</div>
          <div>OTP: {otp ? `${otp.length}/6 digits` : 'empty'}</div>
          <div>Phone: {phone ? phone.substring(0, 8) + '***' : 'not set'}</div>
          <div>OTP ID: {otpId ? 'present' : 'missing'}</div>
          <div>Loading: {isLoading ? 'yes' : 'no'}</div>
          <div>Countdown: {countdown}s</div>
          <div>Can Resend: {canResend ? 'yes' : 'no'}</div>
          <div>Submit Ready: {otp.length === 6 && !isLoading ? 'yes' : 'no'}</div>
        </div>
      </div>
    </div>
  )
} 