// IMPORTANT: All API requests must use the field name mobile_number (never mobile) for phone numbers, as required by the server.
// SELLIKO Client Integration Layer
// This file will handle all Supabase API interactions

const API_BASE = process.env.NEXT_PUBLIC_SELLIKO_API_BASE || 'http://127.0.0.1:54321/'
const STORAGE_URL = process.env.NEXT_PUBLIC_S3_URL || process.env.NEXT_PUBLIC_SELLIKO_API_BASE || 'http://127.0.0.1:54321/'

class SellikoClient {
  constructor() {
    this.apiBase = API_BASE
    this.storageUrl = STORAGE_URL
    console.log('🏗️ [SELLIKO-CLIENT] Client initialized with API base:', this.apiBase)
    console.log('🗄️ [SELLIKO-CLIENT] Storage URL:', this.storageUrl)
  }

  // Generate UUID for file naming
  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0
      const v = c == 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  }

  // Convert image to WebP format
  async convertToWebP(file) {
    console.log('🖼️ [SELLIKO-CLIENT] Converting image to WebP:', file.name)
    
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        // Set canvas dimensions to image dimensions
        canvas.width = img.width
        canvas.height = img.height
        
        // Draw image on canvas
        ctx.drawImage(img, 0, 0)
        
        // Convert to WebP blob
        canvas.toBlob((blob) => {
          if (blob) {
            console.log('✅ [SELLIKO-CLIENT] Image converted to WebP successfully')
            resolve(blob)
          } else {
            console.error('❌ [SELLIKO-CLIENT] Failed to convert image to WebP')
            reject(new Error('Failed to convert image to WebP'))
          }
        }, 'image/webp', 0.8) // 80% quality
      }
      
      img.onerror = () => {
        console.error('❌ [SELLIKO-CLIENT] Failed to load image for conversion')
        reject(new Error('Failed to load image'))
      }
      
      img.src = URL.createObjectURL(file)
    })
  }

  // Convert file to data URL (fallback method)
  async fileToDataUrl(file) {
    console.log('🔄 [SELLIKO-CLIENT] Converting file to data URL:', file.name)
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = () => {
        console.log('✅ [SELLIKO-CLIENT] File converted to data URL')
        resolve(reader.result)
      }
      
      reader.onerror = () => {
        console.error('❌ [SELLIKO-CLIENT] Failed to convert file to data URL')
        reject(new Error('Failed to convert file to data URL'))
      }
      
      reader.readAsDataURL(file)
    })
  }

  // Upload file to Supabase storage
  async uploadFile(file, fileName) {
    console.log('📤 [SELLIKO-CLIENT] Uploading file:', fileName)
    
    try {
      const token = localStorage.getItem('selliko_access_token')
      if (!token) {
        throw new Error('No access token found')
      }

      // Get user_id from stored user data
      const userData = localStorage.getItem('selliko_user')
      if (!userData) {
        throw new Error('No user data found')
      }
      
      const user = JSON.parse(userData)
      const userId = user.id
      if (!userId) {
        throw new Error('No user ID found')
      }

      console.log('👤 [SELLIKO-CLIENT] Using user ID:', userId)

      // Create form data
      const formData = new FormData()
      formData.append('file', file, fileName)

      // Use correct path format: listing_images/{user_id}{filename}
      const uploadUrl = `${this.storageUrl}storage/v1/object/listing_images/${userId}${fileName}`
      
      console.log('🎯 [SELLIKO-CLIENT] Upload URL:', uploadUrl)
      console.log('📋 [SELLIKO-CLIENT] File details:', {
        name: fileName,
        size: file.size,
        type: file.type,
        userId: userId
      })

      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type - let browser set it for FormData
        },
        body: formData
      })

      console.log('🌐 [SELLIKO-CLIENT] Upload response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ [SELLIKO-CLIENT] Upload error response:', errorText)
        throw new Error(`Upload failed: ${response.status} ${response.statusText} - ${errorText}`)
      }

      let result
      try {
        result = await response.json()
        console.log('📥 [SELLIKO-CLIENT] Upload result:', result)
      } catch (jsonError) {
        console.log('ℹ️ [SELLIKO-CLIENT] No JSON response, assuming success')
        result = { success: true }
      }

      // Construct the public URL with user_id
      const fileUrl = `${this.storageUrl}storage/v1/object/public/listing_images/${userId}${fileName}`
      
      console.log('✅ [SELLIKO-CLIENT] File uploaded successfully:', fileUrl)
      return fileUrl
      
    } catch (error) {
      console.error('💥 [SELLIKO-CLIENT] File upload error:', error)
      
      // Try alternative upload method if first fails
      console.log('🔄 [SELLIKO-CLIENT] Trying alternative upload method...')
      try {
        return await this.uploadFileAlternative(file, fileName)
      } catch (altError) {
        console.error('💥 [SELLIKO-CLIENT] Alternative upload also failed:', altError)
        throw new Error(`File upload failed: ${error.message}`)
      }
    }
  }

  // Alternative upload method using direct POST to bucket
  async uploadFileAlternative(file, fileName) {
    console.log('🔄 [SELLIKO-CLIENT] Using alternative upload method for:', fileName)
    
    try {
      const token = localStorage.getItem('selliko_access_token')
      if (!token) {
        throw new Error('No access token found')
      }

      // Get user_id from stored user data
      const userData = localStorage.getItem('selliko_user')
      if (!userData) {
        throw new Error('No user data found')
      }
      
      const user = JSON.parse(userData)
      const userId = user.id
      if (!userId) {
        throw new Error('No user ID found')
      }

      console.log('👤 [SELLIKO-CLIENT] Alternative upload using user ID:', userId)

      // Try uploading using the bucket creation/update endpoint
      const uploadUrl = `${this.storageUrl}storage/v1/object/listing_images`
      
      const formData = new FormData()
      // Include user_id in the filename for alternative method
      formData.append('file', file, `${userId}${fileName}`)

      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-upsert': 'true', // Allow overwrite if file exists
        },
        body: formData
      })

      console.log('🌐 [SELLIKO-CLIENT] Alternative upload response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ [SELLIKO-CLIENT] Alternative upload error:', errorText)
        throw new Error(`Alternative upload failed: ${response.status} - ${errorText}`)
      }

      const fileUrl = `${this.storageUrl}storage/v1/object/public/listing_images/${userId}${fileName}`
      console.log('✅ [SELLIKO-CLIENT] Alternative upload successful:', fileUrl)
      return fileUrl

    } catch (error) {
      console.error('💥 [SELLIKO-CLIENT] Alternative upload error:', error)
      throw error
    }
  }

  // Validate device listing data
  validateListingData(data) {
    console.log('🔍 [SELLIKO-CLIENT] Validating listing data...')
    console.log('📋 [SELLIKO-CLIENT] Data to validate:', {
      brand: data.brand,
      model: data.model,
      storage: data.storage,
      condition: data.condition,
      imei1: data.imei1 ? `${data.imei1.substring(0, 5)}***` : 'MISSING',
      imei2: data.imei2 ? `${data.imei2.substring(0, 5)}***` : 'OPTIONAL',
      expectedPrice: data.expectedPrice,
      name: data.name,
      mobile: data.mobile ? `${data.mobile.substring(0, 5)}***` : 'MISSING',
      email: data.email,
      imageCount: Object.values(data.images || {}).filter(Boolean).length,
      termsAccepted: data.termsAccepted,
      privacyAccepted: data.privacyAccepted,
      whatsappConsent: data.whatsappConsent
    })
    
    const errors = []

    // Check required device fields
    if (!data.brand) errors.push('Brand is required')
    if (!data.model) errors.push('Model is required')
    if (!data.storage) errors.push('Storage is required')
    if (!data.condition) errors.push('Condition is required')
    
    // Check IMEI - IMEI1 is required, IMEI2 is optional
    if (!data.imei1 || data.imei1.length < 10) errors.push('Valid IMEI 1 is required')
    // IMEI2 is optional - only validate if provided
    if (data.imei2 && data.imei2.length > 0 && data.imei2.length < 10) {
      errors.push('IMEI 2 must be valid if provided')
    }
    
    // Check pricing
    if (!data.expectedPrice || parseInt(data.expectedPrice) <= 0) {
      errors.push('Valid expected price is required')
    }
    
    // Check personal details
    if (!data.name) errors.push('Name is required')
    if (!data.mobile) errors.push('Mobile number is required')
    if (!data.email) errors.push('Email is required')
    
    // Check images - at least 2 required
    const imageCount = Object.values(data.images || {}).filter(Boolean).length
    if (imageCount < 2) errors.push('At least 2 device images are required')
    
    // Check terms acceptance - all must be true
    if (!data.termsAccepted) errors.push('Terms must be accepted')
    if (!data.privacyAccepted) errors.push('Privacy policy must be accepted')
    if (!data.whatsappConsent) errors.push('WhatsApp consent must be provided')

    if (errors.length > 0) {
      console.error('❌ [SELLIKO-CLIENT] Validation failed:', errors)
      return { valid: false, errors }
    }

    console.log('✅ [SELLIKO-CLIENT] Data validation passed')
    return { valid: true, errors: [] }
  }

  // Create device listing with file uploads
  /**
   * Creates a device listing with image uploads and validation
   * 
   * SERVER EXPECTED REQUEST STRUCTURE:
   * {
   *   // Device Information
   *   brand: string,                    // Required: Device brand
   *   model: string,                    // Required: Device model  
   *   storage: string,                  // Required: Storage capacity
   *   color?: string | null,            // Optional: Device color
   *   condition: string,                // Required: Device condition
   *   description?: string | null,      // Optional: Additional description
   *   
   *   // Technical Details
   *   imei1: string,                    // Required: Primary IMEI
   *   imei2?: string | null,            // Optional: Secondary IMEI
   *   battery_health?: number | null,   // Optional: Battery health percentage
   *   expected_price: number,           // Required: Asking price
   *   asking_price?: number | null,     // Optional: Alias for expected_price
   *   device_condition?: string | null, // Optional: Alias for condition
   *   
   *   // Images
   *   device_images: {                  // Required: Device photos object
   *     front?: string | null,          // Optional: Front image URL
   *     back?: string | null,           // Optional: Back image URL  
   *     top?: string | null,            // Optional: Top image URL
   *     bottom?: string | null,         // Optional: Bottom image URL
   *   },
   *   warranty_image_url?: string | null, // Optional: Warranty document URL
   *   bill_image_url?: string | null,     // Optional: Purchase bill URL
   *   
   *   // Warranty Information
   *   warranty_status: string,          // Required: 'active' | 'expired' | 'none'
   *   warranty_expiry?: string | null,  // Optional: ISO date string
   *   warranty_type?: string | null,    // Optional: Warranty type
   *   
   *   // Bill Information
   *   has_bill: boolean,                // Required: Whether bill is available
   *   purchase_date?: string | null,    // Optional: Purchase date
   *   purchase_price?: number | null,   // Optional: Original purchase price
   *   
   *   // Personal Details
   *   contact_name: string,             // Required: Contact person name
   *   mobile_number: string,            // Required: Phone number (NOT 'mobile')
   *   email: string,                    // Required: Email address
   *   
   *   // Address Information
   *   address: string,                  // Required: Street address
   *   city: string,                     // Required: City
   *   pincode: string,                  // Required: Postal code
   *   state: string,                    // Required: State (default: Kerala)
   *   landmark?: string | null,         // Optional: Nearby landmark
   *   
   *   // Bank Details
   *   account_number: string,           // Required: Bank account number
   *   ifsc_code: string,                // Required: Bank IFSC code
   *   account_holder_name: string,      // Required: Account holder name
   *   bank_name?: string | null,        // Optional: Bank name
   *   
   *   // Pickup Details
   *   pickup_address: string,           // Required: Pickup address
   *   pickup_city: string,              // Required: Pickup city
   *   pickup_pincode: string,           // Required: Pickup postal code
   *   pickup_time?: string | null,      // Optional: Preferred pickup time
   *   
   *   // Terms & Consent
   *   terms_accepted: boolean,          // Required: Terms acceptance
   *   privacy_accepted: boolean,        // Required: Privacy policy acceptance
   *   whatsapp_consent: boolean,        // Required: WhatsApp notifications consent
   *   
   *   // System Fields
   *   listing_type?: string,            // Optional: Always 'device'
   *   status?: string,                  // Optional: Initial status 'pending'
   *   created_at?: string,              // Optional: ISO timestamp
   *   updated_at?: string               // Optional: ISO timestamp
   * }
   */
  async createDeviceListing(listingData) {
    console.log('🚀 [SELLIKO-CLIENT] createDeviceListing called')
    console.log('📋 [SELLIKO-CLIENT] Raw input data:', listingData)
    console.log('📋 [SELLIKO-CLIENT] Processing listing data:', {
      hasImages: Object.keys(listingData.images || {}).length > 0,
      hasWarrantyImage: !!listingData.warrantyImage,
      hasBillImage: !!listingData.billImage,
      brand: listingData.brand,
      model: listingData.model,
      name: listingData.name,
      mobile: listingData.mobile ? `${listingData.mobile.substring(0, 5)}***` : 'MISSING',
      imei1: listingData.imei1 ? `${listingData.imei1.substring(0, 5)}***` : 'MISSING',
      imei2: listingData.imei2 ? `${listingData.imei2.substring(0, 5)}***` : 'EMPTY',
      expectedPrice: listingData.expectedPrice
    })

    try {
      // Validate data first
      console.log('🔍 [SELLIKO-CLIENT] Starting validation...')
      const validation = this.validateListingData(listingData)
      
      if (!validation.valid) {
        console.error('❌ [SELLIKO-CLIENT] Validation failed - API call will NOT be made')
        console.error('📋 [SELLIKO-CLIENT] Validation errors:', validation.errors)
        return {
          success: false,
          error: 'Validation failed: ' + validation.errors.join(', '),
          errors: validation.errors
        }
      }
      
      console.log('✅ [SELLIKO-CLIENT] Validation passed - proceeding with API call')

      // Clone data to avoid mutating original
      const processedData = { ...listingData }
      
      // Process and upload images
      console.log('🖼️ [SELLIKO-CLIENT] Processing images...')
      const imageUrls = {}
      
      for (const [position, file] of Object.entries(listingData.images || {})) {
        if (file) {
          try {
            console.log(`📸 [SELLIKO-CLIENT] Processing ${position} image:`, file.name)
            
            // Convert to WebP if it's an image
            const isImage = file.type.startsWith('image/')
            let uploadFile = file
            let fileName = `${this.generateUUID()}`
            
            if (isImage) {
              uploadFile = await this.convertToWebP(file)
              fileName += '.webp'
            } else {
              fileName += `.${file.name.split('.').pop()}`
            }
            
            // Upload file
            try {
              const fileUrl = await this.uploadFile(uploadFile, fileName)
              imageUrls[position] = fileUrl
            } catch (uploadError) {
              console.warn(`⚠️ [SELLIKO-CLIENT] Upload failed for ${position}, using fallback...`)
              // Fallback: use data URL for now (not recommended for production)
              const dataUrl = await this.fileToDataUrl(uploadFile)
              imageUrls[position] = dataUrl
            }
            
          } catch (error) {
            console.error(`💥 [SELLIKO-CLIENT] Failed to process ${position} image:`, error)
            return {
              success: false,
              error: `Failed to process ${position} image: ${error.message}`
            }
          }
        }
      }
      
      // Process warranty image if exists
      if (listingData.warrantyImage) {
        try {
          console.log('📄 [SELLIKO-CLIENT] Processing warranty image...')
          const fileName = `warranty_${this.generateUUID()}.webp`
          const webpFile = await this.convertToWebP(listingData.warrantyImage)
          processedData.warrantyImageUrl = await this.uploadFile(webpFile, fileName)
        } catch (error) {
          console.error('💥 [SELLIKO-CLIENT] Failed to process warranty image:', error)
          return {
            success: false,
            error: `Failed to upload warranty image: ${error.message}`
          }
        }
      }
      
      // Process bill image if exists
      if (listingData.billImage) {
        try {
          console.log('🧾 [SELLIKO-CLIENT] Processing bill image...')
          const fileName = `bill_${this.generateUUID()}.webp`
          const webpFile = await this.convertToWebP(listingData.billImage)
          processedData.billImageUrl = await this.uploadFile(webpFile, fileName)
        } catch (error) {
          console.error('💥 [SELLIKO-CLIENT] Failed to process bill image:', error)
          return {
            success: false,
            error: `Failed to upload bill image: ${error.message}`
          }
        }
      }

      // Replace image objects with URLs and prepare final data
      const finalData = {
        // Device Information (required)
        brand: processedData.brand || null,
        model: processedData.model || null,
        storage: processedData.storage || null,
        color: processedData.color || null,
        condition: processedData.condition || null,
        description: processedData.description || null,
        
        // Technical Details (required)
        imei1: processedData.imei1 || null,
        imei2: processedData.imei2 || null,
        battery_health: processedData.batteryHealth ? parseInt(processedData.batteryHealth) : null,
        expected_price: processedData.expectedPrice ? parseInt(processedData.expectedPrice) : null,
        
        // Images (replace with URLs)
        device_images: imageUrls || {},
        warranty_image_url: processedData.warrantyImageUrl || null,
        bill_image_url: processedData.billImageUrl || null,
        
        // Warranty Information
        warranty_status: processedData.warrantyStatus || 'none',
        warranty_expiry: processedData.warrantyExpiry || null,
        warranty_type: processedData.warrantyType || null,
        
        // Bill Information
        has_bill: processedData.hasBill !== undefined ? processedData.hasBill : false,
        purchase_date: processedData.purchaseDate || null,
        purchase_price: processedData.purchasePrice ? parseInt(processedData.purchasePrice) : null,
        
        // Personal Details (use mobile_number as required by server)
        contact_name: processedData.name || null,
        mobile_number: processedData.mobile || null,
        email: processedData.email || null,
        
        // Address Information (required)
        address: processedData.address || null,
        city: processedData.city || null,
        pincode: processedData.pincode || null,
        state: processedData.state || 'Kerala',
        landmark: processedData.landmark || null,
        
        // Bank Details (required)
        account_number: processedData.accountNumber || null,
        ifsc_code: processedData.ifscCode || null,
        account_holder_name: processedData.accountHolderName || null,
        bank_name: processedData.bankName || null,
        
        // Pickup Details (required)
        pickup_address: processedData.pickupAddress || null,
        pickup_city: processedData.pickupCity || null,
        pickup_pincode: processedData.pickupPincode || null,
        pickup_time: processedData.preferredTime || null,
        
        // Terms Agreement (required)
        terms_accepted: processedData.termsAccepted || false,
        privacy_accepted: processedData.privacyAccepted || false,
        whatsapp_consent: processedData.whatsappConsent || false,
        
        // Additional fields that might be expected
        asking_price: processedData.expectedPrice ? parseInt(processedData.expectedPrice) : null, // Alias for expected_price
        device_condition: processedData.condition || null, // Alias for condition
        listing_type: 'device', // Static value
        status: 'pending', // Initial status
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      console.log('📤 [SELLIKO-CLIENT] Submitting listing to API...')
      console.log('🎯 [SELLIKO-CLIENT] Final data structure:', finalData)
      console.log('📊 [SELLIKO-CLIENT] Data summary:', {
        totalFields: Object.keys(finalData).length,
        nullFields: Object.values(finalData).filter(v => v === null).length,
        hasDeviceImages: Object.keys(finalData.device_images).length,
        hasWarrantyImage: !!finalData.warranty_image_url,
        hasBillImage: !!finalData.bill_image_url,
        expectedPrice: finalData.expected_price,
        brand: finalData.brand,
        model: finalData.model,
        contactName: finalData.contact_name,
        mobileNumber: finalData.mobile_number
      })

      // Submit to API
      const token = localStorage.getItem('selliko_access_token')
      if (!token) {
        throw new Error('No access token found')
      }

      const response = await fetch(`${this.apiBase}functions/v1/create-listing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(finalData)
      })

      console.log('🌐 [SELLIKO-CLIENT] Raw API response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      })

      const result = await response.json()
      
      console.log('📥 [SELLIKO-CLIENT] API response data:', {
        success: result.success,
        hasListingId: !!result.listing_id,
        message: result.message,
        error: result.error
      })

      return result

    } catch (error) {
      console.error('💥 [SELLIKO-CLIENT] createDeviceListing error:', error)
      console.error('📋 [SELLIKO-CLIENT] Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      })
      return {
        success: false,
        error: error.message || 'Network error occurred'
      }
    }
  }

  // Get instance_id from localStorage or generate one
  getInstanceId() {
    console.log('🆔 [SELLIKO-CLIENT] Getting instance ID...')
    if (typeof window === 'undefined') {
      console.log('🚫 [SELLIKO-CLIENT] Window undefined, returning null')
      return null
    }
    
    let instanceId = localStorage.getItem('selliko_instance_id')
    if (!instanceId) {
      instanceId = `instance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('selliko_instance_id', instanceId)
      console.log('🆕 [SELLIKO-CLIENT] Generated new instance ID:', instanceId)
    } else {
      console.log('♻️ [SELLIKO-CLIENT] Using existing instance ID:', instanceId)
    }
    return instanceId
  }

  // 1. getAuthOTP - accepts {mobile_number}
  async getAuthOTP(mobile_number) {
    console.log('📞 [SELLIKO-CLIENT] getAuthOTP called with:', {
      mobile_number: mobile_number ? mobile_number.substring(0, 5) + '***' : 'MISSING'
    })
    
    try {
      const instance_id = this.getInstanceId()
      
      const requestBody = {
        instance_id,
        mobile_number
      }
      
      console.log('📤 [SELLIKO-CLIENT] Making OTP request:', {
        url: `${this.apiBase}functions/v1/auth`,
        method: 'POST',
        body: {
          instance_id,
          mobile_number: mobile_number ? mobile_number.substring(0, 5) + '***' : 'MISSING'
        }
      })
      
      const response = await fetch(`${this.apiBase}functions/v1/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      console.log('🌐 [SELLIKO-CLIENT] Raw response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      })

      const data = await response.json()
      
      console.log('📥 [SELLIKO-CLIENT] Parsed response data:', {
        success: data.success,
        hasOtp: !!data.otp,
        hasOtpId: !!data.otp_id,
        hasUserId: !!data.user_id,
        hasUserDetails: !!data.user_details,
        listingCount: data.listing_count,
        message: data.message,
        error: data.error,
        fullResponseKeys: Object.keys(data)
      })
      
      // Log the actual otp_id value (safely)
      if (data.otp_id) {
        console.log('🔑 [SELLIKO-CLIENT] OTP ID received:', data.otp_id)
      } else {
        console.error('❌ [SELLIKO-CLIENT] No otp_id in response!')
      }
      
      return data
    } catch (error) {
      console.error('💥 [SELLIKO-CLIENT] getAuthOTP error:', error)
      console.error('📋 [SELLIKO-CLIENT] Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      })
      return {
        success: false,
        error: 'Network error occurred'
      }
    }
  }

  // 2. verifyAuthOTP - accepts (otp, otp_id, mobile_number)
  async verifyAuthOTP(otp, otp_id, mobile) {
    console.log('🔐 [SELLIKO-CLIENT] verifyAuthOTP called with:', {
      otp: otp ? '***masked***' : 'MISSING',
      otp_id: otp_id || 'MISSING',
      mobile_number: mobile ? mobile.substring(0, 5) + '***' : 'MISSING'
    })
    
    try {
      const requestBody = {
        otp,
        otp_id,
        mobile_number: mobile
      }
      
      console.log('📤 [SELLIKO-CLIENT] Making verify request:', {
        url: `${this.apiBase}functions/v1/auth-verify`,
        method: 'POST',
        body: {
          otp: '***masked***',
          otp_id: otp_id || 'MISSING',
          mobile_number: mobile ? mobile.substring(0, 5) + '***' : 'MISSING'
        }
      })
      
      const response = await fetch(`${this.apiBase}functions/v1/auth-verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      console.log('🌐 [SELLIKO-CLIENT] Verify raw response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      })

      const data = await response.json()
      
      console.log('📥 [SELLIKO-CLIENT] Verify response data:', {
        success: data.success,
        hasUser: !!data.user,
        hasSession: !!data.session,
        message: data.message,
        error: data.error,
        userRole: data.user?.user_role,
        sessionKeys: data.session ? Object.keys(data.session) : []
      })
      
      // Store session data if successful
      if (data.success && data.session && typeof window !== 'undefined') {
        console.log('💾 [SELLIKO-CLIENT] Storing session data...')
        
        // Ensure user data has proper role format
        if (data.user) {
          // Normalize user role
          const normalizedUser = {
            ...data.user,
            user_role: (data.user.user_role || data.user.role || 'CLIENT').toUpperCase()
          }
          console.log('👤 [SELLIKO-CLIENT] Normalized user data:', {
            id: normalizedUser.id,
            role: normalizedUser.user_role,
            hasRequiredFields: !!(normalizedUser.id && normalizedUser.user_role)
          })
          localStorage.setItem('selliko_user', JSON.stringify(normalizedUser))
        }
        
        localStorage.setItem('selliko_access_token', data.session.access_token)
        console.log('✅ [SELLIKO-CLIENT] Session data stored successfully')
      } else {
        console.log('⚠️ [SELLIKO-CLIENT] Not storing session data:', {
          success: data.success,
          hasSession: !!data.session,
          windowAvailable: typeof window !== 'undefined'
        })
      }

      return data
    } catch (error) {
      console.error('💥 [SELLIKO-CLIENT] verifyAuthOTP error:', error)
      console.error('📋 [SELLIKO-CLIENT] Verify error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      })
      return {
        success: false,
        error: 'Network error occurred'
      }
    }
  }

  // 3. getCurrentUser - calls default supabase endpoint to get current user from JWT
  async getCurrentUser() {
    console.log('👤 [SELLIKO-CLIENT] getCurrentUser called')
    
    try {
      if (typeof window === 'undefined') {
        console.log('🚫 [SELLIKO-CLIENT] Window undefined, returning null')
        return null
      }
      
      const token = localStorage.getItem('selliko_access_token')
      if (!token) {
        console.log('🔑 [SELLIKO-CLIENT] No access token found')
        return null
      }

      console.log('🌐 [SELLIKO-CLIENT] Making getCurrentUser request with token')
      
      const response = await fetch(`${this.apiBase}functions/v1/auth-user`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      })

      console.log('🌐 [SELLIKO-CLIENT] Raw user response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      })

      const data = await response.json()
      
      console.log('📥 [SELLIKO-CLIENT] User data received:', {
        success: data.success,
        hasUser: !!data.user,
        userRole: data.user?.user_role,
        error: data.error
      })

      return data.user
    } catch (error) {
      console.error('💥 [SELLIKO-CLIENT] getCurrentUser error:', error)
      console.error('📋 [SELLIKO-CLIENT] Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      })
      return null
    }
  }

  // 4. getListings - fetch listings with optional filters and pagination
  /**
   * Fetches device listings with optional filtering and pagination
   * 
   * @param {Object} options - Query options
   * @param {string} options.user_id - Filter by user ID (optional)
   * @param {string} options.status - Filter by listing status (optional)
   * @param {string} options.brand - Filter by device brand (optional)
   * @param {string} options.model - Filter by device model (optional)
   * @param {number} options.min_price - Minimum price filter (optional)
   * @param {number} options.max_price - Maximum price filter (optional)
   * @param {string} options.condition - Filter by device condition (optional)
   * @param {string} options.search - Search term for brand/model (optional)
   * @param {string} options.sort_by - Sort field: 'created_at', 'expected_price', 'updated_at' (default: 'created_at')
   * @param {string} options.sort_order - Sort order: 'asc' or 'desc' (default: 'desc')
   * @param {number} options.page - Page number for pagination (default: 1)
   * @param {number} options.limit - Number of items per page (default: 10)
   * @param {boolean} options.include_images - Whether to include device images (default: true)
   * @param {boolean} options.my_listings_only - Get only current user's listings (default: false)
   * 
   * @returns {Promise<Object>} Response with listings array and pagination info
   */
  async getListings(options = {}) {
    console.log('📋 [SELLIKO-CLIENT] getListings called with options:', {
      user_id: options.user_id || 'ALL',
      status: options.status || 'ALL',
      brand: options.brand || 'ALL',
      model: options.model || 'ALL',
      search: options.search || 'NONE',
      sort_by: options.sort_by || 'created_at',
      sort_order: options.sort_order || 'desc',
      page: options.page || 1,
      limit: options.limit || 10,
      my_listings_only: options.my_listings_only || false,
      include_images: options.include_images !== false
    })

    try {
      const token = localStorage.getItem('selliko_access_token')
      if (!token) {
        console.error('❌ [SELLIKO-CLIENT] No access token found')
        return {
          success: false,
          error: 'Authentication required',
          listings: [],
          pagination: null
        }
      }

      // Build request body with all parameters
      const requestBody = {
        // Add filters if provided
        user_id: options.user_id || null,
        status: options.status || null,
        brand: options.brand || null,
        model: options.model || null,
        condition: options.condition || null,
        search: options.search || null,
        min_price: options.min_price || null,
        max_price: options.max_price || null,
        
        // Add sorting and pagination
        sort_by: options.sort_by || 'created_at',
        sort_order: options.sort_order || 'desc',
        page: options.page || 1,
        limit: options.limit || 10,
        include_images: options.include_images !== false,
        my_listings_only: options.my_listings_only || false
      }

      const url = `${this.apiBase}functions/v1/get-listings`
      
      console.log('🌐 [SELLIKO-CLIENT] Making listings request:', {
        url: url,
        method: 'POST',
        hasToken: !!token,
        bodyParameters: {
          ...requestBody,
          user_id: requestBody.user_id ? 'SET' : 'NULL',
          status: requestBody.status || 'ALL',
          brand: requestBody.brand || 'ALL',
          search: requestBody.search || 'NONE'
        }
      })

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      console.log('🌐 [SELLIKO-CLIENT] Listings response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      })

      const data = await response.json()
      
      console.log('📥 [SELLIKO-CLIENT] Listings data received:', {
        success: data.success,
        listingsCount: data.listings ? data.listings.length : 0,
        hasListings: !!data.listings,
        hasPagination: !!data.pagination,
        totalCount: data.pagination ? data.pagination.total : 'unknown',
        currentPage: data.pagination ? data.pagination.page : 'unknown',
        error: data.error
      })

      // Log first listing for debugging (safely)
      if (data.listings && data.listings.length > 0) {
        const firstListing = data.listings[0]
        console.log('📋 [SELLIKO-CLIENT] Sample listing structure:', {
          id: firstListing.id,
          brand: firstListing.brand,
          model: firstListing.model,
          status: firstListing.status,
          hasImages: !!firstListing.device_images,
          expectedPrice: firstListing.expected_price,
          createdAt: firstListing.created_at
        })
      }

      return data

    } catch (error) {
      console.error('💥 [SELLIKO-CLIENT] getListings error:', error)
      console.error('📋 [SELLIKO-CLIENT] Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      })
      
      return {
        success: false,
        error: error.message || 'Network error occurred',
        listings: [],
        pagination: null
      }
    }
  }

  // 5. getMyListings - convenience method to get current user's listings
  async getMyListings(options = {}) {
    console.log('👤 [SELLIKO-CLIENT] getMyListings called')
    
    try {
      // Get current user to ensure we have user context
      const user = await this.getCurrentUser()
      if (!user) {
        console.error('❌ [SELLIKO-CLIENT] No authenticated user found')
        return {
          success: false,
          error: 'User not authenticated',
          listings: [],
          pagination: null
        }
      }

      console.log('👤 [SELLIKO-CLIENT] Getting listings for user:', user.id)
      
      // Call getListings with my_listings_only flag and user_id
      return await this.getListings({
        ...options,
        my_listings_only: true,
        user_id: user.id
      })

    } catch (error) {
      console.error('💥 [SELLIKO-CLIENT] getMyListings error:', error)
      return {
        success: false,
        error: error.message || 'Failed to get user listings',
        listings: [],
        pagination: null
      }
    }
  }

  // 6. getListingById - fetch a specific listing by ID
  /**
   * Fetches a specific device listing by its ID
   * 
   * @param {string} listingId - The ID of the listing to fetch
   * @param {Object} options - Additional options
   * @param {boolean} options.include_images - Whether to include device images (default: true)
   * @param {boolean} options.include_bids - Whether to include bid information (default: true)
   * @param {boolean} options.include_user_details - Whether to include user contact details (default: false)
   * 
   * @returns {Promise<Object>} Response with listing data
   */
  async getListingById(listingId, options = {}) {
    console.log('🔍 [SELLIKO-CLIENT] getListingById called with:', {
      listingId: listingId || 'MISSING',
      include_images: options.include_images !== false,
      include_bids: options.include_bids !== false,
      include_user_details: options.include_user_details || false
    })

    try {
      // Validate listingId
      if (!listingId) {
        console.error('❌ [SELLIKO-CLIENT] No listing ID provided')
        return {
          success: false,
          error: 'Listing ID is required',
          listing: null
        }
      }

      const token = localStorage.getItem('selliko_access_token')
      if (!token) {
        console.error('❌ [SELLIKO-CLIENT] No access token found')
        return {
          success: false,
          error: 'Authentication required',
          listing: null
        }
      }

      // Build query parameters
      const queryParams = new URLSearchParams({
        id: listingId,
        include_images: (options.include_images !== false).toString(),
        include_bids: (options.include_bids !== false).toString(),
        include_user_details: (options.include_user_details || false).toString()
      })

      const url = `${this.apiBase}functions/v1/listing?${queryParams.toString()}`
      
      console.log('🌐 [SELLIKO-CLIENT] Making listing request:', {
        url: url,
        method: 'GET',
        listingId: listingId,
        hasToken: !!token,
        queryParams: Object.fromEntries(queryParams)
      })

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      })

      console.log('🌐 [SELLIKO-CLIENT] Listing response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      })

      const data = await response.json()
      
      console.log('📥 [SELLIKO-CLIENT] Listing data received:', {
        success: data.success,
        hasListing: !!data.listing,
        listingId: data.listing?.id,
        listingStatus: data.listing?.status,
        listingBrand: data.listing?.brand,
        listingModel: data.listing?.model,
        hasImages: !!data.listing?.device_images,
        hasBids: !!data.listing?.bids,
        bidCount: data.listing?.bids?.length || 0,
        error: data.error,
        message: data.message
      })

      // Echo the full returned value as requested
      console.log('🔊 [SELLIKO-CLIENT] FULL RESPONSE ECHO:', JSON.stringify(data, null, 2))

      // Log listing details if available
      if (data.listing) {
        console.log('📋 [SELLIKO-CLIENT] Listing details:', {
          id: data.listing.id,
          brand: data.listing.brand,
          model: data.listing.model,
          storage: data.listing.storage,
          condition: data.listing.condition,
          status: data.listing.status,
          expected_price: data.listing.expected_price,
          asking_price: data.listing.asking_price,
          highest_bid: data.listing.highest_bid,
          created_at: data.listing.created_at,
          contact_name: data.listing.contact_name,
          mobile_number: data.listing.mobile_number ? `${data.listing.mobile_number.substring(0, 5)}***` : 'NOT_SET',
          city: data.listing.city,
          pickup_city: data.listing.pickup_city,
          device_images: data.listing.device_images ? Object.keys(data.listing.device_images) : [],
          image_count: data.listing.device_images ? Object.values(data.listing.device_images).filter(Boolean).length : 0
        })

        // Log bid information if available
        if (data.listing.bids && data.listing.bids.length > 0) {
          console.log('💰 [SELLIKO-CLIENT] Bid information:', {
            total_bids: data.listing.bids.length,
            highest_bid_amount: Math.max(...data.listing.bids.map(bid => bid.amount || 0)),
            latest_bid: data.listing.bids[0],
            bid_timeline: data.listing.bids.map(bid => ({
              id: bid.id,
              amount: bid.amount,
              vendor_name: bid.vendor_name,
              created_at: bid.created_at,
              status: bid.status
            }))
          })
        }
      }

      return data

    } catch (error) {
      console.error('💥 [SELLIKO-CLIENT] getListingById error:', error)
      console.error('📋 [SELLIKO-CLIENT] Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        listingId: listingId
      })
      
      return {
        success: false,
        error: error.message || 'Network error occurred',
        listing: null
      }
    }
  }

  // 7. updateListing - update an existing listing with only modified values
  /**
   * Updates an existing device listing with only the modified values
   * 
   * VALIDATION REQUIREMENTS:
   * - User role must be 'CLIENT'
   * - Listing user_id must match caller's user_id
   * - Listing status must be 'pending_approval'
   * 
   * @param {string} listingId - The ID of the listing to update
   * @param {Object} originalData - The original listing data from API
   * @param {Object} updatedData - The updated form data
   * 
   * @returns {Promise<Object>} Response with success status and updated listing
   */
  async updateListing(listingId, originalData, updatedData) {
    console.log('🔄 [SELLIKO-CLIENT] updateListing called with:', {
      listingId: listingId || 'MISSING',
      hasOriginalData: !!originalData,
      hasUpdatedData: !!updatedData
    })

    try {
      // Validate inputs
      if (!listingId) {
        throw new Error('Listing ID is required')
      }

      if (!originalData || !updatedData) {
        throw new Error('Both original and updated data are required')
      }

      // Get current user and validate permissions
      const user = await this.getCurrentUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      console.log('👤 [SELLIKO-CLIENT] Current user validation:', {
        userId: user.id,
        userRole: user.user_role,
        normalizedRole: (user.user_role || '').toUpperCase(),
        isClient: (user.user_role || '').toUpperCase() === 'CLIENT'
      })

      // Validate user role (handle both uppercase and lowercase)
      const userRole = (user.user_role || '').toUpperCase()
      if (userRole !== 'CLIENT') {
        throw new Error(`Only clients can update listings. Current role: ${user.user_role}`)
      }

      // Validate listing ownership
      console.log('🔐 [SELLIKO-CLIENT] Ownership validation:', {
        listingUserId: originalData.user_id,
        currentUserId: user.id,
        isOwner: originalData.user_id === user.id
      })
      if (originalData.user_id !== user.id) {
        throw new Error('You can only update your own listings')
      }

      // Validate listing status (allow multiple statuses that can be updated)
      console.log('📋 [SELLIKO-CLIENT] Status validation:', {
        currentStatus: originalData.status,
        allowedStatuses: ['pending', 'pending_approval', 'draft'],
        isAllowed: ['pending', 'pending_approval', 'draft'].includes(originalData.status)
      })
      const allowedStatuses = ['pending', 'pending_approval', 'draft']
      if (!allowedStatuses.includes(originalData.status)) {
        throw new Error(`Only listings with status ${allowedStatuses.join(', ')} can be updated. Current status: ${originalData.status}`)
      }

      console.log('✅ [SELLIKO-CLIENT] Validation passed - proceeding with update')

      // Process and upload new images if changed
      console.log('🖼️ [SELLIKO-CLIENT] Processing image changes...')
      const imageUrls = {}
      let hasImageChanges = false

      // Check each image position for changes
      const imagePositions = ['front', 'back', 'top', 'bottom']
      for (const position of imagePositions) {
        const originalUrl = originalData.device_images?.[position] || ''
        const updatedFile = updatedData.images?.[position]

        if (updatedFile && typeof updatedFile === 'object' && updatedFile.name) {
          // New file uploaded - process and upload it
          console.log(`📸 [SELLIKO-CLIENT] New ${position} image detected:`, updatedFile.name)
          hasImageChanges = true

          try {
            const fileName = `${this.generateUUID()}.webp`
            const webpFile = await this.convertToWebP(updatedFile)
            imageUrls[position] = await this.uploadFile(webpFile, fileName)
            console.log(`✅ [SELLIKO-CLIENT] ${position} image uploaded:`, imageUrls[position])
          } catch (uploadError) {
            console.error(`💥 [SELLIKO-CLIENT] Failed to upload ${position} image:`, uploadError)
            throw new Error(`Failed to upload ${position} image: ${uploadError.message}`)
          }
        } else if (updatedData.images?.[position] === '' && originalUrl) {
          // Image was removed
          console.log(`🗑️ [SELLIKO-CLIENT] ${position} image removed`)
          hasImageChanges = true
          imageUrls[position] = null
        } else if (typeof updatedData.images?.[position] === 'string' && updatedData.images[position] !== originalUrl) {
          // Image URL changed (unlikely but handle it)
          console.log(`🔄 [SELLIKO-CLIENT] ${position} image URL changed`)
          hasImageChanges = true
          imageUrls[position] = updatedData.images[position]
        }
        // If no change, don't include in imageUrls (will be set to null in final data)
      }

      // Process warranty and bill images
      if (updatedData.warrantyImage && typeof updatedData.warrantyImage === 'object') {
        console.log('📄 [SELLIKO-CLIENT] Processing warranty image...')
        try {
          const fileName = `warranty_${this.generateUUID()}.webp`
          const webpFile = await this.convertToWebP(updatedData.warrantyImage)
          updatedData.warrantyImageUrl = await this.uploadFile(webpFile, fileName)
        } catch (error) {
          throw new Error(`Failed to upload warranty image: ${error.message}`)
        }
      }

      if (updatedData.billImage && typeof updatedData.billImage === 'object') {
        console.log('🧾 [SELLIKO-CLIENT] Processing bill image...')
        try {
          const fileName = `bill_${this.generateUUID()}.webp`
          const webpFile = await this.convertToWebP(updatedData.billImage)
          updatedData.billImageUrl = await this.uploadFile(webpFile, fileName)
        } catch (error) {
          throw new Error(`Failed to upload bill image: ${error.message}`)
        }
      }

      // Compare original and updated data to find changes
      console.log('🔍 [SELLIKO-CLIENT] Detecting changes...')
      const changes = {}

      // Helper function to compare values
      const hasChanged = (original, updated, key) => {
        const origVal = original?.[key]
        const updatedVal = updated?.[key]
        
        // Handle null/undefined/empty string equivalence
        const normalizeValue = (val) => {
          if (val === null || val === undefined || val === '') return null
          if (typeof val === 'string') return val.trim()
          return val
        }

        const normalizedOrig = normalizeValue(origVal)
        const normalizedUpdated = normalizeValue(updatedVal)
        
        return normalizedOrig !== normalizedUpdated
      }

      // Check device information changes
      const deviceMappings = {
        brand: 'brand',
        model: 'model', 
        storage: 'storage',
        color: 'color',
        condition: 'condition',
        description: 'description'
      }

      for (const [apiKey, formKey] of Object.entries(deviceMappings)) {
        if (hasChanged(originalData.devices?.[0], updatedData, formKey)) {
          changes[apiKey] = updatedData[formKey] || null
          console.log(`📝 [SELLIKO-CLIENT] ${apiKey} changed:`, {
            from: originalData.devices?.[0]?.[apiKey],
            to: updatedData[formKey]
          })
        }
      }

      // Check technical details
      if (hasChanged(originalData.devices?.[0], updatedData, 'imei1')) {
        changes.imei1 = updatedData.imei1 || null
      }
      if (hasChanged(originalData.devices?.[0], updatedData, 'imei2')) {
        changes.imei2 = updatedData.imei2 || null
      }
      if (hasChanged(originalData.devices?.[0], { battery_health: updatedData.batteryHealth }, 'battery_health')) {
        changes.battery_health = updatedData.batteryHealth ? parseInt(updatedData.batteryHealth) : null
      }
      if (hasChanged(originalData, { expected_price: updatedData.askingPrice }, 'expected_price') ||
          hasChanged(originalData, { asking_price: updatedData.askingPrice }, 'asking_price')) {
        changes.expected_price = updatedData.askingPrice ? parseInt(updatedData.askingPrice) : null
        changes.asking_price = updatedData.askingPrice ? parseInt(updatedData.askingPrice) : null
      }

      // Check images (only include if changed)
      if (hasImageChanges) {
        changes.device_images = {}
        for (const position of imagePositions) {
          if (imageUrls.hasOwnProperty(position)) {
            changes.device_images[position] = imageUrls[position]
          } else {
            changes.device_images[position] = null
          }
        }
      }

      // Check warranty information
      if (hasChanged(originalData.devices?.[0], { warranty_status: updatedData.hasWarranty ? 'active' : 'none' }, 'warranty_status')) {
        changes.warranty_status = updatedData.hasWarranty ? 'active' : 'none'
      }
      if (hasChanged(originalData.devices?.[0], updatedData, 'warrantyType')) {
        changes.warranty_type = updatedData.warrantyType || null
      }
      if (hasChanged(originalData.devices?.[0], { warranty_expiry: updatedData.warrantyExpiry }, 'warranty_expiry')) {
        changes.warranty_expiry = updatedData.warrantyExpiry || null
      }
      if (updatedData.warrantyImageUrl) {
        changes.warranty_image_url = updatedData.warrantyImageUrl
      }

      // Check bill information
      if (hasChanged(originalData.devices?.[0], updatedData, 'hasBill')) {
        changes.has_bill = updatedData.hasBill || false
      }
      if (hasChanged(originalData.devices?.[0], { purchase_date: updatedData.purchaseDate }, 'purchase_date')) {
        changes.purchase_date = updatedData.purchaseDate || null
      }
      if (hasChanged(originalData.devices?.[0], { purchase_price: updatedData.purchasePrice }, 'purchase_price')) {
        changes.purchase_price = updatedData.purchasePrice ? parseInt(updatedData.purchasePrice) : null
      }
      if (updatedData.billImageUrl) {
        changes.bill_image_url = updatedData.billImageUrl
      }

      // Check contact information
      const clientAddress = originalData.addresses?.find(addr => addr.type === 'client') || {}
      if (hasChanged(clientAddress, { contact_name: updatedData.contactName }, 'contact_name')) {
        changes.contact_name = updatedData.contactName || null
      }
      if (hasChanged(clientAddress, { mobile_number: updatedData.mobile }, 'mobile_number')) {
        changes.mobile_number = updatedData.mobile || null
      }
      if (hasChanged(clientAddress, updatedData, 'email')) {
        changes.email = updatedData.email || null
      }
      if (hasChanged(clientAddress, updatedData, 'address')) {
        changes.address = updatedData.address || null
      }
      if (hasChanged(clientAddress, updatedData, 'city')) {
        changes.city = updatedData.city || null
      }
      if (hasChanged(clientAddress, updatedData, 'state')) {
        changes.state = updatedData.state || null
      }
      if (hasChanged(clientAddress, updatedData, 'pincode')) {
        changes.pincode = updatedData.pincode || null
      }
      if (hasChanged(clientAddress, updatedData, 'landmark')) {
        changes.landmark = updatedData.landmark || null
      }

      // Check bank details
      if (hasChanged(clientAddress, { account_holder_name: updatedData.accountHolderName }, 'account_holder_name')) {
        changes.account_holder_name = updatedData.accountHolderName || null
      }
      if (hasChanged(clientAddress, { bank_name: updatedData.bankName }, 'bank_name')) {
        changes.bank_name = updatedData.bankName || null
      }
      if (hasChanged(clientAddress, { account_number: updatedData.accountNumber }, 'account_number')) {
        changes.account_number = updatedData.accountNumber || null
      }
      if (hasChanged(clientAddress, { ifsc_code: updatedData.ifscCode }, 'ifsc_code')) {
        changes.ifsc_code = updatedData.ifscCode || null
      }

      // Check pickup information
      const pickupAddress = originalData.addresses?.find(addr => addr.type === 'pickup') || {}
      if (hasChanged(pickupAddress, { address: updatedData.pickupAddress }, 'address')) {
        changes.pickup_address = updatedData.pickupAddress || null
      }
      if (hasChanged(pickupAddress, { city: updatedData.pickupCity }, 'city')) {
        changes.pickup_city = updatedData.pickupCity || null
      }
      if (hasChanged(pickupAddress, { pincode: updatedData.pickupPincode }, 'pincode')) {
        changes.pickup_pincode = updatedData.pickupPincode || null
      }
      if (hasChanged(pickupAddress, { pickup_time: updatedData.pickupTime }, 'pickup_time')) {
        changes.pickup_time = updatedData.pickupTime || null
      }

      // Check if there are any changes
      if (Object.keys(changes).length === 0) {
        console.log('ℹ️ [SELLIKO-CLIENT] No changes detected')
        return {
          success: true,
          message: 'No changes detected',
          listing: originalData
        }
      }

      console.log('📝 [SELLIKO-CLIENT] Changes detected:', {
        changeCount: Object.keys(changes).length,
        changedFields: Object.keys(changes),
        hasImageChanges: hasImageChanges
      })

      // Prepare final update data with listing ID and only changed values
      const finalUpdateData = {
        listing_id: listingId,
        ...changes,
        updated_at: new Date().toISOString()
      }

      console.log('📤 [SELLIKO-CLIENT] Submitting update to API...')
      console.log('🎯 [SELLIKO-CLIENT] Final update data:', finalUpdateData)

      // Submit to API
      const token = localStorage.getItem('selliko_access_token')
      if (!token) {
        throw new Error('No access token found')
      }

      const response = await fetch(`${this.apiBase}functions/v1/update-listing`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(finalUpdateData)
      })

      console.log('🌐 [SELLIKO-CLIENT] Update response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      })

      const result = await response.json()
      
      console.log('📥 [SELLIKO-CLIENT] Update result:', {
        success: result.success,
        hasUpdatedListing: !!result.listing,
        message: result.message,
        error: result.error
      })

      return result

    } catch (error) {
      console.error('💥 [SELLIKO-CLIENT] updateListing error:', error)
      console.error('📋 [SELLIKO-CLIENT] Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        listingId: listingId
      })
      return {
        success: false,
        error: error.message || 'Network error occurred'
      }
    }
  }

  // 8. approveListing - approve or reject a listing (admin/agent only)
  /**
   * Approves or rejects a device listing
   * 
   * AUTHORIZATION REQUIREMENTS:
   * - User role must be 'ADMIN' or 'AGENT'
   * - Valid JWT token required in Authorization header
   * 
   * @param {string|number} listingId - The ID of the listing to approve/reject
   * @param {boolean} approve - true to approve, false to reject
   * @param {string} reasonNote - Required when approve is false, reason for rejection
   * 
   * @returns {Promise<Object>} Response with success status and updated listing info
   */
  async approveListing(listingId, approve, reasonNote = null) {
    console.log('✅ [SELLIKO-CLIENT] approveListing called with:', {
      listingId: listingId || 'MISSING',
      approve: approve,
      hasReasonNote: !!reasonNote,
      reasonLength: reasonNote ? reasonNote.length : 0
    })

    try {
      // Validate inputs
      if (!listingId) {
        throw new Error('Listing ID is required')
      }

      if (typeof approve !== 'boolean') {
        throw new Error('Approve parameter must be boolean (true/false)')
      }

      // If rejecting, reason note is required
      if (!approve && (!reasonNote || reasonNote.trim().length === 0)) {
        throw new Error('Reason note is required when rejecting a listing')
      }

      // Get current user and validate permissions
      const user = await this.getCurrentUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      console.log('👤 [SELLIKO-CLIENT] Current user validation:', {
        userId: user.id,
        userRole: user.user_role,
        normalizedRole: (user.user_role || '').toUpperCase()
      })

      // Validate user role (must be admin or agent)
      const userRole = (user.user_role || '').toUpperCase()
      const allowedRoles = ['ADMIN', 'AGENT']
      if (!allowedRoles.includes(userRole)) {
        throw new Error(`Only admins and agents can approve/reject listings. Current role: ${user.user_role}`)
      }

      console.log('✅ [SELLIKO-CLIENT] Role validation passed - proceeding with approval/rejection')

      // Get access token
      const token = localStorage.getItem('selliko_access_token')
      if (!token) {
        throw new Error('No access token found')
      }

      // Prepare request body based on approval status
      const requestBody = {
        listing_id: parseInt(listingId), // Ensure it's a number
        approve: approve
      }

      // Add reason note if rejecting
      if (!approve && reasonNote) {
        requestBody.reason_note = reasonNote.trim()
      }

      console.log('📤 [SELLIKO-CLIENT] Submitting approval request:', {
        url: `${this.apiBase}functions/v1/approve`,
        method: 'PUT',
        hasToken: !!token,
        body: {
          listing_id: requestBody.listing_id,
          approve: requestBody.approve,
          hasReasonNote: !!requestBody.reason_note,
          reasonLength: requestBody.reason_note ? requestBody.reason_note.length : 0
        }
      })

      // Make API request
      const response = await fetch(`${this.apiBase}functions/v1/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      })

      console.log('🌐 [SELLIKO-CLIENT] Approval response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      })

      const result = await response.json()
      
      console.log('📥 [SELLIKO-CLIENT] Approval result:', {
        success: result.success,
        hasUpdatedListing: !!result.listing,
        listingStatus: result.listing?.status,
        message: result.message,
        error: result.error,
        approve: approve,
        listingId: listingId
      })

      // Log action result
      if (result.success) {
        const action = approve ? 'approved' : 'rejected'
        console.log(`✅ [SELLIKO-CLIENT] Listing ${listingId} ${action} successfully`)
        if (!approve && reasonNote) {
          console.log(`📝 [SELLIKO-CLIENT] Rejection reason: ${reasonNote}`)
        }
      } else {
        console.error(`❌ [SELLIKO-CLIENT] Failed to ${approve ? 'approve' : 'reject'} listing ${listingId}:`, result.error)
      }

      return result

    } catch (error) {
      console.error('💥 [SELLIKO-CLIENT] approveListing error:', error)
      console.error('📋 [SELLIKO-CLIENT] Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        listingId: listingId,
        approve: approve,
        hasReasonNote: !!reasonNote
      })
      
      return {
        success: false,
        error: error.message || 'Network error occurred'
      }
    }
  }

  // 9. addUser - create a new user account (admin only)
  /**
   * Creates a new user account with specified role
   * 
   * AUTHORIZATION REQUIREMENTS:
   * - User role must be 'ADMIN'
   * - Valid JWT token required in Authorization header
   * 
   * @param {string} mobile_number - User's mobile phone number
   * @param {string} user_role - Role assignment: "client", "agent", or "admin"
   * 
   * @returns {Promise<Object>} Response with success status and created user info
   */
  async addUser(mobile_number, user_role) {
    console.log('👥 [SELLIKO-CLIENT] addUser called with:', {
      mobile_number: mobile_number ? mobile_number.substring(0, 5) + '***' : 'MISSING',
      user_role: user_role || 'MISSING'
    })

    try {
      // Validate inputs
      if (!mobile_number || mobile_number.trim().length === 0) {
        throw new Error('Mobile number is required')
      }

      if (!user_role || user_role.trim().length === 0) {
        throw new Error('User role is required')
      }

      // Validate user role
      const validRoles = ['anon', 'client', 'vendor', 'agent', 'admin']
      if (!validRoles.includes(user_role.toLowerCase())) {
        throw new Error(`Invalid user role. Must be one of: ${validRoles.join(', ')}`)
      }

      // Get current user and validate permissions
      const user = await this.getCurrentUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      console.log('👤 [SELLIKO-CLIENT] Current user validation:', {
        userId: user.id,
        userRole: user.user_role,
        normalizedRole: (user.user_role || '').toUpperCase()
      })

      // Validate user role (must be admin)
      const userRole = (user.user_role || '').toUpperCase()
      if (userRole !== 'ADMIN') {
        throw new Error(`Only admins can create new users. Current role: ${user.user_role}`)
      }

      console.log('✅ [SELLIKO-CLIENT] Role validation passed - proceeding with user creation')

      // Get access token
      const token = localStorage.getItem('selliko_access_token')
      if (!token) {
        throw new Error('No access token found')
      }

      // Prepare request body
      const requestBody = {
        mobile_number: mobile_number.trim(),
        user_role: user_role.toLowerCase()
      }

      console.log('📤 [SELLIKO-CLIENT] Submitting add user request:', {
        url: `${this.apiBase}functions/v1/add-user`,
        method: 'POST',
        hasToken: !!token,
        body: {
          mobile_number: mobile_number ? mobile_number.substring(0, 5) + '***' : 'MISSING',
          user_role: user_role
        }
      })

      // Make API request
      const response = await fetch(`${this.apiBase}functions/v1/add-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      })

      console.log('🌐 [SELLIKO-CLIENT] Add user response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      })

      const result = await response.json()
      
      console.log('📥 [SELLIKO-CLIENT] Add user result:', {
        success: result.success,
        hasUser: !!result.user,
        userId: result.user?.id,
        userRole: result.user?.user_role,
        message: result.message,
        error: result.error
      })

      // Log action result
      if (result.success) {
        console.log(`✅ [SELLIKO-CLIENT] User created successfully:`, {
          id: result.user?.id,
          mobile_number: mobile_number ? mobile_number.substring(0, 5) + '***' : 'MISSING',
          role: result.user?.user_role
        })
      } else {
        console.error(`❌ [SELLIKO-CLIENT] Failed to create user:`, result.error)
      }

      return result

    } catch (error) {
      console.error('💥 [SELLIKO-CLIENT] addUser error:', error)
      console.error('📋 [SELLIKO-CLIENT] Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        mobile_number: mobile_number ? mobile_number.substring(0, 5) + '***' : 'MISSING',
        user_role: user_role
      })
      
      return {
        success: false,
        error: error.message || 'Network error occurred'
      }
    }
  }

  // 10. checkUserBanStatus - get user information and ban status (admin only)
  /**
   * Retrieves user information and current ban status for administrative review
   * 
   * AUTHORIZATION REQUIREMENTS:
   * - User role must be 'ADMIN'
   * - Valid JWT token required in Authorization header
   * 
   * @param {string} mobile_number - User's mobile phone number to check
   * 
   * @returns {Promise<Object>} Response with success status and user information
   */
  async checkUserBanStatus(mobile_number) {
    console.log('🔍 [SELLIKO-CLIENT] checkUserBanStatus called with:', {
      mobile_number: mobile_number ? mobile_number.substring(0, 5) + '***' : 'MISSING'
    })

    try {
      // Validate inputs
      if (!mobile_number || mobile_number.trim().length === 0) {
        throw new Error('Mobile number is required')
      }

      // Get current user and validate permissions
      const user = await this.getCurrentUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      console.log('👤 [SELLIKO-CLIENT] Current user validation:', {
        userId: user.id,
        userRole: user.user_role,
        normalizedRole: (user.user_role || '').toUpperCase()
      })

      // Validate user role (must be admin)
      const userRole = (user.user_role || '').toUpperCase()
      if (userRole !== 'ADMIN') {
        throw new Error(`Only admins can check user ban status. Current role: ${user.user_role}`)
      }

      console.log('✅ [SELLIKO-CLIENT] Role validation passed - proceeding with ban status check')

      // Get access token
      const token = localStorage.getItem('selliko_access_token')
      if (!token) {
        throw new Error('No access token found')
      }

      // Build query parameters
      const queryParams = new URLSearchParams({
        mobile_number: mobile_number.trim()
      })

      const url = `${this.apiBase}functions/v1/check-user-ban?${queryParams.toString()}`

      console.log('📤 [SELLIKO-CLIENT] Submitting check ban status request:', {
        url: url,
        method: 'GET',
        hasToken: !!token,
        mobile_number: mobile_number ? mobile_number.substring(0, 5) + '***' : 'MISSING'
      })

      // Make API request
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('🌐 [SELLIKO-CLIENT] Check ban status response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      })

      const result = await response.json()
      
      console.log('📥 [SELLIKO-CLIENT] Check ban status result:', {
        success: result.success,
        hasUser: !!result.user,
        userId: result.user?.id,
        userRole: result.user?.user_role,
        isBanned: result.user?.is_banned,
        banReason: result.user?.ban_reason,
        error: result.error
      })

      // Log action result
      if (result.success && result.user) {
        console.log(`✅ [SELLIKO-CLIENT] User ban status retrieved:`, {
          id: result.user.id,
          mobile_number: mobile_number ? mobile_number.substring(0, 5) + '***' : 'MISSING',
          name: result.user.name,
          role: result.user.user_role,
          is_banned: result.user.is_banned,
          banned_at: result.user.banned_at,
          ban_reason: result.user.ban_reason
        })
      } else {
        console.error(`❌ [SELLIKO-CLIENT] Failed to get user ban status:`, result.error)
      }

      return result

    } catch (error) {
      console.error('💥 [SELLIKO-CLIENT] checkUserBanStatus error:', error)
      console.error('📋 [SELLIKO-CLIENT] Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        mobile_number: mobile_number ? mobile_number.substring(0, 5) + '***' : 'MISSING'
      })
      
      return {
        success: false,
        error: error.message || 'Network error occurred'
      }
    }
  }

  // 11. banUser - ban or unban a user account (admin only)
  /**
   * Bans or unbans a user account, controlling their access to the platform
   * 
   * AUTHORIZATION REQUIREMENTS:
   * - User role must be 'ADMIN'
   * - Valid JWT token required in Authorization header
   * 
   * @param {string} mobile_number - User's mobile phone number
   * @param {boolean} ban - true to ban user, false to unban user
   * @param {string} reason - Reason for banning (optional but recommended when banning)
   * 
   * @returns {Promise<Object>} Response with success status and updated user info
   */
  async banUser(mobile_number, ban, reason = null) {
    console.log('🚫 [SELLIKO-CLIENT] banUser called with:', {
      mobile_number: mobile_number ? mobile_number.substring(0, 5) + '***' : 'MISSING',
      ban: ban,
      hasReason: !!reason,
      reasonLength: reason ? reason.length : 0
    })

    try {
      // Validate inputs
      if (!mobile_number || mobile_number.trim().length === 0) {
        throw new Error('Mobile number is required')
      }

      if (typeof ban !== 'boolean') {
        throw new Error('Ban parameter must be boolean (true/false)')
      }

      // Get current user and validate permissions
      const user = await this.getCurrentUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      console.log('👤 [SELLIKO-CLIENT] Current user validation:', {
        userId: user.id,
        userRole: user.user_role,
        normalizedRole: (user.user_role || '').toUpperCase()
      })

      // Validate user role (must be admin)
      const userRole = (user.user_role || '').toUpperCase()
      if (userRole !== 'ADMIN') {
        throw new Error(`Only admins can ban/unban users. Current role: ${user.user_role}`)
      }

      console.log('✅ [SELLIKO-CLIENT] Role validation passed - proceeding with ban/unban')

      // Get access token
      const token = localStorage.getItem('selliko_access_token')
      if (!token) {
        throw new Error('No access token found')
      }

      // Prepare request body
      const requestBody = {
        mobile_number: mobile_number.trim(),
        ban: ban
      }

      // Add reason if provided
      if (reason && reason.trim().length > 0) {
        requestBody.reason = reason.trim()
      }

      console.log('📤 [SELLIKO-CLIENT] Submitting ban/unban request:', {
        url: `${this.apiBase}functions/v1/ban-user`,
        method: 'PUT',
        hasToken: !!token,
        body: {
          mobile_number: mobile_number ? mobile_number.substring(0, 5) + '***' : 'MISSING',
          ban: ban,
          hasReason: !!requestBody.reason,
          reasonLength: requestBody.reason ? requestBody.reason.length : 0
        }
      })

      // Make API request
      const response = await fetch(`${this.apiBase}functions/v1/ban-user`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      })

      console.log('🌐 [SELLIKO-CLIENT] Ban/unban response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      })

      const result = await response.json()
      
      console.log('📥 [SELLIKO-CLIENT] Ban/unban result:', {
        success: result.success,
        hasUser: !!result.user,
        userId: result.user?.id,
        isBanned: result.user?.is_banned,
        bannedAt: result.user?.banned_at,
        banReason: result.user?.ban_reason,
        message: result.message,
        error: result.error,
        action: ban ? 'ban' : 'unban'
      })

      // Log action result
      if (result.success) {
        const action = ban ? 'banned' : 'unbanned'
        console.log(`✅ [SELLIKO-CLIENT] User ${action} successfully:`, {
          mobile_number: mobile_number ? mobile_number.substring(0, 5) + '***' : 'MISSING',
          is_banned: result.user?.is_banned,
          banned_at: result.user?.banned_at,
          ban_reason: result.user?.ban_reason
        })
        if (ban && reason) {
          console.log(`📝 [SELLIKO-CLIENT] Ban reason: ${reason}`)
        }
      } else {
        console.error(`❌ [SELLIKO-CLIENT] Failed to ${ban ? 'ban' : 'unban'} user:`, result.error)
      }

      return result

    } catch (error) {
      console.error('💥 [SELLIKO-CLIENT] banUser error:', error)
      console.error('📋 [SELLIKO-CLIENT] Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        mobile_number: mobile_number ? mobile_number.substring(0, 5) + '***' : 'MISSING',
        ban: ban,
        hasReason: !!reason
      })
      
      return {
        success: false,
        error: error.message || 'Network error occurred'
      }
    }
  }

  // 12. getMarketplaceListings - fetch marketplace listings for vendors
  /**
   * Fetches marketplace listings for vendor bidding
   * 
   * @param {Object} options - Query options
   * @param {string} options.search - Search term for device/brand filtering (optional)
   * @param {string} options.status - Filter by listing status (optional, default: 'receiving_bids')
   * @param {number} options.page - Page number for pagination (optional, default: 1)
   * @param {number} options.limit - Number of items per page (optional, default: 20, max: 100)
   * 
   * @returns {Promise<Object>} Response with marketplace listings and pagination info
   */
  async getMarketplaceListings(options = {}) {
    console.log('🏪 [SELLIKO-CLIENT] getMarketplaceListings called with options:', {
      search: options.search || 'ALL',
      status: options.status || 'receiving_bids',
      page: options.page || 1,
      limit: options.limit || 20
    })

    try {
      // Build query parameters
      const queryParams = new URLSearchParams()
      
      // Add search if provided
      if (options.search && options.search.trim()) {
        queryParams.append('search', options.search.trim())
      }
      
      // Add status filter (default to receiving_bids for marketplace)
      queryParams.append('status', options.status || 'receiving_bids')
      
      // Add pagination
      queryParams.append('page', (options.page || 1).toString())
      queryParams.append('limit', Math.min(options.limit || 20, 100).toString()) // Cap at 100
      
      const url = `${this.apiBase}functions/v1/marketplace?${queryParams.toString()}`
      
      console.log('🌐 [SELLIKO-CLIENT] Making marketplace request:', {
        url: url,
        method: 'GET',
        queryParams: Object.fromEntries(queryParams)
      })

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      console.log('🌐 [SELLIKO-CLIENT] Marketplace response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      })

      const data = await response.json()
      
      console.log('📥 [SELLIKO-CLIENT] Marketplace data received:', {
        success: data.success,
        listingsCount: data.listings ? data.listings.length : 0,
        hasListings: !!data.listings,
        totalCount: data.total || 0,
        currentPage: data.page || 1,
        limit: data.limit || 20,
        error: data.error
      })

      // Log first listing for debugging (safely)
      if (data.listings && data.listings.length > 0) {
        const firstListing = data.listings[0]
        console.log('📋 [SELLIKO-CLIENT] Sample marketplace listing:', {
          id: firstListing.id,
          device: firstListing.device,
          brand: firstListing.brand,
          askingPrice: firstListing.askingPrice,
          currentBid: firstListing.currentBid,
          totalBids: firstListing.totalBids,
          timeLeft: firstListing.timeLeft,
          location: firstListing.location,
          hasImages: !!firstListing.images && firstListing.images.length > 0,
          imageCount: firstListing.images ? firstListing.images.length : 0,
          isHot: firstListing.isHot,
          isInstantWin: firstListing.isInstantWin
        })
      }

      return data

    } catch (error) {
      console.error('💥 [SELLIKO-CLIENT] getMarketplaceListings error:', error)
      console.error('📋 [SELLIKO-CLIENT] Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      })
      
      return {
        success: false,
        error: error.message || 'Network error occurred',
        listings: [],
        total: 0,
        page: 1,
        limit: 20
      }
    }
  }

  // 13. placeBid - place a bid on a listing (vendor only)
  /**
   * Places a bid on a device listing
   * 
   * AUTHORIZATION REQUIREMENTS:
   * - User role must be 'VENDOR'
   * - Valid JWT token required in Authorization header
   * 
   * @param {number|string} listingId - The ID of the listing to bid on
   * @param {number} bidAmount - The bid amount in currency units
   * 
   * @returns {Promise<Object>} Response with success status and bid information
   */
  async placeBid(listingId, bidAmount) {
    console.log('💰 [SELLIKO-CLIENT] placeBid called with:', {
      listingId: listingId,
      bidAmount: bidAmount,
      formattedAmount: `₹${bidAmount?.toLocaleString()}`
    })

    try {
      // Validate inputs
      if (!listingId) {
        throw new Error('Listing ID is required')
      }

      if (!bidAmount || bidAmount <= 0) {
        throw new Error('Valid bid amount is required')
      }

      // Get current user and validate permissions
      const user = await this.getCurrentUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      console.log('👤 [SELLIKO-CLIENT] Current user validation:', {
        userId: user.id,
        userRole: user.user_role,
        normalizedRole: (user.user_role || '').toUpperCase()
      })

      // Validate user role (must be vendor)
      const userRole = (user.user_role || '').toUpperCase()
      if (userRole !== 'VENDOR') {
        throw new Error(`Only vendors can place bids. Current role: ${user.user_role}`)
      }

      console.log('✅ [SELLIKO-CLIENT] Role validation passed - proceeding with bid placement')

      // Get access token
      const token = localStorage.getItem('selliko_access_token')
      if (!token) {
        throw new Error('No access token found')
      }

      // Prepare request body
      const requestBody = {
        listing_id: parseInt(listingId), // Ensure it's a number
        bid_amount: parseInt(bidAmount)  // Ensure it's a number
      }

      console.log('📤 [SELLIKO-CLIENT] Submitting bid request:', {
        url: `${this.apiBase}functions/v1/place-bid`,
        method: 'POST',
        hasToken: !!token,
        body: {
          listing_id: requestBody.listing_id,
          bid_amount: requestBody.bid_amount,
          formattedAmount: `₹${requestBody.bid_amount.toLocaleString()}`
        }
      })

      // Make API request
      const response = await fetch(`${this.apiBase}functions/v1/place-bid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      })

      console.log('🌐 [SELLIKO-CLIENT] Bid response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      })

      const result = await response.json()
      
      console.log('📥 [SELLIKO-CLIENT] Bid result:', {
        success: result.success,
        hasBid: !!result.bid,
        bidId: result.bid?.id,
        bidAmount: result.bid?.amount,
        bidStatus: result.bid?.status,
        isInstantWin: result.instant_win,
        message: result.message,
        error: result.error,
        listingId: listingId
      })

      // Log action result
      if (result.success) {
        const bidType = result.instant_win ? 'instant win' : 'regular'
        console.log(`✅ [SELLIKO-CLIENT] ${bidType} bid placed successfully:`, {
          listingId: listingId,
          bidAmount: `₹${bidAmount.toLocaleString()}`,
          bidId: result.bid?.id,
          instantWin: result.instant_win
        })
      } else {
        console.error(`❌ [SELLIKO-CLIENT] Failed to place bid on listing ${listingId}:`, result.error)
      }

      return result

    } catch (error) {
      console.error('💥 [SELLIKO-CLIENT] placeBid error:', error)
      console.error('📋 [SELLIKO-CLIENT] Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        listingId: listingId,
        bidAmount: bidAmount
      })
      
      return {
        success: false,
        error: error.message || 'Network error occurred'
      }
    }
  }

  // 14. acceptBid - accept the highest bid on a listing (client only)
  /**
   * Accepts the highest bid on a device listing
   * 
   * AUTHORIZATION REQUIREMENTS:
   * - User role must be 'CLIENT'
   * - User must be the owner of the listing
   * - Listing must have at least one bid
   * - Valid JWT token required in Authorization header
   * 
   * @param {number|string} listingId - The ID of the listing to accept bid for
   * 
   * @returns {Promise<Object>} Response with success status and updated listing information
   */
  async acceptBid(listingId) {
    console.log('✅ [SELLIKO-CLIENT] acceptBid called with:', {
      listingId: listingId
    })

    try {
      // Validate inputs
      if (!listingId) {
        throw new Error('Listing ID is required')
      }

      // Get current user and validate permissions
      const user = await this.getCurrentUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      console.log('👤 [SELLIKO-CLIENT] Current user validation:', {
        userId: user.id,
        userRole: user.user_role,
        normalizedRole: (user.user_role || '').toUpperCase()
      })

      // Validate user role (must be client)
      const userRole = (user.user_role || '').toUpperCase()
      if (userRole !== 'CLIENT') {
        throw new Error(`Only clients can accept bids on their listings. Current role: ${user.user_role}`)
      }

      console.log('✅ [SELLIKO-CLIENT] Role validation passed - proceeding with bid acceptance')

      // Get access token
      const token = localStorage.getItem('selliko_access_token')
      if (!token) {
        throw new Error('No access token found')
      }

      // Prepare request body
      const requestBody = {
        listing_id: listingId.toString() // Convert to string as per API sample
      }

      console.log('📤 [SELLIKO-CLIENT] Submitting accept bid request:', {
        url: `${this.apiBase}functions/v1/accept-bid`,
        method: 'POST',
        hasToken: !!token,
        body: {
          listing_id: requestBody.listing_id
        }
      })

      // Make API request
      const response = await fetch(`${this.apiBase}functions/v1/accept-bid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      })

      console.log('🌐 [SELLIKO-CLIENT] Accept bid response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      })

      const result = await response.json()
      
      console.log('📥 [SELLIKO-CLIENT] Accept bid result:', {
        success: result.success,
        hasListing: !!result.listing,
        listingStatus: result.listing?.status,
        highestBid: result.listing?.highest_bid,
        winningVendor: result.listing?.vendor_id,
        message: result.message,
        error: result.error,
        listingId: listingId
      })

      // Log action result
      if (result.success) {
        console.log(`✅ [SELLIKO-CLIENT] Bid accepted successfully for listing ${listingId}:`, {
          listingId: listingId,
          finalStatus: result.listing?.status,
          acceptedBidAmount: result.listing?.highest_bid ? `₹${result.listing.highest_bid.toLocaleString()}` : 'Unknown',
          winningVendor: result.listing?.vendor_id,
          totalBids: result.listing?.bids
        })

        // Log vendor information if available
        if (result.listing?.bids && Array.isArray(result.listing.bids)) {
          const winningBid = result.listing.bids.find(bid => bid.status === 'won')
          if (winningBid && winningBid.vendor_profile) {
            console.log(`🏆 [SELLIKO-CLIENT] Winning vendor details:`, {
              vendorId: winningBid.vendor_id,
              vendorName: winningBid.vendor_profile.name,
              vendorEmail: winningBid.vendor_profile.email,
              vendorLocation: `${winningBid.vendor_profile.city}, ${winningBid.vendor_profile.state}`,
              bidAmount: `₹${winningBid.bid_amount.toLocaleString()}`
            })
          }
        }
      } else {
        console.error(`❌ [SELLIKO-CLIENT] Failed to accept bid for listing ${listingId}:`, result.error)
      }

      return result

    } catch (error) {
      console.error('💥 [SELLIKO-CLIENT] acceptBid error:', error)
      console.error('📋 [SELLIKO-CLIENT] Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        listingId: listingId
      })
      
      return {
        success: false,
        error: error.message || 'Network error occurred'
      }
    }
  }

  // 15. listAgents - get all agents with their profiles (admin only)
  /**
   * Retrieves a list of all agents with their profile information
   * 
   * AUTHORIZATION REQUIREMENTS:
   * - User role must be 'ADMIN'
   * - Valid JWT token required in Authorization header
   * 
   * @returns {Promise<Object>} Response with success status and agents array
   */
  async listAgents() {
    console.log('👥 [SELLIKO-CLIENT] listAgents called')

    try {
      // Get current user and validate permissions
      const user = await this.getCurrentUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      console.log('👤 [SELLIKO-CLIENT] Current user validation:', {
        userId: user.id,
        userRole: user.user_role,
        normalizedRole: (user.user_role || '').toUpperCase()
      })

      // Validate user role (must be admin)
      const userRole = (user.user_role || '').toUpperCase()
      if (userRole !== 'ADMIN') {
        throw new Error(`Only admins can list agents. Current role: ${user.user_role}`)
      }

      console.log('✅ [SELLIKO-CLIENT] Role validation passed - proceeding with agent list retrieval')

      // Get access token
      const token = localStorage.getItem('selliko_access_token')
      if (!token) {
        throw new Error('No access token found')
      }

      const url = `${this.apiBase}functions/v1/list-agents`

      console.log('📤 [SELLIKO-CLIENT] Submitting list agents request:', {
        url: url,
        method: 'GET',
        hasToken: !!token
      })

      // Make API request
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('🌐 [SELLIKO-CLIENT] List agents response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      })

      const result = await response.json()
      
      console.log('📥 [SELLIKO-CLIENT] List agents result:', {
        success: result.success,
        agentCount: result.agents ? result.agents.length : 0,
        message: result.message,
        error: result.error
      })

      // Log agent details if available
      if (result.success && result.agents && result.agents.length > 0) {
        console.log(`✅ [SELLIKO-CLIENT] Found ${result.agents.length} agents`)
        result.agents.forEach((agent, index) => {
          console.log(`👤 [SELLIKO-CLIENT] Agent ${index + 1}:`, {
            id: agent.id,
            name: agent.name,
            email: agent.email,
            phone: agent.phone ? `${agent.phone.substring(0, 5)}***` : 'N/A',
            hasProfile: !!agent.agent_profile,
            agentCode: agent.agent_profile?.agent_code || 'NO_CODE',
            city: agent.agent_profile?.city || 'N/A'
          })
        })
      } else {
        console.log('ℹ️ [SELLIKO-CLIENT] No agents found or request failed')
      }

      return result

    } catch (error) {
      console.error('💥 [SELLIKO-CLIENT] listAgents error:', error)
      console.error('📋 [SELLIKO-CLIENT] Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      })
      
      return {
        success: false,
        error: error.message || 'Network error occurred',
        agents: []
      }
    }
  }

  // 16. updateAgentProfile - update agent profile information (admin or agent themselves)
  /**
   * Updates an agent's profile information
   * 
   * AUTHORIZATION REQUIREMENTS:
   * - User role must be 'ADMIN' or the agent themselves (based on user_id match)
   * - Valid JWT token required in Authorization header
   * 
   * ACCESS CONTROL FOR AGENT_CODE:
   * - agent_code can only be updated by ADMIN users
   * - Agents themselves cannot update their agent_code
   * 
   * @param {number} agentId - The agent_id of the profile to update
   * @param {Object} updateData - The fields to update
   * @param {string} updateData.agent_code - 5-character alphanumeric code (admin only)
   * @param {string} updateData.name - Agent's full name
   * @param {string} updateData.email - Agent's email address
   * @param {string} updateData.number - Agent's phone number
   * @param {string} updateData.address - Agent's street address
   * @param {string} updateData.city - Agent's city
   * @param {string} updateData.pincode - Agent's postal/pin code
   * @param {string} updateData.state - Agent's state/province
   * @param {string} updateData.landmark - Nearby landmark
   * @param {string} updateData.contact_person - Primary contact person name
   * @param {string} updateData.contact_person_phone - Primary contact person's phone
   * @param {string} updateData.working_pincodes - Comma-separated list of service area pincodes
   * @param {string} updateData.profile_image_url - URL to agent's profile image
   * 
   * @returns {Promise<Object>} Response with success status and updated agent profile
   */
  async updateAgentProfile(agentId, updateData) {
    console.log('🔄 [SELLIKO-CLIENT] updateAgentProfile called with:', {
      agentId: agentId,
      hasUpdateData: !!updateData,
      updateFields: updateData ? Object.keys(updateData) : [],
      hasAgentCode: !!(updateData && updateData.agent_code)
    })

    try {
      // Validate inputs
      if (!agentId) {
        throw new Error('Agent ID is required')
      }

      if (!updateData || typeof updateData !== 'object' || Object.keys(updateData).length === 0) {
        throw new Error('Update data is required and must contain at least one field')
      }

      // Get current user and validate permissions
      const user = await this.getCurrentUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      console.log('👤 [SELLIKO-CLIENT] Current user validation:', {
        userId: user.id,
        userRole: user.user_role,
        normalizedRole: (user.user_role || '').toUpperCase()
      })

      // Validate user role (must be admin or agent)
      const userRole = (user.user_role || '').toUpperCase()
      const allowedRoles = ['ADMIN', 'AGENT']
      if (!allowedRoles.includes(userRole)) {
        throw new Error(`Only admins and agents can update agent profiles. Current role: ${user.user_role}`)
      }

      // Special validation for agent_code updates - only admins can update
      if (updateData.agent_code !== undefined) {
        console.log('🔐 [SELLIKO-CLIENT] Agent code update requested - checking admin permissions...')
        if (userRole !== 'ADMIN') {
          console.error('❌ [SELLIKO-CLIENT] Agent code update denied - user is not admin')
          throw new Error('Only administrators can update agent codes')
        }
        console.log('✅ [SELLIKO-CLIENT] Agent code update authorized for admin user')
      }

      console.log('✅ [SELLIKO-CLIENT] Role validation passed - proceeding with profile update')

      // Get access token
      const token = localStorage.getItem('selliko_access_token')
      if (!token) {
        throw new Error('No access token found')
      }

      // Prepare request body with agent_id and update fields
      const requestBody = {
        agent_id: parseInt(agentId), // Ensure it's a number
        ...updateData // Spread all update fields
      }

      console.log('📤 [SELLIKO-CLIENT] Submitting update agent profile request:', {
        url: `${this.apiBase}functions/v1/update-agent-profile`,
        method: 'PUT',
        hasToken: !!token,
        body: {
          agent_id: requestBody.agent_id,
          updateFields: Object.keys(updateData),
          hasAgentCode: !!updateData.agent_code,
          agentCodeValue: updateData.agent_code || 'NOT_SET'
        }
      })

      // Make API request
      const response = await fetch(`${this.apiBase}functions/v1/update-agent-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      })

      console.log('🌐 [SELLIKO-CLIENT] Update agent profile response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      })

      const result = await response.json()
      
      console.log('📥 [SELLIKO-CLIENT] Update agent profile result:', {
        success: result.success,
        hasAgentProfile: !!result.agent_profile,
        agentId: result.agent_profile?.id,
        agentCode: result.agent_profile?.agent_code || 'NO_CODE',
        agentName: result.agent_profile?.name || 'NO_NAME',
        message: result.message,
        error: result.error
      })

      // Log action result
      if (result.success) {
        console.log(`✅ [SELLIKO-CLIENT] Agent profile updated successfully:`, {
          agentId: agentId,
          updatedFields: Object.keys(updateData),
          finalAgentCode: result.agent_profile?.agent_code,
          finalName: result.agent_profile?.name,
          finalCity: result.agent_profile?.city
        })

        // Special log for agent code updates
        if (updateData.agent_code !== undefined) {
          console.log(`🔑 [SELLIKO-CLIENT] Agent code updated successfully: ${updateData.agent_code}`)
        }
      } else {
        console.error(`❌ [SELLIKO-CLIENT] Failed to update agent profile ${agentId}:`, result.error)
      }

      return result

    } catch (error) {
      console.error('💥 [SELLIKO-CLIENT] updateAgentProfile error:', error)
      console.error('📋 [SELLIKO-CLIENT] Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        agentId: agentId,
        hasUpdateData: !!updateData
      })
      
      return {
        success: false,
        error: error.message || 'Network error occurred'
      }
    }
  }

  // 17. getBidAccepted - get all accepted bids that need agent assignment (admin only)
  /**
   * Retrieves a list of all accepted bids that need agent assignment
   * 
   * AUTHORIZATION REQUIREMENTS:
   * - User role must be 'ADMIN'
   * - Valid JWT token required in Authorization header
   * 
   * @returns {Promise<Object>} Response with success status and accepted_bids array
   */
  async getBidAccepted() {
    console.log('🎯 [SELLIKO-CLIENT] getBidAccepted called')

    try {
      // Get current user and validate permissions
      const user = await this.getCurrentUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      console.log('👤 [SELLIKO-CLIENT] Current user validation:', {
        userId: user.id,
        userRole: user.user_role,
        normalizedRole: (user.user_role || '').toUpperCase()
      })

      // Validate user role (must be admin)
      const userRole = (user.user_role || '').toUpperCase()
      if (userRole !== 'ADMIN') {
        throw new Error(`Only admins can view accepted bids for agent assignment. Current role: ${user.user_role}`)
      }

      console.log('✅ [SELLIKO-CLIENT] Role validation passed - proceeding with accepted bids retrieval')

      // Get access token
      const token = localStorage.getItem('selliko_access_token')
      if (!token) {
        throw new Error('No access token found')
      }

      const url = `${this.apiBase}functions/v1/get-bid-accepted`

      console.log('📤 [SELLIKO-CLIENT] Submitting get bid accepted request:', {
        url: url,
        method: 'GET',
        hasToken: !!token
      })

      // Make API request
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('🌐 [SELLIKO-CLIENT] Get bid accepted response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      })

      const result = await response.json()
      
      console.log('📥 [SELLIKO-CLIENT] Get bid accepted result:', {
        success: result.success,
        bidCount: result.accepted_bids ? result.accepted_bids.length : 0,
        message: result.message,
        error: result.error
      })

      // Log accepted bid details if available
      if (result.success && result.accepted_bids && result.accepted_bids.length > 0) {
        console.log(`✅ [SELLIKO-CLIENT] Found ${result.accepted_bids.length} accepted bids`)
        result.accepted_bids.forEach((bidData, index) => {
          console.log(`🎯 [SELLIKO-CLIENT] Accepted Bid ${index + 1}:`, {
            listingId: bidData.listing?.id,
            device: `${bidData.device?.brand} ${bidData.device?.model}`,
            highestBidAmount: bidData.listing?.highest_bid, // Now a number (bid value)
            winningBidAmount: bidData.winning_bid_amount, // Separate field for winning bid amount
            bidDetails: bidData.bid_details ? {
              bidId: bidData.bid_details.id,
              bidAmount: bidData.bid_details.bid_amount,
              vendorId: bidData.bid_details.vendor_id,
              status: bidData.bid_details.status,
              instantWin: bidData.bid_details.instant_win
            } : 'NO_BID_DETAILS',
            vendorId: bidData.listing?.vendor_id, // Vendor ID is in listing object
            pickupCity: bidData.pickup_address?.city,
            pickupPincode: bidData.pickup_address?.pincode,
            hasAgentAssigned: !!bidData.listing?.agent_id,
            availableAgents: bidData.agents_available?.length || 0
          })
        })
      } else {
        console.log('ℹ️ [SELLIKO-CLIENT] No accepted bids found or request failed')
      }

      return result

    } catch (error) {
      console.error('💥 [SELLIKO-CLIENT] getBidAccepted error:', error)
      console.error('📋 [SELLIKO-CLIENT] Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      })
      
      return {
        success: false,
        error: error.message || 'Network error occurred',
        accepted_bids: []
      }
    }
  }

  // 18. assignAgent - assign an agent to a listing (admin only)
  /**
   * Assigns an agent to a listing that has an accepted bid
   * 
   * AUTHORIZATION REQUIREMENTS:
   * - User role must be 'ADMIN'
   * - Valid JWT token required in Authorization header
   * 
   * EXPECTED RESPONSE FORMAT:
   * {
   *   "success": true,
   *   "listing": {
   *     "id": 6,
   *     "user_id": "af20ef43-81ac-4f86-bbd8-94fa1e7098b7",
   *     "listing_type": "device",
   *     "status": "agent_assigned",
   *     "asking_price": 150000,
   *     "expected_price": null,
   *     "vendor_id": "6812f353-3000-4d12-852b-9ea80da552c2",
   *     "agent_id": "48ef963f-6765-43e4-ab1e-83dede689bac",
   *     "bids": 3,
   *     "highest_bid": 3,
   *     "bid_accepted": "2025-01-15T10:30:00Z",
   *     "time_approved": null,
   *     "created_at": "2025-01-15T09:00:00Z",
   *     "updated_at": "2025-01-15T11:45:00Z"
   *   },
   *   "agent": {
   *     "user": {
   *       "id": "48ef963f-6765-43e4-ab1e-83dede689bac",
   *       "email": "john.doe@example.com",
   *       "phone": "+919876543210",
   *       "name": "John Doe",
   *       "user_role": "agent",
   *       "created_at": "2025-01-10T08:00:00Z"
   *     },
   *     "agent_profile": {
   *       "id": 1,
   *       "agent_code": "AG001",
   *       "name": "John Doe",
   *       "email": "john.doe@example.com",
   *       "number": "+919876543210",
   *       "address": "123 Main Street",
   *       "city": "Kochi",
   *       "pincode": "682001",
   *       "state": "Kerala",
   *       "landmark": "Near Metro Station",
   *       "contact_person": "John Doe",
   *       "contact_person_phone": "+919876543210",
   *       "working_pincodes": "682001,682002,682003",
   *       "profile_image_url": "https://example.com/profile.jpg",
   *       "created_at": "2025-01-10T08:15:00Z",
   *       "updated_at": "2025-01-10T08:15:00Z"
   *     }
   *   },
   *   "message": "Agent successfully assigned to listing 6"
   * }
   * 
   * @param {number|string} listingId - The ID of the listing to assign agent to
   * @param {string} agentUserId - The user_id of the agent to assign
   * 
   * @returns {Promise<Object>} Response with success status, updated listing, and agent info
   */
  async assignAgent(listingId, agentUserId) {
    console.log('👥 [SELLIKO-CLIENT] assignAgent called with:', {
      listingId: listingId,
      agentUserId: agentUserId
    })

    try {
      // Validate inputs
      if (!listingId) {
        throw new Error('Listing ID is required')
      }

      if (!agentUserId) {
        throw new Error('Agent user ID is required')
      }

      // Get current user and validate permissions
      const user = await this.getCurrentUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      console.log('👤 [SELLIKO-CLIENT] Current user validation:', {
        userId: user.id,
        userRole: user.user_role,
        normalizedRole: (user.user_role || '').toUpperCase()
      })

      // Validate user role (must be admin)
      const userRole = (user.user_role || '').toUpperCase()
      if (userRole !== 'ADMIN') {
        throw new Error(`Only admins can assign agents. Current role: ${user.user_role}`)
      }

      console.log('✅ [SELLIKO-CLIENT] Role validation passed - proceeding with agent assignment')

      // Get access token
      const token = localStorage.getItem('selliko_access_token')
      if (!token) {
        throw new Error('No access token found')
      }

      // Prepare request body
      const requestBody = {
        listing_id: parseInt(listingId), // Ensure it's a number
        agent_id: agentUserId.toString() // Changed from agentid to agent_id as expected by server
      }

      console.log('📤 [SELLIKO-CLIENT] Submitting assign agent request:', {
        url: `${this.apiBase}functions/v1/assign-agent`,
        method: 'POST',
        hasToken: !!token,
        body: {
          listing_id: requestBody.listing_id,
          agent_id: requestBody.agent_id
        }
      })

      // Make API request
      const response = await fetch(`${this.apiBase}functions/v1/assign-agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      })

      console.log('🌐 [SELLIKO-CLIENT] Assign agent response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      })

      const result = await response.json()
      
      console.log('📥 [SELLIKO-CLIENT] Assign agent result:', {
        success: result.success,
        hasListing: !!result.listing,
        hasAgent: !!result.agent,
        listingStatus: result.listing?.status,
        agentAssigned: result.listing?.agent_id,
        agentCode: result.agent?.agent_profile?.agent_code,
        agentName: result.agent?.agent_profile?.name,
        message: result.message,
        error: result.error,
        listingId: listingId
      })

      // Log detailed assignment result if successful
      if (result.success) {
        console.log(`✅ [SELLIKO-CLIENT] Agent assigned successfully:`, {
          listingId: listingId,
          listingStatus: result.listing?.status,
          agentUserId: agentUserId,
          assignedAgentId: result.listing?.agent_id,
          agentDetails: result.agent ? {
            name: result.agent.agent_profile?.name,
            code: result.agent.agent_profile?.agent_code,
            phone: result.agent.agent_profile?.number,
            city: result.agent.agent_profile?.city,
            workingPincodes: result.agent.agent_profile?.working_pincodes
          } : 'NO_AGENT_DETAILS',
          listingDetails: result.listing ? {
            id: result.listing.id,
            status: result.listing.status,
            vendorId: result.listing.vendor_id,
            highestBid: result.listing.highest_bid,
            bidAccepted: result.listing.bid_accepted
          } : 'NO_LISTING_DETAILS'
        })

        // Log pickup task creation confirmation
        if (result.agent?.agent_profile) {
          console.log(`📋 [SELLIKO-CLIENT] Pickup task created for agent:`, {
            agentCode: result.agent.agent_profile.agent_code,
            agentName: result.agent.agent_profile.name,
            agentPhone: result.agent.agent_profile.number ? `${result.agent.agent_profile.number.substring(0, 5)}***` : 'NO_PHONE',
            taskType: 'device_pickup',
            listingId: result.listing?.id,
            vendorId: result.listing?.vendor_id
          })
        }
      } else {
        console.error(`❌ [SELLIKO-CLIENT] Failed to assign agent to listing ${listingId}:`, result.error)
      }

      // Echo the full response for debugging
      console.log('🔊 [SELLIKO-CLIENT] FULL ASSIGN AGENT RESPONSE:', JSON.stringify(result, null, 2))

      return result

    } catch (error) {
      console.error('💥 [SELLIKO-CLIENT] assignAgent error:', error)
      console.error('📋 [SELLIKO-CLIENT] Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        listingId: listingId,
        agentUserId: agentUserId
      })
      
      return {
        success: false,
        error: error.message || 'Network error occurred'
      }
    }
  }

  // 19. getTasks - get assigned tasks for the current agent (agent only)
  /**
   * Retrieves tasks assigned to the current agent
   * 
   * AUTHORIZATION REQUIREMENTS:
   * - User role must be 'AGENT'
   * - Valid JWT token required in Authorization header
   * 
   * @returns {Promise<Object>} Response with success status and tasks array
   */
  async getTasks() {
    console.log('📋 [SELLIKO-CLIENT] getTasks called')

    try {
      // Get current user and validate permissions
      const user = await this.getCurrentUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      console.log('👤 [SELLIKO-CLIENT] Current user validation:', {
        userId: user.id,
        userRole: user.user_role,
        normalizedRole: (user.user_role || '').toUpperCase()
      })

      // Validate user role (must be agent)
      const userRole = (user.user_role || '').toUpperCase()
      if (userRole !== 'AGENT') {
        throw new Error(`Only agents can access tasks. Current role: ${user.user_role}`)
      }

      console.log('✅ [SELLIKO-CLIENT] Role validation passed - proceeding with tasks retrieval')

      // Get access token
      const token = localStorage.getItem('selliko_access_token')
      if (!token) {
        throw new Error('No access token found')
      }

      const url = `${this.apiBase}functions/v1/get-tasks`

      console.log('📤 [SELLIKO-CLIENT] Submitting get tasks request:', {
        url: url,
        method: 'POST',
        hasToken: !!token
      })

      // Make API request
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('🌐 [SELLIKO-CLIENT] Get tasks response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      })

      const result = await response.json()
      
      console.log('📥 [SELLIKO-CLIENT] Get tasks result:', {
        success: result.success,
        taskCount: result.tasks ? result.tasks.length : 0,
        message: result.message,
        error: result.error
      })

      // Log task details if available
      if (result.success && result.tasks && result.tasks.length > 0) {
        console.log(`✅ [SELLIKO-CLIENT] Found ${result.tasks.length} tasks`)
        result.tasks.forEach((task, index) => {
          console.log(`📋 [SELLIKO-CLIENT] Task ${index + 1}:`, {
            listingId: task.listing_id,
            vendorId: task.vendor_id || 'NOT_PROVIDED',
            taskId: task.vendor_id ? `${task.vendor_id}/${task.listing_id}` : `LISTING_${task.listing_id}`,
            product: task.product,
            seller: task.seller,
            status: task.status,
            doneBy: task.done_by,
            assignedTime: task.assigned_time,
            hasFrontImage: !!task.front_image_url,
            address: task.address
          })
        })
      } else {
        console.log('ℹ️ [SELLIKO-CLIENT] No tasks found or request failed')
      }

      return result

    } catch (error) {
      console.error('💥 [SELLIKO-CLIENT] getTasks error:', error)
      console.error('📋 [SELLIKO-CLIENT] Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      })
      
      return {
        success: false,
        error: error.message || 'Network error occurred',
        tasks: []
      }
    }
  }

  // 20. getClientConfigsChecklist - fetch all client configuration checklist entries (authorized users only)
  /**
   * Retrieves all entries from the client_configs_checklist table
   * 
   * AUTHORIZATION REQUIREMENTS:
   * - Valid JWT token required in Authorization header
   * - User must be authenticated (any role)
   * 
   * @returns {Promise<Object>} Response with success status and configs array
   */
  async getClientConfigsChecklist() {
    console.log('⚙️ [SELLIKO-CLIENT] getClientConfigsChecklist called')

    try {
      // Get current user to ensure authenticated
      const user = await this.getCurrentUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      console.log('👤 [SELLIKO-CLIENT] Current user validation:', {
        userId: user.id,
        userRole: user.user_role,
        normalizedRole: (user.user_role || '').toUpperCase()
      })

      console.log('✅ [SELLIKO-CLIENT] Authentication validated - proceeding with config checklist retrieval')

      // Get access token
      const token = localStorage.getItem('selliko_access_token')
      if (!token) {
        throw new Error('No access token found')
      }

      // Use Supabase REST API endpoint directly
      const url = `${this.apiBase}rest/v1/client_configs_checklist?select=*&order=id.asc`

      console.log('📤 [SELLIKO-CLIENT] Submitting get client configs checklist request:', {
        url: url,
        method: 'GET',
        hasToken: !!token
      })

      // Make API request using Supabase REST API
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'apikey': token, // Supabase also uses apikey header
          'Prefer': 'return=representation'
        }
      })

      console.log('🌐 [SELLIKO-CLIENT] Get client configs checklist response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const configs = await response.json()
      
      // Transform Supabase response to match expected format
      const result = {
        success: true,
        configs: configs || [],
        message: 'Configuration retrieved successfully'
      }

      console.log('📥 [SELLIKO-CLIENT] Get client configs checklist result:', {
        success: result.success,
        configCount: result.configs ? result.configs.length : 0,
        message: result.message
      })

      // Log config details if available
      if (result.success && result.configs && result.configs.length > 0) {
        console.log(`✅ [SELLIKO-CLIENT] Found ${result.configs.length} configuration entries`)
        result.configs.forEach((config, index) => {
          console.log(`⚙️ [SELLIKO-CLIENT] Config ${index + 1}:`, {
            id: config.id,
            configKey: config.config_key,
            configValue: config.config_value,
            description: config.description,
            isActive: config.is_active,
            category: config.category,
            createdAt: config.created_at,
            updatedAt: config.updated_at
          })
        })
      } else {
        console.log('ℹ️ [SELLIKO-CLIENT] No configuration entries found')
      }

      return result

    } catch (error) {
      console.error('💥 [SELLIKO-CLIENT] getClientConfigsChecklist error:', error)
      console.error('📋 [SELLIKO-CLIENT] Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      })
      
      return {
        success: false,
        error: error.message || 'Network error occurred',
        configs: []
      }
    }
  }

  // 21. verifyListing - submit device verification results with deductions and final offer (agent only)
  /**
   * Submits device verification results including form data, deductions, and final offer
   * 
   * AUTHORIZATION REQUIREMENTS:
   * - User role must be 'AGENT'
   * - Valid JWT token required in Authorization header
   * 
   * @param {number|string} listingId - The ID of the listing being verified
   * @param {Array} verificationData - Array of verification step results
   * @param {string} verificationNote - Agent's verification notes and observations
   * @param {Array} deductions - Array of deduction objects for issues found
   * @param {number} offerValue - Final calculated offer value after deductions
   * 
   * @returns {Promise<Object>} Response with success status and verification result
   */
  async verifyListing(listingId, verificationData, verificationNote, deductions, offerValue) {
    console.log('🔍 [SELLIKO-CLIENT] verifyListing called with:', {
      listingId: listingId,
      verificationDataCount: verificationData ? verificationData.length : 0,
      hasVerificationNote: !!verificationNote,
      deductionsCount: deductions ? deductions.length : 0,
      offerValue: offerValue,
      formattedOffer: offerValue ? `₹${offerValue.toLocaleString()}` : 'N/A'
    })

    try {
      // Validate inputs
      if (!listingId) {
        throw new Error('Listing ID is required')
      }

      if (!verificationData || !Array.isArray(verificationData) || verificationData.length === 0) {
        throw new Error('Verification data is required and must be a non-empty array')
      }

      if (typeof offerValue !== 'number' || offerValue < 0) {
        throw new Error('Valid offer value is required')
      }

      // Get current user and validate permissions
      const user = await this.getCurrentUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      console.log('👤 [SELLIKO-CLIENT] Current user validation:', {
        userId: user.id,
        userRole: user.user_role,
        normalizedRole: (user.user_role || '').toUpperCase()
      })

      // Validate user role (must be agent)
      const userRole = (user.user_role || '').toUpperCase()
      if (userRole !== 'AGENT') {
        throw new Error(`Only agents can submit verification results. Current role: ${user.user_role}`)
      }

      console.log('✅ [SELLIKO-CLIENT] Role validation passed - proceeding with verification submission')

      // Get access token
      const token = localStorage.getItem('selliko_access_token')
      if (!token) {
        throw new Error('No access token found')
      }

      // Process verification data - upload any File objects to URLs
      console.log('🖼️ [SELLIKO-CLIENT] Processing verification data for file uploads...')
      const processedVerificationData = []

      for (const step of verificationData) {
        const processedStep = { ...step }

        // If value is a File object (image type), upload it
        if (step.type === 'image' && step.value instanceof File) {
          console.log(`📸 [SELLIKO-CLIENT] Uploading image for step ${step.id}: ${step.item}`)
          try {
            // Convert to WebP and upload
            const fileName = `verification_${listingId}_step_${step.id}_${this.generateUUID()}.webp`
            const webpFile = await this.convertToWebP(step.value)
            const imageUrl = await this.uploadFile(webpFile, fileName)
            processedStep.value = imageUrl
            console.log(`✅ [SELLIKO-CLIENT] Image uploaded for step ${step.id}:`, imageUrl)
          } catch (uploadError) {
            console.error(`💥 [SELLIKO-CLIENT] Failed to upload image for step ${step.id}:`, uploadError)
            throw new Error(`Failed to upload verification image for step ${step.id}: ${uploadError.message}`)
          }
        }

        processedVerificationData.push(processedStep)
      }

      // Prepare request body with the exact structure expected by API
      const requestBody = {
        listing_id: parseInt(listingId), // Ensure it's a number
        verification_data: processedVerificationData,
        verification_note: verificationNote || '',
        deductions: deductions || [],
        offer_value: parseInt(offerValue) // Ensure it's a number
      }

      console.log('📤 [SELLIKO-CLIENT] Submitting verification request:', {
        url: `${this.apiBase}functions/v1/verify`,
        method: 'POST',
        hasToken: !!token,
        body: {
          listing_id: requestBody.listing_id,
          verification_data_count: requestBody.verification_data.length,
          verification_note_length: requestBody.verification_note.length,
          deductions_count: requestBody.deductions.length,
          offer_value: requestBody.offer_value,
          formattedOffer: `₹${requestBody.offer_value.toLocaleString()}`
        }
      })

      // Log verification data summary
      console.log('📋 [SELLIKO-CLIENT] Verification data summary:', {
        totalSteps: requestBody.verification_data.length,
        imageSteps: requestBody.verification_data.filter(step => step.type === 'image').length,
        boolSteps: requestBody.verification_data.filter(step => step.type === 'bool').length,
        textSteps: requestBody.verification_data.filter(step => step.type === 'text').length,
        passedSteps: requestBody.verification_data.filter(step => step.value === true).length,
        failedSteps: requestBody.verification_data.filter(step => step.value === false).length,
        categories: [...new Set(requestBody.verification_data.map(step => step.category))]
      })

      // Log deductions summary
      if (requestBody.deductions.length > 0) {
        const totalDeductionAmount = requestBody.deductions.reduce((sum, d) => sum + (d.amount || 0), 0)
        console.log('💰 [SELLIKO-CLIENT] Deductions summary:', {
          totalDeductions: requestBody.deductions.length,
          totalAmount: `₹${totalDeductionAmount.toLocaleString()}`,
          categories: [...new Set(requestBody.deductions.map(d => d.category))],
          severities: [...new Set(requestBody.deductions.map(d => d.severity))]
        })
      }

      // Make API request
      const response = await fetch(`${this.apiBase}functions/v1/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      })

      console.log('🌐 [SELLIKO-CLIENT] Verification response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      })

      const result = await response.json()
      
      console.log('📥 [SELLIKO-CLIENT] Verification result:', {
        success: result.success,
        message: result.message,
        error: result.error,
        listingId: listingId
      })

      // Log action result
      if (result.success) {
        console.log(`✅ [SELLIKO-CLIENT] Verification submitted successfully for listing ${listingId}:`, {
          listingId: listingId,
          offerValue: `₹${offerValue.toLocaleString()}`,
          verificationSteps: verificationData.length,
          deductionsApplied: deductions.length,
          totalDeductions: deductions.reduce((sum, d) => sum + (d.amount || 0), 0),
          noteLength: verificationNote ? verificationNote.length : 0
        })
      } else {
        console.error(`❌ [SELLIKO-CLIENT] Failed to submit verification for listing ${listingId}:`, result.error)
      }

      return result

    } catch (error) {
      console.error('💥 [SELLIKO-CLIENT] verifyListing error:', error)
      console.error('📋 [SELLIKO-CLIENT] Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        listingId: listingId,
        verificationDataCount: verificationData ? verificationData.length : 0,
        deductionsCount: deductions ? deductions.length : 0,
        offerValue: offerValue
      })
      
      return {
        success: false,
        error: error.message || 'Network error occurred'
      }
    }
  }

  // 22. startVerification - start verification process for a listing (agent only)
  /**
   * Starts the verification process for a device listing
   * 
   * AUTHORIZATION REQUIREMENTS:
   * - User role must be 'AGENT'
   * - Valid JWT token required in Authorization header
   * 
   * @param {number|string} listingId - The ID of the listing to start verification for
   * 
   * @returns {Promise<Object>} Response with success status and verification start confirmation
   */
  async startVerification(listingId) {
    console.log('🚀 [SELLIKO-CLIENT] startVerification called with:', {
      listingId: listingId
    })

    try {
      // Validate inputs
      if (!listingId) {
        throw new Error('Listing ID is required')
      }

      // Get current user and validate permissions
      const user = await this.getCurrentUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      console.log('👤 [SELLIKO-CLIENT] Current user validation:', {
        userId: user.id,
        userRole: user.user_role,
        normalizedRole: (user.user_role || '').toUpperCase()
      })

      // Validate user role (must be agent)
      const userRole = (user.user_role || '').toUpperCase()
      if (userRole !== 'AGENT') {
        throw new Error(`Only agents can start verification process. Current role: ${user.user_role}`)
      }

      console.log('✅ [SELLIKO-CLIENT] Role validation passed - proceeding with verification start')

      // Get access token
      const token = localStorage.getItem('selliko_access_token')
      if (!token) {
        throw new Error('No access token found')
      }

      // Prepare request body
      const requestBody = {
        listing_id: parseInt(listingId) // Ensure it's a number
      }

      console.log('📤 [SELLIKO-CLIENT] Submitting start verification request:', {
        url: `${this.apiBase}functions/v1/start-verification`,
        method: 'POST',
        hasToken: !!token,
        body: {
          listing_id: requestBody.listing_id
        }
      })

      // Make API request
      const response = await fetch(`${this.apiBase}functions/v1/start-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      })

      console.log('🌐 [SELLIKO-CLIENT] Start verification response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      })

      const result = await response.json()
      
      console.log('📥 [SELLIKO-CLIENT] Start verification result:', {
        success: result.success,
        message: result.message,
        error: result.error,
        listingId: listingId
      })

      // Log action result
      if (result.success) {
        console.log(`✅ [SELLIKO-CLIENT] Verification process started successfully for listing ${listingId}`)
      } else {
        console.error(`❌ [SELLIKO-CLIENT] Failed to start verification for listing ${listingId}:`, result.error)
      }

      return result

    } catch (error) {
      console.error('💥 [SELLIKO-CLIENT] startVerification error:', error)
      console.error('📋 [SELLIKO-CLIENT] Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        listingId: listingId
      })
      
      return {
        success: false,
        error: error.message || 'Network error occurred'
      }
    }
  }

  // 23. confirmPickup - confirm pickup with OTP (agent only)
  /**
   * Confirms device pickup with OTP verification
   * 
   * AUTHORIZATION REQUIREMENTS:
   * - User role must be 'AGENT'
   * - Valid JWT token required in Authorization header
   * - The requesting agent must be the assigned agent for the listing
   * - Listing must be in "ready_for_pickup" status
   * - OTP must be exactly 4 digits and match the stored OTP
   * 
   * @param {number|string} listingId - The ID of the listing to confirm pickup for
   * @param {string} pickupOtp - The 4-digit OTP for pickup confirmation
   * 
   * @returns {Promise<Object>} Response with success status and pickup confirmation details
   */
  async confirmPickup(listingId, pickupOtp) {
    console.log('📦 [SELLIKO-CLIENT] confirmPickup called with:', {
      listingId: listingId,
      pickupOtp: pickupOtp ? '****' : 'MISSING'
    })

    try {
      // Validate inputs
      if (!listingId) {
        throw new Error('Listing ID is required')
      }

      if (!pickupOtp || pickupOtp.length !== 4 || !/^\d{4}$/.test(pickupOtp)) {
        throw new Error('Pickup OTP must be exactly 4 digits')
      }

      // Get current user and validate permissions
      const user = await this.getCurrentUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      console.log('👤 [SELLIKO-CLIENT] Current user validation:', {
        userId: user.id,
        userRole: user.user_role,
        normalizedRole: (user.user_role || '').toUpperCase()
      })

      // Validate user role (must be agent)
      const userRole = (user.user_role || '').toUpperCase()
      if (userRole !== 'AGENT') {
        throw new Error(`Only agents can confirm pickup. Current role: ${user.user_role}`)
      }

      console.log('✅ [SELLIKO-CLIENT] Role validation passed - proceeding with pickup confirmation')

      // Get access token
      const token = localStorage.getItem('selliko_access_token')
      if (!token) {
        throw new Error('No access token found')
      }

      // Prepare request body
      const requestBody = {
        listing_id: parseInt(listingId), // Ensure it's a number
        pickup_otp: pickupOtp.toString() // Ensure it's a string
      }

      console.log('📤 [SELLIKO-CLIENT] Submitting pickup confirmation request:', {
        url: `${this.apiBase}functions/v1/pickup`,
        method: 'POST',
        hasToken: !!token,
        body: {
          listing_id: requestBody.listing_id,
          pickup_otp: '****' // Hide OTP in logs
        }
      })

      // Make API request
      const response = await fetch(`${this.apiBase}functions/v1/pickup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      })

      console.log('🌐 [SELLIKO-CLIENT] Pickup confirmation response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      })

      const result = await response.json()
      
      console.log('📥 [SELLIKO-CLIENT] Pickup confirmation result:', {
        success: result.success,
        hasPickup: !!result.pickup,
        hasListing: !!result.listing,
        pickupStatus: result.pickup?.picked_up,
        listingStatus: result.listing?.status,
        deliveryOtp: result.pickup?.delivery_otp ? '****' : 'NOT_PROVIDED',
        message: result.message,
        error: result.error,
        listingId: listingId
      })

      // Log detailed pickup result if successful
      if (result.success) {
        console.log(`✅ [SELLIKO-CLIENT] Pickup confirmed successfully:`, {
          listingId: listingId,
          pickupDetails: result.pickup ? {
            id: result.pickup.id,
            picked_up: result.pickup.picked_up,
            pickup_time: result.pickup.pickup_time,
            delivered: result.pickup.delivered,
            delivery_otp: result.pickup.delivery_otp ? '****' : 'NOT_SET',
            agent_id: result.pickup.agent_id,
            deliver_to: result.pickup.deliver_to
          } : 'NO_PICKUP_DETAILS',
          listingDetails: result.listing ? {
            id: result.listing.id,
            status: result.listing.status,
            vendor_id: result.listing.vendor_id,
            agent_id: result.listing.agent_id,
            highest_bid: result.listing.highest_bid,
            updated_at: result.listing.updated_at
          } : 'NO_LISTING_DETAILS'
        })

        // Log next steps
        if (result.pickup?.delivery_otp) {
          console.log(`📋 [SELLIKO-CLIENT] Next step: Deliver to vendor with OTP: ****`)
        }
      } else {
        console.error(`❌ [SELLIKO-CLIENT] Failed to confirm pickup for listing ${listingId}:`, result.error)
      }

      // Echo the full response for debugging
      console.log('🔊 [SELLIKO-CLIENT] FULL PICKUP CONFIRMATION RESPONSE:', JSON.stringify(result, null, 2))

      return result

    } catch (error) {
      console.error('💥 [SELLIKO-CLIENT] confirmPickup error:', error)
      console.error('📋 [SELLIKO-CLIENT] Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        listingId: listingId,
        pickupOtp: pickupOtp ? '****' : 'MISSING'
      })
      
      return {
        success: false,
        error: error.message || 'Network error occurred'
      }
    }
  }
}

// Export singleton instance
const sellikoClient = new SellikoClient()
export default sellikoClient