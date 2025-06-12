'use client'

import React from 'react'
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
  PlayIcon
} from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid'

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

const recentCompletions = [
  {
    id: 'VER004',
    device: 'iPhone 13',
    seller: 'Maya Thomas',
    completedAt: '2:30 PM',
    verificationScore: 98,
    finalPrice: 45000,
    deductions: 2000
  },
  {
    id: 'VER005', 
    device: 'Google Pixel 7',
    seller: 'Kiran Jose',
    completedAt: '1:15 PM',
    verificationScore: 95,
    finalPrice: 28000,
    deductions: 1500
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
    case 'pending_pickup': return 'text-orange-600'
    case 'in_progress': return 'text-blue-600'
    case 'scheduled': return 'text-gray-600'
    default: return 'text-gray-600'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'pending_pickup': return 'Ready for Pickup'
    case 'in_progress': return 'Verification Started'
    case 'scheduled': return 'Scheduled'
    default: return status
  }
}

export default function AgentDashboard() {
  const { instanceId } = useInstanceId()

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
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                  {pendingVerifications.length} Active
                </span>
              </div>

              <div className="space-y-4">
                {pendingVerifications.map((verification) => (
                  <div key={verification.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <img 
                          src={verification.images[0]} 
                          alt={verification.device}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold text-gray-900">{verification.device}</h3>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(verification.priority)}`}>
                              {verification.priority.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">Seller: {verification.seller}</p>
                          <div className="flex items-center text-sm text-gray-500">
                            <MapPinIcon className="w-4 h-4 mr-1" />
                            {verification.location}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-medium ${getStatusColor(verification.status)}`}>
                          {getStatusText(verification.status)}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          <ClockIcon className="w-4 h-4 inline mr-1" />
                          {verification.timeLeft} left
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Assigned: {verification.assignedAt}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                      <span className="text-sm text-gray-600">ID: {verification.id}</span>
                      <Link
                        href={`/agent/verification/${verification.id}`}
                        className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Start Verification
                        <ArrowRightIcon className="w-4 h-4 ml-2" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 text-center">
                <Link
                  href="/agent/tasks"
                  className="text-purple-600 hover:text-purple-700 font-medium"
                >
                  View All Tasks →
                </Link>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Completions */}
            <div className="card-mobile bg-white/80 backdrop-blur-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Completions</h2>
              <div className="space-y-4">
                {recentCompletions.map((completion) => (
                  <div key={completion.id} className="border-l-4 border-green-500 pl-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{completion.device}</h3>
                      <span className="text-sm text-blue-600 font-semibold">Score: {completion.verificationScore}%</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">Seller: {completion.seller}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">{completion.completedAt}</span>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">Final: ₹{completion.finalPrice.toLocaleString()}</div>
                        {completion.deductions > 0 && (
                          <div className="text-xs text-red-500">-₹{completion.deductions.toLocaleString()}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
                  href="/agent/profile"
                  className="block w-full px-4 py-3 bg-gray-100 text-gray-700 text-center rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  <UserGroupIcon className="w-5 h-5 inline mr-2" />
                  View Profile
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
    </div>
  )
} 