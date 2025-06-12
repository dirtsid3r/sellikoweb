'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { getOrCreateInstanceId } from '@/lib/utils'

interface InstanceContextType {
  instanceId: string
  isLoaded: boolean
}

const InstanceContext = createContext<InstanceContextType | undefined>(undefined)

const InstanceIdContext = createContext<string>('')

export function InstanceProvider({ children }: { children: ReactNode }) {
  const [instanceId, setInstanceId] = useState<string>('')
  const [isLoaded, setIsLoaded] = useState<boolean>(false)

  useEffect(() => {
    // Only run on client-side after component mounts
    const id = getOrCreateInstanceId()
    setInstanceId(id)
    setIsLoaded(true)
    
    // Optional: Log instance ID for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('🔑 Instance ID initialized:', id)
    }
  }, [])

  return (
    <InstanceContext.Provider value={{ instanceId, isLoaded }}>
      <InstanceIdContext.Provider value={instanceId}>
        {children}
      </InstanceIdContext.Provider>
    </InstanceContext.Provider>
  )
}

/**
 * Hook to access the instance ID from any component
 * @returns {InstanceContextType} Instance ID and loading state
 */
export function useInstanceId(): InstanceContextType {
  const context = useContext(InstanceContext)
  if (context === undefined) {
    throw new Error('useInstanceId must be used within an InstanceProvider')
  }
  return context
}

/**
 * Hook to get just the instance ID string (convenience hook)
 * @returns {string} Instance ID string
 */
export function useInstanceIdValue(): string {
  const { instanceId } = useInstanceId()
  return instanceId
}

export function useInstanceIdFromContext() {
  return useContext(InstanceIdContext)
} 