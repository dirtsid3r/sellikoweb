'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Icons } from '@/components/ui/icons'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useRouter, useParams } from 'next/navigation'
import sellikoClient from '@/selliko-client'
import { toast } from 'react-hot-toast'

interface EditFormData {
  // Device Information
  brand: string
  model: string
  storage: string
  color: string
  condition: string
  description: string
  
  // Technical Details
  imei1: string
  imei2: string
  batteryHealth?: number
  askingPrice: number
  
  // Images - can be File objects (new uploads) or string URLs (existing)
  frontImage: string | File | null
  backImage: string | File | null
  topImage: string | File | null
  bottomImage: string | File | null
  billImage?: string | File | null
  warrantyImage?: string | File | null
  
  // Warranty Information
  hasWarranty: boolean
  warrantyType?: string
  warrantyStatus?: string
  warrantyExpiry?: string
  
  // Purchase Information
  hasBill: boolean
  purchaseDate?: string
  purchasePrice?: number
  
  // Contact & Address Information
  contactName: string
  mobile: string
  email: string
  address: string
  city: string
  state: string
  pincode: string
  landmark?: string
  
  // Pickup Information
  pickupAddress: string
  pickupCity: string
  pickupState: string
  pickupPincode: string
  pickupTime: string
  
  // Bank Details
  accountHolderName: string
  bankName: string
  accountNumber: string
  ifscCode: string
}

export default function EditListingPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const listingId = params.id as string

  // State management
  const [formData, setFormData] = useState<EditFormData | null>(null)
  const [originalData, setOriginalData] = useState<any>(null) // Store original API data for comparison
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load listing data when page loads
  useEffect(() => {
    const loadListingData = async () => {
      if (!listingId) {
        setError('No listing ID provided')
        setIsLoading(false)
        return
      }

      console.log('📝 [EDIT-LISTING] Loading listing data for ID:', listingId)
      setIsLoading(true)
      setError(null)

      try {
        const result = await sellikoClient.getListingById(listingId, {
          include_images: true,
          include_bids: false,
          include_user_details: true
        })

        console.log('📊 [EDIT-LISTING] Received listing data:', result)

        if ((result as any).success && (result as any).listing) {
          const apiListing = (result as any).listing
          
          // Store original data for comparison
          setOriginalData(apiListing)
          
          const device = apiListing.devices?.[0] || {}
          const clientAddress = apiListing.addresses?.find((addr: any) => addr.type === 'client') || {}
          const pickupAddress = apiListing.addresses?.find((addr: any) => addr.type === 'pickup') || {}

          // Transform API data to form format
          const transformedData: EditFormData = {
            // Device Information
            brand: device.brand || '',
            model: device.model || '',
            storage: device.storage || '',
            color: device.color || '',
            condition: device.condition || '',
            description: device.description || '',
            
            // Technical Details
            imei1: device.imei1 || '',
            imei2: device.imei2 || '',
            batteryHealth: device.battery_health || undefined,
            askingPrice: apiListing.asking_price || apiListing.expected_price || 0,
            
            // Images (store URLs, not files)
            frontImage: device.front_image_url || '',
            backImage: device.back_image_url || '',
            topImage: device.top_image_url || '',
            bottomImage: device.bottom_image_url || '',
            billImage: device.bill_image_url || '',
            warrantyImage: device.warranty_image_url || '',
            
            // Warranty Information
            hasWarranty: device.warranty_status === 'active',
            warrantyType: device.warranty_type || '',
            warrantyStatus: device.warranty_status || '',
            warrantyExpiry: device.warranty_expiry || '',
            
            // Purchase Information
            hasBill: device.has_bill || false,
            purchaseDate: device.purchase_date || '',
            purchasePrice: device.purchase_price || undefined,
            
            // Contact & Address Information
            contactName: clientAddress.contact_name || '',
            mobile: clientAddress.mobile_number || '',
            email: clientAddress.email || '',
            address: clientAddress.address || '',
            city: clientAddress.city || '',
            state: clientAddress.state || '',
            pincode: clientAddress.pincode || '',
            landmark: clientAddress.landmark || '',
            
            // Pickup Information
            pickupAddress: pickupAddress.address || clientAddress.address || '',
            pickupCity: pickupAddress.city || clientAddress.city || '',
            pickupState: pickupAddress.state || clientAddress.state || '',
            pickupPincode: pickupAddress.pincode || clientAddress.pincode || '',
            pickupTime: pickupAddress.pickup_time || 'morning',
            
            // Bank Details
            accountHolderName: clientAddress.account_holder_name || '',
            bankName: clientAddress.bank_name || '',
            accountNumber: clientAddress.account_number || '',
            ifscCode: clientAddress.ifsc_code || ''
          }

          console.log('🔄 [EDIT-LISTING] Transformed form data:', transformedData)
          setFormData(transformedData)
          toast.success('Listing data loaded successfully')
        } else {
          const errorMsg = (result as any).error || 'Failed to load listing data'
          setError(errorMsg)
          toast.error(errorMsg)
        }
      } catch (error) {
        console.error('💥 [EDIT-LISTING] Error loading listing:', error)
        const errorMsg = 'Network error while loading listing'
        setError(errorMsg)
        toast.error(errorMsg)
      } finally {
        setIsLoading(false)
      }
    }

    loadListingData()
  }, [listingId])

  // Update form data
  const updateFormData = (updates: Partial<EditFormData>) => {
    setFormData(prev => prev ? { ...prev, ...updates } : null)
  }

  // Handle image file selection
  const handleImageChange = (position: 'frontImage' | 'backImage' | 'topImage' | 'bottomImage', file: File | null) => {
    console.log(`📸 [EDIT-LISTING] Image changed for ${position}:`, file?.name || 'removed')
    updateFormData({ [position]: file || '' })
  }

  // Handle form submission
  const handleSubmit = async () => {
    if (!formData || !originalData) {
      toast.error('Missing form data or original data')
      return
    }

    setIsSubmitting(true)
    try {
      console.log('📝 [EDIT-LISTING] Starting update submission...')
      
      // Prepare updated data structure for selliko-client
      const updatedData = {
        // Device Information
        brand: formData.brand,
        model: formData.model,
        storage: formData.storage,
        color: formData.color,
        condition: formData.condition,
        description: formData.description,
        
        // Technical Details
        imei1: formData.imei1,
        imei2: formData.imei2,
        batteryHealth: formData.batteryHealth,
        askingPrice: formData.askingPrice,
        
        // Images (can be File objects or URLs)
        images: {
          front: formData.frontImage,
          back: formData.backImage,
          top: formData.topImage,
          bottom: formData.bottomImage,
        },
        billImage: formData.billImage,
        warrantyImage: formData.warrantyImage,
        
        // Warranty Information
        hasWarranty: formData.hasWarranty,
        warrantyType: formData.warrantyType,
        warrantyExpiry: formData.warrantyExpiry,
        
        // Purchase Information
        hasBill: formData.hasBill,
        purchaseDate: formData.purchaseDate,
        purchasePrice: formData.purchasePrice,
        
        // Contact & Address Information
        contactName: formData.contactName,
        mobile: formData.mobile,
        email: formData.email,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        landmark: formData.landmark,
        
        // Pickup Information
        pickupAddress: formData.pickupAddress,
        pickupCity: formData.pickupCity,
        pickupState: formData.pickupState,
        pickupPincode: formData.pickupPincode,
        pickupTime: formData.pickupTime,
        
        // Bank Details
        accountHolderName: formData.accountHolderName,
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        ifscCode: formData.ifscCode
      }

      console.log('📋 [EDIT-LISTING] Calling updateListing with:', {
        listingId,
        hasOriginalData: !!originalData,
        hasUpdatedData: !!updatedData
      })

      // Call the updateListing function
      const result = await sellikoClient.updateListing(listingId, originalData, updatedData)
      
      console.log('📥 [EDIT-LISTING] Update result:', result)

      if ((result as any).success) {
        toast.success((result as any).message || 'Listing updated successfully!')
        
        // Redirect back to listing detail page
        router.push(`/client/listings/${listingId}`)
      } else {
        toast.error((result as any).error || 'Failed to update listing')
        console.error('❌ [EDIT-LISTING] Update failed:', (result as any).error)
      }
      
    } catch (error) {
      console.error('💥 [EDIT-LISTING] Update error:', error)
      toast.error('Failed to update listing. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <Icons.spinner className="w-8 h-8 text-white animate-spin" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Listing Data</h2>
          <p className="text-gray-600">Preparing your listing for editing...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error || !formData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-2xl mb-4">
            <Icons.x className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Listing</h2>
          <p className="text-gray-600 mb-4">{error || 'Listing not found'}</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => router.back()} variant="outline">
              <Icons.arrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
            <Button onClick={() => window.location.reload()}>
              <Icons.refresh className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/60 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="hover:bg-gray-100"
              >
                <Icons.arrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Edit Listing</h1>
                <p className="text-sm text-gray-600">{formData.brand} {formData.model}</p>
              </div>
            </div>
            
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <>
                  <Icons.spinner className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Icons.check className="w-4 h-4 mr-2" />
                  Update Listing
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Device Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Icons.smartphone className="w-5 h-5" />
                <span>Device Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="brand">Brand</Label>
                  <Input
                    id="brand"
                    value={formData.brand}
                    onChange={(e) => updateFormData({ brand: e.target.value })}
                    placeholder="e.g., Apple"
                  />
                </div>
                <div>
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    value={formData.model}
                    onChange={(e) => updateFormData({ model: e.target.value })}
                    placeholder="e.g., iPhone 14 Pro"
                  />
                </div>
                <div>
                  <Label htmlFor="storage">Storage</Label>
                  <select
                    id="storage"
                    value={formData.storage}
                    onChange={(e) => updateFormData({ storage: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select storage</option>
                    <option value="64GB">64GB</option>
                    <option value="128GB">128GB</option>
                    <option value="256GB">256GB</option>
                    <option value="512GB">512GB</option>
                    <option value="1TB">1TB</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    value={formData.color}
                    onChange={(e) => updateFormData({ color: e.target.value })}
                    placeholder="e.g., Space Black"
                  />
                </div>
                <div>
                  <Label htmlFor="condition">Condition</Label>
                  <select
                    id="condition"
                    value={formData.condition}
                    onChange={(e) => updateFormData({ condition: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select condition</option>
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="askingPrice">Asking Price (₹)</Label>
                  <Input
                    id="askingPrice"
                    type="number"
                    value={formData.askingPrice}
                    onChange={(e) => updateFormData({ askingPrice: parseInt(e.target.value) || 0 })}
                    placeholder="85000"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateFormData({ description: e.target.value })}
                  placeholder="Describe your device condition, any accessories included, etc."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Technical Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Icons.settings className="w-5 h-5" />
                <span>Technical Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="imei1">IMEI 1</Label>
                  <Input
                    id="imei1"
                    value={formData.imei1}
                    onChange={(e) => updateFormData({ imei1: e.target.value })}
                    placeholder="123456789012345"
                  />
                </div>
                <div>
                  <Label htmlFor="imei2">IMEI 2</Label>
                  <Input
                    id="imei2"
                    value={formData.imei2}
                    onChange={(e) => updateFormData({ imei2: e.target.value })}
                    placeholder="987654321098765"
                  />
                </div>
                <div>
                  <Label htmlFor="batteryHealth">Battery Health (%)</Label>
                  <Input
                    id="batteryHealth"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.batteryHealth || ''}
                    onChange={(e) => updateFormData({ batteryHealth: parseInt(e.target.value) || undefined })}
                    placeholder="95"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Device Images */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Icons.camera className="w-5 h-5" />
                <span>Device Images</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {/* Front Image */}
                <div>
                  <Label>Front View</Label>
                  <div 
                    className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors cursor-pointer"
                    onClick={() => document.getElementById('frontImageInput')?.click()}
                  >
                    {formData.frontImage ? (
                      <div className="relative">
                        <img 
                          src={typeof formData.frontImage === 'string' ? formData.frontImage : URL.createObjectURL(formData.frontImage as File)} 
                          alt="Front view" 
                          className="w-full h-32 object-cover rounded"
                        />
                        <div className="mt-2 flex gap-2 justify-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              document.getElementById('frontImageInput')?.click()
                            }}
                          >
                            Change Image
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleImageChange('frontImage', null)
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="py-8">
                        <Icons.camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Click to upload front view</p>
                      </div>
                    )}
                    <input
                      id="frontImageInput"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleImageChange('frontImage', file)
                      }}
                    />
                  </div>
                </div>

                {/* Back Image */}
                <div>
                  <Label>Back View</Label>
                  <div 
                    className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors cursor-pointer"
                    onClick={() => document.getElementById('backImageInput')?.click()}
                  >
                    {formData.backImage ? (
                      <div className="relative">
                        <img 
                          src={typeof formData.backImage === 'string' ? formData.backImage : URL.createObjectURL(formData.backImage as File)} 
                          alt="Back view" 
                          className="w-full h-32 object-cover rounded"
                        />
                        <div className="mt-2 flex gap-2 justify-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              document.getElementById('backImageInput')?.click()
                            }}
                          >
                            Change Image
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleImageChange('backImage', null)
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="py-8">
                        <Icons.camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Click to upload back view</p>
                      </div>
                    )}
                    <input
                      id="backImageInput"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleImageChange('backImage', file)
                      }}
                    />
                  </div>
                </div>

                {/* Top Image */}
                <div>
                  <Label>Top View</Label>
                  <div 
                    className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors cursor-pointer"
                    onClick={() => document.getElementById('topImageInput')?.click()}
                  >
                    {formData.topImage ? (
                      <div className="relative">
                        <img 
                          src={typeof formData.topImage === 'string' ? formData.topImage : URL.createObjectURL(formData.topImage as File)} 
                          alt="Top view" 
                          className="w-full h-32 object-cover rounded"
                        />
                        <div className="mt-2 flex gap-2 justify-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              document.getElementById('topImageInput')?.click()
                            }}
                          >
                            Change Image
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleImageChange('topImage', null)
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="py-8">
                        <Icons.camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Click to upload top view</p>
                      </div>
                    )}
                    <input
                      id="topImageInput"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleImageChange('topImage', file)
                      }}
                    />
                  </div>
                </div>

                {/* Bottom Image */}
                <div>
                  <Label>Bottom View</Label>
                  <div 
                    className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors cursor-pointer"
                    onClick={() => document.getElementById('bottomImageInput')?.click()}
                  >
                    {formData.bottomImage ? (
                      <div className="relative">
                        <img 
                          src={typeof formData.bottomImage === 'string' ? formData.bottomImage : URL.createObjectURL(formData.bottomImage as File)} 
                          alt="Bottom view" 
                          className="w-full h-32 object-cover rounded"
                        />
                        <div className="mt-2 flex gap-2 justify-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              document.getElementById('bottomImageInput')?.click()
                            }}
                          >
                            Change Image
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleImageChange('bottomImage', null)
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="py-8">
                        <Icons.camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Click to upload bottom view</p>
                      </div>
                    )}
                    <input
                      id="bottomImageInput"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleImageChange('bottomImage', file)
                      }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Icons.user className="w-5 h-5" />
                <span>Contact Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contactName">Contact Name</Label>
                  <Input
                    id="contactName"
                    value={formData.contactName}
                    onChange={(e) => updateFormData({ contactName: e.target.value })}
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <Label htmlFor="mobile">Mobile Number</Label>
                  <Input
                    id="mobile"
                    value={formData.mobile}
                    onChange={(e) => updateFormData({ mobile: e.target.value })}
                    placeholder="9876543210"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData({ email: e.target.value })}
                    placeholder="john.doe@example.com"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => updateFormData({ address: e.target.value })}
                  placeholder="123 Main Street, Apartment 4B"
                  rows={2}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => updateFormData({ city: e.target.value })}
                    placeholder="Kochi"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => updateFormData({ state: e.target.value })}
                    placeholder="Kerala"
                  />
                </div>
                <div>
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input
                    id="pincode"
                    value={formData.pincode}
                    onChange={(e) => updateFormData({ pincode: e.target.value })}
                    placeholder="682001"
                  />
                </div>
              </div>
              
              {formData.landmark && (
                <div>
                  <Label htmlFor="landmark">Landmark (Optional)</Label>
                  <Input
                    id="landmark"
                    value={formData.landmark}
                    onChange={(e) => updateFormData({ landmark: e.target.value })}
                    placeholder="Near City Mall"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pickup Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Icons.mapPin className="w-5 h-5" />
                <span>Pickup Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="pickupAddress">Pickup Address</Label>
                <Textarea
                  id="pickupAddress"
                  value={formData.pickupAddress}
                  onChange={(e) => updateFormData({ pickupAddress: e.target.value })}
                  placeholder="Same as contact address or different pickup location"
                  rows={2}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="pickupCity">Pickup City</Label>
                  <Input
                    id="pickupCity"
                    value={formData.pickupCity}
                    onChange={(e) => updateFormData({ pickupCity: e.target.value })}
                    placeholder="Kochi"
                  />
                </div>
                <div>
                  <Label htmlFor="pickupState">Pickup State</Label>
                  <Input
                    id="pickupState"
                    value={formData.pickupState}
                    onChange={(e) => updateFormData({ pickupState: e.target.value })}
                    placeholder="Kerala"
                  />
                </div>
                <div>
                  <Label htmlFor="pickupPincode">Pickup Pincode</Label>
                  <Input
                    id="pickupPincode"
                    value={formData.pickupPincode}
                    onChange={(e) => updateFormData({ pickupPincode: e.target.value })}
                    placeholder="682001"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="pickupTime">Preferred Pickup Time</Label>
                <select
                  id="pickupTime"
                  value={formData.pickupTime}
                  onChange={(e) => updateFormData({ pickupTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select preferred time</option>
                  <option value="morning">Morning (9 AM - 12 PM)</option>
                  <option value="afternoon">Afternoon (12 PM - 4 PM)</option>
                  <option value="evening">Evening (4 PM - 7 PM)</option>
                  <option value="anytime">Anytime</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Bank Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Icons.shield className="w-5 h-5" />
                <span>Bank Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-start space-x-2">
                  <Icons.info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Secure Payment Information</p>
                    <p className="text-xs text-blue-700 mt-1">
                      Your bank details are encrypted and used only for payment processing when your device is sold.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="accountHolderName">Account Holder Name</Label>
                  <Input
                    id="accountHolderName"
                    value={formData.accountHolderName}
                    onChange={(e) => updateFormData({ accountHolderName: e.target.value })}
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    value={formData.bankName}
                    onChange={(e) => updateFormData({ bankName: e.target.value })}
                    placeholder="State Bank of India"
                  />
                </div>
                <div>
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    value={formData.accountNumber}
                    onChange={(e) => updateFormData({ accountNumber: e.target.value })}
                    placeholder="1234567890123456"
                    type="password"
                  />
                </div>
                <div>
                  <Label htmlFor="ifscCode">IFSC Code</Label>
                  <Input
                    id="ifscCode"
                    value={formData.ifscCode}
                    onChange={(e) => updateFormData({ ifscCode: e.target.value })}
                    placeholder="SBIN0001234"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Warranty & Purchase Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Icons.shield className="w-5 h-5" />
                <span>Warranty & Purchase Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hasWarranty">Has Warranty</Label>
                  <select
                    id="hasWarranty"
                    value={formData.hasWarranty ? 'true' : 'false'}
                    onChange={(e) => updateFormData({ hasWarranty: e.target.value === 'true' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="false">No Warranty</option>
                    <option value="true">Has Warranty</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="hasBill">Has Original Bill</Label>
                  <select
                    id="hasBill"
                    value={formData.hasBill ? 'true' : 'false'}
                    onChange={(e) => updateFormData({ hasBill: e.target.value === 'true' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="false">No Bill</option>
                    <option value="true">Has Bill</option>
                  </select>
                </div>
              </div>
              
              {formData.hasWarranty && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="warrantyType">Warranty Type</Label>
                    <Input
                      id="warrantyType"
                      value={formData.warrantyType || ''}
                      onChange={(e) => updateFormData({ warrantyType: e.target.value })}
                      placeholder="Manufacturer, Extended, etc."
                    />
                  </div>
                  <div>
                    <Label htmlFor="warrantyExpiry">Warranty Expiry Date</Label>
                    <Input
                      id="warrantyExpiry"
                      type="date"
                      value={formData.warrantyExpiry || ''}
                      onChange={(e) => updateFormData({ warrantyExpiry: e.target.value })}
                    />
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="purchaseDate">Purchase Date (Optional)</Label>
                  <Input
                    id="purchaseDate"
                    type="date"
                    value={formData.purchaseDate || ''}
                    onChange={(e) => updateFormData({ purchaseDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="purchasePrice">Original Purchase Price (Optional)</Label>
                  <Input
                    id="purchasePrice"
                    type="number"
                    value={formData.purchasePrice || ''}
                    onChange={(e) => updateFormData({ purchasePrice: parseInt(e.target.value) || undefined })}
                    placeholder="120000"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              size="lg"
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <>
                  <Icons.spinner className="w-4 h-4 mr-2 animate-spin" />
                  Updating Listing...
                </>
              ) : (
                <>
                  <Icons.check className="w-4 h-4 mr-2" />
                  Update Listing
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 