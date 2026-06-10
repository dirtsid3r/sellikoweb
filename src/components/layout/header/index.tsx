'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'
import { useAuth } from '@/lib/auth'
import NotificationButton from '@/components/shared/notifications/NotificationButton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

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
  const [showConfirmLogout, setShowConfirmLogout] = useState(false)

  const handleLogout = () => {
    console.log('🔄 [HEADER] Logout button clicked')
    setShowConfirmLogout(true)
  }

  const handleConfirmLogout = () => {
    console.log('🔄 [HEADER] Confirming logout')
    setShowConfirmLogout(false)
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
    const commonStyles = {
      bgClass: 'bg-white/80 backdrop-blur-sm border-b border-gray-200/60 sticky top-0 z-40',
      logoClass: 'w-8 h-8 sm:w-10 sm:h-10 rounded-xl shadow-lg',
      iconClass: 'w-4 h-4 sm:w-6 sm:h-6 text-white',
      titleClass: 'text-lg sm:text-xl font-bold text-gray-900',
      subtitleClass: 'text-xs text-gray-500 hidden sm:block',
    }

    switch (variant) {
      case 'admin':
        return {
          ...commonStyles,
          logoClass: `${commonStyles.logoClass} bg-blue-600`,
          userSubtitle: 'Administrator'
        }
      case 'vendor':
        return {
          ...commonStyles,
          logoClass: `${commonStyles.logoClass} bg-blue-600`,
          userSubtitle: 'VENDOR'
        }
      case 'agent':
        return {
          ...commonStyles,
          logoClass: `${commonStyles.logoClass} bg-blue-600`,
          userSubtitle: 'Agent'
        }
      case 'client':
      default:
        return {
          ...commonStyles,
          logoClass: `${commonStyles.logoClass} bg-gradient-to-r from-blue-600 to-blue-700`,
          userSubtitle: 'Ready to sell?'
        }
    }
  }

  const styles = getVariantStyles()

  return (
    <>
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
  <style jsx>{`
    .notification-button {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.5rem;
      border-radius: 0.375rem;
      transition: background-color 0.2s;
    }

    .notification-button:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }
  `}</style>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <NotificationButton hasNewNotifications={true} />
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

      {/* Logout Confirmation Dialog */}
      {showConfirmLogout && (
        <Dialog open={showConfirmLogout} onOpenChange={setShowConfirmLogout}>
          <DialogContent className="sm:max-w-md bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl">
            <DialogHeader className="space-y-3">
              <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Icons.logOut className="w-5 h-5 text-red-500" />
                Confirm Logout
              </DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-400 text-sm">
                Are you sure you want to log out of your account? You will need to log in again to access your dashboard.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end mt-4">
              <Button
                variant="outline"
                onClick={() => setShowConfirmLogout(false)}
                className="w-full sm:w-auto rounded-xl"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmLogout}
                className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white rounded-xl"
              >
                Log Out
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
} 