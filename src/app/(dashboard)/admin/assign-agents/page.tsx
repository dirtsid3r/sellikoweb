'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Icons } from '@/components/ui/icons'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { useRouter } from 'next/navigation'

interface Agent {
  id: string
  name: string
  phone: string
  location: string
  rating: number
  totalTasks: number
  activeTasksCount: number
  status: 'available' | 'busy' | 'offline'
  expertise: string[]
}

interface AcceptedBid {
  id: string
  listingId: string
  device: {
    brand: string
    model: string
    storage: string
    condition: string
  }
  seller: {
    name: string
    phone: string
    address: string
    city: string
  }
  vendor: {
    name: string
    phone: string
    businessName: string
  }
  bidAmount: number
  acceptedAt: string
  needsAgent: boolean
  assignedAgent?: Agent
  assignedAt?: string
}

export default function AssignAgents() {
  const { user } = useAuth()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBid, setSelectedBid] = useState<AcceptedBid | null>(null)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [processingId, setProcessingId] = useState<string | null>(null)

  // Mock data - in real app, this would come from API
  const [acceptedBids, setAcceptedBids] = useState<AcceptedBid[]>([
    {
      id: 'bid-001',
      listingId: 'listing-001',
      device: {
        brand: 'Apple',
        model: 'iPhone 14 Pro',
        storage: '256GB',
        condition: 'Excellent'
      },
      seller: {
        name: 'Rajesh Kumar',
        phone: '+91 9876543210',
        address: 'Marine Drive, Fort Kochi',
        city: 'Kochi'
      },
      vendor: {
        name: 'Pradeep Mobile Store',
        phone: '+91 9876543211',
        businessName: 'Pradeep Electronics'
      },
             bidAmount: 82000,
       acceptedAt: '2024-01-15T14:30:00Z',
       needsAgent: true
    },
    {
      id: 'bid-002',
      listingId: 'listing-002',
      device: {
        brand: 'Samsung',
        model: 'Galaxy S23 Ultra',
        storage: '512GB',
        condition: 'Very Good'
      },
      seller: {
        name: 'Priya Nair',
        phone: '+91 9876543212',
        address: 'Sasthamangalam, Trivandrum',
        city: 'Thiruvananthapuram'
      },
      vendor: {
        name: 'TechWorld Solutions',
        phone: '+91 9876543213',
        businessName: 'TechWorld'
      },
             bidAmount: 76000,
       acceptedAt: '2024-01-14T16:45:00Z',
       needsAgent: true
    },
    {
      id: 'bid-003',
      listingId: 'listing-003',
      device: {
        brand: 'OnePlus',
        model: '11 Pro',
        storage: '256GB',
        condition: 'Good'
      },
      seller: {
        name: 'Arjun Menon',
        phone: '+91 9876543214',
        address: 'Mavoor Road, Calicut',
        city: 'Kozhikode'
      },
      vendor: {
        name: 'Mobile Planet',
        phone: '+91 9876543215',
        businessName: 'Mobile Planet'
      },
             bidAmount: 43000,
       acceptedAt: '2024-01-13T11:20:00Z',
       needsAgent: true
    }
  ])

  const [availableAgents] = useState<Agent[]>([
    {
      id: 'agent-001',
      name: 'Suresh Nair',
      phone: '+91 9876543220',
      location: 'Kochi',
      rating: 4.8,
      totalTasks: 245,
      activeTasksCount: 2,
      status: 'available',
      expertise: ['iPhone', 'Samsung', 'Premium devices']
    },
    {
      id: 'agent-002',
      name: 'Lakshmi Pillai',
      phone: '+91 9876543221',
      location: 'Thiruvananthapuram',
      rating: 4.9,
      totalTasks: 189,
      activeTasksCount: 1,
      status: 'available',
      expertise: ['Android devices', 'OnePlus', 'Verification']
    },
    {
      id: 'agent-003',
      name: 'Ravi Kumar',
      phone: '+91 9876543222',
      location: 'Kozhikode',
      rating: 4.7,
      totalTasks: 156,
      activeTasksCount: 3,
      status: 'busy',
      expertise: ['All brands', 'Technical inspection']
    },
    {
      id: 'agent-004',
      name: 'Deepa Menon',
      phone: '+91 9876543223',
      location: 'Kochi',
      rating: 4.6,
      totalTasks: 98,
      activeTasksCount: 0,
      status: 'available',
      expertise: ['Customer service', 'Documentation']
    }
  ])

  const filteredBids = acceptedBids.filter(bid =>
    bid.device.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bid.device.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bid.seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bid.seller.city.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const unassignedBids = filteredBids.filter(bid => bid.needsAgent && !bid.assignedAgent)

  const handleAssignAgent = async (agentId: string) => {
    if (!selectedBid) return
    
    setProcessingId(selectedBid.id)
    
    const selectedAgent = availableAgents.find(agent => agent.id === agentId)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setAcceptedBids(prev => 
      prev.map(bid => 
        bid.id === selectedBid.id 
          ? { ...bid, assignedAgent: selectedAgent, needsAgent: false }
          : bid
      )
    )
    
    setProcessingId(null)
    setIsAssignModalOpen(false)
    setSelectedBid(null)
    
    alert(`Agent ${selectedAgent?.name} assigned successfully! Pickup task created.`)
  }

  const getSuitableAgents = (bid: AcceptedBid) => {
    return availableAgents.filter(agent => 
      agent.status === 'available' && 
      agent.location === bid.seller.city &&
      agent.activeTasksCount < 5
    ).sort((a, b) => b.rating - a.rating)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800'
      case 'busy': return 'bg-yellow-100 text-yellow-800'
      case 'offline': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      {/* Header - iOS Style */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/60 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.back()}
                className="touch-target btn-ghost p-2 rounded-xl"
              >
                <Icons.arrowLeft className="w-5 h-5" />
              </button>
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl flex items-center justify-center shadow-lg">
                <Icons.users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Assign Agents</h1>
                <p className="text-xs text-gray-500">{unassignedBids.length} pending assignment</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="btn-ghost px-4 py-2 rounded-xl">
                <Icons.refresh className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

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
          {unassignedBids.length === 0 ? (
            <div className="card-mobile card-elevated p-12 text-center bg-white/80 backdrop-blur-sm">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Icons.check className="w-8 h-8 text-purple-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">All assignments complete</h3>
              <p className="text-gray-600">All accepted bids have been assigned to agents. New assignments will appear here.</p>
            </div>
          ) : (
            unassignedBids.map((bid) => {
              const suitableAgents = getSuitableAgents(bid)
              
              return (
                <div key={bid.id} className="card-mobile hover:card-elevated bg-white/80 backdrop-blur-sm border border-gray-200/60 p-6 transition-mobile">
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
                                  Accepted {formatDate(bid.acceptedAt)}
                                </Badge>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600">Winning Bid</p>
                              <p className="text-2xl font-bold text-green-600">
                                ₹{bid.bidAmount.toLocaleString()}
                              </p>
                            </div>
                          </div>

                          {/* Seller & Vendor Info */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-blue-50 rounded-lg p-4">
                              <h4 className="font-medium text-gray-900 mb-2">Seller Details</h4>
                              <div className="space-y-1 text-sm">
                                <p><span className="text-gray-600">Name:</span> {bid.seller.name}</p>
                                <p><span className="text-gray-600">Phone:</span> {bid.seller.phone}</p>
                                <p><span className="text-gray-600">Address:</span> {bid.seller.address}</p>
                                <p><span className="text-gray-600">City:</span> {bid.seller.city}</p>
                              </div>
                            </div>

                            <div className="bg-green-50 rounded-lg p-4">
                              <h4 className="font-medium text-gray-900 mb-2">Vendor Details</h4>
                              <div className="space-y-1 text-sm">
                                <p><span className="text-gray-600">Business:</span> {bid.vendor.businessName}</p>
                                <p><span className="text-gray-600">Contact:</span> {bid.vendor.name}</p>
                                <p><span className="text-gray-600">Phone:</span> {bid.vendor.phone}</p>
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
                              {suitableAgents.length} agents available in {bid.seller.city}
                            </p>
                            
                            {suitableAgents.length > 0 ? (
                              <div className="space-y-2">
                                {suitableAgents.slice(0, 2).map((agent) => (
                                  <div key={agent.id} className="bg-gray-50 rounded-lg p-3">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="font-medium text-sm">{agent.name}</span>
                                      <div className="flex items-center space-x-1">
                                        <Icons.star className="w-3 h-3 text-yellow-500 fill-current" />
                                        <span className="text-xs text-gray-600">{agent.rating}</span>
                                      </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <Badge className={getStatusColor(agent.status)} variant="secondary">
                                        {agent.activeTasksCount} active tasks
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
                                  No agents available in {bid.seller.city}
                                </p>
                              </div>
                            )}
                          </div>

                          <Button
                            onClick={() => {
                              setSelectedBid(bid)
                              setIsAssignModalOpen(true)
                            }}
                            disabled={suitableAgents.length === 0 || processingId === bid.id}
                            className="w-full"
                          >
                            {processingId === bid.id ? (
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
        description={selectedBid ? `Select an agent for pickup in ${selectedBid.seller.city}` : ''}
      >
        {selectedBid && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Task Summary</h4>
              <p className="text-sm text-gray-700">
                Pickup {selectedBid.device.brand} {selectedBid.device.model} from {selectedBid.seller.name} 
                in {selectedBid.seller.city} and deliver to {selectedBid.vendor.businessName}
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Available Agents</h4>
              
              {getSuitableAgents(selectedBid).map((agent) => (
                <div 
                  key={agent.id} 
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h5 className="font-medium text-gray-900">{agent.name}</h5>
                      <p className="text-sm text-gray-600">{agent.phone}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1 mb-1">
                        <Icons.star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="font-medium">{agent.rating}</span>
                      </div>
                      <Badge className={getStatusColor(agent.status)}>
                        {agent.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      <span>{agent.totalTasks} total tasks • {agent.activeTasksCount} active</span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAssignAgent(agent.id)}
                      disabled={processingId === selectedBid?.id}
                    >
                      {processingId === selectedBid?.id ? (
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