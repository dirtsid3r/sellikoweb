'use client'

import React, { useState } from 'react'
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
  BoltIcon
} from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid'

interface Task {
  id: string
  device: string
  seller: {
    name: string
    phone: string
    avatar?: string
  }
  location: string
  priority: 'high' | 'medium' | 'low'
  status: 'scheduled' | 'pending_pickup' | 'in_progress' | 'completed' | 'cancelled'
  timeSlot: string
  assignedAt: string
  estimatedValue: number
  images: string[]
  notes?: string
  completedAt?: string
  rating?: number
  earnings?: number
}

const mockTasks: Task[] = [
  {
    id: 'VER001',
    device: 'iPhone 14 Pro Max',
    seller: {
      name: 'Rajesh Kumar',
      phone: '+91 98765 43210'
    },
    location: 'Kakkanad, Kochi',
    priority: 'high',
    status: 'pending_pickup',
    timeSlot: '2:30 PM - 3:30 PM',
    assignedAt: '10:30 AM',
    estimatedValue: 85000,
    images: ['/api/placeholder/100/100'],
    notes: 'Urgent sale needed, prefer cash payment'
  },
  {
    id: 'VER002',
    device: 'Samsung Galaxy S23 Ultra',
    seller: {
      name: 'Priya Nair',
      phone: '+91 87654 32109'
    },
    location: 'Palarivattom, Kochi',
    priority: 'medium',
    status: 'in_progress',
    timeSlot: '4:00 PM - 5:00 PM',
    assignedAt: '11:45 AM',
    estimatedValue: 65000,
    images: ['/api/placeholder/100/100']
  },
  {
    id: 'VER003',
    device: 'OnePlus 11 5G',
    seller: {
      name: 'Arjun Menon',
      phone: '+91 76543 21098'
    },
    location: 'Edappally, Kochi',
    priority: 'low',
    status: 'scheduled',
    timeSlot: '6:00 PM - 7:00 PM',
    assignedAt: '12:20 PM',
    estimatedValue: 42000,
    images: ['/api/placeholder/100/100']
  },
  {
    id: 'VER004',
    device: 'iPhone 13',
    seller: {
      name: 'Maya Thomas',
      phone: '+91 65432 10987'
    },
    location: 'Thrippunithura, Kochi',
    priority: 'medium',
    status: 'completed',
    timeSlot: '1:00 PM - 2:00 PM',
    assignedAt: '9:30 AM',
    estimatedValue: 55000,
    images: ['/api/placeholder/100/100'],
    completedAt: '2:30 PM',
    rating: 5,
    earnings: 350
  },
  {
    id: 'VER005',
    device: 'Google Pixel 7 Pro',
    seller: {
      name: 'Kiran Jose',
      phone: '+91 54321 09876'
    },
    location: 'Marine Drive, Kochi',
    priority: 'high',
    status: 'completed',
    timeSlot: '11:00 AM - 12:00 PM',
    assignedAt: '8:15 AM',
    estimatedValue: 48000,
    images: ['/api/placeholder/100/100'],
    completedAt: '1:15 PM',
    rating: 5,
    earnings: 250
  }
]

const statusFilters = [
  { key: 'all', label: 'All Tasks', count: mockTasks.length },
  { key: 'pending_pickup', label: 'Ready for Pickup', count: mockTasks.filter(t => t.status === 'pending_pickup').length },
  { key: 'in_progress', label: 'In Progress', count: mockTasks.filter(t => t.status === 'in_progress').length },
  { key: 'scheduled', label: 'Scheduled', count: mockTasks.filter(t => t.status === 'scheduled').length },
  { key: 'completed', label: 'Completed', count: mockTasks.filter(t => t.status === 'completed').length }
]

const priorityColors = {
  high: 'bg-red-100 text-red-800 border-red-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  low: 'bg-green-100 text-green-800 border-green-200'
}

const statusColors = {
  scheduled: 'text-gray-600',
  pending_pickup: 'text-orange-600',
  in_progress: 'text-blue-600',
  completed: 'text-green-600',
  cancelled: 'text-red-600'
}

const statusLabels = {
  scheduled: 'Scheduled',
  pending_pickup: 'Ready for Pickup',
  in_progress: 'Verification Started',
  completed: 'Completed',
  cancelled: 'Cancelled'
}

export default function AgentTasks() {
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('priority') // priority, time, value

  const filteredTasks = mockTasks
    .filter(task => {
      if (activeFilter === 'all') return true
      return task.status === activeFilter
    })
    .filter(task => {
      if (!searchQuery) return true
      return task.device.toLowerCase().includes(searchQuery.toLowerCase()) ||
             task.seller.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             task.location.toLowerCase().includes(searchQuery.toLowerCase())
    })
    .sort((a, b) => {
      if (sortBy === 'priority') {
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      }
      if (sortBy === 'value') {
        return b.estimatedValue - a.estimatedValue
      }
      return 0 // Default order
    })

  const todayStats = {
    completed: mockTasks.filter(t => t.status === 'completed').length,
    pending: mockTasks.filter(t => ['pending_pickup', 'in_progress', 'scheduled'].includes(t.status)).length,
    earnings: mockTasks.filter(t => t.status === 'completed').reduce((sum, t) => sum + (t.earnings || 0), 0)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Task Management</h1>
            <p className="text-gray-600 mt-1">Manage your verification assignments and track progress</p>
          </div>
          <Link
            href="/agent/verification"
            className="btn-primary px-6 py-3 rounded-xl inline-flex items-center"
          >
            <BoltIcon className="w-5 h-5 mr-2" />
            Start Verification
          </Link>
        </div>

        {/* Today's Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card-mobile bg-white/80 backdrop-blur-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Today</p>
                <p className="text-3xl font-bold text-green-600">{todayStats.completed}</p>
              </div>
              <CheckCircleSolid className="w-12 h-12 text-green-600" />
            </div>
          </div>
          
          <div className="card-mobile bg-white/80 backdrop-blur-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Tasks</p>
                <p className="text-3xl font-bold text-orange-600">{todayStats.pending}</p>
              </div>
              <ClockIcon className="w-12 h-12 text-orange-600" />
            </div>
          </div>
          
          <div className="card-mobile bg-white/80 backdrop-blur-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Earnings</p>
                <p className="text-3xl font-bold text-purple-600">₹{todayStats.earnings}</p>
              </div>
              <BoltIcon className="w-12 h-12 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
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
                <option value="value">Sort by Value</option>
                <option value="time">Sort by Time</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tasks List */}
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <div key={task.id} className="card-mobile bg-white/80 backdrop-blur-sm p-6 hover:card-elevated transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  {/* Device Image */}
                  <img 
                    src={task.images[0]} 
                    alt={task.device}
                    className="w-20 h-20 rounded-xl object-cover"
                  />
                  
                  {/* Task Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{task.device}</h3>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${priorityColors[task.priority]}`}>
                        {task.priority.toUpperCase()}
                      </span>
                      <span className={`text-sm font-medium ${statusColors[task.status]}`}>
                        {statusLabels[task.status]}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <span className="font-medium text-gray-900 mr-2">Seller:</span>
                        {task.seller.name}
                      </div>
                      <div className="flex items-center">
                        <PhoneIcon className="w-4 h-4 mr-1" />
                        {task.seller.phone}
                      </div>
                      <div className="flex items-center">
                        <MapPinIcon className="w-4 h-4 mr-1" />
                        {task.location}
                      </div>
                      <div className="flex items-center">
                        <CalendarIcon className="w-4 h-4 mr-1" />
                        {task.timeSlot}
                      </div>
                    </div>

                    {task.notes && (
                      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          <strong>Note:</strong> {task.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Section */}
                <div className="text-right ml-4">
                  <div className="mb-2">
                    <p className="text-sm text-gray-500">Estimated Value</p>
                    <p className="text-2xl font-bold text-purple-600">₹{task.estimatedValue.toLocaleString()}</p>
                  </div>
                  
                  {task.status === 'completed' ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-end">
                        {[...Array(task.rating || 0)].map((_, i) => (
                          <StarIcon key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                        ))}
                      </div>
                      <p className="text-sm text-green-600 font-semibold">
                        Earned: ₹{task.earnings}
                      </p>
                      <p className="text-xs text-gray-500">
                        Completed: {task.completedAt}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500">
                        Assigned: {task.assignedAt}
                      </p>
                      <p className="text-xs text-gray-500">
                        ID: {task.id}
                      </p>
                      <Link
                        href={`/agent/verification/${task.id}`}
                        className="block w-full px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors text-center"
                      >
                        {task.status === 'in_progress' ? 'Continue' : 'Start'} Verification
                        <ArrowRightIcon className="w-4 h-4 inline ml-2" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <ClockIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No tasks found</h3>
            <p className="text-gray-600">Try adjusting your filters or search query</p>
          </div>
        )}
      </div>
    </div>
  )
} 