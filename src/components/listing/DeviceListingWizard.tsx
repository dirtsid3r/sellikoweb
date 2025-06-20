'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { ChevronLeftIcon, ChevronRightIcon, CheckIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import sellikoClient from '@/selliko-client'

// Types from integrationguide.md
interface DeviceListing {
  // Step 1: Device Information
  brand: string
  model: string
  storage: string
  color: string
  condition: 'Excellent' | 'Good' | 'Fair' | 'Poor'
  
  // Step 2: Technical Details
  imei1: string
  imei2?: string
  batteryHealth: number // 1-100%
  askingPrice: number
  description: string
  
  // Step 3: Photos & Documentation
  devicePhotos: File[]
  billPhoto?: File
  hasWarranty: boolean
  warrantyType?: string
  warrantyExpiry?: Date
  
  // Step 4: Pickup Details
  contactName: string
  pickupAddress: {
    streetAddress: string
    city: string
    state: string
    pincode: string
    landmark?: string
  }
  pickupTime: 'morning' | 'afternoon' | 'evening' | 'night' | 'anytime'
}

const DEVICE_BRANDS = ['Apple', 'Samsung', 'OnePlus', 'Xiaomi', 'Realme', 'Oppo', 'Vivo', 'Google', 'Nothing', 'Other']
const STORAGE_OPTIONS = ['32GB', '64GB', '128GB', '256GB', '512GB', '1TB']
const CONDITIONS = [
  { value: 'Excellent', label: 'Excellent - Like new, no visible wear' },
  { value: 'Good', label: 'Good - Minor scratches, fully functional' },
  { value: 'Fair', label: 'Fair - Visible wear, works well' },
  { value: 'Poor', label: 'Poor - Significant wear, some issues' }
] as const

const KERALA_CITIES = [
  'Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam', 
  'Palakkad', 'Alappuzha', 'Kannur', 'Kottayam', 'Malappuram'
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

export default function DeviceListingWizard() {
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [configLoading, setConfigLoading] = useState(true)
  const [availableCities, setAvailableCities] = useState<string[]>([])
  const [availableBrands, setAvailableBrands] = useState<string[]>([])
  const [formData, setFormData] = useState<Partial<DeviceListing>>({
    contactName: user?.name || '',
    pickupAddress: {
      streetAddress: '',
      city: '',
      state: 'Kerala',
      pincode: '',
      landmark: ''
    },
    devicePhotos: [],
    hasWarranty: false
  })

  // Fetch form configuration on component load
  useEffect(() => {
    const fetchFormConfig = async () => {
      try {
        const config = await sellikoClient.getUniversalFormConfig() as any
        
        if (config.success) {
          setAvailableCities(config.cities || [])
          setAvailableBrands(config.brands || [])
        } else {
          // Fallback to hardcoded values
          setAvailableCities(KERALA_CITIES)
          setAvailableBrands(DEVICE_BRANDS)
        }
      } catch (error) {
        // Fallback to hardcoded values
        setAvailableCities(KERALA_CITIES)
        setAvailableBrands(DEVICE_BRANDS)
      } finally {
        setConfigLoading(false)
      }
    }

    fetchFormConfig()
  }, [])

  const updateFormData = (data: Partial<DeviceListing>) => {
    setFormData(prev => ({ ...prev, ...data }))
  }

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(prev => prev + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      // Prepare data structure for selliko-client
      const listingData = {
        // Device Information - map from DeviceListingWizard to selliko-client format
        brand: formData.brand || '',
        model: formData.model || '',
        storage: formData.storage || '',
        color: formData.color || '',
        condition: formData.condition || '',
        description: formData.description || '',
        
        // Technical Details
        imei1: formData.imei1 || '',
        imei2: formData.imei2 || '',
        batteryHealth: formData.batteryHealth || 100,
        expectedPrice: formData.askingPrice?.toString() || '0',
        
        // Images - convert devicePhotos array to images object
        images: {
          front: formData.devicePhotos?.[0] || null,
          back: formData.devicePhotos?.[1] || null,
          top: formData.devicePhotos?.[2] || null,
          bottom: formData.devicePhotos?.[3] || null,
        },
        billImage: formData.billPhoto || null,
        
        // Warranty Information
        warrantyStatus: formData.hasWarranty ? 'active' : 'none',
        warrantyType: formData.warrantyType || null,
        warrantyExpiry: formData.warrantyExpiry?.toISOString().split('T')[0] || null,
        warrantyImage: null,
        
        // Bill Information
        hasBill: !!formData.billPhoto,
        purchaseDate: null,
        purchasePrice: null,
        
        // Personal Details - map contactName to name, and create mobile from user data
        name: formData.contactName || '',
        mobile: (user as any)?.phone || (user as any)?.mobile_number || '',
        email: (user as any)?.email || '',
        
        // Address Information - map from pickupAddress
        address: formData.pickupAddress?.streetAddress || '',
        city: formData.pickupAddress?.city || '',
        pincode: formData.pickupAddress?.pincode || '',
        state: formData.pickupAddress?.state || 'Kerala',
        landmark: formData.pickupAddress?.landmark || null,
        
        // Bank Details
        accountNumber: '',
        ifscCode: '',
        accountHolderName: formData.contactName || '',
        bankName: '',
        
        // Pickup Details - same as address for DeviceListingWizard
        pickupAddress: formData.pickupAddress?.streetAddress || '',
        pickupCity: formData.pickupAddress?.city || '',
        pickupPincode: formData.pickupAddress?.pincode || '',
        preferredTime: formData.pickupTime || 'morning',
        
        // Terms Agreement
        termsAccepted: true,
        privacyAccepted: true,
        whatsappConsent: true
      }

      // Use sellikoClient to create the listing
      const result = await sellikoClient.createDeviceListing(listingData)
      
      if (result.success) {
        alert('Device listed successfully! It will be reviewed by our team within 24 hours.')
      } else {
        alert('Error submitting listing: ' + (result.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Submit error:', error)
      alert('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-sm">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Login Required</h2>
          <p className="text-gray-600">Please login to list your device</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* How It Works - Only show on step 1 */}
      {currentStep === 1 && (
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">How SELLIKO Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">1. List Your Device</h3>
              <p className="text-gray-600 text-sm">Share device details and photos. Takes only 3 minutes.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v2a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">2. Receive Bids</h3>
              <p className="text-gray-600 text-sm">Verified buyers compete for 24 hours with real offers.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">3. Get Paid</h3>
              <p className="text-gray-600 text-sm">Accept the best bid. Safe pickup and instant payment.</p>
            </div>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">List Your Device</h1>
          <span className="text-sm text-gray-500">Step {currentStep} of 4</span>
        </div>
        
        <div className="flex items-center space-x-4">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step <= currentStep 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {step < currentStep ? <CheckIcon className="w-5 h-5" /> : step}
              </div>
              {step < 4 && (
                <div className={`w-16 h-1 mx-2 ${
                  step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        {currentStep === 1 && <Step1DeviceInfo formData={formData} updateFormData={updateFormData} availableBrands={availableBrands} configLoading={configLoading} />}
        {currentStep === 2 && <Step2TechnicalDetails formData={formData} updateFormData={updateFormData} />}
        {currentStep === 3 && <Step3PhotosDocuments formData={formData} updateFormData={updateFormData} />}
        {currentStep === 4 && <Step4PickupDetails formData={formData} updateFormData={updateFormData} availableCities={availableCities} configLoading={configLoading} />}

        {/* Navigation */}
        <div className="flex justify-between pt-6 mt-6 border-t border-gray-200">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeftIcon className="w-4 h-4 mr-2" />
            Previous
          </button>

          {currentStep < 4 ? (
            <button
              onClick={nextStep}
              className="flex items-center px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Next
              <ChevronRightIcon className="w-4 h-4 ml-2" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Listing'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// Step 1: Device Information
function Step1DeviceInfo({ formData, updateFormData, availableBrands, configLoading }: {
  formData: Partial<DeviceListing>
  updateFormData: (data: Partial<DeviceListing>) => void
  availableBrands: string[]
  configLoading: boolean
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Device Information</h2>
        <p className="text-gray-600 mb-6">Tell us about your device</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Brand */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Brand *</label>
          <SearchableDropdown
            options={availableBrands}
            value={formData.brand || ''}
            onChange={(value) => updateFormData({ brand: value })}
            placeholder={configLoading ? "Loading brands..." : "Search and select brand"}
            disabled={configLoading}
            required
          />
          {configLoading && (
            <p className="text-xs text-gray-500 mt-1">Loading available brands...</p>
          )}
        </div>

        {/* Model */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Model *</label>
          <input
            type="text"
            value={formData.model || ''}
            onChange={(e) => updateFormData({ model: e.target.value })}
            placeholder="e.g., iPhone 14 Pro"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
          <p className="text-xs text-gray-500 mt-1">Include the exact model name for accurate pricing</p>
        </div>

        {/* Storage */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Storage *</label>
          <select
            value={formData.storage || ''}
            onChange={(e) => updateFormData({ storage: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select storage</option>
            {STORAGE_OPTIONS.map(storage => (
              <option key={storage} value={storage}>{storage}</option>
            ))}
          </select>
        </div>

        {/* Color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Color *</label>
          <input
            type="text"
            value={formData.color || ''}
            onChange={(e) => updateFormData({ color: e.target.value })}
            placeholder="e.g., Space Black"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
      </div>

      {/* Condition */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Condition *</label>
        <div className="space-y-3">
          {CONDITIONS.map(condition => (
            <label key={condition.value} className="flex items-start">
              <input
                type="radio"
                name="condition"
                value={condition.value}
                checked={formData.condition === condition.value}
                onChange={(e) => updateFormData({ condition: e.target.value as DeviceListing['condition'] })}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                required
              />
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-900">{condition.value}</div>
                <div className="text-sm text-gray-500">{condition.label}</div>
              </div>
            </label>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">Honest condition assessment helps get accurate offers</p>
      </div>
    </div>
  )
}

// Step 2: Technical Details
function Step2TechnicalDetails({ formData, updateFormData }: {
  formData: Partial<DeviceListing>
  updateFormData: (data: Partial<DeviceListing>) => void
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Technical Details</h2>
        <p className="text-gray-600 mb-6">Provide technical information about your device</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* IMEI 1 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">IMEI 1 *</label>
          <input
            type="text"
            value={formData.imei1 || ''}
            onChange={(e) => updateFormData({ imei1: e.target.value })}
            placeholder="15-digit IMEI number"
            maxLength={15}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
          <p className="text-xs text-gray-500 mt-1">Dial *#06# to find IMEI</p>
        </div>

        {/* IMEI 2 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">IMEI 2 (if dual SIM)</label>
          <input
            type="text"
            value={formData.imei2 || ''}
            onChange={(e) => updateFormData({ imei2: e.target.value })}
            placeholder="15-digit IMEI number"
            maxLength={15}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Battery Health */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Battery Health *</label>
          <div className="flex items-center space-x-3">
            <input
              type="range"
              min="1"
              max="100"
              value={formData.batteryHealth || 100}
              onChange={(e) => updateFormData({ batteryHealth: parseInt(e.target.value) })}
              className="flex-1"
            />
            <span className="text-sm font-medium text-gray-900 w-12">{formData.batteryHealth || 100}%</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Check in Settings → Battery → Battery Health</p>
        </div>

        {/* Asking Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Asking Price (₹) *</label>
          <input
            type="number"
            value={formData.askingPrice || ''}
            onChange={(e) => updateFormData({ askingPrice: parseInt(e.target.value) })}
            placeholder="e.g., 45000"
            min="1000"
            max="1000000"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
          <p className="text-xs text-gray-500 mt-1">Research similar models for competitive pricing</p>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
        <textarea
          value={formData.description || ''}
          onChange={(e) => updateFormData({ description: e.target.value })}
          placeholder="Describe the condition, any accessories included, reason for selling, etc."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
        <p className="text-xs text-gray-500 mt-1">Include condition details, accessories, and any known issues</p>
      </div>
    </div>
  )
}

// Step 3: Photos & Documentation  
function Step3PhotosDocuments({ formData, updateFormData }: {
  formData: Partial<DeviceListing>
  updateFormData: (data: Partial<DeviceListing>) => void
}) {
  const [uploadedPhotos, setUploadedPhotos] = useState<{[key: string]: File | null}>({
    front: null,
    back: null,
    leftSide: null,
    rightSide: null
  })

  const handlePhotoUpload = (angle: string, file: File | null) => {
    const newPhotos = { ...uploadedPhotos, [angle]: file }
    setUploadedPhotos(newPhotos)
    
    // Convert to array for form data
    const photoArray = Object.values(newPhotos).filter(Boolean) as File[]
    updateFormData({ devicePhotos: photoArray })
  }

  const PhotoUploadCard = ({ 
    angle, 
    label, 
    icon 
  }: { 
    angle: string
    label: string
    icon: React.ReactNode
  }) => {
    const file = uploadedPhotos[angle]
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0] || null
      if (selectedFile && selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
        alert('File size must be less than 5MB')
        return
      }
      handlePhotoUpload(angle, selectedFile)
    }

    const removePhoto = () => {
      handlePhotoUpload(angle, null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }

    return (
      <div className="relative">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        {file ? (
          // Photo uploaded state
          <div className="relative aspect-square border-2 border-green-300 rounded-lg overflow-hidden bg-green-50">
            <img 
              src={URL.createObjectURL(file)} 
              alt={label}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <button
                onClick={removePhoto}
                className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="absolute bottom-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded font-medium">
              {label}
            </div>
          </div>
        ) : (
          // Upload prompt state
          <button
            onClick={() => fileInputRef.current?.click()}
            className="aspect-square w-full border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors p-6 flex flex-col items-center justify-center text-center"
          >
            <div className="w-12 h-12 text-gray-400 mb-3">
              {icon}
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">{label}</h3>
            <p className="text-sm text-gray-500 mb-2">Upload an image</p>
            <p className="text-xs text-gray-400">1600×1200 (5 MB max)</p>
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Photos & Documentation</h2>
        <p className="text-gray-600 mb-6">Upload clear photos to get better offers</p>
      </div>

      {/* Device Photos - 2x2 Grid */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Device Photos (4 required) *</label>
        <div className="grid grid-cols-2 gap-4">
          <PhotoUploadCard 
            angle="front" 
            label="Front View" 
            icon={
              <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            } 
          />
          <PhotoUploadCard 
            angle="back" 
            label="Back View" 
            icon={
              <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
              </svg>
            } 
          />
          <PhotoUploadCard 
            angle="leftSide" 
            label="Left Side" 
            icon={
              <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            } 
          />
          <PhotoUploadCard 
            angle="rightSide" 
            label="Right Side" 
            icon={
              <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8V4m0 0l4 4m-4-4l-4 4m-6 0v12m0 0l-4-4m4 4l4-4" />
              </svg>
            } 
          />
        </div>
        <p className="text-sm text-gray-500 mt-3">
          Include: Front, back, sides showing ports, buttons, and any damage. Max 5MB per photo.
        </p>
        {Object.values(uploadedPhotos).filter(Boolean).length > 0 && (
          <div className="flex items-center mt-3 text-sm">
            <svg className="w-4 h-4 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-green-700 font-medium">
              {Object.values(uploadedPhotos).filter(Boolean).length} of 4 photos uploaded
            </span>
          </div>
        )}
      </div>

      {/* Bill Photo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Bill/Invoice Photo (optional)</label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) => {
              const files = e.target.files
              if (files && files[0]) {
                updateFormData({ billPhoto: files[0] })
              }
            }}
            className="w-full"
          />
          <p className="text-sm text-gray-500 mt-2">
            Upload purchase bill or invoice (increases trust)
          </p>
        </div>
        {formData.billPhoto && (
          <p className="text-sm text-green-600 mt-2">Bill uploaded</p>
        )}
      </div>

      {/* Warranty */}
      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.hasWarranty || false}
            onChange={(e) => updateFormData({ hasWarranty: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm font-medium text-gray-700">Device has active warranty</span>
        </label>

        {formData.hasWarranty && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Warranty Type</label>
              <select
                value={formData.warrantyType || ''}
                onChange={(e) => updateFormData({ warrantyType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select warranty type</option>
                <option value="Manufacturer">Manufacturer Warranty</option>
                <option value="Extended">Extended Warranty</option>
                <option value="Store">Store Warranty</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Warranty Expiry</label>
              <input
                type="date"
                value={formData.warrantyExpiry?.toISOString().split('T')[0] || ''}
                onChange={(e) => updateFormData({ warrantyExpiry: new Date(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Step 4: Pickup Details
function Step4PickupDetails({ formData, updateFormData, availableCities, configLoading }: {
  formData: Partial<DeviceListing>
  updateFormData: (data: Partial<DeviceListing>) => void
  availableCities: string[]
  configLoading: boolean
}) {
  const updateAddress = (field: string, value: string) => {
    const currentAddress = formData.pickupAddress || {
      streetAddress: '',
      city: '',
      state: 'Kerala',
      pincode: '',
      landmark: ''
    }
    
    updateFormData({
      pickupAddress: {
        ...currentAddress,
        [field]: value
      }
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Pickup Details</h2>
        <p className="text-gray-600 mb-6">Where should our agent collect the device?</p>
      </div>

      {/* Contact Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
        <input
          type="text"
          value={formData.contactName || ''}
          onChange={(e) => updateFormData({ contactName: e.target.value })}
          placeholder="Enter your full name"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
        <p className="text-xs text-gray-500 mt-1">This name will be used for pickup coordination</p>
      </div>

      {/* Address */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Street Address *</label>
          <textarea
            value={formData.pickupAddress?.streetAddress || ''}
            onChange={(e) => updateAddress('streetAddress', e.target.value)}
            placeholder="House/flat number, street name, area"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
            <SearchableDropdown
              options={availableCities}
              value={formData.pickupAddress?.city || ''}
              onChange={(value) => updateAddress('city', value)}
              placeholder={configLoading ? "Loading cities..." : "Search and select city"}
              disabled={configLoading}
              required
            />
            {configLoading && (
              <p className="text-xs text-gray-500 mt-1">Loading available cities...</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
            <input
              type="text"
              value="Kerala"
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pincode *</label>
            <input
              type="text"
              value={formData.pickupAddress?.pincode || ''}
              onChange={(e) => updateAddress('pincode', e.target.value)}
              placeholder="6-digit pincode"
              maxLength={6}
              pattern="\d{6}"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Landmark (optional)</label>
          <input
            type="text"
            value={formData.pickupAddress?.landmark || ''}
            onChange={(e) => updateAddress('landmark', e.target.value)}
            placeholder="Near temple, bus stop, etc."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Pickup Time */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Preferred Pickup Time *</label>
        <div className="space-y-2">
          {[
            { value: 'morning', label: 'Morning (9 AM - 12 PM)' },
            { value: 'afternoon', label: 'Afternoon (12 PM - 5 PM)' },
            { value: 'evening', label: 'Evening (5 PM - 8 PM)' },
            { value: 'night', label: 'Night (8 PM - 10 PM)' },
            { value: 'anytime', label: 'Anytime (Flexible)' }
          ].map(time => (
            <label key={time.value} className="flex items-center">
              <input
                type="radio"
                name="pickupTime"
                value={time.value}
                checked={formData.pickupTime === time.value}
                onChange={(e) => updateFormData({ pickupTime: e.target.value as DeviceListing['pickupTime'] })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                required
              />
              <span className="ml-2 text-sm text-gray-900">{time.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Terms */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Terms & Conditions</h3>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Your listing will be reviewed within 24 hours</li>
          <li>• Once approved, it will be live for bidding</li>
          <li>• Our agent will verify the device before final payment</li>
          <li>• Payment will be processed within 2 hours of verification</li>
          <li>• You can cancel anytime before agent pickup</li>
        </ul>
      </div>
    </div>
  )
} 