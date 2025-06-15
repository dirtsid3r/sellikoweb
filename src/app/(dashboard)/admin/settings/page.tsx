'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { Icons } from '@/components/ui/icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import sellikoClient from '@/selliko-client'
import { toast } from 'react-hot-toast'

// Settings menu items configuration
const settingsMenuItems = [
  {
    id: 'general',
    label: 'General Settings',
    icon: Icons.settings,
    description: 'Platform configuration and basic settings'
  },
  {
    id: 'users',
    label: 'User Management',
    icon: Icons.users,
    description: 'Manage users, roles, and permissions'
  },
  {
    id: 'vendors',
    label: 'Vendor Management',
    icon: Icons.package,
    description: 'Manage vendor profiles and information'
  },
  {
    id: 'agents',
    label: 'Agent Management',
    icon: Icons.user,
    description: 'Manage agent profiles and information'
  },
  {
    id: 'listings',
    label: 'Listing Settings',
    icon: Icons.smartphone,
    description: 'Configure listing rules and validation'
  },
  {
    id: 'pricing',
    label: 'Pricing & Fees',
    icon: Icons.download,
    description: 'Set platform fees and pricing rules'
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Icons.bell,
    description: 'Configure email and push notifications'
  },
  {
    id: 'integrations',
    label: 'Integrations',
    icon: Icons.zap,
    description: 'Third-party services and API settings'
  },
  {
    id: 'security',
    label: 'Security',
    icon: Icons.shield,
    description: 'Security policies and authentication'
  },
  {
    id: 'backup',
    label: 'Backup & Recovery',
    icon: Icons.package,
    description: 'Data backup and recovery settings'
  }
]

// Sidebar Menu Component
function SettingsSidebar({ 
  activeSection, 
  onSectionChange 
}: { 
  activeSection: string
  onSectionChange: (section: string) => void 
}) {
  return (
    <div className="w-80 bg-white border-r border-gray-200 h-full">
      {/* Sidebar Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <Icons.settings className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Settings</h2>
            <p className="text-sm text-gray-500">Platform configuration</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="p-4">
        <nav className="space-y-2">
          {settingsMenuItems.map((item) => {
            const IconComponent = item.icon
            const isActive = activeSection === item.id
            
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={`w-full text-left p-4 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-blue-50 border border-blue-200 shadow-sm'
                    : 'hover:bg-gray-50 border border-transparent'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                  }`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-medium text-sm ${
                      isActive ? 'text-blue-900' : 'text-gray-900'
                    }`}>
                      {item.label}
                    </h3>
                    <p className={`text-xs mt-1 ${
                      isActive ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {item.description}
                    </p>
                  </div>
                  {isActive && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                  )}
                </div>
              </button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}

// User Management Component
function UserManagement() {
  // Add User Component State
  const [addUserData, setAddUserData] = useState({
    mobile_number: '',
    user_role: 'anon'
  })
  const [isAddingUser, setIsAddingUser] = useState(false)

  // Ban User Component State
  const [banUserMobile, setBanUserMobile] = useState('')
  const [banUserInfo, setBanUserInfo] = useState<any>(null)
  const [isBanningUser, setIsBanningUser] = useState(false)
  const [isCheckingBanUser, setIsCheckingBanUser] = useState(false)

  // Get User Details Component State
  const [getUserMobile, setGetUserMobile] = useState('')
  const [userDetails, setUserDetails] = useState<any>(null)
  const [isGettingUser, setIsGettingUser] = useState(false)

  // Add User Handler
  const handleAddUser = async () => {
    if (!addUserData.mobile_number.trim()) {
      toast.error('Mobile number is required')
      return
    }
    
    setIsAddingUser(true)
    try {
      console.log('👥 [USER-MGMT] Adding user:', {
        mobile_number: addUserData.mobile_number.substring(0, 5) + '***',
        user_role: addUserData.user_role
      })
      
      const result = await sellikoClient.addUser(addUserData.mobile_number, addUserData.user_role) as any
      
      if (result.success) {
        toast.success('User created successfully!')
        console.log('✅ [USER-MGMT] User created:', result.user)
        
        // Reset form after successful add
        setAddUserData({ mobile_number: '', user_role: 'anon' })
      } else {
        toast.error(result.error || 'Failed to create user')
        console.error('❌ [USER-MGMT] User creation failed:', result.error)
      }
    } catch (error: any) {
      console.error('💥 [USER-MGMT] User creation error:', error)
      toast.error('Network error occurred while creating user')
    } finally {
      setIsAddingUser(false)
    }
  }

  // Check Ban User Handler
  const handleCheckBanUser = async () => {
    if (!banUserMobile.trim()) {
      toast.error('Mobile number is required')
      return
    }
    
    setIsCheckingBanUser(true)
    try {
      console.log('🔍 [USER-MGMT] Checking ban status for:', banUserMobile.substring(0, 5) + '***')
      
      const result = await sellikoClient.checkUserBanStatus(banUserMobile) as any
      
      if (result.success && result.user) {
        console.log('✅ [USER-MGMT] User ban status retrieved:', result.user)
        console.log('🔍 [USER-MGMT] Raw is_banned value:', {
          value: result.user.is_banned,
          type: typeof result.user.is_banned,
          stringValue: String(result.user.is_banned),
          booleanValue: Boolean(result.user.is_banned)
        })
        
        // Ensure is_banned is properly converted to boolean
        const isBanned = result.user.is_banned === true || result.user.is_banned === 'true' || result.user.is_banned === 1
        
        console.log('🔄 [USER-MGMT] Processed ban status:', {
          original: result.user.is_banned,
          processed: isBanned
        })
        
        setBanUserInfo({
          mobile_number: result.user.mobile_number,
          name: result.user.name || 'Unknown User',
          is_banned: isBanned,
          user_role: result.user.user_role,
          banned_at: result.user.banned_at,
          ban_reason: result.user.ban_reason
        })
      } else {
        toast.error(result.error || 'User not found')
        console.error('❌ [USER-MGMT] User check failed:', result.error)
        setBanUserInfo(null)
      }
    } catch (error: any) {
      console.error('💥 [USER-MGMT] User check error:', error)
      toast.error('Network error occurred while checking user')
      setBanUserInfo(null)
    } finally {
      setIsCheckingBanUser(false)
    }
  }

  // Ban/Unban User Handler
  const handleBanUnbanUser = async (ban: boolean) => {
    if (!banUserInfo) return
    
    setIsBanningUser(true)
    try {
      console.log(`${ban ? '🚫' : '✅'} [USER-MGMT] ${ban ? 'Banning' : 'Unbanning'} user:`, banUserInfo.mobile_number.substring(0, 5) + '***')
      console.log('🔍 [USER-MGMT] Current ban status before API call:', banUserInfo.is_banned)
      console.log('🎯 [USER-MGMT] Action being performed:', {
        currentlyBanned: banUserInfo.is_banned,
        actionToBan: ban,
        expectedResult: ban ? 'User will be banned' : 'User will be unbanned',
        apiCallParameters: {
          mobile_number: banUserInfo.mobile_number.substring(0, 5) + '***',
          ban: ban,
          reason: ban ? 'Banned by admin' : undefined
        }
      })
      
      const result = await sellikoClient.banUser(banUserInfo.mobile_number, ban, ban ? 'Banned by admin' : undefined) as any
      
      console.log('📥 [USER-MGMT] API response:', {
        success: result.success,
        user: result.user,
        error: result.error
      })
      
      if (result.success) {
        const action = ban ? 'banned' : 'unbanned'
        toast.success(`User ${action} successfully!`)
        console.log(`✅ [USER-MGMT] User ${action}:`, result.user)
        
        // Update local state with new ban status - ensure we use the correct value
        const newBanStatus = result.user?.is_banned !== undefined ? result.user.is_banned : ban
        console.log('🔄 [USER-MGMT] Updating ban status:', {
          from: banUserInfo.is_banned,
          to: newBanStatus,
          apiResponse: result.user?.is_banned,
          fallback: ban,
          verification: newBanStatus === ban ? '✅ Status matches expected' : '⚠️ Status mismatch'
        })
        
        setBanUserInfo({
          ...banUserInfo,
          is_banned: newBanStatus,
          banned_at: result.user?.banned_at || (ban ? new Date().toISOString() : null),
          ban_reason: result.user?.ban_reason || (ban ? 'Banned by admin' : null)
        })
      } else {
        toast.error(result.error || `Failed to ${ban ? 'ban' : 'unban'} user`)
        console.error(`❌ [USER-MGMT] ${ban ? 'Ban' : 'Unban'} failed:`, result.error)
      }
    } catch (error: any) {
      console.error(`💥 [USER-MGMT] ${ban ? 'Ban' : 'Unban'} error:`, error)
      toast.error(`Network error occurred while ${ban ? 'banning' : 'unbanning'} user`)
    } finally {
      setIsBanningUser(false)
    }
  }

  // Get User Details Handler (using mock data since API doesn't exist yet)
  const handleGetUserDetails = async () => {
    if (!getUserMobile.trim()) {
      toast.error('Mobile number is required')
      return
    }
    
    setIsGettingUser(true)
    try {
      console.log('📋 [USER-MGMT] Getting user details for:', getUserMobile.substring(0, 5) + '***')
      
      // TODO: Replace with real API call when get-user-details function is implemented
      // For now, using mock data
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay
      
      // Mock response - replace with real API call
      setUserDetails({
        mobile_number: getUserMobile,
        name: 'Jane Smith',
        email: 'jane@example.com',
        user_role: 'client',
        created_at: '2024-01-15T10:30:00Z',
        is_banned: false,
        listings: [
          { id: 1, device: 'iPhone 14 Pro', status: 'active', price: 85000 },
          { id: 2, device: 'Samsung Galaxy S23', status: 'sold', price: 65000 }
        ],
        logs: [
          { id: 1, action: 'Login', timestamp: '2024-01-20T09:15:00Z' },
          { id: 2, action: 'Created Listing', timestamp: '2024-01-19T14:30:00Z' }
        ]
      })
      
      toast.success('User details retrieved successfully!')
    } catch (error: any) {
      console.error('💥 [USER-MGMT] Get user details error:', error)
      toast.error('Network error occurred while getting user details')
    } finally {
      setIsGettingUser(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Component 1: Add User */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Icons.plus className="w-5 h-5 text-green-600" />
            <span>Add User</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Number
              </label>
              <Input
                type="tel"
                placeholder="Enter mobile number"
                value={addUserData.mobile_number}
                onChange={(e) => setAddUserData({ ...addUserData, mobile_number: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User Role
              </label>
              <select
                value={addUserData.user_role}
                onChange={(e) => setAddUserData({ ...addUserData, user_role: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="anon">Anonymous</option>
                <option value="client">Client</option>
                <option value="vendor">Vendor</option>
                <option value="agent">Agent</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <Button
            onClick={handleAddUser}
            disabled={isAddingUser || !addUserData.mobile_number.trim()}
            className="bg-green-600 hover:bg-green-700"
          >
            {isAddingUser ? (
              <>
                <Icons.spinner className="w-4 h-4 mr-2 animate-spin" />
                Adding User...
              </>
            ) : (
              <>
                <Icons.plus className="w-4 h-4 mr-2" />
                Add User
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Component 2: Ban User */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Icons.shield className="w-5 h-5 text-red-600" />
            <span>Ban/Unban User</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Number
              </label>
              <Input
                type="tel"
                placeholder="Enter mobile number to check"
                value={banUserMobile}
                onChange={(e) => setBanUserMobile(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleCheckBanUser}
                disabled={isCheckingBanUser || !banUserMobile.trim()}
                variant="outline"
              >
                {isCheckingBanUser ? (
                  <Icons.spinner className="w-4 h-4 animate-spin" />
                ) : (
                  'Check User'
                )}
              </Button>
            </div>
          </div>

          {/* User Ban Status Area */}
          {banUserInfo && (
            <div className="bg-gray-50 rounded-lg p-4 border">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-medium text-gray-900">{banUserInfo.name}</h4>
                  <p className="text-sm text-gray-600">{banUserInfo.mobile_number}</p>
                  <Badge variant="outline" className="mt-1">
                    {banUserInfo.user_role}
                  </Badge>
                </div>
                <Badge className={banUserInfo.is_banned ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                  {banUserInfo.is_banned ? 'Banned' : 'Active'}
                </Badge>
              </div>
              
              <Button
                onClick={() => {
                  const actionToBan = !banUserInfo.is_banned
                  console.log('🖱️ [USER-MGMT] Button clicked:', {
                    currentBanStatus: banUserInfo.is_banned,
                    actionToBan: actionToBan,
                    willCall: `handleBanUnbanUser(${actionToBan})`,
                    expectedOutcome: actionToBan ? 'Ban the user' : 'Unban the user'
                  })
                  handleBanUnbanUser(actionToBan)
                }}
                disabled={isBanningUser}
                className={banUserInfo.is_banned ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              >
                {isBanningUser ? (
                  <>
                    <Icons.spinner className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Icons.shield className="w-4 h-4 mr-2" />
                    {(() => {
                      const buttonText = banUserInfo.is_banned ? 'Unban User' : 'Ban User'
                      console.log('🎨 [USER-MGMT] Button render debug:', {
                        is_banned: banUserInfo.is_banned,
                        is_banned_type: typeof banUserInfo.is_banned,
                        is_banned_string: String(banUserInfo.is_banned),
                        buttonText: buttonText,
                        className: banUserInfo.is_banned ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700',
                        clickAction: !banUserInfo.is_banned ? 'Will ban user' : 'Will unban user'
                      })
                      return buttonText
                    })()}
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Component 3: Get User Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Icons.user className="w-5 h-5 text-blue-600" />
            <span>Get User Details</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Number
              </label>
              <Input
                type="tel"
                placeholder="Enter mobile number"
                value={getUserMobile}
                onChange={(e) => setGetUserMobile(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleGetUserDetails}
                disabled={isGettingUser || !getUserMobile.trim()}
              >
                {isGettingUser ? (
                  <>
                    <Icons.spinner className="w-4 h-4 mr-2 animate-spin" />
                    Getting...
                  </>
                ) : (
                  <>
                    <Icons.search className="w-4 h-4 mr-2" />
                    Get Details
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* User Details Display */}
          {userDetails && (
            <div className="space-y-6">
              {/* Profile Details */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-3 flex items-center">
                  <Icons.user className="w-4 h-4 mr-2" />
                  Profile Details
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <p className="font-medium text-gray-900">{userDetails.name}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Mobile:</span>
                    <p className="font-medium text-gray-900">{userDetails.mobile_number}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <p className="font-medium text-gray-900">{userDetails.email}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Role:</span>
                    <Badge variant="outline">{userDetails.user_role}</Badge>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <Badge className={userDetails.is_banned ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                      {userDetails.is_banned ? 'Banned' : 'Active'}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-gray-600">Joined:</span>
                    <p className="font-medium text-gray-900">
                      {new Date(userDetails.created_at).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Listings */}
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h4 className="font-medium text-green-900 mb-3 flex items-center">
                  <Icons.smartphone className="w-4 h-4 mr-2" />
                  Listings ({userDetails.listings.length})
                </h4>
                <div className="space-y-2">
                  {userDetails.listings.map((listing: any) => (
                    <div key={listing.id} className="flex items-center justify-between bg-white rounded-lg p-3">
                      <div>
                        <p className="font-medium text-gray-900">{listing.device}</p>
                        <p className="text-sm text-gray-600">₹{listing.price.toLocaleString()}</p>
                      </div>
                      <Badge className={listing.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {listing.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Logs */}
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <h4 className="font-medium text-yellow-900 mb-3 flex items-center">
                  <Icons.fileText className="w-4 h-4 mr-2" />
                  Recent Activity Logs
                </h4>
                <div className="space-y-2">
                  {userDetails.logs.map((log: any) => (
                    <div key={log.id} className="flex items-center justify-between bg-white rounded-lg p-3">
                      <div>
                        <p className="font-medium text-gray-900">{log.action}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(log.timestamp).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Vendor Management Component
function VendorManagement() {
  // State for vendor selection
  const [selectedVendorId, setSelectedVendorId] = useState('')
  const [vendors, setVendors] = useState<any[]>([])
  const [isLoadingVendors, setIsLoadingVendors] = useState(false)
  
  // State for vendor form
  const [vendorData, setVendorData] = useState({
    vendor_id: '',
    name: '',
    email: '',
    number: '',
    address: '',
    city: '',
    pincode: '',
    state: '',
    landmark: '',
    contact_person: '',
    contact_person_phone: '',
    working_pincodes: '',
    user_id: '',
    user_name: '',
    user_mobile: ''
  })
  const [isUpdatingVendor, setIsUpdatingVendor] = useState(false)

  // State for working pincodes tags
  const [workingPincodesArray, setWorkingPincodesArray] = useState<string[]>([])
  const [newPincode, setNewPincode] = useState('')

  // Load vendors on component mount
  useEffect(() => {
    loadVendors()
  }, [])

  // Load vendors list from API
  const loadVendors = async () => {
    setIsLoadingVendors(true)
    try {
      console.log('📋 [VENDOR-MGMT] Loading vendors list from API...')
      
      const token = localStorage.getItem('selliko_access_token')
      if (!token) {
        throw new Error('No access token found')
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_SELLIKO_API_BASE || 'http://127.0.0.1:54321/'}functions/v1/list-vendors`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('🌐 [VENDOR-MGMT] List vendors response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      })

      const result = await response.json()
      
      console.log('📥 [VENDOR-MGMT] List vendors result:', {
        success: result.success,
        vendorCount: result.vendors ? result.vendors.length : 0,
        message: result.message,
        error: result.error
      })

      if (result.success && result.vendors) {
        setVendors(result.vendors)
        console.log('✅ [VENDOR-MGMT] Vendors loaded:', result.vendors.length)
      } else {
        console.error('❌ [VENDOR-MGMT] Failed to load vendors:', result.error)
        toast.error(result.error || 'Failed to load vendors')
        setVendors([])
      }
    } catch (error: any) {
      console.error('💥 [VENDOR-MGMT] Load vendors error:', error)
      toast.error('Network error occurred while loading vendors')
      setVendors([])
    } finally {
      setIsLoadingVendors(false)
    }
  }

  // Handle vendor selection
  const handleVendorSelect = async (vendorId: string) => {
    if (!vendorId) {
      setSelectedVendorId('')
      setVendorData({
        vendor_id: '',
        name: '',
        email: '',
        number: '',
        address: '',
        city: '',
        pincode: '',
        state: '',
        landmark: '',
        contact_person: '',
        contact_person_phone: '',
        working_pincodes: '',
        user_id: '',
        user_name: '',
        user_mobile: ''
      })
      setWorkingPincodesArray([])
      setNewPincode('')
      return
    }

    setSelectedVendorId(vendorId)
    
    try {
      console.log('🔍 [VENDOR-MGMT] Loading vendor details for:', vendorId)
      
      // Find the selected vendor from the loaded vendors list
      const selectedVendor = vendors.find(v => v.vendor_profile?.vendor_id === vendorId)
      
      if (!selectedVendor) {
        console.error('❌ [VENDOR-MGMT] Vendor not found in loaded list:', vendorId)
        toast.error('Vendor not found')
        return
      }

      console.log('📋 [VENDOR-MGMT] Selected vendor data:', selectedVendor)
      
      // Map the API response to form data
      const profile = selectedVendor.vendor_profile
      const mappedData = {
        vendor_id: profile?.vendor_id || vendorId,
        name: profile?.name || selectedVendor.name || '',
        email: profile?.email || selectedVendor.email || '',
        number: profile?.number || selectedVendor.phone || '',
        address: profile?.address || '',
        city: profile?.city || '',
        pincode: profile?.pincode || '',
        state: profile?.state || '',
        landmark: profile?.landmark || '',
        contact_person: profile?.contact_person || '',
        contact_person_phone: profile?.contact_person_phone || '',
        working_pincodes: profile?.working_pincodes || '',
        user_id: selectedVendor.id || '',
        user_name: selectedVendor.name || '',
        user_mobile: selectedVendor.phone || ''
      }
      
      setVendorData(mappedData)
      console.log('✅ [VENDOR-MGMT] Vendor details loaded:', mappedData)
      
      // Convert working_pincodes string to array for tag display
      const pincodes = mappedData.working_pincodes 
        ? mappedData.working_pincodes.split(',').map((p: string) => p.trim()).filter((p: string) => p.length === 6)
        : []
      setWorkingPincodesArray(pincodes)
      console.log('📍 [VENDOR-MGMT] Working pincodes loaded:', pincodes)
    } catch (error: any) {
      console.error('💥 [VENDOR-MGMT] Load vendor details error:', error)
      toast.error('Failed to load vendor details')
    }
  }

  // Handle form input changes
  const handleInputChange = (field: string, value: string) => {
    setVendorData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Working Pincodes Management Functions
  const addPincode = () => {
    const trimmedPincode = newPincode.trim()
    
    // Validate pincode format (6 digits)
    if (!/^\d{6}$/.test(trimmedPincode)) {
      toast.error('Pincode must be exactly 6 digits')
      return
    }
    
    // Check for duplicates
    if (workingPincodesArray.includes(trimmedPincode)) {
      toast.error('Pincode already exists')
      return
    }
    
    const updatedPincodes = [...workingPincodesArray, trimmedPincode]
    setWorkingPincodesArray(updatedPincodes)
    
    // Update the main form data
    setVendorData(prev => ({
      ...prev,
      working_pincodes: updatedPincodes.join(', ')
    }))
    
    setNewPincode('')
    console.log('📍 [VENDOR-MGMT] Added pincode:', trimmedPincode)
  }

  const removePincode = (pincodeToRemove: string) => {
    const updatedPincodes = workingPincodesArray.filter(p => p !== pincodeToRemove)
    setWorkingPincodesArray(updatedPincodes)
    
    // Update the main form data
    setVendorData(prev => ({
      ...prev,
      working_pincodes: updatedPincodes.join(', ')
    }))
    
    console.log('📍 [VENDOR-MGMT] Removed pincode:', pincodeToRemove)
  }

  const handlePincodeKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addPincode()
    }
  }

  // Handle vendor update using API
  const handleUpdateVendor = async () => {
    if (!selectedVendorId) {
      toast.error('No vendor selected')
      return
    }

    // Validate required fields
    if (!vendorData.name || !vendorData.email || !vendorData.number) {
      toast.error('Name, email, and phone number are required')
      return
    }

    setIsUpdatingVendor(true)
    try {
      console.log('📝 [VENDOR-MGMT] Updating vendor:', selectedVendorId)
      
      const token = localStorage.getItem('selliko_access_token')
      if (!token) {
        throw new Error('No access token found')
      }

      // Prepare update payload - only include fields that can be updated
      const updatePayload = {
        vendor_id: vendorData.vendor_id,
        name: vendorData.name,
        email: vendorData.email,
        number: vendorData.number,
        address: vendorData.address,
        city: vendorData.city,
        pincode: vendorData.pincode,
        state: vendorData.state,
        landmark: vendorData.landmark,
        contact_person: vendorData.contact_person,
        contact_person_phone: vendorData.contact_person_phone,
        working_pincodes: vendorData.working_pincodes
      }

      console.log('📤 [VENDOR-MGMT] Update payload:', {
        vendor_id: updatePayload.vendor_id,
        hasName: !!updatePayload.name,
        hasEmail: !!updatePayload.email,
        hasNumber: !!updatePayload.number,
        hasAddress: !!updatePayload.address,
        hasCity: !!updatePayload.city
      })

      const response = await fetch(`${process.env.NEXT_PUBLIC_SELLIKO_API_BASE || 'http://127.0.0.1:54321/'}functions/v1/update-vendor-profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatePayload)
      })

      console.log('🌐 [VENDOR-MGMT] Update vendor response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      })

      const result = await response.json()
      
      console.log('📥 [VENDOR-MGMT] Update vendor result:', {
        success: result.success,
        message: result.message,
        error: result.error,
        hasVendorProfile: !!result.vendor_profile
      })

      if (result.success) {
        toast.success('Vendor updated successfully!')
        console.log('✅ [VENDOR-MGMT] Vendor updated successfully:', result.vendor_profile)
        
        // Refresh the vendors list to get updated data
        console.log('🔄 [VENDOR-MGMT] Refreshing vendors list after successful update...')
        await loadVendors()
        
        // After reloading vendors, re-select the current vendor to refresh the form
        console.log('🔄 [VENDOR-MGMT] Reloading selected vendor data after list refresh...')
        setTimeout(() => {
          handleVendorSelect(selectedVendorId)
        }, 100) // Small delay to ensure vendors list is updated
        
        // Also update the current form data with the response
        if (result.vendor_profile) {
          const updatedProfile = result.vendor_profile
          setVendorData(prev => ({
            ...prev,
            name: updatedProfile.name || prev.name,
            email: updatedProfile.email || prev.email,
            number: updatedProfile.number || prev.number,
            address: updatedProfile.address || prev.address,
            city: updatedProfile.city || prev.city,
            pincode: updatedProfile.pincode || prev.pincode,
            state: updatedProfile.state || prev.state,
            landmark: updatedProfile.landmark || prev.landmark,
            contact_person: updatedProfile.contact_person || prev.contact_person,
            contact_person_phone: updatedProfile.contact_person_phone || prev.contact_person_phone,
            working_pincodes: updatedProfile.working_pincodes || prev.working_pincodes
          }))
          
          // Update working pincodes array if it was updated
          if (updatedProfile.working_pincodes !== undefined) {
            const updatedPincodes = updatedProfile.working_pincodes 
              ? updatedProfile.working_pincodes.split(',').map((p: string) => p.trim()).filter((p: string) => p.length === 6)
              : []
            setWorkingPincodesArray(updatedPincodes)
            console.log('📍 [VENDOR-MGMT] Working pincodes updated:', updatedPincodes)
          }
          
          console.log('✅ [VENDOR-MGMT] Form data updated with API response')
        }
      } else {
        console.error('❌ [VENDOR-MGMT] Update failed:', result.error)
        toast.error(result.error || 'Failed to update vendor')
      }
    } catch (error: any) {
      console.error('💥 [VENDOR-MGMT] Update vendor error:', error)
      toast.error('Network error occurred while updating vendor')
    } finally {
      setIsUpdatingVendor(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Vendor Selection Dropdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Icons.package className="w-5 h-5 text-blue-600" />
            <span>Select Vendor</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Choose Vendor to Manage
              </label>
              <select
                value={selectedVendorId}
                onChange={(e) => handleVendorSelect(e.target.value)}
                disabled={isLoadingVendors}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              >
                <option value="">
                  {isLoadingVendors ? 'Loading vendors...' : 'Select a vendor'}
                </option>
                {vendors.map((vendor) => {
                  const vendorId = vendor.vendor_profile?.vendor_id || 'NO-ID'
                  const mobile = vendor.phone || 'No mobile'
                  const name = vendor.name || 'No name'
                  const city = vendor.vendor_profile?.city || 'No city'
                  
                  return (
                    <option key={vendor.id} value={vendorId}>
                      #{vendorId} - {mobile} - {name} - {city}
                    </option>
                  )
                })}
              </select>
            </div>
            
            {isLoadingVendors && (
              <div className="flex items-center justify-center py-4">
                <Icons.spinner className="w-6 h-6 animate-spin text-blue-600" />
                <span className="ml-2 text-sm text-gray-600">Loading vendors...</span>
              </div>
            )}

            {!isLoadingVendors && vendors.length === 0 && (
              <div className="text-center py-4">
                <Icons.inbox className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">No vendors found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Vendor Details Form */}
      {selectedVendorId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Icons.edit className="w-5 h-5 text-green-600" />
              <span>Vendor Details - {vendorData.vendor_id}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Vendor ID (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vendor ID
                </label>
                <Input
                  value={vendorData.vendor_id}
                  disabled
                  className="bg-gray-100 cursor-not-allowed"
                />
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name *
                  </label>
                  <Input
                    value={vendorData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter vendor name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <Input
                    type="email"
                    value={vendorData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter email address"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <Input
                    type="tel"
                    value={vendorData.number}
                    onChange={(e) => handleInputChange('number', e.target.value)}
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Person
                  </label>
                  <Input
                    value={vendorData.contact_person}
                    onChange={(e) => handleInputChange('contact_person', e.target.value)}
                    placeholder="Enter contact person name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Person Phone
                </label>
                <Input
                  type="tel"
                  value={vendorData.contact_person_phone}
                  onChange={(e) => handleInputChange('contact_person_phone', e.target.value)}
                  placeholder="Enter contact person phone"
                />
              </div>

              {/* Address Information */}
              <div className="border-t pt-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Address Information</h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <Input
                      value={vendorData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Enter full address"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <Input
                        value={vendorData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        placeholder="Enter city"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pincode
                      </label>
                      <Input
                        value={vendorData.pincode}
                        onChange={(e) => handleInputChange('pincode', e.target.value)}
                        placeholder="Enter pincode"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State
                      </label>
                      <Input
                        value={vendorData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        placeholder="Enter state"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Landmark
                    </label>
                    <Input
                      value={vendorData.landmark}
                      onChange={(e) => handleInputChange('landmark', e.target.value)}
                      placeholder="Enter nearby landmark"
                    />
                  </div>
                </div>
              </div>

              {/* Working Pincodes Section */}
              <div className="border-t pt-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Working Pincodes</h4>
                
                <div className="space-y-4">
                  {/* Add New Pincode */}
                  <div className="flex space-x-2">
                    <div className="flex-1">
                      <Input
                        value={newPincode}
                        onChange={(e) => setNewPincode(e.target.value)}
                        onKeyPress={handlePincodeKeyPress}
                        placeholder="Enter 6-digit pincode"
                        maxLength={6}
                        pattern="\d{6}"
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={addPincode}
                      disabled={!newPincode.trim() || newPincode.length !== 6}
                      variant="outline"
                      className="px-4"
                    >
                      <Icons.plus className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                  </div>
                  
                  {/* Pincodes Tags Display */}
                  {workingPincodesArray.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Working Pincodes ({workingPincodesArray.length})
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {workingPincodesArray.map((pincode, index) => (
                          <div
                            key={index}
                            className="inline-flex items-center bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full"
                          >
                            <span>{pincode}</span>
                            <button
                              type="button"
                              onClick={() => removePincode(pincode)}
                              className="ml-2 text-blue-600 hover:text-blue-800 focus:outline-none"
                            >
                              <Icons.x className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {workingPincodesArray.length === 0 && (
                    <div className="text-center py-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <Icons.mapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">No working pincodes added yet</p>
                      <p className="text-xs text-gray-500">Add pincodes where this vendor operates</p>
                    </div>
                  )}
                </div>
              </div>

              {/* User Information (Read-only) */}
              <div className="border-t pt-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Associated User Account</h4>
                
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        User ID
                      </label>
                      <p className="text-sm text-gray-900 font-mono bg-white px-3 py-2 rounded border">
                        {vendorData.user_id || 'Not assigned'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        User Name
                      </label>
                      <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">
                        {vendorData.user_name || 'Not available'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      User Mobile
                    </label>
                    <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">
                      {vendorData.user_mobile || 'Not available'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Update Button */}
              <div className="border-t pt-6">
                <Button
                  onClick={handleUpdateVendor}
                  disabled={isUpdatingVendor || !vendorData.name || !vendorData.email || !vendorData.number}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isUpdatingVendor ? (
                    <>
                      <Icons.spinner className="w-4 h-4 mr-2 animate-spin" />
                      Updating Vendor...
                    </>
                  ) : (
                    <>
                      <Icons.check className="w-4 h-4 mr-2" />
                      Update Vendor
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Agent Management Component
function AgentManagement() {
  // Get current user for role validation
  const { user } = useAuth()
  
  // State for agent selection
  const [selectedAgentId, setSelectedAgentId] = useState('')
  const [agents, setAgents] = useState([])
  const [isLoadingAgents, setIsLoadingAgents] = useState(false)
  
  // State for agent form
  const [agentData, setAgentData] = useState({
    agent_id: '',
    agent_code: '',
    name: '',
    email: '',
    number: '',
    address: '',
    city: '',
    pincode: '',
    state: '',
    landmark: '',
    contact_person: '',
    contact_person_phone: '',
    working_pincodes: '',
    user_id: '',
    user_name: '',
    user_mobile: ''
  })
  const [isUpdatingAgent, setIsUpdatingAgent] = useState(false)

  // State for working pincodes tags
  const [workingPincodesArray, setWorkingPincodesArray] = useState([])
  const [newPincode, setNewPincode] = useState('')

  // Load agents on component mount
  useEffect(() => {
    loadAgents()
  }, [])

  // Load agents list from API
  const loadAgents = async () => {
    setIsLoadingAgents(true)
    try {
      console.log('📋 [AGENT-MGMT] Loading agents list from API...')
      
      const result = await sellikoClient.listAgents()
      
      console.log('📥 [AGENT-MGMT] List agents result:', {
        success: result.success,
        agentCount: result.agents ? result.agents.length : 0,
        message: result.message,
        error: result.error
      })

      if (result.success && result.agents) {
        setAgents(result.agents)
        console.log('✅ [AGENT-MGMT] Agents loaded:', result.agents.length)
      } else {
        console.error('❌ [AGENT-MGMT] Failed to load agents:', result.error)
        toast.error(result.error || 'Failed to load agents')
        setAgents([])
      }
    } catch (error) {
      console.error('💥 [AGENT-MGMT] Load agents error:', error)
      toast.error('Network error occurred while loading agents')
      setAgents([])
    } finally {
      setIsLoadingAgents(false)
    }
  }

  // Handle agent selection
  const handleAgentSelect = async (agentId) => {
    if (!agentId) {
      setSelectedAgentId('')
      setAgentData({
        agent_id: '',
        agent_code: '',
        name: '',
        email: '',
        number: '',
        address: '',
        city: '',
        pincode: '',
        state: '',
        landmark: '',
        contact_person: '',
        contact_person_phone: '',
        working_pincodes: '',
        user_id: '',
        user_name: '',
        user_mobile: ''
      })
      setWorkingPincodesArray([])
      setNewPincode('')
      return
    }

    setSelectedAgentId(agentId)
    
    try {
      console.log('🔍 [AGENT-MGMT] Loading agent details for:', agentId)
      
      // Find the selected agent from the loaded agents list
      const selectedAgent = agents.find(a => a.agent_profile?.agent_id === parseInt(agentId))
      
      if (!selectedAgent) {
        console.error('❌ [AGENT-MGMT] Agent not found in loaded list:', agentId)
        toast.error('Agent not found')
        return
      }

      console.log('📋 [AGENT-MGMT] Selected agent data:', selectedAgent)
      
      // Map the API response to form data
      const profile = selectedAgent.agent_profile
      const mappedData = {
        agent_id: profile?.agent_id || agentId,
        agent_code: profile?.agent_code || '',
        name: profile?.name || selectedAgent.name || '',
        email: profile?.email || selectedAgent.email || '',
        number: profile?.number || selectedAgent.phone || '',
        address: profile?.address || '',
        city: profile?.city || '',
        pincode: profile?.pincode || '',
        state: profile?.state || '',
        landmark: profile?.landmark || '',
        contact_person: profile?.contact_person || '',
        contact_person_phone: profile?.contact_person_phone || '',
        working_pincodes: profile?.working_pincodes || '',
        user_id: selectedAgent.id || '',
        user_name: selectedAgent.name || '',
        user_mobile: selectedAgent.phone || ''
      }
      
      setAgentData(mappedData)
      console.log('✅ [AGENT-MGMT] Agent details loaded:', mappedData)
      
      // Convert working_pincodes string to array for tag display
      const pincodes = mappedData.working_pincodes 
        ? mappedData.working_pincodes.split(',').map((p) => p.trim()).filter((p) => p.length === 6)
        : []
      setWorkingPincodesArray(pincodes)
      console.log('📍 [AGENT-MGMT] Working pincodes loaded:', pincodes)
    } catch (error) {
      console.error('💥 [AGENT-MGMT] Load agent details error:', error)
      toast.error('Failed to load agent details')
    }
  }

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setAgentData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Working Pincodes Management Functions
  const addPincode = () => {
    const trimmedPincode = newPincode.trim()
    
    // Validate pincode format (6 digits)
    if (!/^\d{6}$/.test(trimmedPincode)) {
      toast.error('Pincode must be exactly 6 digits')
      return
    }
    
    // Check for duplicates
    if (workingPincodesArray.includes(trimmedPincode)) {
      toast.error('Pincode already exists')
      return
    }
    
    const updatedPincodes = [...workingPincodesArray, trimmedPincode]
    setWorkingPincodesArray(updatedPincodes)
    
    // Update the main form data
    setAgentData(prev => ({
      ...prev,
      working_pincodes: updatedPincodes.join(', ')
    }))
    
    setNewPincode('')
    console.log('📍 [AGENT-MGMT] Added pincode:', trimmedPincode)
  }

  const removePincode = (pincodeToRemove) => {
    const updatedPincodes = workingPincodesArray.filter(p => p !== pincodeToRemove)
    setWorkingPincodesArray(updatedPincodes)
    
    // Update the main form data
    setAgentData(prev => ({
      ...prev,
      working_pincodes: updatedPincodes.join(', ')
    }))
    
    console.log('📍 [AGENT-MGMT] Removed pincode:', pincodeToRemove)
  }

  const handlePincodeKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addPincode()
    }
  }

  // Handle agent update using API
  const handleUpdateAgent = async () => {
    if (!selectedAgentId) {
      toast.error('No agent selected')
      return
    }

    // Validate required fields
    if (!agentData.name || !agentData.email || !agentData.number) {
      toast.error('Name, email, and phone number are required')
      return
    }

    setIsUpdatingAgent(true)
    try {
      console.log('📝 [AGENT-MGMT] Updating agent:', selectedAgentId)
      
      // Prepare update payload - only include fields that can be updated
      const updatePayload = {
        name: agentData.name,
        email: agentData.email,
        number: agentData.number,
        address: agentData.address,
        city: agentData.city,
        pincode: agentData.pincode,
        state: agentData.state,
        landmark: agentData.landmark,
        contact_person: agentData.contact_person,
        contact_person_phone: agentData.contact_person_phone,
        working_pincodes: agentData.working_pincodes
      }

      // Only include agent_code if user is admin and agent_code has a value
      const userRole = (user?.user_role || '').toUpperCase()
      if (userRole === 'ADMIN' && agentData.agent_code && agentData.agent_code.trim()) {
        updatePayload.agent_code = agentData.agent_code.trim()
        console.log('🔑 [AGENT-MGMT] Including agent_code in update (admin user)')
      } else if (agentData.agent_code && userRole !== 'ADMIN') {
        console.log('⚠️ [AGENT-MGMT] Skipping agent_code update (user is not admin)')
      }

      console.log('📤 [AGENT-MGMT] Update payload:', {
        agent_id: agentData.agent_id,
        hasName: !!updatePayload.name,
        hasEmail: !!updatePayload.email,
        hasNumber: !!updatePayload.number,
        hasAddress: !!updatePayload.address,
        hasCity: !!updatePayload.city,
        hasAgentCode: !!updatePayload.agent_code,
        isAdmin: userRole === 'ADMIN'
      })

      const result = await sellikoClient.updateAgentProfile(agentData.agent_id, updatePayload)
      
      console.log('📥 [AGENT-MGMT] Update agent result:', {
        success: result.success,
        message: result.message,
        error: result.error,
        hasAgentProfile: !!result.agent_profile
      })

      if (result.success) {
        toast.success('Agent updated successfully!')
        console.log('✅ [AGENT-MGMT] Agent updated successfully:', result.agent_profile)
        
        // Refresh the agents list to get updated data
        console.log('🔄 [AGENT-MGMT] Refreshing agents list after successful update...')
        await loadAgents()
        
        // After reloading agents, re-select the current agent to refresh the form
        console.log('🔄 [AGENT-MGMT] Reloading selected agent data after list refresh...')
        setTimeout(() => {
          handleAgentSelect(selectedAgentId)
        }, 100) // Small delay to ensure agents list is updated
        
        // Also update the current form data with the response
        if (result.agent_profile) {
          const updatedProfile = result.agent_profile
          setAgentData(prev => ({
            ...prev,
            agent_code: updatedProfile.agent_code || prev.agent_code,
            name: updatedProfile.name || prev.name,
            email: updatedProfile.email || prev.email,
            number: updatedProfile.number || prev.number,
            address: updatedProfile.address || prev.address,
            city: updatedProfile.city || prev.city,
            pincode: updatedProfile.pincode || prev.pincode,
            state: updatedProfile.state || prev.state,
            landmark: updatedProfile.landmark || prev.landmark,
            contact_person: updatedProfile.contact_person || prev.contact_person,
            contact_person_phone: updatedProfile.contact_person_phone || prev.contact_person_phone,
            working_pincodes: updatedProfile.working_pincodes || prev.working_pincodes
          }))
          
          // Update working pincodes array if it was updated
          if (updatedProfile.working_pincodes !== undefined) {
            const updatedPincodes = updatedProfile.working_pincodes 
              ? updatedProfile.working_pincodes.split(',').map((p) => p.trim()).filter((p) => p.length === 6)
              : []
            setWorkingPincodesArray(updatedPincodes)
            console.log('📍 [AGENT-MGMT] Working pincodes updated:', updatedPincodes)
          }
          
          console.log('✅ [AGENT-MGMT] Form data updated with API response')
        }
      } else {
        console.error('❌ [AGENT-MGMT] Update failed:', result.error)
        toast.error(result.error || 'Failed to update agent')
      }
    } catch (error) {
      console.error('💥 [AGENT-MGMT] Update agent error:', error)
      toast.error('Network error occurred while updating agent')
    } finally {
      setIsUpdatingAgent(false)
    }
  }

  // Check if current user is admin for agent_code editing
  const isCurrentUserAdmin = (user?.user_role || '').toUpperCase() === 'ADMIN'

  return (
    <div className="space-y-6">
      {/* Agent Selection Dropdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Icons.user className="w-5 h-5 text-blue-600" />
            <span>Select Agent</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Choose Agent to Manage
              </label>
              <select
                value={selectedAgentId}
                onChange={(e) => handleAgentSelect(e.target.value)}
                disabled={isLoadingAgents}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              >
                <option value="">
                  {isLoadingAgents ? 'Loading agents...' : 'Select an agent'}
                </option>
                {agents.map((agent) => {
                  const agentId = agent.agent_profile?.agent_id || 'NO-ID'
                  const mobile = agent.phone || 'No mobile'
                  const name = agent.name || 'No name'
                  const city = agent.agent_profile?.city || 'No city'
                  const agentCode = agent.agent_profile?.agent_code || 'NO-CODE'
                  
                  return (
                    <option key={agent.id} value={agentId}>
                      #{agentId} - {agentCode} - {mobile} - {name} - {city}
                    </option>
                  )
                })}
              </select>
            </div>
            
            {isLoadingAgents && (
              <div className="flex items-center justify-center py-4">
                <Icons.spinner className="w-6 h-6 animate-spin text-blue-600" />
                <span className="ml-2 text-sm text-gray-600">Loading agents...</span>
              </div>
            )}

            {!isLoadingAgents && agents.length === 0 && (
              <div className="text-center py-4">
                <Icons.inbox className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">No agents found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Agent Details Form */}
      {selectedAgentId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Icons.edit className="w-5 h-5 text-green-600" />
              <span>Agent Details - {agentData.agent_code || agentData.agent_id}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Agent ID and Code */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Agent ID
                  </label>
                  <Input
                    value={agentData.agent_id}
                    disabled
                    className="bg-gray-100 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Agent Code {!isCurrentUserAdmin && <span className="text-xs text-orange-600">(admin only)</span>}
                  </label>
                  <Input
                    value={agentData.agent_code}
                    onChange={(e) => handleInputChange('agent_code', e.target.value.toUpperCase())}
                    placeholder="Enter 5-character code"
                    maxLength={5}
                    disabled={!isCurrentUserAdmin}
                    className={!isCurrentUserAdmin ? "bg-gray-100 cursor-not-allowed" : ""}
                  />
                  {!isCurrentUserAdmin && (
                    <p className="text-xs text-orange-600 mt-1">Only administrators can modify agent codes</p>
                  )}
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name *
                  </label>
                  <Input
                    value={agentData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter agent name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <Input
                    type="email"
                    value={agentData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter email address"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <Input
                    type="tel"
                    value={agentData.number}
                    onChange={(e) => handleInputChange('number', e.target.value)}
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Person
                  </label>
                  <Input
                    value={agentData.contact_person}
                    onChange={(e) => handleInputChange('contact_person', e.target.value)}
                    placeholder="Enter contact person name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Person Phone
                </label>
                <Input
                  type="tel"
                  value={agentData.contact_person_phone}
                  onChange={(e) => handleInputChange('contact_person_phone', e.target.value)}
                  placeholder="Enter contact person phone"
                />
              </div>

              {/* Address Information */}
              <div className="border-t pt-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Address Information</h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <Input
                      value={agentData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Enter full address"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <Input
                        value={agentData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        placeholder="Enter city"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pincode
                      </label>
                      <Input
                        value={agentData.pincode}
                        onChange={(e) => handleInputChange('pincode', e.target.value)}
                        placeholder="Enter pincode"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State
                      </label>
                      <Input
                        value={agentData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        placeholder="Enter state"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Landmark
                    </label>
                    <Input
                      value={agentData.landmark}
                      onChange={(e) => handleInputChange('landmark', e.target.value)}
                      placeholder="Enter nearby landmark"
                    />
                  </div>
                </div>
              </div>

              {/* Working Pincodes Section */}
              <div className="border-t pt-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Working Pincodes</h4>
                
                <div className="space-y-4">
                  {/* Add New Pincode */}
                  <div className="flex space-x-2">
                    <div className="flex-1">
                      <Input
                        value={newPincode}
                        onChange={(e) => setNewPincode(e.target.value)}
                        onKeyPress={handlePincodeKeyPress}
                        placeholder="Enter 6-digit pincode"
                        maxLength={6}
                        pattern="\d{6}"
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={addPincode}
                      disabled={!newPincode.trim() || newPincode.length !== 6}
                      variant="outline"
                      className="px-4"
                    >
                      <Icons.plus className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                  </div>
                  
                  {/* Pincodes Tags Display */}
                  {workingPincodesArray.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Working Pincodes ({workingPincodesArray.length})
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {workingPincodesArray.map((pincode, index) => (
                          <div
                            key={index}
                            className="inline-flex items-center bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full"
                          >
                            <span>{pincode}</span>
                            <button
                              type="button"
                              onClick={() => removePincode(pincode)}
                              className="ml-2 text-blue-600 hover:text-blue-800 focus:outline-none"
                            >
                              <Icons.x className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {workingPincodesArray.length === 0 && (
                    <div className="text-center py-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <Icons.mapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">No working pincodes added yet</p>
                      <p className="text-xs text-gray-500">Add pincodes where this agent operates</p>
                    </div>
                  )}
                </div>
              </div>

              {/* User Information (Read-only) */}
              <div className="border-t pt-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Associated User Account</h4>
                
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        User ID
                      </label>
                      <p className="text-sm text-gray-900 font-mono bg-white px-3 py-2 rounded border">
                        {agentData.user_id || 'Not assigned'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        User Name
                      </label>
                      <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">
                        {agentData.user_name || 'Not available'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      User Mobile
                    </label>
                    <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">
                      {agentData.user_mobile || 'Not available'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Update Button */}
              <div className="border-t pt-6">
                <Button
                  onClick={handleUpdateAgent}
                  disabled={isUpdatingAgent || !agentData.name || !agentData.email || !agentData.number}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isUpdatingAgent ? (
                    <>
                      <Icons.spinner className="w-4 h-4 mr-2 animate-spin" />
                      Updating Agent...
                    </>
                  ) : (
                    <>
                      <Icons.check className="w-4 h-4 mr-2" />
                      Update Agent
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Main Content Component
function SettingsContent({ activeSection }: { activeSection: string }) {
  const activeMenuItem = settingsMenuItems.find(item => item.id === activeSection)
  const IconComponent = activeMenuItem?.icon || Icons.settings

  return (
    <div className="flex-1 bg-gray-50">
      {/* Content Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <IconComponent className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {activeMenuItem?.label || 'Settings'}
            </h1>
            <p className="text-gray-600 mt-1">
              {activeMenuItem?.description || 'Configure platform settings'}
            </p>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-8">
        <div className="max-w-4xl">
          {/* Conditional Content Rendering */}
          {activeSection === 'users' ? (
            <UserManagement />
          ) : activeSection === 'vendors' ? (
            <VendorManagement />
          ) : activeSection === 'agents' ? (
            <AgentManagement />
          ) : (
            /* Placeholder content for other sections */
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <IconComponent className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {activeMenuItem?.label} Component
              </h3>
              <p className="text-gray-600 mb-6">
                This section will contain the {activeMenuItem?.label.toLowerCase()} configuration interface.
              </p>
              <div className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
                <Icons.fileText className="w-4 h-4 mr-2" />
                Component will be implemented here
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Main Settings Page Component
export default function AdminSettings() {
  const { user } = useAuth()
  const router = useRouter()
  const [activeSection, setActiveSection] = useState('general')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <Icons.arrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Icons.shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">SELLIKO Admin</h1>
                <p className="text-xs text-gray-500">Settings & Configuration</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name || 'Admin User'}</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-73px)]">
        <SettingsSidebar 
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />
        <SettingsContent activeSection={activeSection} />
      </div>
    </div>
  )
} 