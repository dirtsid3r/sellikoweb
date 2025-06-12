'use client'

import { useInstanceId, useInstanceIdValue } from '@/contexts/instance-context'

/**
 * Demo component showing how to use the Instance ID in any component
 * This can be used in any page or component to access the global instance ID
 */
export function InstanceIdDisplay() {
  const { instanceId, isLoaded } = useInstanceId()
  
  if (!isLoaded) {
    return (
      <div className="text-sm text-muted-foreground">
        Loading instance ID...
      </div>
    )
  }

  return (
    <div className="rounded-md bg-muted/50 p-3 text-sm">
      <div className="font-medium">Instance ID:</div>
      <div className="font-mono text-xs break-all text-muted-foreground">
        {instanceId}
      </div>
    </div>
  )
}

/**
 * Simple hook usage example - just get the ID value
 */
export function useInstanceIdExample() {
  const instanceId = useInstanceIdValue()
  
  // Use instanceId in your component logic
  // For example: analytics tracking, session management, etc.
  
  return instanceId
} 