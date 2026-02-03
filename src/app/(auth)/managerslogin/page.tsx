'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Icons } from '@/components/ui/icons'
import { toast } from 'react-hot-toast'
import sellikoClient from '@/selliko-client'
import Link from 'next/link'

export default function ManagerLoginPage() {

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
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
                console.error('❌ [MANAGER-LOGIN] Error checking auth status:', error)
            }

            setIsMounted(true)
        }

        checkAuth()
    }, [router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!email || !password) {
            toast.error('Please enter both email and password')
            return
        }

        setIsLoading(true)

        try {
            console.log('💼 [MANAGER-LOGIN] Attempting login for:', email)
            const result = await sellikoClient.managerLogin(email, password)

            if (result.success) {
                toast.success('Login successful!')
                console.log('✅ [MANAGER-LOGIN] Login success:', result.user)

                // Redirect logic based on role
                if (result.user) {
                    const userRole = (result.user.user_role || result.user.role || '').toLowerCase()
                    // Default to admin if role is ambiguous or specific manager roles exist
                    const targetRoute = userRole === 'admin' ? '/admin' : `/${userRole}`
                    router.push(targetRoute)
                } else {
                    // Fallback redirect
                    router.push('/admin')
                }
            } else {
                console.error('❌ [MANAGER-LOGIN] Login failed:', result.message)
                toast.error(result.message || 'Invalid credentials')
            }
        } catch (error) {
            console.error('💥 [MANAGER-LOGIN] Exception during login:', error)
            toast.error('Something went wrong. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const isValid = email.length > 0 && password.length > 0

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
                            <Icons.user className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">Manager Access</h1>
                        <p className="text-gray-600 mt-2">Sign in with your manager credentials</p>
                    </div>

                    {/* Login Card */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
                        <div className="space-y-6">
                            <div className="text-center">
                                <h2 className="text-2xl font-semibold text-gray-900">Sign In</h2>
                                <p className="text-gray-600 mt-1">Enter your credentials to continue</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Icons.mail className="text-gray-500 w-5 h-5" />
                                        </div>
                                        <input
                                            id="email"
                                            type="email"
                                            placeholder="manager@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                                            required
                                            autoComplete="email"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Icons.lock className="text-gray-500 w-5 h-5" />
                                        </div>
                                        <input
                                            id="password"
                                            type="password"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                                            required
                                            autoComplete="current-password"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading || !isValid}
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                                >
                                    {isLoading ? (
                                        <>
                                            <Icons.spinner className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                                            Signing in...
                                        </>
                                    ) : (
                                        <>
                                            <Icons.logIn className="mr-2 h-5 w-5" />
                                            Sign In
                                        </>
                                    )}
                                </button>
                            </form>

                            {/* Back to regular login */}
                            <div className="text-center">
                                <Link href="/login" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                                    Go back to regular login
                                </Link>
                            </div>

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
