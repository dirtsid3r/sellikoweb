import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generate a UUID v4 string
 * @returns {string} UUID v4 string
 */
export function generateUUID(): string {
  // Check if we're in a browser environment with crypto support
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID()
  }
  
  // Fallback UUID v4 generation for older browsers or server-side
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

/**
 * Get or create instance ID from localStorage
 * @returns {string} Instance ID
 */
export function getOrCreateInstanceId(): string {
  // Return empty string on server-side
  if (typeof window === 'undefined') {
    return ''
  }
  
  try {
    const existingId = localStorage.getItem('selliko_instance_id')
    if (existingId) {
      return existingId
    }
    
    // Generate new instance ID
    const newInstanceId = generateUUID()
    localStorage.setItem('selliko_instance_id', newInstanceId)
    return newInstanceId
  } catch (error) {
    console.warn('Failed to access localStorage for instance-id:', error)
    // Return a temporary UUID if localStorage fails
    return generateUUID()
  }
}
