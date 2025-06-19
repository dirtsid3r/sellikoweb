'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Icons } from '@/components/ui/icons'

export default function AgentProfile() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
              <Icons.user className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Agent Profile</h1>
              <p className="text-gray-600">View and manage your agent profile</p>
            </div>
          </div>
        </div>

        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <Icons.user className="w-5 h-5 text-purple-600" />
                <span>Profile Information</span>
              </span>
              <Link href="/agent/profile/update">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Icons.edit className="w-4 h-4 mr-2" />
                  Update Profile
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Icons.user className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile Management</h3>
              <p className="text-gray-600 mb-6">
                Click "Update Profile" to manage your agent information, contact details, and working areas.
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <p>• Update your personal information</p>
                <p>• Manage contact details</p>
                <p>• Set your working pincodes</p>
                <p>• Update address information</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 