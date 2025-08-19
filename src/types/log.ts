export interface LogEntry {
  id: number
  timestamp: string
  type: 'info' | 'success' | 'error' | 'warning'
  message: string
  user_list: string[]
  listing_list: string[]
  blame: string
}

export interface LogFilter {
  type?: LogEntry['type']
  search?: string
  dateFrom?: string
  dateTo?: string
  userId?: string
  listingId?: string
}

export interface LogViewerProps {
  logs: LogEntry[]
  title?: string
  showFilters?: boolean
  showSearch?: boolean
  showPagination?: boolean
  pageSize?: number
  className?: string
}

export interface ParsedLogEntry extends LogEntry {
  formattedTimestamp: string
  relativeTime: string
  userIds: string[]
  listingIds: string[]
}