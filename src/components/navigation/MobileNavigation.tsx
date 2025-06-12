'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { 
  DevicePhoneMobileIcon, 
  Bars3Icon, 
  XMarkIcon, 
  HomeIcon, 
  PlusCircleIcon, 
  ShoppingBagIcon, 
  QuestionMarkCircleIcon, 
  UserIcon,
  ArrowRightOnRectangleIcon,
  UserPlusIcon,
  BellIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  StarIcon
} from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth'


interface NavigationItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  requiredAuth?: boolean
}

interface MobileNavigationProps {}

const publicNavItems: NavigationItem[] = [
  { href: '/', label: 'Home', icon: HomeIcon },
  { href: '/how-it-works', label: 'How It Works', icon: QuestionMarkCircleIcon },
]

const authNavItems: NavigationItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: UserIcon, requiredAuth: true },
  { href: '/list-device', label: 'List Device', icon: PlusCircleIcon, requiredAuth: true },
  { href: '/my-listings', label: 'My Listings', icon: ShoppingBagIcon, requiredAuth: true },
  { href: '/notifications', label: 'Notifications', icon: BellIcon, requiredAuth: true },
  { href: '/settings', label: 'Settings', icon: Cog6ToothIcon, requiredAuth: true },
]

export default function MobileNavigation({}: MobileNavigationProps) {
  const { user, logout, isAuthenticated } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close sheet when route changes
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  const navItems = isAuthenticated ? [...publicNavItems, ...authNavItems] : publicNavItems

  const handleLogout = async () => {
    console.log('🔄 [MOBILE-NAV] Logout button clicked')
    setIsOpen(false) // Close the mobile menu
    router.push('/logout') // Navigate to the logout page
  }

  return (
    <>
      {/* Fixed Navigation Header */}
      <nav 
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 safe-top",
          scrolled 
            ? "bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm" 
            : "bg-white/80 backdrop-blur-sm"
        )}
      >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
              <DevicePhoneMobileIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">SELLIKO</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {publicNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === item.href 
                    ? "text-primary" 
                    : "text-gray-700"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <Button variant="ghost" size="sm" className="relative">
                  <BellIcon className="w-4 h-4" />
                </Button>
                
                {/* User Avatar/Menu */}
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user.name?.charAt(0)?.toUpperCase() || user.phone.slice(-2)}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">{user.name || user.phone}</span>
                </div>
              </div>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/login">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button using shadcn/ui Sheet */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="lg:hidden p-2 hover:bg-gray-100 active:scale-95 transition-all"
              >
                <Bars3Icon className="w-5 h-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>

            <SheetContent 
              side="right" 
              className="w-full sm:w-80 p-0 bg-white border-l border-gray-200"
            >
              <SheetHeader className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <SheetTitle className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                      <DevicePhoneMobileIcon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold text-gray-900">SELLIKO</span>
                  </SheetTitle>
                </div>
                
                {/* User info in mobile menu */}
                {isAuthenticated && user && (
                  <div className="flex items-center space-x-3 mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {user.name?.charAt(0)?.toUpperCase() || user.phone.slice(-2)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{user.name || user.phone}</p>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="text-xs">
                          {user.role.toLowerCase()}
                        </Badge>
                        <div className="flex items-center space-x-1">
                          <StarIcon className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          <span className="text-xs text-gray-600">4.9</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </SheetHeader>

              {/* Navigation Items */}
              <div className="flex-1 px-6 py-4">
                <div className="space-y-2">
                  {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group",
                          isActive 
                            ? "bg-primary text-white shadow-md" 
                            : "hover:bg-gray-50 text-gray-700 hover:text-gray-900"
                        )}
                      >
                        <Icon 
                          className={cn(
                            "w-5 h-5 transition-colors",
                            isActive ? "text-white" : "text-gray-500 group-hover:text-primary"
                          )} 
                        />
                        <span className="font-medium flex-1">{item.label}</span>
                        
                        {item.badge && (
                          <Badge 
                            variant={isActive ? "secondary" : "default"} 
                            className="text-xs"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    )
                  })}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="border-t border-gray-100 p-6 space-y-4">
                {isAuthenticated ? (
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={handleLogout}
                  >
                    <ArrowLeftOnRectangleIcon className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <Button className="w-full" asChild>
                      <Link href="/login">
                      <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
                      Login
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/login">
                      <UserPlusIcon className="w-4 h-4 mr-2" />
                      Create Account
                      </Link>
                    </Button>
                  </div>
                )}
                
                {/* Help Center */}
                <Button variant="ghost" asChild className="w-full justify-start text-gray-600">
                  <Link href="/help">
                    <QuestionMarkCircleIcon className="w-4 h-4 mr-2" />
                    Help Center
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
      
      {/* Spacer to prevent content from going under fixed nav */}
      <div className="h-16 safe-top" />


    </>
  )
} 