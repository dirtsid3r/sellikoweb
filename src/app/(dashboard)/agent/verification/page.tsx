'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import sellikoClient from '@/selliko-client'
import { toast } from 'react-hot-toast'
import { 
  CheckCircleIcon,
  ClockIcon,
  CameraIcon,
  DevicePhoneMobileIcon,
  Battery0Icon,
  SparklesIcon,
  DocumentCheckIcon,
  ShieldCheckIcon,
  QrCodeIcon,
  PhotoIcon,
  MicrophoneIcon,
  SpeakerWaveIcon,
  WifiIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  CurrencyRupeeIcon,
  MapPinIcon,
  IdentificationIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PlayIcon
} from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid'
import { Icons } from '@/components/ui/icons'

interface VerificationStep {
  id: number
  title: string
  description: string
  icon: any
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  required: boolean
  estimatedTime: string
  details?: string[]
}

interface Deduction {
  id: string
  category: string
  issue: string
  amount: number
  severity: 'minor' | 'major' | 'critical'
}

interface DeviceInfo {
  id: string
  device: string
  model: string
  seller: string
  phone: string
  location: string
  askingPrice: number
  vendorBid: number
  timeSlot: string
  fullAddress?: string
  imei1?: string
  imei2?: string
  condition?: string
  storage?: string
  color?: string
  images?: string[]
  // Additional fields from API
  description?: string
  hasBill?: boolean
  purchaseDate?: string
  purchasePrice?: number
  batteryHealth?: number
  warrantyStatus?: string
  warrantyExpiry?: string
  warrantyType?: string
  email?: string
  pincode?: string
  bankName?: string
  ifscCode?: string
  accountNumber?: string
  accountHolderName?: string
  pickupAddress?: string
  pickupPincode?: string
  pickupTime?: string
}

// Add interface for API response - updated to match actual structure
interface ListingResponse {
  success: boolean
  listing?: {
    id: number
    user_id: string
    listing_type: string
    status: string
    asking_price: number
    expected_price: number
    created_at: string
    updated_at: string
    vendor_id: string
    agent_id: string
    highest_bid: number
    rejection_note?: string
    time_approved?: string
    instant_win: boolean
    bid_accepted?: string
    assigned_time?: string
    devices: Array<{
      id: string
      brand: string
      model: string
      color: string
      storage: string
      condition: string
      imei1: string
      imei2?: string
      description?: string
      has_bill: boolean
      purchase_date?: string
      purchase_price?: number
      battery_health?: number
      warranty_status: string
      warranty_expiry?: string
      warranty_type?: string
      front_image_url?: string
      back_image_url?: string
      top_image_url?: string
      bottom_image_url?: string
      bill_image_url?: string
      warranty_image_url?: string
    }>
    addresses: Array<{
      id: string
      type: string
      contact_name?: string
      mobile_number?: string
      email?: string
      address: string
      city: string
      state: string
      pincode: string
      landmark?: string
      pickup_time?: string
      bank_name?: string
      ifsc_code?: string
      account_number?: string
      account_holder_name?: string
    }>
    bids: Array<{
      id: number
      status: string
      vendor_id?: string
      bid_amount: number
      created_at: string
      listing_id: number
      updated_at: string
      instant_win: boolean
      vendor_profile?: any
    }>
    agreements: Array<{
      id: string
      created_at: string
      listing_id: number
      updated_at: string
      terms_accepted: boolean
      privacy_accepted: boolean
      whatsapp_consent: boolean
    }>
  }
  error?: string
  message?: string
}

// Initial mock data as fallback
const initialDeviceInfo: DeviceInfo = {
  id: 'VER001',
  device: 'Loading...',
  model: 'Loading device details...',
  seller: 'Loading...',
  phone: 'Loading...',
  location: 'Loading...',
  askingPrice: 0,
  vendorBid: 0,
  timeSlot: 'Loading...'
}

const verificationSteps: VerificationStep[] = [
  {
    id: 1,
    title: 'Customer Identity Verification',
    description: 'Verify customer identity with ID card',
    icon: IdentificationIcon,
    status: 'pending',
    required: true,
    estimatedTime: '2 min',
    details: ['Check ID card', 'Verify name matches', 'Upload ID photo']
  },
  {
    id: 2,
    title: 'IMEI Verification',
    description: 'Verify device authenticity and check stolen database',
    icon: QrCodeIcon,
    status: 'pending',
    required: true,
    estimatedTime: '2 min',
    details: ['Scan IMEI barcode', 'Check stolen device registry', 'Verify with original box']
  },
  {
    id: 3,
    title: 'Physical Inspection',
    description: 'Assess external condition and damage',
    icon: DevicePhoneMobileIcon,
    status: 'pending',
    required: true,
    estimatedTime: '3 min',
    details: ['Screen condition', 'Body scratches/dents', 'Button functionality', 'Port inspection']
  },
  {
    id: 4,
    title: 'Battery Health Check',
    description: 'Test battery condition and performance',
    icon: Battery0Icon,
    status: 'pending',
    required: true,
    estimatedTime: '3 min',
    details: ['Battery percentage', 'Battery health status', 'Charging test', 'Battery cycle count']
  },
  {
    id: 5,
    title: 'Screen & Display Test',
    description: 'Test display quality and touch response',
    icon: SparklesIcon,
    status: 'pending',
    required: true,
    estimatedTime: '2 min',
    details: ['Dead pixels check', 'Touch sensitivity', 'Screen brightness', 'Color accuracy']
  },
  {
    id: 6,
    title: 'Camera Test',
    description: 'Test all cameras and image quality',
    icon: CameraIcon,
    status: 'pending',
    required: true,
    estimatedTime: '3 min',
    details: ['Front camera', 'Rear camera(s)', 'Flash functionality', 'Video recording']
  },
  {
    id: 7,
    title: 'Audio Test',
    description: 'Test speakers, microphone, and audio quality',
    icon: SpeakerWaveIcon,
    status: 'pending',
    required: true,
    estimatedTime: '2 min',
    details: ['Speaker output', 'Microphone clarity', 'Headphone jack', 'Volume buttons']
  },
  {
    id: 8,
    title: 'Connectivity Test',
    description: 'Test WiFi, Bluetooth, and cellular connectivity',
    icon: WifiIcon,
    status: 'pending',
    required: true,
    estimatedTime: '3 min',
    details: ['WiFi connection', 'Bluetooth pairing', 'Cellular signal', 'GPS functionality']
  },
  {
    id: 9,
    title: 'Software & Performance',
    description: 'Check OS version and performance',
    icon: ShieldCheckIcon,
    status: 'pending',
    required: true,
    estimatedTime: '2 min',
    details: ['OS version', 'Performance test', 'Factory reset check', 'Account removal']
  },
  {
    id: 10,
    title: 'Photo Documentation',
    description: 'Capture comprehensive device photos',
    icon: PhotoIcon,
    status: 'pending',
    required: true,
    estimatedTime: '4 min',
    details: ['360° device photos', 'Screen condition', 'Defect documentation', 'Serial number']
  }
]

export default function AgentVerification() {
  const searchParams = useSearchParams()
  const taskId = searchParams.get('taskId')
  
  // State management
  const [currentStep, setCurrentStep] = useState(1)
  const [steps, setSteps] = useState(verificationSteps)
  const [verificationStarted, setVerificationStarted] = useState(false)
  const [deductions, setDeductions] = useState<Deduction[]>([])
  const [batteryHealth, setBatteryHealth] = useState<number | null>(null)
  const [verificationComplete, setVerificationComplete] = useState(false)
  const [showDeductionsStep, setShowDeductionsStep] = useState(false)
  const [showDeductionForm, setShowDeductionForm] = useState(false)
  const [newDeduction, setNewDeduction] = useState({
    category: '',
    issue: '',
    amount: 0,
    severity: 'minor' as 'minor' | 'major' | 'critical'
  })
  
  // Device info state
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(initialDeviceInfo)
  const [isLoadingDevice, setIsLoadingDevice] = useState(true)
  const [deviceLoadError, setDeviceLoadError] = useState<string | null>(null)

  // Fetch listing data when component mounts
  useEffect(() => {
    const fetchListingData = async () => {
      if (!taskId) {
        setDeviceLoadError('No task ID provided')
        setIsLoadingDevice(false)
        return
      }

      setIsLoadingDevice(true)
      setDeviceLoadError(null)

      try {
        console.log('🔍 [AGENT-VERIFICATION] Fetching listing data for task ID:', taskId)
        
        const response = await sellikoClient.getListingById(taskId, {
          include_images: true,
          include_bids: true,
          include_user_details: true
        }) as ListingResponse

        if (response.success && response.listing) {
          const listing = response.listing
          console.log('✅ [AGENT-VERIFICATION] Listing data fetched successfully:', listing)
          
          // Get the main device (first one)
          const device = listing.devices[0]
          
          // Get client address (type: "client")
          const clientAddress = listing.addresses.find(addr => addr.type === 'client') || listing.addresses[0]
          
          // Get pickup address (type: "pickup") 
          const pickupAddress = listing.addresses.find(addr => addr.type === 'pickup')
          
          // Get the winning bid amount
          const winningBid = listing.bids.find(bid => bid.status === 'won')
          const bidAmount = winningBid ? winningBid.bid_amount : listing.asking_price
          
          // Collect all available device images
          const deviceImages: string[] = []
          if (device.front_image_url) deviceImages.push(device.front_image_url)
          if (device.back_image_url) deviceImages.push(device.back_image_url)
          if (device.top_image_url) deviceImages.push(device.top_image_url)
          if (device.bottom_image_url) deviceImages.push(device.bottom_image_url)
          
          // Transform API response to DeviceInfo format
          const transformedDeviceInfo: DeviceInfo = {
            id: `VER${listing.id.toString().padStart(3, '0')}`,
            device: `${device.brand} ${device.model}`,
            model: `${device.storage} ${device.color}`.trim(),
            seller: clientAddress.contact_name || 'Unknown Seller',
            phone: clientAddress.mobile_number || 'Not provided',
            location: `${clientAddress.city}, ${clientAddress.state}`,
            fullAddress: clientAddress.address,
            askingPrice: listing.asking_price,
            vendorBid: bidAmount,
            timeSlot: pickupAddress?.pickup_time ? `${pickupAddress.pickup_time} slot` : 'To be confirmed',
            imei1: device.imei1,
            imei2: device.imei2,
            condition: device.condition,
            storage: device.storage,
            color: device.color,
            images: deviceImages,
            description: device.description,
            hasBill: device.has_bill,
            purchaseDate: device.purchase_date,
            purchasePrice: device.purchase_price,
            batteryHealth: device.battery_health,
            warrantyStatus: device.warranty_status,
            warrantyExpiry: device.warranty_expiry,
            warrantyType: device.warranty_type,
            email: clientAddress.email,
            pincode: clientAddress.pincode,
            bankName: clientAddress.bank_name,
            ifscCode: clientAddress.ifsc_code,
            accountNumber: clientAddress.account_number,
            accountHolderName: clientAddress.account_holder_name,
            pickupAddress: pickupAddress?.address || clientAddress.address,
            pickupPincode: pickupAddress?.pincode || clientAddress.pincode,
            pickupTime: pickupAddress?.pickup_time || 'To be confirmed'
          }

          setDeviceInfo(transformedDeviceInfo)
          toast.success('Device details loaded successfully')
        } else {
          console.error('❌ [AGENT-VERIFICATION] Failed to fetch listing:', response.error)
          setDeviceLoadError(response.error || 'Failed to load device details')
          toast.error('Failed to load device details')
        }
      } catch (error) {
        console.error('💥 [AGENT-VERIFICATION] Error fetching listing:', error)
        setDeviceLoadError('Network error occurred')
        toast.error('Network error while loading device details')
      } finally {
        setIsLoadingDevice(false)
      }
    }

    fetchListingData()
  }, [taskId])

  const startVerification = () => {
    setVerificationStarted(true)
    updateStepStatus(1, 'in_progress')
  }

  const updateStepStatus = (stepId: number, status: 'pending' | 'in_progress' | 'completed' | 'failed') => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status } : step
    ))
  }

  const completeStep = (stepId: number, success: boolean = true) => {
    updateStepStatus(stepId, success ? 'completed' : 'failed')
    if (success && stepId < steps.length) {
      setCurrentStep(stepId + 1)
      updateStepStatus(stepId + 1, 'in_progress')
    } else if (success && stepId === steps.length) {
      // After all verification steps, show deductions step
      setShowDeductionsStep(true)
    }
  }

  const completeDeductionsStep = () => {
    setShowDeductionsStep(false)
    setVerificationComplete(true)
  }

  const addDeduction = () => {
    if (newDeduction.category && newDeduction.issue && newDeduction.amount > 0) {
      const deduction: Deduction = {
        id: Date.now().toString(),
        ...newDeduction
      }
      setDeductions([...deductions, deduction])
      setNewDeduction({ category: '', issue: '', amount: 0, severity: 'minor' })
      setShowDeductionForm(false)
    }
  }

  const removeDeduction = (id: string) => {
    setDeductions(deductions.filter(d => d.id !== id))
  }

  const totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0)
  const finalOffer = deviceInfo.vendorBid - totalDeductions

  const getStepIcon = (step: VerificationStep) => {
    const IconComponent = step.icon
    if (step.status === 'completed') {
      return <CheckCircleSolid className="w-6 h-6 text-green-600" />
    } else if (step.status === 'failed') {
      return <XMarkIcon className="w-6 h-6 text-red-600" />
    } else if (step.status === 'in_progress') {
      return <ClockIcon className="w-6 h-6 text-blue-600 animate-pulse" />
    } else {
      return <IconComponent className="w-6 h-6 text-gray-400" />
    }
  }

  const getStepColor = (step: VerificationStep) => {
    switch (step.status) {
      case 'completed': return 'border-green-500 bg-green-50'
      case 'failed': return 'border-red-500 bg-red-50'
      case 'in_progress': return 'border-blue-500 bg-blue-50'
      default: return 'border-gray-200 bg-white'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'minor': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'major': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const completedSteps = steps.filter(step => step.status === 'completed').length
  const progressPercentage = (completedSteps / steps.length) * 100

  // Deductions Input Step
  if (showDeductionsStep) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900">Assessment & Deductions</h1>
              <span className="text-sm text-gray-600">Final Step</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-orange-600 h-2 rounded-full" style={{ width: '90%' }}></div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Deductions Form */}
            <div className="lg:col-span-2">
              <div className="card-mobile bg-white/80 backdrop-blur-sm p-6">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <CurrencyRupeeIcon className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Enter Deductions</h2>
                    <p className="text-gray-600">Add any deductions based on device condition found during verification</p>
                  </div>
                </div>

                {/* Device Condition Summary */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-green-900 mb-2">Verification Summary</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-green-700">Steps Completed:</span>
                      <span className="ml-2 font-medium">{completedSteps}/{steps.length}</span>
                    </div>
                    {batteryHealth && (
                      <div>
                        <span className="text-green-700">Battery Health:</span>
                        <span className="ml-2 font-medium">{batteryHealth}%</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Add Deduction Button */}
                <div className="mb-6">
                  <button
                    onClick={() => setShowDeductionForm(!showDeductionForm)}
                    className="inline-flex items-center px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                  >
                    <CurrencyRupeeIcon className="w-5 h-5 mr-2" />
                    {showDeductionForm ? 'Cancel' : 'Add Deduction'}
                  </button>
                </div>

                {/* Deduction Form */}
                {showDeductionForm && (
                  <div className="space-y-4 mb-6 p-6 bg-gray-50 rounded-xl border">
                    <h4 className="font-semibold text-gray-900">New Deduction</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                        <select
                          value={newDeduction.category}
                          onChange={(e) => setNewDeduction({ ...newDeduction, category: e.target.value })}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                          <option value="">Select Category</option>
                          <option value="Screen">Screen Issues</option>
                          <option value="Battery">Battery Problems</option>
                          <option value="Body">Physical Damage</option>
                          <option value="Camera">Camera Issues</option>
                          <option value="Audio">Audio Problems</option>
                          <option value="Connectivity">Connectivity Issues</option>
                          <option value="Software">Software Problems</option>
                          <option value="Accessories">Missing Accessories</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
                        <select
                          value={newDeduction.severity}
                          onChange={(e) => setNewDeduction({ ...newDeduction, severity: e.target.value as 'minor' | 'major' | 'critical' })}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                          <option value="minor">Minor</option>
                          <option value="major">Major</option>
                          <option value="critical">Critical</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Issue Description</label>
                      <textarea
                        value={newDeduction.issue}
                        onChange={(e) => setNewDeduction({ ...newDeduction, issue: e.target.value })}
                        placeholder="Describe the specific issue found..."
                        rows={3}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Deduction Amount (₹)</label>
                      <input
                        type="number"
                        value={newDeduction.amount}
                        onChange={(e) => setNewDeduction({ ...newDeduction, amount: parseInt(e.target.value) || 0 })}
                        placeholder="Enter deduction amount"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        min="0"
                      />
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={addDeduction}
                        disabled={!newDeduction.category || !newDeduction.issue || newDeduction.amount <= 0}
                        className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Add Deduction
                      </button>
                      <button
                        onClick={() => setShowDeductionForm(false)}
                        className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Current Deductions List */}
                <div className="space-y-3 mb-8">
                  <h4 className="font-semibold text-gray-900">Applied Deductions</h4>
                  {deductions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <CurrencyRupeeIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No deductions applied</p>
                      <p className="text-sm">Device is in excellent condition</p>
                    </div>
                  ) : (
                    deductions.map((deduction) => (
                      <div key={deduction.id} className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="font-medium text-red-900">{deduction.category}</span>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(deduction.severity)}`}>
                              {deduction.severity.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-red-800 text-sm">{deduction.issue}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="font-bold text-red-900 text-lg">₹{deduction.amount.toLocaleString()}</span>
                          <button
                            onClick={() => removeDeduction(deduction.id)}
                            className="text-red-600 hover:text-red-800 p-1"
                          >
                            <XMarkIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <button
                    onClick={completeDeductionsStep}
                    className="flex-1 px-6 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-semibold text-lg"
                  >
                    Complete Assessment
                  </button>
                  <button
                    onClick={() => setShowDeductionsStep(false)}
                    className="px-6 py-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
                  >
                    Back to Verification
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar - Price Summary */}
            <div className="space-y-6">
              {/* Device Info */}
              <div className="card-mobile bg-white/80 backdrop-blur-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Device Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Device:</span>
                    <span className="font-medium">{deviceInfo.device}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Seller:</span>
                    <span className="font-medium">{deviceInfo.seller}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Original Bid:</span>
                    <span className="font-semibold text-green-600">₹{deviceInfo.vendorBid.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Price Calculation */}
              <div className="card-mobile bg-white/80 backdrop-blur-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Final Price Calculation</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-lg">
                    <span className="text-gray-700">Original Bid:</span>
                    <span className="font-semibold">₹{deviceInfo.vendorBid.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>Total Deductions:</span>
                    <span className="font-semibold">-₹{totalDeductions.toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between text-xl font-bold">
                    <span className="text-gray-900">Final Offer:</span>
                    <span className="text-green-600">₹{finalOffer.toLocaleString()}</span>
                  </div>
                  {batteryHealth && (
                    <div className="text-sm text-gray-500 pt-2 border-t">
                      Battery Health: {batteryHealth}%
                    </div>
                  )}
                </div>
              </div>

              {/* Verification Status */}
              <div className="card-mobile bg-white/80 backdrop-blur-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Verification Status</h3>
                <div className="space-y-2">
                  {steps.map((step) => (
                    <div key={step.id} className="flex items-center space-x-3 text-sm">
                      {getStepIcon(step)}
                      <span className={`${step.status === 'completed' ? 'text-green-700' : step.status === 'failed' ? 'text-red-700' : 'text-gray-600'}`}>
                        {step.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (verificationComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="card-mobile bg-white/80 backdrop-blur-sm p-8 text-center">
            <CheckCircleSolid className="w-16 h-16 text-green-600 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Verification Complete!</h2>
            <p className="text-gray-600 mb-8">Device verification has been completed successfully.</p>
            
            {/* Final Offer Summary */}
            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Final Offer Summary</h3>
              <div className="space-y-3 text-left">
                <div className="flex justify-between">
                  <span className="text-gray-600">Original Bid:</span>
                  <span className="font-semibold">₹{deviceInfo.vendorBid.toLocaleString()}</span>
                </div>
                {deductions.map((deduction) => (
                  <div key={deduction.id} className="flex justify-between text-red-600">
                    <span>{deduction.issue}:</span>
                    <span>-₹{deduction.amount.toLocaleString()}</span>
                  </div>
                ))}
                <div className="border-t pt-3 flex justify-between text-lg font-bold">
                  <span>Final Offer:</span>
                  <span className="text-green-600">₹{finalOffer.toLocaleString()}</span>
                </div>
                {batteryHealth && (
                  <div className="text-sm text-gray-500">
                    Battery Health: {batteryHealth}%
                  </div>
                )}
              </div>
            </div>

            <div className="flex space-x-4 justify-center">
              <button className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium">
                Send Offer to Customer
              </button>
              <Link
                href="/agent"
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!verificationStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Device Verification</h1>
                <p className="text-gray-600 mt-1">Complete the comprehensive device verification process</p>
              </div>
              <Link
                href="/agent"
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← Back to Dashboard
              </Link>
            </div>
          </div>

          {/* Device Info Card */}
          <div className="card-mobile bg-white/80 backdrop-blur-sm p-6 mb-8">
            {isLoadingDevice ? (
              <div className="flex items-center justify-center py-8">
                <Icons.spinner className="h-8 w-8 animate-spin text-purple-600 mr-3" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Loading Device Details...</h3>
                  <p className="text-gray-600">Task ID: {taskId}</p>
                </div>
              </div>
            ) : deviceLoadError ? (
              <div className="text-center py-8">
                <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Device Details</h3>
                <p className="text-red-600 mb-4">{deviceLoadError}</p>
                <p className="text-gray-600 mb-4">Task ID: {taskId}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : (
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center">
                    {deviceInfo.images && deviceInfo.images.length > 0 ? (
                      <img 
                        src={deviceInfo.images[0]} 
                        alt={deviceInfo.device}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                          target.nextElementSibling?.classList.remove('hidden')
                        }}
                      />
                    ) : null}
                    <DevicePhoneMobileIcon className={`w-8 h-8 text-gray-600 ${deviceInfo.images && deviceInfo.images.length > 0 ? 'hidden' : ''}`} />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{deviceInfo.device}</h2>
                    <p className="text-gray-600">{deviceInfo.model}</p>
                    <div className="flex items-center mt-2 text-sm text-gray-500">
                      <MapPinIcon className="w-4 h-4 mr-1" />
                      {deviceInfo.location}
                    </div>
                    {deviceInfo.condition && (
                      <div className="mt-1">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Condition: {deviceInfo.condition}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">₹{deviceInfo.vendorBid.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">Vendor Bid</div>
                  <div className="text-xs text-gray-400 mt-1">Ask: ₹{deviceInfo.askingPrice.toLocaleString()}</div>
                </div>
              </div>
            )}
            
            {!isLoadingDevice && !deviceLoadError && (
              <div className="border-t mt-4 pt-4">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <span className="text-gray-600">Seller:</span>
                    <span className="ml-2 font-medium">{deviceInfo.seller}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Phone:</span>
                    <span className="ml-2 font-medium">{deviceInfo.phone}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <span className="ml-2 font-medium">{deviceInfo.email || 'Not provided'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Task ID:</span>
                    <span className="ml-2 font-medium">{taskId}</span>
                  </div>
                </div>

                {/* Device Technical Details */}
                {(deviceInfo.imei1 || deviceInfo.description) && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-blue-900 mb-2">Device Details</h4>
                    <div className="space-y-2 text-sm">
                      {deviceInfo.imei1 && (
                        <div>
                          <span className="text-blue-700">IMEI 1:</span>
                          <span className="ml-2 font-mono">{deviceInfo.imei1}</span>
                          {deviceInfo.imei2 && (
                            <span className="ml-4 text-blue-700">IMEI 2: <span className="font-mono">{deviceInfo.imei2}</span></span>
                          )}
                        </div>
                      )}
                      {deviceInfo.description && (
                        <div>
                          <span className="text-blue-700">Description:</span>
                          <p className="ml-2 text-blue-800">{deviceInfo.description}</p>
                        </div>
                      )}
                      {deviceInfo.batteryHealth && (
                        <div>
                          <span className="text-blue-700">Battery Health:</span>
                          <span className="ml-2 font-medium">{deviceInfo.batteryHealth}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Purchase & Warranty Info */}
                {(deviceInfo.hasBill || deviceInfo.warrantyStatus) && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-green-900 mb-2">Purchase & Warranty</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {deviceInfo.hasBill && (
                        <div>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ✓ Has Original Bill
                          </span>
                        </div>
                      )}
                      {deviceInfo.warrantyStatus && (
                        <div>
                          <span className="text-green-700">Warranty:</span>
                          <span className={`ml-2 font-medium ${deviceInfo.warrantyStatus === 'active' ? 'text-green-600' : 'text-orange-600'}`}>
                            {deviceInfo.warrantyStatus}
                          </span>
                        </div>
                      )}
                      {deviceInfo.purchaseDate && (
                        <div>
                          <span className="text-green-700">Purchase Date:</span>
                          <span className="ml-2 font-medium">{new Date(deviceInfo.purchaseDate).toLocaleDateString()}</span>
                        </div>
                      )}
                      {deviceInfo.warrantyExpiry && (
                        <div>
                          <span className="text-green-700">Warranty Expires:</span>
                          <span className="ml-2 font-medium">{new Date(deviceInfo.warrantyExpiry).toLocaleDateString()}</span>
                        </div>
                      )}
                      {deviceInfo.purchasePrice && (
                        <div className="col-span-2">
                          <span className="text-green-700">Original Purchase Price:</span>
                          <span className="ml-2 font-medium text-lg">₹{deviceInfo.purchasePrice.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Pickup Information */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-purple-900 mb-2">Pickup Details</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-purple-700">Time Slot:</span>
                      <span className="ml-2 font-medium">{deviceInfo.timeSlot}</span>
                    </div>
                    <div>
                      <span className="text-purple-700">Address:</span>
                      <p className="ml-2 text-purple-800">{deviceInfo.fullAddress}</p>
                    </div>
                    <div>
                      <span className="text-purple-700">City & PIN:</span>
                      <span className="ml-2 font-medium">{deviceInfo.location} - {deviceInfo.pincode}</span>
                    </div>
                  </div>
                </div>

                {/* Bank Details */}
                {(deviceInfo.bankName || deviceInfo.accountNumber) && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-900 mb-2">Payment Details</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {deviceInfo.bankName && (
                        <div>
                          <span className="text-yellow-700">Bank:</span>
                          <span className="ml-2 font-medium">{deviceInfo.bankName}</span>
                        </div>
                      )}
                      {deviceInfo.ifscCode && (
                        <div>
                          <span className="text-yellow-700">IFSC:</span>
                          <span className="ml-2 font-mono">{deviceInfo.ifscCode}</span>
                        </div>
                      )}
                      {deviceInfo.accountHolderName && (
                        <div>
                          <span className="text-yellow-700">Account Holder:</span>
                          <span className="ml-2 font-medium">{deviceInfo.accountHolderName}</span>
                        </div>
                      )}
                      {deviceInfo.accountNumber && (
                        <div>
                          <span className="text-yellow-700">Account:</span>
                          <span className="ml-2 font-mono">***{deviceInfo.accountNumber.slice(-4)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Verification Steps Preview */}
          <div className="card-mobile bg-white/80 backdrop-blur-sm p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification Checklist</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {steps.map((step) => (
                <div key={step.id} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
                  {getStepIcon(step)}
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{step.title}</h4>
                    <p className="text-sm text-gray-600">{step.estimatedTime}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Start Button */}
          <div className="text-center">
            <button
              onClick={startVerification}
              className="inline-flex items-center px-8 py-4 bg-purple-600 text-white text-lg font-semibold rounded-xl hover:bg-purple-700 transition-colors shadow-lg"
            >
              <PlayIcon className="w-6 h-6 mr-3" />
              Start Verification Process
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Device Verification in Progress</h1>
            <span className="text-sm text-gray-600">Step {currentStep} of {steps.length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Current Step */}
          <div className="lg:col-span-2">
            <div className="card-mobile bg-white/80 backdrop-blur-sm p-6">
              {currentStep <= steps.length && (
                <div>
                  <div className="flex items-center space-x-4 mb-6">
                    {getStepIcon(steps[currentStep - 1])}
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">{steps[currentStep - 1].title}</h2>
                      <p className="text-gray-600">{steps[currentStep - 1].description}</p>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    {steps[currentStep - 1].details?.map((detail, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <CheckCircleIcon className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-700">{detail}</span>
                      </div>
                    ))}
                  </div>

                  {/* Battery Health Input */}
                  {currentStep === 4 && (
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Battery Health Percentage
                      </label>
                      <input
                        type="number"
                        value={batteryHealth || ''}
                        onChange={(e) => setBatteryHealth(parseInt(e.target.value))}
                        placeholder="Enter battery health %"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        min="0"
                        max="100"
                      />
                    </div>
                  )}

                  <div className="flex space-x-4">
                    <button
                      onClick={() => completeStep(currentStep)}
                      className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      Mark as Complete
                    </button>
                    <button
                      onClick={() => completeStep(currentStep, false)}
                      className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                    >
                      Mark as Failed
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Steps Overview */}
            <div className="card-mobile bg-white/80 backdrop-blur-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Verification Progress</h3>
              <div className="space-y-3">
                {steps.map((step) => (
                  <div 
                    key={step.id} 
                    className={`flex items-center space-x-3 p-2 rounded-lg ${getStepColor(step)}`}
                  >
                    {getStepIcon(step)}
                    <span className={`text-sm font-medium ${step.status === 'completed' ? 'text-green-700' : step.status === 'failed' ? 'text-red-700' : step.status === 'in_progress' ? 'text-blue-700' : 'text-gray-600'}`}>
                      {step.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Deductions */}
            <div className="card-mobile bg-white/80 backdrop-blur-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Deductions</h3>
                <button
                  onClick={() => setShowDeductionForm(!showDeductionForm)}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  {showDeductionForm ? 'Cancel' : 'Add Deduction'}
                </button>
              </div>

              {showDeductionForm && (
                <div className="space-y-3 mb-4 p-4 bg-gray-50 rounded-lg">
                  <select
                    value={newDeduction.category}
                    onChange={(e) => setNewDeduction({ ...newDeduction, category: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select Category</option>
                    <option value="Screen">Screen Issues</option>
                    <option value="Battery">Battery Problems</option>
                    <option value="Body">Physical Damage</option>
                    <option value="Camera">Camera Issues</option>
                    <option value="Audio">Audio Problems</option>
                    <option value="Connectivity">Connectivity Issues</option>
                    <option value="Software">Software Problems</option>
                  </select>
                  <input
                    type="text"
                    value={newDeduction.issue}
                    onChange={(e) => setNewDeduction({ ...newDeduction, issue: e.target.value })}
                    placeholder="Describe the issue"
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                  />
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={newDeduction.amount}
                      onChange={(e) => setNewDeduction({ ...newDeduction, amount: parseInt(e.target.value) || 0 })}
                      placeholder="Amount"
                      className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                    />
                    <select
                      value={newDeduction.severity}
                      onChange={(e) => setNewDeduction({ ...newDeduction, severity: e.target.value as 'minor' | 'major' | 'critical' })}
                      className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="minor">Minor</option>
                      <option value="major">Major</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  <button
                    onClick={addDeduction}
                    className="w-full py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                  >
                    Add Deduction
                  </button>
                </div>
              )}

              <div className="space-y-2">
                {deductions.map((deduction) => (
                  <div key={deduction.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                      <div className="font-medium text-red-900">{deduction.issue}</div>
                      <div className="text-sm text-red-600">{deduction.category} • {deduction.severity}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-red-900">₹{deduction.amount.toLocaleString()}</span>
                      <button
                        onClick={() => removeDeduction(deduction.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total Deductions:</span>
                  <span className="text-red-600">₹{totalDeductions.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-green-600 mt-2">
                  <span>Final Offer:</span>
                  <span>₹{finalOffer.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 