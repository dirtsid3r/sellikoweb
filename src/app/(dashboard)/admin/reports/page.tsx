'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { Icons } from '@/components/ui/icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronDownIcon, CalendarIcon } from '@heroicons/react/24/outline'
import sellikoClient from '@/selliko-client'
import { toast } from 'react-hot-toast'
import Header from '@/components/layout/header'

// Types for report data
interface ReportColumn {
  key: string
  label: string
  type: 'text' | 'number' | 'boolean' | 'image' | 'date' | 'currency'
  sortable?: boolean
}

interface ReportData {
  [key: string]: any
}

interface ReportFilters {
  searchQuery: string
  startDate: string
  endDate: string
  status: string
  category: string
  role: string
  listings: string
  [key: string]: any
}

// Searchable Dropdown Component
function SearchableDropdown({ 
  options, 
  value, 
  onChange, 
  placeholder, 
  disabled = false,
  required = false,
  className = ""
}: {
  options: string[]
  value: string
  onChange: (value: string) => void
  placeholder: string
  disabled?: boolean
  required?: boolean
  className?: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  )

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (option: string) => {
    onChange(option)
    setIsOpen(false)
    setSearchTerm('')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    if (!isOpen) setIsOpen(true)
  }

  const displayValue = value || searchTerm

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative">
        <input
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
          autoComplete="off"
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
          className="absolute inset-y-0 right-0 flex items-center px-2"
        >
          <ChevronDownIcon className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSelect(option)}
                className={`w-full px-3 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none ${
                  option === value ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                }`}
              >
                {option}
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-gray-500 text-sm">
              No options found
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Date Input Component
function DateInput({
  value,
  onChange,
  placeholder,
  disabled = false,
  className = ""
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
  disabled?: boolean
  className?: string
}) {
  return (
    <div className={`relative ${className}`}>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
      />
      <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
    </div>
  )
}

// Tabular View Component
function TabularView({ 
  columns, 
  data, 
  loading, 
  onSort,
  onExportCSV
}: {
  columns: ReportColumn[]
  data: ReportData[]
  loading: boolean
  onSort?: (column: string, direction: 'asc' | 'desc') => void
  onExportCSV?: () => void
}) {
  const [sortColumn, setSortColumn] = useState<string>('')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const handleSort = (column: ReportColumn) => {
    if (!column.sortable) return

    const newDirection = sortColumn === column.key && sortDirection === 'asc' ? 'desc' : 'asc'
    setSortColumn(column.key)
    setSortDirection(newDirection)
    onSort?.(column.key, newDirection)
  }

  const renderCellValue = (value: any, type: ReportColumn['type']) => {
    switch (type) {
      case 'boolean':
        return (
          <Badge className={value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
            {value ? 'Yes' : 'No'}
          </Badge>
        )
      case 'currency':
        return `₹${Number(value || 0).toLocaleString('en-IN')}`
      case 'date':
        return value ? new Date(value).toLocaleDateString('en-IN') : '-'
      case 'image':
        return value ? (
          <img 
            src={value} 
            alt="Preview" 
            className="w-12 h-12 object-cover rounded-lg border"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/placeholder.png'
            }}
          />
        ) : (
          <div className="w-12 h-12 bg-gray-100 rounded-lg border flex items-center justify-center">
            <Icons.image className="w-4 h-4 text-gray-400" />
          </div>
        )
      case 'number':
        return Number(value || 0).toLocaleString('en-IN')
      default:
        return value || '-'
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <Icons.spinner className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600">Loading report data...</span>
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Icons.fileText className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Found</h3>
        <p className="text-gray-600">No records match your current filters. Try adjusting your search criteria.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map((column) => (
                <th 
                  key={column.key}
                  className={`px-6 py-4 text-left text-sm font-medium text-gray-900 ${
                    column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                  }`}
                  onClick={() => handleSort(column)}
                >
                  <div className="flex items-center space-x-2">
                    <span>{column.label}</span>
                    {column.sortable && (
                      <div className="flex flex-col">
                        <Icons.chevronUp 
                          className={`w-3 h-3 ${
                            sortColumn === column.key && sortDirection === 'asc' 
                              ? 'text-blue-600' 
                              : 'text-gray-400'
                          }`} 
                        />
                        <Icons.chevronDown 
                          className={`w-3 h-3 -mt-1 ${
                            sortColumn === column.key && sortDirection === 'desc' 
                              ? 'text-blue-600' 
                              : 'text-gray-400'
                          }`} 
                        />
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50">
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 text-sm text-gray-900">
                    {renderCellValue(row[column.key], column.type)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Table Footer with Row Count */}
      <div className="bg-gray-50 border-t border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {data.length} {data.length === 1 ? 'record' : 'records'}
          </p>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onExportCSV}
              disabled={data.length === 0}
            >
              <Icons.download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Advanced Search Component
function AdvancedSearch({
  filters,
  onFiltersChange,
  onSearch,
  loading,
  reportType
}: {
  filters: ReportFilters
  onFiltersChange: (filters: ReportFilters) => void
  onSearch: () => void
  loading: boolean
  reportType: string
}) {
  const handleFilterChange = (key: string, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  // Get filter options based on report type
  const getStatusOptions = () => {
    switch (reportType) {
      case 'users':
        return ['All', 'active', 'inactive']
      case 'listings':
        return ['All', 'Active', 'Sold', 'Expired', 'Draft', 'Under Review']
      case 'vendors':
        return ['All', 'Active', 'Inactive', 'Pending Approval']
      case 'agents':
        return ['All', 'Active', 'Inactive', 'On Leave']
      case 'bids':
        return ['All', 'Pending', 'Accepted', 'Rejected', 'Expired']
      case 'pickups':
        return ['All', 'Scheduled', 'In Progress', 'Completed', 'Cancelled']
      default:
        return ['All']
    }
  }

  const getCategoryOptions = () => {
    switch (reportType) {
      case 'listings':
        return ['All', 'Smartphones', 'Laptops', 'Tablets', 'Accessories']
      case 'users':
        return ['All', 'anon', 'client', 'vendor', 'agent', 'admin']
      case 'bids':
        return ['All', 'Direct Purchase', 'Auction Bid', 'Counter Offer']
      default:
        return ['All']
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Icons.search className="w-5 h-5 text-blue-600" />
          <span>Advanced Search & Filters</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Search Query */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Query
            </label>
            <Input
              type="text"
              placeholder={`Search ${reportType}...`}
              value={filters.searchQuery}
              onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
            />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <DateInput
                value={filters.startDate}
                onChange={(value) => handleFilterChange('startDate', value)}
                placeholder="Select start date"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <DateInput
                value={filters.endDate}
                onChange={(value) => handleFilterChange('endDate', value)}
                placeholder="Select end date"
              />
            </div>
          </div>

          {/* Status and Category Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <SearchableDropdown
                options={getStatusOptions()}
                value={filters.status}
                onChange={(value) => handleFilterChange('status', value)}
                placeholder="Select status"
              />
            </div>
            {getCategoryOptions().length > 1 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {reportType === 'users' ? 'Role' : 'Category'}
                </label>
                <SearchableDropdown
                  options={getCategoryOptions()}
                  value={filters.category}
                  onChange={(value) => handleFilterChange('category', value)}
                  placeholder={`Select ${reportType === 'users' ? 'role' : 'category'}`}
                />
              </div>
            )}
          </div>

          {/* Users-specific filters */}
          {reportType === 'users' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Listings
              </label>
              <Input
                type="number"
                placeholder="Minimum number of listings (optional)"
                value={filters.listings}
                onChange={(e) => handleFilterChange('listings', e.target.value)}
                min="0"
              />
            </div>
          )}

          {/* Search Actions */}
          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <Button
              onClick={onSearch}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <Icons.spinner className="w-4 h-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Icons.search className="w-4 h-4 mr-2" />
                  Search
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                onFiltersChange({
                  searchQuery: '',
                  startDate: '',
                  endDate: '',
                  status: 'All',
                  category: 'All',
                  role: 'All',
                  listings: ''
                })
              }}
              disabled={loading}
            >
              <Icons.refresh className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Reports menu items configuration
const reportsMenuItems = [
  {
    id: 'users',
    label: 'Users Report',
    icon: Icons.users,
    description: 'User accounts, roles, and activity reports'
  },
  {
    id: 'listings',
    label: 'Listings Report',
    icon: Icons.smartphone,
    description: 'Device listings, status, and performance'
  },
  {
    id: 'vendors',
    label: 'Vendors Report',
    icon: Icons.package,
    description: 'Vendor profiles, performance, and metrics'
  },
  {
    id: 'agents',
    label: 'Agents Report',
    icon: Icons.user,
    description: 'Agent activities, assignments, and performance'
  },
  {
    id: 'bids',
    label: 'Bids Report',
    icon: Icons.download,
    description: 'Bidding activities and transaction reports'
  },
  {
    id: 'pickups',
    label: 'Pickups Report',
    icon: Icons.truck,
    description: 'Pickup schedules, status, and logistics'
  }
]

// Sidebar Menu Component
function ReportsSidebar({ 
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
            <Icons.fileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Reports</h2>
            <p className="text-sm text-gray-500">Analytics and data reports</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="p-4">
        <nav className="space-y-2">
          {reportsMenuItems.map((item) => {
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

// Main Content Component
function ReportsContent({ 
  activeSection 
}: { 
  activeSection: string
}) {
  const [filters, setFilters] = useState<ReportFilters>({
    searchQuery: '',
    startDate: '',
    endDate: '',
    status: 'All',
    category: 'All',
    role: 'All',
    listings: ''
  })
  const [reportData, setReportData] = useState<ReportData[]>([])
  const [loading, setLoading] = useState(false)
  const [columns, setColumns] = useState<ReportColumn[]>([])
  const [lastUsedFilters, setLastUsedFilters] = useState<ReportFilters | null>(null)

  const activeMenuItem = reportsMenuItems.find(item => item.id === activeSection)
  const IconComponent = activeMenuItem?.icon || Icons.fileText

  // Define columns for each report type
  const getColumnsForReportType = (reportType: string): ReportColumn[] => {
    switch (reportType) {
      case 'users':
        return [
          { key: 'id', label: 'ID', type: 'text', sortable: true },
          { key: 'email', label: 'Email', type: 'text', sortable: true },
          { key: 'name', label: 'Name', type: 'text', sortable: true },
          { key: 'phone_number', label: 'Phone', type: 'text', sortable: true },
          { key: 'mobile_phone', label: 'Mobile', type: 'text', sortable: true },
          { key: 'role', label: 'Role', type: 'text', sortable: true },
          { key: 'created_at', label: 'Created', type: 'date', sortable: true },
          { key: 'last_sign_in', label: 'Last Sign In', type: 'date', sortable: true },
          { key: 'profile_updated_at', label: 'Profile Updated', type: 'date', sortable: true }
        ]
      case 'listings':
        return [
          { key: 'id', label: 'ID', type: 'text', sortable: true },
          { key: 'image', label: 'Image', type: 'image' },
          { key: 'title', label: 'Title', type: 'text', sortable: true },
          { key: 'brand', label: 'Brand', type: 'text', sortable: true },
          { key: 'model', label: 'Model', type: 'text', sortable: true },
          { key: 'price', label: 'Price', type: 'currency', sortable: true },
          { key: 'status', label: 'Status', type: 'text', sortable: true },
          { key: 'created_at', label: 'Created', type: 'date', sortable: true }
        ]
      case 'vendors':
        return [
          { key: 'vendor_id', label: 'Vendor ID', type: 'text', sortable: true },
          { key: 'name', label: 'Name', type: 'text', sortable: true },
          { key: 'email', label: 'Email', type: 'text', sortable: true },
          { key: 'phone', label: 'Phone', type: 'text', sortable: true },
          { key: 'city', label: 'City', type: 'text', sortable: true },
          { key: 'base_price', label: 'Base Price', type: 'currency', sortable: true },
          { key: 'working_pincodes', label: 'Pincodes', type: 'text' },
          { key: 'created_at', label: 'Joined', type: 'date', sortable: true }
        ]
      case 'agents':
        return [
          { key: 'agent_id', label: 'Agent ID', type: 'text', sortable: true },
          { key: 'agent_code', label: 'Code', type: 'text', sortable: true },
          { key: 'name', label: 'Name', type: 'text', sortable: true },
          { key: 'email', label: 'Email', type: 'text', sortable: true },
          { key: 'phone', label: 'Phone', type: 'text', sortable: true },
          { key: 'city', label: 'City', type: 'text', sortable: true },
          { key: 'working_pincodes', label: 'Pincodes', type: 'text' },
          { key: 'created_at', label: 'Joined', type: 'date', sortable: true }
        ]
      case 'bids':
        return [
          { key: 'id', label: 'Bid ID', type: 'text', sortable: true },
          { key: 'listing_title', label: 'Listing', type: 'text', sortable: true },
          { key: 'bidder_name', label: 'Bidder', type: 'text', sortable: true },
          { key: 'amount', label: 'Amount', type: 'currency', sortable: true },
          { key: 'status', label: 'Status', type: 'text', sortable: true },
          { key: 'auto_bid', label: 'Auto Bid', type: 'boolean', sortable: true },
          { key: 'created_at', label: 'Placed', type: 'date', sortable: true }
        ]
      case 'pickups':
        return [
          { key: 'id', label: 'Pickup ID', type: 'text', sortable: true },
          { key: 'listing_title', label: 'Listing', type: 'text', sortable: true },
          { key: 'agent_name', label: 'Agent', type: 'text', sortable: true },
          { key: 'client_name', label: 'Client', type: 'text', sortable: true },
          { key: 'scheduled_date', label: 'Scheduled', type: 'date', sortable: true },
          { key: 'status', label: 'Status', type: 'text', sortable: true },
          { key: 'address', label: 'Address', type: 'text' },
          { key: 'created_at', label: 'Created', type: 'date', sortable: true }
        ]
      default:
        return []
    }
  }

  // Initialize columns when report type changes
  useEffect(() => {
    setColumns(getColumnsForReportType(activeSection))
    setReportData([])
    setFilters({
      searchQuery: '',
      startDate: '',
      endDate: '',
      status: 'All',
      category: 'All',
      role: 'All',
      listings: ''
    })
  }, [activeSection])

  // Handle search
  const handleSearch = async () => {
    setLoading(true)
    try {
      console.log(`📊 [REPORTS] Searching ${activeSection} with filters:`, filters)
      
      if (activeSection === 'users') {
        await handleUsersReportSearch()
        setLastUsedFilters({ ...filters })
      } else {
        // For other report types, use mock data for now
        await new Promise(resolve => setTimeout(resolve, 1000))
        const mockData = generateMockData(activeSection, 15)
        setReportData(mockData)
        setLastUsedFilters({ ...filters })
        toast.success(`${activeSection} report generated successfully!`)
      }
    } catch (error) {
      console.error(`💥 [REPORTS] Error generating ${activeSection} report:`, error)
      toast.error('Failed to generate report')
    } finally {
      setLoading(false)
    }
  }

  // Handle Users Report API call
  const handleUsersReportSearch = async () => {
    try {
      // Build request body according to API documentation
      const requestBody: any = {
        report_type: 'users',
        limit: 1000 // Default limit
      }

      // Add optional search parameter
      if (filters.searchQuery.trim()) {
        requestBody.search = filters.searchQuery.trim()
      }

      // Add time range if provided
      if (filters.startDate || filters.endDate) {
        requestBody.time_range = {}
        if (filters.startDate) {
          requestBody.time_range.start_date = new Date(filters.startDate).toISOString()
        }
        if (filters.endDate) {
          requestBody.time_range.end_date = new Date(filters.endDate + 'T23:59:59').toISOString()
        }
      }

      // Add filters
      requestBody.filters = {}
      
      if (filters.status && filters.status !== 'All') {
        requestBody.filters.status = filters.status
      }
      
      if (filters.category && filters.category !== 'All') {
        requestBody.filters.role = filters.category
      }
      
      if (filters.listings && filters.listings.trim()) {
        const listingsCount = parseInt(filters.listings.trim())
        if (!isNaN(listingsCount) && listingsCount > 0) {
          requestBody.filters.listings = listingsCount
        }
      }

      console.log('📊 [USERS REPORT] Request body:', requestBody)

      // Make API call to Supabase edge function
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.message || `HTTP ${response.status}: ${response.statusText}`)
      }

      const contentType = response.headers.get('content-type')
      
      if (contentType?.includes('text/csv')) {
        // Handle CSV response
        const csvText = await response.text()
        const parsedData = parseCSVToJSON(csvText)
        setReportData(parsedData)
        toast.success('Users report generated successfully!')
      } else {
        // Handle JSON error response
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to generate report')
      }
    } catch (error) {
      console.error('💥 [USERS REPORT] Error:', error)
      throw error
    }
  }

  // Parse CSV to JSON for display
  const parseCSVToJSON = (csvText: string): ReportData[] => {
    const lines = csvText.trim().split('\n')
    if (lines.length < 2) return []
    
    const headers = lines[0].split(',')
    const data: ReportData[] = []
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (line && !line.startsWith('#')) {
        const values = line.split(',')
        const row: ReportData = {}
        
        headers.forEach((header, index) => {
          row[header.trim()] = values[index]?.trim() || ''
        })
        
        data.push(row)
      }
    }
    
    return data
  }

  // Generate mock data for demonstration
  const generateMockData = (reportType: string, count: number): ReportData[] => {
    const data: ReportData[] = []
    
    for (let i = 1; i <= count; i++) {
      switch (reportType) {
        case 'users':
          data.push({
            id: `USER-${String(i).padStart(3, '0')}`,
            name: `User ${i}`,
            phone: `+91${9000000000 + i}`,
            email: `user${i}@example.com`,
            role: ['client', 'vendor', 'agent'][i % 3],
            is_banned: i % 7 === 0,
            created_at: new Date(2024, 0, i).toISOString()
          })
          break
        case 'listings':
          data.push({
            id: `LIST-${String(i).padStart(3, '0')}`,
            image: '/images/phone.png',
            title: `iPhone 14 Pro Max ${i}`,
            brand: ['Apple', 'Samsung', 'OnePlus'][i % 3],
            model: `Model ${i}`,
            price: 50000 + (i * 1000),
            status: ['active', 'sold', 'expired'][i % 3],
            created_at: new Date(2024, 0, i).toISOString()
          })
          break
        case 'vendors':
          data.push({
            vendor_id: `VEN-${String(i).padStart(3, '0')}`,
            name: `Vendor ${i}`,
            email: `vendor${i}@example.com`,
            phone: `+91${8000000000 + i}`,
            city: ['Mumbai', 'Delhi', 'Bangalore'][i % 3],
            base_price: 5000 + (i * 100),
            working_pincodes: `40000${i}, 40001${i}`,
            created_at: new Date(2024, 0, i).toISOString()
          })
          break
        case 'agents':
          data.push({
            agent_id: `AGT-${String(i).padStart(3, '0')}`,
            agent_code: `AG${String(i).padStart(3, '0')}`,
            name: `Agent ${i}`,
            email: `agent${i}@example.com`,
            phone: `+91${7000000000 + i}`,
            city: ['Mumbai', 'Delhi', 'Bangalore'][i % 3],
            working_pincodes: `40000${i}, 40001${i}`,
            created_at: new Date(2024, 0, i).toISOString()
          })
          break
        case 'bids':
          data.push({
            id: `BID-${String(i).padStart(3, '0')}`,
            listing_title: `iPhone 14 Pro Max ${i}`,
            bidder_name: `Bidder ${i}`,
            amount: 45000 + (i * 500),
            status: ['pending', 'accepted', 'rejected'][i % 3],
            auto_bid: i % 4 === 0,
            created_at: new Date(2024, 0, i).toISOString()
          })
          break
        case 'pickups':
          data.push({
            id: `PCK-${String(i).padStart(3, '0')}`,
            listing_title: `iPhone 14 Pro Max ${i}`,
            agent_name: `Agent ${i}`,
            client_name: `Client ${i}`,
            scheduled_date: new Date(2024, 0, i + 1).toISOString(),
            status: ['scheduled', 'in_progress', 'completed'][i % 3],
            address: `Address ${i}, Mumbai`,
            created_at: new Date(2024, 0, i).toISOString()
          })
          break
      }
    }
    
    return data
  }

  // Handle sorting
  const handleSort = (column: string, direction: 'asc' | 'desc') => {
    const sortedData = [...reportData].sort((a, b) => {
      const aValue = a[column]
      const bValue = b[column]
      
      if (aValue < bValue) return direction === 'asc' ? -1 : 1
      if (aValue > bValue) return direction === 'asc' ? 1 : -1
      return 0
    })
    
    setReportData(sortedData)
  }

  // Handle CSV export
  const handleExportCSV = async () => {
    if (!lastUsedFilters) {
      toast.error('Please search for data first before exporting')
      return
    }

    if (activeSection === 'users') {
      try {
        setLoading(true)
        
        // Build the same request body used for the search
        const requestBody: any = {
          report_type: 'users',
          limit: 10000 // Use higher limit for export
        }

        if (lastUsedFilters.searchQuery.trim()) {
          requestBody.search = lastUsedFilters.searchQuery.trim()
        }

        if (lastUsedFilters.startDate || lastUsedFilters.endDate) {
          requestBody.time_range = {}
          if (lastUsedFilters.startDate) {
            requestBody.time_range.start_date = new Date(lastUsedFilters.startDate).toISOString()
          }
          if (lastUsedFilters.endDate) {
            requestBody.time_range.end_date = new Date(lastUsedFilters.endDate + 'T23:59:59').toISOString()
          }
        }

        requestBody.filters = {}
        
        if (lastUsedFilters.status && lastUsedFilters.status !== 'All') {
          requestBody.filters.status = lastUsedFilters.status
        }
        
        if (lastUsedFilters.category && lastUsedFilters.category !== 'All') {
          requestBody.filters.role = lastUsedFilters.category
        }
        
        if (lastUsedFilters.listings && lastUsedFilters.listings.trim()) {
          const listingsCount = parseInt(lastUsedFilters.listings.trim())
          if (!isNaN(listingsCount) && listingsCount > 0) {
            requestBody.filters.listings = listingsCount
          }
        }

        const response = await fetch('/api/reports', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        })

        if (!response.ok) {
          throw new Error('Failed to export CSV')
        }

        // Get the CSV content
        const csvContent = await response.text()
        
        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        
        // Get filename from response headers or use default
        const contentDisposition = response.headers.get('content-disposition')
        let filename = 'users_report.csv'
        if (contentDisposition) {
          const matches = contentDisposition.match(/filename="(.+)"/)
          if (matches) {
            filename = matches[1]
          }
        }
        
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        
        toast.success('CSV exported successfully!')
      } catch (error) {
        console.error('💥 [CSV EXPORT] Error:', error)
        toast.error('Failed to export CSV')
      } finally {
        setLoading(false)
      }
    } else {
      // For other report types, generate CSV from current data
      generateLocalCSV()
    }
  }

  // Generate CSV from local data (for non-users reports)
  const generateLocalCSV = () => {
    if (reportData.length === 0) {
      toast.error('No data to export')
      return
    }

    const headers = columns.map(col => col.label).join(',')
    const rows = reportData.map(row => 
      columns.map(col => {
        const value = row[col.key] || ''
        // Escape commas and quotes in CSV
        return `"${String(value).replace(/"/g, '""')}"`
      }).join(',')
    ).join('\n')
    
    const csvContent = headers + '\n' + rows
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${activeSection}_report_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    toast.success('CSV exported successfully!')
  }

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
              {activeMenuItem?.label || 'Reports'}
            </h1>
            <p className="text-gray-600 mt-1">
              {activeMenuItem?.description || 'Generate and view reports'}
            </p>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-8">
        <div className="max-w-full">
          <AdvancedSearch
            filters={filters}
            onFiltersChange={setFilters}
            onSearch={handleSearch}
            loading={loading}
            reportType={activeSection}
          />
          
          <TabularView
            columns={columns}
            data={reportData}
            loading={loading}
            onSort={handleSort}
            onExportCSV={handleExportCSV}
          />
        </div>
      </div>
    </div>
  )
}

// Main Reports Page Component
export default function AdminReports() {
  const { user } = useAuth()
  const router = useRouter()
  const [activeSection, setActiveSection] = useState('users')

  return (
    <div className="min-h-screen bg-gray-50">
      <Header variant="admin" showBackButton />

      {/* Main Content */}
      <div className="flex h-[calc(100vh-73px)]">
        <ReportsSidebar 
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />
        <ReportsContent 
          activeSection={activeSection}
        />
      </div>
    </div>
  )
}
