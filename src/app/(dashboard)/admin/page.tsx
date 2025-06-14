'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { useInstanceId } from '@/contexts/instance-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Icons } from '@/components/ui/icons'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
import sellikoClient from '@/selliko-client'
import { toast } from 'react-hot-toast'

export default function AdminDashboard() {
  const { user, logout, isLoading } = useAuth()
  const { instanceId } = useInstanceId()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isAuthChecking, setIsAuthChecking] = useState(true)
  const [pendingListings, setPendingListings] = useState<any[]>([])
  const [isLoadingListings, setIsLoadingListings] = useState(false)
  const [listingsError, setListingsError] = useState<string | null>(null)
  const [rejectingListingId, setRejectingListingId] = useState<string | null>(null)
  const [rejectionMessage, setRejectionMessage] = useState('')
  const [processingListingId, setProcessingListingId] = useState<string | null>(null)

  useEffect(() => {
    const checkAuthAndRole = async () => {
      console.log('🔒 [ADMIN-DASH] Checking authentication and role...')
      try {
        const user = await sellikoClient.getCurrentUser()
        console.log('👤 [ADMIN-DASH] Current user:', user ? {
          id: user.id,
          role: user.user_role,
        } : 'No user found')
        
        if (!user) {
          console.log('❌ [ADMIN-DASH] No user found, redirecting to login')
          toast.error('Please login to continue')
          router.replace('/login')
          return
        }

        const userRole = (user.user_role || user.role || '').toLowerCase()
        console.log('👑 [ADMIN-DASH] User role:', userRole)
        
        if (userRole !== 'admin') {
          console.log(`⚠️ [ADMIN-DASH] Invalid role access attempt: ${userRole}`)
          toast.error('Access denied. Redirecting to your dashboard.')
          router.replace(`/${userRole}`)
          return
        }

        console.log('✅ [ADMIN-DASH] Role verification successful')
        setIsAuthChecking(false)
      } catch (error) {
        console.error('💥 [ADMIN-DASH] Auth check error:', error)
        toast.error('Authentication error')
        router.replace('/login')
      }
    }

    checkAuthAndRole()
  }, [router])

  // Fetch pending approval listings
  useEffect(() => {
    const fetchPendingListings = async () => {
      console.log('📋 [ADMIN-DASH] Fetching pending approval listings...')
      setIsLoadingListings(true)
      setListingsError(null)
      
      try {
        const response = await (sellikoClient.getListings as any)({
          status: 'pending_approval',
          limit: 1000,
          sort_by: 'created_at',
          sort_order: 'desc',
          include_images: true
        })
        
        console.log('📥 [ADMIN-DASH] Listings response:', {
          success: response.success,
          listingsCount: response.listings?.length || 0,
          error: response.error
        })
        
        if (response.success && response.listings) {
          // Transform API data to match the existing UI structure
          const transformedListings = response.listings.map((listing: any) => {
            const device = listing.devices?.[0] || {}
            const clientAddress = listing.addresses?.find((addr: any) => addr.type === 'client') || {}
            
            // Extract seller name from multiple sources
            const sellerName = listing.contact_name || 
                              clientAddress.contact_name || 
                              clientAddress.name || 
                              'Unknown Seller'
            
            // Format submission date properly
            const submittedAt = new Date(listing.created_at).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
            
            return {
              id: listing.id,
              device: `${device.brand || 'Unknown'} ${device.model || 'Model'}`,
              seller: sellerName,
              submittedAt: submittedAt,
              askingPrice: listing.expected_price || listing.asking_price || 0,
              status: listing.status
            }
          })
          
          setPendingListings(transformedListings)
          console.log('✅ [ADMIN-DASH] Pending listings loaded:', transformedListings.length)
        } else {
          setListingsError(response.error || 'Failed to fetch listings')
          console.error('❌ [ADMIN-DASH] Failed to fetch listings:', response.error)
        }
      } catch (error: any) {
        console.error('💥 [ADMIN-DASH] Error fetching pending listings:', error)
        setListingsError(error.message || 'Network error occurred')
      } finally {
        setIsLoadingListings(false)
      }
    }

    // Only fetch listings after auth check is complete and user is authenticated
    if (!isAuthChecking && user) {
      fetchPendingListings()
    }
  }, [isAuthChecking, user])

  if (isLoading || isAuthChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <Icons.spinner className="w-8 h-8 text-white animate-spin" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Dashboard</h2>
          <p className="text-gray-600">Preparing admin panel...</p>
        </div>
      </div>
    )
  }

  const handleLogout = () => {
    console.log('🔄 [ADMIN-DASH] Logout button clicked')
    setIsLoggingOut(true)
    router.push('/logout')
  }

  // Mock data for demonstration - will be replaced by real data
  const dashboardStats = {
    totalUsers: 1250,
    activeListings: 45,
    pendingApprovals: pendingListings.length, // Use real count
    totalRevenue: 2500000
  }

  const handleApprove = async (listingId: string) => {
    console.log('✅ [ADMIN-DASH] Approving listing:', listingId)
    setProcessingListingId(listingId)
    
    try {
      const result = await sellikoClient.approveListing(listingId, true) as any
      
      if (result.success) {
        toast.success('Listing approved successfully!')
        console.log('✅ [ADMIN-DASH] Listing approved:', listingId)
        
        // Remove the approved listing from the pending list
        setPendingListings(prev => prev.filter((listing: any) => listing.id !== listingId))
      } else {
        toast.error(result.error || 'Failed to approve listing')
        console.error('❌ [ADMIN-DASH] Approval failed:', result.error)
      }
    } catch (error: any) {
      console.error('💥 [ADMIN-DASH] Approval error:', error)
      toast.error('Network error occurred while approving listing')
    } finally {
      setProcessingListingId(null)
    }
  }

  const handleRejectClick = (listingId: string) => {
    console.log('❌ [ADMIN-DASH] Initiating rejection for listing:', listingId)
    setRejectingListingId(listingId)
    setRejectionMessage('')
  }

  const handleRejectConfirm = async (listingId: string) => {
    console.log('❌ [ADMIN-DASH] Confirming rejection for listing:', listingId)
    
    if (!rejectionMessage.trim()) {
      toast.error('Please provide a rejection reason')
      return
    }
    
    setProcessingListingId(listingId)
    
    try {
      const result = await sellikoClient.approveListing(listingId, false, rejectionMessage.trim()) as any
      
      if (result.success) {
        toast.success('Listing rejected successfully!')
        console.log('❌ [ADMIN-DASH] Listing rejected:', listingId, 'Reason:', rejectionMessage)
        
        // Remove the rejected listing from the pending list
        setPendingListings(prev => prev.filter((listing: any) => listing.id !== listingId))
        
        // Reset rejection state
        setRejectingListingId(null)
        setRejectionMessage('')
      } else {
        toast.error(result.error || 'Failed to reject listing')
        console.error('❌ [ADMIN-DASH] Rejection failed:', result.error)
      }
    } catch (error: any) {
      console.error('💥 [ADMIN-DASH] Rejection error:', error)
      toast.error('Network error occurred while rejecting listing')
    } finally {
      setProcessingListingId(null)
    }
  }

  const handleRejectCancel = () => {
    console.log('🚫 [ADMIN-DASH] Cancelling rejection')
    setRejectingListingId(null)
    setRejectionMessage('')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Icons.shield className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">SELLIKO Admin</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name || 'Admin User'}</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                disabled={isLoggingOut}
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name?.split(' ')[0] || 'Admin'}!
          </h2>
          <p className="text-gray-600">Manage platform operations and oversee all activities.</p>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalUsers.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Icons.users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Listings</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardStats.activeListings}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Icons.smartphone className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardStats.pendingApprovals}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Icons.clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">₹{dashboardStats.totalRevenue.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Icons.download className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card 
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => router.push('/admin/assign-agents')}
          >
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Icons.users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Assign Agents</h3>
                  <p className="text-sm text-gray-600">Assign agents to accepted bids</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => router.push('/admin/pending-approvals')}
          >
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Icons.check className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Approve Listings</h3>
                  <p className="text-sm text-gray-600">Review pending listings</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Icons.settings className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Platform Settings</h3>
                  <p className="text-sm text-gray-600">Configure platform</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Icons.download className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Reports</h3>
                  <p className="text-sm text-gray-600">View analytics & reports</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Approvals */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Listing Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingListings ? (
              <div className="flex items-center justify-center py-8">
                <Icons.spinner className="w-6 h-6 animate-spin mr-2" />
                <span className="text-gray-600">Loading pending listings...</span>
              </div>
            ) : listingsError ? (
              <div className="text-center py-8">
                <Icons.alertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load listings</h3>
                <p className="text-red-600 mb-4">{listingsError}</p>
                <Button 
                  onClick={() => window.location.reload()} 
                  variant="outline"
                  size="sm"
                >
                  <Icons.refresh className="w-4 h-4 mr-1" />
                  Retry
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingListings.map((listing) => (
                  <div key={listing.id} className="bg-gray-50 rounded-lg overflow-hidden">
                    {/* Main listing info */}
                    <div className="flex items-center justify-between p-4">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{listing.device}</h4>
                        <p className="text-sm text-gray-600">
                          Seller: {listing.seller} • Submitted: {listing.submittedAt} • Price: ₹{listing.askingPrice.toLocaleString()}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-yellow-100 text-yellow-800">Pending Review</Badge>
                        
                        {rejectingListingId === listing.id ? (
                          // Show cancel button when in rejection mode
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleRejectCancel}
                            disabled={processingListingId === listing.id}
                            className="text-gray-600 hover:text-gray-700"
                          >
                            <Icons.x className="w-4 h-4 mr-1" />
                            Cancel
                          </Button>
                        ) : (
                          // Show reject button when not in rejection mode
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRejectClick(listing.id)}
                            disabled={processingListingId === listing.id}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Icons.x className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        )}
                        
                        <Button
                          size="sm"
                          onClick={() => handleApprove(listing.id)}
                          disabled={processingListingId === listing.id || rejectingListingId === listing.id}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {processingListingId === listing.id ? (
                            <Icons.spinner className="w-4 h-4 mr-1 animate-spin" />
                          ) : (
                            <Icons.check className="w-4 h-4 mr-1" />
                          )}
                          Approve
                        </Button>
                      </div>
                    </div>
                    
                    {/* Rejection message input - only show when rejecting this listing */}
                    {rejectingListingId === listing.id && (
                      <div className="border-t border-gray-200 bg-red-50 p-4">
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Reason for rejection <span className="text-red-500">*</span>
                            </label>
                            <textarea
                              value={rejectionMessage}
                              onChange={(e) => setRejectionMessage(e.target.value)}
                              placeholder="e.g., Device specifications do not meet our requirements, Images are not clear, etc."
                              rows={3}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                              disabled={processingListingId === listing.id}
                            />
                          </div>
                          
                          <div className="flex justify-end space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleRejectCancel}
                              disabled={processingListingId === listing.id}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleRejectConfirm(listing.id)}
                              disabled={processingListingId === listing.id || !rejectionMessage.trim()}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              {processingListingId === listing.id ? (
                                <>
                                  <Icons.spinner className="w-4 h-4 mr-1 animate-spin" />
                                  Rejecting...
                                </>
                              ) : (
                                <>
                                  <Icons.x className="w-4 h-4 mr-1" />
                                  Confirm Reject
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {pendingListings.length === 0 && !isLoadingListings && (
                  <div className="text-center py-12">
                    <Icons.check className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">All caught up!</h3>
                    <p className="text-gray-600">No pending listings to review</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 