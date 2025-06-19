'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
  PhoneIcon,
  CalendarIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ArrowRightIcon,
  StarIcon,
  BoltIcon,
  DevicePhoneMobileIcon,
  TruckIcon,
  PlayIcon
} from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import sellikoClient from '@/selliko-client'
import { toast } from 'react-hot-toast'
import { Icons } from '@/components/ui/icons'
import { Button } from '@/components/ui/button'
import Header from '@/components/layout/header'

// Type definitions for API response
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

interface Task {
  id: string
  device: string
  seller: string
  location: string
  priority: 'high' | 'medium' | 'low'
  status: 'scheduled' | 'pending_pickup' | 'in_progress' | 'completed' | 'cancelled' | 'agent_assigned' | 'verification' | 'ready_for_pickup'
  timeLeft: string
  assignedAt: string
  images: string[]
  listingId: number
  vendorId?: string | number
  fullAddress: string
}

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
    case 'scheduled': return 'text-gray-600'
    case 'pending_pickup': return 'text-orange-600'
    case 'in_progress': return 'text-blue-600'
    case 'completed': return 'text-green-600'
    case 'cancelled': return 'text-red-600'
    default: return 'text-gray-600'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'agent_assigned': return 'Ready to Start'
    case 'verification': return 'In Verification'
    case 'ready_for_pickup': return 'Ready for Pickup'
    case 'scheduled': return 'Scheduled'
    case 'pending_pickup': return 'Ready for Pickup'
    case 'in_progress': return 'Verification Started'
    case 'completed': return 'Completed'
    case 'cancelled': return 'Cancelled'
    default: return status
  }
}

// Helper function to map API status to our component status
const mapApiStatusToComponentStatus = (apiStatus: string): Task['status'] => {
  switch (apiStatus?.toLowerCase()) {
    case 'agent_assigned': return 'agent_assigned'
    case 'verification': return 'verification'
    case 'ready_for_pickup': return 'ready_for_pickup'
    case 'completed': return 'completed'
    case 'cancelled': return 'cancelled'
    default: return 'agent_assigned'
  }
}

// Helper function to determine priority based on time assigned
const determinePriority = (assignedTime: string): Task['priority'] => {
  const now = new Date()
  const assigned = new Date(assignedTime)
  const hoursSinceAssigned = (now.getTime() - assigned.getTime()) / (1000 * 60 * 60)
  
  if (hoursSinceAssigned > 4) return 'high'
  if (hoursSinceAssigned > 2) return 'medium'
  return 'low'
}

export default function AgentTasks() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  
  // State management
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoadingTasks, setIsLoadingTasks] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('priority') // priority, time, value

  // Convert API tasks to component format (same as agent page)
  const formatApiTasksForComponent = (apiTasks: ApiTask[]): Task[] => {
    return apiTasks.map((task: ApiTask) => {
      const componentStatus = mapApiStatusToComponentStatus(task.status)
      const priority = determinePriority(task.assigned_time)
      
      return {
        id: task.vendor_id && task.listing_id ? `${task.vendor_id}/${task.listing_id}` : `VER${task.listing_id.toString().padStart(3, '0')}`,
        device: task.product || 'Unknown Device',
        seller: task.seller || 'Unknown Seller',
        location: task.address ? task.address.split(',').slice(-2).join(',').trim() : 'Unknown Location',
        priority: priority,
        status: componentStatus,
        timeLeft: task.done_by || 'Time not specified',
        assignedAt: task.assigned_time ? new Date(task.assigned_time).toLocaleTimeString() : 'Unknown',
        images: task.front_image_url ? [task.front_image_url] : ['/api/placeholder/100/100'],
        listingId: task.listing_id,
        vendorId: task.vendor_id,
        fullAddress: task.address || 'Address not provided'
      }
    })
  }

  // Fetch tasks from API
  const fetchTasks = async () => {
    setIsLoadingTasks(true)
    try {
      console.log('🔄 [AGENT-TASKS] Fetching tasks...')
      const response = await sellikoClient.getTasks() as ApiResponse
      
      if (response.success) {
        console.log('✅ [AGENT-TASKS] Tasks fetched successfully:', response.tasks?.length)
        const formattedTasks = formatApiTasksForComponent(response.tasks || [])
        setTasks(formattedTasks)
        setLastRefresh(new Date().toLocaleTimeString())
        toast.success(`${formattedTasks.length} tasks loaded`)
      } else {
        console.error('❌ [AGENT-TASKS] Failed to fetch tasks:', response.error)
        toast.error(response.error || 'Failed to load tasks')
        setTasks([])
      }
    } catch (error) {
      console.error('💥 [AGENT-TASKS] Error fetching tasks:', error)
      toast.error('Network error while loading tasks')
      setTasks([])
    } finally {
      setIsLoadingTasks(false)
    }
  }

  // Load tasks when component mounts
  useEffect(() => {
    if (user && (user as any).user_role?.toUpperCase() === 'AGENT') {
      fetchTasks()
    }
  }, [user])

  // Auto-refresh tasks every 2 minutes
  useEffect(() => {
    if (user && (user as any).user_role?.toUpperCase() === 'AGENT') {
      const interval = setInterval(() => {
        fetchTasks()
      }, 120000) // 2 minutes
      return () => clearInterval(interval)
    }
  }, [user])

  // Handle loading states
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <Icons.spinner className="w-8 h-8 text-white animate-spin" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Tasks</h2>
          <p className="text-gray-600">Preparing task management...</p>
        </div>
      </div>
    )
  }

  // Generate status filters based on actual data
  const statusFilters = [
    { key: 'all', label: 'All Tasks', count: tasks.length },
    { key: 'agent_assigned', label: 'Ready to Start', count: tasks.filter(t => t.status === 'agent_assigned').length },
    { key: 'verification', label: 'In Progress', count: tasks.filter(t => t.status === 'verification').length },
    { key: 'ready_for_pickup', label: 'Ready for Pickup', count: tasks.filter(t => t.status === 'ready_for_pickup').length },
    { key: 'completed', label: 'Completed', count: tasks.filter(t => t.status === 'completed').length }
  ]

  const filteredTasks = tasks
    .filter(task => {
      if (activeFilter === 'all') return true
      return task.status === activeFilter
    })
    .filter(task => {
      if (!searchQuery) return true
      return task.device.toLowerCase().includes(searchQuery.toLowerCase()) ||
             task.seller.toLowerCase().includes(searchQuery.toLowerCase()) ||
             task.location.toLowerCase().includes(searchQuery.toLowerCase())
    })
    .sort((a, b) => {
      if (sortBy === 'priority') {
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      }
      if (sortBy === 'time') {
        return new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime()
      }
      return 0 // Default order
    })

  const todayStats = {
    total: tasks.length,
    ready: tasks.filter(t => t.status === 'agent_assigned').length,
    inProgress: tasks.filter(t => t.status === 'verification').length,
    completed: tasks.filter(t => t.status === 'completed').length
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <Header variant="agent" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Task Management</h1>
            <p className="text-gray-600 mt-1">
              Manage your verification assignments and track progress
              {lastRefresh && (
                <span className="text-sm ml-2">• Last updated: {lastRefresh}</span>
              )}
            </p>
          </div>
          <div className="flex items-center space-x-4">
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
            <Link
              href="/agent/verification"
              className="btn-primary px-6 py-3 rounded-xl inline-flex items-center"
            >
              <BoltIcon className="w-5 h-5 mr-2" />
              Start Verification
            </Link>
          </div>
        </div>

        {/* Today's Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card-mobile bg-white/80 backdrop-blur-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                <p className="text-3xl font-bold text-purple-600">{todayStats.total}</p>
              </div>
              <DevicePhoneMobileIcon className="w-12 h-12 text-purple-600" />
            </div>
          </div>
          
          <div className="card-mobile bg-white/80 backdrop-blur-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ready to Start</p>
                <p className="text-3xl font-bold text-blue-600">{todayStats.ready}</p>
              </div>
              <PlayIcon className="w-12 h-12 text-blue-600" />
            </div>
          </div>
          
          <div className="card-mobile bg-white/80 backdrop-blur-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-3xl font-bold text-orange-600">{todayStats.inProgress}</p>
              </div>
              <ClockIcon className="w-12 h-12 text-orange-600" />
            </div>
          </div>

          <div className="card-mobile bg-white/80 backdrop-blur-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-green-600">{todayStats.completed}</p>
              </div>
              <CheckCircleSolid className="w-12 h-12 text-green-600" />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoadingTasks && (
          <div className="text-center py-12">
            <Icons.spinner className="w-8 h-8 mx-auto text-purple-600 animate-spin mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading tasks...</h3>
            <p className="text-gray-600">Fetching your verification assignments</p>
          </div>
        )}

        {/* Filters and Search */}
        {!isLoadingTasks && (
          <div className="card-mobile bg-white/80 backdrop-blur-sm p-6 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Status Filters */}
              <div className="flex flex-wrap gap-2">
                {statusFilters.map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() => setActiveFilter(filter.key)}
                    className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      activeFilter === filter.key
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {filter.label}
                    <span className="ml-2 bg-white/20 text-xs px-2 py-0.5 rounded-full">
                      {filter.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Search and Sort */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="priority">Sort by Priority</option>
                  <option value="time">Sort by Time</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Tasks List - Using exact same format as agent page */}
        {!isLoadingTasks && (
          <div className="space-y-4">
            {filteredTasks.map((task) => (
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

        {!isLoadingTasks && filteredTasks.length === 0 && (
          <div className="text-center py-12">
            {tasks.length === 0 ? (
              <>
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
              </>
            ) : (
              <>
                <ClockIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No tasks found</h3>
                <p className="text-gray-600">Try adjusting your filters or search query</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 