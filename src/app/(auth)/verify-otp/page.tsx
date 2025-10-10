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
  
  const [otp, setOtp] = useState('')
  const [phone, setPhone] = useState('')
  const [otpId, setOtpId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const [criticalError, setCriticalError] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined

    const checkAuthAndSetup = async () => {
      try {
        const user = await sellikoClient.getCurrentUser()
        
        if (user) {
          const userRole = (user.user_role || user.role || '').toLowerCase()
          router.replace(`/${userRole}`)
          return
        }
        
        // Continue with the original setup logic
        
        // Check if we're in a redirect loop
        const isRedirectComplete = sessionStorage.getItem('auth_redirect_complete')
        if (isRedirectComplete) {
          setCriticalError('Session expired or invalid. Please start from the login page.')
          setIsMounted(true)
          return
        }
        
        // Get phone and otpId from localStorage
        const pendingPhone = localStorage.getItem('pendingPhone')
        const pendingOtpId = localStorage.getItem('pendingOtpId')
        const pendingUserId = localStorage.getItem('pendingUserId')
        const pendingOtp = localStorage.getItem('pendingOtp')

        const missingFields = []
        if (!pendingPhone) missingFields.push('pendingPhone')
        if (!pendingOtpId) missingFields.push('pendingOtpId')
        
        if (missingFields.length > 0) {
          const details = `Missing required field(s): ${missingFields.join(', ')}`
          const troubleshooting = [
            '• This can happen if you refresh the page, open it in a new tab, or your session expired.',
            '• Please start the login process again.',
            '• If the problem persists, clear your browser cache and cookies.'
          ].join('\n')
          setCriticalError(`${details}.\n\nTroubleshooting:\n${troubleshooting}`)
          toast.error('Please start from login page')
          setIsMounted(true)
          return
        }

        if (pendingPhone) setPhone(pendingPhone)
        if (pendingOtpId) setOtpId(pendingOtpId)
        // Pre-fill the OTP if it was returned from the login API
        if (pendingOtp) {
          setOtp(pendingOtp)
          toast.success('OTP auto-filled from login response!')
        }
        setIsMounted(true)

        // Start countdown timer
        timer = setInterval(() => {
          setCountdown((prev) => {
            const newCount = prev - 1
            if (newCount <= 0) {
              setCanResend(true)
              if (timer) clearInterval(timer)
              return 0
            }
            return newCount
          })
        }, 1000)
      } catch (error) {
        console.error('❌ [VERIFY-OTP] Error during auth check:', error)
        setIsMounted(true)
      }
    }

    checkAuthAndSetup()

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP')
      return
    }

    setIsLoading(true)

    try {
      const result = await sellikoClient.verifyAuthOTP(otp, otpId, phone)
      
      if (result.success) {
        toast.success('Login successful!')
        localStorage.removeItem('pendingPhone')
        localStorage.removeItem('pendingOtpId')
        localStorage.removeItem('pendingUserId')
        localStorage.removeItem('pendingOtp')
        localStorage.removeItem('selliko_instance_id')
        let userRole = result.user?.user_role || result.user?.role || 'client';
        if (typeof userRole !== 'string') userRole = 'client';
        const normalizedRole = userRole.trim().toLowerCase();
        const validRoles = ['client', 'vendor', 'agent', 'admin'];
        const targetRoute = validRoles.includes(normalizedRole) ? `/${normalizedRole}` : '/client';
        setTimeout(() => {
          window.location.replace(targetRoute);
        }, 100);
        return;
      } else {
        console.error('❌ [VERIFY-OTP] Verification failed')
        console.error('📋 [VERIFY-OTP] Error details:', {
          error: result.error || 'NO_ERROR_MESSAGE',
          success: result.success,
          hasData: !!result.data
        })
        toast.error(result.error || 'Invalid OTP. Please try again.')
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
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (!canResend) {
      return
    }

    setIsLoading(true)
    setCanResend(false)
    setCountdown(60)

    try {
      const result = await sellikoClient.getAuthOTP(phone)
      
      if (result.success) {
        toast.success('OTP sent successfully!')
        
        const newOtpId = result.otp_id || ''
        
        setOtpId(newOtpId)
        localStorage.setItem('pendingOtpId', newOtpId)
        
        // Restart countdown
        const timer = setInterval(() => {
          setCountdown((prev) => {
            const newCount = prev - 1
            
            if (newCount <= 0) {
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
        setCanResend(true)
      }
    } catch (error: any) {
      console.error('💥 [VERIFY-OTP] Exception during resend:', error)
      console.error('📋 [VERIFY-OTP] Error details:', error)
      toast.error('Failed to resend OTP. Please try again.')
      setCanResend(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value
    const value = rawValue.replace(/\D/g, '').slice(0, 6)
    
    setOtp(value)
  }

  const formatPhone = (phoneNumber: string) => {
    if (phoneNumber.startsWith('+91')) {
      const formatted = phoneNumber.replace('+91', '+91 ').replace(/(\d{5})(\d{5})/, '$1 $2')
      return formatted
    }
    return phoneNumber
  }

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
              We've sent a 6-digit code to your SMS or WhatsApp
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
                  onFocus={() => {}}
                  onBlur={() => {}}
                />
                <p className="text-xs text-gray-500 text-center">
                  Check your SMS or WhatsApp for the verification code
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || otp.length !== 6}
                onClick={() => {}}
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
              </div>
            </form>

            {/* Back to Login */}
            <div className="mt-6 text-center">
              <Link 
                href="/login" 
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                onClick={() => {}}
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
      </div>
    </div>
  )
} 