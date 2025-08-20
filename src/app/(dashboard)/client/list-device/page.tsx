'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Icons } from '@/components/ui/icons'
import { toast } from 'react-hot-toast'
import React from 'react'
import { useAuth } from '@/lib/auth'
import sellikoClient from '@/selliko-client'
import Header from '@/components/layout/header'
import { ChevronDownIcon } from '@heroicons/react/24/outline'

interface DeviceImages {
  front?: File | null
  back?: File | null
  top?: File | null
  bottom?: File | null
}

interface DeviceData {
  // Step 1: Device Images
  images: DeviceImages
  // Step 2: IMEI Information
  imei1: string
  imei2: string
  // Step 3: Device Specifications
  brand: string
  model: string
  storage: string
  color: string
  condition: string
  description: string
  // Step 4: Warranty Information
  warrantyStatus: 'active' | 'expired'
  warrantyExpiry: string
  warrantyImage?: File | null
  // Step 5: Bill Information
  hasBill: boolean
  billImage?: File | null
  purchaseDate: string
  purchasePrice: string
  // Step 6: Pricing
  expectedPrice: string
  // Step 7: Personal Details
  name: string
  mobile: string
  email: string
  // Step 8: Address Information
  address: string
  city: string
  pincode: string
  state: string
  // Step 9: Bank Details
  accountNumber: string
  ifscCode: string
  accountHolderName: string
  bankName: string
  // Step 10: Pickup Address
  pickupAddress: string
  pickupCity: string
  pickupPincode: string
  preferredTime: string
  // Step 11: Terms & Agreement
  termsAccepted: boolean
  privacyAccepted: boolean
  whatsappConsent: boolean
}

const initialData: DeviceData = {
  images: {},
  imei1: '',
  imei2: '',
  brand: '',
  model: '',
  storage: '',
  color: '',
  condition: '',
  description: '',
  warrantyStatus: 'active',
  warrantyExpiry: '',
  hasBill: false,
  purchaseDate: '',
  purchasePrice: '',
  expectedPrice: '',
  name: '',
  mobile: '',
  email: '',
  address: '',
  city: '',
  pincode: '',
  state: 'Kerala',
  accountNumber: '',
  ifscCode: '',
  accountHolderName: '',
  bankName: '',
  pickupAddress: '',
  pickupCity: '',
  pickupPincode: '',
  preferredTime: 'morning',
  termsAccepted: false,
  privacyAccepted: false,
  whatsappConsent: false
}

const steps = [
  { title: 'Device Images', description: 'Upload photos of your device' },
  { title: 'IMEI Numbers', description: 'Enter IMEI 1 & 2' },
  { title: 'Device Details', description: 'Specifications and condition' },
  { title: 'Warranty Info', description: 'Warranty status and documents' },
  { title: 'Bill Details', description: 'Purchase bill and information' },
  { title: 'Set Price', description: 'Your asking price' },
  { title: 'Personal Info', description: 'Your contact details' },
  { title: 'Address', description: 'Your current address' },
  { title: 'Pickup Address', description: 'Device collection details' },
  { title: 'Terms & Agreement', description: 'Final confirmation' }
]

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

export default function ListDevice() {
  const { user, logout, isLoading } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)
  const [data, setData] = useState<DeviceData>(initialData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const [availableCities, setAvailableCities] = useState<string[]>([])
  const [isConfigLoading, setIsConfigLoading] = useState(true)

  useEffect(() => {
    const fetchConfig = async () => {
      setIsConfigLoading(true)
      try {
        const config = await sellikoClient.getUniversalFormConfig() as any
        if (config.success && config.cities) {
          setAvailableCities(config.cities)
        } else {
          toast.error(config.error || 'Failed to load configuration')
        }
      } catch (error) {
        toast.error('Network error while fetching configuration')
      } finally {
        setIsConfigLoading(false)
      }
    }
    fetchConfig()
  }, [])

  // Authentication and role check
  useEffect(() => {
    const checkAuth = async () => {
      console.log('🔒 [LIST-DEVICE] Checking authentication and role...')
      try {
        const user = await sellikoClient.getCurrentUser()
        console.log('👤 [LIST-DEVICE] Current user:', user ? {
          id: user.id,
          role: user.user_role,
        } : 'No user')

        if (!user) {
          console.log('❌ [LIST-DEVICE] No user found, redirecting to login')
          toast.error('Please login to continue')
          router.replace('/login')
          return
        }

        const userRole = (user.user_role || user.role || '').toLowerCase()
        console.log('👑 [LIST-DEVICE] User role:', userRole)

        if (userRole !== 'client') {
          console.log(`⚠️ [LIST-DEVICE] Invalid role access attempt: ${userRole}`)
          toast.error('Access denied. Redirecting to your dashboard.')
          // Redirect based on role
          router.replace(`/${userRole}`)
          return
        }

        console.log('✅ [LIST-DEVICE] Role verification successful')
      } catch (error) {
        console.error('💥 [LIST-DEVICE] Auth check error:', error)
        toast.error('Authentication error. Please login again.')
        router.replace('/login')
      }
    }

    if (!isLoading) {
      checkAuth()
    }
  }, [isLoading, router])

  const updateData = (field: keyof DeviceData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }))
  }

  const updateImages = (imageType: keyof DeviceImages, file: File | null) => {
    setData(prev => ({
      ...prev,
      images: { ...prev.images, [imageType]: file }
    }))
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    try {
      console.log('📝 [LIST-DEVICE] Starting submission process...')
      
      // Call the selliko client function
      const result = await sellikoClient.createDeviceListing(data)
      
      if (result.success) {
        toast.success('Device listing submitted successfully! Admin will review and approve within 24 hours.')
        console.log('✅ [LIST-DEVICE] Listing created successfully:', result)
        
        // Redirect to my-listings page on successful submission
        console.log('🔄 [LIST-DEVICE] Redirecting to my-listings...')
        router.push('/client/my-listings')
      } else {
        toast.error(result.error || 'Failed to submit listing. Please try again.')
        console.error('❌ [LIST-DEVICE] Listing submission failed:', result)
      }
    } catch (error) {
      console.error('💥 [LIST-DEVICE] Submission error:', error)
      toast.error('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 0: // Device Images
        return Object.values(data.images).filter(Boolean).length >= 2
      case 1: // IMEI Numbers
        return data.imei1.length >= 10
      case 2: // Device Details
        return data.brand && data.model && data.storage && data.condition
      case 3: // Warranty Info
        return data.warrantyStatus === 'active' || data.warrantyStatus === 'expired'
      case 4: // Bill Details
        return data.hasBill !== undefined
      case 5: // Pricing
        return data.expectedPrice && parseInt(data.expectedPrice) > 0
      case 6: // Personal Info
        return data.name && data.mobile && data.email
      case 7: // Address
        return data.address && data.city && data.pincode
      case 8: // Pickup Address
        return data.pickupAddress && data.pickupCity && data.pickupPincode
      case 9: // Terms
        return data.termsAccepted && data.privacyAccepted && data.whatsappConsent
      default:
        return true
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <DeviceImagesStep data={data} updateImages={updateImages} />
      case 1:
        return <IMEIStep data={data} updateData={updateData} />
      case 2:
        return <DeviceDetailsStep data={data} updateData={updateData} />
      case 3:
        return <WarrantyStep data={data} updateData={updateData} updateImages={updateImages} />
      case 4:
        return <BillDetailsStep data={data} updateData={updateData} updateImages={updateImages} />
      case 5:
        return <PricingStep data={data} updateData={updateData} />
      case 6:
        return <PersonalInfoStep data={data} updateData={updateData} />
      case 7:
        return <AddressStep data={data} updateData={updateData} availableCities={availableCities} isConfigLoading={isConfigLoading} />
      case 8:
        return <PickupAddressStep data={data} updateData={updateData} availableCities={availableCities} isConfigLoading={isConfigLoading} />
      case 9:
        return <TermsStep data={data} updateData={updateData} />
      default:
        return null
    }
  }

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Icons.spinner className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <Header variant="client" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">List Your Device</h1>
          <p className="text-gray-600">Complete all steps to list your device for selling</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-600">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
          <div className="mt-2">
            <h2 className="text-xl font-semibold text-gray-900">{steps[currentStep].title}</h2>
            <p className="text-gray-600">{steps[currentStep].description}</p>
          </div>
        </div>

        {/* Step Content */}
        <Card className="mb-8">
          <CardContent className="p-6">
            {renderStep()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="px-6"
          >
            <Icons.arrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {currentStep === steps.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed() || isSubmitting}
              className="px-6 bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <>
                  <Icons.spinner className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit Listing
                  <Icons.check className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={nextStep}
              disabled={!canProceed()}
              className="px-6"
            >
              Next
              <Icons.arrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

// Step Components
function DeviceImagesStep({ data, updateImages }: { data: DeviceData, updateImages: (type: keyof DeviceImages, file: File | null) => void }) {
  const fileInputRefs = {
    front: useRef<HTMLInputElement>(null),
    back: useRef<HTMLInputElement>(null),
    top: useRef<HTMLInputElement>(null),
    bottom: useRef<HTMLInputElement>(null)
  }

  const handleImageUpload = (type: keyof DeviceImages, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      updateImages(type, file)
    }
  }

  const ImageUploadBox = ({ type, label }: { type: keyof DeviceImages, label: string }) => {
    const [preview, setPreview] = useState<string | null>(null)

    // Create preview URL when image is selected
    React.useEffect(() => {
      if (data.images[type]) {
        const url = URL.createObjectURL(data.images[type]!)
        setPreview(url)
        return () => URL.revokeObjectURL(url)
      } else {
        setPreview(null)
      }
    }, [data.images[type]])

    return (
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition-colors cursor-pointer"
           onClick={() => fileInputRefs[type].current?.click()}>
        <input
          ref={fileInputRefs[type]}
          type="file"
          accept="image/*"
          onChange={(e) => handleImageUpload(type, e)}
          className="hidden"
        />
        {data.images[type] ? (
          <div>
            {preview && (
              <img 
                src={preview} 
                alt={`${label} preview`}
                className="w-20 h-20 object-cover rounded-lg mx-auto mb-2"
              />
            )}
            <Icons.check className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <p className="text-green-600 font-medium">{label} - Uploaded</p>
            <p className="text-xs text-gray-500">{data.images[type]?.name}</p>
            <p className="text-xs text-blue-600 mt-1">Click to change</p>
          </div>
        ) : (
          <div>
            <Icons.camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">{label}</p>
            <p className="text-xs text-gray-500">Click to upload</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Device Images</h3>
        <p className="text-gray-600 mb-6">Please upload clear photos of your device from all angles. At least 2 images are required.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ImageUploadBox type="front" label="Front View" />
        <ImageUploadBox type="back" label="Back View" />
        <ImageUploadBox type="top" label="Top View" />
        <ImageUploadBox type="bottom" label="Bottom View" />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Icons.info className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900">Photo Tips</h4>
            <ul className="text-sm text-blue-800 mt-1 space-y-1">
              <li>• Use good lighting and avoid shadows</li>
              <li>• Show any scratches or damage clearly</li>
              <li>• Make sure IMEI sticker is visible in one photo</li>
              <li>• Keep photos clear and in focus</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

function IMEIStep({ data, updateData }: { data: DeviceData, updateData: (field: keyof DeviceData, value: any) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">IMEI Numbers</h3>
        <p className="text-gray-600 mb-6">Enter the IMEI number for your device. If it has a second IMEI, you can enter that as well. You can find them in Settings &gt; About Phone or by dialing *#06#</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="imei1">IMEI 1 *</Label>
          <Input
            id="imei1"
            type="text"
            placeholder="Enter first IMEI number"
            value={data.imei1}
            onChange={(e) => updateData('imei1', e.target.value)}
            maxLength={15}
          />
        </div>

        <div>
          <Label htmlFor="imei2">IMEI 2 (Optional)</Label>
          <Input
            id="imei2"
            type="text"
            placeholder="Enter second IMEI number"
            value={data.imei2}
            onChange={(e) => updateData('imei2', e.target.value)}
            maxLength={15}
          />
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start">
          <Icons.exclamationTriangle className="w-5 h-5 text-amber-600 mr-3 mt-0.5" />
          <div>
            <h4 className="font-medium text-amber-900">Important</h4>
            <p className="text-sm text-amber-800 mt-1">
              IMEI numbers are used to verify your device authenticity and check for blacklisting. 
              Make sure to enter correct numbers as they will be verified during pickup.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function DeviceDetailsStep({ data, updateData }: { data: DeviceData, updateData: (field: keyof DeviceData, value: any) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Specifications</h3>
        <p className="text-gray-600 mb-6">Provide accurate details about your device</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="brand">Brand *</Label>
          <select
            id="brand"
            value={data.brand}
            onChange={(e) => updateData('brand', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">Select Brand</option>
            <option value="Apple">Apple</option>
            <option value="Samsung">Samsung</option>
            <option value="OnePlus">OnePlus</option>
            <option value="Google">Google</option>
            <option value="Xiaomi">Xiaomi</option>
            <option value="Oppo">Oppo</option>
            <option value="Vivo">Vivo</option>
            <option value="Realme">Realme</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <Label htmlFor="model">Model *</Label>
          <Input
            id="model"
            type="text"
            placeholder="e.g., iPhone 14 Pro Max"
            value={data.model}
            onChange={(e) => updateData('model', e.target.value)}
            maxLength={32}
          />
        </div>

        <div>
          <Label htmlFor="storage">(RAM) -</Label>
          <select
            id="storage"
            value={data.storage}
            onChange={(e) => updateData('storage', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">Select RAM</option>
            <option value="2GB">2GB</option>
            <option value="3GB">3GB</option>
            <option value="4GB">4GB</option>
            <option value="6GB">6GB</option>
            <option value="8GB">8GB</option>
            <option value="10GB">10GB</option>
            <option value="12GB">12GB</option>
            <option value="16GB">16GB</option>
            <option value="20GB">20GB</option>
          </select>
        </div>

        <div>
          <Label htmlFor="color">Color</Label>
          <Input
            id="color"
            type="text"
            placeholder="e.g., Space Gray"
            value={data.color}
            onChange={(e) => updateData('color', e.target.value)}
            maxLength={32}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="condition">Condition *</Label>
        <select
          id="condition"
          value={data.condition}
          onChange={(e) => updateData('condition', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          <option value="">Select Condition</option>
          <option value="Excellent">Excellent - Like new, no visible wear</option>
          <option value="Good">Good - Minor signs of use</option>
          <option value="Fair">Fair - Noticeable wear but fully functional</option>
          <option value="Poor">Poor - Heavy wear, may have issues</option>
        </select>
      </div>

      <div>
        <Label htmlFor="description">Additional Description</Label>
        <Textarea
          id="description"
          placeholder="Describe any specific details, accessories included, or issues with the device..."
          value={data.description}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateData('description', e.target.value)}
          rows={3}
          maxLength={1000}
        />
      </div>
    </div>
  )
}

function WarrantyStep({ data, updateData, updateImages }: { data: DeviceData, updateData: (field: keyof DeviceData, value: any) => void, updateImages: (type: keyof DeviceImages, file: File | null) => void }) {
  const warrantyFileRef = useRef<HTMLInputElement>(null)

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Warranty Information</h3>
        <p className="text-gray-600 mb-6">Provide warranty details if applicable</p>
      </div>

      <div>
        <Label>Warranty Status *</Label>
        <div className="mt-2 space-y-2">
          {['active', 'expired'].map((status) => (
            <label key={status} className="flex items-center">
              <input
                type="radio"
                name="warranty"
                value={status}
                checked={data.warrantyStatus === status}
                onChange={(e) => updateData('warrantyStatus', e.target.value)}
                className="mr-2"
              />
              <span className="capitalize">{status} Warranty</span>
            </label>
          ))}
        </div>
      </div>

      {data.warrantyStatus === 'active' && (
        <>
          <div>
            <Label htmlFor="warrantyExpiry">Warranty Expiry Date</Label>
            <Input
              id="warrantyExpiry"
              type="date"
              value={data.warrantyExpiry}
              onChange={(e) => updateData('warrantyExpiry', e.target.value)}
            />
          </div>

          <div>
            <Label>Warranty Document</Label>
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-green-500 transition-colors"
              onClick={() => warrantyFileRef.current?.click()}
            >
              <input
                ref={warrantyFileRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) updateData('warrantyImage', file)
                }}
                className="hidden"
              />
              {data.warrantyImage ? (
                <div>
                  <Icons.check className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <p className="text-green-600">Warranty document uploaded</p>
                </div>
              ) : (
                <div>
                  <Icons.upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Upload warranty card/document</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function BillDetailsStep({ data, updateData, updateImages }: { data: DeviceData, updateData: (field: keyof DeviceData, value: any) => void, updateImages: (type: keyof DeviceImages, file: File | null) => void }) {
  const billFileRef = useRef<HTMLInputElement>(null)

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Purchase Bill Details</h3>
        <p className="text-gray-600 mb-6">Provide purchase information if available</p>
      </div>

      <div>
        <Label>Do you have the purchase bill? *</Label>
        <div className="mt-2 space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="hasBill"
              value="true"
              checked={data.hasBill === true}
              onChange={(e) => updateData('hasBill', true)}
              className="mr-2"
            />
            Yes, I have the bill
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="hasBill"
              value="false"
              checked={data.hasBill === false}
              onChange={(e) => updateData('hasBill', false)}
              className="mr-2"
            />
            No, I don't have the bill
          </label>
        </div>
      </div>

      {data.hasBill && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="purchaseDate">Purchase Date</Label>
              <Input
                id="purchaseDate"
                type="date"
                value={data.purchaseDate}
                onChange={(e) => updateData('purchaseDate', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="purchasePrice">Purchase Price (₹)</Label>
              <Input
                id="purchasePrice"
                type="number"
                placeholder="e.g., 75000"
                value={data.purchasePrice}
                onChange={(e) => updateData('purchasePrice', e.target.value)}
                maxLength={5}
              />
            </div>
          </div>

          <div>
            <Label>Upload Bill Image</Label>
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-green-500 transition-colors"
              onClick={() => billFileRef.current?.click()}
            >
              <input
                ref={billFileRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) updateData('billImage', file)
                }}
                className="hidden"
              />
              {data.billImage ? (
                <div>
                  <Icons.check className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <p className="text-green-600">Bill image uploaded</p>
                </div>
              ) : (
                <div>
                  <Icons.upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Upload purchase bill</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function PricingStep({ data, updateData }: { data: DeviceData, updateData: (field: keyof DeviceData, value: any) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Set Your Asking Price</h3>
        <p className="text-gray-600 mb-6">Set your expected selling price. Vendors will bid based on this price.</p>
      </div>

      <div>
        <Label htmlFor="expectedPrice">Expected Price (₹) *</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
          <Input
            id="expectedPrice"
            type="number"
            placeholder="e.g., 45000"
            value={data.expectedPrice}
            onChange={(e) => updateData('expectedPrice', e.target.value)}
            className="pl-8"
            maxLength={5}
          />
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start">
          <Icons.lightBulb className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
          <div>
            <h4 className="font-medium text-green-900">Pricing Tips</h4>
            <ul className="text-sm text-green-800 mt-1 space-y-1">
              <li>• Research current market prices for your device model</li>
              <li>• Consider the condition and age of your device</li>
              <li>• Set a competitive price to attract more bids</li>
              <li>• Vendors can bid at or above your asking price</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

function PersonalInfoStep({ data, updateData }: { data: DeviceData, updateData: (field: keyof DeviceData, value: any) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
        <p className="text-gray-600 mb-6">Provide your contact details for communication</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            type="text"
            placeholder="Enter your full name"
            value={data.name}
            onChange={(e) => updateData('name', e.target.value)}
            maxLength={32}
          />
        </div>

        <div>
          <Label htmlFor="mobile">Alternate Number *</Label>
          <Input
            id="mobile"
            type="tel"
            placeholder="Enter mobile number"
            value={data.mobile}
            onChange={(e) => updateData('mobile', e.target.value)}
            maxLength={10}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="email">Email Address *</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter email address"
          value={data.email}
          onChange={(e) => updateData('email', e.target.value)}
          maxLength={32}
        />
      </div>
    </div>
  )
}

function AddressStep({ data, updateData, availableCities, isConfigLoading }: { data: DeviceData, updateData: (field: keyof DeviceData, value: any) => void, availableCities: string[], isConfigLoading: boolean }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Address</h3>
        <p className="text-gray-600 mb-6">Provide your current residential address</p>
      </div>

      <div>
        <Label htmlFor="address">Street Address *</Label>
        <Textarea
          id="address"
          placeholder="Enter your complete address"
          value={data.address}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateData('address', e.target.value)}
          rows={2}
          maxLength={100}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="city">City *</Label>
          <SearchableDropdown
            options={availableCities}
            value={data.city}
            onChange={(value) => updateData('city', value)}
            placeholder={isConfigLoading ? "Loading cities..." : "Search and select city"}
            disabled={isConfigLoading}
          />
        </div>

        <div>
          <Label htmlFor="pincode">Pincode *</Label>
          <Input
            id="pincode"
            type="text"
            placeholder="Enter pincode"
            value={data.pincode}
            onChange={(e) => updateData('pincode', e.target.value)}
            maxLength={6}
          />
        </div>

        <div>
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            type="text"
            value={data.state}
            onChange={(e) => updateData('state', e.target.value)}
            disabled
          />
        </div>
      </div>
    </div>
  )
}

function BankDetailsStep({ data, updateData }: { data: DeviceData, updateData: (field: keyof DeviceData, value: any) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Bank Account Details (Optional)</h3>
        <p className="text-gray-600 mb-6">You can provide your bank details now for faster payment, or add them later from your dashboard.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="accountHolderName">Account Holder Name</Label>
          <Input
            id="accountHolderName"
            type="text"
            placeholder="Enter account holder name"
            value={data.accountHolderName}
            onChange={(e) => updateData('accountHolderName', e.target.value)}
            maxLength={32}
          />
        </div>

        <div>
          <Label htmlFor="bankName">Bank Name</Label>
          <Input
            id="bankName"
            type="text"
            placeholder="Enter bank name"
            value={data.bankName}
            onChange={(e) => updateData('bankName', e.target.value)}
            maxLength={32}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="accountNumber">Account Number</Label>
          <Input
            id="accountNumber"
            type="text"
            placeholder="Enter account number"
            value={data.accountNumber}
            onChange={(e) => updateData('accountNumber', e.target.value)}
            maxLength={20}
          />
        </div>

        <div>
          <Label htmlFor="ifscCode">IFSC Code</Label>
          <Input
            id="ifscCode"
            type="text"
            placeholder="Enter IFSC code"
            value={data.ifscCode}
            onChange={(e) => updateData('ifscCode', e.target.value.toUpperCase())}
            maxLength={11}
          />
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Icons.shield className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900">Secure Payment</h4>
            <p className="text-sm text-blue-800 mt-1">
              Your bank details are encrypted and secure. Payment will be processed only after successful device verification and handover.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function PickupAddressStep({ data, updateData, availableCities, isConfigLoading }: { data: DeviceData, updateData: (field: keyof DeviceData, value: any) => void, availableCities: string[], isConfigLoading: boolean }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pickup Address</h3>
        <p className="text-gray-600 mb-6">Where should our agent collect the device?</p>
      </div>

      <div>
        <Label>Use same as residential address?</Label>
        <div className="mt-2 space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="sameAddress"
              onChange={() => {
                updateData('pickupAddress', data.address)
                updateData('pickupCity', data.city)
                updateData('pickupPincode', data.pincode)
              }}
              className="mr-2"
            />
            Yes, same address
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="sameAddress"
              defaultChecked
              className="mr-2"
            />
            Different address
          </label>
        </div>
      </div>

      <div>
        <Label htmlFor="pickupAddress">Pickup Address *</Label>
        <Textarea
          id="pickupAddress"
          placeholder="Enter pickup address"
          value={data.pickupAddress}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateData('pickupAddress', e.target.value)}
          rows={2}
          maxLength={100}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="pickupCity">City *</Label>
          <SearchableDropdown
            options={availableCities}
            value={data.pickupCity}
            onChange={(value) => updateData('pickupCity', value)}
            placeholder={isConfigLoading ? "Loading cities..." : "Search and select city"}
            disabled={isConfigLoading}
          />
        </div>

        <div>
          <Label htmlFor="pickupPincode">Pincode *</Label>
          <Input
            id="pickupPincode"
            type="text"
            placeholder="Enter pincode"
            value={data.pickupPincode}
            onChange={(e) => updateData('pickupPincode', e.target.value)}
            maxLength={6}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="preferredTime">Preferred Pickup Time</Label>
        <select
          id="preferredTime"
          value={data.preferredTime}
          onChange={(e) => updateData('preferredTime', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          <option value="">Select preferred time</option>
          <option value="morning">Morning (9AM - 12PM)</option>
          <option value="afternoon">Afternoon (12PM - 3PM)</option>
          <option value="evening">Evening (3PM - 6PM)</option>
          <option value="night">Night (6PM - 9PM)</option>
          <option value="anytime">Anytime</option>
        </select>
      </div>
    </div>
  )
}

function TermsStep({ data, updateData }: { data: DeviceData, updateData: (field: keyof DeviceData, value: any) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Terms & Agreement</h3>
        <p className="text-gray-600 mb-6">Please review and accept the terms before submitting</p>
      </div>

      <div className="space-y-4">
        <label className="flex items-start">
          <input
            type="checkbox"
            checked={data.termsAccepted}
            onChange={(e) => updateData('termsAccepted', e.target.checked)}
            className="mr-3 mt-1"
          />
          <span className="text-sm text-gray-700">
            I agree to the <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> and understand that:
            <ul className="mt-2 ml-4 space-y-1 text-xs text-gray-600">
              <li>• Device information provided is accurate and complete</li>
              <li>• Device will be physically verified by our agent</li>
              <li>• Final price may vary based on actual device condition</li>
              <li>• I have the legal right to sell this device</li>
            </ul>
          </span>
        </label>

        <label className="flex items-start">
          <input
            type="checkbox"
            checked={data.privacyAccepted}
            onChange={(e) => updateData('privacyAccepted', e.target.checked)}
            className="mr-3 mt-1"
          />
          <span className="text-sm text-gray-700">
            I accept the <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a> and consent to processing of my personal data for this transaction.
          </span>
        </label>

        <label className="flex items-start">
          <input
            type="checkbox"
            checked={data.whatsappConsent}
            onChange={(e) => updateData('whatsappConsent', e.target.checked)}
            className="mr-3 mt-1"
          />
          <span className="text-sm text-gray-700">
            I consent to receive transaction updates and notifications via WhatsApp on my registered mobile number.
          </span>
        </label>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start">
          <Icons.check className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
          <div>
            <h4 className="font-medium text-green-900">What happens next?</h4>
            <ul className="text-sm text-green-800 mt-1 space-y-1">
              <li>• Admin will review and approve your listing within 24 hours</li>
              <li>• Approved listings will be visible to verified vendors</li>
              <li>• You'll receive bid notifications via WhatsApp</li>
              <li>• Accept a bid to initiate agent verification and pickup</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}