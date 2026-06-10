
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Icons } from '@/components/ui/icons'
import sellikoClient from '@/selliko-client'
import { toast } from 'react-hot-toast'

interface Activity {
  id: string
  message: string
  timestamp: string
  icon: string
}

interface RecentActivityProps {
  user_id?: string
  listing_id?: string
  limit?: number
}

const dummyActivity: Activity[] = [
  {
    id: '1',
    message: 'New listing: iPhone 14 Pro - ₹55,000',
    timestamp: '2 mins ago',
    icon: 'smartphone'
  },
  {
    id: '2',
    message: 'Your bid accepted: Samsung S21 - ₹35,000',
    timestamp: '1 hour ago',
    icon: 'check'
  },
  {
    id: '3',
    message: 'Device delivered: OnePlus 9 - Order complete',
    timestamp: '3 hours ago',
    icon: 'package'
  },
  {
    id: '4',
    message: 'You were outbid on: Google Pixel 7',
    timestamp: '5 hours ago',
    icon: 'x'
  }
]

const ActivityIcon = ({ icon }: { icon: string }) => {
  switch (icon) {
    case 'smartphone':
      return <Icons.smartphone className="w-4 h-4 text-blue-600" />
    case 'check':
      return <Icons.check className="w-4 h-4 text-green-600" />
    case 'package':
      return <Icons.package className="w-4 h-4 text-purple-600" />
    case 'x':
      return <Icons.x className="w-4 h-4 text-red-600" />
    case 'trendingUp':
        return <Icons.trendingUp className="w-4 h-4 text-green-600" />
    default:
      return <Icons.bell className="w-4 h-4 text-gray-600" />
  }
}

const transformEventToActivity = (event: any): Activity | null => {
    const { id, created_at, title, message, type } = event;
  
    const timeAgo = (dateString: string) => {
      const date = new Date(dateString);
      const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
      let interval = seconds / 31536000;
      if (interval > 1) {
        return Math.floor(interval) + " years ago";
      }
      interval = seconds / 2592000;
      if (interval > 1) {
        return Math.floor(interval) + " months ago";
      }
      interval = seconds / 86400;
      if (interval > 1) {
        return Math.floor(interval) + " days ago";
      }
      interval = seconds / 3600;
      if (interval > 1) {
        return Math.floor(interval) + " hours ago";
      }
      interval = seconds / 60;
      if (interval > 1) {
        return Math.floor(interval) + " minutes ago";
      }
      return Math.floor(seconds) + " seconds ago";
    };
  
    const timestamp = timeAgo(created_at);
    let icon = 'bell'; // Default icon

    // Determine icon based on the incoming 'type' or 'title'
    if (type === 'success') {
        icon = 'check';
    } else if (type === 'info') {
        if (title && title.includes('New Listing')) {
            icon = 'smartphone';
        } else {
            icon = 'bell'; // General info
        }
    }

    // Override if title is more specific
    if (title && title.includes('User Registered')) {
        icon = 'check';
    } else if (title && title.includes('New Listing')) {
        icon = 'smartphone';
    }
  
    return {
      id: String(id),
      message: message || title || 'No message', // Use message, fallback to title, then generic
      timestamp,
      icon,
    };
  };

export function RecentActivity({ user_id, listing_id, limit = 25 }: RecentActivityProps) {
  const [activity, setActivity] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchActivity = async () => {
      console.log('🔄 [ACTIVITY] Fetching recent activity...')
      setIsLoading(true)
      setError(null)
      try {
        // NOTE: Assuming an endpoint `getEvents` exists on the sellikoClient.
        // If this does not exist, the component will fall back to dummy data.
        const response = await (sellikoClient as any).getEvents({ user_id, listing_id, limit })
        
        if (response.success && response.events && response.events.length > 0) {
          console.log('✅ [ACTIVITY] Fetched events:', response.events)
          const sorted = [...response.events].sort((a: any, b: any) => {
            return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
          })
          const transformed = sorted.map(transformEventToActivity).filter((a: Activity | null): a is Activity => a !== null);
          setActivity(transformed)
        } else {
          console.log('⚠️ [ACTIVITY] No activity data returned, using dummy data.')
          setActivity(dummyActivity)
        }
      } catch (err) {
        console.error('💥 [ACTIVITY] Failed to fetch activity, using dummy data.', err)
        setError('Could not load activity.')
        setActivity(dummyActivity) // Fallback to dummy data on error
      } finally {
        setIsLoading(false)
      }
    }

    fetchActivity()
  }, [user_id, listing_id, limit])

  const renderSkeleton = () => (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 animate-pulse">
          <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
      <Card>
        <CardContent className="p-6">
          {isLoading ? (
            renderSkeleton()
          ) : (
            <div className="space-y-4">
              {activity.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <ActivityIcon icon={item.icon} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{item.message}</p>
                    <p className="text-xs text-gray-500">{item.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
