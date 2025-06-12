// IMPORTANT: All API requests must use the field name mobile_number (never mobile) for phone numbers, as required by the server.
// SELLIKO Client Integration Layer
// This file will handle all Supabase API interactions

const API_BASE = process.env.NEXT_PUBLIC_SELLIKO_API_BASE || 'http://127.0.0.1:54321/'

class SellikoClient {
  constructor() {
    this.apiBase = API_BASE
    console.log('🏗️ [SELLIKO-CLIENT] Client initialized with API base:', this.apiBase)
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
}

// Export singleton instance
const sellikoClient = new SellikoClient()
export default sellikoClient