'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
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
  PlayIcon,
  ComputerDesktopIcon,
  PhoneIcon,
  BoltIcon,
  EyeIcon,
  SignalIcon,
  LockClosedIcon,
  CpuChipIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  TruckIcon
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
  category: string
  type: 'image' | 'bool' | 'text'
  value?: any // For storing the verification result
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
  status?: string
}

interface ClientConfig {
  id: number
  item: string
  category: string
  type: 'image' | 'bool' | 'text'
  created_at: string
  updated_at: string
}

interface ClientConfigsResponse {
  success: boolean
  configs: ClientConfig[]
  error?: string
}

interface StartVerificationResponse {
  success: boolean
  error?: string
  message?: string
}

// Random icon mapping for different categories
const getCategoryIcon = (category: string, type: string) => {
  const iconMap = {
    'device_condition': [CameraIcon, DevicePhoneMobileIcon, EyeIcon, PhotoIcon],
    'functionality': [BoltIcon, Battery0Icon, SpeakerWaveIcon, PhoneIcon],
    'documentation': [DocumentCheckIcon, ClipboardDocumentListIcon, QrCodeIcon, IdentificationIcon],
    'specifications': [CpuChipIcon, ComputerDesktopIcon, SparklesIcon, SignalIcon],
    'security': [ShieldCheckIcon, LockClosedIcon, ShieldCheckIcon, LockClosedIcon]
  }
  
  // Get icons for category, fallback to device_condition
  const icons = iconMap[category as keyof typeof iconMap] || iconMap.device_condition
  
  // Use type to influence icon selection
  if (type === 'image') return icons[0] || PhotoIcon
  if (type === 'bool') return icons[1] || CheckCircleIcon
  if (type === 'text') return icons[2] || ClipboardDocumentListIcon
  
  // Random selection as fallback
  return icons[Math.floor(Math.random() * icons.length)] || DevicePhoneMobileIcon
}

// Transform client configs to verification steps
const transformConfigsToSteps = (configs: ClientConfig[]): VerificationStep[] => {
  if (!configs || configs.length === 0) return []
  
  return configs.map((config, index) => ({
    id: config.id,
    title: config.item,
    description: `${config.category.replace('_', ' ')} verification step`,
    icon: getCategoryIcon(config.category, config.type),
    status: 'pending' as const,
    required: true,
    estimatedTime: config.type === 'image' ? '2 min' : '1 min',
    category: config.category,
    type: config.type,
    value: null
  }))
}

// Generate random test data for verification steps
const generateRandomTestData = (steps: VerificationStep[]): VerificationStep[] => {
  const randomTextValues = [
    'Test value 1', 'Sample data', 'Good condition', 'Working fine', 'No issues found',
    'Minor scratches', 'Excellent', 'Battery 85%', 'All functions working', 'Clean device'
  ]

  // Create a simple mock file object for image steps
  const createMockFile = (filename: string) => {
    const mockFile = new File(['mock image data'], filename, { type: 'image/jpeg' })
    return mockFile
  }

  return steps.map((step) => {
    let randomValue
    
    switch (step.type) {
      case 'image':
        randomValue = createMockFile(`${step.title.toLowerCase().replace(/\s+/g, '_')}_test.jpg`)
        break
      case 'bool':
        randomValue = Math.random() > 0.3 // 70% chance of true (pass)
        break
      case 'text':
        randomValue = randomTextValues[Math.floor(Math.random() * randomTextValues.length)]
        break
      default:
        randomValue = null
    }

    return {
      ...step,
      value: randomValue
    }
  })
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
    highest_bid: number | null // ID reference to the highest bid in bids array
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
    all_bids?: Array<{
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
    highest_bid_details?: {
      id: number
      status: string
      vendor_id?: string
      bid_amount: number
      created_at: string
      listing_id: number
      updated_at: string
      instant_win: boolean
    }
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

export default function AgentVerification() {
  const searchParams = useSearchParams()
  const taskId = searchParams.get('taskId')
  const router = useRouter()
  
  // State management
  const [currentStep, setCurrentStep] = useState(1)
  const [steps, setSteps] = useState<VerificationStep[]>([])
  const [currentBatch, setCurrentBatch] = useState(0)
  const [verificationStarted, setVerificationStarted] = useState(false)
  const [verificationComplete, setVerificationComplete] = useState(false)
  const [showVerificationNotes, setShowVerificationNotes] = useState(false)
  const [verificationNotes, setVerificationNotes] = useState('')
  const [deductions, setDeductions] = useState<Deduction[]>([])
  const [batteryHealth, setBatteryHealth] = useState<number | null>(null)
  const [showDeductionForm, setShowDeductionForm] = useState(false)
  const [isSubmittingVerification, setIsSubmittingVerification] = useState(false)
  const [showDeductionsStep, setShowDeductionsStep] = useState(false)
  const [newDeduction, setNewDeduction] = useState({
    category: '',
    issue: '',
    amount: 0,
    severity: 'minor' as 'minor' | 'major' | 'critical'
  })
  const [isStartingVerification, setIsStartingVerification] = useState(false)
  const [startVerificationError, setStartVerificationError] = useState<string | null>(null)

  // Constants for batch processing
  const STEPS_PER_BATCH = 5

  // Calculate batch information
  const totalBatches = Math.ceil(steps.length / STEPS_PER_BATCH)
  const currentBatchSteps = steps.slice(
    currentBatch * STEPS_PER_BATCH,
    (currentBatch + 1) * STEPS_PER_BATCH
  )

  // Device info state
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(initialDeviceInfo)
  const [isLoadingDevice, setIsLoadingDevice] = useState(true)
  const [deviceLoadError, setDeviceLoadError] = useState<string | null>(null)

  // Client configs checklist state
  const [clientConfigs, setClientConfigs] = useState<ClientConfig[]>([])
  const [isLoadingConfigs, setIsLoadingConfigs] = useState(true)
  const [configsError, setConfigsError] = useState<string | null>(null)

  // Fetch client configs checklist when component mounts
  useEffect(() => {
    const fetchClientConfigs = async () => {
      setIsLoadingConfigs(true)
      setConfigsError(null)

      try {
        console.log('⚙️ [AGENT-VERIFICATION] Fetching client configs checklist...')
        
        const response = await sellikoClient.getClientConfigsChecklist() as ClientConfigsResponse

        if (response.success && response.configs) {
          console.log('✅ [AGENT-VERIFICATION] Client configs loaded successfully:', response.configs)
          setClientConfigs(response.configs)
          
          // Transform configs to verification steps
          const verificationSteps = transformConfigsToSteps(response.configs)
          setSteps(verificationSteps)

          // Generate random test data for verification steps
          const randomTestData = generateRandomTestData(verificationSteps)
          setSteps(randomTestData)

          // Add random verification notes for testing
          const testNotes = [
            'Device is in good overall condition. All major functions working properly.',
            'Minor cosmetic wear visible but does not affect functionality. Screen is clear and responsive.',
            'Battery health is acceptable. Device has been well maintained by the owner.',
            'Some signs of normal usage but no major issues found during verification process.',
            'Excellent condition device. Owner has taken good care of it. All features tested and working.'
          ]
          setVerificationNotes(testNotes[Math.floor(Math.random() * testNotes.length)])
        } else {
          console.error('❌ [AGENT-VERIFICATION] Failed to fetch client configs:', response.error)
          setConfigsError(response.error || 'Failed to load client configurations')
        }
      } catch (error) {
        console.error('💥 [AGENT-VERIFICATION] Error fetching client configs:', error)
        setConfigsError('Network error occurred while loading configurations')
      } finally {
        setIsLoadingConfigs(false)
      }
    }

    fetchClientConfigs()
  }, [])

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
          const winningBid = listing.highest_bid_details || 
                            (listing.all_bids || []).find((bid: any) => bid.status === 'won') ||
                            (listing.bids || []).find((bid: any) => bid.status === 'won')
          
          // Get the highest bid amount from the winning bid, or use the highest bid from all bids, or fallback to asking price
          const bidAmount = winningBid?.bid_amount || 
                          Math.max(...(listing.all_bids || []).map(bid => bid.bid_amount), 0) ||
                          Math.max(...(listing.bids || []).map(bid => bid.bid_amount), 0) ||
                          listing.asking_price
          
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
            pickupTime: pickupAddress?.pickup_time || 'To be confirmed',
            status: listing.status
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

  const startVerification = async () => {
    if (!taskId) {
      toast.error('Task ID is missing')
      return
    }

    setIsStartingVerification(true)
    setStartVerificationError(null)

    try {
      console.log('🚀 [VERIFICATION] Starting verification process for listing:', taskId)
      
      // Call the start-verification API
      const result = await sellikoClient.startVerification(taskId) as StartVerificationResponse
      
      if (result.success) {
        console.log('✅ [VERIFICATION] Start verification API call successful')
        toast.success('Verification process started successfully')
        
        // Now show the verification form
        setVerificationStarted(true)
        setCurrentBatch(0)
        setCurrentStep(0)
        
        // Update all steps to pending status
        setSteps(prevSteps => 
          prevSteps.map(step => ({ ...step, status: 'pending' }))
        )
      } else {
        console.error('❌ [VERIFICATION] Start verification API call failed:', result.error)
        setStartVerificationError(result.error || 'Failed to start verification process')
        toast.error(result.error || 'Failed to start verification process')
      }
    } catch (error) {
      console.error('💥 [VERIFICATION] Start verification error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Network error occurred'
      setStartVerificationError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsStartingVerification(false)
    }
  }

  const updateStepStatus = (stepId: number, status: 'pending' | 'in_progress' | 'completed' | 'failed') => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status } : step
    ))
  }

  const completeCurrentBatch = () => {
    const batchSteps = currentBatchSteps
    const allBatchStepsHaveValues = batchSteps.every(step => {
      switch (step.type) {
        case 'image':
          return step.value instanceof File
        case 'bool':
          return step.value !== null && step.value !== undefined
        case 'text':
          return step.value && step.value.trim().length > 0
        default:
          return true
      }
    })

    if (!allBatchStepsHaveValues) {
      return false // Cannot complete batch
    }

    // Mark all steps in current batch as completed or failed based on their values
    setSteps(prev => prev.map(step => {
      if (batchSteps.some(batchStep => batchStep.id === step.id)) {
        // Determine status based on value for bool type
        if (step.type === 'bool' && step.value === false) {
          return { ...step, status: 'failed' }
        } else if (step.value !== null && step.value !== undefined) {
          return { ...step, status: 'completed' }
        }
      }
      return step
    }))

    // Move to next batch or complete verification
    if (currentBatch < totalBatches - 1) {
      setCurrentBatch(currentBatch + 1)
      // Set next batch steps to in_progress
      const nextBatchSteps = steps.slice((currentBatch + 1) * STEPS_PER_BATCH, (currentBatch + 2) * STEPS_PER_BATCH)
      setSteps(prev => prev.map(step => 
        nextBatchSteps.some(batchStep => batchStep.id === step.id) 
          ? { ...step, status: 'in_progress' } 
          : step
      ))
    } else {
      // All batches completed, show verification notes
      setShowVerificationNotes(true)
    }

    return true
  }

  const completeVerificationWithNotes = () => {
    setShowVerificationNotes(false)
    setShowDeductionsStep(true)
  }

  // Update step value for different input types
  const updateStepValue = (stepId: number, value: any) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, value } : step
    ))
  }

  // Render input based on step type
  const renderStepInput = (step: VerificationStep) => {
    switch (step.type) {
      case 'image':
        return (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {step.title}
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  updateStepValue(step.id, file)
                }
              }}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            {step.value && (
              <div className="mt-2 text-sm text-green-600">
                ✓ Image selected: {step.value.name}
              </div>
            )}
          </div>
        )
      
      case 'bool':
        return (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {step.title}
            </label>
            <div className="flex space-x-4">
              <button
                onClick={() => updateStepValue(step.id, true)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  step.value === true 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                ✓ Pass
              </button>
              <button
                onClick={() => updateStepValue(step.id, false)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  step.value === false 
                    ? 'bg-red-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                ✗ Fail
              </button>
            </div>
          </div>
        )
      
      case 'text':
        return (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {step.title}
            </label>
            <input
              type="text"
              value={step.value || ''}
              onChange={(e) => updateStepValue(step.id, e.target.value)}
              placeholder={`Enter ${step.title.toLowerCase()}...`}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        )
      
      default:
        return null
    }
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

  // Function to collect all verification data as JSON
  const collectVerificationData = () => {
    const finalOfferValue = deviceInfo.vendorBid - deductions.reduce((sum, d) => sum + d.amount, 0)
    
    const verificationData = steps.map(step => ({
      id: step.id,
      item: step.title,
      type: step.type,
      category: step.category,
      value: step.value
    }))

    const collectedData = {
      verification_data: verificationData,
      verification_note: verificationNotes,
      deductions: deductions.map(deduction => ({
        id: deduction.id,
        category: deduction.category,
        issue: deduction.issue,
        amount: deduction.amount,
        severity: deduction.severity
      })),
      offer_value: finalOfferValue
    }

    console.log('🚀 [VERIFICATION-COMPLETE] Collected Form Data:', JSON.stringify(collectedData, null, 2))
    return collectedData
  }

  const completeDeductionsAndMakeOffer = async () => {
    if (isSubmittingVerification) return

    setIsSubmittingVerification(true)
    
    try {
      // Validate taskId exists
      if (!taskId) {
        toast.error('Task ID is missing')
        return
      }

      // Collect all verification data
      const verificationData = collectVerificationData()
      
      console.log('🚀 [VERIFICATION] Submitting verification to server...')
      
      // Call the verify API
      const result = await sellikoClient.verifyListing(
        taskId, // listing_id (now guaranteed to be non-null)
        verificationData.verification_data,
        verificationData.verification_note,
        verificationData.deductions,
        verificationData.offer_value
      ) as { success: boolean; error?: string; message?: string }

      if (result.success) {
        console.log('✅ [VERIFICATION] Verification submitted successfully')
        toast.success('Verification completed successfully!')
        
        // Redirect to agent dashboard
        router.push('/agent')
      } else {
        console.error('❌ [VERIFICATION] Verification submission failed:', result.error)
        toast.error(result.error || 'Failed to submit verification')
      }
    } catch (error) {
      console.error('💥 [VERIFICATION] Error submitting verification:', error)
      toast.error('Network error occurred while submitting verification')
    } finally {
      setIsSubmittingVerification(false)
    }
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
  const failedSteps = steps.filter(step => step.status === 'failed').length
  const processedSteps = completedSteps + failedSteps
  const progressPercentage = steps.length > 0 ? (processedSteps / steps.length) * 100 : 0

  // Check if current batch can be completed
  const canCompleteBatch = () => {
    return currentBatchSteps.every(step => {
      switch (step.type) {
        case 'image':
          return step.value instanceof File
        case 'bool':
          return step.value !== null && step.value !== undefined
        case 'text':
          return step.value && step.value.trim().length > 0
        default:
          return true
      }
    })
  }

  // Show verification notes section
  if (showVerificationNotes) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900">Verification Complete - Add Notes</h1>
              <span className="text-sm text-gray-600">All steps completed</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>

          <div className="card-mobile bg-white/80 backdrop-blur-sm p-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircleSolid className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Verification Summary</h2>
                <p className="text-gray-600">All verification steps have been completed. Add any additional notes below.</p>
              </div>
            </div>

            {/* Verification Summary */}
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification Results</h3>
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <span className="text-gray-600">Total Steps:</span>
                  <span className="ml-2 font-medium">{steps.length}</span>
                </div>
                <div>
                  <span className="text-gray-600">Completed:</span>
                  <span className="ml-2 font-medium text-green-600">{completedSteps}</span>
                </div>
                <div>
                  <span className="text-gray-600">Failed:</span>
                  <span className="ml-2 font-medium text-red-600">{failedSteps}</span>
                </div>
                <div>
                  <span className="text-gray-600">Success Rate:</span>
                  <span className="ml-2 font-medium">{Math.round((completedSteps / steps.length) * 100)}%</span>
                </div>
              </div>

              {/* Failed Steps Summary */}
              {failedSteps > 0 && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-semibold text-red-900 mb-2">Issues Found:</h4>
                  <div className="space-y-1">
                    {steps.filter(step => step.status === 'failed').map(step => (
                      <div key={step.id} className="text-sm text-red-800">
                        • {step.title}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Verification Notes */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verification Notes (Optional)
              </label>
              <textarea
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                placeholder="Add any additional observations, concerns, or recommendations about the device..."
                rows={6}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">
                Document any specific issues, recommendations, or additional observations from the verification process.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={completeVerificationWithNotes}
                className="flex-1 px-6 py-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-semibold text-lg"
              >
                Complete Verification & Continue
              </button>
              <button
                onClick={() => setCurrentBatch(Math.max(0, currentBatch - 1))}
                className="px-6 py-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
              >
                Back to Review
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show deductions step
  if (showDeductionsStep) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900">Add Deductions & Make Offer</h1>
              <span className="text-sm text-gray-600">Final step</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>

          <div className="card-mobile bg-white/80 backdrop-blur-sm p-6">
            {/* Current Offer Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-3">Current Offer Calculation</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Original Vendor Bid:</span>
                  <span className="font-semibold text-blue-900">₹{deviceInfo.vendorBid.toLocaleString()}</span>
                </div>
                {deductions.map((deduction) => (
                  <div key={deduction.id} className="flex justify-between text-red-600">
                    <span>{deduction.issue}:</span>
                    <span>-₹{deduction.amount.toLocaleString()}</span>
                  </div>
                ))}
                <div className="border-t border-blue-200 pt-2 flex justify-between text-lg font-bold">
                  <span className="text-blue-900">Final Offer:</span>
                  <span className="text-green-600">₹{(deviceInfo.vendorBid - deductions.reduce((sum, d) => sum + d.amount, 0)).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Add Deduction Form */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Deductions</h3>
                <button
                  onClick={() => setShowDeductionForm(!showDeductionForm)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                >
                  {showDeductionForm ? 'Cancel' : 'Add Deduction'}
                </button>
              </div>

              {showDeductionForm && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg mb-4">
                  <select
                    value={newDeduction.category}
                    onChange={(e) => setNewDeduction({ ...newDeduction, category: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                    placeholder="Describe the specific issue found"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="number"
                      value={newDeduction.amount}
                      onChange={(e) => setNewDeduction({ ...newDeduction, amount: parseInt(e.target.value) || 0 })}
                      placeholder="Deduction amount (₹)"
                      className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <select
                      value={newDeduction.severity}
                      onChange={(e) => setNewDeduction({ ...newDeduction, severity: e.target.value as 'minor' | 'major' | 'critical' })}
                      className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="minor">Minor Issue</option>
                      <option value="major">Major Issue</option>
                      <option value="critical">Critical Issue</option>
                    </select>
                  </div>
                  <button
                    onClick={addDeduction}
                    disabled={!newDeduction.category || !newDeduction.issue || newDeduction.amount <= 0}
                    className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Add Deduction
                  </button>
                </div>
              )}

              {/* Existing Deductions List */}
              <div className="space-y-3">
                {deductions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircleIcon className="w-12 h-12 mx-auto mb-2 text-green-500" />
                    <p>No deductions added</p>
                    <p className="text-sm">Device appears to be in good condition</p>
                  </div>
                ) : (
                  deductions.map((deduction) => (
                    <div key={deduction.id} className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-red-900">{deduction.issue}</div>
                        <div className="text-sm text-red-600 mt-1">
                          <span className="capitalize">{deduction.category}</span>
                          <span className="mx-2">•</span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(deduction.severity)}`}>
                            {deduction.severity}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="font-semibold text-red-900 text-lg">₹{deduction.amount.toLocaleString()}</span>
                        <button
                          onClick={() => removeDeduction(deduction.id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          <XMarkIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setShowDeductionsStep(false)
                  setShowVerificationNotes(true)
                }}
                disabled={isSubmittingVerification}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Back to Notes
              </button>
              <button
                onClick={completeDeductionsAndMakeOffer}
                disabled={isSubmittingVerification}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmittingVerification ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </div>
                ) : (
                  `Make Offer • ₹${(deviceInfo.vendorBid - deductions.reduce((sum, d) => sum + d.amount, 0)).toLocaleString()}`
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show loading state if configs haven't loaded yet
  if (isLoadingConfigs) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Icons.spinner className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">Loading Verification Checklist...</h3>
          <p className="text-gray-600">Fetching configuration from server</p>
        </div>
      </div>
    )
  }

  // Show error state if configs failed to load
  if (configsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Verification Checklist</h3>
          <p className="text-red-600 mb-4">{configsError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Show message if no steps available
  if (steps.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <ClipboardDocumentListIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Verification Steps Found</h3>
          <p className="text-gray-600 mb-4">No verification checklist items are configured.</p>
          <Link
            href="/agent"
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  if (verificationComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <div className="max-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            {startVerificationError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{startVerificationError}</p>
              </div>
            )}
            {/* Check if device is ready for pickup */}
            {deviceInfo && deviceInfo.status === 'ready_for_pickup' ? (
              <button
                onClick={() => {
                  // Handle pickup logic here
                  toast.success('Pickup process initiated')
                }}
                className="inline-flex items-center px-8 py-4 text-lg font-semibold rounded-xl transition-colors shadow-lg bg-orange-600 text-white hover:bg-orange-700"
              >
                <TruckIcon className="w-6 h-6 mr-3" />
                Pickup
              </button>
            ) : (
              <button
                onClick={startVerification}
                disabled={isStartingVerification}
                className={`inline-flex items-center px-8 py-4 text-lg font-semibold rounded-xl transition-colors shadow-lg ${
                  isStartingVerification
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                {isStartingVerification ? (
                  <>
                    <div className="w-6 h-6 mr-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Starting Verification...
                  </>
                ) : (
                  <>
                    <PlayIcon className="w-6 h-6 mr-3" />
                    Start Verification Process
                  </>
                )}
              </button>
            )}
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
            <h1 className="text-2xl font-bold text-gray-900">Device Verification</h1>
            <span className="text-sm text-gray-600">
              Batch {currentBatch + 1} of {totalBatches} • Steps {currentBatch * STEPS_PER_BATCH + 1}-{Math.min((currentBatch + 1) * STEPS_PER_BATCH, steps.length)} of {steps.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Current Batch Steps */}
          <div className="lg:col-span-2">
            <div className="card-mobile bg-white/80 backdrop-blur-sm p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Verification Steps {currentBatch * STEPS_PER_BATCH + 1}-{Math.min((currentBatch + 1) * STEPS_PER_BATCH, steps.length)}
                </h2>
                <p className="text-gray-600">Complete all fields in this section to continue.</p>
              </div>

              <div className="space-y-6">
                {currentBatchSteps.map((step, index) => (
                  <div key={step.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-4">
                      {getStepIcon(step)}
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{step.title}</h3>
                        <p className="text-sm text-gray-600">{step.description}</p>
                      </div>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {currentBatch * STEPS_PER_BATCH + index + 1}
                      </span>
                    </div>
                    
                    {renderStepInput(step)}
                  </div>
                ))}
              </div>

              <div className="mt-8 flex space-x-4">
                <button
                  onClick={completeCurrentBatch}
                  disabled={!canCompleteBatch()}
                  className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                    canCompleteBatch()
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {currentBatch < totalBatches - 1 ? 'Complete Batch & Continue' : 'Complete Final Batch'}
                </button>
                {currentBatch > 0 && (
                  <button
                    onClick={() => setCurrentBatch(currentBatch - 1)}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Previous Batch
                  </button>
                )}
              </div>
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
          </div>
        </div>
      </div>
    </div>
  )
} 