'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Icons } from '@/components/ui/icons'
import { toast } from 'react-hot-toast'
import { useAuth } from '@/lib/auth'

export default function LogoutPage() {
  console.log('🚀 [LOGOUT] Component initialization started')
  const router = useRouter()
  const { logout } = useAuth()

  useEffect(() => {
    console.log('⚡ [LOGOUT] useEffect triggered - starting logout process')
    
    const performLogout = async () => {
      try {
        console.log('🔄 [LOGOUT] Calling auth.logout...')
        const success = await logout()
        
        console.log('📥 [LOGOUT] Logout result:', { success })
        
        if (success) {
          console.log('✅ [LOGOUT] Logout successful, redirecting to login...')
          toast.success('You have been logged out successfully')
        } else {
          console.error('❌ [LOGOUT] Logout error')
          toast.error('Logout may not have completed on server')
        }
        
        // Always redirect to login page, even if server logout failed
        // Because we've cleared local auth data
        console.log('🔄 [LOGOUT] Redirecting to login page...')
        router.push('/login')
        router.refresh() // Force refresh to clear any cached auth state
      } catch (error) {
        console.error('💥 [LOGOUT] Exception during logout:', error)
        toast.error('An error occurred during logout')
        // Still redirect to login since we want to force logout
        router.push('/login')
      }
    }

    performLogout()
  }, [router, logout])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <Icons.spinner className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Signing Out...</h1>
        <p className="text-gray-600">Please wait while we complete the logout process.</p>
        
        {/* Debug info */}
        <div className="mt-4 p-3 bg-gray-100 rounded-lg text-xs font-mono text-left">
          <div className="font-bold mb-2">Debug Info:</div>
          <div>Status: Logging out...</div>
          <div>Access Token: {typeof window !== 'undefined' && localStorage.getItem('selliko_access_token') ? 'Present' : 'Cleared'}</div>
          <div>User Data: {typeof window !== 'undefined' && localStorage.getItem('selliko_user') ? 'Present' : 'Cleared'}</div>
        </div>
      </div>
    </div>
  )
} 