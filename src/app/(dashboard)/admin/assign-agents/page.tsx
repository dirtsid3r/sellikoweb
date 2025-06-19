'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Icons } from '@/components/ui/icons'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { useRouter } from 'next/navigation'
import sellikoClient from '@/selliko-client'
import { toast } from 'react-hot-toast'
import Header from '@/components/layout/header'

interface Agent {
  user: {
    id: string
    email: string
    phone: string
    name: string
    user_role: string
    created_at: string
  }
  agent_profile: {
    id: number
    agent_code: string
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
    working_pincodes: string | null
    profile_image_url: string | null
    created_at: string
    updated_at: string
  }
  agent_tasks: number
}

interface AcceptedBid {
  listing: {
    id: number
    user_id: string
    listing_type: string
    status: string
    asking_price: number
    expected_price: number
    vendor_id: string
    agent_id: string | null
    bids: number
    highest_bid: number
    bid_accepted: string | null
    time_approved: string
    created_at: string
    updated_at: string
  }
  winning_bid_amount: number
  bid_details: {
    id: number
    vendor_id: string
    listing_id: number
    bid_amount: number
    status: string
    instant_win: boolean
    created_at: string
    updated_at: string
  }
  device: {
    id: string
    listing_id: number
    brand: string
    model: string
    storage: string
    color: string
    condition: string
    imei1: string
    imei2: string | null
    battery_health: number | null
    description: string
    purchase_date: string
    purchase_price: number
    warranty_status: string
    warranty_type: string | null
    warranty_expiry: string
    has_bill: boolean
    front_image_url: string
    back_image_url: string
    top_image_url: string | null
    bottom_image_url: string | null
    bill_image_url: string | null
    warranty_image_url: string | null
    created_at: string
    updated_at: string
  }
  pickup_address: {
    id: string
    listing_id: number
    type: string
    contact_name: string | null
    mobile_number: string | null
    email: string | null
    address: string
    city: string
    state: string
    pincode: string
    landmark: string | null
    account_holder_name: string | null
    account_number: string | null
    bank_name: string | null
    ifsc_code: string | null
    pickup_time: string
    created_at: string
    updated_at: string
  }
  agents_available: Agent[]
}

export default function AssignAgents() {
  const { user } = useAuth()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBid, setSelectedBid] = useState<AcceptedBid | null>(null)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [processingId, setProcessingId] = useState<string | null>(null)
  
  // API data states
  const [acceptedBids, setAcceptedBids] = useState<AcceptedBid[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch accepted bids from API
  useEffect(() => {
    const fetchAcceptedBids = async () => {
      console.log('📋 [ASSIGN-AGENTS] Fetching accepted bids...')
      setIsLoading(true)
      setError(null)
      
      try {
        const response = await sellikoClient.getBidAccepted() as any
        
        console.log('📥 [ASSIGN-AGENTS] API response:', {
          success: response.success,
          bidCount: response.accepted_bids?.length || 0,
          error: response.error
        })
        
        if (response.success && response.accepted_bids) {
          // Filter only bids that need agent assignment (no agent_id assigned yet)
          const unassignedBids = response.accepted_bids.filter(
            (bid: AcceptedBid) => !bid.listing.agent_id
          )
          setAcceptedBids(unassignedBids)
          console.log('✅ [ASSIGN-AGENTS] Loaded', unassignedBids.length, 'unassigned bids')
        } else {
          setError(response.error || 'Failed to fetch accepted bids')
          console.error('❌ [ASSIGN-AGENTS] API error:', response.error)
        }
      } catch (error: any) {
        console.error('💥 [ASSIGN-AGENTS] Fetch error:', error)
        setError(error.message || 'Network error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAcceptedBids()
  }, [])

  const filteredBids = acceptedBids.filter(bid => {
    const searchLower = searchTerm.toLowerCase()
    return (
      bid.device.brand.toLowerCase().includes(searchLower) ||
      bid.device.model.toLowerCase().includes(searchLower) ||
      bid.pickup_address.contact_name?.toLowerCase().includes(searchLower) ||
      bid.pickup_address.city.toLowerCase().includes(searchLower)
    )
  })

  const handleAssignAgent = async (agentUserId: string) => {
    if (!selectedBid) return
    
    console.log('👥 [ASSIGN-AGENTS] Assigning agent:', agentUserId, 'to listing:', selectedBid.listing.id)
    setProcessingId(selectedBid.listing.id.toString())
    
    try {
      const result = await sellikoClient.assignAgent(selectedBid.listing.id, agentUserId) as any
      
      console.log('📥 [ASSIGN-AGENTS] Assignment result:', {
        success: result.success,
        hasListing: !!result.listing,
        hasAgent: !!result.agent,
        listingStatus: result.listing?.status,
        agentCode: result.agent?.agent_profile?.agent_code,
        agentName: result.agent?.agent_profile?.name,
        message: result.message,
        error: result.error
      })
      
      if (result.success) {
        // Show detailed success message with agent info
        const agentName = result.agent?.agent_profile?.name || 'Agent'
        const agentCode = result.agent?.agent_profile?.agent_code || 'N/A'
        const deviceInfo = `${selectedBid.device.brand} ${selectedBid.device.model}`
        
        toast.success(
          `✅ ${agentName} (${agentCode}) assigned to pickup ${deviceInfo}. Task created successfully!`,
          { duration: 5000 }
        )
        
        console.log('✅ [ASSIGN-AGENTS] Agent assigned successfully:', {
          listingId: selectedBid.listing.id,
          agentName: agentName,
          agentCode: agentCode,
          listingStatus: result.listing?.status,
          deviceInfo: deviceInfo
        })
        
        // Remove the assigned bid from the list since it no longer needs assignment
        setAcceptedBids(prev => 
          prev.filter(bid => bid.listing.id !== selectedBid.listing.id)
        )
        
        setIsAssignModalOpen(false)
        setSelectedBid(null)
      } else {
        const errorMessage = result.error || 'Failed to assign agent'
        toast.error(`❌ Assignment failed: ${errorMessage}`)
        console.error('❌ [ASSIGN-AGENTS] Assignment failed:', result.error)
      }
    } catch (error: any) {
      console.error('💥 [ASSIGN-AGENTS] Assignment error:', error)
      toast.error('❌ Network error occurred while assigning agent')
    } finally {
      setProcessingId(null)
    }
  }

  const getSuitableAgents = (bid: AcceptedBid) => {
    // Get agents that work in the pickup city's pincode
    return bid.agents_available.filter(agent => {
      // If working_pincodes is null, check if agent is in the same city as fallback
      if (!agent.agent_profile.working_pincodes) {
        // Fallback: check if agent is in the same city
        return agent.agent_profile.city.toLowerCase() === bid.pickup_address.city.toLowerCase() && agent.agent_tasks < 5
      }
      
      const workingPincodes = agent.agent_profile.working_pincodes.split(',').map(p => p.trim())
      return workingPincodes.includes(bid.pickup_address.pincode) && agent.agent_tasks < 5
    }).sort((a, b) => a.agent_tasks - b.agent_tasks) // Sort by least busy first
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (taskCount: number) => {
    if (taskCount === 0) return 'bg-green-100 text-green-800'
    if (taskCount <= 2) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 rounded-2xl mb-4">
            <Icons.spinner className="w-8 h-8 text-white animate-spin" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Accepted Bids</h2>
          <p className="text-gray-600">Fetching bids that need agent assignment...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-2xl mb-4">
            <Icons.alertCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Data</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            <Icons.refresh className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      <Header variant="admin" showBackButton />
      
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl flex items-center justify-center shadow-lg">
                <Icons.users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Assign Agents</h1>
                <p className="text-sm text-gray-500">{filteredBids.length} pending assignment</p>
              </div>
            </div>
            
            <button 
              className="btn-ghost px-4 py-2 rounded-xl"
              onClick={() => window.location.reload()}
            >
              <Icons.refresh className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Icons.search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by device, seller, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-mobile w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-mobile"
            />
          </div>
        </div>

        {/* Accepted Bids Needing Agent Assignment */}
        <div className="space-y-6">
          {filteredBids.length === 0 ? (
            <div className="card-mobile card-elevated p-12 text-center bg-white/80 backdrop-blur-sm">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Icons.check className="w-8 h-8 text-purple-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">All assignments complete</h3>
              <p className="text-gray-600">All accepted bids have been assigned to agents. New assignments will appear here.</p>
            </div>
          ) : (
            filteredBids.map((bid) => {
              const suitableAgents = getSuitableAgents(bid)
              
              return (
                <div key={bid.listing.id} className="card-mobile hover:card-elevated bg-white/80 backdrop-blur-sm border border-gray-200/60 p-6 transition-mobile">
                  <div className="">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Transaction Details */}
                      <div className="lg:col-span-2">
                        <div className="space-y-4">
                          {/* Device & Priority */}
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-xl font-bold text-gray-900">
                                {bid.device.brand} {bid.device.model}
                              </h3>
                              <p className="text-gray-600">
                                {bid.device.storage} • {bid.device.condition}
                              </p>
                              <div className="flex items-center space-x-2 mt-2">
                                <Badge variant="outline">
                                  Accepted {formatDate(bid.listing.bid_accepted || '')}
                                </Badge>
                                {bid.winning_bid_amount && (
                                  <Badge className="bg-orange-100 text-orange-800">
                                    Winning Bid: ₹{bid.winning_bid_amount.toLocaleString()}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600">Winning Bid</p>
                              <p className="text-2xl font-bold text-green-600">
                                ₹{bid.bid_details.bid_amount.toLocaleString()}
                              </p>
                            </div>
                          </div>

                          {/* Seller & Vendor Info */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-blue-50 rounded-lg p-4">
                              <h4 className="font-medium text-gray-900 mb-2">Pickup Details</h4>
                              <div className="space-y-1 text-sm">
                                <p><span className="text-gray-600">Contact:</span> {bid.pickup_address.contact_name || 'Not specified'}</p>
                                <p><span className="text-gray-600">Phone:</span> {bid.pickup_address.mobile_number || 'Not specified'}</p>
                                <p><span className="text-gray-600">Address:</span> {bid.pickup_address.address}</p>
                                <p><span className="text-gray-600">City:</span> {bid.pickup_address.city}</p>
                                <p><span className="text-gray-600">Pincode:</span> {bid.pickup_address.pincode}</p>
                                {bid.pickup_address.landmark && (
                                  <p><span className="text-gray-600">Landmark:</span> {bid.pickup_address.landmark}</p>
                                )}
                                {bid.pickup_address.pickup_time && (
                                  <p><span className="text-gray-600">Preferred Time:</span> {bid.pickup_address.pickup_time}</p>
                                )}
                              </div>
                            </div>

                            <div className="bg-green-50 rounded-lg p-4">
                              <h4 className="font-medium text-gray-900 mb-2">Bid Details</h4>
                              <div className="space-y-1 text-sm">
                                <p><span className="text-gray-600">Vendor ID:</span> {bid.listing.vendor_id}</p>
                                <p><span className="text-gray-600">Bid Amount:</span> ₹{bid.winning_bid_amount.toLocaleString()}</p>
                                <p><span className="text-gray-600">Bid Status:</span> {bid.bid_details.status}</p>
                                <p><span className="text-gray-600">Instant Win:</span> {bid.bid_details.instant_win ? 'Yes' : 'No'}</p>
                                <p><span className="text-gray-600">Total Bids:</span> {bid.listing.bids}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Agent Assignment */}
                      <div className="lg:col-span-1">
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Available Agents</h4>
                            <p className="text-sm text-gray-600 mb-3">
                              {suitableAgents.length} agents available in {bid.pickup_address.city}
                            </p>
                            
                            {suitableAgents.length > 0 ? (
                              <div className="space-y-2">
                                {suitableAgents.slice(0, 2).map((agent) => (
                                  <div key={agent.user.id} className="bg-gray-50 rounded-lg p-3">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="font-medium text-sm">{agent.agent_profile.name}</span>
                                      <span className="text-xs text-gray-600">{agent.agent_profile.agent_code}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <Badge className={getStatusColor(agent.agent_tasks)} variant="secondary">
                                        {agent.agent_tasks} active tasks
                                      </Badge>
                                    </div>
                                  </div>
                                ))}
                                
                                {suitableAgents.length > 2 && (
                                  <p className="text-xs text-gray-500">
                                    +{suitableAgents.length - 2} more agents available
                                  </p>
                                )}
                              </div>
                            ) : (
                              <div className="bg-yellow-50 rounded-lg p-3 text-center">
                                <Icons.alertCircle className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                                <p className="text-sm text-yellow-700">
                                  No agents available in {bid.pickup_address.city} (pincode: {bid.pickup_address.pincode})
                                </p>
                              </div>
                            )}
                          </div>

                          <Button
                            onClick={() => {
                              setSelectedBid(bid)
                              setIsAssignModalOpen(true)
                            }}
                            disabled={suitableAgents.length === 0 || processingId === bid.listing.id.toString()}
                            className="w-full"
                          >
                            {processingId === bid.listing.id.toString() ? (
                              <Icons.spinner className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                              <Icons.users className="w-4 h-4 mr-2" />
                            )}
                            Assign Agent
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Agent Assignment Modal */}
      <Modal 
        open={isAssignModalOpen} 
        onOpenChange={setIsAssignModalOpen}
        title="Assign Agent"
        description={selectedBid ? `Select an agent for pickup in ${selectedBid.pickup_address.city}` : ''}
      >
        {selectedBid && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Task Summary</h4>
              <p className="text-sm text-gray-700">
                Pickup {selectedBid.device.brand} {selectedBid.device.model} from {selectedBid.pickup_address.contact_name || 'pickup location'} 
                in {selectedBid.pickup_address.city} and deliver to vendor (ID: {selectedBid.listing.vendor_id})
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Winning bid: ₹{selectedBid.winning_bid_amount.toLocaleString()} 
                {selectedBid.bid_details.instant_win && ' (Instant Win)'}
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Available Agents</h4>
              
              {getSuitableAgents(selectedBid).map((agent) => (
                <div 
                  key={agent.user.id} 
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h5 className="font-medium text-gray-900">{agent.agent_profile.name}</h5>
                      <p className="text-sm text-gray-600">{agent.agent_profile.number}</p>
                      <p className="text-xs text-gray-500">Code: {agent.agent_profile.agent_code}</p>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(agent.agent_tasks)}>
                        {agent.agent_tasks} tasks
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      <span>Works in: {agent.agent_profile.working_pincodes || 'City-based assignment'}</span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAssignAgent(agent.user.id)}
                      disabled={processingId === selectedBid?.listing.id.toString()}
                    >
                      {processingId === selectedBid?.listing.id.toString() ? (
                        <Icons.spinner className="w-4 h-4 animate-spin" />
                      ) : (
                        'Assign'
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
} 