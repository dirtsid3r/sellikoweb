'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'
import { useAuth } from '@/lib/auth'

interface HeaderProps {
  variant?: 'client' | 'admin' | 'vendor' | 'agent'
  showBackButton?: boolean
  backButtonText?: string
  title?: string
  subtitle?: string
}

export default function Header({ 
  variant = 'client', 
  showBackButton = false, 
  backButtonText,
  title,
  subtitle 
}: HeaderProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = () => {
    console.log('🔄 [HEADER] Logout button clicked')
    setIsLoggingOut(true)
    router.push('/logout')
  }

  // Get user role for navigation
  const getUserRole = () => {
    if (user?.role) return user.role.toLowerCase()
    return variant // fallback to the variant prop
  }

  // Get variant-specific styling
  const getVariantStyles = () => {
    switch (variant) {
      case 'admin':
        return {
          bgClass: 'bg-white border-b border-gray-200',
          logoClass: 'w-8 h-8 bg-blue-600 rounded-lg',
          iconClass: 'w-5 h-5 text-white',
          titleClass: 'text-xl font-bold text-gray-900',
          subtitleClass: 'text-xs text-gray-500',
          userSubtitle: 'Administrator'
        }
      case 'vendor':
        return {
          bgClass: 'bg-white border-b border-gray-200',
          logoClass: 'w-8 h-8 bg-blue-600 rounded-lg',
          iconClass: 'w-5 h-5 text-white',
          titleClass: 'text-xl font-bold text-gray-900',
          subtitleClass: 'text-xs text-gray-500',
          userSubtitle: 'VENDOR'
        }
      case 'agent':
        return {
          bgClass: 'bg-white border-b border-gray-200',
          logoClass: 'w-8 h-8 bg-blue-600 rounded-lg',
          iconClass: 'w-5 h-5 text-white',
          titleClass: 'text-xl font-bold text-gray-900',
          subtitleClass: 'text-xs text-gray-500',
          userSubtitle: 'Agent'
        }
      case 'client':
      default:
        return {
          bgClass: 'bg-white/80 backdrop-blur-sm border-b border-gray-200/60 sticky top-0 z-40',
          logoClass: 'w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg',
          iconClass: 'w-4 h-4 sm:w-6 sm:h-6 text-white',
          titleClass: 'text-lg sm:text-xl font-bold text-gray-900',
          subtitleClass: 'text-xs text-gray-500 hidden sm:block',
          userSubtitle: 'Ready to sell?'
        }
    }
  }

  const styles = getVariantStyles()

  return (
    <header className={styles.bgClass}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Back Button (if needed) */}
            {showBackButton && (
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors mr-2"
              >
                <Icons.arrowLeft className="w-5 h-5 text-gray-600" />
              </button>
            )}

            {/* Logo - Clickable to user's role dashboard */}
            <Link 
              href={`/${getUserRole()}`} 
              className="flex items-center space-x-2 sm:space-x-3 hover:opacity-80 transition-opacity"
            >
              <div className={`${styles.logoClass} flex items-center justify-center`}>
                {variant === 'admin' ? (
                  <Icons.shield className={styles.iconClass} />
                ) : (
                  <Icons.smartphone className={styles.iconClass} />
                )}
              </div>
              <div>
                <h1 className={styles.titleClass}>
                  {title || (variant === 'admin' ? 'SELLIKO Admin' : 'SELLIKO')}
                </h1>
                {subtitle && (
                  <p className={styles.subtitleClass}>{subtitle}</p>
                )}
                {!subtitle && variant === 'client' && (
                  <p className={styles.subtitleClass}>Your device marketplace</p>
                )}
                {!subtitle && variant === 'admin' && (
                  <p className={styles.subtitleClass}>Settings & Configuration</p>
                )}
                {!subtitle && variant === 'vendor' && (
                  <p className={styles.subtitleClass}>Vendor Portal</p>
                )}
              </div>
            </Link>
          </div>
          
          {/* Right side - User info and logout */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-900">
                {user?.name || 
                 (variant === 'admin' ? 'Admin User' : 
                  variant === 'vendor' ? 'Kochi Mobile Store' : 
                  'Test User 1')}
              </p>
              <p className="text-xs text-gray-500">{styles.userSubtitle}</p>
            </div>
            <Button
              variant={variant === 'client' ? 'ghost' : 'outline'}
              size="sm"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="hover:bg-gray-100"
            >
              {isLoggingOut ? (
                <Icons.spinner className="w-4 h-4 animate-spin" />
              ) : (
                <Icons.logOut className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
} 