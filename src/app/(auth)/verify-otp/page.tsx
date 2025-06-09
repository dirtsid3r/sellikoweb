'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Icons } from '@/components/ui/icons'
import { toast } from 'react-hot-toast'
import { useAuth } from '@/lib/auth'
import Link from 'next/link'

export default function VerifyOTPPage() {
  const [otp, setOtp] = useState('')
  const [phone, setPhone] = useState('')
  const [otpId, setOtpId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const router = useRouter()
  const { login, sendOTP } = useAuth()

  useEffect(() => {
    // Get phone and otpId from localStorage
    const pendingPhone = localStorage.getItem('pendingPhone')
    const pendingOtpId = localStorage.getItem('pendingOtpId')

    if (!pendingPhone || !pendingOtpId) {
      toast.error('Please start from login page')
      router.push('/login')
      return
    }

    setPhone(pendingPhone)
    setOtpId(pendingOtpId)

    // Start countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true)
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP')
      return
    }

    setIsLoading(true)

    try {
      const result = await login(phone, otp, otpId)
      
      if (result.success) {
        toast.success('Login successful!')
        // Clear pending data
        localStorage.removeItem('pendingPhone')
        localStorage.removeItem('pendingOtpId')
        
        // Redirect based on user role or to dashboard
        router.push('/dashboard')
      } else {
        toast.error(result.error || 'Invalid OTP. Please try again.')
      }
    } catch (error) {
      console.error('OTP verification error:', error)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (!canResend) return

    setIsLoading(true)
    setCanResend(false)
    setCountdown(60)

    try {
      const result = await sendOTP(phone)
      
      if (result.success) {
        toast.success('OTP sent successfully!')
        setOtpId(result.otpId || '')
        localStorage.setItem('pendingOtpId', result.otpId || '')
        
        // Restart countdown
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              setCanResend(true)
              clearInterval(timer)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      } else {
        toast.error(result.error || 'Failed to resend OTP')
        setCanResend(true)
      }
    } catch (error) {
      console.error('Resend OTP error:', error)
      toast.error('Something went wrong. Please try again.')
      setCanResend(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
    setOtp(value)
  }

  const formatPhone = (phoneNumber: string) => {
    if (phoneNumber.startsWith('+91')) {
      return phoneNumber.replace('+91', '+91 ').replace(/(\d{5})(\d{5})/, '$1 $2')
    }
    return phoneNumber
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
                />
                <p className="text-xs text-gray-500 text-center">
                  Check your WhatsApp for the verification code
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || otp.length !== 6}
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
                    onClick={handleResendOTP}
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