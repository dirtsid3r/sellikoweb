'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

// Types from integrationguide.md
export interface User {
  id: string
  phone: string
  name: string
  role: 'ANONYMOUS' | 'CLIENT' | 'VENDOR' | 'AGENT' | 'ADMIN'
  isActive: boolean
  createdAt: Date
  lastLogin: Date
  metadata: Record<string, any>
}

export interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (phone: string, otp: string, otpId: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<boolean>
  sendOTP: (phone: string) => Promise<{ success: boolean; otpId?: string; error?: string }>
  refreshToken: () => Promise<boolean>
  // Test accounts for development
  loginAsTestVendor: () => Promise<void>
  loginAsTestClient: () => Promise<void>
  loginAsTestAgent: () => Promise<void>
  loginAsTestAdmin: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// API endpoints from integrationguide.md
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

class AuthAPI {
  private getHeaders() {
    return {
      'Content-Type': 'application/json',
    }
  }

  private getAuthHeaders() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('selliko_access_token') : null
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }

  async sendOTP(phone: string) {
    try {
      const response = await fetch(`${API_BASE}/auth/send-otp`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ phone })
      })

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Send OTP error:', error)
      return { success: false, error: 'Network error' }
    }
  }

  async verifyOTP(phone: string, otp: string, otpId: string) {
    try {
      const response = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ phone, otp, otpId })
      })

      const data = await response.json()
      
      if (data.success && data.accessToken && typeof window !== 'undefined') {
        localStorage.setItem('selliko_access_token', data.accessToken)
        localStorage.setItem('selliko_refresh_token', data.refreshToken)
        localStorage.setItem('selliko_user', JSON.stringify(data.user))
      }

      return data
    } catch (error) {
      console.error('Verify OTP error:', error)
      return { success: false, error: 'Network error' }
    }
  }

  async refreshToken() {
    try {
      if (typeof window === 'undefined') return { success: false }
      const refreshToken = localStorage.getItem('selliko_refresh_token')
      if (!refreshToken) return { success: false }

      const response = await fetch(`${API_BASE}/auth/refresh-token`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ refreshToken })
      })

      const data = await response.json()
      
      if (data.accessToken && typeof window !== 'undefined') {
        localStorage.setItem('selliko_access_token', data.accessToken)
        localStorage.setItem('selliko_refresh_token', data.refreshToken)
        return { success: true }
      }

      return { success: false }
    } catch (error) {
      console.error('Refresh token error:', error)
      return { success: false }
    }
  }

  async logout() {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: this.getAuthHeaders()
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      if (typeof window !== 'undefined') {
        // Clear all auth-related localStorage items
        localStorage.removeItem('selliko_access_token')
        localStorage.removeItem('selliko_refresh_token')
        localStorage.removeItem('selliko_user')
        localStorage.removeItem('pendingPhone')
        localStorage.removeItem('pendingOtpId')
        localStorage.removeItem('pendingUserId')
        localStorage.removeItem('selliko_instance_id')
        
        // Clear session storage flags
        sessionStorage.removeItem('auth_redirect_complete')
        
        console.log('🧹 [AUTH] Cleared all auth-related storage items')
      }
    }
  }
}

const authAPI = new AuthAPI()

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return

    // Check for existing session on mount
    const storedUser = localStorage.getItem('selliko_user')
    const token = localStorage.getItem('selliko_access_token')

    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser))
        setIsAuthenticated(true)
      } catch (error) {
        console.error('Error parsing stored user:', error)
        localStorage.removeItem('selliko_user')
        localStorage.removeItem('selliko_access_token')
        localStorage.removeItem('selliko_refresh_token')
      }
    }
    
    setIsLoading(false)
  }, [isMounted])

  const sendOTP = async (phone: string) => {
    return await authAPI.sendOTP(phone)
  }

  const login = async (phone: string, otp: string, otpId: string) => {
    setIsLoading(true)
    try {
      const result = await authAPI.verifyOTP(phone, otp, otpId)
      
      if (result.success && result.user) {
        setUser(result.user)
        setIsAuthenticated(true)
        return { success: true }
      }
      
      return { success: false, error: result.error || 'Authentication failed' }
    } catch (error) {
      return { success: false, error: 'Network error' }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      console.log('🔄 [AUTH] Starting logout process...')
      await authAPI.logout()
      console.log('✅ [AUTH] Logout successful')
      setUser(null)
      setIsAuthenticated(false)
      return true
    } catch (error) {
      console.error('❌ [AUTH] Logout error:', error)
      return false
    }
  }

  const refreshToken = async () => {
    const result = await authAPI.refreshToken()
    return result.success
  }

  // Test login functions for development
  const loginAsTestVendor = async () => {
    const testVendor: User = {
      id: 'vendor-test-001',
      phone: '+919876543210',
      name: 'Kochi Mobile Store',
      role: 'VENDOR',
      isActive: true,
      createdAt: new Date('2024-01-01'),
      lastLogin: new Date(),
      metadata: {
        businessName: 'Kochi Mobile Store',
        location: 'Kochi, Kerala',
        gstNumber: 'GST123456789',
        verified: true
      }
    }
    
    setUser(testVendor)
    if (typeof window !== 'undefined') {
      localStorage.setItem('selliko_user', JSON.stringify(testVendor))
      localStorage.setItem('selliko_access_token', 'test-vendor-token')
    }
  }

  const loginAsTestClient = async () => {
    const testClient: User = {
      id: 'client-test-001',
      phone: '+919876543211',
      name: 'Pradeep Kumar',
      role: 'CLIENT',
      isActive: true,
      createdAt: new Date('2024-01-01'),
      lastLogin: new Date(),
      metadata: {
        location: 'Kochi, Kerala',
        verified: true
      }
    }
    
    setUser(testClient)
    if (typeof window !== 'undefined') {
      localStorage.setItem('selliko_user', JSON.stringify(testClient))
      localStorage.setItem('selliko_access_token', 'test-client-token')
    }
  }

  const loginAsTestAgent = async () => {
    console.log('loginAsTestAgent called')
    const testAgent: User = {
      id: 'agent-test-001',
      phone: '+919876543212',
      name: 'Rajesh Agent',
      role: 'AGENT',
      isActive: true,
      createdAt: new Date('2024-01-01'),
      lastLogin: new Date(),
      metadata: {
        location: 'Thiruvananthapuram, Kerala',
        verified: true,
        areasCovered: ['Thiruvananthapuram', 'Kollam', 'Pathanamthitta'],
        vehicleNumber: 'KL-01-AB-1234'
      }
    }
    
    console.log('Setting test agent user:', testAgent)
    setUser(testAgent)
    if (typeof window !== 'undefined') {
      localStorage.setItem('selliko_user', JSON.stringify(testAgent))
      localStorage.setItem('selliko_access_token', 'test-agent-token')
      console.log('localStorage set for agent')
    } else {
      console.log('window is undefined - SSR environment')
    }
  }

  const loginAsTestAdmin = async () => {
    console.log('loginAsTestAdmin called')
    const testAdmin: User = {
      id: 'admin-test-001',
      phone: '+919876543213',
      name: 'Admin User',
      role: 'ADMIN',
      isActive: true,
      createdAt: new Date('2024-01-01'),
      lastLogin: new Date(),
      metadata: {
        location: 'Kochi, Kerala',
        verified: true,
        permissions: ['all']
      }
    }
    
    console.log('Setting test admin user:', testAdmin)
    setUser(testAdmin)
    if (typeof window !== 'undefined') {
      localStorage.setItem('selliko_user', JSON.stringify(testAdmin))
      localStorage.setItem('selliko_access_token', 'test-admin-token')
      console.log('localStorage set for admin')
    } else {
      console.log('window is undefined - SSR environment')
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    sendOTP,
    refreshToken,
    loginAsTestVendor,
    loginAsTestClient,
    loginAsTestAgent,
    loginAsTestAdmin
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 