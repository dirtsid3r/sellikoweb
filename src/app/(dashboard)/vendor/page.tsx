'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { useInstanceId } from '@/contexts/instance-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Icons } from '@/components/ui/icons'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useRouter, useSearchParams } from 'next/navigation'
import { MarketplaceTab } from '@/components/vendor/MarketplaceTab'
import { MyBidsTab } from '@/components/vendor/MyBidsTab'
import { NotificationsTab } from '@/components/vendor/NotificationsTab'
import { RecentActivity } from '@/components/shared/RecentActivity'
import sellikoClient from '@/selliko-client'
import { toast } from 'react-hot-toast'
import Header from '@/components/layout/header'

interface VendorStats {
  activeBids: number
  wonThisMonth: number
  totalDevices: number
  winRate: number
}

interface DashboardResponse {
  success: boolean
  data?: {
    activBids: number
    winInMonth: number
    totalDevices: number
    winRate: number
  }
  error?: string
}

interface RecentActivity {
  id: string
  type: 'new_listing' | 'bid_won' | 'device_delivered' | 'bid_outbid'
  message: string
  timestamp: string
  icon: string
}

export default function VendorDashboard() {
  const { user, logout, isLoading } = useAuth()
  const { instanceId } = useInstanceId()
  const router = useRouter()
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [stats, setStats] = useState<VendorStats>({
    activeBids: 0,
    wonThisMonth: 0,
    totalDevices: 0,
    winRate: 0
  })
  const [isAuthChecking, setIsAuthChecking] = useState(true)
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [statsError, setStatsError] = useState<string | null>(null)

  

  useEffect(() => {
    // Set tab from query param if present
    if (searchParams) {
      const tabParam = searchParams.get('tab');
      if (tabParam && ['dashboard', 'marketplace', 'my-bids', 'notifications'].includes(tabParam)) {
        setActiveTab(tabParam);
      }
    }

    const checkAuthAndRole = async () => {
      console.log('🔒 [VENDOR-DASH] Checking authentication and role...')
      try {
        const user = await sellikoClient.getCurrentUser()
        console.log('👤 [VENDOR-DASH] Current user:', user ? {
          id: user.id,
          role: user.user_role,
        } : 'No user found')
        
        if (!user) {
          console.log('❌ [VENDOR-DASH] No user found, redirecting to login')
          toast.error('Please login to continue')
          router.replace('/login')
          return
        }

        const userRole = (user.user_role || user.role || '').toLowerCase()
        console.log('👑 [VENDOR-DASH] User role:', userRole)
        
        if (userRole !== 'vendor') {
          console.log(`⚠️ [VENDOR-DASH] Invalid role access attempt: ${userRole}`)
          toast.error('Access denied. Redirecting to your dashboard.')
          router.replace(`/${userRole}`)
          return
        }

        console.log('✅ [VENDOR-DASH] Role verification successful')
        setIsAuthChecking(false)
        
        // Load dashboard stats after authentication
        await loadDashboardStats()
      } catch (error) {
        console.error('💥 [VENDOR-DASH] Auth check error:', error)
        toast.error('Authentication error')
        router.replace('/login')
      }
    }

    const loadDashboardStats = async () => {
      try {
        setIsLoadingStats(true)
        setStatsError(null)
        
        console.log('📊 [VENDOR-DASH] Loading dashboard stats...')
        const response = await sellikoClient.getDashboard('vendor-desk') as DashboardResponse
        
        if (response.success && response.data) {
          console.log('✅ [VENDOR-DASH] Dashboard stats loaded:', response.data)
          setStats({
            activeBids: response.data.activBids || 0,
            wonThisMonth: response.data.winInMonth || 0,
            totalDevices: response.data.totalDevices || 0,
            winRate: response.data.winRate || 0
          })
        } else {
          console.error('❌ [VENDOR-DASH] Failed to load dashboard stats:', response.error)
          setStatsError(response.error || 'Failed to load dashboard data')
        }
      } catch (error) {
        console.error('💥 [VENDOR-DASH] Dashboard stats error:', error)
        setStatsError(error instanceof Error ? error.message : 'An unexpected error occurred')
      } finally {
        setIsLoadingStats(false)
      }
    }

    checkAuthAndRole()
  }, [router])

  if (isLoading || isAuthChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <Icons.spinner className="w-8 h-8 text-white animate-spin" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Dashboard</h2>
          <p className="text-gray-600">Preparing vendor panel...</p>
        </div>
      </div>
    )
  }

  const handleLogout = () => {
    console.log('🔄 [VENDOR-DASH] Logout button clicked')
    setIsLoggingOut(true)
    router.push('/logout')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header variant="vendor" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mobile Tab Selector Dropdown */}
        {/* Mobile Tab Selector (shown on mobile/tablet screens) */}
        <div className="block md:hidden mb-6">
          <label htmlFor="tab-select" className="sr-only">Select Tab</label>
          <div className="relative">
            <select
              id="tab-select"
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="w-full p-3.5 pl-10 pr-10 bg-white border border-gray-300 rounded-xl shadow-sm text-gray-900 font-medium focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
            >
              <option value="dashboard">Dashboard</option>
              <option value="marketplace">Marketplace</option>
              <option value="my-bids">My Bids</option>
              <option value="notifications">Notifications</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
              <Icons.chevronDown className="h-5 w-5" />
            </div>
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-500">
              {activeTab === 'dashboard' && <Icons.home className="h-5 w-5 text-green-600" />}
              {activeTab === 'marketplace' && <Icons.smartphone className="h-5 w-5 text-green-600" />}
              {activeTab === 'my-bids' && <Icons.list className="h-5 w-5 text-green-600" />}
              {activeTab === 'notifications' && <Icons.bell className="h-5 w-5 text-green-600" />}
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="hidden md:grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="dashboard" className="flex items-center justify-center gap-2">
              <Icons.home className="w-4 h-4 flex-shrink-0" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="marketplace" className="flex items-center justify-center gap-2">
              <Icons.smartphone className="w-4 h-4 flex-shrink-0" />
              <span>Marketplace</span>
            </TabsTrigger>
            <TabsTrigger value="my-bids" className="flex items-center justify-center gap-2">
              <Icons.list className="w-4 h-4 flex-shrink-0" />
              <span>My Bids</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center justify-center gap-2">
              <Icons.bell className="w-4 h-4 flex-shrink-0" />
              <span>Notifications</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Welcome Section */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome back, {user?.name?.split(' ')[0] || 'Vendor'}!
              </h2>
              <p className="text-gray-600">Manage your device purchases and track your business from Kerala's trusted mobile resale platform.</p>
            </div>

            {/* Business Summary Stats */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><Icons.trendingUp className="w-5 h-5 text-green-600" /> Your Business Summary</h3>
              {isLoadingStats ? (
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="h-4 bg-gray-200 rounded w-16 mb-1"></div>
                            <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                            <div className="h-8 bg-gray-200 rounded w-12"></div>
                          </div>
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-lg flex-shrink-0"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : statsError ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <Icons.alertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Stats</h4>
                    <p className="text-gray-600 mb-4">{statsError}</p>
                    <Button 
                      onClick={() => window.location.reload()} 
                      variant="outline"
                    >
                      Try Again
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                  <Card>
                    <CardContent className="p-4 sm:p-6">
                       <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-gray-600 flex items-center gap-1"><Icons.zap className="w-3.5 h-3.5 text-red-500" /> Active</p>
                          <p className="text-xs sm:text-sm font-medium text-gray-600">Bids</p>
                          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">{stats.activeBids}</p>
                        </div>
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Icons.clock className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-gray-600 flex items-center gap-1"><Icons.check className="w-3.5 h-3.5 text-green-500" /> Won</p>
                          <p className="text-xs sm:text-sm font-medium text-gray-600">This Month</p>
                          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">{stats.wonThisMonth}</p>
                        </div>
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Icons.check className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-gray-600 flex items-center gap-1"><Icons.smartphone className="w-3.5 h-3.5 text-blue-500" /> Total</p>
                          <p className="text-xs sm:text-sm font-medium text-gray-600">Devices</p>
                          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">{stats.totalDevices}</p>
                        </div>
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Icons.smartphone className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-gray-600 flex items-center gap-1"><Icons.star className="w-3.5 h-3.5 text-yellow-500" /> Win</p>
                          <p className="text-xs sm:text-sm font-medium text-gray-600">Rate</p>
                          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">{stats.winRate}%</p>
                        </div>
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Icons.star className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
            <RecentActivity />
          </TabsContent>

          {/* Marketplace Tab */}
          <TabsContent value="marketplace">
            <MarketplaceTab />
          </TabsContent>

          {/* My Bids Tab */}
          <TabsContent value="my-bids">
            <MyBidsTab />
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <NotificationsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 