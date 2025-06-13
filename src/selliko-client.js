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
}

// Export singleton instance
const sellikoClient = new SellikoClient()
export default sellikoClient