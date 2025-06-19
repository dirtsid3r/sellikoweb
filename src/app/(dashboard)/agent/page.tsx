'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useInstanceId } from '@/contexts/instance-context'
import { 
  ClockIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  DevicePhoneMobileIcon,
  CameraIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  MapPinIcon,
  ArrowRightIcon,
  PlayIcon,
  TruckIcon
} from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import sellikoClient from '@/selliko-client'
import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Icons } from '@/components/ui/icons'
import DeliveryModal from '@/components/shared/DeliveryModal'

// Mock data - in real app this would come from API
const verificationStats = {
  today: {
    completed: 12,
    pending: 5
  },
  thisWeek: {
    completed: 67,
    pending: 18
  }
}

const pendingVerifications = [
  {
    id: 'VER001',
    device: 'iPhone 14 Pro Max',
    seller: 'Rajesh Kumar',
    location: 'Kakkanad, Kochi',
    priority: 'high',
    timeLeft: '2h 30m',
    assignedAt: '10:30 AM',
    images: ['/api/placeholder/100/100'],
    status: 'pending_pickup'
  },
  {
    id: 'VER002', 
    device: 'Samsung Galaxy S23 Ultra',
    seller: 'Priya Nair',
    location: 'Palarivattom, Kochi',
    priority: 'medium',
    timeLeft: '4h 15m',
    assignedAt: '11:45 AM',
    images: ['/api/placeholder/100/100'],
    status: 'in_progress'
  },
  {
    id: 'VER003',
    device: 'OnePlus 11 5G',
    seller: 'Arjun Menon', 
    location: 'Edappally, Kochi',
    priority: 'low',
    timeLeft: '6h 45m',
    assignedAt: '12:20 PM',
    images: ['/api/placeholder/100/100'],
    status: 'scheduled'
  }
]



const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'bg-red-100 text-red-800 border-red-200'
    case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'low': return 'bg-green-100 text-green-800 border-green-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'agent_assigned': return 'text-blue-600'
    case 'verification': return 'text-orange-600'
    case 'ready_for_pickup': return 'text-green-600'
    default: return 'text-gray-600'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'agent_assigned': return 'Ready to Start'
    case 'verification': return 'In Verification'
    case 'ready_for_pickup': return 'Ready for Pickup'
    default: return status
  }
}

// Add type definitions for the API response
interface ApiTask {
  listing_id: number
  product: string
  front_image_url: string | null
  seller: string
  address: string
  status: string
  done_by: string
  assigned_time: string
  vendor_id?: string | number
}

interface ApiResponse {
  success: boolean
  tasks?: ApiTask[]
  error?: string
  message?: string
}

// Type definitions for Pending Deliveries
interface PickupDeliverTo {
  id: string
  vendor_code: string
  name: string
  email: string
  number: string
  address: string
  city: string
  pincode: string
  state: string
  landmark: string
  contact_person: string
  contact_person_phone: string
  working_pincodes: string
}

interface PendingDelivery {
  listing_id: number
  name: string
  seller: string
  time: string
  deliver_to: PickupDeliverTo
}

interface PickupsResponse {
  success: boolean
  pickups?: PendingDelivery[]
  error?: string
  message?: string
}

export default function AgentDashboard() {
  const { instanceId } = useInstanceId()
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()
  
  // State for tasks
  const [tasks, setTasks] = useState<ApiTask[]>([])
  const [isLoadingTasks, setIsLoadingTasks] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<string | null>(null)
  const [isAuthChecking, setIsAuthChecking] = useState(true)

  // State for pending deliveries
  const [pendingDeliveries, setPendingDeliveries] = useState<PendingDelivery[]>([])
  const [isLoadingDeliveries, setIsLoadingDeliveries] = useState(true)

  // State for delivery modal
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false)
  const [selectedDelivery, setSelectedDelivery] = useState<PendingDelivery | null>(null)

  // Fetch tasks from API
  const fetchTasks = async () => {
    setIsLoadingTasks(true)
    try {
      console.log('🔄 [AGENT-DASHBOARD] Fetching tasks...')
      const response = await sellikoClient.getTasks() as ApiResponse
      
      if (response.success) {
        console.log('✅ [AGENT-DASHBOARD] Tasks fetched successfully:', response.tasks?.length)
        setTasks(response.tasks || [])
        setLastRefresh(new Date().toLocaleTimeString())
        toast.success(`${response.tasks?.length || 0} tasks loaded`)
      } else {
        console.error('❌ [AGENT-DASHBOARD] Failed to fetch tasks:', response.error)
        toast.error(response.error || 'Failed to load tasks')
        setTasks([])
      }
    } catch (error) {
      console.error('💥 [AGENT-DASHBOARD] Error fetching tasks:', error)
      toast.error('Network error while loading tasks')
      setTasks([])
    } finally {
      setIsLoadingTasks(false)
    }
  }

  // Fetch pending deliveries from API
  const fetchPendingDeliveries = async () => {
    setIsLoadingDeliveries(true)
    try {
      console.log('🔄 [AGENT-DASHBOARD] Fetching pending deliveries...')
      const response = await sellikoClient.getPickups() as PickupsResponse
      
      if (response.success) {
        console.log('✅ [AGENT-DASHBOARD] Pending deliveries fetched successfully:', response.pickups?.length)
        setPendingDeliveries(response.pickups || [])
      } else {
        console.error('❌ [AGENT-DASHBOARD] Failed to fetch pending deliveries:', response.error)
        setPendingDeliveries([])
      }
    } catch (error) {
      console.error('💥 [AGENT-DASHBOARD] Error fetching pending deliveries:', error)
      setPendingDeliveries([])
    } finally {
      setIsLoadingDeliveries(false)
    }
  }

  // Handle delivery button click
  const handleDeliverClick = (delivery: PendingDelivery) => {
    setSelectedDelivery(delivery)
    setIsDeliveryModalOpen(true)
  }

  // Handle delivery confirmation
  const handleConfirmDelivery = async (listingId: number, deliveryOtp: string) => {
    try {
      console.log('🚀 [AGENT-DASHBOARD] Confirming delivery...', { listingId, deliveryOtp: '****' })
      const response = await sellikoClient.confirmDelivery(listingId, deliveryOtp) as any
      
      if (response.success) {
        console.log('✅ [AGENT-DASHBOARD] Delivery confirmed successfully')
        toast.success('Delivery confirmed successfully!')
        
        // Refresh the pending deliveries list
        await fetchPendingDeliveries()
        
        // Close modal
        setIsDeliveryModalOpen(false)
        setSelectedDelivery(null)
      } else {
        console.error('❌ [AGENT-DASHBOARD] Failed to confirm delivery:', response.error)
        toast.error(response.error || 'Failed to confirm delivery')
        throw new Error(response.error || 'Failed to confirm delivery')
      }
    } catch (error) {
      console.error('💥 [AGENT-DASHBOARD] Error confirming delivery:', error)
      toast.error('Network error while confirming delivery')
      throw error // Re-throw to let modal handle the error state
    }
  }

  // Load tasks and pending deliveries when component mounts
  useEffect(() => {
    if (user && (user as any).user_role?.toUpperCase() === 'AGENT') {
      fetchTasks()
      fetchPendingDeliveries()
      setIsAuthChecking(false)
    }
  }, [user])

  // Auto-refresh tasks and deliveries every 2 minutes
  useEffect(() => {
    if (user && (user as any).user_role?.toUpperCase() === 'AGENT') {
      const interval = setInterval(() => {
        fetchTasks()
        fetchPendingDeliveries()
      }, 120000) // 2 minutes
      return () => clearInterval(interval)
    }
  }, [user])

  if (isLoading || isAuthChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <Icons.spinner className="w-8 h-8 text-white animate-spin" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Dashboard</h2>
          <p className="text-gray-600">Preparing agent panel...</p>
        </div>
      </div>
    )
  }

  // Convert API response to match component format
  const formatApiTasksForComponent = (apiTasks: ApiTask[]) => {
    return apiTasks.map((task: ApiTask) => ({
      id: task.vendor_id && task.listing_id ? `${task.vendor_id}/${task.listing_id}` : `VER${task.listing_id.toString().padStart(3, '0')}`,
      device: task.product || 'Unknown Device',
      seller: task.seller || 'Unknown Seller',
      location: task.address ? task.address.split(',').slice(-2).join(',').trim() : 'Unknown Location',
      priority: 'medium', // Default since API doesn't provide priority
      timeLeft: task.done_by || 'Unknown',
      assignedAt: task.assigned_time ? new Date(task.assigned_time).toLocaleTimeString() : 'Unknown',
      images: task.front_image_url ? [task.front_image_url] : ['/api/placeholder/100/100'],
      status: task.status || 'agent_assigned',
      fullAddress: task.address || 'Address not provided',
      listingId: task.listing_id,
      vendorId: task.vendor_id
    }))
  }

  const formattedTasks = formatApiTasksForComponent(tasks)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Agent Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage device verifications and complete pickup tasks</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/agent/verification"
                className="btn-primary px-6 py-3 rounded-xl inline-flex items-center"
              >
                <PlayIcon className="w-5 h-5 mr-2" />
                Start Verification
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card-mobile bg-white/80 backdrop-blur-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Verifications</p>
                <p className="text-3xl font-bold text-purple-600">{verificationStats.today.completed}</p>
                <p className="text-sm text-gray-500">{verificationStats.today.pending} pending</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <CheckCircleIcon className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="card-mobile bg-white/80 backdrop-blur-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Week</p>
                <p className="text-3xl font-bold text-blue-600">{verificationStats.thisWeek.completed}</p>
                <p className="text-sm text-gray-500">{verificationStats.thisWeek.pending} pending</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <DevicePhoneMobileIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="card-mobile bg-white/80 backdrop-blur-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-3xl font-bold text-green-600">98%</p>
                <p className="text-sm text-gray-500">Quality score</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <ShieldCheckIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="card-mobile bg-white/80 backdrop-blur-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Verification Time</p>
                <p className="text-3xl font-bold text-orange-600">24m</p>
                <p className="text-sm text-gray-500">Per device</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <ClockIcon className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Pending Verifications */}
          <div className="lg:col-span-2">
            <div className="card-mobile bg-white/80 backdrop-blur-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Pending Verifications</h2>
                <div className="flex items-center space-x-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    {formattedTasks.length} Active
                  </span>
                  <Button
                    onClick={fetchTasks}
                    disabled={isLoadingTasks}
                    size="sm"
                    variant="outline"
                    className="text-xs"
                  >
                    {isLoadingTasks ? (
                      <Icons.spinner className="h-3 w-3 animate-spin mr-1" />
                    ) : (
                      <Icons.refresh className="h-3 w-3 mr-1" />
                    )}
                    Refresh
                  </Button>
                </div>
              </div>

              {lastRefresh && (
                <p className="text-xs text-gray-500 mb-4">
                  Last updated: {lastRefresh}
                </p>
              )}

              {isLoadingTasks ? (
                <div className="flex items-center justify-center py-8">
                  <Icons.spinner className="h-6 w-6 animate-spin text-purple-600" />
                  <span className="ml-2 text-gray-600">Loading tasks...</span>
                </div>
              ) : formattedTasks.length === 0 ? (
                <div className="text-center py-8">
                  <DevicePhoneMobileIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Tasks Assigned</h3>
                  <p className="text-gray-600 mb-4">You don't have any verification tasks at the moment.</p>
                  <Button
                    onClick={fetchTasks}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Icons.refresh className="h-4 w-4 mr-2" />
                    Check for New Tasks
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {formattedTasks.map((task: any) => (
                    <div key={task.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <img 
                            src={task.images[0]} 
                            alt={task.device}
                            className="w-16 h-16 rounded-lg object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = '/api/placeholder/100/100'
                            }}
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-semibold text-gray-900">{task.device}</h3>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                                {task.priority.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">Seller: {task.seller}</p>
                            <div className="flex items-center text-sm text-gray-500">
                              <MapPinIcon className="w-4 h-4 mr-1" />
                              {task.location}
                            </div>
                            <p className="text-xs text-gray-400 mt-1" title={task.fullAddress}>
                              Full address: {task.fullAddress}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-medium ${getStatusColor(task.status)}`}>
                            {getStatusText(task.status)}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            <ClockIcon className="w-4 h-4 inline mr-1" />
                            {task.timeLeft} left
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            Assigned: {task.assignedAt}
                          </div>
                          <div className="text-xs text-gray-400">
                            Listing ID: {task.listingId}
                          </div>
                          {task.vendorId && (
                            <div className="text-xs text-gray-400">
                              Vendor ID: {task.vendorId}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                        <div className="text-sm text-gray-600">
                          Task ID: {task.id}
                        </div>
                        {task.status === 'ready_for_pickup' ? (
                          <Link
                            href={`/agent/verification?taskId=${task.listingId}`}
                            className="inline-flex items-center px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors"
                          >
                            <TruckIcon className="w-4 h-4 mr-2" />
                            Pickup
                          </Link>
                        ) : (
                          <Link
                            href={`/agent/verification?taskId=${task.listingId}`}
                            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
                          >
                            {task.status === 'verification' ? 'Continue' : 'Start'} Verification
                            <ArrowRightIcon className="w-4 h-4 ml-2" />
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pending Deliveries */}
            <div className="card-mobile bg-white/80 backdrop-blur-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Pending Deliveries</h2>
                <Button
                  onClick={fetchPendingDeliveries}
                  disabled={isLoadingDeliveries}
                  size="sm"
                  variant="outline"
                  className="text-xs"
                >
                  {isLoadingDeliveries ? (
                    <Icons.spinner className="h-3 w-3 animate-spin mr-1" />
                  ) : (
                    <Icons.refresh className="h-3 w-3 mr-1" />
                  )}
                  Refresh
                </Button>
              </div>

              {isLoadingDeliveries ? (
                <div className="flex items-center justify-center py-8">
                  <Icons.spinner className="h-4 w-4 animate-spin text-purple-600" />
                  <span className="ml-2 text-gray-600 text-sm">Loading deliveries...</span>
                </div>
              ) : pendingDeliveries.length === 0 ? (
                <div className="text-center py-6">
                  <TruckIcon className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">No pending deliveries</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingDeliveries.map((delivery) => (
                    <div key={delivery.listing_id} className="border-l-4 border-orange-500 pl-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900">{delivery.name}</h3>
                        <span className="text-sm text-purple-600 font-semibold">
                          #{delivery.deliver_to.vendor_code}/{delivery.listing_id}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">Seller: {delivery.seller}</p>
                      <div className="flex items-center justify-between text-sm mb-3">
                        <span className="text-gray-500">
                          {new Date(delivery.time).toLocaleString()}
                        </span>
                        <div className="text-right">
                          <div className="text-xs text-gray-600">{delivery.deliver_to.name}</div>
                          <div className="text-xs text-gray-500">{delivery.deliver_to.city}</div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="bg-orange-600 hover:bg-orange-700 text-white w-full"
                        onClick={() => handleDeliverClick(delivery)}
                      >
                        <TruckIcon className="w-4 h-4 mr-2" />
                        Deliver
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="card-mobile bg-white/80 backdrop-blur-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link
                  href="/agent/verification"
                  className="block w-full px-4 py-3 bg-purple-600 text-white text-center rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  <PlayIcon className="w-5 h-5 inline mr-2" />
                  Start New Verification
                </Link>
                <Link
                  href="/agent/profile/update"
                  className="block w-full px-4 py-3 bg-gray-100 text-gray-700 text-center rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  <UserGroupIcon className="w-5 h-5 inline mr-2" />
                  Update Profile
                </Link>
                <Link
                  href="/agent/tasks"
                  className="block w-full px-4 py-3 bg-gray-100 text-gray-700 text-center rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  <ClockIcon className="w-5 h-5 inline mr-2" />
                  All Tasks
                </Link>
              </div>
            </div>

            {/* Performance Badge */}
            <div className="card-mobile bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
              <div className="text-center">
                <CheckCircleSolid className="w-12 h-12 mx-auto mb-3 text-green-300" />
                <h3 className="font-semibold mb-2">Verified Agent</h3>
                <p className="text-sm opacity-90 mb-3">Level 3 • Premium Status</p>
                <div className="bg-white/20 rounded-full h-2 mb-2">
                  <div className="bg-white rounded-full h-2" style={{ width: '85%' }}></div>
                </div>
                <p className="text-xs opacity-75">85% to Level 4</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Modal */}
      <DeliveryModal
        isOpen={isDeliveryModalOpen}
        onClose={() => {
          setIsDeliveryModalOpen(false)
          setSelectedDelivery(null)
        }}
        delivery={selectedDelivery}
        onConfirmDelivery={handleConfirmDelivery}
      />
    </div>
  )
} 