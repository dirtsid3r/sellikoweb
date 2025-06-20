'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { Icons } from '@/components/ui/icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import sellikoClient from '@/selliko-client'
import { toast } from 'react-hot-toast'
import Header from '@/components/layout/header'

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

  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Close dropdown when clicking outside
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

export default function AgentProfileUpdate() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  
  // State for agent form
  const [agentData, setAgentData] = useState({
    agent_id: '',
    agent_code: '',
    name: '',
    email: '',
    number: '',
    address: '',
    city: '',
    pincode: '',
    state: '',
    landmark: '',
    contact_person: '',
    contact_person_phone: '',
    working_pincodes: '',
    user_id: '',
    user_name: '',
    user_mobile: ''
  })
  const [isUpdatingAgent, setIsUpdatingAgent] = useState(false)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)

  // Config state for cities
  const [configLoading, setConfigLoading] = useState(true)
  const [availableCities, setAvailableCities] = useState<string[]>([])

  // State for working pincodes tags
  const [workingPincodesArray, setWorkingPincodesArray] = useState<string[]>([])
  const [newPincode, setNewPincode] = useState('')

  // Load current agent profile on component mount
  useEffect(() => {
    if (user && !isLoading) {
      loadCurrentAgentProfile()
    }
  }, [user, isLoading])

  // Fetch form configuration on component load
  useEffect(() => {
    const fetchFormConfig = async () => {
      try {
        console.log('📋 [AGENT-PROFILE-UPDATE] Fetching form configuration...')
        const config = await sellikoClient.getUniversalFormConfig() as any
        
        if (config.success) {
          setAvailableCities(config.cities || [])
          console.log('✅ [AGENT-PROFILE-UPDATE] Form config loaded:', {
            cities: config.cities?.length || 0
          })
        } else {
          console.error('❌ [AGENT-PROFILE-UPDATE] Failed to load form config:', config.error)
          // Fallback to empty array
          setAvailableCities([])
        }
      } catch (error) {
        console.error('💥 [AGENT-PROFILE-UPDATE] Error fetching form config:', error)
        // Fallback to empty array
        setAvailableCities([])
      } finally {
        setConfigLoading(false)
      }
    }

    fetchFormConfig()
  }, [])

  // Load current agent's profile using getprofile function
  const loadCurrentAgentProfile = async () => {
    setIsLoadingProfile(true)
    try {
      console.log('🔍 [AGENT-PROFILE-UPDATE] Loading current agent profile using getprofile...')
      
      // Get current user's profile using getprofile endpoint
      const result = await sellikoClient.getProfile() as {
        success: boolean
        profile?: any
        user_role?: string
        message?: string
        error?: string
      }
      
      console.log('📥 [AGENT-PROFILE-UPDATE] Profile result:', {
        success: result.success,
        hasProfile: !!result.profile,
        userRole: result.user_role,
        message: result.message,
        error: result.error
      })

      if (result.success && result.profile && result.user_role === 'agent') {
        const profile = result.profile
        
        // Map the API response to form data based on the sample structure
        const mappedData = {
          agent_id: profile.id || '',
          agent_code: profile.agent_code || '',
          name: profile.name || user?.name || '',
          email: profile.email || (user as any)?.email || '',
          number: profile.number || user?.phone || '',
          address: profile.address || '',
          city: profile.city || '',
          pincode: profile.pincode || '',
          state: profile.state || '',
          landmark: profile.landmark || '',
          contact_person: profile.contact_person || '',
          contact_person_phone: profile.contact_person_phone || '',
          working_pincodes: profile.working_pincodes || '',
          user_id: profile.user_id || user?.id || '',
          user_name: user?.name || '',
          user_mobile: user?.phone || ''
        }
        
        setAgentData(mappedData)
        console.log('✅ [AGENT-PROFILE-UPDATE] Agent profile loaded:', mappedData)
        
        // Convert working_pincodes string to array for tag display
        const pincodes = mappedData.working_pincodes 
          ? mappedData.working_pincodes.split(',').map((p: string) => p.trim()).filter((p: string) => p.length > 0)
          : []
        setWorkingPincodesArray(pincodes)
        console.log('📍 [AGENT-PROFILE-UPDATE] Working pincodes loaded:', pincodes)
      } else {
        console.error('❌ [AGENT-PROFILE-UPDATE] Failed to load agent profile:', result.error)
        
        if (result.user_role && result.user_role !== 'agent') {
          toast.error(`This page is for agents only. Current role: ${result.user_role}`)
        } else {
          toast.error(result.error || 'Failed to load profile')
        }
        
        // Initialize with user data if profile doesn't exist
        setAgentData(prev => ({
          ...prev,
          name: user?.name || '',
          email: (user as any)?.email || '',
          number: user?.phone || '',
          user_id: user?.id || '',
          user_name: user?.name || '',
          user_mobile: user?.phone || ''
        }))
      }
    } catch (error) {
      console.error('💥 [AGENT-PROFILE-UPDATE] Load profile error:', error)
      toast.error('Network error while loading profile')
    } finally {
      setIsLoadingProfile(false)
    }
  }

  // Handle form input changes
  const handleInputChange = (field: string, value: string) => {
    setAgentData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Working Pincodes Management Functions
  const addPincode = () => {
    const trimmedPincode = newPincode.trim()
    
    // Validate pincode format (6 digits)
    if (!/^\d{6}$/.test(trimmedPincode)) {
      toast.error('Pincode must be exactly 6 digits')
      return
    }
    
    // Check for duplicates
    if (workingPincodesArray.includes(trimmedPincode)) {
      toast.error('Pincode already exists')
      return
    }
    
    const updatedPincodes = [...workingPincodesArray, trimmedPincode]
    setWorkingPincodesArray(updatedPincodes)
    
    // Update the main form data
    setAgentData(prev => ({
      ...prev,
      working_pincodes: updatedPincodes.join(', ')
    }))
    
    setNewPincode('')
    console.log('📍 [AGENT-PROFILE-UPDATE] Added pincode:', trimmedPincode)
  }

  const removePincode = (pincodeToRemove: string) => {
    const updatedPincodes = workingPincodesArray.filter(p => p !== pincodeToRemove)
    setWorkingPincodesArray(updatedPincodes)
    
    // Update the main form data
    setAgentData(prev => ({
      ...prev,
      working_pincodes: updatedPincodes.join(', ')
    }))
    
    console.log('📍 [AGENT-PROFILE-UPDATE] Removed pincode:', pincodeToRemove)
  }

  const handlePincodeKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addPincode()
    }
  }

  // Handle agent profile update
  const handleUpdateProfile = async () => {
    // Validate required fields
    if (!agentData.name || !agentData.email || !agentData.number) {
      toast.error('Name, email, and phone number are required')
      return
    }

    setIsUpdatingAgent(true)
    try {
      console.log('📝 [AGENT-PROFILE-UPDATE] Updating agent profile...')
      
      // Prepare update payload - agents can only update certain fields
      const updatePayload: Partial<{
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
        working_pincodes: string
        profile_image_url: string
      }> = {
        name: agentData.name,
        email: agentData.email,
        number: agentData.number,
        address: agentData.address,
        city: agentData.city,
        pincode: agentData.pincode,
        state: agentData.state,
        landmark: agentData.landmark,
        contact_person: agentData.contact_person,
        contact_person_phone: agentData.contact_person_phone,
        working_pincodes: agentData.working_pincodes
      }

      console.log('📤 [AGENT-PROFILE-UPDATE] Update payload:', {
        hasName: !!updatePayload.name,
        hasEmail: !!updatePayload.email,
        hasNumber: !!updatePayload.number,
        hasAddress: !!updatePayload.address,
        hasCity: !!updatePayload.city,
        workingPincodesCount: workingPincodesArray.length
      })

      const result = await sellikoClient.updateAgentProfile(parseInt(agentData.agent_id), updatePayload as any) as {
        success: boolean
        message?: string
        error?: string
        agent_profile?: any
      }
      
      console.log('📥 [AGENT-PROFILE-UPDATE] Update result:', {
        success: result.success,
        message: result.message,
        error: result.error,
        hasAgentProfile: !!result.agent_profile
      })

      if (result.success) {
        toast.success('Profile updated successfully!')
        console.log('✅ [AGENT-PROFILE-UPDATE] Profile updated successfully')
        
        // Update form data with the response if available
        if (result.agent_profile) {
          const updatedProfile = result.agent_profile
          setAgentData(prev => ({
            ...prev,
            agent_code: updatedProfile.agent_code || prev.agent_code,
            name: updatedProfile.name || prev.name,
            email: updatedProfile.email || prev.email,
            number: updatedProfile.number || prev.number,
            address: updatedProfile.address || prev.address,
            city: updatedProfile.city || prev.city,
            pincode: updatedProfile.pincode || prev.pincode,
            state: updatedProfile.state || prev.state,
            landmark: updatedProfile.landmark || prev.landmark,
            contact_person: updatedProfile.contact_person || prev.contact_person,
            contact_person_phone: updatedProfile.contact_person_phone || prev.contact_person_phone,
            working_pincodes: updatedProfile.working_pincodes || prev.working_pincodes
          }))
          
          // Update working pincodes array if it was updated
          if (updatedProfile.working_pincodes !== undefined) {
            const updatedPincodes = updatedProfile.working_pincodes 
              ? updatedProfile.working_pincodes.split(',').map((p: string) => p.trim()).filter((p: string) => p.length === 6)
              : []
            setWorkingPincodesArray(updatedPincodes)
            console.log('📍 [AGENT-PROFILE-UPDATE] Working pincodes updated:', updatedPincodes)
          }
        }
        
        // Optionally redirect back to profile page after successful update
        setTimeout(() => {
          router.push('/agent/profile')
        }, 2000)
      } else {
        console.error('❌ [AGENT-PROFILE-UPDATE] Update failed:', result.error)
        toast.error(result.error || 'Failed to update profile')
      }
    } catch (error) {
      console.error('💥 [AGENT-PROFILE-UPDATE] Update error:', error)
      toast.error('Network error occurred while updating profile')
    } finally {
      setIsUpdatingAgent(false)
    }
  }

  // Handle back navigation
  const handleGoBack = () => {
    router.push('/agent/profile')
  }

  if (isLoading || isLoadingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Icons.spinner className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      <Header variant="agent" showBackButton />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Agent Profile Update</h1>
          <p className="text-gray-600">Update your agent profile information</p>
        </div>

        {/* Profile Update Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Icons.edit className="w-5 h-5 text-purple-600" />
              <span>Agent Profile - {agentData.agent_code || agentData.agent_id || 'New Profile'}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Agent ID and Code (Read-only for agents) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Agent ID
                  </label>
                  <Input
                    value={agentData.agent_id}
                    disabled
                    className="bg-gray-100 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Agent Code <span className="text-xs text-orange-600">(admin assigned)</span>
                  </label>
                  <Input
                    value={agentData.agent_code}
                    disabled
                    className="bg-gray-100 cursor-not-allowed"
                  />
                  <p className="text-xs text-orange-600 mt-1">Agent codes are assigned by administrators</p>
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name *
                  </label>
                  <Input
                    value={agentData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <Input
                    type="email"
                    value={agentData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter your email address"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <Input
                    type="tel"
                    value={agentData.number}
                    onChange={(e) => handleInputChange('number', e.target.value)}
                    placeholder="Enter your phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Person
                  </label>
                  <Input
                    value={agentData.contact_person}
                    onChange={(e) => handleInputChange('contact_person', e.target.value)}
                    placeholder="Enter contact person name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Person Phone
                </label>
                <Input
                  type="tel"
                  value={agentData.contact_person_phone}
                  onChange={(e) => handleInputChange('contact_person_phone', e.target.value)}
                  placeholder="Enter contact person phone"
                />
              </div>

              {/* Address Information */}
              <div className="border-t pt-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Address Information</h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <Input
                      value={agentData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Enter your full address"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <SearchableDropdown
                        options={availableCities}
                        value={agentData.city}
                        onChange={(value) => handleInputChange('city', value)}
                        placeholder={configLoading ? "Loading cities..." : "Search and select city"}
                        disabled={configLoading}
                      />
                      {configLoading && (
                        <p className="text-xs text-gray-500 mt-1">Loading available cities...</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pincode
                      </label>
                      <Input
                        value={agentData.pincode}
                        onChange={(e) => handleInputChange('pincode', e.target.value)}
                        placeholder="Enter your pincode"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State
                      </label>
                      <Input
                        value={agentData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        placeholder="Enter your state"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Landmark
                    </label>
                    <Input
                      value={agentData.landmark}
                      onChange={(e) => handleInputChange('landmark', e.target.value)}
                      placeholder="Enter nearby landmark"
                    />
                  </div>
                </div>
              </div>

              {/* Working Pincodes Section */}
              <div className="border-t pt-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Working Pincodes</h4>
                <p className="text-sm text-gray-600 mb-4">Add the pincodes where you can provide services</p>
                
                <div className="space-y-4">
                  {/* Add New Pincode */}
                  <div className="flex space-x-2">
                    <div className="flex-1">
                      <Input
                        value={newPincode}
                        onChange={(e) => setNewPincode(e.target.value)}
                        onKeyPress={handlePincodeKeyPress}
                        placeholder="Enter 6-digit pincode"
                        maxLength={6}
                        pattern="\d{6}"
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={addPincode}
                      disabled={!newPincode.trim() || newPincode.length !== 6}
                      variant="outline"
                      className="px-4"
                    >
                      <Icons.plus className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                  </div>
                  
                  {/* Pincodes Tags Display */}
                  {workingPincodesArray.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Working Pincodes ({workingPincodesArray.length})
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {workingPincodesArray.map((pincode, index) => (
                          <div
                            key={index}
                            className="inline-flex items-center bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full"
                          >
                            <span>{pincode}</span>
                            <button
                              type="button"
                              onClick={() => removePincode(pincode)}
                              className="ml-2 text-purple-600 hover:text-purple-800 focus:outline-none"
                            >
                              <Icons.x className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {workingPincodesArray.length === 0 && (
                    <div className="text-center py-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <Icons.mapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">No working pincodes added yet</p>
                      <p className="text-xs text-gray-500">Add pincodes where you can provide services</p>
                    </div>
                  )}
                </div>
              </div>

              {/* User Information (Read-only) */}
              <div className="border-t pt-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Associated User Account</h4>
                
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        User ID
                      </label>
                      <p className="text-sm text-gray-900 font-mono bg-white px-3 py-2 rounded border">
                        {agentData.user_id || 'Not assigned'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        User Name
                      </label>
                      <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">
                        {agentData.user_name || 'Not available'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      User Mobile
                    </label>
                    <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">
                      {agentData.user_mobile || 'Not available'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t pt-6 flex space-x-4">
                <Button
                  onClick={handleUpdateProfile}
                  disabled={isUpdatingAgent || !agentData.name || !agentData.email || !agentData.number}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {isUpdatingAgent ? (
                    <>
                      <Icons.spinner className="w-4 h-4 mr-2 animate-spin" />
                      Updating Profile...
                    </>
                  ) : (
                    <>
                      <Icons.check className="w-4 h-4 mr-2" />
                      Update Profile
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={handleGoBack}
                  variant="outline"
                  disabled={isUpdatingAgent}
                >
                  <Icons.x className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 