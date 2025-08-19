'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { LogEntry, LogFilter, LogViewerProps, ParsedLogEntry } from '@/types/log'
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  Info,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock,
  User,
  Package
} from 'lucide-react'

// Parse user_list and listing_list JSON strings
const parseJsonArray = (jsonString: string): string[] => {
  try {
    if (!jsonString || jsonString.trim() === '') return []
    return JSON.parse(jsonString)
  } catch {
    return []
  }
}

// Format timestamp for display
const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp)
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short'
  })
}

// Calculate relative time
const getRelativeTime = (timestamp: string): string => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  return `${seconds} second${seconds > 1 ? 's' : ''} ago`
}

// Get icon for log type
const getLogIcon = (type: LogEntry['type']) => {
  switch (type) {
    case 'info':
      return <Info className="w-4 h-4" />
    case 'success':
      return <CheckCircle className="w-4 h-4" />
    case 'error':
      return <XCircle className="w-4 h-4" />
    case 'warning':
      return <AlertCircle className="w-4 h-4" />
    default:
      return <Info className="w-4 h-4" />
  }
}

// Get color classes for log type
const getLogTypeColors = (type: LogEntry['type']) => {
  switch (type) {
    case 'info':
      return {
        badge: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: 'text-blue-600',
        border: 'border-l-blue-500'
      }
    case 'success':
      return {
        badge: 'bg-green-100 text-green-800 border-green-200',
        icon: 'text-green-600',
        border: 'border-l-green-500'
      }
    case 'error':
      return {
        badge: 'bg-red-100 text-red-800 border-red-200',
        icon: 'text-red-600',
        border: 'border-l-red-500'
      }
    case 'warning':
      return {
        badge: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: 'text-yellow-600',
        border: 'border-l-yellow-500'
      }
    default:
      return {
        badge: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: 'text-gray-600',
        border: 'border-l-gray-500'
      }
  }
}

// Log Entry Component
const LogEntryRow = ({ log }: { log: ParsedLogEntry }) => {
  const colors = getLogTypeColors(log.type)
  
  return (
    <div className={cn(
      "flex items-start gap-3 p-4 border-l-4 bg-white hover:bg-gray-50 transition-colors",
      colors.border
    )}>
      {/* Icon */}
      <div className={cn("mt-0.5", colors.icon)}>
        {getLogIcon(log.type)}
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="outline" className={cn("text-xs", colors.badge)}>
            {log.type.toUpperCase()}
          </Badge>
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {log.relativeTime}
          </span>
        </div>
        
        <p className="text-sm text-gray-900 mb-2 break-words">
          {log.message}
        </p>
        
        <div className="flex flex-wrap gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {log.formattedTimestamp}
          </span>
          
          {log.userIds.length > 0 && (
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              Users: {log.userIds.slice(0, 2).join(', ')}
              {log.userIds.length > 2 && ` +${log.userIds.length - 2} more`}
            </span>
          )}
          
          {log.listingIds.length > 0 && (
            <span className="flex items-center gap-1">
              <Package className="w-3 h-3" />
              Listings: {log.listingIds.slice(0, 2).join(', ')}
              {log.listingIds.length > 2 && ` +${log.listingIds.length - 2} more`}
            </span>
          )}
          
          {log.blame && (
            <span>
              Blame: {log.blame.substring(0, 8)}...
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// Main LogViewer Component
export const LogViewer = ({
  logs,
  title = "System Logs",
  showFilters = true,
  showSearch = true,
  showPagination = true,
  pageSize = 20,
  className
}: LogViewerProps) => {
  const [filter, setFilter] = useState<LogFilter>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')

  // Parse and process logs
  const parsedLogs = useMemo<ParsedLogEntry[]>(() => {
    return logs.map(log => ({
      ...log,
      formattedTimestamp: formatTimestamp(log.timestamp),
      relativeTime: getRelativeTime(log.timestamp),
      userIds: parseJsonArray(log.user_list.toString()),
      listingIds: parseJsonArray(log.listing_list.toString())
    }))
  }, [logs])

  // Filter logs
  const filteredLogs = useMemo(() => {
    return parsedLogs.filter(log => {
      // Type filter
      if (filter.type && log.type !== filter.type) return false
      
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        if (!log.message.toLowerCase().includes(searchLower) &&
            !log.blame.toLowerCase().includes(searchLower) &&
            !log.userIds.some(id => id.toLowerCase().includes(searchLower)) &&
            !log.listingIds.some(id => id.toLowerCase().includes(searchLower))) {
          return false
        }
      }
      
      // User filter
      if (filter.userId && !log.userIds.includes(filter.userId)) return false
      
      // Listing filter
      if (filter.listingId && !log.listingIds.includes(filter.listingId)) return false
      
      return true
    })
  }, [parsedLogs, filter, searchTerm])

  // Paginate logs
  const totalPages = Math.ceil(filteredLogs.length / pageSize)
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredLogs.slice(start, start + pageSize)
  }, [filteredLogs, currentPage, pageSize])

  // Reset page when filters change
  useMemo(() => {
    setCurrentPage(1)
  }, [filter, searchTerm])

  const typeOptions: LogEntry['type'][] = ['info', 'success', 'error', 'warning']

  return (
    <div className={cn("space-y-4", className)}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              {title}
            </CardTitle>
            <Badge variant="outline">
              {filteredLogs.length} {filteredLogs.length === 1 ? 'entry' : 'entries'}
            </Badge>
          </div>
          
          {/* Filters and Search */}
          {(showFilters || showSearch) && (
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              {showSearch && (
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}
              
              {showFilters && (
                <div className="flex gap-2">
                  <select
                    value={filter.type || ''}
                    onChange={(e) => setFilter(prev => ({ ...prev, type: e.target.value as LogEntry['type'] || undefined }))}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Types</option>
                    {typeOptions.map(type => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                  
                  {(filter.type || filter.userId || filter.listingId || searchTerm) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFilter({})
                        setSearchTerm('')
                      }}
                    >
                      Clear
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </CardHeader>
        
        <CardContent className="p-0">
          {paginatedLogs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No logs found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {paginatedLogs.map((log) => (
                <LogEntryRow key={log.id} log={log} />
              ))}
            </div>
          )}
        </CardContent>
        
        {/* Pagination */}
        {showPagination && totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredLogs.length)} of {filteredLogs.length} entries
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                
                <span className="text-sm text-gray-500">
                  Page {currentPage} of {totalPages}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

export default LogViewer
